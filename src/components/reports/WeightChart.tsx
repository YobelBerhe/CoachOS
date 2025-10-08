import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeightChartProps {
  data: { date: string; weight: number }[];
  goalWeight: number;
}

export const WeightChart = ({ data, goalWeight }: WeightChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis className="text-xs" />
            <Tooltip 
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Weight']}
            />
            <ReferenceLine 
              y={goalWeight} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="5 5"
              label={{ value: 'Goal', position: 'right', fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
