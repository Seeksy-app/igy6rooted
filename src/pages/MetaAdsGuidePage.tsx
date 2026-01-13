import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  FileText, 
  Link2, 
  TestTube, 
  Rocket,
  Lightbulb,
  ExternalLink
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const checklistData: ChecklistSection[] = [
  {
    id: "create-ad",
    title: "1. Create Your Lead Ad in Meta Ads Manager",
    icon: <Target className="h-5 w-5" />,
    items: [
      { id: "goto-ads", label: "Go to ads.facebook.com", description: "Access Meta Ads Manager" },
      { id: "create-campaign", label: 'Click "Create" and select "Leads" as your campaign objective' },
      { id: "set-audience", label: "Set your audience, budget, and schedule" },
      { id: "design-creative", label: "Design your ad creative (image/video + text)" },
    ],
  },
  {
    id: "build-form",
    title: "2. Build Your Lead Form",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { id: "instant-form", label: 'Choose "Instant Form" as the conversion location' },
      { id: "create-form", label: "Create a new form or use a template" },
      { id: "add-fields", label: "Add the fields you want (name, email, phone, etc.)" },
      { id: "keep-short", label: "Keep it short—fewer fields = higher conversion rates" },
      { id: "privacy-policy", label: "Add a privacy policy link" },
      { id: "thank-you", label: "Customize the thank you screen" },
    ],
  },
  {
    id: "connect-jobber",
    title: "3. Connect Meta to Jobber",
    icon: <Link2 className="h-5 w-5" />,
    items: [
      { id: "zapier-account", label: "Option A: Create a Zapier account (zapier.com)", description: "Easiest method" },
      { id: "create-zap", label: "Create a new Zap" },
      { id: "trigger-fb", label: 'Trigger: "Facebook Lead Ads" → "New Lead"' },
      { id: "connect-fb", label: "Connect your Facebook account" },
      { id: "select-form", label: "Select your Lead Form" },
      { id: "action-jobber", label: 'Action: "Jobber" → "Create Client" or "Create Request"' },
      { id: "map-fields", label: "Map the form fields to Jobber fields" },
      { id: "test-zap", label: "Test and turn on" },
      { id: "native-option", label: "Option B: Use Meta's Native Integration (if available)", description: "Check CRM Integrations in Lead Ads Forms" },
    ],
  },
  {
    id: "test",
    title: "4. Test Everything",
    icon: <TestTube className="h-5 w-5" />,
    items: [
      { id: "submit-test", label: "Submit a test lead through your form" },
      { id: "verify-jobber", label: "Verify it appears in Jobber correctly" },
      { id: "check-mapping", label: "Check that all fields are mapping properly" },
    ],
  },
  {
    id: "launch",
    title: "5. Launch Your Campaign",
    icon: <Rocket className="h-5 w-5" />,
    items: [
      { id: "publish-ad", label: "Publish your ad" },
      { id: "monitor-leads", label: "Monitor lead quality and cost per lead" },
      { id: "adjust-targeting", label: "Adjust targeting as needed" },
    ],
  },
];

export default function MetaAdsGuidePage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalItems = checklistData.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = checkedItems.size;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meta Ads Setup Guide</h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step checklist for setting up Meta Lead Ads → Jobber integration
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Setup Progress</span>
            <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
              {completedItems} / {totalItems} completed
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {checklistData.map((section) => {
          const sectionCompleted = section.items.filter((item) => checkedItems.has(item.id)).length;
          const sectionTotal = section.items.length;

          return (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {section.icon}
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <Badge variant={sectionCompleted === sectionTotal ? "default" : "outline"}>
                    {sectionCompleted}/{sectionTotal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <Checkbox
                        id={item.id}
                        checked={checkedItems.has(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={item.id}
                          className={`text-sm cursor-pointer ${
                            checkedItems.has(item.id)
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }`}
                        >
                          {item.label}
                        </label>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pro Tip Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Pro Tip</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start with a small daily budget ($10-20) to test before scaling up. This helps you
                optimize your targeting and ad creative without overspending.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Helpful Resources</CardTitle>
          <CardDescription>External links to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://ads.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Meta Ads Manager</span>
            </a>
            <a
              href="https://zapier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Zapier</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
