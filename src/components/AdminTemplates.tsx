import React, { useEffect, useMemo, useState } from 'react';
import { TEMPLATES, CATEGORY_LABELS } from '../data/templates';
import { Template } from '../types';
import { UiButton } from './UiButton';

/* ============================================================
   AdminTemplates — Template management panel for the admin
   dashboard. Adds live search, category filter, live counts and
   sorting on top of the existing template grid. Filter + search
   state is persisted in the URL (?category= & search=) so it
   survives a page refresh without touching the existing routing.
   ============================================================ */

type CategoryFilter = 'All' | 'birthday' | 'wedding' | 'sunatan' | 'aqiqah' | 'Other';
type SortKey = 'num-asc' | 'num-desc' | 'name-asc' | 'name-desc';

const KNOWN_CATEGORIES: CategoryFilter[] = ['birthday', 'sunatan', 'wedding', 'aqiqah'];

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'wedding', label: 'Wedding' },
  { key: 'sunatan', label: 'Sunatan' },
  { key: 'aqiqah', label: 'Aqiqah' },
  { key: 'Other', label: 'Other' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'num-asc', label: 'Nomor: Rendah → Tinggi' },
  { key: 'num-desc', label: 'Nomor: Tinggi → Rendah' },
  { key: 'name-asc', label: 'Nama: A → Z' },
  { key: 'name-desc', label: 'Nama: Z → A' },
];

const isOther = (t: Template): boolean => !KNOWN_CATEGORIES.includes(t.category);

const matchCategory = (t: Template, cat: CategoryFilter): boolean => {
  if (cat === 'All') return true;
  if (cat === 'Other') return isOther(t);
  return t.category === cat;
};

const sortTemplates = (list: Template[], sort: SortKey): Template[] => {
  const arr = [...list];
  switch (sort) {
    case 'num-asc':
      arr.sort((a, b) => a.templateNumber.localeCompare(b.templateNumber));
      break;
    case 'num-desc':
      arr.sort((a, b) => b.templateNumber.localeCompare(a.templateNumber));
      break;
    case 'name-asc':
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
  return arr;
};

/** Exact-match boost score for number searches (e.g. "005" → #005 first). */
const exactScore = (t: Template, q: string): number => {
  if (t.templateNumber === q || t.id.toLowerCase() === q) return 2;
  if (t.name.toLowerCase() === q) return 1;
  return 0;
};

const readUrlState = (): { category: CategoryFilter; search: string } => {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('category') as CategoryFilter | null;
  const search = params.get('search') || '';
  const category = cat && CATEGORY_FILTERS.some((f) => f.key === cat) ? cat : 'All';
  return { category, search };
};

interface AdminTemplatesProps {
  onNewInvitation: (templateUid: string) => void;
  onCreateOrder: () => void;
}

export const AdminTemplates: React.FC<AdminTemplatesProps> = ({
  onNewInvitation,
  onCreateOrder,
}) => {
  const [category, setCategory] = useState<CategoryFilter>(() => readUrlState().category);
  const [search, setSearch] = useState<string>(() => readUrlState().search);
  const [sort, setSort] = useState<SortKey>('num-asc');

  // Persist category + search in the URL so refresh keeps the view.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (category !== 'All') params.set('category', category);
    else params.delete('category');
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `/admin/dashboard?${qs}` : '/admin/dashboard');
  }, [category, search]);

  // Live counts per category (computed from real data).
  const counts = useMemo(() => {
    const map: Record<CategoryFilter, number> = {
      All: TEMPLATES.length,
      birthday: 0,
      wedding: 0,
      sunatan: 0,
      aqiqah: 0,
      Other: 0,
    };
    TEMPLATES.forEach((t) => {
      const c = KNOWN_CATEGORIES.includes(t.category) ? t.category : 'Other';
      map[c] += 1;
    });
    return map;
  }, []);

  // Filter (real-time, case-insensitive, no network / re-request).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = TEMPLATES.filter((t) => {
      if (!matchCategory(t, category)) return false;
      if (!q) return true;
      const haystack = [
        t.id,
        t.templateNumber,
        t.name,
        t.categoryLabel,
        t.category,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    list = sortTemplates(list, sort);

    // Exact number/name match rises to the top (stable — keeps the chosen sort).
    if (q) {
      list.sort((a, b) => exactScore(b, q) - exactScore(a, q));
    }
    return list;
  }, [category, search, sort]);

  // Grouped view (All + no search) mirrors the original layout: category
  // sections with a count header each.
  const grouped = useMemo(() => {
    if (category === 'All' && !search.trim()) {
      return KNOWN_CATEGORIES.map((cat) => ({
        cat,
        label: CATEGORY_LABELS[cat],
        items: sortTemplates(filtered.filter((t) => t.category === cat), sort),
      })).filter((g) => g.items.length > 0);
    }
    return null;
  }, [category, search, filtered, sort]);

  const flatList = grouped ? [] : filtered;

  const activeLabel =
    category === 'All' ? null : CATEGORY_FILTERS.find((f) => f.key === category)?.label || null;

  const renderCard = (t: Template) => (
    <button
      key={t.uid}
      onClick={() => onNewInvitation(t.uid)}
      className="text-left group bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer flex flex-col min-w-0"
      title={`Buat undangan dari ${t.categoryLabel} #${t.templateNumber}`}
    >
      <div className="aspect-[3/4] overflow-hidden bg-surface-container-low">
        <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
      </div>
      <div className="p-2.5">
        <p className="font-body text-[10px] font-bold text-primary uppercase tracking-wider truncate">{t.categoryLabel} #{t.templateNumber}</p>
        <p className="font-body text-[11px] font-bold text-on-surface truncate">{t.name}</p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="font-body text-xs sm:text-sm text-on-surface-variant">
          Pilih template untuk membuat undangan baru bagi customer. Template master tidak pernah berubah.
        </p>
        <UiButton variant="accent" size="md" icon="receipt_long" iconFilled onClick={onCreateOrder}>
          Buat Pesanan
        </UiButton>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative w-full sm:max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search template by number or name..."
            className="w-full pl-9 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body text-xs sm:text-sm text-on-surface placeholder:text-outline/70 transition-colors"
            aria-label="Cari template berdasarkan nomor atau nama"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <span className="material-symbols-outlined text-sm">cancel</span>
            </button>
          )}
        </div>
        <div className="relative sm:shrink-0">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-sm pointer-events-none">swap_vert</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-8 py-2.5 font-body text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            aria-label="Urutkan template"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category filter — horizontally scrollable on mobile/tablet, no overflow */}
      <div className="flex overflow-x-auto gap-1.5 sm:gap-2 pb-1 hide-scrollbar scroll-smooth">
        {CATEGORY_FILTERS.map((f) => {
          const isActive = category === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setCategory(f.key)}
              className={`whitespace-nowrap px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-body text-[11px] font-bold tracking-wide transition-all cursor-pointer shrink-0 active:scale-95 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/40'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-[10px] font-extrabold ${isActive ? 'text-on-primary/80' : 'text-outline'}`}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Result header */}
      {!grouped && flatList.length > 0 && (
        <p className="font-body text-[11px] sm:text-xs font-bold text-on-surface-variant">
          {activeLabel
            ? `${activeLabel} — ${flatList.length} Templates`
            : `Hasil pencarian — ${flatList.length} Templates`}
          <span className="ml-1.5 font-normal text-outline">
            {activeLabel ? `dari ${counts[category as CategoryFilter]} tersedia` : 'dari semua kategori'}
          </span>
        </p>
      )}

      {/* Empty state */}
      {!grouped && flatList.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
          <h3 className="font-headline text-lg font-bold text-on-surface">No templates found</h3>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant max-w-sm leading-relaxed">
            Try another template number, name, or category.
          </p>
          <UiButton
            variant="secondary"
            size="sm"
            icon="restart_alt"
            onClick={() => {
              setSearch('');
              setCategory('All');
            }}
          >
            Clear Search
          </UiButton>
        </div>
      )}

      {/* Grouped view (All + no search) */}
      {grouped &&
        grouped.map((g) => (
          <div key={g.cat}>
            <h3 className="font-headline text-base font-bold text-primary capitalize mb-3">
              {g.label} — {g.items.length} Templates
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {g.items.map(renderCard)}
            </div>
          </div>
        ))}

      {/* Flat grid (filtered / searched) */}
      {!grouped && flatList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {flatList.map(renderCard)}
        </div>
      )}
    </div>
  );
};
