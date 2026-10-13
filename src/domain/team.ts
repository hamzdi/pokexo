/**
 * "Équipe de trois": two teams of Pokémon; the child adds the PV of each team
 * and circles the stronger one. Sums stay within the period's number range,
 * so PV are real from CE1 P2 and scaled (fixed per Pokémon) before.
 */
import { pvFor } from './pedagogy.ts';
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface TeamRules {
  realPv: boolean;
  pvMin: number;
  pvMax: number;
  /** Pokémon per team. */
  size: number;
}

export const TEAM_RULES: Record<Level, Record<Period, TeamRules>> = {
  CP: {
    1: { realPv: false, pvMin: 1, pvMax: 4, size: 2 },
    2: { realPv: false, pvMin: 2, pvMax: 9, size: 2 },
    3: { realPv: false, pvMin: 10, pvMax: 29, size: 2 },
    4: { realPv: false, pvMin: 10, pvMax: 26, size: 3 },
    5: { realPv: false, pvMin: 10, pvMax: 33, size: 3 },
  },
  CE1: {
    1: { realPv: false, pvMin: 10, pvMax: 33, size: 3 },
    2: { realPv: true, pvMin: 10, pvMax: 66, size: 3 },
    3: { realPv: true, pvMin: 10, pvMax: 255, size: 3 },
    4: { realPv: true, pvMin: 10, pvMax: 255, size: 3 },
    5: { realPv: true, pvMin: 10, pvMax: 255, size: 3 },
  },
};

export interface TeamMember {
  pokemon: PokemonData;
  pv: number;
}

export interface Team {
  name: string;
  members: TeamMember[];
  total: number;
}

export interface TeamExercise {
  kind: 'team';
  level: Level;
  period: Period;
  seed: number;
  rules: TeamRules;
  teams: [Team, Team];
  /** Index of the stronger team. */
  winner: 0 | 1;
}

export interface TeamOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

export function generateTeam({ level, period, seed, pokedex }: TeamOptions): TeamExercise {
  const rules = TEAM_RULES[level][period];
  const rng = createRng(seedFromString(`team:${seed}`));
  const all = pokedex.map((pokemon) => ({ pokemon, pv: pvFor(pokemon.hp, rules) }));
  const fitting = all.filter((m) => m.pv >= rules.pvMin && m.pv <= rules.pvMax);
  const needed = rules.size * 2 + 1;
  const extras = all
    .filter((m) => !fitting.includes(m))
    .sort((x, y) => Math.abs(x.pv - rules.pvMax) - Math.abs(y.pv - rules.pvMax) || x.pokemon.id - y.pokemon.id)
    .slice(0, Math.max(0, needed - fitting.length));
  const pool = rng.shuffle([...fitting, ...extras]);
  if (pool.length < rules.size * 2) throw new Error('Not enough Pokémon for two teams');

  const build = (members: TeamMember[], name: string): Team => ({ name, members, total: members.reduce((t, m) => t + m.pv, 0) });
  let a = build(pool.slice(0, rules.size), 'Équipe rouge');
  let b = build(pool.slice(rules.size, rules.size * 2), 'Équipe bleue');
  // Avoid a tie by swapping in the spare Pokémon when one is available.
  if (a.total === b.total && pool.length > rules.size * 2) {
    const spare = pool[rules.size * 2] as TeamMember;
    b = build([...b.members.slice(0, -1), spare], b.name);
    if (a.total === b.total) a = build([...a.members.slice(0, -1), pool[rules.size * 2 - 1] as TeamMember], a.name);
  }
  return { kind: 'team', level, period, seed, rules, teams: [a, b], winner: a.total >= b.total ? 0 : 1 };
}
