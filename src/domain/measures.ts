/**
 * "Taille et poids": rank Pokémon from the smallest to the tallest (and, in
 * CE1, from the lightest to the heaviest). Real Tyradex measures, in whole
 * centimetres and kilograms, filtered by the period's number range.
 */
import { createRng, seedFromString, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface MeasureRules {
  heightMax: number;
  /** Null when weights are not used at this period. */
  weightMax: number | null;
  count: number;
}

/** Null when the exercise is not available at this period. */
export const MEASURE_RULES: Record<Level, Record<Period, MeasureRules | null>> = {
  CP: {
    1: null,
    2: null,
    3: { heightMax: 59, weightMax: null, count: 4 },
    4: { heightMax: 79, weightMax: null, count: 4 },
    5: { heightMax: 99, weightMax: null, count: 4 },
  },
  CE1: {
    1: { heightMax: 100, weightMax: 100, count: 5 },
    2: { heightMax: 200, weightMax: 200, count: 5 },
    3: { heightMax: 999, weightMax: 999, count: 5 },
    4: { heightMax: 999, weightMax: 999, count: 5 },
    5: { heightMax: 999, weightMax: 999, count: 5 },
  },
};

export interface MeasureItem {
  pokemon: PokemonData;
  heightCm: number;
  weightKg: number;
}

export interface MeasureExercise {
  kind: 'measures';
  level: Level;
  period: Period;
  seed: number;
  rules: MeasureRules;
  items: MeasureItem[];
  /** Rank (1 = smallest) of each item by height, same order as `items`. */
  heightRanks: number[];
  /** Rank (1 = lightest) by weight, empty when weights are not used. */
  weightRanks: number[];
}

export interface MeasureOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

export function weightKgOf(pokemon: PokemonData): number {
  return Math.max(1, Math.round(pokemon.weightKg));
}

function ranks(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  return values.map((v) => sorted.indexOf(v) + 1);
}

/** Pick `count` Pokémon with pairwise distinct heights (and weights when needed). */
function pickDistinct(rng: Rng, candidates: MeasureItem[], count: number, withWeight: boolean): MeasureItem[] {
  const chosen: MeasureItem[] = [];
  for (const item of rng.shuffle(candidates)) {
    const clash = chosen.some((c) => c.heightCm === item.heightCm || (withWeight && c.weightKg === item.weightKg));
    if (!clash) chosen.push(item);
    if (chosen.length === count) break;
  }
  return chosen;
}

export function generateMeasures({ level, period, seed, pokedex }: MeasureOptions): MeasureExercise {
  const rules = MEASURE_RULES[level][period];
  if (!rules) throw new Error(`Taille et poids is not available in ${level} P${period}`);
  const rng = createRng(seedFromString(`measures:${seed}`));
  const withWeight = rules.weightMax !== null;
  const toItem = (pokemon: PokemonData): MeasureItem => ({ pokemon, heightCm: pokemon.heightCm, weightKg: weightKgOf(pokemon) });
  const fitting = pokedex
    .map(toItem)
    .filter((i) => i.heightCm > 0 && i.heightCm <= rules.heightMax && (!withWeight || i.weightKg <= (rules.weightMax as number)));
  let items = pickDistinct(rng, fitting, rules.count, withWeight);
  if (items.length < rules.count) {
    // Narrow filters: complete with the nearest measures above the ceiling.
    const extras = pokedex
      .map(toItem)
      .filter((i) => !fitting.includes(i) && i.heightCm > 0)
      .sort((x, y) => x.heightCm - y.heightCm);
    items = pickDistinct(rng, [...items, ...extras], rules.count, withWeight);
  }
  return {
    kind: 'measures',
    level,
    period,
    seed,
    rules,
    items,
    heightRanks: ranks(items.map((i) => i.heightCm)),
    weightRanks: withWeight ? ranks(items.map((i) => i.weightKg)) : [],
  };
}
