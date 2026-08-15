/* ============================================================
   MomenKita — Unique SVG Cover Generator
   ------------------------------------------------------------
   Every template gets its OWN designed cover (600×800, 3:4) so
   the catalog never shows two templates with the same image.
   The cover is generated deterministically from the template's
   own theme (palette, decorations, frame, pattern, typography)
   plus a layout variant so each design is visually distinct:
   different composition, background, decorations and colors.
   Because it is an inline data URL it can never 404 or break.
   ============================================================ */
import { ThemeStyle, CategoryKey } from '../types';

export interface CoverInput {
  category: CategoryKey;
  categoryLabel: string;
  categoryEmoji: string;
  templateNumber: string;
  name: string;
  subcategory: string;
  designStyle: string;
  themeStyle: ThemeStyle;
}

/* ---- Tailwind named colors used by PALETTES gradients (hex fallback) ---- */
const NAMED_HEX: Record<string, string> = {
  'cyan-950': '#083344',
  'slate-900': '#0f172a',
  'slate-950': '#020617',
  'indigo-950': '#1e1b4b',
  'teal-950': '#042f2e',
  'teal-900': '#134e4a',
  'blue-950': '#172554',
  'emerald-950': '#022c22',
  'emerald-900': '#064e3b',
  'lime-950': '#1a2e05',
  'green-950': '#052e16',
  'fuchsia-950': '#4a044e',
  'pink-900': '#831843',
  'rose-800': '#9f1239',
  'amber-900': '#78350f',
  'purple-950': '#3b0764',
  'sky-950': '#082f49',
  'blue-900': '#1e3a8a',
};

const TOKEN_RE = /(from|via|to)-(?:\[(#[\da-fA-F]{6})\])|([a-z]+-\d{1,3})/g;

const shade = (hex: string, factor: number): string => {
  const m = /^#?([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/.exec(hex);
  if (!m) return hex;
  const mix = (c: string) => {
    const v = parseInt(c, 16);
    const n = Math.round(factor >= 0 ? v + (255 - v) * factor : v * (1 + factor));
    return Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
  };
  return `#${mix(m[1])}${mix(m[2])}${mix(m[3])}`;
};

const parseGradient = (gradient: string): [string, string, string] => {
  const found: string[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(gradient)) !== null) {
    if (m[2]) {
      found.push(m[2]);
    } else if (m[3]) {
      found.push(NAMED_HEX[m[3]] || '#0f172a');
    }
  }
  const c1 = found[0] || '#0f172a';
  const c2 = found[1] || shade(c1, 0.18);
  const c3 = found[2] || shade(c1, -0.25);
  return [c1, c2, c3];
};

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrapWords = (text: string, maxLen: number, maxLines = 3): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur ? cur + ' ' + w : w).length <= maxLen) {
      cur = cur ? cur + ' ' + w : w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
};

/* ---- Fonts per typography style (generic system fallbacks work inside SVG <img>) ---- */
const FONT_FAMILY: Record<string, string> = {
  playful: "Fredoka, 'Comic Sans MS', sans-serif",
  cute: "Fredoka, 'Comic Sans MS', sans-serif",
  retro: "Fredoka, 'Trebuchet MS', sans-serif",
  elegant: "'Playfair Display', Georgia, serif",
  luxury: "Cinzel, 'Times New Roman', serif",
  handwritten: "'Great Vibes', 'Brush Script MT', cursive",
  minimalist: "'Space Grotesk', 'Segoe UI', sans-serif",
  neon: "'Space Grotesk', 'Segoe UI', sans-serif",
};

const fontFor = (fontStyle: string): string => FONT_FAMILY[fontStyle] || "Georgia, serif";

/* ---- Deterministic pseudo-random helpers (stable per index) ---- */
const rng = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ---- Pattern overlays per BackgroundType ---- */
const patternFor = (bgType: string, accent: string, primary: string): string => {
  switch (bgType) {
    case 'islamic-gold':
      return `<g stroke="${accent}" stroke-opacity="0.4" fill="none"><path d="M30 0 L60 30 L30 60 L0 30 Z"/><circle cx="30" cy="30" r="5" fill="${accent}" fill-opacity="0.5"/></g>`;
    case 'marble-gold':
      return `<g fill="${accent}" fill-opacity="0.35"><circle cx="20" cy="20" r="6"/><circle cx="60" cy="55" r="4"/><circle cx="45" cy="10" r="3"/></g>`;
    case 'celebration-confetti':
      return `<g fill="${accent}" fill-opacity="0.5"><rect x="10" y="12" width="6" height="10" rx="2" transform="rotate(15 13 17)"/><circle cx="48" cy="28" r="5"/><rect x="55" y="48" width="6" height="10" rx="2" transform="rotate(-20 58 53)"/><circle cx="15" cy="52" r="4"/></g>`;
    case 'balloons-party':
      return `<g fill="${accent}" fill-opacity="0.45"><circle cx="15" cy="22" r="7"/><circle cx="45" cy="18" r="6"/><circle cx="32" cy="50" r="8"/></g>`;
    case 'comic-doodles':
      return `<g fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="3"><path d="M5 15 h20 M5 30 h14 M10 60 h22" stroke-linecap="round"/><circle cx="48" cy="20" r="8"/><circle cx="48" cy="20" r="3" fill="${accent}"/></g>`;
    case 'neon-glow':
      return `<g fill="none" stroke="${primary}" stroke-opacity="0.55" stroke-width="2"><path d="M5 45 h30 l-8 -18 l10 -14 M45 15 h20 l-8 18 l10 12"/></g>`;
    case 'minimalist-lines':
      return `<g stroke="${accent}" stroke-opacity="0.5" stroke-width="1.5"><path d="M5 20 h40 M5 38 h40 M5 56 h40"/></g>`;
    case 'monochrome-line':
      return `<g stroke="${accent}" stroke-opacity="0.5" stroke-width="1.5"><path d="M5 25 h30 M5 45 h30 M5 65 h30"/></g>`;
    case 'pastel-clouds':
      return `<g fill="${accent}" fill-opacity="0.3"><circle cx="16" cy="20" r="7"/><circle cx="28" cy="16" r="9"/><circle cx="40" cy="22" r="6"/></g>`;
    case 'pastel-hearts':
      return `<g fill="${accent}" fill-opacity="0.4"><text x="18" y="34" font-size="16">♥</text><text x="48" y="60" font-size="12">♥</text></g>`;
    case 'baby-moon':
      return `<g fill="${accent}" fill-opacity="0.35"><path d="M22 24 a10 10 0 1 0 12 12 a13 13 0 0 1 -12 -12Z"/><circle cx="45" cy="50" r="2.5"/><circle cx="20" cy="52" r="2"/></g>`;
    case 'baby-animal':
      return `<g fill="${accent}" fill-opacity="0.35"><circle cx="20" cy="22" r="8"/><circle cx="34" cy="22" r="8"/><circle cx="27" cy="34" r="10"/></g>`;
    case 'watercolor':
    case 'watercolor-soft':
      return `<g fill="${accent}" fill-opacity="0.25"><circle cx="22" cy="22" r="10"/><circle cx="38" cy="34" r="8"/><circle cx="14" cy="48" r="7"/></g>`;
    case 'floral-lace':
      return `<g fill="none" stroke="${accent}" stroke-opacity="0.5"><circle cx="28" cy="24" r="9"/><circle cx="28" cy="24" r="4" fill="${accent}" fill-opacity="0.5"/><circle cx="48" cy="52" r="9"/><circle cx="48" cy="52" r="4" fill="${accent}" fill-opacity="0.5"/></g>`;
    case 'luxury-emerald':
      return `<g fill="${accent}" fill-opacity="0.4"><text x="14" y="30" font-size="16">✦</text><text x="42" y="56" font-size="11">✦</text></g>`;
    case 'emerald-tiara':
      return `<g fill="${accent}" fill-opacity="0.4"><path d="M14 30 L24 18 L34 30 L24 26 Z"/><path d="M42 54 L52 42 L62 54 L52 50 Z"/></g>`;
    case 'wedding-royal':
      return `<g fill="${accent}" fill-opacity="0.35"><path d="M20 30 L30 20 L40 30 L30 26 Z"/><path d="M20 30 L30 40 L40 30 L30 34 Z"/></g>`;
    case 'wedding-garden':
      return `<g fill="${accent}" fill-opacity="0.35"><path d="M16 26 a8 8 0 0 1 16 0 Z" transform="rotate(180 24 30)"/><circle cx="24" cy="30" r="3" fill="${accent}"/><path d="M46 52 a8 8 0 0 1 16 0 Z" transform="rotate(180 54 56)"/><circle cx="54" cy="56" r="3" fill="${accent}"/></g>`;
    case 'wine-jazz':
      return `<g fill="none" stroke="${accent}" stroke-opacity="0.4"><path d="M8 40 q10 -14 20 0 q10 14 20 0" fill="none"/><circle cx="12" cy="20" r="4"/></g>`;
    default:
      return `<g fill="${accent}" fill-opacity="0.35"><circle cx="24" cy="24" r="5"/><circle cx="50" cy="46" r="3.5"/></g>`;
  }
};

/* ---- Frame shapes per FrameStyle ---- */
const frameFor = (frameStyle: string, accent: string, secondary: string, text: string): string => {
  const g = (inner: string) => `<g>${inner}</g>`;
  switch (frameStyle) {
    case 'arch':
    case 'islamic-arch':
      return g(
        `<path d="M130 700 L130 400 Q130 240 300 220 Q470 240 470 400 L470 700" fill="none" stroke="${accent}" stroke-width="6" stroke-opacity="0.85"/><path d="M150 700 L150 400 Q150 258 300 240 Q450 258 450 400 L450 700" fill="none" stroke="${secondary}" stroke-width="2" stroke-opacity="0.6"/>`
      );
    case 'gold-border':
      return g(
        `<rect x="46" y="46" width="508" height="708" rx="26" fill="none" stroke="${accent}" stroke-width="5" stroke-opacity="0.9"/><rect x="58" y="58" width="484" height="684" rx="20" fill="none" stroke="${secondary}" stroke-width="1.5" stroke-opacity="0.7"/>`
      );
    case 'polaroid':
      return g(
        `<rect x="60" y="50" width="480" height="700" rx="10" fill="#f7f3e9" fill-opacity="0.96"/><rect x="74" y="66" width="452" height="520" fill="none" stroke="#c9c2ae" stroke-width="2"/><text x="300" y="650" font-size="22" fill="#6b5f47" text-anchor="middle" font-family="Georgia, serif">${escapeXml(text)}</text>`
      );
    case 'minimal-circle':
    case 'minimal-line':
      return g(
        `<circle cx="300" cy="380" r="300" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.8"/><circle cx="300" cy="380" r="285" fill="none" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>`
      );
    case 'neon-border':
      return g(
        `<rect x="42" y="42" width="516" height="716" rx="24" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="10"/><rect x="50" y="50" width="500" height="700" rx="18" fill="none" stroke="${accent}" stroke-width="3"/>`
      );
    case 'cute-ribbon':
      return g(
        `<rect x="44" y="44" width="512" height="712" rx="32" fill="none" stroke="${secondary}" stroke-width="6" stroke-opacity="0.9"/><circle cx="80" cy="70" r="6" fill="${accent}"/><circle cx="520" cy="730" r="6" fill="${accent}"/>`
      );
    case 'royal-crest':
    case 'royal-crown':
      return g(
        `<path d="M130 700 L130 380 Q130 240 300 210 Q470 240 470 380 L470 700" fill="none" stroke="${accent}" stroke-width="6" stroke-opacity="0.9"/><circle cx="300" cy="210" r="8" fill="${accent}"/><path d="M180 150 l20 -22 l20 22 l20 -22 l20 22" fill="none" stroke="${accent}" stroke-width="3" stroke-opacity="0.8"/>`
      );
    case 'floral-ring':
    case 'floral-wreath':
      return g(
        `<circle cx="300" cy="360" r="300" fill="none" stroke="${secondary}" stroke-width="3" stroke-opacity="0.7"/><circle cx="300" cy="360" r="288" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.5"/><text x="300" y="52" font-size="30" text-anchor="middle">🌷</text><text x="60" y="360" font-size="30">🌷</text><text x="540" y="360" font-size="30">🌷</text>`
      );
    case 'moon-arch':
      return g(
        `<path d="M130 700 L130 400 Q130 250 300 230 Q470 250 470 400 L470 700" fill="none" stroke="${accent}" stroke-width="5" stroke-opacity="0.85"/><path d="M278 150 a60 60 0 1 0 44 44 a70 70 0 0 1 -44 -44Z" fill="${accent}" fill-opacity="0.9"/>`
      );
    case 'comic-frame':
      return g(
        `<rect x="40" y="40" width="520" height="720" rx="14" fill="none" stroke="${secondary}" stroke-width="8" stroke-opacity="0.9"/><circle cx="52" cy="52" r="10" fill="${accent}"/><circle cx="548" cy="748" r="10" fill="${accent}"/>`
      );
    case 'glass-frame':
      return g(
        `<rect x="46" y="46" width="508" height="708" rx="30" fill="rgba(255,255,255,0.05)" stroke="${accent}" stroke-width="3" stroke-opacity="0.7"/>`
      );
    default:
      return g(
        `<rect x="46" y="46" width="508" height="708" rx="24" fill="none" stroke="${accent}" stroke-width="3" stroke-opacity="0.75"/>`
      );
  }
};

/* ---- Scatter decorative emojis around the canvas ---- */
const decorFor = (decorations: string[], idx: number): string => {
  if (!decorations || decorations.length === 0) return '';
  const spots: Array<[number, number, number, number, number]> = [];
  for (let i = 0; i < 8; i++) {
    const x = 40 + rng(idx * 31 + i * 7) * 520;
    const y = 40 + rng(idx * 17 + i * 13) * 720;
    const size = 26 + rng(idx * 3 + i * 5) * 34;
    const opacity = 0.55 + rng(idx * 11 + i) * 0.4;
    const rot = Math.round(rng(idx * 5 + i * 3) * 40 - 20);
    spots.push([x, y, size, opacity, rot]);
  }
  return spots
    .map(([x, y, size, opacity, rot], i) => {
      const emoji = decorations[i % decorations.length];
      return `<text x="${x}" y="${y}" font-size="${size.toFixed(0)}" opacity="${opacity.toFixed(2)}" transform="rotate(${rot} ${x} ${y})" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`;
    })
    .join('');
};

/* ---- The 12 composition layouts ---- */
const LAYOUTS = 12;

const contentFor = (
  inp: CoverInput,
  c1: string,
  c2: string,
  c3: string,
  accent: string,
  text: string,
  sub: string,
  variant: number
): string => {
  const name = escapeXml(inp.name);
  const design = escapeXml(inp.designStyle);
  const subcat = escapeXml(inp.subcategory);
  const emoji = inp.categoryEmoji || '✨';
  const num = escapeXml(inp.templateNumber);
  const label = escapeXml(inp.categoryLabel);
  const font = fontFor(inp.themeStyle.fontStyle);
  const maxLen = Math.max(8, Math.round(44 - inp.name.length * 0.55));
  const lines = wrapWords(inp.name, Math.min(16, maxLen), 3);
  const fs = Math.max(30, Math.min(54, 60 - inp.name.length * 0.8));
  const lineH = Math.round(fs * 1.16);
  const titleBlock = lines
    .map((l, i) => `<tspan x="300" dy="${i === 0 ? 0 : lineH}">${escapeXml(l)}</tspan>`)
    .join('');
  const titleSvg = `<text x="300" y="390" font-family="${font}" font-size="${fs}" font-weight="700" fill="${text}" text-anchor="middle" letter-spacing="1">${titleBlock}</text>`;

  const divider =
    `<g transform="translate(300, ${430 + (lines.length - 1) * 4})" text-anchor="middle">` +
    `<line x1="-70" y1="0" x2="-16" y2="0" stroke="${accent}" stroke-width="2" stroke-opacity="0.9"/>` +
    `<text x="0" y="6" font-size="18" fill="${accent}">✦</text>` +
    `<line x1="16" y1="0" x2="70" y2="0" stroke="${accent}" stroke-width="2" stroke-opacity="0.9"/></g>`;

  const badge =
    `<circle cx="300" cy="150" r="46" fill="rgba(0,0,0,0.28)"/><circle cx="300" cy="150" r="46" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.8"/>` +
    `<text x="300" y="150" font-size="44" text-anchor="middle" dominant-baseline="central">${emoji}</text>`;

  const footer =
    `<text x="300" y="726" font-family="Verdana, sans-serif" font-size="15" fill="${sub}" text-anchor="middle" letter-spacing="4" font-weight="700">MOMENKITA</text>` +
    `<text x="300" y="748" font-family="Verdana, sans-serif" font-size="11" fill="${sub}" fill-opacity="0.85" text-anchor="middle" letter-spacing="3">DIGITAL INVITATION • ${label} • #${num}</text>`;

  const subLine = `<text x="300" y="${472 + (lines.length - 1) * 4}" font-family="Verdana, sans-serif" font-size="16" fill="${sub}" text-anchor="middle" letter-spacing="3" font-weight="600">${design.toUpperCase()} · ${subcat.toUpperCase()}</text>`;

  switch (variant) {
    case 1: // arch focus
      return `${badge}${titleSvg}${divider}${subLine}${footer}`;
    case 2: // diagonal accent band
      return (
        `<polygon points="0,220 600,520 600,620 0,320" fill="${c3}" fill-opacity="0.4"/>` +
        `<polygon points="0,320 600,620 600,660 0,360" fill="${accent}" fill-opacity="0.35"/>` +
        `${titleSvg}${divider}${subLine}` +
        `<text x="300" y="248" font-size="40" text-anchor="middle" font-family="Verdana, sans-serif">${emoji}</text>${footer}`
      );
    case 3: // top banner
      return (
        `<rect x="0" y="0" width="600" height="210" fill="${c3}" fill-opacity="0.5"/>` +
        `<rect x="0" y="196" width="600" height="7" fill="${accent}" fill-opacity="0.9"/>` +
        `<circle cx="300" cy="105" r="54" fill="rgba(0,0,0,0.25)" stroke="${accent}" stroke-width="2"/>` +
        `<text x="300" y="105" font-size="52" text-anchor="middle" dominant-baseline="central">${emoji}</text>` +
        titleSvg + divider + subLine + footer
      );
    case 4: // radial sunburst
      return (
        `<circle cx="300" cy="390" r="300" fill="url(#burst)" opacity="0.5"/>` +
        badge + titleSvg + divider + subLine + footer
      );
    case 5: // heavy border
      return (
        `<rect x="34" y="34" width="532" height="732" rx="6" fill="none" stroke="${accent}" stroke-width="10" stroke-opacity="0.95"/>` +
        `<rect x="52" y="52" width="496" height="696" rx="4" fill="none" stroke="${sub}" stroke-width="1.5" stroke-opacity="0.6"/>` +
        badge + titleSvg + divider + subLine + footer
      );
    case 6: // split blocks
      return (
        `<rect x="0" y="0" width="600" height="330" fill="${c2}" fill-opacity="0.6"/>` +
        `<rect x="0" y="320" width="600" height="14" fill="${accent}" fill-opacity="0.9"/>` +
        `<circle cx="300" cy="160" r="56" fill="rgba(0,0,0,0.25)" stroke="${accent}" stroke-width="2.5"/>` +
        `<text x="300" y="160" font-size="54" text-anchor="middle" dominant-baseline="central">${emoji}</text>` +
        `<text x="300" y="250" font-family="Verdana, sans-serif" font-size="15" fill="${text}" fill-opacity="0.9" text-anchor="middle" letter-spacing="4" font-weight="700">${label.toUpperCase()}</text>` +
        titleSvg + divider + subLine + footer
      );
    case 7: // corner ornaments
      return (
        `<g fill="none" stroke="${accent}" stroke-width="5" stroke-opacity="0.9"><path d="M60 150 V90 a30 30 0 0 1 30 -30 h60"/><path d="M540 150 V90 a30 30 0 0 0 -30 -30 h-60"/><path d="M60 650 V710 a30 30 0 0 0 30 30 h60"/><path d="M540 650 V710 a30 30 0 0 1 -30 30 h-60"/></g>` +
        badge + titleSvg + divider + subLine + footer
      );
    case 8: // big watermark emoji
      return (
        `<text x="300" y="360" font-size="250" opacity="0.16" text-anchor="middle" dominant-baseline="central">${emoji}</text>` +
        badge + titleSvg + divider + subLine + footer
      );
    case 9: // minimal lines
      return (
        `<line x1="200" y1="300" x2="400" y2="300" stroke="${sub}" stroke-width="1.5" stroke-opacity="0.7"/>` +
        titleSvg + divider + subLine +
        `<line x1="210" y1="520" x2="390" y2="520" stroke="${sub}" stroke-width="1.5" stroke-opacity="0.7"/>` +
        footer
      );
    case 10: // stacked cards
      return (
        `<rect x="90" y="80" width="420" height="96" rx="18" fill="${c3}" fill-opacity="0.5" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.6"/>` +
        `<rect x="110" y="112" width="380" height="60" rx="12" fill="${accent}" fill-opacity="0.35"/>` +
        `<text x="300" y="150" font-size="30" text-anchor="middle" fill="${text}" font-family="Verdana, sans-serif" font-weight="700">${label.toUpperCase()}</text>` +
        titleSvg + divider + subLine + footer
      );
    case 11: // dotted grid
      return (
        `<g fill="${accent}" fill-opacity="0.4">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<circle cx="${90 + (i % 5) * 105}" cy="${300 + Math.floor(i / 5) * 60}" r="2.5"/>`).join('')}</g>` +
        badge + titleSvg + divider + subLine + footer
      );
    default: // 0 centered
      return badge + titleSvg + divider + subLine + footer;
  }
};

/* ---- Main entry: build a unique cover data URL ---- */
export const buildTemplateCover = (inp: CoverInput): string => {
  const palette = inp.themeStyle;
  const [c1, c2, c3] = parseGradient(palette.bgGradient || '');
  const accent = palette.accentColor || '#d4af37';
  const primary = palette.primaryColor || '#ffffff';
  const text = palette.textColor || '#ffffff';
  const sub = palette.subtextColor || '#d4af37';
  const idx = parseInt(inp.templateNumber, 10) || 1;
  const variant = idx % LAYOUTS;
  const decor = decorFor(palette.decorations || [], idx);
  const frame = frameFor(palette.frameStyle || 'glass-frame', accent, palette.secondaryColor || accent, inp.name);
  const pattern = patternFor(palette.bgPattern || 'minimalist-lines', accent, primary);
  const content = contentFor(inp, c1, c2, c3, accent, text, sub, variant);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="0.5" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/>` +
    `</linearGradient>` +
    `<radialGradient id="burst" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${accent}" stop-opacity="0.55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>` +
    `<pattern id="pat" width="60" height="60" patternUnits="userSpaceOnUse">${pattern}</pattern>` +
    `</defs>` +
    `<rect width="600" height="800" fill="url(#bg)"/>` +
    `<rect width="600" height="800" fill="url(#pat)" opacity="0.2"/>` +
    `<circle cx="300" cy="400" r="330" fill="url(#burst)" opacity="0.5"/>` +
    decor +
    frame +
    content +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
