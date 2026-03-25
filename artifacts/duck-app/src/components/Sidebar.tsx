import React, { useState } from "react";
import { Search, Users, Hash } from "lucide-react";
import { useUsers, UserProfile } from "@/hooks/useChat";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onSelectRoom: (roomId: string, name: string) => void;
  selectedRoomId: string | null;
}

export function Sidebar({ onSelectRoom, selectedRoomId }: SidebarProps) {
  const { users, loading } = useUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-[350px] lg:w-[400px] h-full bg-panel-bg flex flex-col border-r border-border shrink-0">
      <div className="p-3 border-b border-border bg-header-bg shrink-0">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        {/* Global Chat / General Room Fake Item */}
        <div 
          onClick={() => onSelectRoom("general", "General Chat")}
          className={cn(
            "flex items-center p-3 cursor-pointer transition-colors border-b border-border/50",
            selectedRoomId === "general" ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Hash className="w-6 h-6" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-foreground font-semibold truncate">General Chat</h4>
            </div>
            <p className="text-sm text-muted-foreground truncate">Global public room</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Loading contacts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Users className="w-8 h-8 opacity-50" />
            <p>No contacts found.</p>
          </div>
        ) : (
          <div className="py-1">
            <h5 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contacts
            </h5>
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                onClick={() => onSelectRoom(user.id, user.displayName)} // we'll intercept this to create a DM room
                className={cn(
                  "flex items-center p-3 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 group",
                  // Active state would require checking if this user maps to the selected DM room
                )}
              >
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 relative">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-secondary font-bold text-lg">{user.displayName[0].toUpperCase()}</span>
                  )}
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-panel-bg"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0 border-b border-border/50 group-hover:border-transparent pb-3">
                  <div className="flex justify-between items-center mb-1 mt-2">
                    <h4 className="text-foreground font-semibold truncate">{user.displayName}</h4>
                    {user.lastSeen && !user.online && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(user.lastSeen.toDate(), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                    {user.online ? <span className="text-primary text-xs">Online</span> : <span>Offline</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
