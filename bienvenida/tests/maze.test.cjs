const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createGame, DIRECTIONS, readRecord, saveRecord } = require("../dist/maze-engine.js");
const { createPrizeState } = require("../dist/prize-tools.js");
const corridor = ["#############", "#P....o.....#", "#############"];
const quietGame = () => createGame({ map: corridor, enemyStarts: [] });
const near = (value, expected) => assert.ok(Math.abs(value - expected) < 1e-7, `${value} ≠ ${expected}`);

test("el laberinto tiene 96 corazones y todos los pasillos son alcanzables", () => {
  const game = createGame();
  const queue = [game.state.player], seen = new Set(["6,7"]);
  for (let i = 0; i < queue.length; i += 1) {
    for (const [dx, dy] of Object.values(DIRECTIONS)) {
      const point = { x: queue[i].x + dx, y: queue[i].y + dy }, key = `${point.x},${point.y}`;
      if (game.walkable(point.x, point.y) && !seen.has(key)) { seen.add(key); queue.push(point); }
    }
  }
  assert.equal(game.totalHearts, 96);
  assert.equal(seen.size, 97);
  for (const position of game.state.hearts.keys()) assert.ok(seen.has(position));
});

test("movimiento continuo, paredes, giro en cola y reversa entre casillas", () => {
  const game = quietGame(); game.start();
  game.direction("up"); game.tick(.2); near(game.state.player.x, 1); near(game.state.player.y, 1);
  game.direction("right"); game.tick(.1); near(game.state.player.x, 1.4);
  game.direction("left"); game.tick(.1); near(game.state.player.x, 1);
  game.tick(1); near(game.state.player.x, 1); // No atraviesa la pared exterior.
  const turn = createGame({ enemyStarts: [] }); turn.start(); turn.direction("left"); turn.tick(.25);
  turn.direction("up"); turn.tick(.25); // Desde (5,7) gira a (5,6).
  near(turn.state.player.x, 5); near(turn.state.player.y, 6);
});

test("recoger una sola vez, racha, poder de siete segundos y victoria", () => {
  const game = quietGame(); game.start(); game.direction("right"); game.tick(1.25);
  assert.equal(game.state.collected, 5);
  assert.equal(game.state.score, 85); // 4 × 10 + 25 + 20 de racha.
  near(game.state.power, 7);
  game.direction("left"); game.tick(.25);
  assert.equal(game.state.score, 85); // Volver por la misma casilla no suma.
  game.direction("right"); game.tick(2);
  assert.equal(game.state.phase, "ended"); assert.equal(game.state.reason, "hearts");
  assert.equal(game.state.hearts.size, 0);
  assert.ok(game.state.score <= game.maxScore);
});

test("pausar congela tiempo, posiciones y poderes; reiniciar limpia la partida", () => {
  const game = quietGame(); game.start(); game.direction("right"); game.tick(1.25); game.pause();
  const before = [game.state.remaining, game.state.player.x, game.state.power];
  game.tick(40); assert.deepEqual([game.state.remaining, game.state.player.x, game.state.power], before);
  game.resume(); game.tick(.1); assert.ok(game.state.remaining < before[0]);
  game.reset(); assert.equal(game.state.phase, "ready"); assert.equal(game.state.score, 0);
  assert.equal(game.state.lives, 3); assert.equal(game.state.hearts.size, game.totalHearts); assert.equal(game.state.power, 0);
});

test("colisión quita una vida, reaparece protegido y termina con la tercera", () => {
  const game = createGame(); game.start();
  const collide = () => {
    Object.assign(game.state.enemies[0], { x: game.state.player.x, y: game.state.player.y, target: null, stun: 0 });
    game.tick(1 / 120);
  };
  game.state.shield = 0; collide(); assert.equal(game.state.lives, 2);
  near(game.state.player.x, 6); near(game.state.player.y, 7); assert.ok(game.state.shield > 2.9);
  collide(); assert.equal(game.state.lives, 2);
  game.state.shield = 0; collide(); assert.equal(game.state.lives, 1);
  game.state.shield = 0; collide(); assert.equal(game.state.lives, 0); assert.equal(game.state.reason, "lives");
});

test("el poder ahuyenta nubes sin perder vidas y las nubes persiguen por pasillos", () => {
  const game = createGame(); game.start(); game.state.power = 7; game.state.shield = 0;
  Object.assign(game.state.enemies[0], { x: 6, y: 7, stun: 0 }); game.tick(.01);
  assert.equal(game.state.lives, 3); assert.ok(game.state.enemies[0].stun > 2);
  const chase = createGame(); chase.start(); chase.tick(7);
  assert.ok(chase.state.enemies.some((enemy, i) => enemy.x !== 6 || enemy.y !== [3, 11][i]));
  for (const enemy of chase.state.enemies) assert.ok(chase.walkable(Math.round(enemy.x), Math.round(enemy.y)));
});

test("el tiempo termina una partida de cero puntos y permite reclamar el premio", () => {
  const game = createGame({ enemyStarts: [] }); game.start(); game.tick(60);
  assert.equal(game.state.phase, "ended"); assert.equal(game.state.reason, "time");
  assert.equal(game.state.remaining, 0); assert.equal(game.state.score, 0);
  const prize = createPrizeState(); prize.finish({ score: game.state.score, maxScore: game.maxScore });
  assert.equal(prize.snapshot().unlocked, true);
});

test("la simulación no depende de los cuadros por segundo", () => {
  const a = quietGame(), b = quietGame(); a.start(); b.start(); a.direction("right"); b.direction("right");
  a.tick(.75); for (let i = 0; i < 90; i += 1) b.tick(1 / 120);
  near(a.state.player.x, b.state.player.x); near(a.state.remaining, b.state.remaining);
  assert.equal(a.state.score, b.state.score);
});

test("el récord persiste, no baja y tolera almacenamiento bloqueado o corrupto", () => {
  const data = new Map(); const storage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.equal(saveRecord(storage, 180), 180); assert.equal(saveRecord(storage, 30), 180); assert.equal(readRecord(storage), 180);
  data.set("aventura-laberinto-record-v1", "no es número"); assert.equal(readRecord(storage), 0);
  const blocked = { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } };
  assert.equal(readRecord(blocked), 0); assert.equal(saveRecord(blocked, 120), 120);
});
