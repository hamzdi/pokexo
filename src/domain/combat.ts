/**
 * Combat exercise generator.
 *
 * Two Pokémon fight over a few rounds. The sheet prints each attack's damage and
 * the child computes the defender's remaining PV after every round. The
 * generator is a pure function of (level, period, seed, pokedex) and also
 * returns the answer key.
 */
import { attackNameFor } from './attacks.ts';
import { COMBAT_RULES, needsBorrow, scaleHp, type CombatRules } from './pedagogy.ts';
import { createRng, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export type FighterIndex = 0 | 1;

export interface Fighter {
  pokemon: PokemonData;
  pv: number;
  attack: { name: string; type: string };
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
 * Nudge a PV total so that `hits` no-borrow subtractions are always possible:
 * the units digit must leave room for the smallest damage repeated `hits` times.
 */
function adjustPvForNoBorrow(rng: Rng, pv: number, hits: number, rules: CombatRules): number {
  if (rules.allowBorrow || rules.damageMin >= 10) return pv;
  const unitsNeeded = Math.min(9, hits * rules.damageMin);
  if (pv % 10 >= unitsNeeded) return pv;
  let adjusted = Math.floor(pv / 10) * 10 + rng.int(unitsNeeded, 9);
  if (adjusted > rules.pvMax) adjusted -= 10;
  if (adjusted < rules.pvMin) adjusted += 10;
  return adjusted;
}

/** Choose the base damage of one hit, honouring the borrow policy of the level. */
function pickBaseDamage(rng: Rng, pvBefore: number, multiplier: 1 | 2, rules: CombatRules): number {
  const candidates: number[] = [];
  for (let d = rules.damageMin; d <= rules.damageMax; d++) {
    const effective = d * multiplier;
    if (effective > pvBefore) continue;
    if (!rules.allowBorrow && needsBorrow(pvBefore, effective)) continue;
    candidates.push(d);
  }
  if (candidates.length > 0) return rng.pick(candidates);
  // No damage fits: the hit knocks the defender out (PV go to 0).
  return Math.max(rules.damageMin, Math.ceil(pvBefore / multiplier));
}

function planRows(rng: Rng, fighters: [Fighter, Fighter], rules: CombatRules): CombatRow[] {
  const pv: [number, number] = [fighters[0].pv, fighters[1].pv];
  const rows: CombatRow[] = [];
  // The faster Pokémon attacks first, like in the games.
  let attacker: FighterIndex = fighters[0].pokemon.speed >= fighters[1].pokemon.speed ? 0 : 1;
  const potionRound = rules.potions && rules.rounds >= 3 ? rng.int(2, rules.rounds - 1) : -1;

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
    const baseDamage = pickBaseDamage(rng, pvBefore, multiplier, rules);
    const damage = baseDamage * multiplier;
    const pvAfter = Math.max(0, pvBefore - damage);
    rows.push({
      kind: 'attack',
      round,
      attacker,
      defender,
      attackName: fighters[attacker].attack.name,
      baseDamage,
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
  const rng = createRng(seed);
  const [a, b] = pickPair(rng.fork('pair'), pokedex, rules);

  // The first attacker lands ceil(rounds / 2) hits, the other floor(rounds / 2).
  const aFirst = a.speed >= b.speed;
  const hitsOnA = aFirst ? Math.floor(rules.rounds / 2) : Math.ceil(rules.rounds / 2);
  const hitsOnB = rules.rounds - hitsOnA;
  const pvRng = rng.fork('pv');
  const fighters: [Fighter, Fighter] = [
    {
      pokemon: a,
      pv: adjustPvForNoBorrow(pvRng, scaleHp(a.hp, rules), hitsOnA, rules),
      attack: { name: attackNameFor(a.types[0] ?? 'Normal'), type: a.types[0] ?? 'Normal' },
    },
    {
      pokemon: b,
      pv: adjustPvForNoBorrow(pvRng, scaleHp(b.hp, rules), hitsOnB, rules),
      attack: { name: attackNameFor(b.types[0] ?? 'Normal'), type: b.types[0] ?? 'Normal' },
    },
  ];

  let rows = planRows(rng.fork('rows:0'), fighters, rules);
  if (rules.requireBorrow) {
    for (let attempt = 1; attempt < PLAN_ATTEMPTS; attempt++) {
      if (rows.some((row) => row.kind === 'attack' && row.borrow)) break;
      rows = planRows(rng.fork(`rows:${attempt}`), fighters, rules);
    }
  }

  return { kind: 'combat', level, period, seed, rules, fighters, rows, ...finalState(fighters, rows) };
}
