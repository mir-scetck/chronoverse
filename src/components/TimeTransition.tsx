import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

interface TimeTransitionProps {
  progress: number;
}

export function TimeTransition({ progress }: TimeTransitionProps) {
  const { settings } = useAppStore();
  const { t } = useT(settings.language);

  return (
    <div
      role="status"
      aria-live="polite"
      className="cv-lapis-theme absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0C182E] px-6 text-center"
    >
      <svg
        width="84"
        height="84"
        viewBox="0 0 84 84"
        fill="none"
        aria-hidden="true"
        className="mb-6 animate-spin"
        style={{ animationDuration: '9s' }}
      >
        <circle cx="42" cy="42" r="36" stroke="#D8AE66" strokeWidth="1.4" strokeDasharray="6 6" />
        <circle cx="42" cy="42" r="26" stroke="#3A9BA8" strokeWidth="1.2" strokeOpacity="0.75" />
        <path d="M42 6 V14 M42 70 V78 M6 42 H14 M70 42 H78" stroke="#E8C988" strokeWidth="1.6" />
      </svg>

      <p className="cv-display text-3xl font-semibold tracking-wider text-[#F7F1E1]">
        {t('transitionTitle')}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#D8AE66]">
        {t('transitionSub')}
      </p>

      <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-[#162B4D]">
        <div
          className="h-full bg-[#3A9BA8] transition-all duration-200"
          style={{ width: `${Math.max(12, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}
