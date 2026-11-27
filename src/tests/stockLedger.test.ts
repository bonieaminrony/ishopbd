import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory Firestore: enough of doc / runTransaction / increment for the ledger.
const store = new Map<string, any>();
vi.mock('firebase/firestore', () => {
  const INC = Symbol('inc');
  const apply = (prev: any, patch: any) => {
    const next = { ...(prev || {}) };
    for (const [k, v] of Object.entries(patch)) {
      next[k] = v && (v as any)[INC] !== undefined ? (Number(next[k]) || 0) + (v as any)[INC] : v;
    }
    return next;
  };
  return {
    doc: (_db: any, col: string, id: string) => ({ path: `${col}/${id}` }),
    increment: (n: number) => ({ [INC]: n }),
    runTransaction: async (_db: any, fn: any) => {
      const writes: Array<() => void> = [];
      const tx = {
        get: async (ref: any) => {
          const data = store.get(ref.path);
          return { exists: () => data !== undefined, data: () => (data ? structuredClone(data) : undefined) };
        },
        update: (ref: any, patch: any) => { writes.push(() => store.set(ref.path, apply(store.get(ref.path), patch))); },
        delete: (ref: any) => { writes.push(() => store.delete(ref.path)); },
      };
      const result = await fn(tx);
      writes.forEach((w) => w());
      return result;
    },
  };
});

import {
  reconcileOrderStock,
  requestedStock,
  pickVariantIndex,
  orderNeedsStockSync,
  orderShouldHoldStock,
} from '../utils/stockLedger';

const db: any = {};
const START = 1_000_000;
const sizes = () => ({
  name: 'Koti',
  stock: 40,
  salesCount: 0,
  variants: [
    { id: 'v-s', name: 'Navy', size: 'S', stock: 10, image: 'data:image/png;base64,REAL' },
    { id: 'v-m', name: 'Navy', size: 'M', stock: 10, image: 'x' },
    { id: 'v-l', name: 'Navy', size: 'L', stock: 10, image: 'x' },
    { id: 'v-xl', name: 'Navy', size: 'XL', stock: 10, image: 'x' },
  ],
});
const stockOf = (pid: string) => store.get(`products/${pid}`).variants.map((v: any) => v.stock);
const order = (extra: any = {}) => ({
  status: 'pending',
  createdAt: { seconds: START / 1000 + 60 },
  items: [{ product: { id: 'koti' }, quantity: 1, color: 'Navy', size: 'XL' }],
  ...extra,
});
const sync = (id: string, o: any = {}) => reconcileOrderStock(db, id, { ledgerStartedAtMs: START, ...o });
const setOrder = (id: string, patch: any) => store.set(`orders/${id}`, { ...store.get(`orders/${id}`), ...patch });

beforeEach(() => {
  store.clear();
  store.set('products/koti', sizes());
  store.set('products/fan', { name: 'Fan', stock: 5, salesCount: 0 });
});

describe('stock ledger', () => {
  it('an XL order takes one XL only, not one of every size', async () => {
    store.set('orders/o1', order());
    expect(await sync('o1')).toBe('deducted');
    expect(stockOf('koti')).toEqual([10, 10, 10, 9]);
    expect(store.get('products/koti').stock).toBe(39);
    expect(store.get('products/koti').salesCount).toBe(1);
  });

  it('keeps the real variant photos (reads the product from Firestore, not the lean list)', async () => {
    store.set('orders/o1', order());
    await sync('o1');
    expect(store.get('products/koti').variants[0].image).toBe('data:image/png;base64,REAL');
  });

  it('running twice never takes stock twice', async () => {
    store.set('orders/o1', order({ items: [{ product: { id: 'koti' }, quantity: 2, color: 'Navy', size: 'M' }] }));
    await sync('o1');
    expect(await sync('o1')).toBe('noop');
    expect(stockOf('koti')).toEqual([10, 8, 10, 10]);
  });

  it.each([
    ['cancelled by the shop', { status: 'cancelled' }],
    ['cancelled by the courier', { status: 'cancelled', courierStatus: 'cancelled_by_customer' }],
    ['returned', { status: 'returned' }],
    ['moved to the recycle bin', { deleted: true }],
  ])('gives stock back when %s, exactly once', async (_label, patch) => {
    store.set('orders/o1', order());
    await sync('o1');
    setOrder('o1', patch);
    expect(await sync('o1')).toBe('restored');
    expect(await sync('o1')).toBe('noop');
    expect(stockOf('koti')).toEqual([10, 10, 10, 10]);
    expect(store.get('products/koti').salesCount).toBe(0);
  });

  it('takes stock again when an order is restored from the recycle bin', async () => {
    store.set('orders/o1', order());
    await sync('o1');
    setOrder('o1', { deleted: true });
    await sync('o1');
    setOrder('o1', { deleted: false });
    expect(await sync('o1')).toBe('deducted');
    expect(stockOf('koti')).toEqual([10, 10, 10, 9]);
  });

  it('gives stock back when an order is deleted for good, and deletes it', async () => {
    store.set('orders/o1', order());
    await sync('o1');
    expect(await sync('o1', { release: true, deleteOrder: true })).toBe('deleted');
    expect(store.has('orders/o1')).toBe(false);
    expect(stockOf('koti')).toEqual([10, 10, 10, 10]);
  });

  it('moves stock when an order is edited from XL to L', async () => {
    store.set('orders/o1', order());
    await sync('o1');
    setOrder('o1', { items: [{ product: { id: 'koti' }, quantity: 1, color: 'Navy', size: 'L' }] });
    expect(orderNeedsStockSync(store.get('orders/o1'), START)).toBe(true);
    await sync('o1');
    expect(stockOf('koti')).toEqual([10, 10, 9, 10]);
  });

  it('wholesale orders take each size separately', async () => {
    store.set('orders/o1', order({ items: [{ product: { id: 'koti' }, quantity: 5, color: 'Navy', wholesaleSizeQty: { S: 2, XL: 3 } }] }));
    await sync('o1');
    expect(stockOf('koti')).toEqual([8, 10, 10, 7]);
  });

  it('products without variants use the product stock, and never go below zero', async () => {
    store.set('orders/o1', order({ items: [{ productId: 'fan', quantity: 7 }] }));
    await sync('o1');
    expect(store.get('products/fan').stock).toBe(0);
    setOrder('o1', { status: 'cancelled' });
    await sync('o1');
    expect(store.get('products/fan').stock).toBe(5); // gives back the 5 it really took, not 7
  });

  it('leaves orders from before the ledger started alone', async () => {
    store.set('orders/old', order({ createdAt: { seconds: START / 1000 - 60 } }));
    expect(orderShouldHoldStock(store.get('orders/old'), START)).toBe(false);
    expect(await sync('old')).toBe('noop');
    expect(stockOf('koti')).toEqual([10, 10, 10, 10]);
  });

  it('does nothing if the ledger start date is unknown', async () => {
    store.set('orders/o1', order());
    await sync('o1');
    setOrder('o1', { status: 'cancelled' });
    expect(await reconcileOrderStock(db, 'o1', { ledgerStartedAtMs: null })).toBe('noop');
    expect(stockOf('koti')).toEqual([10, 10, 10, 9]);
  });
});

describe('variant picking', () => {
  const v = sizes().variants;
  it('matches one variant, ignoring case and spaces', () => {
    expect(pickVariantIndex(v, ' navy ', 'xl')).toBe(3);
  });
  it('picks one variant (never all) when the order has no size', () => {
    expect(pickVariantIndex(v, 'Navy', '')).toBe(0);
  });
  it('returns null for a size the product does not have', () => {
    expect(pickVariantIndex(v, 'Navy', 'XXL')).toBeNull();
  });
  it('reads POS-style items (selectedColor / selectedSize) and treats N/A as empty', () => {
    expect(requestedStock({ items: [{ product: { id: 'p' }, quantity: 2, selectedColor: 'Red', selectedSize: 'M' }] }))
      .toEqual([{ productId: 'p', color: 'Red', size: 'M', qty: 2 }]);
    expect(requestedStock({ items: [{ productId: 'p', quantity: 1, color: 'N/A', size: 'N/A' }] }))
      .toEqual([{ productId: 'p', color: '', size: '', qty: 1 }]);
  });
});
