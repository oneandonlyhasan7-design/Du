import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import OnlineUser from "./OnlineUser";
import type { OnlineUser as OnlineUserType } from "@shared/schema";

interface ChatSidebarProps {
  onlineUsers: OnlineUserType[];
  onClose?: () => void;
  className?: string;
}

export default function ChatSidebar({ onlineUsers, onClose, className = "" }: ChatSidebarProps) {
  return (
    <div className={`w-80 bg-card border-r border-border flex-col ${className}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Online Users</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground" data-testid="text-online-count">
              {onlineUsers.length}
            </span>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-2"
                data-testid="button-close-sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Online Users List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {onlineUsers.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm" data-testid="text-no-users">
            No users online
          </div>
        ) : (
          onlineUsers.map((user) => (
            <OnlineUser 
              key={user.id} 
              user={user}
              data-testid={`user-${user.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}
