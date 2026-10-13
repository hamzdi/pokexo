import { describe, expect, it } from 'vitest';
import { COMBAT_RULES, digitwiseLessOrEqual, fitsRepeated, needsBorrow, pvFor, scaleHp } from '../src/domain/pedagogy.ts';

describe('needsBorrow', () => {
  it('detects a subtraction that crosses a ten', () => {
    // GIVEN 23 - 5 (units 3 < 5)
    // WHEN checked
    // THEN a borrow is required
    expect(needsBorrow(23, 5)).toBe(true);
  });

  it('accepts a subtraction solvable digit by digit', () => {
    // GIVEN 27 - 15
    // WHEN checked
    // THEN no borrow is required
    expect(needsBorrow(27, 15)).toBe(false);
    expect(digitwiseLessOrEqual(15, 27)).toBe(true);
  });
});

describe('scaleHp', () => {
  it('maps real HP onto the PV range of the rules', () => {
    // GIVEN CP period 1 rules (PV between 6 and 9)
    const rules = COMBAT_RULES.CP[1];
    // WHEN scaling a very low and a very high real HP stat
    // THEN the result stays within the range, extremes mapping to the bounds
    expect(scaleHp(10, rules)).toBe(6);
    expect(scaleHp(250, rules)).toBe(9);
    expect(scaleHp(75, rules)).toBeGreaterThanOrEqual(6);
    expect(scaleHp(75, rules)).toBeLessThanOrEqual(9);
  });
});

describe('fitsRepeated', () => {
  it('checks units and tens budgets for repeated subtractions', () => {
    // GIVEN a PV of 35
    // WHEN repeating damages
    // THEN 2 hits of 2 fit (units 4 <= 5), 3 hits of 2 do not (6 > 5), 3 hits of 10 fit (tens 3 <= 3), 4 do not
    expect(fitsRepeated(2, 2, 35)).toBe(true);
    expect(fitsRepeated(2, 3, 35)).toBe(false);
    expect(fitsRepeated(10, 3, 35)).toBe(true);
    expect(fitsRepeated(10, 4, 35)).toBe(false);
  });
});

describe('pvFor', () => {
  it('returns the real HP when the rules allow it and a scaled value otherwise', () => {
    // GIVEN Pikachu's HP (45)
    // WHEN computing PV for CP P3 (real) and CP P1 (scaled)
    // THEN the real value is kept, the scaled one lands in 6-9
    expect(pvFor(45, COMBAT_RULES.CP[3])).toBe(45);
    const scaled = pvFor(45, COMBAT_RULES.CP[1]);
    expect(scaled).toBeGreaterThanOrEqual(6);
    expect(scaled).toBeLessThanOrEqual(9);
  });
});
