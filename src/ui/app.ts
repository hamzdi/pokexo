/**
 * Single-screen generator UI: parameters on the left, A4 preview in the centre,
 * print button to produce the PDF through the browser.
 */
import { generateCombat } from '../domain/combat.ts';
import { POKEDEX } from '../domain/pokedex.ts';
import { seedFromString } from '../domain/rng.ts';
import { LEVELS, PERIODS, type Level, type Period } from '../domain/types.ts';
import { renderCombatSheet } from '../render/combat.ts';
import { html } from '../render/html.ts';

interface ExerciseChoice {
  id: 'combat';
  label: string;
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
}

const state: State = {
  level: 'CP',
  period: 1,
  seed: String(Math.floor(Math.random() * 9000) + 1000),
  studentName: '',
  answerKey: true,
  exercises: [{ id: 'combat', label: 'Combat par manches', enabled: true, count: 1 }],
};

/** Accept a plain number or any text as seed; text is hashed. */
function baseSeed(): number {
  const trimmed = state.seed.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : seedFromString(trimmed || 'pokexo');
}

function renderPages(): string {
  const sheets: string[] = [];
  const keys: string[] = [];
  for (const exercise of state.exercises) {
    if (!exercise.enabled) continue;
    for (let i = 0; i < exercise.count; i++) {
      const seed = (baseSeed() + i) % 100000;
      const ex = generateCombat({ level: state.level, period: state.period, seed, pokedex: POKEDEX });
      sheets.push(renderCombatSheet(ex, { answerKey: false, studentName: state.studentName }));
      if (state.answerKey) keys.push(renderCombatSheet(ex, { answerKey: true }));
    }
  }
  if (sheets.length === 0) return html`<p class="empty">Coche au moins un exercice.</p>`.html;
  return sheets.join('') + keys.join('');
}

function renderControls(): string {
  return html`
    <h1 class="brand">Pokexo</h1>
    <p class="brand__sub">Fiches d'exercices CP · CE1</p>

    <fieldset>
      <legend>Niveau</legend>
      <div class="segmented">
        ${LEVELS.map(
          (level) => html`<label><input type="radio" name="level" value="${level}" ${level === state.level ? 'checked' : ''} /><span>${level}</span></label>`,
        )}
      </div>
    </fieldset>

    <fieldset>
      <legend>Période</legend>
      <div class="segmented">
        ${PERIODS.map(
          (period) => html`<label><input type="radio" name="period" value="${period}" ${period === state.period ? 'checked' : ''} /><span>P${period}</span></label>`,
        )}
      </div>
    </fieldset>

    <fieldset>
      <legend>Exercices</legend>
      ${state.exercises.map(
        (exercise, index) => html`
          <label class="exercise">
            <input type="checkbox" data-exercise="${index}" ${exercise.enabled ? 'checked' : ''} />
            <span class="exercise__label">${exercise.label}</span>
            <input type="number" min="1" max="20" value="${exercise.count}" data-count="${index}" aria-label="Nombre de fiches" />
          </label>`,
      )}
    </fieldset>

    <fieldset>
      <legend>Options</legend>
      <label class="field">Prénom <input type="text" name="studentName" value="${state.studentName}" placeholder="facultatif" /></label>
      <label class="field">Numéro de fiche <input type="text" name="seed" value="${state.seed}" /></label>
      <label class="check"><input type="checkbox" name="answerKey" ${state.answerKey ? 'checked' : ''} /> Ajouter le corrigé à la fin</label>
    </fieldset>

    <div class="actions">
      <button type="button" data-action="shuffle">Nouvelle fiche</button>
      <button type="button" class="primary" data-action="print">Imprimer / PDF</button>
    </div>
    <p class="hint">Dans la boîte d'impression, choisis « Enregistrer au format PDF » et désactive les en-têtes et pieds de page.</p>`.html;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = html`
    <aside class="controls" id="controls"></aside>
    <main class="preview" id="preview"></main>`.html;
  const controls = root.querySelector<HTMLElement>('#controls');
  const preview = root.querySelector<HTMLElement>('#preview');
  if (!controls || !preview) throw new Error('App skeleton missing');

  const refreshPreview = (): void => {
    preview.innerHTML = renderPages();
  };

  controls.innerHTML = renderControls();
  refreshPreview();

  controls.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.name === 'level') state.level = target.value as Level;
    else if (target.name === 'period') state.period = Number(target.value) as Period;
    else if (target.name === 'seed') state.seed = target.value;
    else if (target.name === 'studentName') state.studentName = target.value;
    else if (target.name === 'answerKey') state.answerKey = target.checked;
    else if (target.dataset.exercise !== undefined) {
      const exercise = state.exercises[Number(target.dataset.exercise)];
      if (exercise) exercise.enabled = target.checked;
    } else if (target.dataset.count !== undefined) {
      const exercise = state.exercises[Number(target.dataset.count)];
      if (exercise) exercise.count = Math.min(20, Math.max(1, Number(target.value) || 1));
    }
    refreshPreview();
  });

  controls.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
    if (!button) return;
    if (button.dataset.action === 'print') {
      window.print();
    } else if (button.dataset.action === 'shuffle') {
      state.seed = String(Math.floor(Math.random() * 90000) + 10000);
      const seedInput = controls.querySelector<HTMLInputElement>('input[name="seed"]');
      if (seedInput) seedInput.value = state.seed;
      refreshPreview();
    }
  });
}
