
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { DialogueTurn } from '../../types';

interface TemperatureChartProps {
  data: DialogueTurn[];
  onPointClick?: (sequence: number) => void;
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ data, onPointClick }) => {
  const chartData = data.map(turn => ({
    name: `T${turn.sequence}`,
    score: turn.temperature_score,
    label: turn.temperature_label,
    topic: turn.key_topic,
    sequence: turn.sequence // Pass sequence for click handling
  }));

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onClick={(e) => {
            // Recharts click event usually provides activePayload when clicking the chart area near a point
            if (e && e.activePayload && e.activePayload.length > 0 && onPointClick) {
              const payload = e.activePayload[0].payload;
              onPointClick(payload.sequence);
            }
          }}
          className="cursor-pointer"
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip 
            cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm z-50">
                    <p className="font-bold text-gray-900">{data.topic}</p>
                    <p className={`font-medium ${data.score < 40 ? 'text-blue-500' : data.score > 70 ? 'text-red-500' : 'text-gray-600'}`}>
                      Temp: {data.score} ({data.label})
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Click to play audio</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Cold', fill:'#EF4444', fontSize: 10 }} />
          <ReferenceLine y={70} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'right', value: 'Hot', fill:'#10B981', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            // Make dots larger and easier to click
            activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff', fill: '#2563EB', cursor: 'pointer' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
