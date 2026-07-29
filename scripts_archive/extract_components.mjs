import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');
let lines = content.split(/\r?\n/);

// Find sumValues
let sumValuesLineIndex = lines.findIndex(l => l.includes('const sumValues = (obj: Record<string, number>): number =>'));
if (sumValuesLineIndex !== -1) {
    let sumValuesCode = lines[sumValuesLineIndex];
    // Add to helpers.ts
    let helpersContent = fs.readFileSync('src/utils/helpers.ts', 'utf8');
    helpersContent += '\nexport ' + sumValuesCode;
    fs.writeFileSync('src/utils/helpers.ts', helpersContent);
    // Remove from App.tsx
    lines.splice(sumValuesLineIndex, 1);
    console.log("Extracted sumValues");
}

// Find FlashSaleCountdown
let flashSaleStartIndex = lines.findIndex(l => l.includes('const FlashSaleCountdown = '));
let flashSaleEndIndex = lines.findIndex((l, idx) => idx > flashSaleStartIndex && l === '};' && lines[idx+2] && lines[idx+2].includes('const notifyAdminsOnNewOrder'));

if (flashSaleStartIndex !== -1 && flashSaleEndIndex !== -1) {
    let flashSaleLines = lines.slice(flashSaleStartIndex, flashSaleEndIndex + 1);
    
    // Create FlashSaleCountdown.tsx
    let componentCode = `import React, { useState, useEffect } from "react";
import { Product } from "../types";

export ` + flashSaleLines.join('\n');
    
    fs.writeFileSync('src/components/FlashSaleCountdown.tsx', componentCode);
    
    // Remove from App.tsx
    lines.splice(flashSaleStartIndex, flashSaleEndIndex - flashSaleStartIndex + 1);
    
    // Find import helpers line to append the new imports
    let importHelpersIndex = lines.findIndex(l => l.includes('import { getOrderLocalDateString'));
    if (importHelpersIndex !== -1) {
        // add sumValues to the helper import
        lines[importHelpersIndex] = lines[importHelpersIndex].replace(/cleanLatex \} from/, 'cleanLatex, sumValues } from');
        
        // Add FlashSaleCountdown import
        lines.splice(importHelpersIndex + 1, 0, `import { FlashSaleCountdown } from './components/FlashSaleCountdown';`);
    }

    fs.writeFileSync('src/App.tsx', lines.join('\n'));
    console.log("Extracted FlashSaleCountdown");
} else {
    console.log("Could not find FlashSaleCountdown bounds");
}
