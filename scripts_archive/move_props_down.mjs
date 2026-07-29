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
            extractedProps.push(block);
            appContent = appContent.slice(0, startIndex) + appContent.slice(endIndex);
        }
        startIndex = appContent.indexOf(startStr);
    }
}

// Ensure unique blocks only
extractedProps = [...new Set(extractedProps)];

// Find the main return statement. We can find it by looking for:
// <div className="min-h-screen flex flex-col overflow-x-hidden relative">
const targetStr = '    <div className="min-h-screen flex flex-col overflow-x-hidden relative">';
let insertIndex = appContent.lastIndexOf('  return (', appContent.indexOf(targetStr));
if (insertIndex === -1) {
    // try CRLF
    insertIndex = appContent.lastIndexOf('  return (\r\n', appContent.indexOf(targetStr));
}

if (insertIndex !== -1) {
    appContent = appContent.slice(0, insertIndex) + extractedProps.join('\n') + '\n' + appContent.slice(insertIndex);
    fs.writeFileSync('src/App.tsx', appContent);
    console.log("Successfully moved all props blocks to right before the main return().");
} else {
    console.log("Failed to find main return.");
}
