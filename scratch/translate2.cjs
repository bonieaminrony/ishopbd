const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const translations = {
  '>১<': '>1<',
  '>২<': '>2<',
  '>৩<': '>3<',
  '>৪<': '>4<',
  '>৫<': '>5<',
  'placeholder="০"': 'placeholder="0"',
  'placeholder="১"': 'placeholder="1"',
  'সাব-Select Category': 'Select Sub-Category',
  '— সাব-Category বেছে নিন —': '— Select Sub-Category —',
  'Buying Price (৳)': 'Buying Price',
  'Selling Price (৳)': 'Selling Price',
  'Old Price (৳)': 'Old Price',
  '— Category বেছে নিন —': '— Select Category —',
  'Category বেছে নিন': 'Select Category'
};

for (const [bn, en] of Object.entries(translations)) {
  content = content.split(bn).join(en);
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Translations applied.');
