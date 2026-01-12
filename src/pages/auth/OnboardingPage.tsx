import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrg } from "@/contexts/OrgContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const { createOrg } = useOrg();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createOrg(orgName);
      toast({
        title: "Organization created",
        description: "Your organization is ready. Let's configure your scheduling.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create organization",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Create your organization</h1>
          <p className="mt-1 text-muted-foreground">
            Set up your business to start scheduling with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              type="text"
              placeholder="e.g., Acme Lawn Care"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              This is your business name that customers will see
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Continue to Dashboard
          </Button>
        </form>

        {/* Steps preview */}
        <div className="mt-8 rounded-lg bg-muted/50 p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Next steps:</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                1
              </span>
              Connect your Jobber account
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                2
              </span>
              Configure your services
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
                3
              </span>
              Set your availability
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
