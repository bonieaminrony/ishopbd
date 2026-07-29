const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const translations = {
  'Products এডিট করুন': 'Edit Product',
  'নতুন Products Add': 'Add New Product',
  'বাতিল করুন': 'Cancel',
  'ধাপ ১: নাম ও কোড': 'Step 1: Name & Code',
  'প্রোডাক্টের নাম ও কোড': 'Product Name & Code',
  'প্রোডাক্টের পূর্ণ নাম': 'Product Full Name',
  'নাম দিতে হবে': 'Name is required',
  '* আবশ্যক': '* Required',
  'যেমন: Samsung Galaxy A55 5G (8GB/128GB)': 'e.g., Samsung Galaxy A55 5G (8GB/128GB)',
  'প্রোডাক্ট কোড': 'Product Code',
  'যেমন: SAM-A55': 'e.g., SAM-A55',
  'সার্চে ব্যবহার হবে': 'Used for searching',
  'SMS নাম <span className="text-gray-400 normal-case font-normal">(ঐচ্ছিক)</span>': 'SMS Name <span className="text-gray-400 normal-case font-normal">(Optional)</span>',
  'যেমন: Galaxy A55': 'e.g., Galaxy A55',
  'SMS-এ ছোট নাম': 'Short name for SMS',
  'ধাপ ২: দাম ও স্টক': 'Step 2: Price & Stock',
  'দাম ও স্টক': 'Price & Stock',
  'ক্রয়মূল্য (৳) 🔒': 'Buying Price (৳) 🔒',
  'বিক্রয়মূল্য (৳)': 'Selling Price (৳)',
  'দাম দিন': 'Price required',
  'আগের দাম (৳) <span className="text-gray-400 font-normal normal-case">(ছাড় দেখাতে)</span>': 'Old Price (৳) <span className="text-gray-400 font-normal normal-case">(For discount)</span>',
  '>ওজন<': '>Weight<',
  '>একক<': '>Unit<',
  'মজুদ (Stock)': 'Stock',
  'ধাপ ৩: ছবি': 'Step 3: Images',
  '>ছবি<': '>Images<',
  'প্রধান ছবি': 'Main Image',
  'ছবি দিতে হবে': 'Image is required',
  'ছবির লিংক paste করুন (https://...)': 'Paste image link (https://...)',
  '>অথবা<': '>OR<',
  'কম্পিউটার থেকে ছবি আপলোড করুন': 'Upload image from computer',
  'অতিরিক্ত ছবি <span className="text-gray-400 font-normal normal-case">(গ্যালারি)</span>': 'Additional Images <span className="text-gray-400 font-normal normal-case">(Gallery)</span>',
  'ধাপ ৪: ক্যাটাগরি ও ট্যাগ': 'Step 4: Category & Tags',
  'ক্যাটাগরি ও ট্যাগ': 'Category & Tags',
  '>ক্যাটাগরি<': '>Category<',
  'ক্যাটাগরি বেছে নিন': 'Select Category',
  '— ক্যাটাগরি বেছে নিন —': '— Select Category —',
  'সাব-ক্যাটাগরি': 'Sub-Category',
  '— সাব-ক্যাটাগরি বেছে নিন —': '— Select Sub-Category —',
  'সার্চ ট্যাগ <span className="text-gray-400 font-normal normal-case">(Google ও ওয়েবসাইট সার্চের জন্য)</span>': 'Search Tags <span className="text-gray-400 font-normal normal-case">(For Google & Site Search)</span>',
  'যেমন: smartwatch, ঘড়ি — Enter বা কমা দিয়ে add করুন': 'e.g., smartwatch, watch — Press Enter or comma to add',
  'আরো ট্যাগ...': 'More tags...',
  'ধাপ ৫: সাইজ ও কালার': 'Step 5: Size & Color',
  'সাইজ ও কালার (Variants)': 'Size & Color (Variants)',
  '>ঐচ্ছিক<': '>Optional<',
  '📌 নির্দেশনা:': '📌 Instructions:',
  '• সাইজ না থাকলে Size-এ <strong>"Free"</strong> লিখুন': '• If no size, enter <strong>"Free"</strong> in Size',
  '• প্রতিটি ভেরিয়েন্টে আলাদা স্টক (Quantity) দিন': '• Provide separate stock (Quantity) for each variant'
};

for (const [bn, en] of Object.entries(translations)) {
  content = content.split(bn).join(en);
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Translations applied.');
