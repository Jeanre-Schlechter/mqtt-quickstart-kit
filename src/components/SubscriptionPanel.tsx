
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wifi, X, Plus, Filter } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';
import { useToast } from '@/components/ui/use-toast';

const SubscriptionPanel = () => {
  const { subscribe, unsubscribe, subscriptions, connected } = useMQTTStore();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('');
  const [qos, setQos] = useState('0');
  
  // Topic suggestions
  const topicSuggestions = [
    'sensors/#',
    'home/#',
    'device/+/status',
    '#',
    'sensors/temperature',
    'sensors/humidity'
  ];

  const handleSubscribe = () => {
    if (!topic) {
      toast({ 
        title: "Error",
        description: "Topic cannot be empty", 
        variant: "destructive" 
      });
      return;
    }

    subscribe(topic, { qos: parseInt(qos) });
    
    toast({
      title: "Subscribed",
      description: `Subscribed to ${topic}`,
    });
    
    setTopic('');
  };

  const handleUnsubscribe = (topic: string) => {
    unsubscribe(topic);
    
    toast({
      title: "Unsubscribed",
      description: `Unsubscribed from ${topic}`,
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
            
            <Select
              value={qos}
              onValueChange={setQos}
              disabled={!connected}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="QoS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">QoS 0</SelectItem>
                <SelectItem value="1">QoS 1</SelectItem>
                <SelectItem value="2">QoS 2</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSubscribe} disabled={!connected}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-xs h-8" disabled={!connected}>
                <Filter className="h-3 w-3 mr-1" /> Topic suggestions
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-60">
              <Command>
                <CommandList>
                  <CommandEmpty>No suggestions found.</CommandEmpty>
                  <CommandGroup heading="Common MQTT Topics">
                    {topicSuggestions.map((suggestion) => (
                      <CommandItem 
                        key={suggestion}
                        onSelect={() => setTopic(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <div className="space-y-2">
            <Label>Active Subscriptions</Label>
            <div className="border rounded-md p-2 min-h-20 max-h-36 overflow-y-auto">
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No active subscriptions
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subscriptions.map((topic) => (
                    <Badge key={topic} variant="secondary" className="py-1 px-2">
                      <Wifi className="h-3 w-3 mr-1" />
                      <span className="mr-1">{topic}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnsubscribe(topic)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPanel;
