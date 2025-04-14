
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Clock, MessageSquare, DownloadCloud, Pin } from 'lucide-react';
import useMQTTStore, { Message } from '@/services/mqtt-service';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const MessageLog = () => {
  const { messages, clearMessages } = useMQTTStore();
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Filter messages based on topic or payload
  const filteredMessages = messages.filter(
    msg => 
      msg.topic.toLowerCase().includes(filter.toLowerCase()) || 
      msg.payload.toLowerCase().includes(filter.toLowerCase())
  );
  
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [messages, autoScroll]);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };
  
  const exportMessages = () => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mqtt-messages-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Message Log</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 text-xs"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              <Pin className={cn("h-3 w-3 mr-1", autoScroll ? "" : "text-primary")} />
              {autoScroll ? "Auto-scroll on" : "Auto-scroll off"}
            </Button>
            <Badge className="px-2 py-1">{filteredMessages.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <div className="px-6 pb-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter messages"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={clearMessages}
          title="Clear messages"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={exportMessages}
          title="Export messages"
        >
          <DownloadCloud className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-[400px]">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {filteredMessages.map((msg, i) => (
                <MessageItem key={i} message={msg} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="py-2 text-xs text-muted-foreground">
        Double-click on a message to copy its payload.
      </CardFooter>
    </Card>
  );
};

const MessageItem = ({ message }: { message: Message }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const copyPayload = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.payload);
  };
  
  // Try to format JSON payload
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
