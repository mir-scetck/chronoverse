import { BAGHDAD_WORLD } from '../src/data/worlds/baghdad';
import { BAGHDAD_KNOWLEDGE } from '../src/data/knowledge/baghdad-characters';
import type { World } from '../src/contracts';

const KEBAB_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARABIC_RE = /[\u0600-\u06FF]/;

function validateWorld(world: World): string[] {
  const errors: string[] = [];

  if (!KEBAB_RE.test(world.id)) errors.push(`World id "${world.id}" must be kebab-case.`);

  const locIds = new Set<string>();
  for (const loc of world.locations) {
    if (!KEBAB_RE.test(loc.id)) errors.push(`Location id "${loc.id}" not kebab-case.`);
    if (locIds.has(loc.id)) errors.push(`Duplicate location id "${loc.id}".`);
    locIds.add(loc.id);
    if (!ARABIC_RE.test(loc.name.ar)) errors.push(`Location "${loc.id}" missing Arabic name.`);
    if (
      loc.center.x < world.scene.bounds.min[0] ||
      loc.center.x > world.scene.bounds.max[0] ||
      loc.center.z < world.scene.bounds.min[1] ||
      loc.center.z > world.scene.bounds.max[1]
    ) {
      errors.push(`Location "${loc.id}" center is outside scene bounds.`);
    }
  }

  const charIds = new Set<string>();
  for (const ch of world.characters) {
    if (!KEBAB_RE.test(ch.id)) errors.push(`Character id "${ch.id}" not kebab-case.`);
    if (charIds.has(ch.id)) errors.push(`Duplicate character id "${ch.id}".`);
    charIds.add(ch.id);
    if (!locIds.has(ch.homeLocationId)) {
      errors.push(`Character "${ch.id}" references missing location "${ch.homeLocationId}".`);
    }
    if (!ch.portrayalNotice.en.trim() || !ARABIC_RE.test(ch.portrayalNotice.ar)) {
      errors.push(`Character "${ch.id}" missing bilingual portrayalNotice.`);
    }
    if (world.status === 'ready' && !BAGHDAD_KNOWLEDGE[ch.id]) {
      errors.push(`Ready world character "${ch.id}" missing knowledge entry.`);
    }
  }

  if (!charIds.has(world.primaryCharacterId)) {
    errors.push(`primaryCharacterId "${world.primaryCharacterId}" missing.`);
  }

  const objIds = new Set<string>();
  for (const obj of world.objects) {
    if (!KEBAB_RE.test(obj.id)) errors.push(`Object id "${obj.id}" not kebab-case.`);
    if (objIds.has(obj.id)) errors.push(`Duplicate object id "${obj.id}".`);
    objIds.add(obj.id);
    if (!locIds.has(obj.locationId)) {
      errors.push(`Object "${obj.id}" references missing location "${obj.locationId}".`);
    }
    if (!ARABIC_RE.test(obj.name.ar) || !ARABIC_RE.test(obj.description.ar)) {
      errors.push(`Object "${obj.id}" missing Arabic text.`);
    }
    if (obj.action.type === 'teleport' && !locIds.has(obj.action.targetLocationId)) {
      errors.push(`Object "${obj.id}" teleports to missing location "${obj.action.targetLocationId}".`);
    }
  }

  for (const asset of world.assets) {
    if (!asset.licence) {
      errors.push(`Invalid asset "${asset.id}": missing licence.`);
    }
  }

  if (world.status === 'ready') {
    for (const loc of world.locations) {
      const hasBed = world.soundscape.beds.some((b) => b.locationId === loc.id);
      if (!hasBed) errors.push(`Ready world location "${loc.id}" has no soundscape bed.`);
    }
    for (const story of world.stories) {
      if (!story.subtitles.length) errors.push(`Story "${story.id}" has no subtitles.`);
      for (const sub of story.subtitles) {
        if (!ARABIC_RE.test(sub.text.ar)) errors.push(`Story "${story.id}" subtitle missing Arabic.`);
      }
    }
  }

  return errors;
}

const errors = validateWorld(BAGHDAD_WORLD);
if (errors.length > 0) {
  console.error('World validation failed:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}

console.log(
  `Validated world "${BAGHDAD_WORLD.id}" (${BAGHDAD_WORLD.status}): ` +
    `${BAGHDAD_WORLD.locations.length} locations, ` +
    `${BAGHDAD_WORLD.objects.length} objects, ` +
    `${BAGHDAD_WORLD.characters.length} characters, ` +
    `${BAGHDAD_WORLD.stories.length} stories — OK.`,
);
