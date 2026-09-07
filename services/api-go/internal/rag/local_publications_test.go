package rag

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLocalPublicationsOnlyIndexAllowlistedFiles(t *testing.T) {
	dir := t.TempDir()
	if err := os.Mkdir(filepath.Join(dir, "posts"), 0700); err != nil {
		t.Fatal(err)
	}
	files := map[string]string{
		"local-publications.json": `{"posts":["local"],"notes":[]}`,
		"posts/local.md":          "---\ntitle: Local article\n---\nPublished retrieval content",
		"posts/removed.md":        "---\ntitle: Removed article\n---\nRemoved retrieval content",
	}
	for name, text := range files {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(text), 0600); err != nil {
			t.Fatal(err)
		}
	}
	source, _ := NewSanitySource("project", "production", nil)
	if err := source.LoadLocalPublications(dir); err != nil {
		t.Fatal(err)
	}
	if len(source.local) != 1 || source.local[0].Slug != "local" {
		t.Fatalf("unexpected local documents: %#v", source.local)
	}
	if err := os.WriteFile(filepath.Join(dir, "local-publications.json"), []byte(`{"posts":["../secret"]}`), 0600); err != nil {
		t.Fatal(err)
	}
	if err := source.LoadLocalPublications(dir); err == nil {
		t.Fatal("path traversal should fail")
	}
}
