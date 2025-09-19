import type { MessageWithUser } from "@shared/schema";

interface MessageProps {
  message: MessageWithUser;
  isOwn: boolean;
}

export default function Message({ message, isOwn }: MessageProps) {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isOwn) {
    return (
      <div className="flex items-start gap-3 justify-end animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex-1 max-w-xs lg:max-w-md">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            <span className="text-sm font-medium text-foreground">You</span>
          </div>
          <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none ml-auto">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground flex-shrink-0">
          {getInitials(message.user.username)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-medium text-accent-foreground flex-shrink-0">
        {getInitials(message.user.username)}
      </div>
      <div className="flex-1 max-w-xs lg:max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {message.user.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="bg-secondary text-secondary-foreground p-3 rounded-lg rounded-tl-none">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
