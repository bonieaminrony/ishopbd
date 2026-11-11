import React from 'react';
import { CheckCircle, Clock, RefreshCcw, RotateCcw, XCircle } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface AdminRefundsTabProps {
  refundRequests: any[];
  handleApproveRefund: (refund: any) => void;
}

export default function AdminRefundsTab({ refundRequests, handleApproveRefund }: AdminRefundsTabProps) {
  return (
    <div className="w-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-primary rounded-2xl">
            <RotateCcw size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-secondary">Refund Requests</h3>
            <p className="text-xs text-gray-500 font-medium">Customer refund requests and status tracking</p>
          </div>
        </div>
        <div className="p-2.5 px-4 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2 font-bold text-xs self-start sm:self-auto border border-amber-200/60 shadow-xs">
          <Clock size={16} /> Pending: {refundRequests.filter((r) => r.status === 'pending').length}
        </div>
      </div>
      <div className="grid gap-4">
        {refundRequests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <RefreshCcw size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-base font-bold text-gray-600">No refund requests yet</p>
            <p className="text-xs text-gray-400 mt-1">Customer refund requests will appear here when submitted</p>
          </div>
        ) : (
          [...refundRequests]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((refund) => (
              <div
                key={refund.id}
                className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        refund.status === 'approved'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : refund.status === 'rejected'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {refund.status}
                    </span>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                      ID: #{String(refund.id).slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-secondary text-base">{refund.userName}</h5>
                    <p className="text-xs text-gray-400 font-medium">{refund.userEmail}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Refund Reason:
                    </p>
                    <p className="text-sm font-bold text-secondary italic">"{refund.reason}"</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Order ID</p>
                      <p className="text-xs font-bold text-secondary">#{String(refund.orderId).slice(-6).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Amount</p>
                      <p className="text-sm font-black text-primary">৳{refund.amount}</p>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  {refund.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApproveRefund(refund)}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-green-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Reject this request?')) {
                            await updateDoc(doc(db, 'refund_requests', refund.id), {
                              status: 'rejected',
                              updatedAt: new Date().toISOString(),
                            });
                          }
                        }}
                        className="bg-red-50 text-red-600 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                  {refund.status !== 'pending' && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Updated At</p>
                      <p className="text-xs font-bold text-gray-500">
                        {new Date(refund.updatedAt || refund.createdAt).toLocaleString('en-US')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
