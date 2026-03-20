import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function StudentLoginsChart() {
  // 1. Set up state with our blank baseline structure (Starts Mon, Ends Sun)
  const [data, setData] = useState([
    { name: 'MON', logins: 0 },
    { name: 'TUE', logins: 0 },
    { name: 'WED', logins: 0 },
    { name: 'THU', logins: 0 },
    { name: 'FRI', logins: 0 },
    { name: 'SAT', logins: 0 },
    { name: 'SUN', logins: 0 },
  ]);

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        // Create a temporary object to hold our counts based on JS Date.getDay()
        // getDay() returns 0 for Sunday, 1 for Monday, etc.
        const weeklyCounts = {
          0: { name: 'SUN', logins: 0 },
          1: { name: 'MON', logins: 0 },
          2: { name: 'TUE', logins: 0 },
          3: { name: 'WED', logins: 0 },
          4: { name: 'THU', logins: 0 },
          5: { name: 'FRI', logins: 0 },
          6: { name: 'SAT', logins: 0 },
        };

        // Get the cutoff date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Fetch all LOGIN actions from Firestore
        const q = query(collection(db, "activity_logs"), where("actionType", "==", "LOGIN"));
        const snapshot = await getDocs(q);

        // Loop through the logs and tally them up
        snapshot.forEach(doc => {
          const log = doc.data();
          if (log.timestamp) {
            const logDate = log.timestamp.toDate();
            
            // Only count it if the login happened within the last 7 days
            if (logDate >= sevenDaysAgo) {
              const dayOfWeek = logDate.getDay(); 
              weeklyCounts[dayOfWeek].logins += 1;
            }
          }
        });

        // Reorder the final array so Monday is first and Sunday is last (matching your wireframe)
        const orderedData = [
          weeklyCounts[1], // MON
          weeklyCounts[2], // TUE
          weeklyCounts[3], // WED
          weeklyCounts[4], // THU
          weeklyCounts[5], // FRI
          weeklyCounts[6], // SAT
          weeklyCounts[0], // SUN
        ];

        setData(orderedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchLoginData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
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
          allowDecimals={false} // Prevents Y-axis from showing weird decimals like 1.5 logins
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
          isAnimationActive={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}