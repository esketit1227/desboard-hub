import { useState } from "react";
import {
  Home, FolderKanban, CalendarDays, Users, DollarSign,
  HardDrive, Receipt, ListTodo, MessageSquare, BarChart3,
  Settings, Menu, X, Briefcase, ChevronLeft, MoreVertical,
  Moon, Sun, HelpCircle, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import desboardIcon from "@/assets/desboard-icon.png";
import desboardFull from "@/assets/desboard-full.png";

const mainNavItems = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "workspace", label: "Workspace", icon: Briefcase },
];

const secondaryNavItems = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "files", label: "Files", icon: HardDrive },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

const bottomNavItems = [
  { id: "settings", label: "Settings", icon: Settings },
];

const mobileTabItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "tasks", label: "Tasks", icon: ListTodo },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar = ({ activeNav, onNavChange, collapsed, onCollapsedChange }: SidebarProps) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const NavItem = ({ item }: { item: { id: string; label: string; icon: React.ElementType; badge?: number } }) => {
    const Icon = item.icon;
    const isActive = activeNav === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onNavChange(item.id)}
        className={cn(
          "flex items-center gap-3 transition-all duration-200 rounded-xl group relative",
          collapsed ? "w-10 h-10 justify-center" : "w-full h-10 px-3",
          isActive
            ? "bg-primary text-primary-foreground font-medium shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
        title={item.label}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "text-[10px] font-semibold min-w-[20px] h-5 flex items-center justify-center rounded-md px-1.5",
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col py-5 border-r border-border/50 transition-all duration-300 shrink-0 relative bg-card",
          collapsed ? "w-[60px]" : "w-[230px]"
        )}
      >
        {/* Header: Logo + Collapse */}
        <div className={cn("flex items-center mb-5", collapsed ? "justify-center px-2" : "justify-between px-4")}>
          {!collapsed ? (
            <img src={desboardFull} alt="Desboard" className="h-6 object-contain dark:invert" />
          ) : (
            <img src={desboardIcon} alt="Desboard" className="h-8 w-8 object-contain dark:invert" />
          )}
          {!collapsed && (
            <button
              onClick={() => onCollapsedChange(true)}
              className="w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User profile card */}
        {!collapsed ? (
          <div className="mx-3 mb-4 p-2.5 rounded-xl bg-muted/40 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-semibold shrink-0 overflow-hidden">
              J
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-[10px] text-muted-foreground truncate">Designer</p>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-semibold overflow-hidden">
              J
            </div>
          </div>
        )}

        {/* Main nav */}
        <nav className={cn("flex flex-col gap-0.5 w-full", collapsed ? "items-center px-2" : "px-3")}>
          {mainNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Divider */}
        <div className={cn("my-3", collapsed ? "mx-3" : "mx-4")}>
          <div className="h-px bg-border/40" />
        </div>

        {/* Secondary nav */}
        <nav className={cn("flex flex-col gap-0.5 w-full flex-1", collapsed ? "items-center px-2" : "px-3")}>
          {secondaryNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className={cn("mt-auto flex flex-col gap-0.5", collapsed ? "px-2 items-center" : "px-3")}>
          <div className={cn("mb-2", collapsed ? "mx-1" : "mx-0")}>
            <div className="h-px bg-border/40" />
          </div>

          {bottomNavItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}

          <button
            onClick={toggleDarkMode}
            className={cn(
              "flex items-center gap-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
              collapsed ? "w-10 h-10 justify-center" : "w-full h-10 px-3"
            )}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun className="w-[18px] h-[18px] shrink-0" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
            {!collapsed && <span className="text-sm">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {/* Help card */}
          {!collapsed && (
            <div className="mt-2 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Need help?</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Support is available 24/7</p>
            </div>
          )}

          {collapsed && (
            <button
              onClick={() => onCollapsedChange(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors mt-1"
              title="Expand sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 backdrop-blur-xl border-t border-border/40">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
          {mobileTabItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[56px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn("text-[10px] leading-tight", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default Sidebar;
