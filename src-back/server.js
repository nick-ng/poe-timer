import express, { json } from "express";
import { createServer } from "http";
import { appendFile } from "fs";
import { resolve } from "path";

import { readSettings } from "./settings.js";
import { makeTail } from "./log-watch.js";
import PoeLocationState from "../src-common/poe-location-state.js";
import PoeCharacterState from "../src-common/poe-character-state.js";
import { isTown } from "../src-common/poe-locations.js";

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

const poeLocationState = new PoeLocationState({ logger });
const poeCharacterState = new PoeCharacterState({
  logger,
  settings,
});
poeLocationState.onEnter = async (area) => {
  await poeCharacterState.updateXp(5000, true);
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
    poeLocationState.addLine(line);
  });
  const stopper2 = makeTail(settings.gggClientPath, async (line) => {
    // console.log(line);
    poeLocationState.addLine(line);
  });
  const stopper3 = makeTail(settings.epicClientPath, async (line) => {
    // console.log(line);
    poeLocationState.addLine(line);
  });
};

app.get("/info", (_req, res, _next) => {
  const fractionInMaps = poeLocationState.msInMaps / poeLocationState.msTotal;
  const percentInMaps = fractionInMaps * 100;
  const percentInTown = (1 - fractionInMaps) * 100;

  res.json({
    percentInMaps,
    percentInTown,
    xphr: poeCharacterState.getXpHr(Date.now() - 1000 * 60 * 30),
  });
});

app.post("/reset", (_req, res, _next) => {
  poeCharacterState.reset();
  poeLocationState.reset();
  logger(
    JSON.stringify({
      type: "reset",
      timestamp: Date.now(),
    })
  );
  res.sendStatus(201);
});

app.get("/debug", (_req, res, _next) => {
  console.info("poeLocationState.eventLog", poeLocationState.eventLog);
  console.info(
    "poeCharacterState.characterXpLog",
    poeCharacterState.characterXpLog
  );
  poeLocationState.onDebug();
  res.sendStatus(201);
});

app.use(express.static("static"));

server.listen(app.get("port"), () => {
  console.info(`${new Date()} Website server listening on ${PORT}.`);
});

main();
