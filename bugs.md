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
