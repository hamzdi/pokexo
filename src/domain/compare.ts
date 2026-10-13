/**
 * "Qui gagne ?" exercise: several duels where the child compares the PV of two
 * Pokémon (circle the stronger one, write < > =, and from CE1 compute the gap).
 */
import { pvFor } from './pedagogy.ts';
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface CompareRules {
  /** Use the real HP stat (filtered by pvMax) instead of a scaled value. */
  realPv: boolean;
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
    1: { realPv: false, pvMin: 1, pvMax: 10, duels: 3, askSign: false, askGap: false, allowTie: false },
    2: { realPv: false, pvMin: 1, pvMax: 20, duels: 4, askSign: true, askGap: false, allowTie: true },
    3: { realPv: true, pvMin: 10, pvMax: 59, duels: 4, askSign: true, askGap: false, allowTie: true },
    4: { realPv: true, pvMin: 10, pvMax: 79, duels: 4, askSign: true, askGap: false, allowTie: true },
    5: { realPv: true, pvMin: 10, pvMax: 100, duels: 4, askSign: true, askGap: false, allowTie: true },
  },
  CE1: {
    1: { realPv: true, pvMin: 10, pvMax: 100, duels: 4, askSign: true, askGap: false, allowTie: true },
    2: { realPv: true, pvMin: 10, pvMax: 200, duels: 4, askSign: true, askGap: true, allowTie: true },
    3: { realPv: true, pvMin: 10, pvMax: 255, duels: 4, askSign: true, askGap: true, allowTie: true },
    4: { realPv: true, pvMin: 10, pvMax: 255, duels: 4, askSign: true, askGap: true, allowTie: true },
    5: { realPv: true, pvMin: 10, pvMax: 255, duels: 5, askSign: true, askGap: true, allowTie: true },
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

export function generateCompare({ level, period, seed, pokedex }: CompareOptions): CompareExercise {
  const rules = COMPARE_RULES[level][period];
  const rng = createRng(seedFromString(`compare:${seed}`));
  // PV are fixed per Pokémon and period: real HP when the period allows it, else a scaled value.
  const all = pokedex.map((pokemon) => ({ pokemon, pv: pvFor(pokemon.hp, rules) }));
  const fitting = all.filter((c) => c.pv >= rules.pvMin && c.pv <= rules.pvMax);
  // A narrow user filter may leave too few Pokémon under the period ceiling: pad with the nearest PV.
  const needed = rules.duels * 2 + 2;
  const extras = all
    .filter((c) => !fitting.includes(c))
    .sort((x, y) => Math.abs(x.pv - rules.pvMax) - Math.abs(y.pv - rules.pvMax) || x.pokemon.id - y.pokemon.id)
    .slice(0, Math.max(0, needed - fitting.length));
  const pool = rng.shuffle([...fitting, ...extras]);
  const duels: Duel[] = [];
  let cursor = 0;
  const next = () => {
    const c = pool[cursor++];
    if (!c) throw new Error('Pokedex too small for the requested number of duels');
    return c;
  };

  for (let i = 0; i < rules.duels; i++) {
    const a = next();
    let b = next();
    // Without ties allowed, skip opponents with the same PV (the skipped one is simply unused).
    let guard = 0;
    while (!rules.allowTie && b.pv === a.pv && guard++ < 10) b = next();
    const pa = a.pokemon;
    const pb = b.pokemon;
    const pvA = a.pv;
    const pvB = b.pv;

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
