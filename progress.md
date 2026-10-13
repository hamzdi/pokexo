# Progress

## 2026-10-13
- Brainstorm initial : vision, contraintes pédagogiques CP/CE1, idées maths + français, répartition Claude Design / code.
- API Tyradex vérifiée (pokemon/25, types) : données FR complètes, sprites PNG, résistances, évolutions.
- Brief écrit dans `claudedocs/brainstorm-brief.md`. Questions ouvertes en attente de réponse.
- Itération 2 : réponses intégrées, architecture artifact retenue (à confirmer), progression P1–P5 rédigée, `claudedocs/design-brief.md` prêt à coller dans Claude Design.
- Dépôt git initialisé et poussé sur `hamzdi/pokexo` (privé).
- Itération 3 (branche `feat/scaffold`) : dépôt passé en public, GitHub Pages activé (source Actions), squelette Vite + TypeScript, bundle Tyradex gen 1-2 (251 Pokémon), générateur « Combat par manches » pour CP/CE1 P1–P5 avec corrigé, aperçu A4 et impression PDF, 17 tests GIVEN/WHEN/THEN verts, rendu vérifié dans un navigateur.
- Reste : fusionner la PR pour déclencher le premier déploiement Pages, intégrer les maquettes Claude Design, ajouter les autres exercices.
- PR #1 fusionnée sur `main`, workflow Pages réussi, application en ligne sur https://hamzdi.github.io/pokexo/.
- Itération 4 (branche `feat/compare-dictee`) : charte Claude Design adoptée (feuille `src/pokexo.css`, polices Andika/Lexend, pictos SVG, cartes, bandeau corrigé, coque de l'app) en gardant le tableau de manches maison. Deux exercices ajoutés : « Qui a le plus de PV ? » (comparaison, signe, écart) et « Dictée à trous » (lexique P1–P5, fiche enseignant). Combattants avec deux attaques à dégâts fixes. 26 tests verts ; balayage de 480 fiches rendues dans le navigateur sans débordement A4.
