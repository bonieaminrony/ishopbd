import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export interface MultiOrderSelectionModalProps {
  isMultiOrderSelectionOpen: any;
  setIsMultiOrderSelectionOpen: any;
  products: any;
  activeCampaign: any;
  cartItems: any;
  openProductDetails: any;
  setCartItems: any;
  addToCartInternal: any;
  setIsCheckoutOpen: any;
  cartCount: any;
  getProductPrice: any;
  proceedToCheckoutFromMulti: any;
  t: any;
}

export default function MultiOrderSelectionModal(props: MultiOrderSelectionModalProps) {
  const {
    isMultiOrderSelectionOpen,
    setIsMultiOrderSelectionOpen,
    products,
    activeCampaign,
    cartItems,
    openProductDetails,
    setCartItems,
    addToCartInternal,
    setIsCheckoutOpen,
    cartCount,
    getProductPrice,
    proceedToCheckoutFromMulti,
    t,
  } = props;

  return (
    <>
      {isMultiOrderSelectionOpen && (
          <div className="fixed inset-0 z-[250] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                <h3 className="text-xl font-bold text-gray-800">
              পছন্দের পণ্যগুলো যুক্ত করুন
                </h3>
                <button
                  onClick={() => setIsMultiOrderSelectionOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronRight className="rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                <div className="bg-red-50 p-3 rounded-xl border border-dashed border-primary/20 mb-4">
                  <p className="text-[10px] text-primary text-center font-bold">
                    সময়ের সেরা প্রিমিয়াম প্রোডাক্টগুলো একসাথেই অর্ডার করুন।
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4 pb-8">
                  {products
                    .filter((p) => {
                      if (activeCampaign) return activeCampaign.productIds.includes(p.id);
                      return p.isTrending;
                    })
                    .filter(p => !p.deleted)
                    .map((p) => {
                      const defaultColor =
                        p.colors && p.colors.length > 0
                          ? p.colors[0]
                          : undefined;
                      const cartItem = cartItems.find(
                        (item) =>
                          item.product.id === p.id &&
                          item.color === defaultColor,
                      );
                      return (
                        <motion.div
                          key={p.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white rounded-xl border border-gray-100 hover:border-primary/30 transition-all p-1.5 flex flex-col shadow-sm group cursor-pointer"
                          onClick={() => openProductDetails(p)}
                        >
                          <div className="relative aspect-square mb-1.5 overflow-hidden rounded-lg">
                            <img
                              loading="lazy"
                              decoding="async"
                              src={p.image}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              alt={p.name}
                            />
                            <div className="absolute top-0.5 right-0.5 bg-primary text-white text-[7px] font-bold px-1 py-0.5 rounded-full">
                              -{p.discount}%
                            </div>
                          </div>
                          <div className="flex-1 mb-1.5">
                            <p className="text-[9px] md:text-xs font-bold text-gray-800 line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-secondary font-black text-[10px] md:text-sm mt-0.5">
                              ৳{p.price}
                            </p>
                          </div>
                          <div className="mt-auto space-y-1">
                            {cartItem ? (
                              <div className="flex items-center justify-between bg-primary/10 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCartItems((prev) =>
                                      prev
                                        .map((i) =>
                                          i.product.id === p.id &&
                                          i.color === defaultColor
                                            ? {
                                                ...i,
                                                quantity: Math.max(
                                                  0,
                                                  i.quantity - 1,
                                                ),
                                              }
                                            : i,
                                        )
                                        .filter((i) => i.quantity > 0),
                                    );
                                  }}
                                  className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-bold"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-bold text-primary">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCartItems((prev) =>
                                      prev.map((i) =>
                                        i.product.id === p.id &&
                                        i.color === defaultColor
                                          ? { ...i, quantity: i.quantity + 1 }
                                          : i,
                                      ),
                                    );
                                  }}
                                  className="w-5 h-5 rounded-md bg-primary text-white flex items-center justify-center text-[10px] font-bold"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCartInternal(p, defaultColor);
                                  }}
                                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 rounded-lg text-[10px] md:text-xs transition-colors flex items-center justify-center gap-1"
                                >
                                  কার্টে যোগ করুন
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCartInternal(p, defaultColor || undefined);
                                    setIsCheckoutOpen(true);
                                    setIsMultiOrderSelectionOpen(false);
                                  }}
                                  className="w-full bg-primary hover:bg-red-700 text-white font-bold py-1.5 rounded-lg text-[10px] md:text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                                >
                                  {p.isComingSoon ? "প্রি-অর্ডার" : "অর্ডার"}
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
                {/* Optional: Show other products below a separator if needed, but user specifically asked for "only fans" */}
              </div>
              <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      মোট পণ্য: {cartCount}টি
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ৳
                      {cartItems.reduce(
                        (acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity,
                        0,
                      )}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0px 0px 0px rgba(236,32,41,0)",
                        "0px 0px 20px rgba(236,32,41,0.4)",
                        "0px 0px 0px rgba(236,32,41,0)",
                      ],
                    }}
                    transition={{
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      boxShadow: {
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    onClick={proceedToCheckoutFromMulti}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl active:scale-95 relative overflow-hidden group hover:scale-[1.05]"
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shine" />
                    </div>
                    <span className="relative z-10 flex items-center gap-2 animate-text-zoom">
                       {t("অর্ডার করুন", "Order Now")} <ChevronRight size={18} />
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
