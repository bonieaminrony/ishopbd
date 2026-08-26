import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Package, Clock, Truck, Home, X, Search, RefreshCcw, ShoppingBag } from 'lucide-react';

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
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-cream/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-secondary">Order Tracking</h2>
                </div>
                <button
                  onClick={() => setIsTrackingOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number or Order ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX or #Order ID (e.g. #664324)"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTrackOrder()}
                    />
                    <button
                      onClick={() => handleTrackOrder()}
                      disabled={isTrackingLoading || !trackingInput.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTrackingLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Search size={20} />
                      )}
                    </button>
                  </div>
                  {trackingError && <p className="text-red-500 text-sm mt-2 font-medium">{trackingError}</p>}
                </div>
                {trackingResult && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-5">
                    {/* Horizontal Visual Timeline */}
                    {trackingResult.status !== 'cancelled' && trackingResult.status !== 'returned' && (
                      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4 relative overflow-hidden">
                        <div className="relative flex justify-between items-center w-full min-h-[64px]">
                          {/* Background connecting line */}
                          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 bg-gray-100 -z-0" />
                          
                          {/* Active progress connecting line */}
                          {(() => {
                            const statusList = ['pending', 'confirmed', 'shipped', 'delivered'];
                            let currentStatusStatus = trackingResult.status === 'processing' ? 'confirmed' : trackingResult.status;
                            let currentStatusIdx = statusList.indexOf(currentStatusStatus);

                            if (trackingResult.steadfastStatus) {
                              const st = trackingResult.steadfastStatus.toLowerCase();
                              if (st.includes('delivered')) currentStatusIdx = 3;
                              else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) currentStatusIdx = 2;
                              else if (st.includes('cancelled')) currentStatusIdx = -1;
                            } else if (trackingResult.pathaoStatus) {
                              const st = trackingResult.pathaoStatus.toLowerCase();
                              if (st.includes('delivered')) currentStatusIdx = 3;
                              else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatch') || st.includes('pickup')) currentStatusIdx = 2;
                              else if (st.includes('cancel') || st.includes('return')) currentStatusIdx = -1;
                            }
                            
                            const percent = currentStatusIdx >= 0 ? (currentStatusIdx / 3) * 75 : 0;
                            return (
                              <div 
                                className="absolute top-5 left-[12.5%] h-1 bg-orange-500 transition-all duration-500 -z-0" 
                                style={{ width: `${percent}%` }}
                              />
                            );
                          })()}
                          
                          {[
                            { key: 'pending', label: 'Order Received', icon: ShoppingBag },
                            { key: 'confirmed', label: 'Confirmed & Packing', icon: CheckCircle2 },
                            { key: 'shipped', label: 'In Transit', icon: Truck },
                            { key: 'delivered', label: 'Delivered', icon: Home }
                          ].map((step, index) => {
                            const statusList = ['pending', 'confirmed', 'shipped', 'delivered'];
                            let currentStatusStatus = trackingResult.status === 'processing' ? 'confirmed' : trackingResult.status;
                            let currentStatusIdx = statusList.indexOf(currentStatusStatus);

                            if (trackingResult.steadfastStatus) {
                              const st = trackingResult.steadfastStatus.toLowerCase();
                              if (st.includes('delivered')) currentStatusIdx = 3;
                              else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) currentStatusIdx = 2;
                              else if (st.includes('cancelled')) currentStatusIdx = -1;
                            } else if (trackingResult.pathaoStatus) {
                              const st = trackingResult.pathaoStatus.toLowerCase();
                              if (st.includes('delivered')) currentStatusIdx = 3;
                              else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatch') || st.includes('pickup')) currentStatusIdx = 2;
                              else if (st.includes('cancel') || st.includes('return')) currentStatusIdx = -1;
                            }

                            const isCompleted = currentStatusIdx >= index;
                            const isCurrent = currentStatusIdx === index;
                            const StepIcon = step.icon;
                            
                            return (
                              <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isCompleted 
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' 
                                    : 'bg-white border-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-orange-100 animate-pulse' : ''}`}>
                                  <StepIcon size={18} />
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-black mt-2 text-center whitespace-nowrap block ${
                                  isCompleted ? 'text-secondary font-black' : 'text-gray-400 font-bold'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-1">Order ID</p>
                        <p className="font-bold text-secondary text-base">#{String(trackingResult.shortId || trackingResult.orderId || trackingResult.id).slice(-6).toUpperCase()}</p>
                        {(trackingResult.orderId || trackingResult.id) && (
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5 select-all">{trackingResult.orderId || trackingResult.id}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold mb-1">Date</p>
                        <p className="font-bold text-secondary text-sm">
                          {trackingResult.createdAt ? new Date(trackingResult.createdAt.toMillis?.() || trackingResult.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 font-bold mb-1">Order Status</p>
                      {(() => {
                        let finalStatus = trackingResult.status;
                        if (trackingResult.steadfastStatus) {
                          const st = trackingResult.steadfastStatus.toLowerCase();
                          if (st.includes('delivered')) finalStatus = 'delivered';
                          else if (st.includes('cancelled')) finalStatus = 'cancelled';
                          else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) finalStatus = 'shipped';
                        }
                        
                        let bgColor = 'bg-orange-100 text-orange-700';
                        if (finalStatus === 'delivered') bgColor = 'bg-green-100 text-green-700';
                        else if (finalStatus === 'cancelled') bgColor = 'bg-red-100 text-red-700';
                        else if (finalStatus === 'shipped') bgColor = 'bg-blue-100 text-blue-700';
                        let label = 'Processing';
                        if (finalStatus === 'pending') label = 'Pending / Processing';
                        else if (finalStatus === 'processing' || finalStatus === 'confirmed') label = 'Order Confirmed';
                        else if (finalStatus === 'shipped') label = 'Shipped / In Transit';
                        else if (finalStatus === 'delivered') label = 'Delivered';
                        else if (finalStatus === 'cancelled') label = 'Cancelled';
                        else if (finalStatus === 'returned') label = 'Returned';
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${bgColor}`}>
                            {label}
                          </div>
                        );
                      })()}
                    </div>
                    {trackingResult.status === 'cancelled' && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
                          <X size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-red-700">Order Cancelled</p>
                          <p className="text-[9px] text-red-500 font-bold mt-0.5">This order has been cancelled. Please contact support if you have any questions.</p>
                        </div>
                      </div>
                    )}
                    {trackingResult.status === 'returned' && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                          <RefreshCcw size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-amber-700">Order Returned</p>
                          <p className="text-[9px] text-amber-500 font-bold mt-0.5">The product has been returned. Please contact support for more details.</p>
                        </div>
                      </div>
                    )}
                    {trackingResult.steadfastStatus && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-1.5">SteadFast Courier Live Update</p>
                        {(() => {
                          const rawStatus = String(trackingResult.steadfastStatus).toLowerCase();
                          
                          // Translate Steadfast status
                          let translatedStatus = trackingResult.steadfastStatus;
                          let statusColorClass = 'text-orange-600 bg-orange-50 border-orange-100';
                          
                          if (rawStatus.includes('in_transit') || rawStatus.includes('transit') || rawStatus.includes('dispatched')) {
                            translatedStatus = 'On the way to customer (In Transit)';
                            statusColorClass = 'text-blue-600 bg-blue-50 border-blue-100';
                          } else if (rawStatus.includes('delivered')) {
                            translatedStatus = 'Delivery Completed';
                            statusColorClass = 'text-green-600 bg-green-50 border-green-100';
                          } else if (rawStatus.includes('cancelled') || rawStatus.includes('returned')) {
                            translatedStatus = 'Cancelled / Returned (Courier)';
                            statusColorClass = 'text-red-600 bg-red-50 border-red-100';
                          } else if (rawStatus.includes('hold')) {
                            translatedStatus = 'Order on Hold (Courier)';
                            statusColorClass = 'text-amber-600 bg-amber-50 border-amber-100';
                          } else if (rawStatus.includes('pending') || rawStatus.includes('processing')) {
                            translatedStatus = 'Courier Booking in Progress';
                            statusColorClass = 'text-indigo-600 bg-indigo-50 border-indigo-100';
                          } else if (rawStatus.includes('picked_up') || rawStatus.includes('received')) {
                            translatedStatus = 'Parcel Picked Up by Courier';
                            statusColorClass = 'text-sky-600 bg-sky-50 border-sky-100';
                          }
                          
                          return (
                            <div className={`border rounded-xl p-3.5 flex items-start gap-3.5 ${statusColorClass}`}>
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Truck size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black leading-tight">
                                  {translatedStatus}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                                  <p className="text-[10px] font-bold opacity-80">
                                    Courier Tracking ID: #{trackingResult.couriers?.trackingId}
                                  </p>
                                  <a 
                                    href={`https://steadfast.com.bd/t/${trackingResult.couriers?.trackingId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-black underline hover:opacity-80 transition-opacity"
                                  >
                                    View Live Tracking ↗
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {trackingResult.pathaoStatus && (
                      <div>
                        <p className="text-xs text-gray-500 font-bold mb-1.5">Pathao Courier Live Update</p>
                        {(() => {
                          const rawStatus = String(trackingResult.pathaoStatus).toLowerCase();
                          
                          // Translate Pathao status
                          let translatedStatus = trackingResult.pathaoStatus;
                          let statusColorClass = 'text-orange-600 bg-orange-50 border-orange-100';
                          
                          if (rawStatus.includes('transit') || rawStatus.includes('dispatch') || rawStatus.includes('shipped')) {
                            translatedStatus = 'On the way to customer (In Transit)';
                            statusColorClass = 'text-blue-600 bg-blue-50 border-blue-100';
                          } else if (rawStatus.includes('delivered')) {
                            translatedStatus = 'Delivery Completed';
                            statusColorClass = 'text-green-600 bg-green-50 border-green-100';
                          } else if (rawStatus.includes('cancel') || rawStatus.includes('return') || rawStatus.includes('reject')) {
                            translatedStatus = 'Cancelled / Returned (Courier)';
                            statusColorClass = 'text-red-600 bg-red-50 border-red-100';
                          } else if (rawStatus.includes('hold') || rawStatus.includes('suspend')) {
                            translatedStatus = 'Order on Hold (Courier)';
                            statusColorClass = 'text-amber-600 bg-amber-50 border-amber-100';
                          } else if (rawStatus.includes('pending') || rawStatus.includes('created') || rawStatus.includes('unassigned')) {
                            translatedStatus = 'Courier Booking in Progress';
                            statusColorClass = 'text-indigo-600 bg-indigo-50 border-indigo-100';
                          } else if (rawStatus.includes('pickup') || rawStatus.includes('received') || rawStatus.includes('assigned')) {
                            translatedStatus = 'Parcel Picked Up by Courier';
                            statusColorClass = 'text-sky-600 bg-sky-50 border-sky-100';
                          }
                          
                          return (
                            <div className={`border rounded-xl p-3.5 flex items-start gap-3.5 ${statusColorClass}`}>
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <Truck size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-black leading-tight">
                                  {translatedStatus}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                                  <p className="text-[10px] font-bold opacity-80">
                                    Courier Tracking ID: #{trackingResult.couriers?.trackingId}
                                  </p>
                                  <a 
                                    href={`https://pathaocourier.com.bd/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-black underline hover:opacity-80 transition-opacity"
                                  >
                                    View Live Tracking ↗
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {!trackingResult.steadfastStatus && !trackingResult.pathaoStatus && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0">
                          <Truck size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-blue-800">Courier Delivery Status</p>
                          <p className="text-[9px] text-blue-500 font-bold mt-0.5">This order is being fulfilled via local delivery or direct store fulfillment.</p>
                        </div>
                      </div>
                    )}
                    {/* STEPS TIMELINE */}
                    <div className="border-t pt-5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Processing Timeline</h4>
                      <div className="relative pl-8 border-l-2 border-gray-200 space-y-6 ml-3">
                        {[
                          { key: 'pending', label: 'Order Received', icon: ShoppingBag },
                          { key: 'confirmed', label: 'Confirmed & Packing', icon: CheckCircle2 },
                          { key: 'shipped', label: 'In Transit', icon: Truck },
                          { key: 'delivered', label: 'Delivered', icon: Home }
                        ].map((step, index) => {
                          let isCompleted = false;
                          let isCurrent = false;
                          const statusList = ['pending', 'confirmed', 'shipped', 'delivered'];
                          let currentStatusStatus = trackingResult.status === 'processing' ? 'confirmed' : trackingResult.status;
                          let currentStatusIdx = statusList.indexOf(currentStatusStatus);
                          
                          if (trackingResult.steadfastStatus) {
                            const st = trackingResult.steadfastStatus.toLowerCase();
                            if (st.includes('delivered')) currentStatusIdx = 3;
                            else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) currentStatusIdx = 2;
                            else if (st.includes('cancelled')) currentStatusIdx = -1;
                          } else if (trackingResult.pathaoStatus) {
                            const st = trackingResult.pathaoStatus.toLowerCase();
                            if (st.includes('delivered')) currentStatusIdx = 3;
                            else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatch') || st.includes('pickup')) currentStatusIdx = 2;
                            else if (st.includes('cancel') || st.includes('return')) currentStatusIdx = -1;
                          }
                          
                          if (currentStatusIdx >= index) isCompleted = true;
                          if (currentStatusIdx === index) isCurrent = true;
                          if (trackingResult.status === 'cancelled') {
                             isCompleted = false;
                             isCurrent = false;
                          }
                          const StepIcon = step.icon;
                          return (
                            <div key={step.key} className="relative">
                              <div className={`absolute -left-[49px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                isCompleted 
                                  ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                                  : 'border-gray-200 bg-white text-gray-400'
                              } ${isCurrent ? 'animate-pulse ring-4 ring-orange-100' : ''}`}>
                                <StepIcon size={14} />
                              </div>
                              <div>
                                <h5 className={`text-sm font-black ${isCompleted ? 'text-secondary' : 'text-gray-400'}`}>{step.label}</h5>
                                {isCurrent && <p className="text-[10px] text-orange-500 font-bold mt-0.5">Current Status</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* ORDER ITEMS */}
                    <div className="border-t pt-5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ordered Items</h4>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {trackingResult.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <img
                              src={item.variantImage || item.product?.image}
                              alt={item.product?.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 bg-gray-50"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-secondary truncate">{item.product?.name}</p>
                              {item.color || item.size ? (
                                <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                                  {item.color ? `Color: ${item.color}` : ''} {item.size ? `Size: ${item.size}` : ''}
                                </p>
                              ) : null}
                              <p className="text-xs font-bold text-primary mt-1">৳{item.product?.price} × {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* ADDRESS AND PAYMENT INFO */}
                    <div className="border-t pt-5 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</h4>
                        <p className="text-xs font-bold text-secondary">{trackingResult.customerName}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">{trackingResult.address}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">{trackingResult.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Details</h4>
                        <p className="text-xs font-bold text-secondary">Total: ৳{trackingResult.total}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">Payment: <span className="uppercase font-black text-primary">{trackingResult.paymentMethod || 'CASH'}</span></p>
                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Area: {trackingResult.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
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
