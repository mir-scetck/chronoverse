import {
  ArrowRight,
  BookOpen,
  Compass,
  Film,
  Gamepad2,
  MessageCircle,
  Microscope,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmbeddedBaghdadExhibit } from '../components/exhibit/EmbeddedBaghdadExhibit';
import { InteractiveDistrictMap } from '../components/learning/InteractiveDistrictMap';
import { LessonVideoPlayer } from '../components/media/LessonVideoPlayer';
import { AccuracyBadge } from '../components/ui/AccuracyBadge';
import { AcademyCard, PillButton, PillLink, SectionHeader } from '../components/ui/Primitives';
import { BAGHDAD_ARTIFACTS } from '../data/baghdad/artifacts';
import { BAGHDAD_MEDIA_CREDITS } from '../data/baghdad/credits';
import { BAGHDAD_VIDEOS } from '../data/baghdad/videos';
import { BAGHDAD_WORLD } from '../data/worlds/baghdad';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function HomePage() {
  const language = useAcademyStore((s) => s.language);
  const markArtifactInspected = useAcademyStore((s) => s.markArtifactInspected);
  const { t, loc } = useT(language);
  const navigate = useNavigate();
  const [exhibitLoc, setExhibitLoc] = useState<string | null>(null);
  const [exhibitAutoStart, setExhibitAutoStart] = useState(false);

  const overviewClip =
    BAGHDAD_VIDEOS.find((v) => v.id === 'overview-baghdad-800') ?? BAGHDAD_VIDEOS[0];

  const scrollToStage = () => {
    document.getElementById('play-stage')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12" data-testid="home-page">
      {/* Hero Section */}
      <section className="grid grid-cols-1 items-center gap-8 rounded-[22px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 shadow-[var(--cv-shadow-soft)] lg:grid-cols-12 sm:p-8">
        <div className="space-y-5 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] px-3.5 py-1 text-xs font-bold text-[var(--cv-primary)]">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t('heroEyebrow')}</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--cv-text)] sm:text-5xl">
            {loc(BAGHDAD_WORLD.name)}
          </h1>

          <p className="text-base leading-relaxed text-[var(--cv-muted)] sm:text-lg">
            {t('tagline')}
          </p>

          <p className="rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-4 text-xs leading-relaxed text-[var(--cv-text)] sm:text-sm">
            {loc(BAGHDAD_WORLD.honestyNote)}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <PillButton
              variant="lapis"
              data-start="true"
              onClick={() => {
                setExhibitAutoStart(true);
                scrollToStage();
              }}
            >
              <Gamepad2 className="h-4 w-4 text-[#D8AE66]" />
              <span>{t('enterWorld')}</span>
            </PillButton>

            <PillLink to="/districts/golden-gate-approach" variant="primary">
              <span>{t('navDistricts')}</span>
              <ArrowRight className="h-4 w-4" />
            </PillLink>

            <PillLink to="/artifacts" variant="secondary">
              <Microscope className="h-4 w-4 text-[var(--cv-primary)]" />
              <span>{t('navArtifacts')}</span>
            </PillLink>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-[18px] border border-[var(--cv-border)] bg-[#0C182E] shadow-md">
            <img
              src="/src/assets/images/baghdad_round_city_overview_1795208338186.jpg"
              alt={loc(BAGHDAD_MEDIA_CREDITS['round-city-overview'].title)}
              className="aspect-[16/11] w-full object-cover"
            />
            <div className="flex items-center justify-between gap-2 bg-[#0C182E] px-4 py-2.5 text-xs text-[#F7F1E1]">
              <span className="font-semibold text-[#E8C988]">Madinat al-Salam · 762–800 CE</span>
              <AccuracyBadge tag="documented" showTooltip={false} />
            </div>
          </div>
        </div>
      </section>

      {/* Concept Overview Video Player */}
      <section aria-labelledby="home-overview-heading">
        <SectionHeader
          eyebrow={t('timelineLabel')}
          title={loc(overviewClip.title)}
          subtitle={loc(overviewClip.summary)}
          action={
            <PillLink to="/videos" variant="secondary">
              <Film className="h-4 w-4 text-[var(--cv-primary)]" />
              <span>{t('navVideos')} (15)</span>
            </PillLink>
          }
        />
        <LessonVideoPlayer
          clip={overviewClip}
          onStart3dTour={() => {
            setExhibitAutoStart(true);
            scrollToStage();
          }}
        />
      </section>

      {/* Interactive District Map */}
      <section aria-labelledby="home-map-heading">
        <SectionHeader
          eyebrow={t('districtsEyebrow')}
          title={t('districtsTitle')}
        />
        <InteractiveDistrictMap
          onWalkIn3d={(districtId) => {
            setExhibitLoc(districtId);
            setExhibitAutoStart(true);
            scrollToStage();
          }}
        />
      </section>

      {/* Embedded 3D Baghdad Exhibit Inside the Website */}
      <section id="play-stage" aria-labelledby="home-3d-heading">
        <SectionHeader
          eyebrow={t('browserWorldBadge')}
          title={t('beginJourney')}
          subtitle={t('headphonesTip')}
          action={
            <PillButton
              variant="secondary"
              onClick={() => navigate('/explore-3d')}
            >
              <span>{t('navExplore3d')}</span>
              <ArrowRight className="h-4 w-4" />
            </PillButton>
          }
        />
        <EmbeddedBaghdadExhibit
          initialLocationId={exhibitLoc}
          autoStart={exhibitAutoStart}
        />
      </section>

      {/* Featured Micro-Details Preview */}
      <section>
        <SectionHeader
          eyebrow={t('artifactsEyebrow')}
          title={t('artifactsTitle')}
          action={
            <PillLink to="/artifacts" variant="primary">
              <span>{t('navArtifacts')}</span>
              <ArrowRight className="h-4 w-4" />
            </PillLink>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BAGHDAD_ARTIFACTS.slice(0, 4).map((art) => {
            const credit = BAGHDAD_MEDIA_CREDITS[art.imageCreditId];
            return (
              <Link
                key={art.id}
                to={`/artifacts?id=${art.id}`}
                onClick={() => markArtifactInspected(art.id)}
                className="group flex flex-col justify-between overflow-hidden rounded-[18px] border border-[var(--cv-border)] bg-[var(--cv-surface)] shadow-[var(--cv-shadow-soft)] transition-transform hover:-translate-y-0.5"
              >
                <div>
                  {credit && (
                    <img
                      src={credit.imageSrc}
                      alt={loc(art.name)}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  )}
                  <div className="space-y-2 p-5">
                    <AccuracyBadge tag={art.accuracy} showTooltip={false} />
                    <h3 className="cv-heading text-base font-bold text-[var(--cv-text)] group-hover:text-[var(--cv-primary)]">
                      {loc(art.name)}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--cv-muted)]">
                      {loc(art.summary)}
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--cv-border)] px-5 py-3 text-xs font-bold text-[var(--cv-primary)]">
                  {t('navArtifacts')} →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Study Links: People & Journal */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AcademyCard className="flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cv-surface-soft)] text-[var(--cv-primary)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
              {t('dialogueTitle')}
            </h3>
            <p className="text-sm text-[var(--cv-muted)]">
              {loc(BAGHDAD_WORLD.characters[0].portrayalNotice)}
            </p>
          </div>
          <div>
            <PillLink to="/people" variant="primary">
              <span>{t('navPeople')}</span>
              <ArrowRight className="h-4 w-4" />
            </PillLink>
          </div>
        </AcademyCard>

        <AcademyCard soft className="flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--cv-accent-sage)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
              {t('journalTitle')}
            </h3>
            <p className="text-sm text-[var(--cv-muted)]">{t('kwlSaved')}</p>
          </div>
          <div>
            <PillLink to="/journal" variant="sage">
              <span>{t('navJournal')}</span>
              <ArrowRight className="h-4 w-4" />
            </PillLink>
          </div>
        </AcademyCard>
      </section>
    </div>
  );
}
