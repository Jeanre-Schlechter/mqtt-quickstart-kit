import mqtt, { MqttClient, IClientOptions, IClientSubscribeOptions } from 'mqtt';
import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

export interface Message {
  topic: string;
  payload: string;
  timestamp: number;
  retained?: boolean;
}

interface MQTTState {
  client: MqttClient | null;
  connected: boolean;
  messages: Message[];
  subscriptions: string[];
  connectionOptions: IClientOptions;
  brokerUrl: string;
  connect: (url?: string, options?: IClientOptions) => void;
  disconnect: () => void;
  publish: (topic: string, message: string, options?: mqtt.IClientPublishOptions) => void;
  subscribe: (topic: string, options?: IClientSubscribeOptions) => void;
  unsubscribe: (topic: string) => void;
  clearMessages: () => void;
  setConnectionOptions: (options: IClientOptions) => void;
  setBrokerUrl: (url: string) => void;
}

export const useMQTTStore = create<MQTTState>((set, get) => ({
  client: null,
  connected: false,
  messages: [],
  subscriptions: [],
  connectionOptions: {
    clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
  },
  brokerUrl: 'wss://broker.emqx.io:8084',
  
  connect: (url?: string, options?: IClientOptions) => {
    const state = get();
    if (state.client) {
      state.client.end();
    }

    const brokerUrl = url || state.brokerUrl;
    const connectionOptions = options || state.connectionOptions;
    
    try {
      console.log(`Connecting to ${brokerUrl}...`);
      
      // Security check
      const isHttps = window.location.protocol === 'https:';
      const isInsecureBroker = brokerUrl.startsWith('ws://') || brokerUrl.startsWith('mqtt://');
      
      if (isHttps && isInsecureBroker) {
        const errorMsg = 'Security Error: Cannot connect to insecure WebSocket (ws:// or mqtt://) from an HTTPS page. Please use secure protocols (wss:// or mqtts://).';
        console.error(errorMsg);
        toast({
          title: "Connection Failed",
          description: errorMsg,
          variant: "destructive"
        });
        return;
      }
      
      const client = mqtt.connect(brokerUrl, connectionOptions);
      
      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        set({ connected: true });
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${brokerUrl}`,
        });
        
        // Resubscribe to previous topics
        state.subscriptions.forEach(topic => {
          client.subscribe(topic);
        });
      });
      
      client.on('message', (topic, payload, packet) => {
        const message: Message = {
          topic,
          payload: payload.toString(),
          timestamp: Date.now(),
          retained: packet.retain,
        };
        
        set(state => ({
          messages: [message, ...state.messages.slice(0, 999)]
        }));
      });
      
      client.on('error', (err) => {
        const errorMsg = `MQTT Error: ${err.message}`;
        console.error(errorMsg, err);
        
        toast({
          title: "Connection Error",
          description: errorMsg,
          variant: "destructive"
        });
      });
      
      client.on('close', () => {
        console.log('Connection to MQTT broker closed');
        set({ connected: false });
      });
      
      client.on('offline', () => {
        console.log('MQTT client is offline');
        set({ connected: false });
      });
      
      set({ client });
    } catch (error) {
      const errorMsg = error instanceof Error ? 
        `Failed to connect to MQTT broker: ${error.message}` : 
        'Failed to connect to MQTT broker';
      
      console.error(errorMsg, error);
      
      toast({
        title: "Connection Failed",
        description: errorMsg,
        variant: "destructive"
      });
    }
  },
  
  disconnect: () => {
    const { client } = get();
    if (client) {
      client.end();
      set({ client: null, connected: false });
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from MQTT broker",
      });
    }
  },
  
  publish: (topic, message, options) => {
    const { client } = get();
    if (client && client.connected) {
      client.publish(topic, message, options);
    } else {
      console.error('Cannot publish: MQTT client not connected');
      toast({
        title: "Publish Failed",
        description: "Cannot publish: MQTT client not connected",
        variant: "destructive"
      });
    }
  },
  
  subscribe: (topic, options) => {
    const { client, subscriptions } = get();
    if (client && client.connected) {
      client.subscribe(topic, options);
      if (!subscriptions.includes(topic)) {
        set({ subscriptions: [...subscriptions, topic] });
      }
    } else {
      console.error('Cannot subscribe: MQTT client not connected');
      toast({
        title: "Subscribe Failed",
        description: "Cannot subscribe: MQTT client not connected",
        variant: "destructive"
      });
    }
  },
  
  unsubscribe: (topic) => {
    const { client, subscriptions } = get();
    if (client) {
      client.unsubscribe(topic);
      set({
        subscriptions: subscriptions.filter(t => t !== topic)
      });
    }
  },
  
  clearMessages: () => set({ messages: [] }),
  
  setConnectionOptions: (options) => set({ connectionOptions: options }),
  
  setBrokerUrl: (url) => set({ brokerUrl: url }),
}));

export default useMQTTStore;
