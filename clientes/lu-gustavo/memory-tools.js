/* Lógica independiente del navegador: fechas de calendario y área raspada. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MemoryTools = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function calendarDate({ year, month, day } = {}) {
    if (![year, month, day].every(Number.isInteger) || year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new RangeError("Configura memory.date con año, mes (1–12) y día válidos.");
    }
    // UTC se usa exclusivamente para aritmética. Nunca se convierte a hora local.
    const value = new Date(0);
    value.setUTCFullYear(year, month - 1, day);
    if (value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) throw new RangeError("La fecha de noviazgo no existe en el calendario.");
    value.setUTCDate(1);
    const firstWeekday = (value.getUTCDay() + 6) % 7; // Lunes = 0.
    value.setUTCMonth(month, 0);
    return Object.freeze({
      year, month, day, firstWeekday,
      daysInMonth: value.getUTCDate(),
      monthName: MONTHS[month - 1],
      formatted: `${day} de ${MONTHS[month - 1]} de ${year}`,
      iso: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }

  function createCoverageGrid(width = 360, height = 400, columns = 36, rows = 40) {
    const cells = new Uint8Array(columns * rows);
    let erased = 0;
    return {
      get ratio() { return erased / cells.length; },
      eraseSegment(from, to, radius) {
        const dx = to.x - from.x, dy = to.y - from.y;
        const lengthSquared = dx * dx + dy * dy;
        const minX = Math.max(0, Math.floor((Math.min(from.x, to.x) - radius) / width * columns));
        const maxX = Math.min(columns - 1, Math.floor((Math.max(from.x, to.x) + radius) / width * columns));
        const minY = Math.max(0, Math.floor((Math.min(from.y, to.y) - radius) / height * rows));
        const maxY = Math.min(rows - 1, Math.floor((Math.max(from.y, to.y) + radius) / height * rows));
        for (let row = minY; row <= maxY; row += 1) {
          for (let column = minX; column <= maxX; column += 1) {
            const index = row * columns + column;
            if (cells[index]) continue;
            const x = (column + .5) / columns * width, y = (row + .5) / rows * height;
            const t = lengthSquared ? Math.max(0, Math.min(1, ((x - from.x) * dx + (y - from.y) * dy) / lengthSquared)) : 0;
            if ((x - from.x - t * dx) ** 2 + (y - from.y - t * dy) ** 2 <= radius ** 2) {
              cells[index] = 1;
              erased += 1;
            }
          }
        }
        return erased / cells.length;
      },
    };
  }
  return Object.freeze({ calendarDate, createCoverageGrid });
});
