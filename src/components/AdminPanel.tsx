
import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Ban, Bell, Calendar, Camera, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Copy, Download, Edit, Edit2, Edit3, Eye, Gift, Headset, Heart, History, ImageIcon, Landmark, LayoutGrid, LayoutTemplate, List, Loader2, MessageSquare, MessageCircle, MapPin, Mic, MoreVertical, Phone, Plus, PlusCircle, Printer, Receipt, RefreshCcw, Search, Send, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Square, Star, Tag, ThumbsUp, Trash2, TrendingUp, Truck, Upload, User, UserCheck, Users, Wallet, X, XCircle, Settings, Package, RotateCcw, Activity, DollarSign, ArrowUpRight, Percent, Filter, Layers, BarChart2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, query, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getProductSlug, getProductPath, formatEnglishDateTime } from '../utils/helpers';
import AdminOrdersTab from './admin/AdminOrdersTab';
import AdminReviewsTab from './admin/AdminReviewsTab';

const POS = lazy(() => import('./POS'));
const ProfitAnalysis = lazy(() => import('./ProfitAnalysis'));
const MarketingSettings = lazy(() =>
  import('./MarketingSettings').then((m) => ({ default: m.MarketingSettings }))
);
const AdminIncompleteOrdersTab = lazy(() => import('./admin/AdminIncompleteOrdersTab'));
const AdminProductsTab = lazy(() => import('./admin/AdminProductsTab'));
const AdminCategoriesTab = lazy(() => import('./admin/AdminCategoriesTab'));
const AdminSupportTab = lazy(() => import('./admin/AdminSupportTab'));
const AdminRefundsTab = lazy(() => import('./admin/AdminRefundsTab'));
const AdminCampaignsTab = lazy(() => import('./admin/AdminCampaignsTab'));
const AdminReportsTab = lazy(() => import('./admin/AdminReportsTab'));
const AdminLowStockTab = lazy(() => import('./admin/AdminLowStockTab'));
const AdminUsersTab = lazy(() => import('./admin/AdminUsersTab'));
const AdminSettingsAdminsTab = lazy(() => import('./admin/AdminSettingsAdminsTab'));
const AdminSettingsUsersTab = lazy(() => import('./admin/AdminSettingsUsersTab'));

export interface AdminPanelProps {
  isAdminOpen: any;
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
  adminReviews?: any;
  adminStartDate: any;
  adminTab: any;
  fetchAdminReviews?: any;
  handleApproveReview?: any;
  handleRejectReview?: any;
  handleDeleteReviewAdmin?: any;
  isAdminReviewsLoading?: any;
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
  getProductPrice?: any;
  getOrderLocalDateString: any;
  handleAddAdmin: any;
  handleCompleteIncompleteOrder?: any;
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
  handleBulkPrintStickers?: any;
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
  handleSetPrimaryImage?: any;
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
  isSyncingCourier?: boolean;
  syncAllCourierStatuses?: (force?: boolean) => void;
  syncSingleCourierStatus?: (orderId: string) => void;
  syncingOrderId?: string | null;
  toggleBlacklist: any;
  togglePublishStatus: any;
  userList: any;
  userListSearch: any;
  isSavingProduct?: any;
  deletedOrders?: any;
  restoreOrder?: any;
  permanentDeleteOrder?: any;
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
    adminReviews = [],
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
    fetchAdminReviews,
    filteredOrders,
    formatOrderGroupDate,
    getCustomerStats,
    getProductPrice,
    getOrderLocalDateString,
    handleAddAdmin,
    handleCompleteIncompleteOrder,
    handleAdminChatImageUpload,
    handleAdminImageUpload,
    handleAdminMultiImageUpload,
    handleAdminReply,
    handleAdminVoiceToggle,
    handleApproveRefund,
    handleApproveReview,
    handleDeleteAdmin,
    handleDeleteBanner,
    handleDeleteReviewAdmin,
    handleDuplicateProduct,
    handleEditUserBalance,
    handlePrintInvoice,
    handleBulkPrintStickers,
    handleQuickEditOrderItems,
    handleRejectReview,
    handleSaveBanner,
    handleSaveQuickEdit,
    handleSaveSiteConfig,
    handleSelectAll,
    handleSelectOrder,
    handleSendBulkNotification,
    handleSendBulkSms,
    handleSendDirectNotification,
    handleSendIndividualSms,
    handleSetPrimaryImage,
    handleToggleReaction,
    handleUpdateAdmin,
    handleUpdateOrderStatus,
    handleUpdatePaymentMethod,
    handleVariantImageUpload,
    incompleteOrders,
    individualSmsMessage,
    individualSmsOrder,
    isAdminRecording,
    isAdminReviewsLoading = false,
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
    isSyncingCourier = false,
    syncAllCourierStatuses,
    syncSingleCourierStatus,
    syncingOrderId = null,
    toggleBlacklist,
    togglePublishStatus,
    userList,
    userListSearch,
    isSavingProduct,
    deletedOrders,
    restoreOrder,
    permanentDeleteOrder,
  } = props;

  const [settingsTab, setSettingsTab] = React.useState("general");

  const getEffectiveStock = React.useCallback((p: any): number => {
    if (!p) return 0;
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const hasVariantStocks = p.variants.some((v: any) => v && v.stock !== undefined && v.stock !== null);
      if (hasVariantStocks) {
        const sum = p.variants.reduce((acc: number, v: any) => acc + (Number(v?.stock) || 0), 0);
        return Math.max(0, sum);
      }
    }
    return Math.max(0, Number(p.stock) || 0);
  }, []);

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
                        Admin Dashboard
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
                        if (o.deleted) return false;
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
                      <Clock size={18} />
                      Pre Order ({orderHistory.filter(o => {
                        if (o.deleted) return false;
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
                    <button
                      onClick={() => {
                        setAdminTab("pos");
                        setShowOnlyPreOrders(false);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "pos" ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <ShoppingBag size={18} /> POS (Outlet)
                    </button>
                    <button
                      onClick={() => {
                        setAdminTab("deleted_orders");
                        setShowOnlyPreOrders(false);
                      }}
                      className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "deleted_orders" ? "bg-red-700 text-white shadow-md shadow-red-700/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                    >
                      <Trash2 size={18} /> Recycle Bin ({deletedOrders?.length || 0})
                    </button>
                    {adminViewMode === "full" && (
                      <>
                        <button
                          onClick={() => setAdminTab("products")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "products" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Package size={18} /> Products ({products.length})
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
                          <RotateCcw size={18} /> Refunds ({refundRequests.filter(r => r.status === "pending").length})
                        </button>
                        <button
                          onClick={() => setAdminTab("reports")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "reports" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Activity size={18} /> Reports
                        </button>
                        <button
                          onClick={() => setAdminTab("low_stock")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "low_stock" ? "bg-yellow-500 text-white shadow-md shadow-yellow-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <AlertCircle size={18} /> Low Stock ({products.filter((p: any) => !p.deleted && getEffectiveStock(p) <= 5).length})
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
                        <button
                          onClick={() => setAdminTab("reviews")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "reviews" ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Star size={18} /> Reviews {(() => {
                            const pendingCount = (adminReviews || []).filter((r: any) => r.status === "pending").length;
                            return pendingCount > 0 ? (
                              <span className="ml-auto bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {pendingCount} Pending
                              </span>
                            ) : (
                              `(${(adminReviews || []).length})`
                            );
                          })()}
                        </button>
                        {isMasterAdmin && (
                          <button
                            onClick={() => setAdminTab("profit_analysis")}
                            className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "profit_analysis" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                          >
                            <Wallet size={18} /> Accounts
                          </button>
                        )}
                        <button
                          onClick={() => setAdminTab("settings")}
                          className={`text-sm font-bold transition-all flex items-center justify-start gap-3 px-4 py-3 rounded-xl w-full ${adminTab === "settings" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"}`}
                        >
                          <Settings size={18} /> Settings
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
                        { id: "orders", icon: History, label: `Orders (${orderHistory.filter(o => !o.deleted && !((o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending")).length})` },
                        { id: "preorder", icon: CircleDot, label: `Pre Order (${orderHistory.filter(o => !o.deleted && (o.isPreOrder || o.items?.some((i: any) => i.product?.isComingSoon)) && o.status === "pending").length})` },
                        { id: "incomplete_orders", icon: ShoppingCart, label: `Incomplete (${incompleteOrders.length})` },
                        { id: "support", icon: Headset, label: "Support" },
                        { id: "pos", icon: ShoppingBag, label: "POS (Outlet)" },
                        { id: "deleted_orders", icon: Trash2, label: `Recycle Bin (${deletedOrders?.length || 0})` },
                        ...(adminViewMode === "full" ? [
                          { id: "products", icon: PlusCircle, label: "Products" },
                          { id: "categories", icon: LayoutGrid, label: "Categories" },
                          { id: "refunds", icon: RefreshCcw, label: "Refunds" },
                          { id: "reports", icon: Activity, label: "Reports" },
                          { id: "low_stock", icon: AlertCircle, label: `Low Stock (${products.filter((p: any) => !p.deleted && getEffectiveStock(p) <= 5).length})` },
                          { id: "users", icon: Users, label: "Users" },
                          { id: "campaigns", icon: Gift, label: "Campaigns" },
                          { id: "bulk_sms", icon: MessageSquare, label: "Bulk SMS" },
                          { id: "reviews", icon: Star, label: `Reviews (${(adminReviews || []).filter((r: any) => r.status === "pending").length > 0 ? `${(adminReviews || []).filter((r: any) => r.status === "pending").length} Pending` : (adminReviews || []).length})` },
                          ...(isMasterAdmin ? [
                            { id: "profit_analysis", icon: TrendingUp, label: "Accounts" },
                          ] : []),
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
              <div className={`flex-1 w-full md:w-auto h-full ${adminTab === "support" || adminTab === "pos" ? "overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8"} bg-gray-50/30 no-scrollbar flex flex-col`}>
                <Suspense fallback={
                  <div className="flex-1 flex items-center justify-center py-16 text-gray-400 text-xs font-bold gap-2">
                    <Loader2 size={18} className="animate-spin text-primary" /> লোড হচ্ছে...
                  </div>
                }>
                {adminTab === "orders" && (
                  <AdminOrdersTab
                    orderHistory={orderHistory}
                    filteredOrders={filteredOrders}
                    reportTimeframe={reportTimeframe}
                    setReportTimeframe={setReportTimeframe}
                    selectedOrderStatusFilter={selectedOrderStatusFilter}
                    setSelectedOrderStatusFilter={setSelectedOrderStatusFilter}
                    adminStartDate={adminStartDate}
                    setAdminStartDate={setAdminStartDate}
                    adminEndDate={adminEndDate}
                    setAdminEndDate={setAdminEndDate}
                    adminOrderAreaFilter={adminOrderAreaFilter}
                    setAdminOrderAreaFilter={setAdminOrderAreaFilter}
                    orderSearchQuery={orderSearchQuery}
                    setOrderSearchQuery={setOrderSearchQuery}
                    syncAllCourierStatuses={syncAllCourierStatuses}
                    isSyncingCourier={isSyncingCourier}
                    exportDropdownRef={exportDropdownRef}
                    isExportDropdownOpen={isExportDropdownOpen}
                    setIsExportDropdownOpen={setIsExportDropdownOpen}
                    exportOrdersToCSV={exportOrdersToCSV}
                    adminOrdersLimit={adminOrdersLimit}
                    setAdminOrdersLimit={setAdminOrdersLimit}
                    getOrderLocalDateString={getOrderLocalDateString}
                    formatOrderGroupDate={formatOrderGroupDate}
                    setSelectedOrderForDetails={setSelectedOrderForDetails}
                    handleSelectOrder={handleSelectOrder}
                    handleSelectAll={handleSelectAll}
                    selectedOrderIds={selectedOrderIds}
                    handleQuickEditOrderItems={handleQuickEditOrderItems}
                    getCustomerStats={getCustomerStats}
                    handleUpdateOrderStatus={handleUpdateOrderStatus}
                    handleUpdatePaymentMethod={handleUpdatePaymentMethod}
                    syncSingleCourierStatus={syncSingleCourierStatus}
                    syncingOrderId={syncingOrderId}
                    quickEditOrderId={quickEditOrderId}
                    setQuickEditOrderId={setQuickEditOrderId}
                    quickEditData={quickEditData}
                    setQuickEditData={setQuickEditData}
                    handleSaveQuickEdit={handleSaveQuickEdit}
                    courierReports={courierReports}
                    loadingCourierReports={loadingCourierReports}
                    checkCourierReport={checkCourierReport}
                    setCourierModalPhone={setCourierModalPhone}
                    setIsCourierHistoryModalOpen={setIsCourierHistoryModalOpen}
                    individualSmsOrder={individualSmsOrder}
                    setIndividualSmsOrder={setIndividualSmsOrder}
                    siteConfig={siteConfig}
                    individualSmsMessage={individualSmsMessage}
                    setIndividualSmsMessage={setIndividualSmsMessage}
                    handleSendIndividualSms={handleSendIndividualSms}
                    isSendingIndividualSms={isSendingIndividualSms}
                    setCompletedOrderReceipt={setCompletedOrderReceipt}
                    sendToCourier={sendToCourier}
                    handlePrintInvoice={handlePrintInvoice}
                    onBulkPrintStickers={handleBulkPrintStickers}
                    toggleBlacklist={toggleBlacklist}
                    blacklist={blacklist}
                    deleteOrder={deleteOrder}
                  />
                )}
                {adminTab === "incomplete_orders" && (
                  <AdminIncompleteOrdersTab
                    incompleteOrders={incompleteOrders}
                    getCustomerStats={getCustomerStats}
                    individualSmsOrder={individualSmsOrder}
                    setIndividualSmsOrder={setIndividualSmsOrder}
                    individualSmsMessage={individualSmsMessage}
                    setIndividualSmsMessage={setIndividualSmsMessage}
                    handleSendIndividualSms={handleSendIndividualSms}
                    isSendingIndividualSms={isSendingIndividualSms}
                    products={products}
                    getProductPrice={getProductPrice}
                    courierReports={courierReports}
                    loadingCourierReports={loadingCourierReports}
                    checkCourierReport={checkCourierReport}
                    siteConfig={siteConfig}
                    onCompleteIncompleteOrder={handleCompleteIncompleteOrder}
                  />
                )}
                {adminTab === "products" && (
                  <AdminProductsTab
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    saveProduct={saveProduct}
                    productFormErrors={productFormErrors}
                    setProductFormErrors={setProductFormErrors}
                    isMasterAdmin={isMasterAdmin}
                    handleAdminImageUpload={handleAdminImageUpload}
                    handleSetPrimaryImage={handleSetPrimaryImage}
                    removeImage={removeImage}
                    handleAdminMultiImageUpload={handleAdminMultiImageUpload}
                    categories={categories}
                    handleVariantImageUpload={handleVariantImageUpload}
                    removeVariant={removeVariant}
                    addVariant={addVariant}
                    products={products}
                    getEffectiveStock={getEffectiveStock}
                    togglePublishStatus={togglePublishStatus}
                    activeProductDropdown={activeProductDropdown}
                    productDropdownRef={productDropdownRef}
                    setActiveProductDropdown={setActiveProductDropdown}
                    copyLandingPageLink={copyLandingPageLink}
                    handleDuplicateProduct={handleDuplicateProduct}
                    openLandingEditor={openLandingEditor}
                    deleteProduct={deleteProduct}
                  />
                )}
                {adminTab === "categories" && (
                  <AdminCategoriesTab
                    categories={categories}
                    editingCategory={editingCategory}
                    setEditingCategory={setEditingCategory}
                    saveCategory={saveCategory}
                    copyCategoryLink={copyCategoryLink}
                    deleteCategory={deleteCategory}
                    deletingCatId={deletingCatId}
                  />
                )}
                {adminTab === "support" && (
                  <AdminSupportTab
                    supportChats={supportChats}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    selectChat={selectChat}
                    handleToggleReaction={handleToggleReaction}
                    adminReplyingTo={adminReplyingTo}
                    setAdminReplyingTo={setAdminReplyingTo}
                    adminChatEndRef={adminChatEndRef}
                    handleAdminReply={handleAdminReply}
                    handleAdminChatImageUpload={handleAdminChatImageUpload}
                    replyMessage={replyMessage}
                    setReplyMessage={setReplyMessage}
                    handleAdminVoiceToggle={handleAdminVoiceToggle}
                    isAdminRecording={isAdminRecording}
                  />
                )}
                {adminTab === "refunds" && (
                  <AdminRefundsTab
                    refundRequests={refundRequests}
                    handleApproveRefund={handleApproveRefund}
                  />
                )}
                {adminTab === "campaigns" && (
                  <AdminCampaignsTab
                    campaigns={campaigns}
                    products={products}
                    editingCampaign={editingCampaign}
                    setEditingCampaign={setEditingCampaign}
                    saveCampaign={saveCampaign}
                    deleteCampaign={deleteCampaign}
                    handleAdminImageUpload={handleAdminImageUpload}
                  />
                )}
                {/* Customer Photo Reviews Moderation Tab */}
                {adminTab === "reviews" && (
                  <AdminReviewsTab
                    adminReviews={adminReviews}
                    fetchAdminReviews={fetchAdminReviews}
                    handleApproveReview={handleApproveReview}
                    handleRejectReview={handleRejectReview}
                    handleDeleteReviewAdmin={handleDeleteReviewAdmin}
                    isAdminReviewsLoading={isAdminReviewsLoading}
                  />
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
                          <Send size={16} className="text-teal-500" /> Compose SMS
                        </label>
                        <textarea
                          value={bulkSmsMessage}
                          onChange={(e) => setBulkSmsMessage(e.target.value)}
                          placeholder="Write your SMS message here..."
                          className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none min-h-[120px] bg-gray-50/50"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">{bulkSmsMessage.length} characters</span>
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
                                Sending SMS...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                Send SMS to {bulkSmsSelectedPhones.size} Numbers
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
                                SMS Sending... Batch {bulkSmsProgress.batchNum}/{bulkSmsProgress.totalBatches}
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
                            <h4 className="font-bold text-gray-800">SMS Sending Results</h4>
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
                              <Check size={14} className="inline mr-1" /> Select This Page
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
                              <X size={14} className="inline mr-1" /> Deselect Page
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
                              Select All ({allOrderPhones.filter(p => !bulkSmsSearch || p.includes(bulkSmsSearch)).length})
                            </button>
                            <button
                              onClick={() => setBulkSmsSelectedPhones(new Set())}
                              className="px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
                            >
                              Reset Selection
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
                                 Page {bulkSmsPage + 1}/{totalPages || 1} | On this page: {pagePhones.length} items | Selected: <span className="text-teal-600 font-bold">{pageSelectedCount}</span>
                                </span>
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                                   Total: {filtered.length}
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
                                    {bulkSmsSearch ? "No phone number found" : "No numbers found from orders"}
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
                                    <ChevronLeft size={16} /> Previous
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
                                      Next <ChevronRight size={16} />
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

                {/* ── Reports Tab (Comprehensive Store & Product Analytics) ── */}
                {adminTab === "reports" && (
                  <AdminReportsTab
                    orderHistory={orderHistory}
                    products={products}
                    getEffectiveStock={getEffectiveStock}
                  />
                )}

                {/* ── Low Stock Tab ── */}
                {adminTab === "low_stock" && (
                  <AdminLowStockTab products={products} getEffectiveStock={getEffectiveStock} />
                )}

                {/* ── POS Tab ── */}
                {adminTab === "pos" && (
                  <div className="flex-1 overflow-y-auto bg-gray-50/40">
                    <POS
                      products={products}
                      categories={categories}
                      siteConfig={siteConfig}
                      orderHistory={orderHistory}
                      handlePrintInvoice={handlePrintInvoice}
                      smsTemplateStart={siteConfig?.smsTemplateStart}
                      smsTemplateEnd={siteConfig?.smsTemplateEnd}
                      isSmsConfirmEnabled={siteConfig?.isSmsConfirmEnabled}
                    />
                  </div>
                )}
                {adminTab === "deleted_orders" && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/30 font-sans">
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded-xl"><Trash2 size={20} /></div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Deleted Orders (Recycle Bin)</h3>
                            <p className="text-xs text-gray-400 font-medium">Deleted Orders — restore or permanently delete ({deletedOrders?.length || 0})</p>
                          </div>
                        </div>
                      </div>

                      {(!deletedOrders || deletedOrders.length === 0) ? (
                        <div className="text-center py-16 text-gray-400 font-bold bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
                          <Trash2 size={40} className="mx-auto mb-3 opacity-20 text-red-500" />
                          <p>No deleted orders found</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {deletedOrders.map((order: any) => {
                            const customerName = order.customerName || order.name || order.customer?.name || "Customer";
                            const customerPhone = (order.customerPhone || order.phone || order.customer?.phone || "").trim();
                            const address = order.customerAddress || order.address || "";
                            const orderIdShort = String(order.id || "").slice(-6).toUpperCase();
                            const dateStr = formatEnglishDateTime(order.date || order.createdAt);
                            const items = Array.isArray(order.items) ? order.items : [];

                            return (
                              <div
                                key={order.id}
                                className="bg-white rounded-xl border border-red-100/80 p-2.5 sm:p-3 shadow-xs hover:border-red-200 hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                              >
                                {/* Left Info: ID, Date, Customer & Phone */}
                                <div className="flex flex-wrap items-center gap-3 min-w-0 lg:w-[40%]">
                                  {/* ID & Date */}
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Trash2 size={11} /> DELETED
                                    </span>
                                    <span className="text-xs font-black text-gray-800 tracking-wide">#{orderIdShort}</span>
                                  </div>

                                  {/* Customer Name & Phone */}
                                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1 text-gray-900 font-bold text-xs truncate max-w-[140px]">
                                      <User size={13} className="text-gray-400 shrink-0" />
                                      <span className="truncate" title={customerName}>{customerName}</span>
                                    </div>

                                    {customerPhone && (
                                      <div className="flex items-center gap-1">
                                        <a
                                          href={`tel:${customerPhone}`}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md text-[11px] font-bold tracking-tight transition-colors"
                                          title="Call Customer"
                                        >
                                          <Phone size={10} /> {customerPhone}
                                        </a>
                                        <a
                                          href={`https://wa.me/880${customerPhone.startsWith('0') ? customerPhone.substring(1) : customerPhone}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                          title="WhatsApp"
                                        >
                                          <MessageCircle size={13} />
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(customerPhone);
                                            toast.success("Phone copied");
                                          }}
                                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                          title="Copy Phone"
                                        >
                                          <Copy size={11} />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Address snippet */}
                                  {address && (
                                    <div className="w-full text-[11px] text-gray-500 truncate flex items-center gap-1">
                                      <MapPin size={11} className="text-gray-400 shrink-0" />
                                      <span className="truncate" title={address}>{address}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Middle: Product Thumbnails & Summary */}
                                <div className="flex items-center gap-2 min-w-0 lg:w-[35%] overflow-x-auto no-scrollbar py-0.5">
                                  {items.length === 0 ? (
                                    <span className="text-[11px] text-gray-400 italic">No products</span>
                                  ) : (
                                    items.map((item: any, idx: number) => {
                                      const matchedProd = products.find((p: any) => p.id === item.product?.id || p.id === item.id || p.name === (item.product?.name || item.name));
                                      const itemImg = item.product?.image || item.image || matchedProd?.image || "";
                                      const itemName = item.product?.name || item.name || "Product";
                                      const itemQty = Number(item.quantity) || 1;
                                      const itemPrice = Number(item.price || item.product?.price || 0);

                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-2 bg-gray-50/80 border border-gray-200/70 rounded-lg px-2 py-1 shrink-0 max-w-[240px]"
                                          title={`${itemName} (Qty: ${itemQty})`}
                                        >
                                          {itemImg ? (
                                            <img
                                              src={itemImg}
                                              alt={itemName}
                                              className="w-8 h-8 object-cover rounded bg-white border border-gray-200 shrink-0"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                              <Package size={14} />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-gray-800 truncate">{itemName}</p>
                                            <div className="flex items-center gap-1.5 text-[10px]">
                                              <span className="font-bold text-primary">৳{itemPrice}</span>
                                              <span className="text-gray-500 font-bold">×{itemQty}</span>
                                              {(item.color || item.size) && (
                                                <span className="text-gray-400 truncate">
                                                  ({[item.color, item.size].filter(Boolean).join("/")})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Right: Total Amount & Action Buttons */}
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 lg:w-[22%] pt-1 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                  <div className="text-left lg:text-right">
                                    <div className="text-sm font-black text-gray-900 leading-tight">
                                      ৳{(Number(order.total) || 0).toLocaleString()}
                                    </div>
                                    {dateStr && <div className="text-[10px] text-gray-400">{dateStr}</div>}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => restoreOrder?.(order.id || order)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                                      title="Restore Order"
                                    >
                                      <RotateCcw size={12} /> <span>Restore</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm("Permanently delete this order? This action cannot be undone.")) {
                                          permanentDeleteOrder?.(order.id);
                                        }
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
                                      title="Permanent Delete"
                                    >
                                      <Trash2 size={12} /> <span className="hidden xl:inline">Permanent Delete</span><span className="xl:hidden">Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {adminTab === "settings" && (
                  <div className="w-full space-y-6">
                    <div className="w-full mb-6 bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                      <button onClick={() => setSettingsTab('general')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'general' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>General Settings</button>
                      <button onClick={() => setSettingsTab('banners')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'banners' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Homepage Banners</button>
                      <button onClick={() => setSettingsTab('marketing')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${settingsTab === 'marketing' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Zap size={15} /> Marketing & Ads Integration</button>
                      <button onClick={() => setSettingsTab('admins')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'admins' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Admin Management</button>
                      <button onClick={() => setSettingsTab('users')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Users Access</button>
                    </div>
                    {settingsTab === 'general' && (
                    <div className="space-y-8 w-full">
                      {/* Coupon Management Section */}
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                         <div className="flex items-center justify-between mb-8">
                           <h4 className="text-xl font-bold text-secondary flex items-center gap-2">
                             <Tag size={24} className="text-primary" /> Coupon & Payment Settings
                           </h4>
                           <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                              Used: {orderHistory.filter(o => o.appliedCoupon === (siteConfig?.couponCode || "ISHOPBD5")).length} times
                           </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div>
                              <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">Coupon Code</label>
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
                                   Nagad Number (Send Money)
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
                                   bKash Number (Send Money)
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
                                   Rocket Number (Send Money)
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
                                   Bank Payment Option
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
                                About Us
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
                                Privacy Policy
                              </label>
                              <textarea
                                value={siteConfig?.privacyPolicy || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, privacyPolicy: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                Refund Policy
                              </label>
                              <textarea
                                value={siteConfig?.refundPolicy || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, refundPolicy: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                Terms & Conditions
                              </label>
                              <textarea
                                value={siteConfig?.termsAndConditions || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, termsAndConditions: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-32 resize-none no-scrollbar"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                Checkout Warning Text
                              </label>
                              <textarea
                                value={siteConfig?.checkoutWarningText || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, checkoutWarningText: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-medium h-24 resize-none no-scrollbar"
                                placeholder="0"
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
                                    placeholder="e.g. Dear Customer, your order has been placed successfully."
                                  />
                                </div>
                                <div className="bg-white border-2 border-dashed border-blue-300 rounded-xl px-4 py-3 text-xs text-blue-500">
                                   <strong>Cash on Delivery:</strong><br/>
                                  Products: [Product Name & Quantity]<br/>
                                  Order No: [Order Number]<br/>
                                  Total Bill: ৳[Amount]
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Last part / Additional message</label>
                                  <textarea
                                    value={siteConfig?.smsTemplateEnd || ""}
                                    onChange={(e) => setSiteConfig(prev => prev ? {...prev, smsTemplateEnd: e.target.value} : null)}
                                    className="w-full bg-white border border-blue-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm h-20 resize-none no-scrollbar"
                                    placeholder="e.g. For any queries, contact us at: 01777600844"
                                  />
                                </div>
                                {/* Toggle */}
                                <div className="flex items-center justify-between bg-white border border-blue-100 rounded-xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-gray-700">Confirm SMS Enabled</p>
                                    <p className="text-xs text-gray-400">If enabled, customer will receive SMS after order</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={siteConfig?.isSmsConfirmEnabled !== false}
                                    onChange={(e) => setSiteConfig(prev => prev ? {...prev, isSmsConfirmEnabled: e.target.checked} : null)}
                                    className="w-5 h-5 accent-primary rounded border-gray-300"
                                  />
                                </div>
                                {/* Customer Reminder SMS Toggle */}
                                <div className="flex items-center justify-between bg-white border border-blue-100 rounded-xl px-4 py-3">
                                  <div>
                                    <p className="text-sm font-bold text-gray-700">Customer Reminder Message</p>
                                    <p className="text-xs text-gray-400">চালু থাকলে অসম্পূর্ণ অর্ডার/কার্টের ১ ঘণ্টা পর কাস্টমার অটো রিমাইন্ডার SMS পাবে; বন্ধ থাকলে পাবে না</p>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                      type="checkbox"
                                      aria-label="Customer Reminder Message"
                                      checked={siteConfig?.isReminderSmsEnabled !== false}
                                      onChange={(e) => setSiteConfig(prev => prev ? {...prev, isReminderSmsEnabled: e.target.checked} : null)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                  </label>
                                </div>
                              </div>
                            </div>
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                AI Chatbot
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
                                  placeholder="0"
                                />
                             </div>
                           )}
                            {/* Steadfast Courier Settings */}
                            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                              <h4 className="font-bold text-gray-800 text-sm">Courier Settings (Steadfast)</h4>
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
                                   placeholder="0"
                                 />
                              </div>
                              <div>
                                 <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                   Steadfast Webhook Bearer Token (রিয়েল-টাইম আপডেটের জন্য)
                                 </label>
                                 <input
                                   type="password"
                                   value={adminKeys?.steadfastWebhookSecret || ""}
                                   onChange={(e) => setAdminKeys(prev => prev ? {...prev, steadfastWebhookSecret: e.target.value} : {steadfastWebhookSecret: e.target.value})}
                                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                   placeholder="Webhook Secret / Bearer Token..."
                                 />
                                 <p className="text-[11px] text-gray-400 mt-2 flex flex-wrap items-center gap-1.5">
                                   <span>Webhook Callback URL:</span>
                                   <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono select-all">
                                     https://ishopbd.com/api/courier/webhook/steadfast
                                   </code>
                                 </p>
                              </div>
                            </div>
                            {/* Pathao Courier Settings */}
                            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                              <h4 className="font-bold text-gray-800 text-sm">Courier Settings (Pathao)</h4>
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
                                Support Phone 1
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
                                Support Phone 2
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
                                Facebook URL
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.facebookUrl || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, facebookUrl: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                PC App Download Link
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.computerAppUrl || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, computerAppUrl: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g., /apps/ishopbd-setup.exe"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                Android App Download Link (APK/Play Store)
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.androidAppUrl || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, androidAppUrl: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g., /apps/ishopbd.apk"
                              />
                           </div>
                           <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 tracking-widest">
                                iPhone App Download Link (App Store)
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.iphoneAppUrl || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, iphoneAppUrl: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g., https://apps.apple.com/..."
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
                                   <p className="text-[10px] text-gray-400 font-bold">Customers will see this code on the checkout page</p>
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
                             Save Configuration
                           </button>
                         </div>
                      </div>
                    )}
                    
                    {/* Banner Management Section (Moved here from separate tab) */}
                    {settingsTab === 'banners' && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                        <ImageIcon size={24} className="text-primary" /> Homepage
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                Banner Title
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
                                placeholder="e.g. Best Quality Products"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                Sub-title
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
                                    Title Font
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
                                    Title Weight
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
                                    Subtitle Font
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
                                    Subtitle Weight
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
                                    Title Size
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
                                    Subtitle Size
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
                                    Position (X)
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
                                    Position (Y)
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
                                Banner Type
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
                                  Hero Banner (Slider)
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
                                  Campaign Banner (Bottom)
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
              Banner Image
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
              Upload Image
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
                                  ? "Update Banner"
                                  : "Add Banner"}
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
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h5 className="font-bold text-secondary text-sm">
                           Active Banners ({activeBanners.length})
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
                                        You will be contacted shortly.
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

                      {/* Promo Popup Banner Management */}
                      <div className="mt-8 pt-8 border-t border-gray-100">
                        <h5 className="font-bold text-secondary text-base mb-6 flex items-center gap-2">
                          <ImageIcon size={20} className="text-primary" /> Promotional Popup Banner
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-5">
                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${siteConfig?.promoPopupEnabled ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                                  <Eye size={20} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-900">Popup Banner On/Off</p>
                                  <p className="text-[10px] text-gray-400 font-bold">Keep this enabled to display promotional popup on homepage</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSiteConfig(prev => prev ? {...prev, promoPopupEnabled: !prev.promoPopupEnabled} : null)}
                                className={`w-12 h-6 rounded-full transition-all relative ${siteConfig?.promoPopupEnabled ? 'bg-primary' : 'bg-gray-400'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${siteConfig?.promoPopupEnabled ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                Promo Image URL
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={siteConfig?.promoPopupImage || ""}
                                  onChange={(e) => setSiteConfig(prev => prev ? {...prev, promoPopupImage: e.target.value} : null)}
                                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                  placeholder="e.g. https://example.com/banner.jpg"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = async (e: any) => {
                                      const file = (e.target as HTMLInputElement)?.files?.[0];
                                      if (file) {
                                        try {
                                          toast.loading("Uploading image...");
                                          const url = await handleAdminImageUpload(file);
                                          setSiteConfig(prev => prev ? {...prev, promoPopupImage: url} : null);
                                          toast.dismiss();
                                          toast.success("Image uploaded successfully!");
                                        } catch (err) {
                                          toast.dismiss();
                                          toast.error("Image upload failed.");
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                  className="bg-primary/10 text-primary font-bold px-4 rounded-xl hover:bg-primary/20 transition-all text-xs whitespace-nowrap"
                                >
                                  Upload
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 tracking-widest">
                                Redirect Link (Optional)
                              </label>
                              <input
                                type="text"
                                value={siteConfig?.promoPopupLink || ""}
                                onChange={(e) => setSiteConfig(prev => prev ? {...prev, promoPopupLink: e.target.value} : null)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                placeholder="e.g. /product/product-id-here"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveSiteConfig(siteConfig)}
                              className="w-full bg-secondary hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 text-xs uppercase"
                            >
                              Save Popup Configuration
                            </button>
                          </div>

                          {/* Preview container */}
                          <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-3xl p-6 bg-gray-50/50">
                            <h6 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Popup Preview</h6>
                            {siteConfig?.promoPopupImage ? (
                              <div className="relative w-full max-w-[200px] aspect-[4/5] bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                                <img src={siteConfig.promoPopupImage} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center text-[10px] pointer-events-none">✕</div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 font-bold">Upload an image to see the preview here</p>
                            )}
                          </div>
                        </div>
                      </div>

                      </div>
                    </div>
                    )}
                        {/* Database Management Section Removed to protect user data */}
                        
                        {/* Admin Management Section */}
                    {settingsTab === 'admins' && (
                      <AdminSettingsAdminsTab
                        adminList={adminList}
                        editingAdmin={editingAdmin}
                        setEditingAdmin={setEditingAdmin}
                        newAdminEmail={newAdminEmail}
                        setNewAdminEmail={setNewAdminEmail}
                        newAdminPassword={newAdminPassword}
                        setNewAdminPassword={setNewAdminPassword}
                        newAdminPhone={newAdminPhone}
                        setNewAdminPhone={setNewAdminPhone}
                        newAdminRole={newAdminRole}
                        setNewAdminRole={setNewAdminRole}
                        handleAddAdmin={handleAddAdmin}
                        handleUpdateAdmin={handleUpdateAdmin}
                        handleDeleteAdmin={handleDeleteAdmin}
                      />
                    )}
                    {settingsTab === 'users' && (
                      <AdminSettingsUsersTab
                        userList={userList}
                        setUserList={setUserList}
                        isUsersLoading={isUsersLoading}
                        setIsUsersLoading={setIsUsersLoading}
                        setIsQuotaExceeded={setIsQuotaExceeded}
                        handleEditUserBalance={handleEditUserBalance}
                      />
                    )}
                    {settingsTab === 'marketing' && (
                    <div className="w-full">
                      <MarketingSettings />
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
                          You will be contacted shortly.
                        </p>
                        <p className="text-xs text-yellow-700 leading-relaxed font-medium">
                          After payment, the transaction ID will automatically
                          be set below.
                        </p>
                      </div>
                    </div>
                    )}
                  </div>
                )}
                {adminTab === "users" && (
                  <AdminUsersTab
                    bulkNotifForm={bulkNotifForm}
                    setBulkNotifForm={setBulkNotifForm}
                    handleSendBulkNotification={handleSendBulkNotification}
                    isSendingBulkNotif={isSendingBulkNotif}
                    notifications={notifications}
                    userList={userList}
                    userListSearch={userListSearch}
                    setUserListSearch={setUserListSearch}
                    handleSendDirectNotification={handleSendDirectNotification}
                    handleEditUserBalance={handleEditUserBalance}
                  />
                )}
                </Suspense>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
