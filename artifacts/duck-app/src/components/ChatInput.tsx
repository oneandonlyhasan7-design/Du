import React, { useState, useRef, useEffect } from "react";
import { Smile, Send, Paperclip } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText("");
      setShowEmoji(false);
      inputRef.current?.focus();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative bg-header-bg p-3 px-4 flex items-end gap-3 z-20">
      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div ref={emojiRef} className="absolute bottom-full left-2 mb-2 z-50 shadow-2xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-2">
          <EmojiPicker 
            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT} 
            onEmojiClick={onEmojiClick}
            lazyLoadEmojis
            searchDisabled
          />
        </div>
      )}

      <button 
        onClick={() => setShowEmoji(!showEmoji)}
        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 shrink-0"
      >
        <Smile className="w-6 h-6" />
      </button>

      <button className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5 shrink-0">
        <Paperclip className="w-6 h-6" />
      </button>

      <div className="flex-1 bg-background rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all flex items-center min-h-[44px]">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Select a chat to start messaging" : "Type a message"}
          className="w-full bg-transparent border-none focus:outline-none resize-none px-4 py-3 max-h-32 min-h-[44px] text-foreground scrollbar-thin"
          rows={1}
          style={{ height: "44px" }}
        />
      </div>

      <button 
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className={cn(
          "p-3 rounded-full flex items-center justify-center transition-all shrink-0",
          text.trim() 
            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg scale-100" 
            : "bg-muted text-muted-foreground scale-90 cursor-not-allowed opacity-50"
        )}
      >
        <Send className="w-5 h-5 ml-0.5" />
      </button>
    </div>
  );
}
