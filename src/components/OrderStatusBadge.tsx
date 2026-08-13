import React from 'react';
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_EMOJI } from '../lib/orders';

/* ============================================================
   OrderStatusBadge — colored pill showing an order's payment
   status with its emoji. Used across the admin dashboard and
   order detail modal.
   ============================================================ */

const STATUS_STYLES: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  AWAITING_VERIFICATION: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSING: 'bg-sky-50 text-sky-700 border-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border font-bold whitespace-nowrap ${
      STATUS_STYLES[status]
    } ${size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px] sm:text-[11px]'}`}
  >
    <span aria-hidden="true">{ORDER_STATUS_EMOJI[status]}</span>
    <span className="capitalize">{ORDER_STATUS_LABELS[status]}</span>
  </span>
);
