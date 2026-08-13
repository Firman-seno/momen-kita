import React from 'react';

/* ============================================================
   UiButton — MomenKita Design System Button
   ------------------------------------------------
   One consistent button system across the whole website.

   Variants
     primary   → Deep Navy bg, White text   (default)
     secondary → Warm Ivory/White bg, Deep Navy border + text
     accent    → Champagne Gold bg, Deep Navy text
     whatsapp  → Emerald green bg, white text
     danger    → Rose bg, white text
     ghost     → Transparent, subtle border

   Sizes
     sm  → 36px height  (compact, chips / inline)
     md  → 44px height  (minimum touch target)
     lg  → 54px height  (card action buttons — fixed size)
     xl  → 56px height  (hero / primary CTA)

   Interactions (via .btn-micro)
     transition 0.25–0.3s · hover translateY(-2px) + shadow ·
     active scale(0.98) · respects prefers-reduced-motion
   ============================================================ */

export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'whatsapp'
  | 'danger'
  | 'ghost';

export type UiButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface UiButtonProps {
  variant?: UiButtonVariant;
  size?: UiButtonSize;
  fullWidth?: boolean;
  /** material-symbols-outlined icon name */
  icon?: string;
  iconFilled?: boolean;
  iconTrailing?: boolean;
  href?: string;
  external?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: 'button' | 'submit';
  title?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<UiButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary border border-transparent hover:bg-[#1d2d54] shadow-sm hover:shadow-lg',
  secondary:
    'bg-surface-container-lowest text-primary border border-primary/40 hover:bg-surface-container-high hover:border-primary shadow-sm hover:shadow-md',
  accent:
    'bg-[#C9A45C] text-[#14213D] border border-transparent hover:bg-[#d4b068] shadow-sm hover:shadow-lg',
  whatsapp:
    'bg-emerald-600 text-white border border-transparent hover:bg-emerald-700 shadow-sm hover:shadow-lg',
  danger:
    'bg-rose-600 text-white border border-transparent hover:bg-rose-700 shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-on-surface-variant border border-outline-variant hover:bg-surface-container-high hover:text-on-surface hover:border-outline',
};

const SIZE_CLASSES: Record<UiButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 text-[10px] sm:text-[11px] rounded-lg gap-1.5',
  md: 'min-h-[44px] px-5 text-[11px] sm:text-xs rounded-xl gap-2',
  lg: 'min-h-[54px] px-6 text-xs sm:text-sm rounded-xl gap-2',
  xl: 'min-h-[56px] px-8 text-xs sm:text-sm rounded-2xl gap-2',
};

export const UiButton: React.FC<UiButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconFilled = false,
  iconTrailing = false,
  href,
  external = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
  ariaLabel,
  children,
}) => {
  const classes = [
    'btn-micro',
    'inline-flex',
    'items-center',
    'justify-center',
    'text-center',
    'font-bold',
    'uppercase',
    'tracking-wider',
    'select-none',
    'cursor-pointer',
    'box-border',
    'w-auto',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {icon && !iconTrailing && (
        <span
          className="material-symbols-outlined shrink-0"
          style={iconFilled ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      )}
      {/* Never truncate / ellipsize button labels — text must always be fully visible */}
      <span className="leading-tight">{children}</span>
      {icon && iconTrailing && (
        <span className="material-symbols-outlined shrink-0">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        title={title}
        aria-label={ariaLabel}
        className={classes}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {inner}
    </button>
  );
};
