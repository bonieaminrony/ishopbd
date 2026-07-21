
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Ban, Bell, Calendar, Camera, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Copy, Download, Edit, Edit2, Edit3, Eye, Gift, Headset, Heart, History, ImageIcon, Landmark, LayoutGrid, LayoutTemplate, List, Loader2, MessageSquare, Mic, MoreVertical, Phone, Plus, PlusCircle, Printer, Receipt, RefreshCcw, Search, Send, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Square, Tag, ThumbsUp, Trash2, TrendingUp, Truck, Upload, User, UserCheck, Users, Wallet, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, query, limit, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface AdminPanelProps {
  isAdminOpen: any;
  ProfitAnalysis: any;
  activeBanners: any;
  activeProductDropdown: any;
  addVariant: any;
  adminChatEndRef: any;
  adminEndDate: any;
  adminKeys: any;
  adminList: any;
  adminOrderAreaFilter: any;
  adminOrdersLimit: any;
  adminReplyingTo: any;
  adminStartDate: any;
  adminTab: any;
  adminViewMode: any;
  allOrderPhones: any;
  blacklist: any;
  bulkNotifForm: any;
  bulkSmsMessage: any;
  bulkSmsPage: any;
  bulkSmsProgress: any;
  bulkSmsResult: any;
  bulkSmsSearch: any;
  bulkSmsSelectedPhones: any;
  campaigns: any;
  categories: any;
  checkCourierReport: any;
  copyCategoryLink: any;
  copyLandingPageLink: any;
  courierReports: any;
  deleteCampaign: any;
  deleteCategory: any;
  deleteOrder: any;
  deleteProduct: any;
  deletingCatId: any;
  editingAdmin: any;
  editingBanner: any;
  editingCampaign: any;
  editingCategory: any;
  editingProduct: any;
  expenses: any;
  exportDropdownRef: any;
  exportOrdersToCSV: any;
  filteredOrders: any;
  formatOrderGroupDate: any;
  getCustomerStats: any;
  getOrderLocalDateString: any;
  handleAddAdmin: any;
  handleAdminChatImageUpload: any;
  handleAdminImageUpload: any;
  handleAdminMultiImageUpload: any;
  handleAdminReply: any;
  handleAdminVoiceToggle: any;
  handleApproveRefund: any;
  handleDeleteAdmin: any;
  handleDeleteBanner: any;
  handleDuplicateProduct: any;
  handleEditUserBalance: any;
  handlePrintInvoice: any;
  handleQuickEditOrderItems: any;
  handleSaveBanner: any;
  handleSaveQuickEdit: any;
  handleSaveSiteConfig: any;
  handleSelectAll: any;
  handleSelectOrder: any;
  handleSendBulkNotification: any;
  handleSendBulkSms: any;
  handleSendDirectNotification: any;
  handleSendIndividualSms: any;
  handleToggleReaction: any;
  handleUpdateAdmin: any;
  handleUpdateOrderStatus: any;
  handleUpdatePaymentMethod: any;
  handleVariantImageUpload: any;
  incompleteOrders: any;
  individualSmsMessage: any;
  individualSmsOrder: any;
  isAdminRecording: any;
  isExportDropdownOpen: any;
  isMasterAdmin: any;
  isSendingBulkNotif: any;
  isSendingBulkSms: any;
  isSendingIndividualSms: any;
  isUsersLoading: any;
  limit: any;
  loadingCourierReports: any;
  newAdminEmail: any;
  newAdminPassword: any;
  newAdminPhone: any;
  newAdminRole: any;
  newBanner: any;
  notifications: any;
  openLandingEditor: any;
  orderHistory: any;
  orderSearchQuery: any;
  productDropdownRef: any;
  productFormErrors: any;
  products: any;
  query: any;
  quickEditData: any;
  quickEditOrderId: any;
  refundRequests: any;
  removeImage: any;
  removeVariant: any;
  replyMessage: any;
  reportTimeframe: any;
  saveCampaign: any;
  saveCategory: any;
  saveProduct: any;
  selectChat: any;
  selectedChat: any;
  selectedOrderIds: any;
  selectedOrderStatusFilter: any;
  sendToCourier: any;
  setActiveProductDropdown: any;
  setAdminEndDate: any;
  setAdminKeys: any;
  setAdminOrderAreaFilter: any;
  setAdminOrdersLimit: any;
  setAdminReplyingTo: any;
  setAdminStartDate: any;
  setAdminTab: any;
  setBulkNotifForm: any;
  setBulkSmsMessage: any;
  setBulkSmsPage: any;
  setBulkSmsSearch: any;
  setBulkSmsSelectedPhones: any;
  setCompletedOrderReceipt: any;
  setCourierModalPhone: any;
  setEditingAdmin: any;
  setEditingBanner: any;
  setEditingCampaign: any;
  setEditingCategory: any;
  setEditingProduct: any;
  setIndividualSmsMessage: any;
  setIndividualSmsOrder: any;
  setIsAdminOpen: any;
  setIsCourierHistoryModalOpen: any;
  setIsExportDropdownOpen: any;
  setIsQuotaExceeded: any;
  setIsUsersLoading: any;
  setNewAdminEmail: any;
  setNewAdminPassword: any;
  setNewAdminPhone: any;
  setNewAdminRole: any;
  setNewBanner: any;
  setNotifications: any;
  setOrderSearchQuery: any;
  setProductFormErrors: any;
  setQuickEditData: any;
  setQuickEditOrderId: any;
  setReplyMessage: any;
  setReportTimeframe: any;
  setSelectedChat: any;
  setSelectedOrderForDetails: any;
  setSelectedOrderStatusFilter: any;
  setShowOnlyPreOrders: any;
  setSiteConfig: any;
  setUserList: any;
  setUserListSearch: any;
  showOnlyPreOrders: any;
  siteConfig: any;
  supportChats: any;
  toggleBlacklist: any;
  togglePublishStatus: any;
  userList: any;
  userListSearch: any;
}

// Ensure ProfitAnalysis is imported if needed, wait, ProfitAnalysis is an icon? No, it's a component.
// Oh! ProfitAnalysis is in the props! We must import it if it's a component.
// But we pass it as any right now if we don't import it.

export const BENGALI_FONTS = [
  { name: "Default (Hind Siliguri)", value: "font-sans" },
  { name: "Lalsalu (Anek Bangla)", value: "font-lalsalu" },
  { name: "Ador (Mina)", value: "font-ador" },
  { name: "Galada (Stylized)", value: "font-galada" },
  { name: "Atma (Playful)", value: "font-atma" },
];
export const BULK_SMS_PAGE_SIZE = 50;

export default function AdminPanel(props: AdminPanelProps) {
  const {
    isAdminOpen,
    ProfitAnalysis,
    activeBanners,
    activeProductDropdown,
    addVariant,
    adminChatEndRef,
    adminEndDate,
    adminKeys,
    adminList,
    adminOrderAreaFilter,
    adminOrdersLimit,
    adminReplyingTo,
    adminStartDate,
    adminTab,
    adminViewMode,
    allOrderPhones,
    blacklist,
    bulkNotifForm,
    bulkSmsMessage,
    bulkSmsPage,
    bulkSmsProgress,
    bulkSmsResult,
    bulkSmsSearch,
    bulkSmsSelectedPhones,
    campaigns,
    categories,
    checkCourierReport,
    copyCategoryLink,
    copyLandingPageLink,
    courierReports,
    deleteCampaign,
    deleteCategory,
    deleteOrder,
    deleteProduct,
    deletingCatId,
    editingAdmin,
    editingBanner,
    editingCampaign,
    editingCategory,
    editingProduct,
    expenses,
    exportDropdownRef,
    exportOrdersToCSV,
    filteredOrders,
    formatOrderGroupDate,
    getCustomerStats,
    getOrderLocalDateString,
    handleAddAdmin,
    handleAdminChatImageUpload,
    handleAdminImageUpload,
    handleAdminMultiImageUpload,
    handleAdminReply,
    handleAdminVoiceToggle,
    handleApproveRefund,
    handleDeleteAdmin,
    handleDeleteBanner,
    handleDuplicateProduct,
    handleEditUserBalance,
    handlePrintInvoice,
    handleQuickEditOrderItems,
    handleSaveBanner,
    handleSaveQuickEdit,
    handleSaveSiteConfig,
    handleSelectAll,
    handleSelectOrder,
    handleSendBulkNotification,
    handleSendBulkSms,
    handleSendDirectNotification,
    handleSendIndividualSms,
    handleToggleReaction,
    handleUpdateAdmin,
    handleUpdateOrderStatus,
    handleUpdatePaymentMethod,
    handleVariantImageUpload,
    incompleteOrders,
    individualSmsMessage,
    individualSmsOrder,
    isAdminRecording,
    isExportDropdownOpen,
    isMasterAdmin,
    isSendingBulkNotif,
    isSendingBulkSms,
    isSendingIndividualSms,
    isUsersLoading,
    limit,
    loadingCourierReports,
    newAdminEmail,
    newAdminPassword,
    newAdminPhone,
    newAdminRole,
    newBanner,
    notifications,
    openLandingEditor,
    orderHistory,
    orderSearchQuery,
    productDropdownRef,
    productFormErrors,
    products,
    query,
    quickEditData,
    quickEditOrderId,
    refundRequests,
    removeImage,
    removeVariant,
    replyMessage,
    reportTimeframe,
    saveCampaign,
    saveCategory,
    saveProduct,
    selectChat,
    selectedChat,
    selectedOrderIds,
    selectedOrderStatusFilter,
    sendToCourier,
    setActiveProductDropdown,
    setAdminEndDate,
    setAdminKeys,
    setAdminOrderAreaFilter,
    setAdminOrdersLimit,
    setAdminReplyingTo,
    setAdminStartDate,
    setAdminTab,
    setBulkNotifForm,
    setBulkSmsMessage,
    setBulkSmsPage,
    setBulkSmsSearch,
    setBulkSmsSelectedPhones,
    setCompletedOrderReceipt,
    setCourierModalPhone,
    setEditingAdmin,
    setEditingBanner,
    setEditingCampaign,
    setEditingCategory,
    setEditingProduct,
    setIndividualSmsMessage,
    setIndividualSmsOrder,
    setIsAdminOpen,
    setIsCourierHistoryModalOpen,
    setIsExportDropdownOpen,
    setIsQuotaExceeded,
    setIsUsersLoading,
    setNewAdminEmail,
    setNewAdminPassword,
    setNewAdminPhone,
    setNewAdminRole,
    setNewBanner,
    setNotifications,
    setOrderSearchQuery,
    setProductFormErrors,
    setQuickEditData,
    setQuickEditOrderId,
    setReplyMessage,
    setReportTimeframe,
    setSelectedChat,
    setSelectedOrderForDetails,
    setSelectedOrderStatusFilter,
    setShowOnlyPreOrders,
    setSiteConfig,
    setUserList,
    setUserListSearch,
    showOnlyPreOrders,
    siteConfig,
    supportChats,
    toggleBlacklist,
    togglePublishStatus,
    userList,
    userListSearch,
  } = props;

  const [settingsTab, setSettingsTab] = React.useState("general");
  const [newSubcategoryInputs, setNewSubcategoryInputs] = React.useState<Record<string, string>>({});

  return (
    <>
      {isAdminOpen && (
          <div className="fixed inset-0 z-[500] bg-gray-50 flex flex-col font-['Inter']">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full overflow-hidden flex flex-col md:flex-row bg-white"
            >
              {/* Admin Sidebar / Header */}
              <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r flex flex-col bg-gray-50 gap-6 md:w-[280px] shrink-0 md:h-full md:overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary text-white rounded-xl shadow-md shadow-primary/20">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                        Active Campaigns
                      </h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        i SHOP BD
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAdminOpen(false)}
                    className="md:hidden p-2 text-gray-400 hover:text-red-500 hover:bg-gray-200/50 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 w-full hidden md:flex flex-col gap-2">
                  <div className="flex flex-col gap-1.5 w-full">
                    <button
                      onClick={() => {
                        setAdminTab("orders");
                        setShowOnlyPreOrders(false);
                        setAdminOrdersLimit(50);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "orders" && !showOnlyPreOrders ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <History size={18} /> Orders ({orderHistory.filter(o => {
                        const isPreOrder = (o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending";
                        return !isPreOrder;
                      }).length})
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab("orders");
                        setShowOnlyPreOrders(true);
                        setAdminOrdersLimit(50);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "orders" && showOnlyPreOrders ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${showOnlyPreOrders && adminTab === "orders" ? "bg-white animate-pulse" : "bg-yellow-500"}`} />
                      Pre Order ({orderHistory.filter(o => {
                        const isPreOrder = (o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending";
                        return isPreOrder;
                      }).length})
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab("incomplete_orders");
                        setShowOnlyPreOrders(false);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "incomplete_orders" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <ShoppingCart size={18} /> Incomplete ({incompleteOrders.length})
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab("support");
                        setShowOnlyPreOrders(false);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "support" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <Headset size={18} /> Support ({supportChats.filter(c => c.unreadByAdmin).length})
                    </button>
                    {adminViewMode === "full" && (
                      <>
                        <button
                          onClick={() => setAdminTab("products")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "products" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <PlusCircle size={18} /> Products ({products.length})
                        </button>
                        <button
                          onClick={() => setAdminTab("categories")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "categories" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <LayoutGrid size={18} /> Categories ({categories.length})
                        </button>
                        <button
                          onClick={() => setAdminTab("refunds")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "refunds" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <RefreshCcw size={18} /> Refunds ({refundRequests.filter(r => r.status === "pending").length})
                        </button>
                        <button
                          onClick={() => setAdminTab("users")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "users" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Users size={18} /> Users
                        </button>
                        <button
                          onClick={() => setAdminTab("campaigns")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "campaigns" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Gift size={18} /> Campaigns
                        </button>
                        <button
                          onClick={() => setAdminTab("bulk_sms")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "bulk_sms" ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <MessageSquare size={18} /> Bulk SMS
                        </button>
                        {isMasterAdmin && (
                          <button
                            onClick={() => setAdminTab("profit_analysis")}
                            className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "profit_analysis" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                          >
                            <TrendingUp size={18} /> Accounts
                          </button>
                        )}
                        <button
                          onClick={() => setAdminTab("settings")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "settings" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <ShieldCheck size={18} /> Settings
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-auto pt-4 border-t">
                    <button
                      onClick={() => setIsAdminOpen(false)}
                      className="text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full text-red-500 hover:bg-red-50"
                    >
                      <XCircle size={18} /> Close Dashboard
                    </button>
                  </div>
                </div>
              </div>
              {/* Mobile Tab Switcher */}
              <div className="md:hidden border-b bg-white overflow-x-auto scroll-smooth pb-1 shrink-0">
                <div className="flex p-2 gap-2 min-w-max">
                  {([
                        { id: "orders", icon: History, label: `অর্ডার (${orderHistory.filter(o => !((o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending")).length})` },
                        { id: "preorder", icon: CircleDot, label: `Pre Order (${orderHistory.filter(o => (o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending").length})` },
                        { id: "support", icon: Headset, label: "Support" },
                        ...(adminViewMode === "full" ? [
                          { id: "products", icon: PlusCircle, label: "Products" },
                          { id: "categories", icon: LayoutGrid, label: "Categories" },
                          { id: "refunds", icon: RefreshCcw, label: "Refunds" },
                          { id: "users", icon: Users, label: "Users" },
                          { id: "campaigns", icon: Gift, label: "Campaigns" },
                          { id: "bulk_sms", icon: MessageSquare, label: "Bulk SMS" },
                          ...(isMasterAdmin ? [{ id: "profit_analysis", icon: TrendingUp, label: "Accounts" }] : []),
                          { id: "settings", icon: ShieldCheck, label: "Settings" },
                        ] : [])
                      ]).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "preorder") {
                          setAdminTab("orders");
                          setShowOnlyPreOrders(true);
                          setAdminOrdersLimit(50);
                        } else {
                          setAdminTab(tab.id as any);
                          setShowOnlyPreOrders(false);
                          setAdminOrdersLimit(50);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        (tab.id === "preorder" && showOnlyPreOrders) || (tab.id !== "preorder" && adminTab === tab.id && (tab.id !== "orders" || !showOnlyPreOrders))
                          ? tab.id === "preorder" ? "bg-yellow-500 text-white shadow-md" : "bg-primary text-white shadow-md"
                          : "bg-gray-50 text-gray-500 border border-gray-100"
                      }`}
                    >
                      <tab.icon size={14} className={tab.id === "preorder" && !showOnlyPreOrders ? "text-yellow-500" : ""} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Admin Content Area */}
              <div className={`flex-1 w-full md:w-auto h-full ${adminTab === "support" ? "overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8"} bg-gray-50/30 no-scrollbar flex flex-col`}>
                                {adminTab === "orders" && (
                  <div className="space-y-6">
                    {/* Dashboard Analytics */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-secondary">Analytics Report</h4>
                      <select
                        value={reportTimeframe}
                        onChange={(e) => setReportTimeframe(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                      >
                        <option value="28d">Last 28 Days</option>
                        {(() => {
                          const months = [];
                          for (let i = 1; i <= 3; i++) {
                            const d = new Date();
                            d.setMonth(d.getMonth() - i);
                            months.push(
                              <option key={`month_${i}`} value={`month_${d.getMonth()}_${d.getFullYear()}`}>
                                {d.toLocaleString('bn-BD', { month: 'long' })} {d.getFullYear()}
                              </option>
                            );
                          }
                          return months;
                        })()}
                        <option value="1y">1 Year</option>
                        <option value="3y">3 Years</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                      {(() => {
                        let filteredForAnalytics = orderHistory;
                        const now = new Date();
                        if (reportTimeframe === "28d") {
                          const cutoff = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = orderHistory.filter(o => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe === "1y") {
                          const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = orderHistory.filter(o => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe === "3y") {
                          const cutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = orderHistory.filter(o => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe.startsWith("month_")) {
                          const parts = reportTimeframe.split("_");
                          const targetMonth = parseInt(parts[1]);
                          const targetYear = parseInt(parts[2]);
                          filteredForAnalytics = orderHistory.filter(o => {
                            if (!o.createdAt) return false;
                            const d = new Date(typeof o.createdAt === 'string' ? o.createdAt : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0));
                            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
                          });
                        }
                        const totalOrders = filteredForAnalytics.length;
                        const pendingOrders = filteredForAnalytics.filter(o => o.status === 'pending').length;
                        const deliveredOrders = filteredForAnalytics.filter(o => o.status === 'delivered').length;
                        const cancelledOrders = filteredForAnalytics.filter(o => o.status === 'cancelled').length;
                        const totalSales = filteredForAnalytics.filter(o => o.status !== 'cancelled' && o.status !== 'returned').reduce((acc, o) => acc + (o.total || 0), 0);
                        const successRate = totalOrders > 0 ? Math.round((deliveredOrders / (totalOrders - pendingOrders || 1)) * 100) : 0;
                        
                        return (
                          <>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                              <div className="flex items-center gap-2 text-gray-500">
                                <ShoppingBag size={14} /> <span className="text-[11px] font-bold">Total Orders</span>
                              </div>
                              <span className="text-2xl font-bold text-secondary">{totalOrders}</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                              <div className="flex items-center gap-2 text-gray-500">
                                <Clock size={14} /> <span className="text-[11px] font-bold">Pending Orders</span>
                              </div>
                              <span className="text-2xl font-bold text-orange-500">{pendingOrders}</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                              <div className="flex items-center gap-2 text-gray-500">
                                <TrendingUp size={14} /> <span className="text-[11px] font-bold">Total Sales</span>
                              </div>
                              <span className="text-2xl font-bold text-primary">৳{totalSales.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-2">
                              <div className="flex items-center gap-2 text-gray-500">
                                <CheckCircle size={14} /> <span className="text-[11px] font-bold">Success Rate</span>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <span className={`text-xl font-bold ${successRate >= 60 ? 'text-emerald-500' : 'text-rose-500'}`}>{successRate}%</span>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${successRate >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(successRate, 100)}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
                          <History size={20} className="text-primary" />
                         Recent Orders
                        </h4>
                        
                        {/* Order Status Filters */}
                        <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/30">
                          {[
                            { id: "all", label: "All" },
                            { id: "pending", label: "Pending" },
                            { id: "confirmed", label: "Confirmed" },
                            { id: "shipped", label: "Shipped" },
                            { id: "delivered", label: "Delivered" },
                            { id: "returned", label: "Returned" },
                            { id: "cancelled", label: "Cancelled" }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setSelectedOrderStatusFilter(tab.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                selectedOrderStatusFilter === tab.id
                                  ? "bg-primary text-white shadow-sm"
                                  : "text-gray-500 hover:text-secondary hover:bg-white/50"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="date" 
                            value={adminStartDate}
                            onChange={e => setAdminStartDate(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                          />
                          <span className="text-gray-400 text-xs">-</span>
                          <input 
                            type="date" 
                            value={adminEndDate}
                            onChange={e => setAdminEndDate(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                          />
                        </div>
                        <select
                          value={adminOrderAreaFilter}
                          onChange={e => setAdminOrderAreaFilter(e.target.value)}
                          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                        >
                          <option value="all">All Areas</option>
                          <option value="inside">Inside Dhaka</option>
                          <option value="outside">Outside Dhaka</option>
                        </select>
                        <div className="flex gap-2 flex-1 min-w-[150px]">
                          <div className="relative flex-1">
                            <Search
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={16}
                            />
                            <input
                              type="text"
                              placeholder="Search by Phone Number..."
                              value={orderSearchQuery}
                              onChange={(e) =>
                                setOrderSearchQuery(e.target.value)
                              }
                              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary text-xs font-bold shadow-sm transition-all"
                            />
                            {orderSearchQuery && (
                              <button
                                onClick={() => setOrderSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="relative font-sans" ref={exportDropdownRef}>
                          <button
                            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                          >
                            <Landmark size={16} /> Excel Export <ChevronDown size={14} />
                          </button>
                          {isExportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-[999] py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('daily');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={14} /> Todayকের রিপোর্ট
                              </button>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('weekly');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={14} /> এ—এ¤ ৭ দিনের রিপোর্ট
                              </button>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('monthly');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={14} /> এ—এ¤ ৩০ দিনের রিপোর্ট
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('all');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Landmark size={14} /> All অর্ডার এক্সপোর্ট
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Mobile View */}
                    <div className="lg:hidden space-y-3">
                      {(() => {
                        let lastDateText = "";
                        return filteredOrders.slice(0, adminOrdersLimit).map((order: any) => {
                          const orderDateVal = getOrderLocalDateString(order);
                          const dateText = formatOrderGroupDate(orderDateVal);
                          const isNewDateGroup = dateText !== lastDateText;
                          if (isNewDateGroup) {
                            lastDateText = dateText;
                          }
                          const isToday = dateText.startsWith("Today");
                          return (
                            <React.Fragment key={order.id}>
                              {isNewDateGroup && (
                                <div className="flex items-center gap-3 py-3 px-1 mt-4 first:mt-1">
                                  <div className={`h-[1.5px] flex-1 ${isToday ? 'bg-gradient-to-r from-transparent to-primary/40' : 'bg-gradient-to-r from-transparent to-secondary/30'}`}></div>
                                  <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold shadow-sm shrink-0 transition-all ${
                                    isToday 
                                      ? 'bg-primary/[0.06] text-primary border-primary/20 shadow-primary/5' 
                                      : 'bg-secondary/[0.04] text-secondary border-secondary/15 shadow-secondary/5'
                                  }`}>
                                    {isToday ? (
                                      <Calendar size={12} className="text-primary animate-pulse" />
                                    ) : (
                                      <Clock size={12} className="text-secondary/70" />
                                    )}
                                    {dateText}
                                  </div>
                                  <div className={`h-[1.5px] flex-1 ${isToday ? 'bg-gradient-to-l from-transparent to-primary/40' : 'bg-gradient-to-l from-transparent to-secondary/30'}`}></div>
                                </div>
                              )}
                              <div
                                onClick={() => setSelectedOrderForDetails(order)}
                                className={`rounded-xl shadow-sm border p-2 flex gap-2.5 cursor-pointer active:scale-[0.98] transition-transform ${
                                  order.status === "pending"
                                    ? "bg-purple-100/40 border-purple-200/30 hover:bg-purple-100/60"
                                    : order.status === "confirmed"
                                    ? "bg-blue-100/40 border-blue-200/30 hover:bg-blue-100/60"
                                    : order.status === "shipped"
                                    ? "bg-indigo-100/40 border-indigo-200/30 hover:bg-indigo-100/60"
                                    : order.status === "delivered"
                                    ? "bg-emerald-100/50 border-emerald-200/40 hover:bg-emerald-100/70"
                                    : order.status === "returned"
                                    ? "bg-amber-100/55 border-amber-200/45 hover:bg-amber-100/75"
                                    : order.status === "cancelled"
                                    ? "bg-red-100/50 border-red-200/40 hover:bg-red-100/70"
                                    : "bg-white border-gray-200 hover:bg-gray-50/50"
                                }`}
                              >
                          <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0 self-center">
                            <img loading="lazy"
                              src={order.items[0]?.variantImage || order.items[0]?.product?.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrder(e, order.id);
                              }} 
                              className="absolute top-1.5 left-1.5 bg-white rounded flex items-center justify-center p-[2px] cursor-pointer shadow-sm"
                            >
                              <input 
                                type="checkbox" 
                                className="w-[14px] h-[14px] rounded-[2px] border-gray-300 text-primary focus:ring-primary pointer-events-none"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={() => {}}
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0 justify-between h-[88px]">
                            <div className="flex items-center gap-2 w-full min-w-0 group cursor-pointer" onClick={(e) => { e.stopPropagation(); handleQuickEditOrderItems(order); }}>
                                <span className="text-[12px] font-bold text-secondary truncate">
                                  {order.items.map((i:any) => `${i.product?.name || 'Unknown'} x${i.quantity}`).join(', ')}
                                </span>
                                <button 
                                  className="text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  title="Edit Order Items"
                                >
                                  <Edit3 size={12} />
                                </button>
                              </div>
                            <span className="text-[13px] font-bold text-red-600 truncate">
                              {order.customerName}
                            </span>
                            
                            <div className="flex flex-col gap-2 mt-1.5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-extrabold text-slate-700 tracking-tight">
                                    {order.customerPhone}
                                  </span>
                                  {(() => {
                                    const stats = getCustomerStats(order.customerPhone);
                                    if(stats.total === 0) return null;
                                    return (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-[2px] rounded-full border border-slate-200">Total: {stats.total}</span>
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-[2px] rounded-full border border-emerald-200">Success: {stats.delivered}</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {order.customerPhone && (
                                    <a 
                                      href={`https://wa.me/880${order.customerPhone.startsWith('0') ? order.customerPhone.substring(1) : order.customerPhone}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="w-7 h-7 flex items-center justify-center bg-green-50 text-green-600 rounded-[8px] hover:bg-green-100 hover:scale-105 active:scale-95 transition-all border border-green-200/60 shadow-sm"
                                      title="Chat on WhatsApp"
                                    >
                                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                      </svg>
                                    </a>
                                  )}
                                <a 
                                  href={`tel:${order.customerPhone}`} 
                                  className="w-7 h-7 flex items-center justify-center bg-teal-50 text-teal-600 rounded-[8px] hover:bg-teal-100 hover:scale-105 active:scale-95 transition-all border border-teal-200/60 shadow-sm"
                                  title="Action"
                                >
                                  <Phone size={13} />
                                </a>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                      setIndividualSmsMessage("");
                                    }}
                                    className={`w-7 h-7 flex items-center justify-center rounded-[8px] transition-all hover:scale-105 active:scale-95 border shadow-sm ${individualSmsOrder?.id === order.id ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-blue-50 text-blue-600 border-blue-200/60 hover:bg-blue-100'}`}
                                    title="Send SMS"
                                  >
                                    <MessageSquare size={13} />
                                  </button>
                                  <AnimatePresence>
                                    {individualSmsOrder?.id === order.id && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        className="absolute top-[130%] right-0 bg-white rounded-2xl w-64 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 z-[200] origin-top-right cursor-default"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                        <div className="relative p-4 bg-white rounded-2xl z-10">
                                          <div className="flex justify-between items-center mb-2">
                                            <p className="text-[10px] text-gray-500">Recipient: <span className="font-bold text-gray-800">{order.customerPhone || order.phone}</span></p>
                                            <button onClick={() => setIndividualSmsOrder(null)} className="text-gray-400 hover:text-red-500">
                                              <X size={14} />
                                            </button>
                                          </div>
                                          <textarea
                                            value={individualSmsMessage}
                                            onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                            placeholder="Write your comment..."
                                            className="w-full h-24 p-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-3"
                                          ></textarea>
                                          <div className="flex justify-center">
                                            <button
                                              onClick={handleSendIndividualSms}
                                              disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                              className="bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 disabled:opacity-50 transition-all active:scale-95 w-full shadow-sm shadow-green-500/20"
                                            >
                                              {isSendingIndividualSms ? (
                                                "Sending..."
                                              ) : (
                                                <>
                                                  <MessageSquare size={14} /> SMS পাঠান
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCompletedOrderReceipt(order);
                                    }}
                                    className="hidden md:flex text-sky-600 bg-sky-50 hover:bg-sky-100 w-7 h-7 shrink-0 justify-center items-center rounded-[8px] transition-all hover:scale-105 shadow-sm active:scale-95 border border-sky-200/60"
                                    title="View Receipt"
                                  >
                                    <Receipt size={13} />
                                  </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2 w-full mt-1">
                              <div className="bg-white flex-1 px-2.5 py-[5px] rounded-lg border border-gray-200 text-[11px] text-gray-600 font-medium truncate shadow-sm" title={order.address}>
                                {order.address && order.address.trim() !== "" && order.address !== "N/A" ? order.address.split(' - (')[0] : 'No address found'}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className={`text-[10px] font-bold border rounded-lg px-2 py-[5px] outline-none focus:ring-2 shadow-sm cursor-pointer ${
                                    order.status === 'pending'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-300'
                                      : order.status === 'confirmed'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-300'
                                      : order.status === 'shipped'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-300'
                                      : order.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300'
                                      : order.status === 'returned'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300'
                                      : order.status === 'cancelled'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-300'
                                      : 'bg-white border-gray-200 text-secondary focus:ring-primary'
                                  }`}
                                >
                                  <option value="pending" className="bg-white text-gray-800 font-semibold">Pending</option>
                                  <option value="confirmed" className="bg-white text-gray-800 font-semibold">Confirmed</option>
                                  <option value="shipped" className="bg-white text-gray-800 font-semibold">Shipped</option>
                                  <option value="delivered" className="bg-white text-gray-800 font-semibold">Delivered</option>
                                  <option value="returned" className="bg-white text-gray-800 font-semibold">Returned</option>
                                  <option value="cancelled" className="bg-white text-gray-800 font-semibold">Cancelled</option>
                                </select>
                                <select
                                  value={order.paymentMethod || "CASH"}
                                  onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                                  className={`text-[10px] font-bold px-2 py-[5px] rounded-lg uppercase border cursor-pointer outline-none shadow-sm ${
                                    (order.paymentMethod || "CASH").toUpperCase() === "CASH" || (order.paymentMethod || "CASH").toUpperCase() === "COD"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-200"
                                      : (order.paymentMethod || "CASH").toUpperCase() === "BKASH"
                                      ? "bg-pink-50 text-pink-700 border-pink-200 focus:ring-pink-200"
                                      : (order.paymentMethod || "CASH").toUpperCase() === "NAGAD"
                                      ? "bg-orange-50 text-orange-700 border-orange-200 focus:ring-orange-200"
                                      : (order.paymentMethod || "CASH").toUpperCase() === "DUE"
                                      ? "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-200"
                                  }`}
                                >
                                  <option value="CASH">CASH</option>
                                  <option value="BKASH">BKASH</option>
                                  <option value="NAGAD">NAGAD</option>
                                  <option value="DUE">DUE</option>
                                  <option value="BANK">BANK</option>
                                  <option value="ONLINE">ONLINE</option>
                                  <option value="N/A">N/A</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                              </div>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 bg-slate-50">
                      <table className="w-full text-left min-w-[1000px] border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-50">
                            <th className="px-4 py-3 w-10">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                onChange={handleSelectAll}
                                checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.slice(0, adminOrdersLimit).length}
                              />
                            </th>
                            
                            <th className="px-4 py-3">Product Info</th>
                            <th className="px-4 py-3 text-left">Total Price</th>
                            <th className="px-4 py-3">Customer Info</th>
                            <th className="px-4 py-3 text-center">Status & Payment</th>
                            <th className="px-4 py-3 text-center">Delivery Rate</th>
                            <th className="px-4 py-3">
                              <div className="flex items-center justify-end gap-3 ml-auto">
                                <div className="w-[100px] text-center">SMS & VERIFY</div>
                                <div className="w-8 shrink-0"></div>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            let lastDateText = "";
                            return filteredOrders.slice(0, adminOrdersLimit).map((order, idx) => {
                              const orderDateVal = getOrderLocalDateString(order);
                              const dateText = formatOrderGroupDate(orderDateVal);
                              const isNewDateGroup = dateText !== lastDateText;
                              if (isNewDateGroup) {
                                lastDateText = dateText;
                              }
                              const isToday = dateText.startsWith("Today");
                              return (
                                <React.Fragment key={order.id}>
                                  {isNewDateGroup && (
                                    <tr className="overflow-hidden">
                                      <td colSpan={7} className="py-2.5 px-4">
                                        <div className={`flex items-center justify-center gap-2 w-full ${isToday ? 'text-primary' : 'text-gray-500'}`}>
                                          {isToday ? (
                                            <Calendar size={15} className="animate-pulse" />
                                          ) : (
                                            <Clock size={15} />
                                          )}
                                          <span className="text-[13px] font-bold tracking-wide">{dateText}</span>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  <tr
                                    className={`transition-colors overflow-hidden ${
                                      order.status === "pending"
                                        ? "bg-purple-100/40 hover:bg-purple-100/60"
                                        : order.status === "confirmed"
                                        ? "bg-blue-100/40 hover:bg-blue-100/60"
                                        : order.status === "shipped"
                                        ? "bg-indigo-100/40 hover:bg-indigo-100/60"
                                        : order.status === "delivered"
                                        ? "bg-emerald-100/45 hover:bg-emerald-100/65"
                                        : order.status === "returned"
                                        ? "bg-amber-100/50 hover:bg-amber-100/70"
                                        : order.status === "cancelled"
                                        ? "bg-red-100/45 hover:bg-red-100/65"
                                        : idx % 2 === 0
                                        ? "bg-white hover:bg-gray-50/50"
                                        : "bg-[#f4f7fa] hover:bg-[#ebf0f5]"
                                    }`}
                                  >
                              <td className="p-4 w-10">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                  checked={selectedOrderIds.includes(order.id)}
                                  onChange={(e) => handleSelectOrder(e, order.id)}
                                />
                              </td>
                              <td className="p-4 max-w-[280px] w-[280px]">
                                  <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-100 bg-white">
                                    <img loading="lazy"
                                      src={order.items[0]?.variantImage || order.items[0]?.product?.image}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  </div>
                                  <div className="flex flex-col justify-center min-w-0">
                                      <div className="flex items-center gap-2 group cursor-pointer" onClick={(e) => { e.stopPropagation(); handleQuickEditOrderItems(order); }}>
                                        <span className="text-[12px] font-bold text-secondary truncate">
                                          {order.items.map((i:any) => `${i.product?.name || 'Unknown'} x${i.quantity}`).join(', ')}
                                        </span>
                                        <button 
                                          className="text-secondary hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Edit Order Items"
                                        >
                                          <Edit3 size={12} />
                                        </button>
                                      </div>
                                      <span className="text-[11px] font-bold text-gray-400 mt-1">#{String(order.displayId || order.id).slice(-6).toUpperCase()}</span>
                                    <span className="text-[11px] font-bold text-gray-500 mt-0.5">{order.date}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-left">
                                <div className="flex flex-col items-start">
                                  <span className="text-xl font-bold text-red-600">৳{order.total}</span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 border whitespace-nowrap ${order.deliveryArea === 'inside' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                    {order.deliveryArea === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 max-w-[200px]">
                                  <div className="flex flex-col relative group">
                                    {quickEditOrderId === order.id ? (
                                    <div className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                      <input 
                                        type="text" 
                                        value={quickEditData.customerName}
                                        onChange={(e) => setQuickEditData({...quickEditData, customerName: e.target.value})}
                                        className="text-[13px] font-bold px-2 py-1 rounded border outline-none focus:border-primary"
                                      />
                                      <input 
                                        type="text" 
                                        value={quickEditData.customerPhone}
                                        onChange={(e) => setQuickEditData({...quickEditData, customerPhone: e.target.value})}
                                        className="text-[11px] font-bold px-2 py-1 rounded border outline-none focus:border-primary"
                                      />
                                      <textarea 
                                        value={quickEditData.address}
                                        onChange={(e) => setQuickEditData({...quickEditData, address: e.target.value})}
                                        className="text-[11px] font-bold px-2 py-1 rounded border outline-none focus:border-primary h-12 resize-none"
                                      />
                                      <div className="flex items-center justify-end gap-1 mt-1">
                                        <button onClick={() => setQuickEditOrderId(null)} className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded shadow-sm border"><X size={12}/></button>
                                        <button onClick={handleSaveQuickEdit} className="p-1 text-green-600 hover:text-green-700 bg-green-50 rounded shadow-sm border border-green-200"><Check size={12}/></button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 flex-nowrap max-w-[350px]">
                                        <span className="text-[14px] font-bold text-slate-800 truncate shrink" title={order.customerName}>
                                          {order.customerName}
                                        </span>
                                        {(() => {
                                          const custStats = getCustomerStats(order.customerPhone);
                                          if (custStats.cancelled > custStats.delivered && custStats.cancelled >= 1) {
                                            return <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-rose-200 animate-pulse shrink-0" title="High Cancel Rate">RISK</span>;
                                          }
                                          if (custStats.delivered > custStats.cancelled && custStats.delivered >= 1) {
                                            return <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0" title="Good Customer">GOOD</span>;
                                          }
                                          if (custStats.delivered === 0 && custStats.cancelled === 0) {
                                            return <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-blue-200 animate-pulse shrink-0" title="New Customer">VERIFY</span>;
                                          }
                                          return null;
                                        })()}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[12px] font-bold text-slate-500">{order.customerPhone}</span>
                                      </div>
                                    </>
                                  )}
                                  {courierReports[order.customerPhone] && (() => {
                                    const report = courierReports[order.customerPhone];
                                    const successRate = report.total_parcel > 0 ? Math.round((report.total_delivered / report.total_parcel) * 100) : 0;
                                    const isRisky = report.total_cancelled > 0 && successRate < 60;
                                    const isFraud = report.total_fraud_report > 0;
                                    return (
                                      <div 
                                        onClick={() => {
                                          setCourierModalPhone(order.customerPhone);
                                          setIsCourierHistoryModalOpen(true);
                                        }}
                                        className={`text-[10px] font-bold mt-1.5 p-2 rounded-xl border flex flex-col gap-1 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                                          isFraud 
                                            ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/50" 
                                            : isRisky 
                                            ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/50" 
                                            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50"
                                        }`}
                                        title="Action"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="opacity-80">Courier (Steadfast):</span>
                                          <div className="flex items-center gap-1">
                                            {isFraud && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">FRAUD</span>}
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                checkCourierReport(order.customerPhone);
                                              }} 
                                              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-black/5 rounded"
                                              title="Action"
                                            >
                                              <RefreshCcw size={10} />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] font-bold">
                                          <div>Total: <span className="text-secondary">{report.total_parcel}</span></div>
                                          <div>Success: <span className="text-green-600">{report.total_delivered}</span></div>
                                          <div>Cancelled: <span className="text-red-500">{report.total_cancelled}</span></div>
                                          <div>Rate: <span className={successRate < 60 ? "text-red-500" : "text-green-600"}>{successRate}%</span></div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <div className="flex items-start gap-1 mt-0.5">
                                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1" title={order.address}>
                                      {order.address && order.address.trim() !== "" && order.address !== "N/A" ? order.address.split(' - (')[0] : 'No address'}
                                    </span>
                                  </div>
{order.steadfastStatus && (
<span className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full w-fit ${order.steadfastStatus.toLowerCase().includes("delivered") ? "bg-green-100 text-green-700" : order.steadfastStatus.toLowerCase().includes("cancelled") || order.steadfastStatus.toLowerCase().includes("returned") ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}>
<Truck size={10} className="inline mr-1 mb-0.5" />
{order.steadfastStatus}
</span>
)}
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex flex-col gap-1.5 items-center justify-center">
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] transition-colors cursor-pointer ${
                                      order.status === 'pending'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-300'
                                        : order.status === 'confirmed'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-300'
                                        : order.status === 'shipped'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-300'
                                        : order.status === 'delivered'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-300'
                                        : order.status === 'returned'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-300'
                                        : order.status === 'cancelled'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-300'
                                        : 'bg-white border-gray-200 text-secondary focus:ring-primary'
                                    }`}
                                  >
                                    <option value="pending" className="bg-white text-gray-800 font-semibold">Pending</option>
                                    <option value="confirmed" className="bg-white text-gray-800 font-semibold">Confirmed</option>
                                    <option value="shipped" className="bg-white text-gray-800 font-semibold">Shipped</option>
                                    <option value="delivered" className="bg-white text-gray-800 font-semibold">Delivered</option>
                                    <option value="returned" className="bg-white text-gray-800 font-semibold">Returned</option>
                                    <option value="cancelled" className="bg-white text-gray-800 font-semibold">Cancelled</option>
                                  </select>
                                  <select
                                    value={order.paymentMethod || "CASH"}
                                    onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                                    className={`text-[11px] font-bold border rounded-lg px-3 h-8 outline-none focus:ring-2 shadow-sm w-[100px] uppercase transition-colors cursor-pointer ${
                                      (order.paymentMethod || "CASH").toUpperCase() === "CASH" || (order.paymentMethod || "CASH").toUpperCase() === "COD"
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 focus:ring-emerald-300"
                                        : (order.paymentMethod || "CASH").toUpperCase() === "BKASH"
                                        ? "bg-pink-100 text-pink-700 border-pink-200 focus:ring-pink-300"
                                        : (order.paymentMethod || "CASH").toUpperCase() === "NAGAD"
                                        ? "bg-orange-100 text-orange-700 border-orange-200 focus:ring-orange-300"
                                        : (order.paymentMethod || "CASH").toUpperCase() === "DUE"
                                        ? "bg-rose-100 text-rose-700 border-rose-200 focus:ring-rose-300"
                                        : "bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-300"
                                    }`}
                                  >
                                    <option value="CASH" className="bg-white text-gray-800 font-bold">CASH</option>
                                    <option value="BKASH" className="bg-white text-gray-800 font-bold">BKASH</option>
                                    <option value="NAGAD" className="bg-white text-gray-800 font-bold">NAGAD</option>
                                    <option value="DUE" className="bg-white text-gray-800 font-bold">DUE</option>
                                    <option value="BANK" className="bg-white text-gray-800 font-bold">BANK</option>
                                    <option value="ONLINE" className="bg-white text-gray-800 font-bold">ONLINE</option>
                                    <option value="N/A" className="bg-white text-gray-800 font-bold">N/A</option>
                                  </select>
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                {(() => {
                                  const stats = getCustomerStats(order.customerPhone);
                                  return (
                                    <div className="flex flex-col gap-2 w-fit shrink-0 justify-center mx-auto h-[68px]">
                                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100/70 rounded-full px-3 py-1 w-[90px] shadow-sm transition-transform hover:scale-105">
                                        <span className="text-[10px] font-bold text-emerald-700">Success:</span>
                                        <span className="text-[11px] font-bold text-emerald-600">{stats.delivered}</span>
                                      </div>
                                      <div className="flex items-center justify-between bg-rose-50 border border-rose-100/70 rounded-full px-3 py-1 w-[90px] shadow-sm transition-transform hover:scale-105">
                                        <span className="text-[10px] font-bold text-rose-700">Cancel:</span>
                                        <span className={`text-[11px] font-bold ${stats.cancelled > 0 ? 'text-rose-600' : 'text-rose-400'}`}>{stats.cancelled}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center justify-end gap-3 ml-auto">
                                  {(() => {
                                    return (
                                      <>
                                      <div className="flex flex-col gap-1.5 w-fit shrink-0">
                                        <div className="relative w-full">
                                          <button onClick={(e) => {
                                              e.stopPropagation();
                                              setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                              const orderId = String(order.orderId || order.id).slice(-6).toUpperCase();
                                              let startPart = (siteConfig?.smsTemplateStart || '').trim() || 'Dear customer, your order is confirmed.';
                                              const endPart = (siteConfig?.smsTemplateEnd || '').trim() || 'Thank you for using iShop BD.';
                                              if (startPart.includes('') && order.customerName) {
                                                startPart = startPart.replace('', order.customerName);
                                              }
                                              let productDetails = '';
                                              if (order.items && order.items.length > 0) {
                                                productDetails = order.items.map((item: any) => {
                                                  const name = item.product?.smsName || item.product?.name || 'Product';
                                                  const qty = item.quantity || 1;
                                                  return `${name} (${qty} টি)`;
                                                }).join('\n');
                                              }
                                              const defaultMessage = `${startPart}\nProducts:\n${productDetails}\nঅর্ডার নং: #${orderId}\nমোট বিল: ৳${order.total}\n${endPart}`;
                                              setIndividualSmsMessage(defaultMessage);
                                            }} 
                                            className="flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-sky-600 transition-colors" title="Send SMS">
                                            <MessageSquare size={12} />
                                            <span className="text-[11px] font-bold">SMS</span>
                                          </button>
                                          
                                          <AnimatePresence>
                                            {individualSmsOrder?.id === order.id && (
                                              <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                className="absolute top-[120%] right-0 bg-white rounded-2xl w-72 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 z-[200] origin-top-right cursor-default text-left"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                                <div className="relative p-4 bg-white rounded-2xl z-10">
                                                  <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] text-gray-500">Recipient: <span className="font-bold text-gray-800">{order.customerPhone || order.phone}</span></p>
                                                    <button onClick={() => setIndividualSmsOrder(null)} className="text-gray-400 hover:text-red-500">
                                                      <X size={14} />
                                                    </button>
                                                  </div>
                                                  <textarea
                                                    value={individualSmsMessage}
                                                    onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                                    placeholder="Write your message..."
                                                    className="w-full h-24 p-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-3"
                                                  ></textarea>
                                                  <div className="flex justify-center">
                                                    <button
                                                      onClick={handleSendIndividualSms}
                                                      disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                                      className="bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 disabled:opacity-50 transition-all active:scale-95 w-full shadow-sm shadow-green-500/20"
                                                    >
                                                      {isSendingIndividualSms ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                                      {isSendingIndividualSms ? "Sending..." : "Send Now"}
                                                    </button>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                        {loadingCourierReports[order.customerPhone] ? (
                                          <div className="flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200/70 rounded-lg px-3 h-8 w-[100px] shadow-sm text-gray-500">
                                            <Loader2 size={12} className="animate-spin" />
                                            <span className="text-[11px] font-bold">Checking...</span>
                                          </div>
                                        ) : courierReports[order.customerPhone] ? (
                                          <button
                                            onClick={() => {
                                              setCourierModalPhone(order.customerPhone);
                                              setIsCourierHistoryModalOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-purple-600 transition-colors active:scale-95 cursor-pointer"
                                            title="View Courier History"
                                          >
                                            <Eye size={12} />
                                            <span className="text-[11px] font-bold">History</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setCourierModalPhone(order.customerPhone);
                                              setIsCourierHistoryModalOpen(true);
                                              checkCourierReport(order.customerPhone);
                                            }}
                                            className="flex items-center justify-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200/60 rounded-full px-3 h-8 w-[100px] shadow-sm text-orange-600 transition-colors active:scale-95 cursor-pointer"
                                            title="Verify Customer"
                                          >
                                            <UserCheck size={12} />
                                            <span className="text-[11px] font-bold">Verify</span>
                                          </button>
                                        )}
                                      </div>
                                      </>
                                    );
                                  })()}
                                  <div className="relative group w-fit shrink-0">
                                    <button
                                      className="text-gray-400 hover:text-gray-700 w-8 h-[68px] rounded-lg flex items-center justify-center transition-all shrink-0"
                                      title="More Actions"
                                    >
                                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                    </button>
                                    <div className="absolute top-1/2 right-full -translate-y-1/2 mr-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-100 shadow-xl z-50">
                                      <button
                                          onClick={() => setCompletedOrderReceipt(order)}
                                          className="hidden md:flex bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-600 w-8 h-8 rounded-lg items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                          title="View Receipt"
                                        >
                                          <Receipt size={14} />
                                        </button>
                                      <button
                                        onClick={() => sendToCourier(order)}
                                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                        title="Send to Courier"
                                      >
                                        <Truck size={14} />
                                      </button>
                                      <button
                                        onClick={() => handlePrintInvoice(order)}
                                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                        title="Print Invoice"
                                      >
                                        <Printer size={14} />
                                      </button>
                                        {order.customerPhone && (
                                          <a 
                                            href={`https://wa.me/880${order.customerPhone.startsWith('0') ? order.customerPhone.substring(1) : order.customerPhone}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                            title="Chat on WhatsApp"
                                          >
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                            </svg>
                                          </a>
                                        )}
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleBlacklist(order.customerPhone);
                                        }}
                                        className={`w-8 h-8 rounded-lg transition-all border shadow-sm flex items-center justify-center active:scale-90 shrink-0 ${
                                          blacklist.includes(order.customerPhone)
                                            ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                            : "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                        }`}
                                        title={blacklist.includes(order.customerPhone) ? "Unblock Number" : "Block Number"}
                                      >
                                        {blacklist.includes(order.customerPhone) ? (
                                          <ShieldCheck size={14} />
                                        ) : (
                                          <Ban size={14} />
                                        )}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          deleteOrder(order.id);
                                        }}
                                        className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-90 shrink-0"
                                        title="Delete Order"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                              </div>
                            </td>
                          </tr>
                                 </React.Fragment>
                               );
                             });
                           })()}
                         </tbody>
                      </table>
                    </div>
                    {filteredOrders.length > adminOrdersLimit && (
                      <div className="flex justify-center mt-6 mb-10">
                        <button
                          onClick={() => setAdminOrdersLimit(prev => prev + 50)}
                          className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                          <Plus size={18} /> Load More ({filteredOrders.length - adminOrdersLimit} remaining)
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {adminTab === "incomplete_orders" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
<h2 className="text-xl font-bold text-gray-800">Incomplete Orders</h2>
                      <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-bold">Total:</span>
                        <span className="text-lg font-bold text-primary">{incompleteOrders.length}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {incompleteOrders.length === 0 ? (
                        <div className="p-12 text-center">
                          <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
<h3 className="text-lg font-bold text-gray-400">No incomplete orders</h3>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Products</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Step</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {incompleteOrders.map((order: any) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="p-4">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-gray-800">{order.name || "N/A"}</span>
                                      <span className="text-sm text-gray-500">{order.phone}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                      {order.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2">
                                          {item.image && <img loading="lazy" src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />}
                                          <span className="text-xs font-bold text-gray-700">{item.name} <span className="text-primary">(x{item.quantity})</span></span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${order.type === 'cart_checkout' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                      {order.type === 'cart_checkout' ? 'Cart Order' : 'Direct Order'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className="font-bold text-primary">{order.totalAmount}</span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                      <div className="relative">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                            setIndividualSmsMessage("");
                                          }}
                                          className={`inline-flex items-center justify-center gap-2 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${individualSmsOrder?.id === order.id ? 'bg-primary shadow-primary/20' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'}`}
                                        >
                                          <MessageSquare size={14} /> SMS
                                        </button>
                                        
                                        <AnimatePresence>
                                          {individualSmsOrder?.id === order.id && (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                              animate={{ opacity: 1, scale: 1, y: 0 }}
                                              exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                              className="absolute top-[130%] right-0 bg-white rounded-2xl w-72 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 z-[200] origin-top-right cursor-default text-left"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                                              <div className="relative p-4 bg-white rounded-2xl z-10">
                                                <div className="flex justify-between items-center mb-2">
                                                  <p className="text-[10px] text-gray-500">Recipient: <span className="font-bold text-gray-800">{order.customerPhone || order.phone}</span></p>
                                                  <button onClick={() => setIndividualSmsOrder(null)} className="text-gray-400 hover:text-red-500">
                                                    <X size={14} />
                                                  </button>
                                                </div>
                                                <textarea
                                                  value={individualSmsMessage}
                                                  onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                                  placeholder="Write your comment..."
                                                  className="w-full h-24 p-2 border rounded-xl text-xs focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-3"
                                                ></textarea>
                                                <div className="flex justify-center">
                                                  <button
                                                    onClick={handleSendIndividualSms}
                                                    disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                                    className="bg-green-500 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-green-600 disabled:opacity-50 transition-all active:scale-95 w-full shadow-sm shadow-green-500/20"
                                                  >
                                                    {isSendingIndividualSms ? (
                                                      "Sending..."
                                                    ) : (
                                                      <>
                                                        <MessageSquare size={14} /> SMS পাঠান
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                      <a 
                                        href={`tel:${order.customerPhone || order.phone}`}
                                        className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20"
                                      >
                                        <Phone size={14} />  
                                      </a>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {adminTab === "products" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add/Edit Form */}
                    <div className="lg:col-span-5">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-0">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
                            <PlusCircle size={20} className="text-primary" />
                            {editingProduct?.id
                              ? "Products এডিট করুন"
                              : "নতুন Products Add"}
                          </h4>
                          {editingProduct && (
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              বাতিল করুন
                            </button>
                          )}
                        </div>
                        <form onSubmit={saveProduct} className="space-y-4">
                          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 mb-6"><h5 className="text-sm font-bold text-secondary border-b border-gray-100 pb-3 mb-4 flex items-center gap-2"><Tag size={16} className="text-primary" /> Basic Information</h5>
                          <div id="field-name">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                              প্রোডাক্ট নাম
                              {productFormErrors.name && (
                                <span className="text-red-500 normal-case">
                                  নাম দিতে হবে
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.name || ""}
                              onChange={(e) => {
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  name: e.target.value,
                                } as any);
                                if (productFormErrors.name)
                                  setProductFormErrors((prev) => ({
                                    ...prev,
                                    name: false,
                                  }));
                              }}
                              className={`w-full bg-gray-50 border ${productFormErrors.name ? "border-red-500 ring-1 ring-red-500" : "border-gray-100"} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold`}
                              placeholder="e.g. Smart Watch সিরিজ ৯"
                            />
                          </div>
                                                    <div id="field-sms-name">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                              এসএমএস প্রোডাক্ট নাম (ঐচ্ছিক)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.smsName || ""}
                              onChange={(e) => {
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  smsName: e.target.value,
                                } as any);
                              }}
                              className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              placeholder="e.g. SW-9"
                            />
                          </div>
                          <div id="field-code">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                              প্রোডাক্ট কোড (Search Code)
                              {productFormErrors.code && (
                                <span className="text-red-500 normal-case">
                                  নাম দিতে হবে
                                </span>
                              )}
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.code || ""}
                              onChange={(e) => {
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  code: e.target.value,
                                } as any);
                                if (productFormErrors.code)
                                  setProductFormErrors((prev) => ({
                                    ...prev,
                                    code: false,
                                  }));
                              }}
                              className={`w-full bg-gray-50 border ${productFormErrors.code ? "border-red-500 ring-1 ring-red-500" : "border-gray-100"} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold`}
                              placeholder="e.g. SW-001"
                            />
                          </div>
                          </div>
                          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 mb-6"><h5 className="text-sm font-bold text-secondary border-b border-gray-100 pb-3 mb-4 flex items-center gap-2"><Wallet size={16} className="text-primary" /> Pricing & Stock</h5>
                          <div className={`grid gap-4 ${isMasterAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
                            {isMasterAdmin && (
                              <div>
                                <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1.5">
                                  ক্রয়মূল্য (৳) - গোপন
                                </label>
                                <input
                                  type="number"
                                  value={editingProduct?.buyingPrice || ""}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingProduct((prev) => ({ ... (prev || {}), buyingPrice: val }));
                                  }}
                                  className="w-full bg-indigo-50 border border-indigo-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-bold text-indigo-900 placeholder-indigo-300 transition-all"
                                  placeholder="0"
                                />
                              </div>
                            )}
                            <div id="field-price">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                মূল্য (৳) *
                                {productFormErrors.price && (
                                  <span className="text-red-500 normal-case font-bold">
                                    দাম দিন
                                  </span>
                                )}
                              </label>
                              <input
                                type="number"
                                value={editingProduct?.price || ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEditingProduct((prev) => ({ ...(prev || {}), price: val }));
                                  if (productFormErrors.price)
                                    setProductFormErrors((prev) => ({
                                      ...prev,
                                      price: false,
                                    }));
                                }}
                                className={`w-full bg-gray-50/50 border ${productFormErrors.price ? "border-red-500 ring-2 ring-red-500/20" : "border-gray-200"} rounded-xl py-3 px-4 outline-none focus:border-primary focus:bg-white text-sm font-bold transition-all`}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                                আগের মূল্য (৳)
                              </label>
                              <input
                                type="number"
                                value={editingProduct?.originalPrice || ""}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEditingProduct((prev) => ({ ...(prev || {}), originalPrice: val }));
                                }}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary focus:bg-white text-sm font-bold transition-all"
                              />
                            </div>
                          </div>
                          {/* Physical & Stock Details Row */}
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                                ওজন/পরিমাণ
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={editingProduct?.weight || ""}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                                  setEditingProduct((prev) => ({ ...(prev || {}), weight: val }));
                                }}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary focus:bg-white text-sm font-bold transition-all"
                                placeholder="e.g. 1"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                                একক (Unit)
                              </label>
                              <select
                                value={editingProduct?.unit || "piece"}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingProduct((prev) => ({ ...(prev || {}), unit: val }));
                                }}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-primary focus:bg-white text-sm font-bold transition-all cursor-pointer"
                              >
                                <option value="piece">Piece</option>
                                <option value="kg">KG</option>
                                <option value="gm">Gram</option>
                                <option value="liter">Liter</option>
                                <option value="ml">ML</option>
                                <option value="packet">Packet</option>
                                <option value="box">Box</option>
                                <option value="set">Set</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                                Stock (Quantity)
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={
                                    editingProduct?.stock === undefined ||
                                    editingProduct?.stock === null
                                      ? ""
                                      : editingProduct.stock
                                  }
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    setEditingProduct((prev) => ({ ...(prev || {}), stock: val }));
                                  }}
                                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 px-4 pr-12 outline-none focus:border-primary focus:bg-white text-sm font-bold transition-all"
                                  placeholder="০"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-500 uppercase pointer-events-none">
                                  {(() => {
                                    switch (editingProduct?.unit) {
                                      case "piece": return "Pcs";
                                      case "kg": return "Kg";
                                      case "gm": return "Gm";
                                      case "liter": return "Ltr";
                                      case "ml": return "Ml";
                                      case "packet": return "Pkt";
                                      case "box": return "Box";
                                      case "set": return "Set";
                                      default: return editingProduct?.unit || "Pcs";
                                    }
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          </div>
                          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 mb-6"><h5 className="text-sm font-bold text-secondary border-b border-gray-100 pb-3 mb-4 flex items-center gap-2"><ImageIcon size={16} className="text-primary" /> Media & SEO</h5>
                          <div id="field-tags">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                              ট্যাগ (Google Search এবং ওয়েবসাইটের সার্চের জন্য)
                            </label>
                            <div className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl p-2 min-h-[52px] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                              {(editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag, idx) => (
                                <span key={idx} className="flex items-center gap-1.5 bg-[#272727] text-gray-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#3f3f3f] shadow-sm">
                                  {tag}
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const tagsArray = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                                      const newTags = tagsArray.filter((_, i) => i !== idx);
                                      setEditingProduct((prev: any) => ({ ...(prev || {}), tags: newTags.join(', ') }));
                                    }} 
                                    className="hover:text-white transition-colors"
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                              <input
                                type="text"
                                className="flex-1 bg-transparent outline-none text-sm min-w-[150px] px-2 py-1 font-bold text-gray-700"
                                placeholder={(!editingProduct?.tags || editingProduct.tags.trim() === '') ? "e.g. smartwatch, apple watch (Comma or Enter to add)" : "Add more tags..."}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault();
                                    const val = e.currentTarget.value;
                                    if (val.trim()) {
                                      const tagsArray = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                                      const newTags = val.split(',').map(t => t.trim()).filter(Boolean);
                                      const combined = Array.from(new Set([...tagsArray, ...newTags])).join(', ');
                                      setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                                      e.currentTarget.value = '';
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  const val = e.currentTarget.value;
                                  if (val.trim()) {
                                    const tagsArray = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                                    const newTags = val.split(',').map(t => t.trim()).filter(Boolean);
                                    const combined = Array.from(new Set([...tagsArray, ...newTags])).join(', ');
                                    setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                                    e.currentTarget.value = '';
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  const paste = e.clipboardData.getData('text');
                                  if (paste.trim()) {
                                    const tagsArray = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                                    const newTags = paste.split(',').map(t => t.trim()).filter(Boolean);
                                    const combined = Array.from(new Set([...tagsArray, ...newTags])).join(', ');
                                    setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined }));
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div id="field-image">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                              প্রধান ছবি (Link vs Upload)
                              {productFormErrors.image && (
                                <span className="text-red-500 normal-case">
                                  নাম দিতে হবে
                                </span>
                              )}
                            </label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editingProduct?.image || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingProduct((prev) => ({ ...(prev || {}), image: val }));
                                  if (productFormErrors.image)
                                    setProductFormErrors((prev) => ({
                                      ...prev,
                                      image: false,
                                    }));
                                }}
                                className={`w-full bg-gray-50 border ${productFormErrors.image ? "border-red-500 ring-1 ring-red-500" : "border-gray-100"} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs`}
                                placeholder="Image Link (https://...)"
                              />
                              <div className="relative">
                                <input
                                  key={editingProduct?.image || "empty"}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    handleAdminImageUpload(e);
                                    if (productFormErrors.image)
                                      setProductFormErrors((prev) => ({
                                        ...prev,
                                        image: false,
                                      }));
                                  }}
                                  className="hidden"
                                  id="adminImageUpload"
                                />
                                <label
                                  htmlFor="adminImageUpload"
                                  className="w-full bg-gray-100 text-secondary font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 hover:bg-gray-200 transition-all"
                                >
                                  <Upload size={16} /> প্রধান ছবি আপলোড করুন
                                </label>
                              </div>
                              {editingProduct?.image && (
                                <div className="relative w-24 h-24 group mt-2">
                                  <img loading="lazy"
                                    src={editingProduct.image}
                                    className="w-24 h-24 rounded-xl object-cover border border-gray-200"
                                    alt="Preview"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingProduct((prev) => ({ ...(prev || {}), image: "" }))
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                              অতিরিক্ত গ্যালারি ছবি
                            </label>
                            <div className="space-y-3">
                              <div className="grid grid-cols-4 gap-2">
                                {editingProduct?.images?.map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="relative group aspect-square"
                                  >
                                    <img loading="lazy"
                                      src={img}
                                      className="w-full h-full object-cover rounded-lg border border-gray-100"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(idx)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                    >
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                                <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                                  <PlusCircle
                                    size={20}
                                    className="text-gray-400"
                                  />
                                  <span className="text-[8px] font-bold text-gray-400 mt-1">
                                     Add
                                  </span>
                                  <input
                                    key={editingProduct?.images?.length || 0}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAdminMultiImageUpload}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                          </div>
                          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 mb-6"><h5 className="text-sm font-bold text-secondary border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">🎨 Variants & Sizes</h5>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-3 text-center bg-gray-100 py-1 rounded-full">
                              Productsের ভেরিয়েন্ট (Size & Stock Management)
                            </label>
                            <div className="space-y-4">
                                  <div className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100">
                                    <h5 className="text-sm font-bold text-blue-600 uppercase mb-2">▶ Stock Rules:</h5>
                                    <p className="text-xs font-medium text-blue-500 mb-1.5">â€¢ যদি সাইজ বা করুন? না থাকে, তাহলে Size এ 'Free' Write here.</p>
                                    <p className="text-xs font-medium text-blue-500">â€¢ প্রতিটি সাইজ বা কালারের জন্য আলাদাভাবে Stock (Quantity) যুক্ত করুন?</p>
                                  </div>
                                  
                              {editingProduct?.variants?.map((variant, idx) => (
                                <div
                                  key={variant.id || idx}
                                  className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col gap-4 relative group hover:shadow-md transition-shadow"
                                >
                                  <div className="flex gap-4 items-start w-full">
                                    <div className="w-16 h-16 flex-shrink-0 relative">
                                      {variant.image ? (
                                        <img loading="lazy"
                                          src={variant.image}
                                          className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                                          alt="Variant"
                                        />
                                      ) : (
                                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300">
                                          <ImageIcon size={20} />
                                        </div>
                                      )}
                                      <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 rounded-xl transition-all">
                                        <Upload size={14} className="text-white" />
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => handleVariantImageUpload(e, idx)}
                                        />
                                      </label>
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase">Color (Optional)</label>
                                        <input
                                          type="text"
                                          value={variant.name}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingProduct((prev: any) => {
                                              const newVariants = [...(prev?.variants || [])];
                                              if (newVariants[idx]) newVariants[idx] = { ...newVariants[idx], name: val };
                                              return { ...prev, variants: newVariants };
                                            });
                                          }}
                                          placeholder="e.g. Red"
                                          className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-lg py-2 px-3 text-xs font-bold outline-none focus:ring-1 focus:ring-primary"
                                        />
                                      </div>
                                      
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-primary uppercase"> (Size)</label>
                                        <input
                                          type="text"
                                          value={variant.size || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditingProduct((prev: any) => {
                                              const newVariants = [...(prev?.variants || [])];
                                              if (newVariants[idx]) newVariants[idx] = { ...newVariants[idx], size: val };
                                              return { ...prev, variants: newVariants };
                                            });
                                          }}
                                          placeholder="e.g. XL"
                                          className="w-full bg-red-50 border border-primary/20 rounded-lg py-2 px-3 text-xs font-bold text-primary outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                      </div>
                                      <div className="space-y-1 col-span-2 md:col-span-1">
                                        <label className="text-[9px] font-bold text-emerald-600 uppercase">Stock (Quantity)</label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={variant.stock === undefined || variant.stock === null ? "" : variant.stock}
                                            onChange={(e) => {
                                              const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                              setEditingProduct((prev: any) => {
                                                if (!prev) return prev;
                                                const newVariants = [...(prev.variants || [])];
                                                if (newVariants[idx]) newVariants[idx] = { ...newVariants[idx], stock: val };
                                                return { ...prev, variants: newVariants };
                                              });
                                            }}
                                            placeholder="০"
                                            className="w-full bg-emerald-50 border border-emerald-100 rounded-lg py-2 px-3 text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500/30"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                    <div className="flex gap-1">
                                      {["S", "M", "L", "XL", "XXL"].map(s => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => {
                                            setEditingProduct((prev: any) => {
                                              const newVariants = [...(prev?.variants || [])];
                                              if (newVariants[idx]) newVariants[idx] = { ...newVariants[idx], size: s };
                                              return { ...prev, variants: newVariants };
                                            });
                                          }}
                                          className={`text-[8px] px-2 py-1 rounded border font-bold ${variant.size === s ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'} transition-all`}
                                        >
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={variant.showExactStock !== false}
                                        onChange={(e) => {
                                          const val = e.target.checked;
                                          setEditingProduct((prev: any) => {
                                            if (!prev) return prev;
                                            const newVariants = [...(prev.variants || [])];
                                            if (newVariants[idx]) newVariants[idx] = { ...newVariants[idx], showExactStock: val };
                                            return { ...prev, variants: newVariants };
                                          });
                                        }}
                                        id={`showStock-${idx}`}
                                      />
                                      <label htmlFor={`showStock-${idx}`} className="text-[10px] font-bold text-gray-500">Show Stock Count</label>
                                    </div>
                                  </div>
                                  <div className="absolute -top-2 -right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingProduct((prev: any) => {
                                          if (!prev) return prev;
                                          const newVariants = [...(prev.variants || [])];
                                          const toClone = newVariants[idx];
                                          if (toClone) {
                                            newVariants.push({
                                              ...toClone,
                                              id: Math.random().toString(36).substring(2, 9),
                                            });
                                          }
                                          return { ...prev, variants: newVariants };
                                        });
                                      }}
                                      className="p-1.5 bg-blue-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                                      title="Action"
                                    >
                                      <Copy size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeVariant(idx)}
                                      className="p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={addVariant}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-primary/20 hover:text-primary transition-all group"
                              >
                                <Plus size={18} className="group-hover:scale-125 transition-transform" /> নতুন সাইজ বা কালার Add
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                              ইউটিউব ভিডিও (Link)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.videoUrl || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), videoUrl: val }));
                              }}
                              className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs"
                              placeholder="https://youtube.com/watch?v=..."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                              Products বিস্তারিত তথ্য (Description)
                            </label>
                            <textarea
                              value={editingProduct?.description || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), description: val }));
                              }}
                              rows={3}
                              className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-medium no-scrollbar"
                              placeholder="Products সম্পর্কে বিস্তারিত লিখুন..."
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                              ব্র্যান্ড (Brand)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.brand || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), brand: val }));
                              }}
                              className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                              placeholder="e.g. Samsung, Apple, No Brand"
                            />
                          </div>
                          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-6">
                            <label className="block text-xs font-bold text-amber-600 uppercase mb-4 flex items-center gap-2">
                              <Tag size={16} /> হোলসেল রিট (Wholesale Pricing Tiers)
                            </label>
                            
                            <div className="space-y-3">
                              {editingProduct?.wholesaleTiers?.map((tier, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-amber-100 shadow-sm">
                                  <div className="flex-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Minimum Qty</label>
                                    <input 
                                      type="number"
                                      value={tier.minQty}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const newTiers = [...(editingProduct?.wholesaleTiers || [])];
                                        newTiers[idx].minQty = val;
                                        setEditingProduct(prev => ({ ...(prev || {}), wholesaleTiers: newTiers }));
                                      }}
                                      className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-lg py-2 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                                      placeholder="e.g. 10"
                                    />
                                  </div>
                                  <div className="flex-1">
<label className="text-[9px] font-bold text-gray-400 uppercase">Price (Per Pc)</label>
                                    <input 
                                      type="number"
                                      value={tier.price}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const newTiers = [...(editingProduct?.wholesaleTiers || [])];
                                        newTiers[idx].price = val;
                                        setEditingProduct(prev => ({ ...(prev || {}), wholesaleTiers: newTiers }));
                                      }}
                                      className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-lg py-2 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                                      placeholder="e.g. 150"
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newTiers = editingProduct?.wholesaleTiers?.filter((_, i) => i !== idx);
                                      setEditingProduct(prev => ({ ...(prev || {}), wholesaleTiers: newTiers }));
                                    }}
                                    className="mt-4 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const newTiers = [...(editingProduct?.wholesaleTiers || []), { minQty: 10, price: Number(editingProduct?.price || 0) }];
                                  setEditingProduct(prev => ({ ...(prev || {}), wholesaleTiers: newTiers }));
                                }}
                                className="w-full py-3 border-2 border-dashed border-amber-200 rounded-2xl text-amber-600 text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all"
                              >
                                <Plus size={16} /> নতুন হোলসেল রেট Add
                              </button>
                              
                              <p className="text-[10px] text-amber-500 font-bold mt-2 text-center">
                                * যেমন: ১০ পিস নিলে ১৫০ টাকা, ২০ পিস নিলে ১৪০ টাকা ইত্যাদি।
                              </p>
                            </div>
                          </div>
                          <div id="field-category">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
              Categories
                              {productFormErrors.category && (
                                <span className="text-red-500 normal-case">
              নাম দিতে হবে
                                </span>
                              )}
                            </label>
                            <select
                              value={editingProduct?.category || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ 
                                  ...(prev || {}), 
                                  category: val,
                                  subcategory: ""
                                }));
                                if (productFormErrors.category)
                                  setProductFormErrors((prev) => ({
                                    ...prev,
                                    category: false,
                                  }));
                              }}
                              className={`w-full bg-gray-50 border ${productFormErrors.category ? "border-red-500 ring-1 ring-red-500" : "border-gray-100"} rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold`}
                            >
                              <option value="">Select</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Subcategory Select dropdown */}
                          {(() => {
                            const selCatObj = categories.find(c => c.name === editingProduct?.category);
                            const subcats = selCatObj?.subcategories || [];
                            if (subcats.length === 0) return null;
                            return (
                              <div id="field-subcategory" className="mt-3">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                                  Subcategories
                                </label>
                                <select
                                  value={editingProduct?.subcategory || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditingProduct((prev) => ({ ...(prev || {}), subcategory: val }));
                                  }}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                >
                                  <option value="">Select Subcategory</option>
                                  {subcats.map((sub, idx) => (
                                    <option key={idx} value={sub}>
                                      {sub}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              id="isTrendingCheck"
                              checked={editingProduct?.isTrending || false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  isTrending: e.target.checked,
                                } as any)
                              }
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label
                              htmlFor="isTrendingCheck"
                              className="text-xs font-bold text-gray-600"
                            >
              ট্রেন্ডিং সেকশনে দেখান
                            </label>
                          </div>
                          
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              id="isFlashSaleCheck"
                              checked={editingProduct?.isFlashSale || false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  isFlashSale: e.target.checked,
                                } as any)
                              }
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label
                              htmlFor="isFlashSaleCheck"
                              className="text-xs font-bold text-gray-600"
                            >
                              ফ্লাশ সেল প্রোডাক্ট?
                            </label>
                          </div>
                          {editingProduct?.isFlashSale && (
                            <div className="mb-4">
                              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                                ফ্লাশ সেলের শেষ সময়
                              </label>
                              <input
                                type="datetime-local"
                                value={editingProduct.flashSaleEndDate || ""}
                                onChange={(e) =>
                                  setEditingProduct({
                                    ...(editingProduct || {}),
                                    flashSaleEndDate: e.target.value,
                                  } as any)
                                }
                                className="w-full bg-gray-50/50 border border-gray-200 transition-all hover:border-gray-300 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              />
                            </div>
                          )}
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              id="isFreeDeliveryCheck"
                              checked={editingProduct?.isFreeDelivery || false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  isFreeDelivery: e.target.checked,
                                } as any)
                              }
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label
                              htmlFor="isFreeDeliveryCheck"
                              className="text-xs font-bold text-gray-600"
                            >
                              ফ্রি ডেলিভারি
                            </label>
                          </div>
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id="isComingSoonCheck"
                              checked={editingProduct?.isComingSoon || false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  isComingSoon: e.target.checked,
                                } as any)
                              }
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label
                              htmlFor="isComingSoonCheck"
                              className="text-xs font-bold text-gray-600"
                            >
                             শীঘ্রই আসছে (প্রি-অর্ডার)
                            </label>
                          </div>
                          <div className="flex items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              id="isPublishedCheck"
                              checked={editingProduct?.isPublished !== false}
                              onChange={(e) =>
                                setEditingProduct({
                                  ...(editingProduct || {}),
                                  isPublished: e.target.checked,
                                } as any)
                              }
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label
                              htmlFor="isPublishedCheck"
                              className="text-xs font-bold text-gray-600"
                            >
                              পাবলিশড (টিক মার্ক থাকলে ওয়েবসাইটে দেখাবে, না থাকলে হাইড থাকবে)
                            </label>
                          </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-red-700 transition-all active:scale-95"
                            >
                              {editingProduct?.id
                                ? "Products এডিট করুন"
                              : "Products Add"}
                            </button>
                            {editingProduct && (
                              <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="bg-gray-100 text-gray-500 px-6 rounded-2xl hover:bg-gray-200 transition-all"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                    {/* Products Table */}
                    <div className="lg:col-span-7">
                      <div className="bg-white rounded-3xl border border-gray-100 overflow-x-auto no-scrollbar shadow-sm">
                        <table className="w-full text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase font-bold border-b border-gray-100">
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4">Price</th>
                              <th className="px-6 py-4">Stock</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {products.map((p) => (
                              <tr
                                key={p.id}
                                className="hover:bg-gray-50/30 transition-colors"
                              >
                                <td className="px-6 py-4 flex items-center gap-4">
                                  <img loading="lazy"
                                    src={p.image}
                                    className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                                    alt={p.name}
                                  />
                                  <div className="max-w-[140px] sm:max-w-[200px]">
                                    <p className="text-sm font-bold text-secondary line-clamp-1">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-500">
                                      {p.category}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-secondary">
                                    ৳{p.price}
                                  </p>
                                  {p.originalPrice > p.price && (
                                    <p className="text-xs text-gray-400 line-through">
                                      ৳{p.originalPrice}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {p.variants && p.variants.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {p.variants.map((v, i) => (
                                        <span
                                          key={i}
                                          className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${v.stock <= 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                                        >
                                          {v.name}: {v.stock}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span
                                      className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${((p as any).stock || 0) <= 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                                    >
                                      স্টক: {(p as any).stock || 0}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                    <label className="relative inline-flex items-center cursor-pointer mr-2" title={p.isPublished !== false ? "Published (Live)" : "Unpublished (Hidden)"}>
                                      <input
                                        type="checkbox"
                                        checked={p.isPublished !== false}
                                        onChange={() => togglePublishStatus(p)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                    
                                    <div className="relative font-sans" ref={activeProductDropdown === p.id ? productDropdownRef : null}>
                                      <button
                                        onClick={() => setActiveProductDropdown(activeProductDropdown === p.id ? null : p.id)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                                      >
                                        <MoreVertical size={20} />
                                      </button>
                                      
                                      {activeProductDropdown === p.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden text-sm">
                                          <button
                                            onClick={() => { copyLandingPageLink(p.id); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                          >
                                            <Share2 size={16} className="text-gray-400" />
                                            <span>Copy Link</span>
                                          </button>
                                          <button
                                            onClick={() => { handleDuplicateProduct(p); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                          >
                                            <Copy size={16} className="text-gray-400" />
                                            <span>Duplicate</span>
                                          </button>
                                          <button
                                            onClick={() => { openLandingEditor(p); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                          >
                                            <LayoutTemplate size={16} className="text-gray-400" />
                                            <span>Landing Page</span>
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingProduct({
                                                ...p,
                                                variants: p.variants || [],
                                              });
                                              setActiveProductDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                                          >
                                            <Edit3 size={16} className="text-primary" />
                                            <span>Edit Details</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              deleteProduct(p.id);
                                              setActiveProductDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-red-600 border-t border-gray-50"
                                          >
                                            <Trash2 size={16} className="text-red-500" />
                                            <span>Delete Product</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === "categories" && (
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8">
                      <h4 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-primary" />
                        Recent Orders
                      </h4>
                      <form onSubmit={saveCategory} className="flex gap-4 mb-8">
                        <input
                          type="text"
                          required
                          value={editingCategory?.name || ""}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              name: e.target.value,
                            })
                          }
                          className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-primary font-bold"
                          placeholder="e.g. Smart Watch"
                        />
                        <button className="bg-primary text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-red-700 transition-all active:scale-95">
                          {editingCategory?.id ? "Update" : "Add"}
                        </button>
                      </form>
                      <div className="space-y-4">
                        {categories.map((cat) => {
                          const subcats = cat.subcategories || [];
                          return (
                            <div
                              key={cat.id}
                              className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col gap-4"
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-secondary text-base">
                                  {cat.name}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => copyCategoryLink(cat.name)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-1"
                                    title="Action"
                                  >
                                    <Share2 size={12} />  
                                  </button>
                                  <button
                                    onClick={() => setEditingCategory(cat)}
                                    className="text-xs font-bold text-gray-400 hover:text-primary transition-colors px-2 py-1 hover:bg-gray-100 rounded-lg"
                                  >
                                    এডিট
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      await deleteCategory(cat.id, cat.name);
                                    }}
                                    disabled={deletingCatId === String(cat.id)}
                                    className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg ${
                                      deletingCatId === String(cat.id)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "text-red-500 hover:bg-red-50 active:scale-95 border border-transparent hover:border-red-100"
                                    }`}
                                  >
                                    {deletingCatId === String(cat.id) ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Subcategories Management */}
                              <div className="bg-white p-4 rounded-2xl border border-gray-100/80">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Subcategories</div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {subcats.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">No subcategories defined</span>
                                  ) : (
                                    subcats.map((sub, sIdx) => (
                                      <span key={sIdx} className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                        {sub}
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await updateDoc(doc(db, "categories", cat.id), {
                                              subcategories: arrayRemove(sub)
                                            });
                                          }}
                                          className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                          <X size={12} />
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newSubcategoryInputs[cat.id] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: val }));
                                    }}
                                    placeholder="Add subcategory name..."
                                    className="flex-1 bg-gray-50/50 border border-gray-200 transition-colors focus:border-primary/50 text-xs font-bold px-3 py-2 rounded-xl outline-none"
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const subName = (newSubcategoryInputs[cat.id] || "").trim();
                                        if (subName) {
                                          await updateDoc(doc(db, "categories", cat.id), {
                                            subcategories: arrayUnion(subName)
                                          });
                                          setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: "" }));
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const subName = (newSubcategoryInputs[cat.id] || "").trim();
                                      if (subName) {
                                        await updateDoc(doc(db, "categories", cat.id), {
                                          subcategories: arrayUnion(subName)
                                        });
                                        setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: "" }));
                                      }
                                    }}
                                    className="bg-primary hover:brightness-105 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shadow-primary/10 active:scale-95"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === "support" && (
                  <div className="flex-1 flex overflow-hidden">
                    {/* Chat List */}
                    <div className={`w-full md:w-80 border-r overflow-y-auto bg-gray-50/50 ${selectedChat ? "hidden md:flex" : "flex"} flex-col`}>
                      <div className="p-4 border-b bg-white sticky top-0 z-10">
                        <h4 className="font-bold text-secondary uppercase tracking-widest text-xs">Total Chats</h4>
                      </div>
                      {supportChats.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                         কোন চ্যাট পাওয়া যায়নি
                        </div>
                      ) : (
                        supportChats.map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => selectChat(chat)}
                            className={`w-full p-4 border-b flex flex-col gap-1 text-left transition-all hover:bg-white ${selectedChat?.id === chat.id ? "bg-white border-r-4 border-r-primary" : ""}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-sm text-secondary truncate pr-2">
                                {chat.userName}
                              </span>
                              {chat.unreadByAdmin && (
                                <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1">
                              {chat.lastMessage}
                            </p>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(chat.lastMessageAt).toLocaleString()}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    {/* Chat Detail */}
                    <div className={`flex-1 ${!selectedChat ? "hidden md:flex" : "flex"} flex-col bg-white overflow-hidden`}>
                      {selectedChat ? (
                        <>
                          <div className="p-4 border-b bg-gray-50 flex items-center justify-between shrink-0">
                            <div>
                              <h4 className="font-bold text-secondary">{selectedChat.userName}</h4>
                              <p className="text-[10px] text-gray-400 font-mono">{selectedChat.id}</p>
                            </div>
                            <button
                              onClick={() => setSelectedChat(null)}
                              className="text-gray-400 hover:text-primary md:hidden"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                            {selectedChat.messages?.map((msg: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}
                              >
                                <div className={`flex flex-col gap-1 max-w-[80%] ${msg.isAdmin ? "items-end" : "items-start"}`}>
                                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
                                    {msg.senderName}   {new Date(msg.createdAt).toLocaleTimeString()}
                                  </span>
                                  <div
                                    className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md relative ${
                                      msg.isAdmin
                                        ? "bg-secondary text-white rounded-tr-none"
                                        : "bg-white text-secondary border border-gray-100 rounded-tl-none"
                                    }`}
                                  >
                                    {msg.replyTo && (
                                      <div className={`text-[10px] p-2 rounded-lg mb-2 opacity-80 border-l-2 ${msg.isAdmin ? 'bg-black/20 border-white/30' : 'bg-gray-100 border-primary/30'}`}>
                                        <span className="font-bold">Replying to:</span> {msg.replyTo}
                                      </div>
                                    )}
                                    {msg.text}
                                    {msg.image && (
                                      <img loading="lazy"
                                        src={msg.image}
                                        className="max-w-full rounded-xl mt-2 border border-white/20"
                                        alt="Uploaded"
                                      />
                                    )}
                                    {msg.audio && (
                                      <div className="space-y-2 mb-1">
                                        <div className={`flex items-center gap-2 p-2 rounded-xl border ${msg.isAdmin ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAdmin ? 'bg-white text-secondary' : 'bg-primary text-white'}`}>
                                            <Mic size={14} />
                                          </div>
                                          <div>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${msg.isAdmin ? 'text-white' : 'text-gray-400'}`}>Admin</p>
                                            <p className={`text-[9px] font-bold ${msg.isAdmin ? 'text-white/60' : 'text-gray-300'}`}>Turn on sound to listen</p>
                                          </div>
                                        </div>
                                        <audio
                                          src={msg.audio}
                                          controls
                                          className={`block w-full h-10 ${msg.isAdmin ? 'invert opacity-80' : ''}`}
                                          style={{ filter: msg.isAdmin ? 'invert(1) hue-rotate(180deg)' : 'none' }}
                                          preload="metadata"
                                        />
                                      </div>
                                    )}
                                    {/* Reactions DISPLAY */}
                                    {msg.reactions && (Object.values(msg.reactions).some(v => v)) && (
                                      <div className={`absolute -bottom-2 ${msg.isAdmin ? 'right-2' : 'left-2'} flex gap-1 bg-white shadow-xl border border-gray-100 rounded-full px-1.5 py-0.5 scale-75 origin-top z-10`}>
                                        {msg.reactions.love && <span className="text-red-500 hover:scale-125 transition-transform cursor-pointer">❤️</span>}
                                        {msg.reactions.like && <span className="text-blue-500 hover:scale-125 transition-transform cursor-pointer"></span>}
                                      </div>
                                    )}
                                  </div>
                                  {/* Admin Action Buttons */}
                                  {!msg.isAdmin && (
                                    <div className="flex gap-2 mt-1 px-1">
                                      <button 
                                        onClick={() => handleToggleReaction(selectedChat.id, idx, 'love')}
                                        className={`p-1.5 rounded-full transition-all ${msg.reactions?.love ? 'bg-red-50 text-red-500 scale-110 shadow-sm' : 'text-gray-300 hover:bg-gray-100 hover:text-red-400'}`}
                                        title="Love"
                                      >
                                        <Heart size={12} fill={msg.reactions?.love ? "currentColor" : "none"} />
                                      </button>
                                      <button 
                                        onClick={() => handleToggleReaction(selectedChat.id, idx, 'like')}
                                        className={`p-1.5 rounded-full transition-all ${msg.reactions?.like ? 'bg-blue-50 text-blue-500 scale-110 shadow-sm' : 'text-gray-300 hover:bg-gray-100 hover:text-blue-400'}`}
                                        title="Like"
                                      >
                                        <ThumbsUp size={12} fill={msg.reactions?.like ? "currentColor" : "none"} />
                                      </button>
                                      <button 
                                        onClick={() => setAdminReplyingTo(msg)}
                                        className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 font-bold ml-2 transition-colors"
                                      >
                                        Reply
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div ref={adminChatEndRef} />
                          </div>
                          {adminReplyingTo && (
                            <div className="px-4 py-2 bg-gray-50 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
                              <div className="line-clamp-1 border-l-2 border-primary pl-2"><span className="font-bold mr-1">Replying to:</span> {adminReplyingTo.text || "Media"}</div>
                              <button onClick={() => setAdminReplyingTo(null)} className="hover:text-red-500"><X size={14} /></button>
                            </div>
                          )}
                          <form
                            onSubmit={handleAdminReply}
                            className="p-4 border-t bg-white flex gap-3 shrink-0 items-center"
                          >
                            <div className="relative">
                              <input
                                id="admin-chat-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAdminChatImageUpload}
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById("admin-chat-image-upload")?.click()}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 rounded-2xl h-14 w-14 flex items-center justify-center shrink-0"
                              >
                                <Camera size={24} />
                              </button>
                            </div>
                            <div className="flex-1 relative flex items-center">
                              <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-6 pr-14 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                              />
                              <button
                                type="button"
                                onClick={handleAdminVoiceToggle}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
                                  isAdminRecording
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "text-gray-400 hover:text-primary"
                                }`}
                              >
                                {isAdminRecording ? <Square size={18} /> : <Mic size={18} />}
                              </button>
                            </div>
                            <button
                              type="submit"
                              disabled={!replyMessage.trim()}
                              className="bg-primary text-white w-14 h-14 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shrink-0"
                            >
                              <Send size={24} />
                            </button>
                          </form>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center bg-gray-50/20">
                          <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-300">
                            <Headset size={48} />
                          </div>
                          <h4 className="text-xl font-bold text-secondary mb-2">Admin প্যানেল</h4>
                          <p className="text-sm font-medium leading-relaxed max-w-xs">
                           বামে থাকা লিস্ট থেকে একটি চ্যাট সিলেক্ট করে মেসেজ দেখুন এবং রিপ্লাই দিন।
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {adminTab === "refunds" && (
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    <div className="max-w-4xl mx-auto space-y-6">
                       <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                          <div>
                             <h4 className="text-xl font-bold text-secondary">Refunds রিকুয়েস্ট</h4>
                             <p className="text-xs text-gray-400 font-bold">Customerদের Refunds রিকোয়েস্টগুলো এখানে দেখা যাবে</p>
                          </div>
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center gap-2 font-bold text-xs">
                             <Clock size={16} /> Pending: {refundRequests.filter(r => r.status === "pending").length}
                          </div>
                       </div>
                       <div className="grid gap-4">
                          {refundRequests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                               <RefreshCcw size={48} className="mx-auto mb-4 text-gray-100" />
                               <p className="text-sm text-gray-400">এখনো কোনো Refunds রিকোয়েস্ট আসেনি</p>
                            </div>
                          ) : (
                            refundRequests.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map((refund) => (
                               <div key={refund.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                                  <div className="flex-1 space-y-3">
                                     <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                           refund.status === "approved" ? "bg-green-100 text-green-600" :
                                           refund.status === "rejected" ? "bg-red-100 text-red-600" :
                                           "bg-amber-100 text-amber-600"
                                        }`}>
                                           {refund.status}
                                        </span>
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">ID: #{String(refund.id).slice(-6).toUpperCase()}</p>
                                     </div>
                                     <div>
                                        <h5 className="font-bold text-secondary">{refund.userName}</h5>
                                        <p className="text-xs text-gray-400 font-bold">{refund.userEmail}</p>
                                     </div>
                                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1">Refundsের করুন:</p>
                                        <p className="text-sm font-bold text-secondary italic">"{refund.reason}"</p>
                                     </div>
                                     <div className="flex gap-4">
                                        <div>
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">Order ID</p>
                                           <p className="text-xs font-bold text-secondary">#{String(refund.orderId).slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div>
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">পরিমাণ</p>
                                           <p className="text-xs font-bold text-primary">৳{refund.amount}</p>
                                        </div>
                                     </div>
                                  </div>
                                  <div className="flex md:flex-col justify-end gap-2 shrink-0">
                                     {refund.status === "pending" && (
                                        <>
                                           <button 
                                              onClick={() => handleApproveRefund(refund)}
                                              className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                           >
                                              <CheckCircle size={16} /> অ্যাপ্রুভ
                                           </button>
                                           <button 
                                              onClick={async () => {
                                                 if(window.confirm("Reject this request?")) {
                                                    await updateDoc(doc(db, "refund_requests", refund.id), { status: "rejected", updatedAt: new Date().toISOString() });
                                                 }
                                              }}
                                              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center gap-2"
                                           >
                                              <XCircle size={16} /> রিজেক্ট
                                           </button>
                                        </>
                                     )}
                                     {refund.status !== "pending" && (
                                        <div className="text-right">
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">Update টাই?</p>
                                           <p className="text-[10px] font-bold text-gray-500">{new Date(refund.updatedAt || refund.createdAt).toLocaleString("bn-BD")}</p>
                                        </div>
                                     )}
                                  </div>
                               </div>
                            ))
                          )}
                       </div>
                    </div>
                  </div>
                )}
                {adminTab === "campaigns" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Campaign Add/Edit Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-0">
                        <h4 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2">
                          <Gift size={20} className="text-primary" /> {editingCampaign?.id ? "এডিট Campaigns" : "নতুন Campaigns"}
                        </h4>
                        <form onSubmit={saveCampaign} className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Campaigns নাম</label>
                            <input
                              type="text"
                              value={editingCampaign?.name || ""}
                              onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value } as any)}
                              placeholder="e.g. Eid Dhamaka"
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">URL  (Slug)</label>
                            <input
                              type="text"
                              value={editingCampaign?.slug || ""}
                              onChange={(e) => setEditingCampaign({ ...editingCampaign, slug: e.target.value } as any)}
                              placeholder="e.g. eid-dhamaka"
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 italic">Must be unique. e.g. ?campaign=eid-dhamaka</p>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Upload Banner</label>
                            <div className="space-y-3">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleAdminImageUpload(e, "campaign")}
                                className="hidden"
                                id="campaignImageUpload"
                              />
                              <label
                                htmlFor="campaignImageUpload"
                                className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all"
                              >
                                {editingCampaign?.image ? (
                                  <img loading="lazy" src={editingCampaign.image} className="h-24 rounded-lg shadow-sm" alt="Preview" />
                                ) : (
                                  <>
                                    <Upload size={20} className="text-gray-300" />
                                    <span className="text-[10px] font-bold text-gray-400 mt-1">Upload Image</span>
                                  </>
                                )}
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Products ({editingCampaign?.productIds?.length || 0})</label>
                            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1 bg-gray-50 no-scrollbar">
                               {products.filter(p => !p.deleted).map(p => {
                                  const isSelected = editingCampaign?.productIds?.includes(p.id);
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => {
                                        const currentIds = editingCampaign?.productIds || [];
                                        const newIds = isSelected 
                                          ? currentIds.filter(id => id !== p.id) 
                                          : [...currentIds, p.id];
                                        setEditingCampaign({ ...editingCampaign, productIds: newIds } as any);
                                      }}
                                      className={`w-full text-left p-2 rounded-lg text-[10px] font-bold flex gap-2 items-center transition-all ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    >
                                      <img loading="lazy" src={p.image} className="w-6 h-6 rounded object-cover" alt="" />
                                      <span className="flex-1 truncate">{p.name}</span>
                                      {isSelected && <Check size={12} />}
                                    </button>
                                  );
                               })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 py-2">
                             <input 
                                type="checkbox" 
                                checked={editingCampaign?.isActive !== false} 
                                onChange={(e) => setEditingCampaign({ ...editingCampaign, isActive: e.target.checked } as any)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                             />
                             <label className="text-xs font-bold text-gray-600">Campaignsটি লাইভ করুন</label>
                          </div>
                          <div className="flex gap-2 pt-2">
                             <button
                                type="submit"
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                             >
                               সংরক্ষণ করুন
                             </button>
                             {editingCampaign && (
                               <button
                                 type="button"
                                 onClick={() => setEditingCampaign(null)}
                                 className="bg-gray-100 text-gray-500 px-4 rounded-xl hover:bg-gray-200 transition-all"
                               >
                                 <X size={16} />
                               </button>
                             )}
                          </div>
                        </form>
                      </div>
                    </div>
                    {/* Campaign List */}
                    <div className="lg:col-span-2 space-y-4">
                       <h4 className="text-lg font-bold text-secondary flex items-center gap-2">
                         <History size={20} className="text-primary" /> বিদ্যমান Campaignsসমূহ
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {campaigns.map(campaign => (
                             <div key={campaign.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md transition-all">
                                <div className="relative h-32 rounded-2xl overflow-hidden mb-4 bg-gray-50">
                                   {campaign.image && <img loading="lazy" src={campaign.image} className="w-full h-full object-cover" alt="" />}
                                   <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[8px] font-bold uppercase ${campaign.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                      {campaign.isActive ? 'Active' : 'Draft'}
                                   </div>
                                </div>
                                <h5 className="font-bold text-secondary">{campaign.name}</h5>
                                <p className="text-[10px] text-gray-400 font-bold mb-3 truncate">ভিতরে: ?campaign={campaign.slug}</p>
                                <div className="flex items-center justify-between border-t pt-4">
                                   <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                      {campaign.productIds?.length || 0} Products
                                   </span>
                                   <div className="flex gap-2">
                                      <button 
                                        onClick={() => {
                                          const url = window.location.origin + window.location.pathname + "?campaign=" + campaign.slug;
                                          navigator.clipboard.writeText(url);
                                          toast.success("Link copied!");
                                        }}
                                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"
                                        title="Copy Link"
                                      >
                                         <Copy size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setEditingCampaign(campaign)}
                                        className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-all"
                                      >
                                         <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => deleteCampaign(campaign.id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                                      >
                                         <Trash2 size={14} />
                                      </button>
                                   </div>
                                </div>
                             </div>
                          ))}
                          {campaigns.length === 0 && (
                             <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
                                <Gift size={48} className="mx-auto mb-4 text-gray-100" />
                                <p className="text-gray-400 font-bold uppercase text-xs">কোনো Campaigns পাওয়া যায়নি</p>
                             </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}
                {/* Bulk SMS Tab */}
                {adminTab === "bulk_sms" && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30">
                    <div className="max-w-5xl mx-auto space-y-6">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 md:p-8 rounded-[2rem] text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <MessageSquare size={28} />
                          <h3 className="text-2xl font-bold">Bulk SMS</h3>
                        </div>
                        <p className="text-teal-100 text-sm">Send Bulk SMS to all customer phone numbers</p>
                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-xs text-teal-100">Total Unique Numbers</span>
                            <p className="text-xl font-bold">{allOrderPhones.length}</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-xs text-teal-100">Selected</span>
                            <p className="text-xl font-bold">{bulkSmsSelectedPhones.size}</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <span className="text-xs text-teal-100">Total Orders</span>
                            <p className="text-xl font-bold">{orderHistory.length}</p>
                          </div>
                        </div>
                      </div>
                      {/* Message Input */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Send size={16} className="text-teal-500" /> SMS লিখুন
                        </label>
                        <textarea
                          value={bulkSmsMessage}
                          onChange={(e) => setBulkSmsMessage(e.target.value)}
                          placeholder="Write your comment..."
                          className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none min-h-[120px] bg-gray-50/50"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">{bulkSmsMessage.length} অক্ষর</span>
                          <button
                            onClick={handleSendBulkSms}
                            disabled={isSendingBulkSms || bulkSmsSelectedPhones.size === 0 || !bulkSmsMessage.trim()}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                              isSendingBulkSms || bulkSmsSelectedPhones.size === 0 || !bulkSmsMessage.trim()
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl active:scale-95"
                            }`}
                          >
                            {isSendingBulkSms ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                পেমেন্ট হচ্ছে...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                {bulkSmsSelectedPhones.size}টিতে SMS পাঠান
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Live Progress Bar */}
                      {bulkSmsProgress && (
                        <div className="bg-teal-50 border border-teal-200 p-5 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-teal-400/40 border-t-teal-500 rounded-full animate-spin" />
                              <span className="text-sm font-bold text-teal-700">
                                SMS Sending... ব্যাচ {bulkSmsProgress.batchNum}/{bulkSmsProgress.totalBatches}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-teal-600 bg-white px-3 py-1 rounded-full border border-teal-200">
                              {Math.round((bulkSmsProgress.sent / (bulkSmsProgress.total || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-teal-100 rounded-full h-3 mb-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${Math.round((bulkSmsProgress.sent / (bulkSmsProgress.total || 1)) * 100)}%` }}
                            />
                          </div>
                          <div className="flex gap-6 text-xs">
                            <span className="text-teal-700 font-bold">Sent: {bulkSmsProgress.sent}</span>
                            {bulkSmsProgress.failed > 0 && <span className="text-red-500 font-bold">  Failed: {bulkSmsProgress.failed}</span>}
                            <span className="text-gray-500">Total: {bulkSmsProgress.total}</span>
                            <span className="text-gray-400">Remaining: {bulkSmsProgress.total - bulkSmsProgress.sent - bulkSmsProgress.failed}</span>
                          </div>
                        </div>
                      )}
                      {/* Result Summary */}
                      {bulkSmsResult && (
                        <div className={`p-5 rounded-2xl border ${bulkSmsResult.failCount === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                          <div className="flex items-center gap-3 mb-2">
                            {bulkSmsResult.failCount === 0 ? (
                              <CheckCircle2 size={24} className="text-green-500" />
                            ) : (
                              <AlertCircle size={24} className="text-yellow-500" />
                            )}
                            <h4 className="font-bold text-gray-800">SMS পাঠানোর ফলাফল</h4>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <span className="text-green-600 font-bold"> Success: {bulkSmsResult.successCount}</span>
                            <span className="text-red-500 font-bold">  Failed: {bulkSmsResult.failCount}</span>
                            <span className="text-gray-500">Total: {bulkSmsResult.total}</span>
                          </div>
                        </div>
                      )}
                      {/* Phone Numbers List */}
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        {/* Search & Controls */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
                          <div className="relative flex-1 w-full">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input
                              type="text"
                              placeholder="Search by Phone Number..."
                              value={bulkSmsSearch}
                              onChange={(e) => { setBulkSmsSearch(e.target.value); setBulkSmsPage(0); }}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-gray-50/50"
                            />
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                const filtered = allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch));
                                const pagePhones = filtered.slice(bulkSmsPage * BULK_SMS_PAGE_SIZE, (bulkSmsPage + 1) * BULK_SMS_PAGE_SIZE);
                                const newSet = new Set(bulkSmsSelectedPhones);
                                pagePhones.forEach(p => newSet.add(p));
                                setBulkSmsSelectedPhones(newSet);
                              }}
                              className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors whitespace-nowrap"
                            >
                              <Check size={14} className="inline mr-1" /> এই পেজ সিলেক্ট
                            </button>
                            <button
                              onClick={() => {
                                const filtered = allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch));
                                const pagePhones = filtered.slice(bulkSmsPage * BULK_SMS_PAGE_SIZE, (bulkSmsPage + 1) * BULK_SMS_PAGE_SIZE);
                                const newSet = new Set(bulkSmsSelectedPhones);
                                pagePhones.forEach(p => newSet.delete(p));
                                setBulkSmsSelectedPhones(newSet);
                              }}
                              className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors whitespace-nowrap"
                            >
                              <X size={14} className="inline mr-1" /> এই পেজ বাতিল
                            </button>
                            <button
                              onClick={() => {
                                const filtered = allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch));
                                const newSet = new Set(bulkSmsSelectedPhones);
                                filtered.forEach(p => newSet.add(p));
                                setBulkSmsSelectedPhones(newSet);
                              }}
                              className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            >
                              All সিলেক্ট ({allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch)).length})
                            </button>
                            <button
                              onClick={() => setBulkSmsSelectedPhones(new Set())}
                              className="px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                              All রিসেট করুন
                            </button>
                          </div>
                        </div>
                        {/* Phone Numbers Grid */}
                        {(() => {
                          const filtered = allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch));
                          const totalPages = Math.ceil(filtered.length / BULK_SMS_PAGE_SIZE);
                          const pagePhones = filtered.slice(bulkSmsPage * BULK_SMS_PAGE_SIZE, (bulkSmsPage + 1) * BULK_SMS_PAGE_SIZE);
                          const pageSelectedCount = pagePhones.filter(p => bulkSmsSelectedPhones.has(p)).length;
                          return (
                            <>
                              <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-xs text-gray-400">
                                 পেজ {bulkSmsPage + 1}/{totalPages || 1} | এই পেজে আছে: {pagePhones.length} টা | Selected: <span className="text-teal-600 font-bold">{pageSelectedCount}</span>
                                </span>
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                                   Total: {filtered.length} টা
                                </span>
                              </div>
                              {pagePhones.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-2 mb-5">
                                  {pagePhones.map((phone, idx) => {
                                    const isSelected = bulkSmsSelectedPhones.has(phone);
                                    return (
                                      <button
                                        key={phone}
                                        onClick={() => {
                                          const newSet = new Set(bulkSmsSelectedPhones);
                                          if (isSelected) {
                                            newSet.delete(phone);
                                          } else {
                                            newSet.add(phone);
                                          }
                                          setBulkSmsSelectedPhones(newSet);
                                        }}
                                        className={`relative p-3 rounded-xl border-2 text-xs font-mono font-bold transition-all duration-200 text-left ${
                                          isSelected
                                            ? "bg-teal-50 border-teal-400 text-teal-800 shadow-sm ring-1 ring-teal-200"
                                            : "bg-white border-gray-100 text-gray-600 hover:border-teal-200 hover:bg-teal-50/30"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 w-full pr-10">
                                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                            isSelected ? "bg-teal-500 border-teal-500" : "border-gray-300 bg-white"
                                          }`}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                          </div>
                                          <div className="flex flex-col truncate items-start">
                                            <span className="truncate">{phone}</span>
                                            <span className="text-[10px] text-gray-500 font-normal truncate mt-0.5">
                                              {orderHistory.find((o: any) => o.customerPhone === phone)?.customerName || 'Unknown Customer'}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-[9px] text-gray-400 mt-2 pl-6">#{bulkSmsPage * BULK_SMS_PAGE_SIZE + idx + 1}</div>
                                        <a 
                                          href={`tel:${phone}`}
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 hover:scale-110 active:scale-95 transition-all shadow-sm border border-green-100"
                                          title="Action"
                                        >
                                          <Phone size={14} />
                                        </a>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <Phone size={48} className="mx-auto mb-4 text-gray-200" />
                                  <p className="text-gray-400 font-bold text-sm">
                                    {bulkSmsSearch ? "No phone number found" : "কোনো অর্ডার থেকে নম্বর পাওয়া যায়নি"}
                                  </p>
                                </div>
                              )}
                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                                  <button
                                    onClick={() => setBulkSmsPage(Math.max(0, bulkSmsPage - 1))}
                                    disabled={bulkSmsPage === 0}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                      bulkSmsPage === 0
                                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        : "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 active:scale-95"
                                    }`}
                                  >
                                    <ChevronLeft size={16} /> আগে? 
                                  </button>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                      let pageNum: number;
                                      if (totalPages <= 7) {
                                        pageNum = i;
                                      } else if (bulkSmsPage < 3) {
                                        pageNum = i;
                                      } else if (bulkSmsPage > totalPages - 4) {
                                        pageNum = totalPages - 7 + i;
                                      } else {
                                        pageNum = bulkSmsPage - 3 + i;
                                      }
                                      return (
                                        <button
                                          key={pageNum}
                                          onClick={() => setBulkSmsPage(pageNum)}
                                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                            bulkSmsPage === pageNum
                                              ? "bg-teal-500 text-white shadow-md"
                                              : "bg-gray-50 text-gray-500 hover:bg-teal-50"
                                          }`}
                                        >
                                          {pageNum + 1}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <button
                                    onClick={() => setBulkSmsPage(Math.min(totalPages - 1, bulkSmsPage + 1))}
                                    disabled={bulkSmsPage >= totalPages - 1}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                                      bulkSmsPage >= totalPages - 1
                                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        : "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 active:scale-95"
                                    }`}
                                  >
                                      পরে? <ChevronRight size={16} />
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                {adminTab === "profit_analysis" && isMasterAdmin && (
                  <ProfitAnalysis orderHistory={orderHistory} products={products} expenses={expenses} />
                )}
                {adminTab === "settings" && (
                  <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    <div className="max-w-4xl mx-auto mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                      <button onClick={() => setSettingsTab('general')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'general' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>সাধারণ Settings</button>
                      <button onClick={() => setSettingsTab('banners')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'banners' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Homepage Banners</button>
                      <button onClick={() => setSettingsTab('admins')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'admins' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Admin ম্যানেজমেন্ট</button>
                      <button onClick={() => setSettingsTab('users')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Users Access</button>
                    </div>
                    {settingsTab === 'general' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                      {/* Coupon Management Section */}
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                         <div className="flex items-center justify-between mb-8">
                           <h4 className="text-xl font-bold text-secondary flex items-center gap-2">
                             <Tag size={24} className="text-primary" /> কুপন Settings
                           </h4>
                           <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                              ব্যবহার হয়েছে: {orderHistory.filter(o => o.appliedCoupon === (siteConfig?.couponCode || "ISHOPBD5")).length} বার
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div>
                              <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Country Code</label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isCouponPublic ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isCouponPublic ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </div>
                                  <input type="checkbox" className="hidden" checked={siteConfig?.isCouponPublic || false} onChange={(e) => setSiteConfig(prev => prev ? {...prev, isCouponPublic: e.target.checked} : null)} />
                                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-primary transition-colors">{siteConfig?.isCouponPublic ? 'Active' : 'Hidden'}</span>
                                </label>
                              </div>
                              <input type="text" value={siteConfig?.couponCode || ""} onChange={(e) => setSiteConfig(prev => prev ? {...prev, couponCode: e.target.value.toUpperCase()} : null)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-widest" placeholder="e.g. ISHOPBD10" />
                            </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              মডেল নাম/নাম্বার (Model)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.modelName || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), modelName: val }));
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                              placeholder="e.g. Awei T29 Pro"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              ওয়ারেন্টি (Warranty)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.warranty || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), warranty: val }));
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                              placeholder="e.g. 6 Months Official Warranty"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              বক্সে যা যা আছে (In the Box)
                            </label>
                            <input
                              type="text"
                              value={editingProduct?.inTheBox || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), inTheBox: val }));
                              }}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-medium"
                              placeholder="e.g. 1x Earbuds, 1x Charging Cable, 1x User Manual"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                              হাইলাইটেড ফিচার্স (Key Features) - প্রতি লাইনে একটি করে
                            </label>
                            <textarea
                              value={editingProduct?.features || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingProduct((prev) => ({ ...(prev || {}), features: val }));
                              }}
                              rows={4}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-xs font-medium no-scrollbar leading-relaxed"
                              placeholder="Bluetooth 5.3\n5000mAh Battery\nType-C Fast Charging"
                            />
                          </div>
                          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
                            <label className="block text-xs font-bold text-blue-600 uppercase mb-4 flex items-center gap-2">
                              <List size={16} /> স্পেসিফিকেশন (Specifications)
                            </label>
                            
                            <div className="space-y-3">
                              {(editingProduct?.specifications || []).map((spec, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
                                  <div className="flex-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Key (যেমন: Battery)</label>
                                    <input 
                                      type="text"
                                      value={spec.key}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const newSpecs = [...(editingProduct?.specifications || [])];
                                        newSpecs[idx].key = val;
                                        setEditingProduct(prev => ({ ...(prev || {}), specifications: newSpecs }));
                                      }}
                                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Battery"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Value (যেমন: 5000mAh)</label>
                                    <input 
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const newSpecs = [...(editingProduct?.specifications || [])];
                                        newSpecs[idx].value = val;
                                        setEditingProduct(prev => ({ ...(prev || {}), specifications: newSpecs }));
                                      }}
                                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="5000mAh"
                                    />
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newSpecs = editingProduct?.specifications?.filter((_, i) => i !== idx);
                                      setEditingProduct(prev => ({ ...(prev || {}), specifications: newSpecs }));
                                    }}
                                    className="mt-4 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                              
                              <button
                                type="button"
                                onClick={() => {
                                  const newSpecs = [...(editingProduct?.specifications || []), { key: '', value: '' }];
                                  setEditingProduct(prev => ({ ...(prev || {}), specifications: newSpecs }));
                                }}
                                className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all"
                              >
                                <Plus size={16} /> নতুন স্পেসিফিকেশন Add
                              </button>
                            </div>
                          </div>
                            <div>
                              <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">WhatsApp Order Number</label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isWhatsappEnabled !== false ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isWhatsappEnabled !== false ? 'translate-x-4' : 'translate-x-0'}`} />
                                  </div>
                                  <input type="checkbox" className="hidden" checked={siteConfig?.isWhatsappEnabled !== false} onChange={(e) => setSiteConfig(prev => prev ? {...prev, isWhatsappEnabled: e.target.checked} : null)} />
                                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-primary transition-colors">{siteConfig?.isWhatsappEnabled !== false ? 'Active' : 'Hidden'}</span>
                                </label>
                              </div>
                              <input type="text" value={siteConfig?.whatsappNumber || ""} onChange={(e) => setSiteConfig(prev => prev ? {...prev, whatsappNumber: e.target.value} : null)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-widest" placeholder="e.g. 88017XXXXXXXX" />
                            </div>
                            <div>
                               <div className="flex justify-between items-center mb-2 ml-1">
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-[#D12053]">
                                   বিকাশ নাম্বার (Send Money)
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer group">
                                   <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isBkashEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isBkashEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     className="hidden" 
                                     checked={siteConfig?.isBkashEnabled} 
                                     onChange={(e) => setSiteConfig(prev => prev ? {...prev, isBkashEnabled: e.target.checked} : null)}
                                   />
                                   <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-primary transition-colors">
                                     {siteConfig?.isBkashEnabled ? "Active" : "Hidden"}
                                   </span>
                                 </label>
                               </div>
                               <input
                                 type="text"
                                 value={siteConfig?.bkashNumber || ""}
                                 onChange={(e) => setSiteConfig(prev => prev ? {...prev, bkashNumber: e.target.value} : null)}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold disabled:opacity-50"
                                 placeholder="e.g. 017XXXXXXXX"
                                 disabled={!siteConfig?.isBkashEnabled}
                               />
                            </div>
                            <div>
                               <div className="flex justify-between items-center mb-2 ml-1">
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-[#23A354]">
                                   বিকাশ নাম্বার (Send Money)
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer group">
                                   <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isNagadEnabled ? 'bg-[#23A354]' : 'bg-gray-300'}`}>
                                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isNagadEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     className="hidden" 
                                     checked={siteConfig?.isNagadEnabled} 
                                     onChange={(e) => setSiteConfig(prev => prev ? {...prev, isNagadEnabled: e.target.checked} : null)}
                                   />
                                   <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-[#23A354] transition-colors">
                                     {siteConfig?.isNagadEnabled ? "Active" : "Hidden"}
                                   </span>
                                 </label>
                               </div>
                               <input
                                 type="text"
                                 value={siteConfig?.nagadNumber || ""}
                                 onChange={(e) => setSiteConfig(prev => prev ? {...prev, nagadNumber: e.target.value} : null)}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#23A354] text-sm font-bold disabled:opacity-50"
                                 placeholder="e.g. 017XXXXXXXX"
                                 disabled={!siteConfig?.isNagadEnabled}
                               />
                            </div>
                            <div>
                               <div className="flex justify-between items-center mb-2 ml-1">
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-[#8C3494]">
                                   রকেট নাম্বার (Send Money)
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer group">
                                   <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isRocketEnabled ? 'bg-[#8C3494]' : 'bg-gray-300'}`}>
                                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isRocketEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     className="hidden" 
                                     checked={siteConfig?.isRocketEnabled} 
                                     onChange={(e) => setSiteConfig(prev => prev ? {...prev, isRocketEnabled: e.target.checked} : null)}
                                   />
                                   <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-[#8C3494] transition-colors">
                                     {siteConfig?.isRocketEnabled ? "Active" : "Hidden"}
                                   </span>
                                 </label>
                               </div>
                               <input
                                 type="text"
                                 value={siteConfig?.rocketNumber || ""}
                                 onChange={(e) => setSiteConfig(prev => prev ? {...prev, rocketNumber: e.target.value} : null)}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#8C3494] text-sm font-bold disabled:opacity-50"
                                 placeholder="e.g. 017XXXXXXXX-X"
                                 disabled={!siteConfig?.isRocketEnabled}
                               />
                            </div>
                            <div>
                               <div className="flex justify-between items-center mb-2 ml-1">
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-secondary">
                                   অতিরিক্ত গ্যালারি ছবি
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer group">
                                   <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${siteConfig?.isBankEnabled ? 'bg-secondary' : 'bg-gray-300'}`}>
                                     <div className={`w-3 h-3 bg-white rounded-full transition-transform ${siteConfig?.isBankEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     className="hidden" 
                                     checked={siteConfig?.isBankEnabled} 
                                     onChange={(e) => setSiteConfig(prev => prev ? {...prev, isBankEnabled: e.target.checked} : null)}
                                   />
                                   <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest group-hover:text-secondary transition-colors">
                                     {siteConfig?.isBankEnabled ? "Active" : "Hidden"}
                                   </span>
                                 </label>
                               </div>
                               <input
                                 type="text"
                                 value={siteConfig?.bankDetails || ""}
                                 onChange={(e) => setSiteConfig(prev => prev ? {...prev, bankDetails: e.target.value} : null)}
                                 className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-secondary text-sm font-bold disabled:opacity-50"
                                 placeholder="e.g. Bank Name, A/C No, Branch"
                                 disabled={!siteConfig?.isBankEnabled}
                               />
                            </div>
                            <div className="md:col-span-2 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between mt-2">
                              <div>
                                <h5 className="text-xs font-bold text-secondary uppercase tracking-widest">Cash on Delivery (COD) Option</h5>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Show Cash on Delivery option at checkout</p>
                              </div>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-14 h-7 rounded-full p-1 transition-colors ${siteConfig?.isCodEnabled ? 'bg-primary' : 'bg-gray-300'}`}>
                                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${siteConfig?.isCodEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                </div>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={siteConfig?.isCodEnabled} 
                                  onChange={(e) => setSiteConfig(prev => prev ? {...prev, isCodEnabled: e.target.checked} : null)}
                                />
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors min-w-[60px]">
                                  {siteConfig?.isCodEnabled ? "Enabled" : "Disabled"}
                                </span>
                              </label>
                            </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                আমাদের সম্পর্কে (About Us)
                              </label>
                              <textarea
                                value={siteConfig?.aboutUs || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, aboutUs: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-24 resize-none no-scrollbar"
                                placeholder="..."
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                গোপনীয়তা নীতি (Privacy Policy)
                              </label>
                              <textarea
                                value={siteConfig?.privacyPolicy || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, privacyPolicy: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                Refunds পলিসি (Refund Policy)
                              </label>
                              <textarea
                                value={siteConfig?.refundPolicy || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, refundPolicy: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                নিয়ম ও শর্তাবলী (Terms & Conditions)
                              </label>
                              <textarea
                                value={siteConfig?.termsAndConditions || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, termsAndConditions: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                অতিরিক্ত গ্যালারি ছবি
                              </label>
                              <textarea
                                value={siteConfig?.checkoutWarningText || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, checkoutWarningText: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-24 resize-none no-scrollbar"
                                placeholder="০"
                              />
                           </div>
                            {/* SMS Template */}
                            <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                              <p className="text-xs font-bold text-blue-700 mb-3">Confirmation SMS Template</p>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">First part / Start message</label>
                                  <textarea
                                    value={siteConfig?.smsTemplateStart || ""}
                                    onChange={(e) => setSiteConfig(prev => prev ? {...prev, smsTemplateStart: e.target.value} : null)}
                                    className="w-full bg-white border border-blue-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm h-20 resize-none no-scrollbar"
                                    placeholder="যেমন: প্রিয় Customer, আপনার অর্ডারটি অর্ডার হয়েছে?"
                                  />
                                </div>
                                <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl px-4 py-3 text-xs text-blue-500">
                                   <strong>Cash on Delivery:</strong><br/>
                                  Products: [Productsের নাম ও পরিমাণ]<br/>
                                  অর্ডার নং: [অর্ডার নম্বর]<br/>
                                  মোট বিল: ৳[টাকা]
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Last part / Additional message</label>
                                  <textarea
                                    value={siteConfig?.smsTemplateEnd || ""}
                                    onChange={(e) => setSiteConfig(prev => prev ? {...prev, smsTemplateEnd: e.target.value} : null)}
                                    className="w-full bg-white border border-blue-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm h-20 resize-none no-scrollbar"
                                    placeholder="যেমন: কোনো প্রয়োজনে আমাদের সাথে যোগাAdd: 01777600844"
                                  />
                                </div>
                                {/* Toggle */}
                                <div className="flex items-center justify-between bg-white border border-blue-100 rounded-xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-gray-700">Confirm SMS Enabled</p>
                                    <p className="text-xs text-gray-400">চালু করলে অর্ডার করুন পর Customer এসএমএস পাবে?</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={siteConfig?.isSmsConfirmEnabled !== false}
                                    onChange={(e) => setSiteConfig(prev => prev ? {...prev, isSmsConfirmEnabled: e.target.checked} : null)}
                                    className="w-5 h-5 accent-primary rounded border-gray-300"
                                  />
                                </div>
                              </div>
                            </div>
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                এআই চ্যাটবট (AI Bot)
                              </label>
                              <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 h-12">
                                <span className="text-sm font-medium text-gray-700">Check</span>
                                <input
                                  type="checkbox"
                                  checked={siteConfig?.isAiEnabled || false}
                                  onChange={(e) => setSiteConfig(prev => prev ? {...prev, isAiEnabled: e.target.checked} : null)}
                                  className="w-5 h-5 accent-primary rounded border-gray-300"
                                />
                              </div>
                           </div>
                           {siteConfig?.isAiEnabled && (
                             <div className="md:col-span-2">
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                  Gemini API Key
                                </label>
                                <input
                                  type="password"
                                  value={adminKeys?.geminiApiKey || ""}
                                  onChange={(e) => setAdminKeys(prev => prev ? {...prev, geminiApiKey: e.target.value} : {geminiApiKey: e.target.value})}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                  placeholder="০"
                                />
                             </div>
                           )}
                            {/* Steadfast Courier Settings */}
                            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                              <h4 className="font-bold text-gray-800 text-sm">কুরিয়ার Settings (Steadfast)</h4>
                              <div>
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                   Steadfast API Key
                                 </label>
                                 <input
                                   type="text"
                                   value={adminKeys?.steadfastApiKey || ""}
                                   onChange={(e) => setAdminKeys(prev => prev ? {...prev, steadfastApiKey: e.target.value} : {steadfastApiKey: e.target.value})}
                                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                   placeholder="API Key..."
                                 />
                              </div>
                              <div>
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                   Steadfast Secret Key
                                 </label>
                                 <input
                                   type="password"
                                   value={adminKeys?.steadfastSecretKey || ""}
                                   onChange={(e) => setAdminKeys(prev => prev ? {...prev, steadfastSecretKey: e.target.value} : {steadfastSecretKey: e.target.value})}
                                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                   placeholder="০"
                                 />
                              </div>
                            </div>
                            {/* Pathao Courier Settings */}
                            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                              <h4 className="font-bold text-gray-800 text-sm">কুরিয়ার Settings (Pathao)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                     Pathao Client ID
                                   </label>
                                   <input
                                     type="text"
                                     value={adminKeys?.pathaoClientId || ""}
                                     onChange={(e) => setAdminKeys(prev => prev ? {...prev, pathaoClientId: e.target.value} : {pathaoClientId: e.target.value})}
                                     className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                     placeholder="Client ID..."
                                   />
                                </div>
                                <div>
                                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                     Pathao Client Secret
                                   </label>
                                   <input
                                     type="password"
                                     value={adminKeys?.pathaoClientSecret || ""}
                                     onChange={(e) => setAdminKeys(prev => prev ? {...prev, pathaoClientSecret: e.target.value} : {pathaoClientSecret: e.target.value})}
                                     className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                     placeholder="Client Secret..."
                                   />
                                </div>
                                <div>
                                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                     Pathao Username (Email)
                                   </label>
                                   <input
                                     type="text"
                                     value={adminKeys?.pathaoUsername || ""}
                                     onChange={(e) => setAdminKeys(prev => prev ? {...prev, pathaoUsername: e.target.value} : {pathaoUsername: e.target.value})}
                                     className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                     placeholder="Email..."
                                   />
                                </div>
                                <div>
                                   <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                     Pathao Password
                                   </label>
                                   <input
                                     type="password"
                                     value={adminKeys?.pathaoPassword || ""}
                                     onChange={(e) => setAdminKeys(prev => prev ? {...prev, pathaoPassword: e.target.value} : {pathaoPassword: e.target.value})}
                                     className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                     placeholder="Password..."
                                   />
                                </div>
                              </div>
                            </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                অতিরিক্ত গ্যালারি ছবি
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.supportPhone1 || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, supportPhone1: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                অতিরিক্ত গ্যালারি ছবি
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.supportPhone2 || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, supportPhone2: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                অতিরিক্ত গ্যালারি ছবি
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.facebookUrl || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, facebookUrl: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              />
                           </div>
                         </div>
                         <div className="space-y-6">
                           <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                             <div className="flex items-center gap-3">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${siteConfig?.isCouponPublic ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                                  <Eye size={20} />
                               </div>
                               <div>
                                   <p className="text-xs font-bold text-gray-900">Make Public</p>
                                   <p className="text-[10px] text-gray-400 font-bold">Customerরা চেকআউট পেজে এই কোডটি দেখতে পাবে</p>
                               </div>
                             </div>
                             <button
                               onClick={() => setSiteConfig(prev => prev ? {...prev, isCouponPublic: !prev.isCouponPublic} : null)}
                               className={`w-12 h-6 rounded-full transition-all relative ${siteConfig?.isCouponPublic ? 'bg-primary' : 'bg-gray-400'}`}
                             >
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${siteConfig?.isCouponPublic ? 'left-7' : 'left-1'}`} />
                             </button>
                           </div>
                           <button
                             onClick={() => handleSaveSiteConfig(siteConfig)}
                             className="w-full bg-secondary text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-secondary/20 hover:bg-black transition-all active:scale-95 text-xs uppercase"
                           >
                             কনফিগারেশন সেভ করুন
                           </button>
                         </div>
                      </div>
                    )}
                    
                    {/* Banner Management Section (Moved here from separate tab) */}
                    {settingsTab === 'banners' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                        <ImageIcon size={24} className="text-primary" /> হোমপেজ
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                অতিরিক্ত গ্যালারি ছবি
                              </label>
                              <input
                                type="text"
                                value={
                                  editingBanner
                                    ? editingBanner.title || ""
                                    : newBanner.title || ""
                                }
                                onChange={(e) =>
                                  editingBanner
                                    ? setEditingBanner({
                                        ...editingBanner,
                                        title: e.target.value,
                                      })
                                    : setNewBanner({
                                        ...newBanner,
                                        title: e.target.value,
                                      })
                                }
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g. সেরা মানের Products"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                সাব-টাইটেল
                              </label>
                              <input
                                type="text"
                                value={
                                  editingBanner
                                    ? editingBanner.subtitle || ""
                                    : newBanner.subtitle || ""
                                }
                                onChange={(e) =>
                                  editingBanner
                                    ? setEditingBanner({
                                        ...editingBanner,
                                        subtitle: e.target.value,
                                      })
                                    : setNewBanner({
                                        ...newBanner,
                                        subtitle: e.target.value,
                                      })
                                }
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g. 100% Original Product Guarantee"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">Link or Product ID</label>
                              <select
                                value={
                                  editingBanner
                                    ? editingBanner.linkedProductId || ""
                                    : newBanner.linkedProductId || ""
                                }
                                onChange={(e) =>
                                  editingBanner
                                    ? setEditingBanner({
                                        ...editingBanner,
                                        linkedProductId: e.target.value,
                                      })
                                    : setNewBanner({
                                        ...newBanner,
                                        linkedProductId: e.target.value,
                                      })
                                }
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              >
                                <option value="">No link</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {/* Font Settings */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    টাইটেল ফন্ট
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.titleFont || "font-ador"
                                        : newBanner.titleFont || "font-ador"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            titleFont: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            titleFont: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    {BENGALI_FONTS.map((f) => (
                                      <option key={f.value} value={f.value}>
                                        {f.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    টাইটেল ওয়েট
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.titleWeight || "black"
                                        : newBanner.titleWeight || "black"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            titleWeight: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            titleWeight: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    <option value="normal">Regular</option>
                                    <option value="bold">Bold</option>
                                    <option value="black">Black</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    সাব-টাইটেল ফন্ট
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.subtitleFont || "font-ador"
                                        : newBanner.subtitleFont || "font-ador"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            subtitleFont: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            subtitleFont: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    {BENGALI_FONTS.map((f) => (
                                      <option key={f.value} value={f.value}>
                                        {f.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    সাব-টাইটেল ওয়েট
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.subtitleWeight || "bold"
                                        : newBanner.subtitleWeight || "bold"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            subtitleWeight: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            subtitleWeight: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    <option value="normal">Regular</option>
                                    <option value="bold">Bold</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    টাইটেল সাইজ
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.titleSize || "text-2xl md:text-4xl"
                                        : newBanner.titleSize || "text-2xl md:text-4xl"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            titleSize: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            titleSize: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    <option value="text-xl md:text-3xl">Small</option>
                                    <option value="text-2xl md:text-4xl">Standard (Default)</option>
                                    <option value="text-3xl md:text-5xl">Large</option>
                                    <option value="text-4xl md:text-6xl">Extra Large</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                    সাব-টাইটেল সাইজ
                                  </label>
                                  <select
                                    value={
                                      editingBanner
                                        ? editingBanner.subtitleSize || "text-sm md:text-base"
                                        : newBanner.subtitleSize || "text-sm md:text-base"
                                    }
                                    onChange={(e) =>
                                      editingBanner
                                        ? setEditingBanner({
                                            ...editingBanner,
                                            subtitleSize: e.target.value,
                                          })
                                        : setNewBanner({
                                            ...newBanner,
                                            subtitleSize: e.target.value,
                                          })
                                    }
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                                  >
                                    <option value="text-xs md:text-sm">Small</option>
                                    <option value="text-sm md:text-base">Standard (Default)</option>
                                    <option value="text-base md:text-lg">Large</option>
                                    <option value="text-lg md:text-xl">Extra Large</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
                                    পজিশন (X)
                                  </label>
                                  <span className="text-[10px] font-bold text-primary">
                                    {
                                      (
                                        editingBanner?.objectPosition ||
                                        newBanner.objectPosition ||
                                        "50% 50%"
                                      ).split(" ")[0]
                                    }
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={parseInt(
                                    (
                                      editingBanner?.objectPosition ||
                                      newBanner.objectPosition ||
                                      "50% 50%"
                                    ).split(" ")[0],
                                  )}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const current = (
                                      editingBanner?.objectPosition ||
                                      newBanner.objectPosition ||
                                      "50% 50%"
                                    ).split(" ");
                                    const newPos = `${val}% ${current[1] || "50%"}`;
                                    if (editingBanner)
                                      setEditingBanner({
                                        ...editingBanner,
                                        objectPosition: newPos,
                                      });
                                    else
                                      setNewBanner({
                                        ...newBanner,
                                        objectPosition: newPos,
                                      });
                                  }}
                                  className="w-full accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
                                    পজিশন (Y)
                                  </label>
                                  <span className="text-[10px] font-bold text-primary">
                                    {
                                      (
                                        editingBanner?.objectPosition ||
                                        newBanner.objectPosition ||
                                        "50% 50%"
                                      ).split(" ")[1]
                                    }
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={parseInt(
                                    (
                                      editingBanner?.objectPosition ||
                                      newBanner.objectPosition ||
                                      "50% 50%"
                                    ).split(" ")[1],
                                  )}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const current = (
                                      editingBanner?.objectPosition ||
                                      newBanner.objectPosition ||
                                      "50% 50%"
                                    ).split(" ");
                                    const newPos = `${current[0] || "50%"} ${val}%`;
                                    if (editingBanner)
                                      setEditingBanner({
                                        ...editingBanner,
                                        objectPosition: newPos,
                                      });
                                    else
                                      setNewBanner({
                                        ...newBanner,
                                        objectPosition: newPos,
                                      });
                                  }}
                                  className="w-full accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="mb-6">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest px-1">
                                ব্যানার টাইএª
                               </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingBanner) setEditingBanner({...editingBanner, type: "hero"});
                                    else setNewBanner({...newBanner, type: "hero"});
                                  }}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                                    (editingBanner?.type || newBanner.type || "hero") === "hero"
                                      ? "border-primary bg-red-50 text-primary"
                                      : "border-gray-100 bg-gray-50 text-gray-400"
                                  }`}
                                >
                                  হিরো ব্যানার (স্লাইডার)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingBanner) setEditingBanner({...editingBanner, type: "secondary"});
                                    else setNewBanner({...newBanner, type: "secondary"});
                                  }}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                                    (editingBanner?.type || newBanner.type) === "secondary"
                                      ? "border-primary bg-red-50 text-primary"
                                      : "border-gray-100 bg-gray-50 text-gray-400"
                                  }`}
                                >
                                  ক্যাম্পেইন ব্যানার (নিচে)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingBanner) setEditingBanner({...editingBanner, type: "right_top"});
                                    else setNewBanner({...newBanner, type: "right_top"});
                                  }}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                                    (editingBanner?.type || newBanner.type) === "right_top"
                                      ? "border-primary bg-red-50 text-primary"
                                      : "border-gray-100 bg-gray-50 text-gray-400"
                                  }`}
                                >
                                  ডান-উপরের ব্যানার
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingBanner) setEditingBanner({...editingBanner, type: "right_bottom"});
                                    else setNewBanner({...newBanner, type: "right_bottom"});
                                  }}
                                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase transition-all border-2 ${
                                    (editingBanner?.type || newBanner.type) === "right_bottom"
                                      ? "border-primary bg-red-50 text-primary"
                                      : "border-gray-100 bg-gray-50 text-gray-400"
                                  }`}
                                >
                                  ডান-নিচের ব্যানার (ফ্ল্যাশ সেল)
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
              ব্যানারের ছবি
                              </label>
                              <div
                                onClick={() =>
                                  document
                                    .getElementById("banner-upload-settings")
                                    ?.click()
                                }
                                className="w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50 relative overflow-hidden"
                              >
                                {editingBanner?.image || newBanner.image ? (
                                  <img loading="lazy"
                                    src={
                                      editingBanner
                                        ? editingBanner.image
                                        : newBanner.image
                                    }
                                    className="w-full h-full object-contain transition-all"
                                    style={{
                                      objectPosition: editingBanner
                                        ? editingBanner.objectPosition ||
                                          "50% 50%"
                                        : newBanner.objectPosition || "50% 50%",
                                    }}
                                  />
                                ) : (
                                  <>
                                    <Upload
                                      size={24}
                                      className="text-gray-300 mb-2"
                                    />
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
              ছবি আপলোড করুন
                                    </span>
                                  </>
                                )}
                                <input
                                  id="banner-upload-settings"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleAdminImageUpload(e, "banner")
                                  }
                                  className="hidden"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveBanner}
                                className="flex-1 bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-black transition-all active:scale-95 text-xs uppercase"
                              >
                                {editingBanner
                                  ? "ব্যানার Update করুন"
                                  : "ব্যানার Add"}
                              </button>
                              {editingBanner && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBanner(editingBanner.id);
                                  }}
                                  className="px-6 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-all text-xs uppercase flex items-center justify-center active:scale-95 shadow-sm"
                                  title="Delete Order"
                                >
                                  <Trash2 size={24} />
                                </button>
                              )}
                              {editingBanner && (
                                <button
                                  onClick={() => {
                                    setEditingBanner(null);
                                    setNewBanner({
                                      title: "",
                                      subtitle: "",
                                      image: "",
                                      color: "bg-primary",
                                      objectPosition: "50% 50%",
                                      linkedProductId: "",
                                      titleFont: "font-ador",
                                      titleWeight: "black",
                                      subtitleFont: "font-ador",
                                      subtitleWeight: "bold",
                                      type: "hero",
                                    });
                                  }}
                                  className="px-4 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all text-xs uppercase"
                                >
                                  বাতিল
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h5 className="font-bold text-secondary text-sm">
                           সক্রিয় ব্যানারসমূহ ({activeBanners.length})
                          </h5>
                          <div className="space-y-3">
                            {activeBanners.map((banner) => (
                              <div
                                key={banner.id}
                                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group"
                              >
                                <div className="flex items-center gap-3">
                                  <img loading="lazy"
                                    src={banner.image}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                  />
                                  <div>
                                    <p className="text-[11px] font-bold text-secondary leading-tight truncate max-w-[120px]">
                                      {banner.title || "Untitled Banner"}
                                    </p>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      <p className="text-[8px] text-gray-400 font-bold ">
                                        {banner.subtitle || (banner.type === 'secondary' ? 'Secondary' : 'Hero')}
                                      </p>
                                      <span className={`text-[7px] font-bold uppercase px-1 rounded-sm ${banner.type === 'secondary' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {banner.type === 'hero' || !banner.type ? 'Hero' : 'Secondary'}
                                      </span>
                                    </div>
                                    {banner.linkedProductId && (
                                      <p className="text-[8px] text-primary font-bold uppercase mt-1">
                                        আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => setEditingBanner(banner)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                    title="Edit Banner"
                                  >
                                    <Edit size={18} />
                                  </button>
                                    <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteBanner(banner.id);
                                    }}
                                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                    title="Delete Banner"
                                  >
                                    <Trash2 size={24} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                        {/* Database Management Section Removed to protect user data */}
                        
                        {/* Admin Management Section */}
                    {settingsTab === 'admins' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                        <ShieldCheck size={24} className="text-primary" />
                       Recent Orders
                      </h4>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 tracking-widest">
                          {editingAdmin ? "Admin/Moderator এডিট করুন" : "নতুন Admin/Moderator Add"}
                        </label>
                        <div className="flex flex-col xl:flex-row gap-3">
                          <input
                            type="email"
                            disabled={!!editingAdmin}
                            value={(editingAdmin ? editingAdmin.email : newAdminEmail) || ""}
                            onChange={(e) => editingAdmin ? null : setNewAdminEmail(e.target.value)}
                            className={`flex-[2] border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0 ${editingAdmin ? 'bg-gray-100' : 'bg-white'}`}
                            placeholder="Enter Email Address..."
                          />
                          <input
                            type="text"
                            value={(editingAdmin ? editingAdmin.password : newAdminPassword) || ""}
                            onChange={(e) =>
                              editingAdmin 
                                ? setEditingAdmin({...editingAdmin, password: e.target.value})
                                : setNewAdminPassword(e.target.value)
                            }
                            className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0"
                            placeholder="Password..."
                          />
                          <input
                            type="text"
                            value={(editingAdmin ? editingAdmin.phone : newAdminPhone) || ""}
                            onChange={(e) =>
                              editingAdmin 
                                ? setEditingAdmin({...editingAdmin, phone: e.target.value})
                                : setNewAdminPhone(e.target.value)
                            }
                            className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0"
                            placeholder="Phone Number (2FA)..."
                          />
                          <select
                            value={editingAdmin ? editingAdmin.role : newAdminRole}
                            onChange={(e) =>
                              editingAdmin
                                ? setEditingAdmin({...editingAdmin, role: e.target.value as any})
                                : setNewAdminRole(e.target.value as "admin" | "moderator" | "owner")
                            }
                            className="bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm shrink-0"
                          >
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Other</option>
                          </select>
                          <div className="flex gap-2">
                             <button
                               onClick={editingAdmin ? handleUpdateAdmin : handleAddAdmin}
                               className="bg-secondary text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-black transition-all active:scale-95 shrink-0 whitespace-nowrap text-sm"
                             >
                               {editingAdmin ? "Update" : "Add"}
                             </button>
                             {editingAdmin && (
                               <button
                                 onClick={() => setEditingAdmin(null)}
                                 className="bg-gray-200 text-gray-600 font-bold px-6 py-3 rounded-2xl hover:bg-gray-300 transition-all active:scale-95"
                               >
                                 বাতিল
                               </button>
                             )}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 italic font-medium">
                          আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h5 className="font-bold text-secondary text-sm">
                         সক্রিয় Usersসমূহ ({adminList.length})
                        </h5>
                        {adminList.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary border border-gray-100">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-secondary text-sm">
                                  {admin.email}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${admin.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                                  >
                                    {admin.role === "admin"
                                      ? "ADMIN"
                                      : "MODERATOR"}
                                  </span>
                                  {admin.phone && (
                                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Phone size={8} /> {admin.phone}
                                    </span>
                                  )}
                                  {/* Password hidden for security */}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingAdmin(admin)}
                                className="p-3 bg-white text-gray-400 hover:text-primary hover:bg-primary/5 transition-all rounded-xl border border-gray-100 shadow-sm"
                                title="Action"
                              >
                                <Edit size={18} />
                              </button>
                              {admin.email !== "islamicsoktitv@gmail.com" && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteAdmin(admin.id);
                                  }}
                                  className="p-3 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl border border-gray-100 shadow-sm"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                    {settingsTab === 'users' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-secondary flex items-center gap-2">
                          <Users size={24} className="text-primary" />
                         Recent Orders
                        </h4>
                        <button 
                          onClick={async () => {
                            setIsUsersLoading(true);
                            try {
                              const q = query(collection(db, "users"), limit(100));
                              const snapshot = await getDocs(q);
                              setUserList(snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
                            } catch (err: any) {
                              console.error(err);
                              if (err.message?.includes("Quota exceeded") || err.message === "QUOTA_EXCEEDED") {
                                setIsQuotaExceeded(true);
                              }
                            } finally {
                              setIsUsersLoading(false);
                            }
                          }}
                          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <RefreshCcw size={14} className={isUsersLoading ? "animate-spin" : ""} /> রিফ্রেশ
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Users</th>
                              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">Access</th>
                              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {userList.map((u) => (
                               <tr key={u.id} className="group">
                                 <td className="py-4">
                                   <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold overflow-hidden">
                                       {u.photoURL ? (
                                         <img loading="lazy" src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                         u.displayName?.substring(0, 1) || u.email?.substring(0, 1) || "?"
                                       )}
                                     </div>
                                     <div>
                                       <p className="text-sm font-bold text-secondary">{u.displayName || "Anonymous"}</p>
                                       <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                                     </div>
                                   </div>
                                 </td>
                                 <td className="py-4 text-right">
                                   <p className="text-sm font-bold text-primary">৳{u.balance || 0}</p>
                                 </td>
                                 <td className="py-4 text-right">
                                   <button 
                                      onClick={() => handleEditUserBalance(u)}
                                      className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-all"
                                   >
                                     ব্যালেন্স Update
                                   </button>
                                 </td>
                               </tr>
                             ))}
                             {userList.length === 0 && !isUsersLoading && (
                               <tr>
                                 <td colSpan={3} className="py-8 text-center text-gray-400 text-sm italic">কোন Users পাওয়া যায়নি</td>
                               </tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    )}
                    {settingsTab === 'general' && (
                    <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-3xl flex items-start gap-4">
                      <ShieldCheck
                        className="text-yellow-600 flex-shrink-0"
                        size={24}
                      />
                      <div>
                        <p className="font-bold text-yellow-800 text-sm">
                          আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।
                        </p>
                        <p className="text-xs text-yellow-700 leading-relaxed font-medium">
                          পেমেন্ট করার পর ট্রানজেকশন আইডিটি নিচে অটোমেটিক
                          সেট হয়ে যাবে।
                        </p>
                      </div>
                    </div>
                    )}
                  </div>
                )}
                {adminTab === "users" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto no-scrollbar max-h-[70vh]">
                   {/* Bulk Notification Form */}
                   <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Bell size={24} />
                         </div>
                         <div>
                            <h4 className="text-xl font-bold text-secondary">Send Notification</h4>
<p className="text-xs text-gray-500 font-bold">নতুন প্রোডাক্ট বা অফারের তথ্য All গ্রাহককে পাঠান</p>
                         </div>
                      </div>
                      
                      <form onSubmit={handleSendBulkNotification} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <div>
                               <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">Title</label>
                               <input 
                                  required
                                  type="text"
                                  value={bulkNotifForm.title}
                                  onChange={e => setBulkNotifForm({...bulkNotifForm, title: e.target.value})}
                                  placeholder="e.g. Dhamaka Offer!"
                                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm"
                               />
                            </div>
                            <div>
                               <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">Link or Product ID</label>
                               <input 
                                  type="text"
                                  value={bulkNotifForm.link}
                                  onChange={e => setBulkNotifForm({...bulkNotifForm, link: e.target.value})}
                                  placeholder="e.g. p123"
                                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm"
                               />
                            </div>
                         </div>
                         <div className="flex flex-col gap-4">
                            <div className="flex-1">
                               <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">বিস্তারিত Admin</label>
                               <textarea 
                                  required
                                  rows={4}
                                  value={bulkNotifForm.message}
                                  onChange={e => setBulkNotifForm({...bulkNotifForm, message: e.target.value})}
                          placeholder="Write your message here..."
                                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm resize-none"
                               />
                            </div>
                            <button 
                               disabled={isSendingBulkNotif}
                               type="submit"
                               className="bg-primary text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                               {isSendingBulkNotif ? (
                                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                               ) : (
                                  <>
                                     <Send size={18} />
                                     একসাথে পাঠান
                                  </>
                               )}
                            </button>
                         </div>
                      </form>
                   </div>
                   {/* Sent Notifications List */}
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                     <div className="flex items-center gap-3 mb-6">
                       <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10">
                         <Bell size={24} />
                       </div>
                       <div>
                         <h4 className="text-xl font-bold text-secondary">All নোটিফিকেশন হিস্ট্রি</h4>
                         <p className="text-xs text-gray-400 font-bold">Customerদের Refunds রিকোয়েস্টগুলো এখানে দেখা যাবে</p>
                       </div>
                     </div>
                     {notifications.filter((n: any) => n.type === "broadcast" || n.userId === "all").length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                         <Bell size={48} className="mb-3 opacity-30" />
                         <p className="text-sm font-bold">No notification found</p>
                       </div>
                     ) : (
                       <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
                         {notifications
                           .filter((n: any) => n.type === "broadcast" || n.userId === "all")
                           .map((notif: any) => (
                             <div key={notif.id} className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-primary/20 transition-all group">
                               <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                 <Bell size={18} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-start justify-between gap-2">
                                   <p className="font-bold text-secondary text-sm truncate">{notif.title}</p>
                                   <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap flex-shrink-0">
                                     {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ""}
                                   </span>
                                 </div>
                                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                 {notif.link && (
                                   <span className="inline-block mt-1.5 text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                                      {notif.link}
                                   </span>
                                 )}
                                 <p className="text-[10px] text-gray-300 mt-1.5">Sender: {notif.sender || "system"}</p>
                               </div>
                               <button
                                 onClick={async () => {
                                   if (!window.confirm("আপনি কি এই Refunds রিকোয়েস্টটি অ্যাপ্রুভ করতে চান? এটি Usersের ব্যালেন্সে টাকা যোগ করে দেবে।")) return;
                                   try {
                                     if (notif.userId === 'all') {
                                       const dismissedStr = localStorage.getItem('dismissedNotifs') || '[]';
                                       let dismissed: string[] = [];
                                       try { dismissed = JSON.parse(dismissedStr); } catch(e) {}
                                       dismissed.push(notif.id);
                                       localStorage.setItem('dismissedNotifs', JSON.stringify(dismissed));
                                       setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                     } else {
                                       await deleteDoc(doc(db, "notifications", notif.id));
                                     }
                                     toast.success("Coupon applied successfully! You get Free Delivery.");
                                   } catch (err) {
                                     toast.error("Wrong password! Try again.");
                                   }
                                 }}
                                 className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 flex-shrink-0 transition-colors"
                                 title="Delete Order"
                               >
                                 <Trash2 size={14} />
                               </button>
                             </div>
                           ))}
                       </div>
                     )}
                   </div>
                   {/* User Search & List */}
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                         <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10">
                               <Users size={24} />
                            </div>
                            <div>
                               <h4 className="text-xl font-bold text-secondary">Customer List</h4>
                             <p className="text-xs text-gray-400 font-bold">Customerদের Refunds রিকোয়েস্টগুলো এখানে দেখা যাবে</p>
                            </div>
                         </div>
                         
                         <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input 
                               type="text"
                               value={userListSearch}
                               onChange={e => setUserListSearch(e.target.value)}
                               placeholder="Search by Email or Phone..."
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-inner"
                            />
                         </div>
                      </div>
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-50">
                              <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Users</th>
                              <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Access</th>
                              <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {userList.filter(u => 
                                (u.email || "").toLowerCase().includes(userListSearch.toLowerCase()) || 
                                (u.uid || "").toLowerCase().includes(userListSearch.toLowerCase()) ||
                                (u.displayName || "").toLowerCase().includes(userListSearch.toLowerCase())
                             ).slice(0, 50).map((u: any) => (
                                <tr key={u.id || u.uid} className="hover:bg-gray-50/50 transition-colors group">
                                   <td className="py-6 px-2">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-secondary font-bold text-xs uppercase shadow-sm">
                                            {u.displayName ? u.displayName[0] : <User size={16} />}
                                         </div>
                                         <div>
                                            <p className="font-bold text-secondary text-sm">{u.displayName || "অজানা Users"}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">
                                              {u.email?.endsWith("@mobile.user") ? u.email.replace("@mobile.user", "") : u.email}
                                            </p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="py-6 px-2">
                                      <p className="text-sm font-bold text-primary">৳{u.balance || 0}</p>
                                   </td>
                                   <td className="py-6 px-2 text-right">
                                       <div className="flex items-center justify-end gap-2">
                                          <button 
                                            onClick={() => handleSendDirectNotification(u.uid || u.id, u.email || "")}
                                            className="bg-primary/10 text-primary px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-primary/20 active:scale-95 transition-all flex items-center gap-1.5"
                                          >
                                            <MessageSquare size={12} />
                                            মেসেজ
                                          </button>
                                          <button 
                                            onClick={() => handleEditUserBalance(u)}
                                            className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-100 active:scale-95 transition-all"
                                          >
                                            ব্যালেন্স Update
                                          </button>
                                       </div>
                                   </td>
                                </tr>
                             ))}
                             {userList.length === 0 && (
                                <tr><td colSpan={3} className="py-12 text-center text-gray-400 text-xs italic">No data found</td></tr>
                             )}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              )}
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
