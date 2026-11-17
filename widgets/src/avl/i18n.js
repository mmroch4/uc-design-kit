/**
 * Strings of <uc-widget-avl>, `widget.avl.*`: the sentences of the binary
 * search tree it shares with <uc-widget-bst> (taken from bst/i18n.js, so the
 * two read alike) and its own for heights, factors and rotations. Pseudocode
 * blocks per operation, "<line id>|<text>" with the same ids in every language.
 */
import { strings as bst } from "../bst/i18n.js";

const SHARED = [
  "describe", "children", "none", "and", "leftOnly", "rightOnly", "edit", "start", "startEmpty", "insert", "search", "remove",
  "root", "goLeft", "goRight", "equal", "duplicate", "placeLeft", "placeRight", "notFound", "leaf", "removed", "oneChild",
  "lifted", "twoChildren", "succWalk", "succFound", "copied", "end", "endEmpty", "side", "error",
];
const shared = (lang) => Object.fromEntries(SHARED.map((key) => [key, bst[lang][key]]));

export const strings = {
  pt: {
    ...shared("pt"),
    caption: { operations: "Árvore AVL" },
    column: { ...bst.pt.column, factor: "Fator" },
    factors: "Fatores de equilíbrio: {list}.",
    update: "{n}: altura {h}, fator de equilíbrio {f}.",
    same: "{n}: altura {h}, fator {f}; a altura não mudou, por isso acima nada muda.",
    case: {
      LL: "{n} tem fator {f} e o filho esquerdo {c} pende para a esquerda: caso esquerda-esquerda.",
      RR: "{n} tem fator {f} e o filho direito {c} pende para a direita: caso direita-direita.",
      LR: "{n} tem fator {f} e o filho esquerdo {c} pende para a direita: caso esquerda-direita.",
      RL: "{n} tem fator {f} e o filho direito {c} pende para a esquerda: caso direita-esquerda.",
    },
    right: "Rotação à direita em {n}: {c} sobe para o seu lugar.",
    left: "Rotação à esquerda em {n}: {c} sobe para o seu lugar.",
    rotation: {
      LL: "Rotação à direita",
      RR: "Rotação à esquerda",
      LR: "Esquerda e depois direita",
      RL: "Direita e depois esquerda",
    },
    predict: { side: bst.pt.predict.side, rotation: "Fator de {n}: {f}. Que rotação o equilibra?" },
    code: {
      insert: [
        "|inserir(v):",
        "left right found dup place|  inserir v como numa árvore de pesquisa",
        "|  para cada nó n do caminho, de baixo para cima:",
        "update|    altura(n) = 1 + max(altura(n.esq), altura(n.dir))",
        "case|    se fator(n) = ±2: ver o caso (EE, DD, ED, DE)",
        "rotate|      rodar (uma ou duas rotações)",
        "stop|    se altura(n) não mudou: parar",
      ],
      remove: [
        "|remover(v):",
        "left right found missing leaf one succ copy|  remover v como numa árvore de pesquisa",
        "|  para cada nó n do caminho, de baixo para cima:",
        "update|    altura(n) = 1 + max(altura(n.esq), altura(n.dir))",
        "case|    se fator(n) = ±2: ver o caso (EE, DD, ED, DE)",
        "rotate|      rodar (uma ou duas rotações)",
        "stop|    se altura(n) não mudou: parar",
      ],
      search: bst.pt.code.search,
      operations: ["|fator(n) = altura(n.esq) − altura(n.dir)", "|numa AVL, todo o fator é −1, 0 ou +1"],
    },
  },
  en: {
    ...shared("en"),
    caption: { operations: "AVL tree" },
    column: { ...bst.en.column, factor: "Factor" },
    factors: "Balance factors: {list}.",
    update: "{n}: height {h}, balance factor {f}.",
    same: "{n}: height {h}, factor {f}; the height did not change, so nothing above changes.",
    case: {
      LL: "{n} has factor {f} and its left child {c} leans left: left-left case.",
      RR: "{n} has factor {f} and its right child {c} leans right: right-right case.",
      LR: "{n} has factor {f} and its left child {c} leans right: left-right case.",
      RL: "{n} has factor {f} and its right child {c} leans left: right-left case.",
    },
    right: "Right rotation at {n}: {c} moves up to its place.",
    left: "Left rotation at {n}: {c} moves up to its place.",
    rotation: {
      LL: "Right rotation",
      RR: "Left rotation",
      LR: "Left, then right",
      RL: "Right, then left",
    },
    predict: { side: bst.en.predict.side, rotation: "Factor of {n}: {f}. Which rotation balances it?" },
    code: {
      insert: [
        "|insert(v):",
        "left right found dup place|  insert v as in a search tree",
        "|  for each node n on the path, bottom up:",
        "update|    height(n) = 1 + max(height(n.left), height(n.right))",
        "case|    if factor(n) = ±2: find the case (LL, RR, LR, RL)",
        "rotate|      rotate (one or two rotations)",
        "stop|    if height(n) did not change: stop",
      ],
      remove: [
        "|remove(v):",
        "left right found missing leaf one succ copy|  remove v as in a search tree",
        "|  for each node n on the path, bottom up:",
        "update|    height(n) = 1 + max(height(n.left), height(n.right))",
        "case|    if factor(n) = ±2: find the case (LL, RR, LR, RL)",
        "rotate|      rotate (one or two rotations)",
        "stop|    if height(n) did not change: stop",
      ],
      search: bst.en.code.search,
      operations: ["|factor(n) = height(n.left) − height(n.right)", "|in an AVL tree every factor is −1, 0 or +1"],
    },
  },
};
