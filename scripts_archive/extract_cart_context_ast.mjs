import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

const varsToExtract = [
    'cartItems', 'setCartItems', 'cartCount',
    'checkoutItems', 'setCheckoutItems', 'isCheckoutOpen', 'setIsCheckoutOpen',
    'checkoutName', 'setCheckoutName', 'checkoutPhone', 'setCheckoutPhone',
    'checkoutPhoneFocused', 'setCheckoutPhoneFocused', 'checkoutDistrict', 'setCheckoutDistrict',
    'checkoutAddress', 'setCheckoutAddress', 'checkoutNote', 'setCheckoutNote',
    'paymentMethod', 'setPaymentMethod', 'availableRewardPoints', 'setAvailableRewardPoints',
    'isApplyingRewardPoints', 'setIsApplyingRewardPoints', 'discountAmount', 'setDiscountAmount',
    'checkoutDistrictSearch', 'setCheckoutDistrictSearch', 'isCheckoutDistrictOpen', 'setIsCheckoutDistrictOpen',
    'appliedCoupon', 'setAppliedCoupon', 'deliveryArea', 'setDeliveryArea'
];

const funcsToExtract = [
    'addToCartInternal', 'addToCart', 'updateQuantity', 'setQuantityDirect',
    'removeItem', 'getProductPrice', 'getDeliveryCharge', 'calculateTotal'
];

let extractedCode = [];
const appFunc = sourceFile.getFunction('App');
if (!appFunc) throw new Error("Could not find App component");

// 1. Extract and remove matching VariableStatements inside App
const varStatements = appFunc.getVariableStatements();
for (const stmt of varStatements) {
    const decls = stmt.getDeclarations();
    
    if (decls.length === 1 && decls[0].getNameNode().getKind() === SyntaxKind.ArrayBindingPattern) {
        const names = decls[0].getNameNode().getElements().map(e => e.getText());
        if (varsToExtract.includes(names[0])) {
            extractedCode.push(stmt.getText());
            stmt.remove();
            continue;
        }
    }
    
    if (decls.length === 1 && decls[0].getNameNode().getKind() === SyntaxKind.Identifier) {
        const name = decls[0].getName();
        if (varsToExtract.includes(name) || funcsToExtract.includes(name)) {
            extractedCode.push(stmt.getText());
            stmt.remove();
            continue;
        }
    }
}

// 2. Extract useEffect for cart persistence
const exprStmts = appFunc.getStatements().filter(s => s.getKind() === SyntaxKind.ExpressionStatement);
for (const stmt of exprStmts) {
    if (stmt.getText().includes('localStorage.setItem("ishopbd_cart"')) {
        extractedCode.push(stmt.getText());
        stmt.remove();
        break; // Only one such useEffect
    }
}

const exportsSet = new Set([...varsToExtract, ...funcsToExtract]);
let hooksText = "";
for (const h of exportsSet) {
    hooksText += "  " + h + ": any;\\n";
}

let valuesText = "";
for (const h of exportsSet) {
    valuesText += "    " + h + ",\\n";
}

let contextFileContent = "import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, MouseEvent } from 'react';\\n" +
"import { Product } from '../types';\\n\\n" +
"type CartContextType = {\\n" + hooksText + "};\\n\\n" +
"const CartContext = createContext<CartContextType | undefined>(undefined);\\n\\n" +
"export function CartProvider({ children }: { children: React.ReactNode }) {\\n" +
extractedCode.join('\\n\\n') + "\\n\\n" +
"  const value = {\\n" + valuesText + "  };\\n\\n" +
"  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;\\n" +
"}\\n\\n" +
"export function useCartContext() {\\n" +
"  const context = useContext(CartContext);\\n" +
"  if (context === undefined) {\\n" +
"    throw new Error('useCartContext must be used within a CartProvider');\\n" +
"  }\\n" +
"  return context;\\n" +
"}\\n";

fs.writeFileSync('src/context/CartContext.tsx', contextFileContent);

// 3. Inject useCartContext into App.tsx
appFunc.insertStatements(2, "const { " + Array.from(exportsSet).join(', ') + " } = useCartContext();");

sourceFile.addImportDeclaration({
    namedImports: ['useCartContext'],
    moduleSpecifier: './context/CartContext'
});

sourceFile.saveSync();
console.log('Successfully extracted CartContext and modified App.tsx');
