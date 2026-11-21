import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Truck, Home, X, Search, RefreshCcw, ShoppingBag, ExternalLink, MapPin } from 'lucide-react';

const TRACKING_STEPS = ["pending", "confirmed", "shipped", "delivered"];

function resolveTrackingStatusIndex(trackingResult: any): number {
  const normalizedOrderStatus = trackingResult?.status === "processing" ? "confirmed" : trackingResult?.status;
  let idx = TRACKING_STEPS.indexOf(normalizedOrderStatus);
  const liveStatus = String(
    trackingResult?.steadfastStatus ||
    trackingResult?.pathaoStatus ||
    trackingResult?.courierStatus ||
    ""
  ).toLowerCase().trim();

  if (liveStatus) {
    if (liveStatus.includes("partial_delivered") || liveStatus.includes("delivered")) {
      idx = 3;
    } else if (
      liveStatus.includes("transit") ||
      liveStatus.includes("shipped") ||
      liveStatus.includes("dispatched") ||
      liveStatus.includes("dispatch") ||
      liveStatus.includes("pickup") ||
      liveStatus.includes("picked") ||
      liveStatus.includes("in_review") ||
      liveStatus.includes("hold") ||
      liveStatus.includes("assigned")
    ) {
      idx = 2;
    } else if (
      liveStatus.includes("cancel") ||
      liveStatus.includes("return") ||
      liveStatus.includes("reject") ||
      liveStatus.includes("delivery_failed") ||
      liveStatus.includes("unknown")
    ) {
      idx = -1;
    }
  }
  return idx;
}

function translateCourierStatusDisplay(raw: string): { translatedStatus: string; statusColorClass: string } {
  const rawStatus = String(raw || "").toLowerCase();
  let translatedStatus = raw;
  let statusColorClass = "text-amber-700 bg-amber-50 border-amber-200";

  if (rawStatus.includes("in_transit") || rawStatus.includes("transit") || rawStatus.includes("dispatched") || rawStatus.includes("dispatch") || rawStatus.includes("shipped")) {
    translatedStatus = "পার্সেলটি আপনার ঠিকানায় পৌঁছানোর পথে রয়েছে (In Transit)";
    statusColorClass = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (rawStatus.includes("partial_delivered")) {
    translatedStatus = "আংশিক ডেলিভারি সম্পন্ন হয়েছে (Partially Delivered)";
    statusColorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (rawStatus.includes("delivered")) {
    translatedStatus = "সফলভাবে ডেলিভারি সম্পন্ন হয়েছে (Delivered)";
    statusColorClass = "text-green-700 bg-green-50 border-green-200";
  } else if (rawStatus.includes("cancel") || rawStatus.includes("return") || rawStatus.includes("reject") || rawStatus.includes("delivery_failed")) {
    translatedStatus = "পার্সেল বাতিল বা রিটার্ন করা হয়েছে (Cancelled / Returned)";
    statusColorClass = "text-red-700 bg-red-50 border-red-200";
  } else if (rawStatus.includes("hold") || rawStatus.includes("suspend")) {
    translatedStatus = "পার্সেলটি সাময়িক হোল্ডে রয়েছে (On Hold)";
    statusColorClass = "text-amber-700 bg-amber-50 border-amber-200";
  } else if (rawStatus.includes("in_review") || rawStatus.includes("pending") || rawStatus.includes("processing") || rawStatus.includes("created") || rawStatus.includes("unassigned")) {
    translatedStatus = "কুরিয়ার বুকিং প্রক্রিয়া সম্পন্ন হচ্ছে (Booking in Progress)";
    statusColorClass = "text-indigo-700 bg-indigo-50 border-indigo-200";
  } else if (rawStatus.includes("picked") || rawStatus.includes("pickup") || rawStatus.includes("received") || rawStatus.includes("assigned")) {
    translatedStatus = "কুরিয়ার প্রতিনিধি পার্সেল পিকআপ করেছেন (Picked Up)";
    statusColorClass = "text-sky-700 bg-sky-50 border-sky-200";
  }
  return { translatedStatus, statusColorClass };
}

export interface TrackingModalProps {
  setIsTrackingOpen: any;
  trackingInput: any;
  setTrackingInput: any;
  handleTrackOrder: any;
  isTrackingLoading: any;
  trackingError: any;
  trackingResult: any;
  isTrackingOpen: any;
}

export default function TrackingModal(props: TrackingModalProps) {
  const {
    setIsTrackingOpen,
    trackingInput,
    setTrackingInput,
    handleTrackOrder,
    isTrackingLoading,
    trackingError,
    trackingResult,
    isTrackingOpen,
  } = props;

  return (
    <>
      {isTrackingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTrackingOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-secondary">লাইভ কুরিয়ার ও অর্ডার ট্র্যাকিং</h2>
                  <p className="text-[11px] text-gray-500 font-medium">স্টেডফাস্ট ও সরাসরি ডেলিভারি স্ট্যাটাস</p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto">
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  মোবাইল নম্বর, অর্ডার আইডি বা কুরিয়ার ট্র্যাকিং কোড
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX বা #অর্ডার আইডি বা ট্র্যাকিং কোড"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-medium"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                  />
                  <button
                    onClick={() => handleTrackOrder()}
                    disabled={isTrackingLoading || !trackingInput.trim()}
                    className="bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 cursor-pointer"
                  >
                    {isTrackingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Search size={18} />
                        <span className="text-xs">খুঁজুন</span>
                      </>
                    )}
                  </button>
                </div>
                {trackingError && <p className="text-red-500 text-xs mt-2 font-medium">{trackingError}</p>}
              </div>

              {trackingResult && (
                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-4">
                  {/* Horizontal Visual Timeline */}
                  {trackingResult.status !== 'cancelled' && trackingResult.status !== 'returned' && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
                      <div className="relative flex justify-between items-center w-full min-h-[64px]">
                        {/* Background connecting line */}
                        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-gray-100 -z-0" />
                        
                        {/* Active progress connecting line */}
                        {(() => {
                          const currentStatusIdx = resolveTrackingStatusIndex(trackingResult);
                          const percent = currentStatusIdx >= 0 ? (currentStatusIdx / 3) * 75 : 0;
                          return (
                            <div 
                              className="absolute top-5 left-[12.5%] h-1 bg-primary transition-all duration-500 -z-0" 
                              style={{ width: `${percent}%` }}
                            />
                          );
                        })()}
                        
                        {[
                          { key: 'pending', label: 'অর্ডার গৃহীত', en: 'Received', icon: ShoppingBag },
                          { key: 'confirmed', label: 'প্যাকিং প্রস্তুত', en: 'Packed', icon: CheckCircle2 },
                          { key: 'shipped', label: 'কুরিয়ারে পথে', en: 'In Transit', icon: Truck },
                          { key: 'delivered', label: 'ডেলিভার্ড', en: 'Delivered', icon: Home }
                        ].map((step, index) => {
                          const currentStatusIdx = resolveTrackingStatusIndex(trackingResult);
                          const isCompleted = currentStatusIdx >= index;
                          const isCurrent = currentStatusIdx === index;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                                  : 'bg-white border-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}>
                                <StepIcon size={18} />
                              </div>
                              <span className={`text-[10px] font-bold mt-1.5 text-center leading-tight block max-w-[75px] ${
                                isCompleted ? 'text-secondary font-black' : 'text-gray-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Details Header */}
                  <div className="flex justify-between items-start bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">অর্ডার নম্বর (Order ID)</p>
                      <p className="font-black text-secondary text-base">#{String(trackingResult.shortId || trackingResult.orderId || trackingResult.id).slice(-6).toUpperCase()}</p>
                      {(trackingResult.orderId || trackingResult.id) && (
                        <p className="text-[10px] text-gray-400 font-mono select-all">{trackingResult.orderId || trackingResult.id}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">তারিখ (Date)</p>
                      <p className="font-bold text-secondary text-xs">
                        {trackingResult.createdAt ? new Date(trackingResult.createdAt.toMillis?.() || trackingResult.createdAt).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                      </p>
                    </div>
                  </div>

                  {/* Steadfast Courier Live Card */}
                  {trackingResult.steadfastStatus && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <p className="text-xs font-black text-secondary">Steadfast কুরিয়ার লাইভ স্ট্যাটাস</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          লাইভ আপডেট
                        </span>
                      </div>

                      {(() => {
                        const { translatedStatus, statusColorClass } = translateCourierStatusDisplay(trackingResult.steadfastStatus);
                        const sfTrackCode = trackingResult.couriers?.trackingId || trackingResult.courierTrackingId || trackingResult.trackingId || trackingResult.couriers?.consignmentId || trackingResult.courierConsignmentId;
                        const sfUrl = sfTrackCode ? `https://steadfast.com.bd/t/${encodeURIComponent(sfTrackCode)}` : null;

                        return (
                          <div className={`border rounded-xl p-3.5 space-y-2.5 ${statusColorClass}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-primary">
                                <Truck size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black leading-tight text-secondary">
                                  {translatedStatus}
                                </p>
                                {trackingResult.courierHubName && (
                                  <p className="text-[11px] font-bold text-gray-600 mt-1 flex items-center gap-1">
                                    <MapPin size={12} className="text-primary" /> বর্তমান হাব: {trackingResult.courierHubName}
                                  </p>
                                )}
                                {trackingResult.steadfastTrackingMessage && (
                                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                    {trackingResult.steadfastTrackingMessage}
                                  </p>
                                )}
                              </div>
                            </div>

                            {sfTrackCode && (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-current/10">
                                <p className="text-[11px] font-bold opacity-90">
                                  স্টেডফাস্ট ট্র্যাকিং আইডি: <span className="font-mono font-black">{sfTrackCode}</span>
                                </p>
                                {sfUrl && (
                                  <a
                                    href={sfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline bg-white px-2.5 py-1 rounded-lg border border-primary/20 shadow-xs transition-all active:scale-95"
                                  >
                                    <span>স্টেডফাস্টে সরাসরি দেখুন</span>
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Pathao Courier Live Card */}
                  {trackingResult.pathaoStatus && (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-secondary">Pathao কুরিয়ার লাইভ স্ট্যাটাস</p>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          কুরিয়ার লাইভ
                        </span>
                      </div>
                      {(() => {
                        const { translatedStatus, statusColorClass } = translateCourierStatusDisplay(trackingResult.pathaoStatus);
                        const pathaoCode = trackingResult.couriers?.trackingId || trackingResult.courierTrackingId || trackingResult.trackingId || trackingResult.courierConsignmentId;
                        return (
                          <div className={`border rounded-xl p-3.5 space-y-2 ${statusColorClass}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-primary">
                                <Truck size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black leading-tight text-secondary">
                                  {translatedStatus}
                                </p>
                              </div>
                            </div>
                            {pathaoCode && (
                              <div className="pt-2 border-t border-current/10 flex items-center justify-between">
                                <p className="text-[10px] font-bold opacity-80">
                                  ট্র্যাকিং আইডি: #{pathaoCode}
                                </p>
                                <a
                                  href="https://pathaocourier.com.bd/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-black text-primary hover:underline flex items-center gap-1"
                                >
                                  পাঠাও ট্র্যাকিং ↗
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* General Order Status if No Live Courier is Active Yet */}
                  {!trackingResult.steadfastStatus && !trackingResult.pathaoStatus && (
                    <div className="bg-white rounded-xl p-3.5 border border-gray-100 flex items-center gap-3 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Truck size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-secondary">অর্ডার প্রসেসিং চলমান</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                          কুরিয়ার বুকিং সম্পন্ন হলে স্বয়ংক্রিয়ভাবে লাইভ ট্র্যাকিং আইডি ও গতিবিধি দেখা যাবে।
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Alert */}
                  {trackingResult.status === 'cancelled' && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <X size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-red-700">অর্ডারটি বাতিল করা হয়েছে</p>
                        <p className="text-[10px] text-red-500 font-medium mt-0.5">যেকোনো তথ্যের জন্য সরাসরি আমাদের হেল্পলাইনে যোগাযোগ করতে পারেন।</p>
                      </div>
                    </div>
                  )}

                  {/* Returned Alert */}
                  {trackingResult.status === 'returned' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <RefreshCcw size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-amber-700">অর্ডার রিটার্ন হয়েছে</p>
                        <p className="text-[10px] text-amber-500 font-medium mt-0.5">পণ্যটি ডেলিভারি ব্যর্থ হয়ে আমাদের স্টোরে ফেরত এসেছে।</p>
                      </div>
                    </div>
                  )}

                  {/* Ordered Items */}
                  {Array.isArray(trackingResult.items) && trackingResult.items.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">অর্ডারকৃত পণ্যসমূহ</h4>
                      <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                        {trackingResult.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
                            <img
                              src={item.variantImage || item.product?.image}
                              alt={item.product?.name}
                              className="w-11 h-11 object-cover rounded-lg border border-gray-100 shrink-0 bg-gray-50"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-secondary truncate">{item.product?.name}</p>
                              {item.color || item.size ? (
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                  {item.color ? `কালার: ${item.color}` : ''} {item.size ? `সাইজ: ${item.size}` : ''}
                                </p>
                              ) : null}
                              <p className="text-xs font-black text-primary mt-0.5">৳{item.product?.price} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Delivery Address & Billing */}
                  <div className="border-t border-gray-100 pt-3.5 grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">ডেলিভারি ঠিকানা</h4>
                      <p className="font-bold text-secondary">{trackingResult.customerName}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{trackingResult.address}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{trackingResult.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">বিলিং বিবরণ</h4>
                      <p className="font-bold text-secondary text-sm">মোট: ৳{trackingResult.total}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">পেমেন্ট: <span className="uppercase font-bold text-primary">{trackingResult.paymentMethod || 'ক্যাশ অন ডেলিভারি'}</span></p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{trackingResult.deliveryArea === 'inside' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
