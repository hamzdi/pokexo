/**
 * HTML rendering of the "Qui a le plus de PV ?" exercise as comparison rows
 * (.versus--row / .mini from the Claude Design mockup).
 */
import { typeSlug } from '../domain/attacks.ts';
import type { CompareExercise, Duel } from '../domain/compare.ts';
import type { PokemonData } from '../domain/types.ts';
import { typeBadge } from './card.ts';
import { answerBox, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function mini(pokemon: PokemonData, pv: number, end: boolean, circled: boolean): Fragment {
  const type = pokemon.types[0] ?? 'Normal';
  return html`
    <div class="mini ${end ? 'mini--end' : ''} ${circled ? 'is-circled' : ''}">
      <img class="pk-sprite pk-sprite--sm pk-sprite--img" src="${pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(type)})" />
      <span class="mini__txt"><span class="mini__name">${pokemon.name}</span>${typeBadge(type)}</span>
      <span class="mini__pv"><small>PV</small>${pv}</span>
    </div>`;
}

function renderDuel(duel: Duel, ex: CompareExercise, options: SheetOptions): Fragment {
  const op = ex.rules.askSign
    ? html`<span class="versus__op">${options.answerKey ? html`<span class="answer answer--plain">${duel.sign}</span>` : ''}</span>`
    : html`<span class="versus__op versus__op--label">VS</span>`;
  return html`
    <div class="versus versus--row ${ex.rules.askGap ? 'versus--gap' : ''}">
      ${mini(duel.a.pokemon, duel.a.pv, false, options.answerKey && duel.winner === 0)}
      ${op}
      ${mini(duel.b.pokemon, duel.b.pv, true, options.answerKey && duel.winner === 1)}
      ${ex.rules.askGap ? html`<span class="versus__gap">Écart ${answerBox(duel.gap, options.answerKey, 'box--sm')}</span>` : ''}
    </div>`;
}

export function renderCompareSheet(ex: CompareExercise, options: SheetOptions): string {
  const parts: string[] = ['Entoure le Pokémon qui a le plus de PV.'];
  if (ex.rules.askSign) parts.push('Écris <, > ou = dans la case.');
  if (ex.rules.askGap) parts.push("Calcule l'écart de PV.");
  const body = html`<div class="versus-list">${ex.duels.map((duel) => renderDuel(duel, ex, options))}</div>`;
  return renderSheet({
    title: 'Qui a le plus de PV ?',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'compare',
    answerKey: options.answerKey,
    studentName: options.studentName,
    picto: 'entoure',
    consigne: parts.join(' '),
    body,
  });
}
