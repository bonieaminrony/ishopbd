import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

const propNames = [
    'adminProps', 'checkoutProps', 'trackingModalProps', 'courierHistoryModalProps',
    'chatModalProps', 'multiOrderSelectionModalProps', 'depositModalProps',
    'authModalProps', 'notifModalProps', 'deliveryInfoModalProps', 'langModalProps',
    'landingDistrictModalProps', 'inlineDistrictModalProps', 'filterMenuModalProps'
];

for (const propName of propNames) {
    const startStr = "  const " + propName + " = {";
    let startIndex = appContent.indexOf(startStr);
    
    if (startIndex !== -1) {
        let endStr = '  };\n';
        let endIndex = appContent.indexOf(endStr, startIndex);
        
        if (endIndex === -1) {
            endIndex = appContent.indexOf('  };\r\n', startIndex);
            if (endIndex !== -1) endIndex += 6;
        } else {
            endIndex += 5;
        }
        
        if (endIndex > startIndex) {
            const block = appContent.slice(startIndex, endIndex);
            
            const lines = block.split('\\n');
            const vars = [];
            for (const l of lines) {
                const trimmed = l.trim().replace(/,$/, '');
                if (trimmed && !trimmed.startsWith('const ') && !trimmed.startsWith('}')) {
                    vars.push(trimmed);
                }
            }
            
            appContent = appContent.slice(0, startIndex) + appContent.slice(endIndex);
            
            const searchStr = "{..." + propName + "}";
            const inlineProps = "{...{ " + vars.join(', ') + " }}";
            appContent = appContent.replace(searchStr, inlineProps);
            console.log("Inlined props for " + propName);
        }
    }
}

fs.writeFileSync('src/App.tsx', appContent);
console.log("Successfully inlined all props.");
