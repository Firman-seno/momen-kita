import React from 'react';
import { CATEGORIES, TEMPLATES } from '../data/templates';
import { CategoryKey } from '../types';
import { UiButton } from './UiButton';

interface CategoriesPageProps {
  onSelectCategory: (category: CategoryKey) => void;
}

const GRADIENTS: Record<CategoryKey, string> = {
  birthday: 'from-[#C9A45C] via-[#b08a3e] to-[#8a6a2c]',
  sunatan: 'from-[#A8B5A2] via-[#7f8f78] to-[#5a6b53]',
  wedding: 'from-[#14213D] via-[#1d2d54] to-[#3b4f7d]',
  aqiqah: 'from-[#C9A45C] via-[#b08a3e] to-[#8a6a2c]',
  education: 'from-[#1f3a5f] via-[#2c5282] to-[#4a6fa5]',
  religious: 'from-[#14532d] via-[#166534] to-[#3f8c5f]',
  tasyakuran: 'from-[#92400e] via-[#b45309] to-[#d97706]',
  gathering: 'from-[#831843] via-[#be185d] to-[#ec4899]',
  business: 'from-[#1e293b] via-[#334155] to-[#64748b]',
  anniversary: 'from-[#7f1d1d] via-[#b91c1c] to-[#ef4444]',
  family: 'from-[#365314] via-[#4d7c0f] to-[#84cc16]',
  'doa-haul': 'from-[#3f3f46] via-[#52525b] to-[#a1a1aa]',
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  return (
    <div className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-12 pt-28">
      <header className="text-center mb-8 sm:mb-12 flex flex-col items-center">
        <span className="inline-block bg-secondary/15 text-primary font-body text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 border border-secondary/30">
          Pilih Kategori
        </span>
        <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight">
          Kategori Undangan
        </h1>
        <p className="font-body text-xs sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {TEMPLATES.length} template undangan digital dalam 12 kategori. Pilih kategori untuk melihat katalognya.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => {
          const count = TEMPLATES.filter((t) => t.category === cat.key).length;
          return (
            <article
              key={cat.key}
              className="template-card cv-auto bg-surface-container-lowest rounded-2xl sm:rounded-3xl overflow-hidden border border-outline-variant/40 flex flex-col group shadow-sm hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              onClick={() => onSelectCategory(cat.key)}
            >
              <div className="relative h-44 sm:h-56 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14213D]/85 via-[#14213D]/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl drop-shadow">{cat.emoji}</span>
                      <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-white drop-shadow">
                        {cat.label}
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/85 mt-0.5 font-semibold">
                      {cat.tagline}
                    </p>
                  </div>
                  <div className={`shrink-0 bg-gradient-to-br ${GRADIENTS[cat.key]} text-white font-body text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg`}>
                    {count} Template
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="mt-auto flex flex-col gap-2 sm:gap-3">
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
          );
        })}
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 text-center">
        <UiButton
          variant="primary"
          size="lg"
          onClick={() => onSelectCategory('birthday')}
          className="px-8"
        >
          Jelajahi Semua Template
        </UiButton>
      </section>
    </div>
  );
};
