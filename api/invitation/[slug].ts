import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset } from '../_kv.js';
import { computeInvitationExpiration } from '../_expiration.js';

/* ============================================================
   Public invitation API — lets /i/<slug> pages load the invite
   on ANY device (phone, incognito, other browsers) without login.
   The response includes the SERVER-computed expiration flag so a
   direct API read is never fooled by the client's clock.
   ============================================================ */

interface StoredInvitation {
  id?: string;
  slug?: string;
  status?: string;
  eventDate?: string;
  eventTime?: string;
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

    // Server-side WIB-anchored expiration check (same math as the client).
    const expiration = computeInvitationExpiration(
      String(invitation.eventDate ?? ''),
      String(invitation.eventTime ?? '')
    );
    const expired =
      invitation.status === 'expired' || (expiration.valid && expiration.expired);

    res.status(200).json({
      ok: true,
      invitation,
      valid: expiration.valid,
      targetMs: expiration.targetMs,
      expired,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Internal error.' });
  }
}
