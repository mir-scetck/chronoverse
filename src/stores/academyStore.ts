import { create } from 'zustand';
import type { Language } from '../i18n/useT';
import type { KwlData } from '../types';

const ACADEMY_STORAGE_KEY = 'chronoverse:academy:v1';

interface PersistedAcademyState {
  language: Language;
  qamarVisible: boolean;
  studyAudioEnabled: boolean;
  visitedDistrictIds: string[];
  inspectedArtifactIds: string[];
  watchedVideoIds: string[];
  passedQuizDistrictIds: string[];
  kwl: KwlData;
}

const DEFAULT_PERSISTED: PersistedAcademyState = {
  language: 'en',
  qamarVisible: true,
  studyAudioEnabled: false, // Muted by default on webpage
  visitedDistrictIds: [],
  inspectedArtifactIds: [],
  watchedVideoIds: [],
  passedQuizDistrictIds: [],
  kwl: {
    know: '',
    wantToKnow: '',
    learned: '',
    updatedAt: 0,
  },
};

function readPersisted(): PersistedAcademyState {
  try {
    const raw = localStorage.getItem(ACADEMY_STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedAcademyState>;
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      kwl: { ...DEFAULT_PERSISTED.kwl, ...(parsed.kwl ?? {}) },
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

function writePersisted(state: PersistedAcademyState): void {
  try {
    localStorage.setItem(ACADEMY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

function applyHtmlLocale(lang: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export interface AcademyStoreState extends PersistedAcademyState {
  activeTrackLabel: string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setQamarVisible: (visible: boolean) => void;
  setStudyAudioEnabled: (enabled: boolean) => void;
  setActiveTrackLabel: (label: string) => void;
  markDistrictVisited: (districtId: string) => void;
  markArtifactInspected: (artifactId: string) => void;
  markVideoWatched: (videoId: string) => void;
  markQuizPassed: (districtId: string) => void;
  updateKwl: (patch: Partial<KwlData>) => void;
  resetAcademyProgress: () => void;
}

const initial = readPersisted();
applyHtmlLocale(initial.language);

export const useAcademyStore = create<AcademyStoreState>((set, get) => ({
  ...initial,
  activeTrackLabel: 'Baghdad Golden Gate',

  setLanguage: (language) => {
    applyHtmlLocale(language);
    set((s) => {
      const next: PersistedAcademyState = {
        language,
        qamarVisible: s.qamarVisible,
        studyAudioEnabled: s.studyAudioEnabled,
        visitedDistrictIds: s.visitedDistrictIds,
        inspectedArtifactIds: s.inspectedArtifactIds,
        watchedVideoIds: s.watchedVideoIds,
        passedQuizDistrictIds: s.passedQuizDistrictIds,
        kwl: s.kwl,
      };
      writePersisted(next);
      return { language };
    });
  },

  toggleLanguage: () => {
    const next = get().language === 'en' ? 'ar' : 'en';
    get().setLanguage(next);
  },

  setQamarVisible: (qamarVisible) =>
    set((s) => {
      writePersisted({ ...s, qamarVisible });
      return { qamarVisible };
    }),

  setStudyAudioEnabled: (studyAudioEnabled) =>
    set((s) => {
      writePersisted({ ...s, studyAudioEnabled });
      return { studyAudioEnabled };
    }),

  setActiveTrackLabel: (activeTrackLabel) => set({ activeTrackLabel }),

  markDistrictVisited: (districtId) =>
    set((s) => {
      if (s.visitedDistrictIds.includes(districtId)) return s;
      const visitedDistrictIds = [...s.visitedDistrictIds, districtId];
      writePersisted({ ...s, visitedDistrictIds });
      return { visitedDistrictIds };
    }),

  markArtifactInspected: (artifactId) =>
    set((s) => {
      if (s.inspectedArtifactIds.includes(artifactId)) return s;
      const inspectedArtifactIds = [...s.inspectedArtifactIds, artifactId];
      writePersisted({ ...s, inspectedArtifactIds });
      return { inspectedArtifactIds };
    }),

  markVideoWatched: (videoId) =>
    set((s) => {
      if (s.watchedVideoIds.includes(videoId)) return s;
      const watchedVideoIds = [...s.watchedVideoIds, videoId];
      writePersisted({ ...s, watchedVideoIds });
      return { watchedVideoIds };
    }),

  markQuizPassed: (districtId) =>
    set((s) => {
      if (s.passedQuizDistrictIds.includes(districtId)) return s;
      const passedQuizDistrictIds = [...s.passedQuizDistrictIds, districtId];
      writePersisted({ ...s, passedQuizDistrictIds });
      return { passedQuizDistrictIds };
    }),

  updateKwl: (patch) =>
    set((s) => {
      const kwl: KwlData = { ...s.kwl, ...patch, updatedAt: Date.now() };
      writePersisted({ ...s, kwl });
      return { kwl };
    }),

  resetAcademyProgress: () => {
    const lang = get().language;
    const fresh: PersistedAcademyState = {
      ...DEFAULT_PERSISTED,
      language: lang,
    };
    writePersisted(fresh);
    set(fresh);
  },
}));
