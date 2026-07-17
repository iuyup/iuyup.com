package deepseek

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"strings"
)

type streamChunk struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
}

// ForEachContent converts DeepSeek's data-only SSE events into plain text
// chunks so the existing website client can consume the response unchanged.
func ForEachContent(stream io.Reader, write func(string) error) error {
	scanner := bufio.NewScanner(stream)
	scanner.Buffer(make([]byte, 4*1024), 1*1024*1024)

	for scanner.Scan() {
		line := scanner.Text()
		if !strings.HasPrefix(line, "data:") {
			continue
		}

		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			return nil
		}

		var chunk streamChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			return fmt.Errorf("decode stream chunk: %w", err)
		}

		for _, choice := range chunk.Choices {
			if choice.Delta.Content == "" {
				continue
			}
			if err := write(choice.Delta.Content); err != nil {
				return err
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return fmt.Errorf("read stream: %w", err)
	}
	return nil
}
