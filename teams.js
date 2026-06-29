// =========================
// CONFIG
// =========================

const POKEAPI_POKEMON = "https://pokeapi.co/api/v2/pokemon/";

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

function getItemIcon(slug) {
  return `assets/items/${slug}.png`;
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
  const container = document.getElementById("team-container");
  container.innerHTML = "";

  for (const mon of team) {
    const wrapper = document.createElement("div");
    wrapper.className = "mon-card role-" + mon.role;

    // =========================
    // SPRITE (POKÉMON - POKEAPI)
    // =========================
    const img = document.createElement("img");
    img.className = "pokemon-sprite";

    const base =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

    img.src = mon.shiny
      ? `${base}/shiny/${mon.name}.png`
      : `${base}/${mon.name}.png`;

    wrapper.appendChild(img);

    // =========================
    // NAME (HUMAN READABLE)
    // =========================
    const name = document.createElement("div");
    name.className = "pokemon-name";
    name.textContent = mon.displayName || mon.name;
    wrapper.appendChild(name);

    // =========================
    // ITEM (LOCAL ASSET)
    // =========================
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

    // =========================
    // ABILITY
    // =========================
    if (mon.ability) {
      const ability = document.createElement("div");
      ability.className = "ability";
      ability.textContent = `Ability: ${mon.ability}`;
      wrapper.appendChild(ability);
    }

    // =========================
    // NATURE
    // =========================
    if (mon.nature) {
      const nature = document.createElement("div");
      nature.className = "nature";
      nature.textContent = `Nature: ${mon.nature}`;
      wrapper.appendChild(nature);
    }

    // =========================
    // MOVES
    // =========================
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

    container.appendChild(wrapper);
  }
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
    console.log("renderAllTeams input:", team);
    console.log("typeof team:", typeof team);
    console.log("isArray:", Array.isArray(team));
    container.appendChild(card);
  }
}

// =========================
// BOOT
// =========================

renderAllTeams();