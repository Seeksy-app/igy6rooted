import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  Plus,
  Trash2,
  Edit,
  Loader2,
  TrendingUp,
  X,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Calculator,
  Megaphone,
  MousePointerClick,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface MarketZone {
  id: string;
  org_id: string;
  name: string;
  zip_codes: string[];
  priority: number;
  lead_score_multiplier: number;
  target_monthly_leads: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MarketingCampaign {
  id: string;
  org_id: string;
  name: string;
  channel: string;
  campaign_type: string;
  status: string;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

interface MarketingMetric {
  id: string;
  org_id: string;
  campaign_id: string | null;
  channel: string;
  metric_date: string;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
}

interface MarketingLead {
  id: string;
  org_id: string;
  campaign_id: string | null;
  channel: string;
  source: string | null;
  customer_name: string | null;
  status: string;
  lead_score: number;
  converted_at: string | null;
  conversion_value: number | null;
  zip_code: string | null;
  created_at: string;
}

const priorityColors: Record<string, string> = {
  high: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  low: "text-red-600 bg-red-100",
};

const CHANNEL_COLORS: Record<string, string> = {
  "google_ads": "#4285F4",
  "meta_ads": "#1877F2",
  "social_media": "#E1306C",
  "referral": "#43a047",
  "direct": "#fb8c00",
  "door_to_door": "#9c27b0",
  "email": "#00bcd4",
  "other": "#757575",
};

function getPriorityLabel(priority: number): { label: string; color: string } {
  if (priority >= 70) return { label: "High", color: priorityColors.high };
  if (priority >= 40) return { label: "Medium", color: priorityColors.medium };
  return { label: "Low", color: priorityColors.low };
}

function formatChannel(channel: string): string {
  return channel
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function GTMPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";

  const [activeTab, setActiveTab] = useState("overview");
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<MarketZone | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  // Zone form state
  const [zoneName, setZoneName] = useState("");
  const [zoneZips, setZoneZips] = useState<string[]>([]);
  const [newZip, setNewZip] = useState("");
  const [zonePriority, setZonePriority] = useState(50);
  const [zoneMultiplier, setZoneMultiplier] = useState(1);
  const [zoneTargetLeads, setZoneTargetLeads] = useState<string>("");
  const [zoneNotes, setZoneNotes] = useState("");
  const [zoneActive, setZoneActive] = useState(true);

  // Campaign form state
  const [campaignName, setCampaignName] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("google_ads");
  const [campaignType, setCampaignType] = useState("awareness");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [campaignStatus, setCampaignStatus] = useState("active");
  const [campaignNotes, setCampaignNotes] = useState("");

  // Fetch market zones
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["gtm-zones", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("gtm_market_zones")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("priority", { ascending: false });
      if (error) throw error;
      return data as MarketZone[];
    },
    enabled: !!currentOrg,
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["marketing-campaigns", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("marketing_campaigns")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MarketingCampaign[];
    },
    enabled: !!currentOrg,
  });

  // Fetch metrics
  const { data: metrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ["marketing-metrics", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("marketing_metrics")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("metric_date", { ascending: false });
      if (error) throw error;
      return data as MarketingMetric[];
    },
    enabled: !!currentOrg,
  });

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ["marketing-leads", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("marketing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MarketingLead[];
    },
    enabled: !!currentOrg,
  });

  // Computed stats
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.converted_at).length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;
  const totalSpend = metrics.reduce((sum, m) => sum + Number(m.spend), 0);
  const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.revenue), 0);
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
  const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;

  // Channel breakdown
  const channelStats = Object.entries(
    metrics.reduce((acc, m) => {
      if (!acc[m.channel]) {
        acc[m.channel] = { impressions: 0, clicks: 0, leads: 0, conversions: 0, spend: 0, revenue: 0 };
      }
      acc[m.channel].impressions += m.impressions;
      acc[m.channel].clicks += m.clicks;
      acc[m.channel].leads += m.leads;
      acc[m.channel].conversions += m.conversions;
      acc[m.channel].spend += Number(m.spend);
      acc[m.channel].revenue += Number(m.revenue);
      return acc;
    }, {} as Record<string, { impressions: number; clicks: number; leads: number; conversions: number; spend: number; revenue: number }>)
  ).map(([channel, stats]) => ({
    name: formatChannel(channel),
    channel,
    ...stats,
    roi: stats.spend > 0 ? ((stats.revenue - stats.spend) / stats.spend * 100) : 0,
    cpl: stats.leads > 0 ? stats.spend / stats.leads : 0,
    conversionRate: stats.leads > 0 ? (stats.conversions / stats.leads * 100) : 0,
  }));

  // Lead sources for pie chart
  const leadsByChannel = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.channel] = (acc[l.channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([channel, count]) => ({
    name: formatChannel(channel),
    value: count,
    color: CHANNEL_COLORS[channel] || CHANNEL_COLORS.other,
  }));

  // Zone mutations
  const saveZoneMutation = useMutation({
    mutationFn: async (zone: Partial<MarketZone>) => {
      if (!currentOrg) throw new Error("No organization");
      const payload = {
        org_id: currentOrg.id,
        name: zone.name,
        zip_codes: zone.zip_codes,
        priority: zone.priority,
        lead_score_multiplier: zone.lead_score_multiplier,
        target_monthly_leads: zone.target_monthly_leads || null,
        notes: zone.notes || null,
        is_active: zone.is_active,
      };
      if (editingZone) {
        const { error } = await supabase.from("gtm_market_zones").update(payload).eq("id", editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gtm_market_zones").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({ title: editingZone ? "Zone updated" : "Zone created" });
      resetZoneForm();
      setIsZoneDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase.from("gtm_market_zones").delete().eq("id", zoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({ title: "Zone deleted" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Campaign mutations
  const saveCampaignMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization");
      const payload = {
        org_id: currentOrg.id,
        name: campaignName,
        channel: campaignChannel,
        campaign_type: campaignType,
        budget: parseFloat(campaignBudget) || 0,
        status: campaignStatus,
        notes: campaignNotes || null,
      };
      if (editingCampaign) {
        const { error } = await supabase.from("marketing_campaigns").update(payload).eq("id", editingCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("marketing_campaigns").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast({ title: editingCampaign ? "Campaign updated" : "Campaign created" });
      resetCampaignForm();
      setIsCampaignDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("marketing_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-campaigns"] });
      toast({ title: "Campaign deleted" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const resetZoneForm = () => {
    setZoneName("");
    setZoneZips([]);
    setNewZip("");
    setZonePriority(50);
    setZoneMultiplier(1);
    setZoneTargetLeads("");
    setZoneNotes("");
    setZoneActive(true);
    setEditingZone(null);
  };

  const resetCampaignForm = () => {
    setCampaignName("");
    setCampaignChannel("google_ads");
    setCampaignType("awareness");
    setCampaignBudget("");
    setCampaignStatus("active");
    setCampaignNotes("");
    setEditingCampaign(null);
  };

  const openEditZoneDialog = (zone: MarketZone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneZips(zone.zip_codes);
    setZonePriority(zone.priority);
    setZoneMultiplier(zone.lead_score_multiplier);
    setZoneTargetLeads(zone.target_monthly_leads?.toString() || "");
    setZoneNotes(zone.notes || "");
    setZoneActive(zone.is_active);
    setIsZoneDialogOpen(true);
  };

  const openEditCampaignDialog = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setCampaignChannel(campaign.channel);
    setCampaignType(campaign.campaign_type);
    setCampaignBudget(campaign.budget.toString());
    setCampaignStatus(campaign.status);
    setCampaignNotes(campaign.notes || "");
    setIsCampaignDialogOpen(true);
  };

  const addZipToZone = () => {
    if (newZip && !zoneZips.includes(newZip)) {
      setZoneZips([...zoneZips, newZip]);
      setNewZip("");
    }
  };

  const removeZipFromZone = (zip: string) => {
    setZoneZips(zoneZips.filter((z) => z !== zip));
  };

  const handleSaveZone = () => {
    if (!zoneName || zoneZips.length === 0) {
      toast({ variant: "destructive", title: "Validation error", description: "Please provide a zone name and at least one ZIP code." });
      return;
    }
    saveZoneMutation.mutate({
      name: zoneName,
      zip_codes: zoneZips,
      priority: zonePriority,
      lead_score_multiplier: zoneMultiplier,
      target_monthly_leads: zoneTargetLeads ? parseInt(zoneTargetLeads) : null,
      notes: zoneNotes,
      is_active: zoneActive,
    });
  };

  const handleSaveCampaign = () => {
    if (!campaignName) {
      toast({ variant: "destructive", title: "Validation error", description: "Please provide a campaign name." });
      return;
    }
    saveCampaignMutation.mutate();
  };

  const isLoading = zonesLoading || campaignsLoading || metricsLoading || leadsLoading;

  // Stats for overview cards
  const overviewStats = [
    { label: "Total ZIP Codes", value: zones.reduce((sum, z) => sum + z.zip_codes.length, 0).toString(), suffix: "in service area", icon: Target, color: "text-primary" },
    { label: "Monthly Leads", value: totalLeads.toString(), suffix: "tracked this period", icon: Users, color: "text-green-600" },
    { label: "Conversion Rate", value: `${conversionRate.toFixed(1)}%`, suffix: "leads to customers", icon: TrendingUp, color: "text-primary" },
    { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, suffix: "from marketing", icon: DollarSign, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#1565c0] text-white p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1565c0] to-[#1976d2]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Marketing & GTM Dashboard</h1>
            <p className="mt-1 text-white/80">
              Real-time marketing performance, campaigns, and market zone management
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start gap-0 rounded-lg border bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Channel Performance
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Market Zones
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            ROI Calculator
          </TabsTrigger>
        </TabsList>

        {/* Market Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-4">
                {overviewStats.map((stat, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.suffix}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Channel Performance Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Channel Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {channelStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={channelStats}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" fontSize={12} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => value.toLocaleString()} />
                          <Bar dataKey="leads" fill="#1565c0" name="Leads" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="conversions" fill="#43a047" name="Conversions" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                        <p>No marketing data yet</p>
                        <p className="text-sm">Add campaigns to start tracking performance</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lead Sources Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leadsByChannel.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={leadsByChannel}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={60}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {leadsByChannel.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <Users className="h-12 w-12 mb-4 opacity-50" />
                        <p>No leads tracked yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Metrics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <MousePointerClick className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Clicks ({ctr.toFixed(1)}% CTR)</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{totalLeads}</p>
                      <p className="text-sm text-muted-foreground">Leads</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">${costPerLead.toFixed(0)}</p>
                      <p className="text-sm text-muted-foreground">Cost/Lead</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className={`text-2xl font-bold ${overallROI >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {overallROI.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">ROI</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Marketing Campaigns</CardTitle>
                <CardDescription>Manage your marketing campaigns across all channels</CardDescription>
              </div>
              {isAdmin && (
                <Dialog open={isCampaignDialogOpen} onOpenChange={(open) => {
                  setIsCampaignDialogOpen(open);
                  if (!open) resetCampaignForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Campaign
                    </Button>
                  </DialogTrigger>
                  <CampaignDialog
                    editing={editingCampaign}
                    name={campaignName}
                    setName={setCampaignName}
                    channel={campaignChannel}
                    setChannel={setCampaignChannel}
                    campaignType={campaignType}
                    setCampaignType={setCampaignType}
                    budget={campaignBudget}
                    setBudget={setCampaignBudget}
                    status={campaignStatus}
                    setStatus={setCampaignStatus}
                    notes={campaignNotes}
                    setNotes={setCampaignNotes}
                    onSave={handleSaveCampaign}
                    onCancel={() => setIsCampaignDialogOpen(false)}
                    isPending={saveCampaignMutation.isPending}
                  />
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Megaphone className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No campaigns yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first marketing campaign to start tracking performance.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-20"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatChannel(campaign.channel)}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{campaign.campaign_type}</TableCell>
                        <TableCell>${Number(campaign.budget).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditCampaignDialog(campaign)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Delete this campaign?")) {
                                    deleteCampaignMutation.mutate(campaign.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channel Performance Tab */}
        <TabsContent value="channels" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Channel Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelStats.length > 0 ? (
                channelStats.map((channel, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{channel.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${channel.roi >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {channel.roi.toFixed(1)}% ROI
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Impressions</p>
                        <p className="font-semibold">{channel.impressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p className="font-semibold">{channel.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Leads</p>
                        <p className="font-semibold">{channel.leads}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-semibold">{channel.conversions} ({channel.conversionRate.toFixed(1)}%)</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spend / Revenue</p>
                        <p className="font-semibold">${channel.spend.toLocaleString()} / ${channel.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No channel data yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Channel performance will appear here once you have marketing metrics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROI Comparison Chart */}
          {channelStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ROI Comparison by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="roi" fill="#43a047" name="ROI %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Market Zones Tab */}
        <TabsContent value="zones" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Market Zones</CardTitle>
                <CardDescription>Define geographic zones with priority and lead scoring rules</CardDescription>
              </div>
              {isAdmin && (
                <Dialog open={isZoneDialogOpen} onOpenChange={(open) => {
                  setIsZoneDialogOpen(open);
                  if (!open) resetZoneForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Zone
                    </Button>
                  </DialogTrigger>
                  <ZoneDialog
                    editingZone={editingZone}
                    zoneName={zoneName}
                    setZoneName={setZoneName}
                    zoneZips={zoneZips}
                    newZip={newZip}
                    setNewZip={setNewZip}
                    addZipToZone={addZipToZone}
                    removeZipFromZone={removeZipFromZone}
                    zonePriority={zonePriority}
                    setZonePriority={setZonePriority}
                    zoneMultiplier={zoneMultiplier}
                    setZoneMultiplier={setZoneMultiplier}
                    zoneTargetLeads={zoneTargetLeads}
                    setZoneTargetLeads={setZoneTargetLeads}
                    zoneNotes={zoneNotes}
                    setZoneNotes={setZoneNotes}
                    zoneActive={zoneActive}
                    setZoneActive={setZoneActive}
                    onSave={handleSaveZone}
                    onCancel={() => setIsZoneDialogOpen(false)}
                    isPending={saveZoneMutation.isPending}
                  />
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {zonesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No market zones yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create your first market zone to start prioritizing leads by geography.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone</TableHead>
                      <TableHead>ZIP Codes</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Target Leads</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && <TableHead className="w-20"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((zone) => {
                      const priority = getPriorityLabel(zone.priority);
                      return (
                        <TableRow key={zone.id}>
                          <TableCell className="font-medium">{zone.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {zone.zip_codes.slice(0, 3).map((zip) => (
                                <span key={zip} className="inline-block rounded bg-muted px-2 py-0.5 text-xs">
                                  {zip}
                                </span>
                              ))}
                              {zone.zip_codes.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{zone.zip_codes.length - 3} more
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-muted-foreground" />
                              {zone.lead_score_multiplier.toFixed(2)}x
                            </div>
                          </TableCell>
                          <TableCell>{zone.target_monthly_leads ?? "—"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 text-xs ${zone.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                              <span className={`h-2 w-2 rounded-full ${zone.is_active ? "bg-green-500" : "bg-muted"}`} />
                              {zone.is_active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEditZoneDialog(zone)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    if (confirm("Delete this zone?")) {
                                      deleteZoneMutation.mutate(zone.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Calculator Tab */}
        <TabsContent value="calculator" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Marketing Spend
                </div>
                <p className="text-3xl font-bold text-primary">
                  ${totalSpend.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total investment</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">From marketing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calculator className="h-4 w-4" />
                  Overall ROI
                </div>
                <p className={`text-3xl font-bold ${overallROI >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {overallROI.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(totalRevenue - totalSpend).toLocaleString()} profit
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Channel ROI Breakdown
              </CardTitle>
              <CardDescription>
                Performance metrics calculated from your marketing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {channelStats.length > 0 ? (
                <div className="space-y-4">
                  {channelStats.map((channel, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <h3 className="font-semibold text-lg mb-4">{channel.name}</h3>
                      <div className="grid grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Spend</p>
                          <p className="text-lg font-bold">${channel.spend.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="text-lg font-bold text-green-600">${channel.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ROI</p>
                          <p className={`text-lg font-bold ${channel.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {channel.roi.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cost/Lead</p>
                          <p className="text-lg font-bold text-primary">${channel.cpl.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Conv. Rate</p>
                          <p className="text-lg font-bold text-green-600">{channel.conversionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No data for ROI calculation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add marketing metrics to see ROI calculations by channel.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Zone Dialog Component
function ZoneDialog({
  editingZone,
  zoneName,
  setZoneName,
  zoneZips,
  newZip,
  setNewZip,
  addZipToZone,
  removeZipFromZone,
  zonePriority,
  setZonePriority,
  zoneMultiplier,
  setZoneMultiplier,
  zoneTargetLeads,
  setZoneTargetLeads,
  zoneNotes,
  setZoneNotes,
  zoneActive,
  setZoneActive,
  onSave,
  onCancel,
  isPending,
}: any) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{editingZone ? "Edit Market Zone" : "Create Market Zone"}</DialogTitle>
        <DialogDescription>
          Define a geographic zone with priority and lead scoring rules.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="zone-name">Zone Name</Label>
          <Input
            id="zone-name"
            placeholder="e.g., Downtown Core"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>ZIP Codes</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ZIP code"
              value={newZip}
              onChange={(e) => setNewZip(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addZipToZone())}
            />
            <Button type="button" onClick={addZipToZone}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {zoneZips.map((zip: string) => (
              <span
                key={zip}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-sm text-primary"
              >
                {zip}
                <button onClick={() => removeZipFromZone(zip)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Priority Level</Label>
            <span className={`text-sm px-2 py-0.5 rounded ${getPriorityLabel(zonePriority).color}`}>
              {getPriorityLabel(zonePriority).label} ({zonePriority})
            </span>
          </div>
          <Slider
            value={[zonePriority]}
            onValueChange={([val]) => setZonePriority(val)}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Lead Score Multiplier</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[zoneMultiplier * 100]}
              onValueChange={([val]) => setZoneMultiplier(val / 100)}
              min={50}
              max={200}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-16 text-right">
              {zoneMultiplier.toFixed(2)}x
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-leads">Target Monthly Leads</Label>
          <Input
            id="target-leads"
            type="number"
            placeholder="Optional"
            value={zoneTargetLeads}
            onChange={(e) => setZoneTargetLeads(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone-notes">Notes</Label>
          <Textarea
            id="zone-notes"
            placeholder="Additional context about this zone..."
            value={zoneNotes}
            onChange={(e) => setZoneNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="zone-active">Active</Label>
          <Switch
            id="zone-active"
            checked={zoneActive}
            onCheckedChange={setZoneActive}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingZone ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Campaign Dialog Component
function CampaignDialog({
  editing,
  name,
  setName,
  channel,
  setChannel,
  campaignType,
  setCampaignType,
  budget,
  setBudget,
  status,
  setStatus,
  notes,
  setNotes,
  onSave,
  onCancel,
  isPending,
}: any) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
        <DialogDescription>
          Set up a marketing campaign to track performance and ROI.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Campaign Name</Label>
          <Input
            id="campaign-name"
            placeholder="e.g., Summer HVAC Special"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="meta_ads">Meta Ads</SelectItem>
                <SelectItem value="social_media">Social Media</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="door_to_door">Door to Door</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Campaign Type</Label>
            <Select value={campaignType} onValueChange={setCampaignType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="awareness">Awareness</SelectItem>
                <SelectItem value="lead_gen">Lead Generation</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-budget">Budget ($)</Label>
            <Input
              id="campaign-budget"
              type="number"
              placeholder="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-notes">Notes</Label>
          <Textarea
            id="campaign-notes"
            placeholder="Campaign details, goals, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editing ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
