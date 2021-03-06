import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import YAML from "yaml";

const settingsFile = resolve(process.cwd(), "settings.yml");
const defaultSettingsFile = resolve(process.cwd(), "settings-default.yml");

const defaultSettings = {
  accounts: ["example account"],
  userAgent: "-",
  gggClientPath:
    "C:\\Program Files (x86)\\Grinding Gear Games\\Path of Exile\\logs\\Client.txt",
  steamClientPath:
    "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile\\logs\\Client.txt",
  epicClientPath:
    "C:\\Program Files (x86)\\Epic Games\\EpicLibrary\\PathOfExile\\logs\\Client.txt",
};

export const readSettings = () => {
  writeFileSync(defaultSettingsFile, YAML.stringify(defaultSettings));
  try {
    return YAML.parse(readFileSync(settingsFile).toString());
  } catch (e) {
    writeFileSync(settingsFile, YAML.stringify(defaultSettings));
  }

  return defaultSettings;
};
