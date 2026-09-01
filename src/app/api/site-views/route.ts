import { NextRequest, NextResponse } from "next/server";
import {
  canActivateSiteViewsOwner,
  createSiteViewsVisitorId,
  getSiteViewsOwnerCookieValue,
  getSiteViewsTotal,
  hasSiteViewsOwnerExemption,
  isHomePagePath,
  isSiteViewsVisitorId,
  recordSiteView,
  SITE_VIEWS_OWNER_COOKIE,
  SITE_VIEWS_OWNER_COOKIE_MAX_AGE_SECONDS,
  SITE_VIEWS_VISITOR_COOKIE,
  SITE_VIEWS_VISITOR_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/site-views";

const MAX_REQUEST_BODY_BYTES = 512;

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function isRecordRequest(value: unknown): value is { action: "record"; pathname: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    "pathname" in value &&
    value.action === "record" &&
    typeof value.pathname === "string"
  );
}

function isOwnerExemptionRequest(value: unknown): value is { action: "exclude-owner"; token: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "action" in value &&
    "token" in value &&
    value.action === "exclude-owner" &&
    typeof value.token === "string"
  );
}

function configureOwnerCookie(response: NextResponse) {
  const ownerCookieValue = getSiteViewsOwnerCookieValue();
  if (!ownerCookieValue) {
    return;
  }

  response.cookies.set({
    name: SITE_VIEWS_OWNER_COOKIE,
    value: ownerCookieValue,
    httpOnly: true,
    maxAge: SITE_VIEWS_OWNER_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function configureVisitorCookie(response: NextResponse, visitorId: string) {
  response.cookies.set({
    name: SITE_VIEWS_VISITOR_COOKIE,
    value: visitorId,
    httpOnly: true,
    maxAge: SITE_VIEWS_VISITOR_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function GET() {
  try {
    const result = await getSiteViewsTotal();
    return jsonResponse(result, result.available ? 200 : 503);
  } catch (error) {
    console.error("Site views total request failed:", error);
    return jsonResponse({ error: "Site views are unavailable" }, 502);
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonResponse({ error: "Request body is too large" }, 413);
  }

  const body: unknown = await request.json().catch(() => null);

  if (isOwnerExemptionRequest(body)) {
    if (!canActivateSiteViewsOwner(body.token)) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    try {
      const result = await getSiteViewsTotal();
      const response = jsonResponse(result);
      configureOwnerCookie(response);
      return response;
    } catch (error) {
      console.error("Site views owner exemption request failed:", error);
      const response = jsonResponse({ available: false, counted: false, total: null });
      configureOwnerCookie(response);
      return response;
    }
  }

  if (!isRecordRequest(body) || !isHomePagePath(body.pathname)) {
    return jsonResponse({ error: "Unsupported page" }, 400);
  }

  const isExcluded = hasSiteViewsOwnerExemption(
    request.cookies.get(SITE_VIEWS_OWNER_COOKIE)?.value
  );
  const existingVisitorId = request.cookies.get(SITE_VIEWS_VISITOR_COOKIE)?.value;
  const visitorId = isSiteViewsVisitorId(existingVisitorId)
    ? existingVisitorId
    : createSiteViewsVisitorId();

  try {
    const result = await recordSiteView(visitorId, isExcluded);
    const response = jsonResponse(result, result.available ? 200 : 503);

    if (
      !isExcluded &&
      process.env.NODE_ENV === "production" &&
      result.available &&
      !isSiteViewsVisitorId(existingVisitorId)
    ) {
      configureVisitorCookie(response, visitorId);
    }

    return response;
  } catch (error) {
    console.error("Site views record request failed:", error);
    return jsonResponse({ error: "Site views are unavailable" }, 502);
  }
}
