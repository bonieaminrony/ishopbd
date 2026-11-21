import * as ftp from 'basic-ftp';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const FTP_HOST = process.env.FTP_HOST || '187.127.183.159';
const FTP_PORT = Number(process.env.FTP_PORT) || 21;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;

async function uploadPosUpdate() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: false
    });
    console.log("Connected to FTP!");

    await client.uploadFrom('dist/index.html', '/domains/ishopbd.com/public_html/index.html');
    console.log("Uploaded dist/index.html");

    const assetFiles = fs.readdirSync('dist/assets');
    for (const f of assetFiles) {
      if (f.startsWith('POS-') || f.startsWith('AdminPanel-') || f.startsWith('index-')) {
        await client.uploadFrom(`dist/assets/${f}`, `/domains/ishopbd.com/public_html/assets/${f}`);
        console.log(`Uploaded dist/assets/${f}`);
      }
    }

    console.log("POS SMS update deployed successfully!");
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    client.close();
  }
}

uploadPosUpdate();
