import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

const dummyProducts = [
  {
    name: "M10 TWS Wireless Earbuds",
    brand: "Generic",
    price: 350,
    originalPrice: 800,
    discount: 56,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop",
    category: "gadgets",
    isTrending: true,
    description: "High-quality M10 TWS Wireless Earbuds with digital display and power bank function.",
    rating: 4.8,
    reviewCount: 156,
    likes: 89,
    stock: 50,
    code: "M10-TWS",
  },
  {
    name: "T800 Ultra Smart Watch",
    brand: "Generic",
    price: 850,
    originalPrice: 1500,
    discount: 43,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop",
    category: "electronics",
    isTrending: true,
    description: "T800 Ultra Smart Watch Series 8 Bluetooth Call Wireless Charging 1.99 inch HD Screen.",
    rating: 4.5,
    reviewCount: 124,
    likes: 76,
    stock: 30,
    code: "T800-ULTRA",
  },
  {
    name: "K8 Wireless Microphone",
    brand: "Generic",
    price: 450,
    originalPrice: 900,
    discount: 50,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop",
    category: "gadgets",
    isTrending: false,
    description: "K8 Wireless Microphone Type-C for Android phones. Plug and play, no app needed.",
    rating: 4.2,
    reviewCount: 45,
    likes: 22,
    stock: 100,
    code: "K8-MIC",
  },
  {
    name: "Premium Black Seed Honey (কালিজিরা মধু)",
    brand: "Ghorer Bazar",
    price: 650,
    originalPrice: 850,
    discount: 23,
    image: "https://images.unsplash.com/photo-1587049352847-4d4b121bc563?q=80&w=600&auto=format&fit=crop",
    category: "food",
    isTrending: true,
    description: "100% pure and organic black seed honey collected from Faridpur.",
    rating: 5.0,
    reviewCount: 340,
    likes: 210,
    stock: 80,
    code: "BSH-500",
    weight: 0.5
  }
];

async function seed() {
  console.log("Seeding products...");
  const productsRef = collection(db, 'products');
  for (const product of dummyProducts) {
    try {
      await addDoc(productsRef, {
        ...product,
        deleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added: ${product.name}`);
    } catch (e) {
      console.error(`Error adding ${product.name}: `, e);
    }
  }
  console.log("Done! You can close this script now.");
  process.exit(0);
}

seed();
