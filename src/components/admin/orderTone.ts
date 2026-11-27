// One place for order status colours in the admin (see ".tone-*" in index.css).
// pending = light violet, confirmed = light green, cancelled = light red, and so on.

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled'] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

/** "tone-pending", "tone-cancelled" ... ("tone-neutral" for anything unknown) */
export const orderTone = (status?: string | null): string =>
  status && (ORDER_STATUSES as readonly string[]).includes(status) ? `tone-${status}` : 'tone-neutral';

/** Small see-through status badge / select */
export const orderStatusChip = (status?: string | null): string => `${orderTone(status)} tone-chip`;

/** Card on phones: light status tint + coloured edge on the left */
export const orderStatusCard = (status?: string | null): string => `${orderTone(status)} tone-card`;

/** Table row on computers */
export const orderStatusRow = (status?: string | null): string => `${orderTone(status)} tone-row`;
