import { X, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Location, World } from '../contracts';
import { useT } from '../i18n/useT';
import { useAppStore } from '../stores/appStore';

interface MapModalProps {
  world: World;
  playerPose: { x: number; z: number; yaw: number };
  onTeleport: (locationId: string) => void;
  onClose: () => void;
}

export function MapModal({ world, playerPose, onTeleport, onClose }: MapModalProps) {
  const { settings, getWorldProgress } = useAppStore();
  const { t, loc } = useT(settings.language);
  const wp = getWorldProgress(world.id);
  const [confirmLoc, setConfirmLoc] = useState<Location | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const [minX, minZ] = world.scene.bounds.min;
  const [maxX, maxZ] = world.scene.bounds.max;
  const spanX = maxX - minX;
  const spanZ = maxZ - minZ;

  const toSvg = (wx: number, wz: number) => ({
    x: ((wx - minX) / spanX) * 520 + 40,
    y: ((wz - minZ) / spanZ) * 340 + 30,
  });

  const pPt = toSvg(playerPose.x, playerPose.z);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('mapTitle')}
      data-testid="map-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#071020]/88 p-4"
    >
      <div className="cv-lapis-theme flex w-full max-w-3xl flex-col rounded-[18px] border border-[#D8AE66]/55 bg-[#0C182E] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D8AE66]/25 pb-3">
          <h2 className="cv-display text-2xl font-semibold text-[#F7F1E1]">
            {t('mapTitle')}
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

        {/* Parchment Architectural Map */}
        <div dir="ltr" className="mt-4 overflow-hidden rounded-[14px] border border-[#D8AE66]/45 bg-[#EFE4CC] p-2">
          <svg viewBox="0 0 600 400" className="h-auto w-full">
            <rect x="0" y="0" width="600" height="400" fill="#EFE4CC" />
            <circle
              cx="300"
              cy="195"
              r="165"
              fill="none"
              stroke="#8C6239"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <rect
              x="248"
              y="148"
              width="104"
              height="108"
              rx="4"
              fill="rgba(216,174,102,0.22)"
              stroke="#8C6239"
              strokeWidth="1.5"
            />

            {/* Locations */}
            {world.locations.map((l) => {
              const pt = toSvg(l.center.x, l.center.z);
              const discovered = wp.discoveredLocations.includes(l.id);
              return (
                <g
                  key={l.id}
                  data-testid={`map-loc-${l.id}`}
                  className="cursor-pointer"
                  onClick={() => setConfirmLoc(l)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={13}
                    fill={discovered ? '#0C182E' : '#3A9BA8'}
                    stroke="#D8AE66"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#F7F1E1"
                  >
                    {discovered ? '•' : '?'}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y + 29}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#0C182E"
                    stroke="#EFE4CC"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {loc(l.name)}
                  </text>
                </g>
              );
            })}

            {/* Player Arrow */}
            <g transform={`translate(${pPt.x}, ${pPt.y}) rotate(${(-playerPose.yaw * 180) / Math.PI})`}>
              <path d="M0,-10 L-6,5 L0,2 L6,5 Z" fill="#D96B52" stroke="#F7F1E1" strokeWidth="1.2" />
            </g>
          </svg>
        </div>

        {/* Click-to-teleport bar or legend */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {confirmLoc ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#D8AE66]/45 bg-[#162B4D] px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm text-[#F7F1E1]">
                <MapPin className="h-4 w-4 text-[#D8AE66]" />
                <span>
                  {t('mapTeleportConfirm')} <strong>{loc(confirmLoc.name)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmLoc(null)}
                  className="cursor-pointer rounded-full border border-[#D8AE66]/35 px-3.5 py-1.5 text-xs text-[#C5D1DE]"
                >
                  {t('mapCancel')}
                </button>
                <button
                  type="button"
                  data-testid="map-confirm-teleport-btn"
                  onClick={() => {
                    onTeleport(confirmLoc.id);
                    onClose();
                  }}
                  className="cursor-pointer rounded-full bg-[#D8AE66] px-4 py-1.5 text-xs font-bold text-[#071020] hover:bg-[#E8C988]"
                >
                  {t('mapConfirmAction')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-between gap-2 text-xs text-[#C5D1DE]">
              <span>
                {t('mapDiscovered')}: {wp.discoveredLocations.length}/{world.locations.length} ·{' '}
                {t('mapUndiscovered')} (?)
              </span>
              <span className="text-[#D8AE66]">Click any district marker to walk there</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
