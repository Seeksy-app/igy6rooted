import { ProfileSection } from "@/components/settings/ProfileSection";
import { OrgSection } from "@/components/settings/OrgSection";
import { TeamSection } from "@/components/settings/TeamSection";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile, organization, and team
        </p>
      </div>

      <ProfileSection />
      <OrgSection />
      <TeamSection />
    </div>
  );
}
