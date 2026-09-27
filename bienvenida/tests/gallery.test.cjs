const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createDiscovery } = require("../dist/gallery-tools.js");

test("descubrir en cualquier orden cuenta cada recuerdo una sola vez", () => {
  const progress = createDiscovery(["uno", "dos", "tres", "cuatro", "cinco"]);
  assert.equal(progress.count, 0);
  assert.equal(progress.complete, false);
  assert.equal(progress.discover("cuatro"), true);
  for (let i = 0; i < 20; i += 1) assert.equal(progress.discover("cuatro"), false);
  assert.equal(progress.count, 1);
  ["dos", "cinco", "uno"].forEach((id) => progress.discover(id));
  assert.equal(progress.complete, false);
  progress.discover("tres");
  assert.equal(progress.count, 5);
  assert.equal(progress.complete, true);
  assert.equal(progress.has("cuatro"), true);
});

test("contador y finalización se adaptan a colecciones de 4 y 6", () => {
  for (const count of [4, 6]) {
    const ids = Array.from({ length: count }, (_, i) => `recuerdo-${i}`);
    const progress = createDiscovery(ids);
    assert.equal(progress.total, count);
    ids.forEach((id, i) => { progress.discover(id); assert.equal(progress.complete, i === count - 1); });
    assert.equal(progress.count, count);
  }
});

test("IDs duplicados o ajenos y tamaños inválidos no producen avances falsos", () => {
  assert.throws(() => createDiscovery(["a", "b", "c"]), RangeError);
  assert.throws(() => createDiscovery(["a", "b", "c", "d", "e", "f", "g"]), RangeError);
  assert.throws(() => createDiscovery(["a", "b", "c", "a"]), TypeError);
  assert.throws(() => createDiscovery(["a", "b", "c", ""]), TypeError);
  const progress = createDiscovery(["a", "b", "c", "d"]);
  assert.throws(() => progress.discover("desconocido"), RangeError);
  assert.equal(progress.count, 0);
});
