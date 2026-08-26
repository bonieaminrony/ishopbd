import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getWorkingClient() {
  const HOSTS_TO_TRY = ['rokomariponnohari.com', '14.128.14.128'];
  for (const host of HOSTS_TO_TRY) {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
      console.log(`Connecting to FTP at ${host} with user rokomari...`);
      await client.access({
        host: host,
        port: 21,
        user: 'rokomari',
        password: 'CR:64nAJ0ir-i6',
        secure: false
      });
      console.log(`✅ Connected successfully to ${host} FTP!`);
      return { client, host };
    } catch (err) {
      console.log(`❌ Failed with host ${host}: ${err.message}`);
      client.close();
    }
  }
  throw new Error('All FTP connection attempts failed.');
}

async function uploadToDir(client, targetDir) {
  console.log(`\n📁 Deploying to target directory: ${targetDir}...`);
  await client.ensureDir(targetDir);
  await client.ensureDir(`${targetDir}/assets`);
  await client.ensureDir(`${targetDir}/api`);
  await client.ensureDir(`${targetDir}/tmp`);

  // 1. Upload .env
  console.log('  📤 Uploading .env...');
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    await client.uploadFrom(path.join(__dirname, '.env'), `${targetDir}/.env`);
  }

  // 2. Upload service-account.json
  const serviceAccountPath = path.join(__dirname, 'api', 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    await client.uploadFrom(serviceAccountPath, `${targetDir}/api/service-account.json`);
  }

  // 3. Upload index.html
  console.log('  📤 Uploading dist/index.html...');
  await client.uploadFrom(path.join(__dirname, 'dist', 'index.html'), `${targetDir}/index.html`);

  // 4. Upload server.cjs
  console.log('  📤 Uploading dist/server.cjs...');
  await client.uploadFrom(path.join(__dirname, 'dist', 'server.cjs'), `${targetDir}/server.cjs`);

  // 5. Upload server.cjs.map if exists
  if (fs.existsSync(path.join(__dirname, 'dist', 'server.cjs.map'))) {
    await client.uploadFrom(path.join(__dirname, 'dist', 'server.cjs.map'), `${targetDir}/server.cjs.map`);
  }

  // 6. Upload assets folder
  console.log('  📤 Uploading dist/assets folder...');
  await client.uploadFromDir(path.join(__dirname, 'dist', 'assets'), `${targetDir}/assets`);

  // 7. Upload public/api directory
  if (fs.existsSync(path.join(__dirname, 'public', 'api'))) {
    console.log('  📤 Uploading public/api folder...');
    await client.uploadFromDir(path.join(__dirname, 'public', 'api'), `${targetDir}/api`);
  }

  // 8. Upload .htaccess and index.php / app.php
  if (fs.existsSync(path.join(__dirname, 'public', 'index.php'))) {
    console.log('  📤 Uploading index.php & app.php...');
    await client.uploadFrom(path.join(__dirname, 'public', 'index.php'), `${targetDir}/index.php`);
    await client.uploadFrom(path.join(__dirname, 'public', 'index.php'), `${targetDir}/app.php`);
  }

  if (fs.existsSync(path.join(__dirname, 'htaccess.txt'))) {
    console.log('  📤 Uploading .htaccess...');
    await client.uploadFrom(path.join(__dirname, 'htaccess.txt'), `${targetDir}/.htaccess`);
  }

  // 9. Upload public static files
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
      await client.uploadFrom(localFilePath, `${targetDir}/${file}`).catch(() => {});
    }
  }

  // 10. Trigger restart
  fs.writeFileSync(path.join(__dirname, 'restart.txt'), `Restart at ${new Date().toISOString()}\n`);
  await client.uploadFrom(path.join(__dirname, 'restart.txt'), `${targetDir}/tmp/restart.txt`).catch(() => {});
  await client.uploadFrom(path.join(__dirname, 'restart.txt'), `${targetDir}/restart.txt`).catch(() => {});
  console.log(`  ✅ Successfully updated ${targetDir}!`);
}

async function deploy() {
  let clientObj;
  try {
    clientObj = await getWorkingClient();
    const { client } = clientObj;

    // Check remote directories
    const rootList = await client.list('/');
    const dirNames = rootList.map(i => i.name);
    console.log('Remote root directories:', dirNames);

    // Deploy to /public_html
    await uploadToDir(client, '/public_html');

    // If /domains exists, check if rokomariponnohari.com is inside
    if (dirNames.includes('domains')) {
      try {
        const domainsList = await client.list('/domains');
        for (const dom of domainsList) {
          if (dom.isDirectory) {
            await uploadToDir(client, `/domains/${dom.name}/public_html`);
          }
        }
      } catch (e) {
        console.log('Domains check:', e.message);
      }
    }

    console.log('\n🎉 ALL LIVE DIRECTORIES DEPLOYED AND UPDATED ON SERVER!');
    client.close();
  } catch (e) {
    console.error('❌ Deployment error:', e.message);
    if (clientObj?.client) clientObj.client.close();
    process.exit(1);
  }
}

deploy();
