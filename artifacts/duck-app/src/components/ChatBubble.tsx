import React from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { Message } from "@/hooks/useChat";
import { auth } from "@/firebase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: Message;
  isSequential: boolean; // if previous message was from same sender
}

export function ChatBubble({ message, isSequential }: ChatBubbleProps) {
  const isMe = message.senderId === auth.currentUser?.uid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full px-4 md:px-12",
        isMe ? "justify-end" : "justify-start",
        isSequential ? "mt-1" : "mt-4"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[70%] relative flex flex-col shadow-sm border border-black/5 dark:border-white/5",
          "px-3 py-2 text-[15px] leading-relaxed",
          isMe 
            ? "bg-[color:var(--color-bubble-sent)] text-[color:var(--color-bubble-sent-text)]" 
            : "bg-[color:var(--color-bubble-received)] text-[color:var(--color-bubble-received-text)]",
          isMe 
            ? isSequential ? "rounded-xl rounded-tr-sm" : "rounded-2xl rounded-tr-sm"
            : isSequential ? "rounded-xl rounded-tl-sm" : "rounded-2xl rounded-tl-sm"
        )}
      >
        {/* Tail point for non-sequential messages */}
        {!isSequential && (
          <div className={cn(
            "absolute top-0 w-4 h-4",
            isMe ? "-right-2" : "-left-2"
          )}>
            <svg viewBox="0 0 8 13" width="8" height="13" className={isMe ? "text-[color:var(--color-bubble-sent)]" : "text-[color:var(--color-bubble-received)]"}>
              <path opacity="0.13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
              <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
            </svg>
          </div>
        )}

        {!isMe && !isSequential && (
          <span className="text-xs font-bold text-accent mb-1 truncate block">
            {message.senderName}
          </span>
        )}
        
        <div className="flex items-end flex-wrap gap-2">
          <span className="break-words max-w-full text-left">{message.text}</span>
          
          <div className="flex items-center gap-1 mt-1 ml-auto shrink-0 float-right">
            <span className="text-[10px] text-muted-foreground font-medium opacity-80">
              {message.timestamp ? format(message.timestamp.toDate(), "HH:mm") : "..."}
            </span>
            {isMe && (
              <span className={cn("ml-0.5", message.status === "seen" ? "text-blue-500" : "text-muted-foreground/60")}>
                {message.status === "sent" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
