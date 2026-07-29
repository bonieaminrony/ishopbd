const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The line is: bKash Number (Send Money) inside the text-[#23A354] block
const searchStr = 'text-[#23A354]">\n                              bKash Number (Send Money)';
const replaceStr = 'text-[#23A354]">\n                              Nagad Number (Send Money)';

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replaceStr);
  fs.writeFileSync('src/components/AdminPanel.tsx', content);
  console.log('Fixed Nagad Number label!');
} else {
  console.log('Could not find the exact string. Let me try regex.');
  content = content.replace(/bKash Number \(Send Money\)([\s\S]*?)isNagadEnabled/g, 'Nagad Number (Send Money)$1isNagadEnabled');
  fs.writeFileSync('src/components/AdminPanel.tsx', content);
  console.log('Regex applied!');
}
