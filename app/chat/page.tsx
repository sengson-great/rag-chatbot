// src/app/chat/page.tsx
"use client";

import { Fragment, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, FileText, Sparkles } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";

export default function RAGChatBot() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) {
      return;
    }
    sendMessage({
      text: message.text,
    });
    setInput("");
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-5xl flex-col px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border glass px-4 py-2 text-sm font-medium shadow-sm transition-all hover:bg-muted/50">
          <FileText className="size-4 text-primary" />
          <span>Knowledge base active</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border glass-card">
        <Conversation className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <ConversationEmptyState
              className="min-h-full"
              description="Ask me anything about the company knowledge base. I can answer your questions"
              icon={<Bot className="size-12 text-primary/80" />}
              title="Ready to help"
            />
          ) : (
            <ConversationContent className="min-h-full px-6 py-8 sm:px-10">
              {messages.map((message) => (
                <div key={message.id} className="mb-4 last:mb-0">
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent className="overflow-visible leading-8">
                                <div className="prose max-w-none text-base leading-8 [overflow-wrap:anywhere] dark:prose-invert [&_*]:leading-8">
                                  <MessageResponse>{part.text}</MessageResponse>
                                </div>
                              </MessageContent>
                            </Message>
                          </Fragment>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
              {(status === "submitted" || status === "streaming") && (
                <div className="mt-4">
                  <Loader />
                </div>
              )}
            </ConversationContent>
          )}
          <ConversationScrollButton className="bottom-24" />
        </Conversation>

        <div className="shrink-0 bg-linear-to-t from-background/80 to-transparent p-4 sm:p-6">
          <PromptInput
            onSubmit={handleSubmit}
            className="[&_[data-slot=input-group]]:overflow-visible [&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:border-border/60 [&_[data-slot=input-group]]:glass-card [&_[data-slot=input-group]]:shadow-2xl"
          >
            <PromptInputBody>
              <PromptInputTextarea
                className="min-h-12 resize-none px-5 py-3.5 text-base placeholder:text-muted-foreground/50 focus-visible:ring-0"
                placeholder="Message your documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </PromptInputBody>
            <PromptInputFooter className="border-t border-border/40 bg-muted/20 px-4 py-3">
              <div className="flex min-h-10 w-full items-center justify-between">
                <div className="text-xs text-muted-foreground font-medium">
                  RAG mode enabled
                </div>
                <PromptInputSubmit
                  className="size-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  disabled={!input.trim() && status !== "streaming"}
                  status={status}
                />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </main>
  );
}
