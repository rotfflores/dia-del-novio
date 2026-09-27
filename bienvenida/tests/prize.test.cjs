const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createPrizeState } = require("../dist/prize-tools.js");

test("no hay regalo antes de completar una partida; cero puntos sí lo desbloquea", () => {
  const prize = createPrizeState();
  assert.equal(prize.snapshot().unlocked, false);
  assert.equal(prize.open(), false);
  prize.finish({ score: 0, maxScore: 5 });
  assert.equal(prize.snapshot().unlocked, true);
  assert.equal(prize.snapshot().opened, false);
  assert.equal(prize.open(), true);
  assert.equal(prize.open(), false);
  assert.equal(prize.snapshot().opened, true);
});

test("repetir una partida actualiza la puntuación y conserva regalo y récord", () => {
  const prize = createPrizeState();
  prize.finish({ score: 3, maxScore: 5 });
  prize.open();
  prize.finish({ score: 0, maxScore: 5 });
  assert.equal(prize.snapshot().lastResult.score, 0);
  assert.equal(prize.snapshot().bestResult.score, 3);
  assert.equal(prize.snapshot().opened, true);
  prize.finish({ score: 5, maxScore: 5 });
  assert.equal(prize.snapshot().bestResult.score, 5);
  assert.equal(prize.snapshot().roundNumber, 3);
});

test("el récord compara proporciones cuando cambia el tamaño de la partida", () => {
  const prize = createPrizeState();
  prize.finish({ score: 4, maxScore: 5 });
  prize.finish({ score: 6, maxScore: 10 });
  assert.deepEqual(prize.snapshot().bestResult, { score: 4, maxScore: 5 });
  prize.finish({ score: 9, maxScore: 10 });
  assert.deepEqual(prize.snapshot().bestResult, { score: 9, maxScore: 10 });
});

test("resultados inválidos no abren el premio ni alteran una partida anterior", () => {
  const prize = createPrizeState();
  const invalid = [null, {}, { score: -1, maxScore: 5 }, { score: 6, maxScore: 5 }, { score: 0, maxScore: 0 },
    { score: "3", maxScore: 5 }, { score: 1.5, maxScore: 5 }, { score: Infinity, maxScore: 5 }];
  invalid.forEach((result) => assert.throws(() => prize.finish(result), RangeError));
  assert.equal(prize.snapshot().unlocked, false);
  prize.finish({ score: 2, maxScore: 5 });
  const before = prize.snapshot();
  invalid.forEach((result) => assert.throws(() => prize.finish(result), RangeError));
  assert.deepEqual(prize.snapshot(), before);
});

test("el resultado expuesto no permite cambiar el récord desde fuera", () => {
  const prize = createPrizeState();
  const input = { score: 2, maxScore: 5 };
  prize.finish(input);
  input.score = 5;
  const snapshot = prize.snapshot();
  assert.equal(snapshot.bestResult.score, 2);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.lastResult), true);
});
