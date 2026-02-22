import { useState } from "react";
import {
  Home,
  FolderKanban,
  CalendarDays,
  Users,
  DollarSign,
  HardDrive,
  Receipt,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "finances", label: "Finances", icon: DollarSign },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "files", label: "Files", icon: HardDrive },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

const Sidebar = ({ activeNav, onNavChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-5 left-4 z-50 lg:hidden glass rounded-xl p-2.5"
      >
        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col bg-card/90 backdrop-blur-xl border-r border-border/40 transition-all duration-300",
          "w-[220px] p-4",
          "lg:translate-x-0",
          collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="mb-10 pt-2">
          <h1 className="text-xl font-bold tracking-tight lowercase">desboard</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavChange(item.id);
                  setCollapsed(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
