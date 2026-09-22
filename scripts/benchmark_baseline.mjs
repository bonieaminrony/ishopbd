import axios from 'axios';
import { performance } from 'perf_hooks';

async function measureUrl(url, options = {}) {
  const times = [];
  const sizes = [];
  let status = 0;
  let headers = {};

  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cache-Control': 'no-cache',
          ...options.headers
        },
        timeout: 15000,
        validateStatus: () => true
      });
      const end = performance.now();
      times.push(end - start);
      sizes.push(typeof res.data === 'string' ? res.data.length : JSON.stringify(res.data).length);
      status = res.status;
      headers = res.headers;
    } catch (e) {
      times.push(-1);
    }
  }

  const validTimes = times.filter(t => t > 0);
  const avgTime = validTimes.length > 0 ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(1) : 'N/A';
  const avgSize = sizes.length > 0 ? (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(0) : 0;

  return { url, status, avgTime: Number(avgTime), avgSize: Number(avgSize), headers, times };
}

async function runBenchmark() {
  console.log('===============================================================');
  console.log('BASELINE PERFORMANCE MEASUREMENT: PRODUCTION (https://ishopbd.com)');
  console.log('===============================================================\n');

  const targets = [
    { name: 'Homepage (HTML)', url: 'https://ishopbd.com/' },
    { name: 'Products API (/api/products)', url: 'https://ishopbd.com/api/products' },
    { name: 'Product Details Page (SSR HTML)', url: 'https://ishopbd.com/p/jysuper-jy-2570-3PmgUDX4JAyyQtILQxUI' },
    { name: 'Category Page (Gadgets)', url: 'https://ishopbd.com/category/gadgets' },
    { name: 'Category Page (Electrical)', url: 'https://ishopbd.com/category/electrical' },
    { name: 'Product Image Proxy (/api/product-image/:id)', url: 'https://ishopbd.com/api/product-image/3PmgUDX4JAyyQtILQxUI' },
  ];

  for (const t of targets) {
    const result = await measureUrl(t.url);
    console.log(`[${t.name}]`);
    console.log(`  URL: ${t.url}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Average Latency (3 runs): ${result.avgTime} ms (Runs: ${result.times.map(t => t.toFixed(1)).join(', ')} ms)`);
    console.log(`  Payload Size: ${(result.avgSize / 1024).toFixed(2)} KB`);
    console.log(`  Cache-Control: ${result.headers['cache-control'] || 'none'}`);
    console.log(`  Server: ${result.headers['server'] || 'none'} | CDN Cache: ${result.headers['x-hcdn-cache-status'] || 'N/A'}\n`);
  }

  // Audit JS and CSS assets linked in homepage HTML
  console.log('===============================================================');
  console.log('ASSET BUNDLE SIZES ON HOMEPAGE');
  console.log('===============================================================');
  const homeRes = await axios.get('https://ishopbd.com/');
  const html = homeRes.data;

  const scriptMatches = [...html.matchAll(/src="(\/assets\/[^"]+\.js)"/g)].map(m => m[1]);
  const cssMatches = [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map(m => m[1]);

  console.log(`Found ${scriptMatches.length} JS bundle files and ${cssMatches.length} CSS files in HTML:`);

  let totalJsSize = 0;
  for (const s of scriptMatches) {
    const assetUrl = `https://ishopbd.com${s}`;
    const r = await measureUrl(assetUrl);
    totalJsSize += r.avgSize;
    console.log(`  JS: ${s} -> ${(r.avgSize / 1024).toFixed(2)} KB (Latency: ${r.avgTime} ms)`);
  }

  let totalCssSize = 0;
  for (const c of cssMatches) {
    const assetUrl = `https://ishopbd.com${c}`;
    const r = await measureUrl(assetUrl);
    totalCssSize += r.avgSize;
    console.log(`  CSS: ${c} -> ${(r.avgSize / 1024).toFixed(2)} KB (Latency: ${r.avgTime} ms)`);
  }

  console.log(`\nTotal Main JS initial load: ${(totalJsSize / 1024).toFixed(2)} KB`);
  console.log(`Total Main CSS initial load: ${(totalCssSize / 1024).toFixed(2)} KB`);
}

runBenchmark().catch(console.error);
