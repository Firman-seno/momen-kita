import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset } from '../_kv.js';

/* ============================================================
   Public invitation API — lets /i/<slug> pages load the invite
   on ANY device (phone, incognito, other browsers) without login.
   The client decides how to render based on invitation.status.
   ============================================================ */

interface StoredInvitation {
  id?: string;
  slug?: string;
  status?: string;
  [key: string]: unknown;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  if (!getClient()) {
    res.status(503).json({ ok: false, error: 'Server storage is not configured.' });
    return;
  }

  const slug = String(req.query.slug || '').trim();
  if (!slug) {
    res.status(400).json({ ok: false, error: 'Missing slug.' });
    return;
  }

  try {
    const data = await getDataset();
    const invitation = (data.invitations as StoredInvitation[]).find(
      (i) => i && typeof i.slug === 'string' && i.slug === slug
    );

    if (!invitation) {
      res.status(404).json({ ok: false, error: 'Invitation not found.' });
      return;
    }

    res.status(200).json({ ok: true, invitation });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Internal error.' });
  }
}
