import { fetchCharacters } from "../src-back/ggg.js";

const FETCH_COOLDOWN = 10000;

const level80Xp = 855129128;
const level90Xp = 1934009687;

const levels = [
  { level: 90, totalXp: 1934009687 },
  { level: 91, totalXp: 2094900291 },
  { level: 92, totalXp: 2268549086 },
  { level: 93, totalXp: 2455921256 },
  { level: 94, totalXp: 2658074992 },
  { level: 95, totalXp: 2876116901 },
  { level: 96, totalXp: 3111280300 },
  { level: 97, totalXp: 3364828162 },
  { level: 98, totalXp: 3638186694 },
  { level: 99, totalXp: 3932818530 },
  { level: 100, totalXp: 4250334444 },
];

export const sleep = (ms) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

export default class PoeCharacterState {
  constructor(options = {}) {
    const { settings, logger } = options;

    this.settings = settings;
    this.logger = logger || (() => {});
    this.characterXpLog = {};
    this.updateXp();
    this.lastFetch = Date.now();
    this.onReset = () => {};
    this.prevXp = 0;
  }

  reset = () => {
    this.characterXpLog = {};
    this.updateXp();
  };

  updateXp = async (delay = 0) => {
    if (delay > 0) {
      await sleep(delay);
    }

    while (Date.now() - this.lastFetch < FETCH_COOLDOWN) {
      const extraWait = FETCH_COOLDOWN - (Date.now() - this.lastFetch);
      console.info(`Requesting too soon. Waiting ${extraWait} ms.`);
      await sleep(extraWait);
    }

    const characters = await fetchCharacters(this.settings);

    const timestamp = Date.now();
    let currXp = 0;
    const logEntriesBuffer = [];
    characters.forEach((character) => {
      const { name, experience, lastActive } = character;
      currXp += experience;

      if (!this.characterXpLog[name]) {
        this.characterXpLog[name] = [];
      }

      const logEntry = {
        type: "experience",
        name,
        timestamp,
        experience,
      };

      this.characterXpLog[name].push(logEntry);

      if (lastActive) {
        logEntriesBuffer.push(JSON.stringify(logEntry));
      }
    });

    this.logger(logEntriesBuffer.join("\n"));
  };

  getXpHr = (cutoffTimestamp = 0) => {
    const xpHrs = [];

    Object.entries(this.characterXpLog).forEach((entry) => {
      const [name, xpLog] = entry;
      const filteredXpLog = xpLog.filter((a) => a.timestamp > cutoffTimestamp);

      if (filteredXpLog.length === 0) {
        return;
      }

      const firstEntry = filteredXpLog[0];
      const lastEntry = filteredXpLog[filteredXpLog.length - 1];

      const xpChange = lastEntry.experience - firstEntry.experience;
      if (xpChange <= 0) {
        return;
      }

      let currentLevel = "";
      let nextLevel = 0;
      let nextLevelXp = 0;

      if (lastEntry.experience < level80Xp) {
        currentLevel = "< 80";
        nextLevel = 80;
        nextLevelXp = level80Xp;
      } else if (lastEntry.experience < level90Xp) {
        currentLevel = "< 90";
        nextLevel = 90;
        nextLevelXp = level90Xp;
      } else {
        const temp = levels.find((a) => a.totalXp > lastEntry.experience);
        currentLevel = temp.level - 1;
        nextLevel = temp.level;
        nextLevelXp = temp.totalXp;
      }

      const msChange = lastEntry.timestamp - firstEntry.timestamp;
      const hourChange = msChange / (1000 * 60 * 60);

      xpHrs.push({
        name,
        xpHr: xpChange / hourChange,
        nextLevel,
        nextLevelXp,
        currentLevel,
        currentXp: lastEntry.experience,
      });
    });

    return xpHrs;
  };
}
