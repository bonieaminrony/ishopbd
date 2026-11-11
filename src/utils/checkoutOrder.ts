/**
 * Safely persists customer-created orders without allowing Firestore product
 * permission restrictions (`products` write denied to non-moderators) to fail
 * guest or customer checkout completion.
 */
export async function persistCustomerOrderSafely(params: {
  writeOrder: () => Promise<unknown>;
  stockTasks?: Array<() => Promise<unknown>>;
  canClientUpdateStock: boolean;
}): Promise<void> {
  await params.writeOrder();

  if (!params.canClientUpdateStock || !Array.isArray(params.stockTasks) || params.stockTasks.length === 0) {
    return;
  }

  await Promise.allSettled(params.stockTasks.map((run) => run().catch(() => undefined)));
}
