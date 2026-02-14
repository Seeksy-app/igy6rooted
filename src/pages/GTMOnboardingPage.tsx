import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Building2,
  MapPin,
  DollarSign,
  Megaphone,
  Globe,
  Save,
  X,
  Sparkles,
} from "lucide-react";

const BUSINESS_TYPES = [
  "Tree Service",
  "Landscaping",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Pest Control",
  "Cleaning",
  "Painting",
  "General Contracting",
  "Lawn Care",
  "Pressure Washing",
  "Fencing",
  "Concrete",
  "Other",
];

const INDUSTRIES = [
  "Home Services",
  "Commercial Services",
  "Residential & Commercial",
  "Emergency Services",
  "Specialty Services",
];

const ALL_CHANNELS = [
  { key: "google_ads", label: "Google Ads (PPC)", description: "Pay-per-click search advertising" },
  { key: "google_lsa", label: "Google Local Service Ads", description: "Pay-per-lead with Google Guarantee" },
  { key: "meta_ads", label: "Meta/Facebook Ads", description: "Social media paid advertising" },
  { key: "seo", label: "SEO / Organic Search", description: "Organic search engine optimization" },
  { key: "gbp", label: "Google Business Profile", description: "Local search & Google Maps" },
  { key: "direct_mail", label: "Direct Mail / EDDM", description: "Physical mail marketing" },
  { key: "referral", label: "Referral Program", description: "Customer referral incentives" },
  { key: "door_to_door", label: "Door-to-Door / Canvassing", description: "Direct neighborhood outreach" },
  { key: "social_organic", label: "Social Media (Organic)", description: "Unpaid social posting" },
  { key: "email", label: "Email Marketing", description: "Email campaigns & nurturing" },
  { key: "nextdoor", label: "Nextdoor", description: "Neighborhood social network" },
  { key: "yelp", label: "Yelp / Review Sites", description: "Review platform advertising" },
  { key: "youtube", label: "YouTube Ads", description: "Video advertising" },
  { key: "radio_tv", label: "Radio / TV", description: "Traditional broadcast media" },
];

const STEPS = [
  { key: "business", label: "Business Info", icon: Building2 },
  { key: "service_area", label: "Service Area", icon: MapPin },
  { key: "budget", label: "Budget & Goals", icon: DollarSign },
  { key: "channels", label: "Marketing Channels", icon: Megaphone },
  { key: "connections", label: "Connections", icon: Globe },
];

export default function GTMOnboardingPage() {
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [industry, setIndustry] = useState("");
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [newZip, setNewZip] = useState("");
  const [serviceRadius, setServiceRadius] = useState(25);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [targetRevenue, setTargetRevenue] = useState("");
  const [avgJobValue, setAvgJobValue] = useState("");
  const [currentLeads, setCurrentLeads] = useState("");
  const [targetLeads, setTargetLeads] = useState("");
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [gbpUrl, setGbpUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Fetch existing profile
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["gtm-profile", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;
      const { data, error } = await supabase
        .from("gtm_profiles")
        .select("*")
        .eq("org_id", currentOrg.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  // Populate form from existing profile
  useEffect(() => {
    if (existingProfile) {
      setBusinessName(existingProfile.business_name || "");
      setBusinessType(existingProfile.business_type || "");
      setIndustry(existingProfile.industry || "");
      setZipCodes((existingProfile.service_zip_codes as string[]) || []);
      setServiceRadius(existingProfile.service_radius_miles || 25);
      setMonthlyBudget(existingProfile.monthly_marketing_budget?.toString() || "");
      setTargetRevenue(existingProfile.target_monthly_revenue?.toString() || "");
      setAvgJobValue(existingProfile.average_job_value?.toString() || "");
      setCurrentLeads(existingProfile.current_monthly_leads?.toString() || "");
      setTargetLeads(existingProfile.target_monthly_leads?.toString() || "");
      setActiveChannels((existingProfile.active_channels as string[]) || []);
      setGbpUrl(existingProfile.gbp_url || "");
      setWebsiteUrl(existingProfile.website_url || "");
    }
  }, [existingProfile]);

  const buildPayload = (completed: boolean) => ({
    org_id: currentOrg!.id,
    business_name: businessName.trim().slice(0, 200),
    business_type: businessType,
    industry: industry || null,
    service_zip_codes: zipCodes,
    service_radius_miles: serviceRadius,
    monthly_marketing_budget: parseFloat(monthlyBudget) || 0,
    target_monthly_revenue: parseFloat(targetRevenue) || 0,
    average_job_value: parseFloat(avgJobValue) || 0,
    current_monthly_leads: parseInt(currentLeads) || 0,
    target_monthly_leads: parseInt(targetLeads) || 0,
    active_channels: activeChannels,
    gbp_url: gbpUrl.trim().slice(0, 500) || null,
    website_url: websiteUrl.trim().slice(0, 500) || null,
    onboarding_completed: completed,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ completed }: { completed: boolean }) => {
      if (!currentOrg) throw new Error("No organization");
      const payload = buildPayload(completed);
      if (existingProfile) {
        const { error } = await supabase.from("gtm_profiles").update(payload).eq("id", existingProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gtm_profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_, { completed }) => {
      queryClient.invalidateQueries({ queryKey: ["gtm-profile"] });
      if (completed) {
        toast({ title: "GTM Profile Complete!", description: "Redirecting to your GTM dashboard..." });
        navigate("/gtm");
      } else {
        toast({ title: "Progress saved", description: "You can resume anytime." });
        navigate("/gtm");
      }
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error saving", description: error.message });
    },
  });

  const addZip = () => {
    const cleaned = newZip.trim().replace(/[^0-9]/g, "").slice(0, 5);
    if (cleaned.length === 5 && !zipCodes.includes(cleaned)) {
      setZipCodes([...zipCodes, cleaned]);
    }
    setNewZip("");
  };

  const toggleChannel = (key: string) => {
    setActiveChannels((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GTM Strategy Setup</h1>
          <p className="text-muted-foreground">
            Configure your go-to-market profile for AI-powered strategy & ROI insights
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => saveMutation.mutate({ completed: false })}
          disabled={saveMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save & Exit
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
          <span className="font-medium">{STEPS[step].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(i)}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                i <= step ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                    ? "border-primary text-primary"
                    : "border-muted"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g., IGY6 Rooted Tree Service" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business Type *</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Service Area */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service ZIP Codes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    placeholder="Enter 5-digit ZIP"
                    maxLength={5}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addZip())}
                  />
                  <Button onClick={addZip} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {zipCodes.map((z) => (
                    <Badge key={z} variant="secondary" className="gap-1">
                      {z}
                      <button onClick={() => setZipCodes(zipCodes.filter((x) => x !== z))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {zipCodes.length === 0 && (
                    <p className="text-sm text-muted-foreground">No ZIP codes added yet</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service Radius (miles)</Label>
                <Input
                  type="number"
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(parseInt(e.target.value) || 25)}
                  min={1}
                  max={200}
                />
              </div>
            </div>
          )}

          {/* Step 2: Budget & Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Monthly Marketing Budget ($)</Label>
                  <Input type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} placeholder="e.g., 3000" />
                </div>
                <div className="space-y-2">
                  <Label>Target Monthly Revenue ($)</Label>
                  <Input type="number" value={targetRevenue} onChange={(e) => setTargetRevenue(e.target.value)} placeholder="e.g., 50000" />
                </div>
                <div className="space-y-2">
                  <Label>Average Job Value ($)</Label>
                  <Input type="number" value={avgJobValue} onChange={(e) => setAvgJobValue(e.target.value)} placeholder="e.g., 1200" />
                </div>
                <div className="space-y-2">
                  <Label>Current Monthly Leads</Label>
                  <Input type="number" value={currentLeads} onChange={(e) => setCurrentLeads(e.target.value)} placeholder="e.g., 30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Monthly Leads</Label>
                <Input type="number" value={targetLeads} onChange={(e) => setTargetLeads(e.target.value)} placeholder="e.g., 60" />
              </div>
            </div>
          )}

          {/* Step 3: Marketing Channels */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select all marketing channels you currently use or plan to use:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {ALL_CHANNELS.map((ch) => (
                  <button
                    key={ch.key}
                    onClick={() => toggleChannel(ch.key)}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                      activeChannels.includes(ch.key)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium text-sm">{ch.label}</span>
                      {activeChannels.includes(ch.key) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{ch.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Connections */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourcompany.com" />
              </div>
              <div className="space-y-2">
                <Label>Google Business Profile URL</Label>
                <Input value={gbpUrl} onChange={(e) => setGbpUrl(e.target.value)} placeholder="https://business.google.com/..." />
              </div>
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">AI-Powered Analysis</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Once you complete setup, our AI will analyze your business profile, competitor data from Firecrawl,
                        SEO metrics from Semrush, and your Google Business Profile to generate a comprehensive GTM strategy
                        with ROI projections for every channel.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => saveMutation.mutate({ completed: true })}
            disabled={saveMutation.isPending || !businessName || !businessType}
          >
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Check className="mr-2 h-4 w-4" />
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
