import React from 'react';
import { RefreshCcw, Users } from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface AdminSettingsUsersTabProps {
  userList: any[];
  setUserList: (users: any[]) => void;
  isUsersLoading: boolean;
  setIsUsersLoading: (loading: boolean) => void;
  setIsQuotaExceeded: (exceeded: boolean) => void;
  handleEditUserBalance: (user: any) => void;
}

export default function AdminSettingsUsersTab({
  userList,
  setUserList,
  isUsersLoading,
  setIsUsersLoading,
  setIsQuotaExceeded,
  handleEditUserBalance,
}: AdminSettingsUsersTabProps) {
  return (
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
              const q = query(collection(db, 'users'), limit(100));
              const snapshot = await getDocs(q);
              setUserList(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
            } catch (err: any) {
              console.error(err);
              if (err.message?.includes('Quota exceeded') || err.message === 'QUOTA_EXCEEDED') {
                setIsQuotaExceeded(true);
              }
            } finally {
              setIsUsersLoading(false);
            }
          }}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <RefreshCcw size={14} className={isUsersLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest">
                Users
              </th>
              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">
                Access
              </th>
              <th className="pb-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider tracking-widest text-right">
                Action
              </th>
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
                        u.displayName?.substring(0, 1) || u.email?.substring(0, 1) || '?'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary">{u.displayName || 'Anonymous'}</p>
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
                <td colSpan={3} className="py-8 text-center text-gray-400 text-sm italic">
                  No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
