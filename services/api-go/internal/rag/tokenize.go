package rag

import (
	"strings"
	"unicode"
)

// Tokenize produces overlapping bigrams for continuous Chinese text and whole
// normalized tokens for Latin words and numbers. This gives Chinese queries a
// useful lexical retrieval signal without a third-party segmentation library.
func Tokenize(text string) []string {
	tokens := make([]string, 0)
	latin := make([]rune, 0)
	han := make([]rune, 0)

	flushLatin := func() {
		if len(latin) >= 2 {
			tokens = append(tokens, strings.ToLower(string(latin)))
		}
		latin = latin[:0]
	}
	flushHan := func() {
		switch len(han) {
		case 0:
		case 1:
			tokens = append(tokens, string(han))
		default:
			for index := 0; index < len(han)-1; index++ {
				tokens = append(tokens, string(han[index:index+2]))
			}
		}
		han = han[:0]
	}

	for _, character := range text {
		switch {
		case unicode.Is(unicode.Han, character):
			flushLatin()
			han = append(han, character)
		case unicode.IsLetter(character) || unicode.IsNumber(character):
			flushHan()
			latin = append(latin, character)
		default:
			flushHan()
			flushLatin()
		}
	}

	flushHan()
	flushLatin()
	return tokens
}
