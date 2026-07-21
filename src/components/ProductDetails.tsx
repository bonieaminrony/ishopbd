import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { X, Star, Share2, Heart, Truck, Plus, Zap, ChevronDown, Check, ShoppingCart, Tag, Box, ShieldCheck, CheckCircle2, List, LayoutGrid, Camera, CreditCard, Link as LinkIcon, Bookmark, Info, MessageSquare } from 'lucide-react';

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
  } = props;

  const [activeTab, setActiveTab] = React.useState('specification');


  return (
    <>
          <div className="w-full min-h-screen">
            <Helmet>
              <title>{selectedProduct.name} - i SHOP BD</title>
              <meta name="description" content={(selectedProduct.description || `Buy ${selectedProduct.name} at the best price in Bangladesh from i SHOP BD.`).substring(0, 160)} />
              <meta property="og:title" content={`${selectedProduct.name} - i SHOP BD`} />
              <meta property="og:description" content={(selectedProduct.description || `Buy ${selectedProduct.name} at the best price in Bangladesh from i SHOP BD.`).substring(0, 160)} />
              <meta property="og:image" content={selectedProduct.image} />
              <meta property="og:url" content={`https://ishopbd.com/?product=${selectedProduct.id}`} />
              <script type="application/ld+json">
                {JSON.stringify({
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": selectedProduct.name,
                  "image": selectedProduct.image,
                  "description": selectedProduct.description || `Buy ${selectedProduct.name} at the best price.`,
                  "brand": {
                    "@type": "Brand",
                    "name": selectedProduct.brand || "Generic"
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": `https://ishopbd.com/?product=${selectedProduct.id}`,
                    "priceCurrency": "BDT",
                    "price": selectedProduct.price,
                    "availability": selectedProduct.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                  }
                })}
              </script>
            </Helmet>
      <div className="w-full bg-white border-b border-gray-200/80 py-6 md:py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-transparent w-full flex flex-col md:flex-row overflow-hidden"
          >
              {/* Product Image Gallery */}
              <div className="w-full md:w-1/2 bg-transparent flex flex-col items-center justify-start p-4 md:p-6 md:pt-10 border-b md:border-b-0 md:border-r border-gray-200 mt-4 md:mt-0">
                  <div className="mb-4 w-full block md:hidden">
                    <span className="hidden">
                      {selectedProduct.category}
                      {selectedProduct.code && (
                        <>
                          <span className="text-gray-400">Code: {selectedProduct.code}</span>
                        </>
                      )}
                    </span>
                    <h1 className="hidden">
                      {selectedProduct.name}
                    </h1>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 w-full">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-3 flex-wrap w-full">
                          {/* Stock Badge */}
                          <div className={`hidden px-2.5 py-1 rounded-md text-xs font-bold items-center gap-1.5 ${
                            selectedProduct.isComingSoon 
                              ? "bg-amber-50 text-amber-600 border border-amber-200" 
                              : (selectedProduct.variants && selectedProduct.variants.length > 0
                                ? selectedProduct.variants.every(v => (v.stock || 0) <= 0)
                                : (selectedProduct.stock || 0) <= 0)
                              ? "bg-red-50 text-red-600 border border-red-200" 
                              : "bg-green-50 text-green-600 border border-green-200"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              selectedProduct.isComingSoon 
                                ? "bg-amber-500" 
                                : (selectedProduct.variants && selectedProduct.variants.length > 0
                                  ? selectedProduct.variants.every(v => (v.stock || 0) <= 0)
                                  : (selectedProduct.stock || 0) <= 0)
                                ? "bg-red-500" 
                                : "bg-green-500 animate-pulse"
                            }`}></div>
                            {selectedProduct.isComingSoon 
                              ? "Pre-Order"
                              : (selectedProduct.variants && selectedProduct.variants.length > 0
                                ? selectedProduct.variants.every(v => (v.stock || 0) <= 0)
                                : (selectedProduct.stock || 0) <= 0)
                              ? "Out of Stock"
                              : "Stock Available"
                            }
                          </div>
                          {/* Ratings Badge */}
                          <div 
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors shrink-0 whitespace-nowrap"
                            onClick={() => {
                              const element = document.getElementById("review-form");
                              element?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={12} className={(selectedProduct.rating || 0) >= star ? "text-yellow-500 fill-yellow-500" : "text-blue-200"} />
                              ))}
                            </div>
                            <span className="text-xs font-bold">
                              Ratings ({selectedProduct.reviewCount || 0})
                            </span>
                          </div>
                          
                          <div className="ml-auto flex items-center justify-end shrink-0">
                            <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-full border border-gray-100">
                              <span className="text-sm text-gray-500 ml-2 hidden sm:inline font-medium">Share:</span>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://www.facebook.com/dialog/send?link=${shareUrl.toString()}&app_id=291494419107518&redirect_uri=${shareUrl.toString()}`, '_blank');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.899 1.488 5.485 3.82 7.158v3.584l3.472-1.921c.854.238 1.761.365 2.708.365 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.385l-2.775-2.955-5.412 2.955 5.962-6.332 2.836 2.955 5.348-2.955-5.959 6.332z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://wa.me/?text=${encodeURIComponent(selectedProduct.name + ' ' + shareUrl.toString())}`, '_blank');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                navigator.clipboard.writeText(shareUrl.toString());
                                alert('Link copied to clipboard!');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all"><LinkIcon size={16} /></button>
                              
                              <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
                              
                              <button onClick={() => handleLikeProduct(selectedProduct.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${likedProducts.includes(selectedProduct.id) ? "bg-primary/10 text-primary shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200/50"}`}><Bookmark size={16} fill={likedProducts.includes(selectedProduct.id) ? "currentColor" : "none"} /> Save</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="relative w-full md:w-[85%] mx-auto aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center group">
                  <ZoomableImage
                    keyId={modalDisplayImage}
                    src={modalDisplayImage || selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                  {selectedProduct.isFreeDelivery && (
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl z-10 flex items-center gap-1 border border-emerald-500/20">
                      <Truck size={12} /> ফ্রি হোম ডেলিভারি
                    </div>
                  )}
                </div>
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
              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
                
                <div className="mb-4">
                  {/* Top Action Bar */}
                  <div className="flex items-center justify-end mb-4 pb-2 border-b border-gray-100 hidden md:flex">
                     <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-full border border-gray-100">
                        <span className="text-sm text-gray-500 ml-3 mr-1 font-medium hidden lg:inline">Share:</span>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://www.facebook.com/dialog/send?link=${shareUrl.toString()}&app_id=291494419107518&redirect_uri=${shareUrl.toString()}`, '_blank');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.899 1.488 5.485 3.82 7.158v3.584l3.472-1.921c.854.238 1.761.365 2.708.365 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.385l-2.775-2.955-5.412 2.955 5.962-6.332 2.836 2.955 5.348-2.955-5.959 6.332z"/></svg></button>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://wa.me/?text=${encodeURIComponent(selectedProduct.name + ' ' + shareUrl.toString())}`, '_blank');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                navigator.clipboard.writeText(shareUrl.toString());
                                alert('Link copied to clipboard!');
                              }} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all"><LinkIcon size={16} /></button>
                        
                        <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
                        
                        <button onClick={() => handleLikeProduct(selectedProduct.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${likedProducts.includes(selectedProduct.id) ? "bg-primary/10 text-primary shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-200/50"}`}><Bookmark size={16} fill={likedProducts.includes(selectedProduct.id) ? "currentColor" : "none"} /> Save</button>
                     </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-[22px] md:text-2xl text-[#1a2b6d] font-normal mb-3 leading-snug">
                    {selectedProduct.name}
                  </h1>

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
                            (selectedProduct.stock || 0) <= 0 && (!selectedProduct.variants || selectedProduct.variants.every(v => (v.stock || 0) <= 0)) ? "Out of Stock" : "In Stock"
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
                  
                  {/* Specification */}
                  <div className="mt-6 mb-4">
                     <h3 className="text-[17px] font-medium text-gray-900 mb-3">Specification</h3>
                     <div className="text-sm text-gray-700 flex flex-col gap-2.5">
                        {(() => {
                           // 1. If key features exist, render them as a bullet list
                           if (selectedProduct.features) {
                             const lines = selectedProduct.features.split('\n').filter(l => l.trim().length > 0);
                             return lines.map((line, idx) => (
                               <div key={idx} className="flex items-start gap-2 pb-1.5 last:pb-0">
                                 <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-primary" />
                                 <span className="text-gray-700 font-medium">{line.replace(/^[-*•]\s*/, '')}</span>
                               </div>
                             ));
                           }
                           
                           // 2. Fallback: get detailed specifications
                           const specs = selectedProduct.specifications || [];
                           if (specs.length > 0) {
                             return specs.slice(0, 5).map((spec, idx) => (
                               <div key={idx} className="flex gap-2 border-b border-gray-50 pb-1.5 last:border-b-0">
                                 <span className="text-gray-400 font-medium min-w-[120px]">{spec.name || spec.key}:</span>
                                 <span className="text-gray-900 font-semibold">{spec.value}</span>
                               </div>
                             ));
                           }
                           
                           // 3. Fallback: get other basic specs
                           const basicSpecs = [
                             { name: "Model", value: selectedProduct.modelName },
                             { name: "Brand", value: selectedProduct.brand || selectedProduct.category },
                             { name: "Warranty", value: selectedProduct.warranty },
                           ].filter(s => s.value);
                           
                           if (basicSpecs.length > 0) {
                             return basicSpecs.map((spec, idx) => (
                               <div key={idx} className="flex gap-2 border-b border-gray-50 pb-1.5 last:border-b-0">
                                 <span className="text-gray-400 font-medium min-w-[120px]">{spec.name}:</span>
                                 <span className="text-gray-900 font-semibold truncate">{spec.value}</span>
                               </div>
                             ));
                           }

                           return <p className="text-gray-400 italic">No specifications available</p>;
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
                       className="text-primary text-sm font-medium hover:underline mt-4 block"
                     >
                       View Full Specifications
                     </button>
                  </div>
                </div>
                <div className="flex flex-col gap-5 mb-6">
                    {/* Variant Selection Logic */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="w-full flex flex-col gap-4">
                        {/* Color selection */}
                      {(() => {
                        const colors = Array.from(new Set(selectedProduct.variants?.map(v => v.name || "")));
                        if (colors.length <= 1 && colors[0] === "") return null;
                        return (
                          <div className="flex flex-col items-start w-full">
                            <h4 className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Choose Color:</h4>
                            <div id="color-selection-area" className={`flex items-center w-full transition-all duration-300 ${colorValError ? "border-2 border-red-500 bg-red-50/20 shadow-sm rounded-xl p-1" : "border-2 border-transparent"}`}>
                              <div className="flex flex-wrap items-center gap-2">
                              {colors.map((colorName, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTempSelectedColor(colorName);
                                    setColorValError(false);
                                    const matchingVariant = selectedProduct.variants?.find(v => (v.name || "") === colorName && v.image);
                                    if (matchingVariant?.image) {
                                      setModalDisplayImage(matchingVariant.image);
                                    }
                                  }}
                                  className={`px-5 h-[40px] flex items-center justify-center rounded-xl text-sm font-medium transition-all border ${tempSelectedColor === colorName ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                  {colorName || "Default"}
                                </button>
                              ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Size selection */}
                      {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).length > 0 && (
                        <div className="flex flex-col items-start w-full">
                            <h4 className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Choose Size:</h4>
                          <div id="size-selection-area" className={`flex items-center w-full transition-all duration-300 ${sizeValError ? "border-2 border-red-500 bg-red-50/20 shadow-sm rounded-xl p-1" : "border-2 border-transparent"}`}>
                            <div className="flex flex-wrap items-center gap-2">
                            {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).map((size, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTempSelectedSize(size as string);
                                    setSizeValError(false);
                                  }}
                                  className={`flex items-center justify-center px-5 h-[40px] rounded-xl text-sm font-medium transition-all border ${tempSelectedSize === size ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                  {size as string}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

            {/* Quantity Selector and Buy Now */}
            <div className="w-full flex flex-col mt-2">
                <div className="flex items-end gap-3 w-full">
                  <div className="flex flex-col">
                    <h4 className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Quantity:</h4>
                    <div className="flex items-center border border-gray-200 bg-white shadow-sm w-[130px] h-[46px] rounded-xl overflow-hidden">
                      <button onClick={() => setTempSelectedQty(Math.max(1, tempSelectedQty - 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 font-medium disabled:opacity-30 transition-colors" disabled={tempSelectedQty <= 1}>
                        <Minus size={16} />
                      </button>
                      <div className="flex-1 flex items-center justify-center border-l border-r border-gray-100 h-full bg-gray-50/50">
                        <input 
                          type="number" 
                          value={tempSelectedQty === 0 ? "" : tempSelectedQty} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setTempSelectedQty(val);
                            else if (e.target.value === "") setTempSelectedQty(0);
                          }}
                          onBlur={() => {
                            if (tempSelectedQty < 1) setTempSelectedQty(1);
                          }}
                          className="w-full text-center bg-transparent font-bold text-base text-gray-800 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <button onClick={() => setTempSelectedQty(tempSelectedQty + 1)} className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 font-medium transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
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
                      handleBuyNow(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty, isWholesale ? wholesaleSizeQty : undefined); 
                      setIsProductDetailsOpen(false); 
                    }} 
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold text-base h-[46px] rounded-xl transition-all flex items-center justify-center shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Buy Now
                  </button>
                </div>
            </div>
            
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-medium text-red-600 flex items-center gap-2 max-w-fit">
              <Info size={18} className="text-red-500" /> Only For Online Order
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
                                    
              </div>
          </motion.div>
        </div>
      </div>

      {/* Star Tech Style Tabs & Sidebar Layout */}
      <div className="w-full bg-[#f2f4f8]/40 py-10 border-t border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="product-description-tabs">
             <div className="lg:col-span-3">
                  {/* Tabs Header */}
                  <div className="flex flex-wrap gap-2 mb-0 border-b border-gray-200">
                    <button 
                      onClick={() => setActiveTab('specification')}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'specification' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Specification
                    </button>
                    <button 
                      onClick={() => setActiveTab('description')}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'description' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Description
                    </button>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'reviews' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Reviews ({activeReviews.length})
                    </button>
                  </div>

                  {/* Tabs Content */}
                  <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
                    
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
                        
                        {selectedProduct.description && (
                          <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Description</h2>
                            <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed font-medium">
                              {cleanLatex(selectedProduct.description || "")}
                            </div>
                          </div>
                        )}

                        {/* Reviews Section */}
                        <div className="mt-8 pt-8 border-t border-gray-100 animate-in fade-in duration-300">
                          <h2 className="text-lg font-bold text-gray-800 mb-4">Reviews ({activeReviews.length})</h2>
                          
                          {/* Write Review Form */}
                          <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                             <h4 className="text-base font-bold text-gray-900 mb-3">Write a Review</h4>
                             <div className="space-y-4 max-w-2xl">
                               <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
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
                                   value={reviewForm.guestName}
                                   onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                                   className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-medium bg-white"
                                 />
                               )}
                               
                               <textarea
                                 placeholder="Write your review..."
                                 value={reviewForm.comment}
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
                               {reviewForm.images.length > 0 && (
                                 <div className="flex gap-2 flex-wrap mt-2">
                                   {reviewForm.images.map((img, i) => (
                                     <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                       <img loading="lazy" src={img} className="w-full h-full object-cover" alt="Review preview" />
                                       <button
                                         onClick={() => setReviewForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                         className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm text-red-500 hover:scale-110 transition-transform"
                                       >
                                         <X size={12} />
                                       </button>
                                     </div>
                                   ))}
                                 </div>
                               )}
                               
                               <button
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
                             {activeReviews.length > 0 ? (
                               activeReviews.map((review) => (
                                 <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                   <div className="flex items-center gap-3 mb-3">
                                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                       {review.userName.charAt(0).toUpperCase()}
                                     </div>
                                     <div>
                                       <h5 className="font-bold text-gray-900 text-sm">{review.userName}</h5>
                                       <div className="flex text-amber-500 mt-0.5">
                                         {[...Array(5)].map((_, i) => (
                                           <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                                         ))}
                                       </div>
                                     </div>
                                     <span className="text-xs text-gray-400 ml-auto font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                   </div>
                                   
                                   <p className="text-gray-700 text-sm leading-relaxed font-medium mb-3">{review.comment}</p>
                                   
                                   {review.images && review.images.length > 0 && (
                                     <div className="flex gap-2 flex-wrap">
                                       {review.images.map((img, idx) => (
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
                               ))
                             ) : (
                               <div className="text-gray-500 py-8 text-center italic">No reviews yet. Be the first to review!</div>
                             )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DESCRIPTION TAB */}
                    {activeTab === 'description' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Description</h2>
                        {selectedProduct.description ? (
                          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed font-medium">
                            {cleanLatex(selectedProduct.description || "")}
                          </div>
                        ) : (
                          <div className="text-gray-500 py-8 text-center italic">No description available.</div>
                        )}
                      </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Reviews ({activeReviews.length})</h2>
                        
                        {/* Write Review Form */}
                        <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                           <h4 className="text-base font-bold text-gray-900 mb-3">Write a Review</h4>
                           <div className="space-y-4 max-w-2xl">
                             <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
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
                                 value={reviewForm.guestName}
                                 onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                                 className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary outline-none text-sm font-medium bg-white"
                               />
                             )}
                             
                             <textarea
                               placeholder="Write your review..."
                               value={reviewForm.comment}
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
                             {reviewForm.images.length > 0 && (
                               <div className="flex gap-2 flex-wrap mt-2">
                                 {reviewForm.images.map((img, i) => (
                                   <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                     <img loading="lazy" src={img} className="w-full h-full object-cover" alt="Review preview" />
                                     <button
                                       onClick={() => setReviewForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                       className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm text-red-500 hover:scale-110 transition-transform"
                                     >
                                       <X size={12} />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}
                             
                             <button
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
                           {activeReviews.length > 0 ? (
                             activeReviews.map((review) => (
                               <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                 <div className="flex items-center gap-3 mb-3">
                                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                     {review.userName.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                     <h5 className="font-bold text-gray-900 text-sm">{review.userName}</h5>
                                     <div className="flex text-amber-500 mt-0.5">
                                       {[...Array(5)].map((_, i) => (
                                         <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                                       ))}
                                     </div>
                                   </div>
                                   <span className="text-xs text-gray-400 ml-auto font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 
                                 <p className="text-gray-700 text-sm leading-relaxed font-medium mb-3">{review.comment}</p>
                                 
                                 {review.images && review.images.length > 0 && (
                                   <div className="flex gap-2 flex-wrap">
                                     {review.images.map((img, idx) => (
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
                             ))
                           ) : (
                             <div className="text-center py-12 text-gray-400 font-medium">
                               <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                               এখনো কোনো রিভিউ দেওয়া হয়নি।<br/>প্রথম রিভিউটি আপনিই দিন!
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               
               {/* Right Sidebar - Similar Products */}
               <div className="lg:col-span-1">
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 lg:mt-[45px]">
                   <h3 className="text-lg font-black text-[#2e3192] text-center mb-6 border-b border-gray-100 pb-3">Similar Product</h3>
                   <div className="flex flex-col gap-5">
                     {relatedProducts.slice(0, 5).map((product) => (
                       <div key={product.id} className="flex gap-3 group cursor-pointer bg-white hover:bg-gray-50 transition-colors rounded-xl p-2 -mx-2" onClick={() => openProductDetails(product)}>
                         <div className="w-20 h-20 shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                           <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                         </div>
                         <div className="flex flex-col justify-center">
                           <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">{product.name}</h4>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-[#ef4a23]">৳{product.price}</span>
                             {product.discount > 0 && (
                               <span className="text-xs text-gray-400 line-through">৳{Math.round(product.price / (1 - product.discount / 100))}</span>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                     {relatedProducts.length === 0 && (
                       <p className="text-sm text-gray-500 text-center italic">No similar products found.</p>
                     )}
                   </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}
