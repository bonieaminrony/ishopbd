const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const startIdx = 165; // line 166
const endIdx = 591; // line 592
const newImports = [
  "import { districtThanaMap, ALL_DISTRICTS, DEFAULT_CATEGORIES as default_categories, DEFAULT_PRODUCTS as default_products, DEFAULT_BANNERS as banners, BENGALI_FONTS } from './constants/data';",
  "import { ProductSkeleton } from './components/ProductSkeleton';",
  "import { ProductCard } from './components/ProductCard';",
  "import ZoomableImage from './components/ui/ZoomableImage';",
  "import toast, { Toaster } from 'react-hot-toast';"
];
lines.splice(startIdx, endIdx - startIdx + 1, ...newImports);
fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('App.tsx sliced successfully.');
