package chat

import (
	"context"
	"errors"
	"io"
	"strings"
	"unicode/utf8"
)

const (
	maxMessages            = 12
	maxMessageContentRunes = 2_000
	maxConversationRunes   = 12_000
)

var ErrInvalidRequest = errors.New("invalid chat request")

// Message is the only client-controlled conversation shape accepted by the API.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Request is the public request contract for the chat endpoint.
type Request struct {
	Messages []Message `json:"messages"`
}

// StreamOpener creates the upstream model stream after input has been validated.
type StreamOpener interface {
	OpenChatStream(context.Context, []Message) (io.ReadCloser, error)
}

// ValidatedMessages rejects client-controlled system instructions and normalizes
// accepted content before it can reach the model provider.
func (request Request) ValidatedMessages() ([]Message, error) {
	if len(request.Messages) == 0 || len(request.Messages) > maxMessages {
		return nil, ErrInvalidRequest
	}

	validated := make([]Message, 0, len(request.Messages))
	totalRunes := 0
	for _, message := range request.Messages {
		if message.Role != "user" && message.Role != "assistant" {
			return nil, ErrInvalidRequest
		}

		content := strings.TrimSpace(message.Content)
		contentRunes := utf8.RuneCountInString(content)
		if contentRunes == 0 || contentRunes > maxMessageContentRunes {
			return nil, ErrInvalidRequest
		}

		totalRunes += contentRunes
		if totalRunes > maxConversationRunes {
			return nil, ErrInvalidRequest
		}

		validated = append(validated, Message{Role: message.Role, Content: content})
	}

	if validated[len(validated)-1].Role != "user" {
		return nil, ErrInvalidRequest
	}

	return validated, nil
}
