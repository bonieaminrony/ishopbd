import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category } from '../types';

type ProductContextType = {
  activeCampaign: any;
  setActiveCampaign: any;
  campaigns: any;
  setCampaigns: any;
  selectedColor: any;
  setSelectedColor: any;
  categories: any;
  setCategories: any;
  products: any;
  setProducts: any;
  searchQuery: any;
  setSearchQuery: any;
  searchInput: any;
  setSearchInput: any;
  selectedCategory: any;
  setSelectedCategory: any;
  isTrendingFilterActive: any;
  setIsTrendingFilterActive: any;
  selectedBrand: any;
  setSelectedBrand: any;
  minPrice: any;
  setMinPrice: any;
  maxPrice: any;
  setMaxPrice: any;
  sortBy: any;
  setSortBy: any;
  trendingIndices: any;
  setTrendingIndices: any;
  activeTrendingSlot: any;
  setActiveTrendingSlot: any;
  selectedProduct: any;
  setSelectedProduct: any;
  isProductDetailsOpen: any;
  setIsProductDetailsOpen: any;
  flashSaleProducts: any;
  relatedProducts: any;
  filteredProducts: any;
  featuredProducts: any;
  newArrivals: any;
  brands: any;
  selectedSubcategory: any;
  setSelectedSubcategory: any;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('all');

const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem("cached_categories");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem("cached_products");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

const [searchQuery, setSearchQuery] = useState("");

const [searchInput, setSearchInput] = useState("");

const [selectedCategory, setSelectedCategory] = useState("all");
const [selectedSubcategory, setSelectedSubcategory] = useState("all");

useEffect(() => {
  setSelectedSubcategory("all");
}, [selectedCategory]);

const [isTrendingFilterActive, setIsTrendingFilterActive] = useState(false);

const [selectedBrand, setSelectedBrand] = useState("all");

const [minPrice, setMinPrice] = useState<number | "">("");

const [maxPrice, setMaxPrice] = useState<number | "">("");

const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "popularity">("newest");

const [trendingIndices, setTrendingIndices] = useState([0, 1, 2, 3]);

const [activeTrendingSlot, setActiveTrendingSlot] = useState(0);

const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

const flashSaleProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isFlashSale || p.deleted || !p.flashSaleEndDate) return false;
      if (p.isPublished === false) return false;
      return new Date(p.flashSaleEndDate).getTime() > Date.now();
    });
  }, [products]);

const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    
    const sameCategoryProducts = products.filter(
      (p) => p.category === selectedProduct.category && p.id !== selectedProduct.id && !p.deleted && p.isPublished !== false
    );
    
    const scoredProducts = sameCategoryProducts.map((p) => {
      let score = 0;
      if (p.brand && selectedProduct.brand && p.brand === selectedProduct.brand) score += 5;
      
      if (p.tags && selectedProduct.tags) {
        const pTags = p.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        const sTags = selectedProduct.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        const sharedTags = pTags.filter(t => sTags.includes(t));
        score += sharedTags.length * 2;
      }
      
      score += (p.rating || 0) * 0.2;
      score += Math.min((p.likes || 0) * 0.01, 1);
      
      return { product: p, score };
    });
    
    scoredProducts.sort((a, b) => b.score - a.score);
    
    return scoredProducts.slice(0, 10).map(s => s.product);
  }, [selectedProduct, products]);

const filteredProducts = useMemo(() => {
    let result = [];
    if (activeCampaign) {
      // In campaign mode, we only show campaign products. 
      // We also apply current search/filter within the campaign context.
      result = products.filter((p) => {
        if (p.deleted || p.isPublished === false) return false;
        if (!activeCampaign.productIds.includes(p.id)) return false;
        
        const name = p.name || "";
        const category = p.category || "";
        const code = p.code || "";
        const brand = p.brand || "";
        const matchesSearch =
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tags || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || category === selectedCategory;
        const matchesSubcategory =
          selectedSubcategory === "all" || (p as any).subcategory === selectedSubcategory;
        const matchesBrand =
          selectedBrand === "all" || brand === selectedBrand;
        const matchesColor =
          selectedColor === "all" || (p.colors && p.colors.includes(selectedColor));
        const matchesTrending = !isTrendingFilterActive || p.isTrending;
        
        const price = p.price || 0;
        const matchesPrice = (minPrice === "" || price >= minPrice) && (maxPrice === "" || price <= maxPrice);
        return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesColor && matchesTrending && matchesPrice;
      });
    } else {
      result = products.filter((p) => {
        if (p.deleted || p.isPublished === false) return false;
        const name = p.name || "";
        const category = p.category || "";
        const code = p.code || "";
        const brand = p.brand || "";
        const matchesSearch =
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.tags || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || category === selectedCategory;
        const matchesSubcategory =
          selectedSubcategory === "all" || (p as any).subcategory === selectedSubcategory;
        const matchesBrand =
          selectedBrand === "all" || brand === selectedBrand;
        const matchesColor =
          selectedColor === "all" || (p.colors && p.colors.includes(selectedColor));
        const matchesTrending = !isTrendingFilterActive || p.isTrending;
        const price = p.price || 0;
        const matchesPrice = (minPrice === "" || price >= minPrice) && (maxPrice === "" || price <= maxPrice);
        return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesColor && matchesTrending && matchesPrice;
      });
    }
    // Sorting logic
    return [...result].sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "popularity") {
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        const likesA = a.likes || 0;
        const likesB = b.likes || 0;
        return (ratingB + likesB/10) - (ratingA + likesA/10);
      }
      
      // Default: newest arrivals
      const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0) : 0;
      const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) : 0;
      return dateB - dateA;
    });
  }, [products, searchQuery, selectedCategory, selectedSubcategory, selectedBrand, selectedColor, activeCampaign, isTrendingFilterActive, minPrice, maxPrice, sortBy]);

const featuredProducts = useMemo(() => {
    return products.filter(p => !p.deleted && p.isTrending && p.isPublished !== false).slice(0, 10);
  }, [products]);

const newArrivals = useMemo(() => {
    return [...products]
      .filter(p => !p.deleted && p.isPublished !== false)
      .sort((a, b) => {
        const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0) : 0;
        const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0) : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [products]);

const brands = useMemo(() => {
    const b = new Set<string>();
    products.forEach(p => {
      if (p.brand) b.add(p.brand);
    });
    return Array.from(b).sort();
  }, [products]);

  const value = {
    activeCampaign,
    setActiveCampaign,
    campaigns,
    setCampaigns,
    selectedColor,
    setSelectedColor,
    categories,
    setCategories,
    products,
    setProducts,
    searchQuery,
    setSearchQuery,
    searchInput,
    setSearchInput,
    selectedCategory,
    setSelectedCategory,
    isTrendingFilterActive,
    setIsTrendingFilterActive,
    selectedBrand,
    setSelectedBrand,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    trendingIndices,
    setTrendingIndices,
    activeTrendingSlot,
    setActiveTrendingSlot,
    selectedProduct,
    setSelectedProduct,
    isProductDetailsOpen,
    setIsProductDetailsOpen,
    flashSaleProducts,
    relatedProducts,
    filteredProducts,
    featuredProducts,
    newArrivals,
    brands,
    selectedSubcategory,
    setSelectedSubcategory,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
}
