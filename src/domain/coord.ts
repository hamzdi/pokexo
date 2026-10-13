/**
 * "Grille à coordonnées": Pokémon hidden on a lettered/numbered grid. The
 * child writes each Pokémon's cell (letter then number) and, in CE1, draws a
 * cross in given cells.
 */
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface Placement {
  pokemon: PokemonData;
  col: string;
  row: number;
}

export interface CoordExercise {
  kind: 'coord';
  level: Level;
  period: Period;
  seed: number;
  cols: string[];
  rows: number[];
  /** Pokémon drawn on the grid; the first one is the worked example. */
  placed: Placement[];
  /** Empty cells where the child must draw a cross (CE1). */
  toMark: { col: string; row: number }[];
}

export interface CoordOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

export function cellLabel(col: string, row: number): string {
  return `${col}${row}`;
}

export function generateCoord({ level, period, seed, pokedex }: CoordOptions): CoordExercise {
  const rng = createRng(seedFromString(`coord:${seed}`));
  const size = level === 'CP' ? 5 : 6;
  const cols = 'ABCDEF'.slice(0, size).split('');
  const rows = Array.from({ length: size }, (_, i) => i + 1);
  const cells = rng.shuffle(cols.flatMap((col) => rows.map((row) => ({ col, row }))));
  const placedCount = level === 'CP' ? 4 : 5;
  const markCount = level === 'CE1' ? 2 : 0;
  const pokemons = rng.shuffle(pokedex).slice(0, placedCount);
  const placed = pokemons.map((pokemon, i) => {
    const cell = cells[i];
    if (!cell) throw new Error('Grid too small');
    return { pokemon, col: cell.col, row: cell.row };
  });
  const toMark = cells.slice(placedCount, placedCount + markCount);
  return { kind: 'coord', level, period, seed, cols, rows, placed, toMark };
}
