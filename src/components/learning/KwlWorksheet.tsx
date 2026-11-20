import { CheckCircle2 } from 'lucide-react';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';

export function KwlWorksheet() {
  const language = useAcademyStore((s) => s.language);
  const kwl = useAcademyStore((s) => s.kwl);
  const updateKwl = useAcademyStore((s) => s.updateKwl);
  const { t } = useT(language);

  return (
    <div className="cv-card space-y-4" data-testid="kwl-worksheet">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
          {t('kwlTitle')}
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECF7F1] px-3 py-1 text-xs font-semibold text-[var(--cv-accent-sage)]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {t('kwlSaved')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[var(--cv-primary)]">{t('kwlKnow')}</span>
          <textarea
            data-testid="kwl-know"
            rows={5}
            value={kwl.know}
            onChange={(e) => updateKwl({ know: e.target.value })}
            placeholder={t('kwlKnowPlaceholder')}
            className="w-full rounded-[14px] border border-[var(--cv-border-input)] bg-[var(--cv-surface)] p-3 text-sm text-[var(--cv-text)] placeholder-[var(--cv-muted)]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#9A6008]">{t('kwlWant')}</span>
          <textarea
            data-testid="kwl-want"
            rows={5}
            value={kwl.wantToKnow}
            onChange={(e) => updateKwl({ wantToKnow: e.target.value })}
            placeholder={t('kwlWantPlaceholder')}
            className="w-full rounded-[14px] border border-[var(--cv-border-input)] bg-[var(--cv-surface)] p-3 text-sm text-[var(--cv-text)] placeholder-[var(--cv-muted)]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[var(--cv-accent-sage)]">{t('kwlLearned')}</span>
          <textarea
            data-testid="kwl-learned"
            rows={5}
            value={kwl.learned}
            onChange={(e) => updateKwl({ learned: e.target.value })}
            placeholder={t('kwlLearnedPlaceholder')}
            className="w-full rounded-[14px] border border-[var(--cv-border-input)] bg-[var(--cv-surface)] p-3 text-sm text-[var(--cv-text)] placeholder-[var(--cv-muted)]"
          />
        </label>
      </div>
    </div>
  );
}
