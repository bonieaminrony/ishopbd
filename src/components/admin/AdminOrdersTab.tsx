import React from 'react';
import { orderStatusChip, orderStatusCard, orderStatusRow, ORDER_STATUSES, ORDER_STATUS_LABEL } from './orderTone';
import IncompleteOrderModal, { CompleteIncompleteOrderPayload } from './IncompleteOrderModal';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ban,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  History,
  Landmark,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Printer,
  Receipt,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Truck,
  X,
  StickyNote,
} from 'lucide-react';
import {
  formatSafeDateTime,
  formatWhatsAppUrl,
  getCourierReportForPhone,
  getOrderCourierRateDisplay,
  getOrderItemsSafe,
  isPhoneLoadingInRecord,
  resolveCourierBadgeDisplay,
} from '../../utils/courierDisplay';

export interface AdminOrdersTabProps {
  orderHistory: any[];
  filteredOrders: any[];
  reportTimeframe: string;
  setReportTimeframe: (tf: string) => void;
  selectedOrderStatusFilter: string;
  setSelectedOrderStatusFilter: (status: string) => void;
  adminStartDate: string;
  setAdminStartDate: (val: string) => void;
  adminEndDate: string;
  setAdminEndDate: (val: string) => void;
  adminOrderAreaFilter: string;
  setAdminOrderAreaFilter: (area: string) => void;
  orderSearchQuery: string;
  setOrderSearchQuery: (q: string) => void;
  syncAllCourierStatuses?: (force?: boolean) => void;
  isSyncingCourier?: boolean;
  exportDropdownRef: React.RefObject<HTMLDivElement>;
  isExportDropdownOpen: boolean;
  setIsExportDropdownOpen: (open: boolean) => void;
  exportOrdersToCSV: (range: string) => void;
  adminOrdersLimit: number;
  setAdminOrdersLimit: React.Dispatch<React.SetStateAction<number>>;
  getOrderLocalDateString: (order: any) => any;
  formatOrderGroupDate: (date: any) => string;
  setSelectedOrderForDetails: (order: any) => void;
  handleSelectOrder: (e: any, id: string) => void;
  handleSelectAll: (e: any) => void;
  selectedOrderIds: any;
  handleQuickEditOrderItems: (order: any) => void;
  getCustomerStats: (phone: string) => { total: number; delivered: number; cancelled: number };
  handleUpdateOrderStatus: (id: string, status: string) => void;
  handleUpdatePaymentMethod: (id: string, method: string) => void;
  syncSingleCourierStatus?: (orderId: string) => void;
  syncingOrderId?: string | null;
  quickEditOrderId: string | null;
  setQuickEditOrderId: (id: string | null) => void;
  quickEditData: any;
  setQuickEditData: (data: any) => void;
  handleSaveQuickEdit: () => void;
  courierReports: Record<string, any>;
  loadingCourierReports: Record<string, boolean>;
  checkCourierReport: (phone: string, forceRefresh?: boolean) => void;
  setCourierModalPhone: (phone: string) => void;
  setIsCourierHistoryModalOpen: (open: boolean) => void;
  individualSmsOrder: any;
  setIndividualSmsOrder: (order: any) => void;
  siteConfig: any;
  individualSmsMessage: string;
  setIndividualSmsMessage: (msg: string) => void;
  handleSendIndividualSms: () => void;
  isSendingIndividualSms: boolean;
  setCompletedOrderReceipt: (order: any) => void;
  sendToCourier: (order: any) => void;
  handlePrintInvoice: (order: any) => void;
  onBulkPrintStickers?: () => void;
  toggleBlacklist: (phone: string) => void;
  blacklist: string[];
  deleteOrder: (id: string) => void;
  /** Create Order (orders taken by phone). Shown only when these are passed. */
  products?: any[];
  getProductPrice?: (product: any, qty: number) => number;
  onCreateOrder?: (draft: any, payload: CompleteIncompleteOrderPayload) => Promise<void>;
}

function resolveCourierPortalUrl(service: string, trackId?: string): string | null {
  const svc = service.toLowerCase();
  const cleanTrack = (trackId || '').trim();
  if (svc.includes('steadfast') && cleanTrack) {
    return `https://steadfast.com.bd/t/${encodeURIComponent(cleanTrack)}`;
  }
  if (svc.includes('pathao')) {
    return 'https://merchant.pathao.com/';
  }
  return null;
}

function getCourierBadgeClass(rawStatus?: string): string {
  const lower = String(rawStatus || '').toLowerCase();
  if (lower.includes('delivered') && !lower.includes('partial')) {
    return 'bg-emerald-100/90 text-emerald-700 border-emerald-200';
  }
  if (lower.includes('cancel') || lower.includes('return') || lower.includes('fail')) {
    return 'bg-rose-100/90 text-rose-700 border-rose-200';
  }
  if (
    lower.includes('transit') ||
    lower.includes('picked') ||
    lower.includes('ongoing') ||
    lower.includes('assign') ||
    lower === 'shipped'
  ) {
    return 'bg-sky-100/90 text-sky-800 border-sky-200';
  }
  return 'bg-amber-100/90 text-amber-800 border-amber-200';
}

function getCourierDisplayMeta(order: any) {
  const safeOrder = order && typeof order === 'object' ? order : {};
  const cConsignment = String(
    safeOrder.courierConsignmentId || safeOrder.couriers?.consignmentId || ''
  ).trim();
  const explicitTrack = String(
    safeOrder.couriers?.trackingId || safeOrder.courierTrackingId || ''
  ).trim();
  const legacyTrack = String(safeOrder.trackingId || '').trim();
  const isOfflineOrder = String(safeOrder.orderId || '').trim().toUpperCase().startsWith('OFFLINE-');
  const cTrackCode =
    explicitTrack ||
    (!cConsignment && (isOfflineOrder || legacyTrack.startsWith('#')) ? '' : legacyTrack);
  const cTrack = cTrackCode || cConsignment;
  const cStatus = safeOrder.courierStatus || safeOrder.steadfastStatus || safeOrder.pathaoStatus;
  const cLabel = safeOrder.courierStatusLabel || cStatus;
  const isDispatched = Boolean(cTrack || cStatus || safeOrder.status === 'shipped');
  const serviceName =
    safeOrder.courierName || safeOrder.couriers?.service || (safeOrder.pathaoStatus ? 'Pathao' : 'Steadfast');
  const canSync = Boolean(
    cTrack ||
      String(serviceName || '').toLowerCase().includes('steadfast') ||
      safeOrder.status === 'shipped'
  );
  const { badgeText, hubName, isNotBooked } = resolveCourierBadgeDisplay({
    isDispatched,
    courierStatus: cStatus,
    courierStatusLabel: cLabel,
    courierStatusNormalized: safeOrder.courierStatusNormalized,
    courierHub: safeOrder.courierHub,
    courierTrackingMessage: safeOrder.courierTrackingMessage || safeOrder.courierStatusDetail,
  });
  const badgeCls = getCourierBadgeClass(cStatus || (isDispatched ? 'pending_pickup' : ''));
  const portalUrl = resolveCourierPortalUrl(serviceName, cTrack);
  const syncedText = formatSafeDateTime(safeOrder.courierLastSyncedAt, 'bn-BD');
  const syncTimeNote = syncedText ? ` | Last synced: ${syncedText}` : '';
  const trackingMsgText =
    typeof safeOrder.courierTrackingMessage === 'string'
      ? safeOrder.courierTrackingMessage.trim()
      : '';
  const statusDetailText =
    typeof safeOrder.courierStatusDetail === 'string'
      ? safeOrder.courierStatusDetail.trim()
      : '';
  const detailText = trackingMsgText || statusDetailText;
  const statusPrefix = cLabel && String(cLabel).toLowerCase() !== badgeText.toLowerCase() ? `${cLabel} • ` : '';
  const tooltip = `${statusPrefix}${detailText || serviceName}${syncTimeNote}`.trim();
  const hasDistinctDetail =
    Boolean(trackingMsgText) &&
    trackingMsgText.toLowerCase() !== String(cLabel || '').toLowerCase() &&
    trackingMsgText.toLowerCase() !== badgeText.toLowerCase();

  return {
    cConsignment,
    cTrackCode,
    cTrack,
    cStatus,
    cLabel,
    badgeText,
    hubName,
    isNotBooked,
    trackingMsgText,
    isDispatched,
    serviceName,
    canSync,
    badgeCls,
    portalUrl,
    tooltip,
    hasDistinctDetail,
  };
}

/**
 * Shop-only note on an order that is not booked yet: the reason for a cancel, "will take it in
 * 7 days", and so on. Stored as `internalNote`, never sent to the courier (booking uses `note`),
 * and hidden once the order is booked with a courier.
 */
function InternalOrderNote({ order, compact = false }: { order: any; compact?: boolean }) {
  const saved = typeof order?.internalNote === 'string' ? order.internalNote : '';
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(saved);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (!editing) setDraft(saved);
  }, [saved, editing]);

  const save = async () => {
    const text = draft.trim().slice(0, 500);
    if (text === saved.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'orders', String(order.id)), {
        internalNote: text,
        internalNoteUpdatedAt: Date.now(),
      });
      setEditing(false);
      toast.success(text ? 'নোট সেভ হয়েছে' : 'নোট মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Internal note save failed', err);
      toast.error('নোট সেভ হয়নি, আবার চেষ্টা করুন');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="w-full space-y-1.5" onClick={(e) => e.stopPropagation()}>
        <textarea
          autoFocus
          rows={3}
          maxLength={500}
          value={draft}
          aria-label="Order note"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(saved);
              setEditing(false);
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="যেমন: ৭ দিন পরে নেবে, বা ক্যান্সেলের কারণ"
          className="w-full text-[11px] leading-snug bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setEditing(false);
            }}
            className="h-7 px-2.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            বাতিল
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="h-7 px-2.5 rounded-md text-[10px] font-bold bg-gray-100 text-primary border border-gray-200 hover:bg-gray-200 disabled:opacity-60 flex items-center gap-1"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            সেভ
          </button>
        </div>
      </div>
    );
  }

  if (saved.trim()) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        title={`নোট (শুধু আপনি দেখবেন, কুরিয়ারে যাবে না):\n${saved}\n\nএডিট করতে ক্লিক করুন`}
        className={`w-full text-left tone-neutral tone-chip px-2 py-1.5 flex items-start gap-1.5 transition ${compact ? 'text-[11px]' : 'text-[10.5px]'}`}
      >
        <StickyNote size={11} className="shrink-0 mt-[1px] text-primary" />
        <span className={`font-semibold text-gray-700 leading-snug break-words ${compact ? 'line-clamp-3' : 'line-clamp-2'}`}>{saved}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title="শুধু আপনার জন্য নোট (কুরিয়ারে যাবে না)"
      className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-primary transition-colors"
    >
      <Plus size={11} /> Add note
    </button>
  );
}

/** Small, calm "not booked yet" label. */
function NotBookedLabel({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="এখনো কুরিয়ারে বুক হয়নি (পাঠাতে ডানদিকের ⋮ মেনু ব্যবহার করুন)"
      className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 text-[10px] font-bold transition-colors cursor-pointer"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Not booked
    </button>
  );
}

function OrderCourierBadge({
  order,
  compact = false,
  syncSingleCourierStatus,
  syncingOrderId,
  onOpenDetails,
}: {
  order: any;
  compact?: boolean;
  syncSingleCourierStatus?: (orderId: string) => void;
  syncingOrderId?: string | null;
  onOpenDetails?: () => void;
}) {
  const {
    cConsignment,
    cTrackCode,
    cTrack,
    badgeText,
    hubName,
    trackingMsgText,
    isDispatched,
    serviceName,
    canSync,
    badgeCls,
    portalUrl,
    tooltip,
    hasDistinctDetail,
  } = getCourierDisplayMeta(order);
  if (!isDispatched) {
    return (
      <div
        className={compact ? 'pt-2 border-t border-gray-100/80 space-y-1.5' : 'mt-1.5 space-y-1.5'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <NotBookedLabel onClick={onOpenDetails} />
        </div>
        <InternalOrderNote order={order} compact={compact} />
      </div>
    );
  }

  const mobileTrackText = cTrackCode || (cConsignment ? '' : cTrack);

  const courierHistoryList: any[] = Array.isArray(order.courierHistory)
    ? order.courierHistory.filter((item: any) => item && typeof item === 'object')
    : [];
  const latestHistoryNote = [...courierHistoryList].reverse().find(
    (entry: any) => typeof entry?.message === 'string' && entry.message.trim()
  )?.message?.trim();
  const latestCourierNote =
    trackingMsgText ||
    latestHistoryNote ||
    (typeof order.courierStatusDetail === 'string' && order.courierStatusDetail.trim()) ||
    '';
  const allNotesWithMessages = courierHistoryList.filter(
    (entry: any) => typeof entry?.message === 'string' && entry.message.trim()
  );
  const hasMultipleNotes = allNotesWithMessages.length > 1;
  const pastNotesCount = Math.max(0, allNotesWithMessages.length - 1);
  const isAlertNote =
    Boolean(latestCourierNote) &&
    /not\s*(answer|pick|reach|contact|receive)|ফোন\s*(ধরে\s*না|বন্ধ|রিসিভ)|ব্যস্ত|হোল্ড|hold|fail|cancel|reject|return|address/i.test(
      latestCourierNote
    );

  return (
    <div
      className={compact ? 'pt-1 border-t border-gray-100/80 space-y-1' : 'mt-1.5 space-y-1'}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {cConsignment && (
            <span className="text-[10px] font-bold text-sky-600">#{cConsignment}</span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit uppercase tracking-wide ${badgeCls}`}
            title={tooltip || undefined}
          >
            {hubName && badgeText.toLowerCase().includes(hubName.toLowerCase()) ? (
              <MapPin size={10} className="shrink-0" />
            ) : (
              <Truck size={10} className="shrink-0" />
            )}
            <span className="truncate max-w-[190px]">
              {serviceName}: {badgeText}
            </span>
          </span>
          {mobileTrackText && (
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[130px]">
              {mobileTrackText}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {syncSingleCourierStatus && canSync && (
            <button
              type="button"
              disabled={syncingOrderId === order.id}
              onClick={(e) => {
                e.stopPropagation();
                syncSingleCourierStatus(order.id);
              }}
              className={
                compact
                  ? 'p-1 rounded-lg bg-white border border-gray-200 text-sky-600 hover:bg-sky-50 shrink-0'
                  : 'text-sky-600 hover:text-sky-800 p-0.5 rounded hover:bg-sky-50 transition-colors cursor-pointer'
              }
              title="Live Courier Status সিঙ্ক করুন"
            >
              <RefreshCcw size={11} className={syncingOrderId === order.id ? 'animate-spin' : ''} />
            </button>
          )}
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={
                compact
                  ? 'p-1 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-sky-600 shrink-0'
                  : 'text-gray-400 hover:text-sky-600 p-0.5 rounded hover:bg-sky-50 transition-colors'
              }
              title="কুরিয়ার ওয়েবসাইটে লাইভ ট্র্যাকিং দেখুন"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Prominent Latest Courier / Rider Note */}
      {latestCourierNote && (
        <button
          type="button"
          onClick={() => onOpenDetails?.()}
          className={`w-full text-left flex items-start gap-1.5 p-1.5 rounded-lg border text-[10px] font-bold transition-all hover:brightness-95 active:scale-[0.99] cursor-pointer ${
            isAlertNote
              ? 'bg-amber-50/90 text-amber-900 border-amber-300 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="ক্লিক করে সকল কুরিয়ার মুভমেন্ট ও পূর্বের নোট দেখুন"
        >
          <span className="shrink-0 text-xs">📝</span>
          <div className="flex-1 min-w-0">
            <p className="truncate leading-tight font-black">{latestCourierNote}</p>
            {hasMultipleNotes && (
              <span className="text-[9px] text-sky-700 font-bold block mt-0.5">
                +{pastNotesCount}টি পূর্বের নোট দেখুন ↗
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
}

export default function AdminOrdersTab({
  orderHistory,
  filteredOrders,
  reportTimeframe,
  setReportTimeframe,
  selectedOrderStatusFilter,
  setSelectedOrderStatusFilter,
  adminStartDate,
  setAdminStartDate,
  adminEndDate,
  setAdminEndDate,
  adminOrderAreaFilter,
  setAdminOrderAreaFilter,
  orderSearchQuery,
  setOrderSearchQuery,
  syncAllCourierStatuses,
  isSyncingCourier,
  exportDropdownRef,
  isExportDropdownOpen,
  setIsExportDropdownOpen,
  exportOrdersToCSV,
  adminOrdersLimit,
  setAdminOrdersLimit,
  getOrderLocalDateString,
  formatOrderGroupDate,
  setSelectedOrderForDetails,
  handleSelectOrder,
  handleSelectAll,
  selectedOrderIds,
  handleQuickEditOrderItems,
  getCustomerStats,
  handleUpdateOrderStatus,
  handleUpdatePaymentMethod,
  syncSingleCourierStatus,
  syncingOrderId,
  quickEditOrderId,
  setQuickEditOrderId,
  quickEditData,
  setQuickEditData,
  handleSaveQuickEdit,
  courierReports,
  loadingCourierReports,
  checkCourierReport,
  setCourierModalPhone,
  setIsCourierHistoryModalOpen,
  individualSmsOrder,
  setIndividualSmsOrder,
  siteConfig,
  individualSmsMessage,
  setIndividualSmsMessage,
  handleSendIndividualSms,
  isSendingIndividualSms,
  setCompletedOrderReceipt,
  sendToCourier,
  handlePrintInvoice,
  onBulkPrintStickers,
  toggleBlacklist,
  blacklist,
  deleteOrder,
  products = [],
  getProductPrice,
  onCreateOrder,
}: AdminOrdersTabProps) {
  // A blank draft opens the Create Order form; it is never saved as an incomplete order.
  const [createDraft, setCreateDraft] = React.useState<any | null>(null);
  const openCreateOrder = () =>
    setCreateDraft({ id: `new_${Date.now()}`, __createdByAdmin: true, items: [], name: '', phone: '', address: '', district: '' });
  return (
    <div className="space-y-6">
      {/* Dashboard Analytics */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-secondary">Analytics Report</h4>
        <select
          value={reportTimeframe}
          onChange={(e) => setReportTimeframe(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
        >
          <option value="28d">Last 28 Days</option>
          {(() => {
            const months = [];
            for (let i = 1; i <= 3; i++) {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              months.push(
                <option key={`month_${i}`} value={`month_${d.getMonth()}_${d.getFullYear()}`}>
                  {d.toLocaleString('en-US', { month: 'long' })} {d.getFullYear()}
                </option>
              );
            }
            return months;
          })()}
          <option value="1y">1 Year</option>
          <option value="3y">3 Years</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        {(() => {
          const safeOrders = Array.isArray(orderHistory) ? orderHistory : [];
          const activeOrders = safeOrders.filter((o: any) => o && !o.deleted);
          const getCreatedAtMs = (createdAt: any): number => {
            if (!createdAt) return 0;
            if (typeof createdAt === 'string') {
              const t = new Date(createdAt).getTime();
              return Number.isNaN(t) ? 0 : t;
            }
            if (typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
              return createdAt.toDate().getTime();
            }
            if (typeof createdAt === 'object' && typeof createdAt.seconds === 'number') {
              return createdAt.seconds * 1000;
            }
            return 0;
          };
          let filteredForAnalytics = activeOrders;
          const now = new Date();
          if (reportTimeframe === '28d') {
            const cutoff = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
            filteredForAnalytics = activeOrders.filter((o: any) => getCreatedAtMs(o.createdAt) >= cutoff.getTime());
          } else if (reportTimeframe === '1y') {
            const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            filteredForAnalytics = activeOrders.filter((o: any) => getCreatedAtMs(o.createdAt) >= cutoff.getTime());
          } else if (reportTimeframe === '3y') {
            const cutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
            filteredForAnalytics = activeOrders.filter((o: any) => getCreatedAtMs(o.createdAt) >= cutoff.getTime());
          } else if (reportTimeframe.startsWith('month_')) {
            const parts = reportTimeframe.split('_');
            const targetMonth = parseInt(parts[1], 10);
            const targetYear = parseInt(parts[2], 10);
            filteredForAnalytics = activeOrders.filter((o: any) => {
              const ms = getCreatedAtMs(o.createdAt);
              if (!ms) return false;
              const d = new Date(ms);
              return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
            });
          }
          const totalOrders = filteredForAnalytics.length;
          const pendingOrders = filteredForAnalytics.filter((o) => o.status === 'pending').length;
          const deliveredOrders = filteredForAnalytics.filter((o) => o.status === 'delivered').length;
          const totalSales = filteredForAnalytics
            .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
            .reduce((acc, o) => acc + (Number(o?.total) || 0), 0);
          const successRate =
            totalOrders > 0 ? Math.round((deliveredOrders / (totalOrders - pendingOrders || 1)) * 100) : 0;

          return (
            <>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <ShoppingBag size={14} /> <span className="text-[11px] font-bold">Total Orders</span>
                </div>
                <span className="text-2xl font-bold text-secondary">{totalOrders}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={14} /> <span className="text-[11px] font-bold">Pending Orders</span>
                </div>
                <span className="text-2xl font-bold text-orange-500">{pendingOrders}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <TrendingUp size={14} /> <span className="text-[11px] font-bold">Total Sales</span>
                </div>
                <span className="text-2xl font-bold text-primary">৳{totalSales.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <CheckCircle size={14} /> <span className="text-[11px] font-bold">Success Rate</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`text-xl font-bold ${successRate >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {successRate}%
                  </span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${successRate >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(successRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Recent Orders — title, status tabs, then toolbar */}
      <div className="mt-6 mb-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
            <History size={20} className="text-primary" />
            Recent Orders
          </h4>
          {onCreateOrder && (
            <button
              type="button"
              onClick={openCreateOrder}
              className="h-10 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all shrink-0"
            >
              <Plus size={16} />
              Create Order
            </button>
          )}
        </div>

        <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/40 min-w-max">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'returned', label: 'Returned' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOrderStatusFilter(tab.id)}
                className={`h-8 px-3.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedOrderStatusFilter === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-secondary hover:bg-white/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
          <div className="col-span-2 flex items-center gap-2 lg:col-span-1">
            <input
              type="date"
              value={adminStartDate}
              onChange={(e) => setAdminStartDate(e.target.value)}
              className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/40 flex-1 min-w-0 lg:w-[140px] lg:flex-none"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={adminEndDate}
              onChange={(e) => setAdminEndDate(e.target.value)}
              className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/40 flex-1 min-w-0 lg:w-[140px] lg:flex-none"
            />
          </div>
          <select
            value={adminOrderAreaFilter}
            onChange={(e) => setAdminOrderAreaFilter(e.target.value)}
            className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="all">All Areas</option>
            <option value="inside">Inside Dhaka</option>
            <option value="outside">Outside Dhaka</option>
          </select>
          <div className="relative col-span-2 order-first lg:order-none lg:flex-1 lg:min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Phone, Order ID or Tracking ID..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="h-10 bg-white border border-gray-200 rounded-xl px-3 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary/40 w-full pl-10 pr-9"
            />
            {orderSearchQuery && (
              <button
                onClick={() => setOrderSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {syncAllCourierStatuses && (
            <button
              type="button"
              disabled={isSyncingCourier}
              onClick={() => syncAllCourierStatuses(false)}
              title="Steadfast ও Pathao থেকে সব অ্যাক্টিভ অর্ডারের ডেলিভারি স্ট্যাটাস সিঙ্ক করুন"
              className="h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCcw size={15} className={isSyncingCourier ? 'animate-spin' : ''} />
              {isSyncingCourier ? 'Syncing...' : 'Sync Courier'}
            </button>
          )}
          {Array.isArray(selectedOrderIds) && selectedOrderIds.length > 0 && onBulkPrintStickers && (
            <button
              type="button"
              onClick={onBulkPrintStickers}
              title="সিলেক্ট করা অর্ডারগুলোর পার্সেল স্টিকার প্রিন্ট করুন"
              className="h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              <Printer size={15} />
              Stickers ({selectedOrderIds.length})
            </button>
          )}
          <div className="relative font-sans col-span-2 lg:col-span-1" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="h-10 w-full px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-primary text-white shadow-sm hover:opacity-90 transition-all"
            >
              <Landmark size={16} /> Excel Export <ChevronDown size={14} />
            </button>
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-[999] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    exportOrdersToCSV('daily');
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Today's Report
                </button>
                <button
                  onClick={() => {
                    exportOrdersToCSV('weekly');
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Last 7 Days Report
                </button>
                <button
                  onClick={() => {
                    exportOrdersToCSV('monthly');
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Download size={14} /> Last 30 Days Report
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    exportOrdersToCSV('all');
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <Landmark size={14} /> Export All Orders
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-2.5">
        {(() => {
          let lastDateText = '';
          const safeFiltered = Array.isArray(filteredOrders) ? filteredOrders : [];
          return safeFiltered.slice(0, adminOrdersLimit).map((order: any) => {
            if (!order) return null;
            const orderItems = getOrderItemsSafe(order);
            const orderDateVal = getOrderLocalDateString(order);
            const dateText = formatOrderGroupDate(orderDateVal) || '';
            const isNewDateGroup = dateText !== lastDateText;
            if (isNewDateGroup) {
              lastDateText = dateText;
            }
            const isToday = dateText.startsWith('Today');
            return (
              <React.Fragment key={order.id}>
                {isNewDateGroup && (
                  <div className="flex items-center gap-2 pt-3 pb-1 px-0.5 first:pt-0">
                    {isToday ? <Calendar size={13} className="text-primary" /> : <Clock size={13} className="text-gray-400" />}
                    <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-gray-500'}`}>{dateText}</span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>
                )}
                {/* Phone order card: one tidy block per order, status shown by a light tint + left edge */}
                <div
                  onClick={() => setSelectedOrderForDetails(order)}
                  className={`${orderStatusCard(order.status)} rounded-xl p-3 flex flex-col gap-2.5 cursor-pointer active:scale-[0.995] transition-transform`}
                >
                  {/* Row 1: photo + products + price */}
                  <div className="flex gap-3 items-start">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        loading="lazy"
                        src={orderItems[0]?.variantImage || orderItems[0]?.product?.image || '/logo.png'}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(e as any, order.id);
                        }}
                        className="absolute top-1 left-1 w-5 h-5 rounded-[5px] bg-black/55 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                        aria-label="Select order"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded-[3px] accent-[var(--color-primary)] pointer-events-none"
                          checked={Array.isArray(selectedOrderIds) && selectedOrderIds.includes(order.id)}
                          onChange={() => {}}
                          tabIndex={-1}
                        />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">
                        {orderItems.length > 0
                          ? orderItems
                              .map((i: any) => `${i?.product?.name || i?.name || 'Unknown'} ×${i?.quantity || 1}`)
                              .join(', ')
                          : 'No items'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 price-num">
                        #{String(order.displayId || order.id).slice(-6).toUpperCase()}
                        {order.deliveryArea ? ` · ${order.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[15px] font-extrabold text-gray-900 price-num leading-tight">৳{Number(order.total) || 0}</div>
                    </div>
                  </div>

                  {/* Row 2: customer + status */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-gray-900 truncate" title={order.customerName}>
                        {order.customerName || 'Customer'}
                      </div>
                      <div className="text-[12px] text-gray-500 price-num select-all">{order.customerPhone || 'No phone'}</div>
                    </div>
                    <select
                      value={order.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`${orderStatusChip(order.status)} text-xs font-bold h-8 pl-2.5 pr-1 outline-none cursor-pointer shrink-0`}
                      aria-label="Order status"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{ORDER_STATUS_LABEL[st]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3: address */}
                  <div className="text-[12px] text-gray-500 truncate -mt-1" title={order.address}>
                    {order.address && order.address.trim() !== '' && order.address !== 'N/A'
                      ? order.address.split(' - (')[0]
                      : 'No address found'}
                  </div>

                  {/* Row 4: courier check (fraud / success) + quick actions + payment */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const stats = getCustomerStats(order.customerPhone || '');
                      const report = getCourierReportForPhone(courierReports, order.customerPhone);
                      const isLoadingRate = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                      const rateDisplay = getOrderCourierRateDisplay(report, stats, isLoadingRate);
                      const loading = isLoadingRate && rateDisplay.source === 'website';
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            if (!order.customerPhone) return;
                            setCourierModalPhone(order.customerPhone);
                            setIsCourierHistoryModalOpen(true);
                            if (!report) checkCourierReport(order.customerPhone);
                          }}
                          title={rateDisplay.tooltip}
                          className={`h-8 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            rateDisplay.fraudCount > 0 ? 'tone-cancelled tone-chip' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span>Total: {loading ? '…' : rateDisplay.mobileTotalText}</span>
                          <span className="opacity-40">|</span>
                          <span>SCS: {loading ? '…' : rateDisplay.mobileScsText}</span>
                        </button>
                      );
                    })()}
                    <span className="flex-1" />
                    {formatWhatsAppUrl(order.customerPhone) && (
                      <a
                        href={formatWhatsAppUrl(order.customerPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:text-gray-900 transition-colors"
                        title="Chat on WhatsApp"
                        aria-label="WhatsApp"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                      </a>
                    )}
                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:text-gray-900 transition-colors"
                        title="Call"
                        aria-label="Call"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleQuickEditOrderItems(order)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:text-gray-900 transition-colors cursor-pointer"
                      title="Edit Order"
                      aria-label="Edit order"
                    >
                      <Edit3 size={14} />
                    </button>
                    <select
                      value={order.paymentMethod || 'CASH'}
                      onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                      className="h-8 pl-2 pr-1 rounded-lg text-[11px] font-bold uppercase bg-gray-100 text-gray-700 border-0 outline-none cursor-pointer"
                      aria-label="Payment method"
                    >
                      <option value="CASH">CASH</option>
                      <option value="BKASH">BKASH</option>
                      <option value="NAGAD">NAGAD</option>
                      <option value="DUE">DUE</option>
                      <option value="BANK">BANK</option>
                      <option value="ONLINE">ONLINE</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>

                  <OrderCourierBadge
                    order={order}
                    compact
                    syncSingleCourierStatus={syncSingleCourierStatus}
                    syncingOrderId={syncingOrderId}
                    onOpenDetails={() => setSelectedOrderForDetails(order)}
                  />
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 bg-slate-50">
        <table className="w-full text-left min-w-[1220px] border-separate border-spacing-y-1">
          <thead>
            <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-50">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  onChange={handleSelectAll}
                  checked={
                    Array.isArray(selectedOrderIds) &&
                    selectedOrderIds.length > 0 &&
                    selectedOrderIds.length === (Array.isArray(filteredOrders) ? filteredOrders : []).slice(0, adminOrdersLimit).length
                  }
                />
              </th>

              <th className="px-3 py-3 w-[235px]">Product Info</th>
              <th className="px-3 py-3 text-left w-[125px]">Total Price</th>
              <th className="px-3 py-3 min-w-[195px] max-w-[240px]">Customer Info</th>
              <th className="px-3 py-3 text-left w-[166px]">Courier History</th>
              <th className="px-3 py-3 text-left w-[190px]">Courier &amp; Note</th>
              <th className="px-3 py-3 text-center w-[124px]">Status &amp; Payment</th>
              <th className="px-3 py-3 w-[216px]">
                <div className="flex items-center justify-end gap-2 ml-auto">
                  <div className="w-[174px] text-center">ACTIONS</div>
                  <div className="w-8 shrink-0"></div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let lastDateText = '';
              const safeFiltered = Array.isArray(filteredOrders) ? filteredOrders : [];
              return safeFiltered.slice(0, adminOrdersLimit).map((order, idx) => {
                if (!order) return null;
                const orderItems = getOrderItemsSafe(order);
                const orderDateVal = getOrderLocalDateString(order);
                const dateText = formatOrderGroupDate(orderDateVal) || '';
                const isNewDateGroup = dateText !== lastDateText;
                if (isNewDateGroup) {
                  lastDateText = dateText;
                }
                const isToday = dateText.startsWith('Today');
                return (
                  <React.Fragment key={order.id}>
                    {isNewDateGroup && (
                      <tr className="overflow-hidden">
                        <td colSpan={8} className="py-2.5 px-4">
                          <div
                            className={`flex items-center justify-center gap-2 w-full ${
                              isToday ? 'text-primary' : 'text-gray-500'
                            }`}
                          >
                            {isToday ? <Calendar size={15} className="animate-pulse" /> : <Clock size={15} />}
                            <span className="text-[13px] font-bold tracking-wide">{dateText}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr
                      onClick={() => setSelectedOrderForDetails(order)}
                      className={`transition-colors overflow-hidden cursor-pointer ${orderStatusRow(order.status)}`}
                    >
                      <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={Array.isArray(selectedOrderIds) && selectedOrderIds.includes(order.id)}
                          onChange={(e) => handleSelectOrder(e, order.id)}
                        />
                      </td>
                      <td className="px-3 py-4 w-[235px] max-w-[235px] align-middle">
                        <div className="flex gap-3.5 items-center">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-white">
                            <img
                              loading="lazy"
                              src={orderItems[0]?.variantImage || orderItems[0]?.product?.image || '/logo.png'}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2 group">
                              <span className="text-[12px] font-bold text-secondary truncate">
                                {orderItems.length > 0
                                  ? orderItems
                                      .map((i: any) => `${i?.product?.name || i?.name || 'Unknown'} x${i?.quantity || 1}`)
                                      .join(', ')
                                  : 'No items'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickEditOrderItems(order);
                                }}
                                className="text-amber-600 hover:text-primary shrink-0 opacity-75 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Edit Order Items"
                              >
                                <Edit3 size={13} />
                              </button>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 mt-1">
                              #{String(order.displayId || order.id).slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[11px] font-bold text-gray-500 mt-0.5">{order.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left w-[125px] align-middle">
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-extrabold text-gray-900 price-num">৳{Number(order.total) || 0}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 border whitespace-nowrap ${
                              order.deliveryArea === 'inside'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                          >
                            {order.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 min-w-[195px] max-w-[240px] align-middle">
                        <div className="flex flex-col relative group">
                          {quickEditOrderId === order.id ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <input
                                type="text"
                                value={quickEditData.customerName}
                                onChange={(e) => setQuickEditData({ ...quickEditData, customerName: e.target.value })}
                                className="text-[13px] font-bold px-2 py-1 rounded border outline-none focus:border-primary"
                              />
                              <input
                                type="text"
                                value={quickEditData.customerPhone}
                                onChange={(e) => setQuickEditData({ ...quickEditData, customerPhone: e.target.value })}
                                className="text-[11px] font-bold px-2 py-1 rounded border outline-none focus:border-primary"
                              />
                              <textarea
                                value={quickEditData.address}
                                onChange={(e) => setQuickEditData({ ...quickEditData, address: e.target.value })}
                                className="text-[11px] font-bold px-2 py-1 rounded border outline-none focus:border-primary h-12 resize-none"
                              />
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <button
                                  onClick={() => setQuickEditOrderId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded shadow-sm border"
                                >
                                  <X size={12} />
                                </button>
                                <button
                                  onClick={handleSaveQuickEdit}
                                  className="p-1 text-green-600 hover:text-green-700 bg-green-50 rounded shadow-sm border border-green-200"
                                >
                                  <Check size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="min-w-0 flex flex-col">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="text-[13.5px] font-bold text-slate-800 whitespace-normal leading-snug break-words"
                                  title={order.customerName}
                                >
                                  {order.customerName}
                                </span>
                                {(() => {
                                  const custStats = getCustomerStats(order.customerPhone || '');
                                  const report = getCourierReportForPhone(courierReports, order.customerPhone);
                                  const isChecking = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                                  if (custStats.cancelled > custStats.delivered && custStats.cancelled >= 1) {
                                    return (
                                      <span
                                        className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 animate-pulse shrink-0"
                                        title="High Cancel Rate (Website)"
                                      >
                                        RISK
                                      </span>
                                    );
                                  }
                                  if (custStats.delivered > custStats.cancelled && custStats.delivered >= 1) {
                                    return (
                                      <span
                                        className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0"
                                        title="Good Customer (Website)"
                                      >
                                        GOOD
                                      </span>
                                    );
                                  }
                                  if (!report && !isChecking && custStats.delivered === 0 && custStats.cancelled === 0) {
                                    return (
                                      <span
                                        className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 animate-pulse shrink-0"
                                        title="New Customer"
                                      >
                                        VERIFY
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[12px] font-bold text-slate-500">{order.customerPhone}</span>
                              </div>
                              <div className="flex items-start gap-1 mt-0.5">
                                <span className="text-[11px] text-slate-400 font-medium line-clamp-1" title={order.address}>
                                  {order.address && order.address.trim() !== '' && order.address !== 'N/A'
                                    ? order.address.split(' - (')[0]
                                    : 'No address'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 align-middle w-[166px]">
                        {(() => {
                          const stats = getCustomerStats(order.customerPhone || '');
                          const report = getCourierReportForPhone(courierReports, order.customerPhone);
                          const isChecking = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                          const rateDisplay = getOrderCourierRateDisplay(report, stats, isChecking);
                          const hasCourier = rateDisplay.source === 'courier' && Boolean(report);

                          if (!hasCourier && isChecking) {
                            return (
                              <div className="w-[152px] px-2.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 min-h-[64px] shadow-2xs">
                                <Loader2 size={11} className="animate-spin text-indigo-500 shrink-0" />
                                <span>Steadfast লোড...</span>
                              </div>
                            );
                          }

                          if (hasCourier && report) {
                            const successPct =
                              report.delivery_rate !== undefined && report.delivery_rate !== null
                                ? Number(report.delivery_rate)
                                : report.total_parcel > 0
                                ? Math.round((report.total_delivered / report.total_parcel) * 100)
                                : 100;
                            const cancelPct =
                              report.cancellation_rate !== undefined && report.cancellation_rate !== null
                                ? Number(report.cancellation_rate)
                                : report.total_parcel > 0
                                ? Math.round((report.total_cancelled / report.total_parcel) * 100)
                                : 0;
                            const isCourierRisky = cancelPct > 40 || (report.total_cancelled > 0 && successPct < 60);
                            const isFraud = report.total_fraud_report > 0;

                            return (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCourierModalPhone(order.customerPhone);
                                  setIsCourierHistoryModalOpen(true);
                                }}
                                title={rateDisplay.tooltip}
                                className={`w-[154px] text-[9.5px] font-bold px-2.5 py-2 rounded-xl border flex flex-col justify-center gap-1 min-h-[64px] shadow-2xs transition-all hover:scale-[1.02] cursor-pointer ${
                                  isFraud
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/60'
                                    : isCourierRisky
                                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/60'
                                    : 'bg-emerald-50/90 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] uppercase tracking-wide opacity-80">Steadfast</span>
                                  <div className="flex items-center gap-1">
                                    {isFraud && (
                                      <span className="bg-red-600 text-white text-[8px] font-extrabold px-1 py-0.2 rounded animate-pulse">
                                        FRAUD ({report.total_fraud_report})
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        checkCourierReport(order.customerPhone, true);
                                      }}
                                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded hover:bg-black/5 transition-colors"
                                      title="Refresh Steadfast Stats"
                                    >
                                      <RefreshCcw size={9} />
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 whitespace-nowrap">
                                  <div>
                                    Total: <span className="text-slate-900">{rateDisplay.mobileTotalText}</span>
                                  </div>
                                  <div>
                                    Rate:{' '}
                                    <span className={successPct < 60 ? 'text-rose-600' : 'text-emerald-700'}>
                                      {successPct}%
                                    </span>
                                  </div>
                                  <div>
                                    Success: <span className="text-emerald-700">{rateDisplay.successText}</span>
                                  </div>
                                  <div>
                                    Cancel:{' '}
                                    <span className={rateDisplay.hasCancelHighlight ? 'text-rose-600' : 'text-rose-400'}>
                                      {rateDisplay.cancelText}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!order.customerPhone) return;
                                setCourierModalPhone(order.customerPhone);
                                setIsCourierHistoryModalOpen(true);
                                checkCourierReport(order.customerPhone, true);
                              }}
                              title={rateDisplay.tooltip}
                              className="w-[152px] text-[9.5px] font-bold px-2.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 flex flex-col justify-center gap-1 min-h-[64px] shadow-2xs transition-all cursor-pointer text-left"
                            >
                              <div className="flex items-center justify-between gap-1 w-full">
                                <span className="text-[9px] uppercase tracking-wide text-slate-400">Courier History</span>
                                <span className="text-[8.5px] text-indigo-600 font-extrabold">Check</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 whitespace-nowrap">
                                <div>
                                  Total: <span className="text-slate-900">{stats.total || 0}</span>
                                </div>
                                <div>
                                  Success: <span className="text-emerald-600">{stats.delivered}</span>
                                </div>
                                <div>
                                  Cancel:{' '}
                                  <span className={stats.cancelled > 0 ? 'text-rose-600' : 'text-slate-400'}>
                                    {stats.cancelled}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-4 align-middle w-[190px]">
                        {(() => {
                          const {
                            cConsignment,
                            cTrackCode,
                            cTrack,
                            badgeText,
                            hubName,
                            isDispatched,
                            serviceName,
                            canSync,
                            badgeCls,
                            portalUrl,
                            tooltip,
                            trackingMsgText,
                          } = getCourierDisplayMeta(order);
                          const secondaryLine =
                            cTrackCode || (cConsignment ? serviceName : cTrack || serviceName);
                          const isShowingHub = Boolean(
                            hubName && badgeText.toLowerCase().includes(hubName.toLowerCase())
                          );
                          return (
                            <div
                              className={`flex flex-col justify-center gap-1 w-[176px] shrink-0 min-h-[68px] ${isDispatched ? 'items-center' : 'items-start'}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isDispatched ? (
                                <>
                                  {cConsignment && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderForDetails(order)}
                                      title={tooltip || 'কুরিয়ার ট্র্যাকিং টাইমলাইন দেখুন'}
                                      className="text-[11px] font-bold text-sky-600 hover:text-sky-700 leading-tight truncate max-w-full cursor-pointer"
                                    >
                                      #{cConsignment}
                                    </button>
                                  )}
                                  <div className="flex items-center justify-center gap-1.5 w-full">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderForDetails(order)}
                                      className="text-[10px] font-mono font-medium text-slate-500 hover:text-slate-800 truncate text-center cursor-pointer"
                                      title={cTrack || serviceName}
                                    >
                                      {secondaryLine}
                                    </button>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {syncSingleCourierStatus && canSync && (
                                        <button
                                          type="button"
                                          disabled={syncingOrderId === order.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            syncSingleCourierStatus(order.id);
                                          }}
                                          className="text-sky-600 hover:text-sky-800 cursor-pointer"
                                          title="Live Courier Status সিঙ্ক করুন"
                                        >
                                          <RefreshCcw
                                            size={11}
                                            className={syncingOrderId === order.id ? 'animate-spin' : ''}
                                          />
                                        </button>
                                      )}
                                      {portalUrl && (
                                        <a
                                          href={portalUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-gray-400 hover:text-sky-600"
                                          title="কুরিয়ার ওয়েবসাইটে লাইভ ট্র্যাকিং দেখুন"
                                        >
                                          <ExternalLink size={11} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderForDetails(order)}
                                    title={tooltip || 'কুরিয়ার ট্র্যাকিং টাইমলাইন দেখুন'}
                                    className={`inline-flex items-center justify-center gap-1 border rounded-md px-2 py-0.5 max-w-full shadow-2xs transition-colors hover:brightness-95 cursor-pointer ${badgeCls}`}
                                  >
                                    {isShowingHub && <MapPin size={9.5} className="shrink-0" />}
                                    <span className="text-[9.5px] font-bold tracking-wide uppercase truncate">
                                      {badgeText.toUpperCase()}
                                    </span>
                                  </button>

                                  {/* Prominent Latest Delivery Note in Courier Column */}
                                  {(() => {
                                    const courierHistoryList: any[] = Array.isArray(order.courierHistory)
                                      ? order.courierHistory.filter((item: any) => item && typeof item === 'object')
                                      : [];
                                    const latestHistoryNote = [...courierHistoryList].reverse().find(
                                      (entry: any) => typeof entry?.message === 'string' && entry.message.trim()
                                    )?.message?.trim();
                                    const latestCourierNote =
                                      trackingMsgText ||
                                      latestHistoryNote ||
                                      (typeof order.courierStatusDetail === 'string' && order.courierStatusDetail.trim()) ||
                                      '';
                                    if (!latestCourierNote) return null;
                                    const allNotesWithMessages = courierHistoryList.filter(
                                      (entry: any) => typeof entry?.message === 'string' && entry.message.trim()
                                    );
                                    const hasMultipleNotes = allNotesWithMessages.length > 1;
                                    const pastNotesCount = Math.max(0, allNotesWithMessages.length - 1);
                                    const isAlertNote = /not\s*(answer|pick|reach|contact|receive)|ফোন\s*(ধরে\s*না|বন্ধ|রিসিভ)|ব্যস্ত|হোল্ড|hold|fail|cancel|reject|return|address/i.test(latestCourierNote);

                                    return (
                                      <button
                                        type="button"
                                        onClick={() => setSelectedOrderForDetails(order)}
                                        className={`mt-1 w-full flex items-start gap-1 p-1 rounded-md border text-[9px] font-bold transition-all hover:brightness-95 active:scale-[0.98] cursor-pointer text-left ${
                                          isAlertNote
                                            ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                                            : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                        title={`সর্বশেষ কুরিয়ার নোট: ${latestCourierNote}\n(ক্লিক করে সকল নোট ও হিস্ট্রি দেখুন)`}
                                      >
                                        <span className="shrink-0 text-[10px]">📝</span>
                                        <div className="flex-1 min-w-0">
                                          <span className="truncate block font-semibold leading-tight">{latestCourierNote}</span>
                                          {hasMultipleNotes && (
                                            <span className="text-[8px] text-sky-700 font-bold block mt-0.5">
                                              +{pastNotesCount}টি পূর্বের নোট
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })()}
                                </>
                              ) : (
                                <>
                                  <NotBookedLabel onClick={() => setSelectedOrderForDetails(order)} />
                                  <InternalOrderNote order={order} />
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-4 align-middle w-[124px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2 items-center justify-center h-[68px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] transition-colors cursor-pointer ${orderStatusChip(order.status)}`}
                          >
                            <option value="pending">
                              Pending
                            </option>
                            <option value="confirmed">
                              Confirmed
                            </option>
                            <option value="processing">
                              Processing
                            </option>
                            <option value="shipped">
                              Shipped
                            </option>
                            <option value="delivered">
                              Delivered
                            </option>
                            <option value="returned">
                              Returned
                            </option>
                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                          <select
                            value={order.paymentMethod || 'CASH'}
                            onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                            className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] uppercase transition-colors cursor-pointer bg-gray-100 text-gray-700 border-gray-200`}
                          >
                            <option value="CASH">
                              CASH
                            </option>
                            <option value="BKASH">
                              BKASH
                            </option>
                            <option value="NAGAD">
                              NAGAD
                            </option>
                            <option value="DUE">
                              DUE
                            </option>
                            <option value="BANK">
                              BANK
                            </option>
                            <option value="ONLINE">
                              ONLINE
                            </option>
                            <option value="N/A">
                              N/A
                            </option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-4 align-middle w-[216px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 ml-auto">
                          <div className="grid grid-cols-2 gap-1.5 w-[174px] shrink-0 h-[68px] items-center">
                            <div className="relative w-full">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                  const orderId = String(order.orderId || order.id).slice(-6).toUpperCase();
                                  let startPart =
                                    (siteConfig?.smsTemplateStart || '').trim() ||
                                    'Dear customer, your order is confirmed.';
                                  const endPart =
                                    (siteConfig?.smsTemplateEnd || '').trim() || 'Thank you for using iShop BD.';
                                  if (startPart.includes('') && order.customerName) {
                                    startPart = startPart.replace('', order.customerName);
                                  }
                                  let productDetails = '';
                                  if (orderItems.length > 0) {
                                    productDetails = orderItems
                                      .map((item: any) => {
                                        const directSms = (item?.smsName || item?.product?.smsName || '').trim();
                                        const rawName = (item?.product?.name || item?.name || 'Product').trim();
                                        const name = directSms
                                          ? directSms
                                          : rawName.length > 25
                                          ? rawName.substring(0, 25) + '...'
                                          : rawName;
                                        const qty = item?.quantity || 1;
                                        return `${name} (${qty} pcs)`;
                                      })
                                      .join('\n');
                                  }
                                  const defaultMessage = `${startPart}\nProducts:\n${productDetails}\nOrder No: #${orderId}\nTotal Bill: ৳${order.total}\n${endPart}`;
                                  setIndividualSmsMessage(defaultMessage);
                                }}
                                className="flex items-center justify-center gap-1 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 rounded-full px-2.5 h-8 w-[84px] shadow-sm text-sky-600 transition-colors cursor-pointer"
                                title="Send SMS"
                              >
                                <MessageSquare size={11} />
                                <span className="text-[10.5px] font-bold">SMS</span>
                              </button>

                              <AnimatePresence>
                                {individualSmsOrder?.id === order.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute top-[120%] right-0 bg-white rounded-2xl w-72 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 z-[200] origin-top-right cursor-default text-left"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                    <div className="relative p-4 bg-white rounded-2xl z-10">
                                      <div className="flex justify-between items-center mb-2">
                                        <p className="text-[10px] text-gray-500">
                                          Recipient:{' '}
                                          <span className="font-bold text-gray-800">
                                            {order.customerPhone || order.phone}
                                          </span>
                                        </p>
                                        <button
                                          onClick={() => setIndividualSmsOrder(null)}
                                          className="text-gray-400 hover:text-red-500"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <textarea
                                        value={individualSmsMessage}
                                        onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                        placeholder="Write your message..."
                                        className="w-full h-24 p-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-3"
                                      ></textarea>
                                      <div className="flex justify-center">
                                        <button
                                          onClick={handleSendIndividualSms}
                                          disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                          className="bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 disabled:opacity-50 transition-all active:scale-95 w-full shadow-sm shadow-green-500/20"
                                        >
                                          {isSendingIndividualSms ? (
                                            <Loader2 size={14} className="animate-spin" />
                                          ) : (
                                            <Send size={14} />
                                          )}
                                          {isSendingIndividualSms ? 'Sending...' : 'Send Now'}
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompletedOrderReceipt(order)}
                              className="flex items-center justify-center gap-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/70 rounded-full px-2.5 h-8 w-[84px] shadow-sm text-cyan-700 transition-colors active:scale-95 cursor-pointer"
                              title="View Receipt"
                            >
                              <Receipt size={11} />
                              <span className="text-[10.5px] font-bold">Receipt</span>
                            </button>
                            {(() => {
                              const waHref = formatWhatsAppUrl(order.customerPhone);
                              if (!waHref) {
                                return (
                                  <span className="flex items-center justify-center gap-1 bg-gray-50 border border-gray-200/70 rounded-full px-2 h-8 w-[84px] text-gray-400 text-[10px] font-bold">
                                    No Phone
                                  </span>
                                );
                              }
                              return (
                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-full px-2 h-8 w-[84px] shadow-sm text-emerald-700 transition-colors active:scale-95 cursor-pointer"
                                  title="Chat on WhatsApp"
                                >
                                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="shrink-0">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                  </svg>
                                  <span className="text-[10.5px] font-bold">WhatsApp</span>
                                </a>
                              );
                            })()}
                            <button
                              type="button"
                              onClick={() => handlePrintInvoice(order)}
                              className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-full px-2.5 h-8 w-[84px] shadow-sm text-indigo-700 transition-colors active:scale-95 cursor-pointer"
                              title="Print Invoice"
                            >
                              <Printer size={11} />
                              <span className="text-[10.5px] font-bold">Print</span>
                            </button>
                          </div>

                          <div className="relative group w-fit shrink-0">
                            <button
                              className="text-gray-400 hover:text-gray-700 w-8 h-[68px] rounded-lg flex items-center justify-center transition-all shrink-0"
                              title="More Actions"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </button>
                            <div className="absolute top-1/2 right-full -translate-y-1/2 mr-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-100 shadow-xl z-50">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleQuickEditOrderItems(order);
                                }}
                                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0 cursor-pointer"
                                title="Edit Order"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleBlacklist(order.customerPhone);
                                }}
                                className={`w-8 h-8 rounded-lg transition-all border shadow-sm flex items-center justify-center active:scale-90 shrink-0 ${
                                  Array.isArray(blacklist) && blacklist.includes(order.customerPhone)
                                    ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                                    : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                }`}
                                title={Array.isArray(blacklist) && blacklist.includes(order.customerPhone) ? 'Unblock Number' : 'Block Number'}
                              >
                                {Array.isArray(blacklist) && blacklist.includes(order.customerPhone) ? <ShieldCheck size={14} /> : <Ban size={14} />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deleteOrder(order.id);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                title="Delete Order"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              });
            })()}
          </tbody>
        </table>
      </div>
      {filteredOrders.length > adminOrdersLimit && (
        <div className="flex justify-center mt-6 mb-10">
          <button
            onClick={() => setAdminOrdersLimit((prev) => prev + 100)}
            className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Load More ({filteredOrders.length - adminOrdersLimit} remaining)
          </button>
        </div>
      )}
      {createDraft && onCreateOrder && (
        <IncompleteOrderModal
          mode="create"
          order={createDraft}
          onClose={() => setCreateDraft(null)}
          products={products}
          getProductPrice={getProductPrice}
          getCustomerStats={getCustomerStats}
          courierReports={courierReports}
          loadingCourierReports={loadingCourierReports}
          checkCourierReport={checkCourierReport}
          siteConfig={siteConfig}
          onCompleteOrder={onCreateOrder}
        />
      )}
    </div>
  );
}
