import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Target, 
  FileText, 
  Link2, 
  TestTube, 
  Rocket,
  Lightbulb,
  ExternalLink,
  Plus,
  Image,
  Video,
  MessageSquare,
  ShoppingBag,
  Users,
  MousePointer,
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

interface AdType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  checklist: ChecklistSection[];
}

const adTypes: AdType[] = [
  {
    id: "lead-ads",
    name: "Lead Ads",
    description: "Collect leads directly on Facebook/Instagram",
    icon: <FileText className="h-4 w-4" />,
    checklist: [
      {
        id: "create-ad",
        title: "1. Create Your Lead Ad in Meta Ads Manager",
        icon: <Target className="h-5 w-5" />,
        items: [
          { id: "lead-goto-ads", label: "Go to ads.facebook.com", description: "Access Meta Ads Manager" },
          { id: "lead-create-campaign", label: 'Click "Create" and select "Leads" as your campaign objective' },
          { id: "lead-set-audience", label: "Set your audience, budget, and schedule" },
          { id: "lead-design-creative", label: "Design your ad creative (image/video + text)" },
        ],
      },
      {
        id: "build-form",
        title: "2. Build Your Lead Form",
        icon: <FileText className="h-5 w-5" />,
        items: [
          { id: "lead-instant-form", label: 'Choose "Instant Form" as the conversion location' },
          { id: "lead-create-form", label: "Create a new form or use a template" },
          { id: "lead-add-fields", label: "Add the fields you want (name, email, phone, etc.)" },
          { id: "lead-keep-short", label: "Keep it short—fewer fields = higher conversion rates" },
          { id: "lead-privacy-policy", label: "Add a privacy policy link" },
          { id: "lead-thank-you", label: "Customize the thank you screen" },
        ],
      },
      {
        id: "connect-jobber",
        title: "3. Connect Meta to Jobber",
        icon: <Link2 className="h-5 w-5" />,
        items: [
          { id: "lead-zapier-account", label: "Option A: Create a Zapier account (zapier.com)", description: "Easiest method" },
          { id: "lead-create-zap", label: "Create a new Zap" },
          { id: "lead-trigger-fb", label: 'Trigger: "Facebook Lead Ads" → "New Lead"' },
          { id: "lead-connect-fb", label: "Connect your Facebook account" },
          { id: "lead-select-form", label: "Select your Lead Form" },
          { id: "lead-action-jobber", label: 'Action: "Jobber" → "Create Client" or "Create Request"' },
          { id: "lead-map-fields", label: "Map the form fields to Jobber fields" },
          { id: "lead-test-zap", label: "Test and turn on" },
        ],
      },
      {
        id: "test",
        title: "4. Test Everything",
        icon: <TestTube className="h-5 w-5" />,
        items: [
          { id: "lead-submit-test", label: "Submit a test lead through your form" },
          { id: "lead-verify-jobber", label: "Verify it appears in Jobber correctly" },
          { id: "lead-check-mapping", label: "Check that all fields are mapping properly" },
        ],
      },
      {
        id: "launch",
        title: "5. Launch Your Campaign",
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: "lead-publish-ad", label: "Publish your ad" },
          { id: "lead-monitor-leads", label: "Monitor lead quality and cost per lead" },
          { id: "lead-adjust-targeting", label: "Adjust targeting as needed" },
        ],
      },
    ],
  },
  {
    id: "traffic-ads",
    name: "Traffic Ads",
    description: "Drive traffic to your website or landing page",
    icon: <MousePointer className="h-4 w-4" />,
    checklist: [
      {
        id: "setup",
        title: "1. Set Up Your Traffic Campaign",
        icon: <Target className="h-5 w-5" />,
        items: [
          { id: "traffic-goto-ads", label: "Go to ads.facebook.com" },
          { id: "traffic-create-campaign", label: 'Select "Traffic" as your campaign objective' },
          { id: "traffic-choose-destination", label: "Choose destination: Website, App, or Messenger" },
          { id: "traffic-set-budget", label: "Set your daily or lifetime budget" },
        ],
      },
      {
        id: "targeting",
        title: "2. Define Your Audience",
        icon: <Users className="h-5 w-5" />,
        items: [
          { id: "traffic-location", label: "Set location targeting (service area)" },
          { id: "traffic-demographics", label: "Define age, gender demographics" },
          { id: "traffic-interests", label: "Add relevant interests (home services, homeowners, etc.)" },
          { id: "traffic-custom-audience", label: "Consider creating a custom audience from your customer list" },
          { id: "traffic-lookalike", label: "Create lookalike audience for broader reach" },
        ],
      },
      {
        id: "creative",
        title: "3. Create Your Ad",
        icon: <Image className="h-5 w-5" />,
        items: [
          { id: "traffic-format", label: "Choose ad format: Single image, Carousel, or Video" },
          { id: "traffic-headline", label: "Write a compelling headline (40 chars or less)" },
          { id: "traffic-primary-text", label: "Write primary text with clear value proposition" },
          { id: "traffic-cta", label: 'Select call-to-action: "Learn More", "Get Quote", etc.' },
          { id: "traffic-landing-page", label: "Ensure landing page matches ad message" },
          { id: "traffic-utm", label: "Add UTM parameters for tracking" },
        ],
      },
      {
        id: "pixel",
        title: "4. Install Meta Pixel",
        icon: <TestTube className="h-5 w-5" />,
        items: [
          { id: "traffic-pixel-create", label: "Create Meta Pixel in Events Manager" },
          { id: "traffic-pixel-install", label: "Install pixel on your website" },
          { id: "traffic-pixel-verify", label: "Verify pixel is firing correctly" },
          { id: "traffic-conversions", label: "Set up conversion events (page views, form submissions)" },
        ],
      },
      {
        id: "launch",
        title: "5. Launch & Optimize",
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: "traffic-publish", label: "Publish your campaign" },
          { id: "traffic-monitor-ctr", label: "Monitor click-through rate (aim for 1%+)" },
          { id: "traffic-cost-per-click", label: "Track cost per click" },
          { id: "traffic-landing-rate", label: "Check landing page bounce rate" },
        ],
      },
    ],
  },
  {
    id: "video-ads",
    name: "Video Ads",
    description: "Engage audiences with video content",
    icon: <Video className="h-4 w-4" />,
    checklist: [
      {
        id: "planning",
        title: "1. Plan Your Video Content",
        icon: <FileText className="h-5 w-5" />,
        items: [
          { id: "video-goal", label: "Define video goal: Awareness, Engagement, or Conversions" },
          { id: "video-length", label: "Plan video length: 15-30 sec for Stories, 1-2 min for Feed" },
          { id: "video-hook", label: "Create a strong hook in first 3 seconds" },
          { id: "video-script", label: "Write script or outline key talking points" },
          { id: "video-cta-plan", label: "Plan your call-to-action" },
        ],
      },
      {
        id: "production",
        title: "2. Create Your Video",
        icon: <Video className="h-5 w-5" />,
        items: [
          { id: "video-format", label: "Choose format: Square (1:1), Vertical (9:16), or Horizontal (16:9)" },
          { id: "video-quality", label: "Record in good lighting with clear audio" },
          { id: "video-captions", label: "Add captions (85% of videos watched without sound)" },
          { id: "video-branding", label: "Include your logo and branding" },
          { id: "video-thumbnail", label: "Create an engaging custom thumbnail" },
        ],
      },
      {
        id: "campaign-setup",
        title: "3. Set Up Video Campaign",
        icon: <Target className="h-5 w-5" />,
        items: [
          { id: "video-objective", label: 'Select objective: "Video Views" or "Engagement"' },
          { id: "video-placement", label: "Choose placements: Feed, Stories, Reels, In-Stream" },
          { id: "video-audience", label: "Define target audience" },
          { id: "video-budget", label: "Set budget and schedule" },
          { id: "video-optimization", label: "Optimize for ThruPlay or 2-Second Views" },
        ],
      },
      {
        id: "retargeting",
        title: "4. Set Up Video Retargeting",
        icon: <Users className="h-5 w-5" />,
        items: [
          { id: "video-custom-audience", label: "Create custom audience of video viewers" },
          { id: "video-25-viewers", label: "Segment by watch time: 25%, 50%, 75%, 95%" },
          { id: "video-retarget-campaign", label: "Create retargeting campaign for engaged viewers" },
          { id: "video-next-step", label: "Move viewers to next step (lead form, website)" },
        ],
      },
      {
        id: "launch",
        title: "5. Launch & Measure",
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: "video-publish", label: "Publish your video ad" },
          { id: "video-views", label: "Monitor video views and ThruPlay rate" },
          { id: "video-engagement", label: "Track likes, comments, shares" },
          { id: "video-cost-per-view", label: "Optimize for cost per ThruPlay" },
        ],
      },
    ],
  },
  {
    id: "messenger-ads",
    name: "Messenger Ads",
    description: "Start conversations with potential customers",
    icon: <MessageSquare className="h-4 w-4" />,
    checklist: [
      {
        id: "setup",
        title: "1. Set Up Messenger Campaign",
        icon: <Target className="h-5 w-5" />,
        items: [
          { id: "msg-create", label: 'Create campaign with "Messages" objective' },
          { id: "msg-destination", label: "Choose Messenger as conversation destination" },
          { id: "msg-audience", label: "Define your target audience" },
          { id: "msg-budget", label: "Set budget and schedule" },
        ],
      },
      {
        id: "conversation",
        title: "2. Design Your Conversation Flow",
        icon: <MessageSquare className="h-5 w-5" />,
        items: [
          { id: "msg-greeting", label: "Write a welcoming greeting message" },
          { id: "msg-questions", label: "Create quick reply buttons for common questions" },
          { id: "msg-qualify", label: "Add qualifying questions (service needed, location, timeline)" },
          { id: "msg-handoff", label: "Plan human handoff for qualified leads" },
          { id: "msg-hours", label: "Set up away messages for off-hours" },
        ],
      },
      {
        id: "creative",
        title: "3. Create Your Ad",
        icon: <Image className="h-5 w-5" />,
        items: [
          { id: "msg-image", label: "Add eye-catching image or video" },
          { id: "msg-headline", label: "Write action-oriented headline" },
          { id: "msg-text", label: "Create compelling primary text" },
          { id: "msg-cta", label: 'Use "Send Message" call-to-action' },
        ],
      },
      {
        id: "automation",
        title: "4. Set Up Automation (Optional)",
        icon: <Link2 className="h-5 w-5" />,
        items: [
          { id: "msg-manychat", label: "Consider ManyChat or Chatfuel for advanced flows" },
          { id: "msg-zapier", label: "Connect to Zapier for CRM integration" },
          { id: "msg-notifications", label: "Set up notifications for new messages" },
          { id: "msg-response-time", label: "Aim for <15 min response time" },
        ],
      },
      {
        id: "launch",
        title: "5. Launch & Monitor",
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: "msg-publish", label: "Publish your campaign" },
          { id: "msg-conversations", label: "Monitor conversation volume" },
          { id: "msg-cost", label: "Track cost per conversation started" },
          { id: "msg-quality", label: "Review conversation quality and outcomes" },
        ],
      },
    ],
  },
  {
    id: "catalog-ads",
    name: "Catalog/Dynamic Ads",
    description: "Showcase your services dynamically",
    icon: <ShoppingBag className="h-4 w-4" />,
    checklist: [
      {
        id: "catalog",
        title: "1. Create Your Service Catalog",
        icon: <ShoppingBag className="h-5 w-5" />,
        items: [
          { id: "cat-create", label: "Go to Commerce Manager and create a catalog" },
          { id: "cat-type", label: 'Select catalog type: "Services" or "Other"' },
          { id: "cat-items", label: "Add your services with images, descriptions, prices" },
          { id: "cat-categories", label: "Organize services into categories" },
          { id: "cat-update", label: "Set up automatic catalog updates if possible" },
        ],
      },
      {
        id: "pixel",
        title: "2. Configure Pixel Events",
        icon: <TestTube className="h-5 w-5" />,
        items: [
          { id: "cat-pixel", label: "Install Meta Pixel on your website" },
          { id: "cat-view-content", label: "Set up ViewContent event for service pages" },
          { id: "cat-lead", label: "Set up Lead event for form submissions" },
          { id: "cat-match", label: "Match pixel events to catalog items" },
        ],
      },
      {
        id: "campaign",
        title: "3. Create Dynamic Ad Campaign",
        icon: <Target className="h-5 w-5" />,
        items: [
          { id: "cat-objective", label: 'Choose "Sales" or "Leads" objective' },
          { id: "cat-catalog-select", label: "Select your service catalog" },
          { id: "cat-audience", label: "Choose audience: Retargeting or Broad" },
          { id: "cat-template", label: "Design dynamic ad template" },
          { id: "cat-overlay", label: "Add price or discount overlays" },
        ],
      },
      {
        id: "creative",
        title: "4. Optimize Creative",
        icon: <Image className="h-5 w-5" />,
        items: [
          { id: "cat-images", label: "Use high-quality service images" },
          { id: "cat-titles", label: "Write compelling service titles" },
          { id: "cat-descriptions", label: "Add benefit-focused descriptions" },
          { id: "cat-carousel", label: "Enable carousel format for multiple services" },
        ],
      },
      {
        id: "launch",
        title: "5. Launch & Scale",
        icon: <Rocket className="h-5 w-5" />,
        items: [
          { id: "cat-publish", label: "Publish your campaign" },
          { id: "cat-roas", label: "Monitor return on ad spend (ROAS)" },
          { id: "cat-performers", label: "Identify top-performing services" },
          { id: "cat-scale", label: "Scale budget on winning combinations" },
        ],
      },
    ],
  },
];

export default function MetaAdsGuidePage() {
  const [selectedAdType, setSelectedAdType] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const selectedAd = adTypes.find((ad) => ad.id === selectedAdType);

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

  const resetChecklist = () => {
    setCheckedItems(new Set());
  };

  const totalItems = selectedAd
    ? selectedAd.checklist.reduce((acc, section) => acc + section.items.length, 0)
    : 0;
  const completedItems = selectedAd
    ? selectedAd.checklist.reduce(
        (acc, section) =>
          acc + section.items.filter((item) => checkedItems.has(item.id)).length,
        0
      )
    : 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meta Ads Setup Guide</h1>
        <p className="text-muted-foreground mt-1">
          Select an ad type to get a customized step-by-step checklist for your campaign
        </p>
      </div>

      {/* Ad Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            New Meta Ad Campaign
          </CardTitle>
          <CardDescription>
            Choose the type of Meta ad you want to create
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedAdType} onValueChange={setSelectedAdType}>
              <SelectTrigger className="w-full sm:w-[300px] bg-background">
                <SelectValue placeholder="Select ad type..." />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                {adTypes.map((adType) => (
                  <SelectItem key={adType.id} value={adType.id}>
                    <div className="flex items-center gap-2">
                      {adType.icon}
                      <span>{adType.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAdType && (
              <Button variant="outline" onClick={resetChecklist}>
                Reset Checklist
              </Button>
            )}
          </div>
          {selectedAd && (
            <p className="text-sm text-muted-foreground mt-3">
              {selectedAd.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress Card */}
      {selectedAd && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {selectedAd.name} Setup Progress
              </span>
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
      )}

      {/* Checklist Sections */}
      {selectedAd && (
        <div className="space-y-4">
          {selectedAd.checklist.map((section) => {
            const sectionCompleted = section.items.filter((item) =>
              checkedItems.has(item.id)
            ).length;
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
                    <Badge
                      variant={sectionCompleted === sectionTotal ? "default" : "outline"}
                    >
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
      )}

      {/* Empty State */}
      {!selectedAd && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">Select an Ad Type</h3>
            <p className="text-sm text-muted-foreground">
              Choose from Lead Ads, Traffic Ads, Video Ads, Messenger Ads, or Catalog Ads
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pro Tip Card */}
      {selectedAd && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pro Tip</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with a small daily budget ($10-20) to test before scaling up. This
                  helps you optimize your targeting and ad creative without overspending.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
