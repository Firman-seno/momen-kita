import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CategoryKey } from '../types';

/* ============================================================
   PREMIUM ANIMATION KIT
   -----------------------------------------
   A universal, reusable stagger / scroll-reveal system shared
   by every invitation template. Each category uses its own
   animation profile so the motion feels native to the design:
   - birthday → playful & bouncy
   - sunatan  → elegant, calm & Islamic
   - wedding  → romantic & cinematic
   - aqiqah   → soft, cute & warm
   Only GPU-friendly properties (opacity / transform / filter)
   are animated, and all motion respects prefers-reduced-motion.
   ============================================================ */

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface AnimProfile {
  ease: [number, number, number, number];
  stagger: number;
  duration: number;
  heroDuration: number;
}

export const PROFILES: Record<CategoryKey, AnimProfile> = {
  birthday: { ease: [0.16, 1, 0.3, 1], stagger: 0.12, duration: 0.65, heroDuration: 0.9 },
  sunatan: { ease: [0.22, 1, 0.36, 1], stagger: 0.18, duration: 0.75, heroDuration: 1.0 },
  wedding: { ease: [0.22, 1, 0.36, 1], stagger: 0.2, duration: 0.8, heroDuration: 1.1 },
  aqiqah: { ease: [0.2, 0.9, 0.3, 1], stagger: 0.15, duration: 0.7, heroDuration: 0.95 },
  education: { ease: [0.22, 1, 0.36, 1], stagger: 0.18, duration: 0.75, heroDuration: 1.0 },
  religious: { ease: [0.22, 1, 0.36, 1], stagger: 0.2, duration: 0.8, heroDuration: 1.05 },
  tasyakuran: { ease: [0.22, 1, 0.36, 1], stagger: 0.18, duration: 0.75, heroDuration: 1.0 },
  gathering: { ease: [0.16, 1, 0.3, 1], stagger: 0.12, duration: 0.65, heroDuration: 0.9 },
  business: { ease: [0.22, 1, 0.36, 1], stagger: 0.14, duration: 0.7, heroDuration: 0.95 },
  anniversary: { ease: [0.22, 1, 0.36, 1], stagger: 0.2, duration: 0.8, heroDuration: 1.1 },
  family: { ease: [0.2, 0.9, 0.3, 1], stagger: 0.15, duration: 0.7, heroDuration: 0.95 },
  'doa-haul': { ease: [0.22, 1, 0.36, 1], stagger: 0.2, duration: 0.8, heroDuration: 1.05 },
};

export const getProfile = (category: CategoryKey): AnimProfile =>
  PROFILES[category] || PROFILES.birthday;

export type RevealVariant =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'scale'
  | 'zoom'
  | 'blur'
  | 'photo'
  | 'fade';

const hiddenFor = (variant: RevealVariant, reduce: boolean): Record<string, number | string> => {
  if (reduce) return { opacity: 0 };
  switch (variant) {
    case 'up':
      return { opacity: 0, y: 36 };
    case 'down':
      return { opacity: 0, y: -32 };
    case 'left':
      return { opacity: 0, x: -36 };
    case 'right':
      return { opacity: 0, x: 36 };
    case 'scale':
      return { opacity: 0, scale: 0.9 };
    case 'zoom':
      return { opacity: 0, scale: 1.07 };
    case 'blur':
      return { opacity: 0, filter: 'blur(10px)' };
    case 'photo':
      return { opacity: 0, scale: 0.92, filter: 'blur(10px)' };
    default:
      return { opacity: 0, y: 24 };
  }
};

const show = (reduce: boolean): Record<string, number | string> =>
  reduce
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' };

interface AnimContextValue {
  duration: number;
  ease: number[];
}

const AnimContext = React.createContext<AnimContextValue>({ duration: 0.7, ease: EASE_OUT });

export interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  onView?: boolean;
  profile?: AnimProfile;
}

/** Single element scroll-reveal. Plays once when it enters the viewport. */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'up' as RevealVariant,
  delay = 0,
  duration,
  amount = 0.2,
  className,
  style,
  onView = true,
  profile,
}) => {
  const reduce = useReducedMotion();
  const effDuration = duration ?? (profile?.duration ?? 0.75);
  const ease = profile?.ease ?? EASE_OUT;

  return (
    <motion.div
      className={className}
      style={style}
      initial={hiddenFor(variant, !!reduce)}
      {...(onView ? { whileInView: show(!!reduce) } : { animate: show(!!reduce) })}
      viewport={{ once: true, amount }}
      transition={{ duration: effDuration, ease, delay }}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: number;
  duration?: number;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  onView?: boolean;
  profile?: AnimProfile;
}

/** Container that staggers its <StaggerChild> elements sequentially. */
export const Stagger: React.FC<StaggerProps> = ({
  children,
  delay = 0,
  stagger,
  duration,
  amount = 0.15,
  className,
  style,
  onView = true,
  profile,
}) => {
  const reduce = useReducedMotion();
  const effStagger = stagger ?? (profile?.stagger ?? 0.15);
  const effDuration = duration ?? (profile?.duration ?? 0.7);
  const ease = profile?.ease ?? EASE_OUT;

  return (
    <AnimContext.Provider value={{ duration: effDuration, ease }}>
      <motion.div
        className={className}
        style={style}
        initial="hidden"
        {...(onView ? { whileInView: 'show' } : { animate: 'show' })}
        viewport={{ once: true, amount }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: reduce ? 0 : effStagger,
              delayChildren: delay,
              duration: effDuration,
              ease,
            },
          },
        }}
      >
        {children}
      </motion.div>
    </AnimContext.Provider>
  );
};

export interface StaggerChildProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

/** One step inside a <Stagger> group. Must be a direct descendant. */
export const StaggerChild: React.FC<StaggerChildProps> = ({
  children,
  variant = 'up' as RevealVariant,
  className,
  style,
  duration,
}) => {
  const reduce = useReducedMotion();
  const ctx = React.useContext(AnimContext);

  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: hiddenFor(variant, !!reduce),
        show: {
          ...show(!!reduce),
          transition: { duration: duration ?? ctx.duration, ease: ctx.ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
