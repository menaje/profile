import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const sourceDir = path.join(projectRoot, "html", "shared", "fonts");
const outputDir = path.join(projectRoot, "public", "fonts");

const subsetTargets = [
  {
    input: "Pretendard-Regular.otf",
    output: "pretendard-regular-subset.woff2",
  },
  {
    input: "Pretendard-SemiBold.otf",
    output: "pretendard-semibold-subset.woff2",
  },
  {
    input: "Pretendard-Bold.otf",
    output: "pretendard-bold-subset.woff2",
  },
  {
    input: "NotoSansCJKkr-Regular.otf",
    output: "noto-sans-cjk-kr-regular-subset.woff2",
  },
  {
    input: "NotoSansCJKkr-Bold.otf",
    output: "noto-sans-cjk-kr-bold-subset.woff2",
  },
];

function formatSize(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function assertPythonDependencies() {
  const result = spawnSync("python3", ["-c", "import fontTools, brotli"], {
    encoding: "utf8",
  });

  if (result.status === 0) {
    return;
  }

  const errorMessage =
    result.stderr.trim() ||
    result.stdout.trim() ||
    "python3, fontTools, or brotli is unavailable.";

  console.error(
    "[error] WOFF2 generation requires python3 + fontTools + brotli.",
  );
  console.error(`[error] ${errorMessage}`);
  process.exit(1);
}

function writeSubsetTextFile(textFilePath) {
  const pythonScript = `
from pathlib import Path
import json
import sys

def decode_rows(start, end):
    chars = []
    for high in range(start, end + 1):
        for low in range(0xA1, 0xFF):
            try:
                decoded = bytes([high, low]).decode("euc_kr")
            except UnicodeDecodeError:
                continue
            if len(decoded) == 1:
                chars.append(decoded)
    return "".join(chars)

latin = "".join(chr(codepoint) for codepoint in range(0x20, 0x0100))
ksx_special = decode_rows(0xA1, 0xA4)
hangul = decode_rows(0xB0, 0xC8)

if len(ksx_special) != 352:
    raise SystemExit("Expected 352 KS X 1001 special characters.")

if len(hangul) != 2350:
    raise SystemExit("Expected 2350 Hangul syllables.")

subset_text = "".join(dict.fromkeys(latin + ksx_special + hangul))
Path(sys.argv[1]).write_text(subset_text, encoding="utf-8")
print(json.dumps({
    "ksxSpecial": len(ksx_special),
    "hangul": len(hangul),
    "subsetChars": len(subset_text),
}, ensure_ascii=True))
`.trim();

  const result = spawnSync("python3", ["-c", pythonScript, textFilePath], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 5,
  });

  if (result.status !== 0) {
    const errorMessage =
      result.stderr.trim() ||
      result.stdout.trim() ||
      "Failed to generate subset text.";

    console.error("[error] Failed to prepare subset character set.");
    console.error(`[error] ${errorMessage}`);
    process.exit(result.status ?? 1);
  }

  const details = JSON.parse(result.stdout);
  console.log(
    `[ok] charset prepared (${details.hangul} Hangul, ${details.ksxSpecial} KS X 1001 special, ${details.subsetChars} total characters)`,
  );
}

function runSubset(inputPath, outputPath, textFilePath) {
  const result = spawnSync(
    "python3",
    [
      "-m",
      "fontTools",
      "subset",
      inputPath,
      `--text-file=${textFilePath}`,
      `--output-file=${outputPath}`,
      "--flavor=woff2",
      "--no-hinting",
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10,
    },
  );

  if (result.status === 0) {
    return;
  }

  const errorMessage =
    result.stderr.trim() ||
    result.stdout.trim() ||
    "fontTools subset failed without stderr output.";

  console.error(`[error] Failed to subset ${path.basename(inputPath)}.`);
  console.error(`[error] ${errorMessage}`);
  process.exit(result.status ?? 1);
}

function main() {
  assertPythonDependencies();
  mkdirSync(outputDir, { recursive: true });

  const tempDir = mkdtempSync(path.join(tmpdir(), "font-subset-"));
  const textFilePath = path.join(tempDir, "subset.txt");

  try {
    writeSubsetTextFile(textFilePath);

    for (const target of subsetTargets) {
      const inputPath = path.join(sourceDir, target.input);
      const outputPath = path.join(outputDir, target.output);

      if (!existsSync(inputPath)) {
        console.error(`[error] Missing source font: ${inputPath}`);
        process.exit(1);
      }

      runSubset(inputPath, outputPath, textFilePath);

      const size = statSync(outputPath).size;
      console.log(
        `[ok] ${target.output} generated from ${target.input} (${formatSize(size)})`,
      );
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
