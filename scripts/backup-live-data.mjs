/**
 * i SHOP BD - Live Data Backup (READ-ONLY on the live side)
 * ---------------------------------------------------------------
 * Makes a complete, dated copy of everything that lives only on the live side:
 *
 *   1. Firestore (all collections + sub-collections): products incl. their photos
 *      (photos are stored as base64 inside the product documents), variants, orders,
 *      users, banners, campaigns, reviews, settings ...
 *   2. Hostinger files: public_html/uploads/ (images uploaded on the live site)
 *      and public_html/api/img_cache/ (product photo cache).
 *
 * Output:  live_backup/<YYYY-MM-DD_HH-MM>/
 *            firestore/<collection>.json   (+ _subcollections)
 *            files/uploads/...  files/img_cache/...
 *            manifest.json                 (counts, so you can check nothing is missing)
 *
 * Safety:
 *   - Nothing is written, changed or deleted on Firestore or on the live server.
 *   - Nothing in your working project folder is overwritten (everything goes into live_backup/).
 *
 * Usage:   npm run backup            (Firestore + live files)
 *          npm run backup -- --firestore-only
 *          npm run backup -- --files-only
 *          npm run backup -- --restore-missing-uploads
 *              (also copies live uploads that are MISSING locally into public/uploads/,
 *               never replacing a file that already exists locally)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as ftp from 'basic-ftp';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldPath, Timestamp, GeoPoint, DocumentReference } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });

const args = new Set(process.argv.slice(2));
const doFirestore = !args.has('--files-only');
const doFiles = !args.has('--firestore-only');
const restoreMissingUploads = args.has('--restore-missing-uploads');

const stamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
const OUT = path.join(ROOT, 'live_backup', stamp);
fs.mkdirSync(OUT, { recursive: true });

const manifest = { createdAt: new Date().toISOString(), firestore: {}, files: {}, errors: [] };

// ---------- helpers ----------
function toPlain(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Timestamp) return { __type: 'timestamp', iso: value.toDate().toISOString(), seconds: value.seconds, nanoseconds: value.nanoseconds };
  if (value instanceof GeoPoint) return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return { __type: 'ref', path: value.path };
  if (Buffer.isBuffer(value)) return { __type: 'bytes', base64: value.toString('base64') };
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }
  return value;
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    return raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  const candidates = [process.env.FIREBASE_SERVICE_ACCOUNT_PATH, path.join(ROOT, 'api', 'service-account.json')].filter(Boolean);
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error('service-account.json not found (api/service-account.json or FIREBASE_SERVICE_ACCOUNT_PATH)');
  return JSON.parse(fs.readFileSync(found, 'utf8'));
}

// ---------- 1. Firestore ----------
async function dumpCollection(colRef, outDir, label) {
  const docs = [];
  let last = null;
  const PAGE = 200;
  for (;;) {
    let q = colRef.orderBy(FieldPath.documentId()).limit(PAGE);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    for (const d of snap.docs) {
      docs.push({ id: d.id, data: toPlain(d.data()) });
      // Sub-collections (e.g. reviews, history) so nothing is missed
      const subs = await d.ref.listCollections();
      for (const sub of subs) {
        await dumpCollection(sub, path.join(outDir, '_subcollections', colRef.id, d.id), `${label}/${d.id}/${sub.id}`);
      }
    }
    last = snap.docs[snap.docs.length - 1];
    process.stdout.write(`\r  ${label}: ${docs.length} documents`);
    if (snap.size < PAGE) break;
  }
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${colRef.id}.json`), JSON.stringify(docs));
  manifest.firestore[label] = docs.length;
  process.stdout.write(`\r  ✅ ${label}: ${docs.length} documents\n`);
}

async function backupFirestore() {
  console.log('\n📦 Backing up Firestore (read-only)...');
  initializeApp({ credential: cert(loadServiceAccount()) });
  const db = getFirestore();
  const collections = await db.listCollections();
  for (const col of collections) {
    try {
      await dumpCollection(col, path.join(OUT, 'firestore'), col.id);
    } catch (e) {
      manifest.errors.push(`firestore ${col.id}: ${e.message}`);
      console.log(`\n  ❌ ${col.id}: ${e.message}`);
    }
  }
}

// ---------- 2. Live files over FTP ----------
async function downloadDir(client, remoteDir, localDir, key, { skipExisting = false } = {}) {
  let count = 0;
  let skipped = 0;
  async function walk(rDir, lDir) {
    let list = [];
    try {
      list = await client.list(rDir);
    } catch (e) {
      manifest.errors.push(`ftp list ${rDir}: ${e.message}`);
      return;
    }
    fs.mkdirSync(lDir, { recursive: true });
    for (const item of list) {
      if (item.name === '.' || item.name === '..') continue;
      const r = `${rDir}/${item.name}`;
      const l = path.join(lDir, item.name);
      if (item.isDirectory) {
        await walk(r, l);
      } else if (item.isFile) {
        if (skipExisting && fs.existsSync(l)) { skipped++; continue; }
        try {
          await client.downloadTo(l, r);
          count++;
          if (count % 25 === 0) process.stdout.write(`\r  ${key}: ${count} files`);
        } catch (e) {
          manifest.errors.push(`ftp get ${r}: ${e.message}`);
        }
      }
    }
  }
  await walk(remoteDir, localDir);
  manifest.files[key] = { downloaded: count, skippedExisting: skipped };
  process.stdout.write(`\r  ✅ ${key}: ${count} files${skipped ? ` (${skipped} already existed locally, kept)` : ''}\n`);
}

async function backupFiles() {
  const { FTP_HOST = '187.127.183.159', FTP_PORT = '21', FTP_USER, FTP_PASSWORD } = process.env;
  if (!FTP_USER || !FTP_PASSWORD) throw new Error('FTP_USER / FTP_PASSWORD missing in .env');
  console.log('\n🌐 Downloading live files (read-only)...');
  const client = new ftp.Client();
  client.ftp.timeout = 60000;
  try {
    await client.access({ host: FTP_HOST, port: Number(FTP_PORT), user: FTP_USER, password: FTP_PASSWORD, secure: false });
    const REMOTE = '/domains/ishopbd.com/public_html';
    await downloadDir(client, `${REMOTE}/uploads`, path.join(OUT, 'files', 'uploads'), 'uploads');
    await downloadDir(client, `${REMOTE}/api/img_cache`, path.join(OUT, 'files', 'img_cache'), 'img_cache');
    if (restoreMissingUploads) {
      console.log('  ↪ Copying live uploads that are missing locally into public/uploads (existing files are kept)...');
      await downloadDir(client, `${REMOTE}/uploads`, path.join(ROOT, 'public', 'uploads'), 'restored_to_public_uploads', { skipExisting: true });
    }
  } finally {
    client.close();
  }
}

// ---------- run ----------
(async () => {
  console.log(`🛡️  i SHOP BD live backup → ${path.relative(ROOT, OUT)}`);
  if (doFirestore) {
    try { await backupFirestore(); } catch (e) { manifest.errors.push(`firestore: ${e.message}`); console.log(`❌ Firestore: ${e.message}`); }
  }
  if (doFiles) {
    try { await backupFiles(); } catch (e) { manifest.errors.push(`files: ${e.message}`); console.log(`❌ Files: ${e.message}`); }
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Summary saved: ${path.relative(ROOT, path.join(OUT, 'manifest.json'))}`);
  if (manifest.errors.length) {
    console.log(`⚠️  ${manifest.errors.length} problem(s) - see manifest.json "errors"`);
    process.exitCode = 1;
  } else {
    console.log('🎉 Backup complete. Nothing on the live site was changed.');
  }
})();
