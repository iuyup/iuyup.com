package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/iuyup/selfweb/services/api-go/internal/chat"
	"github.com/iuyup/selfweb/services/api-go/internal/deepseek"
	"github.com/iuyup/selfweb/services/api-go/internal/httpapi"
	"github.com/iuyup/selfweb/services/api-go/internal/ratelimit"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	address := envOrDefault("API_ADDR", ":8080")
	chatClient := newChatClient(logger)

	server := &http.Server{
		Addr: address,
		Handler: httpapi.NewHandler(logger, httpapi.Config{
			Chat:           chatClient,
			RateLimiter:    ratelimit.NewFixedWindow(10, time.Minute),
			RequestTimeout: 60 * time.Second,
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

func newChatClient(logger *slog.Logger) chat.StreamOpener {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	if apiKey == "" {
		logger.Warn("chat gateway disabled: DEEPSEEK_API_KEY is not configured")
		return nil
	}

	return deepseek.NewClient(deepseek.Config{
		APIKey:  apiKey,
		BaseURL: envOrDefault("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
		Model:   envOrDefault("DEEPSEEK_MODEL", "deepseek-v4-flash"),
	})
}

func envOrDefault(name, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}
	return fallback
}
