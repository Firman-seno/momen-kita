import { Template } from '../types';
import { useSyncExternalStore } from 'react';

/* ============================================================
   MomenKita — Template Pricing (single source of truth)
   ------------------------------------------------------------
   Every template sells at DEFAULT_TEMPLATE_PRICE (Rp 50.000).
   The admin can override the price per template; the override is
   stored in localStorage (momenkita.templatePrices.v1) and is
   reflected everywhere (catalog, demo page, checkout, admin UI).

   Price is always read through getTemplatePrice() — never from
   a hardcoded literal in a component. Orders snapshot the price
   at the moment they are created.
   ============================================================ */

export const DEFAULT_TEMPLATE_PRICE = 50000;

const STORAGE_KEY = 'momenkita.templatePrices.v1';
const CHANGE_EVENT = 'momenkita-template-prices-changed';

type PriceOverrides = Record<string, number>;

const getOverrides = (): PriceOverrides => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as PriceOverrides) : {};
  } catch {
    return {};
  }
};

const saveOverrides = (overrides: PriceOverrides): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    /* storage full / unavailable — keep app working */
  }
};

let priceVersion = 0;

export const getTemplatePricesVersion = (): number => priceVersion;

export const subscribeTemplatePriceChanged = (cb: () => void): (() => void) => {
  window.addEventListener(CHANGE_EVENT, cb);
  return () => window.removeEventListener(CHANGE_EVENT, cb);
};

const notifyPriceChanged = (): void => {
  priceVersion += 1;
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore */
  }
};

/**
 * Effective price for a template: admin override, else the default.
 * This is the ONLY place components should read a template price from.
 */
export const getTemplatePrice = (template: Pick<Template, 'uid'>): number => {
  const override = getOverrides()[template.uid];
  return typeof override === 'number' && override > 0 ? Math.round(override) : DEFAULT_TEMPLATE_PRICE;
};

/** True when this template has an admin price override (vs. the default). */
export const hasPriceOverride = (uid: string): boolean => {
  const override = getOverrides()[uid];
  return typeof override === 'number' && override > 0;
};

/** Override the price for one template (admin setting). */
export const setTemplatePrice = (uid: string, price: number): void => {
  const overrides = getOverrides();
  const clean = Math.round(Number(price) || 0);
  if (clean > 0) {
    overrides[uid] = clean;
  } else {
    delete overrides[uid];
  }
  saveOverrides(overrides);
  notifyPriceChanged();
};

/** Restore the default price for one template. */
export const resetTemplatePrice = (uid: string): void => {
  const overrides = getOverrides();
  delete overrides[uid];
  saveOverrides(overrides);
  notifyPriceChanged();
};

/** Reactive hook — re-renders whenever any template price changes. */
export const useTemplatePrices = (): number => useSyncExternalStore(subscribeTemplatePriceChanged, getTemplatePricesVersion);
