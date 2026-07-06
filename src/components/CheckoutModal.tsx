
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Award, ChevronDown, ShoppingBag, X, Zap } from 'lucide-react';

export interface CheckoutModalProps {
  ALL_DISTRICTS: any;
  availableRewardPoints: any;
  calculateTotal: any;
  checkoutAddress: any;
  checkoutDistrict: any;
  checkoutDistrictSearch: any;
  checkoutItems: any;
  checkoutName: any;
  checkoutNote: any;
  checkoutPhone: any;
  checkoutPhoneFocused: any;
  getProductPrice: any;
  handleConfirmOrder: any;
  isApplyingRewardPoints: any;
  isCheckoutDistrictOpen: any;
  isOrderProcessing: any;
  isOrderSuccess: any;
  openProductDetails: any;
  paymentMethod: any;
  removeItem: any;
  savedProfiles: any;
  setCheckoutAddress: any;
  setCheckoutDistrict: any;
  setCheckoutDistrictSearch: any;
  setCheckoutName: any;
  setCheckoutNote: any;
  setCheckoutPhone: any;
  setCheckoutPhoneFocused: any;
  setIsApplyingRewardPoints: any;
  setIsCheckoutDistrictOpen: any;
  setIsCheckoutOpen: any;
  t: any;
  toBengaliNumber: any;
  updateQuantity: any;
  isCheckoutOpen: any;
}

export default function CheckoutModal(props: CheckoutModalProps) {
  const {
    ALL_DISTRICTS,
    availableRewardPoints,
    calculateTotal,
    checkoutAddress,
    checkoutDistrict,
    checkoutDistrictSearch,
    checkoutItems,
    checkoutName,
    checkoutNote,
    checkoutPhone,
    checkoutPhoneFocused,
    getProductPrice,
    handleConfirmOrder,
    isApplyingRewardPoints,
    isCheckoutDistrictOpen,
    isOrderProcessing,
    isOrderSuccess,
    openProductDetails,
    paymentMethod,
    removeItem,
    savedProfiles,
    setCheckoutAddress,
    setCheckoutDistrict,
    setCheckoutDistrictSearch,
    setCheckoutName,
    setCheckoutNote,
    setCheckoutPhone,
    setCheckoutPhoneFocused,
    setIsApplyingRewardPoints,
    setIsCheckoutDistrictOpen,
    setIsCheckoutOpen,
    t,
    toBengaliNumber,
    updateQuantity,
    isCheckoutOpen,
  } = props;

  return (
    <>
      {isCheckoutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              {isOrderSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary mb-2">
                    অর্ডার সফল হয়েছে!
                  </h3>
                  <p className="text-gray-500 mb-4">
                    আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।
                  </p>
                  {paymentMethod !== "cod" && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed">
                      আপনি বিকাশ/নগদ পেমেন্ট সিলেক্ট করেছেন। আমাদের টিম আপনার
                      পেমেন্ট ভেরিফাই করে দ্রুত অর্ডারটি কনফার্ম করবে।
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                       <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
                          <ShoppingBag size={18} />
                       </span>
                       <h3 className="text-xl font-bold text-secondary">
                        অর্ডার কনফার্ম করুন
                       </h3>
                    </div>
                    <button
                      onClick={() => setIsCheckoutOpen(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
                    {/* Express Checkout Badge */}
                    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 p-3 rounded-2xl mb-6 flex items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-xl animate-bounce">
                        <Zap size={16} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Express Checkout</p>
                        <p className="text-xs font-bold text-secondary">মাত্র ১ মিনিটে অর্ডার সম্পন্ন করুন!</p>
                      </div>
                    </div>
                    {/* Products List */}
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          আপনার অর্ডার লিস্ট
                        </p>
                        <p className="text-[10px] text-primary font-bold animate-pulse">
                          একসাথে একাধিক পণ্য কিনুন!
                        </p>
                      </div>
                      {checkoutItems.map((item, idx) => (
                        <div
                          key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}-${idx}`}
                          className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-primary/10 shadow-sm transition-all hover:bg-red-50/10"
                        >
                          <img
                            src={item.variantImage || item.product.image}
                            className="w-20 h-20 rounded-xl object-cover shadow-sm cursor-pointer transition-transform hover:scale-105"
                            alt={item.product.name}
                            loading="lazy"
                            onClick={() => {
                              setIsCheckoutOpen(false);
                              openProductDetails(item.product);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-base font-black text-secondary line-clamp-1 mb-1 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => {
                                setIsCheckoutOpen(false);
                                openProductDetails(item.product);
                              }}
                            >
                              {item.product.name}
                            </p>
                            {item.color && (
                              <p className="text-xs font-bold text-gray-500 mb-1">
                                কালার:{" "}
                                <span className="text-primary text-[13px] font-black">
                                  {item.color}
                                </span>
                              </p>
                            )}
                            {item.size && (
                              <p className="text-xs font-bold text-gray-500 mb-1">
                                সাইজ:{" "}
                                <span className="text-blue-600 text-[13px] font-black">
                                  {item.size}
                                </span>
                              </p>
                            )}
                            <p className="text-primary font-extrabold text-lg">
                              ৳{item.product.price}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      -1,
                                      item.color,
                                      item.size,
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                  -
                                </button>
                                <span className="w-16 text-center font-extrabold text-secondary flex items-center justify-center gap-0.5 text-sm">
                                  <span>{item.quantity}</span>
                                  {item.product.unit && <span className="text-xs text-gray-500 font-bold">{item.product.unit}</span>}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id,
                                      1,
                                      item.color,
                                      item.size,
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-red-700 transition-all shadow-md active:scale-90"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.product.id, item.color, item.size)
                                }
                                className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                              >
                                বাদ দিন
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-4 border-t border-dashed border-gray-200 mt-4 px-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800">
                            সর্বমোট (Total)
                          </p>
                          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full">
                            {toBengaliNumber(checkoutItems.reduce(
                              (acc, curr) => acc + curr.quantity,
                              0,
                            ))}
                            টি পণ্য
                          </span>
                        </div>
                        <p className="text-xl font-extrabold text-primary">
                          ৳{calculateTotal()}
                        </p>
                      </div>
                    </div>
                    {checkoutItems.length > 1 && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3 shadow-sm transition-all animate-pulse">
                        <div className="p-1.5 bg-blue-500 text-white rounded-full shadow-md">
                          <Award size={14} />
                        </div>
                        <div>
                          <p className="text-xs text-blue-800 font-extrabold leading-tight">
                            {t("সতর্কতা: আপনি একসাথে একাধিক পণ্য ক্রয় করেছেন।", "Warning: You have purchased multiple products together.", "تحذير: لقد اشتريت منتجات متعددة معًا.", "انتباہ: آپ نے ایک ساتھ متعدد مصنوعات خریدی ہیں۔")}
                          </p>
                          <p className="text-[10px] text-blue-600 mt-1">
                            {t(
                              "আপনার অর্ডার করা সবগুলো পণ্য একসাথে ১টি প্যাকেটেই ঠিকানায় পৌঁছে দেয়া হবে।",
                              "All the products you ordered will be delivered to the address together in 1 packet.",
                              "سيتم توصيل جميع المنتجات التي طلبتها إلى العنوان معًا في عبوة واحدة.",
                              "آپ کی آرڈر کردہ تمام مصنوعات ایک ساتھ 1 پیکٹ میں پتے پر پہنچا دی جائیں گی۔"
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    <form onSubmit={handleConfirmOrder} className="bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100 mb-4 mt-auto">
                      <h4 className="text-base md:text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-primary" fill="currentColor" /> চেকআউট ফর্ম
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <input
                              id="checkout-phone-input"
                              required
                              type="tel"
                              placeholder="আপনার ফোন নম্বর"
                              value={checkoutPhone}
                              onChange={(e) => setCheckoutPhone(e.target.value)}
                              onFocus={() => setCheckoutPhoneFocused(true)}
                              onBlur={() => setTimeout(() => setCheckoutPhoneFocused(false), 250)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-primary outline-none transition-colors"
                            />
                            {checkoutPhoneFocused && savedProfiles.filter(p => p.phone.includes(checkoutPhone)).length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                                {savedProfiles.filter(p => p.phone.includes(checkoutPhone)).map((profile, index) => (
                                  <div
                                    key={index}
                                    onMouseDown={() => {
                                      setCheckoutPhone(profile.phone);
                                      if (profile.name) setCheckoutName(profile.name);
                                      if (profile.district) setCheckoutDistrict(profile.district);
                                      if (profile.address) setCheckoutAddress(profile.address);
                                    }}
                                    className="px-4 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                                  >
                                    <span className="font-bold text-secondary">{profile.phone}</span>
                                    {profile.name && <span className="text-gray-400 text-[10px]">{profile.name} - {profile.address}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input required type="text" placeholder="আপনার নাম" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-primary outline-none transition-colors" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <div className="relative flex items-center">
                              <input
                                required
                                type="text"
                                placeholder="জেলা সিলেক্ট করুন"
                                value={isCheckoutDistrictOpen ? checkoutDistrictSearch : checkoutDistrict}
                                onChange={(e) => {
                                  setCheckoutDistrictSearch(e.target.value);
                                  setIsCheckoutDistrictOpen(true);
                                }}
                                onFocus={() => {
                                  setCheckoutDistrictSearch("");
                                  setIsCheckoutDistrictOpen(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setIsCheckoutDistrictOpen(false);
                                    setCheckoutDistrictSearch("");
                                  }, 200);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:border-primary outline-none transition-colors"
                              />
                              <span className="absolute right-3 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                              </span>
                            </div>
                            {isCheckoutDistrictOpen && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                                {ALL_DISTRICTS
                                  .filter(d => d.toLowerCase().includes(checkoutDistrictSearch.toLowerCase()))
                                  .map((dist, idx) => (
                                    <div
                                      key={idx}
                                      onMouseDown={() => {
                                        setCheckoutDistrict(dist);
                                        setIsCheckoutDistrictOpen(false);
                                      }}
                                      className="px-4 py-2 hover:bg-orange-50 hover:text-orange-600 cursor-pointer text-sm border-b border-gray-50 last:border-none text-left flex items-center justify-between"
                                    >
                                      <span className="font-bold">{dist}</span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          <input id="checkout-address-input" required type="text" placeholder="সম্পূর্ণ ঠিকানা" value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-primary outline-none transition-colors" />
                        </div>
                        <textarea placeholder="কোনো নোট বা স্পেশাল ইন্সট্রাকশন থাকলে লিখুন (ঐচ্ছিক)" value={checkoutNote} onChange={(e) => setCheckoutNote(e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none"></textarea>
                        
                        {availableRewardPoints > 0 && (
                          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between mt-2 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">GIFT</span>
                              <span className="text-sm font-bold text-primary">আপনার {availableRewardPoints} রিওয়ার্ড পয়েন্ট আছে! (৳{availableRewardPoints} ছাড়)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input type="checkbox" className="sr-only peer" checked={isApplyingRewardPoints} onChange={() => setIsApplyingRewardPoints(!isApplyingRewardPoints)} />
                              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        )}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 mt-2 space-y-2">
                          <div className="flex justify-between text-sm font-bold text-gray-500">
                            <span>সাব-টোটাল</span>
                            <span>৳{checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-gray-500">
                            <span>ডেলিভারি চার্জ</span>
                            <span>
                              ৳{(checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "ঢাকা জেলা (বাইরে)") ? 50 : checkoutDistrict ? 110 : 0}
                            </span>
                          </div>
                          {isApplyingRewardPoints && (
                            <div className="flex justify-between text-sm font-bold text-primary">
                              <span>রিওয়ার্ড পয়েন্ট ডিসকাউন্ট</span>
                              <span>-৳{Math.floor(availableRewardPoints / 10)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-black text-secondary pt-2 border-t border-gray-200">
                            <span>সর্বমোট</span>
                            <span>৳{checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0) + ((checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "ঢাকা জেলা (বাইরে)") ? 50 : checkoutDistrict ? 110 : 0) - (isApplyingRewardPoints ? Math.floor(availableRewardPoints / 10) : 0)}</span>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isOrderProcessing}
                          className="w-full bg-primary text-white font-black text-lg py-4 rounded-xl shadow-[0_15px_35px_-10px_rgba(236,32,41,0.5)] hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                          {isOrderProcessing ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              অর্ডার সম্পন্ন করুন <ArrowRight size={20} className="animate-pulse" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
    </>
  );
}
