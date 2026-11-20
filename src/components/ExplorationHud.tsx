import {
  Compass,
  Volume2,
  VolumeX,
  Camera,
  BookOpen,
  Map as MapIcon,
  Settings,
  Pause,
  Music,
} from 'lucide-react';
import { useEffect } from 'react';
import type { FocusPayload, Location, World } from '../contracts';
import { useT } from '../i18n/useT';
import { eventBus } from '../services/eventBus';
import { useAcademyStore } from '../stores/academyStore';
import { useAppStore } from '../stores/appStore';
import {
  calculateSealProgress,
  findNearestUndiscoveredLocation,
} from '../utils/progress';

interface ExplorationHudProps {
  world: World;
  currentLocation: Location | null;
  playerPose: { x: number; z: number; yaw: number };
  focusTarget: FocusPayload | null;
  soundCaption: string | null;
  onInteractClick: () => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenPhoto: () => void;
  onOpenSettings: () => void;
  onOpenPause: () => void;
}

export function ExplorationHud({
  world,
  currentLocation,
  playerPose,
  focusTarget,
  soundCaption,
  onInteractClick,
  onOpenMap,
  onOpenJournal,
  onOpenPhoto,
  onOpenSettings,
  onOpenPause,
}: ExplorationHudProps) {
  const { settings, updateSettings, getWorldProgress } = useAppStore();
  const activeTrackLabel = useAcademyStore((s) => s.activeTrackLabel);
  const setActiveTrackLabel = useAcademyStore((s) => s.setActiveTrackLabel);
  const { t, loc } = useT(settings.language);
  const wp = getWorldProgress(world.id);
  const seal = calculateSealProgress(world, wp);
  const nearestUndiscovered = findNearestUndiscoveredLocation(
    world,
    wp.discoveredLocations,
    playerPose.x,
    playerPose.z,
  );

  useEffect(() => {
    return eventBus.on('audio:music:change', ({ title }) => {
      setActiveTrackLabel(loc(title));
    });
  }, [loc, setActiveTrackLabel]);

  // Minimap coordinate projection centered on playerPose
  const mapRadius = 46;
  const worldScale = 0.42;

  return (
    <div className="cv-lapis-theme pointer-events-none absolute inset-0 z-20 flex select-none flex-col justify-between bg-transparent p-4 sm:p-5">
      {/* Top Perimeter */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-left Location, Music Track & Hint */}
        <div className="pointer-events-auto max-w-xs space-y-2">
          <div className="rounded-[14px] border border-[#D8AE66]/45 bg-[#0C182E]/95 px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-2 text-xs text-[#D8AE66]">
              <Compass className="h-3.5 w-3.5 shrink-0 text-[#3A9BA8]" />
              <span className="cv-tabular font-semibold">{loc(world.eraLabel)}</span>
              <span className="text-[#C5D1DE]/60">·</span>
              <span className="cv-tabular text-[#F7F1E1]">
                {seal.completed}/{seal.total}
              </span>
            </div>
            <p
              data-testid="hud-location-name"
              className="cv-display mt-0.5 text-lg font-semibold leading-tight text-[#F7F1E1]"
            >
              {currentLocation ? loc(currentLocation.name) : loc(world.name)}
            </p>
            <p className="mt-1 text-[11px] text-[#C5D1DE]">
              {nearestUndiscovered
                ? `${t('hudFindHint')}: ${loc(nearestUndiscovered.name)}`
                : t('hudAllDiscovered')}
            </p>
          </div>

          {/* Active Adaptive Music Chip */}
          <button
            type="button"
            data-testid="hud-music-chip"
            onClick={() => updateSettings({ muted: !settings.muted })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#3A9BA8]/55 bg-[#162B4D]/95 px-3 py-1 text-[11px] font-medium text-[#F7F1E1] shadow-md hover:border-[#D8AE66]"
          >
            <Music
              className={`h-3 w-3 ${settings.muted || settings.musicVolume <= 0 ? 'text-[#C5D1DE]/50' : 'text-[#3A9BA8]'}`}
            />
            <span className="max-w-[190px] truncate">
              {settings.muted || settings.musicVolume <= 0
                ? t('navMusicMuted')
                : activeTrackLabel}
            </span>
          </button>
        </div>

        {/* Top-right Minimap + Perimeter Action Bar */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5">
          <div className="flex flex-wrap items-center justify-end gap-1.5 rounded-[14px] border border-[#D8AE66]/45 bg-[#0C182E]/95 p-1.5 shadow-lg">
            <button
              type="button"
              data-testid="hud-map-btn"
              onClick={onOpenMap}
              title={`${t('navMap')} (M)`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#F7F1E1] hover:bg-[#162B4D]"
            >
              <MapIcon className="h-3.5 w-3.5 text-[#D8AE66]" />
              <span className="hidden sm:inline">{t('navMap')}</span>
            </button>
            <button
              type="button"
              data-testid="hud-journal-btn"
              onClick={onOpenJournal}
              title={`${t('navJournal')} (J)`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#F7F1E1] hover:bg-[#162B4D]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#D8AE66]" />
              <span className="hidden sm:inline">{t('navJournal')}</span>
            </button>
            <button
              type="button"
              data-testid="hud-photo-btn"
              onClick={onOpenPhoto}
              title={`${t('navPhoto')} (P)`}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#F7F1E1] hover:bg-[#162B4D]"
            >
              <Camera className="h-3.5 w-3.5 text-[#3A9BA8]" />
              <span className="hidden md:inline">{t('navPhoto')}</span>
            </button>
            <button
              type="button"
              data-testid="hud-settings-btn"
              onClick={onOpenSettings}
              title={t('navSettings')}
              className="cursor-pointer rounded-lg p-1.5 text-[#C5D1DE] hover:bg-[#162B4D] hover:text-[#F7F1E1]"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-testid="hud-mute-btn"
              onClick={() => updateSettings({ muted: !settings.muted })}
              title={settings.muted ? t('navUnmute') : t('navMute')}
              className="cursor-pointer rounded-lg p-1.5 text-[#C5D1DE] hover:bg-[#162B4D] hover:text-[#F7F1E1]"
            >
              {settings.muted ? (
                <VolumeX className="h-4 w-4 text-[#D96B52]" />
              ) : (
                <Volume2 className="h-4 w-4 text-[#3A9BA8]" />
              )}
            </button>
            <button
              type="button"
              data-testid="hud-pause-btn"
              onClick={onOpenPause}
              title={`${t('navPause')} (Esc)`}
              className="cursor-pointer rounded-lg p-1.5 text-[#C5D1DE] hover:bg-[#162B4D] hover:text-[#F7F1E1]"
            >
              <Pause className="h-4 w-4" />
            </button>
          </div>

          {/* Round SVG Minimap */}
          <div
            aria-label={t('navMap')}
            className="hidden items-center justify-center rounded-full border border-[#D8AE66]/55 bg-[#0C182E]/95 p-1 shadow-lg sm:flex"
          >
            <svg width="96" height="96" viewBox="-50 -50 100 100">
              <circle
                cx="0"
                cy="0"
                r={mapRadius}
                fill="#162B4D"
                stroke="rgba(216,174,102,0.45)"
                strokeWidth="1.2"
              />
              <text x="0" y="-37" textAnchor="middle" fill="#D8AE66" fontSize="7" fontWeight="700">
                N
              </text>
              {world.locations.map((l) => {
                const dx = (l.center.x - playerPose.x) * worldScale;
                const dz = (l.center.z - playerPose.z) * worldScale;
                const dist = Math.hypot(dx, dz);
                const clamp = dist > 38 ? 38 / dist : 1;
                const px = dx * clamp;
                const py = dz * clamp;
                const discovered = wp.discoveredLocations.includes(l.id);
                return (
                  <circle
                    key={l.id}
                    cx={px}
                    cy={py}
                    r={discovered ? 3 : 2.3}
                    fill={discovered ? '#D8AE66' : '#3A9BA8'}
                    fillOpacity={discovered ? 1 : 0.65}
                  />
                );
              })}
              {/* Player center & heading cone */}
              <g transform={`rotate(${(-playerPose.yaw * 180) / Math.PI})`}>
                <path d="M0,-9 L-5,4 L0,1.5 L5,4 Z" fill="#F7F1E1" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Center Reticle + Interact Prompt */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`h-1.5 w-1.5 rounded-full transition-transform ${
            focusTarget ? 'scale-150 bg-[#E8C988]' : 'bg-[#F7F1E1]/70'
          }`}
        />
        {focusTarget && (
          <button
            type="button"
            data-testid="hud-interact-prompt"
            onClick={onInteractClick}
            className="pointer-events-auto mt-4 flex cursor-pointer items-center gap-2 rounded-full border border-[#D8AE66]/70 bg-[#0C182E]/95 px-4 py-2 text-xs font-semibold text-[#F7F1E1] shadow-lg"
          >
            <kbd className="rounded-full bg-[#D8AE66] px-2 py-0.5 font-sans text-[11px] font-bold text-[#071020]">
              {t('hudInteractKey')}
            </kbd>
            <span>{loc(focusTarget.prompt)}</span>
          </button>
        )}
      </div>

      {/* Bottom Perimeter: Soundscape Caption + Mouse Hint */}
      <div className="flex flex-col items-center gap-1.5">
        {soundCaption && (
          <div className="rounded-full border border-[#3A9BA8]/40 bg-[#0C182E]/95 px-4 py-1.5 text-xs text-[#F7F1E1]">
            {soundCaption}
          </div>
        )}
        <p className="hidden rounded-full border border-[#D8AE66]/25 bg-[#0C182E]/88 px-3.5 py-1 text-[11px] text-[#C5D1DE] sm:block">
          {t('hudClickToLook')}
        </p>
      </div>
    </div>
  );
}
