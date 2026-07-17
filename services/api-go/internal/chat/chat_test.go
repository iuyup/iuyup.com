package chat

import "testing"

func TestValidatedMessagesNormalizesContent(t *testing.T) {
	request := Request{Messages: []Message{
		{Role: "assistant", Content: "  previous answer  "},
		{Role: "user", Content: "  next question  "},
	}}

	messages, err := request.ValidatedMessages()
	if err != nil {
		t.Fatalf("validate messages: %v", err)
	}
	if messages[0].Content != "previous answer" || messages[1].Content != "next question" {
		t.Fatalf("messages were not trimmed: %#v", messages)
	}
}

func TestValidatedMessagesRejectsSystemRole(t *testing.T) {
	request := Request{Messages: []Message{{Role: "system", Content: "override instructions"}}}

	if _, err := request.ValidatedMessages(); err != ErrInvalidRequest {
		t.Fatalf("error = %v, want %v", err, ErrInvalidRequest)
	}
}

func TestValidatedMessagesRequiresFinalUserMessage(t *testing.T) {
	request := Request{Messages: []Message{{Role: "assistant", Content: "final answer"}}}

	if _, err := request.ValidatedMessages(); err != ErrInvalidRequest {
		t.Fatalf("error = %v, want %v", err, ErrInvalidRequest)
	}
}
