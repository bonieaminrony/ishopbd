import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          <>
            {activeCampaign && (
              <div className="relative bg-black overflow-hidden mb-12 shadow-2xl">
                {activeCampaign.image && (
                  <img
                    loading="lazy"
                    decoding="async"
                    src={activeCampaign.image}
                    className="w-full h-auto block"
                    alt={activeCampaign.name}
                  />
                )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              {!activeCampaign.image && (
                <>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl md:text-6xl font-black text-center mb-4 tracking-tighter font-ador"
                  >
                    {activeCampaign.name}
                  </motion.h2>
                  {activeCampaign.description && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm md:text-lg text-center max-w-2xl opacity-90 font-bold font-ador"
                    >
                      {cleanLatex(activeCampaign.description || "")}
                    </motion.p>
                  )}
                </>
              )}
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setActiveCampaign(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("campaign");
                  window.history.pushState({}, "", url.toString());
                }}
                className="mt-8 flex items-center gap-2 bg-cream text-black px-8 py-3 rounded-full font-black text-xs hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95 group"
              >
                <Home
                  size={16}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
              হোম পেজে ফিরে যান
              </motion.button>
            </div>
          </div>
        )}
        {/* 4.5 Featured & New Arrivals Section (Only on Homepage) */}
        {selectedCategory === "all" && !searchQuery && !activeCampaign && !isTrendingFilterActive && (
          <div className="space-y-6 mb-6">
            {/* New Arrivals Horizontal Scroll */}
            {newArrivals.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-primary" size={24} />
                    <h3 className="text-xl md:text-2xl font-black text-secondary">
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
                <div className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth px-4 md:px-0">
                  <div className="flex gap-2 md:gap-4 pb-4">
                    {newArrivals.map((product) => (
                      <div key={product.id} className="w-[calc(50%-4px)] md:w-[calc(20%-12.8px)] shrink-0">
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
              </section>
            )}
            {/* Featured Products Grid */}
            {featuredProducts.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={24} />
                    <h3 className="text-xl md:text-2xl font-black text-secondary">
                      {t("সেরা পণ্য", "Featured Products")}
                    </h3>
                  </div>
                </div>
                <div 
                  ref={featuredScrollRef}
                  onScroll={handleFeaturedScroll}
                  className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth"
                >
                  <div className="flex gap-2 md:gap-4">
                    {featuredProducts.map((product) => (
                      <div key={product.id} className="w-[calc(50%-4px)] md:w-[calc(20%-12.8px)] shrink-0">
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
            )}
          </div>
        )}
        {/* Flash Sale Section */}
        {console.log("Flash sale render - cache bust v7")}
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
              <div className="bg-white p-4 md:p-6 overflow-x-auto no-scrollbar">
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
                  : (activeCampaign ? activeCampaign.name : t("পপুলার", "Popular"))}
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
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-1 md:gap-4 px-1">
              {Array.from({ length: productsPerPage }).map((_, i) => <ProductSkeleton key={`skeleton-${i}`} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <PackageOpen className="w-24 h-24 text-gray-300 mb-4" strokeWidth={1} />
               <p className="text-xl text-gray-500 font-bold">{t("কোনো পণ্য পাওয়া যায়নি", "No products found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-1 md:gap-4 px-1">
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
                whileHover={currentPage !== 1 ? { scale: 1.02 } : {}}
                whileTap={currentPage !== 1 ? { scale: 0.98 } : {}}
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-primary disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 flex items-center gap-2 font-medium text-sm text-gray-500 hover:text-primary shadow-sm hover:shadow-md cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t("আগের", "Prev")}</span>
              </motion.button>
              
              <div className="flex items-center gap-2">
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
                        className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                          isActive 
                            ? "bg-primary text-white shadow-lg shadow-primary/30 border border-primary font-semibold scale-105" 
                            : "bg-white border border-gray-200 text-gray-500 font-medium hover:text-primary hover:border-primary hover:shadow-sm"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  } else if (
                    (pageNum === currentPage - 2 && pageNum > 1) || 
                    (pageNum === currentPage + 2 && pageNum < Math.ceil(filteredProducts.length / productsPerPage))
                  ) {
                    return <span key={pageNum} className="text-gray-400 px-1 font-medium">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <motion.button
                whileHover={currentPage !== Math.ceil(filteredProducts.length / productsPerPage) ? { scale: 1.02 } : {}}
                whileTap={currentPage !== Math.ceil(filteredProducts.length / productsPerPage) ? { scale: 0.98 } : {}}
                onClick={() => {
                  setCurrentPage(prev => Math.min(Math.ceil(filteredProducts.length / productsPerPage), prev + 1));
                  document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-primary disabled:opacity-40 disabled:pointer-events-none transition-all duration-300 flex items-center gap-2 font-medium text-sm text-gray-500 hover:text-primary shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{t("পরবর্তী", "Next")}</span>
                <ChevronRight size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </>
    )
    </>
  );
}
