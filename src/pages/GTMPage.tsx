import { useState, useEffect, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Plus,
  Trash2,
  Edit,
  Loader2,
  TrendingUp,
  Star,
  X,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Calculator,
  Megaphone,
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
} from "recharts";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

const priorityColors: Record<string, string> = {
  high: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  low: "text-red-600 bg-red-100",
};

function getPriorityLabel(priority: number): { label: string; color: string } {
  if (priority >= 70) return { label: "High", color: priorityColors.high };
  if (priority >= 40) return { label: "Medium", color: priorityColors.medium };
  return { label: "Low", color: priorityColors.low };
}

// Stat card data for Market Overview
const marketOverviewStats = [
  { label: "Total Service Area", value: "24", suffix: "ZIP Codes", color: "text-primary" },
  { label: "Monthly Leads", value: "156", suffix: "Active opportunities", color: "text-green-600" },
  { label: "Conversion Rate", value: "23%", suffix: "Avg booking rate", color: "text-primary" },
  { label: "Market Value", value: "$184K", suffix: "Monthly potential", color: "text-green-600" },
];

// Chart data
const topMarketsData = [
  { name: "Downtown", leads: 45, booked: 12, revenue: 28000 },
  { name: "Suburbs North", leads: 38, booked: 10, revenue: 24000 },
  { name: "East Side", leads: 32, booked: 8, revenue: 19000 },
  { name: "West End", leads: 28, booked: 7, revenue: 16000 },
  { name: "Industrial", leads: 13, booked: 3, revenue: 8000 },
];

const segmentData = [
  { name: "Residential", value: 45, color: "#1e88e5" },
  { name: "Commercial", value: 28, color: "#43a047" },
  { name: "Property Mgmt", value: 17, color: "#fb8c00" },
  { name: "Referrals", value: 10, color: "#e53935" },
];

const channelPerformance = [
  { name: "Google Ads", reach: 45, conversion: 8, cost: "$$" },
  { name: "Social Media", reach: 35, conversion: 12, cost: "$$" },
  { name: "Door Hangers", reach: 28, conversion: 18, cost: "$$$" },
  { name: "Referral Program", reach: 15, conversion: 22, cost: "$" },
  { name: "Home Shows", reach: 12, conversion: 15, cost: "$$$" },
];

export default function GTMPage() {
  const { currentOrg, userRole } = useOrg();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = userRole === "admin";

  const [activeTab, setActiveTab] = useState("overview");
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<MarketZone | null>(null);

  // ROI Calculator state
  const [channels, setChannels] = useState([
    { name: "Google Ads", spend: 3000, leads: 85, conversions: 8, avgValue: 1200 },
    { name: "Social Media", spend: 1500, leads: 45, conversions: 6, avgValue: 900 },
    { name: "Door-to-Door", spend: 2000, leads: 55, conversions: 12, avgValue: 1100 },
  ]);

  // Form state
  const [zoneName, setZoneName] = useState("");
  const [zoneZips, setZoneZips] = useState<string[]>([]);
  const [newZip, setNewZip] = useState("");
  const [zonePriority, setZonePriority] = useState(50);
  const [zoneMultiplier, setZoneMultiplier] = useState(1);
  const [zoneTargetLeads, setZoneTargetLeads] = useState<string>("");
  const [zoneNotes, setZoneNotes] = useState("");
  const [zoneActive, setZoneActive] = useState(true);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("mapbox-token");
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error);
      }
    };
    fetchToken();
  }, []);

  // Fetch market zones
  const { data: zones = [], isLoading } = useQuery({
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

  // Create/Update zone mutation
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
        const { error } = await supabase
          .from("gtm_market_zones")
          .update(payload)
          .eq("id", editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("gtm_market_zones")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({
        title: editingZone ? "Zone updated" : "Zone created",
        description: `Market zone "${zoneName}" has been saved.`,
      });
      resetForm();
      setIsZoneDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Delete zone mutation
  const deleteZoneMutation = useMutation({
    mutationFn: async (zoneId: string) => {
      const { error } = await supabase
        .from("gtm_market_zones")
        .delete()
        .eq("id", zoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gtm-zones"] });
      toast({ title: "Zone deleted" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
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

  const openEditDialog = (zone: MarketZone) => {
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
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please provide a zone name and at least one ZIP code.",
      });
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

  // Calculate ROI metrics
  const totalSpend = channels.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = channels.reduce((sum, c) => sum + (c.conversions * c.avgValue), 0);
  const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;

  const updateChannel = (index: number, field: string, value: number) => {
    const updated = [...channels];
    updated[index] = { ...updated[index], [field]: value };
    setChannels(updated);
  };

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
            <h1 className="text-3xl font-bold">Marketing & GTM Plan</h1>
            <p className="mt-1 text-white/80">
              Strategic plan to grow your service business and reach more customers
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
          <TabsTrigger value="strategy" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            GTM Strategy
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Key Metrics
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Channels
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex-1 max-w-[180px] rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
            ROI Calculator
          </TabsTrigger>
        </TabsList>

        {/* Market Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {marketOverviewStats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.suffix}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Markets Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Markets: Leads & Bookings Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topMarketsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#e53935" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="booked" fill="#1565c0" name="Booked" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#43a047" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Zone Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Market Zones</CardTitle>
              {isAdmin && (
                <Dialog open={isZoneDialogOpen} onOpenChange={(open) => {
                  setIsZoneDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
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
              {isLoading ? (
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
                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(zone)}>
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

        {/* GTM Strategy Tab */}
        <TabsContent value="strategy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Go-To-Market Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <StrategyPhase
                phase="Phase 1: Foundation (Months 1-3)"
                color="border-l-blue-500"
                items={[
                  { title: "Local SEO Optimization:", desc: "Claim and optimize Google Business Profile, local directories, and review sites" },
                  { title: "Website Landing Pages:", desc: "Create service-specific landing pages for each market zone with local keywords" },
                  { title: "Review Generation:", desc: "Implement automated review request system after completed jobs" },
                  { title: "Referral Program:", desc: "Launch customer referral program with incentives for both parties" },
                ]}
              />
              <StrategyPhase
                phase="Phase 2: Growth (Months 4-6)"
                color="border-l-orange-500"
                items={[
                  { title: "Paid Advertising:", desc: "Launch targeted Google Ads and Facebook campaigns for high-priority zones" },
                  { title: "Door-to-Door Marketing:", desc: "Deploy door hangers and direct mail in neighborhoods with recent service completions" },
                  { title: "Partnership Development:", desc: "Establish referral partnerships with real estate agents, property managers" },
                  { title: "Community Events:", desc: "Sponsor local events and home shows in target markets" },
                ]}
              />
              <StrategyPhase
                phase="Phase 3: Scale (Months 7-12)"
                color="border-l-green-500"
                items={[
                  { title: "Market Expansion:", desc: "Expand service area based on data from highest-performing zones" },
                  { title: "Brand Building:", desc: "Invest in vehicle wraps, uniforms, and brand visibility" },
                  { title: "Commercial Accounts:", desc: "Target property management companies and commercial clients" },
                  { title: "Technology Investment:", desc: "Implement CRM and marketing automation for scale" },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Key Metrics Tab */}
        <TabsContent value="metrics" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Market Share by Segment</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {zones.length > 0 ? zones.slice(0, 5).map((zone) => (
                  <div key={zone.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{zone.name}</span>
                      <span className="text-sm font-bold">{zone.target_monthly_leads || 0} leads</span>
                    </div>
                    <Progress value={zone.priority} className="h-2" />
                  </div>
                )) : (
                  <>
                    <GeographicBar name="Downtown Core" value={85} leads="156" />
                    <GeographicBar name="North Suburbs" value={72} leads="142" />
                    <GeographicBar name="East Side" value={65} leads="134" />
                    <GeographicBar name="West End" value={58} leads="118" />
                    <GeographicBar name="Industrial District" value={45} leads="92" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Areas with high lead scores often correlate with neighborhoods having higher property values 
                and longer average tenure. This correlation helps identify prime markets for premium services 
                and creates opportunities for upselling additional services.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Marketing Channel Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelPerformance.map((channel, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{channel.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      {channel.conversion}% Conversion
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reach Potential</p>
                      <Progress value={channel.reach} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{channel.reach}% of target market</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cost Efficiency</p>
                      <p className="text-lg font-semibold">{channel.cost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Calculator Tab */}
        <TabsContent value="calculator" className="mt-6 space-y-6">
          {/* Summary Stats */}
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
                <p className="text-sm text-muted-foreground">Monthly investment</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Total Revenue Generated
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">From conversions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calculator className="h-4 w-4" />
                  Overall ROI
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {overallROI.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(totalRevenue - totalSpend).toLocaleString()} profit
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Channel Calculators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Channel Performance Calculator
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust the values below to calculate ROI for each marketing channel
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {channels.map((channel, index) => {
                const revenue = channel.conversions * channel.avgValue;
                const roi = channel.spend > 0 ? ((revenue - channel.spend) / channel.spend * 100) : 0;
                const costPerLead = channel.leads > 0 ? channel.spend / channel.leads : 0;
                const costPerAcq = channel.conversions > 0 ? channel.spend / channel.conversions : 0;
                const convRate = channel.leads > 0 ? (channel.conversions / channel.leads * 100) : 0;

                return (
                  <div key={index} className="rounded-lg border p-6">
                    <h3 className="font-semibold text-lg mb-4">{channel.name}</h3>
                    <div className="grid gap-4 md:grid-cols-4 mb-4">
                      <div className="space-y-2">
                        <Label>Monthly Spend ($)</Label>
                        <Input
                          type="number"
                          value={channel.spend}
                          onChange={(e) => updateChannel(index, "spend", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Leads Generated</Label>
                        <Input
                          type="number"
                          value={channel.leads}
                          onChange={(e) => updateChannel(index, "leads", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conversions</Label>
                        <Input
                          type="number"
                          value={channel.conversions}
                          onChange={(e) => updateChannel(index, "conversions", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Avg Deal Value ($)</Label>
                        <Input
                          type="number"
                          value={channel.avgValue}
                          onChange={(e) => updateChannel(index, "avgValue", Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="text-lg font-bold text-green-600">${revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-lg font-bold text-green-600">{roi.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost/Lead</p>
                        <p className="text-lg font-bold text-primary">${costPerLead.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost/Acquisition</p>
                        <p className="text-lg font-bold text-primary">${costPerAcq.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conv. Rate</p>
                        <p className="text-lg font-bold text-green-600">{convRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ROI Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ROI Comparison by Channel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channels.map(c => ({
                  name: c.name,
                  roi: c.spend > 0 ? ((c.conversions * c.avgValue - c.spend) / c.spend * 100) : 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="roi" fill="#43a047" name="ROI %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function StrategyPhase({ phase, color, items }: { phase: string; color: string; items: { title: string; desc: string }[] }) {
  return (
    <div className={`border-l-4 ${color} pl-6`}>
      <h3 className="font-semibold text-lg mb-4">{phase}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-muted-foreground">•</span>
            <span>
              <strong className="text-primary">{item.title}</strong> {item.desc}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GeographicBar({ name, value, leads }: { name: string; value: number; leads: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm font-bold text-primary">{leads} leads</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}

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
