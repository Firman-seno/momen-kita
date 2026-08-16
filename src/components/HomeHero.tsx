import React from 'react';
import { NavigationTab, CategoryKey } from '../types';
import { CATEGORIES, TEMPLATES, getCategoryCount } from '../data/templates';
import { buildWaLink, homepageWaMessage } from '../lib/whatsapp';
import { UiButton } from './UiButton';

interface HomeHeroProps {
  onExploreTemplates: () => void;
  onOpenWhatsApp: () => void;
  onSelectCategory: (category: CategoryKey | 'All') => void;
  onSelectTab: (tab: NavigationTab) => void;
}

const FEATURES: { icon: string; title: string; description: string }[] = [
  { icon: 'palette', title: 'Desain Cantik', description: 'Template elegan dengan detail premium untuk setiap momen.' },
  { icon: 'touch_app', title: 'Interaktif', description: 'Cover, animasi, galeri, RSVP & buku tamu dalam satu undangan.' },
  { icon: 'music_note', title: 'Musik & Animasi', description: 'Lagu bebas royalti dan animasi halus yang memikat tamu.' },
  { icon: 'devices', title: 'Responsive', description: 'Tampil sempurna di HP, tablet, dan desktop.' },
  { icon: 'send', title: 'Pesan Mudah', description: 'Cukup chat WhatsApp, undangan siap dibagikan dalam 1–3 jam.' },
  { icon: 'support_agent', title: 'Dukungan Penuh', description: 'Kami bantu mulai dari pemilihan template hingga revisi.' },
];

const STEPS: { icon: string; title: string; description: string }[] = [
  { icon: 'web', title: 'Pilih Template', description: 'Pilih dari 1.200 template sesuai momenmu.' },
  { icon: 'edit_note', title: 'Kirim Data', description: 'Kirim nama, tanggal, foto, lokasi & request via WhatsApp.' },
  { icon: 'brush', title: 'Kami Siapkan Undangan', description: 'Tim kami membuat undangan personalmu dalam 1–3 jam.' },
  { icon: 'send', title: 'Bagikan ke Tamu', description: 'Terima link & QR code, lalu bagikan ke tamu undanganmu.' },
];

export const HomeHero: React.FC<HomeHeroProps> = ({
  onExploreTemplates,
  onOpenWhatsApp,
  onSelectCategory,
  onSelectTab,
}) => {
  const waHref = buildWaLink(homepageWaMessage);

  return (
    <div className="flex-grow pt-20 sm:pt-28 pb-16 sm:pb-24">
      {/* ================= HERO ================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-10 sm:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-3.5 sm:gap-5 text-left">
            <span className="inline-flex items-center gap-1.5 w-fit rounded-full bg-secondary/15 border border-secondary/30 px-3.5 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Digital Invitation for Every Special Moment
            </span>

            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-[1.15] tracking-tight">
              Setiap Momen Berharga,<br className="hidden sm:block" /> Layak Dirayakan
            </h1>

            <p className="font-body text-sm sm:text-base md:text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Undangan digital yang indah, interaktif, dan personal untuk setiap momen spesial bersama orang-orang tersayang.
            </p>
            <p className="font-body text-xs sm:text-sm font-semibold text-primary max-w-lg">
              Birthday, Sunatan, Wedding, Aqiqah, dan berbagai momen spesial lainnya.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-4 w-full sm:w-auto">
              <UiButton
                variant="primary"
                size="lg"
                fullWidth
                icon="explore"
                onClick={onExploreTemplates}
              >
                Jelajahi 400 Template
              </UiButton>
              <UiButton
                variant="secondary"
                size="lg"
                fullWidth
                href={waHref}
                external
                icon="chat"
                iconFilled
              >
                Pesan via WhatsApp
              </UiButton>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4">
              <div>
                <div className="font-headline text-xl sm:text-2xl font-extrabold text-primary">{TEMPLATES.length}+</div>
                <div className="text-[10px] sm:text-xs font-body text-on-surface-variant uppercase tracking-wider">Template</div>
              </div>
              <div className="w-px h-8 bg-outline-variant" />
              <div>
                <div className="font-headline text-xl sm:text-2xl font-extrabold text-primary">4</div>
                <div className="text-[10px] sm:text-xs font-body text-on-surface-variant uppercase tracking-wider">Kategori</div>
              </div>
              <div className="w-px h-8 bg-outline-variant" />
              <div>
                <div className="font-headline text-xl sm:text-2xl font-extrabold text-primary">1–3 Jam</div>
                <div className="text-[10px] sm:text-xs font-body text-on-surface-variant uppercase tracking-wider">Proses</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative w-full h-[280px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-[0px_20px_50px_rgba(20,33,61,0.15)] bg-surface-container flex items-center justify-center border border-secondary/30">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR_OOvUsHpm5e9bdYzEfHxzLHFlsUxE3qn6U6dqEb6oG38DYp5xWVslIg3IfCbOz115ztPvTgQBtIs1wAuR1DJF8oRNSkUSGg__gX8362YjZTEj1ZMjS0iCULr98hwweH_dyMpxQrQoDKPXc6rlGJpBnH15SQvIyT9ZEy2-LEQ0-xkqUTGp5m8tLbf4XWipr-0L1XQh3QSNOE0jeYwxN16rhOJMU2jEpedBlBrAmR58UJNglVpjwYT"
              alt="Undangan Digital MomenKita"
              className="object-cover w-full h-full absolute inset-0 mix-blend-multiply opacity-95 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3.5 py-2 rounded-xl shadow-lg border border-secondary/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
              <span className="text-[11px] font-bold text-primary">Birthday • Wedding • Aqiqah • Sunatan</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-[11px] font-bold text-white">MomenKita — Setiap Momen Berharga</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-12 sm:mt-16 mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
            Temukan Undangan untuk Momen Spesialmu
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Pilihan template elegan untuk berbagai momen berharga.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.key}
              className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl overflow-hidden border border-outline-variant/40 flex flex-col group shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer"
              onClick={() => onSelectCategory(cat.key)}
            >
              <div className="relative h-40 sm:h-44 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14213D]/80 via-[#14213D]/10 to-transparent" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md border border-secondary/30">
                  <span className="text-lg">{cat.emoji}</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <h3 className="font-headline text-xl font-extrabold text-white drop-shadow">{cat.label}</h3>
                  <span className="shrink-0 bg-secondary text-on-secondary font-body text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                    {getCategoryCount(cat.key)} Template
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="mt-auto">
                  <UiButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon="arrow_forward"
                    iconTrailing
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCategory(cat.key);
                    }}
                  >
                    Lihat Template
                  </UiButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
            Kenapa Memilih MomenKita?
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Kami menghadirkan undangan digital yang premium, mudah, dan berkesan.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant/40 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/15 text-primary flex items-center justify-center mb-3 border border-secondary/20">
                <span className="material-symbols-outlined text-xl sm:text-2xl">{f.icon}</span>
              </div>
              <h3 className="font-headline text-sm sm:text-base font-bold text-primary mb-1.5">{f.title}</h3>
              <p className="font-body text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
            Cara Pesan Undangan
          </h2>
          <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Proses sederhana — undangan digitalmu siap dalam hitungan jam.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STEPS.map((s, idx) => (
            <div
              key={s.title}
              className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/40 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all relative"
            >
              <div className="absolute top-4 right-5 font-headline text-3xl sm:text-4xl font-extrabold text-secondary/30">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-on-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl sm:text-2xl">{s.icon}</span>
              </div>
              <h3 className="font-headline text-base font-bold text-primary mb-1.5">{s.title}</h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CTA WHATSAPP ================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-on-primary p-8 sm:p-14 text-center shadow-2xl border border-primary">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-secondary/20 blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-52 h-52 rounded-full bg-secondary/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl sm:text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight">
              Siap Membuat Momenmu Lebih Berkesan?
            </h2>
            <p className="font-body text-sm sm:text-base text-white/80 max-w-xl">
              Konsultasi gratis & pemesanan mudah langsung via WhatsApp.
            </p>
            <UiButton
              variant="accent"
              size="xl"
              href={waHref}
              external
              icon="chat"
              iconFilled
              className="mt-2"
            >
              Pesan via WhatsApp
            </UiButton>
          </div>
        </div>
      </section>
    </div>
  );
};
