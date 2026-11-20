// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { KwlWorksheet } from '../src/components/learning/KwlWorksheet';
import { HotspotImage } from '../src/components/media/HotspotImage';
import { LessonVideoPlayer } from '../src/components/media/LessonVideoPlayer';
import { BAGHDAD_ARTIFACTS } from '../src/data/baghdad/artifacts';
import { BAGHDAD_MEDIA_CREDITS } from '../src/data/baghdad/credits';
import { BAGHDAD_VIDEOS } from '../src/data/baghdad/videos';
import { useAcademyStore } from '../src/stores/academyStore';

beforeEach(() => {
  localStorage.clear();
  useAcademyStore.getState().setLanguage('en');
  useAcademyStore.getState().resetAcademyProgress();
});

afterEach(() => {
  cleanup();
});

test('HotspotImage opens popover on pin click and closes on Escape', () => {
  const art = BAGHDAD_ARTIFACTS[0];
  const credit = BAGHDAD_MEDIA_CREDITS[art.imageCreditId];

  render(<HotspotImage credit={credit} hotspots={art.hotspots} />);

  const pin = screen.getByTestId(`hotspot-pin-${art.hotspots[0].id}`);
  fireEvent.click(pin);
  expect(screen.getByTestId('hotspot-popover')).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByTestId('hotspot-popover')).not.toBeInTheDocument();
});

test('LessonVideoPlayer works in storyboard mode with play/pause, chapters, and transcript seek', () => {
  const clip = BAGHDAD_VIDEOS[0];
  render(<LessonVideoPlayer clip={clip} />);

  const playBtn = screen.getByTestId(`video-play-btn-${clip.id}`);
  expect(playBtn).toHaveTextContent('Play');
  fireEvent.click(playBtn);
  expect(playBtn).toHaveTextContent('Pause');

  const secondChapterLabel = clip.chapters[1].label.en;
  fireEvent.click(screen.getByRole('button', { name: new RegExp(secondChapterLabel) }));
  expect(screen.getByTestId('video-caption-bar')).toHaveTextContent(clip.transcript[1].text.en);
});

test('KwlWorksheet persists entries in localStorage across unmount/remount', () => {
  const { unmount } = render(<KwlWorksheet />);

  const knowBox = screen.getByTestId('kwl-know') as HTMLTextAreaElement;
  fireEvent.change(knowBox, { target: { value: 'Round City founded 762 CE' } });
  expect(knowBox.value).toBe('Round City founded 762 CE');

  unmount();
  render(<KwlWorksheet />);
  expect((screen.getByTestId('kwl-know') as HTMLTextAreaElement).value).toBe(
    'Round City founded 762 CE',
  );
});

test('AcademyStore language toggle updates html dir between ltr and rtl', () => {
  expect(document.documentElement.dir).toBe('ltr');
  useAcademyStore.getState().toggleLanguage();
  expect(document.documentElement.dir).toBe('rtl');
  expect(document.documentElement.lang).toBe('ar');
  useAcademyStore.getState().toggleLanguage();
  expect(document.documentElement.dir).toBe('ltr');
});
