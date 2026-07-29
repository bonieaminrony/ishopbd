const fs = require('fs');

// Update manifest.json
let manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
manifest.icons = [
  {
    "src": "/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
];
fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));

// Update index.html
let indexHtml = '';
if(fs.existsSync('index.html')) {
  indexHtml = fs.readFileSync('index.html', 'utf8');
  indexHtml = indexHtml.replace('<link rel="icon" type="image/png" href="/logo.png">', '<link rel="icon" type="image/png" href="/icon-192x192.png">');
  indexHtml = indexHtml.replace('<link rel="apple-touch-icon" href="/logo.png" />', '<link rel="apple-touch-icon" href="/icon-192x192.png" />');
  fs.writeFileSync('index.html', indexHtml);
} else if(fs.existsSync('public/index.html')) {
  indexHtml = fs.readFileSync('public/index.html', 'utf8');
  indexHtml = indexHtml.replace('<link rel="icon" type="image/png" href="/logo.png">', '<link rel="icon" type="image/png" href="/icon-192x192.png">');
  indexHtml = indexHtml.replace('<link rel="apple-touch-icon" href="/logo.png" />', '<link rel="apple-touch-icon" href="/icon-192x192.png" />');
  fs.writeFileSync('public/index.html', indexHtml);
}

console.log('Updated manifest.json and index.html');
