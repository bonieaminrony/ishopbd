import React from 'react';
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
  Eye,
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
  UserCheck,
  X,
} from 'lucide-react';
import {
  formatSafeDateTime,
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
  toggleBlacklist: (phone: string) => void;
  blacklist: string[];
  deleteOrder: (id: string) => void;
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

function OrderCourierBadge({
  order,
  compact = false,
  syncSingleCourierStatus,
  syncingOrderId,
}: {
  order: any;
  compact?: boolean;
  syncSingleCourierStatus?: (orderId: string) => void;
  syncingOrderId?: string | null;
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
      <div className={compact ? 'pt-1 border-t border-gray-100/80 flex items-center justify-between' : 'mt-1.5'}>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-400 border border-slate-200/80 text-[10px] font-semibold">
          Not Booked
        </span>
      </div>
    );
  }

  const mobileTrackText = cTrackCode || (cConsignment ? '' : cTrack);

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
      {hasDistinctDetail && trackingMsgText && (
        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[260px]" title={trackingMsgText}>
          {trackingMsgText}
        </p>
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
  toggleBlacklist,
  blacklist,
  deleteOrder,
}: AdminOrdersTabProps) {
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

      {/* Filters & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
            <History size={20} className="text-primary" />
            Recent Orders
          </h4>

          <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/30">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'returned', label: 'Returned' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedOrderStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={adminStartDate}
              onChange={(e) => setAdminStartDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="date"
              value={adminEndDate}
              onChange={(e) => setAdminEndDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
          <select
            value={adminOrderAreaFilter}
            onChange={(e) => setAdminOrderAreaFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <option value="all">All Areas</option>
            <option value="inside">Inside Dhaka</option>
            <option value="outside">Outside Dhaka</option>
          </select>
          <div className="flex gap-2 flex-1 min-w-[150px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search Phone, Order ID or Tracking ID..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary text-xs font-bold shadow-sm transition-all"
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
          </div>
          {syncAllCourierStatuses && (
            <button
              type="button"
              disabled={isSyncingCourier}
              onClick={() => syncAllCourierStatuses(false)}
              title="Steadfast ও Pathao থেকে সব অ্যাক্টিভ অর্ডারের ডেলিভারি স্ট্যাটাস সিঙ্ক করুন"
              className="bg-sky-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCcw size={15} className={isSyncingCourier ? 'animate-spin' : ''} />
              {isSyncingCourier ? 'Syncing...' : 'Sync Courier'}
            </button>
          )}
          <div className="relative font-sans" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
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
      <div className="lg:hidden space-y-3">
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
                  <div className="flex items-center gap-3 py-3 px-1 mt-4 first:mt-1">
                    <div
                      className={`h-[1.5px] flex-1 ${
                        isToday
                          ? 'bg-gradient-to-r from-transparent to-primary/40'
                          : 'bg-gradient-to-r from-transparent to-secondary/30'
                      }`}
                    ></div>
                    <div
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold shadow-sm shrink-0 transition-all ${
                        isToday
                          ? 'bg-primary/[0.06] text-primary border-primary/20 shadow-primary/5'
                          : 'bg-secondary/[0.04] text-secondary border-secondary/15 shadow-secondary/5'
                      }`}
                    >
                      {isToday ? (
                        <Calendar size={12} className="text-primary animate-pulse" />
                      ) : (
                        <Clock size={12} className="text-secondary/70" />
                      )}
                      {dateText}
                    </div>
                    <div
                      className={`h-[1.5px] flex-1 ${
                        isToday
                          ? 'bg-gradient-to-l from-transparent to-primary/40'
                          : 'bg-gradient-to-l from-transparent to-secondary/30'
                      }`}
                    ></div>
                  </div>
                )}
                <div
                  onClick={() => setSelectedOrderForDetails(order)}
                  className={`rounded-2xl shadow-xs border p-2.5 flex flex-col gap-2.5 cursor-pointer active:scale-[0.99] transition-all ${
                    order.status === 'pending'
                      ? 'bg-[#faf5ff] border-[#ede9fe] hover:bg-purple-50/80'
                      : order.status === 'confirmed'
                      ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70'
                      : order.status === 'shipped'
                      ? 'bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/70'
                      : order.status === 'delivered'
                      ? 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70'
                      : order.status === 'returned'
                      ? 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70'
                      : order.status === 'cancelled'
                      ? 'bg-rose-50/40 border-rose-100 hover:bg-rose-50/70'
                      : 'bg-white border-gray-200 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200/60 bg-white shrink-0 self-start">
                      <img
                        loading="lazy"
                        src={orderItems[0]?.variantImage || orderItems[0]?.product?.image || '/logo.png'}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(e, order.id);
                        }}
                        className="absolute top-1.5 left-1.5 bg-white/95 rounded-[6px] w-[22px] h-[22px] flex items-center justify-center border border-gray-300 shadow-2xs cursor-pointer hover:border-primary transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded-[3px] border-gray-300 text-primary focus:ring-primary pointer-events-none cursor-pointer"
                          checked={Array.isArray(selectedOrderIds) && selectedOrderIds.includes(order.id)}
                          onChange={() => {}}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 justify-between min-h-[80px]">
                      <div
                        className="flex items-center gap-1.5 w-full min-w-0 group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickEditOrderItems(order);
                        }}
                      >
                        <span className="text-[13px] font-bold text-[#1e1b4b] truncate leading-tight group-hover:text-primary transition-colors">
                          {orderItems.length > 0
                            ? orderItems
                                .map((i: any) => `${i?.product?.name || i?.name || 'Unknown'} x${i?.quantity || 1}`)
                                .join(', ')
                            : 'No items'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 min-w-0 mt-1">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className="text-[13px] font-bold text-[#e11d48] truncate leading-tight"
                            title={order.customerName}
                          >
                            {order.customerName || 'Customer'}
                          </span>
                          <span className="text-[12.5px] font-extrabold text-[#1e293b] leading-tight tracking-tight mt-0.5 select-all">
                            {order.customerPhone || 'No phone'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const stats = getCustomerStats(order.customerPhone || '');
                            const report = getCourierReportForPhone(courierReports, order.customerPhone);
                            const isLoadingRate = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                            const rateDisplay = getOrderCourierRateDisplay(report, stats, isLoadingRate);
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
                                className="flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="text-[10px] font-bold text-slate-700 bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs whitespace-nowrap">
                                  Total: {isLoadingRate && rateDisplay.source === 'website' ? '...' : rateDisplay.mobileTotalText}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs whitespace-nowrap ${
                                    rateDisplay.fraudCount > 0
                                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                  }`}
                                >
                                  SCS: {isLoadingRate && rateDisplay.source === 'website' ? '...' : rateDisplay.mobileScsText}
                                </span>
                              </button>
                            );
                          })()}

                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/880${
                                order.customerPhone.startsWith('0')
                                  ? order.customerPhone.substring(1)
                                  : order.customerPhone
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all border border-emerald-200/70 shadow-2xs"
                              title="Chat on WhatsApp"
                            >
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </a>
                          )}
                          {order.customerPhone && (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 hover:scale-105 active:scale-95 transition-all border border-teal-200/70 shadow-2xs"
                              title="Call"
                            >
                              <Phone size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="bg-white flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-600 font-medium truncate shadow-2xs"
                      title={order.address}
                    >
                      {order.address && order.address.trim() !== '' && order.address !== 'N/A'
                        ? order.address.split(' - (')[0]
                        : 'No address found'}
                    </div>
                    <div className="shrink-0">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold border rounded-xl px-2.5 py-1.5 outline-none focus:ring-2 shadow-2xs cursor-pointer ${
                          order.status === 'pending'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-300'
                            : order.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-300'
                            : order.status === 'shipped'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-300'
                            : order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300'
                            : order.status === 'returned'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-300'
                            : 'bg-white border-gray-200 text-secondary focus:ring-primary'
                        }`}
                      >
                        <option value="pending" className="bg-white text-gray-800 font-semibold">
                          Pending
                        </option>
                        <option value="confirmed" className="bg-white text-gray-800 font-semibold">
                          Confirmed
                        </option>
                        <option value="shipped" className="bg-white text-gray-800 font-semibold">
                          Shipped
                        </option>
                        <option value="delivered" className="bg-white text-gray-800 font-semibold">
                          Delivered
                        </option>
                        <option value="returned" className="bg-white text-gray-800 font-semibold">
                          Returned
                        </option>
                        <option value="cancelled" className="bg-white text-gray-800 font-semibold">
                          Cancelled
                        </option>
                      </select>
                    </div>
                    <div className="shrink-0">
                      <select
                        value={order.paymentMethod || 'CASH'}
                        onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl uppercase border cursor-pointer outline-none shadow-2xs ${
                          (order.paymentMethod || 'CASH').toUpperCase() === 'CASH' ||
                          (order.paymentMethod || 'CASH').toUpperCase() === 'COD'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-200'
                            : (order.paymentMethod || 'CASH').toUpperCase() === 'BKASH'
                            ? 'bg-pink-50 text-pink-700 border-pink-200 focus:ring-pink-200'
                            : (order.paymentMethod || 'CASH').toUpperCase() === 'NAGAD'
                            ? 'bg-orange-50 text-orange-700 border-orange-200 focus:ring-orange-200'
                            : (order.paymentMethod || 'CASH').toUpperCase() === 'DUE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-200'
                        }`}
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
                  </div>

                  <OrderCourierBadge
                    order={order}
                    compact
                    syncSingleCourierStatus={syncSingleCourierStatus}
                    syncingOrderId={syncingOrderId}
                  />
                </div>
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 bg-slate-50">
        <table className="w-full text-left min-w-[1060px] border-separate border-spacing-y-2">
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

              <th className="px-3 py-3">Product Info</th>
              <th className="px-3 py-3 text-left">Total Price</th>
              <th className="px-3 py-3">Customer Info</th>
              <th className="px-3 py-3 text-center w-[124px]">Status &amp; Payment</th>
              <th className="px-3 py-3 text-center w-[120px]">Delivery Rate</th>
              <th className="px-3 py-3 text-center w-[150px]">Courier</th>
              <th className="px-3 py-3 w-[152px]">
                <div className="flex items-center justify-end gap-2 ml-auto">
                  <div className="w-[100px] text-center">SMS &amp; VERIFY</div>
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
                      className={`transition-colors overflow-hidden cursor-pointer ${
                        order.status === 'pending'
                          ? 'bg-purple-100/40 hover:bg-purple-100/60'
                          : order.status === 'confirmed'
                          ? 'bg-blue-100/40 hover:bg-blue-100/60'
                          : order.status === 'shipped'
                          ? 'bg-indigo-100/40 hover:bg-indigo-100/60'
                          : order.status === 'delivered'
                          ? 'bg-emerald-100/45 hover:bg-emerald-100/65'
                          : order.status === 'returned'
                          ? 'bg-amber-100/50 hover:bg-amber-100/70'
                          : order.status === 'cancelled'
                          ? 'bg-red-100/45 hover:bg-red-100/65'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-gray-50/50'
                          : 'bg-[#f4f7fa] hover:bg-[#ebf0f5]'
                      }`}
                    >
                      <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          checked={Array.isArray(selectedOrderIds) && selectedOrderIds.includes(order.id)}
                          onChange={(e) => handleSelectOrder(e, order.id)}
                        />
                      </td>
                      <td className="p-4 max-w-[240px] w-[240px]">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 bg-white">
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
                                className="text-secondary hover:text-primary shrink-0 opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Edit Order Items"
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 mt-1">
                              #{String(order.displayId || order.id).slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[11px] font-bold text-gray-500 mt-0.5">{order.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-bold text-red-600">৳{Number(order.total) || 0}</span>
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
                      <td className="p-4 max-w-[200px]">
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
                            <>
                              <div className="flex items-center gap-1.5 flex-nowrap max-w-[350px]">
                                <span
                                  className="text-[14px] font-bold text-slate-800 truncate shrink"
                                  title={order.customerName}
                                >
                                  {order.customerName}
                                </span>
                                {(() => {
                                  const custStats = getCustomerStats(order.customerPhone || '');
                                  const report = getCourierReportForPhone(courierReports, order.customerPhone);
                                  const isChecking = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                                  const rateDisplay = getOrderCourierRateDisplay(report, custStats, isChecking);
                                  const hasCourier = rateDisplay.source === 'courier' && Boolean(report);

                                  const customerBadge =
                                    custStats.cancelled > custStats.delivered && custStats.cancelled >= 1 ? (
                                      <span
                                        className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 animate-pulse shrink-0"
                                        title="High Cancel Rate (Website)"
                                      >
                                        RISK
                                      </span>
                                    ) : custStats.delivered > custStats.cancelled && custStats.delivered >= 1 ? (
                                      <span
                                        className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0"
                                        title="Good Customer (Website)"
                                      >
                                        GOOD
                                      </span>
                                    ) : !hasCourier && !isChecking && custStats.delivered === 0 && custStats.cancelled === 0 ? (
                                      <span
                                        className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 animate-pulse shrink-0"
                                        title="New Customer"
                                      >
                                        VERIFY
                                      </span>
                                    ) : null;

                                  const compactCourierLabel = hasCourier && report
                                    ? report.total_fraud_report > 0
                                      ? `FRAUD (${report.total_fraud_report})`
                                      : report.total_parcel > 0
                                      ? `SF ${report.total_delivered}/${report.total_parcel}`
                                      : `SF ${rateDisplay.successText}`
                                    : '';

                                  const successPct =
                                    report && report.delivery_rate !== undefined && report.delivery_rate !== null
                                      ? Number(report.delivery_rate)
                                      : report && report.total_parcel > 0
                                      ? Math.round((report.total_delivered / report.total_parcel) * 100)
                                      : 100;
                                  const cancelPct =
                                    report && report.cancellation_rate !== undefined && report.cancellation_rate !== null
                                      ? Number(report.cancellation_rate)
                                      : report && report.total_parcel > 0
                                      ? Math.round((report.total_cancelled / report.total_parcel) * 100)
                                      : 0;
                                  const isCourierRisky = cancelPct > 40 || (Boolean(report?.total_cancelled) && successPct < 60);

                                  return (
                                    <>
                                      {customerBadge}
                                      {hasCourier && report ? (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCourierModalPhone(order.customerPhone);
                                            setIsCourierHistoryModalOpen(true);
                                          }}
                                          title={rateDisplay.tooltip}
                                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap transition-transform hover:scale-105 cursor-pointer ${
                                            report.total_fraud_report > 0
                                              ? 'bg-red-600 text-white border-red-700 animate-pulse'
                                              : isCourierRisky
                                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          }`}
                                        >
                                          {compactCourierLabel}
                                        </button>
                                      ) : isChecking ? (
                                        <span
                                          className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 shrink-0"
                                          title="Checking Steadfast courier history..."
                                        >
                                          <Loader2 size={8} className="animate-spin" />
                                          SF
                                        </span>
                                      ) : null}
                                    </>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[12px] font-bold text-slate-500">{order.customerPhone}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-start gap-1 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-medium line-clamp-1" title={order.address}>
                              {order.address && order.address.trim() !== '' && order.address !== 'N/A'
                                ? order.address.split(' - (')[0]
                                : 'No address'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 align-middle w-[124px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2 items-center justify-center h-[68px]">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] transition-colors cursor-pointer ${
                              order.status === 'pending'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-300'
                                : order.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-300'
                                : order.status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-300'
                                : order.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300'
                                : order.status === 'returned'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300'
                                : order.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-300'
                                : 'bg-white border-gray-200 text-secondary focus:ring-primary'
                            }`}
                          >
                            <option value="pending" className="bg-white text-gray-800 font-semibold">
                              Pending
                            </option>
                            <option value="confirmed" className="bg-white text-gray-800 font-semibold">
                              Confirmed
                            </option>
                            <option value="shipped" className="bg-white text-gray-800 font-semibold">
                              Shipped
                            </option>
                            <option value="delivered" className="bg-white text-gray-800 font-semibold">
                              Delivered
                            </option>
                            <option value="returned" className="bg-white text-gray-800 font-semibold">
                              Returned
                            </option>
                            <option value="cancelled" className="bg-white text-gray-800 font-semibold">
                              Cancelled
                            </option>
                          </select>
                          <select
                            value={order.paymentMethod || 'CASH'}
                            onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                            className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] uppercase transition-colors cursor-pointer ${
                              (order.paymentMethod || 'CASH').toUpperCase() === 'CASH' ||
                              (order.paymentMethod || 'CASH').toUpperCase() === 'COD'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 focus:ring-emerald-300'
                                : (order.paymentMethod || 'CASH').toUpperCase() === 'BKASH'
                                ? 'bg-pink-100 text-pink-700 border-pink-200 focus:ring-pink-300'
                                : (order.paymentMethod || 'CASH').toUpperCase() === 'NAGAD'
                                ? 'bg-orange-100 text-orange-700 border-orange-200 focus:ring-orange-300'
                                : (order.paymentMethod || 'CASH').toUpperCase() === 'DUE'
                                ? 'bg-rose-100 text-rose-700 border-rose-200 focus:ring-rose-300'
                                : 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-300'
                            }`}
                          >
                            <option value="CASH" className="bg-white text-gray-800 font-bold">
                              CASH
                            </option>
                            <option value="BKASH" className="bg-white text-gray-800 font-bold">
                              BKASH
                            </option>
                            <option value="NAGAD" className="bg-white text-gray-800 font-bold">
                              NAGAD
                            </option>
                            <option value="DUE" className="bg-white text-gray-800 font-bold">
                              DUE
                            </option>
                            <option value="BANK" className="bg-white text-gray-800 font-bold">
                              BANK
                            </option>
                            <option value="ONLINE" className="bg-white text-gray-800 font-bold">
                              ONLINE
                            </option>
                            <option value="N/A" className="bg-white text-gray-800 font-bold">
                              N/A
                            </option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-4 align-middle w-[120px]">
                        {(() => {
                          const stats = getCustomerStats(order.customerPhone || '');
                          const report = getCourierReportForPhone(courierReports, order.customerPhone);
                          const isLoadingRate = isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone);
                          const rateDisplay = getOrderCourierRateDisplay(report, stats, isLoadingRate);
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!order.customerPhone) return;
                                setCourierModalPhone(order.customerPhone);
                                setIsCourierHistoryModalOpen(true);
                                if (!report) checkCourierReport(order.customerPhone);
                              }}
                              title={rateDisplay.tooltip}
                              className="flex flex-col gap-1.5 w-fit shrink-0 justify-center items-center mx-auto min-h-[68px] cursor-pointer text-left"
                            >
                              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100/70 rounded-full px-3 h-7 w-[100px] shadow-sm transition-transform hover:scale-105">
                                <span className="text-[10px] font-bold text-emerald-700">Success:</span>
                                <span className="text-[11px] font-bold text-emerald-600">
                                  {isLoadingRate && rateDisplay.source === 'website' ? '...' : rateDisplay.successText}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-rose-50 border border-rose-100/70 rounded-full px-3 h-7 w-[100px] shadow-sm transition-transform hover:scale-105">
                                <span className="text-[10px] font-bold text-rose-700">Cancel:</span>
                                <span
                                  className={`text-[11px] font-bold ${
                                    rateDisplay.hasCancelHighlight ? 'text-rose-600' : 'text-rose-400'
                                  }`}
                                >
                                  {isLoadingRate && rateDisplay.source === 'website' ? '...' : rateDisplay.cancelText}
                                </span>
                              </div>
                              {rateDisplay.fraudCount > 0 && (
                                <span className="bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full animate-pulse whitespace-nowrap">
                                  FRAUD ({rateDisplay.fraudCount})
                                </span>
                              )}
                            </button>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-4 align-middle w-[150px]">
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
                          } = getCourierDisplayMeta(order);
                          const secondaryLine =
                            cTrackCode || (cConsignment ? serviceName : cTrack || serviceName);
                          const isShowingHub = Boolean(
                            hubName && badgeText.toLowerCase().includes(hubName.toLowerCase())
                          );
                          return (
                            <div
                              className="flex flex-col items-start justify-center gap-1 w-[136px] shrink-0 mx-auto min-h-[68px]"
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
                                  <div className="flex items-center justify-between gap-1 w-full">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrderForDetails(order)}
                                      className="text-[10px] font-mono font-medium text-slate-500 hover:text-slate-800 truncate text-left cursor-pointer"
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
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForDetails(order)}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100/90 hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 border border-slate-200/80 text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="অর্ডার ও কুরিয়ার বিস্তারিত দেখুন (পাঠাতে ডানদিকের ⋮ মেনু ব্যবহার করুন)"
                                >
                                  Not Booked
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-4 align-middle w-[152px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 ml-auto">
                          <div className="flex flex-col gap-2 w-fit shrink-0 h-[68px] justify-center">
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
                                className="flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-sky-600 transition-colors"
                                title="Send SMS"
                              >
                                <MessageSquare size={12} />
                                <span className="text-[11px] font-bold">SMS</span>
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
                            {isPhoneLoadingInRecord(loadingCourierReports, order.customerPhone) ? (
                              <div className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200/70 rounded-lg px-3 h-8 w-[100px] shadow-sm text-gray-500">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-[11px] font-bold">Checking...</span>
                              </div>
                            ) : getCourierReportForPhone(courierReports, order.customerPhone) ? (
                              <button
                                onClick={() => {
                                  setCourierModalPhone(order.customerPhone);
                                  setIsCourierHistoryModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-purple-600 transition-colors active:scale-95 cursor-pointer"
                                title="View Courier History"
                              >
                                <Eye size={12} />
                                <span className="text-[11px] font-bold">History</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setCourierModalPhone(order.customerPhone);
                                  setIsCourierHistoryModalOpen(true);
                                  checkCourierReport(order.customerPhone, true);
                                }}
                                className="flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-orange-600 transition-colors active:scale-95 cursor-pointer"
                                title="Verify Customer"
                              >
                                <UserCheck size={12} />
                                <span className="text-[11px] font-bold">Verify</span>
                              </button>
                            )}
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
                                onClick={() => setCompletedOrderReceipt(order)}
                                className="hidden md:flex bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 w-8 h-8 rounded-lg items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                title="View Receipt"
                              >
                                <Receipt size={14} />
                              </button>
                              <button
                                onClick={() => sendToCourier(order)}
                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                title="Send to Courier"
                              >
                                <Truck size={14} />
                              </button>
                              <button
                                onClick={() => handlePrintInvoice(order)}
                                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                title="Print Invoice"
                              >
                                <Printer size={14} />
                              </button>
                              {order.customerPhone && (
                                <a
                                  href={`https://wa.me/880${
                                    order.customerPhone.startsWith('0')
                                      ? order.customerPhone.substring(1)
                                      : order.customerPhone
                                  }`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                  title="Chat on WhatsApp"
                                >
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                  </svg>
                                </a>
                              )}
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
            onClick={() => setAdminOrdersLimit((prev) => prev + 50)}
            className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Load More ({filteredOrders.length - adminOrdersLimit} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
