/* Imagen vertical (1080 × 1920) que resume la aventura, para guardar o subir de estado. */
(() => {
  "use strict";
  const W = 1080, H = 1920;
  const SERIF = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';
  const SANS = '"Avenir Next", Avenir, "Segoe UI", sans-serif';
  const HEART = new Path2D("M3 3h6v3h6V3h6v3h3v9h-3v3h-3v3h-3v3H9v-3H6v-3H3v-3H0V6h3z");
  const C = { paper: "#faf7f2", ink: "#40252d", muted: "#79646a", cherry: "#b62d51", dark: "#94213f", rose: "#f0c1cd", line: "#e3cfd3" };

  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image.naturalWidth ? image : null);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function heart(ctx, x, y, size, color) { ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 24, size / 24); ctx.fillStyle = color; ctx.fill(HEART); ctx.restore(); }
  function check(ctx, x, y, size, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = size * .16; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(x - size * .35, y); ctx.lineTo(x - size * .08, y + size * .28); ctx.lineTo(x + size * .38, y - size * .3); ctx.stroke(); ctx.restore();
  }
  // Dibuja la foto llenando el marco sin deformarla.
  function cover(ctx, image, x, y, w, h, position = "50% 50%") {
    const [px, py] = String(position).split(/\s+/).map((v) => (parseFloat(v) || 50) / 100);
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const sw = w / scale, sh = h / scale;
    ctx.drawImage(image, (image.naturalWidth - sw) * px, (image.naturalHeight - sh) * py, sw, sh, x, y, w, h);
  }
  function polaroid(ctx, image, cx, cy, w, h, angle, caption, position, pad = 18) {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(angle);
    const fw = w + pad * 2, fh = h + pad + (caption ? pad * 3.4 : pad);
    ctx.shadowColor = "#6b314229"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 14;
    ctx.fillStyle = "#fffdfb"; ctx.fillRect(-fw / 2, -fh / 2, fw, fh);
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#ece3db"; ctx.lineWidth = 2; ctx.strokeRect(-fw / 2, -fh / 2, fw, fh);
    const x = -w / 2, y = -fh / 2 + pad;
    if (image) cover(ctx, image, x, y, w, h, position);
    else { ctx.fillStyle = "#f2e3e7"; ctx.fillRect(x, y, w, h); heart(ctx, 0, y + h / 2, Math.min(w, h) * .25, "#d9a3b3"); }
    if (caption) {
      ctx.fillStyle = "#76505e"; ctx.font = `italic 400 ${Math.round(pad * 1.5)}px ${SERIF}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(caption, 0, y + h + pad * 1.7, w);
    }
    ctx.restore();
  }
  // Parte un texto en líneas que caben en el ancho indicado.
  function lines(ctx, text, maxWidth) {
    const out = [];
    String(text).split(" ").forEach((word) => {
      const last = out[out.length - 1];
      if (last && ctx.measureText(`${last} ${word}`).width <= maxWidth) out[out.length - 1] = `${last} ${word}`;
      else out.push(word);
    });
    return out;
  }

  async function create(config, extras = {}) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const memories = (config.gallery && config.gallery.memories) || [];
    const [mainPhoto, ...memoryPhotos] = await Promise.all([loadImage(config.photo.src), ...memories.map((m) => loadImage(m.photo && m.photo.src))]);

    // Fondo de papel con puntitos y un brillo rosado arriba.
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 900);
    glow.addColorStop(0, "#fbe2ea"); glow.addColorStop(1, "#faf7f200");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#b78a9630";
    for (let y = 18; y < H; y += 36) for (let x = 18; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = C.line; ctx.lineWidth = 3; roundRect(ctx, 36, 36, W - 72, H - 72, 36); ctx.stroke();

    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    // Encabezado.
    heart(ctx, W / 2, 112, 44, C.cherry);
    ctx.fillStyle = C.muted; ctx.font = `600 30px ${SANS}`;
    ctx.fillText("N U E S T R A   A V E N T U R A", W / 2, 186);
    ctx.fillStyle = C.ink; ctx.font = `400 120px ${SERIF}`;
    ctx.fillText(extras.title || "Misión cumplida", W / 2, 320, W - 140);
    ctx.fillStyle = C.cherry; ctx.font = `italic 400 84px ${SERIF}`;
    ctx.fillText(extras.subtitle || "Feliz Día del Novio", W / 2, 420, W - 140);

    // Nombres y fecha.
    const names = `${config.names.her}  +  ${config.names.him}`;
    ctx.font = `600 40px ${SANS}`;
    const nw = ctx.measureText(names).width + 80;
    ctx.fillStyle = "#fbe8ee"; roundRect(ctx, W / 2 - nw / 2, 466, nw, 76, 38); ctx.fill();
    ctx.strokeStyle = "#d9a3b3"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.dark; ctx.fillText(names, W / 2, 518);
    if (extras.dateText) { ctx.fillStyle = C.muted; ctx.font = `italic 400 38px ${SERIF}`; ctx.fillText(extras.dateText, W / 2, 592); }

    // Foto principal.
    polaroid(ctx, mainPhoto, W / 2, 925, 470, 470, -.04, config.text.photoCaption || "", config.photo.position, 24);

    // Recuerdos del memorama.
    const count = Math.min(memoryPhotos.length, 5);
    if (count) {
      ctx.fillStyle = C.muted; ctx.font = `600 28px ${SANS}`; ctx.fillText("N U E S T R O S   R E C U E R D O S", W / 2, 1262);
      const slot = (W - 120) / count;
      for (let i = 0; i < count; i += 1) {
        polaroid(ctx, memoryPhotos[i], 60 + slot * (i + .5), 1378, slot - 44, slot - 30, [-.06, .04, -.03, .05, -.05][i], "", memories[i].photo && memories[i].photo.position, 10);
      }
    }

    // Misiones cumplidas.
    const missions = extras.missions || [];
    ctx.font = `600 32px ${SANS}`;
    const rows = [[]]; let width = 0;
    missions.forEach((mission) => {
      const w = ctx.measureText(mission).width + 96;
      if (width + w > W - 140 && rows[rows.length - 1].length) { rows.push([]); width = 0; }
      rows[rows.length - 1].push([mission, w]); width += w + 18;
    });
    rows.forEach((row, r) => {
      const total = row.reduce((sum, [, w]) => sum + w, 0) + (row.length - 1) * 18;
      let x = W / 2 - total / 2; const y = 1500 + r * 72;
      row.forEach(([mission, w]) => {
        ctx.fillStyle = "#fbe8ee"; roundRect(ctx, x, y, w, 58, 29); ctx.fill();
        ctx.strokeStyle = "#d9a3b3"; ctx.lineWidth = 2; ctx.stroke();
        check(ctx, x + 38, y + 29, 24, C.cherry);
        ctx.fillStyle = C.dark; ctx.textAlign = "left"; ctx.fillText(mission, x + 62, y + 40);
        x += w + 18;
      });
    });
    ctx.textAlign = "center";

    // Frase, canción y récord.
    let y = 1500 + rows.length * 72 + 4;
    if (extras.phrase) {
      ctx.fillStyle = C.cherry; ctx.font = `italic 400 44px ${SERIF}`;
      lines(ctx, `“${extras.phrase}”`, W - 180).forEach((line) => { ctx.fillText(line, W / 2, y + 40); y += 56; });
      y += 10;
    }
    const facts = [];
    if (extras.song) facts.push(`Nuestra canción: ${extras.song}`);
    if (extras.record) facts.push(`Récord en Vuela, corazón: ${extras.record}`);
    ctx.fillStyle = C.muted; ctx.font = `400 32px ${SANS}`;
    facts.forEach((fact) => { ctx.fillText(fact, W / 2, y + 36, W - 160); y += 46; });

    // Pie.
    heart(ctx, W / 2 - 250, H - 96, 26, C.cherry);
    ctx.fillStyle = C.muted; ctx.font = `italic 400 34px ${SERIF}`;
    ctx.fillText("Hecho con amor, solo para ti", W / 2 + 14, H - 86);

    return new Promise((resolve, reject) => {
      try { canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen."))), "image/png"); }
      catch (error) { reject(error); }
    });
  }

  window.SummaryImage = Object.freeze({ create });
})();
