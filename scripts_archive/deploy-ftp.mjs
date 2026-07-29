import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FTP_CONFIG = {
  host: '187.127.183.159',
  port: 21,
  user: 'u286107709',
  password: 'n3GuM$aUuHKB9@X',
  secure: false
};

const REMOTE_DIR = '/domains/ishopbd.com/public_html';

async function deploy() {
  const client = new ftp.Client();

  try {
    await client.access(FTP_CONFIG);
    console.log('✅ Connected to server!\n');

    // 1. Upload new server.cjs (with fallback password fix)
    console.log('📤 Uploading server.cjs (with admin login fix)...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'server.cjs'),
      `${REMOTE_DIR}/server.cjs`
    );
    console.log('✅ server.cjs uploaded!\n');

    // 2. Create and upload .env file
    console.log('📤 Uploading .env file...');
    const envContent = `MASTER_ADMIN_PASSWORD=islamic786
GEMINI_API_KEY=AIzaSyBj0M8GpGNJIEAAGrbdlnhEVKHmC9WQqB0
SMS_API_KEY=ZmxsvZfckGDXn7Pa2Tjj
SMS_SENDER_ID=8809648908219
EMAIL_USER=ishopbd.online@gmail.com
PORT=3000
`;
    const envTempPath = path.join(__dirname, '.env.temp');
    fs.writeFileSync(envTempPath, envContent);
    await client.uploadFrom(envTempPath, `${REMOTE_DIR}/.env`);
    fs.unlinkSync(envTempPath);
    console.log('✅ .env uploaded!\n');

    // 3. Upload index.html (latest build)
    console.log('📤 Uploading index.html...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'index.html'),
      `${REMOTE_DIR}/index.html`
    );
    console.log('✅ index.html uploaded!\n');

    // 4. Upload assets
    console.log('📤 Uploading assets folder...');
    await client.uploadFromDir(
      path.join(__dirname, 'dist', 'assets'),
      `${REMOTE_DIR}/assets`
    );
    console.log('✅ Assets uploaded!\n');

    console.log('🎉 All files uploaded successfully!');
    console.log('\n⚠️  IMPORTANT: Restart the Node.js app in Hostinger hPanel!');
    console.log('   hPanel → Node.js → Restart');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  client.close();
}

deploy();
