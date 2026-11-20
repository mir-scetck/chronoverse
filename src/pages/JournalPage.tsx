import {
  Award,
  BookMarked,
  CheckCircle2,
  Download,
  Film,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import { KwlWorksheet } from '../components/learning/KwlWorksheet';
import { SourcesDrawer } from '../components/learning/SourcesDrawer';
import { AcademyCard, PillButton, SectionHeader } from '../components/ui/Primitives';
import { BAGHDAD_ARTIFACTS } from '../data/baghdad/artifacts';
import { BAGHDAD_DISTRICTS } from '../data/baghdad/districts';
import { BAGHDAD_VIDEOS } from '../data/baghdad/videos';
import { BAGHDAD_WORLD } from '../data/worlds/baghdad';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';
import { useAppStore } from '../stores/appStore';
import { calculateSealProgress } from '../utils/progress';

export function JournalPage() {
  const language = useAcademyStore((s) => s.language);
  const visitedDistrictIds = useAcademyStore((s) => s.visitedDistrictIds);
  const inspectedArtifactIds = useAcademyStore((s) => s.inspectedArtifactIds);
  const watchedVideoIds = useAcademyStore((s) => s.watchedVideoIds);
  const passedQuizDistrictIds = useAcademyStore((s) => s.passedQuizDistrictIds);
  const resetAcademyProgress = useAcademyStore((s) => s.resetAcademyProgress);

  const { getWorldProgress, resetWorldProgress, exportProgressJson } = useAppStore();
  const { t, loc } = useT(language);

  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const wp = getWorldProgress(BAGHDAD_WORLD.id);
  const seal = calculateSealProgress(BAGHDAD_WORLD, wp);

  const totalStickers = BAGHDAD_DISTRICTS.length + BAGHDAD_ARTIFACTS.length;
  const earnedStickers = visitedDistrictIds.length + inspectedArtifactIds.length;

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chronoverse-baghdad-journal.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - seal.percent / 100);

  return (
    <div className="space-y-8" data-testid="journal-page">
      <SectionHeader
        eyebrow={t('journalSealTitle')}
        title={t('journalTitle')}
        action={
          <div className="cv-no-print flex flex-wrap gap-2">
            <PillButton variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4 text-[var(--cv-primary)]" />
              <span>{t('journalExport')}</span>
            </PillButton>
            <PillButton variant="primary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              <span>{t('journalPrint')}</span>
            </PillButton>
            <PillButton variant="lapis" onClick={() => setSourcesOpen(true)}>
              <BookMarked className="h-4 w-4 text-[#D8AE66]" />
              <span>{t('journalSourcesBtn')}</span>
            </PillButton>
          </div>
        }
      />

      {/* Seal & Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AcademyCard className="flex items-center gap-4">
          <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
            <circle cx="42" cy="42" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="6" />
            <circle
              cx="42"
              cy="42"
              r={radius}
              fill="none"
              stroke="#2B6CB0"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 42 42)"
            />
            <text
              x="42"
              y="46"
              textAnchor="middle"
              fill="#1E293B"
              fontSize="14"
              fontWeight="700"
              className="cv-tabular"
            >
              {seal.percent}%
            </text>
          </svg>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
              {seal.sealEarned ? t('journalSealEarned') : t('journalSealTitle')}
            </p>
            <p className="cv-tabular mt-1 text-xl font-extrabold text-[var(--cv-text)]" dir="ltr">
              {seal.completed} / {seal.total}
            </p>
          </div>
        </AcademyCard>

        <AcademyCard soft className="flex items-center gap-4">
          <Award className="h-9 w-9 shrink-0 text-[#E69F3E]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-muted)]">
              {t('journalTabDiscoveries')}
            </p>
            <p className="cv-tabular mt-1 text-xl font-extrabold text-[var(--cv-text)]" dir="ltr">
              {earnedStickers} / {totalStickers}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">
              {language === 'ar' ? 'الاختبارات المجتازة:' : 'Quizzes passed:'}{' '}
              <span dir="ltr" className="cv-tabular">
                {passedQuizDistrictIds.length}/{BAGHDAD_DISTRICTS.length}
              </span>
            </p>
          </div>
        </AcademyCard>

        <AcademyCard soft className="flex items-center gap-4">
          <Film className="h-9 w-9 shrink-0 text-[#3A9BA8]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-muted)]">
              {t('navVideos')}
            </p>
            <p className="cv-tabular mt-1 text-xl font-extrabold text-[var(--cv-text)]" dir="ltr">
              {watchedVideoIds.length} / {BAGHDAD_VIDEOS.length}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">{t('videoWatched')}</p>
          </div>
        </AcademyCard>
      </div>

      {/* Persistent KWL Worksheet */}
      <KwlWorksheet />

      {/* Sticker Passport: 6 Districts + 8 Artifacts */}
      <AcademyCard className="space-y-5">
        <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
          {t('journalTabDiscoveries')}
        </h3>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
            {t('navDistricts')}{' '}
            <span dir="ltr" className="cv-tabular">
              ({visitedDistrictIds.length}/{BAGHDAD_DISTRICTS.length})
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BAGHDAD_DISTRICTS.map((d) => {
              const visited = visitedDistrictIds.includes(d.id);
              const quizzed = passedQuizDistrictIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  className={`rounded-[14px] border p-4 ${
                    visited
                      ? 'border-[var(--cv-accent-sage)]/45 bg-[#ECF7F1]'
                      : 'border-[var(--cv-border)] bg-[var(--cv-surface-soft)] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[var(--cv-text)]">{loc(d.name)}</span>
                    {visited && <CheckCircle2 className="h-4 w-4 text-[var(--cv-accent-sage)]" />}
                  </div>
                  <p className="mt-1 text-xs text-[var(--cv-muted)]">
                    {quizzed ? t('quizComplete') : visited ? t('mapDiscovered') : t('mapUndiscovered')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
            {t('navArtifacts')}{' '}
            <span dir="ltr" className="cv-tabular">
              ({inspectedArtifactIds.length}/{BAGHDAD_ARTIFACTS.length})
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BAGHDAD_ARTIFACTS.map((a) => {
              const inspected = inspectedArtifactIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-[14px] border p-3.5 ${
                    inspected
                      ? 'border-[var(--cv-primary)]/40 bg-[var(--cv-surface-soft)]'
                      : 'border-[var(--cv-border)] bg-white opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--cv-text)]">{loc(a.name)}</span>
                    {inspected && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cv-primary)]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AcademyCard>

      {/* Facts, Glossary & Conversations from 3D/People Dialogue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AcademyCard className="space-y-3">
          <h3 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
            {t('journalTabFacts')}
          </h3>
          {wp.discoveredFacts.length === 0 ? (
            <p className="text-sm text-[var(--cv-muted)]">{t('journalEmptyFacts')}</p>
          ) : (
            <div className="space-y-2.5">
              {wp.discoveredFacts.map((f) => (
                <div
                  key={f.id}
                  className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5"
                >
                  <p className="text-sm text-[var(--cv-text)]">{f.text}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--cv-primary)]">{f.source}</p>
                </div>
              ))}
            </div>
          )}
        </AcademyCard>

        <AcademyCard className="space-y-3">
          <h3 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
            {t('journalTabGlossary')}
          </h3>
          {wp.glossary.length === 0 ? (
            <p className="text-sm text-[var(--cv-muted)]">{t('journalEmptyGlossary')}</p>
          ) : (
            <div className="space-y-2.5">
              {wp.glossary.map((g) => (
                <div
                  key={g.id}
                  className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5"
                >
                  <p className="text-sm font-bold text-[var(--cv-text)]">
                    {language === 'ar' ? g.termAr : g.termEn}
                  </p>
                  <p className="mt-1 text-xs text-[var(--cv-muted)]">
                    {language === 'ar' ? g.defAr : g.defEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AcademyCard>
      </div>

      {/* Reset Footer */}
      <div className="cv-no-print flex justify-end">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-3 rounded-full border border-[var(--cv-accent-coral)] bg-[var(--cv-coral-soft)] px-4 py-2">
            <span className="text-xs font-semibold text-[#9E3924]">
              {t('journalResetConfirm')}
            </span>
            <button
              type="button"
              onClick={() => {
                resetWorldProgress(BAGHDAD_WORLD.id);
                resetAcademyProgress();
                setConfirmReset(false);
              }}
              className="cursor-pointer rounded-full bg-[var(--cv-accent-coral)] px-3.5 py-1 text-xs font-bold text-white"
            >
              {t('journalConfirmReset')}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="cursor-pointer rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[var(--cv-text)]"
            >
              {t('mapCancel')}
            </button>
          </div>
        ) : (
          <PillButton variant="ghost" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" />
            <span>{t('journalReset')}</span>
          </PillButton>
        )}
      </div>

      {sourcesOpen && <SourcesDrawer onClose={() => setSourcesOpen(false)} />}
    </div>
  );
}
