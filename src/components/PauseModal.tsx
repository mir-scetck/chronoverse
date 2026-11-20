import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

interface PauseModalProps {
  onResume: () => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenSettings: () => void;
  onReturnPortal: () => void;
}

export function PauseModal({
  onResume,
  onOpenMap,
  onOpenJournal,
  onOpenSettings,
  onReturnPortal,
}: PauseModalProps) {
  const { settings } = useAppStore();
  const { t } = useT(settings.language);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('pauseTitle')}
      data-testid="pause-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#071020]/85 p-4"
    >
      <div className="cv-lapis-theme w-full max-w-sm rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] p-6 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D8AE66]">{t('brand')}</p>
        <h2 className="cv-display mt-1 text-3xl font-semibold text-[#F7F1E1]">
          {t('pauseTitle')}
        </h2>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full cursor-pointer rounded-full bg-[#D8AE66] px-5 py-3 text-sm font-bold text-[#071020] hover:bg-[#E8C988]"
          >
            {t('pauseResume')}
          </button>
          <button
            type="button"
            onClick={onOpenMap}
            className="w-full cursor-pointer rounded-full border border-[#D8AE66]/35 bg-[#162B4D] px-5 py-2.5 text-sm text-[#F7F1E1] hover:border-[#D8AE66]"
          >
            {t('pauseMap')}
          </button>
          <button
            type="button"
            onClick={onOpenJournal}
            className="w-full cursor-pointer rounded-full border border-[#D8AE66]/35 bg-[#162B4D] px-5 py-2.5 text-sm text-[#F7F1E1] hover:border-[#D8AE66]"
          >
            {t('pauseJournal')}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full cursor-pointer rounded-full border border-[#D8AE66]/35 bg-[#162B4D] px-5 py-2.5 text-sm text-[#F7F1E1] hover:border-[#D8AE66]"
          >
            {t('pauseSettings')}
          </button>
          <button
            type="button"
            onClick={onReturnPortal}
            className="mt-1 w-full cursor-pointer rounded-full border border-[#3A9BA8]/40 px-5 py-2.5 text-xs font-medium text-[#C5D1DE] hover:text-white"
          >
            {t('pausePortal')}
          </button>
        </div>
      </div>
    </div>
  );
}
