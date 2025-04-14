
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import ConnectionPanel from '@/components/ConnectionPanel';
import PublishPanel from '@/components/PublishPanel';
import SubscriptionPanel from '@/components/SubscriptionPanel';
import MessageLog from '@/components/MessageLog';
import DataVisualization from '@/components/DataVisualization';
import DockerHelper from '@/components/DockerHelper';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Welcome toast on first load
    toast({
      title: "Welcome to MQTT Dashboard",
      description: "Connect to a broker to start publishing and subscribing to MQTT messages",
    });
  }, [toast]);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold tracking-tight">MQTT Dashboard</h1>
            <p className="text-muted-foreground">
              A complete MQTT client for monitoring and controlling IoT devices
            </p>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectionPanel />
            <DockerHelper />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PublishPanel />
            <SubscriptionPanel />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-full">
              <DataVisualization />
            </div>
            <div className="h-full">
              <MessageLog />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
