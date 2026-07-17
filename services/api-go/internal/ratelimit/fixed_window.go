package ratelimit

import (
	"sync"
	"time"
)

type entry struct {
	startedAt time.Time
	count     int
}

// FixedWindow is a process-local per-key rate limiter. It is appropriate for a
// single service instance; use a shared store before horizontally scaling.
type FixedWindow struct {
	mu      sync.Mutex
	limit   int
	window  time.Duration
	entries map[string]entry
	now     func() time.Time
}

func NewFixedWindow(limit int, window time.Duration) *FixedWindow {
	return &FixedWindow{
		limit:   limit,
		window:  window,
		entries: make(map[string]entry),
		now:     time.Now,
	}
}

// Allow records an attempt and returns whether it is inside the current window.
func (limiter *FixedWindow) Allow(key string) bool {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	now := limiter.now()
	current, exists := limiter.entries[key]
	if !exists || now.Sub(current.startedAt) >= limiter.window {
		limiter.entries[key] = entry{startedAt: now, count: 1}
		limiter.removeExpired(now)
		return limiter.limit > 0
	}

	if current.count >= limiter.limit {
		return false
	}

	current.count++
	limiter.entries[key] = current
	return true
}

func (limiter *FixedWindow) removeExpired(now time.Time) {
	for key, current := range limiter.entries {
		if now.Sub(current.startedAt) >= limiter.window {
			delete(limiter.entries, key)
		}
	}
}
