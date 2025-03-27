
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Clock, CheckCircle, AlertTriangle, BarChart3, Clock8, BarChart } from "lucide-react";
import { 
  PieChart, Pie, Cell, 
  BarChart as RechartBarChart, 
  Bar, 
  XAxis, YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface StatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    escalated: number;
    avgResponseTime: string;
    avgResolutionTime: string;
  };
}

// Updated consistent color scheme to match the website theme
const COLORS = {
  pending: '#98489c',    // Primary Purple
  inProgress: '#b15db4', // Lighter Purple
  completed: '#7a3b7d',  // Darker Purple
  escalated: '#d17ad4',  // Light Purple
};

// Custom formatter for labels to prevent overlapping
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  // Only show labels for segments with more than 10% of the total
  if (percent < 0.1) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fill="#888888"
      fontSize={12}
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function Stats({ stats }: StatsProps) {
  const pieData = [
    { name: 'Pending', value: stats.pending, color: COLORS.pending },
    { name: 'In Progress', value: stats.inProgress, color: COLORS.inProgress },
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Escalated', value: stats.escalated, color: COLORS.escalated },
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Pending', value: stats.pending, color: COLORS.pending },
    { name: 'In Progress', value: stats.inProgress, color: COLORS.inProgress },
    { name: 'Completed', value: stats.completed, color: COLORS.completed },
    { name: 'Escalated', value: stats.escalated, color: COLORS.escalated },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All WiFi assistance requests
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4" style={{ color: COLORS.pending }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assistance
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4" style={{ color: COLORS.completed }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertTriangle className="h-4 w-4" style={{ color: COLORS.escalated }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalated}</div>
            <p className="text-xs text-muted-foreground">
              Requires additional attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value, entry, index) => {
                      const item = pieData.find(d => d.name === value);
                      return <span style={{ color: item?.color }}>{value}</span>;
                    }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value} requests`, name]} 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle>Request by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartBarChart
                  data={barData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6B7280' }}
                    tickLine={{ stroke: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6B7280' }}
                    tickLine={{ stroke: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [`${value} requests`, "Number of Requests"]}
                    labelFormatter={(label) => label}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10 }}
                    payload={[
                      {
                        value: 'Number of Requests',
                        type: 'square',
                        color: '#98489c',
                      }
                    ]}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Number of Requests"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </RechartBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock8 className="h-4 w-4" style={{ color: '#98489c' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average time to first response
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
            <BarChart className="h-4 w-4" style={{ color: '#98489c' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Average time to complete a request
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
