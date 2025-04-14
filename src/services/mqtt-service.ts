
import mqtt, { MqttClient, IClientOptions, IClientSubscribeOptions } from 'mqtt';
import { create } from 'zustand';

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
  brokerUrl: 'ws://localhost:9001',
  
  connect: (url?: string, options?: IClientOptions) => {
    const state = get();
    if (state.client) {
      state.client.end();
    }

    const brokerUrl = url || state.brokerUrl;
    const connectionOptions = options || state.connectionOptions;
    
    try {
      console.log(`Connecting to ${brokerUrl}...`);
      const client = mqtt.connect(brokerUrl, connectionOptions);
      
      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        set({ connected: true });
        
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
        console.error('MQTT Error:', err);
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
      console.error('Failed to connect to MQTT broker:', error);
    }
  },
  
  disconnect: () => {
    const { client } = get();
    if (client) {
      client.end();
      set({ client: null, connected: false });
    }
  },
  
  publish: (topic, message, options) => {
    const { client } = get();
    if (client && client.connected) {
      client.publish(topic, message, options);
    } else {
      console.error('Cannot publish: MQTT client not connected');
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
