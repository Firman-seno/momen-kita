import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset } from './_kv.js';
import { computeInvitationExpiration } from './_expiration.js';

/* ============================================================
   RSVP submission — server-side validated
   ------------------------------------------------------------
   Guest RSVP is accepted ONLY while the invitation is active.
   The server re-checks the event instant with its own clock, so a
   manual API call after the event has ended always gets rejected
   with "Invitation has expired." (HTTP 410).
   ============================================================ */

export const RSVP_KEY = 'momenkita:rsvp:v1';

interface StoredInvitation {
  id?: string;
  slug?: string;
  status?: string;
  eventDate?: string;
  eventTime?: string;
  [key: string]: unknown;
}

interface RsvpRecord {
  id: string;
  slug: string;
  name: string;
  attendance: string;
  guests: number;
  message: string;
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
    attendance?: unknown;
    guests?: unknown;
    message?: unknown;
  };
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) {
    res.status(400).json({ ok: false, error: 'Missing slug or name.' });
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

    const record: RsvpRecord = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      slug,
      name,
      attendance: typeof body.attendance === 'string' ? body.attendance : '',
      guests: Math.max(1, Math.min(10, Number(body.guests) || 1)),
      message: typeof body.message === 'string' ? body.message.slice(0, 1000) : '',
      createdAt: Date.now(),
    };

    const existing = (await client.get<RsvpRecord[]>(RSVP_KEY)) ?? [];
    await client.set(RSVP_KEY, [...existing, record]);

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Internal error.' });
  }
}
