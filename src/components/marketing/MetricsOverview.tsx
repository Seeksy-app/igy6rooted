import { Eye, MousePointerClick, DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { AdMetrics } from "@/hooks/useAdMetrics";

interface MetricsOverviewProps {
  metrics: AdMetrics;
  isLoading: boolean;
}

export function MetricsOverview({ metrics, isLoading }: MetricsOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Impressions"
        value={isLoading ? "..." : formatNumber(metrics.impressions)}
        subtitle="Total views"
        icon={Eye}
      />
      <StatCard
        title="Clicks"
        value={isLoading ? "..." : formatNumber(metrics.clicks)}
        subtitle="Total clicks"
        icon={MousePointerClick}
      />
      <StatCard
        title="Ad Spend"
        value={isLoading ? "..." : formatCurrency(metrics.spend || 0)}
        subtitle="Total investment"
        icon={DollarSign}
      />
      <StatCard
        title="Conversions"
        value={isLoading ? "..." : formatNumber(metrics.conversions)}
        subtitle="Total conversions"
        icon={Target}
        variant={metrics.conversions > 0 ? "success" : "default"}
      />
      <StatCard
        title="CTR"
        value={isLoading ? "..." : formatPercent(metrics.ctr)}
        subtitle="Click-through rate"
        icon={TrendingUp}
      />
      <StatCard
        title="CPC"
        value={isLoading ? "..." : formatCurrency(metrics.cpc)}
        subtitle="Cost per click"
        icon={Users}
      />
    </div>
  );
}
