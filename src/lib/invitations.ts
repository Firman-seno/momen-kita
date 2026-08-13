import { EventDetails, CategoryKey, Template } from '../types';
import { getTemplateByUid } from '../data/templates';

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
  /** Template-specific + extra fields (birthdayPerson, groomName, photos, quotes…). */
  customData: Partial<EventDetails> & Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

const STORAGE_KEY = 'momenkita.invitations.v1';

/* -----------------------------------------------
   Slug & ID generation (safe, collision-resistant)
   ----------------------------------------------- */
const SLUG_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const SLUG_LENGTH = 10;

export const generateSlug = (): string => {
  const bytes = new Uint8Array(SLUG_LENGTH);
  const existing = new Set(getAllInvitations().map((i) => i.slug));
  let slug = '';
  do {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    slug = Array.from(bytes)
      .map((b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length])
      .join('');
  } while (existing.has(slug));
  return slug;
};

export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `inv-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(36)}`;
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
    return parsed as Invitation[];
  } catch {
    return [];
  }
};

const saveAll = (list: Invitation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
  const invitation: Invitation = {
    id: data.id || generateId(),
    slug: data.slug || generateSlug(),
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
  return `${base}/i/${invitation.slug}`;
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
  return cd.birthdayPerson || invitation.customerName;
};

export const invitationStatusLabel: Record<InvitationStatus, string> = {
  draft: 'DRAFT',
  published: 'PUBLISHED',
  expired: 'EXPIRED',
};
