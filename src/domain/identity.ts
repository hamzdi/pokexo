/**
 * "Fiche d'identité": read a Pokémon profile (category, types, height, weight,
 * evolution) then answer true/false statements (CP) and open questions (CE1).
 */
import { createRng, seedFromString, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface Statement {
  text: string;
  truth: boolean;
}

export interface Question {
  text: string;
  answer: string;
}

export interface IdentityExercise {
  kind: 'identity';
  level: Level;
  period: Period;
  seed: number;
  pokemon: PokemonData;
  pre: PokemonData | null;
  next: PokemonData | null;
  statements: Statement[];
  questions: Question[];
}

export interface IdentityOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

/** "Pokémon Souris" -> "Souris". */
export function shortCategory(category: string): string {
  return category.replace(/^Pokémon\s+/i, '');
}

export function formatWeight(weightKg: number): string {
  return `${Math.max(1, Math.round(weightKg))} kg`;
}

export function formatHeight(heightCm: number): string {
  return `${heightCm} cm`;
}

function otherThan<T>(rng: Rng, pool: readonly T[], excluded: T): T {
  const candidates = pool.filter((item) => item !== excluded);
  return rng.pick(candidates.length > 0 ? candidates : pool);
}

function buildStatements(rng: Rng, pokemon: PokemonData, next: PokemonData | null, pokedex: readonly PokemonData[]): Statement[] {
  const name = pokemon.name;
  const type = pokemon.types[0] ?? 'Normal';
  const allTypes = [...new Set(pokedex.flatMap((p) => p.types))];
  const other = otherThan(rng, pokedex, pokemon);
  const makers: (() => Statement)[] = [
    () => {
      const truth = rng.next() < 0.5;
      return { text: `${name} est un Pokémon de type ${truth ? type : otherThan(rng, allTypes, type)}.`, truth };
    },
    () => {
      const truth = rng.next() < 0.5;
      const category = truth ? pokemon.category : other.category;
      return { text: `${name} est le ${category}.`, truth };
    },
    () => {
      const truth = rng.next() < 0.5;
      const height = truth ? pokemon.heightCm : otherThan(rng, [pokemon.heightCm + 10, pokemon.heightCm + 20, Math.max(10, pokemon.heightCm - 10)], pokemon.heightCm);
      return { text: `${name} mesure ${height} cm.`, truth };
    },
    () => {
      if (!next) return { text: `${name} n'évolue pas.`, truth: true };
      const truth = rng.next() < 0.5;
      return { text: `${name} évolue en ${truth ? next.name : other.name}.`, truth };
    },
  ];
  return makers.map((make) => make());
}

function buildQuestions(pokemon: PokemonData, next: PokemonData | null): Question[] {
  const name = pokemon.name;
  return [
    { text: `Quelle est la catégorie de ${name} ?`, answer: pokemon.category },
    { text: `De quel type est ${name} ?`, answer: pokemon.types.join(' et ') },
    { text: `Combien mesure ${name} ?`, answer: formatHeight(pokemon.heightCm) },
    { text: `En quoi ${name} évolue-t-il ?`, answer: next ? next.name : "Il n'évolue pas." },
  ];
}

export function generateIdentity({ level, period, seed, pokedex }: IdentityOptions): IdentityExercise {
  const rng = createRng(seedFromString(`identity:${seed}`));
  const pokemon = rng.pick(pokedex);
  const find = (id: number | null): PokemonData | null => (id === null ? null : (pokedex.find((p) => p.id === id) ?? null));
  const pre = find(pokemon.preId);
  const next = find(pokemon.nextId);
  const statements = buildStatements(rng, pokemon, next, pokedex);
  const questions = level === 'CE1' ? rng.shuffle(buildQuestions(pokemon, next)).slice(0, 3) : [];
  return {
    kind: 'identity',
    level,
    period,
    seed,
    pokemon,
    pre,
    next,
    statements: level === 'CE1' ? statements.slice(0, 2) : statements,
    questions,
  };
}
