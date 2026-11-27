import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  RefreshCcw,
  Youtube,
  Facebook,
  Search,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Music2,
  Users,
  MousePointerClick,
  ShoppingBag,
  Wallet,
  Percent,
  ChevronRight,
  X,
} from 'lucide-react';
import axios from 'axios';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { resolveOrderTrafficSource, TrafficPlatform } from '../../utils/tracking';
import { getAdminAuthHeaders } from '../../utils/adminAuth';

export interface AdminAnalyticsTabProps {
  orderHistory: any[];
  products: any[];
  onNavigateToOrders?: () => void;
  /** Opens the full order details (customer, address, items) */
  onOpenOrder?: (order: any) => void;
  adminViewMode?: string;
}

type Timeframe = 'today' | 'yesterday' | '7days' | '28days' | 'this_month';

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'today', label: 'আজ' },
  { id: 'yesterday', label: 'গতকাল' },
  { id: '7days', label: '৭ দিন' },
  { id: '28days', label: '২৮ দিন' },
  { id: 'this_month', label: 'এই মাস' },
];

const SOURCES: { id: TrafficPlatform; name: string; icon: any; color: string }[] = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#4f8cff' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#ff4d4d' },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: '#2ee6d6' },
  { id: 'google', name: 'Google', icon: Search, color: '#34c77b' },
  { id: 'direct', name: 'Direct', icon: Globe, color: '#c8c8d4' },
  { id: 'other', name: 'Other', icon: ExternalLink, color: '#9b9ba7' },
];
const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s])) as Record<string, (typeof SOURCES)[number]>;

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-red-50 text-red-700',
};

const ORDERS_PAGE = 25;

// ---------- date helpers (all in Dhaka time) ----------
const dhakaDay = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(d);
const dhakaHour = (d: Date) =>
  parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: 'numeric', hour12: false }).format(d), 10) % 24;
const orderDate = (o: any): Date | null => {
  const ts = o?.createdAt?.seconds ? o.createdAt.seconds * 1000 : o?.createdAt || o?.date;
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};
const daysFor = (tf: Timeframe, now: Date): string[] => {
  const day = 24 * 3600 * 1000;
  if (tf === 'today') return [dhakaDay(now)];
  if (tf === 'yesterday') return [dhakaDay(new Date(now.getTime() - day))];
  if (tf === '7days' || tf === '28days') {
    const n = tf === '7days' ? 7 : 28;
    return Array.from({ length: n }, (_, i) => dhakaDay(new Date(now.getTime() - (n - 1 - i) * day)));
  }
  const today = dhakaDay(now);
  const dom = parseInt(today.slice(8, 10), 10);
  return Array.from({ length: dom }, (_, i) => `${today.slice(0, 8)}${String(i + 1).padStart(2, '0')}`);
};
const previousDays = (days: string[]) => {
  const first = new Date(`${days[0]}T12:00:00+06:00`);
  return Array.from({ length: days.length }, (_, i) =>
    dhakaDay(new Date(first.getTime() - (days.length - i) * 24 * 3600 * 1000))
  );
};

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');
const taka = (n: number) => `৳${fmt(n)}`;
const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);
const timeAgo = (ts: number) => {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return 'এইমাত্র';
  if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} ঘণ্টা আগে` : `${Math.floor(h / 24)} দিন আগে`;
};

// Visitors of a day: people (unique) when recorded, otherwise page loads for older days
const dayVisitors = (d: any) => Number(d?.uniqueVisitors) || Number(d?.totalVisits ?? d?.visits) || 0;
const daySourceVisitors = (d: any, src: string) => {
  if (!d) return 0;
  if (d.uniqueBySource && typeof d.uniqueBySource === 'object') return Number(d.uniqueBySource[src]) || 0;
  return Number(d.sources?.[src]) || 0;
};

export default function AdminAnalyticsTab({ orderHistory = [], onNavigateToOrders, onOpenOrder }: AdminAnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [daily, setDaily] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [sourceFilter, setSourceFilter] = useState<TrafficPlatform | 'all'>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [ordersShown, setOrdersShown] = useState(ORDERS_PAGE);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Daily counters stored in Firestore (Node server)
  useEffect(() => {
    try {
      const q = query(collection(db, 'traffic_daily'), orderBy('date', 'desc'), limit(62));
      return onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (docs.length) setDaily((prev) => (prev.length ? prev : docs));
        },
        () => {}
      );
    } catch {
      return undefined;
    }
  }, []);

  // Live numbers + daily counters from the server (live site: PHP)
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAdminAuthHeaders();
      const res = await axios.get('/api/admin/traffic-stats', { timeout: 10000, headers });
      if (res.data?.success) {
        if (Array.isArray(res.data.daily) && res.data.daily.length) setDaily(res.data.daily);
        setRecent(res.data.recent || []);
        setRealtime(res.data.realtime || null);
        setLastRefreshedAt(new Date());
      }
    } catch {
      // keep the last numbers on screen
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => setOrdersShown(ORDERS_PAGE), [timeframe, sourceFilter, orderSearch]);

  const data = useMemo(() => {
    const now = new Date();
    const days = daysFor(timeframe, now);
    const prevDaysList = previousDays(days);
    const daySet = new Set(days);
    const prevSet = new Set(prevDaysList);
    const byDate = new Map<string, any>(daily.map((d: any) => [d.date || d.id, d]));

    const liveOrders = (orderHistory || []).filter((o: any) => !o?.deleted);
    const inRange = (o: any, set: Set<string>) => {
      const d = orderDate(o);
      return !!d && set.has(dhakaDay(d));
    };
    const orders = liveOrders
      .filter((o) => inRange(o, daySet))
      .sort((a, b) => (orderDate(b)?.getTime() || 0) - (orderDate(a)?.getTime() || 0));
    const prevOrders = liveOrders.filter((o) => inRange(o, prevSet));
    const isSale = (o: any) => o.status !== 'cancelled' && o.status !== 'returned';
    const revenue = (list: any[]) => list.filter(isSale).reduce((s, o) => s + (Number(o.total) || 0), 0);

    const sumDays = (list: string[], f: (d: any) => number) => list.reduce((s, k) => s + f(byDate.get(k)), 0);
    const visitors = sumDays(days, dayVisitors);
    const prevVisitors = sumDays(prevDaysList, dayVisitors);
    const pageViews = sumDays(days, (d) => Number(d?.totalVisits ?? d?.visits) || 0);
    const clicks = sumDays(days, (d) => Number(d?.productViews) || 0);
    const prevClicks = sumDays(prevDaysList, (d) => Number(d?.productViews) || 0);
    const clicksTracked = days.some((k) => byDate.get(k)?.productViews !== undefined) || daily.some((d) => d?.productViews !== undefined);

    // Per source: visitors -> product clicks -> orders -> sales
    const sources = SOURCES.map((s) => {
      const srcOrders = orders.filter((o) => (resolveOrderTrafficSource(o) || 'other') === s.id);
      let v = sumDays(days, (d) => daySourceVisitors(d, s.id));
      const c = sumDays(days, (d) => Number(d?.productViewsBySource?.[s.id]) || 0);
      // every order needed at least one visitor
      v = Math.max(v, srcOrders.length);
      return { ...s, visitors: v, clicks: c, orders: srcOrders.length, revenue: revenue(srcOrders) };
    });

    // Trend: hours for a single day, days otherwise
    let trend: { label: string; visitors: number; orders: number }[];
    if (days.length === 1) {
      const d = byDate.get(days[0]);
      trend = Array.from({ length: 24 }, (_, h) => ({
        label: `${h}`,
        visitors: Number(d?.hourly?.[h] ?? d?.hourly?.[String(h)]) || 0,
        orders: orders.filter((o) => dhakaHour(orderDate(o)!) === h).length,
      }));
    } else {
      trend = days.map((k) => ({
        label: k.slice(8, 10),
        visitors: dayVisitors(byDate.get(k)),
        orders: orders.filter((o) => dhakaDay(orderDate(o)!) === k).length,
      }));
    }

    return {
      days,
      orders,
      visitors,
      prevVisitors,
      pageViews,
      clicks,
      prevClicks,
      clicksTracked,
      ordersCount: orders.length,
      prevOrdersCount: prevOrders.length,
      revenue: revenue(orders),
      prevRevenue: revenue(prevOrders),
      sources,
      trend,
      singleDay: days.length === 1,
    };
  }, [daily, orderHistory, timeframe]);

  const conversion = pct(data.ordersCount, data.visitors);
  const prevConversion = pct(data.prevOrdersCount, data.prevVisitors);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return data.orders.filter((o: any) => {
      if (sourceFilter !== 'all' && (resolveOrderTrafficSource(o) || 'other') !== sourceFilter) return false;
      if (!q) return true;
      return [o.customerName, o.customerPhone, o.phone, o.id, o.orderId, o.displayId]
        .filter(Boolean)
        .some((v: any) => String(v).toLowerCase().includes(q));
    });
  }, [data.orders, sourceFilter, orderSearch]);

  const maxSourceVisitors = Math.max(1, ...data.sources.map((s) => s.visitors));
  const tfLabel = TIMEFRAMES.find((t) => t.id === timeframe)?.label || '';

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">কতজন এলেন, কোথা থেকে এলেন, আর কতজন কিনলেন</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl p-1" role="tablist" aria-label="Time range">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={timeframe === t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  timeframe === t.id ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="h-9 px-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="Refresh"
          >
            <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
            {lastRefreshedAt
              ? lastRefreshedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Live right now */}
      <div className="bg-white border border-gray-200 rounded-2xl grid grid-cols-3 divide-x divide-gray-200">
        {[
          { label: 'এই মুহূর্তে সাইটে', sub: 'গত ৫ মিনিট', value: realtime?.activeShoppers, live: true },
          { label: 'গত ৬০ মিনিটে', sub: 'জন এসেছেন', value: realtime?.last60Minutes },
          {
            label: 'গত ২৪ ঘণ্টায়',
            sub: realtime && realtime.last24HoursComplete === false ? 'জন (আংশিক হিসাব)' : 'জন এসেছেন',
            value: realtime?.last24HoursVisitors,
          },
        ].map((c, i) => (
          <div key={i} className="px-3 py-3 md:px-5 md:py-4">
            <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-semibold text-gray-500">
              {c.live && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
              {c.label}
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1 price-num">
              {c.value === undefined || c.value === null ? '—' : fmt(c.value)}
            </div>
            <div className="text-[11px] text-gray-400">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* KPIs for the chosen range */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { label: 'ভিজিটর', value: fmt(data.visitors), now: data.visitors, prev: data.prevVisitors, icon: Users, gold: true,
            note: `${fmt(data.pageViews)} পেজ ভিউ` },
          { label: 'প্রোডাক্টে ক্লিক', value: data.clicksTracked ? fmt(data.clicks) : '—', now: data.clicks, prev: data.prevClicks,
            icon: MousePointerClick, note: data.clicksTracked ? `${pct(data.clicks, data.visitors).toFixed(0)}% ভিজিটর ক্লিক করেছেন` : 'আজ থেকে গোনা শুরু' },
          { label: 'অর্ডার', value: fmt(data.ordersCount), now: data.ordersCount, prev: data.prevOrdersCount, icon: ShoppingBag },
          { label: 'বিক্রি', value: taka(data.revenue), now: data.revenue, prev: data.prevRevenue, icon: Wallet, note: 'বাতিল/ফেরত বাদে' },
          { label: 'কনভার্সন', value: `${conversion.toFixed(1)}%`, now: conversion, prev: prevConversion, icon: Percent, note: 'ভিজিটর থেকে অর্ডার' },
        ].map((k) => {
          const diff = k.prev > 0 ? ((k.now - k.prev) / k.prev) * 100 : null;
          const Icon = k.icon;
          return (
            <div key={k.label} className={`bg-white border rounded-2xl p-4 ${k.gold ? 'border-primary/40' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">{k.label}</span>
                <Icon size={15} className={k.gold ? 'text-primary' : 'text-gray-400'} />
              </div>
              <div className={`text-2xl md:text-[28px] font-extrabold mt-2 price-num leading-none ${k.gold ? 'text-primary' : 'text-gray-900'}`}>
                {k.value}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px]">
                {diff !== null && (
                  <span className={`font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {diff >= 0 ? '▲' : '▼'} {Math.abs(diff).toFixed(0)}%
                  </span>
                )}
                <span className="text-gray-400 truncate">{k.note || 'আগের সময়ের তুলনায়'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-base font-extrabold text-gray-900">
            {data.singleDay ? `${tfLabel} — ঘণ্টা অনুযায়ী` : `${tfLabel} — দিন অনুযায়ী`}
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> {data.singleDay ? 'পেজ ভিউ' : 'ভিজিটর'}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-gray-600 rounded-sm" /> অর্ডার</span>
          </div>
        </div>
        <TrendChart points={data.trend} hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} singleDay={data.singleDay} />
      </div>

      {/* Sources: visitors -> clicks -> orders */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 md:px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-gray-900">কোথা থেকে এসেছেন</h3>
            <p className="text-xs text-gray-500 mt-0.5">প্রতিটা প্ল্যাটফর্ম থেকে ভিজিটর, ক্লিক আর অর্ডার — সারিতে চাপলে নিচে সেই অর্ডারগুলো দেখাবে</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold text-gray-400 border-y border-gray-200">
                <th className="text-left font-semibold px-3 md:px-5 py-2">প্ল্যাটফর্ম</th>
                <th className="text-right font-semibold px-2 sm:px-3 py-2">ভিজিটর</th>
                <th className="text-right font-semibold px-2 sm:px-3 py-2">ক্লিক</th>
                <th className="text-right font-semibold px-2 sm:px-3 py-2">অর্ডার</th>
                <th className="hidden sm:table-cell text-right font-semibold px-3 py-2">বিক্রি</th>
                <th className="text-right font-semibold px-3 md:px-5 py-2">কনভার্সন</th>
              </tr>
            </thead>
            <tbody>
              {data.sources.map((s) => {
                const Icon = s.icon;
                const active = sourceFilter === s.id;
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSourceFilter(active ? 'all' : s.id)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-3 md:px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center bg-gray-100 shrink-0" style={{ color: s.color }}>
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900">{s.name}</div>
                          {/* funnel bar: visitors (track) -> clicks -> orders */}
                          <div className="mt-1.5 h-1.5 w-full max-w-[220px] bg-gray-100 rounded-full relative overflow-hidden">
                            <div className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${(s.visitors / maxSourceVisitors) * 100}%`, background: s.color }} />
                            <div className="absolute inset-y-0 left-0 rounded-full opacity-70" style={{ width: `${(s.clicks / maxSourceVisitors) * 100}%`, background: s.color }} />
                            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(s.orders / maxSourceVisitors) * 100}%`, background: s.color }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-2 sm:px-3 py-3 font-bold text-gray-900 price-num">{fmt(s.visitors)}</td>
                    <td className="text-right px-2 sm:px-3 py-3 text-gray-700 price-num">{data.clicksTracked ? fmt(s.clicks) : '—'}</td>
                    <td className="text-right px-2 sm:px-3 py-3 font-bold text-gray-900 price-num">{fmt(s.orders)}</td>
                    <td className="hidden sm:table-cell text-right px-3 py-3 text-gray-700 price-num">{taka(s.revenue)}</td>
                    <td className="text-right px-3 md:px-5 py-3 font-bold text-primary price-num">{pct(s.orders, s.visitors).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Every order with its source */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 md:px-5 pt-4 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-gray-900">
              কোন অর্ডার কোথা থেকে এসেছে
              <span className="ml-2 text-xs font-semibold text-gray-400 price-num">{fmt(filteredOrders.length)} টি</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">অর্ডারে চাপলে কাস্টমারের নাম, ফোন, ঠিকানা আর পণ্যসহ পুরো তথ্য খুলবে</p>
          </div>
          <div className="relative md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="নাম, ফোন বা অর্ডার আইডি"
              className="w-full h-9 pl-8 pr-8 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-primary"
            />
            {orderSearch && (
              <button type="button" onClick={() => setOrderSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 md:px-5 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {[{ id: 'all', name: 'সব', count: data.orders.length } as any, ...data.sources.map((s) => ({ id: s.id, name: s.name, count: s.orders }))].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSourceFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                sourceFilter === c.id ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              {c.name} <span className="opacity-70 price-num">{c.count}</span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 border-t border-gray-100">
            এই সময়ে {sourceFilter !== 'all' ? `${SOURCE_BY_ID[sourceFilter]?.name} থেকে ` : ''}কোনো অর্ডার নেই।
          </div>
        ) : (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {filteredOrders.slice(0, ordersShown).map((o: any) => {
              const src = SOURCE_BY_ID[resolveOrderTrafficSource(o) || 'other'] || SOURCE_BY_ID.other;
              const SrcIcon = src.icon;
              const d = orderDate(o);
              const firstItem = o.items?.[0]?.product?.name || o.items?.[0]?.name || '';
              const moreItems = (o.items?.length || 0) - 1;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => (onOpenOrder ? onOpenOrder(o) : onNavigateToOrders?.())}
                  className="w-full text-left px-4 md:px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0" style={{ color: src.color }} title={src.name}>
                    <SrcIcon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 truncate">{o.customerName || 'Customer'}</span>
                      <span className="text-xs text-gray-500 price-num shrink-0">{o.customerPhone || o.phone || ''}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {firstItem}
                      {moreItems > 0 ? ` +${moreItems}` : ''}
                    </div>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <div className="text-xs font-bold" style={{ color: src.color }}>{src.name}</div>
                    <div className="text-[11px] text-gray-400">{d ? timeAgo(d.getTime()) : ''}</div>
                  </div>
                  <div className="text-right shrink-0 w-24">
                    <div className="font-extrabold text-gray-900 price-num">{taka(Number(o.total) || 0)}</div>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold capitalize ${STATUS_STYLE[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status || 'pending'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
        {filteredOrders.length > ordersShown && (
          <div className="p-3 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => setOrdersShown((n) => n + ORDERS_PAGE)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              আরো দেখুন ({fmt(filteredOrders.length - ordersShown)} টি বাকি)
            </button>
          </div>
        )}
      </div>

      {/* Latest visits */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5">
        <h3 className="text-sm md:text-base font-extrabold text-gray-900 mb-3">সর্বশেষ ভিজিট</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">নতুন কেউ সাইটে এলে এখানে দেখা যাবে।</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-6">
            {recent.slice(0, 12).map((v: any, i: number) => {
              const src = SOURCE_BY_ID[v.source] || SOURCE_BY_ID.other;
              return (
                <div key={v.id || i} className="flex items-center gap-2.5 py-2 border-b border-gray-100 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: src.color }} />
                  <span className="font-bold text-gray-800 w-16 shrink-0">{src.name}</span>
                  <span className="text-gray-500 truncate flex-1">
                    {v.kind === 'product_view' ? 'প্রোডাক্ট দেখেছেন · ' : ''}
                    {v.path || '/'}
                  </span>
                  {v.device === 'mobile' ? <Smartphone size={12} className="text-gray-400 shrink-0" /> : <Monitor size={12} className="text-gray-400 shrink-0" />}
                  <span className="text-gray-400 shrink-0 w-24 text-right">{v.timestamp ? timeAgo(v.timestamp) : ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TrendChart({
  points,
  hoverIdx,
  setHoverIdx,
  singleDay,
}: {
  points: { label: string; visitors: number; orders: number }[];
  hoverIdx: number | null;
  setHoverIdx: (i: number | null) => void;
  singleDay: boolean;
}) {
  const W = 1000;
  const H = 220;
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 26;
  const n = Math.max(points.length, 1);
  const maxV = Math.max(1, ...points.map((p) => p.visitors));
  const maxO = Math.max(1, ...points.map((p) => p.orders));
  const step = (W - padL - padR) / n;
  const x = (i: number) => padL + step * i + step / 2;
  const yV = (v: number) => padT + (H - padT - padB) * (1 - v / maxV);
  const barH = (o: number) => ((H - padT - padB) * 0.45 * o) / maxO;
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yV(p.visitors).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)},${H - padB} L${x(0).toFixed(1)},${H - padB} Z`;
  const labelEvery = n > 16 ? Math.ceil(n / 12) : 1;
  const hp = hoverIdx !== null ? points[hoverIdx] : null;
  const ticks = [0, 0.5, 1].map((f) => Math.round(maxV * f));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px] md:h-[240px]" preserveAspectRatio="none" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yV(t)} y2={yV(t)} stroke="var(--color-gray-200)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={padL - 6} y={yV(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-gray-400)">{t}</text>
          </g>
        ))}
        {points.map((p, i) =>
          p.orders > 0 ? (
            <rect key={`o${i}`} x={x(i) - Math.min(10, step * 0.3)} width={Math.min(20, step * 0.6)} y={H - padB - barH(p.orders)} height={barH(p.orders)} rx="3" fill="var(--color-gray-600)" opacity="0.8" />
          ) : null
        )}
        <path d={area} fill="url(#goldFill)" />
        <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <rect x={x(i) - step / 2} width={step} y={0} height={H} fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            {hoverIdx === i && <circle cx={x(i)} cy={yV(p.visitors)} r="4" fill="var(--color-primary)" />}
            {i % labelEvery === 0 && (
              <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-gray-400)">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hp && (
        <div className="absolute top-0 right-0 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs">
          <div className="font-bold text-gray-900">{singleDay ? `${hp.label}:00 – ${hp.label}:59` : `তারিখ ${hp.label}`}</div>
          <div className="text-primary font-bold price-num">{hp.visitors} {singleDay ? 'পেজ ভিউ' : 'ভিজিটর'}</div>
          <div className="text-gray-600 price-num">{hp.orders} অর্ডার</div>
        </div>
      )}
    </div>
  );
}
