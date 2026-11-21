import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, Plus, AlertCircle, Tag, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

export interface FrequentlyBoughtTogetherProps {
  mainProduct: Product;
  allProducts: Product[];
  addToCartInternal: (product: Product, color?: string, size?: string, quantity?: number) => void;
  tempSelectedColor?: string;
  tempSelectedSize?: string;
  openProductDetails?: (product: Product) => void;
  t?: (key: string) => string;
}

export default function FrequentlyBoughtTogether({
  mainProduct,
  allProducts,
  addToCartInternal,
  tempSelectedColor,
  tempSelectedSize,
  openProductDetails,
}: FrequentlyBoughtTogetherProps) {
  // 1. Resolve available bundle products from allProducts (excluding self, deleted, unpublished)
  const bundleProducts = useMemo(() => {
    if (!mainProduct?.bundleProductIds || !Array.isArray(mainProduct.bundleProductIds) || mainProduct.bundleProductIds.length === 0) {
      return [];
    }
    const ids = new Set(mainProduct.bundleProductIds.filter(id => id && id !== mainProduct.id));
    return (allProducts || []).filter(p => ids.has(p.id) && !p.deleted && p.isPublished !== false);
  }, [mainProduct, allProducts]);

  // If no complementary products exist, don't render the section
  if (bundleProducts.length === 0) {
    return null;
  }

  // Combine mainProduct and bundleProducts into a single list
  const allBundleItems: { item: Product; isMain: boolean }[] = [
    { item: mainProduct, isMain: true },
    ...bundleProducts.map(p => ({ item: p, isMain: false }))
  ];

  // 2. Selection states: By default, select main product and in-stock complementary products
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = { [mainProduct.id]: true };
    bundleProducts.forEach(p => {
      const isOutOfStock = (p.stock !== undefined && p.stock <= 0) || (p.variants && p.variants.length > 0 && p.variants.every(v => v.stock <= 0));
      initial[p.id] = !isOutOfStock;
    });
    return initial;
  });

  // Variant selections for complementary products: { [productId]: { color?: string, size?: string } }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { color?: string; size?: string }>>(() => {
    const initial: Record<string, { color?: string; size?: string }> = {};
    bundleProducts.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        const firstInStock = p.variants.find(v => v.stock > 0) || p.variants[0];
        initial[p.id] = {
          color: firstInStock.name !== 'Default' ? firstInStock.name : undefined,
          size: firstInStock.size !== 'N/A' ? firstInStock.size : undefined
        };
      } else if (p.colors && p.colors.length > 0) {
        initial[p.id] = { color: p.colors[0] };
      }
    });
    return initial;
  });

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [variantPromptId, setVariantPromptId] = useState<string | null>(null);

  // Toggle selection
  const toggleSelect = (productId: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedIds(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Change variant for complementary item
  const handleVariantChange = (productId: string, color?: string, size?: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: { color, size }
    }));
    if (variantPromptId === productId) {
      setVariantPromptId(null);
    }
  };

  // 3. Price and Savings Calculations
  const checkedItems = allBundleItems.filter(({ item }) => selectedIds[item.id]);
  const selectedCount = checkedItems.length;

  const originalCombinedPrice = checkedItems.reduce((sum, { item }) => sum + Number(item.price || 0), 0);

  // Discount calculation
  let discountAmount = 0;
  const bundleDiscount = Number(mainProduct.bundleDiscount || 0);
  const discountType = mainProduct.bundleDiscountType || 'percentage';

  // Apply discount only if bundle has discount configured and >= 2 items are selected
  if (bundleDiscount > 0 && selectedCount >= 2) {
    if (discountType === 'fixed') {
      discountAmount = Math.min(bundleDiscount, originalCombinedPrice);
    } else {
      discountAmount = Math.round(originalCombinedPrice * (bundleDiscount / 100));
    }
  }

  const finalBundlePrice = Math.max(0, originalCombinedPrice - discountAmount);

  // 4. Add All Selected Items to Cart (With Interactive Combo Variant Selection & Bundle Discount)
  const handleAddBundleToCart = () => {
    if (selectedCount === 0) return;

    let discountApplied = false;

    checkedItems.forEach(({ item, isMain }) => {
      if (isMain) {
        addToCartInternal(item, tempSelectedColor || undefined, tempSelectedSize || undefined, 1);
      } else {
        const chosen = selectedVariants[item.id] || {};
        let finalItem = item;
        if (!discountApplied && discountAmount > 0 && selectedCount >= 2) {
          finalItem = {
            ...item,
            price: Math.max(0, Number(item.price || 0) - discountAmount),
            originalPrice: item.price || item.originalPrice
          };
          discountApplied = true;
        }
        const addonSize = chosen.size || tempSelectedSize || undefined;
        addToCartInternal(finalItem, chosen.color, addonSize, 1);
      }
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="w-full my-8 bg-white rounded-3xl border border-gray-200 p-5 md:p-7 shadow-sm overflow-hidden">
      {/* Header Banner - Clean, Navy & Red theme, no AI sparkles icon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base md:text-lg font-black text-gray-900 tracking-tight">
              কম্বো অফার
            </h3>
            <span className="text-[10px] font-black bg-red-50 text-primary border border-red-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Special Bundle
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium mt-0.5">
            একত্রে কিনুন এবং স্পেশাল বান্ডেল অফার উপভোগ করুন
          </p>
        </div>

        {bundleDiscount > 0 && (
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-primary px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs">
            <Tag size={13} className="text-primary shrink-0" />
            <span>
              {discountType === 'fixed'
                ? `৳${bundleDiscount.toLocaleString()} ফ্ল্যাট ছাড়`
                : `${bundleDiscount}% স্পেশাল ছাড়`}
            </span>
          </div>
        )}
      </div>

      {/* Main Container: Products Visual Chain + Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Products Visual Chain (Left Side - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col md:flex-row flex-wrap items-center gap-3 md:gap-4">
          {allBundleItems.map(({ item, isMain }, index) => {
            const isSelected = !!selectedIds[item.id];
            const isOutOfStock = (item.stock !== undefined && item.stock <= 0) || (item.variants && item.variants.length > 0 && item.variants.every(v => v.stock <= 0));
            const currentVariant = selectedVariants[item.id];
            const hasVariants = item.variants && item.variants.length > 0;

            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-primary font-black text-sm shrink-0 border border-red-200 shadow-2xs my-auto">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                )}

                <div 
                  className={`relative w-full md:w-[220px] md:min-w-[220px] max-w-[240px] flex-1 self-stretch bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isSelected 
                      ? isMain 
                        ? 'border-emerald-300 shadow-md ring-2 ring-emerald-500/20' 
                        : 'border-primary/40 shadow-md ring-2 ring-primary/20'
                      : 'border-gray-200 opacity-60 bg-gray-50/50'
                  }`}
                >
                  {/* Top Badge: Main (Green) vs Combo (Red) */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id, isOutOfStock)}
                      disabled={isOutOfStock}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? isMain 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-primary text-white shadow-xs'
                          : 'border-2 border-gray-300 bg-white hover:border-slate-500'
                      } ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title={isSelected ? 'আইটেম বাদ দিন' : 'আইটেম যোগ করুন'}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>

                    {isMain ? (
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        মূল প্রোডাক্ট
                      </span>
                    ) : isOutOfStock ? (
                      <span className="text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        স্টক শেষ
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-red-50 text-primary border border-red-200 px-2.5 py-0.5 rounded-full">
                        কম্বো আইটেম
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image - Equal square aspect-ratio */}
                  <div 
                    onClick={() => openProductDetails && !isMain && openProductDetails(item)}
                    className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center cursor-pointer group border border-gray-100"
                  >
                    <img
                      src={item.image || item.images?.[0] || '/logo.png'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <p 
                        onClick={() => openProductDetails && !isMain && openProductDetails(item)}
                        className="text-xs font-bold text-gray-900 line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug"
                        title={item.name}
                      >
                        {item.name}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 pt-1">
                        <span className="text-sm font-black text-primary">
                          ৳{Number(item.price || 0).toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ৳{Number(item.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Variant / Size Control Area */}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      {isMain ? (
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 bg-emerald-50/60 border border-emerald-100 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500 text-[10px]">সাইজ:</span>
                          <span className="font-bold text-emerald-800">{tempSelectedSize || 'M'}</span>
                        </div>
                      ) : hasVariants && isSelected ? (
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                            সাইজ / ভ্যারিয়েন্ট বাছাই:
                          </label>
                          <select
                            value={currentVariant?.size || currentVariant?.color || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const matchedVar = item.variants?.find(v => (v.size === val || v.name === val || `${v.name} - ${v.size}` === val));
                              if (matchedVar) {
                                handleVariantChange(
                                  item.id,
                                  matchedVar.name !== 'Default' ? matchedVar.name : undefined,
                                  matchedVar.size !== 'N/A' ? matchedVar.size : undefined
                                );
                              }
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-[11px] font-bold text-gray-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer shadow-2xs"
                          >
                            {item.variants?.map((v, vIdx) => {
                              const label = [v.size && v.size !== 'N/A' ? `সাইজ: ${v.size}` : '', v.name && v.name !== 'Default' ? v.name : ''].filter(Boolean).join(' - ') || `Option ${vIdx + 1}`;
                              const optVal = v.size && v.size !== 'N/A' ? v.size : (v.name || `opt-${vIdx}`);
                              return (
                                <option key={v.id || vIdx} value={optVal}>
                                  {label} {v.stock !== undefined && v.stock <= 0 ? '(স্টক শেষ)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                          <span className="text-gray-500 text-[10px]">সাইজ:</span>
                          <span className="font-bold text-slate-800">{tempSelectedSize || 'স্ট্যান্ডার্ড'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}</div>

        {/* Action & Pricing Summary Box (Right Side - 4 cols) - Clean Navy/Slate/Red */}
        <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold text-gray-600">
              <span>সিলেক্টেড প্রোডাক্টস:</span>
              <span className="text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-black">
                {selectedCount} / {allBundleItems.length} টি
              </span>
            </div>

            {/* Checklist summary */}
            <div className="py-3 space-y-1.5">
              {allBundleItems.map(({ item, isMain }) => {
                const isChecked = !!selectedIds[item.id];
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs gap-2">
                    <span className={`truncate flex-1 ${isChecked ? 'font-bold text-gray-800' : 'text-gray-400 line-through'}`}>
                      {isMain ? '• ' : '+ '} {item.name}
                    </span>
                    <span className={`font-black shrink-0 ${isChecked ? 'text-gray-900' : 'text-gray-300'}`}>
                      ৳{Number(item.price || 0).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations & Explicit Discount Display */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5">
              {bundleDiscount > 0 && selectedCount >= 2 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span>নিয়মিত মোট মূল্য:</span>
                    <span className="line-through text-gray-400">৳{originalCombinedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg">
                    <span>
                      স্পেশাল কম্বো ছাড় ({discountType === 'fixed' ? `৳${bundleDiscount.toLocaleString()} ফ্ল্যাট ছাড়` : `${bundleDiscount}% ছাড়`}):
                    </span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm font-black text-gray-900 border-t border-dashed border-slate-300 mt-2">
                    <span>কম্বো অফার মূল্য:</span>
                    <span className="text-xl font-black text-primary">৳{finalBundlePrice.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between pt-1 text-sm font-black text-gray-900">
                    <span>মোট মূল্য:</span>
                    <span className="text-xl font-black text-primary">৳{originalCombinedPrice.toLocaleString()}</span>
                  </div>
                  {bundleDiscount > 0 && selectedCount < 2 && (
                    <div className="text-[11px] font-bold text-primary bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                      💡 আর ১টি আইটেম যোগ করলেই পাচ্ছেন {discountType === 'fixed' ? `৳${bundleDiscount.toLocaleString()} ফ্ল্যাট` : `${bundleDiscount}%`} স্পেশাল কম্বো ছাড়!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              type="button"
              onClick={handleAddBundleToCart}
              disabled={selectedCount === 0 || addedSuccess}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                addedSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : selectedCount > 0
                  ? 'bg-primary hover:bg-red-700 text-white shadow-primary/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {addedSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>কার্টে যোগ হয়েছে!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>
                    {selectedCount > 1 
                      ? `সবগুলো (${selectedCount}টি) কার্টে যোগ করুন` 
                      : selectedCount === 1 
                      ? 'সিলেক্টেড আইটেম কার্টে যোগ করুন' 
                      : 'প্রোডাক্ট সিলেক্ট করুন'}
                  </span>
                </>
              )}
            </button>

            {variantPromptId && (
              <p className="text-[11px] font-bold text-rose-600 text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle size={13} />
                অনুগ্রহ করে সিলেক্টেড প্রোডাক্টের অপশন/কালার সিলেক্ট করুন
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
