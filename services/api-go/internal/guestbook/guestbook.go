package guestbook

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

const (
	MaxNameRunes = 50
	MaxTextRunes = 500
)

// Status controls whether a message is visible in the public guestbook.
type Status string

const (
	StatusApproved Status = "approved"
	StatusPending  Status = "pending"
	StatusRejected Status = "rejected"
)

var ErrNotFound = errors.New("guestbook message not found")

// Message is the public representation consumed by the website UI.
type Message struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Text   string `json:"text"`
	Date   string `json:"date"`
	Likes  int64  `json:"likes"`
	Status Status `json:"status"`
}

// Page is a bounded, cursor-based guestbook listing.
type Page struct {
	Messages   []Message `json:"messages"`
	NextCursor string    `json:"nextCursor,omitempty"`
}

// CreateInput is visitor-controlled content before validation and persistence.
type CreateInput struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

// Store isolates HTTP behavior from the persistence implementation.
type Store interface {
	ListApproved(ctx context.Context, limit int, beforeID int64) (Page, error)
	Create(ctx context.Context, input CreateInput, status Status) (Message, error)
	IncrementLikes(ctx context.Context, id int64) (Message, error)
}

// ValidateCreateInput trims visitor input and applies character limits rather
// than byte limits, so Chinese names and messages are counted correctly.
func ValidateCreateInput(input CreateInput) (CreateInput, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Text = strings.TrimSpace(input.Text)

	if input.Name == "" || input.Text == "" {
		return CreateInput{}, errors.New("name and text are required")
	}
	if utf8.RuneCountInString(input.Name) > MaxNameRunes {
		return CreateInput{}, fmt.Errorf("name must be at most %d characters", MaxNameRunes)
	}
	if utf8.RuneCountInString(input.Text) > MaxTextRunes {
		return CreateInput{}, fmt.Errorf("text must be at most %d characters", MaxTextRunes)
	}

	return input, nil
}

// ParseStatus accepts only values represented by the database constraint.
func ParseStatus(value string) (Status, error) {
	status := Status(strings.TrimSpace(value))
	switch status {
	case StatusApproved, StatusPending, StatusRejected:
		return status, nil
	default:
		return "", fmt.Errorf("unsupported guestbook status %q", value)
	}
}
