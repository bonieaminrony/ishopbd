/**
 * i SHOP BD - Restore product photos that were overwritten by a link
 * ---------------------------------------------------------------
 * An old bug saved "/api/product-image/<id>" links back into Firestore instead of the real
 * photo. For those products the only remaining copy is the cached file in public/api/img_cache/
 * (downloaded from the live server). This script puts that cached photo back into Firestore.
 *
 *   node scripts/restore-lost-photos.mjs           -> DRY RUN: only lists what it would fix
 *   node scripts/restore-lost-photos.mjs --apply   -> writes the photos back to Firestore
 *
 * Tip: run `npm run backup -- --files-only` first so live_backup/ has the newest live img_cache,
 * then pass --cache-dir live_backup/<date>/files/img_cache to use it.
 * Only fields that currently hold a link are changed; real photos are never touched.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const cacheArg = argv.indexOf('--cache-dir');
const CACHE_DIR = cacheArg >= 0 ? path.resolve(ROOT, argv[cacheArg + 1]) : path.join(ROOT, 'public', 'api', 'img_cache');

const isLink = (v) => typeof v === 'string' && v.startsWith('/api/product-image/');
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

function cachedPhoto(baseName) {
  for (const ext of Object.keys(MIME)) {
    const f = path.join(CACHE_DIR, baseName + ext);
    if (fs.existsSync(f)) return `data:${MIME[ext]};base64,${fs.readFileSync(f).toString('base64')}`;
  }
  return null;
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    return raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  const p = [process.env.FIREBASE_SERVICE_ACCOUNT_PATH, path.join(ROOT, 'api', 'service-account.json')].filter(Boolean).find((x) => fs.existsSync(x));
  if (!p) throw new Error('service-account.json not found');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

(async () => {
  console.log(`${apply ? '✍️  APPLY' : '🔎 DRY RUN'} - photo cache: ${path.relative(ROOT, CACHE_DIR)}`);
  initializeApp({ credential: cert(loadServiceAccount()) });
  const db = getFirestore();
  const snap = await db.collection('products').get();
  let fixable = 0, missing = 0;
  for (const d of snap.docs) {
    const p = d.data();
    const safeId = d.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const update = {};
    const notes = [];
    if (isLink(p.image)) {
      const photo = cachedPhoto(safeId);
      if (photo) { update.image = photo; notes.push('main photo'); } else { missing++; notes.push('main photo: NO cached copy'); }
    }
    if (Array.isArray(p.images) && p.images.some(isLink)) {
      const imgs = p.images.map((img, i) => {
        if (!isLink(img)) return img;
        const photo = cachedPhoto(`${safeId}_idx${i}`) || (i === 0 ? cachedPhoto(safeId) : null);
        if (photo) { notes.push(`gallery #${i + 1}`); return photo; }
        missing++; notes.push(`gallery #${i + 1}: NO cached copy`); return img;
      });
      update.images = imgs;
    }
    if (!notes.length) continue;
    const size = JSON.stringify({ ...p, ...update }).length;
    console.log(`• ${p.name || d.id} (${d.id}): ${notes.join(', ')}${size > 950000 ? '  ⚠️ too large for Firestore, skipped' : ''}`);
    if (size > 950000) continue;
    const changed = Object.keys(update).filter((k) => JSON.stringify(update[k]) !== JSON.stringify(p[k]));
    if (!changed.length) continue;
    fixable++;
    if (apply) {
      await d.ref.update(Object.fromEntries(changed.map((k) => [k, update[k]])));
    }
  }
  console.log(`\n${fixable} product(s) ${apply ? 'restored' : 'can be restored'}; ${missing} photo(s) have no cached copy.`);
  if (!apply && fixable) console.log('Run again with --apply to write them back.');
  if (apply && fixable) console.log('Done. Reset the live product cache: open https://ishopbd.com/api/invalidate-product-cache (POST) or deploy.');
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
