/* ============================================================
   MomenKita — Client-side image optimization
   ------------------------------------------------------------
   The admin uploads customer photos. We downscale & re-encode to
   a compressed JPEG data URL so images stay small (localStorage)
   and render responsively everywhere.
   ============================================================ */

export const fileToOptimizedDataUrl = (
  file: File,
  maxDim = 1280,
  quality = 0.72
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas harus berupa gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gambar tidak dapat diproses.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak tersedia.'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

/** Read a file purely as a data URL (no downscale) — for non-photo assets. */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
};
