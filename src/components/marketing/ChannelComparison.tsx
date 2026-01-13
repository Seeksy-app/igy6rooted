import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdAccountData } from "@/hooks/useAdMetrics";

interface ChannelComparisonProps {
  googleData: AdAccountData | null;
  metaData: AdAccountData | null;
  isLoadingGoogle: boolean;
  isLoadingMeta: boolean;
  onRefresh: () => void;
}

export function ChannelComparison({
  googleData,
  metaData,
  isLoadingGoogle,
  isLoadingMeta,
  onRefresh,
}: ChannelComparisonProps) {
  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const channels = [
    {
      name: "Google Ads",
      icon: "🎯",
      data: googleData,
      isLoading: isLoadingGoogle,
      color: "blue",
    },
    {
      name: "Meta Ads",
      icon: "📱",
      data: metaData,
      isLoading: isLoadingMeta,
      color: "indigo",
    },
  ];

  return (
    <Card className="stat-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="section-header">Channel Performance</CardTitle>
          <CardDescription>Compare performance across advertising platforms</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {channels.map((channel) => (
            <div
              key={channel.name}
              className="rounded-xl border border-border bg-muted/30 p-6 transition-all hover:bg-muted/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <h3 className="font-semibold text-lg">{channel.name}</h3>
                </div>
                {channel.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : channel.data?.connected ? (
                  <Badge className="status-connected">Connected</Badge>
                ) : (
                  <Badge variant="secondary" className="status-disconnected">
                    Not Connected
                  </Badge>
                )}
              </div>

              {channel.isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !channel.data?.connected ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Connect your {channel.name} account to see metrics
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/integrations">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Connect
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MetricBox
                      label="Spend"
                      value={formatCurrency(channel.data.metrics.spend || channel.data.metrics.cost || 0)}
                      size="large"
                    />
                    <MetricBox
                      label="Conversions"
                      value={channel.data.metrics.conversions.toString()}
                      size="large"
                      highlight
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <MetricBox
                      label="Impressions"
                      value={formatNumber(channel.data.metrics.impressions)}
                    />
                    <MetricBox
                      label="Clicks"
                      value={formatNumber(channel.data.metrics.clicks)}
                    />
                    <MetricBox
                      label="CTR"
                      value={`${channel.data.metrics.ctr.toFixed(2)}%`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox
                      label="CPC"
                      value={formatCurrency(channel.data.metrics.cpc)}
                    />
                    <MetricBox
                      label="Conv. Rate"
                      value={`${channel.data.metrics.conversion_rate.toFixed(2)}%`}
                    />
                  </div>
                  {channel.data.account_name && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Account: {channel.data.account_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBox({
  label,
  value,
  size = "default",
  highlight = false,
}: {
  label: string;
  value: string;
  size?: "default" | "large";
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg bg-background/80 p-3 ${highlight ? "border border-success/30" : ""}`}>
      <p className={`font-bold ${size === "large" ? "text-2xl" : "text-lg"} ${highlight ? "text-success" : ""}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
