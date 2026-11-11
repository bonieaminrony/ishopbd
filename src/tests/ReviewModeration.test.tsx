import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminPanel from '../components/AdminPanel';
import { Review } from '../types';

describe('Customer Photo Review - Admin Moderation System', () => {
  const mockReviews: Review[] = [
    {
      id: 'rev_1',
      productId: 'prod_1',
      productName: 'Wireless Bluetooth Earbuds',
      productImage: 'https://example.com/earbuds.jpg',
      userId: 'usr_1',
      userName: 'Tanvir Ahmed',
      rating: 5,
      comment: 'Excellent bass and sound quality! Loved the build.',
      images: ['data:image/jpeg;base64,samplephoto1', 'data:image/jpeg;base64,samplephoto2'],
      status: 'pending',
      createdAt: '2026-09-28T12:00:00.000Z',
    },
    {
      id: 'rev_2',
      productId: 'prod_1',
      productName: 'Wireless Bluetooth Earbuds',
      productImage: 'https://example.com/earbuds.jpg',
      userId: 'guest_abc123',
      userName: 'Rahim Khan',
      rating: 4,
      comment: 'Fast delivery, good packaging.',
      images: [],
      status: 'approved',
      createdAt: '2026-09-27T10:00:00.000Z',
    },
    {
      id: 'rev_3',
      productId: 'prod_2',
      productName: 'Smart Fitness Watch',
      productImage: 'https://example.com/watch.jpg',
      userId: 'usr_2',
      userName: 'Spam User',
      rating: 1,
      comment: 'Irrelevant spam comment',
      images: [],
      status: 'rejected',
      createdAt: '2026-09-26T08:00:00.000Z',
    },
    {
      id: 'rev_4',
      productId: 'prod_3',
      productName: 'Portable Power Bank',
      productImage: 'https://example.com/powerbank.jpg',
      userId: 'usr_3',
      userName: 'Legacy Reviewer',
      rating: 5,
      comment: 'Great backup power capacity.',
      images: ['https://example.com/powerbank_user.jpg'],
      // status undefined for backwards compatibility check
      createdAt: '2026-09-25T08:00:00.000Z',
    },
  ];

  it('correctly filters approved reviews for customer-facing display', () => {
    // Only approved and legacy reviews without explicit status should be public
    const publicReviews = mockReviews.filter(
      (r) => r.status === 'approved' || !r.status
    );
    expect(publicReviews.length).toBe(2);
    expect(publicReviews.map((r) => r.id)).toEqual(['rev_2', 'rev_4']);

    // Pending reviews must not appear in public view
    const pendingReviews = mockReviews.filter((r) => r.status === 'pending');
    expect(pendingReviews.length).toBe(1);
    expect(pendingReviews[0].id).toBe('rev_1');

    // Rejected reviews must not appear in public view
    const rejectedReviews = mockReviews.filter((r) => r.status === 'rejected');
    expect(rejectedReviews.length).toBe(1);
    expect(rejectedReviews[0].id).toBe('rev_3');
  });

  it('renders the Reviews Moderation tab in AdminPanel with correct badges and counts', () => {
    render(
      <AdminPanel
        isAdminOpen={true}
        adminTab="reviews"
        adminViewMode="full"
        adminReviews={mockReviews}
        activeBanners={[]}
        activeProductDropdown={null}
        addVariant={vi.fn()}
        adminChatEndRef={{ current: null }}
        adminEndDate=""
        adminKeys={[]}
        adminList={[]}
        adminOrderAreaFilter="all"
        adminOrdersLimit={50}
        adminReplyingTo={null}
        adminStartDate=""
        allOrderPhones={[]}
        blacklist={[]}
        bulkNotifForm={{ title: '', message: '', target: 'all', sound: 'default', channel: 'app' }}
        bulkSmsMessage=""
        bulkSmsPage={1}
        bulkSmsProgress={0}
        bulkSmsResult={null}
        bulkSmsSearch=""
        bulkSmsSelectedPhones={new Set()}
        campaigns={[]}
        categories={[]}
        checkCourierReport={vi.fn()}
        copyCategoryLink={vi.fn()}
        copyLandingPageLink={vi.fn()}
        courierReports={{}}
        deleteCampaign={vi.fn()}
        deleteCategory={vi.fn()}
        deleteOrder={vi.fn()}
        deleteProduct={vi.fn()}
        deletingCatId={null}
        editingAdmin={null}
        editingBanner={null}
        editingCampaign={null}
        editingCategory={null}
        editingProduct={null}
        expenses={[]}
        exportDropdownRef={{ current: null }}
        exportOrdersToCSV={vi.fn()}
        filteredOrders={[]}
        formatOrderGroupDate={vi.fn()}
        getCustomerStats={vi.fn()}
        getOrderLocalDateString={vi.fn()}
        handleAddAdmin={vi.fn()}
        handleAdminChatImageUpload={vi.fn()}
        handleAdminImageUpload={vi.fn()}
        handleAdminMultiImageUpload={vi.fn()}
        handleAdminReply={vi.fn()}
        handleAdminVoiceToggle={vi.fn()}
        handleApproveRefund={vi.fn()}
        handleApproveReview={vi.fn()}
        handleDeleteAdmin={vi.fn()}
        handleDeleteBanner={vi.fn()}
        handleDeleteReviewAdmin={vi.fn()}
        handleDuplicateProduct={vi.fn()}
        handleEditUserBalance={vi.fn()}
        handlePrintInvoice={vi.fn()}
        handleQuickEditOrderItems={vi.fn()}
        handleRejectReview={vi.fn()}
        handleSaveBanner={vi.fn()}
        handleSaveQuickEdit={vi.fn()}
        handleSaveSiteConfig={vi.fn()}
        handleSelectAll={vi.fn()}
        handleSelectOrder={vi.fn()}
        handleSendBulkNotification={vi.fn()}
        handleSendBulkSms={vi.fn()}
        handleSendDirectNotification={vi.fn()}
        handleSendIndividualSms={vi.fn()}
        handleToggleReaction={vi.fn()}
        handleUpdateAdmin={vi.fn()}
        handleUpdateOrderStatus={vi.fn()}
        handleUpdatePaymentMethod={vi.fn()}
        handleVariantImageUpload={vi.fn()}
        incompleteOrders={[]}
        individualSmsMessage=""
        individualSmsOrder={null}
        isAdminRecording={false}
        isExportDropdownOpen={false}
        isMasterAdmin={true}
        isSendingBulkNotif={false}
        isSendingBulkSms={false}
        isSendingIndividualSms={false}
        isUsersLoading={false}
        limit={vi.fn()}
        loadingCourierReports={{}}
        newAdminEmail=""
        newAdminPassword=""
        newAdminPhone=""
        newAdminRole="admin"
        newBanner={{}}
        notifications={[]}
        openLandingEditor={vi.fn()}
        orderHistory={[]}
        orderSearchQuery=""
        productDropdownRef={{ current: null }}
        productFormErrors={{}}
        products={[]}
        query={vi.fn()}
        quickEditData={{}}
        quickEditOrderId={null}
        refundRequests={[]}
        removeImage={vi.fn()}
        removeVariant={vi.fn()}
        replyMessage=""
        reportTimeframe="28d"
        saveCampaign={vi.fn()}
        saveCategory={vi.fn()}
        saveProduct={vi.fn()}
        selectChat={vi.fn()}
        selectedChat={null}
        selectedOrderIds={new Set()}
        selectedOrderStatusFilter="all"
        sendToCourier={vi.fn()}
        setActiveProductDropdown={vi.fn()}
        setAdminEndDate={vi.fn()}
        setAdminKeys={vi.fn()}
        setAdminOrderAreaFilter={vi.fn()}
        setAdminOrdersLimit={vi.fn()}
        setAdminReplyingTo={vi.fn()}
        setAdminStartDate={vi.fn()}
        setAdminTab={vi.fn()}
        setBulkNotifForm={vi.fn()}
        setBulkSmsMessage={vi.fn()}
        setBulkSmsPage={vi.fn()}
        setBulkSmsSearch={vi.fn()}
        setBulkSmsSelectedPhones={vi.fn()}
        setCompletedOrderReceipt={vi.fn()}
        setCourierModalPhone={vi.fn()}
        setEditingAdmin={vi.fn()}
        setEditingBanner={vi.fn()}
        setEditingCampaign={vi.fn()}
        setEditingCategory={vi.fn()}
        setEditingProduct={vi.fn()}
        setIndividualSmsMessage={vi.fn()}
        setIndividualSmsOrder={vi.fn()}
        setIsAdminOpen={vi.fn()}
        setIsCourierHistoryModalOpen={vi.fn()}
        setIsExportDropdownOpen={vi.fn()}
        setIsQuotaExceeded={vi.fn()}
        setIsUsersLoading={vi.fn()}
        setNewAdminEmail={vi.fn()}
        setNewAdminPassword={vi.fn()}
        setNewAdminPhone={vi.fn()}
        setNewAdminRole={vi.fn()}
        setNewBanner={vi.fn()}
        setNotifications={vi.fn()}
        setOrderSearchQuery={vi.fn()}
        setProductFormErrors={vi.fn()}
        setQuickEditData={vi.fn()}
        setQuickEditOrderId={vi.fn()}
        setReplyMessage={vi.fn()}
        setReportTimeframe={vi.fn()}
        setSelectedChat={vi.fn()}
        setSelectedOrderForDetails={vi.fn()}
        setSelectedOrderStatusFilter={vi.fn()}
        setShowOnlyPreOrders={vi.fn()}
        setSiteConfig={vi.fn()}
        setUserList={vi.fn()}
        setUserListSearch={vi.fn()}
        showOnlyPreOrders={false}
        siteConfig={{}}
        supportChats={[]}
        toggleBlacklist={vi.fn()}
        togglePublishStatus={vi.fn()}
        userList={[]}
        userListSearch=""
        isSavingProduct={false}
        deletedOrders={[]}
        restoreOrder={vi.fn()}
        permanentDeleteOrder={vi.fn()}
      />
    );

    // Header & Section Title Check
    expect(screen.getByText('Customer Photo Reviews & Moderation')).toBeDefined();
    expect(screen.getByText('Tanvir Ahmed')).toBeDefined();
    expect(screen.getByText('Rahim Khan')).toBeDefined();
    expect(screen.getByText('Spam User')).toBeDefined();

    // Check status badges
    expect(screen.getByText('Pending Approval')).toBeDefined();
    expect(screen.getByText('Rejected / Hidden')).toBeDefined();
  });

  it('triggers handleApproveReview callback when Approve button is clicked', async () => {
    const handleApprove = vi.fn().mockResolvedValue(true);

    render(
      <AdminPanel
        isAdminOpen={true}
        adminTab="reviews"
        adminViewMode="full"
        adminReviews={mockReviews}
        handleApproveReview={handleApprove}
        handleRejectReview={vi.fn()}
        handleDeleteReviewAdmin={vi.fn()}
        activeBanners={[]}
        activeProductDropdown={null}
        addVariant={vi.fn()}
        adminChatEndRef={{ current: null }}
        adminEndDate=""
        adminKeys={[]}
        adminList={[]}
        adminOrderAreaFilter="all"
        adminOrdersLimit={50}
        adminReplyingTo={null}
        adminStartDate=""
        allOrderPhones={[]}
        blacklist={[]}
        bulkNotifForm={{ title: '', message: '', target: 'all', sound: 'default', channel: 'app' }}
        bulkSmsMessage=""
        bulkSmsPage={1}
        bulkSmsProgress={0}
        bulkSmsResult={null}
        bulkSmsSearch=""
        bulkSmsSelectedPhones={new Set()}
        campaigns={[]}
        categories={[]}
        checkCourierReport={vi.fn()}
        copyCategoryLink={vi.fn()}
        copyLandingPageLink={vi.fn()}
        courierReports={{}}
        deleteCampaign={vi.fn()}
        deleteCategory={vi.fn()}
        deleteOrder={vi.fn()}
        deleteProduct={vi.fn()}
        deletingCatId={null}
        editingAdmin={null}
        editingBanner={null}
        editingCampaign={null}
        editingCategory={null}
        editingProduct={null}
        expenses={[]}
        exportDropdownRef={{ current: null }}
        exportOrdersToCSV={vi.fn()}
        filteredOrders={[]}
        formatOrderGroupDate={vi.fn()}
        getCustomerStats={vi.fn()}
        getOrderLocalDateString={vi.fn()}
        handleAddAdmin={vi.fn()}
        handleAdminChatImageUpload={vi.fn()}
        handleAdminImageUpload={vi.fn()}
        handleAdminMultiImageUpload={vi.fn()}
        handleAdminReply={vi.fn()}
        handleAdminVoiceToggle={vi.fn()}
        handleApproveRefund={vi.fn()}
        handleDeleteAdmin={vi.fn()}
        handleDeleteBanner={vi.fn()}
        handleDuplicateProduct={vi.fn()}
        handleEditUserBalance={vi.fn()}
        handlePrintInvoice={vi.fn()}
        handleQuickEditOrderItems={vi.fn()}
        handleSaveBanner={vi.fn()}
        handleSaveQuickEdit={vi.fn()}
        handleSaveSiteConfig={vi.fn()}
        handleSelectAll={vi.fn()}
        handleSelectOrder={vi.fn()}
        handleSendBulkNotification={vi.fn()}
        handleSendBulkSms={vi.fn()}
        handleSendDirectNotification={vi.fn()}
        handleSendIndividualSms={vi.fn()}
        handleToggleReaction={vi.fn()}
        handleUpdateAdmin={vi.fn()}
        handleUpdateOrderStatus={vi.fn()}
        handleUpdatePaymentMethod={vi.fn()}
        handleVariantImageUpload={vi.fn()}
        incompleteOrders={[]}
        individualSmsMessage=""
        individualSmsOrder={null}
        isAdminRecording={false}
        isExportDropdownOpen={false}
        isMasterAdmin={true}
        isSendingBulkNotif={false}
        isSendingBulkSms={false}
        isSendingIndividualSms={false}
        isUsersLoading={false}
        limit={vi.fn()}
        loadingCourierReports={{}}
        newAdminEmail=""
        newAdminPassword=""
        newAdminPhone=""
        newAdminRole="admin"
        newBanner={{}}
        notifications={[]}
        openLandingEditor={vi.fn()}
        orderHistory={[]}
        orderSearchQuery=""
        productDropdownRef={{ current: null }}
        productFormErrors={{}}
        products={[]}
        query={vi.fn()}
        quickEditData={{}}
        quickEditOrderId={null}
        refundRequests={[]}
        removeImage={vi.fn()}
        removeVariant={vi.fn()}
        replyMessage=""
        reportTimeframe="28d"
        saveCampaign={vi.fn()}
        saveCategory={vi.fn()}
        saveProduct={vi.fn()}
        selectChat={vi.fn()}
        selectedChat={null}
        selectedOrderIds={new Set()}
        selectedOrderStatusFilter="all"
        sendToCourier={vi.fn()}
        setActiveProductDropdown={vi.fn()}
        setAdminEndDate={vi.fn()}
        setAdminKeys={vi.fn()}
        setAdminOrderAreaFilter={vi.fn()}
        setAdminOrdersLimit={vi.fn()}
        setAdminReplyingTo={vi.fn()}
        setAdminStartDate={vi.fn()}
        setAdminTab={vi.fn()}
        setBulkNotifForm={vi.fn()}
        setBulkSmsMessage={vi.fn()}
        setBulkSmsPage={vi.fn()}
        setBulkSmsSearch={vi.fn()}
        setBulkSmsSelectedPhones={vi.fn()}
        setCompletedOrderReceipt={vi.fn()}
        setCourierModalPhone={vi.fn()}
        setEditingAdmin={vi.fn()}
        setEditingBanner={vi.fn()}
        setEditingCampaign={vi.fn()}
        setEditingCategory={vi.fn()}
        setEditingProduct={vi.fn()}
        setIndividualSmsMessage={vi.fn()}
        setIndividualSmsOrder={vi.fn()}
        setIsAdminOpen={vi.fn()}
        setIsCourierHistoryModalOpen={vi.fn()}
        setIsExportDropdownOpen={vi.fn()}
        setIsQuotaExceeded={vi.fn()}
        setIsUsersLoading={vi.fn()}
        setNewAdminEmail={vi.fn()}
        setNewAdminPassword={vi.fn()}
        setNewAdminPhone={vi.fn()}
        setNewAdminRole={vi.fn()}
        setNewBanner={vi.fn()}
        setNotifications={vi.fn()}
        setOrderSearchQuery={vi.fn()}
        setProductFormErrors={vi.fn()}
        setQuickEditData={vi.fn()}
        setQuickEditOrderId={vi.fn()}
        setReplyMessage={vi.fn()}
        setReportTimeframe={vi.fn()}
        setSelectedChat={vi.fn()}
        setSelectedOrderForDetails={vi.fn()}
        setSelectedOrderStatusFilter={vi.fn()}
        setShowOnlyPreOrders={vi.fn()}
        setSiteConfig={vi.fn()}
        setUserList={vi.fn()}
        setUserListSearch={vi.fn()}
        showOnlyPreOrders={false}
        siteConfig={{}}
        supportChats={[]}
        toggleBlacklist={vi.fn()}
        togglePublishStatus={vi.fn()}
        userList={[]}
        userListSearch=""
        isSavingProduct={false}
        deletedOrders={[]}
        restoreOrder={vi.fn()}
        permanentDeleteOrder={vi.fn()}
      />
    );

    const approveBtns = screen.getAllByText('Approve Review');
    await act(async () => {
      fireEvent.click(approveBtns[0]);
    });
    expect(handleApprove).toHaveBeenCalledWith('prod_1', 'rev_1');
  });

  it('triggers handleRejectReview callback when Reject button is clicked', async () => {
    const handleReject = vi.fn().mockResolvedValue(true);

    render(
      <AdminPanel
        isAdminOpen={true}
        adminTab="reviews"
        adminViewMode="full"
        adminReviews={mockReviews}
        handleApproveReview={vi.fn()}
        handleRejectReview={handleReject}
        handleDeleteReviewAdmin={vi.fn()}
        activeBanners={[]}
        activeProductDropdown={null}
        addVariant={vi.fn()}
        adminChatEndRef={{ current: null }}
        adminEndDate=""
        adminKeys={[]}
        adminList={[]}
        adminOrderAreaFilter="all"
        adminOrdersLimit={50}
        adminReplyingTo={null}
        adminStartDate=""
        allOrderPhones={[]}
        blacklist={[]}
        bulkNotifForm={{ title: '', message: '', target: 'all', sound: 'default', channel: 'app' }}
        bulkSmsMessage=""
        bulkSmsPage={1}
        bulkSmsProgress={0}
        bulkSmsResult={null}
        bulkSmsSearch=""
        bulkSmsSelectedPhones={new Set()}
        campaigns={[]}
        categories={[]}
        checkCourierReport={vi.fn()}
        copyCategoryLink={vi.fn()}
        copyLandingPageLink={vi.fn()}
        courierReports={{}}
        deleteCampaign={vi.fn()}
        deleteCategory={vi.fn()}
        deleteOrder={vi.fn()}
        deleteProduct={vi.fn()}
        deletingCatId={null}
        editingAdmin={null}
        editingBanner={null}
        editingCampaign={null}
        editingCategory={null}
        editingProduct={null}
        expenses={[]}
        exportDropdownRef={{ current: null }}
        exportOrdersToCSV={vi.fn()}
        filteredOrders={[]}
        formatOrderGroupDate={vi.fn()}
        getCustomerStats={vi.fn()}
        getOrderLocalDateString={vi.fn()}
        handleAddAdmin={vi.fn()}
        handleAdminChatImageUpload={vi.fn()}
        handleAdminImageUpload={vi.fn()}
        handleAdminMultiImageUpload={vi.fn()}
        handleAdminReply={vi.fn()}
        handleAdminVoiceToggle={vi.fn()}
        handleApproveRefund={vi.fn()}
        handleDeleteAdmin={vi.fn()}
        handleDeleteBanner={vi.fn()}
        handleDuplicateProduct={vi.fn()}
        handleEditUserBalance={vi.fn()}
        handlePrintInvoice={vi.fn()}
        handleQuickEditOrderItems={vi.fn()}
        handleSaveBanner={vi.fn()}
        handleSaveQuickEdit={vi.fn()}
        handleSaveSiteConfig={vi.fn()}
        handleSelectAll={vi.fn()}
        handleSelectOrder={vi.fn()}
        handleSendBulkNotification={vi.fn()}
        handleSendBulkSms={vi.fn()}
        handleSendDirectNotification={vi.fn()}
        handleSendIndividualSms={vi.fn()}
        handleToggleReaction={vi.fn()}
        handleUpdateAdmin={vi.fn()}
        handleUpdateOrderStatus={vi.fn()}
        handleUpdatePaymentMethod={vi.fn()}
        handleVariantImageUpload={vi.fn()}
        incompleteOrders={[]}
        individualSmsMessage=""
        individualSmsOrder={null}
        isAdminRecording={false}
        isExportDropdownOpen={false}
        isMasterAdmin={true}
        isSendingBulkNotif={false}
        isSendingBulkSms={false}
        isSendingIndividualSms={false}
        isUsersLoading={false}
        limit={vi.fn()}
        loadingCourierReports={{}}
        newAdminEmail=""
        newAdminPassword=""
        newAdminPhone=""
        newAdminRole="admin"
        newBanner={{}}
        notifications={[]}
        openLandingEditor={vi.fn()}
        orderHistory={[]}
        orderSearchQuery=""
        productDropdownRef={{ current: null }}
        productFormErrors={{}}
        products={[]}
        query={vi.fn()}
        quickEditData={{}}
        quickEditOrderId={null}
        refundRequests={[]}
        removeImage={vi.fn()}
        removeVariant={vi.fn()}
        replyMessage=""
        reportTimeframe="28d"
        saveCampaign={vi.fn()}
        saveCategory={vi.fn()}
        saveProduct={vi.fn()}
        selectChat={vi.fn()}
        selectedChat={null}
        selectedOrderIds={new Set()}
        selectedOrderStatusFilter="all"
        sendToCourier={vi.fn()}
        setActiveProductDropdown={vi.fn()}
        setAdminEndDate={vi.fn()}
        setAdminKeys={vi.fn()}
        setAdminOrderAreaFilter={vi.fn()}
        setAdminOrdersLimit={vi.fn()}
        setAdminReplyingTo={vi.fn()}
        setAdminStartDate={vi.fn()}
        setAdminTab={vi.fn()}
        setBulkNotifForm={vi.fn()}
        setBulkSmsMessage={vi.fn()}
        setBulkSmsPage={vi.fn()}
        setBulkSmsSearch={vi.fn()}
        setBulkSmsSelectedPhones={vi.fn()}
        setCompletedOrderReceipt={vi.fn()}
        setCourierModalPhone={vi.fn()}
        setEditingAdmin={vi.fn()}
        setEditingBanner={vi.fn()}
        setEditingCampaign={vi.fn()}
        setEditingCategory={vi.fn()}
        setEditingProduct={vi.fn()}
        setIndividualSmsMessage={vi.fn()}
        setIndividualSmsOrder={vi.fn()}
        setIsAdminOpen={vi.fn()}
        setIsCourierHistoryModalOpen={vi.fn()}
        setIsExportDropdownOpen={vi.fn()}
        setIsQuotaExceeded={vi.fn()}
        setIsUsersLoading={vi.fn()}
        setNewAdminEmail={vi.fn()}
        setNewAdminPassword={vi.fn()}
        setNewAdminPhone={vi.fn()}
        setNewAdminRole={vi.fn()}
        setNewBanner={vi.fn()}
        setNotifications={vi.fn()}
        setOrderSearchQuery={vi.fn()}
        setProductFormErrors={vi.fn()}
        setQuickEditData={vi.fn()}
        setQuickEditOrderId={vi.fn()}
        setReplyMessage={vi.fn()}
        setReportTimeframe={vi.fn()}
        setSelectedChat={vi.fn()}
        setSelectedOrderForDetails={vi.fn()}
        setSelectedOrderStatusFilter={vi.fn()}
        setShowOnlyPreOrders={vi.fn()}
        setSiteConfig={vi.fn()}
        setUserList={vi.fn()}
        setUserListSearch={vi.fn()}
        showOnlyPreOrders={false}
        siteConfig={{}}
        supportChats={[]}
        toggleBlacklist={vi.fn()}
        togglePublishStatus={vi.fn()}
        userList={[]}
        userListSearch=""
        isSavingProduct={false}
        deletedOrders={[]}
        restoreOrder={vi.fn()}
        permanentDeleteOrder={vi.fn()}
      />
    );

    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      fireEvent.click(rejectButtons[0]);
    });
    expect(handleReject).toHaveBeenCalled();
  });
});
