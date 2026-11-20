import { useCallback } from 'react';
import { en, type TranslationKeys } from './en';
import { ar } from './ar';
import type { LocalizedText } from '../contracts';

export type Language = 'en' | 'ar';

export function translate(lang: Language, key: TranslationKeys): string {
  return lang === 'ar' ? ar[key] : en[key];
}

export function pickLocalized(lang: Language, text: LocalizedText): string {
  return lang === 'ar' ? text.ar : text.en;
}

export function useT(lang: Language) {
  const t = useCallback((key: TranslationKeys) => translate(lang, key), [lang]);
  const loc = useCallback((text: LocalizedText) => pickLocalized(lang, text), [lang]);
  return { t, loc, isRtl: lang === 'ar' };
}
