import React, { useEffect, useRef } from "react";
import { Message } from "@/hooks/useChat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { auth } from "@/firebase";
import { MessageSquareOff } from "lucide-react";
import { motion } from "framer-motion";

interface ChatWindowProps {
  roomName: string | null;
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatWindow({ roomName, messages, loading, onSendMessage }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!roomName) {
    return (
      <div className="flex-1 bg-panel-bg flex flex-col items-center justify-center h-full border-b-[6px] border-primary">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center p-8 max-w-md"
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/duck-logo.png`} 
            alt="Duck App Logo" 
            className="w-48 h-48 mx-auto object-contain drop-shadow-xl mb-8 opacity-80"
          />
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Duck App for Web</h2>
          <p className="text-muted-foreground">
            Send and receive messages without keeping your phone online.
            <br/>Select a contact or the general room to start chatting.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-header-bg border-b border-border flex items-center px-4 z-10 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
          {roomName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{roomName}</h2>
          <p className="text-xs text-muted-foreground">Tap here for contact info</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto chat-pattern relative">
        <div className="absolute inset-0 bg-background/20 dark:bg-black/40 pointer-events-none z-0" />
        
        <div className="relative z-10 py-6 min-h-full flex flex-col justify-end">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground bg-white/50 dark:bg-black/50 rounded-lg mx-auto px-4 backdrop-blur-sm shadow-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 rounded-2xl mx-auto px-8 max-w-sm backdrop-blur-sm shadow-sm border border-border/50">
              <MessageSquareOff className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium text-foreground">No messages yet</p>
              <p className="text-sm mt-1">Send a message to start the conversation.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const isSequential = prevMsg && prevMsg.senderId === msg.senderId;
                
                return (
                  <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    isSequential={!!isSequential} 
                  />
                );
              })}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={onSendMessage} disabled={loading} />
    </div>
  );
}
