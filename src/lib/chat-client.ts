export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  status?: "complete" | "streaming" | "interrupted";
}

export const MAX_CHAT_CHARACTERS = 2_000;
export type ChatLocale = "zh-CN" | "en";

export function buildChatRequest(history: ChatMessage[], prompt: string, locale: ChatLocale) {
  const content = prompt.trim();
  if (!content || Array.from(content).length > MAX_CHAT_CHARACTERS) throw new Error("invalid-input");
  const messages: ChatMessage[] = [{ role: "user", content }];
  let characters = Array.from(content).length;
  for (const message of [...history].reverse()) {
    if (message.status && message.status !== "complete") continue;
    const text = Array.from(message.content.trim()).slice(0, MAX_CHAT_CHARACTERS).join("");
    if (!text) continue;
    if (messages.length === 12 || characters + Array.from(text).length > 12_000) break;
    const candidate = [{ role: message.role, content: text }, ...messages];
    if (new TextEncoder().encode(JSON.stringify({ messages: candidate, locale })).length > 32 * 1024) break;
    messages.unshift({ role: message.role, content: text });
    characters += Array.from(text).length;
  }
  return { messages, locale };
}

export async function readChatReply(response: Response, signal: AbortSignal, onText: (text: string) => void) {
  if (!response.ok) throw new Error(response.status === 429 ? "rate-limit" : "unavailable");
  if (!response.body) throw new Error("empty-reply");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  const abort = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", abort, { once: true });
  try {
    signal.throwIfAborted();
    while (true) {
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    text += decoder.decode();
    if (!text.trim()) throw new Error("empty-reply");
    onText(text);
    return text;
  } finally {
    signal.removeEventListener("abort", abort);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
