import { Volume2, Square, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FactTag, InteractiveObject } from '../contracts';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';
import { voiceService } from '../voice/VoiceService';

interface ObjectCardModalProps {
  object: InteractiveObject;
  onClose: () => void;
}

function renderRelicEmblem(prefab: string) {
  switch (prefab) {
    case 'astrolabe':
      return (
        <svg viewBox="0 0 80 80" className="h-14 w-14 text-[#D8AE66]" fill="none" aria-hidden="true">
          <circle cx="40" cy="44" r="24" stroke="currentColor" strokeWidth="2" />
          <circle cx="40" cy="44" r="15" stroke="#3A9BA8" strokeWidth="1.4" strokeDasharray="3 3" />
          <line x1="20" y1="30" x2="60" y2="58" stroke="#E8C988" strokeWidth="2" />
          <circle cx="40" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'dinar':
      return (
        <svg viewBox="0 0 80 80" className="h-14 w-14 text-[#E8C988]" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="1" />
          <path d="M29 40 H51 M40 31 V49" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 80 80" className="h-14 w-14 text-[#D8AE66]" fill="none" aria-hidden="true">
          <rect x="20" y="18" width="40" height="44" rx="4" stroke="currentColor" strokeWidth="2" />
          <path d="M28 30 H52 M28 40 H52 M28 50 H44" stroke="#3A9BA8" strokeWidth="1.6" />
        </svg>
      );
  }
}

export function ObjectCardModal({ object, onClose }: ObjectCardModalProps) {
  const { settings } = useAppStore();
  const { t, loc } = useT(settings.language);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      voiceService.stopSpeaking();
    };
  }, [onClose]);

  const tagLabels: Record<FactTag, string> = {
    documented: t('tagDocumented'),
    traditional: t('tagTraditional'),
    dramatized: t('tagDramatized'),
    uncertain: t('tagUncertain'),
  };

  const handleToggleNarration = async () => {
    if (speaking) {
      voiceService.stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    voiceService.setPreferences({
      preferredVoiceUri: settings.preferredVoiceUri,
      volume: settings.voiceVolume,
      muted: settings.muted,
    });
    await voiceService.speak(
      loc(object.description),
      {
        lang: settings.language === 'ar' ? 'ar-SA' : 'en-US',
        gender: 'male',
        pitch: 1.0,
        rate: 0.96,
        pauseMs: 200,
        preferredVoiceNames: [],
      },
      `card:${object.id}`,
    );
    setSpeaking(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={loc(object.name)}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#071020]/82 p-4"
    >
      <div className="cv-lapis-theme w-full max-w-lg rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#D8AE66]/40 bg-[#162B4D]">
              {renderRelicEmblem(object.prefab)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#3A9BA8]">
                {tagLabels[object.factTag]}
              </span>
              <h2 className="cv-display mt-0.5 text-2xl font-semibold text-[#F7F1E1]">
                {loc(object.name)}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('cardClose')}
            className="cursor-pointer rounded-full p-1.5 text-[#C5D1DE] hover:bg-[#162B4D] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-[#F7F1E1] sm:text-base">
          {loc(object.description)}
        </p>

        {object.glossaryTerm && (
          <div className="mt-4 rounded-[12px] border border-[#3A9BA8]/35 bg-[#162B4D] p-3.5">
            <p className="text-xs font-bold text-[#E8C988]">
              {loc(object.glossaryTerm.term)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#C5D1DE]">
              {loc(object.glossaryTerm.definition)}
            </p>
          </div>
        )}

        <p className="mt-4 border-t border-[#D8AE66]/20 pt-3 text-xs text-[#C5D1DE]">
          <strong className="font-semibold text-[#E8C988]">{t('cardSource')}: </strong>
          {object.sourceNote}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggleNarration}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#3A9BA8]/60 bg-[#162B4D] px-4 py-2 text-xs font-semibold text-[#F7F1E1] hover:border-[#3A9BA8]"
          >
            {speaking ? (
              <>
                <Square className="h-3.5 w-3.5 text-[#D8AE66]" />
                <span>{t('cardStopNarrate')}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#3A9BA8]" />
                <span>{t('cardNarrate')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="object-card-close"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#D8AE66] px-5 py-2 text-xs font-bold text-[#071020] hover:bg-[#E8C988]"
          >
            {t('cardClose')}
          </button>
        </div>
      </div>
    </div>
  );
}
