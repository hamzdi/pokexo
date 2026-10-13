/** Typed access to the bundled pokedex (generations 1 and 2, built from Tyradex). */
import bundle from '../data/pokemon.json';
import type { PokemonData } from './types.ts';

export const POKEDEX: readonly PokemonData[] = bundle as PokemonData[];

export function findPokemon(id: number): PokemonData | undefined {
  return POKEDEX.find((p) => p.id === id);
}
