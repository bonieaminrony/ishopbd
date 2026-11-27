import { describe, it, expect } from 'vitest';
import { isDashboardPath, dashboardPathForTab, dashboardTabFromPath } from '../utils/dashboardRoute';

describe('dashboard address', () => {
  it('recognises /dashboard and its tabs only', () => {
    expect(isDashboardPath('/dashboard')).toBe(true);
    expect(isDashboardPath('/dashboard/orders')).toBe(true);
    expect(isDashboardPath('/dashboards')).toBe(false);
    expect(isDashboardPath('/p/dashboard-stand')).toBe(false);
  });
  it('round-trips every tab, including pre-orders', () => {
    expect(dashboardPathForTab('analytics')).toBe('/dashboard');
    expect(dashboardPathForTab('incomplete_orders')).toBe('/dashboard/incomplete-orders');
    expect(dashboardPathForTab('orders', true)).toBe('/dashboard/pre-orders');
    expect(dashboardTabFromPath('/dashboard/incomplete-orders')).toEqual({ tab: 'incomplete_orders', preOrders: false });
    expect(dashboardTabFromPath('/dashboard/pre-orders')).toEqual({ tab: 'orders', preOrders: true });
    expect(dashboardTabFromPath('/dashboard')).toEqual({ tab: 'analytics', preOrders: false });
  });
  it('falls back to analytics for an unknown tab', () => {
    expect(dashboardTabFromPath('/dashboard/whatever')).toEqual({ tab: 'analytics', preOrders: false });
  });
});
