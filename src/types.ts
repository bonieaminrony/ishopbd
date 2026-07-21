export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  image: string;
  stock: number;
  showExactStock?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface WholesaleTier {
  minQty: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  buyingPrice?: number;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  category: string;
  isTrending?: boolean;
  isFlashSale?: boolean;
  flashSaleEndDate?: string;
  isFreeDelivery?: boolean;
  smsName?: string;
  colors?: string[];
  description?: string;
  videoUrl?: string;
  tags?: string;
  deleted?: boolean;
  rating?: number;
  reviewCount?: number;
  likes?: number;
  reviews?: Review[];
  isComingSoon?: boolean;
  isPublished?: boolean;
  stock?: number;
  code?: string;
  wholesaleTiers?: WholesaleTier[];
  weight?: number; // in kg
  unit?: string; // e.g., 'kg', 'piece', 'liter'
  minOrderQty?: number;
  modelName?: string;
  warranty?: string;
  features?: string;
  inTheBox?: string;
  specifications?: { key: string; value: string }[];
  subcategory?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  subcategories?: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'owner';
  password?: string;
  phone?: string;
  require2FA?: boolean;
  createdAt: string;
  addedBy?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productIds: string[];
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt?: any;
}

export interface AbandonedCart {
  id: string;
  phone: string;
  cartItems: any[];
  timestamp: any;
  smsSent: boolean;
}
