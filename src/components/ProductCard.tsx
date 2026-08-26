import React from 'react';
import { motion } from 'motion/react';
import { Truck, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCartContext } from '../context/CartContext';
import { getProductPath } from '../utils/helpers';

export const ProductCard = React.memo(({ 
  product, 
  openProductDetails, 
  t, 
  handleBuyNow,
  handleLikeProduct,
  isLiked
}: { 
  product: Product; 
  openProductDetails: (p: Product) => void; 
  t: any;
  handleBuyNow: (p: Product) => void;
  handleLikeProduct: (productId: string) => void;
  isLiked: boolean;
}) => {
  const { addToCart } = useCartContext();
  const isOutOfStock =
    !product.isComingSoon &&
    (product.variants && product.variants.length > 0
      ? product.variants.every((v) => (Number(v.stock) || 0) <= 0)
      : (product.stock !== undefined && product.stock !== null ? Number(product.stock) <= 0 : false));

  const productPath = getProductPath(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      <a
        href={productPath}
        className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-cream block"
        onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
      >
        <img
          src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop";
          }}
        />
        
        {/* Badges - Even larger for visibility */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <div className="bg-[#6FA838] text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md">
              -{product.discount}%
            </div>
          )}
          {product.isFreeDelivery && (
            <div className="bg-primary text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1">
              <Truck size={11} /> Free Delivery
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeProduct(product.id);
          }}
          className={`absolute top-1.5 right-1.5 px-2 py-1 bg-white hover:bg-gray-50 text-[10px] font-bold rounded-full transition-all shadow-md transform hover:scale-105 flex items-center gap-1 z-10 ${
            isLiked ? "text-primary" : "text-gray-400 hover:text-primary"
          }`}
        >
          <Heart size={11} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-primary" : ""} />
          {product.likes !== undefined && product.likes >= 0 && (
            <span className="text-[10px] text-gray-700 font-bold ml-0.5">{product.likes || 0}</span>
          )}
        </button>
      </a>
      <div className="p-2.5 md:p-3 flex flex-col flex-1">
        <a 
          href={productPath}
          onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
          className="block"
        >
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 line-clamp-2 mb-1.5 min-h-[32px] sm:min-h-[38px] group-hover:text-primary transition-colors cursor-pointer leading-snug">
            {product.name}
          </h4>
        </a>
        <div className="mt-auto pt-1">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-[#6FA838] font-black text-lg sm:text-xl md:text-2xl tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-stone-400 line-through font-semibold">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
