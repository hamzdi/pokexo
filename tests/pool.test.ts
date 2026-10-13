import { describe, expect, it } from 'vitest';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { filterPokedex, MIN_POOL } from '../src/domain/pool.ts';

describe('filterPokedex', () => {
  it('keeps everything when no filter is set', () => {
    // GIVEN no type restriction and legendaries allowed
    // WHEN filtering
    const result = filterPokedex(POKEDEX, { types: null, includeLegendary: true });
    // THEN the pool is the whole pokedex
    expect(result.pool).toHaveLength(POKEDEX.length);
    expect(result.padded).toBe(0);
  });

  it('drops legendaries when asked', () => {
    // GIVEN legendaries excluded
    const result = filterPokedex(POKEDEX, { types: null, includeLegendary: false });
    // WHEN inspecting the pool
    // THEN no legendary remains and some were removed
    expect(result.pool.some((p) => p.legendary)).toBe(false);
    expect(result.pool.length).toBeLessThan(POKEDEX.length);
    expect(POKEDEX.filter((p) => p.legendary).map((p) => p.id)).toContain(150);
  });

  it('keeps Pokémon matching any selected type', () => {
    // GIVEN only Feu selected
    const result = filterPokedex(POKEDEX, { types: new Set(['Feu']), includeLegendary: true });
    // WHEN inspecting the pool
    // THEN every Pokémon has the Feu type and no padding was needed
    expect(result.pool.every((p) => p.types.includes('Feu'))).toBe(true);
    expect(result.padded).toBe(0);
  });

  it('pads a too-small selection up to the minimum', () => {
    // GIVEN a rare type (Dragon has only a handful of Pokémon in gen 1-2)
    const result = filterPokedex(POKEDEX, { types: new Set(['Dragon']), includeLegendary: false });
    // WHEN inspecting the pool
    // THEN the matching ones come first and extras fill up to MIN_POOL
    expect(result.matching).toBeLessThan(MIN_POOL);
    expect(result.pool).toHaveLength(MIN_POOL);
    expect(result.padded).toBe(MIN_POOL - result.matching);
    expect(result.pool.slice(0, result.matching).every((p) => p.types.includes('Dragon'))).toBe(true);
  });
});
