import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

export interface CartDrawerModalProps {
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartItems: CartItem[];
  cartCount: number;
  updateQuantity: (id: string, delta: number, color?: string, size?: string) => void;
  removeItem: (id: string, color?: string, size?: string) => void;
  getProductPrice: (product: any, quantity?: number) => number;
  setCheckoutItems: (items: CartItem[]) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  detectLocation?: () => void;
}

export default function CartDrawerModal({
  isCartDrawerOpen,
  setIsCartDrawerOpen,
  cartItems,
  cartCount,
  updateQuantity,
  removeItem,
  getProductPrice,
  setCheckoutItems,
  setIsCheckoutOpen,
  detectLocation,
}: CartDrawerModalProps) {
  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full select-none"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-cream/40">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-secondary">Shopping Cart ({cartCount})</h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-all active:scale-90 touch-manipulation"
              title="Close Cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-sm font-bold text-gray-400">Your cart is empty.</p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-red-700 transition-all touch-manipulation active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all">
                  <img
                    src={item.product.image || "/logo.png"}
                    alt={item.product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100 shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-secondary truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                        {item.color && item.color !== 'N/A' && `Color: ${item.color}`}
                        {item.size && item.size !== 'N/A' && ` | Size: ${item.size}`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1, item.color, item.size)}
                          className="px-2.5 py-1.5 min-w-[32px] text-gray-600 hover:bg-gray-100 transition-all font-bold text-sm touch-manipulation active:scale-90"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-secondary select-none">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1, item.color, item.size)}
                          className="px-2.5 py-1.5 min-w-[32px] text-gray-600 hover:bg-gray-100 transition-all font-bold text-sm touch-manipulation active:scale-90"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm font-black text-primary whitespace-nowrap">৳{getProductPrice(item.product, item.quantity) * item.quantity}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.color, item.size)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all shrink-0 self-start touch-manipulation"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/80 space-y-3 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
              <div className="flex justify-between items-center text-sm font-bold text-secondary">
                <span>Subtotal:</span>
                <span className="text-lg font-black text-primary">
                  ৳{cartItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Shipping and discounts will be calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-white hover:bg-gray-50 text-secondary border border-gray-200 font-bold py-3 rounded-xl transition-all active:scale-95 text-xs sm:text-sm text-center touch-manipulation"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setCheckoutItems([...cartItems]);
                    setIsCartDrawerOpen(false);
                    setIsCheckoutOpen(true);
                    if (detectLocation) detectLocation();
                  }}
                  className="w-full bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-primary text-white font-black py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs sm:text-sm text-center touch-manipulation"
                >
                  Complete Order
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
