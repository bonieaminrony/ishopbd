/**
 * constants/data.ts — Static data tests
 * নিশ্চিত করে যে default data সঠিকভাবে export হচ্ছে।
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_BANNERS,
  BENGALI_FONTS,
  MASTER_EMAILS,
  NOTIF_SOUND_URL,
} from '../constants/data';

describe('DEFAULT_CATEGORIES', () => {
  it('কমপক্ষে একটি ক্যাটাগরি থাকতে হবে', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('প্রতিটি ক্যাটাগরিতে id এবং name থাকতে হবে', () => {
    DEFAULT_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
    });
  });

  it('সব id unique হতে হবে', () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('DEFAULT_PRODUCTS', () => {
  it('কমপক্ষে একটি পণ্য থাকতে হবে', () => {
    expect(DEFAULT_PRODUCTS.length).toBeGreaterThan(0);
  });

  it('প্রতিটি পণ্যে id, name, price, image, category থাকতে হবে', () => {
    DEFAULT_PRODUCTS.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.price).toBeGreaterThan(0);
      expect(p.image).toBeTruthy();
      expect(p.category).toBeTruthy();
    });
  });

  it('সব id unique হতে হবে', () => {
    const ids = DEFAULT_PRODUCTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('discount পণ্যের originalPrice, price-এর চেয়ে বেশি হতে হবে', () => {
    DEFAULT_PRODUCTS.filter((p) => p.discount > 0).forEach((p) => {
      expect(p.originalPrice).toBeGreaterThan(p.price);
    });
  });

  it('discount 0-100 এর মধ্যে হতে হবে', () => {
    DEFAULT_PRODUCTS.forEach((p) => {
      expect(p.discount).toBeGreaterThanOrEqual(0);
      expect(p.discount).toBeLessThanOrEqual(100);
    });
  });

  it('যে পণ্যে variants আছে তাতে সব variant-এ id থাকতে হবে', () => {
    DEFAULT_PRODUCTS.filter((p) => p.variants && p.variants.length > 0).forEach((p) => {
      p.variants!.forEach((v) => {
        expect(v.id).toBeTruthy();
        expect(v.stock).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

describe('DEFAULT_BANNERS', () => {
  it('অন্তত একটি banner থাকতে হবে', () => {
    expect(DEFAULT_BANNERS.length).toBeGreaterThan(0);
  });

  it('প্রতিটি banner-এ image URL থাকতে হবে', () => {
    DEFAULT_BANNERS.forEach((b) => {
      expect(b.image).toMatch(/^https?:\/\//);
    });
  });
});

describe('BENGALI_FONTS', () => {
  it('অন্তত একটি font থাকতে হবে', () => {
    expect(BENGALI_FONTS.length).toBeGreaterThan(0);
  });

  it('প্রতিটি font-এ name এবং value থাকতে হবে', () => {
    BENGALI_FONTS.forEach((f) => {
      expect(f.name).toBeTruthy();
      expect(f.value).toBeTruthy();
    });
  });
});

describe('MASTER_EMAILS', () => {
  it('master emails থাকতে হবে', () => {
    expect(MASTER_EMAILS.length).toBeGreaterThan(0);
  });

  it('সব email valid format-এ হতে হবে', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    MASTER_EMAILS.forEach((email) => {
      expect(email).toMatch(emailRegex);
    });
  });
});

describe('NOTIF_SOUND_URL', () => {
  it('valid URL হতে হবে', () => {
    expect(NOTIF_SOUND_URL).toMatch(/^https?:\/\//);
  });
});
