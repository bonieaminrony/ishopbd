import React, { useMemo, useRef, useState } from 'react';
import { Check, Edit3, LayoutGrid, Link2, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../lib/firebase';

export interface AdminCategoriesTabProps {
  categories: any[];
  editingCategory: any;
  setEditingCategory: (cat: any) => void;
  saveCategory: (e: React.FormEvent) => void;
  copyCategoryLink: (name: string) => void;
  deleteCategory: (id: string, name: string) => Promise<void> | void;
  deletingCatId: string | null;
  /** Used only to show how many products are in each category / subcategory. */
  products?: any[];
}

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();

export default function AdminCategoriesTab({
  categories,
  editingCategory,
  setEditingCategory,
  saveCategory,
  copyCategoryLink,
  deleteCategory,
  deletingCatId,
  products = [],
}: AdminCategoriesTabProps) {
  const [newSubcategoryInputs, setNewSubcategoryInputs] = useState<Record<string, string>>({});
  const [busySub, setBusySub] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Product counts per category and per "category|subcategory".
  const counts = useMemo(() => {
    const byCat = new Map<string, number>();
    const bySub = new Map<string, number>();
    for (const p of products) {
      if (!p || p.deleted) continue;
      const c = norm(p.category);
      if (!c) continue;
      byCat.set(c, (byCat.get(c) || 0) + 1);
      const s = norm(p.subcategory);
      if (s) bySub.set(`${c}|${s}`, (bySub.get(`${c}|${s}`) || 0) + 1);
    }
    return { byCat, bySub };
  }, [products]);

  const visibleCategories = useMemo(() => {
    const q = norm(query);
    if (!q) return categories;
    return categories.filter(
      (c) => norm(c.name).includes(q) || (c.subcategories || []).some((s: string) => norm(s).includes(q)),
    );
  }, [categories, query]);

  const isEditing = Boolean(editingCategory?.id);

  const startEdit = (cat: any) => {
    setEditingCategory(cat);
    // The form is at the top; bring it into view (on phones it is far away) and focus it.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nameInputRef.current?.focus();
    });
  };

  const addSubcategory = async (cat: any) => {
    const subName = (newSubcategoryInputs[cat.id] || '').trim();
    if (!subName) return;
    if ((cat.subcategories || []).some((s: string) => norm(s) === norm(subName))) {
      toast.error(`"${subName}" আগে থেকেই আছে`);
      return;
    }
    setBusySub(`${cat.id}|+`);
    try {
      await updateDoc(doc(db, 'categories', cat.id), { subcategories: arrayUnion(subName) });
      setNewSubcategoryInputs((prev) => ({ ...prev, [cat.id]: '' }));
    } catch (err) {
      console.error('Add subcategory failed', err);
      toast.error('সাবক্যাটাগরি যোগ হয়নি, আবার চেষ্টা করুন');
    } finally {
      setBusySub(null);
    }
  };

  const removeSubcategory = async (cat: any, sub: string) => {
    const inUse = counts.bySub.get(`${norm(cat.name)}|${norm(sub)}`) || 0;
    const message = inUse
      ? `"${sub}" সাবক্যাটাগরিতে ${inUse}টি প্রোডাক্ট আছে। সরালে প্রোডাক্টগুলো থাকবে, শুধু এই সাবক্যাটাগরির তালিকা থেকে বাদ যাবে। সরাবেন?`
      : `"${sub}" সাবক্যাটাগরি সরাবেন?`;
    if (!window.confirm(message)) return;
    setBusySub(`${cat.id}|${sub}`);
    try {
      await updateDoc(doc(db, 'categories', cat.id), { subcategories: arrayRemove(sub) });
    } catch (err) {
      console.error('Remove subcategory failed', err);
      toast.error('সাবক্যাটাগরি সরানো যায়নি, আবার চেষ্টা করুন');
    } finally {
      setBusySub(null);
    }
  };

  const iconBtn =
    'w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer';

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Title, add / edit form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
              <LayoutGrid size={20} className="text-primary shrink-0" />
              Categories
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {categories.length} categories · {categories.reduce((n, c) => n + (c.subcategories?.length || 0), 0)} subcategories
            </p>
          </div>
          {categories.length > 6 && (
            <div className="relative w-40 sm:w-56">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}
        </div>

        <form ref={formRef} onSubmit={saveCategory} className="space-y-1.5">
          {isEditing && (
            <p className="text-[11px] font-bold text-primary">Editing: {categories.find((c) => c.id === editingCategory.id)?.name}</p>
          )}
          <div className="flex gap-2">
            <input
              ref={nameInputRef}
              type="text"
              required
              value={editingCategory?.name || ''}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className="flex-1 min-w-0 h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-semibold text-sm text-gray-900 transition-all"
              placeholder={isEditing ? 'Category name' : 'New category name'}
            />
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                title="Cancel"
                className="h-11 px-3 sm:px-4 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all cursor-pointer"
              >
                <span className="hidden sm:inline">Cancel</span>
                <X size={16} className="sm:hidden" />
              </button>
            )}
            <button className="h-11 px-4 sm:px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-sm hover:opacity-90 transition-all active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1.5">
              {isEditing ? <Check size={16} /> : <Plus size={16} />}
              {isEditing ? 'Update' : 'Add'}
              <span className="hidden sm:inline">{isEditing ? '' : ' Category'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category cards */}
      {visibleCategories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center text-gray-400 text-sm font-semibold">
          {categories.length === 0 ? 'No categories yet. Add the first one above.' : 'No category matches your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
          {visibleCategories.map((cat) => {
            const subcats: string[] = cat.subcategories || [];
            const catCount = counts.byCat.get(norm(cat.name)) || 0;
            const isDeleting = deletingCatId === String(cat.id);
            const isBeingEdited = editingCategory?.id === cat.id;
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl border flex flex-col ${isBeingEdited ? 'border-primary/50' : 'border-gray-100'}`}
              >
                {/* Name, product count, actions */}
                <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-3 border-b border-gray-100">
                  <div className="min-w-0">
                    <p className="font-bold text-secondary text-[15px] truncate">{cat.name}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">
                      {catCount} {catCount === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button type="button" onClick={() => copyCategoryLink(cat.name)} className={iconBtn} title="Copy category link">
                      <Link2 size={16} />
                    </button>
                    <button type="button" onClick={() => startEdit(cat)} className={iconBtn} title="Rename category">
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await deleteCategory(cat.id, cat.name);
                      }}
                      disabled={isDeleting}
                      title="Delete category"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="px-4 py-3 flex-1">
                  {subcats.length === 0 ? (
                    <p className="text-xs text-gray-400">No subcategories</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {subcats.map((sub) => {
                        const subCount = counts.bySub.get(`${norm(cat.name)}|${norm(sub)}`) || 0;
                        const busy = busySub === `${cat.id}|${sub}`;
                        return (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700"
                          >
                            {sub}
                            <span className="text-[10px] text-gray-400 tabular-nums">{subCount}</span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => removeSubcategory(cat, sub)}
                              title={`Remove "${sub}"`}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              {busy ? <Loader2 size={11} className="animate-spin" /> : <X size={12} />}
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add subcategory */}
                <div className="flex gap-2 px-4 pb-4">
                  <input
                    type="text"
                    value={newSubcategoryInputs[cat.id] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewSubcategoryInputs((prev) => ({ ...prev, [cat.id]: val }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubcategory(cat);
                      }
                    }}
                    placeholder="Add subcategory..."
                    aria-label={`Add subcategory to ${cat.name}`}
                    className="flex-1 min-w-0 h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    disabled={!(newSubcategoryInputs[cat.id] || '').trim() || busySub === `${cat.id}|+`}
                    onClick={() => addSubcategory(cat)}
                    title="Add subcategory"
                    className="h-9 w-9 shrink-0 rounded-lg bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    {busySub === `${cat.id}|+` ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
