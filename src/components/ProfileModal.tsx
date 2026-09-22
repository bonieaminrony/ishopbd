import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Camera, Wallet, Plus, ShieldCheck, User, History, RefreshCcw, LogOut, X, Award, Truck } from 'lucide-react';

export interface ProfileModalProps {
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  user: any;
  userProfile: any;
  handleProfileImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: any;
  setIsDepositModalOpen: (open: boolean) => void;
  isAdmin: boolean;
  setIsAdminOpen: (open: boolean) => void;
  profileTab: string;
  setProfileTab: (tab: string) => void;
  handleLogout: () => void;
  transactions: any[];
  orderHistory: any[];
  language?: string;
  getProductPrice: (product: any, quantity?: number) => number;
  setSelectedOrderForRefund: (order: any) => void;
  setRefundReason: (reason: string) => void;
  refundRequests: any[];
}

export default function ProfileModal({
  isProfileOpen,
  setIsProfileOpen,
  user,
  userProfile,
  handleProfileImageUpload,
  t,
  setIsDepositModalOpen,
  isAdmin,
  setIsAdminOpen,
  profileTab,
  setProfileTab,
  handleLogout,
  transactions,
  orderHistory,
  language = 'bn',
  getProductPrice,
  setSelectedOrderForRefund,
  setRefundReason,
  refundRequests,
}: ProfileModalProps) {
  if (!isProfileOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsProfileOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="relative bg-white w-full max-w-2xl h-[90vh] md:h-[700px] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10"
      >
        {/* Back button for mobile */}
        <button 
          onClick={() => setIsProfileOpen(false)}
          className="absolute top-4 right-4 z-[70] p-2 bg-secondary/50 hover:bg-secondary rounded-full text-white md:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        {/* Left Sidebar: Profile Summary */}
        <div className="w-full md:w-80 bg-secondary text-white p-8 flex flex-col overflow-y-auto no-scrollbar max-h-[40vh] md:max-h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative group/avatar">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 overflow-hidden border-2 border-white/20">
                {(userProfile?.photoURL || user?.photoURL) ? (
                  <img loading="lazy" decoding="async"
                    src={userProfile?.photoURL || user?.photoURL || ""} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.displayName?.[0] || "U"
                )}
              </div>
              <label 
                htmlFor="profile-pic-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity"
              >
                <Camera size={20} className="text-white" />
              </label>
              <input 
                type="file"
                id="profile-pic-upload"
                className="hidden"
                accept="image/*"
                onChange={handleProfileImageUpload}
              />
            </div>
            <div>
              <h3 className="font-black text-lg line-clamp-1">
                {user.displayName || "Customer"}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-1">
                {user.email?.endsWith("@mobile.user") 
                  ? user.email.replace("@mobile.user", "")
                  : user.email}
              </p>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="text-primary" size={20} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {t("ওয়ালেট ব্যালেন্স", "Wallet Balance")}
              </span>
            </div>
            <p className="text-3xl font-black text-white">
              ৳{userProfile?.balance || 0}
            </p>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full mt-4 bg-primary text-white py-2 rounded-xl text-xs font-black hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={16} /> {t("নতুন ব্যালেন্স যোগ করুন", "Add balance")}
            </button>
          </div>
          <div className="flex-1 space-y-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setIsProfileOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl bg-secondary text-white font-black text-sm flex items-center gap-3 shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-all"
              >
                <ShieldCheck size={18} /> {t("অ্যাডমিন প্যানেল", "Admin Panel")}
              </button>
            )}
            <button 
              onClick={() => setProfileTab("info")}
              className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "info" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
            >
              <User size={18} /> {t("প্রোফাইল তথ্য", "Profile Info")}
            </button>
            <button 
              onClick={() => setProfileTab("orders")}
              className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "orders" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
            >
              <History size={18} /> {t("অর্ডার হিস্ট্রি", "Order History")}
            </button>
            <button 
              onClick={() => setProfileTab("transactions")}
              className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "transactions" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
            >
              <Wallet size={18} /> {t("লেনদেনের ইতিহাস", "Transaction History")}
            </button>
            <button 
              onClick={() => setProfileTab("refunds")}
              className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "refunds" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
            >
              <RefreshCcw size={18} /> {t("রিফান্ড রিকোয়েস্ট", "Refund Request")}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="mt-8 flex items-center gap-3 text-red-400 hover:text-red-500 font-bold text-sm transition-colors"
          >
            <LogOut size={18} /> {t("লগআউট করুন", "Log Out")}
          </button>
        </div>
        {/* Right Content: Details & Transactions */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-secondary flex items-center gap-2">
              {profileTab === "transactions" && <><Wallet className="text-primary" size={24} /> {t("লেনদেনের ইতিহাস", "Transaction History")}</>}
              {profileTab === "orders" && <><History className="text-primary" size={24} /> {t("আপনার অর্ডারসমূহ", "Your Orders")}</>}
              {profileTab === "info" && <><User className="text-primary" size={24} /> {t("প্রোফাইল তথ্য", "Profile Info")}</>}
              {profileTab === "refunds" && <><RefreshCcw className="text-primary" size={24} /> {t("রিফান্ড রিকোয়েস্টসমূহ", "Refund Requests")}</>}
            </h4>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          {profileTab === "transactions" && (
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Wallet size={48} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-sm text-gray-400">{t("এখনো কোনো লেনদেন হয়নি", "No transactions yet")}</p>
                </div>
              ) : (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${tx.type === "deposit" || tx.type === "refund" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {tx.type === "deposit" && <ArrowDownLeft size={20} />}
                        {tx.type === "refund" && <RefreshCcw size={20} />}
                        {tx.type === "purchase" && <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-secondary">{tx.description} {tx.method && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1 uppercase">{tx.method}</span>}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-sm ${tx.type === "deposit" || tx.type === "refund" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "deposit" || tx.type === "refund" ? "+" : "-"} ৳{Math.abs(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {profileTab === "orders" && (
            <div className="space-y-6">
              {orderHistory.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <History size={48} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-sm text-gray-400">{t("আপনার কোনো অর্ডার নেই", "You have no orders")}</p>
                </div>
              ) : (
                orderHistory.map((order: any) => (
                  <div key={order.id} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID: #{String(order.displayId || order.id).slice(-6).toUpperCase()}</p>
                        <p className="text-xs font-bold text-gray-500">{order.date}</p>
                      </div>
                      {(() => {
                        let finalStatus = order.status || 'pending';
                        if (order.steadfastStatus) {
                          const st = order.steadfastStatus.toLowerCase();
                          if (st.includes('delivered')) finalStatus = 'delivered';
                          else if (st.includes('cancelled')) finalStatus = 'cancelled';
                          else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) finalStatus = 'shipped';
                        } else if (order.pathaoStatus) {
                          const st = order.pathaoStatus.toLowerCase();
                          if (st.includes('delivered')) finalStatus = 'delivered';
                          else if (st.includes('cancelled') || st.includes('return')) finalStatus = 'cancelled';
                          else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatch') || st.includes('pickup')) finalStatus = 'shipped';
                        }
                        
                        let bgColor = 'bg-amber-100 text-amber-700';
                        if (finalStatus === 'delivered') bgColor = 'bg-green-100 text-green-700';
                        else if (finalStatus === 'cancelled') bgColor = 'bg-red-100 text-red-700';
                        else if (finalStatus === 'shipped') bgColor = 'bg-blue-100 text-blue-700';
                        let label = finalStatus;
                        if (finalStatus === 'pending') label = t('প্রসেসিং এ আছে', 'Pending');
                        else if (finalStatus === 'processing') label = t('অর্ডারটি কনফার্ম করা হয়েছে', 'Confirmed');
                        else if (finalStatus === 'shipped') label = t('শিপমেন্ট করা হয়েছে', 'Shipped');
                        else if (finalStatus === 'delivered') label = t('ডেলিভার্ড', 'Delivered');
                        else if (finalStatus === 'cancelled') label = t('বাতিল করা হয়েছে', 'Cancelled');
                        return (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${bgColor}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="space-y-3">
                       {order.items?.map((item: any, idx: number) => (
                         <div key={idx} className="flex flex-col py-2 border-b border-gray-50 last:border-0">
                           <div className="flex justify-between text-base items-center">
                             <span className="text-[12px] font-black text-gray-900">{item.product?.name} <span className="text-lg font-black text-primary ml-2 italic">x{item.quantity}</span></span>
                             <span className="font-black text-secondary">৳{getProductPrice(item.product, item.quantity) * item.quantity}</span>
                           </div>
                           <div className="flex gap-2 mt-1">
                             {item.color && item.color !== "N/A" && (
                               <span className="text-[12px] font-black text-primary">
                                 {t("কালার", "Color")}: {item.color}
                               </span>
                             )}
                             {item.size && item.size !== "N/A" && (
                               <span className="text-[12px] font-black text-blue-600">
                                 {t("সাইজ", "Size")}: {item.size}
                               </span>
                             )}
                           </div>
                          </div>
                       ))}
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold">{t("মোট পেমেন্ট", "Total Payment")}</p>
                        <p className="text-lg font-black text-primary">৳{order.total}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {order.status === "delivered" && (
                          <button 
                            onClick={() => {
                              setSelectedOrderForRefund(order);
                              setRefundReason("");
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            {t("রিফান্ড রিকোয়েস্ট", "Refund Request")}
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end text-[10px] font-black text-primary mb-1">
                              <Truck size={12} /> {order.courierName || t("কুরিয়ার সার্ভিস", "Courier Service")}
                            </div>
                            <p className="text-[10px] font-bold text-gray-500">ID: {order.trackingId || t("প্রসেসিং", "Processing")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {profileTab === "refunds" && (
             <div className="space-y-6">
                {refundRequests.filter(r => r.userId === user.uid).length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <RefreshCcw size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-sm text-gray-400">{t("আপনার কোনো রিফান্ড রিকোয়েস্ট নেই", "You have no refund requests")}</p>
                  </div>
                ) : (
                  refundRequests.filter(r => r.userId === user.uid).map((refund: any) => (
                     <div key={refund.id} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">অর্ডার ID: #{String(refund.orderId).slice(-6).toUpperCase()}</p>
                              <p className="text-xs font-bold text-gray-500">{new Date(refund.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-US")}</p>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              refund.status === "approved" ? "bg-green-100 text-green-700" :
                              refund.status === "rejected" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                           }`}>
                              {refund.status === "approved" ? t("অ্যাপ্রুভড", "Approved") :
                               refund.status === "rejected" ? t("রিজেক্টেড", "Rejected") :
                               t("পেন্ডিং", "Pending")}
                           </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                           <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{t("রিফান্ড রিজন", "Refund Reason")}</p>
                           <p className="text-xs font-bold text-secondary">{refund.reason}</p>
                        </div>
                        <div className="flex justify-between items-center">
                           <p className="text-lg font-black text-primary">৳{refund.amount}</p>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("টোটাল রিফান্ড", "Total Refund")}</p>
                        </div>
                     </div>
                  ))
                )}
             </div>
          )}
          {profileTab === "info" && (
             <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
                  <User size={40} className="text-primary" />
                </div>
                <p className="font-black text-secondary text-lg mb-1">{user.displayName || t("কাস্টমার", "Customer")}</p>
                <p className="text-xs text-gray-400 mb-8">
                  {user.email?.endsWith("@mobile.user") 
                    ? user.email.replace("@mobile.user", "")
                    : user.email}
                </p>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-left shadow-sm">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t("ব্যালেন্স", "Balance")}</label>
                  <p className="text-2xl font-black text-primary">৳{userProfile?.balance || 0}</p>
                </div>
             </div>
          )}
          {/* Info Card */}
          <div className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
            <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg">
              <Award size={20} />
            </div>
            <div>
              <h5 className="font-bold text-blue-900 text-sm mb-1">
                {t("রিফান্ড পলিসি", "Refund Policy")}
              </h5>
              <p className="text-sm text-blue-800 leading-relaxed">
                {t(
                  "পেমেন্ট করার পর ট্রানজেকশন আইডিটি নিচে অটোমেটিক রিফান্ড করা হবে। এই টাকা ব্যবহার করে আপনি পরবর্তী যেকোনো অর্ডার করতে পারবেন।",
                  "After making payment, the transaction ID will be verified automatically. You can use this balance for any future orders."
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
