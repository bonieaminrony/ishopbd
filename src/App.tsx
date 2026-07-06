/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import ShopList from './components/ShopList';
import ProductDetails from './components/ProductDetails';
import FilterMenuModal from './components/FilterMenuModal';
import InlineDistrictModal from './components/InlineDistrictModal';
import LandingDistrictModal from './components/LandingDistrictModal';
import LangModal from './components/LangModal';
import DeliveryInfoModal from './components/DeliveryInfoModal';
import NotifModal from './components/NotifModal';
import AuthModal from './components/AuthModal';
import DepositModal from './components/DepositModal';
import MultiOrderSelectionModal from './components/MultiOrderSelectionModal';
import ChatModal from './components/ChatModal';
import CourierHistoryModal from './components/CourierHistoryModal';
import TrackingModal from './components/TrackingModal';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import axios from 'axios';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  MouseEvent,
  FormEvent,
  ChangeEvent,
} from "react";
import { Helmet } from 'react-helmet-async';
import { Moon, Sun, PackageOpen } from "lucide-react";
import {Edit3,
  Printer,
  Receipt,
  
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Phone,
  Facebook,
  CreditCard,
  Heart,
  TrendingUp,
  Award,
  Plus,
  Minus,
  Eye,
  LayoutGrid,
  Truck,
  ShieldCheck,
  LayoutDashboard,
  Zap,
  ShoppingBag,
  X,
  Send,
  Mic,
  Image as ImageIcon,
  Square,
  Paperclip,
  Camera,
  StopCircle,
  Headset,
  Wallet,
  LogOut,
  History,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  CheckCircle2,
  Check,
  AlertCircle,
  AlertTriangle,
  Gift,
  PlusCircle,
  Landmark,
  Trash2,
  Users,
  MapPin,
  Navigation,
  Database,
  Key,
  Edit,
  Upload,
  Star,
  Share2,
  XCircle,
  Clock,
  Calendar,
  CheckCircle,
  MessageSquare,
  Languages,
  CircleDot,
  Copy,
  Bell,
  Info,
  ThumbsUp,
  Home,
  MessageCircle,
  Edit2,
  Tag,
  Layout,
  Package,
  Save,
  Download,
  Loader2,
  LayoutTemplate,
  Ban,
  UserCheck,
  List,
  Box,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import imageCompression from "browser-image-compression";
import { toPng } from 'html-to-image';
import { Product, Category, AdminUser, Review, Campaign, Expense } from "./types.ts";
import ProfitAnalysis from "./components/ProfitAnalysis";
import { ImageCarousel } from "./components/ui/ImageCarousel";
// GoogleGenAI removed - server-side only SDK, use /api/chat endpoint instead
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  increment,
  orderBy,
  runTransaction,
  handleFirestoreError,
  OperationType,
  arrayUnion,
  arrayRemove,
  limit,
  DocumentReference,
  requestPushPermission,
} from "./lib/firebase";
// Mock Data in Bengali - Gadget Focused (Moved to state for dynamic loading)
const districtThanaMap: Record<string, string[]> = {
  "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
  "Bandarban": ["Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"],
  "Barguna": ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"],
  "Barishal": ["Agailjhara", "Airport", "Babuganj", "Bakerganj", "Banaripara", "Bandar", "Barishal Sadar", "Gournadi", "Hizla", "Kaunia", "Kotwali", "Mehendiganj", "Muladi", "Wazirpur"],
  "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
  "Bogura": ["Adamdighi", "Bogura Sadar", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"],
  "Brahmanbaria": ["Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"],
  "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab Dakkhin", "Matlab Uttar", "Shahrasti"],
  "Chapainawabganj": ["Bholahat", "Chapainawabganj Sadar", "Gomastapur", "Nachole", "Shibganj"],
  "Chattogram": ["Akbarshah", "Anwara", "Bakalia", "Bandar", "Banshkhali", "Bayazid Bostami", "Boalkhali", "Chandanaish", "Chandgaon", "Chawkbazar", "Double Mooring", "EPZ", "Fatikchhari", "Halishahar", "Hathazari", "Karnaphuli", "Khulshi", "Kotwali", "Lohagara", "Mirsharai", "Pahartali", "Panchlaish", "Patenga", "Patiya", "Rangunia", "Raozan", "Sadarghat", "Sandwip", "Satkania", "Sitakunda"],
  "Chuadanga": ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
  "Cox's Bazar": ["Chakaria", "Cox's Bazar Sadar", "Eidgaon", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhiya"],
  "Cumilla": ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Cumilla Adarsha Sadar", "Cumilla Sadar South", "Daudkandi", "Debidwar", "Homna", "Laksam", "Lalmai", "Meghna", "Monohargonj", "Muradnagar", "Nangalkot", "Titas"],
  "Dhaka": ["Adabor", "Badda", "Banani", "Bangshal", "Bhashantek", "Bhatara", "Cantonment", "Chawkbazar", "Dakshinkhan", "Darus Salam", "Demra", "Dhamrai", "Dhanmondi", "Dohar", "Gendaria", "Gulshan", "Hatirjheel", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Kalabagan", "Kamrangirchar", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Mirpur", "Mohammadpur", "Motijheel", "Nawabganj", "New Market", "Pallabi", "Paltan", "Ramna", "Rampura", "Rupnagar", "Sabujbagh", "Savar", "Shah Ali", "Shahbag", "Sher-e-Bangla Nagar", "Shyampur", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Vatara", "Wari"],
  "Dinajpur": ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Dinajpur Sadar", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur", "Phulbari"],
  "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
  "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
  "Gaibandha": ["Gaibandha Sadar", "Gobindaganj", "Palashbari", "Phulchhari", "Sadullapur", "Saghata", "Sundarganj"],
  "Gazipur": ["Bason", "Gacha", "Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Kashimpur", "Konabari", "Pubail", "Sreepur", "Tongi"],
  "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
  "Habiganj": ["Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj", "Shaistagonj"],
  "Jamalpur": ["Baksiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
  "Jashore": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jashore Sadar", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
  "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"],
  "Jhenaidah": ["Harinakundu", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
  "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
  "Khagrachhari": ["Dighinala", "Guimara", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
  "Khulna": ["Aranghata", "Batiaghata", "Dacope", "Daulatpur", "Dighalia", "Dumuria", "Harintana", "Khalishpur", "Khan Jahan Ali", "Khulna Sadar", "Koyra", "Labanchara", "Paikgachha", "Phultala", "Rupsha", "Sonadanga", "Terokhada"],
  "Kishoreganj": ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
  "Kurigram": ["Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar", "Nageshwari", "Phulbari", "Rajarhat", "Rowmari", "Ulipur"],
  "Kushtia": ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"],
  "Lakshmipur": ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati"],
  "Lalmonirhat": ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"],
  "Madaripur": ["Dasar", "Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
  "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
  "Manikganj": ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shibalaya", "Singair"],
  "Meherpur": ["Gangni", "Meherpur Sadar", "Mujibnagar"],
  "Moulvibazar": ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
  "Munshiganj": ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"],
  "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gouripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Mymensingh Sadar", "Nandail", "Pagla", "Phulpur", "Tarakanda", "Trishal"],
  "Naogaon": ["Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
  "Narail": ["Kalia", "Lohagara", "Narail Sadar"],
  "Narayanganj": ["Araihazar", "Bandar", "Fatullah", "Narayanganj Sadar", "Rupganj", "Siddhirganj", "Sonargaon"],
  "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
  "Natore": ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Natore Sadar", "Singra"],
  "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"],
  "Nilphamari": ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
  "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Hatia", "Kabirhat", "Noakhali Sadar", "Senbug", "Sonaimuri", "Subarnachar"],
  "Pabna": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
  "Panchagarh": ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"],
  "Patuakhali": ["Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali"],
  "Pirojpur": ["Bhandaria", "Kaukhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Zianagar"],
  "Rajbari": ["Baliakandi", "Goalanda", "Kalukhali", "Pangsha", "Rajbari Sadar"],
  "Rajshahi": ["Airport", "Bagha", "Bagmara", "Belpukur", "Boalia", "Chandrima", "Charghat", "Damkura", "Durgapur", "Godagari", "Karnahar", "Kashiadanga", "Katakhali", "Mohanpur", "Motihar", "Paba", "Puthia", "Rajpara", "Rajshahi Sadar", "Shah Makhdum", "Tanore"],
  "Rangamati": ["Bagaichhari", "Barkal", "Belaichhari", "Juraichhari", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar"],
  "Rangpur": ["Badarganj", "Gangachara", "Haragach", "Hazirhat", "Kaunia", "Kotwali", "Mahiganj", "Mithapukur", "Parshuram", "Pirgachha", "Pirganj", "Rangpur Sadar", "Tajhat", "Taraganj"],
  "Satkhira": ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"],
  "Shariatpur": ["Bhedarganj", "Damudya", "Gosairhat", "Jajira", "Naria", "Shariatpur Sadar"],
  "Sherpur": ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"],
  "Sirajganj": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullapara"],
  "Sunamganj": ["Bishwambarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Madhyanagar", "Shalla", "Shanthiganj", "Sunamganj Sadar", "Tahirpur"],
  "Sylhet": ["Airport", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Jalalabad", "Kanaighat", "Kotwali", "Moglabazar", "Osmaninagar", "Shah Paran", "Sylhet Sadar", "Zakiganj"],
  "Tangail": ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"],
  "Thakurgaon": ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
};
const ALL_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj",
  "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur",
  "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali",
  "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati",
  "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
  "Tangail", "Thakurgaon"
];
const default_categories: Category[] = [
  { id: "1", name: "Charger Fan" },
  { id: "2", name: "Smart Watch" },
  { id: "3", name: "Headphone" },
  { id: "4", name: "Power Bank" },
  { id: "5", name: "Mobile Accessories" },
  { id: "6", name: "T-Shirt" },
];
const default_products: Product[] = [
  {
    id: "p1",
    name: "মিনি রিচার্জেবল চার্জার ফ্যান (Portable)",
    price: 1250,
    originalPrice: 1800,
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1619230558487-6e06dd8b6b23?w=400&h=400&fit=crop",
    category: "Charger Fan",
    isTrending: true,
    colors: ["White", "Pink", "Blue"],
  },
  {
    id: "p7",
    name: "হাই স্পিড রিচার্জেবল বড় চার্জার ফ্যান",
    price: 3500,
    originalPrice: 4800,
    discount: 27,
    image:
      "https://images.unsplash.com/photo-1618176580512-ff59560f9947?w=400&h=400&fit=crop",
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
    image:
      "https://images.unsplash.com/photo-1620330058230-f655ae832da2?w=400&h=400&fit=crop",
    category: "Charger Fan",
    isTrending: true,
    colors: ["Yellow", "Green", "Sky Blue"],
  },
  {
    id: "p2",
    name: "প্রিমিয়াম ব্লুটুথ হেডফোন (Heavy Bass)",
    price: 2400,
    originalPrice: 3200,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Headphone",
    colors: ["Black", "Silver", "Red"],
  },
  {
    id: "p3",
    name: "স্মার্ট ওয়াচ সিরিজ ৯ (Ultra Display)",
    price: 3200,
    originalPrice: 4500,
    discount: 29,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "Smart Watch",
    colors: ["Orange", "Black", "Blue"],
  },
  {
    id: "p4",
    name: "২০,০০০ mAh ফাস্ট চার্জিং পাওয়ার ব্যাংক",
    price: 1850,
    originalPrice: 2400,
    discount: 23,
    image:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop",
    category: "Power Bank",
    colors: ["White", "Black"],
  },
  {
    id: "p5",
    name: "সুপার ফাস্ট চার্জিং ক্যাবল (Type-C)",
    price: 450,
    originalPrice: 600,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=400&fit=crop",
    category: "Mobile Accessories",
    colors: ["Red", "Black", "White"],
  },
  {
    id: "p6",
    name: "ওয়্যারলেস নেক ব্যান্ড ইয়ারফোন",
    price: 950,
    originalPrice: 1500,
    discount: 36,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
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
    ]
  },
];
const banners = [
  {
    id: 1,
    title: "সেরা মানের পণ্য, আমাদের অঙ্গীকার",
    subtitle: "১০০% অরিজিনাল গ্যারান্টি",
    image: "https://images.unsplash.com/photo-1441984907796-39575fe82c71?w=1600&h=900&fit=crop",
  },
];
const BENGALI_FONTS = [
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
const ProductSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col h-full animate-pulse">
    <div className="relative aspect-square bg-gray-200 dark:bg-slate-700" />
    <div className="p-3 flex flex-col flex-1 gap-2">
      <div className="w-1/3 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
      <div className="w-full h-5 bg-gray-200 dark:bg-slate-700 rounded mt-1" />
      <div className="w-2/3 h-5 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="mt-auto flex items-end justify-between">
        <div className="w-1/2 h-6 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="w-full h-10 bg-gray-200 dark:bg-slate-700 rounded-lg mt-2" />
    </div>
  </div>
);
const ProductCard = React.memo(({ 
  product, 
  openProductDetails, 
  t, 
  handleBuyNow,
  handleLikeProduct,
  isLiked
}: { 
  product: Product; 
  openProductDetails: (p: Product) => void; 
  t: any;
  handleBuyNow: (p: Product) => void;
  handleLikeProduct: (productId: string) => void;
  isLiked: boolean;
}) => {
  const isOutOfStock =
    !product.isComingSoon &&
    (product.variants && product.variants.length > 0
      ? product.variants.every((v) => (v.stock || 0) <= 0)
      : (product.stock || 0) <= 0);



  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      <a
        href={`?product=${product.id}`}
        className="relative aspect-square overflow-hidden cursor-pointer flex items-center justify-center bg-cream block"
        onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges - Even larger for visibility */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <div className="bg-primary text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md">
              -{product.discount}%
            </div>
          )}
          {product.isFreeDelivery && (
            <div className="bg-emerald-600 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap shadow-md flex items-center gap-1 border border-emerald-500/10">
              <Truck size={11} /> ফ্রি ডেলিভারি
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLikeProduct(product.id);
          }}
          className={`absolute top-1.5 right-1.5 px-2 py-1 bg-white hover:bg-gray-50 text-[10px] font-bold rounded-full transition-all shadow-md transform hover:scale-105 flex items-center gap-1 z-10 ${
            isLiked ? "text-primary" : "text-gray-400 hover:text-primary"
          }`}
        >
          <Heart size={11} fill={isLiked ? "#ec2029" : "none"} className={isLiked ? "text-primary" : ""} />
          {product.likes !== undefined && product.likes >= 0 && (
            <span className="text-[10px] text-gray-700 font-bold ml-0.5">{product.likes || 0}</span>
          )}
        </button>
      </a>
      <div className="p-2 md:p-3 flex flex-col flex-1">
        {(product.brand || product.code) && (
          <span className="text-[8px] md:text-[10px] font-bold text-gray-400 mb-1 px-0.5 uppercase tracking-wide">
            {product.brand || product.code}
          </span>
        )}
        <a 
          href={`?product=${product.id}`}
          onClick={(e) => { e.preventDefault(); openProductDetails(product); }}
          className="block"
        >
          <h4 className="text-base md:text-lg font-bold text-gray-800 line-clamp-2 mb-1.5 px-0.5 min-h-[44px] group-hover:text-primary transition-colors cursor-pointer leading-tight">
            {product.name}
          </h4>
        </a>
        <div className="mt-auto px-0.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-red-600 font-bold text-xl md:text-2xl tracking-tight">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] md:text-[12px] text-gray-400 line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>
          
          <div className="relative">
            <motion.button
              disabled={isOutOfStock}
              whileTap={isOutOfStock ? {} : { scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                openProductDetails(product);
              }}
              className="w-full relative overflow-hidden bg-gradient-to-br from-primary to-red-600 text-white text-sm md:text-base font-bold py-2 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group/btn active:scale-95 flex items-center justify-center gap-2"
            >
              {isOutOfStock ? t("স্টক আউট", "Stock Out") : t("অর্ডার দিন", "Order Now")}
              {!isOutOfStock && <ArrowRight size={14} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
const ZoomableImage = ({
  src,
  alt,
  keyId,
}: {
  src: string;
  alt: string;
  keyId?: string;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current || window.innerWidth <= 768) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    containerRef.current.style.setProperty("--zoom-x", `${x}%`);
    containerRef.current.style.setProperty("--zoom-y", `${y}%`);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    // Don't prevent default to allow scrolling if user wants to scroll page
    // but typically we wait for touchmove to pan the image origin
    const touch = e.touches[0];
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - left) / width) * 100;
    const y = ((touch.clientY - top) / height) * 100;
    
    // Clamp values between 0 and 100 to keep zoom within image bounds
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    containerRef.current.style.setProperty("--zoom-x", `${clampedX}%`);
    containerRef.current.style.setProperty("--zoom-y", `${clampedY}%`);
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (!isZoomed) {
      containerRef.current?.style.setProperty("--zoom-x", `${x}%`);
      containerRef.current?.style.setProperty("--zoom-y", `${y}%`);
    }
    
    setIsZoomed(!isZoomed);
  };
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden transition-all duration-300 ${isZoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
      style={{ "--zoom-x": "50%", "--zoom-y": "50%" } as any}
    >
      <motion.img
        key={keyId}
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: isZoomed ? 2.5 : 1,
        }}
        drag={false}
        style={{ transformOrigin: "var(--zoom-x) var(--zoom-y)" }}
        className="w-full h-full object-cover pointer-events-auto"
      />
      {isZoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white text-[10px] px-4 py-1.5 rounded-full pointer-events-none md:hidden animate-bounce">
          জুম করা আছে - টেনে দেখুন
        </div>
      )}
      
    </div>
  );
};
import toast, { Toaster } from "react-hot-toast";
import { getOrderLocalDateString, formatOrderGroupDate, toBengaliNumber, getYouTubeEmbedUrl, cleanLatex, sumValues } from './utils/helpers';
import { FlashSaleCountdown } from './components/FlashSaleCountdown';
import { useUIContext } from './context/UIContext';
import { useAuthContext } from './context/AuthContext';
import { useCartContext } from "./context/CartContext";
import { useProductContext } from "./context/ProductContext";

// Notification sound URL
const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const notifyAdminsOnNewOrder = async (orderId: string, total: number) => {
  try {
    const q = query(collection(db, "users"), where("isAdmin", "==", true));
    const querySnapshot = await getDocs(q);
    const adminTokens: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fcmToken) adminTokens.push(data.fcmToken);
    });
    
    adminTokens.forEach(token => {
      fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          title: "নতুন অর্ডার এসেএসেছে!",
          body: `অর্ডার #${String(orderId).slice(-6).toUpperCase()} - ৳${total}`,
          link: "/admin"
        })
      }).catch(() => {});
    });
  } catch (err) {
    console.warn("Failed to notify admins:", err);
  }
};
function App() {














  const urlParams = new URLSearchParams(window.location.search);
  const { isQuotaExceeded, setIsQuotaExceeded, adminReplyingTo, setAdminReplyingTo, chatReplyingTo, setChatReplyingTo, isProfileOpen, setIsProfileOpen, profileTab, setProfileTab, activePolicy, setActivePolicy } = useUIContext();
    const { showToast, setShowToast, cartItems, setCartItems, cartCount, checkoutItems, setCheckoutItems, isCheckoutOpen, setIsCheckoutOpen, checkoutName, setCheckoutName, checkoutPhone, setCheckoutPhone, checkoutPhoneFocused, setCheckoutPhoneFocused, checkoutDistrict, setCheckoutDistrict, checkoutAddress, setCheckoutAddress, checkoutNote, setCheckoutNote, paymentMethod, setPaymentMethod, availableRewardPoints, setAvailableRewardPoints, isApplyingRewardPoints, setIsApplyingRewardPoints, checkoutDistrictSearch, setCheckoutDistrictSearch, isCheckoutDistrictOpen, setIsCheckoutDistrictOpen, appliedCoupon, setAppliedCoupon, deliveryArea, setDeliveryArea, addToCartInternal, addToCart, updateQuantity, setQuantityDirect, removeItem, getProductPrice, getDeliveryCharge, calculateTotal } = useCartContext();
    const { activeCampaign, setActiveCampaign, campaigns, setCampaigns, selectedColor, setSelectedColor, categories, setCategories, products, setProducts, searchQuery, setSearchQuery, searchInput, setSearchInput, selectedCategory, setSelectedCategory, isTrendingFilterActive, setIsTrendingFilterActive, selectedBrand, setSelectedBrand, minPrice, setMinPrice, maxPrice, setMaxPrice, sortBy, setSortBy, trendingIndices, setTrendingIndices, activeTrendingSlot, setActiveTrendingSlot, selectedProduct, setSelectedProduct, isProductDetailsOpen, setIsProductDetailsOpen, flashSaleProducts, relatedProducts, filteredProducts, featuredProducts, newArrivals, brands } = useProductContext();
    const [inlineOrderDistrict, setInlineOrderDistrict] = useState("");

    const [inlineOrderThana, setInlineOrderThana] = useState("");

    const [inlineOrderArea, setInlineOrderArea] = useState<"inside" | "outside">("inside");

    const [inlineOrderAddress, setInlineOrderAddress] = useState("");

    const [inlineOrderName, setInlineOrderName] = useState("");

    const [inlineOrderPhone, setInlineOrderPhone] = useState("");

    const [inlineOrderNote, setInlineOrderNote] = useState("");

    const [isInlineOrderProcessing, setIsInlineOrderProcessing] = useState(false);

    const [inlineOrderSuccess, setInlineOrderSuccess] = useState(false);

    const [isTrackingOpen, setIsTrackingOpen] = useState(false);

    const [trackingInput, setTrackingInput] = useState("");

    const [trackingResult, setTrackingResult] = useState<any>(null);

    const [isTrackingLoading, setIsTrackingLoading] = useState(false);

    const [trackingError, setTrackingError] = useState("");

    const handleTrackOrder = async () => {
        if (!trackingInput.trim()) return;
        setIsTrackingLoading(true);
        setTrackingError("");
        setTrackingResult(null);

        try {
          const ordersRef = collection(db, "orders");
          const searchVal = trackingInput.trim().replace(/^#/, "");
          let foundOrder = null;

          if (searchVal.startsWith("01") || searchVal.startsWith("+8801")) {
            const q = query(ordersRef, where("customerPhone", "==", searchVal));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              orders.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
              foundOrder = orders[0];
            }
          } else {
            // Since Firebase blocks fetching all orders, we use the shortId field for new orders
            const q = query(ordersRef, where("shortId", "==", searchVal.toUpperCase()));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              orders.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
              foundOrder = orders[0];
            } else {
               // Fallback check full orderId if they happen to enter it
               const qFull = query(ordersRef, where("orderId", "==", searchVal));
               const snapFull = await getDocs(qFull);
               if(!snapFull.empty) {
                  const ordersFull = snapFull.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  foundOrder = ordersFull[0];
               }
            }
          }

          if (!foundOrder) {
            setTrackingError("কোনো অর্ডার পাওয়া যায়নি। পুরনো অর্ডারের জন্য অনুগ্রহ করে ফোন নাম্বার ব্যবহার করুন।");
            setIsTrackingLoading(false);
            return;
          }

          const order = foundOrder;

          if (order.couriers && order.couriers.trackingId && order.couriers.service === "Steadfast") {
            try {
              // API keys are kept server-side; proxy handles auth
              const response = await fetch(`/api/steadfast-status?id=${encodeURIComponent(order.couriers.trackingId)}`);
              const data = await response.json();
              if (data.success && data.data && data.data.delivery_status) {
                 setTrackingResult({ ...order, steadfastStatus: data.data.delivery_status });
              } else {
                 setTrackingResult({ ...order, steadfastStatus: "Steadfast এ খোঁজ পাওয়া যায়নি" });
              }
            } catch (e) {
              setTrackingResult({ ...order, steadfastStatus: "স্ট্যাটাস ফেচ করতে সমস্যা হয়েছে" });
            }
          } else if (order.couriers && order.couriers.trackingId && order.couriers.service === "Pathao") {
            try {
              const response = await fetch(`/api/pathao-status?id=${encodeURIComponent(order.couriers.trackingId)}`);
              const data = await response.json();
              if (data.success && data.data && data.data.data && data.data.data.order && data.data.data.order.transfer_status) {
                 setTrackingResult({ ...order, pathaoStatus: data.data.data.order.transfer_status });
              } else {
                 setTrackingResult({ ...order, pathaoStatus: "Pathao এ খোঁজ পাওয়া যায়নি" });
              }
            } catch (e) {
              setTrackingResult({ ...order, pathaoStatus: "স্ট্যাটাস ফেচ করতে সমস্যা হয়েছে" });
            }
          } else {
            setTrackingResult(order);
          }
        } catch (err: any) {
          setTrackingError("সার্ভার বা নেটওয়ার্ক সমস্যা: " + err.message);
        }
        setIsTrackingLoading(false);
      };

    const [isOrderSuccess, setIsOrderSuccess] = useState(false);

    const [completedOrderReceipt, setCompletedOrderReceipt] = useState<any>(null);

    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

    const [isOrderProcessing, setIsOrderProcessing] = useState(false);

    const [inlinePhoneFocused, setInlinePhoneFocused] = useState(false);

    const handleVerifyOTP = () => {
        if (adminOTPInput === generatedOTP) {
          if (user) {
            localStorage.setItem(`admin_verified_${user.uid}`, "true");
            sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
          }
          setIsAdminVerified(true);
          setIs2FAPending(false);
          setAdminOTPError("আপনার এডমিন প্রোফাইলে ফোন নম্বর সেট করা নেই। দয়া করে এডমিন প্যানেলে ফোন নম্বর যোগ করুন।");
          setAdminOTPInput("");
          setGeneratedOTP("");
        } else {
          setAdminOTPError("ভেরিফিকেশন কোডটি সঠিক নয়।");
        }
      };

    const handleConfirmOrder = async (e: FormEvent) => {
        e.preventDefault();
        if (isOrderProcessing) return;
        if (isQuotaExceeded) {
          toast.error("কোটা শেষ হয়ে গেছে, আপাতত কোনো কিছু সেভ করা যাচ্ছে না।");
          return;
        }
        
        setIsOrderProcessing(true);
        const customerName = checkoutName.trim();
        const customerPhone = checkoutPhone.trim();
        const address = checkoutAddress.trim();
        
        if (!customerPhone || customerPhone.length < 11) {
          toast.error("সঠিক ফোন নাম্বার দিন (কমপক্ষে ১১ ডিজিট)!");
          const el = document.getElementById("checkout-phone-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          setIsOrderProcessing(false);
          return;
        }
        if (!checkoutDistrict) {
          toast.error("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন!");
          setIsOrderProcessing(false);
          return;
        }
        if (!address) {
          toast.error("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
          const el = document.getElementById("checkout-address-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          setIsOrderProcessing(false);
          return;
        }
        
        const checkoutArea = (checkoutDistrict.includes("ঢাকা") && checkoutDistrict !== "ঢাকা জেলা (বাইরে)") ? "inside" : "outside";
        const finalAddress = `${address}, ${checkoutDistrict}${checkoutNote ? ` (নোট: ${checkoutNote})` : ""}`;
        const paymentMethod = "cod";
        const orderId = Date.now().toString();
        const deliveryCharge = getDeliveryCharge(checkoutItems, checkoutArea, null);
        const totalWeight = checkoutItems.reduce((acc, item) => acc + (item.product?.weight || 0) * item.quantity, 0);
        const isPreOrder = checkoutItems.some((item) => item.product.isComingSoon);
        const subtotal = checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
        const appliedCoupon = null;
        const pointsDiscount = isApplyingRewardPoints ? availableRewardPoints : 0;
        const totalAmount = subtotal + deliveryCharge - pointsDiscount;
        const newOrder: any = {
          orderId,
          customerName: customerName || (userProfile?.displayName || "Guest"),
          customerPhone: customerPhone || (userProfile?.phone || "N/A"),
          address: finalAddress,
          deliveryArea: checkoutArea,
          deliveryCharge,
          totalWeight,
          pointsUsed: isApplyingRewardPoints ? availableRewardPoints : 0,
          pointsDiscount: pointsDiscount,
          appliedCoupon,
          subtotal,
          isPreOrder,
          items: checkoutItems.map((item) => {
            const itemColor = (item.color && item.color !== "N/A") ? item.color : undefined;
            const itemSize = (item.size && item.size !== "N/A") ? item.size : undefined;
            return {
              product: {
                id: item.product.id,
                name: item.product.name,
                price: getProductPrice(item.product, item.quantity),
                buyingPrice: item.product.buyingPrice || 0,
                image: item.product.image,
                isComingSoon: !!item.product.isComingSoon,
              },
              quantity: item.quantity,
              color: itemColor,
              size: itemSize,
            };
          }),
          total: totalAmount,
          paymentMethod,
          transId:
            (paymentMethod as any) !== "cod" && (paymentMethod as any) !== "wallet"
              ? transId || "N/A"
              : (paymentMethod as any) === "wallet"
                ? `WALLET-${orderId}`
                : "N/A",
          date: new Date().toLocaleString("bn-BD"),
          status: "pending",
          createdAt: serverTimestamp(),
          userId: user?.uid || "guest",
        };
        try {
          // Create Order Directly in Firestore
          await setDoc(doc(db, "orders", orderId), newOrder);

          // Decrement stock in Firestore directly for all items
          try {
            for (const item of checkoutItems) {
               const pId = item.product.id;
               const reqQty = Number(item.quantity) || 1;
               await updateDoc(doc(db, "products", pId), {
                 stock: increment(-reqQty),
                 salesCount: increment(reqQty)
               });
            }
          } catch (err) {
            console.error("Failed to decrement stock", err);
          }
          
          // Send confirmation email via PHP endpoint
          try {
            axios.post("/api/confirm-order", newOrder).catch(e => console.error("Email err:", e));
          } catch(e) {}
          try {
            savePhoneProfile(newOrder.customerPhone, customerName, address, "", "", checkoutDistrict);
          } catch(e) {}
          // Local Update
          const localOrder = {
            ...newOrder,
            id: orderId,
            createdAt: new Date().toISOString(),
          };
          const updatedHistory = [localOrder, ...orderHistory];
          setOrderHistory(updatedHistory);
          try {
            localStorage.setItem("ishopbd_orders", JSON.stringify(updatedHistory));
          } catch (e) {
            console.warn("Failed to save orders to localStorage:", e);
          }
          // Notify Admin via backend
          try {
          notifyAdminsOnNewOrder(orderId, newOrder.total);
            fetch("/api/confirm-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newOrder),
            }).catch(err => console.warn("Admin notification email failed:", err));
          } catch (e) {
            console.warn("API call failed:", e);
          }
          try {
            const productNames = newOrder.items.map((i: any) => i.product.smsName || i.product.name).join(', ');
            const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${newOrder.total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.online ধন্যবাদ!`;
            fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: newOrder.customerPhone, message }),
            }).catch(err => console.warn("Auto SMS failed:", err));
          } catch(e) {}
          try {
            const sessionId = localStorage.getItem("ishopbd_session_id");
            if (sessionId) {
              deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
              localStorage.removeItem("ishopbd_session_id");
            }
            if (newOrder.customerPhone) {
              deleteDoc(doc(db, "incomplete_orders", newOrder.customerPhone)).catch(() => {});
            }
          } catch(e) {}

          // Track Purchase
          try {
            if ((window as any).fbq) {
              (window as any).fbq('track', 'Purchase', {value: totalAmount, currency: 'BDT'});
            }
            if ((window as any).gtag) {
              (window as any).gtag('event', 'purchase', {
                transaction_id: orderId,
                value: totalAmount,
                currency: 'BDT',
                items: checkoutItems.map(i => ({
                  item_id: i.product.id,
                  item_name: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity
                }))
              });
            }
          } catch (err) {}
          setCompletedOrderReceipt({ ...newOrder, orderId });
          setIsCheckoutOpen(false);
          setCheckoutItems([]);
          setCartItems([]);
          setTransId("");
          setIsOrderProcessing(false);
          setIsApplyingRewardPoints(false);
          setAvailableRewardPoints(0);
        } catch (error: any) {
          console.error("Order error:", error);
          setIsOrderProcessing(false);
          
          try {
            handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
          } catch (fsErr: any) {
            toast.error("অর্ডার প্রসেস করতে সমস্যা হয়েছে: " + (error.message || "Unknown error"));
          }
        }
      };

    const handleInlineOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        if (!validateSelections()) {
          return;
        }
        
        if (!inlineOrderName.trim()) {
          toast.error("দয়া করে আপনার নাম প্রদান করুন।");
          const el = document.getElementById("inline-name-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }
        if (!inlineOrderPhone || inlineOrderPhone.trim().length < 11) {
          toast.error("সঠিক ফোন নাম্বার দিন (কমপক্ষে ১১ ডিজিট)!");
          const el = document.getElementById("inline-phone-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }
        if (!inlineOrderAddress.trim()) {
          toast.error("দয়া করে আপনার সম্পূর্ণ ঠিকানা প্রদান করুন।");
          const el = document.getElementById("inline-address-input");
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); el.classList.add("border-red-500", "ring-2", "ring-red-500"); setTimeout(() => el.classList.remove("border-red-500", "ring-2", "ring-red-500"), 3000); }
          return;
        }
        setIsInlineOrderProcessing(true);
        try {
          let finalPrice = getProductPrice(selectedProduct, tempSelectedQty);
          if (wholesaleSizeQty && Object.keys(wholesaleSizeQty).length > 0) {
            const totalWholesaleQty = Object.values(wholesaleSizeQty as Record<string, number>).reduce((sum, qty) => sum + qty, 0);
            finalPrice = getProductPrice(selectedProduct, totalWholesaleQty);
          }
          
          let finalAddress = inlineOrderAddress;
          if (inlineOrderDistrict && inlineOrderThana) {
            finalAddress = `${inlineOrderAddress}, ${inlineOrderThana}, ${inlineOrderDistrict}`;
          }
          const orderData = {
            orderId: `ORD${Date.now()}`,
            customerName: inlineOrderName,
            customerPhone: inlineOrderPhone,
            address: finalAddress,
            deliveryArea: inlineOrderArea,
            note: inlineOrderNote,
            items: [{
              product: selectedProduct,
              quantity: tempSelectedQty,
              color: tempSelectedColor,
              size: tempSelectedSize,
              price: finalPrice,
              wholesaleSizeQty: wholesaleSizeQty
            }],
            subtotal: finalPrice * tempSelectedQty,
            deliveryCharge: getDeliveryCharge([{product: selectedProduct, quantity: tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null),
            pointsDiscount: isApplyingRewardPoints ? availableRewardPoints : 0,
            pointsUsed: isApplyingRewardPoints ? availableRewardPoints : 0,
            total: (finalPrice * tempSelectedQty) + getDeliveryCharge([{product: selectedProduct, quantity: tempSelectedQty, color: tempSelectedColor, size: tempSelectedSize}], inlineOrderArea, null) - (isApplyingRewardPoints ? availableRewardPoints : 0),
            status: 'pending',
            createdAt: serverTimestamp(),
            orderType: 'direct_buy',
            userId: user?.uid || "guest"
          };
          // Create Order Directly in Firestore
          await setDoc(doc(db, "orders", orderData.orderId), orderData);

          // Decrement stock in Firestore directly for all items
          try {
            const item = orderData.items[0];
            const pId = item.product.id;
            const reqQty = Number(item.quantity) || 1;
            await updateDoc(doc(db, "products", pId), {
              stock: increment(-reqQty),
              salesCount: increment(reqQty)
            });
          } catch (err) {
            console.error("Failed to decrement stock", err);
          }
          
          // Send confirmation email via PHP endpoint
          try {
            axios.post("/api/confirm-order", orderData).catch(e => console.error("Email err:", e));
          } catch(e) {}
          try {
            savePhoneProfile(orderData.customerPhone, orderData.customerName, inlineOrderAddress, inlineOrderDistrict, inlineOrderThana, orderData.deliveryArea);
          } catch(e) {}
          
          try {
            const productNames = orderData.items.map((i: any) => i.product.smsName || i.product.name).join(', ');
            const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderData.orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${orderData.total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.online ধন্যবাদ!`;
            fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: orderData.customerPhone, message }),
            }).catch(err => console.warn("Auto SMS failed:", err));
          } catch(e) {}
          try {
            const sessionId = localStorage.getItem("ishopbd_session_id");
            if (sessionId) {
              deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
              localStorage.removeItem("ishopbd_session_id");
            }
            if (orderData.customerPhone) {
              deleteDoc(doc(db, "incomplete_orders", orderData.customerPhone)).catch(() => {});
            }
          } catch(e) {}

          // Track Purchase
          try {
            if ((window as any).fbq) {
              (window as any).fbq('track', 'Purchase', {value: orderData.total, currency: 'BDT'});
            }
            if ((window as any).gtag) {
              (window as any).gtag('event', 'purchase', {
                transaction_id: orderData.orderId,
                value: orderData.total,
                currency: 'BDT',
                items: orderData.items.map((i: any) => ({
                  item_id: i.product.id,
                  item_name: i.product.name,
                  price: i.product.price,
                  quantity: i.quantity
                }))
              });
            }
          } catch (err) {}
          // Show receipt
          setCompletedOrderReceipt(orderData);
          
          // Reset form
          setInlineOrderName("");
          setInlineOrderPhone("");
          setInlineOrderAddress("");
          setInlineOrderNote("");
          
          setIsProductDetailsOpen(false);
        } catch (error) {
          console.error('Error placing order:', error);
          const msg = error instanceof Error ? error.message : "অজানা ত্রুটি";
          alert('অর্ডার প্লেস করতে সমস্যা হয়েছে: ' + msg + '\n(সার্ভার লিমিট শেষ হয়ে থাকলে কিছুক্ষণ পর চেষ্টা করুন)');
        } finally {
          setIsInlineOrderProcessing(false);
        }
      };
    
  const { user, setUser, userProfile, setUserProfile, expenses, setExpenses, likedProducts, setLikedProducts, likedProductsRef, likeInProgressRef } = useAuthContext();
  const isInitialOrderLoadRef = useRef(true);
  
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }, []);
  // Global Quota Listener
  useEffect(() => {
    const handleQuotaExceeded = () => {
      if (!isQuotaExceeded) {
        setIsQuotaExceeded(true);
        console.warn("Global Quota exceeded detected.");
        toast.error("সার্ভার রিড/রাইট লিমিট শেষ! দয়া করে কিছুক্ষণ পর চেষ্টা করুন।", {
          duration: 5000,
          id: "quota-error"
        });
      }
    };
    window.addEventListener("firestore-quota-exceeded", handleQuotaExceeded);
    return () => window.removeEventListener("firestore-quota-exceeded", handleQuotaExceeded);
  }, []);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);
    const [quickEditOrderId, setQuickEditOrderId] = useState<string | null>(null);
    const [quickEditData, setQuickEditData] = useState<{customerName: string; customerPhone: string; address: string}>({customerName: "", customerPhone: "", address: ""});
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderData, setEditingOrderData] = useState<any>({});
  
  const [adminStartDate, setAdminStartDate] = useState<string>("");
  const [adminEndDate, setAdminEndDate] = useState<string>("");
  const [adminOrderAreaFilter, setAdminOrderAreaFilter] = useState<string>("all");
  const [reportTimeframe, setReportTimeframe] = useState<string>("28d");
  
    const handleQuickEditOrderItems = (order: any) => {
      setSelectedOrderForDetails(order);
      setEditingOrderData({
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        items: JSON.parse(JSON.stringify(order.items || []))
      });
      setIsEditingOrder(true);
    };
    const handleUpdateOrderDetails = async () => {
    if (!selectedOrderForDetails || !editingOrderData.customerName || !editingOrderData.customerPhone || !editingOrderData.address) return;
    try {
      const updatedItems = editingOrderData.items || selectedOrderForDetails.items || [];
      const subtotal = updatedItems.reduce((acc: number, curr: any) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
      
      const deliveryCharge = Number(selectedOrderForDetails.deliveryCharge || 0);
      const discount = Number(selectedOrderForDetails.discount || 0);
      const total = subtotal + deliveryCharge - discount;
      await updateDoc(doc(db, "orders", selectedOrderForDetails.id), {
        customerName: editingOrderData.customerName,
        customerPhone: editingOrderData.customerPhone,
        address: editingOrderData.address,
        items: updatedItems,
        subtotal: subtotal,
        total: total
      });
      
      const newOrderData = {
        ...selectedOrderForDetails,
        ...editingOrderData,
        subtotal: subtotal,
        total: total,
        items: updatedItems
      };
      
      setSelectedOrderForDetails(newOrderData);
      setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? newOrderData : o));
      setIsEditingOrder(false);
    } catch (e) {
      alert("অর্ডার আপডেট করতে সমস্যা হয়েছে।");
    }
  };
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  // Inline Order State
  const [isInlineDistrictOpen, setIsInlineDistrictOpen] = useState(false);
  const [isInlineThanaOpen, setIsInlineThanaOpen] = useState(false);
  const [inlineThanaSearch, setInlineThanaSearch] = useState("");
  const [isInlineThanaOpenWholesale, setIsInlineThanaOpenWholesale] = useState(false);
  const [inlineThanaSearchWholesale, setInlineThanaSearchWholesale] = useState("");
  const [inlineDistrictSearch, setInlineDistrictSearch] = useState("");
  const [isInlineDistrictOpenWholesale, setIsInlineDistrictOpenWholesale] = useState(false);
  const [inlineDistrictSearchWholesale, setInlineDistrictSearchWholesale] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  
  
  const [transId, setTransId] = useState("");
  const [isPaymentSimulating, setIsPaymentSimulating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAdminRecording, setIsAdminRecording] = useState(false);
  const [adminMediaRecorder, setAdminMediaRecorder] = useState<MediaRecorder | null>(null);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("ishopbd_chat_session");
    if (saved && saved.startsWith("guest_")) return saved;
    const newId = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("ishopbd_chat_session", newId);
    return newId;
  });
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [adminOrdersLimit, setAdminOrdersLimit] = useState(50);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeCampaign, isTrendingFilterActive]);
  // Use effects for URL handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const campaignSlug = params.get("campaign");
    if (campaignSlug && campaigns.length > 0) {
      const found = campaigns.find((c) => c.slug === campaignSlug && c.isActive);
      if (found) {
        setActiveCampaign(found);
        setSelectedCategory("all");
        setSearchInput("");
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("campaign");
        window.history.replaceState({}, "", url.toString());
      }
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setTimeout(() => {
        const productsSection = document.getElementById("product-display-section");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [campaigns]);
  const copyCategoryLink = (categoryName: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?category=${encodeURIComponent(categoryName)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`"${categoryName}" ক্যাটাগরির লিঙ্ক কপি হয়েছে! আপনি এখন এটি যে কোনো জায়গায় শেয়ার করতে পারেন।`);
    }).catch(err => {
      console.error("Copy failed", err);
      alert("লিঙ্ক কপি করা সম্ভব হয়নি।");
    });
  };
  const copyLandingPageLink = (productId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?landing=${productId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("ল্যান্ডিং পেজ লিংক কপি হয়েছে!");
    }).catch(err => {
      console.error("Copy failed", err);
      toast.error("লিংক কপি করা সম্ভব হয়নি।");
    });
  };
  const openLandingEditor = (product: any) => {
    setLandingEditorProduct(product);
    const cfg = product.landingConfig;
    setLandingEditorConfig({
      headline: cfg?.headline || "",
      subheadline: cfg?.subheadline || "",
      badgeText: cfg?.badgeText || "",
      extraImages: cfg?.extraImages || [],
      features: cfg?.features || [
        { icon: "zap", title: "প্রিমিয়াম কোয়ালিটি", desc: "আমরা সরাসরি কারখানা থেকে সেরা মানের পণ্য সরবরাহ করি।" },
        { icon: "thumbsup", title: "সহজ ব্যবহার উপযোগিতা", desc: "যেকোনো বয়সের মানুষের জন্য সহজ ডিজাইন।" },
        { icon: "truck", title: "দ্রুত ডেলিভারি সুবিধা", desc: "অর্ডার করার ২৪-৭২ ঘণ্টাএ° মধ্যে হোম ডেলিভারি।" },
        { icon: "shield", title: "নিশ্চিন্তে ক্যাশ অন ডেলিভারি", desc: "প্রোডাক্ট পেয়ে সন্তুষ্ট হয়ে তারপর মূল্য পরিশোধ।" },
      ],
      bodyText: cfg?.bodyText || "",
      videoUrls: cfg?.videoUrls || [],
      packages: cfg?.packages || [],
      priceOverride: cfg?.priceOverride || "",
      oldPriceOverride: cfg?.oldPriceOverride || "",
      showTrustBadges: cfg?.showTrustBadges !== false,
    });
  };
  const saveLandingConfig = async () => {
    if (!landingEditorProduct?.id) return;
    setIsSavingLandingConfig(true);
    try {
      const configToSave = { ...landingEditorConfig };
      await updateDoc(doc(db, "products", landingEditorProduct.id), { landingConfig: configToSave, updatedAt: serverTimestamp() });
      setProducts(prev => prev.map(p => p.id === landingEditorProduct.id ? { ...p, landingConfig: configToSave } as any : p));
      toast.success("ল্যান্ডিং পেজ কনফিগ সেভ হয়েছে!");
    } catch (err: any) {
      toast.error("সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setIsSavingLandingConfig(false);
    }
  };
  const handleLandingEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const currentCount = landingEditorConfig.extraImages?.length || 0;
    if (currentCount + files.length > 3) { toast.error("সর্বোচ্চ ৩টা ছবি যোগ করা যাবে!"); return; }
    for (const file of files) {
      try {
        const compressed = await import('browser-image-compression').then(m => (m.default as any)(file as any, { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true })) as File;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          setLandingEditorConfig((prev: any) => ({ ...prev, extraImages: [...(prev.extraImages || []), dataUrl] }));
        };
        reader.readAsDataURL(compressed);
      } catch { toast.error("ছবি লোড করতে সমস্যা!"); }
    }
    e.target.value = "";
  };
  
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [activeProductDropdown, setActiveProductDropdown] = useState<string | null>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setActiveProductDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  const [incompleteOrders, setIncompleteOrders] = useState<any[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [selectedOrderStatusFilter, setSelectedOrderStatusFilter] = useState("all");
  const [showOnlyPreOrders, setShowOnlyPreOrders] = useState(false);
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedBrand, selectedColor, activeCampaign, showOnlyPreOrders, isTrendingFilterActive, minPrice, maxPrice, sortBy]);
  // Persist cart
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Landing Page States
  const [landingName, setLandingName] = useState("");
  const [landingPhone, setLandingPhone] = useState("");
  const [landingAddress, setLandingAddress] = useState("");
  const [landingPackageIndex, setLandingPackageIndex] = useState(0);
  const [landingDistrict, setLandingDistrict] = useState("");
  const [landingThana, setLandingThana] = useState("");
  const [isLandingDistrictOpen, setIsLandingDistrictOpen] = useState(false);
  const [isLandingThanaOpen, setIsLandingThanaOpen] = useState(false);
  const [landingDistrictSearch, setLandingDistrictSearch] = useState("");
  const [landingThanaSearch, setLandingThanaSearch] = useState("");
  const [landingArea, setLandingArea] = useState("inside"); // inside / outside
  const [isLandingSubmitting, setIsLandingSubmitting] = useState(false);
  const [landingPhoneFocused, setLandingPhoneFocused] = useState(false);
  const landingProductId = urlParams.get("landing");
  const landingProduct = useMemo(() => {
    if (!landingProductId || products.length === 0) return null;
    return products.find(p => p.id === landingProductId && !p.deleted) || null;
  }, [landingProductId, products]);
  
  // Reward Points State
  const [checkingRewardPoints, setCheckingRewardPoints] = useState(false);
  const calculateRewardPoints = async (phone: string) => {
    if (!phone || phone.trim().length < 11) {
      setAvailableRewardPoints(0);
      return;
    }
    setCheckingRewardPoints(true);
    try {
      const q = query(collection(db, "orders"), where("customerPhone", "==", phone.trim()), where("status", "==", "Delivered"));
      const snapshot = await getDocs(q);
      let totalSpent = 0;
      let totalPointsUsed = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        totalSpent += (data.total || 0);
        totalPointsUsed += (data.pointsUsed || 0);
      });
      
      // Calculate: 1 point per 100 Tk spent. 1 point = 1 Tk discount.
      // So 1000 Tk spent = 10 points.
      const pointsEarned = Math.floor(totalSpent / 100);
      const pointsAvailable = pointsEarned - totalPointsUsed;
      setAvailableRewardPoints(pointsAvailable > 0 ? pointsAvailable : 0);
    } catch (e) {
      console.error("Error fetching reward points", e);
    } finally {
      setCheckingRewardPoints(false);
    }
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      calculateRewardPoints(checkoutPhone);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [checkoutPhone]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      calculateRewardPoints(inlineOrderPhone);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [inlineOrderPhone]);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let sessionId = localStorage.getItem("ishopbd_session_id");
      if (!sessionId) {
        sessionId = "cart_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("ishopbd_session_id", sessionId);
      }
      if (cartItems.length > 0) {
        setDoc(doc(db, "incomplete_orders", sessionId), {
          phone: checkoutPhone && checkoutPhone.trim().length > 0 ? checkoutPhone.trim() : "কার্টে আছে (Cart)",
          name: checkoutName && checkoutName.trim().length > 0 ? checkoutName.trim() : "অজ্ঞাত কাস্টমার",
          items: cartItems.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: getProductPrice(item.product, item.quantity),
            quantity: item.quantity,
            image: item.product.image || item.product.images?.[0] || ""
          })),
          updatedAt: serverTimestamp(),
          type: "cart_checkout",
          sessionId: sessionId
        }).catch(console.error);
      } else {
        deleteDoc(doc(db, "incomplete_orders", sessionId)).catch(() => {});
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [cartItems, checkoutPhone, checkoutName]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloadingReceipt(true);
      const node = receiptRef.current;
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        height: node.scrollHeight,
        width: node.scrollWidth,
        style: { transform: 'none' }
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Receipt_${completedOrderReceipt?.orderId || "Order"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCompletedOrderReceipt(null);
    } catch (err: any) {
      console.error("Error downloading receipt:", err);
      toast.error("ডাউনলোড ফেইল হয়েছে: " + err.message);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };
  const [isMultiOrderSelectionOpen, setIsMultiOrderSelectionOpen] =
    useState(false);
  const [activeBanners, setActiveBanners] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("cached_banners");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [adminList, setAdminList] = useState<AdminUser[]>(() => {
    try {
      const cached = localStorage.getItem("cached_admins");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierSelection, setCourierSelection] = useState({
    order: null as any,
    service: "Steadfast",
    trackingId: "",
    codAmount: 0,
  });
  const [siteConfig, setSiteConfig] = useState<{
    couponCode: string;
    isCouponPublic: boolean;
    whatsappNumber: string;
    bkashNumber: string;
    nagadNumber: string;
    rocketNumber: string;
    bankDetails: string;
    aboutUs: string;
    privacyPolicy: string;
    refundPolicy: string;
    termsAndConditions: string;
    supportPhone1: string;
    supportPhone2: string;
    facebookUrl: string;
    isCodEnabled?: boolean;
    isBkashEnabled?: boolean;
    isNagadEnabled?: boolean;
    isRocketEnabled?: boolean;
    isBankEnabled?: boolean;
    checkoutWarningText?: string;
    smsTemplateStart?: string;
    smsTemplateEnd?: string;
    isSmsConfirmEnabled?: boolean;
    isAiEnabled?: boolean;
  } | null>(null);
  // Sync Site Config
  useEffect(() => {
    if (isQuotaExceeded) return;
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSiteConfig({
          couponCode: data.couponCode || "ISHOPBD5",
          isCouponPublic: data.isCouponPublic || false,
          whatsappNumber: data.whatsappNumber || "8801777600844",
          bkashNumber: data.bkashNumber || "01777600844",
          nagadNumber: data.nagadNumber || "01777600844",
          rocketNumber: data.rocketNumber || "01777600844-0",
          bankDetails: data.bankDetails || "Bank: DBBL, A/C: 123456789",
          aboutUs: data.aboutUs || "i SHOP BD (আই শপ বিডি) - আপনার বিশ্বস্ত অনলাইন প্ল্যাটফর্ম।",
          privacyPolicy: data.privacyPolicy || "আপনার ব্যক্তিগত গোপনীয়তাকে আমরা সম্মান করি। আমাদের ওয়েবসাইটে দেওয়া আপনার সকল তথ্য (যেমন: নাম, ফোন নাম্বার, ঠিকানা) সম্পূর্ণ নিরাপদ।",
          refundPolicy: data.refundPolicy || "পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে ২৪ ঘন্টার মধ্যে জানান...",
          termsAndConditions: data.termsAndConditions || "আমাদের ওয়েবসাইট ব্যবহার করার জন্য আপনাকে ধন্যবাদ। অর্ডার করার মাধ্যমে আমরা আমাদের ডেলিভারি ও পেমেন্ট শর্তাবলীর সাথে একমত পোষণ করেছেন",
checkoutWarningText: data.checkoutWarningText !== undefined ? data.checkoutWarningText : "সম্মানিত গ্রাহক, রিটার্ন প্রোডাক্ট আমাদের কুরিয়ার চার্জ লস হওয়ার জন্য যথেষ্ট। তাই ভালোভাবে চেক করে প্রোডাক্ট অর্ডার করুন। আপনার সুন্দর সিদ্ধান্তের জন্য আপনাকে ধন্যবাদ।",
          supportPhone1: data.supportPhone1 || "01777-600844",
          supportPhone2: data.supportPhone2 || "01977-600844",
          isAiEnabled: data.isAiEnabled !== undefined ? data.isAiEnabled : false,
          facebookUrl: data.facebookUrl || "https://facebook.com/ishopbd",
          isCodEnabled: data.isCodEnabled !== undefined ? data.isCodEnabled : true,
          isBkashEnabled: data.isBkashEnabled !== undefined ? data.isBkashEnabled : true,
          isNagadEnabled: data.isNagadEnabled !== undefined ? data.isNagadEnabled : true,
          isRocketEnabled: data.isRocketEnabled !== undefined ? data.isRocketEnabled : true,
          isBankEnabled: data.isBankEnabled !== undefined ? data.isBankEnabled : true,
          smsTemplateStart: data.smsTemplateStart || "",
          smsTemplateEnd: data.smsTemplateEnd || "",
          isSmsConfirmEnabled: data.isSmsConfirmEnabled !== undefined ? data.isSmsConfirmEnabled : true,
        });
      } else {
        const defaultConfig = {
          couponCode: "ISHOPBD5",
          isCouponPublic: false,
          whatsappNumber: "8801777600844",
          bkashNumber: "01777600844",
          nagadNumber: "01777600844",
          rocketNumber: "01777600844-0",
          bankDetails: "Bank: DBBL, A/C: 123456789",
          isCodEnabled: true,
          isBkashEnabled: true,
          isNagadEnabled: true,
          isRocketEnabled: true,
          isBankEnabled: true,
          aboutUs: "i SHOP BD (আই শপ বিডি) - আপনার বিশ্বস্ত অনলাইন প্ল্যাটফর্ম। আমরা সুলভ মূল্যে সর্বোচ্চ মানের ইলেকট্রনিক গ্যাজেট, স্মার্ট এক্সেসরিজ এবং হোম অ্যাপ্লায়েন্স নিশ্চিত করি।",
          privacyPolicy: "আপনার ব্যক্তিগত গোপনীয়তাকে আমরা সম্মান করুন আমাদের ওয়েবসাইটে দেওয়া আপনার সকল তথ্য (যেমন: নাম, ফোন নাম্বার, ঠিকানা) সম্পূর্ণ নিরাপদ।",
          refundPolicy: "পণ্য হাতে পাওয়া পর কোনো সমস্যা থাকলে ২৪ ঘন্টার মধ্যে আমাদের সাথে যোগাযোগ করুন। সঠিক প্রমাণ সাপেক্ষে আমরা দ্রুত রিফান্ড বা এক্সচেঞ্জ করে থাকি",
          termsAndConditions: "আমাদের ওয়েবসাইট ব্যবহার করুন জন্য আপনাকে ধন্যবাদ। অর্ডার করুন মাধ্যমে আমরা আমাদের ডেলিভারি ও পেমেন্ট শর্তাবলীর সাথে একমত পোষণ করেছেন",
checkoutWarningText: "সম্মানিত গ্রাহক, রিটার্ন প্রোডাক্ট আমাদের কুরিয়ার চার্জ লস হওয়ার জন্য যথেষ্ট। তাই ভালোভাবে চেক করে প্রোডাক্ট অর্ডার করুন। আপনার সুন্দর সিদ্ধান্তের জন্য আপনাকে ধন্যবাদ।",
          supportPhone1: "01777-600844",
          supportPhone2: "01977-600844",
          facebookUrl: "https://facebook.com/ishopbd",
          isAiEnabled: false,
          smsTemplateStart: "",
          smsTemplateEnd: "",
          isSmsConfirmEnabled: true,
        } as any;
        setSiteConfig(defaultConfig);
      }
    }, (err) => {
       handleFirestoreError(err, OperationType.GET, "config/site");
       // Silently handle permission denied for config if it's not crucial, or log it
       console.warn("Config sync error:", err);
    });
    return () => unsub();
  }, [isQuotaExceeded]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState<"full" | "support_only">("full");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const [blacklist, setBlacklist] = useState<string[]>(() => {
    const saved = localStorage.getItem("ishopbd_blacklist");
    return saved ? JSON.parse(saved) : [];
  });
  const [courierReports, setCourierReports] = useState<Record<string, { total_parcel: number; total_delivered: number; total_cancelled: number; total_fraud_report: number }>>({});
  const [loadingCourierReports, setLoadingCourierReports] = useState<Record<string, boolean>>({});
  const [isCourierHistoryModalOpen, setIsCourierHistoryModalOpen] = useState(false);
  const [courierModalPhone, setCourierModalPhone] = useState("");
  const checkCourierReport = async (phone: string) => {
    if (!phone) return;
    setLoadingCourierReports(prev => ({ ...prev, [phone]: true }));
    try {
      const response = await axios.get(`/api/courier/steadfast/fraud/${phone}`);
      if (response.data && response.data.success) {
        const report = response.data.data?.data || response.data.data;
        const total_parcel = Number(report?.total_parcel || report?.total_parcel_count || 0);
        const total_delivered = Number(report?.total_delivered || report?.total_delivered_count || 0);
        const total_cancelled = Number(report?.total_cancelled || report?.total_cancelled_count || 0);
        const total_fraud_report = Number(report?.total_fraud_report || report?.total_fraud_reports || 0);
        setCourierReports(prev => ({
          ...prev,
          [phone]: {
            total_parcel,
            total_delivered,
            total_cancelled,
            total_fraud_report,
          }
        }));
      } else {
        const errorMsg = response.data?.error || "কুরিয়ার ডাটা পাওয়া যায়নি";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Error checking courier report:", err);
      const errMsg = err.response?.data?.error || "কুরিয়ার ডাটা ফেচ করতে সমস্যা হয়েছে";
      toast.error(errMsg);
    } finally {
      setLoadingCourierReports(prev => ({ ...prev, [phone]: false }));
    }
  };
  type LangCode = "bn" | "en" | "ar" | "ur";
  const [language, setLanguage] = useState<LangCode>(() => {
    const saved = localStorage.getItem("app_lang") as LangCode;
    if (saved && ["bn", "en", "ar", "ur"].includes(saved)) return saved;
    const browserLang = navigator.language.split("-")[0];
    if (["bn", "en", "ar", "ur"].includes(browserLang)) return browserLang as LangCode;
    return "bn";
  });
  const languageList: { code: LangCode; label: string; native: string }[] = [
    { code: "bn", label: "Bengali", native: "বাংলা" },
    { code: "en", label: "English", native: "English" },
    { code: "ar", label: "Arabic", native: "العربية" },
    { code: "ur", label: "Urdu", native: "اردو" },
  ];
  const toggleLanguage = () => {
    // Basic cycle or we can open a picker. For now, let's allow the UI to open a picker if we add one.
    // I will replace the card click with an open modal if it's too many, 
    // but the user asked to "give language" here.
  };
  const t = (bnText: string, enText: string, arText?: string, urText?: string) => {
    if (language === "bn") return bnText;
    if (language === "ar") return arText || enText;
    if (language === "ur") return urText || enText;
    return enText;
  };
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("অবস্থান খুঁজে পাওয়া যায়নি। দয়া করে লোকেশন পারমিশন দিন।");
      return;
    }
    setIsDetectingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Dhaka boundaries: Lat 23.65 - 23.95, Lon 90.30 - 90.55
        if (
          latitude >= 23.65 &&
          latitude <= 23.95 &&
          longitude >= 90.30 &&
          longitude <= 90.55
        ) {
          setDeliveryArea("inside");
        } else {
          setDeliveryArea("outside");
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback to inside Dhaka as a default if fails, or outside? 
        // Let's default to inside and show error message
        setLocationError("অবস্থান খুঁজে পাওয়া যায়নি। দয়া করে লোকেশন পারমিশন দিন।");
        setIsDetectingLocation(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);
  // Category translation helper
  useEffect(() => {
    if (isCheckoutOpen) {
      detectLocation();
    }
  }, [isCheckoutOpen, detectLocation]);
  const tc = (name: string) => {
const maps: any = { "Charger Fan": { bn: "চার্জার ফ্যান", en: "Charger Fan", ar: "مروحة شحن", ur: "چارجر پنکھا" }, "Handheld Fan": { bn: "হ্যান্ডহোল্ড ফ্যান", en: "Handheld Fan", ar: "مروحة محمولة", ur: "ہینڈ ہیلڈ پنکھا" }, "Smart Watch": { bn: "স্মার্ট ওয়াচ", en: "Smart Watch", ar: "ساعة ذكية", ur: "سمارٹ واچ" }, "Headphone": { bn: "হেডফোন", en: "Headphone", ar: "سماعة رأس", ur: "ہیڈ فون" }, "Earbuds": { bn: "ইয়ারবাডস", en: "Earbuds", ar: "سماعات أذن", ur: "ایئربڈز" }, "Mobile Accessories": { bn: "মোবাইল এক্সেসরিজ", en: "Mobile Accessories", ar: "إكسسوارات الجوال", ur: "موبائل لوازمات" }, "Gadgets": { bn: "গ্যাজেটস", en: "Gadgets", ar: "أدوات ذكية", ur: "گیجٹس" } };
    const entry = maps[name];
    if (entry) {
      if (language === "bn") return entry.bn;
      if (language === "ar") return entry.ar;
      if (language === "ur") return entry.ur;
      return entry.en;
    }
    return name;
  };
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  // Optimized helper to get customer stats based on phone
  const customerStatsMap = useMemo(() => {
    const stats: Record<string, { delivered: number; cancelled: number; isBlacklisted: boolean; total: number }> = {};
    orderHistory.forEach((order) => {
      const phone = order.customerPhone;
      if (!phone) return;
      if (!stats[phone]) {
        stats[phone] = { 
          delivered: 0, 
          cancelled: 0, 
          isBlacklisted: blacklist.includes(phone),
          total: 0 
        };
      }
      stats[phone].total++;
      if (order.status === "delivered") stats[phone].delivered++;
      if (order.status === "cancelled") stats[phone].cancelled++;
    });
    return stats;
  }, [orderHistory, blacklist]);
  const getCustomerStats = (phone: string) => {
    return customerStatsMap[phone] || {
      delivered: 0,
      cancelled: 0,
      isBlacklisted: blacklist.includes(phone),
      total: 0,
    };
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = filteredOrders.slice(0, adminOrdersLimit).map(o => o.id);
      setSelectedOrderIds(visibleIds);
    } else {
      setSelectedOrderIds([]);
    }
  };
  const handleSelectOrder = (e: any, id: string) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };
  const handleBulkSendToSteadfast = async () => {
    if (selectedOrderIds.length === 0) return;
    
    if (!adminKeys?.steadfastApiKey || !adminKeys?.steadfastSecretKey) {
      toast.error("Steadfast API Key or Secret Key missing! Please configure them in Settings first.", { duration: 5000 });
      return;
    }
    toast.loading("Steadfast এ অর্ডার এন্ট্রি করা হচ্ছে...");
    
    try {
      const payloadOrders = selectedOrderIds.map(id => {
        const order = orderHistory.find(o => o.id === id);
        return {
          id: order?.id,
          invoice: order?.id,
          recipient_name: order?.customerName,
          recipient_phone: order?.customerPhone,
          recipient_address: order?.address,
          cod_amount: order?.codAmount !== undefined ? order.codAmount : order?.total,
          note: `Invoice: ${order?.id}`
        };
      }).filter(o => o.id);
      const response = await fetch("/api/courier/steadfast/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apiKey: adminKeys?.steadfastApiKey || "",
          secretKey: adminKeys?.steadfastSecretKey || "",
          orders: payloadOrders
        })
      });
      const data = await response.json();
      toast.dismiss();
      if (data.success && data.processedOrders) {
        let successCount = 0;
        let failCount = 0;
        for (const result of data.processedOrders) {
          if (result.success) {
            successCount++;
            await updateDoc(doc(db, "orders", result.id), {
              status: "processing",
              courierTrackingId: result.trackingId,
              courierName: "Steadfast"
            });
            const originalOrder = orderHistory.find(o => o.id === result.id);
            if (originalOrder && originalOrder.userId) {
              sendPushToUser(originalOrder.userId, "অর্ডার আপডেট", "আপনার অর্ডারের বর্তমান স্ট্যাটাস: processing (কুরিয়ারে পাঠানো হয়েছে)", "/profile");
            }
          } else {
            failCount++;
            console.error(`Steadfast failed for ${result.id}:`, result.error);
          }
        }
        if (successCount > 0) {
          toast.success(`${successCount} টা অর্ডার সফলভাবে Steadfast এ পাঠানো হয়েছে!`);
          setSelectedOrderIds([]); 
        }
        if (failCount > 0) {
          toast.error(`${failCount} টা অর্ডার Steadfast এ পাঠাতে ব্যর্থ হয়েছে!`);
        }
      } else {
        toast.error(data.error || "Steadfast এ পাঠাতে ব্যর্থ হয়েছে!");
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error("সার্ভার এরর: " + (error?.message || error || "Steadfast এ পাঠানো যায়নি!"));
      console.error(error);
    }
  };
  const handleVerifyAdminPassword = async () => {
    if (!user) {
      toast.error("দয়া করে আগে লগ ইন করুন।");
      return;
    }
    const inputPass = adminPasswordInput.trim();
    if (!inputPass) {
      toast.error("পাসওয়ার্ড লিখুন।");
      return;
    }
    const userEmail = (user.email || "").toLowerCase().trim();
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    
    // Master check
    const masterEmailsLower = masterEmails.map(e => e.toLowerCase().trim());
    const isMaster = masterEmailsLower.includes(userEmail) || masterEmailsLower.includes(cleanEmail) || isMasterAdmin;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // Priority 1: Master Admin - verify via server-side API (password never in client)
    if (isMaster || isLocalhost) {
      try {
        const res = await fetch("/api/verify-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: inputPass, isMasterEmail: true }),
        });
        const result = await res.json();
        if (result.success) {
          localStorage.setItem(`admin_verified_${user.uid}`, "true");
          sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
          setIsAdminVerified(true);
          setIs2FAPending(false);
          setAdminPasswordError(false);
          setAdminPasswordInput("");
          toast.success("মাস্টার এক্সেস নিশ্চিত করা হয়েছে।");
          return;
        } else {
          setAdminPasswordError(true);
          toast.error("মাস্টার পাসওয়ার্ডটি সঠিক নয়। অফার করে সঠিক পাসওয়ার্ড দিন।");
          return;
        }
      } catch {
        setAdminPasswordError(true);
        toast.error("সার্ভার থেকে যাচাই করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।");
        return;
      }
    }
    // Priority 2: Direct match in admin list
    const found = adminList.find((a) => 
      (a.id === user.uid) || 
      (a.email?.toLowerCase().trim() === userEmail) || 
      (a.id?.toLowerCase().trim() === userEmail) || 
      (a.email?.toLowerCase().trim() === cleanEmail) || 
      (a.id?.toLowerCase().trim() === cleanEmail)
    );
    if (found && found.password && found.password.trim() === inputPass) {
      // Check for 2FA if enabled
      if (found.require2FA && found.phone) {
        setIs2FAPending(true);
        setAdminPasswordError(false);
        toast("আপনার ফোনে ভেরিফিকেশন কোড পাঠানো হচ্ছে...");
        handleSendAdminOTP(); // Trigger OTP automatically if possible
        return;
      }
      localStorage.setItem(`admin_verified_${user.uid}`, "true");
      sessionStorage.setItem(`admin_verified_${user.uid}`, "true");
      setIsAdminVerified(true);
      setAdminPasswordError(false);
      setAdminPasswordInput("");
      toast.success("সাফল্যের সাথে ভেরিফাই করা হয়েছে।");
    } else {
      setAdminPasswordError(true);
      toast.error("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };
  const toggleBlacklist = (phone: string) => {
    setBlacklist((prev) => {
      const isBlacklisted = prev.includes(phone);
      let next;
      if (isBlacklisted) {
        next = prev.filter((p) => p !== phone);
      } else {
        next = [...prev, phone];
      }
      localStorage.setItem("ishopbd_blacklist", JSON.stringify(next));
      return next;
    });
  };
  const [tempSelectedColor, setTempSelectedColor] = useState<string | null>(
    null,
  );
  const [tempSelectedSize, setTempSelectedSize] = useState<string | null>(null);
  const [colorValError, setColorValError] = useState(false);
  const [sizeValError, setSizeValError] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("ishopbd_saved_profiles");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (userProfile?.address) {
      setCheckoutAddress(userProfile.address);
    }
  }, [userProfile]);
  const [tempSelectedQty, setTempSelectedQty] = useState(1);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inlineOrderPhone && inlineOrderPhone.trim().length >= 11 && selectedProduct) {
        setDoc(doc(db, "incomplete_orders", inlineOrderPhone.trim()), {
          phone: inlineOrderPhone.trim(),
          name: inlineOrderName,
          items: [{
            name: selectedProduct.name,
            price: getProductPrice(selectedProduct, tempSelectedQty),
            quantity: tempSelectedQty,
            image: selectedProduct.image || ""
          }],
          updatedAt: serverTimestamp(),
          type: "inline_checkout",
          smsSent: false
        }, { merge: true }).catch(console.error);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [inlineOrderPhone, inlineOrderName, selectedProduct, tempSelectedQty]);
  // Main Cart Abandoned Tracker
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (checkoutPhone && checkoutPhone.trim().length >= 11 && cartItems.length > 0) {
        setDoc(doc(db, "incomplete_orders", checkoutPhone.trim()), {
          phone: checkoutPhone.trim(),
          name: checkoutName,
          items: cartItems.map(item => ({
            name: item.product.name,
            price: getProductPrice(item.product, item.quantity),
            quantity: item.quantity,
            image: item.product.image || ""
          })),
          updatedAt: serverTimestamp(),
          type: "main_checkout",
          smsSent: false
        }, { merge: true }).catch(console.error);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [inlineOrderPhone, inlineOrderName, selectedProduct, tempSelectedQty]);
  const [wholesaleSizeQty, setWholesaleSizeQty] = useState<Record<string, number>>({});
  const [isDeliveryInfoOpen, setIsDeliveryInfoOpen] = useState(false);
  const [modalDisplayImage, setModalDisplayImage] = useState<string | null>(
    null,
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [userInteractedWithGallery, setUserInteractedWithGallery] =
    useState(false);
  const [reviewForm, setReviewForm] = useState<{
    rating: number;
    comment: string;
    images: string[];
    guestName?: string;
  }>({ rating: 5, comment: "", images: [], guestName: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeReviews, setActiveReviews] = useState<Review[]>([]);
  const [isSyncingData, setIsSyncingData] = useState(false);
  useEffect(() => {
    if (!isProductDetailsOpen) {
      setWholesaleSizeQty({});
    }
  }, [isProductDetailsOpen]);
  const trendingProducts = useMemo(() => {
    const explicitlyTrending = products.filter((p) => p.isTrending && !p.deleted && p.isPublished !== false);
    if (explicitlyTrending.length > 0) {
      return explicitlyTrending.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    // Fallback to latest products if no trending flag is set
    return [...products]
      .filter(p => !p.deleted && p.isPublished !== false)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [products]);
  useEffect(() => {
    if (trendingProducts.length <= 4) return;
    
    const timer = setInterval(() => {
      setTrendingIndices((prev) => {
        const next = [...prev];
        const slotToUpdate = Math.floor(Math.random() * 4); // Random slot or sequential? User said sequential but maybe random feels better.
        // Let's use sequential as requested: "একটার পর একটা"
        
        setActiveTrendingSlot(currentSlot => {
          const nextSlot = (currentSlot + 1) % 4;
          
          // Logic to find a next index not currently in 'prev'
          let nextVal = (Math.max(...prev) + 1) % trendingProducts.length;
          while (prev.includes(nextVal) && trendingProducts.length > 4) {
            nextVal = (nextVal + 1) % trendingProducts.length;
          }
          
          next[currentSlot] = nextVal;
          return nextSlot;
        });
        
        return next;
      });
    }, 4000); // Change one product every 4 seconds
    return () => clearInterval(timer);
  }, [trendingProducts.length]);
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      // Separate pre-orders and regular orders
      const isPreOrder = (order.isPreOrder || order.items?.some((i: any) => i.product?.isComingSoon)) && order.status === "pending";
      if (showOnlyPreOrders) {
        if (!isPreOrder) return false;
      } else {
        if (isPreOrder) return false;
      }
      // Status Filtering
      if (selectedOrderStatusFilter !== "all") {
        if (order.status !== selectedOrderStatusFilter) return false;
      }
      // Area Filtering
      if (adminOrderAreaFilter !== "all") {
        if (adminOrderAreaFilter === "inside" && order.deliveryArea !== "inside") return false;
        if (adminOrderAreaFilter === "outside" && order.deliveryArea !== "outside") return false;
      }
      // Date Filtering
      if (adminStartDate || adminEndDate) {
        let orderTime = 0;
        if (order.createdAt) {
          orderTime = typeof order.createdAt === 'string' 
            ? new Date(order.createdAt).getTime() 
            : (order.createdAt.seconds ? order.createdAt.seconds * 1000 : (order.createdAt.toMillis?.() || 0));
        } else if (order.date) {
           // fallback if only string date is available (e.g. 15-10-2023)
           const parts = order.date.split(/[-/]/);
           if (parts.length >= 3) {
             // Assuming DD-MM-YYYY or MM-DD-YYYY
             // Let's just try to parse it
             orderTime = new Date(order.date).getTime();
           }
        }
        
        if (orderTime && !isNaN(orderTime)) {
          if (adminStartDate) {
            const start = new Date(adminStartDate);
            start.setHours(0, 0, 0, 0);
            if (orderTime < start.getTime()) return false;
          }
          if (adminEndDate) {
            const end = new Date(adminEndDate);
            end.setHours(23, 59, 59, 999);
            if (orderTime > end.getTime()) return false;
          }
        }
      }
      if (!orderSearchQuery) return true;
      let search = orderSearchQuery.toLowerCase();
      if (search.startsWith('#')) {
        search = search.substring(1);
      }
      return (
        order.customerPhone?.toLowerCase().includes(search) ||
        order.id?.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search)
      );
    });
  }, [orderHistory, orderSearchQuery, showOnlyPreOrders, adminStartDate, adminEndDate, selectedOrderStatusFilter]);
  const masterEmails = useMemo(() => [
    "islamicsoktitv@gmail.com", 
    "bonieaminrony@gmail.com",
    "ishopbd.online@gmail.com",
    "ifilmbd2025@gmail.com",
    "ifilmbd2025@gmail.com".toLowerCase().trim() // redundant but safe
  ], []);
  const [isAdminDocLoading, setIsAdminDocLoading] = useState(true);
  const [myAdminDoc, setMyAdminDoc] = useState<AdminUser | null>(null);
  // Fetch user's own admin document for role check
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      setMyAdminDoc(null);
      setIsAdminDocLoading(false);
      return;
    }
    let isMounted = true;
    const unsub = onSnapshot(doc(db, "admins", user.uid), (snap) => {
      if (!isMounted) return;
      if (snap.exists()) {
        setMyAdminDoc({ id: snap.id, ...snap.data() } as AdminUser);
      } else {
        setMyAdminDoc(null);
      }
      setIsAdminDocLoading(false);
    }, (err) => {
      if (!isMounted) return;
      if (err.code !== "permission-denied") {
        console.warn("My admin doc sync error:", err);
      }
      setIsAdminDocLoading(false);
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [user, isQuotaExceeded]);
  const isMasterAdmin = useMemo(() => {
    if (!user) return false;
    const userEmail = (user.email || "").toLowerCase().trim();
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    
    const masterEmailsLower = masterEmails.map(e => e.toLowerCase().trim());
    
    if (masterEmailsLower.includes(userEmail) || masterEmailsLower.includes(cleanEmail)) return true;
    
    return myAdminDoc?.role === "admin" || myAdminDoc?.role === "owner";
  }, [user, myAdminDoc, masterEmails]);
  const handleSendAdminOTP = async () => {
    const userEmail = user?.email || "";
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    const found = adminList.find((a) => (a.email === userEmail) || (a.id === userEmail) || (a.email === cleanEmail) || (a.id === cleanEmail));
    
    if (!found || !found.phone) {
      setAdminOTPError("আপনার এডমিন প্রোফাইলে ফোন নম্বর সেট করা নেই। দয়া করে এডমিন প্যানেলে ফোন নম্বর যোগ করুন।");
      return;
    }
    setIsSendingOTP(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(code);
    try {
      const message = `নিরাপদ শপ বিডি এডমিন প্যানেল এ লগইন এর জন্য আপনার ভেরিফিকেশন কোডটি হলো: ${code}`;
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: found.phone,
          message: message
        })
      });
      const result = await response.json();
      if (result.success) {
        setAdminOTPSent(true);
        setAdminOTPError("আপনার এডমিন প্রোফাইলে ফোন নম্বর সেট করা নেই। দয়া করে এডমিন প্যানেলে ফোন নম্বর যোগ করুন।");
      } else {
        setAdminOTPError("ভেরিফিকেশন কোডটি সঠিক নয়।");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setAdminOTPError("আপনার এডমিন প্রোফাইলে ফোন নম্বর সেট করা নেই। দয়া করে এডমিন প্যানেলে ফোন নম্বর যোগ করুন।");
    } finally {
      setIsSendingOTP(false);
    }
  };
  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (isMasterAdmin) return true;
    const userEmail = user.email || "";
    const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
    
    return myAdminDoc?.role === "admin" || myAdminDoc?.role === "owner" || myAdminDoc?.role === "moderator";
  }, [user, isMasterAdmin, myAdminDoc]);
  const prevUnreadSupport = useRef(0);
  useEffect(() => {
    if (!isAdmin) return;
    const unreadCount = supportChats.filter(c => c.unreadByAdmin).length;
    if (unreadCount > prevUnreadSupport.current && prevUnreadSupport.current !== 0) {
      toast.success("সাপোর্টে নতুন মেসেজ এসেএসেছে!", { icon: "💬", duration: 5000 });
      // Play a sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.warn('Audio play failed', e));
      } catch(e) {}
    }
    prevUnreadSupport.current = unreadCount;
  }, [supportChats, isAdmin]);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [is2FAPending, setIs2FAPending] = useState(false);
  const [adminOTPInput, setAdminOTPInput] = useState("");
  const [adminOTPSent, setAdminOTPSent] = useState(false);
  const [adminOTPError, setAdminOTPError] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminKeys, setAdminKeys] = useState<{
    steadfastApiKey?: string;
    steadfastSecretKey?: string;
    geminiApiKey?: string;
    pathaoClientId?: string;
    pathaoClientSecret?: string;
    pathaoUsername?: string;
    pathaoPassword?: string;
  } | null>(null);
  useEffect(() => {
    if (!isAdminVerified) return;
    let isMounted = true;
    const fetchKeys = async () => {
      try {
        const keysDoc = await getDoc(doc(db, "admin_config", "keys"));
        if (keysDoc.exists() && isMounted) {
          setAdminKeys(keysDoc.data() as any);
        }
      } catch (err) {
        console.error("Failed to fetch admin keys:", err);
      }
    };
    fetchKeys();
    return () => {
      isMounted = false;
    };
  }, [isAdminVerified]);
  // SEO: Dynamic URL and Meta Tags
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedProduct) {
      url.searchParams.set('product', selectedProduct.id);
      window.history.pushState({}, '', url);
      
      document.title = selectedProduct.name + " | i-shop BD";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', (selectedProduct.description || '').substring(0, 160).replace(/<[^>]*>?/gm, ''));
      
      let script = document.getElementById('seo-json-ld');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'seo-json-ld');
        document.head.appendChild(script);
      }
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": selectedProduct.name,
        "image": selectedProduct.images || [],
        "description": (selectedProduct.description || '').replace(/<[^>]*>?/gm, ''),
        "sku": selectedProduct.id,
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "BDT",
          "price": selectedProduct.price,
          "availability": (selectedProduct.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "itemCondition": "https://schema.org/NewCondition"
        }
      };
      script.textContent = JSON.stringify(jsonLd);
    } else {
      url.searchParams.delete('product');
      window.history.pushState({}, '', url);
      document.title = "i-shop BD - Online Shopping in Bangladesh";
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', "Best online shopping experience in Bangladesh with i-shop BD.");
      
      let script = document.getElementById('seo-json-ld');
      if (script) script.remove();
    }
  }, [selectedProduct]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth Status Changed:", currentUser?.email);
      setUser(currentUser);
      if (currentUser) {
        const isVerified = localStorage.getItem(`admin_verified_${currentUser.uid}`) === "true" ||
                           sessionStorage.getItem(`admin_verified_${currentUser.uid}`) === "true";
        if (isVerified) {
          setIsAdminVerified(true);
        }
        requestPushPermission(currentUser.uid);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);
  // Profile and Admin Sync logic
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      if (!user) {
        setUserProfile(null);
        setIsAdminVerified(false);
      }
      return;
    }
    let isMounted = true;
    let unsubProfile: (() => void) | undefined;
    const syncProfile = async () => {
      if (!user?.uid || !isMounted) return;
      try {
        // Admin check and sync
        const userEmail = (user.email || "").toLowerCase().trim();
        const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
        const isMaster = masterEmails.includes(userEmail) || masterEmails.includes(cleanEmail);
        
        // If not found by UID yet, try to find by email and sync
        if (!myAdminDoc && userEmail && isMounted) {
          try {
            const emailDocRef = doc(db, "admins", userEmail);
            const emailDocSnap = await getDoc(emailDocRef);
            if (emailDocSnap.exists()) {
              const adminData = emailDocSnap.data();
              const adminRef = doc(db, "admins", user.uid);
              await setDoc(adminRef, {
                ...adminData,
                syncedFrom: userEmail,
                syncedAt: serverTimestamp(),
              }, { merge: true });
              // The onSnapshot(doc(db, "admins", user.uid)) will update myAdminDoc automatically
            }
          } catch (err) {
            console.warn("Failed to check email-based admin doc:", err);
          }
        }
        // We already have myAdminDoc syncing in another useEffect
        // We just need to make sure a document exists for them if they are an admin
        if ((isMaster || myAdminDoc) && isMounted) {
          const sessionVerified = localStorage.getItem(`admin_verified_${user.uid}`) === "true" ||
                                  sessionStorage.getItem(`admin_verified_${user.uid}`) === "true";
          if (sessionVerified) setIsAdminVerified(true);
          if (isMasterAdmin && !myAdminDoc) {
            const adminRef = doc(db, "admins", user.uid);
            await setDoc(adminRef, {
              email: userEmail,
              role: "owner", // Give owner role to master
              syncedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }, { merge: true }).catch(err => {
              if (isMounted) handleFirestoreError(err, OperationType.WRITE, `admins/${user.uid}`);
            });
          }
        }
        if (!isMounted) return;
        // Profile Sync
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef).catch(err => {
          if (isMounted) handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          return null;
        });
        if (!isMounted) return;
        if (userSnap && !userSnap.exists()) {
          const newProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            balance: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newProfile).catch(err => {
            if (isMounted) handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          });
          if (isMounted) setUserProfile(newProfile as any);
        } else if (userSnap?.exists() && !userSnap.data().photoURL && user.photoURL) {
          await updateDoc(userRef, { photoURL: user.photoURL, updatedAt: serverTimestamp() }).catch(() => {});
        }
        if (!isMounted) return;
        unsubProfile = onSnapshot(userRef, (snapshot) => {
          if (isMounted && snapshot.exists()) setUserProfile(snapshot.data());
        }, (err) => {
           if (!isMounted) return;
           if (err.code !== "permission-denied") {
             handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
             console.warn("Profile sync listener error:", err.message);
           }
        });
      } catch (err: any) {
        if (!isMounted) return;
        if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        console.error("Profile sync error:", err);
      }
    };
    syncProfile();
    return () => {
      isMounted = false;
      unsubProfile?.();
    };
  }, [user, masterEmails, isQuotaExceeded, myAdminDoc]);
  // Transactions listener
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      if (!user) setTransactions([]);
      return;
    }
    let isMounted = true;
    const unsubTx = onSnapshot(
      query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
      ),
      (snapshot) => {
        if (!isMounted) return;
        const txs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        setTransactions(
          txs.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          ),
        );
      },
      (err) => {
         if (!isMounted) return;
         if (err.code !== "permission-denied") {
            handleFirestoreError(err, OperationType.GET, "transactions");
         }
      }
    );
    return () => {
      isMounted = false;
      unsubTx();
    };
  }, [user, isQuotaExceeded]);
  // Test Firestore Connection on Boot
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        console.log("Log");
      } catch (error: any) {
        if (error.message?.includes("Quota exceeded") || error.message?.includes("quota") || error.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        if (error instanceof Error && error.message.includes("client is offline")) {
          console.error(" Firestore client is offline. Please check your network or configuration.");
          toast.error("মাস্টার পাসওয়ার্ডটি সঠিক নয়। দয়া করে সঠিক পাসওয়ার্ড দিন।");
        } else {
          console.error(" Firestore connection error:", error);
        }
      }
    };
    testConnection();
  }, []);
  // Real-time synchronization for campaigns
  useEffect(() => {
    if (isQuotaExceeded) return;
    
    if (!isAdmin && !isMasterAdmin) {
      getDocs(collection(db, "campaigns")).then(snapshot => {
        const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Campaign);
        setCampaigns(data);
      }).catch(err => {
        handleFirestoreError(err, OperationType.GET, "campaigns");
      });
      return;
    }
    const unsubCampaigns = onSnapshot(collection(db, "campaigns"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Campaign);
      setCampaigns(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "campaigns");
      console.warn("Campaigns sync error:", err);
    });
    return () => unsubCampaigns();
  }, [isQuotaExceeded, isAdmin, isMasterAdmin]);
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_products");
      return !cached;
    } catch {
      return true;
    }
  });
  // Load Data from Firestore with quota-friendly synchronization
  useEffect(() => {
    if (isQuotaExceeded) return;
    
    const isAdminUser = isMasterAdmin || isAdmin;
    if (!isAdminUser) {
      getDocs(collection(db, "categories")).then(snap => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category);
        setCategories(data);
        localStorage.setItem("cached_categories", JSON.stringify(data));
      }).catch(err => console.warn("Categories fetch error:", err));
      getDocs(collection(db, "banners")).then(snap => {
        const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        setActiveBanners(data);
        localStorage.setItem("cached_banners", JSON.stringify(data));
      }).catch(err => console.warn("Banners fetch error:", err));
      const cachedProducts = localStorage.getItem("cached_products");
      const lastFetch = localStorage.getItem("products_last_fetch");
      const now = Date.now();
      
      if (cachedProducts) {
        try {
          const parsed = JSON.parse(cachedProducts);
          setProducts(parsed);
          const urlParams = new URLSearchParams(window.location.search);
          const productId = urlParams.get('product');
          if (productId) {
             const prod = parsed.find((p: any) => p.id === productId);
             if (prod) setSelectedProduct(prod);
          }
          setIsLoading(false);
        } catch(e) {}
      }
      if (!cachedProducts || !lastFetch || now - parseInt(lastFetch) > 3600000) {
        getDocs(collection(db, "products")).then(snapshot => {
          const prodData = snapshot.docs
            .map((d) => ({ ...d.data(), id: d.id }) as Product)
            .filter((p) => !p.deleted);
          setProducts(prodData);
          localStorage.setItem("cached_products", JSON.stringify(prodData));
          localStorage.setItem("products_last_fetch", now.toString());
          const urlParams = new URLSearchParams(window.location.search);
          const productId = urlParams.get('product');
          if (productId) {
             const prod = prodData.find((p: any) => p.id === productId);
             if (prod) setSelectedProduct(prod);
          }
          setIsLoading(false);
        }).catch(err => {
          if (!cachedProducts) {
            handleFirestoreError(err, OperationType.GET, "products");
            setIsLoading(false);
          }
        });
      }
      
      return;
    }
    // Snapshot Listeners for full synchronization for Admins
    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Category);
      setCategories(data);
      localStorage.setItem("cached_categories", JSON.stringify(data));
    }, (err) => console.warn("Categories sync error:", err));
    const unsubBanners = onSnapshot(collection(db, "banners"), (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setActiveBanners(data);
      localStorage.setItem("cached_banners", JSON.stringify(data));
    }, (err) => console.warn("Banners sync error:", err));
    const unsubExpenses = isMasterAdmin ? onSnapshot(collection(db, "expenses"), (snap) => {
      const exp = snap.docs.map(d => ({ ...d.data(), id: d.id }) as Expense);
      setExpenses(exp);
    }, (err) => console.warn("Expenses sync error:", err)) : () => {};
    const unsubAdmins = (isMasterAdmin || isAdmin) ? onSnapshot(collection(db, "admins"), (snap) => {
      const admins = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as AdminUser);
      setAdminList(admins);
      localStorage.setItem("cached_admins", JSON.stringify(admins));
      
      if (user) {
        const userEmail = (user.email || "").toLowerCase().trim();
        const cleanEmail = userEmail.endsWith("@mobile.user") ? userEmail.replace("@mobile.user", "") : userEmail;
        const masterEmailsLower = masterEmails.map(e => e.toLowerCase().trim());
        const isMaster = masterEmailsLower.includes(userEmail) || masterEmailsLower.includes(cleanEmail);
        const found = admins.find((a) => {
          const aEmail = (a.email || "").toLowerCase().trim();
          const aId = (a.id || "").toLowerCase().trim();
          return (aId === user.uid) || (aEmail === userEmail) || (aId === userEmail) || (aEmail === cleanEmail) || (aId === cleanEmail);
        });
        
        if (found || isMaster) {
          const role = found?.role || (isMaster ? "admin" : "moderator");
          setAdminViewMode(role === "admin" ? "full" : "support_only");
          
          const sessionVerified = localStorage.getItem(`admin_verified_${user.uid}`) === "true" ||
                                  sessionStorage.getItem(`admin_verified_${user.uid}`) === "true";
          if (sessionVerified) {
            setIsAdminVerified(true);
          } else if (found?.password) {
            // Already handled by sessionVerified check, if not verified, modal stays
          } else {
            // If no password set for this admin in DB, we still want them to verify once via master pass?
            // Actually, if it's a new admin doc with no pass, maybe bypass?
            // Existing logic was bypass.
            setIsAdminVerified(true);
          }
        } else {
          setIsAdminVerified(false);
        }
      }
    }, (err) => {
      if (err.code === "permission-denied") {
        console.warn("Admins list permission denied - this is expected for non-admins");
      } else {
        handleFirestoreError(err, OperationType.GET, "admins");
      }
    }) : () => {};
    // Products listener
    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const prodData = snapshot.docs
          .map((d) => ({ ...d.data(), id: d.id }) as Product)
          .filter((p) => !p.deleted);
        setProducts(prodData);
        localStorage.setItem("cached_products", JSON.stringify(prodData));
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');
        if (productId) {
           const prod = prodData.find((p: any) => p.id === productId);
           if (prod) setSelectedProduct(prod);
        }
        setIsLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "products");
        setIsLoading(false);
      }
    );
    return () => {
      unsubCategories();
      unsubBanners();
      unsubExpenses();
      if (typeof unsubAdmins === 'function') unsubAdmins();
      unsubProducts();
    };
  }, [user, masterEmails, isQuotaExceeded, isMasterAdmin, isAdmin]);
  // Listen for product details close to clean up review listener
  useEffect(() => {
    if (!isProductDetailsOpen && reviewUnsub) {
      reviewUnsub();
      setReviewUnsub(null);
    }
  }, [isProductDetailsOpen]);
  // Deep Link & URL Sync
  useEffect(() => {
    if (products.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get("p");
      if (productId && (!selectedProduct || selectedProduct.id !== productId)) {
        const prod = products.find((p) => p.id === productId);
        if (prod) {
          setSelectedProduct(prod);
          setIsProductDetailsOpen(true);
        }
      }
    }
  }, [products]);
  useEffect(() => {
    if (products.length === 0) return;
    const url = new URL(window.location.href);
    if (isProductDetailsOpen && selectedProduct) {
      url.searchParams.set("p", selectedProduct.id || "");
      // Add a clean slug from name
      const slug = (selectedProduct.name || "").toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
      if (slug) url.searchParams.set("prod", slug);
    } else {
      url.searchParams.delete("p");
      url.searchParams.delete("prod");
    }
    window.history.replaceState({}, "", url.toString());
  }, [isProductDetailsOpen, selectedProduct, products.length]);
  const [adminTab, setAdminTab] = useState<
    "orders" | "products" | "categories" | "settings" | "refunds" | "users" | "support" | "campaigns" | "incomplete_orders" | "bulk_sms" | "profit_analysis"
  >("orders");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null,
  );
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);
  // Landing Page Editor State
  const [landingEditorProduct, setLandingEditorProduct] = useState<any | null>(null);
  const [landingEditorConfig, setLandingEditorConfig] = useState<any>({
    headline: "",
    subheadline: "",
    badgeText: "",
    extraImages: [] as string[],
    features: [
      { icon: "zap", title: "প্রিমিয়াম কোয়ালিটি", desc: "আমরা সরাসরি কারখানা থেকে সেরা মান নিশ্চিত করে কাস্টমারকে প্রোডাক্টটি সরবরাহ করে থাকি।" },
      { icon: "thumbsup", title: "সহজ ব্যবহার উপযোগিতা", desc: "যেকোনো বয়সের মানুষের জন্য অত্যন্ত আরামদায়ক ও সহজ ডিজাইন নিশ্চিত করা হয়েছে।" },
      { icon: "truck", title: "দ্রুত ডেলিভারি সুবিধা", desc: "অর্ডার করার ২৪ থেকে ৭২ ঘণ্টাএ° মধ্যে আমরা সরাসরি কাস্টমারের কাছে হোম ডেলিভারি দিয়ে থাকি।" },
      { icon: "shield", title: "নিশ্চিন্তে ক্যাশ অন ডেলিভারি", desc: "প্রোডাক্ট হাতে পেয়ে কোয়ালিটি চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে তারপরে মূল্য পরিশোধ করার সুবিধা।" },
    ],
    bodyText: "",
    videoUrls: [],
    showTrustBadges: true,
  });
  const [isSavingLandingConfig, setIsSavingLandingConfig] = useState(false);
  const [landingPreviewTab, setLandingPreviewTab] = useState<'mobile'|'desktop'>('mobile');
  const [productFormErrors, setProductFormErrors] = useState<
    Record<string, boolean>
  >({});
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "moderator">(
    "moderator",
  );
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: "",
    color: "bg-primary",
    objectPosition: "50% 50%",
    linkedProductId: "",
    titleFont: "font-ador",
    titleWeight: "black",
    titleSize: "text-2xl md:text-4xl",
    subtitleFont: "font-ador",
    subtitleWeight: "bold",
    subtitleSize: "text-sm md:text-base",
    type: "hero" as "hero" | "secondary",
  });
  // Consolidated Orders listener (for Admin or User)
  useEffect(() => {
    if (isProductDetailsOpen || isCheckoutOpen || isOrderSuccess) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [isProductDetailsOpen, isCheckoutOpen, isOrderSuccess]);
  useEffect(() => {
    if (isQuotaExceeded) return;
    const chatId = user?.uid || sessionId;
    const chatRef = doc(db, "support_chats", chatId);
    const unsub = onSnapshot(
      chatRef,
      (doc) => {
        if (doc.exists()) {
          setChatMessages(doc.data().messages || []);
        }
      },
      (err) => {
        if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        if (err.code !== "permission-denied" && !err.message.includes("Quota exceeded")) {
          console.error("Personal chat listener error:", err);
        }
      }
    );
    return () => unsub();
  }, [user, sessionId, isQuotaExceeded]);
  useEffect(() => {
      if (isChatOpen) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        const chatId = user?.uid || sessionId;
        const chatRef = doc(db, "support_chats", chatId);
        
        // Mark as read without causing infinite loop
        if (chatMessages.length > 0) {
          getDoc(chatRef).then(snap => {
            if (snap.exists() && snap.data().unreadByUser) {
              updateDoc(chatRef, { unreadByUser: false }).catch(() => {});
            }
          }).catch(() => {});
        }
      }
  }, [chatMessages.length, isChatOpen, user, sessionId]);
  useEffect(() => {
    if (selectedChat) {
      adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);
  useEffect(() => {
    if (selectedChat && supportChats.length > 0) {
      const freshChat = supportChats.find((c) => c.id === selectedChat.id);
      // Optimize: only update if message count changed, much faster than JSON.stringify
      if (freshChat && freshChat.messages?.length !== selectedChat.messages?.length) {
        setSelectedChat(freshChat);
      }
    }
  }, [supportChats, selectedChat]);
  useEffect(() => {
    if (isAdminVerified && !isQuotaExceeded) {
      const q = query(
        collection(db, "support_chats"),
        orderBy("lastMessageAt", "desc"),
        limit(50) // Limit to recent 50 chats for better performance
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          setSupportChats(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        },
        (err) => {
          if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
            setIsQuotaExceeded(true);
          }
          if (err.code === "permission-denied") {
            console.warn("Admin chat listener: Access denied. Ensure you are in the admins collection.");
          } else if (!err.message.includes("Quota exceeded")) {
            console.error("Support chats listener error:", err);
          }
        }
      );
      return () => unsub();
    }
  }, [isAdminVerified, isQuotaExceeded]);
  useEffect(() => {
    if (!user || isQuotaExceeded) {
      setOrderHistory([]);
      return;
    }
    // Role-based query
    let q;
    if (isAdmin) {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(adminOrdersLimit + 150));
    } else {
      q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    }
    const unsubOrders = onSnapshot(
      q, 
      (snapshot) => {
        const orders = snapshot.docs.map((d) => {
          let orderDate = (d.data() as any).date;
          if (!orderDate) {
            const createdAt = (d.data() as any).createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
              orderDate = createdAt.toDate().toLocaleString("bn-BD");
            } else if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
              orderDate = new Date(createdAt.seconds * 1000).toLocaleString("bn-BD");
            } else if (createdAt) {
              orderDate = new Date(createdAt).toLocaleString("bn-BD");
            } else {
              orderDate = "N/A";
            }
          }
          return {
            ...d.data(),
            id: d.id,
            displayId: (d.data() as any).orderId || d.id,
            date: orderDate
          };
        });
        
        if (!isInitialOrderLoadRef.current) {
          const hasNewOrder = snapshot.docChanges().some(change => change.type === "added");
          if (hasNewOrder && isAdmin) {
            toast.success("নতুন অর্ডার এসেছে! 🛒", {
              duration: 5000,
              icon: "🎉",
              style: { borderRadius: "10px", background: "#333", color: "#fff" },
            });
            playNotificationSound();
          }
        }
        isInitialOrderLoadRef.current = false;
        setOrderHistory(orders);
        if (isAdmin && orders.length > 0) {
           setTimeout(() => {
              orders.forEach(o => {
                 if (!o.shortId) {
                    updateDoc(doc(db, "orders", o.id), {
                       shortId: String(o.orderId || o.id).slice(-6).toUpperCase()
                    }).catch(()=>{});
                 }
              });
           }, 2000);
        }
      },
      (err) => {
        if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
        if (err.code !== "permission-denied" && !err.message.includes("Quota exceeded")) {
          console.error("Orders listener error:", err);
        }
      }
    );
    const refundQuery = isAdmin 
      ? query(collection(db, "refund_requests"), orderBy("createdAt", "desc"), limit(100))
      : query(collection(db, "refund_requests"), where("userId", "==", user?.uid || ""), orderBy("createdAt", "desc"), limit(20));
    const unsubRefunds = onSnapshot(refundQuery, (snapshot) => {
      setRefundRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
        setIsQuotaExceeded(true);
      }
      if (err.code !== "permission-denied" && !err.message.includes("Quota exceeded")) {
        console.error("Refund requests listener error:", err);
      }
    });
    let unsubIncompleteOrders = () => {};
    if (isAdmin) {
      const incOrdersQuery = query(collection(db, "incomplete_orders"), orderBy("updatedAt", "desc"), limit(100));
      unsubIncompleteOrders = onSnapshot(incOrdersQuery, (snapshot) => {
        setIncompleteOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => {
        if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
          setIsQuotaExceeded(true);
        }
      });
    }
    return () => {
      unsubOrders();
      unsubRefunds();
      unsubIncompleteOrders();
    };
  }, [user, isAdmin, isQuotaExceeded]);
  // Background Poller for Abandoned Carts Auto SMS
  useEffect(() => {
    if (!isAdmin) return; // Only run when admin is logged in
    const checkAbandonedCarts = async () => {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const cart of incompleteOrders) {
        if (!cart.smsSent && cart.updatedAt?.toMillis && cart.updatedAt.toMillis() < oneHourAgo && cart.phone && cart.phone.length >= 11) {
          try {
            // First mark it as sent so we don't send multiple times
            await setDoc(doc(db, "incomplete_orders", cart.id), { smsSent: true }, { merge: true });
            
            // Call SMS API
            const message = "আপনার কার্টে থাকা প্রোডাক্টটি এখনো আপনার জন্য অপেক্ষা করছে! আজই অর্ডার কনফার্ম করুন। আমাদের ওয়েবসাইট ভিজিট করুন।";
            await fetch("/api/send-sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone: cart.phone,
                message: message
              })
            });
            console.log("Auto abandoned cart SMS sent to", cart.phone);
          } catch (e) {
            console.error("Failed to send auto abandoned cart SMS", e);
          }
        }
      }
    };
    const intervalId = setInterval(checkAbandonedCarts, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(intervalId);
  }, [incompleteOrders, isAdmin]);
  const handleSyncMockData = async () => {
    if (!isAdminVerified || isQuotaExceeded) return;
    if (!confirm("আমরা ক? নিশ্চিত?")) return;
    
    setIsSyncingData(true);
    try {
      let catAdded = 0;
      let prodAdded = 0;
      // Sync Categories
      for (const cat of default_categories) {
        const exists = categories.find(c => c.name === cat.name);
        if (!exists) {
          await addDoc(collection(db, "categories"), { name: cat.name }).catch(err => handleFirestoreError(err, OperationType.CREATE, "categories"));
          catAdded++;
        }
      }
      // Sync Products
      for (const prod of default_products) {
        const existingProd = products.find(p => p.name === prod.name);
        if (!existingProd) {
          const { id, ...pData } = prod;
          await addDoc(collection(db, "products"), {
            ...pData,
            createdAt: new Date().toISOString(),
            deleted: false
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, "products"));
          prodAdded++;
        } else {
          // If it exists, make sure the trending flag matches the code if it's explicitly set in default_products
          if (prod.isTrending !== existingProd.isTrending) {
             await updateDoc(doc(db, "products", existingProd.id), {
               isTrending: !!prod.isTrending
             }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `products/${existingProd.id}`));
             prodAdded++; // Count as updated/synced
          }
        }
      }
      alert(`সিঙ্ক সফল! ${catAdded}টি ক্যাটাগরি এবং ${prodAdded}টি প্রোডাক্ট যোগ করা হয়েছে।`);
    } catch (err: any) {
      console.error("Sync failed", err);
      if (err.message === "QUOTA_EXCEEDED") setIsQuotaExceeded(true);
      alert("ডাটা সিঙ্ক করতে সমস্যা হয়েছে।");
    } finally {
      setIsSyncingData(false);
    }
  };
  const handleAdminImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "product" | "banner" | "campaign" = "product",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (type === "product") {
          setEditingProduct({
            ...(editingProduct || {}),
            image: dataUrl,
          } as any);
        } else if (type === "campaign") {
          setEditingCampaign({
            ...(editingCampaign || {}),
            image: dataUrl,
          } as any);
        } else {
          if (editingBanner) {
            setEditingBanner({ ...editingBanner, image: dataUrl });
          } else {
            setNewBanner({ ...newBanner, image: dataUrl });
          }
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const handleSaveBanner = async () => {
    const bannerData = editingBanner || newBanner;
    if (!bannerData.image) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    try {
      if (isQuotaExceeded) {
        toast.error("কোটা শেষ হয়ে গেছে, আপাতত কোনো কিছু সেভ করা যাচ্ছে না।");
        return;
      }
      if (editingBanner?.id) {
        // Update existing
        await updateDoc(doc(db, "banners", editingBanner.id), {
          title: editingBanner.title || "",
          subtitle: editingBanner.subtitle || "",
          image: editingBanner.image,
          type: editingBanner.type || "hero",
          objectPosition: editingBanner.objectPosition || "50% 50%",
          linkedProductId: editingBanner.linkedProductId || "",
          titleFont: editingBanner.titleFont || "font-ador",
          titleWeight: editingBanner.titleWeight || "black",
          titleSize: editingBanner.titleSize || "text-2xl md:text-4xl",
          subtitleFont: editingBanner.subtitleFont || "font-ador",
          subtitleWeight: editingBanner.subtitleWeight || "bold",
          subtitleSize: editingBanner.subtitleSize || "text-sm md:text-base",
          updatedAt: new Date().toISOString(),
        });
        alert("ব্যানার আপডেট হয়েছে!");
      } else {
        // Add new
        await addDoc(collection(db, "banners"), {
          ...newBanner,
          title: newBanner.title || "",
          subtitle: newBanner.subtitle || "",
          type: newBanner.type || "hero",
          createdAt: new Date().toISOString(),
          order: activeBanners.length,
        });
        alert("ব্যানার যুক্ত হয়েছে!");
      }
      setEditingBanner(null);
      setNewBanner({
        title: "",
        subtitle: "",
        image: "",
        color: "bg-primary",
        objectPosition: "50% 50%",
        linkedProductId: "",
        titleFont: "font-ador",
        titleWeight: "black",
        titleSize: "text-2xl md:text-4xl",
        subtitleFont: "font-ador",
        subtitleWeight: "bold",
        subtitleSize: "text-sm md:text-base",
        type: "hero",
      });
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleSaveSiteConfig = async (config: any) => {
    if (!config) return;
    try {
      if (isQuotaExceeded) {
        toast.error("কোটা শেষ হয়ে গেছে, আপাতত কোনো কিছু সেভ করা যাচ্ছে না।");
        return;
      }
      await setDoc(doc(db, "config", "site"), {
        couponCode: config.couponCode,
        isCouponPublic: config.isCouponPublic,
        whatsappNumber: config.whatsappNumber,
        bkashNumber: config.bkashNumber,
        nagadNumber: config.nagadNumber,
        rocketNumber: config.rocketNumber,
        bankDetails: config.bankDetails,
        aboutUs: config.aboutUs,
        privacyPolicy: config.privacyPolicy,
        refundPolicy: config.refundPolicy,
        termsAndConditions: config.termsAndConditions,
        checkoutWarningText: config.checkoutWarningText || "",
        smsTemplateStart: config.smsTemplateStart || "",
        isSmsConfirmEnabled: config.isSmsConfirmEnabled !== undefined ? config.isSmsConfirmEnabled : true,
        smsTemplateEnd: config.smsTemplateEnd || "",
        supportPhone1: config.supportPhone1,
        supportPhone2: config.supportPhone2,
        facebookUrl: config.facebookUrl,
        isAiEnabled: config.isAiEnabled ?? false,
        isCodEnabled: config.isCodEnabled ?? true,
        isBkashEnabled: config.isBkashEnabled ?? true,
        isNagadEnabled: config.isNagadEnabled ?? true,
        isRocketEnabled: config.isRocketEnabled ?? true,
        isBankEnabled: config.isBankEnabled ?? true,
        updatedAt: new Date().toISOString(),
        geminiApiKey: "",
        steadfastApiKey: "",
        steadfastSecretKey: "",
        pathaoClientId: "",
        pathaoClientSecret: "",
        pathaoUsername: "",
        pathaoPassword: ""
      }, { merge: true });
      if (adminKeys) {
        await setDoc(doc(db, "admin_config", "keys"), {
          steadfastApiKey: adminKeys.steadfastApiKey || "",
          steadfastSecretKey: adminKeys.steadfastSecretKey || "",
          geminiApiKey: adminKeys.geminiApiKey || "",
          pathaoClientId: adminKeys.pathaoClientId || "",
          pathaoClientSecret: adminKeys.pathaoClientSecret || "",
          pathaoUsername: adminKeys.pathaoUsername || "",
          pathaoPassword: adminKeys.pathaoPassword || "",
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      alert("সেটিংস সফলভাবে আপডেট হয়েছে!");
    } catch (err: any) {
      console.error("Site Config Error:", err);
      const errMsg = err.response?.data?.error || err.message || err;
      alert("সেটিংস আপডেট করা সম্ভব হয়নি। এরর: " + errMsg);
    }
  };
  const handleDeleteBanner = async (id: any) => {
    console.log("Delete banner request for ID:", id);
    if (!id) {
      alert("⚠️ ব্যানার আইডি পাওয়া যায়নি, স্যার!");
      return;
    }
    const bannerId = String(id);
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই ব্যানারটি ডিলিট করতে চান, স্যার?");
    if (!conf) return;
    try {
      console.log("Log", bannerId);
      const bannerRef = doc(db, "banners", bannerId);
      await deleteDoc(bannerRef);
      console.log("Log", bannerId);
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      if (editingBanner && String(editingBanner.id) === bannerId) {
        setEditingBanner(null);
      }
    } catch (err: any) {
      console.error(" Banner delete error details:", err);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
  };
  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    try {
      const emailId = newAdminEmail.toLowerCase().trim();
      // Use email as doc ID for admin management if preferred, but rules need to match
      await setDoc(doc(db, "admins", emailId), {
        email: emailId,
        role: newAdminRole,
        password: newAdminPassword,
        phone: newAdminPhone,
        require2FA: true,
        addedBy: user?.email,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminPhone("");
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    try {
      await updateDoc(doc(db, "admins", editingAdmin.id), {
        role: editingAdmin.role,
        password: editingAdmin.password,
        phone: editingAdmin.phone || "",
        require2FA: editingAdmin.require2FA ?? false,
        updatedAt: new Date().toISOString(),
      });
      setEditingAdmin(null);
      alert("অ্যাডমিন আপডেট করা হয়েছে।");
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    }
  };
  const handleDeleteAdmin = async (id: any) => {
    if (!id) {
      alert("ইমেইল এবং পাসওয়ার্ড উভয়ই লিখুন।");
      return;
    }
    const adminId = String(id);
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই অ্যাডমিনকে ডিলিট করতে চান?");
    if (!conf) return;
    try {
      console.log("Deleting admin:", adminId);
      await deleteDoc(doc(db, "admins", adminId));
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err: any) {
      console.error("Admin delete error:", err);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
  };
  const handleAdminMultiImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if ((editingProduct?.images?.length || 0) + files.length > 6) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    Array.from(files).forEach(async (file: File) => {
      try {
        const options = {
          maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingProduct((prev: any) => {
            const currentImages = prev?.images || [];
            return {
              ...(prev || {}),
              images: [...currentImages, reader.result as string],
            } as any;
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
      }
    });
  };
  const removeImage = (index: number) => {
    const currentImages = editingProduct?.images || [];
    setEditingProduct({
      ...editingProduct,
      images: currentImages.filter((_, i) => i !== index),
    });
  };
  const handleVariantImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    variantIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Reduced to 200KB to fit Firestore 1MB limit
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev: any) => {
          const currentVariants = [...(prev?.variants || [])];
          if (currentVariants[variantIndex]) {
            currentVariants[variantIndex] = {
              ...currentVariants[variantIndex],
              image: reader.result as string,
            };
          }
          return { ...prev, variants: currentVariants };
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Variant image upload failed", error);
    }
  };
  const addVariant = () => {
    setEditingProduct((prev: any) => {
      const currentVariants = [...(prev?.variants || [])];
      return {
        ...prev,
        variants: [
          ...currentVariants,
          {
            id: Date.now().toString(),
            name: "",
            size: "",
            image: "",
            stock: 50,
            showExactStock: true,
          },
        ],
      };
    });
  };
  const removeVariant = (index: number) => {
    setEditingProduct((prev: any) => {
      const currentVariants = (prev?.variants || []).filter(
        (_: any, i: number) => i !== index,
      );
      return { ...prev, variants: currentVariants };
    });
  };
  const deleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteDoc(doc(db, "campaigns", id));
      toast.success("Campaign deleted");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `campaigns/${id}`);
    }
  };
  const saveCampaign = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCampaign?.name || !editingCampaign?.slug) {
      toast.error("সঠিক Slug প্রয়োজন (শুধুমাত্র ছোট অক্ষর, সংখ্যা এবং ড্যাশ)");
      return;
    }
    
    // Validation
    if (!editingCampaign?.name) {
      toast.error("ক্যাম্পেইন নাম প্রয়োজন");
      return;
    }
    if (!editingCampaign?.slug || !/^[a-z0-9-]+$/.test(editingCampaign.slug)) {
      toast.error("সঠিক Slug প্রয়োজন (শুধুমাত্র ছোট অক্ষর, সংখ্যা এবং ড্যাশ)");
      return;
    }
    if (!editingCampaign?.image) {
      toast.error("ব্যানার ইমেজ প্রয়োজন");
      return;
    }
    // Generate slug from name if not provided (though we required it)
    const slug = editingCampaign.slug.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    try {
      const campaignData = {
        ...editingCampaign,
        slug,
        updatedAt: new Date().toISOString(),
        isActive: editingCampaign.isActive !== undefined ? editingCampaign.isActive : true,
        productIds: editingCampaign.productIds || [],
      };
      
      if (editingCampaign.id) {
        await updateDoc(doc(db, "campaigns", editingCampaign.id), campaignData);
        toast.success("Campaign updated successfully");
      } else {
        await addDoc(collection(db, "campaigns"), {
          ...campaignData,
          createdAt: new Date().toISOString(),
        });
        toast.success("Campaign created successfully");
      }
      setEditingCampaign(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "campaigns");
    }
  };
  const handleDuplicateProduct = (p: Product) => {
    // Scroll to form to show user where to edit
    const formElement = document.getElementById("field-name");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Clone the product but clear the ID to make it new
    setEditingProduct({
      ...p,
      id: "", // Important: reset ID so it's treated as a new product
      name: `${p.name} (কপি)`, // Append Bengali 'Copy'
      code: p.code ? `${p.code}-copy-${Math.floor(Math.random() * 10000)}` : "", // Codes should be unique
      variants: (p.variants || []).map(v => ({
        ...v,
        id: Math.random().toString(36).substring(2, 9)
      })),
      createdAt: null,
      updatedAt: null,
      rating: 0,
      reviewCount: 0,
      likes: 0,
      reviews: []
    });
    
    toast.success("প্রোডাক্ট কপি করা হয়েছে। এখন তথ্য পরিবর্তন করে সেভ করুন।");
  };
  const [arrivalIndex, setArrivalIndex] = useState(0);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [featuredScrollPercent, setFeaturedScrollPercent] = useState(0);
  
  const handleFeaturedScroll = () => {
    if (featuredScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuredScrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      const percent = totalScrollable > 0 ? (scrollLeft / totalScrollable) * 100 : 0;
      setFeaturedScrollPercent(percent);
    }
  };
  const handleFeaturedSliderChange = (percent: number) => {
    if (featuredScrollRef.current) {
      const { scrollWidth, clientWidth } = featuredScrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      featuredScrollRef.current.scrollLeft = (percent / 100) * totalScrollable;
    }
  };
  useEffect(() => {
    if (newArrivals.length <= 1) return;
    const timer = setInterval(() => {
      setArrivalIndex((prev) => {
        const itemsToShow = window.innerWidth < 768 ? 1 : 5;
        const maxIndex = Math.max(0, newArrivals.length - itemsToShow);
        if (maxIndex <= 0) return 0;
        return (prev + 1) > maxIndex ? 0 : prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [newArrivals.length]);
  // Featured Products slider logic removed as per user request (manual scroll)
  const saveProduct = async (e: FormEvent) => {
    e.preventDefault();
    // Validation
    const errors: Record<string, boolean> = {};
    if (!editingProduct?.name) errors.name = true;
    if (!editingProduct?.price) errors.price = true;
    if (!editingProduct?.image) errors.image = true;
    if (!editingProduct?.category) errors.category = true;
    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      const firstErrorId = `field-${Object.keys(errors)[0]}`;
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setProductFormErrors({});
    try {
      // Check for duplicate code
      if (editingProduct.code?.trim()) {
        const q = query(
          collection(db, "products"),
          where("code", "==", editingProduct.code.trim()),
          where("deleted", "==", false)
        );
        const querySnapshot = await getDocs(q);
        const existingDocs = querySnapshot.docs.filter(doc => doc.id !== editingProduct.id);
        if (existingDocs.length > 0) {
          alert("এই কোড নাম্বার দিয়ে ইতিমধ্যে একটি প্রোডাক্ট আছে। দয়া করে অন্য একটি কোড ব্যবহার করুন।");
          setProductFormErrors(prev => ({ ...prev, code: true }));
          return;
        }
      }
      // Create a clean object without the 'id' field for new products
      const productData: any = {
        name: editingProduct.name,
        code: editingProduct.code?.trim() || "",
        price: Number(editingProduct.price),
        buyingPrice: Number(editingProduct.buyingPrice || 0),
        originalPrice: Number(
          editingProduct.originalPrice || editingProduct.price,
        ),
        discount: editingProduct.originalPrice
          ? Math.round(
              ((editingProduct.originalPrice - editingProduct.price) /
                (editingProduct.originalPrice || 1)) *
                100,
            )
          : 0,
        image: editingProduct.image,
        category: editingProduct.category,
        description: editingProduct.description || "",
        tags: editingProduct.tags || "",
        videoUrl: editingProduct.videoUrl || "",
        brand: editingProduct.brand || "",
        images: editingProduct.images || [],
        variants: editingProduct.variants || [],
        wholesaleTiers: editingProduct.wholesaleTiers || [],
        weight: Number(editingProduct.weight || 0),
        unit: editingProduct.unit || "piece",
        smsName: editingProduct.smsName || "",
        colors: editingProduct.colors || [],
        stock: Number(editingProduct.stock || 0),
        isTrending: !!editingProduct.isTrending,
        isFreeDelivery: !!editingProduct.isFreeDelivery,
        isComingSoon: !!editingProduct.isComingSoon,
        isFlashSale: !!editingProduct.isFlashSale,
        isPublished: editingProduct.isPublished !== false,
        flashSaleEndDate: editingProduct.flashSaleEndDate || "",
        createdAt: editingProduct.id
          ? editingProduct.createdAt
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      };
      // Safeguard against 1MB firestore limit
      const estimatedSize = JSON.stringify(productData).length;
      if (estimatedSize > 950000) {
        alert("ছবিগুলোর সাইজ অনেক বড় (১ মেগাবাইটের বেশি)। দয়া করে ছোট সাইজের ছবি ব্যবহার করুন অথবা কিছু ছবি বাদ দিন।");
        return;
      }
      if (editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        
        // Optimistic Update for Quota issues
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id ? { ...productData, id: p.id } as Product : p
        );
        setProducts(updatedProducts);
        localStorage.setItem("cached_products", JSON.stringify(updatedProducts));
        setEditingProduct(null);
        if (e.target) (e.target as HTMLFormElement).reset();
        alert("প্রোডাক্ট আপডেট সফল হয়েছে!");
      } else {
        const docRef = await addDoc(collection(db, "products"), productData);
        
        // Optimistic Update for Quota issues
        const newProducts = [{ ...productData, id: docRef.id } as Product, ...products];
        setProducts(newProducts);
        localStorage.setItem("cached_products", JSON.stringify(newProducts));
        setEditingProduct(null);
        if (e.target) (e.target as HTMLFormElement).reset();
        alert("প্রোডাক্ট যুক্ত হয়েছে!");
      }
    } catch (err: any) {
      console.error("Save product failed", err);
      const isQuota = err.message?.includes("Quota exceeded") || err.message?.includes("quota") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      if (err.code === "permission-denied") {
        alert("আপনার এই ডাটা পরিবর্তন করার পারমিশন নেই। দয়া করে পেজটি রিলোড করে আবার চেক করুন।");
      } else if (isQuota) {
        alert("সার্ভারের অর্ডার/ডাটা কোটা শেষ হয়ে গেছে।");
      } else {
        alert("ডাটা সেভ করতে সমস্যা হয়েছে: " + (err.message || "Unknown error"));
      }
    }
  };
  const handleLikeProduct = useCallback(async (productId: string) => {
    if (isQuotaExceeded) return;
    // Prevent multiple simultaneous calls for the same product
    if (likeInProgressRef.current.has(productId)) return;
    likeInProgressRef.current.add(productId);
    // Always read latest value via ref  avoids stale closure bugs
    const isAlreadyLiked = likedProductsRef.current.includes(productId);
    const likeDiff = isAlreadyLiked ? -1 : 1;
    // Optimistic UI update immediately
    setLikedProducts(prev => {
      const next = isAlreadyLiked
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem("ishopbd_liked_products", JSON.stringify(next));
      return next;
    });
    setSelectedProduct(prev => {
      if (prev && prev.id === productId) {
        return { ...prev, likes: Math.max(0, (prev.likes || 0) + likeDiff) };
      }
      return prev;
    });
    setProducts(prev => prev.map(p =>
      p.id === productId
        ? { ...p, likes: Math.max(0, (p.likes || 0) + likeDiff) }
        : p
    ));
    try {
      await updateDoc(doc(db, "products", productId), {
        likes: increment(likeDiff),
      });
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          likedProducts: isAlreadyLiked ? arrayRemove(productId) : arrayUnion(productId),
        }).catch(err => {
          console.warn("Failed to sync likedProducts to user profile", err);
        });
      }
    } catch (err: any) {
      // Revert optimistic update on failure
      setLikedProducts(prev => {
        const reverted = isAlreadyLiked
          ? [...prev, productId]
          : prev.filter(id => id !== productId);
        localStorage.setItem("ishopbd_liked_products", JSON.stringify(reverted));
        return reverted;
      });
      setSelectedProduct(prev => {
        if (prev && prev.id === productId) {
          return { ...prev, likes: Math.max(0, (prev.likes || 0) - likeDiff) };
        }
        return prev;
      });
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? { ...p, likes: Math.max(0, (p.likes || 0) - likeDiff) }
          : p
      ));
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    } finally {
      likeInProgressRef.current.delete(productId);
    }
  }, [isQuotaExceeded, user]);
  const handleRatingProduct = async (productId: string, rating: number) => {
    if (isQuotaExceeded) return;
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        const currentRating = data.rating || 0;
        const currentCount = data.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + rating) / newCount;
        await updateDoc(productRef, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount,
        });
      }
    } catch (err: any) {
      console.error("Failed to rate product", err);
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  };
  const deleteProduct = async (id: any) => {
    console.log("Delete product attempt for ID:", id);
    if (!id) {
      alert("⚠️ অ্যাডমিন আইডি পাওয়া যায়নি, স্যার।");
      return;
    }
    const productId = String(id);
    const conf = window.confirm("⚠️ আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান, স্যার?");
    if (!conf) return;
    try {
      console.log("Log", productId);
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      console.log("Log", productId);
      
      // Optimistic delete for cache/quota issues
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem("cached_products", JSON.stringify(updatedProducts));
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      if (editingProduct && String(editingProduct.id) === productId) {
        setEditingProduct(null);
      }
    } catch (err: any) {
      console.error(" Product delete error details:", err);
      const isQuota = err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else if (isQuota) {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
  };
  const togglePublishStatus = async (product: Product) => {
    const newStatus = product.isPublished === false;
    try {
      await updateDoc(doc(db, "products", product.id), {
        isPublished: newStatus,
        updatedAt: serverTimestamp()
      });
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, isPublished: newStatus } : p
      );
      setProducts(updatedProducts);
      localStorage.setItem("cached_products", JSON.stringify(updatedProducts));
      toast.success(newStatus ? "পণ্যটি ওয়েবসাইটে দেখাবে (পাবলিশড)" : "পণ্যটি হাইড করা হয়েছে (আনপাবলিশড)");
    } catch (err: any) {
      const isQuota = err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED";
      if (isQuota) setIsQuotaExceeded(true);
      console.error("Toggle publish status error:", err);
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };
  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name: editingCategory.name,
        });
      } else {
        await setDoc(doc(collection(db, "categories")), {
          name: editingCategory.name,
          createdAt: new Date().toISOString(),
        });
      }
      setEditingCategory(null);
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err) {
      console.error("Save category failed", err);
    }
  };
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const deleteCategory = async (id: any, name: string) => {
    if (!id) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    const categoryId = String(id);
    console.log("Log", { id, categoryId, name });
    
    const conf = window.confirm(`আপনি কি "${name}" ক্যাটাগরি ডিলিট করতে চান?`);
    if (!conf) {
      console.log(" Deletion cancelled by user");
      return;
    }
    setDeletingCatId(categoryId);
    try {
      console.log("Log" + categoryId);
      const docRef = doc(db, "categories", categoryId);
      await deleteDoc(docRef);
      console.log("Log");
      
      // Manual state update as fallback for slow snapshot
      setCategories((prev) => prev.filter((c) => String(c.id) !== categoryId));
      
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      if (editingCategory && String(editingCategory.id) === categoryId) {
        setEditingCategory(null);
      }
    } catch (err: any) {
      console.error(" Category delete error details:", err);
      if (err.code === "permission-denied") {
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    } finally {
      setDeletingCatId(null);
    }
  };
  // Auth & Profile Listener
  useEffect(() => {
    // This listener is now handled in the setup effect to avoid duplication
  }, []);
  const [editingUserBalance, setEditingUserBalance] = useState<any | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const handleEditUserBalance = (u: any) => {
    setEditingUserBalance(u);
    setNewBalanceInput(String(u.balance || 0));
  };
  const confirmBalanceUpdate = async () => {
    if (!editingUserBalance) return;
    const u = editingUserBalance;
    const userId = u.id || u.uid;
    const amountStr = newBalanceInput;
    
    if (amountStr !== "" && !isNaN(Number(amountStr))) {
      const newBalance = Number(amountStr);
      const currentBalance = Number(u.balance) || 0;
      
      setIsSyncingData(true);
      try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { 
          balance: newBalance,
          updatedAt: serverTimestamp()
        });
        // Add an adjustment transaction
        try {
          await addDoc(collection(db, "transactions"), {
            userId: userId,
            amount: newBalance - currentBalance,
            type: "adjustment",
            description: "Admin manual balance adjustment",
            createdAt: new Date().toISOString(),
            status: "completed"
          });
        } catch (txErr) {
          console.warn("Transaction log failed:", txErr);
          // Don't fail the whole operation if just the log fails
        }
        setUserList(prev => prev.map(usr => (usr.id === userId || usr.uid === userId) ? {...usr, balance: newBalance} : usr));
        toast.success("ব্যালেন্স আপডেট সফল হয়েছে।");
        setEditingUserBalance(null);
      } catch (err) {
        console.error("Balance update error:", err);
        toast.error("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।");
        try {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
        } catch (e) {
          // ignore re-throw
        }
      } finally {
        setIsSyncingData(false);
      }
    } else {
      toast.error("সঠিক সংখ্যা লিখুন।");
    }
  };
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "signup">("login");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unseenNotifCount, setUnseenNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userListSearch, setUserListSearch] = useState("");
  const [isSendingBulkNotif, setIsSendingBulkNotif] = useState(false);
  const [bulkNotifForm, setBulkNotifForm] = useState({ title: "", message: "", link: "" });
  // Bulk SMS State
  const [bulkSmsSelectedPhones, setBulkSmsSelectedPhones] = useState<Set<string>>(new Set());
  const [bulkSmsPage, setBulkSmsPage] = useState(0);
  const [bulkSmsSearch, setBulkSmsSearch] = useState("");
  const [bulkSmsMessage, setBulkSmsMessage] = useState("");
  const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);
  const [bulkSmsResult, setBulkSmsResult] = useState<{ successCount: number; failCount: number; total: number } | null>(null);
  const [bulkSmsProgress, setBulkSmsProgress] = useState<{ batchNum: number; totalBatches: number; sent: number; failed: number; total: number } | null>(null);
  // Individual SMS State
  const [individualSmsOrder, setIndividualSmsOrder] = useState<any>(null);
  const [individualSmsMessage, setIndividualSmsMessage] = useState("");
  const [isSendingIndividualSms, setIsSendingIndividualSms] = useState(false);
  const BULK_SMS_PAGE_SIZE = 100;
  // Notifications Listener
  const isInitialNotifLoad = useRef(true);
  
  const sendPushToUser = async (userId: string, title: string, body: string, link: string = '/') => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const token = userDoc.data().fcmToken;
        if (token) {
          await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, title, body, link })
          });
        }
      }
    } catch (e) {
      console.warn("Push error:", e);
    }
  };
  const playNotifSound = () => {
    const audio = new Audio(NOTIF_SOUND_URL);
    audio.play().catch(e => console.log("Sound play error:", e));
  };
  useEffect(() => {
    if (!user || isQuotaExceeded) return;
    const isMaster = masterEmails.includes(user.email || "");
    if (!isMaster && !isAdmin) return; 
    // Users listener for admin management
    setIsUsersLoading(true);
    const q = query(collection(db, "users"), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      setUserList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsUsersLoading(false);
    }, (err) => {
      if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
        setIsQuotaExceeded(true);
      }
      console.warn("Users sync error:", err.message);
      setIsUsersLoading(false);
    });
    return () => unsub();
  }, [user, isAdmin, isQuotaExceeded]);
  useEffect(() => {
    if (isQuotaExceeded) return;
    // Determine target user IDs for notifications
    const targetUserIds = ["all"];
    if (user?.uid) {
      targetUserIds.push(user.uid);
    }
    const unsubNotifs = onSnapshot(
      query(
        collection(db, "notifications"), 
        where("userId", "in", targetUserIds),
        orderBy("createdAt", "desc"), 
        limit(20)
      ),
      (snapshot) => {
        const notifs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        
        if (!isInitialNotifLoad.current && snapshot.docChanges().length > 0) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newNotif: any = change.doc.data();
              if (!newNotif.userId || newNotif.userId === user.uid) {
                playNotifSound();
                toast.success(newNotif.title || "নিরাপদ শপ বিডি থেকে নতুন নোটিফিকেশন!", {
                  icon: "",
                  duration: 6000,
                  position: "top-right"
                });
              }
            }
          });
        }
        
        const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
        let dismissed: string[] = [];
        try { dismissed = JSON.parse(dismissedStr); } catch(e){}
        const filteredNotifs = notifs.filter(n => !dismissed.includes(n.id));
        setNotifications(filteredNotifs);
        isInitialNotifLoad.current = false;
        
        const lastCheck = userProfile?.lastNotifCheck ? new Date(userProfile.lastNotifCheck).getTime() : (localStorage.getItem("lastNotifCheck") ? Number(localStorage.getItem("lastNotifCheck")) : Date.now() - 86400000); // Default to last 24h for guests
        const unseen = notifs.filter((n: any) => {
          const createdAt = n.createdAt?.seconds ? n.createdAt.seconds * 1000 : (n.createdAt ? new Date(n.createdAt).getTime() : Date.now());
          return createdAt > lastCheck;
        }).length;
        setUnseenNotifCount(unseen);
      },
      (err) => {
        if (err.code !== "permission-denied") {
          handleFirestoreError(err, OperationType.GET, "notifications");
        }
      }
    );
    return () => {
      unsubNotifs();
    };
  }, [user, userProfile?.lastNotifCheck, isAdmin, masterEmails, isQuotaExceeded]);
  const handleDismissNotification = (id: string) => {
    const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(dismissedStr); } catch(e){}
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem('dismissedNotifs', JSON.stringify(dismissed));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnseenNotifCount(prev => Math.max(0, prev - 1));
    toast.success("নোটিফিকেশন মুছে ফেলা হয়েছে");
  };
  const handleClearAllNotifications = () => {
    const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
    let dismissed: string[] = [];
    try { dismissed = JSON.parse(dismissedStr); } catch(e){}
    const allIds = notifications.map(n => n.id);
    const updatedDismissed = Array.from(new Set([...dismissed, ...allIds]));
    localStorage.setItem('dismissedNotifs', JSON.stringify(updatedDismissed));
    setNotifications([]);
    setUnseenNotifCount(0);
    toast.success("সব নোটিফিকেশন মুছে ফেলা হয়েছে");
  };
  const handleSendBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNotifForm.title || !bulkNotifForm.message) return;
    
    setIsSendingBulkNotif(true);
    try {
      await addDoc(collection(db, "notifications"), {
        ...bulkNotifForm,
        userId: "all",
        createdAt: serverTimestamp(),
        sender: user?.email,
        type: "broadcast"
      });
      setBulkNotifForm({ title: "", message: "", link: "" });
      alert("নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!");
    } catch (err) {
      console.error("Bulk notification error:", err);
      alert("নোটিফিকেশন পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setIsSendingBulkNotif(false);
    }
  };
  const handleSendDirectNotification = async (targetUserId: string, targetUserEmail: string) => {
    const title = window.prompt("নোটিফিকেশনের শিরোনাম দিন:");
    if (!title) return;
    const message = window.prompt("বিস্তারিত মেসেজ লিখুন:");
    if (!message) return;
    const link = window.prompt("লিঙ্ক বা প্রোডাক্ট আইডি দিন (Link/ID):", "");
    try {
      await addDoc(collection(db, "notifications"), {
        title,
        message,
        link: link || "",
        userId: targetUserId,
        userEmail: targetUserEmail,
        createdAt: serverTimestamp(),
        sender: user?.email,
        type: "direct"
      });
      alert("মেসেজ সফলভাবে পাঠানো হয়েছে!");
    } catch (err) {
      console.error("Direct notification error:", err);
      alert("ব্যানার যুক্ত হয়েছে!");
    }
  };
  // Bulk SMS: Extract unique phone numbers from all orders
  const allOrderPhones = useMemo(() => {
    const phoneSet = new Set<string>();
    orderHistory.forEach((order: any) => {
      const phone = order.customerPhone;
      if (phone && phone.trim().length >= 11) {
        phoneSet.add(phone.trim());
      }
    });
    return Array.from(phoneSet);
  }, [orderHistory]);
  const handleSendIndividualSms = async () => {
    if (!individualSmsOrder || !individualSmsMessage.trim()) return;
    setIsSendingIndividualSms(true);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: individualSmsOrder.customerPhone || individualSmsOrder.phone,
          message: individualSmsMessage
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("SMS সফলভাবে পাঠানো হয়েছে!");
        setIndividualSmsOrder(null);
        setIndividualSmsMessage("");
      } else {
        alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      alert("Error sending SMS: " + err.message);
    } finally {
      setIsSendingIndividualSms(false);
    }
  };
  const handleSendBulkSms = async () => {
    if (bulkSmsSelectedPhones.size === 0) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    if (!bulkSmsMessage.trim()) {
      alert("ইমেজ প্রয়োজন!");
      return;
    }
    if (!confirm(`আমরা ক? ${bulkSmsSelectedPhones.size}টিতে SMS পাঠাতে চালু\n\nমেসেজ : ${bulkSmsMessage}`)) return;
    setIsSendingBulkSms(true);
    setBulkSmsResult(null);
    setBulkSmsProgress(null);
    try {
      // Use fetch + ReadableStream to read SSE progress events
      const response = await fetch("/api/send-bulk-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phones: Array.from(bulkSmsSelectedPhones),
          message: bulkSmsMessage
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Server error");
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE format: "data: {...}\n\n"
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "").trim();
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine);
              if (event.type === "start") {
                setBulkSmsProgress({ batchNum: 0, totalBatches: event.totalBatches, sent: 0, failed: 0, total: event.total });
              } else if (event.type === "progress" || event.type === "batch_done") {
                setBulkSmsProgress({ batchNum: event.batchNum, totalBatches: event.totalBatches, sent: event.sent, failed: event.failed, total: event.total || bulkSmsSelectedPhones.size });
              } else if (event.type === "done") {
                setBulkSmsResult({ successCount: event.successCount, failCount: event.failCount, total: event.total });
                setBulkSmsProgress(null);
                if (event.successCount > 0) toast.success(`${event.successCount}টা SMS সফলভাবে পাঠানো হয়েছে!`);
                if (event.failCount > 0) toast.error(`${event.failCount}টা SMS পাঠাতে ব্যর্থ হয়েছে?`);
              }
            } catch (_) {}
          }
        }
      }
    } catch (err: any) {
      console.error("Bulk SMS error:", err);
      toast.error("SMS পাঠাতে সমস্যা হয়েছে: " + (err.message || "অজানা ত্রুটি"));
      setBulkSmsProgress(null);
    } finally {
      setIsSendingBulkSms(false);
    }
  };
  const handleCheckNotifications = async () => {
    setIsNotifOpen(true);
    setUnseenNotifCount(0);
    if (userProfile?.uid && !isQuotaExceeded) {
      try {
        await updateDoc(doc(db, "users", userProfile.uid), {
          lastNotifCheck: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.message === "QUOTA_EXCEEDED") setIsQuotaExceeded(true);
        console.error("Update lastNotifCheck error:", err);
      }
    }
  };
  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      let email = authIdentifier.trim().toLowerCase();
      
      // If it's a phone number (just digits), convert to a dummy email for Firebase Auth
      const isPhone = /^\d+$/.test(email);
      if (isPhone) {
        if (email.length < 10) {
          throw new Error("সঠিক ফোন নাম্বার দিন।");
        }
        email = `${email}@mobile.user`;
      } else {
        if (!email.includes("@")) {
          throw new Error("সঠিক ইমেইল বা ফোন নাম্বার দিন।");
        }
      }
      if (authModalType === "signup") {
        if (!authName) throw new Error("আপনার নাম লিখুন।");
        if (authPassword.length < 6) throw new Error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
        
        const userCred = await createUserWithEmailAndPassword(auth, email, authPassword);
        // On signup, update display name
        await updateProfile(userCred.user, {
           displayName: authName
        });
        
        // Also ensure user doc is created (though there is a listener in the setup effect, 
        // sometimes it's good to be explicit or the listener will catch it)
      } else {
        await signInWithEmailAndPassword(auth, email, authPassword);
      }
      
      setIsAuthModalOpen(false);
      setAuthIdentifier("");
      setAuthPassword("");
      setAuthName("");
    } catch (err: any) {
      console.error("Auth failed:", err);
      let msg = "অথেন্টিকেশন ব্যর্থ হয়েছে।";
      if (err.code === "auth/user-not-found") msg = "এই একাউন্টটি পাওয়া যায়নি।";
      else if (err.code === "auth/wrong-password") msg = "ভুল পাসওয়ার্ড।";
else if (err.code === "auth/email-already-in-use") msg = "ইমেইল/ফোন ইতিমধ্যে ব্যবহৃত হচ্ছে।";
      else msg = err.message || msg;
      setAuthError(msg);
      alert(msg);
    } finally {
      setIsAuthLoading(false);
    }
  };
  const handleLogin = async (
    providerType: "google" | "facebook" = "google",
  ) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const provider =
        providerType === "google" ? googleProvider : facebookProvider;
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login failed:", err);
      let errorMsg = "লগইন করতে সমস্যা হয়েছে।";
      if (err.code === "auth/popup-blocked") {
        errorMsg =
          "পপআপ ব্লক করা হয়েছে! অনুগ্রহ করে ব্রাউজারের পপআপ পারমিশন দিন।";
      } else if (err.code === "auth/unauthorized-domain") {
        errorMsg = "এই ডোমেইনটি (Domain) অথরাইজড নয়। Firebase Console -> Authentication -> Settings -> Authorized Domains-এ আপনার ডোমেইনটি যোগ করুন।";
      }
      setAuthError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Save to Firestore
        const userRef = doc(db, "users", user.uid);
        try {
          await updateDoc(userRef, {
            photoURL: base64data
          });
          
          // Update local state if needed
          setUserProfile((prev: any) => prev ? { ...prev, photoURL: base64data } : { photoURL: base64data });
          alert("প্রোফাইল ছবি আপডেট হয়েছে!");
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.UPDATE, `users/${user.uid}`);
          alert("ডাটাবেজে ছবি সেভ করতে সমস্যা হয়েছে।");
        }
      };
    } catch (error) {
      console.error("Profile image upload error:", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    }
  };
  const handleLogout = async () => {
    try {
      if (user) {
        localStorage.removeItem(`admin_verified_${user.uid}`);
        sessionStorage.removeItem(`admin_verified_${user.uid}`);
      }
      await signOut(auth);
      setIsProfileOpen(false);
      setIsAdminVerified(false);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("500");
  const [depositMethod, setDepositMethod] = useState<
    "bkash" | "nagad" | "bank"
  >("bkash");
  const [depositTrxId, setDepositTrxId] = useState("");
  const handleDepositSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    if (!depositTrxId) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    setIsPaymentSimulating(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: user.uid,
        amount,
        type: "deposit",
        method: depositMethod,
        trxId: depositTrxId,
        description: `Wallet Deposit via ${depositMethod.toUpperCase()}`,
        status: "completed",
        createdAt: new Date().toISOString(),
      });
      await updateDoc(userRef, {
        balance: (userProfile.balance || 0) + amount,
        updatedAt: serverTimestamp(),
      });
      setIsDepositModalOpen(false);
      setDepositTrxId("");
      alert(`${amount} টাকা আপনার ওয়ালেটে সফলভাবে যোগ করা হয়েছে!`);
    } catch (err) {
      console.error("Deposit failed", err);
      alert("টাকা জমা দিতে সমস্যা হয়েছে।");
    } finally {
      setIsPaymentSimulating(false);
    }
  };
// Remove unused client-side SDK initialization
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const saveChatMessage = async (chatId: string, newMessage: any, lastMessageText: string) => {
    const chatPath = `support_chats/${chatId}`;
    const chatRef = doc(db, "support_chats", chatId);
    try {
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          userId: chatId,
          userName: userProfile?.displayName || "Guest",
          lastMessage: lastMessageText,
          lastMessageAt: new Date().toISOString(),
          unreadByAdmin: true,
          messages: [{
            ...newMessage,
            id: newMessage.id || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
            reactions: newMessage.reactions || {}
          }],
        });
      } else {
        await updateDoc(chatRef, {
          messages: arrayUnion(newMessage),
          lastMessage: lastMessageText,
          lastMessageAt: new Date().toISOString(),
          unreadByAdmin: true,
        });
      }
    } catch (err: any) {
      console.error("Save chat message error:", err);
      handleFirestoreError(err, OperationType.WRITE, chatPath);
    }
  };
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (isQuotaExceeded) {
      toast.error("কোটা শেষ হয়ে গেছে, আপাতত কোনো কিছু সেভ করা যাচ্ছে না।");
      return;
    }
    const userText = chatMessage;
    const chatId = user?.uid || sessionId;
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: userText,
      replyTo: chatReplyingTo ? (chatReplyingTo.text || "Media") : null,
      senderId: chatId,
      senderName: userProfile?.displayName || "Customer",
      isAdmin: false,
      createdAt: new Date().toISOString(),
      reactions: {}
    };
    setChatMessage("");
    setChatReplyingTo(null);
    try {
      await saveChatMessage(chatId, newMessage, userText);
    } catch (err: any) {
      toast.error("মেসেজ পাঠাতে সমস্যা হয়েছে।");
      return;
    }
    try {
      if (!siteConfig?.isAiEnabled || !adminKeys?.geminiApiKey) {
        return; // Don't reply if AI is disabled or missing key
      }
      // Format history for Gemini Direct API
      const rawContents = (chatMessages || []).map((m: any) => ({
        role: m.isAdmin ? "model" : "user",
        parts: [{ text: m.text || "(Media)" }]
      }));
      rawContents.push({ role: "user", parts: [{ text: userText || "(Media)" }] });
      const aiPrompt = `You are a helpful customer support AI for an e-commerce shop in Bangladesh called 'i SHOP BD'. Answer briefly and politely in Bengali.
      
Shop Info:
- Support Phone: ${siteConfig?.supportPhone1 || "01777-600844"}
- Delivery: Inside Dhaka 60 Tk, Outside Dhaka 120 Tk. (Usually 1-3 days).
Available Products:
${products.map(p => `- ${p.name}: ৳${p.price} (Stock: ${p.stock > 0 ? 'Yes' : 'No'})`).join('\n')}
Rules:
1. Answer price/stock questions based on the list above.
2. Tell users to click "Order Now" on the product page to buy.
3. If you don't know, ask them to call the support number.`;
      const contents: { role: string; parts: { text: string }[] }[] = [];
      contents.push({ role: "user", parts: [{ text: aiPrompt }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will act as the customer support AI and follow these instructions in Bengali." }] });
      for (const msg of rawContents) {
        if (contents.length > 0 && contents[contents.length - 1].role === msg.role) {
          contents[contents.length - 1].parts[0].text += "\\n" + msg.parts[0].text;
        } else {
          contents.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
        }
      }
      
      let finalContents = contents;
      if (finalContents.length > 12) {
        const sys = finalContents.slice(0, 2);
        let history = finalContents.slice(-10);
        if (history[0].role === "model") {
          history.shift();
        }
        finalContents = [...sys, ...history];
      }
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${adminKeys?.geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: finalContents
        })
      });
      
      const data = await response.json();
      let aiResponseText = "দুঃখিত, আমি এই প্রশ্নের উত্তর দিতে পারছি না।";
      if (data && data.error) {
        console.error("Gemini API Error:", data.error);
        aiResponseText = `Error: ${data.error.message}`;
      } else if (data && data.candidates && data.candidates.length > 0) {
        aiResponseText = data.candidates[0].content.parts[0].text;
      }
      const aiMessage = {
        id: "ai_" + Date.now().toString(),
        text: aiResponseText,
        senderId: "ai_assistant",
        senderName: "i SHOP BD AI",
        isAdmin: true,
        createdAt: new Date().toISOString(),
        reactions: {}
      };
      const chatRef = doc(db, "support_chats", chatId);
      try {
        await updateDoc(chatRef, {
          messages: arrayUnion(aiMessage),
          lastMessage: aiResponseText,
          lastMessageAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Gemini AI Firestore update error:", err);
        handleFirestoreError(err, OperationType.UPDATE, `support_chats/${chatId}`);
      }
    } catch (err: any) {
      console.error("Gemini AI generation error:", err);
    }
  };
  const selectChat = async (chat: any) => {
    setSelectedChat(chat);
    if (chat.unreadByAdmin) {
      try {
        const chatRef = doc(db, "support_chats", chat.id);
        await updateDoc(chatRef, { unreadByAdmin: false });
      } catch (err) {
        console.error("Error clearing unread flag:", err);
        handleFirestoreError(err, OperationType.UPDATE, `support_chats/${chat.id}`);
      }
    }
  };
  const handleAdminReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedChat) return;
    const replyText = replyMessage;
    const chatRef = doc(db, "support_chats", selectedChat.id);
    const newMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: replyText,
      replyTo: adminReplyingTo ? (adminReplyingTo.text || "Media") : null,
      senderId: user?.uid,
      senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
      isAdmin: true,
      createdAt: new Date().toISOString(),
      reactions: {}
    };
    setReplyMessage("");
    setAdminReplyingTo(null);
    try {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        lastMessage: replyText,
        lastMessageAt: new Date().toISOString(),
        unreadByUser: true,
        unreadByAdmin: false,
      });
    } catch (err) {
      console.error("Admin reply error:", err);
    }
  };
  const handleToggleReaction = async (chatId: string, msgIndex: number, reaction: "love" | "like") => {
    try {
      const chatRef = doc(db, "support_chats", chatId);
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) return;
      const data = chatDoc.data();
      const messages = [...(data.messages || [])];
      
      if (!messages[msgIndex]) return;
      const msg = { ...messages[msgIndex] };
      if (!msg.reactions) msg.reactions = {};
      
      msg.reactions[reaction] = !msg.reactions[reaction];
      messages[msgIndex] = msg;
      await updateDoc(chatRef, { messages });
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };
  const handleVoiceToggle = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
        // Stop all tracks to release microphone
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        
        // Check for supported mime types for better cross-browser compatibility
        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
          "audio/aac"
        ];
        const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
        
        const recorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : {});
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = async () => {
          if (chunks.length === 0) return;
          
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            const chatId = user?.uid || sessionId;
            const newMessage = {
              audio: base64Audio,
              senderId: chatId,
              senderName: userProfile?.displayName || "Customer",
              isAdmin: false,
              createdAt: new Date().toISOString(),
            };
            await saveChatMessage(chatId, newMessage, "ভয়েস মেসেজ (Voice Message)");
            const aiMessage = {
              text: "আপনার সঅ্যাডমিন Sা । মরা Sপেইজ? পেইজআপনার পেজগ্রাহকরব।",
              senderId: "ai_assistant",
              senderName: "i SHOP BD AI",
              isAdmin: true,
              createdAt: new Date().toISOString(),
            };
            const chatRef = doc(db, "support_chats", chatId);
            await updateDoc(chatRef, {
              messages: arrayUnion(aiMessage),
            });
          };
        };
        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      }
    }
  };
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const options = {
        maxSizeMB: 0.2, // Max 200KB for chat images
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        
        const chatId = user?.uid || sessionId;
        const newMessage = {
          image: url,
          senderId: chatId,
          senderName: userProfile?.displayName || "Customer",
          isAdmin: false,
          createdAt: new Date().toISOString(),
        };
        await saveChatMessage(chatId, newMessage, "Image Message");
        const aiMessage = {
          text: "আপনার ভয়েস মেসেজ পাওয়া গেছে। আমরা শীঘ্রই এটি শুনে আপনার সাথে যোগাযোগ করব।",
          senderId: "ai_assistant",
          senderName: "i SHOP BD AI",
          isAdmin: true,
          createdAt: new Date().toISOString(),
        };
        const chatRef = doc(db, "support_chats", chatId);
        await updateDoc(chatRef, {
          messages: arrayUnion(aiMessage),
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Chat image compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const handleAdminVoiceToggle = async () => {
    if (isAdminRecording && adminMediaRecorder) {
      adminMediaRecorder.stop();
      setIsAdminRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg"];
        const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, supportedMimeType ? { mimeType: supportedMimeType } : {});
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        recorder.onstop = async () => {
          if (chunks.length === 0) return;
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            if (!selectedChat) return;
            const chatRef = doc(db, "support_chats", selectedChat.id);
            const newMessage = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              audio: base64Audio,
              senderId: user?.uid,
              senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
              isAdmin: true,
              createdAt: new Date().toISOString(),
              reactions: {}
            };
            await updateDoc(chatRef, {
              messages: arrayUnion(newMessage),
              lastMessage: "Voice Message",
              lastMessageAt: new Date().toISOString(),
              unreadByUser: true
            });
          };
        };
        recorder.start();
        setAdminMediaRecorder(recorder);
        setIsAdminRecording(true);
      } catch (err) {
        console.error("Mic access denied", err);
        alert("মাইক্রোফোনের এক্সেস পাওয়া যায়নি!");
      }
    }
  };
  const handleAdminChatImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    try {
      const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        const chatRef = doc(db, "support_chats", selectedChat.id);
        const newMessage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          image: url,
          senderId: user?.uid,
          senderName: `${isMasterAdmin ? "Admin" : "Mod"}: ${userProfile?.displayName || "Support"}`,
          isAdmin: true,
          createdAt: new Date().toISOString(),
          reactions: {}
        };
        await updateDoc(chatRef, {
          messages: arrayUnion(newMessage),
          lastMessage: "Image Message",
          lastMessageAt: new Date().toISOString(),
          unreadByUser: true
        });
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Chat image compression error:", error);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    }
  };
  const simulatePayment = () => {
    setIsPaymentSimulating(true);
    // Simulate payment processing time
    setTimeout(() => {
      const prefix = paymentMethod === "bkash" ? "BK" : 
                     paymentMethod === "nagad" ? "NG" : 
                     paymentMethod === "rocket" ? "RK" : "BN";
      const randomId = prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
      setTransId(randomId);
      setIsPaymentSimulating(false);
      const name = paymentMethod === "bkash" ? "বিকাশ" :
                   paymentMethod === "nagad" ? "নগদ" :
                   paymentMethod === "rocket" ? "রকেট" : "ব্যাংক";
      alert(
        `${name} পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!`,
      );
    }, 2000);
  };
  const handleBuyNow = useCallback((product: Product, color?: string, size?: string, quantity: number = 1, wholesaleSizes?: Record<string, number>) => {
    // If no color provided, try getting first default
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const selectedColor =
      color ||
      (firstVariant ? firstVariant.name : (product.colors && product.colors.length > 0 ? product.colors[0] : undefined));
    
    const itemsToAdd: any[] = [];
    if (wholesaleSizes && Object.keys(wholesaleSizes).length > 0) {
      Object.entries(wholesaleSizes).forEach(([s, q]) => {
        if (q > 0) {
          itemsToAdd.push({ product, quantity: q, color: selectedColor, size: s });
        }
      });
    } else {
       const selectedSize = size || (firstVariant ? firstVariant.size : undefined);
       itemsToAdd.push({ product, quantity, color: selectedColor, size: selectedSize });
    }
    
    setCartItems(prev => {
      let newCart = [...prev];
      itemsToAdd.forEach(item => {
        const existing = newCart.find(i => i.product.id === item.product.id && i.color === item.color && i.size === item.size);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newCart.push(item);
        }
      });
      setCheckoutItems(newCart);
      return newCart;
    });
    
    setIsCheckoutOpen(true);
    detectLocation();
  }, [detectLocation]);
  const openCartCheckout = () => {
    if (cartItems.length === 0) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    setCheckoutItems([...cartItems]);
    setIsCheckoutOpen(true);
    detectLocation();
  };
  const handleMultiOrderInitiate = () => {
    setIsMultiOrderSelectionOpen(true);
  };
  const proceedToCheckoutFromMulti = () => {
    if (cartItems.length === 0) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    setCheckoutItems([...cartItems]);
    setIsMultiOrderSelectionOpen(false);
    setIsCheckoutOpen(true);
    detectLocation();
  };
  // Helper to calculate tiered price
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProductDetailsOpen && selectedProduct && !userInteractedWithGallery) {
      const allImages = [
        selectedProduct.image,
        ...(selectedProduct.images || []),
        ...(selectedProduct.variants || []).map((v) => v.image).filter(Boolean),
      ].filter((v, i, a) => a.indexOf(v) === i);
      if (allImages.length > 1) {
        interval = setInterval(() => {
          setModalDisplayImage(prev => {
            const currentImg = prev || selectedProduct.image;
            const currentIdx = allImages.indexOf(currentImg);
            const nextIdx = (currentIdx + 1) % allImages.length;
            return allImages[nextIdx];
          });
        }, 4000);
      }
    }
    return () => clearInterval(interval);
  }, [
    isProductDetailsOpen,
    selectedProduct?.id, // Only restart if product changes
    userInteractedWithGallery
  ]);
  const handleReviewImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (reviewForm.images.length + files.length > 5) {
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setReviewForm((prev) => ({
            ...prev,
            images: [...prev.images, dataUrl],
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Review image compression error:", error);
      }
    }
  };
  const handleFacebookLoginForReview = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err) {
      console.error("Facebook login failed", err);
      alert("ফেসবুক লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };
  const submitReview = async (productId: string) => {
    const finalUserName = user
      ? user.displayName || "Anonymous User"
      : reviewForm.guestName?.trim() || "Guest User";
    if (!reviewForm.comment.trim() && reviewForm.rating === 5) {
      // Allow empty comment if rating is provided, but typically a low rating should have a comment
      // For now, let's just allow it anyway to be safe
    }
    setIsSubmittingReview(true);
    try {
      const reviewId = Math.random().toString(36).substr(2, 9);
      const newReview: Review = {
        id: reviewId,
        userId: user
          ? user.uid
          : "guest_" + Math.random().toString(36).substr(2, 5),
        userName: finalUserName,
        userPhoto: user ? user.photoURL || null : null,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        images: reviewForm.images,
        createdAt: new Date().toISOString(),
      };
      // Review record storage
      const reviewPath = `products/${productId}/reviews/${reviewId}`;
      try {
        await setDoc(
          doc(db, "products", productId, "reviews", reviewId),
          newReview,
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, reviewPath);
      }
      // Update aggregation - handling potential nulls
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        const currentRating = data.rating || 0;
        const currentCount = data.reviewCount || 0;
        const newCount = currentCount + 1;
        const newRating =
          (currentRating * currentCount + reviewForm.rating) / newCount;
        try {
          await updateDoc(productRef, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount,
          });
        } catch (err) {
          handleFirestoreError(
            err,
            OperationType.UPDATE,
            `products/${productId}`,
          );
        }
        // Update local UI
        setActiveReviews((prev) => [newReview, ...prev]);
        setSelectedProduct((prev) =>
          prev
            ? {
                ...prev,
                rating: Number(newRating.toFixed(1)),
                reviewCount: newCount,
              }
            : null,
        );
        // Also update in main products list
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, rating: Number(newRating.toFixed(1)), reviewCount: newCount } : p));
      }
      setReviewForm({ rating: 5, comment: "", images: [], guestName: "" });
      alert("সার্ভারে ডাটা সেভ/ডিলিট করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন অথবা আবার লগইন করুন।");
    } catch (err) {
      console.error("Failed to submit review", err);
      // If it's a JSON string from handleFirestoreError, we've already logged it but let's notify user
      alert("রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmittingReview(false);
    }
  };
  const [reviewUnsub, setReviewUnsub] = useState<(() => void) | null>(null);
  const fetchReviews = (productId: string) => {
    if (isQuotaExceeded) return;
    if (reviewUnsub) reviewUnsub();
    setActiveReviews([]); 
    
    const q = query(
      collection(db, "products", productId, "reviews"),
      orderBy("createdAt", "desc"),
      limit(20) // Adding limit to save quota
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Review,
      );
      setActiveReviews(reviews);
    }, (err: any) => {
      console.error("Failed to sync reviews", err);
      if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
        setIsQuotaExceeded(true);
      }
    });
    
    setReviewUnsub(() => unsub);
  };
  useEffect(() => {
    if (selectedProduct?.id && !isQuotaExceeded) {
      fetchReviews(selectedProduct.id);
    }
  }, [selectedProduct?.id, isQuotaExceeded]);
  const openProductDetails = useCallback((product: Product) => {
    setSelectedProduct(product);
    setTempSelectedQty(1);
    setModalDisplayImage(product.image);
    
    setTempSelectedColor(null);
    setTempSelectedSize(null);
    setColorValError(false);
    setSizeValError(false);
    setUserInteractedWithGallery(false);
    setIsDescriptionExpanded(false);
    setIsProductDetailsOpen(true);
  }, []);
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("কুপন কোড লিখুন!");
      return;
    }
    // Default to ISHOPBD5 if config not loaded
    const VALID_CODE = siteConfig?.couponCode || "ISHOPBD5";
    if (code === VALID_CODE) {
      setAppliedCoupon(VALID_CODE);
      setCouponError("");
      setCouponCode(""); 
      toast.success("সাফল্যের সাথে ভেরিফাই করা হয়েছে।");
    } else {
      setCouponError("ভুল কুপন কোড!");
      setAppliedCoupon(null);
      toast.error("ভুল কুপন কোড!");
    }
  };
  const handleWhatsAppOrder = () => {
    const whatsappNumber = siteConfig?.whatsappNumber || "8801777600844";
    const shopName = "i SHOP BD";
let message = `আসসালামু আলাইকুম, আমি ${shopName} থেকে এই পণ্যগুলো অর্ডার করতে চাই:\n\n`;
    
    checkoutItems.forEach((item, idx) => {
      message += `${idx + 1}. পণ্য: ${item.product.name}\n`;
      if (item.color && item.color !== "N/A") message += `   কালার: ${item.color}\n`;
      if (item.size && item.size !== "N/A") message += `   সাইজ: ${item.size}\n`;
      message += `   পরিমাণ: ${item.quantity}\n`;
      message += `   মূল্য: ৳${item.product.price * item.quantity}\n\n`;
    });
    const subtotal = checkoutItems.reduce((acc, curr) => acc + getProductPrice(curr.product, curr.quantity) * curr.quantity, 0);
    const delivery = getDeliveryCharge(checkoutItems, deliveryArea, appliedCoupon);
    const total = subtotal + (appliedCoupon ? 0 : delivery);
    message += `সাব-টোটাল: ৳${subtotal}\n`;
    message += `ডেলিভারি চার্জ: ৳${delivery}${appliedCoupon ? ' (ফ্রি)' : ''}\n`;
    message += `সর্বমোট: ৳${total}\n\n`;
    message += `
: ${window.location.origin}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };
  const handleLandingCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (!landingProduct) return;
    if (isQuotaExceeded) {
      toast.error("কোটা শেষ হয়ে গেছে, আপাতত অর্ডার নেওয়া যাচ্ছে না।");
      return;
    }
    
    const phone = landingPhone.trim();
    const name = landingName.trim();
    const address = landingAddress.trim();
    
    if (!name) {
      toast.error("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    if (!phone || phone.length < 11) {
      toast.error("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন।");
      return;
    }
    if (!landingDistrict) {
      toast.error("দয়া করে আপনার জেলা সিলেক্ট করুন।");
      return;
    }
    if (!landingThana) {
      toast.error("দয়া করে আপনার থানা সিলেক্ট করুন।");
      return;
    }
    if (!address) {
      toast.error("দয়া করে আপনার সম্পূর্ণ ঠিকানা লিখুন।");
      return;
    }
    setIsLandingSubmitting(true);
    try {
      const orderId = "ORD-" + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
      const deliveryCharge = getDeliveryCharge([{product: landingProduct, quantity: 1}], landingArea, null);
      const lCfg = (landingProduct as any).landingConfig || {};
      const lPackages = lCfg.packages || [];
      let subtotal = lCfg.priceOverride ? Number(lCfg.priceOverride) : Number(landingProduct.price || 0);
      let pkgName = "";
      if (lPackages.length > 0) {
        const idx = landingPackageIndex < lPackages.length ? landingPackageIndex : 0;
        if (lPackages[idx] && lPackages[idx].price) {
          subtotal = Number(lPackages[idx].price);
          pkgName = ` (${lPackages[idx].weight})`;
        }
      }
      const total = subtotal + deliveryCharge;
      const finalAddress = `${address}, ${landingThana}, ${landingDistrict}`;
      const orderData = {
        orderId,
        customerName: name,
        customerPhone: phone,
        address: finalAddress,
        paymentMethod: "cod",
        deliveryCharge,
        deliveryArea: landingArea,
        subtotal,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleString("bn-BD"),
        items: [
          {
            product: {
              id: landingProduct.id,
              name: landingProduct.name + pkgName,
              price: subtotal,
              image: landingProduct.image || ""
            },
            quantity: 1
          }
        ],
        userId: user?.uid || "guest"
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      notifyAdminsOnNewOrder(docRef.id, total);
      
      // Send automated confirmation SMS to customer's phone
      try {
        const productNames = landingProduct.smsName || landingProduct.name;
        const message = `প্রিয় গ্রাহক, আপনার অর্ডারটি সফল হয়েছে\n${productNames}\nঅর্ডার নাম্বার: #${String(orderId).slice(-6).toUpperCase()}\nমোট বিল: ৳${total}\nনতুন পণ্য অর্ডার করতে ভিজিট করুন: www.ishopbd.online ধন্যবাদ!`;
        fetch("/api/send-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone, message }),
        }).catch(err => console.warn("Auto SMS failed:", err));
      } catch(e) {
        console.warn("SMS sending error:", e);
      }
      
      setCompletedOrderReceipt({
        ...orderData,
        id: docRef.id
      });
      // Save phone profile in local storage for future autofills
      try {
        savePhoneProfile(phone, name, address, landingDistrict, landingThana, landingArea);
      } catch (e) {
        console.warn("Failed to save phone profile:", e);
      }
      setLandingName("");
      setLandingPhone("");
      setLandingAddress("");
      setLandingDistrict("");
      setLandingThana("");
      setLandingDistrictSearch("");
      setLandingThanaSearch("");
      
      toast.success("আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!");
    } catch (err: any) {
      console.error("Landing page checkout failed", err);
      toast.error("অর্ডারটি সম্পন্ন করতে সমস্যা হয়েছে: " + (err.message || String(err)));
    } finally {
      setIsLandingSubmitting(false);
    }
  };
  const savePhoneProfile = (phone: string, name: string, address: string, district?: string, thana?: string, area?: string) => {
    if (!phone || phone.trim().length < 11) return;
    try {
      const saved = localStorage.getItem("ishopbd_saved_profiles");
      let profiles: any[] = saved ? JSON.parse(saved) : [];
      profiles = profiles.filter(p => p.phone !== phone.trim());
      profiles.unshift({
        phone: phone.trim(),
        name: name.trim(),
        address: address.trim(),
        district: district || "",
        thana: thana || "",
        area: area || "",
        timestamp: Date.now()
      });
      if (profiles.length > 10) profiles.pop();
      localStorage.setItem("ishopbd_saved_profiles", JSON.stringify(profiles));
      setSavedProfiles(profiles);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };
  const selectSavedProfile = (profile: any, type: 'inline' | 'checkout' | 'landing') => {
    if (type === 'inline') {
      setInlineOrderPhone(profile.phone);
      if (profile.name) setInlineOrderName(profile.name);
      if (profile.district) setInlineOrderDistrict(profile.district);
      if (profile.thana) setInlineOrderThana(profile.thana);
      if (profile.address) setInlineOrderAddress(profile.address);
      if (profile.area) setInlineOrderArea(profile.area);
    } else if (type === 'checkout') {
      setCheckoutPhone(profile.phone);
      if (profile.name) setCheckoutName(profile.name);
      if (profile.address) setCheckoutAddress(profile.address);
      if (profile.area) setDeliveryArea(profile.area);
    } else {
      setLandingPhone(profile.phone);
      if (profile.name) setLandingName(profile.name);
      if (profile.district) setLandingDistrict(profile.district);
      if (profile.thana) setLandingThana(profile.thana);
      if (profile.address) setLandingAddress(profile.address);
      if (profile.area) setLandingArea(profile.area);
      setLandingPhoneFocused(false);
    }
  };
  const validateSelections = (): boolean => {
    if (!selectedProduct) return false;
    const hasColors = (selectedProduct.variants && selectedProduct.variants.length > 0 && 
      Array.from(new Set(selectedProduct.variants.map(v => v.name || ""))).filter(c => c !== "").length > 0) ||
      (selectedProduct.colors && selectedProduct.colors.length > 0);
    if (hasColors && !tempSelectedColor) {
      toast.error("দয়া করে কালার নির্বাচন করুন।");
      setColorValError(true);
      const colorElement = document.getElementById("color-selection-area");
      if (colorElement) {
        colorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    const availableVariants = selectedProduct.variants || [];
    const filteredByColor = tempSelectedColor 
      ? availableVariants.filter(v => (v.name || "").trim().toLowerCase() === tempSelectedColor.trim().toLowerCase())
      : availableVariants;
    
    const hasSizes = filteredByColor.some(v => v.size && v.size.trim() !== "");
    if (hasSizes && !tempSelectedSize) {
      toast.error("দয়া করে সাইজ নির্বাচন করুন।");
      setSizeValError(true);
      const sizeElement = document.getElementById("size-selection-area");
      if (sizeElement) {
        sizeElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    return true;
  };
  const deleteOrder = async (id: any) => {
    if (!id) return;
    const conf = window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান?");
    if (!conf) return;
    try {
      await deleteDoc(doc(db, "orders", String(id)));
      alert("অর্ডারটি ডিলিট করা হয়েছে।");
    } catch (err: any) {
      alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message);
    }
  };
  const deleteReview = async (productId: any, reviewId: any) => {
    if (!productId || !reviewId) return;
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই রিভিউটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "products", String(productId), "reviews", String(reviewId)));
        setActiveReviews((prev) => prev.filter((r) => String(r.id) !== String(reviewId)));
        alert("রিভিউটি ডিলিট করা হয়েছে।");
      } catch (err: any) {
        alert("ডিলিট করতে সমস্যা হয়েছে: " + err.message);
      }
    }
  };
  const sendConfirmationSMS = async (order: any) => {
    if (!order.customerPhone) {
      toast.error("কুপন কোড লিখুন!");
      return;
    }
    if (siteConfig?.isSmsConfirmEnabled === false) {
      toast.error("SMS সিস্টেম বন্ধ আছে। সেটিংস থেকে চেক করুন।");
      return;
    }
    const orderId = String(order.orderId || order.id).slice(-6).toUpperCase();
    
    let startPart = (siteConfig?.smsTemplateStart || '').trim() || 'প্রিয় গ্রাহক, আপনার অর্ডারটি অর্ডার হয়েছে?';
    const endPart = (siteConfig?.smsTemplateEnd || '').trim() || 'iShop BD ব্যবহার করুন জন্য ধন্যবাদ।';
    
    // Replace "" with actual name if available
    if (startPart.includes('') && order.customerName) {
      startPart = startPart.replace('', order.customerName);
    }
    // Format products
    let productDetails = '';
    if (order.items && order.items.length > 0) {
      productDetails = order.items.map((item: any) => {
        const name = item.product?.smsName || item.product?.name || 'Product';
        const qty = item.quantity || 1;
        return `  ${name} (${qty} ি)`;
      }).join('\n');
    }
    const message = `${startPart}\nপণ্য:\n${productDetails}\nঅর্ডার নং: #${orderId}\nমোট বিল: ৳${order.total}\n${endPart}`;
    
    const toastId = toast.loading(`SMS পাঠানো হচ্ছে ${order.customerPhone} তে...`);
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: order.customerPhone,
          message: message,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`SMS সফলভাবে পাঠানো হয়েছে! (${order.customerPhone})`, { id: toastId });
      } else {
        toast.error("সঠিক সংখ্যা লিখুন।");
        console.warn("SMS sending failed:", data);
      }
    } catch (error) {
      toast.error("SMS API-তে সংযোগ করা যাচ্ছে না।");
      console.error("Error calling SMS API:", error);
    }
  };
  const handleRequestRefund = async () => {
    if (!selectedOrderForRefund || !refundReason.trim()) return;
    if (isQuotaExceeded) {
      toast.error("কোটা শেষ হয়ে গেছে, আপাতত কোনো কিছু সেভ করা যাচ্ছে না।");
      return;
    }
    setIsSubmittingRefund(true);
    try {
      const refundData = {
        orderId: selectedOrderForRefund.id,
        userId: user.uid,
        userName: userProfile?.displayName || user.email,
        userEmail: user.email,
        reason: refundReason,
        amount: selectedOrderForRefund.total,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "refund_requests"), refundData);
      
      alert("ইমেজ প্রয়োজন!");
      setSelectedOrderForRefund(null);
      setRefundReason("");
      setProfileTab("refunds");
    } catch (err) {
      console.error("Refund request error:", err);
      alert("রিফান্ড রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmittingRefund(false);
    }
  };
  const handleApproveRefund = async (refund: any) => {
    if (!window.confirm("আপনি কি এই রিফান্ড রিকোয়েস্টটি অ্যাপ্রুভ করতে চান? এটি ইউজারের ব্যালেন্সে টাকা যোগ করে দেবে।")) return;
    try {
      const userRef = doc(db, "users", refund.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;
      
      const currentBalance = userSnap.data().balance || 0;
      const newBalance = currentBalance + refund.amount;
      
      await updateDoc(userRef, { balance: newBalance });
      await updateDoc(doc(db, "refund_requests", refund.id), { status: "approved", updatedAt: new Date().toISOString() });
      
      const txRef = doc(collection(db, "transactions"));
      await setDoc(txRef, {
        userId: refund.userId,
        amount: refund.amount,
        type: "refund",
        description: `রিফান্ড অ্যাপ্রুভড (অর্ডার #${refund.orderId})`,
        createdAt: new Date().toISOString(),
      });
      
      alert("রিফান্ড সফলভাবে অ্যাপ্রুভ করা হয়েছে।");
    } catch (err) {
      console.error("Approve refund error:", err);
    }
  };
  
    
    const handlePrintInvoice = (order: any) => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      
      const itemsHtml = order.items.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || 'Item'} ${item.color && item.color !== 'N/A' ? '('+item.color+')' : ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Tk ${item.price}</td>
        </tr>
      `).join('');
      const html = `
        <html>
          <head>
            <title>Invoice - #${String(order.id).slice(-6).toUpperCase()}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
              th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #eee; }
              .totals { width: 300px; margin-left: auto; }
              .tot-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .tot-row.grand { font-weight: bold; font-size: 18px; border-bottom: none; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 style="margin:0; color: #4F46E5;">INVOICE</h1>
                <p style="margin:5px 0 0 0; color: #666;">Order #${String(order.id).slice(-6).toUpperCase()}</p>
                <p style="margin:5px 0 0 0; color: #666;">Date: ${order.date}</p>
              </div>
            </div>
            
            <div class="details">
              <div>
                <h3 style="margin-top:0; color: #666; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
                <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">${order.customerName}</p>
                <p style="margin: 0 0 5px 0;">${order.customerPhone}</p>
                <p style="margin: 0;">${order.address}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            <div class="totals">
              <div class="tot-row">
                <span>Subtotal</span>
                <span>Tk ${order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}</span>
              </div>
              <div class="tot-row">
                <span>Delivery Charge</span>
                <span>Tk ${order.deliveryCharge}</span>
              </div>
              <div class="tot-row grand">
                <span>Total</span>
                <span>Tk ${order.total}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 80px; color: #888; font-size: 12px;">
              <p>Thank you for shopping with us!</p>
            </div>
            
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    };
const handleSaveQuickEdit = async () => {
      if (!quickEditOrderId) return;
      try {
        const updated = orderHistory.map((o) =>
          o.id === quickEditOrderId ? { 
            ...o, 
            customerName: quickEditData.customerName, 
            customerPhone: quickEditData.customerPhone,
            address: quickEditData.address
          } : o
        );
        setOrderHistory(updated);
        try {
          localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save orders to localStorage:", e);
        }
        
        const orderRef = doc(db, "orders", quickEditOrderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          await updateDoc(orderRef, {
            customerName: quickEditData.customerName,
            customerPhone: quickEditData.customerPhone,
            address: quickEditData.address
          });
        }
        toast.success("Order info updated!");
        setQuickEditOrderId(null);
      } catch (err) {
        console.error("Quick edit error:", err);
        toast.error("Failed to update info");
      }
    };
    const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ) => {
    if (isQuotaExceeded) return;
    try {
      const isCancelledOrReturned = newStatus === "cancelled" || newStatus === "returned";
        const updated = orderHistory.map((o) =>
          o.id === orderId ? { 
            ...o, 
            status: newStatus, 
            isPreOrder: newStatus === "confirmed" ? false : o.isPreOrder,
            ...(isCancelledOrReturned && { paymentMethod: "N/A" })
          } : o,
        );
      setOrderHistory(updated);
      try {
        localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save orders to localStorage:", e);
      }
      // Firestore Update
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const updateData: any = { status: newStatus };
          if (newStatus === "confirmed") {
            updateData.isPreOrder = false;
          }
          if (newStatus === "cancelled" || newStatus === "returned") {
            updateData.paymentMethod = "N/A";
          }
          await updateDoc(orderRef, updateData);
                if (newStatus === "confirmed") {
          const confirmedOrder = updated.find((o) => o.id === orderId);
          if (confirmedOrder) {
            sendConfirmationSMS(confirmedOrder);
          }
          const orderData = orderSnap.data();
          if (orderData && orderData.userId) {
            try {
              await addDoc(collection(db, "notifications"), {
                title: "অর্ডার অর্ডার?",
                message: `প্রিয় ${orderData.customerName || ''}, আপনার ি (#${orderId})অর্ডার করা হয়েছে? মোট বিল: ৳${orderData.total}।`,
                link: "/profile",
                userId: orderData.userId,
                userEmail: orderData.customerEmail || "",
                createdAt: serverTimestamp(),
                sender: "system",
                type: "direct"
              });
              console.log("In-app confirmation notification sent successfully to userId:", orderData.userId);
            } catch (err) {
              console.error("Failed to send in-app confirmation notification:", err);
            }
          }
        }
        
        const orderData = orderSnap.data();
        if (orderData && orderData.userId) {
          sendPushToUser(orderData.userId, "অর্ডার আপডেট", `আপনার অর্ডারের বর্তমান স্ট্যাটাস: ${newStatus}`, "/profile");
        }
        if (newStatus === "returned" && orderData.userId && orderData.paymentMethod !== "cod") {
            const userRef = doc(db, "users", orderData.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentBalance = userSnap.data().balance || 0;
                const refundAmount = orderData.total;
                await updateDoc(userRef, { balance: currentBalance + refundAmount });
                await setDoc(doc(collection(db, "transactions")), {
                    userId: orderData.userId,
                    amount: refundAmount,
                    type: "refund",
                    description: `রিফান্ড (অর্ডার #${orderId})`,
                    createdAt: new Date().toISOString(),
                });
            }
        }
      }
    } catch (err: any) {
      console.error("Status update failed", err);
      alert("ডাটাবেস আপডেট ফেইল করেছে: " + (err.message || String(err)));
    }
  };
  const handleUpdatePaymentMethod = async (
    orderId: string,
    newMethod: string,
  ) => {
    if (isQuotaExceeded) return;
    try {
      const updated = orderHistory.map((o) =>
        o.id === orderId ? { ...o, paymentMethod: newMethod } : o,
      );
      setOrderHistory(updated);
      try {
        localStorage.setItem("ishopbd_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save orders to localStorage:", e);
      }
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paymentMethod: newMethod });
      toast.success("পেমেন্ট মেথড আপডেট করা হয়েছে!");
    } catch (err) {
      console.error("Failed to update payment method", err);
      toast.error("পেমেন্ট মেথড আপডেট করতে সমস্যা হয়েছে।");
    }
  };
  const sendToCourier = (order: any) => {
    setCourierSelection({
      order,
      service: "Steadfast",
      trackingId: "",
      codAmount: order.codAmount !== undefined ? order.codAmount : order.total
    });
    setIsCourierModalOpen(true);
  };
  const handleConfirmCourier = async () => {
    const { order, service, trackingId, codAmount } = courierSelection;
    if (!order) return;
    try {
      const finalCodAmount = codAmount !== undefined ? codAmount : (order.codAmount !== undefined ? order.codAmount : order.total);
      if (service === "Steadfast" && !trackingId) {
        if (!adminKeys?.steadfastApiKey || !adminKeys?.steadfastSecretKey) {
          toast.error("Steadfast API Key missing in Settings!");
          return;
        }
        toast.loading("Steadfast এ অর্ডার এন্ট্রি করা হচ্ছে...");
        const response = await fetch("/api/courier/steadfast/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: adminKeys?.steadfastApiKey || "",
            secretKey: adminKeys?.steadfastSecretKey || "",
            orders: [{
              id: order.id,
              invoice: order.id,
              recipient_name: order.customerName,
              recipient_phone: order.customerPhone,
              recipient_address: order.address,
              cod_amount: finalCodAmount,
              note: `Invoice: ${order.id}`
            }]
          })
        });
        const data = await response.json();
        toast.dismiss();
        
        if (data.success && data.processedOrders && data.processedOrders[0].success) {
           const result = data.processedOrders[0];
           await updateDoc(doc(db, "orders", order.id), {
             status: "processing",
             courierTrackingId: result.trackingId,
             courierName: "Steadfast",
             codAmount: finalCodAmount,
             updatedAt: serverTimestamp(),
           });
           if (order.userId) {
             sendPushToUser(order.userId, "অর্ডার আপডেট", "আপনার অর্ডারের বর্তমান স্ট্যাটাস: processing (কুরিয়ারে পাঠানো হয়েছে)", "/profile");
           }
           toast.success("সফলভাবে Steadfast এ পাঠানো হয়েছে!");
           setIsCourierModalOpen(false);
           return;
        } else {
           toast.error(data.error || "Steadfast এ পাঠাতে ব্যর্থ হয়েছে!");
           return;
        }
      }
      const text = `অর্ডার ID: #${order.id}\nনাম: ${order.customerName}\nফোন: ${order.customerPhone}\nঠিকানা: ${order.address}\nটোটাল: ৳${order.total}\nক্যাশ কালেকশন: ৳${finalCodAmount}`;
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(text).catch(() => {});
        }
      } catch (clipErr) {
        console.warn("Clipboard copy failed:", clipErr);
      }
      await updateDoc(doc(db, "orders", order.id), {
        status: "shipped",
        courierName: service,
        trackingId: trackingId,
        codAmount: finalCodAmount,
        updatedAt: serverTimestamp(),
      });
      if (order.userId) {
        sendPushToUser(order.userId, "অর্ডার আপডেট", "আপনার অর্ডারের বর্তমান স্ট্যাটাস: shipped (কুরিয়ারে পাঠানো হয়েছে)", "/profile");
      }
      toast.success(`অর্ডার #${order.id} কুরিয়ারে আপডেট হয়েছে!`);
      setIsCourierModalOpen(false);
    } catch (err: any) {
      toast.dismiss();
      setIsCourierModalOpen(false);
      toast.error("কুরিয়ার এন্ট্রিতে সমস্যা হয়েছে: " + (err.message || String(err)));
      console.error("Courier update failed", err);
    }
  };
  
  const exportOrdersToCSV = (filterType: "daily" | "weekly" | "monthly" | "all") => {
    if (orderHistory.length === 0) return;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const filteredOrders = orderHistory.filter(order => {
      if (filterType === 'all') return true;
      
      let orderDate: Date;
      const createdAt = order.createdAt;
      if (createdAt) {
        if (typeof createdAt.toDate === 'function') {
          orderDate = createdAt.toDate();
        } else if (typeof createdAt === 'object' && createdAt.seconds) {
          orderDate = new Date(createdAt.seconds * 1000);
        } else {
          orderDate = new Date(createdAt);
        }
      } else {
        orderDate = new Date();
      }
      if (filterType === 'daily') {
        return orderDate >= startOfToday;
      } else if (filterType === 'weekly') {
        return orderDate >= sevenDaysAgo;
      } else if (filterType === 'monthly') {
        return orderDate >= thirtyDaysAgo;
      }
      return true;
    });
    if (filteredOrders.length === 0) {
      toast.error("এই সময়ের কোনো অর্ডার পাওয়া যায়নি!");
      return;
    }
    const headers = ["Order ID", "Date", "Customer Name", "Phone", "Total", "Status"];
    const escapeCSV = (val: any) => {
      const str = val === undefined || val === null ? "" : String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const csvRows = [headers.join(",")];
    filteredOrders.forEach(o => {
      const row = [
        escapeCSV(o.id),
        escapeCSV(o.date),
        escapeCSV(o.customerName),
        escapeCSV(o.customerPhone),
        escapeCSV(o.total),
        escapeCSV(o.status)
      ];
      csvRows.push(row.join(","));
    });
    
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${filterType}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeBanners.length > 0) {
        setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);
  const campaignParam = urlParams.get("campaign");
  const isCampaignLoading = !!campaignParam && !activeCampaign && campaigns.length === 0;
  if (landingProduct) {
    const lCfg = (landingProduct as any).landingConfig || {};
    const baseOldPrice = lCfg.oldPriceOverride ? Number(lCfg.oldPriceOverride) : Number(landingProduct.oldPrice || 0);
    let oldPrice = baseOldPrice;
    let price = lCfg.priceOverride ? Number(lCfg.priceOverride) : Number(landingProduct.price || 0);
    const lPackages = lCfg.packages || [];
    if (lPackages.length > 0) {
      const idx = landingPackageIndex < lPackages.length ? landingPackageIndex : 0;
      if (lPackages[idx]) {
        if (lPackages[idx].price) {
          price = Number(lPackages[idx].price);
        }
        const weightStr = String(lPackages[idx].weight || "");
        const englishStr = weightStr.replace(/[০-৯]/g, (d: string) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());
        const match = englishStr.match(/\d+(\.\d+)?/);
        if (match && baseOldPrice > 0) {
          const qty = parseFloat(match[0]);
          oldPrice = baseOldPrice * (qty > 0 ? qty : 1);
        }
      }
    }
    let discount = landingProduct.discount || 0;
    if (oldPrice && price && oldPrice > price) {
      discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    const deliveryCharge = getDeliveryCharge([{ product: landingProduct, quantity: 1 }], landingArea, null);
    const totalAmount = price + deliveryCharge;
    const lHeadline = lCfg.headline || landingProduct.name;
    const lSubheadline = lCfg.subheadline || landingProduct.description || "";
    const lBadgeText = lCfg.badgeText || `ধামাকা অফার! ${discount}% ছাড়`;
    const lExtraImages: string[] = lCfg.extraImages || [];
    const lFeatures = lCfg.features || [
      { icon: "zap", title: "প্রিমিয়াম কোয়ালিটি", desc: "আমরা সরাসরি কারখানা থেকে সেরা মান নিশ্চিত করে কাস্টমারকে প্রোডাক্টটি সরবরাহ করে থাকি।" },
      { icon: "thumbsup", title: "সহজ ব্যবহার উপযোগিতা", desc: "যেকোনো বয়সের মানুষের জন্য অত্যন্ত আরামদায়ক ও সহজ ডিজাইন নিশ্চিত করা হয়েছে।" },
      { icon: "truck", title: "দ্রুত ডেলিভারি সুবিধা", desc: "অর্ডার করার ২৪ থেকে ৭২ ঘণ্টাএ° মধ্যে আমরা সরাসরি কাস্টমারের কাছে হোম ডেলিভারি দিয়ে থাকি।" },
      { icon: "shield", title: "নিশ্চিন্তে ক্যাশ অন ডেলিভারি", desc: "প্রোডাক্ট হাতে পেয়ে কোয়ালিটি চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে তারপরে মূল্য পরিশোধ করার সুবিধা।" },
    ];
    const lBodyText = lCfg.bodyText || "";
    const lVideoUrls: string[] = [...(lCfg.videoUrls || [])];
    if (landingProduct.videoUrl && !lVideoUrls.includes(landingProduct.videoUrl)) {
      lVideoUrls.unshift(landingProduct.videoUrl);
    }
    const lShowTrustBadges = lCfg.showTrustBadges !== false;
    const lIconMap: Record<string, React.ReactNode> = {
      zap: <Zap className="text-primary" size={18} />,
      thumbsup: <ThumbsUp className="text-primary" size={18} />,
      truck: <Truck className="text-blue-600" size={18} />,
      shield: <ShieldCheck className="text-green-600" size={18} />,
    };
    return (
      <div className="min-h-screen bg-cream flex flex-col font-sans relative overflow-x-hidden">
        <Helmet>
          <title>i SHOP BD (আই শপ বিডি) - Online Shopping in Bangladesh | Gadgets & Electronics</title>
          <meta name="description" content="i SHOP BD (আই শপ বিডি) - বাংলাদেশের সেরা অনলাইন শপিং শপ। এখানে পাবেন লেটেস্ট গ্যাজেট, ইলেকট্রনিক্স এবং হোম এক্সেসরিজ সবচেয়ে কম দামে। দ্রুত হোম ডেলিভারি ও গুণগত মানের নিশ্চয়তা।" />
        </Helmet>
        <Toaster position="top-right" reverseOrder={false} />
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-slate-800 transition-all text-secondary dark:text-white">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-extrabold text-primary flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer">
              i SHOP <span className="text-secondary">BD</span>
            </a>
            <button
              onClick={() => {
                document.getElementById("landing-checkout-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-primary hover:bg-primary/95 text-white font-black text-xs px-5 py-2.5 rounded-full transition-all shadow-md shadow-primary/10 active:scale-95 flex items-center gap-1.5"
            >
              <ShoppingCart size={14} /> অর্ডার করুন
            </button>
          </div>
        </header>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-gray-50/50 py-12 md:py-20 border-b border-gray-100">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Product Gallery */}
            <div className="flex flex-col gap-4">
              {(() => {
                const heroCarouselImages = [landingProduct.image, ...(landingProduct.images || [])].filter(Boolean);
                return heroCarouselImages.length > 1 ? (
                  <div className="aspect-square bg-white rounded-3xl border border-gray-100 shadow-xl w-full">
                    <ImageCarousel images={heroCarouselImages} className="aspect-square rounded-3xl" />
                  </div>
                ) : (
                  <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl flex items-center justify-center p-4">
                    <img loading="lazy"
                      src={landingProduct.image}
                      className="max-h-[90%] max-w-[90%] object-contain"
                      alt={landingProduct.name}
                    />
                  </div>
                );
              })()}
            </div>
            
            {/* Sales Copy */}
            <div className="space-y-6">
              <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                ধামাকা অফার! {discount}% ছাড়
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-secondary leading-tight font-sans">
                {landingProduct.name}
              </h2>
              {landingProduct.description && (
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {cleanLatex(landingProduct.description || "")}
                </p>
              )}
              
              {/* Pricing Grid */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-center justify-center gap-8 max-w-sm mx-auto md:mx-0">
                {oldPrice ? (
                  <>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold mb-2">আগের দাম</p>
                      <div className="relative inline-block px-2">
                        <span className="text-lg text-gray-400 font-bold">৳{oldPrice}</span>
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                          <motion.line
                            x1="-5%" y1="105%"
                            x2="105%" y2="-5%"
                            stroke="#ef4444"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ 
                              duration: 0.35, 
                              ease: "easeInOut", 
                              delay: 0.2,
                              repeat: Infinity,
                              repeatType: "reverse",
                              repeatDelay: 2.5
                            }}
                          />
                          <motion.line
                            x1="-5%" y1="-5%"
                            x2="105%" y2="105%"
                            stroke="#ef4444"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ 
                              duration: 0.35, 
                              ease: "easeInOut", 
                              delay: 0.4,
                              repeat: Infinity,
                              repeatType: "reverse",
                              repeatDelay: 2.5
                            }}
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                  </>
                ) : null}
                <div className="text-center">
                  <p className="text-xs text-primary font-black mb-2">অফার মূল্য</p>
                  <div className="relative inline-block px-4 py-1">
                    <span className="text-3xl font-black text-primary relative z-10">৳{price}</span>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <motion.ellipse
                        cx="50%"
                        cy="50%"
                        rx="70%"
                        ry="65%"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ transformOrigin: "center", rotate: "-8deg" }}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ 
                          duration: 0.6, 
                          ease: "easeInOut", 
                          delay: 0.65,
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 2.5
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Embedded Direct Checkout Form */}
        <section id="landing-checkout-section" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-xl">
            
            {/* Package Options */}
            {lPackages && lPackages.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-black text-gray-800 text-center">পরিমাণ / প্যাকেজ সিলেক্ট করুন</h3>
                  <div className="flex flex-col gap-3">
                    {lPackages.map((pkg: any, idx: number) => {
                      const isSelected = landingPackageIndex === idx;
                      const baseBg = idx % 2 === 0 ? 'bg-green-50/30' : 'bg-white';
                      return (
                        <div
                          key={idx}
                          onClick={() => setLandingPackageIndex(idx)}
                          className={`relative cursor-pointer border-2 p-3 md:p-4 flex items-center justify-between transition-all duration-300 ${isSelected ? 'rounded-[20px] border-green-500 bg-green-50/80 text-green-700 shadow-lg scale-[1.02]' : `rounded-2xl border-gray-100 ${baseBg} hover:border-green-200`}`}
                        >
                          {isSelected && (
                            <div className="absolute -top-3 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md font-bold">
                              ✓
                            </div>
                          )}
                          <div className="font-black text-sm md:text-base flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${isSelected ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</span>
                            {pkg.weight}
                          </div>
                          <div className={`text-sm md:text-base ${isSelected ? 'font-black text-green-700' : 'text-gray-600 font-bold'}`}>৳{pkg.price}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-primary text-white p-6 md:p-8 text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-black font-sans">অর্ডার নিশ্চিত করতে নিচের ফর্মটি পূরণ করুন</h3>
                <p className="text-white/80 text-xs font-medium">১ মিনিটে খুব সহজেই অর্ডারটি সম্পন্ন করুন</p>
              </div>
              
              <form onSubmit={handleLandingCheckout} className="p-6 md:p-8 space-y-6">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">মোবাইল নাম্বার *</label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={landingPhone}
                    onChange={e => setLandingPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    onFocus={() => setLandingPhoneFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setLandingPhoneFocused(false), 200);
                    }}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all"
                  />
                  {landingPhoneFocused && savedProfiles.filter(p => p.phone.includes(landingPhone)).length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-48 overflow-y-auto">
                      {savedProfiles.filter(p => p.phone.includes(landingPhone)).map((profile, index) => (
                        <div
                          key={index}
                          onMouseDown={() => selectSavedProfile(profile, 'landing')}
                          className="px-4 py-2 hover:bg-red-50 hover:text-primary cursor-pointer text-xs flex flex-col gap-0.5 border-b border-gray-50 last:border-none text-left"
                        >
                          <span className="font-bold text-secondary">{profile.phone}</span>
                          {profile.name && <span className="text-gray-400 text-[10px]">{profile.name} - {profile.address}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={landingName}
                    onChange={e => setLandingName(e.target.value)}
                    placeholder="যেমন: মোঃ সাকিব হোসেন"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
                {/* District & Thana Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* District Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">জেলা সিলেক্ট করুন *</label>
                    <div className="relative flex items-center">
                      <input
                        required
                        type="text"
                        placeholder="জেলা সিলেক্ট করুন"
                        value={isLandingDistrictOpen ? landingDistrictSearch : landingDistrict}
                        onChange={(e) => {
                          setLandingDistrictSearch(e.target.value);
                          setIsLandingDistrictOpen(true);
                        }}
                        onFocus={() => {
                          setLandingDistrictSearch("");
                          setIsLandingDistrictOpen(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setIsLandingDistrictOpen(false);
                            setLandingDistrictSearch("");
                          }, 200);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-10 font-bold text-sm focus:border-primary outline-none transition-all"
                      />
                      <span className="absolute right-3 pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                    {isLandingDistrictOpen && <LandingDistrictModal {...{ ALL_DISTRICTS, landingDistrictSearch, setLandingDistrict, setLandingThana, setLandingArea, setIsLandingDistrictOpen, landingDistrict, isLandingDistrictOpen }} />}
                  </div>
                  {/* Thana Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">থানা/উপজেলা সিলেক্ট করুন *</label>
                    <div className="relative flex items-center">
                      <input
                        required
                        type="text"
                        placeholder={landingDistrict ? "থানা সিলেক্ট করুন" : "আগে জেলা সিলেক্ট করুন"}
                        value={isLandingThanaOpen ? landingThanaSearch : landingThana}
                        onChange={(e) => {
                          setLandingThanaSearch(e.target.value);
                          setIsLandingThanaOpen(true);
                        }}
                        onFocus={() => {
                          setLandingThanaSearch("");
                          setIsLandingThanaOpen(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setIsLandingThanaOpen(false);
                            setLandingThanaSearch("");
                          }, 200);
                        }}
                        disabled={!landingDistrict}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pr-10 font-bold text-sm focus:border-primary outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                      />
                      <span className="absolute right-3 pointer-events-none text-gray-400">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                    {isLandingThanaOpen && landingDistrict && districtThanaMap[landingDistrict] && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] max-h-60 overflow-y-auto">
                        {districtThanaMap[landingDistrict].filter(t => 
                          t.toLowerCase().includes(landingThanaSearch.toLowerCase())
                        ).length > 0 ? (
                          districtThanaMap[landingDistrict].filter(t => 
                            t.toLowerCase().includes(landingThanaSearch.toLowerCase())
                          ).map((t) => (
                            <div
                              key={t}
                              onMouseDown={() => {
                                setLandingThana(t);
                                setIsLandingThanaOpen(false);
                              }}
                              className={`px-4 py-2.5 hover:bg-red-50 hover:text-primary cursor-pointer text-sm text-left ${
                                landingThana === t ? "bg-red-50 text-primary font-bold" : "text-gray-700"
                              }`}
                            >
                              {t}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            থানা পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 ml-1">সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    required
                    rows={3}
                    value={landingAddress}
                    onChange={e => setLandingAddress(e.target.value)}
                    placeholder="যেমন: গ্রাম, বাসা নম্বর, রোড নম্বর, এলাকা"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold text-sm focus:border-primary outline-none transition-all resize-none"
                  />
                </div>
                {/* Total Price Section */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <p>প্রোডাক্টের দাম</p>
                    <p>৳{price}</p>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <p>ডেলিভারি চার্জ</p>
                    <p>৳{deliveryCharge}</p>
                  </div>
                  <div className="h-px bg-gray-200 my-1" />
                  <div className="flex justify-between font-black text-lg text-secondary">
                    <p>সর্বমোট পরিশোধ করতে হবে</p>
                    <p className="text-primary">৳{totalAmount}</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLandingSubmitting}
                  className="w-full py-4.5 rounded-2xl bg-secondary text-white font-black text-sm hover:brightness-110 shadow-xl shadow-secondary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isLandingSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag size={18} /> অর্ডার কনফর্ম করুন (৳{totalAmount})
                    </>
                  )}
                </button>
              </form>
              {lShowTrustBadges && (
              <div className="grid grid-cols-3 gap-3 p-6 pt-0 border-t-0 mt-[-10px]">
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <ShieldCheck className="text-green-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">১০০% অরিজিনাল</p>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <Truck className="text-blue-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">ক্যাশ অন ডেলিভারি</p>
                </div>
                <div className="flex flex-col items-center text-center p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <RefreshCcw className="text-orange-600 mb-1" size={20} />
                  <p className="text-[10px] font-black text-gray-700">রিপ্লেসমেন্ট গ্যারান্টি</p>
                </div>
              </div>
              )}
            </div>
          </div>
        </section>
        {/* Long Copy Section */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-3xl space-y-12">
            {/* Image Carousel */}
            {(() => {
              const carouselImages = [...lExtraImages].filter(Boolean);
              return carouselImages.length > 0 ? (
                <div className="mb-8">
                  <ImageCarousel images={carouselImages} />
                </div>
              ) : null;
            })()}
            {lBodyText && (
              <div className="bg-amber-50 rounded-2xl p-6 md:p-8 mb-12 shadow-sm border border-amber-100/50">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-medium text-lg md:text-xl">
                  {lBodyText}
                </div>
              </div>
            )}
            {/* YouTube Videos */}
            {lVideoUrls.filter(Boolean).length > 0 && (
              <div className="space-y-6 mb-12">
                {lVideoUrls.filter(Boolean).map((url, idx) => {
                  const embedUrl = getYouTubeEmbedUrl(url);
                  return embedUrl ? (
                    <div key={idx} className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                      <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={`YouTube video ${idx + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div className="text-center space-y-4">
              <h3 className="text-2xl md:text-4xl font-black text-secondary font-sans">কেন আমাদের প্রোডাক্টটি কিনবেন?</h3>
              <div className="w-16 h-1.5 bg-primary rounded-full mx-auto" />
            </div>
            
            {/* Key Value Propositions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                  <Zap className="text-primary" size={18} /> প্রিমিয়াম কোয়ালিটি
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  আমরা সরাসরি কারখানা থেকে সেরা মান নিশ্চিত করে কাস্টমারকে প্রোডাক্টটি সরবরাহ করে থাকি।
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                  <ThumbsUp className="text-primary" size={18} /> সহজ ব্যবহার উপযোগিতা
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  যেকোনো বয়সের মানুষের জন্য অত্যন্ত আরামদায়ক ও সহজ ডিজাইন নিশ্চিত করা হয়েছে।
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                  <Truck className="text-primary" size={18} /> দ্রুত ডেলিভারি সুবিধা
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  অর্ডার করার ২৪ থেকে ৭২ ঘণ্টাএ° মধ্যে আমরা সরাসরি কাস্টমারের কাছে হোম ডেলিভারি দিয়ে থাকি।
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-secondary text-base flex items-center gap-2">
                  <ShieldCheck className="text-primary" size={18} /> নিশ্চিন্তে ক্যাশ অন ডেলিভারি
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  প্রোডাক্ট হাতে পেয়ে কোয়ালিটি চেক করে সম্পূর্ণ সন্তুষ্ট হয়ে তারপরে মূল্য পরিশোধ করার সুবিধা।
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-[#1a1a1a] text-white/60 text-center py-8 border-t border-gray-800 text-xs font-bold">
          <p>Â© {new Date().getFullYear()} i SHOP BD. All Rights Reserved.</p>
        </footer>
        {/* Order Receipt Modal (Reused) */}
        <AnimatePresence>
          {completedOrderReceipt && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCompletedOrderReceipt(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="overflow-y-auto flex-1 w-full scroll-smooth no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div ref={receiptRef} className="bg-white pb-6 w-full h-max">
                  <div className="p-6 md:p-8 bg-green-50 border-b border-green-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                      <ShieldCheck size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-1">অর্ডার সফল হয়েছে!</h3>
                    <p className="text-green-600 text-sm font-medium">অর্ডার আইডি: #{String(completedOrderReceipt.orderId || "N/A").slice(-6).toUpperCase()}</p>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                        <User size={18} className="text-primary" /> কাস্টমার বিবরণ
                      </h4>
                      <div className="space-y-3 text-sm">
                        <p><span className="font-bold text-gray-500">নাম:</span> {completedOrderReceipt.customerName}</p>
                        <p><span className="font-bold text-gray-500">ফোন:</span> {completedOrderReceipt.customerPhone}</p>
                        <p><span className="font-bold text-gray-500">ঠিকানা:</span> {completedOrderReceipt.address}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-primary" /> প্রোডাক্ট বিবরণ
                      </h4>
                      <div className="space-y-3 mb-4">
                        {completedOrderReceipt.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                              <p className="font-bold text-secondary text-sm">{item.product?.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.quantity} টি</p>
                            </div>
                            <p className="font-black text-secondary text-sm">৳{item.product?.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <p>সাবটোটাল</p>
                          <p>৳{completedOrderReceipt.subtotal}</p>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <p>ডেলিভারি চার্জ</p>
                          <p>৳{completedOrderReceipt.deliveryCharge}</p>
                        </div>
                        <div className="flex justify-between font-black text-lg text-secondary pt-2 border-t">
                          <p>সর্বমোট</p>
                          <p className="text-primary">৳{completedOrderReceipt.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex-1 py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isDownloadingReceipt ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    রিসিট ডাউনলোড
                  </button>
                  <button
                    onClick={() => {
                      setCompletedOrderReceipt(null);
                      // Clear url parameters to return to home
                      const url = new URL(window.location.href);
                      url.searchParams.delete("landing");
                      window.history.pushState({}, "", url.toString());
                      window.location.reload();
                    }}
                    className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 font-black text-sm rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                  >
                    হোম পেজে ফিরে যান
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }


























  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Bulk Action Floating Bar */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-white shadow-2xl rounded-2xl border border-gray-200 p-4 flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedOrderIds.length}
              </span>
              <span className="text-sm font-bold text-gray-600 hidden sm:inline-block">অর্ডার সিলেক্ট করা হয়েছে</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBulkSendToSteadfast}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Package size={16} />
                <span className="hidden sm:inline">Steadfast</span>
              </button>
              
              <select
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  if (!newStatus) return;
                  
                  const promises = selectedOrderIds.map(id => {
                    return updateDoc(doc(db, "orders", id), { status: newStatus });
                  });
                  
                  toast.promise(Promise.all(promises), {
                    loading: 'স্ট্যাটাস আপডেট হচ্ছে...',
                    success: `${selectedOrderIds.length} টি অর্ডারের স্ট্যাটাস আপডেট হয়েছে!`,
                    error: 'আপডেট করতে সমস্যা হয়েছে!'
                  });
                  
                  setSelectedOrderIds([]);
                  e.target.value = "";
                }}
                className="bg-indigo-600 text-white px-3 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all outline-none cursor-pointer"
              >
                <option value="">স্ট্যাটাস...</option>
                <option value="pending">পেন্ডিং</option>
                <option value="confirmed">কনফার্মড</option>
                <option value="shipped">শিফট</option>
                <option value="delivered">ডেলিভারড</option>
                <option value="cancelled">ক্যান্সেল</option>
              </select>
              <button 
                onClick={() => {
                   toast.success(`${selectedOrderIds.length} টি ইনভয়েস প্রিন্টের জন্য রেডি!`);
                   setSelectedOrderIds([]);
                }}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">প্রিন্ট</span>
              </button>
              
              <button 
                onClick={() => setSelectedOrderIds([])}
                className="p-2.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Quota Error Alert */}
      {isQuotaExceeded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-red-600 text-white text-center py-2.5 px-4 text-[10px] md:text-xs font-black z-[1000] flex flex-col items-center justify-center gap-1 shadow-2xl relative"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="uppercase">লিমিটেড মোড অ্যাক্টিভেটেড (Quota Exceeded)</span>
          </div>
<p className="opacity-90 max-w-xl">অ্যাডমিন প্যানেল থেকে নতুন প্রোডাক্ট বা অফার আপডেট করুন। সকল গ্রাহক পেজ থেকে সহজেই তথ্য দেখতে পারবেন।</p>
        </motion.div>
      )}
      {/* 1. Header */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <h1
              className="text-xl md:text-3xl font-extrabold text-primary tracking-tighter cursor-pointer flex flex-col group"
              onClick={() => {
                setIsProductDetailsOpen(false);
                setIsAdminOpen(false);
                setActiveCampaign(null);
                setSelectedCategory("all");
                setSearchInput("");
                setIsChatOpen(false);
                setIsProfileOpen(false);
                setIsCheckoutOpen(false);
                setIsNotifOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title="Action"
            >
              <div className="flex transition-transform group-hover:scale-105">i SHOP <span className="text-secondary ml-1">BD</span></div>
              <span className="text-[8px] md:text-[10px] font-bold text-gray-500 -mt-1 uppercase tracking-[0.2em]">আই শপ বিডি</span>
            </h1>
          </div>
          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl relative hidden md:block">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <input
                type="text"
                placeholder={t("আপনার কাঙ্ক্ষিত পণ্য খুঁজুন...", "Search your desired products...")}
                className="w-full bg-cream border-none rounded-md py-2.5 px-4 pr-12 focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button className="absolute right-0 top-0 h-full px-5 bg-primary text-white rounded-r-full hover:bg-red-700 transition-all shadow-md active:scale-95">
                <Search size={20} />
              </button>
            </form>
          </div>
          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4 text-secondary">
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold shadow-md shadow-orange-500/20 transition-all hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 text-xs md:text-sm ml-2 md:ml-0"
              title={t("অর্ডার ট্র্যাক করুন", "Track Order")}
            >
              <Truck size={18} />
              <span className="hidden md:inline">{t("ট্র্যাক অর্ডার", "Track Order")}</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  if (isMasterAdmin) {
                    setAdminViewMode("full");
                    setAdminTab("orders");
                  } else {
                    setAdminViewMode("support_only");
                    setAdminTab("support");
                  }
                  setIsAdminOpen(true);
                }}
                className={`flex items-center justify-center transition-all active:scale-95 rounded-xl ${isMasterAdmin ? "p-2 text-primary hover:bg-gray-100" : "bg-secondary text-white gap-2 px-3 md:px-4 py-2 text-[10px] font-black hover:bg-black"}`}
                title={isMasterAdmin ? t("ড্যাশবোর্ড", "Dashboard") : t("সাপোর্ট", "Support")}
              >
                {isMasterAdmin ? (
                  <LayoutDashboard size={24} className="hover:scale-110 transition-transform" />
                ) : (
                  <Headset size={24} className="hover:scale-110 transition-transform" />
                )}
              </button>
            )}
            <button
              onClick={handleCheckNotifications}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
              title={t("নোটিফিকেশন", "Notifications")}
            >
              <Bell size={22} className={unseenNotifCount > 0 ? "text-primary fill-primary/10 animate-pulse" : "text-secondary"} />
              {unseenNotifCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white animate-bounce" />
              )}
            </button>
            <button
              onClick={openCartCheckout}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-1">
              {!authReady ? (
                <div className="p-1.5 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {!user ? (
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setAuthModalType("login");
                      }}
                      disabled={isLoggingIn}
                      title={t("লগইন", "Login")}
                    >
                      <User
                        size={22}
                        className={
                          isLoggingIn ? "text-gray-300" : "text-gray-600"
                        }
                      />
                      {!isLoggingIn && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full flex items-center justify-center">
                          <Plus size={8} className="text-white" />
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded-full transition-colors relative group border border-transparent hover:border-primary/20"
                      disabled={isLoggingIn}
                      onClick={() => setIsProfileOpen(true)}
                    >
                      {isLoggingIn ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary/5">
                            {(userProfile?.photoURL || user?.photoURL) ? (
                              <img src={userProfile?.photoURL || user?.photoURL || ""} alt="User" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <User
                                 size={22}
                                 className="text-primary"
                              />
                            )}
                          </div>
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile Animated Search Bar */}
        <div className="px-4 pb-3 md:hidden">
          <motion.div className="flex items-center gap-2" initial={false}>
            {!isMobileSearchExpanded ? (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setIsMobileSearchExpanded(true)}
                className="p-1 text-primary"
              >
                <Search size={28} />
              </motion.button>
            ) : (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                className="relative flex items-center w-full"
              >
                <input
                  id="mobile-search-input"
                  type="text"
                  autoFocus
                  placeholder={t("আপনার পছন্দের পণ্য খুঁজুন...", "Search your favorite items...")}
                  className="w-full bg-[#f1f4f6] border border-primary rounded-lg py-2.5 px-4 pr-12 shadow-sm outline-none text-sm font-medium text-secondary"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onBlur={() => {
                    if (!searchInput) setIsMobileSearchExpanded(false);
                  }}
                />
                <button
                  onClick={() => setIsMobileSearchExpanded(false)}
                  className="absolute right-3 text-gray-400 p-1"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
        {/* Mobile Category List (Scrollable like screenshot) */}
        {!activeCampaign && !campaignParam && (
          <div className="border-t border-gray-100 md:hidden bg-cream overflow-hidden">
            <div className="flex overflow-x-auto no-scrollbar py-3 px-4 gap-6 scroll-smooth">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap text-base font-bold transition-all relative ${
                  selectedCategory === "all"
                    ? "text-primary"
                    : "text-gray-500 hover:text-secondary"
                }`}
              >
                {t("সবগুলো", "All")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`whitespace-nowrap text-sm font-bold transition-all px-3 py-1 rounded-full ${selectedCategory === cat.name ? "bg-primary text-white shadow-sm" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}
                >
                  {tc(cat.name)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
      {/* 2. Category Menu - Hide on Mobile since it's integrated in header now */}
      {!activeCampaign && !campaignParam && (
        <nav className="bg-cream/50 border-b overflow-x-auto no-scrollbar hidden md:block">
          <div className="container mx-auto px-4 flex space-x-8 whitespace-nowrap py-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-sm md:text-base font-bold transition-all px-4 py-1.5 rounded-full flex items-center gap-1 ${selectedCategory === "all" ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-200 hover:text-primary"}`}
            >
              {t("সবগুলো", "All")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`text-sm md:text-base font-bold transition-all px-4 py-1.5 rounded-full flex items-center gap-1 ${selectedCategory === cat.name ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-200 hover:text-primary"}`}
              >
                {tc(cat.name)}
              </button>
            ))}
          </div>
        </nav>
      )}
      {/* 3. Hero Banner Slider */}
      {!isProductDetailsOpen && !activeCampaign && !campaignParam && activeBanners.length > 0 && (
        <section className="container mx-auto px-4 mt-4 relative group">
          <div className="relative overflow-hidden shadow-2xl rounded-2xl md:rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`relative w-full ${activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.linkedProductId ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    const heroBanners = activeBanners.filter(b => (b.type || 'hero') === 'hero');
                    const banner = heroBanners[currentBanner % (heroBanners.length || 1)];
                    if (banner?.linkedProductId) {
                      const product = products.find((p) => p.id === banner.linkedProductId);
                      if (product) openProductDetails(product);
                    }
                  }}
                >
                  <img 
                    src={activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.image}
                    className="w-full h-full object-cover block"
                    loading="eager"
                    alt={`i SHOP BD ব্যানার ${currentBanner + 1}`}
                  />
                  <div className="absolute inset-0 flex items-center px-8 md:px-16 text-white">
                    <div className="max-w-md">
                      {(activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.title) && (
                        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`${activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.titleSize || 'text-2xl md:text-4xl'} mb-2 tracking-tight text-white drop-shadow-xl ${
                            activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.titleFont || 'font-ador'
                          } ${
                            activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.titleWeight === 'black' ? 'font-black' : 'font-bold'
                          }`}>
                          {activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.title}
                        </motion.h2>
                      )}
                      {(activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.subtitle) && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                          className={`${activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.subtitleSize || 'text-sm md:text-base'} opacity-90 text-white/90 drop-shadow-lg ${
                            activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.subtitleFont || 'font-ador'
                          }`}>
                          {activeBanners.filter(b => (b.type || 'hero') === 'hero')[currentBanner % (activeBanners.filter(b => (b.type || 'hero') === 'hero').length || 1)]?.subtitle}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              {activeBanners.filter(b => (b.type || 'hero') === 'hero').length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentBanner(prev => (prev - 1 + activeBanners.filter(b => (b.type || 'hero') === 'hero').length) % activeBanners.filter(b => (b.type || 'hero') === 'hero').length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentBanner(prev => (prev + 1) % activeBanners.filter(b => (b.type || 'hero') === 'hero').length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 hover:bg-white/50 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
          </div>
        </section>
      )}
      {(selectedCategory !== "all" ||
        selectedBrand !== "all" ||
        searchQuery) && (
        <div className="container mx-auto px-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 bg-cream p-4 rounded-2xl border border-gray-100"
          >
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              ফিল্টারসমূহ:
            </span>
            {selectedCategory !== "all" && (
              <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-primary/10 shadow-sm">
                ক্যাটাগরি: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="hover:bg-primary/10 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedBrand !== "all" && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm">
                ব্র্যান্ড: {selectedBrand}
                <button
                  onClick={() => setSelectedBrand("all")}
                  className="hover:bg-blue-100 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-white text-gray-600 text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-200 shadow-sm">
                সার্চ: {searchQuery}
                <button
                  onClick={() => setSearchInput("")}
                  className="hover:bg-gray-100 p-0.5 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedBrand("all");
                setSearchInput("");
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-primary transition-colors underline decoration-dotted ml-auto"
            >
              সব রিসেট করুন
            </button>
          </motion.div>
        </div>
      )}
      <main className={`container mx-auto px-4 py-8 flex-1 flex flex-col min-h-[800px] ${isProductDetailsOpen ? 'pt-0' : ''}`}>
        {isCampaignLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-500 animate-pulse font-sans">ক্যাম্পেইন লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
          </div>
        ) : isProductDetailsOpen && selectedProduct ? <ProductDetails {...{ selectedProduct, setIsProductDetailsOpen, handleLikeProduct, likedProducts, ZoomableImage, modalDisplayImage, setModalDisplayImage, setUserInteractedWithGallery, getProductPrice, tempSelectedQty, colorValError, setTempSelectedColor, setColorValError, tempSelectedColor, sizeValError, setTempSelectedSize, setSizeValError, tempSelectedSize, setTempSelectedQty, Minus, handleInlineOrderSubmit, inlineOrderPhone, setInlineOrderPhone, setInlinePhoneFocused, inlinePhoneFocused, savedProfiles, selectSavedProfile, inlineOrderName, setInlineOrderName, isInlineDistrictOpen, inlineDistrictSearch, inlineOrderDistrict, setInlineDistrictSearch, setIsInlineDistrictOpen, InlineDistrictModal, isInlineThanaOpen, inlineThanaSearch, inlineOrderThana, setInlineThanaSearch, setIsInlineThanaOpen, districtThanaMap, setInlineOrderThana, inlineOrderAddress, setInlineOrderAddress, inlineOrderNote, setInlineOrderNote, availableRewardPoints, isApplyingRewardPoints, setIsApplyingRewardPoints, inlineOrderSuccess, validateSelections, addToCartInternal, siteConfig, isInlineOrderProcessing, getDeliveryCharge, inlineOrderArea, setWholesaleSizeQty, sumValues, wholesaleSizeQty, isInlineDistrictOpenWholesale, inlineDistrictSearchWholesale, ALL_DISTRICTS, setInlineOrderDistrict, setInlineOrderArea, isInlineThanaOpenWholesale, inlineThanaSearchWholesale, cleanLatex, activeReviews, setReviewForm, reviewForm, user, handleReviewImageUpload, submitReview, isSubmittingReview, relatedProducts, t, ProductCard, openProductDetails, handleBuyNow, isProductDetailsOpen }} /> : <ShopList {...{ brands, categories, activeCampaign, cleanLatex, setActiveCampaign, Home, selectedCategory, searchQuery, isTrendingFilterActive, newArrivals, t, ProductCard, openProductDetails, handleBuyNow, handleLikeProduct, likedProducts, featuredProducts, featuredScrollRef, handleFeaturedScroll, featuredScrollPercent, setFeaturedScrollPercent, handleFeaturedSliderChange, isProductDetailsOpen, flashSaleProducts, selectedBrand, minPrice, maxPrice, setIsTrendingFilterActive, setSelectedCategory, setSearchInput, setSelectedBrand, setMinPrice, setMaxPrice, setIsFilterMenuOpen, isFilterMenuOpen, sortBy, setSortBy, FilterMenuModal, isLoading, productsPerPage, ProductSkeleton, filteredProducts, PackageOpen, currentPage, setCurrentPage }} />}
  </main>
        {/* Secondary Banner Slider - Added here before trending */}
        {!isProductDetailsOpen && !activeCampaign && activeBanners.filter(b => b.type === 'secondary').length > 0 && (
          <section className="mb-12 container mx-auto px-4">
             <div className="relative overflow-hidden shadow-xl group">
                <AnimatePresence mode="wait">
                   <motion.div
                      key={Math.floor(Date.now() / 5000) % activeBanners.filter(b => b.type === 'secondary').length}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="relative w-full cursor-pointer"
                      onClick={() => {
                         const secondaryBanners = activeBanners.filter(b => b.type === 'secondary');
                         const currentIdx = Math.floor(Date.now() / 5000) % secondaryBanners.length;
                         const banner = secondaryBanners[currentIdx];
                         if (banner?.linkedProductId) {
                            const prod = products.find(p => p.id === banner.linkedProductId);
                            if (prod) openProductDetails(prod);
                         }
                      }}
                   >
                      <img loading="lazy" 
                         src={activeBanners.filter(b => b.type === 'secondary')[Math.floor(Date.now() / 5000) % activeBanners.filter(b => b.type === 'secondary').length]?.image} 
                         className="w-full h-auto block"
                         alt="Secondary Banner"
                      />
                      {/* Lighting Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
                   </motion.div>
                      </AnimatePresence>
    </div>
          </section>
        )}
        {/* Category Sections (Replaces Trending Selection) */}
        {!isProductDetailsOpen && !activeCampaign && categories.map((cat) => {
          const catProducts = products.filter(p => p.category === cat.name);
          if (catProducts.length === 0) return null;
          
          return (
            <section key={cat.id} className="mb-8 container mx-auto px-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-primary"></span>
                  <h3 className="text-xl md:text-2xl font-black text-secondary">
                    {tc(cat.name)}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setTimeout(() => {
                      document.getElementById("product-display-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-sm font-bold text-primary hover:text-primary/80"
                >
                  {t("সব দেখুব", "View All")} "
                </button>
              </div>
              <div className="overflow-x-auto no-scrollbar py-2 -my-2 scroll-smooth">
                <div className="flex gap-2 md:gap-4 pb-4">
                  {catProducts.slice(0, 8).map((product) => (
                    <div key={product.id} className="w-[calc(50%-4px)] md:w-[calc(20%-12.8px)] shrink-0">
                      <ProductCard 
                        product={product}
                        openProductDetails={openProductDetails}
                        t={t}
                        handleBuyNow={handleBuyNow}
                        handleLikeProduct={handleLikeProduct}
                      
                        isLiked={likedProducts.includes(product.id)}
                        />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
        {/* 3.1 Active Campaigns Section */}
        {!isProductDetailsOpen && !activeCampaign && campaigns.filter(c => c.isActive).length > 0 && (
          <section className="mb-12 container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-1 h-6 rounded-full bg-primary"></span>
              <h3 className="text-xl font-black text-secondary uppercase tracking-tight">চালু? ক্যাম্পেইন</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {campaigns.filter(c => c.isActive).map(campaign => (
                <motion.div
                  key={campaign.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    setActiveCampaign(campaign);
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setSearchInput('');
                    const url = new URL(window.location.href);
                    url.searchParams.set('campaign', campaign.slug);
                    window.history.pushState({}, '', url.toString());
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-gray-100"
                >
                  {campaign.image ? (
                    <img loading="lazy" src={campaign.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={campaign.name} />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-white font-black">{campaign.name}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <h4 className="text-white font-black text-xs md:text-sm line-clamp-1">{campaign.name}</h4>
                    <p className="text-white/70 text-[10px] font-bold">{toBengaliNumber(campaign.productIds?.length || 0)}টি পণ্য</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
        {/* Delivery Policy Notice */}
        {!activeCampaign && (
          <div className="mb-6 container mx-auto px-4">
            <div className="bg-red-100/50 rounded-2xl p-6 border-2 border-dashed border-primary/30">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="bg-primary text-white p-4 rounded-full animate-bounce flex-shrink-0">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-secondary mb-2 text-center md:text-left">
                    {t("ডেলিভারি ও পেমেন্ট পলিসি", "Important Delivery & Payment Policy")}
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed text-center md:text-left">
                    {t("আমাদের প্রতিটি ডেলিভারি খুব যত্ন সহকারে করা হয়। তবে নিরাপত্তার কারণে,", "Every delivery of ours is done with extreme care. However, for security purposes,")}
                    <span className="font-bold text-red-600">
                      
                      {t("দয়া করে ডেলিভারি ম্যানের সামনে বসে পণ্য আনবকরা বা চেক করুন?", "please unbox or check the product while sitting in front of the delivery man.")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Trust Badge / Feature Bar */}
        {!activeCampaign && (
          <div className="mb-10 container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Delivery Charge */}
              <button
                onClick={() => setIsDeliveryInfoOpen(true)}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group text-left"
              >
                <div className="text-primary flex-shrink-0">
                  <Truck size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                    {t("ডেলিভারি চার্জ", "Delivery Charge")}
                    {t("ডেলিভারি চার্জ", "Delivery Charge")}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {t("ঢাকা ৳৮০ | ঢাকা? বাইরে ৳১২০", "Dhaka ৳80 | Outside ৳120")}
                  </p>
                </div>
              </button>
              {/* 100% Authentic */}
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                <div className="text-primary flex-shrink-0">
                  <Award size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">
                    {t("১০০% অরিজিনাল", "100% Authentic")}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {t("কোয়ালিটা গ্যারান্টি", "Guaranteed Quality")}
                  </p>
                </div>
              </div>
              {/* Secure Payment */}
              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
                <div className="text-primary flex-shrink-0">
                  <CreditCard size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary">
                    {t("নিরাপদ পেমেন্ট", "Secure Payment")}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {t("বিকরা/নগদ/করুন?", "Bkash/Nagad/Card")}
                  </p>
                </div>
              </div>
              {/* Change Language */}
              <button
                onClick={() => {
                  const langs: ("bn" | "en" | "ar" | "ur")[] = ["bn", "en", "ar", "ur"];
                  const idx = langs.indexOf(language);
                  setLanguage(langs[(idx + 1) % langs.length]);
                }}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group text-left"
              >
                <div className="text-primary flex-shrink-0">
                  <Languages size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                    {t("Change Language", "Change Language")}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">
                    {language === "bn" ? "বাংলা" : language === "en" ? "English" : language === "ar" ? "العربية" : "اردو"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      <AnimatePresence>
        {isMultiOrderSelectionOpen && <MultiOrderSelectionModal {...{ isMultiOrderSelectionOpen, setIsMultiOrderSelectionOpen, products, activeCampaign, cartItems, openProductDetails, setCartItems, addToCartInternal, setIsCheckoutOpen, cartCount, getProductPrice, proceedToCheckoutFromMulti, t }} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedOrderForRefund && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedOrderForRefund(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-black text-secondary flex items-center gap-2">
                  <RefreshCcw className="text-primary" size={24} /> রিফান্ড রিকোয়েস্ট
                </h3>
                <button
                  onClick={() => setSelectedOrderForRefund(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">অর্ডার ID</p>
                   <p className="text-sm font-bold text-secondary">#{String(selectedOrderForRefund.displayId || selectedOrderForRefund.id).slice(-6).toUpperCase()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">রিফান্ড এমাউন্ট</p>
                   <p className="text-lg font-black text-primary">৳{selectedOrderForRefund.total}</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">রিফান্ড চাওয়ার কারণ</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                          placeholder="পণ্যটি কেন ফেরত দিতে চান বিস্তারিত লিখুন..."
                    rows={4}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleRequestRefund}
                disabled={isSubmittingRefund || !refundReason.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingRefund ? "পাঠানো হচ্ছে..." : "সাবমিট করুন"} <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCourierModalOpen && courierSelection.order && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCourierModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-xl font-black text-secondary flex items-center gap-2">
                  <Truck className="text-primary" size={24} /> কুরিয়ারে পাঠান
                </h3>
                <button
                  onClick={() => setIsCourierModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">কুরিয়ার সার্ভিস</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Steadfast", "Pathao", "RedX"].map((service) => (
                      <button
                        key={service}
                        onClick={() => setCourierSelection({...courierSelection, service})}
                        className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                          courierSelection.service === service 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ট্র্যাকিং আইডি (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={courierSelection.trackingId}
                    onChange={(e) => setCourierSelection({...courierSelection, trackingId: e.target.value})}
                    placeholder="উদা: SF12345678"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ক্যাশ কালেকশন পরিমাণ</label>
                  <input
                    type="number"
                    value={courierSelection.codAmount === undefined ? (courierSelection.order?.codAmount !== undefined ? courierSelection.order.codAmount : (courierSelection.order?.total || 0)) : courierSelection.codAmount}
                    onChange={(e) => setCourierSelection({...courierSelection, codAmount: e.target.value === "" ? 0 : Number(e.target.value)})}
                    placeholder="উদা: 500"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <Copy size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">অটো-কপি ফিচাট</p>
                      <p className="text-[10px] text-blue-700 font-bold leading-relaxed">কনফার্ম করলে কাস্টমারের সকল তথ্য (নাম, ফোন, ঠিকানা) অটোমেটিক কপি হয়ে যাবে কুরিয়ার প্যানেলে পেস্ট করার জন্য।</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirmCourier}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                শিপিং কনফার্ম করুন <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAdminOpen && <AdminPanel {...{ isAdminOpen, ProfitAnalysis, activeBanners, activeProductDropdown, addVariant, adminChatEndRef, adminEndDate, adminKeys, adminList, adminOrderAreaFilter, adminOrdersLimit, adminReplyingTo, adminStartDate, adminTab, adminViewMode, allOrderPhones, blacklist, bulkNotifForm, bulkSmsMessage, bulkSmsPage, bulkSmsProgress, bulkSmsResult, bulkSmsSearch, bulkSmsSelectedPhones, campaigns, categories, checkCourierReport, copyCategoryLink, copyLandingPageLink, courierReports, deleteCampaign, deleteCategory, deleteOrder, deleteProduct, deletingCatId, editingAdmin, editingBanner, editingCampaign, editingCategory, editingProduct, expenses, exportDropdownRef, exportOrdersToCSV, filteredOrders, formatOrderGroupDate, getCustomerStats, getOrderLocalDateString, handleAddAdmin, handleAdminChatImageUpload, handleAdminImageUpload, handleAdminMultiImageUpload, handleAdminReply, handleAdminVoiceToggle, handleApproveRefund, handleDeleteAdmin, handleDeleteBanner, handleDuplicateProduct, handleEditUserBalance, handlePrintInvoice, handleQuickEditOrderItems, handleSaveBanner, handleSaveQuickEdit, handleSaveSiteConfig, handleSelectAll, handleSelectOrder, handleSendBulkNotification, handleSendBulkSms, handleSendDirectNotification, handleSendIndividualSms, handleToggleReaction, handleUpdateAdmin, handleUpdateOrderStatus, handleUpdatePaymentMethod, handleVariantImageUpload, incompleteOrders, individualSmsMessage, individualSmsOrder, isAdminRecording, isExportDropdownOpen, isMasterAdmin, isSendingBulkNotif, isSendingBulkSms, isSendingIndividualSms, isUsersLoading, limit, loadingCourierReports, newAdminEmail, newAdminPassword, newAdminPhone, newAdminRole, newBanner, notifications, openLandingEditor, orderHistory, orderSearchQuery, productDropdownRef, productFormErrors, products, query, quickEditData, quickEditOrderId, refundRequests, removeImage, removeVariant, replyMessage, reportTimeframe, saveCampaign, saveCategory, saveProduct, selectChat, selectedChat, selectedOrderIds, selectedOrderStatusFilter, sendToCourier, setActiveProductDropdown, setAdminEndDate, setAdminKeys, setAdminOrderAreaFilter, setAdminOrdersLimit, setAdminReplyingTo, setAdminStartDate, setAdminTab, setBulkNotifForm, setBulkSmsMessage, setBulkSmsPage, setBulkSmsSearch, setBulkSmsSelectedPhones, setCompletedOrderReceipt, setCourierModalPhone, setEditingAdmin, setEditingBanner, setEditingCampaign, setEditingCategory, setEditingProduct, setIndividualSmsMessage, setIndividualSmsOrder, setIsAdminOpen, setIsCourierHistoryModalOpen, setIsExportDropdownOpen, setIsQuotaExceeded, setIsUsersLoading, setNewAdminEmail, setNewAdminPassword, setNewAdminPhone, setNewAdminRole, setNewBanner, setNotifications, setOrderSearchQuery, setProductFormErrors, setQuickEditData, setQuickEditOrderId, setReplyMessage, setReportTimeframe, setSelectedChat, setSelectedOrderForDetails, setSelectedOrderStatusFilter, setShowOnlyPreOrders, setSiteConfig, setUserList, setUserListSearch, showOnlyPreOrders, siteConfig, supportChats, toggleBlacklist, togglePublishStatus, userList, userListSearch }} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedOrderForDetails && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderForDetails(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary">অর্ডার ডিটেইলস</h3>
                    <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">Order ID: #{String(selectedOrderForDetails.displayId || selectedOrderForDetails.id).slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Customer Section */}
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> কাস্টমার ইনফরমেশন
                    </h4>
                    {isAdminVerified && (
                      <button
                        onClick={() => {
                          if (isEditingOrder) {
                            handleUpdateOrderDetails();
                          } else {
                            setEditingOrderData({
                              customerName: selectedOrderForDetails.customerName,
                              customerPhone: selectedOrderForDetails.customerPhone,
                              address: selectedOrderForDetails.address,
                              items: JSON.parse(JSON.stringify(selectedOrderForDetails.items || []))
                            });
                            setIsEditingOrder(true);
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary hover:text-white transition-colors"
                      >
                        {isEditingOrder ? "সেভ করুন" : "এডিট করুন"}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase block mb-1">নাম</label>
                      {isEditingOrder ? (
                        <input type="text" value={editingOrderData.customerName || ""} onChange={e => setEditingOrderData({...editingOrderData, customerName: e.target.value})} className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary" />
                      ) : (
                        <p className="font-bold text-secondary">{selectedOrderForDetails.customerName}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase block mb-1">ফোন</label>
                      {isEditingOrder ? (
                        <input type="text" value={editingOrderData.customerPhone || ""} onChange={e => setEditingOrderData({...editingOrderData, customerPhone: e.target.value})} className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary" />
                      ) : (
                        <p className="font-bold text-secondary">{selectedOrderForDetails.customerPhone}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-primary uppercase block mb-1">ঠিকানা</label>
                      {isEditingOrder ? (
                        <textarea value={editingOrderData.address || ""} onChange={e => setEditingOrderData({...editingOrderData, address: e.target.value})} className="w-full text-sm border p-2 rounded outline-none focus:ring-1 focus:ring-primary" rows={2} />
                      ) : (
                        <p className="text-sm font-bold text-gray-600 leading-relaxed">{selectedOrderForDetails.address}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Fraud Check / History Section */}
                {(() => {
                  const customerHistory = orderHistory.filter(o => o.customerPhone === selectedOrderForDetails.customerPhone);
                  const totalOrders = customerHistory.length;
                  const delivered = customerHistory.filter(o => o.status === "delivered").length;
                  const returned = customerHistory.filter(o => ["cancelled", "returned", "failed"].includes(o.status)).length;
                  
                  const successRate = totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0;
                  const isRisky = returned > 0 || successRate < 50;
                  return (
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={14} className={isRisky ? "text-red-500" : "text-green-500"} /> কাস্টমার অর্ডার হিস্ট্রি (ইন্টারনাল)
                        </h4>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isRisky ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                          {totalOrders <= 1 && returned === 0 ? "নতুন কাস্টমার" : isRisky ? "রিস্কি কাস্টমার" : "সেইফ কাস্টমার"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded-2xl text-center">
                          <span className="text-[10px] font-bold text-gray-400 block mb-1">মোট অর্ডার</span>
                          <span className="text-lg font-black text-gray-800">{totalOrders}</span>
                        </div>
                        <div className="bg-green-50 p-3 rounded-2xl text-center border border-green-100">
                          <span className="text-[10px] font-bold text-green-500 block mb-1">ডেলিভারি</span>
                          <span className="text-lg font-black text-green-700">{delivered}</span>
                        </div>
                        <div className="bg-red-50 p-3 rounded-2xl text-center border border-red-100">
                          <span className="text-[10px] font-bold text-red-500 block mb-1">রিটার্ন/ক্যানসেল</span>
                          <span className="text-lg font-black text-red-700">{returned}</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
                          <span className="text-[10px] font-bold text-blue-500 block mb-1">সাকসেস রেট</span>
                          <span className="text-lg font-black text-blue-700">{successRate}%</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-3 text-center">
                        * পরবর্তী প্রতি কেজিতে ২০ টাকা করে অতিরিক্ত যুক্ত হবে।
                      </p>
                    </div>
                  );
                })()}
                {/* Status & Payment Section */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">স্ট্যাটাস</label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        selectedOrderForDetails.status === "pending"
                          ? "bg-purple-500"
                          : selectedOrderForDetails.status === "confirmed"
                          ? "bg-blue-500"
                          : selectedOrderForDetails.status === "shipped"
                          ? "bg-indigo-500"
                          : selectedOrderForDetails.status === "delivered"
                          ? "bg-emerald-500"
                          : selectedOrderForDetails.status === "returned"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`} />
                      <span className={`font-bold uppercase text-xs ${
                        selectedOrderForDetails.status === "pending"
                          ? "text-purple-600"
                          : selectedOrderForDetails.status === "confirmed"
                          ? "text-blue-600"
                          : selectedOrderForDetails.status === "shipped"
                          ? "text-indigo-600"
                          : selectedOrderForDetails.status === "delivered"
                          ? "text-emerald-600"
                          : selectedOrderForDetails.status === "returned"
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}>{selectedOrderForDetails.status}</span>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">পেমেন্ট মেথড</label>
                    <select
                      value={selectedOrderForDetails.paymentMethod || "CASH"}
                      onChange={async (e) => {
                        const newMethod = e.target.value;
                        setSelectedOrderForDetails(prev => prev ? { ...prev, paymentMethod: newMethod } : null);
                        await handleUpdatePaymentMethod(selectedOrderForDetails.id, newMethod);
                      }}
                      className="font-bold text-primary uppercase text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary shadow-sm w-full cursor-pointer"
                    >
                      <option value="CASH">CASH (ক্যাশ)</option>
                      <option value="BKASH">BKASH (বিকাশ)</option>
                      <option value="NAGAD">NAGAD (নগদ)</option>
                      <option value="DUE">DUE (ডিউ)</option>
                      <option value="BANK">BANK (ব্যাংক)</option>
                      <option value="ONLINE">ONLINE (অনলাইন পেমেন্ট)</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">ক্যাশ কালেক্ট পরিমাণ</label>
                    <input
                      type="number"
                      value={selectedOrderForDetails.codAmount === undefined ? selectedOrderForDetails.total : selectedOrderForDetails.codAmount}
                      onChange={async (e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value);
                        setSelectedOrderForDetails(prev => prev ? { ...prev, codAmount: val } : null);
                        try {
                          const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                          await updateDoc(orderRef, { codAmount: val });
                          setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, codAmount: val } : o));
                        } catch (err) {
                          console.error("Failed to update COD amount", err);
                        }
                      }}
                      className="font-bold text-primary text-xs bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary shadow-sm w-full"
                    />
                  </div>
                </div>
                {/* Items Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                    <ShoppingBag size={12} /> অর্ডার করা পণ্যসমূহ
                  </h4>
                  <div className="space-y-3">
                    {(isEditingOrder ? editingOrderData.items : selectedOrderForDetails.items)?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shrink-0 bg-white">
                          <img src={item.product?.image} loading="lazy" decoding="async" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary text-sm truncate">{item.product?.name}</p>
                          {isEditingOrder ? (
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex flex-col gap-1 shrink-0">
                                <label className="text-[8px] font-black text-gray-400 uppercase">পরিমাণ</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQty = Math.max(1, Number(e.target.value));
                                    const newItems = [...editingOrderData.items];
                                    newItems[idx].quantity = newQty;
                                    setEditingOrderData({ ...editingOrderData, items: newItems });
                                  }}
                                  className="w-16 text-xs font-bold border border-gray-200 rounded p-1.5 text-center outline-none focus:ring-1 focus:ring-primary bg-white"
                                />
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">কালার</label>
                                {item.product?.colors && item.product.colors.length > 0 ? (
                                  <select
                                    value={item.color || ""}
                                    onChange={(e) => {
                                      const newItems = [...editingOrderData.items];
                                      newItems[idx].color = e.target.value;
                                      setEditingOrderData({ ...editingOrderData, items: newItems });
                                    }}
                                    className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                                  >
                                    <option value="">N/A (নাই)</option>
                                    {item.product.colors.map((c: string, cIdx: number) => (
                                      <option key={cIdx} value={c}>{c}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={item.color || ""}
                                    placeholder="কালার লিখুন"
                                    onChange={(e) => {
                                      const newItems = [...editingOrderData.items];
                                      newItems[idx].color = e.target.value;
                                      setEditingOrderData({ ...editingOrderData, items: newItems });
                                    }}
                                    className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase">সাইজ</label>
                                {item.product?.sizes && item.product.sizes.length > 0 ? (
                                  <select
                                    value={item.size || ""}
                                    onChange={(e) => {
                                      const newItems = [...editingOrderData.items];
                                      newItems[idx].size = e.target.value;
                                      setEditingOrderData({ ...editingOrderData, items: newItems });
                                    }}
                                    className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                                  >
                                    <option value="">N/A (নাই)</option>
                                    {item.product.sizes.map((s: string, sIdx: number) => (
                                      <option key={sIdx} value={s}>{s}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={item.size || ""}
                                    placeholder="সাইজ লিখুন"
                                    onChange={(e) => {
                                      const newItems = [...editingOrderData.items];
                                      newItems[idx].size = e.target.value;
                                      setEditingOrderData({ ...editingOrderData, items: newItems });
                                    }}
                                    className="w-full text-xs font-bold border border-gray-200 rounded p-1.5 outline-none focus:ring-1 focus:ring-primary bg-white"
                                  />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</span>
                              {item.color && item.color !== "N/A" && (
                                 <span className="text-xs bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl font-bold text-red-600 shadow-sm">কালার: {item.color}</span>
                              )}
                              {item.size && item.size !== "N/A" && (
                                 <span className="text-xs bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl font-bold text-blue-600 shadow-sm">সাইজ: {item.size}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary">৳{getProductPrice(item.product, item.quantity) * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Totals Section */}
                <div className="bg-secondary text-white rounded-[2rem] p-8 space-y-4">
                  <div className="flex justify-between items-center text-secondary-foreground opacity-60">
                    <span className="text-xs font-bold"> Sন</span>
                    <span className="font-bold italic">
                      {selectedOrderForDetails.totalWeight 
                        ? (selectedOrderForDetails.totalWeight >= 1 
                          ? `${selectedOrderForDetails.totalWeight.toFixed(2)} কেজি`
                          : `${(selectedOrderForDetails.totalWeight * 1000).toFixed(0)} গ্রাম`)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-secondary-foreground opacity-60">
                    <span className="text-xs font-bold">সাব-টোটাল</span>
                    <span className="font-bold italic">৳{selectedOrderForDetails.subtotal || selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0)}</span>
                  </div>
                   <div className="flex justify-between items-center text-secondary-foreground pb-4 border-b border-white/10">
                    <span className="text-xs font-bold opacity-60">ডেলিভারি চার্জ</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={selectedOrderForDetails.deliveryCharge === undefined || selectedOrderForDetails.deliveryCharge === null ? "" : selectedOrderForDetails.deliveryCharge}
                        onChange={async (e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          const subtotal = selectedOrderForDetails.subtotal || (selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0));
                          const newTotal = subtotal + val;
                          
                          setSelectedOrderForDetails(prev => prev ? { ...prev, deliveryCharge: val, total: newTotal } : null);
                          
                          try {
                            const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                            await updateDoc(orderRef, { deliveryCharge: val, total: newTotal });
                            setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, deliveryCharge: val, total: newTotal } : o));
                          } catch (err) {
                            console.error("Failed to update delivery charge", err);
                          }
                        }}
                        className="w-16 text-right bg-white/10 text-white border border-white/20 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const val = 0;
                          const subtotal = selectedOrderForDetails.subtotal || (selectedOrderForDetails.total - (selectedOrderForDetails.deliveryCharge || 0));
                          const newTotal = subtotal;
                          
                          setSelectedOrderForDetails(prev => prev ? { ...prev, deliveryCharge: val, total: newTotal } : null);
                          
                          try {
                            const orderRef = doc(db, "orders", selectedOrderForDetails.id);
                            await updateDoc(orderRef, { deliveryCharge: val, total: newTotal });
                            setOrderHistory(prev => prev.map(o => o.id === selectedOrderForDetails.id ? { ...o, deliveryCharge: val, total: newTotal } : o));
                          } catch (err) {
                            console.error("Failed to update delivery charge", err);
                          }
                        }}
                        className="text-[10px] bg-red-600 hover:bg-red-700 text-white font-black px-2 py-1 rounded transition-all active:scale-95 shadow-md"
                      >
                        ফ্রি
                      </button>
                    </div>
                  </div>
                  {selectedOrderForDetails.pointsUsed > 0 && (
                    <div className="flex justify-between items-center text-[#ffeb3b] pb-4 border-b border-white/10">
                      <span className="text-xs font-bold">রিওয়ার্ড পয়েন্ট ব্যবহৃত ({selectedOrderForDetails.pointsUsed} পয়েন্ট)</span>
                      <span className="font-bold italic">-৳{selectedOrderForDetails.pointsDiscount || Math.floor(selectedOrderForDetails.pointsUsed / 10)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold tracking-tight"></span>
                    <span className="text-2xl font-bold text-primary italic drop-shadow-lg">৳{selectedOrderForDetails.total}</span>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                 <button 
                   onClick={() => {
                     sendToCourier(selectedOrderForDetails);
                     setSelectedOrderForDetails(null);
                   }}
                   className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <Truck size={18} /> কুরিয়ারে পাঠান
                 </button>
                 {selectedOrderForDetails.status === "pending" && (
                    <button 
                      onClick={() => {
                        handleUpdateOrderStatus(selectedOrderForDetails.id, "confirmed");
                        setSelectedOrderForDetails(null);
                      }}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle size={18} /> কনফার্ম করুন
                    </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Courier History Modal */}
      <AnimatePresence>
        {isCourierHistoryModalOpen && <CourierHistoryModal {...{ isCourierHistoryModalOpen, setIsCourierHistoryModalOpen, courierModalPhone, setCourierModalPhone, checkCourierReport, loadingCourierReports, courierReports, AlertTriangle }} />}
      </AnimatePresence>
      {/* Floating Admin/Support Buttons */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {isAdmin && (
          <button
            onClick={() => {
              setAdminViewMode("support_only");
              setAdminTab("orders");
              setIsAdminOpen(true);
            }}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center relative group overflow-hidden border-2 border-white/20"
            title="Action"
          >
            <Headset size={28} strokeWidth={2.5} />
            {(supportChats.filter(c => c.unreadByAdmin).length > 0 || orderHistory.filter(o => o.status === "pending").length > 0) && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {(supportChats.filter(c => c.unreadByAdmin).length + orderHistory.filter(o => o.status === "pending").length)}
              </span>
            )}
            <span className="absolute right-full mr-4 bg-indigo-600 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              সাপোর্ট ও অর্ডার
            </span>
          </button>
        )}
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-secondary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
          >
            <ShoppingCart size={18} className="text-primary" />
            <span className="text-sm font-bold text-white">
                    পণ্যটি কার্টে যোগ করা হয়েছে!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 5. Footer */}
      {/* 9. User Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && user && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-2xl h-[90vh] md:h-[700px] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10"
            >
              {/* Back button for mobile */}
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 z-[70] p-2 bg-secondary/50 hover:bg-secondary rounded-full text-white md:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              {/* Left Sidebar: Profile Summary */}
              <div className="w-full md:w-80 bg-secondary text-white p-8 flex flex-col overflow-y-auto no-scrollbar max-h-[40vh] md:max-h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative group/avatar">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 overflow-hidden border-2 border-white/20">
                      {(userProfile?.photoURL || user?.photoURL) ? (
                        <img loading="lazy" 
                          src={userProfile?.photoURL || user?.photoURL || ""} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.displayName?.[0] || "U"
                      )}
                    </div>
                    <label 
                      htmlFor="profile-pic-upload"
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity"
                    >
                      <Camera size={20} className="text-white" />
                    </label>
                    <input 
                      type="file"
                      id="profile-pic-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-lg line-clamp-1">
                      {user.displayName || "Customer"}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {user.email?.endsWith("@mobile.user") 
                        ? user.email.replace("@mobile.user", "")
                        : user.email}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-8 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className="text-primary" size={20} />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      ওয়ালেট ব্যালেন্স
                    </span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    ৳{userProfile?.balance || 0}
                  </p>
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-xl text-xs font-black hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                                <Plus size={16} /> নতুন হোলসেল রেট যোগ করুন
                  </button>
                </div>
                <div className="flex-1 space-y-2">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsAdminOpen(true);
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-secondary text-white font-black text-sm flex items-center gap-3 shadow-lg shadow-secondary/20 hover:scale-[1.02] transition-all"
                    >
                      <ShieldCheck size={18} /> অ্যাডমিন প্যানেল
                    </button>
                  )}
                  <button 
                    onClick={() => setProfileTab("info")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "info" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
                  >
                    <User size={18} /> প্রোফাইল তথ্য
                  </button>
                  <button 
                    onClick={() => setProfileTab("orders")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "orders" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
                  >
                    <History size={18} /> অর্ডার হিস্ট্রি
                  </button>
                  <button 
                    onClick={() => setProfileTab("transactions")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "transactions" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
                  >
                    <Wallet size={18} /> লেনদেনের ইতিহাস
                  </button>
                  <button 
                    onClick={() => setProfileTab("refunds")}
                    className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${profileTab === "refunds" ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-white/5 text-gray-400 border border-transparent"}`}
                  >
                    <RefreshCcw size={18} /> রিফান্ড রিকোয়েস্ট
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-8 flex items-center gap-3 text-red-400 hover:text-red-500 font-bold text-sm transition-colors"
                >
                  <LogOut size={18} /> লগআউট করুন
                </button>
              </div>
              {/* Right Content: Details & Transactions */}
              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-secondary flex items-center gap-2">
                    {profileTab === "transactions" && <><Wallet className="text-primary" size={24} /> লেনদেনের ইতিহাস</>}
                    {profileTab === "orders" && <><History className="text-primary" size={24} /> আপনার অর্ডারসমূহ</>}
                    {profileTab === "info" && <><User className="text-primary" size={24} /> প্রোফাইল তথ্য</>}
                    {profileTab === "refunds" && <><RefreshCcw className="text-primary" size={24} /> রিফান্ড রিকোয়েস্টসমূহ</>}
                  </h4>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                {profileTab === "transactions" && (
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Wallet size={48} className="mx-auto mb-4 text-gray-200" />
                               <p className="text-sm text-gray-400">এখনো কোনো লেনদেন হয়নি</p>
                      </div>
                    ) : (
                      transactions.map((tx: any) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${tx.type === "deposit" || tx.type === "refund" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                              {tx.type === "deposit" && <ArrowDownLeft size={20} />}
                              {tx.type === "refund" && <RefreshCcw size={20} />}
                              {tx.type === "purchase" && <ArrowUpRight size={20} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-secondary">{tx.description} {tx.method && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-1 uppercase">{tx.method}</span>}</p>
                              <p className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleString("bn-BD")}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-sm ${tx.type === "deposit" || tx.type === "refund" ? "text-green-600" : "text-red-600"}`}>
                              {tx.type === "deposit" || tx.type === "refund" ? "+" : "-"} ৳{Math.abs(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {profileTab === "orders" && (
                  <div className="space-y-6">
                    {orderHistory.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <History size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-sm text-gray-400">আপনার কোনো অর্ডার নেই</p>
                      </div>
                    ) : (
                      orderHistory.map((order: any) => (
                        <div key={order.id} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID: #{String(order.displayId || order.id).slice(-6).toUpperCase()}</p>
                              <p className="text-xs font-bold text-gray-500">{order.date}</p>
                            </div>
                            {(() => {
                              let finalStatus = order.status || 'pending';
                              if (order.steadfastStatus) {
                                const st = order.steadfastStatus.toLowerCase();
                                if (st.includes('delivered')) finalStatus = 'delivered';
                                else if (st.includes('cancelled')) finalStatus = 'cancelled';
                                else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatched') || st.includes('picked_up')) finalStatus = 'shipped';
                              } else if (order.pathaoStatus) {
                                const st = order.pathaoStatus.toLowerCase();
                                if (st.includes('delivered')) finalStatus = 'delivered';
                                else if (st.includes('cancelled') || st.includes('return')) finalStatus = 'cancelled';
                                else if (st.includes('transit') || st.includes('shipped') || st.includes('dispatch') || st.includes('pickup')) finalStatus = 'shipped';
                              }
                              
                              let bgColor = 'bg-amber-100 text-amber-700';
                              if (finalStatus === 'delivered') bgColor = 'bg-green-100 text-green-700';
                              else if (finalStatus === 'cancelled') bgColor = 'bg-red-100 text-red-700';
                              else if (finalStatus === 'shipped') bgColor = 'bg-blue-100 text-blue-700';
                              let label = finalStatus;
                              if (finalStatus === 'pending') label = 'প্রসেসিং এ আছে';
                              else if (finalStatus === 'processing') label = 'অর্ডারটি কনফার্ম করা হয়েছে';
                              else if (finalStatus === 'shipped') label = 'শিপমেন্ট করা হয়েছে';
                              else if (finalStatus === 'delivered') label = 'ডেলিভার্ড';
                              else if (finalStatus === 'cancelled') label = 'বাতিল করা হয়েছে';
                              return (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${bgColor}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="space-y-3">
                             {order.items.map((item: any, idx: number) => (
                               <div key={idx} className="flex flex-col py-2 border-b border-gray-50 last:border-0">
                                 <div className="flex justify-between text-base items-center">
                                   <span className="text-[12px] font-black text-gray-900">{item.product.name} <span className="text-lg font-black text-primary ml-2 italic">x{item.quantity}</span></span>
                                   <span className="font-black text-secondary">৳{getProductPrice(item.product, item.quantity) * item.quantity}</span>
                                 </div>
                                 <div className="flex gap-2 mt-1">
                                   {item.color && item.color !== "N/A" && (
                                     <span className="text-[12px] font-black text-primary">
                                       কালার: {item.color}
                                     </span>
                                   )}
                                   {item.size && item.size !== "N/A" && (
                                     <span className="text-[12px] font-black text-blue-600">
                                              সাইজ: {item.size}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             ))}
                          </div>
                          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold">মোট পেমেন্ট</p>
                              <p className="text-lg font-black text-primary">৳{order.total}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {order.status === "delivered" && (
                                <button 
                                  onClick={() => {
                                    setSelectedOrderForRefund(order);
                                    setRefundReason("");
                                  }}
                                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                                >
                                  রিফান্ড রিকোয়েস্ট
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <div className="text-right">
                                  <div className="flex items-center gap-1 justify-end text-[10px] font-black text-primary mb-1">
                                    <Truck size={12} /> {order.courierName || "কুরিয়ার সার্ভিস"}
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-500">ID: {order.trackingId || "প্রসেসিং"}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {profileTab === "refunds" && (
                   <div className="space-y-6">
                      {refundRequests.filter(r => r.userId === user.uid).length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                          <RefreshCcw size={48} className="mx-auto mb-4 text-gray-200" />
                          <p className="text-sm text-gray-400">আপনার কোনো রিফান্ড রিকোয়েস্ট নেই</p>
                        </div>
                      ) : (
                        refundRequests.filter(r => r.userId === user.uid).map((refund: any) => (
                           <div key={refund.id} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">অর্ডার ID: #{String(refund.orderId).slice(-6).toUpperCase()}</p>
                                    <p className="text-xs font-bold text-gray-500">{new Date(refund.createdAt).toLocaleString("bn-BD")}</p>
                                 </div>
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    refund.status === "approved" ? "bg-green-100 text-green-700" :
                                    refund.status === "rejected" ? "bg-red-100 text-red-700" :
                                    "bg-amber-100 text-amber-700"
                                 }`}>
                                    {refund.status === "approved" ? "অ্যাপ্রুভড" :
                                     refund.status === "rejected" ? "রিজেক্টেড" :
                                     "পেন্ডিং"}
                                 </span>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-xl">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">রিফান্ড রিজন</p>
                                 <p className="text-xs font-bold text-secondary">{refund.reason}</p>
                              </div>
                              <div className="flex justify-between items-center">
                                 <p className="text-lg font-black text-primary">৳{refund.amount}</p>
                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">টোটাল রিফান্ড</p>
                              </div>
                           </div>
                        ))
                      )}
                   </div>
                )}
                {profileTab === "info" && (
                   <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
                        <User size={40} className="text-primary" />
                      </div>
                      <p className="font-black text-secondary text-lg mb-1">{user.displayName || "কাস্টমার"}</p>
                      <p className="text-xs text-gray-400 mb-8">
                        {user.email?.endsWith("@mobile.user") 
                          ? user.email.replace("@mobile.user", "")
                          : user.email}
                      </p>
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 text-left shadow-sm">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ব্যালেন্স</label>
                        <p className="text-2xl font-black text-primary">৳{userProfile?.balance || 0}</p>
                      </div>
                   </div>
                )}
                {/* Info Card */}
                <div className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg">
                    <Award size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 text-sm mb-1">
                      রিফান্ড পলিসি
                    </h5>
                    <p className="text-sm text-blue-800 leading-relaxed">
                     পেমেন্ট করার পর ট্রানজেকশন আইডিটি নিচে অটোমেটিক
                      রিফান্ড করা হবে। এই টাকা ব্যবহার করে আপনি পরবর্তী যেকোনো
                      সেট হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 10. Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && <DepositModal {...{ isDepositModalOpen, setIsDepositModalOpen, handleDepositSubmit, setDepositAmount, depositAmount, setDepositMethod, depositMethod, depositTrxId, setDepositTrxId, isPaymentSimulating }} />}
      </AnimatePresence>
      <footer className="bg-[#1a1a1a] text-white pt-12 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-gray-800 pb-12">
            {/* Brand/About */}
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-2xl font-extrabold text-primary mb-6">
                i SHOP BD (আই শপ বিডি)
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                {siteConfig?.aboutUs || "i SHOP BD (আই শপ বিডি) - আপনার বিশ্বস্ত অনলাইন শপিং প্ল্যাটফর্ম। আমরা সুলভ মূল্যে সর্বোচ্চ মানের ইলেকট্রিক গ্যাজেট, স্মার্ট এক্সেসরিজ এবং হোম এপ্লায়েন্স নিশ্চিত করি।"}
              </p>
              <div className="flex gap-4">
                <a
                  href={siteConfig?.facebookUrl || "https://www.facebook.com/online.ishopbd/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
                  title="Follow us on Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || "01777600844"}`}
                  className="p-2 bg-gray-800 rounded-full hover:bg-primary transition-colors"
                  title="Call Us"
                >
                  <Phone size={20} />
                </a>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6">কুইক লিঙ্ক</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => setActivePolicy("about")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    আমাদের সম্পর্কে
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("privacy")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    প্রাইভেসি পলিসি
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("refund")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    রিফান্ড পলিসি
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePolicy("terms")}
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    শর্তাবলী
                  </button>
                </li>
              </ul>
            </div>
            {/* Customer Care */}
            <div>
              <h4 className="font-bold mb-6">কাস্টমার কেয়ার</h4>
              <div className="flex items-center gap-3 mb-4">
                <a
                  href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || "01777600844"}`}
                  className="p-2 bg-primary/20 rounded-lg text-primary hover:bg-primary/30 transition-colors"
                  title="Call Now"
                >
                  <Phone size={20} />
                </a>
                <div>
                  <p className="text-xs text-gray-400">
                    হেল্পলাইন (সকাল ৯টা - রাত ৯টা)
                  </p>
                  <div className="flex flex-col">
                    <a
                      href={`tel:${siteConfig?.supportPhone1?.replace(/[^0-9]/g, '') || "01777600844"}`}
                      className="text-sm font-bold hover:text-primary transition-colors"
                    >
                      {siteConfig?.supportPhone1 || "01777-600844"}
                    </a>
                    <a
                      href={`tel:${siteConfig?.supportPhone2?.replace(/[^0-9]/g, '') || "01977600844"}`}
                      className="text-sm font-bold hover:text-primary transition-colors"
                    >
                      {siteConfig?.supportPhone2 || "01977-600844"}
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={siteConfig?.facebookUrl || "https://www.facebook.com/online.ishopbd/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500/20 rounded-lg text-blue-500 hover:bg-blue-500/30 transition-colors"
                  title="Visit our Facebook Page"
                >
                  <Facebook size={20} />
                </a>
                <div>
<p className="text-xs text-gray-400">ফেসবুক মেসেঞ্জার</p>
                  <a
                    href={siteConfig?.facebookUrl || "https://www.facebook.com/online.ishopbd/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold hover:text-primary transition-colors"
                  >
                    i SHOP BD Official
                  </a>
                </div>
              </div>
            </div>
            {/* Payment Methods */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-bold mb-6">পেমেন্ট মেথড</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                  <span className="text-[10px] font-bold text-[#D12053]">BKASH</span>
                </div>
                <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                  <span className="text-[10px] font-bold text-[#F7941D]">NAGAD</span>
                </div>
                <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                  <span className="text-[10px] font-bold text-[#8C3494]">ROCKET</span>
                </div>
                <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                  <CreditCard size={20} className="text-gray-400" />
                </div>
                <div className="h-10 bg-white/10 rounded flex items-center justify-center p-2">
                  <span className="text-[10px] font-bold">CASH</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-gray-500">
            <p>Â© ২০২৪ i SHOP BD | সকল স্বত্ব সংরক্ষিত।</p>
            <p className="mt-1">
              Developed for the best shopping experience in Bangladesh.
            </p>
          </div>
        </div>
      </footer>
      {/* Floating Chat Support Action Button */}
      {!isAdmin && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] group overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Headset size={32} />
          </motion.div>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      )}
      {/* AI Chat Support Modal */}
      <AnimatePresence>
        {isChatOpen && <ChatModal {...{ setIsChatOpen, chatMessages, user, sessionId, handleToggleReaction, setChatReplyingTo, chatEndRef, chatReplyingTo, handleSendMessage, handleImageUpload, chatMessage, setChatMessage, handleVoiceToggle, isRecording, isChatOpen }} />}
      </AnimatePresence>
      {/* Custom Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && <AuthModal {...{ setIsAuthModalOpen, authModalType, handleCustomAuth, authName, setAuthName, authIdentifier, setAuthIdentifier, authPassword, setAuthPassword, isAuthLoading, handleLogin, Facebook, setAuthModalType, isAuthModalOpen }} />}
      </AnimatePresence>
      {/* Notification Drawer */}
      <AnimatePresence>
        {isNotifOpen && <NotifModal {...{ setIsNotifOpen, notifications, handleClearAllNotifications, handleDismissNotification, Info, products, setSelectedProduct, setIsProductDetailsOpen, toast, isNotifOpen }} />}
      </AnimatePresence>
      {/* Admin Verification Modal */}
      <AnimatePresence>
        {isAdmin && !isAdminVerified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-secondary/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="text-center mb-8 mt-4">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                  {is2FAPending ? <Key size={40} /> : <ShieldCheck size={40} />}
                </div>
                <h3 className="text-2xl font-black text-secondary mb-2">
                  {is2FAPending ? "টু-স্টেপ ভেরিফিকেশন" : "অ্যাডমিন ভেরিফিকেশন"}
                </h3>
                <p className="text-sm text-gray-400 font-medium px-4">
                  {is2FAPending 
                    ? "নিরাপত্তার জন্য আপনার ফোনে পাঠানো ৬ সংখ্যার কোডটি লিখুন।"
                    : "অ্যাডমিন বা মডারেটর প্যানেল ব্যবহার করতে আপনার অ্যাক্সেস পাসওয়ার্ডটি লিখুন।"}
                </p>
              </div>
              <div className="space-y-4">
                {is2FAPending ? (
                  <>
                    {!adminOTPSent ? (
                      <button
                        onClick={handleSendAdminOTP}
                        disabled={isSendingOTP}
                        className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                        {isSendingOTP ? "কোড পাঠানো হচ্ছে..." : "কোড পাঠান (SMS)"}
                        {!isSendingOTP && <Phone size={20} />}
                      </button>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={adminOTPInput}
                          onChange={(e) => setAdminOTPInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleVerifyOTP()
                          }
                          placeholder="ভেরিফিকেশন কোড"
                          className={`w-full bg-gray-50 border ${adminOTPError ? "border-red-500" : "border-gray-200"} rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-primary font-bold text-center text-lg tracking-widest`}
                        />
                        <button
                          onClick={handleVerifyOTP}
                          className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 mt-4"
                        >
                          ভেরিফাই করুন
                        </button>
                        <button
                          onClick={() => setAdminOTPSent(false)}
                          className="w-full text-center text-xs text-primary font-bold mt-4 underline"
                        >
                          পিছনে যান
                        </button>
                      </div>
                    )}
                    {adminOTPError && (
                      <p className="text-xs text-red-500 font-bold text-center mt-2">
                        {adminOTPError}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="password"
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyAdminPassword()
                        }
                        placeholder="ভেরিফিকেশন কোড"
                        className={`w-full bg-gray-50 border ${adminPasswordError ? "border-red-500" : "border-gray-200"} rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-primary font-bold text-center text-lg tracking-widest`}
                      />
                      {adminPasswordError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 font-bold text-center mt-2"
                        >
                          ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।
                        </motion.p>
                      )}
                    </div>
                    <button
                      onClick={handleVerifyAdminPassword}
                      className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      প্যানেল প্রবেশ করুন
                      <ArrowUpRight size={20} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => signOut(auth)}
                  className="w-full bg-white text-gray-400 font-bold py-3 hover:text-red-500 transition-all text-xs"
                >
                    লগ আউট করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Policy Modal */}
        {activePolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePolicy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-bold">
                  {activePolicy === "about" && "আমাদের সম্পর্কে"}
                  {activePolicy === "privacy" && "গোপনীয়তা নীতি"}
                  {activePolicy === "refund" && "রিফান্ড পলিসি"}
                  {activePolicy === "terms" && "নিয়ম S  "}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto text-secondary leading-relaxed space-y-6 overflow-x-hidden no-scrollbar">
                {activePolicy === "about" && (
                  <div className="space-y-4">
                    <p className="font-bold text-lg text-primary">
i SHOP BD - বাংলাদেশের অন্যতম জনপ্রিয় শপ
                    </p>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {siteConfig?.aboutUs}
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="font-black text-secondary mb-2 uppercase text-[10px] md:text-xs tracking-widest">:</p>
                      <p className="text-sm font-bold text-gray-600">
                        হেল্পলাইন ১: {siteConfig?.supportPhone1}
                      </p>
                      <p className="text-sm font-bold text-gray-600 mt-1">
                        হেল্পলাইন ২: {siteConfig?.supportPhone2}
                      </p>
                    </div>
                  </div>
                )}
                {activePolicy === "privacy" && (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {siteConfig?.privacyPolicy}
                  </div>
                )}
                {activePolicy === "refund" && (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {siteConfig?.refundPolicy}
                  </div>
                )}
                {activePolicy === "terms" && (
                  <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
                    {siteConfig?.termsAndConditions}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setActivePolicy(null)}
                  className="bg-secondary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Language Selection Modal */}
      <AnimatePresence>
        {isLangModalOpen && <LangModal {...{ setIsLangModalOpen, Languages, t, languageList, setLanguage, language, isLangModalOpen }} />}
      </AnimatePresence>
      <AnimatePresence>
        {isDeliveryInfoOpen && <DeliveryInfoModal {...{ setIsDeliveryInfoOpen, isDeliveryInfoOpen }} />}
            </AnimatePresence>
            <AnimatePresence>
              {editingUserBalance && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <h4 className="text-xl font-black text-secondary">ব্যালেন্স এডিট</h4>
                </div>
                <button 
                  onClick={() => setEditingUserBalance(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                   <p className="text-sm font-bold text-gray-500 mb-1">ইউজার</p>
                   <p className="font-black text-secondary">{editingUserBalance.displayName || editingUserBalance.email}</p>
                   <p className="text-xs text-gray-400 font-bold">
                     {editingUserBalance.email?.endsWith("@mobile.user") ? editingUserBalance.email.replace("@mobile.user", "") : editingUserBalance.email}
                   </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">বর্তমান ব্যালেন্স</p>
                   <p className="text-2xl font-black text-secondary">৳{editingUserBalance.balance || 0}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">নতুন ব্যালেন্স লিখুন</label>
                  <input 
                    type="number"
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-xl font-black text-secondary focus:border-primary outline-none transition-all shadow-inner"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => setEditingUserBalance(null)}
                  className="flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 font-black text-sm hover:bg-gray-100 transition-all active:scale-95"
                >
                  বাতিল
                </button>
                <button 
                  onClick={confirmBalanceUpdate}
                  disabled={isSyncingData}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSyncingData ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "আপডেট করুন"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* Order Receipt Modal */}
      <AnimatePresence>
        {completedOrderReceipt && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompletedOrderReceipt(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="overflow-y-auto flex-1 w-full scroll-smooth no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div ref={receiptRef} className="bg-white pb-6 w-full h-max">
                <div className="p-6 md:p-8 bg-green-50 border-b border-green-100 flex flex-col items-center text-center">
                  <img loading="lazy" src="/logo.png" alt="Logo" className="h-10 mb-5 object-contain" />
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Check size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-1">অর্ডার সফল হয়েছে!</h3>
                  <p className="text-green-600 text-sm font-medium">অর্ডার আইডি: #{String(completedOrderReceipt.orderId || "N/A").slice(-6).toUpperCase()}</p>
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                      <User size={18} className="text-primary" />
                      সাম্প্রতিক অর্ডারসমূহ
                    </h4>
                    <div className="space-y-3 text-sm">
                      <p><span className="font-bold text-gray-500">নাম:</span> {completedOrderReceipt.customerName}</p>
                      <p><span className="font-bold text-gray-500">ফোন:</span> {completedOrderReceipt.customerPhone}</p>
                      <p><span className="font-bold text-gray-500">ঠিকানা:</span> {completedOrderReceipt.address}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                      <Package size={18} className="text-primary" />
                      সাম্প্রতিক অর্ডারসমূহ
                    </h4>
                    
                    <div className="space-y-3 mb-4">
                      {completedOrderReceipt.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-secondary text-sm">{item.product?.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} {(() => {
                                switch (item.product?.unit) {
                                  case "piece": return "পিস";
                                  case "kg": return "কেজি";
                                  case "gm": return "গ্রাম";
                                  case "liter": return "লিটার";
                                  case "ml": return "মিলি";
                                  case "packet": return "প্যাকেট";
                                  case "box": return "বক্স";
                                  case "set": return "সেট";
                                  default: return item.product?.unit || "পিস";
                                }
                              })()} {item.color || item.size ? `(${[item.color, item.size].filter(Boolean).join(', ')})` : ''}
                            </p>
                          </div>
                          <p className="font-bold text-primary">৳{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed pt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <p>সাবটোটাল</p>
                        <p>৳{completedOrderReceipt.subtotal}</p>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <p>ডেলিভারি চার্জ</p>
                        <p>৳{completedOrderReceipt.deliveryCharge}</p>
                      </div>
                      {completedOrderReceipt.appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <p>ডিসকাউন্ট</p>
                          <p>- ৳{completedOrderReceipt.subtotal + completedOrderReceipt.deliveryCharge - completedOrderReceipt.total}</p>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-lg text-secondary pt-2 border-t">
                        <p>সর্বমোট</p>
                        <p className="text-primary">৳{completedOrderReceipt.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              <div className="p-4 bg-gray-50 border-t shrink-0 flex gap-3 w-full">
                <button
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isDownloadingReceipt ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  ডাউনলোড করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTrackingOpen && <TrackingModal {...{ setIsTrackingOpen, trackingInput, setTrackingInput, handleTrackOrder, isTrackingLoading, trackingError, trackingResult, isTrackingOpen }} />}
      </AnimatePresence>
      <AnimatePresence>
        {isCheckoutOpen && <CheckoutModal {...{ ALL_DISTRICTS, availableRewardPoints, calculateTotal, checkoutAddress, checkoutDistrict, checkoutDistrictSearch, checkoutItems, checkoutName, checkoutNote, checkoutPhone, checkoutPhoneFocused, getProductPrice, handleConfirmOrder, isApplyingRewardPoints, isCheckoutDistrictOpen, isOrderProcessing, isOrderSuccess, openProductDetails, paymentMethod, removeItem, savedProfiles, setCheckoutAddress, setCheckoutDistrict, setCheckoutDistrictSearch, setCheckoutName, setCheckoutNote, setCheckoutPhone, setCheckoutPhoneFocused, setIsApplyingRewardPoints, setIsCheckoutDistrictOpen, setIsCheckoutOpen, t, toBengaliNumber, updateQuantity, isCheckoutOpen }} />}
      </AnimatePresence>
      {/* ===== Landing Page Editor Modal ===== */}
      <AnimatePresence>
        {landingEditorProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-stretch justify-center"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-white w-full max-w-7xl m-3 md:m-6 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <h2 className="font-black text-lg">Landing Page Setup</h2>
                    <p className="text-purple-200 text-xs">{landingEditorProduct.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLandingPageLink(landingEditorProduct.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all"
                  >
                    <Share2 size={15} /> লিংক কপি
                  </button>
                  <button
                    onClick={saveLandingConfig}
                    disabled={isSavingLandingConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 rounded-xl text-sm font-black transition-all disabled:opacity-60"
                  >
                    {isSavingLandingConfig ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
                    সেভ করুন
                  </button>
                  <button
                    onClick={() => setLandingEditorProduct(null)}
                    className="w-9 h-9 bg-white/20 hover:bg-white/40 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              {/* Body: Editor + Preview */}
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* === Left: Editor === */}
                <div className="w-full md:w-[420px] shrink-0 overflow-y-auto border-r border-gray-100 p-5 space-y-5 bg-gray-50">
                  {/* Headline */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📢 টেক্সট কন্টেন্ট</h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">হেডলাইন</label>
                      <input
                        type="text"
                        value={landingEditorConfig.headline}
                        onChange={e => setLandingEditorConfig((p: any) => ({ ...p, headline: e.target.value }))}
                        placeholder={landingEditorProduct.name}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">খালি রাখলে প্রোডাক্টের নাম দেখাবে</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">সাবহেডলাইন / বিবরণ</label>
                      <textarea
                        value={landingEditorConfig.subheadline}
                        onChange={e => setLandingEditorConfig((p: any) => ({ ...p, subheadline: e.target.value }))}
                        placeholder="প্রোডাক্ট সম্পর্কে সংক্ষিপ্ত বিবরণ"
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-400 transition-all bg-gray-50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">ব্লক টেক্সট (লাল ব্লক)</label>
                      <input
                        type="text"
                        value={landingEditorConfig.badgeText}
                        onChange={e => setLandingEditorConfig((p: any) => ({ ...p, badgeText: e.target.value }))}
                        placeholder={`ধামাকা অফার! ${landingEditorProduct.discount || 0}% ছাড়`}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">অফার মূল্য (Landing Price)</label>
                        <input
                          type="number"
                          value={landingEditorConfig.priceOverride || ""}
                          onChange={e => setLandingEditorConfig((p: any) => ({ ...p, priceOverride: e.target.value }))}
                          placeholder={String(landingEditorProduct.price)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">আগের দাম (Old Price)</label>
                        <input
                          type="number"
                          value={landingEditorConfig.oldPriceOverride || ""}
                          onChange={e => setLandingEditorConfig((p: any) => ({ ...p, oldPriceOverride: e.target.value }))}
                          placeholder={String(landingEditorProduct.oldPrice || "")}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-purple-400 transition-all bg-gray-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">মার্কেটিং কপি / বিস্তারিত</label>
                      <textarea
                        value={landingEditorConfig.bodyText}
                        onChange={e => setLandingEditorConfig((p: any) => ({ ...p, bodyText: e.target.value }))}
                        placeholder="পণ্যের বিশেষত্ব, অফার বিবরণ, ব্যবহারবিধি ইত্যাদি"
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-400 transition-all bg-gray-50 resize-none"
                      />
                    </div>
                  </div>
                  {/* Extra Images */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📸 অতিরিক্ত ইমেজ (সর্বোচ্চ ৩টি)</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(landingEditorConfig.extraImages || []).map((img: string, idx: number) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                          <img loading="lazy" src={img} className="w-full h-full object-cover" alt={`extra-${idx}`} />
                          <button
                            onClick={() => setLandingEditorConfig((p: any) => ({ ...p, extraImages: p.extraImages.filter((_: any, i: number) => i !== idx) }))}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {(landingEditorConfig.extraImages || []).length < 3 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 cursor-pointer flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-purple-500 transition-all">
                          <Plus size={20} />
                          <span className="text-[10px] font-bold">ছবি যোগ</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleLandingEditorImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                  {/* YouTube Video URLs */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📺 ইউটিউব ভিডিও লিংক</h3>
                    <div className="space-y-3">
                      {(landingEditorConfig.videoUrls || []).map((url: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={e => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: p.videoUrls.map((u: string, i: number) => i === idx ? e.target.value : u) }))}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                          />
                          <button
                            onClick={() => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: p.videoUrls.filter((_: string, i: number) => i !== idx) }))}
                            className="w-7 h-7 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(landingEditorConfig.videoUrls || []).length < 3 && (
                        <button
                          onClick={() => setLandingEditorConfig((p: any) => ({ ...p, videoUrls: [...(p.videoUrls || []), ""] }))}
                          className="w-full py-2 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={14} /> ভিডিও লিংক যোগ করুন
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Feature Points */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">✅ ফিচার পয়েন্টস</h3>
                    <div className="space-y-3">
                      {(landingEditorConfig.features || []).map((feat: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <select
                              value={feat.icon}
                              onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, icon: e.target.value } : f) }))}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="zap">âš¡ Zap</option>
                              <option value="thumbsup">👍 ThumbsUp</option>
                              <option value="truck">🚚 Truck</option>
                              <option value="shield">🛡️ Shield</option>
                            </select>
                            <button
                              onClick={() => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.filter((_: any, i: number) => i !== idx) }))}
                              className="w-6 h-6 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, title: e.target.value } : f) }))}
                            placeholder="ফিচার শিরোনাম"
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-purple-400"
                          />
                          <textarea
                            value={feat.desc}
                            onChange={e => setLandingEditorConfig((p: any) => ({ ...p, features: p.features.map((f: any, i: number) => i === idx ? { ...f, desc: e.target.value } : f) }))}
                            placeholder="বিবরণ"
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400 resize-none"
                          />
                        </div>
                      ))}
                      {(landingEditorConfig.features || []).length < 4 && (
                        <button
                          onClick={() => setLandingEditorConfig((p: any) => ({ ...p, features: [...p.features, { icon: "zap", title: "", desc: "" }] }))}
                          className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={14} /> ফিচার যোগ করুন
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Package/Weight Options */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider">📦 প্যাকেজ / ওজন অপশন</h3>
                    <div className="space-y-3">
                      {(landingEditorConfig.packages || []).map((pkg: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={pkg.weight}
                            onChange={e => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.map((f: any, i: number) => i === idx ? { ...f, weight: e.target.value } : f) }))}
                            placeholder="যেমন: ১০ কেজি"
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none focus:border-purple-400"
                          />
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={e => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.map((f: any, i: number) => i === idx ? { ...f, price: e.target.value } : f) }))}
                            placeholder="দাম"
                            className="w-24 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-purple-400"
                          />
                          <button
                            onClick={() => setLandingEditorConfig((p: any) => ({ ...p, packages: p.packages.filter((_: any, i: number) => i !== idx) }))}
                            className="w-7 h-7 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setLandingEditorConfig((p: any) => ({ ...p, packages: [...(p.packages || []), { weight: "", price: "" }] }))}
                        className="w-full py-2 border-2 border-dashed border-gray-200 hover:border-purple-400 text-gray-400 hover:text-purple-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> অপশন যোগ করুন
                      </button>
                    </div>
                  </div>
                  {/* Trust Badges Toggle */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-bold text-gray-700">ট্রাস্ট ব্লক দেখাবে?</span>
                      <div
                        onClick={() => setLandingEditorConfig((p: any) => ({ ...p, showTrustBadges: !p.showTrustBadges }))}
                        className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${landingEditorConfig.showTrustBadges ? 'bg-purple-500' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${landingEditorConfig.showTrustBadges ? 'left-7' : 'left-1'}`} />
                      </div>
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1">১০০% অরিজিনাল, ক্যাশ অন ডেলিভারি, রিপ্লেসমেন্ট ব্লক</p>
                  </div>
                </div>
                {/* === Right: Live Preview === */}
                <div className="flex-1 overflow-y-auto bg-gray-100 p-5 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => setLandingPreviewTab('mobile')}
                      className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${landingPreviewTab === 'mobile' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500'}`}
                    >📱 মোবাইল</button>
                    <button
                      onClick={() => setLandingPreviewTab('desktop')}
                      className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${landingPreviewTab === 'desktop' ? 'bg-purple-600 text-white shadow' : 'bg-white text-gray-500'}`}
                    >🖥️ ডেস্কটপ</button>
                  </div>
                  <div className={`bg-white shadow-2xl overflow-hidden overflow-y-auto ${landingPreviewTab === 'mobile' ? 'w-[360px] rounded-[2rem] border-4 border-gray-800 max-h-[600px]' : 'w-full max-w-2xl rounded-2xl border border-gray-200 max-h-[600px]'}`}>
                    {/* Preview Header */}
                    <div className="bg-white/95 shadow-sm px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                      <span className="text-sm font-extrabold text-red-600">i SHOP <span className="text-gray-800">BD</span></span>
                      <button className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                        <ShoppingCart size={10} /> অর্ডার করুন
                      </button>
                    </div>
                    {/* Preview Hero */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex gap-3 items-start">
                        {(() => {
                          const previewCarouselImages = [landingEditorProduct?.image, ...(landingEditorProduct?.images || [])].filter(Boolean);
                          return previewCarouselImages.length > 1 ? (
                            <div className="w-32 h-32 shrink-0 bg-white rounded-xl border border-gray-100">
                              <ImageCarousel images={previewCarouselImages} className="aspect-square rounded-xl h-full" />
                            </div>
                          ) : (
                            <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                              <img loading="lazy" src={landingEditorProduct.image} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                          );
                        })()}
                        <div className="space-y-2 flex-1">
                          <span className="inline-block bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                            {landingEditorConfig.badgeText || `ধামাকা অফার! ${(() => {
                              const p = landingEditorConfig.priceOverride ? Number(landingEditorConfig.priceOverride) : landingEditorProduct.price;
                              const o = landingEditorConfig.oldPriceOverride ? Number(landingEditorConfig.oldPriceOverride) : landingEditorProduct.oldPrice;
                              return o && p && o > p ? Math.round(((o - p) / o) * 100) : (landingEditorProduct.discount || 0);
                            })()}% ছাড়`}
                          </span>
                          <p className="font-black text-gray-900 text-sm leading-tight">
                            {landingEditorConfig.headline || landingEditorProduct.name}
                          </p>
                          {landingEditorConfig.subheadline && (
                            <p className="text-[10px] text-gray-500 leading-relaxed">{landingEditorConfig.subheadline}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {landingEditorConfig.oldPriceOverride || landingEditorProduct.oldPrice ? (
                              <span className="text-xs text-gray-400 line-through">৳{landingEditorConfig.oldPriceOverride || landingEditorProduct.oldPrice}</span>
                            ) : null}
                            <span className="text-base font-black text-red-600">৳{landingEditorConfig.priceOverride || landingEditorProduct.price}</span>
                          </div>
                        </div>
                      </div>
                      {/* Extra images preview */}
                      {(landingEditorConfig.extraImages || []).length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {(landingEditorConfig.extraImages || []).map((img: string, i: number) => (
                            <div key={i} className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                              <img loading="lazy" src={img} className="max-w-full max-h-full object-contain" alt="" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Preview Trust Badges */}
                    {landingEditorConfig.showTrustBadges && (
                      <div className="flex justify-around px-3 py-3 border-b border-gray-100 bg-gray-50">
                        {[
                          { icon: <ShieldCheck size={14} className="text-green-600" />, label: "১০০% অরিজিনাল" },
                          { icon: <Truck size={14} className="text-blue-600" />, label: "ক্যাশ অন ডেলিভারি" },
                          { icon: <RefreshCcw size={14} className="text-orange-500" />, label: "রিপ্লেসমেন্ট" },
                        ].map((b, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            {b.icon}
                            <span className="text-[8px] font-bold text-gray-600">{b.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Preview Features */}
                    <div className="p-4 space-y-2">
                      {/* Image Carousel Preview */}
                      {(() => {
                        const carouselImagesPreview = [...(landingEditorConfig.extraImages || [])].filter(Boolean);
                        return carouselImagesPreview.length > 1 ? (
                          <div className="mb-4">
                            <ImageCarousel images={carouselImagesPreview} />
                          </div>
                        ) : carouselImagesPreview.length === 1 ? (
                          <div className="mb-4 rounded-xl overflow-hidden border border-gray-100">
                            <img loading="lazy" src={carouselImagesPreview[0]} className="w-full aspect-[16/9] object-contain bg-gray-50" />
                          </div>
                        ) : null;
                      })()}
                      <p className="text-[10px] font-black text-gray-800 text-center mb-3">কেন আমাদের প্রোডাক্টটি কিনবেন?</p>
                      {landingEditorConfig.bodyText && (
                        <div className="bg-amber-50 rounded-lg p-2 mb-2">
                          <div className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-wrap">{landingEditorConfig.bodyText}</div>
                        </div>
                      )}
                      {/* YouTube Video Preview */}
                      {(() => {
                        const previewVideoUrls = [...(landingEditorConfig.videoUrls || [])];
                        if (landingEditorProduct?.videoUrl && !previewVideoUrls.includes(landingEditorProduct.videoUrl)) {
                          previewVideoUrls.unshift(landingEditorProduct.videoUrl);
                        }
                        const validUrls = previewVideoUrls.filter(Boolean);
                        
                        return validUrls.length > 0 ? (
                          <div className="space-y-2 mb-2">
                            {validUrls.map((url: string, idx: number) => {
                              const embedUrl = getYouTubeEmbedUrl(url);
                              return embedUrl ? (
                                <div key={idx} className="aspect-video w-full rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                  <iframe
                                    className="w-full h-full"
                                    src={embedUrl}
                                    title={`YouTube video ${idx + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : null;
                      })()}
                      {(landingEditorConfig.features || []).filter((f: any) => f.title).map((feat: any, i: number) => (
                        <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="shrink-0 mt-0.5">
                            {feat.icon === 'zap' && <Zap size={12} className="text-red-500" />}
                            {feat.icon === 'thumbsup' && <ThumbsUp size={12} className="text-red-500" />}
                            {feat.icon === 'truck' && <Truck size={12} className="text-blue-600" />}
                            {feat.icon === 'shield' && <ShieldCheck size={12} className="text-green-600" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-gray-800">{feat.title}</p>
                            <p className="text-[8px] text-gray-500">{feat.desc.slice(0, 50)}{feat.desc.length > 50 ? '...' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Preview CTA */}
                    <div className="p-4">
                      <div className="bg-green-600 text-white text-[10px] font-black py-3 rounded-xl text-center">
                        অর্ডার কনফর্ম করুন (৳{landingEditorProduct.price + 60})
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">এটি একটি রিভিউ। আসল পেজে সম্পূর্ণ ফর্ম দেখাবে।</p>
                </div>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                <p className="text-xs text-gray-500">পরিবর্তন সেভ করতে উপরেএ° "সেভ করুন" বাটনে ক্লিক করুন।</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLandingEditorProduct(null)}
                    className="px-5 py-2 bg-white border border-gray-200 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-all"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    onClick={saveLandingConfig}
                    disabled={isSavingLandingConfig}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {isSavingLandingConfig ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
                    সেভ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
