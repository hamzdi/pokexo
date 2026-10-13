/**
 * "Manche mystère": a combat whose remaining PV are all printed; the child
 * finds the hidden damage of some attacks (a subtraction with a gap).
 */
import { generateCombat, type CombatExercise, type CombatOptions } from './combat.ts';
import { createRng, seedFromString } from './rng.ts';

export interface MysteryExercise {
  kind: 'mystery';
  combat: CombatExercise;
  /** Round numbers whose damage is hidden. */
  hiddenRounds: number[];
}

export function generateMystery(options: CombatOptions): MysteryExercise {
  const rng = createRng(seedFromString(`mystery:${options.seed}`));
  // A different fight than the plain combat exercise with the same sheet number.
  const combat = { ...generateCombat({ ...options, seed: rng.int(0, 99999) }), seed: options.seed };
  const candidates = combat.rows.filter((row) => row.kind === 'attack' && row.multiplier === 1).map((row) => row.round);
  const hiddenCount = Math.max(1, Math.ceil(candidates.length / 2));
  const hiddenRounds = rng.shuffle(candidates).slice(0, hiddenCount).sort((a, b) => a - b);
  return { kind: 'mystery', combat, hiddenRounds };
}
