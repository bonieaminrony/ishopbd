import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { FlashSaleCountdown } from './FlashSaleCountdown';
import { Zap, ChevronRight, Star, X, LayoutGrid, ChevronDown, ChevronLeft } from 'lucide-react';

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

  return (
    <>
      {activeCampaign && (
        <div className="container mx-auto px-4 mb-6">
          {activeCampaign.image ? (
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-md border border-gray-100 bg-gray-50 mb-4">
              <img
                loading="eager"
                decoding="async"
                src={activeCampaign.image}
                className="w-full h-auto block max-h-[420px] object-cover"
                alt={activeCampaign.name}
              />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-primary via-rose-600 to-amber-600 text-white p-6 sm:p-10 mb-4 shadow-lg">
              <div className="max-w-2xl">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
                  🔥 স্পেশাল ক্যাম্পেইন
                </span>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight font-ador mb-2">
                  {activeCampaign.name}
                </h1>
                {activeCampaign.description && (
                  <p className="text-sm sm:text-base text-white/90 font-medium font-ador max-w-xl">
                    {cleanLatex(activeCampaign.description || "")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
        {/* 4.5 Featured Section (Only on Homepage) */}
        {selectedCategory === "all" && !searchQuery && !activeCampaign && !isTrendingFilterActive && (
          <div className="space-y-6 mb-6">
            {/* Featured Products Grid */}
            {isLoading && featuredProducts.length === 0 ? (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("জনপ্রিয় পণ্য", "Popular Products")}
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
                    <h3 className="text-xl md:text-2xl font-bold text-secondary">
                      {t("জনপ্রিয় পণ্য", "Popular Products")}
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
          <section id="flash-sale-section" className="mb-10 relative p-[2px] rounded-[2.6rem] overflow-hidden shadow-2xl shadow-red-500/10 transform-gpu">
            {/* Running Border Effect Background */}
            <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,#f00b24_0%,#ff3d54_25%,transparent_40%,#f00b24_50%,#ff3d54_75%,transparent_90%,#f00b24_100%)] animate-[spin_4s_linear_infinite] origin-center pointer-events-none z-0"></div>
            
            {/* Inner Content Card */}
            <div className="relative w-full bg-white rounded-[2.5rem] overflow-hidden z-10 flex flex-col transform-gpu">
              {/* Red Countdown Header Container */}
              <div className="bg-[#f00b24] p-6 md:p-8 text-white relative overflow-hidden flex flex-col items-center justify-center gap-4 shadow-xl transform-gpu">
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform translate-x-20 -translate-y-20"></div>
                
                <div className="flex items-center gap-2 relative z-10 animate-text-zoom">
                  <Zap className="text-yellow-300 fill-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" size={32} />
                  <h3 className="text-3xl md:text-4xl font-black italic tracking-widest text-white drop-shadow-md">
                    FLASHSALE
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
                          : t("সকল প্রোডাক্ট", "All Products")}
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
            {!activeCampaign ? (
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveCampaign(null);
                  window.history.pushState({}, "", "/");
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <Home size={14} />
                <span>সাইটের সব পণ্য দেখুন</span>
              </button>
            )}
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
        </div>
    </>
  );
}

export const MemoizedShopList = React.memo(ShopList);

