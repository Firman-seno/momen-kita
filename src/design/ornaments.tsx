import React from 'react';

/* ============================================================
   ORNAMENT LIBRARY
   Inline SVG decorative elements — no external assets.
   Each element accepts a `color` so it inherits the family accent.
   ============================================================ */

interface OrnamentProps {
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
    default:
      return <ThinDivider color={c} />;
  }
};
