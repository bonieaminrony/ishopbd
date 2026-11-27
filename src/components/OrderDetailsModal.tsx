import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { History, X, User, AlertCircle, ShoppingBag, Truck, CheckCircle, RefreshCcw, Copy, ExternalLink, MapPin, Loader2, Minus, Plus, Package, Trash2, Check, Search } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  CourierFraudReport,
  formatSafeDateTime,
  getCourierReportForPhone,
  getOrderCourierRateDisplay,
  getOrderItemsSafe,
  isPhoneLoadingInRecord,
  resolveCourierBadgeDisplay,
} from '../utils/courierDisplay';
import {
  computeSuggestedDeliveryCharge,
  extractProductOptions,
  inferDeliveryArea,
} from './admin/IncompleteOrderModal';
import { cleanLegacyDistrict } from '../utils/orderDistrict';

export interface OrderDetailsModalProps {
  selectedOrderForDetails: any;
  setSelectedOrderForDetails: (order: any) => void;
  isAdminVerified: boolean;
  isEditingOrder: boolean;
  setIsEditingOrder: (editing: boolean) => void;
  editingOrderData: any;
  setEditingOrderData: (data: any) => void;
  handleUpdateOrderDetails: () => void;
  orderHistory: any[];
  setOrderHistory: React.Dispatch<React.SetStateAction<any[]>>;
  handleUpdatePaymentMethod: (orderId: string, method: string) => Promise<void>;
  sendToCourier: (order: any) => void;
  handleUpdateOrderStatus: (orderId: string, status: string) => void;
  getProductPrice: (product: any, quantity?: number) => number;
  syncSingleCourierStatus?: (orderId: string) => void;
  syncingOrderId?: string | null;
  courierReports?: Record<string, CourierFraudReport>;
  loadingCourierReports?: Record<string, boolean>;
  checkCourierReport?: (phone: string, forceRefresh?: boolean) => void;
  products?: any[];
}

export default function OrderDetailsModal({
  selectedOrderForDetails,
  setSelectedOrderForDetails,
  isAdminVerified,
  isEditingOrder,
  setIsEditingOrder,
  editingOrderData,
  setEditingOrderData,
  handleUpdateOrderDetails,
  orderHistory,
  setOrderHistory,
  handleUpdatePaymentMethod,
  sendToCourier,
  handleUpdateOrderStatus,
  getProductPrice,
  syncSingleCourierStatus,
  syncingOrderId = null,
  courierReports,
  loadingCourierReports,
  checkCourierReport,
  products = [],
}: OrderDetailsModalProps) {
  const autoRequestedPhonesRef = useRef<Set<string>>(new Set());
  const [customColorMode, setCustomColorMode] = useState<Record<number, boolean>>({});
  const [customSizeMode, setCustomSizeMode] = useState<Record<number, boolean>>({});
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const modalPhone = selectedOrderForDetails?.customerPhone || '';
  const modalCourierReport = getCourierReportForPhone(courierReports, modalPhone);
  const isModalCourierLoading = isPhoneLoadingInRecord(loadingCourierReports, modalPhone);

  // Auto-requesting courier report on modal open is disabled to avoid exhausting daily API limit (10/day).
  // Admin checks report on-demand by clicking the "চেক করুন" button.

  useEffect(() => {
    setCustomColorMode({});
    setCustomSizeMode({});
    setProductSearchQuery('');
    setIsProductDropdownOpen(false);
  }, [selectedOrderForDetails?.id, isEditingOrder]);

  useEffect(() => {
    return () => {
      setIsEditingOrder(false);
    };
  }, [setIsEditingOrder]);

  const activeProducts = useMemo(
    () => (Array.isArray(products) ? products.filter((p) => p && !p.deleted) : []),
    [products],
  );

  const filteredCatalogProducts = useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase();
    if (!q) return activeProducts.slice(0, 30);
    return activeProducts
      .filter((p) => {
        const name = String(p?.name || '').toLowerCase();
        const code = String(p?.code || '').toLowerCase();
        const model = String(p?.modelName || '').toLowerCase();
        const id = String(p?.id || '').toLowerCase();
        return name.includes(q) || code.includes(q) || model.includes(q) || id.includes(q);
      })
      .slice(0, 30);
  }, [activeProducts, productSearchQuery]);

  if (!selectedOrderForDetails) return null;

  const closeModal = () => {
    setIsEditingOrder(false);
    setSelectedOrderForDetails(null);
  };
  const safeOrderHistory = Array.isArray(orderHistory) ? orderHistory : [];
  const displayItems = isEditingOrder
    ? getOrderItemsSafe(editingOrderData)
    : getOrderItemsSafe(selectedOrderForDetails);

  const orderSubtotal = Number(
    selectedOrderForDetails.subtotal !== undefined && selectedOrderForDetails.subtotal !== null
      ? selectedOrderForDetails.subtotal
      : (Number(selectedOrderForDetails.total) || 0) - (Number(selectedOrderForDetails.deliveryCharge) || 0) + (Number(selectedOrderForDetails.discount) || 0)
  );
  const orderDiscount = Number(selectedOrderForDetails.discount || 0);
  const orderDelivery = Number(selectedOrderForDetails.deliveryCharge || 0);
  // Old/legacy orders may store weight as text ("0.5") or garbage; never let NaN reach the input or courier booking
  const parsedOrderWeight = Number(selectedOrderForDetails.totalWeight);
  const orderWeight = selectedOrderForDetails.totalWeight !== undefined && selectedOrderForDetails.totalWeight !== null && Number.isFinite(parsedOrderWeight)
    ? parsedOrderWeight
    : 0.5;

  const getItemUnitPrice = (item: any, qtyOverride?: number): number => {
    const qty = Math.max(1, Number(qtyOverride ?? item?.quantity) || 1);
    const raw = Number(item?.price);
    if (Number.isFinite(raw) && raw > 0) return raw;
    return Number(getProductPrice(item?.product, qty)) || 0;
  };

  const computeItemsSubtotal = (itemsList: any[]): number =>
    itemsList.reduce((acc, it) => {
      const qty = Math.max(1, Number(it?.quantity) || 1);
      return acc + getItemUnitPrice(it, qty) * qty;
    }, 0);

  const editSubtotal = isEditingOrder
    ? (editingOrderData?.subtotal !== undefined && editingOrderData?.subtotal !== null
        ? Number(editingOrderData.subtotal)
        : computeItemsSubtotal(displayItems))
    : orderSubtotal;
  const editDiscount = isEditingOrder
    ? Number(editingOrderData?.discount ?? orderDiscount)
    : orderDiscount;
  const editDelivery = isEditingOrder
    ? Number(editingOrderData?.deliveryCharge ?? orderDelivery)
    : orderDelivery;
  const editWeight = isEditingOrder
    ? Number(editingOrderData?.totalWeight ?? orderWeight)
    : orderWeight;
  const editDeliveryArea: 'inside' | 'outside' = isEditingOrder
    ? (editingOrderData?.deliveryArea === 'inside' || editingOrderData?.deliveryArea === 'outside'
        ? editingOrderData.deliveryArea
        : inferDeliveryArea(selectedOrderForDetails, editingOrderData?.address || ''))
    : inferDeliveryArea(selectedOrderForDetails, selectedOrderForDetails?.address || '');

  const startEditingOrder = () => {
    const clonedItems = JSON.parse(JSON.stringify(getOrderItemsSafe(selectedOrderForDetails))).map((it: any) => {
      const qty = Math.max(1, Number(it?.quantity) || 1);
      const uPrice = getItemUnitPrice(it, qty);
      return {
        ...it,
        name: it?.name || it?.product?.name || 'Product',
        quantity: qty,
        price: uPrice,
        color: it?.color && it.color !== 'N/A' ? it.color : '',
        size: it?.size && it.size !== 'N/A' ? it.size : '',
      };
    });
    setEditingOrderData({
      customerName: selectedOrderForDetails.customerName || "",
      customerPhone: selectedOrderForDetails.customerPhone || "",
      address: selectedOrderForDetails.address || "",
      district: cleanLegacyDistrict(selectedOrderForDetails.district),
      deliveryArea: inferDeliveryArea(selectedOrderForDetails, selectedOrderForDetails.address || ""),
      items: clonedItems,
      subtotal: orderSubtotal,
      discount: orderDiscount,
      deliveryCharge: orderDelivery,
      totalWeight: orderWeight,
    });
    setIsEditingOrder(true);
  };

  const updateEditItem = (idx: number, patch: Record<string, any>) => {
    const nextItems = displayItems.map((it: any, i: number) => (i === idx ? { ...it, ...patch } : it));
    setEditingOrderData({
      ...editingOrderData,
      items: nextItems,
      subtotal: computeItemsSubtotal(nextItems),
    });
  };

  const handleEditQuantityChange = (idx: number, nextQtyRaw: number) => {
    const nextQty = Math.max(1, Math.floor(Number(nextQtyRaw) || 1));
    const nextItems = displayItems.map((it: any, i: number) => {
      if (i !== idx) return it;
      const matched = activeProducts.find(
        (p) => p.id === (it?.product?.id || it?.productId || it?.id),
      ) || it?.product;
      const tieredPrice = matched ? Number(getProductPrice(matched, nextQty)) : Number(it?.price);
      const shouldAutoUpdatePrice =
        matched &&
        Array.isArray(matched.wholesaleTiers) &&
        matched.wholesaleTiers.length > 0 &&
        Number.isFinite(tieredPrice);
      return {
        ...it,
        quantity: nextQty,
        price: shouldAutoUpdatePrice ? tieredPrice : getItemUnitPrice(it, nextQty),
      };
    });
    setEditingOrderData({
      ...editingOrderData,
      items: nextItems,
      subtotal: computeItemsSubtotal(nextItems),
    });
  };

  const handleRemoveEditItem = (idx: number) => {
    const nextItems = displayItems.filter((_: any, i: number) => i !== idx);
    setEditingOrderData({
      ...editingOrderData,
      items: nextItems,
      subtotal: computeItemsSubtotal(nextItems),
    });
  };

  const handleAddProductToOrder = (prod: any) => {
    if (!prod) return;
    const uPrice = Number(getProductPrice(prod, 1)) || Number(prod.price) || 0;
    const { availableColors, availableSizes } = extractProductOptions(prod, {});
    const newItem = {
      id: prod.id,
      productId: prod.id,
      product: prod,
      name: prod.name || 'Product',
      smsName: prod.smsName || '',
      image: prod.image || prod.images?.[0] || '',
      quantity: 1,
      price: uPrice,
      color: availableColors[0] || '',
      size: availableSizes[0] || '',
    };
    const nextItems = [...displayItems, newItem];
    setEditingOrderData({
      ...editingOrderData,
      items: nextItems,
      subtotal: computeItemsSubtotal(nextItems),
    });
    setProductSearchQuery('');
    setIsProductDropdownOpen(false);
  };

  const handleEditAreaSwitch = (nextArea: 'inside' | 'outside') => {
    const suggested = computeSuggestedDeliveryCharge(
      displayItems.map((it: any) => ({
        quantity: Math.max(1, Number(it?.quantity) || 1),
        weight: it?.product?.weight ?? it?.weight ?? 0,
        isFreeDelivery: Boolean(it?.product?.isFreeDelivery ?? it?.isFreeDelivery),
      })),
      nextArea,
    );
    setEditingOrderData({
      ...editingOrderData,
      deliveryArea: nextArea,
      deliveryCharge: suggested,
    });
  };

  const handleFinancialChange = async (updates: {
    subtotal?: number;
    discount?: number;
    deliveryCharge?: number;
    totalWeight?: number;
  }) => {
    const newSubtotal = updates.subtotal !== undefined ? updates.subtotal : orderSubtotal;
    const newDiscount = updates.discount !== undefined ? updates.discount : orderDiscount;
    const newDelivery = updates.deliveryCharge !== undefined ? updates.deliveryCharge : orderDelivery;
    const newWeight = updates.totalWeight !== undefined ? updates.totalWeight : orderWeight;
    const newTotal = Math.max(0, newSubtotal - newDiscount + newDelivery);

    const currentCod = selectedOrderForDetails.codAmount;
    const newCod = (currentCod === undefined || currentCod === selectedOrderForDetails.total)
      ? newTotal
      : currentCod;

    const patch = {
      subtotal: newSubtotal,
      discount: newDiscount,
      deliveryCharge: newDelivery,
      totalWeight: newWeight,
      total: newTotal,
      codAmount: newCod
    };

    setSelectedOrderForDetails((prev: any) => prev ? { ...prev, ...patch } : null);
    setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, ...patch } : o));

    try {
      const orderRef = doc(db, "orders", selectedOrderForDetails.id);
      await updateDoc(orderRef, patch);
    } catch (err) {
      console.error("Failed to update financials in Firestore", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="relative bg-white w-full max-w-4xl h-[95dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b flex justify-between items-center bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-secondary leading-tight">অর্ডার ডিটেইলস</h3>
              <p className="text-[11px] text-gray-400 font-bold tracking-wider uppercase">
                Order ID: #{String(selectedOrderForDetails.displayId || selectedOrderForDetails.id).slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 no-scrollbar">
          {/* Customer Section */}
          <div className="bg-gray-50 rounded-2xl p-3.5 sm:p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} /> কাস্টমার ইনফরমেশন
              </h4>
              {isAdminVerified && (
                <div className="flex items-center gap-2">
                  {isEditingOrder && (
                    <button
                      type="button"
                      onClick={() => setIsEditingOrder(false)}
                      className="text-[11px] font-bold px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditingOrder) {
                        handleUpdateOrderDetails();
                      } else {
                        startEditingOrder();
                      }
                    }}
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      isEditingOrder
                        ? 'bg-primary text-white hover:opacity-90 shadow-sm'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isEditingOrder ? "সেভ করুন" : "এডিট করুন"}
                  </button>
                </div>
              )}
            </div>
            <div className={isEditingOrder ? "grid grid-cols-2 gap-x-2.5 sm:gap-x-3 gap-y-2.5" : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"}>
              <div className={isEditingOrder ? "col-span-2 sm:col-span-1" : ""}>
                <label className={isEditingOrder ? "block text-[11px] font-bold text-gray-600 mb-1" : "text-[10px] font-bold text-primary uppercase block mb-1"}>নাম</label>
                {isEditingOrder ? (
                  <input
                    type="text"
                    aria-label="Customer Name"
                    value={editingOrderData.customerName || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, customerName: e.target.value})}
                    className="w-full h-9 px-3 text-sm font-semibold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ) : (
                  <p className="font-bold text-secondary">{selectedOrderForDetails.customerName}</p>
                )}
              </div>
              <div className={isEditingOrder ? "col-span-2 sm:col-span-1" : ""}>
                <label className={isEditingOrder ? "block text-[11px] font-bold text-gray-600 mb-1" : "text-[10px] font-bold text-primary uppercase block mb-1"}>ফোন</label>
                {isEditingOrder ? (
                  <input
                    type="text"
                    aria-label="Customer Phone"
                    value={editingOrderData.customerPhone || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, customerPhone: e.target.value})}
                    className="w-full h-9 px-3 text-sm font-semibold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ) : (
                  <p className="font-bold text-secondary">{selectedOrderForDetails.customerPhone}</p>
                )}
              </div>
              <div className={isEditingOrder ? "col-span-2" : "md:col-span-2"}>
                <label className={isEditingOrder ? "block text-[11px] font-bold text-gray-600 mb-1" : "text-[10px] font-bold text-primary uppercase block mb-1"}>ঠিকানা</label>
                {isEditingOrder ? (
                  <textarea
                    aria-label="Delivery Address"
                    value={editingOrderData.address || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, address: e.target.value})}
                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">{selectedOrderForDetails.address}</p>
                )}
              </div>
              {isEditingOrder && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">জেলা <span className="font-medium text-gray-400">(ঐচ্ছিক)</span></label>
                  <input
                    type="text"
                    aria-label="District"
                    value={editingOrderData.district || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, district: e.target.value})}
                    placeholder="জেলার নাম লিখুন"
                    className="w-full h-9 px-3 text-sm font-semibold bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              )}
              {isEditingOrder && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">ডেলিভারি এরিয়া</label>
                  <div className="grid grid-cols-2 gap-1 p-1 h-9 bg-gray-100 border border-gray-200 rounded-lg">
                    {(['inside', 'outside'] as const).map((area) => (
                      <button
                        key={area}
                        type="button"
                        aria-pressed={editDeliveryArea === area}
                        onClick={() => handleEditAreaSwitch(area)}
                        className={`rounded-md text-xs font-bold transition-colors cursor-pointer ${
                          editDeliveryArea === area ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {area === 'inside' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Fraud Check / History Section */}
          {(() => {
            const customerHistory = selectedOrderForDetails.customerPhone
              ? safeOrderHistory.filter(o => o?.customerPhone === selectedOrderForDetails.customerPhone)
              : [];
            const totalOrders = customerHistory.length;
            const delivered = customerHistory.filter(o => o.status === "delivered").length;
            const returned = customerHistory.filter(o => ["cancelled", "returned", "failed"].includes(o.status)).length;
            
            const successRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
            const isRisky = returned > 0 || successRate < 50;
            const courierDisplay = getOrderCourierRateDisplay(
              modalCourierReport,
              { total: totalOrders, delivered, cancelled: returned },
              isModalCourierLoading
            );
            const hasCourierStats = courierDisplay.source === 'courier' && Boolean(modalCourierReport);
            return (
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle size={14} className={isRisky ? "text-red-500" : "text-green-500"} /> কাস্টমার অর্ডার হিস্ট্রি (ইন্টারনাল)
                    </h4>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isRisky ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {totalOrders <= 1 && returned === 0 ? "নতুন কাস্টমার" : isRisky ? "রিস্কি কাস্টমার" : "সেইফ কাস্টমার"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-50 px-2 py-2 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-gray-400 block mb-1">মোট অর্ডার</span>
                      <span className="text-base font-black text-gray-800">{totalOrders}</span>
                    </div>
                    <div className="bg-green-50 px-2 py-2 rounded-xl text-center border border-green-100">
                      <span className="text-[10px] font-bold text-green-500 block mb-1">ডেলিভারি</span>
                      <span className="text-base font-black text-green-700">{delivered}</span>
                    </div>
                    <div className="bg-red-50 px-2 py-2 rounded-xl text-center border border-red-100">
                      <span className="text-[10px] font-bold text-red-500 block mb-1">রিটার্ন/ক্যানসেল</span>
                      <span className="text-base font-black text-red-700">{returned}</span>
                    </div>
                    <div className="bg-blue-50 px-2 py-2 rounded-xl text-center border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-500 block mb-1">সাকসেস রেট</span>
                      <span className="text-base font-black text-blue-700">{successRate}%</span>
                    </div>
                  </div>
                </div>

                {(hasCourierStats || isModalCourierLoading || checkCourierReport) && modalPhone && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-3.5 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                        <Truck size={14} className="text-emerald-600" /> Steadfast কুরিয়ার ডেলিভারি রেশিও (সারা বাংলাদেশ)
                      </h4>
                      <div className="flex items-center gap-2">
                        {courierDisplay.fraudCount > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                            FRAUD ({courierDisplay.fraudCount})
                          </span>
                        )}
                        {checkCourierReport && (
                          <button
                            type="button"
                            onClick={() => checkCourierReport(modalPhone, true)}
                            disabled={isModalCourierLoading}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                          >
                            {isModalCourierLoading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCcw size={10} />}
                            {isModalCourierLoading ? "চেক হচ্ছে..." : (hasCourierStats ? "রিফ্রেশ" : "চেক করুন")}
                          </button>
                        )}
                      </div>
                    </div>

                    {hasCourierStats ? (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 px-2 py-2 rounded-xl text-center border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1">ভলিউম / মোট</span>
                          <span className="text-base font-black text-slate-800">{courierDisplay.mobileTotalText}</span>
                        </div>
                        <div className="bg-emerald-50 px-2 py-2 rounded-xl text-center border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-600 block mb-1">সফল (Success)</span>
                          <span className="text-base font-black text-emerald-700">{courierDisplay.successText}</span>
                        </div>
                        <div className="bg-rose-50 px-2 py-2 rounded-xl text-center border border-rose-100">
                          <span className="text-[10px] font-bold text-rose-500 block mb-1">বাতিল (Cancel)</span>
                          <span className="text-base font-black text-rose-700">{courierDisplay.cancelText}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-500 text-center py-2">
                        {isModalCourierLoading ? "Steadfast থেকে কাস্টমার হিস্ট্রি লোড হচ্ছে..." : "কুরিয়ার ও ফ্রড হিস্ট্রি দেখতে 'চেক করুন' বাটনে চাপুন"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Status & Payment Section */}
          {!isEditingOrder && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">স্ট্যাটাস</label>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  selectedOrderForDetails.status === "pending"
                    ? "bg-purple-500"
                    : selectedOrderForDetails.status === "confirmed"
                    ? "bg-blue-500"
                    : selectedOrderForDetails.status === "processing"
                    ? "bg-cyan-500"
                    : selectedOrderForDetails.status === "shipped"
                    ? "bg-indigo-500"
                    : selectedOrderForDetails.status === "delivered"
                    ? "bg-emerald-500"
                    : selectedOrderForDetails.status === "returned"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`} />
                <span className={`font-bold uppercase text-xs ${
                  selectedOrderForDetails.status === "pending"
                    ? "text-purple-600"
                    : selectedOrderForDetails.status === "confirmed"
                    ? "text-blue-600"
                    : selectedOrderForDetails.status === "processing"
                    ? "text-cyan-600"
                    : selectedOrderForDetails.status === "shipped"
                    ? "text-indigo-600"
                    : selectedOrderForDetails.status === "delivered"
                    ? "text-emerald-600"
                    : selectedOrderForDetails.status === "returned"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}>{selectedOrderForDetails.status}</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">পেমেন্ট মেথড</label>
              <select
                value={selectedOrderForDetails.paymentMethod || "CASH"}
                onChange={async (e) => {
                  const newMethod = e.target.value;
                  setSelectedOrderForDetails((prev: any) => prev ? { ...prev, paymentMethod: newMethod } : null);
                  await handleUpdatePaymentMethod(selectedOrderForDetails.id, newMethod);
                }}
                className="font-bold text-primary uppercase text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary shadow-sm w-full cursor-pointer"
              >
                <option value="CASH">CASH (ক্যাশ)</option>
                <option value="BKASH">BKASH (বিকাশ)</option>
                <option value="NAGAD">NAGAD (নগদ)</option>
                <option value="DUE">DUE (ডিউ)</option>
                <option value="BANK">BANK (ব্যাংক)</option>
                <option value="ONLINE">ONLINE (অনলাইন পেমেন্ট)</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">ক্যাশ কালেক্ট পরিমাণ</label>
              <input
                type="number"
                value={selectedOrderForDetails.codAmount === undefined ? selectedOrderForDetails.total : selectedOrderForDetails.codAmount}
                onChange={async (e) => {
                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                  setSelectedOrderForDetails((prev: any) => prev ? { ...prev, codAmount: val } : null);
                  try {
                    const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                    await updateDoc(orderRef, { codAmount: val });
                    setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, codAmount: val } : o));
                  } catch (err) {
                    console.error("Failed to update COD amount", err);
                  }
                }}
                className="font-bold text-primary text-xs bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary shadow-sm w-full"
              />
            </div>
          </div>
          )}
          {/* Items Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag size={12} /> অর্ডার করা পণ্যসমূহ
              </h4>
              {isEditingOrder && (
                <span className="text-[11px] font-bold text-gray-500">আইটেম: {displayItems.length}</span>
              )}
            </div>
            <div className={isEditingOrder ? "space-y-2" : "space-y-3"}>
              {displayItems.map((item: any, idx: number) => {
                const qty = Math.max(1, Number(item?.quantity) || 1);
                const unitPrice = getItemUnitPrice(item, qty);
                const matchedCatalogProduct = activeProducts.find(
                  (p) => p.id === (item?.product?.id || item?.productId || item?.id),
                ) || item?.product;
                const { availableColors, availableSizes } = extractProductOptions(matchedCatalogProduct, item);
                const currentColor = item?.color && item.color !== 'N/A' ? String(item.color) : '';
                const currentSize = item?.size && item.size !== 'N/A' ? String(item.size) : '';
                const usingCustomColor =
                  Boolean(customColorMode[idx]) ||
                  availableColors.length === 0 ||
                  (Boolean(currentColor) && !availableColors.includes(currentColor));
                const usingCustomSize =
                  Boolean(customSizeMode[idx]) ||
                  availableSizes.length === 0 ||
                  (Boolean(currentSize) && !availableSizes.includes(currentSize));

                if (isEditingOrder) {
                  return (
                    <div
                      key={`${item?.productId || item?.id || 'item'}_${idx}`}
                      className="bg-white p-3 rounded-xl border border-gray-200 space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        {item?.variantImage || item?.image || item?.product?.image ? (
                          <img
                            src={item?.variantImage || item?.image || item?.product?.image}
                            alt={item?.name || item?.product?.name || 'Product'}
                            className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            aria-label={`Product Name ${idx + 1}`}
                            value={item?.name || item?.product?.name || ''}
                            onChange={(e) =>
                              updateEditItem(idx, {
                                name: e.target.value,
                                product: item?.product ? { ...item.product, name: e.target.value } : undefined,
                              })
                            }
                            className="w-full text-xs font-black text-gray-900 bg-transparent border-b border-gray-200 focus:border-primary outline-none py-0.5"
                          />
                          <p className="text-[11px] text-gray-500 font-bold mt-0.5">
                            লাইন মোট: ৳{(unitPrice * qty).toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditItem(idx)}
                          aria-label={`Remove item ${idx + 1}`}
                          title="এই পণ্যটি মুছে ফেলুন"
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* Size Control */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">সাইজ (Size)</label>
                            {availableSizes.length > 0 && (
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
                          {!usingCustomSize && availableSizes.length > 0 ? (
                            <select
                              aria-label={`Size ${idx + 1}`}
                              value={currentSize}
                              onChange={(e) => {
                                if (e.target.value === '__custom__') {
                                  setCustomSizeMode((prev) => ({ ...prev, [idx]: true }));
                                } else {
                                  updateEditItem(idx, { size: e.target.value });
                                }
                              }}
                              className="w-full h-8 px-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <option value="">নির্বাচন করুন</option>
                              {availableSizes.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                              <option value="__custom__">+ কাস্টম লিখুন</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              aria-label={`Size ${idx + 1}`}
                              value={currentSize}
                              onChange={(e) => updateEditItem(idx, { size: e.target.value })}
                              placeholder="যেমন: L, XL, 42"
                              className="w-full h-8 px-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          )}
                        </div>

                        {/* Color Control */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">কালার (Color)</label>
                            {availableColors.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setCustomColorMode((prev) => ({ ...prev, [idx]: !usingCustomColor }))
                                }
                                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                              >
                                {usingCustomColor ? 'লিস্ট' : 'কাস্টম'}
                              </button>
                            )}
                          </div>
                          {!usingCustomColor && availableColors.length > 0 ? (
                            <select
                              aria-label={`Color ${idx + 1}`}
                              value={currentColor}
                              onChange={(e) => {
                                if (e.target.value === '__custom__') {
                                  setCustomColorMode((prev) => ({ ...prev, [idx]: true }));
                                } else {
                                  updateEditItem(idx, { color: e.target.value });
                                }
                              }}
                              className="w-full h-8 px-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <option value="">নির্বাচন করুন</option>
                              {availableColors.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                              <option value="__custom__">+ কাস্টম লিখুন</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              aria-label={`Color ${idx + 1}`}
                              value={currentColor}
                              onChange={(e) => updateEditItem(idx, { color: e.target.value })}
                              placeholder="যেমন: Black"
                              className="w-full h-8 px-2.5 text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          )}
                        </div>

                        {/* Quantity Control */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                            পরিমাণ (Qty)
                          </label>
                          <div className="flex items-center h-8 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                            <button
                              type="button"
                              aria-label={`Decrease quantity ${idx + 1}`}
                              onClick={() => handleEditQuantityChange(idx, qty - 1)}
                              className="px-2 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              aria-label={`Quantity ${idx + 1}`}
                              value={qty}
                              onChange={(e) => handleEditQuantityChange(idx, Number(e.target.value))}
                              className="w-full text-center text-xs font-black bg-transparent outline-none py-1.5"
                            />
                            <button
                              type="button"
                              aria-label={`Increase quantity ${idx + 1}`}
                              onClick={() => handleEditQuantityChange(idx, qty + 1)}
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
                            value={unitPrice}
                            onChange={(e) =>
                              updateEditItem(idx, {
                                price: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="w-full h-8 px-2.5 text-xs font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 bg-white">
                    <img src={item?.variantImage || item?.image || item?.product?.image || '/logo.png'} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary text-sm truncate">{item?.product?.name || item?.name || 'Product'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400">Qty: {qty} × ৳{unitPrice}</span>
                      {item?.color && item.color !== "N/A" && (
                         <span className="text-xs bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl font-bold text-red-600 shadow-sm">কালার: {item.color}</span>
                      )}
                      {item?.size && item.size !== "N/A" && (
                         <span className="text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-bold text-blue-600 shadow-sm">সাইজ: {item.size}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">৳{unitPrice * qty}</p>
                  </div>
                </div>
                );
              })}
              {isEditingOrder && displayItems.length === 0 && (
                <div className="p-3 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-gray-600 text-xs font-bold text-center">
                  অর্ডারে কোনো পণ্য নেই — নিচের সার্চ বক্স থেকে কোড বা নাম লিখে নতুন পণ্য যোগ করুন
                </div>
              )}
            </div>

            {isEditingOrder && activeProducts.length > 0 && (
              <div className="relative pt-1">
                <div className="relative flex items-center">
                  <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Add Product Search"
                    value={productSearchQuery}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsProductDropdownOpen(false), 180)}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    placeholder="+ কোড বা নাম লিখে নতুন পণ্য যোগ করুন..."
                    className="w-full pl-9 pr-9 h-10 text-base sm:text-xs font-bold bg-white border border-dashed border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setProductSearchQuery('');
                      }}
                      className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Clear product search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {isProductDropdownOpen && (
                  <div className="mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100 z-30">
                    {filteredCatalogProducts.length > 0 ? (
                      filteredCatalogProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddProductToOrder(p);
                          }}
                          className="w-full flex items-center gap-2.5 p-2.5 hover:bg-primary/5 active:bg-primary/10 text-left transition-colors cursor-pointer"
                        >
                          {p.image || p.images?.[0] ? (
                            <img
                              src={p.image || p.images?.[0]}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Package size={14} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.code && (
                                <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {p.code}
                                </span>
                              )}
                              <span className="text-xs font-bold text-gray-900 truncate">{p.name}</span>
                            </div>
                            <span className="text-[11px] font-black text-primary">৳{p.price}</span>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-gray-900 text-white shrink-0">
                            + যোগ
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="p-3 text-xs font-bold text-gray-400 text-center">
                        কোনো প্রোডাক্ট পাওয়া যায়নি
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Courier Delivery Status Card */}
          {(() => {
            const cConsignment = selectedOrderForDetails.courierConsignmentId || selectedOrderForDetails.couriers?.consignmentId || '';
            const cTrack = selectedOrderForDetails.couriers?.trackingId || selectedOrderForDetails.courierTrackingId || selectedOrderForDetails.trackingId || cConsignment;
            const cStatus = selectedOrderForDetails.courierStatus || selectedOrderForDetails.steadfastStatus || selectedOrderForDetails.pathaoStatus;
            const cLabel = selectedOrderForDetails.courierStatusLabel || cStatus;
            const cService = selectedOrderForDetails.courierName || selectedOrderForDetails.couriers?.service || (selectedOrderForDetails.pathaoStatus ? 'Pathao' : 'Steadfast');
            const cMsg = selectedOrderForDetails.courierTrackingMessage || selectedOrderForDetails.courierStatusDetail || '';
            const cHistory: any[] = Array.isArray(selectedOrderForDetails.courierHistory) ? [...selectedOrderForDetails.courierHistory].reverse() : [];
            const { hubName } = resolveCourierBadgeDisplay({
              isDispatched: Boolean(cTrack || cStatus || selectedOrderForDetails.status === 'shipped'),
              courierStatus: cStatus,
              courierStatusLabel: cLabel,
              courierStatusNormalized: selectedOrderForDetails.courierStatusNormalized,
              courierHub: selectedOrderForDetails.courierHub,
              courierTrackingMessage: cMsg,
            });
            const lastSyncText = formatSafeDateTime(selectedOrderForDetails.courierLastSyncedAt, 'bn-BD');
            const isSteadfast = String(cService).toLowerCase().includes('steadfast');
            const isPathao = String(cService).toLowerCase().includes('pathao');
            const canSync = Boolean(cTrack || isSteadfast || selectedOrderForDetails.status === 'shipped');
            const portalUrl = isSteadfast && cTrack
              ? `https://steadfast.com.bd/t/${encodeURIComponent(cTrack)}`
              : isPathao
              ? 'https://merchant.pathao.com/'
              : null;
            if (!cTrack && !cStatus && cHistory.length === 0 && selectedOrderForDetails.status !== 'shipped') return null;
            return (
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Truck size={15} className="text-sky-600" />
                      <span className="text-xs font-black text-sky-900">{cService} ডেলিভারি স্ট্যাটাস</span>
                      {cConsignment && (
                        <span className="text-xs font-bold text-sky-600">#{cConsignment}</span>
                      )}
                      {cLabel && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-sky-200 text-sky-700">
                          {cLabel}
                        </span>
                      )}
                      {hubName && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-600 text-white">
                          <MapPin size={10} /> {hubName}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-sky-800/80 font-medium">
                      {cTrack && (
                        <span className="inline-flex items-center gap-1.5 font-mono font-bold">
                          Tracking: {cTrack}
                          <button
                            type="button"
                            onClick={() => navigator.clipboard?.writeText(String(cTrack))}
                            className="p-0.5 text-sky-600 hover:text-sky-900 rounded cursor-pointer"
                            title="Tracking ID কপি করুন"
                          >
                            <Copy size={11} />
                          </button>
                        </span>
                      )}
                      {lastSyncText && (
                        <span>Last Sync: {lastSyncText}</span>
                      )}
                    </div>
                    {typeof cMsg === 'string' && cMsg && (
                      <p className="text-[11px] font-bold text-sky-900/90 leading-snug pt-0.5">
                        {cMsg}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {portalUrl && (
                      <a
                        href={portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-white hover:bg-sky-100/60 border border-sky-200 text-sky-700 text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <ExternalLink size={12} /> লাইভ ট্র্যাক
                      </a>
                    )}
                    {syncSingleCourierStatus && canSync && (
                      <button
                        type="button"
                        disabled={syncingOrderId === selectedOrderForDetails.id}
                        onClick={() => syncSingleCourierStatus(selectedOrderForDetails.id)}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60 shrink-0 cursor-pointer"
                      >
                        <RefreshCcw size={13} className={syncingOrderId === selectedOrderForDetails.id ? "animate-spin" : ""} />
                        {syncingOrderId === selectedOrderForDetails.id ? "সিঙ্ক হচ্ছে..." : "Sync Status Now"}
                      </button>
                    )}
                  </div>
                </div>

                {cHistory.length > 0 && (
                  <div className="pt-2.5 border-t border-sky-200/80 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-sky-700">
                      কুরিয়ার মুভমেন্ট টাইমলাইন ({cHistory.length})
                    </p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {cHistory.map((ev: any, idx: number) => {
                        const evTimeText = formatSafeDateTime(ev?.timestamp, "bn-BD");
                        return (
                        <div
                          key={`${ev?.timestamp || idx}-${idx}`}
                          className="flex items-start justify-between gap-2 text-[11px] bg-white/80 border border-sky-100 rounded-xl px-3 py-2"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-sky-900">{ev?.label || ev?.status}</span>
                            {ev?.hub && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                                <MapPin size={9} /> {ev.hub}
                              </span>
                            )}
                            {ev?.message && (
                              <p className="text-[10px] text-gray-600 font-medium leading-snug mt-0.5">
                                {ev.message}
                              </p>
                            )}
                          </div>
                          {evTimeText && (
                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                              {evTimeText}
                            </span>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Totals Section */}
          <div className={`bg-secondary text-white border border-slate-700/60 ${isEditingOrder ? "rounded-2xl p-4 space-y-2.5" : "rounded-[2rem] p-6 sm:p-7 space-y-4 shadow-xl"}`}>
            {/* ওজন (Weight) */}
            <div className="flex justify-between items-center text-white/90">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">ওজন (Weight)</span>
                <span className="text-[10px] text-gray-300">(কেজি)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  aria-label="Order Weight"
                  value={isEditingOrder ? editWeight : orderWeight}
                  onChange={(e) => {
                    const wt = Math.max(0, parseFloat(e.target.value) || 0);
                    if (isEditingOrder) {
                      setEditingOrderData({ ...editingOrderData, totalWeight: wt });
                    } else {
                      handleFinancialChange({ totalWeight: wt });
                    }
                  }}
                  className="w-20 text-right bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 transition-all"
                  placeholder="0.5"
                />
                <span className="text-xs font-bold text-gray-300">kg</span>
              </div>
            </div>

            {/* সাব-টোটাল (Subtotal) */}
            <div className="flex justify-between items-center text-white/90">
              <div>
                <span className="text-xs font-bold text-white">সাব-টোটাল (পণ্যের দাম)</span>
                <p className="text-[10px] text-gray-400">প্রয়োজনে ম্যানুয়ালি এডিট করতে পারেন</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-300">৳</span>
                <input
                  type="number"
                  min="0"
                  aria-label="Order Subtotal"
                  value={isEditingOrder ? editSubtotal : orderSubtotal}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0);
                    if (isEditingOrder) {
                      setEditingOrderData({ ...editingOrderData, subtotal: val });
                    } else {
                      handleFinancialChange({ subtotal: val });
                    }
                  }}
                  className="w-32 text-right bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            {/* ছাড় / ডিসকাউন্ট (Discount) */}
            <div className="flex justify-between items-center text-white/90">
              <div>
                <span className="text-xs font-bold text-white">ছাড় / ডিসকাউন্ট</span>
                <p className="text-[10px] text-gray-400">কাস্টমারকে দেওয়া ডিসকাউন্ট</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-300">-৳</span>
                <input
                  type="number"
                  min="0"
                  aria-label="Order Discount"
                  value={isEditingOrder ? editDiscount : orderDiscount}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0);
                    if (isEditingOrder) {
                      setEditingOrderData({ ...editingOrderData, discount: val });
                    } else {
                      handleFinancialChange({ discount: val });
                    }
                  }}
                  className="w-32 text-right bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 text-xs font-bold outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* ডেলিভারি চার্জ */}
            <div className={`flex justify-between items-center text-white/90 border-b border-white/10 ${isEditingOrder ? "pb-2.5" : "pb-4"}`}>
              <span className="text-xs font-bold text-white">ডেলিভারি চার্জ</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-300">৳</span>
                <input
                  type="number"
                  min="0"
                  aria-label="Order Delivery Charge"
                  value={isEditingOrder ? editDelivery : orderDelivery}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value) || 0);
                    if (isEditingOrder) {
                      setEditingOrderData({ ...editingOrderData, deliveryCharge: val });
                    } else {
                      handleFinancialChange({ deliveryCharge: val });
                    }
                  }}
                  className="w-24 text-right bg-white/10 text-white border border-white/20 rounded-lg px-2.5 py-1 outline-none focus:ring-2 focus:ring-primary focus:bg-white/20 text-xs font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingOrder) {
                      setEditingOrderData({ ...editingOrderData, deliveryCharge: 0 });
                    } else {
                      handleFinancialChange({ deliveryCharge: 0 });
                    }
                  }}
                  className="text-[10px] bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  ফ্রি
                </button>
              </div>
            </div>

            {selectedOrderForDetails.pointsUsed > 0 && (
              <div className="flex justify-between items-center text-[#ffeb3b] pb-4 border-b border-white/10">
                <span className="text-xs font-bold">রিওয়ার্ড পয়েন্ট ব্যবহৃত ({selectedOrderForDetails.pointsUsed} পয়েন্ট)</span>
                <span className="font-bold italic">-৳{selectedOrderForDetails.pointsDiscount || Math.floor(selectedOrderForDetails.pointsUsed / 10)}</span>
              </div>
            )}

            {/* সর্বমোট (Total) */}
            <div className={`flex justify-between items-center ${isEditingOrder ? "pt-0.5" : "pt-2"}`}>
              <div>
                <span className="text-base font-black tracking-tight text-white">সর্বমোট</span>
                <p className="text-[10px] text-gray-300">(সাবটোটাল - ছাড় + ডেলিভারি)</p>
              </div>
              <span className="text-2xl font-black text-primary">
                ৳{Math.max(0, (isEditingOrder ? editSubtotal : orderSubtotal) - (isEditingOrder ? editDiscount : orderDiscount) + (isEditingOrder ? editDelivery : orderDelivery))}
              </span>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t bg-gray-50 flex gap-2.5 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),14px)]">
          {isEditingOrder ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditingOrder(false)}
                className="px-4 sm:px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={displayItems.length === 0}
                onClick={handleUpdateOrderDetails}
                className="flex-1 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check size={16} /> পরিবর্তন সেভ করুন
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  sendToCourier(selectedOrderForDetails);
                  closeModal();
                }}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                 <Truck size={16} /> কুরিয়ারে পাঠান
              </button>
              {selectedOrderForDetails.status === "pending" && (
                 <button
                   onClick={() => {
                     handleUpdateOrderStatus(selectedOrderForDetails.id, "confirmed");
                     closeModal();
                   }}
                   className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                 >
                    <CheckCircle size={16} /> কনফার্ম করুন
                 </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
