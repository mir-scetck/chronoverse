import { CheckCircle2, Film } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ComparisonSlider } from '../components/media/ComparisonSlider';
import { HotspotImage } from '../components/media/HotspotImage';
import { VideoModalPlayer } from '../components/media/VideoModalPlayer';
import { AccuracyBadge } from '../components/ui/AccuracyBadge';
import { AcademyCard, PillButton, SectionHeader } from '../components/ui/Primitives';
import { BAGHDAD_ARTIFACTS } from '../data/baghdad/artifacts';
import { BAGHDAD_MEDIA_CREDITS } from '../data/baghdad/credits';
import { BAGHDAD_VIDEOS } from '../data/baghdad/videos';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function ArtifactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const language = useAcademyStore((s) => s.language);
  const inspectedIds = useAcademyStore((s) => s.inspectedArtifactIds);
  const markArtifactInspected = useAcademyStore((s) => s.markArtifactInspected);
  const { t, loc } = useT(language);

  const requestedId = searchParams.get('id');
  const activeArtifact =
    BAGHDAD_ARTIFACTS.find((a) => a.id === requestedId) ?? BAGHDAD_ARTIFACTS[0];

  const [modalVideoId, setModalVideoId] = useState<string | null>(null);

  useEffect(() => {
    markArtifactInspected(activeArtifact.id);
  }, [activeArtifact.id, markArtifactInspected]);

  const credit =
    BAGHDAD_MEDIA_CREDITS[activeArtifact.imageCreditId] ??
    BAGHDAD_MEDIA_CREDITS['scholars-astrolabe'];
  const detailClip =
    BAGHDAD_VIDEOS.find((v) => v.id === activeArtifact.videoId) ?? null;
  const activeModalClip = modalVideoId
    ? BAGHDAD_VIDEOS.find((v) => v.id === modalVideoId) ?? null
    : null;

  const comparisonArtifacts = BAGHDAD_ARTIFACTS.filter((a) => Boolean(a.comparison));

  return (
    <div className="space-y-10" data-testid="artifacts-page">
      <SectionHeader
        eyebrow={t('artifactsEyebrow')}
        title={t('artifactsTitle')}
        subtitle={t('hotspotHint')}
      />

      {/* 8 Artifact Selector Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BAGHDAD_ARTIFACTS.map((art) => {
          const active = art.id === activeArtifact.id;
          const done = inspectedIds.includes(art.id);
          return (
            <button
              key={art.id}
              type="button"
              data-testid={`artifact-tab-${art.id}`}
              onClick={() => setSearchParams({ id: art.id })}
              className={`flex cursor-pointer flex-col justify-between rounded-[16px] border p-4 text-start transition-all ${
                active
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-surface-soft)] ring-2 ring-[var(--cv-primary)]/20'
                  : 'border-[var(--cv-border)] bg-white hover:border-[var(--cv-primary)]/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[var(--cv-primary)]">
                  {loc(art.era)}
                </span>
                {done && (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--cv-accent-sage)]" />
                )}
              </div>
              <p className="cv-heading mt-1.5 text-sm font-bold text-[var(--cv-text)]">
                {loc(art.name)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Artifact Microscope */}
      <AcademyCard className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--cv-border)] pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
                {loc(activeArtifact.era)}
              </span>
              <AccuracyBadge tag={activeArtifact.accuracy} />
            </div>
            <h2 className="cv-heading text-2xl font-extrabold text-[var(--cv-text)]">
              {loc(activeArtifact.name)}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--cv-text)]">
              {loc(activeArtifact.historicalDetail)}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">
              <strong className="text-[var(--cv-text)]">{t('cardSource')}: </strong>
              {activeArtifact.sourceNote}
            </p>
          </div>

          {detailClip && (
            <PillButton
              variant="lapis"
              onClick={() => setModalVideoId(detailClip.id)}
            >
              <Film className="h-4 w-4 text-[#D8AE66]" />
              <span>{t('watchDetailVideo')}</span>
            </PillButton>
          )}
        </div>

        <HotspotImage credit={credit} hotspots={activeArtifact.hotspots} />
      </AcademyCard>

      {/* Era Comparison Sliders */}
      <div className="space-y-6">
        <SectionHeader
          eyebrow="800 CE ↔ Modern"
          title={t('sliderCompareHint')}
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {comparisonArtifacts.map(
            (art) =>
              art.comparison && (
                <ComparisonSlider key={art.comparison.id} spec={art.comparison} />
              ),
          )}
        </div>
      </div>

      {activeModalClip && (
        <VideoModalPlayer
          clip={activeModalClip}
          onClose={() => setModalVideoId(null)}
        />
      )}
    </div>
  );
}
