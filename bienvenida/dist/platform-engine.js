/* Parte 5 · Motor del juego de plataformas "Arma el mensaje". Sin DOM: se prueba con Node. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PlatformEngine = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  const TILE = 16, COLS = 150, ROWS = 12;
  const SOLID = new Set(["#", "B", "?", "U", "S"]);
  // Ocho lugares posibles para palabras, de izquierda a derecha: bloques corazón (?) o palabras flotantes (W).
  const WORD_MARKERS = [[8, 6, "?"], [25, 4, "W"], [33, 6, "?"], [52, 2, "W"], [62, 6, "?"], [83, 2, "W"], [95, 6, "?"], [110, 6, "W"]];
  const ENEMIES = [14, 30, 36, 57, 66, 88, 92, 112];
  const CHECKPOINTS = [2, 22, 45, 74, 105];
  const POLE_X = 130, DOOR_X = 137;

  function splitPhrase(phrase) {
    const words = String(phrase || "").trim().split(/\s+/).filter(Boolean);
    if (words.length < 3 || words.length > 8) throw new RangeError("La frase de message.phrase debe tener entre 3 y 8 palabras.");
    return words;
  }

  function buildLevel(words) {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill("."));
    const set = (x, y, ch) => { if (x >= 0 && x < COLS && y >= 0 && y < ROWS) grid[y][x] = ch; };
    const ground = (a, b) => { for (let x = a; x <= b; x += 1) { set(x, 10, "#"); set(x, 11, "#"); } };
    [[0, 18], [21, 40], [44, 70], [73, 100], [104, COLS - 1]].forEach(([a, b]) => ground(a, b));
    [[7, 6], [9, 6], [32, 6], [34, 6], [60, 6], [61, 6], [63, 6], [64, 6], [94, 6], [96, 6]].forEach(([x, y]) => set(x, y, "B"));
    for (let x = 23; x <= 27; x += 1) set(x, 7, "B");
    for (let x = 51; x <= 53; x += 1) set(x, 5, "B");
    for (let x = 78; x <= 80; x += 1) set(x, 7, "B");
    for (let x = 82; x <= 84; x += 1) set(x, 5, "B");
    // Escalera antes del primer salto largo y escalera final hacia la bandera, como en el clásico.
    for (let i = 0; i < 4; i += 1) for (let h = 0; h <= i; h += 1) set(46 + i, 9 - h, "S");
    // Escalera final de subida y bajada: se puede cruzar en ambos sentidos para regresar por palabras.
    [1, 2, 3, 4, 4, 4, 3, 2, 1].forEach((height, i) => { for (let h = 0; h < height; h += 1) set(118 + i, 9 - h, "S"); });

    const chosen = words.map((_, i) => Math.round(i * (WORD_MARKERS.length - 1) / (words.length - 1)));
    const spots = [];
    WORD_MARKERS.forEach(([x, y, kind], markerIndex) => {
      const wordIndex = chosen.indexOf(markerIndex);
      if (wordIndex === -1) { if (kind === "?") set(x, y, "B"); return; }
      if (kind === "?") set(x, y, "?");
      spots.push({ x, y, kind: kind === "?" ? "block" : "float", index: wordIndex, word: words[wordIndex], collected: false, collectedAt: 0 });
    });
    return { grid, spots };
  }

  function createGame(phrase) {
    const words = splitPhrase(phrase);
    const { grid, spots } = buildLevel(words);
    const tileAt = (tx, ty) => (tx < 0 || tx >= COLS || ty < 0 ? (tx < 0 || tx >= COLS ? "#" : ".") : ty >= ROWS ? "." : grid[ty][tx]);
    const solidAt = (tx, ty) => SOLID.has(tileAt(tx, ty));
    const player = { x: CHECKPOINTS[0] * TILE, y: 10 * TILE - 14, w: 12, h: 14, vx: 0, vy: 0, onGround: true, facing: 1, inv: 0, coyote: 0, buffer: 0, walk: 0 };
    const enemies = ENEMIES.map((tx) => ({ x: tx * TILE + 1, y: 10 * TILE - 12, w: 14, h: 12, vx: -24, vy: 0, alive: true, active: false, squashed: 0 }));
    const state = { phase: "playing", time: 0, collected: 0, total: words.length, words, spots, grid, player, enemies,
      poleX: POLE_X * TILE, doorX: DOOR_X * TILE, flagY: 2 * TILE, blockedAt: -9, bumps: [] };
    let jumpHeld = false;

    function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

    // Mueve un cuerpo contra los bloques, primero en X y luego en Y.
    function moveBody(body, dt, onCeiling) {
      body.x += body.vx * dt;
      const top = Math.floor(body.y / TILE), bottom = Math.floor((body.y + body.h - .01) / TILE);
      if (body.vx > 0) {
        const tx = Math.floor((body.x + body.w) / TILE);
        for (let ty = top; ty <= bottom; ty += 1) if (solidAt(tx, ty)) { body.x = tx * TILE - body.w; body.vx = 0; body.hitWall = true; break; }
      } else if (body.vx < 0) {
        const tx = Math.floor(body.x / TILE);
        for (let ty = top; ty <= bottom; ty += 1) if (solidAt(tx, ty)) { body.x = (tx + 1) * TILE; body.vx = 0; body.hitWall = true; break; }
      }
      body.y += body.vy * dt;
      body.onGround = false;
      const left = Math.floor(body.x / TILE), right = Math.floor((body.x + body.w - .01) / TILE);
      if (body.vy > 0) {
        const ty = Math.floor((body.y + body.h) / TILE);
        for (let tx = left; tx <= right; tx += 1) if (solidAt(tx, ty)) { body.y = ty * TILE - body.h; body.vy = 0; body.onGround = true; break; }
      } else if (body.vy < 0) {
        const ty = Math.floor(body.y / TILE);
        // El bloque más cercano al centro de la cabeza recibe el golpe.
        const center = Math.floor((body.x + body.w / 2) / TILE);
        const order = [center, left, right].filter((v, i, list) => v >= left && v <= right && list.indexOf(v) === i);
        for (const tx of order) if (solidAt(tx, ty)) { body.y = (ty + 1) * TILE; body.vy = 0; if (onCeiling) onCeiling(tx, ty); break; }
      }
    }

    function respawn() {
      const cx = CHECKPOINTS.filter((c) => c * TILE <= player.x + 8).pop() ?? CHECKPOINTS[0];
      Object.assign(player, { x: cx * TILE, y: 10 * TILE - 14, vx: 0, vy: 0, inv: 1.6, onGround: true });
    }

    function collect(spot, events) {
      if (spot.collected) return;
      spot.collected = true; spot.collectedAt = state.time; state.collected += 1;
      events.push({ type: "word", index: spot.index, word: spot.word, count: state.collected, total: state.total });
    }

    function step(dt, input = {}) {
      const events = [];
      state.time += dt;
      const p = player;
      if (state.phase === "playing") {
        const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const accel = p.onGround ? 900 : 620;
        if (dir) { p.vx += dir * accel * dt; p.facing = dir; } else {
          const drag = (p.onGround ? 1100 : 250) * dt;
          p.vx = Math.abs(p.vx) <= drag ? 0 : p.vx - Math.sign(p.vx) * drag;
        }
        p.vx = Math.max(-98, Math.min(98, p.vx));
        p.coyote = p.onGround ? .09 : Math.max(0, p.coyote - dt);
        if (input.jump && !jumpHeld) p.buffer = .12; else p.buffer = Math.max(0, p.buffer - dt);
        if (p.buffer > 0 && p.coyote > 0) { p.vy = -325; p.buffer = 0; p.coyote = 0; events.push({ type: "jump" }); }
        if (!input.jump && p.vy < -130) p.vy = -130; // Salto corto al soltar.
        jumpHeld = !!input.jump;
        p.vy = Math.min(420, p.vy + 960 * dt);
        moveBody(p, dt, (tx, ty) => {
          const tile = grid[ty] && grid[ty][tx];
          state.bumps.push({ tx, ty, at: state.time });
          if (tile === "?") {
            grid[ty][tx] = "U";
            const spot = spots.find((s) => s.kind === "block" && s.x === tx && s.y === ty);
            if (spot) collect(spot, events);
          } else events.push({ type: "bump" });
        });
        if (p.x < 0) p.x = 0;
        p.walk = p.onGround && Math.abs(p.vx) > 5 ? p.walk + dt * Math.abs(p.vx) / 14 : 0;
        p.inv = Math.max(0, p.inv - dt);

        for (const spot of spots) {
          if (spot.kind === "float" && !spot.collected && overlaps(p, { x: spot.x * TILE, y: spot.y * TILE, w: TILE, h: TILE })) collect(spot, events);
        }

        for (const e of enemies) {
          if (!e.alive) { e.squashed += dt; continue; }
          if (!e.active && Math.abs(e.x - p.x) < 18 * TILE) e.active = true;
          if (!e.active) continue;
          e.hitWall = false;
          e.vy = Math.min(420, e.vy + 960 * dt);
          const speed = e.vx;
          moveBody(e, dt);
          if (e.hitWall) e.vx = -speed; else e.vx = speed;
          // Da la vuelta en los bordes para no caer a los huecos.
          if (e.onGround) {
            const front = e.vx > 0 ? Math.floor((e.x + e.w + 1) / TILE) : Math.floor((e.x - 1) / TILE);
            if (!solidAt(front, Math.floor((e.y + e.h + 1) / TILE))) e.vx = -e.vx;
          }
          if (e.y > ROWS * TILE) { e.alive = false; e.squashed = 9; continue; }
          if (!overlaps(p, e)) continue;
          if (p.vy > 40 && p.y + p.h - e.y < 9) {
            e.alive = false; e.squashed = 0; p.vy = input.jump ? -300 : -210;
            events.push({ type: "stomp", x: e.x + e.w / 2, y: e.y });
          } else if (p.inv <= 0) {
            p.inv = 1.5; p.vy = -170; p.vx = (p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1) * 150;
            events.push({ type: "hurt" });
          }
        }

        if (p.y > ROWS * TILE + 24) { respawn(); events.push({ type: "fall" }); }

        // La bandera solo se alcanza con todas las palabras.
        if (p.x + p.w >= state.poleX + 4) {
          if (state.collected < state.total) {
            p.x = state.poleX + 4 - p.w; p.vx = Math.min(0, p.vx);
            if (state.time - state.blockedAt > 1.4) { state.blockedAt = state.time; events.push({ type: "blocked", missing: state.total - state.collected }); }
          } else {
            state.phase = "flag"; p.vx = 0; p.vy = 0; p.x = state.poleX - p.w + 6; p.facing = 1;
            events.push({ type: "flag", height: Math.max(0, 10 * TILE - (p.y + p.h)) });
          }
        }
      } else if (state.phase === "flag") {
        p.y = Math.min(10 * TILE - p.h, p.y + 110 * dt);
        state.flagY = Math.min(9 * TILE, state.flagY + 110 * dt);
        if (p.y >= 10 * TILE - p.h && state.flagY >= 9 * TILE) { state.phase = "walk"; p.x = state.poleX + 8; }
      } else if (state.phase === "walk") {
        p.vx = 60; p.x += p.vx * dt; p.walk += dt * 4; p.onGround = true;
        if (p.x >= state.doorX) { state.phase = "done"; state.doneAt = state.time; events.push({ type: "win" }); }
      }
      state.bumps = state.bumps.filter((b) => state.time - b.at < .25);
      return events;
    }

    return { state, step, tileAt, solidAt };
  }

  return Object.freeze({ TILE, COLS, ROWS, POLE_X, DOOR_X, splitPhrase, createGame });
});
