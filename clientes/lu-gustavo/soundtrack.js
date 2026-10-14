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
  begin(); // Reproduce al abrir si el navegador lo permite; si no, al primer toque.

  window.AventuraSoundtrack = Object.freeze({ audio, begin, restart, showIn, park, setEnabled });
})();
