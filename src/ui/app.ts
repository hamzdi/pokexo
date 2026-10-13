/**
 * Generator screen (shell from the Claude Design mockup): settings panel on the
 * left, action bar and scaled A4 previews on the right, browser print for PDF.
 */
import { typeSlug } from '../domain/attacks.ts';
import { POKEDEX } from '../domain/pokedex.ts';
import { filterPokedex, MIN_POOL } from '../domain/pool.ts';
import { seedFromString } from '../domain/rng.ts';
import { LEVELS, PERIODS, TYPE_ORDER, type Level, type Period } from '../domain/types.ts';
import { EXERCISES } from '../exercises.ts';
import { html, raw, type Fragment } from '../render/html.ts';

interface ExerciseChoice {
  id: string;
  enabled: boolean;
  count: number;
}

interface State {
  level: Level;
  period: Period;
  seed: string;
  studentName: string;
  answerKey: boolean;
  exercises: ExerciseChoice[];
  /** Selected Pokémon types; all selected by default. */
  types: Set<string>;
  includeLegendary: boolean;
}

const ALL_TYPES: readonly string[] = TYPE_ORDER.filter((type) => POKEDEX.some((p) => p.types.includes(type)));

const MAX_COUNT = 6;

const state: State = {
  level: 'CP',
  period: 1,
  seed: String(1000 + Math.floor(Math.random() * 9000)),
  studentName: '',
  answerKey: true,
  exercises: EXERCISES.map((exercise) => ({ id: exercise.id, enabled: true, count: 1 })),
  types: new Set(ALL_TYPES),
  includeLegendary: true,
};

function currentPool() {
  const types = state.types.size === ALL_TYPES.length ? null : state.types;
  return filterPokedex(POKEDEX, { types, includeLegendary: state.includeLegendary });
}

const ICON_MINUS = raw('<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>');
const ICON_PLUS = raw('<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>');
const ICON_DICE = raw('<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3.5"></rect><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"></circle><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"></circle></svg>');
const ICON_REFRESH = raw('<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"></path><path d="M20 4v5h-5"></path></svg>');
const ICON_PRINT = raw('<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M7 9V3.5h10V9"></path><path d="M7 17H4.5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 4.5 9h15a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H17"></path><path d="M7 14h10v6.5H7z"></path></svg>');
const LOGO = raw('<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#2B4FB8"></rect><rect x="10" y="6" width="14" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2.2"></rect><path d="M7 10v14a2 2 0 0 0 2 2h11" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"></path><path d="M14 12h6M14 16h6M14 20h3" stroke="#fff" stroke-width="2" stroke-linecap="round"></path></svg>');

/** Accept a plain number or any text as seed; text is hashed. */
function baseSeed(): number {
  const trimmed = state.seed.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : seedFromString(trimmed || 'pokexo');
}

interface Page {
  label: string;
  answerKey: boolean;
  markup: string;
}

function buildPages(): Page[] {
  const sheets: Page[] = [];
  const keys: Page[] = [];
  const { pool } = currentPool();
  for (const choice of state.exercises) {
    const definition = EXERCISES.find((exercise) => exercise.id === choice.id);
    if (!choice.enabled || !definition) continue;
    for (let i = 0; i < choice.count; i++) {
      const seed = (baseSeed() + i) % 100000;
      try {
        const rendered = definition.render(state.level, state.period, seed, { studentName: state.studentName }, pool);
        sheets.push({ label: definition.label, answerKey: false, markup: rendered.sheet });
        if (state.answerKey) keys.push({ label: definition.label, answerKey: true, markup: rendered.answerKey });
      } catch (error) {
        sheets.push({ label: definition.label, answerKey: false, markup: renderErrorSheet(definition.label, error) });
      }
    }
  }
  return [...sheets, ...keys];
}

/** Shown in place of a sheet when a generator cannot work with the current selection. */
function renderErrorSheet(label: string, error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return html`
    <article class="sheet sheet--cp sheet--error">
      <h1 class="sheet__title">${label}</h1>
      <p class="error-text">Impossible de générer cette fiche avec la sélection actuelle de Pokémon. Élargis les types ou réactive les légendaires.</p>
      <p class="error-detail">${detail}</p>
    </article>`.html;
}

function renderDesk(pages: Page[]): string {
  if (pages.length === 0) return html`<p class="empty">Coche au moins un exercice.</p>`.html;
  return pages
    .map(
      (page, index) => html`
        <figure class="app-page" style="margin: 0">
          <figcaption class="app-page__label">
            <span class="app-page__num">${index + 1}</span>${page.label}
            ${page.answerKey ? html`<span class="app-page__tag">Corrigé</span>` : ''}
          </figcaption>
          <div class="app-page__frame app-page__frame--62"><div class="app-page__scale app-page__scale--62">${raw(page.markup)}</div></div>
        </figure>`.html,
    )
    .join('');
}

function seg<T extends string | number>(name: string, values: readonly T[], current: T, label: (v: T) => string): Fragment {
  return html`
    <div class="seg">
      ${values.map(
        (value) => html`<label class="seg__opt"><input type="radio" name="${name}" value="${value}" ${value === current ? 'checked' : ''} /><span>${label(value)}</span></label>`,
      )}
    </div>`;
}

function renderExerciseList(): Fragment {
  const subjects = [...new Set(EXERCISES.map((exercise) => exercise.subject))];
  return html`
    <ul class="ex-list">
      ${subjects.map(
        (subject) => html`
          <li class="app-panel__subject">${subject}</li>
          ${EXERCISES.filter((exercise) => exercise.subject === subject).map((exercise) => {
            const index = state.exercises.findIndex((choice) => choice.id === exercise.id);
            const choice = state.exercises[index];
            const on = choice?.enabled ?? false;
            const count = choice?.count ?? 1;
            return html`
              <li class="ex-item ${on ? '' : 'is-off'}">
                <label class="ex-check"><input type="checkbox" data-exercise="${index}" ${on ? 'checked' : ''} /><span class="ex-item__name">${exercise.label}</span></label>
                <div class="stepper" role="group" aria-label="Nombre de fiches">
                  <button type="button" aria-label="Une fiche de moins" data-dec="${index}" ${!on || count <= 1 ? 'disabled' : ''}>${ICON_MINUS}</button>
                  <output>${on ? count : 0}</output>
                  <button type="button" aria-label="Une fiche de plus" data-inc="${index}" ${!on || count >= MAX_COUNT ? 'disabled' : ''}>${ICON_PLUS}</button>
                </div>
              </li>`;
          })}`,
      )}
    </ul>`;
}

function renderTypeFilter(): Fragment {
  const { matching, padded } = currentPool();
  const hint =
    padded > 0
      ? html`<span class="field__hint field__hint--warn">Seulement ${matching} Pokémon correspondent : ${padded} autres sont ajoutés pour atteindre ${MIN_POOL}.</span>`
      : html`<span class="field__hint">${matching} Pokémon disponibles.</span>`;
  return html`
    <fieldset class="field">
      <legend class="field__label">Pokémon</legend>
      <div class="type-filter">
        ${ALL_TYPES.map(
          (type) => html`
            <label class="type-filter__opt">
              <input type="checkbox" data-type="${type}" ${state.types.has(type) ? 'checked' : ''} />
              <span class="pk-type pk-type--${typeSlug(type)}">${type}</span>
            </label>`,
        )}
      </div>
      <div class="type-filter__actions">
        <button type="button" class="link" data-action="types-all">Tous les types</button>
        <button type="button" class="link" data-action="types-none">Aucun</button>
      </div>
      <label class="switch"><input type="checkbox" name="includeLegendary" ${state.includeLegendary ? 'checked' : ''} /><span>Inclure les légendaires</span></label>
      ${hint}
    </fieldset>`;
}

function totalSheets(): number {
  return state.exercises.reduce((total, choice) => total + (choice.enabled ? choice.count : 0), 0);
}

function renderPanel(): string {
  const total = totalSheets();
  return html`
    <fieldset class="field">
      <legend class="field__label">Niveau</legend>
      ${seg('level', LEVELS, state.level, (v) => v)}
    </fieldset>
    <fieldset class="field">
      <legend class="field__label">Période</legend>
      ${seg('period', PERIODS, state.period, (v) => `P${v}`)}
    </fieldset>
    <fieldset class="field">
      <legend class="field__label">Exercices</legend>
      ${renderExerciseList()}
      <div class="ex-total"><span>Total</span><strong>${total} ${total > 1 ? 'fiches' : 'fiche'}</strong></div>
    </fieldset>
    ${renderTypeFilter()}
    <div class="field">
      <label class="field__label" for="seed">Numéro de fiche</label>
      <div class="input-row">
        <input id="seed" class="input input--mono" name="seed" value="${state.seed}" inputmode="numeric" />
        <button type="button" class="btn btn--secondary btn--icon" aria-label="Tirer un nouveau numéro" data-action="shuffle">${ICON_DICE}</button>
      </div>
      <span class="field__hint">Même numéro = mêmes fiches. Pratique pour réimprimer.</span>
    </div>
    <div class="field">
      <label class="field__label" for="studentName">Prénom de l'élève</label>
      <input id="studentName" class="input" name="studentName" value="${state.studentName}" placeholder="Laisser vide pour une ligne à remplir" />
    </div>
    <p class="app-hint">Dans la boîte d'impression, choisis « Enregistrer au format PDF », marges « Aucune » et sans en-têtes ni pieds de page.</p>`.html;
}

function renderMeta(pages: Page[]): string {
  const total = totalSheets();
  return `${state.level} · P${state.period} · ${total} ${total > 1 ? 'fiches' : 'fiche'} · ${pages.length} pages A4${state.answerKey ? ' (corrigés inclus)' : ''} · n° ${state.seed}`;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = html`
    <div class="app">
      <header class="app-bar app-chrome">
        <div class="app-logo">${LOGO}<span>Pokexo</span><small>Fiches d'exercices CP · CE1</small></div>
        <a href="https://github.com/hamzdi/pokexo" style="font-size: 14px; font-weight: 500">GitHub</a>
      </header>
      <div class="app-body">
        <aside class="app-panel app-chrome" id="panel" aria-label="Réglages de génération"></aside>
        <main class="app-main">
          <div class="app-actions app-chrome">
            <div class="app-actions__meta"><strong>Aperçu</strong><span id="meta"></span></div>
            <div class="app-actions__group">
              <label class="switch"><input type="checkbox" name="answerKey" ${state.answerKey ? 'checked' : ''} /><span>Inclure le corrigé</span></label>
              <span class="app-actions__sep" aria-hidden="true"></span>
              <button type="button" class="btn btn--secondary" data-action="shuffle">${ICON_REFRESH}Regénérer</button>
              <button type="button" class="btn btn--primary" data-action="print">${ICON_PRINT}Imprimer / PDF</button>
            </div>
          </div>
          <section class="app-desk" id="desk" aria-label="Aperçu des fiches A4"></section>
        </main>
      </div>
    </div>`.html;

  const panel = root.querySelector<HTMLElement>('#panel');
  const desk = root.querySelector<HTMLElement>('#desk');
  const meta = root.querySelector<HTMLElement>('#meta');
  if (!panel || !desk || !meta) throw new Error('App skeleton missing');

  const refresh = (rebuildPanel: boolean): void => {
    if (rebuildPanel) panel.innerHTML = renderPanel();
    const pages = buildPages();
    desk.innerHTML = renderDesk(pages);
    meta.textContent = renderMeta(pages);
  };
  refresh(true);

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    let rebuild = false;
    if (target.name === 'level') state.level = target.value as Level;
    else if (target.name === 'period') state.period = Number(target.value) as Period;
    else if (target.name === 'seed') state.seed = target.value;
    else if (target.name === 'studentName') state.studentName = target.value;
    else if (target.name === 'answerKey') state.answerKey = target.checked;
    else if (target.name === 'includeLegendary') {
      state.includeLegendary = target.checked;
      rebuild = true;
    } else if (target.dataset.type !== undefined) {
      if (target.checked) state.types.add(target.dataset.type);
      else state.types.delete(target.dataset.type);
      rebuild = true;
    } else if (target.dataset.exercise !== undefined) {
      const choice = state.exercises[Number(target.dataset.exercise)];
      if (choice) choice.enabled = target.checked;
      rebuild = true;
    } else return;
    refresh(rebuild);
  });

  root.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!button) return;
    if (button.dataset.action === 'print') {
      window.print();
      return;
    }
    if (button.dataset.action === 'shuffle') {
      state.seed = String(1000 + Math.floor(Math.random() * 9000));
      refresh(true);
      return;
    }
    if (button.dataset.action === 'types-all' || button.dataset.action === 'types-none') {
      state.types = new Set(button.dataset.action === 'types-all' ? ALL_TYPES : []);
      refresh(true);
      return;
    }
    const step = button.dataset.inc !== undefined ? 1 : button.dataset.dec !== undefined ? -1 : 0;
    if (step === 0) return;
    const choice = state.exercises[Number(button.dataset.inc ?? button.dataset.dec)];
    if (!choice) return;
    choice.count = Math.min(MAX_COUNT, Math.max(1, choice.count + step));
    refresh(true);
  });
}
