import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const imports = [];
for (const line of lines) {
  if (line.startsWith('import ') && line.includes('from')) {
    imports.push(line.trim());
  }
}

console.log('App.tsx Direct Imports:');
imports.forEach(i => console.log('  ', i));
