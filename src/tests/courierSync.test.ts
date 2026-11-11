import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  appendCourierHistoryEntry,
  evaluateCourierOrderTransition,
  extractOrderCourierInfo,
  fetchSteadfastLiveStatus,
  formatCourierStatusLabel,
  normalizeSteadfastPhone,
  processSteadfastWebhook,
  syncAllActiveCourierOrders,
  syncSingleOrderCourierStatus,
  verifyWebhookToken,
} from "../server/courierSyncEngine";
import {
  extractCourierHubName,
  resolveCourierBadgeDisplay,
} from "../utils/courierDisplay";

function createMockFirestore(initialOrders: Record<string, any>, initialKeys: any = {}) {
  const ordersStore: Record<string, any> = {};
  for (const [id, data] of Object.entries(initialOrders)) {
    ordersStore[id] = { ...data };
  }
  const notifsStore: Record<string, any> = {};

  const makeOrderDocRef = (id: string) => ({
    id,
    get: async () => ({
      exists: Boolean(ordersStore[id]),
      id,
      ref: makeOrderDocRef(id),
      data: () => (ordersStore[id] ? { ...ordersStore[id] } : undefined),
    }),
    set: async (payload: any, opts?: any) => {
      ordersStore[id] = opts?.merge ? { ...(ordersStore[id] || {}), ...payload } : { ...payload };
    },
  });

  const db: any = {
    collection: (name: string) => {
      if (name === "admin_config") {
        return {
          doc: (id: string) => ({
            get: async () => ({
              exists: id === "keys" && Object.keys(initialKeys).length > 0,
              data: () => ({ ...initialKeys }),
            }),
          }),
        };
      }
      if (name === "notifications") {
        return {
          doc: (id: string) => ({
            set: async (payload: any) => {
              notifsStore[id] = { ...(notifsStore[id] || {}), ...payload };
            },
          }),
        };
      }
      if (name === "orders") {
        return {
          doc: (id: string) => makeOrderDocRef(id),
          orderBy: () => ({
            limit: () => ({
              get: async () => ({
                docs: Object.keys(ordersStore).map((id) => ({
                  id,
                  ref: makeOrderDocRef(id),
                  data: () => ({ ...ordersStore[id] }),
                })),
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected collection ${name}`);
    },
    _ordersStore: ordersStore,
    _notifsStore: notifsStore,
  };
  return db;
}

describe("Automated Courier Sync Engine (Rivo Fashion Parity)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("evaluates courier status transitions with manual status protection", () => {
    const toShipped = evaluateCourierOrderTransition("processing", "in_review");
    expect(toShipped.shouldTransition).toBe(true);
    expect(toShipped.targetOrderStatus).toBe("shipped");

    const toDelivered = evaluateCourierOrderTransition("shipped", "delivered");
    expect(toDelivered.shouldTransition).toBe(true);
    expect(toDelivered.targetOrderStatus).toBe("delivered");

    const toReturned = evaluateCourierOrderTransition("shipped", "delivery_failed");
    expect(toReturned.shouldTransition).toBe(true);
    expect(toReturned.targetOrderStatus).toBe("returned");

    const toCancelled = evaluateCourierOrderTransition("shipped", "cancelled_by_customer");
    expect(toCancelled.shouldTransition).toBe(true);
    expect(toCancelled.targetOrderStatus).toBe("cancelled");

    // Manual Status Protection: cancelled order is never overwritten
    const protectedCancelled = evaluateCourierOrderTransition("cancelled", "delivered");
    expect(protectedCancelled.shouldTransition).toBe(false);
    expect(protectedCancelled.statusProtected).toBe(true);

    // Delivered order ignores stale in-transit ping
    const staleTransit = evaluateCourierOrderTransition("delivered", "in_transit");
    expect(staleTransit.shouldTransition).toBe(false);
    expect(staleTransit.statusProtected).toBe(true);

    // Post-delivery return is allowed
    const postDeliveryReturn = evaluateCourierOrderTransition("delivered", "returned");
    expect(postDeliveryReturn.shouldTransition).toBe(true);
    expect(postDeliveryReturn.targetOrderStatus).toBe("returned");

    // Hold keeps existing status
    const holdEval = evaluateCourierOrderTransition("shipped", "hold");
    expect(holdEval.shouldTransition).toBe(false);
    expect(holdEval.normalizedCategory).toBe("on_hold");

    expect(formatCourierStatusLabel("partial_delivered")).toEqual({
      code: "partial_delivered",
      category: "delivered",
      label: "Partially Delivered",
    });
  });

  it("extracts courier identifiers from both legacy and unified order shapes", () => {
    expect(
      extractOrderCourierInfo({
        courierName: "Steadfast",
        courierTrackingId: "SF998877",
        courierConsignmentId: "123456",
      })
    ).toEqual({ service: "Steadfast", trackingId: "SF998877", consignmentId: "123456" });

    expect(
      extractOrderCourierInfo({
        couriers: { service: "Pathao", trackingId: "PT123" },
      })
    ).toEqual({ service: "Pathao", trackingId: "PT123", consignmentId: "" });

    expect(extractOrderCourierInfo({ status: "pending" })).toBeNull();
  });

  it("queries Steadfast status_by_cid and falls back to status_by_trackingcode / invoice", async () => {
    const getSpy = vi.spyOn(axios, "get").mockImplementation(async (url: string) => {
      if (url.includes("status_by_trackingcode/TRK1")) {
        const err: any = new Error("Not found");
        err.response = { status: 404 };
        throw err;
      }
      return { status: 200, data: { status: 200, delivery_status: "in_transit" } } as any;
    });

    const res = await fetchSteadfastLiveStatus(
      { steadfastApiKey: "k", steadfastSecretKey: "s" },
      { trackingId: "TRK1", invoiceId: "ORD-1" }
    );
    expect(res.rawStatus).toBe("in_transit");
    expect(res.endpoint).toBe("status_by_invoice/ORD-1");
    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it("batch syncs active orders from Steadfast and skips terminal/deleted orders", async () => {
    const db = createMockFirestore(
      {
        ORD_ACTIVE: {
          status: "shipped",
          courierName: "Steadfast",
          courierTrackingId: "SF100",
          customerName: "Rahim",
          userId: "user_1",
        },
        ORD_RETURNED: {
          status: "processing",
          courierName: "Steadfast",
          courierConsignmentId: "998877",
          customerName: "Karim",
          userId: "guest",
        },
        ORD_CANCELLED: {
          status: "cancelled",
          courierName: "Steadfast",
          courierTrackingId: "SF_OLD",
        },
        ORD_DELETED: {
          deleted: true,
          status: "shipped",
          courierName: "Steadfast",
          courierTrackingId: "SF_DEL",
        },
      },
      { steadfastApiKey: "key1", steadfastSecretKey: "sec1" }
    );

    vi.spyOn(axios, "get").mockImplementation(async (url: string) => {
      if (url.includes("SF100")) {
        return { status: 200, data: { delivery_status: "delivered" } } as any;
      }
      if (url.includes("998877")) {
        return { status: 200, data: { delivery_status: "returned" } } as any;
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const batchRes = await syncAllActiveCourierOrders(db, { force: false, limit: 20 });
    expect(batchRes.success).toBe(true);
    expect(batchRes.summary).toEqual({
      total: 2,
      synced: 2,
      updated: 2,
      failed: 0,
      skipped: 0,
    });

    expect(db._ordersStore.ORD_ACTIVE.status).toBe("delivered");
    expect(db._ordersStore.ORD_ACTIVE.steadfastStatus).toBe("delivered");
    expect(db._ordersStore.ORD_ACTIVE.courierStatusLabel).toBe("Delivered");
    expect(db._ordersStore.ORD_ACTIVE.courierLastSyncedAt).toBeTruthy();
    expect(db._notifsStore.order_ORD_ACTIVE.status).toBe("delivered");

    expect(db._ordersStore.ORD_RETURNED.status).toBe("returned");
    expect(db._ordersStore.ORD_RETURNED.paymentMethod).toBe("N/A");
  });

  it("syncs a single order and verifies Steadfast webhook tokens", async () => {
    const db = createMockFirestore(
      {
        ORD_SINGLE: {
          status: "confirmed",
          courierName: "Steadfast",
          courierTrackingId: "SF777",
        },
      },
      { steadfastApiKey: "k", steadfastSecretKey: "s" }
    );

    vi.spyOn(axios, "get").mockResolvedValue({
      status: 200,
      data: { delivery_status: "picked_up" },
    } as any);

    const single = await syncSingleOrderCourierStatus(db, "ORD_SINGLE");
    expect(single.newOrderStatus).toBe("shipped");
    expect(single.courierLabel).toBe("Picked Up");

    expect(verifyWebhookToken("sec123", { "x-steadfast-webhook-token": "sec123" })).toBe(true);
    expect(verifyWebhookToken("sec123", { authorization: "Bearer sec123" })).toBe(true);
    expect(verifyWebhookToken("sec123", { "x-steadfast-webhook-token": "wrong" })).toBe(false);
    expect(verifyWebhookToken("", { "x-steadfast-webhook-token": "anything" })).toBe(false);
  });

  it("maintains deduplicated courier movement timeline and captures webhook tracking messages", async () => {
    const first = appendCourierHistoryEntry([], {
      status: "in_review",
      label: "In Review (Booked)",
      category: "booked",
      message: "Booked at Steadfast",
      source: "ADMIN_BOOKING",
      timestamp: "2026-11-10T10:00:00Z",
    });
    // Duplicate polling ping with identical status & message should not create duplicate rows
    const dup = appendCourierHistoryEntry(first, {
      status: "in_review",
      label: "In Review (Booked)",
      category: "booked",
      message: "Booked at Steadfast",
      source: "COURIER_BACKGROUND_SYNC",
      timestamp: "2026-11-10T10:10:00Z",
    });
    expect(dup).toHaveLength(1);
    expect(dup[0].timestamp).toBe("2026-11-10T10:00:00Z");

    const db = createMockFirestore(
      {
        ORD_WH: {
          status: "confirmed",
          courierName: "Steadfast",
          courierTrackingId: "SF_WH_1",
          courierHistory: dup,
        },
      },
      { steadfastWebhookSecret: "wh_secret_123" }
    );

    const whRes = await processSteadfastWebhook(
      db,
      { "x-steadfast-webhook-token": "wh_secret_123" },
      {
        invoice: "ORD_WH",
        status: "in_transit",
        tracking_message: "Parcel reached Chattogram Hub",
      }
    );

    expect(whRes.success).toBe(true);
    expect(whRes.statusCode).toBe(200);
    expect(whRes.result?.trackingMessage).toBe("Parcel reached Chattogram Hub");
    expect(whRes.result?.hubName).toBe("Chattogram Hub");
    expect(whRes.result?.courierHistory).toHaveLength(2);
    expect(db._ordersStore.ORD_WH.status).toBe("shipped");
    expect(db._ordersStore.ORD_WH.courierTrackingMessage).toBe("Parcel reached Chattogram Hub");
    expect(db._ordersStore.ORD_WH.courierHub).toBe("Chattogram Hub");
  });

  it("extracts hub locations from courier messages and resolves Not Booked / Hub / Delivered badges", () => {
    expect(extractCourierHubName("Parcel reached Chattogram Hub")).toBe("Chattogram Hub");
    expect(extractCourierHubName("Arrived at Barishal sorting hub")).toBe("Barishal sorting hub");
    expect(extractCourierHubName("Transferring from Dhaka Hub to Barishal Hub")).toBe("Barishal Hub");
    expect(extractCourierHubName("Parcel reached Barishal")).toBe("Barishal");
    expect(extractCourierHubName("Parcel booked with Steadfast courier")).toBe("");
    expect(extractCourierHubName("", { current_hub: "Sylhet Hub" })).toBe("Sylhet Hub");

    expect(resolveCourierBadgeDisplay({ isDispatched: false })).toEqual({
      badgeText: "Not Booked",
      hubName: "",
      isNotBooked: true,
    });

    expect(
      resolveCourierBadgeDisplay({
        isDispatched: true,
        courierStatus: "in_review",
        courierStatusLabel: "In Review (Booked)",
        courierStatusNormalized: "booked",
        courierTrackingMessage: "Parcel arrived at Dhaka Hub",
      }).badgeText
    ).toBe("In Review (Booked)");

    expect(
      resolveCourierBadgeDisplay({
        isDispatched: true,
        courierStatus: "in_transit",
        courierStatusLabel: "In Transit",
        courierStatusNormalized: "in_transit",
        courierTrackingMessage: "Parcel arrived at Barishal Hub",
      })
    ).toEqual({
      badgeText: "Barishal Hub",
      hubName: "Barishal Hub",
      isNotBooked: false,
    });

    expect(
      resolveCourierBadgeDisplay({
        isDispatched: true,
        courierStatus: "hold",
        courierStatusLabel: "On Hold",
        courierStatusNormalized: "on_hold",
        courierHub: "Rajshahi Hub",
      }).badgeText
    ).toBe("On Hold · Rajshahi Hub");

    expect(
      resolveCourierBadgeDisplay({
        isDispatched: true,
        courierStatus: "delivered",
        courierStatusLabel: "Delivered",
        courierStatusNormalized: "delivered",
        courierHub: "Barishal Hub",
      }).badgeText
    ).toBe("Delivered");
  });

  it("normalizes Bangladesh phone formats and falls back to Steadfast invoice lookup for shipped orders", async () => {
    expect(normalizeSteadfastPhone("+8801712-345678")).toBe("01712345678");
    expect(normalizeSteadfastPhone("8801712345678")).toBe("01712345678");
    expect(normalizeSteadfastPhone("০১৭১২-৩৪৫৬৭৮")).toBe("01712345678");
    expect(normalizeSteadfastPhone("1712345678")).toBe("01712345678");

    const db = createMockFirestore(
      {
        ORD_INV_ONLY: {
          status: "shipped",
          courierName: "Steadfast",
        },
      },
      { steadfastApiKey: "k", steadfastSecretKey: "s" }
    );

    const getSpy = vi.spyOn(axios, "get").mockResolvedValue({
      status: 200,
      data: {
        delivery_status: "in_review",
        tracking_code: "SFR_INV_99",
        consignment_id: 319143440,
      },
    } as any);

    const synced = await syncSingleOrderCourierStatus(db, "ORD_INV_ONLY");
    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining("/status_by_invoice/ORD_INV_ONLY"),
      expect.any(Object)
    );
    expect(synced.updated).toBe(true);
    expect(synced.rawCourierStatus).toBe("in_review");
    expect(db._ordersStore.ORD_INV_ONLY.courierTrackingId).toBe("SFR_INV_99");
    expect(db._ordersStore.ORD_INV_ONLY.courierConsignmentId).toBe("319143440");

    // Offline POS receipt IDs like "#911388" should not be treated as live courier parcels
    expect(
      extractOrderCourierInfo({
        orderId: "OFFLINE-911388",
        status: "delivered",
        courierName: "Steadfast",
        trackingId: "#911388",
      })
    ).toBeNull();
  });
});
