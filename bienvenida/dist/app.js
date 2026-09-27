(() => {
  "use strict";

  const config = window.COUPLE_CONFIG;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const welcome = document.getElementById("welcome");
  const nextPart = document.getElementById("next-part");
  const partThree = document.getElementById("part-three");
  const partFour = document.getElementById("part-four");
  const partFive = document.getElementById("part-five");
  const partSix = document.getElementById("part-six");
  const partSeven = document.getElementById("part-seven");
  const startButton = document.getElementById("start-button");
  const particles = document.getElementById("heart-particles");
  const status = document.getElementById("screen-reader-status");
  const activeAnimations = new Set();
  const prizeState = window.PrizeTools.createPrizeState();
  const state = { currentPart: 1, isTransitioning: false, part2Completed: false, part3Completed: false, highestUnlocked: 1, finished: false };
  const sections = { 1: welcome, 2: nextPart, 3: partThree, 4: partFour, 5: partFive, 6: partSix, 7: partSeven };
  const mounted = new Set([1]);
  const cleanups = new Map();
  let part2Renderer = null; // part2.js registra el calendario antes de la interacción.
  let part3Renderer = null; // part3.js registra la colección de recuerdos.
  let part4Renderer = null; // part4.js registra el Laberinto del amor.
  let part5Renderer = null;
  let part6Renderer = renderPart6Placeholder;
  let part7Renderer = null; // part7-final.js registra la celebración final.

  // Iconos vectoriales locales: no dependen de fuentes, emojis ni de Internet.
  function icon(name, className = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (className) svg.setAttribute("class", className);
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${name}`);
    use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${name}`);
    svg.append(use);
    return svg;
  }

  function renderText(element, text) {
    const icons = { "❤": "heart-filled", "❤️": "heart-filled", "→": "arrow-right", "←": "arrow-left", "↗": "arrow-up-right" };
    element.replaceChildren();
    String(text).split(/(❤\uFE0F?|→|←|↗)/u).forEach((piece) => {
      element.append(icons[piece] ? icon(icons[piece], "inline-icon") : document.createTextNode(piece));
    });
  }

  document.title = config.text.pageTitle;
  document.querySelector('meta[name="description"]').content = config.text.message;
  document.querySelectorAll("[data-text]").forEach((element) => {
    const value = config.text[element.dataset.text];
    if (typeof value === "string") renderText(element, value);
  });
  document.getElementById("her-name").textContent = config.names.her;
  document.getElementById("his-name").textContent = config.names.him;

  const heading = document.getElementById("welcome-title");
  const { title, titleAccent } = config.text;
  heading.textContent = title;
  if (titleAccent && title.endsWith(titleAccent)) {
    const accent = document.createElement("em");
    accent.textContent = titleAccent;
    heading.replaceChildren(document.createTextNode(title.slice(0, -titleAccent.length)), accent);
  }

  // La imagen conserva sus proporciones. El reservado también cubre rutas rotas.
  const photo = document.getElementById("couple-photo");
  const placeholder = document.getElementById("photo-placeholder");
  photo.alt = config.photo.alt;
  photo.style.objectFit = config.photo.fit === "cover" ? "cover" : "contain";
  photo.style.objectPosition = config.photo.position;
  const showPhoto = () => {
    const loaded = photo.naturalWidth > 0;
    photo.hidden = !loaded;
    placeholder.hidden = loaded;
  };
  photo.addEventListener("load", showPhoto);
  photo.addEventListener("error", () => {
    photo.hidden = true;
    placeholder.hidden = false;
  });
  if (config.photo.src) {
    photo.src = config.photo.src;
    if (photo.complete) showPhoto();
  }

  function updateProgress() {
    document.getElementById("progress-label").textContent = `Parte ${state.currentPart} de ${config.totalParts}`;
    const steps = document.getElementById("progress-steps");
    steps.replaceChildren();
    for (let part = 1; part <= config.totalParts; part += 1) {
      const step = document.createElement("li");
      step.className = "progress-step";
      const label = document.createElement("span");
      label.className = "sr-only";
      label.textContent = `Parte ${part}${part > state.highestUnlocked ? ": bloqueada" : ""}`;
      step.append(label);
      if (part === state.currentPart) step.setAttribute("aria-current", "step");
      if (part < state.currentPart) step.classList.add("completed");
      // Terminada la aventura, cada punto del progreso lleva a su parte.
      if (state.finished && part !== state.currentPart) {
        const jump = document.createElement("button");
        jump.type = "button";
        jump.className = "progress-jump";
        jump.setAttribute("aria-label", `Ir a la parte ${part}`);
        jump.title = `Ir a la parte ${part}`;
        jump.addEventListener("click", () => goToPart(part));
        step.classList.add("is-jump");
        step.append(jump);
      }
      steps.append(step);
    }
  }

  async function animate(element, keyframes, duration) {
    if (reducedMotion.matches || typeof element.animate !== "function") return;
    const animation = element.animate(keyframes, { duration, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" });
    activeAnimations.add(animation);
    try { await animation.finished; } catch { /* Cancelar por movimiento reducido es válido. */ }
    finally { activeAnimations.delete(animation); animation.cancel(); }
  }

  function releaseHearts(target = particles) {
    if (reducedMotion.matches) return;
    target.replaceChildren();
    const positions = [ [-106, -67, -24], [-66, -103, 14], [-23, -82, -15], [29, -116, 17], [71, -83, -12], [109, -54, 27] ];
    positions.forEach(([x, y, rotation], index) => {
      const particle = document.createElement("span");
      particle.className = "heart-particle";
      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      particle.style.setProperty("--rotation", `${rotation}deg`);
      particle.style.setProperty("--scale", String(index % 2 ? 1 : .75));
      particle.style.setProperty("--particle-color", index % 2 ? "#b62d51" : "#d88b9f");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#pixel-heart");
      svg.append(use);
      particle.append(svg);
      target.append(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    });
  }

  function completePart2() {
    state.part2Completed = true;
    state.highestUnlocked = Math.max(state.highestUnlocked, 3);
    updateProgress();
  }

  function renderPart6Placeholder(container) {
    const step = document.createElement("p");
    step.className = "memory-step";
    step.textContent = `Parte 6 de ${config.totalParts}`;
    const title = document.createElement("h2");
    title.id = "part-six-title";
    title.textContent = config.text.nextTitle;
    const message = document.createElement("p");
    message.textContent = config.text.nextMessage;
    const back = document.createElement("button");
    back.type = "button";
    back.className = "secondary-button icon-button";
    back.append(icon("arrow-left"), document.createTextNode(config.prize.text.nextBackButton));
    back.addEventListener("click", goToPart5);
    container.replaceChildren(step, icon("pixel-heart", "next-emblem"), title, message, back);
  }

  function getPrizeState() { return prizeState.snapshot(); }
  function openPrize() {
    if (state.currentPart !== 5) return false;
    const opened = prizeState.open();
    if (opened) { state.highestUnlocked = Math.max(state.highestUnlocked, 6); updateProgress(); }
    return opened;
  }

  // El juego llama esta función UNA VEZ al terminar, incluso con cero puntos.
  function completeGame(result) {
    if (state.currentPart !== 4 || state.isTransitioning) return Promise.resolve(false);
    prizeState.finish(result);
    state.highestUnlocked = Math.max(state.highestUnlocked, 5);
    updateProgress();
    return goToPart5();
  }

  function unmount(part) {
    const cleanup = cleanups.get(part);
    if (cleanup) cleanup();
    cleanups.delete(part);
    mounted.delete(part);
  }

  function restartGame() {
    if (state.currentPart !== 5 || state.isTransitioning || !getPrizeState().opened) return Promise.resolve(false);
    // Reinicia únicamente el juego. Los recuerdos, el récord y el regalo se conservan.
    unmount(4);
    return goToPart4();
  }

  function rendererContext() {
    return { config, goToWelcome, goToPart2, goToPart3, goToPart4, goToPart5, goToPart6, goToPart7, goToPart,
      isFinished: () => state.finished,
      completePart2, completePart3, completeGame, restartGame, getPrizeState, openPrize,
      isPart2Completed: () => state.part2Completed,
      isPart2Visible: () => state.currentPart === 2,
      icon, renderText, animate, celebrate: releaseHearts,
    };
  }

  function completePart3() {
    state.part3Completed = true;
    state.highestUnlocked = Math.max(state.highestUnlocked, 4);
    updateProgress();
  }

  async function changePart(targetPart) {
    if (!sections[targetPart] || state.isTransitioning || state.currentPart === targetPart) return false;
    // También bloquea intentos programáticos de saltarse la tarjeta.
    // Al terminar la aventura se puede saltar libremente a cualquier parte.
    if (!state.finished) {
      if (targetPart === 3 && (!state.part2Completed || ![2, 4].includes(state.currentPart))) return false;
      if (targetPart === 4 && (!state.part3Completed || ![3, 5].includes(state.currentPart))) return false;
      if (targetPart === 4 && state.currentPart === 5 && !getPrizeState().opened) return false;
      if (targetPart === 5 && (!getPrizeState().unlocked || ![4, 6].includes(state.currentPart))) return false;
      if (targetPart === 6 && (!getPrizeState().opened || ![5, 7].includes(state.currentPart))) return false;
      if (targetPart === 7 && state.currentPart !== 6) return false;
    }
    state.isTransitioning = true; // Evita avances duplicados por toques rápidos.
    startButton.disabled = true;
    const outgoing = sections[state.currentPart];
    const incoming = sections[targetPart];
    outgoing.setAttribute("aria-busy", "true");
    outgoing.inert = true;

    try {
      if (targetPart === 2 && state.currentPart === 1) {
        releaseHearts();
        await animate(startButton, [
          { transform: "translateY(0) scale(1)" },
          { transform: "translateY(4px) scale(.97)", offset: .35 },
          { transform: "translateY(-2px) scale(1.025)", offset: .7 },
          { transform: "translateY(0) scale(1)" },
        ], 440);
      }
      // Monta una vez: conservar el DOM mantiene la fecha revelada al volver.
      if (!mounted.has(targetPart)) {
        const renderer = { 2: part2Renderer, 3: part3Renderer, 4: part4Renderer, 5: part5Renderer, 6: part6Renderer, 7: part7Renderer }[targetPart];
        const cleanup = await renderer(incoming, rendererContext());
        if (typeof cleanup === "function") cleanups.set(targetPart, cleanup);
        mounted.add(targetPart);
      }
      await animate(outgoing, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-10px)" }], 240);
      outgoing.hidden = true;
      outgoing.removeAttribute("aria-busy");
      incoming.hidden = false;
      if (targetPart === 1) welcome.classList.add("revisited");
      state.currentPart = targetPart;
      state.highestUnlocked = Math.max(state.highestUnlocked, targetPart);
      if (targetPart === 7) state.finished = true;
      updateProgress();
      particles.replaceChildren();
      document.dispatchEvent(new CustomEvent("adventure:partchange", { detail: { currentPart: targetPart } }));

      // En móvil, evita que el nuevo contenido aparezca fuera de la pantalla.
      if (window.scrollY > incoming.offsetTop) window.scrollTo({ top: Math.max(0, incoming.offsetTop - 25), behavior: "instant" });
      const focusTarget = incoming.querySelector("h1, h2");
      if (focusTarget) { focusTarget.tabIndex = -1; focusTarget.focus({ preventScroll: true }); }
      await animate(incoming, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], 320);
      status.textContent = `Parte ${targetPart} de ${config.totalParts}`;
      return true;
    } catch (error) {
      // Una futura parte con errores nunca debe bloquear el botón de bienvenida.
      status.textContent = "No pudimos abrir la siguiente parte. Inténtalo de nuevo.";
      console.error("No se pudo cambiar de parte:", error);
      return false;
    } finally {
      outgoing.removeAttribute("aria-busy");
      outgoing.inert = false;
      particles.replaceChildren();
      state.isTransitioning = false;
      startButton.disabled = false;
    }
  }

  function goToPart2() { return changePart(2); }
  function goToPart3() { return changePart(3); }
  function goToPart4() { return changePart(4); }
  function goToPart5() { return changePart(5); }
  function goToPart6() { return changePart(6); }
  function goToPart7() { return changePart(7); }
  function goToPart(part) { return changePart(Number(part)); }
  function goToWelcome() { return changePart(1); }

  // API compartida: el juego entrega su resultado al reclamar el premio.
  window.Aventura = Object.freeze({
    get currentPart() { return state.currentPart; },
    get isTransitioning() { return state.isTransitioning; },
    get part2Completed() { return state.part2Completed; },
    get part3Completed() { return state.part3Completed; },
    goToPart2,
    goToPart3,
    goToPart4,
    goToPart5,
    goToPart6,
    goToPart7,
    goToPart,
    get finished() { return state.finished; },
    completeGame,
    restartGame,
    getPrizeState,
    goToWelcome,
    registerPart2(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart2 requiere una función.");
      const previous = part2Renderer;
      part2Renderer = renderer;
      mounted.delete(2);
      return previous;
    },
    registerPart3(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart3 requiere una función.");
      const previous = part3Renderer;
      part3Renderer = renderer;
      mounted.delete(3);
      return previous;
    },
    registerPart4(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart4 requiere una función.");
      unmount(4);
      part4Renderer = renderer;
    },
    registerPart5(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart5 requiere una función.");
      unmount(5);
      part5Renderer = renderer;
    },
    registerPart7(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart7 requiere una función.");
      unmount(7);
      part7Renderer = renderer;
    },
    registerPart6(renderer) {
      if (typeof renderer !== "function") throw new TypeError("registerPart6 requiere una función.");
      unmount(6);
      part6Renderer = renderer;
    },
  });

  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    for (const animation of activeAnimations) animation.cancel();
    document.querySelectorAll(".heart-particles").forEach((layer) => layer.replaceChildren());
  });
  startButton.addEventListener("click", goToPart2);
  updateProgress();
})();
