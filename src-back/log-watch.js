import { watch, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { basename, dirname } from "path";

import { sleep } from "./utils.js";

export const makeTailWatch = (filePath, eventHandler) => {
  const directory = dirname(filePath);
  const filename = basename(filePath);
  console.log("directory", directory);
  console.log("filename", filename);

  let fileContents = "";
  try {
    fileContents = readFileSync(filePath).toString();
  } catch (e) {
    console.error(e);
  }

  console.log("fileContents", fileContents.length);

  const watcher = watch(directory, async (event, _filename) => {
    console.log("event", event);
    if (event !== "change") {
      return;
    }

    try {
      const newFileContents = (await readFile(filePath)).toString();
      if (newFileContents === fileContents) {
        return;
      }

      console.log("prev", fileContents);
      console.log("curr", newFileContents);
      // processing here

      fileContents = newFileContents;
    } catch (e) {
      console.error(e);
    }
  });

  return watcher;
};

// By polling
export const makeTailPoll = (filePath, eventHandler, delayMs = 500) => {
  let keepGoing = true;

  const watcher = async () => {
    let fileContents = "";
    let newFileContents = "";
    try {
      fileContents = (await readFile(filePath)).toString();

      while (keepGoing) {
        try {
          newFileContents = (await readFile(filePath)).toString();
          if (newFileContents === fileContents) {
            continue;
          }

          const diff = newFileContents.replace(fileContents.trim(), "");

          const lines = diff
            .split("\n")
            .map((a) => a.replaceAll("\r", ""))
            .filter((a) => a.trim());

          for (const line of lines) {
            try {
              eventHandler(line);
            } catch (e) {
              console.error(e);
            }
          }

          fileContents = newFileContents;
        } catch (e) {
          console.error(e);
        }

        await sleep(delayMs);
      }

      console.info("stopping");
    } catch (e) {
      console.error(e);
    }
  };

  watcher();

  return () => {
    keepGoing = false;
  };
};

export const makeTail = makeTailPoll;
