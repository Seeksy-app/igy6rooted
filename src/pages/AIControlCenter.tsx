import { 
  Bot, 
  Phone, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";

export default function AIControlCenter() {
  const { currentOrg } = useOrg();

  // Mock data - will be replaced with real queries
  const aiMetrics = {
    callsHandled: 156,
    chatsHandled: 89,
    bookingsAssisted: 42,
    leadsQualified: 67,
    timeSavedHours: 23,
    conversionRate: 68,
    costSavings: 1250,
    avgResponseTime: 1.2,
  };

  const recentActivity = [
    { id: "1", type: "call", description: "Inbound call qualified → Booking assisted", outcome: "success", time: "2 min ago", source: "Voice AI" },
    { id: "2", type: "chat", description: "Lead qualified via web chat", outcome: "qualified", time: "8 min ago", source: "Chat AI" },
    { id: "3", type: "call", description: "Customer inquiry → FAQ resolved", outcome: "resolved", time: "15 min ago", source: "Voice AI" },
    { id: "4", type: "booking", description: "Appointment scheduled via Jobber API", outcome: "success", time: "23 min ago", source: "Booking Assistant" },
    { id: "5", type: "chat", description: "Complex inquiry → Escalated to human", outcome: "escalated", time: "45 min ago", source: "Chat AI" },
  ];

  const integrationStatus = [
    { name: "Jobber", status: "connected", label: "Synced" },
    { name: "ElevenLabs", status: "connected", label: "Active" },
    { name: "Google Analytics", status: "pending", label: "Setup Required" },
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "success":
        return <Badge className="bg-success/15 text-success border-success/30">Success</Badge>;
      case "qualified":
        return <Badge className="bg-primary/15 text-primary border-primary/30">Qualified</Badge>;
      case "resolved":
        return <Badge className="bg-success/15 text-success border-success/30">Resolved</Badge>;
      case "escalated":
        return <Badge className="bg-warning/15 text-warning border-warning/30">Escalated</Badge>;
      default:
        return <Badge variant="secondary">{outcome}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success/15 text-success border-success/30">Connected</Badge>;
      case "pending":
        return <Badge className="bg-warning/15 text-warning border-warning/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/15">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Control Center</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and manage your AI assistants for {currentOrg?.name || "your organization"}
        </p>
      </div>

      {/* Primary AI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Calls Handled by AI"
          value={aiMetrics.callsHandled}
          icon={Phone}
          trend={{ value: 18, label: "vs last week" }}
        />
        <StatCard
          title="Chats Handled"
          value={aiMetrics.chatsHandled}
          icon={MessageSquare}
          trend={{ value: 24, label: "vs last week" }}
        />
        <StatCard
          title="Bookings Assisted"
          value={aiMetrics.bookingsAssisted}
          subtitle="via Jobber API"
          icon={Calendar}
          variant="success"
        />
        <StatCard
          title="Leads Qualified"
          value={aiMetrics.leadsQualified}
          icon={Users}
          trend={{ value: 12, label: "vs last week" }}
        />
      </div>

      {/* ROI & Efficiency Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/15">
                <Clock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">{aiMetrics.timeSavedHours}h</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/15">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Conversion Rate</p>
                <p className="text-2xl font-bold">{aiMetrics.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Lead → Booking</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/15">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost Savings</p>
                <p className="text-2xl font-bold">${aiMetrics.costSavings}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/15">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{aiMetrics.avgResponseTime}s</p>
                <p className="text-xs text-muted-foreground">First response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent AI Activity */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="section-header">Recent AI Activity</CardTitle>
              <CardDescription>Live feed of AI-assisted interactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ai-productivity">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "call" ? "bg-primary/15" : 
                      activity.type === "chat" ? "bg-accent/15" : "bg-success/15"
                    }`}>
                      {activity.type === "call" ? (
                        <Phone className="h-4 w-4 text-primary" />
                      ) : activity.type === "chat" ? (
                        <MessageSquare className="h-4 w-4 text-accent" />
                      ) : (
                        <Calendar className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getOutcomeBadge(activity.outcome)}
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="section-header">Connected Services</CardTitle>
            <CardDescription>API & integration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrationStatus.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {integration.status === "connected" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm font-medium">{integration.name}</span>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/integrations">
                Manage Integrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Link to="/ai-calls" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/15 p-3 text-primary">
              <Phone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Voice AI Console</h3>
              <p className="text-sm text-muted-foreground">
                Configure & monitor AI voice agents
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link to="/ai-chat" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-accent/15 p-3 text-accent">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Chat AI Console</h3>
              <p className="text-sm text-muted-foreground">
                Web chat & lead qualification
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link to="/ai-booking" className="stat-card group cursor-pointer transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success/15 p-3 text-success">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Booking Assistant</h3>
              <p className="text-sm text-muted-foreground">
                AI-assisted scheduling via Jobber
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
