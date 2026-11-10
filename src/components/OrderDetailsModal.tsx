import React from 'react';
import { motion } from 'motion/react';
import { History, X, User, AlertCircle, ShoppingBag, Truck, CheckCircle, RefreshCcw } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
}: OrderDetailsModalProps) {
  if (!selectedOrderForDetails) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedOrderForDetails(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-primary/10 text-primary rounded-2xl">
              <History size={22} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-secondary">অর্ডার ডিটেইলস</h3>
              <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                Order ID: #{String(selectedOrderForDetails.displayId || selectedOrderForDetails.id).slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedOrderForDetails(null)}
            className="p-2 sm:p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 no-scrollbar">
          {/* Customer Section */}
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> কাস্টমার ইনফরমেশন
              </h4>
              {isAdminVerified && (
                <button
                  onClick={() => {
                    if (isEditingOrder) {
                      handleUpdateOrderDetails();
                    } else {
                      setEditingOrderData({
                        customerName: selectedOrderForDetails.customerName,
                        customerPhone: selectedOrderForDetails.customerPhone,
                        address: selectedOrderForDetails.address,
                        items: JSON.parse(JSON.stringify(selectedOrderForDetails.items || []))
                      });
                      setIsEditingOrder(true);
                    }
                  }}
                  className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-colors"
                >
                  {isEditingOrder ? "সেভ করুন" : "এডিট করুন"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-primary uppercase block mb-1">নাম</label>
                {isEditingOrder ? (
                  <input
                    type="text"
                    value={editingOrderData.customerName || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, customerName: e.target.value})}
                    className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="font-bold text-secondary">{selectedOrderForDetails.customerName}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-primary uppercase block mb-1">ফোন</label>
                {isEditingOrder ? (
                  <input
                    type="text"
                    value={editingOrderData.customerPhone || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, customerPhone: e.target.value})}
                    className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="font-bold text-secondary">{selectedOrderForDetails.customerPhone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-primary uppercase block mb-1">ঠিকানা</label>
                {isEditingOrder ? (
                  <textarea
                    value={editingOrderData.address || ""}
                    onChange={e => setEditingOrderData({...editingOrderData, address: e.target.value})}
                    className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm font-bold text-gray-600 leading-relaxed">{selectedOrderForDetails.address}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Fraud Check / History Section */}
          {(() => {
            const customerHistory = orderHistory.filter(o => o.customerPhone === selectedOrderForDetails.customerPhone);
            const totalOrders = customerHistory.length;
            const delivered = customerHistory.filter(o => o.status === "delivered").length;
            const returned = customerHistory.filter(o => ["cancelled", "returned", "failed"].includes(o.status)).length;
            
            const successRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
            const isRisky = returned > 0 || successRate < 50;
            return (
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} className={isRisky ? "text-red-500" : "text-green-500"} /> কাস্টমার অর্ডার হিস্ট্রি (ইন্টারনাল)
                  </h4>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isRisky ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {totalOrders <= 1 && returned === 0 ? "নতুন কাস্টমার" : isRisky ? "রিস্কি কাস্টমার" : "সেইফ কাস্টমার"}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-gray-400 block mb-1">মোট অর্ডার</span>
                    <span className="text-lg font-black text-gray-800">{totalOrders}</span>
                  </div>
                  <div className="bg-green-50 p-3 rounded-2xl text-center border border-green-100">
                    <span className="text-[10px] font-bold text-green-500 block mb-1">ডেলিভারি</span>
                    <span className="text-lg font-black text-green-700">{delivered}</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-2xl text-center border border-red-100">
                    <span className="text-[10px] font-bold text-red-500 block mb-1">রিটার্ন/ক্যানসেল</span>
                    <span className="text-lg font-black text-red-700">{returned}</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-500 block mb-1">সাকসেস রেট</span>
                    <span className="text-lg font-black text-blue-700">{successRate}%</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Status & Payment Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">স্ট্যাটাস</label>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  selectedOrderForDetails.status === "pending"
                    ? "bg-purple-500"
                    : selectedOrderForDetails.status === "confirmed"
                    ? "bg-blue-500"
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
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
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
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
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
          {/* Items Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
              <ShoppingBag size={12} /> অর্ডার করা পণ্যসমূহ
            </h4>
            <div className="space-y-3">
              {(isEditingOrder ? editingOrderData.items : selectedOrderForDetails.items)?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 bg-white">
                    <img src={item.product?.image} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-secondary text-sm truncate">{item.product?.name}</p>
                    {isEditingOrder ? (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex flex-col gap-1 shrink-0">
                          <label className="text-[8px] font-black text-gray-400 uppercase">পরিমাণ</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = Math.max(1, Number(e.target.value));
                              const newItems = [...editingOrderData.items];
                              newItems[idx].quantity = newQty;
                              setEditingOrderData({ ...editingOrderData, items: newItems });
                            }}
                            className="w-16 text-xs font-bold border border-gray-200 rounded p-1.5 text-center outline-none focus:ring-1 focus:ring-primary bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase">কালার</label>
                          {item.product?.colors && item.product.colors.length > 0 ? (
                            <select
                              value={item.color || ""}
                              onChange={(e) => {
                                const newItems = [...editingOrderData.items];
                                newItems[idx].color = e.target.value;
                                setEditingOrderData({ ...editingOrderData, items: newItems });
                              }}
                              className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                            >
                              <option value="">N/A (নাই)</option>
                              {item.product.colors.map((c: string, cIdx: number) => (
                                <option key={cIdx} value={c}>{c}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.color || ""}
                              placeholder="কালার লিখুন"
                              onChange={(e) => {
                                const newItems = [...editingOrderData.items];
                                newItems[idx].color = e.target.value;
                                setEditingOrderData({ ...editingOrderData, items: newItems });
                              }}
                              className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white"
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase">সাইজ</label>
                          {item.product?.sizes && item.product.sizes.length > 0 ? (
                            <select
                              value={item.size || ""}
                              onChange={(e) => {
                                const newItems = [...editingOrderData.items];
                                newItems[idx].size = e.target.value;
                                setEditingOrderData({ ...editingOrderData, items: newItems });
                              }}
                              className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                            >
                              <option value="">N/A (নাই)</option>
                              {item.product.sizes.map((s: string, sIdx: number) => (
                                <option key={sIdx} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.size || ""}
                              placeholder="সাইজ লিখুন"
                              onChange={(e) => {
                                const newItems = [...editingOrderData.items];
                                newItems[idx].size = e.target.value;
                                setEditingOrderData({ ...editingOrderData, items: newItems });
                              }}
                              className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</span>
                        {item.color && item.color !== "N/A" && (
                           <span className="text-xs bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl font-bold text-red-600 shadow-sm">কালার: {item.color}</span>
                        )}
                        {item.size && item.size !== "N/A" && (
                           <span className="text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-bold text-blue-600 shadow-sm">সাইজ: {item.size}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary">৳{getProductPrice(item.product, item.quantity) * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Courier Delivery Status Card */}
          {(() => {
            const cTrack = selectedOrderForDetails.couriers?.trackingId || selectedOrderForDetails.courierTrackingId || selectedOrderForDetails.trackingId || selectedOrderForDetails.courierConsignmentId;
            const cStatus = selectedOrderForDetails.courierStatus || selectedOrderForDetails.steadfastStatus || selectedOrderForDetails.pathaoStatus;
            const cLabel = selectedOrderForDetails.courierStatusLabel || cStatus;
            const cService = selectedOrderForDetails.courierName || selectedOrderForDetails.couriers?.service || (selectedOrderForDetails.pathaoStatus ? 'Pathao' : 'Steadfast');
            if (!cTrack && !cStatus) return null;
            return (
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-sky-600" />
                    <span className="text-xs font-black text-sky-900">{cService} ডেলিভারি স্ট্যাটাস</span>
                    {cLabel && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-sky-200 text-sky-700">
                        {cLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-sky-800/80 font-medium">
                    {cTrack && <span className="font-mono font-bold">Tracking: {cTrack}</span>}
                    {selectedOrderForDetails.courierLastSyncedAt && (
                      <span>Last Sync: {new Date(selectedOrderForDetails.courierLastSyncedAt).toLocaleString("bn-BD")}</span>
                    )}
                  </div>
                </div>
                {syncSingleCourierStatus && cTrack && (
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
            );
          })()}

          {/* Totals Section */}
          <div className="bg-secondary text-white rounded-[2rem] p-8 space-y-4">
            <div className="flex justify-between items-center text-secondary-foreground opacity-60">
              <span className="text-xs font-bold">ওজন</span>
              <span className="font-bold italic">
                {selectedOrderForDetails.totalWeight 
                  ? (selectedOrderForDetails.totalWeight >= 1 
                    ? `${selectedOrderForDetails.totalWeight.toFixed(2)} কেজি`
                    : `${(selectedOrderForDetails.totalWeight * 1000).toFixed(0)} গ্রাম`)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-secondary-foreground opacity-60">
              <span className="text-xs font-bold">সাব-টোটাল</span>
              <span className="font-bold italic">৳{selectedOrderForDetails.subtotal || selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0)}</span>
            </div>
             <div className="flex justify-between items-center text-secondary-foreground pb-4 border-b border-white/10">
              <span className="text-xs font-bold opacity-60">ডেলিভারি চার্জ</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={selectedOrderForDetails.deliveryCharge === undefined || selectedOrderForDetails.deliveryCharge === null ? "" : selectedOrderForDetails.deliveryCharge}
                  onChange={async (e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value);
                    const subtotal = selectedOrderForDetails.subtotal || (selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0));
                    const newTotal = subtotal + val;
                    
                    setSelectedOrderForDetails((prev: any) => prev ? { ...prev, deliveryCharge: val, total: newTotal } : null);
                    
                    try {
                      const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                      await updateDoc(orderRef, { deliveryCharge: val, total: newTotal });
                      setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, deliveryCharge: val, total: newTotal } : o));
                    } catch (err) {
                      console.error("Failed to update delivery charge", err);
                    }
                  }}
                  className="w-16 text-right bg-white/10 text-white border border-white/20 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const val = 0;
                    const subtotal = selectedOrderForDetails.subtotal || (selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0));
                    const newTotal = subtotal;
                    
                    setSelectedOrderForDetails((prev: any) => prev ? { ...prev, deliveryCharge: val, total: newTotal } : null);
                    
                    try {
                      const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                      await updateDoc(orderRef, { deliveryCharge: val, total: newTotal });
                      setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, deliveryCharge: val, total: newTotal } : o));
                    } catch (err) {
                      console.error("Failed to update delivery charge", err);
                    }
                  }}
                  className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-black px-2 py-1 rounded transition-all active:scale-95 shadow-md"
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
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold tracking-tight"></span>
              <span className="text-2xl font-bold text-primary italic drop-shadow-lg">৳{selectedOrderForDetails.total}</span>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
           <button 
             onClick={() => {
               sendToCourier(selectedOrderForDetails);
               setSelectedOrderForDetails(null);
             }}
             className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
           >
              <Truck size={18} /> কুরিয়ারে পাঠান
           </button>
           {selectedOrderForDetails.status === "pending" && (
              <button 
                onClick={() => {
                  handleUpdateOrderStatus(selectedOrderForDetails.id, "confirmed");
                  setSelectedOrderForDetails(null);
                }}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <CheckCircle size={18} /> কনফার্ম করুন
              </button>
           )}
        </div>
      </motion.div>
    </div>
  );
}
