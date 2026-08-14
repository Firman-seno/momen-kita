/* ============================================================
   MomenKita — Open Graph helpers (serverless)
   ------------------------------------------------------------
   Pure helpers shared by api/og/[slug].ts and admin upload flow.
   NO browser APIs, NO @vercel/blob imports — so this module can
   be unit-tested in Node and bundled into the serverless function.

   The WhatsApp / social-media crawler does NOT execute JavaScript,
   so /i/<slug> must return real server-rendered <meta> tags. This
   file builds that metadata from the stored invitation.
   ============================================================ */

interface InvitationLike {
  slug?: unknown;
  category?: unknown;
  customerName?: unknown;
  eventDate?: unknown;
  venue?: unknown;
  address?: unknown;
  status?: unknown;
  templateImage?: unknown;
  customData?: Record<string, unknown> | null;
}

/** Server-side fallback cover per category (mirrors src/data/templates.ts CATEGORIES). */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  birthday: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=600&q=80',
  sunatan: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
  wedding: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
  aqiqah: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
};

export const getCategoryFallbackImage = (category: unknown): string | undefined =>
  typeof category === 'string' ? CATEGORY_FALLBACK_IMAGES[category] : undefined;

interface MetaInput {
  title: string;
  description: string;
  image?: string;
}

export const isDataUrl = (value: unknown): boolean =>
  typeof value === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);

export const isPublicUrl = (value: unknown): boolean =>
  typeof value === 'string' && /^https?:\/\//.test(value);

const firstString = (...values: unknown[]): string | undefined => {
  for (const v of values) {
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return undefined;
};

/** First plausible photo on the invitation (customer data > template). */
export const resolveStoredImage = (
  invitation: InvitationLike,
  templateImage?: string
): string | undefined => {
  const cd = invitation?.customData || {};
  const photos = Array.isArray(cd.photos) ? cd.photos : [];
  const gallery = Array.isArray(cd.galleryImages) ? cd.galleryImages : [];
  return firstString(
    cd.ogImage,
    cd.coverImage,
    cd.mainImage,
    photos[0],
    cd.portraitImage,
    gallery[0],
    invitation.templateImage,
    templateImage
  );
};

/** Resize/crop params so og:image renders as a clean 1200x630 card. */
export const withOgImageParams = (url: string): string => {
  if (!url) return url;
  const base = url.split('?')[0];
  if (/^https:\/\/[^/]*images\.unsplash\.com/i.test(base)) {
    return `${base}?auto=format&fit=crop&w=1200&h=630&q=80`;
  }
  if (/\.public\.blob\.vercel-storage\.com\//i.test(base)) {
    return `${base}?w=1200&h=630&fit=cover`;
  }
  return url;
};

const cleanName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Build the title + description for a published invitation, per category.
 * Mirrors the client's getInvitationTitle() so preview and page agree.
 */
export const buildInvitationMeta = (
  invitation: InvitationLike,
  templateImage?: string
): MetaInput => {
  const category = typeof invitation?.category === 'string' ? invitation.category : 'default';
  const customerName = cleanName(invitation?.customerName);
  const cd = invitation?.customData || {};
  const categoryLabel = typeof cd.categoryLabel === 'string' ? cd.categoryLabel : category;
  const date = cleanName(invitation?.eventDate);
  const venue = cleanName(invitation?.venue) || cleanName(cd.venue);

  let title: string;
  let description: string;

  if (category === 'wedding') {
    const groom = cleanName(cd.groomName);
    const bride = cleanName(cd.brideName);
    const couple = [groom, bride].filter(Boolean).join(' & ');
    title = couple ? `Undangan Pernikahan ${couple}` : 'Undangan Pernikahan';
    description = couple
      ? `Dengan hormat, kami mengundang Anda ke acara pernikahan ${couple}.`
      : 'Anda diundang untuk menghadiri acara pernikahan.';
  } else if (category === 'sunatan') {
    const child = cleanName(cd.childName);
    title = child ? `Undangan Sunatan ${child}` : 'Undangan Sunatan';
    description = child
      ? `Dengan hormat, kami mengundang Anda ke acara khitanan ${child}.`
      : 'Anda diundang untuk menghadiri acara khitanan.';
  } else if (category === 'aqiqah') {
    const baby = cleanName(cd.babyName);
    title = baby ? `Undangan Aqiqah ${baby}` : 'Undangan Aqiqah';
    description = baby
      ? `Dengan hormat, kami mengundang Anda ke acara aqiqah ${baby}.`
      : 'Anda diundang untuk menghadiri acara aqiqah.';
  } else if (category === 'birthday') {
    const person = cleanName(cd.birthdayPerson) || customerName;
    title = person ? `Undangan Ulang Tahun ${person}` : 'Undangan Ulang Tahun';
    description = person
      ? `Mari rayakan momen spesial ulang tahun ${person} bersama kami.`
      : 'Mari rayakan momen spesial ulang tahun bersama kami.';
  } else {
    const label = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);
    title = customerName ? `Undangan ${label} ${customerName}` : `Undangan ${label}`;
    description = `Anda diundang untuk hadir dalam acara ${categoryLabel.toLowerCase()} ${
      customerName ? customerName.toLowerCase() : ''
    }.`.replace(/\s+/g, ' ').trim();
  }

  const bits = [description];
  if (date) bits.push(`Tanggal: ${date}.`);
  if (venue) bits.push(`Lokasi: ${venue}.`);
  bits.push('Tunggu apa lagi? Buka undangannya sekarang.');

  return {
    title,
    description: bits.join(' '),
    image: resolveStoredImage(invitation, templateImage),
  };
};

export const DEFAULT_META: Omit<MetaInput, 'image'> = {
  title: 'MomenKita — Undangan Digital untuk Setiap Momen',
  description:
    'MomenKita menyediakan undangan digital modern, elegan, dan interaktif untuk Birthday, Sunatan, Wedding, Aqiqah, dan berbagai momen spesial lainnya.',
};

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface OgShellOptions {
  title: string;
  description: string;
  image?: string;
  canonical: string;
  robots?: string;
}

/**
 * Full standalone HTML page for /i/<slug>.
 * Includes the correct Open Graph / Twitter meta for crawlers AND the
 * built SPA assets (stable /assets/index.js + /assets/index.css) so real
 * visitors still get the React invitation page.
 */
export const renderOgShell = ({
  title,
  description,
  image,
  canonical,
  robots = 'index, follow',
}: OgShellOptions): string => {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const u = escapeHtml(canonical);
  const i = image ? escapeHtml(image) : '';
  const ogImage = i
    ? `
    <meta property="og:image" content="${i}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />`
    : '';
  const twitterImage = i ? `
    <meta name="twitter:image" content="${i}" />` : '';

  return `<!doctype html>
<html lang="id" class="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <meta name="robots" content="${escapeHtml(robots)}" />
    <meta name="theme-color" content="#14213D" />
    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="/favicon.png" sizes="64x64" />
    <link rel="icon" type="image/png" href="/favicon-512x512.png" sizes="512x512" />
    <link rel="shortcut icon" href="/favicon-32x32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="canonical" href="${u}" />
    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="MomenKita" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${u}" />${ogImage}
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />${twitterImage}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Cinzel:wght@500;700;900&family=Fredoka:wght@400;600;700&family=Great+Vibes&family=Hanken+Grotesk:wght@400..700&family=Outfit:wght@400;600;800&family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Space+Grotesk:wght@500;700&display=swap"
      rel="stylesheet"
    />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/index.css" />
  </head>
  <body class="bg-[#FAF8F3] text-[#1F2937] antialiased">
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;
};
