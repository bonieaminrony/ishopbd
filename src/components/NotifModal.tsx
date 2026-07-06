import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock } from 'lucide-react';

export interface NotifModalProps {
  setIsNotifOpen: any;
  notifications: any;
  handleClearAllNotifications: any;
  handleDismissNotification: any;
  Info: any;
  products: any;
  setSelectedProduct: any;
  setIsProductDetailsOpen: any;
  toast: any;
  isNotifOpen: any;
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
  } = props;

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
              className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-secondary">নোটিফিকেশন</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ষ আপডেটaহ</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-xs font-black text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      সব মুছুন
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
              <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                      <Bell size={32} />
                    </div>
                    <p className="text-sm font-black text-gray-400">এখনো কোন নোটিফিকেশন নেই</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group pr-8"
                    >
                      <button
                        onClick={() => handleDismissNotification(notif.id)}
                        className="absolute top-3 right-3 p-1 hover:bg-white/80 rounded-lg text-gray-400 hover:text-red-500 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                        title="Action"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm mt-1 shrink-0">
                          <Info size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-secondary mb-1">{notif.title}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">{notif.message}</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
                            <Clock size={10} /> 
                            {notif.createdAt ? 
                               (notif.createdAt.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString("bn-BD", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : new Date(notif.createdAt).toLocaleDateString("bn-BD")) 
                               : ""
                            }
                          </p>
                        </div>
                      </div>
                      {notif.link && (
                         <button 
                            onClick={() => {
                               if (notif.link.startsWith("http")) {
                                  window.open(notif.link, "_blank");
                                  return;
                               }
                               setIsNotifOpen(false);
                               const prod = products.find(p => p.id === notif.link);
                               if(prod) {
                                  setSelectedProduct(prod);
                                  setIsProductDetailsOpen(true);
                               } else {
                                  toast.error("সঠিক সংখ্যা লিখুন।");
                               }
                            }}
                            className="w-full mt-3 py-2 bg-white text-primary text-[10px] font-black rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm"
                         >
                            বিস্তারিত দেখুন
                         </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                 <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">i SHOP BD - সব সময় আপনাদের পাশে</p>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
