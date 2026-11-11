import React from 'react';
import { Bell, MessageSquare, Search, Send, Trash2, User, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface AdminUsersTabProps {
  bulkNotifForm: any;
  setBulkNotifForm: (form: any) => void;
  handleSendBulkNotification: (e: React.FormEvent) => void;
  isSendingBulkNotif: boolean;
  notifications: any[];
  userList: any[];
  userListSearch: string;
  setUserListSearch: (val: string) => void;
  handleSendDirectNotification: (uid: string, email: string) => void;
  handleEditUserBalance: (user: any) => void;
}

export default function AdminUsersTab({
  bulkNotifForm,
  setBulkNotifForm,
  handleSendBulkNotification,
  isSendingBulkNotif,
  notifications,
  userList,
  userListSearch,
  setUserListSearch,
  handleSendDirectNotification,
  handleEditUserBalance,
}: AdminUsersTabProps) {
  return (
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
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">
                Title
              </label>
              <input
                required
                type="text"
                value={bulkNotifForm.title}
                onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, title: e.target.value })}
                placeholder="e.g. Dhamaka Offer!"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">
                Link or Product ID
              </label>
              <input
                type="text"
                value={bulkNotifForm.link}
                onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, link: e.target.value })}
                placeholder="e.g. p123"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest mb-1.5 ml-1">
                Detailed Admin
              </label>
              <textarea
                required
                rows={4}
                value={bulkNotifForm.message}
                onChange={(e) => setBulkNotifForm({ ...bulkNotifForm, message: e.target.value })}
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
        {notifications.filter((n: any) => n.type === 'broadcast' || n.userId === 'all').length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <Bell size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-bold">No notification found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
            {notifications
              .filter((n: any) => n.type === 'broadcast' || n.userId === 'all')
              .map((notif: any) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-secondary text-sm truncate">{notif.title}</p>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap flex-shrink-0">
                        {notif.createdAt?.toDate
                          ? new Date(notif.createdAt.toDate()).toLocaleString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                    {notif.link && (
                      <span className="inline-block mt-1.5 text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                        {notif.link}
                      </span>
                    )}
                    <p className="text-[10px] text-gray-300 mt-1.5">Sender: {notif.sender || 'system'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this notification?')) return;
                      try {
                        await deleteDoc(doc(db, 'notifications', notif.id));
                        toast.success('Notification deleted successfully.');
                      } catch (err) {
                        toast.error('Failed to delete notification. Try again.');
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
              onChange={(e) => setUserListSearch(e.target.value)}
              placeholder="Search by Email or Phone..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary outline-none transition-all shadow-inner"
            />
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
                  Users
                </th>
                <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
                  Access
                </th>
                <th className="py-4 px-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userList
                .filter(
                  (u) =>
                    (u.email || '').toLowerCase().includes(userListSearch.toLowerCase()) ||
                    (u.uid || '').toLowerCase().includes(userListSearch.toLowerCase()) ||
                    (u.displayName || '').toLowerCase().includes(userListSearch.toLowerCase())
                )
                .slice(0, 50)
                .map((u: any) => (
                  <tr key={u.id || u.uid} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-6 px-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-secondary font-bold text-xs uppercase shadow-sm">
                          {u.displayName ? u.displayName[0] : <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-secondary text-sm">{u.displayName || 'Unknown User'}</p>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {u.email?.endsWith('@mobile.user') ? u.email.replace('@mobile.user', '') : u.email}
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
                          onClick={() => handleSendDirectNotification(u.uid || u.id, u.email || '')}
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
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 text-xs italic">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
