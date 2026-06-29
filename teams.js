// =========================
// CONFIG
// =========================

const POKEAPI_SPRITES =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// =========================
// STATE (DEX MAP)
// =========================

let dexMap = {};

// =========================
// LOAD DEX CSV
// =========================

async function loadDexCSV(path = "./assets/lists/dex.csv") {
  const res = await fetch(path);
  const text = await res.text();

  const lines = text.trim().split("\n").slice(1);

  for (const line of lines) {
    const [name, id] = line.split(",");
    dexMap[name.trim()] = Number(id);
  }
}

// =========================
// HELPERS
// =========================

function getPokemonId(name) {
  return dexMap[name];
}

function getForm(mon) {
  return mon.form ?? "base";
}

function getShiny(mon) {
  return mon.shiny ?? false;
}

function roleClass(role) {
  return `role-${role || "unknown"}`;
}

// =========================
// SPRITE RESOLVER (POKEAPI ONLY)
// =========================

function getPokemonSprite(id, shiny = false) {
  if (!id) return "";

  return shiny
    ? `${POKEAPI_SPRITES}/shiny/${id}.png`
    : `${POKEAPI_SPRITES}/${id}.png`;
}

// =========================
// ITEM RENDERER
// =========================

function getItemIcon(slug) {
  return `assets/items/${slug}.png`;
}

// =========================
// TEAM CARD RENDER
// =========================

function renderMon(mon) {
  const wrapper = document.createElement("div");
  wrapper.className = `mon-card ${roleClass(mon.role)}`;

  // -------------------------
  // SPRITE
  // -------------------------
  const id = getPokemonId(mon.name);
  const shiny = getShiny(mon);

  const img = document.createElement("img");
  img.className = "pokemon-sprite";
  img.src = getPokemonSprite(id, shiny);

  if (!id) {
    console.warn("Missing dex entry:", mon.name);
  }

  wrapper.appendChild(img);

  // -------------------------
  // NAME
  // -------------------------
  const name = document.createElement("div");
  name.className = "pokemon-name";
  name.textContent = mon.displayName || mon.name;
  wrapper.appendChild(name);

  // -------------------------
  // ITEM
  // -------------------------
  if (mon.item) {
    const itemWrap = document.createElement("div");
    itemWrap.className = "item";

    const itemImg = document.createElement("img");
    itemImg.className = "item-icon";
    itemImg.src = getItemIcon(mon.item.slug);

    const itemText = document.createElement("div");
    itemText.className = "item-name";
    itemText.textContent = mon.item.display || mon.item.slug;

    itemWrap.appendChild(itemImg);
    itemWrap.appendChild(itemText);

    wrapper.appendChild(itemWrap);
  }

  // -------------------------
  // ABILITY
  // -------------------------
  if (mon.ability) {
    const el = document.createElement("div");
    el.className = "ability";
    el.textContent = `Ability: ${mon.ability}`;
    wrapper.appendChild(el);
  }

  // -------------------------
  // NATURE
  // -------------------------
  if (mon.nature) {
    const el = document.createElement("div");
    el.className = "nature";
    el.textContent = `Nature: ${mon.nature}`;
    wrapper.appendChild(el);
  }

  // -------------------------
  // MOVES
  // -------------------------
  if (mon.moves?.length) {
    const moves = document.createElement("div");
    moves.className = "moves";

    for (const move of mon.moves) {
      const m = document.createElement("div");
      m.className = "move";
      m.textContent = move;
      moves.appendChild(m);
    }

    wrapper.appendChild(moves);
  }

  return wrapper;
}

// =========================
// TEAM RENDER
// =========================

function renderTeam(team) {
  const container = document.getElementById("team-container");

  const card = document.createElement("div");
  card.className = "team-card";

  for (const mon of team) {
    card.appendChild(renderMon(mon));
  }

  return card;
}

// =========================
// MAIN LOOP
// =========================

async function renderAllTeams() {
  const container = document.getElementById("team-container");

  const res = await fetch("teams.json");
  const teams = await res.json();

  container.innerHTML = "";

  for (const team of teams) {
    const teamCard = renderTeam(team.members);
    container.appendChild(teamCard);
  }
}

// =========================
// BOOT
// =========================

(async function init() {
  await loadDexCSV();
  await renderAllTeams();
})();