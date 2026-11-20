import { X, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import type { HotspotPin, MediaCredit } from '../../types';
import { AccuracyBadge } from '../ui/AccuracyBadge';

interface HotspotImageProps {
  credit: MediaCredit;
  hotspots: HotspotPin[];
  onInspectPin?: (pin: HotspotPin) => void;
  className?: string;
}

export function HotspotImage({ credit, hotspots, onInspectPin, className = '' }: HotspotImageProps) {
  const language = useAcademyStore((s) => s.language);
  const { t, loc } = useT(language);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPin = hotspots.find((h) => h.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const handleSelect = (pin: HotspotPin) => {
    const next = selectedId === pin.id ? null : pin.id;
    setSelectedId(next);
    if (next) {
      onInspectPin?.(pin);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <p className="text-xs font-medium text-[var(--cv-muted)]">{t('hotspotHint')}</p>

      {/* Visual plate keeps LTR coordinate plane so xPercent/yPercent stay aligned with artwork */}
      <div
        dir="ltr"
        className="relative overflow-hidden rounded-[18px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] shadow-[var(--cv-shadow-soft)]"
      >
        <img
          src={credit.imageSrc}
          alt={loc(credit.title)}
          className="block aspect-[16/10] w-full object-cover"
        />

        {hotspots.map((pin) => {
          const active = selectedId === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              data-testid={`hotspot-pin-${pin.id}`}
              aria-label={`${pin.number}. ${loc(pin.label)}`}
              aria-expanded={active}
              onClick={() => handleSelect(pin)}
              style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold shadow-md transition-transform ${
                active
                  ? 'scale-115 border-white bg-[var(--cv-accent-honey)] text-[var(--cv-on-honey)] ring-4 ring-[var(--cv-accent-honey)]/40'
                  : 'border-white bg-[var(--cv-primary)] text-white hover:scale-110'
              }`}
            >
              {pin.number}
            </button>
          );
        })}
      </div>

      {/* Quick numbered pill selector for keyboard/mobile scanning */}
      <div className="flex flex-wrap gap-2">
        {hotspots.map((pin) => {
          const active = selectedId === pin.id;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => handleSelect(pin)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'border-[var(--cv-primary)] bg-[var(--cv-primary)] text-white'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-text)] hover:border-[var(--cv-primary)]'
              }`}
            >
              <span className="cv-tabular">{pin.number}.</span>
              <span>{loc(pin.label)}</span>
            </button>
          );
        })}
      </div>

      {/* Accessible Inspector Popover / Panel */}
      {selectedPin && (
        <div
          role="region"
          aria-label={loc(selectedPin.label)}
          data-testid="hotspot-popover"
          className="cv-card flex flex-col gap-4 border-2 border-[var(--cv-primary)]/45 sm:flex-row sm:items-start"
        >
          {/* Magnified crop preview focused on hotspot coordinates */}
          <div
            aria-hidden="true"
            className="relative h-28 w-full shrink-0 overflow-hidden rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] sm:w-40"
          >
            <img
              src={credit.imageSrc}
              alt=""
              style={{
                transformOrigin: `${selectedPin.xPercent}% ${selectedPin.yPercent}%`,
                transform: 'scale(2.1)',
              }}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-1.5 end-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--cv-text)]/85 px-2 py-0.5 text-[10px] font-semibold text-white">
              <ZoomIn className="h-3 w-3" />
              2.1x
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--cv-primary)] text-xs font-bold text-white">
                  {selectedPin.number}
                </span>
                <h4 className="cv-heading text-base font-bold text-[var(--cv-text)]">
                  {loc(selectedPin.label)}
                </h4>
                <AccuracyBadge kind={selectedPin.accuracy} />
              </div>

              <button
                type="button"
                data-testid="hotspot-close-btn"
                onClick={() => setSelectedId(null)}
                aria-label={t('cardClose')}
                className="cursor-pointer rounded-full p-1.5 text-[var(--cv-muted)] hover:bg-[var(--cv-surface-soft)] hover:text-[var(--cv-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-[var(--cv-text)]">
              {loc(selectedPin.description)}
            </p>
            <p className="text-xs text-[var(--cv-muted)]">
              <strong className="font-semibold text-[var(--cv-text)]">{t('cardSource')}: </strong>
              {selectedPin.sourceNote}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--cv-muted)]">
        {loc(credit.title)} · {credit.creatorOrCollection} ({credit.license})
      </p>
    </div>
  );
}
