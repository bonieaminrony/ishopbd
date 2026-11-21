import * as ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

const FTP_HOST = process.env.FTP_HOST || '187.127.183.159';
const FTP_PORT = Number(process.env.FTP_PORT) || 21;
const FTP_USER = process.env.FTP_USER;
const FTP_PASSWORD = process.env.FTP_PASSWORD;

async function quickDeploy() {
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
    
    await client.uploadFrom('public/.htaccess', '/domains/ishopbd.com/public_html/.htaccess');
    console.log("Uploaded .htaccess");
    
    await client.uploadFrom('public/api/courier-sync.php', '/domains/ishopbd.com/public_html/api/courier-sync.php');
    console.log("Uploaded courier-sync.php");
    
    await client.uploadFrom('public/api/sms-balance.php', '/domains/ishopbd.com/public_html/api/sms-balance.php');
    console.log("Uploaded sms-balance.php");

    await client.uploadFrom('public/api/send-sms.php', '/domains/ishopbd.com/public_html/api/send-sms.php');
    console.log("Uploaded send-sms.php");
    
    console.log("Quick deploy done!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.close();
  }
}

quickDeploy();
