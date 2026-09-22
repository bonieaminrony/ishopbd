import React from 'react';
import { motion } from 'motion/react';
import { LayoutTemplate, Share2, Save, X, Plus, Zap, ThumbsUp, Truck, ShieldCheck, ShoppingCart, RefreshCcw } from 'lucide-react';
import { ImageCarousel } from './ui/ImageCarousel';
import { getYouTubeEmbedUrl } from '../utils/helpers';

export interface LandingPageEditorModalProps {
  landingEditorProduct: any;
  setLandingEditorProduct: (p: any) => void;
  copyLandingPageLink: (id: string) => void;
  saveLandingConfig: () => void;
  isSavingLandingConfig: boolean;
  landingEditorConfig: any;
  setLandingEditorConfig: React.Dispatch<React.SetStateAction<any>>;
  handleLandingEditorImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  landingPreviewTab: 'mobile' | 'desktop';
  setLandingPreviewTab: (tab: 'mobile' | 'desktop') => void;
}

export default function LandingPageEditorModal({
  landingEditorProduct,
  setLandingEditorProduct,
  copyLandingPageLink,
  saveLandingConfig,
  isSavingLandingConfig,
  landingEditorConfig,
  setLandingEditorConfig,
  handleLandingEditorImageUpload,
  landingPreviewTab,
  setLandingPreviewTab,
}: LandingPageEditorModalProps) {
  if (!landingEditorProduct) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-stretch justify-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="bg-white w-full max-w-7xl m-3 md:m-6 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg">Landing Page Setup</h2>
              <p className="text-purple-200 text-xs">{landingEditorProduct.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyLandingPageLink(landingEditorProduct.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              <Share2 size={15} /> লিংক কপি
            </button>
            <button
              onClick={saveLandingConfig}
              disabled={isSavingLandingConfig}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 rounded-xl text-sm font-black transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSavingLandingConfig ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              সেভ করুন
            </button>
            <button
              onClick={() => setLandingEditorProduct(null)}
              className="w-9 h-9 bg-white/20 hover:bg-white/40 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Body: Editor + Preview */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* === Left: Editor === */}
          <div className="w-full md:w-[420px] shrink-0 overflow-y-auto border-r border-gray-100 p-5 space-y-5 bg-gray-50 no-scrollbar">
            {/* Headline */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📢 টেক্সট কন্টেন্ট</h3>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">হেডলাইন</label>
                <input
                  type="text"
                  value={landingEditorConfig.headline || ""}
                  onChange={e => setLandingEditorConfig((p: any) => ({ ...p, headline: e.target.value }))}
                  placeholder={landingEditorProduct.name}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                />
                <p className="text-[10px] text-gray-400 mt-1">খালি রাখলে প্রোডাক্টের নাম দেখাবে</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">সাবহেডলাইন / বিবরণ</label>
                <textarea
                  value={landingEditorConfig.subheadline || ""}
                  onChange={e => setLandingEditorConfig((p: any) => ({ ...p, subheadline: e.target.value }))}
                  placeholder="প্রোডাক্ট সম্পর্কে সংক্ষিপ্ত বিবরণ"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-400 transition-all bg-gray-50 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ব্লক টেক্সট (লাল ব্লক)</label>
                <input
                  type="text"
                  value={landingEditorConfig.badgeText || ""}
                  onChange={e => setLandingEditorConfig((p: any) => ({ ...p, badgeText: e.target.value }))}
                  placeholder={`ধামাকা অফার! ${landingEditorProduct.discount || 0}% ছাড়`}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">অফার মূল্য (Landing Price)</label>
                  <input
                    type="number"
                    value={landingEditorConfig.priceOverride || ""}
                    onChange={e => setLandingEditorConfig((p: any) => ({ ...p, priceOverride: e.target.value }))}
                    placeholder={String(landingEditorProduct.price)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">আগের দাম (Old Price)</label>
                  <input
                    type="number"
                    value={landingEditorConfig.oldPriceOverride || ""}
                    onChange={e => setLandingEditorConfig((p: any) => ({ ...p, oldPriceOverride: e.target.value }))}
                    placeholder={String(landingEditorProduct.oldPrice || "")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">মার্কেটিং কপি / বিস্তারিত</label>
                <textarea
                  value={landingEditorConfig.bodyText || ""}
                  onChange={e => setLandingEditorConfig((p: any) => ({ ...p, bodyText: e.target.value }))}
                  placeholder="পণ্যের বিশেষত্ব, অফার বিবরণ, ব্যবহারবিধি ইত্যাদি"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-400 transition-all bg-gray-50 resize-none"
                />
              </div>
            </div>
            {/* Extra Images */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📸 অতিরিক্ত ইমেজ (সর্বোচ্চ ৩টি)</h3>
              <div className="grid grid-cols-3 gap-2">
                {(landingEditorConfig.extraImages || []).map((img: string, idx: number) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                    <img loading="lazy" decoding="async" src={img} className="w-full h-full object-cover" alt={`extra-${idx}`} />
                    <button
                      onClick={() => setLandingEditorConfig((p: any) => ({ ...p, extraImages: p.extraImages.filter((_: any, i: number) => i !== idx) }))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(landingEditorConfig.extraImages || []).length < 3 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-purple-500 transition-all">
                    <Plus size={20} />
                    <span className="text-[10px] font-bold">ছবি যোগ</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleLandingEditorImageUpload} />
                  </label>
                )}
              </div>
            </div>
            {/* YouTube Video URLs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📺 ইউটিউব ভিডিও লিংক</h3>
              <div className="space-y-3">
                {(landingEditorConfig.videoUrls || []).map((url: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={e => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: p.videoUrls.map((u: string, i: number) => i === idx ? e.target.value : u) }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: p.videoUrls.filter((_: string, i: number) => i !== idx) }))}
                      className="w-7 h-7 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {(landingEditorConfig.videoUrls || []).length < 3 && (
                  <button
                    onClick={() => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: [...(p.videoUrls || []), ""] }))}
                    className="w-full py-2 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> ভিডিও লিংক যোগ করুন
                  </button>
                )}
              </div>
            </div>
            {/* Feature Points */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">✅ ফিচার পয়েন্টস</h3>
              <div className="space-y-3">
                {(landingEditorConfig.features || []).map((feat: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <select
                        value={feat.icon}
                        onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, icon: e.target.value } : f) }))}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="zap">⚡ Zap</option>
                        <option value="thumbsup">👍 ThumbsUp</option>
                        <option value="truck">🚚 Truck</option>
                        <option value="shield">🛡️ Shield</option>
                      </select>
                      <button
                        onClick={() => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.filter((_: any, i: number) => i !== idx) }))}
                        className="w-6 h-6 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, title: e.target.value } : f) }))}
                      placeholder="ফিচার শিরোনাম"
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-purple-400"
                    />
                    <textarea
                      value={feat.desc}
                      onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, desc: e.target.value } : f) }))}
                      placeholder="বিবরণ"
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400 resize-none"
                    />
                  </div>
                ))}
                {(landingEditorConfig.features || []).length < 4 && (
                  <button
                    onClick={() => setLandingEditorConfig((p: any) => ({ ...p, features: [...(p.features || []), { icon: "zap", title: "", desc: "" }] }))}
                    className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> ফিচার যোগ করুন
                  </button>
                )}
              </div>
            </div>
            {/* Package/Weight Options */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📦 প্যাকেজ / ওজন অপশন</h3>
              <div className="space-y-3">
                {(landingEditorConfig.packages || []).map((pkg: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pkg.weight}
                      onChange={e => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.map((f: any, i: number) => i === idx ? { ...f, weight: e.target.value } : f) }))}
                      placeholder="যেমন: ১০ কেজি"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-purple-400"
                    />
                    <input
                      type="number"
                      value={pkg.price}
                      onChange={e => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.map((f: any, i: number) => i === idx ? { ...f, price: e.target.value } : f) }))}
                      placeholder="দাম"
                      className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={() => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.filter((_: any, i: number) => i !== idx) }))}
                      className="w-7 h-7 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setLandingEditorConfig((p: any) => ({ ...p, packages: [...(p.packages || []), { weight: "", price: "" }] }))}
                  className="w-full py-2 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> অপশন যোগ করুন
                </button>
              </div>
            </div>
            {/* Trust Badges Toggle */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold text-gray-700">ট্রাস্ট ব্লক দেখাবে?</span>
                <div
                  onClick={() => setLandingEditorConfig((p: any) => ({ ...p, showTrustBadges: !p.showTrustBadges }))}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${landingEditorConfig.showTrustBadges ? 'bg-purple-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${landingEditorConfig.showTrustBadges ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
              <p className="text-[10px] text-gray-400 mt-1">১০০% অরিজিনাল, ক্যাশ অন ডেলিভারি, রিপ্লেসমেন্ট ব্লক</p>
            </div>
          </div>
          {/* === Right: Live Preview === */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setLandingPreviewTab('mobile')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${landingPreviewTab === 'mobile' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500'}`}
              >📱 মোবাইল</button>
              <button
                onClick={() => setLandingPreviewTab('desktop')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${landingPreviewTab === 'desktop' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500'}`}
              >🖥️ ডেস্কটপ</button>
            </div>
            <div className={`bg-white shadow-2xl overflow-hidden overflow-y-auto ${landingPreviewTab === 'mobile' ? 'w-[360px] rounded-[2rem] border-4 border-gray-800 max-h-[600px]' : 'w-full max-w-2xl rounded-2xl border border-gray-200 max-h-[600px]'}`}>
              {/* Preview Header */}
              <div className="bg-white/95 shadow-sm px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                <span className="text-sm font-extrabold text-red-600">i SHOP <span className="text-gray-800">BD</span></span>
                <button className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ShoppingCart size={10} /> অর্ডার করুন
                </button>
              </div>
              {/* Preview Hero */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex gap-3 items-start">
                  {(() => {
                    const previewCarouselImages = [landingEditorProduct?.image, ...(landingEditorProduct?.images || [])].filter(Boolean);
                    return previewCarouselImages.length > 1 ? (
                      <div className="w-32 h-32 shrink-0 bg-white rounded-xl border border-gray-100">
                        <ImageCarousel images={previewCarouselImages} className="aspect-square rounded-xl h-full" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                        <img loading="lazy" decoding="async" src={landingEditorProduct.image} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                    );
                  })()}
                  <div className="space-y-2 flex-1">
                    <span className="inline-block bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                      {landingEditorConfig.badgeText || `ধামাকা অফার! ${(() => {
                        const p = landingEditorConfig.priceOverride ? Number(landingEditorConfig.priceOverride) : landingEditorProduct.price;
                        const o = landingEditorConfig.oldPriceOverride ? Number(landingEditorConfig.oldPriceOverride) : landingEditorProduct.oldPrice;
                        return o && p && o > p ? Math.round(((o - p) / o) * 100) : (landingEditorProduct.discount || 0);
                      })()}% ছাড়`}
                    </span>
                    <p className="font-black text-gray-900 text-sm leading-tight">
                      {landingEditorConfig.headline || landingEditorProduct.name}
                    </p>
                    {landingEditorConfig.subheadline && (
                      <p className="text-[10px] text-gray-500 leading-relaxed">{landingEditorConfig.subheadline}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {landingEditorConfig.oldPriceOverride || landingEditorProduct.oldPrice ? (
                        <span className="text-xs text-gray-400 line-through">৳{landingEditorConfig.oldPriceOverride || landingEditorProduct.oldPrice}</span>
                      ) : null}
                      <span className="text-base font-black text-red-600">৳{landingEditorConfig.priceOverride || landingEditorProduct.price}</span>
                    </div>
                  </div>
                </div>
                {/* Extra images preview */}
                {(landingEditorConfig.extraImages || []).length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {(landingEditorConfig.extraImages || []).map((img: string, i: number) => (
                      <div key={i} className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                        <img loading="lazy" decoding="async" src={img} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Preview Trust Badges */}
              {landingEditorConfig.showTrustBadges && (
                <div className="flex justify-around px-3 py-3 border-b border-gray-100 bg-gray-50">
                  {[
                    { icon: <ShieldCheck size={14} className="text-green-600" />, label: "১০০% অরিজিনাল" },
                    { icon: <Truck size={14} className="text-blue-600" />, label: "ক্যাশ অন ডেলিভারি" },
                    { icon: <RefreshCcw size={14} className="text-orange-500" />, label: "রিপ্লেসমেন্ট" },
                  ].map((b, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {b.icon}
                      <span className="text-[8px] font-bold text-gray-600">{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Preview Features */}
              <div className="p-4 space-y-2">
                {/* Image Carousel Preview */}
                {(() => {
                  const carouselImagesPreview = [...(landingEditorConfig.extraImages || [])].filter(Boolean);
                  return carouselImagesPreview.length > 1 ? (
                    <div className="mb-4">
                      <ImageCarousel images={carouselImagesPreview} />
                    </div>
                  ) : carouselImagesPreview.length === 1 ? (
                    <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                      <img loading="lazy" decoding="async" src={carouselImagesPreview[0]} className="w-full aspect-[16/9] object-contain bg-gray-50" alt="" />
                    </div>
                  ) : null;
                })()}
                <p className="text-[10px] font-black text-gray-800 text-center mb-3">কেন আমাদের প্রোডাক্টটি কিনবেন?</p>
                {landingEditorConfig.bodyText && (
                  <div className="bg-amber-50 rounded-lg p-2 mb-2">
                    <div className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-wrap">{landingEditorConfig.bodyText}</div>
                  </div>
                )}
                {/* YouTube Video Preview */}
                {(() => {
                  const previewVideoUrls = [...(landingEditorConfig.videoUrls || [])];
                  if (landingEditorProduct?.videoUrl && !previewVideoUrls.includes(landingEditorProduct.videoUrl)) {
                    previewVideoUrls.unshift(landingEditorProduct.videoUrl);
                  }
                  const validUrls = previewVideoUrls.filter(Boolean);
                  
                  return validUrls.length > 0 ? (
                    <div className="space-y-2 mb-2">
                      {validUrls.map((url: string, idx: number) => {
                        const embedUrl = getYouTubeEmbedUrl(url);
                        return embedUrl ? (
                          <div key={idx} className="aspect-video w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm">
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
                  ) : null;
                })()}
                {(landingEditorConfig.features || []).filter((f: any) => f.title).map((feat: any, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="shrink-0 mt-0.5">
                      {feat.icon === 'zap' && <Zap size={12} className="text-red-500" />}
                      {feat.icon === 'thumbsup' && <ThumbsUp size={12} className="text-red-500" />}
                      {feat.icon === 'truck' && <Truck size={12} className="text-blue-600" />}
                      {feat.icon === 'shield' && <ShieldCheck size={12} className="text-green-600" />}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-800">{feat.title}</p>
                      <p className="text-[8px] text-gray-500">{feat.desc.slice(0, 50)}{feat.desc.length > 50 ? '...' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Preview CTA */}
              <div className="p-4">
                <div className="bg-green-600 text-white text-[10px] font-black py-3 rounded-xl text-center">
                  অর্ডার কনফর্ম করুন (৳{landingEditorProduct.price + 60})
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">এটি একটি রিভিউ। আসল পেজে সম্পূর্ণ ফর্ম দেখাবে।</p>
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">পরিবর্তন সেভ করতে উপরে "সেভ করুন" বাটনে ক্লিক করুন।</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLandingEditorProduct(null)}
              className="px-5 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={saveLandingConfig}
              disabled={isSavingLandingConfig}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSavingLandingConfig ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              সেভ করুন
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
