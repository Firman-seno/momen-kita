import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from './AnimationKit';
import { UiButton } from './UiButton';
import { formatRupiah } from '../data/templates';
import {
  Order,
  OrderStatus,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  verifyOrderPayment,
  rejectOrderPayment,
  updateOrder,
  getRevisionProgress,
  canRequestRevision,
  recordRevision,
  completeOrderWithFinalLink,
} from '../lib/orders';
import { getInvitationById, getInvitationUrl } from '../lib/invitations';
import { buildWaLink, paymentVerifiedMessage, deliveryMessage } from '../lib/whatsapp';
import { getAdminEmail } from '../lib/admin';
import { OrderStatusBadge } from './OrderStatusBadge';

/* ============================================================
   AdminOrderDetail — full order + payment + verification UI.
   Admin verifies the customer's transfer proof here (only then
   the order becomes PAID and counts towards revenue).
   ============================================================ */

interface AdminOrderDetailProps {
  order: Order;
  templateLabel: string;
  templateImage?: string;
  onClose: () => void;
  onChanged: () => void;
  onToast: (msg: string) => void;
  onNewInvitation: (templateUid: string, orderId: string) => void;
}

const FIELD_LABEL = 'font-body text-[9px] font-bold uppercase tracking-wider text-outline mb-0.5';
const FIELD_VALUE = 'font-body text-xs font-bold text-on-surface break-words';

export const AdminOrderDetail: React.FC<AdminOrderDetailProps> = ({
  order,
  templateLabel,
  templateImage,
  onClose,
  onChanged,
  onToast,
  onNewInvitation,
}) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [revisionNote, setRevisionNote] = useState('');
  const [finalLink, setFinalLink] = useState(() => {
    if (order.finalInvitationUrl) return order.finalInvitationUrl;
    const inv = order.invitationId ? getInvitationById(order.invitationId) : undefined;
    return inv ? getInvitationUrl(inv) : '';
  });
  const admin = getAdminEmail();

  const handleVerify = () => {
    const updated = verifyOrderPayment(order.id, admin);
    if (updated) {
      setStatus(updated.status);
      onChanged();
      onToast(`Pembayaran ${order.id} diverifikasi — order masuk pendapatan.`);
    }
  };

  const handleReject = () => {
    const updated = rejectOrderPayment(order.id, admin);
    if (updated) {
      setStatus(updated.status);
      onChanged();
      onToast(`Pembayaran ${order.id} ditolak.`);
    }
  };

  const handleStatusChange = (next: OrderStatus) => {
    const updated = updateOrder(order.id, { status: next });
    if (updated) {
      setStatus(next);
      onChanged();
      onToast(`Status ${order.id} → ${ORDER_STATUS_LABELS[next]}.`);
    }
  };

  const handleRecordRevision = () => {
    const updated = recordRevision(order.id, revisionNote.trim());
    if (updated) {
      setRevisionNote('');
      setStatus(updated.status);
      onChanged();
      onToast(`Revisi ${updated.id} dicatat (${getRevisionProgress(updated).used}/${getRevisionProgress(updated).max}).`);
    }
  };

  const handleCompleteWithLink = () => {
    const url = finalLink.trim();
    if (!url) {
      onToast('Masukkan link undangan final terlebih dahulu.');
      return;
    }
    const updated = completeOrderWithFinalLink(order.id, url);
    if (updated) {
      setStatus(updated.status);
      onChanged();
      onToast(`Pesanan ${order.id} diselesaikan — rating customer aktif.`);
    }
  };

  const contactMsg = `Halo Kak ${order.customerName} 👋\n\nIni admin MomenKita.\n\nBerkaitan dengan pesanan Anda:\n\nOrder ID: ${order.id}\nTemplate: ${templateLabel}\n\nMohon informasi yang dibutuhkan. Terima kasih.`;

  const verifiedMsg = paymentVerifiedMessage(order.customerName, order.id, templateLabel);
  const canNotifyCustomer = (status === 'PAID' || status === 'PROCESSING') && !!order.customerPhone;

  const verified = order.verifiedAt ? new Date(order.verifiedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <motion.div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      onClick={onClose}
    >
      <motion.div
        className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full shadow-2xl border border-outline-variant/40 max-h-[92vh] overflow-y-auto relative"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant/40 px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {templateImage && (
              <img src={templateImage} alt="" className="w-10 h-14 object-cover rounded-lg border border-outline-variant/40 shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
            )}
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold text-primary truncate">{order.id}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <OrderStatusBadge status={order.status} />
                {order.hasRated && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Sudah dirating
                  </span>
                )}
                {order.status === 'COMPLETED' && !order.hasRated && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Menunggu rating customer
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1 cursor-pointer" aria-label="Tutup">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {/* Customer + event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
              <p className={`${FIELD_LABEL} text-primary`}>👤 Customer</p>
              <p className={FIELD_VALUE}>{order.customerName || 'Tanpa Nama'}</p>
              {order.customerEmail && <p className="font-body text-[11px] text-on-surface-variant mt-1 break-all">{order.customerEmail}</p>}
              {order.customerPhone && (
                <a href={buildWaLink('Halo, ini MomenKita.', order.customerPhone)} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-emerald-600 hover:underline mt-1 inline-block">
                  {order.customerPhone}
                </a>
              )}
            </div>
            <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
              <p className={`${FIELD_LABEL} text-primary`}>🎉 Acara</p>
              <p className={FIELD_VALUE}>{order.eventName || '—'}</p>
              <p className="font-body text-[11px] text-on-surface-variant mt-1">{order.eventType || '—'}</p>
            </div>
          </div>

          {/* Template */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
            <p className={`${FIELD_LABEL} text-primary`}>📄 Template</p>
            <p className={FIELD_VALUE}>{templateLabel}</p>
            <p className="font-body text-[11px] text-on-surface-variant mt-1">{order.templateName}</p>
            <p className="font-headline text-base font-extrabold text-primary mt-2">{formatRupiah(order.price)}</p>
          </div>

          {/* Payment / verification */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
            <div className="flex items-center justify-between mb-2">
              <p className={`${FIELD_LABEL} text-primary`}>💳 Pembayaran</p>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                order.payment ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.payment ? 'Bukti Dikirim' : 'Belum Ada Bukti'}
              </span>
            </div>

            {order.payment ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={FIELD_LABEL}>Bank</p>
                    <p className={FIELD_VALUE}>{order.payment.bank}</p>
                  </div>
                  <div>
                    <p className={FIELD_LABEL}>Nominal</p>
                    <p className={`${FIELD_VALUE} text-emerald-700`}>{formatRupiah(order.payment.amount)}</p>
                  </div>
                  <div>
                    <p className={FIELD_LABEL}>Tanggal</p>
                    <p className={FIELD_VALUE}>{order.payment.paymentDate || '—'}</p>
                  </div>
                  <div>
                    <p className={FIELD_LABEL}>Jam</p>
                    <p className={FIELD_VALUE}>{order.payment.paymentTime || '—'}</p>
                  </div>
                </div>

                {order.payment.proofUrl && (
                  <div>
                    <p className={FIELD_LABEL}>Bukti Transfer</p>
                    <a href={order.payment.proofUrl} target="_blank" rel="noreferrer" title="Buka bukti transfer (tab baru)">
                      <img
                        src={order.payment.proofUrl}
                        alt="Bukti transfer"
                        className="max-w-[180px] w-full aspect-[4/3] object-cover rounded-xl border border-outline-variant/50 cursor-zoom-in hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <p className="font-body text-[9px] text-outline mt-1">Klik gambar untuk memperbesar (tab baru).</p>
                  </div>
                )}

                {(status === 'PAID' || status === 'REJECTED') && verified && (
                  <div className="border-t border-outline-variant/40 pt-2.5">
                    <p className={FIELD_LABEL}>Diverifikasi</p>
                    <p className={`${FIELD_VALUE} ${status === 'PAID' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {verified} • oleh {order.verifiedBy || admin}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-[11px] text-on-surface-variant">
                Customer belum mengirim bukti pembayaran untuk pesanan ini.
              </p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
              <p className={`${FIELD_LABEL} text-primary`}>📝 Catatan</p>
              <p className="font-body text-xs text-on-surface whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Revision tracking */}
          <div className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
            <div className="flex items-center justify-between mb-1.5">
              <p className={`${FIELD_LABEL} text-primary !mb-0`}>🔄 Revisi</p>
              <p className={`font-body text-[11px] font-extrabold ${canRequestRevision(order) ? 'text-on-surface' : 'text-rose-600'}`}>
                {getRevisionProgress(order).used} / {getRevisionProgress(order).max}
              </p>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getRevisionProgress(order).used >= getRevisionProgress(order).max ? 'bg-rose-500' : 'bg-[#C9A45C]'}`}
                style={{ width: `${Math.min((getRevisionProgress(order).used / getRevisionProgress(order).max) * 100, 100)}%` }}
              />
            </div>
            <p className="font-body text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
              Setiap pembelian undangan mendapatkan maksimal {getRevisionProgress(order).max}x revisi. Catat setiap permintaan revisi dari customer.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
              <input
                type="text"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Catatan revisi (mis. ubah warna, tambah foto, ganti nama)..."
                className="flex-1 min-w-0 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors"
              />
              <UiButton
                variant="secondary"
                size="md"
                icon="sync"
                iconFilled
                onClick={handleRecordRevision}
                disabled={!canRequestRevision(order)}
                title={canRequestRevision(order) ? 'Catat permintaan revisi customer' : 'Batas revisi telah tercapai'}
              >
                Catat Revisi
              </UiButton>
            </div>
          </div>

          {/* Final delivery — completing the order activates the customer rating */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-body text-[9px] font-bold uppercase tracking-wider text-emerald-700 !mb-0">
                📬 Undangan Final
              </p>
              {order.status === 'COMPLETED' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-100 text-emerald-700">
                  {order.hasRated ? 'Sudah dirating' : 'Menunggu rating customer'}
                </span>
              )}
            </div>
            <p className="font-body text-[10px] text-emerald-800/80 leading-relaxed">
              Kirim link undangan final ke customer, lalu selesaikan pesanan. Setelah selesai, customer wajib memberikan rating 1–5 sebelum dapat melanjutkan.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
              <input
                type="text"
                value={finalLink}
                onChange={(e) => setFinalLink(e.target.value)}
                placeholder="https://momenkita.id/i/... (link undangan final)"
                className="flex-1 min-w-0 bg-white border border-emerald-200 rounded-lg px-3 py-2 font-mono text-[11px] text-on-surface focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 placeholder:text-outline/70 transition-colors"
              />
              <UiButton
                variant="whatsapp"
                size="md"
                icon="verified"
                iconFilled
                onClick={handleCompleteWithLink}
                disabled={order.status === 'COMPLETED' && !!order.finalInvitationUrl}
                title="Selesaikan pesanan & aktifkan rating customer"
              >
                Selesaikan Pesanan
              </UiButton>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-body text-[10px] text-outline">
            <span>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span>Diperbarui: {new Date(order.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
            <span className="capitalize">Sumber: {order.source === 'customer' ? 'Customer (online)' : 'Admin'}</span>
          </div>

          {/* Actions */}
          <div className="border-t border-outline-variant/40 pt-4 flex flex-col gap-2.5">
            {status === 'AWAITING_VERIFICATION' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <UiButton variant="whatsapp" size="md" icon="verified" iconFilled onClick={handleVerify}>
                  Verifikasi Pembayaran
                </UiButton>
                <UiButton variant="danger" size="md" icon="block" onClick={handleReject}>
                  Pembayaran Ditolak
                </UiButton>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-on-surface-variant shrink-0">
                  Ubah Status:
                </span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-2 font-body text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <UiButton
                  variant="whatsapp"
                  size="md"
                  icon="chat"
                  iconFilled
                  href={buildWaLink(contactMsg, order.customerPhone)}
                  external
                  className="flex-1"
                >
                  Hubungi Customer
                </UiButton>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {canNotifyCustomer && (
                <UiButton
                  variant="whatsapp"
                  size="md"
                  icon="verified_user"
                  iconFilled
                  href={buildWaLink(verifiedMsg, order.customerPhone)}
                  external
                  title="Kirim notifikasi pembayaran berhasil diverifikasi ke customer"
                >
                  Konfirmasi ke Customer
                </UiButton>
              )}
              <UiButton
                variant="primary"
                size="md"
                icon="edit_note"
                iconFilled
                onClick={() => onNewInvitation(order.templateUid, order.id)}
                className={canNotifyCustomer ? '' : 'sm:col-span-2'}
              >
                Buat Undangan dari Pesanan Ini
              </UiButton>
              <UiButton variant="ghost" size="md" icon="close" fullWidth onClick={onClose}>
                Tutup
              </UiButton>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
