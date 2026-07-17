package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/iuyup/selfweb/services/api-go/internal/chat"
	"github.com/iuyup/selfweb/services/api-go/internal/deepseek"
	"github.com/iuyup/selfweb/services/api-go/internal/ratelimit"
)

const defaultMaxRequestBodyBytes int64 = 32 * 1024

// Config configures the HTTP API's dependencies and request limits.
type Config struct {
	Chat                chat.StreamOpener
	RateLimiter         *ratelimit.FixedWindow
	RequestTimeout      time.Duration
	MaxRequestBodyBytes int64
}

// NewHandler exposes the public HTTP routes for the Go API service.
func NewHandler(logger *slog.Logger, config Config) http.Handler {
	if logger == nil {
		logger = slog.Default()
	}
	if config.RateLimiter == nil {
		config.RateLimiter = ratelimit.NewFixedWindow(10, time.Minute)
	}
	if config.RequestTimeout <= 0 {
		config.RequestTimeout = 60 * time.Second
	}
	if config.MaxRequestBodyBytes <= 0 {
		config.MaxRequestBodyBytes = defaultMaxRequestBodyBytes
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", healthz)
	mux.HandleFunc("POST /v1/chat", chatHandler(logger, config))

	return requestLogger(logger, mux)
}

func healthz(writer http.ResponseWriter, _ *http.Request) {
	writeJSON(writer, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "selfweb-api",
	})
}

func chatHandler(logger *slog.Logger, config Config) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.Chat == nil {
			writeError(writer, http.StatusServiceUnavailable, "chat service is not configured")
			return
		}

		if !config.RateLimiter.Allow(clientAddress(request)) {
			writeError(writer, http.StatusTooManyRequests, "rate limit exceeded")
			return
		}

		messages, err := decodeMessages(writer, request, config.MaxRequestBodyBytes)
		if err != nil {
			writeError(writer, http.StatusBadRequest, "invalid chat request")
			return
		}

		requestContext, cancel := context.WithTimeout(request.Context(), config.RequestTimeout)
		defer cancel()

		stream, err := config.Chat.OpenChatStream(requestContext, messages)
		if err != nil {
			logger.Error("open chat stream", "error", err)
			writeError(writer, http.StatusBadGateway, "chat provider is unavailable")
			return
		}
		defer stream.Close()

		flusher, ok := writer.(http.Flusher)
		if !ok {
			writeError(writer, http.StatusInternalServerError, "streaming is not supported")
			return
		}

		writer.Header().Set("Cache-Control", "no-cache")
		writer.Header().Set("Content-Type", "text/plain; charset=utf-8")
		writer.Header().Set("X-Accel-Buffering", "no")
		writer.WriteHeader(http.StatusOK)

		err = deepseek.ForEachContent(stream, func(content string) error {
			if _, err := io.WriteString(writer, content); err != nil {
				return err
			}
			flusher.Flush()
			return nil
		})
		if err != nil && !errors.Is(err, context.Canceled) {
			logger.Error("stream chat response", "error", err)
		}
	}
}

func decodeMessages(writer http.ResponseWriter, request *http.Request, maxBytes int64) ([]chat.Message, error) {
	request.Body = http.MaxBytesReader(writer, request.Body, maxBytes)
	defer request.Body.Close()

	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()

	var payload chat.Request
	if err := decoder.Decode(&payload); err != nil {
		return nil, err
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return nil, errors.New("request body must contain one JSON object")
	}

	return payload.ValidatedMessages()
}

func clientAddress(request *http.Request) string {
	host, _, err := net.SplitHostPort(request.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	if address := strings.TrimSpace(request.RemoteAddr); address != "" {
		return address
	}
	return "unknown"
}

func requestLogger(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		startedAt := time.Now()
		next.ServeHTTP(writer, request)
		logger.Info(
			"request completed",
			"method", request.Method,
			"path", request.URL.Path,
			"duration_ms", time.Since(startedAt).Milliseconds(),
		)
	})
}

func writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(value)
}

func writeError(writer http.ResponseWriter, status int, message string) {
	writeJSON(writer, status, map[string]string{"error": message})
}
