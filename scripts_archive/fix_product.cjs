const fs = require('fs');
let pc = fs.readFileSync('src/context/ProductContext.tsx', 'utf8');

pc = pc.replace('../firebase', '../lib/firebase');

const newHooks = '  activeCampaign: any;\n  setActiveCampaign: any;\n  campaigns: any;\n  setCampaigns: any;\n  selectedColor: any;\n  setSelectedColor: any;\n';
pc = pc.replace('type ProductContextType = {\n', 'type ProductContextType = {\n' + newHooks);

const newValues = '    activeCampaign,\n    setActiveCampaign,\n    campaigns,\n    setCampaigns,\n    selectedColor,\n    setSelectedColor,\n';
pc = pc.replace('  const value = {\n', '  const value = {\n' + newValues);

const useStates = `
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('all');
`;
pc = pc.replace('export function ProductProvider({ children }: { children: React.ReactNode }) {', 'export function ProductProvider({ children }: { children: React.ReactNode }) {\n' + useStates);

fs.writeFileSync('src/context/ProductContext.tsx', pc);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const \[campaigns, setCampaigns\] = useState[^;]*;/, '');
app = app.replace(/const \[activeCampaign, setActiveCampaign\] = useState[^;]*;/, '');
app = app.replace(/const \[selectedColor, setSelectedColor\] = useState[^;]*;/, '');

app = app.replace('const { categories', 'const { activeCampaign, setActiveCampaign, campaigns, setCampaigns, selectedColor, setSelectedColor, categories');
fs.writeFileSync('src/App.tsx', app);
