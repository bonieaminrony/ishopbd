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
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={24} />
              <h3 className="text-lg font-black text-secondary">Shopping Cart ({cartCount})</h3>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-sm font-bold text-gray-400">Your cart is empty.</p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-gray-100/50 transition-all">
                  <img
                    src={item.product.image || "/logo.png"}
                    alt={item.product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-secondary truncate">{item.product.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      {item.color && item.color !== 'N/A' && `Color: ${item.color}`}
                      {item.size && item.size !== 'N/A' && ` | Size: ${item.size}`}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1, item.color, item.size)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-all"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-secondary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1, item.color, item.size)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-all"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-black text-primary">৳{getProductPrice(item.product, item.quantity) * item.quantity}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.color, item.size)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-secondary">
                <span>Subtotal:</span>
                <span className="text-lg font-black text-primary">
                  ৳{cartItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold">Shipping and other charges will be calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full bg-white hover:bg-gray-50 text-secondary border border-gray-200 font-bold py-3.5 rounded-xl transition-all active:scale-95 text-xs text-center"
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
                  className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs text-center"
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
