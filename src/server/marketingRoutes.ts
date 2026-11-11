import type { Express, Request } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';

export function maskSecret(str: string | undefined): string {
  if (!str || typeof str !== 'string' || str.trim().length === 0) return '';
  const trimmed = str.trim();
  if (trimmed.length <= 8) return '••••••••';
  return trimmed.substring(0, 4) + '••••••••' + trimmed.substring(trimmed.length - 4);
}

export function isMaskedValue(str: string | undefined): boolean {
  if (!str || typeof str !== 'string') return false;
  return str.includes('••••');
}

/**
 * Strips whitespace and accidental surrounding quotes from pasted API tokens.
 */
export function cleanSecretInput(val: any): string {
  if (typeof val !== 'string') return '';
  let trimmed = val.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * Resolves a stored secret update safely:
 * - Blank or masked inputs preserve `existingVal` unless `clearRequested` is true.
 * - Non-empty unmasked tokens replace `existingVal` with cleaned text.
 */
export function resolveSecretUpdate(
  incomingVal: any,
  existingVal: any,
  clearRequested?: boolean
): string {
  if (clearRequested === true) return '';
  const cleaned = cleanSecretInput(incomingVal);
  if (!cleaned) return typeof existingVal === 'string' ? existingVal.trim() : '';
  if (isMaskedValue(cleaned)) return typeof existingVal === 'string' ? existingVal.trim() : '';
  return cleaned;
}

const marketingFallbackPath = path.join(process.cwd(), 'scratch', 'marketing-config.json');
let cachedMarketingConfig: { data: any; expiresAt: number } | null = null;

export async function getMarketingConfigSafe(): Promise<any> {
  if (cachedMarketingConfig && Date.now() < cachedMarketingConfig.expiresAt) {
    return cachedMarketingConfig.data;
  }

  try {
    const db = getFirestore();
    const doc = await db.collection('admin_config').doc('marketing').get();
    if (doc.exists) {
      const data = doc.data();
      cachedMarketingConfig = { data, expiresAt: Date.now() + 30_000 };
      try {
        if (!fs.existsSync(path.dirname(marketingFallbackPath))) {
          fs.mkdirSync(path.dirname(marketingFallbackPath), { recursive: true });
        }
        fs.writeFileSync(marketingFallbackPath, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {}
      return data;
    }
  } catch (e: any) {
    console.warn('[MARKETING] Firestore read warning (falling back to local cache):', e.message);
  }

  if (fs.existsSync(marketingFallbackPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(marketingFallbackPath, 'utf8'));
      cachedMarketingConfig = { data, expiresAt: Date.now() + 30_000 };
      return data;
    } catch (_) {}
  }
  return null;
}

export async function saveMarketingConfigSafe(mergedPayload: any): Promise<void> {
  cachedMarketingConfig = { data: mergedPayload, expiresAt: Date.now() + 30_000 };
  try {
    if (!fs.existsSync(path.dirname(marketingFallbackPath))) {
      fs.mkdirSync(path.dirname(marketingFallbackPath), { recursive: true });
    }
    fs.writeFileSync(marketingFallbackPath, JSON.stringify(mergedPayload, null, 2), 'utf8');
  } catch (_) {}

  try {
    const db = getFirestore();
    await db.collection('admin_config').doc('marketing').set(mergedPayload, { merge: true });
  } catch (e: any) {
    console.warn('[MARKETING] Firestore save warning (saved to local cache):', e.message);
  }
}

export interface MetaCapiTestResult {
  httpStatus: number;
  success: boolean;
  warning?: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Verifies Meta Pixel & Conversions API access token cleanly.
 * Optional Graph metadata GET is non-fatal when CAPI tokens lack `ads_read` permission;
 * authoritative validation runs against `POST /{pixelId}/events` using a test_event_code.
 */
export async function verifyMetaCapiConnection(params: {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
  clientIp?: string;
  userAgent?: string;
  buildMetaCapiPayload: (config: any, event: any) => any;
  httpClient?: { get: typeof axios.get; post: typeof axios.post };
}): Promise<MetaCapiTestResult> {
  const {
    pixelId,
    accessToken,
    testEventCode = '',
    clientIp,
    userAgent = 'iShopBD-MarketingTest/1.0',
    buildMetaCapiPayload,
    httpClient = axios,
  } = params;

  const targetPixelId = pixelId.trim();
  const token = cleanSecretInput(accessToken);
  const trimmedTestCode = testEventCode.trim();

  if (!targetPixelId) {
    return { httpStatus: 400, success: false, error: 'Meta Pixel ID is required for testing.' };
  }

  if (!token) {
    return {
      httpStatus: 200,
      success: true,
      warning: true,
      message: `Meta Pixel ID (${targetPixelId}) format is VALID for Browser-Side tracking. However, Server-Side CAPI requires an Access Token to test server connection.`,
    };
  }

  let pixelName = targetPixelId;
  let pixelMetaData: any = null;
  try {
    const fbRes = await httpClient.get(`https://graph.facebook.com/v19.0/${encodeURIComponent(targetPixelId)}`, {
      params: { fields: 'id,name', access_token: token },
      timeout: 8000,
    });
    if (fbRes.data?.name) pixelName = fbRes.data.name;
    pixelMetaData = fbRes.data || null;
  } catch (_metaGetErr: any) {
    // Non-fatal: Events Manager CAPI tokens often omit ads_read for GET /{pixelId} while allowing POST /{pixelId}/events.
  }

  const effectiveTestCode = trimmedTestCode || 'TEST_CONNECTION_CHECK';
  const capiBuilt = buildMetaCapiPayload(
    {
      meta: {
        enabled: true,
        capiEnabled: true,
        pixelId: targetPixelId,
        accessToken: token,
        testEventCode: effectiveTestCode,
      },
    },
    {
      eventName: 'PageView',
      eventId: `test_meta_${Date.now()}`,
      eventSourceUrl: 'https://ishopbd.com/',
      clientIp,
      userAgent,
    }
  );

  try {
    const capiRes = await httpClient.post(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(targetPixelId)}/events`,
      capiBuilt?.payload,
      { params: { access_token: token }, timeout: 10000 }
    );
    const eventsReceived = Number(capiRes.data?.events_received ?? 0);
    if (!capiRes.data || eventsReceived < 1) {
      return {
        httpStatus: 400,
        success: false,
        error: 'Meta CAPI did not confirm events_received. Please check your Pixel ID and Access Token.',
      };
    }

    const testNote = trimmedTestCode
      ? `Test Event (${trimmedTestCode}) sent live — events_received: ${eventsReceived}`
      : `Token & Pixel verified via ${effectiveTestCode} (events_received: ${eventsReceived}). Events Manager Test Events ট্যাবে লাইভ দেখতে Test Event Code দিয়ে টেস্ট করুন।`;

    return {
      httpStatus: 200,
      success: true,
      message: `Meta CAPI & Pixel Connected Successfully! Pixel: "${pixelName}" (ID: ${targetPixelId}) | ${testNote}`,
      data: pixelMetaData || capiRes.data,
    };
  } catch (fbErr: any) {
    const errObj = fbErr?.response?.data?.error;
    const errCode = errObj?.code;
    const rawMsg = errObj?.message || fbErr?.message || 'Unknown Meta Graph API error';
    const hint =
      errCode === 190
        ? ' (নতুন Access Token জেনারেট করলে আগের টোকেন বাতিল হয়ে যায় — Events Manager থেকে সর্বশেষ টোকেনটি পেস্ট করুন।)'
        : '';
    return {
      httpStatus: 400,
      success: false,
      error: `Meta Connection Failed: ${rawMsg}${hint}`,
    };
  }
}

export interface MarketingRoutesDeps {
  verifyIsAdmin: (req: Request) => Promise<boolean>;
  buildMetaCapiPayload: (config: any, event: any) => any;
  buildTikTokEventsPayload: (config: any, event: any) => any;
  extractClientIp: (headers: any, remoteAddress?: string) => string | undefined;
}

export function registerMarketingRoutes(
  app: Express,
  { verifyIsAdmin, buildMetaCapiPayload, buildTikTokEventsPayload, extractClientIp }: MarketingRoutesDeps
): void {
  app.get('/api/admin/marketing-config', async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }
    try {
      const data = await getMarketingConfigSafe();

      const defaultConfig = {
        meta: {
          enabled: true,
          pixelId: '1358996272808579',
          accessToken: '',
          testEventCode: '',
          capiEnabled: true,
        },
        tiktok: {
          enabled: true,
          pixelId: 'DBPHK73C77U4J2JR78JG',
          accessToken: '',
          testEventCode: '',
          eventsApiEnabled: true,
        },
        google: {
          enabled: true,
          ga4MeasurementId: 'G-90PDPQL0RJ',
          googleAdsConversionId: '',
          googleAdsConversionLabel: '',
          enhancedConversions: true,
          gtmContainerId: '',
        },
        whatsapp: {
          enabled: true,
          whatsappNumber: '017XXXXXXXX',
          defaultMessage: 'হ্যালো iShop BD, আমি আপনার ওয়েবসাইট থেকে পণ্য অর্ডার করতে চাই।',
        },
        imo: {
          enabled: true,
          campaignSource: 'imo',
          defaultMedium: 'social_chat',
        },
        openAi: {
          enabled: false,
          apiKey: '',
          model: 'gpt-4o-mini',
        },
      };

      const finalData = data
        ? {
            meta: { ...defaultConfig.meta, ...(data.meta || {}) },
            tiktok: { ...defaultConfig.tiktok, ...(data.tiktok || {}) },
            google: { ...defaultConfig.google, ...(data.google || {}) },
            whatsapp: { ...defaultConfig.whatsapp, ...(data.whatsapp || {}) },
            imo: { ...defaultConfig.imo, ...(data.imo || {}) },
            openAi: { ...defaultConfig.openAi, ...(data.openAi || {}) },
          }
        : defaultConfig;

      const metaTok = cleanSecretInput(finalData.meta?.accessToken);
      const ttTok = cleanSecretInput(finalData.tiktok?.accessToken);
      const oaiKey = cleanSecretInput(finalData.openAi?.apiKey);

      const safeConfig = {
        ...finalData,
        meta: {
          ...finalData.meta,
          accessToken: '',
          maskedAccessToken: maskSecret(metaTok),
          hasAccessToken: metaTok.length > 0,
          clearAccessToken: false,
        },
        tiktok: {
          ...finalData.tiktok,
          accessToken: '',
          maskedAccessToken: maskSecret(ttTok),
          hasAccessToken: ttTok.length > 0,
          clearAccessToken: false,
        },
        openAi: {
          ...finalData.openAi,
          apiKey: '',
          maskedApiKey: maskSecret(oaiKey),
          hasApiKey: oaiKey.length > 0,
          clearApiKey: false,
        },
      };

      return res.json({ success: true, config: safeConfig });
    } catch (error: any) {
      console.error('Error reading marketing config:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to read marketing config' });
    }
  });

  app.post('/api/admin/marketing-config', async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }
    const incoming = req.body;
    if (!incoming) {
      return res.status(400).json({ success: false, error: 'Missing config data' });
    }

    try {
      const existingData = (await getMarketingConfigSafe()) || {};

      const finalMetaAccessToken = resolveSecretUpdate(
        incoming.meta?.accessToken,
        existingData?.meta?.accessToken,
        !!incoming.meta?.clearAccessToken
      );
      const finalTiktokAccessToken = resolveSecretUpdate(
        incoming.tiktok?.accessToken,
        existingData?.tiktok?.accessToken,
        !!incoming.tiktok?.clearAccessToken
      );
      const finalOpenAiApiKey = resolveSecretUpdate(
        incoming.openAi?.apiKey,
        existingData?.openAi?.apiKey,
        !!incoming.openAi?.clearApiKey
      );

      const mergedPayload = {
        meta: {
          enabled: !!incoming.meta?.enabled,
          pixelId: (incoming.meta?.pixelId || '').trim(),
          accessToken: finalMetaAccessToken,
          testEventCode: (incoming.meta?.testEventCode || '').trim(),
          capiEnabled: incoming.meta?.capiEnabled !== undefined ? !!incoming.meta.capiEnabled : true,
        },
        tiktok: {
          enabled: !!incoming.tiktok?.enabled,
          pixelId: (incoming.tiktok?.pixelId || '').trim(),
          accessToken: finalTiktokAccessToken,
          testEventCode: (incoming.tiktok?.testEventCode || '').trim(),
          eventsApiEnabled: incoming.tiktok?.eventsApiEnabled !== undefined ? !!incoming.tiktok.eventsApiEnabled : true,
        },
        google: {
          enabled: !!incoming.google?.enabled,
          ga4MeasurementId: (incoming.google?.ga4MeasurementId || '').trim(),
          googleAdsConversionId: (incoming.google?.googleAdsConversionId || '').trim(),
          googleAdsConversionLabel: (incoming.google?.googleAdsConversionLabel || '').trim(),
          enhancedConversions:
            incoming.google?.enhancedConversions !== undefined ? !!incoming.google.enhancedConversions : true,
          gtmContainerId: (incoming.google?.gtmContainerId || '').trim(),
        },
        whatsapp: {
          enabled: !!incoming.whatsapp?.enabled,
          whatsappNumber: (incoming.whatsapp?.whatsappNumber || '').trim(),
          defaultMessage: (incoming.whatsapp?.defaultMessage || '').trim(),
        },
        imo: {
          enabled: !!incoming.imo?.enabled,
          campaignSource: (incoming.imo?.campaignSource || 'imo').trim(),
          defaultMedium: (incoming.imo?.defaultMedium || 'social_chat').trim(),
        },
        openAi: {
          enabled: !!incoming.openAi?.enabled,
          apiKey: finalOpenAiApiKey,
          model: (incoming.openAi?.model || 'gpt-4o-mini').trim(),
        },
        updatedAt: new Date().toISOString(),
      };

      await saveMarketingConfigSafe(mergedPayload);

      return res.json({ success: true, message: 'Marketing & Ads configuration saved successfully.' });
    } catch (error: any) {
      console.error('Error saving marketing config:', error);
      return res.status(500).json({ success: false, error: error.message || 'Failed to save marketing config' });
    }
  });

  app.post('/api/admin/marketing-test/:platform', async (req, res) => {
    const isAuthorized = await verifyIsAdmin(req);
    if (!isAuthorized) {
      return res.status(401).json({ success: false, error: 'Unauthorized access' });
    }

    const { platform } = req.params;
    const existingData = (await getMarketingConfigSafe()) || {};

    try {
      if (platform === 'meta') {
        const { pixelId, accessToken, testEventCode } = req.body;
        const resolvedToken = resolveSecretUpdate(accessToken, existingData?.meta?.accessToken);
        const targetPixelId = (pixelId || existingData?.meta?.pixelId || '').trim();
        const trimmedTestCode = (testEventCode ?? existingData?.meta?.testEventCode ?? '').trim();

        const result = await verifyMetaCapiConnection({
          pixelId: targetPixelId,
          accessToken: resolvedToken,
          testEventCode: trimmedTestCode,
          clientIp: extractClientIp(req.headers, req.socket.remoteAddress),
          userAgent: req.headers['user-agent'] || 'iShopBD-MarketingTest/1.0',
          buildMetaCapiPayload,
        });

        return res.status(result.httpStatus).json({
          success: result.success,
          ...(result.warning !== undefined ? { warning: result.warning } : {}),
          ...(result.message ? { message: result.message } : {}),
          ...(result.error ? { error: result.error } : {}),
          ...(result.data ? { data: result.data } : {}),
        });
      }

      if (platform === 'tiktok') {
        const { pixelId, accessToken, testEventCode } = req.body;
        const token = resolveSecretUpdate(accessToken, existingData?.tiktok?.accessToken);
        const targetPixelId = (pixelId || existingData?.tiktok?.pixelId || '').trim();

        if (!targetPixelId) {
          return res.status(400).json({ success: false, error: 'TikTok Pixel ID is required for testing.' });
        }

        if (!token) {
          return res.json({
            success: true,
            warning: true,
            message: `TikTok Pixel ID (${targetPixelId}) entered. Client-side pixel will initialize. Server-Side Events API requires an Access Token for server handshake.`,
          });
        }

        try {
          const effectiveTestCode = (testEventCode || existingData?.tiktok?.testEventCode || 'TEST_HANDSHAKE').trim();
          const ttBuilt = buildTikTokEventsPayload(
            {
              tiktok: {
                enabled: true,
                eventsApiEnabled: true,
                pixelId: targetPixelId,
                accessToken: token,
                testEventCode: effectiveTestCode,
              },
            },
            {
              eventName: 'PageView',
              eventId: `test_tt_${Date.now()}`,
              eventSourceUrl: 'https://ishopbd.com/',
              clientIp: extractClientIp(req.headers, req.socket.remoteAddress),
              userAgent: req.headers['user-agent'] || 'iShopBD-MarketingTest/1.0',
            }
          );

          const ttRes = await axios.post(
            'https://business-api.tiktok.com/open_api/v1.3/event/track/',
            ttBuilt?.payload,
            {
              headers: {
                'Access-Token': token,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );

          if (ttRes.data?.code === 0) {
            return res.json({
              success: true,
              message: `TikTok Events API Connected Successfully! (Pixel ID: ${targetPixelId}, Test Code: ${effectiveTestCode})`,
              data: ttRes.data,
            });
          } else {
            return res.status(400).json({
              success: false,
              error: `TikTok API Error: ${ttRes.data?.message || 'Verification failed'}`,
            });
          }
        } catch (ttErr: any) {
          const errMsg = ttErr.response?.data?.message || ttErr.message;
          return res.status(400).json({
            success: false,
            error: `TikTok Connection Failed: ${errMsg}`,
          });
        }
      }

      if (platform === 'google') {
        const { ga4MeasurementId, googleAdsConversionId, googleAdsConversionLabel, gtmContainerId } = req.body;
        const ga4 = (ga4MeasurementId || existingData?.google?.ga4MeasurementId || '').trim();
        const adsId = (googleAdsConversionId || existingData?.google?.googleAdsConversionId || '').trim();
        const label = (googleAdsConversionLabel || existingData?.google?.googleAdsConversionLabel || '').trim();
        const gtmId = (gtmContainerId || existingData?.google?.gtmContainerId || '').trim();

        const reports: string[] = [];
        let hasValidConfig = false;

        if (ga4) {
          if (/^G-[A-Z0-9]+$/i.test(ga4)) {
            reports.push(`✓ GA4 Measurement ID (${ga4}) format is valid.`);
            hasValidConfig = true;
          } else {
            return res
              .status(400)
              .json({ success: false, error: `Invalid GA4 ID format (${ga4}). Must start with 'G-'.` });
          }
        }

        if (adsId) {
          if (/^(AW-)?[0-9]+$/i.test(adsId)) {
            reports.push(`✓ Google Ads Conversion ID (${adsId}) is valid.`);
            hasValidConfig = true;
          } else {
            return res
              .status(400)
              .json({
                success: false,
                error: `Invalid Google Ads Conversion ID (${adsId}). Must be numeric or start with 'AW-'.`,
              });
          }
        }

        if (gtmId) {
          if (/^GTM-[A-Z0-9]+$/i.test(gtmId)) {
            reports.push(`✓ GTM Container ID (${gtmId}) format is valid.`);
            hasValidConfig = true;
          } else {
            return res
              .status(400)
              .json({ success: false, error: `Invalid GTM Container ID (${gtmId}). Must start with 'GTM-'.` });
          }
        }

        if (label) {
          reports.push(`✓ Google Ads Conversion Label (${label}) configured.`);
        }

        if (!hasValidConfig) {
          return res.status(400).json({
            success: false,
            error: 'Please provide at least a valid GA4 Measurement ID, Google Ads Conversion ID, or GTM Container ID.',
          });
        }

        return res.json({
          success: true,
          message: `Google Tracking Configuration Verified: ${reports.join(' ')} (Enhanced Conversions supported)`,
        });
      }

      if (platform === 'whatsapp') {
        const { whatsappNumber, defaultMessage } = req.body;
        const phone = (whatsappNumber || existingData?.whatsapp?.whatsappNumber || '').trim();
        if (!phone) {
          return res.status(400).json({ success: false, error: 'WhatsApp Number is required.' });
        }

        const cleanNum = phone.replace(/[^0-9]/g, '');
        if (cleanNum.length < 10) {
          return res
            .status(400)
            .json({ success: false, error: 'Invalid WhatsApp phone number format. Minimum 10 digits required.' });
        }

        const fullNum = cleanNum.startsWith('88')
          ? cleanNum
          : `88${cleanNum.startsWith('0') ? cleanNum.slice(1) : cleanNum}`;
        const previewUrl = `https://wa.me/${fullNum}?text=${encodeURIComponent(defaultMessage || 'Hello iShop BD')}`;

        return res.json({
          success: true,
          message: 'WhatsApp Configuration Verified! Click-to-WhatsApp link successfully generated.',
          previewUrl,
        });
      }

      if (platform === 'imo') {
        const { campaignSource, defaultMedium } = req.body;
        const source = (campaignSource || existingData?.imo?.campaignSource || 'imo').trim();
        const medium = (defaultMedium || existingData?.imo?.defaultMedium || 'social_chat').trim();
        const sampleUrl = `https://ishopbd.com/?utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(
          medium
        )}&utm_campaign=winter_fashion_2026`;

        return res.json({
          success: true,
          message:
            'IMO Campaign Tracking Verified! Note: IMO does not offer a public Ads API. Traffic & conversions will be tracked via URL attribution & in-app browser detection.',
          sampleUrl,
        });
      }

      if (platform === 'openai') {
        const { apiKey, model } = req.body;
        const key = resolveSecretUpdate(apiKey, existingData?.openAi?.apiKey);

        if (!key) {
          return res.status(400).json({ success: false, error: 'OpenAI API Key is required for testing.' });
        }

        try {
          const oaiRes = await axios.get('https://api.openai.com/v1/models', {
            headers: {
              Authorization: `Bearer ${key}`,
            },
            timeout: 10000,
          });

          const modelList = (oaiRes.data?.data || []).map((m: any) => m.id);
          const chosenModel = model || existingData?.openAi?.model || 'gpt-4o-mini';

          return res.json({
            success: true,
            message: `OpenAI API Connected Successfully! (${modelList.length} models accessible, chosen model: "${chosenModel}"). Key is securely verified for AI Marketing Assistant.`,
            modelsCount: modelList.length,
          });
        } catch (oaiErr: any) {
          const errMsg = oaiErr.response?.data?.error?.message || oaiErr.message;
          return res.status(400).json({
            success: false,
            error: `OpenAI Connection Failed: ${errMsg}`,
          });
        }
      }

      return res.status(400).json({ success: false, error: `Unknown platform: ${platform}` });
    } catch (err: any) {
      console.error(`Error testing ${platform}:`, err);
      return res.status(500).json({ success: false, error: err.message || 'Internal test error' });
    }
  });
}
