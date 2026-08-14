// ============================================================================
// MomenKita — WhatsApp Helpers
// ------------------------------------------------------------
// The ADMIN numbers below are used ONLY for admin communication
// (homepage consultation, forgot-password, "Butuh Perubahan" on
// invitations). They are NEVER used for the invitation "WA" buttons —
// those always use the customer's own number from the order.
// ============================================================================
import { formatRupiah } from '../data/templates';

export const WHATSAPP_PRIMARY = '6281911943754';
export const WHATSAPP_ALTERNATE = '6285711709471';

export const WHATSAPP_PRIMARY_DISPLAY = '+62 819-119-43754';
export const WHATSAPP_ALTERNATE_DISPLAY = '+62 857-117-09471';

/**
 * Normalize any Indonesian WhatsApp number into a valid international format:
 *   "081234567890"  → "6281234567890"
 *   "+6281234567890" → "6281234567890"
 *   "6281234567890" → "6281234567890"
 *   "08 1234-567890" → "6281234567890"
 * Strips spaces, dashes, parentheses, dots, and the leading "+".
 */
export const normalizeWhatsAppNumber = (phone?: string | null): string => {
  if (!phone) return '';
  let p = String(phone).replace(/[^\d]/g, '');
  if (!p) return '';
  if (p.startsWith('0')) p = '62' + p.slice(1);
  if (!p.startsWith('62')) p = '62' + p;
  return p;
};

/**
 * Build a WhatsApp deep-link. If `phone` is empty, produces a generic
 * share/compose link (wa.me/?text=...). Otherwise the phone is normalized
 * to an international number first, so customer numbers always point to
 * the right chat regardless of how they were typed (08xx, +628xx, 628xx).
 */
export const buildWaLink = (
  message: string,
  phone: string = WHATSAPP_PRIMARY
): string => {
  const normalized = normalizeWhatsAppNumber(phone);
  const target = normalized ? `/${normalized}` : '';
  return `https://wa.me${target}?text=${encodeURIComponent(message)}`;
};

/** Generic homepage / consultation message */
export const homepageWaMessage =
  'Halo MomenKita, saya ingin memesan undangan digital. Mohon informasi mengenai pilihan template, harga, dan proses pemesanannya.';

/** Category-aware message (Birthday, Sunatan, Wedding, Aqiqah) */
export const categoryWaMessage = (categoryLabel: string) =>
  `Halo MomenKita, saya tertarik dengan undangan kategori ${categoryLabel}. Saya ingin melihat pilihan template dan informasi harganya.`;

/** Template-specific message — never make the customer retype the template name */
export const templateWaMessage = (template: {
  id: string;
  name: string;
  categoryLabel: string;
}): string =>
  `Halo MomenKita, saya tertarik memesan undangan digital.\n\n` +
  `Template: ${template.categoryLabel} ${template.id}\n` +
  `Nama Template: ${template.name}\n` +
  `Kategori: ${template.categoryLabel}\n\n` +
  `Saya ingin mengetahui harga dan proses pemesanannya.\n\n` +
  `Terima kasih.`;

/** Share message used when the admin / creator shares an invitation. */
export const invitationShareMessage = (
  title: string,
  url: string,
  eventDate?: string
): string => {
  const dateLine = eventDate ? `\n📅 Tanggal: ${eventDate}` : '';
  return (
    `Halo, saya ingin membagikan undangan digital:\n\n` +
    `✨ ${title}${dateLine}\n\n` +
    `Silakan buka undangan melalui link berikut:\n\n` +
    `${url}\n\n` +
    `Terima kasih.`
  );
};

/** Message a guest can send to the host via the invitation. */
export const guestMessageToHost = (title: string, url: string): string =>
  `Halo, saya baru saja membuka undangan Anda "${title}".\n` +
  `Saya ingin mengkonfirmasi kehadiran. Mohon informasinya.\n` +
  `Undangan: ${url}`;

/** Customer → Admin: order this exact template (template data auto-filled). */
export const templateOrderMessage = (template: {
  id: string;
  name: string;
  categoryLabel: string;
}): string =>
  `Halo MomenKita 👋\n\n` +
  `Saya tertarik memesan undangan digital.\n\n` +
  `Template: ${template.categoryLabel} #${template.id}\n` +
  `Nama Template: ${template.name}\n` +
  `Kategori: ${template.categoryLabel}\n\n` +
  `Mohon informasi harga dan proses pemesanannya.\n\n` +
  `Terima kasih.`;

/** Admin → Customer: invitation is finished & the unique link is live. */
export const deliveryMessage = (customerName: string, url: string): string =>
  `Halo Kak ${customerName} 👋\n\n` +
  `Undangan digital Kakak sudah selesai dibuat.\n\n` +
  `Berikut link undangannya:\n\n` +
  `${url}\n\n` +
  `Silakan dicek terlebih dahulu ya.\n\n` +
  `Terima kasih sudah menggunakan MomenKita 💕`;

interface GuestInvitationParams {
  /** Name typed by the customer (replaces [NAMA TAMU]); never empty. */
  guestName: string;
  /** Display title of the invitation, e.g. "Undangan Pernikahan Aditya & Nadia". */
  title: string;
  /** Public URL of the invitation, e.g. https://momenkita.com/i/miko-abc123. */
  url: string;
  /** Event category: wedding | birthday | sunatan | aqiqah | other. */
  category: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
}

/**
 * Customer → Guest: auto message used by the "KIRIM UNDANGAN" button on the
 * public invitation. The message adapts to the event category and includes
 * the real invitation data (names via title, date, time, venue, public URL).
 * The only thing the customer edits is the guest name.
 */
export const guestInvitationMessage = ({
  guestName,
  title,
  url,
  category,
  eventDate,
  eventTime,
  venue,
}: GuestInvitationParams): string => {
  const guest = guestName.trim();
  const detailLines: string[] = [];
  if (eventDate) detailLines.push(`📅 Tanggal: ${eventDate}`);
  if (eventTime) detailLines.push(`🕐 Waktu: ${eventTime}`);
  if (venue) detailLines.push(`📍 Lokasi: ${venue}`);
  const details = detailLines.length ? `\n\n${detailLines.join('\n')}` : '';

  let body: string;
  switch (category) {
    case 'wedding':
      body =
        `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara pernikahan kami.\n\n` +
        `Berikut undangan digital kami:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami sangat berharap ${guest} dapat hadir untuk memberikan doa dan restu.\n\n` +
        `Sampai jumpa di hari bahagia kami ❤️`;
      break;
    case 'sunatan':
      body =
        `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara khitanan / sunatan kami.\n\n` +
        `Berikut undangan digitalnya:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami akan sangat senang jika ${guest} dapat hadir dan memberikan doa serta restunya.\n\n` +
        `Sampai jumpa!`;
      break;
    case 'aqiqah':
      body =
        `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara aqiqah kami.\n\n` +
        `Berikut undangan digitalnya:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami akan sangat senang jika ${guest} dapat hadir dan memberikan doa serta restunya.\n\n` +
        `Sampai jumpa!`;
      break;
    case 'birthday':
      body =
        `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara ulang tahun kami.\n\n` +
        `Berikut undangan digitalnya:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami akan sangat senang jika ${guest} dapat hadir dan merayakan momen spesial ini bersama kami 🎉\n\n` +
        `Sampai jumpa!`;
      break;
    case 'education':
      body =
        `Dengan penuh kebanggaan, kami mengundang Anda untuk hadir di acara wisuda / kelulusan kami.\n\n` +
        `Berikut undangan digitalnya:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami akan sangat senang jika ${guest} dapat hadir dan memberikan doa serta dukungannya 🎓\n\n` +
        `Sampai jumpa!`;
      break;
    default:
      body =
        `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di acara spesial kami.\n\n` +
        `Berikut undangan digitalnya:\n\n` +
        `💌 ${title}\n${url}${details}\n\n` +
        `Kami akan sangat senang jika ${guest} dapat hadir.\n\n` +
        `Sampai jumpa!`;
  }

  return `Halo ${guest} 👋\n\n${body}`;
};

/** Customer → Admin: request a change on an existing invitation. */
export const changeRequestMessage = (url: string): string =>
  `Halo MomenKita, saya ingin melakukan perubahan pada undangan saya.\n\n` +
  `Link undangan:\n${url}\n\n` +
  `Mohon bantuannya.`;

/** Customer → Admin: notify that payment proof was submitted. */
export const paymentNotificationMessage = (order: {
  id: string;
  customerName: string;
  customerPhone: string;
  templateLabel: string;
  amount: number;
  bank: string;
}): string =>
  `🔔 KONFIRMASI PEMBAYARAN BARU\n\n` +
  `Order ID: ${order.id}\n\n` +
  `Customer:\n${order.customerName}\n\n` +
  `WhatsApp:\n${order.customerPhone}\n\n` +
  `Template:\n${order.templateLabel}\n\n` +
  `Nominal:\n${formatRupiah(order.amount)}\n\n` +
  `Bank:\n${order.bank}\n\n` +
  `Customer telah mengirim bukti pembayaran.\n\n` +
  `Silakan cek Dashboard Admin untuk melakukan verifikasi.`;

/** Admin → Customer: payment was verified. */
export const paymentVerifiedMessage = (
  customerName: string,
  orderId: string,
  templateLabel: string
): string =>
  `Halo Kak ${customerName} 👋\n\n` +
  `Terima kasih! Pembayaran Anda telah berhasil diverifikasi.\n\n` +
  `Order ID: ${orderId}\n\n` +
  `Template:\n${templateLabel}\n\n` +
  `Pesanan Anda sedang diproses. 🙏\n\n` +
  `Terima kasih sudah menggunakan MomenKita.`;
