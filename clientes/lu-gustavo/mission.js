/* El cierre es la nota de Lu. Campos del regalo vacíos para conservar la sorpresa.
   La respuesta SIEMPRE se guarda localmente; los dos últimos
   campos quedan reservados para una futura integración autorizada, sin envío actual. */
const missionConfig = {
  giftTitle: "",
  giftDescription: "",
  giftImage: "",
  eventDate: "Febrero de 2027",
  saveWrittenAnswer: false,
  answerWebhook: ""
};

(() => {
  "use strict";
  // Acceso temporal de revisión. Quitar este modo cuando termine la revisión.
  const reviewMode = new URLSearchParams(window.location.search).get("revision") === "mision";
  let storage = null;
  try { storage = window.localStorage; } catch { /* La misión funciona en memoria. */ }
  const missionStorage = reviewMode && storage ? {
    getItem: (key) => storage.getItem(`${key}-revision`),
    setItem: (key, value) => storage.setItem(`${key}-revision`, value),
  } : storage;
  const progress = window.MissionState.create(missionStorage);
  const titles = ["La prueba del hipogrifo", "El misterio del tiempo", "El encantamiento protector", "El secreto final"];
  const stationIcons = [
    '<path d="M5 19C3 10 8 3 19 3c3 8-2 14-14 16Zm-2 2L17 6M8 16v-5m4 1h5"/>',
    '<path d="M6 3h12M6 21h12M7 3c0 5 2 6 5 9-3 3-5 4-5 9M17 3c0 5-2 6-5 9 3 3 5 4 5 9M9 6h6m-6 12h6"/>',
    '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m4 3 1 2m14 14 2 2"/>',
    '<path d="M8 18V7l11-3v11M8 10l11-3"/><ellipse cx="5" cy="18" rx="3" ry="2"/><ellipse cx="16" cy="15" rx="3" ry="2"/>',
  ];
  const success = ["El hipogrifo acepta tu respeto. El camino continúa.", "Hay momentos que merecen vivirse más de una vez.", "Tu recuerdo feliz ha iluminado el camino."];
  const art = {
    feather: '<svg viewBox="0 0 240 190" aria-hidden="true"><circle class="art-orbit" cx="120" cy="95" r="73"/><circle class="art-fine" cx="120" cy="95" r="63" stroke-dasharray="1 8"/><path class="art-fill" d="M72 142C58 100 99 36 173 29c14 48-27 99-101 113Z"/><path d="M54 165 167 40M77 138l-2-35m13 23 36-7m-23-8-3-37m15 24 37-11m-23-4-3-27m13 17 28-11m-17-1V44"/><path class="art-fine" d="M75 139c5-29 32-67 79-94M83 143c36-9 66-32 79-67"/><path class="art-spark" d="m47 57 3 8 8 3-8 3-3 8-3-8-8-3 8-3Zm146 62 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/><circle cx="187" cy="74" r="2"/><circle cx="64" cy="93" r="1.5"/></svg>',
    time: '<svg viewBox="0 0 240 190" aria-hidden="true"><circle class="art-orbit" cx="120" cy="95" r="76"/><circle class="art-fine" cx="120" cy="95" r="68" stroke-dasharray="1 8"/><ellipse class="art-fine" cx="120" cy="95" rx="99" ry="36" transform="rotate(-25 120 95)"/><path class="art-fine" d="m120 12 4 6-4 6-4-6Zm0 154 4 6-4 6-4-6ZM38 92v6m164-6v6"/><g class="mission-hourglass"><path class="art-fill" d="M93 48h54c0 22-3 32-27 47 24 15 27 25 27 47H93c0-22 3-32 27-47-24-15-27-25-27-47Z"/><path d="M88 43h64v6H88Zm0 99h64v6H88ZM89 54v82m62-82v82"/><path class="art-sand" d="M100 63h40c-4 12-12 18-20 24-8-6-16-12-20-24Zm1 72 19-23 19 23Z"/><path d="M120 94v10" stroke-dasharray="1 3"/></g><circle cx="36" cy="120" r="3"/><circle cx="199" cy="53" r="3"/></svg>',
    guardian: '<svg viewBox="0 0 280 200" aria-hidden="true"><circle class="art-orbit" cx="140" cy="96" r="79"/><circle class="art-fine" cx="140" cy="96" r="63" stroke-dasharray="2 9"/><path class="guardian-wings" d="M140 162C91 140 38 123 24 48c36 19 65 4 94 46l22-63 22 63c29-42 58-27 94-46-14 75-67 92-116 114Z"/><path d="M140 162c-34-43-65-30-95-88 47 23 58 34 95 88Zm0 0c34-43 65-30 95-88-47 23-58 34-95 88ZM140 47v115m-19-64 19 21 19-21m-25-22 6 8 6-8"/><path class="art-spark" d="m140 175 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM32 140l2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm216-1 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></svg>',
    light: '<svg viewBox="0 0 240 190" aria-hidden="true"><circle class="art-orbit" cx="120" cy="95" r="65"/><circle class="art-fine" cx="120" cy="95" r="51" stroke-dasharray="1 7"/><path class="art-fill" d="m120 46 13 36 36 13-36 13-13 36-13-36-36-13 36-13Z"/><path d="m120 70 6 19 19 6-19 6-6 19-6-19-19-6 19-6Z"/><path class="art-fine" d="m67 42 9 9m88 88 9 9m0-104-9 9m-88 88-9 9M120 18v10m0 134v10M43 95h10m134 0h10"/></svg>',
    ticket: '<svg viewBox="0 0 260 190" aria-hidden="true"><circle class="art-orbit" cx="130" cy="94" r="79"/><path class="art-fill" d="M39 61h182v113H39Z"/><path d="m39 61 91 71 91-71M39 174l64-64m118 64-64-64"/><path class="art-fine" d="M47 69h166M47 166l52-46m114 46-52-46"/><circle class="art-seal" cx="130" cy="126" r="19"/><circle class="art-fine" cx="130" cy="126" r="14"/><path d="m130 117 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/><path class="art-spark" d="m130 19 4 10 10 4-10 4-4 10-4-10-10-4 10-4Zm78 19 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/></svg>',
    seal: '<svg viewBox="0 0 120 120" aria-hidden="true"><path class="art-seal" d="m60 6 10 5 12-1 7 10 11 5 2 12 7 10-4 12 2 12-9 9-4 12-12 3-9 8-12-3-12 3-9-8-12-3-4-12-9-9 2-12-4-12 7-10 2-12 11-5 7-10 12 1Z"/><circle cx="60" cy="56" r="31"/><circle class="art-fine" cx="60" cy="56" r="26"/><path d="M43 56c-9-13 7-23 17-10 10-13 26-3 17 10L60 74Z"/><path class="art-fine" d="M42 94v19l18-10 18 10V94"/></svg>',
  };
  function unlock() {
    const changed = progress.unlock();
    if (changed) document.dispatchEvent(new CustomEvent("mission:unlocked"));
    refreshEntries();
    return changed;
  }
  function attachEntry(parent, navigate, resume = false) {
    const card = document.createElement("aside");
    card.className = "mission-entry"; card.hidden = !progress.snapshot().unlocked;
    const heading = document.createElement("h3"); heading.textContent = resume ? "Nuestra aventura continúa" : "Nueva misión desbloqueada";
    const hint = document.createElement("p"); hint.textContent = "Un camino de luz, recuerdos y un secreto por descubrir.";
    const button = document.createElement("button"); button.type = "button"; button.className = "primary-button";
    button.textContent = resume ? "Continuar la misión mágica" : "Comenzar la nueva aventura";
    button.addEventListener("click", () => navigate(8));
    const emblem = document.createElement("div"); emblem.className = "mission-entry-emblem"; emblem.setAttribute("aria-hidden", "true"); emblem.innerHTML = art.ticket;
    card.append(emblem, heading, hint, button); parent.append(card);
    return card;
  }
  function refreshEntries() { document.querySelectorAll(".mission-entry").forEach((card) => { card.hidden = !progress.snapshot().unlocked; }); }
  window.MagicMission = Object.freeze({ progress, unlock, attachEntry, config: missionConfig });

  window.Aventura.registerPart8((container, context) => {
    let words = [];
    const node = (tag, value, className) => {
      const el = document.createElement(tag);
      if (value) el.textContent = value;
      if (className) el.className = className;
      return el;
    };
    const button = (label, action, className = "primary-button") => {
      const el = node("button", label, className); el.type = "button"; el.addEventListener("click", action); return el;
    };
    function feedback(message, good = false) {
      const output = container.querySelector(".mission-feedback");
      output.textContent = message; output.classList.toggle("is-success", good);
    }
    function illustration(kind) { const el = node("div", "", `mission-art mission-art-${kind}`); el.innerHTML = art[kind]; return el; }
    function render(focus = false) {
      const state = progress.snapshot();
      if (!state.unlocked) return;
      container.replaceChildren();
      const scene = !state.entered ? "welcome" : state.revealed ? "finale" : "journey";
      const shell = node("div", "", `mission-shell mission-scene-${scene}`);
      if (reviewMode) container.append(node("p", "Modo de revisión temporal · Progreso de prueba independiente", "mission-review-note"));
      shell.append(node("p", "Gus + Lu · La aventura continúa", "mission-kicker"));
      const screen = node("div", "", `mission-screen mission-${scene}`);
      shell.append(screen);
      const warning = node("p", "Este navegador no permite guardar el progreso. Mantén esta pestaña abierta para continuar.", "mission-storage-notice");
      warning.hidden = progress.persisted; shell.append(warning);
      shell.append(button("← Volver a nuestra celebración", () => context.goToPart7(), "text-button mission-back"));
      container.append(shell);
      if (!state.entered) welcome(screen);
      else if (state.revealed) finale(screen, state);
      else {
        map(screen, state);
        station(screen, state);
      }
      if (focus) {
        const target = screen.querySelector("h2"); target?.focus({ preventScroll: true });
        container.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }
    function title(parent, text) { const heading = node("h2", text); heading.tabIndex = -1; heading.id = "magic-mission-title"; parent.append(heading); }
    function welcome(screen) {
      const scene = node("div", "", "mission-portal");
      const image = node("img"); image.src = "./assets/mission-observatory.svg"; image.alt = ""; image.width = 520; image.height = 600; scene.setAttribute("aria-hidden", "true"); scene.append(image);
      const copy = node("div", "", "mission-invitation");
      copy.append(node("p", "Un secreto entre las estrellas", "mission-eyebrow")); title(copy, "Una nueva misión");
      copy.append(node("p", "La primera aventura ha terminado, pero la magia de nuestra historia apenas comienza. Hay un secreto escondido entre los recuerdos de Hogwarts… y solo tú puedes descubrirlo."), node("p", "¿Juras solemnemente que tus intenciones no son buenas?", "mission-question"));
      copy.append(button("Juro que mis intenciones no son buenas", () => { progress.enter(); render(true); }));
      screen.append(scene, copy);
    }
    function map(screen, state) {
      const nav = node("nav", "", "mission-map"); nav.setAttribute("aria-label", "Recorrido de las cuatro pruebas");
      const label = node("p", "El mapa de nuestra aventura", "mission-map-title"); nav.append(label);
      const route = node("div", "", "mission-route");
      const line = node("div", "", "mission-trail"); line.setAttribute("aria-hidden", "true");
      const segments = ["M50 39Q95 39 150 79", "M150 79Q205 79 250 39", "M250 39Q295 39 350 79"];
      line.innerHTML = `<svg viewBox="0 0 400 130" preserveAspectRatio="none">${segments.map((d, i) => `<path d="${d}" class="${state.completed > i ? "is-lit" : ""}"/>`).join("")}</svg>`;
      route.append(line);
      const list = node("ol");
      titles.forEach((label, index) => {
        const step = index + 1, done = step <= state.completed;
        const item = node("li", "", done ? "is-done" : step === state.stage ? "is-current" : "");
        const visit = button("", () => { if (progress.visit(step)) { words = []; render(true); } }, "mission-station-button");
        visit.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${stationIcons[index]}</svg>`;
        visit.disabled = !progress.canVisit(step);
        visit.setAttribute("aria-label", `Prueba ${step}: ${label}${done ? ", completada" : visit.disabled ? ", bloqueada" : ""}`);
        if (step === state.stage) visit.setAttribute("aria-current", "step");
        const caption = node("span", ["Respeto", "Tiempo", "Luz", "Secreto"][index], "mission-station-label");
        item.append(visit, caption);
        if (done) { const feet = node("i", "", "mission-footprints"); feet.setAttribute("aria-hidden", "true"); item.append(feet); }
        list.append(item);
      });
      route.append(list); nav.append(route); screen.append(nav);
      const count = node("p", `Prueba ${state.stage} de 4`, "mission-counter"); count.setAttribute("role", "status"); screen.append(count);
      const meter = node("progress"); meter.max = 4; meter.value = state.completed; meter.setAttribute("aria-label", `${state.completed} de 4 pruebas completadas`); screen.append(meter);
    }
    function station(screen, state) {
      const card = node("article", "", `mission-parchment mission-trial-${state.stage}`); screen.append(card);
      title(card, titles[state.stage - 1]);
      const output = node("p", "", "mission-feedback"); output.setAttribute("role", "status"); output.setAttribute("aria-live", "polite");
      if (state.completed >= state.stage && state.stage < 4) {
        card.append(illustration(["feather", "time", "guardian"][state.stage - 1]));
        if (state.stage === 2) card.append(node("blockquote", state.answer));
        card.append(node("p", success[state.stage - 1], "mission-success"));
        card.append(button("Continuar el camino →", () => { if (progress.visit(state.stage + 1)) { words = []; render(true); } }));
        return;
      }
      if (state.stage === 1) {
        card.append(illustration("feather"), node("p", "Tengo alas, garras y mucho orgullo. Antes de acercarte, tendrás que demostrar que mereces mi respeto. ¿Qué debes hacer?"));
        const answers = node("div", "", "mission-answers");
        ["Acercarme rápidamente.", "Hacer una reverencia.", "Pronunciar un hechizo."].forEach((answer) => {
          answers.append(button(answer, () => { if (progress.bow(answer.slice(0, -1))) render(true); else feedback("Con calma: el respeto abre más caminos que la prisa. Puedes intentarlo otra vez."); }, "secondary-button"));
        }); card.append(answers);
      } else if (state.stage === 2) {
        card.append(illustration("time"), node("p", "Giro sobre mi cuello y las horas puedo cambiar. Si pudieras volver a un instante de nuestra historia, ¿cuál te gustaría revivir?"));
        const form = node("form"), label = node("label", "El recuerdo que volverías a vivir…"); label.htmlFor = "mission-answer";
        const input = node("textarea"); input.id = "mission-answer"; input.name = "writtenAnswer"; input.required = true; input.maxLength = 4000; input.rows = 5; input.value = state.answer;
        const submit = node("button", "Guardar este recuerdo", "primary-button"); submit.type = "submit"; submit.disabled = !input.value.trim();
        input.addEventListener("input", () => { submit.disabled = !input.value.trim(); });
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          if (progress.saveAnswer(input.value)) {
            // Punto de extensión local. No realiza fetch, navegación ni envíos a WhatsApp.
            container.dispatchEvent(new CustomEvent("mission:answer-saved", { detail: { answer: progress.snapshot().answer } }));
            render(true);
          } else feedback("Escribe un recuerdo antes de continuar.");
        });
        const privacy = node("p", "Tu respuesta se guarda solo en este navegador.", "mission-local-note");
        form.append(label, input, privacy, submit); card.append(form);
      } else if (state.stage === 3) {
        card.append(illustration("light"), node("p", "Cuando la oscuridad se acerca, un recuerdo feliz puede iluminarlo todo. ¿Qué hechizo invoca un guardián de luz?"));
        const selection = node("p", "Elige las palabras en el orden correcto", "mission-spell"); selection.setAttribute("aria-live", "polite");
        const choices = node("div", "", "mission-word-choices");
        ["Lumos", "Patronum", "Accio", "Expecto"].forEach((word) => choices.append(button(word, () => {
          if (words.length >= 2) { feedback("Borra las palabras para probar otra combinación."); return; }
          words.push(word); selection.textContent = words.join(" ");
        }, "secondary-button")));
        card.append(selection, choices, button("Borrar palabras", () => { words = []; selection.textContent = "Elige las palabras en el orden correcto"; feedback(""); }, "text-button"), button("Invocar al guardián", () => {
          if (progress.spell(words.join(" "))) { words = []; render(true); }
          else feedback("Todavía no brilla. Prueba otra combinación; tu recuerdo feliz te acompaña.");
        }));
      } else {
        card.append(node("p", "Una historia que conoces de memoria volverá a cobrar vida. Esta vez, la magia no solo se verá: también se escuchará. Cientos de notas acompañarán cada aventura… ¿qué sorpresa te espera?"));
        card.append(node("p", "Toca las notas iluminadas para llegar al sobre.", "mission-local-note"));
        const notes = node("div", "", "mission-notes"); notes.setAttribute("role", "group"); notes.setAttribute("aria-label", "Camino de cinco notas musicales");
        for (let i = 0; i < 5; i += 1) {
          const note = button(["♪", "♫", "♩", "♬", "♪"][i], () => {
            if (progress.note(i)) {
              render(false);
              container.querySelector(".mission-note:not(:disabled), .mission-parchment .primary-button")?.focus({ preventScroll: true });
            }
          }, "mission-note");
          note.disabled = i !== state.notes || state.completed === 4;
          note.classList.toggle("is-lit", i < state.notes);
          note.setAttribute("aria-label", `Nota ${i + 1}${i < state.notes ? ", iluminada" : ""}`);
          notes.append(note);
        }
        card.append(notes, illustration("ticket"));
        if (state.notes === 5) card.append(button("Descubrir la sorpresa", () => { if (progress.reveal()) render(true); }));
        else {
          const active = notes.querySelector("button:not(:disabled)");
          // Mantener el foco en el siguiente paso después de cada toque o tecla.
          queueMicrotask(() => { if (state.notes > 0 && container.isConnected) active?.focus({ preventScroll: true }); });
        }
      }
      card.append(output);
    }
    function finale(screen, state) {
      screen.append(illustration("seal"));
      title(screen, "¡Misión cumplida, mago! ⚡");
      // Sin datos explícitos no hay tarjeta adicional: el regalo es esta nota.
      if ([missionConfig.giftTitle, missionConfig.giftDescription, missionConfig.giftImage].some((value) => String(value || "").trim())) {
        const gift = node("article", "", "mission-gift");
        const imageSrc = String(missionConfig.giftImage || "");
        if (/^(https:\/\/|\.\/)/.test(imageSrc)) {
          const image = node("img"); image.alt = missionConfig.giftTitle; image.src = imageSrc;
          image.addEventListener("error", () => image.replaceWith(illustration("ticket")), { once: true }); gift.append(image);
        } else gift.append(illustration("ticket"));
        gift.append(node("p", missionConfig.eventDate, "mission-kicker"), node("h3", missionConfig.giftTitle), node("p", missionConfig.giftDescription));
        screen.append(gift);
      }
      const letter = node("div", "", "mission-final-letter");
      [
        "Has seguido las pistas, superado las pruebas y llegado al final de esta aventura.",
        "Pero la última magia no está en Hogwarts… está en todo lo que todavía nos queda por vivir juntos.",
        `${missionConfig.eventDate} tenemos una cita mágica. 🪄`,
        "Y hay algo que quiero que nunca olvides:",
        "No importa en qué mundo nos encontremos, mi aventura favorita siempre será la que vivo contigo.",
        "Feliz primer aniversario, mi amor.",
        "Con amor,",
        "Tu compañera de aventuras, Lu.",
      ].forEach((text, index) => {
        const paragraph = node("p", "", ["", "", "mission-letter-date", "", "mission-letter-promise", "", "mission-letter-signoff", "mission-letter-signature"][index]); paragraph.append(node([2, 4, 5, 7].includes(index) ? "strong" : "span", text)); letter.append(paragraph);
      });
      screen.append(letter);
      const memory = node("aside", "", "mission-written-memory");
      memory.append(node("h3", "El momento que volverías a vivir…"), node("blockquote", state.answer)); screen.append(memory);
    }
    render();
    const update = (event) => { if (event.detail.currentPart === 8) render(true); };
    document.addEventListener("adventure:partchange", update);
    return () => document.removeEventListener("adventure:partchange", update);
  });
  attachEntry(document.querySelector(".welcome-copy"), window.Aventura.goToPart, true);
  if (reviewMode) {
    unlock();
    void window.Aventura.goToPart(8);
  }
})();
