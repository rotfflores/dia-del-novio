const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createGame, splitPhrase, TILE } = require("../dist/platform-engine.js");

const PHRASE = "Mi lugar favorito siempre será contigo";
const run = (game, seconds, input) => { const events = []; for (let t = 0; t < seconds; t += 1 / 120) events.push(...game.step(1 / 120, input)); return events; };

test("la frase se valida y cada palabra tiene un lugar en el nivel", () => {
  assert.throws(() => splitPhrase("muy corta"), RangeError);
  assert.throws(() => splitPhrase("a b c d e f g h i"), RangeError);
  for (const phrase of ["Te quiero mucho", PHRASE, "uno dos tres cuatro cinco seis siete ocho"]) {
    const { state } = createGame(phrase);
    assert.equal(state.spots.length, state.total);
    assert.deepEqual(state.spots.map((s) => s.index).sort((a, b) => a - b), [...state.spots.keys()]);
  }
});

test("el corazón camina, salta y cae sobre el suelo", () => {
  const game = createGame(PHRASE);
  const startX = game.state.player.x;
  run(game, .5, { right: true });
  assert.ok(game.state.player.x > startX + 20);
  const events = run(game, .05, { jump: true });
  assert.ok(events.some((e) => e.type === "jump"));
  run(game, 1.2, {});
  assert.equal(game.state.player.onGround, true);
});

test("golpear un bloque corazón desde abajo entrega su palabra", () => {
  const game = createGame(PHRASE);
  const spot = game.state.spots.find((s) => s.kind === "block");
  Object.assign(game.state.player, { x: spot.x * TILE + 2, y: 10 * TILE - 14, vx: 0, vy: 0 });
  game.step(1 / 120, {});
  const events = run(game, .6, { jump: true });
  assert.ok(events.some((e) => e.type === "word" && e.word === spot.word));
  assert.equal(game.tileAt(spot.x, spot.y), "U");
});

test("sin todas las palabras la bandera no se alcanza; con todas se llega al castillo", () => {
  const game = createGame(PHRASE);
  const p = game.state.player;
  Object.assign(p, { x: game.state.poleX - 40, y: 10 * TILE - 14, vx: 0, vy: 0 });
  let events = run(game, 1, { right: true });
  assert.ok(events.some((e) => e.type === "blocked" && e.missing === 6));
  assert.equal(game.state.phase, "playing");
  game.state.spots.forEach((s) => { s.collected = true; });
  game.state.collected = game.state.total;
  events = run(game, 6, { right: true });
  assert.ok(events.some((e) => e.type === "flag"));
  assert.ok(events.some((e) => e.type === "win"));
  assert.equal(game.state.phase, "done");
});

test("caer a un hueco regresa al último punto seguro", () => {
  const game = createGame(PHRASE);
  Object.assign(game.state.player, { x: 19 * TILE + 2, y: 9 * TILE, vx: 0, vy: 0 });
  const events = run(game, 1.5, {});
  assert.ok(events.some((e) => e.type === "fall"));
  assert.equal(game.state.player.x, 2 * TILE);
  assert.ok(game.state.player.inv > 0);
});

test("desde la bandera se puede regresar cruzando la escalera final", () => {
  const game = createGame(PHRASE);
  Object.assign(game.state.player, { x: 128 * TILE, y: 10 * TILE - 14, vx: 0, vy: 0 });
  // Camina a la izquierda saltando: la escalera sube y baja de ambos lados.
  for (let t = 0; t < 5; t += 1 / 120) game.step(1 / 120, { left: true, jump: Math.floor(t * 3) % 2 === 0 });
  assert.ok(game.state.player.x < 117 * TILE, `se quedó en x=${Math.round(game.state.player.x / TILE)}`);
});
