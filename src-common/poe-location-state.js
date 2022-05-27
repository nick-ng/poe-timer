import { cleanLine } from "./log-parser.js";
import { isTown } from "./poe-locations.js";

const enteredRegex = /^: You have entered /;
const characterSelectRegex = /^Connected to \S+\.pathofexile\.com in \d+ms\.$/;

export default class PoeLocationState {
  constructor(options = {}) {
    const { logger } = options;
    this.logger = logger;
    this.msInMaps = 0;
    this.msTotal = 0;
    this.currentLocation = "";
    this.inTown = true;
    this.lastEntered = {
      town: Date.now(),
      map: Date.now(),
    };
    this.eventLog = [
      {
        type: "reset",
        timestamp: Date.now(),
      },
    ];
    this.onReset = () => {};
    this.onEnter = (area) => {};
    this.onDebug = () => {};
  }

  get lastEvent() {
    return this.eventLog[this.eventLog.length - 1];
  }

  get inMapPercent() {
    const fractionInMaps = this.msInMaps / this.msTotal;
    const percentInMaps = fractionInMaps * 100;
    const percentInTown = (1 - fractionInMaps) * 100;
    return `in maps: ${Math.round(percentInMaps)}%, in town ${Math.round(
      percentInTown
    )}%`;
  }

  reset = () => {
    this.msInMaps = 0;
    this.msTotal = 0;
    this.lastEntered.map = Date.now();
    this.lastEntered.town = Date.now();
    this.eventLog = [
      {
        type: "reset",
        timestamp: Date.now(),
      },
    ];
    this.onReset();
  };

  parseLine = (line) => {
    const { timestamp, lineRest } = cleanLine(line);

    const logEvent = {
      timestamp,
      type: null,
    };

    if (lineRest.match(enteredRegex)) {
      logEvent.type = "entered";
      logEvent.area = lineRest.replace(enteredRegex, "").replace(/\.$/, "");
    } else if (lineRest.match(characterSelectRegex)) {
      logEvent.type = "entered";
      logEvent.area = "Character Select";
    }

    return logEvent;
  };

  addLine = (line) => {
    const a = this.parseLine(line);

    if (!["entered"].includes(a.type)) {
      return;
    }

    // If you weren't in a town before
    if (!this.inTown && this.lastEvent) {
      // You were in a map so increase the time in maps
      this.msInMaps += a.timestamp - this.lastEvent.timestamp;
    }

    // If you enter a town and were previously not in a town
    if (isTown(a.area) && !this.inTown) {
      // you are now in a town
      this.inTown = true;
      this.lastEntered.town = a.timestamp;
    } else if (!isTown(a.area) && this.inTown) {
      this.inTown = false;
      this.lastEntered.map = a.timestamp;
    }

    this.inTown = isTown(a.area);

    if (this.lastEvent) {
      this.msTotal += a.timestamp - this.lastEvent.timestamp;
    }

    this.eventLog.push(a);
    this.logger(JSON.stringify(a));

    this.onEnter(a.area);
  };
}
