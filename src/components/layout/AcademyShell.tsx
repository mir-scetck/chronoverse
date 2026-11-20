import {
  BookOpen,
  Clock,
  Compass,
  Film,
  Gamepad2,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BAGHDAD_WORLD } from '../../data/worlds/baghdad';
import { websiteStudyAudio } from '../../engine/audio/websiteAudio';
import { useT } from '../../i18n/useT';
import { useAcademyStore } from '../../stores/academyStore';
import { useAppStore } from '../../stores/appStore';
import { calculateSealProgress } from '../../utils/progress';
import { QamarMascot } from '../mascot/QamarMascot';

interface AcademyShellProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
}

export function AcademyShell({ children, onOpenSettings }: AcademyShellProps) {
  const language = useAcademyStore((s) => s.language);
  const toggleLanguage = useAcademyStore((s) => s.toggleLanguage);
  const studyAudioEnabled = useAcademyStore((s) => s.studyAudioEnabled);
  const setStudyAudioEnabled = useAcademyStore((s) => s.setStudyAudioEnabled);
  const { getWorldProgress } = useAppStore();
  const { t } = useT(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const wp = getWorldProgress(BAGHDAD_WORLD.id);
  const seal = calculateSealProgress(BAGHDAD_WORLD, wp);

  useEffect(() => {
    websiteStudyAudio.setEnabled(studyAudioEnabled);
  }, [studyAudioEnabled]);

  const navItems = [
    { to: '/', label: t('navHome'), Icon: Compass, end: true },
    { to: '/timeline', label: t('navTimeline'), Icon: Clock },
    { to: '/districts/golden-gate-approach', label: t('navDistricts'), Icon: MapPin },
    { to: '/artifacts', label: t('navArtifacts'), Icon: Microscope },
    { to: '/videos', label: t('navVideos'), Icon: Film },
    { to: '/people', label: t('navPeople'), Icon: MessageCircle },
    { to: '/journal', label: t('navJournal'), Icon: BookOpen },
    { to: '/explore-3d', label: t('navExplore3d'), Icon: Gamepad2 },
  ];

  const handleToggleStudyAudio = () => {
    const next = !studyAudioEnabled;
    setStudyAudioEnabled(next);
    websiteStudyAudio.setEnabled(next);
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--cv-bg)] text-[var(--cv-text)] flex flex-col">
      {/* Warm Storybook Academy Header */}
      <header className="cv-no-print sticky top-0 z-30 border-b border-[var(--cv-border)] bg-[var(--cv-surface)]/96 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex shrink-0 items-center gap-2.5 text-start"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#E69F3E] bg-[#0C182E] text-[#E8C988]">
              <Compass className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="shrink-0">
              <span className="cv-heading block whitespace-nowrap text-sm font-extrabold tracking-tight text-[var(--cv-text)] sm:text-base">
                {t('academyTitle')}
              </span>
              <span className="hidden whitespace-nowrap text-[11px] font-medium text-[var(--cv-muted)] xl:block">
                {language === 'ar' ? 'بغداد · قرابة ٨٠٠ م' : 'Baghdad c. 800 CE'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          >
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors xl:gap-1.5 xl:px-3 xl:text-xs ${
                    isActive
                      ? 'bg-[var(--cv-primary)] text-white'
                      : 'text-[var(--cv-muted)] hover:bg-[var(--cv-surface-soft)] hover:text-[var(--cv-text)]'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Utility Controls */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              data-testid="study-audio-toggle"
              onClick={handleToggleStudyAudio}
              aria-pressed={studyAudioEnabled}
              title={studyAudioEnabled ? t('navMute') : t('navUnmute')}
              className={`inline-flex cursor-pointer whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                studyAudioEnabled
                  ? 'border-[var(--cv-accent-sage)] bg-[#E9F6EF] text-[#1F6140]'
                  : 'border-[var(--cv-border)] bg-[var(--cv-surface)] text-[var(--cv-muted)] hover:text-[var(--cv-text)]'
              }`}
            >
              {studyAudioEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
              <span className="hidden 2xl:inline">{t('navUnmute')}</span>
            </button>

            <Link
              to="/journal"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface-soft)] px-2.5 py-1.5 text-xs font-bold text-[var(--cv-primary)] sm:inline-flex"
              title={t('journalSealTitle')}
            >
              <span className="cv-tabular" dir="ltr">
                {seal.completed}/{seal.total}
              </span>
            </Link>

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label={t('navSettings')}
              data-testid="header-settings-btn"
              className="cursor-pointer rounded-full border border-[var(--cv-border)] p-1.5 text-[var(--cv-muted)] hover:bg-[var(--cv-surface-soft)] hover:text-[var(--cv-text)]"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              data-testid="lang-toggle-btn"
              onClick={toggleLanguage}
              className="cursor-pointer rounded-full border border-[var(--cv-primary)]/40 bg-[var(--cv-surface-soft)] px-3 py-1.5 text-xs font-bold text-[var(--cv-primary)] hover:bg-[var(--cv-primary)] hover:text-white"
            >
              {language === 'en' ? 'العربية' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              className="cursor-pointer rounded-full border border-[var(--cv-border)] p-1.5 text-[var(--cv-text)] lg:hidden"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            className="border-t border-[var(--cv-border)] bg-[var(--cv-surface)] px-4 py-3 lg:hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                      isActive
                        ? 'bg-[var(--cv-primary)] text-white'
                        : 'bg-[var(--cv-surface-soft)] text-[var(--cv-text)]'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
        <div className="mt-8">
          <QamarMascot />
        </div>
      </main>

      {/* Footer */}
      <footer className="cv-no-print border-t border-[var(--cv-border)] bg-[var(--cv-surface)] px-4 py-6 text-xs text-[var(--cv-muted)] sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>{t('footerTagline')}</p>
          <p className="cv-arabic text-sm font-semibold text-[var(--cv-primary)]">
            مدينة السلام · قرابة عام ٨٠٠ للميلاد
          </p>
        </div>
      </footer>
    </div>
  );
}
