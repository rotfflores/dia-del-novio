/* Botón "Enviar por WhatsApp": abre WhatsApp con el premio ya escrito para mandárselo a quien preparó la aventura. */
(() => {
  "use strict";
  const config = window.COUPLE_CONFIG;
  const settings = { number: "", buttonLabel: "Mandárselo a {nombre} por WhatsApp", ...(config.whatsapp || {}) };
  const number = String(settings.number || "").replace(/\D/g, "");

  // Ícono de WhatsApp dibujado localmente (sin fuentes ni imágenes externas).
  function whatsappIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.innerHTML = '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8.7 8.2c.2-.4.5-.4.8-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5a6 6 0 0 0 2.7 2.4c.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.3.3.5 0 .6-.3 1.4-1 1.7-.6.3-1.6.4-3.4-.4a9 9 0 0 1-3.8-3.6c-.6-1-.8-2-.3-3.7Z" fill="currentColor"/>';
    return svg;
  }

  // Devuelve un enlace listo para insertar, o null si no hay número configurado.
  function button(message) {
    if (!number) return null;
    const link = document.createElement("a");
    link.className = "whatsapp-button";
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(whatsappIcon(), document.createTextNode(settings.buttonLabel.replace("{nombre}", config.names.her)));
    link.addEventListener("click", () => window.Sonidos?.play("primary"));
    return link;
  }

  window.WhatsAppPrize = Object.freeze({ button });
})();
