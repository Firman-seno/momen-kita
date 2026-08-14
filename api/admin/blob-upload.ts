import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { isAdminTokenValid } from '../_kv.js';
import { isBlobConfigured } from '../_blob.js';

/* ============================================================
   Admin video upload → Vercel Blob client upload
   ------------------------------------------------------------
   Videos can be large (up to 50 MB), so they are never pushed
   through a serverless request body. The browser calls the
   @vercel/blob `upload()` client helper with `handleUploadUrl`
   pointing here; this route issues a short-lived client token
   (constraints below), the browser PUTs the file DIRECTLY to Blob,
   and Blob then calls back to this same route to confirm completion.

   Blob serves the file with HTTP Range support + the correct
   Content-Type, so mobile streaming works on any device/incognito.

   Two event types hit this route:
     - blob.generate-client-token  → authenticated by X-Admin-Token
     - blob.upload-completed       → authenticated by Blob signature
   ============================================================ */

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB — keep in sync with src/lib/videoStorage.ts
const ALLOWED_EXT_RE = /\.(mp4|m4v|webm|mov|ogv)$/i;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }
  if (!isBlobConfigured()) {
    res.status(503).json({ ok: false, error: 'Video storage is not configured.' });
    return;
  }

  const body = (req.body || {}) as HandleUploadBody;

  // The upload-completed callback is authenticated by Blob's signature
  // (verified inside handleUpload), not by the admin token.
  if (body?.type !== 'blob.upload-completed' && !isAdminTokenValid(req.headers['x-admin-token'])) {
    res.status(401).json({ ok: false, error: 'Unauthorized. Missing or invalid X-Admin-Token.' });
    return;
  }

  try {
    const result = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      request: req,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith('invitations/')) {
          throw new Error('Invalid upload path.');
        }
        const filename = clientPayload || pathname;
        if (!ALLOWED_EXT_RE.test(filename)) {
          throw new Error('Gunakan video MP4, WebM, MOV, atau OGV.');
        }
        return {
          allowedContentTypes: ['video/*'],
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          validUntil: Date.now() + 60 * 60 * 1000,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
      onUploadCompleted: async () => {
        // The client already stores the returned URL on the invitation.
        // Nothing to persist here; the callback simply confirms completion.
      },
    });
    res.status(200).json(result);
  } catch (err) {
    const status = err instanceof Error && /Invalid|Gunakan/.test(err.message) ? 400 : 500;
    res.status(status).json({ ok: false, error: err instanceof Error ? err.message : 'Upload failed.' });
  }
}
