import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const FTP_HOST = process.env.FTP_HOST || '187.127.183.159';
const FTP_PORT = Number(process.env.FTP_PORT) || 21;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;

async function uploadFullBuild() {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  client.ftp.timeout = 120000;
  try {
    console.log("Connecting to FTP...");
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASSWORD,
      secure: false
    });
    console.log("Connected!");

    // 1. Upload index.html
    await client.uploadFrom('dist/index.html', '/domains/ishopbd.com/public_html/index.html');
    console.log("Uploaded index.html");

    // 2. Upload ALL assets in dist/assets
    const assetsDir = 'dist/assets';
    const files = fs.readdirSync(assetsDir);
    await client.ensureDir('/domains/ishopbd.com/public_html/assets');
    
    for (const file of files) {
      const localFilePath = path.join(assetsDir, file);
      const stat = fs.statSync(localFilePath);
      if (stat.isFile()) {
        const remoteFilePath = `/domains/ishopbd.com/public_html/assets/${file}`;
        process.stdout.write(`Uploading ${file} ... `);
        await client.uploadFrom(localFilePath, remoteFilePath);
        console.log("done");
      }
    }

    console.log("ALL DIST ASSETS UPLOADED SUCCESSFULLY!");
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    client.close();
  }
}

uploadFullBuild();
