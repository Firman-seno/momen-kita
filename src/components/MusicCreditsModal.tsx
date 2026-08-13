import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { MusicCredit, displayMusicNumber } from '../data/musicCredits';
import { TEMPLATES } from '../data/templates';
import { stopPreview, previewTrack } from '../lib/audioEngine';

interface MusicCreditsModalProps {
  onClose: () => void;
  onSelectTemplate?: (catKey: string, num: string) => void;
}

export const MusicCreditsModal: React.FC<MusicCreditsModalProps> = ({
  onClose,
  onSelectTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewingNumber, setPreviewingNumber] = useState<string | null>(null);

  const categories = ['All', 'Birthday', 'Sunatan', 'Wedding', 'Aqiqah'];

  const credits: MusicCredit[] = useMemo(
    () => TEMPLATES.map((t) => t.music),
    []
  );

  const filteredCredits = credits.filter((item) => {
    const matchesSearch =
      item.templateNumber.includes(searchTerm) ||
      item.musicTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handlePreview = (credit: MusicCredit) => {
    if (previewingNumber === credit.templateNumber) {
      stopPreview();
      setPreviewingNumber(null);
      return;
    }
    stopPreview();
    setPreviewingNumber(credit.templateNumber);
    previewTrack([credit.musicUrl, credit.fallbackUrl], 0.35, 10000, (credit.startTime || 0) * 1000);
    window.setTimeout(() => {
      if (previewingNumber === credit.templateNumber) {
        stopPreview();
        setPreviewingNumber(null);
      }
    }, 10000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">library_music</span>
            </div>
            <div>
              <h2 className="font-headline text-lg font-bold text-amber-300">
                Katalog & Lisensi Musik Royalty-Free (400 Template)
              </h2>
              <p className="text-xs text-slate-400">
                400 Audio Terlisensi Komersial untuk Birthday, Sunatan, Wedding & Aqiqah
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search & Category Filters */}
        <div className="p-4 bg-slate-950/30 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Template (cth: 057, Birthday, Selawat Syukur)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Track List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-slate-400 mb-2 flex justify-between items-center px-1">
            <span>Menampilkan {filteredCredits.length} dari 400 Musik</span>
            <span className="text-emerald-400 font-semibold">✓ Safe for Commercial Use</span>
          </div>

          {filteredCredits.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada musik yang cocok dengan pencarian "{searchTerm}".
            </div>
          ) : (
            filteredCredits.map((credit: MusicCredit) => (
              <div
                key={credit.templateNumber}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-mono text-xs font-bold border border-amber-400/30 shrink-0">
                    #{credit.templateNumber}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {credit.musicTitle}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                        {credit.category}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Artist: <strong className="text-slate-300">{credit.artist}</strong> • Source: {credit.source}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mood: {credit.musicMood} • Durasi: {Math.round(credit.durationSec / 60)}m {credit.durationSec % 60}s
                    </p>
                    <p className="text-[11px] text-emerald-400/90 mt-1">
                      Lisensi: {credit.license}
                    </p>
                    <a
                      href={credit.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky-400 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Buka halaman sumber <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => handlePreview(credit)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1 justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {previewingNumber === credit.templateNumber ? 'stop' : 'play_circle'}
                    </span>
                    {previewingNumber === credit.templateNumber ? 'Stop' : 'Preview'}
                  </button>

                  {onSelectTemplate && (
                    <button
                      onClick={() => {
                        stopPreview();
                        const num = credit.templateNumber.slice(1);
                        const catKey = CAT_KEY_MAP[credit.templateNumber[0]];
                        onSelectTemplate(catKey, num);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1 justify-center"
                    >
                      <Eye size={14} aria-hidden="true" />
                      Lihat Demo {displayMusicNumber(credit)}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          Semua trek disesuaikan dengan tema visual template di 4 kategori: Birthday, Sunatan, Wedding & Aqiqah (total 400 template). Setiap template memiliki lagu yang cocok dengan desainnya.
        </div>
      </div>
    </div>
  );
};

const CAT_KEY_MAP: Record<string, string> = {
  b: 'birthday',
  s: 'sunatan',
  w: 'wedding',
  a: 'aqiqah',
};
