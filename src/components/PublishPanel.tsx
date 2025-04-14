
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizonal } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';
import { useToast } from '@/hooks/use-toast';

const PublishPanel = () => {
  const { publish, connected } = useMQTTStore();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('demo/topic');
  const [message, setMessage] = useState('Hello MQTT World!');
  
  const handlePublish = () => {
    if (!topic) {
      toast({ 
        title: "Error",
        description: "Topic cannot be empty", 
        variant: "destructive" 
      });
      return;
    }

    publish(topic, message);
    
    toast({
      title: "Message Published",
      description: `Published to ${topic}`,
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Publish Message</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!connected}
            />
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!connected}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={handlePublish} 
            disabled={!connected} 
            className="w-full mt-2"
          >
            <SendHorizonal className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishPanel;
