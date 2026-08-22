const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testPush() {
  const keyData = JSON.parse(fs.readFileSync('api/service-account.json', 'utf8'));
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: keyData.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: keyData.token_uri,
    exp: now + 3600,
    iat: now
  };
  const token = jwt.sign(claim, keyData.private_key, { algorithm: 'RS256', header });
  try {
    const res = await axios.post(keyData.token_uri, new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
    const access_token = res.data.access_token;
    console.log('Access token acquired successfully.');
    
    // Now try to send a message
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${keyData.project_id}/messages:send`;
    const notification = {
      message: {
        token: 'fake-token-for-testing',
        notification: { title: 'Test', body: 'Test' }
      }
    };
    try {
      await axios.post(fcmUrl, notification, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch(e) {
      if (e.response && e.response.status === 400 && e.response.data.error.message.includes('token')) {
        console.log('Push API is working, rejected fake token as expected.');
      } else if (e.response && e.response.status === 404) {
        console.log('Push API is working, token not found (404) as expected.');
      } else {
         console.log('Push API error:', e.response ? e.response.data : e.message);
      }
    }
  } catch(e) {
    console.log('Auth error:', e.response ? e.response.data : e.message);
  }
}
testPush();
