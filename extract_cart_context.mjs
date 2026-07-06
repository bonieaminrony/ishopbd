import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const cartStates = [
    "const [cartItems, setCartItems] = useState",
    "const cartCount = useMemo",
    "const [checkoutItems, setCheckoutItems] = useState",
    "const [isCheckoutOpen, setIsCheckoutOpen] = useState",
    "const [checkoutName, setCheckoutName] = useState",
    "const [checkoutPhone, setCheckoutPhone] = useState",
    "const [checkoutPhoneFocused, setCheckoutPhoneFocused] = useState",
    "const [checkoutDistrict, setCheckoutDistrict] = useState",
    "const [checkoutAddress, setCheckoutAddress] = useState",
    "const [checkoutNote, setCheckoutNote] = useState",
    "const [paymentMethod, setPaymentMethod] = useState",
    "const [availableRewardPoints, setAvailableRewardPoints] = useState",
    "const [isApplyingRewardPoints, setIsApplyingRewardPoints] = useState",
    "const [discountAmount, setDiscountAmount] = useState",
    "const [checkoutDistrictSearch, setCheckoutDistrictSearch] = useState",
    "const [isCheckoutDistrictOpen, setIsCheckoutDistrictOpen] = useState",
    "const [appliedCoupon, setAppliedCoupon] = useState"
];

const cartFunctions = [
    "const addToCartInternal =",
    "const addToCart =",
    "const updateQuantity =",
    "const removeItem =",
    "const calculateSubtotal =",
    "const getDeliveryCharge =",
    "const calculateTotal =",
    "const clearCart ="
];

let extractedLogic = [];
let hooksToExport = [];

// Rough extraction logic based on brace matching
function extractBlock(startText) {
    const startIndex = appContent.indexOf(startText);
    if (startIndex === -1) return null;
    
    // Find the end of the block. If it's a simple useState, it ends with a semicolon.
    let endIndex = startIndex;
    let braceCount = 0;
    let foundBrace = false;
    let foundSemi = false;
    
    while (endIndex < appContent.length) {
        if (appContent[endIndex] === '{' || appContent[endIndex] === '(' || appContent[endIndex] === '<') {
            braceCount++;
            foundBrace = true;
        } else if (appContent[endIndex] === '}' || appContent[endIndex] === ')' || appContent[endIndex] === '>') {
            braceCount--;
        } else if (appContent[endIndex] === ';' && braceCount === 0) {
            foundSemi = true;
        }
        
        endIndex++;
        
        if (foundSemi || (foundBrace && braceCount === 0 && appContent[endIndex] === ';')) {
            if (appContent[endIndex] === ';') endIndex++; // Include semicolon
            break;
        }
    }
    
    const block = appContent.slice(startIndex, endIndex);
    appContent = appContent.slice(0, startIndex) + appContent.slice(endIndex);
    return block;
}

for (const state of cartStates) {
    const block = extractBlock(state);
    if (block) {
        extractedLogic.push(block);
        const match = block.match(/const \s*\[([^,]+),\s*([^\]]+)\]/);
        if (match) {
            hooksToExport.push(match[1]);
            hooksToExport.push(match[2]);
        } else {
            const match2 = block.match(/const \s*([a-zA-Z0-9_]+)\s*=/);
            if (match2) hooksToExport.push(match2[1]);
        }
    }
}

for (const func of cartFunctions) {
    const block = extractBlock(func);
    if (block) {
        extractedLogic.push(block);
        const match = block.match(/const \s*([a-zA-Z0-9_]+)\s*=/);
        if (match) hooksToExport.push(match[1]);
    }
}

// Find useEffects
const useEffectRegex = /useEffect\(\(\) => \{\s*try \{\s*localStorage\.setItem\("ishopbd_cart"/g;
let match;
while ((match = useEffectRegex.exec(appContent)) !== null) {
    const block = extractBlock(match[0]);
    if (block) extractedLogic.push(block);
}

const contextFileContent = \`import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Product } from '../types';
import toast from 'react-hot-toast';

type CartContextType = {
\${hooksToExport.map(h => \`  \${h}: any;\`).join('\\n')}
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
\${extractedLogic.join('\\n\\n')}

  const value = {
\${hooksToExport.map(h => \`    \${h},\`).join('\\n')}
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
\`;

fs.writeFileSync('src/context/CartContext.tsx', contextFileContent);
console.log('Created CartContext.tsx');
console.log('Exported hooks:', hooksToExport);
