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

At startup, the service indexes Markdown and MDX posts with Chinese bigram and
Latin-word tokenization. The best article excerpts are added to the server-side
persona for each chat request.

The current Next.js `POST /api/chat` route proxies browser requests to this
service. The browser never receives the Go service address, DeepSeek key, or
proxy token.

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

To enable the chat endpoint locally, configure a DeepSeek key before starting
the service:

```powershell
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
- `GO_API_PROXY_TOKEN` is optional for direct local calls. In production, set
  the same high-entropy value in the Go service and in Next.js; it authorizes
  Next.js to forward the original client IP for rate limiting.
- `DATABASE_URL` enables the MySQL guestbook. Run `go run ./cmd/migrate`
  against it before starting the API.
- `GUESTBOOK_DEFAULT_STATUS` defaults to `approved`; set it to `pending` to
  require review before newly submitted messages appear publicly.

For the Next.js application, configure these server-only variables:

- `GO_API_BASE_URL`, for example `http://127.0.0.1:8080` locally or the private
  address of the deployed Go service.
- `GO_API_PROXY_TOKEN`, identical to the Go service value.
- `TRUST_X_FORWARDED_FOR=true` only when the hosting ingress reliably removes
  client-supplied `X-Forwarded-For` values and writes the real client address.
  It is off by default; without it, Go rate limits the Next.js server address
  rather than accepting a spoofable visitor IP.

The in-memory rate limiters are valid for one service instance. Before
deploying multiple instances, replace them with a shared Redis-backed limiter.

## Railway RAG deployment

The repository-root `Dockerfile` is the production build for this Go service.
It compiles `services/api-go`, copies the canonical `content/posts` directory
into the runtime image, and sets `POSTS_DIR=/content/posts`. This keeps the
deployed RAG corpus aligned with the blog without maintaining a second copy of
the articles in the Go module.

To use it on Railway, set this service's Root Directory to the repository root
(remove `/services/api-go`), clear the custom build and start commands so
Railway uses the `Dockerfile` entrypoint, and retain `/healthz` as the health
check path. The service still receives Railway's `PORT` variable at runtime.

The Docker context deliberately includes only `services/api-go` and
`content/posts`; browser code, local dependencies, and secret files are not
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

Deploy MySQL, migrate existing guestbook messages, and replace the
in-memory limiters with a shared store before running multiple Go instances.
