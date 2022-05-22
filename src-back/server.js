import { readSettings } from "./settings.js";
import { fetchCharacters } from "./ggg.js";
import { makeTail } from "./log-watch.js";

const sleep = (ms) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const main = async () => {
  const settings = readSettings();

  let splits = [{ experience: 0, timestamp: 0, xphr: 0 }];

  while (true) {
    const a = await fetchCharacters(settings);
    const b = a.filter((character) => character.lastActive);

    if (b.length === 0) {
      continue;
    }

    const character = b[0];
    const newTimestamp = Date.now();

    const changeInExperience = character.experience - splits[0].experience;
    const changeInTime = newTimestamp - splits[0].timestamp;

    const xphr = (changeInExperience / changeInTime) * 3600000;
    console.log("XP", character.experience, "XP / hr", xphr);

    splits.unshift({
      experience: character.experience,
      timestamp: newTimestamp,
      xphr,
    });

    splits = splits.slice(0, 10);

    await sleep(100000);
  }

  // makeTail("./test.txt");
};

main();
