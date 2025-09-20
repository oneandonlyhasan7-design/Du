import { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getMessages, sendMessage } from "../../supabase-helper/supabaseClient"; // FIXED path

interface ChatWrapperProps {
  currentUsername: string;
}

export default function ChatWrapper({ currentUsername }: ChatWrapperProps) {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const loadMessages = async () => {
    const msgs = await getMessages();
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (messageText: string) => {
    await sendMessage(currentUsername, messageText);
    loadMessages();
  };

  return (
    <>
      <ChatMessages
        messages={messages}
        currentUsername={currentUsername}
        typingUsers={typingUsers}
      />
      <ChatInput currentUserId={currentUsername} onMessageSent={handleSend} />
    </>
  );
}
