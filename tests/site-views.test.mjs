import assert from "node:assert/strict";
import test from "node:test";

import {
  createSiteViewsOwnerRequest,
  createSiteViewsReadRequest,
  createSiteViewsRecordRequest,
  getSiteViewsRedisCredentialCandidates,
  isHomePagePath,
  isSameSiteViewsRedisEndpoint,
  isSiteViewsResponse,
  parseSiteViewsOwnerHash,
} from "../src/lib/site-views-core.ts";
import {
  loadSiteViewsForPath,
  resetSiteViewsClientStateForTests,
} from "../src/lib/site-views-client.ts";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function deferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

test.afterEach(() => {
  resetSiteViewsClientStateForTests();
});

test("Redis credentials are selected only as complete pairs", () => {
  assert.deepEqual(
    getSiteViewsRedisCredentialCandidates({
      UPSTASH_REDIS_REST_URL: " https://primary.example ",
      UPSTASH_REDIS_REST_TOKEN: " primary-token ",
      KV_REST_API_URL: "https://fallback.example",
      KV_REST_API_TOKEN: "fallback-token",
    }),
    [
      {
        source: "upstash",
        url: "https://primary.example",
        token: "primary-token",
      },
      {
        source: "vercel-kv",
        url: "https://fallback.example",
        token: "fallback-token",
      },
    ]
  );

  assert.deepEqual(
    getSiteViewsRedisCredentialCandidates({
      UPSTASH_REDIS_REST_URL: "https://incomplete.example",
      KV_REST_API_URL: "https://fallback.example",
      KV_REST_API_TOKEN: "fallback-token",
    }),
    [
      {
        source: "vercel-kv",
        url: "https://fallback.example",
        token: "fallback-token",
      },
    ]
  );

  assert.deepEqual(
    getSiteViewsRedisCredentialCandidates({
      UPSTASH_REDIS_REST_URL: "https://must-not-mix.example",
      KV_REST_API_TOKEN: "must-not-mix-token",
    }),
    []
  );

  assert.deepEqual(
    getSiteViewsRedisCredentialCandidates({
      UPSTASH_REDIS_REST_URL: "   ",
      UPSTASH_REDIS_REST_TOKEN: "   ",
      KV_REST_API_URL: "https://fallback.example",
      KV_REST_API_TOKEN: "fallback-token",
    }),
    [
      {
        source: "vercel-kv",
        url: "https://fallback.example",
        token: "fallback-token",
      },
    ]
  );

  assert.deepEqual(
    getSiteViewsRedisCredentialCandidates({
      UPSTASH_REDIS_REST_URL: "https://same.example/",
      UPSTASH_REDIS_REST_TOKEN: "same-token",
      KV_REST_API_URL: "https://same.example",
      KV_REST_API_TOKEN: "same-token",
    }),
    [
      {
        source: "upstash",
        url: "https://same.example/",
        token: "same-token",
      },
    ]
  );
});

test("equivalent Redis REST endpoints are recognized safely", () => {
  assert.equal(
    isSameSiteViewsRedisEndpoint(
      "https://example.upstash.io/",
      "https://example.upstash.io"
    ),
    true
  );
  assert.equal(
    isSameSiteViewsRedisEndpoint(
      "https://first.upstash.io",
      "https://second.upstash.io"
    ),
    false
  );
});

test("only the two landing paths record a view", () => {
  assert.equal(isHomePagePath("/"), true);
  assert.equal(isHomePagePath("/en"), true);
  assert.equal(isHomePagePath("/en/"), false);
  assert.equal(isHomePagePath("/posts"), false);
  assert.equal(isHomePagePath("/posts/example"), false);
});

test("owner hashes distinguish valid, invalid, and unrelated fragments", () => {
  assert.deepEqual(parseSiteViewsOwnerHash("#section"), { kind: "none" });
  assert.deepEqual(parseSiteViewsOwnerHash("#site-views-owner=valid%20token"), {
    kind: "token",
    token: "valid token",
  });
  assert.deepEqual(parseSiteViewsOwnerHash("#site-views-owner="), {
    kind: "invalid",
  });
  assert.deepEqual(parseSiteViewsOwnerHash("#site-views-owner=%E0%A4%A"), {
    kind: "invalid",
  });
  assert.deepEqual(
    parseSiteViewsOwnerHash(`#site-views-owner=${"x".repeat(257)}`),
    { kind: "invalid" }
  );
});

test("record requests survive page unload and never receive an abort signal", () => {
  const request = createSiteViewsRecordRequest("/");
  assert.equal(request.method, "POST");
  assert.equal(request.keepalive, true);
  assert.equal("signal" in request, false);
  assert.equal(request.credentials, "same-origin");
  assert.equal(request.cache, "no-store");
  assert.deepEqual(JSON.parse(String(request.body)), {
    action: "record",
    pathname: "/",
  });
});

test("read requests remain cancellable and owner activation uses keepalive", () => {
  const controller = new AbortController();
  const readRequest = createSiteViewsReadRequest(controller.signal);
  assert.equal(readRequest.method, "GET");
  assert.equal(readRequest.signal, controller.signal);

  const ownerRequest = createSiteViewsOwnerRequest("owner-token");
  assert.equal(ownerRequest.method, "POST");
  assert.equal(ownerRequest.keepalive, true);
  assert.equal("signal" in ownerRequest, false);
  assert.deepEqual(JSON.parse(String(ownerRequest.body)), {
    action: "exclude-owner",
    token: "owner-token",
  });
});

test("site view responses accept only safe non-negative integer totals", () => {
  assert.equal(isSiteViewsResponse({ total: 0 }), true);
  assert.equal(isSiteViewsResponse({ total: 42 }), true);
  assert.equal(isSiteViewsResponse({ total: -1 }), false);
  assert.equal(isSiteViewsResponse({ total: 1.5 }), false);
  assert.equal(isSiteViewsResponse({ total: "42" }), false);
  assert.equal(isSiteViewsResponse({ available: false, total: null }), false);
});

test("concurrent landing loads share one record request", async () => {
  const pending = deferred();
  const requests = [];
  const fetcher = async (input, init) => {
    requests.push({ input, init });
    await pending.promise;
    return jsonResponse({ total: 12 });
  };

  const first = loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "none" },
    fetcher,
  });
  const second = loadSiteViewsForPath({
    pathname: "/en",
    ownerHash: { kind: "none" },
    fetcher,
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].input, "/api/site-views");
  assert.equal(requests[0].init.keepalive, true);
  assert.equal("signal" in requests[0].init, false);
  assert.equal(JSON.parse(String(requests[0].init.body)).action, "record");
  pending.resolve();
  assert.deepEqual(await Promise.all([first, second]), [12, 12]);
});

test("pending owner activation blocks a remounted landing page from recording", async () => {
  const ownerResponse = deferred();
  const requests = [];
  const fetcher = async (_input, init) => {
    requests.push(JSON.parse(String(init.body)));
    return ownerResponse.promise;
  };

  const ownerLoad = loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "token", token: "owner-token" },
    fetcher,
  });
  const remountedLoad = loadSiteViewsForPath({
    pathname: "/en",
    ownerHash: { kind: "none" },
    fetcher,
  });

  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "owner-token" },
  ]);
  ownerResponse.resolve(jsonResponse({ total: 21 }));
  assert.deepEqual(await Promise.all([ownerLoad, remountedLoad]), [21, 21]);
  assert.equal(requests.length, 1);
});

test("a malformed hash cannot bypass a pending owner gate", async () => {
  const ownerResponse = deferred();
  const requests = [];
  const dispositions = [];
  const fetcher = async (_input, init) => {
    requests.push(JSON.parse(String(init.body)));
    return ownerResponse.promise;
  };

  const ownerLoad = loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "token", token: "owner-token" },
    fetcher,
  });
  const malformedLoad = loadSiteViewsForPath({
    pathname: "/en",
    ownerHash: { kind: "invalid" },
    fetcher,
    onOwnerHashResolved: (disposition) => dispositions.push(disposition),
  });

  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "owner-token" },
  ]);
  ownerResponse.resolve(jsonResponse({ total: 22 }));
  assert.deepEqual(await Promise.all([ownerLoad, malformedLoad]), [22, 22]);
  assert.equal(requests.length, 1);
  assert.deepEqual(dispositions, ["clear"]);
});

test("a second owner token waits, then gets its own activation attempt", async () => {
  const firstOwnerResponse = deferred();
  const requests = [];
  const fetcher = async (_input, init) => {
    const body = JSON.parse(String(init.body));
    requests.push(body);
    if (body.token === "old-token") {
      return firstOwnerResponse.promise;
    }
    if (body.token === "correct-token") {
      return jsonResponse({ total: 23 });
    }
    return jsonResponse({ total: 999 });
  };

  const oldTokenLoad = loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "token", token: "old-token" },
    fetcher,
  });
  const correctTokenLoad = loadSiteViewsForPath({
    pathname: "/en",
    ownerHash: { kind: "token", token: "correct-token" },
    fetcher,
  });

  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "old-token" },
  ]);
  firstOwnerResponse.resolve(
    jsonResponse({ error: "Not found" }, { status: 404 })
  );

  assert.deepEqual(await Promise.all([oldTokenLoad, correctTokenLoad]), [23, 23]);
  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "old-token" },
    { action: "exclude-owner", token: "correct-token" },
  ]);
});

test("an activated owner reads a fresh total on later navigation", async () => {
  const requests = [];
  const fetcher = async (_input, init) => {
    if (init.method === "GET") {
      requests.push({ action: "read" });
      return jsonResponse({ total: 25 });
    }

    const body = JSON.parse(String(init.body));
    requests.push(body);
    return jsonResponse({ total: 24 });
  };

  assert.equal(
    await loadSiteViewsForPath({
      pathname: "/",
      ownerHash: { kind: "token", token: "owner-token" },
      fetcher,
    }),
    24
  );
  assert.equal(
    await loadSiteViewsForPath({
      pathname: "/posts",
      ownerHash: { kind: "none" },
      fetcher,
    }),
    25
  );
  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "owner-token" },
    { action: "read" },
  ]);
});

test("an invalid owner token clears the hash and falls back to one record", async () => {
  const requests = [];
  const dispositions = [];
  const fetcher = async (_input, init) => {
    const body = JSON.parse(String(init.body));
    requests.push(body);
    return body.action === "exclude-owner"
      ? jsonResponse({ error: "Not found" }, { status: 404 })
      : jsonResponse({ total: 31 });
  };

  const total = await loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "token", token: "wrong-token" },
    fetcher,
    onOwnerHashResolved: (disposition) => dispositions.push(disposition),
  });

  assert.equal(total, 31);
  assert.deepEqual(requests, [
    { action: "exclude-owner", token: "wrong-token" },
    { action: "record", pathname: "/" },
  ]);
  assert.deepEqual(dispositions, ["clear"]);
});

test("a failed owner activation keeps the hash and blocks regular records", async () => {
  const requests = [];
  const dispositions = [];
  const fetcher = async (_input, init) => {
    if (init.method === "GET") {
      requests.push({ action: "read" });
      return jsonResponse({ total: 41 });
    }

    const body = JSON.parse(String(init.body));
    requests.push(body);
    return jsonResponse({ error: "Unavailable" }, { status: 503 });
  };

  const ownerTotal = await loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "token", token: "owner-token" },
    fetcher,
    onOwnerHashResolved: (disposition) => dispositions.push(disposition),
  });
  const nextTotal = await loadSiteViewsForPath({
    pathname: "/en",
    ownerHash: { kind: "none" },
    fetcher,
  });

  assert.equal(ownerTotal, 41);
  assert.equal(nextTotal, 41);
  assert.deepEqual(
    requests.filter((request) => request.action === "record"),
    []
  );
  assert.equal(
    requests.filter((request) => request.action === "exclude-owner").length,
    2
  );
  assert.deepEqual(dispositions, ["keep"]);
});

test("a failed record falls back to a read and releases the write gate", async () => {
  const methods = [];
  const fetcher = async (_input, init) => {
    methods.push(init.method);
    if (methods.length === 1) {
      throw new TypeError("network unavailable");
    }

    return jsonResponse({ total: methods.length === 2 ? 51 : 52 });
  };

  assert.equal(
    await loadSiteViewsForPath({
      pathname: "/",
      ownerHash: { kind: "none" },
      fetcher,
    }),
    51
  );

  assert.equal(
    await loadSiteViewsForPath({
      pathname: "/",
      ownerHash: { kind: "none" },
      fetcher,
    }),
    52
  );
  assert.deepEqual(methods, ["POST", "GET", "POST"]);
});

test("read requests retry once after a server error", async () => {
  let attempts = 0;
  const fetcher = async (_input, init) => {
    attempts += 1;
    assert.equal(init.method, "GET");
    return attempts === 1
      ? jsonResponse({ error: "Unavailable" }, { status: 503 })
      : jsonResponse({ total: 61 });
  };

  const total = await loadSiteViewsForPath({
    pathname: "/posts",
    ownerHash: { kind: "none" },
    fetcher,
  });

  assert.equal(total, 61);
  assert.equal(attempts, 2);
});

test("aborting a read during backoff prevents another request", async () => {
  const controller = new AbortController();
  let attempts = 0;
  const fetcher = async () => {
    attempts += 1;
    controller.abort();
    return jsonResponse({ error: "Unavailable" }, { status: 503 });
  };

  await assert.rejects(
    loadSiteViewsForPath({
      pathname: "/posts",
      ownerHash: { kind: "none" },
      signal: controller.signal,
      fetcher,
    }),
    (error) => error instanceof DOMException && error.name === "AbortError"
  );
  assert.equal(attempts, 1);
});

test("a malformed owner hash is cleared before a regular record", async () => {
  const requests = [];
  const dispositions = [];
  const fetcher = async (_input, init) => {
    requests.push(JSON.parse(String(init.body)));
    return jsonResponse({ total: 71 });
  };

  const total = await loadSiteViewsForPath({
    pathname: "/",
    ownerHash: { kind: "invalid" },
    fetcher,
    onOwnerHashResolved: (disposition) => dispositions.push(disposition),
  });

  assert.equal(total, 71);
  assert.deepEqual(requests, [{ action: "record", pathname: "/" }]);
  assert.deepEqual(dispositions, ["clear"]);
});
