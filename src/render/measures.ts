/** HTML rendering of the "Taille et poids" ranking exercise. */
import { typeSlug } from '../domain/attacks.ts';
import type { MeasureExercise } from '../domain/measures.ts';
import { answerBox, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function renderRow(ex: MeasureExercise, value: (i: number) => string, ranks: number[], key: boolean): Fragment {
  return html`
    <div class="measure-row">
      ${ex.items.map(
        (item, i) => html`
          <div class="measure">
            <img class="pk-sprite pk-sprite--img measure__sprite" src="${item.pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(item.pokemon.types[0] ?? 'Normal')})" />
            <span class="measure__name">${item.pokemon.name}</span>
            <span class="measure__value">${value(i)}</span>
            ${answerBox(ranks[i] ?? '', key, 'box--rank')}
          </div>`,
      )}
    </div>`;
}

export function renderMeasuresSheet(ex: MeasureExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const withWeight = ex.weightRanks.length > 0;
  const body = html`
    <p class="section-title"><span class="consigne__num">1</span>Range les Pokémon du plus petit au plus grand : écris 1 sous le plus petit, puis 2, 3…</p>
    ${renderRow(ex, (i) => `${ex.items[i]?.heightCm} cm`, ex.heightRanks, key)}
    ${
      withWeight
        ? html`
          <p class="section-title"><span class="consigne__num">2</span>Range-les maintenant du plus léger au plus lourd.</p>
          ${renderRow(ex, (i) => `${ex.items[i]?.weightKg} kg`, ex.weightRanks, key)}`
        : ''
    }`;
  return renderSheet({
    title: withWeight ? 'Taille et poids' : 'Du plus petit au plus grand',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'measures',
    answerKey: key,
    studentName: options.studentName,
    picto: 'ecris',
    consigne: 'Compare les mesures des Pokémon et range-les dans l’ordre.',
    body,
  });
}
