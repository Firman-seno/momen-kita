/* ============================================================
   MomenKita — Public image storage (client helpers)
   ------------------------------------------------------------
   New uploads go through POST /api/admin/upload (server re-hosts
   them on Vercel Blob and returns a public URL). Falls back to a
   data URL when Blob is not configured. The resolver picks the
   best public photo for the WhatsApp/social og:image.
   ============================================================ */
import { Template } from '../types';
import { Invitation } from './invitations';
import { getAdminApiToken } from './admin';

const isPublicUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^https?:\/\//.test(value);

/** Resize params so the shared card is a crisp 1200×630. */
const withOgParams = (url: string): string => {
  const base = url.split('?')[0];
  if (/^https:\/\/[^/]*images\.unsplash\.com/i.test(base)) {
    return `${base}?auto=format&fit=crop&w=1200&h=630&q=80`;
  }
  if (/\.public\.blob\.vercel-storage\.com\//i.test(base)) {
    return `${base}?w=1200&h=630&fit=cover`;
  }
  return url;
};

/**
 * Upload an optimized data URL and get a public HTTPS URL back.
 * Returns null when the server upload fails (caller keeps the data URL).
 */
export const uploadImageToPublic = async (
  dataUrl: string,
  folder?: string
): Promise<string | null> => {
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': getAdminApiToken(),
      },
      body: JSON.stringify({ dataUrl, folder }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: unknown };
    return typeof data.url === 'string' ? data.url : null;
  } catch {
    return null;
  }
};

/** Best PUBLIC og:image for an invitation (data URLs are skipped). */
export const resolveInvitationOgImage = (
  invitation: Invitation,
  template?: Template
): string | undefined => {
  const cd = (invitation.customData || {}) as Record<string, unknown>;
  const photos = Array.isArray(cd.photos) ? cd.photos : [];
  const gallery = Array.isArray(cd.galleryImages) ? cd.galleryImages : [];
  const candidates = [
    cd.ogImage,
    cd.coverImage,
    cd.mainImage,
    photos[0],
    cd.portraitImage,
    gallery[0],
    invitation.templateImage,
    template?.image,
  ];
  for (const candidate of candidates) {
    if (isPublicUrl(candidate)) return withOgParams(candidate);
  }
  return undefined;
};
