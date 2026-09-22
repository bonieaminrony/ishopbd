import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PASSWORDS_TO_TRY = ['Aminbro@1122', 'n3GuM$aUuHKB9@X'];

async function createClient(preferredPassword = null) {
  const passwords = preferredPassword 
    ? [preferredPassword, ...PASSWORDS_TO_TRY.filter(p => p !== preferredPassword)]
    : PASSWORDS_TO_TRY;

  for (const password of passwords) {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    client.ftp.timeout = 60000;
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

async function uploadFileSafe(clientContext, localPath, remotePath, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const remoteParent = path.posix.dirname(remotePath);
      await clientContext.client.ensureDir(remoteParent);
      await clientContext.client.uploadFrom(localPath, remotePath);
      return;
    } catch (err) {
      console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed for ${remotePath}: ${err.message}`);
      try { clientContext.client.close(); } catch (_) {}
      if (attempt === maxRetries) throw err;
      console.log('🔄 Reconnecting FTP client...');
      await new Promise(r => setTimeout(r, 2000));
      const fresh = await createClient(clientContext.password);
      clientContext.client = fresh.client;
      clientContext.password = fresh.password;
    }
  }
}

async function uploadDirectoryRecursive(clientContext, localDir, remoteDir) {
  if (!fs.existsSync(localDir)) return;
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localEntryPath = path.join(localDir, entry.name);
    const remoteEntryPath = `${remoteDir}/${entry.name}`;
    if (entry.isDirectory()) {
      await uploadDirectoryRecursive(clientContext, localEntryPath, remoteEntryPath);
    } else if (entry.isFile()) {
      process.stdout.write(`  📤 ${remoteEntryPath} ... `);
      await uploadFileSafe(clientContext, localEntryPath, remoteEntryPath);
      console.log('done');
    }
  }
}

async function deploy() {
  let clientContext;
  try {
    clientContext = await createClient();

    const REMOTE_DIR = '/domains/ishopbd.com/public_html';

    console.log('📁 Checking remote directories...');
    await clientContext.client.ensureDir(REMOTE_DIR);
    await clientContext.client.ensureDir(`${REMOTE_DIR}/assets`);
    await clientContext.client.ensureDir(`${REMOTE_DIR}/api`);
    await clientContext.client.ensureDir(`${REMOTE_DIR}/tmp`);
    await clientContext.client.ensureDir(`${REMOTE_DIR}/uploads`);

    // Clean up Hostinger default holding/parking files if present
    console.log('🧹 Cleaning up Hostinger placeholder files if present...');
    await clientContext.client.remove(`${REMOTE_DIR}/default.php`).catch(() => {});
    await clientContext.client.remove(`${REMOTE_DIR}/default.html`).catch(() => {});
    await clientContext.client.remove(`${REMOTE_DIR}/hosting-page.html`).catch(() => {});

    // 1. Upload .env
    console.log('📤 Uploading .env...');
    if (fs.existsSync(path.join(__dirname, '.env'))) {
      await uploadFileSafe(clientContext, path.join(__dirname, '.env'), `${REMOTE_DIR}/.env`);
      await uploadFileSafe(clientContext, path.join(__dirname, '.env'), `/domains/ishopbd.com/.env`).catch(() => {});
      console.log('✅ .env uploaded!');
    }

    // 2. Upload service-account.json
    console.log('📤 Uploading api/service-account.json...');
    const serviceAccountPath = path.join(__dirname, 'api', 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      await uploadFileSafe(clientContext, serviceAccountPath, `${REMOTE_DIR}/api/service-account.json`);
      console.log('✅ service-account.json uploaded!');
    }

    // 3. Upload index.html
    console.log('📤 Uploading dist/index.html...');
    await uploadFileSafe(clientContext, path.join(__dirname, 'dist', 'index.html'), `${REMOTE_DIR}/index.html`);
    console.log('✅ index.html uploaded!');

    // 4. Upload server.cjs
    console.log('📤 Uploading dist/server.cjs...');
    await uploadFileSafe(clientContext, path.join(__dirname, 'dist', 'server.cjs'), `${REMOTE_DIR}/server.cjs`);
    console.log('✅ server.cjs uploaded!');

    // 5. Upload server.cjs.map if exists
    if (fs.existsSync(path.join(__dirname, 'dist', 'server.cjs.map'))) {
      console.log('📤 Uploading dist/server.cjs.map...');
      await uploadFileSafe(clientContext, path.join(__dirname, 'dist', 'server.cjs.map'), `${REMOTE_DIR}/server.cjs.map`);
      console.log('✅ server.cjs.map uploaded!');
    }

    // 6. Upload assets folder
    console.log('📤 Uploading dist/assets folder...');
    await uploadDirectoryRecursive(clientContext, path.join(__dirname, 'dist', 'assets'), `${REMOTE_DIR}/assets`);
    console.log('✅ assets folder uploaded!');

    // 7. Upload public/api directory (PHP API endpoints like chat.php, products.php, etc.)
    if (fs.existsSync(path.join(__dirname, 'public', 'api'))) {
      console.log('📤 Uploading public/api folder (chat.php, products.php, etc.)...');
      await uploadDirectoryRecursive(clientContext, path.join(__dirname, 'public', 'api'), `${REMOTE_DIR}/api`);
      console.log('✅ api folder uploaded!');
    }

    // 7.1 Upload public/uploads directory if exists locally
    if (fs.existsSync(path.join(__dirname, 'public', 'uploads'))) {
      console.log('📤 Uploading local public/uploads folder...');
      await uploadDirectoryRecursive(clientContext, path.join(__dirname, 'public', 'uploads'), `${REMOTE_DIR}/uploads`);
      console.log('✅ uploads folder uploaded!');
    }

    // 8. Upload .htaccess and index.php / app.php
    if (fs.existsSync(path.join(__dirname, 'public', 'index.php'))) {
      console.log('📤 Uploading public/index.php...');
      await uploadFileSafe(clientContext, path.join(__dirname, 'public', 'index.php'), `${REMOTE_DIR}/index.php`);
      await uploadFileSafe(clientContext, path.join(__dirname, 'public', 'index.php'), `${REMOTE_DIR}/app.php`);
      console.log('✅ index.php & app.php uploaded!');
    }

    if (fs.existsSync(path.join(__dirname, 'htaccess.txt'))) {
      console.log('📤 Uploading .htaccess...');
      await uploadFileSafe(clientContext, path.join(__dirname, 'htaccess.txt'), `${REMOTE_DIR}/.htaccess`);
      console.log('✅ .htaccess uploaded!');
    }

    // 9. Upload public static files if exist (google verification, favicon, sitemap, icons, manifest)
    const googleVerify = path.join(__dirname, 'public', 'googlea7215920fe1a9449.html');
    if (fs.existsSync(googleVerify)) {
      await uploadFileSafe(clientContext, googleVerify, `${REMOTE_DIR}/googlea7215920fe1a9449.html`).catch(() => {});
    }

    const staticFiles = [
      'favicon.ico',
      'logo.png',
      'logo 2.png',
      'og-image.png',
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
        await uploadFileSafe(clientContext, localFilePath, `${REMOTE_DIR}/${file}`).catch((err) => {
          console.log(`⚠️ Failed to upload ${file}: ${err.message}`);
        });
      }
    }

    // 10. Upload restart.txt to trigger Node.js app reload
    console.log('🔄 Triggering server restart via restart.txt...');
    fs.writeFileSync(path.join(__dirname, 'restart.txt'), `Restart at ${new Date().toISOString()}\n`);
    await uploadFileSafe(clientContext, path.join(__dirname, 'restart.txt'), `${REMOTE_DIR}/tmp/restart.txt`).catch(() => {});
    await uploadFileSafe(clientContext, path.join(__dirname, 'restart.txt'), `${REMOTE_DIR}/restart.txt`).catch(() => {});
    console.log('✅ restart.txt uploaded!');

    console.log('\n🎉 ALL FILES DEPLOYED TO HOSTINGER SUCCESSFULLY!');
    clientContext.client.close();
  } catch (e) {
    console.error('❌ Deployment error:', e.message);
    if (clientContext?.client) clientContext.client.close();
    process.exit(1);
  }
}

deploy();
