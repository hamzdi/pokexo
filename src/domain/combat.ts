/**
 * Combat exercise generator.
 *
 * Two Pokémon fight over a few rounds, each one carrying two moves with fixed
 * damage printed on its card. The sheet prints each round's move and the child
 * computes the defender's remaining PV. The generator is a pure function of
 * (level, period, seed, pokedex) and also returns the answer key.
 */
import { attackNamesFor } from './attacks.ts';
import { COMBAT_RULES, fitsRepeated, needsBorrow, pvFor, type CombatRules } from './pedagogy.ts';
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
const PAIR_ATTEMPTS = 120;
const PLAN_ATTEMPTS = 30;

function other(index: FighterIndex): FighterIndex {
  return index === 0 ? 1 : 0;
}

function multiplierAgainst(attacker: PokemonData, defender: PokemonData): number {
  const type = attacker.types[0] ?? 'Normal';
  return defender.resistances[type] ?? 1;
}

interface Candidate {
  pokemon: PokemonData;
  pv: number;
}

/** Hits received by each side: the faster Pokémon attacks first and lands ceil(rounds / 2) hits. */
function hitsOn(a: PokemonData, b: PokemonData, rules: CombatRules): [number, number] {
  const first: FighterIndex = a.speed >= b.speed ? 0 : 1;
  const onA = first === 0 ? Math.floor(rules.rounds / 2) : Math.ceil(rules.rounds / 2);
  return [onA, rules.rounds - onA];
}

/** Base damages the attacker can repeat `hits` times on `pv` without ever borrowing. */
function repeatableDamages(pv: number, hits: number, rules: CombatRules): number[] {
  if (rules.allowBorrow) return [...rules.damages];
  return rules.damages.filter((d) => fitsRepeated(d, hits, pv));
}

/** Worst-case multiplier a move can carry at this level. */
function maxMultiplier(rules: CombatRules): number {
  return rules.superEffective ? 2 : 1;
}

/** Damages that do not knock `pv` out in a single hit, even when doubled. */
function gentleDamages(pv: number, rules: CombatRules): number[] {
  return rules.damages.filter((d) => d * maxMultiplier(rules) < pv);
}

/** A fight is feasible when each side owns a move it can land all its hits with, and no first hit is a KO. */
function feasible(a: Candidate, b: Candidate, rules: CombatRules): boolean {
  const [onA, onB] = hitsOn(a.pokemon, b.pokemon, rules);
  if (gentleDamages(a.pv, rules).length === 0 || gentleDamages(b.pv, rules).length === 0) return false;
  if (rules.allowBorrow) return true;
  return repeatableDamages(b.pv, onB, rules).length > 0 && repeatableDamages(a.pv, onA, rules).length > 0;
}

function typeMatch(a: PokemonData, b: PokemonData, rules: CombatRules): boolean {
  const ab = multiplierAgainst(a, b);
  const ba = multiplierAgainst(b, a);
  if (!rules.superEffective) return ab === 1 && ba === 1;
  return (ab === 2 || ba === 2) && ab >= 1 && ba >= 1;
}

/**
 * Pick two Pokémon whose PV fit the period and whose type interaction suits the
 * level: strictly neutral when the x2 bonus is not taught yet, otherwise at
 * least one x2 direction and no confusing x0.5 / x0 direction. Random draws
 * first, then an exhaustive pass so that a filtered pool still yields a fight.
 */
function pickPair(rng: Rng, pokedex: readonly PokemonData[], rules: CombatRules): [Candidate, Candidate] {
  const all: Candidate[] = pokedex.map((pokemon) => ({ pokemon, pv: pvFor(pokemon.hp, rules) }));
  let candidates = all.filter((c) => c.pv >= rules.pvMin && c.pv <= rules.pvMax);
  if (candidates.length < 4) {
    // A narrow user filter may leave too few Pokémon under the ceiling: pad with the nearest PV.
    const extras = all
      .filter((c) => !candidates.includes(c))
      .sort((x, y) => Math.abs(x.pv - rules.pvMax) - Math.abs(y.pv - rules.pvMax) || x.pokemon.id - y.pokemon.id);
    candidates = [...candidates, ...extras.slice(0, 4 - candidates.length)];
  }
  if (candidates.length < 2) throw new Error('Not enough Pokémon with suitable PV');

  let fallback: [Candidate, Candidate] | null = null;
  for (let attempt = 0; attempt < PAIR_ATTEMPTS; attempt++) {
    const a = rng.pick(candidates);
    const b = rng.pick(candidates);
    if (a.pokemon.id === b.pokemon.id || !feasible(a, b, rules)) continue;
    fallback ??= [a, b];
    if (typeMatch(a.pokemon, b.pokemon, rules)) return [a, b];
  }
  if (fallback) return fallback;

  const shuffled = rng.shuffle(candidates);
  for (const a of shuffled) {
    for (const b of shuffled) {
      if (a.pokemon.id !== b.pokemon.id && feasible(a, b, rules)) return [a, b];
    }
  }
  throw new Error('No feasible pair of Pokémon for these rules');
}

/**
 * Two distinct moves for an attacker facing `defenderPv` over `hits` hits. The
 * first move is always repeatable without borrowing (CP); the second is any
 * other allowed damage, preferring one that fits at least once.
 */
function pickMoves(rng: Rng, type: string, defenderPv: number, hits: number, rules: CombatRules): [Move, Move] {
  const [nameA, nameB] = attackNamesFor(type);
  const gentle = gentleDamages(defenderPv, rules);
  const repeatable = repeatableDamages(defenderPv, hits, rules).filter((d) => gentle.includes(d));
  const small = rng.pick(repeatable.length > 0 ? repeatable : gentle.length > 0 ? gentle : rules.damages);
  const others = rules.damages.filter((d) => d !== small);
  let preferred = others.filter((d) => rules.allowBorrow || fitsRepeated(d, 1, defenderPv));
  // When a borrow is required, favour a move whose units exceed the defender's units.
  if (rules.requireBorrow) {
    const borrowing = preferred.filter((d) => d % 10 > defenderPv % 10);
    if (borrowing.length > 0) preferred = borrowing;
  }
  const big = others.length === 0 ? small : rng.pick(preferred.length > 0 ? preferred : others);
  return [
    { name: nameA, damage: small },
    { name: nameB, damage: big },
  ];
}

/**
 * Choose which move the attacker uses. Without borrowing, a move must fit digit
 * by digit and leave room for the remaining hits of the small move; a
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
    return fitsRepeated(small, hitsLeftAfter, pvBefore - effective);
  };
  const fitting = attacker.moves.filter(fits);
  const gentle = fitting.filter((move) => move.damage * multiplier < pvBefore);
  if (firstHit && gentle.length > 0) return rng.pick(gentle);
  if (fitting.length > 0) return rng.pick(fitting);
  // Should not happen thanks to pickPair/pickMoves; fall back to the small move.
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

  const first: FighterIndex = a.pokemon.speed >= b.pokemon.speed ? 0 : 1;
  const [hitsOnA, hitsOnB] = hitsOn(a.pokemon, b.pokemon, rules);
  const movesRng = rng.fork('moves');
  const typeA = a.pokemon.types[0] ?? 'Normal';
  const typeB = b.pokemon.types[0] ?? 'Normal';
  const fighters: [Fighter, Fighter] = [
    { pokemon: a.pokemon, type: typeA, moves: pickMoves(movesRng, typeA, b.pv, hitsOnB, rules), pv: a.pv },
    { pokemon: b.pokemon, type: typeB, moves: pickMoves(movesRng, typeB, a.pv, hitsOnA, rules), pv: b.pv },
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
