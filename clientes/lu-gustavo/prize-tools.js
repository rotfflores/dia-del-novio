/* Estado del premio durante esta visita. No depende del DOM ni de la puntuación mínima. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PrizeTools = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  function createPrizeState() {
    let lastResult = null, bestResult = null, roundNumber = 0, opened = false;
    return Object.freeze({
      snapshot() { return Object.freeze({ lastResult, bestResult, roundNumber, opened, unlocked: lastResult !== null }); },
      finish(result) {
        if (!result || !Number.isSafeInteger(result.score) || !Number.isSafeInteger(result.maxScore) ||
          result.maxScore <= 0 || result.score < 0 || result.score > result.maxScore) {
          throw new RangeError("La partida necesita score y maxScore enteros: 0 <= score <= maxScore, maxScore > 0.");
        }
        lastResult = Object.freeze({ score: result.score, maxScore: result.maxScore });
        // Compara proporciones por si el futuro juego cambia su cantidad de preguntas.
        if (!bestResult || lastResult.score / lastResult.maxScore > bestResult.score / bestResult.maxScore) bestResult = lastResult;
        roundNumber += 1;
        return this.snapshot();
      },
      open() {
        if (!lastResult || opened) return false;
        opened = true;
        return true;
      },
    });
  }
  return Object.freeze({ createPrizeState });
});
