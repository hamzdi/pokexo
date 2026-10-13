/**
 * Pokémon pool filtering: restrict the pokedex to chosen types and optionally
 * to legendaries only. Generators need about ten distinct Pokémon (grid,
 * dictation), so a too-small selection is padded with other Pokémon.
 */
import type { PokemonData } from './types.ts';

export interface PoolFilter {
  /** Types to keep (a Pokémon matches if any of its types is selected); null keeps all. */
  types: ReadonlySet<string> | null;
  /** Keep only legendary and mythical Pokémon. */
  legendaryOnly: boolean;
}

export interface PoolResult {
  pool: PokemonData[];
  /** Number of Pokémon matching the filter before padding. */
  matching: number;
  /** Number of Pokémon added outside the filter to reach the minimum. */
  padded: number;
}

export const MIN_POOL = 10;

export function filterPokedex(pokedex: readonly PokemonData[], filter: PoolFilter): PoolResult {
  const allowed = pokedex.filter((p) => !filter.legendaryOnly || p.legendary);
  const matches = allowed.filter((p) => filter.types === null || p.types.some((type) => filter.types?.has(type)));
  if (matches.length >= MIN_POOL) return { pool: matches, matching: matches.length, padded: 0 };
  // Pad first with other allowed Pokémon, then (legendary-only mode) with any other Pokémon.
  const extras = [...allowed, ...pokedex].filter((p, i, arr) => !matches.includes(p) && arr.indexOf(p) === i).slice(0, MIN_POOL - matches.length);
  return { pool: [...matches, ...extras], matching: matches.length, padded: extras.length };
}
