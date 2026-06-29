// =========================
// CONFIG
// =========================

const POKEAPI = "https://pokeapi.co/api/v2/pokemon";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home";

// =========================
// STATE
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
// SPRITE
// =========================

function getSprite(id, shiny = false) {
  if (!id) return "";

  return shiny
    ? `${SPRITE_BASE}/shiny/${id}.png`
    : `${SPRITE_BASE}/${id}.png`;
}

// =========================
// ROLE CLASS
// =========================

function roleClass(role) {
  return `role-${role || "unknown"}`;
}

// =========================
// RESOLVER (CORE LOGIC)
// =========================

async function resolvePokemon(mon) {
  const baseName = mon.name;
  const form = mon.form ?? "base";
  const shiny = mon.shiny ?? false;

  // =========================
  // 1. FORM LOOKUP (MEGA / ALT FORMS)
  // =========================
  if (form !== "base") {
    const slug = `${baseName}-${form}`;

    try {
      const res = await fetch(`${POKEAPI}/${slug}`);

      if (res.ok) {
        const data = await res.json();

        return {
          id: data.id,
          sprite: getSprite(data.id, shiny)
        };
      }
    } catch (e) {
      console.warn("Form fetch failed:", slug);
    }

    console.warn("Falling back from form:", slug);
  }

  // =========================
  // 2. BASE DEX LOOKUP
  // =========================
  const id = dexMap[baseName];

  if (!id) {
    console.warn("Missing dex entry:", baseName);

    return {
      id: null,
      sprite: ""
    };
  }

  return {
    id,
    sprite: getSprite(id, shiny)
  };
}

// =========================
// MON CARD
// =========================

async function renderMon(mon) {
  const wrapper = document.createElement("div");
  wrapper.className = `mon-card ${roleClass(mon.role)}`;

  // -------------------------
  // SPRITE
  // -------------------------
  const { sprite } = await resolvePokemon(mon);

  const img = document.createElement("img");
  img.className = "pokemon-sprite";
  img.src = sprite;

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
    itemImg.src = `assets/items/${mon.item.slug}.png`;

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
// TEAM
// =========================

async function renderTeam(team) {
  const card = document.createElement("div");
  card.className = "team-card team-grid";

  for (const mon of team) {
    const monEl = await renderMon(mon);
    card.appendChild(monEl);
  }

  return card;
}

// =========================
// MAIN
// =========================

async function renderAllTeams() {
  const container = document.getElementById("team-container");

  const res = await fetch("teams.json");
  const teams = await res.json();

  container.innerHTML = "";

  for (const team of teams) {
    // Team wrapper
    const section = document.createElement("div");
    section.className = "team-section";

    // Team name heading
    const heading = document.createElement("h2");
    heading.className = "team-name";
    heading.textContent = team.name;
    section.appendChild(heading);

    // Cards row
    const teamCard = await renderTeam(team.members);
    section.appendChild(teamCard);

    container.appendChild(section);
  }
}

// =========================
// BOOT
// =========================

(async function init() {
  await loadDexCSV();
  await renderAllTeams();
})();