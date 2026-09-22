import * as ftp from 'basic-ftp';
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

async function deploySEO() {
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

    console.log('📤 Uploading sitemap.xml...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'sitemap.xml'),
      `${REMOTE_DIR}/sitemap.xml`
    );
    console.log('✅ sitemap.xml uploaded!');

    console.log('📤 Uploading Google Verification file...');
    await client.uploadFrom(
      path.join(__dirname, 'dist', 'googlea7215920fe1a9449.html'),
      `${REMOTE_DIR}/googlea7215920fe1a9449.html`
    );
    console.log('✅ Google Verification file uploaded!');

    console.log('🎉 SEO files uploaded successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  client.close();
}

deploySEO();
