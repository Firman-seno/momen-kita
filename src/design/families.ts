import React from 'react';
import { Template } from '../types';
import { FamilyConfig, FamilyKey, CoverStyle, GalleryStyle, DesignResolution } from './types';

/* ============================================================
   MOMENKITA DESIGN SYSTEM — 22 VISUAL FAMILIES
   -------------------------------------
   10 core families + 12 birthday-only families. Every template
   in the catalog resolves deterministically to ONE family + ONE
   cover + ONE gallery. Families control real visual output (cover
   composition, cards, ornaments, patterns, dividers, gallery
   arrangement, button shape) so each template family looks
   genuinely different — not just a color swap.
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

  /* -------------------------------------------------- K. BDAY BALLOON
     Bright bubbly party: floating balloon arch, cute rounded glass. */
  'bday-balloon': {
    key: 'bday-balloon',
    label: 'Balloon Party',
    motto: 'Let The Party Begin!',
    coverStyle: 'bday-balloon-arch',
    headingStyle: 'classic',
    dividerStyle: 'stars',
    cardStyle: 'glass',
    photoShape: 'circle',
    galleryStyle: 'polaroid',
    buttonShape: 'round',
    cornerMarks: ['★'],
    ambientMarks: ['🎈', '🎉', '⭐', '☁️', '🎂'],
    ornamentedHeadings: true,
    cardClass:
      'bg-white/10 border-2 border-white/25 backdrop-blur-md rounded-3xl shadow-[0_12px_34px_rgba(0,0,0,0.35)]',
    accent: '#f472b6',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- L. BDAY CARTOON
     Comic energy: bold outlines, star bursts, pop-art colors. */
  'bday-cartoon': {
    key: 'bday-cartoon',
    label: 'Cartoon Fun',
    motto: 'Comic Vibes Only',
    coverStyle: 'bday-comic-hero',
    headingStyle: 'modern',
    dividerStyle: 'dots',
    cardStyle: 'glass',
    photoShape: 'square',
    galleryStyle: 'collage',
    buttonShape: 'round',
    cornerMarks: ['★'],
    ambientMarks: ['💥', '🎨', '⭐', '🍿', '🎪'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#141020]/60 border-[3px] border-yellow-300/60 backdrop-blur-md rounded-2xl shadow-[0_12px_34px_rgba(0,0,0,0.45)]',
    accent: '#facc15',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- M. BDAY SPACE
     Deep cosmos: portal photo, planets, stars, rocket energy. */
  'bday-space': {
    key: 'bday-space',
    label: 'Space Adventure',
    motto: 'To Infinity & Beyond',
    coverStyle: 'bday-space-portal',
    headingStyle: 'classic',
    dividerStyle: 'stars',
    cardStyle: 'dark',
    photoShape: 'circle',
    galleryStyle: 'grid',
    buttonShape: 'pill',
    cornerMarks: ['✦'],
    ambientMarks: ['🚀', '⭐', '🌙', '✨', '🪐'],
    ornamentedHeadings: true,
    cardClass:
      'bg-slate-950/60 border border-cyan-300/25 backdrop-blur-md rounded-2xl shadow-[0_12px_34px_rgba(0,0,0,0.5)]',
    accent: '#22d3ee',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- N. BDAY PRINCESS
     Fairytale royalty: arch photo, crown, castle, blush pink. */
  'bday-princess': {
    key: 'bday-princess',
    label: 'Royal Princess',
    motto: 'Fairytale For A Day',
    coverStyle: 'bday-princess-arch',
    headingStyle: 'script',
    dividerStyle: 'crown',
    cardStyle: 'soft',
    photoShape: 'arch',
    galleryStyle: 'framed',
    buttonShape: 'round',
    cornerMarks: ['♛'],
    ambientMarks: ['👑', '🌸', '✨', '🦋', '💖'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#241020]/55 border border-pink-200/30 backdrop-blur-md rounded-[2rem] shadow-[0_12px_36px_rgba(0,0,0,0.4)]',
    accent: '#f9a8d4',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- O. BDAY PASTEL
     Soft clouds & hearts: dreamy rounded shapes, gentle colors. */
  'bday-pastel': {
    key: 'bday-pastel',
    label: 'Pastel Dream',
    motto: 'Soft & Sweet',
    coverStyle: 'bday-pastel-clouds',
    headingStyle: 'classic',
    dividerStyle: 'stars',
    cardStyle: 'glass',
    photoShape: 'heart',
    galleryStyle: 'grid',
    buttonShape: 'pill',
    cornerMarks: ['✿'],
    ambientMarks: ['☁️', '🌸', '💖', '🦄', '✨'],
    ornamentedHeadings: true,
    cardClass:
      'bg-white/15 border border-white/30 backdrop-blur-md rounded-[2rem] shadow-[0_12px_34px_rgba(0,0,0,0.3)]',
    accent: '#c084fc',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- P. BDAY MINIMAL
     Clean modern: big type, white space, premium restraint. */
  'bday-minimal': {
    key: 'bday-minimal',
    label: 'Modern Minimal',
    motto: 'Clean & Cool',
    coverStyle: 'bday-minimal-type',
    headingStyle: 'modern',
    dividerStyle: 'thin',
    cardStyle: 'dark',
    photoShape: 'square',
    galleryStyle: 'grid',
    buttonShape: 'pill',
    cornerMarks: ['●'],
    ambientMarks: ['●', '○', '—', '✦'],
    ornamentedHeadings: false,
    cardClass:
      'bg-white/5 border border-white/15 backdrop-blur-md rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.4)]',
    accent: '#e4e4e7',
    coverFrameEmphasis: false,
    titleTracking: 'tracking-tight',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- Q. BDAY LUXURY
     Black & gold gala: circle in a gold ring, royal ornaments. */
  'bday-luxury': {
    key: 'bday-luxury',
    label: 'Luxury Gold',
    motto: 'Celebrate In Gold',
    coverStyle: 'bday-luxe-circle',
    headingStyle: 'ornate',
    dividerStyle: 'gold-line',
    cardStyle: 'dark',
    photoShape: 'circle',
    galleryStyle: 'framed',
    buttonShape: 'square',
    cornerMarks: ['✦'],
    ambientMarks: ['✨', '👑', '🥂', '💎'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#160f08]/60 border border-amber-200/25 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
    accent: '#d4af37',
    coverFrameEmphasis: true,
    titleTracking: 'tracking-wide',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- R. BDAY NEON
     Teen glow: tilted photos, neon grid, futuristic type. */
  'bday-neon': {
    key: 'bday-neon',
    label: 'Neon Night',
    motto: 'Glow Up Time',
    coverStyle: 'bday-neon-tilt',
    headingStyle: 'modern',
    dividerStyle: 'geometric',
    cardStyle: 'dark',
    photoShape: 'square',
    galleryStyle: 'masonry',
    buttonShape: 'angled',
    cornerMarks: ['⚡'],
    ambientMarks: ['⚡', '🎧', '🌌', '💿', '✨'],
    ornamentedHeadings: false,
    cardClass:
      'bg-slate-950/60 border border-fuchsia-400/30 backdrop-blur-md rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.35)]',
    accent: '#22d3ee',
    coverFrameEmphasis: false,
    titleTracking: 'tracking-tight',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- S. BDAY CANDY
     Sweet shop: candy stripes, sprinkles, playful hearts. */
  'bday-candy': {
    key: 'bday-candy',
    label: 'Candy Sweet',
    motto: 'Sweet As Candy',
    coverStyle: 'bday-candy-split',
    headingStyle: 'classic',
    dividerStyle: 'confetti',
    cardStyle: 'glass',
    photoShape: 'heart',
    galleryStyle: 'polaroid',
    buttonShape: 'round',
    cornerMarks: ['★'],
    ambientMarks: ['🍭', '🧁', '🌈', '💖', '🎀'],
    ornamentedHeadings: true,
    cardClass:
      'bg-white/15 border-2 border-pink-300/40 backdrop-blur-md rounded-[2rem] shadow-[0_12px_34px_rgba(0,0,0,0.35)]',
    accent: '#fb7185',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- T. BDAY ELEGANT
     Refined adult celebration: blush florals, soft paper. */
  'bday-elegant': {
    key: 'bday-elegant',
    label: 'Elegant Birthday',
    motto: 'Refined & Classy',
    coverStyle: 'bday-elegant-frame',
    headingStyle: 'script',
    dividerStyle: 'floral',
    cardStyle: 'paper',
    photoShape: 'arch',
    galleryStyle: 'collage',
    buttonShape: 'round',
    cornerMarks: ['✿'],
    ambientMarks: ['🌸', '🌹', '✨', '🦋', '🥂'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#fdf6ee]/95 text-slate-800 border border-white/80 shadow-[0_14px_34px_rgba(80,30,50,0.22)]',
    accent: '#c4627e',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'none',
  },

  /* -------------------------------------------------- U. BDAY RETRO
     90s nostalgia: burst shapes, retro grid, loud pop colors. */
  'bday-retro': {
    key: 'bday-retro',
    label: 'Retro Party',
    motto: 'Rad 90s Vibe',
    coverStyle: 'bday-retro-burst',
    headingStyle: 'modern',
    dividerStyle: 'geometric',
    cardStyle: 'glass',
    photoShape: 'square',
    galleryStyle: 'collage',
    buttonShape: 'square',
    cornerMarks: ['★'],
    ambientMarks: ['📼', '🌶', '💿', '🎉', '✳️'],
    ornamentedHeadings: false,
    cardClass:
      'bg-[#1a1026]/60 border-[3px] border-cyan-300/40 backdrop-blur-md rounded-xl shadow-[0_12px_34px_rgba(0,0,0,0.45)]',
    accent: '#f472b6',
    coverFrameEmphasis: false,
    titleTracking: 'normal',
    titleTransform: 'uppercase',
  },

  /* -------------------------------------------------- V. BDAY BOHO
     Free-spirited wild: terracotta, leaves, organic circles. */
  'bday-boho': {
    key: 'bday-boho',
    label: 'Boho & Wild',
    motto: 'Free Spirit Vibes',
    coverStyle: 'bday-boho-frame',
    headingStyle: 'script',
    dividerStyle: 'leaf',
    cardStyle: 'paper',
    photoShape: 'circle',
    galleryStyle: 'stacked',
    buttonShape: 'square',
    cornerMarks: ['✿'],
    ambientMarks: ['🌿', '🌾', '🍂', '🪶', '🌵'],
    ornamentedHeadings: true,
    cardClass:
      'bg-[#f7ecda]/96 text-slate-800 border border-[#e0cda8]/90 shadow-[0_12px_32px_rgba(30,20,5,0.25)]',
    accent: '#d97706',
    coverFrameEmphasis: true,
    titleTracking: 'normal',
    titleTransform: 'capitalize',
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
   BIRTHDAY-ONLY FAMILIES
   ------------------------------------------------------------
   These 12 families exist solely for the birthday category. They
   give 100 birthday templates genuinely different compositions
   (balloon arch, comic hero, space portal, princess arch, pastel
   clouds, minimal type, luxe circle, neon tilt, candy split,
   elegant frame, retro burst, boho frame). They are resolved
   BEFORE the generic family matcher, so they never affect any
   other category.
   ============================================================ */

type BirthdayFamily = Extract<FamilyKey, `bday-${string}`>;

export const BIRTHDAY_FAMILY_ORDER: BirthdayFamily[] = [
  'bday-princess',
  'bday-luxury',
  'bday-neon',
  'bday-cartoon',
  'bday-space',
  'bday-candy',
  'bday-pastel',
  'bday-retro',
  'bday-boho',
  'bday-minimal',
  'bday-elegant',
  'bday-balloon',
];

const BIRTHDAY_KEYWORDS: Record<BirthdayFamily, string[]> = {
  'bday-princess': ['princess', 'crown', 'castle', 'fairy', 'queen', 'tiara', 'royal'],
  'bday-luxury': ['luxe', 'luxury', 'gold', 'champagne', 'silver', 'emerald', 'vip', 'gala', 'premium', 'midnight', 'soiree'],
  'bday-neon': ['neon', 'cyber', 'glow', 'gaming', 'robot', 'dance', 'k-pop', 'rhythm', 'stage'],
  'bday-cartoon': ['cartoon', 'comic', 'circus', 'pirate', 'train', 'ninja', 'superhero', 'hero', 'racing', 'football', 'basketball', 'soccer', 'slam dunk', 'champion', 'boot camp'],
  'bday-space': ['space', 'galaxy', 'rocket', 'moon', 'starry', 'cosmic', 'astro', 'planet', 'apollo', 'night sky'],
  'bday-candy': ['candy', 'sweet', 'chocolate', 'cupcake', 'ice cream', 'donut', 'dessert', 'confetti', 'mermaid', 'ocean', 'under the sea', 'sea'],
  'bday-pastel': ['pastel', 'unicorn', 'lavender', 'mint', 'peach', 'soft', 'strawberry', 'cloud'],
  'bday-retro': ['retro', '90s', 'vintage', 'cowboy', 'pixel', 'arcade', '8-bit', 'deco', 'rosy'],
  'bday-boho': ['boho', 'bohemian', 'terracotta', 'safari', 'jungle', 'dino', 'dinosaur', 'picnic', 'tangerine', 'sunny', 'explorer', 'tribal', 'wild', 'rainforest'],
  'bday-minimal': ['minimal', 'monochrome', 'line art', 'scandi', 'nordic', 'geometric', 'clean', 'sage & stone', 'black white', 'timeless'],
  'bday-elegant': ['elegant', 'glam', 'floral', 'garden', 'parisian', 'tea', 'seventeen', 'blush', 'cocktail', 'glitter', 'royal ball'],
  'bday-balloon': ['balloon', 'carnival', 'teddy', 'bubble', 'farm', 'zoo', 'puppy', 'kitty', 'bumblebee', 'ladybug', 'honey', 'little dots', 'cuddly'],
};

/* Token-level keyword match. Words are matched exactly so a keyword never
   accidentally hits inside another word (e.g. 'gala' inside 'galaxy', or
   'sea' inside 'season'). Multi-word keywords (e.g. 'sage & stone', 'night
   sky') match when every token is present in the design style. */
const matchKeyword = (designStyle: string, keyword: string): boolean => {
  const tokens = designStyle.toLowerCase().split(/\s+/).filter(Boolean);
  const kw = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  if (kw.length === 1) return tokens.includes(kw[0]);
  return kw.every((t) => tokens.includes(t));
};

const matchBirthdayFamily = (designStyle: string): BirthdayFamily | null => {
  const s = designStyle.toLowerCase();
  for (const family of BIRTHDAY_FAMILY_ORDER) {
    const words = BIRTHDAY_KEYWORDS[family];
    if (words.some((w) => matchKeyword(s, w))) return family;
  }
  return null;
};

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
  // Birthday-only families never match the generic loop (they are not part
  // of FAMILY_ORDER); entries exist only to satisfy the Record type.
  'bday-balloon': BIRTHDAY_KEYWORDS['bday-balloon'],
  'bday-cartoon': BIRTHDAY_KEYWORDS['bday-cartoon'],
  'bday-space': BIRTHDAY_KEYWORDS['bday-space'],
  'bday-princess': BIRTHDAY_KEYWORDS['bday-princess'],
  'bday-pastel': BIRTHDAY_KEYWORDS['bday-pastel'],
  'bday-minimal': BIRTHDAY_KEYWORDS['bday-minimal'],
  'bday-luxury': BIRTHDAY_KEYWORDS['bday-luxury'],
  'bday-neon': BIRTHDAY_KEYWORDS['bday-neon'],
  'bday-candy': BIRTHDAY_KEYWORDS['bday-candy'],
  'bday-elegant': BIRTHDAY_KEYWORDS['bday-elegant'],
  'bday-retro': BIRTHDAY_KEYWORDS['bday-retro'],
  'bday-boho': BIRTHDAY_KEYWORDS['bday-boho'],
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
  if (template.category === 'birthday') {
    const birthdayMatched = matchBirthdayFamily(template.designStyle);
    if (birthdayMatched) return birthdayMatched;
  }
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

/* ---- birthday gallery style: layout keyword overrides, else family default ---- */
const resolveBirthdayGallery = (template: Template, family: FamilyConfig): GalleryStyle => {
  const layout = (template.layoutStyle || '').toLowerCase();
  if (layout.includes('polaroid')) return 'polaroid';
  if (layout.includes('collage')) return 'collage';
  if (layout.includes('masonry') || layout.includes('mosaic')) return 'masonry';
  if (layout.includes('gallery focus')) return 'collage';
  if (layout.includes('card stack') || layout.includes('stack')) return 'stacked';
  if (layout.includes('frame')) return 'framed';
  return family.galleryStyle;
};

export const resolveDesignSystem = (template: Template): DesignResolution => {
  const family = resolveFamily(template);
  // Birthday templates use their own dedicated cover + gallery families so
  // the 100 birthday designs are genuinely distinct compositions.
  if (template.category === 'birthday') {
    return {
      family: FAMILIES[family],
      coverStyle: FAMILIES[family].coverStyle,
      galleryStyle: resolveBirthdayGallery(template, FAMILIES[family]),
    };
  }
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
