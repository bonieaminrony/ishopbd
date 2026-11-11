import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, MessageSquare, Package, Phone, Send, ShoppingCart, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { formatEnglishDateTime } from '../../utils/helpers';

export interface AdminIncompleteOrdersTabProps {
  incompleteOrders: any[];
  getCustomerStats: (phone: string) => { total: number; delivered: number };
  individualSmsOrder: any;
  setIndividualSmsOrder: (order: any) => void;
  individualSmsMessage: string;
  setIndividualSmsMessage: (msg: string) => void;
  handleSendIndividualSms: () => void;
  isSendingIndividualSms: boolean;
}

export default function AdminIncompleteOrdersTab({
  incompleteOrders,
  getCustomerStats,
  individualSmsOrder,
  setIndividualSmsOrder,
  individualSmsMessage,
  setIndividualSmsMessage,
  handleSendIndividualSms,
  isSendingIndividualSms,
}: AdminIncompleteOrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="text-red-500" size={24} /> Incomplete Orders (Abandoned Carts)
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Customers who added items to cart or entered contact details but abandoned checkout.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-200 flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-500 font-bold">Total Incomplete:</span>
          <span className="text-lg font-black text-red-600">{incompleteOrders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {incompleteOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="text-gray-300" size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-600">No Incomplete Orders</h3>
            <p className="text-xs text-gray-400 mt-1">
              When someone adds items to cart or enters their contact, they will appear here instantly.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View for Incomplete Orders */}
            <div className="lg:hidden space-y-3 p-3">
              {incompleteOrders.map((order: any) => {
                const rawPhone = (order.phone || order.customerPhone || '').trim();
                const hasRealPhone =
                  rawPhone && !rawPhone.includes('কার্টে') && !rawPhone.includes('Cart') && rawPhone.length >= 6;
                const cleanDigits = rawPhone.replace(/\D/g, '');
                const waPhone = cleanDigits.startsWith('88')
                  ? cleanDigits
                  : cleanDigits.startsWith('01')
                  ? '88' + cleanDigits
                  : cleanDigits;
                const totalAmt =
                  order.totalAmount ||
                  order.items?.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0) ||
                  0;
                const customerName =
                  order.name && order.name !== 'অজ্ঞাত কাস্টমার' && order.name !== 'অজ্ঞাত ক্রেতা'
                    ? order.name
                    : hasRealPhone
                    ? 'Customer'
                    : 'Guest Shopper';
                const itemImage = order.items?.[0]?.image || order.items?.[0]?.product?.image || '/logo.png';
                const itemsTitle =
                  order.items?.map((i: any) => `${i.name || i.product?.name || 'Item'} x${i.quantity || 1}`).join(', ') ||
                  'Incomplete Cart';
                const fullAddress = [order.address, order.thana, order.district].filter(Boolean).join(', ');
                const stats = hasRealPhone ? getCustomerStats(rawPhone) : { total: 0, delivered: 0 };

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl shadow-xs border border-red-100/90 bg-[#faf5ff] p-2.5 flex flex-col gap-2.5 transition-all"
                  >
                    <div className="flex gap-2.5 items-start">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200/60 bg-white shrink-0 self-start">
                        <img loading="lazy" src={itemImage} className="w-full h-full object-cover" alt="" />
                        <div className="absolute top-1.5 left-1.5 bg-white/95 rounded-[6px] w-[22px] h-[22px] flex items-center justify-center border border-gray-300 shadow-2xs">
                          <ShoppingCart size={12} className="text-red-500" />
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 justify-between min-h-[80px]">
                        <div className="text-[13px] font-bold text-[#1e1b4b] truncate leading-tight" title={itemsTitle}>
                          {itemsTitle}
                        </div>

                        <div className="flex items-center justify-between gap-1.5 min-w-0 mt-1">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className="text-[13px] font-bold text-[#e11d48] truncate leading-tight"
                              title={customerName}
                            >
                              {customerName}
                            </span>
                            <span className="text-[12.5px] font-extrabold text-[#1e293b] leading-tight tracking-tight mt-0.5 select-all">
                              {hasRealPhone ? rawPhone : 'No phone provided'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs whitespace-nowrap">
                              Total: {stats.total || 1}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs whitespace-nowrap">
                              SCS: {stats.delivered || 0}
                            </span>
                            {hasRealPhone && (
                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                  `Hello ${
                                    order.name && order.name !== 'অজ্ঞাত ক্রেতা' ? order.name : ''
                                  }! We noticed you added items to your cart at iShop BD. Can we assist you with completing your order?`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all border border-emerald-200/70 shadow-2xs"
                                title="WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                              </a>
                            )}
                            {hasRealPhone && (
                              <a
                                href={`tel:${cleanDigits}`}
                                className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 hover:scale-105 active:scale-95 transition-all border border-teal-200/70 shadow-2xs"
                                title="Call"
                              >
                                <Phone size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full pt-0.5">
                      <div
                        className="bg-white flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium truncate shadow-2xs"
                        title={fullAddress}
                      >
                        {fullAddress || 'No address entered'}
                      </div>
                      <div className="shrink-0">
                        <span
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border block shadow-2xs ${
                            order.type === 'cart_checkout'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : order.type === 'inline_checkout'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {order.type === 'cart_checkout'
                            ? 'Cart Checkout'
                            : order.type === 'inline_checkout'
                            ? 'Product Page'
                            : 'Landing Page'}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl block shadow-2xs">
                          ৳{Number(totalAmt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View Table for Incomplete Orders */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">Customer &amp; Mobile</th>
                    <th className="p-4">Cart Items</th>
                    <th className="p-4">Source (Step)</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4">Date &amp; Time</th>
                    <th className="p-4 text-center">Contact &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {incompleteOrders.map((order: any) => {
                    const rawPhone = (order.phone || order.customerPhone || '').trim();
                    const hasRealPhone =
                      rawPhone && !rawPhone.includes('কার্টে') && !rawPhone.includes('Cart') && rawPhone.length >= 6;
                    const cleanDigits = rawPhone.replace(/\D/g, '');
                    const waPhone = cleanDigits.startsWith('88')
                      ? cleanDigits
                      : cleanDigits.startsWith('01')
                      ? '88' + cleanDigits
                      : cleanDigits;
                    const totalAmt =
                      order.totalAmount ||
                      order.items?.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0) ||
                      0;

                    return (
                      <tr key={order.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 text-sm">
                              {order.name && order.name !== 'অজ্ঞাত কাস্টমার' && order.name !== 'অজ্ঞাত ক্রেতা'
                                ? order.name
                                : hasRealPhone
                                ? 'Customer (Unnamed)'
                                : 'Guest Shopper'}
                            </span>
                            {hasRealPhone ? (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-emerald-700 font-mono font-black text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 select-all">
                                  {rawPhone}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(rawPhone);
                                    toast.success('Phone number copied!');
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                  title="Copy Phone Number"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                Items in cart (No phone provided)
                              </span>
                            )}
                            {(order.district || order.thana || order.address) && (
                              <span className="text-[11px] text-gray-500 mt-1 max-w-xs truncate">
                                📍 {[order.address, order.thana, order.district].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="space-y-1.5">
                            {order.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100"
                              >
                                {item.image ? (
                                  <img
                                    loading="lazy"
                                    src={item.image}
                                    alt={item.name}
                                    className="w-9 h-9 rounded-lg object-cover bg-white shrink-0 border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                    <Package size={16} className="text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                  <p className="text-[11px] text-gray-500">
                                    <span className="text-purple-700 font-bold">৳{item.price}</span> × {item.quantity || 1}
                                    {(item.color || item.size) && (
                                      <span className="text-gray-400 ml-1">
                                        ({[item.color, item.size].filter(Boolean).join(', ')})
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              order.type === 'cart_checkout'
                                ? 'bg-blue-100 text-blue-700'
                                : order.type === 'inline_checkout'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {order.type === 'cart_checkout'
                              ? 'Cart Checkout'
                              : order.type === 'inline_checkout'
                              ? 'Product Page'
                              : 'Landing Page'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-black text-sm text-gray-900">
                            ৳{Number(totalAmt).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 whitespace-nowrap">
                          {formatEnglishDateTime(order.date || order.updatedAt || order.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {hasRealPhone ? (
                              <>
                                <a
                                  href={`tel:${cleanDigits}`}
                                  className="inline-flex items-center justify-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs shadow-emerald-600/20 active:scale-95"
                                  title="Call Directly"
                                >
                                  <Phone size={13} /> Call
                                </a>

                                <a
                                  href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                    `Hello ${
                                      order.name && order.name !== 'অজ্ঞাত ক্রেতা' ? order.name : ''
                                    }! We noticed you added items to your cart at iShop BD. Can we assist you with completing your order?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1 bg-green-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-xs shadow-green-500/20 active:scale-95"
                                  title="Message on WhatsApp"
                                >
                                  <MessageSquare size={13} /> WA
                                </a>

                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                      setIndividualSmsMessage(
                                        `Dear customer, your cart items at iShop BD are waiting! Complete your order now: https://www.ishopbd.com Thank you!`
                                      );
                                    }}
                                    className={`inline-flex items-center justify-center gap-1 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                      individualSmsOrder?.id === order.id
                                        ? 'bg-purple-600 shadow-purple-600/20'
                                        : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'
                                    }`}
                                    title="Send SMS"
                                  >
                                    <Send size={13} /> SMS
                                  </button>

                                  <AnimatePresence>
                                    {individualSmsOrder?.id === order.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute top-[120%] right-0 bg-white rounded-2xl w-80 shadow-2xl border border-gray-200 z-[200] origin-top-right cursor-default text-left p-4"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                          <p className="text-xs text-gray-500 font-medium">
                                            Recipient: <span className="font-bold text-gray-800 font-mono">{rawPhone}</span>
                                          </p>
                                          <button
                                            onClick={() => setIndividualSmsOrder(null)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                          >
                                            <X size={15} />
                                          </button>
                                        </div>
                                        <textarea
                                          value={individualSmsMessage}
                                          onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                          placeholder="Type SMS message..."
                                          rows={3}
                                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-3 font-medium outline-none"
                                        />
                                        <button
                                          onClick={handleSendIndividualSms}
                                          disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                          className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-700 disabled:opacity-50 transition-all active:scale-95 w-full shadow-md shadow-purple-600/20"
                                        >
                                          {isSendingIndividualSms ? (
                                            'Sending...'
                                          ) : (
                                            <>
                                              <Send size={13} /> Send SMS
                                            </>
                                          )}
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No phone</span>
                            )}

                            <button
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to delete this incomplete record?')) {
                                  try {
                                    await deleteDoc(doc(db, 'incomplete_orders', order.id));
                                    toast.success('Incomplete order deleted.');
                                  } catch (err: any) {
                                    toast.error('Failed to delete: ' + err.message);
                                  }
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
