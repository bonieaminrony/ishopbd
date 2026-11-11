import React from 'react';
import { Check, Copy, Edit2, Gift, History, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface AdminCampaignsTabProps {
  campaigns: any[];
  products: any[];
  editingCampaign: any;
  setEditingCampaign: (campaign: any) => void;
  saveCampaign: (e: React.FormEvent) => void;
  deleteCampaign: (id: string) => void;
  handleAdminImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: any) => void;
}

export default function AdminCampaignsTab({
  campaigns,
  products,
  editingCampaign,
  setEditingCampaign,
  saveCampaign,
  deleteCampaign,
  handleAdminImageUpload,
}: AdminCampaignsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Campaign Add/Edit Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-0">
          <h4 className="text-lg font-bold text-secondary mb-6 flex items-center gap-2">
            <Gift size={20} className="text-primary" /> {editingCampaign?.id ? 'Edit Campaign' : 'New Campaign'}
          </h4>
          <form onSubmit={saveCampaign} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={editingCampaign?.name || ''}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value } as any)}
                placeholder="e.g. Eid Dhamaka"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                URL (Slug)
              </label>
              <input
                type="text"
                value={editingCampaign?.slug || ''}
                onChange={(e) => setEditingCampaign({ ...editingCampaign, slug: e.target.value } as any)}
                placeholder="e.g. eid-dhamaka"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">Must be unique. e.g. ?campaign=eid-dhamaka</p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Upload Banner
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAdminImageUpload(e, 'campaign')}
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
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Select Products ({editingCampaign?.productIds?.length || 0})
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl p-2 space-y-1 bg-gray-50 no-scrollbar">
                {products
                  .filter((p) => !p.deleted)
                  .map((p) => {
                    const isSelected = editingCampaign?.productIds?.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const currentIds = editingCampaign?.productIds || [];
                          const newIds = isSelected
                            ? currentIds.filter((id: string) => id !== p.id)
                            : [...currentIds, p.id];
                          setEditingCampaign({ ...editingCampaign, productIds: newIds } as any);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-[10px] font-bold flex gap-2 items-center transition-all ${
                          isSelected ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
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
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md transition-all"
            >
              <div className="relative h-32 rounded-2xl overflow-hidden mb-4 bg-gray-50">
                {campaign.image && (
                  <img loading="lazy" src={campaign.image} className="w-full h-full object-cover" alt="" />
                )}
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[8px] font-bold uppercase ${
                    campaign.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
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
                      const url = window.location.origin + window.location.pathname + '?campaign=' + campaign.slug;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copied!');
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
  );
}
