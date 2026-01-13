import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Campaign, AdAccountData } from "@/hooks/useAdMetrics";

interface CampaignsTableProps {
  googleData: AdAccountData | null;
  metaData: AdAccountData | null;
}

export function CampaignsTable({ googleData, metaData }: CampaignsTableProps) {
  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "enabled" || statusLower === "active") {
      return <Badge className="status-connected">Active</Badge>;
    }
    if (statusLower === "paused") {
      return <Badge className="status-pending">Paused</Badge>;
    }
    return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  };

  const googleCampaigns = googleData?.campaigns || [];
  const metaCampaigns = metaData?.campaigns || [];
  const allCampaigns = [
    ...googleCampaigns.map((c) => ({ ...c, source: "Google Ads" })),
    ...metaCampaigns.map((c) => ({ ...c, source: "Meta Ads" })),
  ];

  const hasCampaigns = allCampaigns.length > 0;

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="section-header">Campaign Performance</CardTitle>
        <CardDescription>Detailed breakdown by campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Campaigns ({allCampaigns.length})</TabsTrigger>
            <TabsTrigger value="google">Google Ads ({googleCampaigns.length})</TabsTrigger>
            <TabsTrigger value="meta">Meta Ads ({metaCampaigns.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <CampaignTable
              campaigns={allCampaigns}
              showSource
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="google">
            <CampaignTable
              campaigns={googleCampaigns}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              getStatusBadge={getStatusBadge}
              emptyMessage={
                googleData?.connected
                  ? "No active Google Ads campaigns"
                  : "Connect Google Ads to see campaigns"
              }
            />
          </TabsContent>

          <TabsContent value="meta">
            <CampaignTable
              campaigns={metaCampaigns}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
              getStatusBadge={getStatusBadge}
              emptyMessage={
                metaData?.connected
                  ? "No active Meta Ads campaigns"
                  : "Connect Meta Ads to see campaigns"
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface CampaignTableProps {
  campaigns: (Campaign & { source?: string })[];
  showSource?: boolean;
  formatCurrency: (num: number) => string;
  formatNumber: (num: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  emptyMessage?: string;
}

function CampaignTable({
  campaigns,
  showSource = false,
  formatCurrency,
  formatNumber,
  getStatusBadge,
  emptyMessage = "No campaigns to display",
}: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            {showSource && <TableHead>Source</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Impressions</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Spend</TableHead>
            <TableHead className="text-right">CTR</TableHead>
            <TableHead className="text-right">CPC</TableHead>
            <TableHead className="text-right">Conversions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign, index) => (
            <TableRow key={campaign.id || index} className="table-row-hover">
              <TableCell className="font-medium max-w-[200px] truncate">
                {campaign.name}
              </TableCell>
              {showSource && (
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {campaign.source}
                  </Badge>
                </TableCell>
              )}
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell className="text-right">{formatNumber(campaign.impressions)}</TableCell>
              <TableCell className="text-right">{formatNumber(campaign.clicks)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(campaign.spend || campaign.cost || 0)}
              </TableCell>
              <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{formatCurrency(campaign.cpc)}</TableCell>
              <TableCell className="text-right font-medium text-success">
                {campaign.conversions}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
