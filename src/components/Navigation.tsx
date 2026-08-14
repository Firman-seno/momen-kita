import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';
import { buildWaLink, homepageWaMessage } from '../lib/whatsapp';
import { UiButton } from './UiButton';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenWhatsApp: (templateInfo?: string) => void;
  onOpenAdminLogin?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenWhatsApp,
  onOpenAdminLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'templates', label: 'Templates' },
    { id: 'categories', label: 'Categories' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'faq', label: 'FAQ' },
  ];

  const waHref = buildWaLink(homepageWaMessage);

  // Close the drawer with the Escape key (keyboard accessibility)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/60 shadow-[0px_10px_30px_rgba(20,33,61,0.08)]">
      {/*
        Responsive states (flex layout, no absolute centering so nothing can overlap):
        - Desktop            >= 1280px : logo + all links + Kelola Undangan + WhatsApp CTA
        - Tablet landscape   1024–1279 : logo + links + WhatsApp CTA (admin moves to drawer)
        - Tablet portrait    768–1023  : logo + WhatsApp CTA + hamburger (links in drawer)
        - Mobile              < 768px  : logo + hamburger (everything in drawer)
      */}
      <div className="flex justify-between items-center h-16 sm:h-20 px-3.5 sm:px-5 xl:px-6 max-w-[1280px] mx-auto gap-2 sm:gap-3">
        {/* Logo / Wordmark — never shrinks, never wraps */}
        <button
          onClick={() => {
            onSelectTab('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl md:text-2xl font-bold font-headline text-primary cursor-pointer tracking-tight shrink-0 whitespace-nowrap rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <span
            className="material-symbols-outlined text-xl sm:text-2xl text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          MomenKita
        </button>

        {/* Nav Links — centered in the remaining space (flex-1), shown on
            tablet landscape and up */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-5 xl:gap-6 min-w-0">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center whitespace-nowrap py-2 font-body text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isActive
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:scale-[1.02]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right actions — compact group that never forces overflow */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Kelola Undangan — desktop only (secondary action) */}
          <button
            onClick={() => onOpenAdminLogin?.()}
            className="hidden xl:inline-flex items-center gap-1.5 font-body text-[11px] font-extrabold uppercase tracking-wider text-primary border border-primary/40 rounded-full px-4 py-2.5 hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            title="Buka halaman login admin"
          >
            <span className="material-symbols-outlined text-sm">dashboard</span>
            Kelola Undangan
          </button>

          {/* Primary CTA — kept visible from tablet portrait up */}
          <div className="hidden md:block shrink-0">
            <UiButton
              variant="primary"
              size="md"
              href={waHref}
              external
              icon="chat"
              iconFilled
            >
              Pesan via WhatsApp
            </UiButton>
          </div>

          {/* Hamburger — mobile + tablet portrait (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-on-surface w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-high/60 active:bg-surface-container-high cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / tablet-portrait Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          aria-label="Menu navigasi"
          className="lg:hidden bg-surface-container-lowest/98 backdrop-blur-xl border-b border-outline-variant/60 px-5 py-5 flex flex-col gap-3 shadow-2xl max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left font-body text-sm font-bold uppercase tracking-wider py-3 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                currentTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{item.label}</span>
              <span className="material-symbols-outlined text-base opacity-60">chevron_right</span>
            </button>
          ))}
          <button
            onClick={() => {
              onOpenAdminLogin?.();
              setMobileMenuOpen(false);
            }}
            className="text-left font-body text-sm font-bold uppercase tracking-wider py-3 px-3 rounded-xl transition-colors cursor-pointer flex items-center justify-between text-primary hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 w-full"
            title="Buka halaman login admin"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">dashboard</span>
              Kelola Undangan
            </span>
            <span className="material-symbols-outlined text-base opacity-60">chevron_right</span>
          </button>
          <UiButton
            variant="primary"
            size="md"
            fullWidth
            href={waHref}
            external
            icon="chat"
            iconFilled
            className="mt-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pesan via WhatsApp
          </UiButton>
        </div>
      )}
    </nav>
  );
};
