import type { WorldRenderer } from '../contracts';
import { WorldRendererImpl } from './core/WorldRendererImpl';

export function createWorldRenderer(): WorldRenderer & {
  setDialogueCharacter: (characterId: string | null) => void;
} {
  return new WorldRendererImpl();
}
