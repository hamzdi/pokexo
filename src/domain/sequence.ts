/**
 * "Suites du Pokédex": consecutive Pokédex numbers (step 1, 2, 5, 10 or 50)
 * with gaps to fill, each cell showing the Pokémon of that number. Numbers
 * stay within the period's range; the Pokémon filter does not apply since
 * the sequence needs every number of the range.
 */
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface SequenceRules {
  max: number;
  steps: readonly number[];
  count: number;
  length: number;
  hidden: number;
}

export const SEQUENCE_RULES: Record<Level, Record<Period, SequenceRules>> = {
  CP: {
    1: { max: 10, steps: [1], count: 2, length: 6, hidden: 2 },
    2: { max: 20, steps: [1], count: 2, length: 6, hidden: 2 },
    3: { max: 59, steps: [1, 2], count: 2, length: 6, hidden: 2 },
    4: { max: 79, steps: [1, 2, 10], count: 3, length: 6, hidden: 2 },
    5: { max: 99, steps: [1, 2, 5, 10], count: 3, length: 6, hidden: 3 },
  },
  CE1: {
    1: { max: 100, steps: [1, 2, 5, 10], count: 3, length: 6, hidden: 3 },
    2: { max: 200, steps: [1, 2, 5, 10], count: 3, length: 6, hidden: 3 },
    3: { max: 493, steps: [1, 2, 5, 10, 50], count: 3, length: 6, hidden: 3 },
    4: { max: 493, steps: [1, 2, 5, 10, 50], count: 3, length: 6, hidden: 3 },
    5: { max: 493, steps: [1, 2, 5, 10, 50], count: 3, length: 6, hidden: 3 },
  },
};

export interface SequenceCell {
  id: number;
  pokemon: PokemonData | null;
  hidden: boolean;
}

export interface Sequence {
  step: number;
  cells: SequenceCell[];
}

export interface SequenceExercise {
  kind: 'sequence';
  level: Level;
  period: Period;
  seed: number;
  rules: SequenceRules;
  sequences: Sequence[];
}

export interface SequenceOptions {
  level: Level;
  period: Period;
  seed: number;
  /** Full pokedex, used to look up the Pokémon of each number. */
  pokedex: readonly PokemonData[];
}

export function generateSequence({ level, period, seed, pokedex }: SequenceOptions): SequenceExercise {
  const rules = SEQUENCE_RULES[level][period];
  const rng = createRng(seedFromString(`sequence:${seed}`));
  const byId = new Map(pokedex.map((p) => [p.id, p]));
  const maxId = Math.min(rules.max, Math.max(...pokedex.map((p) => p.id)));
  const steps = rng.shuffle(rules.steps).slice(0, rules.count);
  while (steps.length < rules.count) steps.push(rng.pick(rules.steps));
  const sequences = steps.map((step) => {
    const maxStart = maxId - step * (rules.length - 1);
    const start = step === 1 ? rng.int(1, Math.max(1, maxStart)) : step * rng.int(1, Math.max(1, Math.floor(maxStart / step)));
    const hiddenIndexes = new Set(rng.shuffle(Array.from({ length: rules.length - 1 }, (_, i) => i + 1)).slice(0, rules.hidden));
    const cells = Array.from({ length: rules.length }, (_, i) => {
      const id = start + i * step;
      return { id, pokemon: byId.get(id) ?? null, hidden: hiddenIndexes.has(i) };
    });
    return { step, cells };
  });
  return { kind: 'sequence', level, period, seed, rules, sequences };
}
