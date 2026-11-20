import { CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';
import { ConceptMap } from '../components/learning/ConceptMap';
import { AcademyCard, PillLink, SectionHeader } from '../components/ui/Primitives';
import type { WorldId } from '../contracts';
import { FUTURE_DESTINATIONS, PORTAL_WORLDS } from '../data/worlds/portalWorlds';
import { useT } from '../i18n/useT';
import { useAcademyStore } from '../stores/academyStore';

export function TimelinePage() {
  const language = useAcademyStore((s) => s.language);
  const { t, loc } = useT(language);
  const [selectedId, setSelectedId] = useState<WorldId>('baghdad');

  const selected = PORTAL_WORLDS.find((w) => w.id === selectedId) ?? PORTAL_WORLDS[0];

  return (
    <div className="space-y-10" data-testid="timeline-page">
      <SectionHeader
        eyebrow={t('timelineLabel')}
        title={t('portalTitle')}
        subtitle={t('portalSubtitle')}
      />

      {/* Interactive Era Scrubber Bar */}
      <div className="cv-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
            <Clock className="h-4 w-4" />
            <span>800 — 1991 CE</span>
          </div>
          <span className="text-xs font-medium text-[var(--cv-muted)]">
            {loc(selected.eraLabel)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PORTAL_WORLDS.map((w) => {
            const active = w.id === selected.id;
            const ready = w.status === 'ready';
            return (
              <button
                key={w.id}
                type="button"
                data-testid={`timeline-world-${w.id}`}
                onClick={() => setSelectedId(w.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-[16px] border p-5 text-start transition-all ${
                  active
                    ? 'border-[var(--cv-primary)] bg-[var(--cv-surface-soft)] ring-2 ring-[var(--cv-primary)]/20'
                    : 'border-[var(--cv-border)] bg-white hover:border-[var(--cv-primary)]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="cv-tabular font-extrabold text-[var(--cv-primary)]">
                      {loc(w.eraLabel)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        ready
                          ? 'bg-[#E9F6EF] text-[#1F6140]'
                          : 'bg-[#F1F5F9] text-[var(--cv-muted)]'
                      }`}
                    >
                      {ready && <CheckCircle2 className="h-3 w-3" />}
                      {ready ? t('statusReady') : t('statusPlanned')}
                    </span>
                  </div>
                  <h3 className="cv-heading mt-2 text-xl font-bold text-[var(--cv-text)]">
                    {loc(w.name)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--cv-muted)]">
                    {loc(w.tagline)}
                  </p>
                </div>

                <p className="mt-4 border-t border-[var(--cv-border)] pt-2.5 text-xs font-medium text-[var(--cv-text)]">
                  {loc(w.primaryCharacterName)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Era Card */}
        <div className="flex flex-col justify-between gap-4 rounded-[16px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-5 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <h3 className="cv-heading text-2xl font-bold text-[var(--cv-text)]">
              {loc(selected.name)} · {loc(selected.eraLabel)}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--cv-text)]">
              {loc(selected.summary)}
            </p>
            <p className="text-xs leading-relaxed text-[var(--cv-muted)]">
              {loc(selected.honestyNote)}
            </p>
          </div>
          <div className="shrink-0">
            {selected.status === 'ready' ? (
              <PillLink to="/explore-3d" variant="lapis">
                <span>{t('enterWorld')}</span>
              </PillLink>
            ) : (
              <span className="inline-block rounded-full border border-[var(--cv-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--cv-muted)]">
                {t('statusPlannedBanner')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Baghdad Concept Map */}
      <ConceptMap />

      {/* Future Planned Destinations */}
      <AcademyCard soft>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-[var(--cv-muted)]">
          <span>{t('futureDestinations')}</span>
          <span>{t('futurePlannedNote')}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FUTURE_DESTINATIONS.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center justify-between rounded-[14px] border border-[var(--cv-border)] bg-white px-4 py-3 text-sm"
            >
              <span className="font-bold text-[var(--cv-text)]">{loc(dest.name)}</span>
              <span className="cv-tabular text-xs font-semibold text-[var(--cv-muted)]">
                {loc(dest.eraLabel)}
              </span>
            </div>
          ))}
        </div>
      </AcademyCard>
    </div>
  );
}
