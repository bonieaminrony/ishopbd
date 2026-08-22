<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🛒 i SHOP BD — Premium Online Shop Bangladesh

বাংলাদেশের সেরা প্রিমিয়াম অনলাইন শপ। রিচার্জেবল ফ্যান, স্মার্ট ওয়াচ, হেডফোন এবং আরও অনেক পণ্য।

---

## ✨ Features

| ফিচার | বিবরণ |
|---|---|
| 🛍️ **Product Catalog** | Firebase Firestore থেকে real-time products |
| 🛒 **Cart & Checkout** | District/Thana সহ সম্পূর্ণ checkout flow |
| 💳 **Multiple Payment** | Cash on Delivery, Wallet, bKash |
| 🤖 **AI Chat** | Gemini AI — বাংলা ও English উভয়ে উত্তর দেয় |
| 🎯 **AI Recommendations** | Smart product recommendations |
| 🏷️ **Coupon System** | Server-side validated coupons |
| 🚚 **Courier Integration** | Steadfast & Pathao API |
| 📱 **SMS Notification** | BulkSMSBD সংযুক্ত |
| 📧 **Email Alerts** | HTML order confirmation email |
| 🔔 **Push Notifications** | Firebase FCM |
| 🏪 **Admin Panel** | সম্পূর্ণ admin dashboard |
| 📊 **Profit Analysis** | Revenue & profit reports |
| 📦 **POS System** | Point of Sale |
| 🗺️ **Sitemap** | Products + Categories + Campaigns |
| 🔒 **Security** | Rate limiting, brute force protection, server-side price verification |

---

## 🚀 Local এ Run করুন

**Prerequisites:** Node.js v18+

### 1. Dependencies Install করুন
```bash
npm install
```

### 2. Environment Variables সেট করুন
```bash
# .env.example থেকে .env তৈরি করুন
copy .env.example .env
```

`.env` ফাইলে এগুলো পূরণ করুন:
```env
GEMINI_API_KEY=your_gemini_api_key
MASTER_ADMIN_PASSWORD=your_secure_password
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
SMS_API_KEY=your_bulksmsbd_api_key
STEADFAST_API_KEY=your_steadfast_key
STEADFAST_SECRET_KEY=your_steadfast_secret
```

### 3. Firebase Service Account
`api/service-account.json` ফাইলটি Firebase Console থেকে download করে রাখুন।

### 4. Server Start করুন
```bash
npm run dev
```

Server চলবে: **http://localhost:3000**

---

## 🏗️ Build & Production

```bash
# Build করুন
npm run build

# Production-এ start করুন
npm start
```

---

## 🔑 API Endpoints

| Method | Endpoint | বিবরণ |
|---|---|---|
| `POST` | `/api/verify-admin` | Admin password verify |
| `POST` | `/api/create-order` | নতুন অর্ডার (stock validation সহ) |
| `POST` | `/api/validate-coupon` | Coupon validate করা |
| `POST` | `/api/confirm-order` | Email notification পাঠানো |
| `POST` | `/api/send-sms` | Single SMS |
| `POST` | `/api/send-bulk-sms` | Bulk SMS (SSE streaming) |
| `POST` | `/api/chat` | AI Chat (বাংলা + English) |
| `POST` | `/api/ai-recommendations` | Product recommendations |
| `POST` | `/api/upload` | Image upload |
| `POST` | `/api/send-push` | FCM Push notification |
| `GET` | `/api/steadfast-status` | Steadfast tracking |
| `GET` | `/api/pathao-status` | Pathao tracking |
| `GET` | `/sitemap.xml` | SEO Sitemap |

---

## 🧪 Tests Run করুন

```bash
# একবার run করুন
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📁 Project Structure

```
ishopbd.com/
├── src/
│   ├── App.tsx              # Main app component
│   ├── components/          # UI components
│   │   ├── AdminPanel.tsx   # Admin dashboard
│   │   ├── CheckoutModal.tsx
│   │   ├── ProductDetails.tsx
│   │   └── ui/              # Reusable UI
│   ├── context/             # React contexts
│   ├── lib/firebase.ts      # Firebase config
│   ├── tests/               # Test files
│   └── types.ts             # TypeScript types
├── server.ts                # Express backend
├── api/service-account.json # Firebase Admin credentials
└── .env                     # Environment variables (never commit!)
```

---

## 🔒 Security Features

- ✅ Admin brute-force lockout (5 attempts → 15 min lockout)
- ✅ Rate limiting per IP (all API endpoints)
- ✅ Server-side order price verification
- ✅ Server-side coupon validation
- ✅ CORS protection (production)
- ✅ Security headers (HSTS, X-Frame, CSP)
- ✅ No sensitive data in logs

---

## 📞 Support

- **Website:** [ishopbd.com](https://ishopbd.com)
- **Facebook:** [i SHOP BD](https://facebook.com/ishopbd)
