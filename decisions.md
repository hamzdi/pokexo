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
