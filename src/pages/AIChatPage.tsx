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

  // Real data - starts at zero until chat sessions occur
  const chatMetrics = {
    totalChats: 0,
    leadsQualified: 0,
    questionsAnswered: 0,
    avgResponseTime: 0,
  };

  // Empty array - will be populated from database when chats are recorded
  const recentChats: Array<{
    id: string;
    visitor: string;
    intent: string;
    outcome: string;
    messages: number;
    duration: string;
    time: string;
    summary: string;
  }> = [];

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
              {recentChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">No chat sessions yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    AI chat conversations will appear here
                  </p>
                </div>
              ) : (
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
              )}
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
              <p className="text-3xl font-bold text-success">0%</p>
              <p className="text-sm text-muted-foreground">Intent Accuracy</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold text-primary">0%</p>
              <p className="text-sm text-muted-foreground">Self-Service Resolution</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold text-warning">0%</p>
              <p className="text-sm text-muted-foreground">Escalation Rate</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-3xl font-bold">0/5</p>
              <p className="text-sm text-muted-foreground">Visitor Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
