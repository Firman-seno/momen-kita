import { Redis } from '@upstash/redis';

/* ============================================================
   Shared Upstash/KV connection + dataset helpers
   ------------------------------------------------------------
   Works with both the classic Vercel KV env vars and the newer
   Upstash Redis REST env vars. Returns null when the store is
   not configured, so the app degrades gracefully.
   ============================================================ */

export interface Dataset {
  invitations: unknown[];
  orders: unknown[];
}

const KV_KEY = 'momenkita:data:v1';

let client: Redis | null | undefined;

export const getClient = (): Redis | null => {
  if (client !== undefined) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    client = null;
    return null;
  }
  client = new Redis({ url, token });
  return client;
};

export const getDataset = async (): Promise<Dataset> => {
  const redis = getClient();
  if (!redis) return { invitations: [], orders: [] };
  const stored = await redis.get<Dataset>(KV_KEY);
  if (!stored || typeof stored !== 'object') return { invitations: [], orders: [] };
  return {
    invitations: Array.isArray(stored.invitations) ? stored.invitations : [],
    orders: Array.isArray(stored.orders) ? stored.orders : [],
  };
};

export const setDataset = async (data: Dataset): Promise<boolean> => {
  const redis = getClient();
  if (!redis) return false;
  await redis.set(KV_KEY, {
    invitations: Array.isArray(data.invitations) ? data.invitations : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
  });
  return true;
};

/** Optional admin API token gate. When unset, any valid X-Admin-Token works. */
export const isAdminTokenValid = (header: unknown): boolean => {
  const token = Array.isArray(header) ? header[0] : header;
  if (!token || typeof token !== 'string' || token.trim() === '') return false;
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return true;
  return token === expected;
};
