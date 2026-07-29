import fs from 'fs';

const filePath = 'src/components/ProductDetails.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Replace inline-order-form
const startReg1 = /\{\/\* Inline Order Form \(Rendered ABOVE if NOT wholesale mode\) \*\/\}/;
const endReg1 = /<\/form>\s*\n\s*\)\}/;

const match1 = code.match(startReg1);
if (match1) {
  const startIdx = match1.index;
  const endMatch = code.substring(startIdx).match(endReg1);
  if (endMatch) {
    const endIdx = startIdx + endMatch.index + endMatch[0].length;
    code = code.substring(0, startIdx) + code.substring(endIdx);
  } else {
    console.log("Could not find end of regular form");
  }
}

// Replace inline-order-form-wholesale
const startReg2 = /\{\/\* Inline Order Form \(Rendered BELOW if wholesale mode is active\) \*\/\}/;
const endReg2 = /<\/form>\s*\n\s*\)\}/;

const match2 = code.match(startReg2);
if (match2) {
  const startIdx = match2.index;
  const endMatch = code.substring(startIdx).match(endReg2);
  if (endMatch) {
    const endIdx = startIdx + endMatch.index + endMatch[0].length;
    code = code.substring(0, startIdx) + code.substring(endIdx);
  } else {
    console.log("Could not find end of wholesale form");
  }
}

fs.writeFileSync(filePath, code);
console.log("Forms removed.");
