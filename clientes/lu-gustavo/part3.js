/* Parte 3: tarjetas que se abren como pequeños recuerdos de papel. */
(() => {
  "use strict";
  window.Aventura.registerPart3((container, context) => {
    const { config, icon, renderText, animate, celebrate, completePart3, goToPart2, goToPart4 } = context;
    const { memories, text } = config.gallery;
    const discovery = window.GalleryTools.createDiscovery(memories.map((memory) => memory.id));
    let celebrationShown = false;

    container.innerHTML = `
      <header class="gallery-header">
        <p class="memory-step"></p>
        <h2 id="part-three-title" tabindex="-1"></h2>
        <p class="gallery-introduction"></p>
        <div class="gallery-progress">
          <p id="gallery-counter" role="status" aria-live="polite" aria-atomic="true"></p>
          <progress class="discovery-meter" aria-label="Recuerdos descubiertos" value="0"></progress>
        </div>
      </header>
      <div class="keepsake-box">
        <div class="box-label"><span></span><span class="box-couple"></span></div>
        <ol class="gallery-list" aria-label="Colección de recuerdos"></ol>
      </div>
      <div class="gallery-complete" hidden>
        <div class="heart-particles gallery-celebration" aria-hidden="true"></div>
        <span class="collection-seal" aria-hidden="true"></span>
        <h3></h3><p></p>
        <button type="button" class="primary-button gallery-next" disabled></button>
      </div>
      <nav class="gallery-back"><button type="button" class="text-button icon-button"></button></nav>
    `;
    const find = (selector) => container.querySelector(selector);
    find(".memory-step").textContent = `Parte 3 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    find(".gallery-introduction").textContent = text.introduction;
    find(".box-label > span").append(icon("heart-outline"), document.createTextNode(text.collectionLabel));
    find(".box-couple").textContent = `${config.names.her} + ${config.names.him}`;
    find(".collection-seal").append(icon("pixel-heart"));
    find(".gallery-complete h3").textContent = text.completedTitle;
    find(".gallery-complete > p").textContent = text.completedMessage;
    const nextButton = find(".gallery-next");
    renderText(nextButton, text.continueButton);
    nextButton.addEventListener("click", () => { if (discovery.complete) goToPart4(); });
    const back = find(".gallery-back button");
    back.append(icon("arrow-left"), document.createTextNode(text.backButton));
    back.addEventListener("click", goToPart2);

    function updateCounter() {
      find("#gallery-counter").textContent = text.progressLabel.replace("{count}", discovery.count).replace("{total}", discovery.total);
      const meter = find(".discovery-meter");
      meter.max = discovery.total;
      meter.value = discovery.count;
    }

    function revealCompletion() {
      if (!discovery.complete || celebrationShown) return;
      celebrationShown = true;
      completePart3();
      const completion = find(".gallery-complete");
      completion.hidden = false;
      nextButton.disabled = false;
      celebrate(find(".gallery-celebration"));
      animate(completion, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], 360);
      // No se roba el foco ni se desplaza la foto que la persona está viendo.
    }

    memories.forEach((memory, index) => {
      const listItem = document.createElement("li");
      listItem.className = "gallery-item";
      listItem.style.setProperty("--card-angle", `${[-1.3, 1.1, -.8, 1.2, -1, .7][index]}deg`);
      listItem.style.setProperty("--card-delay", `${index * 70}ms`);
      const card = document.createElement("article");
      card.className = "keepsake";
      // Usa el índice para IDs HTML; el id configurable identifica solo el progreso.
      const panelId = `gallery-memory-${index + 1}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "keepsake-toggle";
      button.setAttribute("aria-controls", panelId);
      button.setAttribute("aria-expanded", "false");
      const number = document.createElement("span");
      number.className = "keepsake-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const status = document.createElement("span");
      status.className = "keepsake-status";
      status.hidden = true;
      status.append(icon("check"), document.createTextNode(text.discoveredLabel));
      const top = document.createElement("span");
      top.className = "keepsake-topline";
      top.append(number, status);
      const symbol = icon(index % 2 ? "sparkle" : "heart-outline", "keepsake-symbol");
      const clue = document.createElement("span");
      clue.className = "keepsake-clue";
      clue.textContent = memory.clue;
      const prompt = document.createElement("span");
      prompt.className = "keepsake-prompt";
      const promptText = document.createElement("span");
      promptText.textContent = text.openLabel;
      prompt.append(promptText, icon("chevron-down"));
      button.append(top, symbol, clue, prompt);

      const panel = document.createElement("div");
      panel.id = panelId;
      panel.className = "keepsake-content";
      panel.hidden = true;
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
      // La petición comienza al abrir; no usamos lazy sobre una imagen oculta.
      let photoRequested = false;
      const showPhoto = () => {
        const loaded = photo.naturalWidth > 0;
        photo.hidden = !loaded;
        placeholder.hidden = loaded;
      };
      photo.addEventListener("load", showPhoto);
      photo.addEventListener("error", () => { photo.hidden = true; placeholder.hidden = false; });
      photoWindow.append(placeholder, photo);
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
      panel.append(figure);
      card.append(button, panel);
      listItem.append(card);
      find(".gallery-list").append(listItem);
      let isOpen = false, busy = false;

      function labelButton() {
        button.setAttribute("aria-expanded", String(isOpen));
        button.setAttribute("aria-label", `${isOpen ? text.closeLabel : text.openLabel}: ${memory.clue}. Recuerdo ${index + 1} de ${discovery.total}${discovery.has(memory.id) ? ". " + text.discoveredLabel : ""}`);
      }
      labelButton();

      button.addEventListener("click", async () => {
        if (busy) return;
        busy = true;
        button.setAttribute("aria-disabled", "true");
        card.setAttribute("aria-busy", "true");
        try {
          if (!isOpen) {
            await animate(button, [{ opacity: 1, transform: "scale(1)" }, { opacity: .35, transform: "scale(.985)" }], 140);
            isOpen = true;
            card.classList.add("is-open");
            panel.hidden = false;
            promptText.textContent = text.closeLabel;
            if (!photoRequested) {
              photoRequested = true;
              if (memory.photo.src) { photo.src = memory.photo.src; if (photo.complete) showPhoto(); }
            }
            if (discovery.discover(memory.id)) updateCounter();
            status.hidden = false;
            card.classList.add("is-discovered");
            labelButton();
            await animate(panel, [{ opacity: 0, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }], 260);
            revealCompletion();
          } else {
            await animate(panel, [{ opacity: 1 }, { opacity: 0 }], 130);
            isOpen = false;
            panel.hidden = true;
            card.classList.remove("is-open");
            promptText.textContent = text.openLabel;
            labelButton();
          }
        } finally {
          busy = false;
          button.removeAttribute("aria-disabled");
          card.removeAttribute("aria-busy");
        }
      });
    });

    document.addEventListener("adventure:partchange", (event) => {
      if (event.detail.currentPart !== 3) container.classList.add("gallery-revisited");
    });
    updateCounter();
  });
})();
