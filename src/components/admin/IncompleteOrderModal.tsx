import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  CourierFraudReport,
  getCourierReportForPhone,
  getOrderCourierRateDisplay,
  isPhoneLoadingInRecord,
  normalizeBdPhone,
} from '../../utils/courierDisplay';
import { cleanLegacyDistrict } from '../../utils/orderDistrict';

export interface EditableIncompleteItem {
  productId: string;
  product?: any;
  name: string;
  smsName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  buyingPrice: number;
  color: string;
  size: string;
  isFreeDelivery?: boolean;
  isComingSoon?: boolean;
  weight?: number;
  availableColors: string[];
  availableSizes: string[];
}

export interface CompleteIncompleteOrderPayload {
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  deliveryArea: 'inside' | 'outside';
  deliveryCharge: number;
  discount: number;
  subtotal: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  transId: string;
  status: 'pending' | 'confirmed';
  note: string;
  sendSms: boolean;
  items: EditableIncompleteItem[];
}

export interface IncompleteOrderModalProps {
  order: any | null;
  onClose: () => void;
  products?: any[];
  getProductPrice?: (product: any, qty: number) => number;
  getCustomerStats: (phone: string) => { total: number; delivered: number };
  courierReports?: Record<string, CourierFraudReport | any>;
  loadingCourierReports?: Record<string, boolean>;
  checkCourierReport?: (phone: string, forceRefresh?: boolean) => void;
  siteConfig?: any;
  /** 'create' = a new order taken by phone; 'verify' (default) = finishing an incomplete order. */
  mode?: 'verify' | 'create';
  onCompleteOrder: (
    incompleteOrder: any,
    payload: CompleteIncompleteOrderPayload,
  ) => Promise<void>;
}

const PLACEHOLDER_NAMES = new Set([
  'অজ্ঞাত কাস্টমার',
  'অজ্ঞাত ক্রেতা',
  'guest shopper',
  'customer',
  'customer (unnamed)',
]);

export function sanitizeIncompleteCustomerName(rawName?: unknown): string {
  const str = String(rawName || '').trim();
  if (!str) return '';
  if (PLACEHOLDER_NAMES.has(str.toLowerCase())) return '';
  return str;
}

export function sanitizeIncompletePhone(rawPhone?: unknown): string {
  const str = String(rawPhone || '').trim();
  if (!str || str.includes('কার্টে') || str.includes('Cart')) return '';
  return str;
}

export function inferDeliveryArea(order: any, addressText: string): 'inside' | 'outside' {
  if (order?.deliveryArea === 'inside' || order?.deliveryArea === 'outside') {
    return order.deliveryArea;
  }
  const district = String(order?.district || '').trim();
  const combined = `${district} ${addressText}`.toLowerCase();
  if (combined.includes('ঢাকা জেলা (বাইরে)') || combined.includes('outside dhaka')) return 'outside';
  if (district.includes('ঢাকা') || combined.includes('dhaka')) return 'inside';
  return 'outside';
}

/**
 * Same rules as the website checkout (CartContext.getDeliveryCharge): free-delivery products make it
 * free; a product's own delivery fee replaces the area rate; 70 inside Dhaka, 130 outside; +20 per kg
 * after the first kg (weights above 50 are grams).
 */
export function computeSuggestedDeliveryCharge(
  items: (Pick<EditableIncompleteItem, 'quantity' | 'weight' | 'isFreeDelivery'> & { product?: any })[],
  area: 'inside' | 'outside',
): number {
  if (items.some((it) => it.isFreeDelivery || it.product?.isFreeDelivery)) return 0;
  const customFees = items
    .map((it) => it.product?.deliveryCharge)
    .filter((v) => v !== undefined && v !== null && v !== '' && !isNaN(Number(v)) && Number(v) > 0)
    .map(Number);
  const base = customFees.length > 0 ? Math.max(...customFees) : area === 'inside' ? 70 : 130;
  const totalWeight = items.reduce((sum, it) => {
    let w = Number(it.weight ?? it.product?.weight ?? 0) || 0;
    if (w > 50) w = w / 1000;
    return sum + w * Math.max(1, Number(it.quantity) || 1);
  }, 0);
  return base + (totalWeight > 1 ? Math.ceil(totalWeight - 1) * 20 : 0);
}

export function extractProductOptions(matchedProduct: any, rawItem: any) {
  const colors = new Set<string>();
  const sizes = new Set<string>();

  const pushColor = (val?: unknown) => {
    const s = String(val || '').trim();
    if (s && s !== 'N/A') colors.add(s);
  };
  const pushSize = (val?: unknown) => {
    const s = String(val || '').trim();
    if (s && s !== 'N/A') sizes.add(s);
  };

  if (Array.isArray(matchedProduct?.colors)) {
    matchedProduct.colors.forEach(pushColor);
  }
  if (Array.isArray(matchedProduct?.sizes)) {
    matchedProduct.sizes.forEach(pushSize);
  }
  if (Array.isArray(matchedProduct?.variants)) {
    matchedProduct.variants.forEach((v: any) => {
      pushColor(v?.name);
      pushSize(v?.size);
    });
  }
  if (Array.isArray(rawItem?.product?.colors)) {
    rawItem.product.colors.forEach(pushColor);
  }
  if (Array.isArray(rawItem?.product?.sizes)) {
    rawItem.product.sizes.forEach(pushSize);
  }

  return {
    availableColors: Array.from(colors),
    availableSizes: Array.from(sizes),
  };
}

function buildCombinedAddress(order: any): string {
  const parts = [order?.address, order?.thana, cleanLegacyDistrict(order?.district)]
    .map((p) => String(p || '').trim())
    .filter(Boolean);
  const uniqueParts: string[] = [];
  for (const part of parts) {
    const alreadyPresent = uniqueParts.some((u) =>
      u.toLowerCase().includes(part.toLowerCase()),
    );
    if (!alreadyPresent) uniqueParts.push(part);
  }
  return uniqueParts.join(', ');
}

export default function IncompleteOrderModal({
  order,
  onClose,
  products = [],
  getProductPrice,
  getCustomerStats,
  courierReports,
  loadingCourierReports,
  checkCourierReport,
  siteConfig,
  mode = 'verify',
  onCompleteOrder,
}: IncompleteOrderModalProps) {
  const isCreate = mode === 'create';
  const [productQuery, setProductQuery] = useState('');
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  // Until the delivery charge is typed by hand, it follows the products and the area.
  const [deliveryTouched, setDeliveryTouched] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('outside');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transId, setTransId] = useState('');
  const [status, setStatus] = useState<'pending' | 'confirmed'>('pending');
  const [note, setNote] = useState('');
  const [sendSms, setSendSms] = useState(true);
  const [items, setItems] = useState<EditableIncompleteItem[]>([]);
  const [customColorMode, setCustomColorMode] = useState<Record<number, boolean>>({});
  const [customSizeMode, setCustomSizeMode] = useState<Record<number, boolean>>({});
  const [selectedAddProductId, setSelectedAddProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildEditableItem = (rawItem: any): EditableIncompleteItem => {
    const prodId = String(rawItem?.id || rawItem?.product?.id || '').trim();
    const matched =
      products.find((p) => p?.id === prodId) || rawItem?.product || null;
    const qty = Math.max(1, Number(rawItem?.quantity) || 1);
    const fallbackUnitPrice = Number(
      rawItem?.price ??
        rawItem?.product?.price ??
        (matched && getProductPrice ? getProductPrice(matched, qty) : matched?.price) ??
        0,
    );
    const { availableColors, availableSizes } = extractProductOptions(matched, rawItem);

    return {
      productId: prodId,
      product: matched || {
        id: prodId || `item_${Date.now()}`,
        name: rawItem?.name || 'Product',
        price: fallbackUnitPrice,
        image: rawItem?.image || '',
      },
      name: String(rawItem?.name || matched?.name || 'Product'),
      smsName: String(rawItem?.smsName || matched?.smsName || ''),
      image: String(
        rawItem?.image || matched?.image || matched?.images?.[0] || '/logo.png',
      ),
      quantity: qty,
      unitPrice: Number.isFinite(fallbackUnitPrice) ? fallbackUnitPrice : 0,
      buyingPrice: Number(rawItem?.buyingPrice ?? matched?.buyingPrice ?? 0),
      color:
        rawItem?.color && rawItem.color !== 'N/A' ? String(rawItem.color) : '',
      size: rawItem?.size && rawItem.size !== 'N/A' ? String(rawItem.size) : '',
      isFreeDelivery: Boolean(matched?.isFreeDelivery ?? rawItem?.isFreeDelivery),
      isComingSoon: Boolean(matched?.isComingSoon ?? rawItem?.isComingSoon),
      weight: Number(matched?.weight ?? rawItem?.weight ?? 0),
      availableColors,
      availableSizes,
    };
  };

  useEffect(() => {
    if (!order) return;
    const initialAddress = buildCombinedAddress(order);
    const inferredArea = inferDeliveryArea(order, initialAddress);
    const initialItems = Array.isArray(order.items)
      ? order.items.map(buildEditableItem)
      : [];
    const initialDelivery =
      order.deliveryCharge !== undefined && order.deliveryCharge !== null
        ? Math.max(0, Number(order.deliveryCharge) || 0)
        : computeSuggestedDeliveryCharge(initialItems, inferredArea);

    setCustomerName(sanitizeIncompleteCustomerName(order.name || order.customerName));
    setCustomerPhone(sanitizeIncompletePhone(order.phone || order.customerPhone));
    setAddress(initialAddress);
    setDistrict(cleanLegacyDistrict(order.district));
    setDeliveryArea(inferredArea);
    setDeliveryCharge(initialDelivery);
    setDiscount(Math.max(0, Number(order.discount) || 0));
    setCustomTotal(null);
    setPaymentMethod('cod');
    setTransId('');
    setStatus(isCreate ? 'confirmed' : 'pending');
    setNote(String(order.note || ''));
    setProductQuery('');
    setIsProductListOpen(false);
    setDeliveryTouched(order.deliveryCharge !== undefined && order.deliveryCharge !== null);
    setSendSms(siteConfig?.isSmsConfirmEnabled !== false);
    setItems(initialItems);
    setCustomColorMode({});
    setCustomSizeMode({});
    setSelectedAddProductId('');
    setIsSubmitting(false);
  }, [order?.id]);

  const normalizedPhone = normalizeBdPhone(customerPhone);
  const hasValidCourierPhone = normalizedPhone.length >= 11;
  const customerStats = customerPhone.trim()
    ? getCustomerStats(customerPhone.trim())
    : { total: 0, delivered: 0 };
  const courierReport = hasValidCourierPhone
    ? getCourierReportForPhone(courierReports, customerPhone)
    : undefined;
  const isLoadingCourier = hasValidCourierPhone
    ? isPhoneLoadingInRecord(loadingCourierReports, customerPhone)
    : false;
  const courierDisplay = getOrderCourierRateDisplay(
    courierReport,
    { total: customerStats.total, delivered: customerStats.delivered, cancelled: 0 },
    isLoadingCourier,
  );

  // Auto-checking courier report disabled to avoid exhausting daily API quota (10/day).
  // Checks are performed only when clicking the 'Steadfast চেক' button.

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Math.max(0, Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1),
        0,
      ),
    [items],
  );

  const computedTotal = useMemo(
    () =>
      Math.max(
        0,
        subtotal + Math.max(0, Number(deliveryCharge) || 0) - Math.max(0, Number(discount) || 0),
      ),
    [subtotal, deliveryCharge, discount],
  );

  const finalTotal = customTotal !== null ? Math.max(0, customTotal) : computedTotal;

  if (!order) return null;

  const updateItem = (idx: number, patch: Partial<EditableIncompleteItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    setCustomTotal(null);
  };

  const handleQuantityChange = (idx: number, nextQtyRaw: number) => {
    const nextQty = Math.max(1, Math.floor(Number(nextQtyRaw) || 1));
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const tieredPrice =
          it.product && getProductPrice
            ? Number(getProductPrice(it.product, nextQty))
            : it.unitPrice;
        const shouldAutoUpdatePrice =
          it.product &&
          Array.isArray(it.product.wholesaleTiers) &&
          it.product.wholesaleTiers.length > 0 &&
          Number.isFinite(tieredPrice);
        return {
          ...it,
          quantity: nextQty,
          unitPrice: shouldAutoUpdatePrice ? tieredPrice : it.unitPrice,
        };
      }),
    );
    if (!deliveryTouched) {
      setDeliveryCharge(
        computeSuggestedDeliveryCharge(
          items.map((it, i) => (i === idx ? { ...it, quantity: nextQty } : it)),
          deliveryArea,
        ),
      );
    }
    setCustomTotal(null);
  };

  const handleAreaSwitch = (nextArea: 'inside' | 'outside') => {
    setDeliveryArea(nextArea);
    setDeliveryCharge(computeSuggestedDeliveryCharge(items, nextArea));
    setCustomTotal(null);
  };

  const handleAddProduct = (productId?: string) => {
    const pickId = productId || selectedAddProductId;
    if (!pickId) return;
    const prod = products.find((p) => p?.id === pickId);
    if (!prod) return;
    const unitPrice = getProductPrice ? Number(getProductPrice(prod, 1)) : Number(prod.price || 0);
    const newItem = buildEditableItem({
      id: prod.id,
      product: prod,
      name: prod.name,
      price: unitPrice,
      quantity: 1,
      image: prod.image || prod.images?.[0] || '',
    });
    // Pre-select the colour / size when the product has only one.
    if (newItem.availableColors.length === 1) newItem.color = newItem.availableColors[0];
    if (newItem.availableSizes.length === 1) newItem.size = newItem.availableSizes[0];
    const nextItems = [...items, newItem];
    setItems(nextItems);
    if (!deliveryTouched) setDeliveryCharge(computeSuggestedDeliveryCharge(nextItems, deliveryArea));
    setCustomTotal(null);
    setSelectedAddProductId('');
    setProductQuery('');
    setIsProductListOpen(false);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1 && !isCreate) {
      toast.error('অর্ডারে কমপক্ষে একটি পণ্য থাকতে হবে।');
      return;
    }
    const nextItems = items.filter((_, i) => i !== idx);
    setItems(nextItems);
    if (!deliveryTouched) setDeliveryCharge(computeSuggestedDeliveryCharge(nextItems, deliveryArea));
    setCustomTotal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customerName.trim();
    const cleanPhoneInput = customerPhone.trim();
    const digitsCount = normalizeBdPhone(cleanPhoneInput).length;
    const cleanAddress = address.trim();

    if (!cleanName) {
      toast.error('কাস্টমারের নাম লিখুন।');
      return;
    }
    if (!cleanPhoneInput || digitsCount < 11) {
      toast.error('সঠিক ফোন নাম্বার দিন (কমপক্ষে ১১ ডিজিট)!');
      return;
    }
    if (!cleanAddress) {
      toast.error('ডেলিভারি ঠিকানা লিখুন।');
      return;
    }
    if (items.length === 0) {
      toast.error('অর্ডারে কমপক্ষে একটি পণ্য যোগ করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCompleteOrder(order, {
        customerName: cleanName,
        customerPhone: normalizeBdPhone(cleanPhoneInput) || cleanPhoneInput,
        address: cleanAddress,
        district: district.trim(),
        deliveryArea,
        deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
        discount: Math.max(0, Number(discount) || 0),
        subtotal,
        total: finalTotal,
        paymentMethod,
        transId: transId.trim() || 'N/A',
        status,
        note: note.trim(),
        sendSms,
        items,
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'অর্ডার প্লেস করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeProducts = products.filter((p) => p && !p.deleted);
  const productMatches = (() => {
    const q = productQuery.trim().toLowerCase();
    const list = q
      ? activeProducts.filter((p) =>
          [p.name, p.code, p.smsName, p.brand, p.category]
            .filter(Boolean)
            .some((v: any) => String(v).toLowerCase().includes(q)),
        )
      : activeProducts;
    return list.slice(0, 8);
  })();
  const stockOf = (p: any) =>
    Array.isArray(p?.variants) && p.variants.length > 0
      ? p.variants.reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0)
      : Number(p?.stock) || 0;

  return (
    <div
      className="fixed inset-0 z-[260] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={isCreate ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isCreate ? 'Create Order' : 'Verify and Complete Incomplete Order'}
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              {isCreate ? <Plus size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">
                {isCreate ? 'Create Order' : 'অসম্পূর্ণ অর্ডার যাচাই ও সম্পন্ন করুন'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {isCreate
                  ? 'ফোনে আসা অর্ডার: পণ্য খুঁজে যোগ করুন, কাস্টমারের তথ্য দিন, তারপর অর্ডার করুন'
                  : 'কাস্টমার তথ্য, সাইজ, কালার, পরিমাণ, ডেলিভারি চার্জ ও মূল্য পরিবর্তন করে অর্ডার প্লেস করুন'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Customer & Steadfast Verification Card */}
          <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-emerald-600" />
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                  কাস্টমার ভেরিফিকেশন ও কুরিয়ার রেশিও
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-white border border-gray-200 px-2.5 py-0.5 rounded-full text-gray-700">
                  আমাদের সাইটে মোট অর্ডার: <strong>{customerStats.total}</strong> | ডেলিভার্ড:{' '}
                  <strong className="text-emerald-700">{customerStats.delivered}</strong>
                </span>
                {checkCourierReport && hasValidCourierPhone && (
                  <button
                    type="button"
                    onClick={() => checkCourierReport(customerPhone.trim(), true)}
                    disabled={isLoadingCourier}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isLoadingCourier ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <RefreshCcw size={11} />
                    )}
                    {isLoadingCourier ? 'যাচাই হচ্ছে...' : 'Steadfast চেক'}
                  </button>
                )}
              </div>
            </div>

            {hasValidCourierPhone ? (
              courierReport && (courierReport.total_parcel > 0 || courierReport.delivery_rate != null) ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  <div className="bg-white rounded-xl p-2 text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">মোট পার্সেল</span>
                    <span className="text-sm font-black text-slate-800">
                      {courierDisplay.mobileTotalText}
                    </span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2 text-center border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 block">সফল</span>
                    <span className="text-sm font-black text-emerald-700">
                      {courierDisplay.successText}
                    </span>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-2 text-center border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-500 block">বাতিল</span>
                    <span className="text-sm font-black text-rose-700">
                      {courierDisplay.cancelText}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2 text-center border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-400 block">ফ্রড রিপোর্ট</span>
                    <span
                      className={`text-sm font-black flex items-center gap-1 ${
                        courierDisplay.fraudCount > 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {courierDisplay.fraudCount > 0 && <AlertTriangle size={12} />}
                      {courierDisplay.fraudCount}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500">
                  {isLoadingCourier
                    ? 'Steadfast থেকে কাস্টমারের পূর্ববর্তী ডেলিভারি রেকর্ড লোড হচ্ছে...'
                    : 'কুরিয়ার রেকর্ড জানতে "Steadfast চেক" বাটনে ক্লিক করুন।'}
                </p>
              )
            ) : (
              <p className="text-xs font-medium text-amber-700">
                কুরিয়ার রেশিও যাচাই করতে সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন।
              </p>
            )}
          </div>

          {/* Customer Information Inputs */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-primary" /> কাস্টমার ও ডেলিভারি তথ্য
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  কাস্টমারের নাম *
                </label>
                <input
                  type="text"
                  aria-label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="কাস্টমারের নাম লিখুন"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  মোবাইল নাম্বার *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="tel"
                    aria-label="Customer Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 text-xs font-bold font-mono bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    required
                  />
                  {customerPhone.trim().length >= 6 && (
                    <a
                      href={`tel:${customerPhone.replace(/\D/g, '')}`}
                      className="px-2.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center shrink-0"
                      title="Call Customer"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  <MapPin size={11} className="inline mr-1" />
                  সম্পূর্ণ ডেলিভারি ঠিকানা *
                </label>
                <input
                  type="text"
                  aria-label="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="বাসা/রোড, এলাকা, থানা, জেলা লিখুন"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  জেলা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  aria-label="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="জেলার নাম লিখুন"
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Order Items Editor */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag size={14} className="text-primary" /> পণ্যের বিবরণ (সাইজ, কালার, পরিমাণ ও দাম)
              </h4>
              <span className="text-[11px] font-bold text-gray-500">
                আইটেম: {items.length}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const usingCustomColor =
                  Boolean(customColorMode[idx]) ||
                  item.availableColors.length === 0 ||
                  (Boolean(item.color) && !item.availableColors.includes(item.color));
                const usingCustomSize =
                  Boolean(customSizeMode[idx]) ||
                  item.availableSizes.length === 0 ||
                  (Boolean(item.size) && !item.availableSizes.includes(item.size));

                return (
                  <div
                    key={`${item.productId || 'item'}_${idx}`}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          aria-label={`Product Name ${idx + 1}`}
                          value={item.name}
                          onChange={(e) => updateItem(idx, { name: e.target.value })}
                          className="w-full text-xs font-black text-gray-900 bg-transparent border-b border-transparent focus:border-primary outline-none py-0.5"
                        />
                        <p className="text-[11px] text-gray-500 font-bold">
                          লাইন মোট: ৳
                          {(
                            Math.max(0, Number(item.unitPrice) || 0) *
                            Math.max(1, Number(item.quantity) || 1)
                          ).toLocaleString()}
                        </p>
                      </div>
                      {(items.length > 1 || isCreate) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          aria-label={`Remove item ${idx + 1}`}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Size Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">
                            সাইজ (Size)
                          </label>
                          {item.availableSizes.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setCustomSizeMode((prev) => ({ ...prev, [idx]: !usingCustomSize }))
                              }
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              {usingCustomSize ? 'লিস্ট' : 'কাস্টম'}
                            </button>
                          )}
                        </div>
                        {!usingCustomSize && item.availableSizes.length > 0 ? (
                          <select
                            aria-label={`Size ${idx + 1}`}
                            value={item.size}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setCustomSizeMode((prev) => ({ ...prev, [idx]: true }));
                              } else {
                                updateItem(idx, { size: e.target.value });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">নির্বাচন করুন</option>
                            {item.availableSizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                            <option value="__custom__">+ কাস্টম লিখুন</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            aria-label={`Size ${idx + 1}`}
                            value={item.size}
                            onChange={(e) => updateItem(idx, { size: e.target.value })}
                            placeholder="যেমন: L, XL, 42"
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        )}
                      </div>

                      {/* Color Control */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">
                            কালার (Color)
                          </label>
                          {item.availableColors.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setCustomColorMode((prev) => ({
                                  ...prev,
                                  [idx]: !usingCustomColor,
                                }))
                              }
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              {usingCustomColor ? 'লিস্ট' : 'কাস্টম'}
                            </button>
                          )}
                        </div>
                        {!usingCustomColor && item.availableColors.length > 0 ? (
                          <select
                            aria-label={`Color ${idx + 1}`}
                            value={item.color}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setCustomColorMode((prev) => ({ ...prev, [idx]: true }));
                              } else {
                                updateItem(idx, { color: e.target.value });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">নির্বাচন করুন</option>
                            {item.availableColors.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="__custom__">+ কাস্টম লিখুন</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            aria-label={`Color ${idx + 1}`}
                            value={item.color}
                            onChange={(e) => updateItem(idx, { color: e.target.value })}
                            placeholder="যেমন: Black"
                            className="w-full px-2.5 py-1.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        )}
                      </div>

                      {/* Quantity Control */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          পরিমাণ (Qty)
                        </label>
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                          <button
                            type="button"
                            aria-label={`Decrease quantity ${idx + 1}`}
                            onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                            className="px-2 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            aria-label={`Quantity ${idx + 1}`}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className="w-full text-center text-xs font-black bg-transparent outline-none py-1.5"
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity ${idx + 1}`}
                            onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                            className="px-2 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Unit Price Control */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          একক মূল্য (৳)
                        </label>
                        <input
                          type="number"
                          min={0}
                          aria-label={`Unit Price ${idx + 1}`}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, {
                              unitPrice: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-black text-purple-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add a product: search by name or code */}
            {activeProducts.length > 0 && (
              <div className="relative pt-1">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    aria-label="Search product to add"
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setIsProductListOpen(true);
                    }}
                    onFocus={() => setIsProductListOpen(true)}
                    onBlur={() => setIsProductListOpen(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (productMatches[0]) handleAddProduct(productMatches[0].id);
                      } else if (e.key === 'Escape') {
                        setIsProductListOpen(false);
                      }
                    }}
                    placeholder={items.length === 0 ? 'পণ্যের নাম বা কোড লিখে খুঁজুন...' : '+ আরেকটি পণ্য যোগ করুন (নাম বা কোড)...'}
                    className="w-full h-11 pl-9 pr-3 text-sm font-semibold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                {isProductListOpen && (
                  <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                    {productMatches.length === 0 ? (
                      <p className="px-3 py-4 text-xs text-gray-500 text-center">কোনো পণ্য পাওয়া যায়নি</p>
                    ) : (
                      productMatches.map((p) => {
                        const st = stockOf(p);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleAddProduct(p.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer"
                          >
                            <img
                              src={p.image || p.images?.[0] || '/logo.webp'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.webp';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{p.code || p.category}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-extrabold text-gray-900">৳{p.price}</p>
                              <p className={`text-[10px] font-bold ${st <= 0 ? 'tone-cancelled' : st <= 5 ? 'tone-returned' : 'tone-neutral'}`} style={{ color: 'var(--tone)' }}>
                                {st <= 0 ? 'স্টক নেই' : `স্টক ${st}`}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing, Delivery Charge & Payment Section */}
          <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">
              ডেলিভারি চার্জ, ডিসকাউন্ট ও টোটাল প্রাইসিং
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  ডেলিভারি এরিয়া
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAreaSwitch('inside')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      deliveryArea === 'inside'
                        ? 'bg-primary text-white border-transparent shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ঢাকার ভেতরে
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAreaSwitch('outside')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      deliveryArea === 'outside'
                        ? 'bg-primary text-white border-transparent shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    ঢাকার বাইরে
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  aria-label="Delivery Charge"
                  value={deliveryCharge}
                  onChange={(e) => {
                    setDeliveryCharge(Math.max(0, Number(e.target.value) || 0));
                    setDeliveryTouched(true);
                    setCustomTotal(null);
                  }}
                  className="w-full px-3 py-2 text-xs font-black bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  ডিসকাউন্ট (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  aria-label="Discount"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(Math.max(0, Number(e.target.value) || 0));
                    setCustomTotal(null);
                  }}
                  className="w-full px-3 py-2 text-xs font-black bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-emerald-700">
                    সর্বমোট বিল / COD (৳)
                  </label>
                  {customTotal !== null && (
                    <button
                      type="button"
                      onClick={() => setCustomTotal(null)}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Auto (৳{computedTotal})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min={0}
                  aria-label="Final Total"
                  value={finalTotal}
                  onChange={(e) =>
                    setCustomTotal(Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full px-3 py-2 text-sm font-black text-emerald-700 bg-emerald-50/70 border border-emerald-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  পেমেন্ট মেথড
                </label>
                <select
                  aria-label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'cod' | 'bkash' | 'nagad')
                  }
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="cod">Cash On Delivery (COD)</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  অর্ডার স্ট্যাটাস
                </label>
                <select
                  aria-label="Order Status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as 'pending' | 'confirmed')
                  }
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="pending">Pending (নতুন অর্ডার)</option>
                  <option value="confirmed">Confirmed (কনফার্মড)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {paymentMethod !== 'cod' ? 'ট্রানজেকশন আইডি' : 'নোট (ঐচ্ছিক)'}
                </label>
                {paymentMethod !== 'cod' ? (
                  <input
                    type="text"
                    aria-label="Transaction ID"
                    value={transId}
                    onChange={(e) => setTransId(e.target.value)}
                    placeholder="TrxID লিখুন"
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                  />
                ) : (
                  <input
                    type="text"
                    aria-label="Order Note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="কাস্টমার/কুরিয়ার নোট..."
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </div>
            </div>

            {paymentMethod !== 'cod' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  aria-label="Order Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="কাস্টমার/কুরিয়ার নোট..."
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200/70">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                অর্ডার কনফার্মেশন SMS পাঠান
              </label>

              <div className="text-xs font-bold text-gray-600">
                সাবটোটাল: <span className="text-gray-900">৳{subtotal.toLocaleString()}</span> + ডেলিভারি:{' '}
                <span className="text-gray-900">৳{Number(deliveryCharge || 0).toLocaleString()}</span>
                {discount > 0 && (
                  <>
                    {' '}
                    − ছাড়: <span className="text-rose-600">৳{discount.toLocaleString()}</span>
                  </>
                )}{' '}
                = <span className="text-base font-black text-emerald-700">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl text-sm font-black text-white bg-primary hover:opacity-90 shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> প্লেস হচ্ছে...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> {isCreate ? 'অর্ডার তৈরি করুন (Create Order)' : 'অর্ডার প্লেস করুন (Place Order)'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
