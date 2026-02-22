import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FolderKanban, CalendarDays, Users, DollarSign, HardDrive,
  Receipt, Bell, Settings2, ListTodo, MessageSquare, BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Moon, Sun } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import WidgetCard from "@/components/dashboard/WidgetCard";
import WidgetExpandedView from "@/components/dashboard/WidgetExpandedView";
import { ProjectsPreview, ProjectsExpanded } from "@/components/dashboard/ProjectsWidget";
import { CalendarPreview, CalendarExpanded } from "@/components/dashboard/CalendarWidget";
import { ClientsPreview, ClientsExpanded } from "@/components/dashboard/ClientPortalWidget";
import { FinancesPreview, FinancesExpanded } from "@/components/dashboard/FinancesWidget";
import { FilesPreview, FilesExpanded } from "@/components/dashboard/FileStorageWidget";
import { InvoicesPreview, InvoicesExpanded } from "@/components/dashboard/InvoicesWidget";
import { TasksPreview, TasksExpanded } from "@/components/dashboard/TasksWidget";
import { MessagesPreview, MessagesExpanded } from "@/components/dashboard/MessagesWidget";
import { AnalyticsPreview, AnalyticsExpanded } from "@/components/dashboard/AnalyticsWidget";
import WidgetCustomizer from "@/components/dashboard/WidgetCustomizer";
import { useIsMobile } from "@/hooks/use-mobile";

type WidgetId = "projects" | "calendar" | "finances" | "clients" | "files" | "invoices" | "tasks" | "messages" | "analytics";

const WIDGETS: Record<
  WidgetId,
  {
    title: string;
    icon: React.ReactNode;
    preview: React.ComponentType;
    expanded: React.ComponentType;
    cols: number;
    accent?: boolean;
    component: React.ComponentType;
    bgColor: string;
    textColor: string;
  }
> = {
  projects: {
    title: "Projects",
    icon: <FolderKanban className="w-4 h-4" />,
    preview: ProjectsPreview,
    expanded: ProjectsExpanded,
    cols: 1,
    component: ProjectsPreview,
    bgColor: "",
    textColor: "",
  },
  calendar: {
    title: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    preview: CalendarPreview,
    expanded: CalendarExpanded,
    cols: 1,
    component: CalendarPreview,
    bgColor: "",
    textColor: "",
  },
  finances: {
    title: "Finances",
    icon: <DollarSign className="w-4 h-4" />,
    preview: FinancesPreview,
    expanded: FinancesExpanded,
    cols: 1,
    component: FinancesPreview,
    bgColor: "",
    textColor: "",
  },
  clients: {
    title: "Client Portal",
    icon: <Users className="w-4 h-4" />,
    preview: ClientsPreview,
    expanded: ClientsExpanded,
    cols: 1,
    component: ClientsPreview,
    bgColor: "",
    textColor: "",
  },
  files: {
    title: "Files",
    icon: <HardDrive className="w-4 h-4" />,
    preview: FilesPreview,
    expanded: FilesExpanded,
    cols: 1,
    component: FilesPreview,
    bgColor: "",
    textColor: "",
  },
  invoices: {
    title: "Invoices",
    icon: <Receipt className="w-4 h-4" />,
    preview: InvoicesPreview,
    expanded: InvoicesExpanded,
    cols: 1,
    component: InvoicesPreview,
    bgColor: "",
    textColor: "",
  },
  tasks: {
    title: "Tasks",
    icon: <ListTodo className="w-4 h-4" />,
    preview: TasksPreview,
    expanded: TasksExpanded,
    cols: 1,
    component: TasksPreview,
    bgColor: "",
    textColor: "",
  },
  messages: {
    title: "Messages",
    icon: <MessageSquare className="w-4 h-4" />,
    preview: MessagesPreview,
    expanded: MessagesExpanded,
    cols: 1,
    component: MessagesPreview,
    bgColor: "",
    textColor: "",
  },
  analytics: {
    title: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    preview: AnalyticsPreview,
    expanded: AnalyticsExpanded,
    cols: 1,
    component: AnalyticsPreview,
    bgColor: "",
    textColor: "",
  },
};

const DEFAULT_WIDGETS: WidgetId[] = ["projects", "calendar", "finances", "clients", "files", "invoices", "tasks", "messages", "analytics"];

const stats = [
  { label: "Active Projects", value: "12", trend: "+3" },
  { label: "Revenue", value: "$24.5k", trend: "+12%" },
  { label: "Pending Tasks", value: "8", trend: "-2" },
  { label: "Storage", value: "64%", trend: "+5%" },
];

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [expandedWidget, setExpandedWidget] = useState<WidgetId | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [widgetSizes, setWidgetSizes] = useState<Record<string, import("@/components/dashboard/WidgetCard").WidgetSize>>({});
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("theme") === "dark";
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleWidget = (id: string) => {
    setActiveWidgets((prev) =>
      prev.includes(id as WidgetId)
        ? prev.filter((w) => w !== id)
        : [...prev, id as WidgetId]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActiveWidgets((prev) => {
        const oldIndex = prev.indexOf(active.id as WidgetId);
        const newIndex = prev.indexOf(over.id as WidgetId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleExpand = (id: WidgetId) => {
    if (isMobile) {
      navigate(`/widget/${id}`);
    } else {
      setExpandedWidget(id);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main content */}
      <main className="lg:ml-[72px] p-5 md:p-8 lg:p-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="lg:pl-0 pl-12">
            <p className="text-sm text-muted-foreground font-medium">{today}</p>
            <h2 className="text-2xl font-semibold tracking-tight mt-0.5">Good morning, Jordan</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="glass-strong rounded-2xl p-2.5 hover:scale-105 transition-transform"
            >
              {dark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="glass-strong rounded-2xl p-2.5 hover:scale-105 transition-transform relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-destructive" />
            </button>
            <button
              onClick={() => setCustomizerOpen(true)}
              className="glass-strong rounded-2xl p-2.5 hover:scale-105 transition-transform"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-semibold ml-1">
              J
            </div>
          </div>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-strong rounded-3xl p-5"
            >
              <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
                <span className="text-xs text-success font-medium">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Widget grid - Desktop */}
        {!isMobile ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeWidgets} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeWidgets.map((id, i) => {
                  const widget = WIDGETS[id];
                  const Preview = widget.preview;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.25 + i * 0.04 }}
                      className={
                        (widgetSizes[id] === "medium" ? "sm:col-span-2" : "") +
                        (widgetSizes[id] === "large" ? " sm:col-span-2 lg:col-span-3" : "")
                      }
                    >
                      <WidgetCard
                        id={id}
                        title={widget.title}
                        icon={widget.icon}
                        size={widgetSizes[id] || "small"}
                        onExpand={() => handleExpand(id)}
                        onResize={(size) => setWidgetSizes((prev) => ({ ...prev, [id]: size }))}
                      >
                        <Preview />
                      </WidgetCard>
                    </motion.div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          /* Mobile: Minimal stacked cards */
          <div className="space-y-3 pb-8">
            {activeWidgets.map((id, i) => {
              const widget = WIDGETS[id];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => handleExpand(id)}
                  className="glass-strong rounded-3xl px-5 py-4 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-muted/50 flex items-center justify-center">
                        <span className="text-muted-foreground">{widget.icon}</span>
                      </div>
                      <h3 className="text-sm font-medium text-foreground">{widget.title}</h3>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Expanded widget dialog */}
        {expandedWidget && (() => {
          const widget = WIDGETS[expandedWidget];
          const Expanded = widget.expanded;
          return (
            <WidgetExpandedView
              open={true}
              onOpenChange={(open) => !open && setExpandedWidget(null)}
              title={widget.title}
              icon={widget.icon}
            >
              <Expanded />
            </WidgetExpandedView>
          );
        })()}

        <WidgetCustomizer
          open={customizerOpen}
          onOpenChange={setCustomizerOpen}
          widgets={WIDGETS}
          activeWidgets={activeWidgets}
          onToggle={toggleWidget}
        />
      </main>
    </div>
  );
};

export default Index;
