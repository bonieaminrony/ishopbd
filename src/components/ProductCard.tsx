import React from 'react';
import { motion } from 'motion/react';
import { Truck, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCartContext } from '../context/CartContext';

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
      ? product.variants.every((v) => (v.stock || 0) <= 0)
      : (product.stock || 0) <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      <a
        href={`?product=${product.id}`}
        className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-cream block"
        onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges - Even larger for visibility */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <div className="bg-primary text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md">
              -{product.discount}%
            </div>
          )}
          {product.isFreeDelivery && (
            <div className="bg-emerald-600 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1 border border-emerald-500/10">
              <Truck size={11} /> ফ্রি ডেলিভারি
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
          <Heart size={11} fill={isLiked ? "#ec2029" : "none"} className={isLiked ? "text-primary" : ""} />
          {product.likes !== undefined && product.likes >= 0 && (
            <span className="text-[10px] text-gray-700 font-bold ml-0.5">{product.likes || 0}</span>
          )}
        </button>
      </a>
      <div className="p-2 md:p-3 flex flex-col flex-1">
        {(product.brand || product.code) && (
          <span className="text-[8px] md:text-[10px] font-bold text-gray-400 mb-1 px-0.5 uppercase tracking-wide">
            {product.brand || product.code}
          </span>
        )}
        <a 
          href={`?product=${product.id}`}
          onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
          className="block"
        >
          <h4 className="text-base md:text-lg font-medium text-gray-800 line-clamp-2 mb-1.5 px-0.5 min-h-[44px] group-hover:text-primary transition-colors cursor-pointer leading-tight">
            {product.name}
          </h4>
        </a>
        <div className="mt-auto px-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-red-600 font-bold text-xl md:text-2xl tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] md:text-[12px] text-gray-400 line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="relative">
            <motion.button
              disabled={isOutOfStock}
              whileTap={isOutOfStock ? {} : { scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                openProductDetails(product);
              }}
              className="w-full relative overflow-hidden bg-gradient-to-br from-primary to-red-600 text-white text-sm md:text-base font-bold py-2 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group/btn active:scale-95 flex items-center justify-center gap-2"
            >
              {isOutOfStock ? t("স্টক আউট", "Stock Out") : t("অর্ডার দিন", "Order Now")}
              {!isOutOfStock && <ArrowRight size={14} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
