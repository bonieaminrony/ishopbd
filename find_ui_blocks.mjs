import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

// A simple way to find large chunks is to look for prominent conditional rendering or large divs.
// e.g. {isCheckoutOpen && (
// or just look at the return function's children.

const lines = content.split(/\r?\n/);

let returnIndex = lines.findIndex(l => l.includes('  return ('));
if (returnIndex === -1) {
    console.log("Could not find main return");
    process.exit(1);
}

// Let's just print lines from the return statement down, looking for major `{isSomethingOpen && (` patterns
for (let i = returnIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/{\w+Open && \(/) || line.match(/<AnimatePresence>/) || line.match(/<main/)) {
        console.log(`Line ${i + 1}: ${line.trim()}`);
    }
}
