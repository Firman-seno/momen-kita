import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from './AnimationKit';

interface LoadingScreenProps {
  label?: string;
}

/** Elegant opening / loading screen shown while an invitation is prepared. */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ label = 'Menyiapkan undangan...' }) => {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-primary text-white">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#C9A45C]/20 border border-[#C9A45C]/40 flex items-center justify-center shadow-lg">
          <span
            className="material-symbols-outlined text-4xl text-[#C9A45C]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div className="font-headline text-2xl font-extrabold tracking-tight">MomenKita</div>
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C9A45C] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#C9A45C] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#C9A45C] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <motion.span
          className="font-body text-xs text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.span>
      </div>
    </div>
  );
};
