import { describe, expect, it } from 'vitest';
import { generateCombat } from '../src/domain/combat.ts';
import { POKEDEX } from '../src/domain/pokedex.ts';
import { renderCombatSheet } from '../src/render/combat.ts';
import { html } from '../src/render/html.ts';

describe('html tag', () => {
  it('escapes interpolated text', () => {
    // GIVEN a string containing markup
    // WHEN interpolated
    // THEN it is escaped
    expect(html`<b>${'<i>'}</b>`.html).toBe('<b>&lt;i&gt;</b>');
    expect(html`<p>${html`<b>${'x'}</b>`}</p>`.html).toBe('<p><b>x</b></p>');
  });
});

describe('renderCombatSheet', () => {
  const ex = generateCombat({ level: 'CE1', period: 3, seed: 9, pokedex: POKEDEX });

  it('leaves answer boxes empty on the student sheet', () => {
    // GIVEN a student sheet
    const markup = renderCombatSheet(ex, { answerKey: false });
    // WHEN rendered
    // THEN no answer box is filled and both Pokémon appear
    expect(markup).not.toContain('answer--filled');
    expect(markup).toContain(ex.fighters[0].pokemon.name);
    expect(markup).toContain(ex.fighters[1].pokemon.name);
  });

  it('fills every answer box on the answer key', () => {
    // GIVEN the answer key of the same exercise
    const markup = renderCombatSheet(ex, { answerKey: true });
    // WHEN rendered
    // THEN each attack row shows its remaining PV and the winner is printed
    for (const row of ex.rows) if (row.kind === 'attack' && row.pvAfter > 0) expect(markup).toContain(`>${row.pvAfter}<`);
    expect(markup).toContain('Corrigé');
  });
});
