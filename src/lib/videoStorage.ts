/* ============================================================
   MomenKita — Public video storage (client helpers)
   ------------------------------------------------------------
   Videos are uploaded DIRECTLY to Vercel Blob from the browser.
   The SDK fetches a short-lived client token from
   /api/admin/blob-upload (admin-auth gated) and PUTs the file
   straight to Blob — the read-write token never leaves the server.
   The result is a permanent public HTTPS URL that works on any
   device, in incognito, and after the admin logs out — never a
   blob:/localStorage URL.

   Blob serves videos with HTTP Range support and the correct
   Content-Type, so mobile streaming (Android/iOS) works out of the box.
   ============================================================ */
import { upload } from '@vercel/blob/client';
import { getAdminApiToken } from './admin';

/** Maximum video size — keep in sync with api/admin/blob-upload.ts. */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_EXT_RE = /\.(mp4|m4v|webm|mov|ogv)$/i;

export interface VideoFileInfo {
  name: string;
  type: string;
  size: number;
}

/**
 * Validate a selected video BEFORE uploading.
 * Returns an error message (Indonesian) or null when valid.
 */
export const validateVideoFile = (file: VideoFileInfo): string | null => {
  if (!file.name) return 'Pilih file video terlebih dahulu.';
  if (!ALLOWED_EXT_RE.test(file.name)) {
    return 'Gunakan video MP4, WebM, MOV, atau OGV.';
  }
  if (file.size <= 0) return 'Berkas video kosong.';
  if (file.size > MAX_VIDEO_SIZE) return 'Ukuran video terlalu besar. Maksimal 50 MB.';
  return null;
};

/** A permanent, publicly reachable https video URL (not blob:, data:, localhost…). */
export const isValidPublicVideoUrl = (url: unknown): boolean => {
  if (typeof url !== 'string' || url.trim() === '') return false;
  if (/^data:/i.test(url)) return false;
  if (/^blob:/i.test(url)) return false;
  if (/localhost|127\.0\.0\.1/i.test(url)) return false;
  if (!/^https:\/\//i.test(url)) return false;
  return true;
};

/**
 * Upload a video straight to Vercel Blob.
 * The browser fetches a short-lived client token from /api/admin/blob-upload,
 * PUTs the file directly to Blob, then commits the returned public URL.
 * @returns the permanent public HTTPS URL, or null on failure.
 */
export const uploadVideoToPublic = async (
  file: File,
  folder: string,
  onProgress?: (percentage: number) => void
): Promise<string | null> => {
  const ext = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1] || 'mp4';
  const pathname = `${folder}/video-${Date.now()}.${ext.toLowerCase()}`;
  try {
    const result = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/admin/blob-upload',
      clientPayload: file.name,
      headers: {
        'x-admin-token': getAdminApiToken(),
      },
      contentType: file.type || 'video/mp4',
      onUploadProgress: (p) => {
        if (onProgress && typeof p.percentage === 'number') onProgress(p.percentage);
      },
    });
    return typeof result.url === 'string' && result.url.startsWith('https://') ? result.url : null;
  } catch {
    return null;
  }
};

/** Best-effort removal of an old video from storage (never throws). */
export const deletePublicVideo = async (url: string): Promise<void> => {
  try {
    await fetch('/api/admin/blob-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': getAdminApiToken(),
      },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* best-effort */
  }
};
