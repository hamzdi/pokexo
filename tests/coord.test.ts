import { describe, expect, it } from 'vitest';
import { cellLabel, generateCoord } from '../src/domain/coord.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';

describe('generateCoord', () => {
  it('builds a 5x5 grid with 4 Pokémon in CP and a 6x6 grid with 5 Pokémon plus 2 cells to mark in CE1', () => {
    // GIVEN one exercise per level
    const cp = generateCoord({ level: 'CP', period: 3, seed: 1, pokedex: POKEDEX });
    const ce1 = generateCoord({ level: 'CE1', period: 3, seed: 1, pokedex: POKEDEX });
    // WHEN inspected
    // THEN sizes and counts match the level
    expect(cp.cols).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(cp.placed).toHaveLength(4);
    expect(cp.toMark).toHaveLength(0);
    expect(ce1.cols).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(ce1.placed).toHaveLength(5);
    expect(ce1.toMark).toHaveLength(2);
  });

  it('never puts two things in the same cell', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      // GIVEN a CE1 exercise
      const ex = generateCoord({ level: 'CE1', period: 1, seed, pokedex: POKEDEX });
      // WHEN collecting all used cells
      const cells = [...ex.placed, ...ex.toMark].map((c) => cellLabel(c.col, c.row));
      // THEN they are all distinct and inside the grid
      expect(new Set(cells).size).toBe(cells.length);
      for (const c of [...ex.placed, ...ex.toMark]) {
        expect(ex.cols).toContain(c.col);
        expect(ex.rows).toContain(c.row);
      }
    }
  });
});
