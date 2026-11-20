import { BookMarked, Download, Printer, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { World } from '../contracts';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';
import { calculateSealProgress } from '../utils/progress';
import { SourcesDrawer } from './learning/SourcesDrawer';

interface JournalModalProps {
  world: World;
  onClose: () => void;
}

type JournalTab = 'discoveries' | 'conversations' | 'facts' | 'glossary';

export function JournalModal({ world, onClose }: JournalModalProps) {
  const { settings, getWorldProgress, resetWorldProgress, exportProgressJson } = useAppStore();
  const { t, loc } = useT(settings.language);
  const [tab, setTab] = useState<JournalTab>('discoveries');
  const [confirmReset, setConfirmReset] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const wp = getWorldProgress(world.id);
  const seal = calculateSealProgress(world, wp);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'j' || e.key === 'J') {
        if (sourcesOpen) return;
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, sourcesOpen]);

  const handleExport = () => {
    const json = exportProgressJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronoverse-baghdad-journal.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - seal.percent / 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('journalTitle')}
      data-testid="journal-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#071020]/88 p-4"
    >
      <div className="cv-lapis-theme flex max-h-[88vh] w-full max-w-3xl flex-col rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] p-6 shadow-2xl">
        {/* Header + Seal of the Era Ring */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8AE66]/25 pb-4">
          <div className="flex items-center gap-4">
            <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
              <circle cx="42" cy="42" r={radius} fill="none" stroke="rgba(216,174,102,0.18)" strokeWidth="6" />
              <circle
                cx="42"
                cy="42"
                r={radius}
                fill="none"
                stroke="#D8AE66"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 42 42)"
              />
              <text
                x="42"
                y="46"
                textAnchor="middle"
                fill="#F7F1E1"
                fontSize="14"
                fontWeight="700"
                className="cv-tabular"
              >
                {seal.percent}%
              </text>
            </svg>
            <div>
              <h2 className="cv-display text-2xl font-semibold text-[#F7F1E1]">
                {t('journalTitle')}
              </h2>
              <p className="text-xs font-semibold text-[#D8AE66]">
                {seal.sealEarned ? t('journalSealEarned') : t('journalSealTitle')} ·{' '}
                <span className="cv-tabular text-[#3A9BA8]">
                  {seal.completed}/{seal.total}
                </span>
              </p>
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

        {/* 4 Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#D8AE66]/20 pb-3">
          {(
            [
              ['discoveries', t('journalTabDiscoveries')],
              ['conversations', t('journalTabConversations')],
              ['facts', t('journalTabFacts')],
              ['glossary', t('journalTabGlossary')],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                tab === id
                  ? 'bg-[#D8AE66] text-[#071020]'
                  : 'bg-[#162B4D] text-[#C5D1DE] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pe-1 cv-scroll">
          {tab === 'discoveries' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {world.locations.map((locItem) => {
                const found = wp.discoveredLocations.includes(locItem.id);
                return (
                  <div
                    key={locItem.id}
                    className={`rounded-[14px] border p-3.5 ${
                      found
                        ? 'border-[#D8AE66]/50 bg-[#162B4D]'
                        : 'border-[#D8AE66]/15 bg-[#071020]/60 opacity-65'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#F7F1E1]">
                      {found ? loc(locItem.name) : '???'}
                    </p>
                    <p className="mt-1 text-xs text-[#C5D1DE]">
                      {found ? loc(locItem.description) : t('mapUndiscovered')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'conversations' && (
            <div className="space-y-3">
              {wp.conversationSnippets.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#C5D1DE]">
                  {t('journalEmptyConversations')}
                </p>
              ) : (
                wp.conversationSnippets.map((item, idx) => (
                  <div key={idx} className="rounded-[14px] border border-[#D8AE66]/25 bg-[#162B4D] p-4">
                    <p className="text-xs font-bold text-[#D8AE66]">{item.characterName}</p>
                    <p className="mt-1 text-xs text-[#C5D1DE]">{item.question}</p>
                    <p className="cv-arabic mt-2 text-sm text-[#F7F1E1]">{item.reply}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'facts' && (
            <div className="space-y-2.5">
              {wp.discoveredFacts.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#C5D1DE]">
                  {t('journalEmptyFacts')}
                </p>
              ) : (
                wp.discoveredFacts.map((f) => (
                  <div key={f.id} className="rounded-[14px] border border-[#3A9BA8]/45 bg-[#162B4D] p-4">
                    <p className="text-sm text-[#F7F1E1]">{f.text}</p>
                    <p className="mt-1 text-[11px] text-[#E8C988]">{f.source}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'glossary' && (
            <div className="space-y-2.5">
              {wp.glossary.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#C5D1DE]">
                  {t('journalEmptyGlossary')}
                </p>
              ) : (
                wp.glossary.map((g) => (
                  <div key={g.id} className="rounded-[14px] border border-[#D8AE66]/25 bg-[#162B4D] p-4">
                    <p className="text-sm font-semibold text-[#E8C988]">
                      {settings.language === 'ar' ? g.termAr : g.termEn}
                    </p>
                    <p className="mt-1 text-xs text-[#C5D1DE]">
                      {settings.language === 'ar' ? g.defAr : g.defEn}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Export, Print, Sources & Reset */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#D8AE66]/25 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/45 bg-[#162B4D] px-3.5 py-2 text-xs font-semibold text-[#F7F1E1] hover:border-[#D8AE66]"
            >
              <Download className="h-3.5 w-3.5 text-[#D8AE66]" />
              <span>{t('journalExport')}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#3A9BA8]/50 bg-[#162B4D] px-3.5 py-2 text-xs font-semibold text-[#F7F1E1] hover:border-[#3A9BA8]"
            >
              <Printer className="h-3.5 w-3.5 text-[#3A9BA8]" />
              <span>{t('journalPrint')}</span>
            </button>

            <button
              type="button"
              onClick={() => setSourcesOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/35 bg-[#071020] px-3.5 py-2 text-xs font-semibold text-[#E8C988] hover:border-[#D8AE66]"
            >
              <BookMarked className="h-3.5 w-3.5" />
              <span>{t('journalSourcesBtn')}</span>
            </button>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#D96B52]">{t('journalResetConfirm')}</span>
              <button
                type="button"
                onClick={() => {
                  resetWorldProgress(world.id);
                  setConfirmReset(false);
                }}
                className="cursor-pointer rounded-full bg-[#D96B52] px-3 py-1.5 text-xs font-semibold text-white"
              >
                {t('journalConfirmReset')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="cursor-pointer rounded-full border border-[#D8AE66]/30 px-3 py-1.5 text-xs text-[#C5D1DE]"
              >
                {t('mapCancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/25 px-3.5 py-2 text-xs text-[#C5D1DE] hover:border-[#D96B52] hover:text-[#D96B52]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('journalReset')}</span>
            </button>
          )}
        </div>
      </div>

      {sourcesOpen && <SourcesDrawer onClose={() => setSourcesOpen(false)} />}
    </div>
  );
}
