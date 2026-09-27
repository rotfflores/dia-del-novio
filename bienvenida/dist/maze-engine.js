/* Simulación independiente del navegador. Coordenadas en celdas; pasos de 1/120 s. */
((root, factory) => {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LoveMaze = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  "use strict";
  const MAP = Object.freeze([
    "#############",
    "#o....#....o#",
    "#.##..#..##.#",
    "#...........#",
    "#.#.#####.#.#",
    "#.#...#...#.#",
    "#.###.#.###.#",
    "#.....P.....#",
    "#.###.#.###.#",
    "#.#...#...#.#",
    "#.#.#####.#.#",
    "#...........#",
    "#.##..#..##.#",
    "#o....#....o#",
    "#############",
  ]);
  const DIRECTIONS = Object.freeze({ up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] });
  const opposite = { up: "down", down: "up", left: "right", right: "left" };
  const key = (x, y) => `${x},${y}`;
  const RECORD_KEY = "aventura-laberinto-record-v1";
  function readRecord(storage) {
    try {
      const value = Number(storage.getItem(RECORD_KEY));
      return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    } catch { return 0; }
  }
  function saveRecord(storage, score) {
    const best = Math.max(readRecord(storage), score);
    try { storage.setItem(RECORD_KEY, String(best)); } catch { /* Memoria privada o cuota agotada: la partida continúa. */ }
    return best;
  }
  function createGame({ map = MAP, duration = 60, enemyStarts = [{ x: 6, y: 3 }, { x: 6, y: 11 }] } = {}) {
    const width = map[0].length, height = map.length;
    if (map.some((row) => row.length !== width) || !Number.isFinite(duration) || duration <= 0) throw new TypeError("Laberinto o duración inválidos.");
    const walkable = (x, y) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < width && y < height && map[y][x] !== "#";
    let start;
    const original = new Map();
    map.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === "P") start = { x, y };
      if (cell === "." || cell === "o") original.set(key(x, y), cell);
    }));
    if (!start || enemyStarts.some((point) => !walkable(point.x, point.y))) throw new TypeError("Los personajes necesitan una casilla libre.");
    const maxScore = [...original.values()].reduce((sum, cell) => sum + (cell === "o" ? 25 : 10), 0) + Math.floor(original.size / 5) * 20;
    const actor = (point) => ({ ...point, direction: null, target: null });
    const state = { phase: "ready", remaining: duration, elapsed: 0, score: 0, lives: 3,
      power: 0, shield: 3, combo: 0, comboTime: 0, reason: "", collected: 0,
      player: actor(start), enemies: [], hearts: new Map(original), events: [] };
    let wanted = null;
    function reset() {
      Object.assign(state, { phase: "ready", remaining: duration, elapsed: 0, score: 0, lives: 3,
        power: 0, shield: 3, combo: 0, comboTime: 0, reason: "", collected: 0,
        player: actor(start), enemies: enemyStarts.map((point, index) => ({ ...actor(point), stun: 5 + index, index })),
        hearts: new Map(original), events: [] });
      wanted = null;
    }
    reset();
    function end(reason) {
      if (state.phase !== "running") return;
      state.phase = "ended";
      state.reason = reason;
      state.events.push({ type: "end", reason });
    }
    function collect() {
      const position = key(state.player.x, state.player.y), item = state.hearts.get(position);
      if (!item) return;
      state.hearts.delete(position);
      state.collected += 1;
      state.combo = state.comboTime > 0 ? state.combo + 1 : 1;
      state.comboTime = 2.3;
      const bonus = state.combo % 5 === 0 ? 20 : 0;
      state.score += (item === "o" ? 25 : 10) + bonus;
      if (item === "o") state.power = 7;
      state.events.push({ type: item === "o" ? "power" : "heart", position, bonus });
      if (!state.hearts.size) end("hearts");
    }
    function move(person, distance, choose, visit = () => {}) {
      while (distance > 1e-8 && state.phase === "running") {
        if (!person.target) {
          const direction = choose(person);
          if (!direction) break;
          const [dx, dy] = DIRECTIONS[direction];
          if (!walkable(person.x + dx, person.y + dy)) break;
          person.direction = direction;
          person.target = { x: person.x + dx, y: person.y + dy };
        }
        const left = Math.hypot(person.target.x - person.x, person.target.y - person.y);
        const amount = Math.min(distance, left);
        person.x += (person.target.x - person.x) * amount / left;
        person.y += (person.target.y - person.y) * amount / left;
        distance -= amount;
        if (left - amount < 1e-8) {
          person.x = person.target.x; person.y = person.target.y; person.target = null;
          visit();
        }
      }
    }
    function canMove(person, direction) {
      if (!direction) return false;
      const [dx, dy] = DIRECTIONS[direction];
      return walkable(person.x + dx, person.y + dy);
    }
    function distancesTo(x, y) {
      const distances = new Map([[key(x, y), 0]]), queue = [{ x, y }];
      for (let i = 0; i < queue.length; i += 1) {
        const point = queue[i], distance = distances.get(key(point.x, point.y));
        for (const [dx, dy] of Object.values(DIRECTIONS)) {
          const nx = point.x + dx, ny = point.y + dy;
          if (walkable(nx, ny) && !distances.has(key(nx, ny))) {
            distances.set(key(nx, ny), distance + 1); queue.push({ x: nx, y: ny });
          }
        }
      }
      return distances;
    }
    function chase(enemy) {
      let choices = Object.keys(DIRECTIONS).filter((name) => canMove(enemy, name));
      if (choices.length > 1) choices = choices.filter((name) => name !== opposite[enemy.direction]);
      let target = { x: Math.round(state.player.x), y: Math.round(state.player.y) };
      // La segunda nube alterna persecución y paseos, dejando rutas de escape.
      if (enemy.index === 1 && Math.floor(state.elapsed / 9) % 2 && state.power <= 0) {
        target = [{ x: 1, y: 1 }, { x: 11, y: 13 }, { x: 11, y: 1 }, { x: 1, y: 13 }][Math.floor(state.elapsed / 9) % 4];
      }
      const distances = distancesTo(target.x, target.y);
      choices.sort((a, b) => {
        const da = DIRECTIONS[a], db = DIRECTIONS[b];
        const difference = (distances.get(key(enemy.x + da[0], enemy.y + da[1])) ?? 999) - (distances.get(key(enemy.x + db[0], enemy.y + db[1])) ?? 999);
        return state.power > 0 ? -difference : difference;
      });
      return choices[0];
    }
    function collisions() {
      for (const enemy of state.enemies) {
        if (enemy.stun > 0 || Math.hypot(state.player.x - enemy.x, state.player.y - enemy.y) >= .65) continue;
        if (state.power > 0) {
          Object.assign(enemy, actor(enemyStarts[enemy.index]), { stun: 2.5 });
          state.events.push({ type: "repel" });
        } else if (state.shield <= 0) {
          state.lives -= 1; state.combo = 0; state.comboTime = 0;
          state.events.push({ type: "hit", lives: state.lives });
          if (!state.lives) { end("lives"); return; }
          state.player = actor(start); wanted = null; state.shield = 3;
          state.enemies.forEach((cloud, i) => Object.assign(cloud, actor(enemyStarts[i]), { stun: 3 + i }));
          return;
        }
      }
    }
    function tick(dt) {
      if (state.phase !== "running" || !Number.isFinite(dt) || dt <= 0) return;
      let remaining = Math.min(dt, state.remaining);
      while (remaining > 1e-8 && state.phase === "running") {
        const step = Math.min(remaining, 1 / 120);
        state.remaining = Math.max(0, state.remaining - step);
        state.elapsed += step;
        state.power = Math.max(0, state.power - step);
        state.shield = Math.max(0, state.shield - step);
        state.comboTime = Math.max(0, state.comboTime - step);
        move(state.player, step * 4, (player) => canMove(player, wanted) ? wanted : canMove(player, player.direction) ? player.direction : null, collect);
        state.enemies.forEach((enemy) => {
          enemy.stun = Math.max(0, enemy.stun - step);
          if (!enemy.stun) move(enemy, step * (state.power > 0 ? 1.2 : 1.65 + enemy.index * .15), chase);
        });
        if (state.phase === "running") collisions();
        remaining -= step;
      }
      if (state.remaining < 1e-7) { state.remaining = 0; end("time"); }
    }
    return Object.freeze({ state, width, height, map, maxScore, totalHearts: original.size, walkable, reset, tick,
      start() { if (state.phase === "ready") { state.phase = "running"; return true; } return false; },
      pause() { if (state.phase === "running") { state.phase = "paused"; return true; } return false; },
      resume() { if (state.phase === "paused") { state.phase = "running"; return true; } return false; },
      direction(name) {
        if (!DIRECTIONS[name] || state.phase !== "running") return;
        wanted = name;
        const player = state.player;
        // Dar media vuelta es inmediato incluso entre dos centros de casilla.
        if (player.target && name === opposite[player.direction]) {
          const [dx, dy] = DIRECTIONS[player.direction];
          player.target = { x: player.target.x - dx, y: player.target.y - dy };
          player.direction = name;
        }
      },
      drainEvents() { return state.events.splice(0); },
    });
  }
  return Object.freeze({ MAP, DIRECTIONS, createGame, readRecord, saveRecord });
});
