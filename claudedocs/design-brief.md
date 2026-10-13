# Pokexo — Brief pour Claude Design

## Contexte
Application web (page unique, publiée comme artifact) qui génère des fiches d'exercices A4 imprimables pour des élèves de CP et CE1 (6–8 ans), sur le thème Pokémon. Deux publics : parents et enseignants. Les fiches sont générées en couleur, souvent imprimées en noir et blanc.

## Livrables attendus
### 1. Écran de génération (desktop d'abord, tablette ensuite)
- Panneau gauche : niveau (CP / CE1), période (P1–P5), matière (Maths / Français), liste d'exercices avec case à cocher + compteur de fiches, champ graine, champ prénom.
- Zone centrale : aperçu paginé A4 des fiches générées.
- Barre d'action : Regénérer, Imprimer / PDF, interrupteur "Inclure le corrigé".
- Ton : ludique mais sobre, pensé pour un adulte qui prépare des fiches, pas pour l'enfant.

### 2. Gabarit de fiche A4 (portrait, marges 15 mm)
- En-tête : titre de l'exercice, zone Prénom ____ Date ____, badge niveau + période.
- Bloc consigne : phrase courte + picto (écoute, écris, calcule, relie, entoure, colorie).
- Zone exercice (voir composants ci-dessous).
- Pied de page : "Données Pokémon : Tyradex (tyradex.app)" + numéro de page.
- Variantes CP (gros caractères, peu d'éléments par page) et CE1 (plus dense).

### 3. Composants
- **Carte Pokémon pédagogique** : sprite, nom imprimé, badge de type (nom + couleur), PV en très gros, 1–2 attaques "nom — dégâts". Format proche d'une carte à jouer, lisible en gris.
- **Tableau de combat par manches** : colonnes Manche / Attaque / Dégâts / PV restants, cases de réponse larges, ligne de départ pré-remplie.
- **Grille de comparaison** : deux cartes face à face, case centrale pour < > =.
- **Lignes Seyès** : interligne 3 mm (CP) et 2,5 mm (CE1), blocs de 2 à 6 lignes, sprite de repère en marge gauche pour la dictée.
- **Fiche d'identité** : sprite + tableau catégorie / type / taille / poids / évolution.
- **Étiquettes-mots** à découper ou à relier (phrase en désordre, relier image ↔ mot).
- **Grille à coordonnées** (A–F × 1–6) avec sprites.
- **Page corrigé** : même mise en page, réponses en couleur distincte.

### 4. Charte
- Polices : scripte très lisible (Andika ou Lexend) pour les consignes ; cursive scolaire (Belle Allure ou équivalent) pour les modèles à copier.
- Couleurs : palette inspirée des 18 types Pokémon pour les badges, mais tout texte et toute structure doivent rester lisibles en niveaux de gris. Vérifier le contraste à l'impression N&B.
- Pictos de consigne : jeu cohérent de 6 icônes simples, trait épais.
- Pas de rouge seul pour porter une information (daltonisme) ; doubler par la forme ou le texte.

## Contraintes
- Les noms de Pokémon ne sont jamais à écrire par l'élève : ils sont imprimés ou remplacés par le sprite.
- Chaque fiche tient sur une page ; le corrigé est sur une page séparée.
- Rendu via impression navigateur : CSS `@page A4`, pas d'éléments coupés entre deux pages.
- Sortie attendue : HTML/CSS réutilisables en templates (classes nommées, variables CSS pour la charte).
