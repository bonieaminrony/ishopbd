const fs = require('fs');

let content = fs.readFileSync('src/components/ProductDetails.tsx', 'utf8');

// Replace setIsProductDetailsOpen(false) on the X button with history check
content = content.replace(
  'onClick={() => setIsProductDetailsOpen(false)}',
  'onClick={() => { if (window.history.state && window.history.state.isModal) { window.history.back(); } else { setIsProductDetailsOpen(false); } }}'
);

// We should also replace the one on the background overlay (if there is one)
// But I think there's no onClick on the background overlay because of stopPropagation or similar.
// Wait, I can just replace all occurrences of `onClick={() => setIsProductDetailsOpen(false)}`!
content = content.replace(
  /onClick=\{\(\) => setIsProductDetailsOpen\(false\)\}/g,
  'onClick={() => { if (window.history.state && window.history.state.isModal) { window.history.back(); } else { setIsProductDetailsOpen(false); } }}'
);

fs.writeFileSync('src/components/ProductDetails.tsx', content);
console.log('ProductDetails.tsx updated with history.back() support');
