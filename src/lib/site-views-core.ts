const HOME_PAGE_PATHS = new Set(["/", "/en"]);

export const SITE_VIEWS_OWNER_HASH_PREFIX = "#site-views-owner=";

const MAX_OWNER_TOKEN_LENGTH = 256;

export interface SiteViewsRedisEnvironment {
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  KV_REST_API_URL?: string;
  KV_REST_API_TOKEN?: string;
}

export interface SiteViewsRedisCredentials {
  source: "upstash" | "vercel-kv";
  url: string;
  token: string;
}

export type SiteViewsOwnerHash =
  | { kind: "none" }
  | { kind: "invalid" }
  | { kind: "token"; token: string };

function trimmedValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getSiteViewsRedisCredentialCandidates(
  environment: SiteViewsRedisEnvironment
): SiteViewsRedisCredentials[] {
  const pairs = [
    {
      source: "upstash" as const,
      url: environment.UPSTASH_REDIS_REST_URL,
      token: environment.UPSTASH_REDIS_REST_TOKEN,
    },
    {
      source: "vercel-kv" as const,
      url: environment.KV_REST_API_URL,
      token: environment.KV_REST_API_TOKEN,
    },
  ];

  const candidates: SiteViewsRedisCredentials[] = [];
  for (const pair of pairs) {
    const url = trimmedValue(pair.url);
    const token = trimmedValue(pair.token);
    if (!url || !token) {
      continue;
    }

    if (
      !candidates.some(
        (candidate) =>
          candidate.token === token &&
          isSameSiteViewsRedisEndpoint(candidate.url, url)
      )
    ) {
      candidates.push({ source: pair.source, url, token });
    }
  }

  return candidates;
}

export function isSameSiteViewsRedisEndpoint(left: string, right: string) {
  try {
    const leftUrl = new URL(left);
    const rightUrl = new URL(right);
    leftUrl.hash = "";
    leftUrl.search = "";
    rightUrl.hash = "";
    rightUrl.search = "";

    return (
      leftUrl.toString().replace(/\/+$/, "") ===
      rightUrl.toString().replace(/\/+$/, "")
    );
  } catch {
    return left.replace(/\/+$/, "") === right.replace(/\/+$/, "");
  }
}

export function isHomePagePath(pathname: string) {
  return HOME_PAGE_PATHS.has(pathname);
}

export function parseSiteViewsOwnerHash(hash: string): SiteViewsOwnerHash {
  if (!hash.startsWith(SITE_VIEWS_OWNER_HASH_PREFIX)) {
    return { kind: "none" };
  }

  try {
    const token = decodeURIComponent(hash.slice(SITE_VIEWS_OWNER_HASH_PREFIX.length));
    if (!token || token.length > MAX_OWNER_TOKEN_LENGTH) {
      return { kind: "invalid" };
    }

    return { kind: "token", token };
  } catch {
    return { kind: "invalid" };
  }
}

export function isSiteViewsResponse(value: unknown): value is { total: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "total" in value &&
    typeof value.total === "number" &&
    Number.isSafeInteger(value.total) &&
    value.total >= 0
  );
}

export function createSiteViewsReadRequest(signal?: AbortSignal): RequestInit {
  return {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    ...(signal ? { signal } : {}),
  };
}

export function createSiteViewsRecordRequest(pathname: string): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "record", pathname }),
    cache: "no-store",
    credentials: "same-origin",
    keepalive: true,
  };
}

export function createSiteViewsOwnerRequest(token: string): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "exclude-owner", token }),
    cache: "no-store",
    credentials: "same-origin",
    keepalive: true,
  };
}
