import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users,
  MousePointer,
  Target,
  MapPin,
  Star,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";

export default function MarketingAnalyticsPage() {
  const { currentOrg } = useOrg();

  // Mock data - will be replaced with real API data
  const metrics = {
    adSpend: 2450,
    impressions: 45000,
    clicks: 1250,
    leads: 89,
    aiAssistedBookings: 42,
    costPerLead: 27.53,
    costPerBooking: 58.33,
  };

  const channels = [
    { 
      name: "Google Ads", 
      spend: 1500, 
      leads: 52, 
      bookings: 28, 
      connected: false,
      icon: "🎯"
    },
    { 
      name: "Meta Ads", 
      spend: 950, 
      leads: 37, 
      bookings: 14, 
      connected: false,
      icon: "📱"
    },
  ];

  const localSeoMetrics = {
    searchViews: 12500,
    mapViews: 8900,
    websiteClicks: 456,
    calls: 89,
    directions: 234,
    reviews: 47,
    avgRating: 4.8,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/15">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Ads performance • Local SEO • Attribution: Ads → AI → Booking Assist
        </p>
      </div>

      {/* Setup Required Notice */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-warning/15">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Integrations Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your marketing platforms to see real performance data. Currently showing placeholder metrics.
              </p>
              <Button variant="outline" asChild>
                <Link to="/integrations">
                  Setup Integrations
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attribution Funnel */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">AI Attribution Funnel</CardTitle>
          <CardDescription>How ads lead to AI-assisted bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center p-6 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{metrics.impressions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Ad Impressions</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-6 rounded-lg bg-muted/50">
              <p className="text-3xl font-bold">{metrics.clicks.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Clicks</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-6 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-3xl font-bold text-primary">{metrics.leads}</p>
              <p className="text-sm text-muted-foreground">Leads (AI Handled)</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="flex-1 text-center p-6 rounded-lg bg-success/10 border border-success/20">
              <p className="text-3xl font-bold text-success">{metrics.aiAssistedBookings}</p>
              <p className="text-sm text-muted-foreground">AI Bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ad Spend"
          value={`$${metrics.adSpend.toLocaleString()}`}
          subtitle="This month"
          icon={DollarSign}
        />
        <StatCard
          title="Leads Generated"
          value={metrics.leads}
          subtitle="AI handled"
          icon={Users}
        />
        <StatCard
          title="Cost per Lead"
          value={`$${metrics.costPerLead.toFixed(2)}`}
          icon={Target}
        />
        <StatCard
          title="Cost per AI Booking"
          value={`$${metrics.costPerBooking.toFixed(2)}`}
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Channel Performance */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">Channel Performance</CardTitle>
          <CardDescription>Performance by advertising platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <div 
                key={channel.name} 
                className="rounded-lg bg-muted/50 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{channel.icon}</span>
                    <h3 className="font-semibold">{channel.name}</h3>
                  </div>
                  {channel.connected ? (
                    <Badge className="bg-success/15 text-success border-success/30">Connected</Badge>
                  ) : (
                    <Badge variant="secondary">Not Connected</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold">${channel.spend}</p>
                    <p className="text-xs text-muted-foreground">Spend</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{channel.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{channel.bookings}</p>
                    <p className="text-xs text-muted-foreground">AI Bookings</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Local SEO / Google Business */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Local SEO & Google Business Profile
          </CardTitle>
          <CardDescription>Local visibility and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{localSeoMetrics.searchViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Search Views</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{localSeoMetrics.mapViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Maps Views</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{localSeoMetrics.websiteClicks}</p>
              <p className="text-sm text-muted-foreground">Website Clicks</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{localSeoMetrics.calls}</p>
              <p className="text-sm text-muted-foreground">Direct Calls</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning fill-warning" />
              <span className="text-xl font-bold">{localSeoMetrics.avgRating}</span>
              <span className="text-muted-foreground">({localSeoMetrics.reviews} reviews)</span>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Google Business Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
