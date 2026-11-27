import React from 'react';
import { motion } from 'motion/react';
import { Truck, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCartContext } from '../context/CartContext';
import { getProductPath } from '../utils/helpers';

// Cards fade in only the first time a product appears in this visit. Coming back to a page
// (Back button, closing a product) shows them straight away instead of replaying the fade,
// which looked like the photos were loading again.
const shownProductCards = new Set<string>();

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
  const cardKey = String(product.id);
  const [fadeIn] = React.useState(() => !shownProductCards.has(cardKey));
  React.useEffect(() => {
    shownProductCards.add(cardKey);
  }, [cardKey]);
  const isOutOfStock =
    !product.isComingSoon &&
    (product.variants && product.variants.length > 0
      ? product.variants.every((v) => (Number(v.stock) || 0) <= 0)
      : (product.stock !== undefined && product.stock !== null ? Number(product.stock) <= 0 : false));

  const productPath = getProductPath(product);

  const isClothing = Boolean(
    product.showSizeGuide ||
    (product.category && /jacket|clothing|পোশাক|জ্যাকেট|winter|হুডি|hoodie|shirt|শার্ট|panjabi|পাঞ্জাবি/i.test(product.category)) ||
    (product.name && /jacket|জ্যাকেট|হুডি|hoodie|ব্লেজার|সোয়েটার|শার্ট|shirt/i.test(product.name))
  );

  const imgSrc = product.image || product.images?.[0] || product.variants?.[0]?.image || "/logo.png";
  const hasDiscount = Number(product.originalPrice) > Number(product.price);

  return (
    <motion.div
      initial={fadeIn ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-line overflow-hidden flex flex-col h-full group/card select-none transition-shadow duration-300 hover:shadow-[0_12px_32px_-12px_rgba(38,34,90,0.22)]"
    >
      <a
        href={productPath}
        className="relative block aspect-square overflow-hidden cursor-pointer bg-[#eef1f6]"
        onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
      >
        {/* Same photo, blurred, fills any empty edges so the full product photo is shown with no blank gaps */}
        <img
          src={imgSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
        <img
          src={imgSrc}
          alt={product.name}
          width="300"
          height="300"
          className={`relative w-full h-full transition-transform duration-500 group-hover/card:scale-[1.04] ${
            isClothing ? "object-contain" : "object-cover"
          }`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {product.discount > 0 && (
            <span className="bg-primary text-white text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md price-num">
              -{product.discount}%
            </span>
          )}
          {product.isFreeDelivery && (
            <span className="bg-white/95 text-secondary text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1">
              <Truck size={10} className="shrink-0 text-emerald-600" /> Free Delivery
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLikeProduct(product.id);
          }}
          className={`absolute top-2 right-2 h-8 min-w-8 px-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-colors flex items-center justify-center gap-1 z-10 touch-manipulation ${
            isLiked ? "text-primary" : "text-secondary/50 hover:text-primary"
          }`}
          title="Save Product"
          aria-label="Save Product"
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
          {product.likes !== undefined && product.likes > 0 && (
            <span className="text-[10px] text-secondary font-bold price-num">{product.likes}</span>
          )}
        </button>
      </a>
      <div className="px-2.5 pt-2.5 pb-3 sm:px-3 sm:pt-3 flex flex-col flex-1">
        <a
          href={productPath}
          onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
          className="block"
        >
          <h4 className="text-[13px] sm:text-sm font-semibold text-secondary line-clamp-2 min-h-[2.6em] leading-[1.3] group-hover/card:text-primary transition-colors cursor-pointer">
            {product.name}
          </h4>
        </a>
        {/* Current price with the old price right beside it */}
        <div className="mt-auto pt-2 flex items-baseline flex-wrap gap-x-1.5 gap-y-0 price-num">
          <span className="text-primary font-extrabold text-base sm:text-lg leading-none">
            ৳{product.price}
          </span>
          {hasDiscount && (
            <span className="text-[11px] sm:text-xs text-muted/70 line-through font-medium leading-none">
              ৳{product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* Full-width red order bar: fills the card edge to edge, no white space beside or below it */}
      <motion.button
        disabled={isOutOfStock}
        whileTap={isOutOfStock ? {} : { opacity: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          openProductDetails(product);
        }}
        className="w-full bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold h-10 sm:h-11 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed group/btn flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
      >
        {isOutOfStock ? t("স্টক আউট", "Stock Out") : (
          <>
            <span>{t("অর্ডার দিন", "Order Now")}</span>
            <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
});
