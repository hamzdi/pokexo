/**
 * "Phrase en désordre": the words of a sentence are printed as tags to cut out
 * and glue back in order, then the sentence is copied on Seyès lines. The
 * Pokémon name is a tag with its sprite; children never write it.
 */
import { LEXICON } from './lexicon.ts';
import { createRng, seedFromString, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface Token {
  text: string;
  pokemon: PokemonData | null;
}

export interface ScrambledSentence {
  tokens: Token[];
  /** Indices into `tokens`, in the shuffled display order. */
  order: number[];
  pokemon: PokemonData;
  second: PokemonData | null;
}

export interface ScrambleExercise {
  kind: 'scramble';
  level: Level;
  period: Period;
  seed: number;
  sentences: ScrambledSentence[];
}

export interface ScrambleOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

/** Split a filled template into tokens; `{P}` and `{Q}` become Pokémon tokens. */
export function tokenize(template: string, answer: string, pokemon: PokemonData, second: PokemonData | null): Token[] {
  const filled = template.replace('___', answer);
  return filled
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      const match = /^(\{P\}|\{Q\})(.*)$/.exec(word);
      if (!match) return { text: word, pokemon: null };
      const who = match[1] === '{P}' ? pokemon : (second ?? pokemon);
      return { text: match[2] ?? '', pokemon: who };
    });
}

function shuffledOrder(rng: Rng, length: number): number[] {
  const identity = Array.from({ length }, (_, i) => i);
  let order = rng.shuffle(identity);
  if (order.every((value, index) => value === index)) order = [...order.slice(1), order[0] as number];
  return order;
}

/** Full sentence text with the Pokémon names, for the answer key. */
export function sentenceText(sentence: ScrambledSentence): string {
  return sentence.tokens.map((token) => (token.pokemon ? token.pokemon.name + token.text : token.text)).join(' ');
}

export function generateScramble({ level, period, seed, pokedex }: ScrambleOptions): ScrambleExercise {
  const rng = createRng(seedFromString(`scramble:${seed}`));
  const count = level === 'CP' ? 1 : 2;
  const items = rng.shuffle(LEXICON[level][period].items).slice(0, count);
  const pool = rng.shuffle(pokedex);
  let cursor = 0;
  const nextPokemon = (): PokemonData => {
    const pokemon = pool[cursor % pool.length];
    cursor++;
    if (!pokemon) throw new Error('Pokedex is empty');
    return pokemon;
  };
  const sentences = items.map((item) => {
    const pokemon = nextPokemon();
    const second = item.template.includes('{Q}') ? nextPokemon() : null;
    const tokens = tokenize(item.template, item.answer, pokemon, second);
    return { tokens, order: shuffledOrder(rng, tokens.length), pokemon, second };
  });
  return { kind: 'scramble', level, period, seed, sentences };
}
