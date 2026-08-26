import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FlashSaleCountdown } from './FlashSaleCountdown';
import { Zap, ChevronRight, Star, X, LayoutGrid, ChevronDown, ChevronLeft, Leaf, ShieldCheck, Truck, Sparkles, Award, HeartHandshake, CheckCircle2, Flame, ShoppingCart, Heart } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';
import { DEFAULT_BANNERS } from '../constants/data';

export interface ShopListProps {
  activeCampaign: any;
  cleanLatex: any;
  setActiveCampaign: any;
  Home: any;
  selectedCategory: any;
  searchQuery: any;
  isTrendingFilterActive: any;
  newArrivals: any;
  t: any;
  ProductCard: any;
  openProductDetails: any;
  handleBuyNow: any;
  handleLikeProduct: any;
  likedProducts: any;
  featuredProducts: any;
  featuredScrollRef: any;
  handleFeaturedScroll: any;
  featuredScrollPercent: any;
  setFeaturedScrollPercent: any;
  handleFeaturedSliderChange: any;
  isProductDetailsOpen: any;
  flashSaleProducts: any;
  selectedBrand: any;
  minPrice: any;
  maxPrice: any;
  setIsTrendingFilterActive: any;
  setSelectedCategory: any;
  setSearchInput: any;
  setSelectedBrand: any;
  setMinPrice: any;
  setMaxPrice: any;
  setIsFilterMenuOpen: any;
  isFilterMenuOpen: any;
  sortBy: any;
  setSortBy: any;
  FilterMenuModal: any;
  isLoading: any;
  productsPerPage: any;
  ProductSkeleton: any;
  filteredProducts: any;
  PackageOpen: any;
  currentPage: any;
  setCurrentPage: any;
  brands: any;
  categories: any;
}

export default function ShopList(props: ShopListProps) {
  const {
    activeCampaign,
    cleanLatex,
    setActiveCampaign,
    Home,
    selectedCategory,
    searchQuery,
    isTrendingFilterActive,
    newArrivals,
    t,
    ProductCard,
    openProductDetails,
    handleBuyNow,
    handleLikeProduct,
    likedProducts,
    featuredProducts,
    featuredScrollRef,
    handleFeaturedScroll,
    featuredScrollPercent,
    setFeaturedScrollPercent,
    handleFeaturedSliderChange,
    isProductDetailsOpen,
    flashSaleProducts,
    selectedBrand,
    minPrice,
    maxPrice,
    setIsTrendingFilterActive,
    setSelectedCategory,
    setSearchInput,
    setSelectedBrand,
    setMinPrice,
    setMaxPrice,
    setIsFilterMenuOpen,
    isFilterMenuOpen,
    sortBy,
    setSortBy,
    FilterMenuModal,
    isLoading,
    productsPerPage,
    ProductSkeleton,
    filteredProducts,
    PackageOpen,
    currentPage,
    setCurrentPage,
    categories,
    brands,
  } = props;

  const { products } = useProductContext();
  const { addToCart } = useCartContext();

  const topSellingList = React.useMemo(() => {
    if (featuredProducts && featuredProducts.length >= 4) {
      return featuredProducts.slice(0, 4);
    }
    if (products && products.length >= 4) {
      return products.slice(0, 4);
    }
    return products || [];
  }, [featuredProducts, products]);

  const siteTitle = t(
    "রকমারি পণ্য হাড়ি (Rokomari Ponno Hari) - ১০০% খাঁটি ও প্রাকৃতিক অর্গানিক পণ্যের অনলাইন শপ",
    "Rokomari Ponno Hari - 100% Pure & Natural Organic Food Shop"
  );
  const siteDescription = t(
    "সুন্দরবনের প্রাকৃতিক চাকের খাঁটি মধু, কাঠের ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি, প্রিমিয়াম মরিয়ম খেজুর, ড্রাই ফ্রুটস ও অর্গানিক খাদ্যপণ্য কিনুন সেরা মূল্যে।",
    "Buy pure raw honey, wood-pressed mustard oil, homemade cow ghee, dates, dry fruits and organic essentials online."
  );

  const [currentSlide, setCurrentSlide] = React.useState(0);
  const heroBanners = React.useMemo(() => {
    return DEFAULT_BANNERS.filter((b: any) => (b.type || 'hero') === 'hero');
  }, []);
  const bTop = React.useMemo(() => DEFAULT_BANNERS.find((b: any) => b.type === 'right_top'), []);
  const bBottom = React.useMemo(() => DEFAULT_BANNERS.find((b: any) => b.type === 'right_bottom'), []);

  React.useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  return (
    <div className="w-full flex-1">
      {/* 4. Products Grid */}
      <section id="product-display-section" className="relative">
        <Helmet>
          <title>{siteTitle}</title>
          <meta name="description" content={siteDescription} />
        </Helmet>
        {activeCampaign && (
          <div className="container mx-auto px-4 pt-4 pb-2">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
                  <Zap size={20} className="animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                    স্পেশাল অফার
                  </span>
                  <h3 className="text-base font-black text-secondary">
                    {cleanLatex(activeCampaign.title || activeCampaign.name)}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold">
                    {cleanLatex(activeCampaign.subtitle || activeCampaign.description)}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveCampaign(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("campaign");
                  window.history.pushState({}, "", url.toString());
                }}
                className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-primary/90"
              >
                বন্ধ করুন
              </motion.button>
            </div>
          </div>
        )}
        {/* 4.5 Featured & New Arrivals Section (Only on Homepage) */}
        {selectedCategory === "all" && !searchQuery && !activeCampaign && !isTrendingFilterActive && (
          <div className="space-y-6 mb-8">
            {/* 1. Hero Banner Slider & Side Banners */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              {/* Main 3/4 Slider */}
              <div className="md:col-span-3 relative overflow-hidden shadow-xl rounded-2xl md:rounded-3xl border border-stone-100 bg-white min-h-[240px] md:min-h-[380px] group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full min-h-[240px] md:min-h-[380px]"
                  >
                    <img
                      src={heroBanners[currentSlide % heroBanners.length]?.image}
                      className="w-full h-full object-cover block absolute inset-0"
                      loading="eager"
                      alt={heroBanners[currentSlide % heroBanners.length]?.title || "রকমারি পণ্য হাড়ি ব্যানার"}
                    />
                    {/* Dark gradient overlay for crystal clear typography */}
                    <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-14 text-white bg-gradient-to-r from-black/80 via-black/45 to-transparent">
                      <div className="max-w-xl py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FA838]/30 border border-[#6FA838]/60 text-[#96D657] text-xs font-bold mb-2.5 backdrop-blur-xs">
                          <Leaf size={13} className="text-[#96D657]" />
                          <span>{t("১০০% খাঁটি ও প্রাকৃতিক অর্গানিক খাদ্যপণ্য", "100% Pure & Organic")}</span>
                        </div>

                        <motion.h2
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2 font-black tracking-tight text-white drop-shadow-xl font-sans leading-tight"
                        >
                          {heroBanners[currentSlide % heroBanners.length]?.title}
                        </motion.h2>

                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="text-xs sm:text-sm md:text-base opacity-90 text-white/90 drop-shadow-lg font-sans line-clamp-2 max-w-lg mb-4"
                        >
                          {heroBanners[currentSlide % heroBanners.length]?.subtitle}
                        </motion.p>

                        <button
                          onClick={() => {
                            document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="bg-[#6FA838] hover:bg-[#5E942E] text-white text-xs sm:text-sm font-bold px-5 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-[#6FA838]/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          <Zap size={15} className="fill-white" />
                          <span>{t("এখনই কেনাকাটা করুন", "Shop Now")}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left/Right Arrows */}
                {heroBanners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/70 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-md"
                      title="Previous"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/70 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer shadow-md"
                      title="Next"
                    >
                      <ChevronRight size={22} />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {heroBanners.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setCurrentSlide(dotIdx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            (currentSlide % heroBanners.length) === dotIdx
                              ? "w-6 bg-[#6FA838] shadow-xs"
                              : "w-2 bg-white/50 hover:bg-white/80"
                          }`}
                          title={`Slide ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right 1/4 Side Promo Cards - Combo Packs */}
              <div className="col-span-1 md:flex hidden flex-col gap-4">
                {/* Top Promo - Combo 1 */}
                <div
                  onClick={() => {
                    document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 bg-white rounded-2xl md:rounded-3xl border border-stone-150 overflow-hidden shadow-md group hover:shadow-lg transition-all relative min-h-[120px] md:min-h-0 cursor-pointer"
                >
                  <img
                    src={bTop?.image || "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=500&fit=crop"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                    alt={bTop?.title || "মধু + ঘি + সরিষার তেল কম্বো"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold bg-[#D2A96A] text-[#2C3534] px-2 py-0.5 rounded-md inline-block mb-1 shadow-xs">
                        🎁 {t("মেগা কম্বো প্যাক", "Mega Combo Pack")}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold line-clamp-1 text-white drop-shadow">
                        {bTop?.title || "মধু + ঘি + সরিষার তেল কম্বো প্যাক"}
                      </h4>
                      <p className="text-[10px] text-white/80 line-clamp-1 font-sans">
                        {bTop?.subtitle || "একসাথে ৩টি খাঁটি খাদ্যপণ্য কিনুন বিশেষ ছাড়ে"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Promo - Combo 2 */}
                <div
                  onClick={() => {
                    document.getElementById("flash-sale-section")?.scrollIntoView({ behavior: "smooth" }) ||
                    document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 bg-white rounded-2xl md:rounded-3xl border border-stone-150 overflow-hidden shadow-md group hover:shadow-lg transition-all relative min-h-[120px] md:min-h-0 cursor-pointer"
                >
                  <img
                    src={bBottom?.image || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&h=500&fit=crop"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                    alt={bBottom?.title || "হানি নাট ও মরিয়ম খেজুর কম্বো"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold bg-[#BB7154] text-white px-2 py-0.5 rounded-md inline-block mb-1 shadow-xs">
                        ⚡ {t("ধামাকা কম্বো অফার", "Dhamaka Combo Offer")}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold line-clamp-1 text-white drop-shadow">
                        {bBottom?.title || "প্রিমিয়াম হানি নাট ও মরিয়ম খেজুর কম্বো"}
                      </h4>
                      <p className="text-[10px] text-white/80 line-clamp-1 font-sans">
                        {bBottom?.subtitle || "প্রাকৃতিক এনার্জি ও পুষ্টির সেরা কম্বিনেশন"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organic Categories Showcase (Seamless & Clean) */}
            {categories && categories.length > 0 && (
              <section className="my-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Leaf size={18} className="text-emerald-700" />
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-secondary font-sans">
                      {t("জনপ্রিয় ক্যাটাগরি", "Popular Categories")}
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-2.5">
                  {categories.map((cat: any) => {
                    const categoryEmojiMap: Record<string, string> = {
                      "কৃত্তিক চাকের মধু": "🍯",
                      "বিভিন্ন ফুলের মধু": "🐝",
                      "গাওয়া ঘি": "🧈",
                      "সরিষার তেল": "🛢️",
                      "খেজুরের গুড়": "🌴",
                      "আখের গুড়": "🌾",
                      "রসালো লিচু": "🍒",
                      "খাঁটি আম": "🥭",
                    };
                    const emoji = categoryEmojiMap[cat.name] || "🌿";
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer group ${
                          isSelected
                            ? "bg-emerald-800 text-white shadow-md scale-105"
                            : "bg-white/70 hover:bg-white border border-stone-200/60 hover:border-emerald-600/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-1"
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">{emoji}</span>
                        <span className={`text-[11px] sm:text-xs font-bold text-center line-clamp-2 leading-tight ${isSelected ? "text-white" : "text-stone-800 group-hover:text-emerald-800"}`}>
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Selling Products (Ultra-Premium 2x2 Clean Showcase) */}
            {topSellingList && topSellingList.length > 0 && (
              <section className="my-8">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <Flame size={22} className="text-[#6FA838] fill-[#6FA838]" />
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary font-sans">
                      {t("টপ সেলিং পণ্য", "Top Selling Products")}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-[#6FA838] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t("সব দেখুন", "View All")}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {topSellingList.slice(0, 4).map((product: any, index: number) => {
                    const price = product.price || 0;
                    const originalPrice = product.originalPrice || (product.price ? Math.round(product.price * 1.2) : 0);
                    const savings = originalPrice > price ? originalPrice - price : 0;
                    const showBestSellingBadge = index === 0 || index === 3;

                    return (
                      <div
                        key={product.id || index}
                        className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 p-4 sm:p-5 flex flex-row items-center gap-4 sm:gap-6 relative overflow-hidden group"
                      >
                        {/* Best Selling Top-Right Badge */}
                        {showBestSellingBadge && (
                          <div className="absolute top-0 right-0 bg-[#6FA838] text-white text-[10px] sm:text-[11px] font-bold px-3.5 py-1 rounded-bl-2xl shadow-xs flex items-center gap-1 z-10">
                            <Flame size={12} className="fill-white text-white" />
                            <span>{t("বেস্ট সেলিং", "Best Selling")}</span>
                          </div>
                        )}

                        {/* Product Image - Significantly Larger & Crisp */}
                        <div
                          onClick={() => openProductDetails(product)}
                          className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 shrink-0 flex items-center justify-center cursor-pointer p-2 bg-stone-50/80 rounded-2xl group-hover:scale-105 transition-transform duration-300 border border-stone-100 overflow-hidden"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4
                            onClick={() => openProductDetails(product)}
                            className="text-sm sm:text-base md:text-lg font-bold text-secondary hover:text-[#6FA838] line-clamp-2 leading-snug cursor-pointer transition-colors font-sans"
                          >
                            {product.name}
                          </h4>

                          {/* Pricing & Save Badge */}
                          <div className="mt-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg sm:text-xl md:text-2xl font-black text-[#6FA838] font-sans tracking-tight">
                                ৳{price.toLocaleString('bn-BD')}
                              </span>
                              {originalPrice > price && (
                                <span className="text-xs sm:text-sm text-stone-400 line-through font-normal">
                                  ৳{originalPrice.toLocaleString('bn-BD')}
                                </span>
                              )}
                            </div>

                            {savings > 0 && (
                              <div className="mt-1.5">
                                <span className="bg-[#6FA838]/15 text-[#4D7C23] border border-[#6FA838]/30 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block">
                                  Save ৳{savings.toLocaleString('bn-BD')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 sm:gap-3 mt-3.5 flex-wrap sm:flex-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                              }}
                              className="border border-[#6FA838] text-[#6FA838] hover:bg-[#6FA838] hover:text-white bg-transparent rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              <ShoppingCart size={14} />
                              <span>{t("কার্ট", "Add To Cart")}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBuyNow(product);
                              }}
                              className="bg-[#6FA838] hover:bg-[#5E942E] text-white rounded-xl px-4 sm:px-5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#6FA838]/25 cursor-pointer active:scale-95 hover:shadow-lg"
                            >
                              <ShoppingCart size={14} className="fill-white" />
                              <span>{t("অর্ডার করুন", "Buy now")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* New Arrivals Horizontal Scroll */}
            {isLoading && newArrivals.length === 0 ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={24} />
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("নতুন পণ্য", "New Arrivals")}
                    </h3>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth px-4 md:px-0">
                  <div className="flex gap-2.5 md:gap-4 pb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`na-skel-${i}`} className="w-[160px] sm:w-[175px] md:w-[calc(20%-12.8px)] shrink-0">
                        <ProductSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : newArrivals.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={24} />
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("নতুন পণ্য", "New Arrivals")}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                        // Just scroll to products and show all if they want
                        document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    {t("সব দেখুন", "View All")} <ChevronRight size={16} />
                  </button>
                </div>
                <div className="relative group">
                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("scroll-container-new-arrivals");
                      if (container) {
                        container.scrollBy({ left: -350, behavior: "smooth" });
                      }
                    }}
                    className="absolute -left-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    title="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div 
                    id="scroll-container-new-arrivals"
                    className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth px-4 md:px-0"
                  >
                    <div className="flex gap-2.5 md:gap-4 pb-4">
                      {newArrivals.map((product) => (
                        <div key={product.id} className="w-[160px] sm:w-[175px] md:w-[calc(20%-12.8px)] shrink-0">
                          <ProductCard 
                            product={product}
                            openProductDetails={openProductDetails}
                            t={t}
                            handleBuyNow={handleBuyNow}
                            handleLikeProduct={handleLikeProduct}
                            isLiked={likedProducts.includes(product.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("scroll-container-new-arrivals");
                      if (container) {
                        container.scrollBy({ left: 350, behavior: "smooth" });
                      }
                    }}
                    className="absolute -right-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    title="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </section>
            ) : null}
            {/* Featured Products Grid */}
            {isLoading && featuredProducts.length === 0 ? (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={24} />
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("সেরা পণ্য", "Featured Products")}
                    </h3>
                  </div>
                </div>
                <div className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth">
                  <div className="flex gap-2.5 md:gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={`feat-skel-${i}`} className="w-[160px] sm:w-[175px] md:w-[calc(20%-12.8px)] shrink-0">
                        <ProductSkeleton />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : featuredProducts.length > 0 ? (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={24} />
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("সেরা পণ্য", "Featured Products")}
                    </h3>
                  </div>
                </div>
                <div className="relative group">
                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    onClick={() => {
                      featuredScrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
                    }}
                    className="absolute -left-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    title="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div 
                    ref={featuredScrollRef}
                    onScroll={handleFeaturedScroll}
                    className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth"
                  >
                    <div className="flex gap-2.5 md:gap-4">
                      {featuredProducts.map((product) => (
                        <div key={product.id} className="w-[160px] sm:w-[175px] md:w-[calc(20%-12.8px)] shrink-0">
                          <ProductCard 
                            product={product}
                            openProductDetails={openProductDetails}
                            t={t}
                            handleBuyNow={handleBuyNow}
                            handleLikeProduct={handleLikeProduct}
                            isLiked={likedProducts.includes(product.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    onClick={() => {
                      featuredScrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
                    }}
                    className="absolute -right-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                    title="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                {/* Scroll Indicator for Featured Products */}
                {featuredProducts.length > (window.innerWidth < 768 ? 2 : 4) && (
                  <div className="hidden md:flex mt-6 px-4 flex-col items-center gap-2">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={featuredScrollPercent}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setFeaturedScrollPercent(val);
                        handleFeaturedSliderChange(val);
                      }}
                      className="w-full max-w-[200px] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {t("আরও দেখতে টেনে আনুন", "Slide to see more")}
                    </p>
                  </div>
                )}
              </section>
            ) : null}
          </div>
        )}
        {/* Flash Sale Section */}
        {!isProductDetailsOpen && !activeCampaign && flashSaleProducts.length > 0 && (
          <section id="flash-sale-section" className="mb-10 relative p-[2px] rounded-[2.4rem] overflow-hidden shadow-2xl shadow-[#2C3534]/10 transform-gpu">
            {/* Running Border Effect Background */}
            <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,#D2A96A_0%,#5C6E6C_25%,transparent_40%,#BB7154_50%,#A6B7AA_75%,transparent_90%,#D2A96A_100%)] animate-[spin_6s_linear_infinite] origin-center pointer-events-none z-0"></div>
            
            {/* Inner Content Card */}
            <div className="relative w-full bg-white rounded-[2.3rem] overflow-hidden z-10 flex flex-col transform-gpu">
              {/* Countdown Header Container */}
              <div className="bg-gradient-to-r from-[#5C6E6C] via-[#485755] to-[#2C3534] p-5 md:p-7 text-white relative overflow-hidden flex flex-col items-center justify-center gap-3 shadow-xl transform-gpu">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
                
                <div className="flex items-center gap-2 relative z-10 animate-text-zoom">
                  <Zap className="text-[#D2A96A] fill-[#D2A96A] drop-shadow-[0_0_10px_rgba(210,169,106,0.8)]" size={28} />
                  <h3 className="text-2xl md:text-3xl font-black italic tracking-wider text-white drop-shadow-md font-sans">
                    ⚡ স্পেশাল অর্গানিক অফার — FLASH SALE
                  </h3>
                </div>
                
                {/* Centered Countdown Timer */}
                <div className="relative z-10 w-full flex justify-center mt-1">
                  <FlashSaleCountdown products={flashSaleProducts} />
                </div>
              </div>
              {/* White Cards Container */}
              <div className="bg-white p-4 md:p-6 relative group">
                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById("scroll-container-flash-sale");
                    if (container) {
                      container.scrollBy({ left: -350, behavior: "smooth" });
                    }
                  }}
                  className="absolute left-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>

                <div 
                  id="scroll-container-flash-sale"
                  className="overflow-x-auto no-scrollbar"
                >
                  <div className="flex gap-3 md:gap-4 pb-2">
                    {flashSaleProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="w-[170px] md:w-[210px] shrink-0">
                        <ProductCard 
                          product={product}
                          openProductDetails={openProductDetails}
                          t={t}
                          handleBuyNow={handleBuyNow}
                          handleLikeProduct={handleLikeProduct}
                          isLiked={likedProducts.includes(product.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById("scroll-container-flash-sale");
                    if (container) {
                      container.scrollBy({ left: 350, behavior: "smooth" });
                    }
                  }}
                  className="absolute right-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </section>
        )}
        {/* 5. Product Display (General) */}
        <div id="product-display-section" className="mb-6 min-h-[400px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl md:text-2xl font-bold border-l-4 border-primary pl-3 text-secondary">
                {isTrendingFilterActive 
                  ? t("ট্রেন্ডিং প্রোডাক্টস", "Trending Products")
                  : activeCampaign 
                    ? activeCampaign.name 
                    : selectedCategory !== "all" 
                      ? selectedCategory
                      : selectedBrand !== "all"
                        ? selectedBrand
                        : searchQuery
                          ? t("সার্চ রেজাল্ট", "Search Results")
                          : t("সকল অর্গানিক পণ্য", "All Organic Products")}
              </h3>
              {(isTrendingFilterActive || selectedCategory !== "all" || searchQuery || selectedBrand !== "all" || minPrice !== "" || maxPrice !== "") && (
                <button 
                  onClick={() => {
                    setIsTrendingFilterActive(false);
                    setSelectedCategory("all");
                    setSearchInput("");
                    setSelectedBrand("all");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full transition-all flex items-center gap-2 text-xs font-bold"
                  title={t("ফিল্টার মুছুন", "Clear Filter")}
                >
                  <X size={14} /> {t("মুছুন", "Clear")}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {/* Filter Toggle */}
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-bold whitespace-nowrap ${
                  isFilterMenuOpen || selectedBrand !== "all" || minPrice !== "" || maxPrice !== ""
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary"
                }`}
              >
                <LayoutGrid size={18} />
                {t("ফিল্টার", "Filters")}
                {(selectedBrand !== "all" || minPrice !== "" || maxPrice !== "") && (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
              {/* Quick Sort Dropdown */}
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-gray-200 text-gray-600 px-4 py-2 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:border-primary cursor-pointer hover:border-primary transition-all shadow-sm"
                >
                  <option value="newest">{t("নতুনগুলো আগে", "Newest Arrivals")}</option>
                  <option value="price_low">{t("দাম: কম থেকে বেশি", "Price: Low to High")}</option>
                  <option value="price_high">{t("দাম: বেশি থেকে কম", "Price: High to Low")}</option>
                  <option value="popularity">{t("জনপ্রিয়তা", "Popularity")}</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {/* Expanded Filter Menu */}
          <AnimatePresence>
            {isFilterMenuOpen && <FilterMenuModal {...{ t, minPrice, setMinPrice, maxPrice, setMaxPrice, brands, setSelectedBrand, selectedBrand, setIsFilterMenuOpen, isFilterMenuOpen }} />}
          </AnimatePresence>
          {isLoading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-0">
              {Array.from({ length: productsPerPage }).map((_, i) => <ProductSkeleton key={`skeleton-${i}`} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <PackageOpen className="w-24 h-24 text-gray-300 mb-4" strokeWidth={1} />
               <p className="text-xl text-gray-500 font-bold">{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 px-1 sm:px-2 md:px-0">
              {filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage).map((product) => (
                <ProductCard 
                key={product.id}
                product={product}
                openProductDetails={openProductDetails}
                t={t}
                handleBuyNow={handleBuyNow}
                handleLikeProduct={handleLikeProduct}
              
                isLiked={likedProducts.includes(product.id)}
                />
            ))}
          </div>
          )}
          {filteredProducts.length > productsPerPage && (
            <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
              <motion.button
                whileHover={currentPage !== 1 ? { scale: 1.02, x: -2 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.98 } : {}}
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 flex items-center gap-1.5 font-semibold text-sm text-gray-500 hover:text-primary hover:bg-gray-100 cursor-pointer"
              >
                <ChevronLeft size={18} />
                <span>{t("আগের", "Prev")}</span>
              </motion.button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === Math.ceil(filteredProducts.length / productsPerPage) || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    const isActive = currentPage === pageNum;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer text-sm ${
                          isActive 
                            ? "text-primary font-black scale-110" 
                            : "text-gray-500 hover:text-primary hover:bg-gray-100 font-semibold"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  } else if (
                    (pageNum === currentPage - 2 && pageNum > 1) || 
                    (pageNum === currentPage + 2 && pageNum < Math.ceil(filteredProducts.length / productsPerPage))
                  ) {
                    return <span key={pageNum} className="text-gray-400 px-1 font-semibold">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <motion.button
                whileHover={currentPage !== Math.ceil(filteredProducts.length / productsPerPage) ? { scale: 1.02, x: 2 } : {}}
                whileTap={currentPage !== Math.ceil(filteredProducts.length / productsPerPage) ? { scale: 0.98 } : {}}
                onClick={() => {
                  setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / productsPerPage), prev + 1));
                  document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                className="px-3 py-2 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 flex items-center gap-1.5 font-semibold text-sm text-gray-500 hover:text-primary hover:bg-gray-100 cursor-pointer"
              >
                <span>{t("পরবর্তী", "Next")}</span>
                <ChevronRight size={18} />
              </motion.button>
            </div>
          )}

          {/* Organic Value Proposition / Trust Strip (Placed at bottom before Why Choose) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 my-10">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md hover:-translate-y-0.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Leaf size={20} className="text-emerald-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-800 font-sans leading-tight">{t("১০০% খাঁটি ও প্রাকৃতিক", "100% Pure & Natural")}</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 truncate">{t("চাক ও বাগান থেকে সরাসরি", "Direct Farm & Hive")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md hover:-translate-y-0.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Truck size={20} className="text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-800 font-sans leading-tight">{t("ক্যাশ অন ডেলিভারি", "Cash on Delivery")}</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 truncate">{t("সারাদেশে দ্রুত হোম ডেলিভারি", "Fast Nationwide Delivery")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md hover:-translate-y-0.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} className="text-emerald-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-800 font-sans leading-tight">{t("প্রিজারভেটিভ মুক্ত", "Chemical Free")}</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 truncate">{t("শতভাগ বিশুদ্ধতার নিশ্চয়তা", "100% Pure Guarantee")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:shadow-md hover:-translate-y-0.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles size={20} className="text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-800 font-sans leading-tight">{t("প্রিমিয়াম কোয়ালিটি", "Premium Quality")}</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 truncate">{t("আসল স্বাদ ও পুষ্টির সমাহার", "Rich Taste & Health")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
