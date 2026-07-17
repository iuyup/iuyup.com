package rag

import (
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"unicode/utf8"
)

const (
	chunkSizeRunes = 500
	defaultTopK    = 5
)

type indexedChunk struct {
	title   string
	content string
	tokens  []string
}

// Result is a ranked article excerpt that can be added to the model context.
type Result struct {
	Title   string
	Content string
	Score   float64
}

// Index is immutable after Load, which makes concurrent search requests safe.
type Index struct {
	chunks []indexedChunk
	idf    map[string]float64
}

// Load indexes every Markdown and MDX post in a directory.
func Load(postsDirectory string) (*Index, error) {
	entries, err := os.ReadDir(postsDirectory)
	if err != nil {
		return nil, err
	}

	chunks := make([]indexedChunk, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		extension := strings.ToLower(filepath.Ext(entry.Name()))
		if extension != ".md" && extension != ".mdx" {
			continue
		}

		path := filepath.Join(postsDirectory, entry.Name())
		raw, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}

		title, content := splitFrontMatter(string(raw), entry.Name())
		for _, chunk := range chunkText(content) {
			tokens := Tokenize(chunk)
			if len(tokens) == 0 {
				continue
			}
			chunks = append(chunks, indexedChunk{
				title:   title,
				content: chunk,
				tokens:  tokens,
			})
		}
	}

	return &Index{chunks: chunks, idf: computeIDF(chunks)}, nil
}

// ChunkCount exposes the index size for startup logging and health diagnostics.
func (index *Index) ChunkCount() int {
	if index == nil {
		return 0
	}
	return len(index.chunks)
}

// Search ranks article chunks by normalized TF-IDF score.
func (index *Index) Search(query string, limit int) []Result {
	if index == nil || len(index.chunks) == 0 || limit <= 0 {
		return nil
	}

	queryTokens := Tokenize(query)
	if len(queryTokens) == 0 {
		return nil
	}

	results := make([]Result, 0, len(index.chunks))
	for _, chunk := range index.chunks {
		score := score(queryTokens, chunk.tokens, index.idf)
		if score == 0 {
			continue
		}
		results = append(results, Result{
			Title:   chunk.title,
			Content: chunk.content,
			Score:   score,
		})
	}

	sort.Slice(results, func(left, right int) bool {
		if results[left].Score == results[right].Score {
			return results[left].Title < results[right].Title
		}
		return results[left].Score > results[right].Score
	})

	if len(results) > limit {
		return results[:limit]
	}
	return results
}

// BuildSystemPrompt implements the prompt-builder boundary consumed by the
// DeepSeek client. Retrieved text remains server-side and is never accepted
// from the browser as a system message.
func (index *Index) BuildSystemPrompt(basePrompt, query string) string {
	results := index.Search(query, defaultTopK)
	if len(results) == 0 {
		return basePrompt
	}

	var context strings.Builder
	for position, result := range results {
		if position > 0 {
			context.WriteString("\n\n---\n\n")
		}
		context.WriteString("【来源：")
		context.WriteString(result.Title)
		context.WriteString("】\n")
		context.WriteString(result.Content)
	}

	return basePrompt + "\n\n以下是 T 的文章中与当前话题相关的内容，回答时可以参考：\n---\n" + context.String() + "\n---"
}

func splitFrontMatter(raw, filename string) (string, string) {
	content := strings.ReplaceAll(raw, "\r\n", "\n")
	title := strings.TrimSuffix(filename, filepath.Ext(filename))
	title = strings.ReplaceAll(title, "_", " ")

	if !strings.HasPrefix(content, "---\n") {
		return title, content
	}

	end := strings.Index(content[4:], "\n---\n")
	if end == -1 {
		return title, content
	}

	frontMatter := content[4 : end+4]
	for _, line := range strings.Split(frontMatter, "\n") {
		key, value, found := strings.Cut(line, ":")
		if found && strings.TrimSpace(key) == "title" {
			if parsedTitle := strings.Trim(strings.TrimSpace(value), "\"'"); parsedTitle != "" {
				title = parsedTitle
			}
			break
		}
	}

	return title, strings.TrimSpace(content[end+9:])
}

func chunkText(content string) []string {
	paragraphs := strings.Split(strings.ReplaceAll(content, "\r\n", "\n"), "\n\n")
	chunks := make([]string, 0)
	var current strings.Builder
	currentRunes := 0

	flush := func() {
		if text := strings.TrimSpace(current.String()); text != "" {
			chunks = append(chunks, text)
		}
		current.Reset()
		currentRunes = 0
	}

	for _, paragraph := range paragraphs {
		paragraph = strings.TrimSpace(paragraph)
		if paragraph == "" {
			continue
		}

		for _, segment := range splitByRunes(paragraph, chunkSizeRunes) {
			segmentRunes := utf8.RuneCountInString(segment)
			separatorRunes := 0
			if currentRunes > 0 {
				separatorRunes = 2
			}
			if currentRunes > 0 && currentRunes+separatorRunes+segmentRunes > chunkSizeRunes {
				flush()
			}
			if currentRunes > 0 {
				current.WriteString("\n\n")
			}
			current.WriteString(segment)
			currentRunes += separatorRunes + segmentRunes
		}
	}
	flush()
	return chunks
}

func splitByRunes(text string, size int) []string {
	runes := []rune(text)
	if len(runes) <= size {
		return []string{text}
	}

	segments := make([]string, 0, (len(runes)+size-1)/size)
	for start := 0; start < len(runes); start += size {
		end := start + size
		if end > len(runes) {
			end = len(runes)
		}
		segments = append(segments, string(runes[start:end]))
	}
	return segments
}

func computeIDF(chunks []indexedChunk) map[string]float64 {
	documentFrequency := make(map[string]int)
	for _, chunk := range chunks {
		seen := make(map[string]struct{})
		for _, token := range chunk.tokens {
			seen[token] = struct{}{}
		}
		for token := range seen {
			documentFrequency[token]++
		}
	}

	idf := make(map[string]float64, len(documentFrequency))
	for token, frequency := range documentFrequency {
		idf[token] = math.Log(float64(len(chunks)+1)/float64(frequency+1)) + 1
	}
	return idf
}

func score(queryTokens, chunkTokens []string, idf map[string]float64) float64 {
	frequencies := make(map[string]int)
	maxFrequency := 1
	for _, token := range chunkTokens {
		frequencies[token]++
		if frequencies[token] > maxFrequency {
			maxFrequency = frequencies[token]
		}
	}

	var total float64
	for _, token := range queryTokens {
		frequency := frequencies[token]
		if frequency == 0 {
			continue
		}
		total += float64(frequency) / float64(maxFrequency) * idf[token]
	}
	return total
}
