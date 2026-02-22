import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WidgetCard from "@/components/dashboard/WidgetCard";
import ProjectsWidget from "@/components/dashboard/ProjectsWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import ClientPortalWidget from "@/components/dashboard/ClientPortalWidget";
import FinancesWidget from "@/components/dashboard/FinancesWidget";
import FileStorageWidget from "@/components/dashboard/FileStorageWidget";
import WidgetCustomizer from "@/components/dashboard/WidgetCustomizer";

type WidgetId = "projects" | "calendar" | "finances" | "clients" | "files";

const WIDGETS: Record<WidgetId, { title: string; component: React.ComponentType; cols: number }> = {
  projects: { title: "Projects", component: ProjectsWidget, cols: 2 },
  calendar: { title: "Calendar", component: CalendarWidget, cols: 2 },
  finances: { title: "Finances", component: FinancesWidget, cols: 2 },
  clients: { title: "Client Portal", component: ClientPortalWidget, cols: 1 },
  files: { title: "File Storage", component: FileStorageWidget, cols: 1 },
};

const DEFAULT_WIDGETS: WidgetId[] = ["projects", "calendar", "finances", "clients", "files"];

const Index = () => {
  const [activeWidgets, setActiveWidgets] = useState<WidgetId[]>(DEFAULT_WIDGETS);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const toggleWidget = (id: string) => {
    setActiveWidgets((prev) =>
      prev.includes(id as WidgetId)
        ? prev.filter((w) => w !== id)
        : [...prev, id as WidgetId]
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-[1400px] mx-auto">
      <DashboardHeader onCustomize={() => setCustomizerOpen(true)} />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        layout
      >
        <AnimatePresence mode="popLayout">
          {activeWidgets.map((id) => {
            const widget = WIDGETS[id];
            const Component = widget.component;
            return (
              <WidgetCard
                key={id}
                title={widget.title}
                cols={widget.cols}
                onRemove={() => toggleWidget(id)}
              >
                <Component />
              </WidgetCard>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <WidgetCustomizer
        open={customizerOpen}
        onOpenChange={setCustomizerOpen}
        widgets={WIDGETS}
        activeWidgets={activeWidgets}
        onToggle={toggleWidget}
      />
    </div>
  );
};

export default Index;
