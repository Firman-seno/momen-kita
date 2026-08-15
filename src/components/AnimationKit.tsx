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

   ANIMATION RULES (applied globally to EVERY template):
   1. Entrance plays exactly ONCE, the first time the element
      enters the viewport. A `hasAnimated` latch is stored in a
      ref so leaving the viewport, scrolling back, or re-rendering
      the parent can NEVER restart it.
   2. After entrance the element stays in its final, STATIC state.
      No loops, no re-triggers, no reset-on-scroll.
   3. Scroll detection uses a single shared IntersectionObserver
      (pooled per threshold) — efficient, no per-element observers.
   4. Only GPU-friendly properties (opacity / transform / filter)
      are animated → no layout jumps, no scrollbar changes.
   5. prefers-reduced-motion: elements render immediately in their
      normal, visible position — no animation at all.
   ============================================================ */

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface AnimProfile {
  ease: [number, number, number, number];
  stagger: number;
  duration: number;
  heroDuration: number;
}

export const PROFILES: Record<CategoryKey, AnimProfile> = {
  birthday: { ease: [0.16, 1, 0.3, 1], stagger: 0.1, duration: 0.5, heroDuration: 0.8 },
  sunatan: { ease: [0.22, 1, 0.36, 1], stagger: 0.12, duration: 0.55, heroDuration: 0.85 },
  wedding: { ease: [0.22, 1, 0.36, 1], stagger: 0.15, duration: 0.6, heroDuration: 0.9 },
  aqiqah: { ease: [0.2, 0.9, 0.3, 1], stagger: 0.12, duration: 0.55, heroDuration: 0.85 },
  education: { ease: [0.22, 1, 0.36, 1], stagger: 0.12, duration: 0.55, heroDuration: 0.85 },
  religious: { ease: [0.22, 1, 0.36, 1], stagger: 0.15, duration: 0.6, heroDuration: 0.85 },
  tasyakuran: { ease: [0.22, 1, 0.36, 1], stagger: 0.12, duration: 0.55, heroDuration: 0.85 },
  gathering: { ease: [0.16, 1, 0.3, 1], stagger: 0.1, duration: 0.5, heroDuration: 0.8 },
  business: { ease: [0.22, 1, 0.36, 1], stagger: 0.12, duration: 0.5, heroDuration: 0.8 },
  anniversary: { ease: [0.22, 1, 0.36, 1], stagger: 0.15, duration: 0.6, heroDuration: 0.9 },
  family: { ease: [0.2, 0.9, 0.3, 1], stagger: 0.12, duration: 0.55, heroDuration: 0.85 },
  'doa-haul': { ease: [0.22, 1, 0.36, 1], stagger: 0.15, duration: 0.6, heroDuration: 0.85 },
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
  | 'fade'
  | 'card';

const hiddenFor = (variant: RevealVariant): Record<string, number | string> => {
  switch (variant) {
    case 'up':
      return { opacity: 0, y: 20 };
    case 'down':
      return { opacity: 0, y: -16 };
    case 'left':
      return { opacity: 0, x: -20 };
    case 'right':
      return { opacity: 0, x: 20 };
    case 'scale':
      return { opacity: 0, scale: 0.94 };
    case 'zoom':
      return { opacity: 0, scale: 1.04 };
    case 'blur':
      return { opacity: 0, filter: 'blur(8px)' };
    case 'photo':
      return { opacity: 0, scale: 0.96, filter: 'blur(6px)' };
    case 'card':
      return { opacity: 0, y: 16 };
    default:
      return { opacity: 0, y: 16 };
  }
};

const show = (): Record<string, number | string> => ({
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
});

/* ============================================================
   SHARED SCROLL DETECTION (IntersectionObserver)
   -----------------------------------------
   One observer per threshold value is created lazily and reused by
   every element that needs that threshold. On the FIRST intersection
   the element's callback fires once, then the element is unobserved —
   this is the `hasAnimated` latch: it can never fire again, even if
   the element leaves and re-enters the viewport.
   ============================================================ */

const observerPool = new Map<number, IntersectionObserver>();
const pending = new Map<Element, () => void>();

function getObserver(amount: number): IntersectionObserver {
  let obs = observerPool.get(amount);
  if (!obs) {
    obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const cb = pending.get(entry.target);
          if (cb) {
            pending.delete(entry.target);
            obs!.unobserve(entry.target);
            cb();
          }
        }
      },
      { threshold: amount }
    );
    observerPool.set(amount, obs);
  }
  return obs;
}

/**
 * Observes `ref.current` and returns `shown`, which flips to `true`
 * exactly once when the element first enters the viewport. The latch
 * is stored in `shownRef` so it is immune to scroll direction, parent
 * re-renders, and viewport exits. When `disabled` is true (reduced
 * motion or SSR without IntersectionObserver) the element is shown
 * immediately with no animation.
 */
function useEntrance(amount: number, disabled: boolean): { ref: React.RefObject<HTMLDivElement | null>; shown: boolean } {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const shownRef = React.useRef(disabled);
  const [shown, setShown] = React.useState(disabled);

  React.useEffect(() => {
    if (shownRef.current) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      shownRef.current = true;
      setShown(true);
      return;
    }

    const obs = getObserver(amount);
    const fire = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      setShown(true);
    };
    pending.set(el, fire);
    obs.observe(el);

    return () => {
      if (pending.get(el) === fire) pending.delete(el);
      obs.unobserve(el);
    };
  }, [amount]);

  return { ref, shown };
}

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

/**
 * Single element scroll-reveal.
 *
 * ONCE-ONLY GUARANTEE: when the element first enters the viewport a
 * `hasAnimated` latch flips and the entrance animation plays. Scrolling
 * away and back, or re-rendering the parent, does NOT restart it — the
 * element stays in its final static state forever after.
 *
 * With `onView={false}` the animation plays once on mount instead.
 */
export const Reveal: React.FC<RevealProps> = (props) => {
  const reduce = useReducedMotion();

  // Reduced motion: render fully visible, no animation, no observer.
  if (reduce) {
    return (
      <div className={props.className} style={props.style}>
        {props.children}
      </div>
    );
  }

  return <RevealMotion {...props} />;
};

/** Internal motion layer for Reveal (keeps hook order stable). */
const RevealMotion: React.FC<RevealProps> = ({
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
  const effDuration = duration ?? (profile?.duration ?? 0.75);
  const ease = profile?.ease ?? EASE_OUT;
  const hidden = hiddenFor(variant);

  if (!onView) {
    return (
      <motion.div
        className={className}
        style={style}
        initial={hidden}
        animate={show()}
        transition={{ duration: effDuration, ease, delay }}
      >
        {children}
      </motion.div>
    );
  }

  const { ref, shown } = useEntrance(amount, false);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={hidden}
      animate={shown ? show() : hidden}
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

/**
 * Container that staggers its <StaggerChild> elements sequentially.
 * Like `Reveal`, it animates ONCE (hasAnimated latch) — the whole group
 * plays on first viewport entry, then stays still forever.
 *
 * With `onView={false}` the group animates once on mount instead.
 */
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

  // Reduced motion: render fully visible, no animation, no observer.
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const animateProp = onView ? undefined : 'show';

  return (
    <StaggerMotion
      className={className}
      style={style}
      delay={delay}
      effStagger={effStagger}
      effDuration={effDuration}
      ease={ease}
      onView={onView}
      amount={amount}
      animateProp={animateProp}
    >
      {children}
    </StaggerMotion>
  );
};

interface StaggerMotionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay: number;
  effStagger: number;
  effDuration: number;
  ease: number[];
  onView: boolean;
  amount: number;
  animateProp?: string;
}

/** Internal motion layer for Stagger (keeps hooks order stable). */
const StaggerMotion: React.FC<StaggerMotionProps> = ({
  children,
  className,
  style,
  delay,
  effStagger,
  effDuration,
  ease,
  onView,
  amount,
  animateProp,
}) => {
  const { ref, shown } = useEntrance(amount, !onView);

  return (
    <AnimContext.Provider value={{ duration: effDuration, ease }}>
      <motion.div
        ref={ref}
        className={className}
        style={style}
        initial="hidden"
        animate={onView ? (shown ? 'show' : 'hidden') : animateProp}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: effStagger,
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

  // Reduced motion: render fully visible, no animation.
  if (reduce) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: hiddenFor(variant),
        show: {
          ...show(),
          transition: { duration: duration ?? ctx.duration, ease: ctx.ease },
        },
      }}
    >
      {children}
    </motion.div>
  );
};
