/* Progreso independiente de aperturas/cierres y del orden de las tarjetas. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GalleryTools = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  function createDiscovery(ids) {
    if (!Array.isArray(ids) || ids.length < 4 || ids.length > 6) throw new RangeError("Configura entre 4 y 6 recuerdos en gallery.memories.");
    if (ids.some((id) => typeof id !== "string" || !id.trim()) || new Set(ids).size !== ids.length) throw new TypeError("Cada recuerdo necesita un id de texto único y no vacío.");
    const validIds = new Set(ids);
    const discovered = new Set();
    return Object.freeze({
      get total() { return validIds.size; },
      get count() { return discovered.size; },
      get complete() { return discovered.size === validIds.size; },
      has(id) { return discovered.has(id); },
      discover(id) {
        if (!validIds.has(id)) throw new RangeError("Este recuerdo no forma parte de la colección.");
        if (discovered.has(id)) return false;
        discovered.add(id);
        return true;
      },
    });
  }
  return Object.freeze({ createDiscovery });
});
