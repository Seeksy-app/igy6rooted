import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { AdAccountData } from "@/hooks/useAdMetrics";

interface PerformanceChartProps {
  googleData: AdAccountData | null;
  metaData: AdAccountData | null;
}

export function PerformanceChart({ googleData, metaData }: PerformanceChartProps) {
  const barData = [
    {
      name: "Impressions",
      "Google Ads": googleData?.metrics?.impressions || 0,
      "Meta Ads": metaData?.metrics?.impressions || 0,
    },
    {
      name: "Clicks",
      "Google Ads": googleData?.metrics?.clicks || 0,
      "Meta Ads": metaData?.metrics?.clicks || 0,
    },
    {
      name: "Conversions",
      "Google Ads": googleData?.metrics?.conversions || 0,
      "Meta Ads": metaData?.metrics?.conversions || 0,
    },
  ];

  const googleSpend = googleData?.metrics?.cost || googleData?.metrics?.spend || 0;
  const metaSpend = metaData?.metrics?.spend || 0;
  const totalSpend = googleSpend + metaSpend;

  const pieData = [
    { name: "Google Ads", value: googleSpend, color: "hsl(217, 91%, 60%)" },
    { name: "Meta Ads", value: metaSpend, color: "hsl(262, 83%, 58%)" },
  ].filter((d) => d.value > 0);

  const hasData = totalSpend > 0 || barData.some((d) => d["Google Ads"] > 0 || d["Meta Ads"] > 0);

  if (!hasData) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Performance Overview</CardTitle>
          <CardDescription>Comparative metrics visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Connect ad accounts to see performance charts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="section-header">Performance Overview</CardTitle>
        <CardDescription>Comparative metrics visualization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Bar Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Channel Comparison</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                      return value;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Bar dataKey="Google Ads" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Meta Ads" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div>
            <h4 className="text-sm font-medium mb-4">Spend Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-sm text-muted-foreground">Total Ad Spend</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
