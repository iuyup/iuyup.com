# selfweb Go API

This service incrementally adds a Go backend to `iuyup.com`. Next.js continues
to render the personal site, blog, and SEO pages; this service will own
stateful APIs, including the chat gateway and guestbook.

## Current capability

`GET /healthz` returns the service status and is intentionally implemented with
the Go standard library only.

`POST /v1/chat` is a server-only DeepSeek chat gateway. It accepts a bounded
JSON conversation, rejects client-supplied `system` roles, applies a per-process
IP rate limit, injects the site's persona on the server, and translates the
provider's SSE response into the plain-text stream consumed by the current UI.

Each chat turn retrieves published Sanity content and combines it with explicitly
allowlisted local articles. Chinese bigram and Latin-word tokenization select
article excerpts for the server-side persona. Pure local indexing remains available
through `CONTENT_SOURCE=local`.

The current Next.js `POST /api/chat` route proxies browser requests to this
service. Every `/v1/*` request must include the server-only
`X-Selfweb-Proxy-Token` header whose value exactly matches
`GO_API_PROXY_TOKEN`. Missing or invalid credentials are rejected before chat
or guestbook handling. The browser never receives the Go service address,
DeepSeek key, or proxy token. `GET /healthz` remains anonymous for deployment
health checks.

`GET /v1/guestbook` returns a bounded, cursor-paginated list of approved
messages. `POST /v1/guestbook` validates and creates a message, and
`PATCH /v1/guestbook` increments one approved message's likes atomically in
MySQL. Creating a message is limited to three attempts per minute per
client; likes are limited to ten.

The current Next.js `/api/guestbook` route proxies these requests to Go. The
browser continues to use the same URL, while the Go service owns validation,
moderation status, persistence, and atomic updates.

## Run locally

From this directory:

```powershell
go run ./cmd/api
```

Then request `http://localhost:8080/healthz`.

To call any `/v1/*` endpoint locally, configure a proxy token before starting
the service and send the same value from the calling server. The API fails
closed with `401 Unauthorized` when `GO_API_PROXY_TOKEN` is unset. To enable
chat, also configure a DeepSeek key:

```powershell
$env:GO_API_PROXY_TOKEN = 'replace-with-a-long-random-server-only-token'
$env:DEEPSEEK_API_KEY = 'your-server-only-key'
go run ./cmd/api
```

To enable the durable guestbook, first provision MySQL and run its
versioned schema migrations once:

```powershell
$env:DATABASE_URL = 'mysql://user:password@host:3306/selfweb?ssl-mode=REQUIRED'
go run ./cmd/migrate
go run ./cmd/api
```

`DATABASE_URL` accepts both a provider-style `mysql://` URL and the Go MySQL
driver DSN format, for example
`user:password@tcp(host:3306)/selfweb?tls=true&parseTime=true`.

The old Upstash list is not migrated automatically. Export and import any
production messages before switching the deployed Next.js route to this API.

Optional configuration:

- `DEEPSEEK_BASE_URL` defaults to `https://api.deepseek.com`.
- `DEEPSEEK_MODEL` defaults to `deepseek-v4-flash`.
- `API_ADDR` defaults to `:8080`.
- `POSTS_DIR` defaults to `../../content/posts` when the service is started
  from `services/api-go`.
- `GO_API_PROXY_TOKEN` is required for every `/v1/*` request. Set the same
  high-entropy value in the Go service and Next.js. Next.js sends it in
  `X-Selfweb-Proxy-Token`; the Go service uses it both to authenticate the
  server-to-server request and to authorize the forwarded original client IP
  used for rate limiting. Never expose it through a `NEXT_PUBLIC_*` variable.
- `DATABASE_URL` enables the MySQL guestbook. Run `go run ./cmd/migrate`
  against it before starting the API. The API keeps a lazy connection pool so
  a serverless MySQL cold start does not disable the guestbook for the rest of
  the Go process; the migration command still verifies connectivity eagerly.
- `GUESTBOOK_DEFAULT_STATUS` defaults to `approved`; set it to `pending` to
  require review before newly submitted messages appear publicly.

For the Next.js application, configure these server-only variables:

- `GO_API_BASE_URL`, for example `http://127.0.0.1:8080` locally. When Next.js
  runs outside Railway (such as on Vercel), use the Go service's public HTTPS
  address; every `/v1/*` request is still protected by the shared token.
- `GO_API_PROXY_TOKEN`, identical to the Go service value and sent only by the
  server-side proxy routes.
- `TRUST_X_FORWARDED_FOR=true` only when the hosting ingress reliably removes
  client-supplied `X-Forwarded-For` values and writes the real client address.
  It is off by default; without it, Go rate limits the Next.js server address
  rather than accepting a spoofable visitor IP.

The in-memory rate limiters are valid for one service instance. Before
deploying multiple instances, replace them with a shared Redis-backed limiter.

## Railway RAG deployment

The repository-root `Dockerfile` is the production build for this Go service.
It compiles `services/api-go` and copies local posts, notes, and their publication
allowlist into `/content`. Published CMS content is refreshed during chat requests;
only allowlisted local articles use files from the image.

To use it on Railway, set this service's Root Directory to the repository root
(remove `/services/api-go`), clear the custom build and start commands so
Railway uses the `Dockerfile` entrypoint, and retain `/healthz` as the health
check path. The service still receives Railway's `PORT` variable at runtime.

The Docker context deliberately includes only `services/api-go` and
`content/posts`, `content/notes`, and `content/local-publications.json`; browser code, local dependencies, and secret files are not
sent to the image builder.

To use another local port:

```powershell
$env:API_ADDR = ':8081'
go run ./cmd/api
```

## Verify

```powershell
go test ./...
go vet ./...
```

## Next milestone

The Railway deployment now runs the MySQL guestbook and the article-backed
DeepSeek chat gateway. Before running multiple Go instances, replace the
in-memory limiters with a shared Redis-backed limiter and add production
metrics for request rate, provider failures, and database latency.

## Published content and language

The default `CONTENT_SOURCE=sanity` refreshes published posts and notes from Sanity on every chat turn, with a six-second fetch timeout and an 8 MiB response limit. `SANITY_PROJECT_ID` (default `rnbye9v9`) and `SANITY_DATASET` (default `production`) must match the Next.js project. Failed refreshes fail the chat request instead of using a stale local snapshot. Logs include document and chunk counts and the refresh timestamp.

Set `CONTENT_SOURCE=local` in both services only for a deliberately local Markdown site; in this mode `POSTS_DIR` retains its previous meaning and requires restarting the service after edits.

Chat accepts an optional `locale` of `zh-CN` or `en`; other values return 400. Provider streams must finish with `[DONE]`; interrupted streams close the HTTP response with an error so the browser can offer retry.

The same `content/local-publications.json` allowlist used by Next.js preserves articles that have not yet been migrated. `CONTENT_DIR` defaults to `../../content` locally and `/content` in Docker. These explicit local publications load at startup; CMS content overrides matching slugs. After migrating a local article, deploy the updated allowlist to both services. Missing allowlist files fail startup rather than silently losing published content.
