"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        assistantMessage.content = "Error: Failed to get response.";
        setMessages([...newMessages, assistantMessage]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantMessage.content += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { ...assistantMessage }]);
      }
    } catch {
      assistantMessage.content = "Error: Connection failed.";
      setMessages([...newMessages, assistantMessage]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">AI Chat</h1>
        <p className="mt-2 text-muted-foreground">
          Streaming chat powered by Bifrost AI gateway.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground">
            Send a message to start chatting.
          </p>
        )}
        {messages.map((msg, i) => (
          <Card
            key={i}
            className={msg.role === "user" ? "ml-12" : "mr-12"}
          >
            <CardContent className="pt-4">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {msg.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </CardContent>
          </Card>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
