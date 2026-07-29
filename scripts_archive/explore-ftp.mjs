import * as ftp from 'basic-ftp';

const FTP_CONFIG = {
  host: '187.127.183.159',
  port: 21,
  user: 'u286107709',
  password: 'n3GuM$aUuHKB9@X',
  secure: false
};

async function explore() {
  const client = new ftp.Client();

  try {
    await client.access(FTP_CONFIG);
    console.log('✅ Connected!\n');

    // List ishopbd.com folder
    console.log('=== /domains/ishopbd.com ===');
    const ishop = await client.list('/domains/ishopbd.com');
    ishop.forEach(f => console.log(`${f.type === 2 ? '📁' : '📄'} ${f.name} ${f.size ? '('+f.size+' bytes)' : ''}`));

    // List public_html
    console.log('\n=== /domains/ishopbd.com/public_html ===');
    const pub = await client.list('/domains/ishopbd.com/public_html');
    pub.forEach(f => console.log(`${f.type === 2 ? '📁' : '📄'} ${f.name} ${f.size ? '('+f.size+' bytes)' : ''}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  client.close();
}

explore();
