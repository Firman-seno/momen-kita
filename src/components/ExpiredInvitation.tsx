import React from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Template } from '../types';
import { TemplateBackground } from './TemplateBackground';
import { UiButton } from './UiButton';
import { resolveDesignSystem } from '../design/families';
import {
  CakeMark,
  CrownMark,
  EightStar,
  PartyPopper,
  SparkleMark,
  OrnamentProps,
} from '../design/ornaments';
import { EASE_OUT } from './AnimationKit';

/* ============================================================
   EXPIRED INVITATION — themed "Undangan Telah Berakhir" page
   ------------------------------------------------------------
   Shown by InvitationExpirationGuard the moment the event's date
   + time (WIB-anchored) has passed. Reuses the template's own
   ThemeBackground + design family, so an expired invitation still
   looks like the wedding / birthday / sunatan invitation it was —
   but communicates clearly that the event is over, offers no
   "Buka Undangan", plays no music, and hides all sections.
   ============================================================ */

interface ExpiredInvitationProps {
  template: Template;
  /** Event date string as stored on the invitation (may be empty). */
  date: string;
  /** Event time string as stored on the invitation (may be empty). */
  time: string;
  onGoHome: () => void;
}

const pickOrnament = (template: Template): React.FC<OrnamentProps> => {
  const cat = template.category;
  if (cat === 'birthday') return CakeMark;
  if (cat === 'wedding' || cat === 'anniversary') return CrownMark;
  if (cat === 'sunatan' || cat === 'religious' || cat === 'doa-haul') return EightStar;
  if (cat === 'gathering') return PartyPopper;
  return SparkleMark;
};

export const ExpiredInvitation: React.FC<ExpiredInvitationProps> = ({
  template,
  date,
  time,
  onGoHome,
}) => {
  const { family } = resolveDesignSystem(template);
  const Ornament = pickOrnament(template);
  const accent = family.accent;
  const hasEventInfo = Boolean(date?.trim()) || Boolean(time?.trim());

  return (
    <MotionConfig reducedMotion="user">
      <TemplateBackground themeStyle={template.themeStyle}>
        <div className="w-full relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
          {/* Two gently floating accent marks — kept sparse per the "not too
              busy" rule; the themed background already carries the atmosphere. */}
          <motion.span
            aria-hidden
            className="absolute top-[16%] left-[8%] text-2xl sm:text-3xl opacity-70 select-none pointer-events-none"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {template.category === 'birthday' ? '🎈' : '✦'}
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute top-[70%] right-[8%] text-2xl sm:text-3xl opacity-60 select-none pointer-events-none"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            {template.category === 'birthday' ? '✨' : '❋'}
          </motion.span>

          <motion.div
            className="w-full max-w-md text-center flex flex-col items-center gap-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            {/* Themed icon */}
            <motion.div
              className="w-20 h-20 rounded-full bg-white/10 border backdrop-blur-md flex items-center justify-center shadow-xl"
              style={{ borderColor: `${accent}55`, boxShadow: `0 0 34px ${accent}33` }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
            >
              <Ornament color={accent} className="w-10 h-10" />
            </motion.div>

            {/* Badge */}
            <div
              className="px-4 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] bg-white/5 backdrop-blur"
              style={{ color: accent, borderColor: `${accent}44` }}
            >
              Undangan Telah Berakhir
            </div>

            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ fontFamily: template.themeStyle.fontFamilyTitle }}
            >
              {template.category === 'birthday' ? 'Pesta Telah Usai' : 'Acara Telah Selesai'}
            </h1>

            <p className="font-body text-sm sm:text-base text-white/80 leading-relaxed max-w-sm">
              Terima kasih atas perhatian dan kehadiran Anda. Undangan ini tidak dapat dibuka
              kembali karena waktu acara telah berakhir.
            </p>

            {hasEventInfo && (
              <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md max-w-xs w-full">
                <span className="material-symbols-outlined text-base opacity-70" style={{ color: accent }}>
                  event_busy
                </span>
                <span className="font-body text-xs sm:text-sm text-white/85 leading-relaxed">
                  {date?.trim()}
                  {date?.trim() && time?.trim() ? ' • ' : ''}
                  {time?.trim()}
                </span>
              </div>
            )}

            <UiButton
              size="lg"
              fullWidth
              variant="primary"
              icon="auto_awesome"
              iconFilled
              className="mt-2"
              onClick={onGoHome}
            >
              Kembali ke MomenKita
            </UiButton>
          </motion.div>
        </div>
      </TemplateBackground>
    </MotionConfig>
  );
};
