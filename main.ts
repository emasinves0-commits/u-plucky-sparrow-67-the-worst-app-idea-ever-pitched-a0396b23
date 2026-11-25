import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ENTRY_LINE = "Silent Alarm Pro for lighthouse keepers—at $99/year—monitors for ambient noise exceeding 70dB, then immediately sends a push notification acknowledging the obvious: the foghorn is on.";

const MIN_CHARS = 1;
const MAX_CHARS = 240;
const DEFAULT_OUTPUT_DIR = "/output";
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

/** Use the OUTPUT_DIR env override if set (fail hard if blank), else the default. */
function resolveOutputDir(env: NodeJS.ProcessEnv = process.env): string {
  const override = env.OUTPUT_DIR;
  if (override === undefined) {
    return DEFAULT_OUTPUT_DIR;
  }
  if (override.trim().length === 0) {
    throw new Error("OUTPUT_DIR is set but empty after trimming");
  }
  return resolve(override.trim());
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

/** Print the written line with its character and byte counts. */
function reportEntry(line: string): void {
  console.log(line);
  console.log(`characters: ${[...line].length}`);
  console.log(`bytes: ${Buffer.byteLength(line, "utf8")}`);
}

function main(): void {
  const line = validateEntry(ENTRY_LINE);
  const target = join(ensureOutputDir(resolveOutputDir()), OUTPUT_FILE);

  // UTF-8, no trailing newline.
  writeFileSync(target, line, { encoding: "utf8" });

  const written = readFileSync(target, "utf8");
  if (written !== line) {
    throw new Error(`Read-back mismatch for ${target}`);
  }

  reportEntry(written);
}

main();
