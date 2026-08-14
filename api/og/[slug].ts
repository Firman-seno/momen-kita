import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClient, getDataset, setDataset } from '../_kv';
import {
  buildInvitationMeta,
  DEFAULT_META,
  getCategoryFallbackImage,
  renderOgShell,
  withOgImageParams,
} from '../_og';
import { migrateOgImage } from '../_blob';

/* ============================================================
   Server-rendered invitation page (/i/:slug)
   ------------------------------------------------------------
   vercel.json rewrites /i/:slug → /api/og/:slug so BOTH:
     - WhatsApp / social crawlers get real <meta> tags (they
       never execute JavaScript), and
     - human visitors get the same page which boots the React SPA
       (this shell references the built /assets/index.js).
   ============================================================ */

interface StoredInvitation {
  id?: string;
  slug?: string;
  status?: string;
  category?: string;
  customData?: Record<string, unknown> | null;
  [key: string]: unknown;
}

const LOGO_IMAGE = '/og-image.png';

const sendShell = (
  res: VercelResponse,
  status: number,
  opts: {
    title: string;
    description: string;
    image?: string;
    canonical: string;
    robots: string;
  }
): void => {
  res
    .status(status)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=604800')
    .send(renderOgShell(opts));
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const slug = String(req.query.slug || '').trim();
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const siteBase = host ? `https://${host}` : 'https://momen-kita-ecru.vercel.app';
  const canonical = `${siteBase}/i/${encodeURIComponent(slug)}`;
  const robots = 'noindex, follow';

  if (!/^[A-Za-z0-9_-]{3,64}$/.test(slug)) {
    sendShell(res, 400, {
      title: DEFAULT_META.title,
      description: DEFAULT_META.description,
      image: `${siteBase}${LOGO_IMAGE}`,
      canonical: `${siteBase}/i/`,
      robots,
    });
    return;
  }

  if (!getClient()) {
    // KV unconfigured — still boot the SPA so local-only demos work.
    sendShell(res, 200, {
      title: DEFAULT_META.title,
      description: DEFAULT_META.description,
      image: `${siteBase}${LOGO_IMAGE}`,
      canonical,
      robots,
    });
    return;
  }

  try {
    const data = await getDataset();
    const invitation = (data.invitations as StoredInvitation[]).find(
      (i) => i && typeof i.slug === 'string' && i.slug === slug
    );

    if (!invitation) {
      sendShell(res, 404, {
        title: DEFAULT_META.title,
        description: DEFAULT_META.description,
        image: `${siteBase}${LOGO_IMAGE}`,
        canonical,
        robots,
      });
      return;
    }

    const meta = buildInvitationMeta(invitation, getCategoryFallbackImage(invitation.category));
    const pageRobots =
      invitation.status === 'published' ? 'index, follow' : 'noindex, follow';

    // Lazily re-host legacy data-URL photos so og:image is a real public URL.
    const migrated = await migrateOgImage(invitation, getCategoryFallbackImage(invitation.category));
    if (migrated.customData) {
      invitation.customData = migrated.customData;
      const invitations = data.invitations.map((item) => {
        const i = item as StoredInvitation;
        return i && i.id === invitation.id ? invitation : item;
      });
      await setDataset({ ...data, invitations });
    }

    const image =
      (migrated.image ? withOgImageParams(migrated.image) : undefined) ||
      `${siteBase}${LOGO_IMAGE}`;

    sendShell(res, 200, {
      title: meta.title,
      description: meta.description,
      image,
      canonical,
      robots: pageRobots,
    });
  } catch (err) {
    sendShell(res, 500, {
      title: DEFAULT_META.title,
      description: DEFAULT_META.description,
      image: `${siteBase}${LOGO_IMAGE}`,
      canonical,
      robots,
    });
  }
}
