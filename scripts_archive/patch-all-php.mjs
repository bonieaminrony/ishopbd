import * as ftp from 'basic-ftp';
import fs from 'fs';

async function run() {
  const client = new ftp.Client();
  try {
    await client.access({host: '187.127.183.159', user: 'u286107709', password: 'Aminbro@1122', secure: false});
    const list = await client.list('/domains/ishopbd.com/public_html/api');
    
    for (const file of list) {
      if (file.name.endsWith('.php')) {
        const remotePath = `/domains/ishopbd.com/public_html/api/${file.name}`;
        const localPath = `temp_${file.name}`;
        
        await client.downloadTo(localPath, remotePath);
        let content = fs.readFileSync(localPath, 'utf8');
        
        const originalContent = content;
        
        // Patch IP extraction
        content = content.replace(
          /\$clientIP = \$_SERVER\['HTTP_X_FORWARDED_FOR'\] \?\? \$_SERVER\['REMOTE_ADDR'\] \?\? 'unknown';/g,
          `$clientIP = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';`
        );
        
        // Make sure it doesn't just do HTTP_X_FORWARDED_FOR... let's do a more robust regex for any IP extraction using REMOTE_ADDR
        content = content.replace(
          /\$clientIP = ([^;]+);/g,
          (match, p1) => {
            if (p1.includes('REMOTE_ADDR') && !p1.includes('HTTP_CF_CONNECTING_IP')) {
               return `$clientIP = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';`;
            }
            return match;
          }
        );
        
        if (content !== originalContent) {
          fs.writeFileSync(localPath, content);
          await client.uploadFrom(localPath, remotePath);
          console.log(`✅ Patched ${file.name}`);
        }
        
        fs.unlinkSync(localPath);
      }
    }
    
    console.log('🎉 All PHP files patched successfully!');
  } catch(e) { console.error(e.message); }
  client.close();
}
run();
