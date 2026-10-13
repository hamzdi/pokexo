import { describe, expect, it } from 'vitest';
import { generateCombat, type CombatExercise } from '../src/domain/combat.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { LEVELS, PERIODS, type Level, type Period } from '../src/domain/types.ts';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7 + 1);

function every(level: Level, period: Period, check: (ex: CombatExercise) => void): void {
  for (const seed of SEEDS) check(generateCombat({ level, period, seed, pokedex: POKEDEX }));
}

describe('generateCombat', () => {
  it('is deterministic for a given seed', () => {
    // GIVEN the same parameters twice
    const first = generateCombat({ level: 'CE1', period: 3, seed: 123, pokedex: POKEDEX });
    const second = generateCombat({ level: 'CE1', period: 3, seed: 123, pokedex: POKEDEX });
    // WHEN compared
    // THEN both exercises are identical
    expect(second).toEqual(first);
  });

  it('never lets PV go negative and stops after a KO, for every level and period', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        // GIVEN exercises for this level and period across many seeds
        every(level, period, (ex) => {
          // WHEN walking through the rows
          const koIndex = ex.rows.findIndex((row) => row.kind === 'attack' && row.pvAfter === 0);
          // THEN PV are never negative and no row follows a KO
          for (const row of ex.rows) expect(row.pvAfter).toBeGreaterThanOrEqual(0);
          if (koIndex >= 0) expect(koIndex).toBe(ex.rows.length - 1);
          expect(ex.rows.length).toBeGreaterThanOrEqual(2);
        });
      }
    }
  });

  it('keeps every CP subtraction free of borrowing', () => {
    for (const period of PERIODS) {
      // GIVEN CP exercises for this period
      every('CP', period, (ex) => {
        // WHEN inspecting each attack
        for (const row of ex.rows) {
          if (row.kind !== 'attack') continue;
          // THEN the subtraction is solvable digit by digit and PV stay within the period range
          expect(row.borrow).toBe(false);
          expect(row.damage).toBeLessThanOrEqual(row.pvBefore);
        }
        for (const fighter of ex.fighters) {
          expect(fighter.pv).toBeGreaterThanOrEqual(ex.rules.pvMin);
          expect(fighter.pv).toBeLessThanOrEqual(ex.rules.pvMax);
        }
      });
    }
  });

  it('uses only neutral type match-ups before the x2 bonus is taught', () => {
    // GIVEN CE1 period 1 (no super effective rule)
    every('CE1', 1, (ex) => {
      // WHEN inspecting attack rows
      // THEN no multiplier is applied
      for (const row of ex.rows) if (row.kind === 'attack') expect(row.multiplier).toBe(1);
    });
  });

  it('includes at least one borrow in CE1 period 2', () => {
    // GIVEN CE1 period 2 exercises
    every('CE1', 2, (ex) => {
      // WHEN looking for a column subtraction with a borrow
      // THEN at least one attack requires it
      expect(ex.rows.some((row) => row.kind === 'attack' && row.borrow)).toBe(true);
    });
  });

  it('doubles the damage on super effective attacks from CE1 period 3', () => {
    // GIVEN CE1 period 3 exercises
    let doubled = 0;
    every('CE1', 3, (ex) => {
      for (const row of ex.rows) {
        if (row.kind !== 'attack') continue;
        // WHEN the multiplier is 2
        // THEN the damage is exactly twice the base damage
        if (row.multiplier === 2) {
          doubled++;
          expect(row.damage).toBe(row.baseDamage * 2);
        }
      }
    });
    expect(doubled).toBeGreaterThan(0);
  });

  it('adds exactly one potion in CE1 periods 4 and 5 and accounts for it in the final PV', () => {
    for (const period of [4, 5] as const) {
      // GIVEN CE1 exercises with potions enabled
      every('CE1', period, (ex) => {
        // WHEN counting potion rows (none if the fight ended before the potion round)
        const potions = ex.rows.filter((row) => row.kind === 'potion');
        // THEN at most one potion exists and the final PV match the last rows
        expect(potions.length).toBeLessThanOrEqual(1);
        const expected: [number, number] = [ex.fighters[0].pv, ex.fighters[1].pv];
        for (const row of ex.rows) {
          if (row.kind === 'attack') expected[row.defender] = row.pvAfter;
          else expected[row.fighter] = row.pvAfter;
        }
        expect(ex.finalPv).toEqual(expected);
      });
    }
  });

  it('names the winner consistently with the final PV', () => {
    // GIVEN any exercise
    every('CE1', 5, (ex) => {
      // WHEN comparing final PV
      const [a, b] = ex.finalPv;
      // THEN the winner is the fighter with more PV, or null on a tie
      if (a === b) expect(ex.winner).toBeNull();
      else expect(ex.winner).toBe(a > b ? 0 : 1);
    });
  });
});

describe('generateCombat moves', () => {
  it('uses only the two moves printed on the attacker card', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        // GIVEN exercises for this level and period
        every(level, period, (ex) => {
          // WHEN inspecting each attack
          for (const row of ex.rows) {
            if (row.kind !== 'attack') continue;
            const moves = ex.fighters[row.attacker].moves;
            // THEN the move name and base damage match one printed move
            expect(moves.some((move) => move.name === row.attackName && move.damage === row.baseDamage)).toBe(true);
          }
          for (const fighter of ex.fighters) {
            expect(fighter.moves[0].damage).not.toBe(fighter.moves[1].damage);
            for (const move of fighter.moves) expect(ex.rules.damages).toContain(move.damage);
            if (ex.rules.realPv) expect(fighter.pv).toBe(fighter.pokemon.hp);
          }
        });
      }
    }
  });
});

describe('generateCombat PV policy', () => {
  it('uses real HP from CP period 3, within the period ceiling', () => {
    for (const [level, period] of [['CP', 3], ['CP', 4], ['CP', 5], ['CE1', 1], ['CE1', 5]] as const) {
      // GIVEN exercises of a period that uses real PV
      every(level, period, (ex) => {
        // WHEN inspecting the cards
        // THEN PV equal the Tyradex HP stat and respect the ceiling
        for (const fighter of ex.fighters) {
          expect(fighter.pv).toBe(fighter.pokemon.hp);
          expect(fighter.pv).toBeLessThanOrEqual(ex.rules.pvMax);
        }
      });
    }
  });

  it('gives a Pokémon the same PV on every CP period 2 sheet', () => {
    // GIVEN many CP period 2 exercises
    const seen = new Map<number, number>();
    every('CP', 2, (ex) => {
      for (const fighter of ex.fighters) {
        // WHEN the same Pokémon appears again
        const previous = seen.get(fighter.pokemon.id);
        // THEN its PV are unchanged
        if (previous !== undefined) expect(fighter.pv).toBe(previous);
        seen.set(fighter.pokemon.id, fighter.pv);
      }
    });
  });
});
