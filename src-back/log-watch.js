import { watch } from "fs";
import { readFile } from "fs/promises";

export const makeTail = (filePath, eventHandler) => {
  let fileContents = "";
  const watcher = watch(filePath, async (event, _filename) => {
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
