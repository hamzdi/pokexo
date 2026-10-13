/**
 * Gap-fill dictation: the teacher reads full sentences, the child writes only
 * the missing word(s). Pokémon names are printed next to their sprite.
 */
import { LEXICON, type LexiconPeriod } from './lexicon.ts';
import { createRng, seedFromString } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface DicteeSentence {
  /** Template with `{P}`, optional `{Q}` and a single `___` gap. */
  template: string;
  answer: string;
  pokemon: PokemonData;
  second: PokemonData | null;
}

export interface DicteeExercise {
  kind: 'dictee';
  level: Level;
  period: Period;
  seed: number;
  focus: string;
  sentences: DicteeSentence[];
}

export interface DicteeOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

export function generateDictee({ level, period, seed, pokedex }: DicteeOptions): DicteeExercise {
  const lexicon: LexiconPeriod = LEXICON[level][period];
  const rng = createRng(seedFromString(`dictee:${seed}`));
  const items = rng.shuffle(lexicon.items).slice(0, lexicon.sentences);
  const pool = rng.shuffle(pokedex);
  let cursor = 0;
  const nextPokemon = (): PokemonData => {
    const pokemon = pool[cursor % pool.length];
    cursor++;
    if (!pokemon) throw new Error('Pokedex is empty');
    return pokemon;
  };

  const sentences = items.map((item) => ({
    template: item.template,
    answer: item.answer,
    pokemon: nextPokemon(),
    second: item.template.includes('{Q}') ? nextPokemon() : null,
  }));
  return { kind: 'dictee', level, period, seed, focus: lexicon.focus, sentences };
}

/** Full sentence with the gap filled, as the teacher reads it. */
export function fullSentence(sentence: DicteeSentence): string {
  return sentence.template
    .replace('{P}', sentence.pokemon.name)
    .replace('{Q}', sentence.second?.name ?? '')
    .replace('___', sentence.answer);
}
