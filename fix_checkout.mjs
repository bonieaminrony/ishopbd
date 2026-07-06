import fs from 'fs';

const allVars = JSON.parse(fs.readFileSync('checkout_props.json', 'utf8'));
const lucideIcons = ['ArrowRight', 'Award', 'ChevronDown', 'ShoppingBag', 'X', 'Zap'];

const toPass = [];
for (const v of allVars) {
    if (!lucideIcons.includes(v)) toPass.push(v);
}
if (!toPass.includes('isCheckoutOpen')) toPass.push('isCheckoutOpen');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const checkoutPropsObj = `
  const checkoutProps = {
${toPass.map(p => `    ${p},`).join('\n')}
  };
`;

const targetStr = '    <div className="min-h-screen flex flex-col overflow-x-hidden relative">';
const insertIndex = appContent.lastIndexOf('  return (', appContent.indexOf(targetStr));

if (insertIndex !== -1) {
    appContent = appContent.slice(0, insertIndex) + checkoutPropsObj + '\n' + appContent.slice(insertIndex);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log('Inserted checkoutProps successfully.');
} else {
    console.log('Failed to find insertion point.');
}
