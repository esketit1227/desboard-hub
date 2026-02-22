import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FolderKanban,
  CalendarDays,
  Users,
  DollarSign,
  HardDrive,
  Receipt,
  Bell,
  Settings2,
  ListTodo,
  MessageSquare,
  BarChart3,
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
  }
> = {
  projects: {
    title: "Projects",
    icon: <FolderKanban className="w-4 h-4" />,
    preview: ProjectsPreview,
    expanded: ProjectsExpanded,
    cols: 1,
    accent: true,
    component: ProjectsPreview,
  },
  calendar: {
    title: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    preview: CalendarPreview,
    expanded: CalendarExpanded,
    cols: 1,
    component: CalendarPreview,
  },
  finances: {
    title: "Finances",
    icon: <DollarSign className="w-4 h-4" />,
    preview: FinancesPreview,
    expanded: FinancesExpanded,
    cols: 1,
    component: FinancesPreview,
  },
  clients: {
    title: "Client Portal",
    icon: <Users className="w-4 h-4" />,
    preview: ClientsPreview,
    expanded: ClientsExpanded,
    cols: 1,
    component: ClientsPreview,
  },
  files: {
    title: "File Storage",
    icon: <HardDrive className="w-4 h-4" />,
    preview: FilesPreview,
    expanded: FilesExpanded,
    cols: 1,
    component: FilesPreview,
  },
  invoices: {
    title: "Invoices",
    icon: <Receipt className="w-4 h-4" />,
    preview: InvoicesPreview,
    expanded: InvoicesExpanded,
    cols: 1,
    component: InvoicesPreview,
  },
  tasks: {
    title: "Tasks",
    icon: <ListTodo className="w-4 h-4" />,
    preview: TasksPreview,
    expanded: TasksExpanded,
    cols: 1,
    component: TasksPreview,
  },
  messages: {
    title: "Messages",
    icon: <MessageSquare className="w-4 h-4" />,
    preview: MessagesPreview,
    expanded: MessagesExpanded,
    cols: 1,
    component: MessagesPreview,
  },
  analytics: {
    title: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    preview: AnalyticsPreview,
    expanded: AnalyticsExpanded,
    cols: 1,
    component: AnalyticsPreview,
  },
};

const DEFAULT_WIDGETS: WidgetId[] = ["projects", "calendar", "finances", "clients", "files", "invoices", "tasks", "messages", "analytics"];

const stats = [
  { label: "Active Projects", value: "12", trend: "+3" },
  { label: "Revenue", value: "$24.5k", trend: "+12%" },
  { label: "Pending Tasks", value: "8", trend: "-2" },
  { label: "Storage Used", value: "64%", trend: "+5%" },
];

const Index = () => {
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [expandedWidget, setExpandedWidget] = useState<WidgetId | null>(null);
  const [activeNav, setActiveNav] = useState("home");
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [widgetSizes, setWidgetSizes] = useState<Record<string, import("@/components/dashboard/WidgetCard").WidgetSize>>({});
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main content area */}
      <main className="lg:ml-[220px] p-4 md:p-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="lg:pl-0 pl-12">
            <h2 className="text-2xl font-bold tracking-tight">Good morning, Jordan</h2>
            <p className="text-sm text-muted-foreground mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="glass rounded-xl p-2.5 hover:scale-105 transition-transform"
            >
              {dark ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button className="glass rounded-xl p-2.5 hover:scale-105 transition-transform">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setCustomizerOpen(true)}
              className="glass rounded-xl p-2.5 hover:scale-105 transition-transform"
            >
              <Settings2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              JD
            </div>
          </div>
        </motion.header>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass rounded-2xl p-4"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold tracking-tight">{stat.value}</span>
                <span className="text-[11px] text-success font-semibold">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Widget grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeWidgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWidgets.map((id, i) => {
                const widget = WIDGETS[id];
                const Preview = widget.preview;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
                    className={
                      (widgetSizes[id] === "medium" ? "sm:col-span-2" : "") +
                      (widgetSizes[id] === "large" ? " sm:col-span-2 lg:col-span-3" : "")
                    }
                  >
                    <WidgetCard
                      id={id}
                      title={widget.title}
                      icon={widget.icon}
                      accent={widget.accent}
                      size={widgetSizes[id] || "small"}
                      onExpand={() => setExpandedWidget(id)}
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
