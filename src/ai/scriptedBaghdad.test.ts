import { expect, test } from 'vitest';
import { normalizeArabic } from './arabicNormalizer';
import { matchScriptedResponse } from './scriptedBaghdad';
import type { ChatRequest } from '../contracts';

function makeReq(message: string, characterId = 'harun-al-rashid'): ChatRequest {
  return {
    worldId: 'baghdad',
    characterId,
    language: 'en',
    message,
    history: [],
    context: {
      currentLocationId: 'audience-hall',
      nearbyObjectIds: [],
      discoveredFactIds: [],
      watchedStoryIds: [],
    },
    includeTranslation: true,
  };
}

test('normalizeArabic strips diacritics and unifies alef, ta marbuta, and ya', () => {
  expect(normalizeArabic('أَهْلاً بِكُمْ فِي بَغْدَادَ')).toBe('اهلا بكم في بغداد');
  expect(normalizeArabic('السَّاعَةُ الْمَائِيَّةُ')).toBe('الساعه المائيه');
});

test('matchScriptedResponse refuses anachronisms in character', () => {
  const res = matchScriptedResponse(makeReq('هل تعرف الهاتف الذكي والإنترنت؟'));
  expect(res.mode).toBe('offline');
  expect(res.turn.refusal).toBe('anachronism');
  expect(/[\u0600-\u06FF]/.test(res.turn.segments[0].text)).toBe(true);
});

test('matchScriptedResponse matches embassy story and returns documented tags', () => {
  const res = matchScriptedResponse(makeReq('أخبرني عن سفارة شارلمان'));
  expect(res.turn.storyId).toBe('embassy-to-charlemagne');
  expect(res.turn.segments[0].tag).toBe('documented');
});
