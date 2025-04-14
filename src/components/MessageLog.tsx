
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, MessageSquare, Clock } from 'lucide-react';
import useMQTTStore, { Message } from '@/services/mqtt-service';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const MessageLog = () => {
  const { messages, clearMessages } = useMQTTStore();
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Message Log</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="px-2 py-1">{messages.length}</Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={clearMessages}
              title="Clear messages"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[400px]">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {messages.map((msg, i) => (
                <MessageItem key={i} message={msg} formatTime={formatTime} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const MessageItem = ({ message, formatTime }: { message: Message, formatTime: (timestamp: number) => string }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const copyPayload = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.payload);
  };
  
  const formatPayload = (payload: string) => {
    try {
      const parsed = JSON.parse(payload);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return payload;
    }
  };
  
  const formattedPayload = formatPayload(message.payload);
  const isJson = message.payload !== formattedPayload;
  
  return (
    <div
      className="border rounded-md p-2 hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={toggleExpand}
      onDoubleClick={copyPayload}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="font-mono text-xs px-1 py-0">
              {message.topic}
            </Badge>
            {message.retained && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                retained
              </Badge>
            )}
          </div>
          <div className={cn(
            "font-mono text-xs mt-1",
            expanded ? "whitespace-pre-wrap" : "truncate",
            isJson ? "text-green-600 dark:text-green-400" : ""
          )}>
            {expanded ? formattedPayload : message.payload}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageLog;
