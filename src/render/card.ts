/**
 * Pokémon card used on the sheets: name, big PV, sprite, type badges and the
 * list of moves with their damage. Markup from the Claude Design mockup.
 */
import { typeSlug } from '../domain/attacks.ts';
import type { Move } from '../domain/combat.ts';
import type { PokemonData } from '../domain/types.ts';
import { html, type Fragment } from './html.ts';

export interface CardOptions {
  pokemon: PokemonData;
  pv: number;
  moves?: readonly Move[];
  /** Small caption above the name ("Attaque en premier"). */
  role?: string;
  small?: boolean;
}

export function typeBadge(type: string): Fragment {
  return html`<span class="pk-type pk-type--${typeSlug(type)}">${type}</span>`;
}

export function renderCard(o: CardOptions): Fragment {
  const type = o.pokemon.types[0] ?? 'Normal';
  return html`
    <div class="pk-card ${o.small ? 'pk-card--sm' : ''}" style="--t: var(--type-${typeSlug(type)})">
      ${o.role ? html`<span class="pk-card__role">${o.role}</span>` : ''}
      <div class="pk-card__top">
        <span class="pk-card__name">${o.pokemon.name}</span>
        <span class="pk-card__pv"><small>PV</small><strong>${o.pv}</strong></span>
      </div>
      <img class="pk-sprite pk-sprite--img" src="${o.pokemon.sprite}" alt="${o.pokemon.name}" />
      <div class="pk-card__types">${o.pokemon.types.map(typeBadge)}</div>
      ${
        o.moves
          ? html`<ul class="pk-card__moves">${o.moves.map((m) => html`<li><span>${m.name}</span><b>${m.damage}</b></li>`)}</ul>`
          : ''
      }
    </div>`;
}
