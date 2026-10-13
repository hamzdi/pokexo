/**
 * Tyradex does not expose moves, so each of the 18 types gets two short,
 * readable French attack names. Children never have to write these words.
 */
export const ATTACKS_BY_TYPE: Record<string, [string, string]> = {
  Normal: ['Charge', 'Griffe'],
  Feu: ['Flammèche', 'Boule de feu'],
  Eau: ['Pistolet à eau', 'Bulles d’eau'],
  Plante: ['Fouet lianes', 'Tranche-herbe'],
  Électrik: ['Éclair', 'Étincelle'],
  Glace: ['Boule de glace', 'Souffle glacé'],
  Combat: ['Coup de poing', 'Coup de pied'],
  Poison: ['Dard venin', 'Gaz toxique'],
  Sol: ['Jet de sable', 'Tunnel'],
  Vol: ['Tornade', 'Coup d’aile'],
  Psy: ['Choc mental', 'Rafale psy'],
  Insecte: ['Piqûre', 'Toile'],
  Roche: ['Jet de pierres', 'Éboulement'],
  Spectre: ['Ombre', 'Léchouille'],
  Dragon: ['Draco-Souffle', 'Draco-Griffe'],
  Ténèbres: ['Morsure', 'Croc de nuit'],
  Acier: ['Griffe d’acier', 'Queue de fer'],
  Fée: ['Éclat magique', 'Câlinerie'],
};

export function attackNamesFor(type: string): [string, string] {
  return ATTACKS_BY_TYPE[type] ?? ATTACKS_BY_TYPE.Normal ?? ['Charge', 'Griffe'];
}

/** ASCII slug of a French type name, used for CSS class names ("Électrik" -> "electrik"). */
export function typeSlug(type: string): string {
  return type
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
