/* Parte 5 · "Arma el mensaje": plataformas al estilo clásico. Al llegar al castillo se abre el regalo. */
(() => {
  "use strict";
  const prizeRenderer = window.PrizePartRenderer;
  const Engine = window.PlatformEngine;
  const { TILE, COLS, ROWS } = Engine;
  const VIEW_W = 256, VIEW_H = ROWS * TILE;
  const SERIF = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
  const HEART = new Path2D("M3 3h6v3h6V3h6v3h3v9h-3v3h-3v3h-3v3H9v-3H6v-3H3v-3H0V6h3z");
  const CLOUD = new Path2D("M-9 5C-15 3-13-5-8-5-8-13 3-13 5-7 12-9 16 1 10 5Z");
  const DEFAULT_TEXT = {
    phrase: "Mi lugar favorito siempre será contigo",
    title: "Arma el mensaje",
    introduction: "Guía a mi corazón por el camino: junta todas las palabras y llévalas al castillo.",
    startTitle: "¡Arma el mensaje!",
    startMessage: "Salta para golpear los bloques corazón y atrapar las palabras flotantes. Salta sobre las nubecitas para apartarlas.",
    startButton: "¡A jugar!",
    blocked: "Aún faltan {n} palabras. ¡Regresa por ellas!",
    blockedOne: "Aún falta 1 palabra. ¡Regresa por ella!",
    skipTitle: "¿Seguimos?",
    skipHint: "También puedes avanzar a la siguiente parte, pero sin abrir el premio del castillo.",
    backForWords: "Regresar por las palabras",
    skipButton: "Avanzar sin premio →",
    winTitle: "¡Llegaste al castillo!",
    winButton: "Escuchar mi premio →",
    counter: "Palabras: {count} de {total}",
  };

  // Juego de plataformas. Al entrar al castillo llama onWin; devuelve una función de limpieza.
  function mountPlatform(container, context, onWin) {
    const { config, icon, renderText } = context;
    const text = { ...DEFAULT_TEXT, ...(config.message || {}) };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const game = Engine.createGame(text.phrase);
    const { state } = game;
    container.messageGame = game; // Útil para revisar el nivel desde la consola.
    container.classList.add("message-part");
    container.innerHTML = `
      <header class="message-intro">
        <p class="memory-step"></p>
        <h2 id="part-five-title" tabindex="-1"></h2>
        <p class="message-instruction"></p>
      </header>
      <div class="message-phrase">
        <ol class="message-slots" aria-label="La frase que estás armando"></ol>
        <p class="message-counter"></p>
      </div>
      <div class="message-session">
        <div class="message-stage">
          <canvas class="message-canvas" tabindex="0" role="img"></canvas>
          <p class="message-toast" hidden></p>
          <div class="message-overlay">
            <section class="message-panel message-start">
              <span class="message-panel-icon"></span>
              <h3></h3>
              <p></p>
              <button type="button" class="primary-button message-play"></button>
            </section>
            <section class="message-panel message-skip" hidden>
              <span class="message-panel-icon"></span>
              <h3 tabindex="-1"></h3>
              <p></p>
              <button type="button" class="primary-button message-back-words"></button>
              <button type="button" class="text-button icon-button message-skip-button"></button>
            </section>
            <section class="message-panel message-win" hidden>
              <span class="message-panel-icon"></span>
              <h3 tabindex="-1"></h3>
              <blockquote class="message-final"></blockquote>
              <button type="button" class="primary-button message-open"></button>
            </section>
          </div>
        </div>
        <div class="message-controls" role="group" aria-label="Controles del corazón">
          <div class="message-pad">
            <button type="button" data-key="left" aria-label="Izquierda"></button>
            <button type="button" data-key="right" aria-label="Derecha"></button>
          </div>
          <button type="button" class="message-jump" data-key="jump" aria-label="Saltar"><span>Saltar</span></button>
        </div>
      </div>
      <p class="message-guide"><strong>Controles:</strong> flechas o A y D para caminar; espacio, W o flecha arriba para saltar. En celular, usa los botones.</p>
      <p class="sr-only message-announcer" role="status" aria-live="polite" aria-atomic="true"></p>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".memory-step").textContent = `Parte 5 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    find(".message-instruction").textContent = text.introduction;
    find(".message-start h3").textContent = text.startTitle;
    find(".message-start p").textContent = text.startMessage;
    find(".message-play").textContent = text.startButton;
    find(".message-win h3").textContent = text.winTitle;
    renderText(find(".message-open"), text.winButton);
    container.querySelectorAll(".message-panel-icon").forEach((node) => node.append(icon("pixel-heart")));
    const announcer = find(".message-announcer"), toast = find(".message-toast");
    const canvas = find(".message-canvas"), ctx = canvas.getContext("2d");
    canvas.setAttribute("aria-label", `Juego de plataformas. Junta ${state.total} palabras y llega al castillo.`);

    // Casillas de la frase: se llenan en su lugar sin importar el orden en que se encuentren.
    const slots = state.words.map((word) => {
      const slot = document.createElement("li");
      slot.className = "message-slot";
      slot.style.setProperty("--chars", String(Math.max(3, word.length)));
      slot.setAttribute("aria-label", "Palabra por encontrar");
      find(".message-slots").append(slot);
      return slot;
    });
    function updateCounter() {
      find(".message-counter").textContent = text.counter.replace("{count}", state.collected).replace("{total}", state.total);
    }
    updateCounter();

    // Controles: teclado y botones táctiles comparten el mismo estado.
    const input = { left: false, right: false, jump: false };
    const pressed = new Map();
    const arrow = (rotation) => { const svg = icon("arrow-right"); svg.style.transform = `rotate(${rotation}deg)`; return svg; };
    find('[data-key="left"]').append(arrow(180));
    find('[data-key="right"]').append(arrow(0));
    find(".message-jump").prepend(arrow(-90));
    container.querySelectorAll(".message-controls button").forEach((button) => {
      button.dataset.sound = "none";
      const key = button.dataset.key;
      const release = () => { button.classList.remove("is-pressed"); input[key] = false; };
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault(); button.setPointerCapture?.(event.pointerId); button.classList.add("is-pressed"); input[key] = true;
      });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach((name) => button.addEventListener(name, release));
      button.addEventListener("contextmenu", (event) => event.preventDefault());
    });
    const KEYS = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", ArrowUp: "jump", KeyW: "jump", Space: "jump" };
    const active = () => started && state.phase === "playing" && window.Aventura.currentPart === 5 && !window.Aventura.isTransitioning;
    function onKey(event) {
      const key = KEYS[event.code];
      if (!key || !active()) return;
      if (event.target.closest && event.target.closest("button") && !event.target.closest(".message-controls")) return;
      event.preventDefault();
      input[key] = event.type === "keydown";
      pressed.set(event.code, event.type === "keydown");
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    const clearInput = () => { input.left = input.right = input.jump = false; };
    window.addEventListener("blur", clearInput);

    let started = false, paused = false;
    // Si faltan palabras: regresar por ellas o avanzar a la siguiente parte sin abrir el premio.
    const skipPanel = find(".message-skip");
    skipPanel.querySelector("h3").textContent = text.skipTitle;
    find(".message-back-words").append(icon("arrow-left"), document.createTextNode(text.backForWords));
    renderText(find(".message-skip-button"), text.skipButton);
    function showSkip(message) {
      paused = true; clearInput();
      skipPanel.querySelector("p").textContent = `${message} ${text.skipHint}`;
      find(".message-overlay").hidden = false;
      skipPanel.hidden = false;
      announcer.textContent = message;
      skipPanel.querySelector("h3").focus({ preventScroll: true });
    }
    find(".message-back-words").addEventListener("click", () => {
      skipPanel.hidden = true;
      find(".message-overlay").hidden = true;
      state.player.x = Math.max(0, state.player.x - 28);
      state.player.vx = 0;
      paused = false;
      canvas.focus({ preventScroll: true });
    });
    find(".message-skip-button").addEventListener("click", () => context.goToPart6());
    find(".message-play").addEventListener("click", () => {
      started = true;
      find(".message-start").hidden = true;
      find(".message-overlay").hidden = true;
      canvas.focus({ preventScroll: true });
      announcer.textContent = `Comienza. Faltan ${state.total} palabras.`;
    });
    find(".message-open").addEventListener("click", () => { stop(); onWin(); });

    // Lienzo nítido en cualquier pantalla.
    let scale = 1, dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || VIEW_W;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(width * dpr * VIEW_H / VIEW_W);
      scale = canvas.width / VIEW_W;
      draw();
    }
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(canvas); else window.addEventListener("resize", resize);

    const sound = (name) => window.Sonidos?.play(name);
    const particles = [];
    let toastTimer = 0, winTimer = 0;
    function showToast(message) {
      toast.textContent = message; toast.hidden = false;
      clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, 2200);
    }
    function burst(x, y, colors, count = 6) {
      if (reducedMotion.matches) return;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2;
        particles.push({ x, y, vx: Math.cos(angle) * 55, vy: Math.sin(angle) * 55 - 30, life: .7, max: .7, color: colors[i % colors.length], size: 5 });
      }
    }

    function handle(events) {
      for (const event of events) {
        if (event.type === "jump") sound("tap");
        else if (event.type === "word") {
          const slot = slots[event.index];
          slot.textContent = event.word;
          slot.classList.add("is-filled");
          slot.removeAttribute("aria-label");
          updateCounter();
          sound(event.count === event.total ? "reveal" : "match");
          const spot = state.spots.find((s) => s.index === event.index);
          burst(spot.x * TILE + 8, spot.y * TILE + (spot.kind === "block" ? -4 : 8), ["#b62d51", "#e9a53a", "#d88b9f"], 8);
          announcer.textContent = `Encontraste "${event.word}". ${event.count} de ${event.total}.${event.count === event.total ? " ¡Ya tienes la frase! Ve al castillo." : ""}`;
          if (event.count === event.total) showToast("¡Frase completa! Corre al castillo →");
        } else if (event.type === "stomp") { sound("flip"); burst(event.x, event.y + 4, ["#d6daec", "#fffdfb"], 6); }
        else if (event.type === "hurt" || event.type === "fall") { sound("miss"); if (event.type === "fall") announcer.textContent = "Volviste al último punto seguro."; }
        else if (event.type === "blocked") {
          const message = event.missing === 1 ? text.blockedOne : text.blocked.replace("{n}", event.missing);
          sound("back");
          showSkip(message);
        } else if (event.type === "flag") sound("primary");
        else if (event.type === "win") {
          sound("win");
          announcer.textContent = `${text.winTitle} ${state.words.join(" ")}`;
          winTimer = setTimeout(showWin, reducedMotion.matches ? 300 : 2300);
        }
      }
    }
    function showWin() {
      const final = find(".message-final");
      final.textContent = `“${state.words.join(" ")}”`;
      find(".message-overlay").hidden = false;
      find(".message-win").hidden = false;
      find(".message-win h3").focus({ preventScroll: true });
    }

    // ---------- Dibujo ----------
    function px(value) { return Math.round(value * scale) / scale; }
    function rect(color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

    function drawBackground(camera) {
      const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      sky.addColorStop(0, "#fbe7ed"); sky.addColorStop(.7, "#faf2f0"); sky.addColorStop(1, "#faf7f2");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      // Colinas lejanas y cercanas con desplazamiento más lento que el camino.
      [[.15, "#f6e4e9", 70, 58], [.35, "#f1d5dd", 46, 42]].forEach(([factor, color, radius, lift]) => {
        ctx.fillStyle = color;
        const spacing = radius * 3.1, offset = -((camera * factor) % spacing);
        for (let x = offset - spacing; x < VIEW_W + spacing; x += spacing) {
          ctx.beginPath(); ctx.ellipse(x, 10 * TILE + 4, radius, lift, 0, Math.PI, 0); ctx.fill();
        }
      });
      // Nubes decorativas.
      ctx.fillStyle = "#fffdfb"; ctx.strokeStyle = "#efdde2"; ctx.lineWidth = 1;
      const spacing = 150, offset = -((camera * .5) % spacing);
      for (let i = -1; i < 4; i += 1) {
        const x = offset + i * spacing + 30, y = 26 + ((i + Math.floor(camera * .5 / spacing)) % 2 ? 18 : 0);
        ctx.beginPath(); ctx.roundRect(x, y, 34, 10, 5); ctx.roundRect(x + 8, y - 6, 18, 12, 6); ctx.fill(); ctx.stroke();
      }
    }

    function drawTile(tile, x, y, tx, ty) {
      if (tile === "#") {
        rect("#efc9d4", x, y, 16, 16);
        rect("#e3b3c1", x, y + 7, 16, 1); rect("#e3b3c1", x + ((tx + ty) % 2 ? 4 : 11), y, 1, 7); rect("#e3b3c1", x + ((tx + ty) % 2 ? 11 : 4), y + 8, 1, 8);
        if (game.tileAt(tx, ty - 1) !== "#") { rect("#d98fa5", x, y, 16, 4); rect("#f2b7c7", x, y, 16, 1); rect("#c8718d", x + (tx % 3) * 5 + 2, y + 4, 2, 1); }
      } else if (tile === "S") {
        rect("#bd7d91", x, y, 16, 16); rect("#ecd3d9", x + 1, y + 1, 14, 14);
        rect("#f8e9ed", x + 1, y + 1, 14, 2); rect("#f8e9ed", x + 1, y + 1, 2, 14); rect("#d5a7b5", x + 1, y + 13, 14, 2); rect("#d5a7b5", x + 13, y + 1, 2, 14);
      } else if (tile === "B") {
        rect("#b8637f", x, y, 16, 16); rect("#dc94aa", x, y, 16, 1);
        [[0, 1, 7, 6], [8, 1, 8, 6], [0, 8, 3, 7], [4, 8, 8, 7], [13, 8, 3, 7]].forEach(([a, b, w, h]) => rect("#d98fa5", x + a, y + b, w, h));
      } else if (tile === "?" || tile === "U") {
        const bump = state.bumps.find((b) => b.tx === tx && b.ty === ty);
        const lift = bump ? -Math.sin((state.time - bump.at) / .25 * Math.PI) * 4 : 0;
        y += lift;
        if (tile === "?") {
          const glow = reducedMotion.matches ? 0 : (Math.sin(state.time * 4) + 1) / 2;
          rect("#a66a15", x, y, 16, 16); rect(glow > .5 ? "#f2c464" : "#eab54f", x + 1, y + 1, 14, 14); rect("#f8dc95", x + 1, y + 1, 14, 1);
          ctx.save(); ctx.translate(x + 3.5, y + 3.5); ctx.scale(.38, .38); ctx.fillStyle = "#b62d51"; ctx.fill(HEART); ctx.restore();
          [[1, 1], [14, 1], [1, 14], [14, 14]].forEach(([a, b]) => rect("#a66a15", x + a, y + b, 1, 1));
        } else {
          rect("#a88f84", x, y, 16, 16); rect("#dcc7bd", x + 1, y + 1, 14, 14);
          [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([a, b]) => rect("#a88f84", x + a, y + b, 1, 1));
        }
      }
    }

    function wordTag(word, cx, cy, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `italic 600 9px ${SERIF}`;
      const w = Math.ceil(ctx.measureText(word).width) + 10;
      ctx.fillStyle = "#772b41"; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - 7 + 1.5, w, 14, 4); ctx.fill();
      ctx.fillStyle = "#fffdfb"; ctx.strokeStyle = "#b62d51"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - 7, w, 14, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#94213f"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(word, cx, cy + .5);
      ctx.restore();
    }

    function drawCastle(camera) {
      const door = state.doorX + 6, base = 10 * TILE;
      const x0 = door - 48, stone = "#efc9d4", line = "#bd7d91";
      const block = (x, y, w, h) => { rect(line, x, y, w, h); rect(stone, x + 1, y + 1, w - 2, h - 2); };
      block(x0, base - 64, 96, 64);
      for (let i = 0; i < 6; i += 1) block(x0 + i * 16 + 2, base - 72, 10, 9);
      block(x0 + 26, base - 100, 44, 37);
      for (let i = 0; i < 3; i += 1) block(x0 + 26 + i * 16 + 2, base - 108, 10, 9);
      for (let row = 0; row < 7; row += 1) for (let col = 0; col < 6; col += 1) rect("#e0aebd", x0 + 4 + col * 16 + (row % 2) * 8, base - 58 + row * 9, 6, 1);
      // Ventana de corazón y puerta de arco.
      ctx.save(); ctx.translate(door - 7, base - 92); ctx.scale(.6, .6); ctx.fillStyle = "#b62d51"; ctx.fill(HEART); ctx.restore();
      ctx.fillStyle = "#6b3142"; ctx.beginPath(); ctx.moveTo(door - 10, base); ctx.lineTo(door - 10, base - 20); ctx.arc(door, base - 20, 10, Math.PI, 0); ctx.lineTo(door + 10, base); ctx.fill();
      rect("#8a4257", door - 1, base - 26, 2, 26);
      // Bandera del castillo: sube al entrar.
      const raised = state.phase === "done" ? Math.min(1, (state.time - state.doneAt) / 1) : 0;
      rect("#94213f", door - 1, base - 132, 2, 24);
      const fy = base - 116 - raised * 14;
      ctx.fillStyle = "#b62d51"; ctx.beginPath(); ctx.moveTo(door + 1, fy); ctx.lineTo(door + 15, fy + 4); ctx.lineTo(door + 1, fy + 8); ctx.fill();
    }

    function drawPole() {
      const x = state.poleX + 6;
      rect("#a8657c", x, 1.5 * TILE, 3, 8.5 * TILE);
      rect("#d99aae", x, 1.5 * TILE, 1, 8.5 * TILE);
      ctx.fillStyle = "#b62d51"; ctx.beginPath(); ctx.arc(x + 1.5, 1.5 * TILE - 3, 4, 0, Math.PI * 2); ctx.fill();
      const fy = state.flagY;
      ctx.fillStyle = "#b62d51"; ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x - 22, fy + 8); ctx.lineTo(x, fy + 16); ctx.fill();
      ctx.save(); ctx.translate(x - 12, fy + 5); ctx.scale(.25, .25); ctx.fillStyle = "#fffdfb"; ctx.fill(HEART); ctx.restore();
    }

    function drawPlayer() {
      const p = state.player;
      if (state.phase === "done") return;
      if (p.inv > 0 && Math.floor(p.inv * 12) % 2 && !reducedMotion.matches) return;
      const x = px(p.x), y = px(p.y);
      // Pies que se alternan al caminar.
      const step = Math.floor(p.walk) % 2;
      const inAir = !p.onGround && state.phase === "playing";
      rect("#772b41", x + 1 + (inAir ? 1 : step ? 0 : 1), y + 12, 4, 2);
      rect("#772b41", x + 7 - (inAir ? 1 : step ? 1 : 0), y + 12, 4, 2);
      ctx.save(); ctx.translate(x - 1, y - 1.5); ctx.scale(14 / 24, 14 / 24);
      ctx.strokeStyle = "#772b41"; ctx.lineWidth = 2.6; ctx.lineJoin = "miter"; ctx.stroke(HEART);
      ctx.fillStyle = "#b62d51"; ctx.fill(HEART); ctx.restore();
      rect("#e4577c", x + 2, y + 1, 2, 2);
      const look = p.facing > 0 ? 1 : -1;
      rect("#fff9f4", x + 3 + look, y + 4, 2, 3); rect("#fff9f4", x + 7 + look, y + 4, 2, 3);
      rect("#fff9f4", x + 4 + look, y + 8, 3, 1);
    }

    function drawEnemies() {
      for (const e of state.enemies) {
        if (!e.alive && e.squashed > .45) continue;
        const cx = px(e.x + e.w / 2), cy = px(e.y + e.h / 2 + 1);
        ctx.save(); ctx.translate(cx, cy);
        if (!e.alive) { ctx.globalAlpha = 1 - e.squashed / .45; ctx.scale(.75, .3); ctx.translate(0, 12); } else ctx.scale(.72, .72);
        ctx.fillStyle = "#d6daec"; ctx.strokeStyle = "#6d647d"; ctx.lineWidth = 1.4; ctx.fill(CLOUD); ctx.stroke(CLOUD);
        if (e.alive) {
          const blink = Math.floor(state.time * 2 + e.x) % 7 === 0;
          ctx.strokeStyle = "#40324f"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.beginPath();
          const look = e.vx > 0 ? 1 : -1;
          ctx.moveTo(-4 + look, blink ? -2 : -3); ctx.lineTo(-4 + look, -1); ctx.moveTo(4 + look, blink ? -2 : -3); ctx.lineTo(4 + look, -1); ctx.stroke();
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, 3); ctx.quadraticCurveTo(0, 1.5, 2, 3); ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawWords() {
      for (const spot of state.spots) {
        const cx = spot.x * TILE + 8;
        if (spot.kind === "float" && !spot.collected) {
          const bob = reducedMotion.matches ? 0 : Math.sin(state.time * 3 + spot.x) * 2;
          wordTag(spot.word, cx, spot.y * TILE + 8 + bob);
          if (!reducedMotion.matches && Math.sin(state.time * 5 + spot.x) > .6) rect("#e9a53a", cx + 12, spot.y * TILE - 2 + bob, 2, 2);
        } else if (spot.collected) {
          const age = state.time - spot.collectedAt;
          if (age < 1) {
            const startY = spot.kind === "block" ? spot.y * TILE - 6 : spot.y * TILE + 8;
            wordTag(spot.word, cx, startY - age * 26, 1 - Math.max(0, age - .6) / .4);
          }
        }
      }
    }

    function drawParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const part = particles[i];
        part.life -= dt; if (part.life <= 0) { particles.splice(i, 1); continue; }
        part.x += part.vx * dt; part.y += part.vy * dt; part.vy += 120 * dt;
        ctx.save(); ctx.globalAlpha = part.life / part.max; ctx.translate(part.x - part.size / 2, part.y - part.size / 2);
        ctx.scale(part.size / 24, part.size / 24); ctx.fillStyle = part.color; ctx.fill(HEART); ctx.restore();
      }
    }

    // Fuegos artificiales de corazones sobre el castillo.
    function drawFireworks() {
      if (state.phase !== "done" || reducedMotion.matches) return;
      const age = state.time - state.doneAt;
      const colors = ["#b62d51", "#e9a53a", "#d88b9f", "#94213f"];
      for (let burstIndex = 0; burstIndex < 6; burstIndex += 1) {
        const t = age - burstIndex * .35;
        if (t < 0 || t > 1.1) continue;
        const bx = state.doorX + 6 + [-40, 36, -10, 50, -56, 14][burstIndex], by = 10 * TILE - 130 + [0, -18, -34, 8, -12, -40][burstIndex];
        for (let i = 0; i < 10; i += 1) {
          const angle = (i / 10) * Math.PI * 2, r = t * 32;
          ctx.save(); ctx.globalAlpha = Math.max(0, 1 - t); ctx.translate(bx + Math.cos(angle) * r - 2.5, by + Math.sin(angle) * r + t * t * 14 - 2.5);
          ctx.scale(5 / 24, 5 / 24); ctx.fillStyle = colors[(i + burstIndex) % 4]; ctx.fill(HEART); ctx.restore();
        }
      }
    }

    let camera = 0, lastDraw = 0;
    function draw(dt = 0) {
      if (!canvas.width) return;
      const target = state.player.x - VIEW_W * .4;
      const goal = state.phase === "done" || state.phase === "walk" ? state.doorX - VIEW_W * .55 : target;
      camera = Math.min(Math.max(0, goal), COLS * TILE - VIEW_W);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      drawBackground(camera);
      ctx.save();
      ctx.translate(-px(camera), 0);
      const from = Math.max(0, Math.floor(camera / TILE) - 1), to = Math.min(COLS - 1, Math.ceil((camera + VIEW_W) / TILE) + 1);
      if (camera + VIEW_W > state.poleX - 120) drawCastle(camera);
      for (let ty = 0; ty < ROWS; ty += 1) for (let tx = from; tx <= to; tx += 1) {
        const tile = state.grid[ty][tx];
        if (tile !== ".") drawTile(tile, tx * TILE, ty * TILE, tx, ty);
      }
      if (camera + VIEW_W > state.poleX - 30) drawPole();
      drawWords();
      drawEnemies();
      drawPlayer();
      drawParticles(dt);
      drawFireworks();
      ctx.restore();
    }

    // ---------- Ciclo del juego ----------
    let frame = 0, last = 0, accumulator = 0, stopped = false;
    function loop(now) {
      if (stopped) return;
      frame = requestAnimationFrame(loop);
      const visible = window.Aventura.currentPart === 5 && !document.hidden;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      last = now;
      if (!visible) { clearInput(); return; }
      // La parte se monta oculta: ajusta la resolución en cuanto el lienzo tiene tamaño real.
      if (Math.abs(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2) - canvas.width) > 2) resize();
      if (started && !paused) {
        accumulator += dt;
        while (accumulator >= 1 / 120) { handle(game.step(1 / 120, input)); accumulator -= 1 / 120; }
      }
      draw(dt);
    }
    resize();
    frame = requestAnimationFrame(loop);

    function stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(toastTimer); clearTimeout(winTimer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", clearInput);
      if (resizeObserver) resizeObserver.disconnect(); else window.removeEventListener("resize", resize);
    }

    return stop;
  }

  // Premio de "Arma el mensaje": una canción dedicada con enlaces para agregarla a una playlist.
  const DEFAULT_SONG = {
    title: "Tu canción",
    introduction: "Llegaste al castillo y armaste nuestro mensaje. Tu premio es una canción que te dedico.",
    kicker: "Dedicada para ti",
    name: "The Fate of Ophelia",
    artist: "Taylor Swift",
    dedication: "Esta canción es para ti. Cada vez que la escuches, acuérdate de este castillo, de nuestro mensaje y de que siempre voy a elegirte.",
    note: "Se abre en tu app de música: ahí toca «Agregar a playlist».",
    links: {},
    // Video oficial (lyric video) en YouTube y el segundo donde empieza el clímax.
    youtubeId: "rbmdfEQODOw",
    climaxStart: 167,
    playButton: "Escuchar el clímax otra vez",
    nextButton: "Seguir jugando →",
    replayButton: "Jugar otra vez el nivel",
  };
  function renderSong(container, context, replay) {
    const { config, icon, renderText, goToPart6, celebrate } = context;
    const song = { ...DEFAULT_SONG, ...(config.song || {}) };
    const query = encodeURIComponent(`${song.name} ${song.artist}`);
    const links = {
      spotify: `https://open.spotify.com/search/${query}`,
      appleMusic: `https://music.apple.com/search?term=${query}`,
      youtubeMusic: `https://music.youtube.com/search?q=${query}`,
      ...Object.fromEntries(Object.entries(song.links || {}).filter(([, url]) => typeof url === "string" && url.startsWith("https://"))),
    };
    const recipient = ((config.prize && config.prize.recipientName) || "").trim() || config.names.him;
    container.classList.add("song-part");
    container.innerHTML = `
      <header class="message-intro">
        <p class="memory-step"></p>
        <h2 id="part-five-title" tabindex="-1"></h2>
        <p class="message-instruction"></p>
      </header>
      <article class="song-card">
        <div class="song-player" aria-hidden="true">
          <div class="song-disc"><span class="song-disc-label"></span></div>
          <div class="song-bars"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="song-info">
          <p class="song-kicker"></p>
          <h3 class="song-name"></h3>
          <p class="song-artist"></p>
          <p class="song-for"></p>
          <p class="song-dedication"></p>
          <p class="song-signature"></p>
          <div class="song-links">
            <a class="song-link song-spotify" target="_blank" rel="noopener noreferrer"></a>
            <a class="song-link" data-service="appleMusic" target="_blank" rel="noopener noreferrer"></a>
            <a class="song-link" data-service="youtubeMusic" target="_blank" rel="noopener noreferrer"></a>
          </div>
          <p class="song-note"></p>
        </div>
        <div class="song-video">
          <div class="song-video-frame"></div>
          <button type="button" class="text-button icon-button song-play" hidden></button>
          <a class="song-youtube" target="_blank" rel="noopener noreferrer"></a>
        </div>
        <div class="heart-particles song-celebration" aria-hidden="true"></div>
      </article>
      <div class="song-actions">
        <button type="button" class="primary-button song-next"></button>
        <button type="button" class="text-button icon-button song-replay"></button>
      </div>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".memory-step").textContent = `Parte 5 de ${config.totalParts}`;
    find("h2").textContent = song.title;
    find(".message-instruction").textContent = song.introduction;
    find(".song-kicker").append(icon("heart-filled"), document.createTextNode(song.kicker));
    find(".song-name").textContent = song.name;
    find(".song-artist").textContent = song.artist;
    find(".song-for").textContent = `Para ${recipient}`;
    find(".song-dedication").textContent = song.dedication;
    find(".song-signature").textContent = `Con amor, ${config.names.her}`;
    find(".song-disc-label").append(icon("pixel-heart"));
    const spotify = find(".song-spotify");
    spotify.href = links.spotify;
    spotify.append(icon("heart-filled"), document.createTextNode("Agregar a mi playlist en Spotify"));
    const apple = find('[data-service="appleMusic"]');
    apple.href = links.appleMusic; apple.textContent = "Apple Music";
    const youtube = find('[data-service="youtubeMusic"]');
    youtube.href = links.youtubeMusic; youtube.textContent = "YouTube Music";
    find(".song-note").textContent = song.note;
    renderText(find(".song-next"), song.nextButton);
    find(".song-next").addEventListener("click", goToPart6);
    const again = find(".song-replay");
    again.append(icon("replay"), document.createTextNode(song.replayButton));
    again.addEventListener("click", replay);
    celebrate(find(".song-celebration"));

    // Suena el clímax: el clic que abrió el premio permite reproducir con sonido.
    const frame = find(".song-video-frame"), playAgain = find(".song-play");
    playAgain.append(icon("replay"), document.createTextNode(song.playButton));
    const videoId = /^[A-Za-z0-9_-]{6,20}$/.test(song.youtubeId || "") ? song.youtubeId : "";
    const start = Math.max(0, Math.floor(Number(song.climaxStart) || 0));
    function play() {
      if (!videoId) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?start=${start}&autoplay=1&playsinline=1&rel=0&modestbranding=1`;
      iframe.title = `${song.name}, ${song.artist}`;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.loading = "eager";
      // YouTube exige saber desde qué página se reproduce (error 153 sin referente).
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      frame.replaceChildren(iframe);
      playAgain.hidden = true;
    }
    function silence() {
      if (!frame.firstChild) return;
      frame.replaceChildren();
      playAgain.hidden = false;
    }
    playAgain.addEventListener("click", play);
    // Respaldo: si el reproductor no carga (por ejemplo, al abrir el archivo sin servidor), este enlace abre el clímax en YouTube.
    const fallback = find(".song-youtube");
    fallback.href = `https://www.youtube.com/watch?v=${videoId}&t=${start}s`;
    fallback.textContent = "¿No suena? Ábrela en YouTube desde el clímax";
    if (videoId) play(); else find(".song-video").hidden = true;
    // Al salir de la parte 5 la música se detiene.
    const onPartChange = (event) => { if (event.detail.currentPart !== 5) silence(); };
    document.addEventListener("adventure:partchange", onPartChange);
    return () => { document.removeEventListener("adventure:partchange", onPartChange); frame.replaceChildren(); };
  }

  // Orden de la parte 5: regalo del laberinto (cupón) → "Arma el mensaje" → canción dedicada.
  window.Aventura.registerPart5((container, context) => {
    let cleanup = null;
    function show(name, focus) {
      if (typeof cleanup === "function") cleanup();
      container.classList.remove("message-part", "song-part");
      container.replaceChildren();
      cleanup = stages[name]() || null;
      if (focus) {
        const heading = container.querySelector("h2");
        if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
        window.scrollTo({ top: Math.max(0, container.offsetTop - 25), behavior: "instant" });
      }
    }
    const stages = {
      gift() {
        const prizeCleanup = prizeRenderer(container, context);
        // El botón del regalo abierto lleva al siguiente juego de esta misma parte.
        // Botón para mandar el cupón por WhatsApp junto a las acciones del regalo.
        const coupon = (context.config.prize.coupon && context.config.prize.coupon.text) || "";
        const shareCoupon = window.WhatsAppPrize?.button(`¡Gané el laberinto! 🎁 Mi premio: «${coupon}». ¿Cuándo lo canjeamos? 😋`);
        const actions = container.querySelector(".prize-actions");
        if (shareCoupon && actions) actions.prepend(shareCoupon);
        const toGame = (event) => {
          if (!event.target.closest(".prize-letter")) return;
          event.preventDefault(); event.stopImmediatePropagation();
          show("platform", true);
        };
        container.addEventListener("click", toGame, true);
        return () => { container.removeEventListener("click", toGame, true); if (typeof prizeCleanup === "function") prizeCleanup(); };
      },
      platform: () => mountPlatform(container, context, () => show("song", true)),
      song: () => renderSong(container, context, () => show("platform", true)),
    };
    show("gift");
    return () => { if (typeof cleanup === "function") cleanup(); };
  });
})();
