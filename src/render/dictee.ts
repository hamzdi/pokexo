/**
 * HTML rendering of the gap-fill dictation: each sentence shows the printed
 * Pokémon chip and a Seyès-lined gap; the answer key doubles as the teacher
 * sheet with the full sentences to read aloud.
 */
import { fullSentence, type DicteeExercise, type DicteeSentence } from '../domain/dictee.ts';
import { nameChip, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

/** Width of the Seyès gap, proportional to the dictated text (in mm). */
function gapWidth(answer: string, level: string): number {
  const perChar = level === 'CP' ? 8 : 6;
  return Math.max(28, Math.min(90, answer.length * perChar + 8));
}

function renderSentence(sentence: DicteeSentence, ex: DicteeExercise, options: SheetOptions, index: number): Fragment {
  const [before, after = ''] = sentence.template.split('___');
  const fill = (text: string): Fragment[] =>
    text.split(/(\{P\}|\{Q\})/).map((part) => {
      if (part === '{P}') return nameChip(sentence.pokemon);
      if (part === '{Q}' && sentence.second) return nameChip(sentence.second);
      return html`${part}`;
    });
  const width = gapWidth(sentence.answer, ex.level);
  const gap = options.answerKey
    ? html`<span class="gap seyes" style="width: ${width}mm"><span class="answer gap__answer">${sentence.answer}</span></span>`
    : html`<span class="gap seyes" style="width: ${width}mm"></span>`;
  return html`
    <li class="sentence">
      <span class="sentence__num">${index + 1}</span>
      <span class="sentence__text">${fill(before ?? '')}${gap}${fill(after)}</span>
    </li>`;
}

export function renderDicteeSheet(ex: DicteeExercise, options: SheetOptions): string {
  const plural = ex.level === 'CE1' ? 'les mots qui manquent' : 'le mot qui manque';
  const body = html`
      <p class="focus">On travaille : <strong>${ex.focus}</strong></p>
      <ol class="sentences">
        ${ex.sentences.map((sentence, index) => renderSentence(sentence, ex, options, index))}
      </ol>
      ${
        options.answerKey
          ? html`
            <div class="teacher">
              <h2>À lire à voix haute</h2>
              <ol>${ex.sentences.map((sentence) => html`<li>${fullSentence(sentence)}</li>`)}</ol>
              <p>Mots dictés : <strong>${ex.sentences.map((sentence) => sentence.answer).join(' · ')}</strong></p>
            </div>`
          : ''
      }`;
  return renderSheet({
    title: 'Dictée Pokémon',
    subject: 'Français',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'dictee',
    answerKey: options.answerKey,
    answerKeyLabel: 'Fiche enseignant',
    studentName: options.studentName,
    picto: 'ecoute',
    consigne: `Écoute la phrase et écris ${plural}. Le nom du Pokémon est déjà écrit.`,
    body,
  });
}
