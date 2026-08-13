import React, { useState } from 'react';
import { UiButton } from './UiButton';

interface FAQModalProps {
  onClose: () => void;
  onOpenWhatsApp: () => void;
}

export const FAQModal: React.FC<FAQModalProps> = ({ onClose, onOpenWhatsApp }) => {
  const faqs = [
    {
      q: 'Berapa lama proses pembuatan undangan digital saya?',
      a: 'Proses hanya membutuhkan 1 sampai 3 jam setelah Anda mengirim foto dan detail acara via WhatsApp!',
    },
    {
      q: 'Bisakah saya menambahkan musik latar atau lagu custom?',
      a: 'Bisa! Semua template mendukung lagu latar khusus maupun link lagu favorit Anda (termasuk Spotify).',
    },
    {
      q: 'Bagaimana cara kerja pelacakan RSVP?',
      a: 'Setiap tamu yang mengisi formulir RSVP pada link undangan Anda, Anda akan langsung menerima responsnya via spreadsheet atau notifikasi WhatsApp!',
    },
    {
      q: 'Apakah link undangan aktif selamanya?',
      a: 'Undangan standar aktif selama 6 bulan setelah tanggal acara, sehingga Anda dan tamu bisa kembali melihat foto dan ucapan kapan saja.',
    },
    {
      q: 'Bisakah saya meminta revisi jika detail acara berubah?',
      a: 'Tentu! Perubahan kecil pada teks atau tanggal gratis sebelum dan sesudah undangan disebarkan.',
    },
    {
      q: 'Apakah musiknya bebas royalti untuk konten komersial?',
      a: 'Ya. Semua audio sudah terlisensi komersial dan aman dipublikasikan di WhatsApp, Instagram, & TikTok tanpa copyright strike.',
    },
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-outline-variant/40 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-6">
          <span className="inline-block bg-primary/10 text-primary font-body text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-2">
            Punya Pertanyaan?
          </span>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-surface-container-low border border-outline-variant/40 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-4 font-headline text-sm font-bold text-on-surface flex justify-between items-center cursor-pointer hover:text-primary"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-outline text-lg">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 font-body text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-surface-container p-4 rounded-xl text-center flex flex-col items-center gap-2">
          <p className="font-body text-xs text-on-surface-variant font-semibold">
            Masih ada pertanyaan atau permintaan khusus?
          </p>
          <UiButton
            variant="whatsapp"
            size="md"
            icon="chat"
            iconFilled
            onClick={() => {
              onClose();
              onOpenWhatsApp();
            }}
          >
            Pesan via WhatsApp
          </UiButton>
        </div>
      </div>
    </div>
  );
};
