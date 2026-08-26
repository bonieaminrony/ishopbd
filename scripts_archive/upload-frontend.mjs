import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FTP_CONFIG = {
  host: '187.127.183.159',
  port: 21,
  user: 'u286107709',
  password: 'Aminbro@1122',
  secure: false
};

const REMOTE_DIR = '/domains/ishopbd.com/public_html';

async function deployFrontend() {
  const client = new ftp.Client();

  try {
    await client.access(FTP_CONFIG);
    console.log('✅ Connected to Hostinger FTP!');

    console.log('📤 Uploading index.html...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'index.html'),
      `${REMOTE_DIR}/index.html`
    );
    console.log('✅ index.html uploaded!');

    console.log('📤 Uploading server.cjs...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'server.cjs'),
      `${REMOTE_DIR}/server.cjs`
    );
    console.log('✅ server.cjs uploaded!');

    console.log('📤 Uploading server.cjs.map...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'server.cjs.map'),
      `${REMOTE_DIR}/server.cjs.map`
    );
    console.log('✅ server.cjs.map uploaded!');

    console.log('📤 Uploading assets directory...');
    await client.uploadFromDir(
      path.join(__dirname, 'dist', 'assets'),
      `${REMOTE_DIR}/assets`
    );
    console.log('✅ assets directory uploaded!');

    console.log('📤 Uploading restart.txt to restart server...');
    await client.uploadFrom(
      path.join(__dirname, 'restart.txt'),
      `${REMOTE_DIR}/tmp/restart.txt` // Usually tmp/restart.txt triggers passenger restart, or just restart.txt
    ).catch(() => {
      return client.uploadFrom(
        path.join(__dirname, 'restart.txt'),
        `${REMOTE_DIR}/restart.txt`
      );
    });
    console.log('✅ restart.txt uploaded!');

    console.log('🎉 All files uploaded successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  client.close();
}

deployFrontend();
