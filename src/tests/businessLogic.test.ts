/**
 * Business Logic Tests
 * প্রাইস ক্যালকুলেশন, ডিসকাউন্ট, ডেলিভারি চার্জ ইত্যাদির test।
 */
import { describe, it, expect } from 'vitest';

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
});
