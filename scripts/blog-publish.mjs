import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

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
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FRONTMATTER_BLOCK_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const BLOG_CONTENT_DIRECTORY = "src/content/blog";
const GITHUB_API_BASE_URL = "https://api.github.com";
const GITHUB_API_ACCEPT = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";

const BlogFrontmatterSchema = z.object({
  title: z.string().min(1, "title is required."),
  description: z.string().min(1, "description is required."),
  publishedDate: z.string().refine(isValidDateString, {
    message: "must use YYYY-MM-DD format.",
  }),
  updatedDate: z
    .string()
    .refine(isValidDateString, {
      message: "must use YYYY-MM-DD format.",
    })
    .optional(),
  draft: z.boolean(),
  tags: z.array(z.string()),
  ogImage: z.string().min(1, "ogImage must not be empty.").optional(),
});

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
  --dry-run                    Print the generated MDX and skip auth/API calls
  --help                       Show publish help

Notes:
  - publish --dry-run prints the generated document locally with no auth or network calls.
  - publish without --dry-run commits src/content/blog/{slug}.{ext} through the GitHub Contents API.`);
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
  --help                       Show validate help

Notes:
  - Validates generated frontmatter locally with no auth or network calls.
  - Prints "Valid" when the assembled document passes the lightweight checks.`);
    return;
  }

  console.log(`Usage:
  node ./scripts/blog-publish.mjs <command> [options]
  npm run blog:publish -- [options]
  npm run blog:validate -- [options]

Commands:
  publish   Assemble a blog post and publish, or preview with --dry-run
  validate  Validate generated frontmatter locally

Run a command with --help for command-specific options.`);
}

function isValidDateString(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));
  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function getTodayDateString(date = new Date()) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDateValue(value, fieldName) {
  if (!isValidDateString(value)) {
    throw new CliError(`Invalid ${fieldName}: ${value}. Expected YYYY-MM-DD.`);
  }

  return value;
}

function parseTags(rawTags) {
  if (!rawTags) {
    return [];
  }

  return rawTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function stripLeadingFrontmatter(content) {
  return content.replace(FRONTMATTER_BLOCK_PATTERN, "");
}

function readContentBody(contentFile) {
  try {
    const rawContent = readFileSync(contentFile, "utf8").replace(/^\uFEFF/, "");
    const normalizedBody = stripLeadingFrontmatter(rawContent)
      .replace(/^\r?\n+/, "")
      .trimEnd();

    if (!normalizedBody.trim()) {
      throw new CliError("Content body must not be empty.");
    }

    return normalizedBody;
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }

    if (error?.code === "ENOENT") {
      throw new CliError(`Content file not found: ${contentFile}`);
    }

    throw new CliError(`Unable to read content file: ${contentFile}`);
  }
}

function buildFrontmatter(options, overrides = {}) {
  const today = overrides.today ?? getTodayDateString();
  const hasPublishedDateOverride = Object.hasOwn(overrides, "publishedDate");
  const hasUpdatedDateOverride = Object.hasOwn(overrides, "updatedDate");
  const publishedDate = normalizeDateValue(
    hasPublishedDateOverride ? overrides.publishedDate : (options.publishedDate ?? today),
    "publishedDate",
  );
  const updatedDate = hasUpdatedDateOverride
    ? overrides.updatedDate
    : options.overwrite
      ? today
      : undefined;

  return {
    title: options.title.trim(),
    description: options.description.trim(),
    publishedDate,
    updatedDate,
    draft: options.draft,
    tags: parseTags(options.tags),
    ogImage: options.ogImage?.trim() || undefined,
  };
}

function formatValidationIssues(issues) {
  return issues
    .map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
      return `${field}: ${issue.message}`;
    })
    .join("\n");
}

function validateGeneratedPost(frontmatter, body) {
  const result = BlogFrontmatterSchema.safeParse(frontmatter);

  if (!result.success) {
    throw new CliError(`Invalid frontmatter:\n${formatValidationIssues(result.error.issues)}`);
  }

  if (!body.trim()) {
    throw new CliError("Content body must not be empty.");
  }
}

function serializeYamlString(value) {
  return JSON.stringify(value);
}

function serializeTags(tags) {
  if (tags.length === 0) {
    return "[]";
  }

  return `[${tags.map((tag) => serializeYamlString(tag)).join(", ")}]`;
}

function serializeFrontmatter(frontmatter) {
  const lines = [
    "---",
    `title: ${serializeYamlString(frontmatter.title)}`,
    `description: ${serializeYamlString(frontmatter.description)}`,
    `publishedDate: ${frontmatter.publishedDate}`,
  ];

  if (frontmatter.updatedDate) {
    lines.push(`updatedDate: ${frontmatter.updatedDate}`);
  }

  lines.push(`draft: ${String(frontmatter.draft)}`);
  lines.push(`tags: ${serializeTags(frontmatter.tags)}`);

  if (frontmatter.ogImage) {
    lines.push(`ogImage: ${serializeYamlString(frontmatter.ogImage)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function buildDocument(frontmatter, body) {
  return `${serializeFrontmatter(frontmatter)}\n\n${body}\n`;
}

function buildGeneratedPost(options, body, overrides = {}) {
  const frontmatter = buildFrontmatter(options, overrides);

  validateGeneratedPost(frontmatter, body);

  return {
    body,
    frontmatter,
    document: buildDocument(frontmatter, body),
  };
}

function prepareGeneratedPost(options, overrides = {}) {
  const body = readContentBody(options.contentFile);
  return buildGeneratedPost(options, body, overrides);
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

function parseGitHubRepositoryUrl(rawUrl) {
  if (!rawUrl) {
    return null;
  }

  const normalizedUrl = rawUrl
    .trim()
    .replace(/^git\+/, "")
    .replace(/\/$/, "");
  const match = normalizedUrl.match(/github\.com[:/](?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/);

  if (!match?.groups?.owner || !match.groups.repo) {
    return null;
  }

  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
  };
}

function readPackageRepositoryUrl() {
  try {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));

    if (typeof packageJson.repository === "string") {
      return packageJson.repository;
    }

    if (packageJson.repository && typeof packageJson.repository.url === "string") {
      return packageJson.repository.url;
    }
  } catch {
    // Fall through to the final error message in resolveGitHubRepository().
  }

  return null;
}

function resolveGitHubRepository() {
  try {
    const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    const repository = parseGitHubRepositoryUrl(remoteUrl);

    if (repository) {
      return { ...repository, source: "git remote origin" };
    }
  } catch {
    // Fall back to package.json metadata when git remote lookup is unavailable.
  }

  const repositoryUrl = readPackageRepositoryUrl();
  const packageRepository = parseGitHubRepositoryUrl(repositoryUrl);

  if (packageRepository) {
    return { ...packageRepository, source: "package.json repository" };
  }

  throw new CliError(
    "GitHub repository를 확인할 수 없습니다. origin remote 또는 package.json repository.url을 점검하세요.",
  );
}

function buildBlogContentPath(slug, extension) {
  return `${BLOG_CONTENT_DIRECTORY}/${slug}.${extension}`;
}

function buildGitHubContentsUrl(repository, contentPath) {
  const encodedPath = contentPath.split("/").map(encodeURIComponent).join("/");
  return `${GITHUB_API_BASE_URL}/repos/${repository.owner}/${repository.repo}/contents/${encodedPath}`;
}

async function requestGitHubJson(url, { token, method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: GITHUB_API_ACCEPT,
        Authorization: `Bearer ${token}`,
        "User-Agent": "blog-publish-cli",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new CliError(
      `GitHub API 요청에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const rawPayload = await response.text();

  if (!rawPayload) {
    return { response, payload: null };
  }

  try {
    return { response, payload: JSON.parse(rawPayload) };
  } catch {
    return { response, payload: rawPayload };
  }
}

function extractGitHubMessage(payload) {
  if (payload && typeof payload === "object" && typeof payload.message === "string") {
    return payload.message;
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  return null;
}

function formatGitHubApiError(response, payload, fallbackMessage) {
  const detail = extractGitHubMessage(payload);

  if (response.status === 401) {
    return "GitHub 인증에 실패했습니다. 토큰 권한을 확인하세요.";
  }

  if (response.status === 403) {
    return detail
      ? `GitHub API 접근이 거부되었습니다: ${detail}`
      : "GitHub API 접근이 거부되었습니다. 토큰 권한을 확인하세요.";
  }

  if (response.status === 409) {
    return detail
      ? `GitHub Contents API 충돌이 발생했습니다: ${detail}`
      : "GitHub Contents API 충돌이 발생했습니다. 다시 시도하세요.";
  }

  if (detail) {
    return `${fallbackMessage}: ${detail}`;
  }

  return `${fallbackMessage} (HTTP ${response.status}).`;
}

function decodeGitHubContent(payload, contentPath) {
  if (!payload || typeof payload !== "object" || typeof payload.content !== "string") {
    throw new CliError(`원격 파일 내용을 읽지 못했습니다: ${contentPath}`);
  }

  try {
    return Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8");
  } catch {
    throw new CliError(`원격 파일 내용을 디코드하지 못했습니다: ${contentPath}`);
  }
}

function parseFrontmatterValue(document, fieldName, contentPath) {
  const match = document.match(FRONTMATTER_BLOCK_PATTERN);

  if (!match) {
    throw new CliError(`원격 파일 frontmatter를 찾지 못했습니다: ${contentPath}`);
  }

  const line = match[1]
    .split(/\r?\n/)
    .find((entry) => entry.trimStart().startsWith(`${fieldName}:`));

  if (!line) {
    throw new CliError(`원격 파일 frontmatter에 ${fieldName}가 없습니다: ${contentPath}`);
  }

  const rawValue = line.slice(line.indexOf(":") + 1).trim();

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    if (rawValue.startsWith('"')) {
      try {
        return JSON.parse(rawValue);
      } catch {
        return rawValue.slice(1, -1);
      }
    }

    return rawValue.slice(1, -1);
  }

  return rawValue;
}

async function fetchRemoteBlogEntry(repository, token, contentPath) {
  const { response, payload } = await requestGitHubJson(
    buildGitHubContentsUrl(repository, contentPath),
    {
      token,
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new CliError(
      formatGitHubApiError(response, payload, `원격 블로그 파일을 읽지 못했습니다: ${contentPath}`),
    );
  }

  if (!payload || typeof payload !== "object" || typeof payload.sha !== "string") {
    throw new CliError(`예상하지 못한 GitHub Contents API 응답입니다: ${contentPath}`);
  }

  const extension = contentPath.slice(contentPath.lastIndexOf(".") + 1);
  const document = decodeGitHubContent(payload, contentPath);
  const publishedDate = normalizeDateValue(
    parseFrontmatterValue(document, "publishedDate", contentPath),
    `publishedDate in ${contentPath}`,
  );

  return {
    path: contentPath,
    extension,
    sha: payload.sha,
    document,
    publishedDate,
  };
}

async function findExistingRemoteEntry(repository, token, slug, preferredFormat) {
  const formats = preferredFormat === "md" ? ["md", "mdx"] : ["mdx", "md"];
  const entries = await Promise.all(
    formats.map((format) =>
      fetchRemoteBlogEntry(repository, token, buildBlogContentPath(slug, format)),
    ),
  );
  const existingEntries = entries.filter(Boolean);

  if (existingEntries.length > 1) {
    throw new CliError(
      `동일 slug의 원격 파일이 둘 이상 존재합니다. 수동 정리가 필요합니다: ${existingEntries
        .map((entry) => entry.path)
        .join(", ")}`,
    );
  }

  return existingEntries[0] ?? null;
}

function buildPublishCommitMessage(slug, mode) {
  return mode === "update" ? `docs(blog): update ${slug}` : `docs(blog): publish ${slug}`;
}

async function publishRemoteBlogPost(
  repository,
  token,
  contentPath,
  document,
  { mode, sha, slug },
) {
  const { response, payload } = await requestGitHubJson(
    buildGitHubContentsUrl(repository, contentPath),
    {
      token,
      method: "PUT",
      body: {
        message: buildPublishCommitMessage(slug, mode),
        content: Buffer.from(document, "utf8").toString("base64"),
        ...(sha ? { sha } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new CliError(
      formatGitHubApiError(
        response,
        payload,
        `원격 블로그 파일을 저장하지 못했습니다: ${contentPath}`,
      ),
    );
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !payload.commit ||
    typeof payload.commit.sha !== "string" ||
    !payload.content ||
    typeof payload.content.path !== "string"
  ) {
    throw new CliError(`예상하지 못한 GitHub Contents API PUT 응답입니다: ${contentPath}`);
  }

  return {
    commitSha: payload.commit.sha,
    path: payload.content.path,
  };
}

function printCommandSummary(command, options, extras = []) {
  const lines = [
    `${command} result`,
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

async function handlePublish(options) {
  requireOptions("publish", options);

  const body = readContentBody(options.contentFile);
  const generatedPost = buildGeneratedPost(options, body);

  if (options.dryRun) {
    console.log(generatedPost.document);
    return;
  }

  const auth = resolveGitHubAuth();
  const repository = resolveGitHubRepository();
  const existingEntry = await findExistingRemoteEntry(
    repository,
    auth.token,
    options.slug,
    options.format,
  );

  if (existingEntry && !options.overwrite) {
    throw new CliError(
      `이미 존재하는 slug입니다: ${existingEntry.path}. 업데이트하려면 --overwrite를 사용하세요.`,
    );
  }

  const publishMode = existingEntry ? "update" : "create";
  const publishPost = buildGeneratedPost(options, body, {
    publishedDate: options.publishedDate ?? existingEntry?.publishedDate ?? getTodayDateString(),
    updatedDate: existingEntry && options.overwrite ? getTodayDateString() : undefined,
  });
  const targetPath = existingEntry?.path ?? buildBlogContentPath(options.slug, options.format);
  const published = await publishRemoteBlogPost(
    repository,
    auth.token,
    targetPath,
    publishPost.document,
    {
      mode: publishMode,
      sha: existingEntry?.sha,
      slug: options.slug,
    },
  );

  printCommandSummary("publish", options, [
    `mode: ${publishMode}`,
    `target path: ${published.path}`,
    `publishedDate: ${publishPost.frontmatter.publishedDate}`,
    ...(publishPost.frontmatter.updatedDate
      ? [`updatedDate: ${publishPost.frontmatter.updatedDate}`]
      : []),
    "frontmatter: valid",
    `auth source: ${auth.source}`,
    `repository: ${repository.owner}/${repository.repo} (${repository.source})`,
    `commit sha: ${published.commitSha}`,
  ]);
}

function handleValidate(options) {
  requireOptions("validate", options);
  prepareGeneratedPost(options);
  console.log("Valid");
}

async function main() {
  const { command, options } = parseCli(process.argv.slice(2));

  if (!command || options.help) {
    printHelp(command);
    return;
  }

  if (command === "publish") {
    await handlePublish(options);
    return;
  }

  if (command === "validate") {
    handleValidate(options);
    return;
  }

  throw new CliError(`Unsupported command: ${command}`);
}

main().catch((error) => {
  if (error instanceof CliError) {
    console.error(error.message);
    process.exit(error.exitCode);
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
