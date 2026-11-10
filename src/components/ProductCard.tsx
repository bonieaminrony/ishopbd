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
      className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group select-none"
    >
      <a
        href={productPath}
        className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-cream block"
        onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
      >
        <img
          src={product.image || product.images?.[0] || product.variants?.[0]?.image || "/logo.png"}
          alt={product.name}
          width="300"
          height="300"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        
        {/* Badges - Clear & readable on mobile */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discount > 0 && (
            <div className="bg-primary text-white text-[10px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap shadow-md">
              -{product.discount}%
            </div>
          )}
          {product.isFreeDelivery && (
            <div className="bg-emerald-600 text-white text-[8px] sm:text-[9px] md:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1 border border-emerald-500/10">
              <Truck size={10} className="shrink-0" /> Free Delivery
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeProduct(product.id);
          }}
          className={`absolute top-2 right-2 min-w-[34px] min-h-[34px] p-1.5 bg-white/95 hover:bg-white text-[10px] font-bold rounded-full transition-all shadow-md active:scale-90 flex items-center justify-center gap-1 z-10 touch-manipulation ${
            isLiked ? "text-primary shadow-primary/10" : "text-gray-400 hover:text-primary"
          }`}
          title="Save Product"
        >
          <Heart size={13} fill={isLiked ? "#ec2029" : "none"} className={isLiked ? "text-primary" : ""} />
          {product.likes !== undefined && product.likes > 0 && (
            <span className="text-[10px] text-gray-700 font-bold">{product.likes}</span>
          )}
        </button>
      </a>
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <a 
          href={productPath}
          onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
          className="block"
        >
          <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 mb-1.5 min-h-[32px] sm:min-h-[38px] group-hover:text-primary transition-colors cursor-pointer leading-snug">
            {product.name}
          </h4>
        </a>
        <div className="mt-auto pt-1">
          <div className="flex items-baseline justify-between gap-1 mb-2">
            <span className="text-primary font-black text-sm sm:text-base md:text-lg tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-medium">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="relative">
            <motion.button
              disabled={isOutOfStock}
              whileTap={isOutOfStock ? {} : { scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                openProductDetails(product);
              }}
              className="w-full relative overflow-hidden bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white text-xs sm:text-sm font-bold py-2.5 sm:py-2.5 md:py-2.5 min-h-[38px] sm:min-h-[40px] rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group/btn active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
            >
              {isOutOfStock ? t("স্টক আউট", "Stock Out") : (
                <>
                  <span>{t("অর্ডার দিন", "Order Now")}</span>
                  <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
