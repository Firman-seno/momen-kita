import React from 'react';
import { Template } from '../types';
import { FamilyConfig, FamilyKey, CoverStyle, GalleryStyle, DesignResolution } from './types';

/* ============================================================
   MOMENKITA DESIGN SYSTEM — 10 VISUAL FAMILIES
   -------------------------------------
   Every template in the catalog resolves deterministically to
   ONE family + ONE cover + ONE gallery. Families control real
   visual output (cover composition, cards, ornaments, patterns,
   dividers, gallery arrangement, button shape) so each template
   family looks genuinely different — not just a color swap.
   ============================================================ */

export const FAMILIES: Record<FamilyKey, FamilyConfig> = {
  /* -------------------------------------------------- A. LUXURY
     Dark, gold/champagne, royal ornaments, carved frames. */
  luxury: {
    key: 'luxury',
    label: 'Luxury',
    motto: 'Elegance Redefined',
    coverStyle: 'ornate',
    headingStyle: 'ornate',
    dividerStyle: 'gold-line',
    cardStyle: 'dark',
    photoShape: 'card',
    galleryStyle: 'framed',
    buttonShape: 'square',
    cornerMarks: ['✦'],
    ambientMarks: ['✨', '👑', '💎', '🥂'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#160f08]/60 border border-amber-200/25 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
    cardStyleExtra: {
      backgroundImage:
        'linear-gradient(160deg, rgba(212,175,55,0.10) 0%, rgba(22,15,8,0.65) 40%)',
    },
    accent: '#d4af37',
    coverFrameEmphasis: true,
    titleTracking: 'tracking-wide',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- B. FLORAL
     Botanical, watercolor, arch frames, cream paper. */
  floral: {
    key: 'floral',
    label: 'Floral',
    motto: 'Bloom With Love',
    coverStyle: 'arch-window',
    headingStyle: 'script',
    dividerStyle: 'floral',
    cardStyle: 'paper',
    photoShape: 'arch',
    galleryStyle: 'collage',
    buttonShape: 'round',
    cornerMarks: ['✿', '❀'],
    ambientMarks: ['🌸', '🍃', '🌷', '🦋'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#fdf9f1]/95 text-slate-800 border border-white/80 shadow-[0_14px_34px_rgba(80,30,50,0.22)]',
    accent: '#c4627e',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- C. MINIMAL ELEGANT
     Cream, beige, champagne. Thin borders, lots of whitespace. */
  'minimal-elegant': {
    key: 'minimal-elegant',
    label: 'Minimal Elegant',
    motto: 'Less Is Lovelier',
    coverStyle: 'centered',
    headingStyle: 'classic',
    dividerStyle: 'thin',
    cardStyle: 'paper',
    photoShape: 'circle',
    galleryStyle: 'grid',
    buttonShape: 'pill',
    cornerMarks: ['✦'],
    ambientMarks: ['✦', '❋', '◍'],
    ornamentedHeadings: false,
    cardClass:
      'bg-[#faf6ec]/95 text-slate-800 border border-[#e7dcc4]/80 shadow-[0_10px_28px_rgba(40,30,10,0.15)]',
    accent: '#b08a3e',
    coverFrameEmphasis: false,
    titleTracking: 'tracking-wide',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- D. MODERN
     Bold type, asymmetric shapes, geometric. */
  modern: {
    key: 'modern',
    label: 'Modern',
    motto: 'Bold & Unforgettable',
    coverStyle: 'asym',
    headingStyle: 'modern',
    dividerStyle: 'geometric',
    cardStyle: 'dark',
    photoShape: 'square',
    galleryStyle: 'masonry',
    buttonShape: 'angled',
    cornerMarks: ['◆', '●'],
    ambientMarks: ['◇', '▲', '●', '◼'],
    ornamentedHeadings: false,
    cardClass:
      'bg-[#0d0d12]/70 border border-white/15 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.45)]',
    accent: '#818cf8',
    coverFrameEmphasis: false,
    titleTracking: 'tracking-tight',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- E. ROMANTIC
     Dusty rose, blush, burgundy, florals, elegant. */
  romantic: {
    key: 'romantic',
    label: 'Romantic',
    motto: 'Written In The Stars',
    coverStyle: 'arch-window',
    headingStyle: 'script',
    dividerStyle: 'floral',
    cardStyle: 'soft',
    photoShape: 'arch',
    galleryStyle: 'polaroid',
    buttonShape: 'round',
    cornerMarks: ['🌹', '💗'],
    ambientMarks: ['🥀', '💗', '🌹', '🕊️'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#2a0f1a]/55 border border-rose-200/30 backdrop-blur-md shadow-[0_10px_36px_rgba(0,0,0,0.4)]',
    accent: '#f9a8d4',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- F. ISLAMIC
     Geometric pattern, arabesque, mosque, emerald/navy/gold. */
  islamic: {
    key: 'islamic',
    label: 'Islamic',
    motto: 'Bismillahirrahmanirrahim',
    coverStyle: 'islamic-arch',
    headingStyle: 'ornate',
    dividerStyle: 'arabesque',
    cardStyle: 'dark',
    photoShape: 'islamic-arch',
    galleryStyle: 'framed',
    buttonShape: 'square',
    cornerMarks: ['❋'],
    ambientMarks: ['☪️', '🌙', '✨', '⭐'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#052b21]/55 border border-amber-200/25 backdrop-blur-md shadow-[0_10px_36px_rgba(0,0,0,0.45)]',
    cardStyleExtra: {
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(212,175,55,0.05) 0px, rgba(212,175,55,0.05) 1px, transparent 1px, transparent 16px)',
    },
    accent: '#d4af37',
    coverFrameEmphasis: true,
    titleTracking: 'wide',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- G. KIDS FUN
     Playful, balloons, stars, clouds, cartoon energy. */
  'kids-fun': {
    key: 'kids-fun',
    label: 'Kids Fun',
    motto: 'Let The Party Begin!',
    coverStyle: 'polaroid-scatter',
    headingStyle: 'classic',
    dividerStyle: 'stars',
    cardStyle: 'glass',
    photoShape: 'polaroid',
    galleryStyle: 'polaroid',
    buttonShape: 'round',
    cornerMarks: ['★'],
    ambientMarks: ['🎈', '⭐', '🎉', '☁️'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#161230]/55 border-2 border-white/20 backdrop-blur-md rounded-3xl shadow-[0_12px_34px_rgba(0,0,0,0.4)]',
    accent: '#fbbf24',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- H. RUSTIC
     Earth tones, paper texture, botanical, wood. */
  rustic: {
    key: 'rustic',
    label: 'Rustic',
    motto: 'Rooted In Love',
    coverStyle: 'card-focus',
    headingStyle: 'classic',
    dividerStyle: 'leaf',
    cardStyle: 'paper',
    photoShape: 'card',
    galleryStyle: 'stacked',
    buttonShape: 'square',
    cornerMarks: ['✿'],
    ambientMarks: ['🌿', '🍂', '🌾'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#f3e9d6]/96 text-slate-800 border border-[#e0d0ac]/90 shadow-[0_12px_32px_rgba(30,20,5,0.25)]',
    cardStyleExtra: {
      backgroundImage:
        'radial-gradient(circle at 100% 0%, rgba(180,100,40,0.10) 0%, transparent 55%)',
    },
    accent: '#b4540a',
    coverFrameEmphasis: true,
    titleTracking: 'wide',
    titleTransform: 'capitalize',
  },

  /* -------------------------------------------------- I. CONTEMPORARY
     Editorial layout, big imagery, sophisticated spacing. */
  contemporary: {
    key: 'contemporary',
    label: 'Contemporary',
    motto: 'Modern & Refined',
    coverStyle: 'editorial',
    headingStyle: 'modern',
    dividerStyle: 'double-line',
    cardStyle: 'dark',
    photoShape: 'portrait',
    galleryStyle: 'masonry',
    buttonShape: 'square',
    cornerMarks: ['●'],
    ambientMarks: ['●', '○', '—'],
    ornamentedHeadings: false,
    cardClass:
      'bg-black/50 border border-white/15 backdrop-blur-md shadow-[0_12px_36px_rgba(0,0,0,0.45)]',
    accent: '#e4e4e7',
    coverFrameEmphasis: false,
    titleTracking: 'tracking-tight',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- J. TRADITIONAL INDONESIAN
     Batik patterns, heritage colors, modernized composition. */
  'traditional-indonesian': {
    key: 'traditional-indonesian',
    label: 'Traditional Indonesia',
    motto: 'Warisan Nusantara',
    coverStyle: 'ornate',
    headingStyle: 'ornate',
    dividerStyle: 'batik',
    cardStyle: 'dark',
    photoShape: 'card',
    galleryStyle: 'framed',
    buttonShape: 'square',
    cornerMarks: ['☀'],
    ambientMarks: ['🌾', '🎋', '🪶'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#1c1109]/65 border border-amber-200/25 backdrop-blur-md shadow-[0_10px_36px_rgba(0,0,0,0.5)]',
    cardStyleExtra: {
      backgroundImage:
        'repeating-linear-gradient(90deg, rgba(212,175,55,0.06) 0px, rgba(212,175,55,0.06) 2px, transparent 2px, transparent 26px)',
    },
    accent: '#d4af37',
    coverFrameEmphasis: true,
    titleTracking: 'wide',
    titleTransform: 'uppercase',
  },
};

export const FAMILY_ORDER: FamilyKey[] = [
  'luxury',
  'floral',
  'minimal-elegant',
  'modern',
  'romantic',
  'islamic',
  'kids-fun',
  'rustic',
  'contemporary',
  'traditional-indonesian',
];

/* ============================================================
   DETERMINISTIC RESOLUTION
   ============================================================ */

/* Priority-ordered keyword sets. Most specific families win. */
const KEYWORDS: Record<Exclude<FamilyKey, 'contemporary'>, string[]> = {
  'traditional-indonesian': [
    'batik', 'javanese', 'keraton', 'sundanese', 'minang', 'aceh', 'bali',
    'indonesian', 'gamelan', 'peci & sarung', 'rumah gadang', 'nusantara',
    'traditional', 'santri', 'kasidah', 'priangan',
  ],
  islamic: [
    'islamic', 'mosque', 'arabesque', 'arabic', 'calligraphy', 'crescent',
    'arabian', 'kufi', 'bismillah', 'hafiz', 'ustadz', 'akhwat', 'sunnah',
    'zamzam', 'maulid', 'ramadan', 'tahlil', 'prayer', 'quran', 'mubarak',
    'marhaban', 'sholawat', 'masjid', 'dome', 'minaret', 'lantern', 'green mercy',
  ],
  'kids-fun': [
    'kids', 'cartoon', 'playful', 'balloon', 'cute', 'gaming', 'pixel',
    'arcade', 'confetti', 'comic', 'space', 'dinosaur', 'neon', 'dance',
    'k-pop', 'cyber', 'glow', 'colorful', 'fun', '8-bit', 'teddy', 'adventure',
    'toys', 'doodle', 'party pop', 'candy', 'storybook', 'star & crescent',
  ],
  rustic: [
    'rustic', 'boho', 'bohemian', 'terracotta', 'wood', 'clay', 'earthy',
    'country', 'farmhouse', 'organic', 'olive', 'sage leaf', 'sand', 'dune',
    'sandstone', 'walnut', 'espresso', 'heritage', 'tribal',
  ],
  luxury: [
    'luxury', 'gold', 'champagne', 'royal', 'marble', 'velvet', 'emerald',
    'midnight', 'platinum', 'damask', 'brocade', 'wine', 'maroon', 'noir',
    'gala', 'exclusive', 'premium', 'monarch', 'majesty', 'sultan', 'queen',
    'crown', 'tiara', 'jewel', 'glam', 'decadent', 'golden', 'vip', 'art deco',
    'jade', 'royal cream',
  ],
  floral: [
    'floral', 'flower', 'garden', 'bloom', 'rose', 'peony', 'cherry blossom',
    'wildflower', 'bouquet', 'botanical', 'sakura', 'petal', 'meadow', 'lace',
    'wreath', 'orchid', 'lily', 'tulip', 'leaf', 'symphony', 'spring', 'blossom',
  ],
  romantic: [
    'romantic', 'romance', 'dusty rose', 'dustyrose', 'pink', 'rose pop',
    'soft', 'love', 'heart', 'forever', 'timeless vow', 'romantic garden',
    'eternal', 'love story',
  ],
  modern: [
    'modern', 'geometric', 'art deco', 'abstract', 'asymmetric', 'editorial',
    'contemporary', 'urban', 'bold', 'typography', 'kufi pattern', 'steel',
    'platinum', 'monochrome chic',
  ],
  'minimal-elegant': [
    'minimal', 'monochrome', 'clean', 'scandi', 'nordic', 'ivory', 'cream',
    'beige', 'simple', 'minimalist', 'white & clean', 'sage & stone', 'vanilla',
    'off-white', 'taupe',
  ],
};

const CATEGORY_DEFAULTS: Record<string, FamilyKey> = {
  wedding: 'romantic',
  anniversary: 'romantic',
  birthday: 'kids-fun',
  gathering: 'kids-fun',
  aqiqah: 'floral',
  sunatan: 'islamic',
  religious: 'islamic',
  'doa-haul': 'islamic',
  tasyakuran: 'minimal-elegant',
  family: 'rustic',
  education: 'contemporary',
  business: 'contemporary',
};

const matchFamily = (designStyle: string): FamilyKey | null => {
  const s = designStyle.toLowerCase();
  for (const family of FAMILY_ORDER) {
    if (family === 'contemporary') continue;
    const words = KEYWORDS[family as Exclude<FamilyKey, 'contemporary'>];
    if (words.some((w) => s.includes(w))) return family;
  }
  return null;
};

export const resolveFamily = (template: Template): FamilyKey => {
  const matched = matchFamily(template.designStyle);
  if (matched) return matched;
  const def = CATEGORY_DEFAULTS[template.category];
  return def || 'contemporary';
};

/* ---- cover style from layout metadata ---- */
const resolveCoverStyle = (template: Template, family: FamilyKey): CoverStyle => {
  const layout = (template.layoutStyle || '').toLowerCase();
  const isIslamic = family === 'islamic';

  if (layout.includes('split')) return 'split';
  if (layout.includes('polaroid')) return 'polaroid-scatter';
  if (layout.includes('collage')) return 'polaroid-scatter';
  if (layout.includes('arch')) return isIslamic ? 'islamic-arch' : 'arch-window';
  if (layout.includes('mosque')) return 'islamic-arch';
  if (layout.includes('calligraphy')) return isIslamic ? 'islamic-arch' : 'ornate';
  if (layout.includes('banner')) return 'banner';
  if (layout.includes('fullscreen')) return 'editorial';
  if (layout.includes('hero')) return 'editorial';
  if (layout.includes('statement')) return 'editorial';
  if (layout.includes('photo story')) return 'editorial';
  if (layout.includes('two column') || layout.includes('columns')) return 'split';
  if (layout.includes('card')) return 'card-focus';
  if (layout.includes('ornamental') || layout.includes('golden frame')) return 'ornate';
  if (layout.includes('diploma')) return 'ornate';
  if (layout.includes('moon arch')) return 'arch-window';
  if (layout.includes('grid')) return 'asym';
  if (layout.includes('gallery focus')) return 'polaroid-scatter';

  // Fall back by family identity
  switch (family) {
    case 'islamic':
    case 'traditional-indonesian':
      return 'islamic-arch';
    case 'luxury':
      return 'ornate';
    case 'floral':
    case 'romantic':
      return 'arch-window';
    case 'kids-fun':
      return 'polaroid-scatter';
    case 'modern':
      return 'asym';
    case 'contemporary':
      return 'editorial';
    case 'rustic':
      return 'card-focus';
    default:
      return 'centered';
  }
};

/* ---- gallery style ---- */
const resolveGalleryStyle = (template: Template, family: FamilyKey): GalleryStyle => {
  const layout = (template.layoutStyle || '').toLowerCase();
  if (layout.includes('polaroid')) return 'polaroid';
  if (layout.includes('collage')) return 'collage';
  if (layout.includes('masonry') || layout.includes('mosaic')) return 'masonry';
  if (layout.includes('gallery focus')) return 'collage';
  if (layout.includes('card stack')) return 'stacked';
  if (layout.includes('frame')) return 'framed';

  switch (family) {
    case 'floral':
    case 'romantic':
      return layout.includes('grid') ? 'grid' : 'collage';
    case 'kids-fun':
      return 'polaroid';
    case 'modern':
    case 'contemporary':
      return 'masonry';
    case 'rustic':
      return 'stacked';
    case 'luxury':
    case 'islamic':
    case 'traditional-indonesian':
      return 'framed';
    default:
      return 'grid';
  }
};

export const resolveDesignSystem = (template: Template): DesignResolution => {
  const family = resolveFamily(template);
  return {
    family: FAMILIES[family],
    coverStyle: resolveCoverStyle(template, family),
    galleryStyle: resolveGalleryStyle(template, family),
  };
};

/* Light paper families render dark inner text on their cards. */
export const isPaperFamily = (family: FamilyConfig): boolean =>
  family.cardStyle === 'paper';

export const cardTextClass = (family: FamilyConfig): string =>
  isPaperFamily(family) ? 'text-slate-800' : 'text-white';

export const cardMutedClass = (family: FamilyConfig): string =>
  isPaperFamily(family) ? 'text-slate-600' : 'text-white/70';
