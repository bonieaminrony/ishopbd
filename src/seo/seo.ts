/**
 * The one place that decides page titles, descriptions, canonical links and
 * structured data for the storefront.
 *
 * The same rules are mirrored in public/index.php (first HTML a search engine sees)
 * and public/api/sitemap.php. If you change a rule here, change it there too.
 * See SEO.md at the project root.
 */
import { getCategoryPath, getProductPath } from '../utils/helpers';

export const SITE = {
  name: 'iShopBD',
  altNames: ['i SHOP BD', 'ishopbd', 'ishop bd', 'iShop BD', 'আই শপ বিডি', 'ishopbd.com'],
  url: 'https://ishopbd.com',
  logo: 'https://ishopbd.com/logo.png',
  ogImage: 'https://ishopbd.com/og-image.png',
};

const TITLE_MAX = 70;
const DESC_MAX = 158;

export interface SeoData {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  ogType: 'website' | 'product';
  image: string;
  /** JSON-LD blocks keyed by element id; null removes the block. */
  jsonLd: Record<string, object | null>;
  price?: number;
}

/* ----------------------------------------------------------------- helpers */

export const collapse = (s: string) => String(s || '').replace(/\s+/g, ' ').trim();

export const stripHtml = (html: string) =>
  collapse(String(html || '').replace(/<[^>]*>?/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'));

/** Cut at a word boundary and add an ellipsis when the text is too long. */
export function clip(text: string, max: number): string {
  const t = collapse(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:|–—-]+$/, '')}…`;
}

/**
 * Product names in the shop often carry their own SEO tails ("| Price In Bangladesh",
 * "Best Price in BD", "| iShop BD"). Remove them so the title can add one clean tail.
 */
export function cleanProductName(name: string): string {
  let s = collapse(name);
  s = s.replace(/\b(best\s+)?price\s+in\s+(bangladesh|bd)\b/gi, ' ');
  s = s.replace(/\b(i\s*shop\s*bd|ishopbd(\.com)?)\b/gi, ' ');
  s = s.replace(/\s*[|–—-]\s*(?=[|–—-]|$)/g, ' ');
  s = s.replace(/^[\s|–—-]+|[\s|–—-]+$/g, '');
  s = s.replace(/\s*\|\s*\|\s*/g, ' | ');
  return collapse(s) || collapse(name);
}

export function absoluteUrl(url: string | undefined | null, fallback = SITE.ogImage): string {
  const u = String(url || '').trim();
  if (!u || u.startsWith('data:')) return fallback;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE.url}${u.startsWith('/') ? '' : '/'}${u}`;
}

const isPublished = (p: any) => p && !p.deleted && p.isPublished !== false;

/** Same rule as the product page badge. */
export function productAvailability(p: any): 'InStock' | 'OutOfStock' | 'PreOrder' {
  if (p?.isComingSoon) return 'PreOrder';
  const variants = Array.isArray(p?.variants) ? p.variants : [];
  if (variants.length > 0) {
    return variants.every((v: any) => (Number(v?.stock) || 0) <= 0) ? 'OutOfStock' : 'InStock';
  }
  if (p?.stock === undefined || p?.stock === null || p?.stock === '') return 'InStock';
  return Number(p.stock) > 0 ? 'InStock' : 'OutOfStock';
}

export function productImageUrl(p: any): string {
  const img = String(p?.image || '');
  if (img.startsWith('data:') && p?.id) return `${SITE.url}/api/product-image/${encodeURIComponent(p.id)}`;
  return absoluteUrl(img);
}

const money = (n: number) => `৳${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

/* ----------------------------------------------------------------- titles */

export function productTitle(p: any): string {
  const name = cleanProductName(p?.name || '');
  const head = collapse(name.split(' | ')[0]);
  const brand = ` | ${SITE.name}`;
  const options = [
    `${name} Price in Bangladesh${brand}`,
    `${name}${brand}`,
    head !== name ? `${head} Price in BD${brand}` : '',
    `${head}${brand}`,
  ];
  const fit = options.find((t) => t && t.length <= TITLE_MAX);
  return fit || `${clip(head, TITLE_MAX - brand.length)}${brand}`;
}

export function productDescription(p: any): string {
  const name = cleanProductName(p?.name || '');
  const price = Number(p?.price) || 0;
  const tail = `দাম ${money(price)}। ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে হোম ডেলিভারি।`;
  const custom = stripHtml(p?.metaDescription || '');
  if (custom.length >= 50) return clip(custom, DESC_MAX);
  const about = stripHtml(p?.shortDescription || p?.description || '');
  const lead = about && about.toLowerCase() !== name.toLowerCase() ? about : `${name} কিনুন ${SITE.name} থেকে।`;
  const room = DESC_MAX - tail.length - 1;
  return `${clip(lead, Math.max(60, room))} ${tail}`;
}

export function categoryTitle(category: string, sub?: string | null): string {
  const hasSub = sub && sub.toLowerCase() !== 'all';
  const t = hasSub ? `${sub} Price in Bangladesh – ${category} | ${SITE.name}` : `${category} Price in Bangladesh | ${SITE.name}`;
  return t.length <= TITLE_MAX ? t : hasSub ? `${sub} – ${category} | ${SITE.name}` : `${category} | ${SITE.name}`;
}

export function categoryDescription(category: string, sub: string | null | undefined, items: any[]): string {
  const label = sub && sub.toLowerCase() !== 'all' ? `${sub} (${category})` : category;
  const names = items.slice(0, 3).map((p) => clip(cleanProductName(p.name), 34)).join(', ');
  const count = items.length;
  const base = count
    ? `${label} এর ${count}টি পণ্য সেরা দামে: ${names}।`
    : `${label} সেরা দামে কিনুন ${SITE.name} থেকে।`;
  return clip(`${base} ক্যাশ অন ডেলিভারি, সারা বাংলাদেশে হোম ডেলিভারি।`, DESC_MAX);
}

export function publishedCategories(products: any[]): string[] {
  const seen = new Map<string, number>();
  for (const p of products || []) {
    if (!isPublished(p) || !p.category) continue;
    seen.set(p.category, (seen.get(p.category) || 0) + 1);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

export function homeTitle(): string {
  return `${SITE.name} (আই শপ বিডি) | Online Shopping in Bangladesh`;
}

export function homeDescription(products: any[]): string {
  const cats = publishedCategories(products).slice(0, 5).join(', ');
  return clip(
    `${SITE.name} (আই শপ বিডি) – বাংলাদেশের অনলাইন শপ${cats ? `: ${cats}` : ''}। আসল পণ্য, সেরা দাম, ক্যাশ অন ডেলিভারি ও সারা দেশে হোম ডেলিভারি।`,
    DESC_MAX,
  );
}

/* ------------------------------------------------------------ structured data */

function breadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function productJsonLd(p: any, now = new Date()) {
  const url = `${SITE.url}${getProductPath(p)}`;
  const images = [productImageUrl(p), ...((Array.isArray(p?.images) ? p.images : []) as string[]).map((u) => absoluteUrl(u, ''))]
    .filter((u, i, a) => u && a.indexOf(u) === i)
    .slice(0, 6);
  const price = Number(p?.price) || 0;
  const oneYear = new Date(now.getTime());
  oneYear.setUTCFullYear(oneYear.getUTCFullYear() + 1);
  const custom = Number(p?.deliveryCharge);
  const shippingRates: Array<{ value: number; region?: string }> = p?.isFreeDelivery
    ? [{ value: 0 }]
    : custom > 0
      ? [{ value: custom }]
      : [{ value: 70, region: 'Dhaka' }, { value: 130 }];
  const description = stripHtml(p?.shortDescription || p?.description || '') || `${cleanProductName(p?.name || '')} – ${SITE.name}`;

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: cleanProductName(p?.name || ''),
    description: clip(description, 5000),
    image: images,
    url,
    sku: String(p?.code || p?.id || ''),
    ...(p?.code ? { mpn: String(p.code) } : {}),
    ...(p?.category ? { category: p.subcategory ? `${p.category} > ${p.subcategory}` : p.category } : {}),
    ...(p?.brand && String(p.brand).trim() && !/^china$/i.test(String(p.brand).trim())
      ? { brand: { '@type': 'Brand', name: collapse(p.brand) } }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BDT',
      price,
      priceValidUntil: oneYear.toISOString().slice(0, 10),
      availability: `https://schema.org/${productAvailability(p)}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      shippingDetails: shippingRates.map((r) => ({
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: r.value, currency: 'BDT' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'BD', ...(r.region ? { addressRegion: r.region } : {}) },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: r.region ? 2 : 4, unitCode: 'DAY' },
        },
      })),
    },
  };

  const rating = Number(p?.rating) || 0;
  const reviewCount = Number(p?.reviewCount) || 0;
  if (rating > 0 && reviewCount > 0) {
    schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: Math.min(5, rating), reviewCount, bestRating: 5 };
  }
  return schema;
}

/* ---------------------------------------------------------------- builders */

export function buildProductSeo(p: any): SeoData {
  const url = `${SITE.url}${getProductPath(p)}`;
  const crumbs = [{ name: SITE.name, url: `${SITE.url}/` }];
  if (p?.category) crumbs.push({ name: p.category, url: `${SITE.url}${getCategoryPath(p.category)}` });
  if (p?.category && p?.subcategory) crumbs.push({ name: p.subcategory, url: `${SITE.url}${getCategoryPath(p.category, p.subcategory)}` });
  crumbs.push({ name: cleanProductName(p?.name || ''), url });
  return {
    title: productTitle(p),
    description: productDescription(p),
    canonical: url,
    ogType: 'product',
    image: productImageUrl(p),
    price: Number(p?.price) || 0,
    jsonLd: { 'seo-ld-page': productJsonLd(p), 'seo-ld-breadcrumb': breadcrumb(crumbs) },
    robots: isPublished(p) ? undefined : 'noindex,follow',
  };
}

export function buildCategorySeo(category: string, sub: string | null | undefined, products: any[]): SeoData {
  const hasSub = Boolean(sub && sub.toLowerCase() !== 'all');
  const url = `${SITE.url}${getCategoryPath(category, hasSub ? sub : null)}`;
  const items = (products || []).filter(
    (p) => isPublished(p) && p.category === category && (!hasSub || String(p.subcategory || '') === sub),
  );
  const crumbs = [
    { name: SITE.name, url: `${SITE.url}/` },
    { name: category, url: `${SITE.url}${getCategoryPath(category)}` },
    ...(hasSub ? [{ name: String(sub), url }] : []),
  ];
  return {
    title: categoryTitle(category, hasSub ? sub : null),
    description: categoryDescription(category, hasSub ? sub : null, items),
    canonical: url,
    ogType: 'website',
    image: items[0] ? productImageUrl(items[0]) : SITE.ogImage,
    jsonLd: {
      'seo-ld-page': {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: hasSub ? `${sub} – ${category}` : category,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items.slice(0, 50).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}${getProductPath(p)}`,
            name: cleanProductName(p.name),
          })),
        },
      },
      'seo-ld-breadcrumb': breadcrumb(crumbs),
    },
  };
}

export function buildHomeSeo(products: any[]): SeoData {
  return {
    title: homeTitle(),
    description: homeDescription(products),
    canonical: `${SITE.url}/`,
    ogType: 'website',
    image: SITE.ogImage,
    jsonLd: { 'seo-ld-page': null, 'seo-ld-breadcrumb': null },
  };
}

export function buildPrivateSeo(title: string): SeoData {
  return {
    title: `${title} | ${SITE.name}`,
    description: homeDescription([]),
    canonical: `${SITE.url}/`,
    robots: 'noindex,follow',
    ogType: 'website',
    image: SITE.ogImage,
    jsonLd: { 'seo-ld-page': null, 'seo-ld-breadcrumb': null },
  };
}

/* ------------------------------------------------------------- DOM writer */

const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function upsertOne(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  const all = Array.from(document.head.querySelectorAll(selector)) as HTMLElement[];
  const el = all[0] || create();
  all.slice(1).forEach((dup) => dup.remove());
  set(el);
  if (!el.parentNode) document.head.appendChild(el);
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  const selector = `meta[${attr}="${key}"]`;
  if (content === null) {
    document.head.querySelectorAll(selector).forEach((el) => el.remove());
    return;
  }
  upsertOne(selector, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, key);
    return m;
  }, (el) => el.setAttribute('content', content));
}

/** Writes one consistent set of head tags. Safe to call on every route change. */
export function applySeo(data: SeoData) {
  if (typeof document === 'undefined') return;
  document.title = data.title;
  setMeta('name', 'description', data.description);
  setMeta('name', 'robots', data.robots || DEFAULT_ROBOTS);
  setMeta('name', 'keywords', null);
  setMeta('property', 'og:type', data.ogType);
  setMeta('property', 'og:title', data.title);
  setMeta('property', 'og:description', data.description);
  setMeta('property', 'og:url', data.canonical);
  setMeta('property', 'og:image', data.image);
  setMeta('property', 'og:image:secure_url', data.image);
  setMeta('property', 'og:site_name', SITE.name);
  setMeta('property', 'product:price:amount', data.ogType === 'product' ? String(data.price ?? '') : null);
  setMeta('property', 'product:price:currency', data.ogType === 'product' ? 'BDT' : null);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', data.title);
  setMeta('name', 'twitter:description', data.description);
  setMeta('name', 'twitter:image', data.image);
  document.head.querySelectorAll('meta[name="twitter:url"]').forEach((el) => el.remove());

  upsertOne('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  }, (el) => el.setAttribute('href', data.canonical));

  // Old page-level blocks written before this module existed.
  ['seo-json-ld', 'seo-breadcrumb-ld'].forEach((id) => document.getElementById(id)?.remove());
  for (const [id, block] of Object.entries(data.jsonLd)) {
    const existing = document.getElementById(id);
    if (block === null) {
      existing?.remove();
      continue;
    }
    const script = existing || document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.id = id;
    script.textContent = JSON.stringify(block);
    if (!existing) document.head.appendChild(script);
  }
}
