/* Lógica independiente del navegador: baraja y reglas del memorama. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MemoramaTools = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";

  // Cada recuerdo aparece dos veces. `random` se puede inyectar en las pruebas.
  function createDeck(ids, random = Math.random) {
    if (!Array.isArray(ids) || ids.length < 4 || ids.length > 6) throw new RangeError("Configura entre 4 y 6 recuerdos en gallery.memories.");
    if (ids.some((id) => typeof id !== "string" || !id.trim()) || new Set(ids).size !== ids.length) throw new TypeError("Cada recuerdo necesita un id de texto único y no vacío.");
    const deck = ids.flatMap((id) => [id, id]);
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function createGame(ids, random) {
    const deck = createDeck(ids, random);
    const matched = new Set();
    let first = null, second = null, moves = 0;
    return Object.freeze({
      get deck() { return deck.slice(); },
      get total() { return ids.length; },
      get pairs() { return matched.size; },
      get moves() { return moves; },
      get complete() { return matched.size === ids.length; },
      get locked() { return second !== null; },
      isMatched(index) { return matched.has(deck[index]); },
      isFaceUp(index) { return index === first || index === second || matched.has(deck[index]); },
      // Devuelve null si el toque no cuenta; si no, lo que ocurrió con la carta.
      flip(index) {
        if (!Number.isInteger(index) || index < 0 || index >= deck.length) throw new RangeError("Esa carta no existe.");
        if (second !== null || index === first || matched.has(deck[index])) return null;
        if (first === null) { first = index; return { type: "first", id: deck[index] }; }
        second = index;
        moves += 1;
        if (deck[first] === deck[second]) {
          const id = deck[index];
          matched.add(id);
          first = second = null;
          return { type: "match", id };
        }
        return { type: "miss", indexes: [first, second] };
      },
      // Voltea de nuevo las dos cartas que no coincidieron.
      hideMiss() {
        if (second === null) return false;
        first = second = null;
        return true;
      },
    });
  }

  return Object.freeze({ createDeck, createGame });
});
