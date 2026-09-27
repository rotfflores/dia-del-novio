/* Parte 7 · Celebración final: «Misión cumplida. Feliz Día del Novio», con confeti y un mensaje. */
(() => {
  "use strict";
  const HEART = new Path2D("M3 3h6v3h6V3h6v3h3v9h-3v3h-3v3h-3v3H9v-3H6v-3H3v-3H0V6h3z");
  const COLORS = ["#b62d51", "#d88b9f", "#f0c1cd", "#94213f", "#e9a53a", "#f7e0b0", "#fffdfb"];
  const DEFAULT_TEXT = {
    kicker: "Nivel final",
    title: "Misión cumplida",
    subtitle: "Feliz Día del Novio",
    message: "Llegaste hasta el final de nuestra aventura: revelaste nuestra fecha, encontraste nuestros recuerdos, cruzaste el laberinto, armaste nuestro mensaje y volaste tan alto como pudiste. Así como en cada juego, en la vida también quiero seguir superando niveles contigo. Gracias por ser mi persona favorita.",
    signature: "",
    missions: ["Nuestra fecha", "El memorama", "El laberinto", "Arma el mensaje", "Vuela, corazón"],
    jumpTitle: "¿A dónde quieres volver?",
    jumpHint: "Ya completaste todo: puedes saltar a cualquier parte cuando quieras.",
    jumpParts: [[1, "Bienvenida", "heart-outline"], [2, "Nuestra fecha", "sparkle"], [3, "Memorama y carta", "pixel-heart"], [4, "Laberinto", "heart-filled"], [5, "Arma el mensaje y canción", "sparkle"], [6, "Vuela, corazón", "heart-outline"]],
    againButton: "Celebrar otra vez",
    shareTitle: "Guarda nuestra aventura",
    shareHint: "Crea una imagen vertical con el resumen de todo, lista para guardar o subir de estado.",
    makeImageButton: "Crear imagen para compartir",
    remakeImageButton: "Crear la imagen otra vez",
    makingImage: "Creando la imagen…",
    imageReady: "¡Lista! Guárdala o compártela.",
    imageError: "No se pudo crear la imagen. Abre la página desde un servidor o hosting e inténtalo de nuevo.",
    downloadButton: "Guardar imagen",
    shareButton: "Compartir",
    playButton: "Volver a volar",
    startButton: "Ver la aventura desde el inicio",
  };

  window.Aventura.registerPart7((container, context) => {
    const { config, icon, renderText, goToPart6, goToWelcome, goToPart } = context;
    const text = { ...DEFAULT_TEXT, ...(config.final || {}) };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let flappyBest = 0;
    try { flappyBest = Number(window.localStorage.getItem("aventura-flappy-record")) || 0; } catch { flappyBest = 0; }

    container.innerHTML = `
      <div class="final-stage">
        <div class="final-seal" aria-hidden="true"><span></span></div>
        <p class="final-kicker"></p>
        <h2 id="part-seven-title" tabindex="-1"><span class="final-title"></span><em class="final-subtitle"></em></h2>
        <ol class="final-missions" aria-label="Misiones completadas"></ol>
        <article class="final-letter">
          <figure class="final-photo"><img alt="" decoding="async" /><figcaption></figcaption></figure>
          <div class="final-message">
            <p class="final-to"></p>
            <p class="final-text"></p>
            <p class="final-signature"></p>
          </div>
        </article>
        <nav class="final-jump" aria-labelledby="final-jump-title">
          <h3 id="final-jump-title"></h3>
          <p></p>
          <ol class="final-jump-list"></ol>
        </nav>
        <section class="final-share" aria-labelledby="final-share-title">
          <h3 id="final-share-title"></h3>
          <p></p>
          <button type="button" class="primary-button final-make-image"></button>
          <p class="final-share-status" role="status" aria-live="polite"></p>
          <div class="final-share-result" hidden>
            <img class="final-share-preview" alt="Imagen resumen de nuestra aventura" />
            <div class="final-share-buttons">
              <a class="primary-button final-download" download="nuestra-aventura.png"></a>
              <button type="button" class="secondary-button final-share-button" hidden></button>
            </div>
          </div>
        </section>
        <div class="final-actions">
          <button type="button" class="secondary-button final-again"></button>
          <div class="final-links">
            <button type="button" class="text-button icon-button final-play"></button>
            <button type="button" class="text-button icon-button final-start"></button>
          </div>
        </div>
      </div>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".final-seal span").append(icon("pixel-heart"));
    find(".final-kicker").textContent = text.kicker;
    find(".final-title").textContent = text.title;
    find(".final-subtitle").textContent = text.subtitle;
    text.missions.forEach((mission, index) => {
      const item = document.createElement("li");
      item.style.setProperty("--delay", `${500 + index * 140}ms`);
      item.append(icon("check"), document.createTextNode(mission));
      if (index === text.missions.length - 1 && flappyBest > 0) {
        const record = document.createElement("small");
        record.textContent = `Récord: ${flappyBest}`;
        item.append(record);
      }
      find(".final-missions").append(item);
    });
    const recipient = ((config.prize && config.prize.recipientName) || "").trim() || config.names.him;
    find(".final-to").textContent = `Para ${recipient}:`;
    find(".final-text").textContent = text.message;
    find(".final-signature").textContent = text.signature || `Con todo mi amor, ${config.names.her}`;
    const photo = find(".final-photo img");
    photo.alt = config.photo.alt;
    photo.style.objectFit = "cover";
    photo.style.objectPosition = config.photo.position || "50% 50%";
    photo.addEventListener("error", () => { find(".final-photo").hidden = true; });
    photo.src = config.photo.src;
    find(".final-photo figcaption").textContent = `${config.names.her} + ${config.names.him}`;
    // Menú para volver a cualquier parte: ya no hay que pasar por las anteriores.
    find("#final-jump-title").textContent = text.jumpTitle;
    find(".final-jump > p").textContent = text.jumpHint;
    text.jumpParts.forEach(([part, label, symbol]) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "final-jump-button";
      const number = document.createElement("span");
      number.className = "final-jump-number";
      number.textContent = String(part);
      const name = document.createElement("span");
      name.textContent = label;
      button.append(number, icon(symbol), name);
      button.addEventListener("click", () => goToPart(part));
      item.append(button);
      find(".final-jump-list").append(item);
    });
    renderText(find(".final-again"), text.againButton);

    // Imagen resumen para guardar o subir de estado.
    find("#final-share-title").textContent = text.shareTitle;
    find(".final-share > p").textContent = text.shareHint;
    const makeButton = find(".final-make-image"), shareStatus = find(".final-share-status");
    makeButton.append(icon("sparkle"), document.createTextNode(text.makeImageButton));
    find(".final-download").append(icon("arrow-right"), document.createTextNode(text.downloadButton));
    find(".final-download").querySelector("svg").style.transform = "rotate(90deg)";
    find(".final-share-button").append(icon("arrow-up-right"), document.createTextNode(text.shareButton));
    let imageUrl = "", imageFile = null;
    makeButton.addEventListener("click", async () => {
      if (!window.SummaryImage) return;
      makeButton.disabled = true;
      shareStatus.textContent = text.makingImage;
      try {
        let record = 0;
        try { record = Number(window.localStorage.getItem("aventura-flappy-record")) || 0; } catch { record = 0; }
        let dateText = "";
        try { dateText = `Desde el ${window.MemoryTools.calendarDate(config.memory.date).formatted}`; } catch { dateText = ""; }
        const song = config.song ? `${config.song.name || "The Fate of Ophelia"} · ${config.song.artist || "Taylor Swift"}` : "";
        const blob = await window.SummaryImage.create(config, {
          title: text.title, subtitle: text.subtitle, dateText, missions: text.missions,
          phrase: config.message && config.message.phrase, song, record,
        });
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        imageUrl = URL.createObjectURL(blob);
        imageFile = new File([blob], "nuestra-aventura.png", { type: "image/png" });
        find(".final-share-preview").src = imageUrl;
        find(".final-download").href = imageUrl;
        const canShare = typeof navigator.canShare === "function" && navigator.canShare({ files: [imageFile] });
        find(".final-share-button").hidden = !canShare;
        find(".final-share-result").hidden = false;
        shareStatus.textContent = text.imageReady;
        renderText(makeButton, text.remakeImageButton);
      } catch (error) {
        console.error(error);
        shareStatus.textContent = text.imageError;
      } finally { makeButton.disabled = false; }
    });
    find(".final-share-button").addEventListener("click", async () => {
      if (!imageFile) return;
      try { await navigator.share({ files: [imageFile], title: `${text.title} · ${text.subtitle}` }); }
      catch { /* La persona cerró el menú de compartir. */ }
    });
    const play = find(".final-play");
    play.append(icon("arrow-left"), document.createTextNode(text.playButton));
    play.addEventListener("click", goToPart6);
    const start = find(".final-start");
    start.append(icon("replay"), document.createTextNode(text.startButton));
    start.addEventListener("click", goToWelcome);

    // ---------- Confeti a pantalla completa ----------
    const canvas = document.createElement("canvas");
    canvas.className = "final-confetti";
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d");
    let pieces = [], frame = 0, last = 0, until = 0;

    function fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function piece(x, y, vx, vy) {
      return { x, y, vx, vy, spin: (Math.random() - .5) * 10, angle: Math.random() * 6.28, size: 6 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], heart: Math.random() < .35, wobble: Math.random() * 6.28, life: 0 };
    }
    // Dos cañones desde las esquinas y una lluvia desde arriba.
    function launch() {
      if (reducedMotion.matches) return;
      const w = window.innerWidth, h = window.innerHeight;
      for (let i = 0; i < 90; i += 1) {
        pieces.push(piece(0, h * .85, 280 + Math.random() * 420, -(520 + Math.random() * 520)));
        pieces.push(piece(w, h * .85, -(280 + Math.random() * 420), -(520 + Math.random() * 520)));
      }
      for (let i = 0; i < 110; i += 1) pieces.push(piece(Math.random() * w, -20 - Math.random() * h * .8, (Math.random() - .5) * 60, 40 + Math.random() * 80));
      until = performance.now() + 7000;
      if (!canvas.isConnected) { fit(); document.body.append(canvas); }
      if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
    }
    function tick(now) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      last = now;
      const w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      // Lluvia suave continua mientras dura la fiesta.
      if (now < until && Math.random() < .5) pieces.push(piece(Math.random() * w, -15, (Math.random() - .5) * 40, 50 + Math.random() * 60));
      pieces = pieces.filter((p) => p.y < h + 30 && p.life < 12);
      for (const p of pieces) {
        p.life += dt;
        p.vy = Math.min(p.vy + 520 * dt, 170);
        p.vx *= Math.pow(.35, dt);
        p.wobble += dt * 5;
        p.x += (p.vx + Math.sin(p.wobble) * 22) * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.heart) { ctx.scale(p.size / 24, p.size / 24); ctx.translate(-12, -12); ctx.fill(HEART); }
        else { ctx.scale(1, Math.abs(Math.cos(p.wobble))); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        ctx.restore();
      }
      if (pieces.length || now < until) frame = requestAnimationFrame(tick);
      else { frame = 0; canvas.remove(); }
    }
    function celebrate() {
      window.Sonidos?.play("win");
      launch();
      const title = find("h2");
      title.classList.remove("is-popping");
      void title.offsetWidth;
      title.classList.add("is-popping");
    }
    find(".final-again").addEventListener("click", celebrate);
    window.addEventListener("resize", fit);

    // La fiesta empieza cada vez que se entra a esta parte.
    const onPartChange = (event) => {
      if (event.detail.currentPart === 7) setTimeout(celebrate, 150);
      else { pieces = []; until = 0; }
    };
    document.addEventListener("adventure:partchange", onPartChange);

    return () => {
      document.removeEventListener("adventure:partchange", onPartChange);
      window.removeEventListener("resize", fit);
      cancelAnimationFrame(frame); frame = 0; canvas.remove();
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  });
})();
