"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Keep one slot for the message currently being sent; the Go API accepts 12.
const MAX_HISTORY_MESSAGES = 11;

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('chat:open', handler);
    return () => window.removeEventListener('chat:open', handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messagesRef.current.slice(-MAX_HISTORY_MESSAGES), userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，出了点问题。请稍后重试。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] h-[500px] rounded-2xl shadow-xl flex flex-col overflow-hidden z-50"
          style={{ background: "#F5F0EB" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center gap-3"
            style={{ background: "#E8E2DA", borderColor: "#D5CEC7" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
              style={{ background: "#6B8DAE" }}
            >
              T
            </div>
            <div>
              <div className="font-medium text-sm" style={{ color: "#2C2C2C" }}>
                T&apos;s AI Assistant
              </div>
              <div className="text-xs" style={{ color: "#6B6B6B" }}>
                在线
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "#6B6B6B" }}>
                  你好！有什么想了解的？
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap"
                  style={{
                    background: msg.role === "user" ? "#6B8DAE" : "#E8E2DA",
                    color: msg.role === "user" ? "#F5F0EB" : "#2C2C2C",
                  }}
                >
                  {msg.role === "assistant"
                    ? msg.content.replace(/\*\*/g, '').replace(/#{1,3}\s?/g, '').replace(/^- /gm, '')
                    : msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{ background: "#E8E2DA", color: "#6B6B6B" }}
                >
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t"
            style={{ background: "#E8E2DA", borderColor: "#D5CEC7" }}
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#F5F0EB", color: "#2C2C2C" }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: "#6B8DAE", color: "#F5F0EB" }}
              >
                发送
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
