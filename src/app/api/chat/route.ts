import OpenAI from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const SYSTEM_PROMPT = `你是 T 的个人 AI 助手，部署在 T 的个人网站上。访客可以通过你了解 T。

关于 T：
- 20 岁，汕头大学大三，光电信息科学与工程专业
- 对 AI Agent、开源、长期主义感兴趣
- 项目：AgentFlow（10种多智能体设计模式）、Auto-Tweet Agent（7节点推文系统）、RAG 2.0（混合检索+重排）
- 技术栈：Python、LangGraph、LangChain、MCP、PyTorch
- 长期路线：AI → 算力 → 芯片 → 能源
- 喜欢《黑镜》，思考技术与人的关系
- 说话风格：简洁直接，不啰嗦，偶尔中英混搭，喜欢用破折号补充说明

用简洁友好的中文回答，像 T 本人在聊天。不编造 T 没有的经历。

回答时不要使用Markdown格式，不要用加粗、##标题、编号列表。用纯文本自然对话的方式回答，简洁口语化，每次回复控制在3-5句话以内。

重要：绝对不要使用任何Markdown语法，包括加粗、斜体、##标题、- 列表。只用纯文本。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
