// Enhanced Triple-Mode Audio Engine for Digital Invitation Demos
// Supports:
//   1. HTML5 MP3 primary track (template.musicUrl — verified Pixabay CDN)
//   2. HTML5 MP3 fallback track (per-category fallback CDN)
//   3. Web Audio Harmonic Polyphonic Synthesizer (last-resort, no network)
// Includes volume control (default 0.6), mute-with-memory, and soft
// fade-in / fade-out so music always starts and stops elegantly.

export interface TemplateAudioEngineOptions {
  fontStyle: string;
  primaryUrl: string;
  fallbackUrl?: string;
  volume?: number;
  loop?: boolean;
  /** Skip intro/ambience — start playback at this second of the track. */
  startTime?: number;
}

export class TemplateAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private fontStyle: string;
  private primaryUrl: string;
  private fallbackUrl: string;
  private audioElement: HTMLAudioElement | null = null;
  private currentSourceUrl: string;
  private masterVolume: number = 0.6;
  private loop: boolean = true;
  private lastVolumeBeforeMute: number = 0.6;
  private startTime: number = 0;

  constructor(options: TemplateAudioEngineOptions) {
    this.fontStyle = options.fontStyle || 'elegant';
    this.primaryUrl = options.primaryUrl;
    this.fallbackUrl = options.fallbackUrl || options.primaryUrl;
    this.masterVolume = typeof options.volume === 'number' ? options.volume : 0.6;
    this.lastVolumeBeforeMute = this.masterVolume;
    this.loop = options.loop !== false;
    this.startTime = typeof options.startTime === 'number' ? options.startTime : 0;
    this.currentSourceUrl = this.primaryUrl;
  }

  private createAudioElement(url: string): HTMLAudioElement | null {
    try {
      const el = new Audio();
      el.src = url;
      el.loop = this.loop;
      el.preload = 'auto';
      el.volume = 0;
      el.muted = this.isMuted;
      this.audioElement = el;
      this.currentSourceUrl = url;
      return el;
    } catch (e) {
      console.warn('[AudioEngine] Audio element initialization skipped:', (e as Error)?.message || String(e));
      return null;
    }
  }

  private applyVolume(vol: number) {
    const target = this.isMuted ? 0 : vol;
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, target));
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, target)), this.audioCtx.currentTime);
    }
  }

  private fadeVolume(from: number, to: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const effectiveFrom = this.isMuted ? 0 : from;
      const effectiveTo = this.isMuted ? 0 : to;
      if (durationMs <= 0) {
        this.applyVolume(effectiveTo);
        resolve();
        return;
      }
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        const t = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        this.applyVolume(effectiveFrom + (effectiveTo - effectiveFrom) * eased);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          this.applyVolume(effectiveTo);
          resolve();
        }
      };
      tick();
    });
  }

  public async start(): Promise<boolean> {
    if (this.isPlaying) return true;

    // 1. Attempt HTML5 Audio File playback (primary track)
    let audio = this.createAudioElement(this.primaryUrl);
    if (audio) {
      const okPrimary = await this.playHtml5(audio, this.primaryUrl);
      if (okPrimary) return true;

      // 2. Attempt per-category fallback track
      if (this.fallbackUrl && this.fallbackUrl !== this.primaryUrl) {
        audio = this.createAudioElement(this.fallbackUrl);
        const okFallback = await this.playHtml5(audio, this.fallbackUrl);
        if (okFallback) return true;
      }
    }

    // 3. Last-resort: Web Audio Harmonic Synthesizer
    console.warn('[AudioEngine] HTML5 playback failed, starting Web Audio Harmonic Synth.');
    return this.startSynthEngine();
  }

  private playHtml5(audio: HTMLAudioElement, url: string): Promise<boolean> {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        audio.removeEventListener('error', onError);
        audio.removeEventListener('playing', onPlaying);
        audio.removeEventListener('loadedmetadata', onMetadata);
        resolve(ok);
      };
      const onError = () => {
        console.warn(`[AudioEngine] HTML5 Audio failed for ${url}.`);
        finish(false);
      };
      const onPlaying = () => {
        this.isPlaying = true;
        finish(true);
      };
      const onMetadata = () => {
        // Skip intro/ambience by starting at the configured offset (clamped
        // to the track length so short fallbacks never break playback).
        if (this.startTime > 0) {
          try {
            const maxStart = Math.max(0, audio.duration - 1);
            audio.currentTime = Math.min(this.startTime, maxStart);
          } catch {
            // ignore — continue from 0
          }
        }
      };

      audio.addEventListener('error', onError);
      audio.addEventListener('playing', onPlaying);
      audio.addEventListener('loadedmetadata', onMetadata);

      this.audioElement = audio;
      this.currentSourceUrl = url;
      audio.volume = 0;
      audio.muted = this.isMuted;

      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          // Some browsers resolve before 'playing' fires
          this.isPlaying = true;
          setTimeout(() => finish(true), 50);
        }).catch(() => {
          finish(false);
        });
      } else {
        this.isPlaying = true;
        finish(true);
      }
    });
  }

  public async startWithFade(): Promise<boolean> {
    const wasPlaying = this.isPlaying;
    const ok = await this.start();
    if (ok && !wasPlaying) {
      await this.fadeVolume(0, this.masterVolume, 1200);
    }
    return ok;
  }

  public async startSynthEngine(): Promise<boolean> {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return false;

      this.audioCtx = new AudioContextClass();

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // Only report success when the context is actually running. Some mobile
      // browsers resolve resume() while leaving the context suspended, which
      // would make us think music is playing while it is silent.
      if (this.audioCtx.state !== 'running') {
        return false;
      }

      this.gainNode = this.audioCtx.createGain();
      const initialVol = this.isMuted ? 0 : this.masterVolume;
      this.gainNode.gain.setValueAtTime(initialVol, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      this.isPlaying = true;
      this.startPolyphonicLoop();
      console.log(`[AudioEngine] Web Audio Synth active for style: ${this.fontStyle}`);
      return true;
    } catch (e) {
      console.error('[AudioEngine] Web Audio Synth initialization failed:', e);
      return false;
    }
  }

  private startPolyphonicLoop() {
    if (!this.audioCtx || !this.gainNode) return;

    // Harmonic Chords tailored by template style
    let chords: number[][] = [
      [261.63, 329.63, 392.0, 523.25], // C Major
      [220.0, 261.63, 329.63, 440.0],  // A Minor
      [174.61, 220.0, 261.63, 349.23], // F Major
      [196.0, 246.94, 293.66, 392.0],  // G Major
    ];
    let tempoMs = 380;

    if (this.fontStyle === 'elegant' || this.fontStyle === 'luxury') {
      // D Major 7 / Bm romantic waltz
      chords = [
        [293.66, 369.99, 440.0, 554.37], // Dmaj7
        [246.94, 293.66, 369.99, 440.0], // Bm7
        [196.0, 246.94, 293.66, 392.0],  // G
        [220.0, 277.18, 329.63, 440.0],  // A
      ];
      tempoMs = 450;
    } else if (this.fontStyle === 'cute' || this.fontStyle === 'playful') {
      // Upbeat F Major bright party
      chords = [
        [349.23, 440.0, 523.25, 698.46], // F
        [261.63, 329.63, 392.0, 523.25], // C
        [293.66, 349.23, 440.0, 587.33], // Dm
        [233.08, 293.66, 349.23, 466.16], // Bb
      ];
      tempoMs = 280;
    } else if (this.fontStyle === 'neon') {
      // Synthwave Synth D Minor
      chords = [
        [146.83, 220.0, 261.63, 349.23], // Dm
        [116.54, 174.61, 233.08, 349.23], // Bb
        [130.81, 196.0, 261.63, 392.0],  // C
        [110.0, 164.81, 220.0, 329.63],  // Am
      ];
      tempoMs = 320;
    } else if (this.fontStyle === 'minimalist') {
      // Chill E Minor 7
      chords = [
        [164.81, 196.0, 246.94, 293.66], // Em7
        [130.81, 164.81, 196.0, 261.63], // Cmaj7
        [146.83, 174.61, 220.0, 293.66], // Dm7
        [123.47, 146.83, 196.0, 246.94], // G
      ];
      tempoMs = 550;
    }

    let step = 0;

    const playHarmonicStep = () => {
      if (!this.isPlaying || !this.audioCtx || !this.gainNode) return;

      const currentChord = chords[Math.floor(step / 4) % chords.length];
      const melodyNote = currentChord[step % currentChord.length];

      // Bass note
      const bassOsc = this.audioCtx.createOscillator();
      const bassGain = this.audioCtx.createGain();
      bassOsc.type = this.fontStyle === 'neon' ? 'sawtooth' : 'sine';
      bassOsc.frequency.setValueAtTime(currentChord[0] / 2, this.audioCtx.currentTime);

      bassGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.18, this.audioCtx.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (tempoMs / 1000) * 0.9);

      bassOsc.connect(bassGain);
      bassGain.connect(this.gainNode);
      bassOsc.start();
      bassOsc.stop(this.audioCtx.currentTime + (tempoMs / 1000));

      // Arpeggiated Melody note
      const melOsc = this.audioCtx.createOscillator();
      const melGain = this.audioCtx.createGain();
      melOsc.type = this.fontStyle === 'cute' ? 'triangle' : 'sine';
      melOsc.frequency.setValueAtTime(melodyNote, this.audioCtx.currentTime);

      melGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      melGain.gain.exponentialRampToValueAtTime(0.14, this.audioCtx.currentTime + 0.03);
      melGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

      melOsc.connect(melGain);
      melGain.connect(this.gainNode);
      melOsc.start();
      melOsc.stop(this.audioCtx.currentTime + 0.55);

      step++;
    };

    playHarmonicStep();
    this.timerId = window.setInterval(playHarmonicStep, tempoMs);
  }

  public async pause(): Promise<void> {
    this.isPlaying = false;
    await this.fadeVolume(this.masterVolume, 0, 400);

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
    }

    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
  }

  public async resume(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;

    if (this.audioElement && this.audioElement.src) {
      try {
        this.audioElement.volume = 0;
        this.audioElement.muted = this.isMuted;
        const p = this.audioElement.play();
        if (p !== undefined) await p;
        await this.fadeVolume(0, this.masterVolume, 700);
        return;
      } catch (e) {
        console.warn('[AudioEngine] Resume failed, starting synth fallback:', (e as Error)?.message || String(e));
        await this.startSynthEngine();
        return;
      }
    }

    if (this.audioCtx) {
      this.audioCtx.resume();
      if (!this.timerId) {
        this.startPolyphonicLoop();
      }
      await this.fadeVolume(0, this.masterVolume, 700);
    } else {
      await this.startWithFade();
    }
  }

  public async toggle(): Promise<void> {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.resume();
    }
  }

  public async toggleMute(): Promise<boolean> {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.lastVolumeBeforeMute = this.masterVolume;
      await this.fadeVolume(this.masterVolume, 0, 200);
    } else {
      this.masterVolume = this.lastVolumeBeforeMute || 0.6;
      await this.fadeVolume(0, this.masterVolume, 300);
    }
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (!this.isMuted) {
      this.applyVolume(this.masterVolume);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
      this.gainNode = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public getSourceUrl(): string {
    return this.currentSourceUrl;
  }
}

// ---------------------------------------------------------------------------
// Lightweight preview helper for catalog cards: plays a track for a short
// duration (default ~10s) and stops any preview already playing.
// ---------------------------------------------------------------------------
let previewAudio: HTMLAudioElement | null = null;
let previewTimer: number | null = null;

export const stopPreview = (): void => {
  if (previewTimer) {
    window.clearTimeout(previewTimer);
    previewTimer = null;
  }
  if (previewAudio) {
    try {
      previewAudio.pause();
      previewAudio.src = '';
    } catch {
      // ignore
    }
    previewAudio = null;
  }
};

export const previewTrack = (
  urls: string[],
  volume: number = 0.35,
  durationMs: number = 10000,
  startAtMs: number = 0
): (() => void) => {
  stopPreview();

  const play = (index: number): void => {
    if (index >= urls.length) return;
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = volume;
      audio.loop = false;
      previewAudio = audio;

      const onMetadata = () => {
        // Start preview from the same offset the real invitation uses so
        // customers hear the vocal hook, not the intro.
        if (startAtMs > 0) {
          try {
            const maxStart = Math.max(0, audio.duration * 1000 - 1000);
            audio.currentTime = Math.min(startAtMs / 1000, maxStart / 1000);
          } catch {
            // ignore
          }
        }
      };

      audio.addEventListener('error', () => {
        audio.removeEventListener('loadedmetadata', onMetadata);
        audio.remove();
        play(index + 1);
      });
      audio.addEventListener('loadedmetadata', onMetadata);

      audio.src = urls[index];
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          audio.removeEventListener('loadedmetadata', onMetadata);
          audio.remove();
          play(index + 1);
        });
      }
    } catch {
      // ignore
    }
  };

  play(0);

  previewTimer = window.setTimeout(stopPreview, durationMs);
  return stopPreview;
};
