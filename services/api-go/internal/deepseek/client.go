package deepseek

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/iuyup/selfweb/services/api-go/internal/chat"
)

const personaPrompt = `你是 T 的个人 AI 助手，部署在 T 的个人网站上。访客可以通过你了解 T。

关于 T：
- 21 岁，汕头大学大三，光电信息科学与工程专业
- 对 AI Agent、开源、长期主义感兴趣
- 项目：AgentFlow（10+种多智能体设计模式）、Auto-Tweet Agent（7节点推文系统）、RAG 2.0（混合检索+重排）
- 技术栈：Python、LangGraph、LangChain、MCP
- 长期路线：AI → 算力 → 芯片 → 能源
- 喜欢《黑镜》，思考技术与人的关系
- 喜欢听歌，喜欢 rnb、 喜欢 neosoul、喜欢jazz。喜欢陶喆、王力宏、方大同、黄宣
- 说话风格：简洁直接，不啰嗦，偶尔中英混搭，喜欢用破折号补充说明

用简洁友好的中文回答，像 T 本人在聊天。不编造 T 没有的经历。

回答时不要使用Markdown格式，不要用加粗、##标题、编号列表。用纯文本自然对话的方式回答，简洁口语化，每次回复控制在3-5句话以内。

重要：绝对不要使用任何Markdown语法，包括加粗、斜体、##标题、- 列表。只用纯文本。`

// Config defines the server-only DeepSeek connection settings.
type Config struct {
	APIKey        string
	BaseURL       string
	Model         string
	PromptBuilder PromptBuilder
}

// PromptBuilder enriches the fixed persona with server-owned retrieval context.
type PromptBuilder interface {
	BuildSystemPrompt(basePrompt, query string) string
}

// Client speaks the OpenAI-compatible DeepSeek Chat Completions protocol.
type Client struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
	prompt     PromptBuilder
}

// NewClient constructs a DeepSeek client. Callers keep the API key in server
// environment variables and never send it to the browser.
func NewClient(config Config) *Client {
	return &Client{
		apiKey:     config.APIKey,
		baseURL:    strings.TrimRight(config.BaseURL, "/"),
		model:      config.Model,
		httpClient: http.DefaultClient,
		prompt:     config.PromptBuilder,
	}
}

type completionRequest struct {
	Model    string         `json:"model"`
	Messages []chat.Message `json:"messages"`
	Stream   bool           `json:"stream"`
}

// OpenChatStream opens, but does not parse, the provider's SSE response.
func (client *Client) OpenChatStream(ctx context.Context, messages []chat.Message) (io.ReadCloser, error) {
	systemPrompt := personaPrompt
	if client.prompt != nil {
		systemPrompt = client.prompt.BuildSystemPrompt(personaPrompt, messages[len(messages)-1].Content)
	}

	payload := completionRequest{
		Model: client.model,
		Messages: append([]chat.Message{
			{Role: "system", Content: systemPrompt},
		}, messages...),
		Stream: true,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal completion request: %w", err)
	}

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		client.baseURL+"/chat/completions",
		strings.NewReader(string(body)),
	)
	if err != nil {
		return nil, fmt.Errorf("create provider request: %w", err)
	}
	request.Header.Set("Authorization", "Bearer "+client.apiKey)
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Accept", "text/event-stream")

	response, err := client.httpClient.Do(request)
	if err != nil {
		return nil, fmt.Errorf("call provider: %w", err)
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		defer response.Body.Close()
		return nil, fmt.Errorf("provider returned status %d", response.StatusCode)
	}

	return response.Body, nil
}
