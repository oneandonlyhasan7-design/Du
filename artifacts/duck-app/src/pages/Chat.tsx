import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { useRooms, useMessages } from "@/hooks/useChat";
import { motion } from "framer-motion";

export function Chat() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  
  const { createOrCreateDMRoom } = useRooms();
  const { messages, loading, sendMessage } = useMessages(activeRoomId);

  const handleSelectRoom = async (idOrUserId: string, name: string) => {
    // If selecting "general", just set it directly
    if (idOrUserId === "general") {
      setActiveRoomId("general");
      setActiveRoomName("General Chat");
      return;
    }

    // Otherwise, we assume it's a User ID, so we get/create the DM room ID
    const dmRoomId = await createOrCreateDMRoom(idOrUserId, name);
    if (dmRoomId) {
      setActiveRoomId(dmRoomId);
      setActiveRoomName(name); // Just show the user's name
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full flex flex-col bg-background overflow-hidden"
    >
      {/* Top Header - Global App Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto bg-card shadow-2xl relative">
        
        {/* Left Sidebar */}
        <Sidebar 
          onSelectRoom={handleSelectRoom} 
          selectedRoomId={activeRoomId} 
        />

        {/* Right Chat Area */}
        <div className="flex-1 hidden md:flex flex-col bg-background border-l border-border h-full relative z-0">
          <ChatWindow 
            roomName={activeRoomName} 
            messages={messages} 
            loading={loading}
            onSendMessage={sendMessage}
          />
        </div>

        {/* Mobile Chat Overlay - absolute positioned */}
        {activeRoomId && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="md:hidden absolute inset-0 z-50 bg-background flex flex-col"
          >
            {/* Mobile Back Button built into header replacement */}
            <div className="h-16 bg-header-bg border-b border-border flex items-center px-2 z-20 shrink-0">
              <button 
                onClick={() => setActiveRoomId(null)}
                className="p-2 mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
                {activeRoomName?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-semibold text-foreground">{activeRoomName}</h2>
            </div>
            
            {/* Reusing ChatWindow minus header */}
            <div className="flex-1 relative flex flex-col h-[calc(100%-4rem)]">
              <ChatWindow 
                roomName={"_hidden_"} // Hack to pass rendering check but rely on absolute positioning logic
                messages={messages} 
                loading={loading}
                onSendMessage={sendMessage}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
