/**
 * Registry of available exercises: what the UI lists and how each one is
 * generated and rendered. Adding an exercise means adding one entry here.
 */
import { generateCombat } from './domain/combat.ts';
import { generateCompare } from './domain/compare.ts';
import { generateDictee } from './domain/dictee.ts';
import { POKEDEX } from './domain/pokedex.ts';
import type { Level, Period } from './domain/types.ts';
import { renderCombatSheet, type SheetOptions } from './render/combat.ts';
import { renderCompareSheet } from './render/compare.ts';
import { renderDicteeSheet } from './render/dictee.ts';
import type { Subject } from './render/frame.ts';

export interface RenderedSheet {
  sheet: string;
  answerKey: string;
}

export interface ExerciseDefinition {
  id: string;
  label: string;
  subject: Subject;
  render(level: Level, period: Period, seed: number, options: Omit<SheetOptions, 'answerKey'>): RenderedSheet;
}

export const EXERCISES: readonly ExerciseDefinition[] = [
  {
    id: 'combat',
    label: 'Combat par manches',
    subject: 'Mathématiques',
    render: (level, period, seed, options) => {
      const ex = generateCombat({ level, period, seed, pokedex: POKEDEX });
      return { sheet: renderCombatSheet(ex, { ...options, answerKey: false }), answerKey: renderCombatSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'compare',
    label: 'Qui gagne ? (comparer les PV)',
    subject: 'Mathématiques',
    render: (level, period, seed, options) => {
      const ex = generateCompare({ level, period, seed, pokedex: POKEDEX });
      return { sheet: renderCompareSheet(ex, { ...options, answerKey: false }), answerKey: renderCompareSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'dictee',
    label: 'Dictée à trous',
    subject: 'Français',
    render: (level, period, seed, options) => {
      const ex = generateDictee({ level, period, seed, pokedex: POKEDEX });
      return { sheet: renderDicteeSheet(ex, { ...options, answerKey: false }), answerKey: renderDicteeSheet(ex, { answerKey: true }) };
    },
  },
];
