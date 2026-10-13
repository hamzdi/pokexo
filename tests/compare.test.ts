import { describe, expect, it } from 'vitest';
import { generateCompare } from '../src/domain/compare.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { LEVELS, PERIODS } from '../src/domain/types.ts';

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 3 + 1);

describe('generateCompare', () => {
  it('is deterministic for a given seed', () => {
    // GIVEN the same parameters twice
    const first = generateCompare({ level: 'CP', period: 2, seed: 5, pokedex: POKEDEX });
    const second = generateCompare({ level: 'CP', period: 2, seed: 5, pokedex: POKEDEX });
    // WHEN compared
    // THEN both exercises are identical
    expect(second).toEqual(first);
  });

  it('keeps PV in range, uses distinct Pokémon and consistent signs, for every level and period', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        for (const seed of SEEDS) {
          // GIVEN an exercise
          const ex = generateCompare({ level, period, seed, pokedex: POKEDEX });
          const ids = ex.duels.flatMap((duel) => [duel.a.pokemon.id, duel.b.pokemon.id]);
          // WHEN inspecting the duels
          // THEN the Pokémon are distinct, PV within range and sign/gap/winner agree
          expect(new Set(ids).size).toBe(ids.length);
          expect(ex.duels).toHaveLength(ex.rules.duels);
          for (const duel of ex.duels) {
            for (const pv of [duel.a.pv, duel.b.pv]) {
              expect(pv).toBeGreaterThanOrEqual(ex.rules.pvMin);
              expect(pv).toBeLessThanOrEqual(ex.rules.pvMax);
            }
            expect(duel.gap).toBe(Math.abs(duel.a.pv - duel.b.pv));
            if (duel.a.pv === duel.b.pv) {
              expect(duel.sign).toBe('=');
              expect(duel.winner).toBeNull();
            } else {
              expect(duel.sign).toBe(duel.a.pv > duel.b.pv ? '>' : '<');
              expect(duel.winner).toBe(duel.a.pv > duel.b.pv ? 0 : 1);
            }
          }
        }
      }
    }
  });

  it('never produces a tie in CP period 1', () => {
    // GIVEN CP period 1 exercises (ties not allowed)
    for (const seed of SEEDS) {
      const ex = generateCompare({ level: 'CP', period: 1, seed, pokedex: POKEDEX });
      // WHEN inspecting the duels
      // THEN no duel is equal
      for (const duel of ex.duels) expect(duel.sign).not.toBe('=');
    }
  });

  it('produces ties sometimes when allowed', () => {
    // GIVEN many CE1 period 1 exercises
    let ties = 0;
    for (const seed of SEEDS) {
      const ex = generateCompare({ level: 'CE1', period: 1, seed, pokedex: POKEDEX });
      ties += ex.duels.filter((duel) => duel.sign === '=').length;
    }
    // WHEN counting equal duels
    // THEN at least one "=" appears
    expect(ties).toBeGreaterThan(0);
  });
});
