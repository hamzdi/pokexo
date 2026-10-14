/**
 * "Relier image et mot": draw a line from each sprite to its printed name.
 * Reading only, never writing. Short names first, longer ones later.
 */
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface MatchRules {
  pairs: number;
  maxNameLength: number;
}

export const MATCH_RULES: Record<Level, Record<Period, MatchRules>> = {
  CP: {
    1: { pairs: 4, maxNameLength: 6 },
    2: { pairs: 4, maxNameLength: 7 },
    3: { pairs: 5, maxNameLength: 8 },
    4: { pairs: 5, maxNameLength: 10 },
    5: { pairs: 5, maxNameLength: 10 },
  },
  CE1: {
    1: { pairs: 6, maxNameLength: 12 },
    2: { pairs: 6, maxNameLength: 12 },
    3: { pairs: 6, maxNameLength: 12 },
    4: { pairs: 6, maxNameLength: 12 },
    5: { pairs: 6, maxNameLength: 12 },
  },
};

export interface MatchExercise {
  kind: 'match';
  level: Level;
  period: Period;
  seed: number;
  rules: MatchRules;
  /** Left column, in display order. */
  left: PokemonData[];
  /** Indices into `left`, giving the display order of the names on the right. */
  rightOrder: number[];
}

export interface MatchOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

export function generateMatch({ level, period, seed, pokedex }: MatchOptions): MatchExercise {
  const rules = MATCH_RULES[level][period];
  const rng = createRng(seedFromString(`match:${seed}`));
  const short = pokedex.filter((p) => p.name.length <= rules.maxNameLength);
  const source = short.length >= rules.pairs ? short : [...short, ...pokedex.filter((p) => !short.includes(p)).sort((a, b) => a.name.length - b.name.length)];
  const left = rng.shuffle(source).slice(0, rules.pairs);
  let rightOrder = rng.shuffle(left.map((_, i) => i));
  if (rightOrder.every((v, i) => v === i)) rightOrder = [...rightOrder.slice(1), rightOrder[0] as number];
  return { kind: 'match', level, period, seed, rules, left, rightOrder };
}
