const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createDeck, createGame } = require("../dist/memorama-tools.js");

const ids = ["uno", "dos", "tres", "cuatro", "cinco"];

test("la baraja contiene exactamente dos cartas de cada recuerdo", () => {
  const deck = createDeck(ids);
  assert.equal(deck.length, 10);
  ids.forEach((id) => assert.equal(deck.filter((card) => card === id).length, 2));
});

test("colecciones inválidas no se pueden jugar", () => {
  assert.throws(() => createDeck(["a", "b", "c"]), RangeError);
  assert.throws(() => createDeck(["a", "b", "c", "a"]), TypeError);
});

test("encontrar pares, fallar y terminar la partida", () => {
  const game = createGame(ids, () => 0.5);
  const deck = game.deck;
  const pairOf = (id) => deck.reduce((found, card, index) => (card === id ? [...found, index] : found), []);
  const [a, b] = pairOf("uno");
  const miss = deck.findIndex((card) => card !== "uno");

  assert.deepEqual(game.flip(a), { type: "first", id: "uno" });
  assert.equal(game.flip(a), null, "tocar la misma carta no cuenta");
  assert.equal(game.flip(miss).type, "miss");
  assert.equal(game.locked, true);
  assert.equal(game.flip(b), null, "el tablero se bloquea hasta ocultar el fallo");
  assert.equal(game.hideMiss(), true);
  assert.equal(game.isFaceUp(a), false);

  game.flip(a);
  assert.deepEqual(game.flip(b), { type: "match", id: "uno" });
  assert.equal(game.flip(a), null, "un par encontrado ya no se voltea");
  assert.equal(game.pairs, 1);
  assert.equal(game.moves, 2);

  ids.slice(1).forEach((id) => { const [x, y] = pairOf(id); game.flip(x); game.flip(y); });
  assert.equal(game.complete, true);
  assert.equal(game.pairs, 5);
  assert.equal(game.moves, 6);
});
