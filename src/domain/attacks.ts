/**
 * Tyradex does not expose moves, so each of the 18 types gets one short,
 * readable French attack name. Children never have to write these words.
 */
export const ATTACK_BY_TYPE: Record<string, string> = {
  Normal: 'Charge',
  Feu: 'Flammèche',
  Eau: "Pistolet à eau",
  Plante: 'Fouet lianes',
  Électrik: 'Éclair',
  Glace: 'Boule de glace',
  Combat: 'Coup de poing',
  Poison: 'Dard venin',
  Sol: 'Jet de sable',
  Vol: 'Tornade',
  Psy: 'Choc mental',
  Insecte: 'Piqûre',
  Roche: 'Jet de pierres',
  Spectre: 'Ombre',
  Dragon: 'Souffle du dragon',
  Ténèbres: 'Morsure',
  Acier: "Griffe d'acier",
  Fée: 'Étincelle magique',
};

export function attackNameFor(type: string): string {
  return ATTACK_BY_TYPE[type] ?? 'Charge';
}

/** ASCII slug of a French type name, used for CSS class names ("Électrik" -> "electrik"). */
export function typeSlug(type: string): string {
  return type
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
