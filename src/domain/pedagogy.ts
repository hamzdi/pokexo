/**
 * Pedagogical rules for the combat exercise, per level and school period.
 *
 * PV policy: from CP period 3 the sheets use the real Tyradex HP stat and only
 * draw Pokémon whose HP fits the period's number range (59, 79, 100…). CP
 * periods 1 and 2 work below 20, where real HP are impossible, so HP are
 * scaled deterministically into the period range; a given Pokémon then always
 * has the same PV for a given period. CP never requires borrowing: allowed
 * damages include whole tens so that HP ending in 0 or 5 remain playable, and
 * pairs are drawn among Pokémon whose PV make a borrow-free fight possible.
 */
import type { Level, Period } from './types.ts';

export interface CombatRules {
  /** Use the real HP stat (filtered by pvMax) instead of a scaled value. */
  realPv: boolean;
  pvMin: number;
  pvMax: number;
  /** Allowed base damages of a move. */
  damages: readonly number[];
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

const range = (min: number, max: number): number[] => Array.from({ length: max - min + 1 }, (_, i) => min + i);

const base = {
  allowBorrow: false,
  requireBorrow: false,
  superEffective: false,
  potions: false,
  askGap: false,
};

export const COMBAT_RULES: Record<Level, Record<Period, CombatRules>> = {
  CP: {
    1: { ...base, realPv: false, pvMin: 6, pvMax: 9, damages: [1, 2, 3], rounds: 2 },
    2: { ...base, realPv: false, pvMin: 12, pvMax: 20, damages: [2, 3, 4, 5], rounds: 3 },
    3: { ...base, realPv: true, pvMin: 10, pvMax: 59, damages: [...range(1, 9), 10], rounds: 3 },
    4: { ...base, realPv: true, pvMin: 10, pvMax: 79, damages: [...range(1, 9), 10, 20], rounds: 4 },
    5: { ...base, realPv: true, pvMin: 10, pvMax: 99, damages: [...range(2, 9), 10, 20, 30], rounds: 4 },
  },
  CE1: {
    1: { ...base, realPv: true, pvMin: 10, pvMax: 100, damages: range(10, 30), rounds: 3, allowBorrow: true },
    2: { ...base, realPv: true, pvMin: 10, pvMax: 200, damages: range(11, 29), rounds: 4, allowBorrow: true, requireBorrow: true },
    3: { ...base, realPv: true, pvMin: 10, pvMax: 255, damages: range(10, 45), rounds: 4, allowBorrow: true, superEffective: true, askGap: true },
    4: { ...base, realPv: true, pvMin: 10, pvMax: 255, damages: range(15, 60), rounds: 5, allowBorrow: true, superEffective: true, potions: true, askGap: true },
    5: { ...base, realPv: true, pvMin: 10, pvMax: 255, damages: range(20, 90), rounds: 5, allowBorrow: true, superEffective: true, potions: true, askGap: true },
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

/**
 * True when `hits` successive subtractions of `damage` from `pv` never borrow
 * (units and tens budgets checked separately, for PV below 1000).
 */
export function fitsRepeated(damage: number, hits: number, pv: number): boolean {
  if (hits <= 0) return true;
  const units = damage % 10;
  const tens = Math.floor(damage / 10);
  return hits * units <= pv % 10 && hits * tens <= Math.floor(pv / 10);
}

/** Map a real Tyradex HP stat (roughly 20-130 for gen 1-2) onto a PV range. */
export function scaleHp(hp: number, rules: { pvMin: number; pvMax: number }): number {
  const lo = 20;
  const hi = 130;
  const t = Math.min(1, Math.max(0, (hp - lo) / (hi - lo)));
  return rules.pvMin + Math.round(t * (rules.pvMax - rules.pvMin));
}

/** PV printed on a card: the real HP when the period allows it, else a fixed scaled value. */
export function pvFor(hp: number, rules: { realPv: boolean; pvMin: number; pvMax: number }): number {
  return rules.realPv ? hp : scaleHp(hp, rules);
}
