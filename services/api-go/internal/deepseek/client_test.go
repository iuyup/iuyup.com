package deepseek

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/iuyup/selfweb/services/api-go/internal/chat"
)

func TestOpenChatStreamUsesOpenAICompatibleRequest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/chat/completions" {
			t.Fatalf("path = %q", request.URL.Path)
		}
		if got := request.Header.Get("Authorization"); got != "Bearer test-key" {
			t.Fatalf("authorization = %q", got)
		}

		var payload completionRequest
		if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if payload.Model != "test-model" || !payload.Stream {
			t.Fatalf("payload = %#v", payload)
		}
		if len(payload.Messages) != 2 || payload.Messages[0].Role != "system" || payload.Messages[1].Role != "user" {
			t.Fatalf("messages = %#v", payload.Messages)
		}

		writer.Header().Set("Content-Type", "text/event-stream")
		_, _ = writer.Write([]byte("data: [DONE]\n"))
	}))
	defer server.Close()

	client := NewClient(Config{APIKey: "test-key", BaseURL: server.URL, Model: "test-model"})
	client.httpClient = server.Client()

	stream, err := client.OpenChatStream(context.Background(), []chat.Message{{Role: "user", Content: "hello"}})
	if err != nil {
		t.Fatalf("open chat stream: %v", err)
	}
	defer stream.Close()

	if _, err := io.ReadAll(stream); err != nil {
		t.Fatalf("read stream: %v", err)
	}
}

func TestOpenChatStreamUsesPromptBuilder(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		var payload completionRequest
		if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
			t.Fatalf("decode request: %v", err)
		}
		if payload.Messages[0].Content != "base prompt with retrieved context for Go" {
			t.Fatalf("system prompt = %q", payload.Messages[0].Content)
		}
		_, _ = writer.Write([]byte("data: [DONE]\n"))
	}))
	defer server.Close()

	client := NewClient(Config{
		APIKey:  "test-key",
		BaseURL: server.URL,
		Model:   "test-model",
		PromptBuilder: promptBuilderFunc(func(basePrompt, query string) string {
			if basePrompt != personaPrompt || query != "Go" {
				t.Fatalf("prompt builder input = %q / %q", basePrompt, query)
			}
			return "base prompt with retrieved context for " + query
		}),
	})
	client.httpClient = server.Client()

	stream, err := client.OpenChatStream(context.Background(), []chat.Message{{Role: "user", Content: "Go"}})
	if err != nil {
		t.Fatalf("open chat stream: %v", err)
	}
	defer stream.Close()

	if _, err := io.ReadAll(stream); err != nil {
		t.Fatalf("read stream: %v", err)
	}
}

type promptBuilderFunc func(basePrompt, query string) string

func (builder promptBuilderFunc) BuildSystemPrompt(basePrompt, query string) string {
	return builder(basePrompt, query)
}
