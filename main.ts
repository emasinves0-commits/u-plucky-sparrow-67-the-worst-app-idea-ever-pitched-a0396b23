import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_LINE = "Silent Alarm Pro for lighthouse keepers—at $99/year—monitors for ambient noise exceeding 70dB, then immediately sends a push notification acknowledging the obvious: the foghorn is on.";

const MIN_CHARS = 1;
const MAX_CHARS = 240;
const OUTPUT_DIR = "/output";
const OUTPUT_FILE = "entry.txt";

/** Fail hard unless the line is non-empty after trim and 1-240 characters long. */
function validateEntry(line: string): string {
  if (typeof line !== "string") {
    throw new TypeError("Entry must be a string");
  }
  if (line.trim().length === 0) {
    throw new Error("Entry is empty after trimming");
  }
  const chars = [...line].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new RangeError(`Entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`);
  }
  return line;
}

/** Resolve the output directory, creating it (recursively) if needed, and confirm it is a directory. */
function ensureOutputDir(dir: string): string {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (!statSync(dir).isDirectory()) {
    throw new Error(`Output path exists but is not a directory: ${dir}`);
  }
  return dir;
}

function main(): void {
  const line = validateEntry(ENTRY_LINE);
  const target = join(ensureOutputDir(OUTPUT_DIR), OUTPUT_FILE);

  // UTF-8, no trailing newline.
  writeFileSync(target, line, { encoding: "utf8" });

  const written = readFileSync(target, "utf8");
  if (written !== line) {
    throw new Error(`Read-back mismatch for ${target}`);
  }

  console.log(written);
  console.log(`characters: ${[...written].length}`);
  console.log(`bytes: ${Buffer.byteLength(written, "utf8")}`);
}

main();
