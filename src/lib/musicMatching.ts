import type { BaseCategory, CategoryKey } from '../types';
import type { MusicCredit } from '../data/musicCredits';
import { MUSIC_LIBRARY, MusicLibraryTrack } from '../data/musicLibrary';
import { CATEGORY_BASE } from '../data/categoryBase';

// ============================================================================
// Deterministic Music Matching Engine
// Assigns each template a distinct, theme-appropriate royalty-free track from
// the curated library. Selection is a pure function of
// (category, template index, seed keywords) so results are stable across
// builds and two templates never share the same primary song by design.
// Extended categories resolve to a base category's library via CATEGORY_BASE.
// ============================================================================

export interface MusicSeedInfo {
  subcategory: string;
  designStyle: string;
  illustrationStyle: string;
  colorPalette: string;
  fontStyle: string;
}

const CAT_CODE: Record<BaseCategory, string> = {
  birthday: 'b',
  sunatan: 's',
  wedding: 'w',
  aqiqah: 'a',
};

/** Unique per-category number code (used for music credit template numbers). */
const CAT_CODE_ALL: Record<CategoryKey, string> = {
  ...CAT_CODE,
  education: 'e',
  religious: 'r',
  tasyakuran: 't',
  gathering: 'g',
  business: 'u',
  anniversary: 'v',
  family: 'f',
  'doa-haul': 'h',
};

const CODE_TO_CATEGORY: Record<string, CategoryKey> = Object.fromEntries(
  (Object.entries(CAT_CODE_ALL) as [CategoryKey, string][]).map(([k, v]) => [v, k])
);

export const categoryFromCode = (code: string): CategoryKey =>
  CODE_TO_CATEGORY[code] || 'birthday';

const CATEGORY_LABEL: Record<BaseCategory, string> = {
  birthday: 'Birthday',
  sunatan: 'Sunatan',
  wedding: 'Wedding',
  aqiqah: 'Aqiqah',
};

const CATEGORY_LABEL_ALL: Record<CategoryKey, string> = {
  ...CATEGORY_LABEL,
  education: 'Pendidikan',
  religious: 'Keagamaan',
  tasyakuran: 'Tasyakuran',
  gathering: 'Acara & Gathering',
  business: 'Bisnis',
  anniversary: 'Anniversary',
  family: 'Keluarga',
  'doa-haul': 'Doa & Haul',
};

// Stable per-base-category fallback tracks (used when the primary CDN URL
// fails). All point to VERIFIED VOCAL tracks (vocal-first defaults).
export const CATEGORY_FALLBACK: Record<BaseCategory, MusicLibraryTrack> = {
  birthday: MUSIC_LIBRARY.birthday.find((t) => t.uid === '50b8be7252') || MUSIC_LIBRARY.birthday[0],
  sunatan: MUSIC_LIBRARY.sunatan.find((t) => t.uid === 'dd8c111e4f') || MUSIC_LIBRARY.sunatan[0],
  wedding: MUSIC_LIBRARY.wedding.find((t) => t.uid === 'dd8c111e4f') || MUSIC_LIBRARY.wedding[0],
  aqiqah: MUSIC_LIBRARY.aqiqah.find((t) => t.uid === 'dac4531a9d') || MUSIC_LIBRARY.aqiqah[0],
};

type MoodMap = [string[], string][];

const BIRTHDAY_MOOD_MAP: MoodMap = [
  [['space', 'galaxy', 'rocket', 'cosmic', 'apollo', 'astronaut', 'moon landing', 'starry', 'night sky'], 'space'],
  [['superhero', 'hero mission', 'boot camp', 'shield'], 'superhero'],
  [['luxury', 'black gold', 'champagne', 'royal', 'crown', 'vip', 'adult', 'soiree', 'art deco', 'gold luxe', 'glam', 'premium', 'midnight royal', 'queen', 'monarch'], 'luxury'],
  [['sweet seventeen', 'teen', 'k-pop', 'kpop', 'neon', 'gaming', 'retro', 'arcade', 'cyber', 'pixel', 'dance', 'rhythm', 'glow party', 'stage'], 'teen'],
  [['minimal', 'monochrome', 'modern geometric', 'nordic', 'line art', 'black white', 'minimalist', 'sage & stone', 'geometric blocks'], 'chill'],
  [['elegant', 'princess', 'fairy', 'pastel', 'vintage', 'parisian', 'silver', 'ivory', 'floral', 'garden', 'lavender'], 'elegant'],
  [['cute kids', 'cartoon', 'circus', 'teddy', 'puppy', 'kitty', 'cuddly', 'bubble', 'cloud', 'cute', 'kids', 'farm', 'zoo', 'train', 'bumblebee', 'ladybug', 'pancake', 'unicorn'], 'kids'],
  [['confetti', 'candy', 'colorful', 'party', 'celebration', 'balloon', 'dessert', 'donut', 'cupcake', 'ice cream', 'pancake breakfast', 'sweet bar', 'scoops', 'sprinkle'], 'celebration'],
  [['ukulele', 'safari', 'jungle', 'dino', 'ocean', 'adventure', 'racing', 'football', 'basketball', 'pirate', 'cowboy', 'roar', 'trex', 'wild', 'explorer', 'map quest'], 'party'],
];

const SUNATAN_MOOD_MAP: MoodMap = [
  [['nasheed', 'nasyid', 'kasidah'], 'nasheed'],
  [['sholawat', 'selawat', 'maulid'], 'sholawat'],
  [['ramadan'], 'ramadan'],
  [['arabesque', 'oud', 'kufi', 'calligraphy', 'arabic'], 'arabic'],
  [['meditat'], 'meditation'],
  [['peaceful', 'calm', 'earth', 'sage', 'muted', 'minimal', 'dusty', 'serene', 'gentle', 'tranquil', 'silver', 'mist', 'steel', 'taupe', 'beige', 'cream'], 'peaceful'],
  [['cute', 'kids', 'akhwat', 'hafiz', 'santri', 'baby', 'little', 'boy'], 'islamic'],
];

const WEDDING_MOOD_MAP: MoodMap = [
  [['nasheed', 'nasyid', 'kasidah', 'sholawat', 'selawat', 'maulid'], 'nasheed'],
  [['akad', 'nikah', 'mahr', 'halal', 'sacred', 'masjid', 'quran', 'islamic'], 'islamic'],
  [['cinematic', 'trailer', 'noir', 'editorial'], 'cinematic'],
  [['vow', 'vows', 'blessing'], 'vow'],
  [['garden', 'botanical', 'floral', 'rose', 'peony', 'bloom', 'blush', 'wildflower', 'eucalyptus', 'fern', 'olive', 'jungle', 'forest', 'sakura', 'cherry', 'courtyard'], 'garden'],
  [['guitar', 'acoustic', 'rustic', 'barn', 'country', 'vineyard', 'boho', 'bohemian', 'terracotta', 'clay', 'wood', 'warm', 'neutral'], 'acoustic'],
  [['violin', 'strings', 'quartet'], 'quartet'],
  [['classical', 'royal', 'heritage', 'traditional', 'javanese', 'sundanese', 'balinese', 'oriental', 'adat', 'canang', 'keraton', 'batik'], 'classical'],
  [['piano'], 'piano'],
  [['romantic', 'romance', 'love', 'forever', 'soul', 'enchant', 'dream', 'pastel', 'lavender', 'soft', 'sweet', 'heart', 'first dance', 'waltz', 'dance'], 'romantic'],
  [['minimal', 'modern', 'urban', 'glass', 'rooftop', 'marquee', 'quiet'], 'classic'],
  [['classic', 'ivory', 'timeless', 'silk', 'lace', 'royal'], 'classic'],
  [['invitation'], 'invitation'],
];

const AQIQAH_MOOD_MAP: MoodMap = [
  [['nasheed', 'nasyid', 'kasidah', 'sholawat', 'selawat', 'maulid'], 'nasheed'],
  [['islamic', 'mubarak', 'bismillah', 'alhamdulillah', 'barakallahu', 'masjid', 'quran', 'muhammad'], 'islamic'],
  [['music box', 'musicbox'], 'musicbox'],
  [['sleep', 'slumber', 'sleepy'], 'sleep'],
  [['bedtime', 'cradle', 'night', 'moon', 'star', 'celestial', 'lunar', 'crescent', 'moonlight', 'new moon', 'moonbeam'], 'lullaby'],
  [['harp'], 'harp'],
  [['piano', 'waltz', 'marimba'], 'piano'],
  [['animal', 'safari', 'bunny', 'duck', 'penguin', 'elephant', 'giraffe', 'lion', 'monkey', 'zebra', 'koala', 'panda', 'fox', 'hedgehog', 'owl', 'camel', 'lamb', 'sheep', 'frog', 'turtle', 'bee', 'butterfly', 'ladybug', 'rainbow', 'cartoon', 'play', 'cherub', 'angel'], 'fun'],
  [['baby', 'joy', 'smile', 'happy', 'sweet', 'cute', 'little', 'princess', 'prince', 'boy', 'girl', 'cloud', 'beige', 'cream', 'watercolor', 'botanical', 'floral', 'minimal', 'elegant', 'luxury', 'neutral', 'pastel', 'dusty', 'sage', 'gold'], 'baby'],
];

const MOOD_MAPS: Record<BaseCategory, MoodMap> = {
  birthday: BIRTHDAY_MOOD_MAP,
  sunatan: SUNATAN_MOOD_MAP,
  wedding: WEDDING_MOOD_MAP,
  aqiqah: AQIQAH_MOOD_MAP,
};

const DEFAULT_MOOD: Record<BaseCategory, string> = {
  birthday: 'classic',
  sunatan: 'islamic',
  wedding: 'classic',
  aqiqah: 'lullaby',
};

const MOOD_ORDER: Record<BaseCategory, string[]> = {
  birthday: ['classic', 'party', 'celebration', 'kids', 'cartoon', 'ukulele', 'space', 'superhero', 'teen', 'elegant', 'luxury', 'chill'],
  sunatan: ['islamic', 'nasheed', 'sholawat', 'oud', 'arabic', 'ramadan', 'peaceful', 'meditation'],
  wedding: ['nasheed', 'islamic', 'sholawat', 'classic', 'invitation', 'romantic', 'garden', 'vow', 'piano', 'cinematic', 'classical', 'violin', 'quartet', 'guitar', 'acoustic'],
  aqiqah: ['nasheed', 'islamic', 'sholawat', 'lullaby', 'sleep', 'musicbox', 'baby', 'joy', 'fun', 'kids', 'bedtime', 'harp', 'piano'],
};

// Pads for under-filled mood buckets: maps "category:mood" to extra track uids
// (thematically similar) so templates sharing a mood still get variety.
const MOOD_PAD: Record<string, string[]> = {
  'birthday:elegant': ['02350d0b40', 'a86e69ef53', '429183e8a8', '149ff2322e'],
  'birthday:luxury': ['98a696b5b6', '8accbed1d8', '1b3e3cc9ad', '149ff2322e'],
  'birthday:party': ['e503e9f89d', '9fcc67a1bd', 'ba804c0e65', 'f588af54f9', 'd027b24196', 'b03fa2a854', '50b8be7252', 'fcf5f8226e'],
  'birthday:teen': ['98a696b5b6', '8accbed1d8', '1b3e3cc9ad', '02350d0b40'],
  'birthday:kids': ['54d51848f2', 'f588af54f9', 'd027b24196', 'b03fa2a854'],
  'birthday:chill': ['98a696b5b6', '8accbed1d8', '02350d0b40', 'a86e69ef53', '149ff2322e'],
  'birthday:celebration': ['7a6053b089', 'ddf4c7fa19', '09b27a2efd', '6da439aaa3', '50b8be7252', 'fcf5f8226e'],
  'birthday:cartoon': ['09b27a2efd', 'd97c2fe0b2', '6da439aaa3', '3514f2839f'],
  'birthday:ukulele': ['09b27a2efd', '6da439aaa3', '54d51848f2'],
  'birthday:classic': ['50b8be7252', 'fcf5f8226e', '7a6053b089'],
  'sunatan:islamic': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280', '042d96ae90', 'd94b433e13'],
  'sunatan:peaceful': ['dd8c111e4f', 'c0dc9d705e', '59df543075', '40e0bb0280', '5d8acace89'],
  'sunatan:arabic': ['18705cfc80', '741747d721', '4f93d8fa9e', '6079008e3c', 'ac12e9e274', '65bda5b344'],
  'sunatan:meditation': ['2dde19dc8c', '4f355eb79a', 'ffd97835d0', 'ca195bfc5a', 'a42fd27866', '83beb192b3', '093829151b'],
  'sunatan:nasheed': ['dac4531a9d', 'e5d0cc98f0', '40e0bb0280', 'e005adb72f', '042d96ae90', '47e3414fbe', '5d8acace89', 'a8c52cd2b3', 'd94b433e13'],
  'sunatan:oud': ['28092e9148', '66a8279bac', '741747d721', '4f93d8fa9e'],
  'sunatan:ramadan': ['28092e9148', '66a8279bac', '18705cfc80', '4f93d8fa9e', 'ac12e9e274'],
  'sunatan:sholawat': ['dd8c111e4f', '40e0bb0280', 'e005adb72f', '042d96ae90', '47e3414fbe'],
  'wedding:islamic': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280', '042d96ae90', '47e3414fbe', '2dbecfdf47', 'd94b433e13', '0801799199', 'fccb4d08a4'],
  'wedding:nasheed': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280', '042d96ae90', 'd94b433e13', '2dbecfdf47', '0801799199'],
  'wedding:sholawat': ['dd8c111e4f', 'e5d0cc98f0', '40e0bb0280', '042d96ae90', '47e3414fbe', '0801799199', '2dbecfdf47'],
  'wedding:classic': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280'],
  'wedding:garden': ['07f944e159', '3778bc034f', '64ca14daf2', '836ab9d11c', 'f61a36c81f', '29bd9fc383', '1c144e932f', 'c035596642', '611c21af8a'],
  'wedding:vow': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', 'f61a36c81f', '29bd9fc383', '3fcffb7ea4', '220e4005ce', '1c144e932f', '3778bc034f', '64ca14daf2', '836ab9d11c'],
  'wedding:romantic': ['f61a36c81f', '29bd9fc383', '3fcffb7ea4', '7946e652ae', '220e4005ce', '1c144e932f', '07f944e159'],
  'wedding:classical': ['ce1bfb9678', 'd1cb1fa724', 'df3851f70a', '5301fb9081', '6be1394f9e', '19f8a1893f'],
  'wedding:cinematic': ['eb01fd9b45', 'bc5cc02744', 'fcc3b1e47c', '5205788b95', 'ce1bfb9678', 'd1cb1fa724'],
  'wedding:acoustic': ['611c21af8a', 'e7b528bf5a', '3778bc034f', '64ca14daf2', '836ab9d11c'],
  'wedding:piano': ['3778bc034f', '64ca14daf2', '836ab9d11c', '07f944e159'],
  'wedding:violin': ['ce1bfb9678', 'd1cb1fa724', 'df3851f70a', 'eb01fd9b45'],
  'wedding:guitar': ['48906d7fa0', '3217c7a2fe', '3778bc034f', '64ca14daf2'],
  'wedding:quartet': ['eb01fd9b45', 'bc5cc02744', 'fcc3b1e47c', '5205788b95'],
  'wedding:invitation': ['3778bc034f', '836ab9d11c', '07f944e159'],
  'aqiqah:nasheed': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280', '0801799199', '2dbecfdf47'],
  'aqiqah:islamic': ['dd8c111e4f', 'dac4531a9d', 'e5d0cc98f0', '40e0bb0280', '0801799199', '2dbecfdf47'],
  'aqiqah:baby': ['234c9b05d8', '01970e2ea8', 'f69b80b4e7', 'beaf0b99b5', '558dfb97db', '645a5a8897', 'dd8c111e4f', 'dac4531a9d'],
  'aqiqah:fun': ['234c9b05d8', '01970e2ea8', 'f69b80b4e7', 'beaf0b99b5', '352e040c19', 'b816f864f0'],
  'aqiqah:lullaby': ['79142a6adb', '192268d154', '7a25764d74', 'e7070220f5', '29bd11e39b', '053869ff09', 'dd8c111e4f', 'dac4531a9d'],
  'aqiqah:joy': ['85358047c2', 'ae2dedfeae', '01970e2ea8', '352e040c19', 'b816f864f0'],
  'aqiqah:kids': ['85358047c2', 'ae2dedfeae', '352e040c19', 'b816f864f0'],
  'aqiqah:musicbox': ['558dfb97db', '645a5a8897', '86a442c94d', '79142a6adb'],
  'aqiqah:bedtime': ['79142a6adb', 'e7070220f5', 'dd8c111e4f', '40e0bb0280'],
  'aqiqah:sleep': ['dd8c111e4f', 'dac4531a9d', '40e0bb0280'],
  'aqiqah:harp': ['558dfb97db', '645a5a8897', '86a442c94d', '79142a6adb'],
  'aqiqah:piano': ['352e040c19', 'b816f864f0', '234c9b05d8'],
};

const CATEGORY_OFFSET: Record<BaseCategory, number> = {
  birthday: 3,
  sunatan: 5,
  wedding: 7,
  aqiqah: 11,
};

const pickMood = (base: BaseCategory, seedInfo: MusicSeedInfo, index: number): string => {
  const haystack = [
    seedInfo.subcategory,
    seedInfo.designStyle,
    seedInfo.illustrationStyle,
    seedInfo.colorPalette,
  ]
    .join(' ')
    .toLowerCase();

  const moodMap = MOOD_MAPS[base];
  for (const [keywords, mood] of moodMap) {
    if (keywords.some((k) => haystack.includes(k))) return mood;
  }

  const order = MOOD_ORDER[base];
  return order[(index * 5 + 2) % order.length];
};

export const getTemplateMusic = (
  category: CategoryKey,
  index: number,
  seedInfo: MusicSeedInfo
): MusicCredit => {
  const base = CATEGORY_BASE[category];
  const pool = MUSIC_LIBRARY[base];
  const mood = pickMood(base, seedInfo, index);
  const bucket = pool.filter((t) => t.mood === mood);
  const pad = (MOOD_PAD[`${base}:${mood}`] ?? [])
    .map((uid) => pool.find((t) => t.uid === uid))
    .filter((t): t is MusicLibraryTrack => Boolean(t) && !bucket.some((b) => b.uid === t.uid));
  const candidates = bucket.length > 0 ? [...bucket, ...pad] : pool;
  const offset = CATEGORY_OFFSET[base];

  // ---- Vocal-first selection ---------------------------------------------
  // Wedding / Sunatan / Aqiqah (and their derived categories) prioritize
  // Islamic vocal music (nasheed / sholawat); Birthday-derived categories
  // prioritize cheerful vocal tracks. When at least two vocal tracks are
  // available the primary pool is vocal-only, so templates stay vocal WITHOUT
  // falling back to a single shared song (variety kept by index rotation). With
  // exactly one vocal track it is mixed into the pool so it still appears
  // regularly while preserving overall variety.
  const isIslamic = base !== 'birthday';
  const vocal = candidates.filter(
    (t) => t.isVocal && (isIslamic ? t.genre === 'Nasheed' || t.genre === 'Sholawat' || t.genre === 'Islamic' : true)
  );
  const finalCandidates = vocal.length >= 2
    ? vocal
    : vocal.length === 1
      ? [vocal[0], vocal[0], ...candidates.filter((t) => t.uid !== vocal[0].uid)]
      : candidates;

  const track = finalCandidates[(index * 13 + offset) % finalCandidates.length];
  const alternative = finalCandidates[(index * 13 + offset + 7) % finalCandidates.length];
  const fallback =
    alternative && alternative.uid !== track.uid ? alternative : CATEGORY_FALLBACK[base];
  const num = String(index + 1).padStart(3, '0');

  return {
    templateNumber: `${CAT_CODE_ALL[category]}${num}`,
    musicTitle: track.title,
    artist: track.artist,
    category: CATEGORY_LABEL_ALL[category],
    source: track.source,
    sourceUrl: `https://pixabay.com${track.href}`,
    license: track.license,
    licenseUrl: track.licenseUrl,
    attributionRequired: false,
    attributionText: `Music by ${track.artist} from Pixabay`,
    moodTags: [track.mood],
    musicUrl: track.url,
    fallbackUrl: fallback.url,
    musicVolume: 0.6,
    musicAutoplay: true,
    musicLoop: true,
    musicMood: track.mood,
    durationSec: track.durationSec,
    // Sensible default intro-skip so guests land on the song's core (vocal)
    // section instead of long ambience. The admin can override via the
    // editor's "MULAI MUSIK DARI" picker.
    startTime: track.durationSec >= 60 ? (track.isVocal ? 15 : 30) : 0,
    musicGenre: track.genre,
    musicIsVocal: track.isVocal,
    musicLanguage: track.language,
    musicDescription: track.description,
    alternativeMusic: {
      title: fallback.title,
      artist: fallback.artist,
      url: fallback.url,
    },
  };
};
