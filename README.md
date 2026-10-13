# Pokexo

Générateur de fiches d'exercices imprimables (français et mathématiques) pour le CP et le CE1, sur le thème Pokémon.

- Application en ligne : https://hamzdi.github.io/pokexo/
- Données Pokémon fournies par [Tyradex](https://tyradex.app). Projet non commercial.

## Utilisation

Choisir le niveau, la période, les exercices et le nombre de fiches, puis « Imprimer / PDF ». Le navigateur produit le PDF ; le corrigé est ajouté en fin de document.

## Développement

```
make install   # dépendances
make dev       # serveur de développement
make check     # typecheck + tests
make build     # bundle mono-fichier dans dist/
make data      # régénère src/data/pokemon.json depuis Tyradex
```

Stack : Vite + TypeScript, Vitest, sans framework. Le build est un seul `index.html` déployé sur GitHub Pages par Actions à chaque push sur `main`.

## Documentation

- `claudedocs/brainstorm-brief.md` — vision, idées d'exercices, progression P1–P5, architecture
- `claudedocs/design-brief.md` — brief pour Claude Design
- `progress.md`, `decisions.md`, `bugs.md` — suivi
