import { put } from '@vercel/blob';
import { isDataUrl, resolveStoredImage } from './_og.js';

/* ============================================================
   MomenKita — Vercel Blob helpers (serverless)
   ------------------------------------------------------------
   Customer photos uploaded BEFORE this feature are stored as
   base64 data URLs (browser-only, not crawlable). To give
   WhatsApp a real public og:image we lazily re-host the chosen
   photo on Vercel Blob and remember the public URL in
   customData.ogImage — WITHOUT touching the photos shown inside
   the invitation itself.
   ============================================================ */

interface InvitationLike {
  slug?: unknown;
  customData?: Record<string, unknown> | null;
}

export const isBlobConfigured = (): boolean =>
  typeof process.env.BLOB_READ_WRITE_TOKEN === 'string' &&
  process.env.BLOB_READ_WRITE_TOKEN.trim() !== '';

interface ParsedDataUrl {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

/** data:image/jpeg;base64,… → Buffer (+ content type + extension). */
export const parseDataUrl = (dataUrl: string): ParsedDataUrl | null => {
  const match = /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  const rawExt = match[1].toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  try {
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length === 0) return null;
    return { buffer, contentType, ext };
  } catch {
    return null;
  }
};

/**
 * Upload a base64 image to a public Vercel Blob URL.
 * Throws when the image is invalid or Blob is not configured.
 */
export const uploadDataUrl = async (folder: string, dataUrl: string): Promise<string> => {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('Invalid image data URL.');
  const pathname = `${folder}/og-${Date.now()}.${parsed.ext}`;
  const blob = await put(pathname, parsed.buffer, {
    access: 'public',
    contentType: parsed.contentType,
    addRandomSuffix: true,
  });
  return blob.url;
};

export interface MigrateResult {
  /** The public og:image URL (or undefined when nothing usable). */
  image: string | undefined;
  /** Updated customData when a data URL was migrated (null otherwise). */
  customData: Record<string, unknown> | null;
}

/**
 * Resolve the og:image for an invitation, uploading a legacy data URL
 * to Blob on first use and caching the result in customData.ogImage.
 * Never rewrites the portraitImage/galleryImages fields rendered in-app.
 */
export const migrateOgImage = async (
  invitation: InvitationLike,
  templateImage?: string
): Promise<MigrateResult> => {
  const raw = resolveStoredImage(invitation, templateImage);
  if (!raw) return { image: undefined, customData: null };
  if (!isDataUrl(raw)) return { image: raw, customData: null };
  if (!isBlobConfigured()) return { image: undefined, customData: null };
  try {
    const folder = typeof invitation.slug === 'string' ? `invitations/${invitation.slug}` : 'invitations';
    const url = await uploadDataUrl(folder, raw);
    const customData = { ...(invitation.customData || {}), ogImage: url };
    return { image: url, customData };
  } catch {
    return { image: undefined, customData: null };
  }
};
