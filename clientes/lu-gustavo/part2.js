/* Parte 2: el calendario se monta una vez y conserva su estado al navegar. */
(() => {
  "use strict";
  const WIDTH = 360, HEIGHT = 400, BRUSH_RADIUS = 34, REVEAL_THRESHOLD = .40;

  window.Aventura.registerPart2((container, context) => {
    const { config, icon, renderText, animate, celebrate, completePart2, goToPart3, goToWelcome } = context;
    const memory = config.memory;
    const date = window.MemoryTools.calendarDate(memory.date);
    const text = memory.text;
    let completed = context.isPart2Completed();
    let revealing = false;
    let activePointer = null;
    let previousPoint = null;
    let frame = 0;
    let queuedPoints = [];
    const coverage = window.MemoryTools.createCoverageGrid(WIDTH, HEIGHT);

    // Plantilla fija; todos los datos personalizables se insertan como texto.
    container.innerHTML = `
      <header class="memory-header">
        <p class="memory-step"></p>
        <h2 id="next-title" tabindex="-1"></h2>
        <p class="memory-introduction"></p>
      </header>
      <div class="calendar-experience">
        <div class="calendar-card">
          <span class="calendar-ring ring-left" aria-hidden="true"></span>
          <span class="calendar-ring ring-right" aria-hidden="true"></span>
          <div class="calendar-surface">
            <div class="calendar-sheet" aria-hidden="true" inert>
              <div class="calendar-month"><span></span><span class="calendar-year"></span></div>
              <p class="calendar-subtitle"></p>
              <table class="calendar-grid">
                <caption class="sr-only"></caption>
                <thead><tr></tr></thead><tbody></tbody>
              </table>
              <p class="calendar-dedication"></p>
            </div>
            <div class="scratch-layer">
              <canvas class="scratch-canvas" aria-hidden="true"></canvas>
              <div class="scratch-cover-copy" aria-hidden="true">
                <span class="scratch-emblem"></span>
                <p class="scratch-cover-title"></p>
                <p class="scratch-cover-message"></p>
                <span class="scratch-cover-names"></span>
              </div>
            </div>
          </div>
          <div class="heart-particles calendar-celebration" aria-hidden="true"></div>
        </div>
        <div class="scratch-controls">
          <p id="scratch-instruction" class="scratch-instruction"></p>
          <p class="scratch-mouse-hint"></p>
          <button type="button" class="reveal-button icon-button"></button>
        </div>
        <p class="revealed-badge" hidden></p>
      </div>
      <div class="memory-reward" hidden>
        <p id="revealed-date" class="revealed-date" tabindex="-1"></p>
        <figure class="memory-photo-card">
          <div class="memory-photo-window">
            <div class="memory-photo-placeholder"><span></span><p></p></div>
            <img class="memory-photo" hidden decoding="async" />
          </div>
          <figcaption class="memory-phrase"></figcaption>
        </figure>
        <button type="button" id="memories-button" class="primary-button memory-continue" disabled></button>
      </div>
      <nav class="memory-back"><button type="button" class="text-button icon-button"></button></nav>
      <p class="sr-only memory-status" role="status" aria-live="polite" aria-atomic="true"></p>
    `;

    const find = (selector) => container.querySelector(selector);
    const canvas = find(".scratch-canvas");
    const layer = find(".scratch-layer");
    const sheet = find(".calendar-sheet");
    const controls = find(".scratch-controls");
    const revealButton = find(".reveal-button");
    const reward = find(".memory-reward");
    const nextButton = find("#memories-button");
    const announcement = find(".memory-status");
    const badge = find(".revealed-badge");
    const celebration = find(".calendar-celebration");

    find(".memory-step").textContent = `Parte 2 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    find(".memory-introduction").textContent = text.introduction;
    find(".calendar-month > span").textContent = date.monthName;
    find(".calendar-year").textContent = String(date.year);
    find(".calendar-subtitle").textContent = text.calendarLabel;
    find("caption").textContent = `${date.monthName} de ${date.year}. Nuestra fecha: ${date.formatted}.`;
    const names = `${config.names.her} + ${config.names.him}`;
    find(".calendar-dedication").textContent = names;
    find(".scratch-cover-names").textContent = names;
    find(".scratch-emblem").append(icon("heart-outline"));
    find(".scratch-cover-title").textContent = text.coverTitle;
    find(".scratch-cover-message").textContent = text.coverMessage;
    find(".scratch-instruction").append(icon("swipe"), document.createTextNode(text.scratchHint));
    find(".scratch-mouse-hint").textContent = text.mouseHint;
    revealButton.append(icon("eye"), document.createTextNode(text.revealButton));
    badge.append(icon("sparkle"), document.createTextNode(text.revealedLabel));
    find(".memory-photo-placeholder > span").append(icon("heart-outline"));
    find(".memory-photo-placeholder p").textContent = text.photoPlaceholder;
    find(".memory-phrase").textContent = memory.phrase;
    renderText(find(".revealed-date"), text.dateMessage.replace("{fecha}", date.formatted));
    renderText(nextButton, text.continueButton);
    const backButton = find(".memory-back button");
    backButton.append(icon("arrow-left"), document.createTextNode(text.backButton));
    backButton.addEventListener("click", goToWelcome);
    nextButton.addEventListener("click", () => { if (completed && !revealing) goToPart3(); });

    const weekdays = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
    weekdays.forEach((weekday, index) => {
      const header = document.createElement("th");
      header.scope = "col";
      header.setAttribute("aria-label", weekday);
      header.textContent = weekdayLabels[index];
      find("thead tr").append(header);
    });
    for (let week = 0; week < 6; week += 1) {
      const row = document.createElement("tr");
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const day = week * 7 + weekday - date.firstWeekday + 1;
        const cell = document.createElement("td");
        if (day >= 1 && day <= date.daysInMonth) {
          if (day === date.day) {
            cell.className = "our-day";
            const mark = document.createElement("span");
            mark.className = "date-heart";
            mark.append(icon("heart-filled"));
            const time = document.createElement("time");
            time.dateTime = date.iso;
            time.textContent = String(day);
            time.setAttribute("aria-label", `${date.formatted}, el día que comenzó todo`);
            mark.append(time);
            cell.append(mark);
          } else cell.textContent = String(day);
        }
        row.append(cell);
      }
      find("tbody").append(row);
    }

    // La foto se solicita solo al revelar el recuerdo. El reservado cubre rutas rotas.
    let photoRequested = false;
    function loadPhoto() {
      if (photoRequested) return;
      photoRequested = true;
      const photo = find(".memory-photo");
      const placeholder = find(".memory-photo-placeholder");
      const settings = memory.photo;
      photo.alt = settings.alt;
      photo.style.objectFit = settings.fit === "cover" ? "cover" : "contain";
      photo.style.objectPosition = settings.position || "50% 50%";
      const showPhoto = () => {
        const loaded = photo.naturalWidth > 0;
        photo.hidden = !loaded;
        placeholder.hidden = loaded;
      };
      photo.addEventListener("load", showPhoto);
      photo.addEventListener("error", () => { photo.hidden = true; placeholder.hidden = false; });
      if (settings.src) {
        photo.src = settings.src;
        if (photo.complete) showPhoto();
      }
    }

    // La máscara usa coordenadas lógicas fijas. El navegador escala su bitmap:
    // cambiar orientación o tamaño no borra lo ya raspado ni reinicia el progreso.
    const density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(WIDTH * density);
    canvas.height = Math.round(HEIGHT * density);
    let drawing = null;
    try { drawing = canvas.getContext("2d"); } catch { /* Se conserva el botón accesible. */ }
    if (drawing) {
      drawing.scale(density, density);
      const gradient = drawing.createLinearGradient(0, 0, WIDTH, HEIGHT);
      gradient.addColorStop(0, "#f4dce2");
      gradient.addColorStop(.55, "#ecc5d1");
      gradient.addColorStop(1, "#e6b8c7");
      drawing.fillStyle = gradient;
      drawing.fillRect(0, 0, WIDTH, HEIGHT);
      drawing.fillStyle = "#a458702b";
      for (let y = 11; y < HEIGHT; y += 13) {
        for (let x = 11; x < WIDTH; x += 13) { drawing.beginPath(); drawing.arc(x, y, .7, 0, Math.PI * 2); drawing.fill(); }
      }
      // A partir de aquí las pinceladas eliminan la cubierta, sin leer sus píxeles.
      drawing.globalCompositeOperation = "destination-out";
      drawing.fillStyle = "#000";
      drawing.strokeStyle = "#000";
      drawing.lineWidth = BRUSH_RADIUS * 2;
      drawing.lineCap = "round";
      drawing.lineJoin = "round";
    } else {
      layer.classList.add("canvas-unavailable");
      canvas.style.pointerEvents = "none";
    }

    function pointFromEvent(event) {
      const bounds = canvas.getBoundingClientRect();
      return { x: (event.clientX - bounds.left) / bounds.width * WIDTH, y: (event.clientY - bounds.top) / bounds.height * HEIGHT };
    }

    function erase(from, to) {
      drawing.beginPath();
      drawing.moveTo(from.x, from.y);
      drawing.lineTo(to.x, to.y);
      drawing.stroke();
      drawing.beginPath();
      drawing.arc(to.x, to.y, BRUSH_RADIUS, 0, Math.PI * 2);
      drawing.fill();
      return coverage.eraseSegment(from, to, BRUSH_RADIUS);
    }

    function flushScratch() {
      frame = 0;
      if (completed || !drawing) { queuedPoints = []; return; }
      const batch = queuedPoints;
      queuedPoints = [];
      for (const point of batch) {
        const ratio = erase(previousPoint || point, point);
        previousPoint = point;
        if (ratio >= REVEAL_THRESHOLD) { reveal(false); break; }
      }
    }

    function stopPointer() {
      const capturedPointer = activePointer;
      activePointer = null;
      previousPoint = null;
      if (capturedPointer !== null && canvas.hasPointerCapture?.(capturedPointer)) canvas.releasePointerCapture(capturedPointer);
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (!drawing || completed || revealing || activePointer !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
      activePointer = event.pointerId;
      previousPoint = null;
      canvas.setPointerCapture?.(event.pointerId);
      layer.classList.add("is-scratching");
      queuedPoints.push(pointFromEvent(event));
      if (!frame) frame = requestAnimationFrame(flushScratch);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointer || completed) return;
      queuedPoints.push(pointFromEvent(event));
      if (!frame) frame = requestAnimationFrame(flushScratch);
    });
    function finishStroke(event) {
      if (event.pointerId !== activePointer) return;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      flushScratch();
      stopPointer();
    }
    canvas.addEventListener("pointerup", finishStroke);
    canvas.addEventListener("pointercancel", finishStroke);
    canvas.addEventListener("lostpointercapture", finishStroke);

    async function reveal(fromButton = false) {
      if (completed || revealing) return;
      revealing = true;
      completed = true;
      revealButton.disabled = true;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      queuedPoints = [];
      stopPointer();
      layer.classList.add("is-scratching");
      await animate(layer, [{ opacity: 1 }, { opacity: 0 }], 350);
      completePart2();
      displayCompleted();
      celebrate(celebration);
      find(".our-day").classList.add("date-celebrate");
      await animate(reward, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], 420);
      revealing = false;
      nextButton.disabled = false;
      announcement.textContent = `${text.revealedLabel}. ${text.dateMessage.replace("{fecha}", date.formatted)}`;
      // Mantén una posición de foco útil cuando desaparece el botón de revelar.
      if (fromButton && context.isPart2Visible()) find(".revealed-date").focus({ preventScroll: true });
    }

    function displayCompleted() {
      layer.hidden = true;
      controls.hidden = true;
      sheet.removeAttribute("aria-hidden");
      sheet.inert = false;
      badge.hidden = false;
      reward.hidden = false;
      nextButton.disabled = revealing;
      loadPhoto();
    }

    revealButton.addEventListener("click", () => reveal(true));
    document.addEventListener("adventure:partchange", (event) => {
      if (event.detail.currentPart === 2) return;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      queuedPoints = [];
      stopPointer();
    });
    if (completed) displayCompleted();
    // No hay bucles de animación permanentes ni listeners globales por gesto.
  });
})();
