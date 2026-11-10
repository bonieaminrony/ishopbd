import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotifModal from '../components/NotifModal';

describe('Notification System & Popup Verification', () => {
  const sampleNotifications = [
    {
      id: 'order-notif-101',
      title: 'Order Confirmed (#1787693664324)',
      message: 'Dear Customer, your order is confirmed.',
      createdAt: { seconds: 1727500000 },
      orderId: '1787693664324',
      type: 'direct'
    },
    {
      id: 'broadcast-notif-102',
      title: 'Special Flash Sale!',
      message: 'Huge discounts available today.',
      createdAt: { seconds: 1727505000 },
      link: 'https://ishopbd.com',
      type: 'broadcast'
    }
  ];

  it('verifies that notification modal renders all notification cards and icons correctly', () => {
    const setIsNotifOpen = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={sampleNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByText(/ALL UPDATES \(2\)/i)).toBeDefined();
    expect(screen.getByText('Order Confirmed (#1787693664324)')).toBeDefined();
    expect(screen.getByText('Special Flash Sale!')).toBeDefined();
    expect(screen.getByText('Track Order (View Location)')).toBeDefined();
    expect(screen.getByText('View Details')).toBeDefined();
  });

  it('verifies that clicking the close button properly triggers close without errors', () => {
    const setIsNotifOpen = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={sampleNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    const closeBtn = screen.getByTitle('Close Notifications');
    fireEvent.click(closeBtn);
    expect(setIsNotifOpen).toHaveBeenCalledWith(false);
  });

  it('verifies that tracking action calls tracking handlers and closes popup', () => {
    const setIsNotifOpen = vi.fn();
    const setIsTrackingOpen = vi.fn();
    const setTrackingInput = vi.fn();
    const handleTrackOrder = vi.fn();

    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={sampleNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
        setIsTrackingOpen={setIsTrackingOpen}
        setTrackingInput={setTrackingInput}
        handleTrackOrder={handleTrackOrder}
      />
    );

    const trackBtn = screen.getByText('Track Order (View Location)');
    fireEvent.click(trackBtn);

    expect(setIsNotifOpen).toHaveBeenCalledWith(false);
    expect(setTrackingInput).toHaveBeenCalledWith('1787693664324');
    expect(setIsTrackingOpen).toHaveBeenCalledWith(true);
    expect(handleTrackOrder).toHaveBeenCalledWith('1787693664324');
  });

  it('verifies that Clear All and Dismiss notifications operate cleanly', () => {
    const handleClearAll = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={vi.fn()}
        notifications={sampleNotifications}
        handleClearAllNotifications={handleClearAll}
        handleDismissNotification={handleDismiss}
        Info={null}
        products={[]}
      />
    );

    const clearAllBtn = screen.getByText('Clear All');
    fireEvent.click(clearAllBtn);
    expect(handleClearAll).toHaveBeenCalledTimes(1);

    const dismissBtns = screen.getAllByTitle('Dismiss');
    fireEvent.click(dismissBtns[0]);
    expect(handleDismiss).toHaveBeenCalledWith('order-notif-101');
  });
});
