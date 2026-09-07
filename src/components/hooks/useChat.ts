"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildChatRequest, readChatReply, type ChatMessage, type ChatLocale } from "@/lib/chat-client";

export function useChat(locale: ChatLocale) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const active = useRef<AbortController | null>(null);
  const attempt = useRef<{ history: ChatMessage[]; prompt: string } | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); };
  }, []);

  function update(next: ChatMessage[]) {
    messagesRef.current = next;
    if (mounted.current) setMessages(next);
  }

  async function send(prompt: string, retry = false) {
    if (active.current) return false;
    const history = retry && attempt.current ? attempt.current.history : messagesRef.current;
    let payload;
    try { payload = buildChatRequest(history, prompt, locale); }
    catch { setError("invalid-input"); return false; }
    attempt.current = { history, prompt };
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), 70_000);
    setIsLoading(true);
    setError(null);
    setCanRetry(false);
    const conversation: ChatMessage[] = [...history, { role: "user", content: prompt.trim(), status: "streaming" }];
    update(conversation);
    let partial = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const text = await readChatReply(response, controller.signal, (value) => {
        partial = value;
        update([...conversation, { role: "assistant", content: value, status: "streaming" }]);
      });
      update([...history, { role: "user", content: prompt.trim(), status: "complete" }, { role: "assistant", content: text, status: "complete" }]);
    } catch (failure) {
      update([...history, { role: "user", content: prompt.trim(), status: "interrupted" },
        ...(partial.trim() ? [{ role: "assistant" as const, content: partial, status: "interrupted" as const }] : [])]);
      if (mounted.current) {
        setError(controller.signal.aborted
          ? controller.signal.reason?.name === "TimeoutError" ? "timeout" : "stopped"
          : failure instanceof Error ? failure.message : "unavailable");
        setCanRetry(true);
      }
    } finally {
      clearTimeout(timer);
      active.current = null;
      if (mounted.current) setIsLoading(false);
    }
    return true;
  }

  const stop = useCallback(() => active.current?.abort(), []);
  return { messages, isLoading, error, canRetry, send, stop,
    retry: () => attempt.current && send(attempt.current.prompt, true),
  };
}
