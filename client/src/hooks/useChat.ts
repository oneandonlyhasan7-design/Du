import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MessageWithUser, OnlineUser } from "@shared/schema";

interface ChatMessage {
  type: string;
  message?: MessageWithUser;
  user?: { id: string; username: string };
  users?: OnlineUser[];
  username?: string;
  isTyping?: boolean;
}

export function useChat(socket: WebSocket | null, username: string) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch initial messages
  const { data: initialMessages } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/messages'],
    enabled: !!username,
  });

  // Fetch initial online users
  const { data: initialOnlineUsers } = useQuery<OnlineUser[]>({
    queryKey: ['/api/users/online'],
    enabled: !!username,
  });

  useEffect(() => {
    if (initialMessages && Array.isArray(initialMessages)) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (initialOnlineUsers && Array.isArray(initialOnlineUsers)) {
      setOnlineUsers(initialOnlineUsers);
    }
  }, [initialOnlineUsers]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data: ChatMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            if (data.message) {
              setMessages(prev => [...prev, data.message!]);
            }
            break;
            
          case 'userJoined':
            if (data.user) {
              // Refresh online users
              queryClient.invalidateQueries({ queryKey: ['/api/users/online'] });
            }
            break;
            
          case 'userLeft':
            if (data.user) {
              // Refresh online users
              queryClient.invalidateQueries({ queryKey: ['/api/users/online'] });
            }
            break;
            
          case 'onlineUsers':
            if (data.users) {
              setOnlineUsers(data.users);
            }
            break;
            
          case 'typing':
            if (data.username && data.username !== username) {
              if (data.isTyping) {
                setTypingUsers(prev => 
                  prev.includes(data.username!) ? prev : [...prev, data.username!]
                );
              } else {
                setTypingUsers(prev => prev.filter(user => user !== data.username));
              }
            }
            break;
            
          case 'error':
            console.error('Chat error:', data);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, username, queryClient]);

  const sendMessage = useCallback((content: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        content
      }));
    }
  }, [socket]);

  const startTyping = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing'
      }));
    }
  }, [socket]);

  const stopTyping = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'stopTyping'
      }));
    }
  }, [socket]);

  return {
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping
  };
}
