import { useEffect, useRef } from "react";
import Message from "./Message";
import type { MessageWithUser } from "@shared/schema";

interface ChatMessagesProps {
  messages: MessageWithUser[];
  currentUsername: string;
  typingUsers: string[];
}

export default function ChatMessages({ messages, currentUsername, typingUsers }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Welcome to the chat!</p>
            <p className="text-sm">Start a conversation by sending a message.</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isOwn={message.user.username === currentUsername}
            data-testid={`message-${message.id}`}
          />
        ))
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-3" data-testid="typing-indicator">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground flex-shrink-0">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          <div className="bg-muted text-muted-foreground p-3 rounded-lg rounded-tl-none">
            <p className="text-sm">
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.join(", ")} are typing...`
              }
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
