import React, { useState, useMemo } from 'react';
import { Ruler, X, Check, AlertCircle } from 'lucide-react';

export interface ProductSizeGuideInlineProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
  selectedSize?: string;
  availableSizes?: string[];
  productName?: string;
  sizeGuideData?: any;
}

interface SizeRow {
  size: string;
  chestIn: string;
  chestCm: string;
  lengthIn: string;
  lengthCm: string;
  sleeveIn: string;
  sleeveCm: string;
  weightKg: string;
}

const DEFAULT_SIZE_CHART: SizeRow[] = [
  {
    size: 'S',
    chestIn: '36" - 38"',
    chestCm: '91 - 96 cm',
    lengthIn: '25.5"',
    lengthCm: '65 cm',
    sleeveIn: '23.5"',
    sleeveCm: '60 cm',
    weightKg: '42 - 52 kg',
  },
  {
    size: 'M',
    chestIn: '38" - 40"',
    chestCm: '96 - 101 cm',
    lengthIn: '26.5"',
    lengthCm: '67 cm',
    sleeveIn: '24"',
    sleeveCm: '61 cm',
    weightKg: '50 - 62 kg',
  },
  {
    size: 'L',
    chestIn: '40" - 42"',
    chestCm: '101 - 106 cm',
    lengthIn: '27.5"',
    lengthCm: '70 cm',
    sleeveIn: '24.5"',
    sleeveCm: '62 cm',
    weightKg: '63 - 72 kg',
  },
  {
    size: 'XL',
    chestIn: '42" - 44"',
    chestCm: '106 - 111 cm',
    lengthIn: '28.5"',
    lengthCm: '72 cm',
    sleeveIn: '25"',
    sleeveCm: '63.5 cm',
    weightKg: '73 - 82 kg',
  },
  {
    size: 'XXL',
    chestIn: '44" - 46"',
    chestCm: '111 - 117 cm',
    lengthIn: '29.5"',
    lengthCm: '75 cm',
    sleeveIn: '25.5"',
    sleeveCm: '65 cm',
    weightKg: '83 - 95 kg',
  },
  {
    size: '3XL',
    chestIn: '46" - 48"',
    chestCm: '117 - 122 cm',
    lengthIn: '30.5"',
    lengthCm: '77 cm',
    sleeveIn: '26"',
    sleeveCm: '66 cm',
    weightKg: '95 - 110 kg',
  },
];

export const ProductSizeGuideInline: React.FC<ProductSizeGuideInlineProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  selectedSize,
  availableSizes = [],
  productName,
  sizeGuideData,
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'table'>('calculator');
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Calculator inputs
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(6);
  const [weightKg, setWeightKg] = useState<string>('65');
  const [fitPreference, setFitPreference] = useState<'regular' | 'loose'>('regular');

  const sizeChart: SizeRow[] = useMemo(() => {
    if (sizeGuideData && Array.isArray(sizeGuideData.rows) && sizeGuideData.rows.length > 0) {
      return sizeGuideData.rows;
    }
    return DEFAULT_SIZE_CHART;
  }, [sizeGuideData]);

  // Compute recommended size
  const calculatedResult = useMemo(() => {
    const weight = parseFloat(weightKg);
    if (isNaN(weight) || weight < 35 || weight > 160) return null;

    const totalHeightInches = heightFeet * 12 + heightInches;
    let recommended = 'L';
    let fitNote = 'স্ট্যান্ডার্ড ফিট';

    if (totalHeightInches < 64) {
      if (weight <= 50) recommended = 'S';
      else if (weight <= 58) recommended = 'M';
      else if (weight <= 68) recommended = 'L';
      else if (weight <= 78) recommended = 'XL';
      else recommended = 'XXL';
    } else if (totalHeightInches <= 67) {
      if (weight <= 52) recommended = 'S';
      else if (weight <= 62) recommended = 'M';
      else if (weight <= 72) recommended = 'L';
      else if (weight <= 82) recommended = 'XL';
      else recommended = 'XXL';
    } else if (totalHeightInches <= 70) {
      if (weight <= 55) recommended = 'S';
      else if (weight <= 62) recommended = 'M';
      else if (weight <= 74) recommended = 'L';
      else if (weight <= 85) recommended = 'XL';
      else recommended = 'XXL';
    } else if (totalHeightInches <= 73) {
      if (weight <= 68) recommended = 'L';
      else if (weight <= 82) recommended = 'XL';
      else if (weight <= 95) recommended = 'XXL';
      else recommended = '3XL';
    } else {
      if (weight <= 75) recommended = 'XL';
      else if (weight <= 95) recommended = 'XXL';
      else recommended = '3XL';
    }

    if (fitPreference === 'loose') {
      if (recommended === 'S') recommended = 'M';
      else if (recommended === 'M') recommended = 'L';
      else if (recommended === 'L') recommended = 'XL';
      else if (recommended === 'XL') recommended = 'XXL';
      else if (recommended === 'XXL') recommended = '3XL';
      fitNote = 'একটু ঢিলেঢালা বা আরামদায়ক ফিটিং';
    } else {
      fitNote = 'বডির সাথে মানানসই ও স্বাভাবিক ফিটিং';
    }

    const row = sizeChart.find((r) => r.size.toUpperCase() === recommended.toUpperCase());

    const isAvailableInProduct = availableSizes.length === 0 || availableSizes.some(
      (s) => s.toUpperCase() === recommended.toUpperCase() || s.toUpperCase() === (recommended === 'XXL' ? '2XL' : '')
    );

    return {
      size: recommended,
      fitNote,
      chest: row ? row.chestIn : '',
      length: row ? row.lengthIn : '',
      isAvailableInProduct,
    };
  }, [heightFeet, heightInches, weightKg, fitPreference, sizeChart, availableSizes]);

  if (!isOpen) return null;

  return (
    <div className="w-full mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 animate-fadeIn">
      {/* Top Header with title & close button */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Ruler size={16} className="text-gray-700" />
          <span className="text-sm font-bold text-gray-900">সাইজ গাইড ও রিকমেন্ডার</span>
          {productName && (
            <span className="hidden sm:inline text-xs text-gray-500 font-normal truncate max-w-[180px]">
              • {productName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1"
          title="বন্ধ করুন"
        >
          <span>বন্ধ করুন</span>
          <X size={14} />
        </button>
      </div>

      {/* Switcher: Calculator vs Measurement Chart */}
      <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 rounded-xl gap-1 mb-3.5">
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'calculator'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          সাইজ রিকমেন্ডার
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
            activeTab === 'table'
              ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          পরিমাপ চার্ট
        </button>
      </div>

      {/* Tab 1: Calculator */}
      {activeTab === 'calculator' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                উচ্চতা (Height)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-400"
                >
                  {[4, 5, 6].map((ft) => (
                    <option key={ft} value={ft}>
                      {ft} ফুট
                    </option>
                  ))}
                </select>
                <select
                  value={heightInches}
                  onChange={(e) => setHeightInches(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-gray-400"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} ইঞ্চি
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ওজন (Weight)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="35"
                  max="150"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="65"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium rounded-lg px-3 py-1.5 pr-10 outline-none focus:border-gray-400"
                />
                <span className="absolute right-3 top-1.5 text-xs text-gray-400 font-medium pointer-events-none">
                  কেজি
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              ফিটিং পছন্দ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFitPreference('regular')}
                className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                  fitPreference === 'regular'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                রেগুলার ফিট
              </button>
              <button
                type="button"
                onClick={() => setFitPreference('loose')}
                className={`py-1.5 px-3 text-xs font-medium rounded-lg border transition-all text-center ${
                  fitPreference === 'loose'
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                একটু ঢিলেঢালা ফিট
              </button>
            </div>
          </div>

          {/* Result Card */}
          {calculatedResult && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-medium">প্রস্তাবিত সাইজ</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5 flex items-center gap-2">
                    <span>সাইজ {calculatedResult.size}</span>
                    {selectedSize === calculatedResult.size && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check size={10} /> সিলেক্টেড
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">
                    {calculatedResult.fitNote}
                  </div>
                  {!calculatedResult.isAvailableInProduct && availableSizes.length > 0 && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 rounded-md p-1.5 mt-1.5 flex items-center gap-1 border border-amber-200">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>স্টকে উপলব্ধ সাইজ: {availableSizes.join(', ')}</span>
                    </div>
                  )}
                </div>

                {onSelectSize && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSize(calculatedResult.size);
                      onClose();
                    }}
                    className="self-start sm:self-center px-4 py-2 bg-primary hover:bg-red-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
                  >
                    সাইজ {calculatedResult.size} নির্বাচন করুন
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Measurement Chart */}
      {activeTab === 'table' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              {availableSizes.length > 0 ? 'পছন্দের সাইজে ক্লিক করে নির্বাচন করতে পারেন' : 'পরিমাপ অনুযায়ী সাইজ নির্বাচন করুন'}
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  unit === 'in' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                }`}
              >
                ইঞ্চি
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  unit === 'cm' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'
                }`}
              >
                সেমি
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="py-2 px-2.5">সাইজ</th>
                  <th className="py-2 px-2.5">বুক (Chest)</th>
                  <th className="py-2 px-2.5">দৈর্ঘ্য</th>
                  <th className="py-2 px-2.5">হাতা</th>
                  <th className="py-2 px-2.5 text-right">উপযুক্ত ওজন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {sizeChart.map((row) => {
                  const isRowSelected = selectedSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      onClick={() => {
                        if (onSelectSize) {
                          onSelectSize(row.size);
                        }
                      }}
                      className={`hover:bg-primary/5 transition-colors cursor-pointer ${
                        isRowSelected ? 'bg-red-50/60 font-semibold' : ''
                      }`}
                      title={`${row.size} সাইজ নির্বাচন করতে ক্লিক করুন`}
                    >
                      <td className="py-2 px-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{row.size}</span>
                        {isRowSelected && <Check size={12} className="text-primary" />}
                      </td>
                      <td className="py-2 px-2.5">{unit === 'in' ? row.chestIn : row.chestCm}</td>
                      <td className="py-2 px-2.5">{unit === 'in' ? row.lengthIn : row.lengthCm}</td>
                      <td className="py-2 px-2.5">{unit === 'in' ? row.sleeveIn : row.sleeveCm}</td>
                      <td className="py-2 px-2.5 text-right font-medium text-gray-600">{row.weightKg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSizeGuideInline;
