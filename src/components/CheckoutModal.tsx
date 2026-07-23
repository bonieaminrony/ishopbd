import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, ChevronDown, ShoppingBag, X, Zap, Trash2, ArrowLeft, Phone, User, MapPin, Map, FileText, CheckCircle2, ShieldCheck, Truck, Ticket, Gift, Receipt } from 'lucide-react';

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
  setPaymentMethod?: any; // New prop!
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
  checkoutFirstName: any;
  setCheckoutFirstName: any;
  checkoutLastName: any;
  setCheckoutLastName: any;
  checkoutThana: any;
  setCheckoutThana: any;
  checkoutEmail: any;
  setCheckoutEmail: any;
  districtThanaMap?: any;
  couponCode?: string;
  setCouponCode?: any;
  couponError?: string;
  handleApplyCoupon?: any;
  appliedCoupon?: string | null;
  setAppliedCoupon?: any;
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
    setPaymentMethod, // Destructured!
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
    checkoutFirstName,
    setCheckoutFirstName,
    checkoutLastName,
    setCheckoutLastName,
    checkoutThana,
    setCheckoutThana,
    checkoutEmail,
    setCheckoutEmail,
    districtThanaMap,
    couponCode,
    setCouponCode,
    couponError,
    handleApplyCoupon,
    appliedCoupon,
    setAppliedCoupon,
  } = props;

  if (!isCheckoutOpen) return null;

  const [activePromoTab, setActivePromoTab] = React.useState<"coupon" | "voucher">("coupon");

  // Render payment method selector card helper
  const renderPaymentSelector = () => {
    if (!setPaymentMethod) return null;
    return (
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-gray-500">পেমেন্ট পদ্ধতি সিলেক্ট করুন (Payment Method) *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Cash on Delivery Card */}
          <div
            onClick={() => setPaymentMethod("cod")}
            className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === "cod"
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 hover:bg-gray-50 text-secondary"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-gray-150 text-secondary">💵</span>
              <div>
                <p className="text-xs font-bold leading-none">ক্যাশ অন ডেলিভারি</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">পণ্য পেয়ে মূল্য পরিশোধ করুন</p>
              </div>
            </div>
            {paymentMethod === "cod" && (
              <CheckCircle2 size={16} className="text-primary absolute top-2 right-2 fill-white" />
            )}
          </div>

          {/* Mobile Banking Card */}
          <div
            onClick={() => setPaymentMethod("bkash")} // bkash represents mobile banking flow
            className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              paymentMethod !== "cod"
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 hover:bg-gray-50 text-secondary"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-gray-150 text-secondary">📱</span>
              <div>
                <p className="text-xs font-bold leading-none">মোবাইল ব্যাংকিং</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">বিকাশ / নগদ / রকেট</p>
              </div>
            </div>
            {paymentMethod !== "cod" && (
              <CheckCircle2 size={16} className="text-primary absolute top-2 right-2 fill-white" />
            )}
          </div>

        </div>

        {/* Conditional Instructions for Mobile Banking */}
        {paymentMethod !== "cod" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50/60 border border-primary/10 rounded-xl text-[11px] text-primary/90 leading-relaxed font-medium space-y-2"
          >
            <p>📢 আমাদের পার্সোনাল নাম্বারে (যেমন: বিকাশ/নগদ/রকেট) পেমেন্ট সম্পন্ন করে দ্রুত ডেলিভারি পেতে পারেন।</p>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="bg-[#e2136e] text-white px-2 py-0.5 rounded font-black">bkash (01700-000000)</span>
              <span className="bg-[#f04f23] text-white px-2 py-0.5 rounded font-black">Nagad (01700-000000)</span>
            </div>
            <p className="text-gray-400 text-[9px] font-normal">অর্ডার সাবমিট করার পর আমাদের কাস্টমার প্রতিনিধি আপনার সাথে যোগাযোগ করে পেমেন্ট কনফার্ম করবেন।</p>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-300">
      <div className="w-full">
        
        {/* Step Progress Bar & Navigation Header */}
        <div className="mb-8">
          {/* Horizontal Step Timeline */}
          <div className="flex items-center justify-center max-w-lg mx-auto mb-6 px-4">
            <div className="flex items-center w-full">
              <div className="flex flex-col items-center relative text-gray-400">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-green-200">✓</div>
                <span className="text-[10px] font-bold mt-1 absolute -bottom-5 whitespace-nowrap">শপিং ব্যাগ</span>
              </div>
              <div className="flex-1 h-0.5 bg-green-500 mx-2 -mt-4"></div>
            </div>
            <div className="flex items-center w-full">
              <div className="flex flex-col items-center relative text-primary">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-red-200">২</div>
                <span className="text-[10px] font-bold mt-1 absolute -bottom-5 whitespace-nowrap">চেকআউট</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-200 mx-2 -mt-4"></div>
            </div>
            <div className="flex flex-col items-center relative text-gray-300">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center font-bold text-xs">৩</div>
              <span className="text-[10px] font-bold mt-1 absolute -bottom-5 whitespace-nowrap">অর্ডার সম্পন্ন</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200/50 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/10 text-primary p-2 rounded-lg">
                <ShoppingBag size={18} className="text-primary" />
              </span>
              <h1 className="text-lg md:text-xl font-bold text-secondary tracking-tight">চেকআউট (Checkout)</h1>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200 self-start sm:self-auto"
            >
              <ArrowLeft size={14} /> কেনাকাটা চালিয়ে যান
            </button>
          </div>
        </div>

        {isOrderSuccess ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <Award size={32} />
            </div>
            <h3 className="text-lg font-bold text-secondary mb-1">
              অর্ডার সফল হয়েছে!
            </h3>
            <p className="text-xs text-gray-500 mb-4 font-medium">
              আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।
            </p>
            {paymentMethod !== "cod" && (
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[11px] text-blue-700 leading-relaxed font-medium">
                আপনি বিকাশ/নগদ পেমেন্ট সিলেক্ট করেছেন। আমাদের টিম আপনার
                পেমেন্ট ভেরিফাই করে দ্রুত অর্ডারটি কনফার্ম করবে।
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Billing Form & Products (col-span-2) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Express Checkout Urgency Tag */}
              <div className="bg-gradient-to-r from-primary/10 via-red-500/5 to-transparent border border-primary/15 p-3 rounded-2xl flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <p className="text-xs font-bold text-secondary">
                  ⚡ <span className="text-primary">এক্সপ্রেস চেকআউট:</span> মাত্র ৩০ সেকেন্ডে আপনার অর্ডারটি সম্পন্ন করুন!
                </p>
              </div>

              {/* Shipping & Billing Form Card */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                  <div className="w-6 h-6 rounded bg-[#f05a28] flex items-center justify-center text-white">
                    <FileText size={14} />
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-secondary">
                    Shipping & Billing
                  </h2>
                </div>
                
                <form id="checkout-form" onSubmit={handleConfirmOrder} className="space-y-4">
                  
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-secondary mb-1.5">First Name</label>
                      <input
                        required
                        type="text"
                        placeholder="First Name*"
                        value={checkoutFirstName}
                        onChange={(e) => setCheckoutFirstName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary mb-1.5">Last Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Last Name*"
                        value={checkoutLastName}
                        onChange={(e) => setCheckoutLastName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5">Address</label>
                    <input
                      required
                      type="text"
                      placeholder="Address*"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* District & Upazila/Thana (Select dropdowns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                      <label className="block text-xs font-bold text-secondary mb-1.5">District</label>
                      <div className="relative">
                        <select
                          required
                          value={checkoutDistrict}
                          onChange={(e) => {
                            setCheckoutDistrict(e.target.value);
                            setCheckoutThana(""); // Reset Thana when District changes
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg pl-3.5 pr-10 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer text-gray-700 font-sans"
                        >
                          <option value="" disabled>Select District</option>
                          {ALL_DISTRICTS.map((dist: string, idx: number) => (
                            <option key={idx} value={dist}>
                              {dist === "Dhaka" ? "Dhaka - City" : dist}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown size={14} />
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full">
                      <label className="block text-xs font-bold text-secondary mb-1.5">Upazila/Thana</label>
                      <div className="relative">
                        <select
                          required
                          value={checkoutThana}
                          onChange={(e) => setCheckoutThana(e.target.value)}
                          disabled={!checkoutDistrict}
                          className="w-full bg-white border border-gray-200 rounded-lg pl-3.5 pr-10 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 font-sans"
                        >
                          <option value="" disabled>
                            {checkoutDistrict ? "Select Upazila/Thana" : "Select District First"}
                          </option>
                          {(districtThanaMap && checkoutDistrict ? (districtThanaMap[checkoutDistrict] || []) : []).map((thana: string, idx: number) => (
                            <option key={idx} value={thana}>
                              {thana}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <ChevronDown size={14} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative w-full">
                      <label className="block text-xs font-bold text-secondary mb-1.5">Mobile</label>
                      <input
                        required
                        type="tel"
                        placeholder="Telephone*"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        onFocus={() => setCheckoutPhoneFocused(true)}
                        onBlur={() => setTimeout(() => setCheckoutPhoneFocused(false), 250)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                      />
                      {checkoutPhoneFocused && savedProfiles.filter(p => p.phone.includes(checkoutPhone)).length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                          {savedProfiles.filter(p => p.phone.includes(checkoutPhone)).map((profile, index) => (
                            <div
                              key={index}
                              onMouseDown={() => {
                                setCheckoutPhone(profile.phone);
                                const nameParts = (profile.name || "").trim().split(/\s+/);
                                if (nameParts.length > 1) {
                                  setCheckoutFirstName(nameParts[0]);
                                  setCheckoutLastName(nameParts.slice(1).join(" "));
                                } else {
                                  setCheckoutFirstName(profile.name || "");
                                  setCheckoutLastName("");
                                }
                                if (profile.district) setCheckoutDistrict(profile.district);
                                if (profile.thana) setCheckoutThana(profile.thana);
                                if (profile.address) setCheckoutAddress(profile.address);
                              }}
                              className="px-3.5 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                            >
                              <span className="font-bold text-secondary">{profile.phone}</span>
                              {profile.name && <span className="text-gray-400 text-[10px]">{profile.name} - {profile.address}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary mb-1.5">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="E-Mail*"
                        value={checkoutEmail}
                        onChange={(e) => setCheckoutEmail(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-secondary mb-1.5">Comment</label>
                    <textarea
                      placeholder="Any special requirement/instruction for us?"
                      value={checkoutNote}
                      onChange={(e) => setCheckoutNote(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs focus:border-primary focus:ring-2 focus:ring-primary/5 outline-none transition-all resize-none placeholder:text-gray-400"
                    ></textarea>
                  </div>

                  {/* 3. New Modern Payment Method Section */}
                  {renderPaymentSelector()}

                </form>
              </div>


            </div>

            {/* Right Column: Order Summary & Products List (col-span-1) */}
            <div className="lg:col-span-1 sticky top-24 flex flex-col gap-4">
              
              {/* Products List Card */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm md:text-base font-bold text-secondary flex items-center gap-2">
                    <ShoppingBag size={16} className="text-secondary" /> আপনার অর্ডার করা পণ্যসমূহ
                  </h2>
                  <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    একসাথে একাধিক পণ্য কিনুন!
                  </span>
                </div>
                
                <div className="space-y-3">
                  {checkoutItems.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.color || 'no-color'}-${item.size || 'no-size'}-${idx}`}
                      className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-gray-50"
                    >
                      <img
                        src={item.variantImage || item.product.image}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200 cursor-pointer transition-transform hover:scale-105 self-center sm:self-auto"
                        alt={item.product.name}
                        loading="lazy"
                        onClick={() => {
                          setIsCheckoutOpen(false);
                          openProductDetails(item.product);
                        }}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p
                            className="text-xs md:text-sm font-bold text-secondary line-clamp-1 mb-0.5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              setIsCheckoutOpen(false);
                              openProductDetails(item.product);
                            }}
                          >
                            {item.product.name}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {item.color && (
                              <p className="text-[10px] font-medium text-gray-500">
                                কালার: <span className="text-primary font-bold">{item.color}</span>
                              </p>
                            )}
                            {item.size && (
                              <p className="text-[10px] font-medium text-gray-500">
                                সাইজ: <span className="text-blue-600 font-bold">{item.size}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-3">
                          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, -1, item.color, item.size)}
                              className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors text-xs font-bold border border-gray-100"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-secondary flex items-center justify-center gap-0.5 text-xs">
                              <span>{item.quantity}</span>
                              {item.product.unit && <span className="text-[9px] text-gray-400 font-medium">{item.product.unit}</span>}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, 1, item.color, item.size)}
                              className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white hover:bg-primary/95 transition-all text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-secondary font-bold text-xs md:text-sm">
                              ৳{getProductPrice(item.product, item.quantity) * item.quantity}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeItem(item.product.id, item.color, item.size)}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {checkoutItems.length > 1 && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-2.5">
                  <div className="p-1 bg-blue-500 text-white rounded-full mt-0.5">
                    <Award size={12} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-800 font-bold leading-tight">
                      {t("সতর্কতা: আপনি একসাথে একাধিক পণ্য ক্রয় করেছেন।", "Warning: You have purchased multiple products together.")}
                    </p>
                    <p className="text-[9px] text-blue-600 mt-0.5">
                      {t(
                        "আপনার অর্ডার করা সবগুলো পণ্য একসাথে ১টি প্যাকেটেই ঠিকানায় পৌঁছে দেয়া হবে।",
                        "All the products you ordered will be delivered to the address together in 1 packet."
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                <h3 className="text-sm md:text-base font-bold text-secondary pb-2 border-b border-gray-100 flex items-center gap-2">
                  <Receipt className="text-red-500" size={18} /> Order Summary
                </h3>

                {/* Get Some Extra Promo Box */}
                <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-secondary text-sm">Get Some Extra</h4>
                    <p className="text-gray-500 text-xs">Use coupon/voucher/star points</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActivePromoTab("coupon")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activePromoTab === "coupon" ? "bg-[#3B4DB2] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                    >
                      <Ticket size={14} /> Coupon
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePromoTab("voucher")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activePromoTab === "voucher" ? "bg-[#3B4DB2] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                    >
                      <Gift size={14} /> Gift Voucher
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={couponCode || ""}
                      onChange={(e) => setCouponCode?.(e.target.value)}
                      placeholder="Promo / Coupon Code"
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-20 text-sm focus:outline-none focus:border-[#3B4DB2]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="absolute right-0 top-0 bottom-0 px-4 bg-[#E8EDF5] text-[#3B4DB2] font-bold text-sm rounded-r-lg hover:bg-blue-100 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                </div>
                
                {availableRewardPoints > 0 && (
                  <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <span className="bg-primary text-white text-[7px] px-1 py-0.5 rounded-full font-black">GIFT</span>
                      <span className="text-[10px] font-bold text-primary">৳{availableRewardPoints} ডিসকাউন্ট</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={isApplyingRewardPoints} onChange={() => setIsApplyingRewardPoints(!isApplyingRewardPoints)} />
                      <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs md:text-sm font-medium text-gray-500">
                    <span>সাব-টোটাল (Subtotal)</span>
                    <span className="font-semibold text-secondary">৳{checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm font-medium text-gray-500">
                    <span>ডেলিভারি চার্জ (Delivery)</span>
                    <span className="font-semibold text-secondary">
                      {appliedCoupon ? (
                         "৳0 (Free)"
                      ) : (
                        `৳${(checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "double-district") ? 50 : checkoutDistrict ? 110 : 0}`
                      )}
                    </span>
                  </div>
                  {isApplyingRewardPoints && (
                    <div className="flex justify-between text-xs md:text-sm font-medium text-primary">
                      <span>রিওয়ার্ড ডিসকাউন্ট</span>
                      <span>-৳{Math.floor(availableRewardPoints / 10)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs md:text-sm font-medium text-green-600">
                      <span>কুপন ডিসকাউন্ট</span>
                      <span>-৳{(checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "double-district") ? 50 : checkoutDistrict ? 110 : 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs md:text-sm font-bold text-secondary pt-2.5 border-t border-gray-100">
                    <span>সর্বমোট (Total)</span>
                    <span className="text-primary text-base font-extrabold">
                      ৳{checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0) + (appliedCoupon ? 0 : ((checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "double-district") ? 50 : checkoutDistrict ? 110 : 0)) - (isApplyingRewardPoints ? Math.floor(availableRewardPoints / 10) : 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isOrderProcessing}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-sm py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 font-sans"
                  >
                    {isOrderProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        অর্ডার সম্পন্ন করুন <ArrowRight size={16} className="animate-pulse" />
                      </>
                    )}
                  </button>
                </div>

                {/* 4. Trust Badges / Security Indicators */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[9px] text-gray-400 font-bold">
                  <div className="flex items-center gap-1">
                    <ShieldCheck size={11} className="text-green-500" />
                    <span>১০০% অথেন্টিক</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-blue-500" />
                    <span>নিরাপদ চেকআউট</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck size={11} className="text-primary" />
                    <span>দ্রুত ডেলিভারি</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
