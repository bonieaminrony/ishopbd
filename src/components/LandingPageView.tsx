import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  Download,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  ThumbsUp,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { ImageCarousel } from './ui/ImageCarousel';
import LandingDistrictModal from './LandingDistrictModal';
import { ALL_DISTRICTS, districtThanaMap } from '../constants/data';
import { cleanLatex, getYouTubeEmbedUrl } from '../utils/helpers';

export interface LandingPageViewProps {
  landingProduct: any;
  landingPackageIndex: number;
  setLandingPackageIndex: (idx: number) => void;
  getDeliveryCharge: (items: any[], area: any, coupon: any) => number;
  landingArea: any;
  setLandingArea: (area: any) => void;
  handleLandingCheckout: (e: React.FormEvent) => void;
  landingPhone: string;
  setLandingPhone: (phone: string) => void;
  landingPhoneFocused: boolean;
  setLandingPhoneFocused: (focused: boolean) => void;
  savedProfiles: any[];
  selectSavedProfile: (profile: any, type: 'inline' | 'checkout' | 'landing') => void;
  landingName: string;
  setLandingName: (name: string) => void;
  isLandingDistrictOpen: boolean;
  setIsLandingDistrictOpen: (open: boolean) => void;
  landingDistrictSearch: string;
  setLandingDistrictSearch: (q: string) => void;
  landingDistrict: string;
  setLandingDistrict: (district: string) => void;
  landingThana: string;
  setLandingThana: (thana: string) => void;
  isLandingThanaOpen: boolean;
  setIsLandingThanaOpen: (open: boolean) => void;
  landingThanaSearch: string;
  setLandingThanaSearch: (q: string) => void;
  landingAddress: string;
  setLandingAddress: (addr: string) => void;
  isLandingSubmitting: boolean;
  completedOrderReceipt: any;
  setCompletedOrderReceipt: (receipt: any) => void;
  receiptRef: React.RefObject<HTMLDivElement>;
  handleDownloadReceipt: () => void;
  isDownloadingReceipt: boolean;
}

export default function LandingPageView({
  landingProduct,
  landingPackageIndex,
  setLandingPackageIndex,
  getDeliveryCharge,
  landingArea,
  setLandingArea,
  handleLandingCheckout,
  landingPhone,
  setLandingPhone,
  landingPhoneFocused,
  setLandingPhoneFocused,
  savedProfiles,
  selectSavedProfile,
  landingName,
  setLandingName,
  isLandingDistrictOpen,
  setIsLandingDistrictOpen,
  landingDistrictSearch,
  setLandingDistrictSearch,
  landingDistrict,
  setLandingDistrict,
  landingThana,
  setLandingThana,
  isLandingThanaOpen,
  setIsLandingThanaOpen,
  landingThanaSearch,
  setLandingThanaSearch,
  landingAddress,
  setLandingAddress,
  isLandingSubmitting,
  completedOrderReceipt,
  setCompletedOrderReceipt,
  receiptRef,
  handleDownloadReceipt,
  isDownloadingReceipt,
}: LandingPageViewProps) {
  const lCfg = landingProduct.landingConfig || {};
  const baseOldPrice = lCfg.oldPriceOverride ? Number(lCfg.oldPriceOverride) : Number(landingProduct.oldPrice || 0);
  let oldPrice = baseOldPrice;
  let price = lCfg.priceOverride ? Number(lCfg.priceOverride) : Number(landingProduct.price || 0);
  const lPackages = lCfg.packages || [];
  if (lPackages.length > 0) {
    const idx = landingPackageIndex < lPackages.length ? landingPackageIndex : 0;
    if (lPackages[idx]) {
      if (lPackages[idx].price) {
        price = Number(lPackages[idx].price);
      }
      const weightStr = String(lPackages[idx].weight || '');
      const englishStr = weightStr.replace(/[০-৯]/g, (d: string) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
      const match = englishStr.match(/\d+(\.\d+)?/);
      if (match && baseOldPrice > 0) {
        const qty = parseFloat(match[0]);
        oldPrice = baseOldPrice * (qty > 0 ? qty : 1);
      }
    }
  }
  let discount = landingProduct.discount || 0;
  if (oldPrice && price && oldPrice > price) {
    discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  }
  const deliveryCharge = getDeliveryCharge([{ product: landingProduct, quantity: 1 }], landingArea, null);
  const totalAmount = price + deliveryCharge;
  const lExtraImages: string[] = lCfg.extraImages || [];
  const lBodyText = lCfg.bodyText || '';
  const lVideoUrls: string[] = [...(lCfg.videoUrls || [])];
  if (landingProduct.videoUrl && !lVideoUrls.includes(landingProduct.videoUrl)) {
    lVideoUrls.unshift(landingProduct.videoUrl);
  }
  const lShowTrustBadges = lCfg.showTrustBadges !== false;

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans relative overflow-x-hidden">
      <Helmet>
        <title>i SHOP BD (আই শপ বিডি) - Online Shopping in Bangladesh | Gadgets &amp; Electronics</title>
        <meta
          name="description"
          content="i SHOP BD (আই শপ বিডি) - বাংলাদেশের সেরা অনলাইন শপিং শপ। এখানে পাবেন লেটেস্ট গ্যাজেট, ইলেকট্রনিক্স এবং হোম এক্সেসরিজ সবচেয়ে কম দামে। দ্রুত হোম ডেলিভারি ও গুণগত মানের নিশ্চয়তা।"
        />
      </Helmet>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800 transition-all text-secondary dark:text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
            <img src="/logo.png" alt="i SHOP BD Logo" className="h-8 md:h-9 object-contain" />
          </a>
          <button
            onClick={() => {
              document.getElementById('landing-checkout-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary/95 text-white font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary/10 active:scale-95 flex items-center gap-1.5"
          >
            <ShoppingCart size={14} /> অর্ডার করুন
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50/50 py-12 md:py-20 border-b border-gray-100">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Product Gallery */}
          <div className="flex flex-col gap-4">
            {(() => {
              const heroCarouselImages = [landingProduct.image, ...(landingProduct.images || [])].filter(Boolean);
              return heroCarouselImages.length > 1 ? (
                <div className="aspect-square bg-white rounded-3xl border border-gray-100 shadow-xl w-full">
                  <ImageCarousel images={heroCarouselImages} className="aspect-square rounded-3xl" />
                </div>
              ) : (
                <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl flex items-center justify-center p-4">
                  <img
                    loading="lazy"
                    src={landingProduct.image}
                    className="max-h-[90%] max-w-[90%] object-contain"
                    alt={landingProduct.name}
                  />
                </div>
              );
            })()}
          </div>

          {/* Sales Copy */}
          <div className="space-y-6">
            <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
              ধামাকা অফার! {discount}% ছাড়
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-secondary leading-tight font-sans">
              {landingProduct.name}
            </h2>
            {landingProduct.description && (
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {cleanLatex(landingProduct.description || '')}
              </p>
            )}

            {/* Pricing Grid */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-center gap-8 max-w-sm mx-auto md:mx-0">
              {oldPrice ? (
                <>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-bold mb-2">আগের দাম</p>
                    <div className="relative inline-block px-2">
                      <span className="text-lg text-gray-400 font-bold">৳{oldPrice}</span>
                      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <motion.line
                          x1="-5%"
                          y1="105%"
                          x2="105%"
                          y2="-5%"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 0.35,
                            ease: 'easeInOut',
                            delay: 0.2,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            repeatDelay: 2.5,
                          }}
                        />
                        <motion.line
                          x1="-5%"
                          y1="-5%"
                          x2="105%"
                          y2="105%"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 0.35,
                            ease: 'easeInOut',
                            delay: 0.4,
                            repeat: Infinity,
                            repeatType: 'reverse',
                            repeatDelay: 2.5,
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-200" />
                </>
              ) : null}
              <div className="text-center">
                <p className="text-xs text-primary font-black mb-2">অফার মূল্য</p>
                <div className="relative inline-block px-4 py-1">
                  <span className="text-3xl font-black text-primary relative z-10">৳{price}</span>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <motion.ellipse
                      cx="50%"
                      cy="50%"
                      rx="70%"
                      ry="65%"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ transformOrigin: 'center', rotate: '-8deg' }}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.6,
                        ease: 'easeInOut',
                        delay: 0.65,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        repeatDelay: 2.5,
                      }}
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Direct Checkout Form */}
      <section id="landing-checkout-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-xl">
          {lPackages && lPackages.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-black text-gray-800 text-center">
                  পরিমাণ / প্যাকেজ সিলেক্ট করুন
                </h3>
                <div className="flex flex-col gap-3">
                  {lPackages.map((pkg: any, idx: number) => {
                    const isSelected = landingPackageIndex === idx;
                    const baseBg = idx % 2 === 0 ? 'bg-green-50/30' : 'bg-white';
                    return (
                      <div
                        key={idx}
                        onClick={() => setLandingPackageIndex(idx)}
                        className={`relative cursor-pointer border-2 p-3 md:p-4 flex items-center justify-between transition-all duration-300 ${
                          isSelected
                            ? 'rounded-[20px] border-green-500 bg-green-50/80 text-green-700 shadow-lg scale-[1.02]'
                            : `rounded-2xl border-gray-100 ${baseBg} hover:border-green-200`
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md font-bold">
                            ✓
                          </div>
                        )}
                        <div className="font-black text-sm md:text-base flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                              isSelected ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          {pkg.weight}
                        </div>
                        <div
                          className={`text-sm md:text-base ${
                            isSelected ? 'font-black text-green-700' : 'text-gray-600 font-bold'
                          }`}
                        >
                          ৳{pkg.price}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-primary text-white p-6 md:p-8 text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-black font-sans">অর্ডার নিশ্চিত করতে নিচের ফর্মটি পূরণ করুন</h3>
              <p className="text-white/80 text-xs font-medium">১ মিনিটে খুব সহজেই অর্ডারটি সম্পন্ন করুন</p>
            </div>

            <form onSubmit={handleLandingCheckout} className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">
                  মোবাইল নাম্বার *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={landingPhone}
                  onChange={(e) => setLandingPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  onFocus={() => setLandingPhoneFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setLandingPhoneFocused(false), 200);
                  }}
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all"
                />
                {landingPhoneFocused && savedProfiles.filter((p) => p.phone.includes(landingPhone)).length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                    {savedProfiles
                      .filter((p) => p.phone.includes(landingPhone))
                      .map((profile, index) => (
                        <div
                          key={index}
                          onMouseDown={() => selectSavedProfile(profile, 'landing')}
                          className="px-4 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                        >
                          <span className="font-bold text-secondary">{profile.phone}</span>
                          {profile.name && (
                            <span className="text-gray-400 text-[10px]">
                              {profile.name} - {profile.address}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  required
                  value={landingName}
                  onChange={(e) => setLandingName(e.target.value)}
                  placeholder="যেমন: মোঃ সাকিব হোসেন"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">
                    জেলা সিলেক্ট করুন *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      required
                      type="text"
                      placeholder="জেলা সিলেক্ট করুন"
                      value={isLandingDistrictOpen ? landingDistrictSearch : landingDistrict}
                      onChange={(e) => {
                        setLandingDistrictSearch(e.target.value);
                        setIsLandingDistrictOpen(true);
                      }}
                      onFocus={() => {
                        setLandingDistrictSearch('');
                        setIsLandingDistrictOpen(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsLandingDistrictOpen(false);
                          setLandingDistrictSearch('');
                        }, 200);
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-10 font-bold text-sm focus:border-primary outline-none transition-all"
                    />
                    <span className="absolute right-3 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                  {isLandingDistrictOpen && (
                    <LandingDistrictModal
                      ALL_DISTRICTS={ALL_DISTRICTS}
                      landingDistrictSearch={landingDistrictSearch}
                      setLandingDistrict={setLandingDistrict}
                      setLandingThana={setLandingThana}
                      setLandingArea={setLandingArea}
                      setIsLandingDistrictOpen={setIsLandingDistrictOpen}
                      landingDistrict={landingDistrict}
                      isLandingDistrictOpen={isLandingDistrictOpen}
                    />
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">
                    থানা/উপজেলা সিলেক্ট করুন *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      required
                      type="text"
                      placeholder={landingDistrict ? 'থানা সিলেক্ট করুন' : 'আগে জেলা সিলেক্ট করুন'}
                      value={isLandingThanaOpen ? landingThanaSearch : landingThana}
                      onChange={(e) => {
                        setLandingThanaSearch(e.target.value);
                        setIsLandingThanaOpen(true);
                      }}
                      onFocus={() => {
                        setLandingThanaSearch('');
                        setIsLandingThanaOpen(true);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsLandingThanaOpen(false);
                          setLandingThanaSearch('');
                        }, 200);
                      }}
                      disabled={!landingDistrict}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-10 font-bold text-sm focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                    />
                    <span className="absolute right-3 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </span>
                  </div>
                  {isLandingThanaOpen && landingDistrict && districtThanaMap[landingDistrict] && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                      {districtThanaMap[landingDistrict].filter((t) =>
                        t.toLowerCase().includes(landingThanaSearch.toLowerCase())
                      ).length > 0 ? (
                        districtThanaMap[landingDistrict]
                          .filter((t) => t.toLowerCase().includes(landingThanaSearch.toLowerCase()))
                          .map((t) => (
                            <div
                              key={t}
                              onMouseDown={() => {
                                setLandingThana(t);
                                setIsLandingThanaOpen(false);
                              }}
                              className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                landingThana === t ? 'bg-red-50 text-primary font-bold' : 'text-gray-700'
                              }`}
                            >
                              {t}
                            </div>
                          ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">থানা পাওয়া যায়নি</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">
                  সম্পূর্ণ ঠিকানা *
                </label>
                <textarea
                  required
                  rows={3}
                  value={landingAddress}
                  onChange={(e) => setLandingAddress(e.target.value)}
                  placeholder="যেমন: গ্রাম, বাসা নম্বর, রোড নম্বর, এলাকা"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <p>প্রোডাক্টের দাম</p>
                  <p>৳{price}</p>
                </div>
                <div className="flex justify-between text-gray-600">
                  <p>ডেলিভারি চার্জ</p>
                  <p>৳{deliveryCharge}</p>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex justify-between font-black text-lg text-secondary">
                  <p>সর্বমোট পরিশোধ করতে হবে</p>
                  <p className="text-primary">৳{totalAmount}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLandingSubmitting}
                className="w-full py-4.5 rounded-2xl bg-secondary text-white font-black text-sm hover:brightness-110 shadow-xl shadow-secondary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLandingSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={18} /> অর্ডার কনফর্ম করুন (৳{totalAmount})
                  </>
                )}
              </button>
            </form>

            {lShowTrustBadges && (
              <div className="grid grid-cols-3 gap-3 p-6 pt-0 border-t-0 mt-[-10px]">
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <ShieldCheck className="text-green-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">১০০% অরিজিনাল</p>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <Truck className="text-blue-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">ক্যাশ অন ডেলিভারি</p>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <RefreshCcw className="text-orange-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">রিপ্লেসমেন্ট গ্যারান্টি</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Long Copy Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-3xl space-y-12">
          {(() => {
            const carouselImages = [...lExtraImages].filter(Boolean);
            return carouselImages.length > 0 ? (
              <div className="mb-8">
                <ImageCarousel images={carouselImages} />
              </div>
            ) : null;
          })()}
          {lBodyText && (
            <div className="bg-amber-50 rounded-2xl p-6 md:p-8 mb-12 shadow-sm border border-amber-100/50">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium text-lg md:text-xl">
                {lBodyText}
              </div>
            </div>
          )}
          {lVideoUrls.filter(Boolean).length > 0 && (
            <div className="space-y-6 mb-12">
              {lVideoUrls.filter(Boolean).map((url, idx) => {
                const embedUrl = getYouTubeEmbedUrl(url);
                return embedUrl ? (
                  <div key={idx} className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                    <iframe
                      className="w-full h-full"
                      src={embedUrl}
                      title={`YouTube video ${idx + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null;
              })}
            </div>
          )}
          <div className="text-center space-y-4">
            <h3 className="text-2xl md:text-4xl font-black text-secondary font-sans">কেন আমাদের প্রোডাক্টটি কিনবেন?</h3>
            <div className="w-16 h-1.5 bg-primary rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                <Zap className="text-primary" size={18} /> প্রিমিয়াম কোয়ালিটি
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                আমরা সরাসরি কারখানা থেকে সেরা মান নিশ্চিত করে কাস্টমারকে প্রোডাক্টটি সরবরাহ করে থাকি।
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                <ThumbsUp className="text-primary" size={18} /> সহজ ব্যবহার উপযোগিতা
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                যেকোনো বয়সের মানুষের জন্য অত্যন্ত আরামদায়ক ও সহজ ডিজাইন নিশ্চিত করা হয়েছে।
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                <Truck className="text-primary" size={18} /> দ্রুত ডেলিভারি সুবিধা
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                অর্ডার করার ২৪ থেকে ৭২ ঘণ্টাএ° মধ্যে আমরা সরাসরি কাস্টমারের কাছে হোম ডেলিভারি দিয়ে থাকি।
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                <ShieldCheck className="text-primary" size={18} /> নিশ্চিন্তে ক্যাশ অন ডেলিভারি
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                প্রোডাক্ট হাতে পেয়ে কোয়ালিটি চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে তারপরে মূল্য পরিশোধ করার সুবিধা।
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-white/60 text-center py-8 border-t border-gray-800 text-xs font-bold">
        <p>© {new Date().getFullYear()} i SHOP BD. All Rights Reserved.</p>
      </footer>

      <AnimatePresence>
        {completedOrderReceipt && (
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
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <ShieldCheck size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-1">অর্ডার সফল হয়েছে!</h3>
                    <p className="text-green-600 text-sm font-medium">
                      অর্ডার আইডি: #{String(completedOrderReceipt.orderId || 'N/A').slice(-6).toUpperCase()}
                    </p>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                        <User size={18} className="text-primary" /> কাস্টমার বিবরণ
                      </h4>
                      <div className="space-y-3 text-sm">
                        <p>
                          <span className="font-bold text-gray-500">নাম:</span> {completedOrderReceipt.customerName}
                        </p>
                        <p>
                          <span className="font-bold text-gray-500">ফোন:</span> {completedOrderReceipt.customerPhone}
                        </p>
                        <p>
                          <span className="font-bold text-gray-500">ঠিকানা:</span> {completedOrderReceipt.address}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" /> প্রোডাক্ট বিবরণ
                      </h4>
                      <div className="space-y-3 mb-4">
                        {completedOrderReceipt.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                              <p className="font-bold text-secondary text-sm">{item.product?.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.quantity} টি</p>
                            </div>
                            <p className="font-black text-secondary text-sm">৳{item.product?.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <p>সাবটোটাল</p>
                          <p>৳{completedOrderReceipt.subtotal}</p>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <p>ডেলিভারি চার্জ</p>
                          <p>৳{completedOrderReceipt.deliveryCharge}</p>
                        </div>
                        <div className="flex justify-between font-black text-lg text-secondary pt-2 border-t">
                          <p>সর্বমোট</p>
                          <p className="text-primary">৳{completedOrderReceipt.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDownloadingReceipt ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  রিসিট ডাউনলোড
                </button>
                <button
                  onClick={() => {
                    setCompletedOrderReceipt(null);
                    const url = new URL(window.location.href);
                    url.searchParams.delete('landing');
                    window.history.pushState({}, '', url.toString());
                    window.location.reload();
                  }}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 font-black text-sm rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                >
                  হোম পেজে ফিরে যান
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
