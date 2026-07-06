import { Project, Node } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

const modalFlags = [
    'isLandingDistrictOpen',
    'isInlineDistrictOpen',
    'isFilterMenuOpen',
    'isMultiOrderSelectionOpen',
    'isCourierHistoryModalOpen',
    'isDepositModalOpen',
    'isChatOpen',
    'isAuthModalOpen',
    'isNotifOpen',
    'isLangModalOpen',
    'isDeliveryInfoOpen',
    'isTrackingOpen'
];

sourceFile.forEachDescendant(node => {
    if (Node.isJsxExpression(node)) {
        const expression = node.getExpression();
        if (expression && Node.isBinaryExpression(expression)) {
            const left = expression.getLeft();
            const text = left.getText();
            if (modalFlags.includes(text)) {
                console.log(`${text} length: ${node.getText().length} chars`);
            }
        }
    }
});
