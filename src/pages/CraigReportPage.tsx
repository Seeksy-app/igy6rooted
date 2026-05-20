import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Eye, MousePointerClick, Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

/**
 * Internal stakeholder report for Craig — totals + recommendations across
 * Meta Ads and Google Ads. Hardcoded snapshot, not live data.
 * Update the META_ADS / GOOGLE_ADS objects when new numbers come in.
 */

const META_ADS = {
  dateRange: "Apr 20 – May 19, 2026 (Last 30 days)",
  spend: 115.17,
  impressions: 3707,
  reach: 2072,
  linkClicks: 44,
  postEngagement: 60, // 10+13+23+2+6+2+3
  ads: [
    { name: "Daily Tree Removal v5", spend: 37.93, impressions: 1175, reach: 792, clicks: 17, cpc: 2.23, comments: 5, verdict: "winner" },
    { name: "Daily Tree Removal v7", spend: 17.36, impressions: 521, reach: 360, clicks: 6, cpc: 2.89, comments: 0, verdict: "ok" },
    { name: "Daily Tree Removal v1", spend: 16.20, impressions: 606, reach: 375, clicks: 7, cpc: 2.31, comments: 5, verdict: "ok" },
    { name: "Daily Tree Removal v2", spend: 14.03, impressions: 446, reach: 306, clicks: 8, cpc: 1.75, comments: 2, verdict: "winner" },
    { name: "Daily Tree Removal-v3", spend: 11.75, impressions: 336, reach: 257, clicks: 2, cpc: 5.88, comments: 0, verdict: "kill" },
    { name: "Daily Tree Removal v6", spend: 10.39, impressions: 361, reach: 284, clicks: 3, cpc: 3.46, comments: 0, verdict: "weak" },
    { name: "Daily Tree Removal v4", spend: 7.51, impressions: 262, reach: 198, clicks: 1, cpc: 7.51, comments: 1, verdict: "kill" },
  ],
};

// TODO: Plug in once we get the Google Ads numbers from Craig
const GOOGLE_ADS = {
  dateRange: "Apr 20 – May 19, 2026 (Last 30 days)",
  spend: null as number | null,
  impressions: null as number | null,
  clicks: null as number | null,
  conversions: null as number | null,
  notes: "Google Ads data pending — will populate once shared.",
};

const fmt$ = (n: number | null) => (n == null ? "—" : `$${n.toFixed(2)}`);
const fmtN = (n: number | null) => (n == null ? "—" : n.toLocaleString());

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    winner: { label: "Winner", cls: "bg-green-100 text-green-800 border-green-300" },
    ok: { label: "OK", cls: "bg-blue-100 text-blue-800 border-blue-300" },
    weak: { label: "Below avg", cls: "bg-amber-100 text-amber-800 border-amber-300" },
    kill: { label: "Kill", cls: "bg-red-100 text-red-800 border-red-300" },
  };
  const v = map[verdict] || map.ok;
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

export default function CraigReportPage() {
  const meta = META_ADS;
  const google = GOOGLE_ADS;

  const totalSpend = meta.spend + (google.spend || 0);
  const totalImpressions = meta.impressions + (google.impressions || 0);
  const totalClicks = meta.linkClicks + (google.clicks || 0);
  const totalConversions = 0 + (google.conversions || 0);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-foreground">IGY6 Rooted — Paid Ads Report</h1>
          <p className="text-muted-foreground mt-1">Meta + Google Ads snapshot · {meta.dateRange}</p>
        </div>

        {/* Combined totals */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Combined totals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Total spend</span>
                </div>
                <div className="text-2xl font-bold mt-2">{fmt$(totalSpend)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Eye className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Impressions</span>
                </div>
                <div className="text-2xl font-bold mt-2">{fmtN(totalImpressions)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <MousePointerClick className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Clicks</span>
                </div>
                <div className="text-2xl font-bold mt-2">{fmtN(totalClicks)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Conversions</span>
                </div>
                <div className="text-2xl font-bold mt-2">{fmtN(totalConversions)}</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Meta Ads */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Meta (Facebook + Instagram)</h2>
            <Badge variant="secondary">{meta.dateRange}</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Spend</div><div className="text-xl font-bold mt-1">{fmt$(meta.spend)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Impressions</div><div className="text-xl font-bold mt-1">{fmtN(meta.impressions)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Reach</div><div className="text-xl font-bold mt-1">{fmtN(meta.reach)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Link clicks</div><div className="text-xl font-bold mt-1">{fmtN(meta.linkClicks)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Avg CPC</div><div className="text-xl font-bold mt-1">{fmt$(meta.spend / meta.linkClicks)}</div></CardContent></Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Per-ad breakdown</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-4">Ad</th>
                    <th className="py-2 pr-4 text-right">Spend</th>
                    <th className="py-2 pr-4 text-right">Impr.</th>
                    <th className="py-2 pr-4 text-right">Clicks</th>
                    <th className="py-2 pr-4 text-right">CPC</th>
                    <th className="py-2 pr-4 text-right">Comments</th>
                    <th className="py-2 pr-4">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.ads.map((ad) => (
                    <tr key={ad.name} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 font-medium">{ad.name}</td>
                      <td className="py-2 pr-4 text-right">{fmt$(ad.spend)}</td>
                      <td className="py-2 pr-4 text-right">{fmtN(ad.impressions)}</td>
                      <td className="py-2 pr-4 text-right">{fmtN(ad.clicks)}</td>
                      <td className="py-2 pr-4 text-right">{fmt$(ad.cpc)}</td>
                      <td className="py-2 pr-4 text-right">{ad.comments}</td>
                      <td className="py-2 pr-4"><VerdictBadge verdict={ad.verdict} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Google Ads */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Google Ads</h2>
            <Badge variant="secondary">{google.dateRange}</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Spend</div><div className="text-xl font-bold mt-1">{fmt$(google.spend)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Impressions</div><div className="text-xl font-bold mt-1">{fmtN(google.impressions)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Clicks</div><div className="text-xl font-bold mt-1">{fmtN(google.clicks)}</div></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Conversions</div><div className="text-xl font-bold mt-1">{fmtN(google.conversions)}</div></CardContent></Card>
          </div>
          {!google.spend && (
            <p className="text-sm text-muted-foreground mt-3 italic">{google.notes}</p>
          )}
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recommendations for Craig</h2>
          <div className="space-y-3">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6 flex gap-3">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">1. Kill v3 and v4 immediately</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    v3 ($5.88 CPC) and v4 ($7.51 CPC) are burning ~$30/day at 3–4× the cost of our winners. Pause them and redistribute the budget.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6 flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">2. Double down on v2 and v5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    v2 ($1.75 CPC) and v5 ($2.23 CPC, 17 clicks, 5 comments) are clear winners. Move the paused budget into these two — bump each to $25–30/day.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">3. The real problem: 0 conversions on 44 clicks</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Meta is delivering traffic — the landing page or form is where leads are dropping off. The Meta Pixel is now live tracking <code className="text-xs bg-muted px-1 rounded">PageView</code> + <code className="text-xs bg-muted px-1 rounded">Lead</code> events, so we'll see exactly where in the funnel people leave starting now.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">4. Give the new "tree danger" video 3–5 days</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Just published, in processing. Meta's learning phase needs ~50 conversions or ~1,000 impressions before the algorithm dials in. Don't judge it before May 24.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex gap-3">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">5. Connect ad accounts to the dashboard</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Once Meta + Google are linked in Integrations, this report becomes live and we stop pulling screenshots manually.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="text-xs text-muted-foreground text-center pt-8 border-t border-border">
          Internal report · IGY6 Rooted · Generated for review with Craig
        </div>
      </div>
    </div>
  );
}
