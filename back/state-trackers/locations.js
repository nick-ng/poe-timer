const allMaps = [
  "Underground Sea",
  "Arid Lake",
  "Spider Forest",
  "Cold River",
  "Museum",
  "Tower",
  "Peninsula",
  "Dungeon",
  "Bog",
  "Acid Caverns",
  "Frozen Cabins",
  "Plaza",
  "Moon Temple",
  "Necropolis",
  "Ramparts",
  "Basilica",
  "Reef",
  "Infested Valley",
  "Carcass",
  "Volcano",
  "Cemetery",
  "Overgrown Shrine",
  "Temple",
  "Bazaar",
  "Ashen Wood",
  "Arsenal",
  "Crimson Temple",
  "Armoury",
  "Shore",
  "Arena",
  "Toxic Sewer",
  "Dry Sea",
  "Arcade",
  "Tropical Island",
  "Mud Geyser",
  "Maze",
  "Atoll",
  "Bramble Valley",
  "Orchard",
  "Primordial Pool",
  "Summit",
  "Crimson Township",
  "Lair",
  "Bone Crypt",
  "Thicket",
  "Ivory Temple",
  "Sepulchre",
  "City Square",
  "Lookout",
  "Courtyard",
  "Mesa",
  "Desert Spring",
  "Terrace",
  "Core",
  "Colonnade",
  "Desert",
  "Gardens",
  "Glacier",
  "Crystal Ore",
  "Grotto",
  "Lava Chamber",
  "Promenade",
  "Overgrown Ruin",
  "Dunes",
  "Marshes",
  "Waste Pool",
  "Jungle Valley",
  "Canyon",
  "Mausoleum",
  "Villa",
  "Wharf",
  "Precinct",
  "Cage",
  "Dark Forest",
  "Grave Trough",
  "Underground River",
  "Vaal Pyramid",
  "Mineral Pools",
  "Pit",
  "Foundry",
  "Port",
  "Sunken City",
  "Laboratory",
  "Coral Ruins",
  "Factory",
  "Wasteland",
  "Strand",
  "Alleyways",
  "Beach",
  "Fields",
  "Fungal Hollow",
  "Cursed Crypt",
  "Palace",
  "Cells",
  "Barrows",
  "Park",
  "Lava Lake",
  "Burial Chambers",
  "Residence",
  "Caldera",
];

export const isTown = (area) => {
  if (area === "Character Select") {
    return true;
  }
  if (area.includes("Hideout") && !area.startsWith("Syndicate")) {
    return true;
  }
  if (
    [
      "Lioneye's Watch",
      "The Forest Encampment",
      "The Sarn Encampment",
      "Highgate",
      "Overseer's Tower",
      "The Bridge Encampment",
      "Oriath Docks",
      "Karui Shores",
    ].includes(area)
  ) {
    return true;
  }

  return false;
};

export const isMap = (area) => {
  return allMaps.includes(area);
};
