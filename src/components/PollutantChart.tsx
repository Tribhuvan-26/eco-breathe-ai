import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PollutantChartProps {
  data: {
    pm25: number;
    pm10: number;
    no2: number;
    co: number;
    o3: number;
    so2: number;
  };
}

const PollutantChart = ({ data }: PollutantChartProps) => {
  const chartData = [
    { name: 'PM2.5', value: data.pm25, color: 'hsl(var(--primary))' },
    { name: 'PM10', value: data.pm10, color: 'hsl(var(--accent))' },
    { name: 'NO₂', value: data.no2, color: 'hsl(var(--aqi-moderate))' },
    { name: 'CO', value: data.co / 100, color: 'hsl(var(--aqi-unhealthy))' }, // Scale down CO
    { name: 'O₃', value: data.o3, color: 'hsl(var(--aqi-unhealthy-sensitive))' },
    { name: 'SO₂', value: data.so2, color: 'hsl(var(--aqi-good))' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PollutantChart;