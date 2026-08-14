import { MusicCredit } from './data/musicCredits';

export type { MusicCredit };

export type FontStyleName =
  | 'playful'
  | 'elegant'
  | 'luxury'
  | 'minimalist'
  | 'cute'
  | 'neon'
  | 'retro'
  | 'handwritten';

export type AnimationStyle =
  | 'floating-balloons'
  | 'twinkling-stars'
  | 'sparkle'
  | 'butterflies'
  | 'neon-pulse'
  | 'subtle-drift'
  | 'islamic-glow'
  | 'floating-moon'
  | 'petals-fall'
  | 'watercolor-drift';

export type BackgroundType =
  | 'celebration-confetti'
  | 'kids-adventure'
  | 'comic-doodles'
  | 'neon-glow'
  | 'floral-lace'
  | 'marble-gold'
  | 'luxury-emerald'
  | 'pastel-clouds'
  | 'minimalist-lines'
  | 'wine-jazz'
  | 'islamic-gold'
  | 'wedding-royal'
  | 'wedding-garden'
  | 'baby-moon'
  | 'baby-animal'
  | 'watercolor';

export type FrameStyle =
  | 'arch'
  | 'gold-border'
  | 'polaroid'
  | 'cute-ribbon'
  | 'neon-border'
  | 'minimal-circle'
  | 'glass-frame'
  | 'floral-ring'
  | 'comic-frame'
  | 'royal-crest'
  | 'islamic-arch'
  | 'moon-arch'
  | 'floral-wreath'
  | 'royal-crown'
  | 'minimal-line';

export type ButtonStyle =
  | 'playful'
  | 'gold-luxury'
  | 'neon-glow'
  | 'rose-gold'
  | 'minimal-dark'
  | 'pastel-pill'
  | 'emerald-glass'
  | 'cartoon-pop'
  | 'islamic-gold'
  | 'garden-rose';

export interface ThemeStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  subtextColor: string;
  fontFamilyTitle: string;
  fontStyle: FontStyleName;
  decorations: string[];
  coverPattern?: string;
  bgPattern?: string;
  backgroundType?: BackgroundType;
  animationType?: AnimationStyle;
  overlayStyle?: string;
  frameStyle?: FrameStyle;
  buttonStyle?: ButtonStyle;
  paperTexture?: boolean;
}

/** Core categories that ship with their own curated music library. */
export type BaseCategory = 'birthday' | 'sunatan' | 'wedding' | 'aqiqah';

/**
 * All 12 invitation categories. New categories (education and beyond) reuse a
 * base category's music library and audio engine (see CATEGORY_BASE).
 */
export type CategoryKey =
  | BaseCategory
  | 'education'
  | 'religious'
  | 'tasyakuran'
  | 'gathering'
  | 'business'
  | 'anniversary'
  | 'family'
  | 'doa-haul';

export type TemplateBadge = 'POPULAR' | 'NEW' | 'TRENDING' | 'FEATURED';

export interface EventDetails {
  // Common
  date: string;
  time: string;
  venue: string;
  address: string;
  googleMapsUrl?: string;
  portraitImage: string;
  galleryImages: string[];
  messageQuote: string;

  // Birthday
  eventLabel?: string;
  birthdayPerson?: string;
  age?: number;

  // Sunatan / Aqiqah
  childName?: string;
  parentsName?: string;

  // Wedding
  groomName?: string;
  brideName?: string;
  groomParents?: string;
  brideParents?: string;
  akadDate?: string;
  resepsiDate?: string;
  coupleStory?: string;
  hashtag?: string;

  // Aqiqah
  babyName?: string;
  babyGender?: string;
  babyBirthDate?: string;
  doaText?: string;

  // Generic fields for the extended categories (Education, Religious,
  // Tasyakuran, Gathering, Business, Anniversary, Family, Doa & Haul).
  eventTitle?: string; // e.g. "Wisuda", "Grand Opening", "Reuni Akbar"
  hostName?: string; // host / organizer / host family name
  institutionName?: string; // school / university / company
  universityShort?: string; // short name e.g. "UI", "ITB"
  graduateName?: string; // education honoree
  degreeName?: string; // e.g. "S1 Teknik Informatika"
  companyName?: string; // business events
  coupleName?: string; // anniversary couple
  anniversaryYear?: number; // e.g. 10 (years together)
  deceasedName?: string; // doa & haul honoree
}

export interface Template {
  id: string; // Display id, e.g. "#001" (may repeat across categories)
  uid: string; // Unique id, e.g. "birthday-001"
  templateNumber: string; // e.g. "001"
  name: string;
  category: CategoryKey;
  categoryLabel: string; // e.g. "Birthday"
  subcategory: string;
  designStyle: string;
  colorPalette: string;
  typographyStyle: string;
  illustrationStyle: string;
  animationStyle: string;
  layoutStyle: string;
  badge?: TemplateBadge;
  featured?: boolean;
  demoStatus: 'active' | 'premium';
  price: number; // in IDR
  image: string;
  demoUrl: string; // e.g. "/demo/birthday/001"
  musicUrl: string;
  musicTrackName: string;
  music: MusicCredit;
  description?: string;
  features?: string[];
  themeStyle: ThemeStyle;
  eventDetails: EventDetails;
  sampleWishes: WishItem[];
}

export type NavigationTab =
  | 'home'
  | 'templates'
  | 'categories'
  | 'how-it-works'
  | 'faq'
  | 'demo'
  | 'music-credits'
  | 'invitation'
  | 'editor'
  | 'dashboard';

export interface WishItem {
  id: string;
  name: string;
  message: string;
  date: string;
  attendance: string;
}

export interface RSVPData {
  name: string;
  attendance: string;
  guests: number;
  message: string;
}
