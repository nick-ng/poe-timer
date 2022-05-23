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
