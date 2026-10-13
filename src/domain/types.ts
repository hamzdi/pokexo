/** Shared domain types for the exercise generators. */

export type Level = 'CP' | 'CE1';
export type Period = 1 | 2 | 3 | 4 | 5;

export const LEVELS: readonly Level[] = ['CP', 'CE1'];
export const PERIODS: readonly Period[] = [1, 2, 3, 4, 5];

/** One Pokémon as stored in the local bundle built from Tyradex. */
export interface PokemonData {
  id: number;
  name: string;
  category: string;
  sprite: string;
  types: string[];
  /** Damage multiplier received from each attacking type (0, 0.5, 1 or 2). */
  resistances: Record<string, number>;
  heightCm: number;
  weightKg: number;
  hp: number;
  atk: number;
  speed: number;
  preId: number | null;
  nextId: number | null;
}
