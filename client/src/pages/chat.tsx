import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/hooks/useSocket";
import { useChat } from "@/hooks/useChat";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { Moon, Sun, Menu, Settings, X } from "lucide-react";

export default function Chat() {
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginError, setLoginError] = useState<string>("");

  const { socket, isConnected } = useSocket();
  const { 
    messages, 
    onlineUsers, 
    typingUsers, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useChat(socket, username);

  useEffect(() => {
    // Check for saved username
    const savedUsername = localStorage.getItem("chat-username");
    if (savedUsername) {
      setUsername(savedUsername);
      handleLogin(savedUsername);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogin = async (usernameToLogin: string) => {
    if (!usernameToLogin.trim()) return;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: usernameToLogin.trim(), 
          password: "password123" // Simple auth for demo
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLoggedIn(true);
        setUsername(data.user.username);
        localStorage.setItem("chat-username", data.user.username);
        setLoginError("");
        
        // Join the chat via WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "join",
            username: data.user.username
          }));
        }
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (error) {
      setLoginError("Connection error. Please try again.");
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("chat-username");
    if (socket) {
      socket.close();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Join Chat</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your username to start chatting
                </p>
              </div>
              
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleLogin(username);
                    }
                  }}
                  data-testid="input-username"
                />
                {loginError && (
                  <p className="text-sm text-destructive" data-testid="text-login-error">
                    {loginError}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={() => handleLogin(username)} 
                className="w-full"
                data-testid="button-login"
              >
                Join Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <ChatSidebar 
        onlineUsers={onlineUsers}
        className="hidden lg:flex"
        data-testid="sidebar-desktop"
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          data-testid="overlay-sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 lg:hidden ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <ChatSidebar 
          onlineUsers={onlineUsers}
          onClose={() => setIsSidebarOpen(false)}
          data-testid="sidebar-mobile"
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Header */}
        <div className="p-4 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                data-testid="button-toggle-sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">General Chat</h1>
                <p className="text-sm text-muted-foreground">
                  <span data-testid="text-online-count">{onlineUsers.length}</span> members online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                data-testid="button-dark-mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ChatMessages 
          messages={messages}
          currentUsername={username}
          typingUsers={typingUsers}
          data-testid="messages-container"
        />

        {/* Message Input */}
        <ChatInput
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          isConnected={isConnected}
          messageCount={messages.length}
          data-testid="input-area"
        />
      </div>
    </div>
  );
}
