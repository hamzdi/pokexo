import { describe, expect, it } from 'vitest';
import { formatWeight, generateIdentity, shortCategory } from '../src/domain/identity.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { PERIODS } from '../src/domain/types.ts';

describe('generateIdentity', () => {
  it('gives CP four true/false statements and no open question', () => {
    for (const period of PERIODS) {
      // GIVEN a CP exercise
      const ex = generateIdentity({ level: 'CP', period, seed: 5, pokedex: POKEDEX });
      // WHEN inspecting it
      // THEN there are 4 statements mentioning the Pokémon, and no question
      expect(ex.statements).toHaveLength(4);
      expect(ex.questions).toHaveLength(0);
      for (const statement of ex.statements) expect(statement.text).toContain(ex.pokemon.name);
    }
  });

  it('gives CE1 two statements and three questions with answers from the profile', () => {
    // GIVEN a CE1 exercise
    const ex = generateIdentity({ level: 'CE1', period: 2, seed: 9, pokedex: POKEDEX });
    // WHEN inspecting it
    // THEN counts match and every answer is non-empty
    expect(ex.statements).toHaveLength(2);
    expect(ex.questions).toHaveLength(3);
    for (const question of ex.questions) expect(question.answer.trim()).not.toBe('');
  });

  it('makes true statements consistent with the data', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      // GIVEN an exercise
      const ex = generateIdentity({ level: 'CP', period: 1, seed, pokedex: POKEDEX });
      for (const statement of ex.statements) {
        // WHEN a statement is true
        if (!statement.truth) continue;
        // THEN its content comes from the Pokémon profile
        const ok =
          statement.text.includes(`type ${ex.pokemon.types[0]}`) ||
          statement.text.includes(ex.pokemon.category) ||
          statement.text.includes(`${ex.pokemon.heightCm} cm`) ||
          (ex.next ? statement.text.includes(ex.next.name) : statement.text.includes("n'évolue pas"));
        expect(ok).toBe(true);
      }
    }
  });

  it('formats helpers', () => {
    // GIVEN raw data
    // WHEN formatted
    // THEN categories drop the "Pokémon" prefix and weights are whole kilograms, at least 1
    expect(shortCategory('Pokémon Souris')).toBe('Souris');
    expect(formatWeight(6)).toBe('6 kg');
    expect(formatWeight(0.3)).toBe('1 kg');
  });
});
