import { Project, Node } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

let targetNode = null;

sourceFile.forEachDescendant(node => {
    if (Node.isJsxExpression(node)) {
        const expression = node.getExpression();
        if (expression && Node.isBinaryExpression(expression)) {
            const left = expression.getLeft();
            if (left.getText() === 'isCheckoutOpen') {
                targetNode = node;
            }
        }
    }
});

if (targetNode) {
    const jsxText = targetNode.getText();
    fs.writeFileSync('checkout_extracted.txt', jsxText);
    console.log(`Extracted Checkout JSX: ${jsxText.length} characters.`);
} else {
    console.log("Could not find block");
}
