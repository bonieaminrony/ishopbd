import * as ftp from 'basic-ftp';
import fs from 'fs';

async function run() {
  const client = new ftp.Client();
  try {
    await client.access({host: '187.127.183.159', user: 'u286107709', password: 'Aminbro@1122', secure: false});
    const envContent = 'SMS_API_KEY=Xw6jZ8kP3mR2tY9qF1vN\nSMS_SENDER_ID=8809648908219\nMASTER_ADMIN_PASSWORD=islamic786\n';
    fs.writeFileSync('.env.temp', envContent);
    await client.uploadFrom('.env.temp', '/domains/ishopbd.com/public_html/.env');
    console.log('✅ .env uploaded to public_html with the second key!');
    
    // Also upload to domain root just in case
    await client.uploadFrom('.env.temp', '/domains/ishopbd.com/.env');
    
    fs.unlinkSync('.env.temp');
  } catch(e) { console.error(e.message); }
  client.close();
}
run();
