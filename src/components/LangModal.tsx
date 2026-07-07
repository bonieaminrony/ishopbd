import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LangModalProps {
  setIsLangModalOpen: any;
  Languages: any;
  t: any;
  languageList: any;
  setLanguage: any;
  language: any;
  isLangModalOpen: any;
}

export default function LangModal(props: LangModalProps) {
  const {
    setIsLangModalOpen,
    Languages,
    t,
    languageList,
    setLanguage,
    language,
    isLangModalOpen,
  } = props;

  return (
    <>
      {isLangModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLangModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Languages className="text-primary" size={32} />
                </div>
                <h3 className="text-xl font-black text-secondary">
                  {t("ভাষা নির্বাচন করুন", "Select Language")}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-bold">
                  {t("আপনার পছন্দের ভাষা বেছে নিন", "Choose your preferred language")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {languageList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      localStorage.setItem("app_lang", lang.code);
                      setIsLangModalOpen(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group ${
                      language === lang.code
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`text-lg font-black ${language === lang.code ? "text-primary" : "text-secondary"}`}>
                      {lang.native}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {lang.label}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="w-full mt-6 py-4 rounded-2xl bg-gray-100 text-secondary font-black text-xs hover:bg-gray-200 transition-all uppercase tracking-widest active:scale-95"
              >
                {t("বন্ধ করুন", "Close")}
              </button>
            </motion.div>
          </div>
        )}
    </>
  );
}
