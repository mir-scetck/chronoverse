import { Volume2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { QualityTier } from '../contracts';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';
import { voiceService } from '../voice/VoiceService';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useAppStore();
  const { t } = useT(settings.language);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    void voiceService.waitForVoices().then((v) => setVoices(v));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const arabicVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
  const displayVoices = arabicVoices.length > 0 ? arabicVoices : voices;

  const handleTestVoice = () => {
    voiceService.setPreferences({
      preferredVoiceUri: settings.preferredVoiceUri,
      volume: settings.voiceVolume,
      muted: settings.muted,
    });
    void voiceService.speak(
      'أهلاً بك في مدينة السلام، بغداد.',
      {
        lang: 'ar-SA',
        gender: 'male',
        pitch: 0.92,
        rate: 0.92,
        pauseMs: 250,
        preferredVoiceNames: [],
      },
      'settings-test',
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('settingsTitle')}
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071020]/88 p-4"
    >
      <div className="cv-lapis-theme flex max-h-[88vh] w-full max-w-xl flex-col rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] p-6 text-[#F7F1E1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D8AE66]/25 pb-3">
          <h2 className="cv-display text-2xl font-semibold text-[#F7F1E1]">
            {t('settingsTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('cardClose')}
            className="cursor-pointer rounded-full p-1.5 text-[#C5D1DE] hover:bg-[#162B4D] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-5 overflow-y-auto pe-1 cv-scroll text-sm">
          {/* Language & RTL Switch */}
          <div className="flex items-center justify-between">
            <span>{t('settingsLanguage')}</span>
            <div className="flex gap-2">
              <button
                type="button"
                data-testid="settings-lang-en"
                onClick={() => updateSettings({ language: 'en' })}
                className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold ${
                  settings.language === 'en'
                    ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                    : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                data-testid="settings-lang-ar"
                onClick={() => updateSettings({ language: 'ar' })}
                className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold ${
                  settings.language === 'ar'
                    ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                    : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Time of Day */}
          <div className="flex items-center justify-between">
            <span>{t('settingsTimeOfDay')}</span>
            <div className="flex gap-2">
              {(['day', 'dusk'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateSettings({ timeOfDay: v })}
                  className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold ${
                    settings.timeOfDay === v
                      ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                      : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                  }`}
                >
                  {v === 'day' ? t('timeDay') : t('timeDusk')}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="flex items-center justify-between">
            <span>{t('settingsQuality')}</span>
            <div className="flex gap-2">
              {(['auto', 'high', 'low'] as QualityTier[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => updateSettings({ quality: q })}
                  className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold ${
                    settings.quality === q
                      ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                      : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                  }`}
                >
                  {q === 'auto' ? t('qualityAuto') : q === 'high' ? t('qualityHigh') : t('qualityLow')}
                </button>
              ))}
            </div>
          </div>

          {/* Text Size & Toggles */}
          <div className="flex items-center justify-between">
            <span>{t('settingsTextSize')}</span>
            <div className="flex gap-2">
              {(['normal', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => updateSettings({ textSize: sz })}
                  className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-semibold ${
                    settings.textSize === sz
                      ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                      : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                  }`}
                >
                  {sz === 'normal' ? t('textSizeNormal') : t('textSizeLarge')}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between">
            <span>{t('settingsSubtitles')}</span>
            <input
              type="checkbox"
              checked={settings.subtitles}
              onChange={(e) => updateSettings({ subtitles: e.target.checked })}
              className="accent-[#3A9BA8]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between">
            <span>{t('settingsTranslation')}</span>
            <input
              type="checkbox"
              checked={settings.includeTranslation}
              onChange={(e) => updateSettings({ includeTranslation: e.target.checked })}
              className="accent-[#3A9BA8]"
            />
          </label>

          {/* Adaptive Music & Environmental Audio */}
          <div className="space-y-3 border-t border-[#D8AE66]/20 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8AE66]">
              {t('settingsAudioSection')}
            </h3>

            {(
              [
                ['musicVolume', t('settingsMusicVol')],
                ['environmentVolume', t('settingsEnvVol')],
                ['voiceVolume', t('settingsVoiceVol')],
                ['peopleVolume', t('settingsPeopleVol')],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="flex items-center justify-between gap-4">
                <span className="w-36 text-xs text-[#C5D1DE]">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings[field]}
                  data-testid={`settings-${field}`}
                  onChange={(e) => updateSettings({ [field]: Number(e.target.value) })}
                  className="flex-1 accent-[#3A9BA8]"
                />
                <span className="cv-tabular w-10 text-end text-xs text-[#E8C988]">
                  {Math.round(settings[field] * 100)}%
                </span>
              </div>
            ))}

            {/* Arabic Voice Selector + Test */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-xs text-[#C5D1DE]">{t('settingsVoiceSelect')}</span>
              <div className="flex items-center gap-2">
                <select
                  value={settings.preferredVoiceUri}
                  onChange={(e) => updateSettings({ preferredVoiceUri: e.target.value })}
                  className="max-w-48 rounded-lg border border-[#D8AE66]/35 bg-[#162B4D] px-2.5 py-1 text-xs text-[#F7F1E1]"
                >
                  <option value="">{t('settingsVoiceDefault')}</option>
                  {displayVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="flex cursor-pointer items-center gap-1 rounded-full border border-[#D8AE66]/60 bg-[#162B4D] px-3 py-1 text-xs font-semibold text-[#E8C988] hover:border-[#D8AE66]"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{t('settingsTestVoice')}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#C5D1DE]">{t('settingsSpeechLang')}</span>
              <select
                value={settings.speechRecognitionLang}
                onChange={(e) =>
                  updateSettings({
                    speechRecognitionLang: e.target.value as 'ar-EG' | 'ar-SA' | 'en-US',
                  })
                }
                className="rounded-lg border border-[#D8AE66]/35 bg-[#162B4D] px-2.5 py-1 text-xs text-[#F7F1E1]"
              >
                <option value="ar-EG">ar-EG</option>
                <option value="ar-SA">ar-SA</option>
                <option value="en-US">en-US</option>
              </select>
            </div>
          </div>

          {/* Camera & Comfort */}
          <div className="space-y-3 border-t border-[#D8AE66]/20 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8AE66]">
              {t('settingsControlsSection')}
            </h3>

            <div className="flex items-center justify-between gap-4">
              <span className="w-36 text-xs text-[#C5D1DE]">{t('settingsSensitivity')}</span>
              <input
                type="range"
                min={0.4}
                max={2.0}
                step={0.1}
                value={settings.mouseSensitivity}
                onChange={(e) => updateSettings({ mouseSensitivity: Number(e.target.value) })}
                className="flex-1 accent-[#3A9BA8]"
              />
              <span className="cv-tabular w-10 text-end text-xs text-[#E8C988]">
                {settings.mouseSensitivity.toFixed(1)}x
              </span>
            </div>

            <label className="flex cursor-pointer items-center justify-between text-xs text-[#C5D1DE]">
              <span>{t('settingsInvertY')}</span>
              <input
                type="checkbox"
                checked={settings.invertY}
                onChange={(e) => updateSettings({ invertY: e.target.checked })}
                className="accent-[#3A9BA8]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between text-xs text-[#C5D1DE]">
              <span>{t('settingsHeadBob')}</span>
              <input
                type="checkbox"
                checked={settings.headBob}
                onChange={(e) => updateSettings({ headBob: e.target.checked })}
                className="accent-[#3A9BA8]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between text-xs text-[#C5D1DE]">
              <span>{t('settingsReducedMotion')}</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="accent-[#3A9BA8]"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
