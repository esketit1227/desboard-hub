import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent } from
"@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from
"@dnd-kit/sortable";
import {
  FolderKanban, CalendarDays, Users, DollarSign, HardDrive,
  Receipt, Bell, Settings2, ListTodo, MessageSquare, BarChart3,
  ArrowUpRight, Briefcase, Search, SlidersHorizontal, Plus } from
"lucide-react";

import TopIsland from "@/components/dashboard/TopIsland";
import WidgetCard from "@/components/dashboard/WidgetCard";
// WidgetExpandedView no longer used — widgets navigate to full page
import { ProjectsPreview, ProjectsExpanded } from "@/components/dashboard/ProjectsWidget";
import { CalendarPreview, CalendarExpanded } from "@/components/dashboard/CalendarWidget";
import { ClientsPreview, ClientsExpanded } from "@/components/dashboard/ClientPortalWidget";
import { FinancesPreview, FinancesExpanded } from "@/components/dashboard/FinancesWidget";
import { FilesPreview, FilesExpanded } from "@/components/dashboard/FileStorageWidget";

import { TasksPreview, TasksExpanded } from "@/components/dashboard/TasksWidget";
import { MessagesPreview, MessagesExpanded } from "@/components/dashboard/MessagesWidget";
import { AnalyticsPreview, AnalyticsExpanded } from "@/components/dashboard/AnalyticsWidget";
import { StudioPreview, StudioExpanded } from "@/components/dashboard/StudioWidget";
import WidgetCustomizer from "@/components/dashboard/WidgetCustomizer";
import { useIsMobile } from "@/hooks/use-mobile";

type WidgetId = "projects" | "calendar" | "finances" | "clients" | "files" | "tasks" | "messages" | "analytics" | "studio";

const WIDGETS: Record<
  WidgetId,
  {
    title: string;
    icon: React.ReactNode;
    accentColor: string;
    preview: React.ComponentType<{pixelSize?: {width: number;height: number;};}>;
    expanded: React.ComponentType;
    cols: number;
    accent?: boolean;
    component: React.ComponentType;
    bgColor: string;
    textColor: string;
  }> =
{
  projects: {
    title: "Projects",
    icon: <FolderKanban className="w-4 h-4" />,
    accentColor: "#6366f1",
    preview: ProjectsPreview,
    expanded: ProjectsExpanded,
    cols: 1,
    component: ProjectsPreview,
    bgColor: "",
    textColor: ""
  },
  calendar: {
    title: "Calendar",
    icon: <CalendarDays className="w-4 h-4" />,
    accentColor: "#f59e0b",
    preview: CalendarPreview,
    expanded: CalendarExpanded,
    cols: 1,
    component: CalendarPreview,
    bgColor: "",
    textColor: ""
  },
  finances: {
    title: "Finances",
    icon: <DollarSign className="w-4 h-4" />,
    accentColor: "#10b981",
    preview: FinancesPreview,
    expanded: FinancesExpanded,
    cols: 1,
    component: FinancesPreview,
    bgColor: "",
    textColor: ""
  },
  clients: {
    title: "Client Portal",
    icon: <Users className="w-4 h-4" />,
    accentColor: "#8b5cf6",
    preview: ClientsPreview,
    expanded: ClientsExpanded,
    cols: 1,
    component: ClientsPreview,
    bgColor: "",
    textColor: ""
  },
  files: {
    title: "Files",
    icon: <HardDrive className="w-4 h-4" />,
    accentColor: "#3b82f6",
    preview: FilesPreview,
    expanded: FilesExpanded,
    cols: 1,
    component: FilesPreview,
    bgColor: "",
    textColor: ""
  },
  tasks: {
    title: "Tasks",
    icon: <ListTodo className="w-4 h-4" />,
    accentColor: "#ef4444",
    preview: TasksPreview,
    expanded: TasksExpanded,
    cols: 1,
    component: TasksPreview,
    bgColor: "",
    textColor: ""
  },
  messages: {
    title: "Messages",
    icon: <MessageSquare className="w-4 h-4" />,
    accentColor: "#06b6d4",
    preview: MessagesPreview,
    expanded: MessagesExpanded,
    cols: 1,
    component: MessagesPreview,
    bgColor: "",
    textColor: ""
  },
  analytics: {
    title: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    accentColor: "#f97316",
    preview: AnalyticsPreview,
    expanded: AnalyticsExpanded,
    cols: 1,
    component: AnalyticsPreview,
    bgColor: "",
    textColor: ""
  },
  studio: {
    title: "Studio",
    icon: <Briefcase className="w-4 h-4" />,
    accentColor: "#ec4899",
    preview: StudioPreview,
    expanded: StudioExpanded,
    cols: 1,
    component: StudioPreview,
    bgColor: "",
    textColor: ""
  }
};

const DEFAULT_WIDGETS: WidgetId[] = ["projects", "calendar", "finances", "clients", "files", "tasks", "messages", "analytics", "studio"];

const Index = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [_expandedWidget, _setExpandedWidget] = useState<WidgetId | null>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [widgetSizes, setWidgetSizes] = useState<Record<string, import("@/components/dashboard/WidgetCard").WidgetSize>>({});
  const [pixelSizes, setPixelSizes] = useState<Record<string, {width: number;height: number;}>>(() => {
    try {
      const saved = localStorage.getItem("widget-pixel-sizes");
      return saved ? JSON.parse(saved) : {};
    } catch {return {};}
  });

  useEffect(() => {
    localStorage.setItem("widget-pixel-sizes", JSON.stringify(pixelSizes));
  }, [pixelSizes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleWidget = (id: string) => {
    setActiveWidgets((prev) =>
    prev.includes(id as WidgetId) ?
    prev.filter((w) => w !== id) :
    [...prev, id as WidgetId]
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
    navigate(`/widget/${id}`);
  };

  return (
    <div className="p-5 md:p-8 lg:p-10">
      {/* Top Island */}
      <TopIsland />

          {/* Top bar */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-end mb-8">

            <div className="flex items-center gap-2">
              <button className="rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="rounded-xl p-2.5 hover:bg-muted/50 transition-colors">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
              {Object.keys(pixelSizes).length > 0 &&
              <button
                onClick={() => setPixelSizes({})}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors text-muted-foreground">

                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Sizes</span>
                </button>
              }
              <button className="rounded-xl p-2.5 hover:bg-muted/50 transition-colors relative">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-destructive" />
              </button>
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-xs font-semibold ml-1 overflow-hidden">
                J
              </div>
            </div>
          </motion.header>

          {/* Widget grid - Desktop */}
          {!isMobile ?
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={activeWidgets} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-4">
                  {activeWidgets.filter(id => WIDGETS[id]).map((id, i) => {
                  const widget = WIDGETS[id];
                  const Preview = widget.preview;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 + i * 0.04 }}
                      style={pixelSizes[id] ? { width: pixelSizes[id].width } : { width: "calc(33.333% - 11px)" }}>

                        <WidgetCard
                        id={id}
                        title={widget.title}
                        icon={widget.icon}
                        accentColor={widget.accentColor}
                        size={widgetSizes[id] || "small"}
                        tintIndex={i}
                        onExpand={() => handleExpand(id)}
                        pixelSize={pixelSizes[id]}
                        onPixelResize={(size) => setPixelSizes((prev) => ({ ...prev, [id]: size }))}
                        onResetSize={() => setPixelSizes((prev) => {const next = { ...prev };delete next[id];return next;})}>

                          <Preview pixelSize={pixelSizes[id]} />
                        </WidgetCard>
                      </motion.div>);

                })}
                </div>
              </SortableContext>
            </DndContext> : (

          /* Mobile: Minimal stacked cards */
          <div className="space-y-3 pb-24">
              {activeWidgets.filter(id => WIDGETS[id]).map((id, i) => {
              const widget = WIDGETS[id];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => handleExpand(id)}
                  className="glass-strong rounded-2xl px-5 py-4 active:scale-[0.98] transition-transform cursor-pointer">

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
                          <span className="text-muted-foreground">{widget.icon}</span>
                        </div>
                        <h3 className="text-sm font-medium text-foreground">{widget.title}</h3>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </motion.div>);

            })}
            </div>)
          }


          <WidgetCustomizer
            open={customizerOpen}
            onOpenChange={setCustomizerOpen}
            widgets={WIDGETS}
            activeWidgets={activeWidgets}
            onToggle={toggleWidget} />

    </div>);

};

export default Index;