import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Ban,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';

export interface AdminReviewsTabProps {
  adminReviews?: any[];
  fetchAdminReviews?: () => any;
  handleApproveReview?: (productId: any, reviewId: any) => Promise<any> | any;
  handleRejectReview?: (productId: any, reviewId: any) => Promise<any> | any;
  handleDeleteReviewAdmin?: (productId: any, reviewId: any) => Promise<any> | any;
  isAdminReviewsLoading?: boolean;
}

export default function AdminReviewsTab({
  adminReviews = [],
  fetchAdminReviews,
  handleApproveReview,
  handleRejectReview,
  handleDeleteReviewAdmin,
  isAdminReviewsLoading = false,
}: AdminReviewsTabProps) {
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<'all' | number>('all');
  const [reviewHasPhotosOnly, setReviewHasPhotosOnly] = useState(false);
  const [previewReviewImage, setPreviewReviewImage] = useState<string | null>(null);
  const [reviewActionLoadingId, setReviewActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmReview, setDeleteConfirmReview] = useState<{
    productId: string;
    reviewId: string;
    userName: string;
  } | null>(null);

  const allReviews = Array.isArray(adminReviews) ? adminReviews : [];
  const pendingCount = allReviews.filter((r: any) => r.status === 'pending').length;
  const approvedCount = allReviews.filter((r: any) => r.status === 'approved' || !r.status).length;
  const rejectedCount = allReviews.filter((r: any) => r.status === 'rejected').length;
  const withPhotosCount = allReviews.filter((r: any) => Array.isArray(r.images) && r.images.length > 0).length;

  const approvedReviews = allReviews.filter((r: any) => r.status === 'approved' || !r.status);
  const avgApprovedRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 5), 0) / approvedReviews.length).toFixed(1)
      : '5.0';

  const filteredReviews = allReviews.filter((rev: any) => {
    const status = rev.status || 'approved';
    if (reviewStatusFilter === 'pending' && status !== 'pending') return false;
    if (reviewStatusFilter === 'approved' && status !== 'approved') return false;
    if (reviewStatusFilter === 'rejected' && status !== 'rejected') return false;

    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      const matchUser = (rev.userName || '').toLowerCase().includes(q);
      const matchProd = (rev.productName || '').toLowerCase().includes(q);
      const matchComment = (rev.comment || '').toLowerCase().includes(q);
      if (!matchUser && !matchProd && !matchComment) return false;
    }

    if (reviewRatingFilter !== 'all' && Number(rev.rating) !== Number(reviewRatingFilter)) {
      return false;
    }

    if (reviewHasPhotosOnly && (!Array.isArray(rev.images) || rev.images.length === 0)) {
      return false;
    }

    return true;
  });

  const modals = (
    <>
      {previewReviewImage && (
        <div
          onClick={() => setPreviewReviewImage(null)}
          className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b bg-gray-50/90">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Camera size={16} className="text-amber-500" /> Customer Review Photo Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewReviewImage(null)}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-900/10 overflow-auto">
              <img
                src={previewReviewImage}
                alt="Full resolution customer review preview"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {deleteConfirmReview && (
        <div
          onClick={() => setDeleteConfirmReview(null)}
          className="fixed inset-0 z-[600] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold text-gray-900">Delete Review?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete this review by{' '}
                <strong className="text-gray-800">{deleteConfirmReview.userName}</strong>? This will remove it from
                the system and recalculate product ratings.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReview(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteConfirmReview;
                  setDeleteConfirmReview(null);
                  if (handleDeleteReviewAdmin && target) {
                    await handleDeleteReviewAdmin(target.productId, target.reviewId);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="w-full space-y-6 font-sans">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 md:p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Star size={28} className="fill-amber-200 text-amber-200" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">Customer Photo Reviews &amp; Moderation</h3>
              </div>
              <p className="text-amber-100 text-sm font-medium">
                Review customer ratings, moderate uploaded photos, approve or reject submissions before live display.
              </p>
            </div>

            <button
              onClick={() => {
                if (fetchAdminReviews) fetchAdminReviews();
              }}
              disabled={isAdminReviewsLoading}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-xl text-xs font-bold transition-all backdrop-blur-sm disabled:opacity-50"
            >
              <RefreshCcw size={16} className={isAdminReviewsLoading ? 'animate-spin' : ''} />
              {isAdminReviewsLoading ? 'Refreshing...' : 'Refresh Reviews'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 relative z-10">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100 font-bold flex items-center gap-1.5">
                <MessageSquare size={13} /> Total Reviews
              </span>
              <p className="text-2xl font-black mt-1">{allReviews.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100 font-bold flex items-center gap-1.5">
                <Clock size={13} /> Pending Moderation
              </span>
              <p className="text-2xl font-black mt-1 flex items-center gap-1.5">
                {pendingCount}
                {pendingCount > 0 && (
                  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                    Action Required
                  </span>
                )}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Approved Live
              </span>
              <p className="text-2xl font-black mt-1">{approvedCount}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100 font-bold flex items-center gap-1.5">
                <Ban size={13} /> Rejected
              </span>
              <p className="text-2xl font-black mt-1">{rejectedCount}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
              <span className="text-xs text-amber-100 font-bold flex items-center gap-1.5">
                <Star size={13} className="fill-current" /> Live Avg Rating
              </span>
              <p className="text-2xl font-black mt-1">{avgApprovedRating} ★</p>
            </div>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-gray-100/80 p-1.5 rounded-2xl">
              <button
                onClick={() => setReviewStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reviewStatusFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({allReviews.length})
              </button>
              <button
                onClick={() => setReviewStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  reviewStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Clock size={13} />
                Pending ({pendingCount})
                {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
              </button>
              <button
                onClick={() => setReviewStatusFilter('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  reviewStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 size={13} />
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setReviewStatusFilter('rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  reviewStatusFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <XCircle size={13} />
                Rejected ({rejectedCount})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Ratings (★ 1-5)</option>
                <option value="5">5 Stars ★★★★★</option>
                <option value="4">4 Stars ★★★★☆</option>
                <option value="3">3 Stars ★★★☆☆</option>
                <option value="2">2 Stars ★★☆☆☆</option>
                <option value="1">1 Star ★☆☆☆☆</option>
              </select>

              <button
                type="button"
                onClick={() => setReviewHasPhotosOnly(!reviewHasPhotosOnly)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  reviewHasPhotosOnly
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Camera size={14} className={reviewHasPhotosOnly ? 'text-amber-600' : 'text-gray-400'} />
                <span>With Photos Only ({withPhotosCount})</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
              placeholder="Search reviews by customer name, product name, or review comment..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {reviewSearchQuery && (
              <button
                onClick={() => setReviewSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {isAdminReviewsLoading ? (
          <div className="py-20 text-center bg-white rounded-[2rem] border border-gray-100">
            <Loader2 size={36} className="mx-auto text-amber-500 animate-spin mb-3" />
            <p className="text-gray-600 font-bold text-sm">Loading customer reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[2rem] border border-gray-100 border-dashed">
            <Star size={44} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-gray-800 font-bold text-base mb-1">
              {reviewStatusFilter === 'pending'
                ? 'No Pending Reviews'
                : reviewStatusFilter === 'rejected'
                ? 'No Rejected Reviews'
                : 'No Reviews Found'}
            </h4>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              {reviewStatusFilter === 'pending'
                ? 'Great job! All customer reviews have been reviewed and moderated.'
                : reviewSearchQuery
                ? "Try adjusting your search query or filters to find what you're looking for."
                : 'No customer reviews match the selected filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev: any) => {
              const status = rev.status || 'approved';
              const ratingVal = Math.min(5, Math.max(1, Number(rev.rating) || 5));
              const revImages = Array.isArray(rev.images) ? rev.images : [];
              const isLoadingAction = reviewActionLoadingId === rev.id;

              const formattedDate = (() => {
                const dt = rev.createdAt;
                if (!dt) return 'Just now';
                try {
                  if (typeof dt === 'object' && dt.seconds) {
                    return new Date(dt.seconds * 1000).toLocaleString();
                  }
                  const d = new Date(dt);
                  return isNaN(d.getTime()) ? String(dt) : d.toLocaleString();
                } catch {
                  return String(dt);
                }
              })();

              return (
                <div
                  key={rev.id || Math.random().toString(36)}
                  className={`bg-white rounded-[2rem] p-6 shadow-sm border transition-all ${
                    status === 'pending'
                      ? 'border-amber-200 ring-2 ring-amber-500/10 hover:shadow-md'
                      : status === 'rejected'
                      ? 'border-red-100 opacity-80 hover:opacity-100'
                      : 'border-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                        {(rev.userName || 'C').trim().charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-base">{rev.userName || 'Customer'}</h4>
                          {rev.userId && rev.userId.startsWith('guest_') ? (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                              Guest
                            </span>
                          ) : (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <UserCheck size={10} /> Verified Customer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <Calendar size={12} />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm animate-pulse">
                          <Clock size={14} /> Pending Approval
                        </span>
                      )}
                      {status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm">
                          <CheckCircle2 size={14} /> Approved &amp; Live
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm">
                          <XCircle size={14} /> Rejected / Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 px-3.5 py-2 rounded-xl max-w-full">
                      {rev.productImage && (
                        <img
                          src={rev.productImage}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <span className="text-xs font-bold text-gray-500 shrink-0">Product:</span>
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {rev.productName || 'Product (ID: ' + rev.productId + ')'}
                      </span>
                      {rev.productId && (
                        <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">
                          ID: {rev.productId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={16}
                            className={s <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-gray-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        {ratingVal}.0 / 5.0
                      </span>
                    </div>

                    {rev.comment ? (
                      <p className="text-sm font-medium text-gray-800 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                        "{rev.comment}"
                      </p>
                    ) : (
                      <p className="text-xs italic text-gray-400">No written comment provided with this rating.</p>
                    )}

                    {revImages.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                          <Camera size={14} className="text-amber-500" />
                          <span>Customer Photos ({revImages.length}) — Click photo to zoom &amp; inspect</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {revImages.map((imgUrl: string, idx: number) => (
                            <div
                              key={idx}
                              onClick={() => setPreviewReviewImage(imgUrl)}
                              className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-amber-500 cursor-pointer shadow-sm transition-all hover:scale-105"
                            >
                              <img
                                src={imgUrl}
                                alt={`Review Photo ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Eye size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isLoadingAction || status === 'approved'}
                        onClick={async () => {
                          setReviewActionLoadingId(rev.id);
                          if (handleApproveReview) {
                            await handleApproveReview(rev.productId, rev.id);
                          }
                          setReviewActionLoadingId(null);
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          status === 'approved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default opacity-80'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                        } disabled:opacity-50`}
                      >
                        <CheckCircle2 size={15} />
                        {status === 'approved' ? 'Approved' : 'Approve Review'}
                      </button>

                      <button
                        type="button"
                        disabled={isLoadingAction || status === 'rejected'}
                        onClick={async () => {
                          setReviewActionLoadingId(rev.id);
                          if (handleRejectReview) {
                            await handleRejectReview(rev.productId, rev.id);
                          }
                          setReviewActionLoadingId(null);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          status === 'rejected'
                            ? 'bg-red-50 text-red-600 border-red-200 cursor-default opacity-80'
                            : 'bg-white hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300 active:scale-95'
                        } disabled:opacity-50`}
                      >
                        <Ban size={15} />
                        {status === 'rejected' ? 'Rejected' : 'Reject'}
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isLoadingAction}
                      onClick={() => {
                        setDeleteConfirmReview({
                          productId: rev.productId,
                          reviewId: rev.id,
                          userName: rev.userName || 'Customer',
                        });
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {typeof document !== 'undefined' ? createPortal(modals, document.body) : modals}
    </>
  );
}
