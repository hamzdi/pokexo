/** HTML rendering of the "Boutique Pokémon" euro problems. */
import { typeSlug } from '../domain/attacks.ts';
import { SHOP_ITEMS, type ShopExercise, type ShopProblem } from '../domain/shop.ts';
import { answerBox, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function renderProblem(problem: ShopProblem, index: number, key: boolean): Fragment {
  const purchase = problem.lines.map((l) => (l.quantity > 1 ? `${l.quantity} ${l.item.name}` : `1 ${l.item.name}`));
  const list = purchase.length > 1 ? `${purchase.slice(0, -1).join(', ')} et ${purchase[purchase.length - 1]}` : (purchase[0] ?? '');
  const detail = problem.lines
    .map((l) => (l.quantity > 1 ? `${l.quantity} × ${l.item.price} €` : `${l.item.price} €`))
    .join(' + ');
  return html`
    <div class="shop-problem">
      <p class="shop-problem__text">
        <span class="consigne__num">${index + 1}</span>
        <img class="pk-sprite pk-sprite--img shop-problem__sprite" src="${problem.buyer.sprite}" alt="" style="--t: var(--type-${typeSlug(problem.buyer.types[0] ?? 'Normal')})" />
        <strong>${problem.buyer.name}</strong> achète ${list}.
      </p>
      <p class="shop-problem__q">Combien paie-t-il ? <span class="shop-problem__detail">${key ? detail + ' =' : ''}</span> ${answerBox(`${problem.total} €`, key, 'box--euro')}</p>
      ${
        problem.banknote !== null
          ? html`<p class="shop-problem__q">Il paie avec un billet de <strong>${problem.banknote} €</strong>. Combien lui rend-on ? ${answerBox(`${problem.change} €`, key, 'box--euro')}</p>`
          : ''
      }
    </div>`;
}

export function renderShopSheet(ex: ShopExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const body = html`
    <div class="price-list">
      ${SHOP_ITEMS.map((item) => html`<span class="price-tag"><span>${item.name}</span><b>${item.price} €</b></span>`)}
    </div>
    ${ex.problems.map((problem, index) => renderProblem(problem, index, key))}`;
  return renderSheet({
    title: 'La boutique Pokémon',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'shop',
    answerKey: key,
    studentName: options.studentName,
    picto: 'calcule',
    consigne: 'Regarde les prix de la boutique, puis calcule ce que paie chaque Pokémon.',
    body,
  });
}
