import fs from 'fs';

const allVars = JSON.parse(fs.readFileSync('checkout_props.json', 'utf8'));
const extractedJsx = fs.readFileSync('checkout_extracted.txt', 'utf8');

const lucideIcons = [
    'ArrowRight', 'Award', 'ChevronDown', 'ShoppingBag', 'X', 'Zap'
];

const toImport = { lucide: [] };
const toPass = [];

for (const v of allVars) {
    if (lucideIcons.includes(v)) toImport.lucide.push(v);
    else toPass.push(v);
}

// Ensure isCheckoutOpen is passed even if not strictly needed in the inner div, but the block starts with it
if (!toPass.includes('isCheckoutOpen')) toPass.push('isCheckoutOpen');

const checkoutComponentCode = `
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ${toImport.lucide.join(', ')} } from 'lucide-react';

export interface CheckoutModalProps {
${toPass.map(p => `  ${p}: any;`).join('\n')}
}

export default function CheckoutModal(props: CheckoutModalProps) {
  const {
${toPass.map(p => `    ${p},`).join('\n')}
  } = props;

  return (
    <>
      ${extractedJsx}
    </>
  );
}
`;

fs.writeFileSync('src/components/CheckoutModal.tsx', checkoutComponentCode);

// Modify App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const checkoutPropsObj = `
  const checkoutProps = {
${toPass.map(p => `    ${p},`).join('\n')}
  };
`;

const targetReturnStr = '  return (\n    <div className="min-h-screen';
const insertIndex = appContent.indexOf(targetReturnStr);

if (insertIndex !== -1) {
    appContent = appContent.slice(0, insertIndex) + checkoutPropsObj + '\n' + appContent.slice(insertIndex);
}

const replacementJsx = `{isCheckoutOpen && <CheckoutModal {...checkoutProps} />}`;
appContent = appContent.replace(extractedJsx, replacementJsx);

const importCheckout = `import CheckoutModal from './components/CheckoutModal';\n`;
const importIndex = appContent.indexOf('import ');
appContent = appContent.slice(0, importIndex) + importCheckout + appContent.slice(importIndex);

fs.writeFileSync('src/App.tsx', appContent);
console.log("CheckoutModal refactoring complete!");
