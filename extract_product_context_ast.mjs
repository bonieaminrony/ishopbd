import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

const varsToExtract = [
    'categories', 'setCategories',
    'products', 'setProducts',
    'searchQuery', 'setSearchQuery',
    'searchInput', 'setSearchInput',
    'selectedCategory', 'setSelectedCategory',
    'isTrendingFilterActive', 'setIsTrendingFilterActive',
    'selectedBrand', 'setSelectedBrand',
    'minPrice', 'setMinPrice',
    'maxPrice', 'setMaxPrice',
    'sortBy', 'setSortBy',
    'trendingIndices', 'setTrendingIndices',
    'activeTrendingSlot', 'setActiveTrendingSlot',
    'selectedProduct', 'setSelectedProduct',
    'isProductDetailsOpen', 'setIsProductDetailsOpen'
];

const derivedVarsToExtract = [
    'flashSaleProducts', 'relatedProducts', 'filteredProducts',
    'featuredProducts', 'newArrivals', 'brands'
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
        if (varsToExtract.includes(name) || derivedVarsToExtract.includes(name)) {
            extractedCode.push(stmt.getText());
            stmt.remove();
            continue;
        }
    }
}

// 2. Extract specific useEffects
const exprStmts = appFunc.getStatements().filter(s => s.getKind() === SyntaxKind.ExpressionStatement);
for (const stmt of exprStmts) {
    const text = stmt.getText();
    // useEffect for categories
    if (text.includes("db, 'categories'") && text.includes("onSnapshot")) {
        extractedCode.push(text);
        stmt.remove();
        continue;
    }
    // useEffect for products
    if (text.includes("db, 'products'") && text.includes("onSnapshot") && !text.includes("expense")) {
        extractedCode.push(text);
        stmt.remove();
        continue;
    }
}

const exportsSet = new Set([...varsToExtract, ...derivedVarsToExtract]);
let hooksText = "";
for (const h of exportsSet) {
    hooksText += "  " + h + ": any;\\n";
}

let valuesText = "";
for (const h of exportsSet) {
    valuesText += "    " + h + ",\\n";
}

let contextFileContent = "import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';\\n" +
"import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';\\n" +
"import { db } from '../firebase';\\n" +
"import { Product, Category } from '../types';\\n\\n" +
"type ProductContextType = {\\n" + hooksText + "};\\n\\n" +
"const ProductContext = createContext<ProductContextType | undefined>(undefined);\\n\\n" +
"export function ProductProvider({ children }: { children: React.ReactNode }) {\\n" +
extractedCode.join('\\n\\n') + "\\n\\n" +
"  const value = {\\n" + valuesText + "  };\\n\\n" +
"  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;\\n" +
"}\\n\\n" +
"export function useProductContext() {\\n" +
"  const context = useContext(ProductContext);\\n" +
"  if (context === undefined) {\\n" +
"    throw new Error('useProductContext must be used within a ProductProvider');\\n" +
"  }\\n" +
"  return context;\\n" +
"}\\n";

fs.writeFileSync('src/context/ProductContext.tsx', contextFileContent);

// 3. Inject useProductContext into App.tsx
appFunc.insertStatements(3, "const { " + Array.from(exportsSet).join(', ') + " } = useProductContext();");

sourceFile.addImportDeclaration({
    namedImports: ['useProductContext'],
    moduleSpecifier: './context/ProductContext'
});

sourceFile.saveSync();
console.log('Successfully extracted ProductContext and modified App.tsx');
