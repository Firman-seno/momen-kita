import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import { Template, WishItem, EventDetails } from '../types';
import { AnimProfile, Reveal, Stagger, StaggerChild } from '../components/AnimationKit';
import { DemoContent } from './content';
import { CountdownParts } from '../lib/eventDateTime';
import { DesignResolution, FamilyConfig } from './types';
import { isPaperFamily } from './families';
import {
  SectionHeading,
  PrimaryButton,
  CardShell,
  AmbientMarks,
  CornerOrnaments,
  FamilyPhotoFrame,
  CountdownBlock,
  GalleryBlock,
  IconTile,
  CoverRibbon,
  useText,
  radiusFor,
  isBirthdayFamily,
  CoverBadge,
  BirthdayDecor,
  BirthdaySectionOrnament,
  ConfettiFlourish,
} from './blocks';
import {
  EightStar,
  StarDivider,
  PartyBand,
  ScriptSwirl,
  ArchWreath,
  ArabesqueDivider,
  LeafSprig,
  BalloonArch,
  ComicBurst,
  RocketMark,
  CrownMark,
  CandyStripe,
  RainbowArc,
  StarBurst,
  CrownDivider,
  ConfettiDivider,
  ThinDivider,
  dividerFor,
  CakeMark,
  BalloonMark,
  PartyPopper,
  SparkleMark,
  Bunting,
} from './ornaments';
import { InvitationVideo } from '../components/InvitationVideo';

/* ============================================================
   INVITATION SECTIONS — family-aware rendering
   ============================================================ */

export interface SectionProps {
  ds: DesignResolution;
  family: FamilyConfig;
  themeStyle: Template['themeStyle'];
  template: Template;
  profile: AnimProfile;
  content: DemoContent;
  eventDetails: EventDetails;
  catLabel: string;
  catEmoji: string;
  templateNumber: string;
  onOpen: () => void;
  countdown: CountdownParts;
  onGalleryClick: (url: string) => void;
  onMapOpen: () => void;
  rsvpData: { name: string; attendance: string; guests: number; message: string };
  rsvpSubmitted: boolean;
  /** Server rejection message (e.g. expired invitation) shown above the form. */
  rsvpError?: string;
  onRsvpChange: (patch: Partial<SectionProps['rsvpData']>) => void;
  onRsvpSubmit: (e: React.FormEvent) => void;
  wishesList: WishItem[];
  newWishName: string;
  newWishText: string;
  wishSuccess: boolean;
  /** Server rejection message (e.g. expired invitation) shown above the form. */
  wishError?: string;
  onWishNameChange: (v: string) => void;
  onWishTextChange: (v: string) => void;
  onWishSubmit: (e: React.FormEvent) => void;
  videoUrl?: string;
  videoType?: string;
  videoName?: string;
}

type P = SectionProps;

/* ============================================================
   COVER — 10 distinct compositions
   ============================================================ */

export const CoverView: React.FC<P> = (p) => {
  const { family, themeStyle, content, eventDetails } = p;
  const { base, isPaper } = useText(family);
  const isBirthday = p.template.category === 'birthday';
  const titleColor = isPaper ? '#3d2f12' : themeStyle.textColor;
  const subColor = isPaper ? 'text-slate-600' : 'text-white/80';

  const titleBlock = (
    <>
      {isBirthday && (
        <div className="mb-3">
          <CoverBadge family={family} />
        </div>
      )}
      <h1
        className={`text-4xl sm:text-5xl font-black leading-tight drop-shadow-sm ${family.titleTracking} ${family.titleTransform}`}
        style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
      >
        {content.mainTitle}
        <span className="text-xl sm:text-2xl block mt-2 font-semibold normal-case tracking-normal opacity-90">
          {content.eventSubtitle}
        </span>
      </h1>
    </>
  );

  const datePill = (
    <div
      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2`}
      style={{
        backgroundColor: isPaper ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)',
        border: `1px solid ${family.accent}44`,
        color: isPaper ? '#6b5a2e' : undefined,
      }}
    >
      <span className="material-symbols-outlined text-sm" style={{ color: family.accent }}>event</span>
      {eventDetails.date}
    </div>
  );

  const openButton = (
    <PrimaryButton family={family} themeStyle={themeStyle} onClick={p.onOpen} className="max-w-xs">
      <Mail size={18} aria-hidden="true" />
      {isBirthday ? 'Buka Undangan' : 'Open Invitation'}
    </PrimaryButton>
  );

  switch (p.ds.coverStyle) {
    /* ---------------- ORNATE: framed card, gold corners ---------------- */
    case 'ornate': {
      const isLux = family.key === 'luxury' || family.key === 'traditional-indonesian';
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-5 sm:p-8 relative z-20">
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto">
            <StaggerChild variant="zoom" duration={0.9}>
              <div
                className={`relative p-6 sm:p-8 border-2 border-double ${isLux ? 'border-amber-200/40' : 'border-white/25'} rounded-[2rem]`}
                style={{
                  background: isPaper ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.32)',
                  boxShadow: `0 30px 80px rgba(0,0,0,0.45), inset 0 0 60px ${family.accent}0d`,
                }}
              >
                <CornerOrnaments family={family} />
                <div className="relative flex flex-col items-center gap-5 text-center">
                  <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} Invitation`} />
                  <ArchWreath color={family.accent} className="w-40 opacity-90 -mb-2" />
                  <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-70">{family.motto}</div>
                  {titleBlock}
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
                  {datePill}
                  {openButton}
                </div>
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- ARCH-WINDOW: big arch photo + wreath ---------------- */
    case 'arch-window': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.2} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label="You Are Invited" />
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.95}>
              <div className="relative flex justify-center">
                <div
                  className="absolute -inset-6 rounded-t-full opacity-60 blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}33, transparent 70%)` }}
                />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>
              <div className="text-[11px] font-bold uppercase tracking-[0.35em] opacity-70">{family.motto}</div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              {titleBlock}
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- SPLIT: photo + text side by side (wide) ---------------- */
    case 'split': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-5 sm:p-8 relative z-20">
          <Stagger profile={p.profile} onView={false} delay={0.15} stagger={0.16} className="w-full max-w-lg my-auto">
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel}`} />
            </StaggerChild>
            <StaggerChild variant="photo" duration={1}>
              <div className={`flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 mt-8 ${isPaper ? '' : ''}`}>
                <div className="sm:w-[45%] flex justify-center">
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} size="small" />
                </div>
                <div className={`sm:w-[55%] flex flex-col items-center sm:items-start text-center sm:text-left gap-4 ${base}`}>
                  <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: family.accent }}>
                    {family.motto}
                  </div>
                  <h1
                    className={`text-4xl sm:text-5xl font-black leading-tight ${family.titleTracking} ${family.titleTransform}`}
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
                  >
                    {content.mainTitle}
                  </h1>
                  <p className="text-lg font-semibold opacity-90">{content.eventSubtitle}</p>
                  {datePill}
                  <div className="w-full max-w-[240px]">
                    <PrimaryButton family={family} themeStyle={themeStyle} onClick={p.onOpen}>
                      <Mail size={16} aria-hidden="true" /> Open
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- EDITORIAL: big type, photo below ---------------- */
    case 'editorial': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20">
          <Stagger profile={p.profile} onView={false} delay={0.15} stagger={0.16} className="w-full max-w-md my-auto flex flex-col items-center text-center">
            <StaggerChild variant="down" duration={0.7}>
              <div className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: family.accent }}>
                {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className={`mt-4 text-5xl sm:text-6xl font-black leading-[1.05] tracking-tight`}
                style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
              >
                {content.mainTitle}
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <p className={`mt-3 text-lg font-medium ${subColor}`}>{content.eventSubtitle}</p>
            </StaggerChild>
            <StaggerChild variant="photo" duration={1}>
              <div className="mt-8 w-full flex justify-center">
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>
              <div className="mt-8">{datePill}</div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="mt-5 w-full max-w-xs">{openButton}</div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BANNER: full-bleed photo with overlay ---------------- */
    case 'banner': {
      return (
        <section className="min-h-screen w-full relative z-20 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={eventDetails.portraitImage} alt="" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: isPaper
                  ? 'linear-gradient(to top, rgba(253,246,232,0.98) 0%, rgba(253,246,232,0.72) 40%, rgba(30,20,5,0.25) 100%)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 100%)',
              }}
            />
          </div>
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.16} className={`relative w-full max-w-md px-6 py-16 text-center ${isPaper ? 'text-[#2a1a08]' : 'text-white'}`}>
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel}`} />
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className={`mt-5 text-4xl sm:text-5xl font-black leading-tight drop-shadow-sm ${family.titleTracking} ${family.titleTransform}`}
                style={{ fontFamily: themeStyle.fontFamilyTitle, color: isPaper ? '#2a1a08' : '#ffffff' }}
              >
                {content.mainTitle}
                <span className="text-xl block mt-2 font-semibold normal-case tracking-normal">{content.eventSubtitle}</span>
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="mt-2 w-full max-w-xs mx-auto">{openButton}</div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- POLAROID-SCATTER: fanned photos ---------------- */
    case 'polaroid-scatter': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="scale" duration={0.9}>
              <div className="relative h-52 sm:h-60 w-64 mx-auto">
                <div className="absolute left-0 top-8 w-32 bg-[#f7f4ec] p-1.5 pb-3 rounded-md shadow-xl -rotate-12 z-0">
                  <div className="w-full aspect-square bg-slate-200 rounded-sm overflow-hidden">
                    <img src={eventDetails.galleryImages[0] || eventDetails.portraitImage} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute right-0 top-4 w-32 bg-[#f7f4ec] p-1.5 pb-3 rounded-md shadow-xl rotate-6 z-10">
                  <div className="w-full aspect-square bg-slate-200 rounded-sm overflow-hidden">
                    <img src={eventDetails.portraitImage} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-36 bg-[#fdf9f1] p-1.5 pb-3 rounded-md shadow-2xl rotate-2 z-20">
                  <div className="w-full aspect-square bg-slate-200 rounded-sm overflow-hidden">
                    <img src={eventDetails.galleryImages[1] || eventDetails.portraitImage} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- ASYM: bold modern asymmetric ---------------- */
    case 'asym': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <Stagger profile={p.profile} onView={false} delay={0.15} stagger={0.15} className="w-full max-w-md my-auto relative">
            <StaggerChild variant="scale" duration={0.8}>
              <div className="absolute -top-14 -right-6 w-32 h-32 opacity-30 rotate-12 pointer-events-none" style={{ backgroundColor: family.accent, clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)' }} />
              <div className="absolute -bottom-10 -left-8 w-24 h-24 opacity-25 -rotate-12 pointer-events-none" style={{ backgroundColor: family.accent, clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)' }} />
            </StaggerChild>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <StaggerChild variant="left" duration={0.8}>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: family.accent }}>
                    {family.motto}
                  </div>
                </StaggerChild>
                <StaggerChild variant="left" duration={0.9}>
                  <h1
                    className="text-4xl sm:text-5xl font-black leading-[1.02] tracking-tight"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
                  >
                    {content.mainTitle}
                  </h1>
                </StaggerChild>
                <StaggerChild variant="left" duration={0.8}>
                  <p className={`mt-2 font-semibold ${subColor}`}>{content.eventSubtitle}</p>
                </StaggerChild>
              </div>
              <StaggerChild variant="photo" duration={1}>
                <div className="shrink-0 -rotate-3 card-lift">
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} size="small" />
                </div>
              </StaggerChild>
            </div>
            <StaggerChild variant="up" duration={0.7}>
              <div className="mt-8 flex items-center gap-4">
                {datePill}
                <div className="flex-1">
                  <PrimaryButton family={family} themeStyle={themeStyle} onClick={p.onOpen}>
                    <Mail size={16} aria-hidden="true" /> Open
                  </PrimaryButton>
                </div>
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- ISLAMIC-ARCH: mosque arch + arabesque ---------------- */
    case 'islamic-arch': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.8}>
              <div className="flex items-center gap-3 text-amber-300">
                <EightStar color={family.accent} className="w-7" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">{family.motto}</span>
                <EightStar color={family.accent} className="w-7" />
              </div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={1}>
              <div className="relative flex justify-center">
                <div className="absolute -inset-4 opacity-50 pointer-events-none" style={{ background: `radial-gradient(circle, ${family.accent}22, transparent 70%)` }} />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="w-64">
                <ArabesqueDivider color={family.accent} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- CARD-FOCUS: printed invitation card ---------------- */
    case 'card-focus': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-5 relative z-20">
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.16} className="w-full max-w-md my-auto">
            <StaggerChild variant="zoom" duration={0.9}>
              <div className="bg-[#fbf5e8] text-slate-800 rounded-2xl shadow-2xl border border-[#e7d6ae] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#b4540a] via-[#d9a441] to-[#b4540a]" />
                <div className="p-7 sm:p-8 flex flex-col items-center text-center gap-4 relative">
                  <CornerOrnaments family={family} color="#b4540a" />
                  <div className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#8a5a22]">
                    {p.catEmoji} {p.catLabel}
                  </div>
                  <LeafSprig color="#b4540a" className="w-14" />
                  <h1 className="text-3xl sm:text-4xl font-black text-[#3b2a12]" style={{ fontFamily: themeStyle.fontFamilyTitle }}>
                    {content.mainTitle}
                    <span className="text-base block mt-1 font-semibold opacity-80">{content.eventSubtitle}</span>
                  </h1>
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} size="small" />
                  <p className="text-xs text-[#8a5a22] font-semibold">{eventDetails.date}</p>
                  <div className="w-full max-w-[240px]">
                    <PrimaryButton family={family} themeStyle={themeStyle} onClick={p.onOpen}>
                      <Mail size={16} aria-hidden="true" /> Open Invitation
                    </PrimaryButton>
                  </div>
                </div>
                <div className="h-2 bg-gradient-to-r from-[#b4540a] via-[#d9a441] to-[#b4540a]" />
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-BALLOON-ARCH: floating balloon arch ---------------- */
    case 'bday-balloon-arch': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <BalloonArch color={family.accent} className="w-56 mx-auto" />
            </StaggerChild>
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} Invitation`} />
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.95}>
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-full opacity-50 blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}44, transparent 70%)` }}
                />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-COMIC-HERO: comic pop-art ---------------- */
    case 'bday-comic-hero': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <div className="flex items-center justify-center gap-2">
                <StarBurst color={family.accent} className="w-8" />
                <span className="text-[11px] font-black uppercase tracking-[0.35em]" style={{ color: family.accent }}>
                  {family.motto}
                </span>
                <StarBurst color={family.accent} className="w-8" />
              </div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.9}>
              <div className="relative">
                <ComicBurst color={family.accent} className="absolute -top-10 -left-8 w-24 opacity-80" />
                <ComicBurst color={family.accent} className="absolute -bottom-8 -right-6 w-16 opacity-60" />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className={`text-4xl sm:text-5xl font-black leading-tight ${family.titleTracking} ${family.titleTransform}`}
                style={{
                  fontFamily: themeStyle.fontFamilyTitle,
                  color: titleColor,
                  WebkitTextStroke: '2px #141020',
                  textShadow: `4px 4px 0 ${family.accent}`,
                }}
              >
                {content.mainTitle}
                <span className="text-xl block mt-2 font-semibold normal-case tracking-normal" style={{ WebkitTextStroke: '0', textShadow: 'none' }}>
                  {content.eventSubtitle}
                </span>
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-SPACE-PORTAL: cosmic ring ---------------- */
    case 'bday-space-portal': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <RocketMark color={family.accent} className="w-14 mx-auto" />
            </StaggerChild>
            <StaggerChild variant="scale" duration={1}>
              <div className="relative">
                <div
                  className="absolute -inset-8 rounded-full opacity-60 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}33, transparent 65%)` }}
                />
                <div
                  className="absolute -inset-3 rounded-full border border-dashed border-white/20 pointer-events-none"
                  style={{ animation: 'spin 30s linear infinite' }}
                />
                <StarBurst color="#ffffff" className="absolute -top-3 -right-4 w-6 opacity-80" />
                <StarBurst color={family.accent} className="absolute -bottom-2 -left-5 w-5 opacity-80" />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-PRINCESS-ARCH: crown + royal arch ---------------- */
    case 'bday-princess-arch': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <CrownMark color={family.accent} className="w-20 mx-auto" />
            </StaggerChild>
            <StaggerChild variant="down" duration={0.7}>
              <div className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: family.accent }}>
                {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={1}>
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-full opacity-40 blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}55, transparent 70%)` }}
                />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="w-48"><CrownDivider color={family.accent} /></div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-PASTEL-CLOUDS: dreamy clouds ---------------- */
    case 'bday-pastel-clouds': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.8}>
              <div className="relative h-16 w-64 mx-auto">
                <div className="absolute left-4 top-6 w-24 h-10 bg-white/25 rounded-full blur-[1px]" />
                <div className="absolute left-24 top-2 w-32 h-12 bg-white/30 rounded-full" />
                <div className="absolute right-4 top-8 w-20 h-9 bg-white/20 rounded-full" />
                <RainbowArc color={family.accent} className="absolute right-8 -top-2 w-24 opacity-80" />
              </div>
            </StaggerChild>
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} Invitation`} />
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.95}>
              <div className="relative">
                <div
                  className="absolute -inset-5 rounded-full opacity-40 blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}44, transparent 70%)` }}
                />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-MINIMAL-TYPE: big type, whitespace ---------------- */
    case 'bday-minimal-type': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative z-20 overflow-hidden">
          <BirthdayDecor family={family} className="opacity-50" />
          <Stagger profile={p.profile} onView={false} delay={0.15} stagger={0.15} className="w-full max-w-md my-auto flex flex-col items-center text-center">
            <StaggerChild variant="up" duration={0.8}>
              <div className="text-[11px] font-bold uppercase tracking-[0.5em]" style={{ color: family.accent }}>
                {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className="mt-4 text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight"
                style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
              >
                {content.mainTitle}
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="w-12 h-px my-5" style={{ backgroundColor: family.accent }} />
            </StaggerChild>
            <StaggerChild variant="photo" duration={1}>
              <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <p className={`mt-5 text-lg font-medium ${subColor}`}>{content.eventSubtitle}</p>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>
              <div className="mt-6">{datePill}</div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="mt-5 w-full max-w-xs">{openButton}</div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-LUXE-CIRCLE: gold gala ---------------- */
    case 'bday-luxe-circle': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <BirthdayDecor family={family} className="opacity-40" />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.8}>
              <div className="text-[11px] font-bold uppercase tracking-[0.45em] text-amber-200/80">
                {p.catEmoji} {p.catLabel} • {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={1}>
              <div className="relative">
                <div
                  className="absolute -inset-8 rounded-full opacity-50 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}22, transparent 70%)` }}
                />
                <div className="absolute -inset-4 rounded-full border border-amber-200/30" />
                <div className="absolute -inset-2 rounded-full border border-amber-200/20" />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="flex items-center gap-3 text-amber-200/80">
                <span className="w-10 h-px bg-gradient-to-r from-transparent to-amber-200/60" />
                <CrownMark color="#d4af37" className="w-10" />
                <span className="w-10 h-px bg-gradient-to-l from-transparent to-amber-200/60" />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-NEON-TILT: neon glow ---------------- */
    case 'bday-neon-tilt': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <div
                className="text-[11px] font-black uppercase tracking-[0.4em]"
                style={{ color: family.accent, textShadow: `0 0 12px ${family.accent}` }}
              >
                {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="photo" duration={1}>
              <div className="relative -rotate-3">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-60 pointer-events-none" style={{ background: family.accent }} />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className={`text-5xl sm:text-6xl font-black leading-[1.02] tracking-tight ${family.titleTransform}`}
                style={{
                  fontFamily: themeStyle.fontFamilyTitle,
                  color: titleColor,
                  textShadow: `0 0 18px ${family.accent}88, 4px 4px 0 ${family.accent}66`,
                }}
              >
                {content.mainTitle}
                <span className="text-xl block mt-2 font-semibold normal-case tracking-normal" style={{ textShadow: 'none' }}>
                  {content.eventSubtitle}
                </span>
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-CANDY-SPLIT: candy stripe split ---------------- */
    case 'bday-candy-split': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-5 sm:p-8 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.15} stagger={0.16} className="w-full max-w-lg my-auto">
            <StaggerChild variant="down" duration={0.7}>
              <CandyStripe color={family.accent} className="w-56 mx-auto mb-4" />
            </StaggerChild>
            <StaggerChild variant="photo" duration={1}>
              <div className={`flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 ${base}`}>
                <div className="sm:w-[45%] flex justify-center">
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} size="small" />
                </div>
                <div className="sm:w-[55%] flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                  <div className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: family.accent }}>
                    {family.motto}
                  </div>
                  <h1
                    className={`text-4xl sm:text-5xl font-black leading-tight ${family.titleTracking} ${family.titleTransform}`}
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
                  >
                    {content.mainTitle}
                  </h1>
                  <p className="text-lg font-semibold opacity-90">{content.eventSubtitle}</p>
                  {datePill}
                  <div className="w-full max-w-[240px]">
                    <PrimaryButton family={family} themeStyle={themeStyle} onClick={p.onOpen}>
                      <Mail size={16} aria-hidden="true" /> Open
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-ELEGANT-FRAME: refined card ---------------- */
    case 'bday-elegant-frame': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-5 sm:p-8 relative z-20">
          <BirthdayDecor family={family} className="opacity-40" />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto">
            <StaggerChild variant="zoom" duration={0.9}>
              <div
                className="relative p-6 sm:p-8 border border-[#c4627e]/40 rounded-[2rem] text-center"
                style={{
                  background: isPaper ? 'rgba(253,246,238,0.92)' : 'rgba(0,0,0,0.32)',
                  boxShadow: `0 30px 80px rgba(0,0,0,0.35), inset 0 0 60px rgba(196,98,126,0.08)`,
                }}
              >
                <CornerOrnaments family={family} color="#c4627e" />
                <div className="relative flex flex-col items-center gap-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.35em]" style={{ color: family.accent }}>
                    {p.catEmoji} {p.catLabel} Invitation
                  </div>
                  <LeafSprig color="#c4627e" className="w-14" />
                  <h1
                    className="text-4xl sm:text-5xl font-black leading-tight italic"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: isPaper ? '#3d2f12' : themeStyle.textColor }}
                  >
                    {content.mainTitle}
                    <span className="text-xl block mt-2 font-semibold normal-case tracking-normal">{content.eventSubtitle}</span>
                  </h1>
                  <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
                  {datePill}
                  {openButton}
                </div>
              </div>
            </StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-RETRO-BURST: 90s backdrop ---------------- */
    case 'bday-retro-burst': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <BirthdayDecor family={family} />
          <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none" style={{ color: family.accent }}>
            <ComicBurst color={family.accent} className="w-[420px] h-[420px]" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, #ffffff 8px, #ffffff 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, #ffffff 8px, #ffffff 9px)',
            }}
          />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} • ${family.motto}`} />
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.9}>
              <div className="relative rotate-1">
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.9}>
              <h1
                className={`text-4xl sm:text-5xl font-black leading-tight ${family.titleTransform}`}
                style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor, textShadow: `3px 3px 0 ${family.accent}` }}
              >
                {content.mainTitle}
                <span className="text-xl block mt-2 font-semibold normal-case tracking-normal" style={{ textShadow: 'none' }}>
                  {content.eventSubtitle}
                </span>
              </h1>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- BDAY-BOHO-FRAME: organic wreath ---------------- */
    case 'bday-boho-frame': {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <BirthdayDecor family={family} className="opacity-60" />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.18} className="w-full max-w-md my-auto flex flex-col items-center gap-4 text-center">
            <StaggerChild variant="down" duration={0.7}>
              <div className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: family.accent }}>
                {family.motto}
              </div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={1}>
              <div className="relative">
                <div
                  className="absolute -inset-6 opacity-40 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${family.accent}33, transparent 70%)` }}
                />
                <ArchWreath color={family.accent} className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 opacity-90" />
                <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
                <LeafSprig color={family.accent} className="absolute -bottom-4 -left-6 w-16 rotate-12" />
                <LeafSprig color={family.accent} className="absolute -bottom-4 -right-6 w-16 -rotate-12" />
              </div>
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }

    /* ---------------- CENTERED (default) ---------------- */
    default: {
      return (
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center relative z-20 overflow-hidden">
          <AmbientMarks family={family} />
          <Stagger profile={p.profile} onView={false} delay={0.2} stagger={0.2} className="w-full max-w-md my-auto flex flex-col items-center gap-4 relative z-10">
            <StaggerChild variant="down" duration={0.7}>
              <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} Invitation`} />
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>
              <div className="text-[11px] font-bold uppercase tracking-[0.35em] opacity-70">{family.motto}</div>
            </StaggerChild>
            <StaggerChild variant="scale" duration={0.95}>
              <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} />
            </StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{titleBlock}</StaggerChild>
            <StaggerChild variant="up" duration={0.7}>{datePill}</StaggerChild>
            <StaggerChild variant="up" duration={0.8}>{openButton}</StaggerChild>
          </Stagger>
        </section>
      );
    }
  }
};

/* ============================================================
   UNVEILED HEADER
   ============================================================ */

export const UnveiledHeader: React.FC<P> = (p) => {
  const { family, themeStyle, content, eventDetails } = p;
  const { isPaper } = useText(family);
  const isBirthday = p.template.category === 'birthday';
  const titleColor = isPaper ? '#3d2f12' : themeStyle.textColor;

  return (
    <header className="min-h-[85vh] flex flex-col items-center justify-center text-center py-10 relative">
      <AmbientMarks family={family} className="!absolute" />
      {isBirthday && (
        <>
          <BirthdayDecor family={family} className="!absolute" />
          <Bunting color={family.accent} className="absolute top-3 left-1/2 -translate-x-1/2 w-56 opacity-70" />
        </>
      )}
      <Stagger profile={p.profile} onView={false} delay={0.1} stagger={0.18} className="flex flex-col items-center gap-4 relative z-10 my-auto">
        {isBirthday && (
          <StaggerChild variant="down" duration={0.6}>
            <CoverBadge family={family} />
          </StaggerChild>
        )}
        <StaggerChild variant="down" duration={0.7}>
          <CoverRibbon family={family} label={`${p.catEmoji} ${p.catLabel} Invitation #${p.templateNumber}`} />
        </StaggerChild>
        <StaggerChild variant="scale" duration={0.95}>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full blur-2xl opacity-50 pointer-events-none" style={{ background: `radial-gradient(circle, ${family.accent}26, transparent 70%)` }} />
            <FamilyPhotoFrame family={family} src={eventDetails.portraitImage} alt={content.mainTitle} size="small" />
          </div>
        </StaggerChild>
        <StaggerChild variant="up" duration={0.85}>
          <h1
            className={`text-4xl sm:text-5xl font-black leading-tight ${family.titleTracking} ${family.titleTransform}`}
            style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
          >
            {content.mainTitle}
            <span className="text-xl sm:text-2xl block mt-2 font-semibold normal-case tracking-normal opacity-90">
              {content.eventSubtitle}
            </span>
          </h1>
        </StaggerChild>
        <StaggerChild variant="up" duration={0.7}>
          <div
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg`}
            style={{
              backgroundColor: isPaper ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${family.accent}44`,
              color: isPaper ? '#6b5a2e' : undefined,
            }}
          >
            {eventDetails.date} • {eventDetails.time}
          </div>
        </StaggerChild>
      </Stagger>
    </header>
  );
};

/* ============================================================
   SECTION 2 — MESSAGE / DOA / LOVE STORY
   ============================================================ */
export const MessageSection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const { base, muted } = useText(family);
  return (
    <section className="my-10">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>
        {content.messageHeading}
      </SectionHeading>
      <Reveal profile={p.profile} variant="up" delay={0.1}>
        <CardShell family={family} className={`mt-6 p-6 sm:p-7 text-center relative overflow-hidden ${base}`}>
          {family.ornamentedHeadings && <CornerOrnaments family={family} />}
          <div className="relative">
            <span className="material-symbols-outlined text-4xl block mb-3" style={{ color: family.accent }}>format_quote</span>
            <p className="text-sm sm:text-base leading-relaxed italic">"{content.messageText}"</p>
            <div className={`mt-4 text-xs font-bold uppercase tracking-widest`} style={{ color: family.accent }}>
              — {content.messageBy}
            </div>
          </div>
        </CardShell>
      </Reveal>
    </section>
  );
};

/* ============================================================
   HOST SECTIONS (wedding parents / child / graduate / host)
   ============================================================ */
const HostCard: React.FC<{
  p: P;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: string;
  delay?: number;
}> = ({ p, label, value, sub, icon, delay = 0 }) => {
  const { family } = p;
  const { muted } = useText(family);
  return (
    <Reveal profile={p.profile} variant="card" delay={delay}>
      <CardShell family={family} className="p-5 flex items-start gap-4 relative overflow-hidden">
        <IconTile accent={family.accent}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </IconTile>
        <div className="flex-1">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${muted}`}>{label}</h3>
          <p className="text-base font-bold mt-0.5">{value}</p>
          {sub && <p className={`text-xs mt-0.5 ${muted}`}>{sub}</p>}
        </div>
      </CardShell>
    </Reveal>
  );
};

export const WeddingParentsSection: React.FC<P> = (p) => {
  const { eventDetails } = p;
  return (
    <section className="my-10 flex flex-col gap-3">
      <HostCard p={p} label="Putra dari Bapak & Ibu" value={eventDetails.groomName} sub={eventDetails.groomParents} icon="person" />
      <HostCard p={p} label="Putri dari Bapak & Ibu" value={eventDetails.brideName} sub={eventDetails.brideParents} icon="favorite" delay={0.15} />
    </section>
  );
};

export const ChildParentsSection: React.FC<P> = (p) => {
  const { eventDetails, template } = p;
  const isSunatan = template.category === 'sunatan';
  return (
    <section className="my-10 flex flex-col gap-3">
      <HostCard
        p={p}
        label={isSunatan ? 'Nama Anak' : 'Nama Buah Hati'}
        value={isSunatan ? eventDetails.childName : eventDetails.babyName}
        sub={
          template.category === 'aqiqah' ? (
            <>
              {eventDetails.babyGender && <>Jenis Kelamin: {eventDetails.babyGender}<br /></>}
              {eventDetails.babyBirthDate && <>Lahir: {eventDetails.babyBirthDate}</>}
            </>
          ) : undefined
        }
        icon="child_care"
      />
      <HostCard p={p} label="Orang Tua" value={eventDetails.parentsName} icon="family_restroom" delay={0.15} />
    </section>
  );
};

export const EducationHostSection: React.FC<P> = (p) => {
  const { eventDetails } = p;
  return (
    <section className="my-10 flex flex-col gap-3">
      <HostCard p={p} label="Nama Lulusan" value={eventDetails.graduateName} sub={eventDetails.degreeName} icon="school" />
      <HostCard p={p} label="Perguruan Tinggi" value={eventDetails.institutionName} sub={eventDetails.parentsName} icon="account_balance" delay={0.15} />
    </section>
  );
};

export const ExtendedHostSection: React.FC<P> = (p) => {
  const { eventDetails, template } = p;
  const cat = template.category;
  const icon =
    cat === 'religious'
      ? 'mosque'
      : cat === 'tasyakuran'
        ? 'home'
        : cat === 'gathering'
          ? 'groups'
          : cat === 'business'
            ? 'business_center'
            : cat === 'anniversary'
              ? 'favorite'
              : cat === 'family'
                ? 'family_restroom'
                : 'prayer_times';
  const label =
    cat === 'business'
      ? 'Penyelenggara'
      : cat === 'doa-haul'
        ? 'Atas Nama Keluarga'
        : cat === 'anniversary'
          ? 'Pasangan'
          : 'Penyelenggara';
  const value =
    cat === 'business'
      ? eventDetails.companyName || eventDetails.hostName
      : cat === 'anniversary'
        ? eventDetails.coupleName || eventDetails.hostName
        : eventDetails.hostName || eventDetails.institutionName;
  return (
    <section className="my-10">
      <HostCard
        p={p}
        label={label}
        value={value}
        sub={
          cat === 'doa-haul' && eventDetails.deceasedName ? (
            <span className="italic">Untuk almarhum/almarhumah {eventDetails.deceasedName}</span>
          ) : cat === 'anniversary' && eventDetails.anniversaryYear ? (
            <>Merayakan {eventDetails.anniversaryYear} tahun kebersamaan</>
          ) : undefined
        }
        icon={icon}
      />
    </section>
  );
};

/* ============================================================
   SECTION 3 — EVENT DETAILS
   ============================================================ */
export const EventDetailsSection: React.FC<P> = (p) => {
  const { family, themeStyle, eventDetails, template } = p;
  const { muted } = useText(family);
  const isBirthday = template.category === 'birthday';

  const BIRTHDAY_DRESS_CODES: Record<string, string> = {
    'bday-balloon': 'Festive & Bright',
    'bday-cartoon': 'Colorful Casual',
    'bday-space': 'Galaxy / Space Vibe',
    'bday-princess': 'Fairytale & Pink Royal',
    'bday-pastel': 'Soft Pastels',
    'bday-minimal': 'Smart Casual',
    'bday-luxury': 'Black & Gold Elegance',
    'bday-neon': 'Neon Glow Attire',
    'bday-candy': 'Sweet Candy Colors',
    'bday-elegant': 'Chic & Elegant',
    'bday-retro': 'Retro 90s Pop',
    'bday-boho': 'Boho & Earthy Styles',
  };

  const InfoRow: React.FC<{ icon: string; title: string; main: React.ReactNode; sub?: React.ReactNode }> = ({ icon, title, main, sub }) => (
    <Reveal profile={p.profile} variant="card">
      <CardShell family={family} className="p-5 flex items-start gap-4">
        <IconTile accent={family.accent}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </IconTile>
        <div className="min-w-0">
          <h3 className={`text-[11px] font-bold uppercase tracking-wider ${muted}`}>{title}</h3>
          <p className="text-base font-bold mt-0.5">{main}</p>
          {sub && <p className={`text-xs leading-relaxed mt-1 ${muted}`}>{sub}</p>}
        </div>
      </CardShell>
    </Reveal>
  );

  if (isBirthday) {
    const dressCode = BIRTHDAY_DRESS_CODES[family.key] || 'Festive & Bright';
    return (
      <section className="my-10">
        <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>Event Details</SectionHeading>
        <div className="flex flex-col gap-3 mt-6">
          <Reveal profile={p.profile} variant="card">
            <CardShell family={family} className="p-4 flex items-center gap-4">
              <IconTile accent={family.accent}>
                <CakeMark color={family.accent} className="w-6" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider ${muted}`}>Birthday Party</h3>
                <p className="text-base font-bold mt-0.5">{eventDetails.date}</p>
              </div>
              <div
                className="shrink-0 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-full border shadow-inner"
                style={{
                  backgroundColor: `${family.accent}1f`,
                  borderColor: `${family.accent}44`,
                  color: family.accent,
                }}
              >
                {eventDetails.time}
              </div>
            </CardShell>
          </Reveal>
          <InfoRow icon="pin_drop" title="Venue Location" main={eventDetails.venue} sub={eventDetails.address} />
          <Reveal profile={p.profile} variant="card">
            <CardShell family={family} className="p-4 flex items-center gap-4">
              <IconTile accent={family.accent}>
                <span className="material-symbols-outlined text-2xl">checkroom</span>
              </IconTile>
              <div className="min-w-0 flex-1">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider ${muted}`}>Dress Code</h3>
                <p className="text-base font-bold mt-0.5">{dressCode}</p>
              </div>
              <SparkleMark color={family.accent} className="w-4 shrink-0 animate-sparkle" />
            </CardShell>
          </Reveal>
          <Reveal profile={p.profile} variant="up">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(eventDetails.venue + ' ' + eventDetails.address)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-micro w-full py-3.5 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors hover:opacity-90"
              style={{
                backgroundColor: isPaperFamily(family) ? 'rgba(176,138,62,0.12)' : `${family.accent}26`,
                borderColor: isPaperFamily(family) ? 'rgba(176,138,62,0.4)' : `${family.accent}55`,
                color: isPaperFamily(family) ? '#6b5a2e' : family.accent,
              }}
            >
              <span className="material-symbols-outlined text-sm">directions</span>
              Open Google Maps
            </a>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="my-10">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>Event Details</SectionHeading>
      <div className="flex flex-col gap-3 mt-6">
        {template.category === 'wedding' && (
          <>
            <InfoRow icon="volunteer_activism" title="Akad Nikah" main={eventDetails.akadDate} sub="08.00 WIB - 10.00 WIB" />
            <InfoRow icon="celebration" title="Resepsi" main={eventDetails.resepsiDate} sub={eventDetails.time} />
          </>
        )}
        <InfoRow icon="calendar_today" title="Date & Time" main={eventDetails.date} sub={eventDetails.time} />
        <InfoRow icon="pin_drop" title="Venue Location" main={eventDetails.venue} sub={eventDetails.address} />
      </div>
    </section>
  );
};

/* ============================================================
   SECTION 4 — COUNTDOWN
   ============================================================ */
export const CountdownSection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const isBirthday = p.template.category === 'birthday';
  return (
    <section className="my-10 text-center">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>{content.countdownTitle}</SectionHeading>
      {isBirthday && (
        <div className="mt-5">
          <BirthdaySectionOrnament family={family} />
        </div>
      )}
      <div className={`mt-6 ${isBirthday ? 'relative' : ''}`}>
        {isBirthday && <ConfettiFlourish family={family} className="absolute -top-8 -left-2" />}
        <CountdownBlock family={family} profile={p.profile} countdown={p.countdown} />
      </div>
    </section>
  );
};

/* ============================================================
   SECTION 5 — GALLERY
   ============================================================ */
export const GallerySection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const isBirthday = p.template.category === 'birthday';
  return (
    <section className="my-10">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile} subtitle={content.galleryNote}>
        {content.galleryHeading}
      </SectionHeading>
      {isBirthday && (
        <div className="mt-4">
          <BirthdaySectionOrnament family={family} />
        </div>
      )}
      <div className="mt-6">
        <GalleryBlock
          family={family}
          style={p.ds.galleryStyle}
          profile={p.profile}
          images={p.eventDetails.galleryImages}
          onImageClick={p.onGalleryClick}
        />
      </div>
    </section>
  );
};

/* ============================================================
   SECTION 5b — VIDEO
   ============================================================ */
export const VideoSection: React.FC<P> = (p) => {
  const { family, themeStyle } = p;
  return (
    <section className="my-10">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>Video</SectionHeading>
      <Reveal profile={p.profile} variant="fade" className="mt-6">
        <InvitationVideo
          url={p.videoUrl!}
          type={p.videoType}
          poster={p.eventDetails.portraitImage || undefined}
          name={p.videoName}
        />
      </Reveal>
    </section>
  );
};

/* ============================================================
   SECTION 6 — MAP
   ============================================================ */
export const MapSection: React.FC<P> = (p) => {
  const { family, themeStyle, eventDetails } = p;
  const { muted } = useText(family);
  return (
    <section className="my-10 text-center">
      <SectionHeading family={family} themeStyle={themeStyle} profile={p.profile}>{p.content.mapHeading}</SectionHeading>
      <Stagger profile={p.profile} className={`${radiusFor(family)} overflow-hidden border shadow-2xl p-4 mt-6 ${family.cardClass}`}>
        <StaggerChild variant="fade">
          <p className={`text-xs mb-3 font-semibold ${muted}`}>
            {eventDetails.venue} • {eventDetails.address}
          </p>
        </StaggerChild>
        <StaggerChild variant="photo">
          <div
            onClick={p.onMapOpen}
            className="card-lift w-full h-44 rounded-2xl overflow-hidden relative cursor-pointer group border border-white/10"
          >
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
              alt="Map Location"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">map</span>
                View Interactive Map
              </span>
            </div>
          </div>
        </StaggerChild>
        <StaggerChild variant="up">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(eventDetails.venue + ' ' + eventDetails.address)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-micro mt-4 w-full py-3.5 rounded-2xl bg-white/15 border border-white/25 hover:bg-white/25 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-sm">directions</span>
            Open Google Maps
          </a>
        </StaggerChild>
      </Stagger>
    </section>
  );
};

/* ============================================================
   SECTION 7 — RSVP
   ============================================================ */
export const RsvpSection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const { muted } = useText(family);
  const isPaper = family.cardStyle === 'paper';
  const isBirthday = p.template.category === 'birthday';
  const inputCls = isPaper
    ? 'bg-white/80 border border-[#e0d0a8] text-slate-800 placeholder:text-slate-400 focus:border-[#b08a3e]'
    : 'bg-black/40 border border-white/20 text-white placeholder:text-white/50 focus:border-white';
  const optionCls = isPaper ? 'bg-white text-slate-800' : 'bg-slate-900 text-white';

  return (
    <section className="my-10">
      <Stagger profile={p.profile} className={`${radiusFor(family)} p-6 border shadow-2xl relative overflow-hidden ${family.cardClass}`}>
        {isBirthday && <BirthdayDecor family={family} className="opacity-30" />}
        <StaggerChild variant="up" className="relative z-10">
          <h2
            className="text-2xl font-bold text-center mb-1"
            style={{ fontFamily: themeStyle.fontFamilyTitle, color: isPaper ? '#3d2f12' : themeStyle.textColor }}
          >
            {content.rsvpHeading}
          </h2>
        </StaggerChild>
        <StaggerChild variant="fade" className="relative z-10">
          <p className={`text-xs text-center mb-6 ${muted}`}>{content.rsvpNote}</p>
        </StaggerChild>
        {isBirthday && (
          <StaggerChild variant="fade" className="relative z-10">
            <div className="flex justify-center -mt-3 mb-5">
              <BirthdaySectionOrnament family={family} />
            </div>
          </StaggerChild>
        )}

        {p.rsvpSubmitted ? (
          <StaggerChild variant="scale" className="relative z-10">
            <div className={`p-4 rounded-xl text-center text-xs font-bold animate-fade-in ${isPaper ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'}`}>
              Terima kasih {p.rsvpData.name || 'Tamu'}! Konfirmasi RSVP kamu telah terkirim.
            </div>
          </StaggerChild>
        ) : (
          <>
            {p.rsvpError && (
              <StaggerChild variant="fade" className="relative z-10">
                <div className={`p-4 rounded-xl text-center text-xs font-bold animate-fade-in mb-4 ${isPaper ? 'bg-rose-50 border border-rose-300 text-rose-700' : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'}`}>
                  {p.rsvpError}
                </div>
              </StaggerChild>
            )}
            <form onSubmit={p.onRsvpSubmit} className="flex flex-col gap-3 relative z-10">
            <Reveal profile={p.profile} variant="up" delay={0.05}>
              <input
                type="text"
                required
                value={p.rsvpData.name}
                onChange={(e) => p.onRsvpChange({ name: e.target.value })}
                placeholder="Nama Lengkap Kamu"
                className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none font-body ${inputCls}`}
              />
            </Reveal>
            <Reveal profile={p.profile} variant="up" delay={0.15}>
              <select
                value={p.rsvpData.attendance}
                onChange={(e) => p.onRsvpChange({ attendance: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none font-body ${inputCls}`}
              >
                <option className={optionCls}>Hadir (I'll be there)</option>
                <option className={optionCls}>Maaf, Tidak Bisa Hadir (Can't make it)</option>
              </select>
            </Reveal>
            <Reveal profile={p.profile} variant="up" delay={0.25}>
              <input
                type="number"
                min={1}
                max={10}
                value={p.rsvpData.guests}
                onChange={(e) => p.onRsvpChange({ guests: parseInt(e.target.value) || 1 })}
                placeholder="Jumlah Tamu"
                className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none font-body ${inputCls}`}
              />
            </Reveal>
            <Reveal profile={p.profile} variant="up" delay={0.35}>
              <PrimaryButton family={family} themeStyle={themeStyle} type="submit" className="mt-2">
                Kirim RSVP
              </PrimaryButton>
            </Reveal>
          </form>
          </>
        )}
      </Stagger>
    </section>
  );
};

/* ============================================================
   SECTION 8 — WISHES / GUESTBOOK
   ============================================================ */
export const WishesSection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const { base, muted } = useText(family);
  const isPaper = family.cardStyle === 'paper';
  const inputCls = isPaper
    ? 'bg-white/80 border border-[#e0d0a8] text-slate-800 placeholder:text-slate-400 focus:border-[#b08a3e]'
    : 'bg-black/40 border border-white/20 text-white placeholder:text-white/50 focus:border-white';

  return (
    <section className="my-10">
      <Stagger profile={p.profile} className={`${radiusFor(family)} p-6 border shadow-2xl ${family.cardClass} ${base}`}>
        <StaggerChild variant="up">
          <h2
            className="text-2xl font-bold text-center mb-1"
            style={{ fontFamily: themeStyle.fontFamilyTitle, color: isPaper ? '#3d2f12' : themeStyle.textColor }}
          >
            {content.wishesHeading}
          </h2>
        </StaggerChild>
        <StaggerChild variant="fade">
          <p className={`text-xs text-center mb-6 ${muted}`}>{content.wishesNote}</p>
        </StaggerChild>
        {p.template.category === 'birthday' && (
          <StaggerChild variant="fade">
            <div className="flex justify-center -mt-4 mb-5">
              <BirthdaySectionOrnament family={family} />
            </div>
          </StaggerChild>
        )}

        {p.wishSuccess && (
          <StaggerChild variant="scale">
            <div className={`p-3 mb-4 rounded-xl text-center text-xs font-bold animate-fade-in ${isPaper ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'}`}>
              Terima kasih! Ucapan kamu telah ditambahkan.
            </div>
          </StaggerChild>
        )}

        {p.wishError && (
          <StaggerChild variant="fade">
            <div className={`p-3 mb-4 rounded-xl text-center text-xs font-bold animate-fade-in ${isPaper ? 'bg-rose-50 border border-rose-300 text-rose-700' : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'}`}>
              {p.wishError}
            </div>
          </StaggerChild>
        )}

        <form onSubmit={p.onWishSubmit} className="flex flex-col gap-3 mb-6">
          <Reveal profile={p.profile} variant="up" delay={0.05}>
            <input
              type="text"
              required
              value={p.newWishName}
              onChange={(e) => p.onWishNameChange(e.target.value)}
              placeholder="Nama Kamu"
              className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none font-body ${inputCls}`}
            />
          </Reveal>
          <Reveal profile={p.profile} variant="up" delay={0.15}>
            <textarea
              rows={3}
              required
              value={p.newWishText}
              onChange={(e) => p.onWishTextChange(e.target.value)}
              placeholder={content.wishesPlaceholder}
              className={`w-full px-4 py-3 rounded-xl text-xs focus:outline-none resize-none font-body ${inputCls}`}
            />
          </Reveal>
          <Reveal profile={p.profile} variant="up" delay={0.25}>
            <button
              type="submit"
              className="btn-micro w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-colors cursor-pointer"
              style={{
                backgroundColor: isPaper ? 'rgba(176,138,62,0.14)' : 'rgba(255,255,255,0.14)',
                borderColor: isPaper ? 'rgba(176,138,62,0.4)' : 'rgba(255,255,255,0.3)',
                color: isPaper ? '#6b5a2e' : undefined,
              }}
            >
              {content.wishButton}
            </button>
          </Reveal>
        </form>

        <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
          {p.wishesList.map((wish) => (
            <Reveal key={wish.id} profile={p.profile} variant="card">
              <div className={`p-3.5 rounded-2xl border text-left ${isPaper ? 'bg-white/70 border-[#e7dcc4]' : 'bg-black/35 border-white/10'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: family.accent }}>{wish.name}</span>
                  <span className={`text-[10px] ${muted}`}>{wish.date}</span>
                </div>
                <p className={`text-xs leading-relaxed ${muted}`}>{wish.message}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Stagger>
    </section>
  );
};

/* ============================================================
   SECTION 9 — CLOSING
   ============================================================ */
export const ClosingSection: React.FC<P> = (p) => {
  const { family, themeStyle, content } = p;
  const { isPaper } = useText(family);
  const titleColor = isPaper ? '#3d2f12' : themeStyle.textColor;

  return (
    <Stagger profile={p.profile} className="my-10 text-center relative pt-8">
      <StaggerChild variant="fade">
        <div className="flex justify-center mb-4">
          <div className="w-52" style={{ color: family.accent }}>
            {dividerFor(family.dividerStyle, family.accent)}
          </div>
        </div>
      </StaggerChild>
      <StaggerChild variant="up">
        <div className="text-[11px] font-bold uppercase tracking-[0.35em] opacity-70 mb-2">Thank You</div>
      </StaggerChild>
      <StaggerChild variant="up">
        <h3
          className={`text-2xl sm:text-3xl font-bold mb-4 ${family.titleTracking} ${family.titleTransform}`}
          style={{ fontFamily: themeStyle.fontFamilyTitle, color: titleColor }}
        >
          {content.closingTitle}
        </h3>
      </StaggerChild>
      <StaggerChild variant="up">
        <p className={`text-xs italic max-w-xs mx-auto mb-5 ${isPaper ? 'text-slate-500' : 'opacity-80'}`}>
          "{content.closingQuote}"
        </p>
      </StaggerChild>
      <StaggerChild variant="up">
        <div className="text-sm font-bold" style={{ color: family.accent }}>— {content.closingBy}</div>
      </StaggerChild>
      <StaggerChild variant="fade">
        <div className="mt-6 flex justify-center">
          {family.key === 'islamic' ? (
            <EightStar color={family.accent} className="w-8 opacity-80" />
          ) : family.key === 'kids-fun' ? (
            <PartyBand color={family.accent} className="w-40" />
          ) : family.key === 'floral' || family.key === 'romantic' || family.key === 'bday-elegant' || family.key === 'bday-boho' ? (
            <ScriptSwirl color={family.accent} className="w-44" />
          ) : family.key === 'bday-princess' || family.key === 'bday-luxury' ? (
            <CrownMark color={family.accent} className="w-12 opacity-90" />
          ) : family.key === 'bday-space' ? (
            <RocketMark color={family.accent} className="w-12 opacity-90" />
          ) : family.key === 'bday-neon' ? (
            <StarBurst color={family.accent} className="w-10 opacity-90" />
          ) : family.key === 'bday-balloon' || family.key === 'bday-candy' || family.key === 'bday-pastel' ? (
            <PartyBand color={family.accent} className="w-40" />
          ) : isBirthdayFamily(family) ? (
            <div className="flex items-center gap-5">
              <BalloonMark color={family.accent} className="w-9" />
              <CakeMark color={family.accent} className="w-12" />
              <BalloonMark color={family.accent} className="w-9" />
            </div>
          ) : (
            <StarDivider color={family.accent} className="w-44" />
          )}
        </div>
      </StaggerChild>
    </Stagger>
  );
};
