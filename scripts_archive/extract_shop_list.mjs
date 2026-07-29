import { Project, DiagnosticCategory, Node } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

let targetNode = null;
sourceFile.forEachDescendant(node => {
    if (Node.isConditionalExpression(node)) {
        const condition = node.getCondition();
        if (condition.getText().includes('isProductDetailsOpen && selectedProduct')) {
            targetNode = node.getWhenFalse();
        }
    }
});

if (!targetNode) {
    console.log("Could not find JSX block for ShopList");
    process.exit(1);
}

const jsxText = targetNode.getText();

// Temp file for analysis
const tempFile = "src/components/ShopListTemp.tsx";
const fileContent = "import React from 'react';\n" +
"import { motion, AnimatePresence } from 'framer-motion';\n" +
"import { Helmet } from 'react-helmet-async';\n" +
"import FlashSaleCountdown from './FlashSaleCountdown';\n" +
"export default function ShopList(props: any) {\n" +
"    return (\n" + jsxText + "\n);\n}\n";

fs.writeFileSync(tempFile, fileContent);

const tempProject = new Project();
tempProject.addSourceFileAtPath(tempFile);
const tempSourceFile = tempProject.getSourceFileOrThrow(tempFile);

const diagnostics = tempSourceFile.getPreEmitDiagnostics();
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
fs.unlinkSync(tempFile);

// Common Lucide icons and others
const lucideIcons = [
    'AlertCircle', 'Ban', 'Bell', 'Calendar', 'Camera', 'Check', 'CheckCircle', 'CheckCircle2',
    'ChevronDown', 'ChevronLeft', 'ChevronRight', 'CircleDot', 'Clock', 'Copy', 'Download',
    'Edit', 'Edit2', 'Edit3', 'Eye', 'Gift', 'Headset', 'Heart', 'ImageIcon', 'Landmark',
    'LayoutGrid', 'LayoutTemplate', 'List', 'Loader2', 'MessageSquare', 'Mic', 'MoreVertical',
    'Phone', 'Plus', 'PlusCircle', 'Printer', 'Receipt', 'RefreshCcw', 'Search', 'Send',
    'Share2', 'ShieldCheck', 'ShoppingBag', 'ShoppingCart', 'Square', 'Tag', 'ThumbsUp',
    'Trash2', 'TrendingUp', 'Truck', 'Upload', 'User', 'UserCheck', 'Users', 'Wallet', 'X', 'XCircle',
    'ArrowRight', 'Award', 'Zap', 'ArrowLeft', 'MapPin', 'Package', 'Shield', 'ChevronUp', 'Map',
    'Star', 'MessageCircle', 'CheckSquare', 'PlusSquare', 'MinusSquare', 'Settings', 'LogOut',
    'Image as ImageIcon', 'Globe', 'Lock', 'Unlock', 'CreditCard', 'FileText', 'Activity', 'Archive', 'ArrowDown', 'ArrowUp', 'Box',
    'EyeOff', 'Play'
];

const toImportLucide = [];
const toPass = [];

for (const v of missingVars) {
    if (lucideIcons.includes(v)) toImportLucide.push(v);
    else if (v !== 'FlashSaleCountdown') toPass.push(v); // Don't pass imported component as prop
}

let componentCode = "import React from 'react';\n";
componentCode += "import { motion, AnimatePresence } from 'framer-motion';\n";
componentCode += "import { Helmet } from 'react-helmet-async';\n";
componentCode += "import FlashSaleCountdown from './FlashSaleCountdown';\n";
if (toImportLucide.length > 0) {
    componentCode += "import { " + toImportLucide.join(', ') + " } from 'lucide-react';\n";
}
componentCode += "\nexport interface ShopListProps {\n";
toPass.forEach(p => {
    componentCode += "  " + p + ": any;\n";
});
componentCode += "}\n\n";

componentCode += "export default function ShopList(props: ShopListProps) {\n";
componentCode += "  const {\n";
toPass.forEach(p => {
    componentCode += "    " + p + ",\n";
});
componentCode += "  } = props;\n\n";
componentCode += "  return (\n    <>\n      " + jsxText + "\n    </>\n  );\n}\n";

fs.writeFileSync("src/components/ShopList.tsx", componentCode);

// Modify App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const replacementJsx = "<ShopList {...{ " + toPass.join(', ') + " }} />";
appContent = appContent.replace(jsxText, replacementJsx);

const importStr = "import ShopList from './components/ShopList';\n";
const importIndex = appContent.indexOf('import ');
appContent = appContent.slice(0, importIndex) + importStr + appContent.slice(importIndex);

fs.writeFileSync('src/App.tsx', appContent);
console.log("Successfully extracted ShopList! " + toPass.length + " props extracted.");
