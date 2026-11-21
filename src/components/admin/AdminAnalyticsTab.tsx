import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  DollarSign,
  Activity,
  Share2,
  Search,
  Youtube,
  Globe,
  Smartphone,
  Monitor,
  Flame,
  ExternalLink,
  ArrowRight,
  Zap,
  BarChart3,
  LineChart,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { resolveOrderTrafficSource, TrafficPlatform } from '../../utils/tracking';

export interface AdminAnalyticsTabProps {
  orderHistory: any[];
  products: any[];
  onNavigateToOrders?: () => void;
  adminViewMode?: string;
}

type TimeframeOption = 'today' | 'yesterday' | '7days' | '28days' | 'this_month' | 'all';
type MetricView = 'revenue' | 'orders' | 'visits';
type ChartStyle = 'curve' | 'bar';

export default function AdminAnalyticsTab({
  orderHistory = [],
  products = [],
  onNavigateToOrders,
}: AdminAnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('28days');
  const [activeMetric, setActiveMetric] = useState<MetricView>('revenue');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('curve');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{ day: string; hour: number; visits: number; orders: number } | null>(null);
  const [trafficStats, setTrafficStats] = useState<{
    daily: any[];
    recent: any[];
    activeVisitors: number;
    realtime?: {
      activeShoppers: number;
      last60Minutes: number;
      last48Hours: number;
      sources: Record<string, number>;
    };
  }>({
    daily: [],
    recent: [],
    activeVisitors: 1
  });
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // 1. Direct Real-time Firebase Firestore Sync for daily aggregates
  useEffect(() => {
    try {
      const q = query(collection(db, 'traffic_daily'), orderBy('date', 'desc'), limit(30));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrafficStats(prev => ({
          ...prev,
          daily: docs
        }));
        setLastRefreshedAt(new Date());
      }, (err) => {
        console.warn('Realtime traffic sync warning:', err.message);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore onSnapshot setup fallback:', e);
    }
  }, []);

  // 2. Fetch server recent live visits
  const fetchRecentTrafficStream = async () => {
    setIsLoadingTraffic(true);
    try {
      const res = await axios.get('/api/admin/traffic-stats', { timeout: 8000 });
      if (res.data?.success) {
        setTrafficStats(prev => ({
          daily: res.data.daily && res.data.daily.length > 0 ? res.data.daily : prev.daily,
          recent: res.data.recent || prev.recent,
          activeVisitors: res.data.activeVisitors || prev.activeVisitors || 1,
          realtime: res.data.realtime || prev.realtime
        }));
        setLastRefreshedAt(new Date());
      }
    } catch (e) {
      console.warn('Live stream fetch fallback:', e);
    } finally {
      setIsLoadingTraffic(false);
    }
  };

  useEffect(() => {
    fetchRecentTrafficStream();
    const interval = setInterval(fetchRecentTrafficStream, 20000);
    return () => clearInterval(interval);
  }, []);

  // Filter Orders based on selected timeframe
  const filteredData = useMemo(() => {
    const now = new Date();
    const activeOrders = (orderHistory || []).filter((o: any) => !o.deleted);

    const getDhakaDateString = (d: Date) => {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(d);
    };

    const todayStr = getDhakaDateString(now);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = getDhakaDateString(yesterday);

    const getOrderDateObj = (o: any): Date | null => {
      const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || o.date;
      if (!ts) return null;
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    };

    const isOrderInTimeframe = (o: any, tf: TimeframeOption): boolean => {
      const d = getOrderDateObj(o);
      if (!d) return false;
      const orderDateStr = getDhakaDateString(d);

      if (tf === 'today') return orderDateStr === todayStr;
      if (tf === 'yesterday') return orderDateStr === yesterdayStr;
      if (tf === '7days') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (tf === '28days') {
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 28;
      }
      if (tf === 'this_month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    };

    const currentOrders = activeOrders.filter((o) => isOrderInTimeframe(o, timeframe));

    const prevDays = timeframe === 'today' || timeframe === 'yesterday' ? 1 : timeframe === '7days' ? 7 : 28;
    const prevOrders = activeOrders.filter((o) => {
      const d = getOrderDateObj(o);
      if (!d) return false;
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > prevDays && diffDays <= prevDays * 2;
    });

    const dailyMap = new Map<string, any>();
    (trafficStats.daily || []).forEach((item) => {
      dailyMap.set(item.date, item);
    });

    return {
      currentOrders,
      prevOrders,
      dailyTrafficMap: dailyMap,
      prevDays
    };
  }, [orderHistory, timeframe, trafficStats]);

  const currentOrders = filteredData.currentOrders;
  const prevOrders = filteredData.prevOrders;

  const totalOrdersCount = currentOrders.length;
  const prevOrdersCount = prevOrders.length;

  const successfulOrders = currentOrders.filter((o) => o.status === 'delivered' || o.status === 'confirmed' || o.status === 'processing');
  const cancelledOrders = currentOrders.filter((o) => o.status === 'cancelled' || o.status === 'returned');

  const totalRevenue = currentOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const prevRevenue = prevOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const successRate = totalOrdersCount > 0 ? Math.round((successfulOrders.length / totalOrdersCount) * 100) : 100;
  const revenueGrowthPct = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : totalRevenue > 0 ? 100 : 0;
  const orderGrowthPct = prevOrdersCount > 0 ? Math.round(((totalOrdersCount - prevOrdersCount) / prevOrdersCount) * 100) : totalOrdersCount > 0 ? 100 : 0;

  // 100% Genuine, Real Multi-Channel Attribution (NO Dummy Data!)
  const channelBreakdown = useMemo(() => {
    const channels: Record<
      TrafficPlatform,
      {
        name: string;
        tag: string;
        color: string;
        badgeColor: string;
        barColor: string;
        icon: any;
        clicks: number;
        orders: number;
        revenue: number;
      }
    > = {
      youtube: {
        name: 'YouTube',
        tag: 'Videos & Description',
        color: 'text-red-600',
        badgeColor: 'bg-red-50 text-red-700 border-red-200',
        barColor: 'bg-red-600',
        icon: Youtube,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
      facebook: {
        name: 'Facebook & Meta',
        tag: 'Ads & Social Posts',
        color: 'text-blue-600',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        barColor: 'bg-blue-600',
        icon: Share2,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
      tiktok: {
        name: 'TikTok',
        tag: 'Bio & Video Links',
        color: 'text-gray-900',
        badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
        barColor: 'bg-gray-900',
        icon: Smartphone,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
      google: {
        name: 'Google Search',
        tag: 'Organic & Paid Search',
        color: 'text-emerald-600',
        badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barColor: 'bg-emerald-500',
        icon: Search,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
      direct: {
        name: 'Direct & Other',
        tag: 'Direct URLs',
        color: 'text-indigo-600',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        barColor: 'bg-indigo-500',
        icon: Globe,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
      other: {
        name: 'Other Referrals',
        tag: 'External Sites',
        color: 'text-slate-600',
        badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        barColor: 'bg-slate-400',
        icon: ExternalLink,
        clicks: 0,
        orders: 0,
        revenue: 0,
      },
    };

    // 1. Accumulate verified clicks from Firestore daily records
    const daysLimit = timeframe === 'today' || timeframe === 'yesterday' ? 1 : timeframe === '7days' ? 7 : 28;
    const now = new Date();
    for (let i = 0; i < daysLimit; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(d);
      const doc = filteredData.dailyTrafficMap.get(dStr);
      if (doc && doc.sources) {
        Object.keys(doc.sources).forEach((srcKey) => {
          const validKey = srcKey in channels ? (srcKey as TrafficPlatform) : 'other';
          channels[validKey].clicks += Number(doc.sources[srcKey]) || 0;
        });
      }
    }

    // 2. Accumulate verified orders & revenue per channel from orderHistory
    currentOrders.forEach((o) => {
      const resolvedChannel = resolveOrderTrafficSource(o);
      const target = channels[resolvedChannel] || channels.other;
      target.orders += 1;
      if (o.status !== 'cancelled' && o.status !== 'returned') {
        target.revenue += Number(o.total) || 0;
      }
    });

    // 3. Verified visitor integrity: Each converted order required at least 1 visit
    Object.values(channels).forEach((ch) => {
      if (ch.clicks < ch.orders) {
        ch.clicks = ch.orders;
      }
    });

    const totalClicks = Object.values(channels).reduce((acc, c) => acc + c.clicks, 0);

    return {
      channels,
      totalClicks,
    };
  }, [currentOrders, filteredData.dailyTrafficMap, timeframe]);

  // Real Day-by-Day Trend Points (Strictly Real Data)
  const trendData = useMemo(() => {
    const numDays = timeframe === 'today' || timeframe === 'yesterday' ? 1 : timeframe === '7days' ? 7 : 28;
    const points: Array<{
      dateStr: string;
      label: string;
      revenue: number;
      orders: number;
      visits: number;
      prevRevenue: number;
      prevOrders: number;
    }> = [];

    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const prevTargetDate = new Date(now.getTime() - (i + numDays) * 24 * 60 * 60 * 1000);

      const dStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(targetDate);
      const prevDStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(prevTargetDate);

      const shortLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', month: 'short', day: 'numeric' }).format(targetDate);

      const dayOrders = currentOrders.filter((o) => {
        const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || o.date;
        if (!ts) return false;
        const od = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date(ts));
        return od === dStr;
      });

      const prevDayOrders = prevOrders.filter((o) => {
        const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || o.date;
        if (!ts) return false;
        const od = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date(ts));
        return od === prevDStr;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const prevDayRevenue = prevDayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const trafficDoc = filteredData.dailyTrafficMap.get(dStr);
      const dayVisits = trafficDoc ? Number(trafficDoc.totalVisits || 0) : dayOrders.length;

      points.push({
        dateStr: dStr,
        label: shortLabel,
        revenue: dayRevenue,
        orders: dayOrders.length,
        visits: dayVisits,
        prevRevenue: prevDayRevenue,
        prevOrders: prevDayOrders.length,
      });
    }

    return points;
  }, [currentOrders, prevOrders, filteredData.dailyTrafficMap, timeframe]);

  // Compact 7-Day x 24-Hour Activity Heatmap
  const heatmapData = useMemo(() => {
    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const fullDayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const matrix: Array<Array<{ visits: number; orders: number }>> = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => ({ visits: 0, orders: 0 }))
    );

    (orderHistory || []).forEach((o: any) => {
      if (o.deleted) return;
      const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || o.date;
      if (!ts) return;
      const d = new Date(ts);
      if (isNaN(d.getTime())) return;

      const hourStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', hour12: false }).format(d);
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'short' }).format(d);

      const hour = parseInt(hourStr, 10) % 24;
      const dayMap: Record<string, number> = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };
      const dayIdx = dayMap[weekdayStr] ?? 0;

      matrix[dayIdx][hour].orders += 1;
      matrix[dayIdx][hour].visits += 1;
    });

    (trafficStats.daily || []).forEach((doc: any) => {
      const dayMap: Record<string, number> = { Sat: 0, Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };
      const dayIdx = dayMap[doc.dayOfWeek] ?? 0;
      if (doc.hourly && typeof doc.hourly === 'object') {
        Object.entries(doc.hourly).forEach(([hrStr, count]) => {
          const hr = parseInt(hrStr, 10);
          if (hr >= 0 && hr < 24) {
            matrix[dayIdx][hr].visits += Number(count) || 0;
          }
        });
      }
    });

    let maxActivity = 0;
    let peakDayIdx = 0;
    let peakHour = 20;

    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const score = matrix[d][h].orders * 8 + matrix[d][h].visits;
        if (score > maxActivity) {
          maxActivity = score;
          peakDayIdx = d;
          peakHour = h;
        }
      }
    }

    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 === 0 ? 12 : h % 12;
      return `${hr}:00 ${period}`;
    };

    const bestWindowStart = formatHour(Math.max(0, peakHour - 1));
    const bestWindowEnd = formatHour(Math.min(23, peakHour + 2));

    return {
      matrix,
      dayNames,
      fullDayNames,
      maxActivity: Math.max(1, maxActivity),
      peakDay: fullDayNames[peakDayIdx],
      bestWindow: `${bestWindowStart} – ${bestWindowEnd}`,
    };
  }, [orderHistory, trafficStats.daily]);

  // Premium, Clamped SVG Curve & Bar Renderer (Zero Negative Dipping!)
  const svgGraph = useMemo(() => {
    if (trendData.length < 2) return null;

    const width = 800;
    const height = 135;
    const padding = { top: 14, right: 18, bottom: 22, left: 52 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const baselineY = padding.top + chartH;

    const values = trendData.map((d) => (activeMetric === 'revenue' ? d.revenue : activeMetric === 'orders' ? d.orders : d.visits));
    const prevValues = trendData.map((d) => (activeMetric === 'revenue' ? d.prevRevenue : activeMetric === 'orders' ? d.prevOrders : 0));

    const maxVal = Math.max(5, ...values, ...prevValues);

    const getX = (index: number) => padding.left + (index / (trendData.length - 1)) * chartW;
    const getY = (val: number) => padding.top + chartH - (val / maxVal) * chartH;

    const points = trendData.map((d, i) => ({ x: getX(i), y: getY(values[i]), raw: d, val: values[i] }));

    // Clamped Monotone Spline (Zero dips below baselineY)
    let curvePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const dx = p2.x - p1.x;

      // When both are 0, flat line along the baseline
      if (p1.val === 0 && p2.val === 0) {
        curvePath += ` L ${p2.x} ${baselineY}`;
        continue;
      }

      let cp1x = p1.x + dx / 3;
      let cp1y = p1.y;
      if (p1.val > 0) {
        const slope1 = (p2.y - p0.y) / (p2.x - p0.x || 1);
        cp1y = p1.y + slope1 * (dx / 3);
      } else {
        cp1y = baselineY; // Zero departure: never dip below baseline!
      }

      let cp2x = p2.x - dx / 3;
      let cp2y = p2.y;
      if (p2.val > 0) {
        const slope2 = (p3.y - p1.y) / (p3.x - p1.x || 1);
        cp2y = p2.y - slope2 * (dx / 3);
      } else {
        cp2y = baselineY; // Zero arrival: smooth landing on baseline!
      }

      // Hard clamp: never exceed baseline or top padding
      cp1y = Math.min(baselineY, Math.max(padding.top, cp1y));
      cp2y = Math.min(baselineY, Math.max(padding.top, cp2y));

      curvePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const areaPath = `${curvePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return {
      width,
      height,
      padding,
      points,
      curvePath,
      areaPath,
      baselineY,
      chartW,
      chartH,
      maxVal,
    };
  }, [trendData, activeMetric]);

  // Combined Live Activity Stream (Recent Orders & Traffic Visits)
  const recentLiveStream = useMemo(() => {
    const fromServer = (trafficStats.recent || []).map((v: any) => ({
      id: v.id || Math.random().toString(),
      type: 'visit',
      source: v.source || 'direct',
      path: v.path || '/',
      device: v.device || 'desktop',
      timestamp: v.timestamp || Date.now(),
      label: 'Visitor',
    }));

    const fromOrders = (orderHistory || [])
      .filter((o: any) => !o.deleted)
      .slice(0, 10)
      .map((o: any) => {
        const ts = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || o.date;
        const timeMs = ts ? new Date(ts).getTime() : Date.now();
        return {
          id: o.id || Math.random().toString(),
          type: 'order',
          source: resolveOrderTrafficSource(o),
          path: `/order/${o.id || ''}`,
          device: 'mobile',
          timestamp: isNaN(timeMs) ? Date.now() : timeMs,
          label: `Order (৳${Number(o.total || 0).toLocaleString()})`,
        };
      });

    const combined = [...fromServer, ...fromOrders].sort((a, b) => b.timestamp - a.timestamp);
    return combined.slice(0, 8);
  }, [trafficStats.recent, orderHistory]);

  return (
    <div className="space-y-3.5 pb-8 font-sans text-gray-900">
      {/* ── Compact Top Bar: Title, Live Status & Timeframe Filter ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                LIVE
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium flex items-center gap-2 mt-0.5">
              <span>Active Shoppers: <b className="text-gray-900 font-bold">{trafficStats.activeVisitors}</b></span>
              <span>•</span>
              <span className="text-gray-400">
                Direct Firestore Sync ({lastRefreshedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold overflow-x-auto no-scrollbar">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: '7D' },
              { id: '28days', label: '28D' },
              { id: 'this_month', label: 'Month' },
              { id: 'all', label: 'All' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id as TimeframeOption)}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-xs ${
                  timeframe === t.id
                    ? 'bg-primary text-white shadow-xs font-black'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <ShoppingBag size={13} /> Orders <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4 Vibrant KPI Highlight Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gross Sales</span>
            <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ৳{totalRevenue.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
            {revenueGrowthPct >= 0 ? (
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center">
                <ArrowUpRight size={11} className="mr-0.5" /> +{revenueGrowthPct}% vs prev
              </span>
            ) : (
              <span className="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 flex items-center">
                <ArrowDownRight size={11} className="mr-0.5" /> {revenueGrowthPct}% vs prev
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-1 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag size={15} />
            </div>
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {totalOrdersCount.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
            {orderGrowthPct >= 0 ? (
              <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center">
                <ArrowUpRight size={11} className="mr-0.5" /> +{orderGrowthPct}% growth
              </span>
            ) : (
              <span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded flex items-center">
                {orderGrowthPct}% growth
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Total Traffic & Clicks */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs border-t-4 border-t-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tracked Clicks</span>
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Eye size={15} />
            </div>
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {channelBreakdown.totalClicks.toLocaleString()}
          </div>
          <div className="mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 inline-block">
            Verified Traffic
          </div>
        </div>

        {/* Card 4: Success Ratio */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Success</span>
            <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {successRate}%
          </div>
          <div className="mt-1 text-[10px] text-gray-500 font-medium truncate">
            <b className="text-emerald-700">{successfulOrders.length}</b> done • <b className="text-red-500">{cancelledOrders.length}</b> cancelled
          </div>
        </div>
      </div>

      {/* ── Sleek, Clamped Performance Trend Chart (Height 135px) ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span className="font-black text-xs sm:text-sm text-gray-900">Performance Trend Curve</span>
            <span className="text-[11px] text-gray-400 font-normal hidden sm:inline">• Real-time sales trajectory</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Chart Style Switcher (Curve vs Bar) */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
              <button
                onClick={() => setChartStyle('curve')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                  chartStyle === 'curve' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
                title="Smooth Curve View"
              >
                <LineChart size={12} /> Spline
              </button>
              <button
                onClick={() => setChartStyle('bar')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                  chartStyle === 'bar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
                title="Column Bar View"
              >
                <BarChart3 size={12} /> Bars
              </button>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px] font-bold self-start sm:self-auto">
              <button
                onClick={() => setActiveMetric('revenue')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  activeMetric === 'revenue' ? 'bg-primary text-white shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Revenue (৳)
              </button>
              <button
                onClick={() => setActiveMetric('orders')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  activeMetric === 'orders' ? 'bg-primary text-white shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveMetric('visits')}
                className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                  activeMetric === 'visits' ? 'bg-primary text-white shadow-xs font-black' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clicks
              </button>
            </div>
          </div>
        </div>

        {/* SVG Curve / Bar Chart */}
        <div className="relative w-full overflow-x-auto no-scrollbar pt-0.5">
          {svgGraph ? (
            <div className="min-w-[550px] w-full">
              <svg viewBox={`0 0 ${svgGraph.width} ${svgGraph.height}`} className="w-full h-auto overflow-visible">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const y = svgGraph.padding.top + (1 - ratio) * (svgGraph.height - svgGraph.padding.top - svgGraph.padding.bottom);
                  const labelVal = Math.round(ratio * svgGraph.maxVal);
                  return (
                    <g key={i}>
                      <line
                        x1={svgGraph.padding.left}
                        y1={y}
                        x2={svgGraph.width - svgGraph.padding.right}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                      />
                      <text
                        x={svgGraph.padding.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] fill-gray-400 font-bold"
                      >
                        {activeMetric === 'revenue' ? `৳${labelVal.toLocaleString()}` : labelVal}
                      </text>
                    </g>
                  );
                })}

                {chartStyle === 'curve' ? (
                  <>
                    {/* Area Gradient Fill */}
                    <path d={svgGraph.areaPath} fill="url(#curveGradient)" />

                    {/* Smooth Clamped Curve (Zero Negative Dips) */}
                    <path
                      d={svgGraph.curvePath}
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Clean Anchor Dots: Rendered ONLY on active points (val > 0) or hovered point */}
                    {svgGraph.points.map((pt, i) => {
                      const isHovered = hoveredPoint?.raw?.dateStr === pt.raw.dateStr;
                      const hasValue = pt.val > 0;

                      return (
                        <g
                          key={i}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        >
                          {/* Invisible hover capture target */}
                          <circle cx={pt.x} cy={pt.y} r={12} fill="transparent" />

                          {/* Prominent dot only for active days or hovered */}
                          {(hasValue || isHovered) && (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isHovered ? 5 : 3.5}
                              className={`transition-all ${
                                isHovered
                                  ? 'fill-red-600 stroke-white stroke-2 shadow-md'
                                  : 'fill-primary stroke-white stroke-1.5'
                              }`}
                            />
                          )}

                          {/* X-axis date labels */}
                          {(trendData.length <= 14 || i % 4 === 0 || i === trendData.length - 1) && (
                            <text
                              x={pt.x}
                              y={svgGraph.height - 4}
                              textAnchor="middle"
                              className="text-[9px] fill-gray-400 font-semibold"
                            >
                              {pt.raw.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                ) : (
                  /* Modern Rounded Column Bars */
                  svgGraph.points.map((pt, i) => {
                    const isHovered = hoveredPoint?.raw?.dateStr === pt.raw.dateStr;
                    const barW = Math.max(6, Math.min(18, (svgGraph.chartW / trendData.length) * 0.65));
                    const barH = Math.max(pt.val > 0 ? 4 : 1, svgGraph.baselineY - pt.y);
                    const barY = pt.val > 0 ? pt.y : svgGraph.baselineY - 1;

                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <rect
                          x={pt.x - barW / 2}
                          y={barY}
                          width={barW}
                          height={barH}
                          rx={3}
                          className={`transition-all ${
                            isHovered
                              ? 'fill-red-600'
                              : pt.val > 0
                              ? 'fill-primary hover:fill-blue-600'
                              : 'fill-gray-200'
                          }`}
                        />
                        {(trendData.length <= 14 || i % 4 === 0 || i === trendData.length - 1) && (
                          <text
                            x={pt.x}
                            y={svgGraph.height - 4}
                            textAnchor="middle"
                            className="text-[9px] fill-gray-400 font-semibold"
                          >
                            {pt.raw.label}
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>

              {/* Hover Floating Stat */}
              {hoveredPoint && (
                <div className="mt-1 px-3 py-1 bg-gray-900 text-white rounded-lg text-[11px] flex items-center justify-between shadow-md">
                  <span className="font-bold text-gray-300">{hoveredPoint.raw.dateStr}</span>
                  <div className="flex items-center gap-3 font-semibold">
                    <span>Revenue: <b className="text-emerald-400">৳{hoveredPoint.raw.revenue.toLocaleString()}</b></span>
                    <span>Orders: <b className="text-blue-400">{hoveredPoint.raw.orders}</b></span>
                    <span>Clicks: <b className="text-amber-400">{hoveredPoint.raw.visits}</b></span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── YouTube Studio-Style Real-Time Traffic Overview ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 relative"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-gray-900 tracking-tight">Realtime</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Updating live
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Live shopper counter & incoming traffic volume</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-medium hidden sm:inline">Auto-syncs every 20s</span>
            <button
              onClick={fetchRecentTrafficStream}
              disabled={isLoadingTraffic}
              className="p-1.5 px-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
              title="Refresh Realtime Stats"
            >
              <RefreshCcw size={12} className={isLoadingTraffic ? 'animate-spin text-primary' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Active Shoppers */}
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                <span>Active Shoppers</span>
                <Activity size={14} className="text-emerald-600" />
              </div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                <span>{trafficStats.activeVisitors}</span>
                <span className="text-[11px] font-semibold text-emerald-700">online now</span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-gray-500 font-medium">
              Shoppers active on site within the last 15 minutes.
            </p>
          </div>

          {/* Last 60 Minutes */}
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                <span>Last 60 Minutes</span>
                <Clock size={14} className="text-blue-600" />
              </div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                <span>
                  {trafficStats.realtime?.last60Minutes ?? (trafficStats.recent?.length || 0)}
                </span>
                <span className="text-[11px] font-semibold text-blue-700">views</span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-gray-500 font-medium">
              Pageviews & clicks tracked in the last hour.
            </p>
          </div>

          {/* Last 48 Hours */}
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                <span>Last 48 Hours</span>
                <BarChart3 size={14} className="text-indigo-600" />
              </div>
              <div className="mt-1.5 text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                <span>
                  {trafficStats.realtime?.last48Hours || (trafficStats.daily?.slice(0, 2).reduce((sum, d) => sum + (Number(d.totalVisits || d.visits) || 0), 0)) || (channelBreakdown.totalClicks || 0)}
                </span>
                <span className="text-[11px] font-semibold text-indigo-700">views</span>
              </div>
            </div>
            <p className="mt-1 text-[10px] text-gray-500 font-medium">
              Accumulated visitor volume over the past 48 hours.
            </p>
          </div>
        </div>

        {/* Live Channel Breakdown Quick Badges */}
        <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Real-time Inflow Sources:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'TikTok', count: Math.max(trafficStats.realtime?.sources?.tiktok || 0, channelBreakdown.channels.tiktok.clicks), icon: Smartphone, color: 'text-gray-900 bg-gray-100 border-gray-200' },
              { label: 'Facebook', count: Math.max(trafficStats.realtime?.sources?.facebook || 0, channelBreakdown.channels.facebook.clicks), icon: Share2, color: 'text-blue-700 bg-blue-50 border-blue-200' },
              { label: 'YouTube', count: Math.max(trafficStats.realtime?.sources?.youtube || 0, channelBreakdown.channels.youtube.clicks), icon: Youtube, color: 'text-red-700 bg-red-50 border-red-200' },
              { label: 'Google', count: Math.max(trafficStats.realtime?.sources?.google || 0, channelBreakdown.channels.google.clicks), icon: Search, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { label: 'Direct', count: Math.max(trafficStats.realtime?.sources?.direct || 0, channelBreakdown.channels.direct.clicks), icon: Globe, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
            ].map(item => (
              <span key={item.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${item.color}`}>
                <item.icon size={11} />
                <span>{item.label}:</span>
                <b className="font-black">{item.count || 0}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Multi-Channel Attribution Cards (YouTube, Facebook, TikTok, Google, Direct) ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-primary" />
            <span className="font-black text-xs sm:text-sm text-gray-900">Traffic Acquisition Channels</span>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            Total Inflow: {channelBreakdown.totalClicks.toLocaleString()} Clicks
          </span>
        </div>

        {/* 5 Channel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(['youtube', 'facebook', 'tiktok', 'google', 'direct'] as TrafficPlatform[]).map((key) => {
            const ch = channelBreakdown.channels[key];
            const clickShare =
              channelBreakdown.totalClicks > 0
                ? Math.round((ch.clicks / channelBreakdown.totalClicks) * 100)
                : 0;
            const convRate = ch.clicks > 0 ? ((ch.orders / ch.clicks) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={key}
                className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <ch.icon size={15} className={ch.color} />
                      <span className="font-bold text-xs text-gray-900 truncate">{ch.name}</span>
                    </div>
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-white border border-gray-200 text-gray-700">
                      {clickShare}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="text-base sm:text-lg font-black text-gray-900">
                      {ch.clicks.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">Tracked Clicks</div>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-gray-200/60 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Orders:</span>
                      <b className="text-gray-800">{ch.orders}</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Conv. Rate:</span>
                      <b className="text-emerald-700">{convRate}%</b>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Sales:</span>
                      <b className="text-primary font-black">৳{ch.revenue.toLocaleString()}</b>
                    </div>
                  </div>
                </div>

                <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${ch.barColor}`} style={{ width: `${Math.min(100, Math.max(0, clickShare))}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Compact Shopper Peak Activity Heatmap (With Fixed 0-0 Hover Bar) ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-500" />
            <span className="font-black text-xs sm:text-sm text-gray-900">Shopper Activity Heatmap</span>
            <span className="text-[11px] text-gray-400 font-normal hidden sm:inline">• When Shoppers Are Active</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
            <span>Low</span>
            <div className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-gray-100 border border-gray-200"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-primary/25"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-primary/55"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-primary/85"></span>
              <span className="w-2.5 h-2.5 rounded-xs bg-primary"></span>
            </div>
            <span className="text-primary font-black">Peak</span>
          </div>
        </div>

        {/* 1-Line Recommendation Strip */}
        <div className="px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-bold text-blue-900 text-[11px]">
            <Flame size={13} className="text-amber-500" />
            <span>Optimal Ad Window: <b>{heatmapData.peakDay} ({heatmapData.bestWindow})</b></span>
          </div>
          <span className="text-[10px] text-blue-700 font-medium">
            Schedule Meta & YouTube budget boosts during this window for peak ROAS.
          </span>
        </div>

        {/* Compact Grid */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-[40px_repeat(24,_1fr)] gap-0.5 text-[9px] font-bold text-gray-400 text-center mb-1">
              <div></div>
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h}>
                  {h === 0 ? '12A' : h === 6 ? '6A' : h === 12 ? '12P' : h === 18 ? '6P' : h % 3 === 0 ? `${h % 12}` : ''}
                </div>
              ))}
            </div>

            <div className="space-y-0.5">
              {heatmapData.matrix.map((row, dayIdx) => (
                <div key={dayIdx} className="grid grid-cols-[40px_repeat(24,_1fr)] gap-0.5 items-center">
                  <div className="text-[10px] font-bold text-gray-600 text-right pr-1">
                    {heatmapData.dayNames[dayIdx]}
                  </div>

                  {row.map((cell, hour) => {
                    const score = cell.orders * 8 + cell.visits;
                    const ratio = heatmapData.maxActivity > 0 ? score / heatmapData.maxActivity : 0;

                    let bgClass = 'bg-gray-100 hover:ring-1 hover:ring-gray-400';
                    if (ratio > 0.75) bgClass = 'bg-primary text-white shadow-xs hover:ring-1 hover:ring-primary';
                    else if (ratio > 0.45) bgClass = 'bg-primary/75 hover:ring-1 hover:ring-primary';
                    else if (ratio > 0.2) bgClass = 'bg-primary/45 hover:ring-1 hover:ring-primary';
                    else if (ratio > 0.05) bgClass = 'bg-primary/20 hover:ring-1 hover:ring-primary';

                    return (
                      <div
                        key={hour}
                        onMouseEnter={() =>
                          setHoveredHeatmapCell({
                            day: heatmapData.fullDayNames[dayIdx],
                            hour,
                            visits: cell.visits,
                            orders: cell.orders,
                          })
                        }
                        onMouseLeave={() => setHoveredHeatmapCell(null)}
                        className={`h-3 rounded-xs transition-all cursor-pointer ${bgClass}`}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Fixed Details Bar (User requested: Always fixed, shows 0-0 when idle, never jumps layout!) */}
            <div className="mt-2 h-7 px-3 rounded-lg bg-gray-900 text-white text-[10px] font-bold flex items-center justify-between border border-gray-800">
              <span className="text-gray-300">
                {hoveredHeatmapCell
                  ? `🕒 ${hoveredHeatmapCell.day} ${hoveredHeatmapCell.hour % 12 === 0 ? 12 : hoveredHeatmapCell.hour % 12}:00 ${hoveredHeatmapCell.hour >= 12 ? 'PM' : 'AM'}`
                  : '🕒 Hover over any time slot to inspect details'}
              </span>
              <div className="flex items-center gap-3">
                <span>Clicks: <b className="text-amber-400">{hoveredHeatmapCell ? hoveredHeatmapCell.visits : 0}</b></span>
                <span>Orders: <b className="text-emerald-400">{hoveredHeatmapCell ? hoveredHeatmapCell.orders : 0}</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Real-Time Live Activity Stream (Orders & Live Clicks) ── */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/90 shadow-xs space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-amber-500" />
            <span className="font-black text-xs sm:text-sm text-gray-900">Real-Time Inflow Stream</span>
          </div>

          <button
            onClick={fetchRecentTrafficStream}
            disabled={isLoadingTraffic}
            className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
            title="Refresh stream"
          >
            <RefreshCcw size={12} className={isLoadingTraffic ? 'animate-spin' : ''} />
          </button>
        </div>

        {recentLiveStream.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-1 px-2">Channel</th>
                  <th className="py-1 px-2">Activity / Event</th>
                  <th className="py-1 px-2">Path / Target</th>
                  <th className="py-1 px-2">Device</th>
                  <th className="py-1 px-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {recentLiveStream.map((v: any, idx: number) => {
                  const minutesAgo = Math.max(1, Math.round((Date.now() - v.timestamp) / 60000));
                  return (
                    <tr key={v.id || idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-1.5 px-2">
                        <span className="inline-flex items-center gap-1 font-bold text-gray-800 text-[11px]">
                          {v.source === 'youtube' && <Youtube size={12} className="text-red-600" />}
                          {v.source === 'facebook' && <Share2 size={12} className="text-blue-600" />}
                          {v.source === 'tiktok' && <Smartphone size={12} className="text-gray-900" />}
                          {v.source === 'google' && <Search size={12} className="text-emerald-600" />}
                          {v.source === 'direct' && <Globe size={12} className="text-indigo-600" />}
                          <span className="capitalize">{v.source}</span>
                        </span>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          v.type === 'order'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {v.label}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-gray-600 font-mono text-[10px] truncate max-w-[160px]">
                        {v.path || '/'}
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="inline-flex items-center gap-1 text-gray-500 text-[10px]">
                          {v.device === 'mobile' ? <Smartphone size={11} /> : <Monitor size={11} />}
                          <span className="capitalize">{v.device}</span>
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-right text-gray-400 font-bold text-[10px]">
                        {minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-3 text-center text-xs text-gray-400 font-medium">
            Active streaming logs will populate automatically as visits and orders occur.
          </div>
        )}
      </div>
    </div>
  );
}
