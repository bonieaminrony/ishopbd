import React from "react";
import { Heart, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  openProductDetails: (p: Product) => void;
  t: (bn: string, en: string) => string;
  handleBuyNow: (p: Product) => void;
  handleLikeProduct: (productId: string) => void;
}

const ProductCard = React.memo(({
  product,
  openProductDetails,
  t,
  handleBuyNow,
  handleLikeProduct,
}: ProductCardProps) => {
  const isOutOfStock =
    !product.isComingSoon &&
    (product.variants && product.variants.length > 0
      ? product.variants.every((v) => (v.stock || 0) <= 0)
      : (product.stock || 0) <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-md shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      <div
        className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-cream"
        onClick={() => openProductDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Discount Badge */}
        <div className="absolute top-1 left-1 flex flex-col gap-1 z-10">
          {product.discount > 0 && (
            <div className="bg-primary text-white text-xs md:text-sm font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-sm">
              -{product.discount}%
            </div>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeProduct(product.id);
          }}
          className={`absolute top-1 right-1 p-1.5 backdrop-blur-sm rounded-full transition-all shadow-md transform hover:scale-110 flex items-center gap-1 ${product.likes ? "bg-red-50 text-primary" : "bg-white/90 text-gray-400 hover:text-red-500"}`}
        >
          <Heart size={12} fill={product.likes ? "currentColor" : "none"} />
          {(product.likes ?? 0) > 0 && <span className="text-[8px] font-bold">{product.likes}</span>}
        </button>
      </div>

      <div className="p-2 md:p-3 flex flex-col flex-1">
        {product.code && (
          <span className="text-[9px] md:text-xs font-bold text-gray-400 mb-1 px-0.5">
            {product.code}
          </span>
        )}
        <h4
          onClick={() => openProductDetails(product)}
          className="text-base sm:text-lg lg:text-xl font-bold text-secondary line-clamp-2 mb-1 px-0.5 min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] group-hover:text-primary transition-colors cursor-pointer leading-snug"
        >
          {product.name}
        </h4>
        <div className="mt-auto px-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-red-600 font-bold text-lg sm:text-xl lg:text-2xl tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs lg:text-sm text-gray-400 line-through">
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
              className="w-full relative overflow-hidden bg-gradient-to-br from-primary to-red-600 text-white text-xs sm:text-sm lg:text-base font-bold py-3.5 lg:py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group/btn active:scale-95 flex items-center justify-center gap-1.5"
            >
              {isOutOfStock ? t("স্টক আউট", "Stock Out") : t("অর্ডার দিন", "Order Now")}
              {!isOutOfStock && <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px]" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
