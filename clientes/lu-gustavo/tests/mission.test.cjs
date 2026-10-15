const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const State = require("../mission-state.js");
const root = path.resolve(__dirname, "..");
function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
function reachFourth(store) {
  assert(store.unlock()); assert(store.enter());
  assert(store.bow("Hacer una reverencia")); assert(store.visit(2));
  assert(store.saveAnswer("Nuestro primer viaje <3")); assert(store.visit(3));
  assert(store.spell("  EXPECTO    pAtRoNuM  ")); assert(store.visit(4));
}
test("bloqueo inicial y orden obligatorio, incluidos intentos programáticos", () => {
  const s = State.create(memoryStorage());
  assert.equal(s.enter(), false); assert.equal(s.visit(4), false);
  assert.equal(s.bow("Hacer una reverencia"), false); assert.equal(s.reveal(), false);
  s.unlock(); s.enter();
  assert.equal(s.visit(2), false); assert.equal(s.visit(0), false); assert.equal(s.visit(1.5), false);
  for (const wrong of ["Acercarme rápidamente", "Pronunciar un hechizo"]) assert.equal(s.bow(wrong), false);
  assert.equal(s.spell("Expecto Patronum"), false); assert.equal(s.saveAnswer("Recuerdo"), false);
  assert(s.bow("Hacer una reverencia")); assert(s.visit(2));
  for (const empty of ["", "   ", "\n\t"]) assert.equal(s.saveAnswer(empty), false);
  assert.equal(s.saveAnswer("x".repeat(4001)), false);
  assert(s.saveAnswer("Nuestro viaje")); assert(s.visit(3));
  for (const wrong of ["Lumos", "Patronum Expecto", "Expecto Accio", ""]) assert.equal(s.spell(wrong), false);
  assert(s.spell("  EXpecto \n PATRONUM   ")); assert(s.visit(4));
  assert.equal(s.note(4), false); assert.equal(s.note(-1), false);
  for (let i = 0; i < 5; i++) { assert.equal(s.reveal(), false); assert(s.note(i)); assert.equal(s.note(i), false); }
  assert(s.reveal()); assert.equal(s.snapshot().revealed, true);
});
test("recarga conserva desbloqueo, respuesta, estación, notas y revelación", () => {
  const storage = memoryStorage(), s = State.create(storage); reachFourth(s);
  s.note(0); s.note(1);
  const resumed = State.create(storage);
  assert.deepEqual(resumed.snapshot(), s.snapshot());
  assert.equal(resumed.snapshot().answer, "Nuestro primer viaje <3");
  for (let i = 2; i < 5; i++) assert(resumed.note(i));
  resumed.reveal(); assert.equal(State.create(storage).snapshot().revealed, true);
});
test("datos dañados y almacenamiento bloqueado no rompen la experiencia", () => {
  const s = State.create({ getItem() { throw Error("bloqueado"); }, setItem() { throw Error("bloqueado"); } });
  reachFourth(s); assert.equal(s.persisted, false);
  assert.equal(State.restore({ unlocked: false, completed: 4, answer: "x", notes: 5, revealed: true }).revealed, false);
  assert.equal(State.restore({ unlocked: true, completed: 4, notes: 5 }).completed, 1);
  assert.equal(State.restore({ unlocked: true, completed: 4, notes: 1, answer: "x" }).completed, 3);
  const bad = State.create({ getItem() { return "{oops"; } }); assert.equal(bad.snapshot().unlocked, false);
});

// Pruebas de integración del DOM sin dependencias en la página publicada.
// JSDOM se instala únicamente como herramienta externa de desarrollo.
const { JSDOM } = require("jsdom");
function harness(width = 390, saved = null, review = false) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, "index.html"), "utf8"), { url: "https://dia-del-novio.rotfstudio.com/clientes/lu-gustavo/" + (review ? "?revision=mision" : ""), runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window, errors = [], frames = new Map(); let nextId = 1, played = 0;
  Object.defineProperty(w, "innerWidth", { value: width });
  w.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  w.Path2D = class {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.scrollTo = () => {};
  w.requestAnimationFrame = (callback) => { const id = nextId++; frames.set(id, callback); return id; };
  w.cancelAnimationFrame = (id) => frames.delete(id);
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({}, { get: (_, name) => name === "measureText" ? (s) => ({ width: String(s).length * 8 }) : name === "createLinearGradient" || name === "createRadialGradient" ? () => gradient : () => {}, set: () => true });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.HTMLMediaElement.prototype.play = () => { played++; return Promise.resolve(); };
  w.HTMLMediaElement.prototype.pause = () => {};
  w.console.error = (...args) => errors.push(args.map(String).join(" "));
  w.addEventListener("error", (e) => errors.push(String(e.error)));
  if (saved) w.localStorage.setItem(State.KEY, JSON.stringify(saved));
  const scripts = [...w.document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src").split("?")[0]);
  scripts.forEach((file) => w.eval(fs.readFileSync(path.join(root, file), "utf8")));
  function click(text, within = w.document) {
    const el = [...within.querySelectorAll("button")].find((b) => b.textContent.trim() === text && !b.disabled);
    assert(el, `Botón disponible: ${text}`); el.click(); return el;
  }
  return { dom, w, errors, click, get played() { return played; },
    frame(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn(time)); } };
}
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
test("acceso temporal directo sin desbloquear ni sobrescribir el progreso normal", async () => {
  const normal = { unlocked: false, answer: "", completed: 0 };
  const h = harness(390, normal, true);
  try {
    await flush();
    assert.equal(h.w.Aventura.currentPart, 8);
    assert.equal(h.w.document.querySelector("#magic-mission-title").textContent, "Una nueva misión");
    assert.deepEqual(JSON.parse(h.w.localStorage.getItem(State.KEY)), normal);
    assert.equal(JSON.parse(h.w.localStorage.getItem(State.KEY + "-revision")).unlocked, true);
    assert.equal(h.played, 0);
    assert.deepEqual(h.errors, []);
  } finally { h.dom.window.close(); }
});
test("el cierre predeterminado es la nota de Lu, sin tarjeta ni textos provisionales", async () => {
  const state = { unlocked: true, entered: true, completed: 4, stage: 4, notes: 5, revealed: true, answer: "Nuestro primer viaje" };
  const h = harness(390, state);
  try {
    assert(await h.w.Aventura.goToPart(8));
    const screen = h.w.document.querySelector(".mission-screen");
    assert.equal(screen.querySelector("h2").textContent, "¡Misión cumplida, mago! ⚡");
    assert.equal(screen.querySelector(".mission-gift"), null);
    assert.equal(screen.querySelector("h2").nextElementSibling.className, "mission-final-letter");
    assert(!screen.textContent.includes("REGALO SORPRESA"));
    assert(!screen.textContent.includes("DESCRIPCIÓN DEL REGALO"));
    assert(screen.textContent.includes("Febrero de 2027 tenemos una cita mágica. 🪄"));
    assert(screen.textContent.includes("Tu compañera de aventuras, Lu."));
    assert.equal(screen.querySelector(".mission-written-memory blockquote").textContent, state.answer);
    const share = new URL(screen.querySelector(".mission-whatsapp").href);
    assert.equal(share.hostname, "wa.me");
    assert.equal(share.pathname, "/", "el número personal no está publicado en el enlace");
    assert(share.searchParams.get("text").includes(state.answer));
    assert.deepEqual(h.errors, []);
  } finally { h.dom.window.close(); }
});
async function reachLastGame(h) {
  const { w } = h;
  assert(await w.Aventura.goToPart2());
  w.document.querySelector(".reveal-button").click(); await flush();
  assert(w.Aventura.part2Completed); assert(await w.Aventura.goToPart3());
  const groups = new Map();
  w.document.querySelectorAll(".memo-card").forEach((card) => {
    const clue = card.querySelector(".memo-clue").textContent;
    groups.set(clue, [...(groups.get(clue) || []), card]);
  });
  for (const cards of groups.values()) { cards.forEach((card) => card.click()); }
  assert(w.Aventura.part3Completed); assert(await w.Aventura.goToPart4());
  assert(await w.Aventura.completeGame({ score: 0, maxScore: w.LoveMaze.createGame().maxScore }));
  w.document.querySelector(".gift-button").click(); await flush();
  assert(w.document.querySelector(".reward-coupon").textContent.includes("Vale por una cena juntos"));
  assert(await w.Aventura.goToPart6());
}
for (const width of [360, 1280]) {
  test(`integración DOM a ${width}px: juegos anteriores, desbloqueo real, acertijos, recarga y regalo`, async () => {
    const h = harness(width), { w, click } = h;
    try {
      assert.equal(h.played, 0, "no se reproduce audio al cargar");
      assert.equal(await w.Aventura.goToPart(8), false);
      await reachLastGame(h);
      assert.equal(w.MagicMission.progress.snapshot().unlocked, false);
      // La celebración antigua no debe desbloquear la misión si no se jugó.
      assert(await w.Aventura.goToPart7()); assert.equal(await w.Aventura.goToPart(8), false);
      assert(await w.Aventura.goToPart6());
      const canvas = w.document.querySelector(".flappy-canvas");
      canvas.dispatchEvent(new w.Event("pointerdown", { bubbles: true, cancelable: true }));
      for (let i = 0; i < 150; i++) h.frame(i * 20);
      assert.equal(w.document.getElementById("part-six").flappyGame.state.phase, "over");
      assert.equal(w.MagicMission.progress.snapshot().unlocked, true);
      assert.equal(w.document.querySelector(".flappy-finish .mission-entry").hidden, false);
      assert(await w.Aventura.goToPart(8));
      click("Juro que mis intenciones no son buenas");
      assert.equal(w.document.querySelectorAll(".mission-station-button:disabled").length, 3);
      click("Acercarme rápidamente."); assert(w.document.querySelector(".mission-feedback").textContent.includes("Puedes intentarlo"));
      click("Pronunciar un hechizo."); assert.equal(w.MagicMission.progress.snapshot().completed, 0);
      click("Hacer una reverencia."); assert(w.document.querySelector(".mission-success").textContent.includes("acepta tu respeto"));
      click("Continuar el camino →");
      const input = w.document.querySelector("textarea"); assert(w.document.querySelector("button[type=submit]").disabled);
      input.value = "Nuestro viaje <img src=x onerror=alert(1)>"; input.dispatchEvent(new w.Event("input"));
      click("Guardar este recuerdo");
      click("Continuar el camino →");
      click("Patronum"); click("Expecto"); click("Invocar al guardián"); assert.equal(w.MagicMission.progress.snapshot().completed, 2);
      click("Borrar palabras"); click("Expecto"); click("Patronum"); click("Invocar al guardián");
      assert(w.document.querySelector(".mission-success").textContent.includes("iluminado"));
      click("Continuar el camino →");
      assert.equal(w.document.querySelectorAll(".mission-note:not(:disabled)").length, 1);
      w.document.querySelector(".mission-note:not(:disabled)").click();
      const saved = w.MagicMission.progress.snapshot();
      const resumed = harness(width, saved);
      try {
        assert.equal(resumed.played, 0);
        assert.equal(resumed.w.document.querySelector(".welcome-copy .mission-entry").hidden, false);
        assert(await resumed.w.Aventura.goToPart(8));
        assert.equal(resumed.w.MagicMission.progress.snapshot().answer, input.value);
        for (let i = 1; i < 5; i++) resumed.w.document.querySelector(".mission-note:not(:disabled)").click();
        resumed.w.MagicMission.config.giftTitle = "Una noche de música";
        resumed.w.MagicMission.config.giftDescription = "Nuestra sorpresa configurable";
        resumed.w.MagicMission.config.eventDate = "Marzo de 2027";
        resumed.w.MagicMission.config.giftImage = "./assets/pareja.jpeg";
        resumed.click("Descubrir la sorpresa");
        assert(resumed.w.document.querySelector(".mission-gift").textContent.includes("Una noche de música"));
        assert(resumed.w.document.querySelector(".mission-final-letter").textContent.includes("Marzo de 2027 tenemos una cita mágica."));
        assert(resumed.w.document.querySelector(".mission-gift img").src.endsWith("/assets/pareja.jpeg"));
        resumed.w.document.querySelector(".mission-gift img").dispatchEvent(new resumed.w.Event("error"));
        assert(resumed.w.document.querySelector(".mission-gift .mission-art-ticket"), "si falla la imagen aparece el sobre original");
        assert(resumed.w.document.querySelector(".mission-final-letter").textContent.includes("Tu compañera de aventuras, Lu."));
        assert.equal(resumed.w.document.querySelector(".mission-written-memory blockquote").textContent, input.value);
        assert.equal(resumed.w.document.querySelector(".mission-written-memory img"), null, "la respuesta se inserta como texto");
        assert.equal(resumed.w.MagicMission.progress.snapshot().revealed, true);
        assert(await resumed.w.Aventura.goToPart7()); assert(await resumed.w.Aventura.goToPart(8));
        assert(resumed.w.document.querySelector(".mission-gift"));
        assert.deepEqual(resumed.errors, []);
      } finally { resumed.dom.window.close(); }
      assert.deepEqual(h.errors, []);
    } finally { h.dom.window.close(); }
  });
}
