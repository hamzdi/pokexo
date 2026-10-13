/** HTML rendering of the "Grille à coordonnées" exercise. */
import { typeSlug } from '../domain/attacks.ts';
import { cellLabel, type CoordExercise } from '../domain/coord.ts';
import { renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function spriteImg(pokemon: { sprite: string; types: string[] }, extra = ''): Fragment {
  return html`<img class="pk-sprite pk-sprite--img ${extra}" src="${pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(pokemon.types[0] ?? 'Normal')})" />`;
}

function renderGrid(ex: CoordExercise, key: boolean): Fragment {
  return html`
    <table class="coord" aria-label="Grille">
      <thead><tr><th></th>${ex.cols.map((col) => html`<th scope="col">${col}</th>`)}</tr></thead>
      <tbody>
        ${ex.rows.map(
          (row) => html`
            <tr>
              <th scope="row">${row}</th>
              ${ex.cols.map((col) => {
                const placed = ex.placed.find((p) => p.col === col && p.row === row);
                const mark = key && ex.toMark.some((m) => m.col === col && m.row === row);
                return html`<td>${placed ? spriteImg(placed.pokemon) : ''}${mark ? html`<span class="answer coord__cross">✕</span>` : ''}</td>`;
              })}
            </tr>`,
        )}
      </tbody>
    </table>`;
}

export function renderCoordSheet(ex: CoordExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const [example, ...asked] = ex.placed;
  const list = html`
    <ul class="coord-list">
      ${example
        ? html`<li class="coord-list__example">${spriteImg(example.pokemon, 'pk-sprite--sm')}<span>${example.pokemon.name} <i>(exemple)</i></span><span>case <b>${cellLabel(example.col, example.row)}</b></span></li>`
        : ''}
      ${asked.map(
        (p) => html`<li>${spriteImg(p.pokemon, 'pk-sprite--sm')}<span>${p.pokemon.name}</span><span>case ${key ? html`<span class="answer">${cellLabel(p.col, p.row)}</span>` : html`<span class="answer-line"></span>`}</span></li>`,
      )}
    </ul>`;
  const marks =
    ex.toMark.length > 0
      ? html`
        <p class="section-title"><span class="consigne__num">2</span>Dessine une croix dans les cases : ${ex.toMark.map((m, i) => html`<b>${cellLabel(m.col, m.row)}</b>${i < ex.toMark.length - 1 ? ' et ' : ''}`)}.</p>`
      : '';
  const body = html`
    <p class="section-title"><span class="consigne__num">1</span>Écris la case où se cache chaque Pokémon : d'abord la lettre, puis le chiffre.</p>
    <div class="coord-layout">
      ${renderGrid(ex, key)}
      ${list}
    </div>
    ${marks}`;
  return renderSheet({
    title: 'Où se cachent les Pokémon ?',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'coord',
    answerKey: key,
    studentName: options.studentName,
    picto: 'ecris',
    consigne: 'Repère chaque Pokémon sur la grille avec une lettre et un chiffre.',
    body,
  });
}
