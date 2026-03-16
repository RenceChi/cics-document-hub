import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dummy data matching the curve of your wireframe
const data = [
  { name: 'MON', logins: 12 },
  { name: 'TUE', logins: 25 },
  { name: 'WED', logins: 18 },
  { name: 'THU', logins: 32 },
  { name: 'FRI', logins: 45 },
  { name: 'SAT', logins: 28 },
  { name: 'SUN', logins: 15 },
];

export default function StudentLoginsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Increased bottom margin from 5 to 25 so the days of the week aren't cut off */}
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} 
          dy={15}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          dx={-10}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
          itemStyle={{ color: '#003366', fontWeight: 'bold' }}
        />
        <Line 
          type="monotone" 
          dataKey="logins" 
          stroke="#003366" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#003366' }}
          activeDot={{ r: 6, strokeWidth: 0, fill: '#003366' }}
          // CRITICAL FIX: This stops React 18 Strict Mode from breaking the line rendering
          isAnimationActive={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}