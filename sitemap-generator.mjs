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

const SITE_URL = 'https://ishopbd.com';
const TODAY = new Date().toISOString().split('T')[0];

function slugify(str) {
  return (str || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
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
      const p = doc.data();
      if (!p.name) return;
      const slug = slugify(p.name);
      let imgUrl = p.image || null;
      if (imgUrl && imgUrl.startsWith('data:')) {
        imgUrl = null;
      }
      urls.push({
        loc: `${SITE_URL}/?p=${doc.id}&amp;slug=${slug}`,
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
