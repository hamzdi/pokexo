/**
 * Combat exercise generator.
 *
 * Two Pokémon fight over a few rounds, each one carrying two moves with fixed
 * damage printed on its card. The sheet prints each round's move and the child
 * computes the defender's remaining PV. The generator is a pure function of
 * (level, period, seed, pokedex) and also returns the answer key.
 */
import { attackNamesFor } from './attacks.ts';
import { COMBAT_RULES, needsBorrow, scaleHp, type CombatRules } from './pedagogy.ts';
import { createRng, seedFromString, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export type FighterIndex = 0 | 1;

export interface Move {
  name: string;
  damage: number;
}

export interface Fighter {
  pokemon: PokemonData;
  pv: number;
  type: string;
  moves: [Move, Move];
}

export interface AttackRow {
  kind: 'attack';
  round: number;
  attacker: FighterIndex;
  defender: FighterIndex;
  attackName: string;
  baseDamage: number;
  multiplier: 1 | 2;
  damage: number;
  pvBefore: number;
  pvAfter: number;
  borrow: boolean;
}

export interface PotionRow {
  kind: 'potion';
  round: number;
  fighter: FighterIndex;
  amount: number;
  pvBefore: number;
  pvAfter: number;
}

export type CombatRow = AttackRow | PotionRow;

export interface CombatExercise {
  kind: 'combat';
  level: Level;
  period: Period;
  seed: number;
  rules: CombatRules;
  fighters: [Fighter, Fighter];
  /** Index of the Pokémon attacking in round 1 (the faster one). */
  first: FighterIndex;
  rows: CombatRow[];
  finalPv: [number, number];
  /** Index of the winner, or null for a draw. */
  winner: FighterIndex | null;
}

export interface CombatOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

const POTION_AMOUNTS = [10, 20, 30, 50];
const PAIR_ATTEMPTS = 80;
const PLAN_ATTEMPTS = 30;

function other(index: FighterIndex): FighterIndex {
  return index === 0 ? 1 : 0;
}

function multiplierAgainst(attacker: PokemonData, defender: PokemonData): number {
  const type = attacker.types[0] ?? 'Normal';
  return defender.resistances[type] ?? 1;
}

/**
 * Pick two Pokémon whose type interaction suits the level: strictly neutral
 * when the x2 bonus is not taught yet, otherwise at least one x2 direction and
 * no confusing x0.5 / x0 direction.
 */
function pickPair(rng: Rng, pokedex: readonly PokemonData[], rules: CombatRules): [PokemonData, PokemonData] {
  let fallback: [PokemonData, PokemonData] | null = null;
  for (let attempt = 0; attempt < PAIR_ATTEMPTS; attempt++) {
    const a = rng.pick(pokedex);
    const b = rng.pick(pokedex);
    if (a.id === b.id) continue;
    fallback ??= [a, b];
    const ab = multiplierAgainst(a, b);
    const ba = multiplierAgainst(b, a);
    if (!rules.superEffective && ab === 1 && ba === 1) return [a, b];
    if (rules.superEffective && (ab === 2 || ba === 2) && ab >= 1 && ba >= 1) return [a, b];
  }
  if (!fallback) throw new Error('Pokedex must contain at least two Pokémon');
  return fallback;
}

/**
 * Two moves with fixed damage. Without borrowing (CP), the first move is kept
 * small enough that `hits` of it never cross a ten, which guarantees that at
 * least one move always fits; from period 4 the second move is a round number
 * of tens so that larger damage stays borrow-free too.
 */
function pickMoves(rng: Rng, type: string, hits: number, rules: CombatRules): [Move, Move] {
  const [nameA, nameB] = attackNamesFor(type);
  if (rules.allowBorrow) {
    const a = rng.int(rules.damageMin, rules.damageMax);
    let b = rng.int(rules.damageMin, rules.damageMax);
    if (b === a) b = a < rules.damageMax ? a + 1 : a - 1;
    return [
      { name: nameA, damage: a },
      { name: nameB, damage: b },
    ];
  }
  const smallMax = Math.max(rules.damageMin, Math.min(rules.damageMax, Math.floor(9 / Math.max(1, hits))));
  const small = rng.int(rules.damageMin, smallMax);
  let big: number;
  if (rules.damageMax >= 10) {
    const tens = Math.floor(rules.damageMax / 10);
    big = rng.int(1, tens) * 10;
  } else {
    big = rng.int(small, rules.damageMax);
    if (big === small) big = small < rules.damageMax ? small + 1 : Math.max(rules.damageMin, small - 1);
  }
  return [
    { name: nameA, damage: small },
    { name: nameB, damage: big },
  ];
}

/**
 * Nudge a PV total so that `hits` no-borrow subtractions of the small move are
 * always possible: the units digit must leave room for it repeated `hits` times.
 */
function adjustPvForNoBorrow(rng: Rng, pv: number, hits: number, smallMove: number, rules: CombatRules): number {
  if (rules.allowBorrow) return pv;
  const unitsNeeded = Math.min(9, hits * smallMove);
  if (pv % 10 >= unitsNeeded) return pv;
  let adjusted = Math.floor(pv / 10) * 10 + rng.int(unitsNeeded, 9);
  if (adjusted > rules.pvMax) adjusted -= 10;
  if (adjusted < rules.pvMin) adjusted += 10;
  return adjusted;
}

/**
 * Choose which move the attacker uses. Without borrowing, a move must fit digit
 * by digit and leave enough units for the remaining hits of the small move; a
 * fighter's first hit never knocks the defender out so the fight has substance.
 */
function pickMove(
  rng: Rng,
  attacker: Fighter,
  pvBefore: number,
  multiplier: 1 | 2,
  hitsLeftAfter: number,
  firstHit: boolean,
  rules: CombatRules,
): Move {
  const small = attacker.moves[0].damage;
  const fits = (move: Move): boolean => {
    const effective = move.damage * multiplier;
    if (rules.allowBorrow) return true;
    if (effective > pvBefore || needsBorrow(pvBefore, effective)) return false;
    return (pvBefore - effective) % 10 >= hitsLeftAfter * small;
  };
  const fitting = attacker.moves.filter(fits);
  const gentle = fitting.filter((move) => move.damage * multiplier < pvBefore);
  if (firstHit && gentle.length > 0) return rng.pick(gentle);
  if (fitting.length > 0) return rng.pick(fitting);
  // Should not happen thanks to pickMoves/adjustPvForNoBorrow; fall back to the small move.
  return attacker.moves[0];
}

function planRows(rng: Rng, fighters: [Fighter, Fighter], first: FighterIndex, rules: CombatRules): CombatRow[] {
  const pv: [number, number] = [fighters[0].pv, fighters[1].pv];
  const rows: CombatRow[] = [];
  let attacker = first;
  const potionRound = rules.potions && rules.rounds >= 3 ? rng.int(2, rules.rounds - 1) : -1;
  const hitsLeft: [number, number] = [0, 0];
  for (let round = 1; round <= rules.rounds; round++) hitsLeft[round % 2 === 1 ? other(first) : first]++;
  const hitsTaken: [number, number] = [0, 0];

  for (let round = 1; round <= rules.rounds; round++) {
    const defender = other(attacker);
    if (round === potionRound) {
      const amount = rng.pick(POTION_AMOUNTS);
      const before = pv[defender];
      pv[defender] = before + amount;
      rows.push({ kind: 'potion', round, fighter: defender, amount, pvBefore: before, pvAfter: pv[defender] });
    }
    const multiplier: 1 | 2 =
      rules.superEffective && multiplierAgainst(fighters[attacker].pokemon, fighters[defender].pokemon) === 2 ? 2 : 1;
    const pvBefore = pv[defender];
    hitsLeft[defender]--;
    const move = pickMove(rng, fighters[attacker], pvBefore, multiplier, hitsLeft[defender], hitsTaken[defender] === 0, rules);
    hitsTaken[defender]++;
    const damage = move.damage * multiplier;
    const pvAfter = Math.max(0, pvBefore - damage);
    rows.push({
      kind: 'attack',
      round,
      attacker,
      defender,
      attackName: move.name,
      baseDamage: move.damage,
      multiplier,
      damage,
      pvBefore,
      pvAfter,
      borrow: needsBorrow(pvBefore, Math.min(damage, pvBefore)),
    });
    pv[defender] = pvAfter;
    if (pvAfter === 0) break;
    attacker = defender;
  }
  return rows;
}

function finalState(fighters: [Fighter, Fighter], rows: CombatRow[]): Pick<CombatExercise, 'finalPv' | 'winner'> {
  const finalPv: [number, number] = [fighters[0].pv, fighters[1].pv];
  for (const row of rows) {
    if (row.kind === 'attack') finalPv[row.defender] = row.pvAfter;
    else finalPv[row.fighter] = row.pvAfter;
  }
  const winner: FighterIndex | null = finalPv[0] === finalPv[1] ? null : finalPv[0] > finalPv[1] ? 0 : 1;
  return { finalPv, winner };
}

export function generateCombat({ level, period, seed, pokedex }: CombatOptions): CombatExercise {
  const rules = COMBAT_RULES[level][period];
  const rng = createRng(seedFromString(`combat:${seed}`));
  const [a, b] = pickPair(rng.fork('pair'), pokedex, rules);

  // The faster Pokémon attacks first and lands ceil(rounds / 2) hits; the other floor(rounds / 2).
  const first: FighterIndex = a.speed >= b.speed ? 0 : 1;
  const hitsOnA = first === 0 ? Math.floor(rules.rounds / 2) : Math.ceil(rules.rounds / 2);
  const hitsOnB = rules.rounds - hitsOnA;
  const movesRng = rng.fork('moves');
  const typeA = a.types[0] ?? 'Normal';
  const typeB = b.types[0] ?? 'Normal';
  const movesA = pickMoves(movesRng, typeA, hitsOnB, rules);
  const movesB = pickMoves(movesRng, typeB, hitsOnA, rules);
  // A's PV must absorb B's small move hitsOnA times, and vice versa.
  const pvRng = rng.fork('pv');
  const fighters: [Fighter, Fighter] = [
    { pokemon: a, type: typeA, moves: movesA, pv: adjustPvForNoBorrow(pvRng, scaleHp(a.hp, rules), hitsOnA, movesB[0].damage, rules) },
    { pokemon: b, type: typeB, moves: movesB, pv: adjustPvForNoBorrow(pvRng, scaleHp(b.hp, rules), hitsOnB, movesA[0].damage, rules) },
  ];

  let rows = planRows(rng.fork('rows:0'), fighters, first, rules);
  if (rules.requireBorrow) {
    for (let attempt = 1; attempt < PLAN_ATTEMPTS; attempt++) {
      if (rows.some((row) => row.kind === 'attack' && row.borrow)) break;
      rows = planRows(rng.fork(`rows:${attempt}`), fighters, first, rules);
    }
  }

  return { kind: 'combat', level, period, seed, rules, fighters, first, rows, ...finalState(fighters, rows) };
}
