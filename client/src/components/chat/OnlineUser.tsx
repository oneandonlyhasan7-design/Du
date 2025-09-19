import type { OnlineUser as OnlineUserType } from "@shared/schema";

interface OnlineUserProps {
  user: OnlineUserType;
}

export default function OnlineUser({ user }: OnlineUserProps) {
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    if (user.isOnline) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (user.isOnline) return 'Online';
    return 'Offline';
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
      <div className="relative">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
          {getInitials(user.username)}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor()} border-2 border-background rounded-full`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {user.username}
        </p>
        <p className="text-xs text-muted-foreground">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}
