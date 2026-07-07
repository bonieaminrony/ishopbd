import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, MouseEvent } from 'react';
import { Product } from '../types';

type CartContextType = {
  showToast: any;
  setShowToast: any;
  cartItems: any;
  setCartItems: any;
  cartCount: any;
  checkoutItems: any;
  setCheckoutItems: any;
  isCheckoutOpen: any;
  setIsCheckoutOpen: any;
  checkoutName: any;
  setCheckoutName: any;
  checkoutPhone: any;
  setCheckoutPhone: any;
  checkoutPhoneFocused: any;
  setCheckoutPhoneFocused: any;
  checkoutDistrict: any;
  setCheckoutDistrict: any;
  checkoutAddress: any;
  setCheckoutAddress: any;
  checkoutNote: any;
  setCheckoutNote: any;
  paymentMethod: any;
  setPaymentMethod: any;
  availableRewardPoints: any;
  setAvailableRewardPoints: any;
  isApplyingRewardPoints: any;
  setIsApplyingRewardPoints: any;
  checkoutDistrictSearch: any;
  setCheckoutDistrictSearch: any;
  isCheckoutDistrictOpen: any;
  setIsCheckoutDistrictOpen: any;
  appliedCoupon: any;
  setAppliedCoupon: any;
  deliveryArea: any;
  setDeliveryArea: any;
  addToCartInternal: any;
  addToCart: any;
  updateQuantity: any;
  setQuantityDirect: any;
  removeItem: any;
  getProductPrice: any;
  getDeliveryCharge: any;
  calculateTotal: any;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
const [showToast, setShowToast] = useState(false);
const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("inside");

const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "bkash" | "nagad" | "rocket" | "bank" | "wallet"
  >("cod");

const [cartItems, setCartItems] = useState<
    {
      product: Product;
      quantity: number;
      color?: string;
      size?: string;
      variantImage?: string;
    }[]
  >(() => {
    try {
      const saved = localStorage.getItem("ishopbd_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

const cartCount = useMemo(() => cartItems.reduce((acc, curr) => acc + curr.quantity, 0), [cartItems]);

const [checkoutItems, setCheckoutItems] = useState<
    {
      product: Product;
      quantity: number;
      color?: string;
      size?: string;
      variantImage?: string;
    }[]
  >([]);

const [checkoutPhone, setCheckoutPhone] = useState("");

const [checkoutName, setCheckoutName] = useState("");

const [checkoutDistrict, setCheckoutDistrict] = useState("");

const [checkoutAddress, setCheckoutAddress] = useState("");

const [checkoutNote, setCheckoutNote] = useState("");

const [checkoutPhoneFocused, setCheckoutPhoneFocused] = useState(false);

const [isCheckoutDistrictOpen, setIsCheckoutDistrictOpen] = useState(false);

const [checkoutDistrictSearch, setCheckoutDistrictSearch] = useState("");

const [availableRewardPoints, setAvailableRewardPoints] = useState(0);

const [isApplyingRewardPoints, setIsApplyingRewardPoints] = useState(false);

const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

const addToCartInternal = useCallback((product: Product, color?: string, size?: string, quantity: number = 1, wholesaleSizes?: Record<string, number>) => {
    const itemsToAdd: { color?: string, size?: string, quantity: number }[] = [];
    
    const isWholesale = wholesaleSizes && Object.keys(wholesaleSizes).length > 0;
    if (isWholesale) {
      Object.entries(wholesaleSizes!).forEach(([s, q]) => {
        if (q > 0) {
          itemsToAdd.push({ color, size: s, quantity: q });
        }
      });
    } else {
      itemsToAdd.push({ color, size, quantity });
    }
    setCartItems((prev) => {
      let nextCart = [...prev];
      itemsToAdd.forEach(itemInfo => {
        const variant = product.variants?.find((v) => (v.name || "") === (itemInfo.color || "") && (itemInfo.size ? (v.size || "") === (itemInfo.size || "") : true));
        const variantImage = variant?.image || product.image;
        const existingIdx = nextCart.findIndex(
          (item) =>
            item.product.id === product.id &&
            (item.color === itemInfo.color || (!item.color && !itemInfo.color)) &&
            (item.size === itemInfo.size || (!item.size && !itemInfo.size)),
        );
        if (existingIdx > -1) {
          nextCart[existingIdx] = { 
            ...nextCart[existingIdx], 
            quantity: nextCart[existingIdx].quantity + itemInfo.quantity 
          };
        } else {
          nextCart.push({ product, quantity: itemInfo.quantity, color: itemInfo.color, size: itemInfo.size, variantImage });
        }
      });
      return nextCart;
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, []);

const addToCart = useCallback((e: MouseEvent, product: Product) => {
    e.stopPropagation();
    // Default to first variant name/size, then first color, then undefined
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const defaultColor =
      firstVariant ? firstVariant.name : (product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
    const defaultSize = firstVariant ? firstVariant.size : undefined;
    
    addToCartInternal(product, defaultColor, defaultSize, 1);
  }, [addToCartInternal]);

const updateQuantity = (productId: string, delta: number, color?: string, size?: string) => {
    const updateFn = (items: any[]) =>
      items.map((item) =>
        item.product.id === productId &&
        (item.color === color || (!item.color && !color)) &&
        (item.size === size || (!item.size && !size))
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      );
    setCartItems(updateFn);
    setCheckoutItems(updateFn);
  };

const setQuantityDirect = (productId: string, qty: number, color?: string, size?: string) => {
    const updateFn = (items: any[]) =>
      items.map((item) =>
        item.product.id === productId &&
        (item.color === color || (!item.color && !color)) &&
        (item.size === size || (!item.size && !size))
          ? { ...item, quantity: Math.max(1, qty) }
          : item,
      );
    setCartItems(updateFn);
    setCheckoutItems(updateFn);
  };

const removeItem = (productId: string, color?: string, size?: string) => {
    const removeFn = (items: any[]) =>
      items.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (item.color === color || (!item.color && !color)) &&
            (item.size === size || (!item.size && !size))
          ),
      );
    setCartItems((prev) => {
      const itemToRemove = prev.find(
        (item) =>
          item.product.id === productId &&
          (item.color === color || (!item.color && !color)) &&
          (item.size === size || (!item.size && !size)),
      );
      return removeFn(prev);
    });
    setCheckoutItems((prev) => {
      const updated = removeFn(prev);
      if (updated.length === 0) setIsCheckoutOpen(false);
      return updated;
    });
  };

const getProductPrice = (product: Product | undefined, quantity: number) => {
    if (!product) return 0;
    if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
      // Sort tiers by minQty descending
      const sortedTiers = [...product.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
      const tier = sortedTiers.find(t => quantity >= t.minQty);
      if (tier) return tier.price;
    }
    return product.price;
  };

const getDeliveryCharge = (items: any[], area: string, coupon: any) => {
    if (coupon) return 0;
    if (items.some(item => item.product?.isFreeDelivery)) return 0;
    const totalWeight = items.reduce((acc, item) => acc + (item.product?.weight || 0) * item.quantity, 0);
    
    let charge = 0;
    const ceilWeight = Math.ceil(totalWeight);
    if (area === "inside") {
      if (totalWeight <= 1) {
        charge = 80;
      } else {
        charge = 80 + (ceilWeight - 1) * 20;
      }
    } else {
      if (totalWeight < 1) {
        charge = 120;
      } else if (totalWeight === 1) {
        charge = 130;
      } else {
        charge = 130 + (ceilWeight - 1) * 20;
      }
    }
    return charge;
  };

const calculateTotal = () => {
    const subtotal = checkoutItems.reduce(
      (total, item) => total + getProductPrice(item.product, item.quantity) * item.quantity,
      0,
    );
    if (!isCheckoutOpen) return subtotal;
    const deliveryCharge = getDeliveryCharge(checkoutItems, deliveryArea, appliedCoupon);
    return subtotal + deliveryCharge;
  };

useEffect(() => {
    try {
      localStorage.setItem("ishopbd_cart", JSON.stringify(cartItems));
    } catch (e) {
      if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
        // Storage full â€” clear non-critical keys and retry
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key !== "ishopbd_cart" && key !== "ishopbd_user") {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        try {
          localStorage.setItem("ishopbd_cart", JSON.stringify(cartItems));
        } catch {
          // If still fails, store minimal cart (only ids + qty)
          const minimalCart = cartItems.map(({ id, quantity, color, size }) => ({ id, quantity, color, size }));
          try { localStorage.setItem("ishopbd_cart", JSON.stringify(minimalCart)); } catch { /* ignore */ }
        }
      }
    }
  }, [cartItems]);

  const value = {
    showToast,
    setShowToast,
    cartItems,
    setCartItems,
    cartCount,
    checkoutItems,
    setCheckoutItems,
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutName,
    setCheckoutName,
    checkoutPhone,
    setCheckoutPhone,
    checkoutPhoneFocused,
    setCheckoutPhoneFocused,
    checkoutDistrict,
    setCheckoutDistrict,
    checkoutAddress,
    setCheckoutAddress,
    checkoutNote,
    setCheckoutNote,
    paymentMethod,
    setPaymentMethod,
    availableRewardPoints,
    setAvailableRewardPoints,
    isApplyingRewardPoints,
    setIsApplyingRewardPoints,
    checkoutDistrictSearch,
    setCheckoutDistrictSearch,
    isCheckoutDistrictOpen,
    setIsCheckoutDistrictOpen,
    appliedCoupon,
    setAppliedCoupon,
    deliveryArea,
    setDeliveryArea,
    addToCartInternal,
    addToCart,
    updateQuantity,
    setQuantityDirect,
    removeItem,
    getProductPrice,
    getDeliveryCharge,
    calculateTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
