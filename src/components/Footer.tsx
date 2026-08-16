import React from "react";
import { NavigationTab, CategoryKey } from "../types";
import { CATEGORIES, getCategoryCount, getTotalTemplateCount } from "../data/templates";
import { buildWaLink, homepageWaMessage, WHATSAPP_ALTERNATE, WHATSAPP_ALTERNATE_DISPLAY, WHATSAPP_PRIMARY_DISPLAY } from "../lib/whatsapp";
import { UiButton } from "./UiButton";

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
  onSelectCategory: (category: CategoryKey | "All") => void;
  onOpenWhatsApp: () => void;
  onOpenDashboard?: () => void;
  onOpenOrderStatus?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onSelectCategory, onOpenWhatsApp, onOpenDashboard, onOpenOrderStatus }) => {
  const waHref = buildWaLink(homepageWaMessage);

  return (
    <footer className="w-full bg-primary text-white mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 py-14 max-w-[1280px] mx-auto">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-2xl font-bold font-headline text-white">
            <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            MomenKita
          </div>
          <p className="font-body text-sm text-white/75 leading-relaxed">
            Setiap Momen Berharga.
            <br />
            Undangan digital modern, elegan, dan interaktif untuk setiap momen spesialmu.
          </p>
          <p className="font-body text-xs text-white/50">© 2026 MomenKita. Semua hak dilindungi.</p>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-body text-xs font-bold uppercase text-secondary mb-1 tracking-wider">Kategori</h4>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer flex items-center gap-2"
            >
              <span>{cat.emoji}</span>
              {cat.label}
              <span className="text-white/40 font-semibold">({getCategoryCount(cat.key)})</span>
            </button>
          ))}
        </div>

        {/* Company */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-body text-xs font-bold uppercase text-secondary mb-1 tracking-wider">MomenKita</h4>
          <button onClick={() => onSelectTab("how-it-works")} className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer">
            Cara Kerja
          </button>
          <button onClick={() => onSelectTab("faq")} className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer">
            FAQ & Bantuan
          </button>
          <button onClick={() => onSelectTab("music-credits")} className="text-left font-body text-xs font-bold text-secondary hover:text-white transition-colors hover:underline underline-offset-4 cursor-pointer flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">music_note</span>
            Lisensi Musik ({getTotalTemplateCount()} Template)
          </button>
          <button onClick={() => onSelectTab("faq")} className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer">
            Ketentuan Layanan
          </button>
          <button onClick={() => onSelectTab("faq")} className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer">
            Kebijakan Privasi
          </button>
          {onOpenOrderStatus && (
            <button onClick={onOpenOrderStatus} className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">receipt_long</span>
              Status Pesanan
            </button>
          )}
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col gap-3">
          <h4 className="font-body text-xs font-bold uppercase text-secondary mb-1 tracking-wider">WhatsApp</h4>
          <UiButton variant="accent" size="md" href={waHref} external icon="chat" iconFilled className="self-start">
            Pesan via WhatsApp
          </UiButton>
          <a href={buildWaLink(homepageWaMessage)} target="_blank" rel="noreferrer" className="text-left font-body text-xs font-bold text-white/85 hover:text-secondary transition-colors cursor-pointer">
            {WHATSAPP_PRIMARY_DISPLAY}
          </a>
          <a href={buildWaLink(homepageWaMessage, WHATSAPP_ALTERNATE)} target="_blank" rel="noreferrer" className="text-left font-body text-xs font-bold text-white/60 hover:text-secondary transition-colors cursor-pointer">
            {WHATSAPP_ALTERNATE_DISPLAY}
          </a>

          {onOpenDashboard && (
            <div className="mt-2 pt-2 border-t border-white/15">
              <button
                onClick={onOpenDashboard}
                className="text-left font-body text-xs font-bold text-white/75 hover:text-secondary transition-colors hover:underline underline-offset-4 cursor-pointer flex items-center gap-1.5"
                title="Buka dashboard admin MomenKita"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Kelola Undangan (Dashboard)
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
