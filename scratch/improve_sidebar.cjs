const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!content.includes('Settings,')) {
  content = content.replace('XCircle } from \'lucide-react\'', 'XCircle, Settings, Package, RotateCcw } from \'lucide-react\'');
}

content = content.replace(/Active Campaigns/g, 'Admin Dashboard');

const preOrderOldIcon = '<div className={`w-2 h-2 rounded-full ${showOnlyPreOrders && adminTab === "orders" ? "bg-white animate-pulse" : "bg-yellow-500"}`} />';
const preOrderNewIcon = '<Clock size={18} />';
content = content.replace(preOrderOldIcon, preOrderNewIcon);

content = content.replace('<PlusCircle size={18} /> Products', '<Package size={18} /> Products');
content = content.replace('<ShieldCheck size={18} /> Settings', '<Settings size={18} /> Settings');
content = content.replace('<TrendingUp size={18} /> Accounts', '<Wallet size={18} /> Accounts');
content = content.replace('<RefreshCcw size={18} /> Refunds', '<RotateCcw size={18} /> Refunds');

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Sidebar UI improved!');
