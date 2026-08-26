/**
 * sitemap-generator.mjs
 * Firebase থেকে সব প্রোডাক্ট ও ক্যাটাগরি এনে sitemap.xml তৈরি করে।
 * চালানোর উপায়: node sitemap-generator.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SITE_URL = 'https://rokomariponnohari.com';
const TODAY = new Date().toISOString().split('T')[0];

function slugify(text, maxLen = 38) {
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

  return s;
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

async function generateSitemap() {
  console.log('Generating sitemap...');

  const urls = [];

  // 1. Homepage
  urls.push({
    loc: SITE_URL,
    changefreq: 'daily',
    priority: '1.0',
    lastmod: TODAY
  });

  // 2. Products
  try {
    const snap = await getDocs(collection(db, 'products'));
    snap.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      if (!p.name) return;
      const slug = getProductSlug(p);
      let imgUrl = p.image || null;
      if (imgUrl && imgUrl.startsWith('data:')) {
        imgUrl = null;
      }
      urls.push({
        loc: `${SITE_URL}/p/${slug}`,
        changefreq: 'weekly',
        priority: '0.9',
        lastmod: TODAY,
        image: imgUrl,
        imageName: p.name || null
      });
    });
    console.log(`Added ${snap.size} products.`);
  } catch (e) {
    console.error('Error fetching products:', e.message);
  }

  // 3. Categories
  try {
    const snap = await getDocs(collection(db, 'categories'));
    snap.forEach(doc => {
      const c = doc.data();
      if (!c.name) return;
      urls.push({
        loc: `${SITE_URL}/?category=${encodeURIComponent(c.name)}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: TODAY
      });
    });
    console.log(`Added ${snap.size} categories.`);
  } catch (e) {
    console.error('Error fetching categories:', e.message);
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
      if (u.imageName) xmlLines.push(`      <image:title>${u.imageName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>`);
      xmlLines.push('    </image:image>');
    }
    xmlLines.push('  </url>');
    xmlLines.push('');
  }

  xmlLines.push('</urlset>');

  const xmlContent = xmlLines.join('\n');
  writeFileSync(join('public', 'sitemap.xml'), xmlContent, 'utf8');
  console.log(`✅ Sitemap generated with ${urls.length} URLs → public/sitemap.xml`);
  process.exit(0);
}

generateSitemap().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
