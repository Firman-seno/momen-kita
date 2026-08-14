import { Template } from '../types';
import { Invitation, getInvitationTitle } from './invitations';

/* ============================================================
   MomenKita — Dynamic Social Share Metadata
   ------------------------------------------------------------
   When an invitation link is shared on WhatsApp / social media,
   the title, description and image must come from the customer's
   actual invitation data — never the homepage.
   ============================================================ */

/**
 * Base URL of the site as currently served (handles preview URLs,
 * custom domains, and local dev). Never hardcoded to one domain.
 */
const getSiteBaseUrl = (): string => {
  if (typeof window === 'undefined') return 'https://momen-kita.vercel.app/';
  const { origin, pathname } = window.location;
  if (pathname.includes('index.html')) {
    const base = pathname.replace(/index\.html$/, '');
    return `${origin}${base}`;
  }
  return origin;
};

const getSiteUrl = (path: string): string => `${getSiteBaseUrl().replace(/\/+$/, '')}${path}`;

const getOgImage = (): string => getSiteUrl('/og-image.png');

interface MetaOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

const setMeta = (selector: string, attribute: 'content' | 'href', value: string) => {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const match = selector.match(/\[(property|name)="([^"]+)"\]/);
    if (match) {
      el.setAttribute(match[1], match[2]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
};

export const applySocialMeta = ({
  title,
  description,
  image = getOgImage(),
  url = getSiteUrl('/'),
  type = 'website',
}: MetaOptions): void => {
  document.title = title;

  // Standard
  setMeta('meta[name="description"]', 'content', description);
  // Open Graph
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:type"]', 'content', type);
  setMeta('meta[property="og:site_name"]', 'content', 'MomenKita');
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[property="og:image"]', 'content', image);
  // Twitter Card
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', image);
};

const DEFAULT_HOME = {
  title: 'MomenKita — Undangan Digital untuk Setiap Momen',
  description:
    'MomenKita menyediakan undangan digital modern, elegan, dan interaktif untuk Birthday, Sunatan, Wedding, Aqiqah, dan berbagai momen spesial lainnya.',
  get image() {
    return getOgImage();
  },
  get url() {
    return getSiteUrl('/');
  },
};

export const resetSocialMeta = (): void => {
  applySocialMeta(DEFAULT_HOME);
};

/** Apply dynamic metadata for a published invitation. */
export const applyInvitationMeta = (
  invitation: Invitation,
  template: Template,
  url: string
): void => {
  const title = getInvitationTitle(invitation, template);
  const cd = invitation.customData as Record<string, unknown>;
  const categoryLabel = template.categoryLabel || invitation.category;
  const venue = invitation.venue || (cd.venue as string) || '';
  const descBits = [
    `Anda diundang untuk hadir dalam acara ${categoryLabel.toLowerCase()} ${title.toLowerCase()}.`,
  ];
  if (invitation.eventDate) descBits.push(`Tanggal: ${invitation.eventDate}.`);
  if (venue) descBits.push(`Lokasi: ${venue}.`);
  descBits.push('Tunggu apa lagi? Buka undangannya sekarang.');

  applySocialMeta({
    title,
    description: descBits.join(' '),
    image: template.image,
    url,
  });
};
