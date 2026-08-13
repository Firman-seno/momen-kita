import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE_OUT } from './AnimationKit';

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  icon?: string;
}

/** Lightweight non-blocking toast notification. */
export const Toast: React.FC<ToastProps> = ({ open, message, onClose, icon = 'check_circle' }) => {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[100]"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          role="status"
        >
          <div className="flex items-center gap-2.5 bg-primary text-on-primary font-body text-xs sm:text-sm font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10">
            <span className="material-symbols-outlined text-lg text-[#C9A45C]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
            <span className="leading-tight">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
