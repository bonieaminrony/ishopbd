const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navigate and just wait for 5 seconds (ignore network idle)
  console.log("Navigating...");
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting 5 seconds for React to mount and crash...");
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'crash.png' });
  
  await browser.close();
  console.log("Screenshot saved as crash.png");
})();
