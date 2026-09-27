const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");

test("la configuración editable carga sin referencias que bloqueen la página", () => {
  const scope = { window: {} };
  runInNewContext(readFileSync(require.resolve("../dist/config.js"), "utf8"), scope);
  assert.ok(scope.window.COUPLE_CONFIG.names.him);
  assert.ok(scope.window.COUPLE_CONFIG.prize.coupon.text);
});
