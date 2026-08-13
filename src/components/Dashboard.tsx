import React, { useMemo, useState } from 'react';
import { Template } from '../types';
import { TEMPLATES, getTemplateByUid, formatRupiah } from '../data/templates';
import {
  Invitation,
  getAllInvitations,
  deleteInvitation,
  getInvitationUrl,
  getInvitationTitle,
  getInvitationDisplayName,
  invitationStatusLabel,
} from '../lib/invitations';
import {
  Order,
  OrderStatus,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  paidRevenueTotal,
  revenueToday,
  revenueThisWeek,
  revenueThisMonth,
  getMonthlyRevenue,
} from '../lib/orders';
import {
  buildWaLink,
  invitationShareMessage,
  deliveryMessage,
} from '../lib/whatsapp';
import {
  getAdminEmail,
  setAdminEmail,
  getAdminPassword,
  setAdminPassword,
  DEFAULT_ADMIN_PASSWORD,
} from '../lib/admin';
import { getPaymentSettings, setPaymentSettings, PaymentSettings, PAYMENT_HOLDER } from '../lib/payment';
import { Mail, Eye } from 'lucide-react';
import { UiButton } from './UiButton';
import { AdminTemplates } from './AdminTemplates';
import { AdminOrderDetail } from './AdminOrderDetail';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Toast } from './Toast';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from './AnimationKit';

interface DashboardProps {
  onEditInvitation: (id: string) => void;
  onPreviewInvitation: (slug: string) => void;
  onNewInvitation: (templateUid?: string, orderId?: string) => void;
  onGoHome: () => void;
  onLogout: () => void;
}

type AdminTab = 'overview' | 'templates' | 'orders' | 'invitations' | 'customers' | 'revenue' | 'settings';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-rose-50 text-rose-600 border-rose-200',
};

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Dashboard', icon: 'dashboard' },
  { key: 'templates', label: 'Templates', icon: 'design_services' },
  { key: 'orders', label: 'Orders', icon: 'receipt_long' },
  { key: 'invitations', label: 'Invitations', icon: 'mail' },
  { key: 'customers', label: 'Customers', icon: 'group' },
  { key: 'revenue', label: 'Revenue', icon: 'payments' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

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

/* ============================================================
   Order form modal (admin creates/edits a customer order)
   ============================================================ */
interface OrderFormModalProps {
  initial?: Order | null;
  defaultTemplateUid?: string;
  onClose: () => void;
  onSaved: (order: Order) => void;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  initial,
  defaultTemplateUid,
  onClose,
  onSaved,
}) => {
  const [customerName, setCustomerName] = useState(initial?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone || '');
  const [templateUid, setTemplateUid] = useState(initial?.templateUid || defaultTemplateUid || TEMPLATES[0].uid);
  const [notes, setNotes] = useState(initial?.notes || '');
  const [status, setStatus] = useState<OrderStatus>(initial?.status || 'AWAITING_PAYMENT');

  const selectedTemplate = getTemplateByUid(templateUid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !templateUid) return;
    const t = getTemplateByUid(templateUid);
    if (!t) return;
    const payload: Partial<Order> = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      templateUid: t.uid,
      category: t.category,
      templateNumber: t.templateNumber,
      templateName: t.name,
      price: t.price,
      source: 'admin',
      notes: notes.trim(),
      status,
    };
    const saved = initial ? updateOrder(initial.id, payload) : createOrder(payload);
    if (saved) onSaved(saved);
  };

  const inputCls =
    'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 font-body text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors';

  return (
    <motion.div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
    >
      <motion.div
        className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/40 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              receipt_long
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {initial ? `Edit Pesanan ${initial.id}` : 'Buat Pesanan'}
            </h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Nama Customer *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Andi Saputra" className={inputCls} required />
            </div>
            <div>
              <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Nomor WhatsApp Customer</label>
              <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 6281234567890" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Template yang Dipilih *</label>
            <select
              value={templateUid}
              onChange={(e) => setTemplateUid(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              {(['birthday', 'sunatan', 'wedding', 'aqiqah'] as const).map((cat) => (
                <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                  {TEMPLATES.filter((t) => t.category === cat).map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.categoryLabel} #{t.templateNumber} — {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedTemplate && (
              <p className="font-body text-[10px] text-outline mt-1">
                #{selectedTemplate.templateNumber} • {selectedTemplate.subcategory} • {formatRupiah(selectedTemplate.price)}
              </p>
            )}
          </div>

          <div>
            <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={`${inputCls} cursor-pointer`}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Catatan</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan dari chat WhatsApp customer / admin..." className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-1">
            <UiButton variant="secondary" fullWidth onClick={onClose}>Batal</UiButton>
            <UiButton type="submit" variant="accent" fullWidth icon="save">
              {initial ? 'Simpan Pesanan' : 'Buat Pesanan'}
            </UiButton>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   Admin Dashboard
   ============================================================ */
export const Dashboard: React.FC<DashboardProps> = ({
  onEditInvitation,
  onPreviewInvitation,
  onNewInvitation,
  onGoHome,
  onLogout,
}) => {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [invitations, setInvitations] = useState<Invitation[]>(() => getAllInvitations());
  const [orders, setOrders] = useState<Order[]>(() => getAllOrders());
  const [toast, setToast] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'invitation' | 'order'; id: string } | null>(null);
  const [orderModal, setOrderModal] = useState<{ open: boolean; initial?: Order | null; templateUid?: string }>({ open: false });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshInvitations = () => setInvitations(getAllInvitations());
  const refreshOrders = () => setOrders(getAllOrders());

  const handleSavedOrder = (order: Order) => {
    setOrderModal({ open: false });
    refreshOrders();
    setToast(`Pesanan ${order.id} disimpan.`);
  };

  const handleCopy = async (inv: Invitation) => {
    const ok = await copyText(getInvitationUrl(inv));
    setToast(ok ? 'Link undangan berhasil disalin.' : 'Gagal menyalin link.');
    if (ok) {
      setCopiedSlug(inv.slug);
      window.setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.kind === 'invitation') {
      deleteInvitation(confirmDelete.id);
      setToast('Undangan dihapus.');
      refreshInvitations();
    } else {
      deleteOrder(confirmDelete.id);
      setToast('Pesanan dihapus.');
      refreshOrders();
    }
    setConfirmDelete(null);
  };

  const filteredInvitations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invitations.filter((inv) => {
      if (statusFilter !== 'ALL' && inv.status !== statusFilter) return false;
      if (!q) return true;
      const t = getTemplateByUid(inv.templateUid);
      const haystack = [
        inv.customerName,
        inv.slug,
        inv.templateUid,
        inv.category,
        inv.templateNumber,
        getInvitationDisplayName(inv),
        t?.name || '',
        t?.categoryLabel || '',
        t?.id || '',
        inv.venue,
        inv.orderId || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [invitations, query, statusFilter]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (!q) return true;
      const t = getTemplateByUid(o.templateUid);
      const haystack = [o.id, o.customerName, o.customerPhone, o.customerEmail || '', o.eventName || '', o.templateUid, o.category, o.templateNumber, o.templateName, t?.name || '', t?.categoryLabel || '', o.notes, o.payment?.bank || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, query, statusFilter]);

  /* ----- Overview stats ----- */
  const totalRevenue = paidRevenueTotal(orders);
  const stats = [
    { label: 'Total Pesanan', value: orders.length, icon: 'receipt_long' },
    { label: 'Total Undangan', value: invitations.length, icon: 'mail' },
    { label: 'Published', value: invitations.filter((i) => i.status === 'published').length, icon: 'public' },
    { label: 'Customer', value: new Set([...invitations.map((i) => i.customerPhone || i.customerName), ...orders.map((o) => o.customerPhone || o.customerName)]).size, icon: 'group' },
  ];

  const revenueStats = [
    { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: 'savings', highlight: true },
    { label: 'Hari Ini', value: formatRupiah(revenueToday(orders)), icon: 'today' },
    { label: 'Minggu Ini', value: formatRupiah(revenueThisWeek(orders)), icon: 'calendar_view_week' },
    { label: 'Bulan Ini', value: formatRupiah(revenueThisMonth(orders)), icon: 'calendar_month' },
  ];

  /* ----- Customers aggregation ----- */
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; orders: number; invitations: number; lastActivity: number }>();
    const upsert = (name: string, phone: string, ts: number, kind: 'order' | 'invitation') => {
      const key = phone || name || 'anonym';
      const cur = map.get(key) || { name: name || 'Tanpa Nama', phone, orders: 0, invitations: 0, lastActivity: 0 };
      cur.name = name || cur.name;
      cur.phone = phone || cur.phone;
      if (kind === 'order') cur.orders += 1;
      else cur.invitations += 1;
      cur.lastActivity = Math.max(cur.lastActivity, ts);
      map.set(key, cur);
    };
    orders.forEach((o) => upsert(o.customerName, o.customerPhone, o.updatedAt, 'order'));
    invitations.forEach((i) => upsert(i.customerName, i.customerPhone, i.updatedAt, 'invitation'));
    return Array.from(map.values()).sort((a, b) => b.lastActivity - a.lastActivity);
  }, [orders, invitations]);

  const recentInvitations = [...invitations].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);
  const recentOrders = [...orders].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5);

  const tabContent = (key: AdminTab) => {
    switch (key) {
      /* ===================== OVERVIEW ===================== */
      case 'overview':
        return (
          <div className="flex flex-col gap-6">
            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <UiButton variant="accent" size="lg" icon="receipt_long" iconFilled onClick={() => setOrderModal({ open: true })}>
                Buat Pesanan
              </UiButton>
              <UiButton variant="primary" size="lg" icon="add" onClick={() => setTab('templates')}>
                Buat Undangan
              </UiButton>
              <UiButton variant="secondary" size="lg" icon="group" onClick={() => setTab('customers')}>
                Lihat Customer
              </UiButton>
            </div>

            {/* Revenue stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {revenueStats.map((s) => (
                <div key={s.label} className={`border rounded-2xl p-4 flex items-center gap-3 ${s.highlight ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.highlight ? 'bg-white/15 text-white' : 'bg-secondary/15 text-primary'}`}>
                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className={`font-headline text-sm sm:text-base font-extrabold leading-none truncate ${s.highlight ? 'text-on-primary' : 'text-primary'}`}>{s.value}</div>
                    <div className={`font-body text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 ${s.highlight ? 'text-white/80' : 'text-on-surface-variant'}`}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/15 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">{s.icon}</span>
                  </div>
                  <div>
                    <div className="font-headline text-lg font-extrabold text-primary leading-none">{s.value}</div>
                    <div className="font-body text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent orders */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-base font-bold text-on-surface">Pesanan Terbaru</h3>
                  <button onClick={() => setTab('orders')} className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer">Lihat Semua</button>
                </div>
                {recentOrders.length === 0 ? (
                  <p className="font-body text-xs text-on-surface-variant">Belum ada pesanan. Buat pesanan pertama dari chat WhatsApp customer.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-outline-variant/30">
                    {recentOrders.map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-body text-xs font-bold text-on-surface truncate">{o.customerName || 'Tanpa Nama'}</p>
                          <p className="font-body text-[10px] text-on-surface-variant truncate">{o.id} • {getTemplateByUid(o.templateUid)?.categoryLabel} #{o.templateNumber}</p>
                        </div>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent invitations */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-base font-bold text-on-surface">Undangan Terbaru</h3>
                  <button onClick={() => setTab('invitations')} className="font-body text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer">Lihat Semua</button>
                </div>
                {recentInvitations.length === 0 ? (
                  <p className="font-body text-xs text-on-surface-variant">Belum ada undangan. Pilih template untuk membuat undangan customer.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-outline-variant/30">
                    {recentInvitations.map((i) => (
                      <div key={i.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-body text-xs font-bold text-on-surface truncate">{getInvitationDisplayName(i) || i.customerName}</p>
                          <p className="font-mono text-[10px] text-primary truncate">/i/{i.slug}</p>
                        </div>
                        <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold ${STATUS_STYLES[i.status]}`}>{invitationStatusLabel[i.status]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      /* ===================== TEMPLATES ===================== */
      case 'templates':
        return (
          <AdminTemplates
            onNewInvitation={onNewInvitation}
            onCreateOrder={() => setOrderModal({ open: true })}
          />
        );

      /* ===================== ORDERS ===================== */
      case 'orders': {
        const orderFilters: { key: string; label: string }[] = [
          { key: 'ALL', label: 'Semua' },
          { key: 'AWAITING_PAYMENT', label: '🟡 Menunggu Pembayaran' },
          { key: 'AWAITING_VERIFICATION', label: '🟠 Menunggu Verifikasi' },
          { key: 'PAID', label: '🟢 Dibayar' },
          { key: 'PROCESSING', label: '🔵 Diproses' },
          { key: 'COMPLETED', label: '✅ Selesai' },
          { key: 'REJECTED', label: '🔴 Ditolak' },
          { key: 'CANCELLED', label: '⚫ Dibatalkan' },
        ];
        const awaitingCount = orders.filter((o) => o.status === 'AWAITING_VERIFICATION').length;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                Pesanan dibuat otomatis saat customer checkout di website. Verifikasi pembayaran untuk memproses pesanan.
              </p>
              <UiButton variant="accent" size="md" icon="add" onClick={() => setOrderModal({ open: true })}>
                Buat Pesanan
              </UiButton>
            </div>

            {/* Status filter pills (horizontally scrollable on mobile) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {orderFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`btn-micro flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === f.key
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary/40 hover:text-on-surface'
                  }`}
                >
                  {f.label}
                  {f.key === 'AWAITING_VERIFICATION' && awaitingCount > 0 && (
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold ${statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                      {awaitingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-outline">receipt_long</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">Belum ada pesanan</h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
                  Saat customer memesan template dari website, pesanan akan otomatis masuk ke sini beserta bukti pembayarannya.
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">Tidak ada hasil</h3>
                <button onClick={() => { setQuery(''); setStatusFilter('ALL'); }} className="font-body text-[11px] font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer">
                  Reset filter
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredOrders.map((o) => {
                  const t = getTemplateByUid(o.templateUid);
                  const label = t ? `${t.categoryLabel} #${t.templateNumber} • ${t.name}` : `${o.templateName || o.templateUid}`;
                  return (
                    <article key={o.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={t?.image || ''} alt="" className="w-12 h-16 object-cover rounded-lg border border-outline-variant/40 shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
                        <div className="min-w-0">
                          <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface truncate">{o.customerName || 'Tanpa Nama'}</h3>
                          <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">{label}</p>
                          <p className="font-mono text-[10px] sm:text-[11px] text-primary">{o.id}</p>
                          <p className="font-body text-[11px] font-extrabold text-emerald-700 mt-0.5">{formatRupiah(o.price)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left lg:w-[300px] shrink-0">
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Status</div>
                          <OrderStatusBadge status={o.status} size="sm" />
                        </div>
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Bukti</div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold ${o.payment ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-outline/5 text-outline border-outline-variant'}`}>
                            {o.payment ? 'ADA' : '—'}
                          </span>
                        </div>
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Dibuat</div>
                          <div className="font-body text-[11px] font-bold text-on-surface">{new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                        <UiButton variant="primary" size="sm" icon="visibility" onClick={() => setSelectedOrder(o)}>
                          Detail
                        </UiButton>
                        <UiButton variant="secondary" size="sm" icon="edit_note" iconFilled onClick={() => onNewInvitation(o.templateUid, o.id)}>
                          Buat Undangan
                        </UiButton>
                        {o.customerPhone && (
                          <UiButton
                            variant="whatsapp"
                            size="sm"
                            icon="chat"
                            iconFilled
                            href={buildWaLink(`Halo Kak ${o.customerName} 👋\n\nBerkaitan dengan pesanan undangan Anda di MomenKita (${label}), mohon informasi yang dibutuhkan:\n\nTerima kasih.`, o.customerPhone)}
                            external
                            title={o.customerPhone}
                          >
                            Chat
                          </UiButton>
                        )}
                        <button
                          onClick={() => setConfirmDelete({ kind: 'order', id: o.id })}
                          className="btn-micro min-h-[36px] px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          title="Hapus pesanan"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      /* ===================== INVITATIONS ===================== */
      case 'invitations':
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:max-w-sm">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama, slug, template..."
                  className="w-full pl-9 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-xs sm:text-sm text-on-surface placeholder:text-outline/70 transition-colors"
                />
                {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 cursor-pointer"><span className="material-symbols-outlined text-sm">cancel</span></button>}
              </div>
              <div className="flex items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2.5 font-body text-xs text-on-surface focus:outline-none cursor-pointer">
                  <option value="ALL">Semua Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="expired">Expired</option>
                </select>
                <UiButton variant="accent" size="md" icon="add" onClick={() => setTab('templates')}>
                  Buat Undangan
                </UiButton>
              </div>
            </div>

            {filteredInvitations.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                <Mail size={44} strokeWidth={1.2} className="text-outline" aria-hidden="true" />
                <h3 className="font-headline text-lg font-bold text-on-surface">{invitations.length === 0 ? 'Belum ada undangan' : 'Tidak ada hasil'}</h3>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
                  Buat undangan dari tab Templates atau dari sebuah pesanan.
                </p>
                {invitations.length === 0 && (
                  <UiButton variant="accent" icon="add" onClick={() => setTab('templates')} className="mt-1">Buat Undangan Pertama</UiButton>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredInvitations.map((inv) => {
                  const template = getTemplateByUid(inv.templateUid);
                  const displayName = getInvitationDisplayName(inv, template);
                  const title = getInvitationTitle(inv, template);
                  const url = getInvitationUrl(inv);
                  const shareable = inv.status === 'published' || inv.status === 'expired';
                  return (
                    <article key={inv.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={template?.image || ''} alt="" className="w-14 h-[76px] object-cover rounded-xl border border-outline-variant/40 shrink-0" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
                        <div className="min-w-0">
                          <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface truncate flex items-center gap-2">
                            {displayName || inv.customerName || 'Tanpa Nama'}
                            {inv.status === 'published' && <span className="shrink-0 material-symbols-outlined text-sm text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                          </h3>
                          <p className="font-body text-[11px] sm:text-xs text-on-surface-variant truncate">
                            {template ? `${template.categoryLabel} #${template.templateNumber} • ${template.name}` : inv.templateUid}
                          </p>
                          <p className="font-mono text-[10px] sm:text-[11px] text-primary truncate">/i/{inv.slug}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left lg:w-[340px] shrink-0">
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Customer</div>
                          <div className="font-body text-[11px] font-bold text-on-surface truncate">{inv.customerName || '—'}</div>
                        </div>
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Status</div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-bold ${STATUS_STYLES[inv.status]}`}>{invitationStatusLabel[inv.status]}</span>
                        </div>
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Dibuat</div>
                          <div className="font-body text-[11px] font-bold text-on-surface">{new Date(inv.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div>
                          <div className="font-body text-[9px] font-bold uppercase tracking-wider text-outline">Diubah</div>
                          <div className="font-body text-[11px] font-bold text-on-surface">{new Date(inv.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-nowrap lg:justify-end shrink-0">
                        <button onClick={() => onEditInvitation(inv.id)} className="btn-micro min-h-[36px] px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">edit</span> Edit
                        </button>
                        <button onClick={() => onPreviewInvitation(inv.slug)} className="btn-micro min-h-[36px] px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <Eye size={14} aria-hidden="true" /> Preview
                        </button>
                        <button onClick={() => handleCopy(inv)} className="btn-micro min-h-[36px] px-3 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary hover:border-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">{copiedSlug === inv.slug ? 'check' : 'content_copy'}</span>
                          {copiedSlug === inv.slug ? 'Tersalin' : 'Copy Link'}
                        </button>
                        {inv.customerPhone && (
                          <a
                            href={buildWaLink(deliveryMessage(inv.customerName || displayName, url), inv.customerPhone)}
                            target="_blank"
                            rel="noreferrer"
                            disabled={!shareable}
                            className={`btn-micro min-h-[36px] px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer ${shareable ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-surface-container-low text-outline border border-outline-variant pointer-events-none'}`}
                            title={shareable ? 'Kirim link ke customer via WhatsApp' : 'Publikasikan dulu'}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span> Send
                          </a>
                        )}
                        <a
                          href={buildWaLink(invitationShareMessage(title, url, inv.eventDate))}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!shareable}
                          className={`btn-micro min-h-[36px] px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer ${shareable ? 'bg-primary text-white hover:bg-[#1d2d54]' : 'bg-surface-container-low text-outline border border-outline-variant pointer-events-none'}`}
                          title={shareable ? 'Bagikan via WhatsApp' : 'Publikasikan dulu'}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span> WA
                        </a>
                        <button onClick={() => setConfirmDelete({ kind: 'invitation', id: inv.id })} className="btn-micro min-h-[36px] px-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        );

      /* ===================== CUSTOMERS ===================== */
      case 'customers':
        return (
          <div className="flex flex-col gap-4">
            <p className="font-body text-xs sm:text-sm text-on-surface-variant">
              Daftar customer (digabung dari pesanan & undangan). Setiap customer hanya melihat undangannya sendiri.
            </p>
            {customers.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-outline">group</span>
                <h3 className="font-headline text-lg font-bold text-on-surface">Belum ada customer</h3>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-outline-variant/40 text-[10px] sm:text-[11px] uppercase tracking-wider text-outline">
                        <th className="px-4 py-3 font-bold">Customer</th>
                        <th className="px-4 py-3 font-bold">WhatsApp</th>
                        <th className="px-4 py-3 font-bold">Pesanan</th>
                        <th className="px-4 py-3 font-bold">Undangan</th>
                        <th className="px-4 py-3 font-bold">Aktivitas</th>
                        <th className="px-4 py-3 font-bold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.phone || c.name} className="border-b border-outline-variant/20">
                          <td className="px-4 py-3 font-body text-xs font-bold text-on-surface">{c.name}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-primary">{c.phone || '—'}</td>
                          <td className="px-4 py-3 font-body text-xs">{c.orders}</td>
                          <td className="px-4 py-3 font-body text-xs">{c.invitations}</td>
                          <td className="px-4 py-3 font-body text-[11px] text-on-surface-variant">{new Date(c.lastActivity).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td className="px-4 py-3">
                            {c.phone && (
                              <a href={buildWaLink('Halo, ini MomenKita.', c.phone)} target="_blank" rel="noreferrer" className="btn-micro inline-flex items-center gap-1 min-h-[32px] px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-[10px] uppercase tracking-wider cursor-pointer">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span> Hubungi
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      /* ===================== REVENUE ===================== */
      case 'revenue': {
        const monthly = getMonthlyRevenue(orders);
        const now = new Date();
        const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const curMonth = monthly.find((m) => m.key === curKey);
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
        const prevMonth = monthly.find((m) => m.key === prevKey);
        const avg = curMonth && curMonth.orders > 0 ? Math.round(curMonth.total / curMonth.orders) : 0;

        // Last 6 months for the chart (fill missing months with 0)
        const chartMonths: { label: string; total: number; orders: number; isCurrent: boolean }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const m = monthly.find((x) => x.key === key);
          chartMonths.push({
            label: d.toLocaleDateString('id-ID', { month: 'short' }),
            total: m?.total || 0,
            orders: m?.orders || 0,
            isCurrent: i === 0,
          });
        }
        const chartMax = Math.max(...chartMonths.map((m) => m.total), 1);
        const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const curLabel = curMonth ? curMonth.label : `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

        const revenueCards = [
          { label: 'Pendapatan Bulan Ini', value: formatRupiah(curMonth?.total || 0), sub: curLabel, icon: 'savings', highlight: true },
          { label: 'Bulan Lalu', value: formatRupiah(prevMonth?.total || 0), sub: prevMonth?.label || `${MONTHS[prev.getMonth()]} ${prev.getFullYear()}`, icon: 'calendar_view_month' },
          { label: 'Rata-rata Transaksi', value: formatRupiah(avg), sub: `${curMonth?.orders || 0} transaksi bulan ini`, icon: 'calculate' },
          { label: 'Total Transaksi (Bulan Ini)', value: String(curMonth?.orders || 0), sub: curLabel, icon: 'receipt_long' },
        ];

        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                Pendapatan hanya dihitung dari pesanan dengan status <strong className="text-emerald-700">Dibayar (PAID)</strong> — setelah admin memverifikasi bukti transfer.
              </p>
              <UiButton variant="secondary" size="md" icon="receipt_long" onClick={() => setTab('orders')}>
                Lihat Orders
              </UiButton>
            </div>

            {/* Revenue summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {revenueCards.map((c) => (
                <div key={c.label} className={`border rounded-2xl p-4 ${c.highlight ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant/40'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-lg ${c.highlight ? 'text-white' : 'text-primary'}`}>{c.icon}</span>
                    <span className={`font-body text-[9px] font-bold uppercase tracking-wider ${c.highlight ? 'text-white/80' : 'text-on-surface-variant'}`}>{c.label}</span>
                  </div>
                  <div className={`font-headline text-base sm:text-lg font-extrabold truncate ${c.highlight ? 'text-on-primary' : 'text-primary'}`}>{c.value}</div>
                  <div className={`font-body text-[10px] mt-0.5 truncate ${c.highlight ? 'text-white/70' : 'text-outline'}`}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5">
              <h3 className="font-headline text-base font-bold text-on-surface mb-1">Pendapatan 6 Bulan Terakhir</h3>
              <p className="font-body text-[11px] text-on-surface-variant mb-4">Berdasarkan tanggal verifikasi pembayaran.</p>
              <div className="flex items-end gap-2 sm:gap-3 h-40">
                {chartMonths.map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
                    <span className="font-body text-[9px] font-bold text-on-surface-variant truncate">{m.total > 0 ? (m.total >= 1_000_000 ? `${(m.total / 1_000_000).toFixed(1)}jt` : m.total.toLocaleString('id-ID')) : ''}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${m.isCurrent ? 'bg-[#C9A45C]' : 'bg-primary/70'}`}
                      style={{ height: `${Math.max((m.total / chartMax) * 100, m.total > 0 ? 6 : 2)}%`, minHeight: m.total > 0 ? 8 : 3 }}
                      title={`${m.label}: ${formatRupiah(m.total)} (${m.orders} order)`}
                    />
                    <span className={`font-body text-[10px] font-bold uppercase tracking-wider ${m.isCurrent ? 'text-primary' : 'text-outline'}`}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly report table */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/40">
                <h3 className="font-headline text-base font-bold text-on-surface">Laporan Bulanan</h3>
              </div>
              {monthly.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-outline">payments</span>
                  <p className="font-body text-xs text-on-surface-variant">Belum ada pendapatan. Pesanan akan terhitung setelah diverifikasi.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-outline-variant/40 text-[10px] sm:text-[11px] uppercase tracking-wider text-outline">
                        <th className="px-5 py-3 font-bold">Bulan</th>
                        <th className="px-5 py-3 font-bold">Transaksi</th>
                        <th className="px-5 py-3 font-bold">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((m) => (
                        <tr key={m.key} className="border-b border-outline-variant/20 last:border-0">
                          <td className="px-5 py-3 font-body text-xs font-bold text-on-surface">{m.label}</td>
                          <td className="px-5 py-3 font-body text-xs">{m.orders} order</td>
                          <td className="px-5 py-3 font-body text-xs font-extrabold text-emerald-700">{formatRupiah(m.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      }

      /* ===================== SETTINGS ===================== */
      case 'settings':
        return <SettingsTab onLogout={onLogout} onGoHome={onGoHome} onToast={setToast} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-8 pt-24 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            Dashboard Admin
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
            Kelola pesanan, undangan, dan customer MomenKita.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <UiButton variant="secondary" icon="auto_awesome" iconFilled onClick={onGoHome}>
            MomenKita
          </UiButton>
          <UiButton variant="danger" icon="logout" onClick={onLogout}>
            Logout
          </UiButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-1.5 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              if (t.key !== 'orders' && t.key !== 'invitations') setStatusFilter('ALL');
              setTab(t.key);
            }}
            className={`btn-micro flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
              tab === t.key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + filter shared by orders & invitations tabs */}
      {(tab === 'orders' || tab === 'invitations') && (
        <div className="mb-4 flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === 'orders' ? 'Cari order, customer, WhatsApp, atau template...' : 'Cari undangan, customer, slug...'}
              className="w-full pl-9 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-xs sm:text-sm text-on-surface placeholder:text-outline/70 transition-colors"
            />
            {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 cursor-pointer"><span className="material-symbols-outlined text-sm">cancel</span></button>}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="self-start sm:self-auto bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2.5 font-body text-xs text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            {tab === 'orders'
              ? ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)
              : (['draft', 'published', 'expired'] as const).map((s) => <option key={s} value={s}>{invitationStatusLabel[s]}</option>)}
          </select>
        </div>
      )}

      {tabContent(tab)}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <motion.div
              className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/40"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Hapus {confirmDelete.kind === 'invitation' ? 'undangan' : 'pesanan'}?
                </h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-5">
                {confirmDelete.kind === 'invitation'
                  ? (() => {
                      const target = getAllInvitations().find((i) => i.id === confirmDelete.id);
                      return `"${target ? getInvitationDisplayName(target) : 'Undangan'}" akan dihapus permanen. Link tidak akan bisa diakses lagi.`;
                    })()
                  : `Pesanan ${confirmDelete.id} akan dihapus permanen.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <UiButton variant="secondary" fullWidth onClick={() => setConfirmDelete(null)}>Batal</UiButton>
                <UiButton variant="danger" fullWidth icon="delete" onClick={handleDelete}>Ya, Hapus</UiButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order form modal */}
      <AnimatePresence>
        {orderModal.open && (
          <OrderFormModal
            initial={orderModal.initial || null}
            defaultTemplateUid={orderModal.templateUid}
            onClose={() => setOrderModal({ open: false })}
            onSaved={handleSavedOrder}
          />
        )}
      </AnimatePresence>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <AdminOrderDetail
            order={selectedOrder}
            templateLabel={(() => {
              const t = getTemplateByUid(selectedOrder.templateUid);
              return t ? `${t.categoryLabel} #${t.templateNumber} • ${t.name}` : selectedOrder.templateName || selectedOrder.templateUid;
            })()}
            templateImage={getTemplateByUid(selectedOrder.templateUid)?.image}
            onClose={() => setSelectedOrder(null)}
            onChanged={() => {
              refreshOrders();
              setSelectedOrder(getOrderById(selectedOrder.id) || null);
            }}
            onToast={setToast}
            onNewInvitation={onNewInvitation}
          />
        )}
      </AnimatePresence>

      <Toast open={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
};

/* ============================================================
   Settings tab
   ============================================================ */
const SettingsTab: React.FC<{ onLogout: () => void; onGoHome: () => void; onToast: (msg: string) => void }> = ({ onLogout, onGoHome, onToast }) => {
  const [email, setEmail] = useState(getAdminEmail());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [exporting, setExporting] = useState(false);
  const [paymentSettings, setPaymentSettingsLocal] = useState<PaymentSettings>(getPaymentSettings());

  const savePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSettings({
      bsiAccount: paymentSettings.bsiAccount.trim().replace(/\D/g, ''),
      jagoAccount: paymentSettings.jagoAccount.trim().replace(/\D/g, ''),
    });
    setPaymentSettingsLocal(getPaymentSettings());
    onToast('Nomor rekening pembayaran berhasil diubah.');
  };

  const saveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      onToast('Email tidak valid.');
      return;
    }
    if (password.length < 4) {
      onToast('Password minimal 4 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      onToast('Konfirmasi password tidak cocok.');
      return;
    }
    setAdminEmail(email);
    setAdminPassword(password);
    setPassword('');
    setConfirmPassword('');
    onToast('Email & password admin berhasil diubah.');
  };

  const exportData = () => {
    setExporting(true);
    const payload = {
      exportedAt: new Date().toISOString(),
      invitations: getAllInvitations(),
      orders: getAllOrders(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momenkita-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExporting(false);
    onToast('Data berhasil diekspor.');
  };

  const inputCls =
    'w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 font-body text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-6">
        <h3 className="font-headline text-base font-bold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary">password</span> Ubah Email & Password
        </h3>
        <p className="font-body text-xs text-on-surface-variant mb-4">
          Email saat ini: <span className="font-mono text-primary">{getAdminEmail()}</span>
          {getAdminPassword() === DEFAULT_ADMIN_PASSWORD && ' • (password default: MK-2026)'}
        </p>
        <form onSubmit={saveCredentials} className="flex flex-col gap-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email admin" className={inputCls} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password baru (min. 4 karakter)" className={inputCls} />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Konfirmasi password baru" className={inputCls} />
          <UiButton type="submit" variant="primary" icon="save">Simpan Email & Password</UiButton>
        </form>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-6 lg:col-span-2">
        <h3 className="font-headline text-base font-bold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary">account_balance</span> Rekening Pembayaran
        </h3>
        <p className="font-body text-xs text-on-surface-variant mb-4">
          Nomor rekening yang ditampilkan ke customer saat checkout. Atas nama <strong className="text-on-surface">{PAYMENT_HOLDER}</strong>.
        </p>
        <form onSubmit={savePaymentSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">BANK SYARIAH INDONESIA (BSI)</label>
            <input
              type="text"
              inputMode="numeric"
              value={paymentSettings.bsiAccount}
              onChange={(e) => setPaymentSettingsLocal({ ...paymentSettings, bsiAccount: e.target.value })}
              placeholder="Nomor rekening BSI"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block font-body text-[10px] sm:text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">BANK JAGO SYARIAH</label>
            <input
              type="text"
              inputMode="numeric"
              value={paymentSettings.jagoAccount}
              onChange={(e) => setPaymentSettingsLocal({ ...paymentSettings, jagoAccount: e.target.value })}
              placeholder="Nomor rekening Jago"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <UiButton type="submit" variant="primary" icon="save">Simpan Rekening</UiButton>
          </div>
        </form>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 sm:p-6">
        <h3 className="font-headline text-base font-bold text-on-surface mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary">storage</span> Data & Keamanan
        </h3>
        <p className="font-body text-xs text-on-surface-variant mb-4">
          Data tersimpan di perangkat ini (localStorage). Ekspor untuk cadangan.
        </p>
        <div className="flex flex-col gap-2.5">
          <UiButton variant="secondary" icon="download" onClick={exportData} disabled={exporting}>
            {exporting ? 'Menyiapkan...' : 'Ekspor Data (JSON)'}
          </UiButton>
          <UiButton variant="danger" icon="logout" onClick={onLogout}>Logout dari Dashboard</UiButton>
          <button onClick={onGoHome} className="font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer text-left mt-1">
            ← Kembali ke website MomenKita
          </button>
        </div>
      </div>
    </div>
  );
};
