import React from 'react';

const FALLBACK_IMG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><text x="300" y="390" font-family="sans-serif" font-size="64" text-anchor="middle">✨</text><text x="300" y="470" font-family="sans-serif" font-size="26" fill="#d4af37" text-anchor="middle">Digital Invitation</text></svg>`
  );

interface TemplateImageProps {
  src: string;
  alt: string;
  templateId: string;
  categoryLabel: string;
  categoryChipClassName: string;
  demoNumber: string | number;
  demoAccentColor: string;
  badgeText?: string;
  badgeClassName?: string;
  onClick?: () => void;
}

export const TemplateImage: React.FC<TemplateImageProps> = ({
  src,
  alt,
  templateId,
  categoryLabel,
  categoryChipClassName,
  demoNumber,
  demoAccentColor,
  badgeText,
  badgeClassName,
  onClick,
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== FALLBACK_IMG) img.src = FALLBACK_IMG;
  };

  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden w-full shrink-0 bg-surface-container-low select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Blurred backdrop of the same photo — fills the whole frame so there is
          never any empty whitespace or letterbox, whatever the source ratio. */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={handleError}
        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125"
      />

      {/* Soft gradient for badge legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

      {/* Main image — object-contain so the FULL template artwork is always
          visible and never cropped. */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={handleError}
        className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
      />

      {/* ID badge — top left, fixed for every template */}
      <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-body font-extrabold text-amber-300 shadow-sm border border-white/20">
        {templateId}
      </div>

      {/* Category badge — bottom left, fixed for every template */}
      <div
        className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm backdrop-blur-sm border border-white/20 max-w-[calc(100%-20px)] truncate ${categoryChipClassName}`}
      >
        {categoryLabel}
      </div>

      {/* Demo music badge — bottom right, fixed for every template */}
      <div
        className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm backdrop-blur-sm border border-white/20"
        style={{ backgroundColor: demoAccentColor }}
      >
        🎵 Demo #{demoNumber}
      </div>

      {/* Popular / New / Trending / Featured badge — top right, overlay only */}
      {badgeText && badgeClassName && (
        <div
          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-body font-bold uppercase tracking-wider shadow-sm ${badgeClassName}`}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
};
