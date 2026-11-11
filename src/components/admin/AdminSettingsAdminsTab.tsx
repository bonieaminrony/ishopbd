import React from 'react';
import { Edit, Phone, ShieldCheck, Trash2, User } from 'lucide-react';

export interface AdminSettingsAdminsTabProps {
  adminList: any[];
  editingAdmin: any;
  setEditingAdmin: (admin: any) => void;
  newAdminEmail: string;
  setNewAdminEmail: (val: string) => void;
  newAdminPassword: string;
  setNewAdminPassword: (val: string) => void;
  newAdminPhone: string;
  setNewAdminPhone: (val: string) => void;
  newAdminRole: string;
  setNewAdminRole: (role: 'admin' | 'moderator' | 'owner') => void;
  handleAddAdmin: () => void;
  handleUpdateAdmin: () => void;
  handleDeleteAdmin: (id: string) => void;
}

export default function AdminSettingsAdminsTab({
  adminList,
  editingAdmin,
  setEditingAdmin,
  newAdminEmail,
  setNewAdminEmail,
  newAdminPassword,
  setNewAdminPassword,
  newAdminPhone,
  setNewAdminPhone,
  newAdminRole,
  setNewAdminRole,
  handleAddAdmin,
  handleUpdateAdmin,
  handleDeleteAdmin,
}: AdminSettingsAdminsTabProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <h4 className="text-xl font-bold text-secondary mb-6 flex items-center gap-2">
        <ShieldCheck size={24} className="text-primary" />
        Recent Orders
      </h4>
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
        <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4 tracking-widest">
          {editingAdmin ? 'Edit Admin/Moderator' : 'Add New Admin/Moderator'}
        </label>
        <div className="flex flex-col xl:flex-row gap-3">
          <input
            type="email"
            disabled={!!editingAdmin}
            value={(editingAdmin ? editingAdmin.email : newAdminEmail) || ''}
            onChange={(e) => (editingAdmin ? null : setNewAdminEmail(e.target.value))}
            className={`flex-[2] border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0 ${
              editingAdmin ? 'bg-gray-100' : 'bg-white'
            }`}
            placeholder="Enter Email Address..."
          />
          <input
            type="text"
            value={(editingAdmin ? editingAdmin.password : newAdminPassword) || ''}
            onChange={(e) =>
              editingAdmin
                ? setEditingAdmin({ ...editingAdmin, password: e.target.value })
                : setNewAdminPassword(e.target.value)
            }
            className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0"
            placeholder="Password..."
          />
          <input
            type="text"
            value={(editingAdmin ? editingAdmin.phone : newAdminPhone) || ''}
            onChange={(e) =>
              editingAdmin
                ? setEditingAdmin({ ...editingAdmin, phone: e.target.value })
                : setNewAdminPhone(e.target.value)
            }
            className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-primary font-bold text-sm min-w-0"
            placeholder="Phone Number (2FA)..."
          />
          <select
            value={editingAdmin ? editingAdmin.role : newAdminRole}
            onChange={(e) =>
              editingAdmin
                ? setEditingAdmin({ ...editingAdmin, role: e.target.value as any })
                : setNewAdminRole(e.target.value as 'admin' | 'moderator' | 'owner')
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
              {editingAdmin ? 'Update' : 'Add'}
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
        <p className="text-[10px] text-gray-400 mt-4 italic font-medium">You will be contacted shortly.</p>
      </div>
      <div className="space-y-4">
        <h5 className="font-bold text-secondary text-sm">Active Users ({adminList.length})</h5>
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
                <p className="font-bold text-secondary text-sm">{admin.email}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      admin.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {admin.role === 'admin' ? 'ADMIN' : 'MODERATOR'}
                  </span>
                  {admin.phone && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Phone size={8} /> {admin.phone}
                    </span>
                  )}
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
              {admin.email !== 'islamicsoktitv@gmail.com' && (
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
  );
}
