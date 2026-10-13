/** HTML rendering of the "Relier image et mot" exercise (.match grid from the mockup). */
import { typeSlug } from '../domain/attacks.ts';
import type { MatchExercise } from '../domain/match.ts';
import { renderSheet } from './frame.ts';
import { html } from './html.ts';
import type { SheetOptions } from './combat.ts';

export function renderMatchSheet(ex: MatchExercise, options: SheetOptions): string {
  const key = options.answerKey;
  // On the answer key the names are aligned with their sprite, so the lines are horizontal.
  const order = key ? ex.left.map((_, i) => i) : ex.rightOrder;
  const body = html`
    <div class="match match--${ex.level.toLowerCase()}">
      ${ex.left.map(
        (pokemon, i) => html`
          <div class="match__left">
            <img class="pk-sprite pk-sprite--sm pk-sprite--img" src="${pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(pokemon.types[0] ?? 'Normal')})" />
            <span class="match__dot"></span>
          </div>
          <span class="match__line">${key ? html`<span class="match__answer-line"></span>` : ''}</span>
          <div class="match__right"><span class="match__dot"></span><span class="${key ? 'answer answer--plain' : ''}">${ex.left[order[i] as number]?.name}</span></div>`,
      )}
    </div>`;
  return renderSheet({
    title: 'Relie chaque Pokémon à son nom',
    subject: 'Français',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'match',
    answerKey: key,
    studentName: options.studentName,
    picto: 'relie',
    consigne: 'Lis les noms, puis relie chaque image au bon nom.',
    body,
  });
}
