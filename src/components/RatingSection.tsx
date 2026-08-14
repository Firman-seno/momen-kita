import React from 'react';
import { getTemplateByUid } from '../data/templates';
import {
  useReviews,
  getReviewsForTemplate,
  getTemplateRating,
  getRatingDistribution,
  getReviewerDisplayName,
  formatReviewDate,
} from '../lib/reviews';
import { RatingStars } from './RatingStars';

/* ============================================================
   RatingSection — public "Rating & Ulasan" block shown on the
   template detail/demo page. Dark-styled to match the demo view.
   Data is always live from the reviews store (never static).
   ============================================================ */

interface RatingSectionProps {
  templateUid: string;
}

export const RatingSection: React.FC<RatingSectionProps> = ({ templateUid }) => {
  useReviews(); // re-render when a new review arrives

  const template = getTemplateByUid(templateUid);
  const reviews = getReviewsForTemplate(templateUid);
  const { average, count } = getTemplateRating(templateUid);
  const distribution = getRatingDistribution(templateUid);
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <section className="mt-6 sm:mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8" aria-label="Rating dan ulasan template">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-xl text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
        <h2 className="font-headline text-lg sm:text-xl font-extrabold text-white tracking-tight">
          Rating &amp; Ulasan
        </h2>
      </div>
      <p className="font-body text-[11px] sm:text-xs text-slate-400 mb-6">
        {template ? `${template.categoryLabel} #${template.templateNumber} • ${template.name}` : ''}
      </p>

      {count === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-600" style={{ fontVariationSettings: "'FILL' 1" }}>
            sentiment_satisfied
          </span>
          <p className="font-body text-xs sm:text-sm text-slate-400 leading-relaxed">
            Belum ada rating untuk template ini.
            <br />
            Jadilah yang pertama memberikan ulasan setelah pesanan Anda selesai.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 sm:gap-8">
          {/* Average summary */}
          <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2">
            <div className="text-center md:text-left">
              <div className="font-headline text-4xl sm:text-5xl font-extrabold text-white leading-none">
                {average.toFixed(1)}
              </div>
              <div className="mt-2">
                <RatingStars value={average} size={16} />
              </div>
              <p className="font-body text-[11px] text-slate-400 mt-1.5">
                {count} ulasan
              </p>
            </div>
          </div>

          {/* Distribution */}
          <div className="flex flex-col gap-2">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-2.5">
                <span className="w-7 shrink-0 font-body text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  {d.stars}
                  <span className="material-symbols-outlined text-sm text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C9A45C] transition-all"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-body text-[11px] font-bold text-slate-400">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="mt-8 flex flex-col divide-y divide-slate-800 border-t border-slate-800 pt-2">
          {reviews.map((r) => (
            <article key={r.id} className="py-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                      person
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-xs sm:text-sm font-bold text-white truncate">
                      {getReviewerDisplayName(r.customerName)}
                    </p>
                    <p className="font-body text-[10px] text-slate-500">
                      {formatReviewDate(r.createdAt)}
                    </p>
                  </div>
                </div>
                <RatingStars value={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className="font-body text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-2 ml-10 sm:ml-11">
                  “{r.comment}”
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
