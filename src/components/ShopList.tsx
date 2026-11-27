import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlashSaleCountdown } from './FlashSaleCountdown';
import { Zap, ChevronRight, Star, X, LayoutGrid, ChevronDown, ChevronLeft, Menu, Check, ArrowRight } from 'lucide-react';
import { getCategoryPath } from '../utils/helpers';

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
  selectedSubcategory?: any;
  setSelectedSubcategory?: any;
  setIsMobileCategoryDrawerOpen?: any;
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
    selectedSubcategory,
    setSelectedSubcategory,
    setIsMobileCategoryDrawerOpen,
  } = props;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Campaign page: the banner if the campaign has one, otherwise straight to its products. */}
      {activeCampaign?.image && (
        <div className="container mx-auto px-1 sm:px-4 mb-4">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-md border border-gray-100 bg-gray-50">
            <img
              loading="eager"
              decoding="async"
              src={activeCampaign.image}
              className="w-full h-auto block max-h-[420px] object-cover"
              alt={activeCampaign.name}
            />
          </div>
        </div>
      )}
        {/* 4.5 Featured Section (Only on Homepage) */}
        {selectedCategory === "all" && !searchQuery && !activeCampaign && !isTrendingFilterActive && (
          <div className="mb-8">
            {/* Featured Products Grid */}
            {isLoading && featuredProducts.length === 0 ? (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-2xl font-extrabold text-secondary">
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
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-2xl font-extrabold text-secondary">
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
              </section>
            ) : null}
          </div>
        )}
        {/* Flash Sale Section */}
        {!isProductDetailsOpen && !activeCampaign && flashSaleProducts.length > 0 && (
          <section id="flash-sale-section" className="mb-8 rounded-3xl overflow-hidden bg-white border border-line">
            <div className="flex flex-col">
              {/* Flash sale header: deep crimson band with countdown */}
              <div className="bg-primary px-4 py-4 md:px-6 md:py-5 text-white flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="text-amber-300 fill-amber-300" size={26} />
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    {t("ফ্ল্যাশ সেল", "Flash Sale")}
                  </h3>
                </div>
                <FlashSaleCountdown products={flashSaleProducts} />
              </div>
              {/* White Cards Container */}
              <div className="bg-white p-3 md:p-5 relative group">
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
          {/* Breadcrumb - Clean & Minimal like Rivo Fashion */}
          {!activeCampaign && selectedCategory === "all" && (selectedBrand !== "all" || searchQuery) && (
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  if (setSelectedSubcategory) setSelectedSubcategory("all");
                  setSelectedBrand("all");
                  setSearchInput("");
                  window.history.pushState({}, "", "/");
                }}
                className="hover:text-primary transition-colors whitespace-nowrap cursor-pointer font-medium"
              >
                {t("হোম", "Home")}
              </button>
              <span className="text-gray-300 font-light">/</span>

              {selectedCategory !== "all" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSubcategory && selectedSubcategory !== "all") {
                        if (setSelectedSubcategory) setSelectedSubcategory("all");
                        window.history.pushState(
                          { category: selectedCategory, subcategory: "all" },
                          "",
                          getCategoryPath(selectedCategory)
                        );
                      } else {
                        setSelectedCategory("all");
                        if (setSelectedSubcategory) setSelectedSubcategory("all");
                        window.history.pushState({}, "", "/");
                      }
                    }}
                    className={`hover:text-primary transition-colors whitespace-nowrap cursor-pointer ${
                      !selectedSubcategory || selectedSubcategory === "all"
                        ? "font-bold text-gray-900 pointer-events-none"
                        : "font-medium text-gray-500 hover:underline"
                    }`}
                  >
                    {selectedCategory}
                  </button>

                  {selectedSubcategory && selectedSubcategory !== "all" && (
                    <>
                      <span className="text-gray-300 font-light">/</span>
                      <span className="font-bold text-gray-900 whitespace-nowrap">
                        {selectedSubcategory}
                      </span>
                    </>
                  )}
                </>
              ) : selectedBrand !== "all" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className="font-medium text-gray-500 hover:text-primary whitespace-nowrap cursor-pointer"
                  >
                    {t("ব্র্যান্ড", "Brand")}
                  </button>
                  <span className="text-gray-300 font-light">/</span>
                  <span className="font-bold text-gray-900 whitespace-nowrap">{selectedBrand}</span>
                </>
              ) : searchQuery ? (
                <>
                  <span className="font-medium text-gray-500 whitespace-nowrap">{t("অনুসন্ধান", "Search")}</span>
                  <span className="text-gray-300 font-light">/</span>
                  <span className="font-bold text-gray-900 whitespace-nowrap">"{searchQuery}"</span>
                </>
              ) : null}
            </nav>
          )}

          {/* Minimal Header with Hamburger Category Dropdown Trigger and Count (not on a campaign page) */}
          {!activeCampaign && (
          <div className="flex flex-row items-center justify-between gap-3 mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 min-w-0">
              {/* Category & Sort Dropdown Popover Trigger (≡) */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-1.5 -ml-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                    isMenuOpen
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                  title={t("ক্যাটাগরি ও ফিল্টার", "Categories & Filters")}
                  aria-label="Toggle Categories and Filters"
                  aria-expanded={isMenuOpen}
                >
                  <Menu size={22} className="stroke-[2.5]" />
                </button>

                {/* Rivo Fashion Style Dropdown Popover (No background blur) */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2.5 text-left"
                    >
                      {/* CATEGORIES Section */}
                      <div className="mb-2">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          CATEGORIES
                        </div>
                        <div className="space-y-0.5 max-h-56 overflow-y-auto no-scrollbar">
                          {/* All Products */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("all");
                              if (setSelectedSubcategory) setSelectedSubcategory("all");
                              window.history.pushState({}, "", "/");
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                              selectedCategory === "all"
                                ? "bg-primary text-white font-bold shadow-sm"
                                : "text-gray-800 hover:bg-gray-50 font-medium"
                            }`}
                          >
                            <span>{t("সকল প্রোডাক্ট", "All Products")}</span>
                            {selectedCategory === "all" && <Check size={14} className="stroke-[2.5]" />}
                          </button>

                          {/* List Categories & Subcategories */}
                          {categories?.map((cat: any) => {
                            const isCatActive = selectedCategory === cat.name;
                            const subcats: string[] = cat.subcategories || [];

                            return (
                              <div key={cat.id} className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategory(cat.name);
                                    if (setSelectedSubcategory) setSelectedSubcategory("all");
                                    window.history.pushState({ category: cat.name, subcategory: "all" }, "", getCategoryPath(cat.name));
                                    setIsMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                    isCatActive && (!selectedSubcategory || selectedSubcategory === "all")
                                      ? "bg-primary text-white font-bold shadow-sm"
                                      : "text-gray-800 hover:bg-gray-50 font-medium"
                                  }`}
                                >
                                  <span className="truncate">{cat.name}</span>
                                  {isCatActive && (!selectedSubcategory || selectedSubcategory === "all") && (
                                    <Check size={14} className="stroke-[2.5]" />
                                  )}
                                </button>

                                {/* If category is active and has subcategories, display subcategories */}
                                {isCatActive && subcats.length > 0 && (
                                  <div className="pl-3 space-y-0.5 border-l-2 border-gray-100 ml-2 my-0.5">
                                    {subcats.map((sub: string, sIdx: number) => {
                                      const isSubActive = selectedSubcategory === sub;
                                      const subPath = getCategoryPath(cat.name, sub);
                                      return (
                                        <button
                                          key={sIdx}
                                          type="button"
                                          onClick={() => {
                                            if (setSelectedSubcategory) setSelectedSubcategory(sub);
                                            window.history.pushState({ category: cat.name, subcategory: sub }, "", subPath);
                                            setIsMenuOpen(false);
                                          }}
                                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                                            isSubActive
                                              ? "bg-primary text-white font-bold shadow-sm"
                                              : "text-gray-700 hover:bg-gray-50 font-medium"
                                          }`}
                                        >
                                          <span className="truncate">{sub}</span>
                                          {isSubActive && <Check size={12} className="stroke-[2.5]" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Home Page Link */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("all");
                              if (setSelectedSubcategory) setSelectedSubcategory("all");
                              window.history.pushState({}, "", "/");
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-800 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                          >
                            <span>{t("হোম পেজ", "Home Page")}</span>
                            <ArrowRight size={13} className="text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <hr className="my-2 border-gray-100" />

                      {/* SORT BY PRICE Section */}
                      <div>
                        <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          SORT BY PRICE
                        </div>
                        <div className="space-y-0.5">
                          {[
                            { value: "newest", label: t("Featured / Newest", "Featured") },
                            { value: "price_low", label: t("Price: Low to High", "Price: Low to High") },
                            { value: "price_high", label: t("Price: High to Low", "Price: High to Low") },
                            { value: "popularity", label: t("Highest Rated / Popularity", "Highest Rated") },
                          ].map((opt) => {
                            const isSortActive = sortBy === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  setSortBy(opt.value as any);
                                  setIsMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                  isSortActive
                                    ? "bg-primary text-white font-bold shadow-sm"
                                    : "text-gray-800 hover:bg-gray-50 font-medium"
                                }`}
                              >
                                <span>{opt.label}</span>
                                {isSortActive && <Check size={14} className="stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isTrendingFilterActive && !activeCampaign && selectedCategory !== "all" ? (
                <p className="text-sm font-semibold text-muted">
                  {filteredProducts.length} {t("টি পণ্য", filteredProducts.length === 1 ? "product" : "products")}
                </p>
              ) : (
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate flex items-baseline gap-1.5">
                <span>
                  {isTrendingFilterActive 
                    ? t("ট্রেন্ডিং প্রোডাক্টস", "Trending Products")
                    : activeCampaign 
                      ? activeCampaign.name 
                      : (selectedSubcategory && selectedSubcategory !== "all")
                        ? selectedSubcategory
                        : selectedCategory !== "all" 
                          ? selectedCategory
                          : selectedBrand !== "all"
                            ? selectedBrand
                            : searchQuery
                              ? t("সার্চ রেজাল্ট", "Search Results")
                              : t("সকল প্রোডাক্ট", "All Products")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-400">
                  ({filteredProducts.length})
                </span>
              </h3>
              )}
            </div>

          </div>
          )}
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
            <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
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

