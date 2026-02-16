import { useOrg } from "@/contexts/OrgContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Users, Send, FileText } from "lucide-react";

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
  const quicksends = data?.quicksends;

  // Handle both array and object with nested data
  const contactList = Array.isArray(contacts) ? contacts : (contacts?.data || contacts?.Contacts || []);
  const quicksendList = quicksends?.QuickSends || (Array.isArray(quicksends) ? quicksends : []);

  const contactCount = contactList.length || contacts?.meta?.total || 0;
  const quicksendCount = quicksendList.length;

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <KpiCard icon={Users} label="Contacts" value={contactCount} />
            <KpiCard icon={FileText} label="Quick Sends" value={quicksendCount} />
            <KpiCard icon={Mail} label="QR Leads" value={dmLeads?.length ?? 0} />
          </div>

          {/* Quick Sends / Templates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Quick Send Templates
                <Badge variant="outline" className="ml-auto text-[10px]">via SendJim</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quicksendList.length > 0 ? (
                <div className="space-y-2.5">
                  {quicksendList.slice(0, 10).map((qs: any, i: number) => (
                    <div key={qs.QuickSendID || i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {qs.Name || "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {qs.QuickSendSequences?.[0]?.QuickSendType || "Postcard"} · {qs.TotalCreditCost ?? 0} credits
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {qs.NumberInSequence > 1 ? `${qs.NumberInSequence} steps` : "Single"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No quick send templates found.</p>
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
              {contactList.length > 0 ? (
                <div className="space-y-2.5">
                  {contactList.slice(0, 10).map((c: any, i: number) => (
                    <div key={c.ContactID || c.id || i} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary/70 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {c.FirstName || c.first_name || ""} {c.LastName || c.last_name || ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.City || c.city || c.StreetAddress || c.address_1 || "No address"}
                            {(c.State || c.state) ? `, ${c.State || c.state}` : ""}
                          </p>
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
