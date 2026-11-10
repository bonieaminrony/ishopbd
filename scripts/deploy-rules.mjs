import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

async function deployFirestoreRules() {
  console.log('🚀 Synchronizing time and deploying firestore.rules to Firebase project i-shop-bd...');
  
  // 1. Fetch real-world time to avoid system clock skew
  const timeRes = await axios.head('https://www.google.com');
  const serverDate = new Date(timeRes.headers['date']);
  const now = Math.floor(serverDate.getTime() / 1000);
  console.log('🕒 Synced Time (UTC):', serverDate.toISOString());

  const serviceAccountPath = path.join(process.cwd(), 'api', 'service-account.json');
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('api/service-account.json not found!');
  }

  const keyData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // 2. Build and sign JWT
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: keyData.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
    aud: keyData.token_uri,
    exp: now + 3600,
    iat: now
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = b64(header) + '.' + b64(claim);
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign(keyData.private_key, 'base64url');
  const jwt = unsignedToken + '.' + signature;

  // 3. Exchange for OAuth2 Token
  console.log('🔑 Authenticating with Google OAuth2 using service account...');
  const tokenRes = await axios.post(keyData.token_uri, new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  const accessToken = tokenRes.data.access_token;
  console.log('✅ OAuth2 token obtained successfully.');

  // 4. Create Ruleset
  const rulesContent = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8');
  console.log(`📤 Uploading firestore.rules (${rulesContent.length} bytes)...`);
  const createRes = await axios.post('https://firebaserules.googleapis.com/v1/projects/i-shop-bd/rulesets', {
    source: {
      files: [{ name: 'firestore.rules', content: rulesContent }]
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const rulesetName = createRes.data.name;
  console.log('✅ Ruleset created:', rulesetName);

  // 5. Release Ruleset to live cloud.firestore
  console.log('🌐 Releasing ruleset to live cloud.firestore release channel...');
  const releaseRes = await axios.patch('https://firebaserules.googleapis.com/v1/projects/i-shop-bd/releases/cloud.firestore', {
    release: {
      name: 'projects/i-shop-bd/releases/cloud.firestore',
      rulesetName: rulesetName
    }
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('🎉 SUCCESS! Production Firestore Rules are LIVE on project i-shop-bd!');
  console.log('Published Release Details:', JSON.stringify(releaseRes.data, null, 2));
}

deployFirestoreRules().catch(err => {
  console.error('❌ Failed to deploy firestore rules:', err.response?.data || err.message);
  process.exit(1);
});
