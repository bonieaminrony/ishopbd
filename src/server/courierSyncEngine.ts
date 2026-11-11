import axios from "axios";
import crypto from "crypto";
import {
  CourierFraudReport,
  extractCourierHubName,
  normalizeBdPhone,
} from "../utils/courierDisplay";

export interface CourierCredentials {
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  steadfastWebhookSecret?: string;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
  pathaoUsername?: string;
  pathaoPassword?: string;
}

export interface OrderCourierInfo {
  service: "Steadfast" | "Pathao" | "RedX" | string;
  trackingId: string;
  consignmentId: string;
}

export type NormalizedCourierCategory =
  | "booked"
  | "in_transit"
  | "on_hold"
  | "delivered"
  | "returned"
  | "cancelled"
  | "unknown";

export interface CourierTransitionEvaluation {
  shouldTransition: boolean;
  targetOrderStatus: "shipped" | "delivered" | "returned" | "cancelled" | null;
  normalizedCategory: NormalizedCourierCategory;
  label: string;
  statusProtected: boolean;
  reason: string;
}

interface StatusRule {
  category: NormalizedCourierCategory;
  label: string;
  targetOrderStatus: "shipped" | "delivered" | "returned" | "cancelled" | null;
  allowedCurrentStatuses: string[];
  reason: string;
}

const COURIER_STATUS_RULES: Record<string, StatusRule> = {
  // Steadfast & Pathao initial / booked states
  in_review: {
    category: "booked",
    label: "In Review (Booked)",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Consignment booked with courier; awaiting pickup.",
  },
  pending: {
    category: "booked",
    label: "Pending Pickup",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Consignment pending courier pickup.",
  },
  pickup_requested: {
    category: "booked",
    label: "Pickup Requested",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Courier pickup requested.",
  },
  hold: {
    category: "on_hold",
    label: "On Hold",
    targetOrderStatus: null,
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Delivery temporarily on hold by courier.",
  },
  on_hold: {
    category: "on_hold",
    label: "On Hold",
    targetOrderStatus: null,
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Delivery temporarily on hold by courier.",
  },
  picked: {
    category: "in_transit",
    label: "Picked Up",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel picked up by courier rider.",
  },
  picked_up: {
    category: "in_transit",
    label: "Picked Up",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel picked up by courier rider.",
  },
  at_sorting_hub: {
    category: "in_transit",
    label: "At Sorting Hub",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel arrived at courier sorting hub.",
  },
  in_transit: {
    category: "in_transit",
    label: "In Transit",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel is in transit to customer.",
  },
  transit: {
    category: "in_transit",
    label: "In Transit",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel is in transit to customer.",
  },
  delivery_ongoing: {
    category: "in_transit",
    label: "Out for Delivery",
    targetOrderStatus: "shipped",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Rider is out for delivery.",
  },
  delivered: {
    category: "delivered",
    label: "Delivered",
    targetOrderStatus: "delivered",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel successfully delivered to customer.",
  },
  partial_delivered: {
    category: "delivered",
    label: "Partially Delivered",
    targetOrderStatus: "delivered",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel partially delivered to customer.",
  },
  partial_delivery: {
    category: "delivered",
    label: "Partially Delivered",
    targetOrderStatus: "delivered",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Parcel partially delivered to customer.",
  },
  delivered_approval_pending: {
    category: "delivered",
    label: "Delivered (Approval Pending)",
    targetOrderStatus: "delivered",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped"],
    reason: "Courier marked parcel delivered (approval pending).",
  },
  cancelled: {
    category: "cancelled",
    label: "Cancelled",
    targetOrderStatus: "cancelled",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Courier shipment cancelled.",
  },
  cancelled_by_customer: {
    category: "cancelled",
    label: "Cancelled by Customer",
    targetOrderStatus: "cancelled",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Shipment cancelled by customer.",
  },
  cancelled_by_merchant: {
    category: "cancelled",
    label: "Cancelled by Merchant",
    targetOrderStatus: "cancelled",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Shipment cancelled by merchant.",
  },
  cancelled_approval_pending: {
    category: "cancelled",
    label: "Cancelled (Pending)",
    targetOrderStatus: "cancelled",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Courier shipment cancelled (approval pending).",
  },
  return: {
    category: "returned",
    label: "Returning",
    targetOrderStatus: "returned",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Parcel is being returned by courier.",
  },
  returned: {
    category: "returned",
    label: "Returned",
    targetOrderStatus: "returned",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Parcel returned to merchant.",
  },
  return_received: {
    category: "returned",
    label: "Return Received",
    targetOrderStatus: "returned",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Returned parcel received by merchant.",
  },
  delivery_failed: {
    category: "returned",
    label: "Delivery Failed",
    targetOrderStatus: "returned",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Courier delivery attempt failed.",
  },
  failed: {
    category: "returned",
    label: "Delivery Failed",
    targetOrderStatus: "returned",
    allowedCurrentStatuses: ["pending", "confirmed", "processing", "shipped", "delivered"],
    reason: "Courier delivery failed.",
  },
};

const TERMINAL_COURIER_STATUSES = new Set([
  "delivered",
  "partial_delivered",
  "partial_delivery",
  "returned",
  "return_received",
  "cancelled",
  "cancelled_by_customer",
  "cancelled_by_merchant",
]);

export function normalizeCourierStatusKey(rawStatus?: string | null): string {
  if (!rawStatus) return "unknown";
  return String(rawStatus).trim().toLowerCase().replace(/[\s\-]+/g, "_");
}

export function isTerminalCourierStatus(rawStatus?: string | null): boolean {
  return TERMINAL_COURIER_STATUSES.has(normalizeCourierStatusKey(rawStatus));
}

export function formatCourierStatusLabel(rawStatus?: string | null): {
  code: string;
  category: NormalizedCourierCategory;
  label: string;
} {
  const code = normalizeCourierStatusKey(rawStatus);
  const rule = COURIER_STATUS_RULES[code];
  if (rule) {
    return { code, category: rule.category, label: rule.label };
  }
  return {
    code,
    category: "unknown",
    label: rawStatus ? String(rawStatus).replace(/_/g, " ") : "Unknown",
  };
}

/**
 * Evaluates whether an i SHOP BD order's status should transition given a courier status.
 * Enforces Manual Status Protection (similar to Rivo Fashion):
 *  - Manually cancelled/returned orders are never rolled back.
 *  - Delivered orders ignore stale transit/review/hold pings.
 */
export function evaluateCourierOrderTransition(
  currentOrderStatusRaw: string | undefined | null,
  rawCourierStatus: string | undefined | null
): CourierTransitionEvaluation {
  const currentStatus = String(currentOrderStatusRaw || "pending").trim().toLowerCase();
  const norm = normalizeCourierStatusKey(rawCourierStatus);
  const rule = COURIER_STATUS_RULES[norm];

  if (!rule) {
    return {
      shouldTransition: false,
      targetOrderStatus: null,
      normalizedCategory: "unknown",
      label: rawCourierStatus ? String(rawCourierStatus) : "Unknown",
      statusProtected: false,
      reason: `Unknown courier status: ${rawCourierStatus || "empty"}`,
    };
  }

  // Protected terminal manual states
  if (currentStatus === "cancelled" || currentStatus === "returned") {
    return {
      shouldTransition: false,
      targetOrderStatus: null,
      normalizedCategory: rule.category,
      label: rule.label,
      statusProtected: true,
      reason: `Manual Status Protection: Order is already ${currentStatus}.`,
    };
  }

  // Delivered orders ignore stale in-transit / in-review / hold events
  if (currentStatus === "delivered") {
    const isPostDeliveryReturnOrCancel = rule.category === "returned" || rule.category === "cancelled";
    if (!isPostDeliveryReturnOrCancel) {
      return {
        shouldTransition: false,
        targetOrderStatus: null,
        normalizedCategory: rule.category,
        label: rule.label,
        statusProtected: true,
        reason: "Manual Status Protection: Order is already delivered; stale transit ping ignored.",
      };
    }
  }

  if (!rule.targetOrderStatus) {
    return {
      shouldTransition: false,
      targetOrderStatus: null,
      normalizedCategory: rule.category,
      label: rule.label,
      statusProtected: false,
      reason: rule.reason,
    };
  }

  if (currentStatus === rule.targetOrderStatus) {
    return {
      shouldTransition: false,
      targetOrderStatus: rule.targetOrderStatus,
      normalizedCategory: rule.category,
      label: rule.label,
      statusProtected: false,
      reason: `Order is already ${rule.targetOrderStatus}.`,
    };
  }

  if (!rule.allowedCurrentStatuses.includes(currentStatus)) {
    return {
      shouldTransition: false,
      targetOrderStatus: null,
      normalizedCategory: rule.category,
      label: rule.label,
      statusProtected: true,
      reason: `Current status "${currentStatus}" cannot transition to "${rule.targetOrderStatus}".`,
    };
  }

  return {
    shouldTransition: true,
    targetOrderStatus: rule.targetOrderStatus,
    normalizedCategory: rule.category,
    label: rule.label,
    statusProtected: false,
    reason: rule.reason,
  };
}

/**
 * Normalizes legacy & new courier fields on i SHOP BD order documents.
 */
export function extractOrderCourierInfo(order: any): OrderCourierInfo | null {
  if (!order || typeof order !== "object") return null;
  const explicitTracking = String(
    order.couriers?.trackingId ||
      order.courierTrackingId ||
      ""
  ).trim();
  const legacyTracking = String(order.trackingId || "").trim();
  const consignmentId = String(
    order.couriers?.consignmentId ||
      order.courierConsignmentId ||
      order.consignmentId ||
      ""
  ).trim();
  const isOfflineOrder = String(order.orderId || "").trim().toUpperCase().startsWith("OFFLINE-");
  const cleanLegacyTracking =
    explicitTracking || consignmentId
      ? legacyTracking
      : (isOfflineOrder || legacyTracking.startsWith("#") ? "" : legacyTracking);
  const trackingId = explicitTracking || cleanLegacyTracking;

  if (!trackingId && !consignmentId) return null;

  let service = String(
    order.couriers?.service ||
      order.courierName ||
      ""
  ).trim();

  if (!service) {
    if (order.pathaoStatus) service = "Pathao";
    else service = "Steadfast";
  }

  return {
    service,
    trackingId: trackingId || consignmentId,
    consignmentId,
  };
}

export function normalizeSteadfastPhone(rawPhone: any): string {
  return normalizeBdPhone(rawPhone);
}

export async function loadCourierCredentials(db: FirebaseFirestore.Firestore): Promise<CourierCredentials> {
  const creds: CourierCredentials = {
    steadfastApiKey: (process.env.STEADFAST_API_KEY || "").trim(),
    steadfastSecretKey: (process.env.STEADFAST_SECRET_KEY || "").trim(),
    steadfastWebhookSecret: (process.env.STEADFAST_WEBHOOK_SECRET || "").trim(),
    pathaoClientId: (process.env.PATHAO_CLIENT_ID || "").trim(),
    pathaoClientSecret: (process.env.PATHAO_CLIENT_SECRET || "").trim(),
    pathaoUsername: (process.env.PATHAO_USERNAME || "").trim(),
    pathaoPassword: (process.env.PATHAO_PASSWORD || "").trim(),
  };

  try {
    const keysDoc = await db.collection("admin_config").doc("keys").get();
    if (keysDoc.exists) {
      const data = keysDoc.data() || {};
      creds.steadfastApiKey = String(data.steadfastApiKey || creds.steadfastApiKey || "").trim();
      creds.steadfastSecretKey = String(data.steadfastSecretKey || creds.steadfastSecretKey || "").trim();
      creds.steadfastWebhookSecret = String(data.steadfastWebhookSecret || creds.steadfastWebhookSecret || "").trim();
      creds.pathaoClientId = String(data.pathaoClientId || creds.pathaoClientId || "").trim();
      creds.pathaoClientSecret = String(data.pathaoClientSecret || creds.pathaoClientSecret || "").trim();
      creds.pathaoUsername = String(data.pathaoUsername || creds.pathaoUsername || "").trim();
      creds.pathaoPassword = String(data.pathaoPassword || creds.pathaoPassword || "").trim();
    }
  } catch (err: any) {
    console.warn("[COURIER] Firestore keys read warning:", err.message);
  }

  return creds;
}

export async function fetchSteadfastLiveStatus(
  creds: CourierCredentials,
  identifiers: { consignmentId?: string; trackingId?: string; invoiceId?: string }
): Promise<{
  rawStatus: string;
  trackingMessage?: string;
  hubName?: string;
  consignmentId?: string;
  trackingId?: string;
  endpoint: string;
  rawResponse: any;
}> {
  const apiKey = (creds.steadfastApiKey || "").trim();
  const secretKey = (creds.steadfastSecretKey || "").trim();
  if (!apiKey || !secretKey) {
    throw new Error("Steadfast API Key or Secret Key is not configured.");
  }

  const headers = {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const candidates: string[] = [];
  const cid = (identifiers.consignmentId || "").trim();
  const tid = (identifiers.trackingId || "").trim();
  const inv = (identifiers.invoiceId || "").trim();

  if (cid && /^\d+$/.test(cid)) {
    candidates.push(`status_by_cid/${encodeURIComponent(cid)}`);
  }
  if (tid) {
    if (/^\d+$/.test(tid)) {
      const cidPath = `status_by_cid/${encodeURIComponent(tid)}`;
      if (!candidates.includes(cidPath)) candidates.push(cidPath);
    } else {
      candidates.push(`status_by_trackingcode/${encodeURIComponent(tid)}`);
    }
  }
  if (inv) {
    candidates.push(`status_by_invoice/${encodeURIComponent(inv)}`);
  }

  if (candidates.length === 0) {
    throw new Error("No consignment ID, tracking code, or invoice ID available for Steadfast status check.");
  }

  let lastErr: any = null;
  for (const endpoint of candidates) {
    try {
      const res = await axios.get(`https://portal.packzy.com/api/v1/${endpoint}`, {
        headers,
        timeout: 10000,
      });
      const rawStatus = res.data?.delivery_status || res.data?.status;
      if (rawStatus && typeof rawStatus === "string") {
        const trackingMessage =
          (typeof res.data?.tracking_message === "string" && res.data.tracking_message.trim()) ||
          (typeof res.data?.note === "string" && res.data.note.trim()) ||
          undefined;
        const resolvedCid = String(
          res.data?.consignment_id || res.data?.consignment?.consignment_id || ""
        ).trim() || undefined;
        const resolvedTrack = String(
          res.data?.tracking_code || res.data?.consignment?.tracking_code || ""
        ).trim() || undefined;
        const hubName = extractCourierHubName(trackingMessage, res.data) || undefined;
        return {
          rawStatus: rawStatus.trim(),
          trackingMessage,
          hubName,
          consignmentId: resolvedCid,
          trackingId: resolvedTrack,
          endpoint,
          rawResponse: res.data,
        };
      }
      lastErr = new Error(res.data?.message || "Steadfast returned no delivery_status");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        lastErr = new Error(
          "Steadfast 401 Unauthorized — এই Tracking/Invoice Steadfast প্যানেলে পাওয়া যায়নি অথবা API Key সঠিক নয়"
        );
      } else {
        lastErr = err;
      }
      // Only fall through to next identifier if 404 or not found
      if (status && status >= 500) throw err;
    }
  }

  throw lastErr || new Error("Failed to fetch Steadfast status.");
}

let cachedPathaoToken: { token: string; expiresAt: number } | null = null;

export async function fetchPathaoLiveStatus(
  creds: CourierCredentials,
  trackingId: string
): Promise<{ rawStatus: string; trackingMessage?: string; hubName?: string; consignmentId?: string; rawResponse: any }> {
  const { pathaoClientId, pathaoClientSecret, pathaoUsername, pathaoPassword } = creds;
  if (!pathaoClientId || !pathaoClientSecret || !pathaoUsername || !pathaoPassword) {
    throw new Error("Pathao credentials are not configured.");
  }

  let token = cachedPathaoToken && Date.now() < cachedPathaoToken.expiresAt ? cachedPathaoToken.token : "";
  if (!token) {
    const tokenRes = await axios.post(
      "https://api-hermes.pathao.com/aladdin/api/v1/issue-token",
      {
        client_id: pathaoClientId,
        client_secret: pathaoClientSecret,
        username: pathaoUsername,
        password: pathaoPassword,
        grant_type: "password",
      },
      {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        timeout: 12000,
      }
    );
    token = tokenRes.data?.access_token || "";
    if (!token) throw new Error("Failed to authenticate with Pathao");
    cachedPathaoToken = { token, expiresAt: Date.now() + 45 * 60 * 1000 };
  }

  const trackRes = await axios.get(
    `https://api-hermes.pathao.com/aladdin/api/v1/orders/${encodeURIComponent(trackingId)}/track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 12000,
    }
  );

  const orderObj = trackRes.data?.data?.order || trackRes.data?.data || {};
  const rawStatus =
    orderObj?.order_status ||
    orderObj?.transfer_status ||
    trackRes.data?.data?.order_status ||
    "";
  if (!rawStatus) {
    throw new Error("Pathao returned no order status");
  }
  const logs = Array.isArray(trackRes.data?.data?.logs) ? trackRes.data.data.logs : [];
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
  const trackingMessage =
    (typeof orderObj?.tracking_message === "string" && orderObj.tracking_message.trim()) ||
    (typeof orderObj?.order_status_desc === "string" && orderObj.order_status_desc.trim()) ||
    (typeof orderObj?.reason === "string" && orderObj.reason.trim()) ||
    (typeof latestLog?.message === "string" && latestLog.message.trim()) ||
    (typeof latestLog?.status === "string" && latestLog.status.trim()) ||
    undefined;
  const consignmentId =
    (typeof orderObj?.consignment_id === "string" && orderObj.consignment_id.trim()) ||
    undefined;
  const hubName = extractCourierHubName(trackingMessage, trackRes.data) || undefined;
  return {
    rawStatus: String(rawStatus).trim(),
    trackingMessage,
    hubName,
    consignmentId,
    rawResponse: trackRes.data,
  };
}

export interface CourierHistoryEntry {
  status: string;
  label: string;
  category: NormalizedCourierCategory;
  message: string;
  hub?: string;
  source: string;
  timestamp: string;
}

export interface SyncOrderResult {
  orderId: string;
  service: string;
  trackingId: string;
  rawCourierStatus: string;
  courierLabel: string;
  trackingMessage: string;
  hubName: string;
  courierHistory: CourierHistoryEntry[];
  oldOrderStatus: string;
  newOrderStatus: string;
  updated: boolean;
  statusProtected: boolean;
  reason: string;
  syncedAt: string;
}

/**
 * Appends a courier movement event without duplicating identical consecutive stages.
 */
export function appendCourierHistoryEntry(
  existingHistory: any,
  nextEntry: CourierHistoryEntry,
  maxEntries = 15
): CourierHistoryEntry[] {
  const list: CourierHistoryEntry[] = Array.isArray(existingHistory)
    ? existingHistory.filter(
        (item) => item && typeof item === "object" && typeof item.status === "string"
      )
    : [];

  const last = list[list.length - 1];
  const nextStatusNorm = normalizeCourierStatusKey(nextEntry.status);
  const lastStatusNorm = last ? normalizeCourierStatusKey(last.status) : "";
  const nextMsgNorm = String(nextEntry.message || "").trim().toLowerCase();
  const lastMsgNorm = last ? String(last.message || "").trim().toLowerCase() : "";

  if (last && lastStatusNorm === nextStatusNorm && lastMsgNorm === nextMsgNorm) {
    return list.slice(-maxEntries);
  }

  return [...list, nextEntry].slice(-maxEntries);
}

export async function applyCourierUpdateToOrderDoc(
  db: FirebaseFirestore.Firestore,
  orderRef: FirebaseFirestore.DocumentReference,
  orderData: any,
  service: string,
  rawCourierStatus: string,
  source: string,
  extraInfo?: { consignmentId?: string; trackingId?: string; trackingMessage?: string; hubName?: string }
): Promise<SyncOrderResult> {
  const oldOrderStatus = String(orderData.status || "pending").toLowerCase();
  const evalRes = evaluateCourierOrderTransition(oldOrderStatus, rawCourierStatus);
  const newOrderStatus =
    evalRes.shouldTransition && evalRes.targetOrderStatus ? evalRes.targetOrderStatus : oldOrderStatus;

  const prevCourierStatus =
    orderData.courierStatus ||
    (service.toLowerCase().includes("pathao") ? orderData.pathaoStatus : orderData.steadfastStatus) ||
    "";

  const syncedAt = new Date().toISOString();
  const isPathao = service.toLowerCase().includes("pathao");
  const detailMsg = (extraInfo?.trackingMessage || "").trim() || evalRes.reason;
  const resolvedHub =
    (extraInfo?.hubName || "").trim() ||
    extractCourierHubName(extraInfo?.trackingMessage || detailMsg) ||
    "";
  const courierHistory = appendCourierHistoryEntry(orderData.courierHistory, {
    status: rawCourierStatus,
    label: evalRes.label,
    category: evalRes.normalizedCategory,
    message: detailMsg,
    ...(resolvedHub ? { hub: resolvedHub } : {}),
    source,
    timestamp: syncedAt,
  });

  const updatePayload: Record<string, any> = {
    courierStatus: rawCourierStatus,
    courierStatusNormalized: evalRes.normalizedCategory,
    courierStatusLabel: evalRes.label,
    courierLastSyncedAt: syncedAt,
    courierSyncSource: source,
    courierStatusDetail: evalRes.reason,
    courierTrackingMessage: detailMsg,
    ...(resolvedHub ? { courierHub: resolvedHub } : {}),
    courierHistory,
  };

  if (isPathao) {
    updatePayload.pathaoStatus = rawCourierStatus;
  } else {
    updatePayload.steadfastStatus = rawCourierStatus;
  }
  if (extraInfo?.consignmentId && !orderData.courierConsignmentId) {
    updatePayload.courierConsignmentId = extraInfo.consignmentId;
  }
  if (extraInfo?.trackingId && !orderData.courierTrackingId) {
    updatePayload.courierTrackingId = extraInfo.trackingId;
  }
  if (evalRes.shouldTransition && evalRes.targetOrderStatus) {
    updatePayload.status = evalRes.targetOrderStatus;
    if (evalRes.targetOrderStatus === "cancelled" || evalRes.targetOrderStatus === "returned") {
      updatePayload.paymentMethod = "N/A";
    }
  }

  await orderRef.set(updatePayload, { merge: true });

  const orderUpdated = newOrderStatus !== oldOrderStatus;
  const courierChanged = normalizeCourierStatusKey(prevCourierStatus) !== normalizeCourierStatusKey(rawCourierStatus);

  // Send customer notification when automated sync transitions order status
  if (orderUpdated && orderData.userId && orderData.userId !== "guest") {
    try {
      const statusLabelMap: Record<string, string> = {
        shipped: "In Transit (কুরিয়ারে আছে)",
        delivered: "Delivered (ডেলিভারি সম্পন্ন)",
        returned: "Returned",
        cancelled: "Cancelled",
      };
      const statusDisplay = statusLabelMap[newOrderStatus] || newOrderStatus;
      await db.collection("notifications").doc(`order_${orderRef.id}`).set(
        {
          title: `Order ${statusDisplay} (#${orderRef.id})`,
          message: `প্রিয় ${orderData.customerName || "গ্রাহক"}, আপনার অর্ডার (#${orderRef.id}) এর কুরিয়ার স্ট্যাটাস: ${evalRes.label}।`,
          link: `order:${orderRef.id}`,
          orderId: orderRef.id,
          status: newOrderStatus,
          courierStatus: rawCourierStatus,
          userId: orderData.userId,
          userEmail: orderData.customerEmail || "",
          updatedAt: syncedAt,
          sender: "system",
          type: "direct",
        },
        { merge: true }
      );
    } catch (notifErr: any) {
      console.warn(`[COURIER_SYNC] Notification update failed for ${orderRef.id}:`, notifErr.message);
    }
  }

  return {
    orderId: orderRef.id,
    service,
    trackingId: extraInfo?.trackingId || "",
    rawCourierStatus,
    courierLabel: evalRes.label,
    trackingMessage: detailMsg,
    hubName: resolvedHub,
    courierHistory,
    oldOrderStatus,
    newOrderStatus,
    updated: orderUpdated || courierChanged,
    statusProtected: evalRes.statusProtected,
    reason: evalRes.reason,
    syncedAt,
  };
}

export async function syncSingleOrderCourierStatus(
  db: FirebaseFirestore.Firestore,
  orderId: string,
  options: { source?: string; credentials?: CourierCredentials } = {}
): Promise<SyncOrderResult> {
  const orderRef = db.collection("orders").doc(orderId);
  const snap = await orderRef.get();
  if (!snap.exists) {
    throw new Error(`Order ${orderId} not found`);
  }
  const orderData = snap.data() || {};
  let courierInfo = extractOrderCourierInfo(orderData);
  if (!courierInfo) {
    const fallbackSvc = String(orderData.courierName || orderData.couriers?.service || '').trim();
    const isManualSteadfast =
      fallbackSvc.toLowerCase().includes('steadfast') || String(orderData.status || '').toLowerCase() === 'shipped';
    if (!isManualSteadfast) {
      throw new Error(`Order ${orderId} has no courier tracking ID or consignment ID`);
    }
    courierInfo = { service: fallbackSvc || 'Steadfast', trackingId: '', consignmentId: '' };
  }

  const creds = options.credentials || (await loadCourierCredentials(db));
  const isPathao = courierInfo.service.toLowerCase().includes("pathao");
  const isSteadfast = courierInfo.service.toLowerCase().includes("steadfast");

  if (!isPathao && !isSteadfast) {
    throw new Error(`Automated status polling is currently supported for Steadfast and Pathao (got ${courierInfo.service}).`);
  }

  let rawStatus = "";
  let trackingMessage: string | undefined;
  let hubName: string | undefined;
  let resolvedConsignmentId = courierInfo.consignmentId;
  let resolvedTrackingId = courierInfo.trackingId;
  if (isPathao) {
    const res = await fetchPathaoLiveStatus(creds, courierInfo.trackingId);
    rawStatus = res.rawStatus;
    trackingMessage = res.trackingMessage;
    hubName = res.hubName;
    if (res.consignmentId && !resolvedConsignmentId) resolvedConsignmentId = res.consignmentId;
  } else {
    const res = await fetchSteadfastLiveStatus(creds, {
      consignmentId: courierInfo.consignmentId,
      trackingId: courierInfo.trackingId,
      invoiceId: orderData.orderId || orderId,
    });
    rawStatus = res.rawStatus;
    trackingMessage = res.trackingMessage;
    hubName = res.hubName;
    if (res.consignmentId && !resolvedConsignmentId) resolvedConsignmentId = res.consignmentId;
    if (res.trackingId && !resolvedTrackingId) resolvedTrackingId = res.trackingId;
  }

  return await applyCourierUpdateToOrderDoc(
    db,
    orderRef,
    orderData,
    courierInfo.service,
    rawStatus,
    options.source || "ADMIN_MANUAL_SYNC",
    {
      consignmentId: resolvedConsignmentId,
      trackingId: resolvedTrackingId,
      trackingMessage,
      hubName,
    }
  );
}

export interface BatchSyncResponse {
  success: boolean;
  message?: string;
  summary: {
    total: number;
    synced: number;
    updated: number;
    failed: number;
    skipped: number;
  };
  results: Array<SyncOrderResult | { orderId: string; status: "ERROR" | "SKIPPED"; error: string }>;
}

export async function syncAllActiveCourierOrders(
  db: FirebaseFirestore.Firestore,
  options: { force?: boolean; limit?: number; source?: string; credentials?: CourierCredentials } = {}
): Promise<BatchSyncResponse> {
  const creds = options.credentials || (await loadCourierCredentials(db));
  const hasSteadfast = !!(creds.steadfastApiKey && creds.steadfastSecretKey);
  const hasPathao = !!(creds.pathaoClientId && creds.pathaoClientSecret && creds.pathaoUsername && creds.pathaoPassword);

  if (!hasSteadfast && !hasPathao) {
    return {
      success: false,
      message: "Steadfast বা Pathao API Key কনফিগার করা নেই।",
      summary: { total: 0, synced: 0, updated: 0, failed: 0, skipped: 0 },
      results: [],
    };
  }

  const maxDocs = Math.max(1, Math.min(Number(options.limit) || 60, 200));
  const force = Boolean(options.force);

  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .limit(Math.max(maxDocs * 3, 150))
    .get();

  const targets: Array<{ ref: FirebaseFirestore.DocumentReference; data: any; courier: OrderCourierInfo }> = [];

  for (const docSnap of snapshot.docs) {
    if (targets.length >= maxDocs) break;
    const data = docSnap.data() || {};
    if (data.deleted) continue;

    const courier = extractOrderCourierInfo(data);
    if (!courier) continue;

    const svcLower = courier.service.toLowerCase();
    const isSteadfast = svcLower.includes("steadfast");
    const isPathao = svcLower.includes("pathao");
    if ((isSteadfast && !hasSteadfast) || (isPathao && !hasPathao) || (!isSteadfast && !isPathao)) {
      continue;
    }

    if (!force) {
      const orderStatus = String(data.status || "").toLowerCase();
      if (orderStatus === "cancelled" || orderStatus === "returned") continue;
      const existingCourierSt = data.courierStatus || data.steadfastStatus || data.pathaoStatus;
      if (orderStatus === "delivered" && (!existingCourierSt || isTerminalCourierStatus(existingCourierSt))) {
        continue;
      }
    }

    targets.push({ ref: docSnap.ref, data, courier });
  }

  const summary = {
    total: targets.length,
    synced: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
  };
  const results: BatchSyncResponse["results"] = [];
  const source = options.source || "COURIER_SYNC";

  // Bounded concurrency (5 requests at a time)
  const BATCH_SIZE = 5;
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const chunk = targets.slice(i, i + BATCH_SIZE);
    const settled = await Promise.all(
      chunk.map(async ({ ref, data, courier }) => {
        try {
          const isPathao = courier.service.toLowerCase().includes("pathao");
          let rawStatus = "";
          let trackingMessage: string | undefined;
          let hubName: string | undefined;
          let resolvedConsignmentId = courier.consignmentId;
          let resolvedTrackingId = courier.trackingId;
          if (isPathao) {
            const pRes = await fetchPathaoLiveStatus(creds, courier.trackingId);
            rawStatus = pRes.rawStatus;
            trackingMessage = pRes.trackingMessage;
            hubName = pRes.hubName;
            if (pRes.consignmentId && !resolvedConsignmentId) resolvedConsignmentId = pRes.consignmentId;
          } else {
            const sRes = await fetchSteadfastLiveStatus(creds, {
              consignmentId: courier.consignmentId,
              trackingId: courier.trackingId,
              invoiceId: data.orderId || ref.id,
            });
            rawStatus = sRes.rawStatus;
            trackingMessage = sRes.trackingMessage;
            hubName = sRes.hubName;
            if (sRes.consignmentId && !resolvedConsignmentId) resolvedConsignmentId = sRes.consignmentId;
            if (sRes.trackingId && !resolvedTrackingId) resolvedTrackingId = sRes.trackingId;
          }

          const res = await applyCourierUpdateToOrderDoc(db, ref, data, courier.service, rawStatus, source, {
            consignmentId: resolvedConsignmentId,
            trackingId: resolvedTrackingId,
            trackingMessage,
            hubName,
          });
          summary.synced++;
          if (res.updated) summary.updated++;
          return res;
        } catch (err: any) {
          summary.failed++;
          return {
            orderId: ref.id,
            status: "ERROR" as const,
            error: err.response?.data?.message || err.message || "Courier API sync failed",
          };
        }
      })
    );
    results.push(...settled);
  }

  return {
    success: true,
    summary,
    results,
  };
}

export function verifyWebhookToken(
  configuredSecret: string | undefined,
  headers: Record<string, string | string[] | undefined>
): boolean {
  const secret = (configuredSecret || "").trim();
  if (!secret) return false;
  const rawHeader =
    headers["x-steadfast-webhook-token"] ||
    headers["x-webhook-token"] ||
    headers["authorization"] ||
    "";
  const token = Array.isArray(rawHeader) ? rawHeader[0] : String(rawHeader);
  const cleaned = token.replace(/^Bearer\s+/i, "").trim();
  if (!cleaned) return false;
  const a = Buffer.from(cleaned);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function processSteadfastWebhook(
  db: FirebaseFirestore.Firestore,
  headers: Record<string, string | string[] | undefined>,
  body: any
): Promise<{ success: boolean; statusCode: number; message?: string; result?: SyncOrderResult }> {
  const creds = await loadCourierCredentials(db);
  if (!verifyWebhookToken(creds.steadfastWebhookSecret, headers)) {
    return { success: false, statusCode: 401, message: "Unauthorized webhook token" };
  }

  const cid = body?.consignment_id || body?.consignment?.consignment_id;
  const trackingCode = body?.tracking_code || body?.consignment?.tracking_code;
  const invoice = body?.invoice || body?.consignment?.invoice;
  const status = body?.status || body?.delivery_status || body?.consignment?.status;

  if (!cid && !trackingCode && !invoice) {
    return { success: false, statusCode: 400, message: "Missing consignment_id, tracking_code, or invoice" };
  }
  if (!status) {
    return { success: false, statusCode: 400, message: "Missing courier status" };
  }

  let matchedDoc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot | null = null;
  if (invoice) {
    const direct = await db.collection("orders").doc(String(invoice)).get();
    if (direct.exists) matchedDoc = direct;
  }
  if (!matchedDoc && trackingCode) {
    for (const field of ["courierTrackingId", "couriers.trackingId", "trackingId"]) {
      const q = await db.collection("orders").where(field, "==", String(trackingCode)).limit(1).get();
      if (!q.empty) {
        matchedDoc = q.docs[0];
        break;
      }
    }
  }
  if (!matchedDoc && cid) {
    for (const field of ["courierConsignmentId", "courierTrackingId", "couriers.consignmentId"]) {
      const q = await db.collection("orders").where(field, "==", String(cid)).limit(1).get();
      if (!q.empty) {
        matchedDoc = q.docs[0];
        break;
      }
    }
  }

  if (!matchedDoc || !matchedDoc.exists) {
    return { success: false, statusCode: 404, message: "Matching order not found" };
  }

  const trackingMessage =
    body?.tracking_message ||
    body?.message ||
    body?.consignment?.tracking_message ||
    undefined;
  const hubName = extractCourierHubName(trackingMessage, body) || undefined;

  const result = await applyCourierUpdateToOrderDoc(
    db,
    matchedDoc.ref,
    matchedDoc.data() || {},
    "Steadfast",
    String(status).trim(),
    "COURIER_WEBHOOK",
    {
      consignmentId: cid ? String(cid) : undefined,
      trackingId: trackingCode ? String(trackingCode) : undefined,
      trackingMessage: typeof trackingMessage === "string" ? trackingMessage : undefined,
      hubName,
    }
  );

  return { success: true, statusCode: 200, result };
}

let backgroundSyncTimer: NodeJS.Timeout | null = null;

export function startCourierBackgroundSync(
  getDb: () => FirebaseFirestore.Firestore,
  intervalMinutes = 10
): void {
  if (backgroundSyncTimer) clearInterval(backgroundSyncTimer);

  const runSync = async () => {
    try {
      const db = getDb();
      const res = await syncAllActiveCourierOrders(db, {
        force: false,
        limit: 50,
        source: "COURIER_BACKGROUND_SYNC",
      });
      if (res.success && res.summary.total > 0) {
        console.log(
          `[COURIER_SYNC] Checked ${res.summary.total} orders -> synced=${res.summary.synced}, updated=${res.summary.updated}, failed=${res.summary.failed}`
        );
        if (res.summary.failed > 0) {
          const errs = (res.results || [])
            .filter((r: any) => r?.status === "ERROR")
            .map((r: any) => `${r.orderId}: ${r.error}`);
          if (errs.length > 0) {
            console.warn(`[COURIER_SYNC] Failures -> ${errs.join(" | ")}`);
          }
        }
      }
    } catch (err: any) {
      console.warn("[COURIER_SYNC] Background sync warning:", err.message);
    }
  };

  setTimeout(runSync, 15_000).unref?.();
  const intervalMs = Math.max(2, intervalMinutes) * 60 * 1000;
  backgroundSyncTimer = setInterval(runSync, intervalMs);
  backgroundSyncTimer.unref?.();
  console.log(`[COURIER_SYNC] Automated courier polling enabled (every ${intervalMinutes} mins).`);
}

export interface SteadfastFraudReportData extends CourierFraudReport {
  phone: string;
  delivery_rate: number | null;
  cancellation_rate: number | null;
  delivery_ratio: number | null;
  cancellation_ratio: number | null;
  return_ratio: number | null;
  total_fraud_report: number;
  total_reports: number;
  volume_band: string;
  volume_range: string;
  total_parcel: number;
  total_delivered: number;
  total_cancelled: number;
  cached?: boolean;
  fetched_at?: string;
  raw?: any;
}

const FRAUD_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FRAUD_RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
const fraudMemoryCache = new Map<string, { fetchedAtMs: number; data: SteadfastFraudReportData }>();
const fraudInFlight = new Map<string, Promise<SteadfastFraudReportData>>();
let fraudRateLimitedUntilMs = 0;

export function clearSteadfastFraudMemoryCache(): void {
  fraudMemoryCache.clear();
  fraudInFlight.clear();
  fraudRateLimitedUntilMs = 0;
}

export function parseSteadfastFraudPayload(phone: string, responseData: any): SteadfastFraudReportData {
  let deliveryRate =
    responseData?.delivery_ratio !== undefined && responseData?.delivery_ratio !== null
      ? Number(responseData.delivery_ratio)
      : null;
  let cancellationRate =
    responseData?.cancellation_ratio !== undefined && responseData?.cancellation_ratio !== null
      ? Number(responseData.cancellation_ratio)
      : responseData?.return_ratio !== undefined && responseData?.return_ratio !== null
      ? Number(responseData.return_ratio)
      : null;

  const fraudReports =
    responseData?.total_reports !== undefined && responseData?.total_reports !== null
      ? Number(responseData.total_reports)
      : Array.isArray(responseData?.total_fraud_reports)
      ? responseData.total_fraud_reports.length
      : Number(responseData?.total_fraud_report) || 0;

  const volumeBand = typeof responseData?.volume_band === "string" ? responseData.volume_band : "";
  const volumeRange = typeof responseData?.volume_range === "string" ? responseData.volume_range : "";
  const totalParcel = Number(responseData?.total_parcels ?? responseData?.total_parcel ?? 0) || 0;
  const totalDelivered = Number(responseData?.total_delivered ?? 0) || 0;
  const totalCancelled = Number(responseData?.total_cancelled ?? 0) || 0;

  if (totalParcel > 0) {
    if (deliveryRate === null || Number.isNaN(deliveryRate)) {
      deliveryRate = Math.round((totalDelivered / totalParcel) * 100);
    }
    if (cancellationRate === null || Number.isNaN(cancellationRate)) {
      cancellationRate = Math.round((totalCancelled / totalParcel) * 100);
    }
  }

  return {
    phone,
    delivery_rate: deliveryRate !== null && !Number.isNaN(deliveryRate) ? deliveryRate : null,
    cancellation_rate: cancellationRate !== null && !Number.isNaN(cancellationRate) ? cancellationRate : null,
    delivery_ratio: deliveryRate !== null && !Number.isNaN(deliveryRate) ? deliveryRate : null,
    cancellation_ratio: cancellationRate !== null && !Number.isNaN(cancellationRate) ? cancellationRate : null,
    return_ratio: cancellationRate !== null && !Number.isNaN(cancellationRate) ? cancellationRate : null,
    total_fraud_report: Number.isFinite(fraudReports) ? fraudReports : 0,
    total_reports: Number.isFinite(fraudReports) ? fraudReports : 0,
    volume_band: volumeBand,
    volume_range: volumeRange,
    total_parcel: totalParcel,
    total_delivered: totalDelivered,
    total_cancelled: totalCancelled,
    raw: responseData,
  };
}

async function resolveSteadfastFraudKeys(
  getDb?: () => FirebaseFirestore.Firestore | null
): Promise<{ apiKey: string; secretKey: string }> {
  let apiKey = (process.env.STEADFAST_API_KEY || "").trim();
  let secretKey = (process.env.STEADFAST_SECRET_KEY || "").trim();

  if (!apiKey || !secretKey) {
    try {
      const db = getDb?.();
      if (db) {
        const creds = await loadCourierCredentials(db);
        apiKey = apiKey || (creds.steadfastApiKey || "").trim();
        secretKey = secretKey || (creds.steadfastSecretKey || "").trim();
      }
    } catch (err: any) {
      console.warn("Could not fetch Steadfast keys from Firestore:", err?.message || err);
    }
  }

  return { apiKey, secretKey };
}

async function fetchLiveSteadfastFraudFromApi(
  phone: string,
  apiKey: string,
  secretKey: string
): Promise<SteadfastFraudReportData> {
  const headers = {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
  };

  let responseData: any = null;
  try {
    const response = await axios.get(
      `https://portal.packzy.com/api/v1/fraud_check/score/${encodeURIComponent(phone)}`,
      { headers, timeout: 10000 }
    );
    responseData = response.data;
  } catch (scoreErr: any) {
    if (scoreErr?.response?.status === 404) {
      const fallbackRes = await axios.get(
        `https://portal.packzy.com/api/v1/fraud_check/${encodeURIComponent(phone)}`,
        { headers, timeout: 10000 }
      );
      responseData = fallbackRes.data;
    } else {
      throw scoreErr;
    }
  }

  return parseSteadfastFraudPayload(phone, responseData);
}

async function readCachedFraudReport(
  phone: string,
  getDb?: () => FirebaseFirestore.Firestore | null,
  ttlMs = FRAUD_CACHE_TTL_MS
): Promise<SteadfastFraudReportData | null> {
  const now = Date.now();
  const mem = fraudMemoryCache.get(phone);
  if (mem && now - mem.fetchedAtMs < ttlMs) {
    return { ...mem.data, cached: true };
  }

  try {
    const db = getDb?.();
    if (db) {
      const snap = await db.collection("courier_fraud_cache").doc(phone).get();
      if (snap.exists) {
        const docData = snap.data() as any;
        const fetchedAtMs = Number(docData?.fetchedAtMs || 0);
        if (fetchedAtMs > 0 && now - fetchedAtMs < ttlMs) {
          const parsed = parseSteadfastFraudPayload(phone, docData?.raw ?? docData);
          const cachedResult: SteadfastFraudReportData = {
            ...parsed,
            cached: true,
            fetched_at: docData?.updatedAt || new Date(fetchedAtMs).toISOString(),
          };
          fraudMemoryCache.set(phone, { fetchedAtMs, data: parsed });
          return cachedResult;
        }
      }
    }
  } catch (cacheReadErr: any) {
    console.warn("[COURIER_FRAUD_CACHE] Read warning:", cacheReadErr?.message || cacheReadErr);
  }

  return null;
}

export async function getSteadfastFraudReportCached(
  rawPhone: string,
  options: {
    getDb?: () => FirebaseFirestore.Firestore | null;
    forceRefresh?: boolean;
    ttlMs?: number;
  } = {}
): Promise<{ data: SteadfastFraudReportData; fromCache: boolean }> {
  const phone = normalizeSteadfastPhone(rawPhone);
  if (!phone || phone.length < 6) {
    const err: any = new Error("Phone number is required");
    err.statusCode = 400;
    throw err;
  }

  const ttlMs = options.ttlMs ?? FRAUD_CACHE_TTL_MS;

  if (!options.forceRefresh) {
    const cached = await readCachedFraudReport(phone, options.getDb, ttlMs);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    if (Date.now() < fraudRateLimitedUntilMs) {
      const rateErr: any = new Error("Steadfast courier search rate limit reached. Please retry shortly.");
      rateErr.statusCode = 429;
      throw rateErr;
    }
  }

  let pending = fraudInFlight.get(phone);
  if (!pending) {
    pending = (async () => {
      try {
        const { apiKey, secretKey } = await resolveSteadfastFraudKeys(options.getDb);
        if (!apiKey || !secretKey) {
          const err: any = new Error(
            "Steadfast API Key settings missing. Please configure them in Dashboard Settings or server .env."
          );
          err.statusCode = 400;
          throw err;
        }

        const fresh = await fetchLiveSteadfastFraudFromApi(phone, apiKey, secretKey);
        const updatedAt = new Date().toISOString();
        const storedData: SteadfastFraudReportData = {
          ...fresh,
          cached: false,
          fetched_at: updatedAt,
        };
        fraudMemoryCache.set(phone, { fetchedAtMs: Date.now(), data: storedData });

        try {
          const db = options.getDb?.();
          if (db) {
            await db.collection("courier_fraud_cache").doc(phone).set(
              {
                ...fresh,
                fetchedAtMs: Date.now(),
                updatedAt,
              },
              { merge: true }
            );
          }
        } catch (cacheWriteErr: any) {
          console.warn("[COURIER_FRAUD_CACHE] Write warning:", cacheWriteErr?.message || cacheWriteErr);
        }

        return storedData;
      } catch (apiErr: any) {
        if (apiErr?.response?.status === 429 || apiErr?.statusCode === 429) {
          fraudRateLimitedUntilMs = Date.now() + FRAUD_RATE_LIMIT_COOLDOWN_MS;
        }
        throw apiErr;
      } finally {
        fraudInFlight.delete(phone);
      }
    })();

    fraudInFlight.set(phone, pending);
  }

  const data = await pending;
  return { data, fromCache: false };
}

export async function fetchSteadfastFraudBatch(
  rawPhones: string[],
  options: {
    getDb?: () => FirebaseFirestore.Firestore | null;
    forceRefresh?: boolean;
    maxPhones?: number;
    maxLiveFetch?: number;
    concurrency?: number;
    ttlMs?: number;
  } = {}
): Promise<{
  results: Record<string, SteadfastFraudReportData>;
  errors: Record<string, string>;
  cachedPhones: string[];
  fetchedPhones: string[];
  rateLimited: boolean;
}> {
  const maxPhones = Math.max(1, Math.min(30, options.maxPhones ?? 25));
  const maxLiveFetch = Math.max(0, Math.min(10, options.maxLiveFetch ?? 4));
  const concurrency = Math.max(1, Math.min(3, options.concurrency ?? 2));
  const ttlMs = options.ttlMs ?? FRAUD_CACHE_TTL_MS;

  const uniquePhones: string[] = [];
  for (const raw of rawPhones) {
    const normalized = normalizeSteadfastPhone(raw);
    if (normalized.length >= 6 && !uniquePhones.includes(normalized)) {
      uniquePhones.push(normalized);
      if (uniquePhones.length >= maxPhones) break;
    }
  }

  const results: Record<string, SteadfastFraudReportData> = {};
  const errors: Record<string, string> = {};
  const cachedPhones: string[] = [];
  const fetchedPhones: string[] = [];
  const uncachedPhones: string[] = [];

  if (!options.forceRefresh) {
    await Promise.all(
      uniquePhones.map(async (phone) => {
        const cached = await readCachedFraudReport(phone, options.getDb, ttlMs);
        if (cached) {
          results[phone] = cached;
          cachedPhones.push(phone);
        } else {
          uncachedPhones.push(phone);
        }
      })
    );
  } else {
    uncachedPhones.push(...uniquePhones);
  }

  let rateLimited = Date.now() < fraudRateLimitedUntilMs;
  const liveTargets = rateLimited ? [] : uncachedPhones.slice(0, maxLiveFetch);

  let cursor = 0;
  const worker = async () => {
    while (!rateLimited && cursor < liveTargets.length) {
      const idx = cursor++;
      const phone = liveTargets[idx];
      try {
        const { data, fromCache } = await getSteadfastFraudReportCached(phone, {
          getDb: options.getDb,
          forceRefresh: options.forceRefresh,
          ttlMs,
        });
        results[phone] = data;
        if (fromCache) cachedPhones.push(phone);
        else fetchedPhones.push(phone);
      } catch (err: any) {
        const status = err?.statusCode || err?.response?.status;
        if (status === 429) {
          rateLimited = true;
        }
        errors[phone] =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to check customer fraud report";
      }
    }
  };

  if (liveTargets.length > 0) {
    await Promise.all(
      Array.from({ length: Math.min(concurrency, liveTargets.length) }, () => worker())
    );
  }

  return { results, errors, cachedPhones, fetchedPhones, rateLimited };
}
