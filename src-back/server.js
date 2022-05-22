import { readSettings } from "./settings.js";
import { fetchCharacters } from "./ggg.js";
import { makeTail } from "./log-watch.js";

const main = async () => {
  const settings = readSettings();

  // const a = await fetchCharacters(settings);

  // console.log("a", a);

  makeTail("./test.txt");
};

main();
