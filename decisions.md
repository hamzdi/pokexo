# Decisions

## 2026-10-13 — Source de données : Tyradex
Données FR natives, MIT, sprites hébergés. Contraintes : cache local obligatoire, User-Agent avec contact, attribution en pied de page, usage non commercial.

## 2026-10-13 — Stats réelles rééchelonnées, jamais utilisées brutes
Les PV/attaques réels (45-255) dépassent les attendus CP. Les PV et dégâts pédagogiques sont dérivés par niveau/période ; les stats réelles ne servent qu'à ordonner (plus fort / plus faible).

## 2026-10-13 — Les noms de Pokémon ne sont jamais à écrire par l'élève
Ils sont imprimés, remplacés par le sprite ou par une périphrase ("le Pokémon de feu").

## 2026-10-13 — Architecture : artifact autonome (page unique), pas de backend
Tyradex autorise CORS depuis claude.ai et la génération + le PDF (impression navigateur) tiennent côté client. Un bundle JSON gen 1-2 est commité pour respecter la consigne de cache. Stack TypeScript (Vite + Vitest) enveloppée par un Makefile ; Python abandonné. À confirmer par Hamza.

## 2026-10-13 — Écriture : consignes en scripte, modèles à copier en cursive
Choix par défaut aligné sur la pratique CP ; désactivable dans l'interface.

## 2026-10-13 — Dépôt GitHub perso `hamzdi/pokexo`, privé, fichiers de suivi `.md` versionnés
Le compte GitHub actif localement est le compte pro ; le dépôt est créé sous le compte perso avec une identité git locale au dépôt.

## 2026-10-13 — Hébergement : build statique unique, publiable en artifact ET en GitHub Pages
Le même `dist/index.html` sert aux deux. GitHub Pages via Actions sur `main`. Attention : Pages sur un dépôt privé exige un compte GitHub Pro ; sinon passer le dépôt en public (projet non commercial, données MIT).

## 2026-10-13 — Remote git avec identifiant explicite `hamzdi@github.com`
Évite tout push avec le compte pro `hdiouane-actee` quel que soit le compte `gh` actif.

## 2026-10-13 — Stack TypeScript sans framework, templates HTML en chaînes
Vite + Vitest, aucun framework UI : les fiches sont des chaînes HTML générées par un tag `html` qui échappe les valeurs et compose des fragments. Les noms de classes CSS sont le contrat avec les maquettes Claude Design, qui remplaceront le style provisoire.

## 2026-10-13 — PDF par impression navigateur
`@page A4` + `window.print()` ; pas de bibliothèque PDF. Chaque fiche est une `section.page`, les corrigés sont regroupés en fin de document.

## 2026-10-13 — Règles du combat par niveau/période dans un tableau unique
`COMBAT_RULES[level][period]` fixe PV, dégâts, manches, retenue autorisée/obligatoire, bonus ×2, potion et question d'écart. En CP, les PV sont ajustés pour qu'aucune soustraction n'exige de retenue. Les PV pédagogiques dérivent des HP réels (ordre conservé, valeurs rééchelonnées).

## 2026-10-13 — Maquettes Claude Design non reprises
Le canevas Claude Design (charte, composants, gabarits A4) a été lu mais Hamza préfère la mise en page déjà implémentée, jugée plus claire. On garde les classes et le style actuels ; la maquette reste disponible comme source d'inspiration ponctuelle (polices, pictos, lignage Seyès).

## 2026-10-13 — Charte Claude Design adoptée, sauf le tableau de manches
Après lecture du canevas, Hamza retient la maquette dans son ensemble (charte, cartes, lignes de comparaison, Seyès, écran) et conserve le tableau de manches de la première version, jugé plus clair. `src/pokexo.css` est copié tel quel depuis la maquette ; les ajouts et surcharges vivent dans `src/style.css`.

## 2026-10-13 — Deux attaques à dégâts fixes par Pokémon
Les cartes listent deux attaques et leurs dégâts ; chaque manche réutilise l'une d'elles. En CP, la première attaque est assez petite pour que ses répétitions ne franchissent jamais une dizaine, la seconde est une dizaine entière à partir de P4 ; le choix de l'attaque préserve les unités nécessaires aux coups suivants. Le premier coup reçu par un Pokémon ne le met jamais KO.

## 2026-10-13 — Graines par exercice
Chaque générateur dérive sa graine de `"<exercice>:<numéro>"`, donc un même numéro de fiche produit des contenus différents selon l'exercice tout en restant reproductible.

## 2026-10-13 — Manche mystère = variante de rendu du combat
Même générateur, graine dérivée pour obtenir un autre combat ; seuls les dégâts des manches ×1 choisies sont cachés, les PV restants sont imprimés. Évite un second moteur de combat.

## 2026-10-13 — Fiche d'identité : vrai/faux en CP, questions ouvertes en CE1
Les énoncés faux sont construits à partir d'un autre Pokémon (type, catégorie, évolution) ou d'une taille décalée, pour rester plausibles. Poids arrondi au kilo entier (pas de décimaux avant le CE2).

## 2026-10-13 — Phrase en désordre : le nom du Pokémon est une étiquette, jamais écrit
L'étiquette porte le sprite et le nom imprimé ; dans la copie en cursive, le nom est remplacé par le sprite en marge et dans le modèle.

## 2026-10-13 — Sprites embarqués dans le bundle (WebP 192 px, data URI)
Les sprites Tyradex (PNG 512 px, ~125 Ko) chargés à la volée depuis GitHub laissaient des cases vides à l'affichage et à l'impression quand des dizaines d'images partaient en même temps. Ils sont désormais réduits par `sharp` au build de données et inlinés : page de 2,8 Mo, aucune requête image à l'exécution, impression fiable et hors ligne. L'URL d'origine reste dans `spriteUrl` pour l'attribution.

## 2026-10-13 — Filtre de Pokémon global, avec vivier minimum de 12
Le filtre par types et l'exclusion des légendaires s'appliquent à toutes les fiches, pas seulement au combat : plus simple à comprendre et cohérent sur un pack. Si moins de 12 Pokémon correspondent, le vivier est complété avec d'autres Pokémon et l'interface le signale, pour que duels, grille et dictée restent générables. Le filtre n'est pas encodé dans le numéro de fiche.

## 2026-10-13 — Légendaires : liste fixe des 11 Pokémon de gen 1-2
Tyradex n'expose pas de drapeau « légendaire » ; la liste est codée dans le script de données.

## 2026-10-13 — Manche super efficace : badge ×2 et ligne teintée, cartes de combat élargies
Le libellé « Super efficace ! » sur deux lignes faisait déborder les combats où toutes les manches sont ×2 (Dragon contre Dragon). Remplacé par un badge « ×2 » après le nom de l'attaque et un fond orangé de ligne, expliqués dans les règles. Cartes de combat élargies (CP 70 mm, CE1 58 mm) pour que les noms d'attaques restent sur une ligne, suggestion de Hamza.

## 2026-10-14 — PV réels dès le CP P3, PV fixes avant
Demande de Hamza : les PV changeaient d'une fiche à l'autre et ne correspondaient pas à Tyradex. Désormais : CP P3-P5 et CE1 utilisent la statistique PV réelle, en ne tirant que les Pokémon sous le plafond de la période (59, 79, 99, puis 100, 200, 255) ; CP P1-P2 gardent une mise à l'échelle déterministe (un Pokémon a toujours les mêmes PV pour une période) et portent la mention « PV adaptés au niveau ». Plus aucun ajustement de PV ni aléa : le « sans retenue » en CP est obtenu en filtrant les paires faisables et en autorisant des dégâts en dizaines entières (10, 20, 30) à partir de P3, car la plupart des PV réels finissent par 0 ou 5. Plafond CP P5 à 99 car 100 − 30 exige une retenue.

## 2026-10-14 — Aucun premier coup létal
Chaque camp doit disposer d'une attaque qui ne met pas l'adversaire KO en un coup, même doublée ; les Pokémon trop faibles pour la période sont écartés (ex. Abra en CE1 P2, Pichu en CE1 P3).
