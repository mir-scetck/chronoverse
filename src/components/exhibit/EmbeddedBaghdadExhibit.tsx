import {
  Compass,
  Maximize2,
  Minimize2,
  Moon,
  Play,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Character,
  FocusPayload,
  InteractiveObject,
  LocalizedText,
  Location,
  QualityTier,
  StoryScene,
  VideoClip,
} from '../../contracts';
import { BAGHDAD_VIDEOS } from '../../data/baghdad/videos';
import { BAGHDAD_WORLD } from '../../data/worlds/baghdad';
import { createWorldRenderer } from '../../engine';
import { websiteStudyAudio } from '../../engine/audio/websiteAudio';
import { useT } from '../../i18n/useT';
import { eventBus } from '../../services/eventBus';
import { useAcademyStore } from '../../stores/academyStore';
import { useAppStore } from '../../stores/appStore';
import { DialogueDrawer } from '../DialogueDrawer';
import { ErrorPanel } from '../ErrorPanel';
import { ExplorationHud } from '../ExplorationHud';
import { JournalModal } from '../JournalModal';
import { MapModal } from '../MapModal';
import { ObjectCardModal } from '../ObjectCardModal';
import { PauseModal } from '../PauseModal';
import { PhotoModeOverlay, type PhotoFilter } from '../PhotoModeOverlay';
import { SettingsModal } from '../SettingsModal';
import { StoryPlayerOverlay } from '../StoryPlayerOverlay';
import { TimeTransition } from '../TimeTransition';
import { VideoModalPlayer } from '../media/VideoModalPlayer';

type ActiveModal = null | 'map' | 'journal' | 'settings' | 'pause';

interface EmbeddedBaghdadExhibitProps {
  initialLocationId?: string | null;
  autoStart?: boolean;
  fullViewport?: boolean;
}

export function EmbeddedBaghdadExhibit({
  initialLocationId = null,
  autoStart = false,
  fullViewport = false,
}: EmbeddedBaghdadExhibitProps) {
  const { settings, updateSettings, discoverLocation, inspectObject, watchStory } = useAppStore();
  const markDistrictVisited = useAcademyStore((s) => s.markDistrictVisited);
  const markArtifactInspected = useAcademyStore((s) => s.markArtifactInspected);
  const { t, loc } = useT(settings.language);

  const [gameActive, setGameActive] = useState<boolean>(autoStart);
  const [fullscreen3d, setFullscreen3d] = useState<boolean>(fullViewport);
  const [pendingTeleportLoc, setPendingTeleportLoc] = useState<string | null>(initialLocationId);

  const [worldReady, setWorldReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(15);
  const [worldError, setWorldError] = useState<string | null>(null);

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [playerPose, setPlayerPose] = useState({ x: 0, z: 68, yaw: 0 });
  const [focusTarget, setFocusTarget] = useState<FocusPayload | null>(null);
  const [soundCaption, setSoundCaption] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [inspectedObj, setInspectedObj] = useState<InteractiveObject | null>(null);
  const [dialogueChar, setDialogueChar] = useState<Character | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ clip: VideoClip; storyId?: string } | null>(null);
  const [photoMode, setPhotoMode] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('none');

  const [activeStory, setActiveStory] = useState<StoryScene | null>(null);
  const [storySubtitle, setStorySubtitle] = useState<LocalizedText | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyReturnCharRef = useRef<Character | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<ReturnType<typeof createWorldRenderer> | null>(null);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const world = BAGHDAD_WORLD;
  const primaryChar = world.characters.find((c) => c.id === world.primaryCharacterId);
  const qualities: QualityTier[] = ['auto', 'high', 'low'];

  useEffect(() => {
    if (initialLocationId) {
      if (gameActive && worldReady && rendererRef.current) {
        rendererRef.current.teleportTo(initialLocationId);
      } else {
        setPendingTeleportLoc(initialLocationId);
      }
    }
  }, [initialLocationId, gameActive, worldReady]);

  useEffect(() => {
    if (worldError) {
      document.body.dataset.state = 'error';
    } else if (!gameActive) {
      document.body.dataset.state = 'portal';
    } else if (activeModal === 'pause') {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [gameActive, activeModal, worldError]);

  const showCaptionForLocation = useCallback(
    (locationId: string) => {
      const cap = world.soundscape.captionByLocation[locationId];
      if (!cap) return;
      setSoundCaption(loc(cap));
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
      captionTimerRef.current = setTimeout(() => {
        setSoundCaption(null);
      }, 4200);
    },
    [loc, world.soundscape.captionByLocation],
  );

  // Mount & unmount 3D renderer when gameActive flips
  useEffect(() => {
    if (!gameActive) {
      websiteStudyAudio.setThreeActive(false);
      if (rendererRef.current) {
        rendererRef.current.unmount();
        rendererRef.current = null;
      }
      setWorldReady(false);
      setCurrentLocation(null);
      setFocusTarget(null);
      setDialogueChar(null);
      setInspectedObj(null);
      setActiveVideo(null);
      setActiveStory(null);
      setPhotoMode(false);
      return;
    }

    const container = stageRef.current;
    if (!container) return;

    websiteStudyAudio.setThreeActive(true);
    const renderer = createWorldRenderer();
    rendererRef.current = renderer;
    setWorldError(null);
    setWorldReady(false);
    setLoadProgress(15);

    const unsubs = [
      eventBus.on('world:progress', ({ progress }) => {
        setLoadProgress(progress);
      }),
      eventBus.on('world:ready', () => {
        setWorldReady(true);
      }),
      eventBus.on('world:error', ({ message }) => {
        setWorldError(loc(message));
      }),
      eventBus.on('location:enter', ({ worldId, locationId, location }) => {
        setCurrentLocation(location);
        discoverLocation(worldId, locationId);
        markDistrictVisited(locationId);
        showCaptionForLocation(locationId);
      }),
      eventBus.on('player:pose', (pose) => {
        setPlayerPose({ x: pose.x, z: pose.z, yaw: pose.yaw });
      }),
      eventBus.on('object:focus', (payload) => {
        setFocusTarget(payload);
      }),
      eventBus.on('object:interact', (payload) => {
        if (payload.action.type === 'dialogue') {
          const chId = payload.action.characterId;
          const ch = world.characters.find((c) => c.id === chId) ?? null;
          if (ch) {
            setDialogueChar(ch);
            renderer.setDialogueCharacter(ch.id);
          }
        } else if (payload.action.type === 'video') {
          const actionVideo = payload.action;
          const clip =
            BAGHDAD_VIDEOS.find((v) => v.id === actionVideo.videoId) ?? BAGHDAD_VIDEOS[0];
          setActiveVideo({ clip, storyId: actionVideo.storyId });
        } else {
          const obj = world.objects.find((o) => o.id === payload.targetId) ?? null;
          if (obj) {
            setInspectedObj(obj);
            markArtifactInspected(obj.id);
            inspectObject(
              world.id,
              obj.id,
              obj.glossaryTerm
                ? {
                    termEn: obj.glossaryTerm.term.en,
                    termAr: obj.glossaryTerm.term.ar,
                    defEn: obj.glossaryTerm.definition.en,
                    defAr: obj.glossaryTerm.definition.ar,
                  }
                : undefined,
            );
          }
        }
      }),
      eventBus.on('story:start', ({ storyId }) => {
        const s = world.stories.find((item) => item.id === storyId) ?? null;
        setActiveStory(s);
        setStorySubtitle(null);
        setStoryProgress(0);
      }),
      eventBus.on('story:subtitle', ({ text, progress }) => {
        setStorySubtitle(text);
        setStoryProgress(progress);
      }),
      eventBus.on('story:end', ({ worldId, storyId }) => {
        watchStory(worldId, storyId);
        setActiveStory(null);
        setStorySubtitle(null);
        if (storyReturnCharRef.current) {
          const prevChar = storyReturnCharRef.current;
          storyReturnCharRef.current = null;
          setDialogueChar(prevChar);
          renderer.setDialogueCharacter(prevChar.id);
        }
      }),
    ];

    void renderer.mount(container, world);

    return () => {
      for (const unsub of unsubs) unsub();
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
      websiteStudyAudio.setThreeActive(false);
      renderer.unmount();
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive]);

  // Execute pending teleport once world is ready
  useEffect(() => {
    if (worldReady && pendingTeleportLoc && rendererRef.current) {
      rendererRef.current.teleportTo(pendingTeleportLoc);
      setPendingTeleportLoc(null);
    }
  }, [worldReady, pendingTeleportLoc]);

  // Sync live settings -> renderer (including musicVolume!)
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.setQuality(settings.quality);
    r.setTimeOfDay(settings.timeOfDay);
    r.setAudioVolumes({
      environment: settings.environmentVolume,
      voices: settings.voiceVolume,
      people: settings.peopleVolume,
      music: settings.musicVolume,
      muted: settings.muted,
    });
    r.setControlPrefs({
      mouseSensitivity: settings.mouseSensitivity,
      invertY: settings.invertY,
      headBob: settings.headBob,
      reducedMotion: settings.reducedMotion,
    });
  }, [settings, worldReady]);

  // Pause renderer when modal, video, or inspection card is open
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    const shouldPause = Boolean(activeModal || inspectedObj || activeVideo);
    r.setPaused(shouldPause);
  }, [activeModal, inspectedObj, activeVideo]);

  // Keyboard shortcuts during live 3D play (M Map, J Journal, P Photo, Esc Pause)
  useEffect(() => {
    if (!gameActive || !worldReady) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      if (activeStory || dialogueChar || inspectedObj || activeVideo || photoMode) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'map' ? null : 'map'));
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'journal' ? null : 'journal'));
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveModal(null);
        setPhotoMode(true);
        rendererRef.current?.enterPhotoMode();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveModal((prev) => (prev ? null : 'pause'));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameActive, worldReady, activeStory, dialogueChar, inspectedObj, activeVideo, photoMode]);

  const handleStartGame = useCallback((locationId?: string) => {
    if (locationId) {
      setPendingTeleportLoc(locationId);
    }
    setGameActive(true);
    setTimeout(() => rendererRef.current?.unlockAudio(), 60);
  }, []);

  const handleCloseDialogue = useCallback(() => {
    setDialogueChar(null);
    rendererRef.current?.setDialogueCharacter(null);
  }, []);

  const handleStartStoryFromDialogue = useCallback(
    (storyId: string) => {
      storyReturnCharRef.current = dialogueChar;
      setDialogueChar(null);
      rendererRef.current?.setDialogueCharacter(null);
      rendererRef.current?.playStory(storyId);
    },
    [dialogueChar],
  );

  const handleHudInteract = useCallback(() => {
    if (!focusTarget) return;
    if (focusTarget.targetType === 'character') {
      const ch = world.characters.find((c) => c.id === focusTarget.targetId);
      if (ch) {
        setDialogueChar(ch);
        rendererRef.current?.setDialogueCharacter(ch.id);
      }
    } else {
      const obj = world.objects.find((o) => o.id === focusTarget.targetId);
      if (obj) {
        if (obj.action.type === 'video') {
          const actionVideo = obj.action;
          const clip =
            BAGHDAD_VIDEOS.find((v) => v.id === actionVideo.videoId) ?? BAGHDAD_VIDEOS[0];
          setActiveVideo({ clip, storyId: actionVideo.storyId });
          return;
        }
        setInspectedObj(obj);
        markArtifactInspected(obj.id);
        inspectObject(
          world.id,
          obj.id,
          obj.glossaryTerm
            ? {
                termEn: obj.glossaryTerm.term.en,
                termAr: obj.glossaryTerm.term.ar,
                defEn: obj.glossaryTerm.definition.en,
                defAr: obj.glossaryTerm.definition.ar,
              }
            : undefined,
        );
      }
    }
  }, [focusTarget, inspectObject, markArtifactInspected, world]);

  const handlePhotoCapture = (caption: string) => {
    const dataUrl = rendererRef.current?.capturePhoto(caption);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `chronoverse-baghdad-800ce.png`;
    a.click();
  };

  const filterClass =
    photoMode && photoFilter !== 'none' ? `cv-filter-${photoFilter}` : '';

  const stageViewport = (
    <div className="relative h-full w-full overflow-hidden bg-[#0C182E]">
      <div
        ref={stageRef}
        data-testid="world-stage"
        className={`absolute inset-0 h-full w-full ${filterClass}`}
      />

      {!worldReady && !worldError && <TimeTransition progress={loadProgress} />}

      {worldError && (
        <ErrorPanel
          message={worldError}
          onRetry={() => {
            setWorldError(null);
            setGameActive(false);
            setTimeout(() => setGameActive(true), 40);
          }}
          onBackPortal={() => {
            setWorldError(null);
            setFullscreen3d(false);
            setGameActive(false);
          }}
        />
      )}

      {worldReady &&
        !activeStory &&
        !photoMode &&
        !dialogueChar &&
        !inspectedObj &&
        !activeVideo && (
          <ExplorationHud
            world={world}
            currentLocation={currentLocation}
            playerPose={playerPose}
            focusTarget={focusTarget}
            soundCaption={soundCaption}
            onInteractClick={handleHudInteract}
            onOpenMap={() => setActiveModal('map')}
            onOpenJournal={() => setActiveModal('journal')}
            onOpenPhoto={() => {
              setActiveModal(null);
              setPhotoMode(true);
              rendererRef.current?.enterPhotoMode();
            }}
            onOpenSettings={() => setActiveModal('settings')}
            onOpenPause={() => setActiveModal('pause')}
          />
        )}

      {worldReady && dialogueChar && !activeStory && (
        <DialogueDrawer
          world={world}
          character={dialogueChar}
          currentLocationId={currentLocation?.id ?? null}
          onClose={handleCloseDialogue}
          onPlayStory={handleStartStoryFromDialogue}
          onCharacterSpeaking={(sp) =>
            rendererRef.current?.setCharacterSpeaking(dialogueChar.id, sp)
          }
          onTriggerGesture={(g) =>
            rendererRef.current?.triggerGesture(dialogueChar.id, g)
          }
        />
      )}

      {worldReady && activeStory && (
        <StoryPlayerOverlay
          story={activeStory}
          subtitle={storySubtitle}
          progress={storyProgress}
          onSkip={() => rendererRef.current?.skipStory()}
        />
      )}

      {worldReady && photoMode && (
        <PhotoModeOverlay
          filter={photoFilter}
          onFilterChange={setPhotoFilter}
          onFovChange={(fov) => rendererRef.current?.setPhotoFov(fov)}
          onCapture={handlePhotoCapture}
          onExit={() => {
            setPhotoMode(false);
            setPhotoFilter('none');
            rendererRef.current?.exitPhotoMode();
          }}
        />
      )}
    </div>
  );

  if (fullViewport && gameActive) {
    return (
      <div className="relative h-dvh w-screen overflow-hidden bg-[#0C182E]">
        {stageViewport}
        {worldReady && inspectedObj && (
          <ObjectCardModal object={inspectedObj} onClose={() => setInspectedObj(null)} />
        )}
        {activeVideo && (
          <VideoModalPlayer
            clip={activeVideo.clip}
            onClose={() => setActiveVideo(null)}
            onStart3dTour={
              activeVideo.storyId
                ? () => {
                    const sid = activeVideo.storyId!;
                    setActiveVideo(null);
                    rendererRef.current?.playStory(sid);
                  }
                : undefined
            }
          />
        )}
        {activeModal === 'map' && (
          <MapModal
            world={world}
            playerPose={playerPose}
            onTeleport={(locId) => rendererRef.current?.teleportTo(locId)}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'journal' && (
          <JournalModal world={world} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'settings' && (
          <SettingsModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'pause' && (
          <PauseModal
            onResume={() => setActiveModal(null)}
            onOpenMap={() => setActiveModal('map')}
            onOpenJournal={() => setActiveModal('journal')}
            onOpenSettings={() => setActiveModal('settings')}
            onReturnPortal={() => {
              setActiveModal(null);
              setGameActive(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="embedded-baghdad-exhibit"
      className="cv-lapis-theme overflow-hidden rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] shadow-[0_14px_38px_rgba(12,24,46,0.22)]"
    >
      {/* Exhibit Window Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8AE66]/25 bg-[#162B4D] px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs">
          <Compass className="h-4 w-4 text-[#D8AE66]" />
          <span className="font-bold text-[#F7F1E1]">
            {loc(world.name)} · {loc(world.eraLabel)}
          </span>
          <span className="hidden text-[#3A9BA8] font-semibold sm:inline">
            · {t('browserWorldBadge')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                timeOfDay: settings.timeOfDay === 'day' ? 'dusk' : 'day',
              })
            }
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/35 bg-[#0C182E] px-3 py-1 text-xs font-semibold text-[#F7F1E1] hover:border-[#D8AE66]"
          >
            {settings.timeOfDay === 'day' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-[#E8C988]" />
                <span>{t('timeDay')}</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#3A9BA8]" />
                <span>{t('timeDusk')}</span>
              </>
            )}
          </button>

          {gameActive && (
            <>
              <button
                type="button"
                data-testid="toggle-fullscreen-btn"
                onClick={() => setFullscreen3d((v) => !v)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D8AE66]/55 bg-[#0C182E] px-3 py-1 text-xs font-semibold text-[#E8C988] hover:bg-[#D8AE66] hover:text-[#071020]"
              >
                {fullscreen3d ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
                <span>{fullscreen3d ? t('exitFullscreen') : t('fullscreen3d')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFullscreen3d(false);
                  setGameActive(false);
                }}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-[#D8AE66]/30 px-3 py-1 text-xs text-[#C5D1DE] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                <span>{t('close3d')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas Container or Pre-Entry Cover */}
      <div
        className={
          fullscreen3d
            ? 'fixed inset-0 z-40 h-dvh w-screen bg-[#0C182E]'
            : 'relative h-[64vh] min-h-[460px] max-h-[720px] w-full bg-[#0C182E]'
        }
      >
        {fullscreen3d && gameActive && (
          <button
            type="button"
            data-testid="exit-fullscreen-btn"
            onClick={() => setFullscreen3d(false)}
            className="fixed bottom-4 start-4 z-50 cursor-pointer rounded-full border border-[#D8AE66]/60 bg-[#0C182E]/95 px-4 py-1.5 text-xs font-semibold text-[#E8C988]"
          >
            {t('returnWebsiteView')}
          </button>
        )}

        {gameActive ? (
          stageViewport
        ) : (
          <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#162B4D] via-[#0C182E] to-[#071020] p-6 sm:p-8 cv-scroll">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[16px] border border-[#D8AE66]/40 bg-[#0C182E]/92 p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#D8AE66]">
                  {t('entryAboutWorld')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#F7F1E1]">
                  {loc(world.honestyNote)}
                </p>
              </div>

              <div className="rounded-[16px] border border-[#3A9BA8]/40 bg-[#0C182E]/92 p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#3A9BA8]">
                  {t('entryPortrayalHeader')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D1DE]">
                  {primaryChar ? loc(primaryChar.portrayalNotice) : ''}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[16px] border border-[#D8AE66]/35 bg-[#0C182E]/95 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#D8AE66]">
                    {t('entryControlsHeader')}
                  </p>
                  <p className="mt-1 text-xs text-[#F7F1E1] sm:text-sm">
                    {t('entryControlsDesktop')}
                  </p>
                  <p className="mt-1 text-xs text-[#C5D1DE]">{t('headphonesTip')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {qualities.map((q) => {
                      const active = settings.quality === q;
                      const label =
                        q === 'auto'
                          ? t('qualityAuto')
                          : q === 'high'
                            ? t('qualityHigh')
                            : t('qualityLow');
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => updateSettings({ quality: q })}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold ${
                            active
                              ? 'border-[#D8AE66] bg-[#D8AE66] text-[#071020]'
                              : 'border-[#D8AE66]/30 bg-[#162B4D] text-[#C5D1DE]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    data-testid="enter-baghdad-btn"
                    onClick={() => handleStartGame(initialLocationId ?? undefined)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#D8AE66] px-6 py-3 text-sm font-bold text-[#071020] shadow-lg hover:bg-[#E8C988]"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>{t('enterWorld')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exhibit Modals */}
      {worldReady && inspectedObj && (
        <ObjectCardModal object={inspectedObj} onClose={() => setInspectedObj(null)} />
      )}

      {activeVideo && (
        <VideoModalPlayer
          clip={activeVideo.clip}
          onClose={() => setActiveVideo(null)}
          onStart3dTour={
            activeVideo.storyId
              ? () => {
                  const sid = activeVideo.storyId!;
                  setActiveVideo(null);
                  rendererRef.current?.playStory(sid);
                }
              : undefined
          }
        />
      )}

      {activeModal === 'map' && gameActive && (
        <MapModal
          world={world}
          playerPose={playerPose}
          onTeleport={(locId) => rendererRef.current?.teleportTo(locId)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'journal' && (
        <JournalModal world={world} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'pause' && gameActive && (
        <PauseModal
          onResume={() => setActiveModal(null)}
          onOpenMap={() => setActiveModal('map')}
          onOpenJournal={() => setActiveModal('journal')}
          onOpenSettings={() => setActiveModal('settings')}
          onReturnPortal={() => {
            setActiveModal(null);
            setFullscreen3d(false);
            setGameActive(false);
          }}
        />
      )}
    </div>
  );
}
