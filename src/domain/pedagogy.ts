/**
 * Pedagogical rules for the combat exercise, per level and school period.
 *
 * The numbers follow the usual French CP/CE1 progression: CP stays within
 * 10/20/30/80/100 across the five periods and never requires borrowing in a
 * subtraction; CE1 introduces borrowing (P2), doubling for "super efficace"
 * attacks (P3) and potions that add points mid-fight (P4).
 */
import type { Level, Period } from './types.ts';

export interface CombatRules {
  pvMin: number;
  pvMax: number;
  damageMin: number;
  damageMax: number;
  rounds: number;
  /** When false, every subtraction must be solvable digit by digit (no borrow). */
  allowBorrow: boolean;
  /** When true, at least one subtraction must require a borrow. */
  requireBorrow: boolean;
  /** Enable the x2 "super efficace" bonus based on Pokémon types. */
  superEffective: boolean;
  /** Insert one potion (+PV) during the fight. */
  potions: boolean;
  /** Ask for the final PV gap between the two Pokémon. */
  askGap: boolean;
}

const base = {
  allowBorrow: false,
  requireBorrow: false,
  superEffective: false,
  potions: false,
  askGap: false,
};

export const COMBAT_RULES: Record<Level, Record<Period, CombatRules>> = {
  CP: {
    1: { ...base, pvMin: 6, pvMax: 9, damageMin: 1, damageMax: 3, rounds: 2 },
    2: { ...base, pvMin: 12, pvMax: 20, damageMin: 2, damageMax: 5, rounds: 3 },
    3: { ...base, pvMin: 20, pvMax: 39, damageMin: 3, damageMax: 9, rounds: 3 },
    4: { ...base, pvMin: 40, pvMax: 79, damageMin: 2, damageMax: 20, rounds: 4 },
    5: { ...base, pvMin: 60, pvMax: 100, damageMin: 2, damageMax: 30, rounds: 4 },
  },
  CE1: {
    1: { ...base, pvMin: 50, pvMax: 100, damageMin: 10, damageMax: 30, rounds: 3, allowBorrow: true },
    2: {
      ...base,
      pvMin: 60,
      pvMax: 100,
      damageMin: 11,
      damageMax: 29,
      rounds: 4,
      allowBorrow: true,
      requireBorrow: true,
    },
    3: {
      ...base,
      pvMin: 80,
      pvMax: 200,
      damageMin: 10,
      damageMax: 45,
      rounds: 4,
      allowBorrow: true,
      superEffective: true,
      askGap: true,
    },
    4: {
      ...base,
      pvMin: 100,
      pvMax: 300,
      damageMin: 15,
      damageMax: 60,
      rounds: 5,
      allowBorrow: true,
      superEffective: true,
      potions: true,
      askGap: true,
    },
    5: {
      ...base,
      pvMin: 200,
      pvMax: 500,
      damageMin: 20,
      damageMax: 90,
      rounds: 5,
      allowBorrow: true,
      superEffective: true,
      potions: true,
      askGap: true,
    },
  },
};

/** True when every digit of `a` is lower than or equal to the matching digit of `b`. */
export function digitwiseLessOrEqual(a: number, b: number): boolean {
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    if (x % 10 > y % 10) return false;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return true;
}

/** True when `minuend - subtrahend` needs a borrow in column subtraction. */
export function needsBorrow(minuend: number, subtrahend: number): boolean {
  return !digitwiseLessOrEqual(subtrahend, minuend);
}

/** Map a real Tyradex HP stat (roughly 20-130 for gen 1-2) onto the rules' PV range. */
export function scaleHp(hp: number, rules: { pvMin: number; pvMax: number }): number {
  const lo = 20;
  const hi = 130;
  const t = Math.min(1, Math.max(0, (hp - lo) / (hi - lo)));
  return rules.pvMin + Math.round(t * (rules.pvMax - rules.pvMin));
}
