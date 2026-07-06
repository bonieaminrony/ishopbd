import { Product, Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Charger Fan" },
  { id: "2", name: "Smart Watch" },
  { id: "3", name: "Headphone" },
  { id: "4", name: "Power Bank" },
  { id: "5", name: "Mobile Accessories" },
  { id: "6", name: "T-Shirt" },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "মিনি রিচার্জেবল চার্জার ফ্যান (Portable)",
    price: 1250,
    originalPrice: 1800,
    discount: 30,
    image: "https://images.unsplash.com/photo-1619230558487-6e06dd8b6b23?w=400&h=400&fit=crop",
    category: "Charger Fan",
    isTrending: true,
    colors: ["White", "Pink", "Blue"],
  },
  {
    id: "p7",
    name: "হাই স্পিড রিচার্জেবল বড় চার্জার ফ্যান",
    price: 3500,
    originalPrice: 4800,
    discount: 27,
    image: "https://images.unsplash.com/photo-1618176580512-ff59560f9947?w=400&h=400&fit=crop",
    category: "Charger Fan",
    isTrending: true,
    colors: ["White", "Black"],
  },
  {
    id: "p8",
    name: "মিনি পকেট ফ্যান (বিকাশ স্পেশাল)",
    price: 350,
    originalPrice: 600,
    discount: 42,
    image: "https://images.unsplash.com/photo-1620330058230-f655ae832da2?w=400&h=400&fit=crop",
    category: "Charger Fan",
    isTrending: true,
    colors: ["Yellow", "Green", "Sky Blue"],
  },
  {
    id: "p2",
    name: "প্রিমিয়াম ব্লুটুথ হেডফোন (Heavy Bass)",
    price: 2400,
    originalPrice: 3200,
    discount: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Headphone",
    colors: ["Black", "Silver", "Red"],
  },
  {
    id: "p3",
    name: "স্মার্ট ওয়াচ সিরিজ ৯ (Ultra Display)",
    price: 3200,
    originalPrice: 4500,
    discount: 29,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Smart Watch",
    colors: ["Orange", "Black", "Blue"],
  },
  {
    id: "p4",
    name: "২০,০০০ mAh ফাস্ট চার্জিং পাওয়ার ব্যাংক",
    price: 1850,
    originalPrice: 2400,
    discount: 23,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop",
    category: "Power Bank",
    colors: ["White", "Black"],
  },
  {
    id: "p5",
    name: "সুপার ফাস্ট চার্জিং ক্যাবল (Type-C)",
    price: 450,
    originalPrice: 600,
    discount: 25,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop",
    category: "Mobile Accessories",
    colors: ["Red", "Black", "White"],
  },
  {
    id: "p6",
    name: "ওয়্যারলেস নেক ব্যান্ড ইয়ারফোন",
    price: 950,
    originalPrice: 1500,
    discount: 36,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    category: "Headphone",
    colors: ["Blue", "Black"],
  },
  {
    id: "p9",
    name: "প্রিমিয়াম কটন টি-শার্ট (Premium Quality)",
    price: 450,
    originalPrice: 750,
    discount: 40,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=400&fit=crop",
    category: "T-Shirt",
    variants: [
      { id: "v1", name: "Black", size: "M", stock: 10, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop" },
      { id: "v2", name: "Black", size: "L", stock: 15, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop" },
      { id: "v3", name: "Black", size: "XL", stock: 5, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop" },
      { id: "v4", name: "White", size: "M", stock: 12, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=400&fit=crop" },
      { id: "v5", name: "White", size: "L", stock: 8, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&h=400&fit=crop" },
    ],
  },
];

export const DEFAULT_BANNERS = [
  {
    id: 1,
    title: "সেরা মানের পণ্য, আমাদের অঙ্গীকার",
    subtitle: "১০০% অরিজিনাল গ্যারান্টি",
    image: "https://images.unsplash.com/photo-1441984907796-39575fe82c71?w=1600&h=900&fit=crop",
  },
];

export const BENGALI_FONTS = [
  { name: "Default (Hind Siliguri)", value: "font-sans" },
  { name: "Lalsalu (Anek Bangla)", value: "font-lalsalu" },
  { name: "Ador (Mina)", value: "font-ador" },
  { name: "Galada (Stylized)", value: "font-galada" },
  { name: "Atma (Playful)", value: "font-atma" },
  { name: "Tiro Bangla (Serif)", value: "font-tiro" },
  { name: "Noto Sans (Clean)", value: "font-noto" },
  { name: "Baloo Da 2 (Rounded)", value: "font-baloo" },
  { name: "Sulaiman Lipi", value: "font-sulaiman" },
];

export const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export const MASTER_EMAILS = [
  "bonieaminrony@gmail.com",
  "islamicsoktitv@gmail.com",
  "ishopbd.online@gmail.com",
  "ifilmbd2025@gmail.com",
];
