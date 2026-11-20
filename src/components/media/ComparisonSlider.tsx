import { ArrowLeftRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import type { ComparisonSpec } from '../../types';

interface ComparisonSliderProps {
  spec: ComparisonSpec;
}

export function ComparisonSlider({ spec }: ComparisonSliderProps) {
  const language = useAcademyStore((s) => s.language);
  const { t, loc } = useT(language);
  const [percent, setPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.max(5, Math.min(95, Math.round(raw))));
  };

  return (
    <div className="cv-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="cv-heading text-lg font-bold text-[var(--cv-text)]">
          {loc(spec.title)}
        </h4>
        <span className="text-xs font-medium text-[var(--cv-muted)]">
          {t('sliderCompareHint')}
        </span>
      </div>

      {/* Force LTR inside image comparator so clip-path left/right stays physically matched */}
      <div
        ref={containerRef}
        dir="ltr"
        data-testid={`comparison-slider-${spec.id}`}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) updateFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)]"
      >
        {/* Right / Modern Layer */}
        <img
          src={spec.rightImageSrc}
          alt={loc(spec.rightLabel)}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Left / Baghdad 800 CE Layer */}
        <div
          style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
          className="absolute inset-0"
        >
          <img
            src={spec.leftImageSrc}
            alt={loc(spec.leftLabel)}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 rounded-full bg-[var(--cv-lapis)]/90 px-3 py-1 text-xs font-semibold text-[var(--cv-sandstone-bright)]">
          {loc(spec.leftLabel)}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-[var(--cv-primary)]/92 px-3 py-1 text-xs font-semibold text-white">
          {loc(spec.rightLabel)}
        </span>

        {/* Divider Handle */}
        <div
          style={{ left: `${percent}%` }}
          className="pointer-events-none absolute inset-y-0 -translate-x-1/2 flex items-center"
        >
          <div className="h-full w-0.5 bg-white shadow" />
          <div className="absolute left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--cv-primary)] bg-white text-[var(--cv-primary)] shadow-lg">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Accessible keyboard & touch scrub slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[var(--cv-text)]">
          {loc(spec.leftLabel)}
        </span>
        <input
          type="range"
          min={5}
          max={95}
          value={percent}
          aria-label={loc(spec.title)}
          onChange={(e) => setPercent(Number(e.target.value))}
          className="flex-1 accent-[var(--cv-primary)]"
        />
        <span className="text-xs font-semibold text-[var(--cv-primary)]">
          {loc(spec.rightLabel)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5">
          <p className="text-xs font-bold text-[var(--cv-text)]">{loc(spec.leftLabel)}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--cv-muted)]">
            {loc(spec.leftDescription)}
          </p>
        </div>
        <div className="rounded-[12px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5">
          <p className="text-xs font-bold text-[var(--cv-primary)]">{loc(spec.rightLabel)}</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--cv-muted)]">
            {loc(spec.rightDescription)}
          </p>
        </div>
      </div>
    </div>
  );
}
