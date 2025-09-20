import { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { getMessages, sendMessage } from "../supabase-helper/supabaseClient";

export default function ChatWrapper({ currentUsername }) {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    const msgs = await getMessages();
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (messageText) => {
    await sendMessage(currentUsername, messageText);
    loadMessages();
  };

  return (
    <>
      <ChatMessages
        messages={messages}
        currentUsername={currentUsername}
        typingUsers={[]}
      />
      <ChatInput currentUserId={currentUsername} onMessageSent={handleSend} />
    </>
  );
}