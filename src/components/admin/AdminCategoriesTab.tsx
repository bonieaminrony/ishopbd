import React, { useState } from 'react';
import { LayoutGrid, Share2, X } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface AdminCategoriesTabProps {
  categories: any[];
  editingCategory: any;
  setEditingCategory: (cat: any) => void;
  saveCategory: (e: React.FormEvent) => void;
  copyCategoryLink: (name: string) => void;
  deleteCategory: (id: string, name: string) => Promise<void> | void;
  deletingCatId: string | null;
}

export default function AdminCategoriesTab({
  categories,
  editingCategory,
  setEditingCategory,
  saveCategory,
  copyCategoryLink,
  deleteCategory,
  deletingCatId,
}: AdminCategoriesTabProps) {
  const [newSubcategoryInputs, setNewSubcategoryInputs] = useState<Record<string, string>>({});

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Category Header & Add Form */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-primary rounded-2xl">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary">Categories &amp; Subcategories</h3>
              <p className="text-xs text-gray-500 font-medium">Create and organize product categories and subcategories</p>
            </div>
          </div>
          <div className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold self-start sm:self-auto">
            Total: {categories.length} Categories
          </div>
        </div>

        <form onSubmit={saveCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={editingCategory?.name || ''}
            onChange={(e) =>
              setEditingCategory({
                ...editingCategory,
                name: e.target.value,
              })
            }
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-sm text-gray-900 transition-all"
            placeholder="e.g. Smart Watch, Winter Wear..."
          />
          <div className="flex gap-2">
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-primary/20 hover:bg-red-700 transition-all active:scale-95 text-sm whitespace-nowrap cursor-pointer">
              {editingCategory?.id ? 'Update Category' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const subcats = cat.subcategories || [];
          return (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
                    <p className="font-bold text-secondary text-base">{cat.name}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyCategoryLink(cat.name)}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-1 cursor-pointer"
                      title="Action"
                    >
                      <Share2 size={12} /> Link
                    </button>
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="text-xs font-bold text-gray-500 hover:text-primary transition-colors px-2.5 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"
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
                      className={`text-xs font-bold transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${
                        deletingCatId === String(cat.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-red-500 hover:bg-red-50 active:scale-95 border border-transparent hover:border-red-100'
                      }`}
                    >
                      {deletingCatId === String(cat.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Subcategories Management */}
                <div className="mt-4">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Subcategories ({subcats.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                    {subcats.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">No subcategories defined</span>
                    ) : (
                      subcats.map((sub: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 text-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
                        >
                          {sub}
                          <button
                            type="button"
                            onClick={async () => {
                              await updateDoc(doc(db, 'categories', cat.id), {
                                subcategories: arrayRemove(sub),
                              });
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <input
                  type="text"
                  value={newSubcategoryInputs[cat.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewSubcategoryInputs((prev) => ({ ...prev, [cat.id]: val }));
                  }}
                  placeholder="Add subcategory name..."
                  className="flex-1 bg-gray-50/70 border border-gray-200 transition-colors focus:border-primary focus:bg-white text-xs font-bold px-3 py-2 rounded-xl outline-none"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const subName = (newSubcategoryInputs[cat.id] || '').trim();
                      if (subName) {
                        await updateDoc(doc(db, 'categories', cat.id), {
                          subcategories: arrayUnion(subName),
                        });
                        setNewSubcategoryInputs((prev) => ({ ...prev, [cat.id]: '' }));
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const subName = (newSubcategoryInputs[cat.id] || '').trim();
                    if (subName) {
                      await updateDoc(doc(db, 'categories', cat.id), {
                        subcategories: arrayUnion(subName),
                      });
                      setNewSubcategoryInputs((prev) => ({ ...prev, [cat.id]: '' }));
                    }
                  }}
                  className="bg-primary hover:brightness-105 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shadow-primary/10 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
