package rag

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// LoadLocalPublications reads an explicit allowlist, never a fallback directory scan.
func (source *SanitySource) LoadLocalPublications(contentRoot string) error {
	raw, err := os.ReadFile(filepath.Join(contentRoot, "local-publications.json"))
	if err != nil {
		return err
	}
	var publications map[string][]string
	if err := json.Unmarshal(raw, &publications); err != nil {
		return err
	}
	var documents []Document
	for collection, slugs := range publications {
		if collection != "posts" && collection != "notes" {
			return fmt.Errorf("invalid local publication collection")
		}
		for _, slug := range slugs {
			if slug == "" || slug == "." || slug == ".." || strings.ContainsAny(slug, "/\\\x00") {
				return fmt.Errorf("invalid local publication slug")
			}
			var body []byte
			for _, extension := range []string{".md", ".mdx"} {
				body, err = os.ReadFile(filepath.Join(contentRoot, collection, slug+extension))
				if err == nil {
					break
				}
				if !os.IsNotExist(err) {
					return err
				}
			}
			if err != nil {
				return err
			}
			title, content := splitFrontMatter(string(body), slug)
			documents = append(documents, Document{Slug: slug, Collection: collection, Title: title, Content: content})
		}
	}
	source.local = documents
	return nil
}
