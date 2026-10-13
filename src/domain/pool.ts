/**
 * Pokémon pool filtering: restrict the pokedex to chosen types and optionally
 * drop legendaries. Generators need a dozen distinct Pokémon (duels, grid,
 * dictation), so a too-small selection is padded with other Pokémon.
 */
import type { PokemonData } from './types.ts';

export interface PoolFilter {
  /** Types to keep (a Pokémon matches if any of its types is selected); null keeps all. */
  types: ReadonlySet<string> | null;
  includeLegendary: boolean;
}

export interface PoolResult {
  pool: PokemonData[];
  /** Number of Pokémon matching the filter before padding. */
  matching: number;
  /** Number of Pokémon added outside the filter to reach the minimum. */
  padded: number;
}

export const MIN_POOL = 12;

export function filterPokedex(pokedex: readonly PokemonData[], filter: PoolFilter): PoolResult {
  const allowed = pokedex.filter((p) => filter.includeLegendary || !p.legendary);
  const matches = allowed.filter((p) => filter.types === null || p.types.some((type) => filter.types?.has(type)));
  if (matches.length >= MIN_POOL) return { pool: matches, matching: matches.length, padded: 0 };
  const extras = allowed.filter((p) => !matches.includes(p)).slice(0, MIN_POOL - matches.length);
  return { pool: [...matches, ...extras], matching: matches.length, padded: extras.length };
}
