package httpapi

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestV1RoutesRequireProxyTokenBeforeHandlers(t *testing.T) {
	tests := []struct {
		name   string
		method string
		path   string
		body   string
	}{
		{name: "chat", method: http.MethodPost, path: "/v1/chat", body: `{"messages":[{"role":"user","content":"hello"}]}`},
		{name: "guestbook list", method: http.MethodGet, path: "/v1/guestbook"},
		{name: "guestbook create", method: http.MethodPost, path: "/v1/guestbook", body: `{"name":"Ada","text":"hello"}`},
		{name: "guestbook like", method: http.MethodPatch, path: "/v1/guestbook", body: `{"id":"42"}`},
		{name: "future v1 route", method: http.MethodGet, path: "/v1/future"},
	}
	authCases := []struct {
		name            string
		configuredToken string
		providedToken   string
	}{
		{name: "missing", configuredToken: testProxyToken},
		{name: "wrong", configuredToken: testProxyToken, providedToken: "wrong-token"},
		{name: "server token not configured"},
	}

	for _, test := range tests {
		for _, authCase := range authCases {
			t.Run(test.name+"/"+authCase.name, func(t *testing.T) {
				provider := &fakeChatProvider{body: "data: [DONE]\n"}
				store := &guestbookStoreStub{}
				handler := NewHandler(slog.New(slog.NewTextHandler(io.Discard, nil)), Config{
					Chat:       provider,
					Guestbook:  store,
					ProxyToken: authCase.configuredToken,
				})

				request := httptest.NewRequest(test.method, test.path, strings.NewReader(test.body))
				if authCase.providedToken != "" {
					request.Header.Set(proxyTokenHeader, authCase.providedToken)
				}
				response := httptest.NewRecorder()
				handler.ServeHTTP(response, request)

				if response.Code != http.StatusUnauthorized {
					t.Fatalf("status = %d, want %d", response.Code, http.StatusUnauthorized)
				}
				if body := response.Body.String(); body != "{\"error\":\"unauthorized\"}\n" {
					t.Fatalf("body = %q", body)
				}
				if len(provider.requests) != 0 {
					t.Fatalf("chat provider requests = %d, want 0", len(provider.requests))
				}
				if calls := store.listCalls + store.createCalls + store.incrementCalls; calls != 0 {
					t.Fatalf("guestbook store calls = %d, want 0", calls)
				}
			})
		}
	}
}

func TestProxyTokenMatchesOnlyExactNonEmptyValue(t *testing.T) {
	tests := []struct {
		name     string
		provided string
		expected string
		want     bool
	}{
		{name: "exact", provided: testProxyToken, expected: testProxyToken, want: true},
		{name: "wrong same length", provided: "test-proxy-tokem", expected: testProxyToken},
		{name: "wrong different length", provided: "short", expected: testProxyToken},
		{name: "missing provided", expected: testProxyToken},
		{name: "missing expected", provided: testProxyToken},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := proxyTokenMatches(test.provided, test.expected); got != test.want {
				t.Fatalf("proxyTokenMatches() = %t, want %t", got, test.want)
			}
		})
	}
}
