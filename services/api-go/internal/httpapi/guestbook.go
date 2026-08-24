package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/iuyup/selfweb/services/api-go/internal/guestbook"
)

const (
	defaultGuestbookLimit       = 20
	maxGuestbookLimit           = 50
	maxGuestbookRequestBodySize = 4 * 1024
)

func listGuestbookMessages(logger *slog.Logger, config Config) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.Guestbook == nil {
			writeError(writer, http.StatusServiceUnavailable, "guestbook service is not configured")
			return
		}

		limit, beforeID, err := guestbookPageRequest(request)
		if err != nil {
			writeError(writer, http.StatusBadRequest, "invalid guestbook page request")
			return
		}

		requestContext, cancel := context.WithTimeout(request.Context(), config.GuestbookRequestTimeout)
		defer cancel()

		page, err := config.Guestbook.ListApproved(requestContext, limit, beforeID)
		if err != nil {
			logger.Error("list guestbook messages", "error", err)
			writeError(writer, http.StatusInternalServerError, "guestbook service is unavailable")
			return
		}

		writer.Header().Set("Cache-Control", "no-store")
		writeJSON(writer, http.StatusOK, page)
	}
}

func createGuestbookMessage(logger *slog.Logger, config Config) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.Guestbook == nil {
			writeError(writer, http.StatusServiceUnavailable, "guestbook service is not configured")
			return
		}
		if !config.GuestbookCreateLimiter.Allow(clientAddress(request, config.ProxyToken)) {
			writeError(writer, http.StatusTooManyRequests, "guestbook message rate limit exceeded")
			return
		}

		input, err := decodeGuestbookInput(writer, request)
		if err != nil {
			writeError(writer, http.StatusBadRequest, "invalid guestbook message")
			return
		}

		requestContext, cancel := context.WithTimeout(request.Context(), config.GuestbookRequestTimeout)
		defer cancel()

		message, err := config.Guestbook.Create(requestContext, input, config.GuestbookDefaultStatus)
		if err != nil {
			logger.Error("create guestbook message", "error", err)
			writeError(writer, http.StatusInternalServerError, "guestbook service is unavailable")
			return
		}

		writer.Header().Set("Cache-Control", "no-store")
		writeJSON(writer, http.StatusCreated, message)
	}
}

func likeGuestbookMessage(logger *slog.Logger, config Config) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		if config.Guestbook == nil {
			writeError(writer, http.StatusServiceUnavailable, "guestbook service is not configured")
			return
		}
		if !config.GuestbookLikeLimiter.Allow(clientAddress(request, config.ProxyToken)) {
			writeError(writer, http.StatusTooManyRequests, "guestbook like rate limit exceeded")
			return
		}

		id, err := decodeGuestbookLikeID(writer, request)
		if err != nil {
			writeError(writer, http.StatusBadRequest, "invalid guestbook like request")
			return
		}

		requestContext, cancel := context.WithTimeout(request.Context(), config.GuestbookRequestTimeout)
		defer cancel()

		message, err := config.Guestbook.IncrementLikes(requestContext, id)
		if errors.Is(err, guestbook.ErrNotFound) {
			writeError(writer, http.StatusNotFound, "guestbook message not found")
			return
		}
		if err != nil {
			logger.Error("increment guestbook likes", "error", err)
			writeError(writer, http.StatusInternalServerError, "guestbook service is unavailable")
			return
		}

		writer.Header().Set("Cache-Control", "no-store")
		writeJSON(writer, http.StatusOK, message)
	}
}

func guestbookPageRequest(request *http.Request) (int, int64, error) {
	limit := defaultGuestbookLimit
	if rawLimit := request.URL.Query().Get("limit"); rawLimit != "" {
		parsedLimit, err := strconv.Atoi(rawLimit)
		if err != nil || parsedLimit < 1 || parsedLimit > maxGuestbookLimit {
			return 0, 0, errors.New("invalid limit")
		}
		limit = parsedLimit
	}

	beforeID, err := guestbook.ParseCursor(request.URL.Query().Get("cursor"))
	if err != nil {
		return 0, 0, err
	}
	return limit, beforeID, nil
}

func decodeGuestbookInput(writer http.ResponseWriter, request *http.Request) (guestbook.CreateInput, error) {
	request.Body = http.MaxBytesReader(writer, request.Body, maxGuestbookRequestBodySize)
	defer request.Body.Close()

	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()

	var input guestbook.CreateInput
	if err := decoder.Decode(&input); err != nil {
		return guestbook.CreateInput{}, err
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return guestbook.CreateInput{}, errors.New("request body must contain one JSON object")
	}

	return guestbook.ValidateCreateInput(input)
}

func decodeGuestbookLikeID(writer http.ResponseWriter, request *http.Request) (int64, error) {
	request.Body = http.MaxBytesReader(writer, request.Body, maxGuestbookRequestBodySize)
	defer request.Body.Close()

	var payload struct {
		ID string `json:"id"`
	}
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&payload); err != nil {
		return 0, err
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		return 0, errors.New("request body must contain one JSON object")
	}

	id, err := strconv.ParseInt(strings.TrimSpace(payload.ID), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New("id must be a positive integer")
	}
	return id, nil
}
