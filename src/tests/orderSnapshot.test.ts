import { describe, it, expect } from 'vitest';
import { orderImageRef, slimVariants, approxDocBytes, ORDER_DOC_SAFE_BYTES } from '../utils/orderSnapshot';

const bigPhoto = 'data:image/jpeg;base64,' + 'A'.repeat(150_000);

describe('order snapshots stay under the 1 MB Firestore limit', () => {
  it('replaces inline photos with the product photo link', () => {
    expect(orderImageRef('koti-1', bigPhoto)).toBe('/api/product-image/koti-1');
    expect(orderImageRef('koti-1', 'https://cdn.example.com/a.webp')).toBe('https://cdn.example.com/a.webp');
    expect(orderImageRef('koti-1', '/api/product-image/koti-1?v=abc')).toBe('/api/product-image/koti-1?v=abc');
    expect(orderImageRef('custom_1', bigPhoto)).toBe('');
    expect(orderImageRef('x', '')).toBe('');
  });

  it('keeps variant names and sizes, drops photos', () => {
    expect(slimVariants([{ id: 7, name: 'Navy', size: 'XL', stock: 3, image: bigPhoto }])).toEqual([
      { id: '7', name: 'Navy', size: 'XL' },
    ]);
  });

  it('a 13-item order with photo-heavy products fits easily (the reported failure was 1.9 MB)', () => {
    const variants = Array.from({ length: 5 }, (_, i) => ({ id: `v${i}`, name: 'Black', size: ['M', 'L', 'XL', '2XL', '3XL'][i], image: bigPhoto }));
    const items = Array.from({ length: 13 }, (_, i) => ({
      product: { id: `p${i}`, name: 'Premium Koti', image: orderImageRef(`p${i}`, bigPhoto), variants: slimVariants(variants) },
      quantity: 1,
      size: 'XL',
    }));
    expect(approxDocBytes({ items })).toBeLessThan(20_000);
    expect(approxDocBytes({ items })).toBeLessThan(ORDER_DOC_SAFE_BYTES);
  });
});
