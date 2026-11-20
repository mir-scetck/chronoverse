import { CheckCircle2, Film } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LessonVideoPlayer } from '../components/media/LessonVideoPlayer';
import { AccuracyBadge } from '../components/ui/AccuracyBadge';
import { SectionHeader } from '../components/ui/Primitives';
import { BAGHDAD_VIDEOS } from '../data/baghdad/videos';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

type VideoCategoryFilter = 'all' | 'overview' | 'district' | 'artifact';

export function VideosPage() {
  const language = useAcademyStore((s) => s.language);
  const watchedIds = useAcademyStore((s) => s.watchedVideoIds);
  const { t, loc } = useT(language);
  const navigate = useNavigate();

  const [filter, setFilter] = useState<VideoCategoryFilter>('all');
  const [selectedId, setSelectedId] = useState<string>(BAGHDAD_VIDEOS[0].id);

  const filteredClips =
    filter === 'all'
      ? BAGHDAD_VIDEOS
      : BAGHDAD_VIDEOS.filter((v) => v.category === filter);

  const activeClip =
    BAGHDAD_VIDEOS.find((v) => v.id === selectedId) ?? filteredClips[0] ?? BAGHDAD_VIDEOS[0];

  const categories: Array<{ id: VideoCategoryFilter; labelEn: string; labelAr: string }> = [
    { id: 'all', labelEn: `All (${BAGHDAD_VIDEOS.length})`, labelAr: `الكل (${BAGHDAD_VIDEOS.length})` },
    { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة' },
    { id: 'district', labelEn: 'District Tours (6)', labelAr: 'جولات الأحياء (٦)' },
    { id: 'artifact', labelEn: 'Artifact Details (8)', labelAr: 'تفاصيل القطع (٨)' },
  ];

  return (
    <div className="space-y-8" data-testid="videos-page">
      <SectionHeader
        eyebrow={`${watchedIds.length} / ${BAGHDAD_VIDEOS.length} ${t('videoWatched')}`}
        title={t('navVideos')}
        subtitle={t('videoStoryboardMode')}
      />

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-testid={`video-filter-${cat.id}`}
            onClick={() => setFilter(cat.id)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
              filter === cat.id
                ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)] text-white'
                : 'border-[var(--cv-border)] bg-white text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
            }`}
          >
            {language === 'ar' ? cat.labelAr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Active Player */}
      <LessonVideoPlayer
        clip={activeClip}
        onStart3dTour={(clip) =>
          navigate(clip.locationId ? `/explore-3d?loc=${clip.locationId}` : '/explore-3d')
        }
      />

      {/* Video Archive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClips.map((clip) => {
          const isSelected = clip.id === activeClip.id;
          const isWatched = watchedIds.includes(clip.id);
          return (
            <button
              key={clip.id}
              type="button"
              data-testid={`video-card-${clip.id}`}
              onClick={() => setSelectedId(clip.id)}
              className={`flex cursor-pointer flex-col overflow-hidden rounded-[18px] border text-start transition-all ${
                isSelected
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-surface-soft)] ring-2 ring-[var(--cv-primary)]/20'
                  : 'border-[var(--cv-border)] bg-white hover:border-[var(--cv-primary)]/60'
              }`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#0C182E]">
                <img
                  src={clip.posterSrc}
                  alt={loc(clip.title)}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 rounded-full bg-[#0C182E]/90 px-2.5 py-0.5 text-[11px] font-bold text-[#F7F1E1]">
                  <Film className="h-3 w-3 text-[#3A9BA8]" />
                  {clip.durationSec}s
                </span>
                {isWatched && (
                  <span className="absolute top-2 start-2 inline-flex items-center gap-1 rounded-full bg-[#2F855A] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('videoWatched')}
                  </span>
                )}
              </div>

              <div className="space-y-2 p-4">
                <AccuracyBadge tag={clip.accuracy} showTooltip={false} />
                <h3 className="cv-heading text-sm font-bold text-[var(--cv-text)]">
                  {loc(clip.title)}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-[var(--cv-muted)]">
                  {loc(clip.summary)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
