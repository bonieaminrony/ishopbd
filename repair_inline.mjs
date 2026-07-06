import fs from 'fs';

const components = [
    'AdminPanel', 'CheckoutModal', 'TrackingModal', 'CourierHistoryModal',
    'ChatModal', 'MultiOrderSelectionModal', 'DepositModal',
    'AuthModal', 'NotifModal', 'DeliveryInfoModal', 'LangModal',
    'LandingDistrictModal', 'InlineDistrictModal', 'FilterMenuModal'
];

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

for (const comp of components) {
    if (!fs.existsSync("src/components/" + comp + ".tsx")) continue;
    
    const compContent = fs.readFileSync("src/components/" + comp + ".tsx", 'utf8');
    const interfaceStart = compContent.indexOf("export interface " + comp + "Props {");
    if (interfaceStart === -1) continue;
    
    const interfaceEnd = compContent.indexOf('}', interfaceStart);
    const interfaceBlock = compContent.slice(interfaceStart, interfaceEnd);
    
    const lines = interfaceBlock.split('\\n').slice(1);
    const props = [];
    for (const l of lines) {
        // Regex literal doesn't need double backslash!
        const match = l.match(/\\s*([A-Za-z0-9_]+)\\s*:/); 
        if (match) {
            props.push(match[1]);
        }
    }
    
    // Fallback if the regex somehow missed because of CRLF or whatever
    if (props.length === 0) {
        const rawMatches = [...interfaceBlock.matchAll(/([A-Za-z0-9_]+)\s*:/g)];
        for (const m of rawMatches) {
            props.push(m[1]);
        }
    }
    
    const newProps = "{...{ " + props.join(', ') + " }}";
    
    const regex1 = new RegExp("<" + comp + "\\\\s+\\\\\\{\\\\\\.?\\\\\\.\\\\\\.\\\\\\{\\\\s*\\\\}\\\\\\} \\\\/>");
    const regex2 = new RegExp("<" + comp + "\\\\s+\\\\\\{\\\\\\.?\\\\\\.\\\\\\.\\\\\\{\\\\s*\\\\}\\\\\\}\\\\s*\\\\/>");
    
    let replaced = false;
    if (regex1.test(appContent)) {
        appContent = appContent.replace(regex1, "<" + comp + " " + newProps + " />");
        replaced = true;
    } else if (regex2.test(appContent)) {
        appContent = appContent.replace(regex2, "<" + comp + " " + newProps + " />");
        replaced = true;
    } else {
        const search1 = "<" + comp + " {...{  }} />";
        const search2 = "<" + comp + " {...{ }} />";
        const search3 = "<" + comp + " {...{}} />";
        if (appContent.includes(search1)) {
            appContent = appContent.replace(search1, "<" + comp + " " + newProps + " />");
            replaced = true;
        } else if (appContent.includes(search2)) {
            appContent = appContent.replace(search2, "<" + comp + " " + newProps + " />");
            replaced = true;
        } else if (appContent.includes(search3)) {
            appContent = appContent.replace(search3, "<" + comp + " " + newProps + " />");
            replaced = true;
        } else {
            console.log("Could not find empty props for " + comp);
        }
    }
    
    if (replaced) {
        console.log("Repaired " + comp + " with " + props.length + " props.");
    }
}

fs.writeFileSync('src/App.tsx', appContent);
console.log("Repair complete.");
