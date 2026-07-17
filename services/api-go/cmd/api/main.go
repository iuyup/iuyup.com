package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/iuyup/selfweb/services/api-go/internal/chat"
	"github.com/iuyup/selfweb/services/api-go/internal/deepseek"
	"github.com/iuyup/selfweb/services/api-go/internal/guestbook"
	"github.com/iuyup/selfweb/services/api-go/internal/httpapi"
	"github.com/iuyup/selfweb/services/api-go/internal/rag"
	"github.com/iuyup/selfweb/services/api-go/internal/ratelimit"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	address := envOrDefault("API_ADDR", ":8080")
	promptBuilder := newPromptBuilder(logger)
	chatClient := newChatClient(logger, promptBuilder)
	guestbookStore, closeGuestbookStore := newGuestbookStore(logger)
	defer closeGuestbookStore()

	server := &http.Server{
		Addr: address,
		Handler: httpapi.NewHandler(logger, httpapi.Config{
			Chat:                    chatClient,
			RateLimiter:             ratelimit.NewFixedWindow(10, time.Minute),
			RequestTimeout:          60 * time.Second,
			TrustedProxyToken:       os.Getenv("GO_API_PROXY_TOKEN"),
			Guestbook:               guestbookStore,
			GuestbookCreateLimiter:  ratelimit.NewFixedWindow(3, time.Minute),
			GuestbookLikeLimiter:    ratelimit.NewFixedWindow(10, time.Minute),
			GuestbookRequestTimeout: 5 * time.Second,
			GuestbookDefaultStatus:  guestbookDefaultStatus(logger),
		}),
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	shutdownSignal, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	serverErrors := make(chan error, 1)
	go func() {
		logger.Info("api server started", "address", address)
		serverErrors <- server.ListenAndServe()
	}()

	select {
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			logger.Error("api server stopped unexpectedly", "error", err)
			os.Exit(1)
		}
	case <-shutdownSignal.Done():
		logger.Info("shutdown signal received")
	}

	shutdownContext, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownContext); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
		os.Exit(1)
	}

	logger.Info("api server stopped")
}

func newChatClient(logger *slog.Logger, promptBuilder deepseek.PromptBuilder) chat.StreamOpener {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		logger.Warn("chat gateway disabled: DEEPSEEK_API_KEY is not configured")
		return nil
	}

	return deepseek.NewClient(deepseek.Config{
		APIKey:        apiKey,
		BaseURL:       envOrDefault("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
		Model:         envOrDefault("DEEPSEEK_MODEL", "deepseek-v4-flash"),
		PromptBuilder: promptBuilder,
	})
}

func newPromptBuilder(logger *slog.Logger) deepseek.PromptBuilder {
	postsDirectory := envOrDefault("POSTS_DIR", "../../content/posts")
	index, err := rag.Load(postsDirectory)
	if err != nil {
		logger.Warn("RAG retrieval disabled: could not load posts", "directory", postsDirectory, "error", err)
		return nil
	}

	logger.Info("RAG retrieval loaded", "directory", postsDirectory, "chunks", index.ChunkCount())
	return index
}

func newGuestbookStore(logger *slog.Logger) (guestbook.Store, func()) {
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		logger.Warn("guestbook disabled: DATABASE_URL is not configured")
		return nil, func() {}
	}

	connectContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	store, err := guestbook.OpenMySQL(connectContext, databaseURL)
	if err != nil {
		logger.Error("guestbook disabled: could not connect to mysql", "error", err)
		return nil, func() {}
	}

	logger.Info("guestbook mysql connected")
	return store, func() {
		if err := store.Close(); err != nil {
			logger.Error("close guestbook mysql", "error", err)
		}
	}
}

func guestbookDefaultStatus(logger *slog.Logger) guestbook.Status {
	status, err := guestbook.ParseStatus(envOrDefault("GUESTBOOK_DEFAULT_STATUS", string(guestbook.StatusApproved)))
	if err != nil {
		logger.Warn("invalid GUESTBOOK_DEFAULT_STATUS; using approved", "error", err)
		return guestbook.StatusApproved
	}
	return status
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
