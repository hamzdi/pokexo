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

/** Mystery variant: remaining PV are printed, the damage of these rounds is hidden. */
export interface MysterySheetOptions extends SheetOptions {
  hiddenRounds: readonly number[];
}

function answerBox(value: number | string, options: SheetOptions, extraClass = ''): Fragment {
  return box(value, options.answerKey, extraClass);
}

function plainPv(pvAfter: number): Fragment {
  return html`<strong class="pv-plain">${pvAfter === 0 ? '0 — KO !' : pvAfter}</strong>`;
}

function renderAttackRow(row: AttackRow, ex: CombatExercise, options: SheetOptions, hidden?: readonly number[]): Fragment {
  const attacker = ex.fighters[row.attacker];
  const defender = ex.fighters[row.defender];
  let damageCell: Fragment;
  if (hidden) {
    damageCell = hidden.includes(row.round)
      ? answerBox(row.damage, options, 'box--sm')
      : row.multiplier === 2
        ? html`${row.baseDamage} × 2 = ${row.damage}`
        : html`${row.damage}`;
  } else {
    damageCell = row.multiplier === 2 ? html`${row.baseDamage} × 2 = ${answerBox(row.damage, options, 'box--sm')}` : html`${row.damage}`;
  }
  return html`
    <tr class="row-attack ${row.multiplier === 2 ? 'row-super' : ''}">
      <td class="col-round">${row.round}</td>
      <td class="col-attacker">
        <span class="who"><img class="who__sprite" src="${attacker.pokemon.sprite}" alt="" />${attacker.pokemon.name}</span>
      </td>
      <td class="col-attack">${row.attackName}${row.multiplier === 2 ? html` <span class="super" title="Super efficace">×2</span>` : ''}</td>
      <td class="col-damage">${damageCell}</td>
      <td class="col-pv">
        <span class="col-pv__who">${defender.pokemon.name}</span>
        ${hidden ? plainPv(row.pvAfter) : answerBox(row.pvAfter === 0 ? '0 — KO !' : row.pvAfter, options)}
      </td>
    </tr>`;
}

function renderPotionRow(row: PotionRow, ex: CombatExercise, options: SheetOptions, hidden?: readonly number[]): Fragment {
  const fighter = ex.fighters[row.fighter];
  return html`
    <tr class="row-potion">
      <td class="col-round"></td>
      <td colspan="3" class="col-potion">
        <span class="potion">Potion !</span> ${fighter.pokemon.name} récupère <strong>+${row.amount} PV</strong>
      </td>
      <td class="col-pv">
        <span class="col-pv__who">${fighter.pokemon.name}</span>
        ${hidden ? plainPv(row.pvAfter) : answerBox(row.pvAfter, options)}
      </td>
    </tr>`;
}

function renderRules(ex: CombatExercise, hidden?: readonly number[]): Fragment {
  const lines = [
    'Chaque Pokémon a des <strong>PV</strong> (points de vie) et deux attaques.',
    'Quand il reçoit une attaque, il perd autant de PV que les <strong>dégâts</strong> écrits sur la carte.',
    "S'il arrive à 0 PV, il est <strong>KO</strong> et le combat s'arrête.",
  ];
  if (ex.rules.superEffective) lines.push('Manche sur fond orangé avec <strong>×2</strong> : l\u2019attaque est <strong>super efficace</strong>, les dégâts sont doublés.');
  if (ex.rules.potions) lines.push('Une <strong>potion</strong> redonne des PV.');
  if (hidden) lines.push('<strong>Manche mystère :</strong> les PV restants sont écrits, retrouve les dégâts (PV avant − PV après).');
  return html`<ul class="rules">${lines.map((line) => html`<li>${raw(line)}</li>`)}</ul>`;
}

export function renderCombatSheet(ex: CombatExercise, options: SheetOptions, hidden?: readonly number[]): string {
  const [a, b] = ex.fighters;
  const winnerName = ex.winner === null ? 'Égalité' : ex.fighters[ex.winner].pokemon.name;
  const gap = Math.abs(ex.finalPv[0] - ex.finalPv[1]);
  const body = html`
      ${renderRules(ex, hidden)}

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
          ${ex.rows.map((row) => (row.kind === 'attack' ? renderAttackRow(row, ex, options, hidden) : renderPotionRow(row, ex, options, hidden)))}
        </tbody>
      </table>

      <div class="questions">
        <p>Qui a gagné le combat ? ${answerBox(winnerName, options, 'box--wide')}</p>
        ${ex.rules.askGap ? html`<p>Écart de PV à la fin ? ${answerBox(gap, options)}</p>` : ''}
      </div>`;
  return renderSheet({
    title: hidden ? 'Manche mystère' : 'Combat Pokémon',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: hidden ? 'mystery' : 'combat',
    answerKey: options.answerKey,
    studentName: options.studentName,
    picto: 'calcule',
    consigne: hidden
      ? 'Lis les règles et regarde les cartes. Retrouve les dégâts cachés de chaque manche mystère.'
      : 'Lis les règles, regarde les deux cartes, puis calcule les PV restants après chaque manche.',
    body,
  });
}

export function renderMysterySheet(ex: CombatExercise, options: MysterySheetOptions): string {
  return renderCombatSheet(ex, options, options.hiddenRounds);
}
