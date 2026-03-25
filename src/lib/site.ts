export const DEFAULT_SITE_ORIGIN = "https://menaje.github.io";
export const DEFAULT_SITE_BASE_PATH = "/profile/";

function normalizeBasePath(basePath: string): string {
  if (!basePath || basePath === "/") {
    return "/";
  }

  const trimmed = basePath.replace(/^\/+|\/+$/g, "");
  return `/${trimmed}/`;
}

export function getBasePath(): string {
  return normalizeBasePath(import.meta.env.BASE_URL || DEFAULT_SITE_BASE_PATH);
}

export function withBase(pathname = "/"): string {
  const basePath = getBasePath();
  const normalizedPath = pathname.replace(/^\/+/, "");

  return normalizedPath ? `${basePath}${normalizedPath}` : basePath;
}

export function ensureBasePath(pathname: string): string {
  const basePath = getBasePath();

  if (!pathname || pathname === "/") {
    return basePath;
  }

  const basePathWithoutTrailingSlash = basePath.slice(0, -1);

  return pathname === basePathWithoutTrailingSlash || pathname.startsWith(basePath)
    ? pathname
    : withBase(pathname);
}

export function getFallbackSiteUrl(): URL {
  return new URL(DEFAULT_SITE_ORIGIN);
}
