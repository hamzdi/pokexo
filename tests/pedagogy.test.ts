import { describe, expect, it } from 'vitest';
import { COMBAT_RULES, digitwiseLessOrEqual, needsBorrow, scaleHp } from '../src/domain/pedagogy.ts';

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
