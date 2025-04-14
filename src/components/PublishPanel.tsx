import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SendHorizonal } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';
import { useToast } from '@/components/ui/use-toast';

const PublishPanel = () => {
  const { publish, connected } = useMQTTStore();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('sensors/temperature');
  const [message, setMessage] = useState('{"value": 22.5, "unit": "C"}');
  const [qos, setQos] = useState('0');
  const [retain, setRetain] = useState(false);
  
  // Recent topic suggestions
  const topicSuggestions = [
    'sensors/temperature',
    'sensors/humidity',
    'home/lights',
    'home/security',
    'device/status'
  ];

  const handlePublish = () => {
    if (!topic) {
      toast({ 
        title: "Error",
        description: "Topic cannot be empty", 
        variant: "destructive" 
      });
      return;
    }

    // Use the correct QoS type by parsing the string as a number and casting it to type QoS
    publish(topic, message, { qos: parseInt(qos) as 0 | 1 | 2, retain });
    
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
            <Label htmlFor="publishTopic">Topic</Label>
            <Input
              id="publishTopic"
              placeholder="Enter topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={!connected}
              list="topic-suggestions"
            />
            <datalist id="topic-suggestions">
              {topicSuggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publishMessage">Message</Label>
            <Textarea
              id="publishMessage"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!connected}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="space-y-2">
              <Label htmlFor="qos">QoS</Label>
              <Select
                value={qos}
                onValueChange={setQos}
                disabled={!connected}
              >
                <SelectTrigger id="qos" className="w-full">
                  <SelectValue placeholder="Select QoS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - At most once</SelectItem>
                  <SelectItem value="1">1 - At least once</SelectItem>
                  <SelectItem value="2">2 - Exactly once</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="retain" className="block">Retain</Label>
              <div className="flex items-center h-10">
                <Switch
                  id="retain"
                  checked={retain}
                  onCheckedChange={setRetain}
                  disabled={!connected}
                />
              </div>
            </div>
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
