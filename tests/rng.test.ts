import { describe, expect, it } from 'vitest';
import { createRng, seedFromString } from '../src/domain/rng.ts';

describe('createRng', () => {
  it('yields the same sequence for the same seed', () => {
    // GIVEN two generators built from the same seed
    const a = createRng(42);
    const b = createRng(42);
    // WHEN both draw a few integers
    const drawA = [a.int(0, 100), a.int(0, 100), a.int(0, 100)];
    const drawB = [b.int(0, 100), b.int(0, 100), b.int(0, 100)];
    // THEN the sequences are identical
    expect(drawA).toEqual(drawB);
  });

  it('keeps int() within the inclusive bounds', () => {
    // GIVEN a generator
    const rng = createRng(7);
    // WHEN drawing many integers in [3, 5]
    const draws = Array.from({ length: 500 }, () => rng.int(3, 5));
    // THEN every value is 3, 4 or 5 and both bounds are reached
    expect(draws.every((n) => n >= 3 && n <= 5)).toBe(true);
    expect(new Set(draws)).toEqual(new Set([3, 4, 5]));
  });

  it('derives stable seeds from text', () => {
    // GIVEN a text seed
    // WHEN hashed twice
    // THEN the hash is stable and differs from another text
    expect(seedFromString('pikachu')).toBe(seedFromString('pikachu'));
    expect(seedFromString('pikachu')).not.toBe(seedFromString('raichu'));
  });
});
