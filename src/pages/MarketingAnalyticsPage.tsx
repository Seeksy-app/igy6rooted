import { useState } from "react";
import { 
  BarChart3, 
  AlertTriangle,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrg } from "@/contexts/OrgContext";
import { Link } from "react-router-dom";
import { useAdMetrics } from "@/hooks/useAdMetrics";
import { MetricsOverview } from "@/components/marketing/MetricsOverview";
import { ChannelComparison } from "@/components/marketing/ChannelComparison";
import { PerformanceChart } from "@/components/marketing/PerformanceChart";
import { CampaignsTable } from "@/components/marketing/CampaignsTable";
import { DateRangeSelector } from "@/components/marketing/DateRangeSelector";

export default function MarketingAnalyticsPage() {
  const { currentOrg } = useOrg();
  const [dateRangeDays, setDateRangeDays] = useState(30);
  
  const {
    googleData,
    metaData,
    combinedMetrics,
    isLoadingGoogle,
    isLoadingMeta,
    isLoading,
    refetch,
  } = useAdMetrics(currentOrg?.id, dateRangeDays);

  const hasAnyConnection = googleData?.connected || metaData?.connected;

  // Mock local SEO data - could be connected to Google Business Profile API
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
        <DateRangeSelector value={dateRangeDays} onChange={setDateRangeDays} />
      </div>

      {/* Setup Required Notice - only show if no connections */}
      {!hasAnyConnection && !isLoading && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-warning/15">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Connect Your Ad Accounts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your Google Ads and Meta Ads accounts to see real performance data and track your marketing ROI.
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
      )}

      {/* Combined Metrics Overview */}
      <MetricsOverview metrics={combinedMetrics} isLoading={isLoading} />

      {/* Attribution Funnel */}
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="section-header">AI Attribution Funnel</CardTitle>
          <CardDescription>How ads lead to AI-assisted bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <FunnelStep
              value={combinedMetrics.impressions}
              label="Ad Impressions"
              isLoading={isLoading}
            />
            <FunnelArrow />
            <FunnelStep
              value={combinedMetrics.clicks}
              label="Clicks"
              isLoading={isLoading}
            />
            <FunnelArrow />
            <FunnelStep
              value={combinedMetrics.conversions}
              label="Leads (AI Handled)"
              isLoading={isLoading}
              highlight="primary"
            />
            <FunnelArrow />
            <FunnelStep
              value={0} // This would come from AI bookings table
              label="AI Bookings"
              isLoading={isLoading}
              highlight="success"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <PerformanceChart googleData={googleData} metaData={metaData} />

      {/* Channel Comparison */}
      <ChannelComparison
        googleData={googleData}
        metaData={metaData}
        isLoadingGoogle={isLoadingGoogle}
        isLoadingMeta={isLoadingMeta}
        onRefresh={refetch}
      />

      {/* Campaigns Table */}
      <CampaignsTable googleData={googleData} metaData={metaData} />

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

function FunnelStep({
  value,
  label,
  isLoading,
  highlight,
}: {
  value: number;
  label: string;
  isLoading: boolean;
  highlight?: "primary" | "success";
}) {
  const bgClass = highlight === "primary"
    ? "bg-primary/10 border border-primary/20"
    : highlight === "success"
    ? "bg-success/10 border border-success/20"
    : "bg-muted/50";

  const textClass = highlight === "primary"
    ? "text-primary"
    : highlight === "success"
    ? "text-success"
    : "";

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={`flex-1 text-center p-6 rounded-lg ${bgClass}`}>
      <p className={`text-3xl font-bold ${textClass}`}>
        {isLoading ? "..." : formatNumber(value)}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function FunnelArrow() {
  return (
    <div className="text-muted-foreground hidden sm:block">→</div>
  );
}
