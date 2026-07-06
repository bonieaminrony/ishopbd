const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace("import { useOrderContext } from './context/OrderContext';\n", "");
fs.writeFileSync('src/App.tsx', app);
