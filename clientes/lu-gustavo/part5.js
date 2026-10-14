/* Parte 5: la caja guarda su estado; el contenido se construye solo al abrirla. */
(() => {
  "use strict";
  // Se expone para que el castillo de "Arma el mensaje" muestre este mismo regalo.
  window.PrizePartRenderer = (container, context) => {
    const { config, icon, renderText, animate, celebrate, getPrizeState, openPrize, restartGame, goToPart6 } = context;
    const prize = config.prize;
    const text = prize.text;
    const recipient = prize.recipientName.trim() || config.names.him;
    let busy = false, built = false, lastCelebratedRound = 0, noticeTimer;

    container.innerHTML = `
      <header class="prize-header">
        <p class="memory-step"></p>
        <h2 id="part-five-title" tabindex="-1"></h2>
        <p class="prize-introduction"></p>
      </header>
      <div class="prize-arrival" role="status" aria-live="polite" aria-atomic="true"></div>
      <div class="prize-layout">
        <div class="gift-column">
          <div class="gift-stage">
            <button type="button" class="gift-button" aria-expanded="false" aria-controls="prize-reveal">
              <svg class="gift-art" viewBox="0 0 320 330" aria-hidden="true" focusable="false">
                <ellipse cx="160" cy="297" rx="113" ry="12" fill="#6b3142" opacity=".07" />
                <rect x="67" y="149" width="186" height="133" rx="8" fill="#eeb8c6" stroke="#ac586f" stroke-width="1.5" />
                <path d="M242 151v117q0 8-8 8H69" fill="none" stroke="#df9bb0" stroke-width="10" />
                <path d="M83 175v86h154v-86" fill="none" stroke="#fff4ef" stroke-width="1.4" stroke-dasharray="3 5" />
                <rect x="143" y="154" width="35" height="128" fill="#b62d51" />
                <path d="M148 161v119" stroke="#d1617e" stroke-width="2" />
                <path d="M144 211h12v5h9v-5h12v10h-5v5h-5v5h-12v-5h-5v-5h-6Z" fill="#ffe9ed" />
                <g class="gift-lid">
                  <path d="M160 108C116 96 97 78 109 61c13-17 42 8 51 47Z" fill="#b62d51" stroke="#94213f" stroke-width="1.5" />
                  <path d="M160 108c44-12 63-30 51-47-13-17-42 8-51 47Z" fill="#b62d51" stroke="#94213f" stroke-width="1.5" />
                  <path d="M160 107c-24-28-40-35-43-31m43 31c24-28 40-35 43-31" fill="none" stroke="#e795ab" stroke-width="3" stroke-linecap="round" />
                  <rect x="56" y="108" width="208" height="50" rx="6" fill="#f6cbd6" stroke="#ac586f" stroke-width="1.5" />
                  <path d="M60 149h200" stroke="#d993a7" stroke-width="2" />
                  <rect x="141" y="106" width="39" height="52" rx="2" fill="#b62d51" />
                  <path d="M147 111v42" stroke="#d1617e" stroke-width="2" />
                  <ellipse cx="160" cy="105" rx="17" ry="10" fill="#c34365" stroke="#94213f" stroke-width="1.5" />
                </g>
              </svg>
              <span class="gift-tag"></span>
              <span class="gift-action"></span>
            </button>
            <div class="heart-particles prize-celebration" aria-hidden="true"></div>
          </div>
          <p class="gift-hint"></p>
          <dl class="prize-scores" aria-label="Tus partidas">
            <div><dt>Esta partida</dt><dd class="prize-last-score"></dd></div>
            <div><dt>Tu récord</dt><dd class="prize-best-score"></dd></div>
          </dl>
        </div>
        <section id="prize-reveal" class="prize-reveal" aria-labelledby="prize-reward-title" hidden>
          <div class="reward-content"></div>
          <div class="prize-personal-note"><p></p><span></span></div>
          <nav class="prize-actions" aria-label="Continuar la aventura">
            <button type="button" class="primary-button prize-letter"></button>
            <button type="button" class="text-button icon-button prize-replay"></button>
          </nav>
        </section>
      </div>
    `;
    const find = (selector) => container.querySelector(selector);
    const gift = find(".gift-button");
    const reward = find("#prize-reveal");
    const notice = find(".prize-arrival");
    find(".memory-step").textContent = `Parte 5 de ${config.totalParts}`;
    find("h2").textContent = text.title;
    renderText(find(".prize-introduction"), text.introduction);
    find(".gift-tag").textContent = text.recipient.replace("{nombre}", recipient);
    find(".gift-action").append(icon("sparkle"), document.createTextNode(text.openButton));
    find(".gift-hint").textContent = text.openHint;
    gift.setAttribute("aria-label", `${text.openButton}. ${text.recipient.replace("{nombre}", recipient)}`);
    renderText(find(".prize-letter"), text.continueButton);
    find(".prize-letter").addEventListener("click", goToPart6);
    find(".prize-replay").append(icon("replay"), document.createTextNode(text.replayButton));
    find(".prize-replay").addEventListener("click", restartGame);

    function buildReward() {
      if (built) return;
      built = true;
      const card = document.createElement("article");
      const heading = document.createElement("h3");
      heading.id = "prize-reward-title";
      heading.tabIndex = -1;
      const label = document.createElement("p");
      label.className = "reward-label";
      label.append(icon("heart-outline"), document.createTextNode(text.rewardTitle));
      if (prize.type === "photo") {
        card.className = "reward-photo-card";
        heading.textContent = text.rewardTitle;
        heading.className = "sr-only";
        const frame = document.createElement("div");
        frame.className = "reward-photo-frame";
        const placeholder = document.createElement("div");
        placeholder.className = "reward-photo-placeholder";
        placeholder.append(icon("heart-outline"), document.createTextNode(text.photoPlaceholder));
        const photo = document.createElement("img");
        photo.hidden = true;
        photo.decoding = "async";
        photo.alt = prize.photo.alt;
        photo.style.objectFit = prize.photo.fit === "cover" ? "cover" : "contain";
        photo.style.objectPosition = prize.photo.position || "50% 50%";
        const show = () => { photo.hidden = photo.naturalWidth === 0; placeholder.hidden = !photo.hidden; };
        photo.addEventListener("load", show);
        photo.addEventListener("error", () => { photo.hidden = true; placeholder.hidden = false; });
        frame.append(placeholder, photo);
        if (prize.photo.src) { photo.src = prize.photo.src; if (photo.complete) show(); }
        const caption = document.createElement("p");
        caption.className = "reward-photo-caption";
        renderText(caption, prize.photo.caption);
        card.append(heading, frame, caption);
      } else if (prize.type === "message") {
        card.className = "reward-message-card";
        renderText(heading, prize.surpriseMessage);
        card.append(label, heading);
      } else {
        card.className = "reward-coupon";
        label.replaceChildren(icon("heart-outline"), document.createTextNode(prize.coupon.label));
        renderText(heading, prize.coupon.text);
        const footer = document.createElement("p");
        footer.className = "coupon-footer";
        footer.append(icon("pixel-heart"), document.createTextNode(prize.coupon.footnote));
        card.append(label, heading, footer);
      }
      find(".reward-content").append(card);
      renderText(find(".prize-personal-note p"), prize.message);
      find(".prize-personal-note > span").textContent = `Con amor, ${config.names.her}`;
    }

    function showOpened() {
      buildReward();
      container.classList.add("prize-is-open");
      reward.hidden = false;
      gift.setAttribute("aria-expanded", "true");
      gift.setAttribute("aria-label", "Volver a ver mi premio");
      find(".gift-action").replaceChildren(icon("check"), document.createTextNode("Regalo abierto"));
      find(".gift-hint").textContent = text.openedHint;
    }

    gift.addEventListener("click", async () => {
      if (busy) return;
      if (getPrizeState().opened) { find("#prize-reward-title").focus(); return; }
      if (!openPrize()) return;
      busy = true;
      gift.setAttribute("aria-disabled", "true");
      try {
        await animate(gift, [{ transform: "rotate(0)" }, { transform: "rotate(-3deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" }], 280);
        await animate(find(".gift-lid"), [{ transform: "translate(0, 0) rotate(0)" }, { transform: "translate(-12px, -40px) rotate(-8deg)" }], 380);
        showOpened();
        celebrate(find(".prize-celebration"));
        // El foco descubre el premio también con teclado y lector de pantalla.
        if (!container.hidden) find("#prize-reward-title").focus({ preventScroll: false });
        await animate(reward, [{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "translateY(0)" }], 320);
      } finally { busy = false; gift.removeAttribute("aria-disabled"); }
    });

    function updateResult() {
      const result = getPrizeState();
      if (!result.unlocked) return;
      const scoreText = (score) => `${score.score} de ${score.maxScore}`;
      find(".prize-last-score").textContent = scoreText(result.lastResult);
      find(".prize-best-score").textContent = scoreText(result.bestResult);
      if (result.opened) showOpened();
      if (lastCelebratedRound === result.roundNumber) return;
      lastCelebratedRound = result.roundNumber;
      notice.classList.add("is-visible");
      notice.replaceChildren(icon("pixel-heart"), document.createTextNode(`${text.unlocked} · ${scoreText(result.lastResult)} puntos`));
      animate(notice, [{ opacity: 0, transform: "translateY(6px) scale(.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], 400);
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => { notice.classList.remove("is-visible"); notice.replaceChildren(); }, 4200);
    }

    function onPartChange(event) {
      if (event.detail.currentPart === 5) updateResult();
      else {
        clearTimeout(noticeTimer);
        notice.classList.remove("is-visible");
        notice.replaceChildren();
      }
    }
    document.addEventListener("adventure:partchange", onPartChange);
    return () => { clearTimeout(noticeTimer); document.removeEventListener("adventure:partchange", onPartChange); };
  };
  window.Aventura.registerPart5(window.PrizePartRenderer);
})();
