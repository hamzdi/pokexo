/**
 * HTML rendering of a combat exercise, as an A4 page.
 *
 * The same template renders the student sheet and the answer key: with
 * `answerKey` enabled, every answer box is filled instead of left blank.
 */
import type { AttackRow, CombatExercise, PotionRow } from '../domain/combat.ts';
import { renderCard } from './card.ts';
import { answerBox as box, renderSheet } from './frame.ts';
import { html, raw, type Fragment } from './html.ts';

export interface SheetOptions {
  answerKey: boolean;
  studentName?: string;
}

function answerBox(value: number | string, options: SheetOptions, extraClass = ''): Fragment {
  return box(value, options.answerKey, extraClass);
}

function renderAttackRow(row: AttackRow, ex: CombatExercise, options: SheetOptions): Fragment {
  const attacker = ex.fighters[row.attacker];
  const defender = ex.fighters[row.defender];
  const damageCell =
    row.multiplier === 2 ? html`${row.baseDamage} × 2 = ${answerBox(row.damage, options, 'box--sm')}` : html`${row.damage}`;
  return html`
    <tr class="row-attack">
      <td class="col-round">${row.round}</td>
      <td class="col-attacker">
        <span class="who"><img class="who__sprite" src="${attacker.pokemon.sprite}" alt="" />${attacker.pokemon.name}</span>
      </td>
      <td class="col-attack">${row.attackName}${row.multiplier === 2 ? html`<span class="super">Super efficace !</span>` : ''}</td>
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
    'Chaque Pokémon a des <strong>PV</strong> (points de vie) et deux attaques.',
    'Quand il reçoit une attaque, il perd autant de PV que les <strong>dégâts</strong> écrits sur la carte.',
    "S'il arrive à 0 PV, il est <strong>KO</strong> et le combat s'arrête.",
  ];
  if (ex.rules.superEffective) lines.push("Si l'attaque est <strong>super efficace</strong>, les dégâts sont doublés (× 2).");
  if (ex.rules.potions) lines.push('Une <strong>potion</strong> redonne des PV.');
  return html`<ul class="rules">${lines.map((line) => html`<li>${raw(line)}</li>`)}</ul>`;
}

export function renderCombatSheet(ex: CombatExercise, options: SheetOptions): string {
  const [a, b] = ex.fighters;
  const winnerName = ex.winner === null ? 'Égalité' : ex.fighters[ex.winner].pokemon.name;
  const gap = Math.abs(ex.finalPv[0] - ex.finalPv[1]);
  const body = html`
      ${renderRules(ex)}

      <div class="arena">
        ${renderCard({ pokemon: a.pokemon, pv: a.pv, moves: a.moves, role: ex.first === 0 ? 'Attaque en premier' : 'Attaque en second' })}
        <span class="vs">VS</span>
        ${renderCard({ pokemon: b.pokemon, pv: b.pv, moves: b.moves, role: ex.first === 1 ? 'Attaque en premier' : 'Attaque en second' })}
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
        <p>Qui a gagné le combat ? ${answerBox(winnerName, options, 'box--wide')}</p>
        ${ex.rules.askGap ? html`<p>Écart de PV à la fin ? ${answerBox(gap, options)}</p>` : ''}
      </div>`;
  return renderSheet({
    title: 'Combat Pokémon',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'combat',
    answerKey: options.answerKey,
    studentName: options.studentName,
    picto: 'calcule',
    consigne: 'Lis les règles, regarde les deux cartes, puis calcule les PV restants après chaque manche.',
    body,
  });
}
