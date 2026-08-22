import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package, Camera, X, 
  Printer, RefreshCcw, Tag, Phone, User, Receipt, Clock, Sparkles, Filter, 
  ChevronRight, Check, AlertCircle, ShoppingBag, CreditCard, DollarSign, 
  Wallet, FileText, ArrowRight, Layers, Eye, Smartphone
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import toast from 'react-hot-toast';

export interface POSProps {
  products: Product[];
  categories?: any[];
  siteConfig?: any;
  orderHistory?: any[];
  handlePrintInvoice?: (order: any) => void;
  smsTemplateStart?: string;
  smsTemplateEnd?: string;
  isSmsConfirmEnabled?: boolean;
}

interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariant?: string;
  selectedColor?: string;
  buyingPrice?: number;
}

export default function POS({ 
  products = [], 
  categories = [],
  siteConfig,
  orderHistory = [],
  handlePrintInvoice,
  smsTemplateStart = "", 
  smsTemplateEnd = "", 
  isSmsConfirmEnabled = true 
}: POSProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Billing & Payment
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'due'>('cash');
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'recent_sales'>('terminal');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<any | null>(null);
  
  // Variant Picker Modal for products with multiple colors/variants
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [tempVariant, setTempVariant] = useState<string>('');
  const [tempColor, setTempColor] = useState<string>('');

  // Audio Beep on scan
  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  // Barcode / QR Scanner Effect
  const handleBarcodeScanned = (code: string) => {
    const query = code.trim().toLowerCase();
    const product = products.find(p => 
      (p.code && p.code.toLowerCase() === query) || 
      (p.id && p.id.toLowerCase() === query)
    );
    
    if (product) {
      if ((product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0)) {
        setVariantModalProduct(product);
        setTempVariant(product.variants?.[0]?.name || '');
        setTempColor(product.colors?.[0] || '');
      } else {
        addToCart(product);
      }
      playBeep();
      toast.success(`${product.name} যোগ করা হয়েছে!`);
      setIsCameraScannerOpen(false);
    } else {
      toast.error(`"${code}" কোডের কোনো প্রোডাক্ট পাওয়া যায়নি!`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;
      
      const exactMatch = products.find(p => 
        (p.code && p.code.toLowerCase() === query) || 
        (p.id && p.id.toLowerCase() === query)
      );
      
      if (exactMatch) {
        if ((exactMatch.variants && exactMatch.variants.length > 0) || (exactMatch.colors && exactMatch.colors.length > 0)) {
          setVariantModalProduct(exactMatch);
          setTempVariant(exactMatch.variants?.[0]?.name || '');
          setTempColor(exactMatch.colors?.[0] || '');
        } else {
          addToCart(exactMatch);
        }
        playBeep();
        setSearchQuery('');
        toast.success(`${exactMatch.name} যোগ করা হয়েছে!`);
      } else if (filteredProducts.length > 0) {
        const topProd = filteredProducts[0];
        if ((topProd.variants && topProd.variants.length > 0) || (topProd.colors && topProd.colors.length > 0)) {
          setVariantModalProduct(topProd);
          setTempVariant(topProd.variants?.[0]?.name || '');
          setTempColor(topProd.colors?.[0] || '');
        } else {
          addToCart(topProd);
        }
        playBeep();
        setSearchQuery('');
        toast.success(`${topProd.name} যোগ করা হয়েছে!`);
      } else {
        toast.error("কোনো প্রোডাক্ট পাওয়া যায়নি!");
      }
    }
  };

  useEffect(() => {
    if (!isCameraScannerOpen) return;
    
    const html5Qrcode = new Html5Qrcode("camera-reader");
    let isStopped = false;
    
    html5Qrcode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (width, height) => {
          const min = Math.min(width, height);
          return { width: min * 0.7, height: min * 0.7 };
        }
      },
      (decodedText) => {
        if (isStopped) return;
        isStopped = true;
        handleBarcodeScanned(decodedText);
        html5Qrcode.stop().catch(err => console.error("Error stopping camera:", err));
      },
      () => {}
    ).catch(err => {
      console.error("Scanner start error:", err);
      toast.error("ক্যামেরা চালু করতে সমস্যা হয়েছে!");
      setIsCameraScannerOpen(false);
    });
    
    return () => {
      isStopped = true;
      if (html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(err => console.error("Error stopping camera on unmount:", err));
      }
    };
  }, [isCameraScannerOpen, products]);

  // Product Filtering (Search & Category)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.deleted) return false;
      if (selectedCategory !== 'all') {
        const catMatch = p.category?.toLowerCase() === selectedCategory.toLowerCase();
        const subCatMatch = (p as any).subcategory?.toLowerCase() === selectedCategory.toLowerCase();
        if (!catMatch && !subCatMatch) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const codeMatch = p.code?.toLowerCase().includes(q);
        const idMatch = p.id?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        if (!nameMatch && !codeMatch && !idMatch && !brandMatch) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add Product to Cart
  const addToCart = (product: Product, variantName?: string, colorName?: string) => {
    setCartItems(prev => {
      const v = variantName || (product.variants?.[0]?.name || '');
      const c = colorName || (product.colors?.[0] || '');
      
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        (item.selectedVariant || '') === v && 
        (item.selectedColor || '') === c
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity: 1,
          price: product.price || 0,
          selectedVariant: v,
          selectedColor: c,
          buyingPrice: product.buyingPrice || 0
        }
      ];
    });
  };

  const handleProductCardClick = (product: Product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    const hasColors = product.colors && product.colors.length > 0;

    if (hasVariants || hasColors) {
      setVariantModalProduct(product);
      setTempVariant(product.variants?.[0]?.name || '');
      setTempColor(product.colors?.[0] || '');
    } else {
      addToCart(product);
      playBeep();
      toast.success(`${product.name} যোগ হয়েছে`, { duration: 1200 });
    }
  };

  const handleConfirmVariantAdd = () => {
    if (!variantModalProduct) return;
    addToCart(variantModalProduct, tempVariant, tempColor);
    playBeep();
    toast.success(`${variantModalProduct.name} যোগ হয়েছে`, { duration: 1200 });
    setVariantModalProduct(null);
    setTempVariant('');
    setTempColor('');
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setExactQuantity = (cartItemId: string, qty: number) => {
    const validQty = Math.max(1, Math.floor(qty) || 1);
    setCartItems(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: validQty } : item
    ));
  };

  const updatePrice = (cartItemId: string, newPrice: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, price: Math.max(0, newPrice) };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    setDiscountAmount('');
    setPaidAmount('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setOrderNotes('');
    toast.success('কার্ট খালি করা হয়েছে');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const discountVal = useMemo(() => {
    const raw = Number(discountAmount) || 0;
    if (discountType === 'percent') {
      return Math.round((subtotal * raw) / 100);
    }
    return raw;
  }, [discountAmount, discountType, subtotal]);

  const total = Math.max(0, subtotal - discountVal);
  const enteredPaid = paidAmount === '' ? total : (Number(paidAmount) || 0);
  const changeAmount = Math.max(0, enteredPaid - total);
  const dueAmount = Math.max(0, total - enteredPaid);

  // Print Thermal Slip / POS Invoice
  const printThermalReceipt = (orderData: any) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! অনুগ্রহ করে ব্রাউজার থেকে Pop-up allow করুন।');
      return;
    }

    const storeName = siteConfig?.siteName || 'i SHOP BD';
    const storeAddress = siteConfig?.address || 'ঢাকা, বাংলাদেশ';
    const storePhone = siteConfig?.supportPhone1 || siteConfig?.phone || '01777-600844';
    const invoiceNo = String(orderData.shortId || orderData.orderId || orderData.id || '').slice(-6).toUpperCase();
    const orderDate = orderData.date || new Date().toLocaleString('bn-BD');

    const itemsHtml = orderData.items.map((it: any) => {
      const pName = it.product?.name || 'Item';
      const variantStr = it.variant || it.color ? ` (${it.variant || it.color})` : '';
      const qty = it.quantity || 1;
      const price = it.product?.price || it.price || 0;
      const lineTot = qty * price;
      return `
        <tr>
          <td style="padding: 4px 0; font-size: 11px; text-align: left;">
            <div style="font-weight: bold;">${pName}</div>
            <div style="font-size: 9px; color: #555;">${variantStr} ${qty} × ৳${price}</div>
          </td>
          <td style="padding: 4px 0; font-size: 11px; text-align: right; vertical-align: top; font-weight: bold;">
            ৳${lineTot}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>POS Receipt #${invoiceNo}</title>
        <style>
          @page { margin: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            width: 72mm;
            margin: 0 auto;
            padding: 8px;
            color: #000;
            background: #fff;
            font-size: 11px;
            line-height: 1.3;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #444; margin: 6px 0; }
          .double-divider { border-top: 2px solid #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          .store-title { font-size: 16px; font-weight: 900; margin-bottom: 2px; text-transform: uppercase; }
          .meta-row { display: flex; justify-content: space-between; font-size: 10px; margin: 2px 0; }
          .totals-row { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
          .grand-total { font-size: 14px; font-weight: 900; }
          @media print {
            body { width: 100%; margin: 0; padding: 4px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="store-title">${storeName}</div>
          <div style="font-size: 10px;">${storeAddress}</div>
          <div style="font-size: 10px; font-weight: bold;">হটলাইন: ${storePhone}</div>
          <div style="font-size: 10px; color: #444; margin-top: 2px;">*** আউটলেট ক্যাশ মেমো ***</div>
        </div>

        <div class="divider"></div>

        <div class="meta-row">
          <span>মেমো নং: <b>#${invoiceNo}</b></span>
          <span>${orderDate}</span>
        </div>
        <div class="meta-row">
          <span>গ্রাহক: <b>${orderData.customerName || 'Walk-in'}</b></span>
          <span>মোবাইল: <b>${orderData.customerPhone || 'N/A'}</b></span>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #000; font-size: 10px;">
              <th style="text-align: left; padding-bottom: 3px;">পণ্য</th>
              <th style="text-align: right; padding-bottom: 3px;">মূল্য</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="totals-row">
          <span>মোট আইটেম:</span>
          <span><b>${orderData.items?.length || 0} টি</b></span>
        </div>
        <div class="totals-row">
          <span>সাবটোটাল:</span>
          <span>৳${orderData.subtotal || 0}</span>
        </div>
        ${orderData.discount ? `
          <div class="totals-row">
            <span>ডিসকাউন্ট:</span>
            <span>-৳${orderData.discount}</span>
          </div>
        ` : ''}

        <div class="double-divider"></div>

        <div class="totals-row grand-total">
          <span>সর্বমোট বিল:</span>
          <span>৳${orderData.total || 0}</span>
        </div>

        <div class="divider"></div>

        <div class="totals-row">
          <span>পেমেন্ট মাধ্যম:</span>
          <span style="text-transform: uppercase;"><b>${orderData.paymentMethod || 'Cash'}</b></span>
        </div>
        <div class="totals-row">
          <span>জমা টাকা:</span>
          <span>৳${orderData.paidAmount || orderData.total || 0}</span>
        </div>
        ${Number(orderData.dueAmount) > 0 ? `
          <div class="totals-row" style="color: #c00; font-weight: bold;">
            <span>বাকি (Due):</span>
            <span>৳${orderData.dueAmount}</span>
          </div>
        ` : ''}
        ${Number(orderData.changeAmount) > 0 ? `
          <div class="totals-row" style="font-weight: bold;">
            <span>ফেরত (Change):</span>
            <span>৳${orderData.changeAmount}</span>
          </div>
        ` : ''}

        <div class="divider"></div>

        <div class="text-center" style="margin-top: 8px; font-size: 9px; line-height: 1.4;">
          <div class="bold">ধন্যবাদ আবার আসবেন!</div>
          <div>পণ্য পরিবর্তনের জন্য ক্যাশ মেমো সাথে রাখুন (৩ দিনের মধ্যে)।</div>
          <div style="margin-top: 4px; font-weight: bold;">www.ishopbd.com</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 800);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Submit / Complete Checkout
  const handleCheckout = async (autoPrint: boolean = false) => {
    if (cartItems.length === 0) {
      toast.error('কার্টে কোনো পণ্য নেই!');
      return;
    }
    setIsSubmitting(true);

    try {
      const shortId = Math.floor(100000 + Math.random() * 900000).toString();
      const orderId = `POS-${shortId}`;

      const itemsForDb = cartItems.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.price),
          buyingPrice: Number(item.buyingPrice || item.product.buyingPrice || 0),
          image: item.product.image || "",
          code: item.product.code || "",
          smsName: item.product.smsName || item.product.name
        },
        quantity: item.quantity,
        variant: item.selectedVariant || null,
        color: item.selectedColor || null,
        price: Number(item.price)
      }));

      const orderData: any = {
        orderId,
        shortId,
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim() || "01000000000",
        address: customerAddress.trim() || "Outlet Purchase",
        note: orderNotes.trim() || "POS Direct Sale",
        paymentMethod: paymentMethod,
        paymentStatus: dueAmount > 0 ? "partial" : "paid",
        subtotal: subtotal,
        discount: discountVal,
        total: total,
        paidAmount: enteredPaid,
        changeAmount: changeAmount,
        dueAmount: dueAmount,
        status: "delivered",
        isOffline: true,
        source: "POS (Outlet)",
        orderType: "pos",
        deliveryFee: 0,
        createdAt: serverTimestamp(),
        date: new Date().toLocaleString("bn-BD"),
        items: itemsForDb,
        smsSent: false
      };

      // 1. Create Order in Firestore
      const docRef = await addDoc(collection(db, "orders"), orderData);
      const createdOrderWithId = { ...orderData, id: docRef.id };

      // 2. Decrement Stock atomically
      try {
        const stockPromises = cartItems.map(item => {
          const pId = item.product.id;
          const reqQty = Number(item.quantity) || 1;
          const currentProd = products.find((p: any) => p.id === pId) || item.product;
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

          return updateDoc(doc(db, "products", pId), updatePayload).catch(err => console.warn(`Stock decrement failed for ${pId}:`, err));
        });
        await Promise.all(stockPromises);
      } catch (err) {
        console.warn("Stock update warning:", err);
      }

      // 3. Send SMS if valid phone number provided
      const cleanPhone = customerPhone.replace(/\D/g, '');
      if (isSmsConfirmEnabled !== false && cleanPhone.length >= 11 && !cleanPhone.startsWith('01000000000')) {
        try {
          const productNames = itemsForDb.map(i => i.product.smsName || i.product.name).join(', ');
          const start = (smsTemplateStart || '').trim() || 'প্রিয় গ্রাহক, আপনার কেনাকাটা সম্পন্ন হয়েছে';
          const end = (smsTemplateEnd || '').trim() || 'iShop BD থেকে কেনাকাটার জন্য ধন্যবাদ!';
          const message = `${start}\n${productNames}\nঅর্ডার নাম্বার: #${shortId}\nমোট বিল: ৳${total}\n${end}`;
          
          fetch("/api/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: cleanPhone,
              message: message
            })
          }).catch(err => console.warn("POS SMS failed:", err));
        } catch (e) {
          console.warn("POS SMS error:", e);
        }
      }

      toast.success(`বিক্রয় সম্পন্ন হয়েছে! মেমো নং #${shortId} 🎉`, { duration: 3000 });
      setLastCompletedOrder(createdOrderWithId);

      // Auto Print if requested
      if (autoPrint) {
        setTimeout(() => {
          printThermalReceipt(createdOrderWithId);
        }, 300);
      }

      // Reset form
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setOrderNotes('');
      setDiscountAmount('');
      setPaidAmount('');

    } catch (error: any) {
      console.error("Error creating POS sale:", error);
      toast.error("বিক্রয় রেকর্ড করতে সমস্যা হয়েছে: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter recent POS orders for quick history
  const recentPosOrders = useMemo(() => {
    return orderHistory.filter((o: any) => 
      o.isOffline === true || 
      o.source === "POS (Outlet)" || 
      o.orderType === "pos" || 
      (o.orderId && o.orderId.startsWith("POS-")) ||
      (o.orderId && o.orderId.startsWith("OFFLINE-"))
    ).slice(0, 30);
  }, [orderHistory]);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] bg-slate-50 font-sans">
      
      {/* ── Top POS Control Bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-600/20">
            <ShoppingBag size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 tracking-tight">POS — পয়েন্ট অব সেল</h1>
              <span className="bg-emerald-100 text-emerald-700 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> লাইভ আউটলেট
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">ইন-স্টোর ও সরাসরি কাউন্টার সেলস টার্মিনাল</p>
          </div>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'terminal' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart size={15} /> সেলস টার্মিনাল
          </button>
          
          <button
            onClick={() => setActiveTab('recent_sales')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'recent_sales' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Receipt size={15} /> সাম্প্রতিক মেমো ({recentPosOrders.length})
          </button>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              title="কার্ট খালি করুন"
            >
              <Trash2 size={15} /> <span className="hidden sm:inline">খালি করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Workspace ── */}
      {activeTab === 'terminal' ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 p-3 md:p-6 overflow-hidden">
          
          {/* ════ LEFT COLUMN: Product Catalog & Search ════ */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0">
            
            {/* Search & Barcode Scan Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="পণ্য বা কোড খুঁজুন (যেমন: T-Shirt, 1024)... [Enter প্রেস করুন]"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsCameraScannerOpen(true)}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
              >
                <Camera size={16} /> বারকোড স্ক্যানার
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin shrink-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                সব পণ্য ({products.filter(p => !p.deleted).length})
              </button>
              {categories.map((cat: any) => {
                const catCount = products.filter(p => !p.deleted && (p.category === cat.name || (p as any).subcategory === cat.name)).length;
                return (
                  <button
                    key={cat.id || cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.name
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-75">({catCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <Package size={42} className="mb-2 text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-xs text-gray-400 mt-1">অন্য নাম বা কোড দিয়ে সার্চ করে দেখুন</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-8">
                  {filteredProducts.map(product => {
                    const effStock = Array.isArray(product.variants) && product.variants.length > 0 && product.variants.some((v: any) => v && v.stock !== undefined && v.stock !== null)
                      ? Math.max(0, product.variants.reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0))
                      : Math.max(0, Number(product.stock) || 0);
                    const inStock = effStock > 0;
                    const isLowStock = effStock > 0 && effStock <= 5;
                    const hasVariants = (product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0);

                    return (
                      <div
                        key={product.id}
                        onClick={() => inStock && handleProductCardClick(product)}
                        className={`bg-white rounded-2xl border transition-all p-3 flex flex-col justify-between group select-none ${
                          !inStock 
                            ? 'opacity-60 border-gray-200 cursor-not-allowed bg-gray-50' 
                            : 'border-gray-200/90 hover:border-purple-400 hover:shadow-md cursor-pointer active:scale-[0.98]'
                        }`}
                      >
                        <div>
                          {/* Image & Stock Badge */}
                          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2.5 relative border border-gray-100">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={32} />
                              </div>
                            )}

                            {/* Stock Indicator */}
                            <div className="absolute top-1.5 left-1.5">
                              {!inStock ? (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                  স্টক শেষ
                                </span>
                              ) : isLowStock ? (
                                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                  স্টক: {effStock}
                                </span>
                              ) : (
                                <span className="bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                                  স্টক: {effStock}
                                </span>
                              )}
                            </div>

                            {/* Variant Indicator */}
                            {hasVariants && (
                              <div className="absolute top-1.5 right-1.5">
                                <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                  <Layers size={10} /> ভ্যারিয়েন্ট
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Title & SKU */}
                          <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
                            {product.name}
                          </h3>
                          {product.code && (
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">#{product.code}</p>
                          )}
                        </div>

                        {/* Price & Add Action */}
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-black text-purple-700">৳{product.price?.toLocaleString()}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-gray-400 line-through ml-1.5">৳{product.originalPrice}</span>
                            )}
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus size={15} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT COLUMN: POS Billing Terminal & Cart ════ */}
          <div className="w-full lg:w-[420px] bg-white rounded-2xl border border-gray-200/90 shadow-sm flex flex-col overflow-hidden shrink-0">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-purple-700" size={18} />
                <h2 className="text-sm font-black text-gray-900">অর্ডার কার্ট ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} টি আইটেম)</h2>
              </div>
              {lastCompletedOrder && (
                <button
                  onClick={() => printThermalReceipt(lastCompletedOrder)}
                  className="text-[11px] font-bold text-purple-700 bg-white border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-50 flex items-center gap-1 transition-colors shadow-2xs"
                  title="সর্বশেষ ক্যাশ মেমো পুনরায় প্রিন্ট করুন"
                >
                  <Printer size={12} /> মেমো #{lastCompletedOrder.shortId}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[300px] lg:max-h-none">
              {cartItems.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-gray-400 text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-300 flex items-center justify-center mb-2">
                    <ShoppingBag size={26} />
                  </div>
                  <p className="text-xs font-bold text-gray-600">কার্ট খালি রয়েছে</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">বাম পাশ থেকে পণ্য ক্লিক করুন বা সার্চ করুন</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div 
                    key={item.cartItemId}
                    className="p-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-purple-300 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                          ) : (
                            <Package size={18} className="m-2 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate leading-tight">{item.product.name}</p>
                          {(item.selectedVariant || item.selectedColor) && (
                            <p className="text-[10px] font-bold text-purple-600">
                              ভ্যারিয়েন্ট: {item.selectedVariant || item.selectedColor}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Price, Qty & Line Total Row */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-100">
                      
                      {/* Editable Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-bold">দর: ৳</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updatePrice(item.cartItemId, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-black text-gray-800 text-center outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Qty Counter */}
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setExactQuantity(item.cartItemId, Number(e.target.value))}
                          className="w-8 text-center text-xs font-black bg-transparent outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right">
                        <span className="text-xs font-black text-purple-700">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Details & Discount / Payment Accordion */}
            <div className="p-3.5 border-t border-gray-200 bg-gray-50/70 space-y-3">
              
              {/* Customer Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">কাস্টমার নাম</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="সরাসরি ক্রেতা"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">মোবাইল (SMS এর জন্য)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Pricing & Discount */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <span>সাবটোটাল</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span>ডিসকাউন্ট</span>
                    <button
                      onClick={() => setDiscountType(prev => prev === 'flat' ? 'percent' : 'flat')}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      {discountType === 'flat' ? '৳ ফিক্সড' : '% শতাংশ'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 w-24">
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-right font-bold text-xs text-gray-800 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-1"></div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900">সর্বমোট প্রদেয়</span>
                  <span className="text-lg font-black text-purple-700">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1.5">পেমেন্ট মাধ্যম</label>
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { id: 'cash', label: 'নগদ ক্যাশ' },
                    { id: 'bkash', label: 'বিকাশ' },
                    { id: 'nagad', label: 'নগদ' },
                    { id: 'card', label: 'কার্ড' },
                    { id: 'due', label: 'বাকি' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-black text-center transition-all ${
                        paymentMethod === m.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Received & Change Calculator */}
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-0.5">টাকা গ্রহণ (৳)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={total.toString()}
                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-black text-xs text-gray-800 outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-0.5">
                    {dueAmount > 0 ? 'বাকি (Due)' : 'ফেরত (Change)'}
                  </label>
                  <div className={`px-2 py-1 rounded font-black text-xs ${
                    dueAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    ৳{dueAmount > 0 ? dueAmount.toLocaleString() : changeAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleCheckout(false)}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98"
                >
                  <Check size={16} /> {isSubmitting ? 'অপেক্ষা করুন...' : 'অর্ডার সংরক্ষণ'}
                </button>

                <button
                  onClick={() => handleCheckout(true)}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98"
                >
                  <Printer size={16} /> সম্পন্ন ও মেমো প্রিন্ট
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ════ RECENT POS SALES TAB ════ */
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">সাম্প্রতিক আউটলেট বিক্রয়সমূহ</h2>
                <p className="text-xs text-gray-500">ইন-স্টোর ও কাউন্টার বিক্রয়ের তালিকা ও রিসিট প্রিন্ট</p>
              </div>
              <button
                onClick={() => setActiveTab('terminal')}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 flex items-center gap-1"
              >
                <Plus size={14} /> নতুন বিক্রয় শুরু করুন
              </button>
            </div>

            <div className="overflow-x-auto">
              {recentPosOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Receipt size={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-bold text-gray-600 text-sm">কোনো আউটলেট বিক্রয় রেকর্ড নেই</p>
                  <p className="text-xs text-gray-400 mt-1">টার্মিনাল থেকে বিক্রয় সম্পন্ন করলে এখানে দেখা যাবে</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">মেমো নং</th>
                      <th className="p-3.5">তারিখ ও সময়</th>
                      <th className="p-3.5">গ্রাহক</th>
                      <th className="p-3.5">পণ্য তালিকা</th>
                      <th className="p-3.5">পেমেন্ট</th>
                      <th className="p-3.5 text-right">মোট বিল</th>
                      <th className="p-3.5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentPosOrders.map((order: any) => (
                      <tr key={order.id || order.orderId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-purple-700">
                          #{String(order.shortId || order.orderId || order.id).slice(-6).toUpperCase()}
                        </td>
                        <td className="p-3.5 text-gray-600 font-medium">
                          {order.date || (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('bn-BD') : 'N/A')}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{order.customerName || 'Walk-in'}</div>
                          <div className="text-[10px] text-gray-500">{order.customerPhone || 'N/A'}</div>
                        </td>
                        <td className="p-3.5 max-w-xs">
                          <div className="space-y-0.5">
                            {order.items?.map((it: any, i: number) => (
                              <div key={i} className="text-[11px] text-gray-700 truncate">
                                • {it.product?.name || 'Item'} × {it.quantity || 1}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700">
                            {order.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-black text-sm text-gray-900">
                          ৳{Number(order.total || 0).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => printThermalReceipt(order)}
                              className="px-2.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                              title="থার্মাল ক্যাশ মেমো প্রিন্ট করুন"
                            >
                              <Printer size={13} /> মেমো প্রিন্ট
                            </button>
                            {handlePrintInvoice && (
                              <button
                                onClick={() => handlePrintInvoice(order)}
                                className="px-2 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="ফুল ইনভয়েস দেখুন"
                              >
                                <FileText size={13} /> ইনভয়েস
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Variant Selection Modal ── */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-gray-900">ভ্যারিয়েন্ট নির্বাচন করুন</h3>
              <button 
                onClick={() => setVariantModalProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl mb-4">
              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-purple-200 shrink-0">
                {variantModalProduct.image ? (
                  <img src={variantModalProduct.image} alt={variantModalProduct.name} className="w-full h-full object-contain" />
                ) : (
                  <Package size={20} className="m-3 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 line-clamp-1">{variantModalProduct.name}</p>
                <p className="text-xs font-black text-purple-700 mt-0.5">৳{variantModalProduct.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Variants options */}
            {variantModalProduct.variants && variantModalProduct.variants.length > 0 && (
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-700 block mb-1.5">সাইজ / ভ্যারিয়েন্ট</label>
                <div className="flex flex-wrap gap-1.5">
                  {variantModalProduct.variants.map((v: any) => (
                    <button
                      key={v.name || v.id}
                      onClick={() => setTempVariant(v.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        tempVariant === v.name
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors options */}
            {variantModalProduct.colors && variantModalProduct.colors.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-700 block mb-1.5">রং (Color)</label>
                <div className="flex flex-wrap gap-1.5">
                  {variantModalProduct.colors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => setTempColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        tempColor === c
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setVariantModalProduct(null)}
                className="py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmVariantAdd}
                className="py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20"
              >
                কার্টে যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera Scanner Modal ── */}
      {isCameraScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-sm overflow-hidden relative flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-3">
              <h3 className="text-sm font-bold text-gray-900">বারকোড স্ক্যানার</h3>
              <button 
                onClick={() => setIsCameraScannerOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mb-3 border border-gray-200">
              <div id="camera-reader" className="w-full h-full object-cover"></div>
              <div className="absolute inset-0 border-2 border-dashed border-purple-400 m-10 pointer-events-none rounded-lg flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 animate-pulse" />
              </div>
            </div>
            
            <p className="text-[11px] text-gray-500 font-medium text-center leading-relaxed">
              প্রোডাক্টের বারকোডটি ক্যামেরার সামনে ধরুন। এটি স্বয়ংক্রিয়ভাবে স্ক্যান করে কার্টে যোগ করে দেবে।
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
