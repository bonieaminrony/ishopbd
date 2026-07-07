const fs = require('fs');
const content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('adminTab === "settings"')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});
