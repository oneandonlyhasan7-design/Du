import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  isConnected: boolean;
  messageCount: number;
}

export default function ChatInput({ 
  onSendMessage, 
  onStartTyping, 
  onStopTyping, 
  isConnected,
  messageCount 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<number>();

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage("");
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    if (value.trim()) {
      onStartTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing after 1 second of inactivity
      typingTimeoutRef.current = window.setTimeout(() => {
        onStopTyping();
      }, 1000);
    } else {
      onStopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-card border-t border-border">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="pr-20"
            data-testid="input-message"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              data-testid="button-emoji"
            >
              <Smile className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              data-testid="button-attachment"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !isConnected}
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" data-testid="connection-status">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span data-testid="text-message-count">{messageCount} messages</span>
          <span data-testid="text-last-activity">Last activity: now</span>
        </div>
      </div>
    </div>
  );
}
