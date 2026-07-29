const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const simpleTranslations = {
  'SMS পাঠানোর ফলাফল': 'SMS Sending Results',
  '>এই পেজ সিলেক্ট<': '>Select this page<',
  '>এই পেজ বাতিল<': '>Deselect this page<',
  '>All সিলেক্ট<': '>Select All<',
  '>All রিসেট করুন<': '>Reset All<',
  'এই পেজে আছে:': 'On this page:',
  'টা | Selected:': 'items | Selected:',
  'Total:': 'Total:',
  'কোনো অর্ডার থেকে নম্বর পাওয়া যায়নি': 'No numbers found from orders',
  '>আগে?<': '>Prev<',
  '>পরে?<': '>Next<',
  '>সাধারণ Settings<': '>General Settings<',
  '>Admin ম্যানেজমেন্ট<': '>Admin Management<',
  '>কুপন Settings<': '>Coupon Settings<',
  'ব্যবহার হয়েছে:': 'Used:',
  'বার<': 'times<',
  'বিকাশ নাম্বার (Send Money)': 'bKash Number (Send Money)',
  'রকেট নাম্বার (Send Money)': 'Rocket Number (Send Money)',
  'আমাদের সম্পর্কে (About Us)': 'About Us',
  'গোপনীয়তা নীতি (Privacy Policy)': 'Privacy Policy',
  'Refunds পলিসি (Refund Policy)': 'Refund Policy',
  'নিয়ম ও শর্তাবলী (Terms & Conditions)': 'Terms & Conditions',
  'এআই চ্যাটবট (AI Bot)': 'AI Chatbot',
  'কুরিয়ার Settings (Steadfast)': 'Courier Settings (Steadfast)',
  'কুরিয়ার Settings (Pathao)': 'Courier Settings (Pathao)',
  'কম্পিউটার অ্যাপ ডাউনলোড লিঙ্ক': 'PC App Download Link',
  'যেমন: /apps/ishopbd-setup.exe': 'e.g., /apps/ishopbd-setup.exe',
  'অ্যান্ড্রয়েড অ্যাপ ডাউনলোড লিঙ্ক (APK/Play Store)': 'Android App Download Link (APK/Play Store)',
  'যেমন: /apps/ishopbd.apk': 'e.g., /apps/ishopbd.apk',
  'আইফোন অ্যাপ ডাউনলোড লিঙ্ক (App Store)': 'iPhone App Download Link (App Store)',
  'যেমন: https://apps.apple.com/us/app/ishopbd/id...': 'e.g., https://apps.apple.com/...',
  'Customerরা চেকআউট পেজে এই কোডটি দেখতে পাবে': 'Customers will see this code on the checkout page',
  'কনফিগারেশন সেভ করুন': 'Save Configuration',
  '>হোমপেজ<': '>Homepage<',
  'যেমন: সেরা মানের Products': 'e.g., Best Quality Products',
  '>সাব-টাইটেল<': '>Sub-title<',
  '>টাইটেল ফন্ট<': '>Title Font<',
  '>টাইটেল ওয়েট<': '>Title Weight<',
  '>সাব-টাইটেল ফন্ট<': '>Sub-title Font<',
  '>সাব-টাইটেল ওয়েট<': '>Sub-title Weight<',
  '>টাইটেল সাইজ<': '>Title Size<',
  '>সাব-টাইটেল সাইজ<': '>Sub-title Size<',
  '>পজিশন (X)<': '>Position (X)<',
  '>পজিশন (Y)<': '>Position (Y)<',
  '>ব্যানার টাইএª<': '>Banner Type<',
  '>হিরো ব্যানার (স্লাইডার)<': '>Hero Banner (Slider)<',
  '>ক্যাম্পেইন ব্যানার (নিচে)<': '>Campaign Banner (Bottom)<',
  '>ডান-উপরের ব্যানার<': '>Top Right Banner<',
  '>ডান-নিচের ব্যানার (ফ্ল্যাশ সেল)<': '>Bottom Right Banner (Flash Sale)<',
  '>ব্যানারের ছবি<': '>Banner Image<',
  '>ছবি আপলোড করুন<': '>Upload Image<',
  '"ব্যানার Update করুন"': '"Update Banner"',
  '"ব্যানার Add"': '"Add Banner"',
  '>বাতিল<': '>Cancel<',
  'সক্রিয় ব্যানারসমূহ': 'Active Banners',
  'আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।': 'You will be contacted shortly.',
  '"Admin/Moderator এডিট করুন"': '"Edit Admin/Moderator"',
  '"নতুন Admin/Moderator Add"': '"Add New Admin/Moderator"',
  'সক্রিয় Usersসমূহ': 'Active Users',
  '>রিফ্রেশ<': '>Refresh<',
  '>ব্যালেন্স Update<': '>Update Balance<',
  'কোন Users পাওয়া যায়নি': 'No Users Found',
  'পেমেন্ট করার পর ট্রানজেকশন আইডিটি নিচে অটোমেটিক': 'After payment, the transaction ID will automatically',
  'সেট হয়ে যাবে।': 'be set below.',
  'নতুন প্রোডাক্ট বা অফারের তথ্য All গ্রাহককে পাঠান': 'Send new product or offer info to all customers',
  '>বিস্তারিত Admin<': '>Detailed Admin<',
  '>একসাথে পাঠান<': '>Send All<',
  '>All নোটিফিকেশন হিস্ট্রি<': '>All Notification History<',
  'Customerদের Refunds রিকোয়েস্টগুলো এখানে দেখা যাবে': 'Customer refund requests will be shown here',
  'অজানা Users': 'Unknown User',
  '>মেসেজ<': '>Message<'
};

for (const [bn, en] of Object.entries(simpleTranslations)) {
  content = content.split(bn).join(en);
}

const lines = content.split('\\n');

// Contextual replacements for "অতিরিক্ত গ্যালারি ছবি"
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('অতিরিক্ত গ্যালারি ছবি')) {
    if (lines[i+6] && lines[i+6].includes('isBankEnabled')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Bank Payment Enable');
    } else if (lines[i+3] && lines[i+3].includes('checkoutWarningText')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Checkout Warning Text');
    } else if (lines[i+4] && lines[i+4].includes('supportPhone1')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Support Phone 1');
    } else if (lines[i+4] && lines[i+4].includes('supportPhone2')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Support Phone 2');
    } else if (lines[i+4] && lines[i+4].includes('facebookUrl')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Facebook URL');
    } else if (lines[i+5] && lines[i+5].includes('editingBanner.title')) {
      lines[i] = lines[i].replace('অতিরিক্ত গ্যালারি ছবি', 'Banner Title');
    }
  }
}

fs.writeFileSync('src/components/AdminPanel.tsx', lines.join('\\n'));
console.log('Translations applied.');
