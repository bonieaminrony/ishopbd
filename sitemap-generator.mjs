/**
 * sitemap-generator.mjs
 * Generates an ultra-clean, Google Search Console compliant sitemap.xml
 * Features:
 *  - Canonical /p/:slug URLs for all published products
 *  - Canonical /category/:slug URLs for active categories
 *  - Automated Image Search Sitemap pointing to public image endpoints / proxy
 *  - Automatic exclusion of deleted and unpublished (hidden) items
 *
 * Run via: node sitemap-generator.mjs or npm run sitemap
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SITE_URL = 'https://ishopbd.com';
const TODAY = new Date().toISOString().split('T')[0];

function slugify(text, maxLen = 45) {
  if (!text) return "";
  let s = text
    .toString()
    .trim()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/@/g, " at ")
    .replace(/(\d)\.(\d)/g, "$1-$2")
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/[\s_–—-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (s.length > maxLen) {
    const cut = s.substring(0, maxLen);
    const lastHyphen = cut.lastIndexOf("-");
    s = (lastHyphen > 10 ? cut.substring(0, lastHyphen) : cut).replace(/-+$/, "");
  }

  return s.replace(/-+$/, "");
}

function getProductSlug(product) {
  if (!product) return "";
  if (product.slug && typeof product.slug === "string" && product.slug.trim()) {
    const custom = slugify(product.slug.trim(), 50);
    if (custom) return custom;
  }
  if (product.smsName && typeof product.smsName === "string" && product.smsName.trim().length >= 3) {
    const smsSlug = slugify(product.smsName.trim(), 35);
    const prodId = product.id ? String(product.id).trim() : "";
    if (smsSlug) {
      if (prodId && !smsSlug.includes(prodId.toLowerCase())) {
        const shortId = prodId.length > 8 ? prodId.slice(-6) : prodId;
        return `${smsSlug}-${shortId}`;
      }
      return smsSlug;
    }
  }
  const rawName = product.name || product.title || "";
  const nameSlug = slugify(rawName, 35);
  const prodId = product.id ? String(product.id).trim() : "";

  if (nameSlug && prodId) {
    if (nameSlug.endsWith(prodId.toLowerCase())) {
      return nameSlug;
    }
    const shortId = prodId.length > 8 ? prodId.slice(-6) : prodId;
    return `${nameSlug}-${shortId}`;
  }
  return nameSlug || prodId || "";
}

function getCategorySlug(categoryName) {
  if (!categoryName) return "";
  const name = String(categoryName).trim().toLowerCase();
  const CATEGORY_SLUG_MAP = {
    "charger fan": "charger-fan",
    "power bank": "power-bank",
    "smart watch": "smart-watch",
    "headphone": "headphone",
    "mobile accessories": "mobile-accessories",
    "lifestyle & watch": "lifestyle-watch",
    "lifestyle watch": "lifestyle-watch"
  };
  if (CATEGORY_SLUG_MAP[name]) return CATEGORY_SLUG_MAP[name];
  return name.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchProductsFromFirestore() {
  // Strategy 1: Firebase Client SDK
  try {
    const snap = await getDocs(collection(db, 'products'));
    const prods = [];
    snap.forEach(doc => {
      prods.push({ id: doc.id, ...doc.data() });
    });
    if (prods.length > 0) return prods;
  } catch (e) {
    console.warn('Firebase SDK getDocs warning:', e.message);
  }

  // Strategy 2: Firestore REST API Fallback
  try {
    const apiKey = firebaseConfig.apiKey || "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8";
    const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products?key=${apiKey}&pageSize=100`;
    const res = await axios.get(url, { timeout: 8000 });
    const docs = res.data?.documents || [];
    return docs.map(doc => {
      const id = doc.name.split('/').pop();
      const fields = doc.fields || {};
      return {
        id,
        name: fields.name?.stringValue || '',
        slug: fields.slug?.stringValue || '',
        category: fields.category?.stringValue || '',
        image: fields.image?.stringValue || '',
        price: fields.price?.integerValue || fields.price?.doubleValue || 0,
        isPublished: fields.isPublished ? fields.isPublished.booleanValue : true,
        deleted: fields.deleted ? fields.deleted.booleanValue : false
      };
    });
  } catch (restErr) {
    console.warn('Firestore REST API fallback warning:', restErr.message);
  }

  return [];
}

async function generateSitemap() {
  console.log('🚀 Generating optimized sitemap.xml...');

  const urls = [];

  // 1. Homepage
  urls.push({
    loc: `${SITE_URL}/`,
    changefreq: 'daily',
    priority: '1.0',
    lastmod: TODAY
  });

  // 2. High-Priority Category Landing Pages
  const DEFAULT_CATEGORIES = [
    "Charger Fan",
    "Power Bank",
    "Smart Watch",
    "Headphone",
    "Mobile Accessories",
    "Lifestyle & Watch"
  ];

  for (const catName of DEFAULT_CATEGORIES) {
    const catSlug = getCategorySlug(catName);
    urls.push({
      loc: `${SITE_URL}/category/${catSlug}`,
      changefreq: 'daily',
      priority: '0.95',
      lastmod: TODAY
    });
  }

  // 3. Products
  const products = await fetchProductsFromFirestore();
  const activeProducts = products.filter(p => !p.deleted && p.isPublished !== false && p.name);
  console.log(`📦 Found ${activeProducts.length} live published products (out of ${products.length} total).`);

  for (const p of activeProducts) {
    const slug = getProductSlug(p);
    let imgUrl = p.image || null;
    if (imgUrl && imgUrl.startsWith('data:')) {
      imgUrl = `${SITE_URL}/api/product-image/${p.id}`;
    } else if (imgUrl && imgUrl.startsWith('/')) {
      imgUrl = `${SITE_URL}${imgUrl}`;
    }

    urls.push({
      loc: `${SITE_URL}/p/${slug}`,
      changefreq: 'weekly',
      priority: '0.9',
      lastmod: TODAY,
      image: imgUrl,
      imageName: p.name || null
    });
  }

  // Build XML
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ''
  ];

  for (const u of urls) {
    xmlLines.push('  <url>');
    xmlLines.push(`    <loc>${u.loc}</loc>`);
    xmlLines.push(`    <lastmod>${u.lastmod}</lastmod>`);
    xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
    xmlLines.push(`    <priority>${u.priority}</priority>`);
    if (u.image) {
      const safeImageUrl = u.image.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xmlLines.push('    <image:image>');
      xmlLines.push(`      <image:loc>${safeImageUrl}</image:loc>`);
      if (u.imageName) {
        const safeImageName = u.imageName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        xmlLines.push(`      <image:title>${safeImageName}</image:title>`);
      }
      xmlLines.push('    </image:image>');
    }
    xmlLines.push('  </url>');
    xmlLines.push('');
  }

  // Save ultra-clean warm products cache for 0ms PHP SSR
  const sanitizedProds = products.map(p => {
    let img = p.image || '';
    if (typeof img === 'string' && img.startsWith('data:')) {
      img = `/api/product-image/${p.id}`;
    }
    let images = Array.isArray(p.images) ? p.images.map((im, idx) => (typeof im === 'string' && im.startsWith('data:') ? `/api/product-image/${p.id}?idx=${idx}` : im)) : [];
    return {
      id: String(p.id || ''),
      name: p.name || p.title || '',
      smsName: p.smsName || '',
      slug: p.slug || '',
      category: p.category || '',
      subcategory: p.subcategory || '',
      brand: p.brand || 'i SHOP BD',
      price: Number(p.price || 0),
      originalPrice: Number(p.originalPrice || p.price || 0),
      stock: Number(p.stock !== undefined ? p.stock : 1),
      description: p.description || '',
      image: img,
      images: images,
      rating: Number(p.rating || 5.0),
      reviewCount: Number(p.reviewCount || 0),
      code: p.code || '',
      isPublished: p.isPublished !== false,
      deleted: !!p.deleted
    };
  });

  try {
    if (!existsSync(join('public', 'api'))) mkdirSync(join('public', 'api'), { recursive: true });
    writeFileSync(join('public', 'api', 'products_cache.json'), JSON.stringify(sanitizedProds, null, 2), 'utf8');
    if (!existsSync(join('dist', 'api'))) mkdirSync(join('dist', 'api'), { recursive: true });
    writeFileSync(join('dist', 'api', 'products_cache.json'), JSON.stringify(sanitizedProds, null, 2), 'utf8');
    console.log(`📦 Saved ${sanitizedProds.length} products to products_cache.json for instant 0ms SSR`);
  } catch (err) {
    console.warn('Cache write warning:', err.message);
  }

  xmlLines.push('</urlset>');

  const xmlContent = xmlLines.join('\n');
  writeFileSync(join('public', 'sitemap.xml'), xmlContent, 'utf8');
  try {
    if (!existsSync('dist')) {
      mkdirSync('dist', { recursive: true });
    }
    writeFileSync(join('dist', 'sitemap.xml'), xmlContent, 'utf8');
  } catch (e) {}
  console.log(`✅ Clean sitemap generated with ${urls.length} URLs (Homepage + ${DEFAULT_CATEGORIES.length} Categories + ${activeProducts.length} Products) → public/sitemap.xml & dist/sitemap.xml`);
}

generateSitemap().catch(e => {
  console.error('Fatal sitemap error:', e);
  process.exit(1);
});
