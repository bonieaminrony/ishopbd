/**
 * Server API Logic Tests
 * Coupon validation, phone formatting, price verification logic tests.
 */
import { describe, it, expect } from 'vitest';

// ---- Coupon Discount Calculation Logic ----
// (server.ts /api/validate-coupon থেকে নেওয়া একই logic)

function calculateCouponDiscount(
  type: 'percent' | 'fixed' | 'free_delivery',
  value: number,
  cartTotal: number,
  maxDiscount?: number
): { discountAmount: number; discountLabel: string } {
  let discountAmount = 0;
  let discountLabel = "";

  if (type === "percent") {
    discountAmount = Math.round(cartTotal * (value / 100));
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
    discountLabel = `${value}% Off`;
  } else if (type === "fixed") {
    discountAmount = Math.min(value, cartTotal);
    discountLabel = `৳${value} Off`;
  } else if (type === "free_delivery") {
    discountAmount = 0;
    discountLabel = "Free Delivery";
  }

  return { discountAmount, discountLabel };
}

// ---- Phone Number Formatting (BulkSMSBD Format) ----
function formatBangladeshPhone(phone: string): string {
  const banglaToEnglish: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let p = String(phone || "").trim();
  p = p.replace(/[০-৯]/g, (m) => banglaToEnglish[m] || m);
  const isPlus = p.startsWith("+");
  p = p.replace(/\D/g, "");
  if (isPlus) p = "+" + p;
  if (p.startsWith("+")) p = p.substring(1);
  if (p.startsWith("01") && p.length === 11) p = "88" + p;
  return p;
}

// ---- Price Verification (server-side order check logic) ----
function verifyOrderTotal(
  clientSubtotal: number,
  clientDelivery: number,
  clientPointsDiscount: number,
  clientCouponDiscount: number,
  clientTotal: number
): { valid: boolean; error?: string } {
  const expectedTotal = clientSubtotal + clientDelivery - clientPointsDiscount - clientCouponDiscount;
  if (Math.abs(clientTotal - expectedTotal) > 5) {
    return { valid: false, error: `Total mismatch: client=${clientTotal}, expected=${expectedTotal}` };
  }
  return { valid: true };
}

// =================== TESTS ===================

describe('Coupon Discount Calculation', () => {
  it('percent type — 10% of 1000 = 100', () => {
    const result = calculateCouponDiscount('percent', 10, 1000);
    expect(result.discountAmount).toBe(100);
    expect(result.discountLabel).toBe('10% Off');
  });

  it('percent type — maxDiscount cap applies', () => {
    // 50% of 1000 = 500, but capped at 200
    const result = calculateCouponDiscount('percent', 50, 1000, 200);
    expect(result.discountAmount).toBe(200);
  });

  it('fixed type — ৳150 off 1000 = 150', () => {
    const result = calculateCouponDiscount('fixed', 150, 1000);
    expect(result.discountAmount).toBe(150);
    expect(result.discountLabel).toBe('৳150 Off');
  });

  it('fixed type — cannot exceed cart total', () => {
    // ৳500 off but cart is only ৳300
    const result = calculateCouponDiscount('fixed', 500, 300);
    expect(result.discountAmount).toBe(300);
  });

  it('free_delivery type — discountAmount is 0', () => {
    const result = calculateCouponDiscount('free_delivery', 0, 1000);
    expect(result.discountAmount).toBe(0);
    expect(result.discountLabel).toBe('Free Delivery');
  });

  it('percent rounding — 15% of 1333 rounds correctly', () => {
    const result = calculateCouponDiscount('percent', 15, 1333);
    expect(result.discountAmount).toBe(200); // Math.round(1333 * 0.15) = Math.round(199.95) = 200
  });
});

describe('Phone Number Formatting', () => {
  it('01XXXXXXXXX → 8801XXXXXXXXX', () => {
    expect(formatBangladeshPhone('01777600844')).toBe('8801777600844');
  });

  it('+880XXXXXXXXX → 880XXXXXXXXX', () => {
    expect(formatBangladeshPhone('+8801777600844')).toBe('8801777600844');
  });

  it('Bengali digits converted', () => {
    expect(formatBangladeshPhone('০১৭৭৭৬০০৮৪৪')).toBe('8801777600844');
  });

  it('Already formatted 880... stays same', () => {
    expect(formatBangladeshPhone('8801777600844')).toBe('8801777600844');
  });

  it('Spaces and dashes stripped', () => {
    expect(formatBangladeshPhone('017 77-60 08 44')).toBe('8801777600844');
  });
});

describe('Order Total Verification', () => {
  it('valid order passes', () => {
    // subtotal=1000, delivery=60, points=0, coupon=0, total=1060
    const result = verifyOrderTotal(1000, 60, 0, 0, 1060);
    expect(result.valid).toBe(true);
  });

  it('order with points discount passes', () => {
    // subtotal=1000, delivery=60, points=100, coupon=0, total=960
    const result = verifyOrderTotal(1000, 60, 100, 0, 960);
    expect(result.valid).toBe(true);
  });

  it('order with coupon discount passes', () => {
    // subtotal=2000, delivery=120, points=0, coupon=200, total=1920
    const result = verifyOrderTotal(2000, 120, 0, 200, 1920);
    expect(result.valid).toBe(true);
  });

  it('manipulated total is caught', () => {
    // Client says total=500 but expected=1060
    const result = verifyOrderTotal(1000, 60, 0, 0, 500);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('small rounding difference (≤5) allowed', () => {
    // expected=1060, client=1062 (2 difference — within ৳5 tolerance)
    const result = verifyOrderTotal(1000, 60, 0, 0, 1062);
    expect(result.valid).toBe(true);
  });

  it('difference >5 is rejected', () => {
    // expected=1060, client=1067 (7 difference — over ৳5 tolerance)
    const result = verifyOrderTotal(1000, 60, 0, 0, 1067);
    expect(result.valid).toBe(false);
  });
});
