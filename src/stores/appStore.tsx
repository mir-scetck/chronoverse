import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { QualityTier, TimeOfDayVariant, WorldId } from '../contracts';
import type { Language } from '../i18n/useT';
import { useAcademyStore } from './academyStore';
import {
  createEmptyWorldProgress,
  type AllProgressState,
  type WorldProgressData,
} from '../utils/progress';

const STORAGE_SETTINGS_KEY = 'chronoverse:v1:settings';
const STORAGE_PROGRESS_KEY = 'chronoverse:v1:progress';

export interface AppSettings {
  language: Language;
  textSize: 'normal' | 'large';
  subtitles: boolean;
  includeTranslation: boolean;
  musicVolume: number;
  environmentVolume: number;
  voiceVolume: number;
  peopleVolume: number;
  muted: boolean;
  preferredVoiceUri: string;
  speechRecognitionLang: 'ar-EG' | 'ar-SA' | 'en-US';
  mouseSensitivity: number;
  invertY: boolean;
  headBob: boolean;
  reducedMotion: boolean;
  timeOfDay: TimeOfDayVariant;
  quality: QualityTier;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  textSize: 'normal',
  subtitles: true,
  includeTranslation: true,
  musicVolume: 0.55,
  environmentVolume: 0.7,
  voiceVolume: 0.9,
  peopleVolume: 0.65,
  muted: false,
  preferredVoiceUri: '',
  speechRecognitionLang: 'ar-EG',
  mouseSensitivity: 1.0,
  invertY: false,
  headBob: true,
  reducedMotion: false,
  timeOfDay: 'day',
  quality: 'auto',
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function createInitialProgress(): AllProgressState {
  return {
    baghdad: createEmptyWorldProgress(),
    samarkand: createEmptyWorldProgress(),
    granada: createEmptyWorldProgress(),
    kingston: createEmptyWorldProgress(),
  };
}

function loadProgress(): AllProgressState {
  const base = createInitialProgress();
  try {
    const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AllProgressState>;
    return {
      baghdad: { ...base.baghdad, ...parsed.baghdad },
      samarkand: { ...base.samarkand, ...parsed.samarkand },
      granada: { ...base.granada, ...parsed.granada },
      kingston: { ...base.kingston, ...parsed.kingston },
    };
  } catch {
    return base;
  }
}

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  progress: AllProgressState;
  getWorldProgress: (worldId: WorldId) => WorldProgressData;
  discoverLocation: (worldId: WorldId, locationId: string) => void;
  inspectObject: (
    worldId: WorldId,
    objectId: string,
    glossary?: { termEn: string; termAr: string; defEn: string; defAr: string },
  ) => void;
  recordDialogueTurn: (
    worldId: WorldId,
    opts: {
      isPrimaryCharacter: boolean;
      characterName: string;
      question: string;
      reply: string;
      facts: Array<{ id: string; text: string; source: string }>;
    },
  ) => void;
  watchStory: (worldId: WorldId, storyId: string) => void;
  resetWorldProgress: (worldId: WorldId) => void;
  exportProgressJson: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const academyLang = useAcademyStore((s) => s.language);
  const setAcademyLang = useAcademyStore((s) => s.setLanguage);

  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...loadSettings(),
    language: academyLang,
  }));
  const [progress, setProgress] = useState<AllProgressState>(loadProgress);

  useEffect(() => {
    setSettings((prev) => (prev.language === academyLang ? prev : { ...prev, language: academyLang }));
  }, [academyLang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage quota errors
    }

    const html = document.documentElement;
    html.lang = settings.language;
    html.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    html.style.fontSize = settings.textSize === 'large' ? '18px' : '16px';
    if (settings.reducedMotion) {
      html.classList.add('cv-reduced-motion');
    } else {
      html.classList.remove('cv-reduced-motion');
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      if (patch.language && patch.language !== useAcademyStore.getState().language) {
        setAcademyLang(patch.language);
      }
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    [setAcademyLang],
  );

  const getWorldProgress = useCallback(
    (worldId: WorldId) => progress[worldId] ?? createEmptyWorldProgress(),
    [progress],
  );

  const discoverLocation = useCallback((worldId: WorldId, locationId: string) => {
    setProgress((prev) => {
      const wp = prev[worldId] ?? createEmptyWorldProgress();
      if (wp.discoveredLocations.includes(locationId)) return prev;
      return {
        ...prev,
        [worldId]: {
          ...wp,
          discoveredLocations: [...wp.discoveredLocations, locationId],
        },
      };
    });
  }, []);

  const inspectObject = useCallback(
    (
      worldId: WorldId,
      objectId: string,
      glossary?: { termEn: string; termAr: string; defEn: string; defAr: string },
    ) => {
      setProgress((prev) => {
        const wp = prev[worldId] ?? createEmptyWorldProgress();
        const nextInspected = wp.inspectedObjects.includes(objectId)
          ? wp.inspectedObjects
          : [...wp.inspectedObjects, objectId];
        const nextGlossary =
          glossary && !wp.glossary.some((g) => g.id === objectId)
            ? [...wp.glossary, { id: objectId, ...glossary }]
            : wp.glossary;

        if (nextInspected === wp.inspectedObjects && nextGlossary === wp.glossary) return prev;
        return {
          ...prev,
          [worldId]: {
            ...wp,
            inspectedObjects: nextInspected,
            glossary: nextGlossary,
          },
        };
      });
    },
    [],
  );

  const recordDialogueTurn = useCallback(
    (
      worldId: WorldId,
      opts: {
        isPrimaryCharacter: boolean;
        characterName: string;
        question: string;
        reply: string;
        facts: Array<{ id: string; text: string; source: string }>;
      },
    ) => {
      setProgress((prev) => {
        const wp = prev[worldId] ?? createEmptyWorldProgress();
        const existingIds = new Set(wp.discoveredFacts.map((f) => f.id));
        const addedFacts = opts.facts.filter((f) => !existingIds.has(f.id));
        const nextSnippets = [
          ...wp.conversationSnippets,
          {
            characterName: opts.characterName,
            question: opts.question,
            reply: opts.reply,
            timestamp: Date.now(),
          },
        ].slice(-30);

        return {
          ...prev,
          [worldId]: {
            ...wp,
            primaryDialogueTurns: wp.primaryDialogueTurns + (opts.isPrimaryCharacter ? 1 : 0),
            discoveredFacts: [...wp.discoveredFacts, ...addedFacts],
            conversationSnippets: nextSnippets,
          },
        };
      });
    },
    [],
  );

  const watchStory = useCallback((worldId: WorldId, storyId: string) => {
    setProgress((prev) => {
      const wp = prev[worldId] ?? createEmptyWorldProgress();
      if (wp.watchedStories.includes(storyId)) return prev;
      return {
        ...prev,
        [worldId]: {
          ...wp,
          watchedStories: [...wp.watchedStories, storyId],
        },
      };
    });
  }, []);

  const resetWorldProgress = useCallback((worldId: WorldId) => {
    setProgress((prev) => ({
      ...prev,
      [worldId]: createEmptyWorldProgress(),
    }));
  }, []);

  const exportProgressJson = useCallback(
    () => JSON.stringify({ exportedAt: new Date().toISOString(), progress }, null, 2),
    [progress],
  );

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        progress,
        getWorldProgress,
        discoverLocation,
        inspectObject,
        recordDialogueTurn,
        watchStory,
        resetWorldProgress,
        exportProgressJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider');
  return ctx;
}
