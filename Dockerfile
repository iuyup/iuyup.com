FROM golang:1.26.5 AS build

WORKDIR /src

COPY services/api-go/go.mod services/api-go/go.sum ./services/api-go/
RUN cd services/api-go && go mod download

COPY services/api-go ./services/api-go
COPY content/posts ./content/posts

WORKDIR /src/services/api-go
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/selfweb-api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

COPY --from=build --chown=nonroot:nonroot /out/selfweb-api ./selfweb-api
COPY --from=build --chown=nonroot:nonroot /src/content/posts /content/posts

ENV POSTS_DIR=/content/posts
EXPOSE 8080
USER nonroot:nonroot

ENTRYPOINT ["./selfweb-api"]
