# Pokexo — Brief de brainstorm (2026-10-13)

## Vision
Générateur de fiches PDF d'exercices (français + maths) pour CP et CE1, univers Pokémon.
Source de données : Tyradex (https://tyradex.app) — API FR, MIT, non commercial, attribution + User-Agent requis.

## Ce que l'API fournit (vérifié sur /api/v1/pokemon/25 et /api/v1/types)
- `name.fr`, `category` ("Pokémon Souris"), `generation`, `pokedex_id`
- `sprites.regular` / `shiny` (PNG GitHub raw) — à mettre en cache local
- `types[]` avec `name` FR + `image` du badge
- `stats` réelles (hp 45, atk 80…) → trop grandes pour le CP, à **rééchelonner**
- `resistances[]` multiplicateurs 0 / 0,5 / 1 / 2 → base du "super efficace ×2" (CE1)
- `evolution.pre/next` avec condition → exercices d'ordre
- `height` "0,4 m", `weight` "6,0 kg" (texte, à parser) → cm / kg entiers
- `/types` : 18 types, noms FR courts et réguliers (feu, eau, plante, roche, vol, glace…)

## Contraintes pédagogiques
| | CP | CE1 |
|---|---|---|
| Nombres | ≤ 20 (P1-P3), ≤ 100 fin d'année | ≤ 1000, calcul posé ≤ 100 |
| Soustraction | sans retenue, par comptage à rebours | avec retenue |
| Multiplication | doubles uniquement | ×2, ×5, ×10 |
| Dictée | mots simples, syllabes CV, 3-6 mots | phrases courtes, accords simples |
| Écriture | lignes Seyès 3 mm, police scripte/cursive | Seyès 2,5 mm |
Les noms de Pokémon ne sont **jamais à écrire** : ils sont imprimés, remplacés par le sprite, ou désignés par "le Pokémon de feu".

## Idées — Mathématiques
1. **Combat par manches** (cœur) : 2 cartes, scénario de N attaques, tableau "PV restants" à remplir manche par manche. CP : PV 10-20, dégâts 1-5. CE1 : PV 50-100, dégâts 8-25, bonus "super efficace" ×2 selon la table des types.
2. **Qui gagne ?** : comparer les PV restants, entourer le vainqueur, écrire < > =.
3. **Manche mystère** : une case vide au milieu du tableau → addition à trou.
4. **Combien de manches pour le KO ?** : dégâts constants → soustractions itérées / division CE1.
5. **Potion / Baie** : +PV en cours de combat (addition mêlée aux soustractions).
6. **Équipe de 3** : total des PV de l'équipe, équipe la plus forte.
7. **Taille et poids** : convertir en cm/kg entiers, ranger du plus petit au plus grand, "plus lourd que".
8. **Numéros du Pokédex** : suite numérique à compléter, pair/impair, dizaines/unités, encadrer entre deux dizaines.
9. **Pokémon caché** : grille avec coordonnées (A3, B1…) → repérage dans l'espace.
10. **Boutique Poké Balls** : monnaie en euros (CE1), rendre la monnaie.
11. **Tableau à double entrée** : type attaquant × type défenseur → "efficace / normal / faible".
12. **Évolution** : remettre la chaîne dans l'ordre, "avant / après / entre".

## Idées — Français (sans écrire les noms de Pokémon)
1. **Dictée de mots** : lexique des types et du combat — feu, eau, roche, glace, vol, carte, combat, attaque, point. Graphies choisies par période (son étudié).
2. **Dictée de phrases à trous** : "Le Pokémon de ___ attaque." Le nom propre est imprimé ou remplacé par le sprite.
3. **Dictée "image"** : l'enseignant dicte, l'élève écrit sous le sprite correspondant le mot du type.
4. **Carte d'identité à lire** : fiche (catégorie, type, taille, évolution) → questions de compréhension (CP : relier, cocher ; CE1 : répondre par une phrase).
5. **Relier image ↔ catégorie** : "Pokémon Souris", "Pokémon Graine", "Pokémon Tortue".
6. **Grammaire** : masculin/féminin (une attaque, un combat), singulier/pluriel (des attaques), adjectifs (grand, petit, lourd, léger, rapide), verbes d'action (nage, vole, saute, attaque).
7. **Phrase en désordre** : remettre les mots-étiquettes dans l'ordre + majuscule/point.
8. **Phonologie CP** : entourer les mots où l'on entend [f], [o], [ʃ]… parmi les mots du lexique.
9. **Ordre alphabétique CE1** : ranger les noms de types.
10. **Production d'écrit CE1** : "Mon Pokémon est… Il a… Il peut…" avec amorces et banque de mots.
11. **Vrai / Faux** : lecture de la fiche d'identité.

## Format de fiche cible
- A4 portrait, N&B imprimable (sprites en couleur mais lisibles en gris), en-tête Prénom / Date / Niveau.
- Consigne courte avec picto (écoute, écris, calcule, relie, entoure).
- Corrigé sur page séparée. Mention "Données : Tyradex" en pied de page.
- Chaque fiche générée à partir d'une **graine** (reproductible) + niveau + période.

## Répartition Claude Design vs code
### Claude Design (visuel, maquettes → HTML/CSS)
- Carte Pokémon pédagogique (sprite, badge de type, PV en gros, 1-2 attaques avec dégâts).
- Gabarit de fiche A4 : en-tête, bloc consigne + picto, zone exercice, pied de page attribution.
- Tableau de combat par manches (colonnes manche / attaque / dégâts / PV restants).
- Lignes Seyès (3 mm CP, 2,5 mm CE1) et cadres d'écriture.
- Page corrigé.
- Jeu de pictos de consigne + charte : polices lisibles (Andika / Lexend / Belle Allure pour cursive), contrastes N&B.
- Variantes CP vs CE1 (taille de police, densité).
### Code (hors Design)
- Client Tyradex avec cache disque (JSON + sprites), User-Agent, sélection des Pokémon "connus" (gen 1-2).
- Rééchelonnage pédagogique des stats et des dégâts par niveau/période.
- Générateurs d'exercices : fonctions pures, graine → énoncé + corrigé, tests GIVEN/WHEN/THEN.
- Rendu : templates HTML (Jinja) remplis depuis la maquette Design → PDF (WeasyPrint ou Chromium headless).
- CLI (puis éventuellement petite UI web) : `pokexo generate --niveau ce1 --matiere maths --exo combat --seed 42`.

## Questions ouvertes
1. Utilisateur final : toi pour tes enfants, un enseignant, les deux ? (impacte CLI vs interface web)
2. Impression en N&B uniquement ou couleur possible ?
3. Écriture cursive imposée (fiches à copier) ou scripte suffisante ?
4. Dictée : fiche enseignant (texte à lire) + fiche élève (lignes) suffisent ?
5. Périodes scolaires à cibler dès la v1 (P1-P5) ou juste "CP" / "CE1" ?
6. Stack : Python + uv + make (tes habitudes) ?
7. Faut-il un "pack" de 10 fiches variées d'un coup, ou une fiche à la fois ?

---

## Réponses du 2026-10-13 (itération 2)
1. **Utilisateurs** : parents et enseignants. Interface web, idéalement un artifact Claude.
2. **Couleur** : génération en couleur, le N&B se choisit à l'impression → sprites couleur, mais contraste vérifié en gris.
3. **Écriture** : point à clarifier (cursive vs scripte, voir ci-dessous). Défaut proposé : consignes en scripte, modèles à copier en cursive.
4. **Dictée** : fiche enseignant (texte à lire) + fiche élève stylisée avec les sprites comme repères visuels.
5. **Périodes** : P1 à P5 pour CP et CE1 dès la v1.
6. **Versionnement** : dépôt GitHub perso `hamzdi/pokexo`, fichiers `.md` de suivi inclus.
7. **Génération** : sélection libre des exercices et des niveaux, une fiche ou un pack, un seul PDF en sortie.

## Faits techniques vérifiés
- `https://tyradex.app` renvoie `access-control-allow-origin: https://claude.ai` → appels directs possibles depuis un artifact.
- Sprites GitHub raw : `access-control-allow-origin: *`.
- `/api/v1/gen/1` pèse ~250 Ko → un bundle gen 1-2 embarqué dans la page reste très en dessous des 16 Mo.
- Toolchain locale : node 26, npm, uv, python3.

## Architecture recommandée : artifact autonome
- **Une seule page HTML** (Vite + TypeScript, build en fichier unique) publiée comme artifact.
- **Données** : bundle JSON pré-construit (gen 1-2, stats rééchelonnées, sprites référencés par URL) commité dans le dépôt ; fallback appel live Tyradex si un Pokémon manque. Respecte la consigne de cache de l'API.
- **Générateurs** : fonctions pures TypeScript, `(niveau, période, exercice, graine) → { énoncé, corrigé }`. Tests Vitest en GIVEN/WHEN/THEN.
- **PDF** : rendu HTML paginé A4 avec `@page` + `window.print()` (le navigateur produit le PDF). Pas de dépendance serveur ni de lib PDF lourde.
- **Makefile** enveloppe `npm` (`make dev`, `make test`, `make build`, `make data`).
- Conséquence : la stack Python n'est plus nécessaire. À confirmer.

## Interface (écran unique)
1. **Colonne gauche — paramètres** : niveau (CP / CE1), période (P1–P5), matière, liste d'exercices cochables avec nombre de fiches par exercice, graine optionnelle, prénom(s) optionnels.
2. **Centre — aperçu** paginé A4 de la ou des fiches, mis à jour en direct.
3. **Barre d'action** : "Regénérer", "Imprimer / PDF", bascule "avec corrigé".
4. Pack : chaque fiche sur sa page, corrigés regroupés en fin de document.

## Progression P1–P5 (brouillon à valider par un enseignant)
### CP
| Période | Nombres / calcul | Sons dictée | Grammaire / lecture |
|---|---|---|---|
| P1 | 0–10, compter, comparer | a i o u e, l m r | lire des mots-images |
| P2 | 0–20, +/− sans retenue ≤ 10 | p t n s ou ch | majuscule / point |
| P3 | 0–30, doubles, +/− ≤ 20 | on an in oi v f | phrase simple à trous |
| P4 | 0–79, dizaines/unités | b d g j z eu ai | un / une, le / la |
| P5 | 0–100, petits problèmes | gn ill ph ê | pluriel -s, phrase en désordre |
### CE1
| Période | Nombres / calcul | Dictée | Grammaire |
|---|---|---|---|
| P1 | ≤ 100, addition posée | mots + phrase courte | nom / verbe |
| P2 | ≤ 200, soustraction avec retenue | accord nom-adjectif | masculin / féminin |
| P3 | ≤ 1000, ×2 ×5 ×10 | verbes au présent (il / ils) | singulier / pluriel |
| P4 | ×3 ×4, mesures (cm, kg) | homophones a/à, et/est | adjectif |
| P5 | partage, monnaie, problèmes à 2 étapes | futur / passé composé (intro) | ordre alphabétique |

## Cursive ou scripte : de quoi il s'agit
- **Scripte** : lettres détachées, comme l'imprimé de ce document. Utilisée pour les consignes et les textes à lire.
- **Cursive** : écriture "attachée" apprise en CP. Si l'élève doit **copier** un modèle (mot, phrase), le modèle est généralement donné en cursive (police Belle Allure ou équivalent).
- Choix par défaut : consignes en scripte, modèles à copier en cursive, option désactivable dans l'interface.

## Hébergement (ajout)
Deux cibles pour un seul build statique : artifact Claude (partage rapide, privé par défaut) et GitHub Pages (URL stable pour les enseignants). Workflow Actions : build Vite → déploiement Pages à chaque push sur `main`. Si le dépôt reste privé, Pages nécessite GitHub Pro ; sinon le passer en public.
