import { useOrg } from "@/contexts/OrgContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Users, Send, MapPin } from "lucide-react";

function useSendJimData() {
  const { currentOrg } = useOrg();
  return useQuery({
    queryKey: ["sendjim-summary", currentOrg?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sendjim-api/summary?org_id=${currentOrg!.id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!resp.ok) throw new Error("Failed to fetch SendJim data");
      return resp.json();
    },
    enabled: !!currentOrg,
  });
}

export default function MailersPage() {
  const { data, isLoading, error } = useSendJimData();
  const { currentOrg } = useOrg();

  // Also fetch marketing_leads with channel = direct_mail
  const { data: dmLeads } = useQuery({
    queryKey: ["direct-mail-leads", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      const { data } = await supabase
        .from("marketing_leads")
        .select("*")
        .eq("org_id", currentOrg.id)
        .eq("channel", "direct_mail")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!currentOrg,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contacts = data?.contacts;
  const mailings = data?.mailings;
  const neighborMailings = data?.neighborMailings;

  const contactCount = contacts?.data?.length ?? contacts?.meta?.total ?? 0;
  const mailingCount = mailings?.data?.length ?? mailings?.meta?.total ?? 0;
  const neighborCount = neighborMailings?.data?.length ?? neighborMailings?.meta?.total ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Direct Mail & Mailers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          SendJim postcard campaigns, contacts, and QR referral tracking
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Unable to load SendJim data. Make sure your API key is configured.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Contacts" value={contactCount} />
            <KpiCard icon={Send} label="Mailings Sent" value={mailingCount} />
            <KpiCard icon={MapPin} label="Neighbor Mailings" value={neighborCount} />
            <KpiCard icon={Mail} label="QR Leads" value={dmLeads?.length ?? 0} />
          </div>

          {/* Recent Mailings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Recent Mailings
                <Badge variant="outline" className="ml-auto text-[10px]">via SendJim</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mailings?.data?.length > 0 ? (
                <div className="space-y-2.5">
                  {mailings.data.slice(0, 10).map((m: any, i: number) => (
                    <div key={m.id || i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {m.contact?.first_name || m.first_name || "Contact"} {m.contact?.last_name || m.last_name || ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.template_name || m.mailing_type || "Postcard"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No mailings found.</p>
              )}
            </CardContent>
          </Card>

          {/* QR Code Referral Leads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                QR Referral Leads
                <Badge variant="outline" className="ml-auto text-[10px]">direct_mail channel</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dmLeads && dmLeads.length > 0 ? (
                <div className="space-y-2.5">
                  {dmLeads.slice(0, 10).map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.customer_name || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">{lead.source || "QR Scan"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={lead.status === "converted" ? "default" : "secondary"} className="text-[10px]">
                          {lead.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No QR referral leads yet. Share your /offer page to start tracking.</p>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                SendJim Contacts
                <Badge variant="outline" className="ml-auto text-[10px]">via SendJim</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts?.data?.length > 0 ? (
                <div className="space-y-2.5">
                  {contacts.data.slice(0, 10).map((c: any, i: number) => (
                    <div key={c.id || i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary/70 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {c.first_name || ""} {c.last_name || ""}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.address_1 || c.city || "No address"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No contacts found in SendJim.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground leading-none">{value.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
