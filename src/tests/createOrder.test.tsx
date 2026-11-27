import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import IncompleteOrderModal, { computeSuggestedDeliveryCharge } from '../components/admin/IncompleteOrderModal';

const products = [
  {
    id: 'koti',
    name: 'Premium Koti',
    code: 'FK-44',
    price: 1380,
    image: '/koti.png',
    weight: 0.4,
    variants: [
      { id: 'v1', name: 'Navy', size: 'M', stock: 10 },
      { id: 'v2', name: 'Navy', size: 'XL', stock: 3 },
    ],
  },
  { id: 'fan', name: 'Mini Hand Fan', code: 'HL-MF2', price: 290, stock: 0, deliveryCharge: 50 },
];

const renderCreate = (onCompleteOrder = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <IncompleteOrderModal
      mode="create"
      order={{ id: 'new_1', __createdByAdmin: true, items: [] }}
      onClose={vi.fn()}
      products={products}
      getProductPrice={(p) => Number(p?.price || 0)}
      getCustomerStats={() => ({ total: 0, delivered: 0 })}
      siteConfig={{ isSmsConfirmEnabled: true }}
      onCompleteOrder={onCompleteOrder}
    />,
  );
  return onCompleteOrder;
};

describe('Create Order (phone orders)', () => {
  it('searches a product by code, picks a size, and places the order with SMS', async () => {
    const onCompleteOrder = renderCreate();
    expect(screen.getByRole('dialog', { name: 'Create Order' })).toBeTruthy();

    const search = screen.getByLabelText('Search product to add');
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: 'fk-44' } });
    fireEvent.click(screen.getByText('Premium Koti'));

    // Colour has one choice, so it is filled in; size still needs choosing.
    fireEvent.change(screen.getByLabelText('Size 1'), { target: { value: 'XL' } });
    fireEvent.change(screen.getByLabelText('Customer Name'), { target: { value: 'Rahim' } });
    fireEvent.change(screen.getByLabelText('Customer Phone'), { target: { value: '01712345678' } });
    fireEvent.change(screen.getByLabelText('Delivery Address'), { target: { value: 'House 7, Dhanmondi, Dhaka' } });
    fireEvent.change(screen.getByLabelText('Discount'), { target: { value: '80' } });

    // Outside Dhaka by default: 1380 + 130 - 80
    expect((screen.getByLabelText('Final Total') as HTMLInputElement).value).toBe('1430');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Order/i }));
    });
    expect(onCompleteOrder).toHaveBeenCalledTimes(1);
    const [draft, payload] = onCompleteOrder.mock.calls[0];
    expect(draft.__createdByAdmin).toBe(true);
    expect(payload).toMatchObject({
      customerName: 'Rahim',
      customerPhone: '01712345678',
      status: 'confirmed',
      sendSms: true,
      deliveryCharge: 130,
      discount: 80,
      total: 1430,
    });
    expect(payload.items[0]).toMatchObject({ productId: 'koti', color: 'Navy', size: 'XL', quantity: 1, unitPrice: 1380 });
  });

  it('refuses to place an order without a product', async () => {
    const onCompleteOrder = renderCreate();
    fireEvent.change(screen.getByLabelText('Customer Name'), { target: { value: 'Rahim' } });
    fireEvent.change(screen.getByLabelText('Customer Phone'), { target: { value: '01712345678' } });
    fireEvent.change(screen.getByLabelText('Delivery Address'), { target: { value: 'Dhanmondi' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Order/i }));
    });
    expect(onCompleteOrder).not.toHaveBeenCalled();
  });
});

describe('delivery charge matches the website checkout', () => {
  it('uses area rates, product fees, free delivery and extra weight', () => {
    expect(computeSuggestedDeliveryCharge([{ quantity: 1, weight: 0.5 }], 'inside')).toBe(70);
    expect(computeSuggestedDeliveryCharge([{ quantity: 1, weight: 0.5 }], 'outside')).toBe(130);
    expect(computeSuggestedDeliveryCharge([{ quantity: 1, product: { deliveryCharge: 50 } }], 'outside')).toBe(50);
    expect(computeSuggestedDeliveryCharge([{ quantity: 1, isFreeDelivery: true }], 'outside')).toBe(0);
    expect(computeSuggestedDeliveryCharge([{ quantity: 3, weight: 800 }], 'inside')).toBe(70 + 2 * 20); // 2.4 kg
  });
});
