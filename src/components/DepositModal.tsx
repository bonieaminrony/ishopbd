import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, X, Landmark } from 'lucide-react';

export interface DepositModalProps {
  isDepositModalOpen: any;
  setIsDepositModalOpen: any;
  handleDepositSubmit: any;
  setDepositAmount: any;
  depositAmount: any;
  setDepositMethod: any;
  depositMethod: any;
  depositTrxId: any;
  setDepositTrxId: any;
  isPaymentSimulating: any;
}

export default function DepositModal(props: DepositModalProps) {
  const {
    isDepositModalOpen,
    setIsDepositModalOpen,
    handleDepositSubmit,
    setDepositAmount,
    depositAmount,
    setDepositMethod,
    depositMethod,
    depositTrxId,
    setDepositTrxId,
    isPaymentSimulating,
  } = props;

  return (
    <>
      {isDepositModalOpen && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <PlusCircle size={24} /> টাকা যোগ করুন (ডিপোজিট)
                </h3>
                <button
                  onClick={() => setIsDepositModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleDepositSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    পরিমাণ নির্বাচন করুন (টাকা)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["100", "500", "1000", "5000"].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt)}
                        className={`py-3 rounded-xl text-sm font-black transition-all border-2 ${
                          depositAmount === amt
                            ? "border-primary bg-red-50 text-primary shadow-md"
                            : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full mt-4 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-lg font-black focus:border-primary outline-none transition-all"
                    placeholder="অথবা পরিমাণ লিখুন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    পেমেন্ট মাধ্যম
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDepositMethod("bkash")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        depositMethod === "bkash"
                          ? "border-[#D12053] bg-[#D12053]/5"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 mb-1 flex items-center justify-center rounded-lg bg-[#D12053] text-white">
                        
                        b
                      </div>
                      <span className="text-[10px] font-black text-[#D12053]">
                        বিকাশ
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod("nagad")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        depositMethod === "nagad"
                          ? "border-[#F7941D] bg-[#F7941D]/5"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="w-10 h-10 mb-1 flex items-center justify-center rounded-lg bg-[#F7941D] text-white">
                        
                        n
                      </div>
                      <span className="text-[10px] font-black text-[#F7941D]">
                        নগদ
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod("bank")}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group ${
                        depositMethod === "bank"
                          ? "border-primary bg-red-50"
                          : "border-gray-100"
                      }`}
                    >
                      <Landmark
                        className={`w-10 h-10 mb-1 ${depositMethod === "bank" ? "text-primary" : "text-gray-300"}`}
                      />
                      <span className="text-[10px] font-black text-gray-500 group-hover:text-primary">
                        ব্যাংক
                      </span>
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-[11px] font-bold text-gray-700 mb-2">
                    পেমেন্ট করার নিয়ম:
                  </p>
                  <div className="text-[11px] text-gray-500 space-y-2">
                    <p>১. নিচের নাম্বারে (Send Money) করুন।</p>
                    <div className="flex items-center justify-between bg-white p-2 border border-gray-100 rounded-lg">
                      <span className="font-bold font-mono">01700000000</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                        Personal
                      </span>
                    </div>
                    <p>২. পেমেন্ট শেষে ট্রানজেকশন আইডি (Trx ID) নিচে দিন।</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    ট্রানজেকশন আইডি (Trx ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none transition-all uppercase placeholder:normal-case"
                    placeholder="যেমন: ABC123XYZ"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPaymentSimulating}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isPaymentSimulating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ভেরিফাই হচ্ছে...
                    </>
                  ) : (
                    <>টাকা যোগ করুন ৳{depositAmount}</>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center italic">
                  ভুল ট্রানজেকশন আইডি দিলে আপনার আইডি ব্লক হতে পারে।
                </p>
              </form>
            </motion.div>
          </div>
        )}
    </>
  );
}
