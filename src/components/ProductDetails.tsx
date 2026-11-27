import React from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Share2, Heart, Truck, Plus, Zap, ChevronDown, Check, ShoppingCart, Tag, Box, ShieldCheck, CheckCircle2, List, LayoutGrid, Camera, CreditCard, Link as LinkIcon, Bookmark, Info, MessageSquare, ArrowRight, Ruler } from 'lucide-react';
import { getProductPath } from '../utils/helpers';
import ProductSizeGuideInline from './ProductSizeGuide';
import MobileInlineOrderForm from './MobileInlineOrderForm';
import { MiniProductCard, OptionChip, OptionGroup, PillButton, RatingStars, Tabs } from './ui/ds';
import { shareLink } from '../utils/share';

export interface ProductDetailsProps {
  selectedProduct: any;
  setIsProductDetailsOpen: any;
  handleLikeProduct: any;
  likedProducts: any;
  ZoomableImage: any;
  modalDisplayImage: any;
  setModalDisplayImage: any;
  setUserInteractedWithGallery: any;
  getProductPrice: any;
  tempSelectedQty: any;
  colorValError: any;
  setTempSelectedColor: any;
  setColorValError: any;
  tempSelectedColor: any;
  sizeValError: any;
  setTempSelectedSize: any;
  setSizeValError: any;
  tempSelectedSize: any;
  setTempSelectedQty: any;
  Minus: any;
  handleInlineOrderSubmit: any;
  inlineOrderPhone: any;
  setInlineOrderPhone: any;
  setInlinePhoneFocused: any;
  inlinePhoneFocused: any;
  savedProfiles: any;
  selectSavedProfile: any;
  inlineOrderName: any;
  setInlineOrderName: any;
  isInlineDistrictOpen: any;
  inlineDistrictSearch: any;
  inlineOrderDistrict: any;
  setInlineDistrictSearch: any;
  setIsInlineDistrictOpen: any;
  InlineDistrictModal: any;
  isInlineThanaOpen: any;
  inlineThanaSearch: any;
  inlineOrderThana: any;
  setInlineThanaSearch: any;
  setIsInlineThanaOpen: any;
  districtThanaMap: any;
  setInlineOrderThana: any;
  inlineOrderAddress: any;
  setInlineOrderAddress: any;
  inlineOrderNote: any;
  setInlineOrderNote: any;
  availableRewardPoints: any;
  isApplyingRewardPoints: any;
  setIsApplyingRewardPoints: any;
  inlineOrderSuccess: any;
  validateSelections: any;
  addToCartInternal: any;
  siteConfig: any;
  isInlineOrderProcessing: any;
  getDeliveryCharge: any;
  inlineOrderArea: any;
  setWholesaleSizeQty: any;
  sumValues: any;
  wholesaleSizeQty: any;
  isInlineDistrictOpenWholesale: any;
  inlineDistrictSearchWholesale: any;
  ALL_DISTRICTS: any;
  setInlineOrderDistrict: any;
  setInlineOrderArea: any;
  isInlineThanaOpenWholesale: any;
  inlineThanaSearchWholesale: any;
  cleanLatex: any;
  activeReviews: any;
  isReviewsLoading?: boolean;
  setReviewForm: any;
  reviewForm: any;
  user: any;
  handleReviewImageUpload: any;
  submitReview: any;
  isSubmittingReview: any;
  relatedProducts: any;
  t: any;
  ProductCard: any;
  openProductDetails: any;
  handleBuyNow: any;
  isProductDetailsOpen: any;
  products: any[];
  searchQuery?: string;
}

export default function ProductDetails(props: ProductDetailsProps) {
  const {
    selectedProduct,
    setIsProductDetailsOpen,
    handleLikeProduct,
    likedProducts,
    ZoomableImage,
    modalDisplayImage,
    setModalDisplayImage,
    setUserInteractedWithGallery,
    getProductPrice,
    tempSelectedQty,
    colorValError,
    setTempSelectedColor,
    setColorValError,
    tempSelectedColor,
    sizeValError,
    setTempSelectedSize,
    setSizeValError,
    tempSelectedSize,
    setTempSelectedQty,
    Minus,
    handleInlineOrderSubmit,
    inlineOrderPhone,
    setInlineOrderPhone,
    setInlinePhoneFocused,
    inlinePhoneFocused,
    savedProfiles,
    selectSavedProfile,
    inlineOrderName,
    setInlineOrderName,
    isInlineDistrictOpen,
    inlineDistrictSearch,
    inlineOrderDistrict,
    setInlineDistrictSearch,
    setIsInlineDistrictOpen,
    InlineDistrictModal,
    isInlineThanaOpen,
    inlineThanaSearch,
    inlineOrderThana,
    setInlineThanaSearch,
    setIsInlineThanaOpen,
    districtThanaMap,
    setInlineOrderThana,
    inlineOrderAddress,
    setInlineOrderAddress,
    inlineOrderNote,
    setInlineOrderNote,
    availableRewardPoints,
    isApplyingRewardPoints,
    setIsApplyingRewardPoints,
    inlineOrderSuccess,
    validateSelections,
    addToCartInternal,
    siteConfig,
    isInlineOrderProcessing,
    getDeliveryCharge,
    inlineOrderArea,
    setWholesaleSizeQty,
    sumValues,
    wholesaleSizeQty,
    isInlineDistrictOpenWholesale,
    inlineDistrictSearchWholesale,
    ALL_DISTRICTS,
    setInlineOrderDistrict,
    setInlineOrderArea,
    isInlineThanaOpenWholesale,
    inlineThanaSearchWholesale,
    cleanLatex,
    activeReviews,
    isReviewsLoading = false,
    setReviewForm,
    reviewForm,
    user,
    handleReviewImageUpload,
    submitReview,
    isSubmittingReview,
    relatedProducts,
    t,
    ProductCard,
    openProductDetails,
    handleBuyNow,
    isProductDetailsOpen,
    products,
    searchQuery,
  } = props;

  const mobileQuery = '(max-width: 767px)';
  const [isMobileView, setIsMobileView] = React.useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(mobileQuery).matches : false,
  );
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(mobileQuery);
    const onChange = () => setIsMobileView(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  // On phones the first tab is "Related Products"; computers keep it in the right sidebar.
  const [activeTabRaw, setActiveTab] = React.useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(mobileQuery).matches ? 'related' : 'specification',
  );
  const activeTab = !isMobileView && activeTabRaw === 'related' ? 'specification' : activeTabRaw;
  const [aiRecommendations, setAiRecommendations] = React.useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  const [isOrderFormVisible, setIsOrderFormVisible] = React.useState(false);
  const [shareNote, setShareNote] = React.useState<string | null>(null);
  const handleShare = async () => {
    if (!selectedProduct) return;
    const result = await shareLink({
      title: selectedProduct.name,
      url: `${window.location.origin}${getProductPath(selectedProduct)}`,
    });
    if (result === 'copied') setShareNote(t("লিংক কপি হয়েছে", "Link copied"));
    else if (result === 'failed') setShareNote(t("শেয়ার করা যায়নি", "Could not share"));
  };
  React.useEffect(() => {
    if (!shareNote) return;
    const id = window.setTimeout(() => setShareNote(null), 2200);
    return () => window.clearTimeout(id);
  }, [shareNote]);
  const goToReviews = () => {
    setActiveTab('reviews');
    window.setTimeout(() => document.getElementById("product-description-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const isSaved = Boolean(selectedProduct && likedProducts?.includes(selectedProduct.id));
  const shareAndSave = (
    <>
      <PillButton icon={<Share2 size={15} />} onClick={handleShare}>{t("শেয়ার", "Share")}</PillButton>
      <PillButton
        active={isSaved}
        icon={<Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />}
        onClick={() => handleLikeProduct(selectedProduct.id)}
      >
        {isSaved ? t("সেভ করা", "Saved") : t("সেভ", "Save")}
      </PillButton>
    </>
  );


  // A product with only one color (or one size) needs no choosing: pick it automatically.
  React.useEffect(() => {
    const variants: any[] = Array.isArray(selectedProduct?.variants) ? selectedProduct.variants : [];
    const colors = Array.from(new Set(variants.map((v: any) => String(v?.name || '').trim()).filter(Boolean)));
    const sizes = Array.from(new Set(variants.map((v: any) => String(v?.size || '').trim()).filter(Boolean)));
    if (colors.length === 1 && !tempSelectedColor) { setTempSelectedColor(colors[0]); setColorValError(false); }
    if (sizes.length === 1 && !tempSelectedSize) { setTempSelectedSize(sizes[0]); setSizeValError(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id, tempSelectedColor, tempSelectedSize]);

  // Hide the sticky mobile order bar while the on-page order form is on screen.
  React.useEffect(() => {
    const el = document.getElementById("mobile-order-form");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setIsOrderFormVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [selectedProduct?.id]);

  const isClothingProduct = Boolean(
    selectedProduct?.showSizeGuide || (
      (selectedProduct?.category && /jacket|clothing|পোশাক|জ্যাকেট|winter|হুডি|hoodie|shirt|শার্ট|panjabi|পাঞ্জাবি|পাঞ্জাবী|t-shirt|টি-শার্ট|polo|পোলো|pant|প্যান্ট|ড্রপ শোল্ডার/i.test(selectedProduct.category)) ||
      (selectedProduct?.name && /jacket|জ্যাকেট|হুডি|hoodie|ব্লেজার|সোয়েটার|শার্ট|shirt|t-shirt|টি-শার্ট|polo|পোলো|পাঞ্জাবি|panjabi|পাঞ্জাবী|pant|প্যান্ট|ড্রপ শোল্ডার/i.test(selectedProduct.name)) ||
      (selectedProduct?.variants && selectedProduct.variants.some((v: any) => /^(S|M|L|XL|XXL|2XL|3XL|38|40|42|44)$/i.test(String(v.size || '').trim())))
    )
  );

  const mobileRelated = React.useMemo(() => {
    const seen = new Set<string>([selectedProduct?.id]);
    const list: any[] = [];
    for (const p of [...(aiRecommendations || []), ...(relatedProducts || [])]) {
      if (!p?.id || seen.has(p.id)) continue;
      seen.add(p.id);
      list.push(p);
      if (list.length >= 6) break;
    }
    return list;
  }, [aiRecommendations, relatedProducts, selectedProduct?.id]);

  const approvedReviews = React.useMemo(() => {
    if (!Array.isArray(activeReviews)) return [];
    return activeReviews.filter((r: any) => r.status === 'approved' || !r.status);
  }, [activeReviews]);

  React.useEffect(() => {
    if (!selectedProduct) return;

    let viewedIds: string[] = [];
    try {
      const stored = localStorage.getItem("ishopbd_viewed_products");
      if (stored) {
        viewedIds = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    
    const updatedViewed = [
      selectedProduct.id,
      ...viewedIds.filter(id => id !== selectedProduct.id)
    ].slice(0, 10);
    
    try {
      localStorage.setItem("ishopbd_viewed_products", JSON.stringify(updatedViewed));
    } catch (e) {
      console.error(e);
    }

    const fetchAiRecommendations = async () => {
      // First, set standard recommendations immediately so the UI doesn't hang
      setAiRecommendations(relatedProducts.slice(0, 5));
      setIsAiLoading(false); // Disable the skeleton loader immediately
      
      try {
        const res = await axios.post("/api/ai-recommendations", {
          currentProductId: selectedProduct.id,
          viewedProductIds: updatedViewed,
          searchQuery: searchQuery || ""
        }, { timeout: 5000 }); // reduced timeout

        if (res.data && Array.isArray(res.data.productIds) && res.data.productIds.length > 0) {
          const recommendedProds = res.data.productIds
            .map((id: string) => products.find(p => p.id === id))
            .filter(Boolean);
            
          if (recommendedProds.length > 0) {
            setAiRecommendations(recommendedProds);
          }
        }
      } catch (err) {
        // Silently fail and keep standard recommendations
        console.warn("AI recommendations unavailable or slow, using standard recommendations.");
      }
    };

    fetchAiRecommendations();
  }, [selectedProduct?.id, products, relatedProducts, searchQuery]);


  return (
    <>
          <div className="w-full min-h-screen pb-24 md:pb-0">
      <div className="w-full bg-white border-b border-gray-200/80 py-4 md:py-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-transparent w-full flex flex-col md:flex-row overflow-hidden"
          >
              {/* Product Image Gallery */}
              <div className="w-full md:w-1/2 bg-transparent flex flex-col items-center justify-start p-4 md:p-6 md:pt-4 border-b md:border-b-0 md:border-r border-gray-200 mt-4 md:mt-0">
                  <div className="mb-3 w-full flex items-center justify-between gap-2 md:hidden">
                    <RatingStars
                      rating={selectedProduct.rating}
                      count={Number(selectedProduct.reviewCount || 0)}
                      onClick={goToReviews}
                    />
                    <div className="flex items-center gap-2 shrink-0">{shareAndSave}</div>
                  </div>
                {(() => {
                  const isClothing = Boolean(
                    selectedProduct.showSizeGuide ||
                    (selectedProduct.category && /jacket|clothing|পোশাক|জ্যাকেট|winter|হুডি|hoodie|shirt|শার্ট|panjabi|পাঞ্জাবি/i.test(selectedProduct.category)) ||
                    (selectedProduct.name && /jacket|জ্যাকেট|হুডি|hoodie|ব্লেজার|সোয়েটার|শার্ট|shirt/i.test(selectedProduct.name))
                  );
                  return (
                    <div className={`relative w-full md:w-[85%] mx-auto aspect-square rounded-2xl overflow-hidden flex items-center justify-center group transition-colors ${
                      isClothing ? "bg-gradient-to-b from-gray-50/90 via-slate-50/40 to-gray-100/60 p-2" : "bg-gray-50"
                    }`}>
                      <ZoomableImage
                        keyId={modalDisplayImage || selectedProduct.image || selectedProduct.images?.[0]}
                        src={modalDisplayImage || selectedProduct.image || selectedProduct.images?.[0]}
                        alt={selectedProduct.name}
                        fit={isClothing ? "contain" : "cover"}
                      />
                      {selectedProduct.isFreeDelivery ? (
                        <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl z-10 flex items-center gap-1 border border-emerald-500/20">
                          <Truck size={12} /> Free Home Delivery
                        </div>
                      ) : (selectedProduct.deliveryCharge !== undefined && selectedProduct.deliveryCharge !== null && Number(selectedProduct.deliveryCharge) >= 0) ? (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl z-10 flex items-center gap-1 border border-blue-500/20">
                          <Truck size={12} /> ডেলিভারি চার্জ: ৳{selectedProduct.deliveryCharge} (সারা বাংলাদেশ)
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
                {/* Thumbnails */}
                {((selectedProduct.images &&
                  selectedProduct.images.length > 0) ||
                  (selectedProduct.variants &&
                    selectedProduct.variants.length > 0)) && (
                  <div className="flex gap-2 mt-6 overflow-x-auto p-2 no-scrollbar w-full justify-center">
                    {[
                      selectedProduct.image,
                      ...(selectedProduct.images || []),
                      ...(selectedProduct.variants || [])
                        .map((v) => v.image)
                        .filter(Boolean),
                    ]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setModalDisplayImage(img);
                            setUserInteractedWithGallery(true);
                          }}
                          className={`w-16 h-16 flex-shrink-0 rounded-2xl border-2 transition-all p-1 bg-white hover:scale-105 duration-300 ${
                            modalDisplayImage === img
                              ? "border-primary shadow-md"
                              : "border-transparent hover:border-gray-200"
                          }`}
                        >
                          <img loading="lazy"
                            src={img}
                            className="w-full h-full object-cover rounded-lg"
                            alt="Thumbnail"
                          />
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {/* Product Info */}
              <div className="w-full md:w-1/2 p-6 md:px-10 md:pb-10 md:pt-4 flex flex-col">
                
                <div className="mb-4">
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 gap-3">
                     {/* Breadcrumb Navigation */}
                     <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 font-medium min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                       <a href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                         Home
                       </a>
                       <span className="text-gray-300">/</span>
                       {selectedProduct.category && (
                         <>
                           <a 
                             href={`/category/${selectedProduct.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} 
                             className="hover:text-primary transition-colors"
                           >
                             {selectedProduct.category}
                           </a>
                           <span className="text-gray-300">/</span>
                         </>
                       )}
                       <span className="text-gray-800 font-semibold truncate min-w-0" title={selectedProduct.name}>
                         {selectedProduct.name}
                       </span>
                     </nav>

                     <div className="hidden md:flex items-center gap-2 shrink-0">
                       {shareAndSave}
                     </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl text-[#1a2b6d] font-bold mb-2 leading-snug">
                    {selectedProduct.name}
                  </h1>

                  {/* Short Description / Hook Tagline */}
                  {selectedProduct.shortDescription && (
                    <p className="mb-3 text-[14px] leading-relaxed text-gray-600">
                      {selectedProduct.shortDescription}
                    </p>
                  )}

                  {/* Pricing Section */}
                  <div className="flex items-baseline gap-3 mb-5 mt-2 flex-wrap">
                     <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                        ৳{Number(selectedProduct.price).toLocaleString('en-IN')}
                     </span>
                     {(selectedProduct.originalPrice || selectedProduct.oldPrice) && Number(selectedProduct.originalPrice || selectedProduct.oldPrice) > Number(selectedProduct.price) && (
                       <span className="text-lg text-gray-400 line-through font-normal">
                          ৳{Number(selectedProduct.originalPrice || selectedProduct.oldPrice).toLocaleString('en-IN')}
                       </span>
                     )}
                     {(selectedProduct.originalPrice || selectedProduct.oldPrice) && Number(selectedProduct.originalPrice || selectedProduct.oldPrice) > Number(selectedProduct.price) && (
                       <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/20">
                          {Math.round(((Number(selectedProduct.originalPrice || selectedProduct.oldPrice) - Number(selectedProduct.price)) / Number(selectedProduct.originalPrice || selectedProduct.oldPrice)) * 100)}% OFF
                       </span>
                     )}
                  </div>

                  {/* Badges as a unified grid bar */}
                  <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-gray-50/50 flex flex-wrap md:flex-nowrap divide-y md:divide-y-0 md:divide-x divide-gray-200/80 mb-6">
                     <div className="flex-grow flex-shrink-0 md:flex-1 px-4 py-3 flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-gray-700">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-gray-900 font-semibold">{
                            selectedProduct.isComingSoon ? "Pre-Order" :
                            ((selectedProduct.variants && selectedProduct.variants.length > 0 ? selectedProduct.variants.every(v => (Number(v.stock) || 0) <= 0) : (selectedProduct.stock !== undefined && selectedProduct.stock !== null ? Number(selectedProduct.stock) <= 0 : false))) ? "Out of Stock" : "In Stock"
                        }</span>
                     </div>
                     {selectedProduct.code && (
                       <div className="flex-grow flex-shrink-0 md:flex-1 px-4 py-3 flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-gray-700">
                          <span className="text-gray-400">Product Code:</span>
                          <span className="text-gray-900 font-semibold">{selectedProduct.code}</span>
                       </div>
                     )}
                     <div className="flex-grow flex-shrink-0 md:flex-1 px-4 py-3 flex items-center justify-center gap-1.5 text-xs md:text-sm font-medium text-gray-700">
                        <span className="text-gray-400">Brand:</span>
                        <span className="text-gray-900 font-semibold">{selectedProduct.brand || selectedProduct.category || "General"}</span>
                     </div>
                  </div>
                  
                  {/* Key Features Overview (Only show when features or specifications actually exist, e.g. for gadgets; hidden for clothing/empty) */}
                  {Boolean((selectedProduct.features && selectedProduct.features.trim().length > 0) || (selectedProduct.specifications && selectedProduct.specifications.length > 0)) && (
                    <div className="hidden md:block mt-5 mb-5 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                         <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                            মূল বৈশিষ্ট্যসমূহ (Key Features)
                         </h3>
                         <div className="text-xs md:text-sm text-gray-700 flex flex-col gap-2.5">
                            {(() => {
                               // 1. If key features exist, render them with bold titles
                               if (selectedProduct.features && selectedProduct.features.trim().length > 0) {
                                 const lines = selectedProduct.features.split('\n').filter((l: string) => l.trim().length > 0);
                                 return lines.map((line: string, idx: number) => {
                                   const cleanLine = line.replace(/^[-*•]\s*/, '');
                                   const colonIdx = cleanLine.indexOf(':');
                                   const hasColon = colonIdx > 0 && colonIdx < cleanLine.length - 1;
                                   const title = hasColon ? cleanLine.substring(0, colonIdx) : null;
                                   const detail = hasColon ? cleanLine.substring(colonIdx + 1).trim() : cleanLine;

                                   return (
                                     <div key={idx} className="flex items-start gap-2.5 pb-1 last:pb-0">
                                       <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary ring-4 ring-primary/10" />
                                       <div className="leading-relaxed">
                                         {title ? (
                                           <>
                                             <strong className="text-gray-900 font-bold mr-1">{title}:</strong>
                                             <span className="text-gray-600 font-medium">{detail}</span>
                                           </>
                                         ) : (
                                           <span className="text-gray-700 font-medium">{cleanLine}</span>
                                         )}
                                       </div>
                                     </div>
                                   );
                                 });
                               }
                               
                               // 2. Specifications list
                               const specs = selectedProduct.specifications || [];
                               if (specs.length > 0) {
                                 return specs.slice(0, 5).map((spec: any, idx: number) => (
                                   <div key={idx} className="flex gap-2 border-b border-gray-100 pb-1.5 last:border-b-0">
                                     <span className="text-gray-500 font-medium min-w-[120px]">{spec.name || spec.key}:</span>
                                     <span className="text-gray-900 font-semibold">{spec.value}</span>
                                   </div>
                                 ));
                               }

                               return null;
                            })()}
                         </div>
                         <button 
                           onClick={() => {
                             setActiveTab('specification');
                             setTimeout(() => {
                               const element = document.getElementById("product-description-tabs");
                               if (element) {
                                 const y = element.getBoundingClientRect().top + window.scrollY - 80;
                                 window.scrollTo({ top: y, behavior: "smooth" });
                               }
                             }, 50);
                           }}
                           className="text-primary text-xs font-bold hover:underline mt-3.5 inline-flex items-center gap-1"
                         >
                           সম্পূর্ণ স্পেসিফিকেশন ও বিবরণ দেখুন →
                          </button>
                      </div>
                  )}
                </div>
                <div className="flex flex-col gap-5 mb-2">
                  {/* Variant Selection */}
                  {(() => {
                    const variants: any[] = Array.isArray(selectedProduct.variants) ? selectedProduct.variants : [];
                    const colors = Array.from(new Set(variants.map((v: any) => String(v?.name || "").trim()).filter(Boolean))) as string[];
                    const sizes = Array.from(new Set(variants.map((v: any) => String(v?.size || "").trim()).filter(Boolean))) as string[];
                    const showStandaloneGuide = isClothingProduct && sizes.length === 0;
                    if (colors.length === 0 && sizes.length === 0 && !showStandaloneGuide) return null;
                    const sizeGuideButton = isClothingProduct ? (
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                        className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                      >
                        <Ruler size={14} />
                        {isSizeGuideOpen ? t("গাইড বন্ধ", "Close guide") : t("সাইজ গাইড", "Size guide")}
                      </button>
                    ) : null;
                    return (
                      <div className="flex flex-col gap-5">
                        {colors.length > 0 && (
                          <OptionGroup
                            id="color-selection-area"
                            title={t("কালার", "Color")}
                            value={tempSelectedColor}
                            placeholder={colors.length > 1 ? t("একটি বেছে নিন", "choose one") : ""}
                            error={colorValError}
                          >
                            {colors.map((colorName) => {
                              const swatch = variants.find((v: any) => String(v?.name || "").trim() === colorName && v?.image)?.image;
                              return (
                                <OptionChip
                                  key={colorName}
                                  selected={tempSelectedColor === colorName}
                                  image={swatch}
                                  onClick={() => {
                                    setTempSelectedColor(colorName);
                                    setColorValError(false);
                                    if (swatch) setModalDisplayImage(swatch);
                                  }}
                                >
                                  {colorName}
                                </OptionChip>
                              );
                            })}
                          </OptionGroup>
                        )}

                        {sizes.length > 0 && (
                          <OptionGroup
                            id="size-selection-area"
                            title={t("সাইজ", "Size")}
                            value={tempSelectedSize}
                            placeholder={sizes.length > 1 ? t("একটি বেছে নিন", "choose one") : ""}
                            action={sizeGuideButton}
                            error={sizeValError}
                            layout="grid4"
                          >
                            {sizes.map((size) => (
                              <OptionChip
                                key={size}
                                selected={tempSelectedSize === size}
                                className="sm:min-w-[60px]"
                                onClick={() => {
                                  setTempSelectedSize(size);
                                  setSizeValError(false);
                                }}
                              >
                                {size}
                              </OptionChip>
                            ))}
                          </OptionGroup>
                        )}
                        {showStandaloneGuide && <div className="flex justify-end">{sizeGuideButton}</div>}

                        {isClothingProduct && (
                          <ProductSizeGuideInline
                            isOpen={isSizeGuideOpen}
                            onClose={() => setIsSizeGuideOpen(false)}
                            onSelectSize={(size) => {
                              setTempSelectedSize(size);
                              setSizeValError(false);
                            }}
                            selectedSize={tempSelectedSize}
                            availableSizes={sizes}
                            productName={selectedProduct?.name}
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Quantity, cart and (computer) order button */}
                  <div className="w-full">
                    <p className="text-[14px] font-semibold text-gray-900 mb-2">{t("পরিমাণ", "Quantity")}:</p>
                    <div className="flex items-stretch gap-2.5 w-full">
                      <div className="flex items-center h-12 w-[136px] shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <button
                          type="button"
                          aria-label={t("কমান", "Decrease")}
                          onClick={() => setTempSelectedQty(Math.max(1, tempSelectedQty - 1))}
                          disabled={tempSelectedQty <= 1}
                          className="w-11 h-full flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30 touch-manipulation"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          aria-label={t("পরিমাণ", "Quantity")}
                          value={tempSelectedQty === 0 ? "" : tempSelectedQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setTempSelectedQty(val);
                            else if (e.target.value === "") setTempSelectedQty(0);
                          }}
                          onBlur={() => {
                            if (tempSelectedQty < 1) setTempSelectedQty(1);
                          }}
                          className="w-full h-full text-center bg-transparent font-bold text-[16px] text-gray-900 outline-none border-x border-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={t("বাড়ান", "Increase")}
                          onClick={() => setTempSelectedQty(tempSelectedQty + 1)}
                          className="w-11 h-full flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!validateSelections()) return;
                          const isWholesale = selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty);
                          if (isWholesale && sumValues(wholesaleSizeQty) !== tempSelectedQty) {
                            alert("Please select the correct quantity for sizes/colors.");
                            return;
                          }
                          addToCartInternal(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty);
                        }}
                        className="flex-1 md:flex-none md:w-[160px] h-12 rounded-xl border border-gray-300 bg-white text-gray-800 font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                      >
                        <ShoppingCart size={17} />
                        <span>{t("কার্টে রাখুন", "Add to Cart")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!validateSelections()) return;
                          const isWholesale = selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty);
                          if (isWholesale && sumValues(wholesaleSizeQty) !== tempSelectedQty) {
                            alert("Please select the correct quantity for sizes/colors.");
                            return;
                          }
                          handleBuyNow(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty, isWholesale ? wholesaleSizeQty : undefined);
                          setIsProductDetailsOpen(false);
                        }}
                        className="hidden md:flex flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base items-center justify-center shadow-lg shadow-primary/20"
                      >
                        {t("অর্ডার দিন", "Order Now")}
                      </button>
                    </div>
                  </div>
                </div>
                  {selectedProduct.wholesaleTiers && selectedProduct.wholesaleTiers.length > 0 && (
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner mb-8 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                         <Tag size={20} className="text-secondary" />
                         <h4 className="text-lg md:text-xl font-bold text-secondary uppercase tracking-normal">Wholesale Price Chart</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {selectedProduct.wholesaleTiers.sort((a, b) => a.minQty - b.minQty).map((tier, idx) => (
                           <button 
                             key={idx} 
                             onClick={() => {
                                if (tempSelectedQty >= tier.minQty && (!selectedProduct.wholesaleTiers?.find(t => t.minQty > tier.minQty && tempSelectedQty >= t.minQty))) {
                                  setTempSelectedQty(1);
                                } else {
                                  setTempSelectedQty(tier.minQty);
                                }
                                setWholesaleSizeQty({});
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                                tempSelectedQty >= tier.minQty && (!selectedProduct.wholesaleTiers?.find(t => t.minQty > tier.minQty && tempSelectedQty >= t.minQty))
                                ? "bg-primary/10 border-primary/30 shadow-sm" 
                                : "bg-white border-gray-100 shadow-sm hover:border-primary/40 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  tempSelectedQty >= tier.minQty && (!selectedProduct.wholesaleTiers?.find(t => t.minQty > tier.minQty && tempSelectedQty >= t.minQty))
                                  ? "bg-primary animate-pulse" : "bg-gray-200"
                                }`} />
                                <span className="text-xs font-medium text-gray-700">{tier.minQty}+ Pcs</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-gray-400">৳</span>
                                <span className={`text-sm font-bold ${
                                  tempSelectedQty >= tier.minQty && (!selectedProduct.wholesaleTiers?.find(t => t.minQty > tier.minQty && tempSelectedQty >= t.minQty))
                                  ? "text-primary transition-all scale-110" : "text-secondary"
                                }`}>{tier.price}</span>
                              </div>
                            </button>
                         ))}
                       </div>
                       {/* Size/Color quantities for wholesale */}
                       {selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty) && (
                         <div className="mt-4 p-4 bg-white rounded-xl border border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                           <p className="text-xs font-medium text-gray-900 mb-3 flex items-center justify-between">
                             {["cloth", "t-shirt", "shirt", "panjabi", "fashion", "saree", "shoes", "polo", "pant", "jeans", "top", "dress", "kurti"].some(k => (selectedProduct.category?.toLowerCase() || "").includes(k)) ? <span>How many pcs per size?</span> : <span>How many pcs per color?</span>}
                             <span className={"text-[10px] px-2 py-0.5 rounded-full " + (sumValues(wholesaleSizeQty) === tempSelectedQty ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                               Total: {sumValues(wholesaleSizeQty)}/{tempSelectedQty}
                             </span>
                           </p>
                           <div className="grid grid-cols-3 gap-2">
                             {(() => {
                               const cat = selectedProduct.category?.toLowerCase() || "";
                               const clothingKeywords = ["cloth", "t-shirt", "shirt", "panjabi", "fashion", "saree", "shoes", "polo", "pant", "jeans", "top", "dress", "kurti"];
                               const isClothing = clothingKeywords.some(keyword => cat.includes(keyword));
                               
                               const options = isClothing 
                                 ? [...new Set(selectedProduct.variants?.map(v => v.size).filter(s => s && s !== "N/A"))]
                                 : [...new Set(selectedProduct.variants?.map(v => v.name).filter(c => c && c !== "Default"))].length > 0
                                   ? [...new Set(selectedProduct.variants?.map(v => v.name).filter(c => c && c !== "Default"))]
                                   : ["Default"];
                               
                               return options.map((opt) => (
                                 <div key={String(opt)} className="space-y-1">
                                   <label className="text-[9px] font-bold text-gray-400 uppercase text-center block leading-none truncate">{String(opt)}</label>
                                   <input
                                     type="number"
                                     min="0"
                                     value={wholesaleSizeQty[String(opt)] || ""}
                                     onChange={(e) => {
                                       const val = parseInt(e.target.value) || 0;
                                       setWholesaleSizeQty(prev => ({ ...prev, [String(opt)]: val }));
                                     }}
                                     placeholder="Qty"
                                     className="w-full bg-gray-50/50 border border-gray-100 rounded-lg py-1.5 px-2 text-center text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                                   />
                                 </div>
                               ));
                             })()}
                           </div>
                           {sumValues(wholesaleSizeQty) !== tempSelectedQty && (
                             <p className="text-[9px] text-primary font-bold mt-2 animate-pulse">
                               * Please fulfill exactly {tempSelectedQty} pcs
                             </p>
                           )}
                         </div>
                       )}
                    </div>
                  )}

                  <MobileInlineOrderForm
                    product={selectedProduct}
                    qty={tempSelectedQty}
                    color={tempSelectedColor || undefined}
                    size={tempSelectedSize || undefined}
                    getProductPrice={getProductPrice}
                    getDeliveryCharge={getDeliveryCharge}
                    name={inlineOrderName}
                    setName={setInlineOrderName}
                    phone={inlineOrderPhone}
                    setPhone={setInlineOrderPhone}
                    address={inlineOrderAddress}
                    setAddress={setInlineOrderAddress}
                    area={inlineOrderArea}
                    setArea={setInlineOrderArea}
                    savedProfiles={savedProfiles}
                    selectSavedProfile={selectSavedProfile}
                    onSubmit={handleInlineOrderSubmit}
                    isProcessing={Boolean(isInlineOrderProcessing)}
                    wholesaleMismatch={Boolean(selectedProduct.wholesaleTiers?.some((tier: any) => tempSelectedQty >= tier.minQty)) && sumValues(wholesaleSizeQty) !== tempSelectedQty}
                  />
              </div>
          </motion.div>
        </div>
      </div>

      {/* Star Tech Style Tabs & Sidebar Layout */}
      <div className="w-full bg-[#f2f4f8]/40 pt-1 pb-8 border-t border-gray-200/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="product-description-tabs">
             <div className="lg:col-span-3">
                  {/* Tabs Header */}
                  <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    items={[
                      ...(isMobileView && mobileRelated.length > 0 ? [{ id: 'related', label: t("সম্পর্কিত পণ্য", "Related") }] : []),
                      ...(selectedProduct.videoUrl ? [{ id: 'video', label: t("ভিডিও", "Video") }] : []),
                      { id: 'specification', label: t("স্পেসিফিকেশন", "Specification") },
                      { id: 'description', label: t("বিবরণ", "Description") },
                      { id: 'reviews', label: t("রিভিউ", "Reviews"), count: isReviewsLoading ? undefined : approvedReviews.length },
                    ]}
                  />

                  {/* Tabs Content */}
                  <div className={`mt-3 ${activeTab === 'related' ? '' : 'bg-white rounded-2xl border border-gray-200 p-4 md:p-6 md:min-h-[320px]'}`}>
                    
                    {/* RELATED PRODUCTS TAB (phones only) */}
                    {activeTab === 'related' && (
                      <div className="grid grid-cols-2 gap-3">
                        {mobileRelated.map((product) => (
                          <MiniProductCard
                            key={product.id}
                            href={getProductPath(product)}
                            image={product.image}
                            name={product.name}
                            price={Number(product.price)}
                            oldPrice={Number(product.originalPrice || product.oldPrice) || undefined}
                            discount={Number(product.discount) || undefined}
                            onOpen={(e) => { e.preventDefault(); openProductDetails(product); }}
                          />
                        ))}
                      </div>
                    )}

                    {/* VIDEO TAB */}
                    {activeTab === 'video' && selectedProduct.videoUrl && (
                      <div className="animate-in fade-in duration-300">
                        <div className="mb-4 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="red" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"/>
                          </svg>
                          <h2 className="text-lg font-bold text-gray-800">Product Video</h2>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900 shadow-lg" style={{ paddingTop: '56.25%' }}>
                          {(() => {
                            let embedUrl = selectedProduct.videoUrl;
                            if (embedUrl) {
                              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                              const match = embedUrl.match(regExp);
                              if (match && match[2].length === 11) {
                                embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                              }
                            }
                            return (
                              <iframe
                                src={embedUrl}
                                className="absolute top-0 left-0 w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Product Video"
                              ></iframe>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* SPECIFICATION TAB */}
                    {activeTab === 'specification' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Specification</h2>
                        
                        {(selectedProduct.modelName || selectedProduct.features || selectedProduct.inTheBox) && (
                          <div className="mb-8">
                            <div className="bg-blue-50/50 px-4 py-2 text-[#2e3192] font-bold rounded mb-4">Basic Information</div>
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                                {selectedProduct.modelName && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">Model</div>
                                    <div className="col-span-2 p-3 text-sm text-gray-900 font-medium">{selectedProduct.modelName}</div>
                                  </div>
                                )}
                                {selectedProduct.features && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">Features</div>
                                    <div className="col-span-2 p-3 text-sm text-gray-900 font-medium whitespace-pre-wrap">{selectedProduct.features}</div>
                                  </div>
                                )}
                                {selectedProduct.warranty && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">Warranty</div>
                                    <div className="col-span-2 p-3 text-sm text-gray-900 font-medium">{selectedProduct.warranty}</div>
                                  </div>
                                )}
                                {selectedProduct.inTheBox && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">In The Box</div>
                                    <div className="col-span-2 p-3 text-sm text-gray-900 font-medium whitespace-pre-wrap">{selectedProduct.inTheBox}</div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                        {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                          <div>
                            <div className="bg-blue-50/50 px-4 py-2 text-[#2e3192] font-bold rounded mb-4">Detailed Specifications</div>
                            <div className="border border-gray-100 rounded-lg overflow-hidden">
                              {selectedProduct.specifications.map((spec, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                  <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">{spec.name || spec.key}</div>
                                  <div className="col-span-2 p-3 text-sm text-gray-900 font-medium">{spec.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(!selectedProduct.modelName && !selectedProduct.features && !selectedProduct.inTheBox && (!selectedProduct.specifications || selectedProduct.specifications.length === 0)) && (
                          <div className="text-gray-500 py-8 text-center italic">No specifications available for this product.</div>
                        )}
                      </div>
                    )}

                    {/* DESCRIPTION TAB */}
                    {activeTab === 'description' && (
                      <div className="animate-in fade-in duration-300 space-y-6">
                        {/* 1. Short Description Callout */}
                        {selectedProduct.shortDescription && (
                          <div className="bg-gradient-to-r from-red-50/80 via-amber-50/30 to-white p-4 md:p-5 rounded-2xl border border-red-100/80 text-sm md:text-base text-gray-800 font-medium leading-relaxed shadow-xs">
                            <span className="text-primary font-bold text-lg mr-2">❝</span>
                            {selectedProduct.shortDescription}
                            <span className="text-primary font-bold text-lg ml-2">❞</span>
                          </div>
                        )}

                        {/* 2. Key Features Highlights */}
                        {selectedProduct.features && (
                          <div className="bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3.5 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                              মূল বৈশিষ্ট্যসমূহ (Key Features)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {selectedProduct.features.split('\n').filter(l => l.trim().length > 0).map((line, idx) => {
                                const cleanLine = line.replace(/^[-*•]\s*/, '');
                                const colonIdx = cleanLine.indexOf(':');
                                const hasColon = colonIdx > 0 && colonIdx < cleanLine.length - 1;
                                const title = hasColon ? cleanLine.substring(0, colonIdx) : null;
                                const detail = hasColon ? cleanLine.substring(colonIdx + 1).trim() : cleanLine;

                                return (
                                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                                    <span className="text-primary mt-1 w-2 h-2 rounded-full flex-shrink-0 bg-primary ring-4 ring-primary/10" />
                                    <div className="text-xs sm:text-sm leading-snug">
                                      {title ? (
                                        <>
                                          <strong className="text-gray-900 font-bold block mb-0.5">{title}</strong>
                                          <span className="text-gray-600 font-medium">{detail}</span>
                                        </>
                                      ) : (
                                        <span className="text-gray-700 font-medium">{cleanLine}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. Full Description */}
                        {selectedProduct.description && (
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                              বিস্তারিত বিবরণ (Product Overview)
                            </h3>
                            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-100">
                              {cleanLatex(selectedProduct.description || "")}
                            </div>
                          </div>
                        )}

                        {/* 4. In The Box & Warranty Badges */}
                        {(selectedProduct.inTheBox || selectedProduct.warranty) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {selectedProduct.inTheBox && (
                              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-blue-700 uppercase block mb-1">📦 বক্সে যা যা পাবেন:</span>
                                <p className="text-sm text-gray-800 font-medium">{selectedProduct.inTheBox}</p>
                              </div>
                            )}
                            {selectedProduct.warranty && (
                              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">🛡️ অফিশিয়াল ওয়ারেন্টি:</span>
                                <p className="text-sm text-gray-800 font-medium">{selectedProduct.warranty}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {!selectedProduct.shortDescription && !selectedProduct.features && !selectedProduct.description && (
                          <div className="text-gray-500 py-8 text-center italic">No description available.</div>
                        )}
                      </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Reviews ({isReviewsLoading ? '...' : approvedReviews.length})</h2>
                        
                        {/* Write Review Form */}
                        <div id="review-form" className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                           <h4 className="text-base font-bold text-gray-900 mb-3">Write a Review</h4>
                           <div className="space-y-4 max-w-2xl">
                             <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className={`p-1 transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                                  >
                                    <Star size={24} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                                  </button>
                                ))}
                             </div>
                             
                             {!user && (
                               <input
                                 type="text"
                                 placeholder="Your Name"
                                 value={reviewForm.guestName || ""}
                                 onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                                 className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-medium bg-white"
                               />
                             )}
                             
                             <textarea
                               placeholder="Write your review..."
                               value={reviewForm.comment || ""}
                               onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                               className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-medium h-28 resize-none bg-white"
                             ></textarea>
                             
                             <div className="text-left">
                               <label htmlFor="reviewImageUpload" className="inline-flex items-center justify-start gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-50 transition-colors">
                                 <Camera size={16} />
                                 Add Photos (Max 5)
                               </label>
                               <input
                                 type="file"
                                 id="reviewImageUpload"
                                 accept="image/*"
                                 multiple
                                 className="hidden"
                                 onChange={handleReviewImageUpload}
                               />
                             </div>
                             {Array.isArray(reviewForm.images) && reviewForm.images.length > 0 && (
                               <div className="flex gap-2 flex-wrap mt-2">
                                 {reviewForm.images.map((img: string, i: number) => (
                                   <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                     <img loading="lazy" src={img} className="w-full h-full object-cover" alt="Review preview" />
                                     <button
                                       type="button"
                                       onClick={() => setReviewForm((p: any) => ({ ...p, images: p.images.filter((_: any, idx: number) => idx !== i) }))}
                                       className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm text-red-500 hover:scale-110 transition-transform"
                                     >
                                       <X size={12} />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}
                             
                             <button
                               type="button"
                               onClick={() => submitReview(selectedProduct.id)}
                               disabled={isSubmittingReview}
                               className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                             >
                               {isSubmittingReview ? "Submitting..." : "Submit Review"}
                             </button>
                           </div>
                        </div>

                        {/* Existing Reviews */}
                        <div className="space-y-6">
                           {isReviewsLoading ? (
                             <div className="space-y-4 animate-pulse">
                               {[1, 2].map((i) => (
                                 <div key={i} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                                   <div className="flex items-center gap-3 mb-3">
                                     <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                                     <div className="space-y-1.5 flex-1">
                                       <div className="h-4 bg-gray-200 rounded w-28" />
                                       <div className="h-3 bg-gray-100 rounded w-20" />
                                     </div>
                                   </div>
                                   <div className="space-y-2">
                                     <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                                     <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                                   </div>
                                 </div>
                               ))}
                             </div>
                           ) : approvedReviews.length > 0 ? (
                             approvedReviews.map((review: any) => {
                               const reviewerName = review.userName || review.name || review.guestName || "Customer";
                               const initial = (reviewerName.trim().charAt(0) || "C").toUpperCase();
                               const ratingVal = Math.min(5, Math.max(1, Number(review.rating) || 5));
                               const reviewDate = (() => {
                                 const dt = review.createdAt;
                                 if (!dt) return "";
                                 try {
                                   if (typeof dt === 'object' && dt.seconds) {
                                     return new Date(dt.seconds * 1000).toLocaleDateString();
                                   }
                                   const d = new Date(dt);
                                   return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
                                 } catch {
                                   return "";
                                 }
                               })();
                               const reviewImages = Array.isArray(review.images) ? review.images : [];

                               return (
                                 <div key={review.id || Math.random().toString(36)} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                   <div className="flex items-center gap-3 mb-3">
                                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                                       {initial}
                                     </div>
                                     <div>
                                       <h5 className="font-bold text-gray-900 text-sm">{reviewerName}</h5>
                                       <div className="flex text-amber-500 mt-0.5">
                                         {[...Array(5)].map((_, i) => (
                                           <Star key={i} size={12} fill={i < ratingVal ? "currentColor" : "none"} className={i >= ratingVal ? "text-gray-300" : ""} />
                                         ))}
                                       </div>
                                     </div>
                                     {reviewDate && (
                                       <span className="text-xs text-gray-400 ml-auto font-medium">{reviewDate}</span>
                                     )}
                                   </div>
                                   
                                   {review.comment && (
                                     <p className="text-gray-700 text-sm leading-relaxed font-medium mb-3">{review.comment}</p>
                                   )}
                                   
                                   {reviewImages.length > 0 && (
                                     <div className="flex gap-2 flex-wrap">
                                       {reviewImages.map((img: string, idx: number) => (
                                         <div 
                                           key={idx} 
                                           className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                           onClick={() => {
                                             setModalDisplayImage(img);
                                             setUserInteractedWithGallery(true);
                                             window.scrollTo({ top: 0, behavior: "smooth" });
                                           }}
                                         >
                                           <img loading="lazy" src={img} alt="Review" className="w-full h-full object-cover" />
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               );
                             })
                            ) : (
                              <div className="text-center py-12 text-gray-400 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                <MessageSquare size={44} className="mx-auto mb-3 opacity-40 text-gray-400" />
                                <p className="text-gray-700 font-bold text-sm">No reviews yet for this product</p>
                                <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               
               {/* Right Sidebar - AI Recommendations / Similar Products */}
               <div className="hidden md:block lg:col-span-1">
                 <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24 lg:mt-[45px]">
                   <h3 className="text-lg font-bold text-[#2e3192] text-center mb-6 border-b border-gray-100 pb-3 flex items-center justify-center gap-2">
                     Related Products
                   </h3>
                   <div className="flex flex-col gap-5">
                     {isAiLoading ? (
                       [1, 2, 3].map((i) => (
                         <div key={i} className="flex gap-3 animate-pulse">
                           <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0"></div>
                           <div className="flex-1 flex flex-col justify-center gap-2">
                             <div className="h-3 bg-gray-100 rounded w-full"></div>
                             <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                           </div>
                         </div>
                       ))
                     ) : (
                       aiRecommendations.map((product) => (
                         <div key={product.id} className="flex gap-3 group cursor-pointer bg-white hover:bg-gray-50 transition-all duration-300 rounded-xl p-2 -mx-2 hover:scale-[1.02]" onClick={() => openProductDetails(product)}>
                           <div className="w-20 h-20 shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center p-1 relative">
                             <img src={product.image} loading="lazy" decoding="async" alt={product.name} className="w-full h-full object-contain group-hover:scale-115 transition-transform duration-300" />
                             {product.discount > 0 && (
                               <span className="absolute top-0.5 left-0.5 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                                 -{product.discount}%
                               </span>
                             )}
                           </div>
                           <div className="flex flex-col justify-center">
                             <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1 font-sans">{product.name}</h4>
                             <div className="flex items-center gap-2 font-sans">
                               <span className="text-sm font-black text-[#ef4a23]">৳{product.price}</span>
                               {product.discount > 0 && (
                                 <span className="text-[10px] text-gray-400 line-through">৳{Math.round(product.price / (1 - product.discount / 100))}</span>
                               )}
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                     {!isAiLoading && aiRecommendations.length === 0 && (
                       <p className="text-xs text-gray-400 text-center italic">No recommended products found.</p>
                     )}
                   </div>
                 </div>
               </div>
              </div>
            </div>
          </div>
        </div>

        {shareNote && (
          <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[70] rounded-full bg-gray-900 text-white text-[13px] font-semibold px-4 py-2 shadow-lg">
            {shareNote}
          </div>
        )}
        {/* Mobile Sticky Bottom Floating Order Bar */}
        <div aria-hidden={isOrderFormVisible} className={`transition-transform duration-200 ${isOrderFormVisible ? 'translate-y-full pointer-events-none' : ''} fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 p-2.5 px-4 flex items-center justify-between gap-3 shadow-[0_-4px_25px_rgba(0,0,0,0.12)] pb-[max(env(safe-area-inset-bottom,0px),10px)] md:hidden select-none`}>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">মূল্য:</span>
            <span className="text-lg sm:text-xl font-black text-primary leading-tight">৳{getProductPrice(selectedProduct, tempSelectedQty || 1)}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              type="button"
              onClick={() => {
                if (!validateSelections()) return;
                const isWholesale = selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty);
                if (isWholesale && sumValues(wholesaleSizeQty) !== tempSelectedQty) {
                  alert("Please select the correct quantity for sizes/colors.");
                  return;
                }
                addToCartInternal(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty);
              }}
              className="w-[46px] h-[46px] bg-gray-100 active:bg-gray-200 text-gray-700 rounded-xl transition-all flex items-center justify-center border border-gray-200 shrink-0 active:scale-95 touch-manipulation"
              title="কার্টে যোগ করুন"
            >
              <ShoppingCart size={19} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!validateSelections()) return;
                const isWholesale = selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty);
                if (isWholesale && sumValues(wholesaleSizeQty) !== tempSelectedQty) {
                  alert("Please select the correct quantity for sizes/colors.");
                  return;
                }
                const form = document.getElementById("mobile-order-form");
                if (form) {
                  form.scrollIntoView({ behavior: "smooth", block: "start" });
                  const firstEmpty = (["inline-name-input", "inline-phone-input", "inline-address-input"] as const)
                    .map((id) => document.getElementById(id) as HTMLInputElement | null)
                    .find((el) => el && !el.value.trim());
                  if (firstEmpty) setTimeout(() => firstEmpty.focus({ preventScroll: true }), 450);
                  return;
                }
                handleBuyNow(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty, isWholesale ? wholesaleSizeQty : undefined);
                setIsProductDetailsOpen(false);
              }}
              className="flex-1 h-[46px] px-4 bg-primary hover:bg-primary-dark active:from-red-700 active:to-primary text-white font-black text-sm rounded-xl transition-all shadow-md shadow-primary/30 flex items-center justify-center gap-1.5 active:scale-95 touch-manipulation cursor-pointer"
            >
              <span>{t("এখনই অর্ডার করুন", "Order Now")}</span>
              <ArrowRight size={16} className="shrink-0" />
            </button>
          </div>
        </div>

      </>
  );
}

export const MemoizedProductDetails = React.memo(ProductDetails);

