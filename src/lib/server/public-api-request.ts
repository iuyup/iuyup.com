import "server-only";

type LimitedBodyResult =
  | { ok: true; body: string }
  | { ok: false; reason: "aborted" | "invalid" | "too-large" };

function jsonError(error: string, status: number): Response {
  return Response.json(
    { error },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function normalizedHost(value: string | null): string {
  return value?.split(",", 1)[0]?.trim().toLowerCase() || "";
}

function originMatchesRequest(request: Request, originValue: string): boolean {
  let origin: URL;
  try {
    origin = new URL(originValue);
  } catch {
    return false;
  }

  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    return false;
  }

  const requestURL = new URL(request.url);
  const requestHosts = new Set([
    requestURL.host.toLowerCase(),
    normalizedHost(request.headers.get("host")),
  ]);
  requestHosts.delete("");

  return requestHosts.has(origin.host.toLowerCase());
}

/**
 * Validate browser-facing mutation requests before they reach an upstream API.
 * Missing browser metadata remains compatible with non-browser callers, while
 * explicit cross-site signals and non-JSON form-compatible requests are denied.
 */
export function validatePublicMutationRequest(request: Request): Response | null {
  const fetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "cross-site") {
    return jsonError("Cross-site requests are not allowed", 403);
  }

  const origin = request.headers.get("origin");
  if (origin && !originMatchesRequest(request, origin)) {
    return jsonError("Cross-site requests are not allowed", 403);
  }

  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== "application/json") {
    return jsonError("Content-Type must be application/json", 415);
  }

  return null;
}

/** Read at most maxBytes without first buffering an unbounded request body. */
export async function readLimitedTextBody(
  request: Request,
  maxBytes: number,
): Promise<LimitedBodyResult> {
  if (request.signal.aborted) {
    return { ok: false, reason: "aborted" };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (
      Number.isSafeInteger(declaredBytes) &&
      declaredBytes >= 0 &&
      declaredBytes > maxBytes
    ) {
      return { ok: false, reason: "too-large" };
    }
  }

  if (!request.body) {
    return { ok: true, body: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      if (request.signal.aborted) {
        await reader.cancel();
        return { ok: false, reason: "aborted" };
      }

      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: "too-large" };
      }
      chunks.push(value);
    }
  } catch {
    return {
      ok: false,
      reason: request.signal.aborted ? "aborted" : "invalid",
    };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      body: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
