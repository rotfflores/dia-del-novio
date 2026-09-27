const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createGame, createRecord, difficulty, GROUND, BIRD_X, PILLAR_W } = require("../dist/flappy-engine.js");

const run = (game, seconds, flapEvery) => {
  const events = [];
  for (let t = 0; t < seconds; t += 1 / 120) {
    if (flapEvery && flapEvery(game)) events.push(...game.flap());
    events.push(...game.step(1 / 120));
  }
  return events;
};

test("espera el primer aleteo y luego cae hasta el suelo", () => {
  const game = createGame(() => .5);
  run(game, 2);
  assert.equal(game.state.phase, "ready");
  game.flap();
  const events = run(game, 3);
  assert.equal(game.state.phase, "over");
  assert.ok(events.some((e) => e.type === "hit"));
  assert.equal(game.state.bird.y, GROUND - 6.5);
});

test("un piloto automático pasa columnas y el juego sigue sin fin", () => {
  // Aleatorio con semilla: la prueba es repetible.
  let seed = 20260927;
  const random = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const game = createGame(random);
  game.flap();
  // Aletea cuando está por debajo del centro del siguiente hueco.
  const pilot = (g) => {
    const next = g.state.pillars.find((p) => p.x + PILLAR_W > BIRD_X - 8) || { gapY: 118 };
    return g.state.phase === "playing" && g.state.bird.y > next.gapY + (next.gap || 80) / 2 - 14 && g.state.bird.vy > 0;
  };
  const events = run(game, 60, pilot);
  assert.equal(game.state.phase, "playing", `chocó con ${game.state.score} puntos`);
  assert.ok(game.state.score > 25);
  assert.ok(events.filter((e) => e.type === "point").length === game.state.score);
  assert.ok(game.state.pillars.length < 6, "las columnas viejas se eliminan");
});

test("la dificultad crece pero tiene límites", () => {
  assert.ok(difficulty(10).speed > difficulty(0).speed);
  assert.ok(difficulty(10).gap < difficulty(0).gap);
  assert.equal(difficulty(1000).gap, 66);
  assert.equal(difficulty(1000).speed, 112);
});

test("el récord se guarda y sobrevive a una nueva visita", () => {
  const data = new Map();
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  const record = createRecord(storage);
  assert.equal(record.best, 0);
  assert.equal(record.submit(7), true);
  assert.equal(record.submit(5), false);
  assert.equal(createRecord(storage).best, 7);
  const broken = createRecord({ getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } });
  assert.equal(broken.submit(3), true);
  assert.equal(broken.best, 3);
});
