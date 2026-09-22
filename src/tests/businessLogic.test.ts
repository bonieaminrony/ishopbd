/**
 * Business Logic Tests
 * প্রাইস ক্যালকুলেশন, ডিসকাউন্ট, ডেলিভারি চার্জ ইত্যাদির test।
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toLeanProductCache, safeSetLocalStorage, safeGetLocalStorage, saveProductsToCache } from '../utils/helpers';
import { STORAGE_KEYS } from '../constants/data';

// ---- Price Calculation Helpers ----
// (App.tsx থেকে নেওয়া logic — same calculation)

function calculateDiscountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

function getDeliveryCharge(
  area: 'inside' | 'outside',
  couponCode: string | null,
  appliedCoupon: string | null
): number {
  const isFreeDelivery = appliedCoupon === 'FREEDEL';
  if (isFreeDelivery) return 0;
  return area === 'inside' ? 60 : 120;
}

function calculateCartTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

function applyDiscount(total: number, discountPercent: number): number {
  if (discountPercent <= 0 || discountPercent > 100) return total;
  return Math.round(total * (1 - discountPercent / 100));
}

function isValidBangladeshPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?880|0)?1[3-9]\d{8}$/.test(cleaned);
}

function isValidOrderId(id: string): boolean {
  return /^[a-zA-Z0-9_\-@.]+$/.test(id) && id.length >= 1 && id.length <= 128;
}

// ---- Tests ----

describe('Discount Calculation', () => {
  it('সঠিক ডিসকাউন্ট % হিসাব করতে হবে', () => {
    // (1800-1250)/1800 * 100 = 30.55 → round = 31
    expect(calculateDiscountPercent(1800, 1250)).toBe(31);
    // (4800-3500)/4800 * 100 = 27.08 → round = 27
    expect(calculateDiscountPercent(4800, 3500)).toBe(27);
    // (600-350)/600 * 100 = 41.67 → round = 42
    expect(calculateDiscountPercent(600, 350)).toBe(42);
  });


  it('0 হলে 0% discount হবে', () => {
    expect(calculateDiscountPercent(0, 0)).toBe(0);
  });

  it('যদি sale price == original price হয় তাহলে 0% হবে', () => {
    expect(calculateDiscountPercent(1000, 1000)).toBe(0);
  });
});

describe('Delivery Charge', () => {
  it('ঢাকার ভেতরে ৬০ টাকা হতে হবে', () => {
    expect(getDeliveryCharge('inside', null, null)).toBe(60);
  });

  it('ঢাকার বাইরে ১২০ টাকা হতে হবে', () => {
    expect(getDeliveryCharge('outside', null, null)).toBe(120);
  });

  it('FREE DELIVERY coupon থাকলে ০ টাকা হবে', () => {
    expect(getDeliveryCharge('inside', 'FREEDEL', 'FREEDEL')).toBe(0);
    expect(getDeliveryCharge('outside', 'FREEDEL', 'FREEDEL')).toBe(0);
  });
});

describe('Cart Total Calculation', () => {
  it('একটি item-এর total সঠিক হবে', () => {
    expect(calculateCartTotal([{ price: 1250, quantity: 2 }])).toBe(2500);
  });

  it('একাধিক item-এর total সঠিক হবে', () => {
    const items = [
      { price: 1250, quantity: 1 },
      { price: 2400, quantity: 2 },
      { price: 450, quantity: 3 },
    ];
    expect(calculateCartTotal(items)).toBe(1250 + 4800 + 1350); // 7400
  });

  it('খালি cart-এর total ০ হবে', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('quantity 0 হলে ওই item থেকে ০ add হবে', () => {
    expect(calculateCartTotal([{ price: 1000, quantity: 0 }])).toBe(0);
  });
});

describe('Coupon Discount Application', () => {
  it('5% discount সঠিকভাবে প্রয়োগ হবে', () => {
    expect(applyDiscount(1000, 5)).toBe(950);
  });

  it('10% discount সঠিকভাবে প্রয়োগ হবে', () => {
    expect(applyDiscount(2000, 10)).toBe(1800);
  });

  it('invalid discount (>100) হলে original price return হবে', () => {
    expect(applyDiscount(1000, 110)).toBe(1000);
  });

  it('0% discount হলে original price return হবে', () => {
    expect(applyDiscount(1500, 0)).toBe(1500);
  });

  it('negative discount হলে original price return হবে', () => {
    expect(applyDiscount(1500, -10)).toBe(1500);
  });
});

describe('Bangladesh Phone Number Validation', () => {
  it('valid Bangladeshi numbers accept হবে', () => {
    expect(isValidBangladeshPhone('01777600844')).toBe(true);
    expect(isValidBangladeshPhone('01677600844')).toBe(true);
    expect(isValidBangladeshPhone('01911123456')).toBe(true);
    expect(isValidBangladeshPhone('+8801777600844')).toBe(true);
    expect(isValidBangladeshPhone('8801777600844')).toBe(true);
  });

  it('invalid numbers reject হবে', () => {
    expect(isValidBangladeshPhone('12345')).toBe(false);
    expect(isValidBangladeshPhone('abcdefghijk')).toBe(false);
    expect(isValidBangladeshPhone('')).toBe(false);
  });
});

describe('Order ID Validation', () => {
  it('valid order IDs accept হবে', () => {
    expect(isValidOrderId('ORD-2025-001')).toBe(true);
    expect(isValidOrderId('abc123')).toBe(true);
    expect(isValidOrderId('user@domain.com')).toBe(true);
  });

  it('empty string reject হবে', () => {
    expect(isValidOrderId('')).toBe(false);
  });

  it('128 char limit enforce হবে', () => {
    const longId = 'a'.repeat(129);
    expect(isValidOrderId(longId)).toBe(false);
  });

  it('special chars (space, #) reject হবে', () => {
    expect(isValidOrderId('order id with space')).toBe(false);
    expect(isValidOrderId('order#123')).toBe(false);
  });
});

import { slugify, getProductSlug, getProductPath, findProductBySlugOrId } from '../utils/helpers';

describe('Professional Product URL Generation & Resolution', () => {
  it('generates clean, short SEO slug from product name with short ID suffix', () => {
    const product = {
      id: '1740523491298',
      name: 'Awei PA-103 30000mAh 22.5W Fast Charging Power Bank (Black & White)'
    };
    const slug = getProductSlug(product);
    expect(slug).toContain('awei-pa-103');
    expect(slug).toContain('491298');
    expect(getProductPath(product)).toBe(`/p/${slug}`);
  });

  it('handles custom slug if provided', () => {
    const product = {
      id: 'p103',
      name: 'Generic Power Bank',
      slug: 'awei-p103-custom'
    };
    expect(getProductSlug(product)).toBe('awei-p103-custom');
    expect(getProductPath(product)).toBe('/p/awei-p103-custom');
  });

  it('resolves product by direct ID, full slug, trailing ID, or custom slug', () => {
    const products = [
      { id: '1740523491298', name: 'Awei PA-103 30000mAh Power Bank' },
      { id: 'rem-k9', name: 'K9 Wireless Microphone Dual Type-C & Lightning', slug: 'k9-wireless-mic' }
    ];

    // Direct ID
    expect(findProductBySlugOrId(products, '1740523491298')?.id).toBe('1740523491298');
    
    // Custom slug
    expect(findProductBySlugOrId(products, 'k9-wireless-mic')?.id).toBe('rem-k9');

    // Generated slug
    const generatedSlug = getProductSlug(products[0]);
    expect(findProductBySlugOrId(products, generatedSlug)?.id).toBe('1740523491298');

    // Short path or decoded param
    expect(findProductBySlugOrId(products, 'awei-pa-103-491298')?.id).toBe('1740523491298');

    // Facebook / Social click with trailing slash or query params
    expect(findProductBySlugOrId(products, 'awei-pa-103-491298/')?.id).toBe('1740523491298');
    expect(findProductBySlugOrId(products, 'awei-pa-103-30000mah-22.5w-power-bank-1740523491298')?.id).toBe('1740523491298');
  });

  it('correctly extracts product ID from various Facebook and Deep Link URLs', () => {
    // Test URL formats
    const extractTest = (path: string, search: string) => {
      const urlParams = new URLSearchParams(search);
      const queryId = urlParams.get('product') || urlParams.get('p') || urlParams.get('landing') || urlParams.get('id');
      if (queryId) return queryId;
      if (path.startsWith('/product/')) return path.replace(/^\/product\//, '').replace(/\/+$/, '').split('/')[0].split('?')[0];
      if (path.startsWith('/p/')) return path.replace(/^\/p\//, '').replace(/\/+$/, '').split('/')[0].split('?')[0];
      return null;
    };

    // Facebook clicked link with fbclid
    expect(extractTest('/product/awei-pa-103-30000mah-1740523491298', '?fbclid=IwAR234567')).toBe('awei-pa-103-30000mah-1740523491298');
    
    // Facebook link with trailing slash & fbclid
    expect(extractTest('/product/awei-pa-103-30000mah-1740523491298/', '?fbclid=IwAR234567')).toBe('awei-pa-103-30000mah-1740523491298');

    // Query param style with fbclid (?p=...&fbclid=...)
    expect(extractTest('/', '?p=1740523491298&fbclid=IwAR234567')).toBe('1740523491298');
    expect(extractTest('/', '?product=1740523491298&utm_source=facebook')).toBe('1740523491298');
  });

  it('filters public products: excludes deleted and isPublished===false for public users', () => {
    const products = [
      { id: '1', name: 'Active Published Fan', isPublished: true, deleted: false },
      { id: '2', name: 'Default Published Watch', deleted: false }, // undefined isPublished defaults to true
      { id: '3', name: 'Unpublished Item', isPublished: false, deleted: false },
      { id: '4', name: 'Deleted Item', isPublished: true, deleted: true }
    ];

    const publicVisible = products.filter(p => !p.deleted && p.isPublished !== false);
    expect(publicVisible.map(p => p.id)).toEqual(['1', '2']);
  });

  it('decouples global search from previously selected category or brand filters', () => {
    const products = [
      { id: 'p1', name: 'Rechargeable Mini Fan', category: 'Charger Fan', brand: 'Remax', code: 'FAN-101', tags: 'cooling, portable', isPublished: true, deleted: false },
      { id: 'p2', name: 'Smart Watch Series 9', category: 'Smart Watch', brand: 'Joyroom', code: 'WAT-202', tags: 'amoled, calling', isPublished: true, deleted: false },
      { id: 'p3', name: 'Bluetooth Headphone Pro', category: 'Headphone', brand: 'Awei', code: 'HED-303', tags: 'bass, wireless', isPublished: true, deleted: false }
    ];

    const filterProducts = (query: string, selectedCategory: string, selectedBrand: string) => {
      const q = query.trim().toLowerCase();
      const selCat = selectedCategory.trim().toLowerCase();
      const selBrand = selectedBrand.trim().toLowerCase();
      const isSearching = q.length > 0;

      return products.filter(p => {
        if (p.deleted || p.isPublished === false) return false;
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        const code = (p.code || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const tags = (p.tags || '').toLowerCase();

        const matchesSearch = !isSearching || name.includes(q) || category.includes(q) || code.includes(q) || brand.includes(q) || tags.includes(q);
        const matchesCategory = isSearching || selCat === 'all' || category === selCat;
        const matchesBrand = isSearching || selBrand === 'all' || brand === selBrand;

        return matchesSearch && matchesCategory && matchesBrand;
      });
    };

    // When on category "Charger Fan", typing "Watch" should return Watch across the whole catalog
    const searchResults = filterProducts('watch', 'Charger Fan', 'Remax');
    expect(searchResults.map(p => p.id)).toEqual(['p2']);

    // Searching by product code across all categories
    const codeResults = filterProducts('HED-303', 'Charger Fan', 'all');
    expect(codeResults.map(p => p.id)).toEqual(['p3']);

    // Searching by tags
    const tagResults = filterProducts('portable', 'all', 'all');
    expect(tagResults.map(p => p.id)).toEqual(['p1']);

    // When query is empty, category filtering works as expected
    const categoryOnly = filterProducts('', 'Charger Fan', 'all');
    expect(categoryOnly.map(p => p.id)).toEqual(['p1']);
  });

  it('toLeanProductCache: replaces massive base64 images and removes bulky landingConfig', () => {
    const hugeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(50000);
    const products = [
      {
        id: 'prod-123',
        name: 'Wireless Mic Pro',
        price: 3200,
        image: hugeBase64,
        images: [hugeBase64, 'https://cdn.example.com/photo.jpg'],
        landingConfig: { sections: [{ title: 'Overview', image: hugeBase64 }] },
        description: 'A'.repeat(2000),
        category: 'Microphone',
        isPublished: true,
        deleted: false
      }
    ];

    const lean = toLeanProductCache(products);
    expect(lean[0].landingConfig).toBeUndefined();
    expect(lean[0].image).toBe('/api/product-image/prod-123');
    expect(lean[0].images[0]).toBe('/api/product-image/prod-123?index=0');
    expect(lean[0].images[1]).toBe('https://cdn.example.com/photo.jpg');
    expect(lean[0].description.length).toBe(500);

    // Verify massive size reduction
    const rawSize = JSON.stringify(products).length;
    const leanSize = JSON.stringify(lean).length;
    expect(leanSize).toBeLessThan(rawSize / 100);
  });

  it('safeSetLocalStorage & safeGetLocalStorage: never throw on quota error and handles storage safely', () => {
    // Normal storage
    safeSetLocalStorage('test_key', 'test_value');
    expect(safeGetLocalStorage('test_key')).toBe('test_value');

    // Simulate quota exceeded error on setItem
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      const err = new Error('Storage set Item quota limit exceeded');
      err.name = 'QuotaExceededError';
      throw err;
    });

    // Should return false and not crash
    expect(() => {
      const result = safeSetLocalStorage('overflow_key', 'large_data');
      expect(result).toBe(false);
    }).not.toThrow();

    // Restore
    localStorage.setItem = originalSetItem;
  });

  it('handles empty, full, and blocked localStorage scenarios gracefully', () => {
    // 1. Empty storage scenario
    localStorage.clear();
    expect(safeGetLocalStorage('non_existent_key')).toBeNull();
    const emptyProducts = safeGetLocalStorage(STORAGE_KEYS.PRODUCTS);
    expect(emptyProducts).toBeNull();

    // 2. Blocked storage scenario (e.g. SecurityError in private browsing)
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;

    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('Access is denied for this document');
    });
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Access is denied for this document');
    });

    // Should return null for get and false for set without throwing
    expect(safeGetLocalStorage('any_key')).toBeNull();
    expect(safeSetLocalStorage('any_key', 'value')).toBe(false);
    expect(saveProductsToCache([{ id: 'p1', name: 'Item', price: 100 }])).toBe(false);

    // Restore
    localStorage.getItem = originalGetItem;
    localStorage.setItem = originalSetItem;
  });

  it('normalizes numbers and formats without discrepancy', () => {
    expect(calculateDiscountPercent(2000, 1500)).toBe(25);
    expect(calculateCartTotal([{ price: 999, quantity: 3 }])).toBe(2997);
    expect(isValidBangladeshPhone('01712345678')).toBe(true);
    expect(isValidBangladeshPhone('+8801912345678')).toBe(true);
    expect(isValidBangladeshPhone('01212345678')).toBe(false); // Invalid operator prefix
  });
});
