
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Ban, Bell, Calendar, Camera, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleDot, Clock, Copy, Download, Edit, Edit2, Edit3, Eye, Gift, Headset, Heart, History, ImageIcon, Landmark, LayoutGrid, LayoutTemplate, List, Loader2, MessageSquare, MessageCircle, MapPin, Mic, MoreVertical, Phone, Plus, PlusCircle, Printer, Receipt, RefreshCcw, Search, Send, Share2, ShieldCheck, ShoppingBag, ShoppingCart, Square, Tag, ThumbsUp, Trash2, TrendingUp, Truck, Upload, User, UserCheck, Users, Wallet, X, XCircle, Settings, Package, RotateCcw, Activity, DollarSign, ArrowUpRight, Percent, Filter, Layers, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import POS from './POS';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc, query, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getProductSlug, getProductPath, formatEnglishDateTime } from '../utils/helpers';

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
    isSavingProduct,
    deletedOrders,
    restoreOrder,
    permanentDeleteOrder,
  } = props;

  const [settingsTab, setSettingsTab] = React.useState("general");
  const [newSubcategoryInputs, setNewSubcategoryInputs] = React.useState<Record<string, string>>({});
  const [reportProductSearch, setReportProductSearch] = React.useState("");
  const [selectedReportProductId, setSelectedReportProductId] = React.useState<string | null>(null);
  const [reportProductPeriod, setReportProductPeriod] = React.useState<"all" | "this_month" | "last_month" | "this_year">("all");

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
                        রকমারি পণ্য হাড়ি
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
                                {d.toLocaleString('en-US', { month: 'long' })} {d.getFullYear()}
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
                        const activeOrders = orderHistory.filter((o: any) => !o.deleted);
                        let filteredForAnalytics = activeOrders;
                        const now = new Date();
                        if (reportTimeframe === "28d") {
                          const cutoff = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = activeOrders.filter((o: any) => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe === "1y") {
                          const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = activeOrders.filter((o: any) => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe === "3y") {
                          const cutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
                          filteredForAnalytics = activeOrders.filter((o: any) => {
                            if (!o.createdAt) return false;
                            const t = typeof o.createdAt === 'string' ? new Date(o.createdAt).getTime() : (o.createdAt.seconds ? o.createdAt.seconds * 1000 : 0);
                            return t >= cutoff.getTime();
                          });
                        } else if (reportTimeframe.startsWith("month_")) {
                          const parts = reportTimeframe.split("_");
                          const targetMonth = parseInt(parts[1]);
                          const targetYear = parseInt(parts[2]);
                          filteredForAnalytics = activeOrders.filter((o: any) => {
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
                                <Download size={14} /> Today's Report
                              </button>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('weekly');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={14} /> Last 7 Days Report
                              </button>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('monthly');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Download size={14} /> Last 30 Days Report
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  exportOrdersToCSV('all');
                                  setIsExportDropdownOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2"
                              >
                                <Landmark size={14} /> Export All Orders
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
                                                  <MessageSquare size={14} /> Send SMS
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
                                              const endPart = (siteConfig?.smsTemplateEnd || '').trim() || 'Thank you for choosing Rokomari Ponno Hari';
                                              if (startPart.includes('') && order.customerName) {
                                                startPart = startPart.replace('', order.customerName);
                                              }
                                              let productDetails = '';
                                              if (order.items && order.items.length > 0) {
                                                productDetails = order.items.map((item: any) => {
                                                  const directSms = (item.smsName || item.product?.smsName || '').trim();
                                                  const name = directSms ? directSms : ((item.product?.name || item.name || 'Product').trim().length > 25 ? (item.product?.name || item.name || 'Product').trim().substring(0, 25) + '...' : (item.product?.name || item.name || 'Product').trim());
                                                  const qty = item.quantity || 1;
                                                  return `${name} (${qty} pcs)`;
                                                }).join('\n');
                                              }
                                              const defaultMessage = `${startPart}\nProducts:\n${productDetails}\nOrder No: #${orderId}\nTotal Bill: ৳${order.total}\n${endPart}`;
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <ShoppingCart className="text-red-500" size={24} /> Incomplete Orders (Abandoned Carts)
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Customers who added items to cart or entered contact details but abandoned checkout.
                        </p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-200 flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-gray-500 font-bold">Total Incomplete:</span>
                        <span className="text-lg font-black text-red-600">{incompleteOrders.length}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
                      {incompleteOrders.length === 0 ? (
                        <div className="p-16 text-center text-gray-400">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <ShoppingCart className="text-gray-300" size={32} />
                          </div>
                          <h3 className="text-base font-bold text-gray-600">No Incomplete Orders</h3>
                          <p className="text-xs text-gray-400 mt-1">When someone adds items to cart or enters their contact, they will appear here instantly.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                                <th className="p-4">Customer & Mobile</th>
                                <th className="p-4">Cart Items</th>
                                <th className="p-4">Source (Step)</th>
                                <th className="p-4 text-right">Total Amount</th>
                                <th className="p-4">Date & Time</th>
                                <th className="p-4 text-center">Contact & Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {incompleteOrders.map((order: any) => {
                                const rawPhone = (order.phone || order.customerPhone || "").trim();
                                const hasRealPhone = rawPhone && !rawPhone.includes("কার্টে") && !rawPhone.includes("Cart") && rawPhone.length >= 6;
                                const cleanDigits = rawPhone.replace(/\D/g, '');
                                const waPhone = cleanDigits.startsWith('88') ? cleanDigits : (cleanDigits.startsWith('01') ? '88' + cleanDigits : cleanDigits);
                                const totalAmt = order.totalAmount || order.items?.reduce((sum: number, it: any) => sum + ((it.price || 0) * (it.quantity || 1)), 0) || 0;

                                return (
                                  <tr key={order.id} className="hover:bg-red-50/20 transition-colors">
                                    <td className="p-4">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-gray-900 text-sm">
                                          {order.name && order.name !== "অজ্ঞাত কাস্টমার" && order.name !== "অজ্ঞাত ক্রেতা" ? order.name : (hasRealPhone ? "Customer (Unnamed)" : "Guest Shopper")}
                                        </span>
                                        {hasRealPhone ? (
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-emerald-700 font-mono font-black text-sm bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 select-all">
                                              {rawPhone}
                                            </span>
                                            <button
                                              onClick={() => {
                                                navigator.clipboard.writeText(rawPhone);
                                                toast.success("Phone number copied!");
                                              }}
                                              className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100"
                                              title="Copy Phone Number"
                                            >
                                              <Copy size={13} />
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-gray-400 text-xs italic">
                                            Items in cart (No phone provided)
                                          </span>
                                        )}
                                        {(order.district || order.thana || order.address) && (
                                          <span className="text-[11px] text-gray-500 mt-1 max-w-xs truncate">
                                            📍 {[order.address, order.thana, order.district].filter(Boolean).join(", ")}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-4 max-w-xs">
                                      <div className="space-y-1.5">
                                        {order.items?.map((item: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-2.5 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100">
                                            {item.image ? (
                                              <img loading="lazy" src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-white shrink-0 border border-gray-200" />
                                            ) : (
                                              <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                                <Package size={16} className="text-gray-400" />
                                              </div>
                                            )}
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                              <p className="text-[11px] text-gray-500">
                                                <span className="text-purple-700 font-bold">৳{item.price}</span> × {item.quantity || 1}
                                                {(item.color || item.size) && (
                                                  <span className="text-gray-400 ml-1">({[item.color, item.size].filter(Boolean).join(", ")})</span>
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        order.type === 'cart_checkout' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : order.type === 'inline_checkout'
                                          ? 'bg-purple-100 text-purple-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}>
                                        {order.type === 'cart_checkout' ? 'Cart Checkout' : order.type === 'inline_checkout' ? 'Product Page' : 'Landing Page'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <span className="font-black text-sm text-gray-900">
                                        ৳{Number(totalAmt).toLocaleString()}
                                      </span>
                                    </td>
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                      {formatEnglishDateTime(order.date || order.updatedAt || order.createdAt)}
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                        {hasRealPhone ? (
                                          <>
                                            {/* Direct Phone Call Button */}
                                            <a 
                                              href={`tel:${cleanDigits}`}
                                              className="inline-flex items-center justify-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs shadow-emerald-600/20 active:scale-95"
                                              title="Call Directly"
                                            >
                                              <Phone size={13} /> Call
                                            </a>

                                            {/* WhatsApp Chat Button */}
                                            <a 
                                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${order.name && order.name !== "অজ্ঞাত ক্রেতা" ? order.name : ""}! We noticed you added items to your cart at Rokomari Ponno Hari. Can we assist you with completing your order?`)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center justify-center gap-1 bg-green-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-green-600 transition-all shadow-xs shadow-green-500/20 active:scale-95"
                                              title="Message on WhatsApp"
                                            >
                                              <MessageSquare size={13} /> WA
                                            </a>

                                            {/* SMS Dropdown */}
                                            <div className="relative">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setIndividualSmsOrder(individualSmsOrder?.id === order.id ? null : order);
                                                  setIndividualSmsMessage(`Dear customer, your cart items at Rokomari Ponno Hari are waiting! Complete your order now: https://www.rokomariponnohari.com Thank you!`);
                                                }}
                                                className={`inline-flex items-center justify-center gap-1 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${individualSmsOrder?.id === order.id ? 'bg-purple-600 shadow-purple-600/20' : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'}`}
                                                title="Send SMS"
                                              >
                                                <Send size={13} /> SMS
                                              </button>
                                              
                                              <AnimatePresence>
                                                {individualSmsOrder?.id === order.id && (
                                                  <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute top-[120%] right-0 bg-white rounded-2xl w-80 shadow-2xl border border-gray-200 z-[200] origin-top-right cursor-default text-left p-4"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                                      <p className="text-xs text-gray-500 font-medium">Recipient: <span className="font-bold text-gray-800 font-mono">{rawPhone}</span></p>
                                                      <button onClick={() => setIndividualSmsOrder(null)} className="text-gray-400 hover:text-red-500 p-1">
                                                        <X size={15} />
                                                      </button>
                                                    </div>
                                                    <textarea
                                                      value={individualSmsMessage}
                                                      onChange={(e) => setIndividualSmsMessage(e.target.value)}
                                                      placeholder="Type SMS message..."
                                                      rows={3}
                                                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-3 font-medium outline-none"
                                                    />
                                                    <button
                                                      onClick={handleSendIndividualSms}
                                                      disabled={isSendingIndividualSms || !individualSmsMessage.trim()}
                                                      className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-purple-700 disabled:opacity-50 transition-all active:scale-95 w-full shadow-md shadow-purple-600/20"
                                                    >
                                                      {isSendingIndividualSms ? "Sending..." : (
                                                        <>
                                                          <Send size={13} /> Send SMS
                                                        </>
                                                      )}
                                                    </button>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          </>
                                        ) : (
                                          <span className="text-[11px] text-gray-400 italic">No phone</span>
                                        )}

                                        {/* Delete from Incomplete List */}
                                        <button
                                          onClick={async () => {
                                            if (window.confirm("Are you sure you want to delete this incomplete record?")) {
                                              try {
                                                await deleteDoc(doc(db, "incomplete_orders", order.id));
                                                toast.success("Incomplete order deleted.");
                                              } catch (err: any) {
                                                toast.error("Failed to delete: " + err.message);
                                              }
                                            }
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                          title="Delete Record"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
                              ? "Edit Product"
                              : "Add New Product"}
                          </h4>
                          {editingProduct && (
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="text-[10px] font-bold text-primary hover:underline"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        <form onSubmit={saveProduct} className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 no-scrollbar">

                          {/* ━━━ Step 1: Name & Code ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                              <span className="text-sm font-bold text-gray-700">Product Name & Code</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div id="field-name">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                  <span>Product Full Name</span>
                                  {productFormErrors.name ? <span className="text-red-500 normal-case font-normal">Name is required</span> : <span className="text-red-400 normal-case font-normal">* Required</span>}
                                </label>
                                <input
                                  type="text"
                                  value={editingProduct?.name || ""}
                                  onChange={(e) => {
                                    setEditingProduct({ ...(editingProduct || {}), name: e.target.value } as any);
                                    if (productFormErrors.name) setProductFormErrors((prev) => ({ ...prev, name: false }));
                                  }}
                                  className={`w-full bg-gray-50 border ${productFormErrors.name ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"} rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-semibold transition-all`}
                                  placeholder="e.g., Samsung Galaxy A55 5G (8GB/128GB)"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div id="field-code">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                    <span>Product Code</span>
                                    <span className="text-red-400 normal-case font-normal">* Required</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={editingProduct?.code || ""}
                                    onChange={(e) => {
                                      setEditingProduct({ ...(editingProduct || {}), code: e.target.value } as any);
                                      if (productFormErrors.code) setProductFormErrors((prev) => ({ ...prev, code: false }));
                                    }}
                                    className={`w-full bg-gray-50 border ${productFormErrors.code ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"} rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all`}
                                    placeholder="e.g., SAM-A55"
                                  />
                                  <p className="text-[9px] text-gray-400 mt-1">Used for searching</p>
                                </div>
                                <div id="field-sms-name">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">SMS Name <span className="text-gray-400 normal-case font-normal">(Optional)</span></label>
                                  <input
                                    type="text"
                                    value={editingProduct?.smsName || ""}
                                    onChange={(e) => setEditingProduct({ ...(editingProduct || {}), smsName: e.target.value } as any)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all"
                                    placeholder="e.g., Galaxy A55"
                                  />
                                  <p className="text-[9px] text-gray-400 mt-1">Short name for SMS</p>
                                </div>
                              </div>

                              <div id="field-slug" className="pt-2 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase">
                                    SEO URL Slug <span className="text-gray-400 normal-case font-normal">(Optional / Auto-generated)</span>
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  value={editingProduct?.slug || ""}
                                  onChange={(e) => setEditingProduct({ ...(editingProduct || {}), slug: e.target.value } as any)}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-xs font-mono font-semibold transition-all"
                                  placeholder="e.g., samsung-galaxy-a55-5g"
                                />
                                {editingProduct && (
                                  <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-blue-700 font-mono">
                                      <span className="shrink-0 font-bold">🌐 Short URL:</span>
                                      <span className="truncate">{getProductPath(editingProduct)}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url = `${window.location.origin}${getProductPath(editingProduct)}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Short Product URL copied to clipboard!");
                                      }}
                                      className="shrink-0 text-[10px] font-bold bg-white hover:bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs transition-all"
                                    >
                                      Copy URL
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 2: Price & Stock ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                              <span className="text-sm font-bold text-gray-700">Price & Stock</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className={`grid gap-3 ${isMasterAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
                                {isMasterAdmin && (
                                  <div>
                                    <label className="block text-[11px] font-bold text-indigo-500 uppercase mb-1">Buying Price 🔒</label>
                                    <input
                                      type="number"
                                      value={editingProduct?.buyingPrice || ""}
                                      onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), buyingPrice: Number(e.target.value) }))}
                                      className="w-full bg-indigo-50 border border-indigo-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-indigo-300 text-sm font-bold text-indigo-900 transition-all"
                                      placeholder="0"
                                    />
                                  </div>
                                )}
                                <div id="field-price">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                    <span>Selling Price <span className="text-red-400">*</span></span>
                                    {productFormErrors.price && <span className="text-red-500 normal-case font-normal">Price required</span>}
                                  </label>
                                  <input
                                    type="number"
                                    value={editingProduct?.price || ""}
                                    onChange={(e) => {
                                      setEditingProduct((prev) => ({ ...(prev || {}), price: Number(e.target.value) }));
                                      if (productFormErrors.price) setProductFormErrors((prev) => ({ ...prev, price: false }));
                                    }}
                                    className={`w-full bg-gray-50 border ${productFormErrors.price ? "border-red-400 ring-2 ring-red-400/20" : "border-gray-200"} rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm font-bold transition-all`}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Old Price <span className="text-gray-400 font-normal normal-case">(For discount)</span></label>
                                  <input
                                    type="number"
                                    value={editingProduct?.originalPrice || ""}
                                    onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), originalPrice: Number(e.target.value) }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Weight</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editingProduct?.weight || ""}
                                    onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), weight: e.target.value === "" ? 0 : Number(e.target.value) }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                                    placeholder="1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Unit</label>
                                  <select
                                    value={editingProduct?.unit || "piece"}
                                    onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), unit: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all cursor-pointer"
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
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Stock</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={editingProduct?.stock === undefined || editingProduct?.stock === null ? "" : editingProduct.stock}
                                      onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), stock: e.target.value === "" ? 0 : Number(e.target.value) }))}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all"
                                      placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                                      {(() => { switch (editingProduct?.unit) { case "kg": return "Kg"; case "gm": return "Gm"; case "liter": return "Ltr"; case "ml": return "Ml"; case "packet": return "Pkt"; case "box": return "Box"; case "set": return "Set"; default: return "Pcs"; } })()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 3: Images ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                              <span className="text-sm font-bold text-gray-700">Images</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div id="field-image">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                  <span>Main Image</span>
                                  {productFormErrors.image ? <span className="text-red-500 normal-case font-normal">Image is required</span> : <span className="text-red-400 normal-case font-normal">* Required</span>}
                                </label>
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={editingProduct?.image || ""}
                                    onChange={(e) => {
                                      setEditingProduct((prev) => ({ ...(prev || {}), image: e.target.value }));
                                      if (productFormErrors.image) setProductFormErrors((prev) => ({ ...prev, image: false }));
                                    }}
                                    className={`w-full bg-gray-50 border ${productFormErrors.image ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"} rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs transition-all`}
                                    placeholder="Paste image link (https://...)"
                                  />
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px bg-gray-100" />
                                    <span className="text-[10px] text-gray-400 font-bold">OR</span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                  </div>
                                  <input key={editingProduct?.image || "empty"} type="file" accept="image/*" onChange={(e) => { handleAdminImageUpload(e); if (productFormErrors.image) setProductFormErrors((prev) => ({ ...prev, image: false })); }} className="hidden" id="adminImageUpload" />
                                  <label htmlFor="adminImageUpload" className="w-full bg-gray-50 text-gray-600 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 hover:border-primary/30 hover:bg-red-50/30 transition-all">
                                    <Upload size={14} /> Upload image from computer
                                  </label>
                                  {editingProduct?.image && (
                                    <div className="relative w-20 h-20 group">
                                      <img loading="lazy" src={editingProduct.image} className="w-20 h-20 rounded-xl object-cover border border-gray-200" alt="Preview" />
                                      <button type="button" onClick={() => setEditingProduct((prev) => ({ ...(prev || {}), image: "" }))} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full shadow">
                                        <X size={10} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Additional Images <span className="text-gray-400 font-normal normal-case">(Gallery)</span></label>
                                <div className="grid grid-cols-5 gap-2">
                                  {editingProduct?.images?.map((img, idx) => (
                                    <div key={idx} className="relative group aspect-square">
                                      <img loading="lazy" src={img} className="w-full h-full object-cover rounded-lg border border-gray-100" />
                                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full shadow">
                                        <X size={9} />
                                      </button>
                                    </div>
                                  ))}
                                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-red-50/20 transition-all">
                                    <PlusCircle size={18} className="text-gray-300" />
                                    <span className="text-[8px] font-bold text-gray-300 mt-0.5">Add</span>
                                    <input key={editingProduct?.images?.length || 0} type="file" multiple accept="image/*" className="hidden" onChange={handleAdminMultiImageUpload} />
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 4: Category & Tags ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">4</span>
                              <span className="text-sm font-bold text-gray-700">Category & Tags</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div id="field-category">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 flex justify-between items-center">
                                  <span>Category</span>
                                  {productFormErrors.category ? <span className="text-red-500 normal-case font-normal">Select Category</span> : <span className="text-red-400 normal-case font-normal">* Required</span>}
                                </label>
                                <div className="relative">
                                  <select
                                    value={editingProduct?.category || ""}
                                    onChange={(e) => { setEditingProduct((prev) => ({ ...(prev || {}), category: e.target.value, subcategory: "" })); if (productFormErrors.category) setProductFormErrors((prev) => ({ ...prev, category: false })); }}
                                    className={`appearance-none w-full bg-gray-50 border ${productFormErrors.category ? "border-red-400 ring-1 ring-red-400" : "border-gray-200"} rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer`}
                                  >
                                    <option value="">— Select Category —</option>
                                    {categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                                  </select>
                                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                              </div>
                              {(() => {
                                const selCatObj = categories.find(c => c.name === editingProduct?.category);
                                const subcats = selCatObj?.subcategories || [];
                                if (subcats.length === 0) return null;
                                return (
                                  <div id="field-subcategory">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Sub-Category</label>
                                    <div className="relative">
                                      <select
                                        value={editingProduct?.subcategory || ""}
                                        onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), subcategory: e.target.value }))}
                                        className="appearance-none w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-10 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold cursor-pointer"
                                      >
                                        <option value="">— Select Sub-Category —</option>
                                        {subcats.map((sub, idx) => (<option key={idx} value={sub}>{sub}</option>))}
                                      </select>
                                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                  </div>
                                );
                              })()}
                              <div id="field-tags">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Search Tags <span className="text-gray-400 font-normal normal-case">(For Google & Site Search)</span></label>
                                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[46px] flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                  {(editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag, idx) => (
                                    <span key={idx} className="flex items-center gap-1 bg-gray-800 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-lg">
                                      {tag}
                                      <button type="button" onClick={() => { const arr = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []; setEditingProduct((prev: any) => ({ ...(prev || {}), tags: arr.filter((_, i) => i !== idx).join(', ') })); }} className="hover:text-white transition-colors"><X size={12} /></button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    className="flex-1 bg-transparent outline-none text-sm min-w-[120px] px-1 py-0.5 font-medium text-gray-700"
                                    placeholder={(!editingProduct?.tags || editingProduct.tags.trim() === '') ? "e.g., smartwatch, watch — Press Enter or comma to add" : "More tags..."}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); const val = e.currentTarget.value; if (val.trim()) { const arr = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []; const combined = Array.from(new Set([...arr, ...val.split(',').map(t => t.trim()).filter(Boolean)])).join(', '); setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined })); e.currentTarget.value = ''; } } }}
                                    onBlur={(e) => { const val = e.currentTarget.value; if (val.trim()) { const arr = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []; const combined = Array.from(new Set([...arr, ...val.split(',').map(t => t.trim()).filter(Boolean)])).join(', '); setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined })); e.currentTarget.value = ''; } }}
                                    onPaste={(e) => { e.preventDefault(); const paste = e.clipboardData.getData('text'); if (paste.trim()) { const arr = editingProduct?.tags ? editingProduct.tags.split(',').map(t => t.trim()).filter(Boolean) : []; const combined = Array.from(new Set([...arr, ...paste.split(',').map(t => t.trim()).filter(Boolean)])).join(', '); setEditingProduct((prev: any) => ({ ...(prev || {}), tags: combined })); } }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 5: Size & Color ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">5</span>
                                <span className="text-sm font-bold text-gray-700">Size & Color (Variants)</span>
                              </div>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Optional</span>
                            </div>
                            <div className="p-4">
                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                                <p className="text-[11px] font-bold text-blue-600 mb-1">📌 Instructions:</p>
                                <p className="text-[11px] text-blue-500">• If no size, enter <strong>"Free"</strong> in Size</p>
                                <p className="text-[11px] text-blue-500">• Provide separate stock (Quantity) for each variant</p>
                              </div>
                              <div className="space-y-3">
                                {editingProduct?.variants?.map((variant, idx) => (
                                  <div key={variant.id || idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 relative group hover:border-gray-300 transition-all">
                                    <div className="flex gap-3 items-start">
                                      <div className="w-14 h-14 flex-shrink-0 relative">
                                        {variant.image ? (
                                          <img loading="lazy" src={variant.image} className="w-14 h-14 rounded-xl object-cover border border-gray-200" alt="Variant" />
                                        ) : (
                                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 bg-white"><ImageIcon size={18} /></div>
                                        )}
                                        <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 rounded-xl transition-all">
                                          <Upload size={12} className="text-white" />
                                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantImageUpload(e, idx)} />
                                        </label>
                                      </div>
                                      <div className="flex-1 grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-[9px] font-bold text-gray-400 uppercase">Color</label>
                                          <input type="text" value={variant.name} onChange={(e) => { const val = e.target.value; setEditingProduct((prev: any) => { const nv = [...(prev?.variants || [])]; if (nv[idx]) nv[idx] = { ...nv[idx], name: val }; return { ...prev, variants: nv }; }); }} placeholder="Red" className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary mt-0.5" />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-bold text-primary uppercase">Size *</label>
                                          <input type="text" value={variant.size || ""} onChange={(e) => { const val = e.target.value; setEditingProduct((prev: any) => { const nv = [...(prev?.variants || [])]; if (nv[idx]) nv[idx] = { ...nv[idx], size: val }; return { ...prev, variants: nv }; }); }} placeholder="XL / Free" className="w-full bg-red-50 border border-primary/20 rounded-lg py-1.5 px-2 text-xs font-bold text-primary outline-none focus:ring-1 focus:ring-primary mt-0.5" />
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-bold text-emerald-600 uppercase">Stock (Qty)</label>
                                          <input type="number" value={variant.stock === undefined || variant.stock === null ? "" : variant.stock} onChange={(e) => { const val = e.target.value === "" ? 0 : parseInt(e.target.value); setEditingProduct((prev: any) => { if (!prev) return prev; const nv = [...(prev.variants || [])]; if (nv[idx]) nv[idx] = { ...nv[idx], stock: val }; return { ...prev, variants: nv }; }); }} placeholder="0" className="w-full bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-2 text-xs font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-500 mt-0.5" />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                      <div className="flex gap-1">
                                        {["S","M","L","XL","XXL"].map(s => (
                                          <button key={s} type="button" onClick={() => setEditingProduct((prev: any) => { const nv = [...(prev?.variants || [])]; if (nv[idx]) nv[idx] = { ...nv[idx], size: s }; return { ...prev, variants: nv }; })} className={`text-[8px] px-1.5 py-0.5 rounded border font-bold transition-all ${variant.size === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary/30'}`}>{s}</button>
                                        ))}
                                      </div>
                                      <div className="flex gap-1.5">
                                        <button type="button" onClick={() => setEditingProduct((prev: any) => { if (!prev) return prev; const nv = [...(prev.variants || [])]; const toClone = nv[idx]; if (toClone) nv.push({ ...toClone, id: Math.random().toString(36).substring(2, 9) }); return { ...prev, variants: nv }; })} className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all" title="Action"><Copy size={11} /></button>
                                        <button type="button" onClick={() => removeVariant(idx)} className="p-1 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all"><X size={11} /></button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <button type="button" onClick={addVariant} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary hover:bg-red-50/20 transition-all">
                                  <Plus size={16} /> Add New Size or Color Variant
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 6: Product Details & Specifications ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">6</span>
                                <span className="text-sm font-bold text-gray-700">Product Specifications & Details</span>
                              </div>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">Optional</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Brand / উৎস</label>
                                  <input type="text" value={editingProduct?.brand || ""} onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), brand: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all" placeholder="রকমারি পণ্য হাড়ি, সুন্দরবন, যশোর..." />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">প্যাকেজিং (In the Box / Pack)</label>
                                  <input type="text" value={editingProduct?.inTheBox || ""} onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), inTheBox: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all" placeholder="১টি কাঁচের বয়াম / ১টি ক্যারেট / বোতল..." />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                                  {adminKeys?.geminiApiKey && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const name = editingProduct?.name;
                                        if (!name) {
                                          toast.error("Please enter a product name first!");
                                          return;
                                        }
                                        try {
                                          toast.loading("Generating AI description...");
                                          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${adminKeys.geminiApiKey}`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              contents: [{
                                                role: "user",
                                                parts: [{ text: `Write an engaging product description for a product named "${name}". Highlight its features and make it appealing. Format nicely in English.` }]
                                              }]
                                            })
                                          });
                                          const data = await response.json();
                                          const desc = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                                          if (desc) {
                                            setEditingProduct((prev) => prev ? { ...prev, description: desc } : null);
                                            toast.dismiss();
                                            toast.success("Description generated successfully!");
                                          } else {
                                            toast.dismiss();
                                            toast.error("Failed to generate description with Gemini.");
                                          }
                                        } catch (err) {
                                          toast.dismiss();
                                          toast.error("Server is not responding.");
                                        }
                                      }}
                                      className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 active:scale-95 border border-indigo-100 font-sans"
                                    >
                                      <Activity size={10} /> Generate AI Description
                                    </button>
                                  )}
                                </div>
                                <textarea value={editingProduct?.description || ""} onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), description: e.target.value }))} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium no-scrollbar transition-all resize-none" placeholder="Write detailed product description here..." />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Key Features <span className="text-gray-400 font-normal normal-case">— One per line</span></label>
                                <textarea value={editingProduct?.features || ""} onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), features: e.target.value }))} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs font-medium no-scrollbar leading-relaxed transition-all resize-none" placeholder={"১০০% খাঁটি ও অপরিশোধিত\nকোনো ক্ষতিকর কেমিক্যাল বা প্রিজারভেটিভ নেই\nপ্রাকৃতিক ও পুষ্টিকর উপাদান সমৃদ্ধ"} />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">YouTube Video URL</label>
                                <input type="text" value={editingProduct?.videoUrl || ""} onChange={(e) => setEditingProduct((prev) => ({ ...(prev || {}), videoUrl: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-xs transition-all" placeholder="https://youtube.com/watch?v=..." />
                              </div>
                            </div>
                          </div>

                          {/* ━━━ Step 7: Publishing Options ━━━ */}
                          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                              <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">7</span>
                              <span className="text-sm font-bold text-gray-700">Publishing Options</span>
                            </div>
                            <div className="p-3 space-y-1">
                              <label htmlFor="isPublishedCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                                <input type="checkbox" id="isPublishedCheck" checked={editingProduct?.isPublished !== false} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isPublished: e.target.checked } as any)} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">✅ Published — Visible on website</span>
                              </label>
                              <label htmlFor="isTrendingCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                                <input type="checkbox" id="isTrendingCheck" checked={editingProduct?.isTrending || false} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isTrending: e.target.checked } as any)} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">🔥 Show in Trending Section</span>
                              </label>
                              <label htmlFor="isFreeDeliveryCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                                <input type="checkbox" id="isFreeDeliveryCheck" checked={editingProduct?.isFreeDelivery || false} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isFreeDelivery: e.target.checked } as any)} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">🚚 Free Delivery</span>
                              </label>
                              <label htmlFor="isComingSoonCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                                <input type="checkbox" id="isComingSoonCheck" checked={editingProduct?.isComingSoon || false} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isComingSoon: e.target.checked } as any)} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">⏳ Coming Soon (Pre-Order)</span>
                              </label>
                              <label htmlFor="isFlashSaleCheck" className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all">
                                <input type="checkbox" id="isFlashSaleCheck" checked={editingProduct?.isFlashSale || false} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), isFlashSale: e.target.checked } as any)} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">⚡ Flash Sale</span>
                              </label>
                              {editingProduct?.isFlashSale && (
                                <div className="px-3 pb-1">
                                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Flash Sale End Time</label>
                                  <input type="datetime-local" value={editingProduct.flashSaleEndDate || ""} onChange={(e) => setEditingProduct({ ...(editingProduct || {}), flashSaleEndDate: e.target.value } as any)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm font-bold transition-all" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ━━━ সেভ বাটন ━━━ */}
                          <div className="flex gap-2 pb-4">
                            <button type="submit" className="flex-1 bg-primary text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-red-700 active:scale-95 transition-all text-sm">
                              {editingProduct?.id ? "✏️ Update Product" : "✅ Save Product"}
                            </button>
                            {editingProduct && (
                              <button type="button" onClick={() => setEditingProduct(null)} className="bg-gray-100 text-gray-500 px-5 rounded-2xl hover:bg-gray-200 transition-all font-bold text-sm">
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>

                      </div>
                    </div>
                    {/* Products Table */}
                    <div className="lg:col-span-7">
                      <div className="bg-white rounded-3xl border border-gray-100 overflow-x-auto no-scrollbar shadow-sm min-h-[350px] pb-24 lg:overflow-visible">
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
                                    <div className="flex flex-col gap-1">
                                      <div className="flex flex-wrap gap-1">
                                        {p.variants.map((v, i) => (
                                          <span
                                            key={i}
                                            className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${Number(v.stock || 0) <= 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                                          >
                                            {v.name}: {v.stock || 0}
                                          </span>
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-extrabold text-emerald-700">
                                        Total: {getEffectiveStock(p)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span
                                      className={`text-[9px] px-1.5 py-[2px] rounded-full font-bold border ${getEffectiveStock(p) <= 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}
                                    >
                                      Stock: {getEffectiveStock(p)}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2 items-center">
                                     <button
                                       type="button"
                                       onClick={() => togglePublishStatus(p)}
                                       title={p.isPublished !== false ? "Published (Live)" : "Unpublished (Hidden)"}
                                       className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mr-2 ${
                                         p.isPublished !== false ? "bg-green-500" : "bg-gray-300"
                                       }`}
                                     >
                                       <span
                                         className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                           p.isPublished !== false ? "translate-x-4" : "translate-x-0"
                                         }`}
                                       />
                                     </button>
                                    
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
                                            onClick={() => {
                                              setEditingProduct({
                                                ...p,
                                                variants: p.variants || [],
                                              });
                                              setActiveProductDropdown(null);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                                          >
                                            <Edit3 size={16} className="text-primary" />
                                            <span>Edit Details</span>
                                          </button>
                                          <button
                                            onClick={() => { copyLandingPageLink(p.id); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                                          >
                                            <Share2 size={16} className="text-gray-400" />
                                            <span>Copy Link</span>
                                          </button>
                                          <button
                                            onClick={() => { handleDuplicateProduct(p); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                                          >
                                            <Copy size={16} className="text-gray-400" />
                                            <span>Duplicate</span>
                                          </button>
                                          <button
                                            onClick={() => { openLandingEditor(p); setActiveProductDropdown(null); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 border-t border-gray-50"
                                          >
                                            <LayoutTemplate size={16} className="text-gray-400" />
                                            <span>Landing Page</span>
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
                  <div className="w-full space-y-6">
                    {/* Top Action Card - Full Width */}
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                            <LayoutGrid size={22} />
                          </div>
                          <div>
                            <h4 className="text-lg md:text-xl font-black text-secondary">
                              {editingCategory?.id ? `ক্যাটাগরি সম্পাদনা: "${editingCategory.name}"` : "ক্যাটাগরি তালিকা ও নতুন যোগ"}
                            </h4>
                            <p className="text-xs text-gray-500 font-bold">
                              মোট ক্যাটাগরি: <span className="text-primary font-black">{categories.length}</span> টি
                            </p>
                          </div>
                        </div>
                        {editingCategory?.id && (
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
                          >
                            বাতিল করুন (Cancel)
                          </button>
                        )}
                      </div>
                      <form onSubmit={saveCategory} className="flex flex-col sm:flex-row gap-3">
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
                          className="flex-1 bg-gray-50/80 border border-gray-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-2 focus:ring-primary focus:bg-white font-bold text-sm transition-all"
                          placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: খাঁটি মধু, গাওয়া ঘি, তেল)..."
                        />
                        <button 
                          type="submit" 
                          className="bg-primary text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/20 hover:brightness-105 transition-all active:scale-95 text-sm cursor-pointer whitespace-nowrap"
                        >
                          {editingCategory?.id ? "Update Category" : "+ Add Category"}
                        </button>
                      </form>
                    </div>

                    {/* Category Cards - Full Page Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                      {categories.map((cat) => {
                        const subcats = cat.subcategories || [];
                        const isEditingThis = editingCategory?.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            className={`bg-white p-5 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md ${
                              isEditingThis ? "border-primary ring-2 ring-primary/20" : "border-gray-150"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-secondary text-base truncate" title={cat.name}>
                                    {cat.name}
                                  </p>
                                  <span className="text-[10px] text-gray-400 font-bold">
                                    {subcats.length} টি সাব-ক্যাটাগরি
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => copyCategoryLink(cat.name)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 cursor-pointer"
                                    title="ক্যাটাগরি লিংক কপি করুন"
                                  >
                                    <Share2 size={13} />  
                                  </button>
                                  <button
                                    onClick={() => setEditingCategory(cat)}
                                    className="text-xs font-bold text-gray-600 hover:text-primary transition-colors px-2.5 py-1.5 hover:bg-gray-100 rounded-xl cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      await deleteCategory(cat.id, cat.name);
                                    }}
                                    disabled={deletingCatId === String(cat.id)}
                                    className={`text-xs font-bold transition-all px-2.5 py-1.5 rounded-xl cursor-pointer ${
                                      deletingCatId === String(cat.id)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "text-red-500 hover:bg-red-50 active:scale-95 hover:border-red-100"
                                    }`}
                                  >
                                    {deletingCatId === String(cat.id) ? "..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Subcategories Section */}
                              <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                                  Subcategories
                                </div>
                                <div className="flex flex-wrap gap-1.5 min-h-[32px] mb-2.5">
                                  {subcats.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">No subcategories</span>
                                  ) : (
                                    subcats.map((sub, sIdx) => (
                                      <span key={sIdx} className="inline-flex items-center gap-1.5 bg-white border border-gray-200/80 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-2xs">
                                        <span>{sub}</span>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            try {
                                              await setDoc(doc(db, "categories", String(cat.id)), {
                                                subcategories: arrayRemove(sub)
                                              }, { merge: true });
                                              toast.success(`"${sub}" সাব-ক্যাটাগরি রিমুভ করা হয়েছে`);
                                            } catch (err: any) {
                                              console.error("Remove subcategory error:", err);
                                              toast.error("সাব-ক্যাটাগরি রিমুভ করতে সমস্যা হয়েছে");
                                            }
                                          }}
                                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                        >
                                          <X size={12} />
                                        </button>
                                      </span>
                                    ))
                                  )}
                                </div>
                                
                                <div className="flex gap-1.5">
                                  <input
                                    type="text"
                                    value={newSubcategoryInputs[cat.id] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: val }));
                                    }}
                                    placeholder="Add subcategory..."
                                    className="flex-1 bg-white border border-gray-200 transition-colors focus:border-primary text-xs font-bold px-3 py-1.5 rounded-xl outline-none"
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const subName = (newSubcategoryInputs[cat.id] || "").trim();
                                        if (subName) {
                                          try {
                                            await setDoc(doc(db, "categories", String(cat.id)), {
                                              subcategories: arrayUnion(subName)
                                            }, { merge: true });
                                            setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: "" }));
                                            toast.success(`"${subName}" সাব-ক্যাটাগরি যোগ করা হয়েছে`);
                                          } catch (err: any) {
                                            console.error("Add subcategory error:", err);
                                            toast.error("সাব-ক্যাটাগরি যোগ করতে সমস্যা হয়েছে");
                                          }
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const subName = (newSubcategoryInputs[cat.id] || "").trim();
                                      if (subName) {
                                        try {
                                          await setDoc(doc(db, "categories", String(cat.id)), {
                                            subcategories: arrayUnion(subName)
                                          }, { merge: true });
                                          setNewSubcategoryInputs(prev => ({ ...prev, [cat.id]: "" }));
                                          toast.success(`"${subName}" সাব-ক্যাটাগরি যোগ করা হয়েছে`);
                                        } catch (err: any) {
                                          console.error("Add subcategory error:", err);
                                          toast.error("সাব-ক্যাটাগরি যোগ করতে সমস্যা হয়েছে");
                                        }
                                      }
                                    }}
                                    className="bg-primary hover:brightness-105 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                         No conversations found
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
                          <h4 className="text-xl font-bold text-secondary mb-2">Admin Support</h4>
                          <p className="text-sm font-medium leading-relaxed max-w-xs">
                           Select a conversation from the list on the left to view messages and reply.
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
                             <h4 className="text-xl font-bold text-secondary">Refund Requests</h4>
                             <p className="text-xs text-gray-400 font-bold">Customer refund requests will be shown here</p>
                          </div>
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center gap-2 font-bold text-xs">
                             <Clock size={16} /> Pending: {refundRequests.filter(r => r.status === "pending").length}
                          </div>
                       </div>
                       <div className="grid gap-4">
                          {refundRequests.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                               <RefreshCcw size={48} className="mx-auto mb-4 text-gray-100" />
                               <p className="text-sm text-gray-400">No refund requests yet</p>
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
                                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1">Refund Reason:</p>
                                        <p className="text-sm font-bold text-secondary italic">"{refund.reason}"</p>
                                     </div>
                                     <div className="flex gap-4">
                                        <div>
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">Order ID</p>
                                           <p className="text-xs font-bold text-secondary">#{String(refund.orderId).slice(-6).toUpperCase()}</p>
                                        </div>
                                        <div>
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">Amount</p>
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
                                              <CheckCircle size={16} /> Approve
                                           </button>
                                           <button 
                                              onClick={async () => {
                                                 if(window.confirm("Reject this request?")) {
                                                    await updateDoc(doc(db, "refund_requests", refund.id), { status: "rejected", updatedAt: new Date().toISOString() });
                                                 }
                                              }}
                                              className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-xs font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center gap-2"
                                           >
                                              <XCircle size={16} /> Reject
                                           </button>
                                        </>
                                     )}
                                     {refund.status !== "pending" && (
                                        <div className="text-right">
                                           <p className="text-[9px] font-bold text-gray-400 uppercase">Updated At</p>
                                           <p className="text-[10px] font-bold text-gray-500">{new Date(refund.updatedAt || refund.createdAt).toLocaleString("en-US")}</p>
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
                          <Gift size={20} className="text-primary" /> {editingCampaign?.id ? "Edit Campaign" : "New Campaign"}
                        </h4>
                        <form onSubmit={saveCampaign} className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Campaign Name</label>
                            <input
                              type="text"
                              value={editingCampaign?.name || ""}
                              onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value } as any)}
                              placeholder="e.g. Eid Dhamaka"
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">URL (Slug)</label>
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
                             <label className="text-xs font-bold text-gray-600">Activate Campaign Live</label>
                          </div>
                          <div className="flex gap-2 pt-2">
                             <button
                                type="submit"
                                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                             >
                                Save Campaign
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
                         <History size={20} className="text-primary" /> Existing Campaigns
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
                                <p className="text-[10px] text-gray-400 font-bold mb-3 truncate">Link: ?campaign={campaign.slug}</p>
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
                                <p className="text-gray-400 font-bold uppercase text-xs">No campaigns found</p>
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
                {adminTab === "reports" && (() => {
                  // 1. Timeframe Filtered Active Orders
                  const activeOrders = (orderHistory || []).filter((o: any) => !o.deleted);
                  const filteredOrders = activeOrders.filter((o: any) => {
                    if (reportProductPeriod === "all") return true;
                    const dateVal = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : (o.date || o.createdAt);
                    if (!dateVal) return false;
                    const d = new Date(dateVal);
                    if (isNaN(d.getTime())) return true;
                    const now = new Date();
                    if (reportProductPeriod === "this_month") {
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    } else if (reportProductPeriod === "last_month") {
                      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
                      const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
                      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
                    } else if (reportProductPeriod === "this_year") {
                      return d.getFullYear() === now.getFullYear();
                    }
                    return true;
                  });

                  // 2. Global Store Metrics
                  const totalOrdersCount = filteredOrders.length;
                  const deliveredOrders = filteredOrders.filter((o: any) => o.status === "delivered");
                  const deliveredOrdersCount = deliveredOrders.length;
                  const pendingOrdersCount = filteredOrders.filter((o: any) => o.status === "pending" || o.status === "processing" || o.status === "confirmed" || o.status === "shipped").length;
                  const cancelledOrdersCount = filteredOrders.filter((o: any) => o.status === "cancelled" || o.status === "returned").length;
                  const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

                  // 3. Compute Product Metrics
                  const allProductMetrics = (products || []).filter((p: any) => !p.deleted).map((p: any) => {
                    const buyingPrice = Number(p.buyingPrice || 0);
                    const sellingPrice = Number(p.price || 0);
                    const currentStock = getEffectiveStock(p);

                    let soldUnits = 0;
                    let revenue = 0;
                    let cost = 0;
                    let pendingUnits = 0;
                    let cancelledUnits = 0;
                    const matchingOrders: any[] = [];

                    filteredOrders.forEach((o: any) => {
                      let matchedInOrder = false;
                      let orderItemQty = 0;
                      let orderItemPrice = 0;

                      (o.items || []).forEach((item: any) => {
                        const isMatch = item.id === p.id || item.product?.id === p.id || item.name === p.name || item.product?.name === p.name;
                        if (isMatch) {
                          matchedInOrder = true;
                          const qty = Number(item.quantity || item.qty || 1);
                          const itemSellPrice = Number(item.price || item.product?.price || sellingPrice || 0);
                          const itemBuyPrice = Number(item.buyingPrice || item.product?.buyingPrice || buyingPrice || 0);
                          
                          orderItemQty += qty;
                          orderItemPrice = itemSellPrice;

                          if (o.status === "delivered") {
                            soldUnits += qty;
                            revenue += (itemSellPrice * qty);
                            cost += (itemBuyPrice * qty);
                          } else if (o.status === "pending" || o.status === "processing" || o.status === "confirmed" || o.status === "shipped") {
                            pendingUnits += qty;
                          } else if (o.status === "cancelled" || o.status === "returned") {
                            cancelledUnits += qty;
                          }
                        }
                      });

                      if (matchedInOrder) {
                        matchingOrders.push({
                          ...o,
                          productQty: orderItemQty,
                          productPrice: orderItemPrice
                        });
                      }
                    });

                    const profit = revenue - cost;
                    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
                    const inventoryCost = currentStock * buyingPrice;
                    const inventoryValue = currentStock * sellingPrice;

                    return {
                      product: p,
                      id: p.id,
                      name: p.name,
                      image: p.image || p.images?.[0] || "",
                      category: p.category || "General",
                      sellingPrice,
                      buyingPrice,
                      stock: currentStock,
                      soldUnits,
                      revenue,
                      cost,
                      profit,
                      margin,
                      pendingUnits,
                      cancelledUnits,
                      inventoryCost,
                      inventoryValue,
                      matchingOrders: matchingOrders.sort((a, b) => {
                        const aT = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.date ? new Date(a.date).getTime() : 0);
                        const bT = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.date ? new Date(b.date).getTime() : 0);
                        return bT - aT;
                      })
                    };
                  });

                  // 4. Selected Product
                  const selectedProduct = selectedReportProductId 
                    ? allProductMetrics.find(p => p.id === selectedReportProductId) 
                    : null;

                  // 5. Search Results for Product Picker
                  const searchResults = reportProductSearch.trim()
                    ? allProductMetrics.filter(p => 
                        p.name.toLowerCase().includes(reportProductSearch.toLowerCase()) || 
                        p.category.toLowerCase().includes(reportProductSearch.toLowerCase()) ||
                        (p.id && p.id.toLowerCase().includes(reportProductSearch.toLowerCase()))
                      )
                    : [];

                  return (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/40 font-sans">
                      <div className="max-w-6xl mx-auto space-y-6">
                        
                        {/* Header & Timeframe Switcher */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
                              <Activity size={24} />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900">Reports & Analytics</h3>
                              <p className="text-xs text-gray-500 font-bold">Product-wise Revenue, Cost, Profit & Stock Analytics</p>
                            </div>
                          </div>

                          {/* Timeframe Filter Buttons */}
                          <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 self-start md:self-auto overflow-x-auto max-w-full">
                            {[
                              { id: "all", label: "All Time" },
                              { id: "this_month", label: "This Month" },
                              { id: "last_month", label: "Last Month" },
                              { id: "this_year", label: "This Year" }
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setReportProductPeriod(tab.id as any)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                  reportProductPeriod === tab.id
                                    ? "bg-white text-gray-900 shadow-xs"
                                    : "text-gray-500 hover:text-gray-900"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Top Store Overview Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
                            <span className="text-xs font-bold text-blue-600">Total Orders</span>
                            <span className="text-2xl font-black text-blue-900">{totalOrdersCount}</span>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
                            <span className="text-xs font-bold text-emerald-600">Delivered Orders</span>
                            <span className="text-2xl font-black text-emerald-900">{deliveredOrdersCount}</span>
                          </div>
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
                            <span className="text-xs font-bold text-amber-600">Pending / Processing</span>
                            <span className="text-2xl font-black text-amber-900">{pendingOrdersCount}</span>
                          </div>
                          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between gap-1 shadow-xs">
                            <span className="text-xs font-bold text-purple-600">Total Revenue</span>
                            <span className="text-2xl font-black text-purple-900">৳{totalRevenue.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* ───────────────────────────────────────────────────────────── */}
                        {/* 🔍 PRODUCT SEARCH & SELECTOR SECTION */}
                        {/* ───────────────────────────────────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                                <Search className="text-primary" size={18} /> Search Product & View Profit/Loss Report
                              </h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                Search and select any product to inspect its individual revenue, buying cost, net profit, and stock
                              </p>
                            </div>
                            {selectedProduct && (
                              <button
                                onClick={() => {
                                  setSelectedReportProductId(null);
                                  setReportProductSearch("");
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors self-start sm:self-auto"
                              >
                                <X size={14} /> Clear Filter
                              </button>
                            )}
                          </div>

                          {/* Search Input Box */}
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="text"
                              value={reportProductSearch}
                              onChange={(e) => setReportProductSearch(e.target.value)}
                              placeholder="Search product by name, category or SKU (e.g. Handheld Fan, Power Bank)..."
                              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white focus:border-transparent outline-none transition-all"
                            />
                            {reportProductSearch && (
                              <button
                                onClick={() => setReportProductSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>

                          {/* Search Results Dropdown List */}
                          {reportProductSearch.trim() && (
                            <div className="border border-gray-100 rounded-xl bg-gray-50/60 p-2 max-h-60 overflow-y-auto divide-y divide-gray-100">
                              {searchResults.length === 0 ? (
                                <p className="text-center py-4 text-xs text-gray-400 font-bold">No matching products found</p>
                              ) : (
                                searchResults.map((p) => (
                                  <div
                                    key={p.id}
                                    onClick={() => {
                                      setSelectedReportProductId(p.id);
                                      setReportProductSearch("");
                                    }}
                                    className={`p-2.5 rounded-lg flex items-center justify-between gap-3 hover:bg-white cursor-pointer transition-all ${
                                      selectedReportProductId === p.id ? "bg-white ring-1 ring-primary shadow-xs" : ""
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {p.image ? (
                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 shrink-0" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                                          <Package size={16} className="text-gray-400" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                        <p className="text-[11px] text-gray-500">
                                          Sell: <span className="font-bold text-gray-800">৳{p.sellingPrice}</span> | 
                                          Buy: <span className="font-bold text-gray-800">৳{p.buyingPrice}</span> | 
                                          Stock: <span className={`font-black ${p.stock <= 5 ? "text-red-500" : "text-emerald-600"}`}>{p.stock} Units</span>
                                        </p>
                                      </div>
                                    </div>
                                    <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shrink-0">
                                      Select
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* ───────────────────────────────────────────────────────────── */}
                        {/* 🎯 SELECTED PRODUCT DEEP REPORT & FINANCIAL BREAKDOWN */}
                        {/* ───────────────────────────────────────────────────────────── */}
                        {selectedProduct ? (
                          <div className="space-y-6">
                            
                            {/* Product Header Profile Card */}
                            <div className="bg-white rounded-2xl border-2 border-primary/20 p-6 shadow-sm">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                  {selectedProduct.image ? (
                                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-200 shrink-0" />
                                  ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                                      <Package size={24} className="text-gray-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary">
                                        {selectedProduct.category}
                                      </span>
                                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                        selectedProduct.stock === 0
                                          ? "bg-red-100 text-red-600"
                                          : selectedProduct.stock <= 5
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700"
                                      }`}>
                                        {selectedProduct.stock === 0 ? "🔴 Out of Stock" : selectedProduct.stock <= 5 ? `🟡 Low Stock (${selectedProduct.stock} Left)` : `🟢 In Stock (${selectedProduct.stock} Units)`}
                                      </span>
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 mt-1 truncate">{selectedProduct.name}</h4>
                                    <p className="text-xs text-gray-500 font-medium">
                                      Selling Price: <span className="font-bold text-gray-900">৳{selectedProduct.sellingPrice.toLocaleString()}</span> | 
                                      Buying Price: <span className="font-bold text-gray-900">৳{selectedProduct.buyingPrice.toLocaleString()}</span> | 
                                      Est. Profit/Unit: <span className="font-bold text-emerald-600">৳{(selectedProduct.sellingPrice - selectedProduct.buyingPrice).toLocaleString()}</span>
                                    </p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setSelectedReportProductId(null)}
                                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors shrink-0"
                                >
                                  Change Product
                                </button>
                              </div>
                            </div>

                            {/* 4 Major Financial Metric Cards (Income - Expense & Profit) */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              
                              {/* 1. Revenue */}
                              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-500">Total Sales Revenue</span>
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={16} /></div>
                                </div>
                                <div>
                                  <p className="text-2xl font-black text-blue-600">৳{selectedProduct.revenue.toLocaleString()}</p>
                                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">From {selectedProduct.soldUnits} sold units</p>
                                </div>
                              </div>

                              {/* 2. Buying Cost */}
                              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-500">Total Buying Cost (COGS)</span>
                                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Tag size={16} /></div>
                                </div>
                                <div>
                                  <p className="text-2xl font-black text-amber-600">৳{selectedProduct.cost.toLocaleString()}</p>
                                  <p className="text-[11px] text-gray-400 font-bold mt-0.5">Cost of sold inventory</p>
                                </div>
                              </div>

                              {/* 3. Gross Profit */}
                              <div className="bg-white rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 p-5 shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-emerald-800">Gross Profit (Net Gain)</span>
                                  <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs"><TrendingUp size={16} /></div>
                                </div>
                                <div>
                                  <p className="text-2xl font-black text-emerald-600">৳{selectedProduct.profit.toLocaleString()}</p>
                                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Profit Margin: {selectedProduct.margin}%</p>
                                </div>
                              </div>

                              {/* 4. Current Stock & Inventory Cost */}
                              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-gray-500">Stock Remaining & Asset Value</span>
                                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Package size={16} /></div>
                                </div>
                                <div>
                                  <p className="text-2xl font-black text-purple-600">{selectedProduct.stock} Units Left</p>
                                  <p className="text-[11px] text-gray-500 font-bold mt-0.5">Inventory Cost: ৳{selectedProduct.inventoryCost.toLocaleString()}</p>
                                </div>
                              </div>

                            </div>

                            {/* 4 Order Status Distribution Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[11px] text-gray-500 font-bold">✅ Delivered Units</p>
                                <p className="text-lg font-black text-gray-900 mt-0.5">{selectedProduct.soldUnits} Units</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[11px] text-gray-500 font-bold">⏳ Pending / Processing</p>
                                <p className="text-lg font-black text-amber-600 mt-0.5">{selectedProduct.pendingUnits} Units</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[11px] text-gray-500 font-bold">❌ Cancelled / Returned</p>
                                <p className="text-lg font-black text-red-600 mt-0.5">{selectedProduct.cancelledUnits} Units</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-[11px] text-gray-500 font-bold">🏢 Potential Stock Revenue</p>
                                <p className="text-lg font-black text-primary mt-0.5">৳{selectedProduct.inventoryValue.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Recent Customer Orders for this Product */}
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900">Recent Customer Orders for this Product</h4>
                                  <p className="text-xs text-gray-400 font-medium">List of customer orders containing this specific product</p>
                                </div>
                                <span className="text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                  {selectedProduct.matchingOrders.length} Total Orders
                                </span>
                              </div>

                              {selectedProduct.matchingOrders.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 text-xs font-bold">
                                  No orders recorded for this product in selected timeframe
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                                        <th className="p-3.5">Order ID</th>
                                        <th className="p-3.5">Customer Name & Phone</th>
                                        <th className="p-3.5">Date</th>
                                        <th className="p-3.5 text-center">Quantity</th>
                                        <th className="p-3.5 text-right">Amount</th>
                                        <th className="p-3.5 text-center">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-medium">
                                      {selectedProduct.matchingOrders.slice(0, 15).map((o: any) => (
                                        <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                                          <td className="p-3.5 font-mono font-bold text-primary">
                                            #{String(o.id).slice(-6).toUpperCase()}
                                          </td>
                                          <td className="p-3.5">
                                            <div className="flex flex-col">
                                              <span className="font-bold text-gray-800">{o.customerName || "Customer"}</span>
                                              <span className="text-gray-400 font-mono">{o.customerPhone || o.phone || "-"}</span>
                                            </div>
                                          </td>
                                          <td className="p-3.5 text-gray-500 whitespace-nowrap">
                                            {o.date || (o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : "-")}
                                          </td>
                                          <td className="p-3.5 text-center font-bold text-gray-800">
                                            {o.productQty || 1}
                                          </td>
                                          <td className="p-3.5 text-right font-black text-gray-900">
                                            ৳{((o.productPrice || selectedProduct.sellingPrice) * (o.productQty || 1)).toLocaleString()}
                                          </td>
                                          <td className="p-3.5 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                              o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                              o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                              o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                              o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                              'bg-gray-100 text-gray-700'
                                            }`}>
                                              {o.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                          </div>
                        ) : null}

                        {/* ───────────────────────────────────────────────────────────── */}
                        {/* 📊 ALL PRODUCTS PERFORMANCE SUMMARY TABLE */}
                        {/* ───────────────────────────────────────────────────────────── */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
                                <Layers className="text-orange-500" size={18} /> All Products Financial & Stock Summary
                              </h4>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">
                                Click 'View Report' on any product to see complete profit, cost, and order breakdown
                              </p>
                            </div>
                            <span className="text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-xl self-start sm:self-auto">
                              {allProductMetrics.length} Total Products
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider">
                                  <th className="p-3.5">Product</th>
                                  <th className="p-3.5 text-right">Buying Price</th>
                                  <th className="p-3.5 text-right">Selling Price</th>
                                  <th className="p-3.5 text-center">Current Stock</th>
                                  <th className="p-3.5 text-center">Sold Units</th>
                                  <th className="p-3.5 text-right">Total Revenue</th>
                                  <th className="p-3.5 text-right">Total Cost</th>
                                  <th className="p-3.5 text-right">Net Profit</th>
                                  <th className="p-3.5 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 font-medium">
                                {allProductMetrics
                                  .sort((a, b) => b.soldUnits - a.soldUnits || b.profit - a.profit)
                                  .map((p) => (
                                    <tr 
                                      key={p.id} 
                                      className={`hover:bg-orange-50/30 transition-colors ${selectedReportProductId === p.id ? "bg-orange-50/50" : ""}`}
                                    >
                                      <td className="p-3.5">
                                        <div className="flex items-center gap-3 min-w-[200px] max-w-xs">
                                          {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-white border border-gray-200 shrink-0" />
                                          ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                              <Package size={16} className="text-gray-400" />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <p className="font-bold text-gray-900 text-xs truncate">{p.name}</p>
                                            <p className="text-[10px] text-gray-400">{p.category}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3.5 text-right font-bold text-gray-700">
                                        ৳{p.buyingPrice.toLocaleString()}
                                      </td>
                                      <td className="p-3.5 text-right font-bold text-gray-900">
                                        ৳{p.sellingPrice.toLocaleString()}
                                      </td>
                                      <td className="p-3.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                          p.stock === 0 
                                            ? "bg-red-100 text-red-700" 
                                            : p.stock <= 5 
                                            ? "bg-amber-100 text-amber-700" 
                                            : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                          {p.stock === 0 ? "0 Units" : `${p.stock} Units`}
                                        </span>
                                      </td>
                                      <td className="p-3.5 text-center font-black text-gray-900">
                                        {p.soldUnits}
                                      </td>
                                      <td className="p-3.5 text-right font-bold text-blue-700">
                                        ৳{p.revenue.toLocaleString()}
                                      </td>
                                      <td className="p-3.5 text-right font-bold text-amber-700">
                                        ৳{p.cost.toLocaleString()}
                                      </td>
                                      <td className="p-3.5 text-right">
                                        <span className={`font-black ${p.profit > 0 ? "text-emerald-600" : p.profit < 0 ? "text-red-600" : "text-gray-400"}`}>
                                          ৳{p.profit.toLocaleString()}
                                        </span>
                                      </td>
                                      <td className="p-3.5 text-center">
                                        <button
                                          onClick={() => {
                                            setSelectedReportProductId(p.id);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                          }}
                                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                                            selectedReportProductId === p.id
                                              ? "bg-orange-500 text-white shadow-orange-500/20"
                                              : "bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700"
                                          }`}
                                        >
                                          {selectedReportProductId === p.id ? "Selected" : "View Report"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

                {/* ── Low Stock Tab ── */}
                {adminTab === "low_stock" && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30 font-sans">
                    <div className="max-w-4xl mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-xl"><AlertCircle size={22} /></div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Low Stock Products</h3>
                          <p className="text-xs text-gray-400 font-bold">Products with total stock ≤ 5 units</p>
                        </div>
                      </div>
                      {products.filter((p: any) => !p.deleted && getEffectiveStock(p) <= 5).length === 0 ? (
                        <div className="text-center py-20 text-gray-400 font-bold">
                          <CheckCircle size={48} className="mx-auto mb-4 opacity-20 text-green-500" />
                          <p>All products have sufficient stock</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {products
                            .filter((p: any) => !p.deleted && getEffectiveStock(p) <= 5)
                            .sort((a: any, b: any) => getEffectiveStock(a) - getEffectiveStock(b))
                            .map((p: any) => {
                              const effStock = getEffectiveStock(p);
                              return (
                                <div key={p.id} className="bg-white rounded-2xl border border-yellow-100 p-4 flex items-center gap-4 shadow-sm">
                                  {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-xs text-gray-400">{p.category}</p>
                                      {p.variants && p.variants.length > 0 && (
                                        <span className="text-[10px] text-gray-500 font-medium">
                                          ({p.variants.map((v: any) => `${v.name || 'Variant'}: ${v.stock || 0}`).join(", ")})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-black ${effStock === 0 ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                                    {effStock === 0 ? "Out of Stock" : `${effStock} Left`}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
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
                  <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                    <div className="max-w-4xl mx-auto mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
                      <button onClick={() => setSettingsTab('general')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'general' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>General Settings</button>
                      <button onClick={() => setSettingsTab('banners')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'banners' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Homepage Banners</button>
                      <button onClick={() => setSettingsTab('admins')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'admins' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Admin Management</button>
                      <button onClick={() => setSettingsTab('users')} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${settingsTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Users Access</button>
                    </div>
                    {settingsTab === 'general' && (
                    <div className="space-y-8 max-w-4xl mx-auto">
                      {/* Coupon Management Section */}
                      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                         <div className="flex items-center justify-between mb-8">
                           <h4 className="text-xl font-bold text-secondary flex items-center gap-2">
                             <Tag size={24} className="text-primary" /> Coupon & Payment Settings
                           </h4>
                           <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                              Used: {orderHistory.filter(o => o.appliedCoupon === (siteConfig?.couponCode || "ROKOMARI5")).length} times
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
                              <input type="text" value={siteConfig?.couponCode || ""} onChange={(e) => setSiteConfig(prev => prev ? {...prev, couponCode: e.target.value.toUpperCase()} : null)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary text-sm font-bold tracking-widest" placeholder="e.g. ROKOMARI10" />
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
                                    placeholder="e.g. For any queries, contact us at: 01738364268"
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
                                placeholder="e.g., /apps/rokomari-setup.exe"
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
                                placeholder="e.g., /apps/rokomari.apk"
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
                                  Top Right Banner
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
                                  Bottom Right Banner (Flash Sale)
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
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                      <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
                        <ShieldCheck size={24} className="text-primary" />
                       Recent Orders
                      </h4>
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 tracking-widest">
                          {editingAdmin ? "Edit Admin/Moderator" : "Add New Admin/Moderator"}
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
                                 Cancel
                               </button>
                             )}
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 italic font-medium">
                          You will be contacted shortly.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h5 className="font-bold text-secondary text-sm">
                         Active Users ({adminList.length})
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
                              {admin.email !== "islamicsoktitv@gmail.com" && admin.email !== "rokomariponnohari@gmail.com" && (
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
                          <RefreshCcw size={14} className={isUsersLoading ? "animate-spin" : ""} /> Refresh
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
                                     Update Balance
                                   </button>
                                 </td>
                               </tr>
                             ))}
                             {userList.length === 0 && !isUsersLoading && (
                               <tr>
                                 <td colSpan={3} className="py-8 text-center text-gray-400 text-sm italic">No Users Found</td>
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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto no-scrollbar max-h-[70vh]">
                   {/* Bulk Notification Form */}
                   <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Bell size={24} />
                         </div>
                         <div>
                            <h4 className="text-xl font-bold text-secondary">Send Notification</h4>
<p className="text-xs text-gray-500 font-bold">Send new product or offer info to all customers</p>
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
                               <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">Detailed Admin</label>
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
                                     Send All
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
                         <h4 className="text-xl font-bold text-secondary">All Notification History</h4>
                         <p className="text-xs text-gray-400 font-bold">Customer refund requests will be shown here</p>
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
                                    if (!window.confirm("Are you sure you want to delete this notification?")) return;
                                    try {
                                      await deleteDoc(doc(db, "notifications", notif.id));
                                      toast.success("Notification deleted successfully.");
                                    } catch (err) {
                                      toast.error("Failed to delete notification. Try again.");
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
                             <p className="text-xs text-gray-400 font-bold">Customer refund requests will be shown here</p>
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
                                            <p className="font-bold text-secondary text-sm">{u.displayName || "Unknown User"}</p>
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
                                            Message
                                          </button>
                                          <button 
                                            onClick={() => handleEditUserBalance(u)}
                                            className="bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-100 active:scale-95 transition-all"
                                          >
                                            Update Balance
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
