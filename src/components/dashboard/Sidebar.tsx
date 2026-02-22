import { useState } from "react";
import {
  Home, FolderKanban, CalendarDays, Users, DollarSign,
  HardDrive, Receipt, ListTodo, MessageSquare, BarChart3,
  Settings, Menu, X, Briefcase, PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { id: "home", label: "Overview", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "files", label: "Files", icon: HardDrive },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "studio", label: "Studio", icon: Briefcase },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const Sidebar = ({ activeNav, onNavChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-5 left-4 z-50 lg:hidden glass-strong rounded-2xl p-2.5"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col glass-strong border-r-0 transition-all duration-300",
          collapsed ? "w-[72px] items-center" : "w-[240px]",
          "py-5",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header: Logo + collapse toggle */}
        <div className={cn("flex items-center mb-2", collapsed ? "justify-center px-2" : "justify-between px-4")}>
          <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center">
            <span className="text-background text-sm font-bold tracking-wide">•••</span>
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
            >
              <PanelLeft className="w-3 h-3 rotate-180" />
            </button>
          )}
        </div>

        {/* Section label */}
        {!collapsed && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 px-5 mt-4 mb-2">
            Main menu
          </p>
        )}

        {/* Nav */}
        <nav className={cn("flex-1 flex flex-col gap-0.5 overflow-y-auto", collapsed ? "items-center px-2" : "px-3")}>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavChange(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 transition-all duration-200 rounded-xl",
                  collapsed
                    ? "w-11 h-11 justify-center"
                    : "w-full h-11 px-3",
                  isActive
                    ? "bg-card shadow-sm text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
                title={item.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Settings */}
        <div className={cn("mt-auto pt-2 border-t border-border/30", collapsed ? "px-2" : "px-3")}>
          {!collapsed && (
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 px-2 mb-2">
              Settings
            </p>
          )}
          <button
            className={cn(
              "flex items-center gap-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors",
              collapsed ? "w-11 h-11 justify-center" : "w-full h-11 px-3"
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </button>

          {/* Account */}
          {!collapsed && (
            <div className="mt-3 px-2 pb-1">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-2">Account</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  U
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">User</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">Freelancer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
