import React from 'react';
import { UiButton } from './UiButton';

interface InvitationNotFoundProps {
  onGoHome: () => void;
}

/** Friendly page for broken / expired invitation links. No technical errors. */
export const InvitationNotFound: React.FC<InvitationNotFoundProps> = ({ onGoHome }) => {
  return (
    <div className="flex-grow w-full min-h-screen flex items-center justify-center px-4 py-16 pt-28 bg-background">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            mail
          </span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          Undangan Tidak Ditemukan
        </h1>
        <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
          Maaf, link undangan ini tidak tersedia atau sudah tidak aktif.
        </p>
        <UiButton
          size="lg"
          fullWidth
          icon="auto_awesome"
          iconFilled
          className="mt-2"
          onClick={onGoHome}
        >
          Kembali ke MomenKita
        </UiButton>
      </div>
    </div>
  );
};
