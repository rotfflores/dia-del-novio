/* Parte 3: memorama con los recuerdos de la galería. Cada par descubierto guarda su frase. */
(() => {
  "use strict";
  window.Aventura.registerPart3((container, context) => {
    const { config, icon, renderText, animate, celebrate, completePart3, goToPart2, goToPart4 } = context;
    const { memories, text } = config.gallery;
    const gameText = { ...DEFAULT_GAME_TEXT, ...(config.gallery.game || {}) };
    const byId = new Map(memories.map((memory, index) => [memory.id, { memory, index }]));
    const game = window.MemoramaTools.createGame(memories.map((memory) => memory.id));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let celebrationShown = false, missTimer = 0;

    container.innerHTML = `
      <header class="gallery-header">
        <p class="memory-step"></p>
        <h2 id="part-three-title" tabindex="-1"></h2>
        <p class="gallery-introduction"></p>
        <div class="gallery-progress">
          <p id="gallery-counter" role="status" aria-live="polite" aria-atomic="true"></p>
          <progress class="discovery-meter" aria-label="Pares encontrados" value="0"></progress>
          <p class="memorama-moves"></p>
        </div>
      </header>
      <div class="keepsake-box">
        <div class="box-label"><span></span><span class="box-couple"></span></div>
        <ol class="memorama-board" aria-label="Cartas del memorama"></ol>
        <p class="memorama-announcer sr-only" aria-live="assertive" aria-atomic="true"></p>
      </div>
      <div class="gallery-complete" hidden>
        <div class="heart-particles gallery-celebration" aria-hidden="true"></div>
        <span class="collection-seal" aria-hidden="true"></span>
        <h3></h3><p></p>
        <p class="letter-prize-label"></p>
        <div class="reward-choices">
          <button type="button" class="reward-choice" data-view="photos"><span class="reward-choice-icon"></span><strong></strong><small></small></button>
          <button type="button" class="reward-choice" data-view="letter"><span class="reward-choice-icon"></span><strong></strong><small></small></button>
        </div>
        <div class="letter-prize reward-view" data-view="letter" hidden>
          <button type="button" class="text-button icon-button reward-back"></button>
          <button type="button" class="letter-envelope" aria-expanded="false" aria-controls="memory-letter">
            <span class="envelope-art" aria-hidden="true"><span class="envelope-flap"></span><span class="envelope-seal"></span></span>
            <span class="envelope-text"></span>
          </button>
          <article id="memory-letter" class="memory-letter" hidden aria-labelledby="memory-letter-title">
            <h4 id="memory-letter-title"></h4>
            <p class="memory-letter-greeting"></p>
            <div class="memory-letter-body"></div>
            <p class="memory-letter-signature"></p>
          </article>
        </div>
        <section class="memorama-found reward-view" data-view="photos" aria-labelledby="memorama-found-title" hidden>
          <button type="button" class="text-button icon-button reward-back"></button>
          <h3 id="memorama-found-title"></h3>
          <ol class="gallery-list memorama-found-list"></ol>
        </section>
        <button type="button" class="primary-button gallery-next" disabled></button>
      </div>
      <nav class="gallery-back"><button type="button" class="text-button icon-button"></button></nav>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".memory-step").textContent = `Parte 3 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    find(".gallery-introduction").textContent = gameText.introduction;
    find(".box-label > span").append(icon("heart-outline"), document.createTextNode(text.collectionLabel));
    find(".box-couple").textContent = `${config.names.her} + ${config.names.him}`;
    find("#memorama-found-title").textContent = gameText.foundTitle;
    find(".collection-seal").append(icon("pixel-heart"));
    find(".gallery-complete h3").textContent = text.completedTitle;
    find(".gallery-complete > p").textContent = gameText.completedMessage;

    // Premio del memorama: una carta sobre recuerdos y memoria, guardada en un sobre.
    const letter = { ...DEFAULT_LETTER, ...(config.gallery.letter || {}) };
    find(".letter-prize-label").textContent = letter.prizeLabel;
    find(".envelope-text").textContent = letter.openButton;
    find(".envelope-seal").append(icon("pixel-heart"));
    find("#memory-letter-title").textContent = letter.title;
    find(".memory-letter-greeting").textContent = letter.greeting;
    letter.paragraphs.forEach((paragraph) => { const node = document.createElement("p"); node.textContent = paragraph; find(".memory-letter-body").append(node); });
    find(".memory-letter-signature").textContent = letter.signature || `Con todo mi amor, ${config.names.her}`;
    const choices = find(".reward-choices");
    const choiceText = { photos: [letter.photosButton, `${memories.length} recuerdos`, "heart-outline"], letter: [letter.letterButton, letter.letterHint, "pixel-heart"] };
    container.querySelectorAll(".reward-choice").forEach((button) => {
      const [label, hint, symbol] = choiceText[button.dataset.view];
      button.querySelector("strong").textContent = label;
      button.querySelector("small").textContent = hint;
      button.querySelector(".reward-choice-icon").append(icon(symbol));
      button.addEventListener("click", () => openView(button.dataset.view));
    });
    container.querySelectorAll(".reward-back").forEach((button) => {
      button.dataset.sound = "back";
      button.append(icon("arrow-left"), document.createTextNode(letter.backButton));
      button.addEventListener("click", closeView);
    });
    let openedFrom = null;
    function openView(view) {
      openedFrom = view;
      choices.hidden = true;
      const panel = container.querySelector(`.reward-view[data-view="${view}"]`);
      panel.hidden = false;
      animate(panel, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], 320);
      panel.querySelector(".reward-back").focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    }
    function closeView() {
      container.querySelectorAll(".reward-view").forEach((panel) => { panel.hidden = true; });
      choices.hidden = false;
      const button = container.querySelector(`.reward-choice[data-view="${openedFrom}"]`);
      if (button) button.focus({ preventScroll: true });
      choices.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
    }
    const envelope = find(".letter-envelope");
    envelope.dataset.sound = "none";
    envelope.addEventListener("click", async () => {
      if (envelope.getAttribute("aria-expanded") === "true") return;
      window.Sonidos?.play("gift");
      envelope.setAttribute("aria-expanded", "true");
      envelope.classList.add("is-open");
      await animate(envelope, [{ transform: "scale(1)" }, { transform: "scale(1.05)", offset: .4 }, { transform: "scale(.96)", opacity: 0 }], 420);
      envelope.hidden = true;
      const paper = find("#memory-letter");
      paper.hidden = false;
      animate(paper, [{ opacity: 0, transform: "translateY(16px) scale(.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], 480);
      paper.querySelector("h4").setAttribute("tabindex", "-1");
      paper.querySelector("h4").focus({ preventScroll: true });
    });
    const nextButton = find(".gallery-next");
    renderText(nextButton, text.continueButton);
    nextButton.addEventListener("click", () => { if (game.complete) goToPart4(); });
    const back = find(".gallery-back button");
    back.append(icon("arrow-left"), document.createTextNode(text.backButton));
    back.addEventListener("click", goToPart2);
    const announcer = find(".memorama-announcer");
    const board = find(".memorama-board");
    board.style.setProperty("--memo-columns", String(memories.length));

    function updateCounter() {
      find("#gallery-counter").textContent = gameText.progressLabel.replace("{count}", game.pairs).replace("{total}", game.total);
      find(".memorama-moves").textContent = gameText.movesLabel.replace("{moves}", game.moves);
      const meter = find(".discovery-meter");
      meter.max = game.total;
      meter.value = game.pairs;
    }

    // Una sola comprobación por recuerdo: si la foto falla, la carta muestra un reservado con su pista.
    const photoStatus = new Map();
    function photoFor(memory) {
      const photo = document.createElement("img");
      photo.className = "memo-photo";
      photo.alt = "";
      photo.decoding = "async";
      photo.draggable = false;
      // La carta es pequeña: se llena el marco; la foto completa aparece en el recuerdo desbloqueado.
      photo.style.objectFit = "cover";
      photo.style.objectPosition = memory.photo.position || "50% 50%";
      photo.hidden = true;
      return photo;
    }
    function loadPhoto(memory, photo, placeholder) {
      if (!memory.photo.src || photoStatus.get(memory.id) === "error") return;
      photo.addEventListener("load", () => { photo.hidden = photo.naturalWidth === 0; placeholder.hidden = !photo.hidden; });
      photo.addEventListener("error", () => { photoStatus.set(memory.id, "error"); photo.hidden = true; placeholder.hidden = false; });
      photo.src = memory.photo.src;
    }

    const cards = game.deck.map((id, position) => {
      const { memory, index } = byId.get(id);
      const slot = document.createElement("li");
      slot.className = "memo-slot";
      slot.style.setProperty("--card-delay", `${position * 45}ms`);
      slot.style.setProperty("--card-angle", `${[-1.2, .9, -.6, 1.1, -.9, .6][position % 6]}deg`);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memo-card";
      button.dataset.tone = String(index % 3);
      // El color del reverso depende de la posición, así no delata los pares.
      button.dataset.back = String(position % 3);
      const inner = document.createElement("span");
      inner.className = "memo-inner";

      const backFace = document.createElement("span");
      backFace.className = "memo-back";
      backFace.setAttribute("aria-hidden", "true");
      backFace.append(icon("pixel-heart", "memo-back-heart"));

      const face = document.createElement("span");
      face.className = "memo-face";
      face.setAttribute("aria-hidden", "true");
      const photoWindow = document.createElement("span");
      photoWindow.className = "memo-photo-window";
      const placeholder = document.createElement("span");
      placeholder.className = "memo-placeholder";
      placeholder.append(icon(MEMO_SYMBOLS[index % MEMO_SYMBOLS.length]));
      const photo = photoFor(memory);
      photoWindow.append(placeholder, photo);
      const clue = document.createElement("span");
      clue.className = "memo-clue";
      clue.textContent = memory.clue;
      face.append(photoWindow, clue);
      inner.append(backFace, face);
      button.append(inner);
      slot.append(button);
      board.append(slot);

      let photoRequested = false;
      const card = {
        button, memory, position,
        render() {
          const up = game.isFaceUp(position), matched = game.isMatched(position);
          if (up && !photoRequested) { photoRequested = true; loadPhoto(memory, photo, placeholder); }
          button.classList.toggle("is-flipped", up);
          button.classList.toggle("is-matched", matched);
          if (matched) button.setAttribute("aria-disabled", "true"); else button.removeAttribute("aria-disabled");
          button.setAttribute("aria-label", up
            ? `Carta ${position + 1}: ${memory.clue}${matched ? `. ${gameText.matchedLabel}` : ""}`
            : `Carta ${position + 1}, ${gameText.hiddenLabel}`);
        },
      };
      button.addEventListener("click", () => play(card));
      card.render();
      return card;
    });

    // Las fotos llegan antes del primer volteo para que el par se reconozca al instante.
    const preload = () => memories.forEach((memory) => { if (memory.photo.src) { const image = new Image(); image.src = memory.photo.src; } });
    if ("requestIdleCallback" in window) window.requestIdleCallback(preload); else setTimeout(preload, 300);

    function play(card) {
      const result = game.flip(card.position);
      if (!result) return;
      const sound = (name) => window.Sonidos?.play(name);
      sound("flip");
      card.render();
      updateCounter();
      if (result.type === "first") { announcer.textContent = card.memory.clue; return; }
      if (result.type === "match") {
        sound(game.complete ? "win" : "match");
        cards.filter((other) => other.memory.id === result.id).forEach((other) => {
          other.render();
          celebratePair(other.button);
        });
        announcer.textContent = `${gameText.matchAnnouncement} ${card.memory.clue}. ${card.memory.phrase}`;
        showFoundMemory(result.id);
        revealCompletion();
        return;
      }
      announcer.textContent = `${card.memory.clue}. ${gameText.missAnnouncement}`;
      board.classList.add("is-locked");
      setTimeout(() => sound("miss"), 320);
      missTimer = setTimeout(() => {
        missTimer = 0;
        game.hideMiss();
        result.indexes.forEach((index) => cards[index].render());
        board.classList.remove("is-locked");
      }, reducedMotion.matches ? 1100 : 950);
    }

    // Recuerdo desbloqueado: la foto completa y su frase, como en la galería original.
    function showFoundMemory(id) {
      const { memory, index } = byId.get(id);
      const item = document.createElement("li");
      item.className = "gallery-item";
      item.style.setProperty("--card-angle", `${[-1.3, 1.1, -.8, 1.2, -1, .7][index]}deg`);
      const card = document.createElement("article");
      card.className = "keepsake is-open is-discovered";
      const header = document.createElement("p");
      header.className = "memo-found-clue";
      header.append(icon("check"), document.createTextNode(memory.clue));
      const figure = document.createElement("figure");
      figure.className = "keepsake-figure";
      const photoWindow = document.createElement("div");
      photoWindow.className = "keepsake-photo-window";
      const placeholder = document.createElement("div");
      placeholder.className = "keepsake-placeholder";
      const placeholderTitle = document.createElement("p");
      placeholderTitle.textContent = text.photoPlaceholder;
      const placeholderDetail = document.createElement("span");
      placeholderDetail.textContent = text.placeholderDetail;
      placeholder.append(icon("heart-outline"), placeholderTitle, placeholderDetail);
      const photo = document.createElement("img");
      photo.className = "keepsake-photo";
      photo.hidden = true;
      photo.decoding = "async";
      photo.alt = memory.photo.alt || memory.clue;
      photo.style.objectFit = memory.photo.fit === "cover" ? "cover" : "contain";
      photo.style.objectPosition = memory.photo.position || "50% 50%";
      photo.addEventListener("load", () => { photo.hidden = photo.naturalWidth === 0; placeholder.hidden = !photo.hidden; });
      photo.addEventListener("error", () => { photo.hidden = true; placeholder.hidden = false; });
      photoWindow.append(placeholder, photo);
      if (memory.photo.src) photo.src = memory.photo.src;
      const caption = document.createElement("figcaption");
      const phrase = document.createElement("p");
      phrase.className = "keepsake-phrase";
      phrase.textContent = memory.phrase;
      caption.append(phrase);
      const metadata = [memory.date, memory.place].filter((value) => typeof value === "string" && value.trim());
      if (metadata.length) {
        const details = document.createElement("p");
        details.className = "keepsake-details";
        details.textContent = metadata.join(" · ");
        caption.append(details);
      }
      figure.append(photoWindow, caption);
      card.append(header, figure);
      item.append(card);
      // Se conservan en el orden de la colección, no en el que se encontraron.
      const list = find(".memorama-found-list");
      item.dataset.order = String(index);
      const after = [...list.children].find((child) => Number(child.dataset.order) > index);
      list.insertBefore(item, after || null);
    }

    // Par encontrado: la carta salta, brilla y suelta corazones.
    function celebratePair(button) {
      button.classList.remove("just-matched");
      void button.offsetWidth; // Reinicia la animación si se repite.
      button.classList.add("just-matched");
      setTimeout(() => button.classList.remove("just-matched"), 900);
      if (reducedMotion.matches) return;
      const burst = document.createElement("span");
      burst.className = "memo-burst";
      burst.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2 + .3;
        const heart = icon("pixel-heart", "memo-burst-heart");
        heart.style.setProperty("--x", `${Math.round(Math.cos(angle) * 70)}px`);
        heart.style.setProperty("--y", `${Math.round(Math.sin(angle) * 80)}px`);
        heart.style.setProperty("--color", i % 2 ? "#b62d51" : "#d88b9f");
        burst.append(heart);
      }
      button.parentElement.append(burst);
      setTimeout(() => burst.remove(), 950);
    }

    // Victoria: las cartas hacen una ola, llueven corazones y aparece un gran mensaje.
    function celebrateWin() {
      board.classList.add("is-won");
      cards.forEach((card, i) => card.button.style.setProperty("--wave-delay", `${i * 70}ms`));
      setTimeout(() => board.classList.remove("is-won"), 1600 + cards.length * 70);
      if (reducedMotion.matches) return;
      const overlay = document.createElement("div");
      overlay.className = "memo-win";
      overlay.setAttribute("aria-hidden", "true");
      const colors = ["#b62d51", "#d88b9f", "#f0c1cd", "#94213f", "#ae855d"];
      for (let i = 0; i < 44; i += 1) {
        const heart = icon(i % 3 ? "pixel-heart" : "heart-filled", "memo-rain");
        heart.style.setProperty("--left", `${Math.random() * 100}%`);
        heart.style.setProperty("--size", `${14 + Math.random() * 22}px`);
        heart.style.setProperty("--delay", `${Math.random() * 1100}ms`);
        heart.style.setProperty("--duration", `${2200 + Math.random() * 1400}ms`);
        heart.style.setProperty("--drift", `${Math.round((Math.random() - .5) * 160)}px`);
        heart.style.setProperty("--spin", `${Math.round((Math.random() - .5) * 540)}deg`);
        heart.style.setProperty("--color", colors[i % colors.length]);
        overlay.append(heart);
      }
      const banner = document.createElement("div");
      banner.className = "memo-win-banner";
      const seal = icon("heart-filled", "memo-win-heart");
      const title = document.createElement("p");
      title.className = "memo-win-title";
      title.textContent = gameText.winTitle;
      const detail = document.createElement("p");
      detail.className = "memo-win-detail";
      detail.textContent = gameText.winDetail.replace("{moves}", game.moves);
      banner.append(seal, title, detail);
      overlay.append(banner);
      document.body.append(overlay);
      setTimeout(() => overlay.remove(), 4200);
    }

    function revealCompletion() {
      if (!game.complete || celebrationShown) return;
      celebrationShown = true;
      completePart3();
      const completion = find(".gallery-complete");
      completion.hidden = false;
      completion.querySelector("p").textContent = gameText.completedMessage.replace("{moves}", game.moves);
      nextButton.disabled = false;
      celebrate(find(".gallery-celebration"));
      celebrateWin();
      animate(completion, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], 360);
    }

    document.addEventListener("adventure:partchange", (event) => {
      if (event.detail.currentPart !== 3) container.classList.add("gallery-revisited");
    });
    updateCounter();
    return () => clearTimeout(missTimer);
  });

  const MEMO_SYMBOLS = ["heart-outline", "sparkle", "heart-filled", "pixel-heart", "eye", "check"];
  // Textos por defecto; se pueden cambiar en gallery.game dentro de config.js.
  const DEFAULT_LETTER = {
    prizeLabel: "Tus premios",
    photosButton: "Ver nuestras fotos",
    letterButton: "Leer mi carta",
    letterHint: "Escrita para ti",
    backButton: "Regresar",
    openButton: "Abrir mi carta",
    title: "Una carta para nuestros recuerdos",
    greeting: "Mi amor:",
    paragraphs: [
      "Dicen que la memoria guarda lo que el corazón no quiere soltar. Por eso cada foto de este memorama no es solo una imagen: es un pedacito de nosotros que decidí cuidar para siempre.",
      "Me encanta pensar que tenemos una colección que nadie más tiene: nuestras risas, los días que quisiera volver a vivir y los lugares que se volvieron nuestros solo porque estábamos juntos.",
      "Aunque el tiempo pase y algunos detalles se vuelvan borrosos, sé que lo importante se queda: cómo me haces sentir, la calma que encuentro a tu lado y las ganas de seguir sumando momentos.",
      "Gracias por cada recuerdo. Prometo seguir haciendo espacio en mi memoria, y en mi corazón, para todos los que nos faltan.",
    ],
    signature: "",
  };
  const DEFAULT_GAME_TEXT = {
    introduction: "Voltea dos cartas y encuentra cada par de nuestros recuerdos",
    progressLabel: "Pares encontrados: {count} de {total}",
    movesLabel: "Intentos: {moves}",
    hiddenLabel: "boca abajo",
    matchedLabel: "Par encontrado",
    matchAnnouncement: "¡Par encontrado!",
    missAnnouncement: "No es par. Inténtalo otra vez.",
    foundTitle: "Recuerdos desbloqueados",
    completedMessage: "Encontraste todos nuestros recuerdos en {moves} intentos.",
    winTitle: "¡Lo lograste!",
    winDetail: "Todos nuestros recuerdos en {moves} intentos",
  };
})();
