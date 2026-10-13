import { describe, expect, it } from 'vitest';
import { generateMatch } from '../src/domain/match.ts';
import { generateMeasures, MEASURE_RULES } from '../src/domain/measures.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { generateSequence } from '../src/domain/sequence.ts';
import { generateShop, SHOP_RULES } from '../src/domain/shop.ts';
import { generateTeam } from '../src/domain/team.ts';
import { LEVELS, PERIODS } from '../src/domain/types.ts';

const SEEDS = [1, 7, 42, 99, 2026];

describe('generateTeam', () => {
  it('builds two teams of distinct Pokémon whose totals differ and stay in range', () => {
    for (const level of LEVELS) for (const period of PERIODS) for (const seed of SEEDS) {
      // GIVEN a team exercise
      const ex = generateTeam({ level, period, seed, pokedex: POKEDEX });
      const ids = ex.teams.flatMap((t) => t.members.map((m) => m.pokemon.id));
      // WHEN inspecting it
      // THEN members are distinct, totals are sums, totals differ and the winner is the larger one
      expect(new Set(ids).size).toBe(ids.length);
      for (const team of ex.teams) {
        expect(team.members).toHaveLength(ex.rules.size);
        expect(team.total).toBe(team.members.reduce((t, m) => t + m.pv, 0));
        if (ex.rules.realPv) for (const m of team.members) expect(m.pv).toBe(m.pokemon.hp);
      }
      expect(ex.teams[0].total).not.toBe(ex.teams[1].total);
      expect(ex.winner).toBe(ex.teams[0].total > ex.teams[1].total ? 0 : 1);
    }
  });

  it('keeps CP period 1 totals at 10 or less', () => {
    // GIVEN CP P1 exercises
    for (const seed of SEEDS) {
      const ex = generateTeam({ level: 'CP', period: 1, seed, pokedex: POKEDEX });
      // WHEN summing
      // THEN each total is within the numbers of the period
      for (const team of ex.teams) expect(team.total).toBeLessThanOrEqual(10);
    }
  });
});

describe('generateMeasures', () => {
  it('is unavailable in CP P1-P2 and ranks distinct real measures elsewhere', () => {
    expect(MEASURE_RULES.CP[1]).toBeNull();
    expect(() => generateMeasures({ level: 'CP', period: 1, seed: 1, pokedex: POKEDEX })).toThrow();
    for (const [level, period] of [['CP', 3], ['CP', 5], ['CE1', 1], ['CE1', 4]] as const) for (const seed of SEEDS) {
      // GIVEN an available period
      const ex = generateMeasures({ level, period, seed, pokedex: POKEDEX });
      const heights = ex.items.map((i) => i.heightCm);
      // WHEN inspecting
      // THEN heights are real, distinct, under the ceiling, and ranks are a permutation
      expect(ex.items).toHaveLength(ex.rules.count);
      expect(new Set(heights).size).toBe(heights.length);
      for (const item of ex.items) {
        expect(item.heightCm).toBe(item.pokemon.heightCm);
        expect(item.heightCm).toBeLessThanOrEqual(ex.rules.heightMax);
      }
      expect([...ex.heightRanks].sort((a, b) => a - b)).toEqual(ex.items.map((_, i) => i + 1));
      const smallest = ex.items[ex.heightRanks.indexOf(1)];
      expect(smallest?.heightCm).toBe(Math.min(...heights));
      if (ex.rules.weightMax !== null) {
        const weights = ex.items.map((i) => i.weightKg);
        expect(new Set(weights).size).toBe(weights.length);
        expect([...ex.weightRanks].sort((a, b) => a - b)).toEqual(ex.items.map((_, i) => i + 1));
      }
    }
  });
});

describe('generateSequence', () => {
  it('produces arithmetic sequences inside the period range with hidden cells', () => {
    for (const level of LEVELS) for (const period of PERIODS) for (const seed of SEEDS) {
      // GIVEN a sequence exercise
      const ex = generateSequence({ level, period, seed, pokedex: POKEDEX });
      expect(ex.sequences).toHaveLength(ex.rules.count);
      for (const sequence of ex.sequences) {
        // WHEN inspecting the cells
        const ids = sequence.cells.map((c) => c.id);
        // THEN consecutive ids differ by the step, stay within [1, max], first cell is visible, and Pokémon exist
        for (let i = 1; i < ids.length; i++) expect((ids[i] as number) - (ids[i - 1] as number)).toBe(sequence.step);
        expect(ids[0]).toBeGreaterThanOrEqual(1);
        expect(ids[ids.length - 1]).toBeLessThanOrEqual(ex.rules.max);
        expect(sequence.cells[0]?.hidden).toBe(false);
        expect(sequence.cells.filter((c) => c.hidden)).toHaveLength(ex.rules.hidden);
        expect(sequence.cells.every((c) => c.pokemon !== null)).toBe(true);
      }
    }
  });
});

describe('generateShop', () => {
  it('is unavailable before CP P4 and otherwise computes totals and change', () => {
    expect(SHOP_RULES.CP[3]).toBeNull();
    for (const [level, period] of [['CP', 4], ['CP', 5], ['CE1', 1], ['CE1', 3], ['CE1', 5]] as const) for (const seed of SEEDS) {
      // GIVEN a shop exercise
      const ex = generateShop({ level, period, seed, pokedex: POKEDEX });
      expect(ex.problems).toHaveLength(ex.rules.problems);
      for (const problem of ex.problems) {
        // WHEN checking the arithmetic
        const total = problem.lines.reduce((t, l) => t + l.item.price * l.quantity, 0);
        // THEN totals match, stay under the ceiling, and change is banknote minus total when asked
        expect(problem.total).toBe(total);
        expect(problem.total).toBeLessThanOrEqual(ex.rules.maxTotal);
        if (ex.rules.banknotes.length === 0) expect(problem.banknote).toBeNull();
        else {
          expect(problem.banknote).not.toBeNull();
          expect(problem.change).toBe((problem.banknote as number) - problem.total);
          expect(problem.change).toBeGreaterThan(0);
        }
        for (const line of problem.lines) expect(line.quantity).toBeLessThanOrEqual(ex.rules.maxQuantity);
      }
    }
  });
});

describe('generateMatch', () => {
  it('pairs distinct Pokémon with a shuffled right column and short names in CP', () => {
    for (const level of LEVELS) for (const period of PERIODS) for (const seed of SEEDS) {
      // GIVEN a match exercise
      const ex = generateMatch({ level, period, seed, pokedex: POKEDEX });
      // WHEN inspecting
      // THEN names are distinct and short enough, the right order is a non-identity permutation
      expect(ex.left).toHaveLength(ex.rules.pairs);
      expect(new Set(ex.left.map((p) => p.name)).size).toBe(ex.left.length);
      for (const p of ex.left) expect(p.name.length).toBeLessThanOrEqual(ex.rules.maxNameLength);
      expect([...ex.rightOrder].sort((a, b) => a - b)).toEqual(ex.left.map((_, i) => i));
      expect(ex.rightOrder.every((v, i) => v === i)).toBe(false);
    }
  });
});
