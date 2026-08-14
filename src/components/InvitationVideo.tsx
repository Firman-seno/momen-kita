import React, { useEffect, useRef, useState } from 'react';

/* ============================================================
   MomenKita — Public invitation video player
   ------------------------------------------------------------
   Mobile-safe <video> used by EVERY template. Videos are streamed
   from a public HTTPS URL (Vercel Blob, Range-request capable), so
   they play on any device/incognito without admin login.

   States (requirement #9/#10):
     - loading : "Memuat video..."  (before metadata is ready)
     - ready   : play overlay → native controls
     - error   : "Video tidak dapat dimuat. Silakan coba refresh halaman."
   An error only affects this section — never the whole invitation.
   No autoplay with audio: playback always starts from a tap.
   ============================================================ */

interface InvitationVideoProps {
  url: string;
  type?: string;
  poster?: string;
  name?: string;
}

type VideoStatus = 'loading' | 'ready' | 'error';

const LOAD_TIMEOUT_MS = 25000;

export const InvitationVideo: React.FC<InvitationVideoProps> = ({ url, type, poster, name }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimer = useRef<number | null>(null);
  const [status, setStatus] = useState<VideoStatus>('loading');
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setStatus('loading');
    setPlaying(false);
    if (loadTimer.current !== null) window.clearTimeout(loadTimer.current);
    loadTimer.current = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'error' : current));
    }, LOAD_TIMEOUT_MS);
    return () => {
      if (loadTimer.current !== null) window.clearTimeout(loadTimer.current);
    };
  }, [url]);

  const clearLoadTimer = () => {
    if (loadTimer.current !== null) {
      window.clearTimeout(loadTimer.current);
      loadTimer.current = null;
    }
  };

  const handleLoaded = () => {
    clearLoadTimer();
    setStatus('ready');
  };

  const handleError = () => {
    clearLoadTimer();
    setStatus('error');
  };

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    const result = video.play();
    if (result && typeof result.then === 'function') {
      result.then(() => setPlaying(true)).catch(() => setPlaying(true));
    } else {
      setPlaying(true);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg bg-black/40 aspect-video">
      <video
        ref={videoRef}
        src={url}
        poster={poster || undefined}
        controls={playing}
        playsInline
        preload="metadata"
        controlsList="nodownload"
        className="w-full h-full object-contain"
        onLoadedMetadata={handleLoaded}
        onCanPlay={handleLoaded}
        onError={handleError}
        onPlay={() => setPlaying(true)}
      />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/60">
          <span className="material-symbols-outlined text-white text-4xl animate-spin" style={{ animationDirection: 'reverse' }}>
            progress_activity
          </span>
          <p className="font-body text-xs text-white/90">Memuat video...</p>
        </div>
      )}

      {/* Error overlay — only this section fails, the invitation stays intact */}
      {status === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-4 text-center bg-black/60">
          <span className="material-symbols-outlined text-rose-300 text-3xl">videocam_off</span>
          <p className="font-body text-xs text-white/90">
            Video tidak dapat dimuat. Silakan coba refresh halaman.
          </p>
        </div>
      )}

      {/* Play overlay — appears once metadata is ready; always user-initiated */}
      {status === 'ready' && !playing && (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/40 transition-colors hover:bg-black/55 cursor-pointer"
          aria-label={name ? `Putar video ${name}` : 'Putar video'}
        >
          <span className="w-16 h-16 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-xl">
            <span className="material-symbols-outlined text-3xl pl-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              play_arrow
            </span>
          </span>
          <span className="font-body text-xs font-bold uppercase tracking-wider text-white drop-shadow">Play Video</span>
        </button>
      )}
    </div>
  );
};
