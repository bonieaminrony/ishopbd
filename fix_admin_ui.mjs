import fs from 'fs';

// 1. Update AdminPanel.tsx
const adminPanelPath = 'src/components/AdminPanel.tsx';
let adminCode = fs.readFileSync(adminPanelPath, 'utf8');

// Replacements for Bengali text
adminCode = adminCode.replace(/সাম্প্রতিক Orders/g, 'Recent Orders');
adminCode = adminCode.replace(/All এরিয়া/g, 'All Areas');
adminCode = adminCode.replace(/ড্যাশবোর্ড বন্ধ করুন/g, 'Close Dashboard');

// Typography softening
// font-black is very heavy, reducing it to font-bold
adminCode = adminCode.replace(/font-black/g, 'font-bold');

// The sidebar active items use a combination that can be harsh.
// Instead of changing too many things blindly, let's just tone down table headers:
// "text-[10px] font-bold text-gray-400 uppercase"
adminCode = adminCode.replace(/text-\[10px\] font-bold text-gray-400 uppercase/g, 'text-[11px] font-semibold text-gray-500 uppercase tracking-wider');

fs.writeFileSync(adminPanelPath, adminCode);
console.log('AdminPanel.tsx updated.');

// 2. Update helpers.ts for Date Formatting
const helpersPath = 'src/utils/helpers.ts';
let helpersCode = fs.readFileSync(helpersPath, 'utf8');

// Let's replace the content of formatOrderGroupDate directly.
// We'll replace the bnMonths and toBengaliDigits logic.
helpersCode = helpersCode.replace(/const bnMonths = \[.*?\];/g, 'const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];');
helpersCode = helpersCode.replace(/const toBengaliDigits =[\s\S]*?};/g, 'const toBengaliDigits = (num: number | string) => String(num);'); // Bypass
helpersCode = helpersCode.replace(/bnMonths\[d\.getMonth\(\)\]/g, 'enMonths[d.getMonth()]');
helpersCode = helpersCode.replace(/আজ/g, 'Today');
helpersCode = helpersCode.replace(/গতকাল/g, 'Yesterday');
helpersCode = helpersCode.replace(/অন্যান্য/g, 'Other');

// Let's also check for bn-BD in getOrderLocalDateString
helpersCode = helpersCode.replace(/bn-BD/g, 'en-US');

fs.writeFileSync(helpersPath, helpersCode);
console.log('helpers.ts updated.');

