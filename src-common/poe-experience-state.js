import { fetchCharacters } from "../src-back/ggg.js";

const FETCH_COOLDOWN = 5000;

export const sleep = (ms) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export default class PoeExperienceState {
  constructor() {
    this.msTotal = 0;
    this.experienceLog = [];
    this.updateXp();
  }

  updateXp = async (delay = 0) => {
    if (delay > 0) {
      await sleep(delay);
    } else {
      await sleep(FETCH_COOLDOWN);
    }

    const a = await fetchCharacters(settings);
    const b = a.filter((character) => character.lastActive);

    if (b.length === 0) {
      return;
    }

    const character = b[0];

    const newestLog = {
      timestamp: Date.now(),
      experience: character.experience,
    };

    experienceLog.push(newestLog);
  };
}
