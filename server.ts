import express from "express";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import compression from "compression";
import crypto from "crypto";
import https from "https";
import {
  buildMetaCapiPayload,
  buildTikTokEventsPayload,
  dispatchServerTrackingEvents,
  extractClientIp,
  isSupportedTrackingEvent,
  parseCookies,
} from "./src/server/trackingEngine";
import {
  fetchSteadfastLiveStatus,
  loadCourierCredentials,
  normalizeSteadfastPhone,
  processSteadfastWebhook,
  startCourierBackgroundSync,
  syncAllActiveCourierOrders,
  syncSingleOrderCourierStatus,
} from "./src/server/courierSyncEngine";
import { buildProductStructuredData } from "./src/utils/productSchema";
import { registerReviewsRoutes } from "./src/server/reviewsRoutes";
import { registerAiRoutes } from "./src/server/aiRoutes";
import { registerPushRoutes } from "./src/server/pushRoutes";
import { getMarketingConfigSafe, registerMarketingRoutes } from "./src/server/marketingRoutes";

dotenv.config();

// Auto-detect production mode if running the compiled bundle
if (process.argv[1] && process.argv[1].endsWith('server.cjs')) {
  process.env.NODE_ENV = 'production';
}

// ---- Environment Variable Validation ----
const requiredEnvs = ['GEMINI_API_KEY'];
const missingEnvs = requiredEnvs.filter(key => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`[WARNING] Missing recommended environment variables: ${missingEnvs.join(', ')}`);
  console.warn('Some features like AI Chat may not work properly.');
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('[WARNING] EMAIL_USER or EMAIL_PASS not set. Order confirmation emails will not be sent.');
}

// ---- Security: Require MASTER_ADMIN_PASSWORD in env ----
const MASTER_ADMIN_PASSWORD = process.env.MASTER_ADMIN_PASSWORD || '';
if (!MASTER_ADMIN_PASSWORD) {
  console.error('[CRITICAL SECURITY ERROR] MASTER_ADMIN_PASSWORD is not set in .env! Admin access will be restricted.');
}

// ---- Admin Brute-Force Lockout Map ----
const adminFailMap = new Map<string, { count: number; lockedUntil: number }>();
function checkAdminBruteForce(ip: string): { allowed: boolean; lockedFor?: number } {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  const entry = adminFailMap.get(ip);
  if (entry && now < entry.lockedUntil) {
    return { allowed: false, lockedFor: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  return { allowed: true };
}
function recordAdminFail(ip: string): void {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS = 15 * 60 * 1000;
  const now = Date.now();
  const entry = adminFailMap.get(ip) || { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.count = 0;
    console.warn(`[SECURITY] Admin login locked for IP: ${ip} for 15 minutes.`);
  }
  adminFailMap.set(ip, entry);
}
function clearAdminFail(ip: string): void {
  adminFailMap.delete(ip);
}

// ---- Rate Limiting (in-memory, per IP) ----
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  entry.count++;
  return entry.count <= maxRequests;
}
// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// ---- Firestore REST API Fallback & Parsing Helpers ----
function parseFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return val;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreValue);
  if ('mapValue' in val) {
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  return null;
}

function parseFirestoreDoc(doc: any): any {
  const id = doc.name.split('/').pop();
  const data: Record<string, any> = { id };
  for (const [k, v] of Object.entries(doc.fields || {})) {
    data[k] = parseFirestoreValue(v);
  }
  return data;
}

async function fetchFirestoreCollectionFromRest(collectionName: string): Promise<any[]> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8";
  let url: string | null = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/${collectionName}?key=${apiKey}&pageSize=100`;
  const allDocs: any[] = [];
  
  while (url) {
    const response: any = await axios.get(url, { timeout: 10000 });
    const data = response.data;
    if (data.documents && Array.isArray(data.documents)) {
      allDocs.push(...data.documents);
    }
    if (data.nextPageToken) {
      url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/${collectionName}?key=${apiKey}&pageSize=100&pageToken=${data.nextPageToken}`;
    } else {
      url = null;
    }
  }
  
  return allDocs.map(parseFirestoreDoc);
}

const firestoreHttpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 30000 });

async function fetchFirestoreProductsRunQuery(): Promise<any[]> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8";
  const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents:runQuery?key=${apiKey}`;
  const response: any = await axios.post(
    url,
    { structuredQuery: { from: [{ collectionId: "products" }] } },
    {
      headers: { "Referer": "http://localhost:3000/" },
      httpsAgent: firestoreHttpsAgent,
      timeout: 10000
    }
  );
  if (Array.isArray(response.data)) {
    return response.data
      .filter((item: any) => item.document)
      .map((item: any) => parseFirestoreDoc(item.document));
  }
  return [];
}

// ---- In-Memory Product Cache (AI Recommendations + Chat + API) ----
// 24-hour TTL with instant sync to disk cache; proactively invalidated on product change
interface CachedProducts {
  data: any[];
  expiresAt: number;
}
let productCache: CachedProducts | null = null;
const PRODUCT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (instant zero-latency paint)

// Instant boot from disk cache so cold start is 0ms without waiting for Firestore
try {
  const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
  if (fs.existsSync(diskCachePath)) {
    const raw = fs.readFileSync(diskCachePath, 'utf8');
    if (raw && raw.length > 50) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        productCache = { data: parsed, expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS };
      }
    }
  }
} catch (e) {}

let isAdminSdkHealthy = false; // runQuery is primary & sub-200ms
let pendingProductsFetch: Promise<any[]> | null = null;

async function getCachedProducts(db?: FirebaseFirestore.Firestore): Promise<any[]> {
  const now = Date.now();
  if (productCache && now < productCache.expiresAt && productCache.data.length > 0) {
    return productCache.data;
  }

  if (pendingProductsFetch) {
    return pendingProductsFetch;
  }

  pendingProductsFetch = (async () => {
    try {
      // 1. Fast single-roundtrip runQuery first (~150ms)
      try {
        const runQueryDocs = await fetchFirestoreProductsRunQuery();
        const products = runQueryDocs.filter((p: any) => !p.deleted);
        if (products.length > 0) {
          productCache = { data: products, expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS };
          try {
            const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
            fs.writeFile(diskCachePath, JSON.stringify(products), () => {});
          } catch (_) {}
          return products;
        }
      } catch (rqErr: any) {
        console.warn("getCachedProducts runQuery fallback warning:", rqErr.message);
      }

      // 2. Try Admin SDK if marked healthy
      if (isAdminSdkHealthy) {
        try {
          const firestore = db || getFirestore();
          const snap = await firestore.collection("products").get();
          const products = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((p: any) => !p.deleted);
          if (products.length > 0) {
            productCache = { data: products, expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS };
            try {
              const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
              fs.writeFile(diskCachePath, JSON.stringify(products), () => {});
            } catch (_) {}
            return products;
          }
        } catch (e: any) {
          console.warn("getCachedProducts Admin SDK warning:", e.message);
          isAdminSdkHealthy = false;
        }
      }

      // 3. Fallback to Firestore REST paginated API
      try {
        const restDocs = await fetchFirestoreCollectionFromRest("products");
        const products = restDocs.filter((p: any) => !p.deleted);
        if (products.length > 0) {
          productCache = { data: products, expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS };
          try {
            const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
            fs.writeFile(diskCachePath, JSON.stringify(products), () => {});
          } catch (_) {}
          return products;
        }
      } catch (restErr: any) {
        console.error("getCachedProducts REST fallback error:", restErr.message);
      }

      // 4. Fallback to local disk cache if network is unavailable
      try {
        const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
        if (fs.existsSync(diskCachePath)) {
          const raw = fs.readFileSync(diskCachePath, 'utf8');
          const diskProds = JSON.parse(raw);
          if (Array.isArray(diskProds) && diskProds.length > 0) {
            return diskProds;
          }
        }
      } catch (e) {}

      return productCache?.data || [];
    } finally {
      pendingProductsFetch = null;
    }
  })();

  return pendingProductsFetch;
}

// Transform products to lightweight representation: strip heavy base64 and landingConfig for fast catalog delivery
function toLeanProducts(products: any[]): any[] {
  if (!Array.isArray(products)) return [];
  return products.map((p: any) => {
    if (!p) return p;
    const lean: any = { ...p };
    delete lean.landingConfig;
    if (typeof lean.image === 'string' && lean.image.startsWith('data:')) {
      lean.image = `/api/product-image/${p.id || ''}`;
    }
    if (Array.isArray(lean.images)) {
      lean.images = lean.images
        .filter((img: any) => typeof img === 'string' && img.trim().length > 0)
        .map((img: string, idx: number) => {
          if (img.startsWith('data:')) {
            return `/api/product-image/${p.id || ''}?index=${idx}`;
          }
          return img;
        });
    }
    if (Array.isArray(lean.variants)) {
      lean.variants = lean.variants.map((v: any) => {
        if (v && typeof v.image === 'string' && v.image.startsWith('data:')) {
          return { ...v, image: `/api/product-image/${p.id || ''}` };
        }
        return v;
      });
    }
    return lean;
  });
}

// Invalidate cache when products change (called after order/product update)
function invalidateProductCache() {
  productCache = null;
  try {
    const diskCachePath = path.join(process.cwd(), 'public', 'api', 'products_cache.json');
    if (fs.existsSync(diskCachePath)) {
      fs.unlinkSync(diskCachePath);
    }
  } catch (_) {}
  // Proactive background prefetch so subsequent client requests resolve instantly
  getCachedProducts().catch(() => {});
}

let bannersCache: { data: any[]; expiresAt: number } | null = null;
const BANNER_CACHE_TTL_MS = 5 * 60 * 1000;

function sortBannersByOrder(list: any[]): any[] {
  return [...list].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
}

// Instant boot for banners from disk
try {
  const diskBannerPath = path.join(process.cwd(), 'public', 'api', 'banners_cache.json');
  if (fs.existsSync(diskBannerPath)) {
    const raw = fs.readFileSync(diskBannerPath, 'utf8');
    if (raw && raw.length > 20) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        bannersCache = { data: sortBannersByOrder(parsed), expiresAt: Date.now() + BANNER_CACHE_TTL_MS };
      }
    }
  }
} catch (e) {}

async function getCachedBanners(db?: FirebaseFirestore.Firestore): Promise<any[]> {
  const now = Date.now();
  if (bannersCache && now < bannersCache.expiresAt && bannersCache.data.length > 0) {
    return bannersCache.data;
  }
  try {
    const firestoreDb = db || getFirestore();
    if (firestoreDb) {
      const snap = await firestoreDb.collection("banners").get();
      const list = sortBannersByOrder(snap.docs.map(d => ({ ...d.data(), id: d.id })));
      if (list.length > 0) {
        bannersCache = { data: list, expiresAt: now + BANNER_CACHE_TTL_MS };
        try {
          const diskBannerPath = path.join(process.cwd(), 'public', 'api', 'banners_cache.json');
          fs.writeFile(diskBannerPath, JSON.stringify(list), () => {});
        } catch (_) {}
        return list;
      }
    }
  } catch (e: any) {
    console.warn("getCachedBanners warning:", e.message);
  }
  return [];
}

async function invalidateBannerCache(): Promise<any[]> {
  bannersCache = null;
  try {
    const diskBannerPath = path.join(process.cwd(), 'public', 'api', 'banners_cache.json');
    if (fs.existsSync(diskBannerPath)) {
      fs.unlinkSync(diskBannerPath);
    }
  } catch (_) {}
  return getCachedBanners().catch(() => []);
}

function slugify(text: string, maxLen = 38): string {
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

function getProductSlug(product: any): string {
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

const possibleServiceAccountPaths = [
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  path.join(process.cwd(), "api", "service-account.json"),
  path.join(process.cwd(), "..", "api", "service-account.json"),
  path.join(path.dirname(process.cwd()), "api", "service-account.json")
].filter(Boolean) as string[];

// Strictly ensure no public, dist, or public_html directory is ever used to load credentials
const secureServiceAccountPaths = possibleServiceAccountPaths.filter(p => {
  const norm = path.normalize(p).toLowerCase();
  return !norm.includes(`${path.sep}public`) && !norm.includes(`${path.sep}dist`) && !norm.includes('public_html');
});

let serviceAccountPath = secureServiceAccountPaths.find(p => fs.existsSync(p)) || "";
let serviceAccountData: any = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    serviceAccountData = rawKey.startsWith('{')
      ? JSON.parse(rawKey)
      : JSON.parse(Buffer.from(rawKey, 'base64').toString('utf8'));
    console.log("Firebase Admin credentials loaded from FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  } catch (err: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY from env:", err.message);
  }
} else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccountData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  } catch (err: any) {
    console.error("Failed to parse serviceAccountPath:", err.message);
  }
}

if (serviceAccountData) {
  try {
    admin.initializeApp({
      credential: admin.cert(serviceAccountData),
      databaseURL: "https://i-shop-bd.firebaseio.com"
    });
    console.log(`Firebase Admin initialized successfully from: ${serviceAccountPath || 'ENV variable'}`);
  } catch (e: any) {
    if (!/already exists/.test(e.message)) {
      console.error("Firebase Admin init error:", e);
    }
  }
} else {
  console.error("[CRITICAL] service-account.json not found in secure server-only locations or env. Backend checkout won't work.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy for correct IP detection behind NGINX/Cloudflare
  app.set("trust proxy", 1);

  // ---- Absolute Shield: Block any HTTP request for sensitive files or credentials ----
  app.use((req, res, next) => {
    const url = (req.path || "").toLowerCase();
    const isSensitive = 
      url.includes("service-account") ||
      /(?:^|\/)\.env($|\.|\/)/i.test(url) ||
      url.includes("products_cache.json") ||
      (process.env.NODE_ENV === "production" && (url.endsWith(".map") || url.endsWith(".cjs")));
    if (isSensitive) {
      return res.status(403).json({ error: "Access Denied: Sensitive file blocked" });
    }
    next();
  });

  // ---- Compression Middleware ----
  app.use(compression());

  // Serve uploads folder statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), { maxAge: '30d' }));

  // Reduced body size limit to prevent DoS. Image uploads handled separately with higher limit.
  app.use("/api/chat", express.json({ limit: '32kb' }));
  app.use("/api/ai-recommendations", express.json({ limit: '32kb' }));
  app.use("/api/send-push", express.json({ limit: '16kb' }));
  app.use("/api/send-sms", express.json({ limit: '8kb' }));
  app.use("/api/send-bulk-sms", express.json({ limit: '256kb' }));
  app.use("/api/confirm-order", express.json({ limit: '64kb' }));
  app.use("/api/track-event", express.json({ limit: '64kb' }));
  app.use("/api/courier", express.json({ limit: '512kb' }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  // ---- CORS Policy ----
  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    const isAllowed =
      process.env.NODE_ENV !== 'production' || // Allow all in dev
      !origin || // Same-origin requests
      ALLOWED_ORIGINS.includes(origin);
    if (isAllowed && origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Api-Key,X-Secret-Key,X-Admin-Token');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // ---- Security Headers ----
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Facebook In-App browsers and crawler compatibility
    const ua = req.headers["user-agent"] || "";
    const isFacebook = /facebook|FBAN|FBIOS|FB_IAB|FB4A|facebookexternalhit/i.test(ua);
    if (!isFacebook) {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
    }

    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // HSTS for secure connections in production
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    res.removeHeader("X-Powered-By");
    next();
  });

  // ---- General API Rate Limit & Robots Shield ----
  app.use("/api", (req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":api", 300, 60_000)) {
      return res.status(429).json({ error: "Too many requests. Please wait a moment." });
    }
    next();
  });

  // Email Configuration (User needs to provide SMTP credentials in .env)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Firebase Auth Proxy for localhost & custom domain
  app.use("/__/auth", async (req, res) => {
    try {
      const targetUrl = `https://i-shop-bd.firebaseapp.com/__/auth${req.url}`;
      const response = await axios({
        method: req.method as any,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: 'i-shop-bd.firebaseapp.com',
          origin: 'https://i-shop-bd.firebaseapp.com'
        },
        data: req.body,
        responseType: 'arraybuffer',
        validateStatus: () => true
      });
      res.status(response.status);
      Object.entries(response.headers).forEach(([k, v]) => {
        if (v && k.toLowerCase() !== 'transfer-encoding' && k.toLowerCase() !== 'content-encoding') {
          res.setHeader(k, v as string);
        }
      });
      res.send(response.data);
    } catch (e: any) {
      console.warn("Auth proxy error:", e.message);
      res.status(500).send("Auth proxy error");
    }
  });

  // API Routes
  app.post("/api/invalidate-product-cache", (req, res) => {
    invalidateProductCache();
    res.json({ success: true, message: "Product cache invalidated" });
  });

  app.get("/api/products", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      const prods = await getCachedProducts();
      if (prods && prods.length > 0) {
        const lean = toLeanProducts(prods);
        const signature = lean.map(p => `${p.id}:${p.updatedAt || ''}:${p.price}:${p.stock}:${p.isPublished}`).join('|');
        const etag = `"${crypto.createHash('md5').update(signature).digest('hex')}"`;
        res.setHeader("ETag", etag);

        if (req.headers["if-none-match"] === etag) {
          return res.status(304).end();
        }
        res.setHeader("Content-Type", "application/json");
        return res.json(lean);
      }
      res.status(500).json({ error: "No products available" });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/banners", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      const list = await getCachedBanners();
      if (list && list.length > 0) {
        const signature = list.map(b => `${b.id}:${b.updatedAt || ''}:${b.image || ''}`).join('|');
        const etag = `"${crypto.createHash('md5').update(signature).digest('hex')}"`;
        res.setHeader("ETag", etag);

        if (req.headers["if-none-match"] === etag) {
          return res.status(304).end();
        }
        res.setHeader("Content-Type", "application/json");
        return res.json(list);
      }
      return res.json([]);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.post("/api/invalidate-banner-cache", async (req, res) => {
    await invalidateBannerCache();
    res.json({ success: true, message: "Banner cache invalidated" });
  });

  app.post("/api/verify-admin", (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);

    // Brute-force protection: max 5 failed attempts → 15-min lockout
    const bf = checkAdminBruteForce(ip);
    if (!bf.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. Try again in ${bf.lockedFor} seconds.`
      });
    }

    const masterPassword = MASTER_ADMIN_PASSWORD;

    const { password } = req.body;
    if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
      return res.status(400).json({ success: false, error: 'Invalid password format.' });
    }

    const providedBuf = Buffer.from(password.trim());
    const masterBuf = Buffer.from(masterPassword.trim());
    if (masterBuf.length > 0 && providedBuf.length === masterBuf.length && crypto.timingSafeEqual(providedBuf, masterBuf)) {
      console.log(`[${new Date().toISOString()}] Admin login SUCCESS from IP: ${ip}`);
      clearAdminFail(ip);
      return res.json({ success: true });
    }

    console.warn(`[${new Date().toISOString()}] Admin login FAILED from IP: ${ip}`);
    recordAdminFail(ip);
    return res.status(401).json({ success: false, error: 'Incorrect password.' });
  });

  // ---- Image Upload Endpoint (Admin Only, Raster Images Only) ----
  app.post("/api/upload", async (req, res) => {
    try {
      const isAuthorized = await verifyIsAdmin(req);
      if (!isAuthorized) {
        return res.status(401).json({ error: "Unauthorized: Admin access required" });
      }

      const { image, filename } = req.body;
      if (!image || typeof image !== 'string' || !image.startsWith('data:image/')) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      // Extract content type and base64 string
      const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: "Invalid base64 image data" });
      }

      const contentType = match[1].toLowerCase();
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Image size must be between 1 byte and 5 MB" });
      }

      // Validate allowed safe raster mime types (SVG disallowed to prevent Stored XSS)
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(contentType)) {
        return res.status(400).json({ error: "Only raster image files are allowed (JPEG, PNG, WEBP, GIF)" });
      }

      // Determine extension
      let ext = 'jpg';
      if (contentType === 'image/png') ext = 'png';
      else if (contentType === 'image/webp') ext = 'webp';
      else if (contentType === 'image/gif') ext = 'gif';

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique name
      const sanitizedName = (filename || 'image')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 50);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedName}.${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      // Save to disk
      fs.writeFileSync(filePath, buffer);

      console.log(`Image uploaded successfully: /uploads/${uniqueFilename}`);
      return res.json({ url: `/uploads/${uniqueFilename}` });
    } catch (err: any) {
      console.error("Image upload error:", err);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // ---- Server-Side AI Natural Product Search Proxy (Hides Gemini API Key) ----
  app.post("/api/ai-search", async (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":ai-search", 30, 60_000)) {
      return res.status(429).json({ success: false, matchingIds: [], message: "Too many requests" });
    }

    const { query, products } = req.body;
    if (!query || typeof query !== 'string' || !Array.isArray(products) || products.length === 0) {
      return res.json({ success: true, matchingIds: [] });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.json({ success: false, matchingIds: [] });
    }

    try {
      const prompt = `Based on these e-commerce products:
${JSON.stringify(products.slice(0, 100))}

Filter and return the products matching this customer query: "${query.substring(0, 200)}".
Return ONLY a valid JSON array of matching product IDs, e.g. ["prod-1", "prod-2"]. Return an empty array [] if no items match. Do not write explanations or markdown coding fence.`;

      let aiRes: any = null;
      const searchModels = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.8-flash"];
      for (const sModel of searchModels) {
        try {
          aiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${sModel}:generateContent?key=${geminiKey}`,
            {
              contents: [{ role: "user", parts: [{ text: prompt }] }]
            },
            { timeout: 8000 }
          );
          if (aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            break;
          }
        } catch (sErr: any) {
          // try next model
        }
      }

      const responseText = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const ids = JSON.parse(cleanedText);
      return res.json({ success: true, matchingIds: Array.isArray(ids) ? ids : [] });
    } catch (err: any) {
      console.warn("AI Search Backend Error:", err.message);
      return res.json({ success: false, matchingIds: [] });
    }
  });

  app.post("/api/send-sms", async (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":sms", 5, 60_000)) {
      return res.status(429).json({ success: false, message: "Too many SMS requests. Please wait a moment." });
    }
    const { phone, message, senderId } = req.body;

    // Input validation
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone number was not provided.' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }
    if (message.length > 600) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 600 characters.' });
    }

    const isAdminSender = await verifyIsAdmin(req);
    const SMS_API_KEY = process.env.SMS_API_KEY;
    const SMS_SENDER_ID = (isAdminSender && typeof senderId === 'string' && senderId.trim())
      ? senderId.trim()
      : (process.env.SMS_SENDER_ID || "8809648908219");

    if (!SMS_API_KEY) {
      console.warn("SMS_API_KEY not set in environment. SMS not sent.");
      return res.status(200).json({ success: false, message: "SMS API key is not configured." });
    }

    // Format phone number to 8801XXXXXXXXX format
    let formattedPhone = String(phone || "").trim();
    const banglaToEnglish = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    formattedPhone = formattedPhone.replace(/[০-৯]/g, (match) => (banglaToEnglish as any)[match]);
    const isPlus = formattedPhone.startsWith("+");
    formattedPhone = formattedPhone.replace(/\D/g, "");
    if (isPlus) formattedPhone = "+" + formattedPhone;

    if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.startsWith("01") && formattedPhone.length === 11) {
      formattedPhone = "88" + formattedPhone;
    }
    if (!/^8801[3-9]\d{8}$/.test(formattedPhone)) {
      return res.status(400).json({ success: false, message: "Invalid Bangladeshi phone number format." });
    }
    if (!isAdminSender && !rateLimit("sms-phone:" + formattedPhone, 3, 5 * 60_000)) {
      return res.status(429).json({ success: false, message: "Too many SMS requests for this phone number. Please try again later." });
    }

    try {
      const url = `https://bulksmsbd.net/api/smsapi`;
      const response = await axios.get(url, {
        params: {
          api_key: SMS_API_KEY,
          type: "text",
          number: formattedPhone,
          senderid: SMS_SENDER_ID,
          message: message
        }
      });
      const data = response.data;
      console.log("SMS API Response:", data);

      // BulkSMSBD success response code is 202
      const isSuccess = data && (data.response_code === 202 || (data.success_message && !data.error_message));

      res.json({ 
        success: isSuccess, 
        message: isSuccess ? "SMS sent successfully" : (data.error_message || "Failed to send SMS"), 
        data 
      });
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ success: false, error: "Failed to send SMS due to server error" });
    }
  });

  // Bulk SMS endpoint with SSE streaming for real-time progress
  app.post("/api/send-bulk-sms", async (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":bulksms", 2, 60_000)) {
      return res.status(429).json({ success: false, message: "Too many requests. Please wait a moment." });
    }

    // Server-side Admin Authentication Check
    const rawAdminToken = (req.headers['x-admin-token'] as string) || (req.headers['authorization'] as string) || '';
    const adminToken = rawAdminToken.startsWith('Bearer ') ? rawAdminToken.slice(7).trim() : rawAdminToken.trim();
    const validToken = (process.env.ADMIN_API_TOKEN || process.env.MASTER_ADMIN_PASSWORD || MASTER_ADMIN_PASSWORD).trim();

    if (!validToken || !adminToken || adminToken !== validToken) {
      return res.status(403).json({ success: false, message: "Unauthorized: Valid admin token required" });
    }

    const { phones, message, senderId } = req.body;

    const SMS_API_KEY = process.env.SMS_API_KEY;
    const SMS_SENDER_ID = senderId || process.env.SMS_SENDER_ID || "8809648908219";

    if (!SMS_API_KEY) {
      return res.status(200).json({ success: false, message: "SMS API key is not configured." });
    }
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ success: false, message: "No phone numbers were provided." });
    }
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    // Setup SSE headers for real-time streaming progress
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
    res.flushHeaders();

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Format all phone numbers
    const formattedPhones = phones.map((phone: string) => {
      let p = String(phone || "").trim();
      // Convert Bengali digits to English
      const banglaToEnglish = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
      p = p.replace(/[০-৯]/g, (match) => (banglaToEnglish as any)[match]);
      const isPlus = p.startsWith("+");
      p = p.replace(/\D/g, "");
      if (isPlus) p = "+" + p;
      if (p.startsWith("+")) p = p.substring(1);
      if (p.startsWith("01") && p.length === 11) p = "88" + p;
      return p;
    }).filter(Boolean);

    const BATCH_SIZE = 500; // BulkSMSBD supports 500+ per call
    const totalBatches = Math.ceil(formattedPhones.length / BATCH_SIZE);
    let totalSuccess = 0;
    let totalFail = 0;

    sendEvent({ type: "start", total: formattedPhones.length, totalBatches });

    for (let i = 0; i < formattedPhones.length; i += BATCH_SIZE) {
      const batch = formattedPhones.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const numberStr = batch.join(",");

      sendEvent({ type: "progress", batchNum, totalBatches, batchSize: batch.length, sent: totalSuccess, failed: totalFail });

      try {
        const response = await axios.get("https://bulksmsbd.net/api/smsapi", {
          params: { api_key: SMS_API_KEY, type: "text", number: numberStr, senderid: SMS_SENDER_ID, message },
          timeout: 60000
        });
        const data = response.data;
        const isSuccess = data && (data.response_code === 202 || (data.success_message && !data.error_message));

        if (isSuccess) {
          totalSuccess += batch.length;
          sendEvent({ type: "batch_done", batchNum, success: true, count: batch.length, sent: totalSuccess, failed: totalFail });
        } else {
          totalFail += batch.length;
          sendEvent({ type: "batch_done", batchNum, success: false, count: batch.length, error: data.error_message || "API Error", sent: totalSuccess, failed: totalFail });
        }
      } catch (error: any) {
        totalFail += batch.length;
        sendEvent({ type: "batch_done", batchNum, success: false, count: batch.length, error: error.message, sent: totalSuccess, failed: totalFail });
        console.error(`Bulk SMS Batch ${batchNum} error:`, error.message);
      }

      if (i + BATCH_SIZE < formattedPhones.length) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    sendEvent({ type: "done", successCount: totalSuccess, failCount: totalFail, total: formattedPhones.length });
    res.end();
  });

  
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const distSitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
      const publicSitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      if (fs.existsSync(distSitemapPath)) {
        res.setHeader("Content-Type", "application/xml; charset=UTF-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.sendFile(distSitemapPath);
      }
      if (fs.existsSync(publicSitemapPath)) {
        res.setHeader("Content-Type", "application/xml; charset=UTF-8");
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.sendFile(publicSitemapPath);
      }

      const products = await getCachedProducts().catch(() => []);
      const activeProducts = products.filter((p: any) => !p.deleted && p.isPublished !== false);
      const today = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
      xml += `  <url>\n    <loc>https://ishopbd.com/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      const staticCategories = [
        "charger-fan", "power-bank", "smart-watch", "headphone", "mobile-accessories", "lifestyle-watch"
      ];
      staticCategories.forEach(catSlug => {
        xml += `  <url>\n    <loc>https://ishopbd.com/category/${catSlug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
      });

      activeProducts.forEach((p: any) => {
        const slug = getProductSlug(p);
        const imageUrl = `https://ishopbd.com/api/product-image/${p.id}`;
        xml += `  <url>\n    <loc>https://ishopbd.com/p/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n    <image:image>\n      <image:loc>${imageUrl}</image:loc>\n      <image:title>${p.name ? String(p.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : 'i SHOP BD'}</image:title>\n    </image:image>\n  </url>\n`;
      });

      xml += `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=UTF-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  });


  // ---- Coupon Validation Endpoint ----
  app.post("/api/validate-coupon", async (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":coupon", 10, 60_000)) {
      return res.status(429).json({ success: false, error: "Too many requests. Please wait." });
    }

    const { code, cartTotal, userId } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: "Invalid coupon code." });
    }
    if (typeof cartTotal !== 'number' || cartTotal <= 0) {
      return res.status(400).json({ success: false, error: "Invalid cart total amount." });
    }

    if (!(admin as any).apps.length) {
      return res.status(500).json({ success: false, error: "Server misconfiguration" });
    }

    try {
      const db = getFirestore();
      const couponRef = db.collection("coupons").doc(code.trim().toUpperCase());
      const couponSnap = await couponRef.get();

      if (!couponSnap.exists) {
        return res.status(404).json({ success: false, error: "This coupon code does not exist." });
      }

      const coupon = couponSnap.data()!;

      // Check if active
      if (!coupon.isActive) {
        return res.status(400).json({ success: false, error: "This coupon is no longer active." });
      }

      // Check expiry
      if (coupon.expiresAt) {
        const expiresAt = coupon.expiresAt?.toDate ? coupon.expiresAt.toDate() : new Date(coupon.expiresAt);
        if (new Date() > expiresAt) {
          return res.status(400).json({ success: false, error: "This coupon has expired." });
        }
      }

      // Check minimum order amount
      if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          error: `Minimum order of ৳${coupon.minOrderAmount} is required for this coupon.`
        });
      }

      // Check usage limit
      if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
        return res.status(400).json({ success: false, error: "This coupon usage limit has been reached." });
      }

      // Check per-user usage limit
      if (userId && userId !== 'guest' && coupon.perUserLimit) {
        const userUsageSnap = await db.collection("coupon_usage")
          .where("couponCode", "==", code.trim().toUpperCase())
          .where("userId", "==", userId)
          .get();
        if (userUsageSnap.size >= coupon.perUserLimit) {
          return res.status(400).json({ success: false, error: "You have already used this coupon." });
        }
      }

      // Calculate discount
      let discountAmount = 0;
      let discountLabel = "";

      if (coupon.type === "percent") {
        discountAmount = Math.round(cartTotal * (coupon.value / 100));
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        discountLabel = `${coupon.value}% Off`;
      } else if (coupon.type === "fixed") {
        discountAmount = Math.min(coupon.value, cartTotal);
        discountLabel = `৳${coupon.value} Off`;
      } else if (coupon.type === "free_delivery") {
        discountAmount = 0; // handled on frontend
        discountLabel = "Free Delivery";
      }

      return res.json({
        success: true,
        coupon: {
          code: code.trim().toUpperCase(),
          type: coupon.type,
          value: coupon.value,
          discountAmount,
          discountLabel,
          description: coupon.description || discountLabel,
        }
      });

    } catch (err: any) {
      console.error("Coupon validation error:", err);
      return res.status(500).json({ success: false, error: "Failed to validate coupon." });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":create-order", 10, 60_000)) {
      return res.status(429).json({ success: false, error: "Too many requests." });
    }

    const { newOrder, checkoutItems } = req.body;
    if (!newOrder || !checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    if (!(admin as any).apps.length) {
      return res.status(500).json({ success: false, error: "Server misconfiguration (Firebase Admin not initialized)" });
    }

    const db = getFirestore();
    let decodedToken: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        decodedToken = await getAuth().verifyIdToken(authHeader.split('Bearer ')[1]);
      } catch (err) {}
    }

    if (newOrder.userId && newOrder.userId !== 'guest') {
      if (!decodedToken || decodedToken.uid !== newOrder.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid user ID or token" });
      }
    }

    try {
      await db.runTransaction(async (transaction) => {
        // First read all products
        const productRefs: any = {};
        const productDataMap: Record<string, any> = {};
        
        // Collect all unique product references
        for (const item of checkoutItems) {
          const pId = item.product.id;
          if (!productRefs[pId]) {
            productRefs[pId] = db.collection("products").doc(pId);
          }
        }

        const refsArray = Object.values(productRefs) as any[];
        if (refsArray.length > 0) {
           const snaps = await transaction.getAll(...refsArray);
           snaps.forEach(snap => {
             if (!snap.exists) throw new Error(`Product not found`);
             productDataMap[snap.id] = snap.data();
           });
        }

        // Validate and update stock
        const updatedProducts: Record<string, any> = {};
        for (const item of checkoutItems) {
          const pId = item.product.id;
          const pData = updatedProducts[pId] || productDataMap[pId];
          const iColor = item.color ? String(item.color).trim().toLowerCase() : null;
          const iSize = item.size ? String(item.size).trim().toLowerCase() : null;
          const reqQty = Number(item.quantity) || 1;
          if (reqQty <= 0) throw new Error("Invalid quantity");

          let currentVariants = [...(pData.variants || [])];
          let currentStock = Number(pData.stock || 0);
          let variantMatched = false;

          // If there are wholesale sizes (for quick checkout wholesale mode)
          if (item.wholesaleSizeQty && Object.keys(item.wholesaleSizeQty).length > 0) {
             for (const [wSize, wQty] of Object.entries(item.wholesaleSizeQty)) {
                const qtyNum = Number(wQty);
                if (qtyNum < 0) throw new Error("Invalid quantity");
                if (qtyNum === 0) continue;
                const vIndex = currentVariants.findIndex(v => (v.size ? String(v.size).trim().toLowerCase() : null) === wSize.trim().toLowerCase());
                if (vIndex > -1) {
                  const vStock = Number(currentVariants[vIndex].stock || 0);
                  if (vStock < qtyNum && !pData.isComingSoon) throw new Error(`Sorry, ${pData.name} is out of stock!`);
                  currentVariants[vIndex].stock = vStock - qtyNum;
                  variantMatched = true;
                }
             }
          } else {
             const vIndex = currentVariants.findIndex(v => {
                const vColor = v.name ? String(v.name).trim().toLowerCase() : null;
                const vSize = v.size ? String(v.size).trim().toLowerCase() : null;
                if (iColor && iSize) return vColor === iColor && vSize === iSize;
                if (iColor) return vColor === iColor;
                if (iSize) return vSize === iSize;
                return false;
             });
             if (vIndex > -1) {
                const vStock = Number(currentVariants[vIndex].stock || 0);
                if (vStock < reqQty && !pData.isComingSoon) throw new Error(`Sorry, ${pData.name} is out of stock!`);
                currentVariants[vIndex].stock = vStock - reqQty;
                variantMatched = true;
             }
          }

          if (!variantMatched) {
            if (currentStock < reqQty && !pData.isComingSoon) throw new Error(`Sorry, ${pData.name} is out of stock!`);
            currentStock -= reqQty;
          }

          updatedProducts[pId] = { ...pData, variants: currentVariants, stock: currentStock };
        }

        // Commit updates to products
        for (const [pId, pData] of Object.entries(updatedProducts)) {
          transaction.update(productRefs[pId], {
            variants: pData.variants,
            stock: pData.stock,
            updatedAt: FieldValue.serverTimestamp()
          });
        }

        let userPoints = 0;
        if (newOrder.userId && newOrder.userId !== 'guest') {
            const userSnap = await transaction.get(db.collection("users").doc(newOrder.userId));
            if (userSnap.exists) {
                userPoints = Number(userSnap.data().rewardPoints) || 0;
            }
        }
        
        // ---- SERVER-SIDE PRICE VERIFICATION ----
        let expectedSubtotal = 0;
        
        for (const item of checkoutItems) {
            const pId = item.product.id;
            const pData = productDataMap[pId];
            
            let reqQty = Number(item.quantity) || 1;
            if (reqQty <= 0) throw new Error("Invalid quantity");
            if (item.wholesaleSizeQty && Object.keys(item.wholesaleSizeQty).length > 0) {
                reqQty = 0;
                for (const wQty of Object.values(item.wholesaleSizeQty)) {
                    reqQty += Number(wQty) || 0;
                }
            }
            
            let itemPrice = Number(pData.price) || 0;
            if (pData.wholesaleTiers && Array.isArray(pData.wholesaleTiers) && pData.wholesaleTiers.length > 0) {
                const sortedTiers = [...pData.wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => reqQty >= t.minQty);
                if (tier) itemPrice = Number(tier.price) || itemPrice;
            }
            
            expectedSubtotal += itemPrice * reqQty;
        }

        const clientTotal = Number(newOrder.total) || 0;
        const clientSubtotal = Number(newOrder.subtotal) || 0;
        const clientDelivery = Number(newOrder.deliveryCharge) || 0;
        const clientPoints = Number(newOrder.pointsDiscount) || 0;
        if (clientPoints > userPoints) throw new Error("You do not have enough reward points!");
        const clientDiscount = Number(newOrder.discount) || 0; // If any other discount
        
        // 1. Verify Subtotal matches server calculated subtotal
        if (Math.abs(clientSubtotal - expectedSubtotal) > 5) {
            console.error(`Subtotal mismatch! Client: ${clientSubtotal}, Server: ${expectedSubtotal}`);
            throw new Error("Order price mismatch. The order has been blocked for security reasons.");
        }
        
        // 2. Verify Total math
        const expectedTotalMath = clientSubtotal + clientDelivery - clientPoints - clientDiscount;
        if (Math.abs(clientTotal - expectedTotalMath) > 5) {
            console.error(`Total math mismatch! ClientTotal: ${clientTotal}, Math: ${expectedTotalMath}`);
            throw new Error("Total calculation discrepancy detected. The order has been blocked.");
        }

        const orderId = newOrder.orderId || newOrder.id || `ORD${Date.now()}`;
        delete newOrder.id; // avoid storing id in document body if it exists
        newOrder.createdAt = FieldValue.serverTimestamp();
        newOrder.status = "pending";
        
        if (newOrder.total < 0) throw new Error("Invalid total amount");

        transaction.set(db.collection("orders").doc(orderId), newOrder);

        // Deduct wallet if paid via wallet
        if (newOrder.paymentMethod === "wallet" && newOrder.userId && newOrder.userId !== "guest") {
          const userRef = db.collection("users").doc(newOrder.userId);
          transaction.update(userRef, {
            balance: FieldValue.increment(-newOrder.total),
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      });

      res.json({ success: true, message: "Order created successfully" });
    } catch (e) {
      console.error("Order creation error:", e);
      res.status(500).json({ success: false, error: e.message || "Failed to process order" });
    }
  });

  app.post("/api/confirm-order", async (req, res) => {
    // Rate limit: 10 order confirmations per IP per minute
    const rawIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || "unknown";
    const ip = Array.isArray(rawIp) ? rawIp[0] : (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp);
    if (!rateLimit(ip + ":order", 10, 60_000)) {
      return res.status(429).json({ success: false, error: "Too many requests." });
    }

    const { customerName, customerPhone, items, total, address } = req.body;

    // Input validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0 || customerName.length > 200) {
      return res.status(400).json({ success: false, error: 'Invalid customer name.' });
    }
    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.length > 20) {
      return res.status(400).json({ success: false, error: 'Invalid phone number.' });
    }
    if (!address || typeof address !== 'string' || address.length > 1000) {
      return res.status(400).json({ success: false, error: 'Invalid address.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ success: false, error: 'Invalid item list.' });
    }
    if (typeof total !== 'number' || total < 0 || total > 10_000_000) {
      return res.status(400).json({ success: false, error: 'Invalid total quantity.' });
    }

    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_USER;

    // Build items rows for HTML table
    const itemRowsHtml = items.map((item: any) => {
      const name = typeof item?.product?.name === 'string' ? item.product.name.substring(0, 200) : 'Unknown Product';
      const qty = typeof item?.quantity === 'number' ? item.quantity : '?';
      const price = typeof item?.product?.price === 'number' ? item.product.price : 0;
      const subtotal = typeof qty === 'number' ? (price * qty) : 0;
      return `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;">${qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#333;">৳${price.toLocaleString()}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:bold;color:#e07b39;">৳${subtotal.toLocaleString()}</td>
        </tr>`;
    }).join('');

    const itemsPlainText = items.map((item: any) => {
      const name = typeof item?.product?.name === 'string' ? item.product.name.substring(0, 200) : 'Unknown';
      const qty = typeof item?.quantity === 'number' ? item.quantity : '?';
      return `- ${name} (Qty: ${qty})`;
    }).join('\n');

    const orderDate = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka', dateStyle: 'full', timeStyle: 'short' });

    const htmlBody = `<!DOCTYPE html>
<html lang="bn">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#e07b39,#c9612a);padding:30px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:bold;">🛒 i SHOP BD</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Order Received!</p>
        </td></tr>

        <!-- Order Badge -->
        <tr><td style="padding:24px 40px 0;text-align:center;">
          <span style="display:inline-block;background:#fff3e8;color:#e07b39;border:2px solid #e07b39;border-radius:30px;padding:8px 24px;font-size:14px;font-weight:bold;">
            ✅ Order Confirmed
          </span>
          <p style="color:#888;font-size:13px;margin:10px 0 0;">${orderDate}</p>
        </td></tr>

        <!-- Customer Info -->
        <tr><td style="padding:24px 40px;">
          <h2 style="margin:0 0 16px;font-size:16px;color:#333;border-bottom:2px solid #f0f0f0;padding-bottom:10px;">📋 Customer Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;width:120px;">Name:</td>
              <td style="padding:6px 0;color:#333;font-size:14px;font-weight:bold;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Phone:</td>
              <td style="padding:6px 0;color:#333;font-size:14px;">${customerPhone}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#888;font-size:13px;">Address:</td>
              <td style="padding:6px 0;color:#333;font-size:14px;">${address}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Items Table -->
        <tr><td style="padding:0 40px 24px;">
          <h2 style="margin:0 0 16px;font-size:16px;color:#333;border-bottom:2px solid #f0f0f0;padding-bottom:10px;">📦 Order Items</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;font-weight:600;">Product</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;font-weight:600;">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;font-weight:600;">Price</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;font-weight:600;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemRowsHtml}</tbody>
          </table>
        </td></tr>

        <!-- Total -->
        <tr><td style="padding:0 40px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:right;padding:12px 16px;background:#fff3e8;border-radius:8px;">
                <span style="font-size:14px;color:#888;">Total Amount: </span>
                <span style="font-size:22px;font-weight:bold;color:#e07b39;">৳${total.toLocaleString()}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;color:#aaa;font-size:12px;">This email was sent automatically.</p>
          <p style="margin:6px 0 0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} i SHOP BD — Premium Online Shop</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const mailOptions = {
      from: `"i SHOP BD" <${process.env.EMAIL_USER}>`,
      to: notifyEmail,
      subject: `🛒 New Order — ${customerName.substring(0, 60)} (৳${total})`,
      text: [
        'New Order Confirmed!',
        '',
        `Customer: ${customerName}`,
        `Phone: ${customerPhone}`,
        `Address: ${address}`,
        `Total: ৳${total}`,
        '',
        'Items:',
        itemsPlainText,
      ].join('\n'),
      html: htmlBody,
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Order email sent successfully to ${notifyEmail}`);
      } else {
        console.warn("EMAIL_USER or EMAIL_PASS not set. Email not sent.");
      }
      res.json({ success: true, message: "Order processed successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });



  app.post("/api/courier/steadfast/bulk", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: "Unauthorized: Admin access required" });
    }

    const db = getFirestore();
    const creds = await loadCourierCredentials(db);
    // Use server-side keys; fallback to body keys if not set on server
    const apiKey = (creds.steadfastApiKey || req.body.apiKey || "").trim();
    const secretKey = (creds.steadfastSecretKey || req.body.secretKey || "").trim();
    const { orders } = req.body;

    if (!apiKey || !secretKey) {
      return res.status(400).json({ success: false, error: "Steadfast API Key or Secret Key missing" });
    }
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ success: false, error: "No orders provided" });
    }
    if (orders.length > 1000) {
      return res.status(400).json({ success: false, error: "Too many orders in one request (max 1000)" });
    }

    try {
      const requests = orders.map(async (order) => {
        try {
          const payload = {
            invoice: order.invoice,
            recipient_name: order.recipient_name,
            recipient_phone: normalizeSteadfastPhone(order.recipient_phone),
            recipient_address: order.recipient_address,
            cod_amount: order.cod_amount,
            note: order.note || "Sent from i SHOP BD"
          };
          
          const response = await axios.post(
            "https://portal.packzy.com/api/v1/create_order",
            payload,
            {
              headers: {
                "Api-Key": apiKey,
                "Secret-Key": secretKey,
                "Content-Type": "application/json"
              },
              timeout: 10000
            }
          );
          
          if (response.data && response.data.status === 200) {
            const consignmentId = response.data.consignment?.consignment_id ? String(response.data.consignment.consignment_id) : undefined;
            const trackingCode = response.data.consignment?.tracking_code ? String(response.data.consignment.tracking_code) : undefined;
            return {
              id: order.id,
              success: true,
              consignmentId,
              trackingId: trackingCode || consignmentId || "Success"
            };
          } else {
            return {
              id: order.id,
              success: false,
              error: response.data?.message || JSON.stringify(response.data) || "Failed to create order"
            };
          }
        } catch (error: any) {
          return {
            id: order.id,
            success: false,
            error: error.response?.data?.message || error.message || "Network Error"
          };
        }
      });

      const processedOrders = await Promise.all(requests);
      res.json({ success: true, processedOrders });
    } catch (error: any) {
      console.error("Error communicating with Steadfast API:", error);
      res.status(500).json({ success: false, error: "Failed to communicate with Steadfast API" });
    }
  });

  app.get("/api/steadfast-status", async (req, res) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: "Tracking ID is required" });
    }

    try {
      const db = getFirestore();
      const creds = await loadCourierCredentials(db);
      if (!creds.steadfastApiKey || !creds.steadfastSecretKey) {
        return res.status(500).json({ success: false, error: "Steadfast API Key settings missing. Please configure them in Dashboard Settings." });
      }

      const rawId = String(id).trim();
      const statusRes = await fetchSteadfastLiveStatus(creds, {
        consignmentId: /^\d+$/.test(rawId) ? rawId : undefined,
        trackingId: rawId,
      });
      res.json({
        success: true,
        data: {
          ...(statusRes.rawResponse || {}),
          delivery_status: statusRes.rawStatus,
        },
      });
    } catch (error: any) {
      console.error("Error in steadfast-status proxy:", error.message);
      res.status(500).json({ success: false, error: error.response?.data?.message || error.message || "Failed to fetch Steadfast status" });
    }
  });

  app.post("/api/admin/courier/sync-all", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    try {
      const db = getFirestore();
      const force = Boolean(req.body?.force);
      const limitNum = req.body?.limit ? Number(req.body.limit) : 60;
      const result = await syncAllActiveCourierOrders(db, {
        force,
        limit: limitNum,
        source: "ADMIN_MANUAL_SYNC",
      });
      return res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      console.error("[COURIER_SYNC] Manual sync-all error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to sync courier statuses" });
    }
  });

  app.post("/api/admin/courier/sync/:orderId", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    try {
      const db = getFirestore();
      const result = await syncSingleOrderCourierStatus(db, req.params.orderId, {
        source: "ADMIN_SINGLE_SYNC",
      });
      return res.json({ success: true, syncResult: result });
    } catch (err: any) {
      const statusCode = /not found/i.test(err.message || "") ? 404 : 400;
      return res.status(statusCode).json({ success: false, error: err.message || "Failed to sync order courier status" });
    }
  });

  app.post("/api/courier/webhook/steadfast", async (req, res) => {
    try {
      const db = getFirestore();
      const result = await processSteadfastWebhook(db, req.headers, req.body);
      return res.status(result.statusCode).json(result);
    } catch (err: any) {
      console.error("[COURIER_WEBHOOK] Error:", err.message);
      return res.status(500).json({ success: false, message: "Webhook processing failed" });
    }
  });

  app.get("/api/courier/steadfast/fraud/:phone", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized: Admin access required" });
    }
    const rawPhone = req.params.phone || "";
    const phone = rawPhone.replace(/[^0-9]/g, "");
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    try {
      let apiKey = process.env.STEADFAST_API_KEY || "";
      let secretKey = process.env.STEADFAST_SECRET_KEY || "";

      if (!apiKey || !secretKey) {
        try {
          const db = getFirestore();
          const keysDoc = await db.collection("admin_config").doc("keys").get();
          if (keysDoc.exists) {
            const data = keysDoc.data() || {};
            apiKey = apiKey || data.steadfastApiKey || "";
            secretKey = secretKey || data.steadfastSecretKey || "";
          }
        } catch (dbErr) {
          console.warn("Could not fetch keys from Firestore:", dbErr);
        }
      }

      if (!apiKey || !secretKey) {
        return res.status(400).json({ 
          success: false, 
          error: "Steadfast API Key settings missing. Please configure them in Dashboard Settings or server .env." 
        });
      }

      let responseData: any = null;
      try {
        const response = await axios.get(
          `https://portal.packzy.com/api/v1/fraud_check/score/${phone}`,
          {
            headers: {
              "Api-Key": apiKey,
              "Secret-Key": secretKey,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );
        responseData = response.data;
      } catch (scoreErr: any) {
        // Fallback to legacy endpoint if /score/ is unavailable
        if (scoreErr.response?.status === 404) {
          const fallbackRes = await axios.get(
            `https://portal.packzy.com/api/v1/fraud_check/${phone}`,
            {
              headers: {
                "Api-Key": apiKey,
                "Secret-Key": secretKey,
                "Content-Type": "application/json"
              },
              timeout: 10000
            }
          );
          responseData = fallbackRes.data;
        } else {
          throw scoreErr;
        }
      }

      const deliveryRate = responseData?.delivery_ratio !== undefined && responseData?.delivery_ratio !== null ? Number(responseData.delivery_ratio) : null;
      const cancellationRate = responseData?.cancellation_ratio !== undefined && responseData?.cancellation_ratio !== null ? Number(responseData.cancellation_ratio) : (responseData?.return_ratio !== undefined && responseData?.return_ratio !== null ? Number(responseData.return_ratio) : null);
      const fraudReports = responseData?.total_reports !== undefined ? Number(responseData.total_reports) : (Array.isArray(responseData?.total_fraud_reports) ? responseData.total_fraud_reports.length : (Number(responseData?.total_fraud_report) || 0));
      const volumeBand = responseData?.volume_band || "";
      const totalParcel = Number(responseData?.total_parcels || responseData?.total_parcel || 0);
      const totalDelivered = Number(responseData?.total_delivered || 0);
      const totalCancelled = Number(responseData?.total_cancelled || 0);

      res.json({
        success: true,
        data: {
          phone,
          delivery_rate: deliveryRate,
          cancellation_rate: cancellationRate,
          delivery_ratio: deliveryRate,
          cancellation_ratio: cancellationRate,
          return_ratio: cancellationRate,
          total_fraud_report: fraudReports,
          total_reports: fraudReports,
          volume_band: volumeBand,
          total_parcel: totalParcel,
          total_delivered: totalDelivered,
          total_cancelled: totalCancelled,
          raw: responseData
        }
      });
    } catch (error: any) {
      console.error("Error in steadfast-fraud check proxy:", error);
      res.status(error.response?.status || 500).json({ 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || "Failed to check customer fraud report" 
      });
    }
  });

  async function verifyIsAdmin(req: express.Request): Promise<boolean> {
    // In development mode only: localhost bypass for convenience
    const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    if (isLocal && process.env.NODE_ENV !== 'production') return true;

    const adminTokenHeader = req.headers['x-admin-token'];
    if (typeof adminTokenHeader === 'string' && MASTER_ADMIN_PASSWORD) {
      const a = Buffer.from(adminTokenHeader);
      const b = Buffer.from(MASTER_ADMIN_PASSWORD);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return true;
      }
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        if (decodedToken) {
          const db = getFirestore();
          const userEmail = (decodedToken.email || "").toLowerCase().trim();
          const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
          
          const masterEmails = [
            "bonieaminrony@gmail.com",
            "islamicsoktitv@gmail.com",
            "ishopbd.online@gmail.com",
            "ifilmbd2025@gmail.com"
          ];
          
          if (masterEmails.includes(userEmail) || masterEmails.includes(cleanEmail)) {
            return true;
          }

          // Check admin collection by UID
          const adminDoc = await db.collection("admins").doc(decodedToken.uid).get();
          if (adminDoc.exists && ["admin", "owner"].includes(adminDoc.data()?.role)) {
            return true;
          }

          // Check admin collection by email
          const adminEmailDoc = await db.collection("admins").doc(userEmail).get();
          if (adminEmailDoc.exists && ["admin", "owner"].includes(adminEmailDoc.data()?.role)) {
            return true;
          }
          
          if (cleanEmail !== userEmail) {
            const adminCleanEmailDoc = await db.collection("admins").doc(cleanEmail).get();
            if (adminCleanEmailDoc.exists && ["admin", "owner"].includes(adminCleanEmailDoc.data()?.role)) {
              return true;
            }
          }
        }
      } catch (err) {
        console.error("verifyIsAdmin error:", err);
      }
    }
    return false;
  }

  app.get("/api/admin/keys", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    try {
      const db = getFirestore();
      const keysDoc = await db.collection("admin_config").doc("keys").get();
      res.json({ success: true, keys: keysDoc.exists ? keysDoc.data() : {} });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || "Failed to read keys on server" });
    }
  });

  app.post("/api/admin/keys", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    const {
      steadfastApiKey,
      steadfastSecretKey,
      steadfastWebhookSecret,
      geminiApiKey,
      pathaoClientId,
      pathaoClientSecret,
      pathaoUsername,
      pathaoPassword
    } = req.body;
    try {
      const db = getFirestore();
      await db.collection("admin_config").doc("keys").set({
        steadfastApiKey: steadfastApiKey || "",
        steadfastSecretKey: steadfastSecretKey || "",
        steadfastWebhookSecret: steadfastWebhookSecret || "",
        geminiApiKey: geminiApiKey || "",
        pathaoClientId: pathaoClientId || "",
        pathaoClientSecret: pathaoClientSecret || "",
        pathaoUsername: pathaoUsername || "",
        pathaoPassword: pathaoPassword || "",
        updatedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ success: true, message: "Keys updated successfully on server" });
    } catch (error: any) {
      console.error("Error saving keys on server:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to save keys on server" });
    }
  });

  app.post("/api/admin/site-config", async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: "Unauthorized access" });
    }
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ success: false, error: "Missing site config payload" });
    }
    try {
      const db = getFirestore();
      await db.collection("config").doc("site").set({
        ...payload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      res.json({ success: true, message: "Site settings updated successfully on server" });
    } catch (error: any) {
      console.error("Error saving site config on server:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to save site config on server" });
    }
  });

  // =========================================================================
  // Marketing & Ads Integration API Endpoints (Central Tracking Engine)
  // =========================================================================

  registerMarketingRoutes(app, {
    verifyIsAdmin,
    buildMetaCapiPayload,
    buildTikTokEventsPayload,
    extractClientIp,
  });

  app.get("/api/marketing/public-config", async (req, res) => {
    try {
      const data = await getMarketingConfigSafe();

      const publicConfig = {
        meta: {
          enabled: data?.meta?.enabled ?? true,
          pixelId: data?.meta?.pixelId || "1358996272808579"
        },
        tiktok: {
          enabled: data?.tiktok?.enabled ?? true,
          pixelId: (data?.tiktok?.pixelId || "").trim() || "DBPHK73C77U4J2JR78JG"
        },
        google: {
          enabled: data?.google?.enabled ?? true,
          ga4MeasurementId: data?.google?.ga4MeasurementId || "G-90PDPQL0RJ",
          googleAdsConversionId: data?.google?.googleAdsConversionId || "",
          googleAdsConversionLabel: data?.google?.googleAdsConversionLabel || "",
          enhancedConversions: data?.google?.enhancedConversions ?? true,
          gtmContainerId: data?.google?.gtmContainerId || ""
        },
        whatsapp: {
          enabled: data?.whatsapp?.enabled ?? true,
          whatsappNumber: data?.whatsapp?.whatsappNumber || "017XXXXXXXX",
          defaultMessage: data?.whatsapp?.defaultMessage || ""
        },
        imo: {
          enabled: data?.imo?.enabled ?? true,
          campaignSource: data?.imo?.campaignSource || "imo"
        }
      };

      res.setHeader("Cache-Control", "public, max-age=60");
      return res.json({ success: true, config: publicConfig });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Failed to load public marketing config" });
    }
  });

  app.post("/api/track-event", async (req, res) => {
    const rawIp = extractClientIp(req.headers, req.socket.remoteAddress) || "unknown";
    if (!rateLimit(rawIp + ":track", 120, 60_000)) {
      return res.status(429).json({ success: false, error: "Too many tracking requests" });
    }

    try {
      const { eventName, eventId, eventTime, eventSourceUrl, referrer, userData, customData, omitRequestCookies, userAgent } = req.body || {};
      if (!eventName || typeof eventName !== "string" || !isSupportedTrackingEvent(eventName)) {
        return res.status(400).json({ success: false, error: "Unsupported or missing eventName" });
      }
      if (!eventId || typeof eventId !== "string" || eventId.length > 128) {
        return res.status(400).json({ success: false, error: "Valid eventId is required" });
      }

      const skipReqCookies = Boolean(omitRequestCookies);
      const cookies = skipReqCookies ? {} : parseCookies(req.headers.cookie);
      const config = (await getMarketingConfigSafe()) || {};
      const resolvedUserAgent =
        typeof userAgent === "string" && userAgent.trim()
          ? userAgent.trim()
          : (!skipReqCookies && typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined);
      const dispatchResult = await dispatchServerTrackingEvents(config, {
        eventName,
        eventId,
        eventTime: typeof eventTime === "number" ? eventTime : undefined,
        eventSourceUrl: typeof eventSourceUrl === "string" ? eventSourceUrl : req.headers.referer,
        referrer: typeof referrer === "string" ? referrer : req.headers.referer,
        clientIp: !skipReqCookies && rawIp !== "unknown" ? rawIp : undefined,
        userAgent: resolvedUserAgent,
        userData: {
          ...(userData && typeof userData === "object" ? userData : {}),
          fbp: userData?.fbp || cookies._fbp,
          fbc: userData?.fbc || cookies._fbc,
          ttp: userData?.ttp || cookies._ttp,
        },
        customData: customData && typeof customData === "object" ? customData : {},
      });

      return res.json({ success: true, ...dispatchResult });
    } catch (err: any) {
      console.error("[TRACK-EVENT] Error:", err.message);
      return res.status(500).json({ success: false, error: "Server tracking error" });
    }
  });

  app.get("/api/pathao-status", async (req, res) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: "Tracking ID is required" });
    }

    try {
      const db = getFirestore();
      const keysDoc = await db.collection("admin_config").doc("keys").get();
      const { pathaoClientId, pathaoClientSecret, pathaoUsername, pathaoPassword } = keysDoc.data() || {};
      if (!keysDoc.exists || !pathaoClientId || !pathaoClientSecret || !pathaoUsername || !pathaoPassword) {
        return res.status(500).json({ success: false, error: "Pathao API configuration missing. Please configure them in Dashboard Settings." });
      }

      // Step 1: Issue Pathao Token
      const tokenResponse = await axios.post(
        "https://api-hermes.pathao.com/aladdin/api/v1/issue-token",
        {
          client_id: pathaoClientId,
          client_secret: pathaoClientSecret,
          username: pathaoUsername,
          password: pathaoPassword,
          grant_type: "password"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 12000
        }
      );

      const accessToken = tokenResponse.data?.access_token;
      if (!accessToken) {
        return res.status(500).json({ success: false, error: "Failed to authenticate with Pathao" });
      }

      // Step 2: Track consignment via Hermes API
      const trackResponse = await axios.get(
        `https://api-hermes.pathao.com/aladdin/api/v1/orders/${id}/track`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          timeout: 12000
        }
      );

      res.json({ success: true, data: trackResponse.data });
    } catch (error: any) {
      console.error("Error in pathao-status proxy:", error);
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to fetch Pathao status";
      res.status(500).json({ success: false, error: errMsg });
    }
  });

  app.get("/api/courier/steadfast/status/:consignmentId", async (req, res) => {
    const { consignmentId } = req.params;
    // Keys could be passed from client or we can use admin keys, but client only knows siteConfig.
    // To be secure, we should expect API keys in headers from the admin/client.
    // Wait, the client sends this request. The client HAS siteConfig but keys are sensitive!
    // Actually, in i-shop-bd, siteConfig in Firebase has steadfastApiKey.
    const apiKey = req.headers["x-api-key"] as string;
    const secretKey = req.headers["x-secret-key"] as string;

    if (!apiKey || !secretKey) {
      return res.status(400).json({ success: false, error: "Steadfast API keys are missing in headers" });
    }

    try {
      const response = await axios.get(
        `https://portal.packzy.com/api/v1/status_by_cid/${consignmentId}`,
        {
          headers: {
            "Api-Key": apiKey,
            "Secret-Key": secretKey,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Error fetching Steadfast status:", error);
      res.status(500).json({ success: false, error: error.response?.data?.message || "Failed to fetch status" });
    }
  });

  registerAiRoutes(app, {
    rateLimit,
    getCachedProducts,
    extractClientIp,
  });


  registerPushRoutes(app, secureServiceAccountPaths);

  registerReviewsRoutes(app, {
    getCachedProducts,
    invalidateProductCache,
    parseFirestoreDoc,
    getIsAdminSdkHealthy: () => isAdminSdkHealthy,
  });

  // Static uploads directory & fallback proxy to live server for localhost
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
  }
  app.use("/uploads", express.static(uploadsDir));
  app.get("/uploads/*", (req, res) => {
    res.redirect(`https://ishopbd.com${req.originalUrl}`);
  });

  // Dynamic Product Image Route for Open Graph Previews & Lean Cache Images
  app.get("/api/product-image/:id", async (req, res) => {
    const productId = req.params.id;
    if (!productId) return res.status(400).send("Product ID required");

    try {
      let imageStr: string | undefined;
      const index = req.query.index !== undefined ? parseInt(String(req.query.index), 10) : NaN;

      // 1. Fast Path: In-Memory Product Cache
      const prods = await getCachedProducts();
      const matched = prods.find(p => p.id === productId || (p.slug && p.slug === productId));
      if (matched) {
        const rawCandidate = (!isNaN(index) && Array.isArray(matched.images) && matched.images[index])
          ? matched.images[index]
          : matched.image;
        if (rawCandidate && !String(rawCandidate).startsWith('/api/product-image/')) {
          imageStr = rawCandidate;
        }
      }

      // 2. Fallback to Firestore REST API if not found or if cache has circular /api/ link
      if (!imageStr) {
        const resolvedId = matched?.id || productId;
        const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8";
        const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${resolvedId}?key=${apiKey}`;
        const response = await axios.get(url, { timeout: 5000 }).catch(() => null);
        const data = response?.data;
        if (data && data.fields) {
          if (!isNaN(index) && data.fields.images?.arrayValue?.values && data.fields.images.arrayValue.values[index]?.stringValue) {
            imageStr = data.fields.images.arrayValue.values[index].stringValue;
          } else if (data.fields.image?.stringValue) {
            imageStr = data.fields.image.stringValue;
          }
        }
      }
      
      if (imageStr && typeof imageStr === "string") {
        if (imageStr.startsWith("data:")) {
          // Base64 data URI
          const match = imageStr.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            const contentType = match[1];
            const base64Data = match[2];
            const imgBuffer = Buffer.from(base64Data, 'base64');
            const etag = `"${crypto.createHash('md5').update(imgBuffer).digest('hex')}"`;

            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
            res.setHeader("ETag", etag);

            if (req.headers["if-none-match"] === etag) {
              return res.status(304).end();
            }
            return res.send(imgBuffer);
          }
        } else if (imageStr.startsWith("/uploads/") || imageStr.startsWith("uploads/")) {
          const cleanPath = imageStr.startsWith('/') ? imageStr.slice(1) : imageStr;
          const localPath = path.join(process.cwd(), 'public', cleanPath);
          if (fs.existsSync(localPath)) {
            const ext = path.extname(localPath).toLowerCase();
            const contentType = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
            return res.sendFile(localPath);
          } else {
            return res.redirect(`https://ishopbd.com/${cleanPath}`);
          }
        } else if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
          // Direct URL — SSRF protection: only allow known image CDNs
          const ALLOWED_IMAGE_HOSTS = [
            'firebasestorage.googleapis.com',
            'storage.googleapis.com',
            'lh3.googleusercontent.com',
            'i.imgur.com',
            'res.cloudinary.com',
            'ishopbd.com',
            'www.ishopbd.com'
          ];
          try {
            const parsedUrl = new URL(imageStr);
            if (ALLOWED_IMAGE_HOSTS.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host))) {
              return res.redirect(imageStr);
            } else {
              console.warn(`[SECURITY] Blocked SSRF redirect to: ${parsedUrl.hostname}`);
              return res.status(400).send('Invalid image source');
            }
          } catch {
            return res.status(400).send('Invalid image URL');
          }
        }
      }
      
      // Fallback
      const distPath = path.join(process.cwd(), 'dist');
      const logoPath = path.join(distPath, 'logo.png');
      if (fs.existsSync(logoPath)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(logoPath);
      }
      res.status(404).send("Image not found");
    } catch (error) {
      console.error("Error serving product image:", error);
      res.status(500).send("Failed to fetch image");
    }
  });

  // Health check & Keep-alive endpoint
  app.get('/api/ping', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send('pong');
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Set 1-year cache for static assets (CSS, JS, images)
    app.use(express.static(distPath, { maxAge: '1y', index: false }));

  app.get('*', async (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      const htmlPath = path.join(distPath, 'index.html');

      if (!fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
      }
      
      let html = fs.readFileSync(htmlPath, 'utf8');
      let productIdentifier = (req.query.p || req.query.product || req.query.landing) as string;
      if (!productIdentifier && req.path.startsWith('/product/')) {
        productIdentifier = req.path.replace(/^\/product\//, '').split('/')[0];
      } else if (!productIdentifier && req.path.startsWith('/p/')) {
        productIdentifier = req.path.replace(/^\/p\//, '').split('/')[0];
      }
      
      if (productIdentifier) {
        try {
          const rawIdentifier = decodeURIComponent(String(productIdentifier)).trim();
          const parts = rawIdentifier.split('-');
          let lastPart = parts[parts.length - 1];
          let productId = (lastPart && lastPart.length >= 6) ? lastPart : rawIdentifier;

          const allProds = await getCachedProducts().catch(() => []);
          let cachedProd = allProds.find((p: any) => p.id === productId || p.id === rawIdentifier || getProductSlug(p) === rawIdentifier || (p.slug && p.slug === rawIdentifier));

          let name = cachedProd?.name;
          let description = cachedProd?.description || "";
          let brand = cachedProd?.brand || "i SHOP BD";
          let price = Number(cachedProd?.price || 0);
          let stockVal = cachedProd?.stock !== undefined ? Number(cachedProd.stock) : 1;
          let inStock = stockVal > 0;
          let category = cachedProd?.category || "";
          let prodSlug = cachedProd?.slug;
          let resolvedId = cachedProd?.id || productId;
          let isFreeDelivery = Boolean(cachedProd?.isFreeDelivery);
          let weight = Number(cachedProd?.weight || 0);
          let createdAt: unknown = cachedProd?.createdAt;
          let mpn = cachedProd?.code || resolvedId;
          let rating = Number(cachedProd?.rating || 0);
          let reviewCount = Number(cachedProd?.reviewCount || 0);

          if (!cachedProd) {
            const apiKey = process.env.VITE_FIREBASE_API_KEY || "AIzaSyClPZu-7eztcpTyOT0vVWX-znIwouTg7I8";
            let url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${productId}?key=${apiKey}`;
            let response = await axios.get(url, { timeout: 4000 }).catch(() => null);
            
            if (!response?.data?.fields && productId !== rawIdentifier) {
              url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${rawIdentifier}?key=${apiKey}`;
              response = await axios.get(url, { timeout: 4000 }).catch(() => null);
              if (response?.data?.fields) {
                resolvedId = rawIdentifier;
              }
            }

            const data = response?.data;
            if (data && data.fields) {
              name = data.fields.name?.stringValue || "Product Details";
              description = data.fields.description?.stringValue || "";
              brand = data.fields.brand?.stringValue || "i SHOP BD";
              category = data.fields.category?.stringValue || "";
              if (data.fields.price) {
                price = Number(data.fields.price.integerValue || data.fields.price.doubleValue || data.fields.price.stringValue || 0);
              }
              stockVal = data.fields.stock ? Number(data.fields.stock.integerValue || data.fields.stock.doubleValue || data.fields.stock.stringValue || 0) : 1;
              inStock = stockVal > 0;
              prodSlug = data.fields.slug?.stringValue;
              isFreeDelivery = Boolean(data.fields.isFreeDelivery?.booleanValue);
              if (data.fields.weight) {
                weight = Number(data.fields.weight.integerValue || data.fields.weight.doubleValue || data.fields.weight.stringValue || 0);
              }
              createdAt = data.fields.createdAt?.stringValue || data.fields.createdAt?.timestampValue;
              mpn = data.fields.code?.stringValue || resolvedId;
              if (data.fields.rating) {
                rating = Number(data.fields.rating.integerValue || data.fields.rating.doubleValue || data.fields.rating.stringValue || 0);
              }
              if (data.fields.reviewCount) {
                reviewCount = Number(data.fields.reviewCount.integerValue || data.fields.reviewCount.doubleValue || data.fields.reviewCount.stringValue || 0);
              }
            }
          }
          
          if (name) {
            description = description.replace(/[\r\n]+/g, ' ').replace(/"/g, '&quot;').trim();
            if (description.length > 150) {
              description = description.substring(0, 147) + "...";
            }
            if (!description) {
              description = `${name} - Buy gadgets & lifestyle accessories online at i SHOP BD.`;
            }
            
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const imageUrl = `${protocol}://${host}/api/product-image/${resolvedId}`;
            const cleanSlug = getProductSlug({ id: resolvedId, name, slug: prodSlug });
            const productPath = `/p/${cleanSlug}`;
            const currentUrl = `${protocol}://${host}${productPath}`;
            const catSlug = category ? category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : "";
            
            const productSchema = buildProductStructuredData({
              id: resolvedId,
              name,
              description,
              image: imageUrl,
              url: currentUrl,
              brand,
              mpn,
              price,
              inStock,
              isFreeDelivery,
              weight,
              createdAt,
              rating,
              reviewCount,
            });

            const breadcrumbSchema = {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": `${protocol}://${host}/`
                },
                ...(category ? [{
                  "@type": "ListItem",
                  "position": 2,
                  "name": category,
                  "item": `${protocol}://${host}/category/${catSlug}`
                }] : []),
                {
                  "@type": "ListItem",
                  "position": category ? 3 : 2,
                  "name": name,
                  "item": currentUrl
                }
              ]
            };
            
            // Inject canonical URL and Product & Breadcrumb Schemas
            html = html.replace('<!-- CANONICAL_URL_PLACEHOLDER -->', `<link rel="canonical" href="${currentUrl}" />`);
            html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(productSchema)}</script><script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script></head>`);
            
            // Re-inject meta tags
            html = html.replace(/<title>[^<]*<\/title>/i, `<title>${name} - i SHOP BD</title>`);
            html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
            
            html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${currentUrl}" />`);
            html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${name}" />`);
            html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
            html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />`);
            
            html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/i, `<meta property="twitter:url" content="${currentUrl}" />`);
            html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${name}" />`);
            html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${description}" />`);
            html = html.replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${imageUrl}" />`);
            
            // Inject visible HTML for Googlebot SEO
            const fallbackHtml = `
              <div id="seo-fallback" style="opacity:0; position:absolute; z-index:-1;">
                <nav aria-label="Breadcrumb">
                  <ol>
                    <li><a href="/">Home</a></li>
                    ${category ? `<li><a href="/category/${catSlug}">${category}</a></li>` : ''}
                    <li>${name}</li>
                  </ol>
                </nav>
                <h1>${name}</h1>
                <img src="${imageUrl}" alt="${name}" />
                <p>${description}</p>
                <p>Price: ৳${price}</p>
                <p>Brand: ${brand}</p>
              </div>
            `;
            html = html.replace('<div id="root">', `<div id="root">${fallbackHtml}`);
          }
        } catch (error) {
          console.error("Error fetching product meta tags for OG:", error.message);
        }
      } else {
        let categorySlug = "";
        if (req.path.startsWith('/category/')) {
          categorySlug = req.path.replace(/^\/category\//, '').split('/')[0];
        } else if (req.path.startsWith('/c/')) {
          categorySlug = req.path.replace(/^\/c\//, '').split('/')[0];
        } else if (req.query.category) {
          categorySlug = String(req.query.category).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        }
        
        if (categorySlug) {
          const protocol = req.headers['x-forwarded-proto'] || req.protocol;
          const host = req.get('host');
          const currentUrl = `${protocol}://${host}/category/${categorySlug}`;
          
          const CATEGORY_SEO_DATA: Record<string, { title: string; description: string; keywords: string }> = {
            "charger-fan": {
              title: "চার্জার ফ্যান ও মিনি ফ্যান দাম | Rechargeable Charger Fan Price in BD - i SHOP BD",
              description: "সেরা দামে রিচার্জেবল চার্জার ফ্যান ও পোর্টেবল মিনি ফ্যান কিনুন i SHOP BD থেকে। হাই স্পিড ব্যাটারি ব্যাকআপ, ওয়ারেন্টি এবং দ্রুত হোম ডেলিভারি!",
              keywords: "চার্জার ফ্যান, রিচার্জেবল ফ্যান, মিনি ফ্যান, portable fan, mini charger fan, hand fan, fan price in bangladesh, rechargeable table fan, ishopbd"
            },
            "power-bank": {
              title: "পাওয়ার ব্যাংক এর দাম | Best Power Bank Price in Bangladesh - i SHOP BD",
              description: "সেরা দামে আসল পাওয়ার ব্যাংক (Power Bank) কিনুন i SHOP BD থেকে। 10000mAh, 20000mAh, 30000mAh ফাস্ট চার্জিং ও অফিসিয়াল ওয়ারেন্টি সহ হোম ডেলিভারি!",
              keywords: "পাওয়ার ব্যাংক, power bank price in bd, 10000mah power bank, 20000mah fast charging power bank, portable mobile charger, reman, joyroom, anker, ishopbd"
            },
            "smart-watch": {
              title: "স্মার্ট ওয়াচ এর দাম | Smart Watch Price in Bangladesh - i SHOP BD",
              description: "লেটেস্ট মডেলের স্মার্ট ওয়াচ কিনুন i SHOP BD থেকে। অ্যামোলেড ডিসপ্লে, ব্লুটুথ কলিং, হার্টরেট মনিটর ও দীর্ঘস্থায়ী ব্যাটারি ব্যাকআপ সহ সেরা অফার!",
              keywords: "স্মার্ট ওয়াচ, smart watch price in bd, calling smart watch, amoled smartwatch, smartwatch bd, ishopbd"
            },
            "headphone": {
              title: "হেডফোন ও ব্লুটুথ ইয়ারবাডস | Headphone & Earbuds Price in BD - i SHOP BD",
              description: "সেরা সাউন্ড কোয়ালিটি এবং অ্যাক্টিভ নয়েজ ক্যান্সেলেশন (ANC) হেডফোন ও ওয়্যারলেস ইয়ারবাডস কিনুন i SHOP BD থেকে। আকর্ষণীয় ডিসকাউন্ট ও ফাস্ট ডেলিভারি!",
              keywords: "হেডফোন, ব্লুটুথ ইয়ারবাডস, earbuds price in bd, wireless headphones, tws airpods bd, gaming headphone, ishopbd"
            },
            "mobile-accessories": {
              title: "মোবাইল এক্সেসরিজ ও গ্যাজেট | Mobile Accessories in Bangladesh - i SHOP BD",
              description: "সব ধরনের প্রিমিয়াম মোবাইল এক্সেসরিজ, ফাস্ট চার্জার, কেবল, ট্রাইপড ও ট্রিপড মাউন্ট কিনুন সেরা মূল্যে i SHOP BD থেকে।",
              keywords: "মোবাইল এক্সেসরিজ, mobile accessories bd, fast charger, usb cable, phone tripod, microphone, ishopbd"
            },
            "lifestyle-watch": {
              title: "লাইফস্টাইল গ্যাজেট ও ঘড়ি | Lifestyle & Watches in BD - i SHOP BD",
              description: "আধুনিক লাইফস্টাইল গ্যাজেট ও ট্রেন্ডি ঘড়ির বিশাল কালেকশন কিনুন i SHOP BD থেকে। দ্রুত হোম ডেলিভারি ও শতভাগ আসল পণ্যের গ্যারান্টি।",
              keywords: "লাইফস্টাইল গ্যাজেট, ঘড়ি, watches in bd, lifestyle accessories, ishopbd"
            }
          };

          const formattedName = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const categorySeo = CATEGORY_SEO_DATA[categorySlug] || {
            title: `${formattedName} Price in Bangladesh - i SHOP BD`,
            description: `Buy authentic ${formattedName} online at the best price in Bangladesh from i SHOP BD. Fast home delivery and warranty!`,
            keywords: `${categorySlug}, buy ${categorySlug} bd, ishopbd`
          };

          const imageUrl = `${protocol}://${host}/logo.png`;

          let categoryProducts: any[] = [];
          try {
            const allProds = await getCachedProducts();
            categoryProducts = allProds.filter(p => {
              if (p.deleted || p.isPublished === false) return false;
              const catSlug = (p.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
              return catSlug.includes(categorySlug) || categorySlug.includes(catSlug);
            });
          } catch (e) {}

          const categorySchema = {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": categorySeo.title,
            "description": categorySeo.description,
            "url": currentUrl,
            "image": imageUrl,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": categoryProducts.length,
              "itemListElement": categoryProducts.slice(0, 24).map((p, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `${protocol}://${host}/p/${getProductSlug(p)}`,
                "name": p.name,
                "image": p.image || imageUrl
              }))
            }
          };

          const categoryBreadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${protocol}://${host}/`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": formattedName,
                "item": currentUrl
              }
            ]
          };

          html = html.replace('<!-- CANONICAL_URL_PLACEHOLDER -->', `<link rel="canonical" href="${currentUrl}" />`);
          html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(categorySchema)}</script><script type="application/ld+json">${JSON.stringify(categoryBreadcrumbSchema)}</script></head>`);
          
          html = html.replace(/<title>[^<]*<\/title>/i, `<title>${categorySeo.title}</title>`);
          html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${categorySeo.description}" />`);
          html = html.replace(/<meta name="keywords" content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${categorySeo.keywords}" />`);
          
          html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${currentUrl}" />`);
          html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${categorySeo.title}" />`);
          html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${categorySeo.description}" />`);
          html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${imageUrl}" />`);
          
          html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/i, `<meta property="twitter:url" content="${currentUrl}" />`);
          html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/i, `<meta property="twitter:title" content="${categorySeo.title}" />`);
          html = html.replace(/<meta property="twitter:description" content="[^"]*"\s*\/?>/i, `<meta property="twitter:description" content="${categorySeo.description}" />`);
          html = html.replace(/<meta property="twitter:image" content="[^"]*"\s*\/?>/i, `<meta property="twitter:image" content="${imageUrl}" />`);

          const productListHtml = categoryProducts.length > 0 
            ? `<ul>${categoryProducts.map(p => `<li><a href="/p/${getProductSlug(p)}">${p.name} - ৳${p.price}</a></li>`).join('')}</ul>`
            : '';

          const fallbackHtml = `
            <div id="seo-category-fallback" style="opacity:0; position:absolute; z-index:-1;">
              <nav aria-label="Breadcrumb">
                <ol>
                  <li><a href="/">Home</a></li>
                  <li>${formattedName}</li>
                </ol>
              </nav>
              <h1>${categorySeo.title}</h1>
              <p>${categorySeo.description}</p>
              ${productListHtml}
            </div>
          `;
          html = html.replace('<div id="root">', `<div id="root">${fallbackHtml}`);
        }
      }
      
      if (html.includes('<!-- CANONICAL_URL_PLACEHOLDER -->')) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');
        html = html.replace('<!-- CANONICAL_URL_PLACEHOLDER -->', `<link rel="canonical" href="${protocol}://${host}/" />`);
      }
      
      try {
        const initialProds = await getCachedProducts();
        if (initialProds && initialProds.length > 0) {
          const leanInitial = toLeanProducts(initialProds);
          html = html.replace('</head>', `<script>window.__INITIAL_PRODUCTS__ = ${JSON.stringify(leanInitial)};</script></head>`);
        }
      } catch (e) {}

      try {
        const initialBanners = await getCachedBanners();
        if (initialBanners && initialBanners.length > 0) {
          html = html.replace('</head>', `<script>window.__INITIAL_BANNERS__ = ${JSON.stringify(initialBanners)};</script></head>`);
        }
      } catch (e) {}

      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.send(html);
    });
  }

  // ---- Global Error Handler ----
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV === "production") {
      console.log("Running in PRODUCTION mode");
    }
    // Proactive background pre-warm in parallel
    Promise.all([
      getCachedProducts().then(p => console.log(`[CACHE] Pre-warmed ${p.length} products into memory`)).catch(() => {}),
      getCachedBanners().then(b => console.log(`[CACHE] Pre-warmed ${b.length} banners into memory`)).catch(() => {})
    ]);

    // Automated Courier Status Sync (Steadfast & Pathao) every 10 minutes
    startCourierBackgroundSync(() => getFirestore(), 10);

    // Keep-Alive Self-Ping: Prevents server process cold-sleep every 4.5 minutes
    setInterval(() => {
      const pingUrl = process.env.NODE_ENV === "production"
        ? "https://ishopbd.com/api/ping"
        : `http://localhost:${PORT}/api/ping`;
      axios.get(pingUrl, { timeout: 5000 }).catch(() => {});
    }, 4.5 * 60 * 1000);
  });
}

startServer();
