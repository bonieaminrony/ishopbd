import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, LayoutGrid, Check } from 'lucide-react';
import { Category } from '../types';

export interface MobileCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  onSelectCategory: (categoryName: string, subcategoryName?: string) => void;
  t?: any;
  tc?: (catName: string) => string;
}

export const MobileCategoryDrawer: React.FC<MobileCategoryDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  t = (bn: string, en?: string) => bn,
  tc = (cat: string) => cat,
}) => {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex flex-col justify-end md:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Bottom Sheet Drawer */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="relative bg-white rounded-t-3xl max-h-[82vh] flex flex-col z-10 shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom,16px)]"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-cream/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-secondary leading-none">
                  {t("সকল ক্যাটাগরি", "All Categories")}
                </h3>
                <span className="text-[11px] text-gray-500 font-medium">
                  {categories.length} টি ক্যাটাগরি উপলব্ধ
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-secondary rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Categories List */}
          <div className="overflow-y-auto p-4 space-y-2 no-scrollbar">
            {/* All Products Item */}
            <button
              onClick={() => {
                onSelectCategory("all", "all");
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                  : "bg-gray-50/80 text-secondary hover:bg-gray-100 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🛍️</span>
                <span className="text-sm font-bold">{t("সকল প্রোডাক্ট", "All Products")}</span>
              </div>
              {selectedCategory === "all" && <Check size={18} className="text-white" />}
            </button>

            {/* Category Items */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const subcats = cat.subcategories || [];
              const isExpanded = expandedCat === cat.id;

              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
                  <div
                    className={`flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                      isSelected && selectedSubcategory === "all"
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-gray-50 text-secondary font-semibold"
                    }`}
                    onClick={() => {
                      if (subcats.length > 0) {
                        setExpandedCat(isExpanded ? null : cat.id);
                      } else {
                        onSelectCategory(cat.name, "all");
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon || "📦"}</span>
                      <span className="text-sm font-bold">{tc(cat.name)}</span>
                      {subcats.length > 0 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                          {subcats.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategory(cat.name, "all");
                          onClose();
                        }}
                        className="text-xs text-primary font-bold px-2.5 py-1 bg-primary/10 rounded-lg hover:bg-primary hover:text-white transition-all"
                      >
                        {t("দেখুন", "View")}
                      </button>
                      {subcats.length > 0 && (
                        <ChevronRight
                          size={18}
                          className={`text-gray-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-90 text-primary" : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Subcategories Dropdown */}
                  {subcats.length > 0 && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50/70 p-2.5 border-t border-gray-100 flex flex-wrap gap-2"
                    >
                      <button
                        onClick={() => {
                          onSelectCategory(cat.name, "all");
                          onClose();
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                          isSelected && selectedSubcategory === "all"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {t("সবগুলো", "All")}
                      </button>
                      {subcats.map((sub, idx) => {
                        const isSubSelected = isSelected && selectedSubcategory === sub;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              onSelectCategory(cat.name, sub);
                              onClose();
                            }}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                              isSubSelected
                                ? "bg-primary text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default MobileCategoryDrawer;
