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
  ExternalLink,
  Settings,
  BarChart3
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
    id: "setup-account",
    title: "1. Set Up Your Google Ads Account",
    icon: <Settings className="h-5 w-5" />,
    items: [
      { id: "goto-ads", label: "Go to ads.google.com", description: "Access Google Ads Manager" },
      { id: "create-account", label: "Create or sign into your Google Ads account" },
      { id: "billing", label: "Set up billing information" },
      { id: "conversion-tracking", label: "Enable conversion tracking in Tools & Settings" },
    ],
  },
  {
    id: "create-campaign",
    title: "2. Create Your Lead Form Campaign",
    icon: <Target className="h-5 w-5" />,
    items: [
      { id: "new-campaign", label: 'Click "+ New Campaign"' },
      { id: "select-leads", label: 'Select "Leads" as your campaign goal' },
      { id: "campaign-type", label: "Choose campaign type: Search, Display, or Performance Max" },
      { id: "set-budget", label: "Set your daily budget and bidding strategy" },
      { id: "target-audience", label: "Define your target audience and locations" },
      { id: "ad-schedule", label: "Set ad schedule to match your business hours" },
    ],
  },
  {
    id: "build-lead-form",
    title: "3. Build Your Lead Form Extension",
    icon: <FileText className="h-5 w-5" />,
    items: [
      { id: "assets-menu", label: 'Go to "Assets" (formerly Extensions) in your campaign' },
      { id: "add-lead-form", label: 'Click "+ Lead Form"' },
      { id: "form-headline", label: "Create a compelling headline for your form" },
      { id: "business-name", label: "Add your business name and description" },
      { id: "form-fields", label: "Select form fields: Name, Email, Phone, Zip Code", description: "Keep it minimal for higher conversions" },
      { id: "privacy-policy", label: "Add your privacy policy URL (required)" },
      { id: "background-image", label: "Upload a background image (optional but recommended)" },
      { id: "call-to-action", label: 'Choose your call-to-action: "Get Quote", "Contact Us", etc.' },
      { id: "thank-you-message", label: "Customize your thank you message" },
    ],
  },
  {
    id: "connect-jobber",
    title: "4. Connect Google Ads to Jobber",
    icon: <Link2 className="h-5 w-5" />,
    items: [
      { id: "zapier-method", label: "Option A: Use Zapier (Recommended)", description: "Most reliable method" },
      { id: "zapier-account", label: "Create a Zapier account at zapier.com" },
      { id: "create-zap", label: "Create a new Zap" },
      { id: "trigger-google", label: 'Trigger: "Google Ads" → "New Lead Form Entry"' },
      { id: "connect-google", label: "Connect and authorize your Google Ads account" },
      { id: "select-lead-form", label: "Select your Lead Form from the dropdown" },
      { id: "action-jobber", label: 'Action: "Jobber" → "Create Client" or "Create Request"' },
      { id: "map-fields", label: "Map Google form fields to Jobber fields" },
      { id: "test-zap", label: "Test your Zap with sample data" },
      { id: "turn-on", label: "Turn on your Zap" },
      { id: "webhook-option", label: "Option B: Use Google Ads Webhook", description: "Requires technical setup" },
    ],
  },
  {
    id: "create-ads",
    title: "5. Create Your Ad Creative",
    icon: <BarChart3 className="h-5 w-5" />,
    items: [
      { id: "headlines", label: "Write 3-5 compelling headlines (30 chars each)" },
      { id: "descriptions", label: "Write 2-4 descriptions (90 chars each)" },
      { id: "keywords", label: "Add relevant keywords for your services" },
      { id: "negative-keywords", label: "Add negative keywords to filter unwanted traffic" },
      { id: "ad-extensions", label: "Add call extensions, location extensions, and sitelinks" },
    ],
  },
  {
    id: "test",
    title: "6. Test Everything",
    icon: <TestTube className="h-5 w-5" />,
    items: [
      { id: "preview-form", label: "Preview your lead form in Google Ads" },
      { id: "submit-test", label: "Submit a test lead through your form" },
      { id: "verify-zapier", label: "Verify the lead appears in Zapier's task history" },
      { id: "verify-jobber", label: "Confirm the lead/client appears in Jobber" },
      { id: "check-mapping", label: "Check that all fields are mapping correctly" },
    ],
  },
  {
    id: "launch",
    title: "7. Launch & Optimize",
    icon: <Rocket className="h-5 w-5" />,
    items: [
      { id: "publish-campaign", label: "Publish your campaign" },
      { id: "monitor-cpl", label: "Monitor cost per lead (CPL) daily for first week" },
      { id: "quality-score", label: "Check keyword quality scores and optimize" },
      { id: "adjust-bids", label: "Adjust bids based on performance" },
      { id: "ab-test", label: "A/B test different ad variations" },
      { id: "review-search-terms", label: "Review search terms report weekly" },
    ],
  },
];

export default function GoogleAdsGuidePage() {
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
        <h1 className="text-2xl font-bold text-foreground">Google Ads Setup Guide</h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step checklist for setting up Google Lead Forms → Jobber integration
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

      {/* Pro Tips Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Pro Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Start small:</strong> Begin with $20-30/day to test your ads before scaling</li>
                <li>• <strong>Use exact match keywords:</strong> They're more expensive but convert better for service businesses</li>
                <li>• <strong>Enable call tracking:</strong> Many leads prefer calling directly—track these conversions too</li>
                <li>• <strong>Review search terms weekly:</strong> Add irrelevant searches as negative keywords</li>
                <li>• <strong>Optimize for leads, not clicks:</strong> Use "Maximize Conversions" bidding once you have 15+ leads</li>
              </ul>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Google Ads</span>
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
            <a
              href="https://support.google.com/google-ads/answer/9423234"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Lead Form Help</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
