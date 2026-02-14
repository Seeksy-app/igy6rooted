import { useEffect, useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play, Brain, Eye, ThumbsUp, ThumbsDown, Minus, Link2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientProfile {
  id: string;
  domain: string;
  brand_name: string;
  industry: string | null;
}

interface ScanResult {
  id: string;
  model_name: string;
  prompt_text: string;
  prompt_category: string | null;
  brand_mentioned: boolean;
  brand_position: number | null;
  sentiment: string | null;
  sentiment_score: number | null;
  citation_found: boolean;
  citation_url: string | null;
  competitor_mentions: any;
  presence_score: number | null;
  response_text: string;
}

interface Scan {
  id: string;
  status: string;
  overall_brand_score: number | null;
  models_queried: string[];
  created_at: string;
  completed_at: string | null;
}

const SENTIMENT_CONFIG: Record<string, { icon: any; color: string }> = {
  positive: { icon: ThumbsUp, color: "text-[hsl(var(--success))]" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
  negative: { icon: ThumbsDown, color: "text-destructive" },
};

export default function LLMPresencePage() {
  const { currentOrg } = useOrg();
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [scans, setScans] = useState<Scan[]>([]);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    (async () => {
      const { data } = await supabase
        .from("seo_client_profiles")
        .select("id, domain, brand_name, industry")
        .eq("org_id", currentOrg.id) as any;
      setProfiles(data || []);
      if (data?.[0]) setSelectedProfile(data[0].id);
      setLoading(false);
    })();
  }, [currentOrg]);

  useEffect(() => {
    if (!selectedProfile || !currentOrg) return;
    loadScans();
  }, [selectedProfile]);

  const loadScans = async () => {
    const { data: scanData } = await supabase
      .from("llm_brand_scans")
      .select("*")
      .eq("client_profile_id", selectedProfile)
      .order("created_at", { ascending: false })
      .limit(10) as any;
    setScans(scanData || []);
    
    if (scanData?.[0]) {
      const { data: resultData } = await supabase
        .from("llm_brand_results")
        .select("*")
        .eq("scan_id", scanData[0].id) as any;
      setResults(resultData || []);
    } else {
      setResults([]);
    }
  };

  const runScan = async () => {
    if (!selectedProfile || !currentOrg) return;
    setScanning(true);
    try {
      const res = await supabase.functions.invoke("llm-brand-scan", {
        body: { client_profile_id: selectedProfile, org_id: currentOrg.id },
      });
      if (res.error) throw new Error(res.error.message);
      toast.success("Scan complete!");
      await loadScans();
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    }
    setScanning(false);
  };

  const latestScan = scans[0];
  const overallScore = latestScan?.overall_brand_score ?? 0;

  // Group results by model
  const byModel = results.reduce<Record<string, ScanResult[]>>((acc, r) => {
    (acc[r.model_name] = acc[r.model_name] || []).push(r);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-6 p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-warning" />
        <h2 className="text-xl font-semibold">No Client Profiles</h2>
        <p className="text-muted-foreground">Create a client profile first via SEO Onboarding to run LLM presence scans.</p>
        <Button onClick={() => window.location.href = "/seo-onboarding"}>Go to Onboarding</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">LLM Search Presence</h1>
          <p className="text-muted-foreground">Monitor how AI models represent your brand.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.brand_name} — {p.domain}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runScan} disabled={scanning}>
            {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {scanning ? "Scanning..." : "Run Scan"}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      {latestScan && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription>Brand Health Score</CardDescription>
              <CardTitle className="text-4xl font-bold">{Math.round(overallScore)}<span className="text-lg text-muted-foreground">/100</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={overallScore} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Last scan: {new Date(latestScan.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Models Queried</CardDescription>
              <CardTitle className="text-3xl">{latestScan.models_queried?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {latestScan.models_queried?.map((m: string) => (
                  <Badge key={m} variant="secondary" className="text-xs">{m.split("/")[1] || m}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Brand Mentions</CardDescription>
              <CardTitle className="text-3xl">
                {results.filter((r) => r.brand_mentioned).length}/{results.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={results.length ? (results.filter((r) => r.brand_mentioned).length / results.length) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Citations Found</CardDescription>
              <CardTitle className="text-3xl">
                {results.filter((r) => r.citation_found).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" /> Direct links to your domain
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results by Model */}
      {Object.entries(byModel).map(([model, modelResults]) => {
        const mentioned = modelResults.filter((r) => r.brand_mentioned).length;
        const avgScore = modelResults.reduce((s, r) => s + (r.presence_score || 0), 0) / modelResults.length;
        
        return (
          <Card key={model}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  <CardTitle className="text-base">{model}</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={mentioned === modelResults.length ? "default" : "secondary"}>
                    {mentioned}/{modelResults.length} mentions
                  </Badge>
                  <span className="text-sm font-semibold">{Math.round(avgScore)}/100</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modelResults.map((r) => {
                  const sentCfg = SENTIMENT_CONFIG[r.sentiment || "neutral"] || SENTIMENT_CONFIG.neutral;
                  const SentIcon = sentCfg.icon;
                  return (
                    <div key={r.id} className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{r.prompt_text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <SentIcon className={cn("h-4 w-4", sentCfg.color)} />
                          {r.brand_mentioned ? (
                            <Badge variant="default" className="text-xs">Mentioned{r.brand_position ? ` #${r.brand_position}` : ""}</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not mentioned</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">{r.response_text}</p>
                      {r.citation_found && r.citation_url && (
                        <div className="flex items-center gap-1 text-xs text-accent">
                          <Link2 className="h-3 w-3" /> {r.citation_url}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {results.length === 0 && !scanning && (
        <Card>
          <CardContent className="py-12 text-center">
            <Eye className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No scan results yet. Click "Run Scan" to check your brand's LLM presence.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
