import React, { useMemo, useState } from 'react';
import { Check, Copy, Edit3, ExternalLink, Gift, Loader2, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';
import { campaignLink, normalizeCampaignSlug, suggestCampaignSlug } from '../../utils/campaign';

export interface AdminCampaignsTabProps {
  campaigns: any[];
  products: any[];
  editingCampaign: any;
  setEditingCampaign: (campaign: any) => void;
  saveCampaign: (e: React.FormEvent) => void;
  deleteCampaign: (id: string) => void;
  handleAdminImageUpload: (e: React.ChangeEvent<HTMLInputElement>, target: any) => void;
}

const copyText = async (text: string, okMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(okMessage);
  } catch {
    toast.error('কপি করা যায়নি');
  }
};

export default function AdminCampaignsTab({
  campaigns,
  products,
  editingCampaign,
  setEditingCampaign,
  saveCampaign,
  deleteCampaign,
  handleAdminImageUpload,
}: AdminCampaignsTabProps) {
  const [productQuery, setProductQuery] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const draft = editingCampaign || {};
  const isEditing = Boolean(draft.id);
  const selectedIds: string[] = draft.productIds || [];
  const liveProducts = useMemo(() => products.filter((p) => p && !p.deleted), [products]);
  const productById = useMemo(() => new Map(liveProducts.map((p) => [p.id, p])), [liveProducts]);

  // Selected products first, then the rest; filtered by name or code.
  const pickerProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = q
      ? liveProducts.filter((p) => [p.name, p.code, p.category].filter(Boolean).some((v: any) => String(v).toLowerCase().includes(q)))
      : liveProducts;
    const chosen = new Set(selectedIds);
    return [...list.filter((p) => chosen.has(p.id)), ...list.filter((p) => !chosen.has(p.id))];
  }, [liveProducts, productQuery, selectedIds]);

  const slug = normalizeCampaignSlug(draft.slug);
  const slugTaken = Boolean(slug) && campaigns.some((c) => c.id !== draft.id && normalizeCampaignSlug(c.slug) === slug);

  const update = (patch: any) => setEditingCampaign({ ...draft, ...patch });

  const startNew = () => {
    setSlugTouched(false);
    setProductQuery('');
    setEditingCampaign({ name: '', slug: '', description: '', image: '', productIds: [], isActive: true });
  };
  const startEdit = (c: any) => {
    setSlugTouched(true);
    setProductQuery('');
    setEditingCampaign({ ...c, productIds: c.productIds || [] });
    requestAnimationFrame(() => document.getElementById('campaign-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const toggleProduct = (id: string) => {
    update({ productIds: selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id] });
  };

  const toggleLive = async (c: any) => {
    setTogglingId(c.id);
    try {
      await updateDoc(doc(db, 'campaigns', c.id), { isActive: !c.isActive, updatedAt: new Date().toISOString() });
      toast.success(!c.isActive ? 'ক্যাম্পেইন চালু হয়েছে' : 'ক্যাম্পেইন বন্ধ (Draft) করা হয়েছে');
    } catch (err) {
      console.error('Campaign toggle failed', err);
      toast.error('বদলানো যায়নি, আবার চেষ্টা করুন');
    } finally {
      setTogglingId(null);
    }
  };

  const label = 'block text-[11px] font-bold text-gray-500 mb-1.5';
  const input =
    'w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
            <Gift size={20} className="text-primary shrink-0" />
            Campaigns
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            নির্দিষ্ট পণ্য নিয়ে অফার পেজ, নিজস্ব লিংকসহ (অ্যাডের জন্য)। {campaigns.filter((c) => c.isActive).length} live · {campaigns.length} total
          </p>
        </div>
        {!editingCampaign && (
          <button
            type="button"
            onClick={startNew}
            className="h-10 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all shrink-0"
          >
            <Plus size={16} /> New Campaign
          </button>
        )}
      </div>

      {/* Form */}
      {editingCampaign && (
        <form id="campaign-form" onSubmit={saveCampaign} className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100">
            <h4 className="font-bold text-secondary">{isEditing ? 'Edit Campaign' : 'New Campaign'}</h4>
            <button
              type="button"
              onClick={() => setEditingCampaign(null)}
              title="Close"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-4 sm:p-5">
            {/* Left: details */}
            <div className="space-y-4">
              <div>
                <label className={label} htmlFor="campaign-name">Campaign name</label>
                <input
                  id="campaign-name"
                  type="text"
                  value={draft.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const auto = normalizeCampaignSlug(name);
                    update({ name, ...(slugTouched ? {} : { slug: auto || draft.slug || '' }) });
                  }}
                  placeholder="যেমন: Winter Koti Offer"
                  className={input}
                />
              </div>

              <div>
                <label className={label} htmlFor="campaign-slug">Link</label>
                <div className="flex items-stretch rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary overflow-hidden">
                  <span className="hidden sm:flex items-center pl-3.5 pr-1 text-xs text-gray-400 font-semibold whitespace-nowrap">/campaign/</span>
                  <input
                    id="campaign-slug"
                    type="text"
                    value={draft.slug || ''}
                    onChange={(e) => {
                      setSlugTouched(true);
                      update({ slug: e.target.value });
                    }}
                    onBlur={() => update({ slug: normalizeCampaignSlug(draft.slug) || suggestCampaignSlug(draft.name) })}
                    placeholder="winter-koti-offer"
                    className="flex-1 min-w-0 h-11 bg-transparent px-3 sm:px-1 text-sm font-semibold text-gray-900 outline-none"
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-2 min-h-[20px]">
                  {slugTaken ? (
                    <p className="text-[11px] font-bold text-red-400">এই লিংক আরেকটি ক্যাম্পেইনে আছে</p>
                  ) : slug ? (
                    <>
                      <p className="text-[11px] text-gray-500 truncate">{campaignLink(slug)}</p>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => copyText(campaignLink(slug), 'লিংক কপি হয়েছে')}
                          className="text-[11px] font-bold text-gray-700 hover:underline shrink-0"
                        >
                          Copy
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400">নাম লিখলে লিংক নিজেই তৈরি হবে (বাংলা নাম হলে "offer-…")</p>
                  )}
                </div>
              </div>

              <div>
                <label className={label} htmlFor="campaign-desc">Short description (optional)</label>
                <textarea
                  id="campaign-desc"
                  rows={2}
                  maxLength={500}
                  value={draft.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="যেমন: শীতের সেরা কোটি, ক্যাশ অন ডেলিভারি"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={label.replace(' mb-1.5', '')}>Banner (optional)</span>
                  {draft.image && (
                    <button type="button" onClick={() => update({ image: '' })} className="text-[11px] font-bold text-gray-500 hover:text-gray-800">
                      Remove
                    </button>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleAdminImageUpload(e, 'campaign')} className="hidden" id="campaignImageUpload" />
                <label
                  htmlFor="campaignImageUpload"
                  className="w-full min-h-[96px] bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                >
                  {draft.image ? (
                    <img src={draft.image} className="w-full max-h-40 object-cover" alt="Banner preview" />
                  ) : (
                    <>
                      <Upload size={18} className="text-gray-400" />
                      <span className="text-[11px] font-semibold text-gray-500 mt-1">ব্যানার দিন (না দিলে নাম দিয়ে ব্যানার তৈরি হবে)</span>
                    </>
                  )}
                </label>
              </div>

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
                <span>
                  <span className="block text-sm font-bold text-gray-900">Live</span>
                  <span className="block text-[11px] text-gray-500">বন্ধ থাকলে লিংক খুললে কাস্টমার হোম পেজে যাবে</span>
                </span>
                <input
                  type="checkbox"
                  checked={draft.isActive !== false}
                  onChange={(e) => update({ isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <span className="relative w-10 h-6 rounded-full bg-gray-300 peer-checked:bg-[#3fdc9a]/60 transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4 shrink-0" />
              </label>
            </div>

            {/* Right: products */}
            <div className="flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className={label.replace(' mb-1.5', '')}>Products ({selectedIds.length} selected)</span>
                {selectedIds.length > 0 && (
                  <button type="button" onClick={() => update({ productIds: [] })} className="text-[11px] font-bold text-gray-500 hover:text-gray-800">
                    Clear
                  </button>
                )}
              </div>
              <div className="relative mb-2">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="নাম বা কোড দিয়ে খুঁজুন..."
                  className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div className="flex-1 max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                {pickerProducts.length === 0 && <p className="p-6 text-center text-xs text-gray-400">কোনো পণ্য পাওয়া যায়নি</p>}
                {pickerProducts.map((p) => {
                  const on = selectedIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      aria-pressed={on}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${on ? 'bg-white/[0.06]' : 'hover:bg-gray-50'}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          on ? 'bg-[#3fdc9a]/60 border-transparent text-white' : 'border-gray-300'
                        }`}
                      >
                        {on && <Check size={13} />}
                      </span>
                      <img
                        loading="lazy"
                        src={p.image || '/logo.webp'}
                        alt=""
                        className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.webp';
                        }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-gray-900 truncate">{p.name}</span>
                        <span className="block text-[10px] text-gray-500 font-mono">{p.code || p.category}</span>
                      </span>
                      <span className="text-xs font-bold text-gray-700 shrink-0">৳{p.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 px-4 sm:px-5 py-3.5 border-t border-gray-100">
            <button
              type="submit"
              disabled={slugTaken}
              className="flex-1 sm:flex-none sm:px-8 h-11 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Check size={16} /> {isEditing ? 'Update & copy link' : 'Save & copy link'}
            </button>
            <button
              type="button"
              onClick={() => setEditingCampaign(null)}
              className="h-11 px-5 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {campaigns.length === 0 ? (
        !editingCampaign && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-14 text-center">
            <Gift size={36} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">এখনো কোনো ক্যাম্পেইন নেই</p>
            <button type="button" onClick={startNew} className="mt-3 text-xs font-bold text-gray-700 underline">
              প্রথম ক্যাম্পেইন তৈরি করুন
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
          {[...campaigns]
            .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
            .map((c) => {
              const ids: string[] = c.productIds || [];
              const thumbs = ids.map((id) => productById.get(id)).filter(Boolean).slice(0, 5) as any[];
              const missing = ids.filter((id) => !productById.has(id)).length;
              const link = campaignLink(normalizeCampaignSlug(c.slug) || String(c.slug || ''));
              return (
                <div key={c.id} className={`bg-white rounded-2xl border flex flex-col overflow-hidden ${editingCampaign?.id === c.id ? 'border-white/40' : 'border-gray-100'}`}>
                  <div className="relative h-28 bg-gray-50">
                    {c.image ? (
                      <img loading="lazy" src={c.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center px-4 text-center text-base font-black text-gray-600">{c.name}</div>
                    )}
                    <span
                      className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold ${c.isActive ? 'tone-confirmed tone-chip' : 'tone-neutral tone-chip'}`}
                      style={{ color: 'var(--tone)', backgroundColor: 'rgba(0,0,0,0.55)' }}
                    >
                      {c.isActive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2.5">
                    <div className="min-w-0">
                      <p className="font-bold text-secondary truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{link.replace(/^https?:\/\//, '')}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2">
                        {thumbs.map((p) => (
                          <img key={p.id} src={p.image || '/logo.webp'} alt="" title={p.name} className="w-7 h-7 rounded-full object-cover border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-gray-500">
                        {ids.length} products{missing ? ` (${missing} deleted)` : ''}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center gap-1 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => copyText(link, 'ক্যাম্পেইন লিংক কপি হয়েছে')}
                        className="h-8 px-2.5 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5"
                        title="Copy link"
                      >
                        <Copy size={13} /> Copy link
                      </button>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        title="Open"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100"
                      >
                        <ExternalLink size={15} />
                      </a>
                      <span className="flex-1" />
                      <button
                        type="button"
                        onClick={() => toggleLive(c)}
                        disabled={togglingId === c.id}
                        title={c.isActive ? 'Turn off (Draft)' : 'Go live'}
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${c.isActive ? 'bg-[#3fdc9a]/60' : 'bg-gray-300'}`}
                      >
                        {togglingId === c.id ? (
                          <Loader2 size={12} className="m-auto animate-spin text-white" />
                        ) : (
                          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${c.isActive ? 'translate-x-4' : ''}`} />
                        )}
                      </button>
                      <button type="button" onClick={() => startEdit(c)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCampaign(c.id)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
