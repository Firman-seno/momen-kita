/* ============================================================
   MomenKita — Server sync layer
   ------------------------------------------------------------
   The app keeps its fast, synchronous copy in localStorage
   (source of truth for the admin dashboard) and MIRRORS the full
   dataset to a serverless API backed by Upstash/Vercel KV.

   - Mutations call scheduleDataSync() (fire-and-forget) so a fresh
     device / the public invitation page can read the same data.
   - Public invitation pages fall back to /api/invitation/:slug so
     links open on any device WITHOUT login.
   - Everything degrades gracefully: when the API/KV is not
     configured the app simply behaves like the old localStorage
     version.
   ============================================================ */
import { INVITATIONS_STORAGE_KEY, ORDERS_STORAGE_KEY } from './storageKeys';
import { getAdminApiToken } from './admin';

const API_BASE = '/api';

export interface ServerDataset {
  invitations: unknown[];
  orders: unknown[];
}

const readLocal = (key: string): unknown[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (key: string, list: unknown[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
};

/* -----------------------------------------------
   Admin sync (protected by X-Admin-Token)
   ----------------------------------------------- */

export const syncDataToServer = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/admin/data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': getAdminApiToken(),
      },
      body: JSON.stringify({
        invitations: readLocal(INVITATIONS_STORAGE_KEY),
        orders: readLocal(ORDERS_STORAGE_KEY),
      } satisfies ServerDataset),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const fetchDataFromServer = async (): Promise<ServerDataset | null> => {
  try {
    const res = await fetch(`${API_BASE}/admin/data`, {
      headers: { 'x-admin-token': getAdminApiToken() },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<ServerDataset>;
    return {
      invitations: Array.isArray(data.invitations) ? data.invitations : [],
      orders: Array.isArray(data.orders) ? data.orders : [],
    };
  } catch {
    return null;
  }
};

/** Merge server data into localStorage — union by id, newest wins. */
export const mergeServerDataIntoLocal = (data: ServerDataset): void => {
  const merge = <T extends { id?: string; updatedAt?: number }>(local: T[], remote: T[]): T[] => {
    const byId = new Map<string, T>();
    local.forEach((item) => {
      if (item?.id) byId.set(item.id, item);
    });
    remote.forEach((item) => {
      if (!item?.id) return;
      const existing = byId.get(item.id);
      if (!existing) {
        byId.set(item.id, item);
      } else {
        const localTs = existing.updatedAt || 0;
        const remoteTs = item.updatedAt || 0;
        if (remoteTs >= localTs) byId.set(item.id, item);
      }
    });
    return Array.from(byId.values());
  };

  writeLocal(
    INVITATIONS_STORAGE_KEY,
    merge(readLocal(INVITATIONS_STORAGE_KEY) as Array<{ id?: string; updatedAt?: number }>, data.invitations as Array<{ id?: string; updatedAt?: number }>)
  );
  writeLocal(
    ORDERS_STORAGE_KEY,
    merge(readLocal(ORDERS_STORAGE_KEY) as Array<{ id?: string; updatedAt?: number }>, data.orders as Array<{ id?: string; updatedAt?: number }>)
  );
};

/* -----------------------------------------------
   Public read (no login needed)
   ----------------------------------------------- */

export const fetchPublicInvitation = async (slug: string): Promise<unknown | null> => {
  try {
    const res = await fetch(`${API_BASE}/invitation/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { invitation?: unknown };
    return data?.invitation || null;
  } catch {
    return null;
  }
};

/* -----------------------------------------------
   Debounced sync trigger for data-layer mutations
   ----------------------------------------------- */

let syncTimer: number | null = null;

/** Queue a best-effort server sync (deduplicated within 500ms). */
export const scheduleDataSync = (): void => {
  if (typeof window === 'undefined') return;
  if (syncTimer !== null) return;
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncDataToServer();
  }, 500);
};

/** Immediately push the current localStorage dataset (for save flows). */
export const flushDataSync = async (): Promise<boolean> => {
  if (syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }
  return syncDataToServer();
};
