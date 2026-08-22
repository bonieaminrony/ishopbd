import React from 'react';
import { Home, LayoutGrid, Truck, Headset, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MobileBottomNavProps {
  currentView?: 'home' | 'category' | 'checkout' | 'details' | 'admin';
  cartCount: number;
  onHomeClick: () => void;
  onCategoryClick: () => void;
  onTrackClick: () => void;
  onSupportClick: () => void;
  onCartClick: () => void;
  isProductDetailsOpen?: boolean;
  isCheckoutOpen?: boolean;
  t?: any;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  onHomeClick,
  onCategoryClick,
  onTrackClick,
  onSupportClick,
  onCartClick,
  isProductDetailsOpen = false,
  isCheckoutOpen = false,
  t = (bn: string, en?: string) => bn,
}) => {
  // Hide bottom bar when viewing product details (since it has sticky Buy Now bar) or checkout page
  if (isProductDetailsOpen || isCheckoutOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {/* 1. Home */}
        <button
          type="button"
          onClick={onHomeClick}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-primary active:scale-95 transition-all group min-w-[56px]"
        >
          <div className="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Home size={20} className="text-gray-700 group-hover:text-primary" />
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-primary mt-0.5 tracking-tight">
            {t("হোম", "Home")}
          </span>
        </button>

        {/* 2. Categories Drawer */}
        <button
          type="button"
          onClick={onCategoryClick}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-primary active:scale-95 transition-all group min-w-[56px]"
        >
          <div className="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
            <LayoutGrid size={20} className="text-gray-700 group-hover:text-primary" />
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-primary mt-0.5 tracking-tight">
            {t("ক্যাটাগরি", "Category")}
          </span>
        </button>

        {/* 3. Track Order */}
        <button
          type="button"
          onClick={onTrackClick}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-primary active:scale-95 transition-all group min-w-[56px]"
        >
          <div className="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Truck size={20} className="text-gray-700 group-hover:text-primary" />
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-primary mt-0.5 tracking-tight">
            {t("ট্র্যাকিং", "Track")}
          </span>
        </button>

        {/* 4. Live Support */}
        <button
          type="button"
          onClick={onSupportClick}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-primary active:scale-95 transition-all group min-w-[56px]"
        >
          <div className="p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Headset size={20} className="text-gray-700 group-hover:text-primary" />
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-primary mt-0.5 tracking-tight">
            {t("সাপোর্ট", "Support")}
          </span>
        </button>

        {/* 5. Cart with Badge */}
        <button
          type="button"
          onClick={onCartClick}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-600 hover:text-primary active:scale-95 transition-all group relative min-w-[56px]"
        >
          <div className="relative p-1 rounded-xl group-hover:bg-primary/10 transition-colors">
            <ShoppingCart size={20} className="text-gray-700 group-hover:text-primary" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md border-2 border-white"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[11px] font-bold text-gray-600 group-hover:text-primary mt-0.5 tracking-tight">
            {t("কার্ট", "Cart")}
          </span>
        </button>
      </div>
    </div>
  );
};
export default MobileBottomNav;
