/** HTML rendering of the "Suites du Pokédex" exercise. */
import { typeSlug } from '../domain/attacks.ts';
import type { Sequence, SequenceExercise } from '../domain/sequence.ts';
import { answerBox, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function stepLabel(step: number): string {
  return step === 1 ? 'de 1 en 1' : `de ${step} en ${step}`;
}

function renderSequence(sequence: Sequence, index: number, key: boolean): Fragment {
  return html`
    <div class="seq">
      <p class="seq__label"><span class="consigne__num">${index + 1}</span>On compte ${stepLabel(sequence.step)}.</p>
      <div class="seq__cells">
        ${sequence.cells.map(
          (cell) => html`
            <div class="seq__cell">
              ${
                cell.pokemon
                  ? html`<img class="pk-sprite pk-sprite--img seq__sprite" src="${cell.pokemon.sprite}" alt="${cell.pokemon.name}" style="--t: var(--type-${typeSlug(cell.pokemon.types[0] ?? 'Normal')})" />`
                  : html`<span class="pk-sprite seq__sprite"></span>`
              }
              ${cell.hidden ? answerBox(cell.id, key, 'box--num') : html`<span class="seq__num">${cell.id}</span>`}
            </div>`,
        )}
      </div>
    </div>`;
}

export function renderSequenceSheet(ex: SequenceExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const body = html`${ex.sequences.map((sequence, index) => renderSequence(sequence, index, key))}`;
  return renderSheet({
    title: 'Les numéros du Pokédex',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'sequence',
    answerKey: key,
    studentName: options.studentName,
    picto: 'ecris',
    consigne: 'Chaque Pokémon a un numéro. Écris les numéros qui manquent.',
    body,
  });
}
