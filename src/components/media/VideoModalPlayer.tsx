import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { VideoClip } from '../../contracts';
import { useT } from '../../i18n/useT';
import { eventBus } from '../../services/eventBus';
import { useAcademyStore } from '../../stores/academyStore';
import { LessonVideoPlayer } from './LessonVideoPlayer';

interface VideoModalPlayerProps {
  clip: VideoClip;
  onClose: () => void;
  onStart3dTour?: (clip: VideoClip) => void;
}

export function VideoModalPlayer({ clip, onClose, onStart3dTour }: VideoModalPlayerProps) {
  const language = useAcademyStore((s) => s.language);
  const { t, loc } = useT(language);

  useEffect(() => {
    eventBus.emit('media:video:start', { videoId: clip.id, locationId: clip.locationId });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      eventBus.emit('media:video:end', { videoId: clip.id, watchedPercent: 100 });
    };
  }, [clip.id, clip.locationId, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={loc(clip.title)}
      data-testid="video-modal-player"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071020]/90 p-4"
    >
      <div className="cv-lapis-theme flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[18px] border border-[#D8AE66]/55 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D8AE66]/25 bg-[#162B4D] px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D8AE66]">
            {loc(clip.title)}
          </span>
          <button
            type="button"
            data-testid="video-modal-close"
            onClick={onClose}
            aria-label={t('cardClose')}
            className="cursor-pointer rounded-full p-1.5 text-[#C5D1DE] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 cv-scroll">
          <LessonVideoPlayer
            clip={clip}
            autoPlay
            variant="lapis"
            onStart3dTour={onStart3dTour}
          />
        </div>
      </div>
    </div>
  );
}
