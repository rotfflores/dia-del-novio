/* Laberinto del amor. Arte SVG y sonidos originales, sin recursos externos. */
(() => {
  "use strict";
  window.Aventura.registerPart4((container, context) => {
    const { config, icon, renderText, completeGame, goToPart3 } = context;
    const options = config.game;
    const duration = options.durationSeconds >= 45 && options.durationSeconds <= 90 ? options.durationSeconds : 60;
    const game = window.LoveMaze.createGame({ duration });
    const state = game.state;
    let storage;
    try { storage = window.localStorage; } catch { /* Navegación privada sin almacenamiento. */ }
    let best = window.LoveMaze.readRecord(storage), frame = 0, lastTime = 0, active = false, savedScroll = 0;
    // El sonido del laberinto empieza activado, igual que el resto de la página.
    let soundEnabled = window.Sonidos ? window.Sonidos.enabled : true, audioContext = null, master = null, claiming = false;
    const nodes = new Map();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ns = "http://www.w3.org/2000/svg";
    const svgNode = (tag, attributes) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, String(value)));
      return node;
    };
    container.innerHTML = `
      <header class="maze-intro">
        <p class="memory-step">Parte 4 de ${config.totalParts}</p>
        <h2 id="part-four-title" tabindex="-1"></h2>
        <p class="maze-instruction"></p>
        <p class="maze-dedication"></p>
      </header>
      <div class="maze-session" aria-label="Laberinto del amor">
        <div class="maze-toolbar">
          <span class="maze-small-title">Laberinto del amor <small>4 / 7</small></span>
          <div class="maze-tools">
            <button type="button" class="maze-sound" aria-pressed="true">Sonido: sí</button>
            <button type="button" class="maze-pause" disabled>Pausa</button>
            <button type="button" class="maze-reset" disabled aria-label="Reiniciar partida"></button>
            <button type="button" class="maze-exit">Salir</button>
          </div>
        </div>
        <div class="maze-hud" aria-label="Marcador">
          <div><span>Puntos</span><strong class="maze-score">0</strong></div>
          <div><span>Récord</span><strong class="maze-record">0</strong></div>
          <div><span>Tiempo</span><strong class="maze-timer"></strong></div>
          <div><span>Vidas</span><strong class="maze-lives"></strong></div>
        </div>
        <div class="maze-board-area">
          <svg class="maze-board" tabindex="0" role="img" aria-label="Laberinto del amor" aria-describedby="maze-controls-help"></svg>
          <div class="maze-overlay">
            <section class="maze-panel maze-ready" aria-label="Antes de jugar">
              <span class="maze-panel-icon"></span>
              <h3>Un corazón.<br>Muchos caminos.</h3>
              <p class="maze-ready-details"></p>
              <button type="button" class="primary-button maze-start">¡Jugar!</button>
            </section>
            <section class="maze-panel maze-paused" hidden>
              <span class="maze-panel-icon"></span>
              <h3 tabindex="-1">Una pequeña pausa</h3>
              <p>Los corazones pueden esperar.<br>El tiempo se ha detenido.</p>
              <button type="button" class="primary-button maze-resume">Seguir jugando</button>
              <button type="button" class="text-button maze-paused-reset">Empezar de nuevo</button>
            </section>
            <section class="maze-panel maze-results" hidden>
              <span class="maze-panel-icon"></span>
              <p class="maze-result-tag">Partida completada</p>
              <h3 tabindex="-1"></h3>
              <p class="maze-result-reason"></p>
              <div class="maze-result-score"></div>
              <p class="maze-result-record"></p>
              <p class="maze-result-message"></p>
              <button type="button" class="primary-button maze-claim"></button>
              <button type="button" class="text-button icon-button maze-again"></button>
            </section>
          </div>
        </div>
        <div class="maze-control-deck">
          <div class="maze-play-notes">
            <p class="maze-power-label">Un corazón a la vez</p>
            <p class="maze-collected"></p>
            <p class="maze-combo"></p>
          </div>
          <div class="maze-dpad" role="group" aria-label="Direcciones del corazón">
            <button type="button" data-direction="up" aria-label="Arriba"></button>
            <button type="button" data-direction="left" aria-label="Izquierda"></button>
            <button type="button" data-direction="down" aria-label="Abajo"></button>
            <button type="button" data-direction="right" aria-label="Derecha"></button>
          </div>
        </div>
      </div>
      <div class="maze-guide">
        <p id="maze-controls-help"><strong>Tú pones el rumbo.</strong> Usa las flechas o WASD. En celular, toca una dirección: el corazón sigue hasta la pared y gira en el próximo cruce.</p>
        <ul><li><span class="maze-legend-heart"></span>Corazones: +10 puntos</li><li><span class="maze-legend-power"></span>Corazón grande: 7 s de poder</li><li><span class="maze-legend-cloud"></span>Nubecitas: malentendidos</li></ul>
        <p>Cinco corazones seguidos: +20 puntos. Tienes tres vidas y protección al reaparecer. Pausa con P o Esc.</p>
      </div>
      <p class="sr-only maze-announcer" role="status" aria-live="polite" aria-atomic="true"></p>
    `;
    const find = (selector) => container.querySelector(selector);
    const board = find(".maze-board"), overlay = find(".maze-overlay"), announcer = find(".maze-announcer");
    find("#part-four-title").textContent = options.title;
    find(".maze-instruction").textContent = options.instruction;
    find(".maze-dedication").textContent = `${config.names.her} + ${config.names.him} · El mejor equipo`;
    find(".maze-ready-details").textContent = `${duration} segundos para llenar de amor el camino. El premio te espera al terminar.`;
    find(".maze-reset").append(icon("replay"));
    find(".maze-sound").textContent = soundEnabled ? "Sonido: sí" : "Sonido: no";
    find(".maze-sound").setAttribute("aria-pressed", String(soundEnabled));
    find(".maze-again").append(icon("replay"), document.createTextNode("Jugar otra vez"));
    renderText(find(".maze-claim"), "Reclamar mi premio →");
    container.querySelectorAll(".maze-panel-icon").forEach((node) => node.append(icon("pixel-heart")));
    find(".maze-legend-heart").append(icon("heart-filled"));
    find(".maze-legend-power").append(icon("heart-filled"));
    find(".maze-legend-cloud").textContent = "☁";
    container.querySelectorAll("button").forEach((button) => { button.dataset.sound = "none"; });
    const dpad = [...container.querySelectorAll("[data-direction]")];
    dpad.forEach((button) => {
      const direction = button.dataset.direction;
      const arrow = icon("arrow-right");
      arrow.style.transform = `rotate(${{ up: -90, left: 180, down: 90, right: 0 }[direction]}deg)`;
      button.append(arrow);
      const steer = () => game.direction(direction);
      button.addEventListener("pointerdown", (event) => {
        if (state.phase !== "running") return;
        event.preventDefault(); button.setPointerCapture(event.pointerId); button.classList.add("is-pressed"); steer();
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => button.addEventListener(name, () => button.classList.remove("is-pressed")));
      button.addEventListener("click", steer); // Enter, Espacio y tecnología de asistencia.
    });

    board.setAttribute("viewBox", `0 0 ${game.width * 24} ${game.height * 24}`);
    board.innerHTML = `<defs>
      <path id="maze-heart-shape" d="M0 8C-3 5-10 1-9-4-8-10-2-10 0-5 2-10 8-10 9-4 10 1 3 5 0 8Z"/>
      <radialGradient id="maze-aura-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".75"/><stop offset=".55" stop-color="#f4b860" stop-opacity=".35"/><stop offset="1" stop-color="#f0a24a" stop-opacity="0"/></radialGradient>
      <path id="maze-aura-spark" d="M0-3C0-1 1 0 3 0 1 0 0 1 0 3 0 1-1 0-3 0-1 0 0-1 0-3Z"/>
      <g id="maze-cloud-shape"><path d="M-9 5C-15 3-13-5-8-5-8-13 3-13 5-7 12-9 16 1 10 5Z" fill="currentColor" stroke="#6d647d" stroke-width="1.1"/><path d="M-4-3v2m8-2v2" stroke="#40324f" stroke-width="1.8" stroke-linecap="round"/><path d="M-2 2q2-2 4 0" fill="none" stroke="#40324f" stroke-width="1"/></g>
    </defs><g class="maze-walls"/><g class="maze-hearts"/><g class="maze-actors"/>`;
    const walls = find(".maze-walls"), hearts = find(".maze-hearts"), actors = find(".maze-actors");
    game.map.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === "#") walls.append(svgNode("rect", { x: x * 24 + 1, y: y * 24 + 1, width: 22, height: 22, rx: 5 }));
    }));
    const makeUse = (name, attributes = {}) => {
      const node = svgNode("use", attributes);
      node.setAttribute("href", `#${name}`);
      node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${name}`);
      return node;
    };
    const playerNode = svgNode("g", { class: "maze-player" });
    // Escudo: un aura con forma de corazón. Rosa y punteada al reaparecer; dorada, brillante y con destellos con el corazón grande.
    const aura = svgNode("g", { class: "maze-aura" });
    const auraHeart = svgNode("g", { class: "maze-aura-heart" });
    auraHeart.append(makeUse("maze-heart-shape", { transform: "translate(0 1.5) scale(1.6)" }));
    const orbit = svgNode("g", { class: "maze-aura-orbit" });
    [0, 90, 180, 270].forEach((angle) => orbit.append(makeUse("maze-aura-spark", { transform: `rotate(${angle}) translate(0 -17) scale(${angle % 180 ? .8 : 1.1})` })));
    aura.append(svgNode("circle", { r: 19, class: "maze-aura-glow", fill: "url(#maze-aura-glow)" }), auraHeart, orbit);
    playerNode.append(aura, makeUse("maze-heart-shape", { fill: "#b62d51", stroke: "#772b41", "stroke-width": .7 }),
      svgNode("path", { d: "M-3-2v1m6-1v1", stroke: "#fff9f4", "stroke-width": 2, "stroke-linecap": "round" }),
      svgNode("path", { d: "M-2 3q2 2 4 0", fill: "none", stroke: "#fff9f4", "stroke-width": 1 }));
    const cloudNodes = state.enemies.map((_, i) => { const node = makeUse("maze-cloud-shape", { class: `maze-cloud maze-cloud-${i}` }); actors.append(node); return node; });
    actors.append(playerNode);
    // El mismo dibujo vectorial se usa en la leyenda; no depende de emojis del sistema.
    const cloudLegend = svgNode("svg", { viewBox: "-16 -14 32 26", "aria-hidden": "true" });
    cloudLegend.append(makeUse("maze-cloud-shape", { color: "#d8dcea" }));
    find(".maze-legend-cloud").replaceChildren(cloudLegend);

    function rebuildHearts() {
      nodes.clear(); hearts.replaceChildren();
      for (const [position, kind] of state.hearts) {
        const [x, y] = position.split(",").map(Number);
        const node = makeUse("maze-heart-shape", { transform: `translate(${x * 24 + 12} ${y * 24 + 12}) scale(${kind === "o" ? .66 : .26})`, class: kind === "o" ? "maze-power-heart" : "maze-dot" });
        hearts.append(node); nodes.set(position, node);
      }
    }
    function setText(selector, value) {
      const node = find(selector), text = String(value);
      if (node.textContent !== text) node.textContent = text;
    }
    function draw() {
      playerNode.setAttribute("transform", `translate(${state.player.x * 24 + 12} ${state.player.y * 24 + 12})`);
      playerNode.classList.toggle("has-shield", state.shield > 0 || state.power > 0);
      playerNode.classList.toggle("has-power", state.power > 0);
      playerNode.classList.toggle("power-ending", state.power > 0 && state.power < 2);
      cloudNodes.forEach((node, index) => {
        const cloud = state.enemies[index];
        node.setAttribute("transform", `translate(${cloud.x * 24 + 12} ${cloud.y * 24 + 12}) scale(.8)`);
        node.classList.toggle("is-afraid", state.power > 0);
        node.style.opacity = cloud.stun > 0 ? ".45" : "1";
      });
      setText(".maze-score", state.score);
      setText(".maze-record", Math.max(best, state.score));
      setText(".maze-timer", `${Math.ceil(state.remaining)} s`);
      const lifeNode = find(".maze-lives");
      if (lifeNode.dataset.lives !== String(state.lives)) {
        lifeNode.dataset.lives = String(state.lives); lifeNode.replaceChildren();
        for (let i = 0; i < 3; i += 1) { const heart = icon("heart-filled"); heart.classList.toggle("life-lost", i >= state.lives); lifeNode.append(heart); }
        lifeNode.setAttribute("aria-label", `${state.lives} de 3 vidas`);
      }
      setText(".maze-collected", `${state.collected} / ${game.totalHearts} corazones`);
      setText(".maze-power-label", state.power > 0 ? `Amor imparable · ${Math.ceil(state.power)} s` : state.shield > 0 && state.phase === "running" ? `Protección · ${Math.ceil(state.shield)} s` : "Un corazón a la vez");
      setText(".maze-combo", state.comboTime > 0 ? `Racha: ${state.combo} ${state.combo % 5 === 0 ? "· +20" : ""}` : "5 seguidos = +20");
      board.setAttribute("aria-label", `Laberinto: tu corazón está en fila ${Math.round(state.player.y) + 1}, columna ${Math.round(state.player.x) + 1}. ${state.score} puntos.`);
    }

    function playSound(type) {
      if (!soundEnabled || (window.Sonidos && !window.Sonidos.enabled)) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        if (!audioContext) {
          audioContext = (window.Sonidos && window.Sonidos.audioContext()) || new Audio();
          master = audioContext.createGain(); master.gain.value = .16; master.connect(audioContext.destination);
        }
        if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
        const melody = { heart: [740], power: [440, 660, 880], hit: [294, 220], end: [523, 659, 784], repel: [880, 1047], tap: [660] }[type] || [660];
        melody.forEach((frequency, i) => {
          const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), time = audioContext.currentTime + i * .09;
          oscillator.type = "sine"; oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.5, time + .012); gain.gain.exponentialRampToValueAtTime(.001, time + .16);
          oscillator.connect(gain).connect(master); oscillator.start(time); oscillator.stop(time + .18);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
      } catch { /* El sonido es opcional; la simulación sigue funcionando. */ }
    }
    function toggleSound() {
      soundEnabled = !soundEnabled;
      if (master) master.gain.value = soundEnabled ? .16 : 0;
      find(".maze-sound").setAttribute("aria-pressed", String(soundEnabled));
      find(".maze-sound").textContent = soundEnabled ? "Sonido: sí" : "Sonido: no";
      if (soundEnabled) playSound("tap");
    }
    function showPanel(name) {
      overlay.hidden = !name;
      for (const type of ["ready", "paused", "results"]) find(`.maze-${type}`).hidden = type !== name;
      dpad.forEach((button) => { button.disabled = state.phase !== "running"; button.classList.remove("is-pressed"); });
      find(".maze-pause").disabled = !["running", "paused"].includes(state.phase);
      find(".maze-reset").disabled = state.phase === "ready";
      find(".maze-pause").textContent = state.phase === "paused" ? "Seguir" : "Pausa";
      if (name === "paused" || name === "results") find(`.maze-${name} h3`).focus({ preventScroll: true });
    }
    function enterSession() {
      if (active) return;
      active = true; savedScroll = window.scrollY;
      document.body.classList.add("maze-playing");
      document.querySelector(".site-header").inert = true;
      document.querySelector(".site-footer").inert = true;
    }
    function leaveSession() {
      cancelAnimationFrame(frame); frame = 0;
      if (!active) return;
      active = false; document.body.classList.remove("maze-playing");
      document.querySelector(".site-header").inert = false;
      document.querySelector(".site-footer").inert = false;
      window.scrollTo({ top: savedScroll, behavior: "instant" });
    }
    function finish() {
      const previousBest = best;
      best = Math.max(best, window.LoveMaze.saveRecord(storage, state.score));
      find(".maze-results h3").textContent = state.reason === "hearts" ? "¡Llenaste el camino de amor!" : "¡Tu premio te espera!";
      find(".maze-result-reason").textContent = { hearts: "Recogiste todos los corazones.", lives: "Se acabaron las vidas. Lo bonito es volver a intentarlo.", time: "¡Tiempo! Cada corazón recogido cuenta." }[state.reason];
      find(".maze-result-score").textContent = `${state.score} puntos`;
      find(".maze-result-record").textContent = `${state.score > previousBest ? "¡Nuevo récord!" : "Tu récord:"} ${best} puntos`;
      find(".maze-result-message").textContent = options.resultMessage;
      announcer.textContent = `Partida completada. ${state.score} puntos. Tu premio está disponible.`;
      showPanel("results");
    }
    function loop(time) {
      frame = 0;
      if (state.phase !== "running" || !active) return;
      const dt = (time - lastTime) / 1000; lastTime = time;
      // Ante una interrupción larga, pausa en vez de cobrar tiempo o vidas sin verlo.
      if (dt > .75) { pause("La partida se pausó al interrumpirse la pantalla."); return; }
      game.tick(dt);
      for (const event of game.drainEvents()) {
        if (event.position) { nodes.get(event.position)?.remove(); nodes.delete(event.position); }
        playSound(event.type);
        if (event.type === "power") announcer.textContent = "Amor imparable. Puedes ahuyentar nubes durante siete segundos.";
        if (event.type === "hit") announcer.textContent = `Te quedan ${state.lives} vidas. Tienes tres segundos de protección.`;
      }
      draw();
      if (state.phase === "ended") { finish(); return; }
      frame = requestAnimationFrame(loop);
    }
    function start() {
      cancelAnimationFrame(frame); game.reset(); rebuildHearts(); game.start(); enterSession(); showPanel(null); draw();
      announcer.textContent = "Partida iniciada. Usa flechas, WASD o los botones de dirección.";
      board.focus({ preventScroll: true }); lastTime = performance.now(); frame = requestAnimationFrame(loop);
    }
    function pause(message = "Partida en pausa.") {
      if (!game.pause()) return;
      cancelAnimationFrame(frame); frame = 0; showPanel("paused"); announcer.textContent = message;
    }
    function resume() {
      if (!game.resume()) return;
      showPanel(null); board.focus({ preventScroll: true }); lastTime = performance.now(); frame = requestAnimationFrame(loop);
    }
    const keyDirections = { ArrowUp: "up", ArrowLeft: "left", ArrowDown: "down", ArrowRight: "right", w: "up", a: "left", s: "down", d: "right" };
    function onKey(event) {
      if (!active || container.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
      const direction = keyDirections[event.key] || keyDirections[event.key.toLowerCase()];
      if (direction && ["running", "paused"].includes(state.phase)) { event.preventDefault(); game.direction(direction); }
      if ((event.key.toLowerCase() === "p" || event.key === "Escape") && !event.repeat) {
        event.preventDefault(); if (state.phase === "running") pause(); else if (state.phase === "paused") resume();
      }
    }
    function onBlur() { if (active) pause("Partida pausada al salir de la pantalla."); }
    function onVisibility() { if (document.hidden) onBlur(); }
    function onPartChange(event) {
      if (event.detail.currentPart === 4) {
        game.reset(); rebuildHearts(); draw(); showPanel("ready");
        document.body.classList.add("maze-visible");
      } else { game.pause(); leaveSession(); document.body.classList.remove("maze-visible"); }
    }
    [".maze-start", ".maze-reset", ".maze-again", ".maze-paused-reset"].forEach((selector) => find(selector).addEventListener("click", start));
    find(".maze-pause").addEventListener("click", () => state.phase === "running" ? pause() : resume());
    find(".maze-resume").addEventListener("click", resume);
    find(".maze-sound").addEventListener("click", toggleSound);
    find(".maze-exit").addEventListener("click", async () => { game.pause(); leaveSession(); await goToPart3(); });
    find(".maze-claim").addEventListener("click", async () => {
      if (state.phase !== "ended" || claiming) return;
      claiming = true; find(".maze-claim").disabled = true;
      leaveSession();
      try {
        if (!await completeGame({ score: state.score, maxScore: game.maxScore })) { enterSession(); announcer.textContent = "Intenta reclamar tu premio otra vez."; }
      } finally { claiming = false; find(".maze-claim").disabled = false; }
    });
    document.addEventListener("keydown", onKey, { passive: false });
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("adventure:partchange", onPartChange);
    window.addEventListener("blur", onBlur);
    const onMotion = () => container.classList.toggle("maze-reduced", reducedMotion.matches);
    reducedMotion.addEventListener("change", onMotion); onMotion();
    rebuildHearts(); draw(); showPanel("ready");
    return () => {
      leaveSession(); document.body.classList.remove("maze-visible");
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("adventure:partchange", onPartChange);
      window.removeEventListener("blur", onBlur);
      reducedMotion.removeEventListener("change", onMotion);
      if (audioContext) audioContext.close().catch(() => {});
    };
  });
})();
