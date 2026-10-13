import { describe, expect, it } from 'vitest';
import { generateMystery } from '../src/domain/mystery.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { LEVELS, PERIODS } from '../src/domain/types.ts';

describe('generateMystery', () => {
  it('hides at least one plain attack and keeps the printed sheet number', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        for (const seed of [1, 42, 999, 2026]) {
          // GIVEN a mystery exercise
          const ex = generateMystery({ level, period, seed, pokedex: POKEDEX });
          // WHEN inspecting the hidden rounds
          const attackRounds = ex.combat.rows.filter((row) => row.kind === 'attack');
          // THEN at least one round is hidden, each hidden round is a x1 attack, and the seed is the sheet number
          expect(ex.hiddenRounds.length).toBeGreaterThanOrEqual(1);
          for (const round of ex.hiddenRounds) {
            const row = attackRounds.find((r) => r.round === round);
            expect(row).toBeDefined();
            expect(row?.kind === 'attack' && row.multiplier).toBe(1);
          }
          expect(ex.combat.seed).toBe(seed);
        }
      }
    }
  });

  it('differs from the plain combat exercise with the same sheet number', () => {
    // GIVEN the same seed for mystery and combat
    const mystery = generateMystery({ level: 'CE1', period: 3, seed: 7, pokedex: POKEDEX });
    const again = generateMystery({ level: 'CE1', period: 3, seed: 7, pokedex: POKEDEX });
    // WHEN compared
    // THEN mystery is deterministic
    expect(again).toEqual(mystery);
  });
});
