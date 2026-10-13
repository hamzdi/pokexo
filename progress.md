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
- PR #2 fusionnée, Pages redéployé.
- Itération 5 (branche `feat/more-exercises`) : quatre exercices ajoutés — « Manche mystère » (dégâts cachés, variante du combat), « Grille à coordonnées » (5×5 CP, 6×6 CE1 avec croix à dessiner), « Fiche d'identité » (lecture, vrai/faux CP, questions ouvertes CE1), « Phrase en désordre + copie » (étiquettes à découper, modèle cursif, lignes Seyès). 36 tests verts ; balayage de 1 400 fiches rendues sans débordement.
- PR #3 fusionnée, Pages redéployé : 7 exercices en ligne.
- Itération 6 (branche `fix/inline-sprites`) : sprites embarqués dans le bundle (WebP 192 px en data URI, 2,7 Mo) pour supprimer les images vides dues aux chargements distants ; script de données capable de repartir du bundle commité si l'API Tyradex est injoignable.
- Itération 7 (branche `feat/pokemon-filters`, empilée sur `fix/inline-sprites`) : filtre par types (18 badges cochables, Tous/Aucun) et interrupteur « Inclure les légendaires », appliqués au vivier de tous les exercices avec complément automatique à 12 Pokémon minimum. Flag `legendary` ajouté au bundle (11 Pokémon gen 1-2). Noms d'attaques Dragon et Fée raccourcis (débordement des cartes).
- PR #4 et #6 fusionnées (sprites embarqués, filtres, liens de pied de page), Pages redéployé.
- Itération 8 (branche `feat/real-pv`) : PV réels Tyradex dès le CP P3 (plafonds 59 / 79 / 99 puis 100, 200, 255 en CE1), PV fixes par Pokémon et période en CP P1-P2 (sans ajustement ni aléa), paires de combat filtrées sur leur faisabilité sans retenue, dégâts en dizaines entières en CP P3-P5, comparaison sans aléa, mention « PV adaptés au niveau » sur les fiches CP P1-P2. 45 tests verts.
- PR #7 fusionnée (PV réels dès CP P3, PV fixes, mode légendaires exclusif), Pages redéployé.
- Itération 9 (branche `feat/generations-1-4`) : bundle étendu aux générations 1 à 4 (493 Pokémon, 35 légendaires, page de 5,4 Mo), champ génération, filtre « Générations » dans le bloc Pokémon. 46 tests verts.
