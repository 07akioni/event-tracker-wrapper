import type { Level } from "./ilw";

export function formatLevel(level: Level) {
  switch (level) {
    case "info":
      return "INFO ";
    case "debug":
      return "DEBUG";
    case "warn":
      return "WARN";
    case "error":
      return "ERROR";
  }
}
