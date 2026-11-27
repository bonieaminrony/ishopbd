import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminOrdersTab, { AdminOrdersTabProps } from '../components/admin/AdminOrdersTab';
import AdminIncompleteOrdersTab, { getIncompleteCustomerOrderStatus } from '../components/admin/AdminIncompleteOrdersTab';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { buildBulkOrderStickersHtml, renderCode39BarcodeSvg } from '../utils/adminExports';

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
    expect(screen.getAllByText('Not booked').length).toBeGreaterThanOrEqual(2);
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
    // Weight is now an editable kg input (non-numeric legacy value "0.5" must parse to 0.5, never NaN)
    expect((screen.getByLabelText('Order Weight') as HTMLInputElement).value).toBe('0.5');
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

    // Exact balanced desktop column order: Product Info -> Total Price -> Customer Info -> Courier History -> Courier -> Status & Payment -> SMS & VERIFY
    expect(screen.queryByText('Delivery Rate')).not.toBeInTheDocument();
    const headerTexts = screen.getAllByRole('columnheader').map((th) => th.textContent?.trim() || '');
    expect(headerTexts).toEqual([
      '',
      'Product Info',
      'Total Price',
      'Customer Info',
      'Courier History',
      'Courier & Note',
      'Status & Payment',
      'ACTIONS',
    ]);

    // SMS, Receipt, WhatsApp, Print pills render cleanly in 2x2 action grid; Send to Courier & courier History pill are removed
    const desktopWhatsAppLinks = screen
      .getAllByRole('link', { name: /WhatsApp/i })
      .filter((el) => el.closest('tr'));
    expect(desktopWhatsAppLinks.length).toBeGreaterThanOrEqual(1);
    expect(desktopWhatsAppLinks[0]).toHaveAttribute('href', 'https://wa.me/8801738364268');
    expect(screen.getAllByText('Receipt').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('Print').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(
      screen.queryAllByTitle('Send to Courier').filter((el) => el.closest('tr')).length
    ).toBe(0);

    // Score-only Steadfast response displays dedicated Courier History card (zero truncation on name)
    const desktopName = screen.getAllByText('Score Customer').find((el) => el.closest('tr'));
    expect(desktopName).toBeTruthy();
    expect(desktopName).not.toHaveClass('truncate');

    expect(screen.getAllByText('97%').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('2%')).toBeInTheDocument();
    expect(screen.getByText('25+')).toBeInTheDocument();

    // Parcel-count response displays delivered/cancelled counts + FRAUD badge
    expect(screen.getAllByText('18').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FRAUD (3)').length).toBeGreaterThanOrEqual(1);

    // Unchecked customer falls back cleanly to website stats on both mobile and desktop right card
    expect(screen.getByText('Total: 4')).toBeInTheDocument();
    expect(screen.getByText('SCS: 3')).toBeInTheDocument();

    // Clicking Desktop Steadfast History card beside Customer Info opens CourierHistoryModal without opening OrderDetailsModal
    const scoreRateBtns = screen.getAllByTitle(/Steadfast: 97% delivery/i);
    const desktopScoreRateBtn = scoreRateBtns.find((el) => el.closest('tr'));
    expect(desktopScoreRateBtn).toBeTruthy();
    fireEvent.click(desktopScoreRateBtn!);
    expect(setCourierModalPhone).toHaveBeenCalledWith('+8801738364268');
    expect(setIsCourierHistoryModalOpen).toHaveBeenCalledWith(true);
    expect(setSelectedOrderForDetails).not.toHaveBeenCalled();

    // OrderDetailsModal automatically shows Steadfast Courier Delivery Ratio when cached
    const orderWithPhone = orders[0];
    render(
      <OrderDetailsModal
        selectedOrderForDetails={orderWithPhone}
        setSelectedOrderForDetails={vi.fn()}
        isAdminVerified={true}
        isEditingOrder={false}
        setIsEditingOrder={vi.fn()}
        editingOrderData={{ customerName: 'Score Customer', customerPhone: '+8801738364268', address: 'Dhaka', items: orderWithPhone.items }}
        setEditingOrderData={vi.fn()}
        handleUpdateOrderDetails={vi.fn()}
        orderHistory={orders}
        setOrderHistory={vi.fn()}
        handleUpdatePaymentMethod={vi.fn()}
        sendToCourier={vi.fn()}
        handleUpdateOrderStatus={vi.fn()}
        getProductPrice={() => 1500}
        courierReports={{
          '01738364268': {
            total_parcel: 0,
            total_delivered: 0,
            total_cancelled: 0,
            total_fraud_report: 0,
            delivery_rate: 97,
            cancellation_rate: 2,
            volume_range: '25+',
          },
        }}
        checkCourierReport={vi.fn()}
      />
    );
    expect(screen.getByText(/Steadfast কুরিয়ার ডেলিভারি রেশিও/i)).toBeInTheDocument();
  });

  it('generates compact shipping stickers with shop logo, customer, courier tracking, and size/color without prices by default', () => {
    const barcode = renderCode39BarcodeSvg('319143440');
    expect(barcode).toContain('<svg');
    expect(barcode).toContain('<rect');

    const orders = [
      {
        id: 'ORD-000101',
        customerName: 'Karim Ahmed',
        customerPhone: '01711223344',
        address: 'House 12, Road 4, Mirpur 10, Dhaka',
        total: 1850,
        deliveryArea: 'inside',
        date: '11 Nov 2026',
        courierName: 'Steadfast',
        courierConsignmentId: '319143440',
        courierTrackingId: 'SFR261110TEST1',
        courierStatus: 'in_transit',
        items: [
          {
            product: { name: 'Fashionable Koti', price: 1250 },
            quantity: 2,
            size: 'L',
            color: 'Black',
          },
          {
            product: { name: 'Smart Watch Ultra', price: 600 },
            quantity: 1,
            size: 'N/A',
            color: 'N/A',
          },
        ],
      },
      {
        id: 'ORD-000102',
        customerName: 'Unbooked Customer',
        customerPhone: '01899887766',
        address: 'Bogura Sadar',
        total: 990,
        deliveryArea: 'outside',
        items: [{ product: { name: 'Neckband Earphone' }, quantity: 1 }],
      },
    ];

    const htmlDefault = buildBulkOrderStickersHtml(orders, {
      shopName: 'i SHOP BD',
      logoUrl: '/logo.png',
      baseUrl: 'http://localhost:3000',
    });

    expect(htmlDefault).toContain('http://localhost:3000/logo.png');
    expect(htmlDefault).toContain('PARCEL SHIPPING LABEL');
    expect(htmlDefault).toContain('layout-thermal');
    expect(htmlDefault).toContain('4in 6in');
    expect(htmlDefault).not.toContain('class="shop-name"');
    expect(htmlDefault).toContain('Karim Ahmed');
    expect(htmlDefault).toContain('01711223344');
    expect(htmlDefault).toContain('#319143440');
    expect(htmlDefault).toContain('SFR261110TEST1');
    expect(htmlDefault).toContain('Fashionable Koti');
    expect(htmlDefault).toContain('Size: L');
    expect(htmlDefault).toContain('Color: Black');
    expect(htmlDefault).toContain('Smart Watch Ultra');
    expect(htmlDefault).toContain('×2 pcs');
    expect(htmlDefault).toContain('Unbooked Customer');
    expect(htmlDefault).toContain('NOT BOOKED');
    // Prices must remain hidden by default on stickers
    expect(htmlDefault).not.toContain('body class=" show-prices"');
    expect(htmlDefault).toContain('.sticker-price-block {\n      display: none;');

    const htmlThermal = buildBulkOrderStickersHtml(orders, { layout: 'thermal' });
    expect(htmlThermal).toContain('4in 6in');

    const html75 = buildBulkOrderStickersHtml(orders, { layout: '75x100' });
    expect(html75).toContain('layout-75x100');
    expect(html75).toContain('75mm 100mm');
    expect(html75).toContain('PDF ডাউনলোড');
    expect(html75).toContain('ফাইল সেভ (HTML)');

    // AdminOrdersTab surfaces the bulk Stickers button when orders are marked
    const onBulkPrintStickers = vi.fn();
    render(
      <AdminOrdersTab
        {...makeBaseOrdersProps({
          orderHistory: orders,
          filteredOrders: orders,
          selectedOrderIds: ['ORD-000101', 'ORD-000102'],
          onBulkPrintStickers,
        })}
      />
    );
    const bulkBtn = screen.getByRole('button', { name: /Stickers \(2\)/i });
    fireEvent.click(bulkBtn);
    expect(onBulkPrintStickers).toHaveBeenCalledTimes(1);

    // Optional explicit A4 grid stays available when requested
    const htmlA4 = buildBulkOrderStickersHtml(orders, { layout: 'a4-4' });
    expect(htmlA4).toContain('layout-a4-4');
  });

  it('opens IncompleteOrderModal from incomplete order row, edits size/color/qty/pricing/delivery and places order', async () => {
    const checkCourierReport = vi.fn();
    const onCompleteIncompleteOrder = vi.fn().mockResolvedValue(undefined);
    const mockProducts = [
      {
        id: 'prod-koti-1',
        name: 'Premium Koti',
        smsName: 'Koti',
        price: 500,
        buyingPrice: 300,
        image: '/koti.png',
        colors: ['Black', 'White'],
        sizes: ['M', 'L', 'XL'],
        variants: [],
      },
    ];
    const mockIncompleteOrders = [
      {
        id: 'sess_inc_1',
        name: 'অজ্ঞাত ক্রেতা',
        phone: '01712345678',
        address: 'Mirpur 10',
        district: 'ঢাকা',
        type: 'cart_checkout',
        totalAmount: 500,
        items: [
          {
            id: 'prod-koti-1',
            name: 'Premium Koti',
            price: 500,
            quantity: 1,
            size: 'M',
            color: 'Black',
            image: '/koti.png',
          },
        ],
      },
    ];

    render(
      <AdminIncompleteOrdersTab
        incompleteOrders={mockIncompleteOrders}
        getCustomerStats={() => ({ total: 2, delivered: 1 })}
        individualSmsOrder={null}
        setIndividualSmsOrder={vi.fn()}
        individualSmsMessage=""
        setIndividualSmsMessage={vi.fn()}
        handleSendIndividualSms={vi.fn()}
        isSendingIndividualSms={false}
        products={mockProducts}
        getProductPrice={(prod, _qty) => Number(prod?.price || 0)}
        courierReports={{
          '01712345678': {
            total_parcel: 8,
            total_delivered: 7,
            total_cancelled: 1,
            total_fraud_report: 0,
          },
        }}
        loadingCourierReports={{}}
        checkCourierReport={checkCourierReport}
        siteConfig={{ isSmsConfirmEnabled: true }}
        onCompleteIncompleteOrder={onCompleteIncompleteOrder}
      />,
    );

    const verifyBtns = screen.getAllByRole('button', { name: /Verify & Order/i });
    fireEvent.click(verifyBtns[0]);

    // Modal opened with courier & website stats visible
    expect(screen.getByRole('dialog', { name: /Verify and Complete Incomplete Order/i })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Customer Name'), { target: { value: 'Md. Hasan' } });
    fireEvent.change(screen.getByLabelText('Customer Phone'), { target: { value: '01712345678' } });
    fireEvent.change(screen.getByLabelText('Delivery Address'), { target: { value: 'Road 4, Dhanmondi, Dhaka' } });

    // Edit Size, Color, Quantity, Unit Price, Delivery Charge, Discount
    fireEvent.change(screen.getByLabelText('Size 1'), { target: { value: 'XL' } });
    fireEvent.change(screen.getByLabelText('Color 1'), { target: { value: 'White' } });
    fireEvent.click(screen.getByLabelText('Increase quantity 1'));
    fireEvent.change(screen.getByLabelText('Unit Price 1'), { target: { value: '450' } });
    fireEvent.change(screen.getByLabelText('Delivery Charge'), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText('Discount'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Order Status'), { target: { value: 'confirmed' } });

    // 2 * 450 + 70 - 50 = 920
    expect((screen.getByLabelText('Final Total') as HTMLInputElement).value).toBe('920');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));
    });

    expect(onCompleteIncompleteOrder).toHaveBeenCalledTimes(1);

    const [passedOrder, passedPayload] = onCompleteIncompleteOrder.mock.calls[0];
    expect(passedOrder.id).toBe('sess_inc_1');
    expect(passedPayload.customerName).toBe('Md. Hasan');
    expect(passedPayload.customerPhone).toBe('01712345678');
    expect(passedPayload.address).toBe('Road 4, Dhanmondi, Dhaka');
    expect(passedPayload.deliveryCharge).toBe(70);
    expect(passedPayload.discount).toBe(50);
    expect(passedPayload.subtotal).toBe(900);
    expect(passedPayload.total).toBe(920);
    expect(passedPayload.status).toBe('confirmed');
    expect(passedPayload.items[0]).toMatchObject({
      productId: 'prod-koti-1',
      size: 'XL',
      color: 'White',
      quantity: 2,
      unitPrice: 450,
    });
  });

  it('allows full editing of completed orders in OrderDetailsModal (name, address, product, size, color, price, discount, deliveryCharge)', () => {
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Classic Panjabi',
        price: 1200,
        sizes: ['M', 'L', 'XL'],
        colors: ['White', 'Navy'],
        image: '/panjabi.png',
      },
      {
        id: 'prod-2',
        name: 'Cotton Koti',
        code: 'KP-02',
        price: 800,
        sizes: ['M', 'L'],
        colors: ['Black'],
        image: '/koti.png',
      },
    ];

    const initialOrder = {
      id: 'ord_complete_1',
      displayId: 'ORD999',
      customerName: 'Karim Uddin',
      customerPhone: '01811223344',
      address: 'Mirpur 2, Dhaka',
      district: 'ঢাকা',
      deliveryArea: 'inside',
      status: 'confirmed',
      paymentMethod: 'CASH',
      subtotal: 1200,
      discount: 0,
      deliveryCharge: 70,
      total: 1270,
      totalWeight: 0.5,
      items: [
        {
          id: 'prod-1',
          productId: 'prod-1',
          name: 'Classic Panjabi',
          price: 1200,
          quantity: 1,
          size: 'M',
          color: 'White',
          product: mockProducts[0],
        },
      ],
    };

    const handleUpdateOrderDetails = vi.fn();

    function TestWrapper() {
      const [isEditing, setIsEditing] = React.useState(false);
      const [editData, setEditData] = React.useState<any>({});
      const [selected, setSelected] = React.useState<any>(initialOrder);
      return (
        <OrderDetailsModal
          selectedOrderForDetails={selected}
          setSelectedOrderForDetails={setSelected}
          isAdminVerified={true}
          isEditingOrder={isEditing}
          setIsEditingOrder={setIsEditing}
          editingOrderData={editData}
          setEditingOrderData={setEditData}
          handleUpdateOrderDetails={() => handleUpdateOrderDetails(editData)}
          orderHistory={[initialOrder]}
          setOrderHistory={vi.fn()}
          handleUpdatePaymentMethod={vi.fn()}
          sendToCourier={vi.fn()}
          handleUpdateOrderStatus={vi.fn()}
          getProductPrice={(p) => Number(p?.price || 0)}
          products={mockProducts}
        />
      );
    }

    render(<TestWrapper />);

    fireEvent.click(screen.getByRole('button', { name: 'এডিট করুন' }));

    fireEvent.change(screen.getByLabelText('Customer Name'), { target: { value: 'Rahim Mia' } });
    fireEvent.change(screen.getByLabelText('Delivery Address'), { target: { value: 'Banani, Dhaka' } });
    fireEvent.change(screen.getByLabelText('Product Name 1'), { target: { value: 'Luxury Panjabi' } });
    fireEvent.change(screen.getByLabelText('Size 1'), { target: { value: 'XL' } });
    fireEvent.change(screen.getByLabelText('Color 1'), { target: { value: 'Navy' } });
    fireEvent.click(screen.getByLabelText('Increase quantity 1'));
    fireEvent.change(screen.getByLabelText('Unit Price 1'), { target: { value: '1000' } });

    // Search and add second product by code
    const searchInput = screen.getByLabelText('Add Product Search');
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'KP-02' } });
    fireEvent.mouseDown(screen.getByText('Cotton Koti'));

    // Edit discount and delivery charge
    fireEvent.change(screen.getByLabelText('Order Discount'), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText('Order Delivery Charge'), { target: { value: '100' } });

    // Subtotal: 2*1000 + 1*800 = 2800; Total: 2800 - 150 + 100 = 2750
    expect(screen.getByText('৳2750')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /পরিবর্তন সেভ করুন/i }));

    expect(handleUpdateOrderDetails).toHaveBeenCalledTimes(1);
    const saved = handleUpdateOrderDetails.mock.calls[0][0];
    expect(saved.customerName).toBe('Rahim Mia');
    expect(saved.address).toBe('Banani, Dhaka');
    expect(saved.subtotal).toBe(2800);
    expect(saved.discount).toBe(150);
    expect(saved.deliveryCharge).toBe(100);
    expect(saved.items).toHaveLength(2);
    expect(saved.items[0]).toMatchObject({
      name: 'Luxury Panjabi',
      size: 'XL',
      color: 'Navy',
      quantity: 2,
      price: 1000,
    });
    expect(saved.items[1]).toMatchObject({
      name: 'Cotton Koti',
      quantity: 1,
      price: 800,
    });

    // Also test deleting all remaining items when editing
    fireEvent.click(screen.getByLabelText('Remove item 2'));
    fireEvent.click(screen.getByLabelText('Remove item 1'));
    expect(screen.getByText(/অর্ডারে কোনো পণ্য নেই/)).toBeTruthy();
    expect((screen.getByRole('button', { name: /পরিবর্তন সেভ করুন/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('preserves incomplete orders for repeat customers with historical orders and normalizes Bengali phone digits', () => {
    const now = Date.now();
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    const newIncompleteOrder = {
      id: 'landing_123',
      phone: '০১৭১২৩৪৫৬৭৮',
      updatedAt: { seconds: Math.floor(now / 1000) },
      items: [{ id: 'prod-1', name: 'Classic Panjabi' }],
    };

    const historicalOrder = {
      id: 'ord_old',
      customerPhone: '01712345678',
      status: 'delivered',
      createdAt: { seconds: Math.floor(tenDaysAgo / 1000) },
      items: [{ id: 'prod-1', name: 'Classic Panjabi' }],
    };

    const statusHistoricalOnly = getIncompleteCustomerOrderStatus(newIncompleteOrder, [historicalOrder]);
    expect(statusHistoricalOnly).not.toBeNull();
    expect(statusHistoricalOnly?.isSameProduct).toBe(false);

    const recentCompletedOrder = {
      id: 'ord_new',
      customerPhone: '01712345678',
      status: 'pending',
      createdAt: { seconds: Math.floor((now + 30_000) / 1000) },
      items: [{ id: 'prod-1', name: 'Classic Panjabi' }],
    };

    const statusWithRecent = getIncompleteCustomerOrderStatus(newIncompleteOrder, [historicalOrder, recentCompletedOrder]);
    expect(statusWithRecent?.isSameProduct).toBe(true);
  });
});


describe('Order note (shop only, not sent to the courier)', () => {
  const base = {
    customerPhone: '01700000009',
    address: 'Dhaka',
    total: 500,
    paymentMethod: 'CASH',
    deliveryArea: 'inside',
    items: [{ product: { name: 'Fan', image: '/logo.png' }, quantity: 1 }],
  };
  it('shows the note while the order is not booked, and hides it once booked', () => {
    const orders = [
      { ...base, id: 'ord_wait', customerName: 'Waiting', status: 'confirmed', internalNote: 'Will take it in 7 days' },
      {
        ...base,
        id: 'ord_booked',
        customerName: 'Booked',
        status: 'shipped',
        internalNote: 'Old note that should be hidden',
        courierName: 'Steadfast',
        courierTrackingId: 'SF_1',
        courierStatus: 'in_transit',
        courierStatusNormalized: 'in_transit',
        courierStatusLabel: 'In Transit',
      },
    ];
    render(<AdminOrdersTab {...makeBaseOrdersProps({ orderHistory: orders, filteredOrders: orders })} />);
    expect(screen.getAllByText('Will take it in 7 days').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Old note that should be hidden')).toBeNull();
  });

  it('offers "Add note" on orders without a note and opens an editor', () => {
    const orders = [{ ...base, id: 'ord_new', customerName: 'New', status: 'pending' }];
    render(<AdminOrdersTab {...makeBaseOrdersProps({ orderHistory: orders, filteredOrders: orders })} />);
    const addButtons = screen.getAllByRole('button', { name: /Add note/i });
    fireEvent.click(addButtons[0]);
    expect(screen.getByLabelText('Order note')).toBeTruthy();
  });
});
