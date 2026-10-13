/**
 * Registry of available exercises: what the UI lists and how each one is
 * generated and rendered. Adding an exercise means adding one entry here.
 */
import { generateCombat } from './domain/combat.ts';
import { generateCompare } from './domain/compare.ts';
import { generateCoord } from './domain/coord.ts';
import { generateMatch } from './domain/match.ts';
import { generateMeasures, MEASURE_RULES } from './domain/measures.ts';
import { POKEDEX } from './domain/pokedex.ts';
import { generateSequence } from './domain/sequence.ts';
import { generateShop, SHOP_RULES } from './domain/shop.ts';
import { generateTeam } from './domain/team.ts';
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
import { renderMatchSheet } from './render/match.ts';
import { renderMeasuresSheet } from './render/measures.ts';
import { renderSequenceSheet } from './render/sequence.ts';
import { renderShopSheet } from './render/shop.ts';
import { renderTeamSheet } from './render/team.ts';
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
  /** Whether the exercise exists at this level and period (defaults to always). */
  available?: (level: Level, period: Period) => boolean;
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
    id: 'team',
    label: 'Équipes : additionner les PV',
    subject: 'Mathématiques',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateTeam({ level, period, seed, pokedex });
      return { sheet: renderTeamSheet(ex, { ...options, answerKey: false }), answerKey: renderTeamSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'measures',
    label: 'Taille et poids à ranger',
    subject: 'Mathématiques',
    available: (level, period) => MEASURE_RULES[level][period] !== null,
    render: (level, period, seed, options, pokedex) => {
      const ex = generateMeasures({ level, period, seed, pokedex });
      return { sheet: renderMeasuresSheet(ex, { ...options, answerKey: false }), answerKey: renderMeasuresSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'sequence',
    label: 'Suites du Pokédex',
    subject: 'Mathématiques',
    render: (level, period, seed, options) => {
      const ex = generateSequence({ level, period, seed, pokedex: POKEDEX });
      return { sheet: renderSequenceSheet(ex, { ...options, answerKey: false }), answerKey: renderSequenceSheet(ex, { answerKey: true }) };
    },
  },
  {
    id: 'shop',
    label: 'Boutique en euros',
    subject: 'Mathématiques',
    available: (level, period) => SHOP_RULES[level][period] !== null,
    render: (level, period, seed, options, pokedex) => {
      const ex = generateShop({ level, period, seed, pokedex });
      return { sheet: renderShopSheet(ex, { ...options, answerKey: false }), answerKey: renderShopSheet(ex, { answerKey: true }) };
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
  {
    id: 'match',
    label: 'Relier image et mot',
    subject: 'Français',
    render: (level, period, seed, options, pokedex) => {
      const ex = generateMatch({ level, period, seed, pokedex });
      return { sheet: renderMatchSheet(ex, { ...options, answerKey: false }), answerKey: renderMatchSheet(ex, { answerKey: true }) };
    },
  },
];
