package main

import (
	"context"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/iuyup/selfweb/services/api-go/internal/guestbook"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		logger.Error("DATABASE_URL is required to run migrations")
		os.Exit(1)
	}

	contextWithTimeout, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	store, err := guestbook.OpenMySQL(contextWithTimeout, databaseURL)
	if err != nil {
		logger.Error("connect mysql", "error", err)
		os.Exit(1)
	}
	defer store.Close()

	if err := store.Migrate(contextWithTimeout); err != nil {
		logger.Error("apply guestbook migrations", "error", err)
		os.Exit(1)
	}

	logger.Info("guestbook migrations complete")
}
