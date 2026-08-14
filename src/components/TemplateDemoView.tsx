import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Template, WishItem, EventDetails } from '../types';
import { formatRupiah, CATEGORY_EMOJIS, CATEGORY_LABELS } from '../data/templates';
import { TemplateAudioEngine } from '../lib/audioEngine';
import { TemplateBackground } from './TemplateBackground';
import { MotionConfig, motion, AnimatePresence } from 'motion/react';
import { Reveal, Stagger, StaggerChild, getProfile, EASE_OUT } from './AnimationKit';
import { UiButton } from './UiButton';
import { buildWaLink, guestMessageToHost, guestInvitationMessage } from '../lib/whatsapp';
import { getInvitationUrl } from '../lib/invitations';
import { WhatsAppIcon } from './WhatsAppIcon';
import { getTemplatePrice } from '../lib/templatePricing';
import { RatingSection } from './RatingSection';
import { InvitationVideo } from './InvitationVideo';
import { isValidPublicVideoUrl } from '../lib/videoStorage';

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

interface DemoContent {
  mainTitle: string;
  eventSubtitle: string;
  messageHeading: string;
  messageText: string;
  messageBy: string;
  countdownTitle: string;
  galleryHeading: string;
  galleryNote: string;
  mapHeading: string;
  rsvpHeading: string;
  rsvpNote: string;
  wishesHeading: string;
  wishesNote: string;
  wishesPlaceholder: string;
  wishButton: string;
  closingTitle: string;
  closingQuote: string;
  closingBy: string;
}

const getDemoContent = (template: Template, eventDetails: EventDetails): DemoContent => {
  const cat = template.category;

  if (cat === 'sunatan') {
    return {
      mainTitle: eventDetails.childName || '',
      eventSubtitle: 'Khitanan Putra Kami',
      messageHeading: 'Doa & Ucapan',
      messageText: eventDetails.messageQuote || '',
      messageBy: eventDetails.parentsName || '',
      countdownTitle: 'Countdown Acara Khitanan',
      galleryHeading: 'Momen Sang Buah Hati',
      galleryNote: 'Kenangan kecil yang penuh makna',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Doa & Ucapan',
      wishesNote: 'Tulis doa dan ucapan untuk si kecil',
      wishesPlaceholder: `Tulis doa & ucapan untuk ${eventDetails.childName}...`,
      wishButton: 'Kirim Doa & Ucapan',
      closingTitle: 'Jazakumullahu Khairan',
      closingQuote: '"Semoga Allah memberkahi dan menjadikannya anak yang sholeh."',
      closingBy: eventDetails.parentsName || '',
    };
  }

  if (cat === 'wedding') {
    return {
      mainTitle: `${eventDetails.groomName} & ${eventDetails.brideName}`,
      eventSubtitle: 'The Wedding of',
      messageHeading: 'Our Love Story',
      messageText: eventDetails.coupleStory || '',
      messageBy: eventDetails.hashtag || '#OurWedding',
      countdownTitle: 'Countdown Pernikahan',
      galleryHeading: 'Our Moments',
      galleryNote: 'Sepenggal cerita kami',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'RSVP Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Ucapan',
      wishesNote: 'Tulis ucapan & doa untuk kedua mempelai',
      wishesPlaceholder: `Tulis ucapan untuk ${eventDetails.groomName} & ${eventDetails.brideName}...`,
      wishButton: 'Kirim Ucapan',
      closingTitle: 'Thank You',
      closingQuote: eventDetails.messageQuote || '',
      closingBy: `${eventDetails.groomName} & ${eventDetails.brideName}`,
    };
  }

  if (cat === 'aqiqah') {
    return {
      mainTitle: eventDetails.babyName || '',
      eventSubtitle: 'Syukuran Aqiqah',
      messageHeading: 'Doa Untuk Buah Hati',
      messageText: eventDetails.messageQuote || '',
      messageBy: eventDetails.parentsName || '',
      countdownTitle: 'Countdown Acara Aqiqah',
      galleryHeading: 'Little Moments',
      galleryNote: 'Kebahagiaan kecil yang besar artinya',
      mapHeading: 'Lokasi Acara',
      rsvpHeading: 'Konfirmasi Kehadiran',
      rsvpNote: 'Mohon konfirmasi kehadiran Anda',
      wishesHeading: 'Kirim Doa & Ucapan',
      wishesNote: 'Tulis doa & ucapan untuk sang buah hati',
      wishesPlaceholder: `Tulis doa & ucapan untuk ${eventDetails.babyName}...`,
      wishButton: 'Kirim Doa & Ucapan',
      closingTitle: 'Terima Kasih',
      closingQuote: eventDetails.messageQuote || '',
      closingBy: eventDetails.parentsName || '',
    };
  }

  // birthday (default)
  return {
    mainTitle: `${eventDetails.birthdayPerson}'s ${eventDetails.age}th`,
    eventSubtitle: 'Birthday Invitation',
    messageHeading: 'Birthday Message',
    messageText: eventDetails.messageQuote || '',
    messageBy: `${eventDetails.birthdayPerson} & Family`,
    countdownTitle: 'Countdown to the Party',
    galleryHeading: 'Photo Gallery',
    galleryNote: 'Kenangan indah yang tak terlupakan',
    mapHeading: 'Event Location Map',
    rsvpHeading: 'Will You Attend?',
    rsvpNote: 'Please confirm your presence',
    wishesHeading: 'Leave a Birthday Wish',
    wishesNote: `Tulis ucapan & doa hangat untuk ${eventDetails.birthdayPerson}`,
    wishesPlaceholder: `Tulis ucapan ulang tahun untuk ${eventDetails.birthdayPerson}...`,
    wishButton: 'Send Wish / Kirim Ucapan',
    closingTitle: 'See You At The Party!',
    closingQuote: '"Kehadiran dan doa Anda adalah kado terindah bagi kami."',
    closingBy: `${eventDetails.birthdayPerson} & Family`,
  };
};

export const TemplateDemoView: React.FC<TemplateDemoViewProps> = ({
  template,
  onOrder,
  onBackToCatalog,
  eventDetailsOverride,
  wishesOverride,
  invitationPhone,
  invitationSlug,
  invitationTitle,
  isInvitation = false,
  musicOverride,
  disableMusic = false,
  videoOverride,
  onBackLabel,
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

  // Live countdown state
  const [countdown, setCountdown] = useState({
    days: 38,
    hours: 14,
    mins: 22,
    secs: 45,
  });

  // RSVP state
  const [rsvpData, setRsvpData] = useState({
    name: '',
    attendance: 'Hadir (Will Attend)',
    guests: 1,
    message: '',
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Wishes / Guestbook state
  const [wishesList, setWishesList] = useState<WishItem[]>(() => wishesOverride ?? template.sampleWishes ?? []);
  const [newWishName, setNewWishName] = useState('');
  const [newWishText, setNewWishText] = useState('');
  const [wishSuccess, setWishSuccess] = useState(false);

  // Modals
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [musicInfoModalOpen, setMusicInfoModalOpen] = useState(false);
  // "Kirim Undangan" (customer → guest) share modal
  const [shareGuestOpen, setShareGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [shareError, setShareError] = useState('');

  const effectiveEventDetails: EventDetails = eventDetailsOverride
    ? { ...template.eventDetails, ...eventDetailsOverride }
    : template.eventDetails;

  const { themeStyle } = template;
  const eventDetails = effectiveEventDetails;
  const content = getDemoContent(template, eventDetails);
  const catLabel = CATEGORY_LABELS[template.category];
  const catEmoji = CATEGORY_EMOJIS[template.category];
  const profile = getProfile(template.category);

  // "Kirim Undangan" (customer → guest): modal asks for the guest name, then
  // opens WhatsApp with an auto-generated, category-aware message + the real
  // public URL. The customer only edits the guest name.
  const openGuestShare = () => {
    setShareError('');
    setGuestName('');
    setShareGuestOpen(true);
  };

  const handleSendGuestInvitation = () => {
    const name = guestName.trim();
    if (!name) {
      setShareError('Mohon isi nama tamu terlebih dahulu.');
      return;
    }
    if (!invitationSlug || invitationSlug === 'preview') {
      setShareError('Link undangan belum tersedia.');
      return;
    }
    const url = getInvitationUrl({ slug: invitationSlug });
    const msg = guestInvitationMessage({
      guestName: name,
      title: invitationTitle || template.name,
      url,
      category: template.category,
      eventDate: eventDetails.date,
      eventTime: eventDetails.time,
      venue: eventDetails.venue,
    });
    window.open(buildWaLink(msg, ''), '_blank', 'noopener,noreferrer');
    setShareGuestOpen(false);
    setGuestName('');
    setShareError('');
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

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
        audioEngineRef.current = null;
      }
    };
  }, [template, activeMusic.url, activeMusic.fallbackUrl, activeMusic.startTime, disableMusic]);

  // Ticking countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle opening invitation & triggering background music immediately
  const showMusicError = (msg: string) => {
    setMusicError(msg);
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
    errorTimerRef.current = window.setTimeout(() => setMusicError(''), 4500);
  };

  const handleOpenInvitation = async () => {
    setCoverOpened(true);

    if (audioEngineRef.current) {
      const started = await audioEngineRef.current.startWithFade();
      if (started) {
        setIsPlayingMusic(true);
        setIsMuted(false);
        setMusicVolume(audioEngineRef.current.getVolume());
        setMusicBlocked(false);
      } else {
        setIsPlayingMusic(false);
        setMusicBlocked(true);
      }
    } else {
      setIsPlayingMusic(false);
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

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpData.name.trim()) return;
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

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishName.trim() || !newWishText.trim()) return;

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
          {/* Floating Music Player (bottom-right, safe spacing) */}
          <div className={`fixed right-2.5 sm:right-5 z-40 flex flex-col items-end gap-2 ${isInvitation ? 'bottom-[160px] sm:bottom-24' : 'bottom-[84px] sm:bottom-6'}`}>
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
                  <span className="absolute inset-0 rounded-full border-2 border-dashed border-white/50 animate-[spin_4s_linear_infinite] pointer-events-none" />
                )}
                <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlayingMusic ? 'pause' : 'play_arrow'}
                </span>
              </button>

              {/* Animated Equalizer while playing */}
              {isPlayingMusic && (
                <div className="flex items-end gap-[3px] h-5 px-0.5" title={template.musicTrackName}>
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '10px', backgroundColor: themeStyle.primaryColor }} />
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '16px', animationDelay: '0.15s', backgroundColor: themeStyle.primaryColor }} />
                  <span className="w-[3px] rounded-full bg-amber-400 eq-bar" style={{ height: '13px', animationDelay: '0.3s', backgroundColor: themeStyle.primaryColor }} />
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
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 align-middle"></span>
                  {activeMusic.title}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 1: COVER VIEW / HERO */}
          {!coverOpened ? (
            <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center relative z-20">
              <Stagger
                profile={profile}
                onView={false}
                delay={0.2}
                stagger={0.2}
                className="max-w-md w-full flex flex-col items-center gap-5 relative z-10 my-auto"
              >
                {/* Decorative Theme Badging */}
                <StaggerChild variant="down" duration={0.7}>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs font-bold uppercase tracking-widest text-amber-300 shadow-lg backdrop-blur-md">
                    <span>{themeStyle.decorations?.[0] || '✨'}</span>
                    <span>You Are Invited To</span>
                    <span>{themeStyle.decorations?.[1] || '✨'}</span>
                  </div>
                </StaggerChild>

                <StaggerChild variant="scale" duration={0.9}>
                  <h1
                    className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-md"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    {content.mainTitle}
                    <br />
                    <span className="text-2xl sm:text-3xl block mt-2">{content.eventSubtitle}</span>
                  </h1>
                </StaggerChild>

                {/* Custom Photo Frame based on frameStyle */}
                <StaggerChild variant="photo" duration={1.0}>
                {(() => {
                  const frame = themeStyle.frameStyle || 'glass-frame';

                  if (frame === 'arch' || frame === 'islamic-arch') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-t-full rounded-b-2xl overflow-hidden shadow-2xl border-4 border-amber-300/60 my-2 relative group bg-black/30 p-1 shrink-0">
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-t-full rounded-b-xl group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  if (frame === 'gold-border') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400 p-1 bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-200 my-2 relative group shrink-0">
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  if (frame === 'polaroid') {
                    return (
                      <div className="w-44 sm:w-52 p-2.5 pb-6 bg-amber-50 text-slate-900 rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 my-2 relative border border-slate-200 shrink-0">
                        <div className="w-full h-44 sm:h-52 overflow-hidden rounded bg-slate-200">
                          <img
                            src={eventDetails.portraitImage}
                            alt={content.mainTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 text-center font-bold text-[11px] tracking-wider opacity-80 uppercase">
                          {template.name}
                        </div>
                      </div>
                    );
                  }

                  if (frame === 'cute-ribbon' || frame === 'moon-arch' || frame === 'floral-wreath') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-300/80 my-2 relative group bg-pink-950/20 p-1 shrink-0">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 text-xl select-none">
                          {frame === 'moon-arch' ? '🌙' : frame === 'floral-wreath' ? '🌷' : '🎀'}
                        </div>
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  if (frame === 'neon-border') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-400 p-1 bg-slate-950 my-2 relative group shrink-0">
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  if (frame === 'royal-crest' || frame === 'royal-crown') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-t-full rounded-b-3xl overflow-hidden shadow-2xl border-2 border-amber-300 p-1.5 bg-gradient-to-b from-amber-400 via-emerald-700 to-amber-500 my-2 relative group shrink-0">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 text-xl drop-shadow-md select-none">👑</div>
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-t-full rounded-b-2xl pt-3 group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  if (frame === 'minimal-circle' || frame === 'minimal-line') {
                    return (
                      <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-full overflow-hidden shadow-2xl border-2 border-white/40 my-2 relative group bg-black/30 p-1.5 shrink-0">
                        <img
                          src={eventDetails.portraitImage}
                          alt={content.mainTitle}
                          className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    );
                  }

                  // Default glass frame
                  return (
                    <div className="w-44 h-56 sm:w-52 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 my-2 relative group bg-black/30 p-1 shrink-0">
                      <img
                        src={eventDetails.portraitImage}
                        alt={content.mainTitle}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  );
                })()}
                </StaggerChild>

                <StaggerChild variant="up" duration={0.7}>
                  <p className="text-sm sm:text-base opacity-95 font-semibold drop-shadow-sm">
                    {eventDetails.date}
                  </p>
                </StaggerChild>

                <StaggerChild variant="up" duration={0.8}>

                {/* Custom Styled Open Invitation Button */}
                {(() => {
                  const btn = themeStyle.buttonStyle || 'playful';

                  if (btn === 'gold-luxury' || btn === 'emerald-glass' || btn === 'islamic-gold' || btn === 'garden-rose') {
                    return (
                      <button
                        onClick={handleOpenInvitation}
                        className="btn-micro w-full max-w-xs py-4 px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300/80 mt-3 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600 text-slate-950 shadow-amber-500/20"
                      >
                        <Mail size={18} aria-hidden="true" />
                        OPEN INVITATION
                      </button>
                    );
                  }

                  if (btn === 'rose-gold') {
                    return (
                      <button
                        onClick={handleOpenInvitation}
                        className="btn-micro w-full max-w-xs py-4 px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-2 cursor-pointer border border-rose-300/60 mt-3 bg-gradient-to-r from-rose-500 via-pink-400 to-amber-400 text-white shadow-rose-500/20"
                      >
                        <Mail size={18} aria-hidden="true" />
                        OPEN INVITATION
                      </button>
                    );
                  }

                  if (btn === 'neon-glow') {
                    return (
                      <button
                        onClick={handleOpenInvitation}
                        className="btn-micro w-full max-w-xs py-4 px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 cursor-pointer border-2 border-cyan-300 mt-3 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white"
                      >
                        <Mail size={18} aria-hidden="true" />
                        OPEN INVITATION
                      </button>
                    );
                  }

                  if (btn === 'minimal-dark') {
                    return (
                      <button
                        onClick={handleOpenInvitation}
                        className="btn-micro w-full max-w-xs py-4 px-8 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-white/40 mt-3 bg-slate-900 text-white"
                      >
                        <Mail size={16} aria-hidden="true" />
                        OPEN INVITATION
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={handleOpenInvitation}
                      className="btn-micro w-full max-w-xs py-4 px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 cursor-pointer border border-white/40 mt-3"
                      style={{
                        backgroundColor: themeStyle.primaryColor,
                        color: '#ffffff',
                      }}
                    >
                      <Mail size={18} aria-hidden="true" />
                      OPEN INVITATION
                    </button>
                  );
                })()}
                </StaggerChild>
              </Stagger>
            </section>
          ) : (
            /* UNVEILED INVITATION SECTIONS */
            <div className="w-full pb-28 animate-fade-in max-w-md mx-auto px-4 sm:px-6">
              {/* Top Banner / Hero Header */}
              <header className="min-h-[80vh] flex flex-col items-center justify-center text-center py-10 relative border-b border-white/10">
                <Stagger
                  profile={profile}
                  onView={false}
                  delay={0.15}
                  stagger={0.2}
                  className="flex flex-col items-center gap-4 relative z-10 my-auto"
                >
                  <StaggerChild variant="down" duration={0.7}>
                    <div className="px-3.5 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-widest">
                      {catEmoji} Digital {catLabel} Invitation #{template.templateNumber}
                    </div>
                  </StaggerChild>

                  <StaggerChild variant="scale" duration={0.9}>
                    <h1
                      className="text-4xl sm:text-5xl font-extrabold leading-tight drop-shadow-md"
                      style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                    >
                      {content.mainTitle}
                      <br />
                      <span className="text-2xl sm:text-3xl block mt-2">{content.eventSubtitle}</span>
                    </h1>
                  </StaggerChild>

                  <StaggerChild variant="photo" duration={1.0}>
                    <div className="w-44 h-56 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 my-4 shadow-2xl">
                      <img
                        src={eventDetails.portraitImage}
                        alt={content.mainTitle}
                        className="w-full h-full object-cover rounded-full border-2 border-slate-900"
                      />
                    </div>
                  </StaggerChild>

                  <StaggerChild variant="up" duration={0.7}>
                    <p className="text-sm opacity-95 font-semibold bg-black/40 px-4 py-2 rounded-full border border-white/15 backdrop-blur-md">
                      {eventDetails.date} • {eventDetails.time}
                    </p>
                  </StaggerChild>
                </Stagger>
              </header>

              {/* SECTION 2: MESSAGE / DOA / LOVE STORY */}
              <section className="my-10 text-center">
                <Stagger
                  profile={profile}
                  className="p-6 rounded-3xl backdrop-blur-md bg-black/40 border border-white/20 shadow-2xl relative overflow-hidden"
                >
                  <StaggerChild variant="scale">
                    <span
                      className="material-symbols-outlined text-4xl mb-2 block"
                      style={{ color: themeStyle.primaryColor }}
                    >
                      format_quote
                    </span>
                  </StaggerChild>
                  <StaggerChild variant="up">
                    <h2
                      className="text-xl font-bold mb-3 drop-shadow-sm"
                      style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                    >
                      {content.messageHeading}
                    </h2>
                  </StaggerChild>
                  <StaggerChild variant="up">
                    <p className="text-sm sm:text-base leading-relaxed italic opacity-95">
                      "{content.messageText}"
                    </p>
                  </StaggerChild>
                  <StaggerChild variant="up">
                    <div className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-300">
                      — {content.messageBy}
                    </div>
                  </StaggerChild>
                </Stagger>
              </section>

              {/* SECTION 2b: WEDDING PARENTS + AKAD/RESEPSI */}
              {template.category === 'wedding' && (
                <section className="my-10">
                  <Stagger profile={profile}>
                    <StaggerChild variant="up" className="mb-4">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md">
                        <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200 mb-1">
                          Putra dari Bapak & Ibu
                        </h3>
                        <p className="text-sm font-bold">{eventDetails.groomName}</p>
                        <p className="text-xs opacity-85 mt-0.5">{eventDetails.groomParents}</p>
                      </div>
                    </StaggerChild>
                    <StaggerChild variant="up">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md">
                        <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200 mb-1">
                          Putri dari Bapak & Ibu
                        </h3>
                        <p className="text-sm font-bold">{eventDetails.brideName}</p>
                        <p className="text-xs opacity-85 mt-0.5">{eventDetails.brideParents}</p>
                      </div>
                    </StaggerChild>
                  </Stagger>
                </section>
              )}

              {/* SECTION 2c: SUNATAN / AQIQAH CHILD + PARENTS */}
              {(template.category === 'sunatan' || template.category === 'aqiqah') && (
                <section className="my-10">
                  <Stagger
                    profile={profile}
                    stagger={0.12}
                    className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4"
                  >
                    <StaggerChild variant="scale">
                      <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                        <span className="material-symbols-outlined text-2xl">child_care</span>
                      </div>
                    </StaggerChild>
                    <StaggerChild variant="right">
                      <div className="flex-1">
                        <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">
                          {template.category === 'sunatan' ? 'Nama Anak' : 'Nama Buah Hati'}
                        </h3>
                        <p className="text-base font-bold mt-0.5">
                          {template.category === 'sunatan' ? eventDetails.childName : eventDetails.babyName}
                        </p>
                        {template.category === 'aqiqah' && eventDetails.babyGender && (
                          <p className="text-xs opacity-85 mt-0.5">Jenis Kelamin: {eventDetails.babyGender}</p>
                        )}
                        {template.category === 'aqiqah' && eventDetails.babyBirthDate && (
                          <p className="text-xs opacity-85 mt-0.5">Lahir: {eventDetails.babyBirthDate}</p>
                        )}
                      </div>
                    </StaggerChild>
                  </Stagger>
                  <Stagger
                    profile={profile}
                    delay={0.2}
                    stagger={0.12}
                    className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4 mt-3"
                  >
                    <StaggerChild variant="scale">
                      <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                        <span className="material-symbols-outlined text-2xl">family_restroom</span>
                      </div>
                    </StaggerChild>
                    <StaggerChild variant="right">
                      <div>
                        <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">
                          Orang Tua
                        </h3>
                        <p className="text-sm font-bold mt-0.5">{eventDetails.parentsName}</p>
                      </div>
                    </StaggerChild>
                  </Stagger>
                </section>
              )}

              {/* SECTION 3: EVENT DETAILS */}
              <section className="my-10">
                <Reveal profile={profile} variant="up">
                  <h2
                    className="text-2xl font-bold text-center mb-6 drop-shadow-sm"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    Event Details
                  </h2>
                </Reveal>

                {template.category === 'wedding' && (
                  <Stagger profile={profile} className="flex flex-col gap-4 mb-4">
                    <StaggerChild variant="up">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                          <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">Akad Nikah</h3>
                          <p className="text-base font-bold mt-0.5">{eventDetails.akadDate}</p>
                          <p className="text-xs opacity-85 mt-0.5">08.00 WIB - 10.00 WIB</p>
                        </div>
                      </div>
                    </StaggerChild>
                    <StaggerChild variant="up">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                          <span className="material-symbols-outlined text-2xl">celebration</span>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">Resepsi</h3>
                          <p className="text-base font-bold mt-0.5">{eventDetails.resepsiDate}</p>
                          <p className="text-xs opacity-85 mt-0.5">{eventDetails.time}</p>
                        </div>
                      </div>
                    </StaggerChild>
                  </Stagger>
                )}

                <Stagger profile={profile} className="flex flex-col gap-4">
                  <StaggerChild variant="up">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4">
                      <Reveal profile={profile} variant="scale" delay={0.15}>
                        <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                          <span className="material-symbols-outlined text-2xl">calendar_today</span>
                        </div>
                      </Reveal>
                      <div>
                        <Reveal profile={profile} variant="right" delay={0.25}>
                          <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">Date & Time</h3>
                        </Reveal>
                        <Reveal profile={profile} variant="up" delay={0.35}>
                          <p className="text-base font-bold mt-0.5">{eventDetails.date}</p>
                        </Reveal>
                        <Reveal profile={profile} variant="up" delay={0.45}>
                          <p className="text-xs opacity-85 mt-0.5">{eventDetails.time}</p>
                        </Reveal>
                      </div>
                    </div>
                  </StaggerChild>

                  <StaggerChild variant="up">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-start gap-4">
                      <Reveal profile={profile} variant="scale" delay={0.15}>
                        <div className="p-3 rounded-xl bg-white/15 text-amber-300 shrink-0">
                          <span className="material-symbols-outlined text-2xl">pin_drop</span>
                        </div>
                      </Reveal>
                      <div>
                        <Reveal profile={profile} variant="fade" delay={0.25}>
                          <h3 className="text-xs font-bold opacity-70 uppercase tracking-wider text-amber-200">Venue Location</h3>
                        </Reveal>
                        <Reveal profile={profile} variant="up" delay={0.35}>
                          <p className="text-base font-bold mt-0.5">{eventDetails.venue}</p>
                        </Reveal>
                        <Reveal profile={profile} variant="up" delay={0.45}>
                          <p className="text-xs opacity-85 leading-relaxed mt-1">{eventDetails.address}</p>
                        </Reveal>
                      </div>
                    </div>
                  </StaggerChild>
                </Stagger>
              </section>

              {/* SECTION 4: LIVE COUNTDOWN */}
              <section className="my-10 text-center">
                <Reveal profile={profile} variant="up">
                  <h2
                    className="text-xl font-bold mb-4 drop-shadow-sm"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    {content.countdownTitle}
                  </h2>
                </Reveal>

                <Stagger profile={profile} className="grid grid-cols-4 gap-2.5">
                  <StaggerChild variant="scale">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/20 backdrop-blur-md flex flex-col items-center">
                      <span key={countdown.days} className="countdown-tick text-2xl font-black text-amber-300">{countdown.days}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Days</span>
                    </div>
                  </StaggerChild>
                  <StaggerChild variant="scale">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/20 backdrop-blur-md flex flex-col items-center">
                      <span key={countdown.hours} className="countdown-tick text-2xl font-black text-amber-300">{countdown.hours}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Hours</span>
                    </div>
                  </StaggerChild>
                  <StaggerChild variant="scale">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/20 backdrop-blur-md flex flex-col items-center">
                      <span key={countdown.mins} className="countdown-tick text-2xl font-black text-amber-300">{countdown.mins}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Mins</span>
                    </div>
                  </StaggerChild>
                  <StaggerChild variant="scale">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-white/20 backdrop-blur-md flex flex-col items-center">
                      <span key={countdown.secs} className="countdown-tick text-2xl font-black text-amber-300">{countdown.secs}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Secs</span>
                    </div>
                  </StaggerChild>
                </Stagger>
              </section>

              {/* SECTION 5: GALLERY */}
              <section className="my-10">
                <Reveal profile={profile} variant="up">
                  <h2
                    className="text-2xl font-bold text-center mb-6 drop-shadow-sm"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    {content.galleryHeading}
                  </h2>
                </Reveal>
                <Reveal profile={profile} variant="fade">
                  <p className="text-xs text-center opacity-80 mb-4 -mt-4">{content.galleryNote}</p>
                </Reveal>

                <Stagger profile={profile} stagger={0.12} className="grid grid-cols-2 gap-3">
                  {eventDetails.galleryImages.map((imgUrl, index) => (
                    <StaggerChild
                      key={index}
                      variant="photo"
                      onClick={() => setGalleryImage(imgUrl)}
                      className="card-lift aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-lg cursor-pointer group relative bg-black/30"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
                      </div>
                    </StaggerChild>
                  ))}
                </Stagger>
              </section>

              {/* SECTION 5b: VIDEO (streamed from public storage — every template) */}
              {activeVideoUrl && (
                <section className="my-10">
                  <Reveal profile={profile} variant="up">
                    <h2
                      className="text-2xl font-bold text-center mb-6 drop-shadow-sm"
                      style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                    >
                      Video
                    </h2>
                  </Reveal>
                  <Reveal profile={profile} variant="fade">
                    <InvitationVideo
                      url={activeVideoUrl}
                      type={videoOverride?.type}
                      poster={eventDetails.portraitImage || undefined}
                      name={videoOverride?.name}
                    />
                  </Reveal>
                </section>
              )}

              {/* SECTION 6: LOCATION MAP */}
              <section className="my-10 text-center">
                <Reveal profile={profile} variant="up">
                  <h2
                    className="text-2xl font-bold mb-4 drop-shadow-sm"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    {content.mapHeading}
                  </h2>
                </Reveal>

                <Stagger
                  profile={profile}
                  className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 backdrop-blur-md p-4"
                >
                  <StaggerChild variant="fade">
                    <p className="text-xs opacity-90 mb-3 font-semibold">
                      {eventDetails.venue} • {eventDetails.address}
                    </p>
                  </StaggerChild>

                  <StaggerChild variant="photo">
                    <div
                      onClick={() => setMapModalOpen(true)}
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

              {/* SECTION 7: RSVP FORM */}
              <section className="my-10">
                <Stagger profile={profile} className="p-6 rounded-3xl bg-black/50 backdrop-blur-md border border-white/20 shadow-2xl">
                  <StaggerChild variant="up">
                    <h2
                      className="text-2xl font-bold text-center mb-1 drop-shadow-sm"
                      style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                    >
                      {content.rsvpHeading}
                    </h2>
                  </StaggerChild>
                  <StaggerChild variant="fade">
                    <p className="text-xs text-center opacity-80 mb-6">
                      {content.rsvpNote}
                    </p>
                  </StaggerChild>

                  {rsvpSubmitted ? (
                    <StaggerChild variant="scale">
                      <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center text-xs font-bold animate-fade-in">
                        🎉 Terima kasih {rsvpData.name || 'Tamu'}! Konfirmasi RSVP kamu telah terkirim.
                      </div>
                    </StaggerChild>
                  ) : (
                    <form onSubmit={handleRSVPSubmit} className="flex flex-col gap-3">
                      <Reveal profile={profile} variant="up" delay={0.05}>
                        <input
                          type="text"
                          required
                          value={rsvpData.name}
                          onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                          placeholder="Nama Lengkap Kamu"
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-white font-body"
                        />
                      </Reveal>

                      <Reveal profile={profile} variant="up" delay={0.15}>
                        <select
                          value={rsvpData.attendance}
                          onChange={(e) => setRsvpData({ ...rsvpData, attendance: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white text-xs focus:outline-none focus:border-white font-body"
                        >
                          <option className="bg-slate-900 text-white">Hadir (I'll be there)</option>
                          <option className="bg-slate-900 text-white">Maaf, Tidak Bisa Hadir (Can't make it)</option>
                        </select>
                      </Reveal>

                      <Reveal profile={profile} variant="up" delay={0.25}>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={rsvpData.guests}
                          onChange={(e) => setRsvpData({ ...rsvpData, guests: parseInt(e.target.value) || 1 })}
                          placeholder="Jumlah Tamu"
                          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-white font-body"
                        />
                      </Reveal>

                      <Reveal profile={profile} variant="up" delay={0.35}>
          <button
                          type="submit"
                          className="btn-micro w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer mt-2"
                          style={{
                            backgroundColor: themeStyle.primaryColor,
                            color: '#ffffff',
                          }}
                        >
                          Kirim RSVP
                        </button>
                      </Reveal>
                    </form>
                  )}
                </Stagger>
              </section>

              {/* SECTION 8: WISHES / UCAPAN */}
              <section className="my-10">
                <Stagger profile={profile} className="p-6 rounded-3xl bg-black/50 backdrop-blur-md border border-white/20 shadow-2xl">
                  <StaggerChild variant="up">
                    <h2
                      className="text-2xl font-bold text-center mb-1 drop-shadow-sm"
                      style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                    >
                      {content.wishesHeading}
                    </h2>
                  </StaggerChild>
                  <StaggerChild variant="fade">
                    <p className="text-xs text-center opacity-80 mb-6">
                      {content.wishesNote}
                    </p>
                  </StaggerChild>

                  {wishSuccess && (
                    <StaggerChild variant="scale">
                      <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center text-xs font-bold animate-fade-in">
                        ✨ Terima kasih! Ucapan kamu telah ditambahkan.
                      </div>
                    </StaggerChild>
                  )}

                  <form onSubmit={handleSendWish} className="flex flex-col gap-3 mb-6">
                    <Reveal profile={profile} variant="up" delay={0.05}>
                      <input
                        type="text"
                        required
                        value={newWishName}
                        onChange={(e) => setNewWishName(e.target.value)}
                        placeholder="Nama Kamu"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-white font-body"
                      />
                    </Reveal>
                    <Reveal profile={profile} variant="up" delay={0.15}>
                      <textarea
                        rows={3}
                        required
                        value={newWishText}
                        onChange={(e) => setNewWishText(e.target.value)}
                        placeholder={content.wishesPlaceholder}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:border-white resize-none font-body"
                      ></textarea>
                    </Reveal>
                    <Reveal profile={profile} variant="up" delay={0.25}>
                      <button
                        type="submit"
                        className="btn-micro w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-colors cursor-pointer"
                      >
                        {content.wishButton}
                      </button>
                    </Reveal>
                  </form>

                  {/* Wishes List */}
                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {wishesList.map((wish) => (
                      <Reveal key={wish.id} profile={profile} variant="up">
                        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-amber-300">{wish.name}</span>
                            <span className="text-[10px] opacity-60">{wish.date}</span>
                          </div>
                          <p className="text-xs opacity-90 leading-relaxed">{wish.message}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </Stagger>
              </section>

              {/* SECTION 9: CLOSING */}
              <Stagger
                profile={profile}
                className="my-10 text-center border-t border-white/15 pt-10"
              >
                <StaggerChild variant="fade">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 text-amber-200">
                    Thank You
                  </p>
                </StaggerChild>
                <StaggerChild variant="up">
                  <h3
                    className="text-2xl font-bold mb-4 drop-shadow-sm"
                    style={{ fontFamily: themeStyle.fontFamilyTitle, color: themeStyle.textColor }}
                  >
                    {content.closingTitle}
                  </h3>
                </StaggerChild>
                <StaggerChild variant="up">
                  <p className="text-xs opacity-80 italic max-w-xs mx-auto mb-6">
                    "{content.closingQuote}"
                  </p>
                </StaggerChild>
                <StaggerChild variant="up">
                  <div className="text-sm font-bold text-amber-300">
                    — {content.closingBy}
                  </div>
                </StaggerChild>
              </Stagger>
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

      {/* Floating Sticky Mobile Bar (Order in demo mode / Share + RSVP in invitation mode) */}
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm sm:hidden">
        {isInvitation ? (
          <div className="flex gap-2">
            <button
              onClick={openGuestShare}
              className="btn-micro flex-1 min-w-0 bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-[11px] font-bold py-3.5 px-3 rounded-full shadow-2xl flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer min-h-[44px]"
            >
              <WhatsAppIcon size={15} className="shrink-0" />
              <span className="truncate">Kirim Undangan</span>
            </button>
            <a
              href={buildWaLink(guestMessageToHost(invitationTitle || template.name, getInvitationUrl({ slug: invitationSlug || 'invitation' })), invitationPhone || '')}
              target="_blank"
              rel="noreferrer"
              className="btn-micro flex-1 min-w-0 bg-white/10 hover:bg-white/20 text-white font-headline text-[11px] font-bold py-3.5 px-3 rounded-full shadow-2xl flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-base shrink-0">event_available</span>
              <span className="truncate">Konfirmasi</span>
            </a>
          </div>
        ) : (
          <button
            onClick={() => onOrder(template)}
            className="btn-micro w-full bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-[11px] min-[360px]:text-xs font-bold py-3.5 px-4 rounded-full shadow-2xl flex items-center justify-center gap-1.5 border border-white/20 cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-base shrink-0">payments</span>
            <span className="truncate">PESAN TEMPLATE #{template.templateNumber} ({formatRupiah(getTemplatePrice(template))})</span>
          </button>
        )}
      </div>

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

      {/* Desktop "Kirim Undangan" button (public invitation only) */}
      {isInvitation && (
        <button
          onClick={openGuestShare}
          className="hidden sm:inline-flex fixed bottom-6 left-3 sm:left-5 z-[60] items-center gap-1.5 btn-micro bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-[11px] sm:text-xs font-bold rounded-full px-4 py-2.5 sm:px-4 sm:py-2.5 shadow-xl border border-white/20 cursor-pointer"
          title="Bagikan undangan ke tamu via WhatsApp"
        >
          <WhatsAppIcon size={15} />
          Kirim Undangan
        </button>
      )}

      {/* "Kirim Undangan" Modal — customer only types the guest name */}
      <AnimatePresence>
      {shareGuestOpen && (
        <motion.div
          className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <motion.div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <button
              onClick={() => setShareGuestOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <WhatsAppIcon size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline text-lg font-extrabold text-slate-900 leading-tight">
                  Kirim Undangan
                </h3>
                <p className="font-body text-[11px] text-slate-500">
                  {invitationTitle || template.name}
                </p>
              </div>
            </div>

            <label className="block mb-4">
              <span className="block font-body text-[11px] sm:text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nama Tamu
              </span>
              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (shareError) setShareError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendGuestInvitation();
                }}
                placeholder="Contoh: Budi dan Keluarga"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-body text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 transition-colors box-border"
              />
              {shareError && (
                <span className="block font-body text-[11px] font-bold text-rose-600 mt-1.5">
                  {shareError}
                </span>
              )}
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => setShareGuestOpen(false)}
                className="btn-micro flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSendGuestInvitation}
                className="btn-micro flex-[2] min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <WhatsAppIcon size={15} />
                Kirim via WhatsApp
              </button>
            </div>

            <p className="mt-4 font-body text-[10px] text-slate-400 text-center leading-relaxed">
              Pesan undangan akan dibuat otomatis — Anda hanya perlu mengganti nama tamu.
            </p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
};
