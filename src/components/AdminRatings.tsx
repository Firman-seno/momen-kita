import React, { useState } from 'react';
import {
  useReviews,
  getAllReviews,
  getTemplateRating,
  getReviewerDisplayName,
  formatReviewDate,
  deleteReview,
  Review,
} from '../lib/reviews';
import { getTemplateByUid, formatRupiah } from '../data/templates';
import { getTemplatePrice } from '../lib/templatePricing';
import { RatingStars } from './RatingStars';
import { UiButton } from './UiButton';

/* ============================================================
   AdminRatings — "Ratings" tab for the admin dashboard.
   Shows live review data (from real customer reviews):
   total reviews, overall average, per-template ratings with a
   filter, and a full list of reviews (customer, rating, comment,
   date) with the ability to delete a review.
   ============================================================ */

interface AdminRatingsProps {
  onToast: (msg: string) => void;
}

export const AdminRatings: React.FC<AdminRatingsProps> = ({ onToast }) => {
  useReviews(); // re-render reactively when a review is added/removed

  const [templateFilter, setTemplateFilter] = useState('ALL');
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);

  const reviews = [...getAllReviews()].sort((a, b) => b.createdAt - a.createdAt);

  const filtered = templateFilter === 'ALL' ? reviews : reviews.filter((r) => r.templateUid === templateFilter);

  // Templates that actually have reviews (per-template summary cards).
  const reviewedUids = Array.from(new Set(reviews.map((r) => r.templateUid)));

  const overallAvg =
    reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteReview(confirmDelete.id);
    onToast('Review berhasil dihapus.');
    setConfirmDelete(null);
  };

  const inputCls =
    'bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2.5 font-body text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors';

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div className="min-w-0">
            <div className="font-headline text-lg font-extrabold text-primary leading-none">{reviews.length}</div>
            <div className="font-body text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">Total Review</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
          </div>
          <div className="min-w-0">
            <div className="font-headline text-lg font-extrabold text-primary leading-none">
              {reviews.length === 0 ? '—' : overallAvg.toFixed(1)}
            </div>
            <div className="font-body text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">Rating Rata-rata</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>design_services</span>
          </div>
          <div className="min-w-0">
            <div className="font-headline text-lg font-extrabold text-primary leading-none">{reviewedUids.length}</div>
            <div className="font-body text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">Template Dirating</div>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <h3 className="font-headline text-lg font-bold text-on-surface">Belum ada rating</h3>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
            Rating muncul otomatis setelah admin mengirim link undangan final dan customer memberikan rating 1–5 bintang pada pesanan yang selesai.
          </p>
        </div>
      ) : (
        <>
          {/* Per-template rating summary */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/40">
              <h3 className="font-headline text-base font-bold text-on-surface">Rating per Template</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[560px]">
                <thead>
                  <tr className="border-b border-outline-variant/40 text-[10px] sm:text-[11px] uppercase tracking-wider text-outline">
                    <th className="px-5 py-3 font-bold">Template</th>
                    <th className="px-5 py-3 font-bold">Rating</th>
                    <th className="px-5 py-3 font-bold">Reviews</th>
                    <th className="px-5 py-3 font-bold">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedUids.map((uid) => {
                    const t = getTemplateByUid(uid);
                    const { average, count } = getTemplateRating(uid);
                    return (
                      <tr key={uid} className="border-b border-outline-variant/20 last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={t?.image || ''}
                              alt=""
                              className="w-8 h-11 object-cover rounded-md border border-outline-variant/40 shrink-0"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                            />
                            <div className="min-w-0">
                              <p className="font-body text-xs font-bold text-on-surface truncate">
                                {t ? `${t.categoryLabel} #${t.templateNumber}` : uid}
                              </p>
                              <p className="font-body text-[10px] text-on-surface-variant truncate">{t?.name || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <RatingStars value={average} size={13} />
                            <span className="font-body text-xs font-extrabold text-on-surface">{average.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-body text-xs font-bold text-on-surface-variant">{count} Reviews</td>
                        <td className="px-5 py-3 font-body text-xs font-extrabold text-primary">{t ? formatRupiah(getTemplatePrice(t)) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review list with filter */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/40 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              <h3 className="font-headline text-base font-bold text-on-surface">Daftar Review</h3>
              <select value={templateFilter} onChange={(e) => setTemplateFilter(e.target.value)} className={`${inputCls} w-full sm:w-auto`} aria-label="Filter berdasarkan template">
                <option value="ALL">Semua Template</option>
                {reviewedUids.map((uid) => {
                  const t = getTemplateByUid(uid);
                  return (
                    <option key={uid} value={uid}>
                      {t ? `${t.categoryLabel} #${t.templateNumber} — ${t.name}` : uid}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-outline-variant/40 text-[10px] sm:text-[11px] uppercase tracking-wider text-outline">
                    <th className="px-5 py-3 font-bold">Customer</th>
                    <th className="px-5 py-3 font-bold">Template</th>
                    <th className="px-5 py-3 font-bold">Rating</th>
                    <th className="px-5 py-3 font-bold">Komentar</th>
                    <th className="px-5 py-3 font-bold">Tanggal</th>
                    <th className="px-5 py-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const t = getTemplateByUid(r.templateUid);
                    return (
                      <tr key={r.id} className="border-b border-outline-variant/20 last:border-0 align-top">
                        <td className="px-5 py-3">
                          <p className="font-body text-xs font-bold text-on-surface">{getReviewerDisplayName(r.customerName)}</p>
                          <p className="font-mono text-[10px] text-outline truncate max-w-[160px]">{r.orderId}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-body text-xs font-bold text-on-surface truncate max-w-[200px]">
                            {t ? `${t.categoryLabel} #${t.templateNumber}` : r.templateUid}
                          </p>
                          <p className="font-body text-[10px] text-on-surface-variant truncate max-w-[200px]">{t?.name || r.templateName || ''}</p>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <RatingStars value={r.rating} size={13} />
                            <span className="font-body text-[11px] font-extrabold text-on-surface">{r.rating}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-body text-[11px] text-on-surface-variant leading-relaxed max-w-[260px] break-words">
                            {r.comment || '—'}
                          </p>
                        </td>
                        <td className="px-5 py-3 font-body text-[11px] text-on-surface-variant whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <br />
                          <span className="text-outline">{formatReviewDate(r.createdAt)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setConfirmDelete(r)}
                            className="btn-micro min-h-[32px] px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            title="Hapus review"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Hapus review?</h3>
            </div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
              Review dari {getReviewerDisplayName(confirmDelete.customerName)} ({confirmDelete.rating} bintang) akan dihapus. Rating template akan diperbarui otomatis.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <UiButton variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>Batal</UiButton>
              <UiButton variant="danger" fullWidth icon="delete" onClick={handleDelete}>Ya, Hapus</UiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
