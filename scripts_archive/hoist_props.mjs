import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const propNames = [
    'adminProps', 'checkoutProps', 'trackingModalProps', 'courierHistoryModalProps',
    'chatModalProps', 'multiOrderSelectionModalProps', 'depositModalProps',
    'authModalProps', 'notifModalProps', 'deliveryInfoModalProps', 'langModalProps',
    'landingDistrictModalProps', 'inlineDistrictModalProps', 'filterMenuModalProps'
];

let extractedProps = [];

for (const prop of propNames) {
    const startStr = "  const " + prop + " = {";
    let startIndex = appContent.indexOf(startStr);
    
    while (startIndex !== -1) {
        const endStr = '  };\n';
        let endIndex = appContent.indexOf(endStr, startIndex);
        
        // Handle CRLF
        if (endIndex === -1) {
            endIndex = appContent.indexOf('  };\r\n', startIndex);
            if (endIndex !== -1) endIndex += 6;
        } else {
            endIndex += 5;
        }
        
        if (endIndex > startIndex) {
            const block = appContent.slice(startIndex, endIndex);
            extractedProps.push(block);
            appContent = appContent.slice(0, startIndex) + appContent.slice(endIndex);
        }
        startIndex = appContent.indexOf(startStr);
    }
}

// Ensure unique blocks only
extractedProps = [...new Set(extractedProps)];

appContent = appContent.replace('function App() {', 'function App() {\n' + extractedProps.join('\n') + '\n');
fs.writeFileSync('src/App.tsx', appContent);
console.log("Successfully hoisted all props blocks to the top of App().");
