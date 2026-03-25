import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { auth } from "@/firebase";
import { Moon, Sun, MoreVertical, LogOut, MessageSquare } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  return (
    <div className="h-16 bg-header-bg border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-10 w-full relative">
      <div className="flex items-center gap-3">
        {/* User Avatar Placeholder */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
          {auth.currentUser?.photoURL ? (
            <img src={auth.currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{auth.currentUser?.email?.[0].toUpperCase() || "U"}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground leading-tight">
            {auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "User"}
          </span>
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
