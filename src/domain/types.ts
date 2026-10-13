/** Shared domain types for the exercise generators. */

export type Level = 'CP' | 'CE1';
export type Period = 1 | 2 | 3 | 4 | 5;

export const LEVELS: readonly Level[] = ['CP', 'CE1'];
export const PERIODS: readonly Period[] = [1, 2, 3, 4, 5];

/** One Pokémon as stored in the local bundle built from Tyradex. */
export interface PokemonData {
  id: number;
  /** National Pokédex generation (1 to 4 in the bundle). */
  generation: number;
  name: string;
  category: string;
  /** Original Tyradex sprite URL (attribution, rebuilds). */
  spriteUrl: string;
  /** Sprite as an embedded data URI, so sheets never wait on the network. */
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
  /** Legendary or mythical Pokémon, which some teachers prefer to leave out. */
  legendary: boolean;
}

/** Generations shipped in the bundle. */
export const GENERATIONS: readonly number[] = [1, 2, 3, 4];

/** The 18 types in the usual order. */
export const TYPE_ORDER: readonly string[] = [
  'Normal', 'Feu', 'Eau', 'Plante', 'Électrik', 'Glace', 'Combat', 'Poison', 'Sol',
  'Vol', 'Psy', 'Insecte', 'Roche', 'Spectre', 'Dragon', 'Ténèbres', 'Acier', 'Fée',
];
