import { NavLink, useLocation } from "react-router-dom";
import {
  Bot,
  MessageSquare,
  Calendar,
  BookOpen,
  Link2,
  BarChart3,
  TrendingUp,
  Settings,
  LogOut,
  Mic,
  Megaphone,
  Search,
  MapPinned,
  UserPlus,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import { cn } from "@/lib/utils";
import profileImg from "@/assets/craig-orner.avif";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  accent?: boolean;
}

const mainNav: NavItem[] = [
  { to: "/ai-control", icon: Bot, label: "AI Control Center" },
  { to: "/ai-chat", icon: MessageSquare, label: "AI Assistant" },
  { to: "/ai-productivity", icon: TrendingUp, label: "AI Productivity" },
];

const marketingNav: NavItem[] = [
  { to: "/gtm", icon: MapPinned, label: "GTM Command Center", accent: true },
  { to: "/gtm-onboarding", icon: UserPlus, label: "GTM Setup" },
  { to: "/marketing", icon: BarChart3, label: "Marketing Analytics" },
  { to: "/meta-ads-guide", icon: Megaphone, label: "Meta Ads" },
  { to: "/google-ads-guide", icon: Search, label: "Google Ads" },
];

const seoNav: NavItem[] = [
  { to: "/seo", icon: Search, label: "SEO Dashboard" },
  { to: "/seo-onboarding", icon: UserPlus, label: "SEO Onboarding" },
  { to: "/llm-presence", icon: Eye, label: "LLM Presence" },
];

const resourceNav: NavItem[] = [
  { to: "/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
  { to: "/integrations", icon: Link2, label: "Integrations" },
];

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          item.accent && !isActive && "text-primary font-medium"
        )
      }
    >
      <item.icon className={cn("h-4 w-4 shrink-0", item.accent && "text-primary")} />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {children}
    </p>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { currentOrg } = useOrg();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Org header */}
      <NavLink to="/dashboard" className="flex items-center gap-2.5 px-3 py-3 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
        <img src={profileImg} alt="Profile" className="h-7 w-7 rounded-md object-cover" />
        <span className="truncate text-sm font-semibold text-sidebar-foreground">
          {currentOrg?.name || "IGY6 Rooted"}
        </span>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
        {mainNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <SectionLabel>Marketing</SectionLabel>
        {marketingNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <SectionLabel>SEO & Presence</SectionLabel>
        {seoNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        <SectionLabel>Resources</SectionLabel>
        {resourceNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-2 py-2 space-y-0.5">
        <SidebarLink item={{ to: "/ai-voice-content", icon: Mic, label: "AI Voice Content" }} />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            )
          }
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>

        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5">
          <img src={profileImg} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
          <span className="flex-1 truncate text-[12px] text-muted-foreground">
            {user?.email}
          </span>
          <button
            onClick={() => signOut()}
            className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
