
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

const COLORS = ['#6f2c6e', '#8e4a8d', '#9b62a9', '#a87dc5', '#edd6f3'];

export function Stats({ stats }: StatsProps) {
  const pieData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
    { name: 'Escalated', value: stats.escalated },
  ];

  const barData = [
    { name: 'Pending', value: stats.pending },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
    { name: 'Escalated', value: stats.escalated },
  ];

  const chartConfig = {
    pending: { color: "#FFC107" },
    inProgress: { color: "#3498DB" },
    completed: { color: "#2ECC71" },
    escalated: { color: "#E74C3C" },
  };

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
            <Clock className="h-4 w-4 text-yellow-500" />
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
            <CheckCircle className="h-4 w-4 text-green-500" />
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
            <AlertTriangle className="h-4 w-4 text-red-500" />
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
            <CardTitle>Request Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer 
              config={chartConfig} 
              className="aspect-[4/3] w-full p-4"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="card-hover overflow-hidden">
          <CardHeader>
            <CardTitle>Requests by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ChartContainer 
              config={chartConfig} 
              className="aspect-[4/3] w-full p-4"
            >
              <RechartBarChart
                data={barData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 10,
                  bottom: 10,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Requests" fill="#6f2c6e" radius={[4, 4, 0, 0]} />
              </RechartBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock8 className="h-4 w-4 text-blue-500" />
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
            <BarChart className="h-4 w-4 text-purple-500" />
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
