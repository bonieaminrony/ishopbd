import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Save,
  RefreshCw,
  ExternalLink,
  Copy,
  Sparkles,
  MessageCircle,
  Share2,
  Globe,
  Activity,
  TrendingUp,
  Send,
  Check,
  Key,
  Lock,
  Zap,
  Info
} from "lucide-react";
import toast from "react-hot-toast";
import SecretTokenField from "./admin/SecretTokenField";
import { refreshTrackingConfig } from "../utils/tracking";
import { getAdminAuthHeaders } from "../utils/adminAuth";

export interface MarketingConfig {
  meta: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
    maskedAccessToken?: string;
    clearAccessToken?: boolean;
    testEventCode?: string;
    capiEnabled: boolean;
    hasAccessToken?: boolean;
  };
  tiktok: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
    maskedAccessToken?: string;
    clearAccessToken?: boolean;
    testEventCode?: string;
    eventsApiEnabled: boolean;
    hasAccessToken?: boolean;
  };
  google: {
    enabled: boolean;
    ga4MeasurementId: string;
    googleAdsConversionId: string;
    googleAdsConversionLabel: string;
    enhancedConversions: boolean;
    gtmContainerId?: string;
  };
  whatsapp: {
    enabled: boolean;
    whatsappNumber: string;
    defaultMessage?: string;
  };
  imo: {
    enabled: boolean;
    campaignSource: string;
    defaultMedium: string;
  };
  openAi: {
    enabled: boolean;
    apiKey: string;
    maskedApiKey?: string;
    clearApiKey?: boolean;
    model: string;
    hasApiKey?: boolean;
  };
}

const DEFAULT_CONFIG: MarketingConfig = {
  meta: {
    enabled: true,
    pixelId: "1358996272808579",
    accessToken: "",
    testEventCode: "",
    capiEnabled: true,
    hasAccessToken: false
  },
  tiktok: {
    enabled: true,
    pixelId: "DBPHK73C77U4J2JR78JG",
    accessToken: "",
    testEventCode: "",
    eventsApiEnabled: true,
    hasAccessToken: false
  },
  google: {
    enabled: true,
    ga4MeasurementId: "G-90PDPQL0RJ",
    googleAdsConversionId: "",
    googleAdsConversionLabel: "",
    enhancedConversions: true,
    gtmContainerId: ""
  },
  whatsapp: {
    enabled: true,
    whatsappNumber: "017XXXXXXXX",
    defaultMessage: "হ্যালো iShop BD, আমি আপনার ওয়েবসাইট থেকে পণ্য ক্রয় করতে চাই।"
  },
  imo: {
    enabled: true,
    campaignSource: "imo",
    defaultMedium: "social_chat"
  },
  openAi: {
    enabled: false,
    apiKey: "",
    model: "gpt-4o-mini",
    hasApiKey: false
  }
};

const UNSAVED_TOKEN_TEST_REMINDER =
  ' — (নতুন টোকেনটি সংরক্ষণ করতে "সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করুন)';

interface TestResult {
  loading: boolean;
  success?: boolean;
  warning?: boolean;
  message?: string;
  previewUrl?: string;
  sampleUrl?: string;
  timestamp?: string;
}

export const MarketingSettings: React.FC = () => {
  const [config, setConfig] = useState<MarketingConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<"meta" | "tiktok" | "google" | "whatsapp" | "imo" | "openai">("meta");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Connection Test states
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  // IMO generator state
  const [imoCampaignInput, setImoCampaignInput] = useState<string>("winter_collection_2026");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch marketing config from server
  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const headers = await getAdminAuthHeaders(false);
      const res = await fetch("/api/admin/marketing-config", { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.config) {
          setConfig(json.config);
          return;
        }
      }
      toast.error("সার্ভার থেকে কনফিগারেশন লোড করা যায়নি");
    } catch (err: any) {
      console.error("Failed to load marketing config:", err);
      toast.error("মার্কেটিং কনফিগারেশন লোড ব্যর্থ: " + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save marketing config to server
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch("/api/admin/marketing-config", {
        method: "POST",
        headers,
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("মার্কেটিং ও ট্র্যাকিং সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
        setTestResults(prev => {
          const cleaned: Record<string, TestResult> = {};
          for (const k of Object.keys(prev)) {
            const v = prev[k];
            cleaned[k] = v?.message?.includes(UNSAVED_TOKEN_TEST_REMINDER)
              ? { ...v, message: v.message.replace(UNSAVED_TOKEN_TEST_REMINDER, "") }
              : v;
          }
          return cleaned;
        });
        // Refresh to get updated masked state and re-init frontend pixels immediately
        await Promise.all([fetchConfig(), refreshTrackingConfig()]);
      } else {
        toast.error("সংরক্ষণ ব্যর্থ: " + (data.error || "অজানা ত্রুটি"));
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("সংরক্ষণ করা যায়নি: " + (err.message || String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Run Connection Test for a specific platform
  const runPlatformTest = async (platform: string, payload: any) => {
    setTestResults(prev => ({
      ...prev,
      [platform]: { loading: true }
    }));

    try {
      const headers = await getAdminAuthHeaders(true);
      const res = await fetch(`/api/admin/marketing-test/${platform}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const hasUnsavedSecret =
          (typeof payload?.accessToken === "string" && payload.accessToken.trim().length > 0) ||
          (typeof payload?.apiKey === "string" && payload.apiKey.trim().length > 0);
        const displayMessage = hasUnsavedSecret && !data.warning
          ? `${data.message}${UNSAVED_TOKEN_TEST_REMINDER}`
          : data.message;
        setTestResults(prev => ({
          ...prev,
          [platform]: {
            loading: false,
            success: true,
            warning: !!data.warning,
            message: displayMessage,
            previewUrl: data.previewUrl,
            sampleUrl: data.sampleUrl,
            timestamp: new Date().toLocaleTimeString("bn-BD")
          }
        }));
        if (data.warning) {
          toast(displayMessage, { icon: "⚠️" });
        } else {
          toast.success(displayMessage);
        }
      } else {
        setTestResults(prev => ({
          ...prev,
          [platform]: {
            loading: false,
            success: false,
            message: data.error || "কানেকশন টেস্ট ব্যর্থ হয়েছে",
            timestamp: new Date().toLocaleTimeString("bn-BD")
          }
        }));
        toast.error(data.error || "কানেকশন টেস্ট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [platform]: {
          loading: false,
          success: false,
          message: err.message || "নেটওয়ার্ক সমস্যা হয়েছে",
          timestamp: new Date().toLocaleTimeString("bn-BD")
        }
      }));
      toast.error("টেস্ট সম্পন্ন করা যায়নি: " + (err.message || String(err)));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success("লিঙ্ক কপি হয়েছে!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-500 font-sans">
          মার্কেটিং ও ট্র্যাকিং কনফিগারেশন লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans w-full">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#26225a] to-[#1e3a8a] text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-blue-950/20 border border-blue-400/20 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Zap size={14} className="text-yellow-300" /> Central Tracking Engine
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Marketing & Ads Integration
            </h3>
            <p className="text-xs md:text-sm text-blue-100/90 max-w-3xl font-medium leading-relaxed">
              সব বিজ্ঞাপন ও মার্কেটিং প্ল্যাটফর্মের API, Pixel ID, Server-Side CAPI, Events API ও ক্যাম্পেইন ট্র্যাকিং একটি কেন্দ্রীয় কন্ট্রোল প্যানেল থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchConfig}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 backdrop-blur-sm"
              title="সার্ভার থেকে পুনরায় লোড করুন"
            >
              <RefreshCw size={15} /> রিফ্রেশ
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-primary hover:bg-red-600 text-white rounded-xl text-xs md:text-sm font-black shadow-lg shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 border border-white/10"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Save size={16} /> সেটিংস সংরক্ষণ করুন
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Status Strip */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <ShieldCheck size={18} className="text-emerald-300 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Server Security</p>
              <p className="text-xs font-bold text-white">Server-Side Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <Lock size={18} className="text-cyan-300 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Token Masking</p>
              <p className="text-xs font-bold text-white">Client Masked Active</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <Key size={18} className="text-amber-300 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Zero Leakage</p>
              <p className="text-xs font-bold text-white">No Public Exposure</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
            <Activity size={18} className="text-fuchsia-300 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Deduplication</p>
              <p className="text-xs font-bold text-white">Event ID Hybrid Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Navigation Tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-gray-200 w-full no-scrollbar">
        {[
          { id: "meta", label: "Meta (FB & IG)", enabled: config.meta.enabled, icon: Globe, color: "text-blue-600" },
          { id: "tiktok", label: "TikTok Ads", enabled: config.tiktok.enabled, icon: Activity, color: "text-indigo-600" },
          { id: "google", label: "Google Ads & GA4", enabled: config.google.enabled, icon: TrendingUp, color: "text-red-500" },
          { id: "whatsapp", label: "WhatsApp Business", enabled: config.whatsapp.enabled, icon: MessageCircle, color: "text-emerald-500" },
          { id: "imo", label: "IMO Campaign", enabled: config.imo.enabled, icon: Send, color: "text-sky-500" },
          { id: "openai", label: "OpenAI / AI Engine", enabled: config.openAi.enabled, icon: Sparkles, color: "text-purple-600" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[170px] justify-center px-4 py-3.5 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? "bg-white text-gray-900 border-primary shadow-md ring-2 ring-primary/10"
                  : "bg-gray-50/80 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Icon size={16} className={tab.color} />
              <span>{tab.label}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  tab.enabled ? "bg-emerald-500 ring-2 ring-emerald-200" : "bg-gray-300"
                }`}
                title={tab.enabled ? "সক্রিয়" : "নিষ্ক্রিয়"}
              />
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. Meta (Facebook & Instagram) Panel */}
      {/* ========================================================================= */}
      {activeTab === "meta" && (
        <div key="panel-meta" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-blue-600" />
                <h4 className="text-lg font-black text-gray-900">
                  Meta Integration (Facebook & Instagram)
                </h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Meta Pixel এবং Meta Conversions API (CAPI) এর সমন্বিত Hybrid ট্র্যাকিং পরিচালনা করুন।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.meta.enabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, meta: { ...prev.meta, enabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-black ${config.meta.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.meta.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pixel ID */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Meta Pixel ID <span className="text-red-500">*</span>
              </label>
              <input
                id="meta-pixel-id"
                name="meta_pixel_id"
                type="text"
                value={config.meta.pixelId}
                onChange={(e) => setConfig((prev) => ({ ...prev, meta: { ...prev.meta, pixelId: e.target.value } }))}
                placeholder="e.g. 1358996272808579"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Facebook Events Manager থেকে প্রাপ্ত Pixel ID বা Dataset ID।
              </p>
            </div>

            {/* Test Event Code */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Meta Test Event Code (ঐচ্ছিক / Testing)
              </label>
              <input
                id="meta-test-event-code"
                name="meta_test_event_code"
                type="text"
                value={config.meta.testEventCode || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, meta: { ...prev.meta, testEventCode: e.target.value } }))}
                placeholder="e.g. TEST12345"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Events Manager &gt; Test Events ট্যাবের কোড। লাইভ রান করার সময় খালি রাখা যাবে।
              </p>
            </div>

            {/* CAPI Access Token */}
            <SecretTokenField
              fieldId="meta_capi_access_token"
              label="Meta Conversions API (CAPI) Access Token"
              required
              value={config.meta.accessToken}
              hasSavedToken={!!config.meta.hasAccessToken}
              maskedPreview={config.meta.maskedAccessToken}
              isMarkedForClear={!!config.meta.clearAccessToken}
              placeholderNew="EAAG... দীর্ঘ অ্যাক্সেস টোকেন পেস্ট করুন"
              helperText='Business Manager > Events Manager > Settings > Conversions API > "Generate Access Token"-এ ক্লিক করে সর্বশেষ টোকেনটি পেস্ট করুন (নতুন টোকেন জেনারেট করলে আগেরটি বাতিল হয়ে যায়)।'
              onChangeValue={(next) =>
                setConfig((prev) => ({
                  ...prev,
                  meta: { ...prev.meta, accessToken: next },
                }))
              }
              onToggleClear={(clear) =>
                setConfig((prev) => ({
                  ...prev,
                  meta: { ...prev.meta, clearAccessToken: clear },
                }))
              }
            />

            {/* Server-Side CAPI Switch */}
            <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-blue-900">Server-Side Tracking (CAPI) সক্রিয় রাখবেন?</p>
                <p className="text-[11px] text-blue-700 font-medium">
                  সক্রিয় থাকলে প্রতিটি পারচেজ ইভেন্ট ব্রাউজার ও সার্ভার উভয় দিক থেকে Event ID ডিডুপ্লিকেশন সহ পাঠানো হবে।
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.meta.capiEnabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, meta: { ...prev.meta, capiEnabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Test & Actions Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["meta"]?.loading}
              onClick={() => runPlatformTest("meta", {
                pixelId: config.meta.pixelId,
                accessToken: config.meta.accessToken,
                testEventCode: config.meta.testEventCode
              })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["meta"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> মেটা কানেকশন যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Test Meta API Connection
                </>
              )}
            </button>

            {testResults["meta"] && !testResults["meta"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResults["meta"].success
                  ? testResults["meta"].warning
                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {testResults["meta"].success ? (
                  testResults["meta"].warning ? <AlertCircle size={16} className="text-yellow-600 shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{testResults["meta"].message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TikTok Ads Panel */}
      {/* ========================================================================= */}
      {activeTab === "tiktok" && (
        <div key="panel-tiktok" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[#26225a]" />
                <h4 className="text-lg font-black text-gray-900">TikTok Ads Integration</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                TikTok Pixel ও TikTok Events API (Server-Side) ট্র্যাকিং কনফিগার করুন।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tiktok.enabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tiktok: { ...prev.tiktok, enabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-black ${config.tiktok.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.tiktok.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                TikTok Pixel ID <span className="text-red-500">*</span>
              </label>
              <input
                id="tiktok-pixel-id"
                name="tiktok_pixel_id"
                type="text"
                value={config.tiktok.pixelId}
                onChange={(e) => setConfig((prev) => ({ ...prev, tiktok: { ...prev.tiktok, pixelId: e.target.value } }))}
                placeholder="e.g. C1234567890ABCDEFG"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                TikTok Ads Manager &gt; Assets &gt; Events &gt; Web Events থেকে Pixel ID।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                TikTok Test Event Code (ঐচ্ছিক)
              </label>
              <input
                id="tiktok-test-event-code"
                name="tiktok_test_event_code"
                type="text"
                value={config.tiktok.testEventCode || ""}
                onChange={(e) => setConfig((prev) => ({ ...prev, tiktok: { ...prev.tiktok, testEventCode: e.target.value } }))}
                placeholder="e.g. TESTXXXXX"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                TikTok Test Events ডায়াগনস্টিকের জন্য টেস্ট কোড।
              </p>
            </div>

            <SecretTokenField
              fieldId="tiktok_events_access_token"
              label="TikTok Events API Access Token"
              required
              value={config.tiktok.accessToken}
              hasSavedToken={!!config.tiktok.hasAccessToken}
              maskedPreview={config.tiktok.maskedAccessToken}
              isMarkedForClear={!!config.tiktok.clearAccessToken}
              placeholderNew="TikTok Events API Access Token পেস্ট করুন"
              onChangeValue={(next) =>
                setConfig((prev) => ({
                  ...prev,
                  tiktok: { ...prev.tiktok, accessToken: next },
                }))
              }
              onToggleClear={(clear) =>
                setConfig((prev) => ({
                  ...prev,
                  tiktok: { ...prev.tiktok, clearAccessToken: clear },
                }))
              }
            />

            <div className="md:col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-900">TikTok Events API (Server-Side) সক্রিয় রাখবেন?</p>
                <p className="text-[11px] text-gray-500 font-medium">
                  iOS ও ad-blocker গ্রাহকদের কনভার্সন সঠিকভাবে ট্র্যাক করতে সার্ভার-সাইড ইভেন্ট ফায়ার করা হবে।
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.tiktok.eventsApiEnabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tiktok: { ...prev.tiktok, eventsApiEnabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#26225a]"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["tiktok"]?.loading}
              onClick={() => runPlatformTest("tiktok", {
                pixelId: config.tiktok.pixelId,
                accessToken: config.tiktok.accessToken,
                testEventCode: config.tiktok.testEventCode
              })}
              className="px-5 py-2.5 bg-[#26225a] hover:bg-[#1a1740] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#26225a]/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["tiktok"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> টিকটক কানেকশন যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Test TikTok API Connection
                </>
              )}
            </button>

            {testResults["tiktok"] && !testResults["tiktok"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResults["tiktok"].success
                  ? testResults["tiktok"].warning
                    ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {testResults["tiktok"].success ? (
                  testResults["tiktok"].warning ? <AlertCircle size={16} className="text-yellow-600 shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{testResults["tiktok"].message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Google Ads, GA4 & YouTube Panel */}
      {/* ========================================================================= */}
      {activeTab === "google" && (
        <div key="panel-google" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-red-500" />
                <h4 className="text-lg font-black text-gray-900">Google Ads, GA4 & YouTube Advertising</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Google Analytics 4 (GA4), Google Ads Conversion Tracking এবং Enhanced Conversions সেটআপ।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.google.enabled}
                  onChange={(e) => setConfig({ ...config, google: { ...config.google, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-black ${config.google.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.google.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                GA4 Measurement ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.google.ga4MeasurementId}
                onChange={(e) => setConfig({ ...config, google: { ...config.google, ga4MeasurementId: e.target.value } })}
                placeholder="e.g. G-90PDPQL0RJ"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Google Analytics 4 এর ডেটাস্ট্রিম মেজারমেন্ট আইডি।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Google Ads Conversion ID
              </label>
              <input
                type="text"
                value={config.google.googleAdsConversionId}
                onChange={(e) => setConfig({ ...config, google: { ...config.google, googleAdsConversionId: e.target.value } })}
                placeholder="e.g. AW-123456789"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Google Ads একাউন্টের কনভার্সন ট্র্যাকিং আইডি (AW-XXXXX)।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Google Ads Purchase Conversion Label
              </label>
              <input
                type="text"
                value={config.google.googleAdsConversionLabel}
                onChange={(e) => setConfig({ ...config, google: { ...config.google, googleAdsConversionLabel: e.target.value } })}
                placeholder="e.g. AbCdEfGhIjKlMnOpQr"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Google Ads-এ তৈরি করা Purchase কনভার্সন অ্যাকশনের লেবেল।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Google Tag Manager (GTM) Container ID (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={config.google.gtmContainerId || ""}
                onChange={(e) => setConfig({ ...config, google: { ...config.google, gtmContainerId: e.target.value } })}
                placeholder="e.g. GTM-XXXXXX"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                যদি সরাসরি GTM কন্টেইনার ব্যবহার করতে চান।
              </p>
            </div>

            {/* Enhanced Conversions Toggle */}
            <div className="md:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-emerald-900">Enhanced Conversions চালু রাখবেন?</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  চেকআউট সম্পন্ন হওয়ার পর গ্রাহকের ইমেইল ও ফোন নম্বর হ্যাশ করে Google Ads-এ পাঠিয়ে কনভার্সন নিখুঁত করা হয়।
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.google.enhancedConversions}
                  onChange={(e) => setConfig({ ...config, google: { ...config.google, enhancedConversions: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* YouTube Note */}
            <div className="md:col-span-2 bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
              <Info size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs text-red-800">
                <span className="font-bold">YouTube Advertising Note:</span> YouTube Ads ট্র্যাকিং আলাদা কোনো পিক্সেল ব্যবহার করে না। Google Ads Conversion ID এবং UTM প্যারামিটার (`utm_source=youtube`) ব্যবহারের মাধ্যমে এটি সরাসরি Central Tracking Engine-এ ক্যাপচার হবে।
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["google"]?.loading}
              onClick={() => runPlatformTest("google", {
                ga4MeasurementId: config.google.ga4MeasurementId,
                googleAdsConversionId: config.google.googleAdsConversionId,
                googleAdsConversionLabel: config.google.googleAdsConversionLabel,
                gtmContainerId: config.google.gtmContainerId
              })}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["google"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> গুগল কনফিগ যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Test Google Ads / GA4 Config
                </>
              )}
            </button>

            {testResults["google"] && !testResults["google"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResults["google"].success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {testResults["google"].success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{testResults["google"].message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WhatsApp Business Panel */}
      {/* ========================================================================= */}
      {activeTab === "whatsapp" && (
        <div key="panel-whatsapp" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-emerald-500" />
                <h4 className="text-lg font-black text-gray-900">WhatsApp Business Integration</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Click-to-WhatsApp ট্র্যাকিং এবং গ্রাহকের সাথে সরাসরি যোগাযোগ ব্যবস্থা কনফিগার করুন।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.whatsapp.enabled}
                  onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-black ${config.whatsapp.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.whatsapp.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                WhatsApp Business Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.whatsapp.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, whatsappNumber: e.target.value } })}
                placeholder="e.g. 01712345678"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                গ্রাহক যে নম্বরে চ্যাট শুরু করবেন। কান্ট্রি কোড সহ বা ছাড়া দেওয়া যাবে।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Default Inquiry Message Template
              </label>
              <textarea
                rows={3}
                value={config.whatsapp.defaultMessage || ""}
                onChange={(e) => setConfig({ ...config, whatsapp: { ...config.whatsapp, defaultMessage: e.target.value } })}
                placeholder="e.g. হ্যালো iShop BD, আমি আপনার ওয়েবসাইট থেকে পণ্য ক্রয় করতে চাই..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["whatsapp"]?.loading}
              onClick={() => runPlatformTest("whatsapp", {
                whatsappNumber: config.whatsapp.whatsappNumber,
                defaultMessage: config.whatsapp.defaultMessage
              })}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["whatsapp"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> হোয়াটসঅ্যাপ লিঙ্ক যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Test WhatsApp Link & Config
                </>
              )}
            </button>

            {testResults["whatsapp"] && !testResults["whatsapp"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-3 ${
                testResults["whatsapp"].success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {testResults["whatsapp"].success ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{testResults["whatsapp"].message}</span>
                    {testResults["whatsapp"].previewUrl && (
                      <a
                        href={testResults["whatsapp"].previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto text-emerald-700 underline font-bold flex items-center gap-1 hover:text-emerald-900"
                      >
                        <ExternalLink size={13} /> ওপেন করুন
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600 shrink-0" />
                    <span>{testResults["whatsapp"].message}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. IMO Campaign Tracking Panel */}
      {/* ========================================================================= */}
      {activeTab === "imo" && (
        <div key="panel-imo" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Send size={20} className="text-sky-500" />
                <h4 className="text-lg font-black text-gray-900">IMO Marketing & Campaign Tracking</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                IMO থেকে আসা ভিজিটর, অর্ডার ও রেভিনিউ শনাক্ত করার জন্য ডায়নামিক ক্যাম্পেইন ট্র্যাকিং।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.imo.enabled}
                  onChange={(e) => setConfig({ ...config, imo: { ...config.imo, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span className={`text-xs font-black ${config.imo.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                {config.imo.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          {/* Special Clarification Notice */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 flex items-start gap-3">
            <Info size={18} className="text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-900 space-y-1">
              <p className="font-bold">বাস্তবমুখী প্রযুক্তিগত সতর্কতা (Official IMO Reality):</p>
              <p className="text-sky-800 leading-relaxed font-normal">
                IMO-এর কোনো অফিসিয়াল পাবলিক Ads API বা Server-Side CAPI উপলব্ধ নেই। কোনো সিস্টেম যদি IMO API দাবি করে তবে তা ভুয়া। iShop BD-তে IMO থেকে আসা ট্রাফিক ও বিক্রয় ট্র্যাক করার জন্য আমরা ডেডিকেটেড <strong>Campaign Source Attribution</strong> এবং <strong>IMO In-App Browser Detection</strong> ব্যবহার করছি।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                IMO Campaign Source Parameter
              </label>
              <input
                type="text"
                value={config.imo.campaignSource}
                onChange={(e) => setConfig({ ...config, imo: { ...config.imo, campaignSource: e.target.value } })}
                placeholder="imo"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                URL-এ `utm_source` এর মান হিসেবে এটি ব্যবহৃত হবে (Default: `imo`)।
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Default Medium
              </label>
              <input
                type="text"
                value={config.imo.defaultMedium}
                onChange={(e) => setConfig({ ...config, imo: { ...config.imo, defaultMedium: e.target.value } })}
                placeholder="social_chat"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                Default: `social_chat` বা `direct_message`।
              </p>
            </div>

            {/* Interactive IMO Campaign Link Generator */}
            <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <Share2 size={15} className="text-sky-600" /> IMO Campaign Link Generator
                </h5>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                  রেডিমেড ট্র্যাকিং লিঙ্ক
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                  ক্যাম্পেইনের নাম লিখুন (e.g. winter_jacket, wireless_mic, eid_offer):
                </label>
                <input
                  type="text"
                  value={imoCampaignInput}
                  onChange={(e) => setImoCampaignInput(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="winter_collection_2026"
                  className="w-full bg-white border border-gray-300 rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              {(() => {
                const generatedUrl = `https://ishopbd.com/?utm_source=${encodeURIComponent(
                  config.imo.campaignSource || "imo"
                )}&utm_medium=${encodeURIComponent(
                  config.imo.defaultMedium || "social_chat"
                )}&utm_campaign=${encodeURIComponent(imoCampaignInput || "general")}`;

                return (
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-mono text-gray-700 truncate max-w-xl">
                      {generatedUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedUrl)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      {copiedLink ? "কপি হয়েছে!" : "কপি লিঙ্ক"}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["imo"]?.loading}
              onClick={() => runPlatformTest("imo", {
                campaignSource: config.imo.campaignSource,
                defaultMedium: config.imo.defaultMedium
              })}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["imo"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> ট্র্যাকিং ইঞ্জিন যাচাই হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Validate IMO Tracking Config
                </>
              )}
            </button>

            {testResults["imo"] && !testResults["imo"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResults["imo"].success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{testResults["imo"].message}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. OpenAI / ChatGPT Panel */}
      {/* ========================================================================= */}
      {activeTab === "openai" && (
        <div key="panel-openai" className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-purple-600" />
                <h4 className="text-lg font-black text-gray-900">OpenAI / AI Marketing Engine</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                ভবিষ্যৎ AI Marketing Assistant, স্মার্ট অ্যাড কপিরাইটিং ও কাস্টমার ইনসাইটের জন্য সুরক্ষিত API Key।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-600">প্ল্যাটফর্ম স্ট্যাটাস:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.openAi.enabled}
                  onChange={(e) => setConfig({ ...config, openAi: { ...config.openAi, enabled: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
              <span className={`text-xs font-black ${config.openAi.enabled ? "text-purple-600" : "text-gray-400"}`}>
                {config.openAi.enabled ? "সক্রিয় (Enabled)" : "নিষ্ক্রিয় (Disabled)"}
              </span>
            </div>
          </div>

          {/* Clarification Alert */}
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-start gap-3">
            <Info size={18} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 space-y-1">
              <p className="font-bold">গুরুত্বপূর্ণ সতর্কতা (No Advertising Myth):</p>
              <p className="text-purple-800 leading-relaxed font-normal">
                OpenAI বা ChatGPT কোনো বিজ্ঞাপন নেটওয়ার্ক নয় এবং এতে বিজ্ঞাপন চালানোর কোনো API নেই। এই API Key কেবলমাত্র অনুমোদিত AI ফিচারের জন্য (যেমন: মার্কেটিং টেক্সট তৈরি, ফেসবুক অ্যাডের কপিরাইটিং সহায়তা ও ডেটা সামারি) ব্যবহৃত হবে।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SecretTokenField
              fieldId="openai_secret_api_key"
              label="OpenAI API Key"
              required
              value={config.openAi.apiKey}
              hasSavedToken={!!config.openAi.hasApiKey}
              maskedPreview={config.openAi.maskedApiKey}
              isMarkedForClear={!!config.openAi.clearApiKey}
              placeholderNew="sk-... পেস্ট করুন"
              helperText="https://platform.openai.com/api-keys থেকে আপনার সিক্রেট Key সংগ্রহ করুন।"
              onChangeValue={(next) =>
                setConfig((prev) => ({
                  ...prev,
                  openAi: { ...prev.openAi, apiKey: next },
                }))
              }
              onToggleClear={(clear) =>
                setConfig((prev) => ({
                  ...prev,
                  openAi: { ...prev.openAi, clearApiKey: clear },
                }))
              }
            />

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                AI Model Selection
              </label>
              <select
                value={config.openAi.model || "gpt-4o-mini"}
                onChange={(e) => setConfig((prev) => ({ ...prev, openAi: { ...prev.openAi, model: e.target.value } }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (সুপার ফাস্ট ও কস্ট-এফিসিয়েন্ট - Recommended)</option>
                <option value="gpt-4o">gpt-4o (হাই-পারফরম্যান্স মাল্টিমডাল)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (লেগ্যাসি)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              type="button"
              disabled={testResults["openai"]?.loading}
              onClick={() => runPlatformTest("openai", {
                apiKey: config.openAi.apiKey,
                model: config.openAi.model
              })}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {testResults["openai"]?.loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> OpenAI কানেকশন টেস্ট হচ্ছে...
                </>
              ) : (
                <>
                  <Zap size={14} /> Test OpenAI API Connection
                </>
              )}
            </button>

            {testResults["openai"] && !testResults["openai"].loading && (
              <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                testResults["openai"].success
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {testResults["openai"].success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{testResults["openai"].message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
