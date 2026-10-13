/**
 * Common A4 frame shared by every sheet (structure and class names from the
 * Claude Design mockup): header with level pill and identity lines, instruction
 * banner with a pictogram, body, footer with attribution.
 */
import type { Level, Period } from '../domain/types.ts';
import { html, type Fragment } from './html.ts';
import { picto, type PictoKey } from './pictos.ts';

export type Subject = 'Mathématiques' | 'Français';

export interface FrameOptions {
  title: string;
  subject: Subject;
  level: Level;
  period: Period;
  seed: number;
  modifier: string;
  answerKey: boolean;
  /** Label of the band shown on the answer key ("Corrigé" by default). */
  answerKeyLabel?: string;
  studentName?: string;
  picto: PictoKey;
  consigne: string;
  body: Fragment;
}

export function renderSheet(o: FrameOptions): string {
  const label = o.answerKeyLabel ?? 'Corrigé';
  const identity = o.answerKey
    ? html`<div class="corrige-band">${label.toUpperCase()}<span>Réponses en bleu, soulignées</span></div>`
    : html`
        <div class="sheet__ident">
          <span>Prénom : <span class="fill-line">${o.studentName ?? ''}</span></span>
          <span>Date : <span class="fill-line fill-line--short"></span></span>
        </div>`;
  return html`
    <article class="sheet sheet--${o.level.toLowerCase()} sheet--${o.modifier} ${o.answerKey ? 'sheet--corrige' : ''}">
      <header class="sheet__head">
        <div class="sheet__titlebar">
          <h1 class="sheet__title">${o.title}</h1>
          <span class="sheet__level">${o.level} <i>· Période ${o.period}</i></span>
        </div>
        ${identity}
      </header>

      <div class="consigne">
        <span class="consigne__picto">${picto(o.picto, o.level === 'CP' ? 30 : 24)}</span>
        <p class="consigne__text">${o.consigne}</p>
      </div>

      <div class="sheet__body">${o.body}</div>

      <footer class="sheet__foot">
        <span>Données Pokémon : Tyradex (tyradex.app)</span>
        <span>${o.subject} · fiche n° ${o.seed}${o.answerKey ? ` · ${label.toLowerCase()}` : ''}</span>
      </footer>
    </article>`.html;
}

/** Sprite + printed name, so children never have to write the Pokémon name. */
export function nameChip(pokemon: { name: string; sprite: string }): Fragment {
  return html`<span class="chip-name"><img class="chip-name__sprite" src="${pokemon.sprite}" alt="" /><span>${pokemon.name}</span></span>`;
}

/** Empty answer box on the student sheet, filled blue answer on the key. */
export function answerBox(value: number | string, answerKey: boolean, extraClass = ''): Fragment {
  return answerKey
    ? html`<span class="box box--filled ${extraClass}"><span class="answer">${value}</span></span>`
    : html`<span class="box ${extraClass}"></span>`;
}
