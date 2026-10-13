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
