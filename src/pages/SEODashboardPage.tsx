import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Globe, BarChart3, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { semrushApi } from "@/lib/api/semrush";

type SemrushRow = Record<string, string>;

export default function SEODashboardPage() {
  const { toast } = useToast();

  // Domain tab state
  const [domain, setDomain] = useState("igy6rooted.com");
  const [domainOverview, setDomainOverview] = useState<SemrushRow[] | null>(null);
  const [organicKeywords, setOrganicKeywords] = useState<SemrushRow[] | null>(null);
  const [domainLoading, setDomainLoading] = useState(false);

  // Keyword tab state
  const [keyword, setKeyword] = useState("");
  const [keywordResult, setKeywordResult] = useState<SemrushRow[] | null>(null);
  const [relatedKws, setRelatedKws] = useState<SemrushRow[] | null>(null);
  const [kwLoading, setKwLoading] = useState(false);

  // Competitor tab state
  const [compDomain, setCompDomain] = useState("");
  const [compResults, setCompResults] = useState<SemrushRow[] | null>(null);
  const [compLoading, setCompLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const runDomainAudit = async () => {
    if (!domain.trim()) return;
    setDomainLoading(true);
    setError(null);
    setDomainOverview(null);
    setOrganicKeywords(null);

    try {
      const [overviewRes, organicRes] = await Promise.all([
        semrushApi.domainOverview(domain.trim()),
        semrushApi.domainOrganic(domain.trim(), "us", 50),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setDomainOverview(overviewRes.data);
      } else {
        setError(overviewRes.error || "Failed to fetch domain overview");
      }

      if (organicRes.success && organicRes.data) {
        setOrganicKeywords(organicRes.data);
      }
    } catch (err) {
      setError("Failed to connect to Semrush API");
      toast({ title: "Error", description: "Failed to connect to Semrush API", variant: "destructive" });
    } finally {
      setDomainLoading(false);
    }
  };

  const runKeywordResearch = async () => {
    if (!keyword.trim()) return;
    setKwLoading(true);
    setError(null);
    setKeywordResult(null);
    setRelatedKws(null);

    try {
      const [kwRes, relatedRes] = await Promise.all([
        semrushApi.keywordOverview(keyword.trim()),
        semrushApi.relatedKeywords(keyword.trim(), "us", 20),
      ]);

      if (kwRes.success && kwRes.data) {
        setKeywordResult(kwRes.data);
      } else {
        setError(kwRes.error || "Failed to fetch keyword data");
      }

      if (relatedRes.success && relatedRes.data) {
        setRelatedKws(relatedRes.data);
      }
    } catch (err) {
      setError("Failed to connect to Semrush API");
    } finally {
      setKwLoading(false);
    }
  };

  const runCompetitorAnalysis = async () => {
    if (!compDomain.trim()) return;
    setCompLoading(true);
    setError(null);
    setCompResults(null);

    try {
      const res = await semrushApi.domainVsDomain(
        [domain.trim() || "igy6rooted.com", compDomain.trim()],
        "us",
        20
      );
      if (res.success && res.data) {
        setCompResults(res.data);
      } else {
        setError(res.error || "Failed to compare domains");
      }
    } catch (err) {
      setError("Failed to connect to Semrush API");
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>SEO Dashboard | IGY6 Rooted</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">SEO Dashboard</h1>
          <p className="text-muted-foreground">
            Powered by Semrush — track rankings, research keywords, and analyze competitors.
          </p>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="domain" className="space-y-6">
          <TabsList>
            <TabsTrigger value="domain" className="gap-2">
              <Globe className="h-4 w-4" />
              Domain Overview
            </TabsTrigger>
            <TabsTrigger value="keywords" className="gap-2">
              <Search className="h-4 w-4" />
              Keyword Research
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Competitor Analysis
            </TabsTrigger>
          </TabsList>

          {/* ── Domain Overview Tab ── */}
          <TabsContent value="domain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain Overview</CardTitle>
                <CardDescription>
                  See your organic rankings, traffic estimates, and top keywords.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="yourdomain.com"
                    className="max-w-md"
                  />
                  <Button onClick={runDomainAudit} disabled={domainLoading}>
                    {domainLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Domain"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {domainOverview && domainOverview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {domainOverview.map((row, i) => (
                  <div key={i} className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Database</p>
                        <p className="text-lg font-bold uppercase">{row.Db || "—"}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Organic Keywords</p>
                        <p className="text-lg font-bold">{Number(row.Or || 0).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Organic Traffic</p>
                        <p className="text-lg font-bold">{Number(row.Ot || 0).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Organic Cost ($)</p>
                        <p className="text-lg font-bold">${Number(row.Oc || 0).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {organicKeywords && organicKeywords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Organic Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead className="text-right">Position</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                          <TableHead className="text-right">CPC ($)</TableHead>
                          <TableHead className="text-right">Traffic %</TableHead>
                          <TableHead>URL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organicKeywords.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.Ph}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={Number(row.Po) <= 10 ? "default" : "secondary"}>
                                #{row.Po}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(row.Nq || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${Number(row.Cp || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">{row.Tr}%</TableCell>
                            <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {row.Ur}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Keyword Research Tab ── */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Research</CardTitle>
                <CardDescription>
                  Look up search volume, CPC, competition, and related keywords.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder='e.g. "stump grinding niceville fl"'
                    className="max-w-md"
                    onKeyDown={(e) => e.key === "Enter" && runKeywordResearch()}
                  />
                  <Button onClick={runKeywordResearch} disabled={kwLoading}>
                    {kwLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      "Research"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {keywordResult && keywordResult.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {keywordResult.map((row, i) => (
                  <div key={i} className="contents">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Keyword</p>
                        <p className="text-lg font-bold">{row.Ph}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Monthly Volume</p>
                        <p className="text-lg font-bold">{Number(row.Nq || 0).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">CPC ($)</p>
                        <p className="text-lg font-bold">${Number(row.Cp || 0).toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Competition</p>
                        <p className="text-lg font-bold">{Number(row.Co || 0).toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {relatedKws && relatedKws.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Related Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                          <TableHead className="text-right">CPC ($)</TableHead>
                          <TableHead className="text-right">Competition</TableHead>
                          <TableHead className="text-right">Results</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatedKws.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.Ph}</TableCell>
                            <TableCell className="text-right">
                              {Number(row.Nq || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${Number(row.Cp || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(row.Co || 0).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(row.Nr || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Competitor Analysis Tab ── */}
          <TabsContent value="competitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>
                  Compare your domain against a competitor to find shared and unique keywords.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Your domain"
                    className="max-w-xs"
                  />
                  <span className="self-center text-muted-foreground font-medium">vs</span>
                  <Input
                    value={compDomain}
                    onChange={(e) => setCompDomain(e.target.value)}
                    placeholder="Competitor domain"
                    className="max-w-xs"
                  />
                  <Button onClick={runCompetitorAnalysis} disabled={compLoading}>
                    {compLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Comparing...
                      </>
                    ) : (
                      "Compare"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {compResults && compResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shared Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead className="text-right">Your Position</TableHead>
                          <TableHead className="text-right">Their Position</TableHead>
                          <TableHead className="text-right">Volume</TableHead>
                          <TableHead className="text-right">CPC ($)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compResults.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{row.Ph}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={Number(row.P0) <= 10 ? "default" : "secondary"}>
                                #{row.P0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={Number(row.P1) <= 10 ? "default" : "secondary"}>
                                #{row.P1}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(row.Nq || 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${Number(row.Cp || 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
