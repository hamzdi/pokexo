/**
 * Build the local pokedex bundle from the Tyradex API.
 *
 * Tyradex asks consumers to cache its data and to identify themselves with a
 * User-Agent, so this script runs offline from the app: the generated JSON is
 * committed and inlined into the build. Sprites are downloaded once, resized
 * and embedded as data URIs so that sheets never depend on a remote image at
 * display or print time. Run with `make data`.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const USER_AGENT = 'pokexo/0.1 (https://github.com/hamzdi/pokexo; hamza.diouane@try-it.fr)';
const GENERATIONS = [1, 2];
const OUTPUT = resolve(import.meta.dirname, '../src/data/pokemon.json');
const SPRITE_SIZE = 192;
const SPRITE_QUALITY = 82;
const CONCURRENCY = 8;

interface TyradexPokemon {
  pokedex_id: number;
  category: string;
  name: { fr: string };
  sprites: { regular: string | null };
  types: { name: string }[] | null;
  stats: { hp: number; atk: number; vit: number } | null;
  resistances: { name: string; multiplier: number }[] | null;
  evolution: { pre: { pokedex_id: number }[] | null; next: { pokedex_id: number }[] | null } | null;
  height: string | null;
  weight: string | null;
}

/** Parse a French-formatted measure such as "0,4 m" or "6,0 kg" into a number. */
function parseMeasure(text: string | null): number {
  if (!text) return 0;
  return Number.parseFloat(text.replace(',', '.'));
}

async function fetchGeneration(generation: number): Promise<TyradexPokemon[]> {
  const response = await fetch(`https://tyradex.app/api/v1/gen/${generation}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!response.ok) throw new Error(`Tyradex gen ${generation}: HTTP ${response.status}`);
  return (await response.json()) as TyradexPokemon[];
}

/** Download a sprite and return it as a small WebP data URI. */
async function embedSprite(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`Sprite ${url}: HTTP ${response.status}`);
  const source = Buffer.from(await response.arrayBuffer());
  const webp = await sharp(source)
    .resize(SPRITE_SIZE, SPRITE_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: SPRITE_QUALITY })
    .toBuffer();
  return `data:image/webp;base64,${webp.toString('base64')}`;
}

/** Run `task` over `items` with a bounded number of concurrent downloads. */
async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await task(items[index] as T);
      }
    }),
  );
  return results;
}

interface BundleEntry {
  id: number;
  name: string;
  category: string;
  /** Original Tyradex sprite URL, kept for attribution and rebuilds. */
  spriteUrl: string;
  /** Embedded WebP data URI used by the app. */
  sprite: string;
  types: string[];
  resistances: Record<string, number>;
  heightCm: number;
  weightKg: number;
  hp: number;
  atk: number;
  speed: number;
  preId: number | null;
  nextId: number | null;
}

/** Metadata from the API, or from the committed bundle when the API is unreachable. */
async function loadMetadata(): Promise<Omit<BundleEntry, 'sprite'>[]> {
  try {
    const all = (await Promise.all(GENERATIONS.map(fetchGeneration))).flat();
    return all
      .filter((p) => p.pokedex_id > 0 && p.sprites.regular && p.types && p.stats && p.resistances)
      .map((p) => ({
        id: p.pokedex_id,
        name: p.name.fr,
        category: p.category,
        spriteUrl: p.sprites.regular as string,
        types: (p.types as { name: string }[]).map((t) => t.name),
        resistances: Object.fromEntries(
          (p.resistances as { name: string; multiplier: number }[]).map((r) => [r.name, r.multiplier]),
        ),
        heightCm: Math.round(parseMeasure(p.height) * 100),
        weightKg: parseMeasure(p.weight),
        hp: (p.stats as { hp: number }).hp,
        atk: (p.stats as { atk: number }).atk,
        speed: (p.stats as { vit: number }).vit,
        preId: p.evolution?.pre?.[0]?.pokedex_id ?? null,
        nextId: p.evolution?.next?.[0]?.pokedex_id ?? null,
      }))
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    if (!existsSync(OUTPUT)) throw error;
    console.warn(`Tyradex API unreachable (${(error as Error).message}); reusing metadata from ${OUTPUT}`);
    const previous = JSON.parse(await readFile(OUTPUT, 'utf8')) as (BundleEntry & { spriteUrl?: string })[];
    return previous.map(({ sprite, spriteUrl, ...rest }) => ({
      ...rest,
      spriteUrl: spriteUrl ?? (sprite.startsWith('data:') ? `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${rest.id}/regular.png` : sprite),
    }));
  }
}

const metadata = await loadMetadata();
const sprites = await mapLimit(metadata, CONCURRENCY, (p) => embedSprite(p.spriteUrl));
const bundle: BundleEntry[] = metadata.map((p, index) => ({ ...p, sprite: sprites[index] as string }));

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, JSON.stringify(bundle));
const bytes = (await stat(OUTPUT)).size;
console.log(`Wrote ${bundle.length} Pokémon to ${OUTPUT} (${Math.round(bytes / 1024)} KB)`);
