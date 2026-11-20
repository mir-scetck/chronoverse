import {
  Camera,
  Captions,
  CheckCircle2,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { VideoClip } from '../../contracts';
import { useT } from '../../i18n/useT';
import { eventBus } from '../../services/eventBus';
import { useAcademyStore } from '../../stores/academyStore';
import { AccuracyBadge } from '../ui/AccuracyBadge';

interface LessonVideoPlayerProps {
  clip: VideoClip;
  autoPlay?: boolean;
  variant?: 'academy' | 'lapis';
  onStart3dTour?: (clip: VideoClip) => void;
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function LessonVideoPlayer({
  clip,
  autoPlay = false,
  variant = 'academy',
  onStart3dTour,
}: LessonVideoPlayerProps) {
  const language = useAcademyStore((s) => s.language);
  const watchedIds = useAcademyStore((s) => s.watchedVideoIds);
  const markVideoWatched = useAcademyStore((s) => s.markVideoWatched);
  const { t, loc } = useT(language);

  const isWatched = watchedIds.includes(clip.id);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [hasRealVideo, setHasRealVideo] = useState(false);
  const [playing, setPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(clip.durationSec);
  const [playbackRate, setPlaybackRate] = useState<0.75 | 1 | 1.25 | 1.5>(1);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [narratingCueIdx, setNarratingCueIdx] = useState<number>(-1);

  // Probe cleanly whether a real MP4 exists in public/assets/videos/baghdad (prevents Vite HTML SPA fallback from stalling)
  useEffect(() => {
    let active = true;
    setHasRealVideo(false);
    setCurrentTime(0);
    setDuration(clip.durationSec);
    setPlaying(autoPlay);
    setNarratingCueIdx(-1);

    if (typeof fetch !== 'undefined') {
      fetch(clip.src, { method: 'HEAD' })
        .then((res) => {
          if (!active) return;
          const ct = res.headers?.get?.('content-type') ?? '';
          if (res.ok && ct.startsWith('video/')) {
            setHasRealVideo(true);
          }
        })
        .catch(() => {
          // Storyboard mode remains active cleanly
        });
    }

    return () => {
      active = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [clip.id, clip.src, clip.durationSec, autoPlay]);

  // Synchronize HTML5 <video> when real MP4 is present
  useEffect(() => {
    const v = videoRef.current;
    if (!hasRealVideo || !v) return;
    v.playbackRate = playbackRate;
    v.volume = volume;
    v.muted = muted;
  }, [hasRealVideo, playbackRate, volume, muted]);

  // Storyboard timer when playing without an external MP4 file
  useEffect(() => {
    if (hasRealVideo || !playing) return;
    const stepMs = 200;
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (stepMs / 1000) * playbackRate;
        if (next >= duration) {
          setPlaying(false);
          markVideoWatched(clip.id);
          eventBus.emit('media:video:end', { videoId: clip.id, watchedPercent: 100 });
          return duration;
        }
        if (next >= duration * 0.8) {
          markVideoWatched(clip.id);
        }
        return next;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [hasRealVideo, playing, playbackRate, duration, clip.id, markVideoWatched]);

  // Current transcript line
  const activeCueIndex = Math.max(
    0,
    clip.transcript.findIndex((line) => currentTime >= line.start && currentTime < line.end),
  );
  const activeCue = clip.transcript[activeCueIndex] ?? clip.transcript[0];

  // Optional Web Speech narration during Storyboard playback when unmuted
  useEffect(() => {
    if (hasRealVideo || !playing || muted || volume <= 0.05) return;
    if (activeCueIndex === narratingCueIdx) return;
    setNarratingCueIdx(activeCueIndex);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && activeCue) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(loc(activeCue.text));
        utter.lang = language === 'ar' ? 'ar-SA' : 'en-US';
        utter.rate = Math.min(1.4, playbackRate);
        utter.volume = volume;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore speech synthesis restrictions
      }
    }
  }, [
    hasRealVideo,
    playing,
    muted,
    volume,
    activeCueIndex,
    narratingCueIdx,
    activeCue,
    language,
    loc,
    playbackRate,
  ]);

  const togglePlay = () => {
    if (hasRealVideo && videoRef.current) {
      if (videoRef.current.paused) {
        void videoRef.current.play();
        setPlaying(true);
      } else {
        videoRef.current.pause();
        setPlaying(false);
      }
      return;
    }

    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    const next = !playing;
    setPlaying(next);
    if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  const seekTo = (sec: number) => {
    const clamped = Math.max(0, Math.min(duration, sec));
    setCurrentTime(clamped);
    setNarratingCueIdx(-1);
    if (hasRealVideo && videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el || !el.requestFullscreen) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isLapis = variant === 'lapis';

  return (
    <div
      ref={wrapperRef}
      data-testid={`lesson-video-${clip.id}`}
      className={`overflow-hidden rounded-[18px] border ${
        isLapis
          ? 'border-[#D8AE66]/45 bg-[#0C182E] text-[#F7F1E1]'
          : 'border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] shadow-[var(--cv-shadow-soft)]'
      }`}
    >
      {/* Video / Ken Burns Storyboard Viewport */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0C182E]">
        {hasRealVideo ? (
          <video
            ref={videoRef}
            src={clip.src}
            poster={clip.posterSrc}
            playsInline
            onTimeUpdate={(e) => {
              const tNow = e.currentTarget.currentTime;
              const d = e.currentTarget.duration || clip.durationSec;
              setCurrentTime(tNow);
              setDuration(d);
              if (tNow >= d * 0.8) markVideoWatched(clip.id);
            }}
            onEnded={() => {
              setPlaying(false);
              markVideoWatched(clip.id);
              eventBus.emit('media:video:end', { videoId: clip.id, watchedPercent: 100 });
            }}
            onError={() => setHasRealVideo(false)}
            className="h-full w-full object-cover"
          >
            {clip.vttEnSrc && (
              <track
                kind="captions"
                src={clip.vttEnSrc}
                srcLang="en"
                label="English"
                default={language === 'en'}
              />
            )}
            {clip.vttArSrc && (
              <track
                kind="captions"
                src={clip.vttArSrc}
                srcLang="ar"
                label="العربية"
                default={language === 'ar'}
              />
            )}
          </video>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={clip.posterSrc}
              alt={loc(clip.title)}
              className={`h-full w-full object-cover transition-transform ${
                playing ? 'cv-ken-burns' : 'scale-100'
              }`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0C182E]/90 via-transparent to-[#0C182E]/45" />
            <div className="absolute top-3 start-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0C182E]/90 px-3 py-1 text-[11px] font-semibold text-[#D8AE66] border border-[#D8AE66]/45">
                {t('videoStoryboardMode')}
              </span>
              {isWatched && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#2F855A] px-2.5 py-1 text-[11px] font-semibold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t('videoWatched')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Synced Caption Overlay */}
        {captionsOn && activeCue && (
          <div
            data-testid="video-caption-bar"
            className="pointer-events-none absolute inset-x-4 bottom-3 flex justify-center"
          >
            <div className="max-w-2xl rounded-xl border border-[#D8AE66]/40 bg-[#0C182E]/92 px-4 py-2 text-center shadow-lg">
              <p className="text-xs font-medium leading-relaxed text-[#F7F1E1] sm:text-sm">
                {loc(activeCue.text)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Player Controls + Turquoise Chapter Scrub */}
      <div
        className={`space-y-3 border-t p-4 ${
          isLapis
            ? 'border-[#D8AE66]/25 bg-[#162B4D]'
            : 'border-[var(--cv-border)] bg-[var(--cv-surface-soft)]'
        }`}
      >
        {/* Header Row */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="cv-heading text-base font-bold">{loc(clip.title)}</h3>
              <AccuracyBadge kind={clip.accuracy} />
            </div>
            <p className={`mt-0.5 text-xs ${isLapis ? 'text-[#C5D1DE]' : 'text-[var(--cv-muted)]'}`}>
              {loc(clip.summary)}
            </p>
          </div>

          {onStart3dTour && (
            <button
              type="button"
              onClick={() => onStart3dTour(clip)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3A9BA8] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{t('videoCameraTour')}</span>
            </button>
          )}
        </div>

        {/* Turquoise Chapter Pills */}
        {clip.chapters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${isLapis ? 'text-[#D8AE66]' : 'text-[var(--cv-muted)]'}`}>
              {t('videoChapters')}:
            </span>
            {clip.chapters.map((ch) => {
              const active = currentTime >= ch.time;
              return (
                <button
                  key={ch.time}
                  type="button"
                  onClick={() => seekTo(ch.time)}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? 'bg-[#3A9BA8] text-white'
                      : isLapis
                        ? 'border border-[#3A9BA8]/50 bg-[#0C182E] text-[#C5D1DE] hover:border-[#3A9BA8]'
                        : 'border border-[#3A9BA8]/45 bg-white text-[#1E293B] hover:bg-[#EEF5F7]'
                  }`}
                >
                  {formatTime(ch.time)} · {loc(ch.label)}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrub Bar */}
        <div className="flex items-center gap-3">
          <span className="cv-tabular text-xs font-semibold">{formatTime(currentTime)}</span>
          <div className="relative flex-1">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.5}
              value={currentTime}
              aria-label={loc(clip.title)}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#3A9BA8]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none mt-0.5 h-1 w-full overflow-hidden rounded-full bg-black/15"
            >
              <div className="h-full bg-[#3A9BA8]" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <span className="cv-tabular text-xs font-semibold">{formatTime(duration)}</span>
        </div>

        {/* Transport Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid={`video-play-btn-${clip.id}`}
              onClick={togglePlay}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--cv-primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--cv-primary-hover)]"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{playing ? t('videoPause') : t('videoPlay')}</span>
            </button>

            <button
              type="button"
              onClick={() => seekTo(currentTime - 10)}
              aria-label={t('videoRewind10')}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isLapis
                  ? 'border-[#D8AE66]/45 text-[#F7F1E1] hover:bg-[#0C182E]'
                  : 'border-[var(--cv-border)] bg-white text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>-10s</span>
            </button>

            {/* Playback Speed */}
            <div className="flex items-center gap-1">
              {([0.75, 1, 1.25, 1.5] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  aria-label={`${t('videoSpeed')} ${rate}x`}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    playbackRate === rate
                      ? 'bg-[#3A9BA8] text-white'
                      : isLapis
                        ? 'bg-[#0C182E] text-[#C5D1DE]'
                        : 'bg-white text-[var(--cv-muted)] border border-[var(--cv-border)]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? t('navUnmute') : t('navMute')}
              className="cursor-pointer rounded-full p-1.5 hover:bg-black/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={muted ? 0 : volume}
              aria-label={t('settingsVoiceVol')}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                setMuted(v === 0);
              }}
              className="w-20 accent-[#3A9BA8]"
            />

            <button
              type="button"
              onClick={() => setCaptionsOn((c) => !c)}
              aria-pressed={captionsOn}
              className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                captionsOn
                  ? 'bg-[#3A9BA8] text-white'
                  : isLapis
                    ? 'bg-[#0C182E] text-[#C5D1DE]'
                    : 'bg-white text-[var(--cv-muted)] border border-[var(--cv-border)]'
              }`}
            >
              <Captions className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('videoCaptions')}</span>
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label={t('fullscreen3d')}
              className="cursor-pointer rounded-full p-1.5 hover:bg-black/10"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Clickable Interactive Transcript */}
        <div
          className={`space-y-1.5 rounded-[12px] border p-3 ${
            isLapis
              ? 'border-[#D8AE66]/25 bg-[#0C182E]'
              : 'border-[var(--cv-border)] bg-white'
          }`}
        >
          <p className={`text-[11px] font-bold uppercase tracking-wider ${isLapis ? 'text-[#D8AE66]' : 'text-[var(--cv-muted)]'}`}>
            {t('videoTranscript')}
          </p>
          <div className="space-y-1">
            {clip.transcript.map((line, i) => {
              const active = i === activeCueIndex;
              return (
                <button
                  key={line.start}
                  type="button"
                  onClick={() => seekTo(line.start)}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-1.5 text-start text-xs transition-colors ${
                    active
                      ? isLapis
                        ? 'bg-[#3A9BA8]/25 text-white font-semibold'
                        : 'bg-[#EEF5F7] text-[var(--cv-primary)] font-semibold'
                      : isLapis
                        ? 'text-[#C5D1DE] hover:bg-white/5'
                        : 'text-[var(--cv-muted)] hover:bg-[var(--cv-surface-soft)]'
                  }`}
                >
                  <span className="cv-tabular shrink-0 font-bold text-[#3A9BA8]">
                    {formatTime(line.start)}
                  </span>
                  <span className="leading-relaxed">{loc(line.text)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
