/** HTML rendering of the "Équipe de trois" addition exercise. */
import { typeSlug } from '../domain/attacks.ts';
import type { Team, TeamExercise } from '../domain/team.ts';
import { answerBox, renderSheet } from './frame.ts';
import { html, type Fragment } from './html.ts';
import type { SheetOptions } from './combat.ts';

function renderTeam(team: Team, index: number, ex: TeamExercise, key: boolean): Fragment {
  const circled = key && ex.winner === index;
  return html`
    <div class="team ${circled ? 'is-circled' : ''}">
      <h2 class="team__name">${team.name}</h2>
      <ul class="team__members">
        ${team.members.map(
          (m) => html`
            <li class="mini">
              <img class="pk-sprite pk-sprite--sm pk-sprite--img" src="${m.pokemon.sprite}" alt="" style="--t: var(--type-${typeSlug(m.pokemon.types[0] ?? 'Normal')})" />
              <span class="mini__txt"><span class="mini__name">${m.pokemon.name}</span></span>
              <span class="mini__pv"><small>PV</small>${m.pv}</span>
            </li>`,
        )}
      </ul>
      <p class="team__sum">${team.members.map((m) => m.pv).join(' + ')} = ${answerBox(team.total, key)}</p>
    </div>`;
}

export function renderTeamSheet(ex: TeamExercise, options: SheetOptions): string {
  const key = options.answerKey;
  const body = html`
    <div class="teams">${ex.teams.map((team, index) => renderTeam(team, index, ex, key))}</div>
    <p class="section-title">Quelle équipe a le plus de PV en tout ? Entoure-la.</p>
    ${ex.rules.realPv ? '' : html`<p class="pv-note">PV adaptés au niveau : les vrais PV de ces Pokémon sont plus grands.</p>`}`;
  return renderSheet({
    title: ex.rules.size === 2 ? 'Les équipes de deux' : 'Les équipes de trois',
    subject: 'Mathématiques',
    level: ex.level,
    period: ex.period,
    seed: ex.seed,
    modifier: 'team',
    answerKey: key,
    studentName: options.studentName,
    picto: 'calcule',
    consigne: "Additionne les PV de chaque équipe, puis entoure l'équipe la plus forte.",
    body,
  });
}
