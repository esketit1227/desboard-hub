import { useState } from "react";
import {
  Home, FolderKanban, CalendarDays, Users, DollarSign,
  HardDrive, Receipt, ListTodo, MessageSquare, BarChart3,
  Settings, Menu, X, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", icon: FolderKanban },
  { id: "calendar", icon: CalendarDays },
  { id: "clients", icon: Users },
  { id: "finances", icon: DollarSign },
  { id: "invoices", icon: Receipt },
  { id: "files", icon: HardDrive },
  { id: "tasks", icon: ListTodo },
  { id: "messages", icon: MessageSquare },
  { id: "analytics", icon: BarChart3 },
  { id: "studio", icon: Briefcase },
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
        className="fixed top-5 left-4 z-50 lg:hidden glass-strong rounded-2xl p-2.5"
      >
        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar — icon-only on desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-40 flex flex-col items-center glass-strong border-r-0 transition-all duration-300",
          "w-[72px] py-6 px-2",
          "lg:translate-x-0",
          collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo dot */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-1">
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
                  "w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
                title={item.id}
              >
                <Icon className="w-[18px] h-[18px]" />
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        <button className="w-11 h-11 flex items-center justify-center rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </aside>

      {/* Mobile overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
