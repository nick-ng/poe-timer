const lineStartRegex =
  /^\d{4}\/\d{2}\/\d{2} \d{1,2}:\d{2}:\d{2} \d+ \S+ \[\S+ \S+\ \d+\] /i;
const enteredRegex = /^: You have entered /;
const characterSelectRegex = /^Connected to \S+\.pathofexile\.com in \d+ms\.$/;
const messageRegex = /^(<\S{1,6}> ){0,1}\S+?: /;

export const cleanLine = (line) => {
  const temp = line.match(lineStartRegex);

  if (temp) {
    const lineStart = temp[0];

    const lineRest = line.replace(lineStartRegex, "");

    const [yyyymmdd, hhmmss] = lineStart.split(" ");

    const [yyyy, mm, dd] = yyyymmdd.split("/");
    const [hh, ii, ss] = hhmmss.split(":");

    const date = new Date(yyyy, mm - 1, dd, hh, ii, ss);

    return {
      date,
      timestamp: date.valueOf(),
      lineRest,
    };
  }

  return {
    timestamp: Date.now(),
    lineRest: line,
  };
};

export const parseLine = (line) => {
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
  } else if (lineRest.match(messageRegex)) {
    const message = lineRest.replace(messageRegex, "");
    if (message === "!reset") {
      logEvent.type = "command";
      logEvent.command = "reset";
    }
    if (message === "!debug") {
      logEvent.type = "command";
      logEvent.command = "debug";
    }
  } else {
    // console.log("lineRest", lineRest);
  }

  return logEvent;
};
