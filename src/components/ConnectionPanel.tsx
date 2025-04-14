import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Cable } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';

const ConnectionPanel = () => {
  const { 
    connect, 
    disconnect, 
    connected, 
    connectionOptions,
    setConnectionOptions 
  } = useMQTTStore();
  
  const [clientId, setClientId] = useState(connectionOptions.clientId || '');
  const [clean, setClean] = useState(connectionOptions.clean !== false);
  const [autoConnect, setAutoConnect] = useState(false);
  
  React.useEffect(() => {
    // Generate a random client ID if not set
    if (!clientId) {
      setClientId(`mqtt-dashboard-${Math.random().toString(16).substr(2, 8)}`);
    }
    
    // Auto-connect if enabled
    if (autoConnect) {
      handleConnect();
    }
  }, [clientId, autoConnect]);

  const handleConnect = () => {
    const options = {
      ...connectionOptions,
      clientId,
      clean,
      port: 19048, // Updated port
    };
    
    setConnectionOptions(options);
    connect('mqtt://5.tcp.eu.ngrok.io', options);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">MQTT Connection</CardTitle>
        <Badge 
          variant={connected ? "default" : "destructive"}
          className="px-3 py-1 flex items-center gap-1"
        >
          {connected ? 
            <><Check size={14} /> Connected</> : 
            <><AlertCircle size={14} /> Disconnected</>}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">
              Broker: <strong>mqtt://5.tcp.eu.ngrok.io:19048</strong>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              placeholder="mqtt-client-123"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={connected}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="clean"
              checked={clean}
              onCheckedChange={setClean}
              disabled={connected}
            />
            <Label htmlFor="clean">Clean Session</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoConnect"
              checked={autoConnect}
              onCheckedChange={setAutoConnect}
              disabled={connected}
            />
            <Label htmlFor="autoConnect">Auto Connect</Label>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            {connected ? (
              <Button variant="destructive" onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect} className="flex items-center gap-1">
                <Cable size={16} />
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;
