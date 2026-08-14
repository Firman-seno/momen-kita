import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminTokenValid } from '../_kv.js';
import { isBlobConfigured, parseDataUrl, uploadDataUrl } from '../_blob.js';

/* ============================================================
   Admin photo upload → public Vercel Blob URL
   ------------------------------------------------------------
   The dashboard never holds a Blob token; the admin sends the
   optimized data URL here, this endpoint re-hosts it, and the
   returned public URL is stored on the invitation (and used as
   og:image by api/og/[slug].ts).
   ============================================================ */

const cleanFolder = (value: unknown): string => {
  if (typeof value !== 'string') return 'invitations';
  const clean = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);
  return clean === '' ? 'invitations' : clean;
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
    res.status(503).json({ ok: false, error: 'Image storage is not configured.' });
    return;
  }

  try {
    const body = (req.body || {}) as { dataUrl?: unknown; folder?: unknown };
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
    if (!parseDataUrl(dataUrl)) {
      res.status(400).json({ ok: false, error: 'Invalid image data URL.' });
      return;
    }
    const url = await uploadDataUrl(cleanFolder(body.folder), dataUrl);
    res.status(200).json({ ok: true, url });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Upload failed.' });
  }
}
