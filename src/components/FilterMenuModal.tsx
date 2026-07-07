import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Award } from 'lucide-react';

export interface FilterMenuModalProps {
  t: any;
  minPrice: any;
  setMinPrice: any;
  maxPrice: any;
  setMaxPrice: any;
  brands: any;
  setSelectedBrand: any;
  selectedBrand: any;
  setIsFilterMenuOpen: any;
  isFilterMenuOpen: any;
}

export default function FilterMenuModal(props: FilterMenuModalProps) {
  const {
    t,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    brands,
    setSelectedBrand,
    selectedBrand,
    setIsFilterMenuOpen,
    isFilterMenuOpen,
  } = props;

  return (
    <>
      {isFilterMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-black text-secondary mb-4 flex items-center gap-2">
                      <Wallet size={16} className="text-primary" /> {t("মূল্য সীমা (৳)", "Price Range (৳)")}
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder={t("সর্বনিম্ন", "Min")}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                          className="w-full bg-cream rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20 border border-transparent focus:border-primary"
                        />
                      </div>
                      <span className="text-gray-400 font-bold">-</span>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder={t("সর্বোচ্চ", "Max")}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                          className="w-full bg-cream rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-2 ring-primary/20 border border-transparent focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Brands */}
                  {brands.length > 0 && (
                    <div>
                      <h4 className="text-sm font-black text-secondary mb-4 flex items-center gap-2">
                        <Award size={16} className="text-primary" /> {t("ব্র্যান্ড", "Brands")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedBrand("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedBrand === "all"
                              ? "bg-primary text-white"
                              : "bg-cream text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {t("সবগুলো", "All")}
                        </button>
                        {brands.map((brand) => (
                          <button
                            key={brand}
                            onClick={() => setSelectedBrand(brand)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              selectedBrand === brand
                                ? "bg-primary text-white"
                                : "bg-cream text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Clear & Close */}
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="w-full bg-secondary text-white py-3 rounded-xl font-black text-sm hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {t("ফিল্টার প্রয়োগ করুন", "Apply Filters")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
    </>
  );
}
