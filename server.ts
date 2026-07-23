import express from "express";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import compression from "compression";
import crypto from "crypto";

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

// ---- Security: Require MASTER_ADMIN_PASSWORD in env (no hardcoded fallback) ----
if (!process.env.MASTER_ADMIN_PASSWORD) {
  console.error('[CRITICAL] MASTER_ADMIN_PASSWORD is not set in .env. Admin login will be disabled.');
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


let serviceAccountPath = path.join(process.cwd(), "api", "service-account.json");
if (!fs.existsSync(serviceAccountPath)) {
  serviceAccountPath = path.join(process.cwd(), "public", "api", "service-account.json");
}
if (fs.existsSync(serviceAccountPath)) {
  try {
    admin.initializeApp({
      credential: admin.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
      databaseURL: "https://i-shop-bd.firebaseio.com"
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (e) {
    if (!/already exists/.test(e.message)) {
      console.error("Firebase Admin init error:", e);
    }
  }
} else {
  console.error("[CRITICAL] service-account.json not found. Backend checkout won't work.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Trust proxy for correct IP detection behind NGINX/Cloudflare
  app.set("trust proxy", 1);

  // ---- Compression Middleware ----
  app.use(compression());

  // Reduced body size limit to prevent DoS. Image uploads handled separately with higher limit.
  app.use("/api/chat", express.json({ limit: '32kb' }));
  app.use("/api/send-push", express.json({ limit: '16kb' }));
  app.use("/api/send-sms", express.json({ limit: '8kb' }));
  app.use("/api/send-bulk-sms", express.json({ limit: '256kb' }));
  app.use("/api/confirm-order", express.json({ limit: '64kb' }));
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
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Api-Key,X-Secret-Key');
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

  // ---- General API Rate Limit: 300 req/min per IP ----
  app.use("/api", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":api", 300, 60_000)) {
      return res.status(429).json({ error: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।" });
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

  // API Routes
  app.post("/api/verify-admin", (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // Brute-force protection: max 5 failed attempts → 15-min lockout
    const bf = checkAdminBruteForce(ip);
    if (!bf.allowed) {
      return res.status(429).json({
        success: false,
        error: `অনেক বেশি ভুল চেষ্টা করা হয়েছে। ${bf.lockedFor} সেকেন্ড পর আবার চেষ্টা করুন।`
      });
    }

    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
    if (!masterPassword) {
      console.error('[SECURITY] MASTER_ADMIN_PASSWORD not set — admin login disabled.');
      return res.status(503).json({ success: false, error: 'Admin login is currently disabled.' });
    }

    const { password } = req.body;
    if (typeof password !== 'string' || password.length === 0 || password.length > 200) {
      return res.status(400).json({ success: false, error: 'Invalid password format.' });
    }

    if (password.trim() === masterPassword.trim()) {
      clearAdminFail(ip);
      return res.json({ success: true });
    }

    recordAdminFail(ip);
    return res.status(401).json({ success: false, error: 'পাসওয়ার্ড ভুল হয়েছে।' });
  });

  app.post("/api/send-sms", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":sms", 5, 60_000)) {
      return res.status(429).json({ success: false, message: "অতিরিক্ত এসএমএস রিকোয়েস্ট করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।" });
    }
    const { phone, message, senderId } = req.body;

    // Input validation
    if (!phone || typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'ফোন নম্বর দেওয়া হয়নি' });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'মেসেজ খালি রাখা যাবে না' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: 'মেসেজ ১০০০ অক্ষরের বেশি হতে পারবে না' });
    }

    // SMS Configuration from .env
    const SMS_API_KEY = process.env.SMS_API_KEY;
    const SMS_SENDER_ID = senderId || process.env.SMS_SENDER_ID || "8809648908219";

    if (!SMS_API_KEY) {
      console.warn("SMS_API_KEY not set in environment. SMS not sent.");
      return res.status(200).json({ success: false, message: "এসএমএস এপিআই কী কনফিগার করা নেই" });
    }

    // Format phone number to 8801XXXXXXXXX format
    let formattedPhone = String(phone || "").trim();
    // Convert Bengali digits to English
    const banglaToEnglish = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    formattedPhone = formattedPhone.replace(/[০-৯]/g, (match) => (banglaToEnglish as any)[match]);
    // Remove all non-digits except leading +
    const isPlus = formattedPhone.startsWith("+");
    formattedPhone = formattedPhone.replace(/\D/g, "");
    if (isPlus) formattedPhone = "+" + formattedPhone;

    if (formattedPhone.startsWith("+")) {
      formattedPhone = formattedPhone.substring(1);
    }
    if (formattedPhone.startsWith("01") && formattedPhone.length === 11) {
      formattedPhone = "88" + formattedPhone;
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
        message: isSuccess ? "এসএমএস সফলভাবে পাঠানো হয়েছে" : (data.error_message || "এসএমএস পাঠাতে ব্যর্থ হয়েছে"), 
        data 
      });
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ success: false, error: "সার্ভার সমস্যার কারণে এসএমএস পাঠাতে ব্যর্থ হয়েছে" });
    }
  });

  // Bulk SMS endpoint with SSE streaming for real-time progress
  app.post("/api/send-bulk-sms", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":bulksms", 2, 60_000)) {
      return res.status(429).json({ success: false, message: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।" });
    }
    const { phones, message, senderId } = req.body;

    const SMS_API_KEY = process.env.SMS_API_KEY;
    const SMS_SENDER_ID = senderId || process.env.SMS_SENDER_ID || "8809648908219";

    if (!SMS_API_KEY) {
      return res.status(200).json({ success: false, message: "এসএমএস এপিআই কী কনফিগার করা নেই" });
    }
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ success: false, message: "কোনো ফোন নম্বর দেওয়া হয়নি" });
    }
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "মেসেজ খালি রাখা যাবে না" });
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
          sendEvent({ type: "batch_done", batchNum, success: false, count: batch.length, error: data.error_message || "এপিআই এরর", sent: totalSuccess, failed: totalFail });
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
      if (!admin.apps.length) return res.status(500).send("Firebase not initialized");
      const db = admin.firestore();
      const snapshot = await db.collection("products").where("deleted", "==", false).get();
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Base URL
      xml += `  <url>\n    <loc>https://ishopbd.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      
      snapshot.forEach(doc => {
        const id = doc.id;
        xml += `  <url>\n    <loc>https://ishopbd.com/?product=${id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      });
      
      xml += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

  app.post("/api/create-order", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":create-order", 10, 60_000)) {
      return res.status(429).json({ success: false, error: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে।" });
    }

    const { newOrder, checkoutItems } = req.body;
    if (!newOrder || !checkoutItems || !Array.isArray(checkoutItems) || checkoutItems.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    if (!admin.apps.length) {
      return res.status(500).json({ success: false, error: "Server misconfiguration (Firebase Admin not initialized)" });
    }

    const db = admin.firestore();
    let decodedToken: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        decodedToken = await admin.auth().verifyIdToken(authHeader.split('Bearer ')[1]);
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
             if (!snap.exists) throw new Error(`প্রোডাক্ট পাওয়া যায়নি`);
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
          if (reqQty <= 0) throw new Error("ইনভ্যালিড কোয়ান্টিটি");

          let currentVariants = [...(pData.variants || [])];
          let currentStock = Number(pData.stock || 0);
          let variantMatched = false;

          // If there are wholesale sizes (for quick checkout wholesale mode)
          if (item.wholesaleSizeQty && Object.keys(item.wholesaleSizeQty).length > 0) {
             for (const [wSize, wQty] of Object.entries(item.wholesaleSizeQty)) {
                const qtyNum = Number(wQty);
                if (qtyNum < 0) throw new Error("ইনভ্যালিড কোয়ান্টিটি");
                if (qtyNum === 0) continue;
                const vIndex = currentVariants.findIndex(v => (v.size ? String(v.size).trim().toLowerCase() : null) === wSize.trim().toLowerCase());
                if (vIndex > -1) {
                  const vStock = Number(currentVariants[vIndex].stock || 0);
                  if (vStock < qtyNum && !pData.isComingSoon) throw new Error(`দুঃখিত, ${pData.name} এর স্টক শেষ!`);
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
                if (vStock < reqQty && !pData.isComingSoon) throw new Error(`দুঃখিত, ${pData.name} এর স্টক শেষ!`);
                currentVariants[vIndex].stock = vStock - reqQty;
                variantMatched = true;
             }
          }

          if (!variantMatched) {
            if (currentStock < reqQty && !pData.isComingSoon) throw new Error(`দুঃখিত, ${pData.name} এর স্টক শেষ!`);
            currentStock -= reqQty;
          }

          updatedProducts[pId] = { ...pData, variants: currentVariants, stock: currentStock };
        }

        // Commit updates to products
        for (const [pId, pData] of Object.entries(updatedProducts)) {
          transaction.update(productRefs[pId], {
            variants: pData.variants,
            stock: pData.stock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
            if (reqQty <= 0) throw new Error("ইনভ্যালিড কোয়ান্টিটি");
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
        if (clientPoints > userPoints) throw new Error("আপনার পর্যাপ্ত পয়েন্ট নেই!");
        const clientDiscount = Number(newOrder.discount) || 0; // If any other discount
        
        // 1. Verify Subtotal matches server calculated subtotal
        if (Math.abs(clientSubtotal - expectedSubtotal) > 5) {
            console.error(`Subtotal mismatch! Client: ${clientSubtotal}, Server: ${expectedSubtotal}`);
            throw new Error("অর্ডারের দামে অমিল পাওয়া গেছে। সিকিউরিটি কারণে অর্ডারটি ব্লক করা হয়েছে।");
        }
        
        // 2. Verify Total math
        const expectedTotalMath = clientSubtotal + clientDelivery - clientPoints - clientDiscount;
        if (Math.abs(clientTotal - expectedTotalMath) > 5) {
            console.error(`Total math mismatch! ClientTotal: ${clientTotal}, Math: ${expectedTotalMath}`);
            throw new Error("টোটাল হিসেবে কারচুপি ধরা পড়েছে। অর্ডারটি ব্লক করা হয়েছে।");
        }

        const orderId = newOrder.orderId || newOrder.id || `ORD${Date.now()}`;
        delete newOrder.id; // avoid storing id in document body if it exists
        newOrder.createdAt = admin.firestore.FieldValue.serverTimestamp();
        newOrder.status = "pending";
        
        if (newOrder.total < 0) throw new Error("ইনভ্যালিড টোটাল অ্যামাউন্ট");

        transaction.set(db.collection("orders").doc(orderId), newOrder);

        // Deduct wallet if paid via wallet
        if (newOrder.paymentMethod === "wallet" && newOrder.userId && newOrder.userId !== "guest") {
          const userRef = db.collection("users").doc(newOrder.userId);
          transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(-newOrder.total),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      });

      res.json({ success: true, message: "অর্ডার সফলভাবে তৈরি হয়েছে" });
    } catch (e) {
      console.error("Order creation error:", e);
      res.status(500).json({ success: false, error: e.message || "অর্ডার প্রসেস করতে সমস্যা হয়েছে" });
    }
  });

  app.post("/api/confirm-order", async (req, res) => {
    // Rate limit: 10 order confirmations per IP per minute
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":order", 10, 60_000)) {
      return res.status(429).json({ success: false, error: "অতিরিক্ত রিকোয়েস্ট করা হয়েছে।" });
    }

    const { customerName, customerPhone, items, total, address } = req.body;

    // Input validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0 || customerName.length > 200) {
      return res.status(400).json({ success: false, error: 'কাস্টমার নাম সঠিক নয়।' });
    }
    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.length > 20) {
      return res.status(400).json({ success: false, error: 'ফোন নম্বর সঠিক নয়।' });
    }
    if (!address || typeof address !== 'string' || address.length > 1000) {
      return res.status(400).json({ success: false, error: 'ঠিকানা সঠিক নয়।' });
    }
    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({ success: false, error: 'আইটেম তালিকা সঠিক নয়।' });
    }
    if (typeof total !== 'number' || total < 0 || total > 10_000_000) {
      return res.status(400).json({ success: false, error: 'মোট পরিমাণ সঠিক নয়।' });
    }

    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: notifyEmail,
      subject: `New Order from ${customerName.substring(0, 100)}`,
      text: [
        'New Order Confirmed!',
        '',
        `Customer Name: ${customerName}`,
        `Phone Number: ${customerPhone}`,
        `Address: ${address}`,
        `Total Amount: ৳${total}`,
        '',
        'Items:',
        ...items.map((item: any) => {
          const name = typeof item?.product?.name === 'string' ? item.product.name.substring(0, 200) : 'Unknown';
          const qty = typeof item?.quantity === 'number' ? item.quantity : '?';
          return `- ${name} (Qty: ${qty})`;
        }),
      ].join('\n'),
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${notifyEmail}`);
      } else {
        console.warn("EMAIL_USER or EMAIL_PASS not set. Email not sent.");
      }
      res.json({ success: true, message: "অর্ডার সফলভাবে প্রসেস করা হয়েছে" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "ইমেইল পাঠাতে ব্যর্থ হয়েছে" });
    }
  });



  app.post("/api/courier/steadfast/bulk", async (req, res) => {
    // Auth guard: require admin password header
    const adminToken = req.headers['x-admin-token'] as string;
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;
    if (!masterPassword || !adminToken || adminToken !== masterPassword) {
      return res.status(403).json({ success: false, error: "Unauthorized: Admin access required" });
    }

    // Use server-side env keys; fallback to body keys if env not set (backward compat)
    const apiKey = process.env.STEADFAST_API_KEY || req.body.apiKey;
    const secretKey = process.env.STEADFAST_SECRET_KEY || req.body.secretKey;
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
            recipient_phone: order.recipient_phone,
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
            return {
              id: order.id,
              success: true,
              trackingId: response.data.consignment?.tracking_code || response.data.consignment?.consignment_id || "Success"
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
      const keysDoc = await db.collection("admin_config").doc("keys").get();
      const { steadfastApiKey, steadfastSecretKey } = keysDoc.data() || {};
      if (!keysDoc.exists || !steadfastApiKey || !steadfastSecretKey) {
        return res.status(500).json({ success: false, error: "Steadfast API Key settings missing. Please configure them in Dashboard Settings." });
      }

      const response = await axios.get(
        `https://portal.packzy.com/api/v1/status_by_cid/${id}`,
        {
          headers: {
            "Api-Key": steadfastApiKey,
            "Secret-Key": steadfastSecretKey,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Error in steadfast-status proxy:", error);
      res.status(500).json({ success: false, error: error.response?.data?.message || "Failed to fetch Steadfast status" });
    }
  });

  app.get("/api/courier/steadfast/fraud/:phone", async (req, res) => {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }

    try {
      const db = getFirestore();
      const keysDoc = await db.collection("admin_config").doc("keys").get();
      const { steadfastApiKey, steadfastSecretKey } = keysDoc.data() || {};
      if (!keysDoc.exists || !steadfastApiKey || !steadfastSecretKey) {
        return res.status(500).json({ success: false, error: "Steadfast API Key settings missing. Please configure them in Dashboard Settings." });
      }

      const response = await axios.get(
        `https://portal.packzy.com/api/v1/fraud_check/${phone}`,
        {
          headers: {
            "Api-Key": steadfastApiKey,
            "Secret-Key": steadfastSecretKey,
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );
      res.json({ success: true, data: response.data });
    } catch (error: any) {
      console.error("Error in steadfast-fraud check proxy:", error);
      res.status(error.response?.status || 500).json({ 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || "Failed to check customer fraud report" 
      });
    }
  });

  async function verifyIsAdmin(req: express.Request): Promise<boolean> {
    const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    if (isLocal) return true;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
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

  app.post("/api/chat", async (req, res) => {
    // Stricter rate limit for AI: 10 req/min per IP
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!rateLimit(ip + ":chat", 10, 60_000)) {
      return res.status(429).json({ error: "এআই রিকোয়েস্ট লিমিট শেষ হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।" });
    }

    const { messages, modelName = "gemini-1.5-flash" } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "এআই কনফিগার করা নেই" });
    }

    try {
      // Normalize history to alternate between 'user' and 'model'
      const normalizedMessages: any[] = [];
      let lastRole: string | null = null;

      // Group consecutive same-role messages
      for (const m of messages) {
        const role = m.role === "assistant" ? "model" : "user";
        if (role === lastRole) {
          normalizedMessages[normalizedMessages.length - 1].parts[0].text += "\n" + m.content;
        } else {
          normalizedMessages.push({
            role: role,
            parts: [{ text: m.content }],
          });
          lastRole = role;
        }
      }

      // Gemini history must start with 'user'
      while (normalizedMessages.length > 0 && normalizedMessages[0].role !== "user") {
        normalizedMessages.shift();
      }

      // Load products from Firestore to inject into Gemini context
      let productsList: any[] = [];
      try {
        const db = getFirestore();
        const productsSnap = await db.collection("products").get();
        productsList = productsSnap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            name: data.name || "Unknown Product",
            price: data.price || 0,
            stock: data.stock !== undefined ? data.stock : 0,
            isComingSoon: !!data.isComingSoon
          };
        });
      } catch (err) {
        console.error("Failed to load products for AI context:", err);
      }

      const productsContext = productsList
        .map(p => `- ${p.name}: Price ৳${p.price}, Stock: ${p.stock}${p.isComingSoon ? " (Pre-order)" : ""}`)
        .join("\n");

      const systemInstruction = `You are an AI assistant for 'i SHOP BD', the best premium online shop in Bangladesh. Always start your response with 'আসসালামুয়ালাইকুম স্যার' and address the user as 'স্যার' throughout the conversation. Answer questions about rechargeable fans, smart watches, headphones, and accessories, and suggest products based on their budget and interest. Answer in Bengali with a friendly tone. Use proper BDT pricing (৳).
Here is the current real-time products catalog of i SHOP BD:
${productsContext}

If a product is out of stock (Stock is 0 or less), let them know. If they want to order a product, ask them to find the product on the screen, add it to the cart or click 'Buy Now' to complete the order.`;

      const genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      const response = await genAI.models.generateContent({
        model: modelName === "gemini-1.5-flash" ? "gemini-3-flash-preview" : modelName,
        contents: normalizedMessages,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "এআই থেকে রেসপন্স পেতে ব্যর্থ হয়েছে" });
    }
  });


  // OAuth2 Token generation helper for Google FCM API using RS256 JWT
  async function getFCMToken(serviceAccountPath: string): Promise<{ access_token: string; project_id: string }> {
    const keyData = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;
    const claim = {
      iss: keyData.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: keyData.token_uri,
      exp: exp,
      iat: now
    };
    const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const base64UrlClaim = Buffer.from(JSON.stringify(claim)).toString("base64url");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(base64UrlHeader + "." + base64UrlClaim);
    const signature = sign.sign(keyData.private_key).toString("base64url");
    const jwt = base64UrlHeader + "." + base64UrlClaim + "." + signature;
    const response = await axios.post(keyData.token_uri, new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return {
      access_token: response.data.access_token,
      project_id: keyData.project_id
    };
  }

  // Push notification endpoint
  app.post("/api/send-push", async (req, res) => {
    const { token, title = "Notification", body, link = "/" } = req.body;
    if (!token || !body) {
      return res.status(400).json({ error: "Missing token or body" });
    }
    let serviceAccountPath = path.join(process.cwd(), "api", "service-account.json");
    if (!fs.existsSync(serviceAccountPath)) {
      serviceAccountPath = path.join(process.cwd(), "public", "api", "service-account.json");
    }
    if (!fs.existsSync(serviceAccountPath)) {
      console.error("[CRITICAL] service-account.json key not found for FCM");
      return res.status(500).json({ error: "Service account key not found" });
    }
    try {
      const authData = await getFCMToken(serviceAccountPath);
      const fcmUrl = `https://fcm.googleapis.com/v1/projects/${authData.project_id}/messages:send`;
      const notification = {
        message: {
          token,
          notification: { title, body },
          webpush: { fcm_options: { link } }
        }
      };
      const response = await axios.post(fcmUrl, notification, {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/json"
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("FCM Send Error:", error?.response?.data || error.message);
      res.status(500).json({ error: "Failed to send push notification", details: error?.response?.data || error.message });
    }
  });


  // Dynamic Product Image Route for Open Graph Previews
  app.get("/api/product-image/:id", async (req, res) => {
    const productId = req.params.id;
    try {
      const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${productId}`;
      const response = await axios.get(url, { timeout: 5000 });
      const data = response.data;
      
      if (data && data.fields && data.fields.image) {
        const imageStr = data.fields.image.stringValue;
        if (imageStr && imageStr.startsWith("data:")) {
          // Base64 data URI
          const match = imageStr.match(/^data:([^;]+);base64,(.*)$/);
          if (match) {
            const contentType = match[1];
            const base64Data = match[2];
            const imgBuffer = Buffer.from(base64Data, 'base64');
            res.setHeader("Content-Type", contentType);
            res.setHeader("Cache-Control", "public, max-age=86400");
            return res.send(imgBuffer);
          }
        } else if (imageStr && (imageStr.startsWith("http://") || imageStr.startsWith("https://"))) {
          // Direct URL — SSRF protection: only allow known image CDNs
          const ALLOWED_IMAGE_HOSTS = [
            'firebasestorage.googleapis.com',
            'storage.googleapis.com',
            'lh3.googleusercontent.com',
            'i.imgur.com',
            'res.cloudinary.com',
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
        return res.sendFile(logoPath);
      }
      res.status(404).send("ছবি পাওয়া যায়নি");
    } catch (error) {
      console.error("Error serving product image:", error);
      res.status(500).send("ছবি ফেচ করতে সমস্যা হয়েছে");
    }
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
    // Prevent caching of index.html and inject Open Graph meta tags dynamically
    app.get('/api/ping', (req, res) => {
    res.status(200).send('pong');
  });

  app.get('*', async (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      const htmlPath = path.join(distPath, 'index.html');

      if (!fs.existsSync(htmlPath)) {
        return res.sendFile(htmlPath);
      }
      
      let html = fs.readFileSync(htmlPath, 'utf8');
      const productId = req.query.p || req.query.product || req.query.landing;
      
      if (productId) {
        try {
          const url = `https://firestore.googleapis.com/v1/projects/i-shop-bd/databases/(default)/documents/products/${productId}`;
          const response = await axios.get(url, { timeout: 4000 });
          const data = response.data;
          
          if (data && data.fields) {
            const name = data.fields.name?.stringValue || "Product Details";
            let description = data.fields.description?.stringValue || "";
            description = description.replace(/[\r\n]+/g, ' ').replace(/"/g, '&quot;').trim();
            if (description.length > 150) {
              description = description.substring(0, 147) + "...";
            }
            if (!description) {
              description = `${name} - Buy gadgets & electronics online at i SHOP BD.`;
            }
            
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const imageUrl = `${protocol}://${host}/api/product-image/${productId}`;
            const currentUrl = `${protocol}://${host}${req.originalUrl}`;
            
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
          }
        } catch (error) {
          console.error("Error fetching product meta tags for OG:", error.message);
        }
      }
      
      res.send(html);
    });
  }

  // ---- Global Error Handler ----
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'ইন্টারনাল সার্ভার এরর' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV === "production") {
      console.log("Running in PRODUCTION mode");
    }
  });
}

startServer();
