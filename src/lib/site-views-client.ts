import {
  createSiteViewsOwnerRequest,
  createSiteViewsReadRequest,
  createSiteViewsRecordRequest,
  isHomePagePath,
  isSiteViewsResponse,
  type SiteViewsOwnerHash,
} from "./site-views-core";

const SITE_VIEWS_API_PATH = "/api/site-views";
const READ_ATTEMPTS = 2;
const OWNER_ACTIVATION_ATTEMPTS = 2;
const RETRY_DELAY_MS = 100;

export type SiteViewsFetcher = typeof fetch;

type OwnerActivationOutcome =
  | { status: "activated"; total: number | null }
  | { status: "invalid"; total: null }
  | { status: "failed"; total: null };

interface LoadSiteViewsOptions {
  pathname: string;
  ownerHash: SiteViewsOwnerHash;
  signal?: AbortSignal;
  fetcher?: SiteViewsFetcher;
  onOwnerHashResolved?: (disposition: "clear" | "keep") => void;
}

let siteViewsRecordInFlight: Promise<number | null> | null = null;
let siteViewsOwnerGate: Promise<OwnerActivationOutcome> | null = null;
const siteViewsOwnerRequests = new Map<
  string,
  Promise<OwnerActivationOutcome>
>();
let siteViewsOwnerState: "idle" | "activated" | "failed" = "idle";

function hasActivatedOwner() {
  return siteViewsOwnerState === "activated";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function waitBeforeRetry(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    function handleAbort() {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, RETRY_DELAY_MS);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

async function siteViewsTotalFromResponse(response: Response) {
  if (!response.ok) {
    return null;
  }

  const data: unknown = await response.json().catch(() => null);
  return isSiteViewsResponse(data) ? data.total : null;
}

async function fetchSiteViewsTotal(
  fetcher: SiteViewsFetcher,
  signal?: AbortSignal
) {
  for (let attempt = 0; attempt < READ_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetcher(
        SITE_VIEWS_API_PATH,
        createSiteViewsReadRequest(signal)
      );
      if (response.ok || response.status < 500 || attempt === READ_ATTEMPTS - 1) {
        return siteViewsTotalFromResponse(response);
      }
    } catch (error) {
      if (isAbortError(error) || signal?.aborted || attempt === READ_ATTEMPTS - 1) {
        throw error;
      }
    }

    await waitBeforeRetry(signal);
  }

  return null;
}

function recordSiteView(pathname: string, fetcher: SiteViewsFetcher) {
  if (siteViewsRecordInFlight) {
    return siteViewsRecordInFlight;
  }

  const pendingRequest = fetcher(
    SITE_VIEWS_API_PATH,
    createSiteViewsRecordRequest(pathname)
  )
    .then(siteViewsTotalFromResponse)
    .finally(() => {
      if (siteViewsRecordInFlight === pendingRequest) {
        siteViewsRecordInFlight = null;
      }
    });

  siteViewsRecordInFlight = pendingRequest;
  return pendingRequest;
}

async function totalAfterRecordAttempt(
  pendingRecord: Promise<number | null>,
  fetcher: SiteViewsFetcher,
  signal?: AbortSignal
) {
  try {
    const total = await pendingRecord;
    if (total !== null) {
      return total;
    }
  } catch {
    // Never retry a write automatically; a read can safely recover the display.
  }

  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }

  return fetchSiteViewsTotal(fetcher, signal);
}

async function loadRegularSiteViewsWithoutOwnerGate(
  pathname: string,
  fetcher: SiteViewsFetcher,
  signal?: AbortSignal
) {
  if (siteViewsRecordInFlight) {
    return totalAfterRecordAttempt(siteViewsRecordInFlight, fetcher, signal);
  }

  return isHomePagePath(pathname)
    ? totalAfterRecordAttempt(recordSiteView(pathname, fetcher), fetcher, signal)
    : fetchSiteViewsTotal(fetcher, signal);
}

async function requestOwnerActivation(
  token: string,
  fetcher: SiteViewsFetcher
): Promise<OwnerActivationOutcome> {
  for (let attempt = 0; attempt < OWNER_ACTIVATION_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetcher(
        SITE_VIEWS_API_PATH,
        createSiteViewsOwnerRequest(token)
      );
      if (response.ok) {
        return {
          status: "activated",
          total: await siteViewsTotalFromResponse(response),
        };
      }

      if (response.status === 404) {
        return { status: "invalid", total: null };
      }

      if (response.status < 500 || attempt === OWNER_ACTIVATION_ATTEMPTS - 1) {
        return { status: "failed", total: null };
      }
    } catch {
      if (attempt === OWNER_ACTIVATION_ATTEMPTS - 1) {
        return { status: "failed", total: null };
      }
    }

    await waitBeforeRetry();
  }

  return { status: "failed", total: null };
}

function activateOwner(token: string, fetcher: SiteViewsFetcher) {
  if (hasActivatedOwner()) {
    return Promise.resolve<OwnerActivationOutcome>({
      status: "activated",
      total: null,
    });
  }

  const matchingRequest = siteViewsOwnerRequests.get(token);
  if (matchingRequest) {
    return matchingRequest;
  }

  const previousGate = siteViewsOwnerGate;
  const pendingRequest = (async () => {
    if (previousGate) {
      const previousOutcome = await previousGate;
      if (previousOutcome.status === "activated") {
        return previousOutcome;
      }
    }

    if (hasActivatedOwner()) {
      return { status: "activated", total: null } as const;
    }

    const outcome = await requestOwnerActivation(token, fetcher);
    if (outcome.status === "activated") {
      siteViewsOwnerState = "activated";
    } else if (outcome.status === "invalid") {
      if (siteViewsOwnerState !== "failed") {
        siteViewsOwnerState = "idle";
      }
    } else {
      siteViewsOwnerState = "failed";
    }

    return outcome;
  })();

  siteViewsOwnerRequests.set(token, pendingRequest);
  siteViewsOwnerGate = pendingRequest;
  void pendingRequest.finally(() => {
    if (siteViewsOwnerRequests.get(token) === pendingRequest) {
      siteViewsOwnerRequests.delete(token);
    }
    if (siteViewsOwnerGate === pendingRequest) {
      siteViewsOwnerGate = null;
    }
  });
  return pendingRequest;
}

async function loadSiteViewsWithoutOwnerToken(
  pathname: string,
  fetcher: SiteViewsFetcher,
  signal?: AbortSignal
) {
  const pendingOwnerGate = siteViewsOwnerGate;
  if (pendingOwnerGate) {
    const outcome = await pendingOwnerGate;
    if (siteViewsOwnerGate && siteViewsOwnerGate !== pendingOwnerGate) {
      return loadSiteViewsWithoutOwnerToken(pathname, fetcher, signal);
    }

    if (outcome.status === "activated") {
      return outcome.total ?? fetchSiteViewsTotal(fetcher, signal);
    }
  }

  if (siteViewsOwnerState === "activated") {
    return fetchSiteViewsTotal(fetcher, signal);
  }

  if (siteViewsOwnerState === "failed") {
    return fetchSiteViewsTotal(fetcher, signal);
  }

  return loadRegularSiteViewsWithoutOwnerGate(pathname, fetcher, signal);
}

export async function loadSiteViewsForPath({
  pathname,
  ownerHash,
  signal,
  fetcher = fetch,
  onOwnerHashResolved,
}: LoadSiteViewsOptions) {
  if (ownerHash.kind === "invalid") {
    onOwnerHashResolved?.("clear");
    return loadSiteViewsWithoutOwnerToken(pathname, fetcher, signal);
  }

  if (ownerHash.kind === "token") {
    const outcome = await activateOwner(ownerHash.token, fetcher);
    onOwnerHashResolved?.(outcome.status === "failed" ? "keep" : "clear");

    if (outcome.status === "activated") {
      return outcome.total ?? fetchSiteViewsTotal(fetcher, signal);
    }

    return loadSiteViewsWithoutOwnerToken(pathname, fetcher, signal);
  }

  return loadSiteViewsWithoutOwnerToken(pathname, fetcher, signal);
}

export function resetSiteViewsClientStateForTests() {
  siteViewsRecordInFlight = null;
  siteViewsOwnerGate = null;
  siteViewsOwnerRequests.clear();
  siteViewsOwnerState = "idle";
}
