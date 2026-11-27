/**
 * Small product snapshots for order documents.
 *
 * Firestore documents are limited to 1 MB. Product photos are often stored inline as base64
 * (100–300 KB each, more with variant photos), so copying a product into an order can push a
 * multi-item order past the limit ("cannot be written because its size exceeds the maximum").
 * Orders therefore keep only a link to the photo and the variant names/sizes, never the photo data.
 */

/** Links up to this length are kept as they are; anything bigger is treated as inline data. */
const MAX_IMAGE_LINK = 2048;

/** A photo reference that is safe to store in an order: a URL, or the product photo endpoint. */
export function orderImageRef(productId: unknown, image: unknown): string {
  const src = typeof image === 'string' ? image.trim() : '';
  if (!src) return '';
  if (src.startsWith('data:') || src.length > MAX_IMAGE_LINK) {
    const id = String(productId || '').trim();
    return id && !id.startsWith('custom_') ? `/api/product-image/${encodeURIComponent(id)}` : '';
  }
  return src;
}

/** Variant names and sizes (used to show options on the order), without photos or other data. */
export function slimVariants(variants: unknown): Array<{ id: string | null; name: string; size: string }> {
  if (!Array.isArray(variants)) return [];
  return variants
    .filter(Boolean)
    .map((v: any) => ({
      id: v?.id !== undefined && v?.id !== null ? String(v.id) : null,
      name: String(v?.name ?? ''),
      size: String(v?.size ?? ''),
    }));
}

const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.length < 200) : [];

export function slimColorsSizes(product: any): { colors: string[]; sizes: string[] } {
  return { colors: asStringList(product?.colors), sizes: asStringList(product?.sizes) };
}

/** Approximate stored size of a document, in bytes (UTF-8 JSON). */
export function approxDocBytes(data: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(data)).length;
  } catch {
    return 0;
  }
}

/** Firestore's hard limit is 1,048,576 bytes; leave room for field-name overhead and timestamps. */
export const ORDER_DOC_SAFE_BYTES = 900_000;
