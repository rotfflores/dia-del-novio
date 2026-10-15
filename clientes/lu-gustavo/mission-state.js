/* Estado local y reglas de la misión. Sin peticiones de red. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MissionState = api;
})(typeof window === "undefined" ? globalThis : window, () => {
  "use strict";
  const KEY = "aventura-lu-gustavo-mision-magica-v1";
  const normalize = (text) => String(text).trim().replace(/\s+/g, " ").toLowerCase();
  function restore(raw) {
    const unlocked = raw?.unlocked === true;
    let completed = unlocked && Number.isInteger(raw?.completed) ? Math.max(0, Math.min(4, raw.completed)) : 0;
    const answer = unlocked && typeof raw?.answer === "string" ? raw.answer.trim().slice(0, 4000) : "";
    if (completed >= 2 && !answer) completed = 1;
    const notes = completed >= 3 && Number.isInteger(raw?.notes) ? Math.max(0, Math.min(5, raw.notes)) : 0;
    if (completed === 4 && notes !== 5) completed = 3;
    return { unlocked, entered: unlocked && raw?.entered === true, completed, answer,
      stage: Math.max(1, Math.min(4, completed + 1, Number.isInteger(raw?.stage) ? raw.stage : 1)),
      notes, revealed: completed === 4 && raw?.revealed === true };
  }
  function create(storage) {
    let initial;
    try { initial = JSON.parse(storage?.getItem(KEY) || "null"); } catch { initial = null; }
    let state = restore(initial), persisted = Boolean(storage);
    const snapshot = () => ({ ...state });
    function save() {
      try { if (!storage) throw new Error("Sin almacenamiento"); storage.setItem(KEY, JSON.stringify(state)); persisted = true; }
      catch { persisted = false; }
      return snapshot();
    }
    function canVisit(stage) { return state.unlocked && state.entered && Number.isInteger(stage) && stage >= 1 && stage <= Math.min(4, state.completed + 1); }
    function complete(stage) {
      if (!canVisit(stage) || state.stage !== stage || state.completed !== stage - 1) return false;
      state.completed = stage; save(); return true;
    }
    return Object.freeze({
      snapshot, get persisted() { return persisted; }, canVisit,
      unlock() { if (state.unlocked) return false; state.unlocked = true; save(); return true; },
      enter() { if (!state.unlocked) return false; state.entered = true; save(); return true; },
      visit(stage) { if (!canVisit(stage)) return false; state.stage = stage; save(); return true; },
      bow(answer) { return normalize(answer) === "hacer una reverencia" && complete(1); },
      saveAnswer(answer) {
        if (!canVisit(2) || state.stage !== 2 || state.completed !== 1 || !String(answer).trim() || String(answer).length > 4000) return false;
        state.answer = String(answer).trim(); return complete(2);
      },
      spell(answer) { return normalize(answer) === "expecto patronum" && complete(3); },
      note(index) {
        if (!canVisit(4) || state.stage !== 4 || state.completed !== 3 || index !== state.notes || index >= 5) return false;
        state.notes += 1;
        if (state.notes === 5) complete(4); else save();
        return true;
      },
      // Repetir la misión: conserva el desbloqueo y vuelve a la bienvenida con todo en blanco.
      restart() {
        if (!state.unlocked) return false;
        state = restore({ unlocked: true }); save(); return true;
      },
      reveal() { if (!state.unlocked || state.completed !== 4 || state.notes !== 5) return false; state.revealed = true; save(); return true; },
    });
  }
  return Object.freeze({ KEY, create, normalize, restore });
});
