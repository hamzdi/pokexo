/**
 * "Boutique Pokémon": word problems with euros. A Pokémon buys a few items
 * from the price list; the child computes the total and, from CE1, the change
 * from a banknote. Available from CP period 4.
 */
import { createRng, seedFromString, type Rng } from './rng.ts';
import type { Level, Period, PokemonData } from './types.ts';

export interface ShopItem {
  name: string;
  price: number;
}

export const SHOP_ITEMS: readonly ShopItem[] = [
  { name: 'Baie', price: 1 },
  { name: 'Poké Ball', price: 2 },
  { name: 'Potion', price: 3 },
  { name: 'Antidote', price: 4 },
  { name: 'Super Ball', price: 5 },
  { name: 'Corde Sortie', price: 6 },
  { name: 'Super Potion', price: 7 },
  { name: 'Repousse', price: 8 },
  { name: 'Hyper Ball', price: 10 },
];

export interface ShopRules {
  problems: number;
  /** Number of distinct items per purchase. */
  lines: number;
  /** Maximum quantity of one item (1 means no multiplication). */
  maxQuantity: number;
  maxTotal: number;
  /** Banknotes the buyer may pay with; empty when change is not asked. */
  banknotes: readonly number[];
}

export const SHOP_RULES: Record<Level, Record<Period, ShopRules | null>> = {
  CP: {
    1: null,
    2: null,
    3: null,
    4: { problems: 2, lines: 2, maxQuantity: 1, maxTotal: 20, banknotes: [] },
    5: { problems: 2, lines: 2, maxQuantity: 1, maxTotal: 30, banknotes: [] },
  },
  CE1: {
    1: { problems: 3, lines: 2, maxQuantity: 1, maxTotal: 50, banknotes: [20, 50] },
    2: { problems: 3, lines: 3, maxQuantity: 1, maxTotal: 100, banknotes: [50, 100] },
    3: { problems: 3, lines: 2, maxQuantity: 3, maxTotal: 100, banknotes: [50, 100] },
    4: { problems: 3, lines: 3, maxQuantity: 3, maxTotal: 100, banknotes: [50, 100] },
    5: { problems: 3, lines: 3, maxQuantity: 5, maxTotal: 100, banknotes: [50, 100] },
  },
};

export interface PurchaseLine {
  item: ShopItem;
  quantity: number;
}

export interface ShopProblem {
  buyer: PokemonData;
  lines: PurchaseLine[];
  total: number;
  /** Banknote used to pay, null when change is not asked. */
  banknote: number | null;
  change: number | null;
}

export interface ShopExercise {
  kind: 'shop';
  level: Level;
  period: Period;
  seed: number;
  rules: ShopRules;
  problems: ShopProblem[];
}

export interface ShopOptions {
  level: Level;
  period: Period;
  seed: number;
  pokedex: readonly PokemonData[];
}

function makeProblem(rng: Rng, buyer: PokemonData, rules: ShopRules): ShopProblem {
  for (let attempt = 0; attempt < 50; attempt++) {
    const items = rng.shuffle(SHOP_ITEMS).slice(0, rules.lines);
    const lines = items.map((item) => ({ item, quantity: rng.int(1, rules.maxQuantity) }));
    const total = lines.reduce((t, l) => t + l.item.price * l.quantity, 0);
    if (total > rules.maxTotal) continue;
    const notes = rules.banknotes.filter((n) => n > total);
    const banknote = notes.length > 0 ? rng.pick(notes) : null;
    return { buyer, lines, total, banknote, change: banknote === null ? null : banknote - total };
  }
  const item = SHOP_ITEMS[0] as ShopItem;
  return { buyer, lines: [{ item, quantity: 1 }], total: item.price, banknote: null, change: null };
}

export function generateShop({ level, period, seed, pokedex }: ShopOptions): ShopExercise {
  const rules = SHOP_RULES[level][period];
  if (!rules) throw new Error(`Boutique is not available in ${level} P${period}`);
  const rng = createRng(seedFromString(`shop:${seed}`));
  const buyers = rng.shuffle(pokedex).slice(0, rules.problems);
  return { kind: 'shop', level, period, seed, rules, problems: buyers.map((buyer) => makeProblem(rng, buyer, rules)) };
}
