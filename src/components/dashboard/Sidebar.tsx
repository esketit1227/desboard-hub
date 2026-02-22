import { useState } from "react";
import {
  Home, FolderKanban, CalendarDays, Users, DollarSign,
  HardDrive, Receipt, ListTodo, MessageSquare, BarChart3,
  Settings, Menu, X, Briefcase, PanelLeft, ChevronRight,
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
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar = ({ activeNav, onNavChange, collapsed, onCollapsedChange }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-8 left-6 z-50 lg:hidden rounded-xl p-2 bg-card border border-border shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar — inside the container */}
      <aside
        className={cn(
          "hidden lg:flex flex-col items-center py-6 border-r border-border/50 transition-all duration-300 shrink-0 relative",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform", !collapsed && "rotate-180")} />
        </button>

        {/* Logo */}
        <div className={cn("mb-6", collapsed ? "px-0" : "px-4 w-full")}>
          <div className="w-10 h-10 rounded-2xl bg-foreground flex items-center justify-center mx-auto">
            <span className="text-background text-xs font-bold">•••</span>
          </div>
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 flex flex-col gap-1 w-full overflow-y-auto", collapsed ? "items-center px-2" : "px-3")}>
          {!collapsed && (
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
              Menu
            </p>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={cn(
                  "flex items-center gap-3 transition-all duration-200 rounded-xl",
                  collapsed
                    ? "w-10 h-10 justify-center"
                    : "w-full h-10 px-3",
                  isActive
                    ? "bg-foreground text-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
                title={item.label}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={cn("mt-auto pt-3", collapsed ? "px-2" : "px-3 w-full")}>
          <button
            className={cn(
              "flex items-center gap-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
              collapsed ? "w-10 h-10 justify-center" : "w-full h-10 px-3"
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-[240px] z-40 bg-card border-r border-border p-4 flex flex-col lg:hidden">
            <div className="mt-14 flex flex-col gap-1">
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
                      "flex items-center gap-3 w-full h-10 px-3 rounded-xl transition-all",
                      isActive
                        ? "bg-foreground text-background font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;