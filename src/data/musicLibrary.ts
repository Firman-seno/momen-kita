// ============================================================================
// Music Library — Curated royalty-free tracks (all URLs verified HTTP 200)
// Sourced from Pixabay Music (Pixabay Content License, commercial use allowed)
// Every URL below was curl-verified. Do NOT add unreachable URLs.
//
// Schema v2 adds per-track metadata used by the admin music editor and the
// vocal-first matching engine:
//   - genre      : filterable genre bucket (Nasheed / Sholawat / Islamic /
//                  Happy / Kids / Pop / Romantic / Elegant / Classical /
//                  Chill / Lullaby / Acoustic / Epic / Arabic)
//   - isVocal    : true when the track contains singing/lyrics (nasheed,
//                  sholawat, sung Happy Birthday, …). Vocal tracks are
//                  preferred as default invitation music.
//   - language   : sung language, or "Instrumental" for no-vocal tracks
//   - description: one-line human description for admin display
//   - licenseUrl : link to the Pixabay license summary
// ============================================================================

import type { CategoryKey } from '../types';

export type TrackGenre =
  | 'Nasheed'
  | 'Sholawat'
  | 'Islamic'
  | 'Happy'
  | 'Kids'
  | 'Pop'
  | 'Romantic'
  | 'Elegant'
  | 'Classical'
  | 'Chill'
  | 'Lullaby'
  | 'Acoustic'
  | 'Epic'
  | 'Arabic';

export const TRACK_GENRES: TrackGenre[] = [
  'Nasheed',
  'Sholawat',
  'Islamic',
  'Happy',
  'Kids',
  'Pop',
  'Romantic',
  'Elegant',
  'Classical',
  'Chill',
  'Lullaby',
  'Acoustic',
  'Epic',
  'Arabic',
];

export interface MusicLibraryTrack {
  uid: string;          // stable track id (from Pixabay audio filename)
  title: string;
  artist: string;
  url: string;          // CDN mp3 (primary)
  href: string;         // Pixabay page path (for sourceUrl)
  source: string;
  license: string;
  licenseUrl: string;
  mood: string;         // mood bucket used by the matching engine
  durationSec: number;
  genre: TrackGenre;
  isVocal: boolean;
  language: string;
  description: string;
}

const SOURCE = 'Pixabay Music';
const LICENSE = 'Pixabay Content License (Commercial Use Allowed)';
const LICENSE_URL = 'https://pixabay.com/service/license-summary/';

// ---------------------------------------------------------------------------
// Metadata derivation. Vocal / Islamic tracks are pinned explicitly in
// META_OVERRIDES; everything else is derived from its mood bucket.
// ---------------------------------------------------------------------------
const META_OVERRIDES: Record<
  string,
  { genre: TrackGenre; isVocal: boolean; language: string; description: string }
> = {
  // --- Sung "Happy Birthday" / vocal pop ---
  '50b8be7252': {
    genre: 'Happy',
    isVocal: true,
    language: 'English',
    description: 'Happy Birthday meriah dengan lirik & vokal (STAROSTIN).',
  },
  fcf5f8226e: {
    genre: 'Happy',
    isVocal: true,
    language: 'English',
    description: 'Happy Birthday versi nyanyian grup akustik.',
  },
  '1d64e97129': {
    genre: 'Pop',
    isVocal: false,
    language: 'English',
    description: 'Lagu pop remaja ringan (Goodbye Seventeen).',
  },
  '149ff2322e': {
    genre: 'Pop',
    isVocal: false,
    language: 'English',
    description: 'Nuansa pop manis & santai (Sweet).',
  },

  // --- Sholawat (sung Islamic praise) ---
  dac4531a9d: {
    genre: 'Sholawat',
    isVocal: true,
    language: 'Indonesia',
    description: 'Sholawat Nabi dengan vokal — pujian untuk Rasulullah.',
  },
  e5d0cc98f0: {
    genre: 'Sholawat',
    isVocal: true,
    language: 'Indonesia',
    description: 'Sholawat Badar dengan vokal — lagu religi Islami.',
  },

  // --- Nasheed (sung Islamic vocals) ---
  dd8c111e4f: {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed islami tenang dengan vokal (Peaceful Reflection).',
  },
  '40e0bb0280': {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed islami latar dengan vokal (Islamic Background).',
  },
  e005adb72f: {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal bertema islami & Qur\'an.',
  },
  '042d96ae90': {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal koor (choir) bertema islami.',
  },
  '47e3414fbe': {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal koor — latar islami khusyuk.',
  },
  '5d8acace89': {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal ambient bertema islami.',
  },
  a8c52cd2b3: {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal pendek (choir) untuk momen sakral.',
  },
  d94b433e13: {
    genre: 'Nasheed',
    isVocal: true,
    language: 'Arabic',
    description: 'Nasheed vokal pop bertema islami (Boundless Grace).',
  },

  // --- Islamic (sung, lighter vocal / instrumental mix) ---
  '2dbecfdf47': {
    genre: 'Islamic',
    isVocal: true,
    language: 'Arabic',
    description: 'Musik islami dengan vokal (Sacred Echo by Makrifat Islam).',
  },
  '0801799199': {
    genre: 'Islamic',
    isVocal: true,
    language: 'Arabic',
    description: 'Musik islami bernuansa vokal (Path to Jannah).',
  },
};

interface BaseTrack {
  uid: string;
  title: string;
  artist: string;
  url: string;
  href: string;
  mood: string;
  durationSec: number;
}

const GENRE_FOR_MOOD: Record<string, TrackGenre> = {
  nasheed: 'Nasheed',
  sholawat: 'Sholawat',
  islamic: 'Islamic',
  arabic: 'Arabic',
  ramadan: 'Islamic',
  oud: 'Arabic',
  lullaby: 'Lullaby',
  sleep: 'Lullaby',
  musicbox: 'Lullaby',
  bedtime: 'Lullaby',
  harp: 'Lullaby',
  kids: 'Kids',
  cartoon: 'Kids',
  baby: 'Kids',
  joy: 'Kids',
  fun: 'Kids',
  classic: 'Happy',
  celebration: 'Happy',
  party: 'Happy',
  ukulele: 'Happy',
  teen: 'Pop',
  elegant: 'Elegant',
  luxury: 'Elegant',
  chill: 'Chill',
  piano: 'Romantic',
  romantic: 'Romantic',
  vow: 'Romantic',
  invitation: 'Romantic',
  garden: 'Romantic',
  acoustic: 'Acoustic',
  guitar: 'Acoustic',
  classical: 'Classical',
  violin: 'Classical',
  quartet: 'Classical',
  cinematic: 'Classical',
  space: 'Epic',
  superhero: 'Epic',
};

const defaultMeta = (t: BaseTrack): { genre: TrackGenre; isVocal: boolean; language: string; description: string } => {
  const genre = GENRE_FOR_MOOD[t.mood] || 'Elegant';
  const isVocal = genre === 'Nasheed' || genre === 'Sholawat';
  const language =
    genre === 'Nasheed'
      ? 'Arabic'
      : genre === 'Sholawat'
        ? 'Indonesia'
        : genre === 'Islamic' || genre === 'Arabic'
          ? 'Arabic'
          : isVocal
            ? 'English'
            : 'Instrumental';
  const description = `${genre} royalty-free by ${t.artist} (Pixabay).`;
  return { genre, isVocal, language, description };
};

const tr = (
  uid: string,
  title: string,
  artist: string,
  url: string,
  href: string,
  mood: string,
  durationSec: number
): MusicLibraryTrack => {
  const base: BaseTrack = { uid, title, artist, url, href, mood, durationSec };
  const meta = META_OVERRIDES[uid] || defaultMeta(base);
  return {
    uid,
    title,
    artist,
    url,
    href,
    source: SOURCE,
    license: LICENSE,
    licenseUrl: LICENSE_URL,
    mood,
    durationSec,
    genre: meta.genre,
    isVocal: meta.isVocal,
    language: meta.language,
    description: meta.description,
  };
};

export const MUSIC_LIBRARY: Record<CategoryKey, MusicLibraryTrack[]> = {

  birthday: [
    tr('96e671dd5f', 'Happy Birthday', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/07/29/audio_96e671dd5f.mp3', '/music/happy-childrens-tunes-happy-birthday-576570/', 'classic', 123),
    tr('5c3142a0f6', 'Happy Birthday', 'Sub_Clair', 'https://cdn.pixabay.com/audio/2026/08/03/audio_5c3142a0f6.mp3', '/music/happy-childrens-tunes-happy-birthday-579516/', 'classic', 46),
    tr('01c1f036e3', 'Happy Birthday Music', 'AbsoluteSound', 'https://cdn.pixabay.com/audio/2026/07/08/audio_01c1f036e3.mp3', '/music/happy-childrens-tunes-happy-birthday-music-563837/', 'classic', 99),
    tr('7a6053b089', 'Happy Birthday Party BGM', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/03/audio_7a6053b089.mp3', '/music/happy-childrens-tunes-happy-birthday-party-bgm-579467/', 'party', 39),
    tr('e503e9f89d', 'Birthday Celebration Tune', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/03/audio_e503e9f89d.mp3', '/music/introoutro-birthday-celebration-tune-579468/', 'celebration', 59),
    tr('50b8be7252', 'Happy Birthday (Vocal)', 'STAROSTIN', 'https://cdn.pixabay.com/audio/2025/06/09/audio_50b8be7252.mp3', '/music/special-occasions-happy-birthday-357371/', 'celebration', 123),
    tr('fcf5f8226e', 'Happy Birthday (Acoustic Group)', 'andriig', 'https://cdn.pixabay.com/audio/2026/01/22/audio_fcf5f8226e.mp3', '/music/acoustic-group-happy-birthday-471211/', 'party', 125),
    tr('ddf4c7fa19', 'Party - Party Music', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/03/24/audio_ddf4c7fa19.mp3', '/music/electronic-party-party-music-508031/', 'party', 104),
    tr('9fcc67a1bd', 'Celebration Music Celebration', 'AudioDollar', 'https://cdn.pixabay.com/audio/2026/03/25/audio_9fcc67a1bd.mp3', '/music/rock-celebration-music-celebration-508528/', 'celebration', 130),
    tr('ba804c0e65', 'Confetti', 'EchoGateStudios', 'https://cdn.pixabay.com/audio/2025/12/16/audio_ba804c0e65.mp3', '/music/upbeat-confetti-449785/', 'celebration', 131),
    tr('09b27a2efd', 'Kids - Kids Music', 'AtlasAudio', 'https://cdn.pixabay.com/audio/2026/07/30/audio_09b27a2efd.mp3', '/music/happy-childrens-tunes-kids-kids-music-576643/', 'kids', 143),
    tr('d97c2fe0b2', 'Happy Cute Kids', 'MondaMusic', 'https://cdn.pixabay.com/audio/2026/07/06/audio_d97c2fe0b2.mp3', '/music/happy-childrens-tunes-happy-cute-kids-560127/', 'kids', 129),
    tr('54d51848f2', 'Kids Cartoon', 'FreeMusicForVideo', 'https://cdn.pixabay.com/audio/2026/03/19/audio_54d51848f2.mp3', '/music/reggae-kids-cartoon-504887/', 'cartoon', 137),
    tr('6da439aaa3', 'Kids Background Music', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/03/audio_6da439aaa3.mp3', '/music/happy-childrens-tunes-kids-background-music-579469/', 'kids', 67),
    tr('f588af54f9', 'Happy Ukulele', 'bearstockmusic', 'https://cdn.pixabay.com/audio/2026/08/01/audio_f588af54f9.mp3', '/music/happy-childrens-tunes-happy-ukulele-578167/', 'ukulele', 131),
    tr('d027b24196', 'Fun Happy Ukulele', 'PaulYudin', 'https://cdn.pixabay.com/audio/2022/06/16/audio_d027b24196.mp3', '/music/happy-childrens-tunes-fun-happy-ukulele-113443/', 'ukulele', 148),
    tr('b03fa2a854', 'Happy Ukulele In Nature', 'AbsoluteSound', 'https://cdn.pixabay.com/audio/2026/03/29/audio_b03fa2a854.mp3', '/music/island-happy-ukulele-in-nature-510767/', 'ukulele', 87),
    tr('515c5b24a2', 'Space Fantasy -Part 1 - Symphonic Adventure Music', 'JuliusH', 'https://cdn.pixabay.com/audio/2025/11/02/audio_515c5b24a2.mp3', '/music/synthwave-space-fantasy-part-1-symphonic-adventure-music-430173/', 'space', 226),
    tr('530f64a504', 'Space Fantasy -Part 2 - Symphonic Adventure Music', 'JuliusH', 'https://cdn.pixabay.com/audio/2025/11/02/audio_530f64a504.mp3', '/music/main-title-space-fantasy-part-2-symphonic-adventure-music-430174/', 'space', 208),
    tr('f44f8bf3a5', 'Cinematic Space', 'leberch', 'https://cdn.pixabay.com/audio/2026/03/29/audio_f44f8bf3a5.mp3', '/music/meditationspiritual-cinematic-space-510707/', 'space', 238),
    tr('a066dc2bb4', 'Superhero to the Rescue', 'geoffharvey', 'https://cdn.pixabay.com/audio/2025/04/22/audio_a066dc2bb4.mp3', '/music/main-title-superhero-to-the-rescue-330945/', 'superhero', 146),
    tr('bb86b2b310', 'Hero Marvel Superhero Music', 'MFCC', 'https://cdn.pixabay.com/audio/2025/06/04/audio_bb86b2b310.mp3', '/music/main-title-hero-marvel-superhero-music-354045/', 'superhero', 153),
    tr('ffbb27c60a', 'We Need a Superhero', 'geoffharvey', 'https://cdn.pixabay.com/audio/2023/02/20/audio_ffbb27c60a.mp3', '/music/main-title-we-need-a-superhero-139997/', 'superhero', 118),
    tr('149ff2322e', 'Sweet', 'AtlasAudio', 'https://cdn.pixabay.com/audio/2026/04/01/audio_149ff2322e.mp3', '/music/modern-classical-sweet-512262/', 'teen', 124),
    tr('1d64e97129', 'Goodbye Seventeen', 'AiCanvas', 'https://cdn.pixabay.com/audio/2025/12/12/audio_1d64e97129.mp3', '/music/pop-goodbye-seventeen-450562/', 'teen', 94),
    tr('429183e8a8', 'A Sweet Romance', 'alanajordan', 'https://cdn.pixabay.com/audio/2024/09/29/audio_429183e8a8.mp3', '/music/solo-piano-a-sweet-romance-245694/', 'teen', 156),
    tr('98a696b5b6', 'Sweet Dreams - Piano', 'eritnhut1992', 'https://cdn.pixabay.com/audio/2024/07/08/audio_98a696b5b6.mp3', '/music/modern-classical-sweet-dreams-piano-222990/', 'elegant', 240),
    tr('8accbed1d8', 'Elegant Piano', 'leberch', 'https://cdn.pixabay.com/audio/2024/11/11/audio_8accbed1d8.mp3', '/music/modern-classical-elegant-piano-262898/', 'elegant', 142),
    tr('02350d0b40', 'Elegant Luxury Music', 'andriih', 'https://cdn.pixabay.com/audio/2026/07/21/audio_02350d0b40.mp3', '/music/traditional-jazz-elegant-luxury-music-571634/', 'luxury', 129),
    tr('1b3e3cc9ad', 'Chill', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/07/06/audio_1b3e3cc9ad.mp3', '/music/beats-chill-562620/', 'chill', 112),
    tr('a86e69ef53', 'Sweet Life (Luxury Chill)', 'AlexGrohl', 'https://cdn.pixabay.com/audio/2025/11/17/audio_a86e69ef53.mp3', '/music/beats-sweet-life-luxury-chill-438146/', 'luxury', 102),
    tr('bb030c4d5a', 'Happy Piano Cheerful Music', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/10/audio_bb030c4d5a.mp3', '/music/small-drama-happy-piano-cheerful-music-583264/', 'kids', 118),
    tr('3514f2839f', 'Happy Kids Upbeat Corporate', 'yourtunes', 'https://cdn.pixabay.com/audio/2024/05/14/audio_3514f2839f.mp3', '/music/happy-childrens-tunes-happy-kids-upbeat-corporate-209130/', 'kids', 128),
  ],
  sunatan: [
    tr('4f93d8fa9e', 'Islamic - Islamic Music', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/09/audio_4f93d8fa9e.mp3', '/music/arabic-islamic-islamic-music-545510/', 'islamic', 133),
    tr('6079008e3c', 'Islamic - Islamic Music', 'NastelBom', 'https://cdn.pixabay.com/audio/2026/02/22/audio_6079008e3c.mp3', '/music/arabic-islamic-islamic-music-489179/', 'islamic', 110),
    tr('6640257fcd', 'Islamic - Islamic Music 2', 'NastelBom', 'https://cdn.pixabay.com/audio/2026/01/18/audio_6640257fcd.mp3', '/music/world-islamic-islamic-music-2-468513/', 'islamic', 107),
    tr('636e6bd554', 'Islamic', 'The_Mountain', 'https://cdn.pixabay.com/audio/2025/03/06/audio_636e6bd554.mp3', '/music/world-islamic-310138/', 'islamic', 120),
    tr('dd8c111e4f', 'Islamic Nasheed Peaceful Reflection', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_dd8c111e4f.mp3', '/music/arabic-islamic-nasheed-peaceful-reflection-573946/', 'nasheed', 153),
    tr('ac12e9e274', 'Arabic Islam Islamic Music', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/09/audio_ac12e9e274.mp3', '/music/arabic-arabic-islam-islamic-music-545530/', 'islamic', 167),
    tr('dac4531a9d', 'Sholawat Nabi', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_dac4531a9d.mp3', '/music/pop-sholawat-nabi-320899/', 'sholawat', 158),
    tr('e5d0cc98f0', 'Sholawat Badar', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_e5d0cc98f0.mp3', '/music/pop-sholawat-badar-320888/', 'sholawat', 152),
    tr('40e0bb0280', 'Nasheed Islamic Background', 'SufiSama99', 'https://cdn.pixabay.com/audio/2023/01/14/audio_40e0bb0280.mp3', '/music/ambient-nasheed-islamic-background-133345/', 'nasheed', 391),
    tr('e005adb72f', 'Nasheed', 'abdul2025', 'https://cdn.pixabay.com/audio/2025/11/07/audio_e005adb72f.mp3', '/music/world-nasheed-432919/', 'nasheed', 160),
    tr('042d96ae90', 'Copyright Free Background Nasheed 60', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_042d96ae90.mp3', '/music/choir-copyright-free-background-nasheed-60-499769/', 'nasheed', 105),
    tr('47e3414fbe', 'Background Nasheed 37', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_47e3414fbe.mp3', '/music/choir-background-nasheed-37-499777/', 'nasheed', 91),
    tr('5d8acace89', 'Background Nasheed 27', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_5d8acace89.mp3', '/music/ambient-background-nasheed-27-499783/', 'nasheed', 94),
    tr('a8c52cd2b3', 'Background Nasheed 25', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_a8c52cd2b3.mp3', '/music/choir-background-nasheed-25-499776/', 'nasheed', 51),
    tr('2dbecfdf47', 'Sacred Echo by Makrifat Islam', 'makrifatzamannow', 'https://cdn.pixabay.com/audio/2025/08/12/audio_2dbecfdf47.mp3', '/music/pop-sacred-echo-by-makrifat-islam-388776/', 'islamic', 224),
    tr('d94b433e13', 'Boundless Grace', 'bineleyas', 'https://cdn.pixabay.com/audio/2025/03/23/audio_d94b433e13.mp3', '/music/pop-boundless-grace-317825/', 'nasheed', 201),
    tr('0801799199', 'Path to Jannah', 'abdul2025', 'https://cdn.pixabay.com/audio/2025/10/24/audio_0801799199.mp3', '/music/world-path-to-jannah-425563/', 'islamic', 156),
    tr('fccb4d08a4', 'Arabic Islamic Music', 'lkoliks', 'https://cdn.pixabay.com/audio/2025/06/16/audio_fccb4d08a4.mp3', '/music/world-arabic-islamic-islam-music-360770/', 'islamic', 129),
    tr('1031533094', 'islamic Music', 'DesiFreeMusic', 'https://cdn.pixabay.com/audio/2024/09/12/audio_1031533094.mp3', '/music/world-islamic-music-240169/', 'islamic', 133),
    tr('37e98ed678', 'Kurban - Islamic music background', 'Pocketbeats', 'https://cdn.pixabay.com/audio/2025/05/04/audio_37e98ed678.mp3', '/music/pop-kurban-islamic-music-background-336564/', 'islamic', 105),
    tr('18705cfc80', 'Arabic Desert Oud Journey', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_18705cfc80.mp3', '/music/arabic-arabic-desert-oud-journey-573650/', 'oud', 142),
    tr('28092e9148', 'Arabic - Arabic Music', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/07/29/audio_28092e9148.mp3', '/music/arabic-arabic-arabic-music-576560/', 'arabic', 115),
    tr('66a8279bac', 'Arabic Music', 'BFCMUSIC', 'https://cdn.pixabay.com/audio/2026/05/04/audio_66a8279bac.mp3', '/music/arabic-arabic-music-529316/', 'arabic', 59),
    tr('741747d721', 'Arabic Music - Ramadan', 'BFCMUSIC', 'https://cdn.pixabay.com/audio/2026/05/19/audio_741747d721.mp3', '/music/arabic-arabic-music-ramadan-536684/', 'ramadan', 94),
    tr('65bda5b344', 'Arabic Islam Islamic Music', 'mirostar', 'https://cdn.pixabay.com/audio/2026/07/08/audio_65bda5b344.mp3', '/music/arabic-arabic-islam-islamic-music-560330/', 'islamic', 198),
    tr('dc5aad9896', 'islamic music', 'DesiFreeMusic', 'https://cdn.pixabay.com/audio/2024/09/04/audio_dc5aad9896.mp3', '/music/beats-islamic-music-238041/', 'islamic', 338),
    tr('ed9df3f032', 'Islamic music no copyright | Copyright-Free Islamic Background Music', 'DesiFreeMusic', 'https://cdn.pixabay.com/audio/2024/07/09/audio_ed9df3f032.mp3', '/music/world-islamic-music-no-copyright-copyright-free-islamic-background-music-223062/', 'islamic', 120),
    tr('776ce048c4', 'Islamic - Islamic Background', 'Alec_Koff', 'https://cdn.pixabay.com/audio/2026/02/13/audio_776ce048c4.mp3', '/music/epic-classical-islamic-islamic-background-484608/', 'islamic', 131),
    tr('2dde19dc8c', 'Peaceful Piano', 'leberch', 'https://cdn.pixabay.com/audio/2026/07/30/audio_2dde19dc8c.mp3', '/music/ambient-peaceful-piano-576857/', 'peaceful', 146),
    tr('4f355eb79a', 'Peaceful Calm', 'leberch', 'https://cdn.pixabay.com/audio/2024/10/20/audio_4f355eb79a.mp3', '/music/modern-classical-peaceful-calm-252904/', 'peaceful', 110),
    tr('ffd97835d0', 'Peaceful Acoustic Music', 'andriig', 'https://cdn.pixabay.com/audio/2026/07/13/audio_ffd97835d0.mp3', '/music/folk-peaceful-acoustic-music-566894/', 'peaceful', 145),
    tr('ca195bfc5a', 'Peaceful Quiet Music', 'andriig', 'https://cdn.pixabay.com/audio/2026/06/21/audio_ca195bfc5a.mp3', '/music/folk-peaceful-quiet-music-551480/', 'peaceful', 137),
    tr('c0dc9d705e', 'Meditation', 'leberch', 'https://cdn.pixabay.com/audio/2026/08/01/audio_c0dc9d705e.mp3', '/music/meditationspiritual-meditation-578429/', 'meditation', 426),
    tr('59df543075', 'Meditation', 'leberch', 'https://cdn.pixabay.com/audio/2026/07/15/audio_59df543075.mp3', '/music/ambient-meditation-568008/', 'meditation', 314),
    tr('a42fd27866', 'Gentle - Peaceful Gentle Music', 'BombinSound', 'https://cdn.pixabay.com/audio/2026/03/10/audio_a42fd27866.mp3', '/music/modern-classical-gentle-peaceful-gentle-music-499513/', 'peaceful', 103),
    tr('83beb192b3', 'Peaceful Ambient', 'QuietPhase', 'https://cdn.pixabay.com/audio/2026/03/05/audio_83beb192b3.mp3', '/music/ambient-peaceful-ambient-492359/', 'peaceful', 221),
    tr('093829151b', 'Peaceful Mantra', 'NourishedByMusic', 'https://cdn.pixabay.com/audio/2024/09/15/audio_093829151b.mp3', '/music/meditationspiritual-peaceful-mantra-240925/', 'peaceful', 370),
  ],
  wedding: [
    tr('d7b2fbfb23', 'Wedding', 'PaulYudin', 'https://cdn.pixabay.com/audio/2026/02/16/audio_d7b2fbfb23.mp3', '/music/modern-classical-wedding-485932/', 'classic', 119),
    tr('893c6436ee', 'Wedding - Wedding Music', 'PaulYudin', 'https://cdn.pixabay.com/audio/2026/07/25/audio_893c6436ee.mp3', '/music/wedding-wedding-wedding-music-574002/', 'classic', 102),
    tr('1cf135cdaa', 'Invitation Wedding', 'leberch', 'https://cdn.pixabay.com/audio/2025/07/16/audio_1cf135cdaa.mp3', '/music/wedding-invitation-wedding-375839/', 'invitation', 110),
    tr('3778bc034f', 'Wedding Romantic', 'leberch', 'https://cdn.pixabay.com/audio/2024/11/10/audio_3778bc034f.mp3', '/music/wedding-wedding-romantic-262606/', 'romantic', 86),
    tr('0d2b8cdc62', 'Wedding - Wedding Music', 'andriig', 'https://cdn.pixabay.com/audio/2026/07/15/audio_0d2b8cdc62.mp3', '/music/wedding-wedding-wedding-music-568195/', 'classic', 130),
    tr('c80c94bb29', 'Wedding', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/05/07/audio_c80c94bb29.mp3', '/music/beautiful-plays-wedding-522480/', 'classic', 154),
    tr('c48fcf7267', 'Wedding Garden Ceremony Glow', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/01/audio_c48fcf7267.mp3', '/music/wedding-wedding-garden-ceremony-glow-578500/', 'garden', 178),
    tr('d221a9632c', 'Wedding', 'prettyjohn1', 'https://cdn.pixabay.com/audio/2026/02/19/audio_d221a9632c.mp3', '/music/solo-piano-wedding-487335/', 'classic', 60),
    tr('07f944e159', 'Wedding Instrumental Vow Exchange', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/08/01/audio_07f944e159.mp3', '/music/modern-jazz-wedding-instrumental-vow-exchange-578502/', 'vow', 189),
    tr('c035596642', 'Wedding Piano', 'PaulYudin', 'https://cdn.pixabay.com/audio/2023/08/16/audio_c035596642.mp3', '/music/wedding-wedding-piano-162472/', 'piano', 130),
    tr('64ca14daf2', 'Wedding Music (Valentines day)', 'PaulYudin', 'https://cdn.pixabay.com/audio/2023/12/22/audio_64ca14daf2.mp3', '/music/wedding-wedding-music-valentines-day-182505/', 'romantic', 118),
    tr('19f8a1893f', 'Wedding - Wedding Trailer Music', 'HitsLab', 'https://cdn.pixabay.com/audio/2024/11/26/audio_19f8a1893f.mp3', '/music/wedding-wedding-wedding-trailer-music-269139/', 'cinematic', 133),
    tr('ba4594cfd9', 'Wedding', 'AlexGrohl', 'https://cdn.pixabay.com/audio/2026/06/09/audio_ba4594cfd9.mp3', '/music/wedding-wedding-546219/', 'classic', 94),
    tr('dd8c111e4f', 'Islamic Nasheed Peaceful Reflection', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_dd8c111e4f.mp3', '/music/arabic-islamic-nasheed-peaceful-reflection-573946/', 'nasheed', 153),
    tr('dac4531a9d', 'Sholawat Nabi', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_dac4531a9d.mp3', '/music/pop-sholawat-nabi-320899/', 'sholawat', 158),
    tr('e5d0cc98f0', 'Sholawat Badar', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_e5d0cc98f0.mp3', '/music/pop-sholawat-badar-320888/', 'sholawat', 152),
    tr('40e0bb0280', 'Nasheed Islamic Background', 'SufiSama99', 'https://cdn.pixabay.com/audio/2023/01/14/audio_40e0bb0280.mp3', '/music/ambient-nasheed-islamic-background-133345/', 'nasheed', 391),
    tr('042d96ae90', 'Copyright Free Background Nasheed 60', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_042d96ae90.mp3', '/music/choir-copyright-free-background-nasheed-60-499769/', 'nasheed', 105),
    tr('47e3414fbe', 'Background Nasheed 37', 'I_read_quran', 'https://cdn.pixabay.com/audio/2026/03/10/audio_47e3414fbe.mp3', '/music/choir-background-nasheed-37-499777/', 'nasheed', 91),
    tr('2dbecfdf47', 'Sacred Echo by Makrifat Islam', 'makrifatzamannow', 'https://cdn.pixabay.com/audio/2025/08/12/audio_2dbecfdf47.mp3', '/music/pop-sacred-echo-by-makrifat-islam-388776/', 'islamic', 224),
    tr('d94b433e13', 'Boundless Grace', 'bineleyas', 'https://cdn.pixabay.com/audio/2025/03/23/audio_d94b433e13.mp3', '/music/pop-boundless-grace-317825/', 'nasheed', 201),
    tr('0801799199', 'Path to Jannah', 'abdul2025', 'https://cdn.pixabay.com/audio/2025/10/24/audio_0801799199.mp3', '/music/world-path-to-jannah-425563/', 'islamic', 156),
    tr('fccb4d08a4', 'Arabic Islamic Music', 'lkoliks', 'https://cdn.pixabay.com/audio/2025/06/16/audio_fccb4d08a4.mp3', '/music/world-arabic-islamic-islam-music-360770/', 'islamic', 129),
    tr('1031533094', 'islamic Music', 'DesiFreeMusic', 'https://cdn.pixabay.com/audio/2024/09/12/audio_1031533094.mp3', '/music/world-islamic-music-240169/', 'islamic', 133),
    tr('37e98ed678', 'Kurban - Islamic music background', 'Pocketbeats', 'https://cdn.pixabay.com/audio/2025/05/04/audio_37e98ed678.mp3', '/music/pop-kurban-islamic-music-background-336564/', 'islamic', 105),
    tr('f61a36c81f', 'Romantic Piano', 'leberch', 'https://cdn.pixabay.com/audio/2026/03/31/audio_f61a36c81f.mp3', '/music/modern-classical-romantic-piano-512030/', 'piano', 141),
    tr('29bd9fc383', 'Romantic Piano', 'PaulYudin', 'https://cdn.pixabay.com/audio/2023/09/03/audio_29bd9fc383.mp3', '/music/wedding-romantic-piano-164822/', 'piano', 130),
    tr('3fcffb7ea4', 'Piano Romantic', 'AtlasAudio', 'https://cdn.pixabay.com/audio/2026/03/28/audio_3fcffb7ea4.mp3', '/music/solo-piano-piano-romantic-510293/', 'piano', 94),
    tr('7946e652ae', 'Romantic Date Piano', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/08/audio_7946e652ae.mp3', '/music/instrumental-romantic-date-piano-548637/', 'piano', 169),
    tr('220e4005ce', 'Romantic Inspiring Piano', 'PaulYudin', 'https://cdn.pixabay.com/audio/2023/12/22/audio_220e4005ce.mp3', '/music/wedding-romantic-inspiring-piano-182508/', 'piano', 120),
    tr('1c144e932f', 'Romantic Wedding Inspiring Piano', 'PaulYudin', 'https://cdn.pixabay.com/audio/2025/07/17/audio_1c144e932f.mp3', '/music/wedding-romantic-wedding-inspiring-piano-376014/', 'piano', 95),
    tr('eb01fd9b45', 'Classical - Classical Song', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/07/29/audio_eb01fd9b45.mp3', '/music/epic-classical-classical-classical-song-576563/', 'classical', 153),
    tr('bc5cc02744', 'Classical Royal English Music', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/09/audio_bc5cc02744.mp3', '/music/modern-classical-classical-royal-english-music-545533/', 'classical', 181),
    tr('fcc3b1e47c', 'Classical Elegance', 'Sonican', 'https://cdn.pixabay.com/audio/2026/05/07/audio_fcc3b1e47c.mp3', '/music/modern-classical-classical-elegance-522215/', 'classical', 74),
    tr('5205788b95', 'Classical Background', 'The_Mountain', 'https://cdn.pixabay.com/audio/2025/03/06/audio_5205788b95.mp3', '/music/main-title-classical-background-310132/', 'classical', 140),
    tr('5301fb9081', 'Violin', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/04/02/audio_5301fb9081.mp3', '/music/classical-string-quartet-violin-513168/', 'violin', 154),
    tr('6be1394f9e', 'Violin Emotional', 'AbsoluteSound', 'https://cdn.pixabay.com/audio/2026/06/26/audio_6be1394f9e.mp3', '/music/instrumental-violin-emotional-557859/', 'violin', 178),
    tr('ce1bfb9678', 'String Quartet Elegance', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/04/audio_ce1bfb9678.mp3', '/music/chamber-music-string-quartet-elegance-537464/', 'quartet', 191),
    tr('d1cb1fa724', 'Classical String Quartet', 'Luis_Humanoide', 'https://cdn.pixabay.com/audio/2025/02/06/audio_d1cb1fa724.mp3', '/music/modern-classical-classical-string-quartet-297607/', 'quartet', 125),
    tr('df3851f70a', 'Happy String Quartet Loop - Optimistic Classical Music', 'Sonican', 'https://cdn.pixabay.com/audio/2026/04/08/audio_df3851f70a.mp3', '/music/classical-string-quartet-happy-string-quartet-loop-optimistic-classical-music-513274/', 'quartet', 64),
    tr('611c21af8a', 'Romantic Wedding Acoustic Guitar', 'Tunetank', 'https://cdn.pixabay.com/audio/2025/06/13/audio_611c21af8a.mp3', '/music/small-emotions-romantic-wedding-acoustic-guitar-347266/', 'guitar', 132),
    tr('48906d7fa0', 'Acoustic', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/04/02/audio_48906d7fa0.mp3', '/music/acoustic-group-acoustic-513150/', 'acoustic', 132),
    tr('3217c7a2fe', 'Acoustic Guitar Sunrise Travel', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_3217c7a2fe.mp3', '/music/folk-acoustic-guitar-sunrise-travel-573651/', 'acoustic', 148),
    tr('e7b528bf5a', 'I LOVE YOU - Guitar - Solo Guitar Music', 'FreeMusicForVideo', 'https://cdn.pixabay.com/audio/2026/03/05/audio_e7b528bf5a.mp3', '/music/solo-guitar-i-love-you-guitar-solo-guitar-music-495615/', 'guitar', 111),
    tr('836ab9d11c', 'Wedding Romantic', 'leberch', 'https://cdn.pixabay.com/audio/2025/07/15/audio_836ab9d11c.mp3', '/music/modern-classical-wedding-romantic-375196/', 'romantic', 92),
  ],
  aqiqah: [
    tr('558dfb97db', 'Lullaby -  Lullaby Music', 'The_Mountain', 'https://cdn.pixabay.com/audio/2026/07/29/audio_558dfb97db.mp3', '/music/lullabies-lullaby-lullaby-music-576578/', 'lullaby', 102),
    tr('645a5a8897', 'Lullaby', 'leberch', 'https://cdn.pixabay.com/audio/2026/08/02/audio_645a5a8897.mp3', '/music/happy-childrens-tunes-lullaby-578714/', 'lullaby', 114),
    tr('79142a6adb', 'Gentle Baby Sleep Lullaby Dream', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/05/07/audio_79142a6adb.mp3', '/music/lullabies-gentle-baby-sleep-lullaby-dream-530944/', 'sleep', 178),
    tr('e703904cce', 'Lullaby Baby Sleep Music', 'ikoliks_aj', 'https://cdn.pixabay.com/audio/2025/04/24/audio_e703904cce.mp3', '/music/lullabies-lullaby-baby-sleep-music-331777/', 'sleep', 80),
    tr('bbc5b28c2b', 'Lulaby', 'Monume', 'https://cdn.pixabay.com/audio/2026/07/30/audio_bbc5b28c2b.mp3', '/music/lullabies-lulaby-576991/', 'lullaby', 128),
    tr('b2ede3e686', 'Forest Lullaby', 'mirostar', 'https://cdn.pixabay.com/audio/2026/07/01/audio_b2ede3e686.mp3', '/music/happy-childrens-tunes-forest-lullaby-560336/', 'lullaby', 119),
    tr('5ba63a5d5b', 'Lullaby Acoustic Guitar', 'DELOSound', 'https://cdn.pixabay.com/audio/2025/11/18/audio_5ba63a5d5b.mp3', '/music/lullabies-lullaby-acoustic-guitar-438657/', 'lullaby', 85),
    tr('192268d154', 'Lullaby Baby Sleep Music', 'MondaMusic', 'https://cdn.pixabay.com/audio/2026/04/08/audio_192268d154.mp3', '/music/ambient-lullaby-baby-sleep-music-512844/', 'sleep', 86),
    tr('0b711f3a50', 'Lullaby Dreamy Children Music', 'Tunetank', 'https://cdn.pixabay.com/audio/2025/06/13/audio_0b711f3a50.mp3', '/music/lullabies-lullaby-dreamy-children-music-347722/', 'lullaby', 118),
    tr('29bd11e39b', 'Music Box Sleep Lullaby', 'Tunetank', 'https://cdn.pixabay.com/audio/2025/06/13/audio_29bd11e39b.mp3', '/music/lullabies-music-box-sleep-lullaby-349471/', 'musicbox', 111),
    tr('ffbe80762f', 'Little Star Lullaby', 'u_jltxwion0i', 'https://cdn.pixabay.com/audio/2025/10/09/audio_ffbe80762f.mp3', '/music/lullabies-little-star-lullaby-417636/', 'lullaby', 174),
    tr('352e040c19', 'Baby', 'Kulakovka', 'https://cdn.pixabay.com/audio/2024/12/15/audio_352e040c19.mp3', '/music/happy-childrens-tunes-baby-276659/', 'baby', 104),
    tr('7a25764d74', 'Baby Sleep Soft Lullaby Nights', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_7a25764d74.mp3', '/music/soft-house-baby-sleep-soft-lullaby-nights-573888/', 'sleep', 199),
    tr('e7070220f5', 'Baby Sleep', 'The_Mountain', 'https://cdn.pixabay.com/audio/2023/03/20/audio_e7070220f5.mp3', '/music/modern-classical-baby-sleep-143300/', 'sleep', 123),
    tr('234c9b05d8', 'Baby Joy', 'The_Mountain', 'https://cdn.pixabay.com/audio/2022/12/20/audio_234c9b05d8.mp3', '/music/happy-childrens-tunes-baby-joy-130049/', 'joy', 107),
    tr('85358047c2', 'Baby Fun', 'The_Mountain', 'https://cdn.pixabay.com/audio/2022/12/20/audio_85358047c2.mp3', '/music/acoustic-group-baby-fun-130023/', 'fun', 79),
    tr('01970e2ea8', 'Children Baby Kids Music', 'Tunetank', 'https://cdn.pixabay.com/audio/2025/06/13/audio_01970e2ea8.mp3', '/music/cartoons-children-baby-kids-music-347455/', 'kids', 111),
    tr('b816f864f0', 'Baby Smile', 'angel4leon', 'https://cdn.pixabay.com/audio/2024/02/08/audio_b816f864f0.mp3', '/music/happy-childrens-tunes-baby-smile-190123/', 'baby', 53),
    tr('1b75d216fb', 'Lullaby Bedtime Cradle Baby Sleep Therapy Music', 'Denis-Pavlov-Music', 'https://cdn.pixabay.com/audio/2026/02/08/audio_1b75d216fb.mp3', '/music/lullabies-lullaby-bedtime-cradle-baby-sleep-therapy-music-481379/', 'bedtime', 598),
    tr('68ab3fe769', 'Gentle Baby Sleep Lullaby', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/06/18/audio_68ab3fe769.mp3', '/music/instrumental-gentle-baby-sleep-lullaby-548646/', 'sleep', 189),
    tr('33d158f467', 'Soothing Bedtime Lullaby with Harp and Twinkling Sounds for free', 'DesiFreeMusic', 'https://cdn.pixabay.com/audio/2025/06/12/audio_33d158f467.mp3', '/music/lullabies-soothing-bedtime-lullaby-with-harp-and-twinkling-sounds-for-free-359046/', 'harp', 240),
    tr('053869ff09', 'Calm Baby Lullaby Sweet Dreams Music Box', 'Denis-Pavlov-Music', 'https://cdn.pixabay.com/audio/2025/08/31/audio_053869ff09.mp3', '/music/lullabies-calm-baby-lullaby-sweet-dreams-music-box-397059/', 'musicbox', 194),
    tr('472866b1c9', 'Moonbeam Cradle', 'MarloweMusic', 'https://cdn.pixabay.com/audio/2026/08/05/audio_472866b1c9.mp3', '/music/modern-classical-moonbeam-cradle-580738/', 'bedtime', 171),
    tr('f69b80b4e7', 'Baby Piano - Waltz No.2', 'Sonican', 'https://cdn.pixabay.com/audio/2026/08/10/audio_f69b80b4e7.mp3', '/music/small-drama-baby-piano-waltz-no2-583179/', 'piano', 122),
    tr('beaf0b99b5', 'Playful And Sweet Baby Piano / Marimba - Bedtime - FULL', 'zec53', 'https://cdn.pixabay.com/audio/2024/12/02/audio_beaf0b99b5.mp3', '/music/introoutro-playful-and-sweet-baby-piano-marimba-bedtime-full-271477/', 'piano', 94),
    tr('86a442c94d', 'Lullaby Dreams', 'Sonican', 'https://cdn.pixabay.com/audio/2024/03/13/audio_86a442c94d.mp3', '/music/lullabies-lullaby-dreams-195828/', 'lullaby', 37),
    tr('ae2dedfeae', 'Playtime Bedtime - Friendly Smile', 'Sonican', 'https://cdn.pixabay.com/audio/2024/02/27/audio_ae2dedfeae.mp3', '/music/happy-childrens-tunes-playtime-bedtime-friendly-smile-193378/', 'fun', 140),
    tr('8f5931cc05', 'Sleepy Stars Gentle Bedtime Music for Kids, Toddlers', 'LaLaLemonTV', 'https://cdn.pixabay.com/audio/2025/05/28/audio_8f5931cc05.mp3', '/music/lullabies-sleepy-stars-gentle-bedtime-music-for-kids-toddlers-350856/', 'bedtime', 233),
    tr('dd8c111e4f', 'Islamic Nasheed Peaceful Reflection', 'alex-morgan', 'https://cdn.pixabay.com/audio/2026/07/25/audio_dd8c111e4f.mp3', '/music/arabic-islamic-nasheed-peaceful-reflection-573946/', 'nasheed', 153),
    tr('dac4531a9d', 'Sholawat Nabi', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_dac4531a9d.mp3', '/music/pop-sholawat-nabi-320899/', 'sholawat', 158),
    tr('e5d0cc98f0', 'Sholawat Badar', 'ejah_music', 'https://cdn.pixabay.com/audio/2025/03/30/audio_e5d0cc98f0.mp3', '/music/pop-sholawat-badar-320888/', 'sholawat', 152),
    tr('40e0bb0280', 'Nasheed Islamic Background', 'SufiSama99', 'https://cdn.pixabay.com/audio/2023/01/14/audio_40e0bb0280.mp3', '/music/ambient-nasheed-islamic-background-133345/', 'nasheed', 391),
    tr('0801799199', 'Path to Jannah', 'abdul2025', 'https://cdn.pixabay.com/audio/2025/10/24/audio_0801799199.mp3', '/music/world-path-to-jannah-425563/', 'islamic', 156),
    tr('2dbecfdf47', 'Sacred Echo by Makrifat Islam', 'makrifatzamannow', 'https://cdn.pixabay.com/audio/2025/08/12/audio_2dbecfdf47.mp3', '/music/pop-sacred-echo-by-makrifat-islam-388776/', 'islamic', 224),
  ],
};

// ---------------------------------------------------------------------------
// Lookup helpers used by the editor & preview overlays.
// ---------------------------------------------------------------------------
export const getTrackByUid = (uid: string): MusicLibraryTrack | undefined => {
  for (const key of Object.keys(MUSIC_LIBRARY) as CategoryKey[]) {
    const found = MUSIC_LIBRARY[key].find((t) => t.uid === uid);
    if (found) return found;
  }
  return undefined;
};

export const getTrackByUrl = (url: string): MusicLibraryTrack | undefined => {
  for (const key of Object.keys(MUSIC_LIBRARY) as CategoryKey[]) {
    const found = MUSIC_LIBRARY[key].find((t) => t.url === url);
    if (found) return found;
  }
  return undefined;
};

export const getCategoryRecommendation = (category: CategoryKey): { title: string; tracks: MusicLibraryTrack[] } => {
  const pool = MUSIC_LIBRARY[category];
  if (category === 'birthday') {
    const vocal = pool.filter((t) => t.isVocal);
    return {
      title: vocal.length > 0 ? 'Rekomendasi: lagu happy birthday dengan vokal' : 'Rekomendasi: lagu ceria',
      tracks: vocal.length > 0 ? vocal : pool.filter((t) => t.genre === 'Happy' || t.genre === 'Kids'),
    };
  }
  const vocal = pool.filter((t) => t.isVocal && (t.genre === 'Nasheed' || t.genre === 'Sholawat' || t.genre === 'Islamic'));
  return {
    title: vocal.length > 0 ? 'Rekomendasi: musik islami dengan vokal (nasheed/sholawat)' : 'Rekomendasi: musik islami',
    tracks: vocal.length > 0 ? vocal : pool.filter((t) => t.genre === 'Islamic' || t.genre === 'Nasheed' || t.genre === 'Sholawat'),
  };
};
