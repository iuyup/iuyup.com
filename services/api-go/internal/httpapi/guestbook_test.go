package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/iuyup/selfweb/services/api-go/internal/guestbook"
	"github.com/iuyup/selfweb/services/api-go/internal/ratelimit"
)

func TestGuestbookListReturnsBoundedPage(t *testing.T) {
	store := &guestbookStoreStub{
		page: guestbook.Page{Messages: []guestbook.Message{{ID: "9", Name: "Ada", Text: "hello", Date: "2026-07-17", Likes: 2, Status: guestbook.StatusApproved}}},
	}
	handler := NewHandler(nil, Config{Guestbook: store})

	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/guestbook?limit=10&cursor=42", nil)
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if store.limit != 10 || store.beforeID != 42 {
		t.Fatalf("list options = (%d, %d), want (10, 42)", store.limit, store.beforeID)
	}

	var page guestbook.Page
	if err := json.NewDecoder(response.Body).Decode(&page); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(page.Messages) != 1 || page.Messages[0].ID != "9" {
		t.Fatalf("page = %#v", page)
	}
}

func TestGuestbookCreateValidatesAndAppliesModerationStatus(t *testing.T) {
	store := &guestbookStoreStub{
		createdMessage: guestbook.Message{ID: "10", Name: "小王", Text: "你好", Date: "2026-07-17", Status: guestbook.StatusPending},
	}
	handler := NewHandler(nil, Config{
		Guestbook:              store,
		GuestbookDefaultStatus: guestbook.StatusPending,
	})

	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/v1/guestbook", strings.NewReader(`{"name":" 小王 ","text":" 你好 "}`))
	request.Header.Set("Content-Type", "application/json")
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusCreated {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusCreated)
	}
	if store.input != (guestbook.CreateInput{Name: "小王", Text: "你好"}) {
		t.Fatalf("input = %#v", store.input)
	}
	if store.status != guestbook.StatusPending {
		t.Fatalf("status = %q, want %q", store.status, guestbook.StatusPending)
	}

	invalidResponse := httptest.NewRecorder()
	invalidRequest := httptest.NewRequest(http.MethodPost, "/v1/guestbook", strings.NewReader(`{"name":"","text":"hello"}`))
	invalidRequest.Header.Set("Content-Type", "application/json")
	handler.ServeHTTP(invalidResponse, invalidRequest)
	if invalidResponse.Code != http.StatusBadRequest {
		t.Fatalf("invalid status = %d, want %d", invalidResponse.Code, http.StatusBadRequest)
	}
}

func TestGuestbookCreateIsRateLimited(t *testing.T) {
	store := &guestbookStoreStub{createdMessage: guestbook.Message{ID: "1", Status: guestbook.StatusApproved}}
	handler := NewHandler(nil, Config{
		Guestbook:              store,
		GuestbookCreateLimiter: ratelimit.NewFixedWindow(1, time.Minute),
	})

	for attempt := 0; attempt < 2; attempt++ {
		response := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodPost, "/v1/guestbook", strings.NewReader(`{"name":"Ada","text":"hello"}`))
		request.RemoteAddr = "198.51.100.20:12345"
		request.Header.Set("Content-Type", "application/json")
		handler.ServeHTTP(response, request)

		want := http.StatusCreated
		if attempt == 1 {
			want = http.StatusTooManyRequests
		}
		if response.Code != want {
			t.Fatalf("attempt %d status = %d, want %d", attempt, response.Code, want)
		}
	}
}

func TestGuestbookLikeReturnsStoredAtomicResult(t *testing.T) {
	store := &guestbookStoreStub{
		incrementedMessage: guestbook.Message{ID: "42", Name: "Ada", Text: "hello", Date: "2026-07-17", Likes: 8, Status: guestbook.StatusApproved},
	}
	handler := NewHandler(nil, Config{Guestbook: store})

	response := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPatch, "/v1/guestbook", strings.NewReader(`{"id":"42"}`))
	request.Header.Set("Content-Type", "application/json")
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusOK)
	}
	if store.incrementedID != 42 {
		t.Fatalf("incremented ID = %d, want 42", store.incrementedID)
	}

	var message guestbook.Message
	if err := json.NewDecoder(response.Body).Decode(&message); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if message.Likes != 8 {
		t.Fatalf("likes = %d, want 8", message.Likes)
	}
}

type guestbookStoreStub struct {
	page               guestbook.Page
	createdMessage     guestbook.Message
	incrementedMessage guestbook.Message
	input              guestbook.CreateInput
	status             guestbook.Status
	limit              int
	beforeID           int64
	incrementedID      int64
}

func (store *guestbookStoreStub) ListApproved(_ context.Context, limit int, beforeID int64) (guestbook.Page, error) {
	store.limit = limit
	store.beforeID = beforeID
	return store.page, nil
}

func (store *guestbookStoreStub) Create(_ context.Context, input guestbook.CreateInput, status guestbook.Status) (guestbook.Message, error) {
	store.input = input
	store.status = status
	return store.createdMessage, nil
}

func (store *guestbookStoreStub) IncrementLikes(_ context.Context, id int64) (guestbook.Message, error) {
	store.incrementedID = id
	return store.incrementedMessage, nil
}
