import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotifModal from '../components/NotifModal';

describe('NotifModal Component - Close Button and Interactions', () => {
  const mockNotifications = [
    {
      id: 'notif-1',
      title: 'Order Confirmed (#1787693664324)',
      message: 'Dear User, your order is confirmed.',
      createdAt: { seconds: 1727500000 },
      orderId: '1787693664324'
    },
    {
      id: 'notif-2',
      title: 'Special Offer',
      message: 'Exclusive gadget sale',
      createdAt: new Date().toISOString(),
      link: 'https://ishopbd.com'
    }
  ];

  it('renders nothing when isNotifOpen is false', () => {
    const setIsNotifOpen = vi.fn();
    const { container } = render(
      <NotifModal
        isNotifOpen={false}
        setIsNotifOpen={setIsNotifOpen}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders notifications and close button when isNotifOpen is true', () => {
    const setIsNotifOpen = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByTitle('Close Notifications')).toBeDefined();
    expect(screen.getByText(/ALL UPDATES \(2\)/i)).toBeDefined();
  });

  it('calls setIsNotifOpen(false) when clicking the close (X) button', () => {
    const setIsNotifOpen = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    const closeButton = screen.getByTitle('Close Notifications');
    fireEvent.click(closeButton);
    expect(setIsNotifOpen).toHaveBeenCalledWith(false);
  });

  it('calls setIsNotifOpen(false) when clicking on backdrop', () => {
    const setIsNotifOpen = vi.fn();
    const { container } = render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    const backdrop = container.querySelector('.bg-black\\/50');
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(setIsNotifOpen).toHaveBeenCalledWith(false);
    }
  });

  it('calls setIsNotifOpen(false) on Escape key press', () => {
    const setIsNotifOpen = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={setIsNotifOpen}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(setIsNotifOpen).toHaveBeenCalledWith(false);
  });

  it('calls handleClearAllNotifications when Clear All button is clicked', () => {
    const handleClearAll = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={vi.fn()}
        notifications={mockNotifications}
        handleClearAllNotifications={handleClearAll}
        handleDismissNotification={vi.fn()}
        Info={null}
        products={[]}
      />
    );

    const clearBtn = screen.getByText('Clear All');
    fireEvent.click(clearBtn);
    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('calls handleDismissNotification when individual dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    render(
      <NotifModal
        isNotifOpen={true}
        setIsNotifOpen={vi.fn()}
        notifications={mockNotifications}
        handleClearAllNotifications={vi.fn()}
        handleDismissNotification={handleDismiss}
        Info={null}
        products={[]}
      />
    );

    const dismissBtns = screen.getAllByTitle('Dismiss');
    expect(dismissBtns.length).toBe(2);
    fireEvent.click(dismissBtns[0]);
    expect(handleDismiss).toHaveBeenCalledWith('notif-1');
  });
});
