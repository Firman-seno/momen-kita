import React from 'react';

/* ============================================================
   RatingStars — read-only star display (1–5).
   Supports full / half / empty stars via layered Material icons.
   ============================================================ */

interface RatingStarsProps {
  value: number;
  /** Font size of a single star in px (default 16). */
  size?: number;
  color?: string;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  size = 16,
  color = '#C9A45C',
  className = '',
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <span
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label={`Rating ${value.toFixed(1)} dari 5`}
    >
      {stars.map((s) => {
        const fill =
          value >= s - 0.25 ? 'full' : value >= s - 0.75 ? 'half' : 'empty';
        return (
          <span
            key={s}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            {/* Outline star (base) */}
            <span
              className="material-symbols-outlined absolute inset-0"
              style={{
                fontSize: size,
                lineHeight: '1',
                color,
                fontVariationSettings: "'FILL' 0",
              }}
            >
              star
            </span>
            {/* Filled star (clipped to half when needed) */}
            <span
              className="material-symbols-outlined absolute inset-0 overflow-hidden"
              style={{
                fontSize: size,
                lineHeight: '1',
                color,
                fontVariationSettings: "'FILL' 1",
                width: fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%',
              }}
            >
              star
            </span>
          </span>
        );
      })}
    </span>
  );
};

/* ============================================================
   RatingStarsInput — interactive 1–5 star picker for the
   mandatory rating flow.
   ============================================================ */

interface RatingStarsInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

export const RatingStarsInput: React.FC<RatingStarsInputProps> = ({
  value,
  onChange,
  size = 34,
  className = '',
}) => {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="radiogroup"
      aria-label="Pilih rating bintang"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= active;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={`${s} bintang`}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onFocus={() => setHover(s)}
            onBlur={() => setHover(0)}
            className={`relative inline-flex items-center justify-center rounded-lg transition-transform cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:scale-110 active:scale-95 ${
              filled ? 'scale-105' : 'opacity-80'
            }`}
            style={{ width: size + 8, height: size + 8 }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: size,
                lineHeight: '1',
                color: '#C9A45C',
                fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
};
