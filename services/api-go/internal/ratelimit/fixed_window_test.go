package ratelimit

import (
	"testing"
	"time"
)

func TestFixedWindow(t *testing.T) {
	limiter := NewFixedWindow(2, time.Minute)
	now := time.Date(2026, time.July, 17, 0, 0, 0, 0, time.UTC)
	limiter.now = func() time.Time { return now }

	if !limiter.Allow("127.0.0.1") {
		t.Fatal("first request should be allowed")
	}
	if !limiter.Allow("127.0.0.1") {
		t.Fatal("second request should be allowed")
	}
	if limiter.Allow("127.0.0.1") {
		t.Fatal("third request should be rejected")
	}

	now = now.Add(time.Minute)
	if !limiter.Allow("127.0.0.1") {
		t.Fatal("request after the window should be allowed")
	}
}
