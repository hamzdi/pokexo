/** HTML rendering of the "Fiche d'identité" reading exercise. */
import { typeSlug } from '../domain/attacks.ts';
import { formatHeight, formatWeight, type IdentityExercise } from '../domain/identity.ts';
import { typeBadge } from './card.ts';
import { renderSheet } from './frame.ts';
import { html, raw, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

const ARROW = raw('<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h13M11 2l4 4-4 4"></path></svg>');

function evolutionCell(ex: IdentityExercise): Fragment {
  const chain: Fragment[] = [];
  if (ex.pre) chain.push(html`<span>${ex.pre.name}</span>`, ARROW);
  chain.push(html`<b>${ex.pokemon.name}</b>`);
  if (ex.next) chain.push(ARROW, html`<span>${ex.next.name}</span>`);
  if (!ex.pre && !ex.next) return html`<span>N'évolue pas</span>`;
  return html`<span class="evo">${chain}</span>`;
}

function renderIdCard(ex: IdentityExercise): Fragment {
  const type = ex.pokemon.types[0] ?? 'Normal';
  return html`
    <div class="id-card">
      <img class="pk-sprite pk-sprite--img id-card__sprite" src="${ex.pokemon.sprite}" alt="${ex.pokemon.name}" style="--t: var(--type-${typeSlug(type)})" />
      <div>
        <p class="id-card__name">${ex.pokemon.name}</p>
        <table class="id-table">
          <tbody>
            <tr><th scope="row">Catégorie</th><td>${ex.pokemon.category}</td></tr>
            <tr><th scope="row">Type</th><td><span class="pk-card__types">${ex.pokemon.types.map(typeBadge)}</span></td></tr>
            <tr><th scope="row">Taille</th><td>${formatHeight(ex.pokemon.heightCm)}</td></tr>
            <tr><th scope="row">Poids</th><td>${formatWeight(ex.pokemon.weightKg)}</td></tr>
            <tr><th scope="row">Évolution</th><td>${evolutionCell(ex)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

export function renderIdentitySheet(ex: IdentityExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const statements = html`
    <ol class="statements">
      ${ex.statements.map(
        (statement) => html`
          <li class="statement">
            <span class="statement__text">${statement.text}</span>
            <span class="choice">
              <span class="${key && statement.truth ? 'is-circled' : ''}">vrai</span>
              <span class="${key && !statement.truth ? 'is-circled' : ''}">faux</span>
            </span>
          </li>`,
      )}
    </ol>`;
  const questions =
    ex.questions.length > 0
      ? html`
        <ol class="open-questions">
          ${ex.questions.map(
            (question) => html`
              <li>
                <p class="open-questions__text">${question.text}</p>
                <div class="seyes seyes--2 seyes--answer">${key ? html`<span class="answer seyes__answer">${question.answer}</span>` : ''}</div>
              </li>`,
          )}
        </ol>`
      : '';
  const body = html`
    ${renderIdCard(ex)}
    <p class="section-title">${ex.level === 'CP' ? 'Entoure vrai ou faux.' : 'Vrai ou faux ? Entoure.'}</p>
    ${statements}
    ${ex.questions.length > 0 ? html`<p class="section-title">Réponds par une phrase.</p>` : ''}
    ${questions}`;
  return renderSheet({
    title: "Fiche d'identité",
    subject: 'Français',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'identity',
    answerKey: key,
    studentName: options.studentName,
    picto: 'lis',
    consigne: `Lis la fiche de ${ex.pokemon.name}, puis réponds aux questions.`,
    body,
  });
}
