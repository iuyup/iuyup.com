package rag

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLoadSearchesChineseAndMDXPosts(t *testing.T) {
	postsDirectory := t.TempDir()
	writePost(t, postsDirectory, "go.md", `---
title: Go 并发实践
date: 2026-07-17
---
Go 语言适合构建高并发 HTTP 接口。通过 context 可以取消超时请求。`)
	writePost(t, postsDirectory, "transformer.mdx", `---
title: Transformer 笔记
date: 2026-07-17
---
神经网络通过注意力机制处理文本。`)

	index, err := Load(postsDirectory)
	if err != nil {
		t.Fatalf("load posts: %v", err)
	}
	if index.ChunkCount() != 2 {
		t.Fatalf("chunk count = %d, want 2", index.ChunkCount())
	}

	results := index.Search("Go并发接口怎么做", 1)
	if len(results) != 1 {
		t.Fatalf("results = %d, want 1", len(results))
	}
	if results[0].Title != "Go 并发实践" {
		t.Fatalf("title = %q", results[0].Title)
	}
}

func TestBuildSystemPromptAddsRetrievedContext(t *testing.T) {
	postsDirectory := t.TempDir()
	writePost(t, postsDirectory, "agent.md", `---
title: Agent 文章
date: 2026-07-17
---
多智能体系统需要清晰的任务分配和状态管理。`)

	index, err := Load(postsDirectory)
	if err != nil {
		t.Fatalf("load posts: %v", err)
	}

	prompt := index.BuildSystemPrompt("base prompt", "多智能体任务")
	if !strings.Contains(prompt, "base prompt") {
		t.Fatal("base prompt missing")
	}
	if !strings.Contains(prompt, "【来源：Agent 文章】") {
		t.Fatalf("retrieved context missing: %q", prompt)
	}
}

func TestTokenizeUsesChineseBigramsAndLatinWords(t *testing.T) {
	tokens := Tokenize("神经网络 Transformer AI")
	for _, expected := range []string{"神经", "经网", "网络", "transformer", "ai"} {
		if !contains(tokens, expected) {
			t.Fatalf("token %q missing from %#v", expected, tokens)
		}
	}
}

func writePost(t *testing.T, directory, name, content string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(directory, name), []byte(content), 0o600); err != nil {
		t.Fatalf("write post: %v", err)
	}
}

func contains(tokens []string, expected string) bool {
	for _, token := range tokens {
		if token == expected {
			return true
		}
	}
	return false
}
