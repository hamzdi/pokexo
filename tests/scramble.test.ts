import { describe, expect, it } from 'vitest';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { generateScramble, sentenceText, tokenize } from '../src/domain/scramble.ts';
import { LEVELS, PERIODS } from '../src/domain/types.ts';

describe('tokenize', () => {
  it('turns the Pokémon placeholder into a Pokémon token and keeps punctuation attached', () => {
    // GIVEN a template with a gap of two words
    const pikachu = POKEDEX.find((p) => p.id === 25);
    if (!pikachu) throw new Error('missing Pikachu');
    // WHEN tokenized
    const tokens = tokenize('{P} mange ___.', 'une pomme', pikachu, null);
    // THEN the first token carries the Pokémon and the words follow
    expect(tokens.map((t) => t.text)).toEqual(['', 'mange', 'une', 'pomme.']);
    expect(tokens[0]?.pokemon?.id).toBe(25);
  });
});

describe('generateScramble', () => {
  it('shuffles every sentence into a different order and is deterministic', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        // GIVEN two generations with the same seed
        const first = generateScramble({ level, period, seed: 3, pokedex: POKEDEX });
        const second = generateScramble({ level, period, seed: 3, pokedex: POKEDEX });
        // WHEN inspected
        // THEN they are equal, CP has one sentence and CE1 two, and no order is the identity
        expect(second).toEqual(first);
        expect(first.sentences).toHaveLength(level === 'CP' ? 1 : 2);
        for (const sentence of first.sentences) {
          expect([...sentence.order].sort((a, b) => a - b)).toEqual(sentence.tokens.map((_, i) => i));
          expect(sentence.order.every((value, index) => value === index)).toBe(false);
          expect(sentenceText(sentence)).toContain(sentence.pokemon.name);
        }
      }
    }
  });
});
