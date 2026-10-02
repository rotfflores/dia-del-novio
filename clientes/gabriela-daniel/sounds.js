/* Sonidos suaves de caja musical, generados con Web Audio: sin archivos ni conexión. */
(() => {
  "use strict";
  const STORAGE_KEY = "aventura-sonido";
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context = null, master = null, noiseBuffer = null;
  let enabled = true;
  try { enabled = window.localStorage.getItem(STORAGE_KEY) !== "off"; } catch { /* Sin almacenamiento: sonido activado. */ }

  function audio() {
    if (!AudioContextClass) return null;
    if (!context) {
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = .22;
      master.connect(context.destination);
    }
    if (context.state === "suspended") context.resume();
    return context;
  }

  // Una nota con ataque corto y caída suave, como una campanita.
  function note(frequency, at = 0, duration = .35, { type = "sine", volume = .5, glideTo } = {}) {
    const start = context.currentTime + at;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
    // Un armónico muy bajo le da el brillo de caja musical.
    if (type === "sine" && !glideTo) {
      const overtone = context.createOscillator();
      const overtoneGain = context.createGain();
      overtone.frequency.value = frequency * 2;
      overtoneGain.gain.setValueAtTime(0, start);
      overtoneGain.gain.linearRampToValueAtTime(volume * .12, start + .006);
      overtoneGain.gain.exponentialRampToValueAtTime(.0001, start + duration * .6);
      overtone.connect(overtoneGain).connect(master);
      overtone.start(start);
      overtone.stop(start + duration);
    }
  }

  // Roce de papel para voltear cartas.
  function paper(at = 0, duration = .09, volume = .35) {
    if (!noiseBuffer) {
      noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * .2), context.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const start = context.currentTime + at;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1400, start);
    filter.frequency.exponentialRampToValueAtTime(3200, start + duration);
    filter.Q.value = 1.2;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(start);
    source.stop(start + duration + .02);
  }

  // Notas de la escala pentatónica de Do: siempre suenan bien juntas.
  const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98, C7 = 2093;
  const SOUNDS = {
    tap() { note(E6, 0, .16, { volume: .28 }); },
    primary() { note(G5, 0, .3, { volume: .4 }); note(C6, .07, .45, { volume: .4 }); },
    back() { note(C6, 0, .2, { volume: .28 }); note(G5, .06, .3, { volume: .26 }); },
    reveal() { [C6, E6, G6, C7].forEach((f, i) => note(f, i * .06, .5, { volume: .3 })); },
    flip() { paper(); note(A5, .01, .12, { volume: .12 }); },
    match() { [E6, G6, C7].forEach((f, i) => note(f, .08 + i * .07, .55, { volume: .32 })); },
    miss() { note(A5, 0, .22, { type: "triangle", volume: .16 }); note(E5, .1, .32, { type: "triangle", volume: .14 }); },
    win() {
      [C5, E5, G5, C6, E6, G6, C7].forEach((f, i) => note(f, i * .08, .6, { volume: .3 }));
      [C6, E6, G6].forEach((f) => note(f, .64, 1.4, { volume: .22 }));
      [D6, E6, G6, C7].forEach((f, i) => note(f, 1 + i * .09, .4, { volume: .14 }));
    },
    gift() {
      note(C5, 0, .5, { type: "triangle", volume: .18, glideTo: C6 });
      [G6, E6, C7, G6, C7].forEach((f, i) => note(f, .35 + i * .07, .5, { volume: .24 }));
    },
  };

  // Los navegadores solo dejan sonar el audio después de un toque o una tecla. Al primer gesto
  // se crea y "despierta" el contexto de audio con un sonido mudo, para que los juegos suenen
  // aunque sus sonidos nazcan dentro del ciclo del juego y no directamente de un clic.
  function unlock() {
    const ctx = audio();
    if (!ctx) return;
    try {
      // En iPhone, sin esto el interruptor de silencio apaga el sonido de la página.
      if (navigator.audioSession && navigator.audioSession.type !== "playback") navigator.audioSession.type = "playback";
    } catch { /* No disponible: se ignora. */ }
    if (ctx.state !== "running") ctx.resume().catch(() => {});
    if (!unlocked) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.connect(ctx.destination); source.start(0);
      unlocked = true;
    }
  }
  let unlocked = false;
  ["pointerdown", "touchend", "keydown", "click"].forEach((type) => document.addEventListener(type, unlock, { capture: true, passive: true }));

  function play(name) {
    if (!enabled || !SOUNDS[name] || !audio()) return;
    try { SOUNDS[name](); } catch { /* Un sonido nunca debe romper la página. */ }
  }

  function soundFor(button) {
    if (button.matches(".memo-card, .sound-toggle, [data-sound='none']")) return null;
    if (button.dataset.sound) return button.dataset.sound;
    if (button.matches(".gift-button")) return button.getAttribute("aria-expanded") === "true" ? null : "gift";
    if (button.matches(".reveal-button")) return "reveal";
    if (button.matches(".primary-button")) return "primary";
    if (button.querySelector('use[href="#arrow-left"]')) return "back";
    return "tap";
  }

  // Escucha antes que la página, para sonar aunque el botón cambie de estado al hacer clic.
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
    const name = soundFor(button);
    if (name) play(name);
  }, true);

  // Botón para activar o silenciar, junto a "Día del Novio".
  function speakerIcon(on) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = `<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>${on
      ? '<path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
      : '<path d="m16 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'}`;
    return svg;
  }
  const header = document.querySelector(".site-header");
  if (header && AudioContextClass) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "sound-toggle";
    const render = () => {
      toggle.replaceChildren(speakerIcon(enabled));
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.setAttribute("aria-label", enabled ? "Sonido y canción activados. Toca para silenciar" : "Sonido y canción silenciados. Toca para activar");
      toggle.title = enabled ? "Silenciar sonido y canción" : "Activar sonido y canción";
    };
    toggle.addEventListener("click", () => {
      enabled = !enabled;
      try { window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch { /* Solo dura esta visita. */ }
      window.AventuraSoundtrack?.setEnabled(enabled);
      render();
      play("tap");
    });
    render();
    const occasion = header.querySelector(".occasion");
    const group = document.createElement("div");
    group.className = "header-actions";
    header.insertBefore(group, occasion);
    group.append(occasion, toggle);
  }

  // Los juegos comparten este contexto: ya está desbloqueado por el primer gesto.
  window.Sonidos = Object.freeze({ play, unlock, audioContext: () => audio(), get enabled() { return enabled; } });
})();
