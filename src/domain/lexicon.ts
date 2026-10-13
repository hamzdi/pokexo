/**
 * Dictation material per level and period.
 *
 * Each item is a sentence template: `{P}` (and optionally `{Q}`) is replaced by
 * a printed Pokémon name, `___` is the gap the child writes. The answer is the
 * word or group of words dictated. Children never write Pokémon names.
 *
 * Sounds and grammar points follow a common French CP/CE1 progression; the
 * lists are a starting point to be validated by a teacher.
 */
import type { Level, Period } from './types.ts';

export interface LexiconItem {
  template: string;
  answer: string;
}

export interface LexiconPeriod {
  /** Short label of the sounds or grammar point targeted. */
  focus: string;
  /** Number of sentences on a sheet. */
  sentences: number;
  items: LexiconItem[];
}

export const LEXICON: Record<Level, Record<Period, LexiconPeriod>> = {
  CP: {
    1: {
      focus: 'Sons a, i, o, u, e · l, m, r',
      sentences: 4,
      items: [
        { template: '{P} est mon ___.', answer: 'ami' },
        { template: '{P} dort dans un ___.', answer: 'lit' },
        { template: '{P} saute sur le ___.', answer: 'mur' },
        { template: '{P} a vu un ___.', answer: 'rat' },
        { template: '{P} a ___ à la patte.', answer: 'mal' },
        { template: '{P} a ___ un livre.', answer: 'lu' },
        { template: '{P} est sur la ___.', answer: 'mare' },
        { template: '{P} a une ___.', answer: 'moto' },
      ],
    },
    2: {
      focus: 'Sons p, t, n, s, ou, ch',
      sentences: 4,
      items: [
        { template: '{P} a une grosse ___.', answer: 'patte' },
        { template: '{P} est tout ___.', answer: 'petit' },
        { template: '{P} boit dans une ___.', answer: 'tasse' },
        { template: '{P} passe sur le ___.', answer: 'pont' },
        { template: '{P} attrape une ___.', answer: 'souris' },
        { template: '{P} joue avec un ___.', answer: 'chat' },
        { template: '{P} mange un ___.', answer: 'chou' },
        { template: '{P} a une ___.', answer: 'pipe' },
      ],
    },
    3: {
      focus: 'Sons on, an, in, oi · v, f, b, d',
      sentences: 4,
      items: [
        { template: '{P} mange un ___.', answer: 'bonbon' },
        { template: '{P} appelle sa ___.', answer: 'maman' },
        { template: '{P} voit un ___.', answer: 'lapin' },
        { template: '{P} croque une ___.', answer: 'poire' },
        { template: '{P} court très ___.', answer: 'vite' },
        { template: '{P} est très ___.', answer: 'fort' },
        { template: '{P} lance une ___.', answer: 'boule' },
        { template: '{P} a un ballon ___.', answer: 'doré' },
      ],
    },
    4: {
      focus: 'Sons g, j, z, eu, ai, ei',
      sentences: 5,
      items: [
        { template: '{P} attend à la ___.', answer: 'gare' },
        { template: '{P} porte une ___.', answer: 'jupe' },
        { template: '{P} a ___ carte.', answer: 'zéro' },
        { template: '{P} crache du ___.', answer: 'feu' },
        { template: '{P} joue dans la ___.', answer: 'neige' },
        { template: '{P} boit du ___.', answer: 'lait' },
        { template: '{P} est ___.', answer: 'bleu' },
        { template: '{P} a une ___ de maison.', answer: 'jolie' },
      ],
    },
    5: {
      focus: 'Sons gn, ill, ph, ê',
      sentences: 5,
      items: [
        { template: '{P} grimpe sur la ___.', answer: 'montagne' },
        { template: '{P} joue avec une ___.', answer: 'fille' },
        { template: '{P} est gros comme un ___.', answer: 'éléphant' },
        { template: '{P} suit un ___.', answer: 'papillon' },
        { template: '{P} prend une ___.', answer: 'photo' },
        { template: '{P} a mal à la ___.', answer: 'tête' },
        { template: '{P} regarde la ___.', answer: 'ligne' },
        { template: '{P} se cache dans la ___.', answer: 'paille' },
      ],
    },
  },
  CE1: {
    1: {
      focus: 'Phrases simples · mots courants',
      sentences: 5,
      items: [
        { template: '{P} ___ dans la forêt.', answer: 'court vite' },
        { template: '{P} mange ___.', answer: 'une pomme rouge' },
        { template: '{P} dort ___.', answer: 'sous un arbre' },
        { template: '{P} a ___.', answer: 'beaucoup d’amis' },
        { template: '{P} saute ___.', answer: 'par-dessus le mur' },
        { template: '{P} boit ___.', answer: 'de l’eau fraîche' },
        { template: '{P} regarde ___.', answer: 'les étoiles' },
        { template: '{P} habite ___.', answer: 'près du lac' },
      ],
    },
    2: {
      focus: 'Accord nom · adjectif',
      sentences: 5,
      items: [
        { template: '{P} a ___.', answer: 'une petite queue' },
        { template: '{P} voit ___.', answer: 'des fleurs jaunes' },
        { template: '{P} porte ___.', answer: 'un sac vert' },
        { template: '{P} montre ___.', answer: 'de grandes oreilles' },
        { template: '{P} trouve ___.', answer: 'une pierre brillante' },
        { template: '{P} aime ___.', answer: 'les baies sucrées' },
        { template: '{P} cache ___.', answer: 'des pattes rapides' },
        { template: '{P} dort dans ___.', answer: 'une grotte sombre' },
      ],
    },
    3: {
      focus: 'Verbes au présent · il / ils',
      sentences: 5,
      items: [
        { template: '{P} ___ dans la rivière.', answer: 'nage' },
        { template: '{P} et {Q} ___ dans la rivière.', answer: 'nagent' },
        { template: '{P} ___ une pomme.', answer: 'mange' },
        { template: '{P} et {Q} ___ au ballon.', answer: 'jouent' },
        { template: '{P} ___ très haut.', answer: 'saute' },
        { template: '{P} et {Q} ___ dans la forêt.', answer: 'courent' },
        { template: '{P} ___ sur un rocher.', answer: 'grimpe' },
        { template: '{P} et {Q} ___ le soleil.', answer: 'regardent' },
      ],
    },
    4: {
      focus: 'Homophones a / à · et / est',
      sentences: 5,
      items: [
        { template: '{P} ___ une carte rare.', answer: 'a' },
        { template: '{P} va ___ l’école.', answer: 'à' },
        { template: '{P} ___ très fort.', answer: 'est' },
        { template: '{P} ___ {Q} sont amis.', answer: 'et' },
        { template: '{P} ___ gagné le combat.', answer: 'a' },
        { template: '{P} ___ fatigué ce soir.', answer: 'est' },
        { template: '{P} joue ___ la balle.', answer: 'à' },
        { template: '{P} court ___ {Q} saute.', answer: 'et' },
      ],
    },
    5: {
      focus: 'Futur · passé composé',
      sentences: 5,
      items: [
        { template: 'Demain, {P} ___ un nouveau combat.', answer: 'gagnera' },
        { template: 'Hier, {P} ___ une potion.', answer: 'a bu' },
        { template: 'Demain, {P} ___ à la mer.', answer: 'ira' },
        { template: 'Hier, {P} ___ tout le gâteau.', answer: 'a mangé' },
        { template: 'Demain, {P} et {Q} ___ ensemble.', answer: 'joueront' },
        { template: 'Hier, {P} ___ dans le lac.', answer: 'a nagé' },
        { template: 'Demain, {P} ___ son ami.', answer: 'verra' },
        { template: 'Hier, {P} et {Q} ___ très vite.', answer: 'ont couru' },
      ],
    },
  },
};
