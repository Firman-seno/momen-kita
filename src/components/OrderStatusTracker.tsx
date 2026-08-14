import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EASE_OUT } from './AnimationKit';
import { UiButton } from './UiButton';
import { OrderStatusBadge } from './OrderStatusBadge';
import { RatingStarsInput } from './RatingStars';
import { formatRupiah, getTemplateByUid } from '../data/templates';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  getAllOrders,
  getRevisionProgress,
  canRequestRevision,
  markOrderRated,
} from '../lib/orders';
import { addReview, hasReviewForOrder } from '../lib/reviews';
import { buildWaLink, WHATSAPP_PRIMARY } from '../lib/whatsapp';

/* ============================================================
   OrderStatusTracker — customer "Status Pesanan" lookup.
   ------------------------------------------------------------
   A customer enters their Order ID + WhatsApp number to see the
   progress of their order (including revision usage). When the
   order is COMPLETED with a final invitation link and has not
   been rated yet, the rating form is MANDATORY — it cannot be
   skipped (no close / backdrop-dismiss while a rating is due).
   ============================================================ */

const normalizePhone = (phone: string): string => {
  let p = phone.replace(/[^\d]/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  if (!p.startsWith('62')) p = '62' + p;
  return p;
};

type Step = 'lookup' | 'select' | 'detail' | 'success';

interface OrderStatusTrackerProps {
  initial?: { orderId?: string; phone?: string };
  onClose: () => void;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ initial, onClose }) => {
  const [step, setStep] = useState<Step>('lookup');
  const [orderId, setOrderId] = useState(initial?.orderId || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [matches, setMatches] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Rating state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');

  const ratingDue = !!order && order.status === 'COMPLETED' && !order.hasRated;
  const alreadyRated = !!order && order.status === 'COMPLETED' && !!order.hasRated;

  const search = () => {
    setError('');
    const idQuery = orderId.trim().toUpperCase();
    const phoneQuery = normalizePhone(phone);
    if (!idQuery && !phoneQuery) {
      setError('Masukkan Order ID atau nomor WhatsApp Anda.');
      setTouched(true);
      return;
    }
    let list = getAllOrders();
    if (idQuery) {
      list = list.filter((o) => o.id.toUpperCase() === idQuery);
    }
    if (phoneQuery) {
      list = list.filter((o) => {
        if (!o.customerPhone) return false;
        const norm = normalizePhone(o.customerPhone);
        return norm === phoneQuery || norm.endsWith(phoneQuery.slice(-9));
      });
    }
    if (list.length === 0) {
      setError('Pesanan tidak ditemukan. Periksa kembali Order ID atau nomor WhatsApp Anda.');
      setTouched(true);
      return;
    }
    setMatches(list);
    if (list.length === 1) {
      openOrder(list[0]);
    } else {
      setStep('select');
    }
  };

  const openOrder = (o: Order) => {
    setOrder(o);
    setError('');
    if (o.status === 'COMPLETED') {
      setRating(0);
      setComment('');
      setSubmitError('');
    }
    setStep('detail');
  };

  const canSubmitRating = rating >= 1 && rating <= 5;

  const submitRating = () => {
    if (!order || !canSubmitRating) return;
    try {
      const t = getTemplateByUid(order.templateUid);
      const review = addReview({
        orderId: order.id,
        customerName: order.customerName,
        templateUid: order.templateUid,
        templateName: t ? `${t.categoryLabel} #${t.templateNumber} — ${t.name}` : order.templateName,
        rating,
        comment,
      });
      if (!review) {
        setSubmitError('Terima kasih! Anda sudah pernah memberi rating untuk pesanan ini. Tidak dapat dikirim ulang.');
        return;
      }
      markOrderRated(order.id);
      setOrder({ ...order, hasRated: true, isRatingRequired: false });
      setStep('success');
    } catch {
      setSubmitError('Maaf, terjadi kesalahan saat menyimpan rating. Silakan coba lagi.');
    }
  };

  const inputCls =
    'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 font-body text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors';

  const labelCls = 'block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider';

  const revision = useMemo(() => (order ? getRevisionProgress(order) : { used: 0, max: 3 }), [order]);

  const matchedTemplateLabel = (o: Order): string => {
    const t = getTemplateByUid(o.templateUid);
    return t ? `${t.categoryLabel} #${t.templateNumber} — ${t.name}` : o.templateName || o.templateUid;
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      onClick={ratingDue ? undefined : onClose}
    >
      <motion.div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full shadow-2xl border border-outline-variant/40 max-h-[92vh] overflow-y-auto relative"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant/40 px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                receipt_long
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface truncate">Status Pesanan</h3>
              <p className="font-body text-[10px] text-on-surface-variant">Lacak &amp; beri rating pesanan Anda</p>
            </div>
          </div>
          {/* Close is disabled while a rating is mandatory */}
          {!ratingDue && step !== 'detail' && (
            <button onClick={onClose} className="text-outline hover:text-on-surface p-1 cursor-pointer" aria-label="Tutup">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {/* ============ LOOKUP ============ */}
            {step === 'lookup' && (
              <motion.div
                key="lookup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="flex flex-col gap-3.5"
              >
                <div>
                  <label className={labelCls}>Order ID</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. ORD-20260814-001"
                    className={`${inputCls} font-mono`}
                  />
                </div>
                <div>
                  <label className={labelCls}>Nomor WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 081234567890"
                    className={inputCls}
                  />
                </div>
                <p className="font-body text-[10px] text-on-surface-variant leading-relaxed">
                  Masukkan salah satu (atau keduanya) untuk melacak pesanan Anda. Jika pesanan sudah selesai,
                  Anda akan diminta memberikan rating.
                </p>

                {touched && error && (
                  <p className="font-body text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                      error
                    </span>
                    {error}
                  </p>
                )}

                <UiButton variant="primary" size="lg" fullWidth icon="search" onClick={search}>
                  Lacak Pesanan
                </UiButton>
                <UiButton variant="ghost" size="sm" fullWidth onClick={onClose}>
                  Tutup
                </UiButton>
              </motion.div>
            )}

            {/* ============ SELECT (multiple orders) ============ */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="flex flex-col gap-3"
              >
                <p className="font-body text-xs font-bold text-on-surface">Ditemukan {matches.length} pesanan:</p>
                {matches.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => openOrder(o)}
                    className="text-left bg-surface-container-low border border-outline-variant/40 rounded-xl p-3.5 hover:border-primary transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-primary truncate">{o.id}</p>
                      <p className="font-body text-[11px] text-on-surface-variant truncate mt-0.5">{matchedTemplateLabel(o)}</p>
                    </div>
                    <OrderStatusBadge status={o.status} size="sm" />
                  </button>
                ))}
                <UiButton variant="ghost" size="sm" fullWidth onClick={() => setStep('lookup')}>
                  Kembali
                </UiButton>
              </motion.div>
            )}

            {/* ============ DETAIL ============ */}
            {step === 'detail' && order && (
              <motion.div
                key={`detail-${order.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="flex flex-col gap-4"
              >
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-primary">{order.id}</span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="font-body text-xs text-on-surface">{matchedTemplateLabel(order)}</p>
                  <p className="font-body text-xs font-extrabold text-primary">{formatRupiah(order.price)}</p>
                </div>

                {/* Revision progress */}
                <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-body text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Revisi
                    </p>
                    <p className={`font-body text-[11px] font-extrabold ${canRequestRevision(order) ? 'text-on-surface' : 'text-rose-600'}`}>
                      {revision.used} / {revision.max}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${revision.used >= revision.max ? 'bg-rose-500' : 'bg-[#C9A45C]'}`}
                      style={{ width: `${Math.min((revision.used / revision.max) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="font-body text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
                    {revision.used >= revision.max ? (
                      <span className="text-rose-600 font-bold">
                        Batas revisi telah tercapai ({revision.used}/{revision.max}). Perubahan tambahan di luar revisi dapat dinegosiasikan dengan admin.
                      </span>
                    ) : (
                      `Setiap pembelian undangan mendapatkan maksimal ${revision.max}x revisi. Pastikan data yang diberikan sudah benar sebelum proses pembuatan dimulai.`
                    )}
                  </p>
                </div>

                {order.finalInvitationUrl && (
                  <a
                    href={order.finalInvitationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-micro inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      link
                    </span>
                    Buka Undangan Final
                  </a>
                )}

                {/* ----- Mandatory rating ----- */}
                {ratingDue && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <h4 className="font-headline text-sm sm:text-base font-bold text-on-surface">
                        Bagaimana pengalaman Anda dengan template ini?
                      </h4>
                    </div>

                    <div className="flex justify-center py-1">
                      <RatingStarsInput value={rating} onChange={(v) => { setRating(v); setSubmitError(''); }} />
                    </div>

                    <div>
                      <label className={labelCls}>Ulasan (opsional)</label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tulis pengalaman Anda (opsional)"
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    {submitError && (
                      <p className="font-body text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        {submitError}
                      </p>
                    )}

                    <UiButton variant="accent" size="lg" fullWidth icon="send" disabled={!canSubmitRating} onClick={submitRating}>
                      {submitError ? 'Coba Lagi' : 'Kirim Rating'}
                    </UiButton>
                    <p className="font-body text-[10px] text-amber-800/70 text-center">
                      Rating wajib diisi untuk melengkapi pesanan ini. Anda hanya dapat menilai sekali.
                    </p>
                  </div>
                )}

                {/* ----- Already rated ----- */}
                {alreadyRated && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-center flex flex-col items-center gap-1.5">
                    <span className="material-symbols-outlined text-3xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                    <p className="font-body text-sm font-bold text-emerald-800">
                      Terima kasih sudah memberikan rating!
                    </p>
                    <p className="font-body text-[11px] text-emerald-700">
                      Rating Anda membantu kami meningkatkan kualitas template dan pelayanan.
                    </p>
                    <UiButton variant="whatsapp" size="md" icon="check" fullWidth className="mt-2" onClick={onClose}>
                      Lanjutkan
                    </UiButton>
                  </div>
                )}

                {/* ----- Not completed yet ----- */}
                {!ratingDue && !alreadyRated && (
                  <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 flex flex-col gap-2.5">
                    <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
                      Pesanan Anda saat ini berstatus{' '}
                      <strong className="text-on-surface">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</strong>.
                      Rating dapat diisi setelah undangan selesai dan status pesanan menjadi{' '}
                      <strong className="text-on-surface">Selesai</strong>.
                    </p>
                    <a
                      href={buildWaLink(
                        `Halo MomenKita, saya ingin menanyakan status pesanan saya.\n\nOrder ID: ${order.id}\nNama: ${order.customerName}`,
                        WHATSAPP_PRIMARY
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-micro inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        chat
                      </span>
                      Tanyakan ke Admin
                    </a>
                    <UiButton variant="ghost" size="sm" fullWidth icon="close" onClick={onClose}>
                      Tutup
                    </UiButton>
                  </div>
                )}
              </motion.div>
            )}

            {/* ============ SUCCESS ============ */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="flex flex-col items-center text-center gap-3 py-2"
              >
                <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
                <h3 className="font-headline text-xl font-extrabold text-on-surface">Terima kasih! ❤️</h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-sm">
                  Terima kasih sudah memberikan rating untuk template MomenKita. Rating Anda membantu kami
                  meningkatkan kualitas template dan pelayanan kami.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <RatingStarsInput value={rating} onChange={() => undefined} size={24} />
                </div>
                <UiButton variant="primary" size="lg" fullWidth icon="check" onClick={onClose}>
                  Lanjutkan
                </UiButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
