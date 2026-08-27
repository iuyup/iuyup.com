import { NextRequest } from "next/server";
import {
  readLimitedTextBody,
  validatePublicMutationRequest,
} from "@/lib/server/public-api-request";

const MAX_REQUEST_BODY_BYTES = 32 * 1024;

function firstForwardedAddress(value: string | null): string {
  return value?.split(",", 1)[0]?.trim() || "";
}

function clientAddress(request: NextRequest): string {
  if (process.env.TRUST_X_FORWARDED_FOR !== "true") {
    return "";
  }

  return firstForwardedAddress(request.headers.get("x-forwarded-for"));
}

export async function POST(req: NextRequest) {
  const invalidRequest = validatePublicMutationRequest(req);
  if (invalidRequest) return invalidRequest;

  const requestBody = await readLimitedTextBody(req, MAX_REQUEST_BODY_BYTES);
  if (!requestBody.ok) {
    if (requestBody.reason === "aborted") {
      return new Response(null, { status: 499 });
    }
    if (requestBody.reason === "too-large") {
      return Response.json({ error: "Chat request is too large" }, { status: 413 });
    }
    return Response.json({ error: "Chat request body is invalid" }, { status: 400 });
  }

  const goAPIBaseURL = process.env.GO_API_BASE_URL?.replace(/\/$/, "");
  const proxyToken = process.env.GO_API_PROXY_TOKEN;

  if (!goAPIBaseURL || !proxyToken) {
    console.error("Go chat gateway is not configured");
    return Response.json({ error: "Chat service is unavailable" }, { status: 503 });
  }

  try {
    const upstream = await fetch(`${goAPIBaseURL}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Selfweb-Client-IP": clientAddress(req),
        "X-Selfweb-Proxy-Token": proxyToken,
      },
      body: requestBody.body,
      cache: "no-store",
      signal: req.signal,
    });

    const headers = new Headers();
    for (const name of ["content-type", "cache-control", "x-accel-buffering"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    if (req.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    console.error("Go chat gateway request failed:", error);
    return Response.json({ error: "Chat service is unavailable" }, { status: 502 });
  }
}
