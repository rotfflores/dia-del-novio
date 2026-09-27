/* Parte 6 · "Vuela, corazón": juego infinito tipo Flappy Bird. El récord se guarda en este navegador. */
(() => {
  "use strict";
  const Engine = window.FlappyEngine;
  const { WIDTH, HEIGHT, GROUND, BIRD_X, RADIUS, PILLAR_W } = Engine;
  const SERIF = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
  const HEART = new Path2D("M3 3h6v3h6V3h6v3h3v9h-3v3h-3v3h-3v3H9v-3H6v-3H3v-3H0V6h3z");
  const DEFAULT_TEXT = {
    title: "Vuela, corazón",
    introduction: "Toca para aletear y cruza entre las columnas. Es infinito: ¿hasta dónde llegas?",
    readyHint: "Toca, haz clic o presiona espacio para volar",
    overTitle: "¡Uy, un tropiezo!",
    newRecord: "¡Nuevo récord!",
    againButton: "Volar otra vez",
    backButton: "Volver a mi premio",
    finishButton: "Terminar la aventura →",
    phrases: [
      "Cada día contigo es mi favorito",
      "Eres mi lugar seguro",
      "Me haces reír como nadie",
      "Contigo todo es más bonito",
      "Gracias por elegirme",
      "Te quiero más que ayer",
      "Eres mi persona favorita",
      "Juntos llegamos más lejos",
      "Eres mi mejor aventura",
      "Sigue volando, mi amor",
      "Tu risa es mi canción favorita",
      "Mi corazón vuela contigo",
      "Eres mi casualidad más bonita",
      "Contigo, hasta lo simple es especial",
      "Me encanta nuestra historia",
      "Eres mi calma y mi locura",
      "Quiero mil aventuras más contigo",
      "Tus abrazos son mi hogar",
      "Siempre voy a elegirte",
      "Eres lo mejor de mis días",
      "Contigo el tiempo vuela",
      "Mi lugar favorito eres tú",
      "Gracias por existir",
      "Eres mi sueño cumplido",
      "Te pienso a cada rato",
      "Contigo todo tiene sentido",
      "Nunca dejes de sonreír",
      "Eres mi premio mayor",
      "Qué bonito es quererte",
      "Tú y yo, siempre",
    ],
  };

  window.Aventura.registerPart6((container, context) => {
    const { config, icon, renderText, goToPart5, goToPart7 } = context;
    const text = { ...DEFAULT_TEXT, ...(config.flappy || {}) };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let storage = null;
    try { storage = window.localStorage; } catch { storage = null; }
    const record = Engine.createRecord(storage);
    const game = Engine.createGame();
    const { state } = game;

    container.classList.add("flappy-part");
    container.innerHTML = `
      <header class="flappy-intro">
        <p class="memory-step"></p>
        <h2 id="part-six-title" tabindex="-1"></h2>
        <p class="flappy-instruction"></p>
      </header>
      <div class="flappy-session">
        <div class="flappy-hud">
          <div><span>Puntos</span><strong class="flappy-score">0</strong></div>
          <div><span>Récord</span><strong class="flappy-best">0</strong></div>
        </div>
        <div class="flappy-stage">
          <canvas class="flappy-canvas" tabindex="0" role="img"></canvas>
          <div class="flappy-overlay" hidden>
            <section class="flappy-panel">
              <span class="flappy-panel-icon"></span>
              <p class="flappy-badge" hidden></p>
              <h3 tabindex="-1"></h3>
              <div class="flappy-result"><div><span>Puntos</span><strong class="flappy-final"></strong></div><div><span>Récord</span><strong class="flappy-final-best"></strong></div></div>
              <button type="button" class="primary-button flappy-again"></button>
            </section>
          </div>
        </div>
      </div>
      <div class="flappy-finish"><button type="button" class="primary-button flappy-final-button"></button></div>
      <nav class="flappy-back"><button type="button" class="text-button icon-button"></button></nav>
      <p class="sr-only flappy-announcer" role="status" aria-live="polite" aria-atomic="true"></p>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".memory-step").textContent = `Parte 6 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    find(".flappy-instruction").textContent = text.introduction;
    find(".flappy-panel h3").textContent = text.overTitle;
    find(".flappy-panel-icon").append(icon("pixel-heart"));
    find(".flappy-again").append(icon("replay"), document.createTextNode(text.againButton));
    const back = find(".flappy-back button");
    back.append(icon("arrow-left"), document.createTextNode(text.backButton));
    back.addEventListener("click", goToPart5);
    renderText(find(".flappy-final-button"), text.finishButton);
    find(".flappy-final-button").addEventListener("click", goToPart7);
    const canvas = find(".flappy-canvas"), ctx = canvas.getContext("2d");
    const announcer = find(".flappy-announcer"), overlay = find(".flappy-overlay");
    canvas.setAttribute("aria-label", "Juego infinito: el corazón vuela entre columnas. Toca o presiona espacio para aletear.");
    const sound = (name) => window.Sonidos?.play(name);

    function updateHud() {
      find(".flappy-score").textContent = String(state.score);
      find(".flappy-best").textContent = String(Math.max(record.best, 0));
    }
    updateHud();

    const particles = [];
    function burst(x, y, colors, count = 8, speed = 50) {
      if (reducedMotion.matches) return;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 20, life: .7, max: .7, color: colors[i % colors.length], size: 5 });
      }
    }

    function handle(events) {
      for (const event of events) {
        if (event.type === "flap") sound("flip");
        else if (event.type === "point") {
          updateHud(); sound("tap");
          if (event.score % 10 === 0) { burst(BIRD_X, state.bird.y, ["#e9a53a", "#b62d51"], 10, 60); announcer.textContent = `${event.score} puntos`; }
        } else if (event.type === "hit") gameOver(event.score);
      }
    }

    let overTimer = 0;
    function gameOver(score) {
      const isRecord = record.submit(score);
      sound(isRecord ? "win" : "miss");
      burst(BIRD_X, state.bird.y, ["#b62d51", "#d88b9f"], 8, 45);
      updateHud();
      find(".flappy-final").textContent = String(score);
      find(".flappy-final-best").textContent = String(record.best);
      const badge = find(".flappy-badge");
      badge.hidden = !isRecord; badge.textContent = text.newRecord;
      find(".flappy-panel").classList.toggle("is-record", isRecord);
      announcer.textContent = `${isRecord ? text.newRecord + " " : ""}${score} puntos. Récord: ${record.best}.`;
      overTimer = setTimeout(() => { overlay.hidden = false; find(".flappy-again").focus({ preventScroll: true }); }, reducedMotion.matches ? 100 : 700);
    }

    function restart() {
      clearTimeout(overTimer);
      overlay.hidden = true;
      game.reset();
      phraseOrder = [];
      particles.length = 0;
      updateHud();
      canvas.focus({ preventScroll: true });
    }
    find(".flappy-again").addEventListener("click", restart);

    // Aletear: toque, clic, espacio, W o flecha arriba.
    const playing = () => window.Aventura.currentPart === 6 && !window.Aventura.isTransitioning;
    function tryFlap() {
      if (!playing()) return;
      if (state.phase === "over") { if (state.time - state.overAt > .6 && !overlay.hidden) restart(); return; }
      handle(game.flap());
    }
    canvas.addEventListener("pointerdown", (event) => { event.preventDefault(); tryFlap(); });
    function onKey(event) {
      if (!["Space", "ArrowUp", "KeyW"].includes(event.code) || !playing()) return;
      if (event.target.closest && event.target.closest("button, a, input, textarea")) return;
      event.preventDefault();
      if (!event.repeat) tryFlap();
    }
    window.addEventListener("keydown", onKey);

    // Lienzo nítido en cualquier pantalla.
    let scale = 1;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || WIDTH;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * dpr * HEIGHT / WIDTH);
      scale = canvas.width / WIDTH;
      draw(0);
    }
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(canvas); else window.addEventListener("resize", resize);

    // ---------- Dibujo ----------
    const rect = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    function drawBackground() {
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, "#fbe2ea"); sky.addColorStop(.65, "#faf0ef"); sky.addColorStop(1, "#faf7f2");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, GROUND);
      const d = state.distance;
      ctx.fillStyle = "#fffdfb"; ctx.strokeStyle = "#efdde2"; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i += 1) {
        const x = ((i * 90 + 20 - d * .15) % 270 + 270) % 270 - 45, y = 30 + i * 28;
        ctx.beginPath(); ctx.roundRect(x, y, 34, 10, 5); ctx.roundRect(x + 8, y - 6, 18, 12, 6); ctx.fill(); ctx.stroke();
      }
      [[.25, "#f5e1e7", 60, 40, 150], [.5, "#efd0d9", 40, 30, 110]].forEach(([factor, color, radius, lift, spacing]) => {
        ctx.fillStyle = color;
        const offset = -((d * factor) % spacing);
        for (let x = offset - spacing; x < WIDTH + spacing; x += spacing) { ctx.beginPath(); ctx.ellipse(x, GROUND + 2, radius, lift, 0, Math.PI, 0); ctx.fill(); }
      });
    }
    function drawGround() {
      const offset = -(state.distance % 16);
      rect("#efc9d4", 0, GROUND, WIDTH, HEIGHT - GROUND);
      rect("#d98fa5", 0, GROUND, WIDTH, 4); rect("#f2b7c7", 0, GROUND, WIDTH, 1);
      for (let x = offset; x < WIDTH + 16; x += 16) { rect("#e3b3c1", x, GROUND + 12, 16, 1); rect("#e3b3c1", x + 4, GROUND + 4, 1, 8); rect("#e3b3c1", x + 11, GROUND + 13, 1, 11); rect("#c8718d", x + 7, GROUND + 4, 2, 1); }
    }
    // Columnas de piedra rosa como las del castillo, con remate y un corazón.
    function drawColumn(x, top, bottom, capAtBottom) {
      rect("#bd7d91", x, top, PILLAR_W, bottom - top);
      rect("#efc9d4", x + 1, top, PILLAR_W - 2, bottom - top);
      rect("#f8e3e9", x + 3, top, 3, bottom - top);
      rect("#e0aebd", x + PILLAR_W - 6, top, 3, bottom - top);
      for (let y = top + ((top % 12) + 12) % 12; y < bottom; y += 12) rect("#e0aebd", x + 1, y, PILLAR_W - 2, 1);
      const capY = capAtBottom ? bottom - 12 : top;
      rect("#a8657c", x - 3, capY, PILLAR_W + 6, 12);
      rect("#d98fa5", x - 2, capY + 1, PILLAR_W + 4, 10);
      rect("#f2b7c7", x - 2, capY + 1, PILLAR_W + 4, 2);
      ctx.save(); ctx.translate(x + PILLAR_W / 2 - 3.5, capY + 2.5); ctx.scale(7 / 24, 7 / 24); ctx.fillStyle = "#b62d51"; ctx.fill(HEART); ctx.restore();
    }
    // Frases de amor que pasan por el fondo, más lento que las columnas.
    const phrases = Array.isArray(text.phrases) ? text.phrases.filter((p) => typeof p === "string" && p.trim()) : [];
    const PHRASE_GAP = 430, PHRASE_SPEED = .55;
    const wrapCache = new Map();
    function wrap(phrase) {
      if (wrapCache.has(phrase)) return wrapCache.get(phrase);
      const lines = [];
      phrase.split(" ").forEach((word) => {
        const lastLine = lines[lines.length - 1];
        if (lastLine && ctx.measureText(`${lastLine} ${word}`).width <= 132) lines[lines.length - 1] = `${lastLine} ${word}`;
        else lines.push(word);
      });
      wrapCache.set(phrase, lines);
      return lines;
    }
    // Orden aleatorio: se baraja la lista completa y se vuelve a barajar al terminarla, sin repetir seguidas.
    let phraseOrder = [];
    function phraseAt(k) {
      while (phraseOrder.length <= k) {
        const bag = phrases.map((_, i) => i);
        for (let i = bag.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
        if (bag.length > 1 && bag[0] === phraseOrder[phraseOrder.length - 1]) [bag[0], bag[1]] = [bag[1], bag[0]];
        phraseOrder.push(...bag);
      }
      return phrases[phraseOrder[k]];
    }
    function drawPhrases() {
      if (!phrases.length || state.phase === "ready") return;
      const travelled = state.distance * PHRASE_SPEED;
      ctx.save();
      ctx.font = `italic 400 13px ${SERIF}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const first = Math.max(0, Math.floor((travelled - WIDTH - 90) / PHRASE_GAP));
      for (let k = first; k <= first + 2; k += 1) {
        const x = WIDTH + 90 + k * PHRASE_GAP - travelled;
        if (x < -90 || x > WIDTH + 90) continue;
        const lines = wrap(phraseAt(k));
        const y = (k % 2 ? 118 : 72) - (lines.length - 1) * 8;
        // Aparece y se desvanece suavemente en los bordes.
        const edge = Math.min(x + 90, WIDTH + 90 - x) / 60;
        ctx.globalAlpha = Math.max(0, Math.min(1, edge)) * .78;
        lines.forEach((line, i) => {
          ctx.lineWidth = 3; ctx.strokeStyle = "#fffaf5"; ctx.strokeText(line, x, y + i * 16);
          ctx.fillStyle = "#b6566f"; ctx.fillText(line, x, y + i * 16);
        });
        ctx.globalAlpha *= .8;
        ctx.save(); ctx.translate(x - 3.5, y - 16); ctx.scale(7 / 24, 7 / 24); ctx.fillStyle = "#d88b9f"; ctx.fill(HEART); ctx.restore();
      }
      ctx.restore();
    }
    function drawPillars() {
      for (const p of state.pillars) {
        const top = p.gapY - p.gap / 2, bottom = p.gapY + p.gap / 2;
        drawColumn(Math.round(p.x), -4, top, true);
        drawColumn(Math.round(p.x), bottom, GROUND, false);
      }
    }
    function drawBird() {
      const b = state.bird;
      const tilt = state.phase === "ready" ? 0 : Math.max(-.45, Math.min(1.2, b.vy / 330));
      const wingUp = state.phase !== "over" && (state.time - b.flapAt < .12 || (state.phase === "ready" && Math.floor(state.time * 6) % 2));
      ctx.save();
      ctx.translate(BIRD_X, b.y);
      ctx.rotate(reducedMotion.matches ? 0 : tilt);
      // Ala blanca detrás del corazón.
      ctx.fillStyle = "#fff9f4"; ctx.strokeStyle = "#772b41"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(-6, wingUp ? -5 : 1, 5, 3, wingUp ? -.6 : .4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.translate(-8, -8); ctx.scale(16 / 24, 16 / 24);
      ctx.strokeStyle = "#772b41"; ctx.lineWidth = 2.4; ctx.stroke(HEART); ctx.fillStyle = "#b62d51"; ctx.fill(HEART); ctx.restore();
      rect("#e4577c", -5, -6, 2, 2);
      if (state.phase === "over") {
        ctx.strokeStyle = "#fff9f4"; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(-3, -3); ctx.lineTo(0, 0); ctx.moveTo(0, -3); ctx.lineTo(-3, 0); ctx.moveTo(2, -3); ctx.lineTo(5, 0); ctx.moveTo(5, -3); ctx.lineTo(2, 0); ctx.stroke();
      } else { rect("#fff9f4", -2, -4, 2, 3); rect("#fff9f4", 3, -4, 2, 3); rect("#fff9f4", -1, 1, 4, 1); }
      ctx.restore();
    }
    function drawParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const part = particles[i];
        part.life -= dt; if (part.life <= 0) { particles.splice(i, 1); continue; }
        part.x += part.vx * dt; part.y += part.vy * dt; part.vy += 100 * dt;
        ctx.save(); ctx.globalAlpha = part.life / part.max; ctx.translate(part.x - 2.5, part.y - 2.5); ctx.scale(5 / 24, 5 / 24); ctx.fillStyle = part.color; ctx.fill(HEART); ctx.restore();
      }
    }
    function drawScore() {
      if (state.phase === "ready") {
        ctx.font = `italic 400 11px ${SERIF}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const lines = ["Toca para volar", `Récord: ${record.best}`];
        ctx.fillStyle = "#fffdfbdd"; ctx.strokeStyle = "#d8adbb"; ctx.beginPath(); ctx.roundRect(WIDTH / 2 - 52, 160, 104, 36, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#94213f"; ctx.fillText(lines[0], WIDTH / 2, 172); ctx.font = `600 8px ${SERIF}`; ctx.fillStyle = "#79646a"; ctx.fillText(lines[1].toUpperCase(), WIDTH / 2, 186);
        return;
      }
      ctx.font = `600 26px ${SERIF}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.lineWidth = 4; ctx.strokeStyle = "#fffdfb"; ctx.strokeText(String(state.score), WIDTH / 2, 14);
      ctx.fillStyle = "#94213f"; ctx.fillText(String(state.score), WIDTH / 2, 14);
    }
    function draw(dt) {
      if (!canvas.width) return;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      drawBackground();
      drawPhrases();
      drawPillars();
      drawGround();
      drawBird();
      drawParticles(dt);
      drawScore();
    }

    // ---------- Ciclo ----------
    let frame = 0, last = 0, accumulator = 0, stopped = false;
    function loop(now) {
      if (stopped) return;
      frame = requestAnimationFrame(loop);
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      last = now;
      if (window.Aventura.currentPart !== 6 || document.hidden) return;
      // La parte se monta oculta: ajusta la resolución en cuanto el lienzo tiene tamaño real.
      if (Math.abs(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2) - canvas.width) > 2) resize();
      accumulator += dt;
      while (accumulator >= 1 / 120) { handle(game.step(1 / 120)); accumulator -= 1 / 120; }
      draw(dt);
    }
    resize();
    frame = requestAnimationFrame(loop);
    container.flappyGame = game; // Útil para revisar el juego desde la consola.

    return () => {
      stopped = true; cancelAnimationFrame(frame); clearTimeout(overTimer);
      window.removeEventListener("keydown", onKey);
      if (resizeObserver) resizeObserver.disconnect(); else window.removeEventListener("resize", resize);
    };
  });
})();
