const fs = require('fs');
let content = fs.readFileSync('src/components/ProductDetails.tsx', 'utf8');

// Replace Category/Code block to add 'hidden'
content = content.replace(
  '<span className="text-primary font-black text-xs tracking-widest uppercase mb-2 block flex items-center gap-2">',
  '<span className="hidden">'
);

// Replace Title to add 'hidden'
content = content.replace(
  '<h1 className="text-2xl font-black text-gray-900 leading-tight mb-4">\n                      {selectedProduct.name}\n                    </h1>',
  '<h1 className="hidden">\n                      {selectedProduct.name}\n                    </h1>'
);

// Replace Stock Badge to add 'hidden'
// First, find the exact string for the stock badge. It's a bit long and has dynamic classes.
// I can just replace the opening div of the stock badge.
const stockBadgeStart = '<div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${';
const stockBadgeReplacement = '<div className={`hidden px-2.5 py-1 rounded-md text-xs font-bold items-center gap-1.5 ${';

content = content.replace(stockBadgeStart, stockBadgeReplacement);

// Also, the X button. Wait, if I leave the X button, the user might complain. 
// Let's check if there is an alternative way to close. Maybe swipe down? No, it's just a div.
// I'll leave the X button as is, it's essential for UX.

fs.writeFileSync('src/components/ProductDetails.tsx', content);
console.log('Mobile title block updated');
