package rag

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"regexp"
	"time"
)

// SanitySource refreshes from the published dataset for each conversation turn.
// No stale local fallback: deleting a post also removes it from subsequent retrieval.
type SanitySource struct {
	endpoint string
	client   *http.Client
	logger   *slog.Logger
	local    []Document
}

func NewSanitySource(projectID, dataset string, logger *slog.Logger) (*SanitySource, error) {
	valid := regexp.MustCompile(`^[a-z0-9][a-z0-9_-]*$`)
	if !valid.MatchString(projectID) || !valid.MatchString(dataset) {
		return nil, fmt.Errorf("invalid Sanity project or dataset")
	}
	query := `*[_type in ["post", "note"] && defined(slug.current) && defined(publishedAt)]{title, "content": body, "slug": slug.current, "collection": select(_type == "post" => "posts", "notes")}`
	params := url.Values{"perspective": {"published"}, "query": {query}}
	return &SanitySource{
		endpoint: "https://" + projectID + ".api.sanity.io/v2026-07-22/data/query/" + dataset + "?" + params.Encode(),
		client:   &http.Client{Timeout: 6 * time.Second}, logger: logger,
	}, nil
}

func (source *SanitySource) BuildSystemPrompt(base, query string) string {
	prompt, err := source.BuildSystemPromptContext(context.Background(), base, query)
	if err != nil {
		return base
	}
	return prompt
}

func (source *SanitySource) BuildSystemPromptContext(ctx context.Context, base, query string) (string, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, source.endpoint, nil)
	if err != nil {
		return "", err
	}
	response, err := source.client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Sanity returned status %d", response.StatusCode)
	}
	const maxBytes = 8 * 1024 * 1024
	body, err := io.ReadAll(io.LimitReader(response.Body, maxBytes+1))
	if err != nil {
		return "", err
	}
	if len(body) > maxBytes {
		return "", fmt.Errorf("Sanity content exceeds retrieval limit")
	}
	var payload struct {
		Result *[]Document `json:"result"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return "", err
	}
	if payload.Result == nil {
		return "", fmt.Errorf("Sanity response has no published content result")
	}
	documents := append([]Document(nil), (*payload.Result)...)
	published := make(map[string]bool)
	for _, document := range documents {
		published[document.Collection+"/"+document.Slug] = true
	}
	for _, document := range source.local {
		if !published[document.Collection+"/"+document.Slug] {
			documents = append(documents, document)
		}
	}
	index := FromDocuments(documents)
	if source.logger != nil {
		source.logger.Info("published retrieval refreshed", "documents", len(documents), "chunks", index.ChunkCount(), "refreshed_at", time.Now().UTC())
	}
	return index.BuildSystemPrompt(base, query), nil
}
