import { describe, expect, it } from 'vitest';
import { fullSentence, generateDictee } from '../src/domain/dictee.ts';
import { LEXICON } from '../src/domain/lexicon.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { LEVELS, PERIODS } from '../src/domain/types.ts';

describe('LEXICON', () => {
  it('has well-formed templates and enough items for every level and period', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        // GIVEN the lexicon of this period
        const lexicon = LEXICON[level][period];
        // WHEN checking its items
        // THEN each has one gap and a Pokémon placeholder, and there are enough of them
        expect(lexicon.items.length).toBeGreaterThanOrEqual(lexicon.sentences);
        for (const item of lexicon.items) {
          expect(item.template.split('___')).toHaveLength(2);
          expect(item.template).toContain('{P}');
          expect(item.answer.trim()).not.toBe('');
        }
      }
    }
  });
});

describe('generateDictee', () => {
  it('is deterministic and picks distinct sentences and Pokémon', () => {
    for (const level of LEVELS) {
      for (const period of PERIODS) {
        // GIVEN two generations with the same seed
        const first = generateDictee({ level, period, seed: 11, pokedex: POKEDEX });
        const second = generateDictee({ level, period, seed: 11, pokedex: POKEDEX });
        // WHEN compared and inspected
        // THEN they are equal, templates are distinct and Pokémon are distinct
        expect(second).toEqual(first);
        expect(first.sentences).toHaveLength(LEXICON[level][period].sentences);
        const templates = first.sentences.map((s) => s.template);
        expect(new Set(templates).size).toBe(templates.length);
        const ids = first.sentences.flatMap((s) => [s.pokemon.id, ...(s.second ? [s.second.id] : [])]);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it('fills a second Pokémon only when the template needs one', () => {
    // GIVEN CE1 period 3 (templates with {P} and {Q})
    const ex = generateDictee({ level: 'CE1', period: 3, seed: 2, pokedex: POKEDEX });
    for (const sentence of ex.sentences) {
      // WHEN looking at the template
      // THEN `second` is set exactly when {Q} is present
      expect(sentence.second !== null).toBe(sentence.template.includes('{Q}'));
    }
  });

  it('reads back the full sentence with names and answer', () => {
    // GIVEN a sentence
    const ex = generateDictee({ level: 'CP', period: 1, seed: 3, pokedex: POKEDEX });
    const sentence = ex.sentences[0];
    if (!sentence) throw new Error('expected a sentence');
    // WHEN rendered for the teacher
    const text = fullSentence(sentence);
    // THEN it contains the Pokémon name and the answer, and no placeholder
    expect(text).toContain(sentence.pokemon.name);
    expect(text).toContain(sentence.answer);
    expect(text).not.toMatch(/\{P\}|\{Q\}|___/);
  });
});
