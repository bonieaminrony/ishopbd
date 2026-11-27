/**
 * Addresses for the admin panel: /dashboard and /dashboard/<tab>.
 * Tab ids use underscores in code (incomplete_orders); the address uses dashes (incomplete-orders).
 * The Pre Order view is the orders tab filtered to pre-orders, so it gets its own address.
 */
export const DASHBOARD_TABS = [
  'analytics', 'orders', 'incomplete_orders', 'support', 'pos', 'deleted_orders', 'products',
  'categories', 'refunds', 'reports', 'low_stock', 'users', 'campaigns', 'bulk_sms', 'reviews',
  'settings', 'profit_analysis',
] as const;

const PRE_ORDERS_SLUG = 'pre-orders';

export function isDashboardPath(pathname: string): boolean {
  return /^\/dashboard(?:\/|$)/i.test(pathname || '');
}

export function dashboardPathForTab(tab: string, preOrders = false): string {
  if (tab === 'orders' && preOrders) return `/dashboard/${PRE_ORDERS_SLUG}`;
  if (!tab || tab === 'analytics') return '/dashboard';
  return `/dashboard/${String(tab).replace(/_/g, '-')}`;
}

export function dashboardTabFromPath(pathname: string): { tab: string; preOrders: boolean } | null {
  const match = /^\/dashboard(?:\/([^/?#]+))?/i.exec(pathname || '');
  if (!match) return null;
  const slug = (match[1] || '').toLowerCase();
  if (!slug) return { tab: 'analytics', preOrders: false };
  if (slug === PRE_ORDERS_SLUG) return { tab: 'orders', preOrders: true };
  const tab = slug.replace(/-/g, '_');
  return (DASHBOARD_TABS as readonly string[]).includes(tab) ? { tab, preOrders: false } : { tab: 'analytics', preOrders: false };
}
