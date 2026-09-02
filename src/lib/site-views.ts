import "server-only";

import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { Redis, errors as redisErrors } from "@upstash/redis";
import {
  getSiteViewsRedisCredentialCandidates,
  isHomePagePath,
  isSameSiteViewsRedisEndpoint,
  type SiteViewsRedisCredentials,
} from "@/lib/site-views-core";

const TOTAL_KEY = "selfweb:site-views:v1:total";
const DEDUPE_KEY_PREFIX = "selfweb:site-views:v1:dedupe:";
const DEFAULT_DEDUPE_SECONDS = 30 * 60;
const MIN_DEDUPE_SECONDS = 60;
const MAX_DEDUPE_SECONDS = 24 * 60 * 60;
const OWNER_COOKIE_PAYLOAD = "selfweb:site-views-owner:v1";
const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SITE_VIEWS_OWNER_COOKIE = "site-views-owner";
export const SITE_VIEWS_VISITOR_COOKIE = "site-views-visitor";
export const SITE_VIEWS_OWNER_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;
export const SITE_VIEWS_VISITOR_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const REDIS_REQUEST_TIMEOUT_MS = 2500;
const REDIS_RETRY_ATTEMPTS = 2;

const RECORD_SITE_VIEW_SCRIPT = `
local claimed = redis.call("SET", KEYS[2], "1", "NX", "EX", ARGV[1])
if claimed then
  return { redis.call("INCR", KEYS[1]), 1 }
end
return { redis.call("GET", KEYS[1]) or "0", 0 }
`;

interface SiteViewsRedisCandidate {
  credentials: SiteViewsRedisCredentials;
  client?: Redis;
}

let redisCandidates: SiteViewsRedisCandidate[] | undefined;
let preferredRedisCandidate = 0;

export interface SiteViewsResult {
  available: boolean;
  counted: boolean;
  total: number | null;
}

function getRedisCandidates() {
  if (redisCandidates !== undefined) {
    return redisCandidates;
  }

  redisCandidates = getSiteViewsRedisCredentialCandidates({
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  }).map((credentials) => ({ credentials }));

  return redisCandidates;
}

function getRedisClient(candidate: SiteViewsRedisCandidate) {
  if (candidate.client) {
    return candidate.client;
  }

  candidate.client = new Redis({
    url: candidate.credentials.url,
    token: candidate.credentials.token,
    enableTelemetry: false,
    retry: {
      retries: REDIS_RETRY_ATTEMPTS,
      backoff: (retryCount) => 50 * 2 ** retryCount,
    },
    signal: () => AbortSignal.timeout(REDIS_REQUEST_TIMEOUT_MS),
  });
  return candidate.client;
}

function shouldTryCredentialFallback(error: unknown) {
  if (error instanceof redisErrors.UrlError || error instanceof TypeError) {
    return false;
  }

  return !(
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

async function runRedisCommand<Result>(
  command: (redis: Redis) => Promise<Result>
): Promise<Result> {
  const candidates = getRedisCandidates();
  const firstCandidate = candidates[preferredRedisCandidate] ?? candidates[0];
  if (!firstCandidate) {
    throw new Error("Site views Redis is not configured");
  }

  const compatibleFallbacks = candidates.filter(
    (candidate) =>
      candidate !== firstCandidate &&
      isSameSiteViewsRedisEndpoint(
        candidate.credentials.url,
        firstCandidate.credentials.url
      )
  );
  const attempts = [firstCandidate, ...compatibleFallbacks];
  const failures: unknown[] = [];

  for (const candidate of attempts) {
    try {
      const result = await command(getRedisClient(candidate));
      preferredRedisCandidate = candidates.indexOf(candidate);
      return result;
    } catch (error) {
      failures.push(error);
      if (!shouldTryCredentialFallback(error)) {
        throw error;
      }
    }
  }

  if (failures.length === 1) {
    throw failures[0];
  }

  throw new AggregateError(
    failures,
    `Site views Redis request failed for ${attempts
      .map((candidate) => candidate.credentials.source)
      .join(" and ")}`
  );
}

function dedupeWindowSeconds() {
  const configuredValue = Number.parseInt(process.env.SITE_VIEWS_DEDUP_SECONDS ?? "", 10);
  if (
    Number.isSafeInteger(configuredValue) &&
    configuredValue >= MIN_DEDUPE_SECONDS &&
    configuredValue <= MAX_DEDUPE_SECONDS
  ) {
    return configuredValue;
  }

  return DEFAULT_DEDUPE_SECONDS;
}

function asTotal(value: unknown) {
  const total = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(total) && total >= 0 ? total : 0;
}

function safelyEquals(value: string, expected: string) {
  const actualBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function ownerCookieValue() {
  const ownerToken = process.env.SITE_VIEWS_OWNER_TOKEN;
  if (!ownerToken) {
    return null;
  }

  return createHmac("sha256", ownerToken)
    .update(OWNER_COOKIE_PAYLOAD)
    .digest("base64url");
}

function dedupeKey(visitorId: string) {
  const visitorHash = createHash("sha256").update(visitorId).digest("base64url");
  return `${DEDUPE_KEY_PREFIX}${visitorHash}`;
}

export { isHomePagePath };

export function isSiteViewsVisitorId(value: string | undefined): value is string {
  return Boolean(value && VISITOR_ID_PATTERN.test(value));
}

export function createSiteViewsVisitorId() {
  return randomUUID();
}

export function canActivateSiteViewsOwner(value: unknown) {
  const ownerToken = process.env.SITE_VIEWS_OWNER_TOKEN;
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 256 ||
    !ownerToken
  ) {
    return false;
  }

  return safelyEquals(value, ownerToken);
}

export function hasSiteViewsOwnerExemption(value: string | undefined) {
  const expectedCookieValue = ownerCookieValue();
  return Boolean(value && expectedCookieValue && safelyEquals(value, expectedCookieValue));
}

export function getSiteViewsOwnerCookieValue() {
  return ownerCookieValue();
}

export async function getSiteViewsTotal(): Promise<SiteViewsResult> {
  if (getRedisCandidates().length === 0) {
    return { available: false, counted: false, total: null };
  }

  const total = await runRedisCommand((redis) => redis.get<unknown>(TOTAL_KEY));
  return { available: true, counted: false, total: asTotal(total) };
}

export async function recordSiteView(
  visitorId: string,
  isExcluded: boolean
): Promise<SiteViewsResult> {
  if (getRedisCandidates().length === 0) {
    return { available: false, counted: false, total: null };
  }

  if (isExcluded || process.env.NODE_ENV !== "production") {
    const total = await runRedisCommand((redis) => redis.get<unknown>(TOTAL_KEY));
    return { available: true, counted: false, total: asTotal(total) };
  }

  const [total, counted] = await runRedisCommand((redis) =>
    redis.eval<[string], [number | string, number | string]>(
      RECORD_SITE_VIEW_SCRIPT,
      [TOTAL_KEY, dedupeKey(visitorId)],
      [String(dedupeWindowSeconds())]
    )
  );

  return { available: true, counted: asTotal(counted) === 1, total: asTotal(total) };
}
