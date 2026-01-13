import { NavLink, useLocation } from "react-router-dom";
import {
  Bot,
  MessageSquare,
  Phone,
  Calendar,
  BookOpen,
  Link2,
  BarChart3,
  TrendingUp,
  Settings,
  LogOut,
  ScrollText,
  Mic,
  Megaphone,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: Bot, label: "AI Control Center" },
  { to: "/ai-chat", icon: MessageSquare, label: "AI Chat" },
  { to: "/ai-calls", icon: Phone, label: "AI Calls" },
  { to: "/ai-booking", icon: Calendar, label: "Booking Assistant" },
  { to: "/ai-voice-content", icon: Mic, label: "AI Voice Content" },
  { to: "/knowledge-base", icon: BookOpen, label: "Knowledge Base" },
  { to: "/integrations", icon: Link2, label: "Integrations" },
  { to: "/marketing", icon: BarChart3, label: "Marketing Analytics" },
  { to: "/meta-ads-guide", icon: Megaphone, label: "Meta Ads" },
  { to: "/google-ads-guide", icon: Search, label: "Google Ads" },
  { to: "/ai-productivity", icon: TrendingUp, label: "AI Productivity" },
];

const adminItems = [
  { to: "/admin/logs", icon: ScrollText, label: "Tool Call Logs" },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentOrg } = useOrg();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-accent-foreground">IGY6 Rooted</h1>
          <p className="text-xs text-sidebar-foreground">AI Platform</p>
        </div>
      </div>

      {/* Company Display */}
      <div className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <span className="truncate text-sm font-medium text-sidebar-accent-foreground">
            {currentOrg?.name || "IGY6 Rooted"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn("nav-item", isActive && "active")
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <div className="pt-3 mt-3 border-t border-sidebar-border">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin</p>
          {adminItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("nav-item", isActive && "active")
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <NavLink
          to="/settings"
          className={cn(
            "nav-item mb-2",
            location.pathname === "/settings" && "active"
          )}
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </NavLink>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-md p-1.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
