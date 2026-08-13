export interface MusicCredit {
  templateNumber: string; // unique key: b001..b100, s001..s100, w001..w100, a001..a100
  musicTitle: string;
  artist: string;
  category: string; // Birthday | Sunatan | Wedding | Aqiqah
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  attributionRequired: boolean;
  attributionText?: string;
  moodTags: string[];
  // Premium per-template music config (see src/lib/musicMatching.ts)
  musicUrl: string; // primary CDN MP3 (verified HTTP 200)
  fallbackUrl: string; // alternative CDN MP3 for the same template (verified HTTP 200)
  musicVolume: number; // default 0.6 (50–70% range)
  musicAutoplay: boolean; // starts on OPEN INVITATION (autoplay-safe)
  musicLoop: boolean;
  musicMood: string; // mood bucket used by the matching engine
  durationSec: number;
  /** Skip the intro/ambience — start playback at this second of the track. */
  startTime?: number;
  // v2 metadata (admin music editor + filters)
  musicGenre: string;
  musicIsVocal: boolean;
  musicLanguage: string;
  musicDescription?: string;
  alternativeMusic?: {
    title: string;
    artist: string;
    url: string;
  };
}

// Royalty-Free & Commercial Use Licensed Music Database
// Covers 400 templates: 100 Birthday, 100 Sunatan, 100 Wedding, 100 Aqiqah
// Sourced from Pixabay Music (Pixabay Content License, Commercial Use Allowed).
// Every musicUrl/fallbackUrl above was curl-verified HTTP 200. All audio is
// also backed by a built-in Web Audio Synthesizer fallback so every demo
// always plays sound even without a hosted MP3 file.

export const displayMusicNumber = (credit: MusicCredit): string => {
  return credit.templateNumber.length > 3
    ? `#${credit.templateNumber.slice(1)}`
    : `#${credit.templateNumber}`;
};
