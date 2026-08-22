import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PASSWORDS_TO_TRY = ['Aminbro@1122', 'n3GuM$aUuHKB9@X'];

async function getWorkingClient() {
  for (const password of PASSWORDS_TO_TRY) {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
      console.log(`Connecting to Hostinger FTP with user u286107709...`);
      await client.access({
        host: '187.127.183.159',
        port: 21,
        user: 'u286107709',
        password: password,
        secure: false
      });
      console.log('✅ Connected successfully to Hostinger FTP!');
      return { client, password };
    } catch (err) {
      console.log(`❌ Failed with password candidate: ${err.message}`);
      client.close();
    }
  }
  throw new Error('All FTP password attempts failed.');
}

async function deploy() {
  let clientObj;
  try {
    clientObj = await getWorkingClient();
    const { client } = clientObj;

    const REMOTE_DIR = '/domains/ishopbd.com/public_html';

    console.log('📁 Checking remote directories...');
    await client.ensureDir(REMOTE_DIR);
    await client.ensureDir(`${REMOTE_DIR}/assets`);
    await client.ensureDir(`${REMOTE_DIR}/api`);
    await client.ensureDir(`${REMOTE_DIR}/tmp`);

    // 1. Upload .env
    console.log('📤 Uploading .env...');
    if (fs.existsSync(path.join(__dirname, '.env'))) {
      await client.uploadFrom(path.join(__dirname, '.env'), `${REMOTE_DIR}/.env`);
      await client.uploadFrom(path.join(__dirname, '.env'), `/domains/ishopbd.com/.env`).catch(() => {});
      console.log('✅ .env uploaded!');
    }

    // 2. Upload service-account.json
    console.log('📤 Uploading api/service-account.json...');
    const serviceAccountPath = path.join(__dirname, 'api', 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      await client.uploadFrom(serviceAccountPath, `${REMOTE_DIR}/api/service-account.json`);
      console.log('✅ service-account.json uploaded!');
    }

    // 3. Upload index.html
    console.log('📤 Uploading dist/index.html...');
    await client.uploadFrom(path.join(__dirname, 'dist', 'index.html'), `${REMOTE_DIR}/index.html`);
    console.log('✅ index.html uploaded!');

    // 4. Upload server.cjs
    console.log('📤 Uploading dist/server.cjs...');
    await client.uploadFrom(path.join(__dirname, 'dist', 'server.cjs'), `${REMOTE_DIR}/server.cjs`);
    console.log('✅ server.cjs uploaded!');

    // 5. Upload server.cjs.map if exists
    if (fs.existsSync(path.join(__dirname, 'dist', 'server.cjs.map'))) {
      console.log('📤 Uploading dist/server.cjs.map...');
      await client.uploadFrom(path.join(__dirname, 'dist', 'server.cjs.map'), `${REMOTE_DIR}/server.cjs.map`);
      console.log('✅ server.cjs.map uploaded!');
    }

    // 6. Upload assets folder
    console.log('📤 Uploading dist/assets folder...');
    await client.uploadFromDir(path.join(__dirname, 'dist', 'assets'), `${REMOTE_DIR}/assets`);
    console.log('✅ assets folder uploaded!');

    // 7. Upload public/api directory (PHP API endpoints like chat.php, etc.)
    if (fs.existsSync(path.join(__dirname, 'public', 'api'))) {
      console.log('📤 Uploading public/api folder (chat.php, etc.)...');
      await client.uploadFromDir(path.join(__dirname, 'public', 'api'), `${REMOTE_DIR}/api`);
      console.log('✅ api folder uploaded!');
    }

    // 8. Upload .htaccess and index.php / app.php
    if (fs.existsSync(path.join(__dirname, 'public', 'index.php'))) {
      console.log('📤 Uploading public/index.php...');
      await client.uploadFrom(path.join(__dirname, 'public', 'index.php'), `${REMOTE_DIR}/index.php`);
      await client.uploadFrom(path.join(__dirname, 'public', 'index.php'), `${REMOTE_DIR}/app.php`);
      console.log('✅ index.php & app.php uploaded!');
    }

    if (fs.existsSync(path.join(__dirname, 'htaccess.txt'))) {
      console.log('📤 Uploading .htaccess...');
      await client.uploadFrom(path.join(__dirname, 'htaccess.txt'), `${REMOTE_DIR}/.htaccess`);
      console.log('✅ .htaccess uploaded!');
    }

    // 9. Upload public static files if exist (google verification, favicon, sitemap, icons, manifest)
    const googleVerify = path.join(__dirname, 'public', 'googlea7215920fe1a9449.html');
    if (fs.existsSync(googleVerify)) {
      await client.uploadFrom(googleVerify, `${REMOTE_DIR}/googlea7215920fe1a9449.html`).catch(() => {});
    }

    const staticFiles = [
      'favicon.ico',
      'logo.png',
      'logo 2.png',
      'manifest.json',
      'icon-192x192.png',
      'icon-512x512.png',
      'icon-144x144.png',
      'icon-96x96.png',
      'icon-48x48.png',
      'sitemap.xml',
      'robots.txt',
      'sw.js'
    ];

    for (const file of staticFiles) {
      const localFilePath = path.join(__dirname, 'dist', file);
      if (fs.existsSync(localFilePath)) {
        console.log(`📤 Uploading dist/${file}...`);
        await client.uploadFrom(localFilePath, `${REMOTE_DIR}/${file}`).catch((err) => {
          console.log(`⚠️ Failed to upload ${file}: ${err.message}`);
        });
      }
    }

    // 10. Upload restart.txt to trigger Node.js app reload
    console.log('🔄 Triggering server restart via restart.txt...');
    fs.writeFileSync(path.join(__dirname, 'restart.txt'), `Restart at ${new Date().toISOString()}\n`);
    await client.uploadFrom(path.join(__dirname, 'restart.txt'), `${REMOTE_DIR}/tmp/restart.txt`).catch(() => {});
    await client.uploadFrom(path.join(__dirname, 'restart.txt'), `${REMOTE_DIR}/restart.txt`).catch(() => {});
    console.log('✅ restart.txt uploaded!');

    console.log('\n🎉 ALL FILES DEPLOYED TO HOSTINGER SUCCESSFULLY!');
    client.close();
  } catch (e) {
    console.error('❌ Deployment error:', e.message);
    if (clientObj?.client) clientObj.client.close();
  }
}

deploy();
