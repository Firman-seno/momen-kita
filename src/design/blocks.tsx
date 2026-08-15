import React from 'react';
import { FamilyConfig, GalleryStyle } from './types';
import { cardTextClass, cardMutedClass, isPaperFamily } from './families';
import { dividerFor, GoldDivider, FloralDivider, CornerFlourish, LeafSprig, EightStar, StarDivider, PartyBand, ScriptSwirl, ArchWreath, TapeStrip } from './ornaments';
import { ThemeStyle, EventDetails } from '../types';
import { AnimProfile, Reveal, Stagger, StaggerChild } from '../components/AnimationKit';

/* ============================================================
   REUSABLE DESIGN BLOCKS
   Every block is family-aware. This is what turns one shared
   renderer into 10 genuinely different premium templates.
   ============================================================ */

export interface BlockCtx {
  family: FamilyConfig;
  themeStyle: ThemeStyle;
  profile: AnimProfile;
}

export const radiusFor = (family: FamilyConfig): string => {
  switch (family.key) {
    case 'modern':
    case 'bday-neon':
    case 'bday-minimal':
      return 'rounded-xl';
    case 'kids-fun':
    case 'bday-balloon':
    case 'bday-pastel':
    case 'bday-candy':
    case 'bday-cartoon':
      return 'rounded-3xl';
    case 'bday-luxury':
    case 'bday-retro':
      return 'rounded-md';
    default:
      return 'rounded-2xl';
  }
};

/* Light-paper family inner text is dark; everything else is light. */
export const useText = (family: FamilyConfig) => ({
  base: cardTextClass(family),
  muted: cardMutedClass(family),
  isPaper: isPaperFamily(family),
});

/* ---------------- Card shell ---------------- */
export interface CardShellProps {
  family: FamilyConfig;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const CardShell: React.FC<CardShellProps> = ({ family, className = '', style, children }) => {
  const { base } = useText(family);
  const extra = family.cardStyleExtra ? { ...family.cardStyleExtra, ...style } : style;
  return (
    <div
      className={`${family.cardClass} ${radiusFor(family)} ${base} ${className}`}
      style={extra}
    >
      {children}
    </div>
  );
};

/* ---------------- Section heading ---------------- */
export interface SectionHeadingProps {
  family: FamilyConfig;
  themeStyle: ThemeStyle;
  profile: AnimProfile;
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  family,
  themeStyle,
  profile,
  children,
  subtitle,
  className = '',
}) => {
  const isPaper = isPaperFamily(family);
  const headingColor = isPaper ? 'text-slate-800' : themeStyle.textColor;
  const subColor = isPaper ? 'text-slate-500' : 'text-white/70';
  const accent = family.accent;

  return (
    <Reveal profile={profile} variant="up" className={`text-center ${className}`}>
      {family.ornamentedHeadings && family.headingStyle !== 'script' && (
        <div className="flex justify-center items-center gap-3 mb-2">
          <span className="w-6 h-px bg-current opacity-40" />
          <span className="text-xs" style={{ color: accent }}>
            {family.cornerMarks[0] || '✦'}
          </span>
          <span className="w-6 h-px bg-current opacity-40" />
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl font-bold leading-snug ${family.titleTracking} ${family.titleTransform} ${
          family.headingStyle === 'modern' ? 'font-black tracking-tight' : ''
        } ${family.headingStyle === 'script' ? 'italic' : ''}`}
        style={{
          fontFamily: family.headingStyle === 'script' ? "'Great Vibes', cursive" : themeStyle.fontFamilyTitle,
          color: headingColor,
        }}
      >
        {children}
      </h2>
      {subtitle && <p className={`text-xs mt-2 ${subColor}`}>{subtitle}</p>}
      <div className="flex justify-center mt-4">
        <div style={{ color: accent }} className="w-48">
          {dividerFor(family.dividerStyle)}
        </div>
      </div>
    </Reveal>
  );
};

/* ---------------- Primary CTA button ---------------- */
export interface PrimaryButtonProps {
  family: FamilyConfig;
  themeStyle: ThemeStyle;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  type?: 'button' | 'submit';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  family,
  themeStyle,
  onClick,
  className = '',
  children,
  type = 'button',
}) => {
  const shape =
    family.buttonShape === 'round'
      ? 'rounded-full'
      : family.buttonShape === 'angled'
        ? 'rounded-lg [clip-path:polygon(6px_0,100%_0,calc(100%-6px)_100%,0_100%)]'
        : family.buttonShape === 'square'
          ? 'rounded-md'
          : 'rounded-full';
  const isPaper = isPaperFamily(family);

  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn-micro ${shape} w-full py-4 px-6 font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 cursor-pointer border-2 transition-transform ${className}`}
      style={
        isPaper
          ? {
              backgroundColor: family.accent,
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#ffffff',
            }
          : {
              backgroundColor: themeStyle.primaryColor,
              borderColor: 'rgba(255,255,255,0.35)',
              color: '#ffffff',
              boxShadow: `0 12px 30px ${themeStyle.primaryColor}55`,
            }
      }
    >
      {children}
    </button>
  );
};

/* ---------------- Ambient floating marks ---------------- */
export const AmbientMarks: React.FC<{ family: FamilyConfig; className?: string }> = ({
  family,
  className = '',
}) => (
  <div aria-hidden className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    {family.ambientMarks.slice(0, 5).map((m, i) => (
      <span
        key={i}
        className="absolute text-xl sm:text-2xl opacity-60 select-none animate-twinkle"
        style={{
          top: `${8 + i * 19}%`,
          left: `${i % 2 === 0 ? 6 : 84}%`,
          animationDelay: `${i * 0.7}s`,
        }}
      >
        {m}
      </span>
    ))}
  </div>
);

/* ---------------- Corner ornaments for containers ---------------- */
export const CornerOrnaments: React.FC<{ family: FamilyConfig; color?: string }> = ({
  family,
  color,
}) => {
  const c = color || family.accent;
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <CornerFlourish color={c} className="absolute top-2 left-2 w-12 h-12 opacity-70" />
      <CornerFlourish color={c} flip className="absolute top-2 right-2 w-12 h-12 opacity-70" />
      <CornerFlourish color={c} flip className="absolute bottom-2 left-2 w-12 h-12 opacity-70 [transform:scaleX(-1)scaleY(-1)]" />
      <CornerFlourish color={c} className="absolute bottom-2 right-2 w-12 h-12 opacity-70 [transform:scaleY(-1)]" />
    </div>
  );
};

/* ---------------- Family photo frame ---------------- */
export interface FamilyPhotoFrameProps {
  family: FamilyConfig;
  src: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
  size?: 'cover' | 'small';
}

export const FamilyPhotoFrame: React.FC<FamilyPhotoFrameProps> = ({
  family,
  src,
  alt,
  className = '',
  onClick,
  size = 'cover',
}) => {
  const shape = family.photoShape;
  const dims = size === 'small' ? 'w-36 h-44 sm:w-40 sm:h-48' : 'w-52 h-64 sm:w-56 sm:h-72';

  const inner = (
    <div
      className={`relative overflow-hidden shrink-0 group ${
        onClick ? 'cursor-pointer card-lift' : ''
      } ${className}`}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt || 'photo'}
        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
          shape === 'arch' || shape === 'islamic-arch' ? 'rounded-t-full rounded-b-2xl' : shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
        }`}
      />
    </div>
  );

  const wrap = (node: React.ReactNode, cls: string) => (
    <div className={`relative ${cls} shrink-0`}>{node}</div>
  );

  switch (shape) {
    case 'arch':
      return wrap(
        <>
          <ArchWreath color={family.accent} className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 opacity-90 z-10" />
          <div className={`${dims} rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl p-1.5 border-2 bg-gradient-to-b from-transparent via-transparent to-transparent`}
            style={{ borderColor: `${family.accent}66`, background: isPaperFamily(family) ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.3)' }}
          >
            <img src={src} alt={alt || 'photo'} className="w-full h-full object-cover rounded-t-full rounded-b-xl" />
          </div>
        </>,
        ''
      );
    case 'islamic-arch':
      return wrap(
        <>
          <div
            className={`${dims} overflow-hidden shadow-2xl relative`}
            style={{
              borderRadius: '220px 220px 24px 24px',
              border: `2px solid ${family.accent}66`,
              padding: 4,
              background: 'rgba(0,0,0,0.35)',
            }}
          >
            <img
              src={src}
              alt={alt || 'photo'}
              className="w-full h-full object-cover"
              style={{ borderRadius: '216px 216px 20px 20px' }}
            />
          </div>
          <EightStar color={family.accent} className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 opacity-90" />
        </>,
        ''
      );
    case 'circle':
      return wrap(
        <div
          className={`${dims.replace('h-64 sm:h-72', 'h-52 sm:h-56')} rounded-full p-1.5 shadow-2xl`}
          style={{
            background: `conic-gradient(${family.accent}, rgba(255,255,255,0.4), ${family.accent}, rgba(255,255,255,0.2), ${family.accent})`,
          }}
        >
          <img src={src} alt={alt || 'photo'} className="w-full h-full object-cover rounded-full border-2 border-black/40" />
        </div>,
        ''
      );
    case 'polaroid':
      return wrap(
        <div className={`${size === 'small' ? 'w-36' : 'w-48'} bg-[#f7f4ec] text-slate-800 rounded-md shadow-2xl p-2 pb-4 ${className}`}>
          <div className="w-full aspect-square overflow-hidden rounded-sm bg-slate-200">
            <img src={src} alt={alt || 'photo'} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 text-center font-bold text-[10px] tracking-widest uppercase opacity-70">
            {alt || 'memory'}
          </div>
        </div>,
        ''
      );
    case 'heart':
      return wrap(
        <div className={`${dims} p-1.5`} style={{ background: `conic-gradient(${family.accent}, rgba(255,255,255,0.5), ${family.accent})` }}>
          <img
            src={src}
            alt={alt || 'photo'}
            className="w-full h-full object-cover"
            style={{
              clipPath:
                'path("M 100 180 C 100 180 20 120 20 70 A 40 40 0 0 1 100 40 A 40 40 0 0 1 180 70 C 180 120 100 180 100 180 Z")',
            }}
          />
        </div>,
        ''
      );
    case 'star':
      return wrap(
        <div className={`${dims} p-1`} style={{ background: `conic-gradient(${family.accent}, rgba(255,255,255,0.4), ${family.accent})` }}>
          <img
            src={src}
            alt={alt || 'photo'}
            className="w-full h-full object-cover"
            style={{
              clipPath:
                'path("M 100 8 L 124 74 L 194 74 L 137 116 L 156 182 L 100 140 L 44 182 L 63 116 L 6 74 L 76 74 Z")',
            }}
          />
        </div>,
        ''
      );
    case 'blob':
      return wrap(
        <div className={`${dims} p-1`} style={{ background: `conic-gradient(${family.accent}, rgba(255,255,255,0.45), ${family.accent})` }}>
          <img
            src={src}
            alt={alt || 'photo'}
            className="w-full h-full object-cover"
            style={{
              clipPath:
                'path("M 100 14 C 148 14 186 46 186 96 C 186 148 148 186 100 186 C 52 186 14 148 14 96 C 14 46 52 14 100 14 Z")',
            }}
          />
        </div>,
        ''
      );
    case 'ticket':
      return wrap(
        <div
          className={`${dims} rounded-xl p-2.5 relative shadow-2xl`}
          style={{
            background: isPaperFamily(family) ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.35)',
            border: `1.5px solid ${family.accent}66`,
          }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-px h-[115%] bg-current opacity-10" />
          <img
            src={src}
            alt={alt || 'photo'}
            className="w-full h-full object-cover rounded-md"
            style={{ clipPath: 'inset(0 round 6px)' }}
          />
          <span
            className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-[8px] font-black tracking-widest uppercase px-2 rounded-full"
            style={{ background: family.accent, color: '#ffffff' }}
          >
            {alt || 'party'}
          </span>
        </div>,
        ''
      );
    default:
      return wrap(
        <div
          className={`${dims} rounded-2xl overflow-hidden shadow-2xl ${family.coverFrameEmphasis ? 'border-2 p-1' : 'border-0 p-0'}`}
          style={{
            borderColor: family.coverFrameEmphasis ? `${family.accent}55` : undefined,
            background: family.coverFrameEmphasis ? 'rgba(0,0,0,0.3)' : undefined,
          }}
        >
          <img src={src} alt={alt || 'photo'} className="w-full h-full object-cover" />
        </div>,
        ''
      );
  }
};

/* ---------------- Countdown ---------------- */
export interface CountdownBlockProps {
  family: FamilyConfig;
  profile: AnimProfile;
  countdown: { days: number; hours: number; mins: number; secs: number };
  accent?: string;
}

export const CountdownBlock: React.FC<CountdownBlockProps> = ({ family, profile, countdown, accent }) => {
  const isPaper = isPaperFamily(family);
  const valueColor = accent || (isPaper ? '#b08a3e' : family.accent);
  const cells = [
    { label: 'Days', value: countdown.days },
    { label: 'Hours', value: countdown.hours },
    { label: 'Mins', value: countdown.mins },
    { label: 'Secs', value: countdown.secs },
  ];
  const box =
    family.key === 'kids-fun' ||
    family.key === 'bday-balloon' ||
    family.key === 'bday-candy' ||
    family.key === 'bday-cartoon' ||
    family.key === 'bday-pastel'
      ? 'bg-white/10 border-2 border-white/25 rounded-3xl'
      : family.key === 'modern' || family.key === 'bday-neon' || family.key === 'bday-minimal'
        ? 'bg-white/5 border border-white/20 rounded-xl'
        : family.key === 'bday-luxury'
          ? 'bg-[#160f08]/60 border border-amber-200/25 rounded-md'
          : isPaper
            ? 'bg-white/70 border border-[#e5dcc4] rounded-2xl'
            : 'bg-black/45 border border-white/20 rounded-2xl';

  return (
    <Stagger profile={profile} className="grid grid-cols-4 gap-2.5">
      {cells.map((c) => (
        <StaggerChild key={c.label} variant="scale">
          <div className={`${box} p-3.5 sm:p-4 flex flex-col items-center`}>
            <span key={c.value} className="countdown-tick text-2xl sm:text-3xl font-black" style={{ color: valueColor }}>
              {c.value}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{c.label}</span>
          </div>
        </StaggerChild>
      ))}
    </Stagger>
  );
};

/* ---------------- Gallery ---------------- */
export interface GalleryBlockProps {
  family: FamilyConfig;
  style?: GalleryStyle;
  profile: AnimProfile;
  images: string[];
  onImageClick?: (url: string) => void;
  accent?: string;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  family,
  style = 'grid',
  profile,
  images,
  onImageClick,
  accent,
}) => {
  const pic = (img: string, i: number, cls: string, tape?: boolean) => (
    <StaggerChild
      key={i}
      variant="photo"
      onClick={() => onImageClick?.(img)}
      className={`${cls} card-lift overflow-hidden cursor-pointer group relative`}
    >
      {tape && <TapeStrip className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" />}
      <img
        src={img}
        alt={`Gallery ${i + 1}`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
      </div>
    </StaggerChild>
  );

  const ring = family.accent;
  const framedCls = `border-2 p-1 bg-black/25 border-white/25 rounded-lg ${radiusFor(family)}`;

  switch (style) {
    case 'polaroid':
      return (
        <Stagger profile={profile} stagger={0.1} className="flex flex-wrap justify-center gap-3">
          {images.slice(0, 4).map((img, i) =>
            pic(
              img,
              i,
              `w-[45%] bg-[#f7f4ec] p-2 pb-6 rounded-md shadow-xl ${i % 2 === 0 ? '-rotate-2' : 'rotate-1'}`,
              true,
            ),
          )}
        </Stagger>
      );
    case 'collage':
      return (
        <Stagger profile={profile} stagger={0.1} className="grid grid-cols-2 gap-3 items-center">
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className={i % 3 === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}>
              {pic(img, i, `w-full h-full border-2 border-white/20 p-0.5 rounded-2xl`, true)}
            </div>
          ))}
        </Stagger>
      );
    case 'masonry':
      return (
        <Stagger profile={profile} stagger={0.08} className="grid grid-cols-2 gap-3 auto-rows-[130px] sm:auto-rows-[150px]">
          {images.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className={[
                'h-full',
                i === 0 ? 'row-span-2' : '',
                i === 1 ? 'col-span-1' : '',
                i === 2 ? 'row-span-1' : '',
                i === 3 ? 'row-span-2' : '',
              ].join(' ')}
            >
              {pic(img, i, 'w-full h-full rounded-xl')}
            </div>
          ))}
        </Stagger>
      );
    case 'stacked':
      return (
        <Stagger profile={profile} stagger={0.12} className="flex flex-col gap-3">
          {images.slice(0, 3).map((img, i) => (
            <div key={i}>
              {pic(img, i, 'w-full aspect-[4/3] rounded-xl border border-white/20')}
            </div>
          ))}
        </Stagger>
      );
    case 'framed':
      return (
        <Stagger profile={profile} stagger={0.1} className="grid grid-cols-2 gap-3">
          {images.slice(0, 4).map((img, i) => (
            <div key={i}>{pic(img, i, `w-full aspect-square ${framedCls}`)}</div>
          ))}
        </Stagger>
      );
    default:
      return (
        <Stagger profile={profile} stagger={0.1} className="grid grid-cols-2 gap-3">
          {images.slice(0, 4).map((img, i) => (
            <div key={i}>{pic(img, i, `w-full aspect-square rounded-2xl border border-white/20`, i % 2 === 1)}</div>
          ))}
        </Stagger>
      );
  }
};

/* ---------------- Event detail icon tile ---------------- */
export const IconTile: React.FC<{ accent?: string; children: React.ReactNode }> = ({ accent, children }) => (
  <div
    className="p-3 rounded-xl shrink-0 flex items-center justify-center"
    style={{ backgroundColor: accent ? `${accent}1f` : 'rgba(255,255,255,0.12)', color: accent || '#fbbf24' }}
  >
    {children}
  </div>
);

/* ---------------- Ornament ribbon for cover tops ---------------- */
export const CoverRibbon: React.FC<{ family: FamilyConfig; label: string }> = ({ family, label }) => (
  <div className="flex items-center justify-center">
    <div
      className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] shadow-lg"
      style={{
        backgroundColor: isPaperFamily(family) ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.45)',
        border: `1px solid ${family.accent}55`,
        color: isPaperFamily(family) ? '#6b5a2e' : '#fde68a',
      }}
    >
      <span>{family.ambientMarks[0]}</span>
      <span>{label}</span>
      <span>{family.ambientMarks[0]}</span>
    </div>
  </div>
);
