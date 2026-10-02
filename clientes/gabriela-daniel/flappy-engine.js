/* Parte 6 · Motor del juego infinito "Vuela, corazón" (tipo Flappy Bird). Sin DOM: se prueba con Node. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FlappyEngine = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  const WIDTH = 180, HEIGHT = 256, GROUND = 232;
  const BIRD_X = 52, RADIUS = 6.5, PILLAR_W = 30, SPACING = 112;
  const GRAVITY = 880, FLAP = -255, MAX_FALL = 420;

  // Dificultad: más rápido y con huecos más estrechos, con límites para que siempre se pueda pasar.
  function difficulty(score) {
    return { speed: Math.min(112, 68 + score * 1.6), gap: Math.max(66, 82 - score * .6) };
  }

  function createGame(random = Math.random) {
    const state = { phase: "ready", time: 0, score: 0, distance: 0, bird: { y: 118, vy: 0, flapAt: -1 }, pillars: [], lastGapY: 118, overAt: 0 };

    function addPillar(x) {
      const { gap } = difficulty(state.score);
      const min = 34 + gap / 2, max = GROUND - 30 - gap / 2;
      // El centro nuevo no se aleja demasiado del anterior: exigente pero justo.
      const target = min + random() * (max - min);
      const gapY = Math.max(min, Math.min(max, Math.max(state.lastGapY - 72, Math.min(state.lastGapY + 72, target))));
      state.lastGapY = gapY;
      state.pillars.push({ x, gapY, gap, passed: false });
    }

    function reset() {
      Object.assign(state, { phase: "ready", time: 0, score: 0, distance: 0, pillars: [], lastGapY: 118, overAt: 0 });
      Object.assign(state.bird, { y: 118, vy: 0, flapAt: -1 });
    }

    function flap() {
      const events = [];
      if (state.phase === "over") return events;
      if (state.phase === "ready") { state.phase = "playing"; addPillar(WIDTH + 40); }
      state.bird.vy = FLAP;
      state.bird.flapAt = state.time;
      events.push({ type: "flap" });
      return events;
    }

    function hits(bird, pillar) {
      const top = { x: pillar.x, y: -40, w: PILLAR_W, h: pillar.gapY - pillar.gap / 2 + 40 };
      const bottom = { x: pillar.x, y: pillar.gapY + pillar.gap / 2, w: PILLAR_W, h: GROUND - (pillar.gapY + pillar.gap / 2) };
      return [top, bottom].some((r) => {
        const nx = Math.max(r.x, Math.min(BIRD_X, r.x + r.w)), ny = Math.max(r.y, Math.min(bird.y, r.y + r.h));
        return (BIRD_X - nx) ** 2 + (bird.y - ny) ** 2 < RADIUS ** 2;
      });
    }

    function step(dt) {
      const events = [];
      state.time += dt;
      const bird = state.bird;
      if (state.phase === "ready") { bird.y = 118 + Math.sin(state.time * 3) * 4; return events; }
      if (state.phase === "over") {
        // El corazón cae hasta el suelo después del choque.
        if (bird.y < GROUND - RADIUS) { bird.vy = Math.min(MAX_FALL, bird.vy + GRAVITY * dt); bird.y = Math.min(GROUND - RADIUS, bird.y + bird.vy * dt); }
        return events;
      }
      const { speed } = difficulty(state.score);
      state.distance += speed * dt;
      bird.vy = Math.min(MAX_FALL, bird.vy + GRAVITY * dt);
      bird.y += bird.vy * dt;
      if (bird.y < RADIUS) { bird.y = RADIUS; bird.vy = 0; }
      for (const pillar of state.pillars) {
        pillar.x -= speed * dt;
        if (!pillar.passed && pillar.x + PILLAR_W < BIRD_X - RADIUS) {
          pillar.passed = true; state.score += 1;
          events.push({ type: "point", score: state.score });
        }
      }
      state.pillars = state.pillars.filter((p) => p.x + PILLAR_W > -10);
      const last = state.pillars[state.pillars.length - 1];
      if (!last || last.x < WIDTH + 40 - SPACING) addPillar((last ? last.x : WIDTH) + SPACING);
      if (bird.y + RADIUS >= GROUND || state.pillars.some((p) => hits(bird, p))) {
        if (bird.y + RADIUS >= GROUND) bird.y = GROUND - RADIUS;
        state.phase = "over"; state.overAt = state.time; bird.vy = Math.min(bird.vy, -60);
        events.push({ type: "hit", score: state.score });
      }
      return events;
    }

    return { state, step, flap, reset };
  }

  // Récord guardado en el navegador; si el almacenamiento no está disponible, dura la visita.
  function createRecord(storage, key = "aventura-flappy-record") {
    let memory = 0;
    const read = () => { try { const value = Number(storage && storage.getItem(key)); return Number.isInteger(value) && value > 0 ? value : 0; } catch { return 0; } };
    memory = read();
    return {
      get best() { return memory; },
      submit(score) {
        if (!Number.isInteger(score) || score <= memory) return false;
        memory = score;
        try { if (storage) storage.setItem(key, String(score)); } catch { /* Solo en memoria. */ }
        return true;
      },
    };
  }

  return Object.freeze({ WIDTH, HEIGHT, GROUND, BIRD_X, RADIUS, PILLAR_W, difficulty, createGame, createRecord });
});
