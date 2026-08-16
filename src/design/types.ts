/* ============================================================
   MOMENKITA DESIGN SYSTEM — TYPES
   -------------------------------------
   10 distinct visual families. Every template resolves to one
   family (deterministic, derived from existing template metadata
   so template IDs & customer invitations are never touched).
   ============================================================ */

export type FamilyKey =
  | 'luxury'
  | 'floral'
  | 'minimal-elegant'
  | 'modern'
  | 'romantic'
  | 'islamic'
  | 'kids-fun'
  | 'rustic'
  | 'contemporary'
  | 'traditional-indonesian'
  | 'bday-balloon'
  | 'bday-cartoon'
  | 'bday-space'
  | 'bday-princess'
  | 'bday-pastel'
  | 'bday-minimal'
  | 'bday-luxury'
  | 'bday-neon'
  | 'bday-candy'
  | 'bday-elegant'
  | 'bday-retro'
  | 'bday-boho';

export type CoverStyle =
  | 'centered'
  | 'arch-window'
  | 'split'
  | 'editorial'
  | 'ornate'
  | 'banner'
  | 'polaroid-scatter'
  | 'asym'
  | 'islamic-arch'
  | 'card-focus'
  | 'bday-balloon-arch'
  | 'bday-comic-hero'
  | 'bday-space-portal'
  | 'bday-princess-arch'
  | 'bday-pastel-clouds'
  | 'bday-minimal-type'
  | 'bday-luxe-circle'
  | 'bday-neon-tilt'
  | 'bday-candy-split'
  | 'bday-elegant-frame'
  | 'bday-retro-burst'
  | 'bday-boho-frame';

export type CardStyle = 'glass' | 'paper' | 'dark' | 'soft' | 'bordered' | 'minimal';

export type GalleryStyle = 'grid' | 'polaroid' | 'collage' | 'masonry' | 'framed' | 'stacked';

export type HeadingStyle = 'classic' | 'ornate' | 'modern' | 'script' | 'lines';

export type DividerStyle = 'floral' | 'gold-line' | 'dots' | 'double-line' | 'geometric' | 'leaf' | 'stars' | 'arabesque' | 'batik' | 'thin' | 'confetti' | 'crown' | 'bunting';

export type ButtonShape = 'round' | 'square' | 'pill' | 'angled';

export type PhotoShape =
  | 'arch'
  | 'circle'
  | 'square'
  | 'islamic-arch'
  | 'portrait'
  | 'card'
  | 'polaroid'
  | 'hex'
  | 'heart'
  | 'star'
  | 'blob'
  | 'ticket';

export interface FamilyConfig {
  key: FamilyKey;
  label: string;
  /** Short tagline shown on cover (e.g. "Elegant Luxury Design"). */
  motto: string;
  /** Cover composition variant. */
  coverStyle: CoverStyle;
  /** Section heading treatment. */
  headingStyle: HeadingStyle;
  /** Divider between sections. */
  dividerStyle: DividerStyle;
  /** Card chrome. */
  cardStyle: CardStyle;
  /** Photo shape used on covers / galleries. */
  photoShape: PhotoShape;
  /** Gallery arrangement. */
  galleryStyle: GalleryStyle;
  /** Button geometry override (falls back to themeStyle.buttonStyle). */
  buttonShape: ButtonShape;
  /** Corner / edge ornaments to render. */
  cornerMarks: string[];
  /** Small marks sprinkled over the cover background. */
  ambientMarks: string[];
  /** Whether to render a decorative header band above section headings. */
  ornamentedHeadings: boolean;
  /** CSS class applied to section cards for this family. */
  cardClass: string;
  /** Extra inline style for section cards (e.g. texture/gradient). */
  cardStyleExtra?: import('react').CSSProperties;
  /** CSS background used behind content (subtle family pattern). */
  patternClass?: string;
  /** Foreground tint used for headings & icons. */
  accent: string;
  /** Whether the cover photo gets a decorative arch/wreath behind it. */
  coverFrameEmphasis: boolean;
  /** Word-spacing / tracking on titles. */
  titleTracking: string;
  /** Title case transform. */
  titleTransform: 'none' | 'uppercase' | 'capitalize';
}

export interface DesignResolution {
  family: FamilyConfig;
  coverStyle: CoverStyle;
  galleryStyle: GalleryStyle;
}
