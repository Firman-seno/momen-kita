import React from 'react';

/* ============================================================
   ORNAMENT LIBRARY
   Inline SVG decorative elements — no external assets.
   Each element accepts a `color` so it inherits the family accent.
   ============================================================ */

export interface OrnamentProps {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/* Elegant gold swash divider — line + center flourish */
export const GoldDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 24" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M10 12 H85" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path d="M135 12 H210" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    <path d="M110 3 C 103 8 103 16 110 21 C 117 16 117 8 110 3 Z" stroke={color} strokeWidth="1.2" />
    <circle cx="110" cy="12" r="2.2" fill={color} />
    <circle cx="88" cy="12" r="1.6" fill={color} opacity="0.7" />
    <circle cx="132" cy="12" r="1.6" fill={color} opacity="0.7" />
  </svg>
);

/* Floral divider — central blossom + curled leaves */
export const FloralDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 240 40" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 20 H90" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <path d="M150 20 H234" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    <circle cx="120" cy="20" r="3" fill={color} />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
      <ellipse
        key={a}
        cx={120 + Math.cos((a * Math.PI) / 180) * 8}
        cy={20 + Math.sin((a * Math.PI) / 180) * 8}
        rx="4"
        ry="2"
        transform={`rotate(${a} ${120 + Math.cos((a * Math.PI) / 180) * 8} ${20 + Math.sin((a * Math.PI) / 180) * 8})`}
        fill={color}
        opacity="0.85"
      />
    ))}
    <path d="M96 20 C 92 12 100 8 106 10 C 102 14 100 18 96 20 Z" fill={color} opacity="0.6" />
    <path d="M144 20 C 148 28 140 32 134 30 C 138 26 140 22 144 20 Z" fill={color} opacity="0.6" />
  </svg>
);

/* Leaf divider — botanical */
export const LeafDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 32" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M4 16 H78" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    <path d="M142 16 H216" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    <path d="M110 6 C 96 10 96 22 110 26 C 124 22 124 10 110 6 Z" stroke={color} strokeWidth="1.1" />
    <path d="M110 26 V 6" stroke={color} strokeWidth="0.8" opacity="0.6" />
    <path d="M102 13 C 100 9 103 7 107 8" stroke={color} strokeWidth="0.8" opacity="0.6" />
    <path d="M118 13 C 120 9 117 7 113 8" stroke={color} strokeWidth="0.8" opacity="0.6" />
    <circle cx="110" cy="16" r="1.8" fill={color} />
  </svg>
);

/* Double line divider with diamond */
export const DoubleLineDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 16" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M8 6 H212" stroke={color} strokeWidth="0.8" />
    <path d="M8 10 H212" stroke={color} strokeWidth="0.8" />
    <rect x="106.5" y="4.5" width="7" height="7" transform="rotate(45 110 8)" stroke={color} strokeWidth="1.2" fill="none" />
  </svg>
);

/* Dots divider */
export const DotsDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 12" className={className} style={style} aria-hidden="true">
    {Array.from({ length: 21 }).map((_, i) => (
      <circle key={i} cx={10 + i * 10} cy="6" r={i % 4 === 2 ? 1.8 : 1.1} fill={color} opacity={i % 4 === 2 ? 1 : 0.55} />
    ))}
  </svg>
);

/* Geometric stars divider */
export const GeometricDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 18" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 9 H86" stroke={color} strokeWidth="1" />
    <path d="M134 9 H214" stroke={color} strokeWidth="1" />
    <path d="M110 1.5 L114 6.5 L119.5 7 L115.5 11 L116.5 17 L110 14 L103.5 17 L104.5 11 L100.5 7 L106 6.5 Z" fill={color} opacity="0.9" />
  </svg>
);

/* Arabesque band */
export const ArabesqueDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 26" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M4 13 H70" stroke={color} strokeWidth="1" opacity="0.8" />
    <path d="M150 13 H216" stroke={color} strokeWidth="1" opacity="0.8" />
    <path d="M110 4 C 102 8 102 18 110 22 C 118 18 118 8 110 4 Z" stroke={color} strokeWidth="1.1" />
    <path d="M110 6 C 105 9 105 17 110 20" stroke={color} strokeWidth="0.8" opacity="0.7" />
    <path d="M88 13 L 94 9 L 100 13 L 94 17 Z" fill={color} opacity="0.75" />
    <path d="M120 13 L 126 9 L 132 13 L 126 17 Z" fill={color} opacity="0.75" />
  </svg>
);

/* Batik-inspired parang band */
export const BatikDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 22" className={className} style={style} aria-hidden="true" fill="none">
    {Array.from({ length: 9 }).map((_, i) => {
      const x = 6 + i * 26;
      return (
        <g key={i} opacity={0.85}>
          <path d={`M${x} 4 C ${x + 6} 4 ${x + 10} 8 ${x + 10} 11 C ${x + 10} 14 ${x + 6} 18 ${x} 18`} stroke={color} strokeWidth="1.1" />
          <path d={`M${x + 12} 4 C ${x + 18} 4 ${x + 22} 8 ${x + 22} 11 C ${x + 22} 14 ${x + 18} 18 ${x + 12} 18`} stroke={color} strokeWidth="0.7" opacity="0.5" />
          <circle cx={x + 5} cy="11" r="1.6" fill={color} />
        </g>
      );
    })}
  </svg>
);

/* Script flourish for handwritten families */
export const ScriptSwirl: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 36" className={className} style={style} aria-hidden="true" fill="none">
    <path
      d="M12 26 C 40 8 70 30 110 18 C 150 6 180 26 208 12"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M20 30 C 46 18 74 34 110 24 C 146 14 174 30 200 18"
      stroke={color}
      strokeWidth="0.7"
      strokeLinecap="round"
      opacity="0.4"
    />
  </svg>
);

/* Star/moon band for islamic + kids */
export const StarDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 20" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 10 H86" stroke={color} strokeWidth="1" opacity="0.6" />
    <path d="M134 10 H214" stroke={color} strokeWidth="1" opacity="0.6" />
    <path d="M110 3 L112.4 7.2 L117 7.7 L113.7 10.9 L114.5 15.5 L110 13.2 L105.5 15.5 L106.3 10.9 L103 7.7 L107.6 7.2 Z" fill={color} />
    <circle cx="92" cy="10" r="1.4" fill={color} opacity="0.6" />
    <circle cx="128" cy="10" r="1.4" fill={color} opacity="0.6" />
  </svg>
);

/* Thin minimal line */
export const ThinDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 8" className={className} style={style} aria-hidden="true">
    <rect x="70" y="3" width="80" height="0.8" fill={color} opacity="0.7" />
    <rect x="108" y="3" width="4" height="1.2" fill={color} />
  </svg>
);

/* Corner flourish (top-left) */
export const CornerFlourish: React.FC<OrnamentProps & { flip?: boolean }> = ({ color = 'currentColor', className, style, flip }) => (
  <svg
    viewBox="0 0 90 90"
    className={className}
    style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
    fill="none"
  >
    <path d="M8 82 V 30 Q 8 8 30 8 H 82" stroke={color} strokeWidth="1.3" opacity="0.85" />
    <path d="M16 82 V 36 Q 16 16 36 16 H 82" stroke={color} strokeWidth="0.7" opacity="0.45" />
    <path d="M30 8 C 34 20 42 28 54 30" stroke={color} strokeWidth="1" opacity="0.7" />
    <circle cx="8" cy="82" r="2.4" fill={color} opacity="0.9" />
    <circle cx="82" cy="8" r="2.4" fill={color} opacity="0.9" />
  </svg>
);

/* Small leaf sprig */
export const LeafSprig: React.FC<OrnamentProps & { flip?: boolean }> = ({ color = 'currentColor', className, style, flip }) => (
  <svg
    viewBox="0 0 60 60"
    className={className}
    style={{ ...style, transform: flip ? 'scaleX(-1)' : undefined }}
    aria-hidden="true"
    fill="none"
  >
    <path d="M30 55 C 30 30 40 18 55 8" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M30 55 C 30 30 20 18 5 8" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M38 42 C 46 40 50 36 52 30" stroke={color} strokeWidth="0.8" opacity="0.7" />
    <path d="M22 42 C 14 40 10 36 8 30" stroke={color} strokeWidth="0.8" opacity="0.7" />
    <circle cx="30" cy="52" r="2.2" fill={color} opacity="0.9" />
  </svg>
);

/* Islamic 8-point star */
export const EightStar: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true" fill="none">
    <path
      d="M20 2 L24.5 11 L34 7.5 L28.5 16 L38 19 L28.5 22 L34 30.5 L24.5 27 L20 36 L15.5 27 L6 30.5 L11.5 22 L2 19 L11.5 16 L6 7.5 L15.5 11 Z"
      stroke={color}
      strokeWidth="1.3"
    />
    <circle cx="20" cy="19" r="4" stroke={color} strokeWidth="1" opacity="0.8" />
  </svg>
);

/* Arch wreath for islamic / arch covers */
export const ArchWreath: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M60 4 C 20 4 14 36 20 56" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M60 4 C 100 4 106 36 100 56" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M60 4 C 40 10 34 24 36 40" stroke={color} strokeWidth="0.7" opacity="0.6" />
    <path d="M60 4 C 80 10 86 24 84 40" stroke={color} strokeWidth="0.7" opacity="0.6" />
    {[18, 34, 50].map((x) => (
      <ellipse key={x} cx={x} cy={40 + x / 6} rx="3" ry="2.2" fill={color} opacity="0.75" transform={`rotate(-30 ${x} ${40 + x / 6})`} />
    ))}
    {[70, 86, 102].map((x) => (
      <ellipse key={x} cx={x} cy={40 + (120 - x) / 6} rx="3" ry="2.2" fill={color} opacity="0.75" transform={`rotate(30 ${x} ${40 + (120 - x) / 6})`} />
    ))}
    <circle cx="60" cy="6" r="2" fill={color} />
  </svg>
);

/* Balloon / confetti band for kids */
export const PartyBand: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 34" className={className} style={style} aria-hidden="true" fill="none">
    <ellipse cx="24" cy="14" rx="9" ry="11" stroke={color} strokeWidth="1.2" />
    <path d="M24 25 L26 32 M24 25 L22 32" stroke={color} strokeWidth="1" />
    <ellipse cx="110" cy="12" rx="10" ry="12" stroke={color} strokeWidth="1.2" opacity="0.85" />
    <path d="M110 24 L112 32 M110 24 L108 32" stroke={color} strokeWidth="1" opacity="0.85" />
    <ellipse cx="196" cy="14" rx="9" ry="11" stroke={color} strokeWidth="1.2" />
    <path d="M196 25 L198 32 M196 25 L194 32" stroke={color} strokeWidth="1" />
    <path d="M44 24 L48 18 M62 22 L58 15 M146 24 L150 17 M162 22 L158 15" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    <circle cx="60" cy="12" r="1.6" fill={color} opacity="0.7" />
    <circle cx="150" cy="10" r="1.6" fill={color} opacity="0.7" />
    <path d="M52 8 L56 4 M156 8 L160 4" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
  </svg>
);

/* Rotated photo tape strip */
export const TapeStrip: React.FC<OrnamentProps> = ({ color = '#f1f5f9', className, style }) => (
  <svg viewBox="0 0 40 14" className={className} style={style} aria-hidden="true">
    <rect x="0" y="0" width="40" height="14" rx="2" fill={color} opacity="0.55" />
  </svg>
);

/* ============================================================
   BIRTHDAY ORNAMENTS
   Playful inline SVG elements used by the birthday families.
   ============================================================ */

/* Confetti divider — bursting sprinkles */
export const ConfettiDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 24" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 12 H84" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <path d="M136 12 H214" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <rect x="104" y="8" width="6" height="8" rx="2" fill={color} transform="rotate(20 107 12)" opacity="0.9" />
    <rect x="112" y="5" width="5" height="7" rx="2" fill={color} transform="rotate(-25 114 8)" opacity="0.8" />
    <circle cx="110" cy="16" r="1.8" fill={color} />
    <circle cx="102" cy="13" r="1.4" fill={color} opacity="0.8" />
    <circle cx="118" cy="11" r="1.4" fill={color} opacity="0.8" />
    <path d="M106 4 L110 2 M114 4 L118 2" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
  </svg>
);

/* Crown divider — royal accent */
export const CrownDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 24" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M10 12 H88" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <path d="M132 12 H210" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <path d="M98 16 L102 6 L110 12 L116 4 L124 12 L118 6 L126 16 Z" fill={color} opacity="0.9" transform="translate(34 0)" />
    <circle cx="110" cy="12" r="1.8" fill={color} />
    <circle cx="92" cy="12" r="1.3" fill={color} opacity="0.7" />
    <circle cx="128" cy="12" r="1.3" fill={color} opacity="0.7" />
  </svg>
);

/* Balloon arch — used above cover photos */
export const BalloonArch: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 200 70" className={className} style={style} aria-hidden="true" fill="none">
    {[
      { cx: 30, cy: 52, r: 13, rot: -14 },
      { cx: 58, cy: 30, r: 15, rot: -8 },
      { cx: 100, cy: 18, r: 17, rot: 0 },
      { cx: 142, cy: 30, r: 15, rot: 8 },
      { cx: 170, cy: 52, r: 13, rot: 14 },
    ].map((b, i) => (
      <g key={i}>
        <ellipse
          cx={b.cx}
          cy={b.cy}
          rx={b.r}
          ry={b.r * 1.25}
          stroke={color}
          strokeWidth="1.4"
          transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}
          opacity={0.95}
        />
        <path d={`M${b.cx} ${b.cy + b.r * 1.25} l-2.5 10 M${b.cx} ${b.cy + b.r * 1.25} l2.5 10`} stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.8" />
      </g>
    ))}
  </svg>
);

/* Comic pop burst — starburst shape for cartoon covers */
export const ComicBurst: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 160 160" className={className} style={style} aria-hidden="true" fill="none">
    <path
      d="M80 4 L90 28 L114 10 L104 38 L136 30 L112 52 L150 60 L116 72 L146 92 L108 88 L122 118 L96 102 L92 134 L74 108 L54 128 L58 98 L28 104 L48 80 L14 66 L50 60 L30 36 L66 50 L60 16 L82 38 Z"
      fill={color}
      fillOpacity="0.85"
    />
  </svg>
);

/* Candy stripe band — sweet two-tone divider */
export const CandyStripe: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 20" className={className} style={style} aria-hidden="true">
    <defs>
      <pattern id="candy-stripe" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
        <rect width="11" height="22" fill={color} opacity="0.55" />
        <rect x="11" width="11" height="22" fill="#ffffff" opacity="0.35" />
      </pattern>
    </defs>
    <rect x="0" y="7" width="220" height="6" rx="3" fill="url(#candy-stripe)" />
  </svg>
);

/* Simple rocket mark */
export const RocketMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M30 8 C 30 20 40 30 40 42 L 20 42 C 20 30 30 20 30 8 Z" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.15" />
    <path d="M30 8 L 30 18" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M24 44 L 30 56 L 36 44" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="30" cy="14" r="2.6" stroke={color} strokeWidth="1.2" />
    <path d="M8 40 C 12 34 18 34 20 40 M40 40 C 44 34 50 34 52 40" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/* Candy / gift box mark */
export const GiftMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true" fill="none">
    <rect x="14" y="26" width="32" height="26" rx="3" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.12" />
    <path d="M14 34 H46" stroke={color} strokeWidth="1.4" />
    <path d="M30 26 V52" stroke={color} strokeWidth="1.4" />
    <path d="M30 26 C 30 18 22 14 18 18 C 14 22 20 28 30 26 Z" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.2" />
    <path d="M30 26 C 30 18 38 14 42 18 C 46 22 40 28 30 26 Z" stroke={color} strokeWidth="1.3" fill={color} fillOpacity="0.2" />
  </svg>
);

/* Rainbow arc */
export const RainbowArc: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M10 60 A 50 50 0 0 1 110 60" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
    <path d="M22 60 A 38 38 0 0 1 98 60" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.65" />
    <path d="M34 60 A 26 26 0 0 1 86 60" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <circle cx="10" cy="60" r="2.5" fill={color} />
    <circle cx="110" cy="60" r="2.5" fill={color} />
  </svg>
);

/* Star burst mark (twinkle / sparkle) */
export const StarBurst: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden="true" fill="none">
    <path
      d="M30 4 L35 18 L49 12 L43 26 L58 28 L43 32 L49 46 L35 40 L30 54 L25 40 L11 46 L17 32 L2 28 L17 26 L11 12 L25 18 Z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

/* Crown mark */
export const CrownMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 60 40" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 30 L10 12 L20 22 L30 8 L40 22 L50 12 L54 30 Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill={color} fillOpacity="0.15" />
    <rect x="6" y="30" width="48" height="4" rx="2" fill={color} opacity="0.8" />
    <circle cx="12" cy="14" r="2" fill={color} />
    <circle cx="30" cy="11" r="2" fill={color} />
    <circle cx="48" cy="14" r="2" fill={color} />
  </svg>
);

/* Cake mark — layered birthday cake with candles */
export const CakeMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 72 72" className={className} style={style} aria-hidden="true" fill="none">
    <ellipse cx="36" cy="62" rx="22" ry="5" fill={color} opacity="0.35" />
    <rect x="18" y="36" width="36" height="24" rx="4" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.12" />
    <path
      d="M18 40 C 22 34 26 34 30 38 C 34 42 38 42 42 38 C 46 34 50 34 54 40 V 42 H 18 Z"
      fill={color}
      opacity="0.85"
    />
    <path d="M22 60 V 50 M26 60 V 48 M32 60 V 50 M36 60 V 47 M40 60 V 50 M46 60 V 48 M50 60 V 50" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    <rect x="27" y="18" width="3.4" height="17" rx="1.6" fill={color} />
    <rect x="34.4" y="16" width="3.4" height="19" rx="1.6" fill={color} />
    <rect x="41.8" y="18" width="3.4" height="17" rx="1.6" fill={color} />
    <path d="M28.8 15 C 28.8 11 33 8 35 12 C 37 8 41 11 41 15 C 41 18 35 19 35 19 C 35 19 28.8 18 28.8 15 Z" fill="#fb923c" opacity="0.95" />
    <path d="M28.8 15 C 28.8 11 33 8 35 12 C 37 8 41 11 41 15" stroke="#fb923c" strokeWidth="1" opacity="0.6" />
  </svg>
);

/* Single balloon mark */
export const BalloonMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 48 60" className={className} style={style} aria-hidden="true" fill="none">
    <ellipse cx="24" cy="21" rx="14" ry="17" stroke={color} strokeWidth="1.7" fill={color} fillOpacity="0.18" />
    <path d="M24 6 C 31 9 33 14 32 20 C 31 27 27 30 22 30 C 17 30 14 26 15 19 C 16 13 20 8 24 6 Z" stroke={color} strokeWidth="1" fill={color} fillOpacity="0.3" opacity="0.7" />
    <path d="M24 38 L 22.5 41.5 M24 38 L 25.5 41.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M22.5 41.5 C 20 46 27 48 25.5 52 C 24.6 54 22.5 55 22.5 55" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
  </svg>
);

/* Party popper mark */
export const PartyPopper: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 72 72" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M14 58 L44 24 L52 32 L22 66 Z" fill={color} fillOpacity="0.14" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M44 24 L52 32 M46 22 L56 30" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M52 14 C 54 12 56 12 57 14 M59 20 C 61 18 62 18 63 20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="10" y="12" width="4" height="7" rx="2" fill={color} transform="rotate(18 12 15)" opacity="0.9" />
    <rect x="18" y="6" width="3.5" height="6" rx="1.75" fill={color} transform="rotate(-14 20 9)" opacity="0.8" />
    <circle cx="6" cy="22" r="1.8" fill={color} opacity="0.85" />
    <circle cx="16" cy="18" r="1.4" fill={color} opacity="0.7" />
    <circle cx="60" cy="10" r="1.6" fill={color} opacity="0.85" />
    <path d="M66 16 l4 2 M64 24 l4 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
  </svg>
);

/* Sparkle mark — four-point twinkle */
export const SparkleMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden="true" fill="none">
    <path
      d="M20 2 C 21.5 11.5 28.5 18.5 38 20 C 28.5 21.5 21.5 28.5 20 38 C 18.5 28.5 11.5 21.5 2 20 C 11.5 18.5 18.5 11.5 20 2 Z"
      fill={color}
      opacity="0.9"
    />
  </svg>
);

/* Candle mark */
export const CandleMark: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 44 60" className={className} style={style} aria-hidden="true" fill="none">
    <rect x="16" y="22" width="12" height="32" rx="4" stroke={color} strokeWidth="1.6" fill={color} fillOpacity="0.14" />
    <path d="M22 30 C 25 32 25 36 22 38 C 19 36 19 32 22 30 Z" fill={color} opacity="0.4" />
    <path d="M22 22 C 20 14 22 6 22 6 C 22 6 27 13 24 20" stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round" fill="#fb923c" opacity="0.95" />
    <path d="M22 22 C 20 18 24 16 26 19 C 26 21 24 22 22 22 Z" fill="#fbbf24" opacity="0.9" />
  </svg>
);

/* Confetti burst — radiating sprinkles */
export const ConfettiBurst: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true" fill="none">
    <circle cx="60" cy="60" r="3" fill={color} opacity="0.9" />
    <rect x="78" y="30" width="6" height="9" rx="2.5" fill={color} transform="rotate(24 81 34)" opacity="0.85" />
    <rect x="88" y="52" width="5" height="8" rx="2" fill={color} transform="rotate(70 90 56)" opacity="0.8" />
    <rect x="72" y="74" width="5" height="8" rx="2" fill={color} transform="rotate(110 74 78)" opacity="0.8" />
    <rect x="42" y="82" width="6" height="9" rx="2.5" fill={color} transform="rotate(-40 45 86)" opacity="0.85" />
    <rect x="24" y="64" width="5" height="8" rx="2" fill={color} transform="rotate(-80 26 68)" opacity="0.8" />
    <rect x="28" y="36" width="5" height="8" rx="2" fill={color} transform="rotate(-24 30 40)" opacity="0.8" />
    <rect x="56" y="22" width="6" height="9" rx="2.5" fill={color} transform="rotate(12 59 26)" opacity="0.85" />
    <path d="M92 20 L96 14 M98 34 L104 32" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    <circle cx="20" cy="22" r="1.8" fill={color} opacity="0.7" />
    <circle cx="100" cy="74" r="1.8" fill={color} opacity="0.7" />
    <circle cx="84" cy="100" r="1.8" fill={color} opacity="0.7" />
    <path d="M104 88 L110 92 M20 96 L26 92" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
  </svg>
);

/* Bunting — pennant flags on a string */
export const Bunting: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 240 28" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M4 4 C 60 16 180 16 236 4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    {[14, 46, 78, 110, 142, 174, 206, 226].map((x, i) => (
      <path
        key={x}
        d={`M${x - 9} 6 L${x + 9} 6 L${x} ${16 + (i % 3) * 4} Z`}
        fill={color}
        opacity={i % 2 === 0 ? 0.85 : 0.6}
      />
    ))}
    <circle cx="4" cy="4" r="1.8" fill={color} opacity="0.8" />
    <circle cx="236" cy="4" r="1.8" fill={color} opacity="0.8" />
  </svg>
);

/* Bunting divider — used by birthday sections between content */
export const BuntingDivider: React.FC<OrnamentProps> = ({ color = 'currentColor', className, style }) => (
  <svg viewBox="0 0 220 26" className={className} style={style} aria-hidden="true" fill="none">
    <path d="M6 6 C 70 16 150 16 214 6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    {[16, 44, 72, 100, 128, 156, 184, 204].map((x, i) => (
      <path key={x} d={`M${x - 8} 8 L${x + 8} 8 L${x} ${17 + (i % 3) * 3} Z`} fill={color} opacity={i % 2 === 0 ? 0.85 : 0.6} />
    ))}
    <circle cx="110" cy="22" r="1.6" fill={color} opacity="0.8" />
  </svg>
);

export const dividerFor = (style: string, color?: string): React.ReactNode => {
  const c = color || 'currentColor';
  switch (style) {
    case 'floral':
      return <FloralDivider color={c} />;
    case 'gold-line':
      return <GoldDivider color={c} />;
    case 'dots':
      return <DotsDivider color={c} />;
    case 'double-line':
      return <DoubleLineDivider color={c} />;
    case 'geometric':
      return <GeometricDivider color={c} />;
    case 'leaf':
      return <LeafDivider color={c} />;
    case 'stars':
      return <StarDivider color={c} />;
    case 'arabesque':
      return <ArabesqueDivider color={c} />;
    case 'batik':
      return <BatikDivider color={c} />;
    case 'confetti':
      return <ConfettiDivider color={c} />;
    case 'crown':
      return <CrownDivider color={c} />;
    case 'bunting':
      return <BuntingDivider color={c} />;
    default:
      return <ThinDivider color={c} />;
  }
};
