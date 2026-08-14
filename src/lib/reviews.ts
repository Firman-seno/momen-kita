import { useSyncExternalStore } from 'react';

/* ============================================================
   MomenKita — Customer Reviews / Ratings
   ------------------------------------------------------------
   Customers rate a template (1–5 stars, optional comment) only
   after their order is COMPLETED with a final invitation link.
   Exactly one review per order.

   Aggregation (average + count + distribution) is computed live
   from localStorage (momenkita.reviews.v1) — there is no dummy
   data and no hardcoded average anywhere.
   ============================================================ */

export interface Review {
  id: string;
  orderId: string;
  /** Raw customer name (kept for admin reference only). */
  customerName: string;
  templateUid: string;
  templateName?: string;
  /** 1..5 */
  rating: number;
  comment?: string;
  createdAt: number;
}

const STORAGE_KEY = 'momenkita.reviews.v1';
const CHANGE_EVENT = 'momenkita-reviews-changed';

export const getAllReviews = (): Review[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Review[];
  } catch {
    return [];
  }
};

const saveAll = (list: Review[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage full / unavailable — keep app working */
  }
};

let version = 0;

export const getReviewsVersion = (): number => version;

export const subscribeReviewsChanged = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
};

const notifyChanged = (): void => {
  version += 1;
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
};

/** Reactive hook — re-renders whenever any review is added. */
export const useReviews = (): number => useSyncExternalStore(subscribeReviewsChanged, getReviewsVersion);

export const getReviewsForTemplate = (uid: string): Review[] =>
  getAllReviews()
    .filter((r) => r.templateUid === uid)
    .sort((a, b) => b.createdAt - a.createdAt);

export const getTemplateRating = (uid: string): { average: number; count: number } => {
  const reviews = getReviewsForTemplate(uid);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
};

/** Distribution of 1–5 star ratings for a template. */
export const getRatingDistribution = (uid: string): { stars: number; count: number }[] => {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  getReviewsForTemplate(uid).forEach((r) => {
    const k = Math.round(r.rating);
    if (k >= 1 && k <= 5) counts[k] += 1;
  });
  return [5, 4, 3, 2, 1].map((stars) => ({ stars, count: counts[stars] }));
};

export const hasReviewForOrder = (orderId: string): boolean =>
  getAllReviews().some((r) => r.orderId === orderId);

export const getReviewByOrder = (orderId: string): Review | undefined =>
  getAllReviews().find((r) => r.orderId === orderId);

/**
 * Adds one review per order. Returns null when the order has already
 * been reviewed or the rating is invalid.
 */
export const addReview = (data: {
  orderId: string;
  customerName: string;
  templateUid: string;
  templateName?: string;
  rating: number;
  comment?: string;
}): Review | null => {
  if (hasReviewForOrder(data.orderId)) return null;
  const rating = Math.round(Number(data.rating) || 0);
  if (rating < 1 || rating > 5) return null;
  const review: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    orderId: data.orderId,
    customerName: data.customerName.trim() || 'Customer',
    templateUid: data.templateUid,
    templateName: data.templateName,
    rating,
    comment: (data.comment || '').trim() || undefined,
    createdAt: Date.now(),
  };
  const list = getAllReviews();
  list.push(review);
  saveAll(list);
  notifyChanged();
  return review;
};

export const deleteReview = (id: string): void => {
  saveAll(getAllReviews().filter((r) => r.id !== id));
  notifyChanged();
};

/**
 * Privacy-friendly display name: "Andi", "S****", "Rina A."
 * Never exposes a full last name or phone number publicly.
 */
export const getReviewerDisplayName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Customer';
  if (parts.length === 1) {
    const w = parts[0];
    const cap = w.charAt(0).toUpperCase() + w.slice(1);
    if (cap.length <= 4) return cap;
    return cap.charAt(0) + '*'.repeat(Math.min(cap.length - 1, 4));
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  const firstCap = first.charAt(0).toUpperCase() + first.slice(1);
  const lastInit = last.charAt(0).toUpperCase();
  return `${firstCap} ${lastInit}.`;
};

/** Relative date label in Indonesian, e.g. "3 hari lalu". */
export const formatReviewDate = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};
