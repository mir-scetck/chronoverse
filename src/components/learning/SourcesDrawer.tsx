import { ExternalLink, X } from 'lucide-react';
import { useEffect } from 'react';
import { CREDIT_LIST } from '../../data/baghdad/credits';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';

interface SourcesDrawerProps {
  onClose: () => void;
}

export function SourcesDrawer({ onClose }: SourcesDrawerProps) {
  const language = useAcademyStore((s) => s.language);
  const { t, loc } = useT(language);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('journalSourcesBtn')}
      data-testid="sources-drawer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C182E]/70 p-4"
    >
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-[18px] border border-[var(--cv-border)] bg-[var(--cv-surface)] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--cv-border)] pb-3">
          <h2 className="cv-heading text-xl font-bold text-[var(--cv-text)]">
            {t('journalSourcesBtn')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cardClose')}
            className="cursor-pointer rounded-full p-1.5 text-[var(--cv-muted)] hover:bg-[var(--cv-surface-soft)] hover:text-[var(--cv-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pe-1 cv-scroll">
          {CREDIT_LIST.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[14px] border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] p-3.5 sm:flex-row sm:items-center"
            >
              <img
                src={item.imageSrc}
                alt={loc(item.title)}
                className="h-20 w-full shrink-0 rounded-[10px] object-cover sm:w-28"
              />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-bold text-[var(--cv-text)]">{loc(item.title)}</p>
                <p className="text-xs text-[var(--cv-muted)]">
                  {item.creatorOrCollection} · {item.yearOrEra} · <strong>{item.license}</strong>
                </p>
                {item.notes && (
                  <p className="text-xs text-[var(--cv-muted)]">{loc(item.notes)}</p>
                )}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--cv-primary)] hover:underline"
                >
                  <span>Reference Archive</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
