import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface CourierHistoryModalProps {
  isCourierHistoryModalOpen: any;
  setIsCourierHistoryModalOpen: any;
  courierModalPhone: any;
  setCourierModalPhone: any;
  checkCourierReport: any;
  loadingCourierReports: any;
  courierReports: any;
  AlertTriangle: any;
}

export default function CourierHistoryModal(props: CourierHistoryModalProps) {
  const {
    isCourierHistoryModalOpen,
    setIsCourierHistoryModalOpen,
    courierModalPhone,
    setCourierModalPhone,
    checkCourierReport,
    loadingCourierReports,
    courierReports,
    AlertTriangle,
  } = props;

  return (
    <>
      {isCourierHistoryModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCourierHistoryModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col border border-gray-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCourierHistoryModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors border border-gray-100"
              >
                <X size={16} />
              </button>
              <div className="overflow-y-auto p-6 flex flex-col gap-5 max-h-[85vh] no-scrollbar">
                {/* Section 1: Check Form */}
                <div className="bg-white border border-purple-100/70 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-purple-50/70 border-b border-purple-100/50 text-purple-950 p-3.5 text-center font-black text-sm">
                    কুরিয়ার তথ্য চেক করুন
                  </div>
                  <div className="p-4 flex gap-2">
                    <input
                      type="text"
                      value={courierModalPhone}
                      onChange={(e) => setCourierModalPhone(e.target.value)}
                      placeholder="মোবাইল নাম্বার লিখুন"
                      className="flex-1 px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300"
                    />
                    <button
                      onClick={() => checkCourierReport(courierModalPhone)}
                      disabled={loadingCourierReports[courierModalPhone]}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 shadow-md shadow-indigo-500/10"
                    >
                      {loadingCourierReports[courierModalPhone] ? "চেক হচ্ছে..." : "যাচাই করুন"}
                    </button>
                  </div>
                </div>
                {/* Section 2: Courier History Table */}
                <div className="bg-white border border-purple-100/70 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-purple-50/70 border-b border-purple-100/50 text-purple-950 p-3.5 text-center font-black text-sm">
                    কুরিয়ার হিস্ট্রি
                  </div>
                  
                  <div className="p-4">
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 font-bold text-[11px] text-gray-700 bg-gray-50/50">
                            <th className="p-3 text-left w-1/3 text-gray-500 font-black bg-gray-50/30">কুরিয়ার</th>
                            <th className="p-3 bg-purple-50/80 text-purple-900 font-black w-[22%] border-x border-purple-100/30">মোট</th>
                            <th className="p-3 bg-emerald-50/80 text-emerald-900 font-black w-[22%] border-r border-emerald-100/30">সফল</th>
                            <th className="p-3 bg-rose-50/80 text-rose-900 font-black w-[22%]">বাতিল</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const report = courierReports[courierModalPhone] || { total_parcel: 0, total_delivered: 0, total_cancelled: 0, total_fraud_report: 0 };
                            
                            // Define row data
                            const rows = [
                              {
                                name: "Pathao",
                                logo: (
                                  <div className="flex items-center gap-1 font-black text-gray-800">
                                    <span className="text-red-500 text-sm">p</span>
                                    <span className="text-[9px] tracking-tight">athao</span>
                                  </div>
                                ),
                                total: 0,
                                success: 0,
                                cancel: 0
                              },
                              {
                                name: "Steadfast",
                                logo: (
                                  <div className="flex items-center gap-0.5 font-bold text-emerald-600 text-[9px] leading-none">
                                    <span className="text-emerald-500 text-xs">⚡</span>
                                    <span className="font-extrabold tracking-tighter">SteadFast</span>
                                  </div>
                                ),
                                total: report.total_parcel,
                                success: report.total_delivered,
                                cancel: report.total_cancelled
                              },
                              {
                                name: "REDX",
                                logo: (
                                  <div className="flex items-center font-black text-[9px] text-gray-850 bg-gray-100 px-1 py-0.5 rounded leading-none border border-gray-200/50">
                                    <span>RED</span><span className="text-red-500">X</span>
                                  </div>
                                ),
                                total: 0,
                                success: 0,
                                cancel: 0
                              },
                              {
                                name: "Paperfly",
                                logo: (
                                  <div className="flex items-center gap-0.5 font-extrabold text-[8px] text-sky-500 leading-none">
                                    <span>✈️</span>
                                    <span className="tracking-tighter">PAPERFLY</span>
                                  </div>
                                ),
                                total: 0,
                                success: 0,
                                cancel: 0
                              }
                            ];
                            const sumTotal = rows.reduce((acc, r) => acc + r.total, 0);
                            const sumSuccess = rows.reduce((acc, r) => acc + r.success, 0);
                            const sumCancel = rows.reduce((acc, r) => acc + r.cancel, 0);
                            return (
                              <>
                                {rows.map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                    <td className="p-3 text-left flex items-center justify-start min-h-[44px]">
                                      {row.logo}
                                    </td>
                                    <td className="p-3 bg-purple-50/10 text-purple-900 font-extrabold text-xs border-x border-gray-100/70">
                                      {row.total}
                                    </td>
                                    <td className="p-3 bg-emerald-50/10 text-emerald-800 font-extrabold text-xs border-r border-gray-100/70">
                                      {row.success}
                                    </td>
                                    <td className="p-3 bg-rose-50/10 text-rose-800 font-extrabold text-xs">
                                      {row.cancel}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="font-extrabold text-xs bg-gray-50/50 border-t border-gray-100">
                                  <td className="p-3 text-left text-gray-700 font-bold">
                                    মোট
                                  </td>
                                  <td className="p-3 bg-purple-50 text-purple-950 font-black border-x border-gray-150">
                                    {sumTotal}
                                  </td>
                                  <td className="p-3 bg-emerald-50 text-emerald-950 font-black border-r border-gray-150">
                                    {sumSuccess}
                                  </td>
                                  <td className="p-3 bg-rose-50 text-rose-950 font-black">
                                    {sumCancel}
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                    {/* Bottom Progress Rate bar */}
                    {(() => {
                      const report = courierReports[courierModalPhone] || { total_parcel: 0, total_delivered: 0, total_cancelled: 0, total_fraud_report: 0 };
                      const sumTotal = report.total_parcel;
                      const sumSuccess = report.total_delivered;
                      const sumCancel = report.total_cancelled;
                      const successRate = sumTotal > 0 ? Math.round((sumSuccess / sumTotal) * 100) : 0;
                      const cancelRate = sumTotal > 0 ? Math.round((sumCancel / sumTotal) * 100) : 0;
                      if (sumTotal === 0) {
                        return (
                          <div className="mt-4 p-3.5 text-center text-[10px] font-bold text-gray-400 bg-gray-55 rounded-xl border border-dashed border-gray-200">
                            কোন কুরিয়ার হিস্ট্রি পাওয়া যায়নি
                          </div>
                        );
                      }
                      return (
                        <div className="mt-4 flex flex-col gap-2">
                          <div className="h-6 w-full rounded-full overflow-hidden flex font-black text-[9px] text-white shadow-inner border border-gray-100/50">
                            {sumSuccess > 0 && (
                              <div
                                style={{ width: `${successRate}%` }}
                                className="bg-emerald-500/80 backdrop-blur-sm flex items-center justify-center px-2 transition-all duration-500"
                              >
                                {successRate}% সফল
                              </div>
                            )}
                            {sumCancel > 0 && (
                              <div
                                style={{ width: `${cancelRate}%` }}
                                className="bg-rose-500/80 backdrop-blur-sm flex items-center justify-center px-2 transition-all duration-500"
                              >
                                {cancelRate}% বাতিল
                              </div>
                            )}
                          </div>
                          
                          {report.total_fraud_report > 0 && (
                            <div className="bg-rose-50/50 border border-rose-100 text-rose-800 text-[10px] font-black p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 animate-pulse">
                              <AlertTriangle size={12} className="text-rose-600 shrink-0" /> কাস্টমারের বিরুদ্ধে {report.total_fraud_report}টি ফ্রড/অভিযোগের রিপোর্ট রয়েছে!
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );
}
