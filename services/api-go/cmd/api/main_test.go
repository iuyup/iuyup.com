package main

import (
	"io"
	"log/slog"
	"testing"
)

func TestNewGuestbookStoreKeepsPoolWhileMySQLStarts(t *testing.T) {
	t.Setenv("DATABASE_URL", "app:secret@tcp(127.0.0.1:1)/selfweb")
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	store, closeStore := newGuestbookStore(logger)
	if store == nil {
		t.Fatal("newGuestbookStore() returned nil for a valid lazy MySQL pool")
	}
	closeStore()
}
