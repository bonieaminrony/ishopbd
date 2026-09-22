import React from 'react';
import { motion } from 'motion/react';
import { Check, User, Package, Download, Loader2 } from 'lucide-react';

export interface ReceiptModalProps {
  completedOrderReceipt: any;
  setCompletedOrderReceipt: (receipt: any) => void;
  receiptRef: React.RefObject<HTMLDivElement | null>;
  handleDownloadReceipt: () => void;
  isDownloadingReceipt: boolean;
}

export default function ReceiptModal({
  completedOrderReceipt,
  setCompletedOrderReceipt,
  receiptRef,
  handleDownloadReceipt,
  isDownloadingReceipt,
}: ReceiptModalProps) {
  if (!completedOrderReceipt) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCompletedOrderReceipt(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="overflow-y-auto flex-1 w-full scroll-smooth no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div ref={receiptRef} className="bg-white pb-6 w-full h-max">
            <div className="p-6 md:p-8 bg-green-50 border-b border-green-100 flex flex-col items-center text-center">
              <img loading="lazy" decoding="async" src="/logo.png" alt="Logo" className="h-10 mb-5 object-contain" />
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-1">অর্ডার সফল হয়েছে!</h3>
              <p className="text-green-600 text-sm font-medium">অর্ডার আইডি: #{String(completedOrderReceipt.orderId || "N/A").slice(-6).toUpperCase()}</p>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                  <User size={18} className="text-primary" />
                  কাস্টমার তথ্য
                </h4>
                <div className="space-y-3 text-sm">
                  <p><span className="font-bold text-gray-500">নাম:</span> {completedOrderReceipt.customerName}</p>
                  <p><span className="font-bold text-gray-500">ফোন:</span> {completedOrderReceipt.customerPhone}</p>
                  <p><span className="font-bold text-gray-500">ঠিকানা:</span> {completedOrderReceipt.address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                  <Package size={18} className="text-primary" />
                  অর্ডার করা পণ্যসমূহ
                </h4>
                
                <div className="space-y-3 mb-4">
                  {completedOrderReceipt.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-secondary text-sm">{item.product?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.quantity} {(() => {
                            switch (item.product?.unit) {
                              case "piece": return "পিস";
                              case "kg": return "কেজি";
                              case "gm": return "গ্রাম";
                              case "liter": return "লিটার";
                              case "ml": return "মিলি";
                              case "packet": return "প্যাকেট";
                              case "box": return "বক্স";
                              case "set": return "সেট";
                              default: return item.product?.unit || "পিস";
                            }
                          })()} {item.color || item.size ? `(${[item.color, item.size].filter(Boolean).join(', ')})` : ''}
                        </p>
                      </div>
                      <p className="font-bold text-primary">৳{(item.price !== undefined ? item.price : (item.product?.price || 0)) * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <p>সাবটোটাল</p>
                    <p>৳{completedOrderReceipt.subtotal}</p>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <p>ডেলিভারি চার্জ</p>
                    <p>৳{completedOrderReceipt.deliveryCharge}</p>
                  </div>
                  {completedOrderReceipt.appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <p>ডিসকাউন্ট</p>
                      <p>- ৳{completedOrderReceipt.subtotal + completedOrderReceipt.deliveryCharge - completedOrderReceipt.total}</p>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-lg text-secondary pt-2 border-t">
                    <p>সর্বমোট</p>
                    <p className="text-primary">৳{completedOrderReceipt.total}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t shrink-0 flex gap-3 w-full">
          <button
            onClick={handleDownloadReceipt}
            disabled={isDownloadingReceipt}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDownloadingReceipt ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            ডাউনলোড করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
}
