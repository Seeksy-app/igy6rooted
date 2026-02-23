import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrg } from "@/contexts/OrgContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, XCircle, Globe, Twitter, Sparkles,
} from "lucide-react";

interface SeoForm {
  route_path: string;
  page_name: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  robots: string;
  h1_override: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_image_alt: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image_url: string;
  twitter_image_alt: string;
  status: string;
  page_content: string;
}

const defaultForm: SeoForm = {
  route_path: "/",
  page_name: "",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  robots: "index, follow",
  h1_override: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  og_image_alt: "",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image_url: "",
  twitter_image_alt: "",
  status: "draft",
  page_content: "",
};

function computeSeoScore(form: SeoForm): { score: number; checks: { label: string; status: "pass" | "warn" | "fail"; detail: string }[] } {
  const checks: { label: string; status: "pass" | "warn" | "fail"; detail: string }[] = [];

  // Meta title
  const titleLen = (form.meta_title || "").length;
  if (titleLen > 0 && titleLen <= 60) checks.push({ label: "Meta Title", status: "pass", detail: "Good length (under 60 chars)" });
  else if (titleLen > 60) checks.push({ label: "Meta Title", status: "warn", detail: `Too long (${titleLen}/60 chars)` });
  else checks.push({ label: "Meta Title", status: "fail", detail: "Missing meta title" });

  // Meta description
  const descLen = (form.meta_description || "").length;
  if (descLen >= 120 && descLen <= 160) checks.push({ label: "Meta Description", status: "pass", detail: `Good length (${descLen}/160 chars)` });
  else if (descLen > 0 && descLen < 120) checks.push({ label: "Meta Description", status: "warn", detail: `Too short (${descLen}/120 chars)` });
  else if (descLen > 160) checks.push({ label: "Meta Description", status: "warn", detail: `Too long (${descLen}/160 chars)` });
  else checks.push({ label: "Meta Description", status: "fail", detail: "Missing meta description" });

  // H1
  if (form.h1_override) checks.push({ label: "H1 Heading", status: "pass", detail: "H1 is defined" });
  else checks.push({ label: "H1 Heading", status: "warn", detail: "No H1 override set" });

  // OG Title
  if (form.og_title) checks.push({ label: "OG Title", status: "pass", detail: "Open Graph title set" });
  else checks.push({ label: "OG Title", status: "warn", detail: "Missing OG title" });

  // OG Description
  if (form.og_description) checks.push({ label: "OG Description", status: "pass", detail: "Open Graph description set" });
  else checks.push({ label: "OG Description", status: "warn", detail: "Missing OG description" });

  // OG Image
  if (form.og_image_url) checks.push({ label: "OG Image", status: "pass", detail: "OG image set" });
  else checks.push({ label: "OG Image", status: "fail", detail: "Missing OG image" });

  // Twitter Card
  if (form.twitter_title || form.twitter_card) checks.push({ label: "Twitter Card", status: "pass", detail: "Twitter metadata set" });
  else checks.push({ label: "Twitter Card", status: "warn", detail: "Missing Twitter card data" });

  // Structured Data - just warn for now
  checks.push({ label: "Structured Data", status: "warn", detail: "No structured data (coming soon)" });

  const total = checks.length;
  const passed = checks.filter(c => c.status === "pass").length;
  const score = Math.round((passed / total) * 100);

  return { score, checks };
}

export default function SEOPageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const [form, setForm] = useState<SeoForm>({ ...defaultForm });
  const [generating, setGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!form.page_name && !form.route_path) {
      toast.error("Enter a page name and route path first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("seo-ai-generate", {
        body: { page_name: form.page_name, route_path: form.route_path, business_name: "IGY6 Rooted" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm(f => ({
        ...f,
        meta_title: data.meta_title || f.meta_title,
        meta_description: data.meta_description || f.meta_description,
        h1_override: data.h1_override || f.h1_override,
        og_title: data.og_title || f.og_title,
        og_description: data.og_description || f.og_description,
        twitter_title: data.twitter_title || f.twitter_title,
        twitter_description: data.twitter_description || f.twitter_description,
      }));
      toast.success("SEO content generated! Review and save.");
    } catch (e: any) {
      toast.error(e.message || "AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const { data: existing, isLoading } = useQuery({
    queryKey: ["seo-page", id],
    queryFn: async () => {
      if (isNew || !id) return null;
      const { data, error } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        route_path: existing.route_path || "/",
        page_name: existing.page_name || "",
        meta_title: existing.meta_title || "",
        meta_description: existing.meta_description || "",
        canonical_url: existing.canonical_url || "",
        robots: existing.robots || "index, follow",
        h1_override: existing.h1_override || "",
        og_title: existing.og_title || "",
        og_description: existing.og_description || "",
        og_image_url: existing.og_image_url || "",
        og_image_alt: existing.og_image_alt || "",
        twitter_card: existing.twitter_card || "summary_large_image",
        twitter_title: existing.twitter_title || "",
        twitter_description: existing.twitter_description || "",
        twitter_image_url: existing.twitter_image_url || "",
        twitter_image_alt: existing.twitter_image_alt || "",
        status: existing.status || "draft",
        page_content: existing.page_content ? JSON.stringify(existing.page_content, null, 2) : "",
      });
    }
  }, [existing]);

  const { score, checks } = useMemo(() => computeSeoScore(form), [form]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No org");
      if (!form.route_path || !form.page_name) throw new Error("Route path and page name are required");

      let parsedContent = null;
      if (form.page_content.trim()) {
        try {
          parsedContent = JSON.parse(form.page_content);
        } catch {
          throw new Error("Page Content JSON is invalid. Please fix before saving.");
        }
      }

      const { page_content, ...rest } = form;
      const payload = {
        org_id: currentOrg.id,
        ...rest,
        page_content: parsedContent,
        seo_score: score,
      };

      if (isNew) {
        const { error } = await supabase.from("seo_pages").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seo_pages").update(payload).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-pages"] });
      queryClient.invalidateQueries({ queryKey: ["seo-page", id] });
      toast.success(isNew ? "Page SEO created!" : "Page SEO updated!");
      if (isNew) navigate("/seo-manager");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = () => {
    setForm(f => ({ ...f, status: f.status === "published" ? "draft" : "published" }));
  };

  const update = (field: keyof SeoForm, value: string) => setForm(f => ({ ...f, [field]: value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getStatusIcon = (status: "pass" | "warn" | "fail") => {
    if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (status === "warn") return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const publishedUrl = "https://igy6rooted.lovable.app";

  return (
    <>
      <Helmet>
        <title>{isNew ? "Add Page SEO" : `Edit: ${form.page_name}`} | IGY6 Rooted</title>
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/seo-manager")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{isNew ? "Add Page SEO" : "Edit Page SEO"}</h1>
              <Badge variant={form.status === "published" ? "default" : "secondary"} className="mt-1">
                {form.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={generateWithAI} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate with AI
            </Button>
            <Button variant="outline" onClick={toggleStatus}>
              {form.status === "published" ? "Revert to Draft" : "Publish"}
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column — Page Info */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Information</CardTitle>
                <CardDescription>Basic page identification and SEO settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Route Path *</Label>
                  <Input
                    value={form.route_path}
                    onChange={(e) => update("route_path", e.target.value)}
                    placeholder="/"
                    disabled={!isNew && form.status === "published"}
                  />
                  {!isNew && form.status === "published" && (
                    <p className="text-xs text-destructive mt-1">Cannot change route path after publishing</p>
                  )}
                </div>

                <div>
                  <Label>Page Name *</Label>
                  <Input value={form.page_name} onChange={(e) => update("page_name", e.target.value)} placeholder="Home" />
                </div>

                <div>
                  <Label>Meta Title <span className="text-muted-foreground text-xs">({(form.meta_title || "").length}/70)</span></Label>
                  <Input value={form.meta_title} onChange={(e) => update("meta_title", e.target.value)} placeholder="Page Title | Brand" />
                </div>

                <div>
                  <Label>Meta Description <span className="text-muted-foreground text-xs">({(form.meta_description || "").length}/170)</span></Label>
                  <Textarea
                    value={form.meta_description}
                    onChange={(e) => update("meta_description", e.target.value)}
                    placeholder="A compelling description for search results..."
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Canonical URL</Label>
                  <Input value={form.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} placeholder="Leave blank to auto-generate" />
                </div>

                <div>
                  <Label>Robots</Label>
                  <Select value={form.robots} onValueChange={(v) => update("robots", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">index, follow</SelectItem>
                      <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                      <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                      <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>H1 Override</Label>
                  <Input value={form.h1_override} onChange={(e) => update("h1_override", e.target.value)} placeholder="Main heading for the page" />
                </div>
              </CardContent>
            </Card>

            {/* Page Content JSON */}
            <Card>
              <CardHeader>
                <CardTitle>Page Content (JSON)</CardTitle>
                <CardDescription>
                  Paste article body as JSON. Expected format: <code className="text-xs bg-muted px-1 py-0.5 rounded">{"{ \"sections\": [{ \"heading\": \"...\", \"content\": \"...\" }], \"benefits\": [\"...\"], \"cta\": { \"text\": \"...\", \"url\": \"...\" } }"}</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.page_content}
                  onChange={(e) => update("page_content", e.target.value)}
                  placeholder='{\n  "sections": [\n    { "heading": "Why Choose Us", "content": "..." }\n  ],\n  "benefits": ["Licensed & Insured", "Free Estimates"],\n  "cta": { "text": "Get a Free Quote", "url": "/contact" }\n}'
                  className="min-h-[200px] font-mono text-sm"
                />
                {form.page_content.trim() && (() => {
                  try { JSON.parse(form.page_content); return <p className="text-xs text-emerald-600 mt-1">✓ Valid JSON</p>; }
                  catch { return <p className="text-xs text-destructive mt-1">✗ Invalid JSON — fix before saving</p>; }
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Right column — Analysis + OG + Twitter + Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* SEO Score */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Analysis</CardTitle>
                <CardDescription>How well optimized is this page?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold">{score}%</span>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">SEO Score</p>
                    <Progress
                      value={score}
                      className={`h-3 [&>div]:${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(check.status)}
                      <span className="font-medium">{check.label}</span>
                      <span className="text-muted-foreground text-xs">{check.detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OpenGraph */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> OpenGraph</CardTitle>
                <CardDescription>Social sharing preview for Facebook, LinkedIn, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>OG Title</Label>
                  <Input value={form.og_title} onChange={(e) => update("og_title", e.target.value)} placeholder={form.meta_title || "Same as meta title"} />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea value={form.og_description} onChange={(e) => update("og_description", e.target.value)} placeholder="Description for social sharing" className="min-h-[60px]" />
                </div>
                <div>
                  <Label>OG Image URL</Label>
                  <Input value={form.og_image_url} onChange={(e) => update("og_image_url", e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <Label>OG Image Alt</Label>
                  <Input value={form.og_image_alt} onChange={(e) => update("og_image_alt", e.target.value)} placeholder="Image description" />
                </div>
              </CardContent>
            </Card>

            {/* Twitter Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Twitter className="h-5 w-5" /> Twitter Card</CardTitle>
                <CardDescription>Preview when shared on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Card Type</Label>
                  <Select value={form.twitter_card} onValueChange={(v) => update("twitter_card", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Twitter Title</Label>
                  <Input value={form.twitter_title} onChange={(e) => update("twitter_title", e.target.value)} placeholder={form.og_title || "Same as OG title"} />
                </div>
                <div>
                  <Label>Twitter Description</Label>
                  <Textarea value={form.twitter_description} onChange={(e) => update("twitter_description", e.target.value)} placeholder="Description for Twitter" className="min-h-[60px]" />
                </div>
                <div>
                  <Label>Twitter Image URL</Label>
                  <Input value={form.twitter_image_url} onChange={(e) => update("twitter_image_url", e.target.value)} placeholder="Defaults to OG image" />
                </div>
                <div>
                  <Label>Twitter Image Alt</Label>
                  <Input value={form.twitter_image_alt} onChange={(e) => update("twitter_image_alt", e.target.value)} placeholder="Defaults to OG image alt" />
                </div>
              </CardContent>
            </Card>

            {/* Search Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Search Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-background space-y-1">
                  <p className="text-lg text-blue-700 hover:underline cursor-pointer font-medium leading-tight">
                    {form.meta_title || form.page_name || "Page Title"}
                  </p>
                  <p className="text-sm text-emerald-700">
                    {publishedUrl}{form.route_path}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {form.meta_description || "No meta description set..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
