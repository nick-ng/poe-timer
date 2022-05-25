import { cleanLine } from "./log-parser.js";
import { isTown } from "./poe-locations.js";

const enteredRegex = /^: You have entered /;
const characterSelectRegex = /^Connected to \S+\.pathofexile\.com in \d+ms\.$/;

export default class PoeLocationState {
  constructor() {
    this.msInMaps = 0;
    this.msTotal = 0;
    this.currentLocation = "";
    this.inTown = true;
    this.lastEntered = {
      town: Date.now(),
      map: Date.now(),
    };
    this.eventLog = [];
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

    if (a.type === "entered") {
      this.onEnter(a.area);
      // If you enter a town and were previously not in a town
      if (isTown(a.area) && !this.inTown) {
        // you are now in a town
        this.inTown = true;
        this.lastEntered.town = a.timestamp;

        this.msInMaps += a.timestamp - this.lastEntered.map;
      } else if (!isTown(a.area) && this.inTown) {
        this.inTown = false;
        this.lastEntered.map = a.timestamp;
      }
    }

    if (a.type) {
      if (this.lastEvent) {
        this.msTotal += a.timestamp - this.lastEvent.timestamp;
      }

      this.eventLog.push(a);
    }
  };
}
