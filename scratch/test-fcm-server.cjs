const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

async function getFCMToken(serviceAccountPath) {
    const keyData = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: keyData.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: keyData.token_uri,
      exp: now + 3600,
      iat: now
    };
    
    const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const base64UrlClaim = Buffer.from(JSON.stringify(claim)).toString("base64url");
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(base64UrlHeader + "." + base64UrlClaim);
    const signature = sign.sign(keyData.private_key).toString("base64url");
    const jwt = base64UrlHeader + "." + base64UrlClaim + "." + signature;
    
    try {
      const response = await axios.post(keyData.token_uri, new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt
      }).toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      return {
        access_token: response.data.access_token,
        project_id: keyData.project_id
      };
    } catch (e) {
      console.error("Auth error:", e.response ? e.response.data : e.message);
      throw e;
    }
}

getFCMToken('api/service-account.json').then(res => console.log("Success!")).catch(console.error);
