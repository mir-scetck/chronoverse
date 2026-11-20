import { ArrowRight, CheckCircle2, Compass, Footprints } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BAGHDAD_DISTRICTS } from '../../data/baghdad/districts';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import type { AcademyDistrict } from '../../types';
import { AccuracyBadge } from '../ui/AccuracyBadge';

interface InteractiveDistrictMapProps {
  onWalkIn3d?: (districtId: string) => void;
}

export function InteractiveDistrictMap({ onWalkIn3d }: InteractiveDistrictMapProps) {
  const language = useAcademyStore((s) => s.language);
  const visitedIds = useAcademyStore((s) => s.visitedDistrictIds);
  const passedQuizIds = useAcademyStore((s) => s.passedQuizDistrictIds);
  const { t, loc } = useT(language);
  const [selected, setSelected] = useState<AcademyDistrict>(BAGHDAD_DISTRICTS[0]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Round City Interactive SVG Map */}
      <div className="cv-card lg:col-span-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
            {t('mapTitle')}
          </h3>
          <span className="cv-tabular rounded-full bg-[var(--cv-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--cv-primary)]">
            {visitedIds.length}/{BAGHDAD_DISTRICTS.length} {t('mapDiscovered')}
          </span>
        </div>

        <div
          dir="ltr"
          className="overflow-hidden rounded-[14px] border border-[var(--cv-border)] bg-[#EFE4CC] p-2"
        >
          <svg viewBox="0 0 600 400" className="h-auto w-full" role="img" aria-label={t('mapTitle')}>
            <defs>
              <radialGradient id="roundCityGlow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#FFF8EA" />
                <stop offset="100%" stopColor="#E6D2AB" />
              </radialGradient>
            </defs>
            <rect width="600" height="400" fill="url(#roundCityGlow)" />

            {/* Tigris & Canal bands */}
            <path
              d="M 520 0 Q 545 140 505 260 T 535 400"
              fill="none"
              stroke="#3A9BA8"
              strokeWidth="22"
              strokeOpacity="0.35"
            />
            <path
              d="M 100 320 Q 250 280 512 220"
              fill="none"
              stroke="#3A9BA8"
              strokeWidth="6"
              strokeOpacity="0.45"
              strokeDasharray="4 4"
            />

            {/* Concentric Round City Rings */}
            <circle cx="300" cy="192" r="152" fill="none" stroke="#8C6239" strokeWidth="3" />
            <circle
              cx="300"
              cy="192"
              r="128"
              fill="none"
              stroke="#8C6239"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <circle cx="300" cy="192" r="68" fill="#D8AE66" fillOpacity="0.18" stroke="#8C6239" strokeWidth="2" />

            {/* Four Axes */}
            <line x1="300" y1="36" x2="300" y2="350" stroke="#8C6239" strokeWidth="1.2" strokeOpacity="0.45" />
            <line x1="145" y1="192" x2="455" y2="192" stroke="#8C6239" strokeWidth="1.2" strokeOpacity="0.45" />

            {/* District Pins */}
            {BAGHDAD_DISTRICTS.map((d, idx) => {
              const cx = (d.mapCoords.x / 100) * 600;
              const cy = (d.mapCoords.y / 100) * 400;
              const isSelected = selected.id === d.id;
              const isVisited = visitedIds.includes(d.id);

              return (
                <g key={d.id}>
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={loc(d.name)}
                    data-testid={`district-map-pin-${d.id}`}
                    onClick={() => setSelected(d)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(d);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={24}
                        fill="#2B6CB0"
                        fillOpacity="0.22"
                        stroke="#2B6CB0"
                        strokeWidth="2"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={16}
                      fill={isSelected ? '#2B6CB0' : isVisited ? '#2F855A' : '#0C182E'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                    <text
                      x={cx}
                      y={cy + 4}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#FFFFFF"
                    >
                      {idx + 1}
                    </text>
                    <text
                      x={cx}
                      y={cy + 30}
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight="700"
                      fill="#1E293B"
                      stroke="#FFF8EA"
                      strokeWidth="3.5"
                      paintOrder="stroke"
                    >
                      {loc(d.name)}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected District Detail Card */}
      <div className="cv-card flex flex-col justify-between gap-4 lg:col-span-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--cv-primary)]">
              <Compass className="h-4 w-4" />
              {loc(selected.eraNote)}
            </span>
            <AccuracyBadge kind={selected.accuracy} />
          </div>

          <h3 className="cv-heading text-2xl font-bold text-[var(--cv-text)]">
            {loc(selected.name)}
          </h3>
          <p className="text-sm leading-relaxed text-[var(--cv-muted)]">
            {loc(selected.summary)}
          </p>

          <ul className="space-y-2 rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-4">
            {selected.learningGoals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--cv-text)]">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--cv-accent-sage)]" />
                <span>{loc(goal)}</span>
              </li>
            ))}
          </ul>

          {passedQuizIds.includes(selected.id) && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cv-accent-sage)] px-3 py-1 text-xs font-semibold text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t('quizComplete')}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--cv-border)] pt-4">
          <Link
            to={`/districts/${selected.id}`}
            data-testid={`open-district-lesson-${selected.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--cv-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--cv-primary-hover)]"
          >
            <span>{t('mapOpenLesson')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {onWalkIn3d && (
            <button
              type="button"
              onClick={() => onWalkIn3d(selected.id)}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--cv-text)] hover:border-[var(--cv-primary)]"
            >
              <Footprints className="h-4 w-4 text-[var(--cv-accent-honey)]" />
              <span>{t('mapConfirmAction')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
