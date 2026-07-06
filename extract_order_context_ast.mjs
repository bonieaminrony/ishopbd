import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

const varsToExtract = [
    'isOrderProcessing', 'setIsOrderProcessing',
    'isOrderSuccess', 'setIsOrderSuccess',
    'completedOrderReceipt', 'setCompletedOrderReceipt',
    'isDownloadingReceipt', 'setIsDownloadingReceipt',
    
    'inlineOrderName', 'setInlineOrderName',
    'inlineOrderPhone', 'setInlineOrderPhone',
    'inlineOrderDistrict', 'setInlineOrderDistrict',
    'inlineOrderThana', 'setInlineOrderThana',
    'inlineOrderArea', 'setInlineOrderArea',
    'inlineOrderAddress', 'setInlineOrderAddress',
    'inlineOrderNote', 'setInlineOrderNote',
    'inlinePhoneFocused', 'setInlinePhoneFocused',
    'isInlineOrderProcessing', 'setIsInlineOrderProcessing',
    'inlineOrderSuccess', 'setInlineOrderSuccess',

    'isTrackingOpen', 'setIsTrackingOpen',
    'trackingInput', 'setTrackingInput',
    'trackingResult', 'setTrackingResult',
    'isTrackingLoading', 'setIsTrackingLoading',
    'trackingError', 'setTrackingError'
];

const funcsToExtract = [
    'handleConfirmOrder', 'handleInlineOrderSubmit',
    'handleTrackOrder', 'downloadReceipt', 'handleVerifyOTP',
    'generateOrderReceiptHTML'
];

let extractedCode = [];
const appFunc = sourceFile.getFunction('App');
if (!appFunc) throw new Error("Could not find App component");

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

const exportsSet = new Set([...varsToExtract, ...funcsToExtract]);
let hooksText = "";
for (const h of exportsSet) {
    hooksText += "  " + h + ": any;\n";
}

let valuesText = "";
for (const h of exportsSet) {
    valuesText += "    " + h + ",\n";
}

let contextFileContent = "import React, { createContext, useContext, useState, FormEvent, MouseEvent } from 'react';\n" +
"import { db } from '../lib/firebase';\n" +
"import { collection, addDoc, updateDoc, arrayUnion, doc } from 'firebase/firestore';\n" +
"import toast from 'react-hot-toast';\n" +
"import { useAuthContext } from './AuthContext';\n" +
"import { useCartContext } from './CartContext';\n" +
"import { useProductContext } from './ProductContext';\n\n" +
"type OrderContextType = {\n" + hooksText + "};\n\n" +
"const OrderContext = createContext<OrderContextType | undefined>(undefined);\n\n" +
"export function OrderProvider({ children }: { children: React.ReactNode }) {\n" +
"  const { user, userProfile } = useAuthContext();\n" +
"  const { cartItems, setCartItems, calculateTotal, clearCart, isApplyingRewardPoints, availableRewardPoints } = useCartContext();\n" +
"  const { products } = useProductContext();\n\n" +
extractedCode.join('\n\n') + "\n\n" +
"  const value = {\n" + valuesText + "  };\n\n" +
"  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;\n" +
"}\n\n" +
"export function useOrderContext() {\n" +
"  const context = useContext(OrderContext);\n" +
"  if (context === undefined) {\n" +
"    throw new Error('useOrderContext must be used within a OrderProvider');\n" +
"  }\n" +
"  return context;\n" +
"}\n";

fs.writeFileSync('src/context/OrderContext.tsx', contextFileContent);

appFunc.insertStatements(4, "const { " + Array.from(exportsSet).join(', ') + " } = useOrderContext();");

sourceFile.addImportDeclaration({
    namedImports: ['useOrderContext'],
    moduleSpecifier: './context/OrderContext'
});

sourceFile.saveSync();
console.log('Successfully extracted OrderContext and modified App.tsx');
