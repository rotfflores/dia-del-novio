const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { calendarDate, createCoverageGrid } = require("../dist/memory-tools.js");

test("la fecha elegida cae en sábado y junio tiene 30 días", () => {
  const date = calendarDate({ year: 2025, month: 6, day: 21 });
  assert.equal(date.formatted, "21 de junio de 2025");
  assert.equal(date.iso, "2025-06-21");
  assert.equal(date.daysInMonth, 30);
  assert.equal((date.firstWeekday + date.day - 1) % 7, 5);
});

test("valida bisiestos, fechas inexistentes y años menores de 100", () => {
  assert.equal(calendarDate({ year: 2024, month: 2, day: 29 }).daysInMonth, 29);
  assert.equal(calendarDate({ year: 99, month: 1, day: 1 }).iso, "0099-01-01");
  for (const date of [ { year: 2025, month: 2, day: 29 }, { year: 2025, month: 4, day: 31 }, { year: 2025, month: 13, day: 1 }, { year: 2025, month: 0, day: 1 }, { year: 2025, month: 6, day: 0 }, { year: "2025", month: 6, day: 21 } ]) {
    assert.throws(() => calendarDate(date), RangeError);
  }
});

test("no cambia la fecha ni la cuadrícula entre zonas horarias extremas", () => {
  const script = `const {calendarDate}=require(${JSON.stringify(require.resolve("../dist/memory-tools.js"))}); process.stdout.write(JSON.stringify(calendarDate({year:2025,month:6,day:21})));`;
  const results = ["UTC", "America/Mexico_City", "Pacific/Kiritimati", "Pacific/Pago_Pago"].map((TZ) => execFileSync(process.execPath, ["-e", script], { env: { ...process.env, TZ }, encoding: "utf8" }));
  for (const result of results) assert.equal(result, results[0]);
});

test("raspar repetidamente el mismo punto no suma superficie falsa", () => {
  const grid = createCoverageGrid();
  const point = { x: 180, y: 200 };
  const first = grid.eraseSegment(point, point, 34);
  for (let i = 0; i < 100; i += 1) grid.eraseSegment(point, point, 34);
  assert.equal(grid.ratio, first);
  assert.ok(first > 0 && first < .1);
});

test("pocas pasadas distintas superan el umbral; fuera de la tarjeta no suma", () => {
  const grid = createCoverageGrid();
  grid.eraseSegment({ x: -200, y: -200 }, { x: -100, y: -100 }, 34);
  assert.equal(grid.ratio, 0);
  for (const y of [70, 160, 250]) grid.eraseSegment({ x: 5, y }, { x: 355, y }, 34);
  assert.ok(grid.ratio >= .4 && grid.ratio <= 1);
});
