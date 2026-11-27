/**
 * Stock ledger: keeps product stock in step with orders.
 *
 * Every order records the exact stock it took (`stockLines`, one line per product variant) and
 * whether it is currently holding that stock (`stockState: 'deducted' | 'restored'`).
 *
 * An order should hold stock while it is live. It gives the stock back when it is cancelled
 * (by the shop or by the courier), returned, moved to the recycle bin, or deleted for good.
 * Restoring it from the bin, or editing its items, takes stock again.
 *
 * Customers are not allowed to write product documents, so the admin panel does the work:
 * `reconcileOrderStock` runs in a Firestore transaction that re-reads the order first, which
 * means two admin devices can never take or return the same stock twice.
 *
 * Orders created before the ledger was switched on (`admin_config/stockLedger.startedAtMs`)
 * are left alone, because there is no record of what they took.
 */
import { doc, runTransaction, increment, type Firestore } from 'firebase/firestore';

export const STOCK_LEDGER_CONFIG = { collection: 'admin_config', id: 'stockLedger' } as const;

const RELEASE_STATUSES = new Set(['cancelled', 'canceled', 'returned', 'return']);

export interface StockRequest {
  productId: string;
  color: string;
  size: string;
  qty: number;
}

export interface StockLine extends StockRequest {
  variantId: string | null;
  variantIndex: number | null;
  /** Units actually removed (stock never goes below zero), returned in full on release. */
  applied: number;
}

const norm = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s === 'N/A' ? '' : s.toLowerCase();
};

const raw = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : String(v).trim();
  return s === 'N/A' ? '' : s;
};

export function toMillis(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** What the order is asking for, one entry per product + colour + size. */
export function requestedStock(order: any): StockRequest[] {
  const items = Array.isArray(order?.items) ? order.items : [];
  const merged = new Map<string, StockRequest>();
  const add = (productId: string, color: string, size: string, qty: number) => {
    if (!productId || !(qty > 0)) return;
    const key = `${productId}|${norm(color)}|${norm(size)}`;
    const prev = merged.get(key);
    if (prev) prev.qty += qty;
    else merged.set(key, { productId, color, size, qty });
  };

  for (const item of items) {
    if (!item) continue;
    const productId = String(item.productId || item.product?.id || item.id || '').trim();
    const color = raw(item.color ?? item.selectedColor);
    const sizeQty = item.wholesaleSizeQty && typeof item.wholesaleSizeQty === 'object' ? item.wholesaleSizeQty : null;
    const perSize = sizeQty ? Object.entries(sizeQty).filter(([, q]) => Number(q) > 0) : [];
    if (perSize.length > 0) {
      // Wholesale order: a separate quantity for each size.
      for (const [size, q] of perSize) add(productId, color, raw(size), Math.floor(Number(q)));
    } else {
      add(productId, color, raw(item.size ?? item.selectedSize), Math.max(1, Math.floor(Number(item.quantity) || 1)));
    }
  }
  return Array.from(merged.values());
}

/** Short fingerprint of the requested stock, so edits to an order's items are noticed. */
export function stockSignature(order: any): string {
  return requestedStock(order)
    .map((r) => `${r.productId}|${norm(r.color)}|${norm(r.size)}|${r.qty}`)
    .sort()
    .join(';');
}

export function orderShouldHoldStock(order: any, ledgerStartedAtMs: number | null | undefined): boolean {
  if (!order || order.deleted === true) return false;
  if (RELEASE_STATUSES.has(norm(order.status))) return false;
  if (!ledgerStartedAtMs) return false;
  const created = toMillis(order.createdAt);
  if (created === null || created < ledgerStartedAtMs) return false;
  return requestedStock(order).length > 0;
}

/** Cheap check (no reads) used to decide whether an order needs a ledger transaction. */
export function orderNeedsStockSync(order: any, ledgerStartedAtMs: number | null | undefined): boolean {
  if (orderShouldHoldStock(order, ledgerStartedAtMs)) {
    return !(order.stockState === 'deducted' && order.stockSig === stockSignature(order));
  }
  return order?.stockState === 'deducted';
}

/**
 * Picks the one variant an order line refers to. Only ever one: an order for size XL must never
 * touch S, M or L. If the order is missing a colour or size and several variants fit, the first
 * one that still has stock is used.
 */
export function pickVariantIndex(variants: any[], color: string, size: string): number | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const c = norm(color);
  const s = norm(size);
  const candidates = variants
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v && (!c || norm(v.name) === c) && (!s || norm(v.size) === s));
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0].i;
  const withStock = candidates.find(({ v }) => (Number(v.stock) || 0) > 0);
  return (withStock || candidates[0]).i;
}

function findHeldVariant(variants: any[], line: StockLine): number | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  if (line.variantId) {
    const byId = variants.findIndex((v) => v && String(v.id) === String(line.variantId));
    if (byId >= 0) return byId;
  }
  const exact = variants.findIndex((v) => v && norm(v.name) === norm(line.color) && norm(v.size) === norm(line.size));
  if (exact >= 0) return exact;
  if (line.variantIndex !== null && line.variantIndex >= 0 && line.variantIndex < variants.length) return line.variantIndex;
  return pickVariantIndex(variants, line.color, line.size);
}

export interface ProductStockState {
  hasVariants: boolean;
  variants: any[];
  stock: number;
  salesDelta: number;
  changed: boolean;
}

export function makeProductState(data: any): ProductStockState {
  const variants = Array.isArray(data?.variants) ? data.variants.map((v: any) => (v ? { ...v } : v)) : [];
  return {
    hasVariants: variants.length > 0,
    variants,
    stock: Math.max(0, Number(data?.stock) || 0),
    salesDelta: 0,
    changed: false,
  };
}

/** Puts back the stock a line took. Mutates `state`. */
export function returnLine(state: ProductStockState, line: StockLine): void {
  const units = Math.max(0, Number(line.applied) || 0);
  state.salesDelta -= Math.max(0, Number(line.qty) || 0);
  state.changed = true;
  if (units === 0) return;
  if (state.hasVariants) {
    const idx = findHeldVariant(state.variants, line);
    if (idx === null) return; // the variant was removed from the product; nothing to give back to
    state.variants[idx].stock = (Number(state.variants[idx].stock) || 0) + units;
  } else {
    state.stock += units;
  }
}

/** Takes stock for a request and returns the line to remember. Mutates `state`. */
export function takeLine(state: ProductStockState, req: StockRequest): StockLine {
  state.salesDelta += req.qty;
  state.changed = true;
  if (state.hasVariants) {
    const idx = pickVariantIndex(state.variants, req.color, req.size);
    if (idx === null) {
      return { ...req, variantId: null, variantIndex: null, applied: 0 };
    }
    const v = state.variants[idx];
    const have = Math.max(0, Number(v.stock) || 0);
    const applied = Math.min(have, req.qty);
    v.stock = have - applied;
    return { ...req, variantId: v.id ? String(v.id) : null, variantIndex: idx, applied };
  }
  const applied = Math.min(state.stock, req.qty);
  state.stock -= applied;
  return { ...req, variantId: null, variantIndex: null, applied };
}

export function productUpdateFromState(state: ProductStockState): Record<string, any> {
  const update: Record<string, any> = {};
  if (state.hasVariants) {
    update.variants = state.variants;
    update.stock = Math.max(0, state.variants.reduce((sum, v) => sum + (Number(v?.stock) || 0), 0));
  } else {
    update.stock = Math.max(0, state.stock);
  }
  if (state.salesDelta !== 0) update.salesCount = increment(state.salesDelta);
  return update;
}

export type StockSyncResult = 'missing' | 'noop' | 'deducted' | 'restored' | 'deleted';

/**
 * Brings one order's stock in line with its current state, in a single transaction.
 * `release: true` gives back everything the order holds (used before deleting it for good);
 * `deleteOrder: true` also deletes the order document in the same transaction.
 */
export async function reconcileOrderStock(
  db: Firestore,
  orderId: string,
  opts: { ledgerStartedAtMs: number | null; release?: boolean; deleteOrder?: boolean },
): Promise<StockSyncResult> {
  // Without the start date every order would look "not holding" and give its stock back.
  if (!opts.release && !opts.ledgerStartedAtMs) return 'noop';
  const orderRef = doc(db, 'orders', String(orderId));
  return runTransaction(db, async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) return 'missing';
    const order: any = orderSnap.data();

    const held: StockLine[] = order.stockState === 'deducted' && Array.isArray(order.stockLines) ? order.stockLines : [];
    const hold = !opts.release && orderShouldHoldStock(order, opts.ledgerStartedAtMs);
    const sig = stockSignature(order);
    const alreadyRight = hold
      ? order.stockState === 'deducted' && order.stockSig === sig
      : order.stockState !== 'deducted';
    if (alreadyRight && !opts.deleteOrder) return 'noop';

    const wanted = hold ? requestedStock(order) : [];
    const productIds = Array.from(new Set([...held.map((l) => l.productId), ...wanted.map((r) => r.productId)].filter(Boolean)));

    // All reads first (Firestore transactions require reads before writes).
    const states = new Map<string, ProductStockState>();
    for (const pid of productIds) {
      const snap = await tx.get(doc(db, 'products', pid));
      if (snap.exists()) states.set(pid, makeProductState(snap.data()));
    }

    for (const line of held) {
      const state = states.get(line.productId);
      if (state) returnLine(state, line);
    }
    const newLines: StockLine[] = [];
    for (const req of wanted) {
      const state = states.get(req.productId);
      if (state) newLines.push(takeLine(state, req));
    }

    for (const [pid, state] of states) {
      if (state.changed) tx.update(doc(db, 'products', pid), productUpdateFromState(state));
    }

    if (opts.deleteOrder) {
      tx.delete(orderRef);
      return 'deleted';
    }
    tx.update(orderRef, {
      stockState: hold ? 'deducted' : 'restored',
      stockLines: hold ? newLines : [],
      stockSig: hold ? sig : null,
      stockUpdatedAt: Date.now(),
    });
    return hold ? 'deducted' : 'restored';
  });
}
