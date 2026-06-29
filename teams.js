// =========================
// CONFIG
// =========================

const POKEAPI_POKEMON = "https://pokeapi.co/api/v2/pokemon/";
const POKEAPI_ITEM = "https://pokeapi.co/api/v2/item/";

// =========================
// UTIL
// =========================

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function getItemDebugBorder(source) {
  if (source === "api") return "20px solid #51cf66";   // green
  if (source === "local") return "20px solid #ffd43b"; // yellow
  return "20px solid #ff6b6b";                         // red
}

// =========================
// SPRITES (Pokémon)
// =========================

function getPokemonSprite(id, { shiny = false } = {}) {
  const base =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

  return shiny
    ? `${base}/shiny/${id}.png`
    : `${base}/${id}.png`;
}

// =========================
// ITEM ICON RESOLVER
// =========================

function localItemIcon(slug) {
  return `assets/items/${slug}.png`;
}

async function getItemIcon(slug) {
  const data = await fetchJSON(POKEAPI_ITEM + slug);

  if (data && data.sprites && data.sprites.default) {
    return {
      src: data.sprites.default,
      source: "api"
    };
  }

  return {
    src: `assets/items/${slug}.png`,
    source: "local"
  };
}

// =========================
// POKÉMON LOOKUP
// =========================

async function getPokemonData(slug) {
  return await fetchJSON(POKEAPI_POKEMON + slug);
}

// =========================
// ROLE STYLING
// =========================

function roleClass(role) {
  return `role-${role || "unknown"}`;
}

// =========================
// TEAM RENDERER
// =========================

async function renderTeam(team) {
  const card = document.createElement("div");
  card.className = "card";

  // Title
  const title = document.createElement("h2");
  title.textContent = team.name;
  card.appendChild(title);

  // Grid
  const grid = document.createElement("div");
  grid.className = "team-grid";

  for (const mon of team.members) {
    const poke = await getPokemonData(mon.name);

    if (!poke) continue;

    const wrapper = document.createElement("div");
    wrapper.className = "mon-card";

    // =========================
    // Pokémon Sprite
    // =========================
    const img = document.createElement("img");
    img.src = getPokemonSprite(poke.id, {
      shiny: mon.shiny,
    });

    img.alt = mon.name;

    // =========================
    // Name
    // =========================
    const name = document.createElement("div");
    name.textContent = mon.name;

    // =========================
    // Role
    // =========================
    const role = document.createElement("div");
    role.className = roleClass(mon.role);
    role.textContent = mon.role || "unknown";

    // =========================
    // Item Icon
    // =========================
    const itemWrap = document.createElement("div");
    itemWrap.className = "item-wrap";

    const itemData = await getItemIcon(mon.item);

    const itemImg = document.createElement("img");
    itemImg.className = "item-icon";
    itemImg.src = itemData.src;

    // DEBUG BORDER (temporary)
    wrapper.style.border = getItemDebugBorder(itemData.source);
    wrapper.style.borderRadius = "10px";
    wrapper.style.padding = "6px";

    const itemText = document.createElement("div");
    itemText.textContent = mon.item;

    itemWrap.appendChild(itemImg);
    itemWrap.appendChild(itemText);

    // =========================
    // Assemble mon card
    // =========================
    wrapper.appendChild(img);
    wrapper.appendChild(name);
    wrapper.appendChild(role);
    wrapper.appendChild(itemWrap);

    grid.appendChild(wrapper);
  }

  card.appendChild(grid);

  return card;
}

// =========================
// MAIN RENDER LOOP
// =========================

async function renderAllTeams() {
  const container = document.getElementById("team-container");

  const res = await fetch("teams.json");
  const teams = await res.json();

  for (const team of teams) {
    const card = await renderTeam(team);
    container.appendChild(card);
  }
}

// =========================
// BOOT
// =========================

renderAllTeams();