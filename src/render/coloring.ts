/** A4 colouring page: big black-and-white outline, small colour model, name. */
import { typeSlug } from '../domain/attacks.ts';
import type { PokemonData } from '../domain/types.ts';
import { html } from './html.ts';

export function renderColoringSheet(pokemon: PokemonData, outline: string | null, studentName = ''): string {
  const type = pokemon.types[0] ?? 'Normal';
  return html`
    <article class="sheet sheet--cp sheet--coloring">
      <header class="sheet__head">
        <div class="sheet__titlebar">
          <h1 class="sheet__title">Coloriage : ${pokemon.name}</h1>
          <span class="sheet__level">n° ${pokemon.id}</span>
        </div>
        <div class="sheet__ident">
          <span>Prénom : <span class="fill-line">${studentName}</span></span>
        </div>
      </header>
      <div class="coloring">
        <div class="coloring__model">
          <img class="pk-sprite pk-sprite--img coloring__model-sprite" src="${pokemon.sprite}" alt="Modèle en couleur" style="--t: var(--type-${typeSlug(type)})" />
          <span class="coloring__model-label">Modèle</span>
        </div>
        ${
          outline
            ? html`<img class="coloring__outline" src="${outline}" alt="${pokemon.name} à colorier" />`
            : html`<div class="coloring__outline coloring__outline--pending">Préparation du dessin…</div>`
        }
      </div>
      <footer class="sheet__foot">
        <span><a class="sheet__link" href="https://hamzdi.github.io/pokexo/" rel="noopener">hamzdi.github.io/pokexo</a> · Données et images Pokémon : <a class="sheet__link" href="https://tyradex.app" rel="noopener">Tyradex (tyradex.app)</a></span>
        <span>Coloriage</span>
      </footer>
    </article>`.html;
}
