
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, Cable, Server } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';

const ConnectionPanel = () => {
  const { 
    connect, 
    disconnect, 
    connected, 
    brokerUrl, 
    setBrokerUrl, 
    connectionOptions, 
    setConnectionOptions 
  } = useMQTTStore();
  
  // Use string type explicitly for password to avoid the Buffer type
  const [username, setUsername] = useState(connectionOptions.username || '');
  const [password, setPassword] = useState(connectionOptions.password ? connectionOptions.password.toString() : '');
  const [clientId, setClientId] = useState(connectionOptions.clientId || '');
  const [clean, setClean] = useState(connectionOptions.clean !== false);
  const [brokerAddress, setBrokerAddress] = useState(brokerUrl);
  
  useEffect(() => {
    // Generate a random client ID if not set
    if (!clientId) {
      setClientId(`mqtt-dashboard-${Math.random().toString(16).substr(2, 8)}`);
    }
  }, [clientId]);

  const handleConnect = () => {
    const options = {
      ...connectionOptions,
      clientId,
      username: username || undefined,
      // Convert password to string to fix the type error
      password: password || undefined,
      clean,
    };
    
    setConnectionOptions(options);
    setBrokerUrl(brokerAddress);
    connect(brokerAddress, options);
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
        <Tabs defaultValue="broker">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="broker" className="flex items-center gap-1">
              <Server size={14} />
              Broker
            </TabsTrigger>
            <TabsTrigger value="options" className="flex items-center gap-1">
              <Cable size={14} />
              Connection Options
            </TabsTrigger>
          </TabsList>
          <TabsContent value="broker" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="broker">Broker Address</Label>
              <Input
                id="broker"
                placeholder="ws://localhost:9001"
                value={brokerAddress}
                onChange={(e) => setBrokerAddress(e.target.value)}
                disabled={connected}
              />
              <p className="text-xs text-muted-foreground">
                Use ws:// for WebSocket or mqtt:// for TCP connections
              </p>
            </div>
          </TabsContent>
          <TabsContent value="options" className="space-y-4 mt-4">
            <div className="grid gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="username">Username (optional)</Label>
                <Input
                  id="username"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={connected}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end space-x-2 mt-4">
          {connected ? (
            <Button variant="destructive" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button onClick={handleConnect}>
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;
