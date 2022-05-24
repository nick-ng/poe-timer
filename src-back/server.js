import express, { json } from "express";
import { createServer } from "http";

import { readSettings } from "./settings.js";
import { fetchCharacters } from "./ggg.js";
import { makeTail } from "./log-watch.js";
import PoeLocationState from "../src-common/poe-location-state.js";
import { sleep } from "./utils.js";
import { isTown } from "../src-common/poe-locations.js";

const PORT = 21842;
const app = express();
const server = createServer(app);

app.set("port", PORT);
app.use(json());

const settings = readSettings();
let lastFetch = 0;
const fetchCooldown = 5000;
let experienceLog = [];
let xphr = 0;

const updateXPhr = async () => {
  const sinceLastFetch = Date.now() - lastFetch;
  if (sinceLastFetch < fetchCooldown) {
    return;
  }
  lastFetch = Date.now();
  const a = await fetchCharacters(settings);
  const b = a.filter((character) => character.lastActive);

  if (b.length === 0) {
    return xphr;
  }

  const character = b[0];

  const newestLog = {
    timestamp: Date.now(),
    experience: character.experience,
  };

  experienceLog.push(newestLog);

  const start = experienceLog[0];

  const xpChange = newestLog.experience - start.experience;
  const hourChange = (newestLog.timestamp - start.timestamp) / 3600000;

  xphr = xpChange / hourChange;
  return xphr;
};

const poeLocationState = new PoeLocationState();
poeLocationState.onReset = () => {
  console.log("experienceLog", experienceLog);
  experienceLog = [];
  console.log("reset", experienceLog);
  updateXPhr();
};
poeLocationState.onEnter = async (area) => {
  if (isTown(area)) {
    await sleep(5000);
    await updateXPhr();

    console.log(`${poeLocationState.inMapPercent}, XP/hr: ${xphr.toFixed(0)}`);
  }
};
poeLocationState.onDebug = () => {
  console.log("poeLocationState.eventLog", poeLocationState.eventLog);
  console.log("experienceLog", experienceLog);
};

const main = async () => {
  updateXPhr();

  const stopper = makeTail(settings.steamClientPath, async (line) => {
    // console.log(line);
    poeLocationState.addLine(line);
  });
};

app.get("/info", (_req, res, _next) => {
  const fractionInMaps = poeLocationState.msInMaps / poeLocationState.msTotal;
  const percentInMaps = fractionInMaps * 100;
  const percentInTown = (1 - fractionInMaps) * 100;
  const currentXp =
    experienceLog.length > 0
      ? experienceLog[experienceLog.length - 1].experience
      : 0;
  res.json({ percentInMaps, percentInTown, xphr, currentXp });
});

app.post("/reset", (_req, res, _next) => {
  poeLocationState.onReset();
  res.sendStatus(201);
});

app.get("/debug", (_req, res, _next) => {
  poeLocationState.onDebug();
  res.sendStatus(201);
});

app.use(express.static("static"));

server.listen(app.get("port"), () => {
  console.info(`${new Date()} Website server listening on ${PORT}.`);
});

main();
