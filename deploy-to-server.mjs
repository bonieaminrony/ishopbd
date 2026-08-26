import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function deployToServer() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log('🚀 Connecting to live server rokomariponnohari.com...');
    await client.access({
      host: 'rokomariponnohari.com',
      port: 21,
      user: 'rokomari',
      password: 'CR:64nAJ0ir-i6',
      secure: false
    });
    console.log('✅ FTP Connected successfully to live server!');

    const REMOTE_DIR = '/public_html';
    await client.ensureDir(REMOTE_DIR);
    await client.cd(REMOTE_DIR);

    console.log('🧹 Uploading dist folder directly to /public_html...');
    const localDistPath = path.join(__dirname, 'dist');
    
    // Upload all files from dist to public_html
    await client.uploadFromDir(localDistPath, REMOTE_DIR);

    console.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!');
    client.close();
  } catch (err) {
    console.error('❌ Deployment error:', err);
    client.close();
    process.exit(1);
  }
}

deployToServer();
