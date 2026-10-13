/** HTML rendering of the "Phrase en désordre" cut-out and copy exercise. */
import { typeSlug } from '../domain/attacks.ts';
import { sentenceText, type ScrambledSentence, type ScrambleExercise, type Token } from '../domain/scramble.ts';
import { renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import { picto } from './pictos.ts';
import type { SheetOptions } from './combat.ts';

function tag(token: Token): Fragment {
  if (!token.pokemon) return html`<span class="tag-cut">${token.text}</span>`;
  const type = token.pokemon.types[0] ?? 'Normal';
  return html`<span class="tag-cut"><img class="pk-sprite pk-sprite--img" src="${token.pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(type)})" />${token.pokemon.name}${token.text}</span>`;
}

function spriteImg(pokemon: { sprite: string; types: string[] }): Fragment {
  return html`<img class="pk-sprite pk-sprite--img" src="${pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(pokemon.types[0] ?? 'Normal')})" />`;
}

/** Cursive model: the Pokémon name is replaced by its sprite, the rest is written. */
function model(sentence: ScrambledSentence): Fragment {
  return html`<div class="seyes__model">${sentence.tokens.map((token) => (token.pokemon ? html`${spriteImg(token.pokemon)}${token.text} ` : html`${token.text} `))}</div>`;
}

function renderSentence(sentence: ScrambledSentence, index: number, key: boolean): Fragment {
  const ordered = key ? sentence.tokens.map((_, i) => i) : sentence.order;
  const glue = key
    ? html`<p class="glue glue--key"><span class="answer">${sentenceText(sentence)}</span></p>`
    : html`<div class="glue">Colle ici</div>`;
  return html`
    <section class="scramble">
      <p class="section-title"><span class="consigne__num">${index + 1}</span>Découpe les étiquettes et colle-les dans l'ordre pour faire une phrase.</p>
      <div class="tags">
        <span class="tags__scissors">${picto('decoupe', 24)}</span>
        ${ordered.map((i) => tag(sentence.tokens[i] as Token))}
      </div>
      ${glue}
    </section>`;
}

export function renderScrambleSheet(ex: ScrambleExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const first = ex.sentences[0];
  const lines = ex.level === 'CP' ? 3 : 2;
  const copy = first
    ? html`
      <section class="copy">
        <p class="section-title"><span class="consigne__num">${ex.sentences.length + 1}</span>Copie la phrase en attaché. Le Pokémon est déjà là, au début de la ligne.</p>
        <div class="seyes-block">
          <div class="seyes-block__margin seyes-block__label">Modèle</div>
          <div class="seyes seyes--2">${model(first)}</div>
        </div>
        <div class="seyes-block">
          <div class="seyes-block__margin">${Array.from({ length: lines }, () => spriteImg(first.pokemon))}</div>
          <div class="seyes seyes--${lines}">${key ? html`<div class="seyes__model seyes__model--key">${first.tokens.map((token) => (token.pokemon ? html`${spriteImg(token.pokemon)}${token.text} ` : html`${token.text} `))}</div>` : ''}</div>
        </div>
      </section>`
    : '';
  const body = html`${ex.sentences.map((sentence, index) => renderSentence(sentence, index, key))}${copy}`;
  return renderSheet({
    title: 'La phrase en désordre',
    subject: 'Français',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'scramble',
    answerKey: key,
    studentName: options.studentName,
    picto: 'decoupe',
    consigne: 'Remets les mots dans l’ordre, puis copie la phrase.',
    body,
  });
}
