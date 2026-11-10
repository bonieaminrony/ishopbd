import crypto from "crypto";
import axios from "axios";

export interface MarketingConfigData {
  meta?: {
    enabled?: boolean;
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
    capiEnabled?: boolean;
  };
  tiktok?: {
    enabled?: boolean;
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
    eventsApiEnabled?: boolean;
  };
  google?: {
    enabled?: boolean;
    ga4MeasurementId?: string;
    googleAdsConversionId?: string;
    googleAdsConversionLabel?: string;
    enhancedConversions?: boolean;
    gtmContainerId?: string;
  };
  whatsapp?: {
    enabled?: boolean;
    whatsappNumber?: string;
    defaultMessage?: string;
  };
  imo?: {
    enabled?: boolean;
    campaignSource?: string;
    defaultMedium?: string;
  };
}

export interface TrackingContentItem {
  id: string;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface TrackEventInput {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  referrer?: string;
  clientIp?: string;
  userAgent?: string;
  userData?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    userId?: string;
    fbp?: string;
    fbc?: string;
    fbclid?: string;
    ttp?: string;
    ttclid?: string;
    gclid?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    orderId?: string;
    contentIds?: string[];
    numItems?: number;
    contents?: TrackingContentItem[];
    searchString?: string;
    channel?: string;
  };
}

export interface DispatchResult {
  deduplicated?: boolean;
  meta: {
    enabled: boolean;
    sent: boolean;
    status?: number;
    eventsReceived?: number;
    error?: string;
  };
  tiktok: {
    enabled: boolean;
    sent: boolean;
    status?: number;
    error?: string;
  };
}

const BENGALI_TO_ENGLISH_DIGITS: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "Purchase",
  "Search",
  "Contact",
]);

export function isSupportedTrackingEvent(name: string): boolean {
  return ALLOWED_EVENTS.has(name);
}

/**
 * Computes lowercase SHA-256 hex digest after trimming & lowercasing.
 */
export function sha256Normalized(value: string | undefined | null): string | undefined {
  if (!value || typeof value !== "string") return undefined;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Normalizes a Bangladesh (or international) phone number into digits-only format
 * expected by Meta CAPI (e.g. "01712345678" -> "8801712345678").
 */
export function normalizePhoneDigits(phone: string | undefined | null): string {
  if (!phone || typeof phone !== "string") return "";
  const ascii = phone.replace(/[০-৯]/g, (ch) => BENGALI_TO_ENGLISH_DIGITS[ch] || ch);
  const digits = ascii.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("01") && digits.length === 11) {
    return "88" + digits;
  }
  if (digits.startsWith("1") && digits.length === 10) {
    return "880" + digits;
  }
  return digits;
}

/**
 * Normalizes phone number into E.164 format (e.g. "+8801712345678") for TikTok & Google Enhanced Conversions.
 */
export function normalizeE164Phone(phone: string | undefined | null): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length < 10) return "";
  return `+${digits}`;
}

export function splitCustomerName(fullName?: string): { firstName?: string; lastName?: string } {
  if (!fullName || typeof fullName !== "string") return {};
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return cookies;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key && val) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

export function extractClientIp(
  headers: Record<string, string | string[] | undefined>,
  remoteAddress?: string
): string | undefined {
  const raw =
    headers["cf-connecting-ip"] ||
    headers["x-forwarded-for"] ||
    headers["x-real-ip"] ||
    remoteAddress;
  const first = Array.isArray(raw) ? raw[0] : typeof raw === "string" ? raw.split(",")[0].trim() : "";
  if (!first || first === "unknown") return undefined;
  return first.replace(/^::ffff:/i, "");
}

export function resolveFbc(fbc?: string, fbclid?: string, eventTimeSec?: number): string | undefined {
  if (fbc && typeof fbc === "string" && fbc.trim().startsWith("fb.")) {
    return fbc.trim();
  }
  if (fbclid && typeof fbclid === "string" && fbclid.trim()) {
    const ts = eventTimeSec || Math.floor(Date.now() / 1000);
    return `fb.1.${ts}.${fbclid.trim()}`;
  }
  return undefined;
}

/**
 * Builds a Meta Conversions API (CAPI) v19.0 payload with hashed PII and event_id deduplication.
 */
export function buildMetaCapiPayload(
  config: MarketingConfigData,
  input: TrackEventInput
): { pixelId: string; accessToken: string; payload: Record<string, any> } | null {
  const meta = config?.meta;
  const pixelId = (meta?.pixelId || "").trim();
  const accessToken = (meta?.accessToken || "").trim();

  if (!meta?.enabled || meta?.capiEnabled === false || !pixelId || !accessToken) {
    return null;
  }

  const eventTime = Math.floor(input.eventTime || Date.now() / 1000);
  const ud = input.userData || {};
  const cd = input.customData || {};

  const phoneDigits = normalizePhoneDigits(ud.phone);
  const { firstName, lastName } = splitCustomerName(ud.name);
  const cityNormalized = ud.city ? ud.city.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]/gi, "") : "";
  const fbc = resolveFbc(ud.fbc, ud.fbclid, eventTime);

  const user_data: Record<string, any> = {};
  if (input.clientIp && input.clientIp !== "127.0.0.1" && input.clientIp !== "::1") {
    user_data.client_ip_address = input.clientIp;
  }
  if (input.userAgent) user_data.client_user_agent = input.userAgent;
  if (ud.fbp) user_data.fbp = ud.fbp;
  if (fbc) user_data.fbc = fbc;

  const emHash = sha256Normalized(ud.email);
  const phHash = phoneDigits.length >= 10 ? sha256Normalized(phoneDigits) : undefined;
  const fnHash = sha256Normalized(firstName);
  const lnHash = sha256Normalized(lastName);
  const ctHash = cityNormalized ? sha256Normalized(cityNormalized) : undefined;
  const countryHash = sha256Normalized("bd");
  const extHash = sha256Normalized(ud.userId && ud.userId !== "guest" ? ud.userId : phoneDigits || undefined);

  if (emHash) user_data.em = [emHash];
  if (phHash) user_data.ph = [phHash];
  if (fnHash) user_data.fn = [fnHash];
  if (lnHash) user_data.ln = [lnHash];
  if (ctHash) user_data.ct = [ctHash];
  if (countryHash) user_data.country = [countryHash];
  if (extHash) user_data.external_id = [extHash];

  const custom_data: Record<string, any> = {};
  if (cd.currency) custom_data.currency = cd.currency;
  else if (typeof cd.value === "number") custom_data.currency = "BDT";
  if (typeof cd.value === "number" && Number.isFinite(cd.value)) {
    custom_data.value = Number(cd.value);
  }
  if (cd.orderId) custom_data.order_id = String(cd.orderId);
  if (Array.isArray(cd.contentIds) && cd.contentIds.length > 0) {
    custom_data.content_ids = cd.contentIds.map(String);
    custom_data.content_type = "product";
  }
  if (typeof cd.numItems === "number") custom_data.num_items = cd.numItems;
  if (Array.isArray(cd.contents) && cd.contents.length > 0) {
    custom_data.contents = cd.contents.map((item) => ({
      id: String(item.id),
      quantity: Math.max(1, Number(item.quantity || 1)),
      ...(typeof item.price === "number" ? { item_price: Number(item.price) } : {}),
    }));
  }
  if (cd.searchString) custom_data.search_string = cd.searchString;

  const eventObj: Record<string, any> = {
    event_name: input.eventName,
    event_time: eventTime,
    event_id: input.eventId,
    action_source: "website",
    user_data,
  };
  if (input.eventSourceUrl) eventObj.event_source_url = input.eventSourceUrl;
  if (Object.keys(custom_data).length > 0) eventObj.custom_data = custom_data;

  const payload: Record<string, any> = {
    data: [eventObj],
  };
  const testCode = (meta.testEventCode || "").trim();
  if (testCode) {
    payload.test_event_code = testCode;
  }

  return { pixelId, accessToken, payload };
}

/**
 * Maps generic event names to TikTok Events API v1.3 standard event names.
 */
export function mapTikTokEventName(eventName: string): string {
  switch (eventName) {
    case "PageView":
      return "Pageview";
    case "Purchase":
      return "Purchase";
    default:
      return eventName;
  }
}

/**
 * Builds a TikTok Events API v1.3 payload (`/open_api/v1.3/event/track/`).
 */
export function buildTikTokEventsPayload(
  config: MarketingConfigData,
  input: TrackEventInput
): { pixelId: string; accessToken: string; payload: Record<string, any> } | null {
  const tiktok = config?.tiktok;
  const pixelId = (tiktok?.pixelId || "").trim();
  const accessToken = (tiktok?.accessToken || "").trim();

  if (!tiktok?.enabled || tiktok?.eventsApiEnabled === false || !pixelId || !accessToken) {
    return null;
  }

  const eventTime = Math.floor(input.eventTime || Date.now() / 1000);
  const ud = input.userData || {};
  const cd = input.customData || {};

  const e164Phone = normalizeE164Phone(ud.phone);
  const user: Record<string, any> = {};
  if (input.clientIp && input.clientIp !== "127.0.0.1" && input.clientIp !== "::1") {
    user.ip = input.clientIp;
  }
  if (input.userAgent) user.user_agent = input.userAgent;
  if (ud.ttp) user.ttp = ud.ttp;
  if (ud.ttclid) user.ttclid = ud.ttclid;

  const phoneHash = e164Phone ? sha256Normalized(e164Phone) : undefined;
  const emailHash = sha256Normalized(ud.email);
  const extHash = sha256Normalized(ud.userId && ud.userId !== "guest" ? ud.userId : e164Phone || undefined);

  if (phoneHash) user.phone = phoneHash;
  if (emailHash) user.email = emailHash;
  if (extHash) user.external_id = extHash;

  const properties: Record<string, any> = {};
  if (cd.currency) properties.currency = cd.currency;
  else if (typeof cd.value === "number") properties.currency = "BDT";
  if (typeof cd.value === "number" && Number.isFinite(cd.value)) {
    properties.value = Number(cd.value);
  }
  if (cd.orderId) properties.order_id = String(cd.orderId);
  if (Array.isArray(cd.contents) && cd.contents.length > 0) {
    properties.content_type = "product";
    properties.contents = cd.contents.map((item) => ({
      content_id: String(item.id),
      content_type: "product",
      ...(item.name ? { content_name: item.name } : {}),
      ...(typeof item.price === "number" ? { price: Number(item.price) } : {}),
      quantity: Math.max(1, Number(item.quantity || 1)),
    }));
  } else if (Array.isArray(cd.contentIds) && cd.contentIds.length > 0) {
    properties.content_type = "product";
    properties.contents = cd.contentIds.map((id) => ({
      content_id: String(id),
      content_type: "product",
      quantity: 1,
    }));
  }
  if (cd.searchString) properties.query = cd.searchString;

  const eventEntry: Record<string, any> = {
    event: mapTikTokEventName(input.eventName),
    event_time: eventTime,
    event_id: input.eventId,
    user,
  };
  if (input.eventSourceUrl || input.referrer) {
    eventEntry.page = {
      ...(input.eventSourceUrl ? { url: input.eventSourceUrl } : {}),
      ...(input.referrer ? { referrer: input.referrer } : {}),
    };
  }
  if (Object.keys(properties).length > 0) {
    eventEntry.properties = properties;
  }

  const payload: Record<string, any> = {
    event_source: "web",
    event_source_id: pixelId,
    data: [eventEntry],
  };

  const testCode = (tiktok.testEventCode || "").trim();
  if (testCode) {
    payload.test_event_code = testCode;
  }

  return { pixelId, accessToken, payload };
}

// Short-lived in-memory deduplication cache so retried calls with the same (eventName, eventId) don't double-send
const recentEventCache = new Map<string, number>();
const EVENT_DEDUP_TTL_MS = 5 * 60 * 1000;

export function checkAndMarkEventDispatched(eventName: string, eventId: string, nowMs = Date.now()): boolean {
  if (!eventId) return false;
  if (recentEventCache.size > 2000) {
    for (const [k, exp] of recentEventCache.entries()) {
      if (nowMs > exp) recentEventCache.delete(k);
    }
  }
  const key = `${eventName}:${eventId}`;
  const existingExp = recentEventCache.get(key);
  if (existingExp && nowMs < existingExp) {
    return true; // already dispatched recently
  }
  recentEventCache.set(key, nowMs + EVENT_DEDUP_TTL_MS);
  return false;
}

export function clearEventDedupCacheForTests(): void {
  recentEventCache.clear();
}

/**
 * Dispatches a server-side tracking event concurrently to Meta CAPI and TikTok Events API.
 */
export async function dispatchServerTrackingEvents(
  config: MarketingConfigData,
  input: TrackEventInput
): Promise<DispatchResult> {
  const result: DispatchResult = {
    meta: { enabled: !!(config?.meta?.enabled && config?.meta?.capiEnabled !== false), sent: false },
    tiktok: { enabled: !!(config?.tiktok?.enabled && config?.tiktok?.eventsApiEnabled !== false), sent: false },
  };

  if (checkAndMarkEventDispatched(input.eventName, input.eventId)) {
    result.deduplicated = true;
    return result;
  }

  const metaBuilt = buildMetaCapiPayload(config, input);
  const tiktokBuilt = buildTikTokEventsPayload(config, input);

  const tasks: Promise<void>[] = [];

  if (metaBuilt) {
    tasks.push(
      axios
        .post(`https://graph.facebook.com/v19.0/${metaBuilt.pixelId}/events`, metaBuilt.payload, {
          params: { access_token: metaBuilt.accessToken },
          headers: { "Content-Type": "application/json" },
          timeout: 8000,
        })
        .then((res) => {
          result.meta.sent = true;
          result.meta.status = res.status;
          result.meta.eventsReceived = res.data?.events_received;
        })
        .catch((err: any) => {
          result.meta.status = err.response?.status;
          result.meta.error = err.response?.data?.error?.message || err.message || "Meta CAPI request failed";
          console.warn(`[CAPI][Meta] ${input.eventName} (${input.eventId}) failed:`, result.meta.error);
        })
    );
  }

  if (tiktokBuilt) {
    tasks.push(
      axios
        .post("https://business-api.tiktok.com/open_api/v1.3/event/track/", tiktokBuilt.payload, {
          headers: {
            "Access-Token": tiktokBuilt.accessToken,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        })
        .then((res) => {
          if (res.data?.code === 0) {
            result.tiktok.sent = true;
            result.tiktok.status = res.status;
          } else {
            result.tiktok.status = res.status;
            result.tiktok.error = res.data?.message || "TikTok Events API returned non-zero code";
            console.warn(`[EventsAPI][TikTok] ${input.eventName} (${input.eventId}) failed:`, result.tiktok.error);
          }
        })
        .catch((err: any) => {
          result.tiktok.status = err.response?.status;
          result.tiktok.error = err.response?.data?.message || err.message || "TikTok Events API request failed";
          console.warn(`[EventsAPI][TikTok] ${input.eventName} (${input.eventId}) failed:`, result.tiktok.error);
        })
    );
  }

  await Promise.all(tasks);
  return result;
}
