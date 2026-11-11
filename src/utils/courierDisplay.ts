/**
 * Shared helpers for courier hub extraction, status badge formatting,
 * phone normalization, courier fraud report lookup, and defensive order rendering
 * across server sync and admin UI.
 */

export interface CourierFraudReport {
  phone?: string;
  total_parcel: number;
  total_delivered: number;
  total_cancelled: number;
  total_fraud_report: number;
  delivery_rate?: number | null;
  cancellation_rate?: number | null;
  volume_band?: string;
  volume_range?: string;
}

const BN_DIGITS_MAP: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

/**
 * Normalizes Bangladesh phone numbers (including Bengali digits, +880, 880, spaces/dashes)
 * into canonical local format (e.g. "01738364268").
 */
export function normalizeBdPhone(rawPhone?: unknown): string {
  let digits = String(rawPhone ?? '')
    .trim()
    .replace(/[০-৯]/g, (m) => BN_DIGITS_MAP[m] || m)
    .replace(/\D/g, '');
  if (digits.startsWith('8801') && digits.length === 13) digits = digits.slice(2);
  else if (digits.startsWith('1') && digits.length === 10) digits = `0${digits}`;
  return digits;
}

function getPhoneLookupCandidates(rawPhone?: unknown): string[] {
  const rawStr = typeof rawPhone === 'string' ? rawPhone.trim() : String(rawPhone ?? '').trim();
  const digits = String(rawPhone ?? '').replace(/[^0-9]/g, '');
  const normalized = normalizeBdPhone(rawPhone);
  const candidates: string[] = [];
  const push = (val: string) => {
    if (val && !candidates.includes(val)) candidates.push(val);
  };
  push(rawStr);
  push(normalized);
  push(digits);
  if (normalized.startsWith('01') && normalized.length === 11) {
    push(`88${normalized}`);
    push(`+88${normalized}`);
  }
  return candidates;
}

export function getCourierReportForPhone<T>(
  reports: Record<string, T> | undefined | null,
  rawPhone?: unknown
): T | undefined {
  if (!reports || typeof reports !== 'object') return undefined;
  for (const key of getPhoneLookupCandidates(rawPhone)) {
    if (Object.prototype.hasOwnProperty.call(reports, key) && reports[key] !== undefined) {
      return reports[key];
    }
  }
  return undefined;
}

export function isPhoneLoadingInRecord(
  loadingMap: Record<string, boolean> | undefined | null,
  rawPhone?: unknown
): boolean {
  if (!loadingMap || typeof loadingMap !== 'object') return false;
  for (const key of getPhoneLookupCandidates(rawPhone)) {
    if (loadingMap[key]) return true;
  }
  return false;
}

const BLOCKED_HUB_TERMS = new Set([
  'steadfast',
  'steadfast courier',
  'pathao',
  'pathao courier',
  'redx',
  'courier',
  'customer',
  'merchant',
  'delivery',
  'delivery rider',
  'rider',
  'pickup',
  'pending pickup',
  'booked',
  'admin',
  'system',
  'unknown',
  'n/a',
  'na',
  'none',
  'null',
  'parcel',
  'package',
  'consignment',
  'order',
  'hub',
  'sorting hub',
  'branch',
  'point',
  'center',
  'centre',
]);

const TERMINAL_STATUS_KEYS = new Set([
  'delivered',
  'partial_delivered',
  'partial_delivery',
  'delivered_approval_pending',
  'cancelled',
  'cancelled_by_customer',
  'cancelled_by_merchant',
  'cancelled_approval_pending',
  'return',
  'returned',
  'return_received',
  'delivery_failed',
  'failed',
]);

const BOOKED_STATUS_KEYS = new Set([
  'in_review',
  'pending',
  'pickup_requested',
  'created',
  'unassigned',
]);

function normalizeStatusKey(raw?: unknown): string {
  if (typeof raw !== 'string' && typeof raw !== 'number') return '';
  return String(raw).trim().toLowerCase().replace(/[\s\-]+/g, '_');
}

function cleanHubCandidate(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let text = raw
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:the\s+)/i, '')
    .replace(/[.,;:!?)\]]+$/, '')
    .trim();

  // Strip trailing status clauses such as "hub for delivery" or "hub by rider"
  text = text
    .replace(/\s+(?:for|by|with|on|via)\s+.*$/i, '')
    .replace(/[.,;:!?)\]]+$/, '')
    .trim();

  if (!text || text.length < 2 || text.length > 48) return '';
  if (BLOCKED_HUB_TERMS.has(text.toLowerCase())) return '';
  if (/^\d+$/.test(text)) return '';
  return text;
}

/**
 * Extracts a concise courier hub / location name (e.g. "Barishal Hub", "Chattogram Hub")
 * from structured API payload fields or free-text tracking messages.
 */
export function extractCourierHubName(trackingMessage?: unknown, rawPayload?: any): string {
  if (rawPayload && typeof rawPayload === 'object') {
    const logs = Array.isArray(rawPayload?.data?.logs)
      ? rawPayload.data.logs
      : Array.isArray(rawPayload?.logs)
      ? rawPayload.logs
      : [];
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

    const structuredCandidates = [
      rawPayload.current_hub,
      rawPayload.hub_name,
      rawPayload.hubName,
      rawPayload.hub,
      rawPayload.sorting_hub,
      rawPayload.current_location,
      rawPayload.destination_hub,
      rawPayload.consignment?.current_hub,
      rawPayload.consignment?.hub_name,
      rawPayload.consignment?.hub,
      rawPayload.data?.order?.current_hub,
      rawPayload.data?.order?.hub_name,
      rawPayload.data?.order?.hub,
      rawPayload.data?.current_hub,
      rawPayload.data?.hub_name,
      latestLog?.hub,
      latestLog?.hub_name,
      latestLog?.location,
    ];

    for (const candidate of structuredCandidates) {
      const cleaned = cleanHubCandidate(candidate);
      if (cleaned) return cleaned;
    }
  }

  if (typeof trackingMessage !== 'string') return '';
  const msg = trackingMessage.replace(/\s+/g, ' ').trim();
  if (!msg) return '';

  // Priority 1: Explicit labeled field ("Hub: Barishal", "Current Hub - Dhaka")
  const labeledMatch = msg.match(
    /(?:current\s+hub|sorting\s+hub|hub|branch|location)\s*[:\-]\s*([A-Za-z\u0980-\u09FF][A-Za-z0-9\u0980-\u09FF\s\-'.]{1,40})/i
  );
  if (labeledMatch?.[1]) {
    const cleaned = cleanHubCandidate(labeledMatch[1]);
    if (cleaned) return cleaned;
  }

  // Priority 2: "from X to Y" transit messages -> destination Y is the target hub
  const transferMatch = msg.match(
    /\bfrom\s+[A-Za-z0-9\u0980-\u09FF\s\-'.]{2,36}?\s+to\s+([A-Za-z\u0980-\u09FF][A-Za-z0-9\u0980-\u09FF\s\-'.]{1,38}?(?:\s+(?:Sorting\s+Hub|Hub|Branch|Point|Center|Centre|Office|Station|Warehouse))?)(?:[.,;]|$)/i
  );
  if (transferMatch?.[1]) {
    const cleaned = cleanHubCandidate(transferMatch[1]);
    if (cleaned) return cleaned;
  }

  // Priority 3: "arrived at / reached / received at / at / in <Place> Hub"
  const facilityPatterns = [
    /(?:arrived\s+at|reached|received\s+at|currently\s+at|at|in|to|from)\s+(?:the\s+)?([A-Za-z][A-Za-z0-9\s\-'.]{1,36}?\s+(?:Sorting\s+Hub|Hub|Branch|Point|Center|Centre|Office|Station|Warehouse))/i,
    /([A-Za-z][A-Za-z0-9\s\-'.]{1,32}?\s+(?:Sorting\s+Hub|Hub|Branch|Point|Center|Centre))\b/i,
    /([\u0980-\u09FF]+(?:\s+[\u0980-\u09FF]+)?\s*(?:হাব|ব্রাঞ্চ|পয়েন্ট|অফিস))/,
  ];
  for (const rx of facilityPatterns) {
    const match = msg.match(rx);
    if (match?.[1]) {
      const cleaned = cleanHubCandidate(match[1]);
      if (cleaned) return cleaned;
    }
  }

  // Priority 4: Location without "Hub" suffix after arrival/dispatch verbs (e.g. "Parcel reached Barishal")
  const cityMatch = msg.match(
    /(?:arrived\s+at|reached|received\s+at|sent\s+to|dispatched\s+to|forwarded\s+to|transferred\s+to)\s+(?:the\s+)?([A-Z][A-Za-z\-'.]{2,26}(?:\s+[A-Z][A-Za-z\-'.]{2,20})?)/
  );
  if (cityMatch?.[1]) {
    const cleaned = cleanHubCandidate(cityMatch[1]);
    if (cleaned) return cleaned;
  }

  return '';
}

export interface CourierBadgeResolution {
  badgeText: string;
  hubName: string;
  isNotBooked: boolean;
}

export function resolveCourierBadgeDisplay(params: {
  isDispatched: boolean;
  courierStatus?: unknown;
  courierStatusLabel?: unknown;
  courierStatusNormalized?: unknown;
  courierHub?: unknown;
  courierTrackingMessage?: unknown;
}): CourierBadgeResolution {
  if (!params.isDispatched) {
    return {
      badgeText: 'Not Booked',
      hubName: '',
      isNotBooked: true,
    };
  }

  const rawKey = normalizeStatusKey(params.courierStatus);
  const normCategory = normalizeStatusKey(params.courierStatusNormalized);
  const labelText =
    typeof params.courierStatusLabel === 'string' && params.courierStatusLabel.trim()
      ? params.courierStatusLabel.trim()
      : typeof params.courierStatus === 'string' && params.courierStatus.trim()
      ? params.courierStatus.replace(/_/g, ' ').trim()
      : 'Pending Pickup';

  const hubName =
    cleanHubCandidate(params.courierHub) ||
    extractCourierHubName(params.courierTrackingMessage);

  const isTerminal =
    TERMINAL_STATUS_KEYS.has(rawKey) ||
    normCategory === 'delivered' ||
    normCategory === 'returned' ||
    normCategory === 'cancelled';

  const isBooked =
    BOOKED_STATUS_KEYS.has(rawKey) ||
    normCategory === 'booked';

  if (isTerminal || isBooked) {
    return {
      badgeText: labelText,
      hubName,
      isNotBooked: false,
    };
  }

  if (hubName) {
    const isHold = rawKey === 'hold' || rawKey === 'on_hold' || normCategory === 'on_hold';
    return {
      badgeText: isHold ? `On Hold · ${hubName}` : hubName,
      hubName,
      isNotBooked: false,
    };
  }

  return {
    badgeText: labelText,
    hubName: '',
    isNotBooked: false,
  };
}

export function getOrderItemsSafe(order: any): any[] {
  return Array.isArray(order?.items) ? order.items : [];
}

export function formatSafeDateTime(value: any, locale = 'bn-BD'): string {
  if (value === null || value === undefined || value === '') return '';
  try {
    let d: Date;
    if (value instanceof Date) {
      d = value;
    } else if (typeof value === 'object' && typeof value.toDate === 'function') {
      d = value.toDate();
    } else if (typeof value === 'object' && typeof value.seconds === 'number') {
      d = new Date(value.seconds * 1000);
    } else {
      d = new Date(value);
    }
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(locale);
  } catch {
    return '';
  }
}

export interface OrderCourierRateDisplay {
  source: 'courier' | 'website';
  successText: string;
  cancelText: string;
  mobileTotalText: string;
  mobileScsText: string;
  fraudCount: number;
  hasCancelHighlight: boolean;
  isLoading: boolean;
  tooltip: string;
}

export function getOrderCourierRateDisplay(
  report: CourierFraudReport | undefined,
  websiteStats: { total: number; delivered: number; cancelled: number },
  isLoading = false
): OrderCourierRateDisplay {
  const hasCounts = Boolean(report && Number(report.total_parcel) > 0);
  const hasRates = Boolean(
    report &&
      ((report.delivery_rate !== null && report.delivery_rate !== undefined && Number.isFinite(Number(report.delivery_rate))) ||
        (report.cancellation_rate !== null && report.cancellation_rate !== undefined && Number.isFinite(Number(report.cancellation_rate))))
  );

  if (report && (hasCounts || hasRates)) {
    const fraudCount = Number(report.total_fraud_report || 0);
    const deliveryRate =
      report.delivery_rate !== null && report.delivery_rate !== undefined && Number.isFinite(Number(report.delivery_rate))
        ? Math.round(Number(report.delivery_rate))
        : hasCounts
        ? Math.round((Number(report.total_delivered || 0) / Number(report.total_parcel)) * 100)
        : null;
    const cancellationRate =
      report.cancellation_rate !== null && report.cancellation_rate !== undefined && Number.isFinite(Number(report.cancellation_rate))
        ? Math.round(Number(report.cancellation_rate))
        : hasCounts
        ? Math.round((Number(report.total_cancelled || 0) / Number(report.total_parcel)) * 100)
        : 0;

    const successText = hasCounts
      ? String(Number(report.total_delivered || 0))
      : deliveryRate !== null
      ? `${deliveryRate}%`
      : '—';
    const cancelText = hasCounts
      ? String(Number(report.total_cancelled || 0))
      : `${cancellationRate}%`;

    const mobileTotalText = hasCounts
      ? String(Number(report.total_parcel))
      : report.volume_range
      ? String(report.volume_range)
      : report.volume_band
      ? String(report.volume_band).toUpperCase()
      : 'SF';
    const mobileScsText = hasCounts ? String(Number(report.total_delivered || 0)) : successText;

    const parts: string[] = [];
    if (deliveryRate !== null) parts.push(`Steadfast: ${deliveryRate}% delivery`);
    if (hasCounts) parts.push(`${report.total_delivered}/${report.total_parcel} parcels`);
    else if (report.volume_range) parts.push(`Volume: ${report.volume_range}`);
    if (fraudCount > 0) parts.push(`Fraud Reports: ${fraudCount}`);

    return {
      source: 'courier',
      successText,
      cancelText,
      mobileTotalText,
      mobileScsText,
      fraudCount,
      hasCancelHighlight: hasCounts ? Number(report.total_cancelled || 0) > 0 : cancellationRate > 0,
      isLoading,
      tooltip: parts.join(' · ') || 'Steadfast Courier Customer History',
    };
  }

  return {
    source: 'website',
    successText: String(websiteStats.delivered || 0),
    cancelText: String(websiteStats.cancelled || 0),
    mobileTotalText: String(websiteStats.total || 1),
    mobileScsText: String(websiteStats.delivered || 0),
    fraudCount: 0,
    hasCancelHighlight: Number(websiteStats.cancelled || 0) > 0,
    isLoading,
    tooltip: isLoading ? 'Checking Steadfast courier history...' : 'Website order history (click to verify Steadfast)',
  };
}

export function parseClientCourierFraudReport(resData: any): CourierFraudReport | null {
  if (!resData || typeof resData !== 'object') return null;
  const report = resData.data?.data || resData.data || resData;
  if (!report || typeof report !== 'object') return null;

  const hasKnownShape =
    resData.success ||
    resData.status === 200 ||
    report.delivery_ratio !== undefined ||
    report.delivery_rate !== undefined ||
    report.total_parcel !== undefined ||
    report.total_parcels !== undefined;
  if (!hasKnownShape) return null;

  const total_parcel = Number(report?.total_parcel || report?.total_parcels || report?.total_parcel_count || 0) || 0;
  const total_delivered = Number(report?.total_delivered || report?.total_delivered_count || 0) || 0;
  const total_cancelled = Number(report?.total_cancelled || report?.total_cancelled_count || 0) || 0;
  const total_fraud_report =
    Number(
      report?.total_fraud_report ??
        report?.total_reports ??
        (Array.isArray(report?.total_fraud_reports) ? report.total_fraud_reports.length : 0)
    ) || 0;

  const delivery_rate =
    report?.delivery_rate !== undefined && report?.delivery_rate !== null
      ? Number(report.delivery_rate)
      : report?.delivery_ratio !== null && report?.delivery_ratio !== undefined
      ? Number(report.delivery_ratio)
      : total_parcel > 0
      ? Math.round((total_delivered / total_parcel) * 100)
      : undefined;

  const cancellation_rate =
    report?.cancellation_rate !== undefined && report?.cancellation_rate !== null
      ? Number(report.cancellation_rate)
      : report?.cancellation_ratio !== null && report?.cancellation_ratio !== undefined
      ? Number(report.cancellation_ratio)
      : report?.return_ratio !== null && report?.return_ratio !== undefined
      ? Number(report.return_ratio)
      : total_parcel > 0
      ? Math.round((total_cancelled / total_parcel) * 100)
      : undefined;

  return {
    phone: typeof report?.phone === 'string' ? report.phone : undefined,
    total_parcel,
    total_delivered,
    total_cancelled,
    total_fraud_report,
    delivery_rate: delivery_rate !== undefined && Number.isFinite(delivery_rate) ? delivery_rate : undefined,
    cancellation_rate:
      cancellation_rate !== undefined && Number.isFinite(cancellation_rate) ? cancellation_rate : undefined,
    volume_band: typeof report?.volume_band === 'string' ? report.volume_band : '',
    volume_range: typeof report?.volume_range === 'string' ? report.volume_range : '',
  };
}
