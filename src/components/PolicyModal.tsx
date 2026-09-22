import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface PolicyModalProps {
  activePolicy: 'about' | 'privacy' | 'refund' | 'terms' | null;
  setActivePolicy: (policy: 'about' | 'privacy' | 'refund' | 'terms' | null) => void;
  siteConfig: any;
}

export default function PolicyModal({ activePolicy, setActivePolicy, siteConfig }: PolicyModalProps) {
  if (!activePolicy) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => setActivePolicy(null)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <h3 className="text-xl font-bold">
            {activePolicy === "about" && "আমাদের সম্পর্কে"}
            {activePolicy === "privacy" && "গোপনীয়তা নীতি"}
            {activePolicy === "refund" && "রিফান্ড পলিসি"}
            {activePolicy === "terms" && "নিয়মাবলী ও শর্তাবলী"}
          </h3>
          <button
            onClick={() => setActivePolicy(null)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto text-secondary leading-relaxed space-y-6 overflow-x-hidden no-scrollbar">
          {activePolicy === "about" && (
            <div className="space-y-4">
              <p className="font-bold text-lg text-primary">
                i SHOP BD - বাংলাদেশের অন্যতম জনপ্রিয় গ্যাজেট ও লাইফস্টাইল শপ
              </p>
              <div className="whitespace-pre-wrap leading-relaxed">
                {siteConfig?.aboutUs || "i SHOP BD (ishopbd.com) একটি বিশ্বস্ত অনলাইন শপ।"}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="font-black text-secondary mb-2 uppercase text-[10px] md:text-xs tracking-widest">যোগাযোগ:</p>
                <p className="text-sm font-bold text-gray-600">
                  হেল্পলাইন ১: {siteConfig?.supportPhone1 || "০১৭০০০০০০০০"}
                </p>
                <p className="text-sm font-bold text-gray-600 mt-1">
                  হেল্পলাইন ২: {siteConfig?.supportPhone2 || "০১৮০০০০০০০০"}
                </p>
              </div>
            </div>
          )}
          {activePolicy === "privacy" && (
            <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
              {siteConfig?.privacyPolicy || "আপনার ব্যক্তিগত তথ্যের সুরক্ষা আমাদের প্রধান অগ্রাধিকার।"}
            </div>
          )}
          {activePolicy === "refund" && (
            <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
              {siteConfig?.refundPolicy || "পণ্য হাতে পাওয়ার পর কোনো সমস্যা থাকলে ৭ দিনের মধ্যে রিটার্ন/রিফান্ড প্রযোজ্য।"}
            </div>
          )}
          {activePolicy === "terms" && (
            <div className="space-y-4 whitespace-pre-wrap leading-relaxed">
              {siteConfig?.termsAndConditions || "ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি আমাদের শর্তাবলীতে সম্মত হচ্ছেন।"}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={() => setActivePolicy(null)}
            className="bg-secondary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
