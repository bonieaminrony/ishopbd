import fs from 'fs';

const filePath = 'src/components/AdminPanel.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Match any string containing at least one Bengali character
const bengaliRegex = /[\u0980-\u09FF]+/g;

const lines = content.split('\n');
const uniqueStrings = new Set();

lines.forEach(line => {
    // Basic regex to catch contents of JSX text or string literals that have Bengali chars
    const matches = line.match(/(["'`>])([^"'`<]*[\u0980-\u09FF]+[^"'`<]*)(["'<])/g);
    if (matches) {
        matches.forEach(m => {
            // Strip the delimiters
            let str = m.substring(1, m.length - 1).trim();
            if (str) {
                uniqueStrings.add(str);
            }
        });
    }
});

const sorted = Array.from(uniqueStrings).sort();
fs.writeFileSync('bengali_strings.json', JSON.stringify(sorted, null, 2));
console.log(`Found ${sorted.length} unique Bengali strings.`);
