/* Accesos directos exclusivos de la vista local; fuera de dist. El laberinto es real. */
(() => {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  const type = params.get("prize");
  if (["coupon", "photo", "message"].includes(type)) window.COUPLE_CONFIG.prize.type = type;
  if (type === "missing-photo") {
    window.COUPLE_CONFIG.prize.type = "photo";
    window.COUPLE_CONFIG.prize.photo.src = "./assets/prueba-foto-ausente.jpg";
  }
  const banner = document.createElement("p");
  banner.textContent = params.get("preview") === "prize" ? "Vista de prueba del regalo · Puntuación simulada." : "Vista previa local · Laberinto del amor";
  banner.style.cssText = "margin:0;padding:10px 20px;text-align:center;background:#f6e1e7;color:#6f3045;font:12px/1.5 system-ui";
  const directLink = document.createElement("a");
  const directParams = new URLSearchParams(params);
  directParams.set("preview", "prize");
  directLink.href = `/?${directParams}`;
  directLink.textContent = "Ver el regalo directamente";
  directLink.style.cssText = "display:inline-block;margin-left:12px;padding:8px;color:#94213f;font-weight:600";
  banner.append(directLink);
  const gameLink = document.createElement("a");
  gameLink.href = "/?preview=game";
  gameLink.textContent = "Jugar al laberinto";
  gameLink.style.cssText = directLink.style.cssText;
  banner.append(gameLink);
  document.body.prepend(banner);

  // Acceso directo exclusivo de la vista de prueba: no altera el recorrido publicado.
  if (["game", "prize"].includes(params.get("preview"))) {
    // Conserva los renderizadores reales para poder volver a los recuerdos.
    const original2 = window.Aventura.registerPart2((container, context) => { context.completePart2(); return original2(container, context); });
    const original3 = window.Aventura.registerPart3((container, context) => { context.completePart3(); return original3(container, context); });
    const shell = document.querySelector(".page-shell");
    shell.style.visibility = "hidden";
    const loading = document.createElement("p");
    loading.textContent = params.get("preview") === "game" ? "Preparando el laberinto…" : "Abriendo tu regalo…";
    loading.style.cssText = "text-align:center;color:#94213f;font:20px/1.6 Georgia,serif";
    banner.after(loading);
    (async () => {
      try {
        for (const navigate of [window.Aventura.goToPart2, window.Aventura.goToPart3, window.Aventura.goToPart4]) {
          if (!await navigate()) throw new Error("No se pudo preparar la vista del regalo.");
        }
        if (params.get("preview") === "prize" && !await window.Aventura.completeGame({ score: 0, maxScore: window.LoveMaze.createGame().maxScore })) throw new Error("No se pudo abrir la vista del regalo.");
      } catch (error) {
        loading.textContent = error.message;
        console.error(error);
        return;
      } finally { shell.style.removeProperty("visibility"); }
      loading.remove();
      document.getElementById(params.get("preview") === "game" ? "part-four-title" : "part-five-title").focus({ preventScroll: true });
    })();
  }
})();
