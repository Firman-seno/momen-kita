import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Template, WishItem, EventDetails } from '../types';
import { formatRupiah, CATEGORY_EMOJIS, CATEGORY_LABELS } from '../data/templates';
import { TemplateAudioEngine } from '../lib/audioEngine';
import { TemplateBackground } from './TemplateBackground';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import { getProfile, EASE_OUT } from './AnimationKit';
import { getTemplatePrice } from '../lib/templatePricing';
import { useCountdown } from '../hooks/useCountdown';
import { RatingSection } from './RatingSection';
import { isValidPublicVideoUrl } from '../lib/videoStorage';
import { submitRsvp, submitWish } from '../lib/serverApi';
import { DemoContent, getDemoContent } from '../design/content';
import { resolveDesignSystem } from '../design/families';
import { SectionProps } from '../design/sections';
import {
  CoverView,
  UnveiledHeader,
  MessageSection,
  WeddingParentsSection,
  ChildParentsSection,
  EducationHostSection,
  ExtendedHostSection,
  EventDetailsSection,
  CountdownSection,
  GallerySection,
  VideoSection,
  MapSection,
  RsvpSection,
  WishesSection,
  ClosingSection,
} from '../design/sections';

interface TemplateDemoViewProps {
  template: Template;
  onOrder: (template: Template) => void;
  onBackToCatalog: () => void;
  /** Customer data override — used by real customer invitations (/i/:slug). */
  eventDetailsOverride?: EventDetails;
  wishesOverride?: WishItem[];
  /** When set, all WhatsApp CTAs chat with the host (customer) instead of ordering. */
  invitationPhone?: string | null;
  /** Public slug used to build the shareable /i/<slug> link in invitation mode. */
  invitationSlug?: string;
  /** Display title used in guest messages in invitation mode. */
  invitationTitle?: string;
  /** True when rendering a real customer invitation (hides admin controls). */
  isInvitation?: boolean;
  /** Admin-chosen music override for a customer invitation (falls back to template default). */
  musicOverride?: {
    title?: string;
    url?: string;
    fallbackUrl?: string;
    /** Skip intro/ambience — start at this second of the track. */
    startTime?: number;
  } | null;
  /** When true, the invitation plays no background music. */
  disableMusic?: boolean;
  /** Customer invitation video (public URL). Rendered for every template. */
  videoOverride?: {
    url?: string;
    type?: string;
    name?: string;
  } | null;
  /** Optional custom back target label/action for invitation mode. */
  onBackLabel?: string;
}

export const TemplateDemoView: React.FC<TemplateDemoViewProps> = ({
  template,
  onOrder,
  onBackToCatalog,
  eventDetailsOverride,
  wishesOverride,
  isInvitation = false,
  musicOverride,
  disableMusic = false,
  videoOverride,
  onBackLabel,
  invitationSlug,
}) => {
  // Admin-chosen music for customer invitations (falls back to template default)
  const activeMusic = {
    title: musicOverride?.title || template.musicTrackName,
    url: musicOverride?.url || template.musicUrl,
    fallbackUrl: musicOverride?.fallbackUrl || template.music.fallbackUrl,
    startTime:
      typeof musicOverride?.startTime === 'number'
        ? musicOverride.startTime
        : template.music.startTime || 0,
  };

  // Cover opening state
  const [coverOpened, setCoverOpened] = useState(false);

  // Customer invitation video — only ever a public https URL (never blob:/data:)
  const activeVideoUrl =
    videoOverride?.url && isValidPublicVideoUrl(videoOverride.url) ? videoOverride.url : undefined;

  // View mode for desktop (phone frame vs full screen)
  const [viewMode, setViewMode] = useState<'phone' | 'fullscreen'>(isInvitation ? 'fullscreen' : 'phone');

  // Music state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [musicError, setMusicError] = useState('');
  const audioEngineRef = useRef<TemplateAudioEngine | null>(null);
  const errorTimerRef = useRef<number | null>(null);
  // Single-flight guard so autoplay and the first-interaction retry never
  // start two overlapping tracks.
  const musicStartRef = useRef<Promise<boolean> | null>(null);

  /**
   * Best-effort background music start used by the mount autoplay and the
   * first-gesture listener. Never shows a control. If the browser blocks the
   * attempt (mobile autoplay policies) it resolves false and clears the ref so
   * a later user gesture can retry.
   */
  const ensureMusicStarted = () => {
    if (!audioEngineRef.current || disableMusic) return Promise.resolve(false);
    if (!musicStartRef.current) {
      musicStartRef.current = audioEngineRef.current
        .startWithFade()
        .then((started) => {
          if (!started) musicStartRef.current = null;
          return started;
        })
        .catch(() => {
          musicStartRef.current = null;
          return false;
        });
    }
    return musicStartRef.current;
  };

  // RSVP state
  const [rsvpData, setRsvpData] = useState({
    name: '',
    attendance: 'Hadir (Will Attend)',
    guests: 1,
    message: '',
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  // Wishes / Guestbook state
  const [wishesList, setWishesList] = useState<WishItem[]>(() => wishesOverride ?? template.sampleWishes ?? []);
  const [newWishName, setNewWishName] = useState('');
  const [newWishText, setNewWishText] = useState('');
  const [wishSuccess, setWishSuccess] = useState(false);
  const [wishError, setWishError] = useState('');

  // Modals
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [musicInfoModalOpen, setMusicInfoModalOpen] = useState(false);

  const effectiveEventDetails: EventDetails = eventDetailsOverride
    ? { ...template.eventDetails, ...eventDetailsOverride }
    : template.eventDetails;

  const { themeStyle } = template;
  const eventDetails = effectiveEventDetails;
  const content = getDemoContent(template, eventDetails);
  const catLabel = CATEGORY_LABELS[template.category];
  const catEmoji = CATEGORY_EMOJIS[template.category];
  const profile = getProfile(template.category);
  const ds = resolveDesignSystem(template);
  const family = ds.family;

  // Live countdown — derived from the SAME eventDetails.date/time that the
  // Date & Time card renders, so display and countdown can never disagree.
  // Single 1s timer, cleared automatically on unmount (see useCountdown).
  const countdown = useCountdown({ date: eventDetails.date, time: eventDetails.time });

  // Shared props for every design-system section
  const sectionProps: SectionProps = {
    ds,
    family,
    themeStyle,
    template,
    profile,
    content,
    eventDetails,
    catLabel,
    catEmoji,
    templateNumber: template.templateNumber,
    onOpen: () => void handleOpenInvitation(),
    countdown,
    onGalleryClick: (url) => setGalleryImage(url),
    onMapOpen: () => setMapModalOpen(true),
    rsvpData,
    rsvpSubmitted,
    rsvpError,
    onRsvpChange: (patch) => setRsvpData((prev) => ({ ...prev, ...patch })),
    onRsvpSubmit: (e) => void handleRSVPSubmit(e),
    wishesList,
    newWishName,
    newWishText,
    wishSuccess,
    wishError,
    onWishNameChange: setNewWishName,
    onWishTextChange: setNewWishText,
    onWishSubmit: (e) => void handleSendWish(e),
    videoUrl: activeVideoUrl,
    videoType: videoOverride?.type,
    videoName: videoOverride?.name,
  };

  // Keep wishes in sync if the override changes (e.g. editor preview remounts).
  useEffect(() => {
    if (wishesOverride) {
      setWishesList(wishesOverride);
    }
  }, [wishesOverride]);

  // Initialize audio engine on template change
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }

    setCoverOpened(false);
    setIsPlayingMusic(false);
    setIsMuted(false);
    setMusicVolume(0.6);
    setMusicBlocked(false);
    setMusicError('');
    if (errorTimerRef.current) {
      window.clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    if (disableMusic) {
      audioEngineRef.current = null;
      return () => {
        if (audioEngineRef.current) {
          audioEngineRef.current.stop();
          audioEngineRef.current = null;
        }
      };
    }

    audioEngineRef.current = new TemplateAudioEngine({
      fontStyle: themeStyle.fontStyle,
      primaryUrl: activeMusic.url,
      fallbackUrl: activeMusic.fallbackUrl,
      volume: 0.6,
      loop: true,
      startTime: activeMusic.startTime,
    });

    // Public invitation: attempt to autoplay the background music as soon as
    // the engine is ready. If autoplay is blocked, the first user interaction
    // (opening the cover) starts it — handled by ensureMusicStarted().
    if (isInvitation) {
      void ensureMusicStarted();
    }

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
        audioEngineRef.current = null;
      }
      musicStartRef.current = null;
    };
  }, [template, activeMusic.url, activeMusic.fallbackUrl, activeMusic.startTime, disableMusic, isInvitation]);

  // Public invitation: the FIRST user gesture anywhere on the page also starts
  // the music, so autoplay-blocked browsers (mobile) reliably begin playing on
  // the very first tap without any visible Play button. The engine bumps an
  // attempt token, so even if the mount autoplay is still hanging this forces
  // a clean fresh start inside the gesture.
  useEffect(() => {
    if (!isInvitation || disableMusic) return;

    const startOnFirstGesture = () => {
      document.removeEventListener('pointerdown', startOnFirstGesture);
      document.removeEventListener('touchstart', startOnFirstGesture);
      document.removeEventListener('keydown', startOnFirstGesture);
      musicStartRef.current = null;
      void ensureMusicStarted();
    };

    document.addEventListener('pointerdown', startOnFirstGesture, { passive: true });
    document.addEventListener('touchstart', startOnFirstGesture, { passive: true });
    document.addEventListener('keydown', startOnFirstGesture);
    return () => {
      document.removeEventListener('pointerdown', startOnFirstGesture);
      document.removeEventListener('touchstart', startOnFirstGesture);
      document.removeEventListener('keydown', startOnFirstGesture);
    };
  }, [isInvitation, disableMusic]);

  // Handle opening invitation & triggering background music immediately
  const showMusicError = (msg: string) => {
    setMusicError(msg);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setMusicError(''), 4500);
  };

  const handleOpenInvitation = async () => {
    setCoverOpened(true);

    // Authoritative fresh start inside the user gesture. Dropping the ref lets
    // the engine start a new attempt; its token invalidates any older hanging
    // autoplay attempt, so two tracks can never overlap. If autoplay already
    // succeeded (desktop) the engine's isPlaying guard turns this into a no-op.
    let started = false;
    const engine = audioEngineRef.current;
    if (engine && !disableMusic) {
      musicStartRef.current = null;
      try {
        started = await engine.startWithFade();
      } catch {
        started = false;
      }
    }

    if (started) {
      setIsPlayingMusic(true);
      setIsMuted(false);
      setMusicVolume(engine?.getVolume() ?? 0.6);
      setMusicBlocked(false);
    } else {
      setIsPlayingMusic(false);
      setMusicBlocked(true);
    }
  };

  const handleTogglePlay = async () => {
    if (!audioEngineRef.current) return;
    try {
      if (isPlayingMusic) {
        await audioEngineRef.current.pause();
        setIsPlayingMusic(false);
      } else {
        await audioEngineRef.current.resume();
        setIsPlayingMusic(true);
        setMusicBlocked(false);
        setMusicError('');
      }
    } catch {
      setIsPlayingMusic(false);
      setMusicBlocked(true);
      showMusicError('Musik tidak dapat diputar saat ini.');
    }
  };

  const handleToggleMute = async () => {
    if (!audioEngineRef.current) return;
    const nextMuted = await audioEngineRef.current.toggleMute();
    setIsMuted(nextMuted);
    setMusicVolume(audioEngineRef.current.getVolume());
  };

  const handleVolumeChange = (vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    setMusicVolume(v);
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(v);
      if (v > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpData.name.trim()) return;
    setRsvpError('');

    // Real guest invitations are validated server-side too, so a manual API
    // call after the event has ended can never be accepted. Demo/catalog mode
    // keeps its local-only success state.
    if (isInvitation && invitationSlug) {
      const res = await submitRsvp({
        slug: invitationSlug,
        name: rsvpData.name.trim(),
        attendance: rsvpData.attendance,
        guests: rsvpData.guests,
        message: rsvpData.message,
      });
      if (!res.ok) {
        setRsvpError(res.error || 'Konfirmasi RSVP tidak dapat dikirim. Silakan coba lagi.');
        return;
      }
    }

    setRsvpSubmitted(true);
    setTimeout(() => {
      setRsvpSubmitted(false);
      setRsvpData({
        name: '',
        attendance: 'Hadir (Will Attend)',
        guests: 1,
        message: '',
      });
    }, 4000);
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishText.trim()) return;
    setWishError('');

    // Same server-side expiry validation as RSVP — expired invitations reject
    // guestbook submissions with "Invitation has expired."
    if (isInvitation && invitationSlug) {
      const res = await submitWish({
        slug: invitationSlug,
        name: newWishName.trim(),
        message: newWishText.trim(),
        attendance: 'Hadir',
      });
      if (!res.ok) {
        setWishError(res.error || 'Ucapan tidak dapat dikirim. Silakan coba lagi.');
        return;
      }
    }

    const newWish: WishItem = {
      id: `w-${Date.now()}`,
      name: newWishName.trim(),
      message: newWishText.trim(),
      date: 'Baru saja',
      attendance: 'Hadir',
    };

    setWishesList([newWish, ...wishesList]);
    setNewWishName('');
    setNewWishText('');
    setWishSuccess(true);
    setTimeout(() => setWishSuccess(false), 3000);
  };

  // Render the core interactive invitation layout wrapped in rich Theme Background
  const renderInvitationContent = () => {
    return (
      <TemplateBackground themeStyle={themeStyle}>
        <div className="w-full relative min-h-screen flex flex-col items-center">
          {/* Floating Music Player (demo/catalog mode only — never shown to guests).
              Public invitations play background music with no visible controls. */}
          {!isInvitation && (
          <div className="fixed right-2.5 sm:right-5 z-40 flex flex-col items-end gap-2 bottom-[84px] sm:bottom-6">
            {musicError && (
              <div className="max-w-[260px] px-3 py-1.5 rounded-full bg-red-600/95 border border-red-300/40 text-white text-[10px] font-bold shadow-xl animate-fade-in">
                {musicError}
              </div>
            )}
            {coverOpened && musicBlocked && !isPlayingMusic && (
              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-2xl cursor-pointer hover:bg-amber-300 transition-colors animate-fade-in"
                title="Putar Musik"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                Putar Musik
              </button>
            )}
            <div className="flex items-center gap-1 bg-black/85 p-1.5 sm:p-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl">
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-md ${
                  isPlayingMusic
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={isPlayingMusic ? { backgroundColor: themeStyle.primaryColor, color: '#ffffff' } : undefined}
                title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
              >
                {isPlayingMusic && (
                  <span className="absolute inset-0 rounded-full border border-white/25 pointer-events-none" />
                )}
                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlayingMusic ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Animated Equalizer while playing */}
              {isPlayingMusic && (
                <div className="flex items-end gap-[3px] h-5 px-0.5" title={template.musicTrackName}>
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '10px', backgroundColor: themeStyle.primaryColor }} />
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '16px', backgroundColor: themeStyle.primaryColor }} />
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '13px', backgroundColor: themeStyle.primaryColor }} />
                </div>
              )}

              {/* Mute */}
              <button
                onClick={handleToggleMute}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  isMuted ? 'bg-amber-400/20 text-amber-300' : 'text-white hover:bg-white/10'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">
                  {isMuted ? 'volume_off' : isPlayingMusic ? 'volume_up' : 'volume_mute'}
                </span>
              </button>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center w-24">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 cursor-pointer accent-amber-400"
                  aria-label="Volume"
                />
              </div>

              {/* Track Info */}
              <button
                onClick={() => setMusicInfoModalOpen(true)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-amber-300 hover:bg-white/10 cursor-pointer transition-colors"
                title="Music Credit & License Info"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">music_note</span>
              </button>
            </div>

            {/* Now Playing label */}
            {isPlayingMusic && (
              <div className="max-w-[220px] truncate px-3 py-1.5 rounded-full bg-black/85 border border-white/15 backdrop-blur-md shadow-xl">
                <span className="text-[10px] sm:text-[11px] font-semibold text-white truncate">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle"></span>
                  {activeMusic.title}
                </span>
              </div>
            )}
          </div>
          )}

          {/* Floating Music Toggle (public invitation only) — a single elegant
              button so guests can always turn the background music on/off.
              Music still autoplays; this is the fallback when a mobile browser
              blocks it. */}
          {isInvitation && !disableMusic && (
            <div className="fixed bottom-5 right-3 sm:right-5 z-40">
              <button
                onClick={() => void handleTogglePlay()}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-pointer transition-colors hover:bg-black/60"
                title={isPlayingMusic ? 'Jeda musik' : 'Putar musik'}
                aria-label={isPlayingMusic ? 'Jeda musik' : 'Putar musik'}
              >
                {isPlayingMusic ? (
                  <span className="flex items-end gap-[3px] h-4" aria-hidden="true">
                    <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '8px' }} />
                    <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '14px' }} />
                    <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '10px' }} />
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-xl text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>
                    music_off
                  </span>
                )}
              </button>
            </div>
          )}

          {/* SECTION 1: COVER VIEW / HERO */}
          {!coverOpened ? (
            <CoverView {...sectionProps} />
          ) : (
            /* UNVEILED INVITATION SECTIONS */
            <div className="w-full pb-28 animate-fade-in max-w-md mx-auto px-4 sm:px-6">
              <UnveiledHeader {...sectionProps} />

              <MessageSection {...sectionProps} />

              {template.category === 'wedding' && (
                <WeddingParentsSection {...sectionProps} />
              )}

              {(template.category === 'sunatan' || template.category === 'aqiqah') && (
                <ChildParentsSection {...sectionProps} />
              )}

              {template.category === 'education' && (
                <EducationHostSection {...sectionProps} />
              )}

              {(template.category === 'religious' ||
                template.category === 'tasyakuran' ||
                template.category === 'gathering' ||
                template.category === 'business' ||
                template.category === 'anniversary' ||
                template.category === 'family' ||
                template.category === 'doa-haul') && (
                <ExtendedHostSection {...sectionProps} />
              )}

              <EventDetailsSection {...sectionProps} />
              <CountdownSection {...sectionProps} />
              <GallerySection {...sectionProps} />

              {activeVideoUrl && <VideoSection {...sectionProps} />}

              <MapSection {...sectionProps} />
              <RsvpSection {...sectionProps} />
              <WishesSection {...sectionProps} />
              <ClosingSection {...sectionProps} />
            </div>
          )}

        </div>
      </TemplateBackground>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className={`flex-grow py-6 px-2 sm:px-6 relative w-full overflow-hidden flex flex-col justify-center items-center bg-slate-950 text-slate-100 min-h-screen ${isInvitation ? 'pt-0' : 'pt-20'}`}>
      {/* Top Header Controls Bar */}
      {!isInvitation && (
      <div className="w-full max-w-[1280px] mx-auto mb-4 sm:mb-6 flex items-center justify-between gap-2 px-3 sm:px-6 z-30 pt-16 sm:pt-20">
        <button
          onClick={onBackToCatalog}
          className="btn-micro flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer bg-slate-900/90 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full border border-slate-800 shadow-lg shrink-0"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{onBackLabel || 'Katalog'}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View mode switcher for desktop screens */}
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 shadow-md">
            <button
              onClick={() => setViewMode('phone')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'phone'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">smartphone</span>
              Mobile Frame View
            </button>
            <button
              onClick={() => setViewMode('fullscreen')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'fullscreen'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">fullscreen</span>
              Full Screen View
            </button>
          </div>

          <button
            onClick={() => onOrder(template)}
            className="btn-micro hidden sm:flex bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-full items-center gap-1.5 shadow-md cursor-pointer transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-base">payments</span>
            Pesan Template #{template.templateNumber} ({formatRupiah(getTemplatePrice(template))})
          </button>
        </div>
      </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[1280px] flex justify-center items-start">
        {/* On Mobile / Fullscreen Mode */}
        <div
          className={`w-full transition-all ${
            viewMode === 'phone'
              ? 'lg:max-w-[430px] lg:border-[12px] lg:border-slate-800 lg:rounded-[48px] lg:shadow-2xl lg:overflow-hidden'
              : 'max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800'
          }`}
        >
          {renderInvitationContent()}
        </div>
      </div>

      {/* Template info: revision allowance + Rating & Ulasan (demo mode only) */}
      {!isInvitation && (
        <div className="w-full max-w-[1280px] mx-auto mt-6 sm:mt-8 px-2 sm:px-6 flex flex-col gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg text-amber-400 shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              sync
            </span>
            <p className="font-body text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Maksimal 3x Revisi</strong> — Setiap pembelian undangan mendapatkan maksimal 3x revisi. Pastikan data yang diberikan sudah benar sebelum proses pembuatan dimulai.
            </p>
          </div>
          <RatingSection templateUid={template.uid} />
        </div>
      )}

      {/* Floating Sticky Mobile Bar — demo/catalog mode only (order CTA).
          Guests never see "Kirim Undangan" / "Konfirmasi" here. */}
      {!isInvitation && (
        <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm sm:hidden">
          <button
            onClick={() => onOrder(template)}
            className="btn-micro w-full bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-[11px] min-[360px]:text-xs font-bold py-3.5 px-4 rounded-full shadow-2xl flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-base shrink-0">payments</span>
            <span className="truncate">PESAN TEMPLATE #{template.templateNumber} ({formatRupiah(getTemplatePrice(template))})</span>
          </button>
        </div>
      )}

      {/* Google Maps Modal */}
      <AnimatePresence>
      {mapModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <motion.div
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-700 text-white"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <button
              onClick={() => setMapModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline text-lg font-bold mb-1">Event Location</h3>
            <p className="text-xs text-slate-300 mb-4">
              {eventDetails.venue} • {eventDetails.address}
            </p>
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-4 border border-slate-700">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  eventDetails.venue + ' ' + eventDetails.address
                )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                eventDetails.venue + ' ' + eventDetails.address
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Open in Google Maps App
            </a>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Music Credit & License Modal */}
      <AnimatePresence>
      {musicInfoModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <motion.div
            className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-700 text-white"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <button
              onClick={() => setMusicInfoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">music_note</span>
              </div>
              <div>
                <h3 className="font-headline text-base font-bold text-amber-300">
                  Background Music #{template.templateNumber} ({catLabel})
                </h3>
                <p className="text-xs text-slate-400">Royalty-Free Commercial License</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Track Title:</span>
                <span className="font-bold text-white text-right">{activeMusic.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Artist / Composer:</span>
                <span className="font-semibold text-slate-200">{template.music.artist}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Theme Category:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-semibold">
                  {template.music.category}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Music Mood:</span>
                <span className="font-semibold text-sky-300 capitalize">{template.music.musicMood}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-200">
                  {Math.floor(template.music.durationSec / 60)}m {template.music.durationSec % 60}s
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Audio Source:</span>
                <a
                  href={template.music.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
                >
                  {template.music.source}
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>
              <div className="flex justify-between items-start pt-1">
                <span className="text-slate-400 shrink-0">Commercial License:</span>
                <span className="text-emerald-400 font-semibold text-right leading-relaxed">
                  ✓ Commercial Use Allowed
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
              <strong>🎵 Bebas Royalti & Aman Komersial:</strong> Semua audio untuk Template #{template.templateNumber} terlisensi komersial dan aman dipublikasikan di WhatsApp, Instagram, & TikTok tanpa copyright strike.
            </div>

            <button
              onClick={() => setMusicInfoModalOpen(false)}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors"
            >
              Tutup / Close
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Gallery Lightbox Modal */}
      <AnimatePresence>
      {galleryImage && (
        <motion.div
          onClick={() => setGalleryImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <motion.div
            className="relative max-w-md w-full max-h-[85vh]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <img
              src={galleryImage}
              alt="Expanded Photo"
              className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="text-center text-white/70 text-xs font-body mt-3">
              Tap anywhere to close
            </p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
};
