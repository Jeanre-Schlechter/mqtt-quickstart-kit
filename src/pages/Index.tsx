
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import ConnectionPanel from '@/components/ConnectionPanel';
import PublishPanel from '@/components/PublishPanel';
import SubscriptionPanel from '@/components/SubscriptionPanel';
import MessageLog from '@/components/MessageLog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Welcome toast on first load
    toast({
      title: "MQTT Dashboard",
      description: "Connect to your broker to start publishing and subscribing to topics",
    });
  }, [toast]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">MQTT Dashboard</h1>
            <p className="text-muted-foreground">
              Connected to mqtt://5.tcp.eu.ngrok.io:19048 with topic demo/topic
            </p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConnectionPanel />
            <PublishPanel />
            <SubscriptionPanel />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <MessageLog />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
