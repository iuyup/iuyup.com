package rag

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSanityRefreshIncludesEditsAndRemovesDeletedContent(t *testing.T) {
	body := `{"result":[{"title":"New article","content":"Go retrieval release alpha"}]}`
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("perspective") != "published" {
			t.Error("must request published perspective")
		}
		_, _ = w.Write([]byte(body))
	}))
	defer server.Close()
	source, _ := NewSanitySource("project", "production", nil)
	source.endpoint = server.URL + "?perspective=published"
	source.client = server.Client()
	prompt, err := source.BuildSystemPromptContext(context.Background(), "base", "retrieval")
	if err != nil || !strings.Contains(prompt, "alpha") {
		t.Fatalf("initial prompt = %q, %v", prompt, err)
	}
	body = `{"result":[{"title":"New article","content":"Go retrieval release beta"}]}`
	prompt, err = source.BuildSystemPromptContext(context.Background(), "base", "retrieval")
	if err != nil || !strings.Contains(prompt, "beta") || strings.Contains(prompt, "alpha") {
		t.Fatalf("updated prompt = %q, %v", prompt, err)
	}
	body = `{"result":[]}`
	prompt, err = source.BuildSystemPromptContext(context.Background(), "base", "retrieval")
	if err != nil || prompt != "base" {
		t.Fatalf("deleted prompt = %q, %v", prompt, err)
	}
	body = `{"error":"unavailable"}`
	if _, err := source.BuildSystemPromptContext(context.Background(), "base", "retrieval"); err == nil {
		t.Fatal("invalid payload must fail")
	}
}

func TestSanityHonorsCancellation(t *testing.T) {
	source, _ := NewSanitySource("project", "production", nil)
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := source.BuildSystemPromptContext(ctx, "base", "query"); err == nil {
		t.Fatal("cancelled retrieval must fail")
	}
}
