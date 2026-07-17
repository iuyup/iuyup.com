package deepseek

import (
	"strings"
	"testing"
)

func TestForEachContent(t *testing.T) {
	stream := strings.NewReader("data: {\"choices\":[{\"delta\":{\"content\":\"hello \"}}]}\n\ndata: {\"choices\":[{\"delta\":{\"content\":\"world\"}}]}\n\ndata: [DONE]\n")
	var content strings.Builder

	if err := ForEachContent(stream, func(chunk string) error {
		_, err := content.WriteString(chunk)
		return err
	}); err != nil {
		t.Fatalf("stream content: %v", err)
	}

	if content.String() != "hello world" {
		t.Fatalf("content = %q", content.String())
	}
}

func TestForEachContentRejectsInvalidJSON(t *testing.T) {
	err := ForEachContent(strings.NewReader("data: not-json\n"), func(string) error { return nil })
	if err == nil {
		t.Fatal("invalid JSON should return an error")
	}
}
