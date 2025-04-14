
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, X, Plus } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';
import { useToast } from '@/hooks/use-toast';

const SubscriptionPanel = () => {
  const { subscribe, unsubscribe, subscriptions, connected } = useMQTTStore();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('demo/topic');
  
  // Auto-subscribe to demo/topic when connected
  useEffect(() => {
    if (connected && !subscriptions.includes('demo/topic')) {
      handleSubscribe();
    }
  }, [connected, subscriptions]);

  const handleSubscribe = () => {
    if (!topic) {
      toast({ 
        title: "Error",
        description: "Topic cannot be empty", 
        variant: "destructive" 
      });
      return;
    }

    subscribe(topic);
    
    toast({
      title: "Subscribed",
      description: `Subscribed to ${topic}`,
    });
    
    setTopic('');
  };

  const handleUnsubscribe = (topicToUnsub: string) => {
    unsubscribe(topicToUnsub);
    
    toast({
      title: "Unsubscribed",
      description: `Unsubscribed from ${topicToUnsub}`,
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter topic to subscribe"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!connected}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
            </div>
            
            <Button onClick={handleSubscribe} disabled={!connected}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="border rounded-md p-2 min-h-20 max-h-36 overflow-y-auto">
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No active subscriptions
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subscriptions.map((subTopic) => (
                  <Badge key={subTopic} variant="secondary" className="py-1 px-2">
                    <Wifi className="h-3 w-3 mr-1" />
                    <span className="mr-1">{subTopic}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsubscribe(subTopic)}
                      className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPanel;
