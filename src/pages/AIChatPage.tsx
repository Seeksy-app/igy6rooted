import { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrg } from "@/contexts/OrgContext";

export default function AIChatPage() {
  const { currentOrg } = useOrg();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const chatMetrics = {
    totalChats: 89,
    leadsQualified: 34,
    questionsAnswered: 156,
    avgResponseTime: 0.8,
  };

  const recentChats = [
    { 
      id: "1", 
      visitor: "John D.", 
      intent: "Service inquiry", 
      outcome: "qualified",
      messages: 8,
      duration: "4m 23s",
      time: "10 min ago",
      summary: "Asked about lawn mowing services, qualified for residential package"
    },
    { 
      id: "2", 
      visitor: "Sarah M.", 
      intent: "Pricing question", 
      outcome: "answered",
      messages: 4,
      duration: "1m 45s",
      time: "25 min ago",
      summary: "FAQ about pricing, resolved from knowledge base"
    },
    { 
      id: "3", 
      visitor: "Mike R.", 
      intent: "Booking request", 
      outcome: "booking_assisted",
      messages: 12,
      duration: "6m 12s",
      time: "1h ago",
      summary: "Wanted to schedule hedge trimming, transferred to booking assistant"
    },
    { 
      id: "4", 
      visitor: "Anonymous", 
      intent: "Complex inquiry", 
      outcome: "escalated",
      messages: 6,
      duration: "3m 05s",
      time: "2h ago",
      summary: "Commercial property question, escalated to human agent"
    },
  ];

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "qualified":
        return <Badge className="bg-success/15 text-success border-success/30">Qualified</Badge>;
      case "answered":
        return <Badge className="bg-primary/15 text-primary border-primary/30">Answered</Badge>;
      case "booking_assisted":
        return <Badge className="bg-success/15 text-success border-success/30">Booking Assisted</Badge>;
      case "escalated":
        return <Badge className="bg-warning/15 text-warning border-warning/30">Escalated</Badge>;
      default:
        return <Badge variant="secondary">{outcome}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-accent/15">
            <MessageSquare className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
        </div>
        <p className="text-muted-foreground">
          Web chat AI for lead qualification and Q&A • Powered by Knowledge Base
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Chats"
          value={chatMetrics.totalChats}
          subtitle="This week"
          icon={MessageSquare}
          trend={{ value: 15, label: "vs last week" }}
        />
        <StatCard
          title="Leads Qualified"
          value={chatMetrics.leadsQualified}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Questions Answered"
          value={chatMetrics.questionsAnswered}
          subtitle="From Knowledge Base"
          icon={CheckCircle2}
        />
        <StatCard
          title="Avg Response Time"
          value={`${chatMetrics.avgResponseTime}s`}
          icon={Clock}
          variant="success"
        />
      </div>

      {/* Chat Configuration & Recent Chats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="section-header">Chat Widget</CardTitle>
            <CardDescription>Configure your web chat AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">Widget Status</span>
              </div>
              <Badge className="bg-success/15 text-success border-success/30">Active</Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Lead Qualification</Badge>
                <Badge variant="secondary">FAQ Answers</Badge>
                <Badge variant="secondary">Booking Handoff</Badge>
                <Badge variant="secondary">Human Escalation</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Configure Widget
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Recent Chats */}
        <Card className="stat-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="section-header">Recent Chat Sessions</CardTitle>
              <CardDescription>AI-handled conversations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
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
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="rounded-lg bg-muted/50 p-4 hover:bg-muted/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{chat.visitor}</p>
                          <p className="text-xs text-muted-foreground">{chat.intent}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOutcomeBadge(chat.outcome)}
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{chat.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{chat.messages} messages</span>
                      <span>•</span>
                      <span>{chat.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Intent Detection Stats */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Intent Detection Performance</CardTitle>
          <CardDescription>How well AI understands visitor intentions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold text-success">92%</p>
              <p className="text-sm text-muted-foreground">Intent Accuracy</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold text-primary">78%</p>
              <p className="text-sm text-muted-foreground">Self-Service Resolution</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold text-warning">12%</p>
              <p className="text-sm text-muted-foreground">Escalation Rate</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold">4.6/5</p>
              <p className="text-sm text-muted-foreground">Visitor Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
