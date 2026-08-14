import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset, setDataset, isAdminTokenValid } from '../_kv';

/* ============================================================
   Admin dataset API — GET pulls the full dataset, PUT replaces it.
   Protected by the X-Admin-Token header (the same password the
   dashboard uses to log in).
   ============================================================ */

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!getClient()) {
    res.status(503).json({ ok: false, error: 'Server storage is not configured.' });
    return;
  }
  if (!isAdminTokenValid(req.headers['x-admin-token'])) {
    res.status(401).json({ ok: false, error: 'Unauthorized. Missing or invalid X-Admin-Token.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const data = await getDataset();
      res.status(200).json({ ok: true, ...data });
      return;
    }

    if (req.method === 'PUT') {
      const body = req.body as { invitations?: unknown; orders?: unknown };
      const invitations = Array.isArray(body?.invitations) ? body.invitations : [];
      const orders = Array.isArray(body?.orders) ? body.orders : [];
      await setDataset({ invitations, orders });
      res.status(200).json({ ok: true, invitations, orders });
      return;
    }

    res.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Internal error.' });
  }
}
