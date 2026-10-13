# Bugs

_Aucun bug pour le moment._

## 2026-10-13 — Double échappement des fragments HTML imbriqués (corrigé)
Le tag `html` renvoyait une chaîne, ré-échappée par le template parent : le corrigé affichait du HTML brut. Détecté par `tests/render.test.ts`. Corrigé en renvoyant un `Fragment` reconnu comme sûr.
