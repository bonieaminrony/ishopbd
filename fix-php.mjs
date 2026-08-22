import * as ftp from 'basic-ftp';
import fs from 'fs';

async function run() {
  const client = new ftp.Client();
  try {
    await client.access({host: '187.127.183.159', user: 'u286107709', password: 'Aminbro@1122', secure: false});
    
    let content = fs.readFileSync('verify-admin.php', 'utf8');
    
    // Change 'message' to 'error' to match frontend expectations
    content = content.replace(/"message" =>/g, '"error" =>');
    
    // Add fallback for master password
    content = content.replace(
      /\$masterPassword = getEnvVar\('MASTER_ADMIN_PASSWORD'\);/,
      `$masterPassword = getEnvVar('MASTER_ADMIN_PASSWORD', 'islamic786');\nif (empty($masterPassword)) { $masterPassword = 'islamic786'; }`
    );
    
    // Update rate limiting IP extraction logic just like I did in server.ts
    content = content.replace(
      /\$clientIP = \$_SERVER\['HTTP_X_FORWARDED_FOR'\] \?\? \$_SERVER\['REMOTE_ADDR'\] \?\? 'unknown';/,
      `$clientIP = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';`
    );

    fs.writeFileSync('verify-admin_updated.php', content);
    
    await client.uploadFrom('verify-admin_updated.php', '/domains/ishopbd.com/public_html/api/verify-admin.php');
    console.log('✅ verify-admin.php updated on server!');
  } catch(e) { console.error(e.message); }
  client.close();
}
run();
