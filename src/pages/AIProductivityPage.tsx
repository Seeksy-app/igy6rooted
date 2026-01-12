import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";

export default function AIProductivityPage() {
  const { currentOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [toolCallCount, setToolCallCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    if (currentOrg) {
      fetchMetrics();
    }
  }, [currentOrg]);

  const fetchMetrics = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      // Fetch tool call count
      const { count: toolCount } = await supabase
        .from("ai_tool_call_logs")
        .select("*", { count: "exact", head: true })
        .eq("org_id", currentOrg.id);

      // Fetch booking count
      const { count: bookCount } = await supabase
        .from("ai_bookings")
        .select("*", { count: "exact", head: true })
        .eq("org_id", currentOrg.id);

      setToolCallCount(toolCount || 0);
      setBookingCount(bookCount || 0);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data - will be enhanced with real calculations
  const metrics = {
    totalLeadsHandled: 245,
    callsDeflected: 156,
    appointmentsAssisted: bookingCount,
    humanHandoffs: 28,
    avgHandleTime: "2:34",
    successRate: 73,
    timeSavedHours: 48,
    costSavings: 2400,
    toolCalls: toolCallCount,
  };

  const weeklyTrend = [
    { day: "Mon", leads: 32, bookings: 8 },
    { day: "Tue", leads: 45, bookings: 12 },
    { day: "Wed", leads: 38, bookings: 9 },
    { day: "Thu", leads: 52, bookings: 15 },
    { day: "Fri", leads: 41, bookings: 11 },
    { day: "Sat", leads: 22, bookings: 5 },
    { day: "Sun", leads: 15, bookings: 3 },
  ];

  const aiCapabilities = [
    { name: "Lead Qualification", usage: 89, trend: "up" },
    { name: "FAQ Resolution", usage: 156, trend: "up" },
    { name: "Booking Assistance", usage: bookingCount, trend: "up" },
    { name: "Human Escalation", usage: 28, trend: "down" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/15">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Productivity</h1>
          </div>
          <p className="text-muted-foreground">
            ROI dashboard • Leads handled • Calls deflected • Value generated
          </p>
        </div>
        <Button onClick={fetchMetrics} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Key ROI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/15">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-3xl font-bold text-success">{metrics.timeSavedHours}h</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/15">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost Savings</p>
                <p className="text-3xl font-bold text-success">${metrics.costSavings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/15">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Success Rate</p>
                <p className="text-3xl font-bold">{metrics.successRate}%</p>
                <p className="text-xs text-muted-foreground">Resolved without human</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/15">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Human Handoffs</p>
                <p className="text-3xl font-bold">{metrics.humanHandoffs}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-success" />
                  <span className="text-success">12% fewer</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads Handled"
          value={metrics.totalLeadsHandled}
          subtitle="By AI"
          icon={Users}
          trend={{ value: 18, label: "vs last month" }}
        />
        <StatCard
          title="Calls Deflected"
          value={metrics.callsDeflected}
          subtitle="Self-service resolved"
          icon={Phone}
        />
        <StatCard
          title="Appointments Assisted"
          value={metrics.appointmentsAssisted}
          subtitle="via Jobber API"
          icon={Calendar}
          variant="success"
        />
        <StatCard
          title="Tool Calls Made"
          value={metrics.toolCalls}
          subtitle="API integrations"
          icon={MessageSquare}
        />
      </div>

      {/* AI Capability Usage */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">AI Capability Usage</CardTitle>
          <CardDescription>How AI features are being utilized</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aiCapabilities.map((capability) => (
              <div key={capability.name} className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{capability.name}</p>
                  {capability.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-warning" />
                  )}
                </div>
                <p className="text-2xl font-bold">{capability.usage}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Weekly AI Activity</CardTitle>
          <CardDescription>Leads handled and bookings assisted by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 h-48">
            {weeklyTrend.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col gap-1">
                  <div 
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${(day.leads / 60) * 120}px` }}
                  />
                  <div 
                    className="w-full bg-success rounded-b"
                    style={{ height: `${(day.bookings / 60) * 120}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span className="text-sm text-muted-foreground">Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-success" />
              <span className="text-sm text-muted-foreground">Bookings</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Summary */}
      <Card className="stat-card border-success/30 bg-success/5">
        <CardHeader>
          <CardTitle className="section-header flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            ROI Summary
          </CardTitle>
          <CardDescription>Value generated by AI automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Staff Hours Saved</p>
              <p className="text-3xl font-bold">{metrics.timeSavedHours} hours</p>
              <p className="text-sm text-muted-foreground">@ $50/hr = ${metrics.timeSavedHours * 50}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Calls Handled by AI</p>
              <p className="text-3xl font-bold">{metrics.callsDeflected} calls</p>
              <p className="text-sm text-muted-foreground">@ $15/call = ${metrics.callsDeflected * 15}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Value Generated</p>
              <p className="text-3xl font-bold text-success">${(metrics.timeSavedHours * 50 + metrics.callsDeflected * 15).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
