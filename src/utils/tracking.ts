import { safeGetLocalStorage, safeSetLocalStorage } from "./helpers";

export interface PublicMarketingConfig {
  meta: {
    enabled: boolean;
    pixelId: string;
  };
  tiktok: {
    enabled: boolean;
    pixelId: string;
  };
  google: {
    enabled: boolean;
    ga4MeasurementId: string;
    googleAdsConversionId: string;
    googleAdsConversionLabel: string;
    enhancedConversions: boolean;
    gtmContainerId: string;
  };
  whatsapp: {
    enabled: boolean;
    whatsappNumber: string;
    defaultMessage: string;
  };
  imo: {
    enabled: boolean;
    campaignSource: string;
  };
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  fbc?: string;
  inAppBrowser?: string;
  landingUrl?: string;
  referrer?: string;
  capturedAt?: number;
}

export interface TrackingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
}

export interface PurchaseTrackingPayload {
  orderId: string;
  value: number;
  items: TrackingItem[];
  customerName?: string;
  customerPhone?: string;
  email?: string;
  district?: string;
  userId?: string;
}

export interface OrderTrackingSignals {
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  ttp?: string;
  ttclid?: string;
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  inAppBrowser?: string;
  eventSourceUrl?: string;
  referrer?: string;
  userAgent?: string;
}

const FALLBACK_PUBLIC_CONFIG: PublicMarketingConfig = {
  meta: {
    enabled: true,
    pixelId: "1358996272808579",
  },
  tiktok: {
    enabled: true,
    pixelId: "DBPHK73C77U4J2JR78JG",
  },
  google: {
    enabled: true,
    ga4MeasurementId: "G-90PDPQL0RJ",
    googleAdsConversionId: "",
    googleAdsConversionLabel: "",
    enhancedConversions: true,
    gtmContainerId: "",
  },
  whatsapp: {
    enabled: true,
    whatsappNumber: "",
    defaultMessage: "",
  },
  imo: {
    enabled: true,
    campaignSource: "imo",
  },
};

const ATTRIBUTION_STORAGE_KEY = "ishopbd_attribution";
const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

let activeConfig: PublicMarketingConfig | null = null;
let initPromise: Promise<PublicMarketingConfig> | null = null;
let initialPageViewFired = false;
const initializedMetaPixels = new Set<string>();
const initializedTikTokPixels = new Set<string>();
const initializedGoogleIds = new Set<string>();
const initializedGtmIds = new Set<string>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function generateEventId(prefix: string, uniqueKey?: string): string {
  if (uniqueKey && uniqueKey.trim()) {
    return `${prefix}_${uniqueKey.trim()}`;
  }
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function getCookieValue(name: string): string | undefined {
  if (!isBrowser() || !document.cookie) return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function normalizeBdPhoneToE164(phone?: string): string {
  if (!phone) return "";
  const bn: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  const digits = phone
    .replace(/[০-৯]/g, (m) => bn[m] || m)
    .replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) return `+88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) return `+880${digits}`;
  if (digits.length >= 10) return `+${digits}`;
  return "";
}

export function detectInAppBrowser(ua = isBrowser() ? navigator.userAgent : ""): string | undefined {
  if (!ua) return undefined;
  if (/imo/i.test(ua)) return "imo";
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return "facebook";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/BytedanceWebview|musical_ly|TikTok/i.test(ua)) return "tiktok";
  if (/WhatsApp/i.test(ua)) return "whatsapp";
  return undefined;
}

export function captureAttribution(): AttributionData {
  if (!isBrowser()) return {};
  const existing = getStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  const inAppBrowser = detectInAppBrowser();

  const keys: (keyof AttributionData)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "ttclid",
    "gclid",
  ];

  let hasNewParams = false;
  const fresh: AttributionData = { ...existing };

  for (const k of keys) {
    const val = params.get(k);
    if (val && val.trim()) {
      (fresh as any)[k] = val.trim();
      hasNewParams = true;
    }
  }

  if (fresh.fbclid && !fresh.fbc) {
    fresh.fbc = getCookieValue("_fbc") || `fb.1.${Date.now()}.${fresh.fbclid}`;
  }
  if (inAppBrowser) {
    fresh.inAppBrowser = inAppBrowser;
    if (!fresh.utm_source && inAppBrowser === "imo") {
      fresh.utm_source = "imo";
      fresh.utm_medium = fresh.utm_medium || "in_app_browser";
      hasNewParams = true;
    }
  }

  if (hasNewParams || !existing.capturedAt) {
    fresh.landingUrl = fresh.landingUrl || window.location.href;
    fresh.referrer = fresh.referrer || document.referrer || undefined;
    fresh.capturedAt = Date.now();
    safeSetLocalStorage(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fresh));
    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }

  return fresh;
}

export function getStoredAttribution(): AttributionData {
  if (!isBrowser()) return {};
  try {
    const raw =
      sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) ||
      safeGetLocalStorage(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed: AttributionData = JSON.parse(raw);
    if (parsed.capturedAt && Date.now() - parsed.capturedAt > ATTRIBUTION_TTL_MS) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function normalizeGoogleAdsId(rawId?: string): string {
  const id = (rawId || "").trim();
  if (!id) return "";
  return /^AW-/i.test(id) ? id.toUpperCase() : `AW-${id}`;
}

function injectExternalScript(src: string, id: string): void {
  if (!isBrowser() || document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function ensureMetaPixelInitialized(pixelId: string): void {
  if (!isBrowser() || !pixelId) return;
  const w = window as any;
  if (!w.fbq) {
    const n: any = function (...args: any[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    w.fbq = n;
    injectExternalScript("https://connect.facebook.net/en_US/fbevents.js", "ishopbd-meta-pixel-js");
  }

  if (!initializedMetaPixels.has(pixelId)) {
    w.fbq("init", pixelId);
    initializedMetaPixels.add(pixelId);
  }
}

function ensureTikTokPixelInitialized(pixelId: string): void {
  if (!isBrowser() || !pixelId) return;
  const w = window as any;
  if (!w.ttq) {
    w.TiktokAnalyticsObject = "ttq";
    const ttq: any = (w.ttq = w.ttq || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    ttq.setAndDefer = function (t: any, e: string) {
      t[e] = function (...args: any[]) {
        t.push([e, ...args]);
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function (t: string) {
      const e = ttq._i[t] || [];
      for (let n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(e, ttq.methods[n]);
      }
      return e;
    };
    ttq.load = function (e: string, n?: any) {
      const r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      injectExternalScript(`${r}?sdkid=${encodeURIComponent(e)}&lib=ttq`, `ishopbd-tt-pixel-${e}`);
    };
  }

  if (!initializedTikTokPixels.has(pixelId)) {
    if (!w.ttq?._i?.[pixelId]) {
      w.ttq.load(pixelId);
    }
    initializedTikTokPixels.add(pixelId);
  }
}

function ensureGoogleTrackingInitialized(google: PublicMarketingConfig["google"]): void {
  if (!isBrowser() || !google?.enabled) return;
  const w = window as any;
  const ga4Id = (google.ga4MeasurementId || "").trim();
  const adsId = normalizeGoogleAdsId(google.googleAdsConversionId);
  const gtmId = (google.gtmContainerId || "").trim();

  const primaryTagId = ga4Id || adsId;
  if (primaryTagId) {
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function () {
        w.dataLayer.push(arguments);
      };
      w.gtag("js", new Date());
    }
    injectExternalScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`,
      "ishopbd-gtag-js"
    );

    if (ga4Id && !initializedGoogleIds.has(ga4Id)) {
      w.gtag("config", ga4Id);
      initializedGoogleIds.add(ga4Id);
    }
    if (adsId && !initializedGoogleIds.has(adsId)) {
      w.gtag("config", adsId, {
        allow_enhanced_conversions: !!google.enhancedConversions,
      });
      initializedGoogleIds.add(adsId);
    }
  }

  if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId) && !initializedGtmIds.has(gtmId)) {
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectExternalScript(
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
      `ishopbd-gtm-${gtmId}`
    );
    initializedGtmIds.add(gtmId);
  }
}

function applyPublicConfig(config: PublicMarketingConfig): void {
  activeConfig = config;
  if (config.meta?.enabled && config.meta?.pixelId?.trim()) {
    ensureMetaPixelInitialized(config.meta.pixelId.trim());
  }
  if (config.tiktok?.enabled && config.tiktok?.pixelId?.trim()) {
    ensureTikTokPixelInitialized(config.tiktok.pixelId.trim());
  }
  if (config.google?.enabled) {
    ensureGoogleTrackingInitialized(config.google);
  }
}

async function fetchPublicConfig(): Promise<PublicMarketingConfig> {
  if (!isBrowser() || typeof fetch !== "function") {
    return FALLBACK_PUBLIC_CONFIG;
  }
  try {
    const res = await fetch("/api/marketing/public-config", {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.success && json?.config) {
        return json.config as PublicMarketingConfig;
      }
    }
  } catch {
    // Fallback safely to default public config
  }
  return FALLBACK_PUBLIC_CONFIG;
}

export async function initTracking(): Promise<PublicMarketingConfig> {
  if (!isBrowser()) return FALLBACK_PUBLIC_CONFIG;
  captureAttribution();

  if (!initPromise) {
    initPromise = fetchPublicConfig().then((cfg) => {
      applyPublicConfig(cfg);
      if (!initialPageViewFired) {
        initialPageViewFired = true;
        firePageView(cfg);
      }
      return cfg;
    });
  }
  return initPromise;
}

export async function refreshTrackingConfig(): Promise<PublicMarketingConfig> {
  initPromise = null;
  const cfg = await fetchPublicConfig();
  applyPublicConfig(cfg);
  return cfg;
}

export function getOrderTrackingSignals(): OrderTrackingSignals {
  if (!isBrowser()) return {};
  const attr = getStoredAttribution();
  const fbp = getCookieValue("_fbp");
  const fbc = getCookieValue("_fbc") || attr.fbc;
  const ttp = getCookieValue("_ttp");
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(attr.fbclid ? { fbclid: attr.fbclid } : {}),
    ...(ttp ? { ttp } : {}),
    ...(attr.ttclid ? { ttclid: attr.ttclid } : {}),
    ...(attr.gclid ? { gclid: attr.gclid } : {}),
    ...(attr.utm_source ? { utm_source: attr.utm_source } : {}),
    ...(attr.utm_medium ? { utm_medium: attr.utm_medium } : {}),
    ...(attr.utm_campaign ? { utm_campaign: attr.utm_campaign } : {}),
    ...(attr.inAppBrowser ? { inAppBrowser: attr.inAppBrowser } : {}),
    eventSourceUrl: window.location.href,
    ...(document.referrer || attr.referrer ? { referrer: document.referrer || attr.referrer } : {}),
    ...(navigator.userAgent ? { userAgent: navigator.userAgent } : {}),
  };
}

function getUserBrowserSignals(extra?: {
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  userId?: string;
}) {
  const attr = getStoredAttribution();
  return {
    name: extra?.name,
    phone: extra?.phone,
    email: extra?.email,
    city: extra?.city,
    userId: extra?.userId,
    fbp: getCookieValue("_fbp"),
    fbc: getCookieValue("_fbc") || attr.fbc,
    fbclid: attr.fbclid,
    ttp: getCookieValue("_ttp"),
    ttclid: attr.ttclid,
    gclid: attr.gclid,
  };
}

function sendServerTrackEvent(payload: Record<string, any>): void {
  if (!isBrowser() || typeof fetch !== "function") return;
  if (/Googlebot|AdsBot-Google|Mediapartners-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit/i.test(navigator.userAgent || "")) {
    return;
  }
  try {
    fetch("/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

function firePageView(cfg: PublicMarketingConfig): void {
  if (!isBrowser()) return;
  const eventId = generateEventId("pv");
  const w = window as any;

  if (cfg.meta?.enabled && cfg.meta?.pixelId && w.fbq) {
    w.fbq("track", "PageView", {}, { eventID: eventId });
  }
  if (cfg.tiktok?.enabled && cfg.tiktok?.pixelId && w.ttq) {
    const headPixel = String(w.__ishopbdTtqHeadPagePixel || "").trim();
    if (headPixel && headPixel === cfg.tiktok.pixelId.trim()) {
      delete w.__ishopbdTtqHeadPagePixel;
    } else {
      w.ttq.page({ event_id: eventId });
    }
  }
  if (cfg.google?.enabled && cfg.google?.gtmContainerId && Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: "page_view", page_location: window.location.href });
  }

  sendServerTrackEvent({
    eventName: "PageView",
    eventId,
    eventSourceUrl: window.location.href,
    referrer: document.referrer || undefined,
    userData: getUserBrowserSignals(),
    customData: {},
  });
}

function buildTikTokEcommerceProps(
  items: TrackingItem[],
  value: number,
  extra?: Record<string, any>
): Record<string, any> {
  const normalizedContents = items.map((i) => ({
    content_id: String(i.id),
    content_type: "product",
    content_name: i.name || "Product",
    ...(i.category ? { content_category: i.category } : {}),
    price: Number(i.price || 0),
    quantity: Math.max(1, Number(i.quantity || 1)),
  }));
  const first = normalizedContents[0];
  return {
    content_type: "product",
    ...(normalizedContents.length === 1 && first
      ? {
          content_id: first.content_id,
          content_name: first.content_name,
          price: first.price,
          quantity: first.quantity,
        }
      : {
          content_ids: normalizedContents.map((c) => c.content_id),
        }),
    contents: normalizedContents,
    value: Number(value || 0),
    currency: "BDT",
    ...(extra || {}),
  };
}

async function getReadyConfig(): Promise<PublicMarketingConfig> {
  if (activeConfig) return activeConfig;
  return initTracking();
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
}): void {
  if (!isBrowser() || !product?.id) return;
  const eventId = generateEventId("vc");
  const value = Number(product.price || 0);

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "ViewContent",
        {
          content_ids: [String(product.id)],
          content_name: product.name,
          content_type: "product",
          value,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track(
        "ViewContent",
        buildTikTokEcommerceProps(
          [{ id: product.id, name: product.name, price: value, quantity: 1, category: product.category }],
          value
        ),
        { event_id: eventId }
      );
    }
    if (cfg.google?.enabled) {
      const gaItem = {
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: value,
        quantity: 1,
      };
      if (w.gtag && cfg.google.ga4MeasurementId) {
        w.gtag("event", "view_item", {
          currency: "BDT",
          value,
          items: [gaItem],
        });
      }
      if (cfg.google.gtmContainerId && Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: "view_item",
          ecommerce: { currency: "BDT", value, items: [gaItem] },
        });
      }
    }

    sendServerTrackEvent({
      eventName: "ViewContent",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: {
        value,
        currency: "BDT",
        contentIds: [String(product.id)],
        numItems: 1,
        contents: [{ id: String(product.id), name: product.name, quantity: 1, price: value }],
      },
    });
  });
}

export function trackAddToCart(item: TrackingItem): void {
  if (!isBrowser() || !item?.id) return;
  const eventId = generateEventId("atc");
  const qty = Math.max(1, Number(item.quantity || 1));
  const unitPrice = Number(item.price || 0);
  const value = unitPrice * qty;

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "AddToCart",
        {
          content_ids: [String(item.id)],
          content_name: item.name,
          content_type: "product",
          contents: [{ id: String(item.id), quantity: qty, item_price: unitPrice }],
          num_items: qty,
          value,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track(
        "AddToCart",
        buildTikTokEcommerceProps(
          [{ id: item.id, name: item.name, price: unitPrice, quantity: qty, category: item.category }],
          value
        ),
        { event_id: eventId }
      );
    }
    if (cfg.google?.enabled) {
      const gaItem = {
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category,
        price: unitPrice,
        quantity: qty,
      };
      if (w.gtag && cfg.google.ga4MeasurementId) {
        w.gtag("event", "add_to_cart", {
          currency: "BDT",
          value,
          items: [gaItem],
        });
      }
      if (cfg.google.gtmContainerId && Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: "add_to_cart",
          ecommerce: { currency: "BDT", value, items: [gaItem] },
        });
      }
    }

    sendServerTrackEvent({
      eventName: "AddToCart",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: {
        value,
        currency: "BDT",
        contentIds: [String(item.id)],
        numItems: qty,
        contents: [{ id: String(item.id), name: item.name, quantity: qty, price: unitPrice }],
      },
    });
  });
}

export function trackInitiateCheckout(items: TrackingItem[], totalValue: number): void {
  if (!isBrowser() || !Array.isArray(items) || items.length === 0) return;
  const eventId = generateEventId("ic");
  const value = Number(totalValue || 0);
  const contentIds = items.map((i) => String(i.id));
  const numItems = items.reduce((sum, i) => sum + Math.max(1, Number(i.quantity || 1)), 0);

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "InitiateCheckout",
        {
          content_ids: contentIds,
          content_type: "product",
          contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity, item_price: i.price })),
          num_items: numItems,
          value,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track(
        "InitiateCheckout",
        buildTikTokEcommerceProps(items, value, { num_items: numItems }),
        { event_id: eventId }
      );
    }
    if (cfg.google?.enabled) {
      const gaItems = items.map((i) => ({
        item_id: String(i.id),
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      if (w.gtag && cfg.google.ga4MeasurementId) {
        w.gtag("event", "begin_checkout", {
          currency: "BDT",
          value,
          items: gaItems,
        });
      }
      if (cfg.google.gtmContainerId && Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: "begin_checkout",
          ecommerce: { currency: "BDT", value, items: gaItems },
        });
      }
    }

    sendServerTrackEvent({
      eventName: "InitiateCheckout",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: {
        value,
        currency: "BDT",
        contentIds,
        numItems,
        contents: items.map((i) => ({
          id: String(i.id),
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });
  });
}

export function trackPurchase(payload: PurchaseTrackingPayload): void {
  if (!isBrowser() || !payload?.orderId) return;
  const eventId = generateEventId("purchase", payload.orderId);
  const value = Number(payload.value || 0);
  const items = payload.items || [];
  const contentIds = items.map((i) => String(i.id));
  const numItems = items.reduce((sum, i) => sum + Math.max(1, Number(i.quantity || 1)), 0);
  const e164Phone = normalizeBdPhoneToE164(payload.customerPhone);

  void getReadyConfig().then((cfg) => {
    const w = window as any;

    // 1. Meta Browser Pixel Purchase (deduplicated via eventID)
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "Purchase",
        {
          value,
          currency: "BDT",
          content_ids: contentIds,
          content_type: "product",
          num_items: numItems,
          contents: items.map((i) => ({ id: String(i.id), quantity: i.quantity, item_price: i.price })),
        },
        { eventID: eventId }
      );
    }

    // 2. TikTok Browser Pixel Purchase (deduplicated via event_id)
    if (cfg.tiktok?.enabled && w.ttq) {
      if (e164Phone || payload.email) {
        w.ttq.identify({
          ...(e164Phone ? { phone_number: e164Phone } : {}),
          ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
        });
      }
      w.ttq.track(
        "Purchase",
        buildTikTokEcommerceProps(items, value, {
          order_id: payload.orderId,
          num_items: numItems,
        }),
        { event_id: eventId }
      );
    }

    // 3. Google Analytics 4, Google Ads Conversion & Enhanced Conversions
    if (cfg.google?.enabled) {
      const gaItems = items.map((i) => ({
        item_id: String(i.id),
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));

      if (w.gtag) {
        if (cfg.google.enhancedConversions && (e164Phone || payload.email || payload.customerName)) {
          w.gtag("set", "user_data", {
            ...(e164Phone ? { phone_number: e164Phone } : {}),
            ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
            address: {
              ...(payload.customerName ? { first_name: payload.customerName } : {}),
              ...(payload.district ? { city: payload.district } : {}),
              country: "BD",
            },
          });
        }

        if (cfg.google.ga4MeasurementId) {
          w.gtag("event", "purchase", {
            transaction_id: payload.orderId,
            value,
            currency: "BDT",
            items: gaItems,
          });
        }

        const adsId = normalizeGoogleAdsId(cfg.google.googleAdsConversionId);
        const adsLabel = (cfg.google.googleAdsConversionLabel || "").trim();
        if (adsId && adsLabel) {
          w.gtag("event", "conversion", {
            send_to: `${adsId}/${adsLabel}`,
            value,
            currency: "BDT",
            transaction_id: payload.orderId,
          });
        }
      }

      if (cfg.google.gtmContainerId && Array.isArray(w.dataLayer)) {
        w.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: payload.orderId,
            value,
            currency: "BDT",
            items: gaItems,
          },
        });
      }
    }

    // 4. Server-Side CAPI & TikTok Events API dispatch
    sendServerTrackEvent({
      eventName: "Purchase",
      eventId,
      eventSourceUrl: window.location.href,
      referrer: document.referrer || undefined,
      userData: getUserBrowserSignals({
        name: payload.customerName,
        phone: payload.customerPhone,
        email: payload.email,
        city: payload.district,
        userId: payload.userId,
      }),
      customData: {
        value,
        currency: "BDT",
        orderId: payload.orderId,
        contentIds,
        numItems,
        contents: items.map((i) => ({
          id: String(i.id),
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });
  });
}

/**
 * Dispatches a server-side Purchase conversion event only after an admin confirms an order,
 * preserving the customer's original checkout attribution & browser signals while omitting admin cookies/IP.
 */
export function trackConfirmedOrderPurchase(order: {
  orderId: string;
  total?: number;
  items?: any[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  district?: string;
  deliveryArea?: string;
  userId?: string;
  attribution?: AttributionData;
  trackingSignals?: OrderTrackingSignals;
}): void {
  if (!isBrowser() || !order?.orderId) return;
  const eventId = generateEventId("purchase", order.orderId);
  const value = Number(order.total || 0);
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items: TrackingItem[] = rawItems.map((i: any) => ({
    id: String(i?.product?.id || i?.id || "item"),
    name: String(i?.product?.name || i?.name || "Product"),
    price: Number(i?.price ?? i?.product?.price ?? 0),
    quantity: Math.max(1, Number(i?.quantity || 1)),
    category: i?.product?.category || i?.category,
    brand: i?.product?.brand || i?.brand,
  }));
  const contentIds = items.map((i) => i.id);
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const sig = order.trackingSignals || {};
  const attr = order.attribution || {};

  sendServerTrackEvent({
    eventName: "Purchase",
    eventId,
    omitRequestCookies: true,
    eventSourceUrl: sig.eventSourceUrl || attr.landingUrl || window.location.origin,
    referrer: sig.referrer || attr.referrer || undefined,
    userAgent: sig.userAgent,
    userData: {
      name: order.customerName,
      phone: order.customerPhone,
      email: order.customerEmail,
      city: order.district || order.deliveryArea,
      userId: order.userId,
      fbp: sig.fbp,
      fbc: sig.fbc || attr.fbc,
      fbclid: sig.fbclid || attr.fbclid,
      ttp: sig.ttp,
      ttclid: sig.ttclid || attr.ttclid,
      gclid: sig.gclid || attr.gclid,
    },
    customData: {
      value,
      currency: "BDT",
      orderId: order.orderId,
      contentIds,
      numItems,
      contents: items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    },
  });
}

export function trackSearch(searchString: string): void {
  const query = String(searchString || "").trim();
  if (!isBrowser() || query.length < 2) return;
  const eventId = generateEventId("search");

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq("track", "Search", { search_string: query }, { eventID: eventId });
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track("Search", { query, search_string: query }, { event_id: eventId });
    }
    if (cfg.google?.enabled && w.gtag && cfg.google.ga4MeasurementId) {
      w.gtag("event", "search", { search_term: query });
    }
    sendServerTrackEvent({
      eventName: "Search",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: { searchString: query },
    });
  });
}

export function trackAddToWishlist(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}): void {
  if (!isBrowser() || !product?.id) return;
  const eventId = generateEventId("wl");
  const value = Number(product.price || 0);

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "AddToWishlist",
        {
          content_ids: [String(product.id)],
          content_name: product.name,
          content_type: "product",
          value,
          currency: "BDT",
        },
        { eventID: eventId }
      );
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track(
        "AddToWishlist",
        buildTikTokEcommerceProps(
          [{ id: product.id, name: product.name, price: value, quantity: 1, category: product.category }],
          value
        ),
        { event_id: eventId }
      );
    }
    if (cfg.google?.enabled && w.gtag && cfg.google.ga4MeasurementId) {
      w.gtag("event", "add_to_wishlist", {
        currency: "BDT",
        value,
        items: [{ item_id: String(product.id), item_name: product.name, price: value, quantity: 1 }],
      });
    }
    sendServerTrackEvent({
      eventName: "AddToWishlist",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: {
        value,
        currency: "BDT",
        contentIds: [String(product.id)],
        numItems: 1,
        contents: [{ id: String(product.id), name: product.name, quantity: 1, price: value }],
      },
    });
  });
}

export function trackContact(channel: string, value?: number): void {
  if (!isBrowser()) return;
  const eventId = generateEventId("contact");

  void getReadyConfig().then((cfg) => {
    const w = window as any;
    if (cfg.meta?.enabled && w.fbq) {
      w.fbq(
        "track",
        "Contact",
        {
          ...(typeof value === "number" ? { value, currency: "BDT" } : {}),
          content_name: channel,
        },
        { eventID: eventId }
      );
    }
    if (cfg.tiktok?.enabled && w.ttq) {
      w.ttq.track(
        "Contact",
        {
          ...(typeof value === "number" ? { value, currency: "BDT" } : {}),
        },
        { event_id: eventId }
      );
    }
    if (cfg.google?.enabled && w.gtag && cfg.google.ga4MeasurementId) {
      w.gtag("event", "generate_lead", {
        currency: "BDT",
        value: typeof value === "number" ? value : 0,
        method: channel,
      });
    }

    sendServerTrackEvent({
      eventName: "Contact",
      eventId,
      eventSourceUrl: window.location.href,
      userData: getUserBrowserSignals(),
      customData: {
        ...(typeof value === "number" ? { value, currency: "BDT" } : {}),
        channel,
      },
    });
  });
}

export function resetTrackingForTests(): void {
  activeConfig = null;
  initPromise = null;
  initialPageViewFired = false;
  initializedMetaPixels.clear();
  initializedTikTokPixels.clear();
  initializedGoogleIds.clear();
  initializedGtmIds.clear();
  if (typeof window !== "undefined") {
    delete (window as any).__ishopbdTtqHeadPagePixel;
  }
}
