import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Globe, BarChart3, Search, Megaphone, Share2, Database, ChevronRight, ChevronLeft, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "core", label: "Brand & Domain", icon: Globe },
  { id: "analytics", label: "Analytics & SEO", icon: BarChart3 },
  { id: "ads", label: "Ad Accounts", icon: Megaphone },
  { id: "social", label: "Social Profiles", icon: Share2 },
  { id: "crm", label: "CRM & Notes", icon: Database },
];

interface FormData {
  domain: string;
  brand_name: string;
  industry: string;
  ga4_measurement_id: string;
  ga4_property_id: string;
  search_console_property: string;
  semrush_project_id: string;
  google_ads_cid: string;
  meta_ad_account_id: string;
  google_business_profile_url: string;
  facebook_page_url: string;
  instagram_handle: string;
  linkedin_url: string;
  youtube_channel_url: string;
  tiktok_handle: string;
  x_handle: string;
  crm_platform: string;
  crm_account_id: string;
  notes: string;
}

const emptyForm: FormData = {
  domain: "", brand_name: "", industry: "",
  ga4_measurement_id: "", ga4_property_id: "", search_console_property: "", semrush_project_id: "",
  google_ads_cid: "", meta_ad_account_id: "",
  google_business_profile_url: "", facebook_page_url: "", instagram_handle: "",
  linkedin_url: "", youtube_channel_url: "", tiktok_handle: "", x_handle: "",
  crm_platform: "", crm_account_id: "", notes: "",
};

export default function SEOOnboardingPage() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);

  const update = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const saveProfile = async (completed: boolean) => {
    if (!currentOrg) return;
    if (!form.domain || !form.brand_name) {
      toast.error("Domain and Brand Name are required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("seo_client_profiles").insert({
      org_id: currentOrg.id,
      ...form,
      onboarding_completed: completed,
    } as any);
    setSaving(false);
    if (error) {
      if (error.code === "23505") toast.error("A profile for this domain already exists");
      else toast.error(error.message);
      return;
    }
    toast.success(completed ? "Client profile created!" : "Progress saved!");
    navigate(completed ? "/llm-presence" : "/dashboard");
  };

  const handleSave = () => saveProfile(true);
  const handleSaveAndExit = () => saveProfile(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">SEO Client Onboarding</h1>
        <p className="text-muted-foreground">Capture the full marketing stack for a new client.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              i === step ? "bg-accent text-accent-foreground" : i < step ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
            )}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-accent" />; })()}
            {STEPS[step].label}
          </CardTitle>
          <CardDescription>
            {step === 0 && "Enter the client's domain and brand identity."}
            {step === 1 && "Connect analytics and SEO tool credentials."}
            {step === 2 && "Link advertising accounts for performance tracking."}
            {step === 3 && "Add social media profiles for presence monitoring."}
            {step === 4 && "CRM connection and any additional notes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <Field label="Domain *" placeholder="igy6rooted.com" value={form.domain} onChange={(v) => update("domain", v)} />
              <Field label="Brand Name *" placeholder="IGY6 Rooted" value={form.brand_name} onChange={(v) => update("brand_name", v)} />
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {["Tree Service", "Landscaping", "Home Services", "Construction", "Roofing", "HVAC", "Plumbing", "Electrical", "Real Estate", "Legal", "Medical", "Other"].map((i) => (
                      <SelectItem key={i} value={i.toLowerCase().replace(/ /g, "-")}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="GA4 Measurement ID" placeholder="G-XXXXXXXXXX" value={form.ga4_measurement_id} onChange={(v) => update("ga4_measurement_id", v)} />
              <Field label="GA4 Property ID" placeholder="123456789" value={form.ga4_property_id} onChange={(v) => update("ga4_property_id", v)} />
              <Field label="Search Console Property" placeholder="https://igy6rooted.com" value={form.search_console_property} onChange={(v) => update("search_console_property", v)} />
              <Field label="Semrush Project ID" placeholder="12345" value={form.semrush_project_id} onChange={(v) => update("semrush_project_id", v)} />
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Google Ads Customer ID" placeholder="123-456-7890" value={form.google_ads_cid} onChange={(v) => update("google_ads_cid", v)} />
              <Field label="Meta Ad Account ID" placeholder="act_123456789" value={form.meta_ad_account_id} onChange={(v) => update("meta_ad_account_id", v)} />
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Google Business Profile URL" placeholder="https://business.google.com/..." value={form.google_business_profile_url} onChange={(v) => update("google_business_profile_url", v)} />
              <Field label="Facebook Page URL" placeholder="https://facebook.com/..." value={form.facebook_page_url} onChange={(v) => update("facebook_page_url", v)} />
              <Field label="Instagram Handle" placeholder="@igy6rooted" value={form.instagram_handle} onChange={(v) => update("instagram_handle", v)} />
              <Field label="LinkedIn URL" placeholder="https://linkedin.com/company/..." value={form.linkedin_url} onChange={(v) => update("linkedin_url", v)} />
              <Field label="YouTube Channel" placeholder="https://youtube.com/@..." value={form.youtube_channel_url} onChange={(v) => update("youtube_channel_url", v)} />
              <Field label="TikTok Handle" placeholder="@igy6rooted" value={form.tiktok_handle} onChange={(v) => update("tiktok_handle", v)} />
              <Field label="X (Twitter) Handle" placeholder="@igy6rooted" value={form.x_handle} onChange={(v) => update("x_handle", v)} />
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label>CRM Platform</Label>
                <Select value={form.crm_platform} onValueChange={(v) => update("crm_platform", v)}>
                  <SelectTrigger><SelectValue placeholder="Select CRM" /></SelectTrigger>
                  <SelectContent>
                    {["Jobber", "HubSpot", "Salesforce", "ServiceTitan", "Housecall Pro", "GoHighLevel", "None", "Other"].map((c) => (
                      <SelectItem key={c} value={c.toLowerCase().replace(/ /g, "-")}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field label="CRM Account / API ID" placeholder="Optional" value={form.crm_account_id} onChange={(v) => update("crm_account_id", v)} />
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Anything else about this client..." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button variant="ghost" onClick={handleSaveAndExit} disabled={saving}>
            <Save className="mr-1 h-4 w-4" /> Save & Exit
          </Button>
        </div>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Complete Onboarding"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
