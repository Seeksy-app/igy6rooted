import { useState } from "react";
import { 
  Phone, 
  Mic, 
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  Play,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Settings
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";

export default function AICallsPage() {
  const { currentOrg } = useOrg();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const callMetrics = {
    totalCalls: 156,
    qualified: 89,
    bookingsAssisted: 42,
    escalated: 18,
    avgDuration: "3:45",
    successRate: 73,
  };

  const recentCalls = [
    { 
      id: "1", 
      caller: "+1 (555) 123-4567", 
      outcome: "booked",
      duration: "4:23",
      time: "15 min ago",
      transcript: "Customer inquired about lawn mowing services...",
      sentiment: "positive"
    },
    { 
      id: "2", 
      caller: "+1 (555) 987-6543", 
      outcome: "qualified",
      duration: "2:45",
      time: "32 min ago",
      transcript: "Potential client asking about hedge trimming...",
      sentiment: "positive"
    },
    { 
      id: "3", 
      caller: "+1 (555) 456-7890", 
      outcome: "escalated",
      duration: "5:12",
      time: "1h ago",
      transcript: "Complex commercial inquiry requiring human...",
      sentiment: "neutral"
    },
    { 
      id: "4", 
      caller: "+1 (555) 321-0987", 
      outcome: "resolved",
      duration: "1:58",
      time: "2h ago",
      transcript: "FAQ about service areas, answered from KB...",
      sentiment: "positive"
    },
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "booked":
        return <Badge className="bg-success/15 text-success border-success/30">Booking Assisted</Badge>;
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Conversational Calls</h1>
          </div>
          <p className="text-muted-foreground">
            Voice AI powered by ElevenLabs • Call analytics & transcripts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/voice-agent-test">
              <Mic className="mr-2 h-4 w-4" />
              Test Voice Agent
            </Link>
          </Button>
          <Button asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title="Total Calls"
          value={callMetrics.totalCalls}
          subtitle="This week"
          icon={Phone}
          trend={{ value: 23, label: "vs last week" }}
        />
        <StatCard
          title="Leads Qualified"
          value={callMetrics.qualified}
          icon={CheckCircle2}
        />
        <StatCard
          title="Bookings Assisted"
          value={callMetrics.bookingsAssisted}
          subtitle="via Jobber API"
          icon={Calendar}
          variant="success"
        />
        <StatCard
          title="Escalated"
          value={callMetrics.escalated}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Avg Duration"
          value={callMetrics.avgDuration}
          icon={Clock}
        />
        <StatCard
          title="Success Rate"
          value={`${callMetrics.successRate}%`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Voice Agent Status & Call List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Voice Agent Status */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="section-header">Voice Agent</CardTitle>
            <CardDescription>ElevenLabs integration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/15">
                    <Mic className="h-5 w-5 text-success" />
                  </div>
                  <span className="font-medium">Agent Status</span>
                </div>
                <Badge className="bg-success/15 text-success border-success/30">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Voice AI is ready to handle incoming calls
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Voice Model</span>
                <span>ElevenLabs Conversational</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Knowledge Base</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jobber API</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/settings">
                Agent Configuration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="section-header">Recent Calls</CardTitle>
              <CardDescription>AI-handled voice conversations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{call.caller}</p>
                          <p className="text-xs text-muted-foreground">Duration: {call.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(call.outcome)}
                        <span className="text-xs text-muted-foreground">{call.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{call.transcript}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Play className="mr-1 h-3 w-3" />
                        Play
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-1 h-3 w-3" />
                        Transcript
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Call Outcomes Distribution */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Call Outcomes Distribution</CardTitle>
          <CardDescription>How AI handles incoming calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center">
              <p className="text-3xl font-bold text-success">27%</p>
              <p className="text-sm text-muted-foreground">Booking Assisted</p>
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
              <p className="text-3xl font-bold text-primary">30%</p>
              <p className="text-sm text-muted-foreground">Lead Qualified</p>
            </div>
            <div className="rounded-lg bg-muted border border-border p-4 text-center">
              <p className="text-3xl font-bold">25%</p>
              <p className="text-sm text-muted-foreground">FAQ Resolved</p>
            </div>
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 text-center">
              <p className="text-3xl font-bold text-warning">12%</p>
              <p className="text-sm text-muted-foreground">Escalated</p>
            </div>
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-center">
              <p className="text-3xl font-bold text-destructive">6%</p>
              <p className="text-sm text-muted-foreground">Dropped</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
