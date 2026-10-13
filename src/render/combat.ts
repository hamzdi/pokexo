/**
 * HTML rendering of a combat exercise, as an A4 page.
 *
 * The same template renders the student sheet and the answer key: with
 * `answerKey` enabled, every answer box is filled instead of left blank.
 */
import { typeSlug } from '../domain/attacks.ts';
import type { AttackRow, CombatExercise, Fighter, PotionRow } from '../domain/combat.ts';
import { html, raw, type Fragment } from './html.ts';

export interface SheetOptions {
  answerKey: boolean;
  studentName?: string;
}

function answerBox(value: number | string, options: SheetOptions, extraClass = ''): Fragment {
  return options.answerKey
    ? html`<span class="answer answer--filled ${extraClass}">${value}</span>`
    : html`<span class="answer ${extraClass}"></span>`;
}

function renderCard(fighter: Fighter): Fragment {
  const type = fighter.attack.type;
  return html`
    <div class="card type-${typeSlug(type)}">
      <div class="card__header">
        <span class="card__name">${fighter.pokemon.name}</span>
        <span class="card__pv">${fighter.pv} <small>PV</small></span>
      </div>
      <img class="card__sprite" src="${fighter.pokemon.sprite}" alt="${fighter.pokemon.name}" />
      <div class="card__type"><span class="badge">${type}</span></div>
      <div class="card__attack">
        <span class="card__attack-name">${fighter.attack.name}</span>
      </div>
    </div>`;
}

function renderAttackRow(row: AttackRow, ex: CombatExercise, options: SheetOptions): Fragment {
  const attacker = ex.fighters[row.attacker];
  const defender = ex.fighters[row.defender];
  const damageCell =
    row.multiplier === 2
      ? html`<span class="super">Super efficace !</span> ${row.baseDamage} × 2 = ${answerBox(row.damage, options, 'answer--small')}`
      : html`${row.damage}`;
  return html`
    <tr class="row-attack">
      <td class="col-round">${row.round}</td>
      <td class="col-attacker">
        <img class="mini" src="${attacker.pokemon.sprite}" alt="" />
        <span>${attacker.pokemon.name}</span>
      </td>
      <td class="col-attack">${row.attackName}</td>
      <td class="col-damage">${damageCell}</td>
      <td class="col-pv">
        <span class="col-pv__who">${defender.pokemon.name}</span>
        ${answerBox(row.pvAfter === 0 ? '0 — KO !' : row.pvAfter, options)}
      </td>
    </tr>`;
}

function renderPotionRow(row: PotionRow, ex: CombatExercise, options: SheetOptions): Fragment {
  const fighter = ex.fighters[row.fighter];
  return html`
    <tr class="row-potion">
      <td class="col-round"></td>
      <td colspan="3" class="col-potion">
        <span class="potion">Potion !</span> ${fighter.pokemon.name} récupère <strong>+${row.amount} PV</strong>
      </td>
      <td class="col-pv">
        <span class="col-pv__who">${fighter.pokemon.name}</span>
        ${answerBox(row.pvAfter, options)}
      </td>
    </tr>`;
}

function renderRules(ex: CombatExercise): Fragment {
  const lines = [
    'Chaque Pokémon a des <strong>PV</strong> (points de vie).',
    'Quand il reçoit une attaque, il perd autant de PV que les <strong>dégâts</strong>.',
    "S'il arrive à 0 PV, il est <strong>KO</strong> et le combat s'arrête.",
  ];
  if (ex.rules.superEffective) lines.push('Si l\'attaque est <strong>super efficace</strong>, les dégâts sont doublés (× 2).');
  if (ex.rules.potions) lines.push('Une <strong>potion</strong> redonne des PV.');
  return html`<ul class="rules">${lines.map((line) => html`<li>${raw(line)}</li>`)}</ul>`;
}

export function renderCombatSheet(ex: CombatExercise, options: SheetOptions): string {
  const [a, b] = ex.fighters;
  const winnerName = ex.winner === null ? 'Égalité' : ex.fighters[ex.winner].pokemon.name;
  const gap = Math.abs(ex.finalPv[0] - ex.finalPv[1]);
  return html`
    <section class="page sheet sheet--combat ${options.answerKey ? 'sheet--answer-key' : ''}">
      <header class="sheet__header">
        <div>
          <h1 class="sheet__title">Combat Pokémon ${options.answerKey ? raw('<span class="tag">Corrigé</span>') : ''}</h1>
          <p class="sheet__meta">Mathématiques · ${ex.level} · Période ${ex.period} · n° ${ex.seed}</p>
        </div>
        <div class="sheet__identity">
          <span>Prénom : <span class="line">${options.studentName ?? ''}</span></span>
          <span>Date : <span class="line"></span></span>
        </div>
      </header>

      <div class="consigne">
        <span class="picto" aria-hidden="true">🧮</span>
        <p>Lis les règles, regarde les deux cartes, puis calcule les PV restants après chaque manche.</p>
      </div>

      ${renderRules(ex)}

      <div class="arena">
        ${renderCard(a)}
        <span class="versus">VS</span>
        ${renderCard(b)}
      </div>

      <table class="rounds">
        <thead>
          <tr>
            <th class="col-round">Manche</th>
            <th>Qui attaque ?</th>
            <th>Attaque</th>
            <th>Dégâts</th>
            <th>PV restants</th>
          </tr>
        </thead>
        <tbody>
          ${ex.rows.map((row) => (row.kind === 'attack' ? renderAttackRow(row, ex, options) : renderPotionRow(row, ex, options)))}
        </tbody>
      </table>

      <div class="questions">
        <p>Qui a gagné le combat ? ${answerBox(winnerName, options, 'answer--wide')}</p>
        ${ex.rules.askGap ? html`<p>Combien de PV d'écart à la fin ? ${answerBox(gap, options)}</p>` : ''}
      </div>

      <footer class="sheet__footer">
        <span>Pokexo</span>
        <span>Données Pokémon : Tyradex (tyradex.app)</span>
      </footer>
    </section>`.html;
}
