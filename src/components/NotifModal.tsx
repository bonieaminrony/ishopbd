import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock, Truck, ShoppingBag, ExternalLink, PackageCheck, AlertCircle } from 'lucide-react';

export interface NotifModalProps {
  setIsNotifOpen: (open: boolean) => void;
  notifications: any[];
  handleClearAllNotifications: () => void;
  handleDismissNotification: (id: string) => void;
  Info: any;
  products: any[];
  setSelectedProduct?: (product: any) => void;
  setIsProductDetailsOpen?: (open: boolean) => void;
  toast?: any;
  isNotifOpen: boolean;
  setIsTrackingOpen?: (open: boolean) => void;
  setTrackingInput?: (input: string) => void;
  handleTrackOrder?: (overrideInput?: string) => void;
}

export default function NotifModal(props: NotifModalProps) {
  const {
    setIsNotifOpen,
    notifications,
    handleClearAllNotifications,
    handleDismissNotification,
    Info,
    products,
    setSelectedProduct,
    setIsProductDetailsOpen,
    toast,
    isNotifOpen,
    setIsTrackingOpen,
    setTrackingInput,
    handleTrackOrder,
  } = props;

  // Extract order ID if this notification is related to an order
  const getOrderIdFromNotification = (notif: any): string | null => {
    if (notif.orderId && typeof notif.orderId === 'string' && notif.orderId.trim()) {
      return notif.orderId.trim().replace(/^#/, '');
    }
    if (typeof notif.link === 'string' && notif.link.trim()) {
      const linkTrimmed = notif.link.trim();
      if (linkTrimmed.startsWith('order:')) {
        return linkTrimmed.replace('order:', '').trim().replace(/^#/, '');
      }
      if (linkTrimmed.startsWith('/track/')) {
        return linkTrimmed.replace('/track/', '').trim().replace(/^#/, '');
      }
      if (/^\d{6,}$/.test(linkTrimmed)) {
        return linkTrimmed;
      }
    }
    if (typeof notif.title === 'string') {
      const titleMatch = notif.title.match(/#([a-zA-Z0-9_-]+)/);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1];
      }
    }
    if (typeof notif.message === 'string') {
      const msgMatch = notif.message.match(/#([a-zA-Z0-9_-]+)/);
      if (msgMatch && msgMatch[1]) {
        return msgMatch[1];
      }
    }
    return null;
  };

  const formatNotificationContent = (notif: any) => {
    let title = notif.title || 'Notification';
    let message = notif.message || '';

    // Convert common Bengali order status titles to English
    title = title
      .replace(/অর্ডার\s*পেন্ডিং\s*\(অপেক্ষমান\)/gi, 'Order Pending')
      .replace(/অর্ডার\s*কনফার্মড\s*\(অনুমোদিত\)/gi, 'Order Confirmed')
      .replace(/অর্ডার\s*কনফার্মড/gi, 'Order Confirmed')
      .replace(/অর্ডার\s*পেন্ডিং/gi, 'Order Pending')
      .replace(/অর্ডার\s*প্রসেসিং\s*হচ্ছে/gi, 'Order Processing')
      .replace(/অর্ডার\s*কুরিয়ারে\s*পাঠানো\s*হয়েছে\s*\(অন দ্য ওয়ে\)/gi, 'Order In Transit')
      .replace(/অর্ডার\s*কুরিয়ারে\s*পাঠানো\s*হয়েছে/gi, 'Order Handed to Courier')
      .replace(/অর্ডার\s*সফলভাবে\s*ডেলিভারি\s*সম্পন্ন\s*হয়েছে/gi, 'Order Delivered')
      .replace(/অর্ডার\s*বাতিল\s*করা\s*হয়েছে/gi, 'Order Cancelled')
      .replace(/অর্ডার\s*রিটার্ন\s*করা\s*হয়েছে/gi, 'Order Returned')
      .replace(/অর্ডার\s*আপডেট/gi, 'Order Update');

    // Convert common Bengali message patterns
    message = message
      .replace(/প্রিয়\s+([^,]+),\s*আপনার\s*অর্ডারটি\s*\(([^)]+)\)\s*(?:সফলভাবে\s*)?([^\।.]+)[।.]\s*মোট\s*বিল:\s*৳?(\d+)[।.]?/i, 
        'Dear $1, your order ($2) is $3. Total Bill: ৳$4.')
      .replace(/কনফার্মড\s*\(অনুমোদিত\)/gi, 'confirmed')
      .replace(/পেন্ডিং\s*\(অপেক্ষমান\)/gi, 'pending')
      .replace(/কনফার্ম\s*করা\s*হয়েছে/gi, 'confirmed')
      .replace(/প্রসেসিং\s*হচ্ছে/gi, 'processing')
      .replace(/কুরিয়ারে\s*পাঠানো\s*হয়েছে/gi, 'handed over to courier')
      .replace(/ডেলিভারি\s*সম্পন্ন\s*হয়েছে/gi, 'delivered')
      .replace(/বাতিল\s*করা\s*হয়েছে/gi, 'cancelled')
      .replace(/রিটার্ন\s*করা\s*হয়েছে/gi, 'returned');

    return { title, message };
  };

  const handleNotificationAction = (notif: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const orderId = getOrderIdFromNotification(notif);
    if (orderId) {
      setIsNotifOpen(false);
      if (setTrackingInput) setTrackingInput(orderId);
      if (setIsTrackingOpen) setIsTrackingOpen(true);
      if (handleTrackOrder) handleTrackOrder(orderId);
      return;
    }

    if (notif.link && typeof notif.link === 'string') {
      const link = notif.link.trim();
      if (link.startsWith('http://') || link.startsWith('https://')) {
        window.open(link, '_blank');
        return;
      }
      if (products && products.length > 0) {
        const prod = products.find((p: any) => p.id === link || p.slug === link);
        if (prod) {
          setIsNotifOpen(false);
          if (setSelectedProduct) setSelectedProduct(prod);
          if (setIsProductDetailsOpen) setIsProductDetailsOpen(true);
          return;
        }
      }
    }

    // Default close drawer gracefully
    setIsNotifOpen(false);
  };

  return (
    <>
      {isNotifOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotifOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col z-10"
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-black text-secondary text-base">Notifications</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ALL UPDATES ({notifications.length})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAllNotifications}
                    className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={() => setIsNotifOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3.5">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Bell size={32} />
                  </div>
                  <p className="text-sm font-black text-gray-400">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">New updates will appear here</p>
                </div>
              ) : (
                notifications.map((notif: any) => {
                  const orderId = getOrderIdFromNotification(notif);
                  const isOrderNotif = !!orderId;
                  const hasProductLink = !isOrderNotif && notif.link && products?.some((p: any) => p.id === notif.link || p.slug === notif.link);
                  const isWebLink = notif.link && (notif.link.startsWith('http://') || notif.link.startsWith('https://'));
                  const { title, message } = formatNotificationContent(notif);

                  return (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleNotificationAction(notif)}
                      className={`p-4 bg-gray-50/80 hover:bg-white rounded-2xl border transition-all relative group pr-8 cursor-pointer shadow-sm hover:shadow-md ${
                        isOrderNotif ? 'border-orange-100 hover:border-orange-300' : 'border-gray-100 hover:border-primary/20'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissNotification(notif.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors z-10"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                          isOrderNotif ? 'bg-orange-50 text-orange-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {isOrderNotif ? <Truck size={18} /> : (Info ? <Info size={18} /> : <Bell size={18} />)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {isOrderNotif && (
                            <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-md mb-1 uppercase tracking-wider">
                              <Truck size={10} /> Order Tracking
                            </div>
                          )}
                          <h4 className="text-sm font-black text-secondary mb-1 leading-snug">{title}</h4>
                          <p className="text-xs text-gray-600 leading-relaxed font-medium whitespace-pre-line">{message}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-tight">
                            <Clock size={10} /> 
                            {notif.createdAt ? 
                               (notif.createdAt.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : new Date(notif.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) 
                               : ""
                            }
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isOrderNotif ? (
                        <button 
                          type="button"
                          onClick={(e) => handleNotificationAction(notif, e)}
                          className="w-full mt-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-500/20 active:scale-[0.98]"
                        >
                          <Truck size={14} />
                          Track Order (View Location)
                        </button>
                      ) : hasProductLink ? (
                        <button 
                          type="button"
                          onClick={(e) => handleNotificationAction(notif, e)}
                          className="w-full mt-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all border border-primary/20"
                        >
                          <ShoppingBag size={14} />
                          View Product
                        </button>
                      ) : isWebLink ? (
                        <button 
                          type="button"
                          onClick={(e) => handleNotificationAction(notif, e)}
                          className="w-full mt-3 py-2 bg-gray-100 hover:bg-secondary text-gray-700 hover:text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <ExternalLink size={14} />
                          View Details
                        </button>
                      ) : null}
                    </motion.div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">রকমারি পণ্য হাড়ি - সবসময় আপনার পাশে</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
