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
                  "name": selectedProduct.name,                  "image": selectedProduct.image,
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
             <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-transparent w-full flex flex-col md:flex-row overflow-hidden mb-8"
            >
              {/* Integrated Close Button - Stays inside the box corner */}
              <div className="absolute top-4 right-4 z-[50]">
                <button
                  onClick={() => {
                    setIsProductDetailsOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:bg-red-50 text-gray-400 hover:text-red-500 w-10 h-10 rounded-xl transition-all flex items-center justify-center group active:scale-90"
                  aria-label="হোম পেজে ফিরে যান"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              {/* Product Image Gallery */}
              <div className="w-full md:w-1/2 bg-transparent flex flex-col items-center justify-start p-4 md:p-6 md:pt-10 border-b md:border-b-0 md:border-r border-gray-200 mt-14 md:mt-0">
                  <div className="mb-4 w-full block md:hidden">
                    <span className="hidden">
                      {selectedProduct.category}
                      {selectedProduct.code && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
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
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors"
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
                          
                          <div className="ml-auto flex flex-wrap items-center gap-4 justify-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 hidden sm:inline">Share:</span>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://www.facebook.com/dialog/send?link=${shareUrl.toString()}&app_id=291494419107518&redirect_uri=${shareUrl.toString()}`, '_blank');
                              }} className="text-gray-500 hover:text-blue-600 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.899 1.488 5.485 3.82 7.158v3.584l3.472-1.921c.854.238 1.761.365 2.708.365 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.385l-2.775-2.955-5.412 2.955 5.962-6.332 2.836 2.955 5.348-2.955-5.959 6.332z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://wa.me/?text=${encodeURIComponent(selectedProduct.name + ' ' + shareUrl.toString())}`, '_blank');
                              }} className="text-gray-500 hover:text-green-500 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                              <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                navigator.clipboard.writeText(shareUrl.toString());
                                alert('Link copied to clipboard!');
                              }} className="text-gray-500 hover:text-gray-900 transition-colors"><LinkIcon size={16} /></button>
                            </div>
                            <div className="flex items-center text-sm font-medium">
                              <button onClick={() => handleLikeProduct(selectedProduct.id)} className={`flex items-center gap-1 transition-colors ${likedProducts.includes(selectedProduct.id) ? "text-primary" : "text-gray-600 hover:text-primary"}`}><Bookmark size={16} fill={likedProducts.includes(selectedProduct.id) ? "currentColor" : "none"} /> Save</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="relative w-[90%] md:w-[85%] mx-auto aspect-square bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center group">
                  <ZoomableImage
                    keyId={modalDisplayImage}
                    src={modalDisplayImage || selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                  {selectedProduct.discount > 0 && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl z-10">
                      ডিসকাউন্ট: {selectedProduct.discount}%
                    </div>
                  )}
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
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 hidden md:flex">
                     <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 mr-1">Share:</span>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://www.facebook.com/dialog/send?link=${shareUrl.toString()}&app_id=291494419107518&redirect_uri=${shareUrl.toString()}`, '_blank');
                              }} className="text-gray-500 hover:text-blue-600 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.899 1.488 5.485 3.82 7.158v3.584l3.472-1.921c.854.238 1.761.365 2.708.365 5.523 0 10-4.145 10-9.258S17.523 2 12 2zm1.096 12.385l-2.775-2.955-5.412 2.955 5.962-6.332 2.836 2.955 5.348-2.955-5.959 6.332z"/></svg></button>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                window.open(`https://wa.me/?text=${encodeURIComponent(selectedProduct.name + ' ' + shareUrl.toString())}`, '_blank');
                              }} className="text-gray-500 hover:text-green-500 transition-colors"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                        <button onClick={() => {
                                const shareUrl = new URL(window.location.origin);
                                shareUrl.searchParams.set("p", selectedProduct.id || "");
                                navigator.clipboard.writeText(shareUrl.toString());
                                alert('Link copied to clipboard!');
                              }} className="text-gray-500 hover:text-gray-900 transition-colors"><LinkIcon size={16} /></button>
                     </div>
                     <div className="flex items-center gap-4 text-sm font-medium">
                        <button onClick={() => handleLikeProduct(selectedProduct.id)} className={`flex items-center gap-1 transition-colors ${likedProducts.includes(selectedProduct.id) ? "text-primary" : "text-gray-600 hover:text-primary"}`}><Bookmark size={16} fill={likedProducts.includes(selectedProduct.id) ? "currentColor" : "none"} /> Save</button>
                        <button className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"><Bookmark size={16} /> Add to Compare</button>
                     </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-[22px] md:text-2xl text-[#1a2b6d] font-normal mb-3 leading-snug">
                    {selectedProduct.name}
                  </h1>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                     <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex gap-1">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold">{Number(selectedProduct.price).toLocaleString('en-IN')}৳</span>
                     </div>
                     {selectedProduct.oldPrice && (
                       <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex gap-1">
                          <span className="text-gray-500">Regular Price:</span>
                          <span className="font-bold line-through">{Number(selectedProduct.oldPrice).toLocaleString('en-IN')}৳</span>
                       </div>
                     )}
                     <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex gap-1">
                        <span className="text-gray-500">Status:</span>
                        <span className="font-bold">{
                            selectedProduct.isComingSoon ? "Pre-Order" :
                            (selectedProduct.stock || 0) <= 0 && (!selectedProduct.variants || selectedProduct.variants.every(v => (v.stock || 0) <= 0)) ? "Out of Stock" : "In Stock"
                        }</span>
                     </div>
                     {selectedProduct.code && (
                       <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex gap-1">
                          <span className="text-gray-500">Product Code:</span>
                          <span className="font-bold">{selectedProduct.code}</span>
                       </div>
                     )}
                     <div className="bg-gray-100 text-gray-800 text-xs px-3 py-1.5 rounded-full flex gap-1">
                        <span className="text-gray-500">Brand:</span>
                        <span className="font-bold">{selectedProduct.brand || selectedProduct.category || "General"}</span>
                     </div>
                  </div>
                  
                  {/* Key Features */}
                  <div className="mt-6 mb-4">
                     <h3 className="text-[17px] font-medium text-gray-900 mb-3">Key Features</h3>
                     <div className="text-sm text-gray-700 flex flex-col gap-2">
                        {(() => {
                           const rawText = cleanLatex(selectedProduct.description || "");
                           if (!rawText) return <p>No features available</p>;
                           
                           const lines = rawText.split('\n').filter(l => l.trim().length > 5).slice(0, 5);
                           if (lines.length > 0) {
                             return lines.map((line, idx) => (
                               <p key={idx}>{line.replace(/^[-*•]\s*/, '')}</p>
                             ));
                           }
                           return <p>{rawText.substring(0, 150)}...</p>;
                        })()}
                     </div>
                     <button 
                       onClick={() => {
                         const element = document.getElementById("product-description-tabs");
                         element?.scrollIntoView({ behavior: "smooth", block: "start" });
                       }}
                       className="text-primary text-sm font-medium hover:underline mt-4 block"
                     >
                       View More Info
                     </button>
                  </div>
                </div>
                <div className="flex flex-row items-start md:items-stretch gap-4 md:gap-6 mb-6">
                    {/* Variant Selection Logic */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                      <div className="flex-1 min-w-[140px] md:min-w-[200px] w-full flex flex-col gap-4">
                        
                        <div className="flex flex-col w-full">
                        {/* Color selection */}
                      {(() => {
                        const colors = Array.from(new Set(selectedProduct.variants?.map(v => v.name || "")));
                        if (colors.length <= 1 && colors[0] === "") return null;
                        return (
                          <div className="flex flex-col items-start w-full">
                            <h4 className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1.5 md:mb-2">কালার পছন্দ করুন:</h4>
                            <div id="color-selection-area" className={`flex items-center w-full transition-all duration-300 ${colorValError ? "border-2 border-red-500 bg-red-50/20 shadow-sm" : "border-2 border-transparent"}`}>
                              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
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
                                  className={`px-4 md:px-5 h-[36px] md:h-[40px] flex items-center justify-center rounded-full text-[13px] md:text-sm font-bold transition-all border ${tempSelectedColor === colorName ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                >
                                  {colorName || "ডিফল্ট"}
                                </button>
                              ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Size selection */}
                      {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).length > 0 && (
                        <div className="flex flex-col items-start w-full mt-2">
                            <h4 className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1.5 md:mb-2">সাইজ পছন্দ করুন:</h4>
                          <div id="size-selection-area" className={`flex items-center w-full transition-all duration-300 ${sizeValError ? "border-2 border-red-500 bg-red-50/20 shadow-sm" : "border-2 border-transparent"}`}>
                            <div className="flex flex-wrap justify-center gap-1.5">
                            {Array.from(new Set(selectedProduct.variants.map(v => v.size).filter(Boolean))).map((size, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTempSelectedSize(size as string);
                                    setSizeValError(false);
                                  }}
                                  className={`flex items-center justify-center px-4 md:px-5 h-[36px] md:h-[40px] rounded-full text-[13px] md:text-sm font-bold transition-all border ${tempSelectedSize === size ? "border-primary bg-primary text-white shadow-md shadow-primary/20" : "border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                >
                                  {size as string}
                                </button>
                            ))}
                            </div>
                          </div>
                        </div>
                      )}
                        </div>
                      </div>
                  ) : null}
                  {/* Quantity Selector */}
                  <div className="flex-1 min-w-[140px] md:min-w-[200px] w-full flex flex-col">
                    
                    <div className="flex flex-col w-full">
                    <h4 className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-1.5 md:mb-2">পরিমাণ (Quantity):</h4>
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white shadow-sm w-full md:flex-1 md:max-w-[140px] h-[36px] md:h-[40px]">
                        <button onClick={() => setTempSelectedQty(Math.max(1, tempSelectedQty - 1))} className="w-10 h-full flex items-center justify-center hover:bg-white text-secondary disabled:opacity-30 border-r border-gray-100" disabled={tempSelectedQty <= 1}>
                          <Minus size={18} />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
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
                            className="w-10 text-center bg-transparent font-bold text-sm text-secondary outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          {selectedProduct.unit && (
                            <span className="font-bold text-secondary text-sm whitespace-nowrap shrink-0">{selectedProduct.unit}</span>
                          )}
                        </div>
                        <button onClick={() => setTempSelectedQty(tempSelectedQty + 1)} className="w-10 h-full flex items-center justify-center hover:bg-white text-secondary border-l border-gray-100">
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
                                    {/* Inline Order Form (Rendered ABOVE if NOT wholesale mode) */}
                  {!(selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty)) && (
                    <form id="inline-order-form" onSubmit={handleInlineOrderSubmit} className="bg-gradient-to-b from-gray-50 to-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm mb-4 mt-auto relative">
                      <h4 className="text-base md:text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-primary" fill="currentColor" /> দ্রুত অর্ডার করুন
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <input
                              id="inline-phone-input"
                              required
                              type="tel"
                              placeholder="আপনার ফোন নম্বর"
                              value={inlineOrderPhone}
                              onChange={(e) => setInlineOrderPhone(e.target.value)}
                              onFocus={() => setInlinePhoneFocused(true)}
                              onBlur={() => setTimeout(() => setInlinePhoneFocused(false), 250)}
                              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                            />
                            {inlinePhoneFocused && savedProfiles.filter(p => p.phone.includes(inlineOrderPhone)).length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                                {savedProfiles.filter(p => p.phone.includes(inlineOrderPhone)).map((profile, index) => (
                                  <div
                                    key={index}
                                    onMouseDown={() => selectSavedProfile(profile, 'inline')}
                                    className="px-4 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                                  >
                                    <span className="font-bold text-secondary">{profile.phone}</span>
                                    {profile.name && <span className="text-gray-400 text-[10px]">{profile.name} - {profile.address}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input id="inline-name-input" required type="text" placeholder="আপনার নাম" value={inlineOrderName} onChange={(e) => setInlineOrderName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <div className="relative flex items-center">
                              <input
                                required
                                type="text"
                                placeholder="জেলা সিলেক্ট করুন"
                                value={isInlineDistrictOpen ? inlineDistrictSearch : inlineOrderDistrict}
                                onChange={(e) => {
                                  setInlineDistrictSearch(e.target.value);
                                  setIsInlineDistrictOpen(true);
                                }}
                                onFocus={() => {
                                  setInlineDistrictSearch("");
                                  setIsInlineDistrictOpen(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setIsInlineDistrictOpen(false);
                                    setInlineDistrictSearch("");
                                  }, 200);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:border-primary outline-none transition-colors"
                              />
                              <span className="absolute right-3 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                              </span>
                            </div>
                            {isInlineDistrictOpen && <InlineDistrictModal {...{ ALL_DISTRICTS, inlineDistrictSearch, setInlineOrderDistrict, setInlineOrderThana, setInlineOrderArea, setIsInlineDistrictOpen, inlineOrderDistrict, isInlineDistrictOpen }} />}
                          </div>
                          <div className="relative w-full">
                            <div className="relative flex items-center">
                              <input
                                required
                                type="text"
                                placeholder="থানা/এলাকা সিলেক্ট করুন"
                                value={isInlineThanaOpen ? inlineThanaSearch : inlineOrderThana}
                                onChange={(e) => {
                                  setInlineThanaSearch(e.target.value);
                                  setIsInlineThanaOpen(true);
                                }}
                                onFocus={() => {
                                  setInlineThanaSearch("");
                                  setIsInlineThanaOpen(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setIsInlineThanaOpen(false);
                                    setInlineThanaSearch("");
                                  }, 200);
                                }}
                                disabled={!inlineOrderDistrict}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:bg-gray-100"
                              />
                              <span className="absolute right-3 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                              </span>
                            </div>
                            {isInlineThanaOpen && inlineOrderDistrict && districtThanaMap[inlineOrderDistrict] && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                                {districtThanaMap[inlineOrderDistrict].filter(t => 
                                  t.toLowerCase().includes(inlineThanaSearch.toLowerCase())
                                ).length > 0 ? (
                                  districtThanaMap[inlineOrderDistrict].filter(t => 
                                    t.toLowerCase().includes(inlineThanaSearch.toLowerCase())
                                  ).map((t) => (
                                    <div
                                      key={t}
                                      onMouseDown={() => {
                                        setInlineOrderThana(t);
                                        setIsInlineThanaOpen(false);
                                      }}
                                      className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                        inlineOrderThana === t ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                                      }`}
                                    >
                                      {t}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                   ঢাকার মধ্যে
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
</div>
                        <textarea id="inline-address-input" required placeholder="সম্পূর্ণ ঠিকানা (বাসা, রোড, এলাকা)" value={inlineOrderAddress} onChange={(e) => setInlineOrderAddress(e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-primary outline-none transition-colors resize-none" />
                        <textarea placeholder="অতিরিক্ত নোট লিখুন (ঐচ্ছিক)" value={inlineOrderNote} onChange={(e) => setInlineOrderNote(e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:border-primary outline-none transition-colors resize-none" />
                        
                        {availableRewardPoints > 0 && (
                          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between my-2 gap-2">
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
                        {inlineOrderSuccess && (<div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl border border-green-200 flex items-center justify-center gap-2"><Check size={16} /> অর্ডার সফল হয়েছে!</div>)}
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => { if (!validateSelections()) return; addToCartInternal(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty); setIsProductDetailsOpen(false); }} className="w-14 shrink-0 bg-white border-2 border-gray-100 hover:border-primary text-gray-500 hover:text-primary flex items-center justify-center rounded-2xl hover:bg-red-50 hover:shadow-lg transition-all duration-300" title="Add to Cart"><ShoppingCart size={20} /></button>
                          <button type="button" onClick={() => { if (!validateSelections()) return; const msg = `হাই, আমি ${selectedProduct.name} অর্ডার করতে চাচ্ছি।\nপরিমাণ: ${tempSelectedQty} পিস\nমূল্য: ৳${getProductPrice(selectedProduct, tempSelectedQty) * tempSelectedQty}`; window.open(`https://wa.me/${(siteConfig?.whatsappNumber || siteConfig?.supportPhone1 || "01777600844").replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'); }} className="w-14 shrink-0 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white flex items-center justify-center rounded-2xl hover:shadow-xl hover:shadow-[#25D366]/30 hover:-translate-y-1 transition-all duration-300" title="Order via WhatsApp"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                          <button type="submit" disabled={isInlineOrderProcessing || inlineOrderSuccess} className="flex-1 bg-gradient-to-r from-primary to-red-600 text-white font-black py-3.5 rounded-2xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 relative overflow-hidden group hover:-translate-y-1 active:scale-95">
                            {isInlineOrderProcessing ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<>
                              <span className="relative z-10 flex items-center justify-center gap-2 animate-text-zoom drop-shadow-md">অর্ডার করুন ৳{(getProductPrice(selectedProduct, tempSelectedQty) * tempSelectedQty) + getDeliveryCharge([{product: selectedProduct, quantity: tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null) - (isApplyingRewardPoints ? availableRewardPoints : 0)}</span>
                            </>)}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  <div className="mt-2 mb-6 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-red-600 flex items-center gap-2 max-w-fit">
                    <Info size={16} /> Only For Online Order
                  </div>
                  {/* Wholesale Pricing Tiers */}
      
                  {selectedProduct.wholesaleTiers && selectedProduct.wholesaleTiers.length > 0 && (
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner mb-8 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                         <Tag size={20} className="text-secondary" />
                         <h4 className="text-lg md:text-xl font-black text-secondary uppercase tracking-normal">হোলসেল প্রাইস চার্ট</h4>
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
                               <span className="text-xs font-bold text-gray-700">{tier.minQty}+ পিস</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <span className="text-[10px] font-bold text-gray-400">৳</span>
                               <span className={`text-sm font-black ${
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
                          <p className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                            {["cloth", "t-shirt", "shirt", "panjabi", "fashion", "saree", "shoes", "polo", "pant", "jeans", "top", "dress", "kurti"].some(k => (selectedProduct.category?.toLowerCase() || "").includes(k)) ? <span>সাইজ/করুন? অনুযায়ী ক? পিস নিবেন</span> : <span>কো? করুন? ক? পিস নিবেন</span>}
                            <span className={"text-[10px] px-2 py-0.5 rounded-full " + (sumValues(wholesaleSizeQty) === tempSelectedQty ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                              টোটাল: {sumValues(wholesaleSizeQty)}/{tempSelectedQty}
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
                                  : ["ডিফল্ট"];
                              
                              return options.map((opt) => (
                                <div key={String(opt)} className="space-y-1">
                                  <label className="text-[9px] font-black text-gray-400 uppercase text-center block leading-none truncate">{String(opt)}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={wholesaleSizeQty[String(opt)] || ""}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setWholesaleSizeQty(prev => ({ ...prev, [String(opt)]: val }));
                                    }}
                                    placeholder="Qty"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-lg py-1.5 px-2 text-center text-xs font-black focus:ring-1 focus:ring-primary outline-none"
                                  />
                                </div>
                              ));
                            })()}
                          </div>
                          {sumValues(wholesaleSizeQty) !== tempSelectedQty && (
                            <p className="text-[9px] text-primary font-bold mt-2 animate-pulse">
                              * দয়া করে সব মিলিয়ে মোট {tempSelectedQty} পিস পূরণ করুন
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                                    {/* Inline Order Form (Rendered BELOW if wholesale mode is active) */}
                  {(selectedProduct.wholesaleTiers?.some(t => tempSelectedQty >= t.minQty)) && (
                    <form id="inline-order-form-wholesale" onSubmit={handleInlineOrderSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-4">
                      <h4 className="text-base md:text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-primary" fill="currentColor" /> দ্রুত অর্ডার করুন (হোলসেল)
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <input
                              id="inline-phone-input"
                              required
                              type="tel"
                              placeholder="আপনার ফোন নম্বর"
                              value={inlineOrderPhone}
                              onChange={(e) => setInlineOrderPhone(e.target.value)}
                              onFocus={() => setInlinePhoneFocused(true)}
                              onBlur={() => setTimeout(() => setInlinePhoneFocused(false), 250)}
                              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                            />
                            {inlinePhoneFocused && savedProfiles.filter(p => p.phone.includes(inlineOrderPhone)).length > 0 && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                                {savedProfiles.filter(p => p.phone.includes(inlineOrderPhone)).map((profile, index) => (
                                  <div
                                    key={index}
                                    onMouseDown={() => selectSavedProfile(profile, 'inline')}
                                    className="px-4 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                                  >
                                    <span className="font-bold text-secondary">{profile.phone}</span>
                                    {profile.name && <span className="text-gray-400 text-[10px]">{profile.name} - {profile.address}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input id="inline-name-input" required type="text" placeholder="আপনার নাম" value={inlineOrderName} onChange={(e) => setInlineOrderName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-base focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative w-full">
                            <div className="relative flex items-center">
                              <input
                                required
                                type="text"
                                placeholder="জেলা সিলেক্ট করুন"
                                value={isInlineDistrictOpenWholesale ? inlineDistrictSearchWholesale : inlineOrderDistrict}
                                onChange={(e) => {
                                  setInlineDistrictSearch(e.target.value);
                                  setIsInlineDistrictOpen(true);
                                }}
                                onFocus={() => {
                                  setInlineDistrictSearch("");
                                  setIsInlineDistrictOpen(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setIsInlineDistrictOpen(false);
                                    setInlineDistrictSearch("");
                                  }, 200);
                                }}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:border-primary outline-none transition-colors"
                              />
                              <span className="absolute right-3 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                              </span>
                            </div>
                            {isInlineDistrictOpenWholesale && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                                {ALL_DISTRICTS.filter(d => 
                                  d.toLowerCase().includes(inlineDistrictSearchWholesale.toLowerCase())
                                ).length > 0 ? (
                                  ALL_DISTRICTS.filter(d => 
                                    d.toLowerCase().includes(inlineDistrictSearchWholesale.toLowerCase())
                                  ).map((d) => (
                                    <div
                                      key={d}
                                      onMouseDown={() => {
                                        setInlineOrderDistrict(d);
                                        setInlineOrderThana("");
                                        if (d === "Dhaka") {
                                          setInlineOrderArea("inside");
                                        } else {
                                          setInlineOrderArea("outside");
                                        }
                                        setIsInlineDistrictOpen(false);
                                      }}
                                      className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                        inlineOrderDistrict === d ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                                      }`}
                                    >
                                      {d}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                   ঢাকার মধ্যে
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="relative w-full">
                            <div className="relative flex items-center">
                              <input
                                required
                                type="text"
                                placeholder="থানা/এলাকা সিলেক্ট করুন"
                                value={isInlineThanaOpenWholesale ? inlineThanaSearchWholesale : inlineOrderThana}
                                onChange={(e) => {
                                  setInlineThanaSearch(e.target.value);
                                  setIsInlineThanaOpen(true);
                                }}
                                onFocus={() => {
                                  setInlineThanaSearch("");
                                  setIsInlineThanaOpen(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setIsInlineThanaOpen(false);
                                    setInlineThanaSearch("");
                                  }, 200);
                                }}
                                disabled={!inlineOrderDistrict}
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:bg-gray-100"
                              />
                              <span className="absolute right-3 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                              </span>
                            </div>
                            {isInlineThanaOpenWholesale && inlineOrderDistrict && districtThanaMap[inlineOrderDistrict] && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                                {districtThanaMap[inlineOrderDistrict].filter(t => 
                                  t.toLowerCase().includes(inlineThanaSearchWholesale.toLowerCase())
                                ).length > 0 ? (
                                  districtThanaMap[inlineOrderDistrict].filter(t => 
                                    t.toLowerCase().includes(inlineThanaSearchWholesale.toLowerCase())
                                  ).map((t) => (
                                    <div
                                      key={t}
                                      onMouseDown={() => {
                                        setInlineOrderThana(t);
                                        setIsInlineThanaOpen(false);
                                      }}
                                      className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                        inlineOrderThana === t ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                                      }`}
                                    >
                                      {t}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                   ঢাকার মধ্যে
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
</div>
                        <textarea id="inline-address-input" required placeholder="সম্পূর্ণ ঠিকানা (বাসা, রোড, এলাকা)" value={inlineOrderAddress} onChange={(e) => setInlineOrderAddress(e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none" />
                        <textarea placeholder="অতিরিক্ত নোট লিখুন (ঐচ্ছিক)" value={inlineOrderNote} onChange={(e) => setInlineOrderNote(e.target.value)} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors resize-none" />
                        
                        {availableRewardPoints > 0 && (
                          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between my-2 gap-2">
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
                        {inlineOrderSuccess && (<div className="bg-green-50 text-green-700 text-xs font-bold p-3 rounded-xl border border-green-200 flex items-center justify-center gap-2"><Check size={16} /> অর্ডার সফল হয়েছে!</div>)}
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => { 
                            const totalWholesale = sumValues(wholesaleSizeQty);
                            if (totalWholesale !== tempSelectedQty) {
                              alert("ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন।");
                              return;
                            }
                            addToCartInternal(selectedProduct, tempSelectedColor || undefined, tempSelectedSize || undefined, tempSelectedQty, wholesaleSizeQty);
                            setIsProductDetailsOpen(false); 
                          }} className="w-12 shrink-0 bg-white border-2 border-primary text-primary flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors" title="Add to Cart"><ShoppingCart size={20} /></button>
                          <button type="button" onClick={() => { const totalWholesale = sumValues(wholesaleSizeQty); if (totalWholesale !== tempSelectedQty) { alert("দয়া করে সাইজ অনুযায়ী সঠিক পরিমাণ সিলেক্ট করুন?"); return; } const price = getProductPrice(selectedProduct, totalWholesale) * totalWholesale; const msg = `হাই, আমি ${selectedProduct.name} অর্ডার করতে চাচ্ছি (হোলসেল)।\nপরিমাণ: ${tempSelectedQty} পিস\n\nমূল্য: ৳${price}`; window.open(`https://wa.me/${(siteConfig?.whatsappNumber || siteConfig?.supportPhone1 || "01777600844").replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'); }} className="w-12 shrink-0 bg-[#25D366] text-white flex items-center justify-center rounded-xl hover:brightness-110 transition-colors shadow-lg shadow-[#25D366]/20" title="Order via WhatsApp"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></button>
                          <button type="submit" disabled={isInlineOrderProcessing || inlineOrderSuccess} onClick={(e) => {
                            const totalWholesale = sumValues(wholesaleSizeQty);
                            if (totalWholesale !== tempSelectedQty) {
                              e.preventDefault();
                              alert("দয়া করে সাইজ অনুযায়ী সঠিক পরিমাণ সিলেক্ট করুন।");
                              return;
                            }
                          }} className="flex-1 bg-primary text-white font-black py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 relative overflow-hidden group hover:scale-[1.02] active:scale-95">
                            {isInlineOrderProcessing ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<>
                              <span className="relative z-10 flex items-center justify-center gap-2 animate-text-zoom drop-shadow-md">অর্ডার করুন ৳{(wholesaleSizeQty && Object.keys(wholesaleSizeQty).length > 0 ? getProductPrice(selectedProduct, sumValues(wholesaleSizeQty)) * sumValues(wholesaleSizeQty) : getProductPrice(selectedProduct, tempSelectedQty) * tempSelectedQty) + getDeliveryCharge([{product: selectedProduct, quantity: sumValues(wholesaleSizeQty) || tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null) - (isApplyingRewardPoints ? availableRewardPoints : 0)}</span>
                            </>)}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
              </div>
          </motion.div>
                        {/* Star Tech Style Tabs & Sidebar Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8" id="product-description-tabs">
               <div className="lg:col-span-3">
                  {/* Tabs Header */}
                  <div className="flex flex-wrap gap-2 mb-0 border-b border-gray-200">
                    <button 
                      onClick={() => setActiveTab('specification')}
                      className={`px-6 py-2.5 text-sm md:text-base font-bold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'specification' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Specification
                    </button>
                    <button 
                      onClick={() => setActiveTab('description')}
                      className={`px-6 py-2.5 text-sm md:text-base font-bold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'description' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Description
                    </button>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      className={`px-6 py-2.5 text-sm md:text-base font-bold rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'reviews' ? 'bg-[#ef4a23] text-white border-[#ef4a23]' : 'bg-white text-gray-700 hover:text-[#ef4a23] border-transparent hover:bg-gray-50'}`}
                    >
                      Reviews ({activeReviews.length})
                    </button>
                  </div>

                  {/* Tabs Content */}
                  <div className="bg-white rounded-b-2xl rounded-tr-2xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
                    
                    {/* SPECIFICATION TAB */}
                    {activeTab === 'specification' && (
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Specification</h2>
                        
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
                                  <div className="col-span-1 p-3 text-sm text-gray-600 bg-gray-50 md:bg-transparent md:border-r border-gray-100">{spec.name}</div>
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
                      <div className="animate-in fade-in duration-300">
                        <h2 className="text-xl font-black text-gray-900 mb-6">Description</h2>
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
                        <h2 className="text-xl font-black text-gray-900 mb-6">Reviews ({activeReviews.length})</h2>
                        
                        {/* Write Review Form */}
                        <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                           <h4 className="text-lg font-black text-gray-900 mb-4">আপনার রেটিং ও রিভিউ দিন</h4>
                           <div className="space-y-4 max-w-2xl">
                             <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className={`p-1.5 transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                                  >
                                    <Star size={28} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                                  </button>
                                ))}
                             </div>
                             
                             {!user && (
                               <input
                                 type="text"
                                 placeholder="আপনার নাম"
                                 value={reviewForm.guestName}
                                 onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium bg-white"
                               />
                             )}
                             
                             <textarea
                               placeholder="আপনার কমেন্ট লিখুন..."
                               value={reviewForm.comment}
                               onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium h-32 resize-none bg-white"
                             ></textarea>
                             
                             <div className="text-left">
                               <label htmlFor="reviewImageUpload" className="inline-flex items-center justify-start gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                                 <Camera size={18} />
                                 ছবি যুক্ত করুন (সর্বোচ্চ ৫টি)
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
                               className="bg-primary text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                             >
                               {isSubmittingReview ? "সাবমিট হচ্ছে..." : "রিভিউ জমা দিন"}
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
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
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
        )
    </>
  );
}
