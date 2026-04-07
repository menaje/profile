import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const COMMANDS = new Set(["publish", "validate"]);
const STRING_OPTIONS = new Set([
  "slug",
  "title",
  "description",
  "content-file",
  "tags",
  "published-date",
  "format",
  "og-image",
]);
const BOOLEAN_OPTIONS = new Set(["draft", "overwrite", "dry-run", "help"]);

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

function printHelp(command = null) {
  if (command === "publish") {
    console.log(`Usage: npm run blog:publish -- --slug <slug> --title <title> --description <description> --content-file <path> [options]

Options:
  --slug <slug>                Stable blog slug
  --title <title>              Blog title
  --description <description>  Blog description
  --content-file <path>        Local body content path
  --tags <csv>                 Comma-separated tags
  --published-date <date>      Optional YYYY-MM-DD override
  --format <md|mdx>            Output format scaffold (default: mdx)
  --og-image <path>            Optional og image path
  --draft                      Mark the post as draft
  --overwrite                  Allow updating an existing post later
  --dry-run                    Reserved for WP-107 dry-run output
  --help                       Show publish help

Notes:
  - WP-106 wires the CLI scaffold, argument parsing, and auth resolution only.
  - The actual GitHub Contents API publish flow is intentionally deferred to WP-108.`);
    return;
  }

  if (command === "validate") {
    console.log(`Usage: npm run blog:validate -- --slug <slug> --title <title> --description <description> --content-file <path> [options]

Options:
  --slug <slug>                Stable blog slug
  --title <title>              Blog title
  --description <description>  Blog description
  --content-file <path>        Local body content path
  --tags <csv>                 Comma-separated tags
  --published-date <date>      Optional YYYY-MM-DD override
  --format <md|mdx>            Output format scaffold (default: mdx)
  --og-image <path>            Optional og image path
  --draft                      Mark the post as draft
  --dry-run                    Reserved for WP-107 dry-run output
  --help                       Show validate help

Notes:
  - WP-106 wires the CLI scaffold and option parsing only.
  - Lightweight frontmatter validation lands in WP-107.`);
    return;
  }

  console.log(`Usage:
  node ./scripts/blog-publish.mjs <command> [options]
  npm run blog:publish -- [options]
  npm run blog:validate -- [options]

Commands:
  publish   Parse publish inputs and resolve GitHub authentication
  validate  Parse validate inputs for the local preflight flow

Run a command with --help for command-specific options.`);
}

function isBooleanLike(value) {
  return value === "true" || value === "false";
}

function parseBooleanLike(value, optionName) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new CliError(`Invalid boolean value for --${optionName}: ${value}`);
}

function parseOptionToken(token, nextToken) {
  if (token === "--") {
    throw new CliError("Unexpected bare -- separator.");
  }

  if (!token.startsWith("--")) {
    throw new CliError(`Unexpected argument: ${token}`);
  }

  const body = token.slice(2);

  if (!body) {
    throw new CliError("Invalid empty option.");
  }

  if (body.startsWith("no-")) {
    const optionName = body.slice(3);

    if (!BOOLEAN_OPTIONS.has(optionName)) {
      throw new CliError(`Unknown boolean option: --${body}`);
    }

    return { key: optionName, value: false, consumedNext: false };
  }

  const [optionName, inlineValue] = body.split("=", 2);

  if (BOOLEAN_OPTIONS.has(optionName)) {
    if (inlineValue === undefined) {
      return { key: optionName, value: true, consumedNext: false };
    }

    if (!isBooleanLike(inlineValue)) {
      throw new CliError(`Invalid boolean value for --${optionName}: ${inlineValue}`);
    }

    return {
      key: optionName,
      value: parseBooleanLike(inlineValue, optionName),
      consumedNext: false,
    };
  }

  if (!STRING_OPTIONS.has(optionName)) {
    throw new CliError(`Unknown option: --${optionName}`);
  }

  if (inlineValue !== undefined) {
    if (!inlineValue) {
      throw new CliError(`Missing value for --${optionName}`);
    }

    return { key: optionName, value: inlineValue, consumedNext: false };
  }

  if (nextToken === undefined || nextToken.startsWith("--")) {
    throw new CliError(`Missing value for --${optionName}`);
  }

  return { key: optionName, value: nextToken, consumedNext: true };
}

function normalizeOptions(rawOptions) {
  const format = rawOptions.format ?? "mdx";

  if (format !== "md" && format !== "mdx") {
    throw new CliError(`Invalid value for --format: ${format}. Expected md or mdx.`);
  }

  return {
    slug: rawOptions.slug,
    title: rawOptions.title,
    description: rawOptions.description,
    contentFile: rawOptions["content-file"]
      ? resolve(process.cwd(), rawOptions["content-file"])
      : undefined,
    tags: rawOptions.tags,
    publishedDate: rawOptions["published-date"],
    format,
    ogImage: rawOptions["og-image"],
    draft: rawOptions.draft ?? false,
    overwrite: rawOptions.overwrite ?? false,
    dryRun: rawOptions["dry-run"] ?? false,
    help: rawOptions.help ?? false,
  };
}

function parseCli(argv) {
  if (argv.length === 0) {
    return {
      command: null,
      options: normalizeOptions({ help: true }),
    };
  }

  const [firstToken, ...rest] = argv;

  if (firstToken === "--help" || firstToken === "-h") {
    return {
      command: null,
      options: normalizeOptions({ help: true }),
    };
  }

  if (!COMMANDS.has(firstToken)) {
    throw new CliError(`Unknown command: ${firstToken}`);
  }

  const rawOptions = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === "-h") {
      rawOptions.help = true;
      continue;
    }

    const parsed = parseOptionToken(token, rest[index + 1]);
    rawOptions[parsed.key] = parsed.value;

    if (parsed.consumedNext) {
      index += 1;
    }
  }

  return {
    command: firstToken,
    options: normalizeOptions(rawOptions),
  };
}

function requireOptions(command, options) {
  const requiredKeys = ["slug", "title", "description", "contentFile"];
  const missing = requiredKeys.filter((key) => !options[key]);

  if (missing.length > 0) {
    throw new CliError(
      `Missing required option(s) for ${command}: ${missing
        .map((key) => `--${key === "contentFile" ? "content-file" : key}`)
        .join(", ")}`,
    );
  }
}

function resolveGitHubAuth() {
  const blogToken = process.env.BLOG_GITHUB_TOKEN?.trim();
  if (blogToken) {
    return { token: blogToken, source: "BLOG_GITHUB_TOKEN" };
  }

  const githubToken = process.env.GITHUB_TOKEN?.trim();
  if (githubToken) {
    return { token: githubToken, source: "GITHUB_TOKEN" };
  }

  try {
    const token = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    if (token) {
      return { token, source: "gh auth token" };
    }
  } catch {
    // The fallback is intentionally silent here so the user gets one clear auth error below.
  }

  throw new CliError(
    "GitHub 인증이 필요합니다. BLOG_GITHUB_TOKEN 또는 GITHUB_TOKEN을 설정하거나 gh auth login을 실행하세요.",
  );
}

function printCommandSummary(command, options, extras = []) {
  const lines = [
    `${command} scaffold ready`,
    `slug: ${options.slug}`,
    `title: ${options.title}`,
    `description: ${options.description}`,
    `content file: ${options.contentFile}`,
    `format: ${options.format}`,
    `draft: ${String(options.draft)}`,
    `overwrite: ${String(options.overwrite)}`,
    `dry-run: ${String(options.dryRun)}`,
  ];

  if (options.tags) {
    lines.push(`tags: ${options.tags}`);
  }

  if (options.publishedDate) {
    lines.push(`published date: ${options.publishedDate}`);
  }

  if (options.ogImage) {
    lines.push(`og image: ${options.ogImage}`);
  }

  lines.push(...extras);
  console.log(lines.join("\n"));
}

function handlePublish(options) {
  requireOptions("publish", options);
  const auth = resolveGitHubAuth();

  printCommandSummary("publish", options, [
    `auth source: ${auth.source}`,
    "next step: GitHub Contents API publish flow is implemented in WP-108.",
  ]);
}

function handleValidate(options) {
  requireOptions("validate", options);

  printCommandSummary("validate", options, [
    "next step: lightweight frontmatter validation is implemented in WP-107.",
  ]);
}

function main() {
  const { command, options } = parseCli(process.argv.slice(2));

  if (!command || options.help) {
    printHelp(command);
    return;
  }

  if (command === "publish") {
    handlePublish(options);
    return;
  }

  if (command === "validate") {
    handleValidate(options);
    return;
  }

  throw new CliError(`Unsupported command: ${command}`);
}

try {
  main();
} catch (error) {
  if (error instanceof CliError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
