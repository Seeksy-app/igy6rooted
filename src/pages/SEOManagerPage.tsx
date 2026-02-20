import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Pencil, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function SEOManagerPage() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: pages, isLoading } = useQuery({
    queryKey: ["seo-pages", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data, error } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("page_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg,
  });

  const filtered = (pages || []).filter((p: any) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.page_name.toLowerCase().includes(q) ||
        p.route_path.toLowerCase().includes(q) ||
        (p.meta_title || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <>
      <Helmet>
        <title>SEO Manager | IGY6 Rooted</title>
      </Helmet>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SEO Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage SEO metadata for all pages
            </p>
          </div>
          <Button onClick={() => navigate("/seo-manager/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Add Page SEO
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route, name, or title..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {pages?.length === 0 ? "No SEO pages yet" : "No pages match your search"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Click "Add Page SEO" to get started
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Page Name</TableHead>
                  <TableHead className="font-semibold">Route Path</TableHead>
                  <TableHead className="font-semibold">SEO Score</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Updated</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((page: any) => (
                  <TableRow key={page.id} className="cursor-pointer hover:bg-muted/20" onClick={() => navigate(`/seo-manager/${page.id}`)}>
                    <TableCell className="font-medium">{page.page_name}</TableCell>
                    <TableCell className="text-muted-foreground">{page.route_path}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={page.seo_score} className={`h-2 w-16 [&>div]:${getScoreColor(page.seo_score)}`} />
                        <span className="text-sm font-medium">{page.seo_score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={page.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(page.updated_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/seo-manager/${page.id}`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
