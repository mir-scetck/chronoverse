import { Camera, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

export type PhotoFilter = 'none' | 'warm' | 'sepia' | 'monochrome';

interface PhotoModeOverlayProps {
  filter: PhotoFilter;
  onFilterChange: (f: PhotoFilter) => void;
  onFovChange: (fov: number) => void;
  onCapture: (caption: string) => void;
  onExit: () => void;
}

export function PhotoModeOverlay({
  filter,
  onFilterChange,
  onFovChange,
  onCapture,
  onExit,
}: PhotoModeOverlayProps) {
  const { settings } = useAppStore();
  const { t } = useT(settings.language);
  const [fov, setFov] = useState(55);
  const [caption, setCaption] = useState('Baghdad · 800 CE');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  const filters: Array<[PhotoFilter, string]> = [
    ['none', t('filterNone')],
    ['warm', t('filterWarm')],
    ['sepia', t('filterSepia')],
    ['monochrome', t('filterMono')],
  ];

  return (
    <div
      data-testid="photo-mode-overlay"
      className="cv-lapis-theme pointer-events-none absolute inset-0 z-30 flex flex-col justify-between bg-transparent p-5"
    >
      <div className="flex items-center justify-between">
        <span className="pointer-events-auto rounded-full border border-[#D8AE66]/55 bg-[#0C182E]/95 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#E8C988]">
          {t('photoTitle')}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="pointer-events-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/45 bg-[#0C182E]/95 px-3.5 py-1.5 text-xs font-semibold text-[#F7F1E1] hover:border-[#D8AE66]"
        >
          <X className="h-3.5 w-3.5" />
          <span>{t('photoExit')}</span>
        </button>
      </div>

      {/* Bottom Compact Dock */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E]/96 px-5 py-3.5 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#C5D1DE]">{t('photoFov')}</span>
          <input
            type="range"
            min={30}
            max={85}
            value={fov}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFov(v);
              onFovChange(v);
            }}
            className="w-28 accent-[#3A9BA8]"
          />
          <span className="cv-tabular w-8 text-xs text-[#E8C988]">{fov}°</span>
        </div>

        <div className="flex items-center gap-1.5">
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs ${
                filter === id
                  ? 'bg-[#D8AE66] font-bold text-[#071020]'
                  : 'bg-[#162B4D] text-[#C5D1DE] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('photoStamp')}
            maxLength={48}
            className="w-36 rounded-full border border-[#D8AE66]/35 bg-[#162B4D] px-3 py-1 text-xs text-[#F7F1E1]"
          />
          <button
            type="button"
            data-testid="photo-save-btn"
            onClick={() => onCapture(caption)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#D8AE66] px-4 py-1.5 text-xs font-bold text-[#071020] hover:bg-[#E8C988]"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>{t('photoCapture')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
