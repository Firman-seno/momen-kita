import React from 'react';
import { UiButton } from './UiButton';

interface HowItWorksModalProps {
  onClose: () => void;
  onExploreTemplates: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onExploreTemplates }) => {
  const steps = [
    {
      step: '01',
      title: 'Pilih Template',
      description:
        'Jelajahi template undangan digital untuk 12 kategori dan lihat langsung demo interaktifnya.',
      icon: 'touch_app',
    },
    {
      step: '02',
      title: 'Kirim Data',
      description:
        'Klik "Pesan via WhatsApp", lalu kirim foto, tanggal, lokasi, lagu favorit, dan kebutuhan RSVP Anda.',
      icon: 'edit_note',
    },
    {
      step: '03',
      title: 'Kami Siapkan Undangan',
      description:
        'Tim kami menyiapkan link undangan personal Anda dalam 1–3 jam. Anda dapat meminta revisi jika diperlukan.',
      icon: 'brush',
    },
    {
      step: '04',
      title: 'Bagikan ke Tamu',
      description:
        'Terima link unik & QR code yang siap dibagikan via WhatsApp, Instagram, atau email!',
      icon: 'send',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-outline hover:text-on-surface p-1 cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-8">
          <span className="inline-block bg-primary/10 text-primary font-body text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-2">
            Proses 4 Langkah Mudah
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
            Bagaimana MomenKita Bekerja
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-1 max-w-md mx-auto">
            Undangan digital interaktif (Birthday, Sunatan, Wedding, Aqiqah) siap dalam hitungan jam.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-headline text-lg font-extrabold text-secondary">{s.step}</span>
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </div>
              </div>
              <h3 className="font-headline text-base font-bold text-on-surface mt-1">{s.title}</h3>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <UiButton
            variant="primary"
            size="lg"
            icon="explore"
            onClick={() => {
              onClose();
              onExploreTemplates();
            }}
          >
            Jelajahi Template Sekarang
          </UiButton>
        </div>
      </div>
    </div>
  );
};
