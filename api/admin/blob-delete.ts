import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { isAdminTokenValid } from '../_kv';
import { isBlobConfigured } from '../_blob';

/* ============================================================
   Admin blob delete — removes an old video/photo from storage.
   Best-effort: the invitation always clears its reference even if
   the storage delete fails, so deleting a video never breaks the
   invitation.
   ============================================================ */

const isManagedBlobUrl = (url: unknown): url is string => {
  if (typeof url !== 'string') return false;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    parsed.hostname.endsWith('.public.blob.vercel-storage.com') &&
    parsed.pathname.startsWith('/invitations/')
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  if (!isAdminTokenValid(req.headers['x-admin-token'])) {
    res.status(401).json({ ok: false, error: 'Unauthorized. Missing or invalid X-Admin-Token.' });
    return;
  }
  if (!isBlobConfigured()) {
    res.status(503).json({ ok: false, error: 'Storage is not configured.' });
    return;
  }

  try {
    const body = (req.body || {}) as { url?: unknown };
    if (!isManagedBlobUrl(body.url)) {
      res.status(400).json({ ok: false, error: 'Invalid blob URL.' });
      return;
    }
    await del(body.url);
    res.status(200).json({ ok: true });
  } catch {
    // Deleting is best-effort; never fail the invitation because of it.
    res.status(200).json({ ok: true, warning: 'Storage delete failed; reference still cleared.' });
  }
}
