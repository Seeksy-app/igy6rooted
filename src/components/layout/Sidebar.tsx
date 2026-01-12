import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Wrench,
  Clock,
  Link2,
  FileText,
  AlertCircle,
  HelpCircle,
  Settings,
  LogOut,
  ChevronDown,
  Mic,
  Calendar,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/scheduling-ai", icon: Bot, label: "Scheduling AI" },
  { to: "/services", icon: Wrench, label: "Services" },
  { to: "/availability", icon: Clock, label: "Availability" },
  { to: "/jobber", icon: Link2, label: "Jobber Connection" },
  { to: "/booking-logs", icon: FileText, label: "Booking Logs" },
  { to: "/followups", icon: AlertCircle, label: "Follow-ups" },
  { to: "/knowledge-base", icon: HelpCircle, label: "Knowledge Base" },
];

const adminItems = [
  { to: "/admin/integrations/jobber", icon: Link2, label: "Jobber Setup" },
  { to: "/admin/ai-agent", icon: Bot, label: "AI Agent Config" },
  { to: "/admin/appointments", icon: Calendar, label: "AI Appointments" },
  { to: "/admin/logs", icon: ScrollText, label: "Tool Call Logs" },
  { to: "/voice-agent-test", icon: Mic, label: "Voice Test" },
];

export function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentOrg, orgs, setCurrentOrg } = useOrg();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">R</span>
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-accent-foreground">IGY6 Rooted</h1>
          <p className="text-xs text-sidebar-foreground">AI Scheduling</p>
        </div>
      </div>

      {/* Org Selector */}
      <div className="border-b border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg bg-sidebar-accent px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/80">
            <span className="truncate font-medium text-sidebar-accent-foreground">
              {currentOrg?.name || "Select Organization"}
            </span>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {orgs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => setCurrentOrg(org)}
                className={cn(currentOrg?.id === org.id && "bg-accent")}
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
