import { parseLine } from "./log-parser.js";
import { isTown } from "./poe-locations.js";

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

  addLine = (line) => {
    const a = parseLine(line);

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

    if (a.type === "command") {
      console.log("a", a);
      switch (a.command) {
        case "reset":
          this.msInMaps = 0;
          this.msTotal = 0;
          this.lastEntered.map = a.timestamp;
          this.lastEntered.town = a.timestamp;
          this.onReset();
          break;
        case "debug":
          this.onDebug();
          break;
        default:
        // nothing
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
