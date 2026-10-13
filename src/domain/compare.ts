/**
 * "Qui gagne ?" exercise: several duels where the child compares the PV of two
 * Pokémon (circle the stronger one, write < > =, and from CE1 compute the gap).
 */
import { scaleHp } from './pedagogy.ts';
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface CompareRules {
  pvMin: number;
  pvMax: number;
  duels: number;
  /** Ask for the comparison sign; otherwise the child only circles the stronger. */
  askSign: boolean;
  /** Ask for the PV difference (a subtraction). */
  askGap: boolean;
  /** Allow equal PV so that "=" appears sometimes. */
  allowTie: boolean;
}

export const COMPARE_RULES: Record<Level, Record<Period, CompareRules>> = {
  CP: {
    1: { pvMin: 1, pvMax: 10, duels: 3, askSign: false, askGap: false, allowTie: false },
    2: { pvMin: 1, pvMax: 20, duels: 4, askSign: true, askGap: false, allowTie: true },
    3: { pvMin: 5, pvMax: 39, duels: 4, askSign: true, askGap: false, allowTie: true },
    4: { pvMin: 10, pvMax: 79, duels: 4, askSign: true, askGap: false, allowTie: true },
    5: { pvMin: 10, pvMax: 100, duels: 4, askSign: true, askGap: false, allowTie: true },
  },
  CE1: {
    1: { pvMin: 10, pvMax: 100, duels: 4, askSign: true, askGap: false, allowTie: true },
    2: { pvMin: 10, pvMax: 200, duels: 4, askSign: true, askGap: true, allowTie: true },
    3: { pvMin: 50, pvMax: 500, duels: 4, askSign: true, askGap: true, allowTie: true },
    4: { pvMin: 100, pvMax: 999, duels: 4, askSign: true, askGap: true, allowTie: true },
    5: { pvMin: 100, pvMax: 999, duels: 5, askSign: true, askGap: true, allowTie: true },
  },
};

export type Sign = '<' | '>' | '=';

export interface Duel {
  a: { pokemon: PokemonData; pv: number };
  b: { pokemon: PokemonData; pv: number };
  sign: Sign;
  gap: number;
  /** 0 or 1 for the stronger Pokémon, null when equal. */
  winner: 0 | 1 | null;
}

export interface CompareExercise {
  kind: 'compare';
  level: Level;
  period: Period;
  seed: number;
  rules: CompareRules;
  duels: Duel[];
}

export interface CompareOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

const TIE_PROBABILITY = 0.2;

export function generateCompare({ level, period, seed, pokedex }: CompareOptions): CompareExercise {
  const rules = COMPARE_RULES[level][period];
  const rng = createRng(seedFromString(`compare:${seed}`));
  const pool = rng.shuffle(pokedex).slice(0, rules.duels * 2);
  const duels: Duel[] = [];

  for (let i = 0; i < rules.duels; i++) {
    const pa = pool[i * 2];
    const pb = pool[i * 2 + 1];
    if (!pa || !pb) throw new Error('Pokedex too small for the requested number of duels');
    // Scaled PV keep the real strength order; a small jitter avoids repeated values.
    const pvA = clamp(scaleHp(pa.hp, rules) + rng.int(-2, 2), rules);
    let pvB = clamp(scaleHp(pb.hp, rules) + rng.int(-2, 2), rules);
    if (rules.allowTie && rng.next() < TIE_PROBABILITY) pvB = pvA;
    else if (!rules.allowTie && pvB === pvA) pvB = pvA < rules.pvMax ? pvA + 1 : pvA - 1;

    const sign: Sign = pvA === pvB ? '=' : pvA > pvB ? '>' : '<';
    duels.push({
      a: { pokemon: pa, pv: pvA },
      b: { pokemon: pb, pv: pvB },
      sign,
      gap: Math.abs(pvA - pvB),
      winner: sign === '=' ? null : sign === '>' ? 0 : 1,
    });
  }
  return { kind: 'compare', level, period, seed, rules, duels };
}

function clamp(value: number, rules: CompareRules): number {
  return Math.min(rules.pvMax, Math.max(rules.pvMin, value));
}
