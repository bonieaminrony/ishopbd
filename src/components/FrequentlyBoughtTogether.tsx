import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, Plus, AlertCircle, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
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
  t
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

  // 2. Selection states
  // By default, select main product and in-stock complementary products
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

  // 4. Add All Selected Items to Cart
  const handleAddBundleToCart = () => {
    if (selectedCount === 0) return;

    // Check if any selected item requires a variant selection that is missing
    for (const { item, isMain } of checkedItems) {
      if (!isMain && item.variants && item.variants.length > 1) {
        const chosen = selectedVariants[item.id];
        if (!chosen || (!chosen.color && !chosen.size)) {
          setVariantPromptId(item.id);
          return;
        }
      }
    }

    // Add each selected product to cart
    checkedItems.forEach(({ item, isMain }) => {
      if (isMain) {
        // Use main product's currently selected variant on page
        addToCartInternal(item, tempSelectedColor || undefined, tempSelectedSize || undefined, 1);
      } else {
        const chosen = selectedVariants[item.id] || {};
        addToCartInternal(item, chosen.color, chosen.size, 1);
      }
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="w-full my-8 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 rounded-3xl border border-purple-100/80 p-5 md:p-7 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-purple-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-black text-gray-900">
                Frequently Bought Together
              </h3>
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Combo Offer
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              একত্রে কিনুন এবং স্পেশাল বান্ডেল অফার উপভোগ করুন
            </p>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-black shadow-xs">
            <Tag size={13} className="text-emerald-600 shrink-0" />
            <span>
              Save ৳{discountAmount.toLocaleString()} ({bundleDiscount}{discountType === 'percentage' ? '%' : '৳'} Off)
            </span>
          </div>
        )}
      </div>

      {/* Main Container: Products Grid + Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Products Visual Chain (Left Side - 8 cols) */}
        <div className="lg:col-span-8 flex flex-col md:flex-row flex-wrap items-center gap-3 md:gap-4">
          {allBundleItems.map(({ item, isMain }, index) => {
            const isSelected = !!selectedIds[item.id];
            const isOutOfStock = (item.stock !== undefined && item.stock <= 0) || (item.variants && item.variants.length > 0 && item.variants.every(v => v.stock <= 0));
            const hasMultipleVariants = !isMain && item.variants && item.variants.length > 1;
            const currentVariant = selectedVariants[item.id];
            const isPrompted = variantPromptId === item.id;

            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-sm shrink-0 shadow-xs">
                    <Plus size={16} />
                  </div>
                )}

                <div 
                  className={`relative flex-1 min-w-[160px] max-w-full md:max-w-[210px] bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                    isSelected 
                      ? 'border-purple-300 shadow-md ring-2 ring-purple-400/20' 
                      : 'border-gray-200 opacity-60 bg-gray-50/50'
                  } ${isPrompted ? 'ring-2 ring-rose-500 border-rose-400 animate-bounce' : ''}`}
                >
                  {/* Top Badge: Main Item vs Add-on */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id, isOutOfStock)}
                      disabled={isOutOfStock}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-600 text-white' 
                          : 'border-2 border-gray-300 bg-white hover:border-purple-400'
                      } ${isOutOfStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                      title={isSelected ? 'Deselect item' : 'Select item'}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </button>

                    {isMain ? (
                      <span className="text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                        This Item
                      </span>
                    ) : isOutOfStock ? (
                      <span className="text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400">
                        Add-on
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Image */}
                  <div 
                    onClick={() => openProductDetails && !isMain && openProductDetails(item)}
                    className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center cursor-pointer group"
                  >
                    <img
                      src={item.image || item.images?.[0] || '/logo.png'}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1">
                    <p 
                      onClick={() => openProductDetails && !isMain && openProductDetails(item)}
                      className="text-xs font-bold text-gray-800 line-clamp-2 hover:text-purple-700 transition-colors cursor-pointer"
                      title={item.name}
                    >
                      {item.name}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-sm font-black text-primary">
                        ৳{Number(item.price || 0).toLocaleString()}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ৳{Number(item.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Main item selected variant info */}
                    {isMain && (tempSelectedColor || tempSelectedSize) && (
                      <div className="text-[10px] font-bold text-purple-700 bg-purple-50/70 px-2 py-0.5 rounded-md truncate">
                        Selected: {[tempSelectedColor, tempSelectedSize].filter(Boolean).join(' / ')}
                      </div>
                    )}

                    {/* Complementary item Variant Selector */}
                    {hasMultipleVariants && isSelected && (
                      <div className="pt-1.5 border-t border-gray-100 mt-2">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                          Option / Variant:
                        </label>
                        <select
                          value={currentVariant?.color || currentVariant?.size || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matchedVar = item.variants?.find(v => (v.name === val || v.size === val));
                            if (matchedVar) {
                              handleVariantChange(
                                item.id,
                                matchedVar.name !== 'Default' ? matchedVar.name : undefined,
                                matchedVar.size !== 'N/A' ? matchedVar.size : undefined
                              );
                            }
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1 px-1.5 text-[11px] font-bold text-gray-700 outline-none focus:ring-1 focus:ring-purple-400"
                        >
                          {item.variants?.map((v, vIdx) => {
                            const label = [v.name !== 'Default' ? v.name : '', v.size !== 'N/A' ? v.size : ''].filter(Boolean).join(' - ') || `Option ${vIdx + 1}`;
                            return (
                              <option key={v.id || vIdx} value={v.name !== 'Default' ? v.name : (v.size || '')}>
                                {label} {v.stock <= 0 ? '(Stock Out)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action & Pricing Summary Box (Right Side - 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-purple-200/80 p-5 shadow-md flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-bold text-gray-500">
              <span>Selected Bundle:</span>
              <span className="text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-black">
                {selectedCount} of {allBundleItems.length} items
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

            {/* Price Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-1">
              {discountAmount > 0 ? (
                <>
                  <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span>Regular Total:</span>
                    <span className="line-through text-gray-400">৳{originalCombinedPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600">
                    <span>Bundle Savings:</span>
                    <span>-৳{discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm font-black text-gray-900 border-t border-dashed border-gray-200 mt-2">
                    <span>Bundle Price:</span>
                    <span className="text-xl font-black text-primary">৳{finalBundlePrice.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between pt-1 text-sm font-black text-gray-900">
                  <span>Total Combined Price:</span>
                  <span className="text-xl font-black text-primary">৳{originalCombinedPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              type="button"
              onClick={handleAddBundleToCart}
              disabled={selectedCount === 0 || addedSuccess}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
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
                  <span>কার্টে যোগ হয়েছে! (Added!)</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>
                    {selectedCount > 1 
                      ? `Add ${selectedCount} Items to Cart` 
                      : selectedCount === 1 
                      ? 'Add Selected to Cart' 
                      : 'Select Items to Buy'}
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
