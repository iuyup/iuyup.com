# selfweb Go API

This service incrementally adds a Go backend to `iuyup.com`. Next.js continues
to render the personal site, blog, and SEO pages; this service will own
stateful APIs, beginning with the chat gateway.

## Current capability

`GET /healthz` returns the service status and is intentionally implemented with
the Go standard library only.

`POST /v1/chat` is a server-only DeepSeek chat gateway. It accepts a bounded
JSON conversation, rejects client-supplied `system` roles, applies a per-process
IP rate limit, injects the site's persona on the server, and translates the
provider's SSE response into the plain-text stream consumed by the current UI.

The endpoint is not connected to the Next.js frontend yet. The existing
TypeScript RAG retrieval remains active until its Go replacement is ready.

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

Optional configuration:

- `DEEPSEEK_BASE_URL` defaults to `https://api.deepseek.com`.
- `DEEPSEEK_MODEL` defaults to `deepseek-v4-flash`.
- `API_ADDR` defaults to `:8080`.

The in-memory rate limiter is valid for one service instance. Before deploying
multiple instances, replace it with a shared Redis-backed limiter.

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

Port the current article retrieval into Go, then switch the Next.js chat route
to this service without exposing provider credentials to the browser.
