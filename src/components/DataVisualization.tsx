
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Thermometer, Droplets, Gauge } from 'lucide-react';
import useMQTTStore from '@/services/mqtt-service';

interface SensorData {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface TimeSeriesPoint {
  time: string;
  value: number;
}

const DataVisualization = () => {
  const { messages } = useMQTTStore();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [latestValue, setLatestValue] = useState<SensorData | null>(null);
  
  // Extract unique topics that contain numeric data
  const findDataTopics = () => {
    const topicsWithData = new Set<string>();
    
    messages.forEach(msg => {
      try {
        const data = JSON.parse(msg.payload);
        if (data && typeof data === 'object' && 'value' in data && typeof data.value === 'number') {
          topicsWithData.add(msg.topic);
        }
      } catch (e) {
        // Not JSON or not in the expected format
        const asNumber = Number(msg.payload.trim());
        if (!isNaN(asNumber)) {
          topicsWithData.add(msg.topic);
        }
      }
    });
    
    return Array.from(topicsWithData);
  };
  
  const dataTopics = findDataTopics();
  
  useEffect(() => {
    if (!selectedTopic && dataTopics.length > 0) {
      setSelectedTopic(dataTopics[0]);
    }
  }, [dataTopics, selectedTopic]);
  
  useEffect(() => {
    if (!selectedTopic) return;
    
    const relevantMessages = messages
      .filter(msg => msg.topic === selectedTopic)
      .slice(0, 50); // Limit to last 50 messages
    
    const newTimeSeriesData: TimeSeriesPoint[] = [];
    let newLatestValue: SensorData | null = null;
    
    for (const msg of relevantMessages) {
      try {
        const data = JSON.parse(msg.payload);
        if (data && typeof data === 'object' && 'value' in data && typeof data.value === 'number') {
          const time = new Date(msg.timestamp).toLocaleTimeString();
          newTimeSeriesData.unshift({
            time,
            value: data.value
          });
          
          if (!newLatestValue) {
            newLatestValue = {
              name: selectedTopic.split('/').pop() || selectedTopic,
              value: data.value,
              unit: data.unit || '',
              timestamp: msg.timestamp
            };
          }
        }
      } catch (e) {
        // Try to parse as direct number
        const asNumber = Number(msg.payload.trim());
        if (!isNaN(asNumber)) {
          const time = new Date(msg.timestamp).toLocaleTimeString();
          newTimeSeriesData.unshift({
            time,
            value: asNumber
          });
          
          if (!newLatestValue) {
            newLatestValue = {
              name: selectedTopic.split('/').pop() || selectedTopic,
              value: asNumber,
              unit: '',
              timestamp: msg.timestamp
            };
          }
        }
      }
    }
    
    setTimeSeriesData(newTimeSeriesData);
    if (newLatestValue) {
      setLatestValue(newLatestValue);
    }
  }, [messages, selectedTopic]);
  
  const renderIcon = () => {
    if (!selectedTopic) return <Activity className="h-6 w-6" />;
    
    if (selectedTopic.includes('temp')) {
      return <Thermometer className="h-6 w-6 text-orange-500" />;
    } else if (selectedTopic.includes('humid')) {
      return <Droplets className="h-6 w-6 text-blue-500" />;
    } else if (selectedTopic.includes('pressure')) {
      return <Gauge className="h-6 w-6 text-purple-500" />;
    }
    
    return <Activity className="h-6 w-6 text-green-500" />;
  };
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Data Visualization</CardTitle>
          <Select
            value={selectedTopic || ''}
            onValueChange={setSelectedTopic}
            disabled={dataTopics.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              {dataTopics.map(topic => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {dataTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
            <Activity className="h-12 w-12 mb-2 opacity-20" />
            <p>No data available for visualization</p>
            <p className="text-sm mt-2">Publish JSON messages with a 'value' field to see data here</p>
          </div>
        ) : (
          <>
            {latestValue && (
              <div className="flex items-center justify-center mb-4 gap-3">
                {renderIcon()}
                <div>
                  <h3 className="text-lg font-semibold capitalize">{latestValue.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{latestValue.value.toFixed(1)}</span>
                    {latestValue.unit && (
                      <Badge variant="outline" className="text-sm">{latestValue.unit}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="h-60 mt-4">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(time) => time.split(':').slice(0, 2).join(':')}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value) => [`${value}${latestValue?.unit || ''}`, 'Value']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No time series data available</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DataVisualization;
