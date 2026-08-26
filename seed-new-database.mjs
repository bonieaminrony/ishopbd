import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'api', 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ 'api/service-account.json' ফাইলটি পাওয়া যায়নি!");
  console.log("অনুগ্রহ করে আপনার নতুন Firebase Console থেকে Service Account Key ডাউনলোড করে 'api/service-account.json' হিসেবে রাখুন।");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

const DEFAULT_CATEGORIES = [
  { name: "খাঁটি মধু ও হানি নাট" },
  { name: "কালোজিরা ও কোল্ড প্রেসড অয়েল" },
  { name: "খাঁটি আম, আমসত্ত্ব ও আচার" },
  { name: "গাওয়া ঘি ও সরিষার তেল" },
  { name: "খেজুর ও প্রিমিয়াম ড্রাই ফ্রুটস" },
  { name: "অর্গানিক বীজ ও সুপারফুড" },
  { name: "খাঁটি মসলা ও ভেষজ চা" },
];

const DEFAULT_PRODUCTS = [
  {
    name: "সুন্দরবনের প্রাকৃতিক চাকের খাঁটি মধু (Sundarban Raw Honey)",
    price: 950,
    originalPrice: 1200,
    discount: 21,
    stock: 60,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop",
    category: "খাঁটি মধু ও হানি নাট",
    isTrending: true,
    description: "সুন্দরবনের গভীর অরণ্য থেকে সরাসরি সংগৃহীত ১০০% প্রাকৃতিক ও অপরিশোধিত খাঁটি চাকের মধু। কোনো প্রকার কৃত্রিম মিষ্টি বা প্রিজারভেটিভ মুক্ত।",
    variants: [
      { id: "v1", name: "৫০০ গ্রাম", size: "500g", stock: 35, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop" },
      { id: "v2", name: "১ কেজি", size: "1kg", stock: 25, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "প্রিমিয়াম এনার্জি হানি নাট (Premium Honey Nut with 12+ Dry Fruits)",
    price: 850,
    originalPrice: 1100,
    discount: 23,
    stock: 70,
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&h=500&fit=crop",
    category: "খাঁটি মধু ও হানি নাট",
    isTrending: true,
    description: "খাঁটি সুন্দরবনের মধুতে ভেজানো কাজুবাদাম, কাঠবাদাম, পেস্তা, আখরোট, কিশমিশ, খুবানি ও প্রিমিয়াম ড্রাই ফ্রুটসের পুষ্টিকর সুপার এনার্জি প্যাক।",
    variants: [
      { id: "v1", name: "৫০০ গ্রাম", size: "500g", stock: 40, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&h=500&fit=crop" },
      { id: "v2", name: "১ কেজি", size: "1kg", stock: 30, image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "কোল্ড প্রেসড খাঁটি কালোজিরা তেল (Pure Cold-Pressed Black Seed Oil)",
    price: 450,
    originalPrice: 600,
    discount: 25,
    stock: 50,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop",
    category: "কালোজিরা ও কোল্ড প্রেসড অয়েল",
    isTrending: true,
    description: "বাছাইকৃত ১০০% প্রিমিয়াম কালোজিরা থেকে ফার্স্ট কোল্ড প্রেস এক্সট্রাকশনে তৈরি শতভাগ খাঁটি ও মহাঔষধী গুণসম্পন্ন কালোজিরা তেল।",
    variants: [
      { id: "v1", name: "১০০ মিলি", size: "100ml", stock: 30, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop" },
      { id: "v2", name: "২৫০ মিলি", size: "250ml", stock: 20, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "প্রিমিয়াম বাছাইকৃত অর্গানিক কালোজিরা (Organic Whole Black Seed)",
    price: 280,
    originalPrice: 380,
    discount: 26,
    stock: 65,
    image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=500&h=500&fit=crop",
    category: "কালোজিরা ও কোল্ড প্রেসড অয়েল",
    description: "ধুলাবালি ও ময়লামুক্ত সম্পূর্ণ প্রাকৃতিক দেশি কালোজিরা। রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি ও সার্বিক সুস্থতায় অত্যন্ত কার্যকরী।",
    variants: [
      { id: "v1", name: "২৫০ গ্রাম", size: "250g", stock: 35, image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=500&h=500&fit=crop" },
      { id: "v2", name: "৫০০ গ্রাম", size: "500g", stock: 30, image: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "রাজশাহীর খাঁটি মিষ্টি হিমসাগর আম (Fresh Himsagar Mango)",
    price: 1250,
    originalPrice: 1500,
    discount: 17,
    stock: 40,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=500&fit=crop",
    category: "খাঁটি আম, আমসত্ত্ব ও আচার",
    isTrending: true,
    description: "বাগান থেকে সরাসরি গাছপাকা মিষ্টি হিমসাগর আম। কোনো কার্বাইড, ফরমালিন বা ক্ষতিকর কেমিক্যাল মুক্ত সম্পূর্ণ নিরাপদ ও সুস্বাদু।",
    variants: [
      { id: "v1", name: "১০ কেজি ক্যারেট", size: "10kg", stock: 25, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=500&fit=crop" },
      { id: "v2", name: "২০ কেজি ক্যারেট", size: "20kg", stock: 15, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "চাঁপাইনবাবগঞ্জের খাঁটি হাতে তৈরি আমসত্ত্ব (Pure Chapai Amsotto)",
    price: 450,
    originalPrice: 600,
    discount: 25,
    stock: 55,
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&h=500&fit=crop",
    category: "খাঁটি আম, আমসত্ত্ব ও আচার",
    isTrending: true,
    description: "চাঁপাইনবাবগঞ্জের ঐতিহ্যবাহী মিষ্টি পাকা আমের খাঁটি রস রোদে শুকিয়ে তৈরি স্বাস্থ্যকর ও সুস্বাদু আমসত্ত্ব।",
    variants: [
      { id: "v1", name: "২৫০ গ্রাম", size: "250g", stock: 30, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&h=500&fit=crop" },
      { id: "v2", name: "৫০০ গ্রাম", size: "500g", stock: 25, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "ঘানিভাঙা সরিষার তেলে তৈরি কাঁচা আমের আচার (Homemade Mango Pickle)",
    price: 320,
    originalPrice: 420,
    discount: 24,
    stock: 60,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&h=500&fit=crop",
    category: "খাঁটি আম, আমসত্ত্ব ও আচার",
    description: "কাঠের ঘানিভাঙা সরিষার তেল ও খাঁটি মসলায় তৈরি ঘরোয়া স্বাদের সুস্বাদু টক-ঝাল-মিষ্টি কাঁচা আমের আচার।",
    variants: [
      { id: "v1", name: "৪০০ গ্রাম জার", size: "400g", stock: 35, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&h=500&fit=crop" },
      { id: "v2", name: "৮০০ গ্রাম জার", size: "800g", stock: 25, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল (Wood Pressed Mustard Oil)",
    price: 360,
    originalPrice: 450,
    discount: 20,
    stock: 80,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop",
    category: "গাওয়া ঘি ও সরিষার তেল",
    isTrending: true,
    description: "ঐতিহ্যবাহী কাঠের ঘানিতে ভাঙানো ১০০% খাঁটি দেশি সরিষার তেল। ঝাঁঝালো স্বাদ ও প্রাকৃতিক পুষ্টিগুণে ভরপুর।",
    variants: [
      { id: "v1", name: "১ লিটার", size: "1L", stock: 50, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop" },
      { id: "v2", name: "৫ লিটার (ফ্যামিলি প্যাক)", size: "5L", stock: 30, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "প্রিমিয়াম খাঁটি গাওয়া ঘি (Pure Homemade Cow Ghee)",
    price: 1450,
    originalPrice: 1800,
    discount: 19,
    stock: 45,
    image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&h=500&fit=crop",
    category: "গাওয়া ঘি ও সরিষার তেল",
    isTrending: true,
    description: "খাঁটি দেশি গরুর দুধের মাখন থেকে তৈরি সুবাসিত ও দানাদার খাঁটি গাওয়া ঘি। অতুলনীয় স্বাদ ও স্বাস্থ্যের জন্য উপাদেয়।",
    variants: [
      { id: "v1", name: "৫০০ গ্রাম", size: "500g", stock: 25, image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&h=500&fit=crop" },
      { id: "v2", name: "১ কেজি", size: "1kg", stock: 20, image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&h=500&fit=crop" },
    ],
  },
  {
    name: "প্রিমিয়াম মদিনার মরিয়ম খেজুর (Royal Maryam Dates)",
    price: 850,
    originalPrice: 1100,
    discount: 23,
    stock: 50,
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&h=500&fit=crop",
    category: "খেজুর ও প্রিমিয়াম ড্রাই ফ্রুটস",
    isTrending: true,
    description: "মদিনা মনোয়ারা থেকে আমদানিকৃত সেরা গ্রেডের নরম ও সুস্বাদু মরিয়ম খেজুর। প্রাকৃতিক শক্তি ও পুষ্টির আধার।",
  },
  {
    name: "অর্গানিক চিয়া সিড (Premium Organic Chia Seeds)",
    price: 450,
    originalPrice: 650,
    discount: 31,
    stock: 75,
    image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500&h=500&fit=crop",
    category: "অর্গানিক বীজ ও সুপারফুড",
    description: "আমদানিকৃত প্রিমিয়াম গ্রেড অর্গানিক চিয়া সিড। ওমেগা-৩ ফ্যাটি এসিড, ফাইবার ও অ্যান্টিঅক্সিডেন্টে ভরপুর সুপারফুড।",
  },
  {
    name: "অর্গানিক গ্রিন টি ও তুলসী হারবাল চা (Organic Herbal Tea)",
    price: 350,
    originalPrice: 500,
    discount: 30,
    stock: 70,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&h=500&fit=crop",
    category: "খাঁটি মসলা ও ভেষজ চা",
    description: "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ সতেজ গ্রিন টি ও তুলসী পাতার স্বাস্থ্যকর ব্লেন্ড। রোগ প্রতিরোধ ক্ষমতা বাড়াতে সাহায্য করে।",
  },
];

const DEFAULT_BANNERS = [
  {
    title: "১০০% প্রাকৃতিক সুন্দরবনের খাঁটি মধু ও হানি নাট",
    subtitle: "প্রাকৃতিক চাক থেকে সরাসরি সংগৃহীত অপরিশোধিত খাঁটি মধু ও প্রিমিয়াম এনার্জি প্যাক",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&h=600&fit=crop",
    type: "hero",
    order: 0,
  },
  {
    title: "কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল ও সুবাসিত দানাদার গাওয়া ঘি",
    subtitle: "আসল ঘ্রাণ ও খাঁটি গ্রামীণ স্বাদ আপনার পরিবারের সুস্বাস্থ্যে শতভাগ নিরাপদ",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&h=600&fit=crop",
    type: "hero",
    order: 1,
  },
  {
    title: "মদিনার খাঁটি মরিয়ম খেজুর, অর্গানিক চিয়া সিড ও কোল্ড প্রেসড কালোজিরা তেল",
    subtitle: "প্রাকৃতিক পুষ্টিগুণে ভরপুর সেরা অর্গানিক খাদ্যপণ্য — ক্যাশ অন ডেলিভারি সুবিধা",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1600&h=600&fit=crop",
    type: "hero",
    order: 2,
  },
  {
    title: "স্পেশাল অর্গানিক মধু অফার",
    subtitle: "খাঁটি মধু ও বাদামের পুষ্টিকর কম্বো",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=400&fit=crop",
    type: "right_top",
    order: 3,
  },
  {
    title: "দানাদার গাওয়া ঘি ও সরিষার তেল",
    subtitle: "সীমিত সময়ের বিশেষ ফ্ল্যাশ সেল",
    image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&h=400&fit=crop",
    type: "right_bottom",
    order: 4,
  },
  {
    title: "১০০% বিশুদ্ধ ও প্রাকৃতিক খাদ্যপণ্যের নির্ভরযোগ্য প্রতিষ্ঠান",
    subtitle: "সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও শতভাগ ক্যাশ অন ডেলিভারি",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1600&h=450&fit=crop",
    type: "secondary",
    order: 5,
  }
];

const DEFAULT_CONFIG = {
  couponCode: "ROKOMARI5",
  isCouponPublic: false,
  whatsappNumber: "8801738364268",
  bkashNumber: "01738364268",
  nagadNumber: "01738364268",
  rocketNumber: "01738364268-0",
  bankDetails: "Bank: DBBL, A/C: 123456789",
  isCodEnabled: true,
  isBkashEnabled: true,
  isNagadEnabled: true,
  isRocketEnabled: true,
  isBankEnabled: true,
  aboutUs: "রকমারি পণ্য হাড়ি (Rokomari Ponno Hari) - আপনার বিশ্বস্ত অনলাইন প্ল্যাটফর্ম। আমরা সুলভ মূল্যে সর্বোচ্চ মানের খাঁটি মধু, ঘানি ভাঙা তেল, গাওয়া ঘি ও অর্গানিক খাদ্যপণ্য নিশ্চিত করি।",
  privacyPolicy: "আপনার ব্যক্তিগত গোপনীয়তাকে আমরা সম্মান করি। আমাদের ওয়েবসাইটে দেওয়া আপনার সকল তথ্য (যেমন: নাম, ফোন নাম্বার, ঠিকানা) সম্পূর্ণ নিরাপদ।",
  refundPolicy: "পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে ২৪ ঘন্টার মধ্যে আমাদের সাথে যোগাযোগ করুন। সঠিক প্রমাণ সাপেক্ষে আমরা দ্রুত রিফান্ড বা এক্সচেঞ্জ করে থাকি।",
  termsAndConditions: "আমাদের ওয়েবসাইট ব্যবহার করার জন্য আপনাকে ধন্যবাদ। অর্ডার করার মাধ্যমে আমাদের ডেলিভারি ও পেমেন্ট শর্তাবলীর সাথে একমত পোষণ করেছেন।",
  checkoutWarningText: "প্রিয় গ্রাহক, ক্যাশ অন ডেলিভারিতে অর্ডার করার আগে দয়া করে নিশ্চিত হোন যে প্রোডাক্টটি আপনার প্রয়োজন এবং আপনি তা রিসিভ করবেন। অনাকাঙ্ক্ষিত রিটার্ন এড়াতে আপনার সহযোগিতা আমাদের একান্ত কাম্য।",
  supportPhone1: "01738-364268",
  supportPhone2: "",
  facebookUrl: "https://facebook.com/rokomariponnohari",
  isAiEnabled: false,
  smsTemplateStart: "প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে।",
  smsTemplateEnd: "রকমারি পণ্য হাড়ি ব্যবহার করার জন্য ধন্যবাদ।",
  isSmsConfirmEnabled: true,
  computerAppUrl: "",
  androidAppUrl: "",
  iphoneAppUrl: "",
  promoPopupEnabled: false,
};

async function seedDatabase() {
  console.log("🌱 নতুন ফায়ারবেজ ডাটাবেজ সিডিং শুরু হচ্ছে...");

  // 1. Site Config
  await db.doc("config/site").set(DEFAULT_CONFIG, { merge: true });
  console.log("✅ Site Configuration তৈরি হয়েছে (config/site)");

  // 2. Categories
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await db.collection("categories").where("name", "==", cat.name).get();
    if (existing.empty) {
      await db.collection("categories").add(cat);
      console.log(`✅ ক্যাটাগরি তৈরি হয়েছে: ${cat.name}`);
    }
  }

  // 3. Products
  for (const prod of DEFAULT_PRODUCTS) {
    const existing = await db.collection("products").where("name", "==", prod.name).get();
    if (existing.empty) {
      await db.collection("products").add({
        ...prod,
        createdAt: new Date().toISOString(),
        deleted: false
      });
      console.log(`✅ পণ্য তৈরি হয়েছে: ${prod.name}`);
    }
  }

  // 4. Banners
  for (const banner of DEFAULT_BANNERS) {
    const existing = await db.collection("banners").where("title", "==", banner.title).get();
    if (existing.empty) {
      await db.collection("banners").add(banner);
      console.log(`✅ ব্যানার তৈরি হয়েছে: ${banner.title}`);
    }
  }

  // 5. Admins
  const adminEmail = "rokomariponnohari@gmail.com";
  const existingAdmin = await db.collection("admins").where("email", "==", adminEmail).get();
  if (existingAdmin.empty) {
    await db.collection("admins").add({
      email: adminEmail,
      password: "rokomari@1122",
      name: "রকমারি এডমিন",
      role: "admin",
      phone: "01777600844",
      createdAt: new Date().toISOString(),
      require2FA: false,
      permissions: ["orders", "products", "customers", "marketing", "settings", "reports"]
    });
    console.log(`✅ ২য় এডমিন তৈরি হয়েছে: ${adminEmail}`);
  }

  console.log("🎉 নতুন ডাটাবেজ সিডিং সম্পূর্ণ সফল হয়েছে!");
}

seedDatabase().catch(err => {
  console.error("❌ সিডিং ব্যর্থ হয়েছে:", err);
  process.exit(1);
});
