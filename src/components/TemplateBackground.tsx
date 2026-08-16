import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ThemeStyle } from '../types';
import { EASE_OUT } from './AnimationKit';

const BIRTHDAY_CONFETTI_TYPES = [
  'balloon-party',
  'confetti-burst',
  'candy-sweet',
  'retro-pop',
  'neon-party',
  'space-cosmic',
  'princess-royal',
  'pastel-cute',
  'celebration-confetti',
];

const CONFETTI_COLORS = ['#f472b6', '#38bdf8', '#facc15', '#4ade80', '#c084fc', '#fb7185'];

interface TemplateBackgroundProps {
  themeStyle: ThemeStyle;
  children: React.ReactNode;
}

export const TemplateBackground: React.FC<TemplateBackgroundProps> = ({ themeStyle, children }) => {
  const bgType = themeStyle.backgroundType || 'gradient-pattern';
  const pattern = themeStyle.bgPattern || 'default';
  const hasPaperTexture = themeStyle.paperTexture ?? false;
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative min-h-screen w-full bg-gradient-to-b ${themeStyle.bgGradient} overflow-x-hidden text-white font-body selection:bg-amber-400 selection:text-black`}
    >
      {/* CINEMATIC ENTRANCE OVERLAY */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-[3] bg-slate-950"
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 1.2, ease: EASE_OUT }}
      />
      {/* LAYER 1: Subtle Paper Grain / Noise Overlay */}
      {(hasPaperTexture || pattern.includes('paper') || pattern.includes('minimalist') || pattern.includes('texture')) && (
        <div className="absolute inset-0 pointer-events-none z-0 opacity-25 mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
      )}

      {/* LAYER 2: Ambient Glowing Light Orbs / Radial Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: themeStyle.primaryColor }}
        />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: themeStyle.secondaryColor }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: themeStyle.accentColor }}
        />
      </div>

      {/* LAYER 3: Pattern & Visual Theme Elements */}

      {/* KIDS & CELEBRATION: Balloons, Confetti & Party Shapes */}
      {(bgType === 'celebration-confetti' || pattern.includes('balloons')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Confetti Polka Dots */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f472b6_2px,transparent_2px)] [background-size:24px_24px]" />

          {/* Floating Animated Balloons & Gifts */}
          <div className="absolute top-[8%] left-[6%] text-4xl sm:text-5xl animate-float-up opacity-85 select-none">🎈</div>
          <div className="absolute top-[28%] right-[8%] text-3xl sm:text-4xl animate-float-up animation-delay-2000 opacity-80 select-none">🎈</div>
          <div className="absolute top-[50%] left-[8%] text-3xl sm:text-4xl deco-float-in opacity-80 select-none">🎉</div>
          <div className="absolute top-[72%] right-[10%] text-4xl sm:text-5xl deco-float-in animation-delay-2000 opacity-85 select-none">🎁</div>
          <div className="absolute top-[18%] right-[16%] text-2xl sm:text-3xl deco-twinkle-in opacity-80 select-none">⭐</div>
          <div className="absolute top-[42%] left-[14%] text-2xl sm:text-3xl deco-twinkle-in opacity-85 select-none">🎂</div>
          <div className="absolute top-[88%] left-[10%] text-3xl sm:text-4xl deco-twinkle-in opacity-80 select-none">✨</div>
        </div>
      )}

      {/* KIDS ADVENTURE / SPACE / DINOSAUR */}
      {(bgType === 'kids-adventure' || pattern.includes('clouds') || pattern.includes('dinosaur')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[6%] left-[8%] text-4xl sm:text-5xl animate-twinkle opacity-90 select-none">☁️</div>
          <div className="absolute top-[14%] right-[8%] text-3xl animate-twinkle opacity-85 select-none">⭐</div>
          <div className="absolute top-[32%] left-[6%] text-2xl deco-twinkle-in opacity-75 select-none">✨</div>
          <div className="absolute top-[52%] right-[12%] text-4xl deco-float-in opacity-85 select-none">🚀</div>
          <div className="absolute top-[74%] left-[8%] text-3xl deco-twinkle-in opacity-80 select-none">🌙</div>
          <div className="absolute top-[90%] right-[8%] text-4xl deco-twinkle-in opacity-90 select-none">☁️</div>
        </div>
      )}

      {/* CARTOON / POP ART / COMIC DOODLES */}
      {(bgType === 'comic-doodles' || pattern.includes('cartoon') || pattern.includes('comic')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Ben-Day Dots Pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#facc15_2px,transparent_2px)] [background-size:20px_20px]" />
          <div className="absolute top-[10%] left-[8%] text-3xl sm:text-4xl animate-float-up opacity-85 select-none">🎨</div>
          <div className="absolute top-[30%] right-[10%] text-3xl animate-twinkle opacity-90 select-none">🌟</div>
          <div className="absolute top-[52%] left-[10%] text-3xl deco-float-in opacity-80 select-none">🍿</div>
          <div className="absolute top-[75%] right-[8%] text-4xl deco-twinkle-in opacity-85 select-none">🎪</div>
        </div>
      )}

      {/* TEEN: Neon Grid Matrix & Cyberpunk Glow */}
      {(bgType === 'neon-glow' || pattern.includes('neon-grid')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Cyber Grid */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#ec4899_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-tr from-cyan-500/25 to-fuchsia-500/25 rounded-full blur-3xl deco-glow-in" />
          <div className="absolute top-[12%] left-[10%] text-3xl animate-twinkle opacity-85 select-none">⚡</div>
          <div className="absolute top-[38%] right-[8%] text-3xl animate-float-up opacity-80 select-none">🎧</div>
          <div className="absolute top-[65%] left-[12%] text-3xl deco-twinkle-in opacity-85 select-none">🌌</div>
          <div className="absolute top-[88%] right-[12%] text-3xl deco-float-in opacity-80 select-none">💿</div>
        </div>
      )}

      {/* SWEET SEVENTEEN & FLORAL LACE */}
      {(bgType === 'floral-lace' || pattern.includes('floral') || pattern.includes('butterfly') || pattern.includes('rose-gold')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Subtle Lace & Floral Vignette */}
          <div className="absolute top-[8%] right-[8%] text-3xl sm:text-4xl animate-float-up opacity-90 select-none">🦋</div>
          <div className="absolute top-[26%] left-[6%] text-2xl sm:text-3xl animate-twinkle opacity-90 select-none">🌸</div>
          <div className="absolute top-[48%] right-[10%] text-2xl sm:text-3xl deco-float-in animation-delay-2000 opacity-85 select-none">👑</div>
          <div className="absolute top-[68%] left-[10%] text-3xl sm:text-4xl deco-twinkle-in opacity-90 select-none">✨</div>
          <div className="absolute top-[88%] right-[8%] text-3xl sm:text-4xl deco-float-in opacity-90 select-none">🌸</div>
        </div>
      )}

      {/* ELEGANT / LUXURY / MARBLE GOLD / EMERALD ROYAL */}
      {(bgType === 'marble-gold' || bgType === 'luxury-emerald' || pattern.includes('emerald') || pattern.includes('marble')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Gold Foil Vein Grid Accent */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

          {/* Gold Ambient Dust */}
          <div className="absolute top-[10%] left-[10%] text-2xl sm:text-3xl animate-twinkle text-amber-300 opacity-90 select-none">✨</div>
          <div className="absolute top-[28%] right-[8%] text-3xl sm:text-4xl animate-twinkle text-amber-200 opacity-85 select-none">👑</div>
          <div className="absolute top-[50%] left-[8%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-90 select-none">💎</div>
          <div className="absolute top-[70%] right-[10%] text-3xl sm:text-4xl deco-twinkle-in text-amber-200 opacity-90 select-none">🥂</div>
          <div className="absolute top-[88%] left-[10%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-85 select-none">✨</div>
        </div>
      )}

      {/* CUTE / PASTEL CLOUDS & HEARTS */}
      {(bgType === 'pastel-clouds' || pattern.includes('hearts')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[10%] left-[8%] text-4xl animate-float-up opacity-85 select-none">☁️</div>
          <div className="absolute top-[32%] right-[10%] text-3xl animate-twinkle opacity-90 select-none">🌸</div>
          <div className="absolute top-[55%] left-[10%] text-3xl deco-float-in opacity-85 select-none">💖</div>
          <div className="absolute top-[78%] right-[8%] text-4xl deco-twinkle-in opacity-90 select-none">☁️</div>
          <div className="absolute top-[92%] left-[14%] text-3xl deco-float-in opacity-80 select-none">🎀</div>
        </div>
      )}

      {/* MINIMALIST LINE ART & GEOMETRY */}
      {(bgType === 'minimalist-lines' || pattern.includes('minimalist') || pattern.includes('monochrome')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
          <div className="absolute top-[15%] left-[10%] text-2xl animate-twinkle opacity-60 select-none">✧</div>
          <div className="absolute top-[45%] right-[10%] text-2xl animate-twinkle opacity-60 select-none">✦</div>
          <div className="absolute top-[75%] left-[12%] text-2xl deco-twinkle-in opacity-60 select-none">🌿</div>
        </div>
      )}

      {/* ADULT / MIDNIGHT LOUNGE */}
      {(bgType === 'wine-jazz' || pattern.includes('wine') || pattern.includes('jazz')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[15%] left-[10%] text-3xl animate-twinkle opacity-80 select-none">🍷</div>
          <div className="absolute top-[45%] right-[10%] text-3xl animate-float-up opacity-85 select-none">🎷</div>
          <div className="absolute top-[75%] left-[12%] text-3xl deco-twinkle-in opacity-80 select-none">🥂</div>
        </div>
      )}

      {/* ISLAMIC / SUNATAN: Mosque, Crescent & Arabesque */}
      {(bgType === 'islamic-gold' || pattern.includes('islamic') || pattern.includes('arabesque') || pattern.includes('mosque')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {/* Geometric Star Lattice */}
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#d4af37_0px,#d4af37_1px,transparent_1px,transparent_14px)]" />
          <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(-45deg,#ffffff_0px,#ffffff_1px,transparent_1px,transparent_18px)]" />
          <div className="absolute top-[8%] left-[10%] text-3xl sm:text-4xl animate-twinkle text-amber-300 opacity-90 select-none">🕌</div>
          <div className="absolute top-[26%] right-[8%] text-2xl sm:text-3xl animate-twinkle text-amber-200 opacity-85 select-none">☪️</div>
          <div className="absolute top-[48%] left-[8%] text-3xl sm:text-4xl deco-twinkle-in text-amber-300 opacity-90 select-none">🌙</div>
          <div className="absolute top-[70%] right-[10%] text-3xl sm:text-4xl deco-twinkle-in text-amber-200 opacity-90 select-none">✨</div>
          <div className="absolute top-[88%] left-[10%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-85 select-none">⭐</div>
        </div>
      )}

      {/* WEDDING GARDEN: Florals, Rings & Romance */}
      {(bgType === 'wedding-garden' || pattern.includes('garden') || pattern.includes('wedding')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:22px_22px]" />
          <div className="absolute top-[10%] left-[8%] text-3xl sm:text-4xl animate-float-up opacity-85 select-none">🌷</div>
          <div className="absolute top-[30%] right-[10%] text-3xl animate-twinkle opacity-90 select-none">💐</div>
          <div className="absolute top-[52%] left-[10%] text-3xl deco-float-in opacity-85 select-none">💍</div>
          <div className="absolute top-[74%] right-[8%] text-3xl deco-twinkle-in opacity-90 select-none">🌿</div>
          <div className="absolute top-[90%] left-[12%] text-3xl deco-float-in opacity-80 select-none">🥂</div>
        </div>
      )}

      {/* WEDDING ROYAL: Gold Dust & Jewels */}
      {(bgType === 'wedding-royal' || pattern.includes('royal-crown')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1.5px,transparent_1.5px)] [background-size:30px_30px]" />
          <div className="absolute top-[10%] left-[10%] text-2xl sm:text-3xl animate-twinkle text-amber-300 opacity-90 select-none">✨</div>
          <div className="absolute top-[28%] right-[8%] text-3xl sm:text-4xl animate-twinkle text-amber-200 opacity-85 select-none">👑</div>
          <div className="absolute top-[50%] left-[8%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-90 select-none">💎</div>
          <div className="absolute top-[70%] right-[10%] text-3xl sm:text-4xl deco-twinkle-in text-amber-200 opacity-90 select-none">🥂</div>
          <div className="absolute top-[88%] left-[10%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-85 select-none">✨</div>
        </div>
      )}

      {/* BABY / AQIQAH: Moon, Stars & Clouds */}
      {(bgType === 'baby-moon' || pattern.includes('moon') || pattern.includes('crescent')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[8%] right-[12%] text-4xl sm:text-5xl animate-twinkle text-amber-200 opacity-90 select-none">🌙</div>
          <div className="absolute top-[16%] left-[10%] text-3xl animate-twinkle opacity-85 select-none">⭐</div>
          <div className="absolute top-[32%] right-[8%] text-2xl deco-twinkle-in opacity-75 select-none">✨</div>
          <div className="absolute top-[52%] left-[6%] text-4xl deco-float-in opacity-85 select-none">☁️</div>
          <div className="absolute top-[74%] right-[10%] text-3xl deco-twinkle-in opacity-80 select-none">⭐</div>
          <div className="absolute top-[90%] left-[10%] text-4xl deco-float-in opacity-90 select-none">☁️</div>
        </div>
      )}

      {/* BABY ANIMAL / AQIQAH CUTE */}
      {(bgType === 'baby-animal' || pattern.includes('animal') || pattern.includes('teddy')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute top-[12%] left-[10%] text-3xl sm:text-4xl animate-float-up opacity-85 select-none">🧸</div>
          <div className="absolute top-[34%] right-[10%] text-3xl animate-twinkle opacity-85 select-none">🐰</div>
          <div className="absolute top-[56%] left-[10%] text-3xl deco-float-in opacity-85 select-none">🍼</div>
          <div className="absolute top-[80%] right-[8%] text-3xl deco-twinkle-in opacity-85 select-none">🐻</div>
        </div>
      )}

      {/* WATERCOLOR SOFT BLOBS */}
      {(bgType === 'watercolor' || pattern.includes('watercolor')) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[12%] left-[6%] w-40 h-40 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="absolute top-[40%] right-[6%] w-48 h-48 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="absolute bottom-[12%] left-[20%] w-44 h-44 rounded-full bg-sky-400/20 blur-3xl" />
        </div>
      )}

      {/* BIRTHDAY BALLOON PARTY */}
      {bgType === 'balloon-party' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f472b6_2px,transparent_2px)] [background-size:26px_26px]" />
          <div className="absolute top-[8%] left-[8%] text-4xl sm:text-5xl animate-float-up opacity-90 select-none">🎈</div>
          <div className="absolute top-[30%] right-[6%] text-3xl sm:text-4xl animate-float-up animation-delay-2000 opacity-85 select-none">🎈</div>
          <div className="absolute top-[55%] left-[7%] text-3xl sm:text-4xl deco-float-in animation-delay-2000 opacity-85 select-none">🎉</div>
          <div className="absolute top-[76%] right-[10%] text-4xl sm:text-5xl deco-float-in opacity-90 select-none">🎈</div>
          <div className="absolute top-[16%] right-[18%] text-2xl deco-twinkle-in opacity-80 select-none">⭐</div>
          <div className="absolute top-[66%] left-[18%] text-2xl deco-twinkle-in opacity-80 select-none">🎂</div>
        </div>
      )}

      {/* BIRTHDAY SPACE COSMIC */}
      {bgType === 'space-cosmic' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[10%] left-[8%] text-3xl sm:text-4xl animate-twinkle opacity-90 select-none">🚀</div>
          <div className="absolute top-[28%] right-[10%] text-2xl animate-twinkle opacity-85 select-none">⭐</div>
          <div className="absolute top-[46%] left-[8%] text-2xl deco-twinkle-in opacity-75 select-none">✨</div>
          <div className="absolute top-[64%] right-[8%] text-3xl deco-twinkle-in opacity-85 select-none">🌙</div>
          <div className="absolute top-[84%] left-[12%] text-3xl deco-twinkle-in opacity-90 select-none">🪐</div>
        </div>
      )}

      {/* BIRTHDAY PRINCESS ROYAL */}
      {bgType === 'princess-royal' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f9a8d4_1.5px,transparent_1.5px)] [background-size:26px_26px]" />
          <div className="absolute top-[10%] right-[8%] text-3xl sm:text-4xl animate-float-up opacity-90 select-none">👑</div>
          <div className="absolute top-[30%] left-[8%] text-2xl sm:text-3xl animate-twinkle opacity-85 select-none">🌸</div>
          <div className="absolute top-[52%] right-[10%] text-2xl sm:text-3xl deco-twinkle-in opacity-85 select-none">✨</div>
          <div className="absolute top-[72%] left-[10%] text-3xl sm:text-4xl deco-float-in opacity-90 select-none">🦋</div>
          <div className="absolute top-[88%] right-[12%] text-2xl deco-twinkle-in opacity-80 select-none">💖</div>
        </div>
      )}

      {/* BIRTHDAY CANDY SWEET */}
      {bgType === 'candy-sweet' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(45deg,#fb7185_0px,#fb7185_6px,transparent_6px,transparent_14px)]" />
          <div className="absolute top-[10%] left-[10%] text-3xl sm:text-4xl animate-float-up opacity-90 select-none">🍭</div>
          <div className="absolute top-[32%] right-[8%] text-3xl animate-twinkle opacity-85 select-none">🧁</div>
          <div className="absolute top-[54%] left-[8%] text-3xl deco-float-in opacity-85 select-none">🌈</div>
          <div className="absolute top-[76%] right-[10%] text-3xl deco-twinkle-in opacity-90 select-none">🍩</div>
          <div className="absolute top-[90%] left-[14%] text-2xl deco-float-in opacity-85 select-none">🎀</div>
        </div>
      )}

      {/* BIRTHDAY CONFETTI BURST */}
      {bgType === 'confetti-burst' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#facc15_2px,transparent_2px),radial-gradient(#22d3ee_2px,transparent_2px),radial-gradient(#fb7185_2px,transparent_2px)] [background-size:28px_28px,32px_32px,36px_36px] [background-position:0_0,14px_14px,20px_6px]" />
          <div className="absolute top-[12%] left-[8%] text-3xl sm:text-4xl animate-twinkle opacity-90 select-none">🎉</div>
          <div className="absolute top-[34%] right-[8%] text-3xl animate-float-up opacity-85 select-none">🎊</div>
          <div className="absolute top-[56%] left-[10%] text-3xl deco-twinkle-in opacity-85 select-none">✨</div>
          <div className="absolute top-[78%] right-[10%] text-4xl deco-float-in opacity-90 select-none">🎈</div>
        </div>
      )}

      {/* BIRTHDAY PASTEL CUTE */}
      {bgType === 'pastel-cute' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute top-[10%] left-[8%] text-4xl animate-float-up opacity-85 select-none">☁️</div>
          <div className="absolute top-[30%] right-[10%] text-3xl animate-twinkle opacity-90 select-none">🦄</div>
          <div className="absolute top-[54%] left-[10%] text-3xl deco-float-in opacity-85 select-none">💖</div>
          <div className="absolute top-[76%] right-[8%] text-4xl deco-twinkle-in opacity-90 select-none">🌸</div>
          <div className="absolute top-[90%] left-[14%] text-3xl deco-float-in opacity-80 select-none">🎀</div>
        </div>
      )}

      {/* BIRTHDAY RETRO POP */}
      {bgType === 'retro-pop' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f472b6_2px,transparent_2px)] [background-size:22px_22px]" />
          <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,#ffffff_10px,#ffffff_11px),repeating-linear-gradient(90deg,transparent,transparent_10px,#ffffff_10px,#ffffff_11px)]" />
          <div className="absolute top-[12%] left-[8%] text-3xl sm:text-4xl animate-twinkle opacity-90 select-none">📼</div>
          <div className="absolute top-[34%] right-[8%] text-3xl animate-float-up opacity-85 select-none">💿</div>
          <div className="absolute top-[58%] left-[10%] text-3xl deco-twinkle-in opacity-85 select-none">🌶</div>
          <div className="absolute top-[80%] right-[10%] text-3xl sm:text-4xl deco-float-in opacity-90 select-none">🎉</div>
        </div>
      )}

      {/* BIRTHDAY NEON PARTY */}
      {bgType === 'neon-party' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#22d3ee_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] bg-gradient-to-tr from-cyan-500/25 to-fuchsia-500/25 rounded-full blur-3xl deco-glow-in" />
          <div className="absolute top-[12%] left-[10%] text-3xl animate-twinkle opacity-85 select-none">⚡</div>
          <div className="absolute top-[38%] right-[8%] text-3xl animate-float-up opacity-80 select-none">🎧</div>
          <div className="absolute top-[65%] left-[12%] text-3xl deco-twinkle-in opacity-85 select-none">🌌</div>
          <div className="absolute top-[88%] right-[12%] text-3xl deco-float-in opacity-80 select-none">💿</div>
        </div>
      )}

      {/* BIRTHDAY LUXURY GOLD */}
      {bgType === 'luxury-gold' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1.5px,transparent_1.5px)] [background-size:30px_30px]" />
          <div className="absolute top-[10%] left-[10%] text-2xl sm:text-3xl animate-twinkle text-amber-300 opacity-90 select-none">✨</div>
          <div className="absolute top-[28%] right-[8%] text-3xl sm:text-4xl animate-twinkle text-amber-200 opacity-85 select-none">👑</div>
          <div className="absolute top-[50%] left-[8%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-90 select-none">💎</div>
          <div className="absolute top-[70%] right-[10%] text-3xl sm:text-4xl deco-twinkle-in text-amber-200 opacity-90 select-none">🥂</div>
          <div className="absolute top-[88%] left-[10%] text-2xl sm:text-3xl deco-twinkle-in text-amber-300 opacity-85 select-none">✨</div>
        </div>
      )}

      {/* BIRTHDAY MINIMAL CLEAN */}
      {bgType === 'minimal-clean' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:5rem_5rem]" />
          <div className="absolute top-[15%] left-[10%] text-2xl animate-twinkle opacity-60 select-none">✧</div>
          <div className="absolute top-[45%] right-[10%] text-2xl animate-twinkle opacity-60 select-none">✦</div>
          <div className="absolute top-[75%] left-[12%] text-2xl deco-twinkle-in opacity-60 select-none">○</div>
        </div>
      )}

      {/* SHARED BIRTHDAY CONFETTI SPRINKLE — subtle extra layer on top of
          any party backdrop so every birthday cover feels lively and rich. */}
      {BIRTHDAY_CONFETTI_TYPES.includes(bgType) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 deco-fade-in">
          {CONFETTI_COLORS.map((color, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute top-0 w-2 h-3 rounded-[2px] animate-confetti-fall"
              style={{
                left: `${(i * 7.7 + 4) % 92}%`,
                backgroundColor: color,
                opacity: 0.6,
                animationDelay: `${(i % 5) * 1.6}s`,
                animationDuration: `${10 + (i % 3) * 3}s`,
              }}
            />
          ))}
          <span aria-hidden className="absolute top-[18%] left-[12%] text-2xl animate-sparkle opacity-70 select-none">✨</span>
          <span aria-hidden className="absolute top-[58%] right-[8%] text-xl animate-sparkle opacity-60 select-none" style={{ animationDelay: '1.4s' }}>🎈</span>
        </div>
      )}

      {/* LAYER 4: Soft Vignette Overlay to ensure 100% WCAG AA text legibility */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none z-0 backdrop-brightness-[0.97]" />

      {/* LAYER 5: Main Content Render */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
};
