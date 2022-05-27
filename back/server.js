import express, { json } from "express";
import { createServer } from "http";
import { appendFile } from "fs";
import { resolve } from "path";

import { readSettings } from "./settings.js";
import { makeTail } from "./log-watch.js";
import LocationState from "./state-trackers/location-state.js";
import CharacterState from "./state-trackers/character-state.js";

const PORT = 21842;
const app = express();
const server = createServer(app);

app.set("port", PORT);
app.use(json());

const settings = readSettings();

const logFilePath = resolve(process.cwd(), "logs", "main.log");

const logger = (logLine) => {
  appendFile(logFilePath, `${logLine}\n`, {}, () => {});
};

const locationState = new LocationState({ logger });
const characterState = new CharacterState({
  logger,
  settings,
});
locationState.onEnter = async (area) => {
  await characterState.updateXp(5000, true);
};

const main = async () => {
  logger(
    JSON.stringify({
      type: "startup",
      timestamp: Date.now(),
    })
  );
  const stopper1 = makeTail(settings.steamClientPath, async (line) => {
    // console.log(line);
    locationState.addLine(line);
  });
  const stopper2 = makeTail(settings.gggClientPath, async (line) => {
    // console.log(line);
    locationState.addLine(line);
  });
  const stopper3 = makeTail(settings.epicClientPath, async (line) => {
    // console.log(line);
    locationState.addLine(line);
  });

  characterState.startInterval();
};

app.get("/info", (_req, res, _next) => {
  const fractionInMaps = locationState.msInMaps / locationState.msTotal;
  const percentInMaps = fractionInMaps * 100;
  const percentInTown = (1 - fractionInMaps) * 100;

  res.json({
    percentInMaps,
    percentInTown,
    xphr: characterState.getXpHr(Date.now() - 1000 * 60 * 30),
  });
});

app.post("/reset", (_req, res, _next) => {
  characterState.reset();
  locationState.reset();
  logger(
    JSON.stringify({
      type: "reset",
      timestamp: Date.now(),
    })
  );
  res.sendStatus(201);
});

app.get("/debug", (_req, res, _next) => {
  console.info("locationState.eventLog", locationState.eventLog);
  console.info("characterState.characterXpLog", characterState.characterXpLog);
  locationState.onDebug();
  res.sendStatus(201);
});

app.use(express.static("front"));

server.listen(app.get("port"), () => {
  console.info(`${new Date()} http://localhost:${app.get("port")}`);
});

main();
