import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TEMPLATES, formatRupiah, CATEGORY_EMOJIS, CATEGORY_LABELS, getCategoryTitle } from '../data/templates';
import { Template, CategoryKey, TemplateBadge } from '../types';
import { stopPreview, previewTrack } from '../lib/audioEngine';
import { Eye, MessageSquare, Play, Square } from 'lucide-react';
import { TemplateImage } from './TemplateImage';

interface TemplateCatalogProps {
  initialCategory?: string;
  onOpenDemo: (template: Template) => void;
  onOpenWhatsApp: (template: Template) => void;
  onOrder: (template: Template) => void;
}

export const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: 'All', label: 'ALL' },
  { key: 'birthday', label: 'BIRTHDAY' },
  { key: 'sunatan', label: 'SUNATAN' },
  { key: 'wedding', label: 'WEDDING' },
  { key: 'aqiqah', label: 'AQIQAH' },
];

const BADGE_STYLES: Record<TemplateBadge, string> = {
  POPULAR: 'bg-[#14213D] text-white',
  NEW: 'bg-emerald-600 text-white',
  TRENDING: 'bg-[#C9A45C] text-[#14213D]',
  FEATURED: 'bg-[#8a6a2c] text-white',
};

const CATEGORY_CHIP_STYLES: Record<string, string> = {
  birthday: 'bg-[#14213D]/90 text-white',
  sunatan: 'bg-[#5a6b53]/90 text-white',
  wedding: 'bg-[#C9A45C]/95 text-[#14213D]',
  aqiqah: 'bg-[#8a6a2c]/90 text-white',
};

const readCategoryFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category');
  if (cat && ['birthday', 'sunatan', 'wedding', 'aqiqah'].includes(cat)) return cat;
  return 'All';
};

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
  initialCategory,
  onOpenDemo,
  onOpenWhatsApp,
  onOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && initialCategory !== 'All' ? initialCategory : readCategoryFromUrl()
  );
  const [totalResults, setTotalResults] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [previewingUid, setPreviewingUid] = useState<string | null>(null);

  // Stop any active music preview when the component unmounts
  useEffect(() => {
    return () => stopPreview();
  }, []);

  const handlePreviewMusic = (template: Template) => {
    const uid = template.uid;
    if (previewingUid === uid) {
      stopPreview();
      setPreviewingUid(null);
      return;
    }
    stopPreview();
    setPreviewingUid(uid);
    previewTrack(
      [template.musicUrl, template.music.fallbackUrl],
      0.35,
      10000,
      (template.music.startTime || 0) * 1000
    );
    window.setTimeout(() => {
      if (previewingUid === uid) {
        stopPreview();
        setPreviewingUid(null);
      }
    }, 10000);
  };

  useEffect(() => {
    if (initialCategory && initialCategory !== 'All') {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TEMPLATES.length };
    (['birthday', 'sunatan', 'wedding', 'aqiqah'] as CategoryKey[]).forEach((k) => {
      counts[k] = TEMPLATES.filter((t) => t.category === k).length;
    });
    return counts;
  }, []);

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === 'All' || template.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!q) return true;

      const haystack = [
        template.name,
        template.id,
        template.templateNumber,
        template.categoryLabel,
        template.category,
        template.subcategory,
        template.designStyle,
        template.colorPalette,
        template.typographyStyle,
        template.illustrationStyle,
        template.layoutStyle,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
    setTotalResults(result.length);
    return result;
  }, [searchQuery, selectedCategory]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(window.location.search);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    const qs = params.toString();
    window.history.pushState({}, '', qs ? `/templates?${qs}` : '/templates');
  };

  return (
    <div className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-12 pt-28">
      {/* Header Section */}
      <header className="text-center mb-8 sm:mb-10 flex flex-col items-center">
        <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-2 sm:mb-3 tracking-tight">
          {selectedCategory === 'All' ? 'Undangan Digital Premium' : `${CATEGORY_EMOJIS[selectedCategory as CategoryKey] || ''} ${getCategoryTitle(selectedCategory as CategoryKey)}`}
        </h1>
        <p className="font-body text-xs sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed">
          Pilih dari {TEMPLATES.length} template undangan digital untuk {CATEGORY_LABELS.birthday}, {CATEGORY_LABELS.sunatan}, {CATEGORY_LABELS.wedding}, dan {CATEGORY_LABELS.aqiqah}. Setiap template memiliki desain, animasi, musik, dan demo interaktif tersendiri.
        </p>
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant shadow-sm border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-base">auto_awesome</span>
          {TEMPLATES.length} Template Aktif dengan Demo
        </div>
      </header>

      {/* Search & Category Filter Bar */}
      <section className="relative z-10 bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl p-3 sm:p-5 mb-6 sm:mb-8 border border-outline-variant/40 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg sm:text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau nomor template..."
              className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-xs sm:text-sm text-on-surface transition-colors placeholder:text-outline/70 shadow-inner box-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base sm:text-lg">cancel</span>
              </button>
            )}
          </div>

          {/* Category Pills (horizontally scrollable on mobile) */}
          <div className="w-full overflow-x-auto pb-1 lg:pb-0 hide-scrollbar flex gap-1.5 sm:gap-2 scroll-smooth">
            {CATEGORY_FILTERS.map((f) => {
              const isActive = selectedCategory === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => handleSelectCategory(f.key)}
                  className={`whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-body text-[11px] sm:text-xs font-bold tracking-wider transition-all cursor-pointer shrink-0 active:scale-95 ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs scale-105'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/40'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 text-[10px] font-extrabold ${isActive ? 'text-on-primary/80' : 'text-outline'}`}>
                    {categoryCounts[f.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 text-center lg:text-left px-1">
          <span className="font-body text-[11px] sm:text-xs text-on-surface-variant">
            Menampilkan <strong className="text-primary">{totalResults}</strong> dari {TEMPLATES.length} template
            {selectedCategory !== 'All' && (
              <>
                {' '}• Kategori <strong className="text-primary">{CATEGORY_LABELS[selectedCategory as CategoryKey]}</strong>
              </>
            )}
            {searchQuery && (
              <>
                {' '}• Kata kunci "<strong className="text-primary">{searchQuery}</strong>"
              </>
            )}
          </span>
        </div>
      </section>

      {/* Templates Grid — 1 col mobile / 2 col tablet / 4 col desktop */}
      {filteredTemplates.length > 0 ? (
        <section
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-4 gap-4 md:gap-5 w-full min-w-0"
        >
          {filteredTemplates.map((template) => (
            <article
              key={template.uid}
              className="template-card group bg-surface-container-lowest rounded-[18px] overflow-hidden border border-outline-variant/40 flex flex-col h-full shadow-sm hover:shadow-xl min-w-0 w-full box-border"
            >
              <TemplateImage
                src={template.image}
                alt={template.name}
                templateId={template.id}
                categoryLabel={template.categoryLabel}
                categoryChipClassName={CATEGORY_CHIP_STYLES[template.category]}
                demoNumber={template.templateNumber}
                demoAccentColor={template.themeStyle.primaryColor}
                badgeText={template.badge}
                badgeClassName={template.badge ? BADGE_STYLES[template.badge] : undefined}
                onClick={() => onOpenDemo(template)}
              />

              <div className="p-3 sm:p-4 flex flex-col flex-grow min-w-0 w-full box-border">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[9px] sm:text-[11px] font-body font-bold text-primary uppercase tracking-wider truncate">
                    {template.subcategory}
                  </span>
                  {template.demoStatus === 'premium' && (
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 rounded-full px-1.5 py-0.5 shrink-0">
                      Premium
                    </span>
                  )}
                </div>
                <h3
                  onClick={() => onOpenDemo(template)}
                  className="font-headline text-sm sm:text-base font-bold text-on-surface mb-1.5 line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-tight min-h-[36px] sm:min-h-[40px]"
                >
                  {template.name}
                </h3>

                {/* Style & Colors */}
                <div className="flex flex-wrap gap-1 mb-1.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded-md bg-surface-container-low border border-outline-variant/40 text-[9px] sm:text-[10px] font-bold text-on-surface-variant truncate max-w-full">
                    {template.designStyle}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2 min-w-0">
                  <span className="flex -space-x-1 shrink-0">
                    <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white/60" style={{ backgroundColor: template.themeStyle.primaryColor }} />
                    <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white/60" style={{ backgroundColor: template.themeStyle.secondaryColor }} />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant truncate">
                    {template.colorPalette}
                  </span>
                </div>

                {/* Short description — clamped so cards stay equal height */}
                <p className="text-[10px] sm:text-[11px] leading-snug text-on-surface-variant line-clamp-2 mb-3">
                  {template.description}
                </p>

                <div className="font-body text-xs sm:text-sm font-extrabold text-on-surface-variant mb-3 whitespace-nowrap">
                  {formatRupiah(template.price)}
                </div>

                {/* Bottom action block — pushed down via mt-auto so every card
                    keeps its buttons aligned at the same height. */}
                <div className="flex flex-col gap-2 w-full min-w-0 mt-auto pt-1 box-border">
                  {/* Music Preview */}
                  <button
                    onClick={() => handlePreviewMusic(template)}
                    className={`w-full min-h-[46px] px-3 py-2 rounded-xl border-2 transition-all flex items-center justify-center gap-2 cursor-pointer box-border text-[11px] sm:text-xs font-bold ${
                      previewingUid === template.uid
                        ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 active:scale-[0.98]'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary hover:bg-surface-container-high active:scale-[0.98]'
                    }`}
                    title={previewingUid === template.uid ? 'Stop Preview Music' : `Preview: ${template.musicTrackName}`}
                  >
                    {previewingUid === template.uid ? (
                      <Square size={14} fill="currentColor" className="shrink-0" aria-hidden="true" />
                    ) : (
                      <Play size={14} fill="currentColor" className="shrink-0" aria-hidden="true" />
                    )}
                    <span className="leading-tight text-center whitespace-nowrap">
                      {previewingUid === template.uid ? 'Stop Musik' : 'Preview Musik'}
                    </span>
                  </button>

                  {/* Customer CTAs — stack vertically on small mobile (text always
                      full), side-by-side from sm up. Equal height, never truncated. */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full min-w-0 box-border">
                    <button
                      onClick={() => onOpenDemo(template)}
                      title="Lihat demo interaktif template ini"
                      className="inline-flex items-center justify-center gap-2 min-h-[52px] w-full px-2.5 sm:px-3 rounded-xl bg-[#14213D] text-white font-bold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border border-[#14213D] shadow-sm hover:bg-[#1d2d54] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all select-none cursor-pointer min-w-0"
                    >
                      <Eye size={15} className="shrink-0" aria-hidden="true" />
                      Lihat Demo
                    </button>
                    <button
                      onClick={() => onOrder(template)}
                      title="Pesan template ini (langsung diisi & bayar di sini)"
                      className="inline-flex items-center justify-center gap-2 min-h-[52px] w-full px-2.5 sm:px-3 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap border border-emerald-600 shadow-sm hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all select-none cursor-pointer min-w-0"
                    >
                      <MessageSquare size={15} className="shrink-0" aria-hidden="true" />
                      Pesan Template
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center glass-panel rounded-2xl max-w-md mx-auto my-8 p-8">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Template tidak ditemukan</h3>
          <p className="font-body text-sm text-on-surface-variant mb-6">
            Tidak ada template dengan kata kunci "{searchQuery}" di kategori ini. Coba kata kunci lain atau pilih kategori berbeda.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleSelectCategory('All');
            }}
            className="bg-primary text-on-primary font-body text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};
