import { Project, DiagnosticCategory } from 'ts-morph';
import fs from 'fs';

const jsxText = fs.readFileSync('checkout_extracted.txt', 'utf8');

const fileContent = `
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal(props: any) {
    return (
        ${jsxText}
    );
}
`;

fs.writeFileSync('src/components/CheckoutModalTemp.tsx', fileContent);

const project = new Project();
project.addSourceFileAtPath('src/components/CheckoutModalTemp.tsx');
const sourceFile = project.getSourceFileOrThrow('src/components/CheckoutModalTemp.tsx');

const diagnostics = sourceFile.getPreEmitDiagnostics();
const missingVars = new Set();

for (const d of diagnostics) {
    if (d.getCategory() === DiagnosticCategory.Error) {
        const msg = typeof d.getMessageText() === 'string' ? d.getMessageText() : d.getMessageText().getMessageText();
        const match = msg.match(/Cannot find name '([^']+)'/);
        if (match) {
            missingVars.add(match[1]);
        }
    }
}

const varsArray = Array.from(missingVars).sort();
console.log(`Found ${varsArray.length} required props.`);
console.log(varsArray.join(', '));
fs.writeFileSync('checkout_props.json', JSON.stringify(varsArray, null, 2));

fs.unlinkSync('src/components/CheckoutModalTemp.tsx');
