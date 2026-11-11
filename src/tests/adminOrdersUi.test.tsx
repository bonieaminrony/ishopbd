import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminOrdersTab, { AdminOrdersTabProps } from '../components/admin/AdminOrdersTab';
import OrderDetailsModal from '../components/OrderDetailsModal';

function makeBaseOrdersProps(overrides: Partial<AdminOrdersTabProps> = {}): AdminOrdersTabProps {
  return {
    orderHistory: [],
    filteredOrders: [],
    reportTimeframe: '28d',
    setReportTimeframe: vi.fn(),
    selectedOrderStatusFilter: 'all',
    setSelectedOrderStatusFilter: vi.fn(),
    adminStartDate: '',
    setAdminStartDate: vi.fn(),
    adminEndDate: '',
    setAdminEndDate: vi.fn(),
    adminOrderAreaFilter: 'all',
    setAdminOrderAreaFilter: vi.fn(),
    orderSearchQuery: '',
    setOrderSearchQuery: vi.fn(),
    syncAllCourierStatuses: vi.fn(),
    isSyncingCourier: false,
    exportDropdownRef: React.createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>,
    isExportDropdownOpen: false,
    setIsExportDropdownOpen: vi.fn(),
    exportOrdersToCSV: vi.fn(),
    adminOrdersLimit: 50,
    setAdminOrdersLimit: vi.fn(),
    getOrderLocalDateString: () => '2026-11-11',
    formatOrderGroupDate: () => 'Today (11 Nov 2026)',
    setSelectedOrderForDetails: vi.fn(),
    handleSelectOrder: vi.fn(),
    handleSelectAll: vi.fn(),
    selectedOrderIds: [],
    handleQuickEditOrderItems: vi.fn(),
    getCustomerStats: () => ({ total: 2, delivered: 1, cancelled: 0 }),
    handleUpdateOrderStatus: vi.fn(),
    handleUpdatePaymentMethod: vi.fn(),
    syncSingleCourierStatus: vi.fn(),
    syncingOrderId: null,
    quickEditOrderId: null,
    setQuickEditOrderId: vi.fn(),
    quickEditData: { customerName: '', customerPhone: '', address: '' },
    setQuickEditData: vi.fn(),
    handleSaveQuickEdit: vi.fn(),
    courierReports: {},
    loadingCourierReports: {},
    checkCourierReport: vi.fn(),
    setCourierModalPhone: vi.fn(),
    setIsCourierHistoryModalOpen: vi.fn(),
    individualSmsOrder: null,
    setIndividualSmsOrder: vi.fn(),
    siteConfig: {},
    individualSmsMessage: '',
    setIndividualSmsMessage: vi.fn(),
    handleSendIndividualSms: vi.fn(),
    isSendingIndividualSms: false,
    setCompletedOrderReceipt: vi.fn(),
    sendToCourier: vi.fn(),
    handlePrintInvoice: vi.fn(),
    toggleBlacklist: vi.fn(),
    blacklist: [],
    deleteOrder: vi.fn(),
    ...overrides,
  };
}

describe('AdminOrdersTab & OrderDetailsModal UI behavior', () => {
  it('renders Not Booked, hub name, pending, and delivered badges and handles desktop row vs action clicks', () => {
    const orders = [
      {
        id: 'ord_unbooked',
        customerName: 'Unbooked User',
        customerPhone: '01700000001',
        address: 'Gazipur',
        total: 1460,
        status: 'pending',
        paymentMethod: 'CASH',
        deliveryArea: 'outside',
        items: [{ product: { name: 'Mini Fan', image: '/logo.png' }, quantity: 1 }],
      },
      {
        id: 'ord_barishal',
        customerName: 'Barishal Customer',
        customerPhone: '01700000002',
        address: 'Barishal Sadar',
        total: 1900,
        status: 'shipped',
        paymentMethod: 'CASH',
        deliveryArea: 'outside',
        courierName: 'Steadfast',
        courierConsignmentId: '319143440',
        courierTrackingId: 'SFR261110STFEF29A5BD',
        courierStatus: 'in_transit',
        courierStatusNormalized: 'in_transit',
        courierStatusLabel: 'In Transit',
        courierTrackingMessage: 'Parcel arrived at Barishal Hub',
        items: [{ product: { name: 'Smart Watch', image: '/logo.png' }, quantity: 1 }],
      },
      {
        id: 'ord_delivered',
        customerName: 'Delivered Customer',
        customerPhone: '01700000003',
        address: 'Dhaka',
        total: 1200,
        status: 'delivered',
        paymentMethod: 'CASH',
        deliveryArea: 'inside',
        courierName: 'Steadfast',
        courierTrackingId: 'SF_DEL_1',
        courierStatus: 'delivered',
        courierStatusNormalized: 'delivered',
        courierStatusLabel: 'Delivered',
        courierHub: 'Mirpur Hub',
        items: [{ product: { name: 'Headphone', image: '/logo.png' }, quantity: 1 }],
      },
    ];

    const setSelectedOrderForDetails = vi.fn();
    const handleQuickEditOrderItems = vi.fn();
    const handleUpdateOrderStatus = vi.fn();

    render(
      <AdminOrdersTab
        {...makeBaseOrdersProps({
          orderHistory: orders,
          filteredOrders: orders,
          setSelectedOrderForDetails,
          handleQuickEditOrderItems,
          handleUpdateOrderStatus,
        })}
      />
    );

    // Not Booked badge (mobile + desktop), Barishal Hub badge, and Delivered badge
    expect(screen.getAllByText('Not Booked').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/BARISHAL HUB/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/DELIVERED/i).length).toBeGreaterThanOrEqual(1);

    // Clicking the desktop row (customer name cell) opens OrderDetailsModal directly
    const barishalCell = screen.getAllByText('Barishal Customer').find((el) => el.closest('tr'));
    expect(barishalCell).toBeTruthy();
    fireEvent.click(barishalCell!);
    expect(setSelectedOrderForDetails).toHaveBeenCalledWith(orders[1]);

    // Clicking interactive controls inside the desktop row must NOT trigger row onClick
    setSelectedOrderForDetails.mockClear();
    const smsButtons = screen.getAllByTitle('Send SMS');
    fireEvent.click(smsButtons[0]);
    expect(setSelectedOrderForDetails).not.toHaveBeenCalled();

    const editBtns = screen.getAllByTitle('Edit Order Items');
    fireEvent.click(editBtns[0]);
    expect(handleQuickEditOrderItems).toHaveBeenCalledWith(orders[0]);
    expect(setSelectedOrderForDetails).not.toHaveBeenCalled();
  });

  it('survives malformed/missing items, non-numeric totalWeight, and resets edit state on modal close', () => {
    const malformedOrder = {
      id: 'ord_bad_data',
      customerName: 'Legacy Order',
      customerPhone: '',
      address: 'Dhaka',
      total: 850,
      totalWeight: '0.5',
      status: 'shipped',
      paymentMethod: 'CASH',
      courierName: 'Steadfast',
      courierStatus: 'in_transit',
      courierStatusNormalized: 'in_transit',
      courierTrackingMessage: 'Parcel reached Chattogram Hub',
      courierLastSyncedAt: 'not-a-valid-date',
      items: undefined,
    };

    const setSelectedOrderForDetails = vi.fn();
    const setIsEditingOrder = vi.fn();

    // AdminOrdersTab must not crash with undefined items
    expect(() =>
      render(
        <AdminOrdersTab
          {...makeBaseOrdersProps({
            orderHistory: [malformedOrder],
            filteredOrders: [malformedOrder],
            setSelectedOrderForDetails,
          })}
        />
      )
    ).not.toThrow();

    // OrderDetailsModal must render hub badge, total label, weight, and reset edit state on close
    render(
      <OrderDetailsModal
        selectedOrderForDetails={malformedOrder}
        setSelectedOrderForDetails={setSelectedOrderForDetails}
        isAdminVerified={true}
        isEditingOrder={true}
        setIsEditingOrder={setIsEditingOrder}
        editingOrderData={{ customerName: 'Legacy Order', customerPhone: '', address: 'Dhaka', items: undefined }}
        setEditingOrderData={vi.fn()}
        handleUpdateOrderDetails={vi.fn()}
        orderHistory={[malformedOrder]}
        setOrderHistory={vi.fn()}
        handleUpdatePaymentMethod={vi.fn()}
        sendToCourier={vi.fn()}
        handleUpdateOrderStatus={vi.fn()}
        getProductPrice={() => 0}
      />
    );

    expect(screen.getByText('Chattogram Hub')).toBeInTheDocument();
    expect(screen.getByText('500 গ্রাম')).toBeInTheDocument();
    expect(screen.getByText('সর্বমোট')).toBeInTheDocument();

    // Closing modal resets editing state
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((b) => b.querySelector('svg.lucide-x'));
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);
    expect(setIsEditingOrder).toHaveBeenCalledWith(false);
    expect(setSelectedOrderForDetails).toHaveBeenCalledWith(null);
  });

  it('displays Steadfast courier delivery rate stats in Delivery Rate column with phone normalization and website fallback', () => {
    const orders = [
      {
        id: 'ord_score_only',
        customerName: 'Score Customer',
        customerPhone: '+8801738364268',
        address: 'Dhaka',
        total: 1500,
        status: 'pending',
        paymentMethod: 'CASH',
        items: [{ product: { name: 'Item A', image: '/logo.png' }, quantity: 1 }],
      },
      {
        id: 'ord_parcel_counts',
        customerName: 'Parcel Customer',
        customerPhone: '01811223344',
        address: 'Chattogram',
        total: 2200,
        status: 'confirmed',
        paymentMethod: 'CASH',
        items: [{ product: { name: 'Item B', image: '/logo.png' }, quantity: 1 }],
      },
      {
        id: 'ord_no_courier',
        customerName: 'Fresh Customer',
        customerPhone: '01955667788',
        address: 'Sylhet',
        total: 900,
        status: 'pending',
        paymentMethod: 'CASH',
        items: [{ product: { name: 'Item C', image: '/logo.png' }, quantity: 1 }],
      },
    ];

    const setCourierModalPhone = vi.fn();
    const setIsCourierHistoryModalOpen = vi.fn();
    const setSelectedOrderForDetails = vi.fn();

    render(
      <AdminOrdersTab
        {...makeBaseOrdersProps({
          orderHistory: orders,
          filteredOrders: orders,
          setCourierModalPhone,
          setIsCourierHistoryModalOpen,
          setSelectedOrderForDetails,
          getCustomerStats: (phone) =>
            phone === '01955667788' ? { total: 4, delivered: 3, cancelled: 1 } : { total: 1, delivered: 0, cancelled: 0 },
          courierReports: {
            // Normalized local key matches "+8801738364268" order phone
            '01738364268': {
              total_parcel: 0,
              total_delivered: 0,
              total_cancelled: 0,
              total_fraud_report: 0,
              delivery_rate: 97,
              cancellation_rate: 2,
              volume_band: 'high',
              volume_range: '25+',
            },
            '01811223344': {
              total_parcel: 20,
              total_delivered: 18,
              total_cancelled: 2,
              total_fraud_report: 3,
              delivery_rate: 90,
              cancellation_rate: 10,
            },
          },
        })}
      />
    );

    // Score-only Steadfast response displays percentage delivery/cancel rates
    expect(screen.getAllByText('97%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('2%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Total: 25+')).toBeInTheDocument();

    // Parcel-count response displays delivered/cancelled counts + FRAUD badge
    expect(screen.getAllByText('18').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FRAUD (3)').length).toBeGreaterThanOrEqual(1);

    // Unchecked customer falls back cleanly to website customer stats
    expect(screen.getByText('Total: 4')).toBeInTheDocument();
    expect(screen.getByText('SCS: 3')).toBeInTheDocument();

    // Clicking Desktop Delivery Rate button opens CourierHistoryModal without opening OrderDetailsModal
    const scoreRateBtns = screen.getAllByTitle(/Steadfast: 97% delivery/i);
    const desktopScoreRateBtn = scoreRateBtns.find((el) => el.closest('tr'));
    expect(desktopScoreRateBtn).toBeTruthy();
    fireEvent.click(desktopScoreRateBtn!);
    expect(setCourierModalPhone).toHaveBeenCalledWith('+8801738364268');
    expect(setIsCourierHistoryModalOpen).toHaveBeenCalledWith(true);
    expect(setSelectedOrderForDetails).not.toHaveBeenCalled();
  });
});
