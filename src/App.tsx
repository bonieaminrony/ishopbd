import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  MouseEvent,
  FormEvent,
  ChangeEvent,
} from "react";
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import ShopList from './components/ShopList';
import {
  initTracking,
  trackViewContent,
  trackAddToWishlist,
  trackInitiateCheckout,
  trackConfirmedOrderPurchase,
  trackSearch,
  trackContact,
  getStoredAttribution,
  getOrderTrackingSignals,
} from './utils/tracking';
import { getAdminAuthHeaders } from './utils/adminAuth';
import { findMatchingAdminRecord, resolveAdminAccess } from './utils/adminRole';
import { buildProductStructuredData } from './utils/productSchema';
import type { CompleteIncompleteOrderPayload } from './components/admin/IncompleteOrderModal';
import {
  CourierFraudReport,
  getCourierReportForPhone,
  normalizeBdPhone,
  parseClientCourierFraudReport,
} from './utils/courierDisplay';

// Dynamic Code-Splitting for Heavy / Secondary Modals
const ProductDetails = lazy(() => import('./components/ProductDetails'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const FilterMenuModal = lazy(() => import('./components/FilterMenuModal'));
const InlineDistrictModal = lazy(() => import('./components/InlineDistrictModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const TrackingModal = lazy(() => import('./components/TrackingModal'));
const ChatModal = lazy(() => import('./components/ChatModal'));
const CourierHistoryModal = lazy(() => import('./components/CourierHistoryModal'));
const AppDownloadModal = lazy(() => import('./components/AppDownloadModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const DepositModal = lazy(() => import('./components/DepositModal'));
const MultiOrderSelectionModal = lazy(() => import('./components/MultiOrderSelectionModal'));
const NotifModal = lazy(() => import('./components/NotifModal'));
const DeliveryInfoModal = lazy(() => import('./components/DeliveryInfoModal'));
const LangModal = lazy(() => import('./components/LangModal'));
const PolicyModal = lazy(() => import('./components/PolicyModal'));
const CartDrawerModal = lazy(() => import('./components/CartDrawerModal'));
const AdminPasswordModal = lazy(() => import('./components/AdminPasswordModal'));
const ProfileModal = lazy(() => import('./components/ProfileModal'));
const OrderDetailsModal = lazy(() => import('./components/OrderDetailsModal'));
const ReceiptModal = lazy(() => import('./components/ReceiptModal'));
const LandingPageEditorModal = lazy(() => import('./components/LandingPageEditorModal'));
const MobileCategoryDrawer = lazy(() => import('./components/MobileCategoryDrawer').then(m => ({ default: m.MobileCategoryDrawer })));
const LandingPageView = lazy(() => import('./components/LandingPageView'));
import SiteFooter from './components/SiteFooter';
import { printOrderInvoice, printBulkOrderStickers, downloadOrdersCSV } from './utils/adminExports';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Moon, Sun, PackageOpen } from "lucide-react";
import {Edit3,
  Printer,
  Receipt,
  
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Phone,
  Facebook,
  CreditCard,
  Heart,
  TrendingUp,
  Award,
  Plus,
  Minus,
  Eye,
  EyeOff,
  LayoutGrid,
  Truck,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  ShoppingBag,
  X,
  Send,
  Mic,
  Image as ImageIcon,
  Square,
  Paperclip,
  Camera,
  StopCircle,
  Headset,
  Wallet,
  LogOut,
  History,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CheckCircle2,
  Check,
  AlertCircle,
  AlertTriangle,
  Gift,
  PlusCircle,
  Landmark,
  Trash2,
  Users,
  MapPin,
  Navigation,
  Database,
  Key,
  Edit,
  Upload,
  Star,
  Share2,
  XCircle,
  Clock,
  Calendar,
  CheckCircle,
  MessageSquare,
  Languages,
  CircleDot,
  Copy,
  Bell,
  Info,
  ThumbsUp,
  Home,
  MessageCircle,
  Edit2,
  Tag,
  Layout,
  Package,
  Save,
  Download,
  Loader2,
  LayoutTemplate,
  Ban,
  UserCheck,
  List,
  Box,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Category, AdminUser, Review, Campaign, Expense } from "./types.ts";
import { ImageCarousel } from "./components/ui/ImageCarousel";
// GoogleGenAI removed - server-side only SDK, use /api/chat endpoint instead
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  increment,
  orderBy,
  runTransaction,
  handleFirestoreError,
  OperationType,
  arrayUnion,
  arrayRemove,
  limit,
  DocumentReference,
  requestPushPermission,
} from "./lib/firebase";
// Mock Data in Bengali - Gadget Focused (Moved to state for dynamic loading)
import { districtThanaMap, ALL_DISTRICTS, DEFAULT_CATEGORIES as default_categories, DEFAULT_PRODUCTS as default_products, DEFAULT_BANNERS as banners, BENGALI_FONTS, STORAGE_KEYS, purgeLegacyCaches } from './constants/data';
import { ProductSkeleton } from './components/ProductSkeleton';
import { ProductCard } from './components/ProductCard';
import ZoomableImage from './components/ui/ZoomableImage';
import toast, { Toaster } from 'react-hot-toast';
import { getOrderLocalDateString, formatOrderGroupDate, toBengaliNumber, getYouTubeEmbedUrl, cleanLatex, sumValues, getProductPath, getProductIdFromUrl, findProductBySlugOrId, slugify, getCategoryPath, getCategorySlug, findCategoryBySlug, saveProductsToCache, safeSetLocalStorage, safeGetLocalStorage } from './utils/helpers';
import { FlashSaleCountdown } from './components/FlashSaleCountdown';
import { useUIContext } from './context/UIContext';
import { useAuthContext } from './context/AuthContext';
import { useCartContext } from "./context/CartContext";
import { useProductContext } from "./context/ProductContext";

// Notification sound URL
const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3";
const notifyAdminsOnNewOrder = async (orderId: string, total: number) => {
  try {
    const q = query(collection(db, "users"), where("isAdmin", "==", true));
    const querySnapshot = await getDocs(q);
    const adminTokens: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) adminTokens.push(data.fcmToken);
    });
    
    adminTokens.forEach(token => {
      fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          title: "নতুন অর্ডার এসেএসেছে!",
          body: `অর্ডার #${String(orderId).slice(-6).toUpperCase()} - ৳${total}`,
          link: "/admin"
        })
      }).catch(() => {});
    });
  } catch (err) {
    console.warn("Failed to notify admins:", err);
  }
};

const compressImageFile = async (file: File, options: any) => {
  const imageCompression = (await import('browser-image-compression')).default;
  return imageCompression(file, options);
};

function App() {














  const urlParams = new URLSearchParams(window.location.search);
  const { isQuotaExceeded, setIsQuotaExceeded, adminReplyingTo, setAdminReplyingTo, chatReplyingTo, setChatReplyingTo, isProfileOpen, setIsProfileOpen, profileTab, setProfileTab, activePolicy, setActivePolicy } = useUIContext();
    const { showToast, setShowToast, cartItems, setCartItems, cartCount, checkoutItems, setCheckoutItems, isCheckoutOpen, setIsCheckoutOpen, checkoutName, setCheckoutName, checkoutPhone, setCheckoutPhone, checkoutPhoneFocused, setCheckoutPhoneFocused, checkoutDistrict, setCheckoutDistrict, checkoutAddress, setCheckoutAddress, checkoutNote, setCheckoutNote, paymentMethod, setPaymentMethod, availableRewardPoints, setAvailableRewardPoints, isApplyingRewardPoints, setIsApplyingRewardPoints, checkoutDistrictSearch, setCheckoutDistrictSearch, isCheckoutDistrictOpen, setIsCheckoutDistrictOpen, appliedCoupon, setAppliedCoupon, deliveryArea, setDeliveryArea, addToCartInternal, addToCart, updateQuantity, setQuantityDirect, removeItem, getProductPrice, getDeliveryCharge, calculateTotal, checkoutFirstName, setCheckoutFirstName, checkoutLastName, setCheckoutLastName, checkoutThana, setCheckoutThana, checkoutEmail, setCheckoutEmail } = useCartContext();
        const { activeCampaign, setActiveCampaign, campaigns, setCampaigns, selectedColor, setSelectedColor, categories, setCategories, products, setProducts, searchQuery, setSearchQuery, searchInput, setSearchInput, selectedCategory, setSelectedCategory, isTrendingFilterActive, setIsTrendingFilterActive, selectedBrand, setSelectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, sortBy, setSortBy, trendingIndices, setTrendingIndices, activeTrendingSlot, setActiveTrendingSlot, selectedProduct, setSelectedProduct, isProductDetailsOpen, setIsProductDetailsOpen, flashSaleProducts, relatedProducts, filteredProducts, featuredProducts, newArrivals, brands, selectedSubcategory, setSelectedSubcategory, aiSearchProductIds, setAiSearchProductIds, isAiSearching, setIsAiSearching } = useProductContext();

    const [inlineOrderDistrict, setInlineOrderDistrict] = useState("");

    const [inlineOrderThana, setInlineOrderThana] = useState("");

    const [inlineOrderArea, setInlineOrderArea] = useState<"inside" | "outside">("inside");

    const [inlineOrderAddress, setInlineOrderAddress] = useState("");

    const [inlineOrderName, setInlineOrderName] = useState("");

    const [inlineOrderPhone, setInlineOrderPhone] = useState("");

    const [inlineOrderNote, setInlineOrderNote] = useState("");

    const [isInlineOrderProcessing, setIsInlineOrderProcessing] = useState(false);

    const [inlineOrderSuccess, setInlineOrderSuccess] = useState(false);

    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    const [trackingInput, setTrackingInput] = useState("");

    const [trackingResult, setTrackingResult] = useState<any>(null);

    const [isTrackingLoading, setIsTrackingLoading] = useState(false);

    const [trackingError, setTrackingError] = useState("");

    const handleTrackOrder = async (searchOverride?: string) => {
        const rawInput = (typeof searchOverride === "string" && searchOverride.trim()) ? searchOverride.trim() : trackingInput.trim();
        if (!rawInput) return;
        setIsTrackingLoading(true);
        setTrackingError("");
        setTrackingResult(null);

        try {
          const ordersRef = collection(db, "orders");
          
          // Normalize Bengali numerals to English digits and clean prefixes
          const normalizedInput = rawInput
            .replace(/[০-৯]/g, (d: string) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString())
            .trim();
          const searchVal = normalizedInput.replace(/^[#\s]+/, "").trim();
          const searchValUpper = searchVal.toUpperCase();
          let foundOrder: any = null;

          // 1. Fast in-memory lookup from orderHistory if available
          if (Array.isArray(orderHistory) && orderHistory.length > 0) {
            const memoryMatch = orderHistory.find((o: any) => {
              if (searchVal.startsWith("01") || searchVal.startsWith("+8801") || searchVal.startsWith("8801")) {
                const cleanInputPhone = searchVal.replace(/\D/g, "");
                const cleanOrderPhone = String(o.customerPhone || "").replace(/\D/g, "");
                return cleanOrderPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(cleanOrderPhone);
              }
              const sId = String(o.shortId || "").toUpperCase();
              const oId = String(o.orderId || "").toUpperCase();
              const docId = String(o.id || "").toUpperCase();
              const cTrack = String(o.couriers?.trackingId || "").toUpperCase();
              const cCons = String(o.couriers?.consignmentId || "").toUpperCase();

              return (
                sId === searchValUpper ||
                oId === searchValUpper ||
                docId === searchValUpper ||
                oId.endsWith(searchValUpper) ||
                docId.endsWith(searchValUpper) ||
                cTrack === searchValUpper ||
                cCons === searchValUpper
              );
            });
            if (memoryMatch) {
              foundOrder = { ...memoryMatch };
            }
          }

          // 2. Query Firestore if not found in memory
          if (!foundOrder) {
            if (searchVal.startsWith("01") || searchVal.startsWith("+8801") || searchVal.startsWith("8801")) {
              const cleanPhone = searchVal.replace(/^\+?88/, "");
              const phoneQueries = [
                query(ordersRef, where("customerPhone", "==", cleanPhone)),
                query(ordersRef, where("customerPhone", "==", "+88" + cleanPhone)),
                query(ordersRef, where("customerPhone", "==", searchVal))
              ];

              for (const pq of phoneQueries) {
                const snap = await getDocs(pq);
                if (!snap.empty) {
                  const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  orders.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                  foundOrder = orders[0];
                  break;
                }
              }
            } else {
              // 2a. Direct doc ID lookup
              try {
                const directDocRef = doc(db, "orders", searchVal);
                const directDocSnap = await getDoc(directDocRef);
                if (directDocSnap.exists()) {
                  foundOrder = { id: directDocSnap.id, ...directDocSnap.data() };
                }
              } catch (e) {}

              // 2b. Check indexed shortId
              if (!foundOrder) {
                const q = query(ordersRef, where("shortId", "==", searchValUpper));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  orders.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
                  foundOrder = orders[0];
                }
              }

              // 2c. Check indexed orderId
              if (!foundOrder) {
                const qFull = query(ordersRef, where("orderId", "==", searchVal));
                const snapFull = await getDocs(qFull);
                if (!snapFull.empty) {
                  const ordersFull = snapFull.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  foundOrder = ordersFull[0];
                }
              }

              // 2d. Check displayId
              if (!foundOrder) {
                const qDisplay = query(ordersRef, where("displayId", "==", searchVal));
                const snapDisplay = await getDocs(qDisplay);
                if (!snapDisplay.empty) {
                  const ordersDisplay = snapDisplay.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  foundOrder = ordersDisplay[0];
                }
              }

              // 2e. Check courier tracking ID
              if (!foundOrder) {
                const qCourier = query(ordersRef, where("couriers.trackingId", "==", searchVal));
                const snapCourier = await getDocs(qCourier);
                if (!snapCourier.empty) {
                  foundOrder = { id: snapCourier.docs[0].id, ...snapCourier.docs[0].data() };
                }
              }

              // 2f. Fallback Scan: Search recent orders for suffix / short ID matches
              // (Ensures older orders or orders without explicit shortId field in DB are found when searched by 6-digit shortId)
              if (!foundOrder && searchVal.length >= 4) {
                try {
                  const qRecent = query(ordersRef, orderBy("createdAt", "desc"), limit(300));
                  const snapRecent = await getDocs(qRecent);
                  const matchedDoc = snapRecent.docs.find(d => {
                    const data = d.data() as any;
                    const docId = String(d.id || "").toUpperCase();
                    const oId = String(data.orderId || "").toUpperCase();
                    const sId = String(data.shortId || "").toUpperCase();
                    const cTrack = String(data.couriers?.trackingId || "").toUpperCase();
                    const cCons = String(data.couriers?.consignmentId || "").toUpperCase();

                    return (
                      sId === searchValUpper ||
                      docId === searchValUpper ||
                      oId === searchValUpper ||
                      docId.endsWith(searchValUpper) ||
                      oId.endsWith(searchValUpper) ||
                      cTrack === searchValUpper ||
                      cCons === searchValUpper ||
                      docId.slice(-6) === searchValUpper ||
                      oId.slice(-6) === searchValUpper
                    );
                  });
                  if (matchedDoc) {
                    foundOrder = { id: matchedDoc.id, ...matchedDoc.data() };
                  }
                } catch (errFallback) {
                  console.warn("Tracking fallback scan error:", errFallback);
                }
              }
            }
          }

          if (!foundOrder) {
            setTrackingError("অর্ডারটি খুঁজে পাওয়া যায়নি। সঠিক ফোন নাম্বার বা অর্ডার আইডি দিন।");
            setIsTrackingLoading(false);
            return;
          }

          const order = {
            ...foundOrder,
            shortId: foundOrder.shortId || String(foundOrder.orderId || foundOrder.id).slice(-6).toUpperCase()
          };

          const resolvedCourierTrackId =
            order.couriers?.trackingId ||
            order.courierTrackingId ||
            order.trackingId ||
            order.courierConsignmentId;
          const resolvedCourierSvc = (
            order.couriers?.service ||
            order.courierName ||
            (order.pathaoStatus ? "Pathao" : "Steadfast")
          ).toLowerCase();

          if (resolvedCourierTrackId && resolvedCourierSvc.includes("steadfast")) {
            try {
              // API keys are kept server-side; proxy handles auth
              const response = await fetch(`/api/steadfast-status?id=${encodeURIComponent(resolvedCourierTrackId)}`);
              const data = await response.json();
              if (data.success && data.data && data.data.delivery_status) {
                 setTrackingResult({ ...order, steadfastStatus: data.data.delivery_status });
              } else {
                 setTrackingResult({ ...order, steadfastStatus: order.steadfastStatus || order.courierStatus || "Steadfast এ খোঁজ পাওয়া যায়নি" });
              }
            } catch (e) {
              setTrackingResult({ ...order, steadfastStatus: order.steadfastStatus || order.courierStatus || "Failed to fetch status" });
            }
          } else if (resolvedCourierTrackId && resolvedCourierSvc.includes("pathao")) {
            try {
              const response = await fetch(`/api/pathao-status?id=${encodeURIComponent(resolvedCourierTrackId)}`);
              const data = await response.json();
              const pStatus = data.data?.data?.order?.order_status || data.data?.data?.order?.transfer_status;
              if (data.success && pStatus) {
                 setTrackingResult({ ...order, pathaoStatus: pStatus });
              } else {
                 setTrackingResult({ ...order, pathaoStatus: order.pathaoStatus || order.courierStatus || "Pathao এ খোঁজ পাওয়া যায়নি" });
              }
            } catch (e) {
              setTrackingResult({ ...order, pathaoStatus: order.pathaoStatus || order.courierStatus || "Failed to fetch status" });
            }
          } else {
            setTrackingResult(order);
          }
        } catch (err: any) {
          setTrackingError("সার্ভার বা নেটওয়ার্ক সমস্যা: " + err.message);
        }
        setIsTrackingLoading(false);
      };

    const [isOrderSuccess, setIsOrderSuccess] = useState(false);

    const [completedOrderReceipt, setCompletedOrderReceipt] = useState<any>(null);

    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

    const [isOrderProcessing, setIsOrderProcessing] = useState(false);
    const isOrderProcessingRef = useRef(false);
    const isInlineOrderProcessingRef = useRef(false);

    const [inlinePhoneFocused, setInlinePhoneFocused] = useState(false);

    const handleVerifyOTP = () => {
        if (adminOTPInput === generatedOTP) {
          if (user) {
            localStorage.setItem(`admin_verified_${user.uid}`, "true");
            sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
          }
          setIsAdminVerified(true);
          setIs2FAPending(false);
          setAdminOTPError("Your admin profile does not have a phone number. Please add one in the admin panel.");
          setAdminOTPInput("");
          setGeneratedOTP("");
        } else {
          setAdminOTPError("Verification code is incorrect.");
        }
      };

    const handleConfirmOrder = async (e: FormEvent) => {
        e.preventDefault();
        if (isOrderProcessing || isOrderProcessingRef.current) return;
        if (isQuotaExceeded) {
          toast.error("Quota exceeded, cannot save data at the moment.");
          return;
        }

        const customerPhone = (checkoutPhone || "").trim();
        const address = (checkoutAddress || "").trim();
        const firstName = (checkoutFirstName || checkoutName || "").trim();
        const thana = (checkoutThana || "").trim();
        const email = (checkoutEmail || "").trim();

        if (!firstName) {
          toast.error("Name is required!");
          return;
        }
        if (!address) {
          toast.error("Address is required!");
          return;
        }
        if (!thana) {
          toast.error("Upazila/Thana is required!");
          return;
        }
        if (!checkoutDistrict) {
          toast.error("District is required!");
          return;
        }
        if (!customerPhone || customerPhone.length < 11) {
          toast.error("Please enter a valid mobile number (at least 11 digits)!");
          return;
        }

        isOrderProcessingRef.current = true;
        setIsOrderProcessing(true);

        const customerName = firstName;
        const checkoutArea = ((checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "ঢাকা জেলা (বাইরে)") || checkoutDistrict === "Dhaka") ? "inside" : "outside";
        const finalAddress = `${address}, ${thana}, ${checkoutDistrict}${checkoutNote ? ` (নোট: ${checkoutNote})` : ""}`;
        const paymentMethod = "cod";
        const orderId = Date.now().toString();
        const deliveryCharge = getDeliveryCharge(checkoutItems, checkoutArea, appliedCoupon);
        const totalWeight = checkoutItems.reduce((acc, item) => acc + (item.product?.weight || 0) * item.quantity, 0);
        const isPreOrder = checkoutItems.some((item) => item.product.isComingSoon);
        const subtotal = checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
        
        const pointsDiscount = isApplyingRewardPoints ? availableRewardPoints : 0;
        const totalAmount = subtotal + deliveryCharge - pointsDiscount;
        const newOrder: any = {
          orderId,
          shortId: String(orderId).slice(-6).toUpperCase(),
          customerName: customerName || (userProfile?.displayName || "Guest"),
          customerPhone: customerPhone || (userProfile?.phone || "N/A"),
          address: finalAddress,
          deliveryArea: checkoutArea,
          deliveryCharge,
          totalWeight,
          pointsUsed: isApplyingRewardPoints ? availableRewardPoints : 0,
          pointsDiscount: pointsDiscount,
          appliedCoupon,
          subtotal,
          isPreOrder,
          items: checkoutItems.map((item) => {
            const itemColor = (item.color && item.color !== "N/A") ? item.color : undefined;
            const itemSize = (item.size && item.size !== "N/A") ? item.size : undefined;
            const directSmsName = (item.product?.smsName || item.product?.sms_name || '').trim();
            return {
              product: {
                id: item.product.id,
                name: item.product.name,
                smsName: directSmsName,
                price: getProductPrice(item.product, item.quantity),
                buyingPrice: item.product.buyingPrice || 0,
                image: item.product.image,
                isComingSoon: !!item.product.isComingSoon,
              },
              smsName: directSmsName,
              quantity: item.quantity,
              color: itemColor,
              size: itemSize,
            };
          }),
          total: totalAmount,
          paymentMethod,
          transId:
            (paymentMethod as any) !== "cod" && (paymentMethod as any) !== "wallet"
              ? transId || "N/A"
              : (paymentMethod as any) === "wallet"
                ? `WALLET-${orderId}`
                : "N/A",
          date: new Date().toLocaleString("bn-BD"),
          status: "pending",
          createdAt: serverTimestamp(),
          customerEmail: checkoutEmail || user?.email || "",
          district: checkoutDistrict,
          userId: user?.uid || "guest",
          attribution: getStoredAttribution(),
          trackingSignals: getOrderTrackingSignals(),
          purchaseTracked: false,
        };
        try {
          // Concurrently create order and decrement stock in Firestore
          const stockPromises = checkoutItems.map((item) => {
            const pId = item.product.id;
            const reqQty = Number(item.quantity) || 1;
            const currentProd = products.find(p => p.id === pId) || item.product;
            const updatePayload: any = {
              salesCount: increment(reqQty)
            };

            if (currentProd?.variants && Array.isArray(currentProd.variants) && currentProd.variants.length > 0) {
              const updatedVariants = currentProd.variants.map((v: any) => {
                const isMatch = (!item.color || v.name === item.color) && (!item.size || v.size === item.size);
                if (isMatch) {
                  return { ...v, stock: Math.max(0, (Number(v.stock) || 0) - reqQty) };
                }
                return v;
              });
              const newTotalStock = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
              updatePayload.variants = updatedVariants;
              updatePayload.stock = Math.max(0, newTotalStock);
            } else {
              const currentStock = Math.max(0, Number(currentProd?.stock) || 0);
              updatePayload.stock = Math.max(0, currentStock - reqQty);
            }

            return updateDoc(doc(db, "products", pId), updatePayload);
          });

          await Promise.all([
            setDoc(doc(db, "orders", orderId), newOrder),
            ...stockPromises
          ]);
          
          // Send confirmation email via PHP endpoint
          try {
            axios.post("/api/confirm-order", newOrder).catch(e => console.error("Email err:", e));
          } catch(e) {}
          try {
            savePhoneProfile(newOrder.customerPhone, customerName, address, checkoutDistrict, thana, checkoutArea);
          } catch(e) {}
          // Local Update
          const localOrder = {
            ...newOrder,
            id: orderId,
            createdAt: new Date().toISOString(),
          };
          const updatedHistory = [localOrder, ...orderHistory];
          setOrderHistory(updatedHistory);
          try {
            localStorage.setItem("ishopbd_orders", JSON.stringify(updatedHistory));
          } catch (e) {
            console.warn("Failed to save orders to localStorage:", e);
          }
          // Notify Admin via sound / realtime
          try {
            notifyAdminsOnNewOrder(orderId, newOrder.total);
          } catch (e) {
            console.warn("Notification failed:", e);
          }
          try {
            const productNames = newOrder.items.map((i: any) => {
              const directSms = (i.smsName || i.product?.smsName || '').trim();
              if (directSms) return directSms;
              const fallback = (i.product?.name || i.name || '').trim();
              return fallback.length > 25 ? fallback.substring(0, 25) + '...' : fallback;
            }).filter(Boolean).join(', ');
            const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${newOrder.total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.com ধন্যবাদ!`;
            fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: newOrder.customerPhone, message }),
            }).catch(err => console.warn("Auto SMS failed:", err));
          } catch(e) {}
          try {
            const sessionId = localStorage.getItem("ishopbd_session_id");
            if (sessionId) {
              deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
              localStorage.removeItem("ishopbd_session_id");
            }
            if (newOrder.customerPhone) {
              deleteDoc(doc(db, "incomplete_orders", newOrder.customerPhone)).catch(() => {});
            }
          } catch(e) {}

          // Purchase conversion is intentionally deferred until admin confirms the order.

          setCompletedOrderReceipt({ ...newOrder, orderId });
          setIsCheckoutOpen(false);
          setCheckoutItems([]);
          
          // Only clear cart if this was a cart-level checkout
          const isCartCheckout = cartItems.length > 0 && 
                                 checkoutItems.length === cartItems.length && 
                                 checkoutItems.every((item, idx) => 
                                   item.product.id === cartItems[idx].product.id &&
                                   item.quantity === cartItems[idx].quantity &&
                                   item.color === cartItems[idx].color &&
                                   item.size === cartItems[idx].size
                                 );
          if (isCartCheckout) {
            setCartItems([]);
          }
          setTransId("");
          isOrderProcessingRef.current = false;
          setIsOrderProcessing(false);
          setIsApplyingRewardPoints(false);
          setAvailableRewardPoints(0);
        } catch (error: any) {
          console.error("Order error:", error);
          isOrderProcessingRef.current = false;
          setIsOrderProcessing(false);
          
          try {
            handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
          } catch (fsErr: any) {
            toast.error("অর্ডার প্রসেস করতে সমস্যা হয়েছে: " + (error.message || "Unknown error"));
          }
        }
      };

    const handleInlineOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        if (isInlineOrderProcessing || isInlineOrderProcessingRef.current) return;
        if (!validateSelections()) {
          return;
        }
        
        if (!inlineOrderName.trim()) {
          toast.error("দয়া করে আপনার নাম প্রদান করুন।");
          const el = document.getElementById("inline-name-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }
        if (!inlineOrderPhone || inlineOrderPhone.trim().length < 11) {
          toast.error("সঠিক ফোন নাম্বার দিন (কমপক্ষে ১১ ডিজিট)!");
          const el = document.getElementById("inline-phone-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }
        if (!inlineOrderAddress.trim()) {
          toast.error("দয়া করে আপনার সম্পূর্ণ ঠিকানা প্রদান করুন।");
          const el = document.getElementById("inline-address-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }

        isInlineOrderProcessingRef.current = true;
        setIsInlineOrderProcessing(true);
        try {
          let finalPrice = getProductPrice(selectedProduct, tempSelectedQty);
          if (wholesaleSizeQty && Object.keys(wholesaleSizeQty).length > 0) {
            const totalWholesaleQty = Object.values(wholesaleSizeQty as Record<string, number>).reduce((sum, qty) => sum + qty, 0);
            finalPrice = getProductPrice(selectedProduct, totalWholesaleQty);
          }
          
          let finalAddress = inlineOrderAddress;
          if (inlineOrderDistrict && inlineOrderThana) {
            finalAddress = `${inlineOrderAddress}, ${inlineOrderThana}, ${inlineOrderDistrict}`;
          }
          const orderData = {
            orderId: `ORD${Date.now()}`,
            customerName: inlineOrderName,
            customerPhone: inlineOrderPhone,
            address: finalAddress,
            deliveryArea: inlineOrderArea,
            note: inlineOrderNote,
            items: [{
              product: selectedProduct,
              smsName: (selectedProduct?.smsName || '').trim(),
              quantity: tempSelectedQty,
              color: tempSelectedColor,
              size: tempSelectedSize,
              price: finalPrice,
              wholesaleSizeQty: wholesaleSizeQty
            }],
            subtotal: finalPrice * tempSelectedQty,
            deliveryCharge: getDeliveryCharge([{product: selectedProduct, quantity: tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null),
            pointsDiscount: isApplyingRewardPoints ? availableRewardPoints : 0,
            pointsUsed: isApplyingRewardPoints ? availableRewardPoints : 0,
            total: (finalPrice * tempSelectedQty) + getDeliveryCharge([{product: selectedProduct, quantity: tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null) - (isApplyingRewardPoints ? availableRewardPoints : 0),
            status: 'pending',
            createdAt: serverTimestamp(),
            orderType: 'direct_buy',
            customerEmail: user?.email || "",
            district: inlineOrderDistrict,
            userId: user?.uid || "guest",
            attribution: getStoredAttribution(),
            trackingSignals: getOrderTrackingSignals(),
            purchaseTracked: false,
          };

          // Concurrently create order and decrement stock in Firestore
          const item = orderData.items[0];
          const pId = item.product.id;
          const reqQty = Number(item.quantity) || 1;
          const currentProd = products.find(p => p.id === pId) || item.product;

          const updatePayload: any = {
            salesCount: increment(reqQty)
          };

          if (currentProd?.variants && Array.isArray(currentProd.variants) && currentProd.variants.length > 0) {
            const updatedVariants = currentProd.variants.map((v: any) => {
              const isMatch = (!item.color || v.name === item.color) && (!item.size || v.size === item.size);
              if (isMatch) {
                return { ...v, stock: Math.max(0, (Number(v.stock) || 0) - reqQty) };
              }
              return v;
            });
            const newTotalStock = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
            updatePayload.variants = updatedVariants;
            updatePayload.stock = Math.max(0, newTotalStock);
          } else {
            const currentStock = Math.max(0, Number(currentProd?.stock) || 0);
            updatePayload.stock = Math.max(0, currentStock - reqQty);
          }

          await Promise.all([
            setDoc(doc(db, "orders", orderData.orderId), orderData),
            updateDoc(doc(db, "products", pId), updatePayload)
          ]);
          
          // Send confirmation email via PHP endpoint
          try {
            axios.post("/api/confirm-order", orderData).catch(e => console.error("Email err:", e));
          } catch(e) {}
          try {
            savePhoneProfile(orderData.customerPhone, orderData.customerName, inlineOrderAddress, inlineOrderDistrict, inlineOrderThana, orderData.deliveryArea);
          } catch(e) {}
          
          try {
            const productNames = orderData.items.map((i: any) => {
              const directSms = (i.smsName || i.product?.smsName || '').trim();
              if (directSms) return directSms;
              const fallback = (i.product?.name || i.name || '').trim();
              return fallback.length > 25 ? fallback.substring(0, 25) + '...' : fallback;
            }).filter(Boolean).join(', ');
            const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderData.orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${orderData.total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.com ধন্যবাদ!`;
            fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: orderData.customerPhone, message }),
            }).catch(err => console.warn("Auto SMS failed:", err));
          } catch(e) {}
          try {
            const sessionId = localStorage.getItem("ishopbd_session_id");
            if (sessionId) {
              deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
              localStorage.removeItem("ishopbd_session_id");
            }
            if (orderData.customerPhone) {
              deleteDoc(doc(db, "incomplete_orders", orderData.customerPhone)).catch(() => {});
            }
          } catch(e) {}

          // Track Purchase (Browser + Server-Side CAPI/Events API with Event ID Deduplication)
          try {
            const inlineItems = orderData.items.map((i: any) => ({
              id: i.product.id,
              name: i.product.name,
              price: i.price || i.product.price,
              quantity: i.quantity,
              category: i.product.category,
              brand: i.product.brand,
            }));
            if (lastInlineCheckoutProductRef.current !== orderData.items[0]?.product?.id) {
              lastInlineCheckoutProductRef.current = orderData.items[0]?.product?.id || null;
              trackInitiateCheckout(inlineItems, orderData.subtotal || orderData.total);
            }

          } catch (err) {}
          // Show receipt
          setCompletedOrderReceipt(orderData);
          
          // Reset form
          setInlineOrderName("");
          setInlineOrderPhone("");
          setInlineOrderAddress("");
          setInlineOrderNote("");
          
          setIsProductDetailsOpen(false);
        } catch (error) {
          console.error('Error placing order:', error);
          const msg = error instanceof Error ? error.message : "অজানা ত্রুটি";
          alert('অর্ডার প্লেস করতে সমস্যা হয়েছে: ' + msg + '\n(সার্ভার লিমিট শেষ হয়ে থাকলে কিছুক্ষণ পর চেষ্টা করুন)');
        } finally {
          isInlineOrderProcessingRef.current = false;
          setIsInlineOrderProcessing(false);
        }
      };
    
  const { user, setUser, userProfile, setUserProfile, expenses, setExpenses, likedProducts, setLikedProducts, likedProductsRef, likeInProgressRef } = useAuthContext();
  const isInitialOrderLoadRef = useRef(true);
  
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }, []);
  // Global Quota Listener
  useEffect(() => {
    const handleQuotaExceeded = () => {
      if (!isQuotaExceeded) {
        setIsQuotaExceeded(true);
        console.warn("Global Quota exceeded detected.");
        toast.error("সার্ভার রিড/রাইট লিমিট শেষ! দয়া করে কিছুক্ষণ পর চেষ্টা করুন।", {
          duration: 5000,
          id: "quota-error"
        });
      }
    };
    window.addEventListener("firestore-quota-exceeded", handleQuotaExceeded);
    return () => window.removeEventListener("firestore-quota-exceeded", handleQuotaExceeded);
  }, []);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
    const [quickEditOrderId, setQuickEditOrderId] = useState<string | null>(null);
    const [quickEditData, setQuickEditData] = useState<{customerName: string; customerPhone: string; address: string}>({customerName: "", customerPhone: "", address: ""});
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderData, setEditingOrderData] = useState<any>({});
  
  const [adminStartDate, setAdminStartDate] = useState<string>("");
  const [adminEndDate, setAdminEndDate] = useState<string>("");
  const [adminOrderAreaFilter, setAdminOrderAreaFilter] = useState<string>("all");
  const [reportTimeframe, setReportTimeframe] = useState<string>("28d");
  
    const handleQuickEditOrderItems = (order: any) => {
      setSelectedOrderForDetails(order);
      setEditingOrderData({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        items: JSON.parse(JSON.stringify(Array.isArray(order?.items) ? order.items : []))
      });
      setIsEditingOrder(true);
    };
    const handleUpdateOrderDetails = async () => {
    if (!selectedOrderForDetails || !editingOrderData.customerName || !editingOrderData.customerPhone || !editingOrderData.address) return;
    try {
      const updatedItems = editingOrderData.items || selectedOrderForDetails.items || [];
      const subtotal = updatedItems.reduce((acc: number, curr: any) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
      
      const deliveryCharge = Number(selectedOrderForDetails.deliveryCharge || 0);
      const discount = Number(selectedOrderForDetails.discount || 0);
      const total = subtotal + deliveryCharge - discount;
      await updateDoc(doc(db, "orders", selectedOrderForDetails.id), {
        customerName: editingOrderData.customerName,
        customerPhone: editingOrderData.customerPhone,
        address: editingOrderData.address,
        items: updatedItems,
        subtotal: subtotal,
        total: total
      });
      
      const newOrderData = {
        ...selectedOrderForDetails,
        ...editingOrderData,
        subtotal: subtotal,
        total: total,
        items: updatedItems
      };
      
      setSelectedOrderForDetails(newOrderData);
      setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? newOrderData : o));
      setIsEditingOrder(false);
    } catch (e) {
      alert("অর্ডার আপডেট করতে সমস্যা হয়েছে।");
    }
  };
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  // Inline Order State
  const [isInlineDistrictOpen, setIsInlineDistrictOpen] = useState(false);
  const [isInlineThanaOpen, setIsInlineThanaOpen] = useState(false);
  const [inlineThanaSearch, setInlineThanaSearch] = useState("");
  const [isInlineThanaOpenWholesale, setIsInlineThanaOpenWholesale] = useState(false);
  const [inlineThanaSearchWholesale, setInlineThanaSearchWholesale] = useState("");
  const [inlineDistrictSearch, setInlineDistrictSearch] = useState("");
  const [isInlineDistrictOpenWholesale, setIsInlineDistrictOpenWholesale] = useState(false);
  const [inlineDistrictSearchWholesale, setInlineDistrictSearchWholesale] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  
  
  const [transId, setTransId] = useState("");
  const [isPaymentSimulating, setIsPaymentSimulating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAdminRecording, setIsAdminRecording] = useState(false);
  const [adminMediaRecorder, setAdminMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("ishopbd_chat_session");
    if (saved && saved.startsWith("guest_")) return saved;
    const newId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("ishopbd_chat_session", newId);
    return newId;
  });
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [adminOrdersLimit, setAdminOrdersLimit] = useState(100);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannerDirection, setBannerDirection] = useState(1);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const lastTrackedSearchRef = useRef<string>("");
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      const q = searchInput.trim();
      if (q.length >= 2 && q !== lastTrackedSearchRef.current) {
        lastTrackedSearchRef.current = q;
        trackSearch(q);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeCampaign, isTrendingFilterActive]);
  // Use effects for URL handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const campaignSlug = params.get("campaign");
    if (campaignSlug && campaigns.length > 0) {
      const found = campaigns.find((c) => c.slug === campaignSlug && c.isActive);
      if (found) {
        setActiveCampaign(found);
        setSelectedCategory("all");
        setSearchInput("");
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("campaign");
        window.history.replaceState({}, "", url.toString());
      }
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setTimeout(() => {
        const productsSection = document.getElementById("product-display-section");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [campaigns]);
  const copyCategoryLink = (categoryName: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?category=${encodeURIComponent(categoryName)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`"${categoryName}" ক্যাটাগরির লিঙ্ক কপি হয়েছে! আপনি এখন এটি যে কোনো জায়গায় শেয়ার করতে পারেন।`);
    }).catch(err => {
      console.error("Copy failed", err);
      alert("লিঙ্ক কপি করা সম্ভব হয়নি।");
    });
  };
  const copyLandingPageLink = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    const path = prod ? getProductPath(prod) : `/product/${productId}`;
    const shareUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Product link copied to clipboard!");
    }).catch(err => {
      console.error("Copy failed", err);
      toast.error("Failed to copy product link.");
    });
  };
  const openLandingEditor = (product: any) => {
    setLandingEditorProduct(product);
    const cfg = product.landingConfig;
    setLandingEditorConfig({
      headline: cfg?.headline || "",
      subheadline: cfg?.subheadline || "",
      badgeText: cfg?.badgeText || "",
      extraImages: cfg?.extraImages || [],
      features: cfg?.features || [
        { icon: "zap", title: "প্রিমিয়াম কোয়ালিটি", desc: "আমরা সরাসরি কারখানা থেকে সেরা মানের পণ্য সরবরাহ করি।" },
        { icon: "thumbsup", title: "সহজ ব্যবহার উপযোগিতা", desc: "যেকোনো বয়সের মানুষের জন্য সহজ ডিজাইন।" },
        { icon: "truck", title: "দ্রুত ডেলিভারি সুবিধা", desc: "অর্ডার করার ২৪-৭২ ঘণ্টাএ° মধ্যে হোম ডেলিভারি।" },
        { icon: "shield", title: "নিশ্চিন্তে ক্যাশ অন ডেলিভারি", desc: "প্রোডাক্ট পেয়ে সন্তুষ্ট হয়ে তারপর মূল্য পরিশোধ।" },
      ],
      bodyText: cfg?.bodyText || "",
      videoUrls: cfg?.videoUrls || [],
      packages: cfg?.packages || [],
      priceOverride: cfg?.priceOverride || "",
      oldPriceOverride: cfg?.oldPriceOverride || "",
      showTrustBadges: cfg?.showTrustBadges !== false,
    });
  };
  const saveLandingConfig = async () => {
    if (!landingEditorProduct?.id) return;
    setIsSavingLandingConfig(true);
    try {
      const configToSave = { ...landingEditorConfig };
      await updateDoc(doc(db, "products", landingEditorProduct.id), { landingConfig: configToSave, updatedAt: serverTimestamp() });
      setProducts(prev => prev.map(p => p.id === landingEditorProduct.id ? { ...p, landingConfig: configToSave } as any : p));
      toast.success("ল্যান্ডিং পেজ কনফিগ সেভ হয়েছে!");
    } catch (err: any) {
      toast.error("সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setIsSavingLandingConfig(false);
    }
  };
  const handleLandingEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentCount = landingEditorConfig.extraImages?.length || 0;
    if (currentCount + files.length > 3) { toast.error("সর্বোচ্চ ৩টা ছবি যোগ করা যাবে!"); return; }
    for (const file of files) {
      try {
        const compressed = await import('browser-image-compression').then(m => (m.default as any)(file as any, { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true })) as File;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setLandingEditorConfig((prev: any) => ({ ...prev, extraImages: [...(prev.extraImages || []), dataUrl] }));
        };
        reader.readAsDataURL(compressed);
      } catch { toast.error("ছবি লোড করতে সমস্যা!"); }
    }
    e.target.value = "";
  };
  
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [activeProductDropdown, setActiveProductDropdown] = useState<string | null>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setActiveProductDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  const [incompleteOrders, setIncompleteOrders] = useState<any[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState("all");
  const [showOnlyPreOrders, setShowOnlyPreOrders] = useState(false);
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedBrand, selectedColor, activeCampaign, showOnlyPreOrders, isTrendingFilterActive, minPrice, maxPrice, sortBy]);
  // Persist cart
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Landing Page States
  const [landingName, setLandingName] = useState("");
  const [landingPhone, setLandingPhone] = useState("");
  const [landingAddress, setLandingAddress] = useState("");
  const [landingPackageIndex, setLandingPackageIndex] = useState(0);
  const [landingDistrict, setLandingDistrict] = useState("");
  const [landingThana, setLandingThana] = useState("");
  const [isLandingDistrictOpen, setIsLandingDistrictOpen] = useState(false);
  const [isLandingThanaOpen, setIsLandingThanaOpen] = useState(false);
  const [landingDistrictSearch, setLandingDistrictSearch] = useState("");
  const [landingThanaSearch, setLandingThanaSearch] = useState("");
  const [landingArea, setLandingArea] = useState("inside"); // inside / outside
  const [isLandingSubmitting, setIsLandingSubmitting] = useState(false);
  const [landingPhoneFocused, setLandingPhoneFocused] = useState(false);
  const landingProductId = urlParams.get("landing");
  const landingProduct = useMemo(() => {
    if (!landingProductId || products.length === 0) return null;
    return products.find(p => p.id === landingProductId && !p.deleted) || null;
  }, [landingProductId, products]);
  
  const liveSearchResults = useMemo(() => {
    if (!searchInput.trim() || products.length === 0) return [];
    const q = searchInput.trim().toLowerCase();
    return products
      .filter((p) => {
        if (p.deleted || p.isPublished === false) return false;
        const name = (p.name || "").toLowerCase();
        const code = (p.code || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const tags = (p.tags || "").toLowerCase();
        return name.includes(q) || code.includes(q) || category.includes(q) || brand.includes(q) || tags.includes(q);
      })
      .slice(0, 8);
  }, [searchInput, products]);
  
  // Reward Points State
  const [checkingRewardPoints, setCheckingRewardPoints] = useState(false);
  const calculateRewardPoints = async (phone: string) => {
    if (!phone || phone.trim().length < 11) {
      setAvailableRewardPoints(0);
      return;
    }
    setCheckingRewardPoints(true);
    try {
      const q = query(collection(db, "orders"), where("customerPhone", "==", phone.trim()), where("status", "==", "Delivered"));
      const snapshot = await getDocs(q);
      let totalSpent = 0;
      let totalPointsUsed = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalSpent += (data.total || 0);
        totalPointsUsed += (data.pointsUsed || 0);
      });
      
      // Calculate: 1 point per 100 Tk spent. 1 point = 1 Tk discount.
      // So 1000 Tk spent = 10 points.
      const pointsEarned = Math.floor(totalSpent / 100);
      const pointsAvailable = pointsEarned - totalPointsUsed;
      setAvailableRewardPoints(pointsAvailable > 0 ? pointsAvailable : 0);
    } catch (e) {
      console.error("Error fetching reward points", e);
    } finally {
      setCheckingRewardPoints(false);
    }
  };

  const lastTrackedViewRef = useRef<string | null>(null);
  const wasCheckoutOpenRef = useRef<boolean>(false);
  const lastInlineCheckoutProductRef = useRef<string | null>(null);

  useEffect(() => {
    void initTracking();
  }, []);

  useEffect(() => {
    const activeProd = isProductDetailsOpen && selectedProduct ? selectedProduct : landingProduct;
    if (!activeProd || !activeProd.id) {
      if (!isProductDetailsOpen && !landingProduct) {
        lastTrackedViewRef.current = null;
      }
      return;
    }
    const viewKey = `${landingProduct && !isProductDetailsOpen ? "landing" : "modal"}:${activeProd.id}`;
    if (lastTrackedViewRef.current === viewKey) return;
    lastTrackedViewRef.current = viewKey;
    trackViewContent({
      id: activeProd.id,
      name: activeProd.name,
      price: Number(activeProd.price || 0),
      category: activeProd.category,
      brand: activeProd.brand,
    });
  }, [isProductDetailsOpen, selectedProduct?.id, landingProduct?.id]);

  useEffect(() => {
    if (isCheckoutOpen && checkoutItems.length > 0 && !wasCheckoutOpenRef.current) {
      wasCheckoutOpenRef.current = true;
      const items = checkoutItems.map((i: any) => ({
        id: i.product.id,
        name: i.product.name,
        price: getProductPrice(i.product, i.quantity),
        quantity: i.quantity,
        category: i.product.category,
        brand: i.product.brand,
      }));
      const totalVal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      trackInitiateCheckout(items, totalVal);
    } else if (!isCheckoutOpen) {
      wasCheckoutOpenRef.current = false;
    }
  }, [isCheckoutOpen, checkoutItems]);

  useEffect(() => {
    if (!isProductDetailsOpen || !selectedProduct?.id) {
      lastInlineCheckoutProductRef.current = null;
      return;
    }
    if (inlinePhoneFocused && lastInlineCheckoutProductRef.current !== selectedProduct.id) {
      lastInlineCheckoutProductRef.current = selectedProduct.id;
      const qty = Math.max(1, Number(tempSelectedQty || 1));
      const unitPrice = getProductPrice(selectedProduct, qty);
      trackInitiateCheckout(
        [{
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: unitPrice,
          quantity: qty,
          category: selectedProduct.category,
          brand: selectedProduct.brand,
        }],
        unitPrice * qty
      );
    }
  }, [inlinePhoneFocused, isProductDetailsOpen, selectedProduct?.id]);

  const [savedProfiles, setSavedProfiles] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("ishopbd_saved_profiles");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      calculateRewardPoints(checkoutPhone);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [checkoutPhone]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      calculateRewardPoints(inlineOrderPhone);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [inlineOrderPhone]);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let sessionId = localStorage.getItem("ishopbd_session_id");
      if (!sessionId) {
        sessionId = "cart_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("ishopbd_session_id", sessionId);
      }
      if (cartItems.length > 0) {
        const totalAmt = cartItems.reduce((sum: number, item: any) => sum + (getProductPrice(item.product, item.quantity) * item.quantity), 0);
        
        // Auto-resolve best available phone number
        const resolvedPhone = (
          checkoutPhone?.trim() || 
          userProfile?.phone?.trim() || 
          user?.phoneNumber?.trim() || 
          (savedProfiles?.[0]?.phone ? savedProfiles[0].phone.trim() : "") || 
          ""
        ).trim();

        // Auto-resolve best available customer name
        const resolvedName = (
          checkoutName?.trim() || 
          userProfile?.displayName?.trim() || 
          userProfile?.name?.trim() || 
          user?.displayName?.trim() || 
          (savedProfiles?.[0]?.name ? savedProfiles[0].name.trim() : "") || 
          (user?.email ? user.email.split("@")[0] : "") || 
          ""
        ).trim();

        // Auto-resolve best available address
        const resolvedAddress = (
          checkoutAddress?.trim() || 
          userProfile?.address?.trim() || 
          (savedProfiles?.[0]?.address ? savedProfiles[0].address.trim() : "") || 
          ""
        ).trim();

        const resolvedDistrict = checkoutDistrict || userProfile?.district || savedProfiles?.[0]?.district || "";
        const resolvedThana = checkoutThana || userProfile?.thana || savedProfiles?.[0]?.thana || "";
        const hasPhone = resolvedPhone.length >= 6;

        setDoc(doc(db, "incomplete_orders", sessionId), {
          phone: hasPhone ? resolvedPhone : (resolvedPhone || "কার্টে পণ্য আছে (ফোন নম্বর দেয়নি)"),
          name: resolvedName || "অজ্ঞাত ক্রেতা",
          address: resolvedAddress,
          district: resolvedDistrict,
          thana: resolvedThana,
          items: cartItems.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: getProductPrice(item.product, item.quantity),
            quantity: item.quantity,
            color: item.color || null,
            size: item.size || null,
            image: item.product.image || item.product.images?.[0] || ""
          })),
          totalAmount: totalAmt,
          updatedAt: serverTimestamp(),
          date: new Date().toLocaleString("bn-BD"),
          type: "cart_checkout",
          sessionId: sessionId,
          smsSent: false
        }, { merge: true }).catch(console.error);
      } else {
        deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
      }
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [cartItems, checkoutPhone, checkoutName, checkoutAddress, checkoutDistrict, checkoutThana, userProfile, user, savedProfiles]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloadingReceipt(true);
      const { toPng } = await import('html-to-image');
      const node = receiptRef.current;
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        height: node.scrollHeight,
        width: node.scrollWidth,
        style: { transform: 'none' }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Receipt_${completedOrderReceipt?.orderId || "Order"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCompletedOrderReceipt(null);
    } catch (err: any) {
      console.error("Error downloading receipt:", err);
      toast.error("ডাউনলোড ফেইল হয়েছে: " + err.message);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };
  const [isMultiOrderSelectionOpen, setIsMultiOrderSelectionOpen] =
    useState(false);
  const sortBannersByOrder = (list: any[]) =>
    [...list].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));

  const [activeBanners, setActiveBanners] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_BANNERS__) && (window as any).__INITIAL_BANNERS__.length > 0) {
        return sortBannersByOrder((window as any).__INITIAL_BANNERS__);
      }
      const cached = localStorage.getItem(STORAGE_KEYS.BANNERS);
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) && parsed.length > 0 ? sortBannersByOrder(parsed) : [];
    } catch {
      return [];
    }
  });
  const [isBannersResolved, setIsBannersResolved] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_BANNERS__) && (window as any).__INITIAL_BANNERS__.length > 0) {
        return true;
      }
      const cached = localStorage.getItem(STORAGE_KEYS.BANNERS);
      const parsed = cached ? JSON.parse(cached) : [];
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  });
  const heroBanners = useMemo(() => {
    return sortBannersByOrder(activeBanners.filter(b => (b.type || 'hero') === 'hero'));
  }, [activeBanners]);
  const secondaryBanners = useMemo(() => sortBannersByOrder(activeBanners.filter(b => b.type === 'secondary')), [activeBanners]);
  const productsByCategory = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const p of products) {
      if (p.category && !p.deleted && p.isPublished !== false) {
        if (!map[p.category]) map[p.category] = [];
        map[p.category].push(p);
      }
    }
    return map;
  }, [products]);
  const [adminList, setAdminList] = useState<AdminUser[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ADMINS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierSelection, setCourierSelection] = useState({
    order: null as any,
    service: "Steadfast",
    trackingId: "",
    codAmount: 0,
  });
  const [siteConfig, setSiteConfig] = useState<{
    couponCode: string;
    isCouponPublic: boolean;
    whatsappNumber: string;
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    bankDetails: string;
    aboutUs: string;
    privacyPolicy: string;
    refundPolicy: string;
    termsAndConditions: string;
    supportPhone1: string;
    supportPhone2: string;
    facebookUrl: string;
    isCodEnabled?: boolean;
    isBkashEnabled?: boolean;
    isNagadEnabled?: boolean;
    isRocketEnabled?: boolean;
    isBankEnabled?: boolean;
    checkoutWarningText?: string;
    smsTemplateStart?: string;
    smsTemplateEnd?: string;
    isSmsConfirmEnabled?: boolean;
    isReminderSmsEnabled?: boolean;
    isAiEnabled?: boolean;
    promoPopupEnabled?: boolean;
    promoPopupImage?: string;
    promoPopupLink?: string;
    productsUpdatedAt?: string;
  } | null>(null);
  // Sync Site Config
  useEffect(() => {
    if (isQuotaExceeded) return;
    const unsub = onSnapshot(doc(db, "config", "siteConfig"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSiteConfig({
          couponCode: data.couponCode || "ISHOPBD5",
          isCouponPublic: data.isCouponPublic || false,
          whatsappNumber: data.whatsappNumber || "8801777600844",
          bkashNumber: data.bkashNumber || "01777600844",
          nagadNumber: data.nagadNumber || "01777600844",
          rocketNumber: data.rocketNumber || "01777600844-0",
          bankDetails: data.bankDetails || "Bank: DBBL, A/C: 123456789",
          aboutUs: data.aboutUs || "i SHOP BD (আই শপ বিডি) - আপনার বিশ্বস্ত অনলাইন প্ল্যাটফর্ম।",
          privacyPolicy: data.privacyPolicy || "আপনার ব্যক্তিগত গোপনীয়তাকে আমরা সম্মান করি। আমাদের ওয়েবসাইটে দেওয়া আপনার সকল তথ্য (যেমন: নাম, ফোন নাম্বার, ঠিকানা) সম্পূর্ণ নিরাপদ।",
          refundPolicy: data.refundPolicy || "পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে ২৪ ঘন্টার মধ্যে জানান...",
          termsAndConditions: data.termsAndConditions || "আমাদের ওয়েবসাইট ব্যবহার করার জন্য আপনাকে ধন্যবাদ। অর্ডার করার মাধ্যমে আমরা আমাদের ডেলিভারি ও পেমেন্ট শর্তাবলীর সাথে একমত পোষণ করেছেন",
checkoutWarningText: data.checkoutWarningText !== undefined ? data.checkoutWarningText : "প্রিয় গ্রাহক, ক্যাশ অন ডেলিভারিতে অর্ডার করার আগে দয়া করে নিশ্চিত হোন যে প্রোডাক্টটি আপনার প্রয়োজন এবং আপনি তা রিসিভ করবেন। অনাকাঙ্ক্ষিত রিটার্ন এড়াতে আপনার সহযোগিতা আমাদের একান্ত কাম্য।",
          supportPhone1: data.supportPhone1 || "01777-600844",
          supportPhone2: data.supportPhone2 || "01977-600844",
          isAiEnabled: data.isAiEnabled !== undefined ? data.isAiEnabled : false,
          facebookUrl: data.facebookUrl || "https://facebook.com/ishopbd",
          isCodEnabled: data.isCodEnabled !== undefined ? data.isCodEnabled : true,
          isBkashEnabled: data.isBkashEnabled !== undefined ? data.isBkashEnabled : true,
          isNagadEnabled: data.isNagadEnabled !== undefined ? data.isNagadEnabled : true,
          isRocketEnabled: data.isRocketEnabled !== undefined ? data.isRocketEnabled : true,
          isBankEnabled: data.isBankEnabled !== undefined ? data.isBankEnabled : true,
          smsTemplateStart: data.smsTemplateStart || "",
          smsTemplateEnd: data.smsTemplateEnd || "",
          isSmsConfirmEnabled: data.isSmsConfirmEnabled !== undefined ? data.isSmsConfirmEnabled : true,
          isReminderSmsEnabled: data.isReminderSmsEnabled !== undefined ? data.isReminderSmsEnabled : true,
          computerAppUrl: data.computerAppUrl || "",
          androidAppUrl: data.androidAppUrl || "",
          iphoneAppUrl: data.iphoneAppUrl || "",
          promoPopupEnabled: data.promoPopupEnabled || false,
          promoPopupImage: data.promoPopupImage || "",
          promoPopupLink: data.promoPopupLink || "",
          productsUpdatedAt: data.productsUpdatedAt || "",
        });
      } else {
        const defaultConfig = {
          couponCode: "ISHOPBD5",
          isCouponPublic: false,
          whatsappNumber: "8801777600844",
          bkashNumber: "01777600844",
          nagadNumber: "01777600844",
          rocketNumber: "01777600844-0",
          bankDetails: "Bank: DBBL, A/C: 123456789",
          isCodEnabled: true,
          isBkashEnabled: true,
          isNagadEnabled: true,
          isRocketEnabled: true,
          isBankEnabled: true,
          aboutUs: "i SHOP BD (আই শপ বিডি) - আপনার বিশ্বস্ত অনলাইন প্ল্যাটফর্ম। আমরা সুলভ মূল্যে সর্বোচ্চ মানের ইলেকট্রনিক গ্যাজেট, স্মার্ট এক্সেসরিজ এবং হোম অ্যাপ্লায়েন্স নিশ্চিত করি।",
          privacyPolicy: "আপনার ব্যক্তিগত গোপনীয়তাকে আমরা সম্মান করুন আমাদের ওয়েবসাইটে দেওয়া আপনার সকল তথ্য (যেমন: নাম, ফোন নাম্বার, ঠিকানা) সম্পূর্ণ নিরাপদ।",
          refundPolicy: "পণ্য হাতে পাওয়া পর কোনো সমস্যা থাকলে ২৪ ঘন্টার মধ্যে আমাদের সাথে যোগাযোগ করুন। সঠিক প্রমাণ সাপেক্ষে আমরা দ্রুত রিফান্ড বা এক্সচেঞ্জ করে থাকি",
          termsAndConditions: "আমাদের ওয়েবসাইট ব্যবহার করুন জন্য আপনাকে ধন্যবাদ। অর্ডার করুন মাধ্যমে আমরা আমাদের ডেলিভারি ও পেমেন্ট শর্তাবলীর সাথে একমত পোষণ করেছেন",
checkoutWarningText: "প্রিয় গ্রাহক, ক্যাশ অন ডেলিভারিতে অর্ডার করার আগে দয়া করে নিশ্চিত হোন যে প্রোডাক্টটি আপনার প্রয়োজন এবং আপনি তা রিসিভ করবেন। অনাকাঙ্ক্ষিত রিটার্ন এড়াতে আপনার সহযোগিতা আমাদের একান্ত কাম্য।",
          supportPhone1: "01777-600844",
          supportPhone2: "01977-600844",
          facebookUrl: "https://facebook.com/ishopbd",
          isAiEnabled: false,
          smsTemplateStart: "",
          smsTemplateEnd: "",
          isSmsConfirmEnabled: true,
          isReminderSmsEnabled: true,
          computerAppUrl: "",
          androidAppUrl: "",
          iphoneAppUrl: "",
          promoPopupEnabled: false,
          promoPopupImage: "",
          promoPopupLink: "",
          productsUpdatedAt: "",
        } as any;
        setSiteConfig(defaultConfig);
      }
    }, (err) => {
       handleFirestoreError(err, OperationType.GET, "config/siteConfig");
       // Silently handle permission denied for config if it's not crucial, or log it
       console.warn("Config sync error:", err);
    });
    return () => unsub();
  }, [isQuotaExceeded]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [showPromoPopup, setShowPromoPopup] = useState(false);




  useEffect(() => {
    if (siteConfig?.promoPopupEnabled && siteConfig?.promoPopupImage) {
      const hasShown = sessionStorage.getItem('promo_popup_shown');
      if (!hasShown) {
        const timer = setTimeout(() => {
          setShowPromoPopup(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [siteConfig]);

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("PWA install choice outcome:", outcome);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const dismissed = sessionStorage.getItem("push_prompt_dismissed");
        if (!dismissed) {
          const timer = setTimeout(() => setShowPushPrompt(true), 2500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [user]);

  const handleEnablePushNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setShowPushPrompt(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if (user?.uid) {
          await requestPushPermission(user.uid);
        }
        toast.success("🔔 নোটিফিকেশন সফলভাবে চালু হয়েছে!");
      } else {
        toast("নোটিফিকেশন অনুমতি দেওয়া হয়নি।");
      }
    } catch (err) {
      console.warn("Push error:", err);
    }
  };

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<"full" | "support_only">("full");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const [blacklist, setBlacklist] = useState<string[]>(() => {
    const saved = localStorage.getItem("ishopbd_blacklist");
    return saved ? JSON.parse(saved) : [];
  });
  const [courierReports, setCourierReports] = useState<Record<string, CourierFraudReport>>({});
  const courierReportsRef = useRef<Record<string, CourierFraudReport>>({});
  useEffect(() => {
    courierReportsRef.current = courierReports;
  }, [courierReports]);
  const autoCheckedCourierPhonesRef = useRef<Set<string>>(new Set());
  const autoCheckPausedUntilRef = useRef<number>(0);
  const [loadingCourierReports, setLoadingCourierReports] = useState<Record<string, boolean>>({});
  const [isCourierHistoryModalOpen, setIsCourierHistoryModalOpen] = useState(false);
  const [courierModalPhone, setCourierModalPhone] = useState("");
  const checkCourierReport = async (phone: string, forceRefresh = false) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const normalizedPhone = normalizeBdPhone(phone) || cleanPhone;
    if (!normalizedPhone) return;
    autoCheckedCourierPhonesRef.current.add(normalizedPhone);
    setLoadingCourierReports(prev => ({
      ...prev,
      [phone]: true,
      ...(cleanPhone ? { [cleanPhone]: true } : {}),
      [normalizedPhone]: true,
    }));
    try {
      const headers = await getAdminAuthHeaders(false);
      const refreshSuffix = forceRefresh ? "?refresh=1" : "";
      const response = await axios.get(`/api/courier/steadfast/fraud/${encodeURIComponent(normalizedPhone)}${refreshSuffix}`, { headers });
      const parsedData = parseClientCourierFraudReport(response.data);
      if (parsedData) {
        setCourierReports(prev => ({
          ...prev,
          [phone]: parsedData,
          ...(cleanPhone ? { [cleanPhone]: parsedData } : {}),
          [normalizedPhone]: parsedData,
        }));
      } else {
        const errorMsg = response.data?.error || response.data?.message || "কুরিয়ার ডাটা পাওয়া যায়নি";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Error checking courier report:", err);
      const errMsg =
        err.response?.status === 429
          ? "Steadfast-এর সার্চ লিমিট (সর্বোচ্চ ১০টি) সাময়িকভাবে পূর্ণ হয়েছে; কিছুক্ষণ পর আবার চেষ্টা করুন"
          : err.response?.data?.error || err.response?.data?.message || "কুরিয়ার ডাটা ফেচ করতে সমস্যা হয়েছে";
      toast.error(errMsg);
    } finally {
      setLoadingCourierReports(prev => ({
        ...prev,
        [phone]: false,
        ...(cleanPhone ? { [cleanPhone]: false } : {}),
        [normalizedPhone]: false,
      }));
    }
  };
  type LangCode = "en" | "bn";
  const [language, setLanguage] = useState<LangCode>("en");
  const languageList: { code: LangCode; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "bn", label: "Bengali", native: "বাংলা" },
  ];
  const t = (bnText: string, enText: string, arText?: string, urText?: string) => {
    return enText || bnText;
  };
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("অবস্থান খুঁজে পাওয়া যায়নি। দয়া করে লোকেশন পারমিশন দিন।");
      return;
    }
    setIsDetectingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Dhaka boundaries: Lat 23.65 - 23.95, Lon 90.30 - 90.55
        if (
          latitude >= 23.65 &&
          latitude <= 23.95 &&
          longitude >= 90.30 &&
          longitude <= 90.55
        ) {
          setDeliveryArea("inside");
        } else {
          setDeliveryArea("outside");
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to inside Dhaka as a default if fails, or outside? 
        // Let's default to inside and show error message
        setLocationError("অবস্থান খুঁজে পাওয়া যায়নি। দয়া করে লোকেশন পারমিশন দিন।");
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);
  // Category translation helper
  useEffect(() => {
    if (isCheckoutOpen) {
      detectLocation();
    }
  }, [isCheckoutOpen, detectLocation]);
  const tc = (name: string) => {
const maps: any = { "Charger Fan": { bn: "চার্জার ফ্যান", en: "Charger Fan", ar: "مروحة شحن", ur: "چارجر پنکھا" }, "Handheld Fan": { bn: "হ্যান্ডহোল্ড ফ্যান", en: "Handheld Fan", ar: "مروحة محمولة", ur: "ہینڈ ہیلڈ پنکھا" }, "Smart Watch": { bn: "স্মার্ট ওয়াচ", en: "Smart Watch", ar: "ساعة ذكية", ur: "سمارٹ واچ" }, "Headphone": { bn: "হেডফোন", en: "Headphone", ar: "سماعة رأس", ur: "ہیڈ فون" }, "Earbuds": { bn: "ইয়ারবাডস", en: "Earbuds", ar: "سماعات أذن", ur: "ایئربڈز" }, "Mobile Accessories": { bn: "মোবাইল এক্সেসরিজ", en: "Mobile Accessories", ar: "إكسسوارات الجوال", ur: "موبائل لوازمات" }, "Gadgets": { bn: "গ্যাজেটস", en: "Gadgets", ar: "أدوات ذكية", ur: "گیجٹس" } };
    const entry = maps[name];
    if (entry) {
      if (language === "bn") return entry.bn;
      if (language === "ar") return entry.ar;
      if (language === "ur") return entry.ur;
      return entry.en;
    }
    return name;
  };
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMobileCategoryDrawerOpen, setIsMobileCategoryDrawerOpen] = useState(false);
  // Optimized helper to get customer stats based on phone
  const customerStatsMap = useMemo(() => {
    const stats: Record<string, { delivered: number; cancelled: number; isBlacklisted: boolean; total: number }> = {};
    orderHistory.forEach((order) => {
      const phone = order.customerPhone;
      if (!phone) return;
      if (!stats[phone]) {
        stats[phone] = { 
          delivered: 0, 
          cancelled: 0, 
          isBlacklisted: blacklist.includes(phone),
          total: 0 
        };
      }
      stats[phone].total++;
      if (order.status === "delivered") stats[phone].delivered++;
      if (order.status === "cancelled") stats[phone].cancelled++;
    });
    return stats;
  }, [orderHistory, blacklist]);
  const getCustomerStats = (phone: string) => {
    return customerStatsMap[phone] || {
      delivered: 0,
      cancelled: 0,
      isBlacklisted: blacklist.includes(phone),
      total: 0,
    };
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredOrders.slice(0, adminOrdersLimit).map(o => o.id);
      setSelectedOrderIds(visibleIds);
    } else {
      setSelectedOrderIds([]);
    }
  };
  const handleSelectOrder = (e: any, id: string) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };
  const handleBulkPrintStickers = () => {
    if (selectedOrderIds.length === 0) return;
    const selectedOrders = filteredOrders.filter(o => selectedOrderIds.includes(o.id));
    const ordersToPrint = selectedOrders.length > 0 ? selectedOrders : orderHistory.filter(o => selectedOrderIds.includes(o.id));
    printBulkOrderStickers(ordersToPrint, siteConfig);
  };
  const handleBulkSendToSteadfast = async () => {
    if (selectedOrderIds.length === 0) return;
    
    if (!adminKeys?.steadfastApiKey || !adminKeys?.steadfastSecretKey) {
      toast.error("Steadfast API Key or Secret Key missing! Please configure them in Settings first.", { duration: 5000 });
      return;
    }
    toast.loading("Steadfast এ অর্ডার এন্ট্রি করা হচ্ছে...");
    
    try {
      const payloadOrders = selectedOrderIds.map(id => {
        const order = orderHistory.find(o => o.id === id);
        return {
          id: order?.id,
          invoice: order?.id,
          recipient_name: order?.customerName,
          recipient_phone: order?.customerPhone,
          recipient_address: order?.address,
          cod_amount: order?.codAmount !== undefined ? order.codAmount : order?.total,
          note: `Invoice: ${order?.id}`
        };
      }).filter(o => o.id);
      const headers = await getAdminAuthHeaders(true);
      const response = await fetch("/api/courier/steadfast/bulk", {
        method: "POST",
        headers,
        body: JSON.stringify({
          apiKey: adminKeys?.steadfastApiKey || "",
          secretKey: adminKeys?.steadfastSecretKey || "",
          orders: payloadOrders
        })
      });
      const data = await response.json();
      toast.dismiss();
      if (data.success && data.processedOrders) {
        let successCount = 0;
        let failCount = 0;
        for (const result of data.processedOrders) {
          if (result.success) {
            successCount++;
            await updateDoc(doc(db, "orders", result.id), {
              status: "shipped",
              courierTrackingId: result.trackingId,
              trackingId: result.trackingId,
              ...(result.consignmentId ? { courierConsignmentId: result.consignmentId } : {}),
              courierName: "Steadfast",
              courierStatus: "in_review",
              steadfastStatus: "in_review",
              courierStatusNormalized: "booked",
              courierStatusLabel: "In Review (Booked)",
              courierTrackingMessage: "Parcel booked with Steadfast courier",
              courierHistory: [{
                status: "in_review",
                label: "In Review (Booked)",
                category: "booked",
                message: "Parcel booked with Steadfast courier",
                source: "ADMIN_BOOKING",
                timestamp: new Date().toISOString(),
              }],
              couriers: {
                service: "Steadfast",
                trackingId: result.trackingId,
                ...(result.consignmentId ? { consignmentId: result.consignmentId } : {}),
              },
              updatedAt: serverTimestamp(),
            });
            const originalOrder = orderHistory.find(o => o.id === result.id);
            if (originalOrder && originalOrder.userId) {
              sendPushToUser(originalOrder.userId, "অর্ডার আপডেট", "আপনার অর্ডারটি কুরিয়ারে পাঠানো হয়েছে (Steadfast)", "/profile");
            }
          } else {
            failCount++;
            console.error(`Steadfast failed for ${result.id}:`, result.error);
          }
        }
        if (successCount > 0) {
          toast.success(`${successCount} টা অর্ডার সফলভাবে Steadfast এ পাঠানো হয়েছে!`);
          setSelectedOrderIds([]); 
        }
        if (failCount > 0) {
          toast.error(`${failCount} টা অর্ডার Steadfast এ পাঠাতে ব্যর্থ হয়েছে!`);
        }
      } else {
        toast.error(data.error || "Steadfast এ পাঠাতে ব্যর্থ হয়েছে!");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error("সার্ভার এরর: " + (error?.message || error || "Steadfast এ পাঠানো যায়নি!"));
      console.error(error);
    }
  };
  const handleVerifyAdminPassword = async () => {
    if (!user) {
      toast.error("দয়া করে আগে লগ ইন করুন।");
      return;
    }
    const inputPass = adminPasswordInput.trim();
    if (!inputPass) {
      toast.error("পাসওয়ার্ড লিখুন।");
      return;
    }
    const userEmail = (user.email || "").toLowerCase().trim();
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    
    // Master check
    const masterEmailsLower = masterEmails.map(e => e.toLowerCase().trim());
    const isMaster = masterEmailsLower.includes(userEmail) || masterEmailsLower.includes(cleanEmail) || isMasterAdmin;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // Priority 1: Master Admin - verify via server-side API (password never in client)
    if (isMaster || isLocalhost) {
      try {
        const res = await fetch("/api/verify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: inputPass, isMasterEmail: true }),
        });
        const result = await res.json();
        if (result.success) {
          localStorage.setItem(`admin_verified_${user.uid}`, "true");
          sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
          sessionStorage.setItem("ishopbd_admin_token", inputPass);
          localStorage.setItem("ishopbd_admin_token", inputPass);
          setIsAdminVerified(true);
          setIs2FAPending(false);
          setAdminPasswordError(false);
          setAdminPasswordInput("");
          toast.success("Master access verified successfully.");
          return;
        } else {
          setAdminPasswordError(true);
          toast.error("Master password is incorrect. Please enter the correct password.");
          return;
        }
      } catch {
        setAdminPasswordError(true);
        toast.error("Could not verify with server. Please try again.");
        return;
      }
    }
    // Priority 2: Direct match in admin list
    const found = findMatchingAdminRecord(adminList, user);
    if (found && found.password && found.password.trim() === inputPass) {
      // Check for 2FA if enabled
      if (found.require2FA && found.phone) {
        setIs2FAPending(true);
        setAdminPasswordError(false);
        toast("Sending verification code to your phone...");
        handleSendAdminOTP(); // Trigger OTP automatically if possible
        return;
      }
      localStorage.setItem(`admin_verified_${user.uid}`, "true");
      sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
      setIsAdminVerified(true);
      setAdminPasswordError(false);
      setAdminPasswordInput("");
      toast.success("Verification successful.");
    } else {
      setAdminPasswordError(true);
      toast.error("Incorrect password! Try again.");
    }
  };
  const toggleBlacklist = (phone: string) => {
    setBlacklist((prev) => {
      const isBlacklisted = prev.includes(phone);
      let next;
      if (isBlacklisted) {
        next = prev.filter((p) => p !== phone);
      } else {
        next = [...prev, phone];
      }
      localStorage.setItem("ishopbd_blacklist", JSON.stringify(next));
      return next;
    });
  };
  const [tempSelectedColor, setTempSelectedColor] = useState<string | null>(
    null,
  );
  const [tempSelectedSize, setTempSelectedSize] = useState<string | null>(null);
  const [colorValError, setColorValError] = useState(false);
  const [sizeValError, setSizeValError] = useState(false);
  useEffect(() => {
    if (userProfile) {
      if (userProfile.phone && !checkoutPhone) setCheckoutPhone(userProfile.phone);
      if ((userProfile.displayName || userProfile.name) && !checkoutName) setCheckoutName(userProfile.displayName || userProfile.name);
      if (userProfile.address && !checkoutAddress) setCheckoutAddress(userProfile.address);
      if (userProfile.district && !checkoutDistrict) setCheckoutDistrict(userProfile.district);
      if (userProfile.thana && !checkoutThana) setCheckoutThana(userProfile.thana);
      if (userProfile.phone && !inlineOrderPhone) setInlineOrderPhone(userProfile.phone);
      if ((userProfile.displayName || userProfile.name) && !inlineOrderName) setInlineOrderName(userProfile.displayName || userProfile.name);
      if (userProfile.address && !inlineOrderAddress) setInlineOrderAddress(userProfile.address);
    } else if (savedProfiles && savedProfiles.length > 0) {
      const p = savedProfiles[0];
      if (p.phone && !checkoutPhone) setCheckoutPhone(p.phone);
      if (p.name && !checkoutName) setCheckoutName(p.name);
      if (p.address && !checkoutAddress) setCheckoutAddress(p.address);
      if (p.district && !checkoutDistrict) setCheckoutDistrict(p.district);
      if (p.thana && !checkoutThana) setCheckoutThana(p.thana);
      if (p.phone && !inlineOrderPhone) setInlineOrderPhone(p.phone);
      if (p.name && !inlineOrderName) setInlineOrderName(p.name);
      if (p.address && !inlineOrderAddress) setInlineOrderAddress(p.address);
    }
  }, [userProfile, savedProfiles]);

  const [tempSelectedQty, setTempSelectedQty] = useState(1);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedProduct) {
        let inlineSessionId = localStorage.getItem("ishopbd_inline_session_id");
        if (!inlineSessionId) {
          inlineSessionId = "inline_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
          localStorage.setItem("ishopbd_inline_session_id", inlineSessionId);
        }

        const resolvedPhone = (
          inlineOrderPhone?.trim() || 
          userProfile?.phone?.trim() || 
          user?.phoneNumber?.trim() || 
          (savedProfiles?.[0]?.phone ? savedProfiles[0].phone.trim() : "") || 
          ""
        ).trim();

        const resolvedName = (
          inlineOrderName?.trim() || 
          userProfile?.displayName?.trim() || 
          userProfile?.name?.trim() || 
          user?.displayName?.trim() || 
          (savedProfiles?.[0]?.name ? savedProfiles[0].name.trim() : "") || 
          ""
        ).trim();

        const resolvedAddress = (
          inlineOrderAddress?.trim() || 
          userProfile?.address?.trim() || 
          (savedProfiles?.[0]?.address ? savedProfiles[0].address.trim() : "") || 
          ""
        ).trim();

        const resolvedDistrict = inlineOrderDistrict || userProfile?.district || savedProfiles?.[0]?.district || "";
        const resolvedThana = inlineOrderThana || userProfile?.thana || savedProfiles?.[0]?.thana || "";

        if (resolvedPhone.length >= 4) {
          const itemPrice = getProductPrice(selectedProduct, tempSelectedQty);
          setDoc(doc(db, "incomplete_orders", inlineSessionId), {
            phone: resolvedPhone,
            name: resolvedName || "অজ্ঞাত ক্রেতা",
            address: resolvedAddress,
            district: resolvedDistrict,
            thana: resolvedThana,
            items: [{
              id: selectedProduct.id,
              name: selectedProduct.name,
              price: itemPrice,
              quantity: tempSelectedQty,
              color: tempSelectedColor || null,
              size: tempSelectedSize || null,
              image: selectedProduct.image || selectedProduct.images?.[0] || ""
            }],
            totalAmount: itemPrice * tempSelectedQty,
            updatedAt: serverTimestamp(),
            date: new Date().toLocaleString("bn-BD"),
            type: "inline_checkout",
            sessionId: inlineSessionId,
            smsSent: false
          }, { merge: true }).catch(console.error);
        }
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [inlineOrderPhone, inlineOrderName, inlineOrderAddress, inlineOrderDistrict, inlineOrderThana, selectedProduct, tempSelectedQty, tempSelectedColor, tempSelectedSize, userProfile, user, savedProfiles]);

  // Landing Page Order Tracker
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (landingProduct && landingPhone && landingPhone.trim().length >= 4) {
        let landingSessionId = localStorage.getItem("ishopbd_landing_session_id");
        if (!landingSessionId) {
          landingSessionId = "landing_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
          localStorage.setItem("ishopbd_landing_session_id", landingSessionId);
        }
        setDoc(doc(db, "incomplete_orders", landingSessionId), {
          phone: landingPhone.trim(),
          name: landingName && landingName.trim().length > 0 ? landingName.trim() : "অজ্ঞাত ক্রেতা",
          address: landingAddress && landingAddress.trim().length > 0 ? landingAddress.trim() : "",
          district: landingDistrict || "",
          thana: landingThana || "",
          items: [{
            id: landingProduct.id,
            name: landingProduct.name,
            price: landingProduct.price || 0,
            quantity: 1,
            image: landingProduct.image || ""
          }],
          totalAmount: landingProduct.price || 0,
          updatedAt: serverTimestamp(),
          date: new Date().toLocaleString("bn-BD"),
          type: "landing_checkout",
          sessionId: landingSessionId,
          smsSent: false
        }, { merge: true }).catch(console.error);
      }
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [landingPhone, landingName, landingAddress, landingDistrict, landingThana, landingProduct]);
  const [wholesaleSizeQty, setWholesaleSizeQty] = useState<Record<string, number>>({});
  const [isDeliveryInfoOpen, setIsDeliveryInfoOpen] = useState(false);
  const [modalDisplayImage, setModalDisplayImage] = useState<string | null>(
    null,
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [userInteractedWithGallery, setUserInteractedWithGallery] =
    useState(false);
  const [reviewForm, setReviewForm] = useState<{
    rating: number;
    comment: string;
    images: string[];
    guestName?: string;
  }>({ rating: 5, comment: "", images: [], guestName: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [isAdminReviewsLoading, setIsAdminReviewsLoading] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);
  useEffect(() => {
    if (!isProductDetailsOpen) {
      setWholesaleSizeQty({});
    }
  }, [isProductDetailsOpen]);
  const trendingProducts = useMemo(() => {
    const explicitlyTrending = products.filter((p) => p.isTrending && !p.deleted && p.isPublished !== false);
    if (explicitlyTrending.length > 0) {
      return explicitlyTrending.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    // Fallback to latest products if no trending flag is set
    return [...products]
      .filter(p => !p.deleted && p.isPublished !== false)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [products]);
  useEffect(() => {
    if (trendingProducts.length <= 4) return;
    
    const timer = setInterval(() => {
      setTrendingIndices((prev) => {
        const next = [...prev];
        const slotToUpdate = Math.floor(Math.random() * 4); // Random slot or sequential? User said sequential but maybe random feels better.
        // Let's use sequential as requested: "একটার পর একটা"
        
        setActiveTrendingSlot(currentSlot => {
          const nextSlot = (currentSlot + 1) % 4;
          
          // Logic to find a next index not currently in 'prev'
          let nextVal = (Math.max(...prev) + 1) % trendingProducts.length;
          while (prev.includes(nextVal) && trendingProducts.length > 4) {
            nextVal = (nextVal + 1) % trendingProducts.length;
          }
          
          next[currentSlot] = nextVal;
          return nextSlot;
        });
        
        return next;
      });
    }, 4000); // Change one product every 4 seconds
    return () => clearInterval(timer);
  }, [trendingProducts.length]);
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      // Exclude soft-deleted orders from active lists
      if (order.deleted) return false;
      // Separate pre-orders and regular orders
      const isPreOrder = (order.isPreOrder || order.items?.some((i: any) => i.product?.isComingSoon)) && order.status === "pending";
      if (showOnlyPreOrders) {
        if (!isPreOrder) return false;
      } else {
        if (isPreOrder) return false;
      }
      // Status Filtering
      if (selectedOrderStatusFilter !== "all") {
        if (order.status !== selectedOrderStatusFilter) return false;
      }
      // Area Filtering
      if (adminOrderAreaFilter !== "all") {
        if (adminOrderAreaFilter === "inside" && order.deliveryArea !== "inside") return false;
        if (adminOrderAreaFilter === "outside" && order.deliveryArea !== "outside") return false;
      }
      // Date Filtering
      if (adminStartDate || adminEndDate) {
        let orderTime = 0;
        if (order.createdAt) {
          orderTime = typeof order.createdAt === 'string' 
            ? new Date(order.createdAt).getTime() 
            : (order.createdAt.seconds ? order.createdAt.seconds * 1000 : (order.createdAt.toMillis?.() || 0));
        } else if (order.date) {
           // fallback if only string date is available (e.g. 15-10-2023)
           const parts = order.date.split(/[-/]/);
           if (parts.length >= 3) {
             // Assuming DD-MM-YYYY or MM-DD-YYYY
             // Let's just try to parse it
             orderTime = new Date(order.date).getTime();
           }
        }
        
        if (orderTime && !isNaN(orderTime)) {
          if (adminStartDate) {
            const start = new Date(adminStartDate);
            start.setHours(0, 0, 0, 0);
            if (orderTime < start.getTime()) return false;
          }
          if (adminEndDate) {
            const end = new Date(adminEndDate);
            end.setHours(23, 59, 59, 999);
            if (orderTime > end.getTime()) return false;
          }
        }
      }
      if (!orderSearchQuery) return true;
      const normalizedQuery = orderSearchQuery
        .replace(/[০-৯]/g, (d: string) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString())
        .toLowerCase()
        .replace(/^[#\s]+/, "")
        .trim();

      if (!normalizedQuery) return true;

      const phone = String(order.customerPhone || "").toLowerCase();
      const id = String(order.id || "").toLowerCase();
      const orderId = String(order.orderId || "").toLowerCase();
      const shortId = String(order.shortId || "").toLowerCase();
      const name = String(order.customerName || "").toLowerCase();

      return (
        phone.includes(normalizedQuery) ||
        id.includes(normalizedQuery) ||
        orderId.includes(normalizedQuery) ||
        shortId.includes(normalizedQuery) ||
        name.includes(normalizedQuery) ||
        String(order.courierTrackingId || order.trackingId || order.couriers?.trackingId || "").toLowerCase().includes(normalizedQuery) ||
        String(order.courierConsignmentId || order.couriers?.consignmentId || "").toLowerCase().includes(normalizedQuery) ||
        String(order.courierName || order.couriers?.service || "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [orderHistory, orderSearchQuery, showOnlyPreOrders, adminStartDate, adminEndDate, selectedOrderStatusFilter]);
  const deletedOrders = useMemo(() => {
    return orderHistory.filter((order) => order.deleted === true);
  }, [orderHistory]);

  const masterEmails = useMemo(() => [
    "islamicsoktitv@gmail.com", 
    "bonieaminrony@gmail.com",
    "ishopbd.online@gmail.com",
    "ifilmbd2025@gmail.com",
    "ifilmbd2025@gmail.com".toLowerCase().trim() // redundant but safe
  ], []);
  const [isAdminDocLoading, setIsAdminDocLoading] = useState(true);
  const [myAdminDoc, setMyAdminDoc] = useState<AdminUser | null>(null);
  // Fetch user's own admin document for role check
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      setMyAdminDoc(null);
      setIsAdminDocLoading(false);
      return;
    }
    let isMounted = true;
    const unsub = onSnapshot(doc(db, "admins", user.uid), (snap) => {
      if (!isMounted) return;
      if (snap.exists()) {
        setMyAdminDoc({ id: snap.id, ...snap.data() } as AdminUser);
      } else {
        setMyAdminDoc(null);
      }
      setIsAdminDocLoading(false);
    }, (err) => {
      if (!isMounted) return;
      if (err.code !== "permission-denied") {
        console.warn("My admin doc sync error:", err);
      }
      setIsAdminDocLoading(false);
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [user, isQuotaExceeded]);
  const resolvedAdminAccess = useMemo(
    () => resolveAdminAccess({ user, myAdminDoc, adminList, masterEmails }),
    [user, myAdminDoc, adminList, masterEmails],
  );
  const isMasterAdmin = resolvedAdminAccess.isMasterAdmin;
  const handleSendAdminOTP = async () => {
    const userEmail = user?.email || "";
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    const found = adminList.find((a) => (a.email === userEmail) || (a.id === userEmail) || (a.email === cleanEmail) || (a.id === cleanEmail));
    
    if (!found || !found.phone) {
      setAdminOTPError("Your admin profile does not have a phone number. Please add one in the admin panel.");
      return;
    }
    setIsSendingOTP(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(code);
    try {
      const message = `নিরাপদ শপ বিডি এডমিন প্যানেল এ লগইন এর জন্য আপনার ভেরিফিকেশন কোডটি হলো: ${code}`;
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: found.phone,
          message: message
        })
      });
      const result = await response.json();
      if (result.success) {
        setAdminOTPSent(true);
        setAdminOTPError("Your admin profile does not have a phone number. Please add one in the admin panel.");
      } else {
        setAdminOTPError("Verification code is incorrect.");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setAdminOTPError("Your admin profile does not have a phone number. Please add one in the admin panel.");
    } finally {
      setIsSendingOTP(false);
    }
  };
  const isAdmin = resolvedAdminAccess.isAdmin;
  useEffect(() => {
    if (!user || !isAdmin) return;
    setAdminViewMode(resolvedAdminAccess.adminViewMode);
  }, [user, isAdmin, resolvedAdminAccess.adminViewMode]);

  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [adminOTPInput, setAdminOTPInput] = useState("");
  const [adminOTPSent, setAdminOTPSent] = useState(false);
  const [adminOTPError, setAdminOTPError] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminKeys, setAdminKeys] = useState<{
    steadfastApiKey?: string;
    steadfastSecretKey?: string;
    steadfastWebhookSecret?: string;
    geminiApiKey?: string;
    pathaoClientId?: string;
    pathaoClientSecret?: string;
    pathaoUsername?: string;
    pathaoPassword?: string;
  } | null>(null);
  useEffect(() => {
    if (!isAdminVerified) return;
    let isMounted = true;
    const fetchKeys = async () => {
      try {
        const keysDoc = await getDoc(doc(db, "admin_config", "keys"));
        if (keysDoc.exists() && isMounted) {
          setAdminKeys(keysDoc.data() as any);
          return;
        }
      } catch (err: any) {
        // Expected if signed in via password verification rather than Firebase Auth moderator
        if (err?.code === "permission-denied" || err?.message?.includes("Missing or insufficient permissions")) {
          try {
            const headers = await getAdminAuthHeaders(false);
            const res = await fetch("/api/admin/keys", { headers });
            if (res.ok) {
              const json = await res.json();
              if (json.success && json.keys && isMounted) {
                setAdminKeys(json.keys);
                return;
              }
            }
          } catch (apiErr) {
            console.warn("API admin keys fetch fallback error:", apiErr);
          }
        } else {
          console.error("Failed to fetch admin keys:", err);
        }
      }
    };
    fetchKeys();
    return () => {
      isMounted = false;
    };
  }, [isAdminVerified]);
  // Trigger AI Image Search
  const triggerImageSearch = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file && siteConfig?.isAiEnabled) {
        try {
          toast.loading("ছবি স্ক্যান করা হচ্ছে (AI)...");
          
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1];
              
              const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: "What product is this? Return 3-5 search keywords in English that best describe this item for an e-commerce search bar. Do not write full sentences.",
                  image: base64,
                  mimeType: file.type
                })
              });
              
              const data = await response.json();
              const keywords = data.reply || data.text || "";
              
              toast.dismiss();
              if (keywords.trim()) {
                setSearchInput(keywords.trim());
                toast.success("পণ্যটি সনাক্ত করা হয়েছে!");
              } else {
                toast.error("ছবি সনাক্ত করা যায়নি।");
              }
            } catch (err) {
              toast.dismiss();
              toast.error("সার্ভার এরর।");
            }
          };
        } catch (err) {
          toast.dismiss();
          toast.error("ছবি প্রসেস করতে সমস্যা হয়েছে।");
        }
      }
    };
    input.click();
  };

  // Run AI Natural Search via secure backend proxy
  useEffect(() => {
    if (!siteConfig?.isAiEnabled || !searchQuery.trim() || products.length === 0) {
      setAiSearchProductIds(null);
      return;
    }

    const runAiNaturalSearch = async () => {
      // Check if standard search yields 0 items
      const standardMatches = products.filter(p => {
        if (p.deleted || p.isPublished === false) return false;
        const name = p.name || "";
        const category = p.category || "";
        const code = p.code || "";
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      const isNatural = searchQuery.split(' ').length > 2 || 
                        /দাম|টাকা|কম|ভালো|লাল|কালো|সাদা|নীল|সাইজ|উপযুক্ত|বাচ্চা|মহিলা|পুরুষ/i.test(searchQuery);

      if (standardMatches.length === 0 || isNatural) {
        setIsAiSearching(true);
        try {
          const productList = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            brand: p.brand || "",
            description: p.description || ""
          }));

          const response = await fetch("/api/ai-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: searchQuery,
              products: productList
            })
          });
          const data = await response.json();
          if (data.success && Array.isArray(data.matchingIds)) {
            setAiSearchProductIds(data.matchingIds);
          } else {
            setAiSearchProductIds(null);
          }
        } catch (err) {
          console.warn("AI Natural Search Error:", err);
          setAiSearchProductIds(null);
        } finally {
          setIsAiSearching(false);
        }
      } else {
        setAiSearchProductIds(null);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      runAiNaturalSearch();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, products, siteConfig?.isAiEnabled]);

  // SEO: Dynamic URL, Meta Tags, Open Graph, Schema.org
  useEffect(() => {
    const SITE_NAME = "i SHOP BD";
    const SITE_URL = "https://ishopbd.com";
    const SITE_DESC = "বাংলাদেশের সেরা অনলাইন শপিং | গ্যাজেট, ইলেকট্রনিক্স, হোম এক্সেসরিজ সবচেয়ে কম দামে দ্রুত হোম ডেলিভারি।";
    const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        const parts = selector.match(/\[(\w+)="([^"]+)"\]/);
        if (parts) el.setAttribute(parts[1], parts[2]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el); }
      el.setAttribute('href', href);
    };

    const setJsonLd = (id: string, data: object | null) => {
      let script = document.getElementById(id);
      if (data === null) { if (script) script.remove(); return; }
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', id);
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    };

    const stripHtml = (html: string) => (html || '').replace(/<[^>]*>?/gm, '').trim();

    if (isCheckoutOpen) {
      // === CHECKOUT PAGE ===
      document.title = `Checkout | ${SITE_NAME}`;
      setMeta('meta[name="description"]', 'content', `Complete your order at ${SITE_NAME}. Fast delivery across Bangladesh.`);
      setMeta('meta[property="og:title"]', 'content', `Checkout | ${SITE_NAME}`);
      setMeta('meta[property="og:description"]', 'content', `Complete your order at ${SITE_NAME}.`);
      setMeta('meta[property="og:image"]', 'content', DEFAULT_OG_IMAGE);
      setLink('canonical', SITE_URL);
      setJsonLd('seo-json-ld', null);
      setJsonLd('seo-breadcrumb-ld', null);

    } else if (selectedProduct && isProductDetailsOpen) {
      // === PRODUCT DETAIL PAGE ===
      const productName = selectedProduct.name || '';
      const productDesc = stripHtml(selectedProduct.description || '');
      const productPrice = selectedProduct.price || 0;
      const productImage = selectedProduct.image || DEFAULT_OG_IMAGE;
      const productUrl = `${SITE_URL}${getProductPath(selectedProduct)}`;
      const inStock = (selectedProduct.stock || 0) > 0;

      // Title with Bangladesh keywords for Google ranking
      document.title = `${productName} Price in Bangladesh | ${SITE_NAME}`;

      // Meta description
      const autoDesc = productDesc
        ? `${productDesc.substring(0, 120)} | Price: ৳${productPrice} in Bangladesh. Buy online at ${SITE_NAME} with fast home delivery.`
        : `Buy ${productName} at best price in Bangladesh ৳${productPrice}. Fast home delivery. Shop now at ${SITE_NAME}.`;
      setMeta('meta[name="description"]', 'content', autoDesc.substring(0, 160));

      // Keywords
      setMeta('meta[name="keywords"]', 'content', 
        `${productName}, ${productName} price in Bangladesh, ${productName} price in BD, ${productName} buy online Bangladesh, ${productName} দাম বাংলাদেশ, i SHOP BD, ishopbd`
      );

      // Open Graph
      setMeta('meta[property="og:type"]', 'content', 'product');
      setMeta('meta[property="og:title"]', 'content', `${productName} Price in Bangladesh | ${SITE_NAME}`);
      setMeta('meta[property="og:description"]', 'content', autoDesc.substring(0, 200));
      setMeta('meta[property="og:image"]', 'content', productImage);
      setMeta('meta[property="og:url"]', 'content', productUrl);
      setMeta('meta[property="product:price:amount"]', 'content', String(productPrice));
      setMeta('meta[property="product:price:currency"]', 'content', 'BDT');

      // Twitter Card
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', `${productName} Price in Bangladesh | ${SITE_NAME}`);
      setMeta('meta[name="twitter:description"]', 'content', autoDesc.substring(0, 200));
      setMeta('meta[name="twitter:image"]', 'content', productImage);

      // Canonical
      setLink('canonical', productUrl);

      // Schema.org Product JSON-LD
      setJsonLd('seo-json-ld', buildProductStructuredData({
        id: selectedProduct.id,
        name: productName,
        description: productDesc || `${productName} available at best price in Bangladesh.`,
        image: [productImage, ...(selectedProduct.images || [])].filter(Boolean),
        url: productUrl,
        brand: selectedProduct.brand || SITE_NAME,
        mpn: selectedProduct.code || selectedProduct.id,
        price: Number(productPrice || 0),
        inStock,
        isFreeDelivery: Boolean(selectedProduct.isFreeDelivery),
        weight: Number(selectedProduct.weight || 0),
        createdAt: selectedProduct.createdAt,
        rating: Number(selectedProduct.rating || 0),
        reviewCount: Number(selectedProduct.reviewCount || 0),
      }));

      // BreadcrumbList Schema
      const prodCatSlug = selectedProduct.category ? getCategorySlug(selectedProduct.category) : '';
      setJsonLd('seo-breadcrumb-ld', {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          ...(selectedProduct.category ? [{ "@type": "ListItem", "position": 2, "name": selectedProduct.category, "item": `${SITE_URL}/category/${prodCatSlug}` }] : []),
          { "@type": "ListItem", "position": selectedProduct.category ? 3 : 2, "name": productName, "item": productUrl }
        ]
      });

    } else if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
      // === CATEGORY PAGE ===
      const catSlug = getCategorySlug(selectedCategory);
      const categoryUrl = `${SITE_URL}/category/${catSlug}`;

      document.title = `${selectedCategory} Price in Bangladesh | ${SITE_NAME}`;
      setMeta('meta[name="description"]', 'content', `Buy ${selectedCategory} products at best price in Bangladesh. Fast home delivery. Shop online at ${SITE_NAME}.`);
      setMeta('meta[name="keywords"]', 'content', `${selectedCategory}, ${selectedCategory} price in Bangladesh, ${selectedCategory} price in BD, buy ${selectedCategory} online Bangladesh, i SHOP BD`);
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[property="og:title"]', 'content', `${selectedCategory} Price in Bangladesh | ${SITE_NAME}`);
      setMeta('meta[property="og:description"]', 'content', `Shop the best ${selectedCategory} at lowest prices in Bangladesh.`);
      setMeta('meta[property="og:image"]', 'content', DEFAULT_OG_IMAGE);
      setMeta('meta[property="og:url"]', 'content', categoryUrl);
      setLink('canonical', categoryUrl);
      setJsonLd('seo-json-ld', null);
      setJsonLd('seo-breadcrumb-ld', {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": selectedCategory, "item": categoryUrl }
        ]
      });

    } else {
      // === HOMEPAGE ===
      document.title = `${SITE_NAME} | Best Online Shopping in Bangladesh`;
      setMeta('meta[name="description"]', 'content', SITE_DESC);
      setMeta('meta[name="keywords"]', 'content', 'i SHOP BD, আই শপ বিডি, ishopbd, online shopping Bangladesh, best price Bangladesh, gadgets Bangladesh, electronics BD, home delivery Bangladesh, rechargeable fan price BD, air cooler price Bangladesh');
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[property="og:title"]', 'content', `${SITE_NAME} | Best Online Shopping in Bangladesh`);
      setMeta('meta[property="og:description"]', 'content', SITE_DESC);
      setMeta('meta[property="og:image"]', 'content', DEFAULT_OG_IMAGE);
      setMeta('meta[property="og:url"]', 'content', SITE_URL);
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', `${SITE_NAME} | Best Online Shopping in Bangladesh`);
      setMeta('meta[name="twitter:description"]', 'content', SITE_DESC);
      setMeta('meta[name="twitter:image"]', 'content', DEFAULT_OG_IMAGE);
      setLink('canonical', SITE_URL);
      setJsonLd('seo-json-ld', null);
      setJsonLd('seo-breadcrumb-ld', null);
    }
  }, [selectedProduct, isProductDetailsOpen, isCheckoutOpen, selectedCategory]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isVerified = localStorage.getItem(`admin_verified_${currentUser.uid}`) === "true" ||
                           sessionStorage.getItem(`admin_verified_${currentUser.uid}`) === "true";
        if (isVerified) {
          setIsAdminVerified(true);
        }
        requestPushPermission(currentUser.uid);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  // Profile and Admin Sync logic
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      if (!user) {
        setUserProfile(null);
        setIsAdminVerified(false);
      }
      return;
    }
    let isMounted = true;
    let unsubProfile: (() => void) | undefined;
    const syncProfile = async () => {
      if (!user?.uid || !isMounted) return;
      try {
        // Admin check and sync
        const userEmail = (user.email || "").toLowerCase().trim();
        const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
        const isMaster = masterEmails.includes(userEmail) || masterEmails.includes(cleanEmail);
        
        // If not found by UID yet, try to find by email and sync
        if (!myAdminDoc && userEmail && isMounted) {
          try {
            const emailDocRef = doc(db, "admins", userEmail);
            const emailDocSnap = await getDoc(emailDocRef);
            if (emailDocSnap.exists()) {
              const adminData = emailDocSnap.data();
              const adminRef = doc(db, "admins", user.uid);
              await setDoc(adminRef, {
                ...adminData,
                syncedFrom: userEmail,
                syncedAt: serverTimestamp(),
              }, { merge: true });
              // The onSnapshot(doc(db, "admins", user.uid)) will update myAdminDoc automatically
            }
          } catch (err) {
            console.warn("Failed to check email-based admin doc:", err);
          }
        }
        // We already have myAdminDoc syncing in another useEffect
        // We just need to make sure a document exists for them if they are an admin
        if ((isMaster || myAdminDoc) && isMounted) {
          const sessionVerified = localStorage.getItem(`admin_verified_${user.uid}`) === "true" ||
                                  sessionStorage.getItem(`admin_verified_${user.uid}`) === "true";
          if (sessionVerified) setIsAdminVerified(true);
          if (isMasterAdmin && !myAdminDoc) {
            const adminRef = doc(db, "admins", user.uid);
            await setDoc(adminRef, {
              email: userEmail,
              role: "owner", // Give owner role to master
              syncedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(err => {
              if (isMounted) handleFirestoreError(err, OperationType.WRITE, `admins/${user.uid}`);
            });
          }
        }
        if (!isMounted) return;
        // Profile Sync
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef).catch(err => {
          if (isMounted) handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          return null;
        });
        if (!isMounted) return;
        if (userSnap && !userSnap.exists()) {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            balance: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile).catch(err => {
            if (isMounted) handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          });
          if (isMounted) setUserProfile(newProfile as any);
        } else if (userSnap?.exists() && !userSnap.data().photoURL && user.photoURL) {
          await updateDoc(userRef, { photoURL: user.photoURL, updatedAt: serverTimestamp() }).catch(() => {});
        }
        if (!isMounted) return;
        unsubProfile = onSnapshot(userRef, (snapshot) => {
          if (isMounted && snapshot.exists()) setUserProfile(snapshot.data());
        }, (err) => {
           if (!isMounted) return;
           if (err.code !== "permission-denied") {
             handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
             console.warn("Profile sync listener error:", err.message);
           }
        });
      } catch (err: any) {
        if (!isMounted) return;
        if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        console.error("Profile sync error:", err);
      }
    };
    syncProfile();
    return () => {
      isMounted = false;
      unsubProfile?.();
    };
  }, [user, masterEmails, isQuotaExceeded, myAdminDoc]);
  // Transactions listener
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      if (!user) setTransactions([]);
      return;
    }
    let isMounted = true;
    const unsubTx = onSnapshot(
      query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
      ),
      (snapshot) => {
        if (!isMounted) return;
        const txs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        setTransactions(
          txs.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      },
      (err) => {
         if (!isMounted) return;
         if (err.code !== "permission-denied") {
            handleFirestoreError(err, OperationType.GET, "transactions");
         }
      }
    );
    return () => {
      isMounted = false;
      unsubTx();
    };
  }, [user, isQuotaExceeded]);
  // Test Firestore Connection on Boot (Deferred for guest visitors to avoid blocking initial render)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error: any) {
        if (error.message?.includes("Quota exceeded") || error.message?.includes("quota") || error.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  // Real-time synchronization for campaigns
  useEffect(() => {
    if (isQuotaExceeded) return;
    
    if (!isAdmin && !isMasterAdmin) {
      const timer = setTimeout(() => {
        getDocs(collection(db, "campaigns")).then(snapshot => {
          const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Campaign);
          setCampaigns(data);
        }).catch(err => {
          handleFirestoreError(err, OperationType.GET, "campaigns");
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
    const unsubCampaigns = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Campaign);
      setCampaigns(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "campaigns");
      console.warn("Campaigns sync error:", err);
    });
    return () => unsubCampaigns();
  }, [isQuotaExceeded, isAdmin, isMasterAdmin]);
  const [isLoading, setIsLoading] = useState(() => {
    try {
      if (typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_PRODUCTS__) && (window as any).__INITIAL_PRODUCTS__.length > 0) {
        return false;
      }
      const cached = safeGetLocalStorage(STORAGE_KEYS.PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  });

  // Load Data from Firestore with quota-friendly synchronization
  useEffect(() => {
    if (isQuotaExceeded) return;
    
    // Always purge legacy cross-project cache keys
    purgeLegacyCaches();
    
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    let categorySlug = urlParams.get('category') || urlParams.get('cat');
    if (!categorySlug && path.startsWith('/category/')) {
      categorySlug = path.replace(/^\/category\//, '').split('/')[0];
    } else if (!categorySlug && path.startsWith('/c/')) {
      categorySlug = path.replace(/^\/c\//, '').split('/')[0];
    }

    const isAdminUser = (isMasterAdmin || isAdmin) && !!user;
    const targetProdId = getProductIdFromUrl();

    // 1. Initial Load Categories & Banners from LocalStorage for instant zero-latency paint
    const cachedCats = safeGetLocalStorage(STORAGE_KEYS.CATEGORIES);
    if (cachedCats) {
      try {
        const parsedCats = JSON.parse(cachedCats);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setCategories(parsedCats);
          if (categorySlug) {
            const matched = findCategoryBySlug(parsedCats, categorySlug);
            if (matched) setSelectedCategory(matched.name);
          }
        }
      } catch(e) {}
    }

    const initialWindowBanners = typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_BANNERS__)
      ? (window as any).__INITIAL_BANNERS__
      : null;
    const cachedBanners = safeGetLocalStorage(STORAGE_KEYS.BANNERS);

    if (initialWindowBanners && initialWindowBanners.length > 0) {
      const sortedInitial = sortBannersByOrder(initialWindowBanners);
      setActiveBanners(sortedInitial);
      setIsBannersResolved(true);
      safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(sortedInitial));
    } else if (cachedBanners) {
      try {
        const parsedBanners = JSON.parse(cachedBanners);
        if (Array.isArray(parsedBanners) && parsedBanners.length > 0) {
          setActiveBanners(sortBannersByOrder(parsedBanners));
          setIsBannersResolved(true);
        }
      } catch(e) {}
    }

    const fetchFreshBanners = () => {
      fetch("/api/banners", { cache: "no-store" })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(apiBanners => {
          if (Array.isArray(apiBanners)) {
            const sorted = sortBannersByOrder(apiBanners);
            setActiveBanners(sorted);
            setIsBannersResolved(true);
            safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(sorted));
          } else {
            throw new Error("Invalid banners response");
          }
        })
        .catch(() => {
          getDocs(collection(db, "banners")).then(snap => {
            const data = sortBannersByOrder(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
            setActiveBanners(data);
            setIsBannersResolved(true);
            safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(data));
          }).catch(err => {
            console.warn("Banners fetch error:", err);
            setIsBannersResolved(true);
          });
        });
    };

    const fetchFreshCats = () => {
      getDocs(collection(db, "categories")).then(snap => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category);
        setCategories(data);
        if (categorySlug) {
          const matched = findCategoryBySlug(data, categorySlug);
          if (matched) setSelectedCategory(matched.name);
        }
        safeSetLocalStorage(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
      }).catch(err => console.warn("Categories fetch error:", err));
    };

    // Always fetch latest banners immediately so stale caches never linger
    fetchFreshBanners();

    if (isAdminUser || !cachedCats) {
      fetchFreshCats();
    } else {
      setTimeout(fetchFreshCats, 2000);
    }

    // 2. Public Users: Instant Cache Load + Intelligent SWR Fetch
    if (!isAdminUser) {
      const cachedProducts = safeGetLocalStorage(STORAGE_KEYS.PRODUCTS);
      const lastFetch = safeGetLocalStorage(STORAGE_KEYS.PRODUCTS_LAST_FETCH);
      const now = Date.now();
      
      let hasValidCached = false;
      if (cachedProducts) {
        try {
          const parsed = JSON.parse(cachedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            hasValidCached = true;
            setProducts(parsed);
            if (targetProdId) {
               const prod = findProductBySlugOrId(parsed, targetProdId);
               if (prod && !prod.deleted && prod.isPublished !== false) {
                 setSelectedProduct(prod);
                 setModalDisplayImage(prod.image);
                 setIsProductDetailsOpen(true);
               }
            }
            setIsLoading(false);
          }
        } catch(e) {}
      } else if (typeof window !== 'undefined' && Array.isArray((window as any).__INITIAL_PRODUCTS__) && (window as any).__INITIAL_PRODUCTS__.length > 0) {
        const initialProds = (window as any).__INITIAL_PRODUCTS__;
        hasValidCached = true;
        setProducts(initialProds);
        saveProductsToCache(initialProds);
        if (targetProdId) {
          const prod = findProductBySlugOrId(initialProds, targetProdId);
          if (prod && !prod.deleted && prod.isPublished !== false) {
            setSelectedProduct(prod);
            setModalDisplayImage(prod.image);
            setIsProductDetailsOpen(true);
          }
        }
        setIsLoading(false);
      }

      // If no valid cache or older than 5 minutes, fetch fresh catalog
      if (!hasValidCached || !lastFetch || now - parseInt(lastFetch) > 300000) {
        fetch("/api/products")
          .then((res) => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.json();
          })
          .then((prodData) => {
            if (Array.isArray(prodData) && prodData.length > 0) {
              setProducts(prodData);
              saveProductsToCache(prodData, siteConfig?.productsUpdatedAt);
              if (targetProdId) {
                 const prod = findProductBySlugOrId(prodData, targetProdId);
                 if (prod && !prod.deleted && prod.isPublished !== false) {
                   setSelectedProduct(prod);
                   setModalDisplayImage(prod.image);
                   setIsProductDetailsOpen(true);
                 }
              }
              setIsLoading(false);
            } else {
              throw new Error("Empty products array from /api/products");
            }
          })
          .catch((err) => {
            console.warn("API products fetch failed, falling back to Firestore SDK:", err);
            getDocs(collection(db, "products")).then(snapshot => {
              const prodData = snapshot.docs
                .map((d) => ({ ...d.data(), id: d.id }) as Product)
                .filter((p) => !p.deleted);
              if (prodData.length > 0) {
                setProducts(prodData);
                saveProductsToCache(prodData, siteConfig?.productsUpdatedAt);
                if (targetProdId) {
                   const prod = findProductBySlugOrId(prodData, targetProdId);
                   if (prod && !prod.deleted && prod.isPublished !== false) {
                     setSelectedProduct(prod);
                     setModalDisplayImage(prod.image);
                     setIsProductDetailsOpen(true);
                   }
                }
              }
              setIsLoading(false);
            }).catch(fsErr => {
              if (!hasValidCached) {
                handleFirestoreError(fsErr, OperationType.GET, "products");
              }
              setIsLoading(false);
            });
          });
      }
      return;
    }

    // 3. Admin Users: Real-Time Snapshot Listeners
    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category);
      setCategories(data);
      safeSetLocalStorage(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
    }, (err) => console.warn("Categories sync error:", err));

    const unsubBanners = onSnapshot(collection(db, "banners"), (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setActiveBanners(data);
      safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(data));
    }, (err) => console.warn("Banners sync error:", err));

    const unsubExpenses = (isMasterAdmin && user) ? onSnapshot(collection(db, "expenses"), (snap) => {
      const exp = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Expense);
      setExpenses(exp);
    }, (err) => {
      if (err.code !== "permission-denied") {
        console.warn("Expenses sync error:", err);
      }
    }) : () => {};

    const unsubAdmins = ((isMasterAdmin || isAdmin) && user) ? onSnapshot(collection(db, "admins"), (snap) => {
      const admins = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as AdminUser);
      setAdminList(admins);
      safeSetLocalStorage(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
      
      if (user) {
        const snapshotAccess = resolveAdminAccess({
          user,
          myAdminDoc,
          adminList: admins,
          masterEmails,
        });
        const found = findMatchingAdminRecord(admins, user);

        if (found || snapshotAccess.isMasterAdmin || snapshotAccess.isAdmin) {
          setAdminViewMode(snapshotAccess.adminViewMode);

          const sessionVerified = localStorage.getItem(`admin_verified_${user.uid}`) === "true" ||
                                  sessionStorage.getItem(`admin_verified_${user.uid}`) === "true";
          if (sessionVerified) {
            setIsAdminVerified(true);
          } else if (found?.password) {
            // Handled by password verification modal
          } else {
            setIsAdminVerified(true);
          }
        } else {
          setIsAdminVerified(false);
        }
      }
    }, (err) => {
      if (err.code === "permission-denied") {
        console.warn("Admins list permission denied - this is expected for non-admins");
      } else {
        handleFirestoreError(err, OperationType.GET, "admins");
      }
    }) : () => {};

    // Products listener for Admins
    const unsubProducts = ((isMasterAdmin || isAdmin) && user) ? onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const prodData = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id }) as Product)
          .filter((p) => !p.deleted);
        if (prodData.length > 0) {
          setProducts(prodData);
          saveProductsToCache(prodData, siteConfig?.productsUpdatedAt);
        }
        if (targetProdId) {
           const prod = findProductBySlugOrId(prodData, targetProdId);
           if (prod && !prod.deleted) {
             setSelectedProduct(prod);
             setModalDisplayImage(prod.image);
             setIsProductDetailsOpen(true);
           }
        }
        setIsLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "products");
        setIsLoading(false);
      }
    ) : () => {};

    return () => {
      unsubCategories();
      unsubBanners();
      unsubExpenses();
      if (typeof unsubAdmins === 'function') unsubAdmins();
      if (typeof unsubProducts === 'function') unsubProducts();
    };
  }, [user, masterEmails, isQuotaExceeded, isMasterAdmin, isAdmin]);

  // Listen for product details close to clean up review listener
  useEffect(() => {
    if (!isProductDetailsOpen && reviewUnsub) {
      reviewUnsub();
      setReviewUnsub(null);
    }
  }, [isProductDetailsOpen]);

  // Reactive Synchronize products cache when database updates occur (Single-doc Version Pointer)
  useEffect(() => {
    if (!siteConfig || !siteConfig.productsUpdatedAt) return;
    const localUpdatedAt = safeGetLocalStorage(STORAGE_KEYS.PRODUCTS_UPDATED_AT);
    if (!localUpdatedAt || localUpdatedAt !== siteConfig.productsUpdatedAt || products.length === 0) {
      console.log("Products cache updated on server, synchronizing...", siteConfig.productsUpdatedAt);
      fetch("/api/products")
        .then((res) => {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.json();
        })
        .then((prodData) => {
          if (Array.isArray(prodData) && prodData.length > 0) {
            setProducts(prodData);
            saveProductsToCache(prodData, siteConfig.productsUpdatedAt);
          }
        })
        .catch((err) => {
          console.warn("Cache refresh API fetch failed, falling back to Firestore SDK:", err);
          getDocs(collection(db, "products")).then(snapshot => {
            const prodData = snapshot.docs
              .map((d) => ({ ...d.data(), id: d.id }) as Product)
              .filter((p) => !p.deleted);
            if (prodData.length > 0) {
              setProducts(prodData);
              saveProductsToCache(prodData, siteConfig.productsUpdatedAt);
            }
          }).catch(fsErr => console.warn("Cache refresh fallback products fetch error:", fsErr));
        });
    }
  }, [siteConfig?.productsUpdatedAt]);
  // Synchronize URL and History when React State changes (User actions)
  useEffect(() => {
    if (products.length === 0) return;
    const path = window.location.pathname;
    const isCheckoutParam = new URLSearchParams(window.location.search).get("checkout") === "true";
    
    if (isCheckoutOpen) {
      if (!isCheckoutParam) {
        window.history.pushState({ checkout: true }, "", "/?checkout=true");
      }
    } else if (isProductDetailsOpen && selectedProduct) {
      const targetPath = getProductPath(selectedProduct);
      if (path !== targetPath || isCheckoutParam || window.location.search.includes('p=')) {
        window.history.pushState({ p: selectedProduct.id }, "", targetPath);
      }
    } else if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "All") {
      const targetPath = getCategoryPath(selectedCategory);
      if (path !== targetPath || isCheckoutParam || window.location.search.includes('category=')) {
        window.history.pushState({ category: selectedCategory }, "", targetPath);
      }
    } else {
      // User is on Home page
      if (path !== "/" || window.location.search.length > 0) {
        window.history.pushState({}, "", "/");
      }
    }
  }, [isProductDetailsOpen, selectedProduct, isCheckoutOpen, selectedCategory, products.length]);

  // Handle browser Back / Forward buttons smoothly
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const isCheckout = urlParams.get("checkout") === "true";
      const productId = getProductIdFromUrl();
      let categoryParam = urlParams.get("category") || urlParams.get("cat");
      if (!categoryParam && path.startsWith("/category/")) {
        categoryParam = path.replace(/^\/category\//, "").split("/")[0];
      } else if (!categoryParam && path.startsWith("/c/")) {
        categoryParam = path.replace(/^\/c\//, "").split("/")[0];
      }

      if (isCheckout) {
        setIsCheckoutOpen(true);
        setIsProductDetailsOpen(false);
      } else if (productId && products.length > 0) {
        const prod = findProductBySlugOrId(products, productId);
        if (prod) {
          setSelectedProduct(prod);
          setModalDisplayImage(prod.image);
          setIsProductDetailsOpen(true);
          setIsCheckoutOpen(false);
        }
      } else if (categoryParam && categories.length > 0) {
        const matchedCat = findCategoryBySlug(categories, categoryParam);
        if (matchedCat) {
          setSelectedCategory(matchedCat.name);
          setIsProductDetailsOpen(false);
          setIsCheckoutOpen(false);
        }
      } else {
        setIsProductDetailsOpen(false);
        setIsCheckoutOpen(false);
        if (path === "/" && selectedCategory !== "all" && selectedCategory !== "All") {
          setSelectedCategory("all");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products, categories, selectedCategory]);
  const [adminTab, setAdminTab] = useState<
    "orders" | "products" | "categories" | "settings" | "refunds" | "users" | "support" | "campaigns" | "incomplete_orders" | "bulk_sms" | "profit_analysis"
  >("orders");

  useEffect(() => {
    if (!isAdminOpen || !isAdminVerified || adminTab !== "orders") return;
    if (Date.now() < autoCheckPausedUntilRef.current) return;
    const visibleOrders = filteredOrders.slice(0, adminOrdersLimit);
    const pendingPhones: string[] = [];
    for (const ord of visibleOrders) {
      const normalized = normalizeBdPhone(ord?.customerPhone);
      if (!normalized || normalized.length < 10) continue;
      if (getCourierReportForPhone(courierReportsRef.current, normalized)) continue;
      if (autoCheckedCourierPhonesRef.current.has(normalized)) continue;
      if (!pendingPhones.includes(normalized)) {
        pendingPhones.push(normalized);
        if (pendingPhones.length >= 25) break;
      }
    }
    if (pendingPhones.length === 0) return;
    pendingPhones.forEach(p => autoCheckedCourierPhonesRef.current.add(p));

    let isCancelled = false;
    const fetchVisibleCourierStats = async () => {
      setLoadingCourierReports(prev => {
        const next = { ...prev };
        pendingPhones.forEach(p => { next[p] = true; });
        return next;
      });
      try {
        const headers = await getAdminAuthHeaders(false);
        let updates: Record<string, CourierFraudReport> = {};
        try {
          const batchRes = await axios.post("/api/courier/steadfast/fraud/batch", { phones: pendingPhones }, { headers });
          if (batchRes.data?.rateLimited) {
            autoCheckPausedUntilRef.current = Date.now() + 5 * 60 * 1000;
          }
          const rawResults = batchRes.data?.results;
          if (rawResults && typeof rawResults === "object") {
            for (const [phoneKey, val] of Object.entries(rawResults)) {
              const parsed = parseClientCourierFraudReport({ success: true, data: val });
              if (parsed) updates[phoneKey] = parsed;
            }
          }
        } catch (batchErr: any) {
          const status = batchErr?.response?.status;
          if (status === 404 || status === 405) {
            const fallbackTargets = pendingPhones.slice(0, 3);
            await Promise.all(
              fallbackTargets.map(async (p) => {
                if (isCancelled) return;
                try {
                  const singleRes = await axios.get(`/api/courier/steadfast/fraud/${encodeURIComponent(p)}`, { headers });
                  const parsed = parseClientCourierFraudReport(singleRes.data);
                  if (parsed) updates[p] = parsed;
                } catch (singleErr: any) {
                  if (singleErr?.response?.status === 429) {
                    autoCheckPausedUntilRef.current = Date.now() + 5 * 60 * 1000;
                  }
                }
              })
            );
          }
        }

        if (!isCancelled && Object.keys(updates).length > 0) {
          setCourierReports(prev => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.warn("Background courier rate fetch skipped:", err);
      } finally {
        if (!isCancelled) {
          setLoadingCourierReports(prev => {
            const next = { ...prev };
            pendingPhones.forEach(p => { next[p] = false; });
            return next;
          });
        }
      }
    };

    fetchVisibleCourierStats();
    return () => {
      isCancelled = true;
    };
  }, [isAdminOpen, isAdminVerified, adminTab, filteredOrders, adminOrdersLimit]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null,
  );
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);
  // Landing Page Editor State
  const [landingEditorProduct, setLandingEditorProduct] = useState<any | null>(null);
  const [landingEditorConfig, setLandingEditorConfig] = useState<any>({
    headline: "",
    subheadline: "",
    badgeText: "",
    extraImages: [] as string[],
    features: [
      { icon: "zap", title: "প্রিমিয়াম কোয়ালিটি", desc: "আমরা সরাসরি কারখানা থেকে সেরা মান নিশ্চিত করে কাস্টমারকে প্রোডাক্টটি সরবরাহ করে থাকি।" },
      { icon: "thumbsup", title: "সহজ ব্যবহার উপযোগিতা", desc: "যেকোনো বয়সের মানুষের জন্য অত্যন্ত আরামদায়ক ও সহজ ডিজাইন নিশ্চিত করা হয়েছে।" },
      { icon: "truck", title: "দ্রুত ডেলিভারি সুবিধা", desc: "অর্ডার করার ২৪ থেকে ৭২ ঘণ্টাএ° মধ্যে আমরা সরাসরি কাস্টমারের কাছে হোম ডেলিভারি দিয়ে থাকি।" },
      { icon: "shield", title: "নিশ্চিন্তে ক্যাশ অন ডেলিভারি", desc: "প্রোডাক্ট হাতে পেয়ে কোয়ালিটি চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে তারপরে মূল্য পরিশোধ করার সুবিধা।" },
    ],
    bodyText: "",
    videoUrls: [],
    showTrustBadges: true,
  });
  const [isSavingLandingConfig, setIsSavingLandingConfig] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [landingPreviewTab, setLandingPreviewTab] = useState<'mobile'|'desktop'>('mobile');
  const [productFormErrors, setProductFormErrors] = useState<
    Record<string, boolean>
  >({});
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "moderator">(
    "moderator",
  );
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: "",
    color: "bg-primary",
    objectPosition: "50% 50%",
    linkedProductId: "",
    titleFont: "font-ador",
    titleWeight: "black",
    titleSize: "text-2xl md:text-4xl",
    subtitleFont: "font-ador",
    subtitleWeight: "bold",
    subtitleSize: "text-sm md:text-base",
    type: "hero" as "hero" | "secondary",
  });
  // Consolidated Orders listener (for Admin or User)
  useEffect(() => {
    if (isProductDetailsOpen || isCheckoutOpen || isOrderSuccess) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isProductDetailsOpen, isCheckoutOpen, isOrderSuccess]);
  useEffect(() => {
    if (isQuotaExceeded) return;
    const chatId = user?.uid || sessionId;
    const chatRef = doc(db, "support_chats", chatId);
    const unsub = onSnapshot(
      chatRef,
      (doc) => {
        if (doc.exists()) {
          setChatMessages(doc.data().messages || []);
        }
      },
      (err) => {
        const isQuota = err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED";
        if (isQuota) {
          setIsQuotaExceeded(true);
        }
        if (err.code !== "permission-denied" && !isQuota) {
          console.error("Personal chat listener error:", err);
        }
      }
    );
    return () => unsub();
  }, [user, sessionId, isQuotaExceeded]);
  useEffect(() => {
      if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        const chatId = user?.uid || sessionId;
        const chatRef = doc(db, "support_chats", chatId);
        
        // Mark as read without causing infinite loop
        if (chatMessages.length > 0) {
          getDoc(chatRef).then(snap => {
            if (snap.exists() && snap.data().unreadByUser) {
              updateDoc(chatRef, { unreadByUser: false }).catch(() => {});
            }
          }).catch(() => {});
        }
      }
  }, [chatMessages.length, isChatOpen, user, sessionId]);
  useEffect(() => {
    if (selectedChat) {
      adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);
  useEffect(() => {
    if (selectedChat && supportChats.length > 0) {
      const freshChat = supportChats.find((c) => c.id === selectedChat.id);
      // Optimize: only update if message count changed, much faster than JSON.stringify
      if (freshChat && freshChat.messages?.length !== selectedChat.messages?.length) {
        setSelectedChat(freshChat);
      }
    }
  }, [supportChats, selectedChat]);
  const isInitialSupportLoad = useRef(true);
  useEffect(() => {
    if (isAdminVerified && !isQuotaExceeded) {
      const q = query(
        collection(db, "support_chats"),
        orderBy("lastMessageAt", "desc"),
        limit(50) // Limit to recent 50 chats for better performance
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const chatsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setSupportChats(chatsData);
          
          if (!isInitialSupportLoad.current && snapshot.docChanges().length > 0) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === "added" || change.type === "modified") {
                const chatDoc = change.doc.data() as any;
                if (chatDoc.unreadByAdmin) {
                  const messages = chatDoc.messages || [];
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage && !lastMessage.isAdmin) {
                    playNotifSound();
                    toast.success(`সাপোর্টে নতুন মেসেজ: "${chatDoc.lastMessage || '...'}"`, {
                      icon: "💬",
                      duration: 6000,
                      position: "top-right"
                    });
                  }
                }
              }
            });
          }
          isInitialSupportLoad.current = false;
        },
        (err) => {
          const isQuota = err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED";
          if (isQuota) {
            setIsQuotaExceeded(true);
          }
          if (err.code === "permission-denied") {
            console.warn("Admin chat listener: Access denied. Ensure you are in the admins collection.");
          } else if (!isQuota) {
            console.error("Support chats listener error:", err);
          }
        }
      );
      return () => unsub();
    }
  }, [isAdminVerified, isQuotaExceeded]);
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      setOrderHistory([]);
      return;
    }
    // Role-based query
    let q;
    if (isAdmin) {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(adminOrdersLimit + 150));
    } else {
      q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    }
    const unsubOrders = onSnapshot(
      q, 
      (snapshot) => {
        const orders = snapshot.docs.map((d) => {
          let orderDate = (d.data() as any).date;
          if (!orderDate) {
            const createdAt = (d.data() as any).createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
              orderDate = createdAt.toDate().toLocaleString("bn-BD");
            } else if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
              orderDate = new Date(createdAt.seconds * 1000).toLocaleString("bn-BD");
            } else if (createdAt) {
              orderDate = new Date(createdAt).toLocaleString("bn-BD");
            } else {
              orderDate = "N/A";
            }
          }
          return {
            ...d.data(),
            id: d.id,
            displayId: (d.data() as any).orderId || d.id,
            date: orderDate,
            shortId: (d.data() as any).shortId || String((d.data() as any).orderId || d.id).slice(-6).toUpperCase()
          };
        });
        
        if (!isInitialOrderLoadRef.current) {
          const hasNewOrder = snapshot.docChanges().some(change => change.type === "added");
          if (hasNewOrder && isAdmin) {
            toast.success("নতুন অর্ডার এসেছে! 🛒", {
              duration: 5000,
              icon: "🎉",
              style: { borderRadius: "10px", background: "#333", color: "#fff" },
            });
            playNotificationSound();
          }
        }
        isInitialOrderLoadRef.current = false;
        setOrderHistory(orders);
      },
      (err) => {
        const isQuota = err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED";
        if (isQuota) {
          setIsQuotaExceeded(true);
        }
        if (err.code !== "permission-denied" && !isQuota) {
          console.error("Orders listener error:", err);
        }
      }
    );
    const refundQuery = isAdmin 
      ? query(collection(db, "refund_requests"), orderBy("createdAt", "desc"), limit(100))
      : query(collection(db, "refund_requests"), where("userId", "==", user?.uid || ""), orderBy("createdAt", "desc"), limit(20));
    const unsubRefunds = onSnapshot(refundQuery, (snapshot) => {
      setRefundRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      const isQuota = err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED";
      if (isQuota) {
        setIsQuotaExceeded(true);
      }
      if (err.code !== "permission-denied" && !isQuota) {
        console.error("Refund requests listener error:", err);
      }
    });
    let unsubIncompleteOrders = () => {};
    if (isAdmin) {
      const incOrdersQuery = query(collection(db, "incomplete_orders"), limit(150));
      unsubIncompleteOrders = onSnapshot(incOrdersQuery, (snapshot) => {
        const list = snapshot.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            ...data,
            phone: data.phone || data.customerPhone || "কার্টে আছে (Cart)",
            name: data.name || data.customerName || "অজ্ঞাত ক্রেতা",
            date: data.date || (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toLocaleString("bn-BD") : "কিছুক্ষণ আগে")
          };
        });
        list.sort((a: any, b: any) => {
          const aTime = a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
          const bTime = b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
          return bTime - aTime;
        });
        setIncompleteOrders(list);
      }, (err) => {
        if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        console.warn("Incomplete orders listener error:", err);
      });
    }
    return () => {
      unsubOrders();
      unsubRefunds();
      unsubIncompleteOrders();
    };
  }, [user, isAdmin, isQuotaExceeded]);
  // Background Poller for Abandoned Carts Auto SMS
  useEffect(() => {
    if (!isAdmin || siteConfig?.isReminderSmsEnabled === false) return; // Only run when admin is logged in & reminders enabled
    const checkAbandonedCarts = async () => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const cart of incompleteOrders) {
        if (!cart.smsSent && cart.updatedAt?.toMillis && cart.updatedAt.toMillis() < oneHourAgo && cart.phone && cart.phone.length >= 11) {
          try {
            // First mark it as sent so we don't send multiple times
            await setDoc(doc(db, "incomplete_orders", cart.id), { smsSent: true }, { merge: true });
            
            // Call SMS API
            const message = "আপনার কার্টে থাকা প্রোডাক্টটি এখনো আপনার জন্য অপেক্ষা করছে! আজই অর্ডার কনফার্ম করুন। আমাদের ওয়েবসাইট ভিজিট করুন।";
            await fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone: cart.phone,
                message: message
              })
            });
            console.log("Auto abandoned cart SMS sent to", cart.phone);
          } catch (e) {
            console.error("Failed to send auto abandoned cart SMS", e);
          }
        }
      }
    };
    const intervalId = setInterval(checkAbandonedCarts, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(intervalId);
  }, [incompleteOrders, isAdmin, siteConfig?.isReminderSmsEnabled]);
  const handleSyncMockData = async () => {
    if (!isAdminVerified || isQuotaExceeded) return;
    if (!confirm("আমরা ক? নিশ্চিত?")) return;
    
    setIsSyncingData(true);
    try {
      let catAdded = 0;
      let prodAdded = 0;
      // Sync Categories
      for (const cat of default_categories) {
        const exists = categories.find(c => c.name === cat.name);
        if (!exists) {
          await addDoc(collection(db, "categories"), { name: cat.name }).catch(err => handleFirestoreError(err, OperationType.CREATE, "categories"));
          catAdded++;
        }
      }
      // Sync Products
      for (const prod of default_products) {
        const existingProd = products.find(p => p.name === prod.name);
        if (!existingProd) {
          const { id, ...pData } = prod;
          await addDoc(collection(db, "products"), {
            ...pData,
            createdAt: new Date().toISOString(),
            deleted: false
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, "products"));
          prodAdded++;
        } else {
          // If it exists, make sure the trending flag matches the code if it's explicitly set in default_products
          if (prod.isTrending !== existingProd.isTrending) {
             await updateDoc(doc(db, "products", existingProd.id), {
               isTrending: !!prod.isTrending
             }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `products/${existingProd.id}`));
             prodAdded++; // Count as updated/synced
          }
        }
      }
      alert(`সিঙ্ক সফল! ${catAdded}টি ক্যাটাগরি এবং ${prodAdded}টি প্রোডাক্ট যোগ করা হয়েছে।`);
    } catch (err: any) {
      console.error("Sync failed", err);
      if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") setIsQuotaExceeded(true);
      alert("ডাটা সিঙ্ক করতে সমস্যা হয়েছে।");
    } finally {
      setIsSyncingData(false);
    }
  };
  const handleAdminImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "product" | "banner" | "campaign" = "product",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressedFile = await compressImageFile(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === "product") {
          setEditingProduct((prev: any) => ({
            ...(prev || {}),
            image: dataUrl,
          }));
        } else if (type === "campaign") {
          setEditingCampaign((prev: any) => ({
            ...(prev || {}),
            image: dataUrl,
          }));
        } else {
          if (editingBanner) {
            setEditingBanner((prev: any) => ({ ...(prev || {}), image: dataUrl }));
          } else {
            setNewBanner((prev: any) => ({ ...(prev || {}), image: dataUrl }));
          }
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const handleSaveBanner = async () => {
    const bannerData = editingBanner || newBanner;
    if (!bannerData.image) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    try {
      if (isQuotaExceeded) {
        toast.error("Quota exceeded, cannot save data at the moment.");
        return;
      }
      let updatedBanners: any[] = [];
      if (editingBanner?.id) {
        // Update existing
        const updatedObj = {
          title: editingBanner.title || "",
          subtitle: editingBanner.subtitle || "",
          image: editingBanner.image,
          type: editingBanner.type || "hero",
          objectPosition: editingBanner.objectPosition || "50% 50%",
          linkedProductId: editingBanner.linkedProductId || "",
          titleFont: editingBanner.titleFont || "font-ador",
          titleWeight: editingBanner.titleWeight || "black",
          titleSize: editingBanner.titleSize || "text-2xl md:text-4xl",
          subtitleFont: editingBanner.subtitleFont || "font-ador",
          subtitleWeight: editingBanner.subtitleWeight || "bold",
          subtitleSize: editingBanner.subtitleSize || "text-sm md:text-base",
          updatedAt: new Date().toISOString(),
        };
        await updateDoc(doc(db, "banners", editingBanner.id), updatedObj);
        updatedBanners = activeBanners.map(b => b.id === editingBanner.id ? { ...b, ...updatedObj } : b);
        alert("ব্যানার আপডেট হয়েছে!");
      } else {
        // Add new
        const newObj = {
          ...newBanner,
          title: newBanner.title || "",
          subtitle: newBanner.subtitle || "",
          type: newBanner.type || "hero",
          createdAt: new Date().toISOString(),
          order: activeBanners.length,
        };
        const docRef = await addDoc(collection(db, "banners"), newObj);
        updatedBanners = [...activeBanners, { ...newObj, id: docRef.id }];
        alert("ব্যানার যুক্ত হয়েছে!");
      }
      if (updatedBanners.length > 0) {
        setActiveBanners(updatedBanners);
        safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(updatedBanners));
      }
      fetch('/api/invalidate-banner-cache', { method: 'POST', keepalive: true }).catch(() => {});
      setEditingBanner(null);
      setNewBanner({
        title: "",
        subtitle: "",
        image: "",
        color: "bg-primary",
        objectPosition: "50% 50%",
        linkedProductId: "",
        titleFont: "font-ador",
        titleWeight: "black",
        titleSize: "text-2xl md:text-4xl",
        subtitleFont: "font-ador",
        subtitleWeight: "bold",
        subtitleSize: "text-sm md:text-base",
        type: "hero",
      });
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleSaveSiteConfig = async (config: any) => {
    if (!config) return;
    try {
      if (isQuotaExceeded) {
        toast.error("Quota exceeded, cannot save data at the moment.");
        return;
      }
      const sitePayload = {
        couponCode: config.couponCode,
        isCouponPublic: config.isCouponPublic,
        whatsappNumber: config.whatsappNumber,
        bkashNumber: config.bkashNumber,
        nagadNumber: config.nagadNumber,
        rocketNumber: config.rocketNumber,
        bankDetails: config.bankDetails,
        aboutUs: config.aboutUs,
        privacyPolicy: config.privacyPolicy,
        refundPolicy: config.refundPolicy,
        termsAndConditions: config.termsAndConditions,
        checkoutWarningText: config.checkoutWarningText || "",
        smsTemplateStart: config.smsTemplateStart || "",
        isSmsConfirmEnabled: config.isSmsConfirmEnabled !== undefined ? config.isSmsConfirmEnabled : true,
        isReminderSmsEnabled: config.isReminderSmsEnabled !== undefined ? config.isReminderSmsEnabled : true,
        smsTemplateEnd: config.smsTemplateEnd || "",
        supportPhone1: config.supportPhone1,
        supportPhone2: config.supportPhone2,
        facebookUrl: config.facebookUrl,
        isAiEnabled: config.isAiEnabled ?? false,
        isCodEnabled: config.isCodEnabled ?? true,
        isBkashEnabled: config.isBkashEnabled ?? true,
        isNagadEnabled: config.isNagadEnabled ?? true,
        isRocketEnabled: config.isRocketEnabled ?? true,
        isBankEnabled: config.isBankEnabled ?? true,
        computerAppUrl: config.computerAppUrl || "",
        androidAppUrl: config.androidAppUrl || "",
        iphoneAppUrl: config.iphoneAppUrl || "",
        promoPopupEnabled: config.promoPopupEnabled !== undefined ? config.promoPopupEnabled : false,
        promoPopupImage: config.promoPopupImage || "",
        promoPopupLink: config.promoPopupLink || "",
        updatedAt: new Date().toISOString(),
        geminiApiKey: "",
        steadfastApiKey: "",
        steadfastSecretKey: "",
        steadfastWebhookSecret: "",
        pathaoClientId: "",
        pathaoClientSecret: "",
        pathaoUsername: "",
        pathaoPassword: ""
      };
      try {
        await setDoc(doc(db, "config", "site"), sitePayload, { merge: true });
      } catch (siteErr: any) {
        if (siteErr?.code === "permission-denied" || /permission/i.test(siteErr?.message || "")) {
          const headers = await getAdminAuthHeaders(true);
          const apiRes = await fetch("/api/admin/site-config", {
            method: "POST",
            headers,
            body: JSON.stringify(sitePayload),
          });
          const apiJson = await apiRes.json().catch(() => ({}));
          if (!apiRes.ok || !apiJson.success) {
            throw new Error(apiJson.error || siteErr.message);
          }
        } else {
          throw siteErr;
        }
      }
      if (adminKeys) {
        const keysPayload = {
          steadfastApiKey: adminKeys.steadfastApiKey || "",
          steadfastSecretKey: adminKeys.steadfastSecretKey || "",
          steadfastWebhookSecret: adminKeys.steadfastWebhookSecret || "",
          geminiApiKey: adminKeys.geminiApiKey || "",
          pathaoClientId: adminKeys.pathaoClientId || "",
          pathaoClientSecret: adminKeys.pathaoClientSecret || "",
          pathaoUsername: adminKeys.pathaoUsername || "",
          pathaoPassword: adminKeys.pathaoPassword || "",
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, "admin_config", "keys"), keysPayload, { merge: true });
        } catch (keysErr: any) {
          if (keysErr?.code === "permission-denied" || /permission/i.test(keysErr?.message || "")) {
            const headers = await getAdminAuthHeaders(true);
            const apiRes = await fetch("/api/admin/keys", {
              method: "POST",
              headers,
              body: JSON.stringify(keysPayload),
            });
            const apiJson = await apiRes.json().catch(() => ({}));
            if (!apiRes.ok || !apiJson.success) {
              throw new Error(apiJson.error || keysErr.message);
            }
          } else {
            throw keysErr;
          }
        }
      }
      toast.success("সেটিংস সফলভাবে আপডেট হয়েছে!");
    } catch (err: any) {
      console.error("Site Config Error:", err);
      const errMsg = err.response?.data?.error || err.message || err;
      toast.error("সেটিংস আপডেট করা সম্ভব হয়নি। এরর: " + errMsg);
    }
  };
  const handleDeleteBanner = async (id: any) => {
    console.log("Delete banner request for ID:", id);
    if (!id) {
      alert("⚠️ ব্যানার আইডি পাওয়া যায়নি!");
      return;
    }
    const bannerId = String(id);
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই ব্যানারটি ডিলিট করতে চান?");
    if (!conf) return;
    try {
      const bannerRef = doc(db, "banners", bannerId);
      await deleteDoc(bannerRef);
      const updatedBanners = activeBanners.filter(b => String(b.id) !== bannerId);
      setActiveBanners(updatedBanners);
      safeSetLocalStorage(STORAGE_KEYS.BANNERS, JSON.stringify(updatedBanners));
      fetch('/api/invalidate-banner-cache', { method: 'POST', keepalive: true }).catch(() => {});
      alert("ব্যানার সফলভাবে মুছে ফেলা হয়েছে!");
      if (editingBanner && String(editingBanner.id) === bannerId) {
        setEditingBanner(null);
      }
    } catch (err: any) {
      console.error("Banner delete error details:", err);
      alert("ব্যানার ডিলিট করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট কানেকশন চেক করুন।");
    }
  };
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    try {
      const emailId = newAdminEmail.toLowerCase().trim();
      // Use email as doc ID for admin management if preferred, but rules need to match
      await setDoc(doc(db, "admins", emailId), {
        email: emailId,
        role: newAdminRole,
        password: newAdminPassword,
        phone: newAdminPhone,
        require2FA: true,
        addedBy: user?.email,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminPhone("");
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    try {
      await updateDoc(doc(db, "admins", editingAdmin.id), {
        role: editingAdmin.role,
        password: editingAdmin.password,
        phone: editingAdmin.phone || "",
        require2FA: editingAdmin.require2FA ?? false,
        updatedAt: new Date().toISOString(),
      });
      setEditingAdmin(null);
      alert("অ্যাডমিন আপডেট করা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleDeleteAdmin = async (id: any) => {
    if (!id) {
      alert("ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন।");
      return;
    }
    const adminId = String(id);
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই অ্যাডমিনকে ডিলিট করতে চান?");
    if (!conf) return;
    try {
      console.log("Deleting admin:", adminId);
      await deleteDoc(doc(db, "admins", adminId));
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err: any) {
      console.error("Admin delete error:", err);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
  };
  const handleAdminMultiImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if ((editingProduct?.images?.length || 0) + files.length > 6) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    Array.from(files).forEach(async (file: File) => {
      try {
        const options = {
          maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        const compressedFile = await compressImageFile(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingProduct((prev: any) => {
            const currentImages = prev?.images || [];
            return {
              ...(prev || {}),
              images: [...currentImages, reader.result as string],
            } as any;
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
      }
    });
  };
  const removeImage = (index: number) => {
    setEditingProduct((prev: any) => {
      const currentImages = prev?.images || [];
      return {
        ...(prev || {}),
        images: currentImages.filter((_: any, i: number) => i !== index),
      };
    });
  };
  const handleSetPrimaryImage = (index: number) => {
    setEditingProduct((prev: any) => {
      if (!prev || !prev.images || !prev.images[index]) return prev;
      const currentImages = [...(prev.images || [])];
      const selectedImg = currentImages[index];
      const previousPrimary = prev.image;
      currentImages.splice(index, 1);
      if (previousPrimary) {
        currentImages.unshift(previousPrimary);
      }
      return {
        ...prev,
        image: selectedImg,
        images: currentImages,
      };
    });
  };
  const handleVariantImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    variantIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressedFile = await compressImageFile(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev: any) => {
          const currentVariants = [...(prev?.variants || [])];
          if (currentVariants[variantIndex]) {
            currentVariants[variantIndex] = {
              ...currentVariants[variantIndex],
              image: reader.result as string,
            };
          }
          return { ...prev, variants: currentVariants };
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Variant image upload failed", error);
    }
  };
  const addVariant = () => {
    setEditingProduct((prev: any) => {
      const currentVariants = [...(prev?.variants || [])];
      return {
        ...prev,
        variants: [
          ...currentVariants,
          {
            id: Date.now().toString(),
            name: "",
            size: "",
            image: "",
            stock: 50,
            showExactStock: true,
          },
        ],
      };
    });
  };
  const removeVariant = (index: number) => {
    setEditingProduct((prev: any) => {
      const currentVariants = (prev?.variants || []).filter(
        (_: any, i: number) => i !== index,
      );
      return { ...prev, variants: currentVariants };
    });
  };
  const deleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
      toast.success("Campaign deleted");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `campaigns/${id}`);
    }
  };
  const saveCampaign = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCampaign?.name || !editingCampaign?.slug) {
      toast.error("সঠিক Slug প্রয়োজন (শুধুমাত্র ছোট অক্ষর, সংখ্যা এবং ড্যাশ)");
      return;
    }
    
    // Validation
    if (!editingCampaign?.name) {
      toast.error("ক্যাম্পেইন নাম প্রয়োজন");
      return;
    }
    if (!editingCampaign?.slug || !/^[a-z0-9-]+$/.test(editingCampaign.slug)) {
      toast.error("সঠিক Slug প্রয়োজন (শুধুমাত্র ছোট অক্ষর, সংখ্যা এবং ড্যাশ)");
      return;
    }
    if (!editingCampaign?.image) {
      toast.error("ব্যানার ইমেজ প্রয়োজন");
      return;
    }
    // Generate slug from name if not provided (though we required it)
    const slug = editingCampaign.slug.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    try {
      const campaignData = {
        ...editingCampaign,
        slug,
        updatedAt: new Date().toISOString(),
        isActive: editingCampaign.isActive !== undefined ? editingCampaign.isActive : true,
        productIds: editingCampaign.productIds || [],
      };
      
      if (editingCampaign.id) {
        await updateDoc(doc(db, "campaigns", editingCampaign.id), campaignData);
        toast.success("Campaign updated successfully");
      } else {
        await addDoc(collection(db, "campaigns"), {
          ...campaignData,
          createdAt: new Date().toISOString(),
        });
        toast.success("Campaign created successfully");
      }
      setEditingCampaign(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "campaigns");
    }
  };
  const handleDuplicateProduct = (p: Product) => {
    // Scroll to form to show user where to edit
    const formElement = document.getElementById("field-name");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Clone the product but clear the ID to make it new
    setEditingProduct({
      ...p,
      id: "", // Important: reset ID so it's treated as a new product
      name: `${p.name} (কপি)`, // Append Bengali 'Copy'
      code: p.code ? `${p.code}-copy-${Math.floor(Math.random() * 10000)}` : "", // Codes should be unique
      variants: (p.variants || []).map(v => ({
        ...v,
        id: Math.random().toString(36).substring(2, 9)
      })),
      createdAt: null,
      updatedAt: null,
      rating: 0,
      reviewCount: 0,
      likes: 0,
      reviews: []
    });
    
    toast.success("প্রোডাক্ট কপি করা হয়েছে। এখন তথ্য পরিবর্তন করে সেভ করুন।");
  };
  const [arrivalIndex, setArrivalIndex] = useState(0);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [featuredScrollPercent, setFeaturedScrollPercent] = useState(0);
  
  const handleFeaturedScroll = () => {
    if (featuredScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuredScrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      const percent = totalScrollable > 0 ? (scrollLeft / totalScrollable) * 100 : 0;
      setFeaturedScrollPercent(percent);
    }
  };
  const handleFeaturedSliderChange = (percent: number) => {
    if (featuredScrollRef.current) {
      const { scrollWidth, clientWidth } = featuredScrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      featuredScrollRef.current.scrollLeft = (percent / 100) * totalScrollable;
    }
  };

  // Auto-scroll Featured Products every 3 seconds
  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      const el = featuredScrollRef.current;
      if (el) {
        const isEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 20;
        if (isEnd) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 280, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredProducts]);
  useEffect(() => {
    if (newArrivals.length <= 1) return;
    const timer = setInterval(() => {
      setArrivalIndex((prev) => {
        const itemsToShow = window.innerWidth < 768 ? 1 : 5;
        const maxIndex = Math.max(0, newArrivals.length - itemsToShow);
        if (maxIndex <= 0) return 0;
        return (prev + 1) > maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [newArrivals.length]);
  // Featured Products slider logic removed as per user request (manual scroll)
  const touchProductsTimestamp = async () => {
    try {
      await setDoc(doc(db, "config", "siteConfig"), {
        productsUpdatedAt: new Date().toISOString()
      }, { merge: true });
      fetch("/api/invalidate-product-cache", { method: "POST" }).catch(() => {});
    } catch (e) {
      console.warn("Failed to update productsUpdatedAt:", e);
    }
  };

  const saveProduct = async (e: FormEvent) => {
    e.preventDefault();
    // Validation
    const primaryImage = editingProduct?.image || editingProduct?.images?.[0] || editingProduct?.variants?.[0]?.image || "";
    const errors: Record<string, boolean> = {};
    if (!editingProduct?.name) errors.name = true;
    if (!editingProduct?.price) errors.price = true;
    if (!primaryImage) errors.image = true;
    if (!editingProduct?.category) errors.category = true;
    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      const firstErrorId = `field-${Object.keys(errors)[0]}`;
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setProductFormErrors({});
    setIsSavingProduct(true);
    try {
      // Check for duplicate code
      if (editingProduct.code?.trim()) {
        const q = query(
          collection(db, "products"),
          where("code", "==", editingProduct.code.trim()),
          where("deleted", "==", false)
        );
        const querySnapshot = await getDocs(q);
        const existingDocs = querySnapshot.docs.filter(doc => doc.id !== editingProduct.id);
        if (existingDocs.length > 0) {
          alert("এই কোড নাম্বার দিয়ে ইতিমধ্যে একটি প্রোডাক্ট আছে। দয়া করে অন্য একটি কোড ব্যবহার করুন।");
          setProductFormErrors(prev => ({ ...prev, code: true }));
          return;
        }
      }
      // Create a clean object without the 'id' field for new products
      const productData: any = {
        name: editingProduct.name,
        code: editingProduct.code?.trim() || "",
        price: Number(editingProduct.price),
        buyingPrice: Number(editingProduct.buyingPrice || 0),
        originalPrice: Number(
          editingProduct.originalPrice || editingProduct.price,
        ),
        discount: editingProduct.originalPrice
          ? Math.round(
              ((editingProduct.originalPrice - editingProduct.price) /
                (editingProduct.originalPrice || 1)) *
                100,
            )
          : 0,
        image: primaryImage,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory || "",
        description: editingProduct.description || "",
        tags: editingProduct.tags || "",
        videoUrl: editingProduct.videoUrl || "",
        brand: editingProduct.brand || "",
        modelName: editingProduct.modelName || "",
        warranty: editingProduct.warranty || "",
        inTheBox: editingProduct.inTheBox || "",
        features: editingProduct.features || "",
        specifications: editingProduct.specifications || [],
        images: editingProduct.images || [],
        variants: editingProduct.variants || [],
        wholesaleTiers: editingProduct.wholesaleTiers || [],
        weight: Number(editingProduct.weight || 0),
        unit: editingProduct.unit || "piece",
        smsName: editingProduct.smsName || "",
        colors: editingProduct.colors || [],
        bundleProductIds: Array.isArray(editingProduct.bundleProductIds)
          ? editingProduct.bundleProductIds.filter((id: string) => id && id !== editingProduct.id)
          : [],
        bundleDiscount: Number(editingProduct.bundleDiscount || 0),
        bundleDiscountType: editingProduct.bundleDiscountType || 'percentage',
        stock: editingProduct.variants && editingProduct.variants.length > 0 && editingProduct.variants.some((v: any) => v && v.stock !== undefined && v.stock !== null)
          ? Math.max(0, editingProduct.variants.reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0))
          : Math.max(0, Number(editingProduct.stock || 0)),
        isTrending: !!editingProduct.isTrending,
        isFreeDelivery: !!editingProduct.isFreeDelivery,
        isComingSoon: !!editingProduct.isComingSoon,
        isFlashSale: !!editingProduct.isFlashSale,
        isPublished: editingProduct.isPublished !== false,
        flashSaleEndDate: editingProduct.flashSaleEndDate || "",
        createdAt: editingProduct.id
          ? editingProduct.createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      };
      // Safeguard against 1MB firestore limit
      const estimatedSize = JSON.stringify(productData).length;
      if (estimatedSize > 950000) {
        alert("ছবিগুলোর সাইজ অনেক বড় (১ মেগাবাইটের বেশি)। দয়া করে ছোট সাইজের ছবি ব্যবহার করুন অথবা কিছু ছবি বাদ দিন।");
        return;
      }
      if (editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        await touchProductsTimestamp();
        
        // Optimistic Update for Quota issues
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id ? { ...productData, id: p.id } as Product : p
        );
        setProducts(updatedProducts);
        saveProductsToCache(updatedProducts, siteConfig?.productsUpdatedAt);
        setEditingProduct(null);
        if (e.target) (e.target as HTMLFormElement).reset();
        alert("Product update successful!");
      } else {
        const docRef = await addDoc(collection(db, "products"), productData);
        await touchProductsTimestamp();
        
        // Optimistic Update for Quota issues
        const newProducts = [{ ...productData, id: docRef.id } as Product, ...products];
        setProducts(newProducts);
        saveProductsToCache(newProducts, siteConfig?.productsUpdatedAt);
        setEditingProduct(null);
        if (e.target) (e.target as HTMLFormElement).reset();
        alert("Product added successfully!");
      }
    } catch (err: any) {
      console.error("Save product failed", err);
      const isQuota = err.message?.includes("Quota exceeded") || err.message?.includes("quota") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      if (err.code === "permission-denied") {
        alert("You do not have permission to modify this data. Please reload the page.");
      } else if (isQuota) {
        alert("Server order/data quota exceeded.");
      } else {
        alert("ডাটা সেভ করতে সমস্যা হয়েছে: " + (err.message || "Unknown error"));
      }
    } finally {
      setIsSavingProduct(false);
    }
  };
  const handleLikeProduct = useCallback(async (productId: string) => {
    if (isQuotaExceeded) return;
    // Prevent multiple simultaneous calls for the same product
    if (likeInProgressRef.current.has(productId)) return;
    likeInProgressRef.current.add(productId);
    // Always read latest value via ref to avoid stale closure bugs
    const isAlreadyLiked = likedProductsRef.current.includes(productId);
    const likeDiff = isAlreadyLiked ? -1 : 1;
    if (!isAlreadyLiked) {
      const likedProd = products.find((p) => p.id === productId) || (selectedProduct?.id === productId ? selectedProduct : null);
      if (likedProd) {
        trackAddToWishlist({
          id: likedProd.id,
          name: likedProd.name,
          price: Number(likedProd.price || 0),
          category: likedProd.category,
        });
      }
    }
    // Optimistic UI update immediately
    setLikedProducts(prev => {
      const next = isAlreadyLiked
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem("ishopbd_liked_products", JSON.stringify(next));
      return next;
    });
    setSelectedProduct(prev => {
      if (prev && prev.id === productId) {
        return { ...prev, likes: Math.max(0, (prev.likes || 0) + likeDiff) };
      }
      return prev;
    });
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, likes: Math.max(0, (p.likes || 0) + likeDiff) }
        : p
    ));
    try {
      await updateDoc(doc(db, "products", productId), {
        likes: increment(likeDiff),
      });
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          likedProducts: isAlreadyLiked ? arrayRemove(productId) : arrayUnion(productId),
        }).catch(err => {
          console.warn("Failed to sync likedProducts to user profile", err);
        });
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setLikedProducts(prev => {
        const reverted = isAlreadyLiked
          ? [...prev, productId]
          : prev.filter(id => id !== productId);
        localStorage.setItem("ishopbd_liked_products", JSON.stringify(reverted));
        return reverted;
      });
      setSelectedProduct(prev => {
        if (prev && prev.id === productId) {
          return { ...prev, likes: Math.max(0, (prev.likes || 0) - likeDiff) };
        }
        return prev;
      });
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, likes: Math.max(0, (p.likes || 0) - likeDiff) }
          : p
      ));
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    } finally {
      likeInProgressRef.current.delete(productId);
    }
  }, [isQuotaExceeded, user]);
  const handleRatingProduct = async (productId: string, rating: number) => {
    if (isQuotaExceeded) return;
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        const currentRating = data.rating || 0;
        const currentCount = data.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + rating) / newCount;
        await updateDoc(productRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount,
        });
      }
    } catch (err: any) {
      console.error("Failed to rate product", err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  };
  const deleteProduct = async (id: any) => {
    console.log("Delete product attempt for ID:", id);
    if (!id) {
      alert("⚠️ অ্যাডমিন আইডি পাওয়া যায়নি, স্যার।");
      return;
    }
    const productId = String(id);
    const conf = window.confirm("⚠️ আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান, স্যার?");
    if (!conf) return;
    try {
      console.log("Log", productId);
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      await touchProductsTimestamp();
      console.log("Log", productId);
      
      // Optimistic delete for cache/quota issues
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      saveProductsToCache(updatedProducts, siteConfig?.productsUpdatedAt);
      alert("প্রোডাক্টটি সফলভাবে ডিলিট করা হয়েছে।");
      if (editingProduct && String(editingProduct.id) === productId) {
        setEditingProduct(null);
      }
    } catch (err: any) {
      console.error("  Product delete error details:", err);
      const isQuota = err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else if (isQuota) {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
  };
  const togglePublishStatus = async (product: Product) => {
    const newStatus = product.isPublished === false;
    try {
      await updateDoc(doc(db, "products", product.id), {
        isPublished: newStatus,
        updatedAt: serverTimestamp()
      });
      await touchProductsTimestamp();
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, isPublished: newStatus } : p
      );
      setProducts(updatedProducts);
      saveProductsToCache(updatedProducts, siteConfig?.productsUpdatedAt);
      toast.success(newStatus ? "Product is now visible on website (Published)" : "Product has been hidden (Unpublished)");
    } catch (err: any) {
      const isQuota = err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      console.error("Toggle publish status error:", err);
      toast.error("Failed to update status.");
    }
  };
  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name: editingCategory.name,
        });
      } else {
        await setDoc(doc(collection(db, "categories")), {
          name: editingCategory.name,
          createdAt: new Date().toISOString(),
        });
      }
      setEditingCategory(null);
    } catch (err) {
      console.error("Save category failed", err);
      alert("Failed to save data on server. Please check your internet connection or log in again.");
    }
  };
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const deleteCategory = async (id: any, name: string) => {
    if (!id) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    const categoryId = String(id);
    console.log("Log", { id, categoryId, name });
    
    const conf = window.confirm(`আপনি কি "${name}" ক্যাটাগরি ডিলিট করতে চান?`);
    if (!conf) {
      console.log(" Deletion cancelled by user");
      return;
    }
    setDeletingCatId(categoryId);
    try {
      console.log("Log" + categoryId);
      const docRef = doc(db, "categories", categoryId);
      await deleteDoc(docRef);
      console.log("Log");
      
      // Manual state update as fallback for slow snapshot
      setCategories((prev) => prev.filter((c) => String(c.id) !== categoryId));
      
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      if (editingCategory && String(editingCategory.id) === categoryId) {
        setEditingCategory(null);
      }
    } catch (err: any) {
      console.error(" Category delete error details:", err);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    } finally {
      setDeletingCatId(null);
    }
  };
  // Auth & Profile Listener
  useEffect(() => {
    // This listener is now handled in the setup effect to avoid duplication
  }, []);
  const [editingUserBalance, setEditingUserBalance] = useState<any | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const handleEditUserBalance = (u: any) => {
    setEditingUserBalance(u);
    setNewBalanceInput(String(u.balance || 0));
  };
  const confirmBalanceUpdate = async () => {
    if (!editingUserBalance) return;
    const u = editingUserBalance;
    const userId = u.id || u.uid;
    const amountStr = newBalanceInput;
    
    if (amountStr !== "" && !isNaN(Number(amountStr))) {
      const newBalance = Number(amountStr);
      const currentBalance = Number(u.balance) || 0;
      
      setIsSyncingData(true);
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { 
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
        // Add an adjustment transaction
        try {
          await addDoc(collection(db, "transactions"), {
            userId: userId,
            amount: newBalance - currentBalance,
            type: "adjustment",
            description: "Admin manual balance adjustment",
            createdAt: new Date().toISOString(),
            status: "completed"
          });
        } catch (txErr) {
          console.warn("Transaction log failed:", txErr);
          // Don't fail the whole operation if just the log fails
        }
        setUserList(prev => prev.map(usr => (usr.id === userId || usr.uid === userId) ? {...usr, balance: newBalance} : usr));
        toast.success("Balance update successful.");
        setEditingUserBalance(null);
      } catch (err) {
        console.error("Balance update error:", err);
        toast.error("Failed to update balance.");
        try {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        } catch (e) {
          // ignore re-throw
        }
      } finally {
        setIsSyncingData(false);
      }
    } else {
      toast.error("Please enter a valid number.");
    }
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "signup">("login");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unseenNotifCount, setUnseenNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userListSearch, setUserListSearch] = useState("");
  const [isSendingBulkNotif, setIsSendingBulkNotif] = useState(false);
  const [bulkNotifForm, setBulkNotifForm] = useState({ title: "", message: "", link: "" });
  // Bulk SMS State
  const [bulkSmsSelectedPhones, setBulkSmsSelectedPhones] = useState<Set<string>>(new Set());
  const [bulkSmsPage, setBulkSmsPage] = useState(0);
  const [bulkSmsSearch, setBulkSmsSearch] = useState("");
  const [bulkSmsMessage, setBulkSmsMessage] = useState("");
  const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);
  const [bulkSmsResult, setBulkSmsResult] = useState<{ successCount: number; failCount: number; total: number } | null>(null);
  const [bulkSmsProgress, setBulkSmsProgress] = useState<{ batchNum: number; totalBatches: number; sent: number; failed: number; total: number } | null>(null);
  // Individual SMS State
  const [individualSmsOrder, setIndividualSmsOrder] = useState<any>(null);
  const [individualSmsMessage, setIndividualSmsMessage] = useState("");
  const [isSendingIndividualSms, setIsSendingIndividualSms] = useState(false);
  const BULK_SMS_PAGE_SIZE = 100;

  const sendPushToUser = async (userId: string, title: string, body: string, link: string = '/') => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const token = userDoc.data().fcmToken;
        if (token) {
          await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, title, body, link })
          });
        }
      }
    } catch (e) {
      console.warn("Push error:", e);
    }
  };
  function playNotifSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;

        // Warm Low-pass filter to remove any sharpness
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.connect(ctx.destination);

        // Tone 1: Gentle Warm Chime (523.25Hz - C5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.025, now + 0.02); // very soft peak
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35); // quick smooth fade
        osc1.connect(gain1);
        gain1.connect(filter);
        osc1.start(now);
        osc1.stop(now + 0.38);

        // Tone 2: Soft Harmonic Chime (659.25Hz - E5)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.06);
        gain2.gain.setValueAtTime(0, now + 0.06);
        gain2.gain.linearRampToValueAtTime(0.02, now + 0.08); // very subtle harmonic
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(filter);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.48);
        return;
      }
    } catch (e) {}

    try {
      const audio = new Audio(NOTIF_SOUND_URL);
      audio.volume = 0.08; // extremely light and subtle fallback volume
      audio.play().catch(e => console.log("Sound play error:", e));
    } catch (e) {}
  }
  useEffect(() => {
    if (!user || isQuotaExceeded) return;
    const isMaster = masterEmails.includes(user.email || "");
    if (!isMaster && !isAdmin) return; 
    // Users listener for admin management
    setIsUsersLoading(true);
    const q = query(collection(db, "users"), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      setUserList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsUsersLoading(false);
    }, (err) => {
      if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") {
        setIsQuotaExceeded(true);
      }
      console.warn("Users sync error:", err.message);
      setIsUsersLoading(false);
    });
    return () => unsub();
  }, [user, isAdmin, isQuotaExceeded]);

  // Notifications Listener - strictly toasts new real-time additions only once, never on initial load or re-renders
  const seenNotifIds = useRef<Set<string>>(new Set());
  const isInitialNotifLoad = useRef(true);

  useEffect(() => {
    if (isQuotaExceeded) return;
    // Determine target user IDs for notifications
    const targetUserIds = ["all"];
    if (user?.uid) {
      targetUserIds.push(user.uid);
    }

    let isFirstBatch = true;

    const unsubNotifs = onSnapshot(
      query(
        collection(db, "notifications"), 
        where("userId", "in", targetUserIds),
        orderBy("createdAt", "desc"), 
        limit(20)
      ),
      (snapshot) => {
        const notifs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        
        if (isFirstBatch) {
          // Add all existing doc IDs to seen set so they are NEVER toasted
          snapshot.docs.forEach((d) => seenNotifIds.current.add(d.id));
          isFirstBatch = false;
          isInitialNotifLoad.current = false;
        } else {
          // Only toast truly NEW docs added in real-time
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const docId = change.doc.id;
              if (!seenNotifIds.current.has(docId)) {
                seenNotifIds.current.add(docId);
                const newNotif: any = change.doc.data();
                if (!newNotif.userId || newNotif.userId === "all" || (user?.uid && newNotif.userId === user.uid)) {
                  playNotifSound();
                  toast.success(newNotif.title || "নিরাপদ শপ বিডি থেকে নতুন নোটিফিকেশন!", {
                    icon: "🔔",
                    duration: 5000,
                    position: "top-right"
                  });
                }
              }
            }
          });
        }
        
        const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
        let dismissed: string[] = [];
        try { dismissed = JSON.parse(dismissedStr); } catch(e){}
        const filteredNotifs = notifs.filter((n: any) => !dismissed.includes(n.id) && n.title !== 'dgfdb' && n.title !== 'hhh' && n.message !== 'bcvbc' && n.message !== 'hhh');
        
        // Deduplicate: Each order will have at most ONE notification in the list (the newest one)
        const seenOrderIds = new Set<string>();
        const dedupedNotifs: any[] = [];
        for (const notif of filteredNotifs as any[]) {
          const orderId = notif.orderId || (notif.title?.match(/#([a-zA-Z0-9_-]+)/)?.[1]) || (notif.message?.match(/#([a-zA-Z0-9_-]+)/)?.[1]);
          if (orderId) {
            if (!seenOrderIds.has(orderId)) {
              seenOrderIds.add(orderId);
              dedupedNotifs.push(notif);
            }
          } else {
            dedupedNotifs.push(notif);
          }
        }

        setNotifications(dedupedNotifs);
      },
      (err) => {
        if (err.code !== "permission-denied") {
          handleFirestoreError(err, OperationType.GET, "notifications");
        }
      }
    );
    return () => {
      unsubNotifs();
    };
  }, [user?.uid, isQuotaExceeded]);

  // Compute unseen notification badge count independently without re-subscribing Firestore
  useEffect(() => {
    const lastCheck = userProfile?.lastNotifCheck 
      ? new Date(userProfile.lastNotifCheck).getTime() 
      : (localStorage.getItem("lastNotifCheck") ? Number(localStorage.getItem("lastNotifCheck")) : Date.now() - 86400000);
    
    const unseen = notifications.filter((n: any) => {
      const createdAt = n.createdAt?.seconds 
        ? n.createdAt.seconds * 1000 
        : (n.createdAt ? new Date(n.createdAt).getTime() : Date.now());
      return createdAt > lastCheck;
    }).length;
    setUnseenNotifCount(unseen);
  }, [notifications, userProfile?.lastNotifCheck]);
  const handleDismissNotification = (id: string) => {
    const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(dismissedStr); } catch(e){}
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem('dismissedNotifs', JSON.stringify(dismissed));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnseenNotifCount(prev => Math.max(0, prev - 1));
    toast.success("Notification deleted successfully.");
  };
  const handleClearAllNotifications = () => {
    const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(dismissedStr); } catch(e){}
    const allIds = notifications.map(n => n.id);
    const updatedDismissed = Array.from(new Set([...dismissed, ...allIds]));
    localStorage.setItem('dismissedNotifs', JSON.stringify(updatedDismissed));
    setNotifications([]);
    setUnseenNotifCount(0);
    toast.success("All notifications deleted successfully.");
  };
  const handleSendBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNotifForm.title || !bulkNotifForm.message) return;
    
    setIsSendingBulkNotif(true);
    try {
      await addDoc(collection(db, "notifications"), {
        ...bulkNotifForm,
        userId: "all",
        createdAt: serverTimestamp(),
        sender: user?.email,
        type: "broadcast"
      });
      setBulkNotifForm({ title: "", message: "", link: "" });
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Bulk notification error:", err);
      alert("Failed to send notification.");
    } finally {
      setIsSendingBulkNotif(false);
    }
  };
  const handleSendDirectNotification = async (targetUserId: string, targetUserEmail: string) => {
    const title = window.prompt("নোটিফিকেশনের শিরোনাম দিন:");
    if (!title) return;
    const message = window.prompt("বিস্তারিত মেসেজ লিখুন:");
    if (!message) return;
    const link = window.prompt("লিঙ্ক বা প্রোডাক্ট আইডি দিন (Link/ID):", "");
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        link: link || "",
        userId: targetUserId,
        userEmail: targetUserEmail,
        createdAt: serverTimestamp(),
        sender: user?.email,
        type: "direct"
      });
      alert("Message sent successfully!");
    } catch (err) {
      console.error("Direct notification error:", err);
      alert("ব্যানার যুক্ত হয়েছে!");
    }
  };
  // Bulk SMS: Extract unique phone numbers from all orders
  const allOrderPhones = useMemo(() => {
    const phoneSet = new Set<string>();
    orderHistory.forEach((order: any) => {
      const phone = order.customerPhone;
      if (phone && phone.trim().length >= 11) {
        phoneSet.add(phone.trim());
      }
    });
    return Array.from(phoneSet);
  }, [orderHistory]);
  const handleSendIndividualSms = async () => {
    if (!individualSmsOrder || !individualSmsMessage.trim()) return;
    setIsSendingIndividualSms(true);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: individualSmsOrder.customerPhone || individualSmsOrder.phone,
          message: individualSmsMessage
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("SMS sent successfully!");
        setIndividualSmsOrder(null);
        setIndividualSmsMessage("");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      alert("Error sending SMS: " + err.message);
    } finally {
      setIsSendingIndividualSms(false);
    }
  };
  const handleSendBulkSms = async () => {
    if (bulkSmsSelectedPhones.size === 0) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    if (!bulkSmsMessage.trim()) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    if (!confirm(`আমরা ক? ${bulkSmsSelectedPhones.size}টিতে SMS পাঠাতে চালু\n\nমেসেজ : ${bulkSmsMessage}`)) return;
    setIsSendingBulkSms(true);
    setBulkSmsResult(null);
    setBulkSmsProgress(null);
    try {
      // Use fetch + ReadableStream to read SSE progress events
      const adminToken = sessionStorage.getItem("ishopbd_admin_token") || localStorage.getItem("ishopbd_admin_token") || "";
      const response = await fetch("/api/send-bulk-sms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken
        },
        body: JSON.stringify({
          phones: Array.from(bulkSmsSelectedPhones),
          message: bulkSmsMessage
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Server error");
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE format: "data: {...}\n\n"
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "").trim();
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine);
              if (event.type === "start") {
                setBulkSmsProgress({ batchNum: 0, totalBatches: event.totalBatches, sent: 0, failed: 0, total: event.total });
              } else if (event.type === "progress" || event.type === "batch_done") {
                setBulkSmsProgress({ batchNum: event.batchNum, totalBatches: event.totalBatches, sent: event.sent, failed: event.failed, total: event.total || bulkSmsSelectedPhones.size });
              } else if (event.type === "done") {
                setBulkSmsResult({ successCount: event.successCount, failCount: event.failCount, total: event.total });
                setBulkSmsProgress(null);
                if (event.successCount > 0) toast.success(`${event.successCount}টা SMS সফলভাবে পাঠানো হয়েছে!`);
                if (event.failCount > 0) toast.error(`${event.failCount}টা SMS পাঠাতে ব্যর্থ হয়েছে?`);
              }
            } catch (_) {}
          }
        }
      }
    } catch (err: any) {
      console.error("Bulk SMS error:", err);
      toast.error("Failed to send SMS: " + (err.message || "অজানা ত্রুটি"));
      setBulkSmsProgress(null);
    } finally {
      setIsSendingBulkSms(false);
    }
  };
  const handleCheckNotifications = async () => {
    setIsNotifOpen(true);
    setUnseenNotifCount(0);
    if (userProfile?.uid && !isQuotaExceeded) {
      try {
        await updateDoc(doc(db, "users", userProfile.uid), {
          lastNotifCheck: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") setIsQuotaExceeded(true);
        console.error("Update lastNotifCheck error:", err);
      }
    }
  };
  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      let email = authIdentifier.trim().toLowerCase();
      
      // If it's a phone number (just digits), convert to a dummy email for Firebase Auth
      const isPhone = /^\d+$/.test(email);
      if (isPhone) {
        if (email.length < 10) {
          throw new Error("সঠিক ফোন নাম্বার দিন।");
        }
        email = `${email}@mobile.user`;
      } else {
        if (!email.includes("@")) {
          throw new Error("সঠিক ইমেইল বা ফোন নাম্বার দিন।");
        }
      }
      if (authModalType === "signup") {
        if (!authName) throw new Error("আপনার নাম লিখুন।");
        if (authPassword.length < 6) throw new Error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
        
        const userCred = await createUserWithEmailAndPassword(auth, email, authPassword);
        // On signup, update display name
        await updateProfile(userCred.user, {
           displayName: authName
        });
        
        // Also ensure user doc is created (though there is a listener in the setup effect, 
        // sometimes it's good to be explicit or the listener will catch it)
      } else {
        await signInWithEmailAndPassword(auth, email, authPassword);
      }
      
      setIsAuthModalOpen(false);
      setAuthIdentifier("");
      setAuthPassword("");
      setAuthName("");
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        setTimeout(() => setShowPushPrompt(true), 800);
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      let msg = "অথেন্টিকেশন ব্যর্থ হয়েছে।";
      if (err.code === "auth/user-not-found") msg = "এই একাউন্টটি পাওয়া যায়নি।";
      else if (err.code === "auth/wrong-password") msg = "ভুল পাসওয়ার্ড।";
      else if (err.code === "auth/email-already-in-use") msg = "ইমেইল/ফোন ইতিমধ্যে ব্যবহৃত হচ্ছে।";
      else msg = err.message || msg;
      setAuthError(msg);
      alert(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };
  const handleLogin = async (
    providerType: "google" | "facebook" = "google",
  ) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const provider =
        providerType === "google" ? googleProvider : facebookProvider;
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        setTimeout(() => setShowPushPrompt(true), 800);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMsg = "লগইন করতে সমস্যা হয়েছে।";
      if (err.code === "auth/popup-blocked") {
        errorMsg =
          "পপআপ ব্লক করা হয়েছে! অনুগ্রহ করে ব্রাউজারের পপআপ পারমিশন দিন।";
      } else if (err.code === "auth/unauthorized-domain") {
        errorMsg = "এই ডোমেইনটি (Domain) অথরাইজড নয়। Firebase Console -> Authentication -> Settings -> Authorized Domains-এ আপনার ডোমেইনটি যোগ করুন।";
      }
      setAuthError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true
      };
      
      const compressedFile = await compressImageFile(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Save to Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userRef, {
            photoURL: base64data
          });
          
          // Update local state if needed
          setUserProfile((prev: any) => prev ? { ...prev, photoURL: base64data } : { photoURL: base64data });
          alert("Profile picture updated successfully!");
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.UPDATE, `users/${user.uid}`);
          alert("ডাটাবেজে ছবি সেভ করতে সমস্যা হয়েছে।");
        }
      };
    } catch (error) {
      console.error("Profile image upload error:", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    }
  };
  const handleLogout = async () => {
    try {
      if (user) {
        localStorage.removeItem(`admin_verified_${user.uid}`);
        sessionStorage.removeItem(`admin_verified_${user.uid}`);
      }
      await signOut(auth);
      setIsProfileOpen(false);
      setIsAdminVerified(false);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("500");
  const [depositMethod, setDepositMethod] = useState<
    "bkash" | "nagad" | "bank"
  >("bkash");
  const [depositTrxId, setDepositTrxId] = useState("");
  const handleDepositSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    if (!depositTrxId) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    setIsPaymentSimulating(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: user.uid,
        amount,
        type: "deposit",
        method: depositMethod,
        trxId: depositTrxId,
        description: `Wallet Deposit via ${depositMethod.toUpperCase()}`,
        status: "completed",
        createdAt: new Date().toISOString(),
      });
      await updateDoc(userRef, {
        balance: (userProfile.balance || 0) + amount,
        updatedAt: serverTimestamp(),
      });
      setIsDepositModalOpen(false);
      setDepositTrxId("");
      alert(`${amount} টাকা আপনার ওয়ালেটে সফলভাবে যোগ করা হয়েছে!`);
    } catch (err) {
      console.error("Deposit failed", err);
      alert("Failed to deposit money.");
    } finally {
      setIsPaymentSimulating(false);
    }
  };
// Remove unused client-side SDK initialization
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const saveChatMessage = async (chatId: string, newMessage: any, lastMessageText: string) => {
    const chatPath = `support_chats/${chatId}`;
    const chatRef = doc(db, "support_chats", chatId);
    try {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userId: chatId,
          userName: userProfile?.displayName || "Guest",
          lastMessage: lastMessageText,
          lastMessageAt: new Date().toISOString(),
          unreadByAdmin: true,
          messages: [{
            ...newMessage,
            id: newMessage.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            reactions: newMessage.reactions || {}
          }],
        });
      } else {
        await updateDoc(chatRef, {
          messages: arrayUnion(newMessage),
          lastMessage: lastMessageText,
          lastMessageAt: new Date().toISOString(),
          unreadByAdmin: true,
        });
      }
    } catch (err: any) {
      console.error("Save chat message error:", err);
      handleFirestoreError(err, OperationType.WRITE, chatPath);
    }
  };
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (isQuotaExceeded) {
      toast.error("Quota exceeded, cannot save data at the moment.");
      return;
    }
    const userText = chatMessage;
    const chatId = user?.uid || sessionId;
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: userText,
      replyTo: chatReplyingTo ? (chatReplyingTo.text || "Media") : null,
      senderId: chatId,
      senderName: userProfile?.displayName || "Customer",
      isAdmin: false,
      createdAt: new Date().toISOString(),
      reactions: {}
    };
    setChatMessage("");
    setChatReplyingTo(null);
    try {
      await saveChatMessage(chatId, newMessage, userText);
    } catch (err: any) {
      toast.error("মেসেজ পাঠাতে সমস্যা হয়েছে।");
      return;
    }
    try {
      if (!siteConfig?.isAiEnabled) {
        return; // Don't reply if AI is disabled
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText || "",
          chatHistory: (chatMessages || []).slice(-10).map((m: any) => ({
            role: m.isAdmin ? "assistant" : "user",
            content: m.text || ""
          }))
        })
      });
      
      const data = await response.json();
      const aiResponseText = data.reply || data.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে আমাদের হেল্পলাইনে যোগাযোগ করুন।";
      
      const aiMessage = {
        id: "ai_" + Date.now().toString(),
        text: aiResponseText,
        senderId: "ai_assistant",
        senderName: "i SHOP BD AI",
        isAdmin: true,
        createdAt: new Date().toISOString(),
        reactions: {}
      };
      const chatRef = doc(db, "support_chats", chatId);
      try {
        await updateDoc(chatRef, {
          messages: arrayUnion(aiMessage),
          lastMessage: aiResponseText,
          lastMessageAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Gemini AI Firestore update error:", err);
        handleFirestoreError(err, OperationType.UPDATE, `support_chats/${chatId}`);
      }
    } catch (err: any) {
      console.error("Gemini AI generation error:", err);
    }
  };
  const selectChat = async (chat: any) => {
    setSelectedChat(chat);
    if (chat.unreadByAdmin) {
      try {
        const chatRef = doc(db, "support_chats", chat.id);
        await updateDoc(chatRef, { unreadByAdmin: false });
      } catch (err) {
        console.error("Error clearing unread flag:", err);
        handleFirestoreError(err, OperationType.UPDATE, `support_chats/${chat.id}`);
      }
    }
  };
  const handleAdminReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedChat) return;
    const replyText = replyMessage;
    const chatRef = doc(db, "support_chats", selectedChat.id);
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: replyText,
      replyTo: adminReplyingTo ? (adminReplyingTo.text || "Media") : null,
      senderId: user?.uid,
      senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      reactions: {}
    };
    setReplyMessage("");
    setAdminReplyingTo(null);
    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        lastMessage: replyText,
        lastMessageAt: new Date().toISOString(),
        unreadByUser: true,
        unreadByAdmin: false,
      });
    } catch (err) {
      console.error("Admin reply error:", err);
    }
  };
  const handleToggleReaction = async (chatId: string, msgIndex: number, reaction: "love" | "like") => {
    try {
      const chatRef = doc(db, "support_chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) return;
      const data = chatDoc.data();
      const messages = [...(data.messages || [])];
      
      if (!messages[msgIndex]) return;
      const msg = { ...messages[msgIndex] };
      if (!msg.reactions) msg.reactions = {};
      
      msg.reactions[reaction] = !msg.reactions[reaction];
      messages[msgIndex] = msg;
      await updateDoc(chatRef, { messages });
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };
  const handleVoiceToggle = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        // Stop all tracks to release microphone
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        
        // Check for supported mime types for better cross-browser compatibility
        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
          "audio/aac"
        ];
        const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
        
        const recorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : {});
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = async () => {
          if (chunks.length === 0) return;
          
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            const chatId = user?.uid || sessionId;
            const newMessage = {
              audio: base64Audio,
              senderId: chatId,
              senderName: userProfile?.displayName || "Customer",
              isAdmin: false,
              createdAt: new Date().toISOString(),
            };
            await saveChatMessage(chatId, newMessage, "ভয়েস মেসেজ (Voice Message)");
            const aiMessage = {
              text: "আপনার ভয়েস মেসেজ পাওয়া গেছে। আমরা শীঘ্রই এটি শুনে আপনার সাথে যোগাযোগ করব।",
              senderId: "ai_assistant",
              senderName: "i SHOP BD AI",
              isAdmin: true,
              createdAt: new Date().toISOString(),
            };
            const chatRef = doc(db, "support_chats", chatId);
            await updateDoc(chatRef, {
              messages: arrayUnion(aiMessage),
            });
          };
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      }
    }
  };
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Max 200KB for chat images
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await compressImageFile(file, options);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        
        const chatId = user?.uid || sessionId;
        const newMessage = {
          image: url,
          senderId: chatId,
          senderName: userProfile?.displayName || "Customer",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        };
        await saveChatMessage(chatId, newMessage, "Image Message");
        const aiMessage = {
          text: "আপনার ছবি পাওয়া গেছে। আমাদের টিম শীঘ্রই এটি রিভিউ করে আপনার সাথে যোগাযোগ করবে।",
          senderId: "ai_assistant",
          senderName: "i SHOP BD AI",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        };
        const chatRef = doc(db, "support_chats", chatId);
        await updateDoc(chatRef, {
          messages: arrayUnion(aiMessage),
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Chat image compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const handleAdminVoiceToggle = async () => {
    if (isAdminRecording && adminMediaRecorder) {
      adminMediaRecorder.stop();
      setIsAdminRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg"];
        const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : {});
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = async () => {
          if (chunks.length === 0) return;
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            if (!selectedChat) return;
            const chatRef = doc(db, "support_chats", selectedChat.id);
            const newMessage = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              audio: base64Audio,
              senderId: user?.uid,
              senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
              isAdmin: true,
              createdAt: new Date().toISOString(),
              reactions: {}
            };
            await updateDoc(chatRef, {
              messages: arrayUnion(newMessage),
              lastMessage: "Voice Message",
              lastMessageAt: new Date().toISOString(),
              unreadByUser: true
            });
          };
        };
        recorder.start();
        setAdminMediaRecorder(recorder);
        setIsAdminRecording(true);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("মাইক্রোফোনের এক্সেস পাওয়া যায়নি!");
      }
    }
  };
  const handleAdminChatImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await compressImageFile(file, options);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        const chatRef = doc(db, "support_chats", selectedChat.id);
        const newMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          image: url,
          senderId: user?.uid,
          senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          reactions: {}
        };
        await updateDoc(chatRef, {
          messages: arrayUnion(newMessage),
          lastMessage: "Image Message",
          lastMessageAt: new Date().toISOString(),
          unreadByUser: true
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Chat image compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const simulatePayment = () => {
    setIsPaymentSimulating(true);
    // Simulate payment processing time
    setTimeout(() => {
      const prefix = paymentMethod === "bkash" ? "BK" : 
                     paymentMethod === "nagad" ? "NG" : 
                     paymentMethod === "rocket" ? "RK" : "BN";
      const randomId = prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
      setTransId(randomId);
      setIsPaymentSimulating(false);
      const name = paymentMethod === "bkash" ? "বিকাশ" :
                   paymentMethod === "nagad" ? "নগদ" :
                   paymentMethod === "rocket" ? "রকেট" : "ব্যাংক";
      alert(
        `${name} পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!`,
      );
    }, 2000);
  };
  const handleBuyNow = useCallback((product: Product, color?: string, size?: string, quantity: number = 1, wholesaleSizes?: Record<string, number>) => {
    // If no color provided, try getting first default
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const selectedColor =
      color ||
      (firstVariant ? firstVariant.name : (product.colors && product.colors.length > 0 ? product.colors[0] : undefined));
    
    const itemsToAdd: any[] = [];
    if (wholesaleSizes && Object.keys(wholesaleSizes).length > 0) {
      Object.entries(wholesaleSizes).forEach(([s, q]) => {
        if (q > 0) {
          itemsToAdd.push({ product, quantity: q, color: selectedColor, size: s });
          addToCartInternal(product, selectedColor, s, q); // Auto add to cart!
        }
      });
    } else {
       const selectedSize = size || (firstVariant ? firstVariant.size : undefined);
       itemsToAdd.push({ product, quantity, color: selectedColor, size: selectedSize });
       addToCartInternal(product, selectedColor, selectedSize, quantity); // Auto add to cart!
    }
    
    setCheckoutItems(itemsToAdd);
    setIsProductDetailsOpen(false); // Close details modal when checking out
    setIsCheckoutOpen(true);
    detectLocation();
  }, [detectLocation, setIsProductDetailsOpen, addToCartInternal]);
  const openCartCheckout = () => {
    if (cartItems.length === 0) {
      alert("শপিং কার্ট খালি রয়েছে।");
      return;
    }
    setIsCartDrawerOpen(true);
  };
  const handleMultiOrderInitiate = () => {
    setIsMultiOrderSelectionOpen(true);
  };
  const proceedToCheckoutFromMulti = () => {
    if (cartItems.length === 0) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    setCheckoutItems([...cartItems]);
    setIsMultiOrderSelectionOpen(false);
    setIsCheckoutOpen(true);
    detectLocation();
  };
  // Helper to calculate tiered price
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProductDetailsOpen && selectedProduct && !userInteractedWithGallery) {
      const allImages = [
        selectedProduct.image,
        ...(selectedProduct.images || []),
        ...(selectedProduct.variants || []).map((v) => v.image).filter(Boolean),
      ].filter((v, i, a) => a.indexOf(v) === i);
      if (allImages.length > 1) {
        interval = setInterval(() => {
          setModalDisplayImage(prev => {
            const currentImg = prev || selectedProduct.image;
            const currentIdx = allImages.indexOf(currentImg);
            const nextIdx = (currentIdx + 1) % allImages.length;
            return allImages[nextIdx];
          });
        }, 4000);
      }
    }
    return () => clearInterval(interval);
  }, [
    isProductDetailsOpen,
    selectedProduct?.id, // Only restart if product changes
    userInteractedWithGallery
  ]);
  const handleReviewImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (reviewForm.images.length + files.length > 5) {
      alert("You can upload a maximum of 5 photos.");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const options = {
          maxSizeMB: 0.08,
          maxWidthOrHeight: 600,
          useWebWorker: true,
        };
        const compressedFile = await compressImageFile(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setReviewForm((prev) => ({
            ...prev,
            images: [...prev.images, dataUrl],
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Review image compression error:", error);
      }
    }
  };
  const handleFacebookLoginForReview = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err) {
      console.error("Facebook login failed", err);
      alert("Failed to log in with Facebook. Please try again.");
    }
  };
  const submitReview = async (productId: string) => {
    const targetProdId = String(productId || selectedProduct?.id || "").trim();
    if (!targetProdId) {
      toast.error("Product information missing. Please refresh and try again.");
      return;
    }

    const finalUserName = user
      ? user.displayName || user.email?.split('@')[0] || "Verified Customer"
      : reviewForm.guestName?.trim() || "Customer";
      
    setIsSubmittingReview(true);
    try {
      const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newReview: Review = {
        id: reviewId,
        productId: targetProdId,
        productName: selectedProduct?.name || "Product",
        userId: user
          ? user.uid
          : `guest_${Math.random().toString(36).substr(2, 6)}`,
        userName: finalUserName,
        userPhoto: user ? user.photoURL || null : null,
        rating: Math.min(5, Math.max(1, Number(reviewForm.rating) || 5)),
        comment: reviewForm.comment?.trim() || "",
        images: reviewForm.images || [],
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      let submitted = false;

      // 1. Try Backend API via Firebase Admin SDK
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: targetProdId, review: newReview }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            submitted = true;
          }
        }
      } catch (apiErr) {
        console.warn("Backend /api/reviews unreachable, trying direct Firestore...", apiErr);
      }

      // 2. Fallback to direct client Firestore if API was not reachable
      if (!submitted) {
        try {
          const reviewRef = doc(db, "products", targetProdId, "reviews", reviewId);
          await setDoc(reviewRef, newReview);
          submitted = true;
        } catch (clientErr) {
          console.warn("Client firestore review save error:", clientErr);
        }
      }

      // Add to adminReviews state if admin panel is active
      setAdminReviews((prev) => [newReview, ...prev.filter(r => r.id !== reviewId)]);

      setReviewForm({ rating: 5, comment: "", images: [], guestName: "" });
      toast.success("Review submitted! It will appear once approved by admin.");
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const fetchAdminReviews = useCallback(async () => {
    setIsAdminReviewsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setAdminReviews(data.reviews);
          setIsAdminReviewsLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn("API admin reviews fetch warning, trying client Firestore:", apiErr);
    }

    try {
      const groupSnap = await getDocs(query(collectionGroup(db, "reviews"), limit(200)));
      const reviewsList: Review[] = groupSnap.docs.map(docSnap => {
        const d = docSnap.data();
        const pId = d.productId || docSnap.ref.parent.parent?.id || "";
        return {
          id: docSnap.id,
          productId: pId,
          productName: d.productName || "",
          productImage: d.productImage || "",
          userId: d.userId || "",
          userName: d.userName || d.name || "Customer",
          userPhoto: d.userPhoto || null,
          rating: Number(d.rating) || 5,
          comment: d.comment || "",
          images: Array.isArray(d.images) ? d.images : [],
          status: (d.status as 'pending' | 'approved' | 'rejected') || 'approved',
          createdAt: d.createdAt?.toDate 
            ? d.createdAt.toDate().toISOString() 
            : typeof d.createdAt === 'string' 
            ? d.createdAt 
            : new Date().toISOString()
        };
      });
      reviewsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAdminReviews(reviewsList);
    } catch (err) {
      console.error("Firestore admin reviews query error:", err);
    } finally {
      setIsAdminReviewsLoading(false);
    }
  }, []);

  const handleApproveReview = async (productId: string, reviewId: string) => {
    try {
      let updated = false;
      try {
        const res = await fetch("/api/admin/reviews/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, reviewId, status: "approved" })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            updated = true;
          }
        }
      } catch (e) {}

      if (!updated && productId && reviewId) {
        const reviewRef = doc(db, "products", productId, "reviews", reviewId);
        await updateDoc(reviewRef, { status: "approved", updatedAt: serverTimestamp() });
      }

      setAdminReviews((prev) => prev.map(r => r.id === reviewId ? { ...r, status: "approved" } : r));
      setActiveReviews((prev) => prev.map(r => r.id === reviewId ? { ...r, status: "approved" } : r));
      toast.success("Review approved successfully!");
    } catch (err: any) {
      console.error("Failed to approve review:", err);
      toast.error("Failed to approve review.");
    }
  };

  const handleRejectReview = async (productId: string, reviewId: string) => {
    try {
      let updated = false;
      try {
        const res = await fetch("/api/admin/reviews/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, reviewId, status: "rejected" })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            updated = true;
          }
        }
      } catch (e) {}

      if (!updated && productId && reviewId) {
        const reviewRef = doc(db, "products", productId, "reviews", reviewId);
        await updateDoc(reviewRef, { status: "rejected", updatedAt: serverTimestamp() });
      }

      setAdminReviews((prev) => prev.map(r => r.id === reviewId ? { ...r, status: "rejected" } : r));
      setActiveReviews((prev) => prev.filter(r => r.id !== reviewId));
      toast.success("Review rejected.");
    } catch (err: any) {
      console.error("Failed to reject review:", err);
      toast.error("Failed to reject review.");
    }
  };

  const handleDeleteReviewAdmin = async (productId: string, reviewId: string) => {
    try {
      let deleted = false;
      try {
        const res = await fetch("/api/admin/reviews", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, reviewId })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            deleted = true;
          }
        }
      } catch (e) {}

      if (!deleted && productId && reviewId) {
        const reviewRef = doc(db, "products", productId, "reviews", reviewId);
        await deleteDoc(reviewRef);
      }

      setAdminReviews((prev) => prev.filter(r => r.id !== reviewId));
      setActiveReviews((prev) => prev.filter(r => r.id !== reviewId));
      toast.success("Review deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      toast.error("Failed to delete review.");
    }
  };

  useEffect(() => {
    if (isAdmin && isAdminOpen) {
      fetchAdminReviews();
    }
  }, [isAdmin, isAdminOpen, fetchAdminReviews]);

  const [reviewUnsub, setReviewUnsub] = useState<(() => void) | null>(null);
  const fetchReviews = (productId: string) => {
    if (!productId) {
      setActiveReviews([]);
      setIsReviewsLoading(false);
      return;
    }
    if (reviewUnsub) {
      try {
        reviewUnsub();
      } catch (e) {}
      setReviewUnsub(null);
    }

    // Preserve initial reviews if already attached to selectedProduct
    if (selectedProduct && selectedProduct.id === productId && Array.isArray(selectedProduct.reviews) && selectedProduct.reviews.length > 0) {
      setActiveReviews(selectedProduct.reviews);
      setIsReviewsLoading(false);
    } else {
      setActiveReviews([]);
      setIsReviewsLoading(true);
    }

    // Safety timeout: Ensure loading state never hangs indefinitely (e.g. Firebase offline/slow on localhost)
    const timeoutId = setTimeout(() => {
      setIsReviewsLoading(false);
    }, 2500);

    // 1. Fetch via REST API fallback for instant resolution
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.reviews)) {
          if (data.reviews.length > 0) {
            setActiveReviews(data.reviews);
          }
          setIsReviewsLoading(false);
          clearTimeout(timeoutId);
        }
      })
      .catch((err) => {
        console.warn("API reviews fetch warning:", err);
      });

    // 2. Realtime listener via client Firestore if available
    if (!isQuotaExceeded) {
      try {
        const q = query(
          collection(db, "products", productId, "reviews"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const unsub = onSnapshot(
          q,
          (snapshot) => {
            clearTimeout(timeoutId);
            const reviews = snapshot.docs.map((docSnap) => {
              const d = docSnap.data();
              return {
                id: docSnap.id,
                userId: d.userId || "",
                userName: d.userName || d.name || "Customer",
                userPhoto: d.userPhoto || null,
                rating: Number(d.rating) || 5,
                comment: d.comment || "",
                images: Array.isArray(d.images) ? d.images : [],
                status: (d.status as 'pending' | 'approved' | 'rejected') || 'approved',
                createdAt: d.createdAt?.toDate
                  ? d.createdAt.toDate().toISOString()
                  : typeof d.createdAt === "string"
                  ? d.createdAt
                  : d.createdAt?.seconds
                  ? new Date(d.createdAt.seconds * 1000).toISOString()
                  : new Date().toISOString(),
              } as Review;
            });
            setActiveReviews(reviews);
            setIsReviewsLoading(false);
          },
          (err: any) => {
            console.error("Failed to sync reviews", err);
            setIsReviewsLoading(false);
            if (err.code === "resource-exhausted" || err.message === "QUOTA_EXCEEDED") {
              setIsQuotaExceeded(true);
            }
          }
        );
        setReviewUnsub(() => unsub);
      } catch (e) {
        console.error("Firestore onSnapshot error:", e);
        setIsReviewsLoading(false);
      }
    }
  };
  useEffect(() => {
    if (selectedProduct?.id) {
      fetchReviews(selectedProduct.id);
    } else {
      setActiveReviews([]);
      setIsReviewsLoading(false);
    }
  }, [selectedProduct?.id]);
  const openProductDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setTempSelectedQty(1);
    setModalDisplayImage(product.image);
    
    setTempSelectedColor(null);
    setTempSelectedSize(null);
    setColorValError(false);
    setSizeValError(false);
    setUserInteractedWithGallery(false);
    setIsDescriptionExpanded(false);
    setIsProductDetailsOpen(true);
    setIsCheckoutOpen(false); // Close checkout to show product details!
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [setIsCheckoutOpen]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Automated Deep Link & Facebook/Social URL Product Resolver
  // Whenever `products` finishes loading or changes, if the URL
  // points to a specific product (/product/:slug, /p/:id, ?p=...),
  // seamlessly open that product modal/details page.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const hasResolvedInitialUrlRef = useRef(false);

  useEffect(() => {
    if (!products || products.length === 0) return;
    if (hasResolvedInitialUrlRef.current) return;

    const targetIdOrSlug = getProductIdFromUrl();
    if (!targetIdOrSlug) {
      hasResolvedInitialUrlRef.current = true;
      return;
    }

    const isCheckout = new URLSearchParams(window.location.search).get("checkout") === "true";
    if (isCheckout) {
      hasResolvedInitialUrlRef.current = true;
      return;
    }

    const matched = findProductBySlugOrId(products, targetIdOrSlug);
    if (matched && !matched.deleted && (isAdmin || isMasterAdmin || matched.isPublished !== false)) {
      openProductDetails(matched);
    }
    hasResolvedInitialUrlRef.current = true;
  }, [products, openProductDetails, isAdmin, isMasterAdmin]);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code!");
      return;
    }
    // Default to ISHOPBD5 if config not loaded
    const VALID_CODE = siteConfig?.couponCode || "ISHOPBD5";
    if (code === VALID_CODE) {
      setAppliedCoupon(VALID_CODE);
      setCouponError("");
      setCouponCode(""); 
      toast.success("Verification successful.");
    } else {
      setCouponError("Invalid coupon code!");
      setAppliedCoupon(null);
      toast.error("Invalid coupon code!");
    }
  };
  const handleWhatsAppOrder = () => {
    const whatsappNumber = siteConfig?.whatsappNumber || "8801777600844";
    const shopName = "i SHOP BD";
let message = `আসসালামু আলাইকুম, আমি ${shopName} থেকে এই পণ্যগুলো অর্ডার করতে চাই:\n\n`;
    
    checkoutItems.forEach((item, idx) => {
      message += `${idx + 1}. পণ্য: ${item.product.name}\n`;
      if (item.color && item.color !== "N/A") message += `   কালার: ${item.color}\n`;
      if (item.size && item.size !== "N/A") message += `   সাইজ: ${item.size}\n`;
      message += `   পরিমাণ: ${item.quantity}\n`;
      message += `   মূল্য: ৳${item.product.price * item.quantity}\n\n`;
    });
    const subtotal = checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
    const delivery = getDeliveryCharge(checkoutItems, deliveryArea, appliedCoupon);
    const total = subtotal + (appliedCoupon ? 0 : delivery);
    message += `Subtotal: ৳${subtotal}\n`;
    message += `ডেলিভারি চার্জ: ৳${delivery}${appliedCoupon ? ' (ফ্রি)' : ''}\n`;
    message += `সর্বমোট: ৳${total}\n\n`;
    message += `
: ${window.location.origin}`;
    const encodedMessage = encodeURIComponent(message);
    try {
      trackContact("whatsapp", total);
    } catch {}
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };
  const handleLandingCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!landingProduct) return;
    if (isQuotaExceeded) {
      toast.error("Quota exceeded, orders are temporarily disabled.");
      return;
    }
    
    const phone = landingPhone.trim();
    const name = landingName.trim();
    const address = landingAddress.trim();
    
    if (!name) {
      toast.error("Please enter your name.");
      return;
    }
    if (!phone || phone.length < 11) {
      toast.error("Please enter a valid 11-digit mobile number.");
      return;
    }
    if (!landingDistrict) {
      toast.error("Please select your district.");
      return;
    }
    if (!landingThana) {
      toast.error("Please select your upazila/thana.");
      return;
    }
    if (!address) {
      toast.error("Please enter your complete address.");
      return;
    }
    setIsLandingSubmitting(true);
    try {
      const orderId = "ORD-" + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
      const deliveryCharge = getDeliveryCharge([{product: landingProduct, quantity: 1}], landingArea, null);
      const lCfg = (landingProduct as any).landingConfig || {};
      const lPackages = lCfg.packages || [];
      let subtotal = lCfg.priceOverride ? Number(lCfg.priceOverride) : Number(landingProduct.price || 0);
      let pkgName = "";
      if (lPackages.length > 0) {
        const idx = landingPackageIndex < lPackages.length ? landingPackageIndex : 0;
        if (lPackages[idx] && lPackages[idx].price) {
          subtotal = Number(lPackages[idx].price);
          pkgName = ` (${lPackages[idx].weight})`;
        }
      }
      const total = subtotal + deliveryCharge;
      const finalAddress = `${address}, ${landingThana}, ${landingDistrict}`;
      const orderData = {
        orderId,
        shortId: String(orderId).slice(-6).toUpperCase(),
        customerName: name,
        customerPhone: phone,
        address: finalAddress,
        paymentMethod: "cod",
        deliveryCharge,
        deliveryArea: landingArea,
        subtotal,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleString("bn-BD"),
        items: [
          {
            product: {
              id: landingProduct.id,
              name: landingProduct.name + pkgName,
              smsName: (landingProduct.smsName || '').trim(),
              price: subtotal,
              image: landingProduct.image || ""
            },
            smsName: (landingProduct.smsName || '').trim(),
            quantity: 1
          }
        ],
        customerEmail: user?.email || "",
        district: landingDistrict,
        userId: user?.uid || "guest",
        attribution: getStoredAttribution(),
        trackingSignals: getOrderTrackingSignals(),
        purchaseTracked: false,
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      notifyAdminsOnNewOrder(docRef.id, total);

      try {
        axios.post("/api/confirm-order", orderData).catch(() => {});
      } catch {}

      try {
        const landingItems = [
          {
            id: landingProduct.id,
            name: landingProduct.name + pkgName,
            price: subtotal,
            quantity: 1,
            category: landingProduct.category,
            brand: landingProduct.brand,
          },
        ];
        trackInitiateCheckout(landingItems, subtotal);

      } catch {}
      
      // Send automated confirmation SMS to customer's phone
      try {
        const directSms = (landingProduct.smsName || '').trim();
        const productNames = directSms ? directSms : ((landingProduct.name || '').trim().length > 25 ? (landingProduct.name || '').trim().substring(0, 25) + '...' : (landingProduct.name || '').trim());
        const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.com ধন্যবাদ!`;
        fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone, message }),
        }).catch(err => console.warn("Auto SMS failed:", err));
      } catch(e) {
        console.warn("SMS sending error:", e);
      }
      
      setCompletedOrderReceipt({
        ...orderData,
        id: docRef.id
      });
      // Save phone profile in local storage for future autofills
      try {
        savePhoneProfile(phone, name, address, landingDistrict, landingThana, landingArea);
      } catch (e) {
        console.warn("Failed to save phone profile:", e);
      }
      setLandingName("");
      setLandingPhone("");
      setLandingAddress("");
      setLandingDistrict("");
      setLandingThana("");
      setLandingDistrictSearch("");
      setLandingThanaSearch("");
      
      toast.success("Your order has been completed successfully!");
    } catch (err: any) {
      console.error("Landing page checkout failed", err);
      toast.error("Problem completing order: " + (err.message || String(err)));
    } finally {
      setIsLandingSubmitting(false);
    }
  };
  const savePhoneProfile = (phone: string, name: string, address: string, district?: string, thana?: string, area?: string) => {
    if (!phone || phone.trim().length < 11) return;
    try {
      const saved = localStorage.getItem("ishopbd_saved_profiles");
      let profiles: any[] = saved ? JSON.parse(saved) : [];
      profiles = profiles.filter(p => p.phone !== phone.trim());
      profiles.unshift({
        phone: phone.trim(),
        name: name.trim(),
        address: address.trim(),
        district: district || "",
        thana: thana || "",
        area: area || "",
        timestamp: Date.now()
      });
      if (profiles.length > 10) profiles.pop();
      localStorage.setItem("ishopbd_saved_profiles", JSON.stringify(profiles));
      setSavedProfiles(profiles);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };
  const selectSavedProfile = (profile: any, type: 'inline' | 'checkout' | 'landing') => {
    if (type === 'inline') {
      setInlineOrderPhone(profile.phone);
      if (profile.name) setInlineOrderName(profile.name);
      if (profile.district) setInlineOrderDistrict(profile.district);
      if (profile.thana) setInlineOrderThana(profile.thana);
      if (profile.address) setInlineOrderAddress(profile.address);
      if (profile.area) setInlineOrderArea(profile.area);
    } else if (type === 'checkout') {
      setCheckoutPhone(profile.phone);
      if (profile.name) setCheckoutName(profile.name);
      if (profile.address) setCheckoutAddress(profile.address);
      if (profile.area) setDeliveryArea(profile.area);
    } else {
      setLandingPhone(profile.phone);
      if (profile.name) setLandingName(profile.name);
      if (profile.district) setLandingDistrict(profile.district);
      if (profile.thana) setLandingThana(profile.thana);
      if (profile.address) setLandingAddress(profile.address);
      if (profile.area) setLandingArea(profile.area);
      setLandingPhoneFocused(false);
    }
  };
  const validateSelections = (): boolean => {
    if (!selectedProduct) return false;
    const hasColors = (selectedProduct.variants && selectedProduct.variants.length > 0 && 
      Array.from(new Set(selectedProduct.variants.map(v => v.name || ""))).filter(c => c !== "").length > 0) ||
      (selectedProduct.colors && selectedProduct.colors.length > 0);
    if (hasColors && !tempSelectedColor) {
      toast.error("Please select a color.");
      setColorValError(true);
      const colorElement = document.getElementById("color-selection-area");
      if (colorElement) {
        colorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    const availableVariants = selectedProduct.variants || [];
    const filteredByColor = tempSelectedColor 
      ? availableVariants.filter(v => (v.name || "").trim().toLowerCase() === tempSelectedColor.trim().toLowerCase())
      : availableVariants;
    
    const hasSizes = filteredByColor.some(v => v.size && v.size.trim() !== "");
    if (hasSizes && !tempSelectedSize) {
      toast.error("Please select a size.");
      setSizeValError(true);
      const sizeElement = document.getElementById("size-selection-area");
      if (sizeElement) {
        sizeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  };
  const deleteOrder = async (orderOrId: any) => {
    const id = typeof orderOrId === "object" ? (orderOrId?.id || orderOrId?._id) : orderOrId;
    if (!id) return;
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি রিসাইকেল বিনে পাঠাতে চান?");
    if (!conf) return;
    try {
      setOrderHistory((prev) => prev.map((o) => String(o.id) === String(id) ? { ...o, deleted: true, deletedAt: new Date().toISOString() } : o));
      await updateDoc(doc(db, "orders", String(id)), {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
      toast.success("অর্ডারটি রিসাইকেল বিনে পাঠানো হয়েছে।");
    } catch (err: any) {
      alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const restoreOrder = async (orderOrId: any) => {
    const id = typeof orderOrId === "object" ? (orderOrId?.id || orderOrId?._id) : orderOrId;
    if (!id) return;
    try {
      setOrderHistory((prev) => prev.map((o) => String(o.id) === String(id) ? { ...o, deleted: false, deletedAt: null } : o));
      await updateDoc(doc(db, "orders", String(id)), {
        deleted: false,
        deletedAt: null
      });
      toast.success("অর্ডারটি সফলভাবে পুনরুদ্ধার করা হয়েছে।");
    } catch (err: any) {
      alert("অর্ডার পুনরুদ্ধার করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const permanentDeleteOrder = async (orderOrId: any) => {
    const id = typeof orderOrId === "object" ? (orderOrId?.id || orderOrId?._id) : orderOrId;
    if (!id) return;
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি চিরতরে ডিলিট করতে চান? এই কাজ আর ফেরত নেওয়া যাবে না।");
    if (!conf) return;
    try {
      setOrderHistory((prev) => prev.filter((o) => String(o.id) !== String(id)));
      await deleteDoc(doc(db, "orders", String(id)));
      toast.success("অর্ডারটি চিরতরে ডিলিট করা হয়েছে।");
    } catch (err: any) {
      alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };
  const deleteReview = async (productId: any, reviewId: any) => {
    if (!productId || !reviewId) return;
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই রিভিউটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "products", String(productId), "reviews", String(reviewId)));
        setActiveReviews((prev) => prev.filter((r) => String(r.id) !== String(reviewId)));
        alert("রিভিউটি ডিলিট করা হয়েছে।");
      } catch (err: any) {
        alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message);
      }
    }
  };
  const sendConfirmationSMS = async (order: any) => {
    if (!order.customerPhone) {
      toast.error("Please enter a coupon code!");
      return;
    }
    if (siteConfig?.isSmsConfirmEnabled === false) {
      toast.error("SMS সিস্টেম বন্ধ আছে। সেটিংস থেকে চেক করুন।");
      return;
    }
    const orderId = String(order.orderId || order.id).slice(-6).toUpperCase();
    
    let startPart = (siteConfig?.smsTemplateStart || '').trim() || 'প্রিয় গ্রাহক, আপনার অর্ডারটি অর্ডার হয়েছে?';
    const endPart = (siteConfig?.smsTemplateEnd || '').trim() || 'iShop BD ব্যবহার করুন জন্য ধন্যবাদ।';
    
    // Replace "" with actual name if available
    if (startPart.includes('') && order.customerName) {
      startPart = startPart.replace('', order.customerName);
    }
    // Format products
    let productDetails = '';
    if (order.items && order.items.length > 0) {
      productDetails = order.items.map((item: any) => {
        const directSms = (item.smsName || item.product?.smsName || '').trim();
        const name = directSms ? directSms : ((item.product?.name || item.name || 'Product').trim().length > 25 ? (item.product?.name || item.name || 'Product').trim().substring(0, 25) + '...' : (item.product?.name || item.name || 'Product').trim());
        const qty = item.quantity || 1;
        return `   ${name} (${qty} টি)`;
      }).join('\n');
    }
    const message = `${startPart}\nপণ্য:\n${productDetails}\nঅর্ডার নং: #${orderId}\nমোট বিল: ৳${order.total}\n${endPart}`;
    
    const toastId = toast.loading(`SMS পাঠানো হচ্ছে ${order.customerPhone} তে...`);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: order.customerPhone,
          message: message,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`SMS সফলভাবে পাঠানো হয়েছে! (${order.customerPhone})`, { id: toastId });
      } else {
        toast.error("Please enter a valid number.");
        console.warn("SMS sending failed:", data);
      }
    } catch (error) {
      toast.error("SMS API-তে সংযোগ করা যাচ্ছে না।");
      console.error("Error calling SMS API:", error);
    }
  };
  const handleRequestRefund = async () => {
    if (!selectedOrderForRefund || !refundReason.trim()) return;
    if (isQuotaExceeded) {
      toast.error("Quota exceeded, cannot save data at the moment.");
      return;
    }
    setIsSubmittingRefund(true);
    try {
      const refundData = {
        orderId: selectedOrderForRefund.id,
        userId: user.uid,
        userName: userProfile?.displayName || user.email,
        userEmail: user.email,
        reason: refundReason,
        amount: selectedOrderForRefund.total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "refund_requests"), refundData);
      
      alert("ইমেজ প্রয়োজন!");
      setSelectedOrderForRefund(null);
      setRefundReason("");
      setProfileTab("refunds");
    } catch (err) {
      console.error("Refund request error:", err);
      alert("রিফান্ড রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmittingRefund(false);
    }
  };
  const handleApproveRefund = async (refund: any) => {
    if (!window.confirm("আপনি কি এই রিফান্ড রিকোয়েস্টটি অ্যাপ্রুভ করতে চান? এটি ইউজারের ব্যালেন্সে টাকা যোগ করে দেবে।")) return;
    try {
      const userRef = doc(db, "users", refund.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      
      const currentBalance = userSnap.data().balance || 0;
      const newBalance = currentBalance + refund.amount;
      
      await updateDoc(userRef, { balance: newBalance });
      await updateDoc(doc(db, "refund_requests", refund.id), { status: "approved", updatedAt: new Date().toISOString() });
      
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: refund.userId,
        amount: refund.amount,
        type: "refund",
        description: `রিফান্ড অ্যাপ্রুভড (অর্ডার #${refund.orderId})`,
        createdAt: new Date().toISOString(),
      });
      
      alert("রিফান্ড সফলভাবে অ্যাপ্রুভ করা হয়েছে।");
    } catch (err) {
      console.error("Approve refund error:", err);
    }
  };
  
    
    const handlePrintInvoice = (order: any) => printOrderInvoice(order);
const handleSaveQuickEdit = async () => {
      if (!quickEditOrderId) return;
      try {
        const updated = orderHistory.map((o) =>
          o.id === quickEditOrderId ? { 
            ...o, 
            customerName: quickEditData.customerName, 
            customerPhone: quickEditData.customerPhone,
            address: quickEditData.address
          } : o
        );
        setOrderHistory(updated);
        try {
          localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save orders to localStorage:", e);
        }
        
        const orderRef = doc(db, "orders", quickEditOrderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          await updateDoc(orderRef, {
            customerName: quickEditData.customerName,
            customerPhone: quickEditData.customerPhone,
            address: quickEditData.address
          });
        }
        toast.success("Order info updated!");
        setQuickEditOrderId(null);
      } catch (err) {
        console.error("Quick edit error:", err);
        toast.error("Failed to update info");
      }
    };
    const handleCompleteIncompleteOrder = async (
      incompleteOrder: any,
      payload: CompleteIncompleteOrderPayload,
    ) => {
      const orderId = Date.now().toString();
      const shortId = String(orderId).slice(-6).toUpperCase();
      const isPreOrder = payload.items.some((item) => Boolean(item.isComingSoon || item.product?.isComingSoon));
      const newOrder: any = {
        orderId,
        shortId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        address: payload.address,
        deliveryArea: payload.deliveryArea,
        deliveryCharge: payload.deliveryCharge,
        discount: payload.discount,
        subtotal: payload.subtotal,
        total: payload.total,
        codAmount: payload.total,
        paymentMethod: payload.paymentMethod,
        transId: payload.paymentMethod !== "cod" ? (payload.transId || "N/A") : "N/A",
        note: payload.note,
        isPreOrder,
        items: payload.items.map((item) => {
          const currentProd = products.find((p) => p.id === item.productId) || item.product;
          const directSmsName = String(item.smsName || currentProd?.smsName || "").trim();
          return {
            product: {
              id: item.productId || currentProd?.id || `custom_${orderId}`,
              name: item.name,
              smsName: directSmsName,
              price: item.unitPrice,
              buyingPrice: item.buyingPrice || currentProd?.buyingPrice || 0,
              image: item.image || currentProd?.image || "",
              colors: currentProd?.colors || [],
              sizes: (currentProd as any)?.sizes || [],
              variants: currentProd?.variants || [],
              isComingSoon: Boolean(item.isComingSoon || currentProd?.isComingSoon),
            },
            smsName: directSmsName,
            price: item.unitPrice,
            quantity: item.quantity,
            color: item.color ? item.color : undefined,
            size: item.size ? item.size : undefined,
          };
        }),
        date: new Date().toLocaleString("bn-BD"),
        status: payload.status || "pending",
        createdAt: serverTimestamp(),
        customerEmail: incompleteOrder?.customerEmail || incompleteOrder?.email || "",
        district: payload.district || incompleteOrder?.district || "",
        userId: incompleteOrder?.userId || "guest",
        source: "incomplete_order_recovered",
        recoveredFromIncompleteId: incompleteOrder?.id || null,
        purchaseTracked: payload.status === "confirmed",
      };

      const stockPromises = payload.items
        .filter((item) => Boolean(item.productId) && products.some((p) => p.id === item.productId))
        .map((item) => {
          const currentProd = products.find((p) => p.id === item.productId)!;
          const reqQty = Math.max(1, Number(item.quantity) || 1);
          const updatePayload: any = {
            salesCount: increment(reqQty),
          };
          if (Array.isArray(currentProd.variants) && currentProd.variants.length > 0) {
            const updatedVariants = currentProd.variants.map((v: any) => {
              const isMatch = (!item.color || v.name === item.color) && (!item.size || v.size === item.size);
              if (isMatch) {
                return { ...v, stock: Math.max(0, (Number(v.stock) || 0) - reqQty) };
              }
              return v;
            });
            const newTotalStock = updatedVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
            updatePayload.variants = updatedVariants;
            updatePayload.stock = Math.max(0, newTotalStock);
          } else {
            const currentStock = Math.max(0, Number(currentProd.stock) || 0);
            updatePayload.stock = Math.max(0, currentStock - reqQty);
          }
          return updateDoc(doc(db, "products", currentProd.id), updatePayload).catch(() => {});
        });

      await Promise.all([
        setDoc(doc(db, "orders", orderId), newOrder),
        ...stockPromises,
      ]);

      if (incompleteOrder?.id) {
        await deleteDoc(doc(db, "incomplete_orders", incompleteOrder.id)).catch(() => {});
        setIncompleteOrders((prev) => prev.filter((item) => item.id !== incompleteOrder.id));
      }

      const localOrder = {
        ...newOrder,
        id: orderId,
        createdAt: new Date().toISOString(),
      };
      const updatedHistory = [localOrder, ...orderHistory];
      setOrderHistory(updatedHistory);
      try {
        localStorage.setItem("ishopbd_orders", JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("Failed to save orders to localStorage:", e);
      }

      try {
        axios.post("/api/confirm-order", newOrder).catch(() => {});
      } catch {}

      if (payload.status === "confirmed") {
        try {
          trackConfirmedOrderPurchase({
            orderId,
            total: newOrder.total,
            items: newOrder.items,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone,
            customerEmail: newOrder.customerEmail,
            district: newOrder.district,
            deliveryArea: newOrder.deliveryArea,
            userId: newOrder.userId,
          });
        } catch {}
      }

      if (payload.sendSms && newOrder.customerPhone) {
        try {
          const productNames = newOrder.items
            .map((i: any) => {
              const directSms = (i.smsName || i.product?.smsName || "").trim();
              if (directSms) return directSms;
              const fallback = (i.product?.name || i.name || "").trim();
              return fallback.length > 25 ? fallback.substring(0, 25) + "..." : fallback;
            })
            .filter(Boolean)
            .join(", ");
          const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে
${productNames}
অর্ডার নাম্বার: #${shortId}
মোট বিল: ৳${newOrder.total}
নতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.com ধন্যবাদ!`;
          fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: newOrder.customerPhone, message }),
          }).catch(() => {});
        } catch {}
      }

      toast.success(`অর্ডার #${shortId} সফলভাবে প্লেস হয়েছে!`);
    };
    const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    if (isQuotaExceeded) return;
    try {
      const isCancelledOrReturned = newStatus === "cancelled" || newStatus === "returned";
        const updated = orderHistory.map((o) =>
          o.id === orderId ? { 
            ...o, 
            status: newStatus, 
            isPreOrder: newStatus === "confirmed" ? false : o.isPreOrder,
            ...(isCancelledOrReturned && { paymentMethod: "N/A" })
          } : o,
        );
      setOrderHistory(updated);
      try {
        localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save orders to localStorage:", e);
      }
      // Firestore Update
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const updateData: any = { status: newStatus };
          if (newStatus === "confirmed") {
            updateData.isPreOrder = false;
          }
          if (newStatus === "cancelled" || newStatus === "returned") {
            updateData.paymentMethod = "N/A";
          }
          const orderData = orderSnap.data();
          const shouldTrackConfirmedPurchase =
            newStatus === "confirmed" &&
            !orderData?.purchaseTracked &&
            !orderData?.isOffline;
          if (shouldTrackConfirmedPurchase) {
            updateData.purchaseTracked = true;
            updateData.purchaseTrackedAt = serverTimestamp();
          }
          await updateDoc(orderRef, updateData);
        if (shouldTrackConfirmedPurchase && orderData) {
          try {
            trackConfirmedOrderPurchase({
              orderId: orderData.orderId || orderId,
              total: orderData.total,
              items: orderData.items,
              customerName: orderData.customerName,
              customerPhone: orderData.customerPhone,
              customerEmail: orderData.customerEmail,
              district: orderData.district,
              deliveryArea: orderData.deliveryArea,
              userId: orderData.userId,
              attribution: orderData.attribution,
              trackingSignals: orderData.trackingSignals,
            });
          } catch {}
        }
        const statusTextMapEn: Record<string, string> = {
          pending: "Pending",
          confirmed: "Confirmed",
          processing: "Processing",
          shipped: "In Transit",
          delivered: "Delivered",
          cancelled: "Cancelled",
          returned: "Returned"
        };
        const statusEn = statusTextMapEn[newStatus.toLowerCase()] || newStatus;

        if (orderData && orderData.userId && orderData.userId !== "guest") {
          try {
            const isConfirming = newStatus === "confirmed";
            const wasAlreadyConfirmed = !!orderData.confirmedNotifSent;

            // Only mark confirmedNotifSent once
            if (isConfirming && !wasAlreadyConfirmed) {
              await updateDoc(orderRef, { confirmedNotifSent: true, confirmedAt: serverTimestamp() });
            }

            // Always update the single notification document for this order so no duplicate cards accumulate
            const notifDocRef = doc(db, "notifications", `order_${orderId}`);
            await setDoc(notifDocRef, {
              title: `Order ${statusEn} (#${orderId})`,
              message: `Dear ${orderData.customerName || 'Customer'}, your order (#${orderId}) is ${statusEn.toLowerCase()}. Total Bill: ৳${orderData.total}.`,
              link: `order:${orderId}`,
              orderId: orderId,
              status: newStatus,
              userId: orderData.userId,
              userEmail: orderData.customerEmail || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              sender: "system",
              type: "direct"
            }, { merge: true });
          } catch (err) {
            console.error("Failed to send/update in-app notification:", err);
          }

          sendPushToUser(
            orderData.userId, 
            `Order Update (#${orderId})`, 
            `Your order status: ${statusEn}`, 
            `order:${orderId}`
          );
        }
        if (newStatus === "returned" && orderData.userId && orderData.paymentMethod !== "cod") {
            const userRef = doc(db, "users", orderData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentBalance = userSnap.data().balance || 0;
                const refundAmount = orderData.total;
                await updateDoc(userRef, { balance: currentBalance + refundAmount });
                await setDoc(doc(collection(db, "transactions")), {
                    userId: orderData.userId,
                    amount: refundAmount,
                    type: "refund",
                    description: `রিফান্ড (অর্ডার #${orderId})`,
                    createdAt: new Date().toISOString(),
                });
            }
        }
      }
    } catch (err: any) {
      console.error("Status update failed", err);
      alert("ডাটাবেস আপডেট ফেইল করেছে: " + (err.message || String(err)));
    }
  };
  const handleUpdatePaymentMethod = async (
    orderId: string,
    newMethod: string,
  ) => {
    if (isQuotaExceeded) return;
    try {
      const updated = orderHistory.map((o) =>
        o.id === orderId ? { ...o, paymentMethod: newMethod } : o,
      );
      setOrderHistory(updated);
      try {
        localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save orders to localStorage:", e);
      }
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paymentMethod: newMethod });
      toast.success("পেমেন্ট মেথড আপডেট করা হয়েছে!");
    } catch (err) {
      console.error("Failed to update payment method", err);
      toast.error("পেমেন্ট মেথড আপডেট করতে সমস্যা হয়েছে।");
    }
  };
  const [isSyncingCourier, setIsSyncingCourier] = useState(false);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  const syncAllCourierStatuses = async (force = false) => {
    if (isSyncingCourier) return;
    setIsSyncingCourier(true);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch("/api/admin/courier/sync-all", {
        method: "POST",
        headers,
        body: JSON.stringify({ force, limit: 60 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.summary || { total: 0, synced: 0, updated: 0, failed: 0 };
        const firstErr = Array.isArray(data.results) ? (data.results.find((r: any) => r?.status === "ERROR")?.error || "") : "";
        if (s.total === 0) {
          toast("সিঙ্ক করার মতো কোনো অ্যাক্টিভ কুরিয়ার অর্ডার পাওয়া যায়নি।", { icon: "📦" });
        } else if (s.failed > 0 && s.synced === 0) {
          toast.error(`কুরিয়ার সিঙ্ক ব্যর্থ (${s.failed}টি): ${firstErr || "Steadfast/Pathao API Key বা Tracking ID যাচাই করুন"}`);
        } else {
          toast.success(`কুরিয়ার সিঙ্ক সম্পন্ন! চেক: ${s.total}, আপডেট: ${s.updated}${s.failed > 0 ? `, ব্যর্থ: ${s.failed}` : ""}`);
        }
      } else {
        toast.error(data.message || data.error || "কুরিয়ার স্ট্যাটাস সিঙ্ক করা যায়নি");
      }
    } catch (err: any) {
      toast.error("কুরিয়ার সিঙ্ক ত্রুটি: " + (err.message || String(err)));
    } finally {
      setIsSyncingCourier(false);
    }
  };

  const syncSingleCourierStatus = async (orderId: string) => {
    if (!orderId) return;
    setSyncingOrderId(orderId);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/courier/sync/${encodeURIComponent(orderId)}`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success && data.syncResult) {
        const sr = data.syncResult;
        toast.success(`অর্ডার #${String(orderId).slice(-6).toUpperCase()}: ${sr.courierLabel} (${sr.newOrderStatus})`);
        if (selectedOrderForDetails?.id === orderId) {
          setSelectedOrderForDetails((prev: any) =>
            prev
              ? {
                  ...prev,
                  courierStatus: sr.rawCourierStatus,
                  courierStatusLabel: sr.courierLabel,
                  courierLastSyncedAt: sr.syncedAt,
                  ...(sr.trackingMessage ? { courierTrackingMessage: sr.trackingMessage } : {}),
                  ...(sr.hubName ? { courierHub: sr.hubName } : {}),
                  ...(Array.isArray(sr.courierHistory) ? { courierHistory: sr.courierHistory } : {}),
                  status: sr.newOrderStatus,
                  ...(sr.service?.toLowerCase().includes("pathao")
                    ? { pathaoStatus: sr.rawCourierStatus }
                    : { steadfastStatus: sr.rawCourierStatus }),
                }
              : prev
          );
        }
      } else {
        toast.error(data.error || "স্ট্যাটাস সিঙ্ক করা যায়নি");
      }
    } catch (err: any) {
      toast.error("কুরিয়ার সিঙ্ক ত্রুটি: " + (err.message || String(err)));
    } finally {
      setSyncingOrderId(null);
    }
  };

  const sendToCourier = (order: any) => {
    setCourierSelection({
      order,
      service: "Steadfast",
      trackingId: "",
      codAmount: order.codAmount !== undefined ? order.codAmount : order.total
    });
    setIsCourierModalOpen(true);
  };
  const handleConfirmCourier = async () => {
    const { order, service, trackingId, codAmount } = courierSelection;
    if (!order) return;
    try {
      const finalCodAmount = codAmount !== undefined ? codAmount : (order.codAmount !== undefined ? order.codAmount : order.total);
      if (service === "Steadfast" && !trackingId) {
        if (!adminKeys?.steadfastApiKey || !adminKeys?.steadfastSecretKey) {
          toast.error("Steadfast API Key missing in Settings!");
          return;
        }
        toast.loading("Steadfast এ অর্ডার এন্ট্রি করা হচ্ছে...");
        const headers = await getAdminAuthHeaders(true);
        const response = await fetch("/api/courier/steadfast/bulk", {
          method: "POST",
          headers,
          body: JSON.stringify({
            apiKey: adminKeys?.steadfastApiKey || "",
            secretKey: adminKeys?.steadfastSecretKey || "",
            orders: [{
              id: order.id,
              invoice: order.id,
              recipient_name: order.customerName,
              recipient_phone: order.customerPhone,
              recipient_address: order.address,
              cod_amount: finalCodAmount,
              note: `Invoice: ${order.id}`
            }]
          })
        });
        const data = await response.json();
        toast.dismiss();
        
        if (data.success && data.processedOrders && data.processedOrders[0].success) {
           const result = data.processedOrders[0];
           await updateDoc(doc(db, "orders", order.id), {
             status: "shipped",
             courierTrackingId: result.trackingId,
             trackingId: result.trackingId,
             ...(result.consignmentId ? { courierConsignmentId: result.consignmentId } : {}),
             courierName: "Steadfast",
             courierStatus: "in_review",
             steadfastStatus: "in_review",
             courierStatusNormalized: "booked",
             courierStatusLabel: "In Review (Booked)",
             courierTrackingMessage: "Parcel booked with Steadfast courier",
             courierHistory: [{
               status: "in_review",
               label: "In Review (Booked)",
               category: "booked",
               message: "Parcel booked with Steadfast courier",
               source: "ADMIN_BOOKING",
               timestamp: new Date().toISOString(),
             }],
             couriers: {
               service: "Steadfast",
               trackingId: result.trackingId,
               ...(result.consignmentId ? { consignmentId: result.consignmentId } : {}),
             },
             codAmount: finalCodAmount,
             updatedAt: serverTimestamp(),
           });
           if (order.userId) {
             sendPushToUser(order.userId, "অর্ডার আপডেট", "আপনার অর্ডারটি কুরিয়ারে পাঠানো হয়েছে (Steadfast)", "/profile");
           }
           toast.success("Successfully sent to Steadfast!");
           setIsCourierModalOpen(false);
           return;
        } else {
           toast.error(data.error || "Steadfast এ পাঠাতে ব্যর্থ হয়েছে!");
           return;
        }
      }
      const text = `{t("অর্ডার ID", "Order ID")}: #${order.id}\nনাম: ${order.customerName}\nফোন: ${order.customerPhone}\nঠিকানা: ${order.address}\nটোটাল: ৳${order.total}\nক্যাশ কালেকশন: ৳${finalCodAmount}`;
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(text).catch(() => {});
        }
      } catch (clipErr) {
        console.warn("Clipboard copy failed:", clipErr);
      }
      await updateDoc(doc(db, "orders", order.id), {
        status: "shipped",
        courierName: service,
        trackingId: trackingId,
        courierTrackingId: trackingId,
        courierStatus: "in_review",
        courierStatusNormalized: "booked",
        courierStatusLabel: "In Review (Booked)",
        courierTrackingMessage: `Dispatched via ${service}${trackingId ? ` (${trackingId})` : ""}`,
        courierHistory: [{
          status: "in_review",
          label: "In Review (Booked)",
          category: "booked",
          message: `Dispatched via ${service}${trackingId ? ` (${trackingId})` : ""}`,
          source: "ADMIN_DISPATCH",
          timestamp: new Date().toISOString(),
        }],
        couriers: {
          service,
          trackingId,
        },
        codAmount: finalCodAmount,
        updatedAt: serverTimestamp(),
      });
      if (order.userId) {
        sendPushToUser(order.userId, "অর্ডার আপডেট", "আপনার অর্ডারের বর্তমান স্ট্যাটাস: shipped (কুরিয়ারে পাঠানো হয়েছে)", "/profile");
      }
      toast.success(`অর্ডার #${order.id} কুরিয়ারে আপডেট হয়েছে!`);
      setIsCourierModalOpen(false);
    } catch (err: any) {
      toast.dismiss();
      setIsCourierModalOpen(false);
      toast.error("কুরিয়ার এন্ট্রিতে সমস্যা হয়েছে: " + (err.message || String(err)));
      console.error("Courier update failed", err);
    }
  };
  
  const exportOrdersToCSV = (filterType: "daily" | "weekly" | "monthly" | "all") => {
    if (orderHistory.length === 0) return;
    
    downloadOrdersCSV(orderHistory, filterType);
  };
  useEffect(() => {
    if (heroBanners.length <= 1 || isBannerHovered) return;
    const timer = setInterval(() => {
      setBannerDirection(1);
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length, isBannerHovered]);
  const campaignParam = urlParams.get("campaign");
  const isCampaignLoading = !!campaignParam && !activeCampaign && campaigns.length === 0;
  if (landingProduct) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-cream flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        }
      >
        <LandingPageView
          landingProduct={landingProduct}
          landingPackageIndex={landingPackageIndex}
          setLandingPackageIndex={setLandingPackageIndex}
          getDeliveryCharge={getDeliveryCharge}
          landingArea={landingArea}
          setLandingArea={setLandingArea}
          handleLandingCheckout={handleLandingCheckout}
          landingPhone={landingPhone}
          setLandingPhone={setLandingPhone}
          landingPhoneFocused={landingPhoneFocused}
          setLandingPhoneFocused={setLandingPhoneFocused}
          savedProfiles={savedProfiles}
          selectSavedProfile={selectSavedProfile}
          landingName={landingName}
          setLandingName={setLandingName}
          isLandingDistrictOpen={isLandingDistrictOpen}
          setIsLandingDistrictOpen={setIsLandingDistrictOpen}
          landingDistrictSearch={landingDistrictSearch}
          setLandingDistrictSearch={setLandingDistrictSearch}
          landingDistrict={landingDistrict}
          setLandingDistrict={setLandingDistrict}
          landingThana={landingThana}
          setLandingThana={setLandingThana}
          isLandingThanaOpen={isLandingThanaOpen}
          setIsLandingThanaOpen={setIsLandingThanaOpen}
          landingThanaSearch={landingThanaSearch}
          setLandingThanaSearch={setLandingThanaSearch}
          landingAddress={landingAddress}
          setLandingAddress={setLandingAddress}
          isLandingSubmitting={isLandingSubmitting}
          completedOrderReceipt={completedOrderReceipt}
          setCompletedOrderReceipt={setCompletedOrderReceipt}
          receiptRef={receiptRef}
          handleDownloadReceipt={handleDownloadReceipt}
          isDownloadingReceipt={isDownloadingReceipt}
        />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative pb-16 md:pb-0">
      <React.Suspense fallback={null}>
      <Helmet>
        {selectedCategory && selectedCategory !== "all" && selectedCategory !== "All" ? (
          <>
            <title>{`${selectedCategory} Price in Bangladesh - ${selectedCategory} কিনুন সেরা দামে | i SHOP BD`}</title>
            <meta name="description" content={`সেরা দামে আসল ${selectedCategory} কিনুন i SHOP BD থেকে। 100% অথেনটিক গ্যাজেট, অফিসিয়াল ওয়ারেন্টি ও ক্যাশ অন হোম ডেলিভারি!`} />
            <link rel="canonical" href={`https://ishopbd.com${getCategoryPath(selectedCategory)}`} />
            <meta property="og:title" content={`${selectedCategory} Price in Bangladesh | i SHOP BD`} />
            <meta property="og:description" content={`সেরা দামে আসল ${selectedCategory} কিনুন i SHOP BD থেকে। 100% অথেনটিক গ্যাজেট ও ক্যাশ অন হোম ডেলিভারি!`} />
            <meta property="og:url" content={`https://ishopbd.com${getCategoryPath(selectedCategory)}`} />
          </>
        ) : (
          <>
            <title>i SHOP BD (আই শপ বিডি) - Online Gadgets, Charger Fan & Electronics Shopping in BD</title>
            <meta name="description" content="i SHOP BD (আই শপ বিডি) - বাংলাদেশের বিশ্বস্ত গ্যাজেট ও ইলেকট্রনিক্স শপ। চার্জার ফ্যান, পাওয়ার ব্যাংক, স্মার্ট ওয়াচ, হেডফোন সহ প্রিমিয়াম গ্যাজেট সেরা দামে কিনুন।" />
            <link rel="canonical" href="https://ishopbd.com/" />
          </>
        )}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Helmet>
      <Toaster position="top-right" reverseOrder={false} />
      {/* Bulk Action Floating Bar */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-white shadow-2xl rounded-2xl border border-gray-200 p-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedOrderIds.length}
              </span>
              <span className="text-sm font-bold text-gray-600 hidden sm:inline-block">অর্ডার সিলেক্ট করা হয়েছে</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkSendToSteadfast}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Steadfast</span>
              </button>
              
              <select
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  if (!newStatus) return;
                  
                  const promises = selectedOrderIds.map(id => {
                    return handleUpdateOrderStatus(id, newStatus);
                  });
                  
                  toast.promise(Promise.all(promises), {
                    loading: 'স্ট্যাটাস আপডেট হচ্ছে...',
                    success: `${selectedOrderIds.length} টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে!`,
                    error: 'আপডেট করতে সমস্যা হয়েছে!'
                  });
                  
                  setSelectedOrderIds([]);
                  e.target.value = "";
                }}
                className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all outline-none cursor-pointer"
              >
                <option value="">স্ট্যাটাস...</option>
                <option value="pending">পেন্ডিং</option>
                <option value="confirmed">কনফার্মড</option>
                <option value="shipped">শিফট</option>
                <option value="delivered">ডেলিভারড</option>
                <option value="cancelled">ক্যান্সেল</option>
              </select>
              <button
                type="button"
                onClick={handleBulkPrintStickers}
                className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">স্টিকার প্রিন্ট</span>
              </button>
              
              <button 
                onClick={() => setSelectedOrderIds([])}
                className="p-2.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Quota Error Alert */}
      {isQuotaExceeded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-red-600 text-white text-center py-2.5 px-4 text-[10px] md:text-xs font-black z-[1000] flex flex-col items-center justify-center gap-1 relative"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="uppercase">লিমিটেড মোড অ্যাক্টিভেটেড (Quota Exceeded)</span>
          </div>
<p className="opacity-90 max-w-xl">অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট বা অফার আপডেট করুন। সকল গ্রাহক পেজ থেকে সহজেই তথ্য দেখতে পারবেন।</p>
        </motion.div>
      )}
      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => {
                setIsProductDetailsOpen(false);
                setSelectedProduct(null);
                setIsAdminOpen(false);
                setActiveCampaign(null);
                setSelectedCategory("all");
                setSelectedSubcategory("all");
                setSearchInput("");
                setSearchQuery("");
                setIsChatOpen(false);
                setIsProfileOpen(false);
                setIsCheckoutOpen(false);
                setIsNotifOpen(false);
                setCurrentPage(1);
                window.history.pushState({}, "", "/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="i SHOP BD Home"
            >
              <img src="/logo.png" alt="i SHOP BD Logo" className="h-9 md:h-11 object-contain" />
            </div>
          </div>
          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center bg-cream border border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary rounded-full overflow-hidden transition-all">
              <input
                type="text"
                placeholder={t("আপনার কাঙ্ক্ষিত পণ্য খুঁজুন...", "Search your desired products...")}
                className="w-full bg-transparent border-none py-2.5 pl-6 pr-24 outline-none text-sm text-secondary font-sans"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {siteConfig?.isAiEnabled && adminKeys?.geminiApiKey && (
                <button
                  type="button"
                  onClick={() => triggerImageSearch()}
                  className="absolute right-14 top-0 bottom-0 px-2 text-gray-400 hover:text-primary transition-all flex items-center justify-center"
                  title="Search with Image (AI)"
                >
                  <Camera size={18} />
                </button>
              )}
              <button className="cursor-pointer absolute right-0 top-0 bottom-0 px-6 bg-primary text-white hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center">
                <Search size={18} />
              </button>
            </form>
            {isAiSearching && (
              <div className="absolute right-24 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full z-10 border border-indigo-100 animate-pulse">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="text-[8px] font-bold text-indigo-600">AI Searching...</span>
              </div>
            )}


            {/* Desktop Search Preview Dropdown */}
            {liveSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[350px] overflow-y-auto">
                <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Search Results ({liveSearchResults.length})</span>
                  <button onMouseDown={() => setSearchInput("")} className="text-[10px] font-black text-primary hover:underline">Clear</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {liveSearchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onMouseDown={() => {
                        setSelectedProduct(prod);
                        setIsProductDetailsOpen(true);
                        setSearchInput("");
                      }}
                      className="p-3 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <img src={prod.image || "/logo.png"} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-secondary truncate">{prod.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-primary">৳{getProductPrice(prod, 1)}</span>
                          {prod.oldPrice && (
                            <span className="text-[10px] text-gray-400 line-through">৳{prod.oldPrice}</span>
                          )}
                          {prod.stock <= 0 ? (
                            <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.2 rounded">Out of Stock</span>
                          ) : prod.isComingSoon ? (
                            <span className="text-[8px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.2 rounded">Pre-Order</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4 text-secondary">
            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full font-bold shadow-sm transition-all active:scale-95 text-xs md:text-sm ml-2 md:ml-0"
              title="Download App"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Download App</span>
            </button>
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-full font-bold shadow-md shadow-red-600/20 transition-all hover:shadow-red-600/40 hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm ml-2 md:ml-0"
              title={t("অর্ডার ট্র্যাক করুন", "Track Order")}
            >
              <Truck size={18} />
              <span className="hidden md:inline">{t("ট্র্যাক অর্ডার", "Track Order")}</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (isMasterAdmin) {
                    setAdminViewMode("full");
                    setAdminTab("orders");
                  } else {
                    setAdminViewMode("support_only");
                    setAdminTab("support");
                  }
                  setIsAdminOpen(true);
                }}
                className={`cursor-pointer flex items-center justify-center transition-all active:scale-95 rounded-xl ${isMasterAdmin ? "p-2 text-primary hover:bg-gray-100" : "bg-secondary text-white gap-2 px-3 md:px-4 py-2 text-[10px] font-black hover:bg-black"}`}
                title={isMasterAdmin ? t("ড্যাশবোর্ড", "Dashboard") : t("সাপোর্ট", "Support")}
              >
                {isMasterAdmin ? (
                  <LayoutDashboard size={24} className="hover:scale-110 transition-transform" />
                ) : (
                  <Headset size={24} className="hover:scale-110 transition-transform" />
                )}
              </button>
            )}
            <button
              onClick={handleCheckNotifications}
              className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
              title={t("নোটিফিকেশন", "Notifications")}
            >
              <Bell size={22} className={unseenNotifCount > 0 ? "text-primary fill-primary/10 animate-pulse" : "text-secondary"} />
              {unseenNotifCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white animate-bounce" />
              )}
            </button>
            <button
              onClick={openCartCheckout}
              className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1">
              {!authReady ? (
                <div className="p-1.5 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {!user ? (
                    <button
                      className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setAuthModalType("login");
                      }}
                      disabled={isLoggingIn}
                      title={t("লগইন", "Login")}
                    >
                      <User
                        size={22}
                        className={
                          isLoggingIn ? "text-gray-300" : "text-gray-600"
                        }
                      />
                      {!isLoggingIn && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full flex items-center justify-center">
                          <Plus size={8} className="text-white" />
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors relative group border border-transparent hover:border-primary/20"
                      disabled={isLoggingIn}
                      onClick={() => setIsProfileOpen(true)}
                    >
                      {isLoggingIn ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary/5">
                            {(userProfile?.photoURL || user?.photoURL) ? (
                              <img src={userProfile?.photoURL || user?.photoURL || ""} alt="User" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <User
                                 size={22}
                                 className="text-primary"
                              />
                            )}
                          </div>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Search Bar - Prominent & Touch-friendly */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="relative flex items-center w-full">
            <div className="relative flex items-center w-full bg-white border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 rounded-full shadow-2xs transition-all overflow-hidden">
              <div className="pl-3.5 pr-2 text-gray-400 flex items-center pointer-events-none">
                <Search size={18} />
              </div>
              <input
                id="mobile-search-input"
                type="text"
                placeholder={t("আপনার কাঙ্ক্ষিত পণ্য খুঁজুন...", "Search desired products...")}
                className="w-full bg-transparent py-2.5 pr-20 outline-none text-sm font-medium text-secondary font-sans placeholder:text-gray-400"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div className="absolute right-2 top-0 bottom-0 flex items-center gap-1">
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors touch-manipulation"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                {siteConfig?.isAiEnabled && adminKeys?.geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => triggerImageSearch()}
                    className="p-1.5 text-gray-400 hover:text-primary transition-colors touch-manipulation"
                    title="Search with Image (AI)"
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Preview Dropdown */}
            {liveSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[320px] overflow-y-auto no-scrollbar">
                <div className="p-3 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Search Results ({liveSearchResults.length})</span>
                  <button onMouseDown={() => setSearchInput("")} className="text-[10px] font-black text-primary hover:underline touch-manipulation">Clear</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {liveSearchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onMouseDown={() => {
                        setSelectedProduct(prod);
                        setIsProductDetailsOpen(true);
                        setSearchInput("");
                      }}
                      className="p-3 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-3 active:bg-gray-100 touch-manipulation"
                    >
                      <img src={prod.image || "/logo.png"} alt={prod.name} className="w-11 h-11 object-cover rounded-lg border border-gray-100 shrink-0 bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-secondary truncate">{prod.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-primary">৳{getProductPrice(prod, 1)}</span>
                          {prod.oldPrice && (
                            <span className="text-[10px] text-gray-400 line-through">৳{prod.oldPrice}</span>
                          )}
                          {prod.stock <= 0 ? (
                            <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.2 rounded">Out of Stock</span>
                          ) : prod.isComingSoon ? (
                            <span className="text-[8px] bg-amber-100 text-amber-600 font-bold px-1.5 py-0.2 rounded">Pre-Order</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Category List (Scrollable pills) */}
        {!activeCampaign && !campaignParam && (
          <div className="border-t border-gray-200/60 md:hidden bg-cream overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar py-2.5 px-4 gap-2 scroll-smooth">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setCurrentPage(1);
                  setIsProductDetailsOpen(false);
                  setSelectedProduct(null);
                }}
                className={`cursor-pointer whitespace-nowrap text-xs font-bold transition-all px-3.5 py-1.5 rounded-full touch-manipulation active:scale-95 ${
                  selectedCategory === "all"
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-gray-600 bg-white border border-gray-200/80 hover:bg-gray-100"
                }`}
              >
                {t("সবগুলো", "All")}
              </button>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={getCategoryPath(cat.name)}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(cat.name);
                    setSelectedSubcategory("all");
                    setCurrentPage(1);
                    setIsProductDetailsOpen(false);
                    setSelectedProduct(null);
                  }}
                  className={`cursor-pointer whitespace-nowrap text-xs font-bold transition-all px-3.5 py-1.5 rounded-full touch-manipulation active:scale-95 ${
                    selectedCategory === cat.name
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-gray-600 bg-white border border-gray-200/80 hover:bg-gray-100"
                  }`}
                >
                  {tc(cat.name)}
                </a>
              ))}
            </div>
          </div>
        )}
        {/* Mobile Subcategory List */}
        {!activeCampaign && !campaignParam && selectedCategory !== "all" && (() => {
          const selCatObj = categories.find(c => c.name === selectedCategory);
          const subcats = selCatObj?.subcategories || [];
          if (subcats.length === 0) return null;
          return (
            <div className="border-t border-gray-100/50 md:hidden bg-gray-50/50 overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar py-2 px-4 gap-2 scroll-smooth">
                <button
                  onClick={() => {
                    setSelectedSubcategory("all");
                    setCurrentPage(1);
                    setIsProductDetailsOpen(false);
                    setSelectedProduct(null);
                  }}
                  className={`whitespace-nowrap text-xs font-bold transition-all px-3 py-1.5 rounded-full ${
                    selectedSubcategory === "all"
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 bg-white border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                {subcats.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSubcategory(sub);
                      setCurrentPage(1);
                      setIsProductDetailsOpen(false);
                      setSelectedProduct(null);
                    }}
                    className={`whitespace-nowrap text-xs font-bold transition-all px-3 py-1.5 rounded-full ${
                      selectedSubcategory === sub
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-500 bg-white border border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </header>
      {/* 2. Category Menu - Hide on Mobile since it's integrated in header now */}
      {!activeCampaign && !campaignParam && (
        <nav className="bg-gray-50/10 border-y border-gray-200/80 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex divide-x divide-gray-200/80 border-x border-gray-200/80 w-full">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                  setCurrentPage(1);
                  setIsProductDetailsOpen(false);
                  setSelectedProduct(null);
                }}
                className={`flex-1 px-6 py-2 text-sm font-bold transition-all flex items-center justify-center gap-1 ${
                  selectedCategory === "all"
                    ? "bg-white text-primary"
                    : "text-gray-600 hover:bg-white/80 hover:text-primary"
                }`}
              >
                {t("সবগুলো", "All")}
              </button>
              {categories.map((cat) => {
                const subcats = cat.subcategories || [];
                return (
                  <div key={cat.id} className="flex-1 relative group flex">
                    <a
                      href={getCategoryPath(cat.name)}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(cat.name);
                        setSelectedSubcategory("all");
                        setCurrentPage(1);
                        setIsProductDetailsOpen(false);
                        setSelectedProduct(null);
                      }}
                      className={`cursor-pointer w-full px-6 py-2 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                        selectedCategory === cat.name
                          ? "bg-white text-primary"
                          : "text-gray-600 hover:bg-white/80 hover:text-primary"
                      }`}
                    >
                      {tc(cat.name)}
                      {subcats.length > 0 && (
                        <ChevronDown size={14} className="transition-transform group-hover:rotate-180 duration-300" />
                      )}
                    </a>
                    
                    {subcats.length > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out z-[999]">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl p-2.5 flex flex-col gap-1 ring-1 ring-black/5">
                          <a
                            href={getCategoryPath(cat.name)}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCategory(cat.name);
                              setSelectedSubcategory("all");
                              setCurrentPage(1);
                              setIsProductDetailsOpen(false);
                              setSelectedProduct(null);
                            }}
                            className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                              selectedCategory === cat.name && selectedSubcategory === "all"
                                ? "bg-primary/5 text-primary"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            All {tc(cat.name)}
                          </a>
                          <div className="h-[1px] bg-gray-100 my-1" />
                          {subcats.map((sub, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => {
                                setSelectedCategory(cat.name);
                                setSelectedSubcategory(sub);
                                setCurrentPage(1);
                                setIsProductDetailsOpen(false);
                                setSelectedProduct(null);
                              }}
                              className={`text-left text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                                selectedCategory === cat.name && selectedSubcategory === sub
                                  ? "bg-primary/5 text-primary"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      )}
      {/* 3. Hero Banner Slider (Natural Aspect Ratio, No Crop, No Zoom) */}
      {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && !campaignParam && selectedCategory === "all" && !isBannersResolved && heroBanners.length === 0 && (
        <section className="container mx-auto px-4 mt-4">
          <div className="w-full aspect-[16/7] max-h-[420px] rounded-2xl md:rounded-3xl bg-gray-100 animate-pulse border border-gray-100" />
        </section>
      )}
      {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && !campaignParam && selectedCategory === "all" && heroBanners.length > 0 && (
        <section className="container mx-auto px-4 mt-4 relative group">
          <div 
            className="w-full relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 bg-gray-50 select-none"
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
          >
            {/* Natural In-Flow Sizer Image: Establishes container height with width: 100% and height: auto */}
            {(() => {
              const activeBanner = heroBanners[currentBanner % heroBanners.length] || heroBanners[0];
              const rawActiveImg = activeBanner?.image || '';
              if (!rawActiveImg) return null;
              const isDefault = rawActiveImg.includes('ishopbd_hero_banner') || rawActiveImg.includes('unsplash');
              const webpActiveImg = (rawActiveImg.endsWith('.png') || rawActiveImg.endsWith('.jpg') || rawActiveImg.endsWith('.jpeg'))
                ? rawActiveImg.replace(/\.(png|jpg|jpeg)($|\?)/, '.webp$2')
                : rawActiveImg;
              return (
                <div className="w-full h-auto pointer-events-none select-none invisible" aria-hidden="true">
                  <picture className="w-full h-auto block">
                    {isDefault && (
                      <source
                        type="image/webp"
                        media="(max-width: 639px)"
                        srcSet="/ishopbd_hero_banner-mobile.webp"
                      />
                    )}
                    <source
                      type="image/webp"
                      srcSet={isDefault ? '/ishopbd_hero_banner.webp' : webpActiveImg}
                    />
                    <img 
                      src={isDefault ? '/ishopbd_hero_banner.webp' : rawActiveImg}
                      className="w-full h-auto block"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      width={1200}
                      height={600}
                      alt=""
                    />
                  </picture>
                </div>
              );
            })()}

            <AnimatePresence mode="popLayout" initial={false} custom={bannerDirection}>
              <motion.div
                key={currentBanner}
                custom={bannerDirection}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? "100%" : "-100%",
                    opacity: 1,
                  }),
                  center: {
                    x: "0%",
                    opacity: 1,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    },
                  },
                  exit: (direction: number) => ({
                    x: direction > 0 ? "-100%" : "100%",
                    opacity: 1,
                    transition: {
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                drag={heroBanners.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) > 50 || Math.abs(velocity.x) > 500;
                  if (swipe) {
                    if (offset.x > 0) {
                      setBannerDirection(-1);
                      setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
                    } else {
                      setBannerDirection(1);
                      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
                    }
                  }
                }}
                className={`absolute inset-0 w-full h-full flex items-center justify-center ${heroBanners[currentBanner % heroBanners.length]?.linkedProductId ? "cursor-pointer" : ""}`}
                onClick={() => {
                  const banner = heroBanners[currentBanner % heroBanners.length];
                  if (banner?.linkedProductId) {
                    const product = products.find((p) => p.id === banner.linkedProductId);
                    if (product) openProductDetails(product);
                  }
                }}
              >
                {(() => {
                  const banner = heroBanners[currentBanner % heroBanners.length] || heroBanners[0];
                  const rawBannerImg = banner?.image || '';
                  if (!rawBannerImg) return null;
                  const isDefaultHero = rawBannerImg.includes('ishopbd_hero_banner') || rawBannerImg.includes('unsplash');
                  const webpBannerImg = (rawBannerImg.endsWith('.png') || rawBannerImg.endsWith('.jpg') || rawBannerImg.endsWith('.jpeg'))
                    ? rawBannerImg.replace(/\.(png|jpg|jpeg)($|\?)/, '.webp$2')
                    : rawBannerImg;
                  return (
                    <picture className="w-full h-full block">
                      {isDefaultHero && (
                        <source
                          type="image/webp"
                          media="(max-width: 639px)"
                          srcSet="/ishopbd_hero_banner-mobile.webp"
                        />
                      )}
                      <source
                        type="image/webp"
                        srcSet={isDefaultHero ? '/ishopbd_hero_banner.webp' : webpBannerImg}
                      />
                      <img 
                        src={isDefaultHero ? '/ishopbd_hero_banner.webp' : rawBannerImg}
                        className="w-full h-full object-contain block"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        width={1200}
                        height={600}
                        alt={`i SHOP BD ব্যানার ${(currentBanner % heroBanners.length) + 1}`}
                        draggable={false}
                      />
                    </picture>
                  );
                })()}

                {/* Banner Text Overlay (only if title or subtitle exists) */}
                {(heroBanners[currentBanner % heroBanners.length]?.title || heroBanners[currentBanner % heroBanners.length]?.subtitle) && (
                  <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-16 text-white bg-black/15 pointer-events-none">
                    <div className="max-w-md">
                      {heroBanners[currentBanner % heroBanners.length]?.title && (
                        <h2
                          className={`${heroBanners[currentBanner % heroBanners.length]?.titleSize || 'text-xl sm:text-2xl md:text-4xl'} mb-1 sm:mb-2 tracking-tight text-white drop-shadow-xl ${
                            heroBanners[currentBanner % heroBanners.length]?.titleFont || 'font-ador'
                          } ${
                            heroBanners[currentBanner % heroBanners.length]?.titleWeight === 'black' ? 'font-black' : 'font-bold'
                          }`}
                        >
                          {heroBanners[currentBanner % heroBanners.length]?.title}
                        </h2>
                      )}
                      {heroBanners[currentBanner % heroBanners.length]?.subtitle && (
                        <p
                          className={`${heroBanners[currentBanner % heroBanners.length]?.subtitleSize || 'text-xs sm:text-sm md:text-base'} opacity-90 text-white/90 drop-shadow-lg ${
                            heroBanners[currentBanner % heroBanners.length]?.subtitleFont || 'font-ador'
                          }`}
                        >
                          {heroBanners[currentBanner % heroBanners.length]?.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {heroBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerDirection(-1);
                    setCurrentBanner((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
                  }}
                  className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-black/35 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 shadow-lg cursor-pointer active:scale-95"
                  aria-label="Previous banner"
                >
                  <ChevronLeft size={22} className="md:w-6 md:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerDirection(1);
                    setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
                  }}
                  className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-black/35 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 shadow-lg cursor-pointer active:scale-95"
                  aria-label="Next banner"
                >
                  <ChevronRight size={22} className="md:w-6 md:h-6" />
                </button>

                {/* Smooth Indicator Dots */}
                <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 z-10 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md pointer-events-auto">
                  {heroBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerDirection(idx > (currentBanner % heroBanners.length) ? 1 : -1);
                        setCurrentBanner(idx);
                      }}
                      className={`transition-all rounded-full cursor-pointer ${
                        idx === (currentBanner % heroBanners.length)
                          ? "w-6 md:w-8 h-2 bg-primary shadow-sm"
                          : "w-2 h-2 bg-white/60 hover:bg-white"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}
      {(selectedCategory !== "all" ||
        selectedBrand !== "all" ||
        searchQuery) && (
        <div className="container mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 bg-cream p-4 rounded-2xl border border-gray-100"
          >
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Filters:
            </span>
            {selectedCategory !== "all" && (
              <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-primary/10 shadow-sm">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="hover:bg-primary/10 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedBrand !== "all" && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm">
                Brand: {selectedBrand}
                <button
                  onClick={() => setSelectedBrand("all")}
                  className="hover:bg-blue-100 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-white text-gray-600 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-200 shadow-sm">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchInput("")}
                  className="hover:bg-gray-100 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedBrand("all");
                setSearchInput("");
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors underline decoration-dotted ml-auto"
            >
              Reset All
            </button>
          </motion.div>
        </div>
      )}
      <main className={isProductDetailsOpen ? "w-full flex-1 flex flex-col min-h-[800px]" : isCheckoutOpen ? "w-full bg-[#f4f6f8] flex-1 flex flex-col min-h-[800px]" : "container mx-auto px-4 py-8 flex-1 flex flex-col min-h-[800px]"}>
        <Suspense fallback={<div className="flex-1 flex flex-col items-center justify-center min-h-[400px]"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
          {isCampaignLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-gray-500 animate-pulse font-sans">Loading campaign, please wait...</p>
            </div>
          ) : isCheckoutOpen ? (
            <CheckoutModal {...{ ALL_DISTRICTS, availableRewardPoints, calculateTotal, checkoutAddress, checkoutDistrict, checkoutDistrictSearch, checkoutItems, checkoutName, checkoutNote, checkoutPhone, checkoutPhoneFocused, getProductPrice, handleConfirmOrder, isApplyingRewardPoints, isCheckoutDistrictOpen, isOrderProcessing, isOrderSuccess, openProductDetails, paymentMethod, setPaymentMethod, removeItem, savedProfiles, setCheckoutAddress, setCheckoutDistrict, setCheckoutDistrictSearch, setCheckoutName, setCheckoutNote, setCheckoutPhone, setCheckoutPhoneFocused, setIsApplyingRewardPoints, setIsCheckoutDistrictOpen, setIsCheckoutOpen, t, toBengaliNumber, updateQuantity, isCheckoutOpen, checkoutFirstName, setCheckoutFirstName, checkoutLastName, setCheckoutLastName, checkoutThana, setCheckoutThana, checkoutEmail, setCheckoutEmail, districtThanaMap, couponCode, setCouponCode, couponError, handleApplyCoupon, appliedCoupon, setAppliedCoupon, getDeliveryCharge, deliveryArea, setDeliveryArea, siteConfig }} />
          ) : isProductDetailsOpen && selectedProduct ? (
            <ProductDetails {...{ products, selectedProduct, setIsProductDetailsOpen, handleLikeProduct, likedProducts, ZoomableImage, modalDisplayImage, setModalDisplayImage, setUserInteractedWithGallery, getProductPrice, tempSelectedQty, colorValError, setTempSelectedColor, setColorValError, tempSelectedColor, sizeValError, setTempSelectedSize, setSizeValError, tempSelectedSize, setTempSelectedQty, Minus, handleInlineOrderSubmit, inlineOrderPhone, setInlineOrderPhone, setInlinePhoneFocused, inlinePhoneFocused, savedProfiles, selectSavedProfile, inlineOrderName, setInlineOrderName, isInlineDistrictOpen, inlineDistrictSearch, inlineOrderDistrict, setInlineDistrictSearch, setIsInlineDistrictOpen, InlineDistrictModal, isInlineThanaOpen, inlineThanaSearch, inlineOrderThana, setInlineThanaSearch, setIsInlineThanaOpen, districtThanaMap, setInlineOrderThana, inlineOrderAddress, setInlineOrderAddress, inlineOrderNote, setInlineOrderNote, availableRewardPoints, isApplyingRewardPoints, setIsApplyingRewardPoints, inlineOrderSuccess, validateSelections, addToCartInternal, siteConfig, isInlineOrderProcessing, getDeliveryCharge, inlineOrderArea, setWholesaleSizeQty, sumValues, wholesaleSizeQty, isInlineDistrictOpenWholesale, inlineDistrictSearchWholesale, ALL_DISTRICTS, setInlineOrderDistrict, setInlineOrderArea, isInlineThanaOpenWholesale, inlineThanaSearchWholesale, cleanLatex, activeReviews, isReviewsLoading, setReviewForm, reviewForm, user, handleReviewImageUpload, submitReview, isSubmittingReview, relatedProducts, t, ProductCard, openProductDetails, handleBuyNow, isProductDetailsOpen }} />
          ) : (
            <ShopList {...{ brands, categories, activeCampaign, cleanLatex, setActiveCampaign, Home, selectedCategory, searchQuery, isTrendingFilterActive, newArrivals, t, ProductCard, openProductDetails, handleBuyNow, handleLikeProduct, likedProducts, featuredProducts, featuredScrollRef, handleFeaturedScroll, featuredScrollPercent, setFeaturedScrollPercent, handleFeaturedSliderChange, isProductDetailsOpen, flashSaleProducts, selectedBrand, minPrice, maxPrice, setIsTrendingFilterActive, setSelectedCategory, setSearchInput, setSelectedBrand, setMinPrice, setMaxPrice, setIsFilterMenuOpen, isFilterMenuOpen, sortBy, setSortBy, FilterMenuModal, isLoading, productsPerPage, ProductSkeleton, filteredProducts, PackageOpen, currentPage, setCurrentPage }} />
          )}
        </Suspense>
      </main>
        {/* Secondary Banner Slider - Added here before trending */}
        {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && secondaryBanners.length > 0 && (
          <section className="mb-12 container mx-auto px-4">
             <div className="relative overflow-hidden group rounded-xl">
                <AnimatePresence mode="wait">
                   <motion.div
                      key={Math.floor(Date.now() / 5000) % secondaryBanners.length}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="relative w-full cursor-pointer"
                      onClick={() => {
                         const currentIdx = Math.floor(Date.now() / 5000) % secondaryBanners.length;
                         const banner = secondaryBanners[currentIdx];
                         if (banner?.linkedProductId) {
                            const prod = products.find(p => p.id === banner.linkedProductId);
                            if (prod) openProductDetails(prod);
                         }
                      }}
                   >
                      <img loading="lazy" 
                         src={secondaryBanners[Math.floor(Date.now() / 5000) % secondaryBanners.length]?.image} 
                         className="w-full h-auto block"
                         alt="Secondary Banner"
                      />
                      {/* Lighting Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
                   </motion.div>
                      </AnimatePresence>
    </div>
          </section>
        )}
        {/* Category Sections (Replaces Trending Selection) */}
        {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && categories.map((cat) => {
          const catProducts = productsByCategory[cat.name] || [];
          if (catProducts.length === 0) return null;
          
          return (
            <section key={cat.id} className="mb-8 container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-primary"></span>
                  <h3 className="text-xl md:text-2xl font-black text-secondary">
                    {tc(cat.name)}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setTimeout(() => {
                      document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-sm font-bold text-primary hover:text-primary/80"
                >
                  View All
                </button>
              </div>
              <div className="relative group">
                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById(`scroll-container-${cat.id}`);
                    if (container) {
                      container.scrollBy({ left: -350, behavior: "smooth" });
                    }
                  }}
                  className="absolute -left-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                  title="Previous"
                >
                  <ChevronLeft size={20} />
                </button>

                <div 
                  id={`scroll-container-${cat.id}`}
                  className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth"
                >
                  <div className="flex gap-2 md:gap-4 pb-4">
                    {catProducts.slice(0, 8).map((product) => (
                      <div key={product.id} className="w-[calc(50%-4px)] md:w-[calc(20%-12.8px)] shrink-0">
                        <ProductCard 
                          product={product}
                          openProductDetails={openProductDetails}
                          t={t}
                          handleBuyNow={handleBuyNow}
                          handleLikeProduct={handleLikeProduct}
                          isLiked={likedProducts.includes(product.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={() => {
                    const container = document.getElementById(`scroll-container-${cat.id}`);
                    if (container) {
                      container.scrollBy({ left: 350, behavior: "smooth" });
                    }
                  }}
                  className="absolute -right-2 top-[32%] -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-secondary hover:text-primary w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer transition-all duration-200 md:flex hidden opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95"
                  title="Next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </section>
          );
        })}
        {/* Delivery Policy Notice */}
        {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && (
          <div className="mb-6 container mx-auto px-4">
            <div className="bg-red-100/50 rounded-2xl p-6 border-2 border-dashed border-primary/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-primary text-white p-4 rounded-full animate-bounce flex-shrink-0">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-secondary mb-2 text-center md:text-left">
                    {t("ডেলিভারি ও পেমেন্ট পলিসি", "Important Delivery & Payment Policy")}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed text-center md:text-left">
                    {t("আমাদের প্রতিটি ডেলিভারি খুব যত্ন সহকারে করা হয়। তবে নিরাপত্তার কারণে,", "Every delivery of ours is done with extreme care. However, for security purposes,")}
                    <span className="font-bold text-red-600">
                      
                      {t("দয়া করে ডেলিভারি ম্যানের সামনে বসে পণ্য আনবকরা বা চেক করুন?", "please unbox or check the product while sitting in front of the delivery man.")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Trust Badge / Feature Bar */}
        {!isProductDetailsOpen && !isCheckoutOpen && !activeCampaign && (
          <div className="mb-10 container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Delivery Charge */}
              <button
                onClick={() => setIsDeliveryInfoOpen(true)}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group text-left"
              >
                <div className="text-primary flex-shrink-0">
                  <Truck size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                    Delivery Charge
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Inside Dhaka ৳80 | Outside ৳120
                  </p>
                </div>
              </button>
              {/* 100% Authentic */}
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                <div className="text-primary flex-shrink-0">
                  <Award size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">
                    100% Authentic
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Guaranteed Quality
                  </p>
                </div>
              </div>
              {/* Secure Payment */}
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                <div className="text-primary flex-shrink-0">
                  <CreditCard size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">
                    Secure Payment
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Bkash / Nagad / Card / Cash
                  </p>
                </div>
              </div>
              {/* 24/7 Support */}
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                <div className="text-primary flex-shrink-0">
                  <Headset size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">
                    Customer Support
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    Dedicated Helpline Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      <AnimatePresence>
        {isMultiOrderSelectionOpen && <MultiOrderSelectionModal {...{ isMultiOrderSelectionOpen, setIsMultiOrderSelectionOpen, products, activeCampaign, cartItems, openProductDetails, setCartItems, addToCartInternal, setIsCheckoutOpen, cartCount, getProductPrice, proceedToCheckoutFromMulti, t }} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedOrderForRefund && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrderForRefund(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-black text-secondary flex items-center gap-2">
                  <RefreshCcw className="text-primary" size={24} /> রিফান্ড রিকোয়েস্ট
                </h3>
                <button
                  onClick={() => setSelectedOrderForRefund(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">অর্ডার ID</p>
                   <p className="text-sm font-bold text-secondary">#{String(selectedOrderForRefund.displayId || selectedOrderForRefund.id).slice(-6).toUpperCase()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">রিফান্ড এমাউন্ট</p>
                   <p className="text-lg font-black text-primary">৳{selectedOrderForRefund.total}</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">রিফান্ড চাওয়ার কারণ</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                          placeholder="পণ্যটি কেন ফেরত দিতে চান বিস্তারিত লিখুন..."
                    rows={4}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleRequestRefund}
                disabled={isSubmittingRefund || !refundReason.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingRefund ? "পাঠানো হচ্ছে..." : "সাবমিট করুন"} <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCourierModalOpen && courierSelection.order && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCourierModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Truck className="text-primary" size={24} /> কুরিয়ারে পাঠান
                </h3>
                <button
                  onClick={() => setIsCourierModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">কুরিয়ার সার্ভিস</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Steadfast", "Pathao", "RedX"].map((service) => (
                      <button
                        key={service}
                        onClick={() => setCourierSelection({...courierSelection, service})}
                        className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                          courierSelection.service === service 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ট্র্যাকিং আইডি (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={courierSelection.trackingId}
                    onChange={(e) => setCourierSelection({...courierSelection, trackingId: e.target.value})}
                    placeholder="উদা: SF12345678"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ক্যাশ কালেকশন পরিমাণ</label>
                  <input
                    type="number"
                    value={courierSelection.codAmount === undefined ? (courierSelection.order?.codAmount !== undefined ? courierSelection.order.codAmount : (courierSelection.order?.total || 0)) : courierSelection.codAmount}
                    onChange={(e) => setCourierSelection({...courierSelection, codAmount: e.target.value === "" ? 0 : Number(e.target.value)})}
                    placeholder="উদা: 500"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <Copy size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">অটো-কপি ফিচাট</p>
                      <p className="text-[10px] text-blue-700 font-bold leading-relaxed">কনফার্ম করলে কাস্টমারের সকল তথ্য (নাম, ফোন, ঠিকানা) অটোমেটিক কপি হয়ে যাবে কুরিয়ার প্যানেলে পেস্ট করার জন্য।</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirmCourier}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                শিপিং কনফার্ম করুন <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAdminOpen && <AdminPanel {...{ isAdminOpen, activeBanners, activeProductDropdown, addVariant, adminChatEndRef, adminEndDate, adminKeys, adminList, adminOrderAreaFilter, adminOrdersLimit, adminReplyingTo, adminReviews, adminStartDate, adminTab, adminViewMode, allOrderPhones, blacklist, bulkNotifForm, bulkSmsMessage, bulkSmsPage, bulkSmsProgress, bulkSmsResult, bulkSmsSearch, bulkSmsSelectedPhones, campaigns, categories, checkCourierReport, copyCategoryLink, copyLandingPageLink, courierReports, deleteCampaign, deleteCategory, deleteOrder, deleteProduct, deletingCatId, editingAdmin, editingBanner, editingCampaign, editingCategory, editingProduct, expenses, exportDropdownRef, exportOrdersToCSV, fetchAdminReviews, filteredOrders, formatOrderGroupDate, getCustomerStats, getProductPrice, getOrderLocalDateString, handleAddAdmin, handleCompleteIncompleteOrder, handleAdminChatImageUpload, handleAdminImageUpload, handleAdminMultiImageUpload, handleAdminReply, handleAdminVoiceToggle, handleApproveRefund, handleApproveReview, handleDeleteAdmin, handleDeleteBanner, handleDeleteReviewAdmin, handleDuplicateProduct, handleEditUserBalance, handleBulkPrintStickers, handlePrintInvoice, handleQuickEditOrderItems, handleRejectReview, handleSaveBanner, handleSaveQuickEdit, handleSaveSiteConfig, handleSelectAll, handleSelectOrder, handleSendBulkNotification, handleSendBulkSms, handleSendDirectNotification, handleSendIndividualSms, handleSetPrimaryImage, handleToggleReaction, handleUpdateAdmin, handleUpdateOrderStatus, handleUpdatePaymentMethod, handleVariantImageUpload, incompleteOrders, individualSmsMessage, individualSmsOrder, isAdminRecording, isAdminReviewsLoading, isExportDropdownOpen, isMasterAdmin, isSendingBulkNotif, isSendingBulkSms, isSendingIndividualSms, isSyncingCourier, isUsersLoading, limit, loadingCourierReports, newAdminEmail, newAdminPassword, newAdminPhone, newAdminRole, newBanner, notifications, openLandingEditor, orderHistory, orderSearchQuery, productDropdownRef, productFormErrors, products, query, quickEditData, quickEditOrderId, refundRequests, removeImage, removeVariant, replyMessage, reportTimeframe, saveCampaign, saveCategory, saveProduct, selectChat, selectedChat, selectedOrderIds, selectedOrderStatusFilter, sendToCourier, setActiveProductDropdown, setAdminEndDate, setAdminKeys, setAdminOrderAreaFilter, setAdminOrdersLimit, setAdminReplyingTo, setAdminStartDate, setAdminTab, setBulkNotifForm, setBulkSmsMessage, setBulkSmsPage, setBulkSmsSearch, setBulkSmsSelectedPhones, setCompletedOrderReceipt, setCourierModalPhone, setEditingAdmin, setEditingBanner, setEditingCampaign, setEditingCategory, setEditingProduct, setIndividualSmsMessage, setIndividualSmsOrder, setIsAdminOpen, setIsCourierHistoryModalOpen, setIsExportDropdownOpen, setIsQuotaExceeded, setIsUsersLoading, setNewAdminEmail, setNewAdminPassword, setNewAdminPhone, setNewAdminRole, setNewBanner, setNotifications, setOrderSearchQuery, setProductFormErrors, setQuickEditData, setQuickEditOrderId, setReplyMessage, setReportTimeframe, setSelectedChat, setSelectedOrderForDetails, setSelectedOrderStatusFilter, setShowOnlyPreOrders, setSiteConfig, setUserList, setUserListSearch, showOnlyPreOrders, siteConfig, supportChats, syncAllCourierStatuses, syncSingleCourierStatus, syncingOrderId, toggleBlacklist, togglePublishStatus, userList, userListSearch, isSavingProduct, deletedOrders, restoreOrder, permanentDeleteOrder }} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedOrderForDetails && (
          <OrderDetailsModal
            selectedOrderForDetails={selectedOrderForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
            isAdminVerified={isAdminVerified}
            isEditingOrder={isEditingOrder}
            setIsEditingOrder={setIsEditingOrder}
            editingOrderData={editingOrderData}
            setEditingOrderData={setEditingOrderData}
            handleUpdateOrderDetails={handleUpdateOrderDetails}
            orderHistory={orderHistory}
            setOrderHistory={setOrderHistory}
            handleUpdatePaymentMethod={handleUpdatePaymentMethod}
            sendToCourier={sendToCourier}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            getProductPrice={getProductPrice}
            syncSingleCourierStatus={syncSingleCourierStatus}
            syncingOrderId={syncingOrderId}
            courierReports={courierReports}
            loadingCourierReports={loadingCourierReports}
            checkCourierReport={checkCourierReport}
          />
        )}
      </AnimatePresence>
      {/* Courier History Modal */}
      <AnimatePresence>
        {isCourierHistoryModalOpen && <CourierHistoryModal {...{ isCourierHistoryModalOpen, setIsCourierHistoryModalOpen, courierModalPhone, setCourierModalPhone, checkCourierReport, loadingCourierReports, courierReports, AlertTriangle }} />}
      </AnimatePresence>
      {/* Floating Admin/Support Button */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {isAdmin && (
          <>
            {/* Support & Orders / Messenger Button */}
            <button
              onClick={() => {
                setAdminViewMode(isMasterAdmin ? "full" : "support_only");
                setAdminTab("orders");
                setIsAdminOpen(true);
              }}
              className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative group overflow-hidden border-2 border-white/20 cursor-pointer"
              title="Support & Orders"
            >
              <Headset size={28} strokeWidth={2.5} />
              {(supportChats.filter(c => c.unreadByAdmin).length > 0 || orderHistory.filter(o => o.status === "pending").length > 0) && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {(supportChats.filter(c => c.unreadByAdmin).length + orderHistory.filter(o => o.status === "pending").length)}
                </span>
              )}
              <span className="absolute right-full mr-3 bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                সাপোর্ট ও মেসেঞ্জার
              </span>
            </button>
          </>
        )}
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-secondary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
          >
            <ShoppingCart size={18} className="text-primary" />
            <span className="text-sm font-bold text-white">
                    পণ্যটি কার্টে যোগ করা হয়েছে!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 5. Footer */}
      {/* 9. User Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <ProfileModal
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            user={user}
            userProfile={userProfile}
            handleProfileImageUpload={handleProfileImageUpload}
            t={t}
            setIsDepositModalOpen={setIsDepositModalOpen}
            isAdmin={isAdmin}
            setIsAdminOpen={setIsAdminOpen}
            profileTab={profileTab}
            setProfileTab={setProfileTab}
            handleLogout={handleLogout}
            transactions={transactions}
            orderHistory={orderHistory}
            language={language}
            getProductPrice={getProductPrice}
            setSelectedOrderForRefund={setSelectedOrderForRefund}
            setRefundReason={setRefundReason}
            refundRequests={refundRequests}
          />
        )}
      </AnimatePresence>
      {/* 10. Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && <DepositModal {...{ isDepositModalOpen, setIsDepositModalOpen, handleDepositSubmit, setDepositAmount, depositAmount, setDepositMethod, depositMethod, depositTrxId, setDepositTrxId, isPaymentSimulating }} />}
      </AnimatePresence>
      <SiteFooter
        siteConfig={siteConfig}
        setIsAppDownloadModalOpen={setIsAppDownloadModalOpen}
        setActivePolicy={setActivePolicy}
      />
      {/* Floating Chat Support Action Button */}
      {!isAdmin && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group overflow-hidden touch-manipulation"
          title={t("কাস্টমার সাপোর্ট", "Customer Support")}
        >
          <motion.div
            initial={false}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Headset size={28} className="md:w-8 md:h-8" />
          </motion.div>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      )}

      {/* Mobile Bottom Sticky Navigation */}
      <MobileBottomNav
        cartCount={cartCount}
        onHomeClick={() => {
          setIsProductDetailsOpen(false);
          setSelectedProduct(null);
          setIsAdminOpen(false);
          setActiveCampaign(null);
          setSelectedCategory("all");
          setSelectedSubcategory("all");
          setSearchInput("");
          setSearchQuery("");
          setIsChatOpen(false);
          setIsProfileOpen(false);
          setIsCheckoutOpen(false);
          setIsNotifOpen(false);
          setCurrentPage(1);
          window.history.pushState({}, "", "/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onCategoryClick={() => setIsMobileCategoryDrawerOpen(true)}
        onTrackClick={() => setIsTrackingOpen(true)}
        onSupportClick={() => setIsChatOpen(true)}
        onCartClick={() => setIsCartDrawerOpen(true)}
        isProductDetailsOpen={isProductDetailsOpen}
        isCheckoutOpen={isCheckoutOpen}
        t={t}
      />

      {/* Mobile Category Drawer */}
      <AnimatePresence>
        {isMobileCategoryDrawerOpen && (
          <MobileCategoryDrawer
            isOpen={isMobileCategoryDrawerOpen}
            onClose={() => setIsMobileCategoryDrawerOpen(false)}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={(catName: string, subName?: string) => {
              setSelectedCategory(catName);
              setSelectedSubcategory(subName || "all");
              setCurrentPage(1);
              setIsProductDetailsOpen(false);
              setSelectedProduct(null);
              setIsAdminOpen(false);
              setIsCheckoutOpen(false);
              document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            t={t}
            tc={tc}
          />
        )}
      </AnimatePresence>
      {/* AI Chat Support Modal */}
      <AnimatePresence>
        {isChatOpen && <ChatModal {...{ setIsChatOpen, chatMessages, user, sessionId, handleToggleReaction, setChatReplyingTo, chatEndRef, chatReplyingTo, handleSendMessage, handleImageUpload, chatMessage, setChatMessage, handleVoiceToggle, isRecording, isChatOpen }} />}
      </AnimatePresence>
      {/* Custom Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && <AuthModal {...{ setIsAuthModalOpen, authModalType, handleCustomAuth, authName, setAuthName, authIdentifier, setAuthIdentifier, authPassword, setAuthPassword, isAuthLoading, handleLogin, Facebook, setAuthModalType, isAuthModalOpen }} />}
      </AnimatePresence>
      {/* Notification Drawer */}
      <AnimatePresence>
        {isNotifOpen && <NotifModal {...{ setIsNotifOpen, notifications, handleClearAllNotifications, handleDismissNotification, Info, products, setSelectedProduct, setIsProductDetailsOpen, toast, isNotifOpen, setIsTrackingOpen, setTrackingInput, handleTrackOrder }} />}
      </AnimatePresence>
      {/* Admin Verification Modal */}
      <AnimatePresence>
        {isAdmin && !isAdminVerified && (
          <AdminPasswordModal
            isAdmin={isAdmin}
            isAdminVerified={isAdminVerified}
            is2FAPending={is2FAPending}
            adminOTPSent={adminOTPSent}
            setAdminOTPSent={setAdminOTPSent}
            isSendingOTP={isSendingOTP}
            handleSendAdminOTP={handleSendAdminOTP}
            adminOTPInput={adminOTPInput}
            setAdminOTPInput={setAdminOTPInput}
            handleVerifyOTP={handleVerifyOTP}
            adminOTPError={adminOTPError}
            showAdminPassword={showAdminPassword}
            setShowAdminPassword={setShowAdminPassword}
            adminPasswordInput={adminPasswordInput}
            setAdminPasswordInput={setAdminPasswordInput}
            handleVerifyAdminPassword={handleVerifyAdminPassword}
            adminPasswordError={adminPasswordError}
          />
        )}
      </AnimatePresence>
      {/* Policy Modal */}
      <AnimatePresence>
        {activePolicy && (
          <PolicyModal
            activePolicy={activePolicy}
            setActivePolicy={setActivePolicy}
            siteConfig={siteConfig}
          />
        )}
      </AnimatePresence>

      {/* App Download Modal */}
      <AnimatePresence>
        {isAppDownloadModalOpen && (
          <AppDownloadModal
            isOpen={isAppDownloadModalOpen}
            onClose={() => setIsAppDownloadModalOpen(false)}
            siteConfig={siteConfig}
            deferredPrompt={deferredPrompt}
            handleInstallPWA={handleInstallPWA}
          />
        )}
      </AnimatePresence>
      {/* Slide-over Cart Drawer */}
      <AnimatePresence>
        {isCartDrawerOpen && (
          <CartDrawerModal
            isCartDrawerOpen={isCartDrawerOpen}
            setIsCartDrawerOpen={setIsCartDrawerOpen}
            cartItems={cartItems}
            cartCount={cartCount}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            getProductPrice={getProductPrice}
            setCheckoutItems={setCheckoutItems}
            setIsCheckoutOpen={setIsCheckoutOpen}
            detectLocation={detectLocation}
          />
        )}
      </AnimatePresence>
      {/* PWA Install Banner */}
      {showInstallPrompt && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-2xl p-5 z-[500] flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Download className="text-primary" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary">i SHOP BD অ্যাপ ডাউনলোড করুন</h4>
              <p className="text-xs text-gray-500 font-bold mt-1">অফলাইনে শপিং করতে এবং দ্রুত অর্ডারের জন্য হোম স্ক্রিনে যোগ করুন।</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-secondary text-[11px] font-black py-2.5 rounded-xl transition-all active:scale-95 text-center uppercase tracking-widest"
            >
              পরে করুন
            </button>
            <button
              onClick={handleInstallPWA}
              className="flex-1 bg-primary text-white text-[11px] font-black py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-red-700 transition-all active:scale-95 text-center uppercase tracking-widest"
            >
              ইন্সটল করুন
            </button>
          </div>
        </div>
      )}

      {/* Notification Permission Banner */}
      {showPushPrompt && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl p-5 z-[500] flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Bell className="text-primary animate-bounce" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary">অর্ডার ও অফারের নোটিফিকেশন</h4>
              <p className="text-xs text-gray-500 font-bold mt-1">আপনার অর্ডারের লাইভ আপডেট ও এক্সক্লুসিভ অফার সরাসরি পেতে নোটিফিকেশন চালু করুন।</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPushPrompt(false);
                sessionStorage.setItem("push_prompt_dismissed", "true");
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-secondary text-[11px] font-black py-2.5 rounded-xl transition-all active:scale-95 text-center uppercase tracking-widest cursor-pointer"
            >
              পরে করুন
            </button>
            <button
              onClick={handleEnablePushNotifications}
              className="flex-1 bg-primary text-white text-[11px] font-black py-2.5 rounded-xl shadow-md shadow-primary/20 hover:bg-red-700 transition-all active:scale-95 text-center uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bell size={14} /> চালু করুন
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isDeliveryInfoOpen && <DeliveryInfoModal {...{ setIsDeliveryInfoOpen, isDeliveryInfoOpen }} />}
      </AnimatePresence>
            <AnimatePresence>
              {editingUserBalance && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <h4 className="text-xl font-black text-secondary">ব্যালেন্স এডিট</h4>
                </div>
                <button 
                  onClick={() => setEditingUserBalance(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                   <p className="text-sm font-bold text-gray-500 mb-1">ইউজার</p>
                   <p className="font-black text-secondary">{editingUserBalance.displayName || editingUserBalance.email}</p>
                   <p className="text-xs text-gray-400 font-bold">
                     {editingUserBalance.email?.endsWith("@mobile.user") ? editingUserBalance.email.replace("@mobile.user", "") : editingUserBalance.email}
                   </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">বর্তমান ব্যালেন্স</p>
                   <p className="text-2xl font-black text-secondary">৳{editingUserBalance.balance || 0}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">নতুন ব্যালেন্স লিখুন</label>
                  <input 
                    type="number"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-xl font-black text-secondary focus:border-primary outline-none transition-all shadow-inner"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setEditingUserBalance(null)}
                  className="flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-100 transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button 
                  onClick={confirmBalanceUpdate}
                  disabled={isSyncingData}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncingData ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "আপডেট করুন"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Order Receipt Modal */}
      <AnimatePresence>
        {completedOrderReceipt && (
          <ReceiptModal
            completedOrderReceipt={completedOrderReceipt}
            setCompletedOrderReceipt={setCompletedOrderReceipt}
            receiptRef={receiptRef}
            handleDownloadReceipt={handleDownloadReceipt}
            isDownloadingReceipt={isDownloadingReceipt}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTrackingOpen && <TrackingModal {...{ setIsTrackingOpen, trackingInput, setTrackingInput, handleTrackOrder, isTrackingLoading, trackingError, trackingResult, isTrackingOpen }} />}
      </AnimatePresence>
      {/* ===== Landing Page Editor Modal ===== */}
      <AnimatePresence>
        {landingEditorProduct && (
          <LandingPageEditorModal
            landingEditorProduct={landingEditorProduct}
            setLandingEditorProduct={setLandingEditorProduct}
            copyLandingPageLink={copyLandingPageLink}
            saveLandingConfig={saveLandingConfig}
            isSavingLandingConfig={isSavingLandingConfig}
            landingEditorConfig={landingEditorConfig}
            setLandingEditorConfig={setLandingEditorConfig}
            handleLandingEditorImageUpload={handleLandingEditorImageUpload}
            landingPreviewTab={landingPreviewTab}
            setLandingPreviewTab={setLandingPreviewTab}
          />
        )}
      </AnimatePresence>

      {/* Dynamic Promo Popup Banner */}
      <AnimatePresence>
        {showPromoPopup && siteConfig?.promoPopupImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPromoPopup(false);
                  sessionStorage.setItem('promo_popup_shown', 'true');
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all z-10 hover:scale-105 active:scale-95 animate-pulse"
              >
                <X size={18} />
              </button>

              {/* Banner Image */}
              <div 
                className="relative w-full aspect-[4/5] cursor-pointer"
                onClick={() => {
                  if (siteConfig?.promoPopupLink) {
                    window.location.href = siteConfig.promoPopupLink;
                  }
                  setShowPromoPopup(false);
                  sessionStorage.setItem('promo_popup_shown', 'true');
                }}
              >
                <img 
                  src={siteConfig.promoPopupImage} 
                  alt="Special Offer" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </React.Suspense>
    </div>
  );
}
export default App;
