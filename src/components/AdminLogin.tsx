import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { loginAsAdmin } from '../lib/admin';
import { buildWaLink } from '../lib/whatsapp';

interface AdminLoginProps {
  onSuccess: () => void;
  onGoHome: () => void;
  title?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onGoHome, title }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Masukkan email dan password admin.');
      return;
    }
    setSubmitting(true);
    // Small delay so the button shows a "spinner" state before redirecting.
    window.setTimeout(() => {
      if (loginAsAdmin(email, password)) {
        onSuccess();
      } else {
        setError('Email atau password tidak sesuai.');
        setSubmitting(false);
      }
    }, 300);
  };

  return (
    <div className="flex-grow w-full min-h-screen flex items-center justify-center px-4 py-12 sm:py-16 bg-background">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 sm:p-9 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={34} strokeWidth={1.8} />
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">
            {title || 'Login Admin'}
          </h1>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
            Kelola pesanan, undangan, template, dan publikasi undangan Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Masukkan email admin"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3.5 pl-11 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              aria-hidden="true"
            />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Masukkan password"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3.5 pl-11 pr-11 font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-outline/70 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <a
              href={buildWaLink('Halo MomenKita 👋\n\nSaya lupa password untuk login dashboard admin MomenKita. Mohon bantuannya.')}
              target="_blank"
              rel="noreferrer"
              className="font-body text-[11px] sm:text-xs font-bold text-primary hover:underline underline-offset-4 cursor-pointer"
            >
              Lupa Password?
            </a>
          </div>

          {error && (
            <p
              role="alert"
              className="font-body text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
            >
              <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] rounded-xl px-4 font-bold uppercase tracking-wider text-sm text-on-primary bg-primary hover:bg-[#1d2d54] shadow-sm hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                />
                Memeriksa...
              </>
            ) : (
              <>
                <LogIn size={18} aria-hidden="true" />
                Masuk
              </>
            )}
          </button>
        </form>

        <p className="font-body text-[10px] sm:text-[11px] text-outline text-center mt-4 leading-relaxed">
          Halaman ini hanya untuk administrator MomenKita.
        </p>

        <div className="mt-5 pt-4 border-t border-outline-variant/40 flex justify-center">
          <button
            onClick={onGoHome}
            aria-label="Kembali ke MomenKita"
            className="font-body text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary hover:underline underline-offset-4 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke MomenKita
          </button>
        </div>
      </div>
    </div>
  );
};
