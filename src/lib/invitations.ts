import { EventDetails, CategoryKey, Template } from '../types';
import { getTemplateByUid } from '../data/templates';
import { INVITATIONS_STORAGE_KEY } from './storageKeys';
import { scheduleDataSync } from './serverApi';
import { getOrderById, getAllOrders, updateOrder } from './orders';

/* ============================================================
   MomenKita — Customer Invitation System
   ------------------------------------------------
   TEMPLATE vs CUSTOMER INVITATION
     - A Template is the design / master. Never mutated by customers.
     - An Invitation references one template + customer data + a
       unique public slug at /i/<slug>.

   Every invitation gets a cryptographically-random slug (not a
   sequential DB id), so links never collide and never expose
   sensitive internal data. Editing an invitation NEVER changes
   its slug → customers keep the same link after edits.

   Status flow: draft → published → expired
   Only PUBLISHED invitations are shareable.
   ============================================================ */

export type InvitationStatus = 'draft' | 'published' | 'expired';

export interface InvitationMusic {
  id: string;
  title: string;
  url: string;
  /** Skip intro/ambience — start playback at this second of the track. */
  startTime?: number;
}

export interface Invitation {
  id: string; // internal uuid (never used as public identifier)
  slug: string; // public unique slug (e.g. "8f42Klm29")
  templateUid: string; // e.g. "aqiqah-002"
  category: CategoryKey;
  templateNumber: string; // e.g. "002"
  /** Template cover image (public URL) — used as og:image fallback by the server. */
  templateImage?: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  googleMapsUrl?: string;
  status: InvitationStatus;
  /** Linked admin order (if created from Order → invitation flow). */
  orderId?: string;
  /** Admin-chosen music (falls back to the template's default track). */
  music?: InvitationMusic | null;
  /** If false, the invitation plays no background music. */
  musicEnabled?: boolean;
  /** Public HTTPS URL of the invitation video (hosted on Vercel Blob). */
  videoUrl?: string;
  /** MIME type of the video (e.g. "video/mp4"). */
  videoType?: string;
  /** Original filename, kept for display in the admin editor. */
  videoName?: string;
  /** Template-specific + extra fields (birthdayPerson, groomName, photos, quotes…). */
  customData: Partial<EventDetails> & Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

const STORAGE_KEY = INVITATIONS_STORAGE_KEY;

/* -----------------------------------------------
   Slug & ID generation (safe, collision-resistant)
   -------------------------------------------------
   Public links live at /i/<slug>. A slug is either a
   readable "customer-name-xxxxx" (when a name is known)
   or a random token. Slugs never contain /, spaces, or
   anything that would break the route, and are always
   unique.
   ----------------------------------------------- */
const SLUG_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const SLUG_LENGTH = 10;
const SLUG_SUFFIX_LENGTH = 5;

export const isValidSlug = (slug: string): boolean =>
  typeof slug === 'string' && /^[A-Za-z0-9_-]{3,64}$/.test(slug);

/** "Ibu Siti Aminah" → "ibu-siti-aminah"; strips accents & unsafe chars. */
const slugifyName = (name: string): string => {
  const ascii = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return ascii.toLowerCase().slice(0, 24).replace(/-+$/g, '');
};

const randomPart = (len: number): string => {
  const bytes = new Uint8Array(len);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length])
    .join('');
};

/**
 * Generate a unique public slug. When `name` is provided the slug is
 * human-readable ("miko-aB3kD"); otherwise a random token is used.
 * `existing` may be passed to avoid reading storage (prevents recursion
 * during the legacy-data migration).
 */
export const generateSlug = (name?: string, existing?: Set<string>): string => {
  const taken = existing || new Set(getAllInvitations().map((i) => i.slug));
  const base = name ? slugifyName(name) : '';
  const suffixLen = base ? SLUG_SUFFIX_LENGTH : SLUG_LENGTH;
  let slug = '';
  let attempts = 0;
  do {
    const random = randomPart(suffixLen);
    slug = base ? `${base}-${random}` : random;
    attempts += 1;
    if (attempts > 120) {
      slug = `inv-${Date.now().toString(36)}-${randomPart(4)}`;
      break;
    }
  } while (taken.has(slug));
  return slug;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `inv-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
};

/* -----------------------------------------------
   Legacy data migration
   -------------------------------------------------
   Idempotent + safe: repairs invitations that lack a
   unique slug and links invitations to their order by
   customer phone when orderId is missing. Only saves
   when something actually changed. Existing data is
   never deleted.
   ----------------------------------------------- */
const migrateInvitationList = (list: Invitation[]): { list: Invitation[]; changed: boolean } => {
  const used = new Set<string>();
  const orders = getAllOrders();
  const byPhone = new Map<string, ReturnType<typeof getOrderById>>();
  orders.forEach((o) => {
    const digits = (o.customerPhone || '').replace(/[^\d]/g, '');
    if (digits) byPhone.set(digits.slice(-10), o);
  });

  let changed = false;
  const next = list.map((inv) => {
    const copy = { ...inv, customData: inv.customData || {} };
    if (!copy.id) {
      copy.id = generateId();
      changed = true;
    }
    if (!isValidSlug(copy.slug) || used.has(copy.slug)) {
      copy.slug = generateSlug(copy.customerName || '', used);
      changed = true;
    }
    used.add(copy.slug);
    if (!copy.orderId) {
      const digits = (copy.customerPhone || '').replace(/[^\d]/g, '');
      const order = digits ? byPhone.get(digits.slice(-10)) : undefined;
      if (order?.id) {
        copy.orderId = order.id;
        changed = true;
      }
    }
    return copy;
  });
  return { list: next, changed };
};

/* -----------------------------------------------
   Storage helpers
   ----------------------------------------------- */
export const getAllInvitations = (): Invitation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = migrateInvitationList(parsed as Invitation[]);
    if (migrated.changed) saveAll(migrated.list);
    return migrated.list;
  } catch {
    return [];
  }
};

const saveAll = (list: Invitation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    scheduleDataSync();
  } catch {
    // Storage full / unavailable — keep app working silently.
  }
};

export const getInvitationBySlug = (slug: string): Invitation | undefined => {
  return getAllInvitations().find((i) => i.slug === slug);
};

export const getInvitationById = (id: string): Invitation | undefined => {
  return getAllInvitations().find((i) => i.id === id);
};

export const createInvitation = (
  data: Partial<Invitation>
): Invitation => {
  const now = Date.now();
  const existing = new Set(getAllInvitations().map((i) => i.slug));
  const slug = data.slug && isValidSlug(data.slug) ? data.slug : generateSlug(data.customerName || '', existing);
  // Never allow a duplicate slug — append a suffix if a caller passed one that collides.
  const uniqueSlug = existing.has(slug) ? generateSlug(data.customerName || '', existing) : slug;
  const invitation: Invitation = {
    id: data.id || generateId(),
    slug: uniqueSlug,
    templateUid: data.templateUid || '',
    category: data.category || 'birthday',
    templateNumber: data.templateNumber || '001',
    customerName: data.customerName || '',
    customerPhone: data.customerPhone || '',
    eventDate: data.eventDate || '',
    eventTime: data.eventTime || '',
    venue: data.venue || '',
    address: data.address || '',
    googleMapsUrl: data.googleMapsUrl,
    status: data.status || 'draft',
    orderId: data.orderId,
    music: data.music,
    musicEnabled: data.musicEnabled !== false,
    customData: data.customData || {},
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    publishedAt: data.publishedAt,
  };
  const list = getAllInvitations();
  list.push(invitation);
  saveAll(list);
  return invitation;
};

/** Updates invitation by id. Slug (public link) is ALWAYS preserved. */
export const updateInvitation = (
  id: string,
  patch: Partial<Invitation>
): Invitation | undefined => {
  const list = getAllInvitations();
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const prev = list[idx];
  const next: Invitation = {
    ...prev,
    ...patch,
    id: prev.id,
    slug: prev.slug, // public link never changes on edit
    createdAt: prev.createdAt,
    updatedAt: Date.now(),
    publishedAt:
      patch.status === 'published' && prev.status !== 'published'
        ? Date.now()
        : prev.publishedAt,
  };
  list[idx] = next;
  saveAll(list);
  return next;
};

export const deleteInvitation = (id: string): void => {
  saveAll(getAllInvitations().filter((i) => i.id !== id));
};

export const setInvitationStatus = (
  id: string,
  status: InvitationStatus
): Invitation | undefined => updateInvitation(id, { status });

/* -----------------------------------------------
   Data mapping helpers
   ----------------------------------------------- */

/** Effective EventDetails = template defaults merged with customer data. */
export const getEventDetailsForInvitation = (
  template: Template,
  invitation: Pick<Invitation, 'customData' | 'eventDate' | 'eventTime' | 'venue' | 'address' | 'googleMapsUrl'>
): EventDetails => {
  return {
    ...template.eventDetails,
    ...(invitation.customData as Partial<EventDetails>),
    date: invitation.eventDate || (invitation.customData.date as string) || template.eventDetails.date,
    time: invitation.eventTime || (invitation.customData.time as string) || template.eventDetails.time,
    venue: invitation.venue || (invitation.customData.venue as string) || template.eventDetails.venue,
    address: invitation.address || (invitation.customData.address as string) || template.eventDetails.address,
    googleMapsUrl: invitation.googleMapsUrl || (invitation.customData.googleMapsUrl as string | undefined),
  };
};

/** Public URL for an invitation. */
export const getInvitationUrl = (invitation: Pick<Invitation, 'slug'>): string => {
  const { origin, pathname } = window.location;
  const base = pathname.includes('index.html')
    ? `${origin}${pathname.replace(/index\.html$/, '')}`
    : origin;
  const slug = isValidSlug(invitation.slug) ? invitation.slug : generateSlug();
  return `${base}/i/${slug}`;
};

/**
 * Link an Order → Invitation so the order records both the internal
 * invitation id and its public slug (kept in sync with the invitation).
 */
export const linkOrderToInvitation = (
  orderId: string,
  invitation: Pick<Invitation, 'id' | 'slug'>
): boolean => {
  const order = getOrderById(orderId);
  if (!order) return false;
  updateOrder(orderId, { invitationId: invitation.id, invitationSlug: invitation.slug });
  return true;
};

/** Human-readable display title for the invitation. */
export const getInvitationTitle = (
  invitation: Invitation,
  template?: Template
): string => {
  const t = template || getTemplateByUid(invitation.templateUid);
  const catLabel = t?.categoryLabel || invitation.category;
  const cd = invitation.customData as Partial<EventDetails>;
  if (invitation.category === 'wedding') {
    const name = [cd.groomName, cd.brideName].filter(Boolean).join(' & ');
    return name ? `Undangan Pernikahan ${name}` : `Undangan Pernikahan`;
  }
  if (invitation.category === 'sunatan') {
    return cd.childName ? `Undangan Sunatan ${cd.childName}` : `Undangan Sunatan`;
  }
  if (invitation.category === 'aqiqah') {
    return cd.babyName ? `Undangan Aqiqah ${cd.babyName}` : `Undangan Aqiqah`;
  }
  if (invitation.category === 'education') {
    const person = cd.graduateName;
    return person ? `Undangan Wisuda ${person}` : `Undangan Wisuda & Graduation`;
  }
  const person = cd.birthdayPerson;
  return person ? `Undangan Ulang Tahun ${person}` : `Undangan Ulang Tahun`;
};

export const getInvitationDisplayName = (
  invitation: Invitation,
  template?: Template
): string => {
  const cd = invitation.customData as Partial<EventDetails>;
  if (invitation.category === 'wedding') {
    return [cd.groomName, cd.brideName].filter(Boolean).join(' & ') || invitation.customerName;
  }
  if (invitation.category === 'sunatan') return cd.childName || invitation.customerName;
  if (invitation.category === 'aqiqah') return cd.babyName || invitation.customerName;
  if (invitation.category === 'education') return cd.graduateName || invitation.customerName;
  return cd.birthdayPerson || invitation.customerName;
};

/**
 * Import an invitation received from the server into the local store.
 * Keeps the public slug stable; the newer version (by updatedAt) wins.
 * Used by the public invitation page as a fallback so links work on
 * devices that never saw the admin's localStorage.
 */
export const upsertInvitationFromServer = (data: unknown): Invitation | undefined => {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Partial<Invitation>;
  if (!d.id) return undefined;
  const existing = getInvitationById(d.id);
  if (existing) {
    if ((d.updatedAt || 0) >= (existing.updatedAt || 0)) {
      return updateInvitation(existing.id, { ...d, slug: existing.slug });
    }
    return existing;
  }
  return createInvitation(d);
};

export const invitationStatusLabel: Record<InvitationStatus, string> = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  expired: 'EXPIRED',
};
