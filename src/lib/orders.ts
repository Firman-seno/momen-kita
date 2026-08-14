import { CategoryKey } from '../types';
import { ORDERS_STORAGE_KEY } from './storageKeys';
import { scheduleDataSync } from './serverApi';

/* ============================================================
   MomenKita — Order System (customer + admin)
   ------------------------------------------------------------
   Customers create orders directly from the template catalog.
   Orders appear automatically in the admin dashboard.

   Payment-centric status flow:
     AWAITING_PAYMENT      (Menunggu Pembayaran)
     AWAITING_VERIFICATION (Menunggu Verifikasi)
     PAID                  (Dibayar)   ← only after admin verifies
     PROCESSING            (Diproses)
     COMPLETED             (Selesai)
     REJECTED              (Ditolak)
     CANCELLED             (Dibatalkan)

   Price is always taken from the stored Template — never from
   anything a customer submits from the frontend.
   ============================================================ */

export type OrderStatus =
  | 'AWAITING_PAYMENT'
  | 'AWAITING_VERIFICATION'
  | 'PAID'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export const ORDER_STATUSES: OrderStatus[] = [
  'AWAITING_PAYMENT',
  'AWAITING_VERIFICATION',
  'PAID',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'Menunggu Pembayaran',
  AWAITING_VERIFICATION: 'Menunggu Verifikasi',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses',
  COMPLETED: 'Selesai',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
};

/** Emoji used in the admin UI badges. */
export const ORDER_STATUS_EMOJI: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: '🟡',
  AWAITING_VERIFICATION: '🟠',
  PAID: '🟢',
  PROCESSING: '🔵',
  COMPLETED: '✅',
  REJECTED: '🔴',
  CANCELLED: '⚫',
};

/** Legacy admin statuses → new flow (localStorage migration). */
const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  NEW: 'AWAITING_PAYMENT',
  PROCESSING: 'PROCESSING',
  'WAITING FOR DATA': 'AWAITING_PAYMENT',
  DESIGNING: 'PROCESSING',
  READY: 'PAID',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const normalizeOrderStatus = (status: string | undefined): OrderStatus =>
  (ORDER_STATUSES as string[]).includes(status || '')
    ? (status as OrderStatus)
    : LEGACY_STATUS_MAP[status || ''] || 'AWAITING_PAYMENT';

/** Customer payment confirmation data. */
export interface OrderPayment {
  bank: string;
  amount: number;
  paymentDate: string;
  paymentTime: string;
  /** Data-URL of the uploaded transfer screenshot. */
  proofUrl: string;
  submittedAt: number;
}

export interface Order {
  id: string; // e.g. "ORD-20260813-001"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventName?: string;
  eventType?: string;
  templateUid: string;
  category: CategoryKey;
  templateNumber: string;
  templateName: string;
  price: number;
  notes: string;
  status: OrderStatus;
  /** Where the order was created: customer checkout or admin form. */
  source: 'customer' | 'admin';
   payment?: OrderPayment | null;
   /** Set when the admin verifies the payment (status → PAID). */
   verifiedAt?: number;
   verifiedBy?: string;
   /** Set when the admin creates an invitation from this order. */
   invitationId?: string;
   /** Public invitation slug — kept alongside invitationId so order
       data always knows which /i/<slug> belongs to it. */
   invitationSlug?: string;
   /** Max revisions included with the order (default 3). */
   maxRevision?: number;
   /** Number of revisions already used/requested. */
   revisionCount?: number;
   /** Final invitation URL — set when the order is COMPLETED & invitation delivered. */
   finalInvitationUrl?: string;
   /** True once the order is COMPLETED with a final link → rating is required. */
   isRatingRequired?: boolean;
   /** True once the customer has submitted a rating for this order. */
   hasRated?: boolean;
   createdAt: number;
   updatedAt: number;
}

const STORAGE_KEY = ORDERS_STORAGE_KEY;

export const getAllOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Order[]).map((o) => ({ ...o, status: normalizeOrderStatus(o.status) }));
  } catch {
    return [];
  }
};

const saveAllOrders = (list: Order[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    scheduleDataSync();
  } catch {
    /* storage full / unavailable — keep app working */
  }
};

export const getOrderById = (id: string): Order | undefined => {
  return getAllOrders().find((o) => o.id === id);
};

/** Find orders whose customer phone matches (used to link legacy invitations). */
export const findOrdersByPhone = (phone?: string | null): Order[] => {
  if (!phone) return [];
  const digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return [];
  return getAllOrders().filter((o) => {
    const d = (o.customerPhone || '').replace(/[^\d]/g, '');
    return !!d && (d === digits || d.endsWith(digits.slice(-9)) || digits.endsWith(d.slice(-9)));
  });
};

/** Sequential human-readable id: ORD-YYYYMMDD-NNN (unique per day). */
export const generateOrderId = (): string => {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const prefix = `ORD-${ymd}-`;
  const existing = getAllOrders().filter((o) => o.id.startsWith(prefix)).length;
  return `${prefix}${String(existing + 1).padStart(3, '0')}`;
};

export const createOrder = (data: Partial<Order>): Order => {
  const now = Date.now();
  const order: Order = {
    id: data.id || generateOrderId(),
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    customerEmail: data.customerEmail,
    eventName: data.eventName,
    eventType: data.eventType,
    templateUid: data.templateUid || '',
    category: data.category || 'birthday',
    templateNumber: data.templateNumber || '001',
    templateName: data.templateName || '',
    price: data.price || 0,
    notes: data.notes || '',
    status: normalizeOrderStatus(data.status) || 'AWAITING_PAYMENT',
    source: data.source || 'admin',
    payment: data.payment || null,
    verifiedAt: data.verifiedAt,
    verifiedBy: data.verifiedBy,
    invitationId: data.invitationId,
    invitationSlug: data.invitationSlug,
    maxRevision: data.maxRevision ?? 3,
    revisionCount: data.revisionCount ?? 0,
    finalInvitationUrl: data.finalInvitationUrl,
    isRatingRequired: data.isRatingRequired ?? false,
    hasRated: data.hasRated ?? false,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  };
  const list = getAllOrders();
  list.push(order);
  saveAllOrders(list);
  return order;
};

/** Customer checkout — creates an order in AWAITING_PAYMENT. */
export const createCustomerOrder = (data: Partial<Order>): Order =>
  createOrder({ ...data, source: 'customer', status: 'AWAITING_PAYMENT' });

export const updateOrder = (
  id: string,
  patch: Partial<Order>
): Order | undefined => {
  const list = getAllOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const next: Order = { ...list[idx], ...patch, id: list[idx].id, createdAt: list[idx].createdAt, updatedAt: Date.now() };
  list[idx] = next;
  saveAllOrders(list);
  return next;
};

export const deleteOrder = (id: string): void => {
  saveAllOrders(getAllOrders().filter((o) => o.id !== id));
};

/** Customer submits payment proof → status AWAITING_VERIFICATION. */
export const submitOrderPayment = (id: string, payment: OrderPayment): Order | undefined =>
  updateOrder(id, { payment, status: 'AWAITING_VERIFICATION' });

/** Admin verifies payment → status PAID (revenue is only counted from here). */
export const verifyOrderPayment = (id: string, verifiedBy: string): Order | undefined =>
  updateOrder(id, { status: 'PAID', verifiedAt: Date.now(), verifiedBy });

/** Admin rejects the payment proof. */
export const rejectOrderPayment = (id: string, verifiedBy: string): Order | undefined =>
  updateOrder(id, { status: 'REJECTED', verifiedBy, verifiedAt: Date.now() });

/* -----------------------------------------------
   Revenue helpers (PAID orders only)
   ----------------------------------------------- */

export const isPaid = (o: Order): boolean => o.status === 'PAID';

/** Revenue amount for an order = the template price stored at order time. */
export const orderAmount = (o: Order): number => o.price;

export const paidRevenueTotal = (list: Order[]): number =>
  list.filter(isPaid).reduce((sum, o) => sum + orderAmount(o), 0);

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const startOfWeek = (ts: number): number => {
  const d = new Date(startOfDay(ts));
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // treat Monday as start
  d.setDate(d.getDate() + diff);
  return d.getTime();
};

const startOfMonth = (ts: number): number => {
  const d = new Date(ts);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Time the order became PAID (falls back to creation time). */
const paidTime = (o: Order): number => o.verifiedAt || o.createdAt;

export const revenueToday = (list: Order[]): number =>
  list
    .filter((o) => isPaid(o) && paidTime(o) >= startOfDay(Date.now()))
    .reduce((sum, o) => sum + orderAmount(o), 0);

export const revenueThisWeek = (list: Order[]): number =>
  list
    .filter((o) => isPaid(o) && paidTime(o) >= startOfWeek(Date.now()))
    .reduce((sum, o) => sum + orderAmount(o), 0);

export const revenueThisMonth = (list: Order[]): number =>
  list
    .filter((o) => isPaid(o) && paidTime(o) >= startOfMonth(Date.now()))
    .reduce((sum, o) => sum + orderAmount(o), 0);

export interface MonthRevenue {
  key: string; // "2026-08"
  year: number;
  month: number; // 1-12
  label: string; // "Agustus 2026"
  total: number;
  orders: number;
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** Revenue grouped by month (from verified payments), newest first. */
export const getMonthlyRevenue = (list: Order[]): MonthRevenue[] => {
  const map = new Map<string, MonthRevenue>();
  list.filter(isPaid).forEach((o) => {
    const d = new Date(paidTime(o));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(key) || {
      key,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`,
      total: 0,
      orders: 0,
    };
    cur.total += orderAmount(o);
    cur.orders += 1;
    map.set(key, cur);
  });
  return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
};

/* -----------------------------------------------
   Revisions & Rating flow
   ----------------------------------------------- */

export const REVISION_LIMIT = 3;

/** Revision progress for an order with safe defaults for legacy data. */
export const getRevisionProgress = (o: Order): { used: number; max: number } => ({
  used: Math.min(o.revisionCount || 0, o.maxRevision || REVISION_LIMIT),
  max: o.maxRevision || REVISION_LIMIT,
});

export const canRequestRevision = (o: Order): boolean =>
  (o.revisionCount || 0) < (o.maxRevision || REVISION_LIMIT);

/** Admin records a revision request (increments the counter, adds a note). */
export const recordRevision = (id: string, note?: string): Order | undefined => {
  const list = getAllOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  const o = list[idx];
  const max = o.maxRevision || REVISION_LIMIT;
  const used = o.revisionCount || 0;
  if (used >= max) return o;
  const revisionLine = `[Revisi ${used + 1}/${max}]${note ? ` ${note}` : ''}`;
  const next: Order = {
    ...o,
    revisionCount: used + 1,
    notes: o.notes ? `${o.notes}\n${revisionLine}` : revisionLine,
    updatedAt: Date.now(),
  };
  list[idx] = next;
  saveAllOrders(list);
  return next;
};

/** Admin delivers the final invitation & completes the order → rating required. */
export const completeOrderWithFinalLink = (id: string, finalInvitationUrl: string): Order | undefined =>
  updateOrder(id, {
    status: 'COMPLETED',
    finalInvitationUrl,
    isRatingRequired: true,
    hasRated: false,
  });

/** Customer submitted a rating for this order — the rating requirement is fulfilled. */
export const markOrderRated = (id: string): Order | undefined =>
  updateOrder(id, { hasRated: true, isRatingRequired: false });
