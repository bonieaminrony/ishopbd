import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
project.addSourceFileAtPath('C:/Users/tanvi/Downloads/temp_extract/i-shop-bd-final-2026/src/App.tsx');

const currentApp = project.getSourceFileOrThrow('src/App.tsx');
const originalApp = project.getSourceFileOrThrow('C:/Users/tanvi/Downloads/temp_extract/i-shop-bd-final-2026/src/App.tsx');

const currentAppFunc = currentApp.getFunction('App');
const originalAppFunc = originalApp.getFunction('App');

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

const originalVarStatements = originalAppFunc.getVariableStatements();
for (const stmt of originalVarStatements) {
    const decls = stmt.getDeclarations();
    
    if (decls.length === 1 && decls[0].getNameNode().getKind() === SyntaxKind.ArrayBindingPattern) {
        const names = decls[0].getNameNode().getElements().map(e => e.getText());
        if (varsToExtract.includes(names[0])) {
            extractedCode.push(stmt.getText());
            continue;
        }
    }
    
    if (decls.length === 1 && decls[0].getNameNode().getKind() === SyntaxKind.Identifier) {
        const name = decls[0].getName();
        if (varsToExtract.includes(name) || funcsToExtract.includes(name)) {
            extractedCode.push(stmt.getText());
            continue;
        }
    }
}

// Inject the extracted code into current App.tsx at the top of the App function
currentAppFunc.insertStatements(4, extractedCode.join('\n\n'));

currentApp.saveSync();
console.log('Successfully restored deleted statements into App.tsx');
