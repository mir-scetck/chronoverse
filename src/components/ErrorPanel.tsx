import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
  onBackPortal: () => void;
}

export function ErrorPanel({ message, onRetry, onBackPortal }: ErrorPanelProps) {
  const { settings } = useAppStore();
  const { t } = useT(settings.language);

  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071020]/95 p-6"
    >
      <div className="cv-lapis-theme w-full max-w-md rounded-[18px] border border-[#D96B52]/65 bg-[#0C182E] p-6 text-center shadow-2xl">
        <h2 className="cv-display text-2xl font-semibold text-[#F7F1E1]">{t('errorTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#C5D1DE]">
          {message || t('errorNoWebGL')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-full bg-[#D8AE66] px-5 py-2.5 text-sm font-bold text-[#071020] hover:bg-[#E8C988]"
          >
            {t('errorRetry')}
          </button>
          <button
            type="button"
            onClick={onBackPortal}
            className="cursor-pointer rounded-full border border-[#D8AE66]/40 bg-[#162B4D] px-5 py-2.5 text-sm text-[#F7F1E1]"
          >
            {t('backToPortal')}
          </button>
        </div>
      </div>
    </div>
  );
}
