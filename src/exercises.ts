/**
 * Registry of available exercises: what the UI lists and how each one is
 * generated and rendered. Adding an exercise means adding one entry here.
 */
import { generateCombat } from './domain/combat.ts';
import { generateCompare } from './domain/compare.ts';
import { generateCoord } from './domain/coord.ts';
import { generateDictee } from './domain/dictee.ts';
import { generateIdentity } from './domain/identity.ts';
import { generateMystery } from './domain/mystery.ts';
import { generateScramble } from './domain/scramble.ts';
import type { Level, Period, PokemonData } from './domain/types.ts';
import { renderCombatSheet, renderMysterySheet, type SheetOptions } from './render/combat.ts';
import { renderCoordSheet } from './render/coord.ts';
import { renderCompareSheet } from './render/compare.ts';
import { renderDicteeSheet } from './render/dictee.ts';
import { renderIdentitySheet } from './render/identity.ts';
import { renderScrambleSheet } from './render/scramble.ts';
import type { Subject } from './render/frame.ts';

export interface RenderedSheet {
  sheet: string;
  answerKey: string;
}

export interface ExerciseDefinition {
  id: string;
  label: string;
  subject: Subject;
  render(level: Level, period: Period, seed: number, options: Omit<SheetOptions, 'answerKey'>, pokedex: readonly PokemonData[]): RenderedSheet;
}

export const EXERCISES: readonly ExerciseDefinition[] = [
  {
    id: 'combat',
    label: 'Combat par manches',
    subject: 'Mathématiques',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateCombat({ level, period, seed, pokedex });
      return { sheet: renderCombatSheet(ex, { ...options, answerKey: false }), answerKey: renderCombatSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'compare',
    label: 'Qui gagne ? (comparer les PV)',
    subject: 'Mathématiques',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateCompare({ level, period, seed, pokedex });
      return { sheet: renderCompareSheet(ex, { ...options, answerKey: false }), answerKey: renderCompareSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'mystery',
    label: 'Manche mystère (dégâts cachés)',
    subject: 'Mathématiques',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateMystery({ level, period, seed, pokedex });
      return {
        sheet: renderMysterySheet(ex.combat, { ...options, answerKey: false, hiddenRounds: ex.hiddenRounds }),
        answerKey: renderMysterySheet(ex.combat, { answerKey: true, hiddenRounds: ex.hiddenRounds }),
      };
    },
  },
  {
    id: 'coord',
    label: 'Grille à coordonnées',
    subject: 'Mathématiques',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateCoord({ level, period, seed, pokedex });
      return { sheet: renderCoordSheet(ex, { ...options, answerKey: false }), answerKey: renderCoordSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'dictee',
    label: 'Dictée à trous',
    subject: 'Français',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateDictee({ level, period, seed, pokedex });
      return { sheet: renderDicteeSheet(ex, { ...options, answerKey: false }), answerKey: renderDicteeSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'identity',
    label: "Fiche d'identité (lecture)",
    subject: 'Français',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateIdentity({ level, period, seed, pokedex });
      return { sheet: renderIdentitySheet(ex, { ...options, answerKey: false }), answerKey: renderIdentitySheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'scramble',
    label: 'Phrase en désordre + copie',
    subject: 'Français',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateScramble({ level, period, seed, pokedex });
      return { sheet: renderScrambleSheet(ex, { ...options, answerKey: false }), answerKey: renderScrambleSheet(ex, { answerKey: true }) };
    },
  },
];
