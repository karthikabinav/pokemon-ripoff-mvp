const W = 12, H = 10;
const player = { x: 1, y: 1, hp: 40, maxHp: 40 };
const party = [{ name: "Flameling", hp: 30, maxHp: 30, atk: 8 }];
let map = [];
let inBattle = false;
let enemy = null;

const monsters = [
  { name: "Leafbit", hp: 18, atk: 5 },
  { name: "Aquabub", hp: 22, atk: 6 },
  { name: "Sparkit", hp: 16, atk: 7 },
];

const mapEl = document.getElementById("map");
const logEl = document.getElementById("log");

function log(msg) {
  logEl.textContent = `${msg}\n` + logEl.textContent;
}

function buildMap() {
  map = Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => {
      const border = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      if (border) return "ground";
      return Math.random() < 0.32 ? "grass" : "ground";
    })
  );
}

function renderMap() {
  mapEl.innerHTML = "";
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = document.createElement("div");
      d.className = `tile ${map[y][x]}`;
      d.textContent = map[y][x] === "grass" ? "✿" : "";
      if (player.x === x && player.y === y) {
        d.classList.add("player");
        d.textContent = "🧍";
      }
      mapEl.appendChild(d);
    }
  }
  document.getElementById("playerHp").textContent = `${player.hp}/${player.maxHp}`;
  document.getElementById("partyCount").textContent = party.length;
  document.getElementById("pos").textContent = `${player.x},${player.y}`;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function tryEncounter() {
  if (map[player.y][player.x] !== "grass") return;
  if (Math.random() < 0.22) {
    const base = monsters[Math.floor(Math.random() * monsters.length)];
    enemy = { ...base, maxHp: base.hp + Math.floor(Math.random() * 5), hp: base.hp + Math.floor(Math.random() * 5) };
    startBattle();
  }
}

function startBattle() {
  inBattle = true;
  document.getElementById("battle").classList.remove("hidden");
  updateBattleUI(`A wild ${enemy.name} appears!`);
}

function endBattle(msg) {
  inBattle = false;
  enemy = null;
  document.getElementById("battle").classList.add("hidden");
  log(msg);
  renderMap();
}

function updateBattleUI(text) {
  const ally = party[0];
  document.getElementById("battleText").textContent = text;
  document.getElementById("allyName").textContent = ally.name;
  document.getElementById("allyHp").textContent = `${ally.hp}/${ally.maxHp}`;
  document.getElementById("enemyName").textContent = enemy.name;
  document.getElementById("enemyHp").textContent = `${enemy.hp}/${enemy.maxHp}`;
}

function enemyTurn() {
  const ally = party[0];
  const dmg = Math.max(1, enemy.atk + Math.floor(Math.random() * 3) - 1);
  ally.hp = clamp(ally.hp - dmg, 0, ally.maxHp);
  if (ally.hp <= 0) {
    ally.hp = ally.maxHp;
    player.hp = clamp(player.hp - 10, 0, player.maxHp);
    if (player.hp <= 0) {
      player.hp = player.maxHp;
      player.x = 1; player.y = 1;
      endBattle("Your monster fainted. You blacked out and woke at start.");
      return;
    }
    endBattle(`${ally.name} fainted. You escaped but lost 10 HP.`);
    return;
  }
  updateBattleUI(`${enemy.name} hits back for ${dmg}!`);
}

document.getElementById("attackBtn").onclick = () => {
  if (!inBattle || !enemy) return;
  const ally = party[0];
  const dmg = Math.max(1, ally.atk + Math.floor(Math.random() * 4) - 1);
  enemy.hp -= dmg;
  if (enemy.hp <= 0) {
    endBattle(`You defeated wild ${enemy.name}.`);
    return;
  }
  updateBattleUI(`${ally.name} dealt ${dmg} to ${enemy.name}.`);
  setTimeout(enemyTurn, 250);
};

document.getElementById("captureBtn").onclick = () => {
  if (!inBattle || !enemy) return;
  const hpFactor = 1 - enemy.hp / enemy.maxHp;
  const chance = 0.25 + hpFactor * 0.55;
  if (Math.random() < chance) {
    party.push({ name: enemy.name, hp: enemy.maxHp, maxHp: enemy.maxHp, atk: enemy.atk });
    endBattle(`Captured ${enemy.name}!`);
  } else {
    updateBattleUI(`Capture failed! ${enemy.name} broke free.`);
    setTimeout(enemyTurn, 250);
  }
};

document.getElementById("runBtn").onclick = () => {
  if (!inBattle) return;
  const ok = Math.random() < 0.8;
  if (ok) endBattle("Got away safely.");
  else {
    updateBattleUI("Couldn't escape!");
    setTimeout(enemyTurn, 250);
  }
};

window.addEventListener("keydown", (e) => {
  if (inBattle) return;
  let dx = 0, dy = 0;
  if (["ArrowUp","w","W"].includes(e.key)) dy = -1;
  if (["ArrowDown","s","S"].includes(e.key)) dy = 1;
  if (["ArrowLeft","a","A"].includes(e.key)) dx = -1;
  if (["ArrowRight","d","D"].includes(e.key)) dx = 1;
  if (!dx && !dy) return;
  const nx = clamp(player.x + dx, 1, W - 2);
  const ny = clamp(player.y + dy, 1, H - 2);
  player.x = nx; player.y = ny;
  renderMap();
  tryEncounter();
});

buildMap();
renderMap();
log("Welcome to Monster Quest MVP.");
