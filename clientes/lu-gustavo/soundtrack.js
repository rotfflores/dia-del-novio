/* La canción acompaña toda la aventura y comparte el reproductor del regalo. */
(() => {
  "use strict";
  const src = window.COUPLE_CONFIG?.song?.audioSrc;
  if (typeof src !== "string" || !src.startsWith("./")) return;

  const audio = document.createElement("audio");
  audio.src = src;
  audio.preload = "metadata";
  audio.loop = true;
  audio.hidden = true;
  audio.setAttribute("aria-label", `${window.COUPLE_CONFIG.song.name}, ${window.COUPLE_CONFIG.song.artist}`);
  document.body.append(audio);

  let enabled = window.Sonidos?.enabled !== false;
  let waitingForGesture = enabled;
  audio.muted = !enabled;

  function begin() {
    if (!enabled) return Promise.resolve(false);
    try {
      return Promise.resolve(audio.play()).then(() => {
        waitingForGesture = false;
        return true;
      }).catch(() => false);
    } catch { return Promise.resolve(false); }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    audio.muted = !enabled;
    if (enabled) {
      waitingForGesture = true;
      begin();
    } else {
      waitingForGesture = false;
      audio.pause();
    }
  }

  function restart() {
    try { audio.currentTime = 0; } catch { /* Aún se cargan los metadatos. */ }
    return begin();
  }

  function showIn(frame) {
    audio.hidden = false;
    audio.controls = true;
    frame.append(audio);
  }

  function park() {
    audio.controls = false;
    audio.hidden = true;
    document.body.append(audio);
  }

  ["pointerdown", "touchend", "keydown", "click"].forEach((type) => {
    document.addEventListener(type, (event) => {
      if (!waitingForGesture || event.target.closest?.(".sound-toggle")) return;
      begin();
    }, { capture: true, passive: true });
  });
  // El audio comienza exclusivamente después de una interacción de la persona.

  // La misión mágica (parte 8) tiene su propia canción. Cada pista conserva su posición.
  const missionSrc = window.COUPLE_CONFIG?.missionSong?.audioSrc;
  const tracks = { main: src, mission: typeof missionSrc === "string" && missionSrc.startsWith("./") ? missionSrc : "" };
  const positions = new Map();
  let fadeTimer = 0;
  function fade(from, to, done) {
    clearInterval(fadeTimer);
    const steps = 12;
    let step = 0;
    fadeTimer = setInterval(() => {
      step += 1;
      try { audio.volume = Math.max(0, Math.min(1, from + (to - from) * (step / steps))); } catch { /* iOS fija el volumen. */ }
      if (step >= steps) { clearInterval(fadeTimer); done?.(); }
    }, 40);
  }
  function useTrack(next) {
    const current = audio.getAttribute("src");
    if (!next || current === next) return;
    // Solo continúa sonando si ya sonaba; nunca inicia audio sin una interacción.
    const resume = enabled && !waitingForGesture && !audio.paused;
    try { positions.set(current, audio.currentTime || 0); } catch { /* Sin metadatos todavía. */ }
    const swap = () => {
      audio.src = next;
      const song = next === tracks.mission ? window.COUPLE_CONFIG.missionSong : window.COUPLE_CONFIG.song;
      audio.setAttribute("aria-label", [song?.name, song?.artist].filter(Boolean).join(", "));
      const at = positions.get(next) || 0;
      if (at) audio.addEventListener("loadedmetadata", () => { try { audio.currentTime = at; } catch { /* Empieza desde el inicio. */ } }, { once: true });
      if (!resume) { try { audio.volume = 1; } catch { /* Sin cambios. */ } return; }
      try { audio.volume = 0; } catch { /* Sin cambios. */ }
      begin().then(() => fade(0, 1));
    };
    if (resume) fade(audio.volume, 0, swap); else swap();
  }
  const trackFor = (part) => (part === 8 && tracks.mission ? tracks.mission : tracks.main);
  document.addEventListener("adventure:partchange", (event) => useTrack(trackFor(event.detail.currentPart)));
  if (window.Aventura?.currentPart === 8) useTrack(tracks.mission);

  window.AventuraSoundtrack = Object.freeze({ audio, begin, restart, showIn, park, setEnabled, useTrack });
})();
