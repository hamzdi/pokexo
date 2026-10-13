/**
 * Build the local pokedex bundle from the Tyradex API.
 *
 * Tyradex asks consumers to cache its data and to identify themselves with a
 * User-Agent, so this script runs offline from the app: the generated JSON is
 * committed and inlined into the build. Run with `make data`.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const USER_AGENT = 'pokexo/0.1 (https://github.com/hamzdi/pokexo; hamza.diouane@try-it.fr)';
const GENERATIONS = [1, 2];
const OUTPUT = resolve(import.meta.dirname, '../src/data/pokemon.json');

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

const all = (await Promise.all(GENERATIONS.map(fetchGeneration))).flat();

const bundle = all
  .filter((p) => p.pokedex_id > 0 && p.sprites.regular && p.types && p.stats && p.resistances)
  .map((p) => ({
    id: p.pokedex_id,
    name: p.name.fr,
    category: p.category,
    sprite: p.sprites.regular as string,
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

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, JSON.stringify(bundle));
console.log(`Wrote ${bundle.length} Pokémon to ${OUTPUT}`);
