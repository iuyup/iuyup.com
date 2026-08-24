package httpapi

import (
	"crypto/sha256"
	"crypto/subtle"
	"net/http"
)

const proxyTokenHeader = "X-Selfweb-Proxy-Token"

func requireProxyToken(expectedToken string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if !proxyTokenMatches(request.Header.Get(proxyTokenHeader), expectedToken) {
			writeError(writer, http.StatusUnauthorized, "unauthorized")
			return
		}

		next.ServeHTTP(writer, request)
	})
}

func proxyTokenMatches(providedToken, expectedToken string) bool {
	if providedToken == "" || expectedToken == "" {
		return false
	}

	providedHash := sha256.Sum256([]byte(providedToken))
	expectedHash := sha256.Sum256([]byte(expectedToken))
	return subtle.ConstantTimeCompare(providedHash[:], expectedHash[:]) == 1
}
