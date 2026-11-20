import { CheckCircle2, Footprints, Microscope } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DistrictQuiz } from '../components/learning/DistrictQuiz';
import { HotspotImage } from '../components/media/HotspotImage';
import { LessonVideoPlayer } from '../components/media/LessonVideoPlayer';
import { AccuracyBadge } from '../components/ui/AccuracyBadge';
import { AcademyCard, PillLink, SectionHeader } from '../components/ui/Primitives';
import { BAGHDAD_ARTIFACTS } from '../data/baghdad/artifacts';
import { BAGHDAD_MEDIA_CREDITS } from '../data/baghdad/credits';
import { BAGHDAD_DISTRICTS } from '../data/baghdad/districts';
import { BAGHDAD_VIDEOS } from '../data/baghdad/videos';
import { websiteStudyAudio } from '../engine/audio/websiteAudio';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function DistrictLessonPage() {
  const { id } = useParams<{ id: string }>();
  const language = useAcademyStore((s) => s.language);
  const visitedDistrictIds = useAcademyStore((s) => s.visitedDistrictIds);
  const markDistrictVisited = useAcademyStore((s) => s.markDistrictVisited);
  const { t, loc } = useT(language);

  const district =
    BAGHDAD_DISTRICTS.find((d) => d.id === id) ?? BAGHDAD_DISTRICTS[0];

  useEffect(() => {
    markDistrictVisited(district.id);
    websiteStudyAudio.setDistrict(district.id);
  }, [district.id, markDistrictVisited]);

  const credit =
    BAGHDAD_MEDIA_CREDITS[district.imageCreditId] ??
    BAGHDAD_MEDIA_CREDITS['round-city-overview'];
  const clip =
    BAGHDAD_VIDEOS.find((v) => v.id === district.videoId) ?? BAGHDAD_VIDEOS[0];
  const districtArtifacts = BAGHDAD_ARTIFACTS.filter((a) =>
    district.artifactIds.includes(a.id),
  );

  return (
    <div className="space-y-8" data-testid={`district-page-${district.id}`}>
      {/* District Pill Switcher */}
      <div className="flex flex-wrap gap-2">
        {BAGHDAD_DISTRICTS.map((d) => {
          const active = d.id === district.id;
          const visited = visitedDistrictIds.includes(d.id);
          return (
            <Link
              key={d.id}
              to={`/districts/${d.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)] text-white'
                  : 'border-[var(--cv-border)] bg-white text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
              }`}
            >
              {visited && (
                <CheckCircle2
                  className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-[var(--cv-accent-sage)]'}`}
                />
              )}
              <span>{loc(d.name)}</span>
            </Link>
          );
        })}
      </div>

      {/* Header */}
      <SectionHeader
        eyebrow={loc(district.eraNote)}
        title={loc(district.name)}
        subtitle={loc(district.summary)}
        action={
          <PillLink to={`/explore-3d?loc=${district.id}`} variant="lapis">
            <Footprints className="h-4 w-4 text-[#D8AE66]" />
            <span>{t('mapConfirmAction')}</span>
          </PillLink>
        }
      />

      {/* Learning Goals + Accuracy */}
      <AcademyCard soft className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
            Learning Goals
          </span>
          <AccuracyBadge tag={district.accuracy} />
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {district.learningGoals.map((goal, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[var(--cv-text)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cv-accent-sage)]" />
              <span>{loc(goal)}</span>
            </li>
          ))}
        </ul>
      </AcademyCard>

      {/* Interactive Hotspot Plate */}
      <AcademyCard>
        <HotspotImage credit={credit} hotspots={district.hotspots} />
      </AcademyCard>

      {/* District Video Tour */}
      <LessonVideoPlayer clip={clip} />

      {/* Linked District Artifacts */}
      {districtArtifacts.length > 0 && (
        <div className="space-y-4">
          <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
            {t('navArtifacts')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {districtArtifacts.map((art) => (
              <Link
                key={art.id}
                to={`/artifacts?id=${art.id}`}
                className="cv-card flex items-start justify-between gap-4 hover:border-[var(--cv-primary)]"
              >
                <div className="space-y-1.5">
                  <AccuracyBadge tag={art.accuracy} showTooltip={false} />
                  <h4 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
                    {loc(art.name)}
                  </h4>
                  <p className="text-xs leading-relaxed text-[var(--cv-muted)]">
                    {loc(art.summary)}
                  </p>
                </div>
                <Microscope className="h-5 w-5 shrink-0 text-[var(--cv-primary)]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3-Question District Mastery Quiz */}
      <DistrictQuiz key={district.id} districtId={district.id} questions={district.quiz} />
    </div>
  );
}
