import { useEffect } from 'react';
import type { LocalizedText, StoryScene } from '../contracts';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

interface StoryPlayerOverlayProps {
  story: StoryScene;
  subtitle: LocalizedText | null;
  progress: number;
  onSkip: () => void;
}

export function StoryPlayerOverlay({
  story,
  subtitle,
  progress,
  onSkip,
}: StoryPlayerOverlayProps) {
  const { settings } = useAppStore();
  const { t, loc } = useT(settings.language);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);

  return (
    <div
      data-testid="story-player-overlay"
      className="cv-lapis-theme pointer-events-none absolute inset-0 z-35 flex flex-col justify-between bg-transparent"
    >
      {/* Top 2.39:1 Letterbox Bar */}
      <div className="pointer-events-auto flex h-16 items-center justify-between border-b border-[#D8AE66]/35 bg-[#0C182E] px-6 sm:h-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3A9BA8]">
            {story.tag}
          </p>
          <h2 className="cv-display text-xl font-semibold text-[#F7F1E1]">
            {loc(story.title)}
          </h2>
        </div>

        <button
          type="button"
          data-testid="story-skip-btn"
          onClick={onSkip}
          className="cursor-pointer rounded-full border border-[#D8AE66]/65 bg-[#162B4D] px-4 py-1.5 text-xs font-semibold text-[#E8C988] hover:border-[#D8AE66]"
        >
          {t('storySkip')}
        </button>
      </div>

      {/* Bottom 2.39:1 Letterbox Bar + Subtitles */}
      <div className="pointer-events-auto flex min-h-24 flex-col items-center justify-center border-t border-[#D8AE66]/35 bg-[#0C182E] px-6 py-4 text-center">
        {settings.subtitles && subtitle && (
          <div className="max-w-3xl space-y-1">
            <p className="cv-arabic text-base font-medium text-[#F7F1E1] sm:text-lg">
              {subtitle.ar}
            </p>
            {settings.includeTranslation && (
              <p className="text-xs text-[#C5D1DE] sm:text-sm">{subtitle.en}</p>
            )}
          </div>
        )}
        <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-[#162B4D]">
          <div
            className="h-full bg-[#3A9BA8]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
