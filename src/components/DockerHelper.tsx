
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronsUpDown, Copy, Server, Terminal, FileCode } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DockerHelper = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard",
    });
  };
  
  const dockerComposeYaml = `version: '3'
services:
  mosquitto:
    image: eclipse-mosquitto:latest
    container_name: mosquitto
    ports:
      - "1883:1883"  # MQTT port
      - "19048:19048"  # Websocket port
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    restart: unless-stopped`;
  
  const mosquittoConfig = `# /mosquitto/config/mosquitto.conf
listener 1883
listener 19048
protocol websockets
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log`;
  
  const pythonPublisherCode = `# Install dependency with: pip install paho-mqtt
import paho.mqtt.client as mqtt
import json
import time
import random

# MQTT client setup
client = mqtt.Client()
client.connect("localhost", 1883, 60)

try:
    while True:
        # Generate random sensor values
        temperature = round(20 + random.uniform(-5, 5), 1)
        humidity = round(50 + random.uniform(-10, 10), 1)
        
        # Publish temperature
        payload = json.dumps({"value": temperature, "unit": "C"})
        client.publish("sensors/temperature", payload)
        print(f"Published: sensors/temperature - {payload}")
        
        # Publish humidity
        payload = json.dumps({"value": humidity, "unit": "%"})
        client.publish("sensors/humidity", payload)
        print(f"Published: sensors/humidity - {payload}")
        
        # Wait before next iteration
        time.sleep(2)
except KeyboardInterrupt:
    print("Stopping publisher...")
    client.disconnect()`;
  
  const pythonSubscriberCode = `# Install dependency with: pip install paho-mqtt
import paho.mqtt.client as mqtt

# Callback when connected
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe("#")  # Subscribe to all topics

# Callback when a message is received
def on_message(client, userdata, msg):
    print(f"Topic: {msg.topic}, Message: {msg.payload.decode()}")

# Set up client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to broker
client.connect("localhost", 1883, 60)

# Start the loop
try:
    client.loop_forever()
except KeyboardInterrupt:
    print("Stopping subscriber...")
    client.disconnect()`;
  
  const phpPublisherCode = `<?php
// Install dependency with: composer require php-mqtt/client
require 'vendor/autoload.php';

use PhpMqtt\\Client\\MqttClient;
use PhpMqtt\\Client\\ConnectionSettings;

$server   = 'localhost';
$port     = 1883;
$clientId = 'php-mqtt-publisher';

$connectionSettings = (new ConnectionSettings)
    ->setKeepAliveInterval(60)
    ->setLastWillQualityOfService(1);

$mqtt = new MqttClient($server, $port, $clientId);
$mqtt->connect($connectionSettings);

// Publish temperature
$temperature = round(20 + (mt_rand(-50, 50) / 10), 1);
$payload = json_encode(['value' => $temperature, 'unit' => 'C']);
$mqtt->publish('sensors/temperature', $payload, 0, false);
echo "Published: sensors/temperature - $payload\\n";

// Publish humidity
$humidity = round(50 + (mt_rand(-100, 100) / 10), 1);
$payload = json_encode(['value' => $humidity, 'unit' => '%']);
$mqtt->publish('sensors/humidity', $payload, 0, false);
echo "Published: sensors/humidity - $payload\\n";

$mqtt->disconnect();
?>`;
  
  const phpSubscriberCode = `<?php
// Install dependency with: composer require php-mqtt/client
require 'vendor/autoload.php';

use PhpMqtt\\Client\\MqttClient;
use PhpMqtt\\Client\\ConnectionSettings;

$server   = 'localhost';
$port     = 1883;
$clientId = 'php-mqtt-subscriber';

$connectionSettings = (new ConnectionSettings)
    ->setKeepAliveInterval(60)
    ->setLastWillQualityOfService(1);

$mqtt = new MqttClient($server, $port, $clientId);
$mqtt->connect($connectionSettings);

echo "Subscribed to all topics (#)\\n";
$mqtt->subscribe('#', function ($topic, $message) {
    echo "Received message on topic [$topic]: $message\\n";
}, 0);

$mqtt->loop(true);
$mqtt->disconnect();
?>`;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Docker Setup Guide</CardTitle>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <Tabs defaultValue="docker">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="docker" className="flex items-center gap-1">
                      <Server size={14} />
                      Docker
                    </TabsTrigger>
                    <TabsTrigger value="python" className="flex items-center gap-1">
                      <Terminal size={14} />
                      Python
                    </TabsTrigger>
                    <TabsTrigger value="php" className="flex items-center gap-1">
                      <FileCode size={14} />
                      PHP
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="docker" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Setup Mosquitto MQTT Broker with Docker</h3>
                      <p className="text-sm text-muted-foreground">
                        Follow these steps to run the Mosquitto MQTT broker using Docker:
                      </p>
                      
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(dockerComposeYaml)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {dockerComposeYaml}
                        </pre>
                      </div>
                      
                      <p className="text-sm mt-2">Create a Mosquitto configuration file:</p>
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(mosquittoConfig)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {mosquittoConfig}
                        </pre>
                      </div>
                      
                      <p className="text-sm mt-2">Then run with:</p>
                      <div className="bg-muted rounded-md p-3 relative">
                        <pre className="text-xs">docker-compose up -d</pre>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="python" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Python MQTT Examples</h3>
                      <p className="text-sm text-muted-foreground">
                        Use Python to interact with the MQTT broker:
                      </p>
                      
                      <h4 className="font-medium text-sm mt-3">Publisher Script</h4>
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(pythonPublisherCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {pythonPublisherCode}
                        </pre>
                      </div>
                      
                      <h4 className="font-medium text-sm mt-3">Subscriber Script</h4>
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(pythonSubscriberCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {pythonSubscriberCode}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="php" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">PHP MQTT Examples</h3>
                      <p className="text-sm text-muted-foreground">
                        Use PHP to interact with the MQTT broker:
                      </p>
                      
                      <h4 className="font-medium text-sm mt-3">Publisher Script</h4>
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(phpPublisherCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {phpPublisherCode}
                        </pre>
                      </div>
                      
                      <h4 className="font-medium text-sm mt-3">Subscriber Script</h4>
                      <div className="bg-muted rounded-md p-3 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => copyToClipboard(phpSubscriberCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {phpSubscriberCode}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardHeader>
    </Card>
  );
};

export default DockerHelper;
