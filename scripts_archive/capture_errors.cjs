const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.stack || error.message));
  page.on('requestfailed', request => {
    const errText = request.failure()?.errorText || 'Unknown';
    if (!request.url().includes('google-analytics') && !request.url().includes('facebook.com')) {
      console.log('REQUEST FAILED:', request.url(), errText);
    }
  });

  console.log("Navigating to http://localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  
  console.log("Waiting 5 seconds for page content to load and potential errors to trigger...");
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
  console.log("Done.");
})();
