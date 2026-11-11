import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, RotateCcw, Trash2 } from 'lucide-react';

export interface SecretTokenFieldProps {
  fieldId: string;
  label: string;
  required?: boolean;
  value: string;
  hasSavedToken?: boolean;
  maskedPreview?: string;
  isMarkedForClear?: boolean;
  placeholderNew: string;
  placeholderSaved?: string;
  helperText?: React.ReactNode;
  onChangeValue: (next: string) => void;
  onToggleClear: (clear: boolean) => void;
}

export default function SecretTokenField({
  fieldId,
  label,
  required = false,
  value,
  hasSavedToken = false,
  maskedPreview = '',
  isMarkedForClear = false,
  placeholderNew,
  placeholderSaved = 'আগের টোকেন সার্ভারে সংরক্ষিত আছে — পরিবর্তন করতে চাইলে নতুন টোকেন পেস্ট করুন',
  helperText,
  onChangeValue,
  onToggleClear,
}: SecretTokenFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label
          htmlFor={fieldId}
          className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {value.trim().length > 0 ? (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              নতুন টোকেন প্রস্তুত — সেভ বাটনে চাপুন
            </span>
          ) : isMarkedForClear ? (
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1.5">
              সেভ করলে আগের টোকেন মুছে যাবে
              <button
                type="button"
                onClick={() => onToggleClear(false)}
                className="underline inline-flex items-center gap-0.5 hover:text-red-900"
              >
                <RotateCcw size={10} /> বাতিল
              </button>
            </span>
          ) : hasSavedToken ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              <span>সার্ভারে সুরক্ষিত{maskedPreview ? `: ${maskedPreview}` : ''}</span>
              <button
                type="button"
                onClick={() => {
                  onChangeValue('');
                  onToggleClear(true);
                }}
                className="text-red-500 hover:text-red-700 inline-flex items-center gap-0.5 ml-1"
                title="সংরক্ষিত টোকেন মুছুন"
              >
                <Trash2 size={11} /> মুছুন
              </button>
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative">
        <input
          key={fieldId}
          id={fieldId}
          name={fieldId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            if (isMarkedForClear) onToggleClear(false);
            onChangeValue(e.target.value);
          }}
          placeholder={hasSavedToken && !isMarkedForClear ? placeholderSaved : placeholderNew}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-primary"
          autoComplete="new-password"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          title={visible ? 'লুকান' : 'দেখুন'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {helperText && <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{helperText}</p>}
    </div>
  );
}
