import React from 'react';
import { UiButton } from './UiButton';

interface AccessDeniedProps {
  onGoHome: () => void;
  onTryAdmin?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onGoHome, onTryAdmin }) => {
  return (
    <div className="flex-grow w-full min-h-screen flex items-center justify-center px-4 py-16 pt-24 bg-background">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-4xl text-rose-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">
          Akses Tidak Diizinkan
        </h1>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Halaman ini hanya dapat digunakan oleh administrator MomenKita.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
          <UiButton size="lg" fullWidth variant="primary" icon="auto_awesome" iconFilled onClick={onGoHome}>
            Kembali ke MomenKita
          </UiButton>
          {onTryAdmin && (
            <UiButton size="lg" fullWidth variant="secondary" icon="shield" onClick={onTryAdmin}>
              Login Admin
            </UiButton>
          )}
        </div>
      </div>
    </div>
  );
};
