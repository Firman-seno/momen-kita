/* ============================================================
   MomenKita — Dynamic FOTO GALERI helpers
   ------------------------------------------------
   Shared by the invitation editor and the persistence layer.
   Data is stored as a simple `galleryImages: string[]` (scalable,
   backward compatible with existing invitations). The editor keeps
   `{ id, url }` items so every slot has a stable unique identity
   and uploads never cross-contaminate.
   ============================================================ */

/** Maximum number of gallery slots allowed. */
export const MAX_GALLERY = 20;
/** Default number of gallery slots shown on first open. */
export const DEFAULT_GALLERY = 4;

/** One slot in the dynamic FOTO GALERI list (unique id per gallery item). */
export interface GalleryItem {
  id: string;
  url: string;
}

let galleryIdSeq = 0;
export const genGalleryId = (): string =>
  `gal-${Date.now().toString(36)}-${(galleryIdSeq++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Persisted URLs → editor items. Keeps ALL stored images (so extra
 * galleries survive reopen), caps at MAX_GALLERY, and pads up to the
 * default 4 empty slots so the familiar 4-card layout always shows.
 */
export const toGalleryItems = (urls: string[] | undefined): GalleryItem[] => {
  const items = (urls || []).slice(0, MAX_GALLERY).map((url) => ({ id: genGalleryId(), url }));
  while (items.length < DEFAULT_GALLERY) items.push({ id: genGalleryId(), url: '' });
  return items;
};

/** Editor items → persisted `galleryImages` array (empty URLs dropped). */
export const toGalleryImages = (items: GalleryItem[]): string[] =>
  items.map((it) => it.url).filter(Boolean);
