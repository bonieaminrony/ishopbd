import { describe, it, expect } from 'vitest';
import {
  cleanProductName, productTitle, productDescription, categoryTitle, productAvailability,
  productJsonLd, buildProductSeo, buildCategorySeo, buildHomeSeo, applySeo,
} from './seo';

const product = {
  id: 'abc123XYZ', name: 'Ven-Dens 20000mAh Power Bank (VD-PB059) - Best Price in BD', price: 1550,
  category: 'Gadgets', subcategory: 'Power Bank', brand: 'Ven Dens', code: 'VD-PB059',
  image: '/api/product-image/abc123XYZ?v=1', description: '<p>20000mAh fast charging power bank.</p>',
  variants: [{ name: 'Black', stock: 3 }, { name: 'White', stock: 0 }],
};

describe('product names and titles', () => {
  it('removes SEO tails the shop added to names', () => {
    expect(cleanProductName(product.name)).toBe('Ven-Dens 20000mAh Power Bank (VD-PB059)');
    expect(cleanProductName('Rado Watch Price in Bangladesh | iShop BD')).toBe('Rado Watch');
    expect(cleanProductName(' JYSUPER JY-2570 | রিচার্জেবল ফ্যান | Price In Bangladesh')).toBe('JYSUPER JY-2570 | রিচার্জেবল ফ্যান');
  });
  it('keeps titles within 70 characters and always ends with the shop name', () => {
    const long = { name: 'PLOKAMA CX-60 Neck Bracket Hands-Free Mount for Action Camera & Smartphone' };
    for (const p of [product, long]) {
      const t = productTitle(p);
      expect(t.length).toBeLessThanOrEqual(70);
      expect(t.endsWith('| iShopBD')).toBe(true);
    }
    expect(productTitle(product)).toBe('Ven-Dens 20000mAh Power Bank (VD-PB059) Price in Bangladesh | iShopBD');
  });
  it('writes a description with price and delivery, under 160 characters', () => {
    const d = productDescription(product);
    expect(d).toContain('৳1,550');
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d).not.toContain('<p>');
  });
  it('uses the custom meta description when the admin wrote one', () => {
    const custom = 'হাতে বহনযোগ্য ২০০০০ এমএএইচ পাওয়ার ব্যাংক, দ্রুত চার্জিং আর দুটি ইউএসবি পোর্ট সহ।';
    expect(productDescription({ ...product, metaDescription: custom })).toBe(custom);
  });
  it('builds category titles', () => {
    expect(categoryTitle('Gadgets')).toBe('Gadgets Price in Bangladesh | iShopBD');
    expect(categoryTitle('Gadgets', 'Microphone')).toBe('Microphone Price in Bangladesh – Gadgets | iShopBD');
  });
});

describe('structured data', () => {
  it('matches the stock badge on the product page', () => {
    expect(productAvailability(product)).toBe('InStock');
    expect(productAvailability({ variants: [{ stock: 0 }] })).toBe('OutOfStock');
    expect(productAvailability({ isComingSoon: true })).toBe('PreOrder');
    expect(productAvailability({})).toBe('InStock');
  });
  it('produces a valid Product with absolute URLs and no made-up dates', () => {
    const ld: any = productJsonLd(product, new Date('2026-11-27T00:00:00Z'));
    expect(ld['@type']).toBe('Product');
    expect(ld.url).toMatch(/^https:\/\/ishopbd\.com\/p\//);
    expect(ld.image[0]).toBe('https://ishopbd.com/api/product-image/abc123XYZ?v=1');
    expect(ld.offers.priceValidUntil).toBe('2027-11-27');
    expect(ld.offers.validFrom).toBeUndefined();
    expect(ld.brand.name).toBe('Ven Dens');
    expect(ld.aggregateRating).toBeUndefined();
    expect(JSON.stringify(ld)).not.toMatch(/19[0-9]{2}-/);
  });
  it('leaves out a meaningless brand', () => {
    expect((productJsonLd({ ...product, brand: 'China' }) as any).brand).toBeUndefined();
  });
});

describe('page data', () => {
  it('gives product, category and home pages one canonical each', () => {
    expect(buildProductSeo(product).canonical).toMatch(/^https:\/\/ishopbd\.com\/p\//);
    expect(buildCategorySeo('Gadgets', 'Power Bank', [product]).canonical).toBe('https://ishopbd.com/category/gadgets/power-bank');
    expect(buildHomeSeo([product]).canonical).toBe('https://ishopbd.com/');
  });
});

describe('applySeo', () => {
  it('leaves exactly one of each tag after repeated calls and removes old duplicates', () => {
    document.head.innerHTML = `
      <title>old</title>
      <meta name="description" content="a"><meta name="description" content="b">
      <meta name="keywords" content="x">
      <link rel="canonical" href="https://ishopbd.com/"><link rel="canonical" href="https://ishopbd.com/x">
      <script type="application/ld+json" id="seo-json-ld">{}</script>`;
    applySeo(buildProductSeo(product));
    applySeo(buildCategorySeo('Gadgets', null, [product]));
    expect(document.title).toBe('Gadgets Price in Bangladesh | iShopBD');
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.head.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://ishopbd.com/category/gadgets');
    expect(document.head.querySelector('meta[name="keywords"]')).toBeNull();
    expect(document.getElementById('seo-json-ld')).toBeNull();
    expect(JSON.parse(document.getElementById('seo-ld-page')!.textContent!)['@type']).toBe('CollectionPage');
    applySeo(buildHomeSeo([product]));
    expect(document.getElementById('seo-ld-page')).toBeNull();
  });
});
