import type { Express } from 'express';
import fs from 'fs';
import axios from 'axios';

async function getFCMToken(serviceAccountPath?: string): Promise<{ access_token: string; project_id: string }> {
  let keyData: any = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      keyData = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (_e) {}
  }
  if (!keyData && serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    try {
      keyData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } catch (_e) {}
  }
  if (!keyData && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    keyData = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'i-shop-bd',
    };
  }
  if (!keyData) {
    throw new Error('Service account credentials not configured');
  }

  const { JWT } = await import('google-auth-library');
  const client = new JWT({
    email: keyData.client_email,
    key: keyData.private_key ? keyData.private_key.replace(/\\n/g, '\n') : undefined,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    keyId: keyData.private_key_id,
  });
  const tokenRes = await client.getAccessToken();
  if (!tokenRes.token) {
    throw new Error('Failed to retrieve access token from Google');
  }
  return {
    access_token: tokenRes.token,
    project_id: keyData.project_id || 'i-shop-bd',
  };
}

export function registerPushRoutes(
  app: Express,
  secureServiceAccountPaths: string[],
  verifyIsAdmin?: (req: any) => Promise<boolean>
): void {
  app.get('/api/send-push', async (req, res) => {
    if (verifyIsAdmin) {
      const isAuth = await verifyIsAdmin(req);
      if (!isAuth) {
        return res.status(401).json({ status: 'unauthorized', error: 'Admin access required' });
      }
    }
    const fcmServiceAccountPath = secureServiceAccountPaths.find((p) => fs.existsSync(p)) || '';
    try {
      const authData = await getFCMToken(fcmServiceAccountPath);
      return res.json({
        status: 'ok',
        message: 'Firebase Cloud Messaging OAuth2 authentication is working properly.',
        project_id: authData.project_id,
      });
    } catch (err: any) {
      return res.json({
        status: 'warning',
        message: 'FCM authentication error: ' + (err.message || String(err)),
        details: err?.response?.data || err?.message,
      });
    }
  });

  app.post('/api/send-push', async (req, res) => {
    if (verifyIsAdmin) {
      const isAuth = await verifyIsAdmin(req);
      if (!isAuth) {
        return res.status(401).json({ error: 'Unauthorized: Admin access required' });
      }
    }
    const { token, title = 'i SHOP BD Notification', body, link = '/', icon = '/logo.png' } = req.body;
    if (!token || !body) {
      return res.status(400).json({ error: 'Missing token or body' });
    }

    const fcmServiceAccountPath = secureServiceAccountPaths.find((p) => fs.existsSync(p)) || '';
    try {
      const authData = await getFCMToken(fcmServiceAccountPath);
      const fcmUrl = `https://fcm.googleapis.com/v1/projects/${authData.project_id}/messages:send`;
      const notification = {
        message: {
          token,
          notification: { title, body },
          webpush: {
            fcm_options: { link },
            notification: { icon, badge: '/logo.png' },
          },
        },
      };
      const response = await axios.post(fcmUrl, notification, {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error('FCM Send Error:', error?.response?.data || error.message);
      res.status(502).json({
        error: 'Failed to send push notification',
        details: error?.response?.data || error.message,
      });
    }
  });
}
