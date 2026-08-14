import React, { useState } from 'react';
import { Template } from '../types';
import { formatRupiah } from '../data/templates';
import { getTemplatePrice } from '../lib/templatePricing';
import { createCustomerOrder, submitOrderPayment, Order } from '../lib/orders';
import { getBankAccounts, ADMIN_WHATSAPP } from '../lib/payment';
import { buildWaLink, paymentNotificationMessage } from '../lib/whatsapp';
import { fileToOptimizedDataUrl } from '../lib/imageUtils';
import { UiButton } from './UiButton';

/* ============================================================
   OrderFlowModal — customer checkout (no admin involvement).
   Step 1: order form (template auto-filled, price from stored data)
   Step 2: choose bank + copy account number
   Step 3: confirm payment + upload proof → AWAITING_VERIFICATION
   Success: status shown + WhatsApp deep-link notifies the admin.
   ============================================================ */

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

/** Normalize a phone number for WhatsApp (08xx → 628xx). */
export const normalizePhone = (phone: string): string => {
  let p = phone.replace(/[^\d]/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  if (!p.startsWith('62')) p = '62' + p;
  return p;
};

const todayIso = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const nowTime = (): string => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

type Step = 'form' | 'payment' | 'confirm' | 'success';

interface OrderFlowModalProps {
  template: Template;
  onClose: () => void;
  /** Opens the customer order tracker pre-filled with the created order. */
  onTrackOrder?: (orderId: string, phone: string) => void;
}

export const OrderFlowModal: React.FC<OrderFlowModalProps> = ({ template, onClose, onTrackOrder }) => {
  const [step, setStep] = useState<Step>('form');
  const [order, setOrder] = useState<Order | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState(template.categoryLabel);
  const [notes, setNotes] = useState('');

  const [bank, setBank] = useState('BSI');
  const [amount, setAmount] = useState(String(getTemplatePrice(template)));
  const [payDate, setPayDate] = useState(todayIso);
  const [payTime, setPayTime] = useState(nowTime);
  const [proof, setProof] = useState('');
  const [uploading, setUploading] = useState(false);

  const banks = getBankAccounts();
  const templatePrice = getTemplatePrice(template);

  const handleCreateOrder = () => {
    if (!name.trim() || !phone.trim()) return;
    const created = createCustomerOrder({
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      eventName: eventName.trim() || undefined,
      eventType: eventType.trim() || undefined,
      templateUid: template.uid,
      category: template.category,
      templateNumber: template.templateNumber,
      templateName: template.name,
      price: templatePrice,
      notes: notes.trim() || undefined,
    });
    setOrder(created);
    setStep('payment');
  };

  const handleProofFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToOptimizedDataUrl(file, 1600, 0.8);
      setProof(dataUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = () => {
    if (!order) return;
    if (!proof) return;
    const paid = submitOrderPayment(order.id, {
      bank,
      amount: Number(amount) || templatePrice,
      paymentDate: payDate,
      paymentTime: payTime,
      proofUrl: proof,
      submittedAt: Date.now(),
    });
    if (paid) {
      setOrder(paid);
      setStep('success');
    }
  };

  const adminLink = order
    ? buildWaLink(
        paymentNotificationMessage({
          id: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          templateLabel: `${template.categoryLabel} #${template.templateNumber} — ${template.name}`,
          amount: order.payment?.amount || templatePrice,
          bank: order.payment?.bank || bank,
        }),
        ADMIN_WHATSAPP
      )
    : '#';

  const inputCls =
    'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 font-body text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors';

  const labelCls = 'block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider';

  const steps: { key: Step; label: string }[] = [
    { key: 'form', label: 'Data Pemesanan' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'confirm', label: 'Konfirmasi' },
    { key: 'success', label: 'Selesai' },
  ];

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-outline-variant/40 max-h-[92vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 cursor-pointer" aria-label="Tutup">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-5 pr-8">
          {steps.map((s, i) => {
            const done = steps.findIndex((x) => x.key === step) > i;
            const active = s.key === step;
            return (
              <div key={s.key} className="flex items-center gap-1.5 flex-1 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    done || active
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant border border-outline-variant'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate ${active ? 'text-primary' : 'text-outline'}`}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <span className="flex-1 h-px bg-outline-variant/60" />}
              </div>
            );
          })}
        </div>

        {/* ============ STEP 1 — Order form ============ */}
        {step === 'form' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/40">
              <img src={template.image} alt={template.name} className="w-12 h-16 object-cover rounded-lg border border-outline-variant/40 shrink-0" />
              <div className="min-w-0">
                <p className="font-body text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                  {template.categoryLabel} #{template.templateNumber}
                </p>
                <p className="font-headline text-sm font-bold text-on-surface truncate">{template.name}</p>
                <p className="font-body text-xs font-extrabold text-primary mt-0.5">{formatRupiah(templatePrice)}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
              <span className="material-symbols-outlined text-base text-amber-600 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                sync
              </span>
              <p className="font-body text-[10px] sm:text-[11px] text-amber-800 leading-relaxed">
                <strong className="font-extrabold">Maksimal 3x Revisi.</strong>{' '}
                Setiap pembelian undangan mendapatkan maksimal 3x revisi. Pastikan data yang diberikan sudah benar sebelum proses pembuatan dimulai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Nama Lengkap *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap Anda" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nomor WhatsApp *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com (opsional)" className={inputCls} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Nama Acara / Pemesan</label>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Ulang Tahun Aliya" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Jenis Acara</label>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value={template.categoryLabel}>{template.categoryLabel}</option>
                  {['Birthday', 'Sunatan', 'Wedding', 'Aqiqah'].filter((c) => c !== template.categoryLabel).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Catatan Tambahan</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pesan / kebutuhan khusus (opsional)" className={`${inputCls} resize-none`} />
            </div>

            {(!name.trim() || !phone.trim()) && (
              <p className="font-body text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Nama lengkap dan nomor WhatsApp wajib diisi.
              </p>
            )}

            <UiButton variant="accent" size="lg" fullWidth icon="payments" onClick={handleCreateOrder} disabled={!name.trim() || !phone.trim()}>
              Lanjutkan Pembayaran
            </UiButton>
          </div>
        )}

        {/* ============ STEP 2 — Choose bank & transfer ============ */}
        {step === 'payment' && order && (
          <div className="flex flex-col gap-3.5">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="font-body text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Total Pembayaran</p>
              <p className="font-headline text-2xl font-extrabold text-on-surface">{formatRupiah(templatePrice)}</p>
              <p className="font-body text-[10px] text-on-surface-variant mt-1">Order ID: <span className="font-mono font-bold text-primary">{order.id}</span></p>
            </div>

            <p className="font-body text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Transfer ke salah satu rekening:</p>

            {banks.map((acc) => (
              <div key={acc.key} className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-headline text-sm font-bold text-on-surface">{acc.bank}</p>
                    <p className="font-body text-[11px] text-on-surface-variant mt-0.5">a.n. <strong className="text-on-surface">{acc.holder}</strong></p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Pilih</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <code className="flex-1 font-mono text-sm sm:text-base font-bold text-on-surface bg-surface-container-low rounded-lg px-3 py-2.5 border border-outline-variant/50 tracking-widest">
                    {acc.accountNumber}
                  </code>
                  <UiButton
                    variant="secondary"
                    size="sm"
                    icon="content_copy"
                    onClick={async () => {
                      const ok = await copyText(acc.accountNumber);
                      setCopiedBank(ok ? acc.key : null);
                      window.setTimeout(() => setCopiedBank(null), 1800);
                    }}
                  >
                    {copiedBank === acc.key ? 'Tersalin' : 'Salin'}
                  </UiButton>
                </div>
                {acc.accountNumber.replace(/\D/g, '').length < 8 && (
                  <p className="font-body text-[9px] text-amber-700 mt-2">
                    Nomor rekening belum diatur admin. Silakan tunggu informasi resmi dari MomenKita.
                  </p>
                )}
              </div>
            ))}

            <UiButton variant="whatsapp" size="lg" fullWidth icon="check_circle" onClick={() => setStep('confirm')}>
              Saya Sudah Membayar
            </UiButton>
            <UiButton variant="ghost" size="sm" fullWidth onClick={() => setStep('form')}>
              Kembali
            </UiButton>
          </div>
        )}

        {/* ============ STEP 3 — Payment confirmation ============ */}
        {step === 'confirm' && order && (
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Nama Customer</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nomor WhatsApp</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Order ID</label>
              <input type="text" value={order.id} readOnly className={`${inputCls} bg-surface-container-low text-primary font-mono font-bold`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Bank yang Digunakan</label>
                <select value={bank} onChange={(e) => setBank(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  {banks.map((b) => (
                    <option key={b.key} value={b.bank}>{b.bank}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nominal Pembayaran</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} min={0} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>Tanggal Pembayaran</label>
                <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Jam Pembayaran</label>
                <input type="time" value={payTime} onChange={(e) => setPayTime(e.target.value)} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Bukti Transfer / Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProofFile(e.target.files?.[0] || null)}
                className="block w-full text-[11px] text-on-surface-variant file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-[11px] file:font-bold file:cursor-pointer cursor-pointer"
              />
              {proof ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={proof} alt="Bukti transfer" className="w-16 h-16 object-cover rounded-lg border border-outline-variant/50" />
                  <span className="font-body text-[11px] font-bold text-emerald-700">Bukti tersimpan ✓</span>
                </div>
              ) : (
                <p className="font-body text-[10px] text-on-surface-variant mt-1.5">Screenshot bukti transfer WAJIB diupload untuk verifikasi.</p>
              )}
            </div>

            <UiButton variant="whatsapp" size="lg" fullWidth icon="send" onClick={handleConfirmPayment} disabled={!proof}>
              {uploading ? 'Memproses...' : 'Kirim Konfirmasi Pembayaran'}
            </UiButton>
            <UiButton variant="ghost" size="sm" fullWidth onClick={() => setStep('payment')}>
              Kembali
            </UiButton>
          </div>
        )}

        {/* ============ SUCCESS ============ */}
        {step === 'success' && order && (
          <div className="flex flex-col items-center text-center gap-3">
            <span className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">Konfirmasi Dikirim</h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              Bukti pembayaran Anda sudah dikirim. Status pesanan sekarang:
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold">
              🟠 Menunggu Verifikasi
            </span>
            <div className="w-full bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40 text-left">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Order ID</p>
              <p className="font-mono text-sm font-bold text-primary">{order.id}</p>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-outline mt-2 mb-1">Template</p>
              <p className="font-body text-xs text-on-surface">{template.categoryLabel} #{template.templateNumber} — {template.name}</p>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-outline mt-2 mb-1">Status</p>
              <p className="font-body text-xs text-on-surface">Menunggu verifikasi admin.</p>
            </div>

            <a href={adminLink} target="_blank" rel="noreferrer" className="btn-micro w-full min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md cursor-pointer">
              <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              Konfirmasi via WhatsApp Admin
            </a>
            <p className="font-body text-[10px] text-on-surface-variant">
              Membuka WhatsApp admin dengan pesan otomatis berisi detail pesanan. Admin akan memverifikasi bukti pembayaran Anda.
            </p>
            {onTrackOrder && (
              <UiButton variant="secondary" size="md" fullWidth icon="receipt_long" onClick={() => onTrackOrder(order.id, order.customerPhone)}>
                Lacak Status Pesanan
              </UiButton>
            )}
            <UiButton variant="ghost" size="md" fullWidth icon="close" onClick={onClose}>
              Tutup
            </UiButton>
          </div>
        )}
      </div>
    </div>
  );
};
