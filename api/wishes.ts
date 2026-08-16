import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset } from './_kv.js';
import { computeInvitationExpiration } from './_expiration.js';

/* ============================================================
   Wishes / guestbook — server-side validated
   ------------------------------------------------------------
   Mirrors api/rsvp.ts: submissions are accepted ONLY while the
   invitation is active; expired invitations always receive
   "Invitation has expired." (HTTP 410).
   ============================================================ */

export const WISHES_KEY = 'momenkita:wishes:v1';

interface StoredInvitation {
  id?: string;
  slug?: string;
  status?: string;
  eventDate?: string;
  eventTime?: string;
  [key: string]: unknown;
}

interface WishRecord {
  id: string;
  slug: string;
  name: string;
  message: string;
  attendance: string;
  createdAt: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  const client = getClient();
  if (!client) {
    res.status(503).json({ ok: false, error: 'Server storage is not configured.' });
    return;
  }

  const body = (req.body ?? {}) as {
    slug?: unknown;
    name?: unknown;
    message?: unknown;
    attendance?: unknown;
  };
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!slug || !name || !message) {
    res.status(400).json({ ok: false, error: 'Missing slug, name or message.' });
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

    // Authoritative server-side expiration check.
    const expiration = computeInvitationExpiration(
      String(invitation.eventDate ?? ''),
      String(invitation.eventTime ?? '')
    );
    if (invitation.status === 'expired' || (expiration.valid && expiration.expired)) {
      res.status(410).json({ ok: false, code: 'EXPIRED', error: 'Invitation has expired.' });
      return;
    }

    const record: WishRecord = {
      id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug,
      name,
      message: message.slice(0, 1000),
      attendance: typeof body.attendance === 'string' ? body.attendance : '',
      createdAt: Date.now(),
    };

    const existing = (await client.get<WishRecord[]>(WISHES_KEY)) ?? [];
    await client.set(WISHES_KEY, [...existing, record]);

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Internal error.' });
  }
}
