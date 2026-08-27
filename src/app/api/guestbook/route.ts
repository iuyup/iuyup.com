import { NextRequest } from "next/server";
import {
  readLimitedTextBody,
  validatePublicMutationRequest,
} from "@/lib/server/public-api-request";

const MAX_REQUEST_BODY_BYTES = 4 * 1024;
const UPSTREAM_TIMEOUT_MS = 8_000;

function firstForwardedAddress(value: string | null): string {
  return value?.split(",", 1)[0]?.trim() || "";
}

function clientAddress(request: NextRequest): string {
  if (process.env.TRUST_X_FORWARDED_FOR !== "true") {
    return "";
  }

  return firstForwardedAddress(request.headers.get("x-forwarded-for"));
}

async function proxyGuestbookRequest(request: NextRequest) {
  let body: string | undefined;
  if (request.method !== "GET") {
    const invalidRequest = validatePublicMutationRequest(request);
    if (invalidRequest) return invalidRequest;

    const requestBody = await readLimitedTextBody(request, MAX_REQUEST_BODY_BYTES);
    if (!requestBody.ok) {
      if (requestBody.reason === "aborted") {
        return new Response(null, { status: 499 });
      }
      if (requestBody.reason === "too-large") {
        return Response.json({ error: "Guestbook request is too large" }, { status: 413 });
      }
      return Response.json({ error: "Guestbook request body is invalid" }, { status: 400 });
    }
    body = requestBody.body;
  }

  const goAPIBaseURL = process.env.GO_API_BASE_URL?.replace(/\/$/, "");
  const proxyToken = process.env.GO_API_PROXY_TOKEN;
  if (!goAPIBaseURL || !proxyToken) {
    console.error("Go guestbook gateway is not configured");
    return Response.json({ error: "Guestbook service is unavailable" }, { status: 503 });
  }

  const headers = new Headers({
    "X-Selfweb-Client-IP": clientAddress(request),
    "X-Selfweb-Proxy-Token": proxyToken,
  });
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (request.signal.aborted) {
    return new Response(null, { status: 499 });
  }

  const upstreamAbort = new AbortController();
  const timeout = setTimeout(() => upstreamAbort.abort(), UPSTREAM_TIMEOUT_MS);
  const abortFromClient = () => upstreamAbort.abort();
  request.signal.addEventListener("abort", abortFromClient, { once: true });

  try {
    const upstream = await fetch(`${goAPIBaseURL}/v1/guestbook${new URL(request.url).search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: upstreamAbort.signal,
    });
    const upstreamBody = await upstream.arrayBuffer();

    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("X-Content-Type-Options", "nosniff");

    return new Response(upstreamBody, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }
    if (upstreamAbort.signal.aborted) {
      console.error("Go guestbook gateway request timed out");
      return Response.json({ error: "Guestbook service timed out" }, { status: 504 });
    }

    console.error("Go guestbook gateway request failed:", error);
    return Response.json({ error: "Guestbook service is unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
    request.signal.removeEventListener("abort", abortFromClient);
  }
}

export async function GET(request: NextRequest) {
  return proxyGuestbookRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyGuestbookRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyGuestbookRequest(request);
}
