import * as ftp from 'basic-ftp';
import fs from 'fs';

async function run() {
  const client = new ftp.Client();
  try {
    await client.access({host: '187.127.183.159', user: 'u286107709', password: 'REDACTED_PASSWORD', secure: false});
    const envContent = 'SMS_API_KEY=REDACTED_SMS_KEY\nSMS_SENDER_ID=8809648908219\nMASTER_ADMIN_PASSWORD=REDACTED_PASSWORD\n';
    fs.writeFileSync('.env.temp', envContent);
    await client.uploadFrom('.env.temp', '/domains/ishopbd.com/public_html/.env');
    console.log('✅ .env uploaded to public_html');
    
    // Also upload to domain root just in case
    await client.uploadFrom('.env.temp', '/domains/ishopbd.com/.env');
    console.log('✅ .env uploaded to domain root');
    
    fs.unlinkSync('.env.temp');
  } catch(e) { console.error(e.message); }
  client.close();
}
run();
