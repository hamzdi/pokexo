# Bugs

_Aucun bug pour le moment._

## 2026-10-13 — Double échappement des fragments HTML imbriqués (corrigé)
Le tag `html` renvoyait une chaîne, ré-échappée par le template parent : le corrigé affichait du HTML brut. Détecté par `tests/render.test.ts`. Corrigé en renvoyant un `Fragment` reconnu comme sûr.

## 2026-10-13 — Débordement A4 des fiches combat (corrigé)
Les cellules « PV restants » (étiquette au-dessus de la case) mesuraient 16,7 mm au lieu de 10 mm, et les fiches CE1 P4–P5 à six lignes dépassaient la page. Mesuré dans le navigateur, corrigé en plaçant l'étiquette en ligne et en mettant les questions finales côte à côte. Vérifié par balayage de 480 fiches.

## 2026-10-13 — Retenue possible en CP avec les attaques fixes (corrigé)
Les dégâts minimaux CP P4–P5 (5) rendaient impossible le « sans retenue » sur deux coups, et une grosse attaque pouvait consommer les unités nécessaires aux coups suivants. Détecté par `tests/combat.test.ts`.

## 2026-10-13 — Débordement de la manche mystère en CP P4–P5 (corrigé)
Le paragraphe de règle supplémentaire faisait déborder les fiches CP déjà denses. Règle fusionnée dans la liste, classe `sheet--mystery` dédiée, combat CP légèrement compacté. Vérifié par balayage de 1 400 fiches.

## 2026-10-13 — Sprites manquants sur certaines fiches (corrigé)
Signalé par Hamza sur « Combat » et « Qui a le plus de PV ? ». Les 251 URL répondaient en 200 : le problème venait du chargement simultané de dizaines d'images distantes (lenteur ou refus temporaire de GitHub), pas de Pokémon sans image. Corrigé en embarquant les sprites dans le bundle.

## 2026-10-13 — Débordement des cartes avec attaques Dragon et Fée (corrigé)
Révélé par le filtre « Dragon seul » : « Souffle du dragon » et « Étincelle magique » passaient sur deux lignes dans les cartes. Noms remplacés par des attaques réelles plus courtes (Draco-Souffle, Draco-Griffe, Éclat magique, Câlinerie) et retour à la ligne interdit dans la liste des attaques.

## 2026-10-14 — PV réels : retenue avec 100 PV et KO au premier coup (corrigés avant livraison)
Détectés par les tests lors du passage aux PV réels : 100 − 30 flagué comme retenue (plafond CP P5 ramené à 99) ; Abra 25 PV mis KO par une attaque de 29 en CE1 P2 (contrainte d'attaque non létale au premier coup).

## 2026-10-14 — Filtre étroit + plafond de PV : plantage silencieux de la comparaison (corrigé avant livraison)
Avec « Acier seul » en CP P3, moins de dix Pokémon passaient sous 59 PV ; le générateur levait une erreur non interceptée et l'aperçu gardait les anciennes fiches. Les générateurs complètent désormais avec les Pokémon aux PV les plus proches du plafond, et l'interface affiche une page d'erreur explicite si une fiche reste impossible.
