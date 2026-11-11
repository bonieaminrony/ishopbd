import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import {
  buildMetaCapiPayload,
  buildTikTokEventsPayload,
  checkAndMarkEventDispatched,
  clearEventDedupCacheForTests,
  dispatchServerTrackingEvents,
  normalizeE164Phone,
  normalizePhoneDigits,
  parseCookies,
  resolveFbc,
  sha256Normalized,
} from "../server/trackingEngine";
import {
  captureAttribution,
  getOrderTrackingSignals,
  getStoredAttribution,
  initTracking,
  normalizeBdPhoneToE164,
  resetTrackingForTests,
  trackAddToCart,
  trackAddToWishlist,
  trackConfirmedOrderPurchase,
  trackContact,
  trackInitiateCheckout,
  trackPurchase,
  trackSearch,
  trackViewContent,
} from "../utils/tracking";

describe("Server-Side Tracking Engine (Meta CAPI & TikTok Events API)", () => {
  beforeEach(() => {
    clearEventDedupCacheForTests();
    vi.restoreAllMocks();
  });

  it("normalizes Bangladesh phone numbers (ASCII & Bengali digits) accurately", () => {
    expect(normalizePhoneDigits("01712345678")).toBe("8801712345678");
    expect(normalizePhoneDigits("+8801712-345678")).toBe("8801712345678");
    expect(normalizePhoneDigits("০১৭১২৩৪৫৬৭৮")).toBe("8801712345678");
    expect(normalizeE164Phone("01712345678")).toBe("+8801712345678");
    expect(normalizeBdPhoneToE164("০১৭১২৩৪৫৬৭৮")).toBe("+8801712345678");
  });

  it("parses cookies and builds fallback fbc from fbclid", () => {
    const cookies = parseCookies("_fbp=fb.1.111.222; _ttp=ttp_xyz");
    expect(cookies._fbp).toBe("fb.1.111.222");
    expect(cookies._ttp).toBe("ttp_xyz");
    expect(resolveFbc(undefined, "IwAR123", 1700000000)).toBe("fb.1.1700000000.IwAR123");
    expect(resolveFbc("fb.1.999.existing", "IwAR123", 1700000000)).toBe("fb.1.999.existing");
  });

  it("builds valid Meta CAPI Purchase payload with SHA-256 PII and event_id", () => {
    const built = buildMetaCapiPayload(
      {
        meta: {
          enabled: true,
          capiEnabled: true,
          pixelId: "1358996272808579",
          accessToken: "EAAG_real_token",
          testEventCode: "TEST42",
        },
      },
      {
        eventName: "Purchase",
        eventId: "purchase_ORD999",
        eventTime: 1730000000,
        eventSourceUrl: "https://ishopbd.com/checkout",
        clientIp: "103.10.20.30",
        userAgent: "Mozilla/5.0",
        userData: {
          name: "Rony Ahmed",
          phone: "01712345678",
          email: "Test@Example.com",
          city: "Dhaka",
          fbp: "fb.1.100.200",
          fbclid: "fbclid_abc",
        },
        customData: {
          value: 2450,
          currency: "BDT",
          orderId: "ORD999",
          contentIds: ["p1"],
          numItems: 2,
          contents: [{ id: "p1", quantity: 2, price: 1225 }],
        },
      }
    );

    expect(built).not.toBeNull();
    expect(built!.pixelId).toBe("1358996272808579");
    expect(built!.payload.test_event_code).toBe("TEST42");

    const ev = built!.payload.data[0];
    expect(ev.event_name).toBe("Purchase");
    expect(ev.event_id).toBe("purchase_ORD999");
    expect(ev.action_source).toBe("website");
    expect(ev.user_data.client_ip_address).toBe("103.10.20.30");
    expect(ev.user_data.fbp).toBe("fb.1.100.200");
    expect(ev.user_data.fbc).toBe("fb.1.1730000000.fbclid_abc");
    expect(ev.user_data.ph).toEqual([sha256Normalized("8801712345678")]);
    expect(ev.user_data.em).toEqual([sha256Normalized("test@example.com")]);
    expect(ev.user_data.fn).toEqual([sha256Normalized("rony")]);
    expect(ev.user_data.ln).toEqual([sha256Normalized("ahmed")]);
    expect(ev.user_data.ct).toEqual([sha256Normalized("dhaka")]);
    expect(ev.user_data.country).toEqual([sha256Normalized("bd")]);
    expect(ev.custom_data).toEqual({
      currency: "BDT",
      value: 2450,
      order_id: "ORD999",
      content_ids: ["p1"],
      content_type: "product",
      num_items: 2,
      contents: [{ id: "p1", quantity: 2, item_price: 1225 }],
    });
  });

  it("returns null for Meta/TikTok when disabled or accessToken missing", () => {
    expect(
      buildMetaCapiPayload(
        { meta: { enabled: true, capiEnabled: false, pixelId: "123", accessToken: "tok" } },
        { eventName: "Purchase", eventId: "e1" }
      )
    ).toBeNull();
    expect(
      buildTikTokEventsPayload(
        { tiktok: { enabled: false, eventsApiEnabled: true, pixelId: "TT1", accessToken: "tok" } },
        { eventName: "Purchase", eventId: "e1" }
      )
    ).toBeNull();
  });

  it("builds valid TikTok Events API v1.3 Purchase payload", () => {
    const built = buildTikTokEventsPayload(
      {
        tiktok: {
          enabled: true,
          eventsApiEnabled: true,
          pixelId: "C99999",
          accessToken: "tt_tok_123",
          testEventCode: "",
        },
      },
      {
        eventName: "Purchase",
        eventId: "purchase_ORD555",
        eventTime: 1730000000,
        eventSourceUrl: "https://ishopbd.com/",
        userData: {
          phone: "01812345678",
          ttp: "ttp_cookie",
          ttclid: "ttclid_123",
        },
        customData: {
          value: 990,
          currency: "BDT",
          orderId: "ORD555",
          contents: [{ id: "p9", name: "Mic", price: 990, quantity: 1 }],
        },
      }
    );

    expect(built).not.toBeNull();
    expect(built!.payload.event_source).toBe("web");
    expect(built!.payload.event_source_id).toBe("C99999");
    expect(built!.payload.test_event_code).toBeUndefined();
    const entry = built!.payload.data[0];
    expect(entry.event).toBe("Purchase");
    expect(entry.properties.content_type).toBe("product");
    expect(entry.event_id).toBe("purchase_ORD555");
    expect(entry.user.phone).toBe(sha256Normalized("+8801812345678"));
    expect(entry.user.ttp).toBe("ttp_cookie");
    expect(entry.user.ttclid).toBe("ttclid_123");
    expect(entry.properties.order_id).toBe("ORD555");
  });

  it("dispatches concurrently to Meta CAPI and TikTok Events API and deduplicates repeat event_id", async () => {
    const postSpy = vi.spyOn(axios, "post").mockImplementation(async (url: string) => {
      if (url.includes("graph.facebook.com")) {
        return { status: 200, data: { events_received: 1 } } as any;
      }
      return { status: 200, data: { code: 0, message: "OK" } } as any;
    });

    const config = {
      meta: { enabled: true, capiEnabled: true, pixelId: "1358996272808579", accessToken: "meta_tok" },
      tiktok: { enabled: true, eventsApiEnabled: true, pixelId: "TT123", accessToken: "tt_tok" },
    };

    const first = await dispatchServerTrackingEvents(config, {
      eventName: "Purchase",
      eventId: "purchase_ORD1",
      customData: { value: 500, currency: "BDT", orderId: "ORD1" },
    });

    expect(first.meta.sent).toBe(true);
    expect(first.meta.eventsReceived).toBe(1);
    expect(first.tiktok.sent).toBe(true);
    expect(postSpy).toHaveBeenCalledTimes(2);

    const second = await dispatchServerTrackingEvents(config, {
      eventName: "Purchase",
      eventId: "purchase_ORD1",
      customData: { value: 500, currency: "BDT", orderId: "ORD1" },
    });

    expect(second.deduplicated).toBe(true);
    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(checkAndMarkEventDispatched("Purchase", "purchase_ORD1")).toBe(true);
  });
});

describe("Frontend Hybrid Tracking Engine (Browser + /api/track-event)", () => {
  const flushMicrotasks = () => new Promise((r) => setTimeout(r, 15));

  beforeEach(() => {
    resetTrackingForTests();
    localStorage.clear();
    sessionStorage.clear();
    document.head.innerHTML = "";
    delete (window as any).fbq;
    delete (window as any)._fbq;
    delete (window as any).ttq;
    delete (window as any).gtag;
    delete (window as any).dataLayer;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("captures UTM, click IDs (fbclid/ttclid/gclid), and IMO attribution", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=imo&utm_medium=social_chat&utm_campaign=eid26&fbclid=fb_1&ttclid=tt_2&gclid=g_3"
    );
    const attr = captureAttribution();
    expect(attr.utm_source).toBe("imo");
    expect(attr.utm_campaign).toBe("eid26");
    expect(attr.fbclid).toBe("fb_1");
    expect(attr.ttclid).toBe("tt_2");
    expect(attr.gclid).toBe("g_3");
    expect(attr.fbc).toMatch(/^fb\.1\.\d+\.fb_1$/);
    expect(getStoredAttribution().utm_source).toBe("imo");
  });

  it("initializes Meta, TikTok, GA4, Google Ads, GTM from public-config and tracks full funnel", async () => {
    const fetchMock = vi.fn(async (url: string, _opts?: RequestInit) => {
      if (url === "/api/marketing/public-config") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            config: {
              meta: { enabled: true, pixelId: "1358996272808579" },
              tiktok: { enabled: true, pixelId: "TT_REAL_99" },
              google: {
                enabled: true,
                ga4MeasurementId: "G-90PDPQL0RJ",
                googleAdsConversionId: "AW-998877",
                googleAdsConversionLabel: "LblXYZ",
                enhancedConversions: true,
                gtmContainerId: "GTM-TEST01",
              },
              whatsapp: { enabled: true, whatsappNumber: "01712345678", defaultMessage: "" },
              imo: { enabled: true, campaignSource: "imo" },
            },
          }),
        } as any;
      }
      return { ok: true, json: async () => ({ success: true }) } as any;
    });
    vi.stubGlobal("fetch", fetchMock);

    await initTracking();

    expect(document.getElementById("ishopbd-meta-pixel-js")).not.toBeNull();
    expect(document.getElementById("ishopbd-tt-pixel-TT_REAL_99")).not.toBeNull();
    expect(document.getElementById("ishopbd-gtag-js")).not.toBeNull();
    expect(document.getElementById("ishopbd-gtm-GTM-TEST01")).not.toBeNull();

    const fbqSpy = vi.fn();
    const ttqTrackSpy = vi.fn();
    const ttqIdentifySpy = vi.fn();
    const gtagSpy = vi.fn();
    (window as any).fbq = fbqSpy;
    (window as any).ttq = { track: ttqTrackSpy, identify: ttqIdentifySpy, page: vi.fn() };
    (window as any).gtag = gtagSpy;

    trackViewContent({ id: "p1", name: "DJI Mic", price: 1500, category: "Mic", brand: "DJI" });
    trackAddToCart({ id: "p1", name: "DJI Mic", price: 1500, quantity: 2 });
    trackAddToWishlist({ id: "p1", name: "DJI Mic", price: 1500, category: "Mic" });
    trackSearch("DJI Mic");
    trackInitiateCheckout([{ id: "p1", name: "DJI Mic", price: 1500, quantity: 2 }], 3000);
    trackContact("whatsapp", 3000);
    trackPurchase({
      orderId: "ORD123",
      value: 3060,
      items: [{ id: "p1", name: "DJI Mic", price: 1500, quantity: 2 }],
      customerName: "Karim",
      customerPhone: "01712345678",
      district: "Dhaka",
    });

    await flushMicrotasks();

    expect(fbqSpy).toHaveBeenCalledWith(
      "track",
      "Purchase",
      expect.objectContaining({ value: 3060, currency: "BDT", content_ids: ["p1"], num_items: 2 }),
      { eventID: "purchase_ORD123" }
    );
    expect(ttqIdentifySpy).toHaveBeenCalledWith({ phone_number: "+8801712345678" });
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "ViewContent",
      expect.objectContaining({ content_type: "product", content_id: "p1", value: 1500, currency: "BDT" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^vc_/) })
    );
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "AddToCart",
      expect.objectContaining({ content_type: "product", content_id: "p1", value: 3000, currency: "BDT" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^atc_/) })
    );
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "AddToWishlist",
      expect.objectContaining({ content_type: "product", content_id: "p1", value: 1500, currency: "BDT" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^wl_/) })
    );
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "Search",
      expect.objectContaining({ query: "DJI Mic", search_string: "DJI Mic" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^search_/) })
    );
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "InitiateCheckout",
      expect.objectContaining({ content_type: "product", value: 3000, currency: "BDT" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^ic_/) })
    );
    expect(ttqTrackSpy).toHaveBeenCalledWith(
      "Purchase",
      expect.objectContaining({ content_type: "product", content_id: "p1", value: 3060, currency: "BDT", order_id: "ORD123" }),
      { event_id: "purchase_ORD123" }
    );
    expect(gtagSpy).toHaveBeenCalledWith(
      "set",
      "user_data",
      expect.objectContaining({ phone_number: "+8801712345678" })
    );
    expect(gtagSpy).toHaveBeenCalledWith(
      "event",
      "conversion",
      expect.objectContaining({
        send_to: "AW-998877/LblXYZ",
        value: 3060,
        currency: "BDT",
        transaction_id: "ORD123",
      })
    );

    const trackCalls = fetchMock.mock.calls
      .filter(([u]) => u === "/api/track-event")
      .map(([, opts]) => JSON.parse((opts as any).body));
    const eventNames = trackCalls.map((c) => c.eventName);
    expect(eventNames).toEqual(
      expect.arrayContaining(["PageView", "ViewContent", "AddToCart", "AddToWishlist", "Search", "InitiateCheckout", "Contact", "Purchase"])
    );
    const serverPurchase = trackCalls.find((c) => c.eventName === "Purchase");
    expect(serverPurchase.eventId).toBe("purchase_ORD123");
    expect(serverPurchase.userData.phone).toBe("01712345678");
  });

  it("avoids duplicate TikTok load/page when pixel DBPHK73C77U4J2JR78JG is pre-loaded in HTML head", async () => {
    const loadSpy = vi.fn();
    const pageSpy = vi.fn();
    const trackSpy = vi.fn();
    (window as any).ttq = {
      _i: { DBPHK73C77U4J2JR78JG: [] },
      load: loadSpy,
      page: pageSpy,
      track: trackSpy,
    };
    (window as any).__ishopbdTtqHeadPagePixel = "DBPHK73C77U4J2JR78JG";

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false } as any))
    );

    const cfg = await initTracking();
    expect(cfg.tiktok.enabled).toBe(true);
    expect(cfg.tiktok.pixelId).toBe("DBPHK73C77U4J2JR78JG");
    expect(loadSpy).not.toHaveBeenCalled();
    expect(pageSpy).not.toHaveBeenCalled();

    trackViewContent({ id: "p9", name: "Boya M1", price: 950 });
    await flushMicrotasks();
    expect(trackSpy).toHaveBeenCalledWith(
      "ViewContent",
      expect.objectContaining({ value: 950, currency: "BDT" }),
      expect.objectContaining({ event_id: expect.stringMatching(/^vc_/) })
    );
  });

  it("captures customer tracking signals at checkout and fires server-side Purchase only on confirm with omitRequestCookies", async () => {
    window.history.replaceState({}, "", "/?fbclid=IwAR_test_fb&ttclid=tt_test_99");
    captureAttribution();
    document.cookie = "_fbp=fb.1.12345.67890";
    document.cookie = "_ttp=ttp_user_cookie";

    const signals = getOrderTrackingSignals();
    expect(signals.fbclid).toBe("IwAR_test_fb");
    expect(signals.ttclid).toBe("tt_test_99");
    expect(signals.fbp).toBe("fb.1.12345.67890");
    expect(signals.ttp).toBe("ttp_user_cookie");

    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ success: true }) } as any));
    vi.stubGlobal("fetch", fetchMock);

    trackConfirmedOrderPurchase({
      orderId: "ORD-CONF-777",
      total: 1850,
      items: [{ product: { id: "p5", name: "Koti Jacket", price: 1850 }, quantity: 1 }],
      customerName: "Tariq",
      customerPhone: "01711112222",
      district: "Dhaka",
      userId: "guest",
      trackingSignals: signals,
    });

    await flushMicrotasks();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0] as any;
    expect(url).toBe("/api/track-event");
    const body = JSON.parse(opts.body);
    expect(body.eventName).toBe("Purchase");
    expect(body.eventId).toBe("purchase_ORD-CONF-777");
    expect(body.omitRequestCookies).toBe(true);
    expect(body.userData.fbp).toBe("fb.1.12345.67890");
    expect(body.userData.ttclid).toBe("tt_test_99");
    expect(body.customData.value).toBe(1850);
    expect(body.customData.orderId).toBe("ORD-CONF-777");
  });
});
