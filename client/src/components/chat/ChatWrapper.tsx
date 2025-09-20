import { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getMessages, sendMessage } from "../supabase-helper/supabaseClient"; // Correct path

interface ChatWrapperProps {
  currentUsername: string;
}

export default function ChatWrapper({ currentUsername }: ChatWrapperProps) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Load messages from Supabase
  const loadMessages = async () => {
    try {
      const msgs = await getMessages();
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle sending a new message
  const handleSend = async (messageText: string) => {
    try {
      await sendMessage(currentUsername, messageText);
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <>
      <ChatMessages
        messages={messages}
        currentUsername={currentUsername}
        typingUsers={typingUsers} // Keep your existing typing logic
      />
      <ChatInput currentUserId={currentUsername} onMessageSent={handleSend} />
    </>
  );
}
