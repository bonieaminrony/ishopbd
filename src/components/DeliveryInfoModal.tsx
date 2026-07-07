import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck } from 'lucide-react';

export interface DeliveryInfoModalProps {
  setIsDeliveryInfoOpen: any;
  isDeliveryInfoOpen: any;
}

export default function DeliveryInfoModal(props: DeliveryInfoModalProps) {
  const {
    setIsDeliveryInfoOpen,
    isDeliveryInfoOpen,
  } = props;

  return (
    <>
      {isDeliveryInfoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeliveryInfoOpen(false)}
              className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={() => setIsDeliveryInfoOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-secondary hover:bg-gray-200 transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Truck className="text-primary" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-secondary uppercase tracking-tight">ডেলিভারি তথ্য</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">পণ্যের ওজন অনুযায়ী চার্জ</p>
                  </div>
                </div>
                <div className="grid gap-6">
                  {/* Inside Dhaka */}
                  <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <h3 className="font-black text-secondary text-lg uppercase tracking-tight">ঢাকার মধ্যে</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl border border-white">
                        <span className="text-sm font-bold text-gray-700">০.৫ কেজি পর্যন্ত</span>
                        <span className="font-black text-secondary text-xl">৳৬০</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl border border-white">
                        <span className="text-sm font-bold text-gray-700">১ কেজি পর্যন্ত</span>
                        <span className="font-black text-secondary text-xl">৳৮০</span>
                      </div>
                      <p className="text-xs font-bold text-blue-700 italic px-1 mt-1 leading-relaxed">
                        * পরবর্তী প্রতি কেজিতে ২০ টাকা করে অতিরিক্ত যুক্ত হবে।
                      </p>
                    </div>
                  </div>
                  {/* Outside Dhaka */}
                  <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <h3 className="font-black text-secondary text-lg uppercase tracking-tight">ঢাকার বাইরে</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white/70 p-5 rounded-xl border border-white">
                        <span className="text-sm font-bold text-gray-700 leading-tight">১ কেজি পর্যন্ত (অগ্রিম ১১২/১৩৫)</span>
                        <span className="font-black text-secondary text-xl text-right ml-4">৳১১৫/৳১৩৫</span>
                      </div>
                      <p className="text-xs font-bold text-amber-700 italic px-1 mt-1 leading-relaxed">
                        * পরবর্তী প্রতি কেজিতে ২০ টাকা করে অতিরিক্ত যুক্ত হবে।
                      </p>
                    </div>
                  </div>
                </div>
                      <div className="mt-8 p-5 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                        <p className="text-xs font-bold text-gray-600 text-center leading-relaxed">
                          বিঃদ্রঃ ওজনের সঠিকতা নিশ্চিত করতে আমরা প্রতিটি পণ্য শিপিংয়ের আগে ওজন করে থাকি। কোনো তথ্যের জন্য আমাদের সরাসরি কল করতে পারেন।
                        </p>
                      </div>
                      <button onClick={() => setIsDeliveryInfoOpen(false)} className="w-full mt-8 py-5 rounded-2xl bg-secondary text-white font-black text-sm hover:brightness-110 shadow-lg shadow-secondary/10 transition-all uppercase tracking-widest active:scale-95">
                        এ িক আছে
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
    </>
  );
}
