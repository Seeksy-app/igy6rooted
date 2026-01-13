import { useState, useEffect } from "react";
import { 
  Mic, 
  Save, 
  Upload, 
  Loader2,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AgentContent {
  id: string;
  org_id: string;
  business_name: string;
  business_phone: string;
  service_area: string;
  business_hours_text: string;
  emergency_policy: string;
  services_summary: string;
  pricing_guidance: string;
  scheduling_lead_time: string;
  scheduling_blackout_dates: string;
  scheduling_job_duration_defaults: string;
  scheduling_required_fields: string;
  scheduling_intake_questions: string;
  escalation_transfer_rules: string;
  escalation_voicemail_behavior: string;
  escalation_callback_promise: string;
  agent_system_prompt: string;
  greeting_script: string;
  closing_script: string;
  intake_questions: Array<{ question: string; required: boolean }>;
  last_published_at: string | null;
  published_version: number;
  created_at: string;
  updated_at: string;
}

const defaultContent: Partial<AgentContent> = {
  business_name: "",
  business_phone: "",
  service_area: "",
  business_hours_text: "Monday-Friday 8am-5pm",
  emergency_policy: "For emergencies outside business hours, leave a voicemail and we'll call you back ASAP.",
  services_summary: "",
  pricing_guidance: "Pricing varies by project. We provide free estimates after assessing your needs.",
  scheduling_lead_time: "24 hours minimum notice required",
  scheduling_blackout_dates: "",
  scheduling_job_duration_defaults: "2 hours for standard service calls",
  scheduling_required_fields: "Name, phone number, service address",
  scheduling_intake_questions: "",
  escalation_transfer_rules: "Transfer to a human if the caller requests to speak with a person, or if the inquiry is complex.",
  escalation_voicemail_behavior: "Offer to take a message and promise a callback within 2 hours during business hours.",
  escalation_callback_promise: "We'll return your call within 2 hours during business hours.",
  agent_system_prompt: `You are a friendly and professional AI assistant for our company. Your role is to:
1. Answer customer questions about our services
2. Help schedule appointments
3. Collect necessary information for service requests
4. Transfer to a human when needed

Always be polite, helpful, and efficient. If you don't know an answer, offer to have someone call them back.`,
  greeting_script: "Hi, thanks for calling! How can I help you today?",
  closing_script: "Is there anything else I can help you with? Great, have a wonderful day!",
  intake_questions: [
    { question: "What is your name?", required: true },
    { question: "What is your phone number?", required: true },
    { question: "What is the service address?", required: true },
    { question: "What type of service do you need?", required: true },
    { question: "When would you like to schedule the service?", required: true }
  ]
};

export default function AIVoiceContentPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";
  
  const [content, setContent] = useState<Partial<AgentContent>>(defaultContent);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: savedContent, isLoading } = useQuery({
    queryKey: ["ai-agent-content", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const { data, error } = await supabase
        .from("ai_agent_content")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg
  });

  useEffect(() => {
    if (savedContent) {
      setContent({
        ...savedContent,
        intake_questions: Array.isArray(savedContent.intake_questions) 
          ? savedContent.intake_questions as Array<{ question: string; required: boolean }>
          : defaultContent.intake_questions
      });
    } else if (currentOrg) {
      setContent({ ...defaultContent, business_name: currentOrg.name });
    }
  }, [savedContent, currentOrg]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization");
      
      const payload = {
        org_id: currentOrg.id,
        ...content
      };
      
      if (savedContent?.id) {
        const { error } = await supabase
          .from("ai_agent_content")
          .update(payload)
          .eq("id", savedContent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_agent_content")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-content"] });
      setHasChanges(false);
      toast({
        title: "Saved",
        description: "AI voice content saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save content. " + (error as Error).message,
      });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg || !savedContent?.id) throw new Error("Save content first");
      
      const { error } = await supabase
        .from("ai_agent_content")
        .update({
          last_published_at: new Date().toISOString(),
          published_version: (savedContent.published_version || 0) + 1
        })
        .eq("id", savedContent.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agent-content"] });
      toast({
        title: "Published",
        description: "AI agent content has been published. The voice agent will use these settings.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish. " + (error as Error).message,
      });
    }
  });

  const updateField = (field: keyof AgentContent, value: string | Array<{ question: string; required: boolean }>) => {
    setContent(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/15">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Voice Content</h1>
          </div>
          <p className="text-muted-foreground">
            Configure what your AI voice agent knows and how it responds
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="text-warning border-warning">
                Unsaved changes
              </Badge>
            )}
            <Button 
              variant="outline" 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button 
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending || !savedContent?.id}
            >
              {publishMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Publish to Agent
            </Button>
          </div>
        )}
      </div>

      {/* Publish Status */}
      {savedContent?.last_published_at && (
        <Card className="bg-success/5 border-success/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                Published version {savedContent.published_version}
              </span>
              <span className="text-sm text-muted-foreground">
                • Last published {new Date(savedContent.last_published_at).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-2">
            <Calendar className="h-4 w-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="escalation" className="gap-2">
            <Phone className="h-4 w-4" />
            Escalation
          </TabsTrigger>
          <TabsTrigger value="scripts" className="gap-2">
            <FileText className="h-4 w-4" />
            Scripts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic info about your company the AI will share</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={content.business_name || ""}
                    onChange={(e) => updateField("business_name", e.target.value)}
                    disabled={!isAdmin}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={content.business_phone || ""}
                    onChange={(e) => updateField("business_phone", e.target.value)}
                    disabled={!isAdmin}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Area</Label>
                <Input
                  value={content.service_area || ""}
                  onChange={(e) => updateField("service_area", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="e.g., Greater Austin area, Travis and Williamson counties"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Hours</Label>
                <Input
                  value={content.business_hours_text || ""}
                  onChange={(e) => updateField("business_hours_text", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Monday-Friday 8am-5pm"
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency/After Hours Policy</Label>
                <Textarea
                  value={content.emergency_policy || ""}
                  onChange={(e) => updateField("emergency_policy", e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  placeholder="What should the AI tell callers outside business hours?"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Services & Pricing</CardTitle>
              <CardDescription>What services you offer and pricing guidance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Services Summary</Label>
                <Textarea
                  value={content.services_summary || ""}
                  onChange={(e) => updateField("services_summary", e.target.value)}
                  disabled={!isAdmin}
                  rows={6}
                  placeholder="List your services, one per line:
• Lawn mowing and maintenance
• Tree trimming and removal
• Landscaping design
• Irrigation system installation"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the services your AI can discuss with callers
                </p>
              </div>
              <div className="space-y-2">
                <Label>Pricing Guidance</Label>
                <Textarea
                  value={content.pricing_guidance || ""}
                  onChange={(e) => updateField("pricing_guidance", e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  placeholder="Pricing varies by project. We provide free estimates..."
                />
                <p className="text-xs text-muted-foreground">
                  What should the AI say about pricing? Include disclaimers if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Rules</CardTitle>
              <CardDescription>How the AI should handle appointment scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Lead Time Required</Label>
                  <Input
                    value={content.scheduling_lead_time || ""}
                    onChange={(e) => updateField("scheduling_lead_time", e.target.value)}
                    disabled={!isAdmin}
                    placeholder="24 hours minimum notice"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Job Duration</Label>
                  <Input
                    value={content.scheduling_job_duration_defaults || ""}
                    onChange={(e) => updateField("scheduling_job_duration_defaults", e.target.value)}
                    disabled={!isAdmin}
                    placeholder="2 hours for standard calls"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Blackout Dates</Label>
                <Textarea
                  value={content.scheduling_blackout_dates || ""}
                  onChange={(e) => updateField("scheduling_blackout_dates", e.target.value)}
                  disabled={!isAdmin}
                  rows={2}
                  placeholder="e.g., No appointments on major holidays"
                />
              </div>
              <div className="space-y-2">
                <Label>Required Information for Booking</Label>
                <Input
                  value={content.scheduling_required_fields || ""}
                  onChange={(e) => updateField("scheduling_required_fields", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="Name, phone, address, service type"
                />
              </div>
              <div className="space-y-2">
                <Label>Intake Questions Script</Label>
                <Textarea
                  value={content.scheduling_intake_questions || ""}
                  onChange={(e) => updateField("scheduling_intake_questions", e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  placeholder="Additional questions to ask during booking..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Rules</CardTitle>
              <CardDescription>When and how to transfer to a human</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>When to Transfer to Human</Label>
                <Textarea
                  value={content.escalation_transfer_rules || ""}
                  onChange={(e) => updateField("escalation_transfer_rules", e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  placeholder="Transfer to a human if:
• Caller explicitly requests to speak with a person
• Inquiry involves complex complaints
• Emergency situations
• Billing disputes"
                />
              </div>
              <div className="space-y-2">
                <Label>Voicemail Behavior</Label>
                <Textarea
                  value={content.escalation_voicemail_behavior || ""}
                  onChange={(e) => updateField("escalation_voicemail_behavior", e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  placeholder="If transfer is unavailable, offer to take a message..."
                />
              </div>
              <div className="space-y-2">
                <Label>Callback Promise</Label>
                <Input
                  value={content.escalation_callback_promise || ""}
                  onChange={(e) => updateField("escalation_callback_promise", e.target.value)}
                  disabled={!isAdmin}
                  placeholder="We'll call you back within 2 hours"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent System Prompt</CardTitle>
              <CardDescription>The core instructions that define your AI agent's personality and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.agent_system_prompt || ""}
                onChange={(e) => updateField("agent_system_prompt", e.target.value)}
                disabled={!isAdmin}
                rows={12}
                className="font-mono text-sm"
                placeholder="You are a friendly AI assistant..."
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Greeting Script</CardTitle>
                <CardDescription>How the AI starts the conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.greeting_script || ""}
                  onChange={(e) => updateField("greeting_script", e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  placeholder="Hi, thanks for calling! How can I help you today?"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Closing Script</CardTitle>
                <CardDescription>How the AI ends the conversation</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.closing_script || ""}
                  onChange={(e) => updateField("closing_script", e.target.value)}
                  disabled={!isAdmin}
                  rows={4}
                  placeholder="Is there anything else I can help with? Have a great day!"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {!isAdmin && (
        <Card className="bg-muted/50">
          <CardContent className="py-4 text-center text-muted-foreground">
            <Clock className="h-5 w-5 mx-auto mb-2" />
            You have view-only access. Contact an admin to make changes.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
