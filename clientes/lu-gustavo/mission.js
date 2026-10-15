/* Edita aquí el regalo. La respuesta SIEMPRE se guarda localmente; los dos últimos
   campos quedan reservados para una futura integración autorizada, sin envío actual. */
const missionConfig = {
  giftTitle: "REGALO SORPRESA",
  giftDescription: "DESCRIPCIÓN DEL REGALO",
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
  const symbols = ["✧", "⌛", "✦", "♫"];
  const success = ["El hipogrifo acepta tu respeto. El camino continúa.", "Hay momentos que merecen vivirse más de una vez.", "Tu recuerdo feliz ha iluminado el camino."];
  const art = {
    feather: '<svg viewBox="0 0 200 140" aria-hidden="true"><path d="M45 110Q40 30 125 18Q175 25 155 70Q120 115 45 110Z"/><path d="M28 130 139 35M59 102 63 65M85 78 123 80M104 58 108 37"/></svg>',
    time: '<svg viewBox="0 0 200 140" aria-hidden="true"><ellipse cx="100" cy="70" rx="87" ry="52"/><ellipse cx="100" cy="70" rx="55" ry="65"/><g class="mission-hourglass"><path d="M74 28H126M74 112H126M80 30Q80 53 100 70Q120 87 120 110M120 30Q120 53 100 70Q80 87 80 110"/><path d="m87 43 13 17 13-17M86 105l14-21 14 21Z"/></g><circle cx="100" cy="70" r="3"/></svg>',
    guardian: '<svg viewBox="0 0 240 160" aria-hidden="true"><path d="M25 119Q52 40 100 69Q120 13 146 69Q196 35 218 119Q171 90 146 121L122 146 96 120Q55 93 25 119Z"/><path d="M45 104Q86 81 122 130Q163 78 201 105M77 82l45 48 46-50M122 41v89"/></svg>',
    ticket: '<svg viewBox="0 0 220 150" aria-hidden="true"><rect x="25" y="35" width="170" height="100" rx="10"/><path d="m25 45 85 58 85-58M25 135l57-50m113 50-57-50"/><path d="m110 18 4 11 12 4-12 4-4 11-4-11-12-4 12-4Z"/></svg>',
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
    card.append(heading, hint, button); parent.append(card);
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
      const shell = node("div", "", "mission-shell");
      if (reviewMode) shell.append(node("p", "Modo de revisión temporal · Progreso de prueba independiente", "mission-kicker"));
      shell.append(node("p", "Gus + Lu · La aventura continúa", "mission-kicker"));
      const screen = node("div", "", "mission-screen");
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
      screen.append(illustration("ticket")); title(screen, "Una nueva misión");
      screen.append(node("p", "La primera aventura ha terminado, pero la magia de nuestra historia apenas comienza. Hay un secreto escondido entre los recuerdos de Hogwarts… y solo tú puedes descubrirlo."), node("p", "¿Juras solemnemente que tus intenciones no son buenas?", "mission-question"));
      screen.append(button("Juro que mis intenciones no son buenas", () => { progress.enter(); render(true); }));
    }
    function map(screen, state) {
      const nav = node("nav", "", "mission-map"); nav.setAttribute("aria-label", "Recorrido de las cuatro pruebas");
      const line = node("div", "", "mission-trail"); line.setAttribute("aria-hidden", "true");
      const segments = ["M50 39Q95 39 150 79", "M150 79Q205 79 250 39", "M250 39Q295 39 350 79"];
      line.innerHTML = `<svg viewBox="0 0 400 130" preserveAspectRatio="none">${segments.map((d, i) => `<path d="${d}" class="${state.completed > i ? "is-lit" : ""}"/>`).join("")}</svg>`;
      nav.append(line);
      const list = node("ol");
      titles.forEach((label, index) => {
        const step = index + 1, done = step <= state.completed;
        const item = node("li", "", done ? "is-done" : "");
        const visit = button(`${symbols[index]} ${step}`, () => { if (progress.visit(step)) { words = []; render(true); } }, "mission-station-button");
        visit.disabled = !progress.canVisit(step);
        visit.setAttribute("aria-label", `Prueba ${step}: ${label}${done ? ", completada" : visit.disabled ? ", bloqueada" : ""}`);
        if (step === state.stage) visit.setAttribute("aria-current", "step");
        item.append(visit, node("span", ["Respeto", "Tiempo", "Luz", "Secreto"][index]));
        if (done) { const feet = node("i", "", "mission-footprints"); feet.setAttribute("aria-hidden", "true"); item.append(feet); }
        list.append(item);
      });
      nav.append(list); screen.append(nav);
      const count = node("p", `Prueba ${state.stage} de 4`, "mission-counter"); count.setAttribute("role", "status"); screen.append(count);
      const meter = node("progress"); meter.max = 4; meter.value = state.completed; meter.setAttribute("aria-label", `${state.completed} de 4 pruebas completadas`); screen.append(meter);
    }
    function station(screen, state) {
      const card = node("article", "", "mission-parchment"); screen.append(card);
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
        card.append(node("div", "✦", "mission-unlit-star"), node("p", "Cuando la oscuridad se acerca, un recuerdo feliz puede iluminarlo todo. ¿Qué hechizo invoca un guardián de luz?"));
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
      title(screen, "¡Misión cumplida, mago! ⚡");
      const gift = node("article", "", "mission-gift");
      const imageSrc = String(missionConfig.giftImage || "");
      if (/^(https:\/\/|\.\/)/.test(imageSrc)) {
        const image = node("img"); image.alt = missionConfig.giftTitle; image.src = imageSrc;
        image.addEventListener("error", () => image.replaceWith(illustration("ticket")), { once: true }); gift.append(image);
      } else gift.append(illustration("ticket"));
      gift.append(node("p", missionConfig.eventDate, "mission-kicker"), node("h3", missionConfig.giftTitle), node("p", missionConfig.giftDescription));
      screen.append(gift);
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
        const paragraph = node("p"); paragraph.append(node([2, 4, 5, 7].includes(index) ? "strong" : "span", text)); letter.append(paragraph);
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
